// Regression guards for the high-signal "Key Development" event subtypes (Capital IQ parity) added on top
// of the original 15-type vocabulary. These are the §13 red-flag / §24 rejector-filter events the coarse
// buckets used to smear together (a default read as a routine debt raise, a rating downgrade == a bond
// sale, a dividend CUT == a routine payout). The invariants below pin the code's OWN stated contracts:
//   1. every subtype is in BOTH the triage vocabulary and the signal-gate schema enum (lockstep — the
//      general check lives in capex-vocabulary-parity.test.ts; this asserts the new family explicitly).
//   2. NO triage event type is left without a wire weight (rank-weights.ts) — the exact "dormant slot"
//      defect the taxonomy audit called out. And no stray weight key that isn't a real event type.
//   3. the distress/red-flag family sits at the top of the wire scale (default ties mna); routine flow
//      (insider trade, index rebalance) sits below governance/distress.
//   4. a distress-dominant, directly-named issuer is ordered FAST + PERMANENT (order.ts), like the
//      strongest existing events — not the generic untagged fallback.
//   5. both prompts (title-triage SYSTEM and article-read ARTICLE_SYSTEM) actually DEFINE the distress
//      subtypes, so the model can emit them rather than just seeing an undefined token in a list.
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { EVENT_TYPES, SYSTEM, ARTICLE_SYSTEM } from '../src/news/triage/groq'
import { DEFAULT_RANK_WEIGHTS } from '../src/news/rank-weights'
import { companyImpact } from '../src/news/themes/order'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../..')

// The 11 high-signal subtypes added in this stage.
const NEW_TYPES = [
  'default_distress', 'credit_rating_downgrade', 'credit_rating_upgrade', 'accounting_restatement',
  'dividend_cut', 'executive_exit', 'ownership_activist', 'insider_transaction', 'strategic_review',
  'index_rebalance', 'restructuring_layoffs',
]

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e) {
    console.error(`  ✗   ${name}\n      ${(e as Error).message}`)
    process.exitCode = 1
  }
}

// ---- 1: each new subtype in BOTH the triage vocabulary and the schema enum ----
check('every new subtype is in the triage vocabulary AND the signal_payload schema enum', () => {
  const schema = JSON.parse(readFileSync(path.join(repoRoot, 'frameworks/screener/signal_payload.schema.json'), 'utf8'))
  const enumSet = new Set<string>(schema.properties.event_types.items.enum)
  const triage = new Set(EVENT_TYPES)
  for (const t of NEW_TYPES) {
    assert.ok(triage.has(t), `${t} missing from groq EVENT_TYPES`)
    assert.ok(enumSet.has(t), `${t} missing from signal_payload.schema.json enum`)
  }
})

// ---- 2: INVARIANT — no triage event type is left unweighted on the wire (the dormant-slot defect) ----
check('every triage event type carries a rank-weights weight; no stray weight keys', () => {
  const ev = DEFAULT_RANK_WEIGHTS.event
  const unweighted = EVENT_TYPES.filter((t) => typeof ev[t] !== 'number')
  assert.deepEqual(unweighted, [], `triage types with NO wire weight (would silently score 0): ${unweighted.join(', ')}`)
  const stray = Object.keys(ev).filter((k) => !EVENT_TYPES.includes(k))
  assert.deepEqual(stray, [], `wire weights for tokens that are not real event types: ${stray.join(', ')}`)
})

// ---- 3: the distress / red-flag family is weighted at the top; routine flow below ----
check('distress ties the top of the wire scale; governance outranks routine flow', () => {
  const ev = DEFAULT_RANK_WEIGHTS.event
  assert.equal(ev.default_distress, ev.mna, 'a default/bankruptcy/going-concern should tie mna at the top (§24 survival)')
  assert.ok(ev.credit_rating_downgrade >= 7 && ev.accounting_restatement >= 7, 'a rating downgrade / restatement is a top-band §13 signal')
  assert.ok(ev.default_distress > ev.operations, 'distress outranks routine operations news')
  assert.ok(ev.insider_transaction < ev.ownership_activist, 'a lone insider trade ranks below an activist / >5% stake')
  assert.ok(ev.credit_rating_downgrade > ev.credit_rating_upgrade, 'a downgrade is weighted above an upgrade (asymmetric, §24)')
})

// ---- 4: order.ts gives a distress issuer the same fast + permanent treatment as the strongest events ----
check('a directly-named distress issuer is ordered FAST + PERMANENT (tier 1), not the generic fallback', () => {
  const base = { mention_count: 3, avg_score: 100, dominant_linkage: 'primary' as const }
  const distress = companyImpact({ ...base, dominant_event_type: 'default_distress' })
  const mna = companyImpact({ ...base, dominant_event_type: 'mna' })
  assert.equal(distress.impact.speed, mna.impact.speed, 'default_distress speed should equal mna (both FAST_EVENTS = 22)')
  assert.equal(distress.impact.reversibility, mna.impact.reversibility, 'default_distress reversibility should equal mna (both PERMANENT = 22)')
  // and NOT the untagged-fallback numbers (speed 8 / reversibility 10) — proves it left the generic path
  assert.equal(distress.impact.speed, 22)
  assert.equal(distress.impact.reversibility, 22)
  assert.equal(distress.order, 1, 'a directly-named, high-materiality distress issuer should reach order tier 1')
})

// ---- 5: both prompts DEFINE the distress subtypes (not just list an undefined token) ----
check('both the title-triage and article-read prompts define the distress subtypes', () => {
  for (const [label, prompt] of [['SYSTEM', SYSTEM], ['ARTICLE_SYSTEM', ARTICLE_SYSTEM]] as const) {
    for (const t of ['default_distress', 'credit_rating_downgrade', 'accounting_restatement', 'dividend_cut']) {
      assert.ok(prompt.includes(t), `${label} prompt must mention ${t} so the model can emit it`)
    }
    // the disambiguation from the coarse parent must be present, or the model will keep using debt_credit
    assert.ok(/NOT a routine debt raise|not a routine debt raise|not debt_credit/i.test(prompt), `${label} must disambiguate default_distress from debt_credit`)
  }
})

console.log(`\n${passed} checks passed`)
