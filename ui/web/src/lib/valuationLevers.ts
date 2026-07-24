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
  minority?: number | null
  other?: number | null
  shares?: number | null
  stated_drivers?: StatedDriver[] | null
  source?: string | null
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
/** The peers method value at a typed multiple — the affine line through the orb's OWN ≥2 recorded anchor
 *  rows (implied-value table). discountPct is the derived % below the recorded peer median (informational).
 *  Outside the anchor span → flagged (the orb published no row that far out). */
export function peersFromMultiple(pi: PeersInternals | null | undefined, multiple: number | null): PeersReadout {
  const bad = { value: null, outOfAnchors: false, discountPct: null }
  if (!pi || !isNum(multiple) || !Array.isArray(pi.anchors) || pi.anchors.length < 2) return bad
  const a0 = pi.anchors[0], a1 = pi.anchors[1]
  if (!a0 || !a1 || !isNum(a0.multiple) || !isNum(a0.value) || !isNum(a1.multiple) || !isNum(a1.value) || Math.abs(a1.multiple - a0.multiple) < 1e-9) return bad
  const slope = (a1.value - a0.value) / (a1.multiple - a0.multiple)
  const value = round(a0.value + slope * (multiple - a0.multiple), 4)
  const ms = pi.anchors.filter((a) => isNum(a?.multiple)).map((a) => a.multiple)
  const lo = Math.min(...ms), hi = Math.max(...ms)
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
}

export interface DraftChain {
  model: 'ev_bridge'
  ev: number | null; netDebt: number | null; minority: number | null; other: number | null; shares: number | null
  statedDrivers: StatedDriver[]
  source: string | null
}

/** The per-share level from an editable ev_bridge chain: (ev − net debt − minority + other) / shares.
 *  Falls back to the top-level share count when the chain records none. Null when not computable. */
export function chainLevel(chain: DraftChain | null | undefined, fallbackShares: number | null | undefined): number | null {
  if (!chain || chain.model !== 'ev_bridge' || !isNum(chain.ev)) return null
  const sh = isNum(chain.shares) ? chain.shares : (isNum(fallbackShares) ? fallbackShares : null)
  if (!isNum(sh) || sh <= 0) return null
  const equity = chain.ev - (isNum(chain.netDebt) ? chain.netDebt : 0) - (isNum(chain.minority) ? chain.minority : 0) + (isNum(chain.other) ? chain.other : 0)
  return round(equity / sh, 4)
}

// The sidecar derivation → the editable draft chain. Unknown models return null (treated as not
// recorded — the cell stays a judgment cell rather than pretending).
export function buildChain(deriv: ScenarioDerivation | null | undefined): DraftChain | null {
  if (!deriv || deriv.model !== 'ev_bridge' || !isNum(deriv.ev)) return null
  return {
    model: 'ev_bridge',
    ev: deriv.ev, netDebt: deriv.net_debt ?? null, minority: deriv.minority ?? null,
    other: deriv.other ?? null, shares: deriv.shares ?? null,
    statedDrivers: Array.isArray(deriv.stated_drivers) ? deriv.stated_drivers.filter((x) => x && typeof x.label === 'string') : [],
    source: deriv.source ?? null,
  }
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
  // Precedence: an EXPLICIT unlock-override wins; then the recorded chain (v1.2 — it reproduces the frozen
  // level and makes its figures the levers); then the frozen/typed level; then metric×multiple. A chain-less
  // scenario behaves exactly as before (levelOverride first), so older drafts and runs are unchanged.
  if (s.overrideUnlocked && isNum(s.levelOverride)) return s.levelOverride
  const c = chainLevel(s.chain, d.shares)
  if (c !== null) return c
  if (isNum(s.levelOverride)) return s.levelOverride
  if (isNum(s.forwardMetric) && isNum(s.multiple)) {
    try { return round(levelFromMultiple(s.forwardMetric, s.multiple, d.basis, d.shares, d.netDebt), 4) } catch { return null }
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
    if (m.key === 'dcf' && int?.dcf?.active) {
      const r = dcfFromGrid(int.dcf.grid, int.dcf.wacc, int.dcf.growth)
      methodInternals.dcf = r
      if (isNum(r.value)) return { ...m, value: r.value }
    }
    if (m.key === 'sotp' && int?.sotp?.active) {
      const v = sotpFromSegments(int.sotp.segments, int.sotp.bridge, d.shares)
      methodInternals.sotp = { value: v }
      if (isNum(v)) return { ...m, value: v }
    }
    if (m.key === 'peers' && int?.peers?.active) {
      const r = peersFromMultiple(int.peers.pi, int.peers.multiple)
      methodInternals.peers = r
      if (isNum(r.value)) return { ...m, value: r.value }
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
  if (isNum(mult('bull')) || isNum(mult('base')) || isNum(mult('bear'))) checks.symmetry = checkMultipleSymmetry(mult('bull'), mult('base'), mult('bear'))
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
  if (g && Array.isArray(g.wacc) && Array.isArray(g.growth) && Array.isArray(g.values)) {
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
  if (isNum(chainValue)) return { kind: 'derived_chain', chainValue }
  if (isNum(s.forwardMetric) && isNum(s.multiple)) return { kind: 'derived_multiple' }
  if (isBase && driveBase && isNum(liveBlend)) return { kind: 'live_blend', blend: liveBlend }
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

export function traceScenarioCell(s: DraftScenario, cs: ScenarioCellState, published: PlaygroundDraft['published'], labelFor: (k: string) => string = (k) => k): Trace {
  const src = s.drivers ? `run-recorded drivers: ${s.drivers}` : null
  if (cs.kind === 'derived_chain' && s.chain) {
    const c = s.chain
    const parts = [`EV ${fmt(c.ev, 0)}`]
    if (isNum(c.netDebt)) parts.push(`− net debt ${fmt(c.netDebt, 0)}`)
    if (isNum(c.minority)) parts.push(`− minority ${fmt(c.minority, 0)}`)
    if (isNum(c.other) && c.other !== 0) parts.push(`+ other ${fmt(c.other, 0)}`)
    return {
      title: `${s.label} — computed from the recorded chain`,
      formula: `(${parts.join(' ')}) ÷ shares ${fmt(c.shares, 2)} = ${fmt(cs.chainValue)}`,
      terms: c.statedDrivers.map((sd) => ({ label: sd.label, calc: `${sd.value ?? '—'}${sd.note ? ` · ${sd.note}` : ''}` })),
      note: c.statedDrivers.length ? 'stated drivers are the assumptions behind the recorded figures — shown for provenance; their mapping was not recorded, so the editable levers are the chain figures themselves' : 'edit the chain figures — the fair value recomputes from them',
      source: c.source ?? src,
    }
  }
  if (cs.kind === 'derived_multiple') {
    return { title: `${s.label} — computed from your inputs`, formula: `forward metric ${fmt(s.forwardMetric)} × multiple ${fmt(s.multiple)}`, terms: [], source: src }
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
    return {
      title: `${s.label} — blend + a disclosed judgment wedge`,
      formula: `${fmt(cs.blend)} (published blend) ${isNum(cs.wedge) && cs.wedge < 0 ? '−' : '+'} ${fmt(Math.abs(cs.wedge ?? 0))} (⚑ wedge) = ${fmt(s.frozenLevel)}`,
      terms: t?.terms ?? [],
      note: 'the wedge is the analyst\'s documented adjustment below/above the mechanical blend (§16) — it stays visible, never averaged away',
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
  if (metric === 'downside' && isNum(bear)) {
    return { title: 'Downside to bear', formula: `(price ${fmt(p)} − bear ${fmt(bear)}) / price ${fmt(p)} = ${fmt(math.downsideToBearPct, 1)}%`, terms: [], note: 'inverted — higher is worse: the loss if the bear case plays out' }
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
  if (param === 'dcf_wacc') nodes = d.internals?.dcf?.grid.wacc ?? []
  else if (param === 'dcf_growth') nodes = d.internals?.dcf?.grid.growth ?? []
  else {
    const ms = (d.internals?.peers?.pi.anchors ?? []).map((a) => a.multiple).filter(isNum)
    if (ms.length >= 2) nodes = [Math.min(...ms), Math.max(...ms)]
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
