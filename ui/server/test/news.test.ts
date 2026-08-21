// Autonomous news ingester — unit + integration over the pure pipeline with MOCKED fetch + clock,
// so no key, network, or install is needed. Run: npx tsx test/news.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { allApprovedDomains, approvedDomains, lookupSource, normalizeDomain } from '../src/news/sources/approved-domains'
import { buildQueries, fetchGdelt, fetchGdeltDoc, GDELT_MAX_QUERY_CHARS, resetGdeltBackoff } from '../src/news/sources/gdelt'
import { eventIdFor, loadLedgerEventIds, normalizeAndFilter, parseSeendate } from '../src/news/normalize'
import { SeenCache } from '../src/news/seen-cache'
import { Budget, RateLimiter, UsdBudget, armCooldown, clearCooldown, cooldownInfo, dailyQuotaAdmission, getNamedLimiter, pacedHasHeadroom, readCooldownUntil, resetBudgetMemory, resetCooldownMemory, resetSharedLimiters, selectDailyQuotaCandidate } from '../src/news/triage/budget'
import { articleReadTokenBound, readArticleBrief } from '../src/news/triage/article-read'
import { analyzeArticle, coerceTriage, estimateTokens, parseRate, scoreToBand, triageBatch, triageMaxOutputTokens } from '../src/news/triage/groq'
import { analyzeArticleGemini, geminiSchemaEnabled, TRIAGE_RESPONSE_SCHEMA, triageBatchGemini } from '../src/news/triage/gemini'
import { appendFeedItems, readFeed } from '../src/news/feed'
import { newsBus } from '../src/news/bus'
import { mergeInbox, revisionClockRegistryDiagnostics } from '../src/news/write-inbox'
import { backlogDurablyCleared, buildTriageQueue, expireBacklog, loadDeferred, migrateDeferred, preserveResidence, runIngestCycle, stampDeferred, triageGroqTokenBound } from '../src/news/runCycle'
import { countUniqueNewArrivals } from '../src/news/pipeline-flow'
import { anthropicDrainReady, backlogTrend, credentialRejected, CREDENTIAL_DEAD_AFTER_FAILS, drainBatchEst, geminiPoolProviderDayExhausted, getNewsDiagnostics, providerDrainUsable, providerLastCycleMetric, scoredByForLastCycle, tierHealth } from '../src/news/scheduler'
import { buildOverflowProviders, NEWS, STATE_DIR } from '../src/config'
import { createTheme } from '../src/news/themes/discover'
import { appendThemeMutations, loadThemes } from '../src/news/themes/store'
import { themeStoryFamilyKey, themeStoryKey } from '../src/news/themes/story-key'
import type { ThemeItemView } from '../src/news/themes/types'
import type { FeedItem, NewsItem, RawArticle, TriagedItem } from '../src/news/types'
import { attachValidNarrative } from './themes-fixtures'

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
const diagnosticsHome = fs.mkdtempSync(path.join(os.tmpdir(), 'news-diagnostics-home-'))
function gdeltQueryHasDomain(rawUrl: string, domain: string): boolean {
  try {
    const query = new URL(rawUrl).searchParams.get('query') || ''
    const clauses = query.replace(/^\(|\)$/g, '').split(' OR ')
    return clauses.some((clause) => clause === `domain:${domain}`)
  } catch {
    return false
  }
}

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

await check('Budget rotates a queued admission at provider midnight exactly once', () => {
  resetBudgetMemory()
  const dir = tmp()
  const before = Date.parse('2026-06-12T23:59:59Z')
  const after = Date.parse('2026-06-13T00:00:01Z')
  const queued = Budget.load(dir, 1, 100, before, 'midnight-budget.json')
  const first = queued.tryReserve(10, undefined, after)
  assert.ok(first, 'the call waiting across reset uses the new provider day')
  const fresh = Budget.load(dir, 1, 100, after, 'midnight-budget.json')
  assert.equal(fresh.tryReserve(10, undefined, after), null, 'a fresh Budget sees that same new-day reservation; the cap cannot be spent twice')
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'midnight-budget.json'), 'utf8'))
  assert.deepEqual({ date: saved.date, requests: saved.requests, tokens: saved.tokens }, { date: '2026-06-13', requests: 1, tokens: 10 })
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
  assert.equal(owner.providerDayExhausted, true)
  assert.equal(owner.canSpend(1), false)
  assert.equal(owner.remainingRequests, 0)
  assert.equal(owner.remainingTokens, 0)
  resetBudgetMemory()
  const persisted = Budget.load(dir, 5, 1_000, day1)
  assert.equal(persisted.canSpend(1), false, 'the terminal marker survives process-memory reload')
  assert.equal(persisted.providerDayExhausted, true, 'the typed provider-day reason survives process-memory reload')
  const nextDay = Budget.load(dir, 5, 1_000, Date.parse('2026-06-13T00:30:00Z'))
  assert.equal(nextDay.canSpend(400), true, 'only the provider-day rollover clears exhaustion')
  assert.equal(nextDay.providerDayExhausted, false)
})
await check('a legacy exhausted gate remains closed without being relabelled as a provider-reported day limit', () => {
  resetBudgetMemory()
  const dir = tmp()
  const day1 = Date.parse('2026-06-12T02:00:00Z')
  fs.writeFileSync(path.join(dir, 'groq-budget.json'), JSON.stringify({ date: '2026-06-12', requests: 2, tokens: 160, exhausted: true }))
  const legacy = Budget.load(dir, 5, 1_000, day1)
  assert.equal(legacy.canSpend(1), false, 'rolling-deploy compatibility keeps the old day gate closed')
  assert.equal(legacy.providerDayExhausted, false, 'old generic 4xx state is not invented into provider-quota evidence')
  assert.equal(legacy.requests, 2, 'the old ledger counters remain visible as recorded')
  assert.equal(legacy.tokens, 160)
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

await check('request-only RateLimiter honors learned Retry-After with tpm=0', async () => {
  const lim = new RateLimiter(0, 0)
  let t = 1_000_000
  const slept: number[] = []
  lim.learn({ retryAfterMs: 17_000 }, () => t)
  const acquired = await lim.acquire(500, async (ms) => { slept.push(ms); t += ms }, () => t, 20_000)
  assert.equal(acquired, true)
  assert.deepEqual(slept, [17_000], 'request-gated tiers wait for the provider reset even without a TPM window')
})

await check('RateLimiter serializes concurrent callers so one minute slot cannot be double-spent', async () => {
  const lim = new RateLimiter(600, 0) // one call per 100ms
  let t = 1_000_000
  const slots: number[] = []
  const now = () => t
  const sleep = async (ms: number) => { t += ms; slots.push(t); await Promise.resolve() }
  assert.equal(await lim.acquire(0, sleep, now), true)
  await Promise.all([
    lim.acquire(0, sleep, now).then((ok) => { assert.equal(ok, true) }),
    lim.acquire(0, sleep, now).then((ok) => { assert.equal(ok, true) }),
  ])
  assert.deepEqual(slots, [1_000_100, 1_000_200], 'concurrent callers receive distinct request slots')
})

await check('RateLimiter maxWait bounds time spent queued behind another caller', async () => {
  const lim = new RateLimiter(600, 0)
  let releaseFirst!: () => void
  let sleeps = 0
  const heldSleep = () => new Promise<void>((resolve) => { releaseFirst = resolve; sleeps++ })
  assert.equal(await lim.acquire(), true)
  const first = lim.acquire(0, heldSleep)
  while (!releaseFirst) await new Promise<void>((resolve) => setImmediate(resolve))
  const started = Date.now()
  const second = await lim.acquire(0, async () => {}, () => Date.now(), 15)
  assert.equal(second, false)
  assert.ok(Date.now() - started < 100, 'the user-facing deadline includes time waiting for the serialized gate')
  assert.equal(sleeps, 1)
  releaseFirst()
  assert.equal(await first, true)
})

await check('daily quota pacer releases one call, follows provider reset clocks, and carries quiet allowance forward', () => {
  const justAfterUtcMidnight = Date.parse('2026-06-12T00:10:00Z')
  const tiny = dailyQuotaAdmission({ id: 'tiny', meter: 'requests', used: 0, cap: 5, cost: 1, floorFraction: 0 }, justAfterUtcMidnight)
  assert.equal(tiny.pacedFit, true, 'one complete useful call is available even before the fractional clock release reaches one')
  const usedFirst = dailyQuotaAdmission({ id: 'tiny', meter: 'requests', used: 1, cap: 5, cost: 1, floorFraction: 0 }, justAfterUtcMidnight)
  assert.equal(usedFirst.hardCapFit, true)
  assert.equal(usedFirst.pacedFit, false, 'the second call waits while preserving hard-cap headroom')

  const noon = Date.parse('2026-06-12T12:00:00Z')
  const carried = dailyQuotaAdmission({ id: 'quiet', meter: 'requests', used: 0, cap: 100, cost: 1 }, noon)
  assert.equal(Math.round(carried.released), 50, 'unused morning allowance remains available at noon')
  assert.equal(carried.pacedFit, true)
  const pacific = dailyQuotaAdmission({ id: 'pt', meter: 'requests', used: 1, cap: 20, cost: 1, resetTimeZone: 'America/Los_Angeles' }, Date.parse('2026-06-12T07:10:00Z'))
  assert.equal(pacific.pacedFit, false, 'the same instant is just after the Pacific provider reset, not 30% into its day')
})

await check('daily quota selector picks the usable provider furthest behind schedule with stable quality ties', () => {
  const noon = Date.parse('2026-06-12T12:00:00Z')
  const candidates = [
    { id: 'quality-first', meter: 'requests' as const, used: 40, cap: 100, cost: 1, priority: 0 },
    { id: 'underused', meter: 'requests' as const, used: 10, cap: 100, cost: 1, priority: 1 },
    { id: 'hard-spent', meter: 'requests' as const, used: 100, cap: 100, cost: 1, priority: 2 },
  ]
  assert.equal(selectDailyQuotaCandidate(candidates, noon)?.id, 'underused')
  candidates[1].used = 40
  assert.equal(selectDailyQuotaCandidate(candidates, noon)?.id, 'quality-first', 'config order is only the equal-deficit tiebreak')
})

await check('daily quota scheduler releases every safe allowance by day end without overshooting', () => {
  const start = Date.parse('2026-06-12T00:00:00Z')
  const pools = [
    { id: 'token-tier', meter: 'tokens' as const, used: 0, cap: 900_000, cost: 9_000, priority: 0 },
    { id: 'small-request-tier', meter: 'requests' as const, used: 0, cap: 45, cost: 1, priority: 1 },
    { id: 'large-request-tier', meter: 'requests' as const, used: 0, cap: 580, cost: 1, priority: 2 },
  ]
  // One backlog batch per minute is enough to consume these configured envelopes. This exercises the
  // real cumulative selector shape across the entire day, including the otherwise-easy-to-strand final
  // request immediately before reset.
  for (let minute = 0; minute < 24 * 60; minute++) {
    const selected = selectDailyQuotaCandidate(pools, start + minute * 60_000)
    if (selected) selected.used += selected.cost
  }
  assert.deepEqual(pools.map(({ id, used, cap }) => ({ id, used, cap })), [
    { id: 'token-tier', used: 900_000, cap: 900_000 },
    { id: 'small-request-tier', used: 45, cap: 45 },
    { id: 'large-request-tier', used: 580, cap: 580 },
  ])
  for (const pool of pools) {
    assert.equal(dailyQuotaAdmission(pool, start + 23 * 60 * 60_000 + 59 * 60_000).hardCapFit, false, `${pool.id} cannot exceed its configured safe cap`)
  }
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
  const err = await triageBatch(items, { model: 'm', baseUrl: 'https://g.test', apiKey: 'k' }, (async () => res('secret account id acct-123 and balance', 429)) as unknown as typeof fetch)
  assert.equal(err.ok, false)
  assert.equal(err.requests, 2) // a 429 is retried once; both attempts count against the daily request budget
  assert.equal(err.failureKind, 'rate_limit')
  assert.equal(err.httpStatus, 429)
  assert.doesNotMatch(err.note || '', /acct-123|balance/, 'public failure notes never copy the upstream body')
  const bad = await triageBatch(items, { model: 'm', baseUrl: 'https://g.test', apiKey: 'k' }, (async () => res({ choices: [{ message: { content: 'not json' } }] })) as unknown as typeof fetch)
  assert.equal(bad.ok, false)
  assert.equal(bad.byIndex.size, 0)
  assert.equal(bad.failureKind, 'contract')
  const noKey = await triageBatch(items, { model: 'm', baseUrl: 'https://g.test', apiKey: '' }, (async () => res({})) as unknown as typeof fetch)
  assert.equal(noKey.ok, false) // no key → no call
  assert.equal(noKey.failureKind, 'request')
})

await check('a provider with known daily header semantics marks explicit zero remaining requests terminal', async () => {
  const items = [{ headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any]
  let calls = 0
  const fetchFn = (async () => {
    calls++
    return {
      ...res('private quota body', 429),
      headers: { get: (key: string) => key.toLowerCase() === 'x-ratelimit-remaining-requests' ? '0' : null },
    }
  }) as unknown as typeof fetch
  const result = await triageBatch(items, { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 2, requestRemainingHeaderIsDaily: true }, fetchFn, noSleep)
  assert.equal(calls, 1, 'an explicitly exhausted provider day is not retried in-call')
  assert.equal(result.dailyLimit, true)
  assert.equal(result.failureKind, 'rate_limit')
  assert.match(result.note || '', /daily quota reached/)
  assert.doesNotMatch(result.note || '', /private quota body/)

  calls = 0
  const generic = await triageBatch(items, { model: 'm', baseUrl: 'https://generic.test', apiKey: 'k', maxAttempts: 1 }, fetchFn, noSleep)
  assert.equal(generic.dailyLimit, undefined, 'a generic OpenAI-compatible minute-window header cannot falsely close its daily allowance')
})

await check('Cerebras window-suffixed headers drive exact minute retry and daily exhaustion', async () => {
  const values: Record<string, string> = {
    'x-ratelimit-limit-tokens-minute': '30000',
    'x-ratelimit-remaining-tokens-minute': '0',
    'x-ratelimit-reset-tokens-minute': '11.25',
    'x-ratelimit-remaining-requests-day': '0',
  }
  const rate = parseRate({ headers: { get: (key: string) => values[key.toLowerCase()] ?? null } })
  assert.equal(rate.tpmLimit, 30_000)
  assert.equal(rate.tpmRemaining, 0)
  assert.equal(rate.tpmResetMs, 11_250)
  assert.equal(rate.retryAfterMs, 11_250, 'an empty minute bucket uses the provider reset instead of a generic hold')
  assert.equal(rate.rpdRemaining, 0)

  const result = await triageBatch(
    [{ headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any],
    { model: 'm', baseUrl: 'https://cerebras.test', apiKey: 'k', maxAttempts: 2, requestRemainingHeaderIsDaily: true },
    (async () => ({ ...res('private quota body', 429), headers: { get: (key: string) => values[key.toLowerCase()] ?? null } })) as unknown as typeof fetch,
    noSleep,
  )
  assert.equal(result.requests, 1)
  assert.equal(result.dailyLimit, true, 'the documented requests-day zero closes only this provider day')
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
    assert.equal(decoded.failureKind, 'contract', `${name}: malformed success payload is a contract failure`)

    let bodyFetches = 0
    const unreadableBody = (async () => {
      bodyFetches++
      return { ok: false, status: 503, headers: { get: () => null }, text: async () => { throw new Error('body read failed') } }
    }) as unknown as typeof fetch
    const rejected = await adapter(items, opts, unreadableBody, noSleep)
    assert.equal(bodyFetches, 2, `${name}: unreadable transient error bodies remain retry-bounded`)
    assert.equal(rejected.requests, 2, `${name}: response.text failure is counted once per HTTP attempt`)
    assert.equal(rejected.failureKind, 'availability', `${name}: 503 is a service-availability failure`)
    assert.equal(rejected.httpStatus, 503)
  }
})

await check('Groq and Gemini reject empty, partial, duplicate, or out-of-range batch coverage', async () => {
  const items = [
    { headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' },
    { headline: 'Company cuts guidance', source_name: 'NSE', region: 'IN' },
  ] as any[]
  const cases = [
    { label: 'empty', rows: [] },
    { label: 'partial', rows: [{ i: 0, materiality_pre_score: 90 }] },
    { label: 'duplicate', rows: [{ i: 0, materiality_pre_score: 90 }, { i: 0, materiality_pre_score: 0 }] },
    { label: 'out-of-range', rows: [{ i: 0, materiality_pre_score: 90 }, { i: 2, materiality_pre_score: 0 }] },
  ]
  const adapters = [
    {
      label: 'groq',
      run: (rows: any[]) => triageBatch(items, { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 1 },
        (async () => res({ usage: { total_tokens: 100 }, choices: [{ message: { content: JSON.stringify({ items: rows }) } }] })) as unknown as typeof fetch, noSleep),
    },
    {
      label: 'gemini',
      run: (rows: any[]) => triageBatchGemini(items, { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 1 },
        (async () => res({ usageMetadata: { totalTokenCount: 100 }, candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ items: rows }) }] } }] })) as unknown as typeof fetch, noSleep),
    },
  ]
  for (const adapter of adapters) {
    for (const c of cases) {
      const result = await adapter.run(c.rows)
      assert.equal(result.ok, false, `${adapter.label}: ${c.label} coverage cannot be a scored success`)
      assert.equal(result.failureKind, 'contract')
      assert.equal(result.byIndex.size, 0, `${adapter.label}: no partial rows escape on ${c.label} coverage`)
    }
    const explicitLow = await adapter.run([{ i: 0, materiality_pre_score: 90 }, { i: 1, materiality_pre_score: 0 }])
    assert.equal(explicitLow.ok, true, `${adapter.label}: an explicit zero row is a valid complete decision`)
    assert.equal(explicitLow.byIndex.get(1)?.materiality_pre_score, 0)
  }
})

await check('Gemini preserves exact Retry-After headers on transient 503s for title and article routing', async () => {
  const retry503 = (async () => ({
    ...res('temporarily unavailable', 503),
    headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '19' : null },
  })) as unknown as typeof fetch
  const title = await triageBatchGemini(
    [{ headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any],
    { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 1 },
    retry503, noSleep,
  )
  assert.equal(title.rate?.retryAfterMs, 19_000)
  const article = await analyzeArticleGemini(
    'The central bank cut rates by 50 basis points after inflation slowed materially across the economy.',
    'RBI cuts rates',
    { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 1 },
    retry503, noSleep,
  )
  assert.equal(article.rate?.retryAfterMs, 19_000)
})

await check('article adapters expose structured, sanitized failures for routing', async () => {
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const secretBody = JSON.stringify({ error: { message: 'account acct-secret has no access', details: [] } })
  for (const [name, adapter] of [['groq', analyzeArticle], ['gemini', analyzeArticleGemini]] as const) {
    const rejected = await adapter(
      body,
      'RBI surprise cut',
      { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 1 },
      (async () => res(secretBody, 400)) as unknown as typeof fetch,
      noSleep,
    )
    assert.equal(rejected.failureKind, 'request', `${name}: terminal 4xx is a request failure`)
    assert.equal(rejected.httpStatus, 400)
    assert.doesNotMatch(rejected.note || '', /acct-secret|no access/, `${name}: upstream body is private`)

    const malformed = await adapter(
      body,
      'RBI surprise cut',
      { model: 'm', baseUrl: 'https://provider.test', apiKey: 'k', maxAttempts: 1 },
      (async () => name === 'groq'
        ? res({ choices: [{ finish_reason: 'stop', message: { content: 'not json' } }] })
        : res({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'not json' }] } }] })) as unknown as typeof fetch,
      noSleep,
    )
    assert.equal(malformed.failureKind, 'contract', `${name}: malformed model output is a contract failure`)
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
  const result = mergeInbox(root, '2026-06-12', [triagedItem('https://r/1', 80, 'H1'), triagedItem('https://r/2', 55, 'H2'), triagedItem('https://r/3', 72, 'H3')], { maxRows: 2 })
  assert.equal(result.rowCount, 2) // capped to 2 unconsumed
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.source, 'auto_ingester')
  assert.deepEqual(doc.rows.map((r: any) => r.triage_score), [80, 72]) // ranked desc, H2(55) dropped by cap
  assert.match(doc.rows[0].inbox_id, /^INB-20260612-\d{3}$/)
  assert.equal(doc.rows[0].prelim_note, 'score 80') // legacy field kept populated for old readers
})
await check('mergeInbox recovers immutable clocks from archive-only sweeps and a corrupt sweep firehose', () => {
  const priorDate = '2026-08-03'
  const replayDate = '2026-08-12'
  const durableFoundAt = '2026-08-03T00:00:00Z'
  const durableObservedAt = '2026-08-03T00:01:00Z'

  const archiveOnlyRoot = tmp()
  const archiveOnlyDir = tmp()
  const archiveUrl = 'https://reuters.com/archive-only-clock'
  const archiveHeadline = 'Acme archive-only exact observation remains active'
  const archiveEventId = eventIdFor(archiveHeadline, archiveUrl)
  mergeInbox(archiveOnlyRoot, priorDate, [{
    ...triagedItem(archiveUrl, 80, archiveHeadline), found_at: durableFoundAt,
  }], { now: () => new Date(durableObservedAt) })
  const archivedSweepName = `${priorDate}_sweep.json`
  const localArchivedSweep = path.join(archiveOnlyRoot, 'screener', 'inbox', archivedSweepName)
  fs.copyFileSync(localArchivedSweep, path.join(archiveOnlyDir, archivedSweepName))
  fs.unlinkSync(localArchivedSweep)
  const archiveReplay = mergeInbox(archiveOnlyRoot, replayDate, [{
    ...triagedItem(archiveUrl, 80, archiveHeadline), found_at: '2026-08-12T00:00:00Z',
  }], { archiveDir: archiveOnlyDir, now: () => new Date('2026-08-12T00:01:00Z') })
  assert.deepEqual(archiveReplay.revisionClocksByEvent.get(archiveEventId), {
    foundAt: durableFoundAt, observedAt: durableObservedAt, sourceIsEnglish: false,
  })

  const corruptRoot = tmp()
  const corruptArchiveDir = tmp()
  const corruptUrl = 'https://reuters.com/corrupt-sweep-clock'
  const corruptHeadline = 'Beta exact observation survives a corrupt sweep'
  const corruptEventId = eventIdFor(corruptHeadline, corruptUrl)
  mergeInbox(corruptRoot, priorDate, [{
    ...triagedItem(corruptUrl, 80, corruptHeadline), found_at: durableFoundAt,
  }], { now: () => new Date(durableObservedAt) })
  const firehoseItem: FeedItem = {
    kind: 'item', ts: durableObservedAt, found_at: durableFoundAt, observed_at: durableObservedAt,
    event_id: corruptEventId, headline: corruptHeadline, url: corruptUrl, domain: 'reuters.com',
    source_name: 'Reuters', via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline',
    triage_score: 80, band: 'pick', triage_reason: 'material', relevance: 'material', event_types: [],
    issuer_linkage: 'primary', companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: true,
  }
  fs.writeFileSync(path.join(corruptArchiveDir, `${priorDate}_firehose.ndjson`), `${JSON.stringify(firehoseItem)}\n`)
  fs.writeFileSync(path.join(corruptRoot, 'screener', 'inbox', `${priorDate}_sweep.json`), '{corrupt\n')
  const corruptReplay = mergeInbox(corruptRoot, replayDate, [{
    ...triagedItem(corruptUrl, 80, corruptHeadline), found_at: '2026-08-12T00:00:00Z',
  }], { archiveDir: corruptArchiveDir, now: () => new Date('2026-08-12T00:01:00Z') })
  assert.deepEqual(corruptReplay.revisionClocksByEvent.get(corruptEventId), {
    foundAt: durableFoundAt, observedAt: durableObservedAt, sourceIsEnglish: false,
  })

  for (const dir of [archiveOnlyRoot, archiveOnlyDir, corruptRoot, corruptArchiveDir]) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
await check('a malformed firehose item makes revision coverage incomplete while non-item lines remain ignorable', () => {
  const priorDate = '2026-08-03'
  const replayDate = '2026-08-12'
  const summary = JSON.stringify({ kind: 'cycle_summary', ts: '2026-08-03T00:01:00Z' })
  const badRoot = tmp()
  const badInbox = path.join(badRoot, 'screener', 'inbox')
  fs.mkdirSync(badInbox, { recursive: true })
  fs.writeFileSync(path.join(badInbox, `${priorDate}_sweep.json`), JSON.stringify({
    date: priorDate, updated_at: '2026-08-03T00:01:00Z', rows: [],
  }))
  fs.writeFileSync(path.join(badInbox, `${priorDate}_firehose.ndjson`), [
    summary,
    JSON.stringify({ kind: 'item', url: 'https://reuters.com/malformed-clock-item' }),
    '',
  ].join('\n'))
  // The refusal is now reported, not thrown — the cycle survives it (see the runIngestCycle backstop).
  // What must NOT change: the row gets no clock and no sweep is written.
  const badHeld = mergeInbox(badRoot, replayDate, [triagedItem(
    'https://reuters.com/new-after-malformed-clock', 80, 'New evidence waits for valid historical coverage',
  )], { now: () => new Date('2026-08-12T00:01:00Z') })
  assert.equal(badHeld.withheldEventIds.size, 1, 'the unprovable row is withheld')
  assert.equal(badHeld.revisionClocksByEvent.size, 0, 'a withheld row is never handed a clock')
  assert.equal(fs.existsSync(path.join(badInbox, `${replayDate}_sweep.json`)), false)

  const controlRoot = tmp()
  const controlInbox = path.join(controlRoot, 'screener', 'inbox')
  fs.mkdirSync(controlInbox, { recursive: true })
  fs.writeFileSync(path.join(controlInbox, `${priorDate}_sweep.json`), JSON.stringify({
    date: priorDate, updated_at: '2026-08-03T00:01:00Z', rows: [],
  }))
  fs.writeFileSync(path.join(controlInbox, `${priorDate}_firehose.ndjson`), `${summary}\n`)
  const control = mergeInbox(controlRoot, replayDate, [triagedItem(
    'https://reuters.com/new-after-summary', 80, 'Valid summary rows do not poison revision coverage',
  )], { now: () => new Date('2026-08-12T00:01:00Z') })
  assert.equal(control.rowCount, 1)
  fs.rmSync(badRoot, { recursive: true, force: true })
  fs.rmSync(controlRoot, { recursive: true, force: true })
})
await check('a pre-found_at legacy firehose item proves coverage from `ts` and keeps it as the durable clock', () => {
  // REGRESSION (the 2026-08-17 wire blackout): `found_at` only reached firehose ITEM records on
  // 2026-08-05. Every line written before that carries `ts` alone. The coverage proof used to discard
  // those records as malformed, so EVERY legacy partition was permanently unprovable — coverage could
  // never complete, and readPriorInboxRevisions then threw on every genuinely-new story, aborting the
  // whole ingest cycle. ~250 consecutive cycles ran with 0 items and every screener view read empty.
  const legacyDate = '2026-07-01'
  const replayDate = '2026-08-19'
  const legacyUrl = 'https://reuters.com/legacy-ts-only-clock'
  const legacyHeadline = 'A legacy firehose row carries ts and no found_at'
  const root = tmp()
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  // A legacy sweep predates the embedded clock index, so the proof must fall back to the firehose.
  fs.writeFileSync(path.join(inbox, `${legacyDate}_sweep.json`), JSON.stringify({
    date: legacyDate, updated_at: '2026-07-01T00:01:00Z', rows: [],
  }))
  fs.writeFileSync(path.join(inbox, `${legacyDate}_firehose.ndjson`), [
    JSON.stringify({ kind: 'cycle_summary', ts: '2026-07-01T00:01:00Z' }),
    JSON.stringify({ kind: 'item', ts: '2026-07-01T00:07:26Z', url: legacyUrl, headline: legacyHeadline }),
    '',
  ].join('\n'))

  // 1. A brand-new story must ingest: the legacy partition proves coverage instead of wedging it.
  const fresh = mergeInbox(root, replayDate, [triagedItem(
    'https://reuters.com/new-story-after-legacy-partition', 80, 'A new story ingests once legacy coverage is provable',
  )], { now: () => new Date('2026-08-19T00:01:00Z') })
  assert.equal(fresh.rowCount, 1, 'a provable legacy partition must not block new ingest')

  // 2. And the legacy `ts` is the DURABLE clock — replaying that story cannot launder it into freshness.
  const replay = mergeInbox(root, replayDate, [{
    ...triagedItem(legacyUrl, 80, legacyHeadline), found_at: '2026-08-19T00:00:00Z',
  }], { now: () => new Date('2026-08-19T00:02:00Z') })
  assert.equal(replay.revisionClocksByEvent.get(eventIdFor(legacyHeadline, legacyUrl))?.foundAt,
    '2026-07-01T00:07:26Z', 'the legacy ts is the oldest durable observation and outranks a fresh found_at')
  fs.rmSync(root, { recursive: true, force: true })
})
await check('a retained legacy sweep row outranks the later firehose `ts` for the same revision', () => {
  // REVIEW GUARD (#461, Codex P2): the legacy firehose `ts` is when the LINE WAS APPENDED, which is later
  // than the sweep's authoritative first-seen `found_at` — measured on the real retained 2026-07-13
  // partition, later for 40 of 40 matched rows. If the firehose were streamed before the sweep's own rows,
  // the fallback would overwrite a real clock with one days too new. The sweep must win.
  const legacyDate = '2026-07-13'
  const url = 'https://reuters.com/sweep-outranks-firehose-ts'
  const headline = 'The retained sweep row keeps its authoritative first-seen clock'
  const root = tmp()
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  // Legacy sweep: no embedded clock index, but its ROW carries the true first-seen stamp.
  fs.writeFileSync(path.join(inbox, `${legacyDate}_sweep.json`), JSON.stringify({
    date: legacyDate,
    updated_at: '2026-07-13T00:01:00Z',
    rows: [{ ...triagedItem(url, 80, headline), found_at: '2026-07-12T23:05:00Z' }],
  }))
  // Same story in the firehose, appended ~1h later.
  fs.writeFileSync(path.join(inbox, `${legacyDate}_firehose.ndjson`),
    `${JSON.stringify({ kind: 'item', ts: '2026-07-13T00:00:07Z', url, headline })}\n`)

  const replay = mergeInbox(root, '2026-08-19', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-19T00:00:00Z',
  }], { now: () => new Date('2026-08-19T00:01:00Z') })
  assert.equal(replay.revisionClocksByEvent.get(eventIdFor(headline, url))?.foundAt,
    '2026-07-12T23:05:00Z', 'the sweep row\'s found_at must outrank the later firehose ts')
  fs.rmSync(root, { recursive: true, force: true })
})
await check('a firehose item with a PRESENT but malformed found_at still fails closed', () => {
  // REVIEW GUARD (#461, Codex P2): the `ts` fallback is for LEGACY shape (found_at absent) only. A
  // present-but-corrupt stamp must keep failing closed, or bad source-clock data enters the registry.
  const legacyDate = '2026-07-01'
  const root = tmp()
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, `${legacyDate}_sweep.json`), JSON.stringify({
    date: legacyDate, updated_at: '2026-07-01T00:01:00Z', rows: [],
  }))
  fs.writeFileSync(path.join(inbox, `${legacyDate}_firehose.ndjson`), [
    JSON.stringify({ kind: 'cycle_summary', ts: '2026-07-01T00:01:00Z' }),
    JSON.stringify({
      kind: 'item', ts: '2026-07-01T00:07:26Z', found_at: 'not-a-timestamp',
      url: 'https://reuters.com/corrupt-found-at', headline: 'A corrupt stamp is not legacy shape',
    }),
    '',
  ].join('\n'))
  const corruptHeld = mergeInbox(root, '2026-08-19', [triagedItem(
    'https://reuters.com/new-after-corrupt-stamp', 80, 'New evidence still waits on a corrupt partition',
  )], { now: () => new Date('2026-08-19T00:01:00Z') })
  assert.equal(corruptHeld.withheldEventIds.size, 1, 'a corrupt stamp still withholds the row')
  assert.equal(corruptHeld.revisionClocksByEvent.size, 0, 'a withheld row is never handed a clock')
  fs.rmSync(root, { recursive: true, force: true })
})
await check('a legacy firehose row keeps the SWEEP\'s earlier clock, never the later append-time ts', () => {
  // The two clocks are not interchangeable: `found_at` is when the SOURCE published, `ts` is when our
  // ingester appended the line. On the retained 2026-07-13 partition ts was later for 40 of 40 rows — one
  // FDA row by twelve days — so a fallback that let the firehose win would replay every legacy item as
  // days newer than it is, and stale evidence would read as fresh.
  const root = tmp(), state = tmp()
  const date = '2026-08-13'
  const url = 'https://reuters.com/legacy-clock-precedence'
  const headline = 'The sweep clock outranks the firehose append stamp'
  mergeInbox(root, date, [triagedItem(url, 70, headline)],
    { stateDir: tmp(), now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  const legacy = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  // strip the embedded clocks so the row is reachable only through the legacy path
  delete legacy.revision_clock_version
  delete legacy.revision_clocks
  const sweepFoundAt = legacy.rows[0].found_at
  fs.writeFileSync(sweepPath, JSON.stringify(legacy))
  // the SAME revision in the firehose, carrying only the later append stamp
  const item: FeedItem = {
    kind: 'item', ts: '2026-08-13T23:59:00Z',
    observed_at: '2026-08-13T23:59:00Z', event_id: eventIdFor(headline, url), headline, url,
    domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt', region: 'GLOBAL',
    input_nature: 'news_headline', triage_score: 60, band: 'watch', triage_reason: 'material',
    relevance: 'material', event_types: [], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', dedup_status: 'new', inboxed: false,
  } as FeedItem
  fs.writeFileSync(path.join(root, 'screener', 'inbox', `${date}_firehose.ndjson`), `${JSON.stringify(item)}\n`)

  mergeInbox(root, date, [triagedItem('https://reuters.com/unrelated-new', 99, 'An unrelated later item')],
    { stateDir: state, now: () => new Date('2026-08-13T00:05:00Z') })
  const merged = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  const clock = merged.revision_clocks.find((r: any) => r.event_id === eventIdFor(headline, url))
  assert.ok(clock, 'the legacy row is registered')
  assert.equal(clock.found_at, sweepFoundAt, 'the sweep clock survives')
  assert.notEqual(clock.found_at, item.ts, 'the firehose append stamp never replaces it')
})

await check('a legacy firehose row with a MALFORMED found_at fails closed rather than falling back to ts', () => {
  // The fallback exists for rows written before found_at was added — an ABSENT stamp. A present-but-
  // malformed one is corruption, and letting it through would substitute the triage time and mark the
  // partition provable, so bad source-clock data would enter an immutable registry looking authoritative.
  const root = tmp(), state = tmp()
  const date = '2026-08-13'
  mergeInbox(root, date, [triagedItem('https://reuters.com/keeps-partition-alive', 70, 'A normal row')],
    { stateDir: tmp(), now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  const legacy = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  delete legacy.revision_clock_version
  delete legacy.revision_clocks
  fs.writeFileSync(sweepPath, JSON.stringify(legacy))
  const corruptUrl = 'https://reuters.com/corrupt-source-clock'
  const corruptHeadline = 'A corrupted source clock must not be laundered through ts'
  const corrupt = {
    kind: 'item', ts: '2026-08-13T00:03:00Z', found_at: 'not-a-date',
    observed_at: '2026-08-13T00:03:00Z', event_id: eventIdFor(corruptHeadline, corruptUrl),
    headline: corruptHeadline, url: corruptUrl, domain: 'reuters.com', source_name: 'Reuters',
    via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline', triage_score: 60, band: 'watch',
    triage_reason: 'material', relevance: 'material', event_types: [], issuer_linkage: 'primary',
    companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: false,
  }
  fs.writeFileSync(path.join(root, 'screener', 'inbox', `${date}_firehose.ndjson`), `${JSON.stringify(corrupt)}\n`)

  // Refusing the row is only half of failing closed. The partition cannot be PROVEN complete while one of
  // its rows is unreadable, so the merge declines to assign fresh clocks at all. The refusal is now
  // REPORTED rather than thrown (a throw here killed the whole cycle and blanked the cockpit), and
  // because the unprovable partition IS today's, the withhold is batch-wide and nothing is written —
  // identical durable state to the old throw. Asserted on the withhold so a future change that quietly
  // downgrades this to a silent per-row skip is still caught.
  const refused = mergeInbox(root, date, [triagedItem('https://reuters.com/another-new', 99, 'Another later item')],
    { stateDir: state, now: () => new Date('2026-08-13T00:05:00Z') })
  assert.equal(refused.withheldEventIds.size, 1,
    'a corrupted source clock makes the partition unprovable rather than being rescued with the triage time')
  assert.equal(refused.revisionClocksByEvent.size, 0, 'no fresh clock is assigned while the partition is unprovable')
  // and nothing was laundered into the registry on the way out
  const merged = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  const leaked = (merged.revision_clocks || []).find((r: any) => r.event_id === eventIdFor(corruptHeadline, corruptUrl))
  assert.equal(leaked, undefined, 'the corrupted row never reaches the immutable registry')
})

await check('an unprovable OLD partition withholds only its own key — its batch-mates still merge', () => {
  // THE POINT OF THE WHOLE CHANGE. Before, one unprovable key threw and killed the cycle, so a single
  // legacy gap blanked every screener view. Now the doubt is scoped to the row it is actually about.
  const badDate = '2026-08-03'
  const mergeDate = '2026-08-12'
  const knownUrl = 'https://reuters.com/already-registered-row'
  const knownHeadline = 'A story the registry already knows'
  const root = tmp()
  const state = tmp()
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  // Register the known story on its own clean day so the registry can resolve it later.
  mergeInbox(root, '2026-08-01', [{
    ...triagedItem(knownUrl, 80, knownHeadline), found_at: '2026-08-01T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-01T00:01:00Z') })
  // A permanently unprovable OLD partition: a legacy sweep whose firehose carries a malformed item.
  fs.writeFileSync(path.join(inbox, `${badDate}_sweep.json`), JSON.stringify({
    date: badDate, updated_at: '2026-08-03T00:01:00Z', rows: [],
  }))
  fs.writeFileSync(path.join(inbox, `${badDate}_firehose.ndjson`), [
    JSON.stringify({ kind: 'cycle_summary', ts: '2026-08-03T00:01:00Z' }),
    JSON.stringify({ kind: 'item', url: 'https://reuters.com/malformed-no-stamp' }),
    '',
  ].join('\n'))

  const newUrl = 'https://reuters.com/brand-new-unprovable-row'
  const newHeadline = 'A brand new story the registry cannot vouch for'
  const merged = mergeInbox(root, mergeDate, [
    { ...triagedItem(knownUrl, 80, knownHeadline), found_at: '2026-08-12T00:00:00Z' },
    { ...triagedItem(newUrl, 80, newHeadline), found_at: '2026-08-12T00:00:00Z' },
  ], { stateDir: state, now: () => new Date('2026-08-12T00:01:00Z') })

  assert.deepEqual([...merged.withheldEventIds], [eventIdFor(newHeadline, newUrl)],
    'only the unprovable row is withheld')
  assert.ok(fs.existsSync(path.join(inbox, `${mergeDate}_sweep.json`)),
    'the batch still lands — one doubtful row no longer blanks the wire')
  const landedRows = JSON.parse(fs.readFileSync(path.join(inbox, `${mergeDate}_sweep.json`), 'utf8')).rows as Array<{ url: string }>
  assert.deepEqual(landedRows.map((r) => r.url), [knownUrl], 'the withheld row is not projected')
  // And the withheld row is never handed a clock — the invariant the old throw was protecting.
  assert.equal(merged.revisionClocksByEvent.has(eventIdFor(newHeadline, newUrl)), false,
    'a withheld row is never handed a clock')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('a blocked CURRENT partition withholds the WHOLE batch and writes no sweep', () => {
  // THE ANTI-LAUNDERING GATE. When TODAY's own partition is the blocker, a partial write would repair it,
  // falsely complete coverage, and let the NEXT cycle mint a fresh clock for the key just withheld. So
  // today is the one case that still degrades at batch granularity — identical durable state to the old
  // throw, minus the throw.
  const date = '2026-08-13'
  const root = tmp()
  const state = tmp()
  const aUrl = 'https://reuters.com/today-blocked-a'
  const bUrl = 'https://reuters.com/today-blocked-b'
  const aHead = 'First story on a blocked current partition'
  const bHead = 'Second story on a blocked current partition'
  mergeInbox(root, date, [{ ...triagedItem(aUrl, 80, aHead), found_at: '2026-08-13T00:00:00Z' }],
    { stateDir: state, now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  // Lose today's projection AND its SQLite twin: today's own partition becomes unprovable.
  fs.unlinkSync(sweepPath)
  for (const suffix of ['', '-wal', '-shm']) {
    fs.rmSync(path.join(state, `news-revision-clocks.sqlite${suffix}`), { force: true })
  }
  const held = mergeInbox(root, date, [
    { ...triagedItem(aUrl, 80, aHead), found_at: '2026-08-13T02:00:00Z' },
    { ...triagedItem(bUrl, 80, bHead), found_at: '2026-08-13T02:00:00Z' },
  ], { stateDir: state, now: () => new Date('2026-08-13T02:01:00Z') })
  assert.equal(held.withheldEventIds.size, 2, 'a blocked TODAY withholds the whole batch, not just the miss')
  assert.equal(held.revisionClocksByEvent.size, 0, 'nothing is clocked')
  assert.equal(fs.existsSync(sweepPath), false,
    'a manifest-listed current partition cannot be replaced with a falsely fresh sweep')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('a withheld row lands with its ORIGINAL clock once coverage returns — no deadlock, no laundering', () => {
  // Proves the refusal is temporary, not a latch: `unproven` is never persisted and coverage is recomputed
  // from disk every call, so the moment the partition is readable the row merges — carrying the found_at it
  // was always holding, not the retry's later stamp.
  const badDate = '2026-08-03'
  const mergeDate = '2026-08-12'
  const url = 'https://reuters.com/withheld-then-restored'
  const headline = 'A withheld story keeps the clock it arrived with'
  const root = tmp()
  const state = tmp()
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, `${badDate}_sweep.json`), JSON.stringify({
    date: badDate, updated_at: '2026-08-03T00:01:00Z', rows: [],
  }))
  const firehosePath = path.join(inbox, `${badDate}_firehose.ndjson`)
  const summary = JSON.stringify({ kind: 'cycle_summary', ts: '2026-08-03T00:01:00Z' })
  fs.writeFileSync(firehosePath, [summary, JSON.stringify({ kind: 'item', url: 'https://reuters.com/bad' }), ''].join('\n'))

  const item = { ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:00:00Z' }
  for (let cycle = 0; cycle < 3; cycle++) {
    const held = mergeInbox(root, mergeDate, [item], { stateDir: state, now: () => new Date('2026-08-12T00:01:00Z') })
    assert.equal(held.withheldEventIds.size, 1, `still withheld on retry ${cycle + 1}`)
  }
  // Coverage returns: the partition becomes readable.
  fs.writeFileSync(firehosePath, `${summary}\n`)
  const landed = mergeInbox(root, mergeDate, [item], { stateDir: state, now: () => new Date('2026-08-12T00:05:00Z') })
  assert.equal(landed.withheldEventIds.size, 0, 'the row is no longer withheld — the refusal did not latch')
  assert.equal(landed.revisionClocksByEvent.get(eventIdFor(headline, url))?.foundAt, '2026-08-12T00:00:00Z',
    'it lands with the clock it arrived with, not a stamp minted by the retry')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('a current-day legacy migration survives the final merge and a SQLite restart', () => {
  const root = tmp()
  const seedState = tmp()
  const state = tmp()
  const date = '2026-08-13'
  const cappedUrl = 'https://reuters.com/current-legacy-capped-clock'
  const cappedHeadline = 'Capped legacy firehose evidence keeps its first clock'
  const cappedEventId = eventIdFor(cappedHeadline, cappedUrl)
  mergeInbox(root, date, [triagedItem(
    'https://reuters.com/current-legacy-visible', 70, 'Visible legacy sweep evidence remains active',
  )], { stateDir: seedState, now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  const legacy = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  delete legacy.revision_clock_version
  delete legacy.revision_clocks
  fs.writeFileSync(sweepPath, JSON.stringify(legacy))
  const cappedFirehoseItem: FeedItem = {
    kind: 'item', ts: '2026-08-13T00:03:00Z', found_at: '2026-08-13T00:02:00Z',
    observed_at: '2026-08-13T00:03:00Z', event_id: cappedEventId, headline: cappedHeadline,
    url: cappedUrl, domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt', region: 'GLOBAL',
    input_nature: 'news_headline', triage_score: 60, band: 'watch', triage_reason: 'material',
    relevance: 'material', event_types: [], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', dedup_status: 'new', inboxed: false,
  }
  fs.writeFileSync(path.join(root, 'screener', 'inbox', `${date}_firehose.ndjson`),
    `${JSON.stringify(cappedFirehoseItem)}\n`)

  mergeInbox(root, date, [triagedItem(
    'https://reuters.com/current-legacy-new-winner', 99, 'New current evidence wins the visible inbox cap',
  )], { maxRows: 1, stateDir: state, now: () => new Date('2026-08-13T00:05:00Z') })
  const merged = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  assert.equal(merged.rows.length, 1)
  assert.ok(merged.revision_clocks.some((row: any) => row.event_id === cappedEventId),
    'the final merge preserves the capped firehose clock added by current-day legacy migration')

  const registry = path.join(state, 'news-revision-clocks.sqlite')
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${registry}${suffix}`, { force: true })
  const replay = mergeInbox(root, '2026-08-14', [{
    ...triagedItem(cappedUrl, 80, cappedHeadline), found_at: '2026-08-14T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-14T00:01:00Z') })
  assert.deepEqual(replay.revisionClocksByEvent.get(cappedEventId), {
    foundAt: '2026-08-13T00:02:00Z', observedAt: '2026-08-13T00:03:00Z', sourceIsEnglish: false,
  })
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(seedState, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('an empty merge migrates the current legacy firehose before installing its revision index', () => {
  const root = tmp()
  const seedState = tmp()
  const state = tmp()
  const date = '2026-08-13'
  const cappedUrl = 'https://reuters.com/empty-merge-legacy-capped-clock'
  const cappedHeadline = 'An empty merge cannot hide capped legacy firehose evidence'
  const cappedEventId = eventIdFor(cappedHeadline, cappedUrl)
  mergeInbox(root, date, [triagedItem(
    'https://reuters.com/empty-merge-visible-row', 80, 'The retained legacy row remains visible',
  )], { stateDir: seedState, now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  const legacy = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  delete legacy.revision_clock_version
  delete legacy.revision_clocks
  fs.writeFileSync(sweepPath, JSON.stringify(legacy))
  const cappedFirehoseItem: FeedItem = {
    kind: 'item', ts: '2026-08-13T00:03:00Z', found_at: '2026-08-13T00:02:00Z',
    observed_at: '2026-08-13T00:03:00Z', event_id: cappedEventId, headline: cappedHeadline,
    url: cappedUrl, domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt', region: 'GLOBAL',
    input_nature: 'news_headline', triage_score: 60, band: 'watch', triage_reason: 'material',
    relevance: 'material', event_types: [], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', dedup_status: 'new', inboxed: false,
  }
  fs.writeFileSync(path.join(root, 'screener', 'inbox', `${date}_firehose.ndjson`),
    `${JSON.stringify(cappedFirehoseItem)}\n`)

  mergeInbox(root, date, [], { stateDir: state, now: () => new Date('2026-08-13T00:05:00Z') })
  const migrated = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  assert.ok(migrated.revision_clocks.some((row: any) => row.event_id === cappedEventId),
    'the empty merge preserves capped firehose clocks while converting a legacy wrapper')
  const replay = mergeInbox(root, '2026-08-14', [{
    ...triagedItem(cappedUrl, 80, cappedHeadline), found_at: '2026-08-14T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-14T00:01:00Z') })
  assert.deepEqual(replay.revisionClocksByEvent.get(cappedEventId), {
    foundAt: '2026-08-13T00:02:00Z', observedAt: '2026-08-13T00:03:00Z', sourceIsEnglish: false,
  })
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(seedState, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('a known-key write cannot promote an incomplete bootstrap or forget its corrupt partition', () => {
  const root = tmp()
  const seedState = tmp()
  const state = tmp()
  const knownUrl = 'https://reuters.com/known-during-incomplete-bootstrap'
  const knownHeadline = 'Known exact evidence remains safe during incomplete bootstrap'
  const knownEventId = eventIdFor(knownHeadline, knownUrl)
  mergeInbox(root, '2026-08-01', [{
    ...triagedItem(knownUrl, 80, knownHeadline), found_at: '2026-08-01T00:00:00Z',
  }], { stateDir: seedState, now: () => new Date('2026-08-01T00:01:00Z') })
  const badFirehose = path.join(root, 'screener', 'inbox', '2026-08-02_firehose.ndjson')
  fs.writeFileSync(badFirehose, `${JSON.stringify({
    kind: 'item', url: 'https://reuters.com/corrupt-bootstrap-partition',
  })}\n`)

  const knownReplay = mergeInbox(root, '2026-08-13', [{
    ...triagedItem(knownUrl, 80, knownHeadline), found_at: '2026-08-13T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-13T00:01:00Z') })
  assert.deepEqual(knownReplay.revisionClocksByEvent.get(knownEventId), {
    foundAt: '2026-08-01T00:00:00Z', observedAt: '2026-08-01T00:01:00Z', sourceIsEnglish: false,
  })
  const pending = JSON.parse(fs.readFileSync(path.join(state, 'news-revision-clocks.coverage.json'), 'utf8'))
  assert.equal(pending.complete, false, 'a safe known-key hit cannot promote an incomplete bootstrap')
  assert.deepEqual(pending.partition_dates, ['2026-08-01', '2026-08-02', '2026-08-13'],
    'pending coverage retains the corrupt date and the known-key write')

  const heldFirehose = `${badFirehose}.held`
  fs.renameSync(badFirehose, heldFirehose)
  const hiddenHeld = mergeInbox(root, '2026-08-14', [triagedItem(
    'https://reuters.com/unknown-after-hidden-corruption', 80,
    'Unknown evidence cannot pass after the corrupt partition disappears',
  )], { stateDir: state, now: () => new Date('2026-08-14T00:01:00Z') })
  assert.equal(hiddenHeld.withheldEventIds.size, 1, 'the unprovable row is withheld')
  assert.equal(hiddenHeld.revisionClocksByEvent.size, 0, 'a withheld row is never handed a clock')
  assert.equal(fs.existsSync(path.join(root, 'screener', 'inbox', '2026-08-14_sweep.json')), false)
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(seedState, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('mergeInbox indexes manual rows before eviction and preserves their clocks cross-day', () => {
  const root = tmp()
  const priorDate = '2026-08-03'
  const replayDate = '2026-08-12'
  const manualUrl = 'https://reuters.com/manual-sweep-exact'
  const manualHeadline = 'Manual sweep exact observation remains active'
  const manualEventId = eventIdFor(manualHeadline, manualUrl)
  const manualFoundAt = '2026-08-03T00:02:00Z'
  const manualObservedAt = '2026-08-03T00:03:00Z'
  mergeInbox(root, priorDate, [triagedItem('https://reuters.com/auto-seed', 80, 'Auto seed observation')], {
    maxRows: 10, now: () => new Date('2026-08-03T00:01:00Z'),
  })
  const priorPath = path.join(root, 'screener', 'inbox', `${priorDate}_sweep.json`)
  const manualDoc = JSON.parse(fs.readFileSync(priorPath, 'utf8'))
  manualDoc.rows.push({
    ...manualDoc.rows[0], inbox_id: 'INB-20260803-999', headline: manualHeadline, url: manualUrl,
    found_at: manualFoundAt, observed_at: manualObservedAt, triage_score: 70,
    dedup_group: manualEventId, consumed: false, launched_signal_id: null,
  })
  fs.writeFileSync(priorPath, JSON.stringify(manualDoc))
  mergeInbox(root, priorDate, [{
    ...triagedItem('https://reuters.com/crowding-row', 99, 'Crowding row evicts visible manual evidence'),
    found_at: '2026-08-03T00:04:00Z',
  }], { maxRows: 1, now: () => new Date('2026-08-03T00:05:00Z') })
  const capped = JSON.parse(fs.readFileSync(priorPath, 'utf8'))
  assert.equal(capped.rows.some((row: any) => row.url === manualUrl), false)
  assert.ok(capped.revision_clocks.some((row: any) => row.event_id === manualEventId),
    'the first auto merge after a manual row indexes it before applying the UI cap')

  const replay = mergeInbox(root, replayDate, [{
    ...triagedItem(manualUrl, 80, manualHeadline), found_at: '2026-08-12T00:00:00Z',
  }], { now: () => new Date('2026-08-12T00:01:00Z') })
  assert.deepEqual(replay.revisionClocksByEvent.get(manualEventId), {
    foundAt: manualFoundAt, observedAt: manualObservedAt, sourceIsEnglish: false,
  })
  fs.rmSync(root, { recursive: true, force: true })
})
await check('mergeInbox repairs a current-day clock when an older partition returns', () => {
  const root = tmp()
  const priorDate = '2026-08-03'
  const replayDate = '2026-08-12'
  const url = 'https://reuters.com/temporarily-unavailable-clock'
  const headline = 'Exact observation survives temporary partition loss'
  const eventId = eventIdFor(headline, url)
  const durableFoundAt = '2026-08-03T00:00:00Z'
  const durableObservedAt = '2026-08-03T00:01:00Z'
  mergeInbox(root, priorDate, [{ ...triagedItem(url, 80, headline), found_at: durableFoundAt }], {
    now: () => new Date(durableObservedAt),
  })
  const priorPath = path.join(root, 'screener', 'inbox', `${priorDate}_sweep.json`)
  const heldPath = `${priorPath}.held`
  fs.renameSync(priorPath, heldPath)
  mergeInbox(root, replayDate, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:00:00Z',
  }], { now: () => new Date('2026-08-12T00:01:00Z') })
  fs.renameSync(heldPath, priorPath)

  const repaired = mergeInbox(root, replayDate, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:02:00Z',
  }], { now: () => new Date('2026-08-12T00:03:00Z') })
  assert.deepEqual(repaired.revisionClocksByEvent.get(eventId), {
    foundAt: durableFoundAt, observedAt: durableObservedAt, sourceIsEnglish: false,
  })
  const current = JSON.parse(fs.readFileSync(path.join(root, 'screener', 'inbox', `${replayDate}_sweep.json`), 'utf8'))
  const repairedIndex = current.revision_clocks.find((row: any) => row.event_id === eventId)
  assert.equal(repairedIndex.found_at, durableFoundAt, 'the current partition persists the repaired source clock')
  assert.equal(repairedIndex.observed_at, durableObservedAt, 'the current partition persists the repaired observation clock')
  fs.rmSync(root, { recursive: true, force: true })
})
await check('a deleted current-day sweep recovers its exact clock from the durable registry', () => {
  const root = tmp()
  const state = tmp()
  const date = '2026-08-13'
  const url = 'https://reuters.com/current-day-sweep-loss'
  const headline = 'Exact observation survives current day sweep loss'
  const eventId = eventIdFor(headline, url)
  mergeInbox(root, date, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-13T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  fs.unlinkSync(sweepPath)

  const replay = mergeInbox(root, date, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-13T02:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-13T02:01:00Z') })
  assert.deepEqual(replay.revisionClocksByEvent.get(eventId), {
    foundAt: '2026-08-13T00:00:00Z', observedAt: '2026-08-13T00:01:00Z', sourceIsEnglish: false,
  })
  const repaired = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  assert.equal(repaired.revision_clocks[0].found_at, '2026-08-13T00:00:00Z')
  assert.equal(repaired.revision_clocks[0].observed_at, '2026-08-13T00:01:00Z')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('current-day coverage fails closed when both its sweep and SQLite projection are lost', () => {
  const root = tmp()
  const state = tmp()
  const date = '2026-08-13'
  const url = 'https://reuters.com/current-day-source-and-projection-loss'
  const headline = 'Current day exact evidence cannot be made fresh after durable source loss'
  mergeInbox(root, date, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-13T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-13T00:01:00Z') })
  const sweepPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  fs.unlinkSync(sweepPath)
  const registry = path.join(state, 'news-revision-clocks.sqlite')
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${registry}${suffix}`, { force: true })

  // TODAY's own partition is the blocker, so the WHOLE batch is withheld and nothing is written —
  // byte-for-byte what the old throw left behind, minus the throw.
  const todayHeld = mergeInbox(root, date, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-13T02:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-13T02:01:00Z') })
  assert.deepEqual([...todayHeld.withheldEventIds], [eventIdFor(headline, url)])
  assert.equal(todayHeld.revisionClocksByEvent.size, 0, 'a withheld row is never handed a clock')
  assert.equal(fs.existsSync(sweepPath), false,
    'a manifest-listed current partition cannot be replaced with a falsely fresh sweep')

  const newRoot = tmp()
  const newState = tmp()
  const genuinelyNew = mergeInbox(newRoot, date, [triagedItem(
    'https://reuters.com/genuinely-new-current-key', 80,
    'A current key is new when no manifest ever listed its partition',
  )], { stateDir: newState, now: () => new Date('2026-08-13T03:01:00Z') })
  assert.equal(genuinelyNew.rowCount, 1)
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
  fs.rmSync(newRoot, { recursive: true, force: true })
  fs.rmSync(newState, { recursive: true, force: true })
})
await check('mergeInbox repairs cached clocks when an older sweep is fixed in place', () => {
  const root = tmp()
  const priorDate = '2026-08-03'
  const replayDate = '2026-08-12'
  const url = 'https://reuters.com/repaired-in-place-clock'
  const headline = 'Exact observation survives an in-place sweep repair'
  const eventId = eventIdFor(headline, url)
  mergeInbox(root, priorDate, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-03T00:00:00Z',
  }], { now: () => new Date('2026-08-03T00:01:00Z') })
  const priorPath = path.join(root, 'screener', 'inbox', `${priorDate}_sweep.json`)
  const goodBytes = fs.readFileSync(priorPath)
  fs.writeFileSync(priorPath, '{corrupt\n')
  mergeInbox(root, replayDate, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:00:00Z',
  }], { now: () => new Date('2026-08-12T00:01:00Z') })
  fs.writeFileSync(priorPath, goodBytes)

  const repaired = mergeInbox(root, replayDate, [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:02:00Z',
  }], { now: () => new Date('2026-08-12T00:03:00Z') })
  assert.deepEqual(repaired.revisionClocksByEvent.get(eventId), {
    foundAt: '2026-08-03T00:00:00Z', observedAt: '2026-08-03T00:01:00Z', sourceIsEnglish: false,
  })
  fs.rmSync(root, { recursive: true, force: true })
})
await check('mergeInbox returns clocks under the canonical pre-truncation event id', () => {
  const root = tmp()
  const url = 'https://reuters.com/long-source-headline'
  const fullHeadline = `${'Acme capacity expansion remains active '.repeat(16)}terminal source text`
  assert.ok(fullHeadline.length > 500)
  const storedHeadline = fullHeadline.slice(0, 500)
  const canonicalEventId = eventIdFor(fullHeadline, url)
  assert.notEqual(canonicalEventId, eventIdFor(storedHeadline, url))
  const item = {
    ...triagedItem(url, 80, storedHeadline), event_id: canonicalEventId,
    found_at: '2026-08-03T00:00:00Z',
  }
  const merged = mergeInbox(root, '2026-08-03', [item], {
    now: () => new Date('2026-08-03T00:01:00Z'),
  })
  assert.deepEqual(merged.revisionClocksByEvent.get(canonicalEventId), {
    foundAt: '2026-08-03T00:00:00Z', observedAt: '2026-08-03T00:01:00Z', sourceIsEnglish: false,
  })
  assert.equal(merged.revisionClocksByEvent.has(eventIdFor(storedHeadline, url)), false)
  fs.rmSync(root, { recursive: true, force: true })
})
await check('revision clock history stays disk-backed with a bounded hot-key cache', () => {
  const root = tmp()
  const state = tmp()
  const originals = Array.from({ length: 600 }, (_, i) => ({
    ...triagedItem(`https://reuters.com/disk-clock-${i}`, 80, `Disk-backed exact observation ${i}`),
    found_at: '2026-08-03T00:00:00Z',
  }))
  mergeInbox(root, '2026-08-03', originals, {
    maxRows: 1, stateDir: state, now: () => new Date('2026-08-03T00:01:00Z'),
  })
  const replays = originals.map((item) => ({ ...item, found_at: '2026-08-12T00:00:00Z' }))
  const merged = mergeInbox(root, '2026-08-12', replays, {
    maxRows: 1, stateDir: state, now: () => new Date('2026-08-12T00:01:00Z'),
  })
  assert.equal(merged.revisionClocksByEvent.size, originals.length)
  assert.ok([...merged.revisionClocksByEvent.values()].every((clock) => clock.foundAt === '2026-08-03T00:00:00Z'))
  const diagnostics = revisionClockRegistryDiagnostics(root, state)
  assert.equal(diagnostics.backend, 'sqlite')
  assert.equal(diagnostics.revisionCount, originals.length, 'historic keys live in SQLite, not a lifetime JS map')
  assert.equal(diagnostics.partitionCount, 2)
  assert.equal(diagnostics.queryCacheEntries, diagnostics.queryCacheMax,
    'more than the hot-cache limit evicts old lookup entries instead of growing with history')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('a corrupt derived revision registry rebuilds from embedded durable clocks', () => {
  const root = tmp()
  const state = tmp()
  const url = 'https://reuters.com/rebuild-clock-registry'
  const headline = 'Embedded exact clocks rebuild a corrupt disk registry'
  const eventId = eventIdFor(headline, url)
  mergeInbox(root, '2026-08-03', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-03T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-03T00:01:00Z') })
  const registry = path.join(state, 'news-revision-clocks.sqlite')
  for (const suffix of ['-wal', '-shm']) fs.rmSync(`${registry}${suffix}`, { force: true })
  fs.writeFileSync(registry, 'not a sqlite database')
  const replay = mergeInbox(root, '2026-08-12', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-12T00:01:00Z') })
  assert.deepEqual(replay.revisionClocksByEvent.get(eventId), {
    foundAt: '2026-08-03T00:00:00Z', observedAt: '2026-08-03T00:01:00Z', sourceIsEnglish: false,
  })
  assert.equal(revisionClockRegistryDiagnostics(root, state).revisionCount, 1)
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('registry loss with unavailable archive fails closed before persisting fresh clocks', () => {
  const root = tmp()
  const state = tmp()
  const archive = tmp()
  const url = 'https://reuters.com/hidden-archive-clock'
  const headline = 'Hidden archived exact observation cannot be laundered'
  mergeInbox(root, '2026-08-03', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-03T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-03T00:01:00Z') })
  const priorPath = path.join(root, 'screener', 'inbox', '2026-08-03_sweep.json')
  fs.copyFileSync(priorPath, path.join(archive, '2026-08-03_sweep.json'))
  fs.unlinkSync(priorPath)
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(path.join(state, `news-revision-clocks.sqlite${suffix}`), { force: true })
  const unavailableArchive = `${archive}.offline`
  fs.renameSync(archive, unavailableArchive)

  const archiveHeld = mergeInbox(root, '2026-08-12', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:00:00Z',
  }], { stateDir: state, archiveDir: archive, now: () => new Date('2026-08-12T00:01:00Z') })
  assert.equal(archiveHeld.withheldEventIds.size, 1, 'an unprovable archive withholds the row')
  assert.equal(archiveHeld.revisionClocksByEvent.size, 0, 'a withheld row is never handed a clock')
  assert.equal(fs.existsSync(path.join(root, 'screener', 'inbox', '2026-08-12_sweep.json')), false,
    'an uncovered miss cannot land a fresh current-day clock')

  fs.renameSync(unavailableArchive, archive)
  const recovered = mergeInbox(root, '2026-08-12', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-12T00:02:00Z',
  }], { stateDir: state, archiveDir: archive, now: () => new Date('2026-08-12T00:03:00Z') })
  assert.ok([...recovered.revisionClocksByEvent.values()].every((clock) => clock.foundAt === '2026-08-03T00:00:00Z'))
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
  fs.rmSync(archive, { recursive: true, force: true })
})
await check('an old partition restored after bootstrap is discovered outside the recent audit window', () => {
  const root = tmp()
  const seedState = tmp()
  const state = tmp()
  const oldDate = '2026-06-01'
  const url = 'https://reuters.com/restored-old-partition-clock'
  const headline = 'Old exact observation returns after registry bootstrap'
  const eventId = eventIdFor(headline, url)
  mergeInbox(root, oldDate, [{
    ...triagedItem(url, 80, headline), found_at: '2026-06-01T00:00:00Z',
  }], { stateDir: seedState, now: () => new Date('2026-06-01T00:01:00Z') })
  const oldPath = path.join(root, 'screener', 'inbox', `${oldDate}_sweep.json`)
  const heldPath = `${oldPath}.held`
  fs.renameSync(oldPath, heldPath)

  mergeInbox(root, '2026-08-13', [triagedItem(
    'https://reuters.com/bootstrap-visible-row', 80, 'Visible row bootstraps the fresh bounded registry',
  )], { stateDir: state, now: () => new Date('2026-08-13T00:01:00Z') })
  fs.renameSync(heldPath, oldPath)

  const replay = mergeInbox(root, '2026-08-14', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-14T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-08-14T00:01:00Z') })
  assert.deepEqual(replay.revisionClocksByEvent.get(eventId), {
    foundAt: '2026-06-01T00:00:00Z', observedAt: '2026-06-01T00:01:00Z', sourceIsEnglish: false,
  })
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(seedState, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})
await check('a coverage manifest blocks a fresh registry while an expected old archive partition is hidden', () => {
  const root = tmp()
  const state = tmp()
  const archive = tmp()
  const date = '2026-06-01'
  const url = 'https://reuters.com/manifest-hidden-partition-clock'
  const headline = 'Coverage survives projection loss and a hidden archive partition'
  const eventId = eventIdFor(headline, url)
  mergeInbox(root, date, [{
    ...triagedItem(url, 80, headline), found_at: '2026-06-01T00:00:00Z',
  }], { stateDir: state, now: () => new Date('2026-06-01T00:01:00Z') })
  const localPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  const archivePath = path.join(archive, `${date}_sweep.json`)
  fs.copyFileSync(localPath, archivePath)
  fs.unlinkSync(localPath)
  const heldPath = `${archivePath}.held`
  fs.renameSync(archivePath, heldPath)
  const registry = path.join(state, 'news-revision-clocks.sqlite')
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${registry}${suffix}`, { force: true })

  const manifestHeld = mergeInbox(root, '2026-08-13', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-13T00:00:00Z',
  }], { stateDir: state, archiveDir: archive, now: () => new Date('2026-08-13T00:01:00Z') })
  assert.equal(manifestHeld.withheldEventIds.size, 1, 'a hidden expected partition withholds the row')
  assert.equal(manifestHeld.revisionClocksByEvent.size, 0, 'a withheld row is never handed a clock')
  assert.equal(fs.existsSync(path.join(root, 'screener', 'inbox', '2026-08-13_sweep.json')), false,
    'an unknown key under incomplete expected coverage cannot persist a fresh clock')

  fs.renameSync(heldPath, archivePath)
  const recovered = mergeInbox(root, '2026-08-13', [{
    ...triagedItem(url, 80, headline), found_at: '2026-08-13T00:02:00Z',
  }], { stateDir: state, archiveDir: archive, now: () => new Date('2026-08-13T00:03:00Z') })
  assert.deepEqual(recovered.revisionClocksByEvent.get(eventId), {
    foundAt: '2026-06-01T00:00:00Z', observedAt: '2026-06-01T00:01:00Z', sourceIsEnglish: false,
  })
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
  fs.rmSync(archive, { recursive: true, force: true })
})
await check('an empty configured archive cannot establish initial revision-clock coverage', () => {
  const root = tmp()
  const state = tmp()
  const archive = tmp()
  assert.throws(() => mergeInbox(root, '2026-08-13', [triagedItem(
    'https://reuters.com/empty-archive-coverage', 80, 'Fresh evidence waits for configured archive coverage',
  )], { stateDir: state, archiveDir: archive, now: () => new Date('2026-08-13T00:01:00Z') }),
  /cannot prove coverage from an empty configured archive/)
  assert.equal(fs.existsSync(path.join(root, 'screener', 'inbox', '2026-08-13_sweep.json')), false)
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
  fs.rmSync(archive, { recursive: true, force: true })
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
    {
      ...triagedItem('https://r/translated', 69, 'アマゾン株主総会は2026-09-09に開催'),
      headline_en: 'Amazon AGM confirmed for 2026-09-09',
    },
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
  assert.deepEqual(events.get('https://r/translated'), [], 'translated display copy cannot create scored timing evidence')
  for (const slug of ['postpones', 'cancellation', 'reschedules', 'moved', 'withdraws', 'moved-before', 'shifted', 'deferred', 'put-off', 'denies', 'changed', 'might', 'unconfirmed', 'cancelled-next-sentence']) {
    assert.deepEqual(events.get(`https://r/${slug}`), [], `${slug}: obsolete dates are not persisted`)
  }
})
await check('mergeInbox keeps a same-URL reword as a new observation without mutating human history', () => {
  const root = tmp()
  mergeInbox(root, '2026-06-12', [triagedItem('https://r/1', 80, 'H1')], { maxRows: 10 })
  const fp = path.join(root, 'screener/inbox/2026-06-12_sweep.json')
  const doc1 = JSON.parse(fs.readFileSync(fp, 'utf8'))
  doc1.rows[0].consumed = true
  doc1.rows[0].launched_signal_id = 'SIG-20260612-deadbeef'
  fs.writeFileSync(fp, JSON.stringify(doc1))
  // A reword at the same URL is a NEW exact observation. The prior consumed row remains immutable and
  // the new wording stays visible for readTopSweep's stable URL veto to block before idea generation.
  const refreshed = {
    ...triagedItem('https://r/1', 91, 'H1 updated'),
    found_at: '2026-06-12T10:15:00Z', source_name: 'Reuters Updated', input_nature: 'exchange_announcement',
  }
  mergeInbox(root, '2026-06-12', [refreshed], { maxRows: 10 })
  const doc2 = JSON.parse(fs.readFileSync(fp, 'utf8'))
  assert.equal(doc2.rows.length, 2)
  const historical = doc2.rows.find((row: any) => row.headline === 'H1')
  const update = doc2.rows.find((row: any) => row.headline === 'H1 updated')
  assert.equal(historical?.inbox_id, doc1.rows[0].inbox_id)
  assert.equal(historical?.consumed, true)
  assert.equal(historical?.launched_signal_id, 'SIG-20260612-deadbeef')
  assert.equal(update?.consumed, false)
  assert.equal(update?.triage_score, 91)
  assert.equal(update?.found_at, '2026-06-12T10:15:00Z')
  assert.equal(update?.source_name, 'Reuters Updated')
  assert.equal(update?.input_nature, 'exchange_announcement')
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

  mergeInbox(root, date, [revision('Issuer reports approval', 80)], {
    maxRows: 10, now: () => new Date('2026-06-12T09:01:00Z'),
  })
  mergeInbox(root, date, [revision('Correction: approval remains conditional', 90)], {
    maxRows: 10, now: () => new Date('2026-06-12T09:02:00Z'),
  })
  mergeInbox(root, date, [revision('Issuer retracts approval report', 95)], {
    maxRows: 10, now: () => new Date('2026-06-12T09:03:00Z'),
  })
  mergeInbox(root, date, [{
    ...revision('Correction: final approval remains conditional', 99, '2026-06-12T11:45:00Z'),
    headline_en: 'Correction: final approval remains conditional',
    source_name: 'Updated Exchange Wire',
    input_nature: 'exchange_announcement',
  }], { maxRows: 10, now: () => new Date('2026-06-12T11:46:00Z') })
  mergeInbox(root, date, [{
    ...revision('Correction: final approval remains conditional', 100, '2026-06-12T12:00:00Z'),
    headline_en: 'Correction: final approval remains conditional',
    source_name: 'Final Exchange Wire',
    input_nature: 'exchange_announcement',
  }], { maxRows: 10, now: () => new Date('2026-06-12T12:01:00Z') })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows.length, 4, 'one URL keeps every differently worded status update, while an exact repeat remains idempotent')
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.headline)),
    new Set(['Issuer reports approval', 'Correction: approval remains conditional', 'Correction: final approval remains conditional', 'Issuer retracts approval report']),
  )
  const correction = doc.rows.find((row: any) => row.headline === 'Correction: final approval remains conditional')
  assert.equal(correction?.triage_score, 100, 're-seeing the exact observation remains idempotent and refreshes its score')
  assert.equal(correction?.found_at, '2026-06-12T11:45:00Z', 'an exact refresh cannot re-date the evidence or reset its freshness')
  assert.equal(correction?.observed_at, '2026-06-12T11:46:00Z', 'an exact refresh preserves the revision first-seen clock')
  assert.equal(
    doc.rows.find((row: any) => row.headline === 'Correction: approval remains conditional')?.observed_at,
    '2026-06-12T09:02:00Z',
    'each distinct in-place revision receives its own durable first-seen clock',
  )
  assert.equal(correction?.headline_en, 'Correction: final approval remains conditional')
  assert.equal(correction?.source_name, 'Final Exchange Wire')
  assert.equal(correction?.input_nature, 'exchange_announcement')
})

await check('mergeInbox preserves differently worded exact-family observations without a status keyword', () => {
  const root = tmp()
  const family = 'EVT-expansion-state'
  const observation = (headline: string, score: number, foundAt: string): TriagedItem => ({
    ...triagedItem('https://company.test/expansion', score, headline),
    dedup_group: family,
    found_at: foundAt,
  })
  mergeInbox(root, '2026-06-12', [
    observation('Issuer confirms expansion into Europe', 80, '2026-06-12T09:00:00Z'),
    observation('Issuer abandons expansion into Europe', 70, '2026-06-12T10:00:00Z'),
  ], { maxRows: 10 })
  // An exact replay refreshes only its own observation; it cannot overwrite the differently worded row.
  mergeInbox(root, '2026-06-12', [
    observation('Issuer abandons expansion into Europe', 75, '2026-06-12T10:05:00Z'),
  ], { maxRows: 10 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.headline)),
    new Set(['Issuer confirms expansion into Europe', 'Issuer abandons expansion into Europe']),
  )
  assert.equal(doc.rows.find((row: any) => row.headline.startsWith('Issuer abandons'))?.triage_score, 75)
})

await check('story identity preserves every status update but counts one underlying story family', () => {
  const updates = [
    'Issuer announces AGM cancellations',
    'Issuer announces results postponements',
    'Issuer issues corrections',
    'Issuer publishes revisions',
    'Issuer files restatements',
    'Issuer announces retractions',
    'Issuer withdrew guidance',
    'Issuer delays AGM',
    'Issuer defers AGM',
    'Issuer suspends AGM',
    'Issuer scraps AGM',
    'Issuer calls off AGM',
    'Correction: issuer AGM was not cancelled',
    'Issuer says AGM is no longer cancelled',
    'Issuer says AGM will not be cancelled',
    "Issuer says AGM won't be delayed",
    "Issuer says AGM isn't cancelled",
    "Issuer says AGM wasn't cancelled",
    "Issuer says AGM hasn't been cancelled",
    "Issuer says AGM wouldn't be cancelled",
    'Issuer says AGM is not being postponed',
    'Issuer denies AGM was cancelled',
    'Issuer denies AGM cancellation',
    'Issuer denies it cancelled the AGM',
    'Issuer denies reports that AGM and EGM were cancelled',
    'Issuer denies AGM and EGM cancellation',
    'Reports of AGM cancellation denied',
    'AGM cancellation claims are false',
    'Reported AGM cancellation is incorrect',
    'Issuer restores AGM after cancellation',
    'Issuer reinstates its postponed AGM',
    'Issuer withdraws the AGM cancellation notice',
    'Issuer reverses decision to cancel AGM',
    'Issuer cancels postponement of AGM',
    'Issuer says AGM will go ahead as planned',
    'Issuer says AGM is going ahead',
    'Issuer says AGM will proceed as scheduled',
    'AGM to go ahead as planned',
    'AGM set to go ahead',
    'AGM will still go ahead',
    'AGM can proceed',
    'Earnings call to proceed',
    'Production resumes after suspension',
    'Trading resumes after suspension',
    'Talks resumed after postponement',
    'Service restored after outage',
    'Cancellation claims are false',
    'Reported cancellation is incorrect',
    // Ambiguous update wording is deliberately retained rather than semantically guessed. It remains
    // one family for corroboration, so a false-positive preservation cannot lift conviction.
    'Issuer restores investor confidence after AGM',
    'Issuer denies wrongdoing after supplier contract was cancelled',
    'Issuer denies reports of wrongdoing after supplier cancellation',
    'Issuer denies wrongdoing and says supplier contract was cancelled',
    'Issuer denies wrongdoing as supplier contract was cancelled',
    'Issuer denies wrongdoing when supplier contract was cancelled',
    'Issuer denies wrongdoing and supplier contract cancellation',
    'Issuer cancels AGM to avoid delays',
    'Issuer withdraws offer to prevent postponement',
    'Issuer rescinds guidance over delays',
    'Issuer cancels AGM citing delays',
    'Issuer withdraws bid upon cancellation concerns',
    'AGM cancellation sees guidance withdrawn',
    'Offer proceeds will fund expansion',
    'Dividend proceeds rose 10%',
    'Meeting proceeds remain in escrow',
  ]
  const observationKeys = updates.map((headline) => themeStoryKey({ dedup_group: 'EVT-status', headline }))
  assert.ok(observationKeys.every((key) => key.startsWith('EVT-status:update:')))
  assert.equal(new Set(observationKeys).size, updates.length, 'one update can never replace a differently worded update')
  assert.ok(updates.every((headline) => themeStoryFamilyKey({ dedup_group: 'EVT-status', headline }) === 'EVT-status'))
  assert.equal(themeStoryKey({ dedup_group: 'EVT-status', headline: 'Issuer confirms AGM for September 9' }), 'EVT-status')
})

await check('one status-heavy family is bounded and cannot starve a higher-ranked unrelated story', () => {
  const root = tmp()
  const date = '2026-06-12'
  const family = Array.from({ length: 45 }, (_, index): TriagedItem => ({
    ...triagedItem(`https://news.test/status-${index}`, 70 - (index % 10), `Issuer changes AGM status update ${index}`),
    dedup_group: 'EVT-status-heavy',
    found_at: new Date(Date.parse('2026-06-12T09:00:00Z') + index * 60_000).toISOString(),
  }))
  const restoration: TriagedItem = {
    ...triagedItem('https://news.test/status-restored', 20, 'Issuer says AGM will proceed as scheduled'),
    dedup_group: 'EVT-status-heavy',
    found_at: '2026-06-12T10:00:00Z',
  }
  const independent = triagedItem('https://filing.test/earnings', 99, 'Independent issuer reports quarterly earnings')
  mergeInbox(root, date, [...family, restoration, independent], { maxRows: 10 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  const heavy = doc.rows.filter((row: any) => row.dedup_group === 'EVT-status-heavy')
  assert.equal(heavy.length, 6, 'one story family keeps a bounded strongest-plus-newest audit trail')
  assert.ok(doc.rows.some((row: any) => row.url === independent.url), 'global re-ranking keeps the higher-scoring unrelated story')
  assert.ok(doc.rows.some((row: any) => row.url === restoration.url), 'the newest restoration survives even with the family\'s lowest score')
})

await check('bounded story history pins adverse and restorative states ahead of ambiguous update rewrites', () => {
  const root = tmp()
  const date = '2026-06-12'
  const story = 'EVT-crowded-status-history'
  const revision = (url: string, score: number, headline: string, foundAt: string, inputNature = 'news_headline'): TriagedItem => ({
    ...triagedItem(url, score, headline),
    dedup_group: story,
    found_at: foundAt,
    input_nature: inputNature,
  })
  const original = revision('https://filing.test/agm-original', 60, 'Issuer confirms AGM for September 9', '2026-06-12T08:00:00Z', 'regulatory_filing')
  const cancellation = revision('https://news.test/agm-cancelled', 18, 'Issuer cancels AGM', '2026-06-12T08:01:00Z')
  const restoration = revision('https://news.test/agm-restored', 17, 'Issuer says AGM will proceed as scheduled', '2026-06-12T08:02:00Z')
  const ambiguous = Array.from({ length: 20 }, (_, index) => revision(
    `https://news.test/proceeds-${index}`,
    90 - index,
    `Offer proceeds will fund expansion update ${index}`,
    new Date(Date.parse('2026-06-12T09:00:00Z') + index * 60_000).toISOString(),
  ))
  const independent = triagedItem('https://filing.test/unrelated', 99, 'Independent issuer reports quarterly earnings')

  mergeInbox(root, date, [original, cancellation, restoration, ...ambiguous, independent], { maxRows: 10 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  const family = doc.rows.filter((row: any) => row.dedup_group === story)
  assert.equal(family.length, 6, 'the family remains hard-bounded even when broad preservation sees many updates')
  assert.ok(family.some((row: any) => row.url === original.url), 'the best-source observation is pinned')
  assert.ok(family.some((row: any) => row.url === cancellation.url), 'the sole adverse state cannot be crowded out')
  assert.ok(family.some((row: any) => row.url === restoration.url), 'the sole restoration cannot be crowded out')
  assert.ok(family.some((row: any) => row.url === ambiguous.at(-1)?.url), 'the newest observation is pinned')
  assert.ok(doc.rows.some((row: any) => row.url === independent.url), 'family bounding still leaves the unrelated high-score story visible')
})

await check('global inbox cap keeps each chosen family source winner before extra status rows', () => {
  const root = tmp()
  const date = '2026-06-12'
  const family = 'EVT-global-source-pin'
  const row = (url: string, headline: string, score: number, inputNature: string): TriagedItem => ({
    ...triagedItem(url, score, headline), dedup_group: family, input_nature: inputNature,
  })
  const filing = row('https://filing.test/global-pin', 'Exchange confirms approval remains conditional', 20, 'regulatory_filing')
  const adverse = row('https://news.test/global-pin-cancel', 'Regulator cancels approval', 100, 'news_headline')
  const restoration = row('https://news.test/global-pin-restore', 'Company says approval was not cancelled', 99, 'news_headline')
  const independent = {
    ...triagedItem('https://filing.test/global-pin-independent', 80, 'Independent issuer files audited results'),
    dedup_group: 'EVT-global-pin-independent', input_nature: 'regulatory_filing',
  }
  mergeInbox(root, date, [filing, adverse, restoration, independent], { maxRows: 3 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.ok(doc.rows.some((item: any) => item.url === filing.url), 'the global cap cannot discard the family source winner')
  assert.ok(doc.rows.some((item: any) => item.url === independent.url), 'the unrelated high-value family gets its first-round slot')
  assert.ok(doc.rows.some((item: any) => item.url === adverse.url), 'the second family round retains the adverse state')
  assert.equal(doc.rows.some((item: any) => item.url === restoration.url), false, 'the deterministic third slot is the adverse state')
})

await check('bounded inbox state uses English translation and pins official adverse plus restorative denial', () => {
  const root = tmp()
  const date = '2026-06-12'
  const family = 'EVT-translated-family-state'
  const translated = (
    url: string, headline: string, headlineEn: string, score: number, inputNature: string, foundAt: string,
  ): TriagedItem => ({
    ...triagedItem(url, score, headline), headline_en: headlineEn, dedup_group: family,
    input_nature: inputNature, found_at: foundAt,
  })
  const original = translated(
    'https://filing.test/translated-original', '取引所は審査中と発表', 'Exchange confirms review remains open',
    50, 'regulatory_filing', '2026-06-12T08:00:00Z',
  )
  const adverse = translated(
    'https://official.test/translated-adverse', '規制当局が承認を撤回', 'Regulator cancels approval',
    40, 'macro_data_release', '2026-06-12T08:01:00Z',
  )
  const restoration = translated(
    'https://company.test/translated-restoration', '会社は取り消しを否定', 'Company denies approval was cancelled',
    30, 'company_press_release', '2026-06-12T08:02:00Z',
  )
  const rewrites = Array.from({ length: 10 }, (_, index): TriagedItem => ({
    ...triagedItem(`https://news.test/translated-rewrite-${index}`, 95 - index, `承認状況 ${index}`),
    headline_en: `Approval status update ${index}`, dedup_group: family,
    found_at: new Date(Date.parse('2026-06-12T09:00:00Z') + index * 60_000).toISOString(),
  }))
  const independent = {
    ...triagedItem('https://filing.test/translated-independent', 35, 'Independent issuer files results'),
    dedup_group: 'EVT-translated-independent', input_nature: 'regulatory_filing',
  }
  mergeInbox(root, date, [original, adverse, restoration, ...rewrites, independent], { maxRows: 5 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.ok(doc.rows.some((item: any) => item.url === original.url), 'the best primary source is pinned')
  assert.ok(doc.rows.some((item: any) => item.url === adverse.url), 'model-visible English preserves the official adverse state')
  assert.ok(doc.rows.some((item: any) => item.url === restoration.url), 'the translated denial is restorative before the broad adverse grammar')
  assert.ok(doc.rows.some((item: any) => item.url === independent.url), 'the family remains globally bounded')
})

await check('mergeInbox keeps lower-score real restorations when unrelated denials or double reversals share a family', () => {
  const root = tmp()
  const date = '2026-06-12'
  const revision = (group: string, url: string, headline: string, score: number): TriagedItem => ({
    ...triagedItem(url, score, headline),
    dedup_group: group,
  })
  const rows = [
    revision('EVT-passive', 'https://news.test/passive-false', 'Issuer denies wrongdoing after supplier contract was cancelled', 90),
    revision('EVT-passive', 'https://news.test/passive-real', 'Issuer says supplier contract cancellation was withdrawn', 40),
    revision('EVT-nominal', 'https://news.test/nominal-false', 'Issuer denies reports of wrongdoing after supplier cancellation', 89),
    revision('EVT-nominal', 'https://news.test/nominal-real', 'Issuer denies supplier cancellation', 39),
    revision('EVT-direct', 'https://news.test/direct-cancel', 'Issuer AGM cancelled', 88),
    revision('EVT-direct', 'https://news.test/direct-restore', 'Issuer denies AGM cancellation', 38),
    revision('EVT-decision', 'https://news.test/decision-cancel', 'Issuer plans to cancel AGM', 87),
    revision('EVT-decision', 'https://news.test/decision-restore', 'Issuer reverses decision to cancel AGM', 37),
    revision('EVT-postpone', 'https://news.test/postponed', 'Issuer postpones AGM', 86),
    revision('EVT-postpone', 'https://news.test/postpone-restore', 'Issuer cancels postponement of AGM', 36),
    revision('EVT-coordinated', 'https://news.test/coordinated-false', 'Issuer denies wrongdoing and says supplier contract was cancelled', 85),
    revision('EVT-coordinated', 'https://news.test/coordinated-real', 'Issuer says supplier contract cancellation was withdrawn', 35),
    revision('EVT-contraction', 'https://news.test/contraction-cancel', 'Issuer AGM cancelled', 84),
    revision('EVT-contraction', 'https://news.test/contraction-restore', "Issuer says AGM hasn't been cancelled", 34),
    revision('EVT-purpose', 'https://news.test/purpose-false', 'Issuer cancels AGM to avoid delays', 83),
    revision('EVT-purpose', 'https://news.test/purpose-real', 'Issuer says AGM will proceed as scheduled', 33),
    revision('EVT-coordinate', 'https://news.test/coordinate-cancel', 'Issuer AGM and EGM cancelled', 82),
    revision('EVT-coordinate', 'https://news.test/coordinate-restore', 'Issuer denies reports that AGM and EGM were cancelled', 32),
  ]
  mergeInbox(root, date, rows, { maxRows: 30 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.headline)),
    new Set(rows.map((row) => row.headline)),
    'a higher-score unrelated denial cannot occupy the restoration lane or suppress the real update',
  )
})

await check('mergeInbox never collapses cancelled, postponed, or corrective-restoration updates', () => {
  const root = tmp()
  const date = '2026-06-12'
  const revision = (group: string, url: string, headline: string, score: number): TriagedItem => ({
    ...triagedItem(url, score, headline),
    dedup_group: group,
  })
  mergeInbox(root, date, [
    revision('EVT-cancel', 'https://filing.test/agm-original', 'Issuer confirms AGM for September 9', 99),
    revision('EVT-cancel', 'https://news.test/agm-cancelled', 'Issuer AGM cancelled', 70),
    revision('EVT-cancel', 'https://news.test/agm-restored', 'Issuer denies AGM was cancelled', 60),
    revision('EVT-postpone', 'https://filing.test/results-original', 'Issuer confirms results for September 10', 98),
    revision('EVT-postpone', 'https://news.test/results-postponed', 'Issuer results have been postponed', 69),
    revision('EVT-guidance', 'https://filing.test/guidance-original', 'Issuer confirms full-year guidance', 97),
    revision('EVT-guidance', 'https://news.test/guidance-withdrawn', 'Issuer withdrew full-year guidance', 59),
    revision('EVT-accounts', 'https://filing.test/accounts-original', 'Issuer publishes annual accounts', 96),
    revision('EVT-accounts', 'https://news.test/accounts-restated', 'Issuer files annual-account restatements', 58),
    revision('EVT-delay', 'https://filing.test/delay-original', 'Issuer confirms AGM for September 12', 95),
    revision('EVT-delay', 'https://news.test/delay', 'Issuer delays AGM', 57),
    revision('EVT-delay', 'https://news.test/delay-restored', 'Issuer says AGM will not be delayed', 47),
    revision('EVT-denial', 'https://filing.test/dispute-original', 'Issuer reports supplier dispute', 94),
    revision('EVT-denial', 'https://news.test/unrelated-denial', 'Issuer denies wrongdoing after supplier cancelled contract', 56),
    revision('EVT-denial', 'https://news.test/contract-restored', 'Issuer says supplier contract cancellation was withdrawn', 46),
  ], { maxRows: 20 })

  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.deepEqual(
    new Set(doc.rows.map((row: any) => row.headline)),
    new Set([
      'Issuer confirms AGM for September 9',
      'Issuer AGM cancelled',
      'Issuer denies AGM was cancelled',
      'Issuer confirms results for September 10',
      'Issuer results have been postponed',
      'Issuer confirms full-year guidance',
      'Issuer withdrew full-year guidance',
      'Issuer publishes annual accounts',
      'Issuer files annual-account restatements',
      'Issuer confirms AGM for September 12',
      'Issuer delays AGM',
      'Issuer says AGM will not be delayed',
      'Issuer reports supplier dispute',
      'Issuer denies wrongdoing after supplier cancelled contract',
      'Issuer says supplier contract cancellation was withdrawn',
    ]),
    'lower-score thesis-falsifying updates and their corrective restoration remain visible beside the original',
  )
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
    if (gdeltQueryHasDomain(u, 'reuters.com')) return res({ articles: [
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
    if (gdeltQueryHasDomain(u, 'reuters.com')) return res({ articles: [
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

await check('runIngestCycle threads its abort into Themes before provider admission', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  const themeNow = new Date('2026-06-12T09:00:00Z')
  const company = (name: string, ticker: string) => ({ name, ticker, listing_country: 'US' })
  const views: ThemeItemView[] = [
    {
      event_id: 'EVT-theme-abort-a', dedup_group: 'STORY-theme-abort-a',
      headline: 'Alpha capacity shortage raises supplier orders', found_at: '2026-06-12T08:00:00Z',
      companies: [company('Alpha', 'ALPH')], event_types: ['operations'], issuer_linkage: 'primary',
      triage_score: 80, source_tier: 'news', source_name: 'Synthetic Wire', url: 'https://example.test/theme-abort-a',
    },
    {
      event_id: 'EVT-theme-abort-b', dedup_group: 'STORY-theme-abort-b',
      headline: 'Beta capacity shortage raises supplier orders', found_at: '2026-06-12T08:01:00Z',
      companies: [company('Beta', 'BETA')], event_types: ['operations'], issuer_linkage: 'primary',
      triage_score: 79, source_tier: 'news', source_name: 'Synthetic Wire', url: 'https://example.test/theme-abort-b',
    },
    {
      event_id: 'EVT-theme-abort-c', dedup_group: 'STORY-theme-abort-c',
      headline: 'Alpha and Beta capacity shortage persists', found_at: '2026-06-12T08:02:00Z',
      companies: [company('Alpha', 'ALPH'), company('Beta', 'BETA')], event_types: ['operations'], issuer_linkage: 'primary',
      triage_score: 78, source_tier: 'news', source_name: 'Synthetic Wire', url: 'https://example.test/theme-abort-c',
    },
  ]
  const theme = createTheme(views, themeNow)
  appendThemeMutations(root, [theme], () => themeNow)
  let providerCalls = 0
  const fetchFn = (async () => {
    providerCalls++
    throw new Error('pre-aborted Themes must never call a provider')
  }) as unknown as typeof fetch
  await runIngestCycle({
    repoRoot: root, stateDir: state, skipFetch: true, fetchFn, sleep: noSleep,
    now: () => new Date('2026-06-12T09:30:00Z'), signal: AbortSignal.abort(),
    config: {
      groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqRpm: 6000,
      themesEnabled: true, themesMinScore: 0, themesDiscoverEveryCycles: 9999, themesDiscoverModel: 'groq',
      anthropicFallbackEnabled: false,
    } as any,
  })
  assert.equal(providerCalls, 0, 'the cycle abort reaches makeThemeNamer before its provider seam')
  assert.equal(fs.existsSync(path.join(state, 'groq-budget.json')), false, 'Themes creates no provider reservation after parent abort')
  assert.equal(readCooldownUntil(state, 'groq'), 0)
  assert.equal(readCooldownUntil(state, 'themes:groq'), 0)
  const persisted = loadThemes(root).find((candidate) => candidate.theme_id === theme.theme_id)
  assert.equal(persisted?.validation_attempted_at, undefined, 'cancelled validation remains queued, not falsely attempted')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
})

await check('runIngestCycle: an abort during the first provider stops fallback burn and defers the batch', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp(), controller = new AbortController()
  let gdeltServed = false, groqCalls = 0, overflowCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq.test')) {
      groqCalls++
      controller.abort()
      throw new DOMException('Aborted', 'AbortError')
    }
    if (u.includes('overflow.test')) { overflowCalls++; throw new Error('fallback must not run after abort') }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/abort-mid-provider', title: 'Central bank emergency rate cut changes funding costs', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'), signal: controller.signal,
    config: {
      groqApiKey: 'k', groqBaseUrl: 'https://groq.test', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
      rssEnabled: false, themesEnabled: false, anthropicFallbackEnabled: false,
      overflowProviders: [{ id: 'overflow', label: 'Overflow', color: '--x', apiKey: 'k', baseUrl: 'https://overflow.test/v1', model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 10, budgetFile: 'overflow-budget.json' }],
    } as any,
  })
  assert.equal(groqCalls, 1)
  assert.equal(overflowCalls, 0, 'an aborted request does not walk the rest of the provider chain')
  assert.equal(summary.aborted, true)
  assert.equal(summary.provider_attempts?.groq, 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1)
  assert.equal(readCooldownUntil(state, 'groq'), 0, 'caller abort is not a provider outage')
})

await check('runIngestCycle: Anthropic API receives the cycle signal, never retries an abort, and counts one request', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp(), controller = new AbortController()
  let gdeltServed = false, anthropicCalls = 0, reservedUsd = 0
  const fetchFn = (async (url: string, init?: RequestInit) => {
    const u = String(url)
    if (u.includes('anthropic.test')) {
      anthropicCalls++
      const inFlight = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
      assert.ok(inFlight.usd > 0, 'the conservative API dollar bound is durably charged before fetch')
      reservedUsd = inFlight.usd
      assert.equal(Object.keys(inFlight.reservations || {}).length, 1)
      assert.ok(init?.signal, 'the paid API request receives a composed cycle/timeout signal')
      controller.abort(new DOMException('cycle ended', 'AbortError'))
      throw (init!.signal as AbortSignal).reason
    }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/abort-anthropic', title: 'Central bank emergency rate cut changes funding costs', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'), signal: controller.signal,
    config: {
      groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
      rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
      anthropicFallbackEnabled: true, anthropicFallbackMode: 'api', anthropicApiKey: 'k',
      anthropicBaseUrl: 'https://anthropic.test', anthropicRpm: 6000, anthropicMinPriority: 0,
    } as any,
  })
  assert.equal(anthropicCalls, 1, 'the cancelled paid request is never retried')
  assert.equal(summary.anthropic_requests, 1, 'one fetch invocation is reported once, not double-counted in catch')
  assert.equal(summary.provider_attempts?.['anthropic-triage'], 1)
  assert.equal(summary.aborted, true)
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1)
  const reconciled = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(reconciled.usd, reservedUsd, 'an in-flight abort keeps the conservative bound because actual cost is unknown')
  assert.ok(Math.abs((summary.anthropic_cost_usd || 0) - reservedUsd) < 0.00005,
    'the four-decimal cycle summary reports the same conservative charge as the hard ledger')
  assert.equal(Object.keys(reconciled.reservations || {}).length, 0)
  assert.equal(readCooldownUntil(state, 'anthropic-triage'), 0, 'caller abort is not an Anthropic outage')
})

await check('runIngestCycle: Anthropic API reconciles only positively known usage; missing/zero usage keeps the bound', async () => {
  const runCase = async (label: string, usage?: { input_tokens: number; output_tokens: number }) => {
    resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
    const root = tmp(), state = tmp()
    let gdeltServed = false, reservedUsd = 0
    const fetchFn = (async (url: string) => {
      const u = String(url)
      if (u.includes('anthropic.test')) {
        const inFlight = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
        reservedUsd = inFlight.usd
        return res({
          content: [{ type: 'text', text: JSON.stringify({ items: [{
            i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'],
            issuer_linkage: 'macro', why: `${label} usage reconciliation`, companies: [], size_bucket: 'unknown',
          }] }) }],
          ...(usage ? { usage } : {}), stop_reason: 'end_turn',
        })
      }
      if (u.includes('gdelt') && !gdeltServed) {
        gdeltServed = true
        return res({ articles: [{ url: `https://reuters.com/anthropic-usage-${label}`, title: 'Central bank changes rates in an off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
      }
      return res({ articles: [] })
    }) as unknown as typeof fetch
    const summary = await runIngestCycle({
      repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'),
      config: {
        groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
        rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
        anthropicFallbackEnabled: true, anthropicFallbackMode: 'api', anthropicApiKey: 'k',
        anthropicBaseUrl: 'https://anthropic.test', anthropicRpm: 6000, anthropicMinPriority: 0,
        anthropicInPricePerMTok: 1, anthropicOutPricePerMTok: 5,
      } as any,
    })
    const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
    assert.equal(Object.keys(ledger.reservations || {}).length, 0, `${label}: completed admission is finalized`)
    return { summary, ledger, reservedUsd }
  }

  const unknown = await runCase('missing')
  assert.ok(unknown.reservedUsd > 0)
  assert.equal(unknown.ledger.usd, unknown.reservedUsd, 'missing usage cannot refund a dispatched request to $0')
  assert.ok(Math.abs((unknown.summary.anthropic_cost_usd || 0) - unknown.reservedUsd) < 0.00005,
    'the four-decimal cycle summary keeps the conservative unknown-usage charge')

  const zero = await runCase('zero', { input_tokens: 0, output_tokens: 0 })
  assert.ok(zero.reservedUsd > 0)
  assert.equal(zero.ledger.usd, zero.reservedUsd, 'zero-total usage cannot refund a dispatched request to $0')
  assert.ok(Math.abs((zero.summary.anthropic_cost_usd || 0) - zero.reservedUsd) < 0.00005,
    'the cycle summary keeps the conservative charge for unusable zero-total telemetry')

  const known = await runCase('known', { input_tokens: 100, output_tokens: 20 })
  const exact = (100 * 1 + 20 * 5) / 1_000_000
  assert.ok(known.reservedUsd > exact, 'the conservative reservation is larger than this reported actual')
  assert.ok(Math.abs(known.ledger.usd - exact) < 1e-12, `known usage ledger ${known.ledger.usd}`)
  assert.ok(Math.abs((known.summary.anthropic_cost_usd || 0) - exact) < 1e-12)
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
  assert.equal(empty.source_is_english, undefined, 'omitted language keys are unknown, not proven English')
  assert.equal(coerceTriage({ headline_en: null, headline_lang: null }).source_is_english, true,
    'the explicit model-contract null pair positively identifies an already-English source')
  assert.equal(coerceTriage({ headline_en: null }).source_is_english, undefined,
    'a partial/malformed language response cannot open a human-veto exception')
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
    if (gdeltQueryHasDomain(u, 'reuters.com')) return res({ articles: [
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

await check('runIngestCycle keeps exact revision clocks across daily partitions when the replay is capped out', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const root = tmp()
  const state = tmp()
  const priorDate = '2026-08-03'
  const date = '2026-08-04'
  const url = 'https://reuters.com/acme-capacity-live'
  const headline = 'Acme capacity expansion approval remains active'
  const eventId = eventIdFor(headline, url)
  const company = { name: 'Acme', ticker: 'ACME', listing_country: 'US' }
  const crowdUrl = 'https://reuters.com/gamma-transformative-acquisition'
  const crowdHeadline = 'Gamma announces transformative acquisition of a global software platform'
  const durableFoundAt = '2026-08-03T00:00:00Z'
  const durableObservedAt = '2026-08-03T00:01:00Z'

  const original: TriagedItem = {
    ...triagedItem(url, 90, headline),
    event_id: eventId,
    found_at: durableFoundAt,
    companies: [company],
    event_types: ['capex'],
    issuer_linkage: 'primary',
    dedup_group: eventId,
  }
  mergeInbox(root, priorDate, [original], {
    maxRows: 10, now: () => new Date(durableObservedAt),
  })
  const priorInboxPath = path.join(root, 'screener', 'inbox', `${priorDate}_sweep.json`)
  mergeInbox(root, priorDate, [{
    ...triagedItem('https://reuters.com/prior-day-crowd', 99, 'Gamma closes transformative acquisition'),
    found_at: '2026-08-03T00:04:00Z',
  }], { maxRows: 1, now: () => new Date('2026-08-03T00:05:00Z') })
  const priorSweep = JSON.parse(fs.readFileSync(priorInboxPath, 'utf8'))
  assert.equal(priorSweep.rows.length, 1)
  assert.notEqual(priorSweep.rows[0].url, url, 'the original observation is evicted from the visible prior-day rows')
  assert.ok(priorSweep.revision_clocks.some((row: any) => row.event_id === eventId),
    'the uncapped wrapper index retains the original clocks after row eviction')

  const themeViews: ThemeItemView[] = [
    {
      event_id: 'EVT-acme-theme-seed', dedup_group: 'STORY-acme-theme-seed',
      headline: 'Acme capacity expansion increases supplier orders', found_at: '2026-08-03T23:00:00Z',
      companies: [company], event_types: ['capex'], issuer_linkage: 'primary', triage_score: 88,
      source_tier: 'company', source_name: 'Acme', url: 'https://company.test/acme-capacity-seed',
      region: 'US', country: 'US',
    },
    {
      event_id: 'EVT-beta-theme-seed', dedup_group: 'STORY-beta-theme-seed',
      headline: 'Beta capacity expansion increases supplier orders', found_at: '2026-08-03T23:01:00Z',
      companies: [{ name: 'Beta', ticker: 'BETA', listing_country: 'US' }], event_types: ['capex'],
      issuer_linkage: 'primary', triage_score: 86, source_tier: 'company', source_name: 'Beta',
      url: 'https://company.test/beta-capacity-seed', region: 'US', country: 'US',
    },
  ]
  const theme = attachValidNarrative(createTheme(themeViews, new Date('2026-08-03T23:05:00Z'), 'claude'), {
    anchor_terms: ['capacity', 'expansion'],
    validated_at: '2026-08-03T23:05:00Z',
  })
  theme.name = 'Capacity Expansion Increases Supplier Orders'
  theme.description = 'Capacity expansion is increasing orders for directly exposed suppliers.'
  appendThemeMutations(root, [theme], () => new Date('2026-08-03T23:06:00Z'))

  const triageReply = {
    usage: { total_tokens: 120 },
    choices: [{ message: { content: JSON.stringify({ items: [{
      i: 0, relevance: 'material', materiality_pre_score: 99, event_types: ['mna'],
      issuer_linkage: 'primary', why: 'The acquisition is a larger new event.',
      companies: [{ name: 'Gamma', ticker: 'GAMM', listing_country: 'US' }], size_bucket: 'large',
    }, {
      i: 1, relevance: 'material', materiality_pre_score: 45, event_types: ['capex'],
      issuer_linkage: 'primary', why: 'The approval affects Acme capacity expansion.',
      companies: [company], size_bucket: 'mid',
    }] }) } }],
  }
  const fetchFn = (async (requestUrl: string) => {
    const request = String(requestUrl)
    if (request.includes('groq')) return res(triageReply)
    const gdeltQuery = new URL(request).searchParams.get('query') ?? ''
    if (/(?:^|[()\s])domain:reuters\.com(?:[()\s]|$)/.test(gdeltQuery)) return res({ articles: [
      {
        url, title: headline, domain: 'reuters.com',
        // The exact refresh advertises a newer provider timestamp. It must not replace the source clock
        // retained outside the prior day's capped visible rows.
        seendate: '20260804T000900Z',
      },
      { url: crowdUrl, title: crowdHeadline, domain: 'reuters.com', seendate: '20260804T000930Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const now = () => new Date('2026-08-04T00:10:00Z')
  await runIngestCycle({
    repoRoot: root,
    stateDir: state,
    fetchFn,
    sleep: noSleep,
    now,
    config: {
      groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test',
      groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, inboxMaxRows: 1, themesEnabled: true,
      themesMinScore: 0, themesDiscoverEveryCycles: 9999, themesDiscoverModel: 'off',
      anthropicFallbackEnabled: false,
    } as any,
  })

  const inboxPath = path.join(root, 'screener', 'inbox', `${date}_sweep.json`)
  const currentRows = JSON.parse(fs.readFileSync(inboxPath, 'utf8')).rows
  assert.equal(currentRows.length, 1)
  assert.equal(currentRows[0].url, crowdUrl, 'the lower-ranked exact replay is absent from today\'s capped UI sweep')

  const feedRow = readFeed(root, 1, { now, applyActiveWeights: false }).items.find((row) => row.event_id === eventId)
  assert.equal(feedRow?.found_at, durableFoundAt, 'even a capped-out replay cannot publish as newer feed evidence')
  assert.equal(feedRow?.observed_at, durableObservedAt)
  assert.equal(feedRow?.source_is_english, undefined, 'the firehose follows the durable inbox language proof')

  const persistedMember = loadThemes(root)
    .find((candidate) => candidate.theme_id === theme.theme_id)?.members
    .find((member) => member.event_id === eventId)
  assert.equal(Date.parse(persistedMember!.found_at), Date.parse(durableFoundAt), 'Theme freshness stays bound to the acted-on source clock')
  assert.equal(Date.parse(persistedMember!.observed_at!), Date.parse(durableObservedAt), 'Theme ordering uses the matching durable first-seen clock')
  assert.equal(persistedMember!.source_is_english, undefined, 'Theme evidence cannot upgrade legacy source-language certainty')
  fs.rmSync(root, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
})

await check('appendFeedItems honors the daily cap; readFeed skips corrupt lines', () => {
  const root = tmp()
  const mk = (n: number): FeedItem => ({
    kind: 'item', ts: `2026-06-12T09:0${n}:00Z`, event_id: `EVT-${n}`, headline: `h${n}`, url: `https://reuters.com/${n}`,
    domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline',
    triage_score: 50, band: 'watch', triage_reason: '', relevance: 'relevant_non_material', event_types: [],
    issuer_linkage: 'sector', companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: true,
  })
  assert.deepEqual(
    appendFeedItems(root, '2026-06-12', [mk(1), mk(2), mk(3)], 2),
    { status: 'cap', written: 2, unwritten: 1 },
  ) // partial cap: exact confirmed prefix
  assert.deepEqual(
    appendFeedItems(root, '2026-06-12', [mk(4)], 2),
    { status: 'cap', written: 0, unwritten: 1 },
  ) // full cap: nothing is claimed durable
  assert.deepEqual(
    appendFeedItems(root, '2026-06-13', [mk(4)], 2),
    { status: 'complete', written: 1, unwritten: 0 },
  ) // complete: the whole batch is durably acknowledged
  fs.appendFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'NOT JSON\n')
  const { items } = readFeed(root, 1, { now: () => new Date('2026-06-12T10:00:00Z') })
  assert.equal(items.length, 2) // corrupt line skipped, capped writes honored
})

await check('appendFeedItems reports a deterministic I/O failure instead of masquerading as a cap', () => {
  const root = tmp()
  const date = '2026-06-12'
  const fp = path.join(root, 'screener', 'inbox', `${date}_firehose.ndjson`)
  fs.mkdirSync(fp, { recursive: true }) // a directory at the file path makes the count/read fail on every OS
  const item: FeedItem = {
    kind: 'item', ts: `${date}T09:00:00Z`, event_id: 'EVT-io', headline: 'Feed persistence test',
    url: 'https://reuters.com/io', domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt',
    region: 'GLOBAL', input_nature: 'news_headline', triage_score: 10, band: 'drop',
    triage_reason: 'test', relevance: 'irrelevant', event_types: [], issuer_linkage: 'sector',
    companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: false,
  }
  assert.deepEqual(
    appendFeedItems(root, date, [item], 10),
    { status: 'io_failure', written: 0, unwritten: 1 },
  )
})

type FeedBoundaryCase = 'partial-cap' | 'full-cap' | 'io-failure'

async function runFeedBoundaryCase(kind: FeedBoundaryCase) {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const date = '2026-08-21'
  const originalRows: NewsItem[] = Array.from({ length: 3 }, (_, i) => ({
    event_id: `EVT-feed-boundary-${i}`,
    headline: `Weekend column discusses ordinary market atmosphere number ${i}`,
    url: `https://reuters.com/feed-boundary-${i}`,
    domain: 'reuters.com', source_name: 'Reuters', region: 'GLOBAL', input_nature: 'news_headline',
    found_at: `2026-08-20T14:0${i}:00Z`, deferred_at: `2026-08-20T15:0${i}:00Z`,
    dedup_status: 'new', via: 'gdelt',
  }))
  fs.writeFileSync(path.join(state, 'news-deferred.json'), `${JSON.stringify(originalRows)}\n`)
  if (kind === 'io-failure') {
    fs.mkdirSync(path.join(root, 'screener', 'inbox', `${date}_firehose.ndjson`), { recursive: true })
  }
  const triage = {
    usage: { total_tokens: 180 },
    choices: [{ message: { content: JSON.stringify({ items: originalRows.map((_row, i) => ({
      i, relevance: 'irrelevant', materiality_pre_score: 1, event_types: [], issuer_linkage: 'sector',
      why: 'No decision-relevant change.', companies: [], size_bucket: 'unknown',
    })) }) } }],
  }
  const fetchFn = (async (url: string) => String(url).includes('groq') ? res(triage) : res({ articles: [] })) as unknown as typeof fetch
  const emitted: string[] = []
  const unsubscribe = newsBus.subscribe((event) => {
    if (event.type === 'news-item') emitted.push(event.item.event_id)
  })
  try {
    const summary = await runIngestCycle({
      repoRoot: root, stateDir: state, fetchFn, sleep: noSleep,
      now: () => new Date('2026-08-21T15:30:00Z'), skipFetch: true,
      config: {
        groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqRpm: 6000,
        localProvider: null, overflowProviders: [], geminiEnabled: false,
        anthropicFallbackEnabled: false, themesEnabled: false,
        feedItemsDailyCap: kind === 'partial-cap' ? 1 : kind === 'full-cap' ? 0 : 10,
      } as any,
    })
    const backlog = loadDeferred(state)
    const seenPath = path.join(state, 'news-seen.json')
    const seen = fs.existsSync(seenPath)
      ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) as Record<string, unknown>
      : {}
    const itemRows = kind === 'io-failure'
      ? []
      : readFeed(root, 1, { now: () => new Date('2026-08-21T15:30:00Z'), applyActiveWeights: false }).items
    return { root, state, summary, backlog, seen, emitted, itemRows, originalRows }
  } finally {
    unsubscribe()
  }
}

await check('runIngestCycle partial feed cap publishes/counts only the prefix and preserves the suffix clocks', async () => {
  const result = await runFeedBoundaryCase('partial-cap')
  const { summary, backlog, seen, emitted, itemRows, originalRows } = result
  assert.equal(summary.picked + summary.watched + summary.dropped, 1, 'only the one persisted row counts as scanned')
  assert.equal(summary.feed_unwritten, 2)
  assert.equal(summary.feed_write_failed, undefined)
  assert.equal(summary.defer_reason, 'feed-cap')
  assert.equal(summary.deferred, 2)
  assert.equal(summary.backlog, 2)
  assert.match(String(summary.note), /daily feed persistence cap reached/)
  assert.equal(itemRows.length, 1, 'only the confirmed prefix is in the durable wire')
  assert.deepEqual(emitted, itemRows.map((item) => item.event_id), 'SSE emits exactly the persisted prefix')
  assert.deepEqual(Object.keys(seen).sort(), emitted.slice().sort(), 'only persisted rows enter the seen cache')
  const originalClock = new Map(originalRows.map((row) => [row.event_id, row.deferred_at]))
  assert.equal(backlog.length, 2)
  for (const row of backlog) assert.equal(row.deferred_at, originalClock.get(row.event_id), `${row.event_id} keeps its original residence clock`)
})

await check('runIngestCycle full feed cap reports zero progress and durably queues every scored row', async () => {
  const { summary, backlog, seen, emitted, itemRows, originalRows } = await runFeedBoundaryCase('full-cap')
  assert.equal(summary.picked + summary.watched + summary.dropped, 0)
  assert.equal(summary.feed_unwritten, 3)
  assert.equal(summary.feed_write_failed, undefined)
  assert.equal(summary.defer_reason, 'feed-cap')
  assert.equal(summary.deferred, 3)
  assert.equal(summary.backlog, 3)
  assert.equal(itemRows.length, 0)
  assert.deepEqual(emitted, [])
  assert.deepEqual(Object.keys(seen), [])
  const originalClock = new Map(originalRows.map((row) => [row.event_id, row.deferred_at]))
  assert.equal(backlog.length, 3)
  for (const row of backlog) assert.equal(row.deferred_at, originalClock.get(row.event_id))
})

await check('runIngestCycle feed I/O failure is distinct, reports zero progress, and queues every row unseen', async () => {
  const { summary, backlog, seen, emitted, originalRows } = await runFeedBoundaryCase('io-failure')
  assert.equal(summary.picked + summary.watched + summary.dropped, 0)
  assert.equal(summary.feed_unwritten, 3)
  assert.equal(summary.feed_write_failed, true)
  assert.equal(summary.defer_reason, 'feed-write-failed')
  assert.equal(summary.deferred, 3)
  assert.equal(summary.backlog, 3)
  assert.match(String(summary.note), /feed persistence write failed/)
  assert.deepEqual(emitted, [])
  assert.deepEqual(Object.keys(seen), [])
  const originalClock = new Map(originalRows.map((row) => [row.event_id, row.deferred_at]))
  assert.equal(backlog.length, 3)
  for (const row of backlog) assert.equal(row.deferred_at, originalClock.get(row.event_id))
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

await check('LOCAL telemetry lock contention cannot throw away an already-scored one-shot item', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const ready = path.join(state, 'local-lock-ready')
  const lockFile = path.join(state, 'local-budget.json.lock')
  const holder = spawn('python3', ['-c', [
    'import fcntl, sys, time',
    'f = open(sys.argv[1], "a+")',
    'fcntl.flock(f.fileno(), fcntl.LOCK_EX)',
    'open(sys.argv[2], "w").write("ready")',
    'time.sleep(8)',
  ].join('\n'), lockFile, ready])
  const deadline = Date.now() + 5_000
  while (!fs.existsSync(ready)) {
    if (Date.now() >= deadline) throw new Error('local budget lock holder did not become ready')
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  let gdeltServed = false
  const localTriage = { usage: { total_tokens: 512 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('local.test')) return res(localTriage)
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/local-lock', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  try {
    const summary = await runIngestCycle({
      repoRoot: root, stateDir: state, fetchFn, sleep: noSleep,
      now: () => new Date('2026-06-12T09:30:00Z'),
      config: { groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, anthropicFallbackEnabled: false, localProvider: localCfg() } as any,
    })
    assert.equal(summary.picked, 1, 'the successful local score survives telemetry contention')
    assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 0)
    const inbox = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
    assert.ok(inbox.rows.some((row: any) => row.url === 'https://reuters.com/local-lock'))
  } finally {
    holder.kill('SIGKILL')
    await new Promise<void>((resolve) => holder.once('close', () => resolve()))
  }
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
    if (u.includes('cerebras.test')) {
      cbHits++
      return { ...res('busy', 503), headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '9' : null } }
    } // 1st overflow: NON-terminal fail (no budget exhaust)
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
  assert.equal(readCooldownUntil(state, 'cerebras'), Date.parse('2026-06-12T09:30:09Z'), '503 Retry-After is authoritative instead of becoming a 5→60 minute exponential hold')
})

await check('finite free tiers share backlog work by clock deficit instead of fixed first-provider order', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  let gdeltServed = false
  const hits = { a: 0, b: 0 }
  const good = { usage: { total_tokens: 120 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('a.test')) { hits.a++; return res(good) }
    if (u.includes('b.test')) { hits.b++; return res(good) }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: Array.from({ length: 4 }, (_, i) => ({
        url: `https://reuters.com/fair-${i}`,
        title: `Central bank policy decision number ${i} materially changes funding costs`,
        domain: 'reuters.com', seendate: `20260612T12000${i}Z`,
      })) })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const provider = (id: 'a' | 'b') => ({ id, label: id.toUpperCase(), color: '--x', apiKey: 'k', baseUrl: `https://${id}.test/v1`, model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 10, budgetFile: `${id}-budget.json` })
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T12:00:00Z'),
    config: { groqApiKey: 'k', groqDailyReqCap: 0, gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, triageBatch: 1, geminiEnabled: false, anthropicFallbackEnabled: false, freeProviderPaceFloorFrac: 0, overflowProviders: [provider('a'), provider('b')] } as any,
  })
  assert.deepEqual(hits, { a: 2, b: 2 }, 'the second allowance catches up after the first provider gets one batch')
  assert.equal(summary.picked, 4)
  assert.deepEqual(summary.provider_attempts, { a: 2, b: 2 })
  assert.deepEqual(summary.provider_scored_batches, { a: 2, b: 2 })
})

await check('finite-pool admission is rechecked after the limiter so another workload cannot steal its released unit', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  const at = Date.parse('2026-06-12T12:00:00Z')
  // Prime A's shared request gap. While the router waits for that slot, simulate an article/Ideas caller
  // consuming A's sole clock-released request. The router must reselect B, not spend A ahead of schedule.
  assert.equal(await getNamedLimiter('paced-race-a', 60, 0).acquire(0, noSleep, () => at), true)
  let gdeltServed = false, allowanceStolen = false
  const hits = { a: 0, b: 0 }
  const good = { usage: { total_tokens: 120 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('race-a.test')) { hits.a++; return res(good) }
    if (u.includes('race-b.test')) { hits.b++; return res(good) }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/paced-race', title: 'Central bank policy decision materially changes funding costs', domain: 'reuters.com', seendate: '20260612T120000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const sleep = async () => {
    if (allowanceStolen) return
    allowanceStolen = true
    const competing = Budget.load(state, 2, 50_000_000, at, 'paced-race-a-budget.json')
    competing.record(1, 0)
    competing.save()
  }
  const provider = (id: 'a' | 'b') => ({
    id: `paced-race-${id}`, label: id.toUpperCase(), color: '--x', apiKey: 'k', baseUrl: `https://race-${id}.test/v1`,
    model: 'm', maxTokens: 900, rpm: id === 'a' ? 60 : 6000, dailyReqCap: 2,
    budgetFile: `paced-race-${id}-budget.json`, paceFloorFrac: 0,
  })
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep, now: () => new Date(at),
    config: { groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40, gdeltChunkGapMs: 0, rssEnabled: false, themesEnabled: false, triageBatch: 1, geminiEnabled: false, anthropicFallbackEnabled: false, freeProviderPaceFloorFrac: 0, overflowProviders: [provider('a'), provider('b')] } as any,
  })
  assert.equal(allowanceStolen, true)
  assert.deepEqual(hits, { a: 0, b: 1 }, 'A is rechecked after waiting and the still-released B tier scores instead')
  assert.equal(summary.picked, 1)
  assert.equal(Budget.load(state, 2, 50_000_000, at, 'paced-race-a-budget.json').requests, 1)
})

await check('finite pool falls through when the selected route cannot persist its reservation', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  // A directory at the ledger pathname makes the atomic temp-file rename fail with EISDIR. The soft
  // canSpend hint still sees an empty allowance, so a router that merely retries null reservations will
  // select this first route forever and never reach the healthy second provider.
  fs.mkdirSync(path.join(state, 'broken-budget.json'))
  let gdeltServed = false
  const hits = { broken: 0, healthy: 0 }
  const good = { usage: { total_tokens: 120 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('broken.test')) { hits.broken++; throw new Error('provider request must not start without a durable reservation') }
    if (u.includes('healthy.test')) { hits.healthy++; return res(good) }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/reservation-fallback',
        title: 'Central bank policy decision materially changes funding costs today',
        domain: 'reuters.com', seendate: '20260612T120000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const provider = (id: 'broken' | 'healthy') => ({
    id, label: id, color: '--x', apiKey: 'k', baseUrl: `https://${id}.test/v1`, model: 'm',
    maxTokens: 900, rpm: 60_000, dailyReqCap: 10, budgetFile: `${id}-budget.json`, paceFloorFrac: 0,
  })
  // Keep the regression bounded if the no-progress loop ever returns: yielding limiter sleeps let this
  // abort fire instead of letting repeated already-resolved awaits monopolize the microtask queue.
  const controller = new AbortController()
  const abortTimer = setTimeout(() => controller.abort(), 500)
  let summary
  try {
    summary = await runIngestCycle({
      repoRoot: root, stateDir: state, fetchFn,
      sleep: (ms) => new Promise<void>((resolve) => setTimeout(resolve, Math.min(ms, 5))),
      now: () => new Date('2026-06-12T12:00:00Z'), signal: controller.signal,
      config: {
        groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
        gdeltChunkGapMs: 0, rssEnabled: false, themesEnabled: false, triageBatch: 1,
        geminiEnabled: false, anthropicFallbackEnabled: false, freeProviderPaceFloorFrac: 0,
        overflowProviders: [provider('broken'), provider('healthy')],
      } as any,
    })
  } finally {
    clearTimeout(abortTimer)
  }
  assert.equal(controller.signal.aborted, false, 'route selection made progress instead of waiting for the abort guard')
  assert.deepEqual(hits, { broken: 0, healthy: 1 }, 'no unreserved call was sent and the healthy later route scored the batch')
  assert.equal(summary!.picked, 1)
  assert.deepEqual(summary!.provider_attempts, { healthy: 1 })
  assert.equal(readCooldownUntil(state, 'broken'), 0, 'a local ledger admission failure is not a provider outage')
  assert.equal(readCooldownUntil(state, 'triage:broken'), 0, 'a local ledger admission failure does not arm a workload hold')
})

await check('a configured overflow provider can run the ingester without a Groq key', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  let gdeltServed = false, overflowCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('overflow-only.test')) {
      overflowCalls++
      return res({ usage: { total_tokens: 120 }, choices: [{ message: { content: JSON.stringify({ items: [
        { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
      ] }) } }] })
    }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{ url: 'https://reuters.com/overflow-only', title: 'Central bank policy decision materially changes funding costs today', domain: 'reuters.com', seendate: '20260612T120000Z' }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T12:00:00Z'),
    config: {
      groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40, rssEnabled: false,
      themesEnabled: false, triageBatch: 1, geminiEnabled: false, anthropicFallbackEnabled: false,
      overflowProviders: [{ id: 'overflow-only', label: 'Overflow only', color: '--x', apiKey: 'k', baseUrl: 'https://overflow-only.test/v1', model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 10, budgetFile: 'overflow-only-budget.json' }],
    } as any,
  })
  assert.equal(overflowCalls, 1)
  assert.equal(summary.picked, 1)
  assert.doesNotMatch(summary.note || '', /idle|GROQ_API_KEY/)
})

await check('an incomplete triage batch holds only that workload and immediately falls through to a useful provider', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  let gdeltServed = false, malformedCalls = 0, healthyCalls = 0
  const good = { usage: { total_tokens: 120 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('malformed.test')) { malformedCalls++; return res({ choices: [{ message: { content: JSON.stringify({ items: [] }) } }] }) }
    if (u.includes('healthy.test')) { healthyCalls++; return res(good) }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [
        { url: 'https://reuters.com/scope-a', title: 'Central bank policy decision materially changes funding costs today', domain: 'reuters.com', seendate: '20260612T120000Z' },
        { url: 'https://reuters.com/scope-b', title: 'Government funding decision materially changes bank liquidity today', domain: 'reuters.com', seendate: '20260612T120001Z' },
      ] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const mk = (id: string, baseUrl: string) => ({ id, label: id, color: '--x', apiKey: 'k', baseUrl, model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 10, budgetFile: `${id}-budget.json` })
  const at = Date.parse('2026-06-12T12:00:00Z')
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date(at),
    config: { groqApiKey: 'k', groqDailyReqCap: 0, gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, triageBatch: 1, geminiEnabled: false, anthropicFallbackEnabled: false, overflowProviders: [mk('malformed', 'https://malformed.test/v1'), mk('healthy', 'https://healthy.test/v1')] } as any,
  })
  assert.equal(malformedCalls, 1, 'a deterministic malformed reply is not retried or re-picked this cycle')
  assert.equal(healthyCalls, 2, 'the next provider scores both batches')
  assert.equal(summary.picked, 2)
  assert.equal(readCooldownUntil(state, 'malformed'), 0, 'article/theme/idea workloads remain eligible on this provider')
  assert.ok(readCooldownUntil(state, 'triage:malformed') > at, 'only triage is held after its unusable response')
})

await check('triage request Retry-After and workload timeout stay triage-scoped while the next provider scores', async () => {
  const cases: Array<{ id: string; failure: () => Promise<any>; exactUntil?: number }> = [
    {
      id: 'request-retry',
      failure: async () => ({
        ...res('private rejected-request detail', 400),
        headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '25' : null },
      }),
      exactUntil: 25_000,
    },
    {
      id: 'workload-timeout',
      failure: async () => { const e = new Error('private socket detail'); e.name = 'TimeoutError'; throw e },
    },
  ]
  const at = Date.parse('2026-06-12T12:00:00Z')
  for (const c of cases) {
    resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
    const root = tmp(), state = tmp()
    let gdeltServed = false, healthyCalls = 0
    const good = { usage: { total_tokens: 120 }, choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
    ] }) } }] }
    const fetchFn = (async (url: string) => {
      const u = String(url)
      if (u.includes(`${c.id}.test`)) return c.failure()
      if (u.includes('healthy-scope.test')) { healthyCalls++; return res(good) }
      if (u.includes('gdelt') && !gdeltServed) {
        gdeltServed = true
        return res({ articles: [{ url: `https://reuters.com/${c.id}`, title: 'Central bank policy decision materially changes funding costs today', domain: 'reuters.com', seendate: '20260612T120000Z' }] })
      }
      return res({ articles: [] })
    }) as unknown as typeof fetch
    const mk = (id: string, baseUrl: string) => ({ id, label: id, color: '--x', apiKey: 'k', baseUrl, model: 'm', maxTokens: 900, rpm: 6000, dailyReqCap: 10, budgetFile: `${id}-budget.json` })
    const summary = await runIngestCycle({
      repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date(at),
      config: { groqApiKey: 'k', groqDailyReqCap: 0, gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, triageBatch: 1, geminiEnabled: false, anthropicFallbackEnabled: false, overflowProviders: [mk(c.id, `https://${c.id}.test/v1`), mk('healthy-scope', 'https://healthy-scope.test/v1')] } as any,
    })
    assert.equal(summary.picked, 1, `${c.id}: the healthy fallback scores the batch`)
    assert.equal(healthyCalls, 1, `${c.id}: the chain falls through in the same cycle`)
    assert.equal(readCooldownUntil(state, c.id), 0, `${c.id}: other workloads remain eligible`)
    const scopedUntil = readCooldownUntil(state, `triage:${c.id}`)
    assert.ok(scopedUntil > at, `${c.id}: triage alone is held`)
    if (c.exactUntil) assert.equal(scopedUntil, at + c.exactUntil, `${c.id}: Retry-After stays exact on the triage circuit`)
  }
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
    geminiEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false } as any // isolate Groq: real developer keys must not leak extra tiers into this test
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)
  const groqReq = () => { try { return Number(JSON.parse(fs.readFileSync(path.join(state, 'groq-budget.json'), 'utf8')).requests) || 0 } catch { return 0 } }

  // cycle 1: Groq down → it IS probed once, then the router gives another provider the batch rather than
  // sleeping inside a second attempt; the failure
  // arms the outage marker
  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.picked + s1.watched + s1.dropped, 0) // nothing scored — Groq was down
  assert.equal(groqCalls, 1, 'cycle 1 probes the down Groq once, then releases the cycle to fallbacks')
  const burnedAfter1 = groqReq()
  assert.ok(burnedAfter1 >= 1, 'the failed probe was charged to the daily request budget')
  assert.ok(fs.existsSync(path.join(state, 'groq-health.json')), 'the failure armed the cross-cycle cooldown marker')
  assert.ok(JSON.parse(fs.readFileSync(path.join(state, 'groq-health.json'), 'utf8')).unhealthyUntil > nowMs, 'the marker holds a future unhealthy-until timestamp')

  // cycle 2: STILL inside the cooldown window (clock unchanged) → Groq is NOT probed at all. THE FIX.
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.candidates, 1, 'the item IS in the triage queue this cycle (so "no Groq call" is the cooldown, not "nothing to score")')
  assert.equal(groqCalls, 1, 'THE FIX: cycle 2 made NO Groq call while retry-held (was 1, still 1)')
  assert.equal(groqReq(), burnedAfter1, 'and so it burned NO more of the daily request cap')
  assert.match(s2.note || '', /retries held|retry window/i) // engine retry hold, never a bogus provider-quota "cooling" claim
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'the item is still safely deferred (never lost)')

  // cycle 3: clock steps PAST the cooldown AND Groq has recovered → it re-probes once, scores the spillover,
  // and clears the marker. Recovery is bounded by the window, never blocked by it.
  groqUp = true
  nowMs += 7 * 60_000 // step past the 5-min cooldown armed by cycle 1
  const s3 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(groqCalls, 2, 'cycle 3 re-probes the recovered Groq exactly once after the window lapsed')
  assert.equal(s3.picked, 1, 'the deferred item scores as soon as Groq is healthy again')
  assert.equal(fs.existsSync(path.join(state, 'groq-health.json')), false, 'a successful probe cleared the cooldown marker')
})

await check('a provider hold armed after batch one prevents batch two from dispatching in the same cycle', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const nowMs = Date.parse('2026-06-12T09:30:00Z')
  const goodGroq = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  let gdeltServed = false
  let groqCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) {
      groqCalls++
      if (groqCalls === 1) armCooldown(state, nowMs, 60_000, 'groq', 60_000, 'availability')
      return res(goodGroq)
    }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [
        { url: 'https://reuters.com/live-hold-a', title: 'Central bank policy change materially lowers funding costs', domain: 'reuters.com', seendate: '20260612T090000Z' },
        { url: 'https://reuters.com/live-hold-b', title: 'Government policy decision materially raises sector costs', domain: 'reuters.com', seendate: '20260612T090100Z' },
      ] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date(nowMs),
    config: {
      groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqRpm: 6000,
      gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40, rssEnabled: false,
      themesEnabled: false, triageBatch: 1, geminiEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false,
    } as any,
  })
  assert.equal(groqCalls, 1, 'the second batch observes the newly armed provider hold before reservation/I/O')
  assert.equal(summary.picked, 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'the held batch is durably deferred, not skipped')
})

await check('an inbox atomic-write failure leaves a scored one-shot row retryable and unseen', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const now = () => new Date('2026-06-12T09:30:00Z')
  let gdeltServed = false
  let providerCalls = 0
  const goodGroq = { usage: { total_tokens: 200 }, choices: [{ message: { content: JSON.stringify({ items: [
    { i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'The policy change moves funding costs.', companies: [], size_bucket: 'unknown' },
  ] }) } }] }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) { providerCalls++; return res(goodGroq) }
    if (u.includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/write-retry', title: 'Central bank policy change materially lowers funding costs',
        domain: 'reuters.com', seendate: '20260612T090000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = {
    groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqRpm: 6000,
    gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40, rssEnabled: false,
    themesEnabled: false, triageBatch: 1, geminiEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false,
  } as any
  const originalRename = fs.renameSync
  ;(fs as any).renameSync = (from: string, to: string) => {
    if (String(to).endsWith('2026-06-12_sweep.json')) throw Object.assign(new Error('EPERM: injected sweep rename'), { code: 'EPERM' })
    return (originalRename as any)(from, to)
  }
  // The write failure no longer escapes: runIngestCycle's backstop REPORTS it and finishes the cycle, so
  // the wire, the summary and the backlog cleanup still run. The row's guarantees are unchanged — it is
  // withheld (never clocked), left UNSEEN, and re-queued — which is what makes the retry below work.
  let summary: Awaited<ReturnType<typeof runIngestCycle>> | null = null
  try {
    summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  } finally {
    ;(fs as any).renameSync = originalRename
  }
  assert.equal(summary?.inbox_write_failed, true, 'the refusal is reported on the summary, not thrown')
  assert.equal(summary?.inbox_withheld, 1, 'the withheld row is counted honestly')
  assert.match(String(summary?.note || ''), /held back 1 item/,
    'the operator is told what happened instead of seeing a bare 0 kept')
  assert.equal(summary?.picked, 0, 'a withheld row is not counted as kept')
  assert.equal(providerCalls, 1)
  // The cycle now COMPLETES, so the seen store is saved like any other cycle — the old
  // "file must not exist" check was really asserting that the throw aborted before the save. The
  // invariant that actually matters is unchanged and asserted directly: the withheld row is not marked
  // seen, which is exactly what lets the retry below re-deliver and re-score it.
  const seenAfter = fs.existsSync(path.join(state, 'news-seen.json'))
    ? JSON.parse(fs.readFileSync(path.join(state, 'news-seen.json'), 'utf8')) as Record<string, unknown>
    : {}
  assert.equal(
    Object.hasOwn(seenAfter, eventIdFor('Central bank policy change materially lowers funding costs', 'https://reuters.com/write-retry')),
    false, 'failed projection is not durably marked seen')
  assert.equal(loadDeferred(state).length, 1, 'the scored one-shot row is journaled before risky projection')

  const retry = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(retry.candidates, 1, 'retry comes from the durable backlog; the source delivered only once')
  assert.equal(providerCalls, 2, 'the row is actually retried instead of suppressed by Seen')
  assert.equal(retry.picked, 1)
  assert.ok(fs.existsSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json')))
  assert.equal(loadDeferred(state).length, 0)
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
  const fetchFn = (async () => {
    calls++
    return {
      ...res('private account acct-secret is rate limited', 429),
      headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '17' : null },
    }
  }) as unknown as typeof fetch
  const at = Date.parse('2026-06-12T09:30:00Z')
  const r1 = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 12_000 })
  assert.equal(calls, 1, 'the reader tries Groq once (maxAttempts:1)')
  assert.equal(r1.brief, null)
  const gb = JSON.parse(fs.readFileSync(path.join(state, 'groq-budget.json'), 'utf8'))
  assert.equal(gb.requests, 1, 'a per-MINUTE 429 records ONE request — it must NOT exhaust the whole daily budget to the cap')
  assert.ok(gb.requests < 13000, 'the daily request cap is intact (the old exhaust-on-429 slammed it to 13000, blocking recovery till midnight)')
  assert.ok(fs.existsSync(path.join(state, 'groq-health.json')), 'the 429 armed the shared cross-cycle cooldown instead')
  assert.equal(readCooldownUntil(state, 'groq'), at + 17_000, 'Retry-After sets a flat exact provider cooldown instead of an inflated exponential window')
  assert.equal(readCooldownUntil(state, 'article:groq/m'), 0, 'a real provider rate limit is shared, not article-only')
  assert.doesNotMatch(r1.note || '', /acct-secret/, 'the article result never exposes the provider body')

  // a second read while still inside the window skips Groq entirely — the heal/on-demand path no longer re-probes a down provider
  const before = calls
  const r2 = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at + 5_000, deadlineMs: at + 17_000 })
  assert.equal(calls, before, 'THE FIX (#2): a cooling-down Groq is skipped by the reader — no re-probe, no burn')
  assert.equal(r2.brief, null)
})

await check('readArticleBrief rechecks a provider hold after its limiter wait', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const state = tmp()
  const at = Date.parse('2026-06-12T09:30:00Z')
  const provider = { id: 'article-live', kind: 'openai', apiKey: 'k', baseUrl: 'https://article-live.test', model: 'm', rpm: 6000, tpm: 0, dailyReqCap: 45, dailyTokenCap: 500_000, budgetFile: 'article-live-budget.json', limiter: 'article-live' }
  const limiter = getNamedLimiter('article-live', 6000, 0)
  const originalAcquire = limiter.acquire.bind(limiter)
  ;(limiter as any).acquire = async () => {
    armCooldown(state, at, 60_000, 'article-live', 60_000, 'availability')
    return true
  }
  let calls = 0
  try {
    const result = await readArticleBrief(
      'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.',
      'RBI surprise cut', [provider] as any,
      { stateDir: state, fetchFn: (async () => { calls++; return res({}) }) as unknown as typeof fetch, sleep: noSleep, now: () => at, deadlineMs: at + 12_000 },
    )
    assert.equal(calls, 0, 'a hold learned during limiter wait blocks provider I/O')
    assert.equal(result.attempted, false)
    assert.equal(fs.existsSync(path.join(state, 'article-live-budget.json')), false, 'no stale reservation is charged')
  } finally {
    ;(limiter as any).acquire = originalAcquire
  }
})

await check('readArticleBrief: request/contract/short-timeout failures stay article-scoped; service failures stay shared', async () => {
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const at = Date.parse('2026-06-12T09:30:00Z')
  const cases: Array<{
    id: string
    fetchFn: typeof fetch
    expectedScope: 'article' | 'shared'
  }> = [
    {
      id: 'request-shape', expectedScope: 'article',
      fetchFn: (async () => ({
        ...res('private account acct-request details', 400),
        headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '25' : null },
      })) as unknown as typeof fetch,
    },
    {
      id: 'access', expectedScope: 'shared',
      fetchFn: (async () => res('private account access details', 401)) as unknown as typeof fetch,
    },
    {
      id: 'contract', expectedScope: 'article',
      fetchFn: (async () => res({ choices: [{ finish_reason: 'stop', message: { content: 'not json' } }] })) as unknown as typeof fetch,
    },
    {
      id: 'short-timeout', expectedScope: 'article',
      fetchFn: (async () => { const e = new Error('private socket detail'); e.name = 'TimeoutError'; throw e }) as unknown as typeof fetch,
    },
    {
      id: 'service', expectedScope: 'shared',
      fetchFn: (async () => res('private upstream deployment id', 503)) as unknown as typeof fetch,
    },
    {
      id: 'network', expectedScope: 'shared',
      fetchFn: (async () => { throw new Error('private DNS host detail') }) as unknown as typeof fetch,
    },
  ]

  for (const c of cases) {
    resetBudgetMemory()
    resetCooldownMemory()
    resetSharedLimiters()
    const state = tmp()
    const provider = {
      id: c.id, kind: 'openai', apiKey: 'k', baseUrl: `https://${c.id}.test`, model: 'model-a',
      rpm: 6000, tpm: 0, dailyReqCap: 45, dailyTokenCap: 500_000,
      budgetFile: `${c.id}-budget.json`, limiter: c.id,
    }
    const result = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, {
      stateDir: state, fetchFn: c.fetchFn, sleep: noSleep, now: () => at,
      deadlineMs: at + 12_000, cooldownMs: 30_000, cooldownMaxMs: 120_000,
    })
    const articleId = `article:${c.id}/model-a`
    assert.equal(readCooldownUntil(state, articleId) > at, c.expectedScope === 'article', `${c.id}: article circuit scope`)
    assert.equal(readCooldownUntil(state, c.id) > at, c.expectedScope === 'shared', `${c.id}: shared circuit scope`)
    if (c.id === 'request-shape') assert.equal(readCooldownUntil(state, articleId), at + 25_000, 'request Retry-After stays exact on the article circuit')
    assert.doesNotMatch(result.note || '', /acct-request|deployment id|DNS host|socket detail/, `${c.id}: public note is sanitized`)
    const saved = JSON.parse(fs.readFileSync(path.join(state, `${c.id}-budget.json`), 'utf8'))
    assert.equal(Boolean(saved.exhausted), false, `${c.id}: only an explicit daily-limit signal may exhaust the shared provider day`)
  }
})

await check('readArticleBrief honors Retry-After on a 503 instead of inflating it to exponential minutes', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const state = tmp()
  const at = Date.parse('2026-06-12T09:30:00Z')
  const provider = { id: 'retry-503', kind: 'openai', apiKey: 'k', baseUrl: 'https://retry.test', model: 'm', rpm: 6000, tpm: 0, dailyReqCap: 45, dailyTokenCap: 500_000, budgetFile: 'retry-503-budget.json', limiter: 'retry-503' }
  const fetchFn = (async () => ({
    ...res('private outage detail', 503),
    headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '9' : null },
  })) as unknown as typeof fetch
  await readArticleBrief(
    'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.',
    'RBI surprise cut', [provider] as any,
    { stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 12_000, cooldownMs: 300_000, cooldownMaxMs: 3_600_000 },
  )
  assert.equal(readCooldownUntil(state, 'retry-503'), at + 9_000)
  assert.equal(readCooldownUntil(state, 'article:retry-503/m'), 0, 'provider-declared availability reopening is shared, not article-contract scoped')
})

await check('readArticleBrief: a successful article response clears shared and workload-scoped markers', async () => {
  resetBudgetMemory()
  resetCooldownMemory()
  resetSharedLimiters()
  const state = tmp()
  const at = Date.parse('2026-06-12T09:30:00Z')
  const provider = {
    id: 'recovering', kind: 'openai', apiKey: 'k', baseUrl: 'https://recovering.test', model: 'model-a',
    rpm: 6000, tpm: 0, dailyReqCap: 45, dailyTokenCap: 500_000,
    budgetFile: 'recovering-budget.json', limiter: 'recovering',
  }
  const articleId = 'article:recovering/model-a'
  // Both markers have elapsed, so a recovery probe is allowed; success must delete both stale files and
  // reset both fail counters, not merely make their timestamps old.
  armCooldown(state, at - 2_000, 1_000, 'recovering', 1_000, 'availability')
  armCooldown(state, at - 2_000, 1_000, articleId, 1_000, 'article-contract')
  const content = JSON.stringify({ gist: ['The central bank cut rates by 50 basis points.'], companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector' })
  const result = await readArticleBrief(
    'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.',
    'RBI surprise cut',
    [provider] as any,
    { stateDir: state, fetchFn: (async () => res({ choices: [{ finish_reason: 'stop', message: { content } }], usage: { total_tokens: 100 } })) as unknown as typeof fetch, sleep: noSleep, now: () => at, deadlineMs: at + 12_000 },
  )
  assert.ok(result.brief)
  assert.deepEqual(cooldownInfo(state, 'recovering'), { until: 0, fails: 0 })
  assert.deepEqual(cooldownInfo(state, articleId), { until: 0, fails: 0 })
})

await check('background article healing obeys daily release schedules and falls through to released capacity', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const state = tmp()
  const at = Date.parse('2026-06-12T00:10:00Z')
  const firstBudget = Budget.load(state, 10, 500_000, at, 'first-paced-budget.json')
  firstBudget.record(1, 100); firstBudget.save() // the one whole call released this early is already used
  const provider = (id: string) => ({
    id, kind: 'openai', apiKey: 'k', baseUrl: `https://${id}.test`, model: 'm', rpm: 6000, tpm: 0,
    dailyReqCap: 10, dailyTokenCap: 500_000, budgetFile: `${id}-paced-budget.json`, limiter: id,
    paceMeter: 'requests', paceCap: 10, paceFloorFrac: 0,
  })
  const hits = { first: 0, second: 0 }
  const content = JSON.stringify({ gist: ['The central bank cut rates by 50 basis points.'], companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector' })
  const fetchFn = (async (url: string) => {
    if (String(url).includes('first.test')) hits.first++
    if (String(url).includes('second.test')) hits.second++
    return res({ choices: [{ finish_reason: 'stop', message: { content } }], usage: { total_tokens: 100 } })
  }) as unknown as typeof fetch
  const result = await readArticleBrief(
    'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.',
    'RBI surprise cut', [provider('first'), provider('second')] as any,
    { stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 12_000, paceDailyAllowances: true },
  )
  assert.ok(result.brief)
  assert.deepEqual(hits, { first: 0, second: 1 }, 'background work cannot drain the first tier past schedule and immediately uses the next released allowance')
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
  const liveNow = at + 2_000
  const r3 = await readArticleBrief(fullBody, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn: realFetch, sleep: noSleep, now: () => liveNow, deadlineMs: liveNow + 13_000, limiterWaitMs: 0 })
  assert.equal(realCalls, 1, 'repeated thin reads did not consume the shared limiter slot')
  assert.ok(r3.brief)
  assert.equal(r3.attempted, true)
})

await check('readArticleBrief: corrupt usage authority needs attention, never masquerades as a daily cap', async () => {
  resetBudgetMemory()
  const state = tmp()
  fs.writeFileSync(path.join(state, 'groq-budget.json'), '{"date":"2026-06-12","requests":')
  const provider = { id: 'groq', kind: 'openai', apiKey: 'k', baseUrl: 'https://groq.test', model: 'm', rpm: 6000, tpm: 0, dailyReqCap: 13_000, dailyTokenCap: 500_000, budgetFile: 'groq-budget.json', limiter: 'groq', maxTokens: 500 }
  let calls = 0
  const result = await readArticleBrief(
    'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slower growth across the economy.',
    'RBI surprise cut', [provider] as any,
    {
      stateDir: state,
      fetchFn: (async () => { calls++; return res({}) }) as unknown as typeof fetch,
      sleep: noSleep,
      now: () => Date.parse('2026-06-12T09:30:00Z'),
      deadlineMs: Date.parse('2026-06-12T09:30:20Z'),
    },
  )
  assert.equal(calls, 0)
  assert.match(result.note || '', /usage record needs attention/i)
  assert.doesNotMatch(result.note || '', /daily budget reached/i)
})

await check('article reservation reconciliation cannot reopen a concurrently exhausted provider day', async () => {
  resetBudgetMemory()
  resetSharedLimiters()
  const state = tmp()
  const budgetFile = 'article-exhaust-budget.json'
  const at = Date.parse('2026-06-12T09:30:00Z')
  const seeded = Budget.load(state, 5, 500_000, at, budgetFile)
  seeded.record(2, 160)
  seeded.save()
  const provider = { id: 'article-exhaust', kind: 'openai', apiKey: 'k', baseUrl: 'https://groq.test', model: 'm', rpm: 0, tpm: 0, dailyReqCap: 5, dailyTokenCap: 500_000, budgetFile, limiter: 'article-exhaust' }
  const body = 'The central bank cut rates by 50 basis points in a surprise off-cycle move, citing softer inflation and slowing growth across the economy.'
  const brief = JSON.stringify({ gist: ['The central bank cut rates by 50 basis points.'], companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector' })
  const fetchFn = (async () => {
    Budget.load(state, 5, 500_000, at, budgetFile).exhaust()
    return res({ choices: [{ finish_reason: 'stop', message: { content: brief } }], usage: { total_tokens: 100 } })
  }) as unknown as typeof fetch
  const result = await readArticleBrief(body, 'RBI surprise cut', [provider] as any, { stateDir: state, fetchFn, sleep: noSleep, now: () => at, deadlineMs: at + 20_000 })
  assert.ok(result.brief)
  const saved = JSON.parse(fs.readFileSync(path.join(state, budgetFile), 'utf8'))
  assert.equal(saved.requests, 3, 'provider-day exhaustion does not forge the configured request cap')
  assert.equal(saved.tokens, 260, 'the concurrent reservation still reconciles to actual reported usage')
  assert.equal(saved.providerDayExhausted, true, 'the provider-day reason is persisted explicitly')
  assert.equal(saved.exhausted, true, 'the rolling-deploy gate remains for older engine processes')
  const ledger = Budget.load(state, 5, 500_000, at, budgetFile)
  assert.equal(ledger.canSpend(1), false)
  assert.equal(ledger.requests, 3, 'diagnostics retain actual recorded requests')
  assert.equal(ledger.tokens, 260, 'diagnostics retain actual recorded tokens')
  assert.equal(ledger.providerDayExhausted, true)
  assert.equal(ledger.remainingRequests, 0)
  assert.equal(ledger.remainingTokens, 0)
  const nextDay = Budget.load(state, 5, 500_000, at + 26 * 60 * 60_000, budgetFile)
  assert.equal(nextDay.providerDayExhausted, false, 'the explicit provider-day marker resets with the provider day')
  assert.equal(nextDay.requests, 0)
  assert.equal(nextDay.tokens, 0)
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
await check('OmniRoute: OFF unless explicitly enabled, LAST in the cloud chain, and finitely capped', () => {
  // A self-hosted tier is the one kind that cannot prove its own existence. Every cloud sibling needs a key,
  // so the key IS the proof someone provisioned it; OmniRoute needs none, so only the flag separates "the
  // daemon is running" from "never installed". Default-on would give every box that never installed it a
  // sixth tier that refuses the connection on every cycle.
  const prevEnabled = process.env.NEWS_OMNIROUTE_ENABLED
  const prevCap = process.env.NEWS_OMNIROUTE_DAILY_REQ_CAP
  try {
    delete process.env.NEWS_OMNIROUTE_ENABLED
    assert.equal(buildOverflowProviders().some((p) => p.id === 'omniroute'), false,
      'absent unless explicitly enabled — a missing daemon must not become a failing tier')

    process.env.NEWS_OMNIROUTE_ENABLED = '1'
    const list = buildOverflowProviders()
    const om = list.find((p) => p.id === 'omniroute')
    assert.ok(om, 'the flag alone enables it — no key required')
    if (!om) throw new Error('OmniRoute provider not found')
    assert.ok(om.apiKey, 'carries a non-empty dummy key: an EMPTY key is rejected before the fetch and '
      + 'would arm a cooldown for a call that never left the process')
    assert.ok(String(om.baseUrl).includes('127.0.0.1'), 'talks to the local daemon, not a vendor')

    // LAST among the cloud tiers: it aggregates the SAME free pools the metered tiers already track, so
    // ahead of them it would double-spend quota this engine believes it is accounting for.
    const cloud = list.filter((p) => p.id !== 'local')
    const lastCloud = cloud[cloud.length - 1]
    assert.ok(lastCloud, 'cloud chain must not be empty')
    assert.equal(lastCloud.id, 'omniroute', 'OmniRoute is last in the cloud chain')

    // FINITE cap: daily-quota selection maximises deficit/cap and is scale-free, so an effectively
    // infinite cap would make this tier win every selection and starve the pools that actually work.
    assert.ok(Number.isFinite(om.dailyReqCap) && om.dailyReqCap > 0 && om.dailyReqCap < 1e6,
      `dailyReqCap must be finite and modest, got ${om.dailyReqCap}`)
  } finally {
    if (prevEnabled === undefined) delete process.env.NEWS_OMNIROUTE_ENABLED
    else process.env.NEWS_OMNIROUTE_ENABLED = prevEnabled
    if (prevCap === undefined) delete process.env.NEWS_OMNIROUTE_DAILY_REQ_CAP
    else process.env.NEWS_OMNIROUTE_DAILY_REQ_CAP = prevCap
  }
})

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
    const inFlight = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
    assert.ok(inFlight.usd > 0, 'the configured subscription per-call max is durably charged before spawn')
    assert.equal(Object.keys(inFlight.reservations || {}).length, 1)
    return {
      text: JSON.stringify({ items: [{ i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A 50 bps cut lowers funding costs.', companies: [], size_bucket: 'unknown' }] }),
      costUsd: 0.006,
      costUsdKnown: true,
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
  assert.equal(Object.keys(led.reservations || {}).length, 0, 'actual cost replaced the in-flight estimate')
})

await check('subscription retry reserves two call bounds, then records only the exact known cost', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    if (String(url).includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/subscription-retry',
        title: 'Central bank unexpectedly changes policy rates and bank funding costs',
        domain: 'reuters.com', seendate: '20260612T090000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  let cliCalls = 0
  const claudeCliRunner = async () => {
    cliCalls++
    const inFlight = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
    assert.equal(inFlight.usd, 0.20, 'both possible $0.10 calls are reserved before provider I/O')
    if (cliCalls === 1) return { text: 'not json', costUsd: 0.01, costUsdKnown: true }
    return {
      text: JSON.stringify({ items: [{ i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'A rate change moves bank funding costs.', companies: [], size_bucket: 'unknown' }] }),
      costUsd: 0.02,
      costUsdKnown: true,
    }
  }
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
    anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 0.20,
    anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0,
  } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 2, 'the exact-cost malformed first response gets one useful retry')
  assert.equal(summary.anthropic_requests, 2, 'the meter counts both provider processes')
  assert.equal(summary.picked, 1)
  assert.ok(Math.abs((summary.anthropic_cost_usd ?? 0) - 0.03) < 1e-12)
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.ok(Math.abs(ledger.usd - 0.03) < 1e-12, 'the unused part of the two-call envelope is released')
  assert.equal(ledger.calls, 2)
  assert.equal(Object.keys(ledger.reservations || {}).length, 0)
})

await check('subscription valid zero-cost telemetry keeps one conservative dispatched-call bound', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  let gdeltServed = false, cliCalls = 0, reservedUsd = 0
  const fetchFn = (async (url: string) => {
    if (String(url).includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/subscription-zero-cost',
        title: 'Central bank unexpectedly changes policy rates and bank funding costs',
        domain: 'reuters.com', seendate: '20260612T090000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const claudeCliRunner = async () => {
    cliCalls++
    reservedUsd = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8')).usd
    return {
      text: JSON.stringify({ items: [{ i: 0, relevance: 'material', materiality_pre_score: 84, event_types: ['macro_sector'], issuer_linkage: 'macro', why: 'Rate change moves bank funding costs.', companies: [], size_bucket: 'unknown' }] }),
      costUsd: 0, costUsdKnown: true,
    }
  }
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'), claudeCliRunner,
    config: {
      groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
      rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
      anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 1,
      anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0,
    } as any,
  })
  assert.equal(cliCalls, 1)
  assert.equal(summary.picked, 1)
  assert.equal(reservedUsd, 0.20, 'two attempts are admitted atomically before provider I/O')
  assert.equal(summary.anthropic_cost_usd, 0.10)
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(ledger.usd, 0.10, 'a real completion keeps one call bound but releases the unused retry')
})

await check('subscription near its daily ceiling still gets one safe call, never an unfunded retry', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  fs.mkdirSync(state, { recursive: true })
  fs.writeFileSync(path.join(state, 'anthropic-triage-budget.json'), JSON.stringify({
    date: '2026-06-12', usd: 0.05, calls: 1,
  }))
  let gdeltServed = false
  const fetchFn = (async (url: string) => {
    if (String(url).includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/subscription-one-call-left',
        title: 'Central bank unexpectedly changes policy rates and bank funding costs',
        domain: 'reuters.com', seendate: '20260612T090000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  let cliCalls = 0
  const claudeCliRunner = async () => {
    cliCalls++
    return { text: 'not json', costUsd: 0.01, costUsdKnown: true }
  }
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
    anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 0.15,
    anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0,
  } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1, 'one-call headroom remains useful')
  assert.equal(summary.picked + summary.watched + summary.dropped, 0)
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.ok(Math.abs(ledger.usd - 0.06) < 1e-12)
})

await check('subscription unknown-cost single dispatch releases the unused retry envelope', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  let gdeltServed = false
  let cliCalls = 0
  const fetchFn = (async (url: string) => {
    if (String(url).includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/subscription-unknown-one-of-two',
        title: 'Central bank unexpectedly changes policy rates and bank funding costs',
        domain: 'reuters.com', seendate: '20260612T090000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const claudeCliRunner = async () => {
    cliCalls++
    return { text: 'not json', costUsd: 0, costUsdKnown: false }
  }
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
    anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 0.20,
    anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0,
  } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1, 'unknown cost prevents the second attempt from dispatching')
  assert.equal(summary.anthropic_requests, 1)
  assert.equal(summary.anthropic_cost_usd, 0.10, 'only the one dispatched call retains its conservative bound')
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(ledger.usd, 0.10, 'the unused retry envelope is released at reconciliation')
  assert.equal(UsdBudget.load(state, 0.20, now().getTime(), 'anthropic-triage-budget.json').canSpend(0.10), true,
    'the remaining exact one-call headroom stays usable')
})

await check('subscription abort with unknown cost keeps the conservative $ reservation and closes further admission', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const controller = new AbortController()
  let gdeltServed = false
  let cliCalls = 0
  let reservedUsd = 0
  const fetchFn = (async (url: string) => {
    if (String(url).includes('gdelt') && !gdeltServed) {
      gdeltServed = true
      return res({ articles: [{
        url: 'https://reuters.com/subscription-unknown-cost',
        title: 'Central bank unexpectedly changes policy rates and bank funding costs',
        domain: 'reuters.com', seendate: '20260612T090000Z',
      }] })
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const claudeCliRunner = async () => {
    cliCalls++
    const inFlight = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
    reservedUsd = inFlight.usd
    assert.equal(Object.keys(inFlight.reservations || {}).length, 1)
    controller.abort(new DOMException('cycle ended', 'AbortError'))
    // Exact production shape when the child is cancelled before a result/total_cost_usd event arrives.
    return { text: '', costUsd: 0, costUsdKnown: false, error: 'claude cli: cycle aborted' }
  }
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
    anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 0.25,
    anthropicPerCallUsd: 0.25, anthropicRpm: 6000, anthropicMinPriority: 0,
  } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const first = await runIngestCycle({
    repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now,
    signal: controller.signal, claudeCliRunner,
  })
  assert.equal(cliCalls, 1)
  assert.equal(first.aborted, true)
  assert.equal(first.anthropic_requests, 1)
  assert.equal(first.anthropic_cost_usd, reservedUsd, 'summary reports the same conservative charge as the hard ledger')
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(ledger.usd, reservedUsd, 'unknown in-flight cost cannot refund the dispatched call to $0')
  assert.equal(ledger.usd, 0.25)
  assert.equal(Object.keys(ledger.reservations || {}).length, 0, 'the conservative charge is finalized, not left in flight')

  // The retained bound reaches this test's daily ceiling. A later cycle sees the deferred row but cannot
  // dispatch another subscription call, proving repeated unknown-cost calls cannot bypass the governor.
  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1, 'the hard daily ceiling blocks a second call after the uncertain first dispatch')
})

await check('daily $ ceiling cannot fit the next max-cost call → the tier stands down before provider I/O', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  // Leave $0.05 under the ceiling. The configured per-call maximum is $0.10, so a soft post-call ledger
  // would overshoot here; authoritative reservation must refuse before spawning the CLI.
  fs.mkdirSync(state, { recursive: true })
  fs.writeFileSync(path.join(state, 'anthropic-triage-budget.json'), JSON.stringify({ date: new Date('2026-06-12T09:30:00Z').toISOString().slice(0, 10), usd: 4.95, calls: 800 }))
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
  const claudeCliRunner = async () => { cliCalls++; return { text: '{"items":[]}', costUsd: 0.006, costUsdKnown: true } }
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 5, anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 0, 'the final $0.05 cannot admit a max-$0.10 call')
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
  const claudeCliRunner = async () => { cliCalls++; return { text: '', costUsd: 0, costUsdKnown: true, error: 'claude cli: usage limit reached — plan quota spent' } }
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

// An EXPIRED SIGN-IN is the one last-resort failure a human fixes in seconds (`claude login` on the host),
// so it must not be handled like a revoked key. It used to match the terminal-4xx branch, which force-marks
// the day's $ ledger as fully spent: the tier then stayed dark until the UTC rollover even after the sign-in
// was repaired, AND the cockpit reported the entire daily ceiling as spent when the failing calls cost $0.
// This is the regression guard for all three halves — the $ ledger, the recovery, and the honest message.
await check('expired sign-in → the $ ceiling is NOT falsely burned, and the tier RECOVERS once signed back in', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('upstream sad', 503)
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/auth', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  let cliCalls = 0
  let signedIn = false // flipped when the operator runs `claude login` on the host
  // the EXACT note the real CLI produces for an expired OAuth token (reproduced against claude 2.1.150)
  const claudeCliRunner = async () => {
    cliCalls++
    return signedIn
      ? { text: '[{"i":0,"relevance":"material","materiality_pre_score":84,"issuer_linkage":"macro","why":"a 50 bps cut lowers funding costs"}]', costUsd: 0.004, costUsdKnown: true }
      : { text: '', costUsd: 0, costUsdKnown: true, error: 'claude cli: HTTP 401 — Failed to authenticate. API Error: 401 OAuth access token has expired. Re-authenticate to continue.' }
  }
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0 } as any
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)

  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1)
  assert.equal(s1.picked + s1.watched + s1.dropped, 0, 'nothing scored — the sign-in was dead')
  assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, 'the item is kept, not lost')
  // (a) the $0 actually spent stays $0 — red on old: exhaust() wrote usd == the $5 cap
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.ok(ledger.usd < 5, `the daily ceiling must not be falsely marked spent (got usd=${ledger.usd} of 5)`)
  // (b) the state + note name the real cause and the fix — red on old: 'cooling' / "backing off after an error"
  assert.equal(s1.last_resort, 'auth-expired', "the state names the expired sign-in, not a vague 'cooling'")
  assert.match(s1.note || '', /claude login/, 'the operator is told the one command that fixes it')

  // while still signed out it must not hammer the host — the short cooldown holds the very next cycle
  nowMs += 30_000
  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 1, 'still 1 — the cooldown suppressed the re-spawn')

  // a LATER cycle keeps naming the real cause, read off the cooldown marker rather than this cycle's note
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(s2.last_resort, 'auth-expired', 'the reason survives the cycle that produced it')

  // the operator signs back in; past the short cooldown the tier re-probes and the backlog drains itself.
  // Red on old: the ledger was marked spent, so canSpend() stayed false and the tier never fired again today.
  signedIn = true
  nowMs += 61_000
  const s3 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now, claudeCliRunner })
  assert.equal(cliCalls, 2, 're-probed after the short cooldown instead of staying dark until the UTC rollover')
  assert.equal(s3.picked + s3.watched + s3.dropped, 1, 'the deferred item finally scores — recovery is automatic')
  assert.equal(readCooldownUntil(state, 'anthropic-triage'), 0, 'the marker is cleared once the tier recovers')
})

// Anthropic API failures must follow the same reason-scoped retry contract as the free providers. A normal
// 429 is a window, 503 is availability, and 401 is provider access; none proves the whole dollar day was
// spent. All three are provider-wide and an explicit 25-minute Retry-After must persist exactly — neither
// collapsed to the old 60-second transient hold nor inflated by the exponential breaker.
await check('Anthropic API 429/503/access persist an exact shared 25m hold without burning the dollar day', async () => {
  for (const c of [
    { label: 'rate limit', status: 429 },
    { label: 'availability', status: 503 },
    { label: 'access', status: 401 },
  ]) {
    resetSharedLimiters()
    resetBudgetMemory()
    resetCooldownMemory()
    const root = tmp()
    const state = tmp()
    let anthropicCalls = 0
    const fetchFn = (async (url: string) => {
      const u = String(url)
      if (u.includes('gdelt')) return res({ articles: [{ url: `https://reuters.com/anthropic-${c.status}`, title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
      if (u.includes('anthropic')) {
        anthropicCalls++
        return {
          ...res(`private account detail for ${c.label}`, c.status),
          headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '1500' : null },
        }
      }
      return res({ articles: [] })
    }) as unknown as typeof fetch
    const cfg = {
      groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
      rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
      anthropicFallbackEnabled: true, anthropicFallbackMode: 'api', anthropicApiKey: 'k', anthropicBaseUrl: 'https://api.anthropic.test',
      anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0,
    } as any
    let nowMs = Date.parse('2026-06-12T09:30:00Z')
    const now = () => new Date(nowMs)

    const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
    assert.equal(anthropicCalls, 1, `${c.label}: one paid-provider attempt`)
    assert.equal(s1.picked + s1.watched + s1.dropped, 0, `${c.label}: failed batch remains unscored`)
    assert.equal(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')).length, 1, `${c.label}: item is deferred, not lost`)
    assert.equal(readCooldownUntil(state, 'anthropic-triage'), nowMs + 1_500_000, `${c.label}: persisted provider hold is the exact 25-minute Retry-After`)
    assert.equal(readCooldownUntil(state, 'triage:anthropic-triage'), 0, `${c.label}: provider-wide evidence does not become workload-only`)
    const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
    assert.equal(ledger.exhausted, undefined, `${c.label}: no explicit daily signal, so the dollar day stays open`)
    assert.ok(ledger.usd < 5, `${c.label}: a generic HTTP failure must not falsely consume the $5 ceiling`)
    assert.doesNotMatch(s1.note || '', /private account detail/, `${c.label}: upstream account text is never exposed`)

    nowMs += 60_000
    await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
    assert.equal(anthropicCalls, 1, `${c.label}: a second cycle inside Retry-After does not re-probe or spend`)
  }
})

await check('Anthropic API request/contract/timeout failures stay on the triage workload circuit', async () => {
  for (const c of [
    { label: 'request', expectedMs: 11_000 },
    { label: 'contract', expectedMs: 60_000 },
    { label: 'timeout', expectedMs: 60_000 },
  ]) {
    resetSharedLimiters()
    resetBudgetMemory()
    resetCooldownMemory()
    const root = tmp()
    const state = tmp()
    let anthropicCalls = 0
    const fetchFn = (async (url: string) => {
      const u = String(url)
      if (u.includes('gdelt')) return res({ articles: [{ url: `https://reuters.com/anthropic-${c.label}`, title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
      if (u.includes('anthropic')) {
        anthropicCalls++
        if (c.label === 'request') return { ...res('private request detail', 400), headers: { get: (key: string) => key.toLowerCase() === 'retry-after' ? '11' : null } }
        if (c.label === 'timeout') throw Object.assign(new Error('timed out'), { name: 'TimeoutError' })
        return res({ content: [{ type: 'text', text: '{"items":[]}' }], usage: { input_tokens: 100, output_tokens: 10 }, stop_reason: 'end_turn' })
      }
      return res({ articles: [] })
    }) as unknown as typeof fetch
    const cfg = {
      groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
      rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
      anthropicFallbackEnabled: true, anthropicFallbackMode: 'api', anthropicApiKey: 'k', anthropicBaseUrl: 'https://api.anthropic.test',
      anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0, anthropicTransientCooldownMs: 60_000,
    } as any
    let nowMs = Date.parse('2026-06-12T09:30:00Z')
    const now = () => new Date(nowMs)

    await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
    assert.equal(anthropicCalls, 1, `${c.label}: one provider attempt`)
    assert.equal(readCooldownUntil(state, 'anthropic-triage'), 0, `${c.label}: workload evidence cannot sideline a shared provider circuit`)
    assert.equal(readCooldownUntil(state, 'triage:anthropic-triage'), nowMs + c.expectedMs, `${c.label}: persisted hold has the correct workload-local clock`)
    const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
    assert.equal(ledger.exhausted, undefined, `${c.label}: workload failure does not close the dollar day`)

    nowMs += 5_000
    await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
    assert.equal(anthropicCalls, 1, `${c.label}: workload marker gates the next cycle without another paid call`)
  }
})

await check('Anthropic API explicit requests-day exhaustion is the only HTTP signal that closes the dollar ledger', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  let anthropicCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/anthropic-day-cap', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    if (u.includes('anthropic')) {
      anthropicCalls++
      return {
        ...res('private quota detail', 429),
        headers: { get: (key: string) => ({ 'retry-after': '1500', 'x-ratelimit-remaining-requests-day': '0' } as Record<string, string>)[key.toLowerCase()] ?? null },
      }
    }
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
    anthropicFallbackEnabled: true, anthropicFallbackMode: 'api', anthropicApiKey: 'k', anthropicBaseUrl: 'https://api.anthropic.test',
    anthropicDailyUsd: 5, anthropicRpm: 6000, anthropicMinPriority: 0,
  } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(anthropicCalls, 1)
  const ledger = JSON.parse(fs.readFileSync(path.join(state, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(ledger.exhausted, true, 'the explicit day-zero signal closes admission durably')
  assert.ok(ledger.usd >= 5)
  assert.equal(readCooldownUntil(state, 'anthropic-triage'), 0, 'daily exhaustion uses the ledger, not a misleading transient cooldown')
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
    geminiEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s.ok, true)
  assert.equal(s.fresh, 1, 'one item travelled the fetched path this cycle')
  assert.equal(s.new_arrivals, 1, 'the fetched ID was absent from backlog, so it is genuine inflow')
  assert.equal(s.completed_at, '2026-06-12T09:30:00Z', 'the summary records when the scored result became available')
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
    localProvider: null, geminiEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false } as any
  let nowMs = Date.parse('2026-06-12T09:30:00Z')
  const now = () => new Date(nowMs)

  // cycle 1 arms the Groq cross-cycle cooldown and defers the item
  const s1 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s1.last_resort, 'off')
  assert.ok(readCooldownUntil(state, 'groq') > nowMs, 'Groq cooldown armed')

  // cycle 2: Groq is skipped (cooling), nothing else absorbs the batch → the note must name the cooldown AND the off fallback
  nowMs += 30_000
  const s2 = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s2.defer_reason, 'provider-retry-held', 'structured reason is the engine retry hold')
  assert.equal(s2.last_resort, 'off')
  assert.match(s2.note || '', /provider retries held after errors/i)
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
    geminiEnabled: false, overflowProviders: [], anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 50 } as any
  const now = () => new Date(nowMs)

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s.defer_reason, 'provider-retry-held')
  assert.equal(s.last_resort, 'usd-cap', 'the fallback is correctly reported at its $ ceiling')
  assert.match(s.note || '', /provider retries held after errors/i)
  assert.match(s.note || '', /\$50\/day ceiling/i, 'the note surfaces the raised $50 Haiku ceiling as the second blocker')
})

await check('honest defer note: damaged free and USD ledgers need attention, never masquerade as spent caps', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  fs.mkdirSync(state, { recursive: true })
  fs.writeFileSync(path.join(state, 'groq-budget.json'), '{"date":"2026-06-12","requests":1')
  fs.writeFileSync(path.join(state, 'anthropic-triage-budget.json'), '{"date":"2026-06-12","usd":')
  let providerCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('gdelt')) return res({ articles: [{ url: 'https://reuters.com/ledger-damage', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    if (u.includes('groq') || u.includes('anthropic')) providerCalls++
    return res({ items: [] })
  }) as unknown as typeof fetch
  const cfg = {
    groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test',
    groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false,
    localProvider: null, geminiEnabled: false, overflowProviders: [],
    anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 5,
    anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0,
  } as any
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep,
    now: () => new Date('2026-06-12T09:30:00Z'),
    claudeCliRunner: async () => { providerCalls++; return { text: '{"items":[]}', costUsd: 0, costUsdKnown: true } },
  })
  assert.equal(providerCalls, 0, 'unreadable authorities fail closed before every scoring provider')
  assert.equal(summary.defer_reason, 'usage-ledger-unavailable')
  assert.equal(summary.last_resort, 'unavailable', 'a corrupt USD ledger is not called a spent $ ceiling')
  assert.match(summary.note || '', /usage records need attention/i)
  assert.doesNotMatch(summary.note || '', /allowances cannot fit|provider-day reset|\$5\/day ceiling/i)
})

await check('honest defer note: a busy USD authority needs attention, never masquerades as the $ ceiling', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  resetCooldownMemory()
  const root = tmp()
  const state = tmp()
  const ready = path.join(state, 'usd-lock-ready')
  const lockFile = path.join(state, 'anthropic-triage-budget.json.lock')
  const holder = spawn('python3', ['-c', [
    'import fcntl, sys, time',
    'f = open(sys.argv[1], "a+")',
    'fcntl.flock(f.fileno(), fcntl.LOCK_EX)',
    'open(sys.argv[2], "w").write("ready")',
    'time.sleep(8)',
  ].join('\n'), lockFile, ready])
  const deadline = Date.now() + 5_000
  while (!fs.existsSync(ready)) {
    if (Date.now() >= deadline) throw new Error('USD lock holder did not become ready')
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  let cliCalls = 0
  const fetchFn = (async (url: string) => String(url).includes('gdelt')
    ? res({ articles: [{ url: 'https://reuters.com/usd-lock', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }] })
    : res({ articles: [] })) as unknown as typeof fetch
  try {
    const summary = await runIngestCycle({
      repoRoot: root, stateDir: state, fetchFn, sleep: noSleep,
      now: () => new Date('2026-06-12T09:30:00Z'),
      claudeCliRunner: async () => { cliCalls++; return { text: '{"items":[]}', costUsd: 0.01, costUsdKnown: true } },
      config: {
        groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
        rssEnabled: false, themesEnabled: false, localProvider: null, overflowProviders: [], geminiEnabled: false,
        anthropicFallbackEnabled: true, anthropicFallbackMode: 'subscription', anthropicDailyUsd: 1,
        anthropicPerCallUsd: 0.10, anthropicRpm: 6000, anthropicMinPriority: 0,
      } as any,
    })
    assert.equal(cliCalls, 0)
    assert.equal(summary.defer_reason, 'usage-ledger-unavailable')
    assert.equal(summary.last_resort, 'unavailable')
    assert.match(summary.note || '', /usage record needs attention/i)
    assert.doesNotMatch(summary.note || '', /\$1\/day ceiling|free-budget-spent/i)
  } finally {
    holder.kill('SIGKILL')
    await new Promise<void>((resolve) => holder.once('close', () => resolve()))
  }
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
  const claudeCliRunner = async () => ({ text: '', costUsd: 0, costUsdKnown: true, error: cliError })
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

await check('Gemini pool reports a provider day limit only when every model bucket reported it', async () => {
  assert.equal(geminiPoolProviderDayExhausted(0, 2), false)
  assert.equal(geminiPoolProviderDayExhausted(1, 2), false, 'one closed model rotates to the still-eligible model')
  assert.equal(geminiPoolProviderDayExhausted(2, 2), true)
  assert.equal(geminiPoolProviderDayExhausted(0, 0), false, 'an absent pool never invents quota evidence')
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
  assert.equal(anthropicDrainReady(true, false, 49.95, 50, Infinity, 0, 0.10), false, 'remaining dollars cannot fit the next conservative call → no zero-progress drain')
  assert.equal(anthropicDrainReady(true, false, 49.90, 50, Infinity, 0, 0.10), true, 'an exactly fitting final call remains usable')
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

await check('last-look provider maps name OmniRoute exactly and legacy summaries retain the family fallback', () => {
  const mapped = {
    ts: '2026-08-21T10:00:00Z', ok: true, fetched: 12, candidates: 12,
    picked: 1, watched: 0, dropped: 11, inboxed: 1, groq_requests: 0, groq_tokens: 0,
    overflow_requests: 9,
    provider_attempts: { omniroute: 2, groq: 1 },
    provider_scored_batches: { omniroute: 1 },
  } as any
  assert.equal(providerLastCycleMetric(mapped, 'omniroute', 'provider_attempts'), 2)
  assert.equal(providerLastCycleMetric(mapped, 'groq', 'provider_scored_batches'), 0, 'a present map proves tracked zero rather than falling back')
  assert.deepEqual(scoredByForLastCycle(mapped, [
    { id: 'groq', label: 'Groq' },
    { id: 'omniroute', label: 'OmniRoute' },
  ]), [{ id: 'omniroute', label: 'OmniRoute', requests: 1 }], 'the exact map supersedes the lossy legacy Overflow count')

  const failedMapEra = { ...mapped, provider_scored_batches: undefined }
  assert.deepEqual(scoredByForLastCycle(failedMapEra, [
    { id: 'omniroute', label: 'OmniRoute' },
  ]), [], 'an attempts-only map-era cycle proves no provider scored; legacy request counters cannot fabricate success')

  const legacy = { ...mapped, provider_attempts: undefined, provider_scored_batches: undefined, overflow_requests: 3 }
  assert.deepEqual(scoredByForLastCycle(legacy, []), [
    { id: 'overflow', label: 'Overflow', requests: 3 },
  ], 'rolling-deploy summaries retain the established aggregate fallback')
})

await check('getNewsDiagnostics: enumerates every tier in routing order, with the backlog gauge + honest defer block', async () => {
  const d = getNewsDiagnostics({ omniRouteHomeDir: diagnosticsHome })
  assert.ok(Array.isArray(d.tiers) && d.tiers.length >= 1, 'tiers are enumerated (at least Groq + the last resort)')
  const groq = d.tiers.find((t) => t.id === 'groq')
  assert.ok(groq && groq.role === 'primary' && groq.meter === 'requests', 'Groq is the primary, requests-metered tier')
  const haiku = d.tiers.find((t) => t.id === 'anthropic-triage')
  assert.ok(haiku && haiku.role === 'last-resort' && haiku.meter === 'usd', 'the Haiku last-resort tier is present and $-metered')
  assert.equal(haiku!.usdCap, NEWS.anthropicDailyUsd, 'the daily $ ceiling flows through config → diagnostics')
  const omni = d.tiers.find((t) => t.id === 'omniroute')
  assert.ok(omni, 'OmniRoute never disappears from diagnostics when its opt-in flag is absent')
  if (!NEWS.overflowProviders.some((p) => p.id === 'omniroute')) {
    assert.equal(omni!.enabled, false)
    assert.match(omni!.disabledReason || '', /deploy agent retries installation.*12-item scorer smoke automatically.*enables only after.*passes/i)
    assert.doesNotMatch(omni!.disabledReason || '', /NEWS_OMNIROUTE_ENABLED|manually enable/i)
  }
  assert.ok(d.tiers.every((t, i) => i === 0 || d.tiers[i - 1].order <= t.order), 'tiers are in fallback-routing order')
  assert.equal(d.flow.windowMinutes, 60, 'top flow rates use a fixed trailing-hour denominator')
  assert.equal(typeof d.backlog.count, 'number')
  assert.ok(d.backlog.cap >= 1, 'the loss boundary is reported')
  assert.equal(typeof d.backlog.nearLimit, 'boolean')
  for (const k of ['active', 'reason', 'plainNote', 'lastResort', 'blockingTiers'] as const) assert.ok(k in d.defer, `defer.${k} present`)
  assert.ok(Array.isArray(d.defer.blockingTiers))
})

await check('getNewsDiagnostics labels a provider-reported day limit separately and leaves actual meter counters intact', async () => {
  if (!NEWS.overflowProviders.length) return
  resetBudgetMemory()
  const p = NEWS.overflowProviders[0]
  const day = p.dayTz
    ? new Intl.DateTimeFormat('en-CA', { timeZone: p.dayTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now())
    : new Date().toISOString().slice(0, 10)
  const file = path.join(STATE_DIR, p.budgetFile)
  let prior: string | null = null
  try { prior = fs.readFileSync(file, 'utf8') } catch { /* no prior ledger */ }
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(file, JSON.stringify({ date: day, requests: 16, tokens: 320, exhausted: true, providerDayExhausted: true }))
    const d = getNewsDiagnostics({ omniRouteHomeDir: diagnosticsHome })
    const t = d.tiers.find((tier) => tier.id === p.id)
    assert.ok(t)
    assert.equal(t!.requestsToday, 16, 'diagnostics show recorded requests, not the configured request cap')
    assert.equal(t!.tokensToday, 320, 'diagnostics show recorded tokens, not a synthetic cap')
    assert.equal(t!.providerDayExhausted, true)
    assert.equal(
      d.defer.providerDayExhaustedTiers.includes(p.id),
      t!.spendingAllowed !== false,
      'the shared blocker list is actionable only while an engine owner is active',
    )
    assert.equal(d.defer.allowanceExhaustedTiers.includes(p.id), false, 'provider signal and engine allowance are disjoint reason groups')
  } finally {
    if (prior == null) fs.rmSync(file, { force: true })
    else fs.writeFileSync(file, prior)
    resetBudgetMemory()
  }
})

// ---- provider capacity: the failures the engine was inflicting on itself ------------------------------
// Live board, one day: Mistral 46 consecutive failures / 0 batches ever scored / "rejected provider access";
// OpenRouter 26 consecutive and NVIDIA 54, both 100% timeouts, both with most of their allowance unused;
// Gemini 24 of 25 calls failed on "an unusable triage response" for 1 scored batch; Groq and Cerebras — the
// only two working — both "Saved for later today" while 26,539 items waited and the cycle scored zero.

await check('triageMaxOutputTokens: the output ceiling scales with the batch, and never lowers a provider\'s own', () => {
  // the reply is one JSON row per headline, so a FLAT ceiling truncates the larger batches; a truncated answer
  // fails the completeness contract and the whole call is wasted (request spent, tokens charged, 0 rows scored)
  assert.equal(triageMaxOutputTokens(12), 2440, '12 items need more than the old flat 2000 default')
  assert.ok(triageMaxOutputTokens(24) > triageMaxOutputTokens(12), 'a bigger batch gets a bigger ceiling')
  // a provider configured ABOVE the need keeps its own value — this only ever raises a too-low ceiling
  assert.equal(triageMaxOutputTokens(12, 3500), 3500, "Cerebras/OpenRouter's 3500 is untouched")
  assert.equal(triageMaxOutputTokens(12, 2000), 2440, "Groq/NVIDIA's 2000 is raised to what 12 rows actually need")
  assert.equal(triageMaxOutputTokens(0, 2000), 2000, 'an empty batch cannot demand more than the configured value')
  assert.equal(triageMaxOutputTokens(-5, 2000), 2000, 'a negative count cannot shrink the ceiling below the config')
})

await check('a triage timeout MEASURES itself, names the ceiling, and puts the number on the cooldown marker', async () => {
  resetCooldownMemory()
  const state = tmp()
  // a fake clock the adapter reads through opts.nowMs — so the measurement is deterministic, not wall-clock
  let t = 1_000
  const fetchFn = (async () => { t += 30_000; const e: any = new Error('aborted'); e.name = 'TimeoutError'; throw e }) as unknown as typeof fetch
  const items = [{ event_id: 'E1', headline: 'X', source_name: 'Reuters', region: 'US' } as any]
  const res = await triageBatch(items, { model: 'm', baseUrl: 'https://x.test', apiKey: 'k', timeoutMs: 30_000, maxAttempts: 1, nowMs: () => t }, fetchFn, noSleep)
  assert.equal(res.ok, false)
  assert.equal(res.timedOut, true)
  assert.equal(res.elapsedMs, 30_000, 'the elapsed time is recorded, not discarded')
  assert.match(String(res.note), /timed out after 30\.0s \(our 30\.0s ceiling\)/, 'the note says WE cut it off — the actionable half')
  // and it reaches the marker, so a LATER cycle (which never sees the note) can still show it
  armCooldown(state, 5_000, 300_000, 'openrouter', 3_600_000, 'timeout', res.elapsedMs)
  assert.equal(cooldownInfo(state, 'openrouter').observedMs, 30_000)
})

await check('the cooldown marker carries the STREAK START, so a flat-pinned backoff can still say how long it has been dead', () => {
  resetCooldownMemory()
  const state = tmp()
  // 300s base / 3600s max: the window pins flat at 60 min from the 5th failure, so `fails` alone stops
  // distinguishing "down an hour" from "down two days" — which is why 46 consecutive meant nothing.
  const base = 300_000, max = 3_600_000
  let at = 1_000_000
  for (let i = 0; i < 6; i++) { armCooldown(state, at, base, 'mistral', max, 'provider-access'); at += 3_600_000 }
  const info = cooldownInfo(state, 'mistral')
  assert.equal(info.fails, 6)
  assert.equal(info.reason, 'provider-access')
  assert.equal(info.firstFailureAt, 1_000_000, 'the FIRST failure of the unbroken streak, not the latest re-arm')
  // a success clears it: the next streak starts fresh rather than inheriting a two-day-old start instant
  clearCooldown(state, 'mistral')
  armCooldown(state, 9_000_000, base, 'mistral', max, 'provider-access')
  assert.equal(cooldownInfo(state, 'mistral').firstFailureAt, 9_000_000)
  assert.equal(cooldownInfo(state, 'mistral').fails, 1)
})

await check('credentialRejected: repeated 401/403 is a dead key; one is bad luck; a timeout never is', () => {
  assert.equal(CREDENTIAL_DEAD_AFTER_FAILS, 3)
  assert.equal(credentialRejected('provider-access', 3), true, 'three in a row is a standing fault a human must fix')
  assert.equal(credentialRejected('provider-access', 46), true)
  assert.equal(credentialRejected('provider-access', 2), false, 'a rotated key or a one-off gateway 403 is not blamed')
  // every other failure class clears itself — none of them may ever be reported as a credential problem
  for (const reason of ['timeout', 'availability', 'rate-limit', 'triage-contract', 'triage-request', undefined]) {
    assert.equal(credentialRejected(reason, 99), false, `${reason} is not a credential fault however often it repeats`)
  }
  // 402 (spent balance) and 404 (retired model) hold the provider like a 401 but are NOT broken credentials
  for (const reason of ['provider-credits', 'provider-endpoint']) {
    assert.equal(credentialRejected(reason, 99), false, `${reason} must never send an operator to rotate a working key`)
  }
})

await check('armCooldown: the credential streak counts ACCESS rejections only, not every failure before one', () => {
  const state = tmp(); const base = 60_000, max = 3_600_000
  let at = 1_000_000
  // the exact live shape: two ordinary failures, then the FIRST access rejection
  armCooldown(state, at, base, 'mistral', max, 'availability'); at += 3_600_000
  armCooldown(state, at, base, 'mistral', max, 'timeout'); at += 3_600_000
  armCooldown(state, at, base, 'mistral', max, 'provider-access')
  const info = cooldownInfo(state, 'mistral')
  assert.equal(info.fails, 3, 'the general streak still counts all three — it drives the backoff window')
  assert.equal(info.accessFails, 1, 'but only one of them was an access rejection')
  assert.equal(credentialRejected(info.reason, info.accessFails ?? 0), false, 'so the key is not blamed on its first 403')
  at += 3_600_000; armCooldown(state, at, base, 'mistral', max, 'provider-access')
  at += 3_600_000; armCooldown(state, at, base, 'mistral', max, 'provider-access')
  const dead = cooldownInfo(state, 'mistral')
  assert.equal(dead.accessFails, 3)
  assert.equal(credentialRejected(dead.reason, dead.accessFails ?? 0), true, 'three ACCESS rejections in a row still names the fault')
  // a different failure class resets the access streak without disturbing the backoff streak
  at += 3_600_000; armCooldown(state, at, base, 'mistral', max, 'availability')
  const mixed = cooldownInfo(state, 'mistral')
  assert.equal(mixed.accessFails, undefined, 'the access streak is broken')
  assert.equal(mixed.fails, 6, 'the backoff streak is not — resetting it would reopen the request burn')
})

await check('dailyQuotaAdmission: ADMISSION uses the calibrated cost, the HARD CAP keeps the conservative bound', () => {
  // The live shape: a token-metered tier whose conservative per-call bound (~11,800) is 3-8x what a successful
  // batch really costs (~1,700). Demanding the worst case as admission headroom is what left a provider with
  // allowance in hand reading "Saved for later today".
  const at = Date.parse('2026-08-17T12:00:00Z') // mid-day → ~50% of the day released
  const base = { id: 't', meter: 'tokens' as const, used: 249_000, cap: 500_000, resetTimeZone: 'UTC' }
  const worstOnly = dailyQuotaAdmission({ ...base, cost: 11_797 }, at)
  const calibrated = dailyQuotaAdmission({ ...base, cost: 11_797, paceCost: 1_700 }, at)
  assert.equal(worstOnly.pacedFit, false, 'the worst-case bound does not fit under the released frontier')
  assert.equal(calibrated.pacedFit, true, 'the calibrated cost does — the tier is admitted instead of stranded')
  assert.equal(calibrated.hardCapFit, worstOnly.hardCapFit, 'the HARD CAP is unchanged — still the conservative bound')
  assert.equal(calibrated.released, worstOnly.released, 'the release frontier is unchanged (still cost-aligned)')
  // safety: paceCost can never be used to squeeze past the real ceiling
  const overCap = dailyQuotaAdmission({ ...base, used: 495_000, cost: 11_797, paceCost: 100 }, at)
  assert.equal(overCap.hardCapFit, false, 'a tiny paceCost cannot admit a call the hard cap refuses')
  assert.equal(overCap.pacedFit, false, 'pacedFit is AND-ed with hardCapFit, so it cannot bust the cap either')
  // and a paceCost above the conservative bound is clamped down to it, never made stricter than the cap
  const clamped = dailyQuotaAdmission({ ...base, cost: 1_000, paceCost: 999_999 }, at)
  assert.equal(clamped.pacedFit, dailyQuotaAdmission({ ...base, cost: 1_000 }, at).pacedFit, 'an absurd paceCost degrades to cost')
  // omitting paceCost is byte-for-byte the previous behaviour
  assert.deepEqual(dailyQuotaAdmission({ ...base, cost: 11_797 }, at), worstOnly)
})

await check('pacedHasHeadroom mirrors Budget.pacedCanSpend argument-for-argument, calibrated cost included', () => {
  resetBudgetMemory()
  const state = tmp()
  const pace = { targetTokens: 500_000, floorFrac: 0 }
  const at = Date.parse('2026-08-17T12:00:00Z')
  const b = Budget.load(state, 14_400, 500_000, at)
  b.record(1, 249_000)
  // the drain gate (pacedHasHeadroom) and the triage loop (Budget.pacedCanSpend) MUST agree, or the gate
  // refuses batches the loop would take and the frequent backlog drain silently stops running
  for (const [strict, calibrated] of [[11_797, 1_700], [11_797, 11_797]] as const) {
    assert.equal(
      pacedHasHeadroom(b.tokens, b.requests, 14_400, 500_000, pace, at, strict, calibrated),
      b.pacedCanSpend(strict, pace, at, 1, calibrated),
      `gate and loop disagree at strict=${strict} calibrated=${calibrated}`,
    )
  }
})

await check('a batch that returns an UNUSABLE body is not re-sent around the whole free pool', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  // Every provider answers HTTP 200 with a body that fails the completeness contract (0 rows for 2 items).
  // Pre-fix the identical batch walked the entire pool: one bad batch, N spent requests, 0 rows scored.
  // FIVE pool models, exactly the live shape, so the batch genuinely HAS somewhere to walk to. Without a real
  // pool this test would pass vacuously on a one-provider chain and prove nothing.
  let contractCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('generateContent')) {
      contractCalls++
      // HTTP 200, valid JSON, and 0 rows for a 2-item batch → fails the completeness contract
      return res({ usageMetadata: { totalTokenCount: 10 }, candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"items":[]}' }] } }] })
    }
    if (gdeltQueryHasDomain(u, 'reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/a', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260817T090000Z' },
      { url: 'https://cnbc.com/b', title: 'Federal Reserve holds rates steady amid inflation concerns', domain: 'cnbc.com', seendate: '20260817T090100Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    geminiEnabled: true, geminiApiKey: 'g', geminiBaseUrl: 'https://gemini.test', geminiMaxTokens: 2400,
    geminiModels: ['a', 'b', 'c', 'd', 'e'].map((m) => ({ model: `gemini-${m}`, dailyReqCap: 500 })),
    localProvider: null, overflowProviders: [], anthropicFallbackEnabled: false,
    contractRetriesPerBatch: 1, triageBatch: 12,
  } as any
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-08-17T09:30:00Z') })
  assert.equal(s.picked + s.watched + s.dropped, 0, 'an unusable body scores nothing — never scored-zero')
  // the batch is DEFERRED, not lost: capping the retries stops wasting requests, it does not discard items
  assert.equal(loadDeferred(state).length, 2, 'both items wait for the next look')
  assert.ok(contractCalls >= 1, 'the batch was genuinely offered to a provider')
  assert.equal(contractCalls, 1 + cfg.contractRetriesPerBatch, `one try plus one capped retry — got ${contractCalls} of a possible 5`)
  assert.ok(contractCalls < cfg.geminiModels.length, 'the remaining pool models were spared the identical doomed batch')
})

for (const cap of [0, 1]) {
  await check(`contract-retry cap ${cap}: an upstream contract failure counts toward the cap, so the pool sees exactly ${cap} more offer(s)`, async () => {
    resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
    const root = tmp(), state = tmp()
    // The path the previous test could not reach: it set groqApiKey:'' so `res` was always undefined
    // entering the pool loop. Here GROQ produces the first unusable body, exactly as it does live. The
    // counter used to start at 0 regardless, so the cap under-counted by one — and cap 0, documented in
    // config.ts and the README as "never re-sends", still handed the batch to one pool provider.
    let groqCalls = 0, poolCalls = 0
    const fetchFn = (async (url: string) => {
      const u = String(url)
      if (u.includes('groq.test')) {
        groqCalls++
        return res({ usage: { total_tokens: 10 }, choices: [{ message: { content: '{"items":[]}' } }] })
      }
      if (u.includes('generateContent')) {
        poolCalls++
        return res({ usageMetadata: { totalTokenCount: 10 }, candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"items":[]}' }] } }] })
      }
      if (gdeltQueryHasDomain(u, 'reuters.com')) return res({ articles: [
        { url: 'https://reuters.com/a', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260817T090000Z' },
        { url: 'https://cnbc.com/b', title: 'Federal Reserve holds rates steady amid inflation concerns', domain: 'cnbc.com', seendate: '20260817T090100Z' },
      ] })
      return res({ articles: [] })
    }) as unknown as typeof fetch
    const cfg = {
      groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqRpm: 6000,
      gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
      geminiEnabled: true, geminiApiKey: 'g', geminiBaseUrl: 'https://gemini.test', geminiMaxTokens: 2400,
      geminiModels: ['a', 'b', 'c', 'd', 'e'].map((m) => ({ model: `gemini-${m}`, dailyReqCap: 500 })),
      localProvider: null, overflowProviders: [], anthropicFallbackEnabled: false,
      contractRetriesPerBatch: cap, triageBatch: 12,
    } as any
    const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-08-17T09:30:00Z') })
    assert.ok(groqCalls >= 1, 'groq was offered the batch first and returned an unusable body')
    assert.equal(poolCalls, cap, `the upstream failure is already one against the cap — got ${poolCalls} pool offer(s), expected ${cap}`)
    assert.equal(s.picked + s.watched + s.dropped, 0, 'an unusable body scores nothing')
    assert.equal(loadDeferred(state).length, 2, 'and the items are deferred, never discarded')
  })
}

await check('Gemini enforces the row contract at the provider only when explicitly switched on', () => {
  // A schema the API rejects returns 400 -> failureKind 'request' -> a silent 5-60 minute hold, i.e. a
  // recoverable contract failure traded for a harder one. So it ships ready to enable, not enabled blind.
  assert.equal(geminiSchemaEnabled({}), false, 'off by default')
  assert.equal(geminiSchemaEnabled({ NEWS_GEMINI_RESPONSE_SCHEMA: '0' }), false)
  assert.equal(geminiSchemaEnabled({ NEWS_GEMINI_RESPONSE_SCHEMA: '1' }), true)
  // the schema must describe the shape coerceCompleteTriageRows actually reads, or enabling it breaks scoring
  const row: any = (TRIAGE_RESPONSE_SCHEMA as any).properties.items.items
  assert.equal((TRIAGE_RESPONSE_SCHEMA as any).properties.items.type, 'ARRAY')
  assert.ok(row.required.includes('i'), 'the index is required — it IS the coverage contract')
  for (const k of ['relevance', 'materiality_pre_score', 'event_materiality_label', 'issuer_linkage', 'companies', 'size_bucket', 'headline_en', 'event_region']) {
    assert.ok(row.properties[k], `the schema is missing ${k}, which coerceTriage reads`)
  }
  assert.deepEqual(row.properties.relevance.enum, ['material', 'relevant_non_material', 'irrelevant'], 'the enum must match coerceTriage exactly')
})

await check('a Gemini batch failure is attributed to the MODEL, not just the pool', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('generateContent')) return res({ usageMetadata: { totalTokenCount: 10 }, candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"items":[{"i":0,"relevance":"material","materiality_pre_score":80,"why":"x"}]}' }] } }] })
    if (gdeltQueryHasDomain(u, 'reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/c', title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260817T090000Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  // no Groq key → the batch goes straight to the Gemini pool
  const cfg = {
    groqApiKey: '', gdeltBaseUrl: 'https://gdelt.test/doc', gdeltLookbackMin: 40,
    geminiEnabled: true, geminiApiKey: 'g', geminiBaseUrl: 'https://gemini.test',
    geminiModels: [{ model: 'gemini-flash-a', dailyReqCap: 500 }], geminiMaxTokens: 2400,
    localProvider: null, overflowProviders: [], anthropicFallbackEnabled: false,
  } as any
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-08-17T09:30:00Z') })
  // BOTH keys are present: the aggregate the pool chip reads, and the per-model row that answers
  // "WHICH of the five models?" — the question 24-failures-of-25 on one chip cannot answer
  assert.equal(s.provider_attempts?.gemini, 1, 'the aggregate pool count is unchanged for existing readers')
  assert.equal(s.provider_attempts?.['gemini:gemini-flash-a'], 1, 'the model is named')
  assert.equal(s.provider_scored_batches?.['gemini:gemini-flash-a'], 1, 'scored batches are keyed per model too')
})

// ---- backlog starvation: the 2026-08-13→16 outage that emptied the wire -------------------------------
// The engine scored 540 items across three days and kept ZERO. Every one was a stale routine exchange
// filing; not one newswire item was scored at all. Not a triage misjudgement — a strict-priority queue
// starving its low-priority class. preTriagePriority = tier*3 + keyword + recency, so a stale filing
// scores 5*3+0+0 = 15 and a fresh keyword-free headline 2*3+0+5 = 11: once the backlog held thousands of
// filings, no news item could ever reach the head of the queue again, at any provider health.
const queueItem = (over: Partial<any>): any => ({
  event_id: `EVT-${Math.random().toString(16).slice(2, 10)}`,
  headline: 'Routine disclosure',
  input_nature: 'exchange_announcement',
  found_at: '2026-08-16T00:00:00Z',
  ...over,
})
const staleFiling = (n: number, at = '2026-08-14T00:00:00Z') =>
  Array.from({ length: n }, (_, i) => queueItem({ event_id: `EVT-old-${i}`, headline: `Newspaper advertisement for results ${i}`, found_at: at }))
const freshNews = (n: number, at = '2026-08-16T09:55:00Z') =>
  Array.from({ length: n }, (_, i) => queueItem({ event_id: `EVT-new-${i}`, headline: `Company reports quarterly numbers ${i}`, input_nature: 'news', found_at: at }))

await check('buildTriageQueue: a deep stale backlog cannot starve this cycle\'s fresh news out of every prefix', () => {
  const now = new Date('2026-08-16T10:00:00Z')
  const q = buildTriageQueue(staleFiling(5000), freshNews(500), now, 0.5)
  assert.equal(q.length, 5500, 'every item is queued — the reservation reorders, it never drops')
  // the cycle only ever consumes a PREFIX, so the guarantee has to hold of the prefix, not just the whole
  // queue. One degraded cycle scored 36 items (3 batches of 12) — that is the prefix that matters.
  const isFresh = (it: any) => String(it.event_id).startsWith('EVT-new-')
  for (const prefix of [12, 36, 120, 1200]) {
    const n = q.slice(0, prefix).filter(isFresh).length
    // the reservation is bounded by supply: a prefix past the fresh pool (500) can only carry all of it
    const want = Math.min(Math.floor(prefix * 0.5), 500)
    assert.ok(n >= want, `prefix ${prefix} carries ${n} fresh items, expected at least ${want}`)
  }
  // the exact regression: under the old flat sort the first 36 slots were 36 stale filings and 0 news
  assert.ok(q.slice(0, 36).some(isFresh), 'a degraded cycle that scores only 36 items still scores news')
})

await check('buildTriageQueue: preserves §4 priority order WITHIN each pool, and freshShare 0 restores the old strict-priority queue', () => {
  const now = new Date('2026-08-16T10:00:00Z')
  // a material keyword lifts an item inside its own pool (+12) — that ordering must survive the interleave
  const material = queueItem({ event_id: 'EVT-new-material', headline: 'Company announces fraud probe', input_nature: 'news', found_at: '2026-08-16T09:55:00Z' })
  const q = buildTriageQueue(staleFiling(4), [...freshNews(3), material], now, 0.5)
  const freshOrder = q.filter((it) => String(it.event_id).startsWith('EVT-new-')).map((it) => it.event_id)
  assert.equal(freshOrder[0], 'EVT-new-material', 'the highest-priority fresh item still leads its own pool')
  // freshShare 0 = the pre-fix behaviour, byte-for-byte: pure priority, backlog filings first
  const strict = buildTriageQueue(staleFiling(4), freshNews(3), now, 0)
  assert.ok(strict.slice(0, 4).every((it) => String(it.event_id).startsWith('EVT-old-')), 'freshShare 0 restores the strict-priority order')
})

await check('expireBacklog: retires on RESIDENCE, not on when the source published, and never loses an item to a missing timestamp', () => {
  const now = new Date('2026-08-16T10:00:00Z')
  const { live, expired } = expireBacklog([
    queueItem({ event_id: 'EVT-live', deferred_at: '2026-08-15T10:00:00Z' }), // waited 24h — inside the window
    queueItem({ event_id: 'EVT-old', deferred_at: '2026-08-13T09:00:00Z' }), // waited 73h — past it
    // The bug this rule exists to prevent: gov-data stamps found_at with the FDA report date under a
    // 21-day lookback, so a legitimately fresh discovery carries a publication date well past the bound.
    // Keying on found_at retired it on its FIRST deferral, unscored.
    { ...queueItem({ event_id: 'EVT-old-news-new-to-us', found_at: '2026-08-06T00:00:00Z' }), deferred_at: '2026-08-16T09:45:00Z' },
    // and the converse: recent publication does not buy an item a longer wait
    { ...queueItem({ event_id: 'EVT-new-news-long-wait', found_at: '2026-08-16T09:00:00Z' }), deferred_at: '2026-08-13T09:00:00Z' },
    queueItem({ event_id: 'EVT-legacy', found_at: '2026-08-15T10:00:00Z' }), // no deferred_at — falls back to found_at
    queueItem({ event_id: 'EVT-nostamp', found_at: '' }),
    queueItem({ event_id: 'EVT-badstamp', found_at: 'not-a-date' }),
  ], now, 48 * 3_600_000)
  assert.deepEqual(expired.map((i) => i.event_id), ['EVT-old', 'EVT-new-news-long-wait'])
  assert.deepEqual(
    live.map((i) => i.event_id),
    ['EVT-live', 'EVT-old-news-new-to-us', 'EVT-legacy', 'EVT-nostamp', 'EVT-badstamp'],
    'an item discovered 15 minutes ago survives however old its source says it is; an unparseable stamp is kept, never retired',
  )
})

await check('migrateDeferred: the first load after deploy does NOT expire a legacy backlog by publication date', () => {
  // The transition case. Rows written by the previous version have no deferred_at at all, so reading them
  // through the found_at fallback reproduces exactly the bug the fallback exists to survive.
  const legacy = [
    queueItem({ event_id: 'EVT-old-news-new-to-us', found_at: '2026-08-06T00:00:00Z' }), // 21-day gov-data lookback
    queueItem({ event_id: 'EVT-recent', found_at: '2026-08-16T09:00:00Z' }),
  ]
  const bare = expireBacklog(legacy, new Date('2026-08-16T10:00:00Z'), 48 * 3_600_000)
  assert.deepEqual(bare.expired.map((i) => i.event_id), ['EVT-old-news-new-to-us'], 'unmigrated, the fallback retires it')
  const migrated = migrateDeferred(legacy, '2026-08-16T10:00:00Z')
  const after = expireBacklog(migrated, new Date('2026-08-16T10:00:00Z'), 48 * 3_600_000)
  assert.deepEqual(after.expired, [], 'migrated, every legacy row gets one bounded residence window instead')
  assert.deepEqual(after.live.map((i) => i.event_id), ['EVT-old-news-new-to-us', 'EVT-recent'])
  // and the extension is one-time: 48h later they age out normally
  const later = expireBacklog(migrated, new Date('2026-08-18T11:00:00Z'), 48 * 3_600_000)
  assert.equal(later.expired.length, 2, 'the migration buys one window, not immunity')
})

await check('preserveResidence: a source redelivering an unscored item does not restart its clock', () => {
  const backlog = [{ ...queueItem({ event_id: 'EVT-repeat' }), deferred_at: '2026-08-14T00:00:00Z' }]
  const fresh = [queueItem({ event_id: 'EVT-repeat' }), queueItem({ event_id: 'EVT-genuinely-new' })]
  const out = preserveResidence(fresh, backlog)
  assert.equal(out[0].deferred_at, '2026-08-14T00:00:00Z', 'the redelivered item keeps the clock it already had')
  assert.equal(out[1].deferred_at, undefined, 'a genuinely new item is untouched — it gets stamped when it defers')
  // without this an overnight re-serve would refresh the stamp every cycle and the item would never age out
  const { expired } = expireBacklog(stampDeferred(out, '2026-08-16T10:00:00Z'), new Date('2026-08-16T10:00:00Z'), 48 * 3_600_000)
  assert.deepEqual(expired.map((i) => i.event_id), ['EVT-repeat'])
})

await check('expireBacklog: a re-deferred item keeps its original residence stamp — it cannot restart its clock', () => {
  const at = '2026-08-16T10:00:00Z'
  const rows = stampDeferred([
    queueItem({ event_id: 'EVT-first-time' }),
    { ...queueItem({ event_id: 'EVT-waiting' }), deferred_at: '2026-08-14T00:00:00Z' },
  ], at)
  assert.equal(rows[0].deferred_at, at, 'a new arrival is stamped now')
  assert.equal(rows[1].deferred_at, '2026-08-14T00:00:00Z', 'an item already waiting keeps its first stamp')
  const { expired } = expireBacklog(rows, new Date('2026-08-16T10:00:00Z'), 48 * 3_600_000)
  assert.deepEqual(expired.map((i) => i.event_id), ['EVT-waiting'], 'so it still ages out on schedule')
})

await check('a REDELIVERED aged item is expired on the fresh path (deferred_at only) — a genuinely-new item with an old PUBLICATION date is not', () => {
  // The cycle composes preserveResidence -> expireBacklog(fresh, {requireDeferredStamp:true}) exactly as
  // below. Before the fix, a redelivered aged item entered `fresh`, its id was in freshIds, so the `carried`
  // filter dropped its backlog copy and it never reached expireBacklog(carried) — it lived in the fresh pool
  // forever, consuming a fresh-reserved slot every cycle a source re-served it. It must now be retired here.
  // Crucially the fresh path must expire on the RESIDENCE clock ONLY: a genuinely-new item legitimately
  // carries an old found_at (a gov-data item published three weeks ago, discovered today) and must survive —
  // expiring the fresh path by found_at would re-introduce the publication-date deletion migrateDeferred
  // exists to prevent. Expected values pinned to that rule, not to code. (Codex #453 — redelivery-expiry.)
  const now = new Date('2026-08-16T10:00:00Z')
  const backlog = [{ ...queueItem({ event_id: 'EVT-redelivered' }), deferred_at: '2026-08-13T00:00:00Z' }] // 3d old residence
  const rawFresh = [
    queueItem({ event_id: 'EVT-redelivered' }),                                   // re-served by the source this cycle
    { ...queueItem({ event_id: 'EVT-newbie' }), found_at: '2026-07-26T00:00:00Z' }, // brand new, but 3-week-old PUBLICATION date
  ]
  const fresh = preserveResidence(rawFresh, backlog) // EVT-redelivered now carries the 08-13 residence stamp
  assert.equal(countUniqueNewArrivals(fresh, backlog), 1, 'the redelivered resident is not counted as new inflow')
  const { live, expired } = expireBacklog(fresh, now, 48 * 3_600_000, { requireDeferredStamp: true })
  assert.deepEqual(expired.map((i) => i.event_id), ['EVT-redelivered'], 'the aged redelivered item is retired before it can re-enter the queue')
  assert.deepEqual(live.map((i) => i.event_id), ['EVT-newbie'], 'a genuinely-new item is untouched — the fresh path never expires on found_at')
})

await check('runIngestCycle: a backlog that waited past the age bound is retired unscored, counted, and named in the note', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(), state = tmp()
  // 3 days of unscored backlog, exactly the shape the outage left behind. `deferred_at` is what the bound
  // is measured on — items that genuinely SAT for three days, not merely items published three days ago.
  // (A row with only `found_at` is a pre-deploy legacy row and is migrated, not expired — covered above.)
  fs.writeFileSync(path.join(state, 'news-deferred.json'), JSON.stringify([
    { event_id: 'EVT-stale-1', headline: 'Newspaper advertisement for results', found_at: '2026-08-13T00:00:00Z', deferred_at: '2026-08-13T00:00:00Z', input_nature: 'exchange_announcement' },
    { event_id: 'EVT-stale-2', headline: 'Newspaper advertisement for results', found_at: '2026-08-13T01:00:00Z', deferred_at: '2026-08-13T01:00:00Z', input_nature: 'exchange_announcement' },
  ]))
  const fetchFn = (async () => res({ articles: [] })) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000 } as any
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-08-16T10:00:00Z') })
  assert.equal(s.backlog_expired, 2, 'both aged-out items are counted')
  assert.equal(s.carryover, 0, 'a retired item never competes for a triage slot again')
  assert.match(String(s.note), /RETIRED unscored/, 'the loss is named in the note, never silent')
  assert.equal(loadDeferred(state).length, 0, 'the retired backlog is gone from disk — it cannot regrow the wall')
})

await check('backlogDurablyCleared: either backlog write succeeding is enough — the LAST write is not the only one that counts', () => {
  // A cycle calls saveDeferred twice against the same file (pre-projection journal, then final cleanup);
  // both already exclude backlogExpired rows, so either one succeeding already durably removed them from
  // disk. Before this fix, runCycle tracked only the final write's result, which undercounted retirement
  // in the partial-success case: journal write ok, cleanup write fails. (Codex #453 — the both-writes-fail
  // case was already gated correctly; this pins the case it missed.)
  assert.equal(backlogDurablyCleared(true, true), true, 'both writes ok')
  assert.equal(backlogDurablyCleared(true, false), true, 'journal write ok, cleanup write fails — still durable, the exact bug this fixes')
  assert.equal(backlogDurablyCleared(false, true), true, 'journal write fails, cleanup write recovers it')
  assert.equal(backlogDurablyCleared(false, false), false, 'both writes fail — nothing durable, must not report retirement')
})

await check('buildTriageQueue: share 0 restores ONE priority sort, it does not invert the starvation', () => {
  // NEWS_FRESH_RESERVE_FRAC=0 is the documented rollback lever for the reserve, so it has to UNDO the
  // reserve — a single global priority sort, which is what shipped before it. Appending fresh only after
  // the backlog drains is a third behaviour, and a worse one: a high-priority fresh filing would sit
  // behind every low-priority stale item, which is an absolute version of the starvation the reserve
  // exists to prevent, reached by the switch meant to turn the reserve off.
  const now = new Date('2026-08-16T10:00:00Z')
  // a fresh FILING outranks stale news on preTriagePriority (tier*3 dominates recency)
  const backlog = Array.from({ length: 3 }, (_, i) =>
    queueItem({ event_id: `EVT-old-${i}`, headline: `Company reports quarterly numbers ${i}`, input_nature: 'news', found_at: '2026-08-14T00:00:00Z' }))
  const fresh = [queueItem({ event_id: 'EVT-new-0', headline: 'Routine disclosure', input_nature: 'exchange_announcement', found_at: '2026-08-16T09:55:00Z' })]
  const q = buildTriageQueue(backlog, fresh, now, 0).map((it: any) => it.event_id)
  assert.equal(q.length, 4, 'nothing is dropped')
  assert.equal(q[0], 'EVT-new-0', 'the higher-priority item leads, whichever pool it came from')
})

await check('the pacing admission and the reservation can never disagree', () => {
  // The bug this pins: pacedCanSpend took the CALIBRATED cost while tryReserve was never given it, so
  // the admission paced on what a batch really costs and the reservation paced on the worst case. On a
  // paced day the admission said yes, the reservation said no, and the batch was dropped — with
  // groqReleased still true, so nothing reported a reason and the panel called the tier healthy.
  const PACE = { targetTokens: 300_000, floorFrac: 0.25 } as any
  const NOON = new Date('2026-08-18T12:00:00Z').getTime()
  const STRICT = 30_000   // conservative worst-case bound
  const CALIB = 9_000     // what a successful batch really costs
  const budgetWith = (used: number) => {
    resetBudgetMemory()
    const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'paceagree-')), 'b.json')
    const b = new Budget(f, 10_000, 1_000_000, NOON)
    if (used > 0) { const r = b.tryReserve(used, undefined, NOON, 1); if (r) b.reconcile(r, 1, used) }
    return b
  }
  for (const used of [0, 50_000, 100_000, 140_000, 160_000, 200_000, 249_000, 290_000]) {
    const admit = budgetWith(used).pacedCanSpend(STRICT, PACE, NOON, 1, CALIB)
    const reserved = budgetWith(used).tryReserve(STRICT, PACE, NOON, 1, CALIB) !== null
    assert.equal(reserved, admit, `at used=${used} the reservation must answer as the admission did`)
  }
})

await check('the calibrated pace cost cannot bust the hard daily cap', () => {
  // The reason the reservation kept the conservative bound in the first place. Threading the calibrated
  // cost must move ONLY the pacer: the cap test and the amount debited stay on the worst case, or a
  // generous pace figure would let a batch through the daily ceiling.
  const PACE = { targetTokens: 300_000, floorFrac: 0.25 } as any
  const NOON = new Date('2026-08-18T12:00:00Z').getTime()
  resetBudgetMemory()
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pacecap-')), 'b.json')
  const b = new Budget(f, 10_000, 1_000_000, NOON)
  const spent = b.tryReserve(995_000, undefined, NOON, 1)
  if (spent) b.reconcile(spent, 1, 995_000)
  // 5,000 tokens of hard cap left; ask for 30,000 with a pace cost of 1 — maximally permissive
  assert.equal(b.tryReserve(30_000, PACE, NOON, 1, 1), null, 'the hard cap still refuses it')

  resetBudgetMemory()
  const f2 = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pacedebit-')), 'b.json')
  const fresh = new Budget(f2, 10_000, 1_000_000, NOON)
  const r = fresh.tryReserve(30_000, PACE, NOON, 1, 9_000)
  assert.equal(r?.tokens, 30_000, 'what is DEBITED is the conservative bound, never the calibrated one')
})

fs.rmSync(diagnosticsHome, { recursive: true, force: true })
console.log(`\n${passed} checks passed`)
