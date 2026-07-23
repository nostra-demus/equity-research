// tierMeter picks the "binding" budget dimension for a triage tier's chip and formats it.
// Run: npx tsx src/components/screener/pipelineMeter.test.ts
//
// Expected values are pinned to the tierMeter CONTRACT, not to current code:
//   - "$-metered tiers show $" (Haiku last-resort, meter:'usd').
//   - a token-gated tier "carr[ies] tokenCap so the chip reports tokens (the binding limit)"
//     (scheduler.ts:207/258; TierDiagnostics.tokenCap doc) — so a tier with a tokenCap but NO reqCap must
//     report tokens even while idle. The pre-fix code defaulted reqFrac to 0, so an idle token-only tier
//     (tokFrac 0 !> reqFrac 0) fell through to the request branch and printed "0/0 req" — the bug this guards.
import assert from 'node:assert/strict'
import type { TierDiagnostics } from '../../lib/types'
import { tierMeter } from './pipelineMeter'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const base = (o: Partial<TierDiagnostics>): TierDiagnostics => ({
  id: 't', label: 'T', color: '--accent', role: 'overflow', order: 1, enabled: true,
  meter: 'requests', health: 'healthy', ...o,
})

// --- the bug: an idle token-only tier (tokenCap, no reqCap) must report tokens, not "0/0 req" ---
check('token-only tier, idle → reports tokens (0/500k tok), not 0/0 req', () => {
  const m = tierMeter(base({ tokenCap: 500_000, tokensToday: 0 }))
  assert.equal(m.label, '0/500k tok')
  assert.equal(m.frac, 0)
})

check('token-only tier, mid-usage → reports tokens with correct frac', () => {
  const m = tierMeter(base({ tokenCap: 500_000, tokensToday: 250_000 }))
  assert.equal(m.label, '250k/500k tok')
  assert.equal(m.frac, 0.5)
})

// --- existing tier shapes must be UNCHANGED by the fix ---
check('request-only tier (Gemini shape), idle → reports requests', () => {
  const m = tierMeter(base({ role: 'gemini', reqCap: 1500, requestsToday: 0 }))
  assert.equal(m.label, '0/1.5k req')
  assert.equal(m.frac, 0)
})

check('both caps (Groq/overflow shape), requests the binding one → reports requests', () => {
  const m = tierMeter(base({ reqCap: 1000, requestsToday: 600, tokenCap: 1_000_000, tokensToday: 100_000 }))
  assert.equal(m.label, '600/1.0k req')
  assert.equal(m.frac, 0.6)
})

check('both caps, tokens the binding one → reports tokens', () => {
  const m = tierMeter(base({ reqCap: 1000, requestsToday: 100, tokenCap: 1_000_000, tokensToday: 800_000 }))
  assert.equal(m.label, '800k/1000k tok')
  assert.equal(m.frac, 0.8)
})

check('usd-metered tier (Haiku last-resort) → shows $', () => {
  const m = tierMeter(base({ role: 'last-resort', meter: 'usd', usdToday: 12.5, usdCap: 50 }))
  assert.equal(m.label, '$12.50 / $50')
  assert.equal(m.frac, 0.25)
})

console.log(`\npipelineMeter.test: ${passed} checks passed`)
