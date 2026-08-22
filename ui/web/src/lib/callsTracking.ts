import type { CallSummary, CallTimelineEntry } from './types'

export type TrackingTone = 'good' | 'bad' | 'neutral'

export interface CallTrackingSnapshot {
  originalSentence: string
  checkpoint: {
    label: string
    price: string
    returnFromCall: string
    returnTone: TrackingTone
    benchmarkDelta: string | null
  } | null
  situation: {
    headline: string
    detail: string
    tone: TrackingTone
  }
  evidence: string | null
  nextCheck: {
    date: string
    detail: string
    tone: TrackingTone
  } | null
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function humanDate(value?: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date not recorded'
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return 'date not recorded'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(parsed)
}

function money(currency: string | null | undefined, value: number | null | undefined): string {
  if (!finite(value)) return 'price not recorded'
  const amount = value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
  return `${(currency || '').trim()} ${amount}`.trim()
}

function signedPct(value: number): string {
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(1)}%`
}

function windowLabel(window: string): string {
  const days = /^(\d+)d$/i.exec(window)
  if (days) return `${days[1]}-day`
  const months = /^(\d+)m$/i.exec(window)
  if (months) return `${months[1]}-month`
  return window === 'ad-hoc' ? 'Ad-hoc' : window
}

function displayStatus(value?: string | null): string {
  if (!value) return 'Awaiting first review'
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function latestCompleted(timeline: CallTimelineEntry[]): CallTimelineEntry | null {
  return [...timeline].reverse().find((row) => row.status === 'done') || null
}

function situationFor(row: CallTimelineEntry | null, call: CallSummary): CallTrackingSnapshot['situation'] {
  const quality = (row?.decision_quality || '').trim().toLowerCase()
  const detailBits = [
    row?.thesis_status ? `Thesis ${displayStatus(row.thesis_status).toLowerCase()}` : null,
    row?.thesis_delta_verdict ? `delta ${displayStatus(row.thesis_delta_verdict).toLowerCase()}` : null,
  ].filter((value): value is string => !!value)
  const fallbackDetail = call.latest_thesis_status
    ? displayStatus(call.latest_thesis_status)
    : row ? 'Review completed' : 'No reviews recorded yet'
  const detail = detailBits.join(' · ') || fallbackDetail

  if (quality === 'skill') return { headline: 'Call working as intended', detail, tone: 'good' }
  if (quality === 'luck') return { headline: 'Price moved our way, but not for our reason', detail, tone: 'neutral' }
  if (quality === 'good process / bad luck or too early') {
    return { headline: 'Thesis holds; price has not followed yet', detail, tone: 'neutral' }
  }
  if (quality === 'genuine miss') return { headline: 'Call is going wrong', detail, tone: 'bad' }
  if (row?.thesis_status === 'confirmed') return { headline: 'Thesis confirmed', detail, tone: 'good' }
  if (row?.thesis_status === 'at-risk' || row?.thesis_status === 'broken') {
    return { headline: row.thesis_status === 'broken' ? 'Thesis broken' : 'Thesis at risk', detail, tone: 'bad' }
  }
  if (row?.thesis_status === 'on-track') return { headline: 'Thesis on track', detail, tone: 'good' }
  return { headline: row ? 'Too early to score' : 'Awaiting first review', detail, tone: 'neutral' }
}

export function callTrackingSnapshot(call: CallSummary): CallTrackingSnapshot {
  const decision = call.decision || 'No rating'
  const entry = money(call.currency, call.entry_price)
  const entryPhrase = entry === 'price not recorded' ? 'with no recorded entry price' : `at ${entry}`
  const target = finite(call.implied_target) ? ` Target: ${money(call.currency, call.implied_target)}.` : ''
  const latest = latestCompleted(call.timeline)

  const checkpoint = latest ? {
    label: `${windowLabel(latest.window)} check · ${humanDate(latest.review_date || latest.due_date)}`,
    price: money(call.currency, latest.review_price),
    returnFromCall: finite(latest.absolute_return_pct)
      ? signedPct(latest.absolute_return_pct)
      : 'Return not recorded',
    returnTone: !finite(latest.absolute_return_pct) ? 'neutral' as const
      : latest.absolute_return_pct >= 0 ? 'good' as const : 'bad' as const,
    benchmarkDelta: !finite(latest.benchmark_relative_return_pct) ? null
      : latest.benchmark_relative_return_pct >= 0
        ? `${Math.abs(latest.benchmark_relative_return_pct).toFixed(1)}pp ahead of benchmark`
        : `${Math.abs(latest.benchmark_relative_return_pct).toFixed(1)}pp behind benchmark`,
  } : null

  const next = call.next_checkpoint
  return {
    originalSentence: `Nostra said ${decision} on ${humanDate(call.decision_date)} ${entryPhrase}.${target}`,
    checkpoint,
    situation: situationFor(latest, call),
    evidence: latest?.memo_delta_summary || call.latest_review_summary || null,
    nextCheck: next ? {
      date: humanDate(next.due_date),
      detail: `${windowLabel(next.window)} review · ${next.status}`,
      tone: next.status === 'overdue' ? 'bad' : 'neutral',
    } : null,
  }
}
