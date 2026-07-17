// The PURE decision-record diff (src/run-diff.ts). No git, no tmpdir — fixtures are inlined, including
// the REAL EMAAR f12f7a0 -> 3513981 pair (trimmed to the fields that actually differ) and one specimen of
// every shape variant verified across the six committed decision records.
//
// What this is really guarding: a diff that fabricates is worse than no diff. Two traps are proven live
// on the user's own ticker and are asserted here:
//   (A) the PHANTOM diff — a Set/includes diff over dict-shaped red_flags reports every entry as both
//       added AND removed (two parsed JSON objects are never reference-equal), rendering "8 added /
//       8 removed" of "[object Object]" against BYTE-IDENTICAL flags;
//   (B) the SILENT no-change — reading `.score` off a bare-int module_scores value gives
//       `undefined === undefined`, so it reports "identical" about six numbers it never read.
// Plus the LENGTH trap: EMAAR's red_flags stayed 6 -> 6 while one entry was swapped.
// Run: npx tsx test/run-diff.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { canonicalJson, diffDecisionRecords, itemKey, itemText, moduleScore } from '../src/run-diff'

let pass = 0
let fail = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    pass++
    console.log(`ok  ${name}`)
  } catch (e: any) {
    fail++
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
  }
}

// ---------------------------------------------------------------------------------------------------
// The real EMAAR pair, trimmed to the fields that differ (verified against git).
// ---------------------------------------------------------------------------------------------------
const KILL_BASE = [
  'Q2 2026 (10 Aug) pre-sales growth < +16% YoY and falling / backlog growth stepping toward flat.',
  'A richly-priced parent asset injected from Dubai Holding and funded by new Emaar shares.',
  "Development gross margin fades below the guided 'low 50s' toward high-40s.",
  'FY2026 dividend cut or capped (declared ~Feb 2027) as cash is steered to the AED 200bn masterplan.',
  'Net cash swings to material net debt via a debt-funded capital call.',
]
const KILL_ADDED =
  'Founder-MD (Alabbar) departs abruptly with no succession plan, or evidence surfaces of Emaar<->Eagle Hills deal-flow diversion.'

const RF_SHARED = [
  'RF-OWN-004 (High) - unaligned Government-of-Dubai controller (Dubai Holding 29.73%). THE BINDING RATING CAP.',
  'RF-MGT-001 (High/watch) - Group CFO left abruptly (effective 20 May 2026).',
  'NCI (minority-interest) leakage (severity 52) - ~21% of consolidated profit belongs to outside shareholders.',
  'IAS 24 government-ecosystem RPT opacity (High disclosure gap).',
  'Earnings red-flag verdict: Material concerns (0 Critical, 6 High).',
]
const RF_REMOVED = 'Founder-MD / Eagle Hills conflict (High, unresolved) - the founder-MD (Alabbar, 0.03%) chairs a directly-competing developer.'
const RF_ADDED = 'WATCH-KEYPERSON (High, unresolved - cross-module corroborated this refresh at severity 45/100).'

const MISSING_BASE = [
  'IAS 24 government-ecosystem related-party detail - THE single highest-value next item.',
  'Verbatim earnings-call transcript (only sell-side proxies in the pool).',
  'CIQ ownership / insider-trading export (missing).',
  'Actual lender covenant thresholds + change-of-control / cross-default terms.',
  'Segment-level capital employed.',
  'Dubai off-plan pre-sales by developer.',
]
const MISSING_ADDED = 'A disclosed board-level MD/Chairman succession plan and any Emaar<->Eagle Hills deal-flow separation policy.'

const MODULES_PREV = {
  'business-model': { score: 60, verdict: 'Cyclical business - worth deeper work only with a strong Dubai-cycle timing edge; no disqualifier' },
  earnings: { score: 80, verdict: 'Mixed earnings setup (EQ 81); Material concerns (0 Critical, 6 High = one root cyclical risk)' },
  valuation: { score: 80, verdict: 'Modestly undervalued (base AED 15.00 vs 12.20; +18.7% MoS); dominant method SOTP' },
}
const MODULES_CUR = {
  'business-model': { score: 60, verdict: 'Cyclical business - worth deeper work only with a strong Dubai-cycle timing edge; no disqualifier. External-dependency risk corrected 63->62/100 this refresh.' },
  earnings: { score: 80, verdict: 'Mixed earnings setup (EQ 81); Material concerns (0 Critical, 6 High = one root cyclical risk). Unchanged by this refresh.' },
  valuation: { score: 80, verdict: 'Modestly undervalued (base AED 15.00 vs 12.20; +18.7% MoS); dominant method SOTP. No fair-value number changed by this refresh.' },
}

const EMAAR_PREV = {
  decision: 'Watchlist',
  confidence_score: 52,
  data_sufficiency_score: 80,
  edge_score: 38,
  expected_return_pct: 17.7,
  downside_risk_pct: 20.1,
  margin_of_safety_pct: 18.7,
  risk_reward: 0.88,
  entry_price: 12.2,
  thesis_type: ['Sector-cycle', 'Company-specific'],
  scenarios: [
    { label: 'bull', probability: 20, return_pct: 72.13, price_target: 21.0 },
    { label: 'base', probability: 45, return_pct: 22.95, price_target: 15.0 },
    { label: 'bear', probability: 35, return_pct: -20.08, price_target: 9.75 },
  ],
  kill_criteria: KILL_BASE,
  red_flags: [...RF_SHARED, RF_REMOVED],
  missing_data: MISSING_BASE,
  module_scores: MODULES_PREV,
  rating_cap: 'RF-OWN-004 caps the headline at Watchlist.',
  killer_risk: 'The value trap - a Government-of-Dubai controller with no incentive to crystallize.',
}
const EMAAR_CUR = {
  ...EMAAR_PREV,
  kill_criteria: [...KILL_BASE, KILL_ADDED],
  red_flags: [...RF_SHARED, RF_ADDED],
  missing_data: [...MISSING_BASE, MISSING_ADDED],
  module_scores: MODULES_CUR,
  rating_cap: 'RF-OWN-004 caps the headline at Watchlist; reinforced by a founder/key-person concentration flag (severity 45/100).',
  killer_risk: 'The value trap - a Government-of-Dubai controller, alongside a founder-MD with ~0.03% economic ownership.',
}

const emaar = diffDecisionRecords(EMAAR_PREV, EMAAR_CUR)

check("EMAAR pair -> verdict 'call_held', NOT 'identical'", () => {
  assert.equal(emaar.verdict, 'call_held')
})
check('EMAAR pair -> every anchor flat (the call, confidence, sufficiency, edge, exp ret, downside, MoS, r/r, price)', () => {
  const moved = emaar.anchors.filter((a) => a.moved).map((a) => a.field)
  assert.deepEqual(moved, [], `expected no anchor to move, got ${moved.join(', ')}`)
  assert.equal(emaar.anchorsMoved, false)
})
check('EMAAR pair -> scenarios + thesis_type deep-equal (structural, not scalar)', () => {
  assert.equal(emaar.anchors.find((a) => a.field === 'scenarios')!.moved, false)
  assert.equal(emaar.anchors.find((a) => a.field === 'thesis_type')!.moved, false)
})
check('EMAAR pair -> all module SCORES flat', () => {
  assert.deepEqual(emaar.modules.filter((m) => m.scoreMoved).map((m) => m.module), [])
  assert.ok(emaar.modules.every((m) => m.scoreReadable))
})
check('EMAAR pair -> headline is "The call didn\'t move."', () => {
  assert.equal(emaar.headline, "The call didn't move.")
})
check('EMAAR pair -> subline names Watchlist, confidence 52, expected return +17.7%', () => {
  assert.match(emaar.subline, /Watchlist → Watchlist/)
  assert.match(emaar.subline, /confidence 52 → 52/)
  assert.match(emaar.subline, /expected return \+17\.7% → \+17\.7%/)
})
check('EMAAR pair -> evidenceCount === 3 (kill_criteria +1, missing_data +1, red_flags ±1)', () => {
  assert.equal(emaar.evidenceCount, 3, `lists: ${emaar.lists.map((l) => l.field).join(', ')}`)
})
check('EMAAR pair -> red_flags 1 added / 1 removed DESPITE prevCount 6 === curCount 6   <-- the length trap', () => {
  const rf = emaar.lists.find((l) => l.field === 'red_flags')!
  assert.equal(rf.prevCount, 6)
  assert.equal(rf.curCount, 6)
  assert.equal(rf.added.length, 1)
  assert.equal(rf.removed.length, 1)
  assert.match(rf.added[0], /WATCH-KEYPERSON/)
  assert.match(rf.removed[0], /Eagle Hills conflict/)
})
check("EMAAR pair -> the added kill criterion's TEXT is carried, not just a count", () => {
  const kc = emaar.lists.find((l) => l.field === 'kill_criteria')!
  assert.equal(kc.added.length, 1)
  assert.match(kc.added[0], /Founder-MD \(Alabbar\) departs abruptly/)
})
check('EMAAR pair -> the module VERDICT strings land in prose, never in anchors', () => {
  const verdictProse = emaar.prose.filter((p) => p.field.startsWith('module_scores.'))
  assert.equal(verdictProse.length, 3)
  assert.ok(emaar.anchors.every((a) => !a.field.startsWith('module_scores')))
})
check('EMAAR pair -> wordingCount counts the rewritten prose (rating_cap, killer_risk, 3 module verdicts)', () => {
  assert.equal(emaar.wordingCount, 5, emaar.prose.map((p) => p.field).join(', '))
})

// ---- the two hard invariants -----------------------------------------------------------------------
check("INVARIANT: verdict 'call_held' always has belowCount > 0 (never an empty tail)", () => {
  assert.equal(emaar.verdict, 'call_held')
  assert.ok(emaar.belowCount > 0)
})
check("INVARIANT: 'identical' is emitted ONLY when canonicalJson(prev) === canonicalJson(cur)", () => {
  const same = diffDecisionRecords(EMAAR_PREV, JSON.parse(JSON.stringify(EMAAR_PREV)))
  assert.equal(same.verdict, 'identical')
  assert.equal(same.belowCount, 0)
  assert.equal(canonicalJson(EMAAR_PREV), canonicalJson(JSON.parse(JSON.stringify(EMAAR_PREV))))
})
check('INVARIANT: a records-differ-but-no-tier-saw-it change is NAMED, never rendered as identical', () => {
  const d = diffDecisionRecords({ decision: 'Buy', some_future_key: 1 }, { decision: 'Buy', some_future_key: 2 })
  assert.notEqual(d.verdict, 'identical')
  assert.ok(d.belowCount > 0)
  assert.ok(d.prose.some((p) => p.field === '_untracked'))
})
check('INVARIANT: prose-only rewrite never reports identical', () => {
  const d = diffDecisionRecords({ decision: 'Buy', notes: 'a' }, { decision: 'Buy', notes: 'b' })
  assert.equal(d.verdict, 'call_held')
  assert.equal(d.evidenceCount, 0)
  assert.equal(d.wordingCount, 1)
})

// ---- (A) the PHANTOM diff — dict-shaped red_flags, byte-identical ----------------------------------
const DICT_FLAGS = [
  { id: 'RF-ACC-001', severity: 'High', description: 'Receivables growing faster than revenue.', module: 'earnings' },
  { id: 'RF-GOV-002', severity: 'Medium', description: 'Board is 40% independent.', module: 'management-governance' },
]
check('AMZN/BG/HCG/TMCV shape: dict red_flags, byte-identical -> 0 added / 0 removed   <-- the phantom trap', () => {
  const a = { decision: 'Buy', red_flags: JSON.parse(JSON.stringify(DICT_FLAGS)) }
  const b = { decision: 'Buy', red_flags: JSON.parse(JSON.stringify(DICT_FLAGS)) }
  const d = diffDecisionRecords(a, b)
  assert.equal(d.verdict, 'identical')
  assert.equal(d.lists.length, 0, 'a set-diff over parsed objects would report 2 added / 2 removed here')
})
check('dict red_flag with a changed description under the SAME id -> reworded, not added+removed', () => {
  const b = JSON.parse(JSON.stringify(DICT_FLAGS))
  b[0].description = 'Receivables growing much faster than revenue.'
  const d = diffDecisionRecords({ decision: 'Buy', red_flags: DICT_FLAGS }, { decision: 'Buy', red_flags: b })
  const rf = d.lists.find((l) => l.field === 'red_flags')!
  assert.equal(rf.added.length, 0)
  assert.equal(rf.removed.length, 0)
  assert.equal(rf.reworded.length, 1)
  assert.equal(rf.reworded[0].key, 'id:RF-ACC-001')
})
check('no itemText output ever contains the literal "[object Object]"', () => {
  for (const x of [DICT_FLAGS[0], { weird: true }, { a: [1, 2] }, 42, null]) {
    assert.ok(!itemText(x).includes('[object Object]'), `itemText(${JSON.stringify(x)})`)
  }
})
check('TMCV shape: dict kill_criteria with NO id -> keyed on `condition`; identical input -> 0 added/removed', () => {
  const kc = [{ condition: 'Margin falls below 20%', what_it_means: 'the moat is gone', module_source: 'earnings' }]
  assert.equal(itemKey(kc[0]), 'condition:Margin falls below 20%')
  const d = diffDecisionRecords({ kill_criteria: kc }, { kill_criteria: JSON.parse(JSON.stringify(kc)) })
  assert.equal(d.lists.length, 0)
})
check('TMCV shape: an edit to what_it_means under the SAME condition reads as reworded, not add+remove', () => {
  const a = [{ condition: 'Margin falls below 20%', what_it_means: 'the moat is gone' }]
  const b = [{ condition: 'Margin falls below 20%', what_it_means: 'the moat is gone; exit' }]
  const d = diffDecisionRecords({ kill_criteria: a }, { kill_criteria: b })
  const kc = d.lists.find((l) => l.field === 'kill_criteria')!
  assert.equal(kc.added.length + kc.removed.length, 0)
  assert.equal(kc.reworded.length, 1)
})

// ---- (B) the SILENT no-change — bare-int module_scores ---------------------------------------------
check('EMAAR_2026-07-03 shape: module_scores as BARE INTS -> read, scoreReadable true   <-- the silent trap', () => {
  const r = moduleScore(51)
  assert.deepEqual(r, { score: 51, verdict: null, readable: true })
  const d = diffDecisionRecords({ module_scores: { 'business-model': 51 } }, { module_scores: { 'business-model': 63 } })
  const m = d.modules[0]
  assert.equal(m.prevScore, 51)
  assert.equal(m.curScore, 63)
  assert.equal(m.scoreMoved, true, 'reading .score off an int gives undefined===undefined -> a false "identical"')
  assert.equal(d.anchorsMoved, true)
})
check('module_scores {score,verdict} vs bare int across revisions -> the NUMBER is compared, verdictChanged false', () => {
  const d = diffDecisionRecords({ module_scores: { earnings: 51 } }, { module_scores: { earnings: { score: 51, verdict: 'Mixed' } } })
  assert.equal(d.modules[0].scoreMoved, false)
  assert.equal(d.modules[0].verdictChanged, false)
  assert.equal(d.modules[0].scoreReadable, true)
})
check('module_scores value of an unknown shape -> scoreReadable false, reported UNKNOWN, never flat', () => {
  const d = diffDecisionRecords({ module_scores: { x: 'n/a' } }, { module_scores: { x: 'n/a' } })
  assert.equal(d.modules[0].scoreReadable, false)
  assert.equal(d.modules[0].prevScore, null)
  assert.equal(d.modules[0].scoreMoved, false)
})

// ---- shape tolerance ------------------------------------------------------------------------------
check('thesis_type is a LIST -> structural deep-equal, no throw', () => {
  const d = diffDecisionRecords({ thesis_type: ['Sector-cycle'] }, { thesis_type: ['Sector-cycle', 'Company-specific'] })
  const a = d.anchors.find((x) => x.field === 'thesis_type')!
  assert.equal(a.moved, true)
  assert.equal(a.prev, '1 entries')
  assert.equal(a.cur, '2 entries')
})
check('scenarios absent in both (BG/HCG/TMCV shape) -> no scenarios anchor emitted', () => {
  const d = diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy' })
  assert.equal(d.anchors.find((a) => a.field === 'scenarios'), undefined)
})
check('upgrade_triggers absent in both (5 of 6 records) -> no ListDelta emitted', () => {
  const d = diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy' })
  assert.equal(d.lists.find((l) => l.field === 'upgrade_triggers'), undefined)
})
check('upgrade_triggers present in cur only -> all entries added + the field is flagged new', () => {
  const d = diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy', upgrade_triggers: ['a mall spin/REIT'] })
  const ut = d.lists.find((l) => l.field === 'upgrade_triggers')!
  assert.equal(ut.added.length, 1)
  assert.match(ut.note!, /new in this version/)
})
check('an unknown item shape -> reads as changed (fails toward SHOWING, never hiding)', () => {
  const d = diffDecisionRecords({ red_flags: [{ zz: 1 }] }, { red_flags: [{ zz: 2 }] })
  const rf = d.lists.find((l) => l.field === 'red_flags')!
  assert.equal(rf.added.length, 1)
  assert.equal(rf.removed.length, 1)
})

// ---- itemText must never drop an entry's BODY (the TMCV `trigger` shape) ---------------------------
// Found in review: TEXT_FIELDS omitted `trigger`, and `severity` alone satisfied the "found something"
// check — so all NINE of TMCV's real red flags collapsed to the literal string "(High)", and an added
// Critical flag would have been reported to the reader as "a red flag was added: (Critical)".
const TMCV_FLAG = {
  id: 'RF-CAP-001',
  severity: 'High',
  source: 'FY26 filing',
  trigger: 'Iveco EUR3.8bn acquisition — zero ROIC target, synergy, or leverage ceiling disclosed; 3.3x book equity',
}
check('itemText keeps the BODY of a TMCV-shaped red flag (trigger), not just its severity', () => {
  const t = itemText(TMCV_FLAG)
  assert.match(t, /Iveco EUR3\.8bn acquisition/)
  assert.match(t, /\(High\)/)
  assert.notEqual(t, '(High)', 'severity alone must never be the whole rendered entry')
})
check('an added Critical flag of the TMCV shape names the FINDING, not just "(Critical)"', () => {
  const crit = { id: 'RF-NEW-001', severity: 'Critical', trigger: 'Auditor resigned mid-audit citing unreconciled related-party balances' }
  const d = diffDecisionRecords({ red_flags: [TMCV_FLAG] }, { red_flags: [TMCV_FLAG, crit] })
  const rf = d.lists.find((l) => l.field === 'red_flags')!
  assert.equal(rf.added.length, 1)
  assert.match(rf.added[0], /Auditor resigned mid-audit/)
})
check('an UNMAPPED body key falls through to canonical JSON — never a bare severity', () => {
  const t = itemText({ id: 'X', severity: 'High', someFutureBodyKey: 'the actual finding' })
  assert.notEqual(t, '(High)')
  assert.match(t, /the actual finding/)
})
check('a same-severity swap is still distinguishable (both texts survive)', () => {
  const a = { id: 'RF-1', severity: 'High', trigger: 'first finding' }
  const b = { id: 'RF-2', severity: 'High', trigger: 'second finding' }
  const d = diffDecisionRecords({ red_flags: [a] }, { red_flags: [b] })
  const rf = d.lists.find((l) => l.field === 'red_flags')!
  assert.match(rf.added[0], /second finding/)
  assert.match(rf.removed[0], /first finding/)
})
check('a reworded TMCV flag under the same id shows the NEW body, not "(High)"', () => {
  const b = { ...TMCV_FLAG, trigger: 'Iveco deal repriced; still no ROIC target disclosed' }
  const d = diffDecisionRecords({ red_flags: [TMCV_FLAG] }, { red_flags: [b] })
  const rf = d.lists.find((l) => l.field === 'red_flags')!
  assert.equal(rf.reworded.length, 1)
  assert.match(rf.reworded[0].cur, /repriced/)
})

// ---- direction 'changed' is NOT a scored tone ------------------------------------------------------
check("a margin of safety that FIRST APPEARS is neutral, never 'worse' (red)", () => {
  // margin_of_safety_pct is genuinely absent in 5 of the 6 committed records — this is the common path
  const d = diffDecisionRecords({ decision: 'Watchlist' }, { decision: 'Watchlist', margin_of_safety_pct: 18.7 })
  const a = d.anchors.find((x) => x.field === 'margin_of_safety_pct')!
  assert.equal(a.direction, 'changed')
  assert.equal(a.tone, 'neutral', 'establishing a margin of safety must not render as a deterioration')
})
check('a higher_better anchor that DISAPPEARS is neutral, not scored', () => {
  const d = diffDecisionRecords({ edge_score: 62 }, { decision: 'Watchlist' })
  assert.equal(d.anchors.find((x) => x.field === 'edge_score')!.tone, 'neutral')
})
check("an inverted anchor arriving as a non-number is neutral, never painted 'better'", () => {
  const d = diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy', downside_risk_pct: 20.1 })
  assert.equal(d.anchors.find((x) => x.field === 'downside_risk_pct')!.tone, 'neutral')
})

// ---- untracked fields are reported INDEPENDENTLY ---------------------------------------------------
check('an untracked field that moved is reported even when an anchor ALSO moved', () => {
  const d = diffDecisionRecords(
    { decision: 'Watchlist', confidence_score: 52, forecast_ledger: [{ prediction: 'a' }] },
    { decision: 'Watchlist', confidence_score: 46, forecast_ledger: [{ prediction: 'b' }] },
  )
  assert.equal(d.verdict, 'anchors_moved')
  const u = d.prose.find((p) => p.field === '_untracked')
  assert.ok(u, 'gating this on "nothing else moved" silently swore the ledger was untouched')
  assert.match(u!.label, /forecast_ledger/)
})
check('an untracked field that did NOT move is not reported', () => {
  const d = diffDecisionRecords(
    { decision: 'Watchlist', confidence_score: 52, basket: 'Watchlist' },
    { decision: 'Watchlist', confidence_score: 46, basket: 'Watchlist' },
  )
  assert.equal(d.prose.find((p) => p.field === '_untracked'), undefined)
})
check('the untracked sweep names the real fields', () => {
  const d = diffDecisionRecords({ decision: 'Buy', paper_treatment: 'x' }, { decision: 'Buy', paper_treatment: 'y' })
  assert.match(d.prose.find((p) => p.field === '_untracked')!.label, /paper_treatment/)
})

// ---- structural anchors never render "N entries → N entries" ---------------------------------------
check('a same-length thesis_type change renders "changed", not "1 entries → 1 entries"', () => {
  const d = diffDecisionRecords({ thesis_type: ['Company-specific'] }, { thesis_type: ['Macro-conditional'] })
  const a = d.anchors.find((x) => x.field === 'thesis_type')!
  assert.equal(a.moved, true)
  assert.equal(a.prev, '1 entries')
  assert.equal(a.cur, 'changed', 'a moved row whose two cells are identical reads as a rendering bug')
})
check('a same-length scenarios change renders "changed"', () => {
  const s = (p: number) => [{ label: 'base', probability: p }]
  const d = diffDecisionRecords({ scenarios: s(45) }, { scenarios: s(50) })
  assert.equal(d.anchors.find((x) => x.field === 'scenarios')!.cur, 'changed')
})
check('a DIFFERENT-length structural change still shows both counts', () => {
  const d = diffDecisionRecords({ thesis_type: ['a'] }, { thesis_type: ['a', 'b'] })
  const a = d.anchors.find((x) => x.field === 'thesis_type')!
  assert.equal(a.prev, '1 entries')
  assert.equal(a.cur, '2 entries')
})

// ---- one count, rendered everywhere ---------------------------------------------------------------
check('tailSummary names BOTH tiers and is the single user-facing count', () => {
  assert.match(emaar.tailSummary, /3 changes to the evidence/)
  assert.match(emaar.tailSummary, /5 fields reworded/)
})
check('tailSummary is empty when nothing moved below the call', () => {
  assert.equal(diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy' }).tailSummary, '')
})

// ---- §12 inverted anchors + the two sign conventions ------------------------------------------------
const dr = (p: number, c: number) => diffDecisionRecords({ downside_risk_pct: p }, { downside_risk_pct: c }).anchors.find((a) => a.field === 'downside_risk_pct')!
check('§12: downside_risk_pct 20.1 -> 24.0 (both >= 0, magnitude) => lower_better, up, tone worse', () => {
  const a = dr(20.1, 24.0)
  assert.equal(a.polarity, 'lower_better')
  assert.equal(a.direction, 'up')
  assert.equal(a.tone, 'worse')
})
check('§12: downside_risk_pct -63.9 -> -40.0 (both <= 0, signed return) => higher_better, up, tone better', () => {
  const a = dr(-63.9, -40.0)
  assert.equal(a.polarity, 'higher_better')
  assert.equal(a.tone, 'better', 'a fixed lower_better would paint this backwards on 4 of the 6 records')
})
check('§12: downside_risk_pct -31.1 -> +24.0 (sign FLIPS) => ambiguous, tone neutral, note present', () => {
  const a = dr(-31.1, 24.0)
  assert.equal(a.polarity, 'ambiguous')
  assert.equal(a.tone, 'neutral')
  assert.match(a.note!, /different sign conventions/)
})
check('§12: hasInverted is true whenever a lower_better|ambiguous anchor is rendered', () => {
  assert.equal(diffDecisionRecords({ downside_risk_pct: 20.1 }, { downside_risk_pct: 20.1 }).hasInverted, true)
  assert.equal(diffDecisionRecords({ confidence_score: 52 }, { confidence_score: 52 }).hasInverted, false)
})
check('expected_return_pct -16.1 -> -4.4 => tone better (higher_better; negatives are fine)', () => {
  const d = diffDecisionRecords({ expected_return_pct: -16.1 }, { expected_return_pct: -4.4 })
  assert.equal(d.anchors[0].tone, 'better')
})
check('tone is never Math.sign(cur - prev): entry_price 12.2 -> 20.0 => tone neutral', () => {
  const d = diffDecisionRecords({ entry_price: 12.2 }, { entry_price: 20.0 })
  const a = d.anchors.find((x) => x.field === 'entry_price')!
  assert.equal(a.direction, 'up')
  assert.equal(a.tone, 'neutral')
})

// ---- presence-driven anchors (survives the schema migration) ---------------------------------------
check('presence-driven: a record carrying conviction + analysis_confidence emits those anchors', () => {
  const d = diffDecisionRecords({ conviction: 7, analysis_confidence: 60 }, { conviction: 8, analysis_confidence: 60 })
  assert.equal(d.anchors.find((a) => a.field === 'conviction')!.moved, true)
  assert.ok(d.anchors.some((a) => a.field === 'analysis_confidence'))
})
check('presence-driven: a field absent in BOTH emits no anchor', () => {
  const d = diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy' })
  assert.equal(d.anchors.find((a) => a.field === 'conviction'), undefined)
})
check('presence-driven: a field in cur only -> emitted with present.prev === false', () => {
  const d = diffDecisionRecords({ decision: 'Buy' }, { decision: 'Buy', conviction: 8 })
  const a = d.anchors.find((x) => x.field === 'conviction')!
  assert.equal(a.present.prev, false)
  assert.equal(a.prev, null)
  assert.equal(a.moved, true)
})

// ---- the call --------------------------------------------------------------------------------------
check("decision Watchlist -> Buy => 'call_changed'; headline states the move and says NOT upgrade/downgrade", () => {
  const d = diffDecisionRecords({ decision: 'Watchlist' }, { decision: 'Buy' })
  assert.equal(d.verdict, 'call_changed')
  assert.match(d.headline, /Watchlist → Buy/)
  assert.doesNotMatch(d.headline, /upgrad|downgrad|re-rated/i)
})
check("a moved number with the call held => 'anchors_moved'", () => {
  const d = diffDecisionRecords({ decision: 'Watchlist', confidence_score: 52 }, { decision: 'Watchlist', confidence_score: 46 })
  assert.equal(d.verdict, 'anchors_moved')
  assert.match(d.headline, /Still Watchlist/)
  assert.match(d.headline, /confidence fell/)
})
check("a swarm's verdictField is diffed instead of `decision`", () => {
  const d = diffDecisionRecords({ action: 'Hold' }, { action: 'Trim' }, { verdictField: 'action' })
  assert.equal(d.verdict, 'call_changed')
  assert.match(d.headline, /Hold → Trim/)
})
check('diffDecisionRecords(null, {}) and ({}, null) do not throw', () => {
  assert.doesNotThrow(() => diffDecisionRecords(null, {}))
  assert.doesNotThrow(() => diffDecisionRecords({}, null))
  assert.doesNotThrow(() => diffDecisionRecords('nonsense', 42))
})
check('canonicalJson is key-order independent', () => {
  assert.equal(canonicalJson({ a: 1, b: 2 }), canonicalJson({ b: 2, a: 1 }))
})
check('canonicalJson: a missing key (undefined) is NOT the same identity as an explicit null', () => {
  assert.notEqual(canonicalJson(undefined), canonicalJson(null))
  // A field going from present-and-null to absent-from-the-record must read as CHANGED, e.g. for the
  // untracked-field sweep at the bottom of diffDecisionRecords (a vanished key is real information).
  const prev: Record<string, unknown> = { a: null }
  const cur: Record<string, unknown> = {}
  assert.notEqual(canonicalJson(prev.a), canonicalJson(cur.a))
})

console.log(`\n${pass}/${pass + fail} checks passed`)
process.exitCode = fail ? 1 : 0
