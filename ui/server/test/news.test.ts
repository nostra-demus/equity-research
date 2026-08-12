// Autonomous news ingester — unit + integration over the pure pipeline with MOCKED fetch + clock,
// so no key, network, or install is needed. Run: npx tsx test/news.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { allApprovedDomains, approvedDomains, lookupSource, normalizeDomain } from '../src/news/sources/approved-domains'
import { buildQueries, fetchGdelt, fetchGdeltDoc, GDELT_MAX_QUERY_CHARS, resetGdeltBackoff } from '../src/news/sources/gdelt'
import { eventIdFor, loadLedgerEventIds, normalizeAndFilter, parseSeendate } from '../src/news/normalize'
import { SeenCache } from '../src/news/seen-cache'
import { Budget, RateLimiter, armCooldown, clearCooldown, cooldownInfo, pacedHasHeadroom, readCooldownUntil, resetBudgetMemory, resetCooldownMemory, resetSharedLimiters } from '../src/news/triage/budget'
import { articleReadTokenBound, readArticleBrief } from '../src/news/triage/article-read'
import { coerceTriage, estimateTokens, scoreToBand, triageBatch } from '../src/news/triage/groq'
import { triageBatchGemini } from '../src/news/triage/gemini'
import { appendFeedItems, readFeed } from '../src/news/feed'
import { mergeInbox } from '../src/news/write-inbox'
import { runIngestCycle, triageGroqTokenBound } from '../src/news/runCycle'
import { anthropicDrainReady, backlogTrend, drainBatchEst, getNewsDiagnostics, providerDrainUsable, tierHealth } from '../src/news/scheduler'
import { buildOverflowProviders, NEWS } from '../src/config'
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
await check('lookupSource: UAE + Gulf/MENA press is on the firewall (region OTHER), no com.sa hole', () => {
  // The gap this wiring closed: Gulf publishers were dropped at Gate 0 because none were approved.
  assert.equal(lookupSource('khaleejtimes.com')?.source_name, 'Khaleej Times')
  assert.equal(lookupSource('www.gulfnews.com')?.source_name, 'Gulf News') // www + subdomain rule
  assert.equal(lookupSource('english.mubasher.info')?.source_name, 'Mubasher') // subdomain → registrable
  assert.equal(lookupSource('arnnewscentre.ae')?.region, 'OTHER')
  // saudigazette.com.sa must be its OWN entry — never collapsed to the com.sa public suffix, which
  // would approve every Saudi commercial domain (a firewall hole).
  assert.equal(lookupSource('saudigazette.com.sa')?.source_name, 'Saudi Gazette')
  assert.equal(lookupSource('evil.com.sa'), null) // com.sa is a public suffix, NOT an approved source
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
await check('buildQueries: every query for the REAL approved list stays under GDELT’s length ceiling', () => {
  // The month-long silent GDELT outage: an 11-domain chunk grew to 257 chars, GDELT rejected it with
  // HTTP *200* + "Your query was too short or too long.", so it yielded 0 articles and never tripped the
  // 429 backoff. This guard fails the build if the approved list ever drifts back over the ceiling.
  for (const q of buildQueries(allApprovedDomains(), 6)) {
    assert.ok(q.length <= GDELT_MAX_QUERY_CHARS, `query too long (${q.length} chars): ${q}`)
  }
  // length must bind before count when domains are long (six 30-char domains would be ~244 chars)
  const long = Array.from({ length: 6 }, (_, i) => `averyveryverylongdomain${i}.example.com`)
  for (const q of buildQueries(long, 6)) assert.ok(q.length <= GDELT_MAX_QUERY_CHARS, `len ${q.length}`)
  // a single domain that alone exceeds the cap is still emitted, never silently dropped
  assert.equal(buildQueries([`${'x'.repeat(250)}.com`], 6).length, 1)
})
await check('fetchGdelt: a 200-body "query too long" is reported, not swallowed as a parse error', async () => {
  resetGdeltBackoff()
  const logs: string[] = []
  const fetchFn = (async () => res('Your query was too short or too long.')) as unknown as typeof fetch
  const out = await fetchGdelt({ lookbackMin: 40, baseUrl: 'https://x/api', chunkSize: 6 }, { fetchFn, sleep: async () => {}, log: (m) => logs.push(m) })
  assert.equal(out.length, 0)
  assert.ok(logs.some((l) => /query too long/i.test(l)), `expected an explicit rejection log, got: ${logs.join(' | ')}`)
})
await check('fetchGdelt: rate-limit delivered as a 200 BODY triggers the same backoff as a 429', async () => {
  resetGdeltBackoff()
  let calls = 0
  const fetchFn = (async () => { calls++; return res('Please limit requests to one every 5 seconds or contact …') }) as unknown as typeof fetch
  const opts = { lookbackMin: 40, baseUrl: 'https://x/api', chunkSize: 6, cycleMs: 60_000, backoffCyclesOn429: 4 }
  await fetchGdelt(opts, { fetchFn, sleep: async () => {}, log: () => {} })
  assert.equal(calls, 1) // aborts the whole cycle on the first rate-limit body, doesn't keep poking
  const after = await fetchGdelt(opts, { fetchFn, sleep: async () => {}, log: () => {} })
  assert.equal(calls, 1) // still 1 → the backoff held GDELT off entirely
  assert.equal(after.length, 0)
  resetGdeltBackoff()
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

// ---- corroboration probe (fetchGdeltDoc) SHARES the firehose's penalty backoff (the core safety promise) ----

await check('fetchGdeltDoc: a 429 backs the SHARED GDELT IP off — the firehose then skips its next cycle', async () => {
  resetGdeltBackoff()
  let docCalls = 0
  const doc429 = (async () => { docCalls++; return res('Please limit requests to one every 5 seconds', 429) }) as unknown as typeof fetch
  const got = await fetchGdeltDoc('"Acme Corp" merger', { baseUrl: 'https://gdelt.test/doc' }, { fetchFn: doc429 })
  assert.deepEqual(got, [], 'a 429 yields no corroboration')
  assert.equal(docCalls, 1, 'one shot, no retry')
  // the on-demand 429 must protect the firehose: its next cycle finds the shared backoff armed and SKIPS
  let fhCalls = 0
  const fh = (async () => { fhCalls++; return res({ articles: [] }) }) as unknown as typeof fetch
  const fhGot = await fetchGdelt({ lookbackMin: 30, baseUrl: 'https://gdelt.test', chunkSize: 11, cycleMs: 300_000, backoffCyclesOn429: 4 }, { fetchFn: fh, sleep: noSleep })
  assert.equal(fhGot.length, 0, 'firehose returned nothing')
  assert.equal(fhCalls, 0, 'the on-demand 429 protected the firehose — it made NO GDELT request')
  resetGdeltBackoff()
})

await check('fetchGdeltDoc: skips entirely while a firehose backoff is live (never pokes a penalised IP)', async () => {
  resetGdeltBackoff()
  // arm the shared backoff via a FIREHOSE 429
  await fetchGdelt({ lookbackMin: 30, baseUrl: 'https://gdelt.test', chunkSize: 11, cycleMs: 300_000, backoffCyclesOn429: 4 }, { fetchFn: (async () => res('limit', 429)) as unknown as typeof fetch, sleep: noSleep })
  let docCalls = 0
  const got = await fetchGdeltDoc('"Acme Corp" merger', { baseUrl: 'https://gdelt.test/doc' }, { fetchFn: (async () => { docCalls++; return res({ articles: [] }) }) as unknown as typeof fetch })
  assert.deepEqual(got, [], 'corroboration skipped while the IP is penalised')
  assert.equal(docCalls, 0, 'fetchGdeltDoc made NO request while the firehose backoff is live')
  resetGdeltBackoff()
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
await check('Budget exhaustion is monotonic across active-reservation reconciliation until day rollover', () => {
  resetBudgetMemory()
  const dir = tmp()
  const day1 = Date.parse('2026-06-12T02:00:00Z')
  const owner = Budget.load(dir, 5, 1_000, day1)
  const reservation = owner.tryReserve(400, undefined, day1, 1)
  assert.ok(reservation)
  const terminator = Budget.load(dir, 5, 1_000, day1)
  terminator.exhaust()
  owner.reconcile(reservation!, 0, 0) // late abort/release from work admitted before the per-day 429
  assert.equal(owner.canSpend(1), false)
  assert.equal(owner.remainingRequests, 0)
  assert.equal(owner.remainingTokens, 0)
  resetBudgetMemory()
  const persisted = Budget.load(dir, 5, 1_000, day1)
  assert.equal(persisted.canSpend(1), false, 'the terminal marker survives process-memory reload')
  const nextDay = Budget.load(dir, 5, 1_000, Date.parse('2026-06-13T00:30:00Z'))
  assert.equal(nextDay.canSpend(400), true, 'only the provider-day rollover clears exhaustion')
})
await check('late prior-day reconciliation cannot overwrite persisted current-day usage', () => {
  resetBudgetMemory()
  const dir = tmp()
  const file = path.join(dir, 'groq-budget.json')
  const day1 = Date.parse('2026-06-12T23:59:59Z')
  const day2 = Date.parse('2026-06-13T00:00:01Z')
  const stale = Budget.load(dir, 10, 10_000, day1)
  const oldReservation = stale.tryReserve(700, undefined, day1)
  assert.ok(oldReservation)
  const current = Budget.load(dir, 10, 10_000, day2)
  current.record(2, 1_234)
  current.save()
  stale.reconcile(oldReservation!, 1, 600) // completion arrives after the new day has already written
  stale.record(5, 5_000)
  stale.save()
  const disk = JSON.parse(fs.readFileSync(file, 'utf8'))
  assert.equal(disk.date, '2026-06-13')
  assert.equal(disk.requests, 2)
  assert.equal(disk.tokens, 1_234)
  resetBudgetMemory() // restart: the protected day-2 file is still the source of truth
  const restarted = Budget.load(dir, 10, 10_000, day2)
  assert.equal(restarted.requests, 2)
  assert.equal(restarted.tokens, 1_234)
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

await check('Groq and Gemini adapters count malformed response reads exactly once per retry', async () => {
  const items = [{ headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any]
  const opts = { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 2 }
  for (const [name, adapter] of [['groq', triageBatch], ['gemini', triageBatchGemini]] as const) {
    let jsonFetches = 0
    const malformedJson = (async () => {
      jsonFetches++
      return { ok: true, status: 200, headers: { get: () => null }, json: async () => { throw new SyntaxError('malformed response JSON') } }
    }) as unknown as typeof fetch
    const decoded = await adapter(items, opts, malformedJson, noSleep)
    assert.equal(jsonFetches, 2, `${name}: malformed JSON retries only within maxAttempts`)
    assert.equal(decoded.requests, 2, `${name}: response.json failure is not double-counted by the broad catch`)

    let bodyFetches = 0
    const unreadableBody = (async () => {
      bodyFetches++
      return { ok: false, status: 503, headers: { get: () => null }, text: async () => { throw new Error('body read failed') } }
    }) as unknown as typeof fetch
    const rejected = await adapter(items, opts, unreadableBody, noSleep)
    assert.equal(bodyFetches, 2, `${name}: unreadable transient error bodies remain retry-bounded`)
    assert.equal(rejected.requests, 2, `${name}: response.text failure is counted once per HTTP attempt`)
  }
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
await check('mergeInbox persists only source-bound dated catalyst evidence', () => {
  const root = tmp()
  mergeInbox(root, '2026-08-02', [
    triagedItem('https://r/future', 90, 'Amazon to report earnings on 2026-08-06'),
    triagedItem('https://r/future-quarter-day', 90, 'Amazon earnings date for Q2 2026 is August 6, 2026'),
    triagedItem('https://r/future-quarter-day-undated-neighbor', 90, 'Amazon earnings date for Q2 2026 is August 6, 2026, AGM announced'),
    triagedItem('https://r/category', 89, 'Amazon to report earnings after the close'),
    triagedItem('https://r/malformed', 88, 'Amazon to report earnings on 2026-02-30'),
    triagedItem('https://r/negated', 87, 'Amazon says no earnings date within 30 days'),
    triagedItem('https://r/cancelled', 86, 'Amazon to report earnings on 2026-09-09 cancelled'),
    triagedItem('https://r/relative', 85, 'Amazon to report earnings tomorrow'),
    triagedItem('https://r/two-events', 84, 'Amazon to report earnings on 2026-08-06, AGM on 2026-09-09'),
    triagedItem('https://r/postpones', 83, 'Amazon postpones AGM scheduled for 2026-09-09'),
    triagedItem('https://r/cancellation', 82, 'Amazon AGM cancellation on 2026-09-09'),
    triagedItem('https://r/reschedules', 81, 'Amazon reschedules AGM previously set for 2026-09-09'),
    triagedItem('https://r/moved', 80, 'Amazon AGM on 2026-09-09 moved to 2026-10-10'),
    triagedItem('https://r/withdraws', 79, 'Amazon withdraws notice of AGM for 2026-09-09'),
    triagedItem('https://r/moved-before', 78, 'Amazon moved the AGM from 2026-09-09 to 2026-10-10'),
    triagedItem('https://r/shifted', 77, 'Amazon AGM shifted from 2026-09-09'),
    triagedItem('https://r/deferred', 76, 'Amazon defers AGM scheduled for 2026-09-09'),
    triagedItem('https://r/put-off', 75, 'Amazon puts off AGM scheduled for 2026-09-09'),
    triagedItem('https://r/denies', 74, 'Amazon denies AGM on 2026-09-09'),
    triagedItem('https://r/changed', 73, 'Amazon AGM date changed from 2026-09-09 to 2026-10-10'),
    triagedItem('https://r/might', 72, 'Amazon might hold AGM on 2026-09-09'),
    triagedItem('https://r/unconfirmed', 71, 'Amazon AGM date unconfirmed for 2026-09-09'),
    triagedItem('https://r/cancelled-next-sentence', 70, 'Amazon AGM on 2026-09-09. The event was cancelled'),
  ], { maxRows: 30, now: () => new Date('2026-08-02T12:00:00Z') })
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-08-02_sweep.json'), 'utf8'))
  const events = new Map(doc.rows.map((row: any) => [row.url, row.scheduled_events]))
  assert.deepEqual(events.get('https://r/future'), ['results_date on 2026-08-06'])
  assert.deepEqual(events.get('https://r/future-quarter-day'), ['results_date on 2026-08-06'])
  assert.deepEqual(events.get('https://r/future-quarter-day-undated-neighbor'), ['results_date on 2026-08-06'])
  assert.deepEqual(events.get('https://r/category'), [])
  assert.deepEqual(events.get('https://r/malformed'), [])
  assert.deepEqual(events.get('https://r/negated'), [])
  assert.deepEqual(events.get('https://r/cancelled'), [])
  assert.deepEqual(events.get('https://r/relative'), [])
  assert.deepEqual(events.get('https://r/two-events'), ['results_date on 2026-08-06', 'shareholder_meeting on 2026-09-09'])
  for (const slug of ['postpones', 'cancellation', 'reschedules', 'moved', 'withdraws', 'moved-before', 'shifted', 'deferred', 'put-off', 'denies', 'changed', 'might', 'unconfirmed', 'cancelled-next-sentence']) {
    assert.deepEqual(events.get(`https://r/${slug}`), [], `${slug}: obsolete dates are not persisted`)
  }
})
await check('mergeInbox is idempotent by URL and PRESERVES human consumed/launched state', () => {
  const root = tmp()
  mergeInbox(root, '2026-06-12', [triagedItem('https://r/1', 80, 'H1')], { maxRows: 10 })
  const fp = path.join(root, 'screener/inbox/2026-06-12_sweep.json')
  const doc1 = JSON.parse(fs.readFileSync(fp, 'utf8'))
  doc1.rows[0].consumed = true
  doc1.rows[0].launched_signal_id = 'SIG-20260612-deadbeef'
  fs.writeFileSync(fp, JSON.stringify(doc1))
  // re-seen with a NEW observation: source/content + score refresh, lifecycle + inbox identity stay fixed
  const refreshed = {
    ...triagedItem('https://r/1', 91, 'H1 updated'),
    found_at: '2026-06-12T10:15:00Z', source_name: 'Reuters Updated', input_nature: 'exchange_announcement',
  }
  mergeInbox(root, '2026-06-12', [refreshed], { maxRows: 10 })
  const doc2 = JSON.parse(fs.readFileSync(fp, 'utf8'))
  assert.equal(doc2.rows.length, 1)
  assert.equal(doc2.rows[0].inbox_id, doc1.rows[0].inbox_id)
  assert.equal(doc2.rows[0].consumed, true)
  assert.equal(doc2.rows[0].launched_signal_id, 'SIG-20260612-deadbeef')
  assert.equal(doc2.rows[0].triage_score, 91) // score refreshed
  assert.equal(doc2.rows[0].headline, 'H1 updated')
  assert.equal(doc2.rows[0].found_at, '2026-06-12T10:15:00Z')
  assert.equal(doc2.rows[0].source_name, 'Reuters Updated')
  assert.equal(doc2.rows[0].input_nature, 'exchange_announcement')
})
await check('mergeInbox preserves ordinary, correction, and reversal lanes while choosing each lane\'s best source', () => {
  const root = tmp()
  const date = '2026-06-12'
  const story = 'EVT-shared-story'
  const revisionItem = (url: string, score: number, headline: string, inputNature: string): TriagedItem => ({
    ...triagedItem(url, score, headline),
    input_nature: inputNature,
    dedup_group: story,
  })

  // The initial merge leaves the primary filing as the ordinary lane's representative even though the
  // publisher copy has the higher score.
  mergeInbox(root, date, [
    revisionItem('https://news.test/original-copy', 98, 'Issuer reports approval', 'news_headline'),
    revisionItem('https://filing.test/original', 80, 'Issuer reports approval', 'regulatory_filing'),
  ], { maxRows: 10 })

  // Later revisions share the same dedup family. Each lane still applies the source hierarchy locally.
  mergeInbox(root, date, [
    revisionItem('https://news.test/correction-copy', 96, 'Correction: approval remains conditional', 'news_headline'),
    revisionItem('https://company.test/correction', 75, 'Correction: approval remains conditional', 'company_press_release'),
    revisionItem('https://news.test/retraction-copy', 97, 'Issuer retracts approval report', 'news_headline'),
    revisionItem('https://filing.test/retraction', 70, 'Issuer retracts approval report', 'exchange_announcement'),
  ], { maxRows: 10 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows.length, 3)
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.url)),
    new Set([
      'https://filing.test/original',
      'https://company.test/correction',
      'https://filing.test/retraction',
    ]),
    'the original and both thesis-changing revision lanes remain downstream-readable',
  )
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.source_tier)),
    new Set(['primary_filing', 'company']),
    'each lane selects its own highest-ranked source rather than the family-wide highest score',
  )
})
await check('mergeInbox preserves an in-place correction or reversal that reuses the original URL', () => {
  const root = tmp()
  const date = '2026-06-12'
  const url = 'https://news.test/live-article'
  const story = 'EVT-in-place-revision'
  const revision = (headline: string, score: number, foundAt = '2026-06-12T09:00:00Z'): TriagedItem => ({
    ...triagedItem(url, score, headline),
    found_at: foundAt,
    dedup_group: story,
  })

  mergeInbox(root, date, [revision('Issuer reports approval', 80)], { maxRows: 10 })
  mergeInbox(root, date, [revision('Correction: approval remains conditional', 90)], { maxRows: 10 })
  mergeInbox(root, date, [revision('Issuer retracts approval report', 95)], { maxRows: 10 })
  mergeInbox(root, date, [{
    ...revision('Correction: final approval remains conditional', 99, '2026-06-12T11:45:00Z'),
    headline_en: 'Correction: final approval remains conditional',
    source_name: 'Updated Exchange Wire',
    input_nature: 'exchange_announcement',
  }], { maxRows: 10 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows.length, 3, 'one URL keeps one ordinary, correction, and reversal observation')
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.headline)),
    new Set(['Issuer reports approval', 'Correction: final approval remains conditional', 'Issuer retracts approval report']),
  )
  const correction = doc.rows.find((row: any) => row.headline.startsWith('Correction:'))
  assert.equal(correction?.triage_score, 99, 're-seeing the same correction lane remains idempotent and refreshes its score')
  assert.equal(correction?.found_at, '2026-06-12T11:45:00Z', 'the newest correction observation replaces the old source clock')
  assert.equal(correction?.headline_en, 'Correction: final approval remains conditional')
  assert.equal(correction?.source_name, 'Updated Exchange Wire')
  assert.equal(correction?.input_nature, 'exchange_announcement')
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
  // composite priority (rank.ts): 84 + policy scope (+2) + macro_sector event (+1) + recency (+5) +
  // quantified-impact bonus (+6, "50 bps" + "cuts") = 98
  assert.equal(doc.rows[0].triage_score, 98)
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

await check('coerceTriage: a non-lowercase event_materiality_label ("High"/"CRITICAL") is normalized, not defaulted to low (Thread E)', () => {
  // a provider that returns the severity label as "High" / "CRITICAL" (mixed/upper case) used to fail the
  // exact-lowercase membership check and default to 'low', so the materiality floor (rank.ts) never
  // applied to a genuine high/critical event. RED on old code (→ 'low'); GREEN after lower-casing first.
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 20, event_materiality_label: 'High' }).event_materiality_label, 'high')
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 20, event_materiality_label: 'CRITICAL' }).event_materiality_label, 'critical')
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 20, event_materiality_label: '  Medium  ' }).event_materiality_label, 'medium')
  // exact-lowercase still works, and a genuinely malformed label still floors to 'low'
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 20, event_materiality_label: 'high' }).event_materiality_label, 'high')
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 20, event_materiality_label: 'sky-high' }).event_materiality_label, 'low')
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 20 }).event_materiality_label, 'low') // omitted → low (no unearned lift)
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
  assert.equal(kept.found_at, '2026-06-12T09:00:00Z', 'the feed keeps source time distinct from the 09:30 triage clock')
  assert.equal(kept.event_types[0], 'macro_sector')
  assert.equal(kept.companies[0].ticker, 'CANFINHOME')
  assert.equal(kept.size_bucket, 'mid')
  assert.equal(dropped.inboxed, false)
  assert.equal(dropped.found_at, '2026-06-12T09:01:00Z')
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

// ---- LOCAL primary brain: unlimited, $0, tried FIRST — Groq + every cloud/paid tier is fallback ----
const localCfg = () => ({ id: 'local', label: 'Local', color: '--provider-local', apiKey: 'local', baseUrl: 'https://local.test/v1', model: 'qwen2.5:7b-instruct', dailyReqCap: 100_000_000, rpm: 0, timeoutMs: 120_000, maxAttempts: 1, skipArticleRead: true, maxTokens: 3500, budgetFile: 'local-budget.json' })

await check('LOCAL primary brain scores the batch FIRST — Groq never fires while the local box is up', async () => {
  const root = tmp()
  const state = tmp()
  const goodTriage = { usage: { total_tokens: 512 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let localHits = 0, groqCalls = 0, gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('local.test')) { localHits++; return res(goodTriage) }
    if (u.includes('groq')) { groqCalls++; return res(goodTriage) } // MUST NOT be called while local is up
    if (u.includes('gdelt') && !gdeltServed) { gdeltServed = true; return res({ articles: [{ url: 'https://reuters.com/x', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] }) }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, anthropicFallbackEnabled: false, localProvider: localCfg() } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(localHits, 1, 'the local primary brain scored the batch')
  assert.equal(groqCalls, 0, 'Groq (now a fallback) was NOT called while local was up — no ceiling burned')
  assert.equal(s.picked, 1, 'the item was scored by local')
  assert.equal(s.local_requests, 1, 'the cycle attributes the request to local')
  assert.equal(s.local_tokens, 512, 'and the tokens the cockpit shows as live throughput')
  assert.equal(s.groq_requests, 0, 'no Groq spend at all')
  // local-budget.json is the file getNewsStatus reads to show the live token/request throughput
  const lb = JSON.parse(fs.readFileSync(path.join(state, 'local-budget.json'), 'utf8'))
  assert.equal(lb.requests, 1)
  assert.equal(lb.tokens, 512)
})

await check('LOCAL primary down (box unreachable) → the batch falls through to Groq, nothing lost', async () => {
  const root = tmp()
  const state = tmp()
  const goodTriage = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let localHits = 0, groqHits = 0, gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('local.test')) { localHits++; return res('connection refused', 503) } // box asleep / unreachable
    if (u.includes('groq')) { groqHits++; return res(goodTriage) } // fallback picks the batch up the SAME cycle
    if (u.includes('gdelt') && !gdeltServed) { gdeltServed = true; return res({ articles: [{ url: 'https://reuters.com/x', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] }) }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, anthropicFallbackEnabled: false, localProvider: localCfg() } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.ok(localHits >= 1, 'the local primary brain was tried first')
  assert.ok(groqHits >= 1, 'the batch fell through to Groq when local was down — graceful degradation')
  assert.equal(s.picked, 1, 'the item was scored by the fallback, not lost')
  assert.equal(s.local_down, true, 'the cycle summary flags the primary brain as down (so the cockpit warns)')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0, 'nothing deferred — the fallback handled it')
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
  const maxTokens = 2500
  const attemptBound = Math.max(
    triageGroqTokenBound([{ headline: 'RBI cuts repo rate 50 bps in surprise off-cycle move', source_name: 'Reuters', region: 'GLOBAL' } as any], { model: 'llama-3.3-70b', baseUrl: 'https://cerebras.test/v1', apiKey: 'k', maxTokens }),
    triageGroqTokenBound([{ headline: 'Fed signals one more hike as inflation proves sticky', source_name: 'Reuters', region: 'GLOBAL' } as any], { model: 'llama-3.3-70b', baseUrl: 'https://cerebras.test/v1', apiKey: 'k', maxTokens }),
  )
  // The token cap fits one strict per-attempt reservation but, after its 600 actual tokens reconcile, no
  // second full reservation. A request-only cap would score both, so this proves the overflow path gates on
  // its real token ceiling without authorizing spend from an empirical estimate.
  const dailyTokenCap = attemptBound + 100
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, triageBatch: 1,
    anthropicFallbackEnabled: false, // FREE-chain test: keep the paid last-resort tier out (own file: triage-claude-cli.test.ts)
    overflowProviders: [{ id: 'cerebras', label: 'Cerebras', color: '--provider-cb', kind: 'openai', apiKey: 'k', baseUrl: 'https://cerebras.test/v1', model: 'llama-3.3-70b', maxTokens, rpm: 6000, tpm: 55_000, dailyReqCap: 14_400, dailyTokenCap, budgetFile: 'cerebras-budget.json', limiter: 'cerebras' }] } as any
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
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false,
    anthropicFallbackEnabled: false } as any // FREE-chain test: keep the paid last-resort tier out (own file)
  // advanceable clock: cycle 1's Groq failure arms the cross-cycle cooldown (default 5 min), so cycle 2 must
  // sit PAST that window to re-probe the recovered Groq — exactly how the real scheduler behaves (the next
  // cycle after a failure keeps skipping Groq, protecting the daily request cap, until the cooldown lapses).
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)

  // cycle 1: Groq is down (503, retried, still down) — the item must NOT be scored-zero or marked seen
  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.ok, true)
  assert.equal(s1.picked + s1.watched + s1.dropped, 0) // nothing was actually scored
  assert.match(s1.note || '', /deferred/) // and the summary says so honestly
  assert.ok(fs.existsSync(path.join(state, 'news-deferred.json'))) // the spillover persisted

  // cycle 2: Groq is back and the cooldown has lapsed — the item re-enters from the spillover and scores
  groqUp = true
  nowMs += 7 * 60_000 // step past the 5-min cooldown armed by cycle 1's failure
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.candidates, 1) // the requeued item
  assert.equal(s2.picked, 1) // scored this time
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows[0].url, 'https://reuters.com/once')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0) // spillover drained
})

// ---- the cross-cycle Groq COOLDOWN: a sustained outage stops burning the daily REQUEST cap ----
// The in-cycle groqDownThisCycle guard resets every cycle, so BEFORE this fix each of the scheduler's
// many cycles/day re-probed a down Groq and charged the failed call (a 429/timeout still counts as a
// request) to the daily cap — draining it to 13,000/13,000 on only ~14,100 tokens (the 2026-07-11
// incident). The cooldown makes the SECOND cycle (and every cycle until the window lapses) skip Groq
// entirely: no call, no burn. A healthy Groq never arms it, and recovery is bounded by the window.
await check('a sustained Groq outage arms a cross-cycle cooldown — the next cycle makes NO Groq call and burns NO more of the daily request cap', async () => {
  const root = tmp()
  const state = tmp()
  let groqUp = false
  let groqCalls = 0
  const goodGroq = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) { groqCalls++; return groqUp ? res(goodGroq) : res('upstream sad', 503) }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true // GDELT hands the article over ONCE — cycles 2+ rely on the spillover
      return res({ articles: [{ url: 'https://reuters.com/once', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  // NO overflow configured → Groq is the only brain, so the outage's defer/burn behavior shows in isolation.
  // themes off so the ONLY calls to the groq URL are triage probes (the themes namer hits the same baseUrl).
  // groqCooldownMs left at the NEWS default (300s).
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    anthropicFallbackEnabled: false } as any // FREE-chain test: keep the paid last-resort tier out (own file)
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)
  const groqReq = () => { try { return Number(JSON.parse(fs.readFileSync(path.join(state, 'groq-budget.json'), 'utf8')).requests) || 0 } catch { return 0 } }

  // cycle 1: Groq down → it IS probed once (one batch, retried once = 2 requests charged), and the failure
  // arms the outage marker
  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.picked + s1.watched + s1.dropped, 0) // nothing scored — Groq was down
  assert.equal(groqCalls, 2, 'cycle 1 probes the down Groq (one batch, retried once = 2 requests)')
  const burnedAfter1 = groqReq()
  assert.ok(burnedAfter1 >= 1, 'the failed probe was charged to the daily request budget')
  assert.ok(fs.existsSync(path.join(state, 'groq-health.json')), 'the failure armed the cross-cycle cooldown marker')
  assert.ok(JSON.parse(fs.readFileSync(path.join(state, 'groq-health.json'), 'utf8')).unhealthyUntil > nowMs, 'the marker holds a future unhealthy-until timestamp')

  // cycle 2: STILL inside the cooldown window (clock unchanged) → Groq is NOT probed at all. THE FIX.
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.candidates, 1, 'the item IS in the triage queue this cycle (so "no Groq call" is the cooldown, not "nothing to score")')
  assert.equal(groqCalls, 2, 'THE FIX: cycle 2 made NO Groq call while cooling down (was 2, still 2)')
  assert.equal(groqReq(), burnedAfter1, 'and so it burned NO more of the daily request cap')
  assert.match(s2.note || '', /cooldown/i) // the operator sees the honest reason, not a bogus "paced" note
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'the item is still safely deferred (never lost)')

  // cycle 3: clock steps PAST the cooldown AND Groq has recovered → it re-probes once, scores the spillover,
  // and clears the marker. Recovery is bounded by the window, never blocked by it.
  groqUp = true
  nowMs += 7 * 60_000 // step past the 5-min cooldown armed by cycle 1
  const s3 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(groqCalls, 3, 'cycle 3 re-probes the recovered Groq exactly once after the window lapsed')
  assert.equal(s3.picked, 1, 'the deferred item scores as soon as Groq is healthy again')
  assert.equal(fs.existsSync(path.join(state, 'groq-health.json')), false, 'a successful probe cleared the cooldown marker')
})

// ---- #1: the cooldown is now PER-PROVIDER — an overflow provider outage stops re-probing it too ----
await check('a sustained OVERFLOW-provider outage arms its own cross-cycle cooldown — the next cycle does not re-probe it', async () => {
  const root = tmp()
  const state = tmp()
  let cerebrasUp = false
  let cerebrasCalls = 0
  const goodTriage = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A rate move shifts funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq DOWN all cycle → the chain reaches overflow
    if (u.includes('cerebras.test')) { cerebrasCalls++; return cerebrasUp ? res(goodTriage) : res('upstream sad', 503) }
    if (u.includes('gdelt') && !gdeltServed) { gdeltServed = true; return res({ articles: [{ url: 'https://reuters.com/ov', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] }) }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    anthropicFallbackEnabled: false, // FREE-chain test: keep the paid last-resort tier out (own file: triage-claude-cli.test.ts)
    overflowProviders: [{ id: 'cerebras', label: 'Cerebras', color: '--x', kind: 'openai', apiKey: 'k', baseUrl: 'https://cerebras.test/v1', model: 'm', maxTokens: 900, rpm: 6000, tpm: 0, dailyReqCap: 2300, dailyTokenCap: 1e9, budgetFile: 'cerebras-budget.json', limiter: 'cerebras' }] } as any
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)

  // cycle 1: Groq down → chain reaches Cerebras, which is ALSO down (503) → Cerebras probed, its cooldown armed
  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.ok(cerebrasCalls >= 1, 'cycle 1 probed the down overflow provider')
  assert.ok(fs.existsSync(path.join(state, 'cerebras-health.json')), 'the overflow failure armed a PER-PROVIDER cooldown marker')
  const cbAfter1 = cerebrasCalls

  // cycle 2: still inside the window (clock unchanged) → Cerebras is NOT re-probed (was the identical Groq bug)
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.candidates, 1, 'the deferred item IS still in the triage queue (so "no re-probe" is the cooldown, not an empty queue)')
  assert.equal(cerebrasCalls, cbAfter1, 'THE FIX (#1): cycle 2 did NOT re-probe the cooling-down overflow provider — no cap burn')

  // cycle 3: window lapsed + Cerebras recovered → it re-probes, scores the spillover, and clears its marker
  cerebrasUp = true
  nowMs += 7 * 60_000
  const s3 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s3.picked, 1, 'the deferred item scores via the recovered overflow provider')
  assert.equal(fs.existsSync(path.join(state, 'cerebras-health.json')), false, 'a successful overflow probe cleared its cooldown marker')
})

// ---- #2: the article-read / auto-heal path now honors the SHARED cooldown + no longer exhausts on a bare 429 ----
await check('readArticleBrief: a 429 arms the shared cooldown (does NOT exhaust the daily budget), then a cooling provider is skipped', async () => {
  const state = tmp()
  resetCooldownMemory() // hermetic: clear any in-memory marker leaked from an earlier case
  resetSharedLimiters() // the shared 'groq' limiter carries `last` from prior cases' injected clocks; the reader's bounded acquire would otherwise skip
  const provider = { id: 'groq', kind: 'openai', apiKey: 'k', baseUrl: 'https://groq.test', model: 'm', rpm: 6000, tpm: 0, dailyReqCap: 13000, dailyTokenCap: 500000, budgetFile: 'groq-budget.json', limiter: 'groq' }
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  let calls = 0
  const fetchFn = (async () => { calls++; return res('rate limited', 429) }) as unknown as typeof fetch
  const at = Date.parse('2026-06-12T09:30:00Z')
  const r1 = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 12_000 })
  assert.equal(calls, 1, 'the reader tries Groq once (maxAttempts:1)')
  assert.equal(r1.brief, null)
  const gb = JSON.parse(fs.readFileSync(path.join(state, 'groq-budget.json'), 'utf8'))
  assert.equal(gb.requests, 1, 'a per-MINUTE 429 records ONE request — it must NOT exhaust the whole daily budget to the cap')
  assert.ok(gb.requests < 13000, 'the daily request cap is intact (the old exhaust-on-429 slammed it to 13000, blocking recovery till midnight)')
  assert.ok(fs.existsSync(path.join(state, 'groq-health.json')), 'the 429 armed the shared cross-cycle cooldown instead')

  // a second read while still inside the window skips Groq entirely — the heal/on-demand path no longer re-probes a down provider
  const before = calls
  const r2 = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at + 5_000, deadlineMs: at + 17_000 })
  assert.equal(calls, before, 'THE FIX (#2): a cooling-down Groq is skipped by the reader — no re-probe, no burn')
  assert.equal(r2.brief, null)
})

await check('article reads reserve the full prompt/output bound near cap for OpenAI and Gemini providers', async () => {
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const headline = 'RBI surprise cut'
  const bound = articleReadTokenBound(body, headline)
  const oldEstimate = 4_700
  const actualTokens = oldEstimate + 250
  const tokenCap = 100 + bound
  const brief = JSON.stringify({ gist: ['The central bank cut rates by 50 basis points.'], companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector' })

  for (const kind of ['openai', 'gemini'] as const) {
    resetBudgetMemory()
    resetSharedLimiters()
    const state = tmp()
    const budgetFile = `${kind}-near-cap-budget.json`
    const seed = Budget.load(state, 10, tokenCap, Date.now(), budgetFile)
    seed.record(0, 100)
    seed.save()
    const provider = {
      id: kind, kind, apiKey: 'k', baseUrl: `https://${kind}.test`, model: 'm', rpm: 0, tpm: 0,
      dailyReqCap: 10, dailyTokenCap: tokenCap, budgetFile, limiter: kind === 'gemini' ? 'gemini' : 'article-near-cap-openai',
    }
    let fetches = 0
    const fetchFn = (async () => {
      fetches++
      await new Promise<void>((resolve) => setTimeout(resolve, 20))
      return kind === 'openai'
        ? res({ choices: [{ finish_reason: 'stop', message: { content: brief } }], usage: { total_tokens: actualTokens } })
        : res({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: brief }] } }], usageMetadata: { totalTokenCount: actualTokens } })
    }) as unknown as typeof fetch
    const deadline = Date.now() + 20_000
    const results = await Promise.all([
      readArticleBrief(body, headline, [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, deadlineMs: deadline }),
      readArticleBrief(body, headline, [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, deadlineMs: deadline }),
    ])
    assert.equal(fetches, 1, `${kind}: the competing near-cap read is not authorized`)
    assert.equal(results.filter((row) => row.brief).length, 1)
    const saved = JSON.parse(fs.readFileSync(path.join(state, budgetFile), 'utf8'))
    assert.equal(saved.tokens, 100 + actualTokens)
    assert.ok(actualTokens > oldEstimate)
    assert.ok(saved.tokens <= tokenCap)
  }
})

// ---- P1 fix (PR #223 review): a pre-flight miss (no provider request ever made) must NOT arm the shared
// cooldown. "body too thin to read" is decided BEFORE any HTTP call — a single thin article must never mark
// a perfectly healthy provider unhealthy and sideline it for the whole cooldown/backoff window. ----
await check('readArticleBrief: a body too thin to read never contacts the provider and never arms the cooldown', async () => {
  const state = tmp()
  resetCooldownMemory()
  resetSharedLimiters()
  const provider = { id: 'groq', kind: 'openai', apiKey: 'k', baseUrl: 'https://groq.test', model: 'm', rpm: 6000, tpm: 0, dailyReqCap: 13000, dailyTokenCap: 500000, budgetFile: 'groq-budget.json', limiter: 'groq' }
  const thinBody = 'Rates cut.' // well under analyzeArticle's 80-char floor after whitespace-stripping
  let calls = 0
  const fetchFn = (async () => { calls++; return res({}, 200) }) as unknown as typeof fetch
  const at = Date.parse('2026-06-12T09:30:00Z')
  const r = await readArticleBrief(thinBody, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 12_000 })
  assert.equal(calls, 0, 'the pre-flight thin-body check short-circuits BEFORE any network call — the provider is never touched')
  assert.equal(r.brief, null)
  assert.equal(r.attempted, false, 'a preflight skip does not consume an enrichment read attempt')
  assert.equal(readCooldownUntil(state, 'groq'), 0, 'no failure ever reached the provider — the cooldown must stay unarmed')
  assert.equal(fs.existsSync(path.join(state, 'groq-health.json')), false, 'no health marker written — a thin article must not sideline a healthy provider')

  // a SECOND read (still a thin body) must ALSO reach the provider check fresh — proving the first thin-body
  // miss left the provider marked healthy, not cooling down.
  const r2 = await readArticleBrief(thinBody, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at + 1_000, deadlineMs: at + 13_000 })
  assert.equal(r2.brief, null)
  assert.equal(r2.attempted, false, 'repeated thin reads remain retryable and never freeze on the attempt cap')
  assert.equal(readCooldownUntil(state, 'groq'), 0, 'still unarmed after a second thin-body miss')
  assert.equal(fs.existsSync(path.join(state, 'groq-budget.json')), false, 'thin preflight skips before creating or reserving the daily ledger')

  // The same limiter must remain untouched: with zero wait budget, a slot consumed by either thin read
  // would make this immediate real read skip. A real HTTP call proves both request-gap and TPM authority
  // are still available.
  let realCalls = 0
  const fullBody = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const content = JSON.stringify({ gist: ['The central bank cut rates by 50 basis points.'], companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector' })
  const realFetch = (async () => { realCalls++; return res({ choices: [{ finish_reason: 'stop', message: { content } }], usage: { total_tokens: 100 } }) }) as unknown as typeof fetch
  const r3 = await readArticleBrief(fullBody, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn: realFetch, sleep: noSleep, now: () => at + 1_000, deadlineMs: at + 13_000, limiterWaitMs: 0 })
  assert.equal(realCalls, 1, 'repeated thin reads did not consume the shared limiter slot')
  assert.ok(r3.brief)
  assert.equal(r3.attempted, true)
})

await check('article reservation reconciliation cannot reopen a concurrently exhausted provider day', async () => {
  resetBudgetMemory()
  resetSharedLimiters()
  const state = tmp()
  const budgetFile = 'article-exhaust-budget.json'
  const provider = { id: 'article-exhaust', kind: 'openai', apiKey: 'k', baseUrl: 'https://groq.test', model: 'm', rpm: 0, tpm: 0, dailyReqCap: 5, dailyTokenCap: 500_000, budgetFile, limiter: 'article-exhaust' }
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const brief = JSON.stringify({ gist: ['The central bank cut rates by 50 basis points.'], companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector' })
  const fetchFn = (async () => {
    Budget.load(state, 5, 500_000, Date.now(), budgetFile).exhaust()
    return res({ choices: [{ finish_reason: 'stop', message: { content: brief } }], usage: { total_tokens: 100 } })
  }) as unknown as typeof fetch
  const result = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, deadlineMs: Date.now() + 20_000 })
  assert.ok(result.brief)
  const ledger = Budget.load(state, 5, 500_000, Date.now(), budgetFile)
  assert.equal(ledger.canSpend(1), false)
  assert.equal(ledger.remainingRequests, 0)
  assert.equal(ledger.remainingTokens, 0)
})

// ---- P2 fix (PR #223 review): readArticleBrief must honor the CALLER-supplied cooldownMs/cooldownMaxMs
// (what server.ts/enrich-heal.ts now thread from config.NEWS.llmCooldownMs/llmCooldownMaxMs) instead of
// always arming its own hardcoded ~300s/60min default — an operator lengthening the cooldown for a real
// outage must have it actually apply to article reads, not just triage. ----
await check('readArticleBrief: a caller-supplied cooldownMs/cooldownMaxMs is honored, not the hardcoded default', async () => {
  const state = tmp()
  resetCooldownMemory()
  resetSharedLimiters()
  const provider = { id: 'groq', kind: 'openai', apiKey: 'k', baseUrl: 'https://groq.test', model: 'm', rpm: 6000, tpm: 0, dailyReqCap: 13000, dailyTokenCap: 500000, budgetFile: 'groq-budget.json', limiter: 'groq' }
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const fetchFn = (async () => res('rate limited', 429)) as unknown as typeof fetch
  const at = Date.parse('2026-06-12T09:30:00Z')
  // an operator-configured window far longer than readArticleBrief's own 300s/60min hardcoded default —
  // mirrors NEWS_LLM_COOLDOWN_SEC / NEWS_LLM_COOLDOWN_MAX_SEC being turned up during a real outage.
  const configuredCooldownMs = 20 * 60_000 // 20 min
  const configuredCooldownMaxMs = 90 * 60_000 // 90 min
  await readArticleBrief(body, 'RBI surprise cut', [provider] as any, {
    stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 12_000,
    cooldownMs: configuredCooldownMs, cooldownMaxMs: configuredCooldownMaxMs,
  })
  assert.equal(readCooldownUntil(state, 'groq'), at + configuredCooldownMs, 'the armed window uses the CONFIGURED base, not readArticleBrief\'s 300s hardcoded default')
})

// ---- #3: exponential backoff + clear-resets, so a sustained outage stays under even a tiny cap ----
await check('cooldown backoff: consecutive failures double the window (capped); clear resets it', () => {
  const state = tmp()
  resetCooldownMemory()
  const t0 = Date.parse('2026-06-12T09:30:00Z')
  armCooldown(state, t0, 1000, 'p1', 60_000) // 1st fail → base window 1000ms
  assert.equal(readCooldownUntil(state, 'p1'), t0 + 1000)
  armCooldown(state, t0, 1000, 'p1', 60_000) // 2nd consecutive → doubles to 2000
  assert.equal(readCooldownUntil(state, 'p1'), t0 + 2000)
  armCooldown(state, t0, 1000, 'p1', 60_000) // 3rd → 4000
  assert.equal(readCooldownUntil(state, 'p1'), t0 + 4000)
  clearCooldown(state, 'p1') // recovered → resets the backoff counter
  assert.equal(readCooldownUntil(state, 'p1'), 0)
  armCooldown(state, t0, 1000, 'p1', 60_000) // back to base after a clear
  assert.equal(readCooldownUntil(state, 'p1'), t0 + 1000)
  // the backoff is CAPPED at maxMs, so a long outage can never push the window unbounded
  for (let i = 0; i < 20; i++) armCooldown(state, t0, 1000, 'p2', 5000)
  assert.equal(readCooldownUntil(state, 'p2'), t0 + 5000, 'the window clamps at maxMs')
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

// ---- THE LAST-RESORT TIER, end to end. This is the whole point of the tier: when every FREE brain is out,
// an item used to DEFER — and on a sustained-overload day the deferred backlog overruns its 1,000-item cap
// and the low-priority tail is dropped for good. The tier must score it NOW instead (recency), and must
// still stop dead at the daily $ ceiling. The CLI is injected, so no process is spawned and no plan quota
// is drawn by this test. ----
await check('free brains exhausted → the subscription tier SCORES the batch instead of deferring it', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  let gdeltServed = false
  // Groq is hard down and there is no overflow/Gemini configured → without the tier this item would defer
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503)
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/tier', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  let cliCalls = 0
  const claudeCliRunner = async () => {
    cliCalls++
    return {
      text: JSON.stringify({ items: [{ i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' }] }),
      costUsd: 0.006,
    }
  }
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(s.ok, true)
  assert.equal(cliCalls, 1, 'the tier was reached exactly once (after Groq failed)')
  assert.equal(s.picked, 1, 'SCORED by the subscription tier — not deferred, not dropped')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0, 'nothing deferred — the tier caught it')
  assert.equal(s.anthropic_requests, 1)
  assert.ok(Math.abs((s.anthropic_cost_usd ?? 0) - 0.006) < 1e-9, 'the cycle summary reports the spend honestly')
  // and the $ ledger persisted what it spent, so a restart cannot reset the ceiling
  const led = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.ok(Math.abs(led.usd - 0.006) < 1e-9, `ledger usd ${led.usd}`)
})

await check('daily $ ceiling reached → the tier stands down and the batch DEFERS (the operator\'s hard bound)', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  // pre-spend today's ceiling, exactly as an earlier cycle would have left it
  fs.mkdirSync(state, { recursive: true })
  fs.writeFileSync(path.join(state, 'anthropic-triage-budget.json'), JSON.stringify({ date: new Date('2026-06-12T09:30:00Z').toISOString().slice(0, 10), usd: 5, calls: 800 }))
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503)
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/capped', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  let cliCalls = 0
  const claudeCliRunner = async () => { cliCalls++; return { text: '{"items":[]}', costUsd: 0.006 } }
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 0, 'the ceiling was already spent → NOT one more call')
  assert.equal(s.picked + s.watched + s.dropped, 0, 'nothing scored')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'the item defers, exactly as before the tier existed')
})

await check('plan usage limit → the batch defers AND a cross-cycle cooldown stops the next cycle re-spawning the CLI', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503)
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/limit', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  let cliCalls = 0
  // the plan's own 5-hour/weekly quota is spent — the CLI reports it and we must back off, not hammer
  const claudeCliRunner = async () => { cliCalls++; return { text: '', costUsd: 0, error: 'claude cli: usage limit reached — plan quota spent' } }
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0 } as any
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)

  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1)
  assert.equal(s1.picked + s1.watched + s1.dropped, 0, 'nothing scored — the plan was out')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'kept for the next cycle, not lost')
  assert.ok(readCooldownUntil(state, 'anthropic-triage') > nowMs, 'a cooldown was armed to wait for the plan reset')

  // the very next cycle must NOT re-spawn the CLI — that is the "defer intelligently until it resets" rule
  nowMs += 30_000
  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1, 'still 1 — the cooldown suppressed the re-spawn while the plan is out')
})

// ---- end-to-end transparency: the defer note is honest about EVERY blocker, not just Groq ----

await check('the cycle summary carries the transparency fields (fresh/carryover/backlog/backlog_cap/last_resort)', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const groqBody = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/ok', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: false } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s.ok, true)
  assert.equal(s.fresh, 1, 'one genuinely new item this cycle')
  assert.equal(s.carryover, 0, 'nothing re-queued on a clean run')
  assert.equal(s.backlog, 0, 'everything scored → empty backlog')
  assert.equal(s.backlog_cap, 5000, 'the loss boundary (DEFERRED_CAP) is surfaced every cycle')
  assert.equal(s.last_resort, 'off', 'the Haiku fallback state is reported (off, since disabled here)')
})

await check('honest defer note: Groq cooling + Haiku last-resort OFF names BOTH blockers (the fixed surprise)', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq down all cycle
    if (u.includes('gdelt') && !gdeltServed) { gdeltServed = true; return res({ articles: [{ url: 'https://reuters.com/cool', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] }) }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: false } as any
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)

  // cycle 1 arms the Groq cross-cycle cooldown and defers the item
  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.last_resort, 'off')
  assert.ok(readCooldownUntil(state, 'groq') > nowMs, 'Groq cooldown armed')

  // cycle 2: Groq is skipped (cooling), nothing else absorbs the batch → the note must name the cooldown AND the off fallback
  nowMs += 30_000
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.defer_reason, 'groq-cooldown', 'structured reason is the Groq cooldown')
  assert.equal(s2.last_resort, 'off')
  assert.match(s2.note || '', /Groq in failure cooldown/i)
  assert.match(s2.note || '', /Haiku last-resort is off/i, 'the note no longer hides that the fallback was unavailable — the whole point')
})

await check('honest defer note: Groq cooling + Haiku at its $50 ceiling names the ceiling', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  fs.mkdirSync(state, { recursive: true })
  const day = new Date('2026-06-12T09:30:00Z').toISOString().slice(0, 10)
  // the Haiku $ ledger is already spent for today, and Groq is already in a fresh cooldown from a prior outage
  fs.writeFileSync(path.join(state, 'anthropic-triage-budget.json'), JSON.stringify({ date: day, usd: 50, calls: 4000 }))
  const nowMs = Date.parse('2026-06-12T09:30:00Z')
  armCooldown(state, nowMs, 5 * 60_000, 'groq')
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/cap', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 50 } as any
  const now = () => new Date(nowMs)

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s.defer_reason, 'groq-cooldown')
  assert.equal(s.last_resort, 'usd-cap', 'the fallback is correctly reported at its $ ceiling')
  assert.match(s.note || '', /Groq in failure cooldown/i)
  assert.match(s.note || '', /\$50\/day ceiling/i, 'the note surfaces the raised $50 Haiku ceiling as the second blocker')
})

// A shared setup for the Haiku-classification cases: Groq is down all cycle so triage falls to the last
// resort; overflow/gemini are off; a fake claudeCliRunner supplies the failure class under test.
async function runToHaikuFailure(cliError: string, state: string, root: string, nowMs: number) {
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503) // Groq down → the batch falls to Haiku
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/hk', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 50,
    anthropicTransientCooldownMs: 60_000, llmCooldownMs: 300_000, llmCooldownMaxMs: 3_600_000, anthropicMinPriority: 0 } as any
  const claudeCliRunner = async () => ({ text: '', costUsd: 0, error: cliError })
  return runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date(nowMs), claudeCliRunner })
}

await check('Haiku classification: a TRANSIENT failure arms the SHORT flat cooldown, not the 60-min exponential one', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const nowMs = Date.parse('2026-06-12T09:30:00Z')
  const s = await runToHaikuFailure('claude cli: timed out', state, root, nowMs)
  assert.equal(s.last_resort, 'cooling', 'a transient error reads as cooling, not plan-quota')
  const window = readCooldownUntil(state, 'anthropic-triage') - nowMs
  assert.equal(window, 60_000, 'transient → the short flat 60s cooldown (re-probes ~once a drain), NOT 5–60 min')
  assert.match(s.note || '', /Haiku last-resort backing off after an error/i)
})

await check('Haiku classification: a real PLAN-QUOTA exhaustion arms the LONG backoff (wait for the plan to reset)', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const nowMs = Date.parse('2026-06-12T09:30:00Z')
  const s = await runToHaikuFailure('claude cli: usage limit reached — plan quota spent', state, root, nowMs)
  assert.equal(s.last_resort, 'plan-quota', 'a spent plan is reported as plan-quota, not a transient error')
  const window = readCooldownUntil(state, 'anthropic-triage') - nowMs
  assert.equal(window, 300_000, 'plan-quota → the LONG llmCooldown base (300s), so later cycles wait for the plan reset')
  assert.match(s.note || '', /plan quota spent/i)
})

// ---- the diagnostics builder: pure helpers + the full contract ----

await check('pacedHasHeadroom: reqCap gates REQUESTS and tokenCap gates TOKENS (the arg-order the diagnostics read must pass)', async () => {
  const pace = { targetTokens: 500_000, floorFrac: 0.06 }
  const lateDay = Date.parse('2026-06-12T18:00:00Z') // the pacer ceiling is high late in the day
  // signature is (tokens, requests, reqCap, tokenCap, pace, now): the REQUEST cap gates requests, the TOKEN
  // cap gates tokens. A realistic Groq day (9k/13k req, 14k/500k tok) is well under BOTH hard caps, so it has
  // headroom. The swapped-arg bug (passing tokenCap as reqCap) degraded the backstop to `tokens >= 13000`,
  // which would wrongly return false here — this locks the correct order the scheduler read must use.
  assert.equal(pacedHasHeadroom(14_000, 9_000, 13_000, 500_000, pace, lateDay), true, 'under both hard caps + the late-day ceiling → headroom')
  assert.equal(pacedHasHeadroom(0, 13_000, 13_000, 500_000, pace, lateDay), false, 'requests AT the request cap → no headroom')
  assert.equal(pacedHasHeadroom(500_000, 0, 13_000, 500_000, pace, lateDay), false, 'tokens AT the token cap → no headroom')
})

await check('pacedHasHeadroom: the optional est reserves one batch, matching Budget.pacedCanSpend(est) so the drain gate cannot over-report by a batch', async () => {
  const openPace = { targetTokens: 10_000_000, floorFrac: 0 } // pacer set wide so the TOKEN cap is the binding constraint
  const anyTime = Date.parse('2026-06-12T12:00:00Z')
  const est = 1_640 // estimateTokens(12) = 500 + 12*95 — one triage batch
  // exactly one est below the token cap → the loop's canSpend(est) is true, so the gate must say true too
  assert.equal(pacedHasHeadroom(500_000 - est, 0, 13_000, 500_000, openPace, anyTime, est), true, 'room for exactly one more batch → headroom')
  // one token past that → the loop would skip it (tokens + est > cap), so the gate must NOT report headroom
  assert.equal(pacedHasHeadroom(500_000 - est + 1, 0, 13_000, 500_000, openPace, anyTime, est), false, 'one batch short of the token cap → no headroom (the est-blind bug)')
  // est defaults to 0 → the original at-cap semantics are unchanged (no reservation)
  assert.equal(pacedHasHeadroom(499_999, 0, 13_000, 500_000, openPace, anyTime), true, 'est=0 → prior behaviour just under the cap')
})

await check('providerDrainUsable: mirrors the triage loop pick — cooling / req-cap / one-batch-short token cap all block, matching the drain gate to reality', async () => {
  const est = 1_640
  // NVIDIA snapshot: 34/150 req, request-gated (no token cap), but COOLING ~56m → the loop skips it, so the
  // gate must NOT count it as headroom (the busy-spin-scoring-0 bug).
  assert.equal(providerDrainUsable(true, 34, 150, 0, undefined, est), false, 'cooling → not usable even with request budget')
  assert.equal(providerDrainUsable(false, 34, 150, 0, undefined, est), true, 'healthy request-gated provider with budget → usable')
  assert.equal(providerDrainUsable(false, 150, 150, 0, undefined, est), false, 'request cap reached → not usable')
  // Cerebras snapshot: token-gated, cap 900k. One batch short of the cap can't score → not usable (the
  // "Healthy at 900k/900k" bug), but two batches of room → usable.
  assert.equal(providerDrainUsable(false, 500, 2_300, 900_000 - est + 1, 900_000, est), false, 'token-gated, one batch short of the token cap → not usable')
  assert.equal(providerDrainUsable(false, 500, 2_300, 900_000 - est, 900_000, est), true, 'token-gated, room for exactly one batch → usable')
})

await check('drainBatchEst: reserves for the batch the drain would ACTUALLY submit — min(backlog, NEWS.triageBatch), not a fixed full-batch estimate', async () => {
  // The reported gap (Codex, PR #316): 1 queued item needs estimateTokens(1) = 595 tokens, but the drain
  // gate reserved estimateTokens(NEWS.triageBatch) = 1,640 for the default 12-item batch — a provider with
  // 600 tokens of room (enough for the real, 1-item submission) still read as spent and the drain skipped it.
  assert.equal(drainBatchEst(1), estimateTokens(1), 'a 1-item backlog reserves for a 1-item batch, not a full batch')
  assert.equal(drainBatchEst(1), 595, 'pinned to the reported gap\'s own numbers')
  // a backlog at or above the batch size reserves the full batch — unchanged from the old fixed estimate
  assert.equal(drainBatchEst(NEWS.triageBatch), estimateTokens(NEWS.triageBatch))
  assert.equal(drainBatchEst(NEWS.triageBatch + 50), estimateTokens(NEWS.triageBatch), 'never reserves MORE than one batch, however deep the backlog')
  // an empty backlog still reserves the fixed per-call overhead (estimateTokens(0) = 500), not a literal 0
  assert.equal(drainBatchEst(0), estimateTokens(0))
})

await check('armCooldown with base==max is FLAT (the Haiku transient path) — no exponential 60-min pin however many fails', async () => {
  resetCooldownMemory()
  const state = tmp()
  const t0 = Date.parse('2026-06-12T09:00:00Z')
  const FLAT = 60_000
  // the LAST line of defence: a transient blip must re-probe ~once a drain, not back off to an hour. Arm it
  // seven consecutive times; the window must stay a flat 60s even as the fail counter climbs.
  for (let n = 1; n <= 7; n++) {
    armCooldown(state, t0, FLAT, 'anthropic-triage', FLAT)
    assert.equal(readCooldownUntil(state, 'anthropic-triage') - t0, FLAT, `arm #${n}: window stays flat at 60s`)
    assert.equal(cooldownInfo(state, 'anthropic-triage').fails, n, 'the fail counter still advances (for display) even though the window is flat')
  }
  // contrast: the EXPONENTIAL path (base 300s, max 60m) balloons — this is what the paid tier used to inherit
  clearCooldown(state, 'groq')
  for (let i = 0; i < 7; i++) armCooldown(state, t0, 300_000, 'groq', 3_600_000)
  assert.equal(readCooldownUntil(state, 'groq') - t0, 3_600_000, 'exponential path pins at the 60-min cap after enough fails — wrong for the last resort')
})

await check('tierHealth: disabled → cooling → budget-spent → paced precedence', async () => {
  assert.equal(tierHealth(false, 999, true, true), 'disabled', 'disabled wins over everything')
  assert.equal(tierHealth(true, 5000, true, true), 'cooling', 'a live cooldown beats spent/paced')
  assert.equal(tierHealth(true, 0, true, true), 'budget-spent', 'spent beats paced')
  assert.equal(tierHealth(true, 0, false, true), 'paced')
  assert.equal(tierHealth(true, 0, false, false), 'healthy')
})

await check('anthropicDrainReady: the drain gate counts the Haiku last-resort (enabled + not cooling + under the $ ceiling)', async () => {
  // The reported stall: on an overload day the free tiers are budget-spent, so the OLD drain gate returned
  // false and the frequent backlog drain never ran — even though the Haiku last-resort still had budget and
  // could have chewed through the backlog. The drain must run whenever THIS is true.
  assert.equal(anthropicDrainReady(true, false, 10, 50), true, 'enabled, healthy, under the ceiling → can drain the backlog')
  assert.equal(anthropicDrainReady(false, false, 10, 50), false, 'the tier is disabled → not available')
  assert.equal(anthropicDrainReady(true, true, 10, 50), false, 'in a cross-cycle failure cooldown → backing off, cannot take work')
  assert.equal(anthropicDrainReady(true, false, 50, 50), false, 'at its daily $ ceiling → spent')
  assert.equal(anthropicDrainReady(true, false, 60, 50), false, 'past the ceiling → spent')
})

await check('anthropicDrainReady: respects the priority floor — Haiku-only headroom is false when the WHOLE backlog is sub-floor (no-progress-loop fix, PR #316 Codex P2)', async () => {
  // runCycle scores a batch on Haiku only when its lead item clears anthropicMinPriority
  // (runCycle.ts: `preTriagePriority(batch[0]) >= cfg.anthropicMinPriority`); the queue is priority-sorted,
  // so the whole-backlog MAX is the first batch's lead. If even that is below the floor, Haiku refuses every
  // batch. A drain gated on Haiku alone would then re-defer the identical backlog every DRAIN_INTERVAL — a
  // busy loop churning the firehose + deferred file with zero progress. The gate must report NO headroom
  // then. Expected values are pinned to that runCycle floor rule + the Codex P2 finding, not to code output.
  // top backlog priority (10) BELOW the floor (40) → Haiku can't take the batch → NOT drain-ready.
  assert.equal(anthropicDrainReady(true, false, 10, 50, 10, 40), false, 'whole backlog sub-floor → Haiku refuses every batch → no headroom')
  // top backlog priority (55) AT/ABOVE the floor (40) → the first batch clears → drain-ready.
  assert.equal(anthropicDrainReady(true, false, 10, 50, 55, 40), true, 'the best backlog item clears the floor → the first batch scores → headroom')
  assert.equal(anthropicDrainReady(true, false, 10, 50, 40, 40), true, 'exactly at the floor clears it (>=, matching runCycle)')
  // floor of 0 (the default) is a no-op — any non-negative backlog priority passes, exactly the old behaviour.
  assert.equal(anthropicDrainReady(true, false, 10, 50, 0, 0), true, 'default floor 0 → never blocks')
  // backward-compat: the 4-arg call (no floor args) defaults topPriority=Infinity, minPriority=0 → unchanged.
  assert.equal(anthropicDrainReady(true, false, 10, 50), true, '4-arg legacy call → floor check is a no-op (Infinity >= 0)')
})

await check('backlogTrend: reads growing / shrinking / flat / null from recent cycles', async () => {
  const mk = (ts: string, backlog: number) => ({ ts, backlog }) as any
  assert.equal(backlogTrend([]), null, 'no data → null')
  assert.equal(backlogTrend([mk('2026-06-12T09:00:00Z', 100)]), null, 'one point → null')
  assert.equal(backlogTrend([mk('2026-06-12T09:00:00Z', 100), mk('2026-06-12T09:10:00Z', 400)]), 'growing')
  assert.equal(backlogTrend([mk('2026-06-12T09:00:00Z', 400), mk('2026-06-12T09:10:00Z', 100)]), 'shrinking')
  assert.equal(backlogTrend([mk('2026-06-12T09:00:00Z', 200), mk('2026-06-12T09:10:00Z', 205)]), 'flat', 'a small wiggle is flat, not growth')
  // cycles that predate the backlog field (older lines) are ignored, not treated as 0
  assert.equal(backlogTrend([mk('2026-06-12T09:00:00Z', 100), { ts: '2026-06-12T09:05:00Z' } as any, mk('2026-06-12T09:10:00Z', 400)]), 'growing')
})

await check('getNewsDiagnostics: enumerates every tier in routing order, with the backlog gauge + honest defer block', async () => {
  const d = getNewsDiagnostics()
  assert.ok(Array.isArray(d.tiers) && d.tiers.length >= 1, 'tiers are enumerated (at least Groq + the last resort)')
  const groq = d.tiers.find((t) => t.id === 'groq')
  assert.ok(groq && groq.role === 'primary' && groq.meter === 'requests', 'Groq is the primary, requests-metered tier')
  const haiku = d.tiers.find((t) => t.id === 'anthropic-triage')
  assert.ok(haiku && haiku.role === 'last-resort' && haiku.meter === 'usd', 'the Haiku last-resort tier is present and $-metered')
  assert.equal(haiku!.usdCap, NEWS.anthropicDailyUsd, 'the daily $ ceiling flows through config → diagnostics')
  assert.ok(d.tiers.every((t, i) => i === 0 || d.tiers[i - 1].order <= t.order), 'tiers are in fallback-routing order')
  assert.equal(typeof d.backlog.count, 'number')
  assert.ok(d.backlog.cap >= 1, 'the loss boundary is reported')
  assert.equal(typeof d.backlog.nearLimit, 'boolean')
  for (const k of ['active', 'reason', 'plainNote', 'lastResort', 'blockingTiers'] as const) assert.ok(k in d.defer, `defer.${k} present`)
  assert.ok(Array.isArray(d.defer.blockingTiers))
})

console.log(`\n${passed} checks passed`)
