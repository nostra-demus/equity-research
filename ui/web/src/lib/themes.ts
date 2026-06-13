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
  flow_series: number[]
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
