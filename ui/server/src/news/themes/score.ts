// Deterministic theme scoring — the §12 "explainable from evidence rows, not vibes" rule, applied to
// themes. Mirrors rank.ts: every component is returned, the composite is clamped, weights are tunable.
// Four components, each saturating so a flash never out-scores a real, broad, sustained theme:
//   freshness   — time-decayed recent flow (is news STILL pouring in?)
//   magnitude   — volume × member quality (how big + how trustworthy is the flow?)
//   breadth     — distinct companies/sectors (a real theme spans names; a flash is one stock)
//   persistence — fraction of recent windows with flow (sustained vs one burst)
// Decay is automatic: freshness/persistence are time-relative to `now`, so a theme whose flow stops
// slides hot→active→cooling→parked each cycle with no cron.

import type { Theme, ThemeMember, ThemeScores, ThemeTier } from './types'

export interface ThemeScoreConfig {
  weights: { freshness: number; magnitude: number; breadth: number; persistence: number }
  thresholds: { hot: number; active: number; cooling: number } // composite ≥ → tier
  halfLifeHours: number // recency decay half-life
  freshK: number // freshness saturation constant
  magK: number // magnitude saturation constant
  breadthK: number // breadth saturation constant
  persistWindows: number // # of hourly windows in the persistence denominator (e.g. 24 = last day)
  freshWindowHours: number // window counted as "fresh now" (drives fresh_flow + the latest sparkline point)
  sparkWindows: number // # of hourly buckets in flow_series (the sparkline)
}

export const DEFAULT_THEME_SCORE_CONFIG: ThemeScoreConfig = {
  weights: { freshness: 0.35, magnitude: 0.3, breadth: 0.2, persistence: 0.15 },
  thresholds: { hot: 70, active: 45, cooling: 20 },
  halfLifeHours: 8,
  freshK: 4,
  magK: 5,
  breadthK: 5,
  persistWindows: 24,
  freshWindowHours: 1,
  sparkWindows: 12,
}

const TIER_WEIGHT: Record<string, number> = {
  primary_filing: 1.3,
  official_data: 1.2,
  company: 1.1,
  news: 1.0,
  unconfirmed: 0.6,
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const ageHours = (iso: string, nowMs: number): number => {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 1e6
  return Math.max(0, (nowMs - t) / 3_600_000)
}

export function tierFor(composite: number, th: ThemeScoreConfig['thresholds']): ThemeTier {
  if (composite >= th.hot) return 'hot'
  if (composite >= th.active) return 'active'
  if (composite >= th.cooling) return 'cooling'
  return 'parked'
}

export interface ScoredTheme {
  scores: ThemeScores
  tier: ThemeTier
  fresh_flow: number
  flow_series: number[]
}

/** Score one theme from its member ring + company/sector breadth. Pure; `now` injected for tests. */
export function scoreTheme(theme: Pick<Theme, 'members' | 'companies' | 'sectors' | 'first_seen'>, now: Date = new Date(), cfg: ThemeScoreConfig = DEFAULT_THEME_SCORE_CONFIG): ScoredTheme {
  const nowMs = now.getTime()
  const members: ThemeMember[] = theme.members || []
  const ln2 = Math.log(2)

  // freshness — sum of recency-decayed member weights, saturated
  let freshRaw = 0
  let fresh_flow = 0
  for (const m of members) {
    const age = ageHours(m.found_at, nowMs)
    freshRaw += Math.exp((-age * ln2) / cfg.halfLifeHours)
    if (age <= cfg.freshWindowHours) fresh_flow++
  }
  const freshness = clamp(100 * (1 - Math.exp(-freshRaw / cfg.freshK)), 0, 100)

  // magnitude — volume × quality (member triage_score × source-tier weight), saturated
  let magRaw = 0
  for (const m of members) magRaw += (clamp(m.score || 0, 0, 100) / 100) * (TIER_WEIGHT[m.tier] ?? 1.0)
  const magnitude = clamp(100 * (1 - Math.exp(-magRaw / cfg.magK)), 0, 100)

  // breadth — distinct companies + sectors (realness), saturated
  const breadthRaw = (theme.companies?.length || 0) + (theme.sectors?.length || 0)
  const breadth = clamp(100 * (1 - Math.exp(-breadthRaw / cfg.breadthK)), 0, 100)

  // persistence — fraction of recent windows with flow (sustained vs one burst)
  const activeBuckets = new Set<number>()
  for (const m of members) {
    const age = ageHours(m.found_at, nowMs)
    if (age < cfg.persistWindows) activeBuckets.add(Math.floor(age))
  }
  const windowsSinceFirstSeen = clamp(Math.ceil(ageHours(theme.first_seen, nowMs)), 1, cfg.persistWindows)
  const persistence = clamp(100 * (activeBuckets.size / windowsSinceFirstSeen), 0, 100)

  const w = cfg.weights
  const composite = clamp(Math.round(w.freshness * freshness + w.magnitude * magnitude + w.breadth * breadth + w.persistence * persistence), 0, 100)

  // flow_series — per-hour member counts over the last sparkWindows hours, oldest → newest
  const flow_series = new Array(cfg.sparkWindows).fill(0)
  for (const m of members) {
    const age = ageHours(m.found_at, nowMs)
    const bucket = cfg.sparkWindows - 1 - Math.floor(age) // newest bucket = last index
    if (bucket >= 0 && bucket < cfg.sparkWindows) flow_series[bucket]++
  }

  return {
    scores: { freshness: Math.round(freshness), magnitude: Math.round(magnitude), breadth: Math.round(breadth), persistence: Math.round(persistence), composite },
    tier: tierFor(composite, cfg.thresholds),
    fresh_flow,
    flow_series,
  }
}
