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
