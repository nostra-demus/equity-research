import type { CallActionNow, CallSummary, CallTimelineEntry } from './types'

export type TrackingTone = 'good' | 'bad' | 'neutral'

export interface CallTrackingSnapshot {
  originalSentence: string
  checkpoint: {
    label: string
    price: string
    returnLabel: string
    returnFromCall: string
    returnTone: TrackingTone
    benchmarkDelta: string | null
    sincePrevious: string
  } | null
  actionNow: { label: CallActionNow; detail: string; tone: TrackingTone }
  result: { price: string; thesis: string; headline: string; tone: TrackingTone } | null
  confidence: { label: string; detail: string; tone: TrackingTone }
  situation: {
    headline: string
    detail: string
    tone: TrackingTone
  }
  evidence: string | null
  learning: string | null
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
  const amount = value.toLocaleString('en-GB', { maximumSignificantDigits: 15 })
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
  const basket = (call.basket || '').trim().toLowerCase()
  return basket === 'short' || basket === 'rejected' ? -value : value
}

export function latestCompletedReview(timeline: CallTimelineEntry[]): CallTimelineEntry | null {
  return completedReviews(timeline)[0] || null
}

function reviewVersion(row: CallTimelineEntry): number {
  const match = /_v(\d+)\.json$/i.exec(row.review_file || '')
  return match ? Number(match[1]) : 1
}

function reviewWindowRank(row: CallTimelineEntry): number {
  const fixed: Record<string, number> = { '30d': 30, '90d': 90, '180d': 180, '365d': 365, '24m': 730, '36m': 1095, 'ad-hoc': 100000, 'post-mortem': 200000 }
  return fixed[row.window.trim().toLowerCase()] ?? 50000
}

function completedReviews(timeline: CallTimelineEntry[]): CallTimelineEntry[] {
  const byCheckpoint = new Map<string, CallTimelineEntry>()
  for (const row of timeline) {
    if (row.status !== 'done') continue
    const key = `${row.review_date || row.due_date || ''}|${row.window.trim().toLowerCase()}`
    const prior = byCheckpoint.get(key)
    if (!prior || reviewVersion(row) > reviewVersion(prior)
      || (reviewVersion(row) === reviewVersion(prior) && (row.review_file || '') > (prior.review_file || ''))) byCheckpoint.set(key, row)
  }
  return [...byCheckpoint.values()].sort((a, b) => {
    const ad = a.review_date || ''
    const bd = b.review_date || ''
    if (ad !== bd) return ad < bd ? 1 : -1
    if (reviewWindowRank(a) !== reviewWindowRank(b)) return reviewWindowRank(b) - reviewWindowRank(a)
    if (reviewVersion(a) !== reviewVersion(b)) return reviewVersion(b) - reviewVersion(a)
    return (b.review_file || '').localeCompare(a.review_file || '')
  })
}

const ACTIONS = new Set<CallActionNow>(['Hold', 'Add', 'Exit', 'Stay away', 'Keep watching'])
function actionNow(call: CallSummary, row: CallTimelineEntry | null): CallTrackingSnapshot['actionNow'] {
  const explicit = row?.action_now?.label
  const explicitReason = (row?.action_now?.reason || '').trim()
  if (explicit && ACTIONS.has(explicit) && explicitReason) {
    return { label: explicit, detail: explicitReason, tone: explicit === 'Exit' || explicit === 'Stay away' ? 'bad' : explicit === 'Add' ? 'good' : 'neutral' }
  }
  const decision = (call.decision || '').trim().toLowerCase()
  const basket = (call.basket || '').trim().toLowerCase()
  const thesis = (row?.thesis_status || '').trim().toLowerCase()
  const quality = (row?.decision_quality || '').trim().toLowerCase()
  const broken = thesis === 'broken' || thesis === 'at-risk' || quality === 'genuine miss'
  const working = thesis === 'confirmed' || thesis === 'on-track' || quality === 'skill'
  const inferred = row ? 'Conservative read of the latest review; no separate action was recorded.' : 'No review action has been recorded yet.'
  if (basket === 'short') return { label: broken ? 'Exit' : 'Hold', detail: inferred, tone: broken ? 'bad' : 'neutral' }
  if (['strong buy', 'buy', 'starter position only'].includes(decision) || basket === 'selected') {
    return { label: broken ? 'Exit' : 'Hold', detail: inferred, tone: broken ? 'bad' : 'neutral' }
  }
  if (decision === 'avoid' || basket === 'rejected') {
    return { label: broken ? 'Keep watching' : 'Stay away', detail: inferred, tone: broken ? 'neutral' : 'bad' }
  }
  if (decision === 'watchlist') {
    return { label: working ? 'Stay away' : 'Keep watching', detail: inferred, tone: working ? 'bad' : 'neutral' }
  }
  return { label: 'Keep watching', detail: row ? inferred : 'No review action recorded yet.', tone: 'neutral' }
}

function firstSentence(value?: string | null): string | null {
  const text = (value || '').replace(/\s+/g, ' ').trim()
  if (!text) return null
  const sentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || text
  return sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}…` : sentence
}

function resultFor(call: CallSummary, row: CallTimelineEntry | null): CallTrackingSnapshot['result'] {
  if (!row) return null
  const rawReturn = finite(row.absolute_return_pct) ? row.absolute_return_pct : null
  const price = rawReturn == null ? 'Price result not recorded.'
    : Math.abs(rawReturn).toFixed(1) === '0.0' ? 'Price was flat.'
      : `Price ${rawReturn > 0 ? 'rose' : 'fell'} ${Math.abs(rawReturn).toFixed(1)}%.`
  const decision = call.frozen_call?.decision || call.decision || 'call'
  const quality = (row.decision_quality || '').trim().toLowerCase()
  const status = displayStatus(row.thesis_status).toLowerCase()
  if (quality === 'skill') return { price, thesis: `The ${decision} call was right for the reason Nostra recorded.`, headline: `${price} The ${decision} call worked.`, tone: 'good' }
  if (quality === 'genuine miss') return { price, thesis: `The ${decision} call was wrong. The thesis is ${status}.`, headline: `${price} The ${decision} call failed.`, tone: 'bad' }
  if (quality === 'luck') return { price, thesis: `The price helped, but the ${decision} call was right for the wrong reason.`, headline: `${price} The thesis did not earn the result.`, tone: 'neutral' }
  if (quality === 'good process / bad luck or too early') return { price, thesis: `The thesis still holds, but the price has not followed yet.`, headline: `${price} It is too early to call the process wrong.`, tone: 'neutral' }
  return { price, thesis: row.thesis_status ? `The thesis is ${status}; decision quality is not yet scored.` : 'The thesis result is not yet scored.', headline: `${price} Thesis result not yet settled.`, tone: 'neutral' }
}

function confidenceFor(call: CallSummary, row: CallTimelineEntry | null): CallTrackingSnapshot['confidence'] {
  const before = finite(call.frozen_call?.confidence) ? call.frozen_call!.confidence
    : finite(call.confidence) ? call.confidence : null
  const copiedBefore = finite(row?.confidence_update?.before) ? row!.confidence_update!.before : null
  const after = finite(row?.confidence_update?.after) ? row!.confidence_update!.after : null
  const label = `${before == null ? 'Not recorded' : before} → ${after == null ? 'not re-scored' : after}`
  const tone: TrackingTone = after == null || before == null ? 'neutral' : after > before ? 'good' : after < before ? 'bad' : 'neutral'
  const reason = row?.confidence_update?.change_reason
    || (after != null ? 'This review did not explain the confidence change.' : row ? 'This review did not record a new confidence score.' : 'No review has re-scored confidence yet.')
  const mismatch = copiedBefore != null && before != null && copiedBefore !== before
    ? ` Review copied ${copiedBefore} as the prior score; frozen original ${before} is authoritative.` : ''
  return { label, detail: `${reason}${mismatch}`, tone }
}

function namedWatchItem(row: CallTimelineEntry | null): string | null {
  const items = Array.isArray(row?.watch_items) ? row!.watch_items! : []
  if (!items.length) return null
  const scored = items.map((item, index) => {
    const lower = item.toLowerCase()
    let score = 0
    if (/\b(q[1-4]|h[12]|fy\d{2,4}|results?|earnings|sales|pre-sales|backlog|margin|maturity|dividend|filing)\b/.test(lower)) score += 5
    if (/\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/.test(lower)) score += 3
    if (lower.includes('/research:')) score -= 4
    return { item, score, index }
  })
  const item = scored.sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item || null
  return item && item.length > 170 ? `${item.slice(0, 167).trimEnd()}…` : item
}

function situationFor(row: CallTimelineEntry | null, call: CallSummary): CallTrackingSnapshot['situation'] {
  const quality = (row?.decision_quality || '').trim().toLowerCase()
  const thesis = (row?.thesis_status || '').trim().toLowerCase()
  const delta = (row?.thesis_delta_verdict || '').trim().toLowerCase()
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
  const thesisResolved = thesis === 'confirmed' || thesis === 'broken' || thesis === 'expired'
  const qualitySaysRight = quality === 'skill' || quality === 'good process / bad luck or too early'
  const qualitySaysWrong = quality === 'luck' || quality === 'genuine miss'
  const qualityResolved = quality === 'skill' || quality === 'luck' || quality === 'genuine miss'
  const deltaSaysRight = delta === 'strengthened'
  const deltaSaysWrong = delta === 'weakened' || delta === 'broken'
  const deltaTooEarly = delta === 'too_early'
  const fieldsDisagree = (thesisRight && qualitySaysWrong)
    || (thesisWrong && qualitySaysRight)
    || (deltaSaysWrong && (thesisRight || qualitySaysRight))
    || (deltaSaysRight && (thesisWrong || qualitySaysWrong))
    || (deltaTooEarly && (thesisResolved || qualityResolved))
    || (thesis === 'expired' && quality === 'genuine miss')
  if (fieldsDisagree) {
    const headline = thesis === 'broken' || delta === 'broken' ? 'Thesis broken'
      : thesis === 'at-risk' ? 'Thesis at risk' : 'Review fields disagree'
    const fields = [
      thesis ? `thesis ${displayStatus(thesis).toLowerCase()}` : null,
      quality ? `decision quality ${displayStatus(quality).toLowerCase()}` : null,
      delta ? `delta ${displayStatus(delta).toLowerCase()}` : null,
    ].filter((value): value is string => !!value)
    return {
      headline,
      detail: `Review fields disagree: ${fields.join(', ')}`,
      tone: 'bad',
    }
  }
  if (thesis === 'broken' || delta === 'broken') return { headline: 'Thesis broken', detail, tone: 'bad' }
  if (thesis === 'at-risk') return { headline: 'Thesis at risk', detail, tone: 'bad' }
  if (delta === 'weakened') return { headline: 'Thesis weakened', detail, tone: 'bad' }
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
  if (delta === 'too_early') return { headline: 'Too early to score', detail, tone: 'neutral' }
  if (delta === 'strengthened') return { headline: 'Thesis strengthened', detail, tone: 'good' }
  if (thesis === 'confirmed') return { headline: 'Thesis confirmed', detail, tone: 'good' }
  if (thesis === 'on-track') return { headline: 'Thesis on track', detail, tone: 'good' }
  return { headline: row ? 'Too early to score' : 'Awaiting first review', detail, tone: 'neutral' }
}

export function callTrackingSnapshot(call: CallSummary): CallTrackingSnapshot {
  const decision = call.frozen_call?.decision || call.decision || 'No rating'
  const entry = money(call.frozen_call?.currency || call.currency, call.frozen_call?.entry_price ?? call.entry_price)
  const entryPhrase = entry === 'price not recorded' ? 'with no recorded entry price' : `at ${entry}`
  const target = finite(call.implied_target) ? ` Target: ${money(call.currency, call.implied_target)}.` : ''
  const reviews = completedReviews(call.timeline)
  const latest = reviews[0] || null
  const previous = reviews[1] || null
  const observedReturn = callReturnValue(call, latest?.absolute_return_pct)
  const benchmarkDelta = callReturnValue(call, latest?.benchmark_relative_return_pct)
  const rawSincePrevious = finite(latest?.review_price) && finite(previous?.review_price) && previous.review_price !== 0
    ? ((latest.review_price - previous.review_price) / previous.review_price) * 100 : null
  const sincePrevious = callReturnValue(call, rawSincePrevious)
  const watch = namedWatchItem(latest)

  const checkpoint = latest ? {
    label: `${windowLabel(latest.window)} check · ${humanDate(latest.review_date || latest.due_date)}`,
    price: money(call.currency, latest.review_price),
    returnLabel: finite(call.entry_price) ? 'Delta from call' : 'Return at check',
    returnFromCall: observedReturn != null
      ? signedPct(observedReturn)
      : 'Return not recorded',
    returnTone: 'neutral' as const,
    benchmarkDelta: benchmarkDelta == null ? null
      : Math.abs(benchmarkDelta).toFixed(1) === '0.0'
        ? 'even with benchmark'
        : benchmarkDelta > 0
        ? `${Math.abs(benchmarkDelta).toFixed(1)}pp ahead of benchmark`
        : `${Math.abs(benchmarkDelta).toFixed(1)}pp behind benchmark`,
    sincePrevious: sincePrevious == null ? (previous ? 'Change since previous review not available' : 'First review — no previous-review delta yet') : `${signedPct(sincePrevious)} since previous review`,
  } : null

  const next = call.next_checkpoint
  const structuredNext = latest?.next_check
  return {
    originalSentence: `Nostra rated it ${decision} on ${humanDate(call.frozen_call?.decision_date || call.decision_date)} ${entryPhrase}.${target}`,
    checkpoint,
    actionNow: actionNow(call, latest),
    result: resultFor(call, latest),
    confidence: confidenceFor(call, latest),
    situation: situationFor(latest, call),
    evidence: latest?.memo_delta_summary || call.latest_review_summary || null,
    learning: latest?.learning?.why_right_or_wrong || latest?.learning?.rule_for_future || firstSentence(latest?.lessons?.[0]) || null,
    nextCheck: structuredNext ? {
      date: structuredNext.date ? humanDate(structuredNext.date) : 'Date not proven',
      detail: structuredNext.label || structuredNext.trigger || 'Named review check',
      tone: 'neutral',
    } : next ? {
      date: humanDate(next.due_date),
      detail: watch ? `${windowLabel(next.window)} review · Watch: ${watch}` : `${windowLabel(next.window)} review · ${next.status}`,
      tone: next.status === 'overdue' ? 'bad' : 'neutral',
    } : null,
  }
}
