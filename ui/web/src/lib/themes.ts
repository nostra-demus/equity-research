// Web-side types + pure helpers for the dynamic themes view. Kept in its own module (not lib/types.ts)
// so the themes feature stays self-contained. Mirrors the server's ThemeSummary / ThemeDetail shapes
// (ui/server/src/news/themes/types.ts). Helpers are pure + testable: heat, tier colour, sparkline path.

import type { FeedItem } from './types'

export type ThemeTier = 'hot' | 'active' | 'cooling' | 'parked'
export type OrderTier = 1 | 2 | 3
export type ImpactSide = 'beneficiary' | 'harmed' | 'mixed'

export interface ThemeCompanyLite {
  name: string
  ticker: string | null
  order: OrderTier
  side: ImpactSide
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
  last_flow: string
  rev: number
}
export interface ThemesIndex {
  generated_at: string
  themes: Theme[]
  counts: { hot: number; active: number; cooling: number; parked: number; retired: number; total: number }
  history_days: number // days of real daily-flow history available (caps how far the window selector reaches)
}
export interface ThemeCompany extends ThemeCompanyLite {
  listing_country: string | null
  name_key: string
  mention_count: number
  impact: { directness: number; magnitude: number; speed: number; reversibility: number; composite: number }
  last_seen: string
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

/** The spoken window label, qualified when only PART of it is backed by real history — so a label never
 *  claims more span than the engine actually has (the badge/card stay honest, not just the ribbon). */
export function windowLabel(win: ThemeWindow, cov: WindowCoverage | null): string {
  if (!cov || !cov.partial) return win.full
  return `${win.full} · ${cov.coveredDays} of ${cov.neededDays}d so far`
}
