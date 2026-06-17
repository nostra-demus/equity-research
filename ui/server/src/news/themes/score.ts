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
  sparkWindows: 48, // last 48h hourly — dense enough to power the 1h/6h/24h time-window views off the member ring
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

// ---- the daily flow ring (long-horizon history for the time-window selector) ----
// flow_series above is the HOURLY view (last sparkWindows hours): dense, rebuilt from the member ring
// each cycle, so it can only ever reach back as far as the ring holds (~2 days for a busy theme).
// flow_daily is the LONG memory the "last 7d / 1m / 3m" views need: one bucket per UTC day, newest
// last, a bounded ring of DAILY_WINDOWS days. It is an ACCUMULATOR, not a rebuild — bumped once per new
// member as it lands (bumpDaily, from assign) and rolled forward to the current day each cycle
// (rollDaily) — so it SURVIVES member-ring eviction and truthfully records months of per-theme flow the
// 400-item ring can never hold. A theme with no ring yet (an old ledger entry, or a fresh discovery) is
// seeded once from its current member ring (ensureDaily), giving it real recent history immediately;
// depth then grows one real day at a time. Every count is a real item — nothing is invented (§3).

export const DAILY_WINDOWS = 120 // ~4 months of daily buckets — covers the 3-month window with headroom

const dayKeyOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10)
const dayStartMs = (key: string): number => Date.parse(`${key}T00:00:00Z`)
const dayDelta = (laterKey: string, earlierKey: string): number => Math.round((dayStartMs(laterKey) - dayStartMs(earlierKey)) / 86_400_000)

// the slice of a Theme these helpers touch — kept structural so they're trivially unit-testable
export interface DailyRingHolder {
  flow_daily?: number[]
  flow_daily_day?: string // UTC date (YYYY-MM-DD) of the newest bucket
  members?: { found_at: string }[]
}

/** Seed the daily ring from the member ring (real recent history) if it's missing or malformed,
 *  anchored to `now`'s UTC day. Idempotent: a present, correctly-sized ring is left untouched. */
export function ensureDaily(t: DailyRingHolder, nowMs: number, windows = DAILY_WINDOWS): void {
  if (Array.isArray(t.flow_daily) && t.flow_daily.length === windows && typeof t.flow_daily_day === 'string') return
  const anchor = dayKeyOf(nowMs)
  const arr = new Array(windows).fill(0)
  for (const m of t.members || []) {
    const ms = Date.parse(m.found_at)
    if (!Number.isFinite(ms)) continue
    const back = dayDelta(anchor, dayKeyOf(ms)) // 0 = today, 1 = yesterday, …
    if (back >= 0 && back < windows) arr[windows - 1 - back] += 1
  }
  t.flow_daily = arr
  t.flow_daily_day = anchor
}

/** Advance the ring so its newest bucket is `now`'s UTC day, zero-padding any elapsed days. No-op on
 *  the same day (or a backwards clock skew). Call once per cycle for every live theme so all rings stay
 *  day-aligned (newest bucket == today) and a theme that goes quiet shows real trailing zeros. */
export function rollDaily(t: DailyRingHolder, nowMs: number, windows = DAILY_WINDOWS): void {
  ensureDaily(t, nowMs, windows)
  const today = dayKeyOf(nowMs)
  const d = dayDelta(today, t.flow_daily_day as string)
  if (d <= 0) return
  t.flow_daily = d >= windows ? new Array(windows).fill(0) : (t.flow_daily as number[]).slice(d).concat(new Array(d).fill(0))
  t.flow_daily_day = today
}

/** Count one freshly-landed member into the ring at its own UTC day. Rolls forward first if the item is
 *  from a newer day than the current anchor (a new-day item opens today's bucket). Items older than the
 *  ring are dropped (beyond recorded history). Call once per NEW member in assignThemes. */
export function bumpDaily(t: DailyRingHolder, foundAt: string, nowMs: number, windows = DAILY_WINDOWS): void {
  ensureDaily(t, nowMs, windows)
  const raw = Date.parse(foundAt)
  if (!Number.isFinite(raw)) return
  // Clamp the landing to the engine clock: a future-dated source timestamp (clock skew / timezone-confused
  // feed) must NOT roll the anchor past today — that would break the newest-bucket==today invariant and
  // inflate history_days, claiming coverage the engine never observed (§3/§11). No real flow lands after now.
  const ms = Math.min(raw, nowMs)
  const itemDay = dayKeyOf(ms)
  if (dayDelta(itemDay, t.flow_daily_day as string) > 0) rollDaily(t, ms, windows) // a newer (still ≤ today) day → roll the anchor to it
  const back = dayDelta(t.flow_daily_day as string, itemDay)
  if (back >= 0 && back < windows) (t.flow_daily as number[])[windows - 1 - back] += 1
}
