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

// v1.2: a scenario's OWN recorded derivation chain — the figures the orb actually used to compute the
// level (REPRODUCE-or-omit, guarded server-side). stated_drivers are the narrative assumptions BEHIND a
// recorded figure whose mapping the orb did not record — display-only provenance, never a lever.
export interface StatedDriver { label: string; value?: number | string | null; note?: string | null }
export interface ScenarioDerivation {
  model: string
  ev?: number | null
  net_debt?: number | null
  net_debt_basis?: string | null
  minority?: number | null
  other?: number | null
  shares?: number | null
  stated_drivers?: StatedDriver[] | null
  source?: string | null
  // margin_runoff_dcf: levers (margin, growth, da, capex, tax, dnwc) + recorded constants
  margin?: number | null
  growth?: number | null
  da?: number | null
  capex?: number | null
  tax?: number | null
  dnwc?: number | null
  revenue_base?: number | null
  wacc?: number | null
  pv_factor?: number | null
  pv_explicit?: number | null
  metric_label?: string | null
}

export interface SummaryScenario {
  label: string
  probability?: number | null
  forward_metric?: number | null
  metric_basis?: string | null
  multiple?: number | null
  level?: number | null
  drivers?: string | null
  derivation?: ScenarioDerivation | null
  // ---- v1.3: the case's OWN basis, named multiple, and EV→equity terms ----
  /** overrides the run-level basis for THIS case: EMAAR's base reads on EV/EBITDA while its bear reads
   *  0.96x on BOOK. Bridging an equity multiple turns 9.75 into −2.82, so the case's basis governs. */
  basis?: Basis | null
  /** what the multiple IS — 'EV/FY2025 Adj. EBITDA', 'NTM P/E', 'P/BV (book)' */
  multiple_basis?: string | null
  /** 'implied' (the value came from this case's machinery and the multiple is what it corresponds to)
   *  vs 'applied' (the case was genuinely built AS metric × multiple) */
  multiple_kind?: 'implied' | 'applied' | null
  /** further yardsticks the orb quoted for the SAME value — cross-checks, never computed with */
  secondary_multiples?: { value: number; basis: string; note?: string | null }[] | null
  /** the EV→equity terms THIS case used, when they differ from the run level */
  bridge?: CaseBridge | null
  /** the §5 citation the metric and multiple came from */
  source?: string | null
}

/** v1.3 per-case EV→equity terms. net_debt is REQUIRED and explicit (0 when debt-free) — an unknown net
 *  debt is never silently 0 (§15). shares falls back to the top-level count. */
export interface CaseBridge {
  net_debt: number
  net_debt_basis?: string | null
  minority?: number | null
  other?: number | null
  shares?: number | null
  /** the §5 citation for THIS bridge's figures, when they come from a different document/module than the
   *  scenario-level `source` (which cites only the forward metric and multiple). Falls back to the
   *  scenario-level source when omitted and the terms come from the same place. */
  source?: string | null
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
  // ---- v1.1 method internals (P-C sub-levers) — each orb's OWN recorded table, verbatim ----
  dcf_grid?: DcfGrid | null
  sotp_segments?: SotpSegment[] | null
  sotp_bridge?: SotpBridge | null
  peers_internals?: PeersInternals | null
}

// The DCF orb's recorded WACC × terminal-growth sensitivity grid (04 §7): axes as ascending decimals
// (0.075 = 7.5%), values[growthIdx][waccIdx] per-share cells. The Playground derives the DCF method value
// from typed WACC/growth by reading THIS grid — never by re-running a DCF.
export interface DcfGrid { wacc: number[]; growth: number[]; values: number[][]; base?: { wacc: number; growth: number } | null; source?: string | null }
export interface SotpSegment { segment: string; metric_name?: string | null; metric: number; multiple: number; comp?: string | null; source?: string | null }
export interface SotpBridge { net_debt?: number | null; minority?: number | null; other?: number | null; source?: string | null }
export interface PeersInternals { metric_name?: string | null; median_multiple?: number | null; applied_multiple?: number | null; discount_pct?: number | null; anchors: { multiple: number; value: number; label?: string | null }[]; source?: string | null }

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

// ---- 1b. v1.1 method internals (P-C sub-levers) — pure reads of each orb's OWN recorded table ----
// One axis position for the grid read: the bracketing segment + the interpolation fraction. t may leave
// [0,1] beyond the axis ends (linear extrapolation off the edge segment) — the caller flags that.
function axisPos(axis: number[], x: number): { i0: number; i1: number; t: number; on: boolean; out: boolean } {
  const n = axis.length
  let i0 = 0
  for (let i = 0; i < n - 1; i++) if (x >= axis[i]) i0 = i
  const i1 = Math.min(i0 + 1, n - 1)
  const t = i1 === i0 ? 0 : (x - axis[i0]) / (axis[i1] - axis[i0])
  const eps = 1e-9
  return { i0, i1, t, on: axis.some((a) => Math.abs(a - x) < eps), out: x < axis[0] - eps || x > axis[n - 1] + eps }
}

export interface GridReadout { value: number | null; interpolated: boolean; outOfGrid: boolean }
/** The DCF method value at (wacc, growth), read from the orb's recorded grid — bilinear between recorded
 *  cells, linear extrapolation beyond the edges (flagged outOfGrid). Inputs are DECIMALS (0.085 = 8.5%).
 *  This is a lookup of already-computed research, never a new DCF. */
export function dcfFromGrid(grid: DcfGrid | null | undefined, wacc: number | null, growth: number | null): GridReadout {
  const bad = { value: null, interpolated: false, outOfGrid: false }
  if (!grid || !isNum(wacc) || !isNum(growth)) return bad
  const { wacc: W, growth: G, values: V } = grid
  if (!Array.isArray(W) || W.length < 2 || !Array.isArray(G) || G.length < 2 || !Array.isArray(V) || V.length !== G.length) return bad
  if (!V.every((r) => Array.isArray(r) && r.length === W.length && r.every(isNum))) return bad
  const w = axisPos(W, wacc)
  const g = axisPos(G, growth)
  const row = (gi: number) => V[gi][w.i0] + (V[gi][w.i1] - V[gi][w.i0]) * w.t
  const val = row(g.i0) + (row(g.i1) - row(g.i0)) * g.t
  if (!isNum(val)) return bad
  return { value: round(val, 4), interpolated: !(w.on && g.on), outOfGrid: w.out || g.out }
}

/** The SOTP method value from the orb's recorded segments + EV→equity bridge:
 *  per-share = (Σ metric×multiple − net_debt − minority + other) / shares. Null when any lever is unusable. */
export function sotpFromSegments(
  segments: { metric: number | null; multiple: number | null }[] | null | undefined,
  bridge: SotpBridge | null | undefined,
  shares: number | null | undefined,
): number | null {
  if (!Array.isArray(segments) || !segments.length || !isNum(shares) || shares <= 0) return null
  let ev = 0
  for (const s of segments) {
    if (!isNum(s.metric) || !isNum(s.multiple)) return null
    ev += s.metric * s.multiple
  }
  const nd = isNum(bridge?.net_debt) ? (bridge!.net_debt as number) : 0
  const mi = isNum(bridge?.minority) ? (bridge!.minority as number) : 0
  const ot = isNum(bridge?.other) ? (bridge!.other as number) : 0
  return round((ev - nd - mi + ot) / shares, 4)
}

export interface PeersReadout { value: number | null; outOfAnchors: boolean; discountPct: number | null }
// every valid recorded anchor row, sorted by multiple — the piecewise line honors ALL of them, not just
// the first two (Codex #336 r3644141587: a third recorded row must reproduce exactly when selected)
export function sortedAnchors(pi: PeersInternals | null | undefined): { multiple: number; value: number }[] {
  const rows = (pi?.anchors ?? []).filter((a) => a && isNum(a.multiple) && isNum(a.value)).map((a) => ({ multiple: a.multiple, value: a.value }))
  rows.sort((x, y) => x.multiple - y.multiple)
  for (let i = 0; i < rows.length - 1; i++) if (Math.abs(rows[i + 1].multiple - rows[i].multiple) < 1e-9) return []
  return rows.length >= 2 ? rows : []
}
/** The peers method value at a typed multiple — the PIECEWISE line through every one of the orb's OWN
 *  recorded anchor rows (implied-value table), so each recorded row reproduces exactly. discountPct is the
 *  derived % below the recorded peer median (informational). Outside the anchor span → flagged (the orb
 *  published no row that far out; edge-segment extrapolation). */
export function peersFromMultiple(pi: PeersInternals | null | undefined, multiple: number | null): PeersReadout {
  const bad = { value: null, outOfAnchors: false, discountPct: null }
  if (!pi || !isNum(multiple)) return bad
  const rows = sortedAnchors(pi)
  if (!rows.length) return bad
  let i0 = 0
  for (let i = 0; i < rows.length - 1; i++) if (multiple >= rows[i].multiple) i0 = i
  const a0 = rows[i0], a1 = rows[i0 + 1]
  const slope = (a1.value - a0.value) / (a1.multiple - a0.multiple)
  const value = round(a0.value + slope * (multiple - a0.multiple), 4)
  const lo = rows[0].multiple, hi = rows[rows.length - 1].multiple
  const discountPct = isNum(pi.median_multiple) && pi.median_multiple !== 0 ? round((1 - multiple / (pi.median_multiple as number)) * 100, 1) : null
  return { value, outOfAnchors: multiple < lo - 1e-9 || multiple > hi + 1e-9, discountPct }
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

/** v1.3: the level a CASE's own levers derive — the browser mirror of the guard's `_case_level`.
 *
 *  The case's own basis governs (an equity multiple is never bridged), and its own bridge — when it
 *  records one — supplies the EV→equity terms instead of the run-level net debt. NHY is the live case:
 *  the run declares net_debt 13,090 on a broad basis while every scenario deducts the cash-quality-
 *  adjusted 17,919 AND minority 7,495, on an 'ev' basis the run does not declare. Reading the run-level
 *  numbers there does not merely round differently — it prices the bear at a different company.
 *
 *  Returns null (never a guess) when the terms are not derivable: no positive shares, no explicit net
 *  debt. Mirrors levelFromMultiple's contract, but reports rather than throws. */
export function caseLevelFromMultiple(
  metric: number, multiple: number, basis: Basis,
  bridge: CaseBridge | null | undefined, shares?: number | null, netDebt: number | null = 0,
): number | null {
  // A bridge is meaningful only on an EV case — an equity multiple already gives equity value.
  const br = basis === 'ev' && bridge ? bridge : null
  if (br) {
    if (!isNum(br.net_debt)) return null // §15: unknown net debt is never silently 0
    const sh = isNum(br.shares) ? br.shares : (isNum(shares) ? shares : null)
    if (!isNum(sh) || sh <= 0) return null
    const equity = metric * multiple - br.net_debt
      - (isNum(br.minority) ? br.minority : 0)
      + (isNum(br.other) ? br.other : 0)
    return round(equity / sh, 4)
  }
  try { return round(levelFromMultiple(metric, multiple, basis, shares, netDebt), 4) } catch { return null }
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
  // The WORST bear, not the first one listed — a run may derive two down-legs (e.g. bear_cyclical and
  // bear_structural), and the eval harness's own risk/reward denominator uses the worst (lowest) target
  // across every case, not array order. Picking the first bear-labelled row would silently disagree with
  // the frozen thesis whenever the second bear is lower (Codex #365 P1, synthesizer.md:591). With a single
  // bear case this is identical to picking the first. Direction-signed (short-side) selection is PR #366's
  // job — this stays long-side, matching the rest of this function.
  const bears = clean.filter((s) => (s.label || '').toLowerCase().includes('bear'))
  const bear = bears.length ? bears.reduce((w, s) => (s.price_target < w.price_target ? s : w)) : undefined
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
// v2 Phase-1 additions (all optional — older callers/tests construct the literal without them):
//   frozenLevel — the run's published level, immutable; the re-lock target and the wedge comparand.
//   drivers     — the sidecar's own stated derivation/provenance text for the scenario, shown in traces.
//   overrideUnlocked — the user EXPLICITLY unlocked this outcome cell to type over it (an override the
//                      save ledger captures with a reason). Locked is the default: outcomes are computed
//                      or judgment cells, never silently typable (the Excel contract).
export interface DraftScenario {
  label: string; probability: number | null; forwardMetric: number | null; multiple: number | null; levelOverride: number | null
  frozenLevel?: number | null; drivers?: string | null; overrideUnlocked?: boolean
  // v1.2: the editable copy of the recorded derivation chain — when present, the LEVEL is computed from
  // these figures (the Excel contract: the chain's inputs are typed, the fair value never is).
  chain?: DraftChain | null
  // v1.3: the case's OWN basis and EV→equity terms drive its level (see caseLevelFromMultiple), plus the
  // recorded labels the panel shows. Absent → the run-level basis and net debt, exactly as before.
  basis?: Basis | null
  bridge?: CaseBridge | null
  metricBasis?: string | null
  multipleBasis?: string | null
  multipleKind?: 'implied' | 'applied' | null
  secondaryMultiples?: { value: number; basis: string; note?: string | null }[]
  source?: string | null
  // v1.3: the user has EXPLICITLY typed into this case's forward-metric or multiple field. A scenario
  // can carry BOTH a v1.2 derivation chain (`chain`) and v1.3 metric×multiple tuple at once (the schema's
  // own emission instructions keep the chain, classifying its implied multiple as `multiple_kind:
  // 'implied'`) — editing the multiple is that schema's own "explicit reverse assertion", so it must
  // DETACH the chain rather than being silently ignored underneath it (Codex #362 P1).
  multipleEdited?: boolean
}

export interface DraftChain {
  model: 'ev_bridge' | 'margin_runoff_dcf'
  ev: number | null; netDebt: number | null; minority: number | null; other: number | null; shares: number | null
  netDebtBasis: string | null
  statedDrivers: StatedDriver[]
  source: string | null
  // margin_runoff_dcf levers (decimals) + recorded constants. evOverride: typing EV directly DETACHES the
  // runoff model (the typed EV wins, mirroring how a typed method Value detaches its ▸ sub-levers);
  // editing a runoff lever clears it (re-attach).
  margin?: number | null
  growth?: number | null
  da?: number | null
  capex?: number | null
  tax?: number | null
  dnwc?: number | null
  revenueBase?: number | null
  wacc?: number | null
  pvFactor?: number | null
  pvExplicit?: number | null
  metricLabel?: string | null
  evOverride?: number | null
}

/** The replayed runoff EV: revenue_base × margin → − D&A → × (1 − tax) → + D&A − capex − ΔNWC
 *  → TV = FCFF × (1+g) / (wacc − g) → EV = pv_explicit + TV × pv_factor. Every constant is the orb's own
 *  recorded number — this REPLAYS the written chain, it never re-runs a DCF. Null when not computable. */
export function runoffEv(c: DraftChain): number | null {
  if (!isNum(c.margin) || !isNum(c.revenueBase) || !isNum(c.wacc) || !isNum(c.pvFactor) || !isNum(c.pvExplicit)) return null
  const g = isNum(c.growth) ? c.growth : 0
  if (c.wacc - g <= 0) return null // undefined perpetuity — refuse, never a guess
  const da = isNum(c.da) ? c.da : 0
  const capex = isNum(c.capex) ? c.capex : 0
  const tax = isNum(c.tax) ? c.tax : 0
  const dnwc = isNum(c.dnwc) ? c.dnwc : 0
  const fcff = (c.revenueBase * c.margin - da) * (1 - tax) + da - capex - dnwc
  return round(c.pvExplicit + (fcff * (1 + g) / (c.wacc - g)) * c.pvFactor, 4)
}

/** The chain's effective EV: a typed override wins (detached); a runoff model replays; ev_bridge reads ev. */
export function chainEv(chain: DraftChain | null | undefined): number | null {
  if (!chain) return null
  if (isNum(chain.evOverride)) return chain.evOverride
  if (chain.model === 'margin_runoff_dcf') return runoffEv(chain)
  return isNum(chain.ev) ? chain.ev : null
}

/** The per-share level from an editable chain: (effective EV − net debt − minority + other) / shares.
 *  Falls back to the top-level share count when the chain records none. Net debt must be an explicit
 *  number — an unknown net debt is never silently 0 (§15; Codex #339 P1 r3644687625): a cleared field
 *  blanks the level instead of valuing the firm as debt-free. Null when not computable. */
export function chainLevel(chain: DraftChain | null | undefined, fallbackShares: number | null | undefined): number | null {
  const ev = chainEv(chain)
  if (!isNum(ev) || !chain || !isNum(chain.netDebt)) return null
  const sh = isNum(chain.shares) ? chain.shares : (isNum(fallbackShares) ? fallbackShares : null)
  if (!isNum(sh) || sh <= 0) return null
  const equity = ev - chain.netDebt - (isNum(chain.minority) ? chain.minority : 0) + (isNum(chain.other) ? chain.other : 0)
  return round(equity / sh, 4)
}

// The sidecar derivation → the editable draft chain. Unknown models return null (treated as not
// recorded — the cell stays a judgment cell rather than pretending).
export function buildChain(deriv: ScenarioDerivation | null | undefined): DraftChain | null {
  // net_debt must be recorded explicitly (0 when debt-free) — a chain without it is not usable (§15)
  if (!deriv || !isNum(deriv.ev) || !isNum(deriv.net_debt)) return null
  const base = {
    ev: deriv.ev, netDebt: deriv.net_debt, minority: deriv.minority ?? null,
    other: deriv.other ?? null, shares: deriv.shares ?? null,
    netDebtBasis: deriv.net_debt_basis ?? null,
    statedDrivers: Array.isArray(deriv.stated_drivers) ? deriv.stated_drivers.filter((x) => x && typeof x.label === 'string') : [],
    source: deriv.source ?? null,
  }
  if (deriv.model === 'ev_bridge') return { model: 'ev_bridge', ...base }
  if (deriv.model === 'margin_runoff_dcf') {
    if (!isNum(deriv.margin) || !isNum(deriv.revenue_base) || !isNum(deriv.wacc) || !isNum(deriv.pv_factor) || !isNum(deriv.pv_explicit)) return null
    return {
      model: 'margin_runoff_dcf', ...base,
      margin: deriv.margin, growth: deriv.growth ?? null, da: deriv.da ?? null, capex: deriv.capex ?? null,
      tax: deriv.tax ?? null, dnwc: deriv.dnwc ?? null, revenueBase: deriv.revenue_base,
      wacc: deriv.wacc, pvFactor: deriv.pv_factor, pvExplicit: deriv.pv_explicit,
      metricLabel: deriv.metric_label ?? null, evOverride: null,
    }
  }
  return null
}
// v1.1 per-method sub-lever state. `active` = the typed sub-levers are DRIVING that method's value (turns
// on when a sub-field is edited; typing the method Value cell directly detaches — mirrors how a typed
// metric×multiple outranks a supplied level). The recorded data (grid/segments/anchors) is immutable here;
// only the typed positions move.
export interface DraftInternals {
  dcf?: { grid: DcfGrid; wacc: number | null; growth: number | null; active: boolean } | null
  sotp?: { segments: { segment: string; metric: number | null; multiple: number | null; comp?: string | null; metric_name?: string | null }[]; bridge: SotpBridge | null; active: boolean } | null
  peers?: { pi: PeersInternals; multiple: number | null; active: boolean } | null
}

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
  internals?: DraftInternals
  // v2 Phase-1: the PUBLISHED mix, snapshotted at draft build and never edited — the frozen base is
  // classified (formula vs wedge) against THIS blend, not the live one, so the disclosed wedge (e.g.
  // EMAAR 15.00 = 16.52 − 1.52, RF-OWN-004) does not drift as the user moves the live mix.
  published?: { methods: MethodLever[]; blend: BlendResult } | null
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
  // v1.1: the per-method sub-lever readouts (present only for ACTIVE internals) — the derived method value
  // plus its honesty flags, so the UI can render interpolated/out-of-grid states without recomputing.
  methodInternals: { dcf?: GridReadout; sotp?: { value: number | null }; peers?: PeersReadout }
  warnings: string[]
}

export function levelForScenario(s: DraftScenario, d: PlaygroundDraft): number | null {
  // Precedence: an EXPLICIT unlock-override wins; then — UNLESS the user has explicitly typed into the
  // multiple/metric fields (multipleEdited) — the recorded chain (v1.2, it reproduces the frozen level
  // and makes its figures the levers); then the frozen/typed level; then metric×multiple. A chain-less
  // scenario behaves exactly as before (levelOverride first), so older drafts and runs are unchanged.
  //
  // A v1.3 scenario can carry BOTH a chain and a metric×multiple tuple (the emission instructions keep
  // the chain and record the tuple's multiple as `multiple_kind: 'implied'` — its own definition of "the
  // value came from this case's machinery, stated as a cross-check"). Returning the chain value
  // unconditionally made editing the multiple/metric a silent no-op: the analyst types a number, the
  // Worth cell and every return downstream do not move (Codex #362 P1). Typing over the multiple/metric
  // is the schema's own "explicit reverse assertion" — it must detach the chain, not be ignored beneath it.
  if (s.overrideUnlocked && isNum(s.levelOverride)) return s.levelOverride
  if (!s.multipleEdited) {
    const c = chainLevel(s.chain, d.shares)
    if (c !== null) return c
  }
  if (isNum(s.levelOverride)) return s.levelOverride
  if (isNum(s.forwardMetric) && isNum(s.multiple)) {
    // v1.3: the CASE's own basis and bridge govern (Codex #362 P1 r3672...). Falling back to the run-level
    // basis/net-debt here would price NHY's cases off the run's broad 13,090 with no minority deducted —
    // a bear of ~49.9 against the committed 45.12, and an equity-basis case bridged into nonsense.
    return caseLevelFromMultiple(s.forwardMetric, s.multiple, s.basis ?? d.basis, s.bridge, d.shares, d.netDebt)
  }
  return null
}

// v1.1: ACTIVE sub-levers derive their method's value from the orb's recorded data BEFORE the blend —
// grid read for DCF, segment re-sum for SOTP, anchor line for peers. Inactive/absent internals leave the
// typed method value untouched, so runs without recorded internals behave exactly as before. Extracted
// from recompute so goal seek can evaluate the same derivation at a probed lever position.
export function deriveMethods(d: PlaygroundDraft): { methods: MethodLever[]; methodInternals: RecomputeResult['methodInternals'] } {
  const methodInternals: RecomputeResult['methodInternals'] = {}
  const methods = (d.methods || []).map((m) => {
    const int = d.internals
    // An ACTIVE sub-lever OWNS its method's value — including when the typed position derives nothing
    // (a cleared/incomplete field): the value becomes null and the blend renormalizes without it, instead
    // of silently reusing the stale typed value while the panel says "edit to derive" (Codex #336
    // r3644141583). Detaching (typing the Value cell) restores the typed value.
    if (m.key === 'dcf' && int?.dcf?.active) {
      const r = dcfFromGrid(int.dcf.grid, int.dcf.wacc, int.dcf.growth)
      methodInternals.dcf = r
      return { ...m, value: isNum(r.value) ? r.value : null }
    }
    if (m.key === 'sotp' && int?.sotp?.active) {
      const v = sotpFromSegments(int.sotp.segments, int.sotp.bridge, d.shares)
      methodInternals.sotp = { value: v }
      return { ...m, value: isNum(v) ? v : null }
    }
    if (m.key === 'peers' && int?.peers?.active) {
      const r = peersFromMultiple(int.peers.pi, int.peers.multiple)
      methodInternals.peers = r
      return { ...m, value: isNum(r.value) ? r.value : null }
    }
    return m
  })
  return { methods, methodInternals }
}

export function recompute(d: PlaygroundDraft): RecomputeResult {
  const { methods, methodInternals } = deriveMethods(d)
  const blendRes = blend(methods)
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
  // The symmetry check ("bull expands, bear compresses") only means anything when bull/base/bear are
  // priced on the SAME yardstick. A mixed-method set — an equity P/E bear beside an EV/EBITDA base — makes
  // the raw multiples incomparable: a 7x P/E bear next to a 6x EV/EBITDA base is not "the bear failed to
  // compress", it is two different multiples (Codex #362 P2). Gate on multipleBasis (the named yardstick)
  // when recorded, falling back to the case's own basis (equity/ev) — only run the check when every
  // scenario that HAS a multiple shares the same key.
  const comparableKey = (name: string): string | null => {
    const s = d.scenarios.find((sc) => (sc.label || '').toLowerCase().includes(name))
    if (!s || !isNum(s.multiple)) return null
    return typeof s.multipleBasis === 'string' && s.multipleBasis.trim() ? s.multipleBasis.trim().toLowerCase() : (s.basis ?? d.basis)
  }
  const keys = (['bull', 'base', 'bear'] as const).map(comparableKey).filter((k): k is string => k !== null)
  const comparableBases = new Set(keys).size <= 1
  if (comparableBases && (isNum(mult('bull')) || isNum(mult('base')) || isNum(mult('bear')))) {
    checks.symmetry = checkMultipleSymmetry(mult('bull'), mult('base'), mult('bear'))
  }
  const warnings = [...math.warnings, ...(checks.wacc?.problems ?? []), ...(checks.symmetry?.problems ?? [])]
  if (methodInternals.dcf?.outOfGrid) warnings.push("DCF WACC/growth is outside the orb's recorded grid — extrapolated, not validated")
  if (methodInternals.peers?.outOfAnchors) warnings.push("peers multiple is outside the orb's recorded implied-value rows — extrapolated, not validated")
  return { scenarios, math, checks, blend: blendRes, blendActive: driveBase, methodInternals, warnings }
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
    const pubMethods = buildMethods(L.methods, L.method_weights)
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
      methods: pubMethods,
      driveBaseFromMix: false,
      internals: buildInternals(L),
      published: { methods: pubMethods, blend: blend(pubMethods) },
      scenarios: L.scenarios.map((s, i) => ({
        label: s.label,
        probability: probabilityFor(s.label, s.probability, res.decision?.scenarios, i),
        forwardMetric: s.forward_metric ?? null,
        multiple: s.multiple ?? null,
        levelOverride: (isNum(s.forward_metric) && isNum(s.multiple)) ? null : (s.level ?? null),
        frozenLevel: s.level ?? null,
        drivers: s.drivers ?? null,
        overrideUnlocked: false,
        chain: buildChain(s.derivation),
        // v1.3 — carried verbatim: the case's basis and bridge DRIVE its level, the labels are displayed.
        // A bridge is carried EVEN when malformed. Dropping it would fall back to the run-level terms and
        // quietly re-price the case on a different convention (NHY's bull would read 114.02 against the
        // committed 107.70); caseLevelFromMultiple returns null instead, so the cell reads Not assessable.
        basis: s.basis === 'ev' || s.basis === 'equity' ? s.basis : null,
        bridge: s.bridge && typeof s.bridge === 'object' ? s.bridge : null,
        metricBasis: s.metric_basis ?? null,
        multipleBasis: s.multiple_basis ?? null,
        multipleKind: s.multiple_kind === 'implied' || s.multiple_kind === 'applied' ? s.multiple_kind : null,
        // The server returns the parsed sidecar WITHOUT applying the JSON Schema, so an unvalidated or
        // partially-generated sidecar can carry a non-array secondary_multiples (e.g. an object) — `?? []`
        // does not catch that (a truthy non-null object passes through), and `.filter()` on it throws when
        // the Playground opens. Guard with Array.isArray and degrade malformed cross-checks to [] (Codex
        // #362 P2).
        secondaryMultiples: (Array.isArray(s.secondary_multiples) ? s.secondary_multiples : [])
          .filter((x) => x && isNum(x.value) && typeof x.basis === 'string'),
        source: s.source ?? null,
      })),
    }
  }
  // fallback: frozen decision scenarios (levels only)
  const ds = res.decision?.scenarios ?? []
  return {
    basis: 'equity', shares: null, netDebt: 0, price,
    rf: null, erp: null, beta: null, wacc: null, afterTaxKd: null, isMega: false,
    methods: [], driveBaseFromMix: false, published: null,
    scenarios: ds.map((s) => ({ label: s.label || '', probability: s.probability ?? null, forwardMetric: null, multiple: null, levelOverride: s.price_target ?? null, frozenLevel: s.price_target ?? null, drivers: null, overrideUnlocked: false })),
  }
}

// v1.1: the initial (inactive) sub-lever state from the sidecar's recorded internals. Positions start at
// each orb's own base (grid base pair / recorded multiples / applied multiple), so opening a panel shows
// the published numbers; nothing derives until the user edits a sub-field (active flips in the component).
export function buildInternals(L: ValuationSummary): DraftInternals | undefined {
  const out: DraftInternals = {}
  const g = L.dcf_grid
  // full dimension validation before exposing the grid — a malformed matrix must degrade to "no ▸ panel",
  // not crash the grid-table renderer on values[gi][wi] (Codex #338 r3644483982; the guard rejects such a
  // sidecar too, but the client must not trust that it ran)
  if (g && Array.isArray(g.wacc) && g.wacc.length >= 2 && g.wacc.every(isNum)
      && Array.isArray(g.growth) && g.growth.length >= 2 && g.growth.every(isNum)
      && Array.isArray(g.values) && g.values.length === g.growth.length
      && g.values.every((r) => Array.isArray(r) && r.length === g.wacc.length && r.every(isNum))) {
    out.dcf = { grid: g, wacc: g.base?.wacc ?? null, growth: g.base?.growth ?? null, active: false }
  }
  if (Array.isArray(L.sotp_segments) && L.sotp_segments.length) {
    out.sotp = {
      segments: L.sotp_segments.map((s) => ({ segment: s.segment, metric: s.metric ?? null, multiple: s.multiple ?? null, comp: s.comp ?? null, metric_name: s.metric_name ?? null })),
      bridge: L.sotp_bridge ?? null,
      active: false,
    }
  }
  const pi = L.peers_internals
  if (pi && Array.isArray(pi.anchors) && pi.anchors.length >= 2) {
    out.peers = { pi, multiple: pi.applied_multiple ?? pi.anchors[0]?.multiple ?? null, active: false }
  }
  return Object.keys(out).length ? out : undefined
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

// ---- 5. v2 Phase-1: cell semantics — outcomes are computed or judgment, never silently typed ----
// The Excel contract, enforced: an ASSUMPTION is typed; a COMPUTED cell is locked and traceable; a
// JUDGMENT cell (a value whose derivation the run did not record) is locked, labeled, and overridable
// only through an explicit unlock that the save ledger captures with a reason.
export type ScenarioCellKind =
  | 'live_blend'       // drive-base is on: the base cell IS the live blend (computed, moves with the mix)
  | 'frozen_formula'   // frozen base ≈ the published blend (within rounding) — a computed cell
  | 'frozen_wedge'     // frozen base = published blend + a disclosed judgment wedge (§16, e.g. EMAAR RF-OWN-004)
  | 'derived_chain'    // v1.2: level computes from the scenario's recorded chain — its figures are the levers
  | 'derived_multiple' // level derives from typed forward metric × multiple — those inputs are the levers
  | 'judgment'         // no recorded derivation for this level (bull/bear before the v1.2 emission)
  | 'overridden'       // explicitly unlocked and typed — an override, recorded with a reason on save

export interface ScenarioCellState { kind: ScenarioCellKind; blend?: number | null; wedge?: number | null; chainValue?: number | null }

// Rounding tolerance vs a real wedge: AMZN's base 210 vs blend 210.05 (0.02%) is rounding; EMAAR's
// 15.00 vs 16.52 (9%) is the disclosed owner-discount judgment. 0.5% relative splits them cleanly.
const WEDGE_REL_EPS = 0.005

export function scenarioCellState(s: DraftScenario, isBase: boolean, publishedBlend: number | null | undefined, liveBlend: number | null, driveBase: boolean, chainValue?: number | null): ScenarioCellState {
  if (s.overrideUnlocked) return { kind: 'overridden' }
  // drive-base FIRST: recompute gives the live blend precedence over everything else for the base row, so
  // the cell must say so too — a chain/multiple base under drive-base would otherwise display a different
  // derivation than the one actually computing (Gemini #339 r3644675825)
  if (isBase && driveBase && isNum(liveBlend)) return { kind: 'live_blend', blend: liveBlend }
  if (isNum(chainValue)) return { kind: 'derived_chain', chainValue }
  if (isNum(s.forwardMetric) && isNum(s.multiple)) return { kind: 'derived_multiple' }
  const frozen = isNum(s.frozenLevel) ? s.frozenLevel : (isNum(s.levelOverride) ? s.levelOverride : null)
  if (isBase && isNum(publishedBlend) && isNum(frozen)) {
    const rel = Math.abs(frozen - publishedBlend) / Math.max(Math.abs(frozen), 1e-9)
    if (rel <= WEDGE_REL_EPS) return { kind: 'frozen_formula', blend: publishedBlend }
    return { kind: 'frozen_wedge', blend: publishedBlend, wedge: round(frozen - publishedBlend, 4) }
  }
  return { kind: 'judgment' }
}

// ---- 6. v2 Phase-1: traces — Excel's "trace precedents" for every computed cell ----
export interface TraceTerm { label: string; calc: string }
export interface Trace { title: string; formula: string; terms: TraceTerm[]; note?: string | null; source?: string | null }

const fmt = (n: number | null | undefined, nd = 2): string => (isNum(n) ? String(round(n, nd)) : '—')

export function traceBlend(methods: MethodLever[], b: BlendResult, labelFor: (k: string) => string = (k) => k): Trace {
  const terms: TraceTerm[] = []
  for (const m of methods) {
    const eff = b.effectiveWeights[m.key]
    // 4dp on the term products so the terms VISIBLY sum to the total — a trace that only almost adds up
    // defeats its purpose (0.15 × 12.5 = 1.875, not 1.88).
    if (isNum(eff) && isNum(m.value)) terms.push({ label: labelFor(m.key), calc: `${fmt(eff, 4)} × ${fmt(m.value)} = ${fmt(eff * (m.value as number), 4)}` })
  }
  const renormed = methods.some((m) => isNum(m.weight) && isNum(b.effectiveWeights[m.key]) && Math.abs((m.weight as number) - b.effectiveWeights[m.key]) > 1e-6)
  return {
    title: 'Blended base point',
    formula: `Σ weight × method value = ${fmt(b.basePoint, 4)}`,
    terms,
    note: renormed ? 'weights renormalize over the methods actually present, so the effective weight can differ from the typed one' : null,
  }
}

export function traceScenarioCell(
  s: DraftScenario, cs: ScenarioCellState, published: PlaygroundDraft['published'],
  labelFor: (k: string) => string = (k) => k,
  // the run-level basis the case falls back to when it declares none of its own (mirrors levelForScenario's
  // `s.basis ?? d.basis`) — an EV-basis case that OMITS its own `basis` still bridges correctly in the
  // actual calculation, but before this fix the trace checked `s.basis === null` directly and silently
  // dropped the bridge from the displayed arithmetic, so the formula shown did not produce the Worth beside
  // it (Codex #365 P2, ui/web/src/lib/valuationLevers.ts:805).
  runBasis: Basis = 'equity',
): Trace {
  const src = s.drivers ? `run-recorded drivers: ${s.drivers}` : null
  if (cs.kind === 'derived_chain' && s.chain) {
    const c = s.chain
    const ev = chainEv(c)
    const parts = [`EV ${fmt(ev, 0)}`]
    if (isNum(c.netDebt)) parts.push(`− net debt ${fmt(c.netDebt, 0)}`)
    if (isNum(c.minority)) parts.push(`− minority ${fmt(c.minority, 0)}`)
    if (isNum(c.other) && c.other !== 0) parts.push(`+ other ${fmt(c.other, 0)}`)
    const bridge = `(${parts.join(' ')}) ÷ shares ${fmt(c.shares, 2)} = ${fmt(cs.chainValue)}`
    const isRunoff = c.model === 'margin_runoff_dcf' && !isNum(c.evOverride)
    return {
      title: `${s.label} — computed from the recorded chain`,
      formula: isRunoff
        ? `${c.metricLabel ?? 'margin'} ${fmt((c.margin ?? 0) * 100, 2)}% × revenue base ${fmt(c.revenueBase, 0)} → FCFF → TV at (${fmt((c.wacc ?? 0) * 100, 2)}% − g ${fmt((c.growth ?? 0) * 100, 2)}%) → ${bridge}`
        : bridge,
      terms: c.statedDrivers.map((sd) => ({ label: sd.label, calc: `${sd.value ?? '—'}${sd.note ? ` · ${sd.note}` : ''}` })),
      note: isRunoff
        ? 'replays the orb\'s own written chain — edit the margin or growth and everything downstream recomputes; typing EV directly detaches the model'
        : c.statedDrivers.length ? 'stated drivers are the assumptions behind the recorded figures — shown for provenance; their mapping was not recorded, so the editable levers are the chain figures themselves' : 'edit the chain figures — the fair value recomputes from them',
      source: c.source ?? src,
    }
  }
  if (cs.kind === 'derived_multiple') {
    // v1.3: show the WHOLE arithmetic, bridge included. "28,889 × 8.21" alone reads as 237,178 per share
    // when the case's own bridge makes it 107.75 — a formula that contradicts the number beside it.
    const mb = s.multipleBasis ? ` (${s.multipleBasis})` : ''
    let formula = `${s.metricBasis ?? 'forward metric'} ${fmt(s.forwardMetric)} × multiple ${fmt(s.multiple)}${mb}`
    const effBasis = s.basis ?? runBasis
    const br = effBasis === 'ev' && s.bridge ? s.bridge : null
    if (br) {
      const parts = [`− net debt ${fmt(br.net_debt, 0)}${br.net_debt_basis ? ` (${br.net_debt_basis})` : ''}`]
      if (isNum(br.minority)) parts.push(`− minority ${fmt(br.minority, 0)}`)
      if (isNum(br.other) && br.other !== 0) parts.push(`+ other ${fmt(br.other, 0)}`)
      formula = `(${formula} ${parts.join(' ')}) ÷ shares ${fmt(isNum(br.shares) ? br.shares : null, 2)}`
    }
    const terms = (s.secondaryMultiples ?? []).map((x) => ({ label: x.basis, calc: `${fmt(x.value)}×${x.note ? ` · ${x.note}` : ''}` }))
    // The scenario `source` cites only the forward metric/multiple (schema contract) — a per-case bridge's
    // net_debt/minority/other/shares can trace to a DIFFERENT document/module (e.g. the balance-sheet-
    // survival module's debt-note read, not the valuation orb's own scenario table). Printing the metric's
    // source under the bridge arithmetic would misattribute those figures, so a distinct bridge.source is
    // shown as its own trace term rather than folded into the single `source` field (Codex #365 P1,
    // frameworks/valuation_summary.schema.json:39).
    if (br?.source && br.source !== s.source) terms.push({ label: 'bridge source', calc: br.source })
    return {
      title: `${s.label} — computed from your inputs`,
      formula,
      terms,
      note: s.multipleKind === 'implied'
        ? 'the multiple is IMPLIED — the run derived this level from its own machinery and the multiple is what that level corresponds to; typing one here is an explicit reverse assertion'
        : s.multipleKind === 'applied' ? 'the run built this case AS metric × multiple — the multiple is a genuine input' : undefined,
      source: s.source ?? src,
    }
  }
  if (cs.kind === 'live_blend') {
    const base = published ? traceBlend(published.methods, published.blend, labelFor) : null
    return { title: `${s.label} — driven by the live mix`, formula: `= the live blended base point ${fmt(cs.blend)}`, terms: [], note: 'moves with the Method-mix values and weights above', source: base ? null : src }
  }
  if (cs.kind === 'frozen_formula') {
    const t = published ? traceBlend(published.methods, published.blend, labelFor) : null
    return {
      title: `${s.label} — the recorded method blend`,
      formula: t ? t.formula : `= the published blend ${fmt(cs.blend)}`,
      terms: t?.terms ?? [],
      note: 'the frozen level matches the published blend within rounding — a computed cell',
      source: src,
    }
  }
  if (cs.kind === 'frozen_wedge') {
    const t = published ? traceBlend(published.methods, published.blend, labelFor) : null
    // "documented" only when the run actually documents it — the classification is structural (level ≠
    // blend), so an absent drivers text means an UNEXPLAINED gap, said plainly (Codex #338 r3644483978)
    const documented = typeof s.drivers === 'string' && s.drivers.trim().length > 0
    return {
      title: `${s.label} — blend + a judgment wedge`,
      formula: `${fmt(cs.blend)} (published blend) ${isNum(cs.wedge) && cs.wedge < 0 ? '−' : '+'} ${fmt(Math.abs(cs.wedge ?? 0))} (⚑ wedge) = ${fmt(s.frozenLevel)}`,
      terms: t?.terms ?? [],
      note: documented
        ? 'the wedge is the analyst\'s documented adjustment below/above the mechanical blend (§16) — it stays visible, never averaged away'
        : 'the run states NO reason for this gap between the published level and its own blend — an undocumented wedge; treat it as unexplained judgment (§16)',
      source: src,
    }
  }
  if (cs.kind === 'overridden') {
    return { title: `${s.label} — your override`, formula: 'a typed value replacing the frozen level — saved to the ledger with your reason', terms: [], note: `frozen level was ${fmt(s.frozenLevel)}`, source: src }
  }
  return {
    title: `${s.label} — analyst call (no recorded chain)`,
    formula: '⚑ this level has no machine-recorded derivation yet — the run states its reasoning below',
    terms: [],
    note: 'a future emission records each scenario\'s assumption chain, turning this into a computed cell',
    source: src,
  }
}

export function traceOutput(metric: 'expected' | 'mos' | 'downside' | 'rr' | 'pwt', math: ScenarioMath): Trace | null {
  const p = math.price
  const pwt = math.probWeightedTarget
  const base = math.levels['base'] ?? null
  const bear = math.levels['bear'] ?? null
  if (metric === 'pwt') {
    return {
      title: 'Probability-weighted target',
      formula: `Σ probability × level = ${fmt(pwt)}`,
      terms: math.perScenario.map((s) => ({ label: s.label, calc: `${fmt(s.probability, 1)}% × ${fmt(s.price_target)} = ${fmt((s.probability / 100) * s.price_target)}` })),
    }
  }
  if (!isNum(p)) return null
  if (metric === 'expected' && isNum(pwt)) {
    return { title: 'Expected return', formula: `(prob-weighted target ${fmt(pwt)} − price ${fmt(p)}) / ${fmt(p)} = ${fmt(math.expectedReturnPct, 1)}%`, terms: [], note: 'the probability-weighted gain or loss across the scenarios (§10)' }
  }
  if (metric === 'mos' && isNum(base)) {
    return { title: 'Margin of safety', formula: `(base ${fmt(base)} − price ${fmt(p)}) / base ${fmt(base)} = ${fmt(math.marginOfSafetyPct, 1)}%`, terms: [], note: 'the cushion between price and base fair value, as a share of fair value (§16)' }
  }
  if (metric === 'downside') {
    // trace the number the row actually shows: downsideRiskPct = the WORST scenario's return, inverted —
    // which equals the loss-to-bear only while the bear row is the worst (Codex #338 r3644483985)
    const rows = math.perScenario.filter((r) => isNum(r.return_pct))
    if (!rows.length || !isNum(math.downsideRiskPct)) return null
    const worst = rows.reduce((a, b) => ((a.return_pct as number) <= (b.return_pct as number) ? a : b))
    const isBear = worst.label.toLowerCase().includes('bear')
    return {
      title: 'Downside risk (worst case)',
      formula: `−(worst scenario return) = −(${fmt(worst.return_pct, 1)}%) = ${fmt(math.downsideRiskPct, 1)}% — worst case: ${worst.label} at ${fmt(worst.price_target)}`,
      terms: [],
      note: isBear
        ? 'inverted — higher is worse. The worst case is the bear row here, so this equals the loss-to-bear.'
        : `inverted — higher is worse. The worst case is currently ${worst.label}, NOT the bear row — this is not the loss-to-bear.`,
    }
  }
  if (metric === 'rr' && isNum(pwt) && isNum(bear)) {
    return { title: 'Risk / reward', formula: `(prob-weighted target ${fmt(pwt)} − price ${fmt(p)}) / (price ${fmt(p)} − bear ${fmt(bear)}) = ${fmt(math.riskReward)}`, terms: [], note: 'expected gain per unit of loss-to-bear' }
  }
  return null
}

// ---- 7. v2 Phase-1: goal seek — solve one recorded lever for a target blend (Excel's Goal Seek) ----
// The blend is piecewise LINEAR in each recorded lever (bilinear grid with the other axis fixed; affine
// anchor line; blend affine in a method value with weights fixed), so the solve is exact per segment —
// no iteration, no tolerance. It refuses outside the recorded range: beyond the orb's own grid/anchors
// there is no validated research to stand on (the same honesty rule as the ▸ panels' extrapolation flag).
export type GoalSeekParam = 'dcf_wacc' | 'dcf_growth' | 'peers_multiple'
export interface GoalSeekResult {
  param: GoalSeekParam
  target: number
  solution: number | null
  achieved: number | null
  span: [number, number] | null      // the blend values reachable across the recorded range
  note: string | null
}

function blendWithParam(d: PlaygroundDraft, param: GoalSeekParam, x: number): number | null {
  const internals: DraftInternals = { ...(d.internals ?? {}) }
  if (param === 'dcf_wacc' || param === 'dcf_growth') {
    if (!internals.dcf) return null
    const cur = internals.dcf
    internals.dcf = {
      ...cur, active: true,
      wacc: param === 'dcf_wacc' ? x : (cur.wacc ?? cur.grid.base?.wacc ?? null),
      growth: param === 'dcf_growth' ? x : (cur.growth ?? cur.grid.base?.growth ?? null),
    }
  } else {
    if (!internals.peers) return null
    internals.peers = { ...internals.peers, active: true, multiple: x }
  }
  return blend(deriveMethods({ ...d, internals }).methods).basePoint
}

export function goalSeekBlend(d: PlaygroundDraft, param: GoalSeekParam, target: number | null): GoalSeekResult {
  const out: GoalSeekResult = { param, target: target ?? NaN, solution: null, achieved: null, span: null, note: null }
  if (!isNum(target)) return { ...out, note: 'enter a target value first' }
  let nodes: number[] = []
  if (param === 'dcf_wacc' || param === 'dcf_growth') {
    const dcf = d.internals?.dcf
    nodes = (param === 'dcf_wacc' ? dcf?.grid.wacc : dcf?.grid.growth) ?? []
    // a solve is validated research only while the FIXED axis sits inside its recorded span — with it
    // extrapolated, every probed cell rests on unvalidated values, yet the result would present as solved
    // (Codex #338 r3644483993). Refuse with the remedy instead.
    if (dcf && nodes.length >= 2) {
      const fixedAxis = param === 'dcf_wacc' ? dcf.grid.growth : dcf.grid.wacc
      const fixedVal = param === 'dcf_wacc' ? (dcf.growth ?? dcf.grid.base?.growth ?? null) : (dcf.wacc ?? dcf.grid.base?.wacc ?? null)
      if (!isNum(fixedVal) || fixedVal < fixedAxis[0] - 1e-9 || fixedVal > fixedAxis[fixedAxis.length - 1] + 1e-9) {
        return { ...out, note: `the ${param === 'dcf_wacc' ? 'terminal-growth' : 'WACC'} field is outside the recorded grid — snap it back first (a solve resting on extrapolated cells is not validated research)` }
      }
    }
  } else {
    // every recorded anchor is a node, so the scan's segments coincide with the piecewise line the
    // evaluation uses — a 3-anchor kink cannot hide a crossing (Codex #338 r3644483987)
    nodes = sortedAnchors(d.internals?.peers?.pi ?? null).map((r) => r.multiple)
  }
  if (nodes.length < 2) return { ...out, note: 'this run recorded no range to search for that lever' }
  const f = nodes.map((x) => blendWithParam(d, param, x))
  if (!f.every(isNum)) return { ...out, note: 'the blend is not computable across the recorded range' }
  const fv = f as number[]
  const lo = Math.min(...fv), hi = Math.max(...fv)
  out.span = [round(lo, 4), round(hi, 4)]
  if (Math.abs(hi - lo) < 1e-9) return { ...out, note: 'moving this lever does not change the blend — the method carries no weight in the mix' }
  for (let i = 0; i < nodes.length - 1; i++) {
    const f0 = fv[i], f1 = fv[i + 1]
    if ((target - f0) * (target - f1) <= 0 && Math.abs(f1 - f0) > 1e-12) {
      const x = nodes[i] + ((target - f0) / (f1 - f0)) * (nodes[i + 1] - nodes[i])
      const achieved = blendWithParam(d, param, x)
      return { ...out, solution: round(x, 6), achieved: isNum(achieved) ? round(achieved, 4) : null }
    }
  }
  return { ...out, note: `not reachable inside the recorded range — the blend only spans ${round(lo, 2)}–${round(hi, 2)} on this lever` }
}
