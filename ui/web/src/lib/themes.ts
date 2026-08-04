// Web-side types + pure helpers for the dynamic themes view. Kept in its own module (not lib/types.ts)
// so the themes feature stays self-contained. Mirrors the server's ThemeSummary / ThemeDetail shapes
// (ui/server/src/news/themes/types.ts). Helpers are pure + testable: heat, tier colour, sparkline path.

import type { FeedItem, IntensityWindow } from './types'

export type ThemeTier = 'hot' | 'active' | 'cooling' | 'parked'
export type OrderTier = 1 | 2 | 3
export type ImpactSide = 'beneficiary' | 'harmed' | 'mixed'
export type ThemeSurfaceStatus = 'actionable' | 'forming' | 'context'

export interface ThemeScores {
  freshness: number
  magnitude: number
  breadth: number
  persistence: number
  composite: number
}

// The first-look qualification is deliberately separate from heat. Heat says how much news a cluster
// is taking; this read says whether the cluster has enough distinct, coherent evidence and a ticker-linked,
// directional expression to deserve scarce PM attention. Every field is optional on Theme below so a
// newly deployed web bundle fails closed while an older server is still serving the previous shape.
export interface ThemeSurfaceAssessment {
  status: ThemeSurfaceStatus
  reasons: string[]
  blockers: string[]
  metrics: {
    recent_6h_flow: number
    prior_6h_flow: number
    unique_evidence_count: number
    high_quality_evidence_count: number
    narrative_support_count: number
    narrative_coherence_pct: number
    recurring_narrative_token_count: number
    first_order_directional_ticker_count: number
  }
}

export interface ThemeEvidence {
  event_id: string
  headline: string
  found_at: string
  score: number
  source_tier: string
}

/** A trade expression that the server bound to the exact narrative-supporting evidence rows that proved it.
 * Optional on Theme during deploy skew; consumers must fail closed when an actionable summary omits it. */
export interface ThemeQualifiedExpression {
  name: string
  name_key: string
  ticker: string
  listing_country: string | null
  side: Exclude<ImpactSide, 'mixed'>
  evidence_event_ids: string[]
}

/** Explicit SSE invalidation for a theme that no longer belongs in any current index. */
export interface ThemeRemoval {
  theme_id: string
  reason: 'retired' | 'merged'
  merged_into: string | null
  rev: number
}

export interface ThemeCompanyLite {
  name: string
  ticker: string | null
  order: OrderTier
  side: ImpactSide
  listing_country?: string | null
  mention_count?: number
  impact_composite?: number
  last_seen?: string
}
export interface RelatedThemeLite {
  theme_id: string
  name: string
  kind: 'related' | 'opposite'
}
// /api/news/themes → one ranked theme (no member arrays)
export interface Theme {
  theme_id: string
  name: string
  description: string
  tier: ThemeTier
  composite: number
  fresh_flow: number
  flow_series: number[] // hourly (newest last) — powers the short windows + the sparkline
  flow_daily?: number[] // daily (newest last) — the long-horizon memory the 7d/1m/3m windows read
  member_count: number
  top_companies: ThemeCompanyLite[]
  related_themes: RelatedThemeLite[]
  first_seen?: string
  score_components?: ThemeScores
  evidence?: ThemeEvidence[]
  qualified_expressions?: ThemeQualifiedExpression[]
  // `assessment` is the canonical server field. `opportunity` remains an optional rollout alias so a
  // web deploy cannot mislabel a qualified theme if an earlier server draft briefly serves that name.
  assessment?: ThemeSurfaceAssessment
  opportunity?: ThemeSurfaceAssessment
  last_flow: string
  rev: number
}
export interface ThemesIndex {
  generated_at: string
  themes: Theme[]
  counts: { hot: number; active: number; cooling: number; parked: number; retired: number; total: number }
  history_days: number // days of real daily-flow history available (caps how far the window selector reaches)
}
// one member story that named a company — the sourced evidence for its order-tier placement (server why.ts)
export interface CompanyEvidence {
  headline: string
  event_id: string
  score: number
}
// the plain-English "why is this company here" for the deep-dive (server buildThemeDetail). Optional: an
// OLD engine won't send it (deploy skew, DESIGN.md §5) — the chip falls back to its impact/mention read.
export interface CompanyWhy {
  reason: string
  evidence: CompanyEvidence[]
}
export interface ThemeCompany extends ThemeCompanyLite {
  listing_country: string | null
  name_key: string
  mention_count: number
  impact: { directness: number; magnitude: number; speed: number; reversibility: number; composite: number }
  last_seen: string
  why?: CompanyWhy
}
// /api/news/themes/:id → the deep-dive
export interface ThemeDetail {
  theme: Theme
  scores: { freshness: number; magnitude: number; breadth: number; persistence: number; composite: number }
  members: FeedItem[]
  companies_by_order: { first: ThemeCompany[]; second: ThemeCompany[]; third: ThemeCompany[] }
  sectors: { sector: string; order: OrderTier; side: ImpactSide }[]
  related_themes: RelatedThemeLite[]
  keywords: string[]
}

// /api/news/themes/:id/brief → the few-sentence plain-English explainer of what the theme is about and
// what's happening (loaded separately from the deep-dive so members render instantly). Mirrors the
// server's ThemeBrief (ui/server/src/news/themes/brief.ts).
export interface ThemeBrief {
  theme_id: string
  brief: string
  generation: 'groq' | 'deterministic'
  generated_at: string
  note?: string // present when degraded (built from headlines rather than the model)
}

// ---- pure visual helpers ----

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** Items in roughly the last `hours` hours, summed from the hourly flow series (newest bucket last). */
export function recentFlow(series: number[] | undefined, hours: number): number {
  const fs = series || []
  return fs.slice(Math.max(0, fs.length - hours)).reduce((a, b) => a + b, 0)
}

const hoursSinceFlow = (iso: string | undefined, now: number): number => {
  const t = iso ? Date.parse(iso) : NaN
  return Number.isFinite(t) ? Math.max(0, (now - t) / 3_600_000) : Infinity
}

// How fast news is STILL pouring into a theme right now — its velocity, distinct from the tier (the
// long-run heat/importance). The old label keyed off `fresh_flow` (a 1-hour publish-time window), which
// is ~always 0 because article publish times lag — so every theme read "quiet" even hot ones. This reads
// the time since the theme's most recent item (its real recency) plus a burst check on the recent series:
//   surging — a real burst in the last hour or two
//   active  — news landed within ~2.5h (still live)
//   cooling — last item 2.5–5h ago (the rush has eased)
//   quiet   — nothing for 5h+ (genuinely gone quiet)
export type Momentum = 'surging' | 'active' | 'cooling' | 'quiet'

export function momentumOf(t: Pick<Theme, 'flow_series' | 'last_flow'>, now: number = Date.now()): Momentum {
  const last1 = recentFlow(t.flow_series, 1)
  const last2 = recentFlow(t.flow_series, 2)
  const since = hoursSinceFlow(t.last_flow, now)
  if (last1 >= 3 || last2 >= 6) return 'surging' // a genuine burst right now
  if (since < 2.5) return 'active'
  if (since < 5) return 'cooling'
  return 'quiet'
}

/** Continuous "heat" 0–1 for placement/size — blends the composite score with RECENT flow (last ~4h)
 *  so a theme that's both important AND actively taking news rises highest. (Was fresh_flow, which is
 *  ~always 0 and dragged every theme's flow term to zero — see momentumOf.) */
export function heatOf(t: Pick<Theme, 'composite' | 'flow_series'>): number {
  const score = clamp(t.composite / 100, 0, 1)
  const flow = clamp(recentFlow(t.flow_series, 4) / 12, 0, 1)
  return clamp(0.7 * score + 0.3 * flow, 0, 1)
}

/** Tier → the CSS custom-property the basin/chip paints with (inherits cyan + light/dark for free). */
export function tierColorVar(tier: ThemeTier): string {
  switch (tier) {
    case 'hot': return 'var(--accent-bright)'
    case 'active': return 'var(--accent)'
    case 'cooling': return 'var(--accent-deep)'
    default: return 'var(--text-faint)'
  }
}

export const tierLabel = (tier: ThemeTier): string => ({ hot: 'Hot', active: 'Active', cooling: 'Cooling', parked: 'Quiet' }[tier])

/** Basin radius from member volume — sqrt-scaled (area reads as volume) and bounded. */
export function radiusFor(memberCount: number, min = 16, max = 46): number {
  const norm = clamp(Math.sqrt(memberCount) / Math.sqrt(120), 0, 1)
  return min + (max - min) * norm
}

/** Build an SVG polyline `points` string for a flow sparkline scaled into a w×h box. */
export function sparklinePoints(series: number[], w: number, h: number, pad = 1): string {
  if (!series.length) return ''
  const max = Math.max(1, ...series)
  const n = series.length
  const stepX = n > 1 ? (w - pad * 2) / (n - 1) : 0
  return series
    .map((v, i) => {
      const x = pad + i * stepX
      const y = h - pad - (v / max) * (h - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export const orderLabel = (o: OrderTier): string => (o === 1 ? 'Direct' : o === 2 ? 'Ripple' : 'Read-across')

// ---- PM briefing helpers ----

const PLACEHOLDER = /^(?:null|undefined|n\/?a|none|unknown|-+)$/i

/** A conservative display guard, not a listing or liquidity claim. It removes extraction placeholders and long
 *  numeric filing identifiers while retaining valid all-numeric exchange tickers such as Japan's 4-digit
 *  codes. Passing this check proves only that the server returned a displayable ticker-shaped candidate. */
export function validThemeTicker(ticker: string | null | undefined): boolean {
  const s = ticker?.trim() || ''
  if (!s || PLACEHOLDER.test(s) || /^0+$/.test(s) || /^\d{6,}$/.test(s)) return false
  return /^[A-Z0-9][A-Z0-9.\-:]{0,19}$/i.test(s)
}

export function validThemeCompanyName(name: string | null | undefined): boolean {
  const s = name?.trim() || ''
  return !!s && !PLACEHOLDER.test(s)
}

export function themeCompanyLabel(c: Pick<ThemeCompanyLite, 'name' | 'ticker'>): string {
  return validThemeTicker(c.ticker) ? c.ticker!.trim() : c.name.trim()
}

/** Qualification accessor with a fail-closed deploy-skew rule: no assessment means Context, never an
 *  inferred "worth checking" call based on the old heat score. */
type ThemeAssessmentInput = Pick<Theme, 'assessment' | 'opportunity' | 'evidence' | 'qualified_expressions'>

/** Validate the server's evidence-bound expressions at the client trust boundary. A display-only company,
 * malformed expression, or proof id absent from this exact summary cannot become a first-look direction. */
export function qualifiedThemeExpressions(
  t: Pick<Theme, 'evidence' | 'qualified_expressions'>,
): ThemeQualifiedExpression[] {
  if (!Array.isArray(t.evidence) || !Array.isArray(t.qualified_expressions)) return []
  const evidenceIds = new Set(
    t.evidence
      .map((row) => typeof row?.event_id === 'string' ? row.event_id.trim() : '')
      .filter(Boolean),
  )
  if (!evidenceIds.size) return []
  const byIdentity = new Map<string, ThemeQualifiedExpression>()
  const conflictingIdentities = new Set<string>()
  for (const expression of t.qualified_expressions) {
    if (!expression || !validThemeCompanyName(expression.name) || !validThemeTicker(expression.ticker)) continue
    if (expression.side !== 'beneficiary' && expression.side !== 'harmed') continue
    if (!Array.isArray(expression.evidence_event_ids)) continue
    const rawProofIds = expression.evidence_event_ids.map((eventId) => typeof eventId === 'string' ? eventId.trim() : '')
    // The server emits an exact proof contract, not a bag from which the client may salvage good rows.
    // One empty/unknown id makes the whole expression unproven on this summary and therefore ineligible.
    if (!rawProofIds.length || rawProofIds.some((eventId) => !eventId || !evidenceIds.has(eventId))) continue
    const proofIds = [...new Set(rawProofIds)]
    const nameKey = typeof expression.name_key === 'string' ? expression.name_key.trim() : ''
    if (!nameKey) continue
    const ticker = expression.ticker.trim().toUpperCase()
    const listingCountry = typeof expression.listing_country === 'string' && expression.listing_country.trim()
      ? expression.listing_country.trim()
      : null
    const identity = `${nameKey.toLowerCase()}|${ticker}|${(listingCountry || '').toLowerCase()}`
    const normalized = { ...expression, name: expression.name.trim(), name_key: nameKey, ticker, listing_country: listingCountry, evidence_event_ids: proofIds }
    const prior = byIdentity.get(identity)
    if (!prior) byIdentity.set(identity, normalized)
    else if (prior.side !== normalized.side) conflictingIdentities.add(identity)
    else prior.evidence_event_ids = [...new Set([...prior.evidence_event_ids, ...normalized.evidence_event_ids])]
  }
  return [...byIdentity.entries()]
    .filter(([identity]) => !conflictingIdentities.has(identity))
    .map(([, expression]) => expression)
}

export function themeSurfaceAssessment(t: ThemeAssessmentInput): ThemeSurfaceAssessment | null {
  const candidate = t.assessment || t.opportunity
  if (!candidate || !['actionable', 'forming', 'context'].includes(candidate.status)) return null
  if (!Array.isArray(candidate.reasons) || !candidate.reasons.every((v) => typeof v === 'string')) return null
  if (!Array.isArray(candidate.blockers) || !candidate.blockers.every((v) => typeof v === 'string')) return null
  const m = candidate.metrics
  if (!m || typeof m !== 'object') return null
  const counts = [
    m.recent_6h_flow,
    m.prior_6h_flow,
    m.unique_evidence_count,
    m.high_quality_evidence_count,
    m.narrative_support_count,
    m.recurring_narrative_token_count,
    m.first_order_directional_ticker_count,
  ]
  if (!counts.every((v) => Number.isFinite(v) && v >= 0)) return null
  if (!Number.isFinite(m.narrative_coherence_pct) || m.narrative_coherence_pct < 0 || m.narrative_coherence_pct > 100) return null
  // An actionable row has cleared every gate: it must explain at least one fact and have no blocker.
  // A partial deploy or malformed cache that merely says `status: actionable` fails closed to Context.
  if (candidate.status === 'actionable' && (
    !candidate.reasons.length
    || candidate.blockers.length
    || !qualifiedThemeExpressions(t).length
  )) return null
  return candidate
}

export function themeSurfaceStatus(t: ThemeAssessmentInput): ThemeSurfaceStatus {
  return themeSurfaceAssessment(t)?.status || 'context'
}

/** Current six-hour evidence flow minus the preceding six-hour window. Null means the server did not
 *  send an assessment; zero is a real "unchanged" result and must not be collapsed into missing. */
export function themeFlowDelta(t: ThemeAssessmentInput): number | null {
  const a = themeSurfaceAssessment(t)
  const m = a?.metrics
  if (!m || !Number.isFinite(m.recent_6h_flow) || !Number.isFinite(m.prior_6h_flow)) return null
  return m.recent_6h_flow - m.prior_6h_flow
}

export interface DirectionalThemeExpressions {
  beneficiaries: ThemeQualifiedExpression[]
  harmed: ThemeQualifiedExpression[]
}

/** Evidence-bound first-order expressions split by direction. `top_companies` is intentionally absent:
 * it is a display ranking and can contain valid but unrelated tickers that did not clear qualification. */
export function splitQualifiedThemeExpressions(
  t: Pick<Theme, 'evidence' | 'qualified_expressions'>,
): DirectionalThemeExpressions {
  const out: DirectionalThemeExpressions = { beneficiaries: [], harmed: [] }
  for (const expression of qualifiedThemeExpressions(t)) {
    if (expression.side === 'beneficiary') out.beneficiaries.push(expression)
    else out.harmed.push(expression)
  }
  return out
}

const finiteOr = (n: number | undefined, fallback: number): number => Number.isFinite(n) ? n! : fallback

/** Exact client twin of the server's explainable, lexicographic sort. There is no weighted usefulness
 *  score: acceleration wins first, then current flow, ticker-linked direction, narrative support,
 *  supported-source evidence, legacy heat only as a late tiebreak, recency, and finally name. */
export function compareBriefingThemes(a: Theme, b: Theme): number {
  const statusOrder: Record<ThemeSurfaceStatus, number> = { actionable: 0, forming: 1, context: 2 }
  const status = statusOrder[themeSurfaceStatus(a)] - statusOrder[themeSurfaceStatus(b)]
  if (status) return status
  const am = themeSurfaceAssessment(a)?.metrics
  const bm = themeSurfaceAssessment(b)?.metrics
  const ad = themeFlowDelta(a)
  const bd = themeFlowDelta(b)
  return finiteOr(bd ?? undefined, -Infinity) - finiteOr(ad ?? undefined, -Infinity)
    || finiteOr(bm?.recent_6h_flow, -1) - finiteOr(am?.recent_6h_flow, -1)
    || finiteOr(bm?.first_order_directional_ticker_count, -1) - finiteOr(am?.first_order_directional_ticker_count, -1)
    || finiteOr(bm?.narrative_support_count, -1) - finiteOr(am?.narrative_support_count, -1)
    || finiteOr(bm?.high_quality_evidence_count, -1) - finiteOr(am?.high_quality_evidence_count, -1)
    || finiteOr(b.composite, -1) - finiteOr(a.composite, -1)
    || finiteOr(Date.parse(b.last_flow || ''), -Infinity) - finiteOr(Date.parse(a.last_flow || ''), -Infinity)
    || a.name.localeCompare(b.name)
}

export interface ThemeBriefingGroups {
  worthChecking: Theme[]
  forming: Theme[]
  context: Theme[]
  counts: { worthChecking: number; forming: number; context: number }
  hiddenWorthChecking: number
}

/** Build the ranked first-look hierarchy. The default returns the five highest-value full briefing rows;
 * callers can request a larger explicit limit when they offer an in-place show-all control. */
export function groupThemesForBriefing(themes: Theme[], maxWorthChecking = 5): ThemeBriefingGroups {
  const ranked = [...themes].sort(compareBriefingThemes)
  const allWorth = ranked.filter((t) => themeSurfaceStatus(t) === 'actionable')
  const forming = ranked.filter((t) => themeSurfaceStatus(t) === 'forming')
  const context = ranked.filter((t) => themeSurfaceStatus(t) === 'context')
  const limit = Math.max(0, Math.floor(maxWorthChecking))
  return {
    worthChecking: allWorth.slice(0, limit),
    forming,
    context,
    counts: { worthChecking: allWorth.length, forming: forming.length, context: context.length },
    hiddenWorthChecking: Math.max(0, allWorth.length - limit),
  }
}

export function sourceTierLabel(tier: string | null | undefined): string {
  return ({
    primary_filing: 'filing',
    official_data: 'official',
    company: 'company',
    news: 'news',
    unconfirmed: 'unconfirmed',
    social: 'social',
  } as Record<string, string>)[tier || ''] || (tier || 'source').replace(/_/g, ' ')
}

/** The summary pins at most three recent qualifying rows, including ticker-expression proof when one
 * exists. Keep all three, de-duplicate by headline, and fail closed on malformed cached evidence. */
export function themeBriefingEvidence(t: Pick<Theme, 'evidence'>): ThemeEvidence[] {
  if (!Array.isArray(t.evidence)) return []
  const seen = new Set<string>()
  const out: ThemeEvidence[] = []
  for (const evidence of t.evidence) {
    const headline = evidence?.headline?.trim()
    if (!headline || seen.has(headline)) continue
    seen.add(headline)
    out.push(evidence)
    if (out.length === 3) break
  }
  return out
}

export interface ThemeSliceDisplay {
  /** True when the index is narrower than the global all-wire index. */
  active: boolean
  /** Plain label used everywhere the sliced index is shown. */
  label: string
}

/** One display contract for the same server-side Themes slice used by the header, briefing, map, and
 * deep dive. A non-flow wire is scoped even before one subject is selected, so its global intake must
 * never be presented as if it described that narrower index. */
export function themeSliceDisplay(geoLabel: string, subject: string | null, eventScope?: string | null): ThemeSliceDisplay {
  const parts: string[] = []
  const geo = geoLabel.trim()
  const selectedSubject = subject?.trim() || ''
  const scope = (eventScope || '').trim().replace(/[_-]+/g, ' ')
  if (geo) parts.push(geo)
  if (selectedSubject) parts.push(selectedSubject)
  else if (scope) parts.push(`${scope} wire`)
  return { active: parts.length > 0, label: parts.join(' · ') }
}

export type ThemeMapMode = 'compact' | 'spatial'

/** The relationship graph needs enough horizontal room for its source lanes, ranking lens, and labelled
 * basins. Below that width a ranked compact explorer is truthful and reachable instead of a clipped map. */
export function themeMapMode(width: number): ThemeMapMode {
  return Number.isFinite(width) && width > 0 && width < 620 ? 'compact' : 'spatial'
}

/** Hover state can outlive its theme by one render when an SSE removal lands. Resolve defensively so a
 * tooltip never receives `undefined` during that transition. */
export function themeForMapHover(themes: readonly Theme[], themeId: string | null): Theme | null {
  return themeId ? themes.find((theme) => theme.theme_id === themeId) ?? null : null
}

/** Source-tier lanes are usable only for the global live view or an exactly matching historical rollup.
 * A scoped view and a historical window without its own rollup hide the current-wire mix. */
export function shouldHideThemeIntake(scoped: boolean, historical: boolean, hasExactRollup: boolean): boolean {
  return scoped || (historical && !hasExactRollup)
}

// ---- time-window selector ----
// The user scrubs the SAME live themes through different lookbacks: "what's hottest in the last hour"
// vs "...the last 3 months". A window re-ranks + re-sizes themes by the news flow WITHIN it. Short
// windows (≤ the hourly series length, ~48h) read off flow_series (hourly); longer ones read off
// flow_daily (the server's daily accumulator). Every number is a real item count — never fabricated
// (§3): a window the engine has no history for is shown but disabled, not faked.

export interface ThemeWindow {
  id: string
  label: string // the pill label
  full: string // spoken form for captions + empty states ("the last 7 days")
  hours: number | null // null = Live (the real-time view); otherwise the lookback in hours
}

/** Briefing is an explicitly current screen. Historical lookbacks belong to the exploratory map, where
 * flow controls both ordering and size. Keeping this rule pure gives store/UI callers the same defensive
 * answer during persisted-state or deploy skew: a board can never inherit a historical window. */
export function themeWindowForView(view: 'map' | 'board' | null, requestedHours: number | null): number | null {
  return view === 'map' ? requestedHours : null
}

export const THEME_WINDOWS: ThemeWindow[] = [
  { id: 'live', label: 'Live', full: 'right now', hours: null },
  { id: '1h', label: '1H', full: 'the last hour', hours: 1 },
  { id: '6h', label: '6H', full: 'the last 6 hours', hours: 6 },
  { id: '24h', label: '24H', full: 'the last 24 hours', hours: 24 },
  { id: '7d', label: '7D', full: 'the last 7 days', hours: 24 * 7 },
  { id: '2w', label: '2W', full: 'the last 2 weeks', hours: 24 * 14 },
  { id: '1m', label: '1M', full: 'the last month', hours: 24 * 30 },
  { id: '3m', label: '3M', full: 'the last 3 months', hours: 24 * 90 },
]

// The hourly series (server sparkWindows) always covers at least this far back off the member ring, so
// windows this short are real the moment the engine starts — no daily history needed.
const HOURLY_FLOOR_H = 48

type FlowLike = Pick<Theme, 'flow_series' | 'flow_daily' | 'member_count' | 'composite'>

/** News items that landed in a theme within the last `hours`. Reads the hourly series when the window
 *  fits it, else the daily accumulator. `null` = Live → the all-time member count. A real item count. */
export function flowInWindow(t: Pick<Theme, 'flow_series' | 'flow_daily' | 'member_count'>, hours: number | null): number {
  if (hours == null) return t.member_count
  const hourly = t.flow_series || []
  if (hours <= hourly.length) return recentFlow(hourly, hours)
  const daily = t.flow_daily || []
  const days = Math.ceil(hours / 24)
  return daily.slice(Math.max(0, daily.length - days)).reduce((a, b) => a + b, 0)
}

/** The flow series to sparkline for a window — hourly buckets for short windows, daily for long ones. */
export function windowSeries(t: Pick<Theme, 'flow_series' | 'flow_daily'>, hours: number | null): number[] {
  const hourly = t.flow_series || []
  if (hours == null || hours <= hourly.length) return hours == null ? hourly : hourly.slice(Math.max(0, hourly.length - hours))
  const daily = t.flow_daily || []
  const days = Math.ceil(hours / 24)
  return daily.slice(Math.max(0, daily.length - days))
}

/** Ranking + sizing heat for a window: dominated by the windowed volume (what's hot in THIS window),
 *  with a small composite tiebreak so quality breaks ties. Order is what matters, so the scale is rough. */
export function heatInWindow(t: FlowLike, hours: number | null): number {
  if (hours == null) return heatOf(t)
  const f = flowInWindow(t, hours)
  const vol = clamp(f / (f + 8), 0, 1) // saturating, monotonic in volume (8 ≈ a meaningful burst)
  return clamp(0.85 * vol + 0.15 * clamp(t.composite / 100, 0, 1), 0, 1)
}

export interface WindowCoverage {
  selectable: boolean // can we honestly show this window at all?
  coveredDays: number // days of real data we have for it
  neededDays: number // days the window asks for
  partial: boolean // some, but not the full window, of history exists
}

/** Given how many days of daily history the engine actually has, decide whether a window is honestly
 *  showable and whether it's fully or only partially covered. Short windows (≤48h) are always backed by
 *  the hourly ring; long ones need accrued daily history and light up as the engine runs. */
export function windowCoverage(w: ThemeWindow, historyDays: number): WindowCoverage {
  if (w.hours == null || w.hours <= HOURLY_FLOOR_H) return { selectable: true, coveredDays: 0, neededDays: 0, partial: false }
  const neededDays = Math.ceil(w.hours / 24)
  const coveredDays = Math.min(neededDays, Math.max(0, Math.floor(historyDays)))
  return { selectable: coveredDays >= 1, coveredDays, neededDays, partial: coveredDays < neededDays }
}

/** A slice refresh temporarily clears history. Only a completed replacement index may invalidate the
 * selected lookback; loading/error/idle states preserve the user's window for a retry or cached return. */
export function shouldResetThemeWindow(
  status: 'idle' | 'loading' | 'ready' | 'error',
  view: 'map' | 'board' | null,
  win: ThemeWindow | null,
  historyDays: number,
): boolean {
  return status === 'ready' && view === 'map' && !!win && !windowCoverage(win, historyDays).selectable
}

/** The spoken window label, qualified when only PART of it is backed by real history — so a label never
 *  claims more span than the engine actually has (the badge/card stay honest, not just the ribbon). */
export function windowLabel(win: ThemeWindow, cov: WindowCoverage | null): string {
  if (!cov || !cov.partial) return win.full
  return `${win.full} · ${cov.coveredDays} of ${cov.neededDays}d so far`
}

// ---- one window to drive them both ----
// The ThemeMap's central readout + source-lane mix come from a small server-side intake rollup that
// supports a FIXED set of windows ('1h' | '4h' | 'day' | '7d', plus 'scan' = the live per-cycle path).
// The "When" ribbon (THEME_WINDOWS) is the single time-window control, so it must drive that readout too
// — there is no separate intensity picker. Only an EXACT match maps to a rollup window; any other lookback
// (Live, 6H, 2W, 1M, 3M) returns 'scan', the live readout, so the centre never labels itself with a window
// the rollup can't honestly cover (§3: never fake a number). The theme basins still re-rank + re-size by
// the chosen window regardless — that runs off each theme's own flow rings, which span any lookback.
export function intensityWindowForHours(hours: number | null): IntensityWindow {
  switch (hours) {
    case 1: return '1h'
    case 24: return 'day'
    case 24 * 7: return '7d'
    default: return 'scan'
  }
}
