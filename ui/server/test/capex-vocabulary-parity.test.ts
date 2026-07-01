// Regression guards for the capex event type (shipped in #136) — the three defects Codex flagged on
// that PR that landed in main unaddressed. Expected values are pinned to the code's OWN stated
// contracts, not to current behaviour:
//   1. groq.ts comments its EVENT_TYPES as "the fixed event-type vocabulary the gauntlet uses
//      (signal_payload.schema.json)" — so the news-triage list and the schema enum MUST match.
//      #136 added capex to groq but not the schema enum (the P1 drift); this asserts they stay equal.
//   2. rank-weights.ts ties capex = capital_actions (weight 6); order.ts must give capex the same
//      speed/reversibility treatment as capital_actions, else a capex-dominant theme under-ranks its
//      directly-named issuer (the P2 on rank-weights.ts / order.ts).
//   3. the triage capex definition must exclude a COUNTRY's aggregate/government capex the same way
//      the article-read THEME rule does, so a public-infrastructure headline stays macro_sector (P2).
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { EVENT_TYPES, SYSTEM, ARTICLE_SYSTEM } from '../src/news/triage/groq'
import { companyImpact } from '../src/news/themes/order'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../..')

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

// ---- P1: news-triage EVENT_TYPES must equal the signal-gate schema enum ----
check('groq EVENT_TYPES stays in lockstep with signal_payload.schema.json event_types enum', () => {
  const schema = JSON.parse(readFileSync(path.join(repoRoot, 'frameworks/screener/signal_payload.schema.json'), 'utf8'))
  const schemaEnum: string[] = schema.properties.event_types.items.enum
  const triage = new Set(EVENT_TYPES)
  const enumSet = new Set(schemaEnum)
  // documented invariant: the two vocabularies are identical (order-insensitive)
  const onlyInTriage = [...triage].filter((t) => !enumSet.has(t))
  const onlyInSchema = [...enumSet].filter((t) => !triage.has(t))
  assert.deepEqual(onlyInTriage, [], `event types in triage but NOT the schema enum (would produce/expect a tag the gauntlet contract rejects): ${onlyInTriage.join(', ')}`)
  assert.deepEqual(onlyInSchema, [], `event types in the schema enum but NOT triage: ${onlyInSchema.join(', ')}`)
  assert.ok(triage.has('capex') && enumSet.has('capex'), 'capex must be present in BOTH')
})

// ---- P2a: capex gets first-order speed/reversibility like its tied event capital_actions ----
check('a capex-dominant primary issuer is ordered like capital_actions, not the generic fallback', () => {
  const signals = { mention_count: 3, avg_score: 100, dominant_linkage: 'primary' as const, dominant_event_type: 'capex' }
  const capex = companyImpact(signals)
  const capitalActions = companyImpact({ ...signals, dominant_event_type: 'capital_actions' })
  // same treatment as its tied event
  assert.equal(capex.impact.speed, capitalActions.impact.speed, 'capex speed should equal capital_actions speed (both FAST_EVENTS)')
  assert.equal(capex.impact.reversibility, capitalActions.impact.reversibility, 'capex reversibility should equal capital_actions (both MEDIUM_REV_EVENTS)')
  // and NOT the untagged-fallback numbers (speed 8 / reversibility 10) — proves it left the generic path
  assert.equal(capex.impact.speed, 22)
  assert.equal(capex.impact.reversibility, 16)
  assert.equal(capex.order, 1, 'a directly-named, high-materiality capex issuer should reach order tier 1')
})

// ---- P2b: the capex definition excludes country/government aggregate capex — on BOTH the
// title-triage (SYSTEM) and article-read (ARTICLE_SYSTEM) prompts, else enrichment re-tags a
// public-infrastructure story as capex and reintroduces the mis-tag (PR #150 Codex review). ----
// pin to the exact standardized exclusion clause — the pre-fix ARTICLE_SYSTEM said only "a COUNTRY's
// aggregate capex plan", so a looser match (on "aggregate", or on "government" which also appears
// later in the same line via "A government/regulator/court action") would pass on both old and new
// and prove nothing. This phrase appears ONLY in the corrected capex definition.
const exclusion = /government capex or public-infrastructure plan, which stays macro_sector/
check('title-triage (SYSTEM) capex definition keeps a country/government aggregate capex in macro_sector', () => {
  assert.ok(exclusion.test(SYSTEM), 'the SYSTEM capex event_types definition must exclude a country/government/public-infrastructure capex')
})
check('article-read (ARTICLE_SYSTEM) capex THEME rule keeps a country/government aggregate capex in macro_sector', () => {
  assert.ok(exclusion.test(ARTICLE_SYSTEM), 'the ARTICLE_SYSTEM capex THEME rule must carry the SAME government/public-infrastructure exclusion, or enrichment re-tags public capex as capex')
})

console.log(`\n${passed} checks passed`)
