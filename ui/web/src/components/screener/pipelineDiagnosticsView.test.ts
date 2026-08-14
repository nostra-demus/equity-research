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
  assert.deepEqual(diagnosticBlockers(d), { retryHeld: ['OpenRouter'], providerDayLimited: [], allowanceUsed: ['Mistral'], needsAttention: [], paced: ['Groq'] })
})

check('provider-reported day limits are separate from configured engine allowance use', () => {
  const providerDay = { ...tier('openrouter', 'OpenRouter', 'budget-spent'), providerDayExhausted: true }
  const d = diagnostics([providerDay, tier('mistral', 'Mistral', 'budget-spent')], {
    providerDayExhaustedTiers: ['openrouter'], allowanceExhaustedTiers: ['mistral'], blockingTiers: ['openrouter', 'mistral'],
  })
  assert.deepEqual(diagnosticBlockers(d), {
    retryHeld: [], providerDayLimited: ['OpenRouter'], allowanceUsed: ['Mistral'], needsAttention: [], paced: [],
  })
})

check('old-engine payload derives disjoint groups from tier health', () => {
  const d = diagnostics([
    tier('nvidia', 'NVIDIA NIM', 'cooling'), tier('cerebras', 'Cerebras', 'budget-spent'), tier('groq', 'Groq', 'healthy'),
  ], { blockingTiers: ['nvidia', 'cerebras'] })
  assert.deepEqual(diagnosticBlockers(d), { retryHeld: ['NVIDIA NIM'], providerDayLimited: [], allowanceUsed: ['Cerebras'], needsAttention: [], paced: [] })
})

check('a non-owner process never presents configured tiers as actionable blockers', () => {
  const d = diagnostics([
    { ...tier('openrouter', 'OpenRouter', 'cooling'), spendingAllowed: false },
    { ...tier('groq', 'Groq', 'budget-spent'), spendingAllowed: false },
  ], { blockingTiers: ['openrouter', 'groq'] })
  assert.deepEqual(diagnosticBlockers(d), { retryHeld: [], providerDayLimited: [], allowanceUsed: [], needsAttention: [], paced: [] })
})

check('an unreadable usage record is needs-attention, never Ready or fake allowance use', () => {
  const unavailable = { ...tier('groq', 'Groq', 'unavailable'), ledgerUnavailable: true }
  const d = diagnostics([unavailable], { unavailableTiers: ['groq'], blockingTiers: ['groq'] })
  assert.equal(tierStatusCopy(unavailable, 0), "Can't read today's usage")
  assert.deepEqual(diagnosticBlockers(d), {
    retryHeld: [], providerDayLimited: [], allowanceUsed: [], needsAttention: ['Groq'], paced: [],
  })
})

console.log(`\npipelineDiagnosticsView.test: ${passed} checks passed`)
