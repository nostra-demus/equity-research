import type { Sufficiency } from './types'

export function sufficiencyColor(s: Sufficiency): string {
  if (s === 'Sufficient') return 'var(--accent)'
  if (s === 'Partial') return '#9a8048'
  return '#3f3f47'
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
export function resetIn(resetsAt?: number): string | null {
  if (!resetsAt) return null
  const ms = resetsAt * 1000 - Date.now()
  if (ms <= 0) return 'now'
  const mins = ms / 60000
  if (mins < 60) return `${Math.max(1, Math.round(mins))}m`
  const hours = mins / 60
  if (hours < 48) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
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
      return '#50505a'
    default:
      return '#2c2c32'
  }
}
