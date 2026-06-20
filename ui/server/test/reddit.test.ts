// Reddit DISCOVERY/SENTIMENT adapter (sources/reddit.ts). Tests: Atom parse via the reused parseFeed →
// RawArticle (via:'reddit', domain forced to reddit.com, per-sub source_name), the www→old.reddit→mirror
// fallback chain, the cross-cycle 429 penalty-box (reddit.com hosts skipped, mirror still tried), URL
// canonicalization, the lookback freshness filter, the caution_only snippet tag, the social source tier,
// and the hard `social` → never-`pick` band cap. All with mocked fetch, no network.
// Run: npx tsx test/reddit.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fetchReddit, canonicalRedditUrl, resetRedditBackoff } from '../src/news/sources/reddit'
import { deriveSourceTier } from '../src/news/scope'
import { capSocialBand } from '../src/news/rank'

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
function writeFeeds(subs: { subreddit: string; source_name?: string; caution_only?: boolean }[]): string {
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
  const { fn } = mkFetch((url) => (url.includes('www.reddit.com') ? { status: 200, body: atom('Layoffs', [{ title: 'Acme cuts 500', id: 'a1', published: FRESH }]) } : { status: 404, body: '' }))
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
    if (url.includes('www.reddit.com')) return { status: 429, body: '' }
    if (url.includes('old.reddit.com')) return { status: 200, body: atom('Frugal', [{ title: 'Trading down', id: 'f1', published: FRESH, host: 'old.reddit.com' }]) }
    return { status: 404, body: '' }
  })
  const out = await fetchReddit({ feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: fn, sleep: noSleep, now }) // no backoff cfg → 429 just falls through
  assert.equal(out.length, 1, 'old.reddit served the item after www 429')
  assert.equal(out[0].source_name, 'Reddit r/Frugal', 'falls back to default per-sub name')
  assert.equal(new URL(out[0].url).hostname, 'www.reddit.com', 'old.reddit link canonicalized')
  assert.ok(calls.some((u) => u.includes('www.reddit.com')) && calls.some((u) => u.includes('old.reddit.com')))
})

await check('fetchReddit: www 403 block page + old 429 → public mirror serves it (current sub runs full chain)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'sysadmin' }])
  const { fn, calls } = mkFetch((url) => {
    if (url.includes('www.reddit.com')) return { status: 403, body: '<html>blocked network security</html>' } // the real block shape
    if (url.includes('old.reddit.com')) return { status: 429, body: '' } // still tried for THIS sub, then falls through
    if (url.includes('mirror.example')) return { status: 200, body: atom('sysadmin', [{ title: 'Cisco license revolt', id: 's1', published: FRESH }]) }
    return { status: 404, body: '' }
  })
  const out = await fetchReddit(
    { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, mirrorTemplate: 'https://mirror.example/{sub}/new' },
    { fetchFn: fn, sleep: noSleep, now },
  )
  assert.equal(out.length, 1)
  assert.equal(out[0].domain, 'reddit.com', 'domain forced to reddit.com even from the mirror')
  assert.ok(calls.some((u) => u.includes('mirror.example/sysadmin/new')), 'mirror template {sub} filled')
  assert.ok(calls.some((u) => u.includes('old.reddit.com')), 'the current sub still tried old.reddit before the mirror')
})

await check('fetchReddit: within a cycle, after one sub is blocked the rest skip reddit hosts (mirror only)', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'Layoffs' }, { subreddit: 'Frugal' }])
  const { fn, calls } = mkFetch((url) => {
    if (url.includes('reddit.com')) return { status: 403, body: '<html>blocked</html>' }
    if (url.includes('mirror.example')) return { status: 200, body: atom('x', [{ title: 'mirror item', id: 'q1', published: FRESH }]) }
    return { status: 404, body: '' }
  })
  await fetchReddit(
    { feedsPath: feeds, lookbackHours: 24, timeoutMs: 5000, perHostGapMs: 0, mirrorTemplate: 'https://mirror.example/{sub}/new' },
    { fetchFn: fn, sleep: noSleep, now },
  ) // no backoff cfg → this is the WITHIN-cycle guard, not the cross-cycle box
  // The second subreddit (Frugal) must never touch reddit.com once the first (Layoffs) was blocked.
  assert.ok(!calls.some((u) => u.includes('reddit.com') && u.includes('Frugal')), 'second sub skipped reddit hosts')
  assert.ok(calls.some((u) => u.includes('mirror.example/Frugal/new')), 'second sub went straight to the mirror')
})

await check('fetchReddit: lookback drops stale posts', async () => {
  resetRedditBackoff()
  const feeds = writeFeeds([{ subreddit: 'pharmacy' }])
  const { fn } = mkFetch((url) => (url.includes('www.reddit.com') ? { status: 200, body: atom('pharmacy', [
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
  const { fn } = mkFetch((url) => (url.includes('www.reddit.com') ? { status: 200, body: atom('wallstreetbets', [{ title: 'YOLO calls', id: 'w1', published: FRESH }]) } : { status: 404, body: '' }))
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
    if (url.includes('reddit.com')) return { status: 403, body: '<html>blocked</html>' }
    return { status: 200, body: atom('msp', [{ title: 'Pax8 pricing', id: 'm1', published: FRESH }]) }
  })
  await fetchReddit(opts, { fetchFn: c1.fn, sleep: noSleep, now })
  assert.ok(c1.calls.some((u) => u.includes('reddit.com')), 'cycle 1 did poke reddit.com')
  // cycle 2 (same clock, inside the backoff window): reddit.com hosts must be skipped entirely.
  const c2 = mkFetch(() => ({ status: 200, body: atom('msp', [{ title: 'Pax8 pricing 2', id: 'm2', published: FRESH }]) }))
  const out2 = await fetchReddit(opts, { fetchFn: c2.fn, sleep: noSleep, now })
  assert.ok(!c2.calls.some((u) => u.includes('reddit.com')), 'cycle 2 skipped reddit.com hosts')
  assert.ok(c2.calls.every((u) => u.includes('mirror.example')), 'cycle 2 used the mirror only')
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

console.log(`\n${passed} checks passed`)
