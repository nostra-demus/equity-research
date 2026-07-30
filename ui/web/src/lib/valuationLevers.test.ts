// valuationLevers — the CLIENT mirror of scripts/valuation_math.py that the Valuation Playground recomputes
// with (run: npx tsx src/lib/valuationLevers.test.ts; ui-web CI `npm test` runs it). This pins the
// method-mix blend (#PR-B): the committed runs are all method-BLENDS, not a single forward-metric × multiple,
// so blend() over the football field is the real base-case lever. If blend() drifts from the Python engine
// that produced the fair value, the Playground silently disagrees with the recorded thesis — this file fails
// first. Parity targets are the exact valuation_math.py outputs: AMZN 210.05, NHY 81.826, EMAAR 16.5245.
import assert from 'node:assert'
import { blend, buildMethods, impliedMultiple, caseLevelFromMultiple, levelSourceFor, reanchor, mosRead, scenarioMath as sm, draftFromResponse, recompute, dcfFromGrid, sotpFromSegments, peersFromMultiple, buildInternals, scenarioCellState, scenarioMath, traceBlend, traceScenarioCell, traceOutput, goalSeekBlend, chainLevel, chainEv, buildChain, levelForScenario, type MethodLever, type ValuationLeversResponse, type DcfGrid, type PeersInternals } from './valuationLevers'
import type { PlaygroundDraft } from './valuationLevers'

let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++ }
const m = (key: string, value: number | null, weight: number | null): MethodLever => ({ key, value, weight })

// ---- blend(): parity with scripts/valuation_math.py blend() ----
check('blend AMZN = 210.05 (own_history null value → EXCLUDED, not a zero-drag)', () => {
  const b = blend([m('own_history', null, 0), m('peers', 258, 0.35), m('dcf', 207, 0.25), m('sotp', 170, 0.40)])
  assert.ok(b.basePoint != null && Math.abs(b.basePoint - 210.05) < 1e-4, `got ${b.basePoint}`)
  assert.ok(!('own_history' in b.effectiveWeights), 'own_history (null value) must not appear in the blend')
  assert.ok(Math.abs(b.effectiveWeights.peers - 0.35) < 1e-6, `peers eff ${b.effectiveWeights.peers}`)
})
check('blend NHY = 81.826 (own_history weight 0 → present at 0% effective)', () => {
  const b = blend([m('own_history', 64.33, 0), m('peers', 93.70, 0.25), m('dcf', 70.14, 0.35), m('sotp', 84.63, 0.40)])
  assert.ok(b.basePoint != null && Math.abs(b.basePoint - 81.826) < 1e-4, `got ${b.basePoint}`)
  assert.ok(Math.abs(b.effectiveWeights.own_history - 0) < 1e-9, 'own_history effective weight must be 0')
})
check('blend EMAAR = 16.5245 (four weighted methods)', () => {
  const b = blend([m('own_history', 12.5, 0.15), m('peers', 16.9, 0.20), m('dcf', 18.0, 0.30), m('sotp', 16.77, 0.35)])
  assert.ok(b.basePoint != null && Math.abs(b.basePoint - 16.5245) < 1e-4, `got ${b.basePoint}`)
})
check('blend RENORMALIZES over present methods (a dropped value cannot zero the blend)', () => {
  assert.ok(Math.abs((blend([m('a', 100, 0.5), m('b', 200, 0.5)]).basePoint as number) - 150) < 1e-9)
  // drop b's value → only a is used; its weight renormalizes to 1.0 → base point is a's value, not halved
  const dropped = blend([m('a', 100, 0.5), m('b', null, 0.5)])
  assert.ok(Math.abs((dropped.basePoint as number) - 100) < 1e-9, `renorm got ${dropped.basePoint}`)
  assert.ok(Math.abs(dropped.effectiveWeights.a - 1.0) < 1e-9)
})
check('blend REJECTS a negative weight (drops it, never a base point outside every method value)', () => {
  // Codex #327 P2: values 100/200 at weights -1/2 must NOT blend to 300. The negative weight is dropped;
  // only b remains → base point is b's value (200), inside the method range. Zero weight still counts.
  const r = blend([m('a', 100, -1), m('b', 200, 2)])
  assert.ok(r.basePoint != null && Math.abs(r.basePoint - 200) < 1e-9, `got ${r.basePoint}`)
  assert.ok(!('a' in r.effectiveWeights), 'negative-weight method must be excluded from the blend')
})
check('blend empty / no numeric weight → null base point (never crashes, never fabricates)', () => {
  assert.equal(blend([]).basePoint, null)
  assert.equal(blend([m('dcf', 100, null)]).basePoint, null)
  assert.equal(blend([m('dcf', 100, 0)]).basePoint, null) // wsum 0 → no blend
})

// ---- buildMethods(): ordered, null-tolerant football-field rows ----
check('buildMethods orders own_history,peers,dcf,sotp regardless of input order', () => {
  const rows = buildMethods({ sotp: 84.63, dcf: 70.14, peers: 93.7, own_history: 64.33 }, { sotp: 0.4, dcf: 0.35, peers: 0.25, own_history: 0 })
  assert.deepEqual(rows.map((r) => r.key), ['own_history', 'peers', 'dcf', 'sotp'])
  assert.equal(rows[0].weight, 0)
})
check('buildMethods keeps a key present in only one map (weight but no value)', () => {
  const rows = buildMethods({ peers: 258 }, { peers: 0.35, dcf: 0.25 })
  assert.deepEqual(rows.map((r) => r.key), ['peers', 'dcf'])
  const dcf = rows.find((r) => r.key === 'dcf')!
  assert.equal(dcf.value, null)
  assert.equal(dcf.weight, 0.25)
})
check('buildMethods no football field → [] (older runs / metric×multiple runs)', () => {
  assert.deepEqual(buildMethods(undefined, undefined), [])
})

// ---- draftFromResponse + recompute: the §16-faithful drive-base behaviour ----
const emaarRes: ValuationLeversResponse = {
  runRoot: 'analyses/EMAAR_2026-07-10',
  levers: {
    basis: 'equity', current_price: 12.2,
    methods: { own_history: 12.5, peers: 16.9, dcf: 18.0, sotp: 16.77 },
    method_weights: { own_history: 0.15, peers: 0.20, dcf: 0.30, sotp: 0.35 },
    discount_rate: { rf: 0.045, erp: 0.0487, beta: 1.15, wacc: 0.105, after_tax_kd: 0.0425 },
    scenarios: [
      { label: 'bull', forward_metric: null, multiple: null, level: 21.0 },
      { label: 'base', forward_metric: null, multiple: null, level: 15.0 },
      { label: 'bear', forward_metric: null, multiple: null, level: 9.75 },
    ],
  },
  decision: {
    scenarios: [
      { label: 'bull', probability: 20, return_pct: 72.13, price_target: 21.0 },
      { label: 'base', probability: 45, return_pct: 22.95, price_target: 15.0 },
      { label: 'bear', probability: 35, return_pct: -20.08, price_target: 9.75 },
    ],
    entry_price: 12.2, entry_price_timestamp: '2026-06-28', currency: 'AED',
    expected_return_pct: 17.7, margin_of_safety_pct: 18.7, downside_risk_pct: 20.08,
  },
  overrides: [],
}
const baseLevel = (out: ReturnType<typeof recompute>) => out.scenarios.find((s) => (s.label || '').toLowerCase().includes('base'))!.level
const baseReturn = (out: ReturnType<typeof recompute>) => out.math.perScenario.find((s) => s.label.toLowerCase().includes('base'))!.return_pct

check('draftFromResponse: 4 ordered methods, driveBaseFromMix defaults false', () => {
  const d = draftFromResponse(emaarRes)
  assert.deepEqual(d.methods.map((x) => x.key), ['own_history', 'peers', 'dcf', 'sotp'])
  assert.equal(d.driveBaseFromMix, false)
})
check('recompute default: keeps the PUBLISHED base 15.00, exposes the blend 16.5245 alongside (§16)', () => {
  const out = recompute(draftFromResponse(emaarRes))
  assert.ok(out.blend.basePoint != null && Math.abs(out.blend.basePoint - 16.5245) < 1e-4, `blend ${out.blend.basePoint}`)
  assert.ok(Math.abs((baseLevel(out) as number) - 15.0) < 1e-9, `default base ${baseLevel(out)}`)
})
check('recompute drive-base ON: base becomes the blend and the base return visibly rises', () => {
  const d = draftFromResponse(emaarRes)
  const off = recompute(d)
  const on = recompute({ ...d, driveBaseFromMix: true })
  assert.ok(Math.abs((baseLevel(on) as number) - 16.5245) < 1e-4, `driven base ${baseLevel(on)}`)
  assert.ok((baseReturn(on) as number) - (baseReturn(off) as number) > 5, `base return should rise, got ${baseReturn(off)} → ${baseReturn(on)}`)
})
check('recompute with NO methods (fallback run): null blend, toggle is inert, base stays published', () => {
  const noMethods: ValuationLeversResponse = {
    runRoot: 'x', levers: null,
    decision: { scenarios: [{ label: 'base', probability: 100, return_pct: 0, price_target: 100 }], entry_price: 100, entry_price_timestamp: null, currency: null, expected_return_pct: 0, margin_of_safety_pct: 0, downside_risk_pct: 0 },
    overrides: [],
  }
  const d = draftFromResponse(noMethods)
  assert.deepEqual(d.methods, [])
  const out = recompute({ ...d, driveBaseFromMix: true }) // toggle on, but no blend to drive with
  assert.equal(out.blend.basePoint, null)
  assert.ok(Math.abs((baseLevel(out) as number) - 100) < 1e-9, 'base must stay at the published level when there is no blend')
})

// ---- blendActive: the toggle only DRIVES the base when the blend produced a base point (Codex #327 P2) ----
check('blendActive: toggle OFF → false (base stays published, no blend claim)', () => {
  const out = recompute(draftFromResponse(emaarRes))
  assert.equal(out.blendActive, false)
})
check('blendActive: toggle ON with weighted methods → true (blend really drives the base)', () => {
  const out = recompute({ ...draftFromResponse(emaarRes), driveBaseFromMix: true })
  assert.equal(out.blendActive, true)
})
check('blendActive: toggle ON but ALL weights cleared to 0 → false, base stays published (no false blend claim)', () => {
  const d = draftFromResponse(emaarRes)
  const zeroed = { ...d, driveBaseFromMix: true, methods: d.methods.map((x) => ({ ...x, weight: 0 })) }
  const out = recompute(zeroed)
  assert.equal(out.blend.basePoint, null) // all-zero weights → no base point
  assert.equal(out.blendActive, false)    // so the toggle is inert: the UI must NOT claim the returns use the blend
  assert.ok(Math.abs((baseLevel(out) as number) - 15.0) < 1e-9, `base must stay at the published 15.00, got ${baseLevel(out)}`)
})

// ---- v1.1 method internals (P-C sub-levers) — pinned to NHY_2026-07-19's OWN recorded tables ----
// 04_intrinsic-dcf §7 grid, verbatim cells (growth ascending rows × wacc ascending cols):
const NHY_GRID: DcfGrid = {
  wacc: [0.065, 0.075, 0.085], growth: [0.02, 0.025, 0.03],
  values: [[80.48, 63.95, 52.51], [90.25, 70.14, 56.74], [102.81, 77.70, 61.73]],
  base: { wacc: 0.075, growth: 0.025 }, source: '04_intrinsic-dcf.md §7',
}
check('dcfFromGrid: a recorded point reads the verbatim cell (base 7.5×2.5 → 70.14; 8.5×2.5 → 56.74)', () => {
  const base = dcfFromGrid(NHY_GRID, 0.075, 0.025)
  assert.ok(base.value === 70.14 && !base.interpolated && !base.outOfGrid, JSON.stringify(base))
  const hi = dcfFromGrid(NHY_GRID, 0.085, 0.025)
  assert.ok(hi.value === 56.74 && !hi.interpolated && !hi.outOfGrid, JSON.stringify(hi))
})
check('dcfFromGrid: between recorded points → labelled linear blend (8.0×2.5 → 63.44)', () => {
  const r = dcfFromGrid(NHY_GRID, 0.08, 0.025)
  assert.ok(r.value != null && Math.abs(r.value - 63.44) < 1e-9 && r.interpolated && !r.outOfGrid, JSON.stringify(r))
})
check('dcfFromGrid: beyond the grid → flagged outOfGrid (computed by edge-segment extrapolation)', () => {
  const r = dcfFromGrid(NHY_GRID, 0.095, 0.025)
  assert.ok(r.outOfGrid && r.value != null, JSON.stringify(r))
  assert.ok(dcfFromGrid(NHY_GRID, 0.075, 0.04).outOfGrid, 'growth beyond grid must flag')
})
check('dcfFromGrid: malformed grid / null inputs → null value, never a guess', () => {
  assert.equal(dcfFromGrid(null, 0.075, 0.025).value, null)
  assert.equal(dcfFromGrid(NHY_GRID, null, 0.025).value, null)
  assert.equal(dcfFromGrid({ ...NHY_GRID, values: [[1, 2]] } as DcfGrid, 0.075, 0.025).value, null)
})
// 06_sum-of-the-parts §3+§4, verbatim rows: Σ(metric×multiple) −17,919 −7,495 over 1,965.28 shares → 84.63
const NHY_SEGS = [
  { metric: 4951, multiple: 4.6 }, { metric: 3759, multiple: 7.5 }, { metric: 13897, multiple: 8.1 },
  { metric: 915, multiple: 3.3 }, { metric: 3604, multiple: 6.0 }, { metric: 916, multiple: 3.9 },
]
check('sotpFromSegments reproduces the orb per-share (84.63 within rounding)', () => {
  const v = sotpFromSegments(NHY_SEGS, { net_debt: 17919, minority: 7495 }, 1965.28)
  assert.ok(v != null && Math.abs(v - 84.63) < 0.01, `got ${v}`)
})
check('sotpFromSegments: a null lever or missing shares → null (Not assessable)', () => {
  assert.equal(sotpFromSegments([{ metric: null, multiple: 5 }], null, 10), null)
  assert.equal(sotpFromSegments(NHY_SEGS, null, null), null)
})
// 03_relative-valuation-peers §5, verbatim anchor rows: 5.6x → 93.7 (base), 6.25x → 105.8 (raw median)
const NHY_PEERS: PeersInternals = {
  metric_name: 'NTM EV/EBITDA', median_multiple: 6.25, applied_multiple: 5.6, discount_pct: 10,
  anchors: [{ multiple: 5.6, value: 93.7 }, { multiple: 6.25, value: 105.8 }], source: '03 §5',
}
check('peersFromMultiple: the applied multiple reproduces methods.peers (5.6 → 93.7); the median row too', () => {
  assert.equal(peersFromMultiple(NHY_PEERS, 5.6).value, 93.7)
  assert.equal(peersFromMultiple(NHY_PEERS, 6.25).value, 105.8)
})
check('peersFromMultiple: outside the recorded rows → flagged (5.0 → 82.53 extrapolated)', () => {
  const r = peersFromMultiple(NHY_PEERS, 5.0)
  assert.ok(r.value != null && Math.abs(r.value - 82.5308) < 1e-3 && r.outOfAnchors, JSON.stringify(r))
})
check('recompute: ACTIVE dcf sub-levers derive the method value → the blend moves (81.83 → 77.14)', () => {
  const draft = {
    basis: 'equity' as const, shares: 1965.28, netDebt: 13090, price: 84.96,
    rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
    scenarios: [{ label: 'base', probability: null, forwardMetric: null, multiple: null, levelOverride: 81.83 }],
    methods: [m('own_history', 64.33, 0), m('peers', 93.7, 0.25), m('dcf', 70.14, 0.35), m('sotp', 84.63, 0.4)],
    driveBaseFromMix: false,
    internals: { dcf: { grid: NHY_GRID, wacc: 0.085, growth: 0.025, active: true } },
  }
  const out = recompute(draft)
  assert.equal(out.methodInternals.dcf?.value, 56.74)
  assert.ok(out.blend.basePoint != null && Math.abs(out.blend.basePoint - 77.136) < 1e-3, `blend ${out.blend.basePoint}`)
  // inactive internals leave the typed value untouched
  const out2 = recompute({ ...draft, internals: { dcf: { ...draft.internals.dcf, active: false } } })
  assert.ok(out2.blend.basePoint != null && Math.abs(out2.blend.basePoint - 81.8265) < 1e-3, `blend ${out2.blend.basePoint}`)
})
check('recompute: out-of-grid sub-levers surface a warning', () => {
  const draft = {
    basis: 'equity' as const, shares: null, netDebt: 0, price: null,
    rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
    scenarios: [], methods: [m('dcf', 70.14, 1)], driveBaseFromMix: false,
    internals: { dcf: { grid: NHY_GRID, wacc: 0.095, growth: 0.025, active: true } },
  }
  const out = recompute(draft)
  assert.ok(out.warnings.some((w) => w.includes('outside the orb')), out.warnings.join('; '))
})
check('buildInternals: sidecar blocks → inactive draft state at the orb base; absent blocks → undefined', () => {
  const withAll = buildInternals({ basis: 'equity', scenarios: [], dcf_grid: NHY_GRID, sotp_segments: [{ segment: 'A', metric: 1, multiple: 2 }], sotp_bridge: { net_debt: 0 }, peers_internals: NHY_PEERS })
  assert.ok(withAll?.dcf && withAll.dcf.wacc === 0.075 && withAll.dcf.active === false)
  assert.ok(withAll?.peers && withAll.peers.multiple === 5.6)
  assert.equal(buildInternals({ basis: 'equity', scenarios: [] }), undefined)
})


// ---- v2 Phase-1: cell semantics — outcomes are computed/judgment cells, never silently typed ----
check('cellState EMAAR: base = frozen_wedge (blend 16.5245, wedge −1.5245 = the disclosed RF-OWN-004 discount)', () => {
  const d = draftFromResponse(emaarRes)
  assert.ok(d.published && Math.abs((d.published.blend.basePoint as number) - 16.5245) < 1e-4, `published blend ${d.published?.blend.basePoint}`)
  const base = d.scenarios.find((s) => s.label === 'base')!
  const cs = scenarioCellState(base, true, d.published!.blend.basePoint, null, false)
  assert.equal(cs.kind, 'frozen_wedge')
  assert.ok(Math.abs((cs.wedge as number) - -1.5245) < 1e-4, `wedge ${cs.wedge}`)
  assert.equal(base.frozenLevel, 15.0)
})
check('cellState EMAAR: bull/bear = judgment (no recorded chain yet)', () => {
  const d = draftFromResponse(emaarRes)
  for (const label of ['bull', 'bear']) {
    const s = d.scenarios.find((x) => x.label === label)!
    assert.equal(scenarioCellState(s, false, d.published!.blend.basePoint, null, false).kind, 'judgment', label)
  }
})
check('cellState: base ≈ blend within rounding → frozen_formula — incl. a NIVABUPA-shaped ri_model run (no dcf/sotp)', () => {
  const nivaRes: ValuationLeversResponse = {
    runRoot: 'analyses/NIVABUPA_2026-06-22',
    levers: {
      basis: 'equity',
      methods: { peers: 75.8, ri_model: 19.94 }, method_weights: { peers: 0.3, ri_model: 0.7 },
      scenarios: [{ label: 'base', forward_metric: null, multiple: null, level: 36.7 }],
    },
    decision: null, overrides: [],
  }
  const d = draftFromResponse(nivaRes)
  assert.ok(Math.abs((d.published!.blend.basePoint as number) - 36.698) < 1e-3, `blend ${d.published?.blend.basePoint}`)
  const cs = scenarioCellState(d.scenarios[0], true, d.published!.blend.basePoint, null, false)
  assert.equal(cs.kind, 'frozen_formula') // 36.70 vs 36.698 is rounding, not a wedge
})
check('cellState: unlock → overridden; drive-base → live_blend; metric×multiple → derived_multiple', () => {
  const d = draftFromResponse(emaarRes)
  const base = d.scenarios.find((s) => s.label === 'base')!
  assert.equal(scenarioCellState({ ...base, overrideUnlocked: true }, true, 16.5245, null, false).kind, 'overridden')
  assert.equal(scenarioCellState(base, true, 16.5245, 17.2, true).kind, 'live_blend')
  assert.equal(scenarioCellState({ ...base, forwardMetric: 2.1, multiple: 7.1 }, true, 16.5245, null, false).kind, 'derived_multiple')
})
check('cellState: manual draft without a published blend → judgment (locked, honest fallback)', () => {
  const s = { label: 'base', probability: null, forwardMetric: null, multiple: null, levelOverride: 81.83 }
  assert.equal(scenarioCellState(s, true, null, null, false).kind, 'judgment')
})

// ---- v2 Phase-1: traces ----
check('traceBlend EMAAR: four terms, weight × value arithmetic shown', () => {
  const d = draftFromResponse(emaarRes)
  const t = traceBlend(d.published!.methods, d.published!.blend)
  assert.equal(t.terms.length, 4)
  assert.ok(t.formula.includes('16.52'), t.formula)
  const oh = t.terms.find((x) => x.label === 'own_history')!
  assert.ok(oh.calc.includes('0.15') && oh.calc.includes('12.5') && oh.calc.includes('1.875'), oh.calc)
})
check('traceScenarioCell: wedge trace shows blend + wedge = frozen, and carries the run drivers as source', () => {
  const d = draftFromResponse(emaarRes)
  const base = { ...d.scenarios.find((s) => s.label === 'base')!, drivers: 'published AED 1.52 lower as a disclosed RF-OWN-004 discount' }
  const cs = scenarioCellState(base, true, d.published!.blend.basePoint, null, false)
  const t = traceScenarioCell(base, cs, d.published)
  assert.ok(t.formula.includes('16.52') && t.formula.includes('1.52') && t.formula.includes('15'), t.formula)
  assert.ok(t.source && t.source.includes('RF-OWN-004'), String(t.source))
})
check('traceScenarioCell: judgment trace says no recorded chain', () => {
  const d = draftFromResponse(emaarRes)
  const bull = d.scenarios.find((s) => s.label === 'bull')!
  const t = traceScenarioCell(bull, { kind: 'judgment' }, d.published)
  assert.ok(t.formula.includes('no machine-recorded derivation'), t.formula)
})
check('traceOutput NHY: pwt terms per scenario; expected/mos/downside/rr formulas carry the real numbers', () => {
  const math = scenarioMath([
    { label: 'bull', probability: 20, price_target: 107.7 },
    { label: 'base', probability: 55, price_target: 81.83 },
    { label: 'bear', probability: 25, price_target: 45.12 },
  ], 84.96)
  const pwt = traceOutput('pwt', math)!
  assert.equal(pwt.terms.length, 3)
  assert.ok(traceOutput('expected', math)!.formula.includes('84.96'))
  assert.ok(traceOutput('mos', math)!.formula.includes('81.83'))
  assert.ok(traceOutput('downside', math)!.formula.includes('45.12'))
  // the rr formula now states the ratio actually computed (expected return / downside risk) rather than the
  // long-only bear-price form — the bear is still named, in the note, so nothing is lost
  const rr = traceOutput('rr', math)!
  assert.ok(/expected return .* \/ downside risk/.test(rr.formula), rr.formula)
  assert.ok((rr.note ?? '').includes('45.12') && /bear/.test(rr.note ?? ''), rr.note ?? '')
  // no price → price-relative traces refuse instead of fabricating
  const noPrice = scenarioMath([{ label: 'base', probability: 100, price_target: 10 }], null)
  assert.equal(traceOutput('expected', noPrice), null)
})
// Codex #365 P1 (synthesizer.md:591): a run with TWO bear-labelled cases (bear_cyclical + bear_structural)
// must select the WORST (lowest target, for a long) for downsideToBearPct and the risk/reward denominator
// — the same selection scripts/eval.py's `worst = min(tgts)` makes — not the first bear-labelled row in
// array order. TSLA's real shape: bear_cyclical 20.90 listed BEFORE the lower bear_structural 6.86.
check('scenarioMath: multi-bear picks the WORST bear (lowest target), not array order', () => {
  const math = scenarioMath([
    { label: 'bull', probability: 20, price_target: 336.08 },
    { label: 'base', probability: 30, price_target: 32.37 },
    { label: 'bear_cyclical', probability: 25, price_target: 20.90 },
    { label: 'bear_structural', probability: 20, price_target: 6.86 },
    { label: 'tail_squeeze', probability: 5, price_target: 417.40 },
  ], 30.0)
  // downsideToBearPct is inverted (higher = worse): (price − worst-bear) / price. Rounded to 1dp by pct(),
  // so the tolerance is against that rounding, not exact equality.
  assert.ok(Math.abs(math.downsideToBearPct! - ((30.0 - 6.86) / 30.0) * 100) < 0.06,
    `downsideToBearPct should key off the structural bear (6.86), got ${math.downsideToBearPct}`)
  // and NOT off the first-listed bear_cyclical (20.90) — the bug this test exists to catch
  assert.ok(Math.abs(math.downsideToBearPct! - ((30.0 - 20.90) / 30.0) * 100) > 1,
    'must not silently key off the first bear-labelled row in array order')
  const denom = 30.0 - 6.86
  const expectedRR = round2((math.probWeightedTarget! - 30.0) / denom)
  assert.equal(math.riskReward, expectedRR)
})
function round2(x: number): number { return Math.round(x * 100) / 100 }

// ---- v2 Phase-1: goal seek — exact piecewise-linear solve on the recorded ranges ----
const nhyGsDraft = () => ({
  basis: 'equity' as const, shares: 1965.28, netDebt: 13090, price: 84.96,
  rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
  scenarios: [{ label: 'base', probability: null, forwardMetric: null, multiple: null, levelOverride: 81.83 }],
  methods: [m('own_history', 64.33, 0), m('peers', 93.7, 0.25), m('dcf', 70.14, 0.35), m('sotp', 84.63, 0.4)],
  driveBaseFromMix: false,
  internals: {
    dcf: { grid: NHY_GRID, wacc: 0.075, growth: 0.025, active: false },
    peers: { pi: NHY_PEERS, multiple: 5.6, active: false },
  },
})
check('goalSeek NHY: blend base = price 84.96 via DCF WACC → 7.0548% exactly (the mock number, solved)', () => {
  const r = goalSeekBlend(nhyGsDraft(), 'dcf_wacc', 84.96)
  assert.ok(r.solution !== null && Math.abs(r.solution - 0.070548) < 2e-5, `sol ${r.solution}`)
  assert.ok(r.achieved !== null && Math.abs(r.achieved - 84.96) < 1e-3, `achieved ${r.achieved}`)
})
check('goalSeek NHY: target above the recorded span → honest refusal with the reachable span', () => {
  const r = goalSeekBlend(nhyGsDraft(), 'dcf_wacc', 95)
  assert.equal(r.solution, null)
  assert.ok(r.note && r.note.includes('recorded range'), String(r.note))
  assert.ok(r.span && Math.abs(r.span[0] - 77.136) < 1e-3 && Math.abs(r.span[1] - 88.8645) < 1e-3, JSON.stringify(r.span))
})
check('goalSeek NHY: peers multiple solves inside the anchors (84.0 → 6.067×), refuses beyond them (84.96)', () => {
  const ok = goalSeekBlend(nhyGsDraft(), 'peers_multiple', 84.0)
  assert.ok(ok.solution !== null && Math.abs(ok.solution - 6.0671) < 1e-3, `sol ${ok.solution}`)
  assert.ok(ok.achieved !== null && Math.abs(ok.achieved - 84.0) < 1e-3)
  const beyond = goalSeekBlend(nhyGsDraft(), 'peers_multiple', 84.96)
  assert.equal(beyond.solution, null) // the anchor span tops out at 84.851 — extrapolation refused
})
check('goalSeek: a zero-weight method cannot reach any target (constant blend → named refusal)', () => {
  const d = {
    ...nhyGsDraft(),
    methods: [m('dcf', 70.14, 0), m('sotp', 84.63, 1)],
  }
  const r = goalSeekBlend(d, 'dcf_wacc', 80)
  assert.equal(r.solution, null)
  assert.ok(r.note && r.note.includes('no weight'), String(r.note))
})
check('goalSeek guards: no target / no recorded range → named refusals, never a guess', () => {
  assert.ok(goalSeekBlend(nhyGsDraft(), 'dcf_wacc', null).note!.includes('target'))
  const noInternals = { ...nhyGsDraft(), internals: undefined }
  assert.ok(goalSeekBlend(noInternals, 'dcf_wacc', 80).note!.includes('no range to search'))
})
check('draftFromResponse carries frozenLevel + overrideUnlocked=false; reset data survives an unlock round-trip', () => {
  const d = draftFromResponse(emaarRes)
  for (const s of d.scenarios) {
    assert.equal(s.overrideUnlocked, false)
    assert.equal(s.frozenLevel, s.levelOverride) // blend runs: the frozen level seeds the override slot
  }
})

// ---- v1.2 scenario derivation chains: the figures behind the level become the levers ----
const NHY_BEAR_DERIV = {
  model: 'ev_bridge', ev: 114095, net_debt: 17919, minority: 7495, shares: 1965.28,
  stated_drivers: [{ label: 'terminal Adj. EBITDA margin', value: '9.0%', note: 'impaired-FCFF input — its mapping to EV is not recorded' }],
  source: '07 §3 (executed snippet)',
}
check('chainLevel reproduces the orb bear: (114095−17919−7495)/1965.28 = 45.1238 → 45.12', () => {
  const c = buildChain(NHY_BEAR_DERIV)!
  const v = chainLevel(c, null)
  assert.ok(v !== null && Math.abs(v - 45.1238) < 1e-3, `got ${v}`)
})
check('chainLevel: shares fall back to the top level; no shares anywhere → null, never a guess', () => {
  const c = buildChain({ ...NHY_BEAR_DERIV, shares: null })!
  assert.ok(Math.abs((chainLevel(c, 1965.28) as number) - 45.1238) < 1e-3)
  assert.equal(chainLevel(c, null), null)
})
check('buildChain: unknown model → null (treated as not recorded, cell stays judgment)', () => {
  assert.equal(buildChain({ model: 'dcf_rerun', ev: 100 }), null)
  assert.equal(buildChain({ model: 'ev_bridge', ev: null }), null)
  assert.equal(buildChain(null), null)
})
check('levelForScenario precedence: chain beats the frozen level; explicit unlock beats the chain', () => {
  const d = draftFromResponse(emaarRes) // any draft for basis/shares context
  const s = { label: 'bear', probability: null, forwardMetric: null, multiple: null, levelOverride: 45.12, frozenLevel: 45.12, chain: buildChain(NHY_BEAR_DERIV) }
  assert.ok(Math.abs((levelForScenario(s, d) as number) - 45.1238) < 1e-3, 'chain wins over the frozen level it reproduces')
  const edited = { ...s, chain: { ...s.chain!, ev: 120000 } }
  assert.ok(Math.abs((levelForScenario(edited, d) as number) - 48.1285) < 1e-3, 'editing a chain figure recomputes the level')
  const unlocked = { ...s, overrideUnlocked: true, levelOverride: 40 }
  assert.equal(levelForScenario(unlocked, d), 40, 'an explicit unlock-override outranks the chain')
})
check('cellState: a computing chain → derived_chain (computed cell); response plumbing carries the chain', () => {
  const res: ValuationLeversResponse = {
    runRoot: 'analyses/NHY_2026-07-19',
    levers: {
      basis: 'ev', shares: 1965.28, net_debt: 13090,
      methods: { peers: 93.7, dcf: 70.14, sotp: 84.63 }, method_weights: { peers: 0.25, dcf: 0.35, sotp: 0.4 },
      scenarios: [
        { label: 'base', forward_metric: null, multiple: null, level: 81.83 },
        { label: 'bear', forward_metric: null, multiple: null, level: 45.12, derivation: NHY_BEAR_DERIV },
      ],
    },
    decision: null, overrides: [],
  }
  const d = draftFromResponse(res)
  const bear = d.scenarios.find((s) => s.label === 'bear')!
  assert.ok(bear.chain && bear.chain.ev === 114095)
  const cv = chainLevel(bear.chain, d.shares)
  const cs = scenarioCellState(bear, false, d.published!.blend.basePoint, null, false, cv)
  assert.equal(cs.kind, 'derived_chain')
  // recompute uses the chain for the level (45.1238 ≈ the frozen 45.12 it reproduces)
  const out = recompute(d)
  const lvl = out.scenarios.find((s) => s.label === 'bear')!.level
  assert.ok(lvl !== null && Math.abs(lvl - 45.1238) < 1e-3, `recomputed ${lvl}`)
})
check('traceScenarioCell derived_chain: bridge formula + stated drivers as display-only provenance', () => {
  const s = { label: 'bear', probability: null, forwardMetric: null, multiple: null, levelOverride: 45.12, chain: buildChain(NHY_BEAR_DERIV) }
  const t = traceScenarioCell(s, { kind: 'derived_chain', chainValue: 45.1238 }, null)
  assert.ok(t.formula.includes('114095') && t.formula.includes('1965.28') && t.formula.includes('45.12'), t.formula)
  assert.equal(t.terms.length, 1)
  assert.ok(t.terms[0].label.includes('margin') && t.terms[0].calc.includes('9.0%'), JSON.stringify(t.terms))
  assert.ok(t.source && t.source.includes('07 §3'), String(t.source))
})

// ---- v1.2 slice 2: margin_runoff_dcf — the margin itself is the lever, replaying the orb's chain ----
const NHY_RUNOFF_DERIV = {
  model: 'margin_runoff_dcf', ev: 114095, margin: 0.09, growth: -0.01,
  da: 11500, capex: 8500, tax: 0.30, dnwc: 0,
  revenue_base: 228071, wacc: 0.075, pv_factor: 0.72221, pv_explicit: 35712,
  net_debt: 17919, minority: 7495, shares: 1965.28,
  metric_label: 'terminal Adj. EBITDA margin', source: '07 §3 structural-reset snippet',
}
check('runoff replay at the recorded margin reproduces the orb: 9.0% → EV 114,095.9 → 45.1241', () => {
  const c = buildChain(NHY_RUNOFF_DERIV)!
  assert.equal(c.model, 'margin_runoff_dcf')
  const ev = chainEv(c)
  assert.ok(ev !== null && Math.abs(ev - 114095.9) < 1, `EV ${ev}`)
  const v = chainLevel(c, null)
  assert.ok(v !== null && Math.abs(v - 45.1241) < 1e-3, `level ${v}`)
})
check('runoff what-ifs match the precomputed mock table: 10% → 51.957, 8% → 38.291, g=0 → 50.899', () => {
  const c = buildChain(NHY_RUNOFF_DERIV)!
  assert.ok(Math.abs((chainLevel({ ...c, margin: 0.10 }, null) as number) - 51.9573) < 1e-3)
  assert.ok(Math.abs((chainLevel({ ...c, margin: 0.08 }, null) as number) - 38.2909) < 1e-3)
  assert.ok(Math.abs((chainLevel({ ...c, growth: 0 }, null) as number) - 50.8986) < 1e-3)
})
check('runoff refusals: wacc − g <= 0 → null; missing constant → buildChain null (stays judgment)', () => {
  const c = buildChain(NHY_RUNOFF_DERIV)!
  assert.equal(chainLevel({ ...c, growth: 0.08 }, null), null)
  assert.equal(buildChain({ ...NHY_RUNOFF_DERIV, pv_factor: null }), null)
  assert.equal(buildChain({ ...NHY_RUNOFF_DERIV, revenue_base: null }), null)
})
check('typed EV detaches the runoff model (evOverride wins); clearing it re-attaches', () => {
  const c = buildChain(NHY_RUNOFF_DERIV)!
  const detached = { ...c, evOverride: 120000 }
  assert.ok(Math.abs((chainLevel(detached, null) as number) - 48.1285) < 1e-3, 'typed EV drives the bridge')
  assert.ok(Math.abs((chainLevel({ ...detached, evOverride: null }, null) as number) - 45.1241) < 1e-3, 're-attached replay')
})
// ---- review round (Codex/Gemini on #336/#338/#339): honesty + robustness fixes ----
check('ACTIVE sub-lever deriving nothing → method value NULL in the blend (no stale reuse)', () => {
  const draft = {
    basis: 'equity' as const, shares: null, netDebt: 0, price: null,
    rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
    scenarios: [], methods: [m('dcf', 70.14, 0.5), m('sotp', 84.63, 0.5)], driveBaseFromMix: false,
    internals: { dcf: { grid: NHY_GRID, wacc: null, growth: 0.025, active: true } }, // cleared WACC field
  }
  const out = recompute(draft)
  const dcf = out.blend.effectiveWeights
  assert.ok(!('dcf' in dcf), 'a non-deriving ACTIVE dcf must drop from the blend, not reuse 70.14')
  assert.ok(out.blend.basePoint !== null && Math.abs(out.blend.basePoint - 84.63) < 1e-9, `blend ${out.blend.basePoint}`)
})
check('peers piecewise honors a third recorded anchor exactly; goal seek scans its segments', () => {
  const tri: PeersInternals = { ...NHY_PEERS, anchors: [...NHY_PEERS.anchors, { multiple: 7.0, value: 118.0 }] }
  assert.equal(peersFromMultiple(tri, 7.0).value, 118) // the third row reproduces exactly
  assert.equal(peersFromMultiple(tri, 6.25).value, 105.8)
  const between = peersFromMultiple(tri, 6.6).value // on the SECOND segment (6.25→7.0), not the first line
  assert.ok(between !== null && Math.abs(between - (105.8 + (118 - 105.8) * (0.35 / 0.75))) < 1e-3, `got ${between}`)
  assert.equal(peersFromMultiple(tri, 7.0).outOfAnchors, false)
})
check('buildInternals refuses a malformed grid matrix (no crash-bait for the grid table)', () => {
  const badDims = buildInternals({ basis: 'equity', scenarios: [], dcf_grid: { ...NHY_GRID, values: [[1, 2], [3, 4]] } as DcfGrid })
  assert.equal(badDims?.dcf, undefined)
})
check('goal seek refuses when the FIXED dcf axis sits outside the recorded grid', () => {
  const d = nhyGsDraft()
  d.internals.dcf.growth = 0.05 // beyond the recorded growth span
  const r = goalSeekBlend(d, 'dcf_wacc', 84.96)
  assert.equal(r.solution, null)
  assert.ok(r.note && r.note.includes('outside the recorded grid'), String(r.note))
})
check('cellState: drive-base outranks a chain on the base row (mirrors recompute precedence)', () => {
  const s = { label: 'base', probability: null, forwardMetric: null, multiple: null, levelOverride: 45.12, chain: buildChain(NHY_BEAR_DERIV) }
  const cvv = chainLevel(s.chain, null)
  assert.equal(scenarioCellState(s, true, 81.83, 17.2, true, cvv).kind, 'live_blend')
  assert.equal(scenarioCellState(s, true, 81.83, null, false, cvv).kind, 'derived_chain')
})
check('chainLevel refuses a cleared net debt — unknown net debt is never silently 0 (§15)', () => {
  const c = buildChain(NHY_BEAR_DERIV)!
  assert.equal(chainLevel({ ...c, netDebt: null }, null), null)
  assert.equal(buildChain({ ...NHY_BEAR_DERIV, net_debt: null }), null)
})
check('wedge trace says "documented" only when drivers text exists; downside trace names the worst row', () => {
  const d = draftFromResponse(emaarRes) // fixture has NO drivers text on base
  const base = d.scenarios.find((s) => s.label === 'base')!
  const cs = scenarioCellState(base, true, d.published!.blend.basePoint, null, false)
  const t = traceScenarioCell(base, cs, d.published)
  assert.ok(t.note && t.note.includes('NO reason'), String(t.note))
  const math = scenarioMath([
    { label: 'bull', probability: 20, price_target: 21 },
    { label: 'base', probability: 45, price_target: 15 },
    { label: 'bear', probability: 35, price_target: 9.75 },
  ], 12.2)
  const dt = traceOutput('downside', math)!
  assert.ok(dt.formula.includes('bear') && dt.note && dt.note.includes('equals the loss-to-bear'), dt.formula)
})

check('runoff trace: formula carries margin % + revenue base; recompute flows the lever end-to-end', () => {
  const s = { label: 'bear', probability: null, forwardMetric: null, multiple: null, levelOverride: 45.12, chain: buildChain(NHY_RUNOFF_DERIV) }
  const t = traceScenarioCell(s, { kind: 'derived_chain', chainValue: 45.1241 }, null)
  assert.ok(t.formula.includes('9%') || t.formula.includes('9.00%') || t.formula.includes('9 %'), t.formula)
  assert.ok(t.formula.includes('228071'), t.formula)
  // end-to-end: a draft whose bear carries the runoff chain — margin 10% moves the bear level in recompute
  const draft = {
    basis: 'equity' as const, shares: 1965.28, netDebt: 13090, price: 84.96,
    rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
    scenarios: [
      { label: 'base', probability: 55, forwardMetric: null, multiple: null, levelOverride: 81.83 },
      { label: 'bull', probability: 20, forwardMetric: null, multiple: null, levelOverride: 107.7 },
      { label: 'bear', probability: 25, forwardMetric: null, multiple: null, levelOverride: 45.12, chain: { ...buildChain(NHY_RUNOFF_DERIV)!, margin: 0.10 } },
    ],
    methods: [], driveBaseFromMix: false,
  }
  const out = recompute(draft)
  const bear = out.scenarios.find((x) => x.label === 'bear')!
  assert.ok(bear.level !== null && Math.abs(bear.level - 51.9573) < 1e-3, `bear ${bear.level}`)
  assert.ok(out.math.expectedReturnPct !== null && Math.abs(out.math.expectedReturnPct - -6.4) < 0.15, `E[r] ${out.math.expectedReturnPct}`)
})


// ---- v1.3: the case's OWN basis and bridge drive its level (Codex #362 P1) ----
// NHY's real, committed shape: the RUN declares basis 'equity' with net_debt 13,090 (broad), while every
// scenario reads on 'ev' and deducts the cash-quality-adjusted 17,919 AND minority 7,495. A client that
// read the run-level fields would show 28,889 × 3.95 = 114,114 per share on an equity basis — the number
// that made this contract necessary.
const NHY13: ValuationLeversResponse = {
  runRoot: 'analyses/NHY_2026-07-19',
  levers: {
    schema_version: '1.3', basis: 'equity', shares: 1965.28, net_debt: 13090, net_debt_basis: 'broad',
    current_price: 84.96,
    scenarios: (['bull', 'base', 'bear'] as const).map((label, i) => ({
      label,
      forward_metric: 28889, metric_basis: 'FY2025 Adj. EBITDA',
      multiple: [8.21, 6.45, 3.95][i], multiple_basis: 'EV/FY2025 Adj. EBITDA',
      multiple_kind: 'implied' as const, basis: 'ev' as const,
      source: '07_scenario-and-fair-value.md §2',
      bridge: { net_debt: 17919, net_debt_basis: 'cash-quality adjusted (01 canonical)', minority: 7495, shares: 1965.28 },
      level: [107.7, 81.83, 45.12][i],
      secondary_multiples: i === 0 ? [{ value: 7.17, basis: 'EV/FY2026E EBITDA' }] : null,
    })),
  },
  decision: {
    scenarios: [
      { label: 'bull', probability: 20, return_pct: 26.8, price_target: 107.7 },
      { label: 'base', probability: 55, return_pct: -3.7, price_target: 81.83 },
      { label: 'bear', probability: 25, return_pct: -46.9, price_target: 45.12 },
    ],
    entry_price: 84.96, entry_price_timestamp: '2026-07-17', currency: 'NOK',
    expected_return_pct: -6.4, margin_of_safety_pct: 3.7, downside_risk_pct: 46.9,
  },
  overrides: [],
}

check('v1.3: a per-case ev bridge drives the level (NHY 8.21/6.45/3.95 → 107.75/81.88/45.13)', () => {
  const out = recompute(draftFromResponse(NHY13))
  for (const [label, want] of [['bull', 107.75], ['base', 81.88], ['bear', 45.13]] as const) {
    const got = out.scenarios.find((s) => s.label === label)!.level
    assert.ok(got !== null && Math.abs(got - want) < 0.02, `${label}: got ${got}, want ~${want}`)
  }
})
check('v1.3: the run-level basis/net-debt are NOT used when the case declares its own', () => {
  const d = draftFromResponse(NHY13)
  assert.equal(d.basis, 'equity')        // the run's own declaration is preserved…
  assert.equal(d.netDebt, 13090)
  assert.equal(d.scenarios[0].basis, 'ev')  // …and the case's overrides it
  assert.equal(d.scenarios[0].bridge!.net_debt, 17919)
  // the failure this exists to prevent: equity basis would give 28,889 × 3.95 = 114,113.55/share
  const bear = levelForScenario(d.scenarios[2], d)
  assert.ok(bear !== null && bear < 100, `bear ${bear} — the run-level equity basis leaked into the case`)
})
check('v1.3: an equity-basis case is never bridged (EMAAR 10.16 × 0.96 = 9.75, not −2.82)', () => {
  const d = draftFromResponse(emaarRes)
  const s = { label: 'bear', probability: 35, forwardMetric: 10.16, multiple: 0.96, levelOverride: null,
              basis: 'equity' as const, bridge: { net_debt: -24969, minority: 13808, shares: 8838.8 } }
  assert.ok(Math.abs(levelForScenario(s, { ...d, basis: 'ev', netDebt: -24969 })! - 9.7536) < 1e-3)
})
check('v1.3: a bridge with no explicit net_debt reads Not assessable, never the run-level fallback (§15)', () => {
  const broken = JSON.parse(JSON.stringify(NHY13))
  delete broken.levers.scenarios[0].bridge.net_debt
  const d = draftFromResponse(broken)
  // the case DECLARED its own terms — silently re-pricing it on the run-level ones would show 114.02
  // against the committed 107.70, which is the disagreement the per-case bridge exists to prevent
  assert.equal(levelForScenario(d.scenarios[0], d), null)
  assert.equal(levelForScenario(d.scenarios[1], d), 81.8815) // the other cases are unaffected
})
check('v1.3: the trace shows the WHOLE arithmetic, bridge included', () => {
  const d = draftFromResponse(NHY13)
  const s = d.scenarios[0]
  const t = traceScenarioCell(s, scenarioCellState(s, false, null, null, false), d.published ?? null)
  assert.ok(t.formula.includes('× multiple 8.21'), t.formula)
  assert.ok(t.formula.includes('net debt 17919') && t.formula.includes('minority 7495'), t.formula)
  assert.ok(t.formula.includes('÷ shares 1965.28'), t.formula)
  assert.ok((t.note ?? '').includes('IMPLIED'), t.note ?? '(no note)')
  assert.equal(t.source, '07_scenario-and-fair-value.md §2')
  assert.equal(t.terms[0].label, 'EV/FY2026E EBITDA')
})
// Codex #365 P1 (frameworks/valuation_summary.schema.json:39): a bridge whose figures came from a
// DIFFERENT document/module than the scenario's own metric/multiple source must show ITS OWN citation,
// not silently inherit the scenario `source` (which the schema defines as citing the metric/multiple only).
check('v1.3: a bridge with its own distinct source shows it as a separate trace term, not folded into `source`', () => {
  const res: ValuationLeversResponse = {
    ...NHY13,
    levers: {
      ...NHY13.levers!,
      scenarios: NHY13.levers!.scenarios.map((sc, i) => i === 2 ? {
        ...sc, bridge: { ...sc.bridge!, source: 'balance-sheet-survival/03 §2 (debt note)' },
      } : sc),
    },
  }
  const d = draftFromResponse(res)
  const s = d.scenarios[2] // bear
  const t = traceScenarioCell(s, scenarioCellState(s, false, null, null, false), d.published ?? null)
  assert.equal(t.source, '07_scenario-and-fair-value.md §2', 'the metric/multiple source is unchanged')
  assert.ok(t.terms.some((x) => x.label === 'bridge source' && x.calc === 'balance-sheet-survival/03 §2 (debt note)'),
    `bridge source must appear as its own term: ${JSON.stringify(t.terms)}`)
})
check('v1.3: a bridge with NO distinct source adds no extra term (falls back to the scenario source)', () => {
  const d = draftFromResponse(NHY13)
  const s = d.scenarios[2] // bear — bridge has no `source` field of its own
  const t = traceScenarioCell(s, scenarioCellState(s, false, null, null, false), d.published ?? null)
  assert.ok(!t.terms.some((x) => x.label === 'bridge source'), `no bridge.source recorded → no extra term: ${JSON.stringify(t.terms)}`)
})
// Codex #365 P2: a case that OMITS its own `basis` but supplies a bridge must still show the bridge in
// the trace when the RUN basis is 'ev' (the fallback `s.basis ?? d.basis` the actual level computation
// uses) — before the fix the trace checked `s.basis === null` directly and dropped the bridge, so the
// formula shown ("28,889 × 8.21" = 237,178/share) did not produce the Worth ("107.7") displayed beside it.
check('v1.3: trace resolves the EFFECTIVE basis (run-level fallback), not just the case\'s own basis field', () => {
  const noOwnBasisRes: ValuationLeversResponse = {
    ...NHY13,
    levers: { ...NHY13.levers!, basis: 'ev', scenarios: NHY13.levers!.scenarios.map((sc) => ({ ...sc, basis: undefined })) },
  }
  const d = draftFromResponse(noOwnBasisRes)
  const s = d.scenarios[0]
  assert.equal(s.basis, null, 'the case itself declares no basis')
  assert.equal(d.basis, 'ev', 'the run supplies the fallback')
  // levelForScenario already used the effective basis and derives the correct bridged level
  assert.ok(Math.abs((levelForScenario(s, d) as number) - 107.75) < 0.02)
  const t = traceScenarioCell(s, scenarioCellState(s, false, null, null, false), d.published ?? null, (k) => k, d.basis)
  assert.ok(t.formula.includes('net debt 17919') && t.formula.includes('minority 7495'),
    `trace must show the bridge that the calculation actually used: ${t.formula}`)
  assert.ok(t.formula.includes('÷ shares 1965.28'), t.formula)
})
check('v1.3: without the runBasis argument, the trace defaults to "equity" and drops the bridge (documents the old bug\'s shape)', () => {
  const noOwnBasisRes: ValuationLeversResponse = {
    ...NHY13,
    levers: { ...NHY13.levers!, basis: 'ev', scenarios: NHY13.levers!.scenarios.map((sc) => ({ ...sc, basis: undefined })) },
  }
  const d = draftFromResponse(noOwnBasisRes)
  const s = d.scenarios[0]
  const t = traceScenarioCell(s, scenarioCellState(s, false, null, null, false), d.published ?? null)
  assert.ok(!t.formula.includes('net debt'), 'default runBasis is equity, so no bridge is shown — the caller MUST pass draft.basis')
})

// ---- checkMultipleSymmetry must be gated by comparable basis in recompute() (Codex #362 P2) ----
// A mixed-method set (an equity P/E bear beside EV/EBITDA bull/base) makes the raw multiples
// incomparable — comparing 0.96 to 6.45 numerically is meaningless, so the check must not even run.
const mixedBasisDraft: PlaygroundDraft = {
  basis: 'ev', shares: null, netDebt: null, price: 100,
  rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
  methods: [], driveBaseFromMix: false,
  scenarios: [
    { label: 'bull', probability: 20, forwardMetric: 28889, multiple: 8.21, levelOverride: null, basis: 'ev', multipleBasis: 'EV/FY2025 Adj. EBITDA' },
    { label: 'base', probability: 55, forwardMetric: 28889, multiple: 6.45, levelOverride: null, basis: 'ev', multipleBasis: 'EV/FY2025 Adj. EBITDA' },
    { label: 'bear', probability: 25, forwardMetric: 10.16, multiple: 0.96, levelOverride: null, basis: 'equity', multipleBasis: 'P/BV (book)' },
  ],
}
check('recompute: a mixed-basis scenario set SKIPS the symmetry check (no false "bear must compress")', () => {
  const out = recompute(mixedBasisDraft)
  assert.equal(out.checks.symmetry, undefined, 'symmetry check must not run across incomparable bases')
  assert.ok(!out.warnings.some((w) => w.includes('compress')), out.warnings.join(' | '))
})
check('recompute: a SAME-basis set still runs the check and still catches a real violation', () => {
  const sameBasis: PlaygroundDraft = {
    ...mixedBasisDraft,
    scenarios: mixedBasisDraft.scenarios.map((s) => ({ ...s, basis: 'equity' as const, multipleBasis: 'P/E', multiple: s.label === 'bear' ? 25 : 20 })),
  }
  const out = recompute(sameBasis)
  assert.ok(out.checks.symmetry !== undefined, 'symmetry check must still run when the bases match')
  assert.equal(out.checks.symmetry!.ok, false, 'bear (25) expanding past base (20) must still be caught')
})

// ---- secondary_multiples must degrade to [] when malformed, never throw (Codex #362 P2) ----
check('draftFromResponse: a non-array secondary_multiples degrades to [] instead of throwing', () => {
  const malformed: ValuationLeversResponse = JSON.parse(JSON.stringify(NHY13))
  ;(malformed.levers!.scenarios[0] as any).secondary_multiples = { value: 7.0, basis: 'P/E' } // an object, not an array
  const d = draftFromResponse(malformed)
  assert.deepEqual(d.scenarios[0].secondaryMultiples, [], 'a malformed sidecar value must degrade to an empty list, not throw')
})

// ---- v1.3 two-way binding: machinery -> implied multiple -> (typed) -> machinery ----
check('impliedMultiple inverts caseLevelFromMultiple exactly (NHY, ev + bridge)', () => {
  const br = { net_debt: 17919, net_debt_basis: 'cash-quality adjusted', minority: 7495, shares: 1965.28 }
  for (const mult of [8.21, 6.45, 3.95]) {
    const lvl = caseLevelFromMultiple(28889, mult, 'ev', br, 1965.28, 13090)!
    const back = impliedMultiple(lvl, 28889, 'ev', br, 1965.28, 13090)!
    assert.ok(Math.abs(back - mult) < 1e-3, `${mult} → ${lvl} → ${back}`)
  }
})
check('impliedMultiple on an equity case is level ÷ metric (EMAAR book bear)', () => {
  assert.ok(Math.abs(impliedMultiple(9.7536, 10.16, 'equity', null)! - 0.96) < 1e-3)
})
check('impliedMultiple refuses rather than guesses (no metric, zero metric, no net debt)', () => {
  assert.equal(impliedMultiple(100, null, 'equity', null), null)
  assert.equal(impliedMultiple(100, 0, 'equity', null), null)
  assert.equal(impliedMultiple(100, 50, 'ev', null, 10, null), null) // §15: unknown net debt
})
check('the shown multiple MOVES when the machinery moves (implied, not frozen)', () => {
  const d = draftFromResponse(NHY13)
  // give the bear the recorded runoff chain, then push its terminal margin 9.0% → 11.0%
  const withChain = { ...d, scenarios: d.scenarios.map((s, i) => (i === 2 ? { ...s, chain: buildChain(NHY_RUNOFF_DERIV) } : s)) }
  const before = recompute(withChain).scenarios[2]
  const after = recompute({ ...withChain, scenarios: withChain.scenarios.map((s, i) => (i === 2 ? { ...s, chain: { ...s.chain!, margin: 0.11 } } : s)) }).scenarios[2]
  assert.ok(before.multipleIsDerived && after.multipleIsDerived, 'both must read as derived')
  assert.ok((after.level as number) > (before.level as number), `level ${before.level} → ${after.level}`)
  assert.ok((after.shownMultiple as number) > (before.shownMultiple as number),
    `the implied multiple must follow the level: ${before.shownMultiple} → ${after.shownMultiple}`)
  // and it still CORRESPONDS: the level recomputes from the shown multiple, to within the half-cent the
  // 2dp readout costs (28,889 × 0.005 ÷ 1,965.28 = 0.074/share). A derived multiple drives nothing — the
  // machinery set the level — so quoting it at two decimals, the way multiples are written, is honest.
  const rt = caseLevelFromMultiple(28889, after.shownMultiple as number, 'ev', withChain.scenarios[2].bridge, 1965.28, 13090)!
  const readoutTol = 28889 * 0.005 / 1965.28
  assert.ok(Math.abs(rt - (after.level as number)) <= readoutTol, `${rt} vs ${after.level} (tol ${readoutTol})`)
  assert.equal(after.shownMultiple, Math.round((after.shownMultiple as number) * 100) / 100, 'a derived multiple reads at 2dp')
})
check('a TYPED multiple outranks the machinery and is shown as typed', () => {
  const d = draftFromResponse(NHY13)
  const withChain = { ...d, scenarios: d.scenarios.map((s, i) => (i === 2 ? { ...s, chain: buildChain(NHY_RUNOFF_DERIV) } : s)) }
  const asserted = { ...withChain, scenarios: withChain.scenarios.map((s, i) => (i === 2 ? { ...s, multiple: 5.0, multipleAsserted: true } : s)) }
  const r = recompute(asserted).scenarios[2]
  assert.equal(r.multipleIsDerived, false)
  assert.equal(r.shownMultiple, 5.0)
  const want = caseLevelFromMultiple(28889, 5.0, 'ev', withChain.scenarios[2].bridge, 1965.28, 13090)
  assert.ok(Math.abs((r.level as number) - (want as number)) < 1e-6, `typed multiple must drive: ${r.level} vs ${want}`)
})
check('↺ (clearing the assertion) hands the level back to the machinery', () => {
  const d = draftFromResponse(NHY13)
  const withChain = { ...d, scenarios: d.scenarios.map((s, i) => (i === 2 ? { ...s, chain: buildChain(NHY_RUNOFF_DERIV) } : s)) }
  const back = recompute({ ...withChain, scenarios: withChain.scenarios.map((s, i) => (i === 2 ? { ...s, multiple: s.recordedMultiple ?? null, multipleAsserted: false } : s)) }).scenarios[2]
  assert.ok(Math.abs((back.level as number) - 45.12) < 0.02, `back to the chain's own level, got ${back.level}`)
})
check('an untouched draft asserts nothing (the run drives until the analyst types)', () => {
  const d = draftFromResponse(NHY13)
  assert.ok(d.scenarios.every((s) => s.multipleAsserted === false))
  assert.deepEqual(d.scenarios.map((s) => s.recordedMultiple), [8.21, 6.45, 3.95])
})

// ---- #364 review fixes ----

// A base row with BOTH a run-level method mix AND its own `implied` tuple (no chain) — the mix, not the
// bare tuple, is the "something else" an `implied` cross-check is supposed to be read off. Before this
// fix, draftFromResponse cleared levelOverride for ANY tuple regardless of the mix, so an untouched,
// unasserted tuple silently became the driver and editing the forward metric repriced the case with no
// assertion (Codex #364 P1 — distinct from NHY's bull/bear, which have NO other machinery at all and so
// correctly stay tuple-driven by default, per the per-case-bridge tests above).
const NHY13_WITH_MIX: ValuationLeversResponse = {
  ...NHY13,
  levers: {
    ...NHY13.levers!,
    methods: { dcf: 70.14, peers: 93.7 }, method_weights: { dcf: 0.5, peers: 0.5 },
  } as any,
}
check('an implied tuple on a base row WITH a method mix (no chain) preserves the frozen level until asserted', () => {
  const d = draftFromResponse(NHY13_WITH_MIX)
  const base = d.scenarios[1]
  assert.equal(levelSourceFor(base, d), 'frozen', 'the mix is the real machinery here, not the bare tuple')
  assert.equal(levelForScenario(base, d), 81.83, 'holds the run\'s own frozen base level')
  // editing the forward metric alone must NOT reprice it — only an explicit assertion does
  const editedMetric = { ...d, scenarios: d.scenarios.map((s, i) => (i === 1 ? { ...s, forwardMetric: 30000 } : s)) }
  assert.equal(levelForScenario(editedMetric.scenarios[1], editedMetric), 81.83, 'a metric edit alone must not silently reprice')
  // asserting the multiple DOES take over
  const asserted = { ...d, scenarios: d.scenarios.map((s, i) => (i === 1 ? { ...s, multiple: 7.0, multipleAsserted: true } : s)) }
  assert.equal(levelSourceFor(asserted.scenarios[1], asserted), 'asserted_multiple')
  assert.ok(levelForScenario(asserted.scenarios[1], asserted) !== 81.83, 'an explicit assertion must take over')
})
check('NHY\'s own bull/bear (implied, no chain, no mix) still default to the tuple — unchanged (per-case-bridge feature)', () => {
  const d = draftFromResponse(NHY13)
  assert.equal(levelSourceFor(d.scenarios[0], d), 'multiple')
  assert.equal(levelSourceFor(d.scenarios[2], d), 'multiple')
})

check('an `applied` multiple outranks a recorded chain (the v1.3 contract: applied IS the input)', () => {
  const d = draftFromResponse(NHY13)
  const withChain = { ...d, scenarios: d.scenarios.map((s, i) => (i === 2 ? { ...s, chain: buildChain(NHY_BEAR_DERIV), multipleKind: 'applied' as const } : s)) }
  assert.equal(levelSourceFor(withChain.scenarios[2], withChain), 'multiple', 'applied wins over the chain')
  const want = caseLevelFromMultiple(28889, 3.95, 'ev', withChain.scenarios[2].bridge, 1965.28, 13090)
  assert.ok(Math.abs((levelForScenario(withChain.scenarios[2], withChain) as number) - (want as number)) < 1e-6)
  // an untouched `implied` sibling with the same chain still reads the chain — only `applied` changes precedence
  assert.equal(levelSourceFor(withChain.scenarios[0], withChain), 'multiple') // bull has no chain here, unaffected
})

check('an explicit base-row edit outranks the live blend, even with driveBaseFromMix on', () => {
  const d = draftFromResponse(NHY13)
  const withMix = { ...d, methods: buildMethods({ dcf: 70.14, peers: 93.7 }, { dcf: 0.5, peers: 0.5 }), driveBaseFromMix: true }
  // sanity: with no explicit edit, the blend really does drive the base row
  const blended = recompute(withMix).scenarios[1]
  assert.equal(blended.levelSource, 'live_blend')
  // an unlocked override on the base row must win over the blend
  const overridden = { ...withMix, scenarios: withMix.scenarios.map((s, i) => (i === 1 ? { ...s, overrideUnlocked: true, levelOverride: 150 } : s)) }
  const out1 = recompute(overridden).scenarios[1]
  assert.equal(out1.levelSource, 'override')
  assert.equal(out1.level, 150, 'the explicit override must win over the live blend')
  // a typed (asserted) base multiple must also win over the blend
  const asserted = { ...withMix, scenarios: withMix.scenarios.map((s, i) => (i === 1 ? { ...s, multiple: 7.0, multipleAsserted: true } : s)) }
  const out2 = recompute(asserted).scenarios[1]
  assert.equal(out2.levelSource, 'asserted_multiple')
  assert.ok(out2.level !== blended.level, 'the explicit assertion must win over the live blend')
})

check('levelSourceFor names what actually drives, and levelForScenario never disagrees with it', () => {
  const d = draftFromResponse(NHY13)
  const withChain = { ...d, scenarios: d.scenarios.map((x, i) => (i === 2 ? { ...x, chain: buildChain(NHY_RUNOFF_DERIV) } : x)) }
  const cases: [string, any, string | null][] = [
    ['recorded metric × multiple', withChain.scenarios[0], 'multiple'],
    ['a recorded chain', withChain.scenarios[2], 'chain'],
    ['a typed multiple beats the chain', { ...withChain.scenarios[2], multiple: 5, multipleAsserted: true }, 'asserted_multiple'],
    ['an explicit unlock beats everything', { ...withChain.scenarios[2], overrideUnlocked: true, levelOverride: 50 }, 'override'],
    ['a frozen level with no relationship', { label: 'x', probability: null, forwardMetric: null, multiple: null, levelOverride: 12 }, 'frozen'],
    ['nothing recorded', { label: 'y', probability: null, forwardMetric: null, multiple: null, levelOverride: null }, null],
  ]
  for (const [name, sc, want] of cases) {
    assert.equal(levelSourceFor(sc, withChain), want, name)
    // the label and the number must come from the SAME branch
    const lvl = levelForScenario(sc, withChain)
    if (want === null) assert.equal(lvl, null, name)
    else assert.ok(lvl !== null, `${name}: source ${want} but no level`)
  }
})
check('a DRIVING multiple does not read as derived (NHY bull), a chain-driven one does (bear)', () => {
  const d = draftFromResponse(NHY13)
  const withChain = { ...d, scenarios: d.scenarios.map((x, i) => (i === 2 ? { ...x, chain: buildChain(NHY_RUNOFF_DERIV) } : x)) }
  const out = recompute(withChain)
  // bull: metric × multiple IS the relationship — the multiple computes the level, so it is an input
  assert.equal(out.scenarios[0].multipleIsDerived, false)
  assert.equal(out.scenarios[0].shownMultiple, 8.21) // verbatim, not round-tripped
  assert.equal(out.scenarios[0].levelSource, 'multiple')
  // bear: the chain computes the level, so the multiple is what that level corresponds to
  assert.equal(out.scenarios[2].multipleIsDerived, true)
  assert.equal(out.scenarios[2].levelSource, 'chain')
  // and the live blend outranks the base row when opted into
  const driven = recompute({ ...withChain, driveBaseFromMix: true, methods: buildMethods({ peers: 93.7, dcf: 70.14 }, { peers: 0.5, dcf: 0.5 }) })
  assert.equal(driven.scenarios[1].levelSource, 'live_blend')
  assert.equal(driven.scenarios[1].multipleIsDerived, true)
})
check('symmetry follows the EFFECTIVE multiples, so moved machinery can break it', () => {
  const d = draftFromResponse(NHY13)
  const withChain = { ...d, scenarios: d.scenarios.map((x, i) => (i === 2 ? { ...x, chain: buildChain(NHY_RUNOFF_DERIV) } : x)) }
  assert.equal(recompute(withChain).checks.symmetry?.ok, true) // 8.21 >= 6.45 >= 3.95
  // push the bear's terminal margin until its implied multiple passes the base
  const hot = { ...withChain, scenarios: withChain.scenarios.map((x, i) => (i === 2 ? { ...x, chain: { ...x.chain!, margin: 0.16 } } : x)) }
  const r = recompute(hot)
  assert.ok((r.scenarios[2].shownMultiple as number) > (r.scenarios[1].shownMultiple as number), `bear ${r.scenarios[2].shownMultiple} vs base ${r.scenarios[1].shownMultiple}`)
  assert.equal(r.checks.symmetry?.ok, false, 'a bear multiple above the base must warn')
  assert.ok(r.warnings.some((w) => /bear multiple/.test(w)), JSON.stringify(r.warnings))
})
check('symmetry is SKIPPED across incomparable bases (an EV base vs a book-value bear)', () => {
  const d = draftFromResponse(NHY13)
  const mixed = { ...d, scenarios: [
    { ...d.scenarios[0], multipleBasis: 'EV/FY2025 Adj. EBITDA' },
    { ...d.scenarios[1], multipleBasis: 'EV/FY2025 Adj. EBITDA' },
    // EMAAR's real shape: the bear reads on BOOK, where 0.96x is not comparable to 6.45x EV/EBITDA
    { ...d.scenarios[2], basis: 'equity' as const, bridge: null, forwardMetric: 10.16, multiple: 0.96, multipleBasis: 'P/BV (book)' },
  ] }
  const r = recompute(mixed)
  assert.equal(r.checks.symmetry, undefined, 'mixed bases must not be compared at all')
  assert.ok(!r.warnings.some((w) => /multiple/.test(w) && /bear|bull/.test(w)), JSON.stringify(r.warnings))
})
check('the dispersion span comes from the DERIVED method values, not the raw typed ones', () => {
  const d = draftFromResponse(emaarRes)
  const before = recompute(d).methodSpan!
  assert.ok(Math.abs(before.lo - 12.5) < 1e-9 && Math.abs(before.hi - 18) < 1e-9, JSON.stringify(before))
  // drive peers from its recorded anchors — the blend uses the derived value, so the span must too
  const withPeers: typeof d = { ...d, methods: d.methods, internals: { peers: { pi: NHY_PEERS, multiple: 6.5, active: true } } }
  const after = recompute(withPeers).methodSpan!
  assert.notDeepEqual(after, before)
  const peersDerived = recompute(withPeers).methodInternals.peers?.value
  assert.ok(peersDerived != null && (after.hi === peersDerived || after.lo === peersDerived),
    `span ${JSON.stringify(after)} must contain the derived peers value ${peersDerived}`)
})
check('one method (or none) is not a dispersion — no span rather than a fake one', () => {
  const one = { ...draftFromResponse(emaarRes), methods: buildMethods({ dcf: 100 }, { dcf: 1 }) }
  assert.equal(recompute(one).methodSpan, null)
  const flat = { ...draftFromResponse(emaarRes), methods: buildMethods({ dcf: 100, peers: 100 }, { dcf: 0.5, peers: 0.5 }) }
  assert.equal(recompute(flat).methodSpan, null)
})
check('an unlock seeded from the shown level actually takes over (the button is not a no-op)', () => {
  const d = draftFromResponse(NHY13)
  const shown = recompute(d).scenarios[0].level as number
  // what the component's `unlock` does: overrideUnlocked + the level currently on screen
  const unlocked = { ...d, scenarios: d.scenarios.map((x, i) => (i === 0 ? { ...x, overrideUnlocked: true, levelOverride: shown } : x)) }
  assert.equal(levelSourceFor(unlocked.scenarios[0], unlocked), 'override')
  assert.equal(recompute(unlocked).scenarios[0].level, shown)
  // and editing it moves the case even though the row records a metric × multiple
  const typed = { ...unlocked, scenarios: unlocked.scenarios.map((x, i) => (i === 0 ? { ...x, levelOverride: 150 } : x)) }
  assert.equal(recompute(typed).scenarios[0].level, 150)
})

// ---- position-signed returns: the client must match scripts/valuation_math.py on a SHORT ----
// The fixture is the committed TSLA_2026-07-25 decision_record, reproduced from its own five levels and
// probabilities. Parity targets are the exact published fields: +56.57 / +30.56 / 1.85.
const TSLA_SHORT = [
  { label: 'bull', probability: 25, price_target: 336.08 },
  { label: 'base', probability: 20, price_target: 32.37 },
  { label: 'bear_cyclical', probability: 25, price_target: 20.90 },
  { label: 'bear_structural', probability: 20, price_target: 6.86 },
  { label: 'tail_squeeze', probability: 10, price_target: 417.40 },
]
check('short: reproduces the published TSLA decision_record (+56.57 / +30.56 / 1.85)', () => {
  const m = scenarioMath(TSLA_SHORT, 319.69, 'short')
  assert.ok(Math.abs((m.expectedReturnPct as number) - 56.57) < 0.05, `E[r] ${m.expectedReturnPct}`)
  assert.ok(Math.abs((m.downsideRiskPct as number) - 30.56) < 0.05, `downside ${m.downsideRiskPct}`)
  assert.ok(Math.abs((m.riskReward as number) - 1.85) < 0.02, `rr ${m.riskReward}`)
})
check('short: a price RISE is a loss and a FALL is a gain', () => {
  const m = scenarioMath(TSLA_SHORT, 319.69, 'short')
  const r = Object.fromEntries(m.perScenario.map((x) => [x.label, x.return_pct]))
  assert.ok(Math.abs((r.bull as number) + 5.1) < 0.15, `bull ${r.bull}`)
  assert.ok(Math.abs((r.base as number) - 89.9) < 0.15, `base ${r.base}`)
  assert.equal(Math.min(...m.perScenario.map((x) => x.return_pct as number)), r.tail_squeeze)
})
check('short: margin of safety stays DIRECTION-UNIFORM (negative, not flipped)', () => {
  const m = scenarioMath(TSLA_SHORT, 319.69, 'short')
  assert.ok((m.marginOfSafetyPct as number) < 0, `mos ${m.marginOfSafetyPct}`)
  assert.equal(m.marginOfSafetyPct, scenarioMath(TSLA_SHORT, 319.69, 'long').marginOfSafetyPct)
})
check('the long formula on a short flips every sign — the bug this pins', () => {
  const lg = scenarioMath(TSLA_SHORT, 319.69, 'long')
  assert.ok(Math.abs((lg.expectedReturnPct as number) + 56.57) < 0.05, `${lg.expectedReturnPct}`)
  assert.ok(Math.abs((lg.downsideRiskPct as number) - 97.9) < 0.2, `${lg.downsideRiskPct}`)
})
check('the adverse-branch warning follows the direction (AM for a long, AR for a short)', () => {
  const sh = scenarioMath(TSLA_SHORT, 319.69, 'short')
  assert.ok(!sh.warnings.some((w) => /downside branch for a long/.test(w)), JSON.stringify(sh.warnings))
  const noSqueeze = scenarioMath([{ label: 'bull', probability: 50, price_target: 200 },
                                  { label: 'bear', probability: 50, price_target: 50 }], 300, 'short')
  assert.ok(noSqueeze.warnings.some((w) => /squeeze\/upside branch for a short/.test(w)), JSON.stringify(noSqueeze.warnings))
})
check('direction defaults to long, and reanchor carries it', () => {
  assert.equal(scenarioMath(TSLA_SHORT, 319.69).expectedReturnPct, scenarioMath(TSLA_SHORT, 319.69, 'long').expectedReturnPct)
  assert.equal(reanchor(TSLA_SHORT, 319.69, 'short').expectedReturnPct, scenarioMath(TSLA_SHORT, 319.69, 'short').expectedReturnPct)
})
check('draftFromResponse reads the direction from the decision basket', () => {
  const shortRes: ValuationLeversResponse = { ...NHY13, decision: { ...NHY13.decision!, basket: 'Short' } }
  assert.equal(draftFromResponse(shortRes).direction, 'short')
  assert.equal(draftFromResponse(NHY13).direction, 'long')
  assert.equal(draftFromResponse({ ...NHY13, decision: { ...NHY13.decision!, basket: 'Watchlist' } }).direction, 'long')
  const a = recompute(draftFromResponse(NHY13)).math.expectedReturnPct as number
  const b = recompute(draftFromResponse(shortRes)).math.expectedReturnPct as number
  assert.ok(Math.abs(a + b) < 0.15, `long ${a} vs short ${b} — must be equal and opposite`)
})
check('mosRead: the sentence follows the sign, so it can never state the opposite of the truth', () => {
  const above = mosRead(-887.7, 'short')
  assert.equal(above.label, 'Price above that by')
  assert.equal(above.magnitude, 887.7)
  assert.equal(above.good, true)                      // for a SHORT, expensive is the thesis working
  assert.equal(mosRead(-887.7, 'long').good, false)   // for a LONG, the same fact is bad news
  assert.equal(mosRead(-3.83, 'long').label, 'Price above that by')
  const below = mosRead(18.7, 'long')
  assert.equal(below.label, 'Price below that by')
  assert.equal(below.magnitude, 18.7)
  assert.equal(below.good, true)
  assert.equal(mosRead(18.7, 'short').good, false)     // a cheap stock is bad news for a short
  assert.equal(mosRead(null).magnitude, null)
  assert.equal(mosRead(null).good, null)
})

check('two down-legs: "downside to bear" takes the WORST bear, not the first listed', () => {
  const m = scenarioMath(TSLA_SHORT, 319.69, 'short')
  // structural 6.86 -> 97.9% fall; cyclical 20.90 -> 93.5%. The first listed is the cyclical.
  assert.ok(Math.abs((m.downsideToBearPct as number) - 97.9) < 0.2, `picked the wrong bear: ${m.downsideToBearPct}`)
  // and a single-bear set is unchanged by that rule
  const one = scenarioMath([{ label: 'base', probability: 50, price_target: 100 }, { label: 'bear', probability: 50, price_target: 60 }], 120)
  assert.ok(Math.abs((one.downsideToBearPct as number) - 50) < 0.1, `${one.downsideToBearPct}`)
})
check('risk/reward stays tied to the two published fields it is built from', () => {
  // er/dr is the documented long formula written direction-generally; assert the identity holds both ways
  for (const dir of ['long', 'short'] as const) {
    const m = scenarioMath(TSLA_SHORT, 319.69, dir)
    assert.ok(Math.abs((m.riskReward as number) - (m.expectedReturnPct as number) / (m.downsideRiskPct as number)) < 0.02, dir)
  }
})

// ---- #366 review fixes ----
check('risk/reward is built from UNROUNDED values, so it reproduces the published figure exactly', () => {
  // AMZN's published -0.41. Dividing the two ROUNDED percentages gives -0.42 — a real change to a
  // committed long run that a ±0.02 test tolerance hid.
  const amzn = scenarioMath([
    { label: 'bull', probability: 25, price_target: 247 },
    { label: 'base', probability: 45, price_target: 210 },
    { label: 'bear', probability: 30, price_target: 146 },
  ], 237.53)
  assert.equal(amzn.riskReward, -0.41, `rr ${amzn.riskReward} (rounded-input version gives -0.42)`)
  // and a sub-0.05% adverse case still yields a ratio instead of null
  const tiny = scenarioMath([{ label: 'base', probability: 50, price_target: 101 },
                             { label: 'bear', probability: 50, price_target: 99.98 }], 100)
  assert.ok(isFinite(tiny.riskReward as number), `tiny ${tiny.riskReward}`)
  assert.ok(Math.abs((tiny.riskReward as number) - 24.5) < 0.05, `tiny ${tiny.riskReward}`)
})
check('traceOutput states the arithmetic that produced the number beside it, on a short', () => {
  const m = scenarioMath(TSLA_SHORT, 319.69, 'short')
  const t = traceOutput('expected', m, 'short')!
  // the long formula printed beside a +56.57% would be an equation of the opposite sign
  assert.ok(/price 319.69 − prob-weighted target/.test(t.formula), t.formula)
  assert.ok(/SHORT/.test(t.note ?? ''), t.note ?? '')
  const long = traceOutput('expected', scenarioMath(TSLA_SHORT, 319.69, 'long'), 'long')!
  assert.ok(/prob-weighted target .* − price/.test(long.formula), long.formula)
})
check('the risk/reward trace states the ratio actually computed, and never goes silent', () => {
  const m = scenarioMath(TSLA_SHORT, 319.69, 'short')
  const t = traceOutput('rr', m, 'short')!
  assert.ok(/expected return .* \/ downside risk/.test(t.formula), t.formula)
  assert.ok(/tail_squeeze/.test(t.note ?? ''), t.note ?? '')     // names the real worst case
  assert.ok(/NOT the bear row/.test(t.note ?? ''), t.note ?? '')
  // a set whose worst row is not bear-labelled used to return null here
  const noBearWorst = scenarioMath([{ label: 'bull', probability: 50, price_target: 50 },
                                    { label: 'base', probability: 50, price_target: 120 }], 100)
  assert.ok(traceOutput('rr', noBearWorst) !== null, 'rr trace must not go silent')
})
check('the margin-of-safety trace says which side of fair value the price is on', () => {
  const t = traceOutput('mos', scenarioMath(TSLA_SHORT, 319.69, 'short'), 'short')!
  assert.ok(/ABOVE base fair value/.test(t.note ?? ''), t.note ?? '')
})
check('the case trace resolves an INHERITED ev basis and the shares fallback', () => {
  // a case with NO per-case basis, on an ev RUN — exactly TSLA's committed shape
  const s = { label: 'bull', probability: 25, forwardMetric: 121946, multiple: 11.5, levelOverride: null,
              basis: null, bridge: { net_debt: -27444, net_debt_basis: 'broad', minority: 661, shares: null },
              metricBasis: 'NTM revenue', multipleBasis: 'NTM EV/Sales' }
  const withCtx = traceScenarioCell(s as any, { kind: 'derived_multiple' }, null, (k) => k, { basis: 'ev', shares: 4252.5 })
  assert.ok(/net debt -27444/.test(withCtx.formula), withCtx.formula)   // the bridge IS shown
  assert.ok(/minority 661/.test(withCtx.formula), withCtx.formula)
  assert.ok(/÷ shares 4252.5/.test(withCtx.formula), withCtx.formula)   // the top-level fallback, not '—'
  // without the context it would print bare metric × multiple beside a bridged level
  const noCtx = traceScenarioCell(s as any, { kind: 'derived_multiple' }, null)
  assert.ok(!/net debt/.test(noCtx.formula), noCtx.formula)
})

// Same truncation guard as the Python suite: a `process.exit` or an early throw above a block would run
// fewer checks while still exiting 0. Asserting the count is the only way to catch that from inside — the
// Python side had an entire group go dead this way (Codex #366 review).
const EXPECTED_CHECKS = 94
assert.ok(passed >= EXPECTED_CHECKS,
  `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS} — something above here is short-circuiting`)
console.log(`valuationLevers.test.ts: ${passed} assertions passed`)
