import assert from 'node:assert/strict'
import type { NewsDiagnostics, PipelineFlowRates, TierDiagnostics } from '../../lib/types'
import { dailyLossTotalsAvailable, diagnosticBlockers, diagnosticDeferReasons, fmtPipelineRate, lastCycleArrivalCopy, pipelineFlowPresentation, retryReasonLabel, tierStatusCopy, todayOutcomeCopy } from './pipelineDiagnosticsView'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const tier = (id: string, label: string, health: TierDiagnostics['health']): TierDiagnostics => ({
  id, label, health, color: '--accent', role: 'overflow', order: 1, enabled: true, meter: 'requests',
})

const diagnostics = (tiers: TierDiagnostics[], defer: Partial<NewsDiagnostics['defer']> = {}): NewsDiagnostics => ({
  ts: '2026-08-13T00:00:00Z', enabled: true, running: false, readOnly: false, intervalMin: 5,
  lastCycleAt: null, nextCycleAt: null, tiers,
  backlog: { count: 10, cap: 5000, pctOfCap: 0.2, nearLimit: false, trend: null, lostToday: 0 },
  today: { read: 0, kept: 0, dropped: 0, cycles: 0 }, lastCycle: null,
  defer: { active: true, reason: null, plainNote: null, lastResort: null, blockingTiers: [], ...defer },
})

check('additive defer causes stay ordered and deduplicated with a scalar rolling-deploy fallback', () => {
  assert.deepEqual(
    diagnosticDeferReasons(diagnostics([], { reason: 'feed-cap', reasons: ['storage-emergency', 'feed-cap', 'feed-cap'] }).defer),
    ['storage-emergency', 'feed-cap'],
  )
  assert.deepEqual(diagnosticDeferReasons(diagnostics([], { reason: 'provider-retry-held' }).defer), ['provider-retry-held'])
  assert.deepEqual(diagnosticDeferReasons(diagnostics([], { reason: null }).defer), [])
})

check('malformed defer cause payloads cannot crash or render one reason per string character', () => {
  assert.deepEqual(
    diagnosticDeferReasons(diagnostics([], { reason: 'feed-cap', reasons: 'storage-emergency' as any }).defer),
    ['feed-cap'],
    'a string is not an additive reason array',
  )
  assert.deepEqual(
    diagnosticDeferReasons(diagnostics([], { reason: 'feed-write-failed', reasons: { length: 1 } as any }).defer),
    ['feed-write-failed'],
    'an array-like persisted object falls back to the scalar reason',
  )
  assert.deepEqual(
    diagnosticDeferReasons(diagnostics([], {
      reason: null,
      reasons: ['storage-emergency', null, 'future-defer-reason', 'storage-emergency'] as any,
    }).defer),
    ['storage-emergency', 'future-defer-reason'],
    'bad entries are removed while a future string reason retains generic rolling-deploy copy',
  )
})

check('eligible and engine-allowance copy never claims provider health or a provider quota', () => {
  assert.equal(tierStatusCopy(tier('x', 'X', 'healthy'), 0), 'Ready')
  assert.equal(tierStatusCopy({ ...tier('x', 'X', 'healthy'), spendingAllowed: false }, 0), 'News scanner is not running')
  assert.equal(tierStatusCopy(tier('x', 'X', 'budget-spent'), 0), "Today's app limit is used")
  const providerDay = { ...tier('x', 'X', 'budget-spent'), providerDayExhausted: true, requestsToday: 16, reqCap: 45 }
  assert.equal(tierStatusCopy(providerDay, 0), "Service says today's limit is used")
  assert.equal(providerDay.requestsToday, 16, 'provider-day state does not forge the meter to 45/45')
  assert.equal(tierStatusCopy({ ...providerDay, enabled: false, health: 'disabled' }, 0), 'Off', 'a stale marker on a disabled tier does not override its current state')
})

check('retry hold names the failure class and countdown, not a cooling provider quota', () => {
  const t = { ...tier('x', 'X', 'cooling'), cooldownReason: 'rate_limit' }
  const copy = tierStatusCopy(t, 25 * 60_000)
  assert.equal(copy, 'Paused after the service asked it to wait · try again in ~25m')
  assert.doesNotMatch(copy, /cool|quota/i)
})

check('Themes provider holds name the actionable failure without exposing raw errors', () => {
  assert.equal(retryReasonLabel('theme-rate_limit'), 'the Themes service asked it to wait')
  assert.equal(retryReasonLabel('theme-availability'), 'a Themes service or internet error')
  assert.equal(retryReasonLabel('theme-access'), 'a Themes access error')
  assert.equal(retryReasonLabel('theme-credits'), 'the Themes account ran out of credit')
  assert.equal(retryReasonLabel('theme-endpoint'), 'the Themes model is no longer available')
  assert.equal(
    tierStatusCopy({ ...tier('omniroute', 'OmniRoute', 'cooling'), cooldownReason: 'theme-endpoint' }, 12 * 60_000),
    'Paused after the Themes model is no longer available · try again in ~12m',
  )
})

check('unknown marker reason is not echoed into the public UI', () => {
  assert.equal(retryReasonLabel('raw upstream account detail'), 'an error')
})

check('new diagnostics keep retry holds, allowance use, and pacing separate', () => {
  const d = diagnostics([
    tier('openrouter', 'OpenRouter', 'cooling'), tier('mistral', 'Mistral', 'budget-spent'), tier('groq', 'Groq', 'paced'),
  ], { retryHeldTiers: ['openrouter'], allowanceExhaustedTiers: ['mistral'], pacedTiers: ['groq'], blockingTiers: ['openrouter', 'mistral'] })
  assert.deepEqual(diagnosticBlockers(d), { retryHeld: ['OpenRouter'], providerDayLimited: [], allowanceUsed: ['Mistral'], needsAttention: [], paced: ['Groq'], needsCredential: [] })
})

check('provider-reported day limits are separate from configured engine allowance use', () => {
  const providerDay = { ...tier('openrouter', 'OpenRouter', 'budget-spent'), providerDayExhausted: true }
  const d = diagnostics([providerDay, tier('mistral', 'Mistral', 'budget-spent')], {
    providerDayExhaustedTiers: ['openrouter'], allowanceExhaustedTiers: ['mistral'], blockingTiers: ['openrouter', 'mistral'],
  })
  assert.deepEqual(diagnosticBlockers(d), {
    retryHeld: [], providerDayLimited: ['OpenRouter'], allowanceUsed: ['Mistral'], needsAttention: [], paced: [], needsCredential: [],
  })
})

check('old-engine payload derives disjoint groups from tier health', () => {
  const d = diagnostics([
    tier('nvidia', 'NVIDIA NIM', 'cooling'), tier('cerebras', 'Cerebras', 'budget-spent'), tier('groq', 'Groq', 'healthy'),
  ], { blockingTiers: ['nvidia', 'cerebras'] })
  assert.deepEqual(diagnosticBlockers(d), { retryHeld: ['NVIDIA NIM'], providerDayLimited: [], allowanceUsed: ['Cerebras'], needsAttention: [], paced: [], needsCredential: [] })
})

check('a non-owner process never presents configured tiers as actionable blockers', () => {
  const d = diagnostics([
    { ...tier('openrouter', 'OpenRouter', 'cooling'), spendingAllowed: false },
    { ...tier('groq', 'Groq', 'budget-spent'), spendingAllowed: false },
  ], { blockingTiers: ['openrouter', 'groq'] })
  assert.deepEqual(diagnosticBlockers(d), { retryHeld: [], providerDayLimited: [], allowanceUsed: [], needsAttention: [], paced: [], needsCredential: [] })
})

check('an unreadable usage record is needs-attention, never Ready or fake allowance use', () => {
  const unavailable = { ...tier('groq', 'Groq', 'unavailable'), ledgerUnavailable: true }
  const d = diagnostics([unavailable], { unavailableTiers: ['groq'], blockingTiers: ['groq'] })
  assert.equal(tierStatusCopy(unavailable, 0), "Can't check today's use")
  assert.deepEqual(diagnosticBlockers(d), {
    retryHeld: [], providerDayLimited: [], allowanceUsed: [], needsAttention: ['Groq'], paced: [], needsCredential: [],
  })
})

// ---- a rejected credential must NOT read as patience ---------------------------------------------------
// The live failure: Mistral answered 401/403 on every call for 46 consecutive failures and 42+ hours, scoring
// nothing, while this panel said "Waiting after rejected provider access · try again in ~43m". The countdown
// was accurate and completely misleading — no amount of waiting fixes a key the provider refuses.
check('a rejected credential outranks the retry countdown and names the env var to fix', () => {
  const dead = {
    ...tier('mistral', 'Mistral', 'cooling'),
    cooldownReason: 'provider-access', consecutiveFailures: 46, credentialRejected: true,
    keyEnvVar: 'MISTRAL_API_KEY', failingForMs: 42 * 3_600_000, triageScoredBatchesToday: 0,
  }
  const copy = tierStatusCopy(dead, 43 * 60_000)
  assert.match(copy, /^Needs a working key/, 'the fault leads, not the timer')
  assert.match(copy, /failing for 42h/, 'the streak duration is named — the backoff window pins flat and cannot say this')
  assert.match(copy, /0 checked today/)
  assert.match(copy, /replace MISTRAL_API_KEY/, 'the operator is told WHICH credential')
  assert.doesNotMatch(copy, /try again in/, 'the countdown must not be the headline for a fault retrying cannot fix')
})

check('the credential fault is its own blocker group, never filed under needs-attention', () => {
  const dead = { ...tier('mistral', 'Mistral', 'cooling'), credentialRejected: true, keyEnvVar: 'MISTRAL_API_KEY' }
  const d = diagnostics([dead], { needsCredentialTiers: ['mistral'], blockingTiers: ['mistral'] })
  const b = diagnosticBlockers(d)
  assert.deepEqual(b.needsCredential, ['Mistral'])
  assert.deepEqual(b.needsAttention, [], "needs-attention means \"can't read today's usage\" — a different fault with a different fix")
  // and it still surfaces against an engine that has the per-tier flag but not yet the group (rolling deploy)
  const older = diagnostics([dead], { blockingTiers: ['mistral'] })
  assert.deepEqual(diagnosticBlockers(older).needsCredential, ['Mistral'])
})

check('a timeout names the measured duration, so "is our deadline too short?" is answerable', () => {
  const at30 = { ...tier('openrouter', 'OpenRouter', 'cooling'), cooldownReason: 'timeout', lastFailureMs: 30_000 }
  assert.equal(tierStatusCopy(at30, 50 * 60_000), 'Paused after a request took too long at 30.0s · try again in ~50m')
  // an early refusal reads differently — a longer deadline would not have helped
  const at1 = { ...at30, lastFailureMs: 1_200 }
  assert.match(tierStatusCopy(at1, 60_000), /at 1\.2s/)
  // and with nothing measured (an older engine's marker) the line is exactly what it always was
  const unmeasured = { ...tier('openrouter', 'OpenRouter', 'cooling'), cooldownReason: 'timeout' }
  assert.equal(tierStatusCopy(unmeasured, 5 * 60_000), 'Paused after a request took too long · try again in ~5m')
})

check('a single provider-access failure is unlucky, not a dead key — no premature blame', () => {
  // the flag comes from the SERVER (credentialRejected), so the view must not invent it from the reason alone
  const oneOff = { ...tier('mistral', 'Mistral', 'cooling'), cooldownReason: 'provider-access', consecutiveFailures: 1 }
  const copy = tierStatusCopy(oneOff, 5 * 60_000)
  assert.equal(copy, 'Paused after a sign-in error · try again in ~5m')
  assert.deepEqual(diagnosticBlockers(diagnostics([oneOff], { blockingTiers: ['mistral'] })).needsCredential, [])
})

check('a disabled optional provider stays visible with its operator action', () => {
  const optional = {
    ...tier('omniroute', 'OmniRoute', 'disabled'),
    enabled: false,
    disabledReason: 'Provisioning pending · the deploy agent retries installation and the complete 12-item scorer smoke automatically; OmniRoute enables only after that proof passes',
  }
  assert.equal(tierStatusCopy(optional, 0), optional.disabledReason)
})

const FLOW_NOW = Date.parse('2026-08-13T00:00:00Z')
const FLOW_TS = '2026-08-13T00:00:00Z'
const completeHistory: NonNullable<PipelineFlowRates['history']> = {
  coverage: 'complete',
  requiredDates: ['2026-08-12', '2026-08-13'],
  readDates: ['2026-08-12', '2026-08-13'],
  missingDates: [],
  unreadableDates: [],
  corruptCycleRows: 0,
}

const flow = (gap: number, status: PipelineFlowRates['comparison']['status']): PipelineFlowRates => ({
  windowMinutes: 60,
  from: '2026-08-12T23:00:00Z',
  to: FLOW_TS,
  history: { ...completeHistory },
  inflow: { items: 100, perSecond: 100 / 3600, measured: true, coverage: 'complete', knownCycles: 3, totalCycles: 3 },
  scanning: { items: 100 + gap, perSecond: (100 + gap) / 3600, measured: true, coverage: 'complete', knownCycles: 3, totalCycles: 3 },
  comparison: { measured: true, status, scanningMinusInflowItemsPerHour: gap },
})

check('pipeline rate formatting keeps a one-item-per-hour flow visible', () => {
  assert.equal(fmtPipelineRate(1 / 3600), '0.0003')
  assert.equal(fmtPipelineRate(0), '0.000')
  assert.equal(fmtPipelineRate(null), '—')
})

check('last-look copy uses unique arrivals and never relabels legacy fresh-path rows as new', () => {
  assert.equal(
    lastCycleArrivalCopy({ newArrivals: 8, fresh: 10, carryover: 24 }),
    '8 new · 2 waiting from before · 24 carried over',
  )
  assert.equal(lastCycleArrivalCopy({ fresh: 10, carryover: 24 }), null, 'legacy payload omits the unprovable split')
})

check('daily outcome copy marks every counter as a lower bound when a started look has no summary', () => {
  assert.equal(
    todayOutcomeCopy({
      read: 7, kept: 5, dropped: 2, cycles: 3, durablyCommitted: true,
      incompleteCycles: 1, totalsLowerBound: true,
    }),
    'at least 7 checked · at least 5 kept · at least 2 ignored · some totals may be missing: 1 check did not finish recording',
  )
  assert.equal(
    todayOutcomeCopy({
      read: 7, kept: 5, dropped: 2, cycles: 3, durablyCommitted: false,
      incompleteCycles: 2, totalsLowerBound: true,
    }),
    '7 checked · 5 kept · 2 ignored · older report; totals may be incomplete: 2 checks did not finish recording',
  )
})

check('daily outcome copy is unavailable when every started look lacks a summary or its authority is unreadable', () => {
  assert.equal(
    todayOutcomeCopy({ read: 0, kept: 0, dropped: 0, cycles: 0, incompleteCycles: 1, totalsLowerBound: true }),
    'Totals are not available — 1 check did not finish recording.',
  )
  assert.equal(
    todayOutcomeCopy({ read: 0, kept: 0, dropped: 0, cycles: 0, totalsLowerBound: true }, true),
    'Totals are not available — the record of finished checks cannot be read.',
  )
  assert.equal(todayOutcomeCopy({ read: 0, kept: 0, dropped: 0, cycles: 0 }), null)
})

check('daily outcome copy names partition and corrupt-row debt instead of presenting exact totals', () => {
  assert.equal(
    todayOutcomeCopy({
      read: 0, kept: 0, dropped: 0, cycles: 0,
      durablyCommitted: true, totalsLowerBound: true, historyStatus: 'missing', corruptCycleRows: 0,
    }),
    "Totals are not available — today's saved check record is missing.",
  )
  assert.equal(
    todayOutcomeCopy({
      read: 7, kept: 5, dropped: 2, cycles: 3,
      durablyCommitted: true, totalsLowerBound: true, historyStatus: 'complete', corruptCycleRows: 1,
    }),
    'at least 7 checked · at least 5 kept · at least 2 ignored · some totals may be missing: 1 saved check record cannot be read',
  )
})

check('missed-item totals stay unavailable when history is partial or an older server omitted retirements', () => {
  const exactToday = {
    read: 7, kept: 5, dropped: 2, cycles: 3, durablyCommitted: true,
    incompleteCycles: 0, totalsLowerBound: false,
  }
  const exactBacklog = { ...diagnostics([]).backlog, retiredToday: 4 }
  assert.equal(dailyLossTotalsAvailable(exactToday, exactBacklog), true)
  assert.equal(dailyLossTotalsAvailable({ ...exactToday, totalsLowerBound: true }, exactBacklog), false)
  assert.equal(dailyLossTotalsAvailable(exactToday, { ...exactBacklog, retiredToday: undefined }), false,
    'missing rolling-deploy fields never become an exact zero')
})

check('flow copy names ahead, equal headroom, and falling-behind gaps in items/hour', () => {
  const ahead = pipelineFlowPresentation(flow(25, 'ahead'), FLOW_TS, FLOW_NOW)
  assert.equal(ahead.tone, 'ahead')
  assert.equal(ahead.inflowRate, '0.0278')
  assert.equal(ahead.scanningRate, '0.0347')
  assert.equal(ahead.gapCopy, 'Yes — it checks about 25 more items each hour than arrive.')
  assert.equal(ahead.coverageCopy, 'Based on the last 60 minutes (3 finished checks).')

  const equal = pipelineFlowPresentation(flow(0, 'equal'), FLOW_TS, FLOW_NOW)
  assert.equal(equal.tone, 'equal')
  assert.equal(equal.gapCopy, 'Only just — it is keeping up, but there is no spare room if more news arrives.')

  const behind = pipelineFlowPresentation(flow(-40, 'behind'), FLOW_TS, FLOW_NOW)
  assert.equal(behind.tone, 'behind')
  assert.equal(behind.gapCopy, 'No — about 40 more items arrive each hour than it checks.')
})

check('partial legacy flow never presents a comparison or turns unknown inflow into zero', () => {
  const partial = flow(25, 'unavailable')
  partial.inflow = { items: null, perSecond: null, measured: false, coverage: 'partial', knownCycles: 2, totalCycles: 3 }
  partial.comparison = { measured: false, status: 'unavailable', scanningMinusInflowItemsPerHour: null }
  const view = pipelineFlowPresentation(partial, FLOW_TS, FLOW_NOW)
  assert.equal(view.tone, 'unavailable')
  assert.equal(view.inflowRate, '—')
  assert.equal(view.gapCopy, 'We can’t compare the two numbers yet.')
  assert.equal(view.coverageCopy, 'Some recent totals are missing.')
})

check('deploy skew without a flow field is explicit, not a measured zero-rate state', () => {
  const view = pipelineFlowPresentation(undefined, FLOW_TS, FLOW_NOW)
  assert.equal(view.inflowRate, '—')
  assert.equal(view.gapCopy, 'We can’t tell yet.')
  assert.equal(view.coverageCopy, 'The scanner has not sent enough recent information.')
})

check('an invalid rate fails closed instead of showing NaN or pretending it is zero', () => {
  const invalid = flow(25, 'ahead')
  invalid.inflow.perSecond = Number.NaN
  const view = pipelineFlowPresentation(invalid, FLOW_TS, FLOW_NOW)
  assert.equal(view.tone, 'unavailable')
  assert.equal(view.inflowRate, '—')
  assert.equal(view.scanningRate, '—')
  assert.equal(view.gapCopy, 'We can’t tell yet.')
  assert.equal(view.coverageCopy, 'The scanner sent a number that cannot be read. Refresh to check again.')
})

check('stale diagnostics fail closed even when their last rate values were healthy', () => {
  const staleNow = FLOW_NOW + 60_001
  const view = pipelineFlowPresentation(flow(25, 'ahead'), FLOW_TS, staleNow)
  assert.equal(view.tone, 'unavailable')
  assert.equal(view.inflowRate, '—')
  assert.equal(view.scanningRate, '—')
  assert.equal(view.gapCopy, 'The numbers are out of date.')
  assert.equal(view.coverageCopy, 'Refresh to check again.')
})

check('either the diagnostics clock or the flow clock can make a snapshot stale', () => {
  const now = FLOW_NOW + 50_000
  const staleDiagnostics = new Date(FLOW_NOW - 20_000).toISOString()
  const staleFlow = flow(25, 'ahead')
  staleFlow.to = new Date(FLOW_NOW - 20_000).toISOString()
  assert.equal(pipelineFlowPresentation(flow(25, 'ahead'), staleDiagnostics, now).tone, 'unavailable')
  assert.equal(pipelineFlowPresentation(staleFlow, new Date(now).toISOString(), now).tone, 'unavailable')
})

check('missing required partition history hides rates and names the coverage debt', () => {
  const incomplete = flow(25, 'ahead')
  incomplete.history = {
    ...completeHistory,
    coverage: 'partial',
    readDates: ['2026-08-13'],
    missingDates: ['2026-08-12'],
  }
  const view = pipelineFlowPresentation(incomplete, FLOW_TS, FLOW_NOW)
  assert.equal(view.tone, 'unavailable')
  assert.equal(view.inflowRate, '—')
  assert.equal(view.scanningRate, '—')
  assert.equal(view.gapCopy, 'We can’t tell yet.')
  assert.equal(view.coverageCopy, 'Some recent records are missing')
})

check('started-without-summary and unreadable safety-marker debt are named instead of blamed on partitions', () => {
  const incomplete = flow(25, 'ahead')
  incomplete.history = {
    ...completeHistory,
    coverage: 'partial',
    incompleteCycles: 2,
    gapMarkerUnreadable: true,
  }
  const view = pipelineFlowPresentation(incomplete, FLOW_TS, FLOW_NOW)
  assert.equal(view.tone, 'unavailable')
  assert.equal(
    view.coverageCopy,
    '2 recent checks did not finish recording · The record of finished checks cannot be read',
  )
  assert.doesNotMatch(view.coverageCopy, /partition/i)
})

check('deploy skew without partition coverage fails closed instead of trusting numeric rates', () => {
  const older = flow(25, 'ahead')
  delete older.history
  const view = pipelineFlowPresentation(older, FLOW_TS, FLOW_NOW)
  assert.equal(view.tone, 'unavailable')
  assert.equal(view.inflowRate, '—')
  assert.equal(view.coverageCopy, 'This scanner has not sent a complete recent record.')
})

console.log(`\npipelineDiagnosticsView.test: ${passed} checks passed`)
