// Client mirror of scripts/valuation_math.py — the browser can't import the Python calc engine, so the
// SHAPE + the formulas live here too (same pattern as rankWeights.ts mirroring the server scorer). Moving a
// lever in the Valuation Playground recomputes the fair-value levels + scenario returns with NO agent
// re-run and NO server round-trip (scoreUnderWeights, but for valuation). A parity test could assert the
// two engines agree on the committed AMZN case (expected -16.1 / mos -13.5 / downside 38.7 / rr -0.41).
//
// Doctrine: CLAUDE.md §10 (scenario identities), §15/§16 (net-debt basis; MoS vs downside-to-bear are two
// separate metrics; price-independent levels), and the valuation MODULE_RULES Phase-1 additions (Gate-4
// WACC band after-tax k_d <= WACC < k_e; bull >= base >= bear multiple symmetry).

export type Basis = 'equity' | 'ev'

export interface SummaryScenario {
  label: string
  probability?: number | null
  forward_metric?: number | null
  metric_basis?: string | null
  multiple?: number | null
  level?: number | null
  drivers?: string | null
}

export interface ValuationSummary {
  schema_version?: string
  ticker?: string
  as_of?: string
  currency?: string
  business_type?: string
  basis: Basis
  shares?: number | null
  net_debt?: number | null
  net_debt_basis?: string | null
  current_price?: number | null
  price_as_of?: string | null
  price_state?: string | null
  scenarios: SummaryScenario[]
  methods?: Record<string, number | null>
  method_weights?: Record<string, number | null>
  discount_rate?: {
    rf?: number | null; erp?: number | null; beta?: number | null
    cost_of_equity?: number | null; wacc?: number | null; after_tax_kd?: number | null
  }
  is_developed_mega_cap?: boolean | null
}

// what GET /api/valuation-levers returns
export interface DecisionScenario { label?: string; probability?: number | null; return_pct?: number | null; price_target?: number | null }
export interface ValuationLeversResponse {
  runRoot: string
  levers: ValuationSummary | null
  decision: {
    scenarios: DecisionScenario[]
    entry_price: number | null
    entry_price_timestamp: string | null
    currency: string | null
    expected_return_pct: number | null
    margin_of_safety_pct: number | null
    downside_risk_pct: number | null
  } | null
  overrides: ValuationOverride[]
}
export interface ValuationOverride { id: string; run_root: string; ts: string; reason: string; overrides: Record<string, unknown>; levels?: Record<string, number> | null }

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const pct = (x: number, nd = 1) => round(x * 100, nd)
function round(x: number, nd = 4): number { const p = 10 ** nd; return Math.round(x * p) / p }

// ---- method-mix football field: the cross-method blend, a mirror of scripts/valuation_math.py blend() ----
// Each value-producing method (own_history / peers / dcf / sotp) carries a per-share value and a weight. The
// blended base point RENORMALIZES the weights over the methods actually present (numeric value AND a
// NON-NEGATIVE weight), so a dropped or zero-weighted method cannot silently zero the blend. Matches the
// Python engine on committed data (which never carries a negative weight); the client additionally DROPS a
// negative user-entered weight rather than producing a base point outside every method value (e.g. values
// 100/200 at weights −1/2 would otherwise blend to 300). This is the real primary lever for the committed
// runs, which are all method-blends, not a single metric×multiple.
export interface MethodLever { key: string; value: number | null; weight: number | null }
export interface BlendResult { basePoint: number | null; effectiveWeights: Record<string, number>; note?: string }
export function blend(methods: MethodLever[]): BlendResult {
  const used = (methods || []).filter((m) => isNum(m.value) && isNum(m.weight) && (m.weight as number) >= 0)
  const wsum = used.reduce((a, m) => a + (m.weight as number), 0)
  if (!used.length || wsum <= 0) return { basePoint: null, effectiveWeights: {}, note: 'no value-producing method with a weight' }
  const eff: Record<string, number> = {}
  used.forEach((m) => { eff[m.key] = (m.weight as number) / wsum })
  const point = used.reduce((a, m) => a + (m.value as number) * eff[m.key], 0)
  return { basePoint: round(point, 4), effectiveWeights: Object.fromEntries(Object.entries(eff).map(([k, v]) => [k, round(v, 4)])) }
}

// ---- 1. fair-value LEVEL from a (forward metric × multiple) lever ----
export function levelFromMultiple(metric: number, multiple: number, basis: Basis, shares?: number | null, netDebt: number | null = 0): number {
  if (basis === 'ev') {
    if (!(isNum(shares) && shares > 0)) throw new Error("basis 'ev' needs positive shares")
    // An EV multiple gives enterprise value; the equity bridge REQUIRES net debt. Treating an unknown
    // net debt as 0 would silently value the firm as debt-free and overstate every level (§15). If net
    // debt is not supplied, the EV level is Not assessable — throw so the caller renders null.
    if (!isNum(netDebt)) throw new Error("basis 'ev' needs net debt for the equity bridge")
    const ev = metric * multiple
    return (ev - netDebt) / shares
  }
  return metric * multiple // equity: EPS × P/E (net debt not used)
}

// ---- 2. scenario math — the §10 identities ----
export interface ScenarioRow { label: string; probability: number; price_target: number; return_pct: number | null }
export interface ScenarioMath {
  probWeightedTarget: number | null
  levels: Record<string, number>
  perScenario: ScenarioRow[]
  price: number | null
  priceRelativeAssessable: boolean
  expectedReturnPct: number | null
  marginOfSafetyPct: number | null
  downsideToBearPct: number | null
  downsideRiskPct: number | null
  riskReward: number | null
  warnings: string[]
}

const findByLabel = <T extends { label: string }>(rows: T[], name: string): T | undefined => rows.find((s) => (s.label || '').toLowerCase().includes(name))

export function scenarioMath(scenarios: { label: string; probability?: number | null; price_target?: number | null }[], price: number | null | undefined): ScenarioMath {
  const warnings: string[] = []
  if (!Array.isArray(scenarios)) {
    return { probWeightedTarget: null, levels: {}, perScenario: [], price: null, priceRelativeAssessable: false,
      expectedReturnPct: null, marginOfSafetyPct: null, downsideToBearPct: null, downsideRiskPct: null, riskReward: null,
      warnings: ['scenarios must be an array'] }
  }
  const clean = scenarios.filter((s) => s && isNum(s.probability) && isNum(s.price_target)) as { label: string; probability: number; price_target: number }[]
  const psum = clean.reduce((a, s) => a + s.probability, 0)
  if (clean.length && Math.abs(psum - 100) > 0.5) warnings.push(`scenario probabilities sum to ${round(psum, 2)}, not 100 (§10)`)
  const pwt = clean.length ? clean.reduce((a, s) => a + (s.price_target * s.probability) / 100, 0) : null
  const base = findByLabel(clean, 'base')
  const bear = findByLabel(clean, 'bear')
  const havePrice = isNum(price) && price > 0
  const perScenario: ScenarioRow[] = clean.map((s) => ({
    label: s.label, probability: s.probability, price_target: s.price_target,
    return_pct: havePrice ? pct((s.price_target - (price as number)) / (price as number)) : null,
  }))
  const levels: Record<string, number> = {}
  clean.forEach((s) => { levels[(s.label || '').toLowerCase()] = s.price_target })

  const out: ScenarioMath = {
    probWeightedTarget: pwt !== null ? round(pwt, 4) : null,
    levels, perScenario, price: havePrice ? (price as number) : null, priceRelativeAssessable: !!havePrice,
    expectedReturnPct: null, marginOfSafetyPct: null, downsideToBearPct: null, downsideRiskPct: null, riskReward: null,
    warnings,
  }
  if (!havePrice) return out
  const p = price as number
  out.expectedReturnPct = pwt !== null ? pct((pwt - p) / p) : null
  out.marginOfSafetyPct = base ? pct((base.price_target - p) / base.price_target) : null
  if (bear) out.downsideToBearPct = pct((p - bear.price_target) / p) // inverted: higher = worse
  else warnings.push('no bear scenario — downside-to-bear Not assessable')
  const rets = perScenario.map((r) => r.return_pct).filter((r): r is number => r !== null)
  out.downsideRiskPct = rets.length ? round(-Math.min(...rets), 1) : null
  if (bear && pwt !== null) {
    const denom = p - bear.price_target
    out.riskReward = Math.abs(denom) > 1e-9 ? round((pwt - p) / denom, 2) : null
  }
  if (bear && bear.price_target >= p) warnings.push(`bear target ${bear.price_target} is not below price ${p} — no genuine downside branch for a long (§8/§16)`)
  return out
}

export const reanchor = (scenarios: { label: string; probability?: number | null; price_target?: number | null }[], newPrice: number) => scenarioMath(scenarios, newPrice)

// ---- 3. discount-rate + symmetry guards ----
export function capmCostOfEquity(rf?: number | null, beta?: number | null, erp?: number | null): number | null {
  return isNum(rf) && isNum(beta) && isNum(erp) ? rf + beta * erp : null
}

export interface CheckResult { ok: boolean; problems: string[]; costOfEquity?: number | null; bullExpands?: boolean }

export function checkWacc(afterTaxKd?: number | null, wacc?: number | null, ke?: number | null, rf?: number | null, erp?: number | null, isMega = false): CheckResult {
  const problems: string[] = []
  // A WACC can never EXCEED k_e. It may EQUAL k_e only for a debt-free firm (no debt weight); for a levered
  // firm (a positive after-tax cost of debt is given) WACC must be strictly below k_e. So flag wacc > k_e
  // always, but flag equality only when debt is present — otherwise an all-equity firm's correct WACC == k_e
  // is wrongly reported as an assembly error.
  if (isNum(wacc) && isNum(ke)) {
    if (wacc > ke + 1e-9) problems.push(`WACC ${round(wacc, 4)} > cost of equity ${round(ke, 4)} — a WACC cannot exceed k_e (assembly error)`)
    else if (Math.abs(wacc - ke) <= 1e-9 && isNum(afterTaxKd)) problems.push(`WACC ${round(wacc, 4)} = cost of equity ${round(ke, 4)} but a positive after-tax cost of debt is given — a levered firm's WACC must be below k_e (assembly error)`)
  }
  if (isNum(afterTaxKd) && isNum(wacc) && wacc < afterTaxKd) problems.push(`WACC ${round(wacc, 4)} < after-tax cost of debt ${round(afterTaxKd, 4)} — below the band`)
  if (isMega && isNum(ke) && isNum(rf) && isNum(erp)) {
    const ceiling = rf + 1.4 * erp
    if (ke > ceiling) problems.push(`cost of equity ${round(ke, 4)} > developed-market mega-cap ceiling rf+1.4·ERP=${round(ceiling, 4)} (≈ β>1.4) — needs a cited beta`)
  }
  return { ok: problems.length === 0, problems, costOfEquity: isNum(ke) ? round(ke, 4) : null }
}

export function checkMultipleSymmetry(bull?: number | null, base?: number | null, bear?: number | null): CheckResult {
  const problems: string[] = []
  if (isNum(bull) && isNum(base) && bull < base) problems.push(`bull multiple ${bull} < base ${base} — bull must EXPAND the multiple`)
  if (isNum(bear) && isNum(base) && bear > base) problems.push(`bear multiple ${bear} > base ${base} — bear must COMPRESS the multiple`)
  if (isNum(bull) && isNum(base) && bull === base) problems.push(`bull multiple equals base (${bull}) — a bull that holds the multiple is not a bull case unless a cited reason blocks expansion (§2)`)
  return { ok: problems.length === 0, problems, bullExpands: isNum(bull) && isNum(base) && bull > base }
}

// ---- 4. the editable draft the Playground holds, and its recompute ----
export interface DraftScenario { label: string; probability: number | null; forwardMetric: number | null; multiple: number | null; levelOverride: number | null }
export interface PlaygroundDraft {
  basis: Basis
  shares: number | null
  netDebt: number | null
  price: number | null
  rf: number | null; erp: number | null; beta: number | null; wacc: number | null; afterTaxKd: number | null
  isMega: boolean
  scenarios: DraftScenario[]
  methods: MethodLever[]
  driveBaseFromMix: boolean
}

export interface RecomputeResult {
  scenarios: { label: string; probability: number | null; level: number | null; forwardMetric: number | null; multiple: number | null }[]
  math: ScenarioMath
  checks: { wacc?: CheckResult; symmetry?: CheckResult }
  blend: BlendResult
  // Is the mix ACTUALLY driving the base scenario? Only when the toggle is on AND the blend produced a numeric
  // base point. With all-zero (or all-dropped) weights blend() returns no base point, so the base level stays
  // published — the UI must gate its "returns use the blend" claim on THIS, not on the toggle alone, or the
  // shown rationale contradicts the actual calculation (Codex #327 P2 r3636960240).
  blendActive: boolean
  warnings: string[]
}

export function levelForScenario(s: DraftScenario, d: PlaygroundDraft): number | null {
  if (isNum(s.levelOverride)) return s.levelOverride
  if (isNum(s.forwardMetric) && isNum(s.multiple)) {
    try { return round(levelFromMultiple(s.forwardMetric, s.multiple, d.basis, d.shares, d.netDebt), 4) } catch { return null }
  }
  return null
}

export function recompute(d: PlaygroundDraft): RecomputeResult {
  const blendRes = blend(d.methods || [])
  // When "drive base from mix" is on, the blended base point BECOMES the base scenario's level, so a moved
  // weight flows live into the base return, the margin of safety, and the probability-weighted expected
  // return. Off by default: the published base level is the frozen judgment (which may sit below the raw
  // blend by a disclosed discount, e.g. EMAAR AED 15.00 vs 16.52), and it must not be silently averaged
  // away (§16) — the analyst opts in to overwrite it.
  const driveBase = d.driveBaseFromMix && isNum(blendRes.basePoint)
  const scenarios = d.scenarios.map((s) => {
    const isBase = (s.label || '').toLowerCase().includes('base')
    const level = driveBase && isBase ? (blendRes.basePoint as number) : levelForScenario(s, d)
    return { label: s.label, probability: s.probability, level, forwardMetric: s.forwardMetric, multiple: s.multiple }
  })
  const math = scenarioMath(scenarios.map((s) => ({ label: s.label, probability: s.probability, price_target: s.level })), d.price)
  const ke = capmCostOfEquity(d.rf, d.beta, d.erp)
  const checks: { wacc?: CheckResult; symmetry?: CheckResult } = {}
  if (isNum(d.wacc) || isNum(ke) || isNum(d.afterTaxKd)) checks.wacc = checkWacc(d.afterTaxKd, d.wacc, ke, d.rf, d.erp, d.isMega)
  const mult = (name: string) => d.scenarios.find((s) => (s.label || '').toLowerCase().includes(name))?.multiple
  if (isNum(mult('bull')) || isNum(mult('base')) || isNum(mult('bear'))) checks.symmetry = checkMultipleSymmetry(mult('bull'), mult('base'), mult('bear'))
  const warnings = [...math.warnings, ...(checks.wacc?.problems ?? []), ...(checks.symmetry?.problems ?? [])]
  return { scenarios, math, checks, blend: blendRes, blendActive: driveBase, warnings }
}

// Build the initial editable draft from the server response: prefer the valuation_summary.json levers
// (metric × multiple editable); fall back to the frozen decision_record scenarios (only the LEVELS +
// price editable) so the Playground still works on runs that predate the valuation_summary emission.
export function draftFromResponse(res: ValuationLeversResponse): PlaygroundDraft {
  if (!res) {
    return { basis: 'equity', shares: null, netDebt: 0, price: null,
      rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false, scenarios: [], methods: [], driveBaseFromMix: false }
  }
  const L = res.levers
  // Prefer the decision-record entry_price: when the master synthesizer re-anchors a stale module quote,
  // decision.entry_price is the fresh decision-time anchor the frozen System Judgment uses, while
  // valuation_summary.current_price can still be the older module value. Preferring the sidecar would make
  // the untouched Playground recompute returns that disagree with the frozen judgment — the exact stale
  // anchor this feature exists to prevent.
  const price = (res.decision?.entry_price ?? L?.current_price ?? null)
  const evBasis = L?.basis === 'ev'
  if (L && Array.isArray(L.scenarios) && L.scenarios.length) {
    return {
      basis: evBasis ? 'ev' : 'equity',
      shares: L.shares ?? null,
      // For an EV basis, an absent net debt is NOT zero — keep it null so EV levels read Not assessable
      // until net debt is supplied (§15). For an equity basis net debt is unused, so 0 is harmless.
      netDebt: isNum(L.net_debt) ? L.net_debt : (evBasis ? null : 0),
      price,
      rf: L.discount_rate?.rf ?? null, erp: L.discount_rate?.erp ?? null, beta: L.discount_rate?.beta ?? null,
      wacc: L.discount_rate?.wacc ?? null, afterTaxKd: L.discount_rate?.after_tax_kd ?? null,
      isMega: !!L.is_developed_mega_cap,
      methods: buildMethods(L.methods, L.method_weights),
      driveBaseFromMix: false,
      scenarios: L.scenarios.map((s, i) => ({
        label: s.label,
        probability: probabilityFor(s.label, s.probability, res.decision?.scenarios, i),
        forwardMetric: s.forward_metric ?? null,
        multiple: s.multiple ?? null,
        levelOverride: (isNum(s.forward_metric) && isNum(s.multiple)) ? null : (s.level ?? null),
      })),
    }
  }
  // fallback: frozen decision scenarios (levels only)
  const ds = res.decision?.scenarios ?? []
  return {
    basis: 'equity', shares: null, netDebt: 0, price,
    rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
    methods: [], driveBaseFromMix: false,
    scenarios: ds.map((s) => ({ label: s.label || '', probability: s.probability ?? null, forwardMetric: null, multiple: null, levelOverride: s.price_target ?? null })),
  }
}

const METHOD_ORDER = ['own_history', 'peers', 'dcf', 'sotp']
// Build the ordered, editable method-mix levers from the sidecar's football field. Canonical methods first
// (own_history, peers, dcf, sotp), then any others; a key present in EITHER map is included, so a method with
// a weight but no value (or the reverse) still shows as an editable row instead of vanishing.
export function buildMethods(methods?: Record<string, number | null>, weights?: Record<string, number | null>): MethodLever[] {
  const keys = [...new Set([...Object.keys(methods ?? {}), ...Object.keys(weights ?? {})])]
  keys.sort((a, b) => {
    const ia = METHOD_ORDER.indexOf(a), ib = METHOD_ORDER.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b)
  })
  return keys.map((k) => ({
    key: k,
    value: isNum(methods?.[k]) ? (methods![k] as number) : null,
    weight: isNum(weights?.[k]) ? (weights![k] as number) : null,
  }))
}

// probability comes from the master synthesizer (decision_record), not the module — pull it by matching label.
function probabilityFor(label: string, own: number | null | undefined, decScen: DecisionScenario[] | undefined, idx: number): number | null {
  if (isNum(own)) return own
  const match = decScen?.find((s) => (s.label || '').toLowerCase().includes((label || '').toLowerCase()))
  if (match && isNum(match.probability)) return match.probability
  const byIdx = decScen?.[idx]
  return byIdx && isNum(byIdx.probability) ? byIdx.probability : null
}
