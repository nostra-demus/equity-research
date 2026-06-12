// RSS layer (Layer 2 of the news ingestion): format parsing (RSS 2.0 / Atom / CDATA), per-feed
// failure isolation, conditional-GET (304) skipping, lookback filtering, and URL dedupe — all with
// mocked fetch, no network. Run: npx tsx test/rss.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fetchRss, parseFeed } from '../src/news/sources/rss'

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

await check('fetchRss: conditional GET — a 304 feed contributes nothing and costs nothing', async () => {
  const state = tmp()
  const feedsPath = path.join(tmp(), 'feeds.json')
  fs.writeFileSync(feedsPath, JSON.stringify({ feeds: [{ url: 'https://etag.test/rss' }] }))
  const now = () => new Date('2026-06-12T09:30:00Z')
  let sawConditional = false
  const first = (async () => ({ ok: true, status: 200, text: async () => RSS2, headers: { get: (h: string) => (h === 'etag' ? 'W/"abc"' : null) } })) as unknown as typeof fetch
  await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: first, sleep: noSleep, now })
  const second = (async (_url: string, init: any) => {
    sawConditional = init?.headers?.['if-none-match'] === 'W/"abc"'
    return { ok: false, status: 304, text: async () => '', headers: { get: () => null } }
  }) as unknown as typeof fetch
  const arts = await fetchRss({ feedsPath, lookbackMin: 40, timeoutMs: 2000, stateDir: state }, { fetchFn: second, sleep: noSleep, now })
  assert.equal(sawConditional, true) // the cached ETag was sent
  assert.equal(arts.length, 0) // 304 → unchanged → nothing re-parsed
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

console.log(`\n${passed} checks passed`)
