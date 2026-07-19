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

// ---- 1. fair-value LEVEL from a (forward metric × multiple) lever ----
export function levelFromMultiple(metric: number, multiple: number, basis: Basis, shares?: number | null, netDebt = 0): number {
  if (basis === 'ev') {
    if (!(isNum(shares) && shares > 0)) throw new Error("basis 'ev' needs positive shares")
    const ev = metric * multiple
    return (ev - (isNum(netDebt) ? netDebt : 0)) / shares
  }
  return metric * multiple // equity: EPS × P/E
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
  const clean = scenarios.filter((s) => isNum(s.probability) && isNum(s.price_target)) as { label: string; probability: number; price_target: number }[]
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
  if (isNum(wacc) && isNum(ke) && wacc >= ke) problems.push(`WACC ${round(wacc, 4)} ≥ cost of equity ${round(ke, 4)} — a WACC cannot exceed k_e for a firm with debt (assembly error)`)
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
  netDebt: number
  price: number | null
  rf: number | null; erp: number | null; beta: number | null; wacc: number | null; afterTaxKd: number | null
  isMega: boolean
  scenarios: DraftScenario[]
}

export interface RecomputeResult {
  scenarios: { label: string; probability: number | null; level: number | null; forwardMetric: number | null; multiple: number | null }[]
  math: ScenarioMath
  checks: { wacc?: CheckResult; symmetry?: CheckResult }
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
  const scenarios = d.scenarios.map((s) => ({ label: s.label, probability: s.probability, level: levelForScenario(s, d), forwardMetric: s.forwardMetric, multiple: s.multiple }))
  const math = scenarioMath(scenarios.map((s) => ({ label: s.label, probability: s.probability, price_target: s.level })), d.price)
  const ke = capmCostOfEquity(d.rf, d.beta, d.erp)
  const checks: { wacc?: CheckResult; symmetry?: CheckResult } = {}
  if (isNum(d.wacc) || isNum(ke) || isNum(d.afterTaxKd)) checks.wacc = checkWacc(d.afterTaxKd, d.wacc, ke, d.rf, d.erp, d.isMega)
  const mult = (name: string) => d.scenarios.find((s) => (s.label || '').toLowerCase().includes(name))?.multiple
  if (isNum(mult('bull')) || isNum(mult('base')) || isNum(mult('bear'))) checks.symmetry = checkMultipleSymmetry(mult('bull'), mult('base'), mult('bear'))
  const warnings = [...math.warnings, ...(checks.wacc?.problems ?? []), ...(checks.symmetry?.problems ?? [])]
  return { scenarios, math, checks, warnings }
}

// Build the initial editable draft from the server response: prefer the valuation_summary.json levers
// (metric × multiple editable); fall back to the frozen decision_record scenarios (only the LEVELS +
// price editable) so the Playground still works on runs that predate the valuation_summary emission.
export function draftFromResponse(res: ValuationLeversResponse): PlaygroundDraft {
  const L = res.levers
  const price = (L?.current_price ?? res.decision?.entry_price ?? null)
  if (L && Array.isArray(L.scenarios) && L.scenarios.length) {
    return {
      basis: L.basis === 'ev' ? 'ev' : 'equity',
      shares: L.shares ?? null,
      netDebt: isNum(L.net_debt) ? L.net_debt : 0,
      price,
      rf: L.discount_rate?.rf ?? null, erp: L.discount_rate?.erp ?? null, beta: L.discount_rate?.beta ?? null,
      wacc: L.discount_rate?.wacc ?? null, afterTaxKd: L.discount_rate?.after_tax_kd ?? null,
      isMega: !!L.is_developed_mega_cap,
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
    scenarios: ds.map((s) => ({ label: s.label || '', probability: s.probability ?? null, forwardMetric: null, multiple: null, levelOverride: s.price_target ?? null })),
  }
}

// probability comes from the master synthesizer (decision_record), not the module — pull it by matching label.
function probabilityFor(label: string, own: number | null | undefined, decScen: DecisionScenario[] | undefined, idx: number): number | null {
  if (isNum(own)) return own
  const match = decScen?.find((s) => (s.label || '').toLowerCase().includes((label || '').toLowerCase()))
  if (match && isNum(match.probability)) return match.probability
  const byIdx = decScen?.[idx]
  return byIdx && isNum(byIdx.probability) ? byIdx.probability : null
}
