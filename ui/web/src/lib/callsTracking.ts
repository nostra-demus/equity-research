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
  const formatted = Math.abs(value).toFixed(1)
  if (formatted === '0.0') return '0.0%'
  return `${value > 0 ? '+' : '−'}${formatted}%`
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

export function callReturnValue(call: CallSummary, value: number | null | undefined): number | null {
  if (!finite(value)) return null
  return (call.basket || '').trim().toLowerCase() === 'short' ? -value : value
}

export function latestCompletedReview(timeline: CallTimelineEntry[]): CallTimelineEntry | null {
  const completed = timeline.filter((row) => row.status === 'done')
  if (!completed.length) return null
  return completed.sort((a, b) => {
    const ad = a.review_date || ''
    const bd = b.review_date || ''
    if (ad !== bd) return ad < bd ? 1 : -1
    return (b.review_file || '').localeCompare(a.review_file || '')
  })[0]
}

function situationFor(row: CallTimelineEntry | null, call: CallSummary): CallTrackingSnapshot['situation'] {
  const quality = (row?.decision_quality || '').trim().toLowerCase()
  const thesis = (row?.thesis_status || '').trim().toLowerCase()
  const detailBits = [
    row?.thesis_status ? `Thesis ${displayStatus(row.thesis_status).toLowerCase()}` : null,
    row?.thesis_delta_verdict ? `delta ${displayStatus(row.thesis_delta_verdict).toLowerCase()}` : null,
  ].filter((value): value is string => !!value)
  const fallbackDetail = call.latest_thesis_status
    ? displayStatus(call.latest_thesis_status)
    : row ? 'Review completed' : 'No reviews recorded yet'
  const detail = detailBits.join(' · ') || fallbackDetail

  const thesisRight = thesis === 'confirmed' || thesis === 'on-track'
  const thesisWrong = thesis === 'broken' || thesis === 'at-risk'
  const qualitySaysRight = quality === 'skill' || quality === 'good process / bad luck or too early'
  const qualitySaysWrong = quality === 'luck' || quality === 'genuine miss'
  if ((thesisRight && qualitySaysWrong) || (thesisWrong && qualitySaysRight)) {
    const headline = thesis === 'broken' ? 'Thesis broken'
      : thesis === 'at-risk' ? 'Thesis at risk' : 'Review fields disagree'
    return {
      headline,
      detail: `Review fields disagree: thesis ${displayStatus(thesis).toLowerCase()}, decision quality ${displayStatus(quality).toLowerCase()}`,
      tone: 'bad',
    }
  }
  if (thesis === 'broken') return { headline: 'Thesis broken', detail, tone: 'bad' }
  if (thesis === 'at-risk') return { headline: 'Thesis at risk', detail, tone: 'bad' }
  if (thesis === 'expired') {
    const expiredDetail = row?.thesis_delta_verdict
      ? `Delta ${displayStatus(row.thesis_delta_verdict).toLowerCase()}`
      : 'The recorded thesis window has ended'
    return { headline: 'Thesis expired', detail: expiredDetail, tone: 'neutral' }
  }
  if (quality === 'skill') return { headline: 'Call working as intended', detail, tone: 'good' }
  if (quality === 'luck') return { headline: 'Price moved our way, but not for our reason', detail, tone: 'neutral' }
  if (quality === 'good process / bad luck or too early') {
    return { headline: 'Thesis holds; price has not followed yet', detail, tone: 'neutral' }
  }
  if (quality === 'genuine miss') return { headline: 'Call is going wrong', detail, tone: 'bad' }
  if (thesis === 'confirmed') return { headline: 'Thesis confirmed', detail, tone: 'good' }
  if (thesis === 'on-track') return { headline: 'Thesis on track', detail, tone: 'good' }
  return { headline: row ? 'Too early to score' : 'Awaiting first review', detail, tone: 'neutral' }
}

export function callTrackingSnapshot(call: CallSummary): CallTrackingSnapshot {
  const decision = call.decision || 'No rating'
  const entry = money(call.currency, call.entry_price)
  const entryPhrase = entry === 'price not recorded' ? 'with no recorded entry price' : `at ${entry}`
  const target = finite(call.implied_target) ? ` Target: ${money(call.currency, call.implied_target)}.` : ''
  const latest = latestCompletedReview(call.timeline)
  const observedReturn = callReturnValue(call, latest?.absolute_return_pct)
  const benchmarkDelta = callReturnValue(call, latest?.benchmark_relative_return_pct)

  const checkpoint = latest ? {
    label: `${windowLabel(latest.window)} check · ${humanDate(latest.review_date || latest.due_date)}`,
    price: money(call.currency, latest.review_price),
    returnFromCall: observedReturn != null
      ? signedPct(observedReturn)
      : 'Return not recorded',
    returnTone: observedReturn == null ? 'neutral' as const
      : observedReturn >= 0 ? 'good' as const : 'bad' as const,
    benchmarkDelta: benchmarkDelta == null ? null
      : benchmarkDelta >= 0
        ? `${Math.abs(benchmarkDelta).toFixed(1)}pp ahead of benchmark`
        : `${Math.abs(benchmarkDelta).toFixed(1)}pp behind benchmark`,
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
