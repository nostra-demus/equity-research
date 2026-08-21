// RSS layer (Layer 2 of the news ingestion): format parsing (RSS 2.0 / Atom / CDATA), per-feed
// failure isolation, conditional-GET (304) skipping, lookback filtering, and URL dedupe — all with
// mocked fetch, no network. Run: npx tsx test/rss.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { acknowledgeRssDeliveries, fetchRss, parseFeed, RSS_DOCUMENT_ENTRY_CEILING } from '../src/news/sources/rss'
import { REPO_ROOT } from '../src/config'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'rss-'))
const noSleep = async () => {}

const RSS2 = `<?xml version="1.0"?><rss version="2.0"><channel><title>Wire</title>
<item><title><![CDATA[RBI cuts repo rate 50 bps &amp; markets cheer]]></title><link>https://reuters.com/a</link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>
<item><title>Second story with plain title</title><link>https://reuters.com/b</link><pubDate>Fri, 12 Jun 2026 09:05:00 GMT</pubDate></item>
<item><title>No link so this one is skipped</title></item>
</channel></rss>`

const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>EDGAR</title>
<entry><title>8-K - Example Corp (0001) (Filer)</title><link rel="alternate" href="https://sec.gov/x"/><updated>2026-06-12T09:10:00Z</updated></entry>
<entry><title>8-K - Other Co</title><link href="https://sec.gov/y"/><updated>2026-06-12T09:11:00Z</updated></entry>
</feed>`

// Real-world link shapes that the naive <link>([^<]+)</link> extractor missed — a CDATA-wrapped link
// (Federal Reserve), an empty <link> with the URL only in <guid isPermaLink="true"> (LiveMint,
// CNBC-TV18, The Hindu BusinessLine), and a non-permalink guid that must NOT be used as a link.
const GUID_CDATA = `<?xml version="1.0"?><rss version="2.0"><channel><title>Mixed wire</title>
<item><title>CDATA-wrapped link item</title><link><![CDATA[https://federalreserve.gov/cdata]]></link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>
<item><title>Empty link, URL in guid permalink</title><link></link><guid isPermaLink="true">https://livemint.com/guid-a</guid><pubDate>Fri, 12 Jun 2026 09:01:00 GMT</pubDate></item>
<item><title>No link, guid permalink (default true)</title><guid>https://cnbctv18.com/guid-b</guid><pubDate>Fri, 12 Jun 2026 09:02:00 GMT</pubDate></item>
<item><title>Non-permalink guid is not a link, so this item is skipped</title><guid isPermaLink="false">tag:abc-123</guid><pubDate>Fri, 12 Jun 2026 09:03:00 GMT</pubDate></item>
</channel></rss>`

await check('parseFeed: RSS 2.0 with CDATA + entities; itemless entries skipped', () => {
  const items = parseFeed(RSS2)
  assert.equal(items.length, 2)
  assert.equal(items[0].title, 'RBI cuts repo rate 50 bps & markets cheer') // CDATA stripped, &amp; decoded
  assert.equal(items[0].link, 'https://reuters.com/a')
  assert.ok(items[0].date)
})

await check('parseFeed: Atom entries with rel=alternate and bare href links', () => {
  const items = parseFeed(ATOM)
  assert.equal(items.length, 2)
  assert.equal(items[0].link, 'https://sec.gov/x')
  assert.equal(items[1].link, 'https://sec.gov/y')
})

await check('parseFeed: CDATA-wrapped <link> + <guid> permalink fallback; non-permalink guid skipped', () => {
  const items = parseFeed(GUID_CDATA)
  assert.equal(items.length, 3) // the isPermaLink="false" item has no usable link and is dropped
  assert.equal(items[0].link, 'https://federalreserve.gov/cdata') // CDATA link unwrapped
  assert.equal(items[1].link, 'https://livemint.com/guid-a') // empty <link>, guid permalink used
  assert.equal(items[2].link, 'https://cnbctv18.com/guid-b') // guid with default isPermaLink=true
})

// EIA-style: item links are root-relative ("/pressroom/…"). Without a baseUrl they were silently
// dropped (not absolute); with the feed URL they resolve. Anchors / non-http schemes stay dropped.
const RELATIVE = `<?xml version="1.0"?><rss version="2.0"><channel><title>EIA</title>
<item><title>EIA expects an oil-demand drop</title><link>/pressroom/releases/press589.php</link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>
<item><title>Anchor-only link is not a story</title><link>#top</link><pubDate>Fri, 12 Jun 2026 09:01:00 GMT</pubDate></item>
</channel></rss>`
await check('parseFeed: relative item links resolve against the feed URL (EIA class); anchors dropped', () => {
  assert.equal(parseFeed(RELATIVE).length, 0) // no baseUrl → relative link unusable (unchanged old behavior)
  const items = parseFeed(RELATIVE, 60, 'https://www.eia.gov/rss/press_rss.xml')
  assert.equal(items.length, 1) // the anchor-only item is still dropped
  assert.equal(items[0].link, 'https://www.eia.gov/pressroom/releases/press589.php')
})

// Atlanta-Fed-GDPNow class: a valid link but an EMPTY <title>, with the headline in the body. Synthesize
// a title from the lede rather than dropping the item.
const EMPTY_TITLE = `<?xml version="1.0"?><rss version="2.0"><channel><title>GDPNow</title>
<item><title></title><link>https://atlantafed.org/gdpnow</link><description>The GDPNow model estimate for real GDP growth is 2.4 percent.</description><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>
<item><title></title><link>https://atlantafed.org/empty</link><pubDate>Fri, 12 Jun 2026 09:01:00 GMT</pubDate></item>
</channel></rss>`
// FERC class: every item's <link> is the site root (https://ferc.gov/) and the real per-item URL is an
// href in the (entity-encoded) <description>. Without recovering it, all items dedup-collapse to one.
const ROOT_LINK = `<?xml version="1.0"?><rss version="2.0"><channel><title>FERC</title>
<item><title>Tri-States NGL Pipeline</title><link>https://ferc.gov/</link><guid>uuid-1</guid><description>Form 6&lt;br/&gt;&lt;a href='https://ecollection.ferc.gov/api/DownloadDocument/430346/1?f=a'&gt;doc&lt;/a&gt;</description></item>
<item><title>Chugach Electric</title><link>https://ferc.gov/</link><guid>uuid-2</guid><description>Form 3Q&lt;br/&gt;&lt;a href='https://ecollection.ferc.gov/api/DownloadDocument/430333/1?f=b'&gt;doc&lt;/a&gt;</description></item>
</channel></rss>`
await check('parseFeed: bare site-root <link> → recover the per-item href from the body (FERC class)', () => {
  const items = parseFeed(ROOT_LINK, 60, 'https://ecollection.ferc.gov/api/rssfeed')
  assert.equal(items.length, 2)
  assert.equal(new Set(items.map((i) => i.link)).size, 2, 'two distinct per-item links (no homepage collapse)')
  assert.equal(items[0].link, 'https://ecollection.ferc.gov/api/DownloadDocument/430346/1?f=a')
})

await check('parseFeed: empty <title> with a body lede → synthesize a title (GDPNow class)', () => {
  const items = parseFeed(EMPTY_TITLE)
  assert.equal(items.length, 1) // the second item has no title AND no body → still dropped
  assert.match(items[0].title, /^The GDPNow model estimate for real GDP growth/)
  assert.equal(items[0].link, 'https://atlantafed.org/gdpnow')
})

await check('fetchRss: per-feed isolation (a 500 feed never hurts the others) + URL dedupe across feeds', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://good.test/rss' }, { url: 'https://bad.test/rss' }, { url: 'https://dup.test/rss' }] }))
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('bad.test')) return { ok: false, status: 500, text: async () => 'boom', headers: { get: () => null } }
    // good + dup both carry reuters.com/a — the duplicate must be dropped
    return { ok: true, status: 200, text: async () => RSS2, headers: { get: () => null } }
  }) as unknown as typeof fetch
  const now = () => new Date('2026-06-12T09:30:00Z')
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 2) // a + b once each, despite two feeds carrying them and one feed failing
  assert.ok(arts.every((a) => a.via === 'rss'))
  assert.equal(arts[0].domain, 'reuters.com')
})

await check('fetchRss: WAF-cloak self-heal — a 403 on the browser UA auto-retries with the contact UA', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://bls.test/cpi.rss' }] })) // no per-feed override
  const now = () => new Date('2026-06-12T09:30:00Z')
  const seenUas: string[] = []
  const fetchFn = (async (_url: string, init: any) => {
    const ua = init?.headers?.['user-agent'] || ''
    seenUas.push(ua)
    // Akamai cloak: 403 to the spoofed browser UA, 200 to the honest contact UA
    if (/Mozilla|Chrome/.test(ua)) return { ok: false, status: 403, text: async () => 'Access Denied', headers: { get: () => null } }
    return { ok: true, status: 200, text: async () => RSS2, headers: { get: () => null } }
  }) as unknown as typeof fetch
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 2) // recovered via the fallback — items flow
  assert.ok(/Mozilla|Chrome/.test(seenUas[0]), 'first tried the browser UA')
  assert.ok(seenUas.some((u) => u.includes('nostra-demus-screener')), 'fell back to the contact UA')
})

await check('fetchRss: configured fallback endpoint repairs a dead primary and records the active connection', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://primary.test/rss', fallback_urls: ['https://mirror.test/rss'], source_name: 'Test Wire' }] }))
  const calls: string[] = []
  const fetchFn = (async (url: string) => {
    calls.push(String(url))
    if (String(url).includes('primary.test')) return { ok: false, status: 503, text: async () => 'down', headers: { get: () => null } }
    return { ok: true, status: 200, text: async () => RSS2, headers: { get: () => null } }
  }) as unknown as typeof fetch
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') })
  assert.equal(arts.length, 2)
  assert.equal(calls.filter((u) => u.includes('primary.test')).length, 3, 'primary gets the normal retry budget')
  assert.equal(calls.filter((u) => u.includes('mirror.test')).length, 1, 'fallback is used only after primary fails')
  const health = JSON.parse(fs.readFileSync(path.join(state, 'news-source-health.json'), 'utf8'))
  assert.equal(health['https://primary.test/rss'].status, 'ok')
  assert.equal(health['https://primary.test/rss'].fallbackActive, true)
  assert.equal(health['https://primary.test/rss'].activeUrl, 'https://mirror.test/rss')
})

await check('fetchRss: conditional GET — a 304 feed contributes nothing and costs nothing', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://etag.test/rss' }] }))
  const now = () => new Date('2026-06-12T09:30:00Z')
  let sawConditional = false
  const first = (async () => ({ ok: true, status: 200, text: async () => RSS2, headers: { get: (h: string) => (h === 'etag' ? 'W/"abc"' : null) } })) as unknown as typeof fetch
  await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: first, sleep: noSleep, now })
  assert.equal(fs.existsSync(path.join(state, 'rss-cache.json')), false, 'fetch alone cannot advance the rollback-visible cache')
  const pending = JSON.parse(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'))
  assert.equal(pending.version, 2)
  assert.equal(pending.candidateCache['https://etag.test/rss'].etag, 'W/"abc"')
  assert.equal(acknowledgeRssDeliveries(state), true, 'the caller durably accepted the raw handoff')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'))['https://etag.test/rss'].etag, 'W/"abc"')
  const second = (async (_url: string, init: any) => {
    sawConditional = init?.headers?.['if-none-match'] === 'W/"abc"'
    return { ok: false, status: 304, text: async () => '', headers: { get: () => null } }
  }) as unknown as typeof fetch
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: second, sleep: noSleep, now })
  assert.equal(sawConditional, true) // the cached ETag was sent
  assert.equal(arts.length, 0) // 304 → unchanged → nothing re-parsed
})

await check('fetchRss: 200 WAF, empty, and truncated bodies cannot advance validators or erase the pending journal', async () => {
  const rejected = [
    ['WAF HTML', '<!doctype html><html><title>Access denied</title><body>Enable cookies</body></html>'],
    ['empty body', ''],
    ['whitespace body', '  \n\t'],
    ['truncated RSS-looking body', '<?xml version="1.0"?><rss version="2.0"><channel>'],
    ['extra root after an empty feed', '<?xml version="1.0"?><rss/><html>challenge</html>'],
  ] as const
  for (const [label, body] of rejected) {
    const state = tmp()
    const feedsPath = path.join(tmp(), 'feeds.json')
    const feedUrl = `https://rejected-200.test/${encodeURIComponent(label)}`
    fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
    const oldCache = `${JSON.stringify({ [feedUrl]: { etag: 'W/"old"' } }, null, 1)}\n`
    const oldJournal = `${JSON.stringify({
      version: 2,
      rows: [],
      candidateCache: { [feedUrl]: { etag: 'W/"old"' } },
    })}\n`
    fs.writeFileSync(path.join(state, 'rss-cache.json'), oldCache)
    fs.writeFileSync(path.join(state, 'rss-delivery-pending.json'), oldJournal)
    const conditionals: string[] = []
    const fetchFn = (async (_url: string, init: any) => {
      const conditional = init?.headers?.['if-none-match'] || ''
      conditionals.push(conditional)
      // This is the destructive sequence the old code triggered: it installed "challenge", then its own
      // retry sent that ETag and got 304. The fixed path must keep sending the last proven feed validator.
      if (conditional === 'W/"challenge"') {
        return { ok: false, status: 304, text: async () => '', headers: { get: () => null } }
      }
      return {
        ok: true,
        status: 200,
        text: async () => body,
        headers: { get: (h: string) => h === 'etag' ? 'W/"challenge"' : null },
      }
    }) as unknown as typeof fetch
    const rows = await fetchRss(
      { feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state },
      { fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') },
    )
    assert.deepEqual(rows, [], label)
    assert.deepEqual(conditionals, ['W/"old"', 'W/"old"', 'W/"old"'], `${label}: retries use the last proven validator`)
    assert.equal(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'), oldCache, label)
    assert.equal(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'), oldJournal,
      `${label}: rejected body leaves the rollback-safe handoff byte-identical`)
  }
})

await check('fetchRss: valid empty RSS, Atom, RDF, and news-sitemap documents may advance validators after ack', async () => {
  const supported = [
    ['rss', '<?xml version="1.0"?><rss version="2.0"><channel><title>Quiet wire</title></channel></rss>'],
    ['atom', '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Quiet wire</title></feed>'],
    ['atom-self-closing', '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"/><!-- quiet -->'],
    ['rdf', '<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"></rdf:RDF>'],
    ['news-sitemap', '<?xml version="1.0"?><urlset xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"></urlset>'],
  ] as const
  for (const [kind, body] of supported) {
    const state = tmp()
    const feedsPath = path.join(tmp(), 'feeds.json')
    const feedUrl = `https://valid-empty.test/${kind}`
    fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
    const rows = await fetchRss(
      { feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state },
      {
        fetchFn: (async () => ({
          ok: true,
          status: 200,
          text: async () => body,
          headers: { get: (h: string) => h === 'etag' ? `W/"empty-${kind}"` : null },
        })) as unknown as typeof fetch,
        sleep: noSleep,
        now: () => new Date('2026-06-12T09:30:00Z'),
      },
    )
    assert.deepEqual(rows, [], kind)
    const pending = JSON.parse(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'))
    assert.equal(pending.candidateCache[feedUrl].etag, `W/"empty-${kind}"`)
    assert.equal(acknowledgeRssDeliveries(state), true)
    assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'))[feedUrl].etag, `W/"empty-${kind}"`)
  }
})

await check('fetchRss: pending validators stay out of the legacy cache and replay rows across a 304', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  const feedUrl = 'https://etag-recovery.test/rss'
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
  const oldCache = `${JSON.stringify({ [feedUrl]: { etag: 'W/"old"' } }, null, 1)}\n`
  fs.writeFileSync(path.join(state, 'rss-cache.json'), oldCache)
  const now = () => new Date('2026-06-12T09:30:00Z')
  let firstConditional = ''
  const first = (async (_url: string, init: any) => {
    firstConditional = init?.headers?.['if-none-match'] || ''
    return { ok: true, status: 200, text: async () => RSS2, headers: { get: (h: string) => (h === 'etag' ? 'W/"recovery"' : null) } }
  }) as unknown as typeof fetch
  const delivered = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: first, sleep: noSleep, now })
  assert.equal(firstConditional, 'W/"old"')
  assert.equal(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'), oldCache, 'rollback-visible cache remains byte-identical before ack')
  const journal = JSON.parse(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'))
  assert.equal(journal.candidateCache[feedUrl].etag, 'W/"recovery"')
  let recoveryConditional = ''
  const unchanged = (async (_url: string, init: any) => {
    recoveryConditional = init?.headers?.['if-none-match'] || ''
    return { ok: false, status: 304, text: async () => '', headers: { get: () => null } }
  }) as unknown as typeof fetch
  const replay = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: unchanged, sleep: noSleep, now })
  assert.equal(recoveryConditional, 'W/"recovery"', 'recovery uses the journaled candidate without committing it')
  assert.deepEqual(replay.map((row) => row.url), delivered.map((row) => row.url), '304 cannot erase an unacknowledged delivery')
  assert.equal(acknowledgeRssDeliveries(state), true)
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'))[feedUrl].etag, 'W/"recovery"')
  assert.deepEqual(await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: unchanged, sleep: noSleep, now }), [])
})

await check('fetchRss: a corrected headline at the same URL remains a distinct pending revision', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  const feedUrl = 'https://revision.test/rss'
  const articleUrl = 'https://reuters.com/corrected-story'
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
  const body = (title: string) => `<?xml version="1.0"?><rss version="2.0"><channel><item><title>${title}</title><link>${articleUrl}</link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item></channel></rss>`
  const now = () => new Date('2026-06-12T09:30:00Z')
  await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, {
    fetchFn: (async () => ({ ok: true, status: 200, text: async () => body('Initial headline'), headers: { get: (h: string) => h === 'etag' ? 'W/"v1"' : null } })) as unknown as typeof fetch,
    sleep: noSleep,
    now,
  })
  let conditional = ''
  const revisions = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, {
    fetchFn: (async (_url: string, init: any) => {
      conditional = init?.headers?.['if-none-match'] || ''
      return { ok: true, status: 200, text: async () => body('Corrected headline'), headers: { get: (h: string) => h === 'etag' ? 'W/"v2"' : null } }
    }) as unknown as typeof fetch,
    sleep: noSleep,
    now,
  })
  assert.equal(conditional, 'W/"v1"')
  assert.deepEqual(revisions.map((row) => [row.title, row.url]), [
    ['Initial headline', articleUrl],
    ['Corrected headline', articleUrl],
  ])
  assert.equal(acknowledgeRssDeliveries(state), true)
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'))[feedUrl].etag, 'W/"v2"')
})

await check('fetchRss: same-response corrections survive URL dedupe while normalized exact repeats collapse', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  const feedUrl = 'https://same-response-revision.test/rss'
  const articleUrl = 'https://reuters.com/same-response-correction'
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
  const body = `<?xml version="1.0"?><rss version="2.0"><channel>
    <item><title>Initial headline for this event</title><link>${articleUrl}</link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>
    <item><title> initial   HEADLINE for this event </title><link>${articleUrl}</link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>
    <item><title>Corrected headline reverses this event</title><link>${articleUrl}</link><pubDate>Fri, 12 Jun 2026 09:05:00 GMT</pubDate></item>
  </channel></rss>`
  const rows = await fetchRss(
    { feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state },
    {
      fetchFn: (async () => ({
        ok: true,
        status: 200,
        text: async () => body,
        headers: { get: (h: string) => h === 'etag' ? 'W/"same-response"' : null },
      })) as unknown as typeof fetch,
      sleep: noSleep,
      now: () => new Date('2026-06-12T09:30:00Z'),
    },
  )
  assert.deepEqual(rows.map((row) => [row.title, row.url]), [
    ['Initial headline for this event', articleUrl],
    ['Corrected headline reverses this event', articleUrl],
  ])
  const pending = JSON.parse(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'))
  assert.equal(pending.rows.length, 2, 'the durable handoff uses the same revision identity')
})

await check('fetchRss: every fresh entry after the former 60-row prefix reaches the durable handoff', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  const feedUrl = 'https://more-than-sixty.test/rss'
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
  const entries = Array.from({ length: 75 }, (_, i) =>
    `<item><title>Fresh policy decision entry number ${i}</title><link>https://reuters.com/more-than-sixty-${i}</link><pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate></item>`).join('')
  const rows = await fetchRss(
    { feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state },
    {
      fetchFn: (async () => ({
        ok: true, status: 200,
        text: async () => `<?xml version="1.0"?><rss version="2.0"><channel>${entries}</channel></rss>`,
        headers: { get: (h: string) => h === 'etag' ? 'W/"all-75"' : null },
      })) as unknown as typeof fetch,
      sleep: noSleep,
      now: () => new Date('2026-06-12T09:30:00Z'),
    },
  )
  assert.equal(rows.length, 75)
  assert.equal(rows.at(-1)?.url, 'https://reuters.com/more-than-sixty-74')
  const pending = JSON.parse(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'))
  assert.equal(pending.rows.length, 75)
  assert.equal(pending.candidateCache[feedUrl].etag, 'W/"all-75"')
})

await check('fetchRss: a document beyond the parser ceiling keeps proven validators and journal bytes unchanged', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  const feedUrl = 'https://entry-ceiling.test/rss'
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
  const oldCache = `${JSON.stringify({ [feedUrl]: { etag: 'W/"old"' } }, null, 1)}\n`
  const oldJournal = `${JSON.stringify({
    version: 2,
    rows: [],
    candidateCache: { [feedUrl]: { etag: 'W/"old"' } },
  })}\n`
  fs.writeFileSync(path.join(state, 'rss-cache.json'), oldCache)
  fs.writeFileSync(path.join(state, 'rss-delivery-pending.json'), oldJournal)
  const body = `<rss version="2.0"><channel>${'<item/>'.repeat(RSS_DOCUMENT_ENTRY_CEILING + 1)}</channel></rss>`
  const conditionals: string[] = []
  const rows = await fetchRss(
    { feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state },
    {
      fetchFn: (async (_url: string, init: any) => {
        conditionals.push(init?.headers?.['if-none-match'] || '')
        return {
          ok: true, status: 200, text: async () => body,
          headers: { get: (h: string) => h === 'etag' ? 'W/"truncated-prefix"' : null },
        }
      }) as unknown as typeof fetch,
      sleep: noSleep,
      now: () => new Date('2026-06-12T09:30:00Z'),
    },
  )
  assert.deepEqual(rows, [])
  assert.deepEqual(conditionals, ['W/"old"', 'W/"old"', 'W/"old"'])
  assert.equal(fs.readFileSync(path.join(state, 'rss-cache.json'), 'utf8'), oldCache)
  assert.equal(fs.readFileSync(path.join(state, 'rss-delivery-pending.json'), 'utf8'), oldJournal)
})

await check('fetchRss: corrupt pending bytes pause fetching and acknowledgement without mutation', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://corrupt.test/rss' }] }))
  const pendingPath = path.join(state, 'rss-delivery-pending.json')
  const corrupt = '{ definitely not valid JSON\n'
  fs.writeFileSync(pendingPath, corrupt)
  let calls = 0
  const rows = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, {
    fetchFn: (async () => { calls++; throw new Error('must not fetch') }) as unknown as typeof fetch,
    sleep: noSleep,
  })
  assert.deepEqual(rows, [])
  assert.equal(calls, 0)
  assert.equal(fs.readFileSync(pendingPath, 'utf8'), corrupt)
  assert.equal(acknowledgeRssDeliveries(state), false)
  assert.equal(fs.readFileSync(pendingPath, 'utf8'), corrupt, 'refused ack preserves evidence byte-for-byte')
})

await check('acknowledgeRssDeliveries: cache write failure leaves pending rows and old validators intact', () => {
  const state = tmp()
  const feedUrl = 'https://ack-failure.test/rss'
  const pendingPath = path.join(state, 'rss-delivery-pending.json')
  const cachePath = path.join(state, 'rss-cache.json')
  const rows = [{ title: 'Still pending', url: 'https://reuters.com/still-pending', domain: 'reuters.com', seendate: '2026-06-12T09:00:00Z', via: 'rss' }]
  const pending = `${JSON.stringify({ version: 2, rows, candidateCache: { [feedUrl]: { etag: 'W/"new"' } } })}\n`
  const oldCache = `${JSON.stringify({ [feedUrl]: { etag: 'W/"old"' } })}\n`
  fs.writeFileSync(pendingPath, pending)
  fs.writeFileSync(cachePath, oldCache)
  fs.mkdirSync(`${cachePath}.tmp`) // force the atomic cache writer to fail before rename
  assert.equal(acknowledgeRssDeliveries(state), false)
  assert.equal(fs.readFileSync(pendingPath, 'utf8'), pending)
  assert.equal(fs.readFileSync(cachePath, 'utf8'), oldCache)
})

await check('fetchRss: an array-only handoff from the first journal format remains recoverable', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  const feedUrl = 'https://legacy-journal.test/rss'
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: feedUrl }] }))
  const legacy = [{ title: 'Legacy pending story', url: 'https://reuters.com/legacy-pending', domain: 'reuters.com', seendate: '2026-06-12T09:00:00Z', via: 'rss' }]
  fs.writeFileSync(path.join(state, 'rss-delivery-pending.json'), `${JSON.stringify(legacy)}\n`)
  fs.writeFileSync(path.join(state, 'rss-cache.json'), `${JSON.stringify({ [feedUrl]: { etag: 'W/"legacy"' } })}\n`)
  let conditional = ''
  const rows = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, {
    fetchFn: (async (_url: string, init: any) => {
      conditional = init?.headers?.['if-none-match'] || ''
      return { ok: false, status: 304, text: async () => '', headers: { get: () => null } }
    }) as unknown as typeof fetch,
    sleep: noSleep,
  })
  assert.equal(conditional, 'W/"legacy"')
  assert.deepEqual(rows, legacy)
  assert.equal(acknowledgeRssDeliveries(state), true)
})

await check('fetchRss: items older than 3× the lookback are skipped; missing feed list degrades to []', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://old.test/rss' }] }))
  const STALE = `<?xml version="1.0"?><rss version="2.0"><channel>
<item><title>An old story from last week somewhere</title><link>https://reuters.com/old</link><pubDate>Fri, 05 Jun 2026 09:00:00 GMT</pubDate></item>
</channel></rss>`
  const fetchFn = (async () => ({ ok: true, status: 200, text: async () => STALE, headers: { get: () => null } })) as unknown as typeof fetch
  const now = () => new Date('2026-06-12T09:30:00Z')
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 0) // a week old ≫ 120 min window
  const none = await fetchRss({ feedsPath: path.join(tmp(), 'missing.json'), lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep: noSleep, now })
  assert.deepEqual(none, [])
})

await check('rss_feeds.json: valid, every feed has an http url + source_name, no duplicate urls', () => {
  // the versioned feed list the production ingester reads each cycle (repo-root, not engine code)
  const feedsPath = path.join(REPO_ROOT, 'frameworks/screener/rss_feeds.json')
  const doc = JSON.parse(fs.readFileSync(feedsPath, 'utf8'))
  assert.ok(Array.isArray(doc.feeds) && doc.feeds.length > 0, 'feeds array present and non-empty')
  const urls = new Set<string>()
  for (const f of doc.feeds) {
    assert.ok(typeof f.url === 'string' && /^https?:\/\//i.test(f.url), `feed url is http(s): ${f.source_name}`)
    assert.ok(typeof f.source_name === 'string' && f.source_name.length > 0, `feed has a source_name: ${f.url}`)
    assert.ok(!urls.has(f.url), `no duplicate feed url: ${f.url}`)
    urls.add(f.url)
    if ('user_agent' in f) assert.ok(typeof f.user_agent === 'string' && f.user_agent.length > 0, 'user_agent override is a non-empty string')
    if ('fallback_urls' in f) assert.ok(Array.isArray(f.fallback_urls) && f.fallback_urls.every((u: unknown) => typeof u === 'string' && /^https?:\/\//i.test(u)), 'fallback_urls contains only http(s) endpoints')
  }
})

await check('fetchRss: a TIMEOUT (AbortError) is NOT retried — gives up on the first attempt (no wasted timeouts)', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://slow.test/rss' }] }))
  let fetchCalls = 0
  let sleeps = 0
  const fetchFn = (async () => { fetchCalls++; const e: any = new Error('aborted'); e.name = 'AbortError'; throw e }) as unknown as typeof fetch
  const sleep = async () => { sleeps++ }
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep, now: () => new Date('2026-06-12T09:30:00Z') })
  assert.equal(arts.length, 0)
  assert.equal(fetchCalls, 1, 'timeout gives up immediately — exactly one attempt, not three')
  assert.equal(sleeps, 0, 'no backoff sleep on a timeout')
})

await check('fetchRss: a transient connection error (fetch failed) STILL gets the full 3-attempt backoff', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://flaky.test/rss' }] }))
  let fetchCalls = 0
  let sleeps = 0
  const fetchFn = (async () => { fetchCalls++; throw new TypeError('fetch failed') }) as unknown as typeof fetch
  const sleep = async () => { sleeps++ }
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn, sleep, now: () => new Date('2026-06-12T09:30:00Z') })
  assert.equal(arts.length, 0)
  assert.equal(fetchCalls, 3, 'a transient error retries up to 3 times')
  assert.equal(sleeps, 2, 'backoff sleeps between the 3 attempts')
})

// Google-News sitemap: the ONLY machine-readable route to Reuters (no public RSS since 2020). Shape is
// copied from the live Reuters Arc feed: <urlset xmlns:news>, CDATA titles, ISO publication_date.
const NEWS_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
<url><loc>https://www.reuters.com/world/middle-east/booms-heard-uaes-downtown-dubai-2026-07-16/</loc>
<lastmod>2026-07-16T17:16:07.377Z</lastmod>
<news:news><news:publication><news:name>Reuters</news:name><news:language>en</news:language></news:publication>
<news:publication_date>2026-07-16T17:16:07.377Z</news:publication_date>
<news:title><![CDATA[Booms heard in UAE's Downtown Dubai, witnesses say]]></news:title></news:news></url>
<url><loc>https://www.reuters.com/business/gold-falls-mideast-escalation-2026-07-16/</loc>
<news:news><news:publication_date>2026-07-16T16:00:00.000Z</news:publication_date>
<news:title>Gold falls as Mideast escalation dims hopes</news:title></news:news></url>
<url><loc>/relative-not-absolute/</loc><news:news><news:title>dropped: not an absolute URL</news:title></news:news></url>
<url><loc>https://www.reuters.com/no-title/</loc><news:news><news:publication_date>2026-07-16T15:00:00.000Z</news:publication_date></news:news></url>
</urlset>`

await check('parseFeed reads a Google-News sitemap (Reuters route): loc + news:title + publication_date', () => {
  const items = parseFeed(NEWS_SITEMAP)
  // 4 <url> blocks in, 2 valid out: the relative <loc> and the title-less entry are dropped, not thrown on
  assert.equal(items.length, 2)
  assert.equal(items[0].title, "Booms heard in UAE's Downtown Dubai, witnesses say") // CDATA unwrapped
  assert.equal(items[0].link, 'https://www.reuters.com/world/middle-east/booms-heard-uaes-downtown-dubai-2026-07-16/')
  assert.equal(items[0].date, '2026-07-16T17:16:07.377Z') // news:publication_date → lookback filter works
  assert.equal(items[1].title, 'Gold falls as Mideast escalation dims hopes')
  assert.ok(items.every((i) => /^https?:\/\//.test(i.link)))
})
await check('parseFeed: the <urlset> wrapper is never mistaken for a <url> entry; maxItems caps sitemaps', () => {
  assert.equal(parseFeed(NEWS_SITEMAP, 1).length, 1)
  // a plain sitemap with no news namespace stays unsupported (no headlines to read) rather than
  // emitting title-less junk — it must not be detected as a feed at all
  assert.equal(parseFeed('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://x.com/a</loc></url></urlset>').length, 0)
})
await check('parseFeed still reads ordinary RSS after the sitemap branch (no regression)', () => {
  assert.ok(parseFeed(RSS2).length >= 1)
  assert.ok(parseFeed(ATOM).length >= 1)
})

console.log(`\n${passed} checks passed`)
