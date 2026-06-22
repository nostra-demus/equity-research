// Reddit DISCOVERY/SENTIMENT adapter (sources/reddit.ts). Tests: Atom parse via the reused parseFeed →
// RawArticle (via:'reddit', domain forced to reddit.com, per-sub source_name), the www→old.reddit→mirror
// fallback chain, the cross-cycle 403/429 penalty-box (reddit.com hosts skipped, mirror still tried), the
// within-cycle "stop poking a blocked IP" guard, URL canonicalization, the lookback freshness filter, the
// caution_only snippet tag, the social source tier, and the hard `social` → never-`pick` band cap. All
// with mocked fetch, no network. Run: npx tsx test/reddit.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fetchReddit, canonicalRedditUrl, resetRedditBackoff } from '../src/news/sources/reddit'
import { deriveSourceTier } from '../src/news/scope'
import { capSocialBand, capSocialScore } from '../src/news/rank'
import { normalizeAndFilter } from '../src/news/normalize'

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

const noSleep = async () => {}
const now = () => new Date('2026-06-14T12:00:00Z')

function res(status: number, body: string) {
  return { ok: status >= 200 && status < 300, status, text: async () => body } as unknown as Response
}

// URL checks via the PARSED host — `u.includes('reddit.com')` on the whole URL is the "incomplete URL
// substring sanitization" anti-pattern (CodeQL js/incomplete-url-substring-sanitization), so the routers
// and assertions below compare the exact host (and path) instead.
const hostOf = (u: string) => { try { return new URL(u).hostname } catch { return '' } }
const isReddit = (u: string) => { const h = hostOf(u); return h === 'reddit.com' || h.endsWith('.reddit.com') }
const isWww = (u: string) => hostOf(u) === 'www.reddit.com'
const isOld = (u: string) => hostOf(u) === 'old.reddit.com'
const isMirror = (u: string) => hostOf(u) === 'mirror.example'
const hitMirrorSub = (u: string, sub: string) => isMirror(u) && new URL(u).pathname === `/${sub}/new`
const pathHas = (u: string, s: string) => { try { return new URL(u).pathname.includes(s) } catch { return false } }

// A minimal Reddit-style Atom feed. `host` controls the permalink host (www/old.reddit, or a mirror that
// preserves the reddit permalink path), so we can prove the URL canonicalizes back to www.reddit.com.
function atom(sub: string, entries: { title: string; id: string; published: string; host?: string; content?: string }[]) {
  const e = entries
    .map((x) => {
      const host = x.host || 'www.reddit.com'
      const link = `https://${host}/r/${sub}/comments/${x.id}/${x.id}_slug/`
      return `<entry><title>${x.title}</title><link href="${link}" /><published>${x.published}</published><updated>${x.published}</updated><content type="html">${x.content || 'body text'}</content><id>t3_${x.id}</id></entry>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${sub}</title>\n${e}\n</feed>`
}

let tmpSeq = 0
function writeFeeds(subs: { subreddit: string; source_name?: string; caution_only?: boolean; region?: string }[]): string {
  const p = path.join(os.tmpdir(), `reddit_feeds_test_${process.pid}_${tmpSeq++}.json`)
  fs.writeFileSync(p, JSON.stringify({ subreddits: subs }))
  return p
}

// A fetch mock that records every URL and routes by a caller-supplied function.
function mkFetch(route: (url: string) => { status: number; body: string }) {
  const calls: string[] = []
  const fn = (async (url: string) => {
    calls.push(String(url))
    const r = route(String(url))
    return res(r.status, r.body)
  }) as unknown as typeof fetch
  return { fn, calls }
}

const FRESH = '2026-06-14T11:00:00+00:00'
const STALE = '2026-06-10T09:00:00+00:00'

await check('canonicalRedditUrl: old.reddit / mirror permalink → www.reddit.com; non-reddit link unchanged', () => {
  assert.equal(
    canonicalRedditUrl('https://old.reddit.com/r/Layoffs/comments/abc/acme/'),
    'https://www.reddit.com/r/Layoffs/comments/abc/acme',
  )
  assert.equal(
    canonicalRedditUrl('https://rsshub.app/r/Layoffs/comments/xyz/foo/'),
    'https://www.reddit.com/r/Layoffs/comments/xyz/foo',
  )
  assert.equal(canonicalRedditUrl('https://example.com/some/article'), 'https://example.com/some/article')
})

await check('fetchReddit: www Atom → RawArticle (via:reddit, domain reddit.com, per-sub source_name, canonical url)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'Layoffs', source_name: 'Reddit r/Layoffs' }])
  const { fn } = mkFetch((url) => (isWww(url) ? { status: 200, body: atom('Layoffs', [{ title: 'Acme cuts 500', id: 'a1', published: FRESH }]) } : { status: 404, body: '' }))
  const out = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now })
  assert.equal(out.length, 1)
  assert.equal(out[0].via, 'reddit')
  assert.equal(out[0].domain, 'reddit.com')
  assert.equal(out[0].source_name, 'Reddit r/Layoffs')
  assert.match(out[0].title, /Acme cuts 500/)
  assert.equal(new URL(out[0].url).hostname, 'www.reddit.com')
  assert.match(out[0].url, /\/r\/Layoffs\/comments\/a1/)
})

await check('fetchReddit: www 429 → falls back to old.reddit (url still canonical www.reddit.com)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'Frugal' }])
  const { fn, calls } = mkFetch((url) => {
    if (isWww(url)) return { status: 429, body: '' }
    if (isOld(url)) return { status: 200, body: atom('Frugal', [{ title: 'Trading down', id: 'f1', published: FRESH, host: 'old.reddit.com' }]) }
    return { status: 404, body: '' }
  })
  const out = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now }) // no backoff cfg → 429 just falls through
  assert.equal(out.length, 1, 'old.reddit served the item after www 429')
  assert.equal(out[0].source_name, 'Reddit r/Frugal', 'falls back to default per-sub name')
  assert.equal(new URL(out[0].url).hostname, 'www.reddit.com', 'old.reddit link canonicalized')
  assert.ok(calls.some(isWww) && calls.some(isOld))
})

await check('fetchReddit: www 403 block page + old 429 → public mirror serves it (current sub runs full chain)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'sysadmin' }])
  const { fn, calls } = mkFetch((url) => {
    if (isWww(url)) return { status: 403, body: '<html>blocked network security</html>' } // the real block shape
    if (isOld(url)) return { status: 429, body: '' } // still tried for THIS sub, then falls through
    if (isMirror(url)) return { status: 200, body: atom('sysadmin', [{ title: 'Cisco license revolt', id: 's1', published: FRESH }]) }
    return { status: 404, body: '' }
  })
  const out = await fetchReddit(
    { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, mirrorTemplate: 'https://mirror.example/{sub}/new' },
    { fetchFn: fn, sleep: noSleep, now },
  )
  assert.equal(out.length, 1)
  assert.equal(out[0].domain, 'reddit.com', 'domain forced to reddit.com even from the mirror')
  assert.ok(calls.some((u) => hitMirrorSub(u, 'sysadmin')), 'mirror template {sub} filled')
  assert.ok(calls.some(isOld), 'the current sub still tried old.reddit before the mirror')
})

await check('fetchReddit: within a cycle, after one sub is blocked the rest skip reddit hosts (mirror only)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'Layoffs' }, { subreddit: 'Frugal' }])
  const { fn, calls } = mkFetch((url) => {
    if (isReddit(url)) return { status: 403, body: '<html>blocked</html>' }
    if (isMirror(url)) return { status: 200, body: atom('x', [{ title: 'mirror item', id: 'q1', published: FRESH }]) }
    return { status: 404, body: '' }
  })
  await fetchReddit(
    { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, perHostGapMs: 0, mirrorTemplate: 'https://mirror.example/{sub}/new' },
    { fetchFn: fn, sleep: noSleep, now },
  ) // no backoff cfg → this is the WITHIN-cycle guard, not the cross-cycle box
  // The second subreddit (Frugal) must never touch reddit.com once the first (Layoffs) was blocked.
  assert.ok(!calls.some((u) => isReddit(u) && pathHas(u, 'Frugal')), 'second sub skipped reddit hosts')
  assert.ok(calls.some((u) => hitMirrorSub(u, 'Frugal')), 'second sub went straight to the mirror')
})

await check('fetchReddit: lookback drops stale posts', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'pharmacy' }])
  const { fn } = mkFetch((url) => (isWww(url) ? { status: 200, body: atom('pharmacy', [
    { title: 'Fresh shortage', id: 'p1', published: FRESH },
    { title: 'Old news', id: 'p2', published: STALE },
  ]) } : { status: 404, body: '' }))
  const out = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now })
  assert.equal(out.length, 1, 'only the fresh post survives the 24h window')
  assert.match(out[0].title, /Fresh shortage/)
})

await check('fetchReddit: caution_only sub tags the snippet (crowding/euphoria caution)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'wallstreetbets', source_name: 'Reddit r/wallstreetbets', caution_only: true }])
  const { fn } = mkFetch((url) => (isWww(url) ? { status: 200, body: atom('wallstreetbets', [{ title: 'YOLO calls', id: 'w1', published: FRESH }]) } : { status: 404, body: '' }))
  const out = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now })
  assert.equal(out.length, 1)
  assert.match(String(out[0].snippet), /caution input, not a source/)
})

await check('fetchReddit: 429 penalty-box — next cycle skips reddit.com hosts, mirror only', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'msp' }])
  const opts = { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, mirrorTemplate: 'https://mirror.example/{sub}/new', cycleMs: 900_000, backoffCyclesOn429: 4 }
  // cycle 1: www 403 block page → sets the cross-cycle box; mirror serves.
  const c1 = mkFetch((url) => {
    if (isReddit(url)) return { status: 403, body: '<html>blocked</html>' }
    return { status: 200, body: atom('msp', [{ title: 'Pax8 pricing', id: 'm1', published: FRESH }]) }
  })
  await fetchReddit(opts, { fetchFn: c1.fn, sleep: noSleep, now })
  assert.ok(c1.calls.some(isReddit), 'cycle 1 did poke reddit.com')
  // cycle 2 (same clock, inside the backoff window): reddit.com hosts must be skipped entirely.
  const c2 = mkFetch(() => ({ status: 200, body: atom('msp', [{ title: 'Pax8 pricing 2', id: 'm2', published: FRESH }]) }))
  const out2 = await fetchReddit(opts, { fetchFn: c2.fn, sleep: noSleep, now })
  assert.ok(!c2.calls.some(isReddit), 'cycle 2 skipped reddit.com hosts')
  assert.ok(c2.calls.every(isMirror), 'cycle 2 used the mirror only')
  assert.equal(out2.length, 1, 'mirror still delivered an item under the penalty box')
  resetRedditBackoff()
})

await check('fetchReddit: missing feed list degrades to empty, never throws', async () => {
  const { fn } = mkFetch(() => ({ status: 200, body: '' }))
  const out = await fetchReddit({ feedsPath: '/no/such/reddit_feeds.json', lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now })
  assert.deepEqual(out, [])
})

await check('deriveSourceTier: social_discussion → social tier', () => {
  assert.equal(deriveSourceTier({ input_nature: 'social_discussion' }), 'social')
  assert.equal(deriveSourceTier({ input_nature: 'regulatory_filing' }), 'primary_filing') // unchanged
})

await check('capSocialBand: a social pick is clamped to watch; other tiers pass through', () => {
  assert.equal(capSocialBand('pick', 'social'), 'watch', 'social can never be a pick')
  assert.equal(capSocialBand('watch', 'social'), 'watch')
  assert.equal(capSocialBand('drop', 'social'), 'drop')
  assert.equal(capSocialBand('pick', 'news'), 'pick', 'non-social tiers untouched')
  assert.equal(capSocialBand('pick', 'primary_filing'), 'pick')
})

// Regression (PR #71 Codex finding): the inbox + wire ORDER by triage_score (write-inbox mergeInbox /
// the ranked wire), so the band cap alone lets a high-scoring social item float above filings into a
// scarce slot. capSocialScore is the score twin — clamp a `social` item below the pick threshold so its
// ORDER honors the cap. Expected values pinned to CLAUDE.md §4/§24 + parity with capSocialBand (a social
// item can never sit in the pick band: pick = score ≥ pickThreshold, so the cap is pickThreshold-1).
await check('capSocialScore: a social item is clamped below the pick threshold; other tiers pass through', () => {
  assert.equal(capSocialScore(92, 'social', 70), 69, 'social clamped to pickThreshold-1')
  assert.equal(capSocialScore(70, 'social', 70), 69, 'exactly at the threshold is still pushed below')
  assert.equal(capSocialScore(40, 'social', 70), 40, 'already below → untouched')
  assert.equal(capSocialScore(92, 'news', 70), 92, 'non-social tiers untouched')
  assert.equal(capSocialScore(92, 'primary_filing', 70), 92)
})

// Regression (PR #71 Codex finding): a caution_only feed (r/wallstreetbets) is "caution input only, never
// a source, weighted lowest" (reddit_feeds.json role + _doc; SWARM.md social-tier note). Before the fix it
// got the SAME social tier, the SAME pickThreshold-1 score cap, and the SAME watch band as every other
// subreddit — only a snippet prefix differed — so it could occupy a `watch` inbox slot like an ordinary
// Reddit lead. Expected values pinned to that manifest contract: a caution item is capped BELOW the watch
// line (→ drop band, never inbox-eligible since inboxed = band !== 'drop'), strictly lower than a regular
// social item. The 2-/3-arg call shapes still behave exactly as before (caution defaults false).
await check('capSocialBand: a caution_only social item is weighted lowest — capped to drop, below regular social', () => {
  assert.equal(capSocialBand('pick', 'social', true), 'drop', 'caution social can never even be a watch lead')
  assert.equal(capSocialBand('watch', 'social', true), 'drop', 'a watch-band caution item is pushed to drop')
  assert.equal(capSocialBand('pick', 'social', false), 'watch', 'control: regular social still caps to watch')
  assert.equal(capSocialBand('pick', 'social'), 'watch', 'back-compat: 2-arg call unchanged (caution defaults false)')
  assert.equal(capSocialBand('pick', 'news', true), 'pick', 'caution flag never touches a non-social tier')
})

await check('capSocialScore: a caution_only social item is clamped below the WATCH line, lower than regular social', () => {
  assert.equal(capSocialScore(92, 'social', 70, 40, true), 39, 'caution clamped to watchThreshold-1 (→ drop band)')
  assert.equal(capSocialScore(92, 'social', 70, 40, false), 69, 'control: regular social still clamped to pickThreshold-1')
  assert.equal(capSocialScore(92, 'social', 70), 69, 'back-compat: 3-arg call unchanged')
  assert.equal(capSocialScore(30, 'social', 70, 40, true), 30, 'a caution item already below the watch line is untouched')
  assert.equal(capSocialScore(92, 'news', 70, 40, true), 92, 'caution flag never touches a non-social tier')
})

// Regression (PR #71 Codex finding): the caution_only flag must be carried STRUCTURALLY (not just in the
// snippet text) so rank/cap can act on it. Expected: a caution_only feed stamps RawArticle.caution=true;
// an ordinary feed leaves it unset.
await check('fetchReddit: a caution_only feed stamps RawArticle.caution=true; an ordinary feed does not', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([
    { subreddit: 'wallstreetbets', source_name: 'Reddit r/wallstreetbets', caution_only: true },
    { subreddit: 'Layoffs', source_name: 'Reddit r/Layoffs' },
  ])
  const { fn } = mkFetch((url) =>
    isWww(url)
      ? { status: 200, body: atom(url.includes('wallstreetbets') ? 'wallstreetbets' : 'Layoffs', [{ title: url.includes('wallstreetbets') ? 'YOLO calls' : 'Acme cuts 500', id: url.includes('wallstreetbets') ? 'w1' : 'a1', published: FRESH }]) }
      : { status: 404, body: '' },
  )
  const out = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now })
  const wsb = out.find((o) => o.source_name === 'Reddit r/wallstreetbets')
  const lay = out.find((o) => o.source_name === 'Reddit r/Layoffs')
  assert.ok(wsb && lay, 'both subreddits produced an item')
  assert.equal(wsb!.caution, true, 'caution_only feed → RawArticle.caution=true')
  assert.equal(lay!.caution, undefined, 'ordinary feed leaves caution unset')
})

// Regression (PR #71 Codex finding): the firewall (normalizeAndFilter) gates on RawArticle.domain, which
// the adapter forces to reddit.com — so a mirror entry whose link is NOT a recoverable reddit permalink
// would be smuggled onto the wire under an off-site URL. Expected behaviour pinned to CLAUDE.md §4 (the
// source firewall): an item is accepted only when its canonical URL is genuinely a reddit.com host.
await check('fetchReddit: a mirror entry with an off-site (non-reddit) link is DROPPED, not stamped reddit.com', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'sysadmin' }])
  // a mirror feed with TWO entries: one a real reddit permalink (kept), one an arbitrary off-site link
  // that canonicalRedditUrl can't recover (must be dropped, NOT carried as domain reddit.com).
  const mirrorBody =
    `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>sysadmin</title>` +
    `<entry><title>Real reddit post</title><link href="https://old.reddit.com/r/sysadmin/comments/ok1/x/" /><published>${FRESH}</published><id>t3_ok1</id></entry>` +
    `<entry><title>Smuggled off-site item</title><link href="https://evil.test/phishing/article" /><published>${FRESH}</published><id>t3_bad1</id></entry>` +
    `</feed>`
  const { fn } = mkFetch((url) => {
    if (isReddit(url)) return { status: 403, body: '<html>blocked</html>' } // force the mirror
    if (isMirror(url)) return { status: 200, body: mirrorBody }
    return { status: 404, body: '' }
  })
  const out = await fetchReddit(
    { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, mirrorTemplate: 'https://mirror.example/{sub}/new' },
    { fetchFn: fn, sleep: noSleep, now },
  )
  assert.equal(out.length, 1, 'only the genuine reddit-permalink item survives; the off-site link is dropped')
  assert.equal(new URL(out[0].url).hostname, 'www.reddit.com')
  assert.ok(!out.some((a) => a.url.includes('evil.test')), 'no off-site URL is stamped reddit.com')
})

// Regression (PR #71 Codex finding): runIngestCycle awaits fetchReddit in Promise.allSettled BEFORE it
// can normalize ANY source, and skipRedditHosts only trips on a block STATUS — a silent network timeout
// makes every endpoint burn ~timeoutMs, so the whole social layer can hold the cycle for minutes. The
// overall wall-clock budget stops starting new subreddits once spent. Driven with a logical clock that
// advances per fetch; expected: with a budget < (all subs × endpoints × step), the tail of subs is skipped.
await check('fetchReddit: overall budget stops starting new subreddits once the wall-clock cap is spent', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'aaa' }, { subreddit: 'bbb' }, { subreddit: 'ccc' }, { subreddit: 'ddd' }, { subreddit: 'eee' }])
  let clk = Date.parse('2026-06-14T12:00:00Z')
  const clock = () => new Date(clk)
  // every fetch advances the logical clock by 5s (a stand-in for a per-endpoint timeout); 404 forces the
  // full per-sub endpoint walk (no mirror configured → 2 reddit endpoints per sub = 10s of "time" per sub).
  const calls: string[] = []
  const fn = (async (url: string) => { calls.push(String(url)); clk += 5000; return res(404, '') }) as unknown as typeof fetch
  await fetchReddit(
    { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, perHostGapMs: 0, overallBudgetMs: 12_000 },
    { fetchFn: fn, sleep: noSleep, now: clock },
  )
  const touched = (sub: string) => calls.some((u) => pathHas(u, `/r/${sub}/`))
  assert.ok(touched('aaa') && touched('bbb'), 'the first subs within budget were fetched')
  assert.ok(!touched('ccc') && !touched('ddd') && !touched('eee'), 'subs past the spent budget were skipped (cycle not stalled)')
})

// Regression (PR #71 Codex finding): reddit_feeds.json sets a per-subreddit `region` (r/Layoffs = 'US'),
// but the adapter dropped it and normalizeAndFilter assigned reddit.com's DOMAIN region (always GLOBAL),
// so US-only social leads were mislabelled GLOBAL — missed by the geography filter/counts and shown to
// the triage prompt (groq.ts builds `[source_name · region]`) with the wrong market context. Expected
// value pinned to reddit_feeds.json's declared region + CLAUDE.md §27 (region/market context travels with
// the data), NOT to current code behaviour.
await check('fetchReddit + normalize: per-subreddit region is preserved (US), not flattened to reddit.com GLOBAL', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([
    { subreddit: 'Layoffs', region: 'US' },
    { subreddit: 'cybersecurity', region: 'GLOBAL' },
    { subreddit: 'bogusregion', region: 'Atlantis' }, // invalid enum value → dropped → GLOBAL fallback (validation control)
  ])
  const { fn } = mkFetch((url) => {
    if (isWww(url) && pathHas(url, '/r/Layoffs/')) return { status: 200, body: atom('Layoffs', [{ title: 'Acme cuts 500 US jobs', id: 'l1', published: FRESH }]) }
    if (isWww(url) && pathHas(url, '/r/cybersecurity/')) return { status: 200, body: atom('cybersecurity', [{ title: 'Globex breach disclosed today', id: 'c1', published: FRESH }]) }
    if (isWww(url) && pathHas(url, '/r/bogusregion/')) return { status: 200, body: atom('bogusregion', [{ title: 'A post mentioning some company', id: 'b1', published: FRESH }]) }
    return { status: 404, body: '' }
  })
  const raws = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, perHostGapMs: 0 }, { fetchFn: fn, sleep: noSleep, now })
  const rLay = raws.find((a) => a.source_name === 'Reddit r/Layoffs')
  const rCyber = raws.find((a) => a.source_name === 'Reddit r/cybersecurity')
  const rBogus = raws.find((a) => a.source_name === 'Reddit r/bogusregion')
  assert.ok(rLay && rCyber && rBogus, 'all three subreddits produced an item')
  assert.equal(rLay!.region, 'US', 'adapter stamps the configured US region onto the RawArticle')           // RED on pre-fix: region was undefined
  assert.equal(rCyber!.region, 'GLOBAL', 'adapter stamps the configured GLOBAL region')
  assert.equal(rBogus!.region, undefined, 'an invalid config region is dropped, not stamped')               // validation control
  // end-to-end: normalize must prefer the adapter region over reddit.com's domain region (GLOBAL)
  const items = normalizeAndFilter(raws, { ledgerEventIds: new Set<string>(), seen: new Set<string>() })
  const nLay = items.find((i) => i.source_name === 'Reddit r/Layoffs')
  const nBogus = items.find((i) => i.source_name === 'Reddit r/bogusregion')
  assert.ok(nLay && nBogus, 'both items survived normalization')
  assert.equal(nLay!.region, 'US', 'normalize prefers the per-subreddit US region over reddit.com GLOBAL')   // RED on pre-fix: was GLOBAL
  assert.equal(nBogus!.region, 'GLOBAL', 'an unset adapter region falls back to the domain registry (GLOBAL)')
})

console.log(`\n${passed} checks passed`)
