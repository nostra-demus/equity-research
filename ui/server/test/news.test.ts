// Autonomous news ingester — unit + integration over the pure pipeline with MOCKED fetch + clock,
// so no key, network, or install is needed. Run: npx tsx test/news.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { approvedDomains, lookupSource, normalizeDomain } from '../src/news/sources/approved-domains'
import { buildQueries, fetchGdelt, resetGdeltBackoff } from '../src/news/sources/gdelt'
import { eventIdFor, loadLedgerEventIds, normalizeAndFilter, parseSeendate } from '../src/news/normalize'
import { SeenCache } from '../src/news/seen-cache'
import { Budget, RateLimiter } from '../src/news/triage/budget'
import { coerceTriage, estimateTokens, scoreToBand, triageBatch } from '../src/news/triage/groq'
import { appendFeedItems, readFeed } from '../src/news/feed'
import { mergeInbox } from '../src/news/write-inbox'
import { runIngestCycle } from '../src/news/runCycle'
import { buildOverflowProviders } from '../src/config'
import type { FeedItem, RawArticle, TriagedItem } from '../src/news/types'

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

// a Response-shaped stub; cast the function to typeof fetch at the call boundary
function res(body: any, status = 200): any {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return { ok: status >= 200 && status < 300, status, text: async () => text, json: async () => JSON.parse(text) }
}
const noSleep = async () => {}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'news-'))

// ---- approved-domains firewall ----
await check('lookupSource: exact + subdomain match, look-alike rejected, off-list null', () => {
  assert.equal(lookupSource('reuters.com')?.source_name, 'Reuters')
  assert.equal(lookupSource('markets.ft.com')?.source_name, 'Financial Times') // subdomain on a dot boundary
  assert.equal(lookupSource('economictimes.indiatimes.com')?.region, 'IN')
  assert.equal(lookupSource('notactuallyreuters.com'), null) // look-alike must NOT match reuters.com
  assert.equal(lookupSource('nytimes.com'), null) // off-list
  assert.equal(lookupSource('sec.gov')?.input_nature, 'regulatory_filing')
})
await check('normalizeDomain strips scheme/www/path; approvedDomains is non-empty', () => {
  assert.equal(normalizeDomain('https://www.Reuters.com/markets/x'), 'reuters.com')
  assert.ok(approvedDomains().length >= 15)
})

// ---- identity + dates ----
await check('eventIdFor matches the Gate-0 recipe (lowercased, whitespace-collapsed headline | url)', () => {
  const id = eventIdFor('  RBI  cuts   rates ', 'https://x.test/a')
  assert.match(id, /^EVT-[a-f0-9]{12}$/)
  assert.equal(id, eventIdFor('rbi cuts rates', 'https://x.test/a')) // normalization is stable
  assert.notEqual(id, eventIdFor('rbi cuts rates', 'https://x.test/b')) // url participates
})
await check('parseSeendate: GDELT compact → ISO; junk → now', () => {
  assert.equal(parseSeendate('20260612T093000Z'), '2026-06-12T09:30:00Z')
  assert.equal(parseSeendate('garbage', () => new Date('2026-06-12T00:00:00Z')), '2026-06-12T00:00:00Z')
})

// ---- normalize + filter + dedup ----
await check('normalizeAndFilter: drops off-list + short titles, marks ledger dups, skips seen-cache', () => {
  const raws: RawArticle[] = [
    { title: 'Reuters: RBI cuts repo rate 50 bps in surprise move', url: 'https://reuters.com/a', domain: 'reuters.com', seendate: '20260612T090000Z' },
    { title: 'Off-list blog rumor', url: 'https://randomblog.example/x', domain: 'randomblog.example', seendate: '20260612T090000Z' },
    { title: 'short', url: 'https://reuters.com/short', domain: 'reuters.com', seendate: '20260612T090000Z' },
    { title: 'ET: Infosys guidance cut to 3-5% for FY27', url: 'https://economictimes.indiatimes.com/b', domain: 'economictimes.indiatimes.com', seendate: '20260612T091000Z' },
  ]
  const dupId = eventIdFor(raws[0].title, raws[0].url)
  const seen = new SeenCache(path.join(tmp(), 'seen.json'))
  seen.add(eventIdFor(raws[3].title, raws[3].url), 80) // pretend the ET item was scored before
  const items = normalizeAndFilter(raws, { ledgerEventIds: new Set([dupId]), seen })
  assert.equal(items.length, 1) // off-list dropped, short dropped, ET skipped (seen) → only Reuters
  assert.equal(items[0].source_name, 'Reuters')
  assert.equal(items[0].dedup_status, 'possible_duplicate') // it was in the ledger set
  assert.equal(items[0].region, 'GLOBAL')
})
await check('loadLedgerEventIds tolerates a missing/corrupt ledger', () => {
  assert.equal(loadLedgerEventIds(path.join(tmp(), 'none.ndjson')).size, 0)
  const f = path.join(tmp(), 'e.ndjson')
  fs.writeFileSync(f, '{"event_id":"EVT-abc123abc123"}\n{corrupt\n\n{"event_id":"EVT-def456def456"}\n')
  assert.equal(loadLedgerEventIds(f).size, 2)
})

// ---- GDELT adapter ----
await check('buildQueries chunks approved domains into domain: OR groups', () => {
  const q = buildQueries(['a.com', 'b.com', 'c.com'], 2)
  assert.equal(q.length, 2)
  assert.equal(q[0], '(domain:a.com OR domain:b.com)')
  assert.equal(q[1], '(domain:c.com)')
})
await check('fetchGdelt: parses ArtList, dedups by url across chunks, skips non-JSON', async () => {
  let calls = 0
  const fetchFn = (async () => {
    calls++
    if (calls === 1) return res({ articles: [{ url: 'https://reuters.com/a', title: 'A', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    if (calls === 2) return res({ articles: [{ url: 'https://reuters.com/a', title: 'A dup', domain: 'reuters.com', seendate: '20260612T090000Z' }] }) // dup url → collapsed
    return res('<html>not json</html>') // a later chunk returns junk → skipped, not thrown
  }) as unknown as typeof fetch
  const got = await fetchGdelt({ lookbackMin: 30, baseUrl: 'https://gdelt.test', chunkSize: 11 }, { fetchFn, sleep: noSleep })
  assert.equal(got.length, 1, 'duplicate url collapsed to one article')
  assert.equal(got[0].url, 'https://reuters.com/a')
})

await check('fetchGdelt: a 429 ABORTS GDELT for the cycle (no retry storm), keeps items gathered so far', async () => {
  let calls = 0
  const fetchFn = (async () => {
    calls++
    if (calls === 1) return res({ articles: [{ url: 'https://reuters.com/a', title: 'A', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    return res('Please limit requests to one every 5 seconds', 429) // chunk 2 → penalty
  }) as unknown as typeof fetch
  const got = await fetchGdelt({ lookbackMin: 30, baseUrl: 'https://gdelt.test', chunkSize: 11 }, { fetchFn, sleep: noSleep })
  assert.equal(got.length, 1, 'returns the first chunk it already gathered')
  assert.equal(calls, 2, 'a 429 is NOT retried — exactly one call per chunk until the 429, then abort')
})

await check('fetchGdelt: a 429 with the cycle config arms a MULTI-CYCLE backoff — next cycle skips GDELT entirely', async () => {
  resetGdeltBackoff()
  let calls = 0
  const fetchFn = (async () => { calls++; return res('Please limit requests to one every 5 seconds', 429) }) as unknown as typeof fetch
  const opts = { lookbackMin: 30, baseUrl: 'https://gdelt.test', chunkSize: 11, cycleMs: 300_000, backoffCyclesOn429: 4 }
  await fetchGdelt(opts, { fetchFn, sleep: noSleep }) // cycle 1: 429 → arms the backoff
  const callsAfterFirst = calls
  const got = await fetchGdelt(opts, { fetchFn, sleep: noSleep }) // cycle 2: should SKIP without any fetch
  assert.equal(got.length, 0)
  assert.equal(calls, callsAfterFirst, 'no GDELT request made while the backoff window is open')
  resetGdeltBackoff() // don't leak into later cases
})

// ---- budget + throttle ----
await check('Budget: caps on requests AND tokens, persists, resets on a new UTC day', () => {
  const dir = tmp()
  const day1 = Date.parse('2026-06-12T02:00:00Z')
  const b1 = Budget.load(dir, 10, 1000, day1)
  assert.equal(b1.canSpend(900), true)
  b1.record(10, 900) // hit the request cap
  b1.save()
  const b2 = Budget.load(dir, 10, 1000, Date.parse('2026-06-12T06:00:00Z')) // same day → counters carry
  assert.equal(b2.requests, 10)
  assert.equal(b2.canSpend(1), false) // request cap reached
  const b3 = Budget.load(dir, 10, 1000, Date.parse('2026-06-13T00:30:00Z')) // next day → reset
  assert.equal(b3.requests, 0)
  assert.equal(b3.canSpend(900), true)
  // token cap independently
  const b4 = Budget.load(tmp(), 100, 1000, day1)
  b4.record(1, 950)
  assert.equal(b4.canSpend(100), false) // 950+100 > 1000
  assert.equal(b4.canSpend(40), true)
})
await check('RateLimiter spaces calls to ~60s/rpm', async () => {
  const lim = new RateLimiter(60) // min gap 1000ms
  let t = 1_000_000
  const now = () => t
  const slept: number[] = []
  const sleep = async (ms: number) => { slept.push(ms); t += ms }
  await lim.acquire(0, sleep, now) // first call: real-clock-far-from-zero → no wait
  await lim.acquire(0, sleep, now) // immediate second → must wait ~1000ms
  assert.deepEqual(slept, [1000])
})

// ---- groq triage ----
await check('scoreToBand respects thresholds', () => {
  assert.equal(scoreToBand(85, 70, 40), 'pick')
  assert.equal(scoreToBand(55, 70, 40), 'watch')
  assert.equal(scoreToBand(20, 70, 40), 'drop')
  assert.ok(estimateTokens(12) > estimateTokens(1))
})
await check('triageBatch parses JSON-mode output, aligns by index, coerces/clamps', async () => {
  const items = normalizeAndFilter(
    [
      { title: 'RBI cuts repo rate 50 bps in a surprise off-cycle move', url: 'https://reuters.com/a', domain: 'reuters.com', seendate: '20260612T090000Z' },
      { title: 'Celebrity buys a yacht, sources say nothing material', url: 'https://cnbc.com/b', domain: 'cnbc.com', seendate: '20260612T090000Z' },
    ],
    { ledgerEventIds: new Set(), seen: new SeenCache(path.join(tmp(), 's.json')) },
  )
  const fetchFn = (async () => res({
    usage: { total_tokens: 321 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 130, event_types: ['macro_sector', 'bogus_type'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.' },
      { i: 1, relevance: 'irrelevant', materiality_pre_score: -5, event_types: [], issuer_linkage: 'primary', why: 'Lifestyle item.' },
    ] }) } }],
  })) as unknown as typeof fetch
  const r = await triageBatch(items, { model: 'm', baseUrl: 'https://groq.test', apiKey: 'k' }, fetchFn)
  assert.equal(r.ok, true)
  assert.equal(r.requests, 1)
  assert.equal(r.tokens, 321)
  assert.equal(r.byIndex.get(0)?.materiality_pre_score, 100) // clamped from 130
  assert.equal(r.byIndex.get(1)?.materiality_pre_score, 0) // clamped from -5
  assert.deepEqual(r.byIndex.get(0)?.event_types, ['macro_sector']) // bogus type filtered out
})
await check('triageBatch: HTTP error and non-JSON content both return ok:false (never throw)', async () => {
  const items = normalizeAndFilter(
    [{ title: 'Reuters headline long enough to pass', url: 'https://reuters.com/a', domain: 'reuters.com', seendate: '20260612T090000Z' }],
    { ledgerEventIds: new Set(), seen: new SeenCache(path.join(tmp(), 's.json')) },
  )
  const err = await triageBatch(items, { model: 'm', baseUrl: 'https://g.test', apiKey: 'k' }, (async () => res('rate limited', 429)) as unknown as typeof fetch)
  assert.equal(err.ok, false)
  assert.equal(err.requests, 2) // a 429 is retried once; both attempts count against the daily request budget
  const bad = await triageBatch(items, { model: 'm', baseUrl: 'https://g.test', apiKey: 'k' }, (async () => res({ choices: [{ message: { content: 'not json' } }] })) as unknown as typeof fetch)
  assert.equal(bad.ok, false)
  assert.equal(bad.byIndex.size, 0)
  const noKey = await triageBatch(items, { model: 'm', baseUrl: 'https://g.test', apiKey: '' }, (async () => res({})) as unknown as typeof fetch)
  assert.equal(noKey.ok, false) // no key → no call
})

// ---- inbox writer ----
function triagedItem(url: string, score: number, headline: string): TriagedItem {
  return {
    event_id: eventIdFor(headline, url), headline, url, domain: 'reuters.com', source_name: 'Reuters',
    region: 'GLOBAL', input_nature: 'news_headline', found_at: '2026-06-12T09:00:00Z', dedup_status: 'new',
    triage_score: score, triage_reason: `score ${score}`, relevance: 'material', materiality_pre_score: score,
    event_types: [], issuer_linkage: 'macro', band: score >= 70 ? 'pick' : 'watch',
  }
}
await check('mergeInbox: writes ranked rows, caps unconsumed, assigns INB ids', () => {
  const root = tmp()
  const n = mergeInbox(root, '2026-06-12', [triagedItem('https://r/1', 80, 'H1'), triagedItem('https://r/2', 55, 'H2'), triagedItem('https://r/3', 72, 'H3')], { maxRows: 2 })
  assert.equal(n, 2) // capped to 2 unconsumed
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.source, 'auto_ingester')
  assert.deepEqual(doc.rows.map((r: any) => r.triage_score), [80, 72]) // ranked desc, H2(55) dropped by cap
  assert.match(doc.rows[0].inbox_id, /^INB-20260612-\d{3}$/)
  assert.equal(doc.rows[0].prelim_note, 'score 80') // legacy field kept populated for old readers
})
await check('mergeInbox is idempotent by URL and PRESERVES human consumed/launched state', () => {
  const root = tmp()
  mergeInbox(root, '2026-06-12', [triagedItem('https://r/1', 80, 'H1')], { maxRows: 10 })
  const fp = path.join(root, 'screener/inbox/2026-06-12_sweep.json')
  const doc1 = JSON.parse(fs.readFileSync(fp, 'utf8'))
  doc1.rows[0].consumed = true
  doc1.rows[0].launched_signal_id = 'SIG-20260612-deadbeef'
  fs.writeFileSync(fp, JSON.stringify(doc1))
  // re-seen with a NEW score: the row updates its score but keeps consumed + launched id, and is not duplicated
  mergeInbox(root, '2026-06-12', [triagedItem('https://r/1', 91, 'H1 updated')], { maxRows: 10 })
  const doc2 = JSON.parse(fs.readFileSync(fp, 'utf8'))
  assert.equal(doc2.rows.length, 1)
  assert.equal(doc2.rows[0].consumed, true)
  assert.equal(doc2.rows[0].launched_signal_id, 'SIG-20260612-deadbeef')
  assert.equal(doc2.rows[0].triage_score, 91) // score refreshed
})

// ---- orchestrator (end-to-end with mocked GDELT + Groq) ----
await check('runIngestCycle: fetch → triage → ranked inbox; second run skips seen items', async () => {
  const root = tmp()
  const state = tmp()
  const groqBody = {
    usage: { total_tokens: 200 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.' },
      { i: 1, relevance: 'irrelevant', materiality_pre_score: 8, event_types: [], issuer_linkage: 'sector', why: 'Weekend opinion piece.' },
    ] }) } }],
  }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    // GDELT: the chunk containing reuters.com returns our two articles (so both runs get them)
    if (u.includes('reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/x', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' },
      { url: 'https://cnbc.com/y', title: 'Columnist muses about weekend market vibes and little else', domain: 'cnbc.com', seendate: '20260612T090100Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.ok, true)
  assert.equal(s1.candidates, 2)
  assert.equal(s1.picked, 1) // only the rate-cut clears the pick threshold
  assert.equal(s1.dropped, 1) // the opinion piece is dropped (not inboxed)
  assert.equal(s1.groq_requests, 1)
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows.length, 1)
  assert.equal(doc.rows[0].source_name, 'Reuters')
  assert.equal(doc.rows[0].materiality_pre_score, 84) // raw Groq title read
  // composite priority (rank.ts): 84 + policy scope (+2) + macro_sector event (+1) + recency (+5) = 92
  assert.equal(doc.rows[0].triage_score, 92)
  assert.ok(doc.rows[0].rank_factors && doc.rows[0].rank_factors.recency === 5)
  const fh = fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'utf8').trim()
  assert.ok(fh.includes('"kind":"cycle_summary"'))

  // second run: same articles, but both are now in the seen-cache → no re-score, no Groq spend
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.candidates, 0)
  assert.equal(s2.groq_requests, 0)
})

// ---- abort: the wall-clock guard stops triage WITHOUT grinding providers or losing items ----
await check('runIngestCycle: an aborted cycle skips triage (no provider grind) and defers the whole backlog (no loss)', async () => {
  const root = tmp()
  const state = tmp()
  let groqCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) { groqCalls++; return res({ usage: { total_tokens: 1 }, choices: [{ message: { content: '{"items":[]}' } }] }) }
    if (u.includes('reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/x', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' },
      { url: 'https://cnbc.com/y', title: 'Federal Reserve holds rates steady amid inflation concerns', domain: 'cnbc.com', seendate: '20260612T090100Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  // pre-aborted signal = the wall-clock guard already fired before triage
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, signal: AbortSignal.abort() })
  assert.equal(groqCalls, 0, 'an aborted cycle makes NO triage provider calls (no grind)')
  assert.equal(s.picked, 0, 'nothing is triaged or picked under an abort')
  // every fetched candidate is requeued to the deferred backlog — the abort must lose nothing
  const deferred = JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8'))
  assert.equal(deferred.length, 2, `the untriaged candidates are deferred, not dropped, got ${deferred.length}`)
})

// ---- the company/size guess: every new field coerces to a safe default (model drift ≠ crash) ----
await check('coerceTriage: companies/size_bucket hard-coerce (bogus ticker → null, bad bucket → unknown)', () => {
  const t = coerceTriage({
    relevance: 'material', materiality_pre_score: 80, event_types: ['mna'], issuer_linkage: 'primary', why: 'x',
    companies: [
      { name: '  Infosys Ltd ', ticker: 'INFY', listing_country: 'in' },
      { name: 'Bad Ticker Co', ticker: 'not a ticker!!', listing_country: 'India' },
      { name: '', ticker: 'GONE' }, // empty name → dropped
      { name: 'Fourth Co' }, // beyond slice(0,3) only if >3 — here it fills the dropped slot
    ],
    size_bucket: 'gigantic',
  })
  assert.equal(t.companies.length, 2) // slice(0,3) happens BEFORE the empty-name drop
  assert.deepEqual(t.companies[0], { name: 'Infosys Ltd', ticker: 'INFY', listing_country: 'IN' })
  assert.equal(t.companies[1].ticker, null) // bogus ticker rejected
  assert.equal(t.companies[1].listing_country, null) // not a 2-letter code
  assert.equal(t.size_bucket, 'unknown') // bad bucket → unknown
  const empty = coerceTriage({ relevance: 'material', materiality_pre_score: 50 })
  assert.deepEqual(empty.companies, [])
  assert.equal(empty.size_bucket, 'unknown')
})

// ---- the live wire's persistence: per-item records for kept AND dropped ----
await check('runIngestCycle writes kind:"item" feed lines for kept AND dropped, with themes + company guesses', async () => {
  const root = tmp()
  const state = tmp()
  const groqBody = {
    usage: { total_tokens: 220 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [{ name: 'Can Fin Homes', ticker: 'CANFINHOME', listing_country: 'IN' }], size_bucket: 'mid' },
      { i: 1, relevance: 'irrelevant', materiality_pre_score: 8, event_types: ['rumor'], issuer_linkage: 'sector', why: 'Weekend opinion piece.', companies: [], size_bucket: 'unknown' },
    ] }) } }],
  }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    if (u.includes('reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/x', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' },
      { url: 'https://cnbc.com/y', title: 'Columnist muses about weekend market vibes and little else', domain: 'cnbc.com', seendate: '20260612T090100Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  const { items, cycles } = readFeed(root, 1, { now })
  assert.equal(items.length, 2) // kept AND dropped both recorded
  const kept = items.find((i) => i.band === 'pick')!
  const dropped = items.find((i) => i.band === 'drop')!
  assert.equal(kept.inboxed, true)
  assert.equal(kept.event_types[0], 'macro_sector')
  assert.equal(kept.companies[0].ticker, 'CANFINHOME')
  assert.equal(kept.size_bucket, 'mid')
  assert.equal(dropped.inboxed, false)
  assert.equal(dropped.triage_reason, 'Weekend opinion piece.')
  assert.equal(cycles.length, 1)
  // …and the inbox row persists the theme/company fields
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.deepEqual(doc.rows[0].event_types, ['macro_sector'])
  assert.equal(doc.rows[0].companies[0].name, 'Can Fin Homes')
  assert.equal(doc.rows[0].size_bucket, 'mid')
})

await check('appendFeedItems honors the daily cap; readFeed skips corrupt lines', () => {
  const root = tmp()
  const mk = (n: number): FeedItem => ({
    kind: 'item', ts: `2026-06-12T09:0${n}:00Z`, event_id: `EVT-${n}`, headline: `h${n}`, url: `https://reuters.com/${n}`,
    domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline',
    triage_score: 50, band: 'watch', triage_reason: '', relevance: 'relevant_non_material', event_types: [],
    issuer_linkage: 'sector', companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: true,
  })
  assert.equal(appendFeedItems(root, '2026-06-12', [mk(1), mk(2), mk(3)], 2), 2) // cap blocks the third
  assert.equal(appendFeedItems(root, '2026-06-12', [mk(4)], 2), 0) // cap already reached
  fs.appendFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'NOT JSON\n')
  const { items } = readFeed(root, 1, { now: () => new Date('2026-06-12T10:00:00Z') })
  assert.equal(items.length, 2) // corrupt line skipped, capped writes honored
})

// ---- the no-lost-news guarantee: a Groq hiccup defers a batch, it never buries it ----
await check('triage falls back to OVERFLOW when Groq fails — the batch is scored, not deferred (resilience)', async () => {
  const root = tmp()
  const state = tmp()
  const goodTriage = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  let ovHits = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq DOWN all cycle
    if (u.includes('overflow.test')) { ovHits++; return res(goodTriage) } // overflow UP
    if (u.includes('gdelt') && !gdeltServed) { gdeltServed = true; return res({ articles: [{ url: 'https://reuters.com/ov', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] }) }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false,
    overflowProviders: [{ id: 'ovf', label: 'OVF', color: '--x', kind: 'openai', apiKey: 'k', baseUrl: 'https://overflow.test/v1', model: 'm', maxTokens: 900, rpm: 6000, tpm: 0, dailyReqCap: 100, dailyTokenCap: 1e9, budgetFile: 'ovf-budget.json', limiter: 'ovf' }] } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.ok(ovHits >= 1, 'overflow provider was tried after Groq failed')
  assert.equal(s.picked, 1, 'the item was SCORED via overflow, not deferred')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0, 'nothing deferred — overflow handled it')
})

// ---- a token-gated overflow provider (Cerebras) paces on its daily TOKEN cap, not just requests ----
await check('overflow paces on the daily TOKEN cap, not just requests (token-gated free tier like Cerebras)', async () => {
  const root = tmp()
  const state = tmp()
  // each scored item is a clear 'pick'; every overflow call reports 600 tokens of usage
  const goodTriage = { usage: { total_tokens: 600 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A rate move shifts funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  let cbHits = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq DOWN all cycle → everything routes to overflow
    if (u.includes('cerebras.test')) { cbHits++; return res(goodTriage) } // token-gated overflow, 600 tok/call
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [
        { url: 'https://reuters.com/a', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' },
        { url: 'https://reuters.com/b', title: 'Fed signals one more hike as inflation proves sticky', domain: 'reuters.com', seendate: '20260612T090100Z' },
      ] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  // dailyReqCap is huge (would NOT bind), but dailyTokenCap (900) fits only ONE 600-token call: the 2nd item's
  // canSpend(est≈595) sees 600 already spent (600+595>900) and is gated BEFORE any call. A request-only cap
  // (the prior hardcoded 50M) would have scored both — so this proves runCycle honors p.dailyTokenCap.
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, triageBatch: 1,
    overflowProviders: [{ id: 'cerebras', label: 'Cerebras', color: '--provider-cb', kind: 'openai', apiKey: 'k', baseUrl: 'https://cerebras.test/v1', model: 'llama-3.3-70b', maxTokens: 2500, rpm: 6000, tpm: 55_000, dailyReqCap: 14_400, dailyTokenCap: 900, budgetFile: 'cerebras-budget.json', limiter: 'cerebras' }] } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(cbHits, 1, 'only ONE overflow call fit under the daily token cap (the 2nd was gated before any call)')
  assert.equal(s.picked, 1, 'exactly one item scored before the token cap bit')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'the 2nd item deferred on the TOKEN cap — a request-only cap would not have stopped it')
})

// ---- the overflow CHAIN: a failed/exhausted first provider falls through to the next (Cerebras → Mistral) ----
await check('the overflow chain falls through to the NEXT provider when the first is exhausted (Cerebras → Mistral)', async () => {
  const root = tmp()
  const state = tmp()
  const goodTriage = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A rate move shifts funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  let cbHits = 0
  let mlHits = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq down all cycle → route to the overflow chain
    if (u.includes('cerebras.test')) { cbHits++; return res('unauthorized', 401) } // 1st overflow: auth-fail → exhausted + skipped
    if (u.includes('mistral.test')) { mlHits++; return res(goodTriage) } // 2nd overflow: picks up the batch
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [
        { url: 'https://reuters.com/a', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' },
        { url: 'https://reuters.com/b', title: 'Fed signals one more hike as inflation proves sticky', domain: 'reuters.com', seendate: '20260612T090100Z' },
      ] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  // two overflow providers in order: a token-gated one (Cerebras) that 401s, then a request-gated one
  // (Mistral). The chain must not stall at the dead first provider — the batch flows to the next that's up.
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, triageBatch: 1,
    overflowProviders: [
      { id: 'cerebras', label: 'Cerebras', color: '--provider-cb', kind: 'openai', apiKey: 'k', baseUrl: 'https://cerebras.test/v1', model: 'm', maxTokens: 900, rpm: 6000, tpm: 55_000, dailyReqCap: 14_400, dailyTokenCap: 900_000, budgetFile: 'cerebras-budget.json', limiter: 'cerebras' },
      { id: 'mistral', label: 'Mistral', color: '--provider-ml', kind: 'openai', apiKey: 'k', baseUrl: 'https://mistral.test/v1', model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 2000, budgetFile: 'mistral-budget.json', limiter: 'mistral' },
    ] } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.ok(cbHits >= 1, 'the first overflow provider (Cerebras) was tried')
  assert.ok(mlHits >= 1, 'the chain fell through to the SECOND overflow provider (Mistral) after the first was exhausted')
  // BOTH items score: the chain advances to Mistral for the SAME batch the moment Cerebras fails, so the
  // first batch is no longer lost to defer (the old find()-only code deferred batch 0 and only scored
  // batch 1 once Cerebras was marked failed — that one-batch loss was the retry-trap codex flagged).
  assert.equal(s.picked, 2, 'every batch flowed to Mistral the same cycle — nothing lost to the dead first provider')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0, 'nothing deferred — the chain advanced past the dead first provider for every batch')
})

// ---- overflow chain advances on a NON-TERMINAL first-provider failure (503) WITHIN the same batch ----
// Guards the cross-drain retry-trap: a 503/429/network failure does NOT exhaust the provider's daily budget
// (only a 4xx does), so the next drain rebuilds the chain with it un-failed. If the chain only tried the
// first provider per batch, a one-batch backlog would re-pick the dead first provider every drain and never
// reach the second. The chain must advance to the next provider in the SAME batch on a non-terminal failure.
await check('the overflow chain advances to the next provider on a NON-terminal (503) first-provider failure', async () => {
  const root = tmp()
  const state = tmp()
  const goodTriage = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A rate move shifts funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  let cbHits = 0
  let mlHits = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq down all cycle → route to the overflow chain
    if (u.includes('cerebras.test')) { cbHits++; return res('busy', 503) } // 1st overflow: NON-terminal fail (no budget exhaust)
    if (u.includes('mistral.test')) { mlHits++; return res(goodTriage) } // 2nd overflow: picks up the batch in the SAME cycle
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/a', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, triageBatch: 1,
    overflowProviders: [
      { id: 'cerebras', label: 'Cerebras', color: '--provider-cb', kind: 'openai', apiKey: 'k', baseUrl: 'https://cerebras.test/v1', model: 'm', maxTokens: 900, rpm: 6000, tpm: 55_000, dailyReqCap: 14_400, dailyTokenCap: 900_000, budgetFile: 'cerebras-budget.json', limiter: 'cerebras' },
      { id: 'mistral', label: 'Mistral', color: '--provider-ml', kind: 'openai', apiKey: 'k', baseUrl: 'https://mistral.test/v1', model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 2000, budgetFile: 'mistral-budget.json', limiter: 'mistral' },
    ] } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.ok(cbHits >= 1, 'the first overflow provider (Cerebras) was tried')
  assert.ok(mlHits >= 1, 'the chain advanced to Mistral in the SAME batch after Cerebras 503 — not deferred to re-trap next drain')
  assert.equal(s.picked, 1, 'the item was scored via the second provider, not lost to the dead first provider')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0, 'nothing deferred — the chain advanced past the 503')
})

await check('a failed Groq batch is DEFERRED (not zero-scored-and-seen) and is scored on the next cycle from spillover', async () => {
  const root = tmp()
  const state = tmp()
  let groqUp = false
  const goodGroq = {
    usage: { total_tokens: 200 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' },
    ] }) } }],
  }
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return groqUp ? res(goodGroq) : res('upstream sad', 503)
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true // GDELT hands the article over ONCE — cycle 2 must rely on the spillover
      return res({ articles: [{ url: 'https://reuters.com/once', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  // cycle 1: Groq is down (503, retried, still down) — the item must NOT be scored-zero or marked seen
  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.ok, true)
  assert.equal(s1.picked + s1.watched + s1.dropped, 0) // nothing was actually scored
  assert.match(s1.note || '', /deferred/) // and the summary says so honestly
  assert.ok(fs.existsSync(path.join(state, 'news-deferred.json'))) // the spillover persisted

  // cycle 2: Groq is back, GDELT has nothing new — the item re-enters from the spillover and scores
  groqUp = true
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.candidates, 1) // the requeued item
  assert.equal(s2.picked, 1) // scored this time
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows[0].url, 'https://reuters.com/once')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0) // spillover drained
})

await check('mergeInbox: dismissed rows are preserved like consumed (never evicted, never resurrected)', () => {
  const root = tmp()
  const mkItem = (n: number, score: number): TriagedItem => ({
    event_id: `EVT-m${n}`, headline: `headline number ${n} long enough`, url: `https://reuters.com/m${n}`, domain: 'reuters.com',
    source_name: 'Reuters', region: 'GLOBAL', input_nature: 'news_headline', found_at: '2026-06-12T09:00:00Z', dedup_status: 'new',
    triage_score: score, triage_reason: 'r', relevance: 'material', materiality_pre_score: score,
    event_types: ['mna'], issuer_linkage: 'primary', companies: [], size_bucket: 'unknown', band: score >= 70 ? 'pick' : 'watch',
  })
  mergeInbox(root, '2026-06-12', [mkItem(1, 90), mkItem(2, 80)], { maxRows: 10 })
  const fp = path.join(root, 'screener/inbox/2026-06-12_sweep.json')
  const doc = JSON.parse(fs.readFileSync(fp, 'utf8'))
  // a human dismisses row 2
  doc.rows.find((r: any) => r.url === 'https://reuters.com/m2').dismissed = true
  fs.writeFileSync(fp, JSON.stringify(doc, null, 2))
  // next cycle re-sees the same URL + a cap of 1 — the dismissed row must survive AND stay dismissed
  mergeInbox(root, '2026-06-12', [mkItem(2, 85), mkItem(3, 70)], { maxRows: 1 })
  const after = JSON.parse(fs.readFileSync(fp, 'utf8'))
  const m2 = after.rows.find((r: any) => r.url === 'https://reuters.com/m2')
  assert.equal(m2.dismissed, true) // not resurrected by the re-seen URL
  assert.ok(after.rows.find((r: any) => r.url === 'https://reuters.com/m2')) // not evicted by the cap
  const live = after.rows.filter((r: any) => !r.dismissed && !r.consumed)
  assert.equal(live.length, 1) // the cap applies only to the live pool
  assert.deepEqual(m2.event_types, ['mna']) // theme fields persisted on rows
})

// ---- Cerebras overflow config: lock the verified-live defaults so a retired/broken model can't sneak back ----
await check('Cerebras overflow defaults are the verified-live values (model + reasoning_effort + caps under the free-tier ceilings)', () => {
  const prev = process.env.CEREBRAS_API_KEY
  process.env.CEREBRAS_API_KEY = 'k'
  try {
    const cb = buildOverflowProviders().find((p) => p.id === 'cerebras')
    assert.ok(cb, 'Cerebras provider materializes when the key is present')
    // the retired llama-3.3-70b must NEVER be the default again; gpt-oss-120b is verified-live working
    assert.equal(cb!.model, 'gpt-oss-120b', 'default model is the current working one, not the retired llama-3.3-70b')
    // gpt-oss-120b is a reasoning model — reasoning_effort:low keeps thinking from burning the output budget → truncated JSON
    assert.equal((cb!.extraBody as Record<string, unknown> | undefined)?.reasoning_effort, 'low', 'reasoning_effort=low so content stays whole JSON')
    // every cap paces UNDER the live-verified free-tier ceilings (5 rpm / 30k tpm / 1M tok-day / 2400 req-day)
    assert.ok(cb!.rpm <= 5, 'rpm under the 5 req/min ceiling')
    assert.ok((cb!.tpm ?? 0) > 0 && (cb!.tpm ?? 0) <= 30_000, 'tpm set and under the 30k tokens/min ceiling')
    assert.ok((cb!.dailyTokenCap ?? 0) > 0 && (cb!.dailyTokenCap ?? 0) <= 1_000_000, 'daily token cap set and under 1M')
    assert.ok(cb!.dailyReqCap <= 2_400, 'daily request backstop under the 2400 req/day ceiling')
  } finally {
    if (prev === undefined) delete process.env.CEREBRAS_API_KEY
    else process.env.CEREBRAS_API_KEY = prev
  }
})

console.log(`\n${passed} checks passed`)
