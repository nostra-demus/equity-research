import assert from 'node:assert/strict'
import type { NewsDiagnostics, TierDiagnostics } from '../../lib/types'
import { diagnosticBlockers, retryReasonLabel, tierStatusCopy } from './pipelineDiagnosticsView'

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

check('eligible and engine-allowance copy never claims provider health or a provider quota', () => {
  assert.equal(tierStatusCopy(tier('x', 'X', 'healthy'), 0), 'Ready to try')
  assert.equal(tierStatusCopy({ ...tier('x', 'X', 'healthy'), spendingAllowed: false }, 0), 'News engine is not running')
  assert.equal(tierStatusCopy(tier('x', 'X', 'budget-spent'), 0), "This app's daily amount is used")
  const providerDay = { ...tier('x', 'X', 'budget-spent'), providerDayExhausted: true, requestsToday: 16, reqCap: 45 }
  assert.equal(tierStatusCopy(providerDay, 0), "Provider says today's limit is used")
  assert.equal(providerDay.requestsToday, 16, 'provider-day state does not forge the meter to 45/45')
  assert.equal(tierStatusCopy({ ...providerDay, enabled: false, health: 'disabled' }, 0), 'Off', 'a stale marker on a disabled tier does not override its current state')
})

check('retry hold names the failure class and countdown, not a cooling provider quota', () => {
  const t = { ...tier('x', 'X', 'cooling'), cooldownReason: 'rate_limit' }
  const copy = tierStatusCopy(t, 25 * 60_000)
  assert.equal(copy, 'Waiting after a rate-limit response · try again in ~25m')
  assert.doesNotMatch(copy, /cool|quota/i)
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
  assert.equal(tierStatusCopy(unavailable, 0), "Can't read today's usage")
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
  assert.match(copy, /^Key rejected/, 'the fault leads, not the timer')
  assert.match(copy, /failing for 42h/, 'the streak duration is named — the backoff window pins flat and cannot say this')
  assert.match(copy, /0 scored today/)
  assert.match(copy, /check MISTRAL_API_KEY/, 'the operator is told WHICH credential')
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
  assert.equal(tierStatusCopy(at30, 50 * 60_000), 'Waiting after a request timeout at 30.0s · try again in ~50m')
  // an early refusal reads differently — a longer deadline would not have helped
  const at1 = { ...at30, lastFailureMs: 1_200 }
  assert.match(tierStatusCopy(at1, 60_000), /at 1\.2s/)
  // and with nothing measured (an older engine's marker) the line is exactly what it always was
  const unmeasured = { ...tier('openrouter', 'OpenRouter', 'cooling'), cooldownReason: 'timeout' }
  assert.equal(tierStatusCopy(unmeasured, 5 * 60_000), 'Waiting after a request timeout · try again in ~5m')
})

check('a single provider-access failure is unlucky, not a dead key — no premature blame', () => {
  // the flag comes from the SERVER (credentialRejected), so the view must not invent it from the reason alone
  const oneOff = { ...tier('mistral', 'Mistral', 'cooling'), cooldownReason: 'provider-access', consecutiveFailures: 1 }
  const copy = tierStatusCopy(oneOff, 5 * 60_000)
  assert.equal(copy, 'Waiting after rejected provider access · try again in ~5m')
  assert.deepEqual(diagnosticBlockers(diagnostics([oneOff], { blockingTiers: ['mistral'] })).needsCredential, [])
})

console.log(`\npipelineDiagnosticsView.test: ${passed} checks passed`)
