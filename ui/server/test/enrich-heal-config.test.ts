// config.ts documents NEWS_ENRICH_HEAL_MAX_PER_CYCLE / NEWS_ENRICH_COLD_MAX_PER_CYCLE as "0 disables" —
// but capNum's `n > 0` guard treats an explicit "0" as unset and silently substitutes the default,
// making the documented disable switch unreachable via env var (Codex review, PR #350). This pins the
// fix (capNumOrZero) with a real process env var, dynamic-imported so config.ts reads it fresh.
//
// Run: npx tsx test/enrich-heal-config.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

process.env.NEWS_ENRICH_HEAL_MAX_PER_CYCLE = '0'
process.env.NEWS_ENRICH_COLD_MAX_PER_CYCLE = '0'
const { NEWS } = await import('../src/config')

check('NEWS_ENRICH_HEAL_MAX_PER_CYCLE=0 is honoured, not silently replaced by the default', () => {
  assert.equal(NEWS.enrichHealMaxPerCycle, 0, 'an explicit 0 must disable repair, per the documented contract')
})

check('NEWS_ENRICH_COLD_MAX_PER_CYCLE=0 is honoured, not silently replaced by the default', () => {
  assert.equal(NEWS.enrichColdMaxPerCycle, 0, 'an explicit 0 must disable discovery, per the documented contract')
})

console.log(`\nenrich-heal-config.test.ts: ${passed} passed`)
