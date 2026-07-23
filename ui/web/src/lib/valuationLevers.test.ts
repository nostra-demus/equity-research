// valuationLevers — the CLIENT mirror of scripts/valuation_math.py that the Valuation Playground recomputes
// with (run: npx tsx src/lib/valuationLevers.test.ts; ui-web CI `npm test` runs it). This pins the
// method-mix blend (#PR-B): the committed runs are all method-BLENDS, not a single forward-metric × multiple,
// so blend() over the football field is the real base-case lever. If blend() drifts from the Python engine
// that produced the fair value, the Playground silently disagrees with the recorded thesis — this file fails
// first. Parity targets are the exact valuation_math.py outputs: AMZN 210.05, NHY 81.826, EMAAR 16.5245.
import assert from 'node:assert'
import { blend, buildMethods, draftFromResponse, recompute, type MethodLever, type ValuationLeversResponse } from './valuationLevers'

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

console.log(`valuationLevers.test.ts: ${passed} assertions passed`)
