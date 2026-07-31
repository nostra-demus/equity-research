import type { CallVsLive, LiveQuote, Sufficiency } from './types'

export function sufficiencyColor(s: Sufficiency): string {
  if (s === 'Sufficient') return 'var(--accent-bright)' // used as the module status TEXT too — needs AA on light
  if (s === 'Partial') return '#9a8048' // muted olive-gold — distinct from the deep-gold "Sufficient", ~3.6:1 on white
  return 'var(--text-faint)' // "Insufficient" reads as a neutral, empty gray
}
export function sufficiencyLabel(s: Sufficiency): string {
  return s
}

export type DecisionTone = 'positive' | 'neutral' | 'negative' | 'none'
export function decisionTone(decision?: string | null): DecisionTone {
  if (!decision) return 'none'
  const d = decision.toLowerCase()
  if (/strong buy|^buy|starter/.test(d)) return 'positive'
  if (/avoid|short/.test(d)) return 'negative'
  if (/watchlist|pair|hedge/.test(d)) return 'neutral'
  if (/insufficient/.test(d)) return 'none'
  return 'neutral'
}
export function decisionColor(decision?: string | null): string {
  const t = decisionTone(decision)
  if (t === 'positive') return 'var(--accent-bright)'
  if (t === 'negative') return 'var(--bad)'
  if (t === 'neutral') return 'var(--text)'
  return 'var(--text-faint)'
}

// The verdict of a decision record, across swarms: research records carry `decision`; a non-research
// swarm self-declares its routing verdict key in SWARM.md (commodity: `Action` → record key `action`),
// served per swarm as SwarmMeta.verdictField. Fail-closed: without a verdictField (research, or an
// older engine during a deploy-skew window) only the research shape resolves.
export function resolveVerdict(decision: any, verdictField?: string | null): string | null {
  if (!decision) return null
  if (typeof decision.decision === 'string' && decision.decision) return decision.decision
  if (!verdictField) return null
  const v = decision[verdictField] ?? decision[verdictField.toLowerCase()]
  return typeof v === 'string' && v ? v : null
}

export function moduleLabel(name: string): string {
  return name.replace(/-/g, ' ')
}

export function fmtCost(usd?: number): string {
  if (usd == null) return '—'
  return `$${usd < 1 ? usd.toFixed(2) : usd.toFixed(usd < 10 ? 1 : 0)}`
}
export function fmtDuration(ms?: number): string {
  if (!ms) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

// ---- plan usage / rate-limit windows ----
export function usageLabel(rateLimitType?: string): string {
  switch (rateLimitType) {
    case 'five_hour':
      return '5-hour'
    case 'seven_day':
      return 'Weekly · all models'
    case 'seven_day_opus':
    case 'seven_day_oauth_opus':
      return 'Weekly · Opus'
    default:
      return rateLimitType ? rateLimitType.replace(/_/g, ' ') : 'usage'
  }
}
export function usagePct(u?: number): number | null {
  return typeof u === 'number' ? Math.round(u * 100) : null
}
export function usageColor(status?: string, utilization?: number): string {
  if (status === 'rejected' || status === 'blocked') return 'var(--bad)'
  const u = utilization ?? 0
  if (u >= 0.9) return 'var(--bad)'
  if (u >= 0.75) return 'var(--accent-bright)'
  return 'var(--accent)'
}
// A span given in MINUTES, in the shortest unit that stays truthful: minutes below an hour, then hours,
// then days. Extracted from resetIn (the same ladder, measured from a timestamp) so a plain duration
// formats identically to a countdown. The news-bridge chip previously did its own `Math.round(min / 60)`
// and printed "sweeping every 0h" for any cadence under half an hour — the 15-minute clamp floor an
// operator sets to watch a sweep is exactly that case.
// Named for its INPUT UNIT because fmtDuration above takes MILLISECONDS and formats a short run as
// "4m 12s" — a different ladder for a different job; do not merge them.
export function fmtMinutes(mins: number): string {
  if (mins < 60) return `${Math.max(1, Math.round(mins))}m`
  const hours = mins / 60
  if (hours < 48) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}
export function resetIn(resetsAt?: number): string | null {
  if (!resetsAt) return null
  const ms = resetsAt * 1000 - Date.now()
  if (ms <= 0) return 'now'
  return fmtMinutes(ms / 60000)   // MINUTES — not fmtDuration, which reads its argument as milliseconds
}
// The news-bridge chip's "next sweep" phrase. A NONPOSITIVE delta means the scheduled sweep time has
// already passed. That is not hypothetical: refreshBridgeStatus keeps the last-known snapshot when a poll
// fails (status is decoration), so a stale nextSweepAt sits in the past whenever the engine is unreachable
// or has stopped advancing its schedule. Feeding that straight to fmtMinutes prints "next 1m" — fmtMinutes
// floors to 1m — so the chip would claim a sweep is imminent forever, hiding that it is overdue. Say
// "due now" instead (the same <=0 convention resetIn uses). A future time uses the one shared ladder.
export function nextSweepLabel(nextSweepAt: string | number | null | undefined, now: number): string | null {
  if (!nextSweepAt) return null
  const mins = (new Date(nextSweepAt).getTime() - now) / 60_000
  return mins <= 0 ? 'due now' : `next ${fmtMinutes(mins)}`
}

// past-relative time for the activity log ("just now", "5m ago", "3h ago", "2d ago", else a date)
export function fmtAgo(ts?: number): string {
  if (!ts) return '—'
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 45) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
// full local timestamp for the hover title
export function fmtAbsolute(ts?: number): string {
  if (!ts) return ''
  return new Date(ts).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// local wall-clock HH:MM for an ISO timestamp. The wire stores UTC (e.g. "…T19:53:00Z"); show it in
// the VIEWER's own timezone, not UTC — slicing the raw string would leak UTC. 24-hour to fit the dense
// mono column. Falls back to the raw slice only if the date won't parse.
export function hhmmLocal(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso.slice(11, 16) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

// compact local DATE + time for an ISO timestamp — "Jun 14, 01:23" (no year, 24-hour) for per-row
// stamps where items can span days. Viewer's own timezone, same as hhmmLocal.
export function fmtStampLocal(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

// Stable per-CALENDAR-DAY key in the VIEWER's timezone — lets a list that only shows HH:MM insert a
// date divider whenever the day changes. Built from local y/m/d (not a UTC string slice, which would
// bucket by UTC midnight and split a viewer's day in two).
export function dayKeyLocal(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso.slice(0, 10) : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Human label for a date divider above a day's rows: "Today" / "Yesterday" / "Sat, 14 Jun"
// (year appended only when it isn't the current year). Viewer's own timezone, same as hhmmLocal.
export function dayDividerLabel(iso?: string, now: Date = new Date()): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  if (dayKeyLocal(iso) === dayKeyLocal(now.toISOString())) return 'Today'
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  if (dayKeyLocal(iso) === dayKeyLocal(y.toISOString())) return 'Yesterday'
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString(undefined, opts)
}

export function nodeStatusColor(status: string): string {
  switch (status) {
    case 'running':
    case 'done':
    case 'queued':
      return 'var(--accent)'
    case 'failed':
      return 'var(--bad)'
    case 'ready':
      return 'var(--ring-ready)' // theme-flipping ready-orb ring color
    default:
      return 'var(--ring-dormant)' // theme-flipping dormant-orb ring color
  }
}

// ---- live-price (decision-bar) display helpers ----
// Kept here, in the pure format module, so the DecisionBanner's number-to-string logic is unit-testable
// without importing the component (which transitively pulls in the store / import.meta.env).

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * An ISO instant → "22 Jul 2026" — a calendar date with NO clock, for a settled market session where a
 * time would be a fiction. Formatted in UTC ON PURPOSE: a bare exchange close date ("2026-07-22") arrives
 * as UTC midnight, so reading its fields in LOCAL time would show the previous calendar day for any viewer
 * west of UTC (e.g. 21 Jul across the Americas). Empty string when the input won't parse.
 */
export function stampDayUTC(iso?: string | null): string {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const d = new Date(t)
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** A signed percent like the decision bar's "+3.2%" / "-16.1%". */
function pctLabel(v: number): string {
  return `${v > 0 ? '+' : ''}${v}%`
}

/**
 * The faint qualifier shown beside the live price. A failed refresh (`stale`) MUST be visible on screen,
 * not only in the hover title — otherwise a cached value reads as current. So the stale flag wins the
 * slot even when a re-based "vs entry" move is also available; only a FRESH price shows the move.
 */
export function priceQualifier(
  quote: Pick<LiveQuote, 'stale'>,
  call: Pick<CallVsLive, 'move_since_call_pct'> | null,
): string | undefined {
  if (quote.stale) return ' · not current'
  if (call) return ` ${pctLabel(call.move_since_call_pct)} vs entry`
  return undefined
}

/**
 * The provenance line for the live-price tooltip. Names the feed that actually answered — CLAUDE.md §5:
 * a web-sourced number carries its source and is labelled indicative/unverified — instead of a generic
 * "public market-data source", since the payload records which feed it was.
 */
export function priceProvenance(source: LiveQuote['source']): string {
  const name = source === 'cnbc' ? 'CNBC' : 'a public market-data source'
  return `An indicative, unverified quote from ${name} — not from a filing, and not checked against one.`
}

/**
 * Which run root a live-quote refresh should re-base against. An explicitly supplied root (e.g. the run
 * that JUST finished, handed in by the run-done handler) wins over the store's current `runRoot`, which a
 * concurrent manifest callback may not have updated yet — so the banner never re-bases the new run's call
 * against the previous run's entry price. Falls back to the store's current, then undefined.
 */
export function preferRunRoot(explicit?: string | null, current?: string | null): string | undefined {
  return explicit ?? current ?? undefined
}
