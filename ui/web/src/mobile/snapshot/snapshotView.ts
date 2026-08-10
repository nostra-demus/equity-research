// The one-glance snapshot card's data, derived PURELY so every per-swarm shape is testable. The three
// swarms record verdicts differently — verified on disk, not assumed:
//   research  — decision_record: decision + confidence_score + entry_price (+ /api/quote for "now")
//   screener  — the board index: thesis headline + routing + edge score (signals have NO decision
//               record at all; the generic subjects endpoint returns null verdicts for every one)
//   commodity — action verdict (pre-mortem-capped server-side) + current_price + four state fields
// Rule (deploy skew §5 + §3): every field is positively matched; an absent field is OMITTED from the
// card, never invented, never defaulted.
import { resolveConfidence, resolveVerdict, verdictIsCapped } from '../../lib/format'
import { commodityDecisionProjection } from '../../lib/commodityDecision'
import type { BoardSignal, BoardThesis, QuoteRead, SwarmSubjectSummary } from '../../lib/types'

export interface ResearchSnap {
  kind: 'research'
  verdict?: string
  confidence?: number
  /** the record's raw confidence when a post-red-team review changed it — shown as "(NN before cap)" */
  confidenceRaw?: number
  capped?: boolean
  entry?: number
  currency?: string
  live?: number
  /** When the price is a settled last close rather than a live tick (mirrors desktop's "Last close" label). */
  liveIsClose?: boolean
  /** Exchange-delayed feed — nothing on screen may claim to be real-time. */
  liveDelayed?: boolean
  /** A real price, but not a fresh one: the last refresh failed. Desktop suppresses movePct in this case. */
  liveStale?: boolean
  liveAsOf?: string
  movePct?: number
}
export interface SignalSnap {
  kind: 'signal'
  headline?: string
  routing?: string
  edge?: number
}
export interface CommoditySnap {
  kind: 'commodity'
  verdict?: string
  confidence?: number
  /** the record's raw confidence when a red-team cap changed it — shown as "(NN before cap)" */
  confidenceRaw?: number
  capped?: boolean
  price?: number
  priceUnit?: string
  asOf?: string
  targetExposure?: number | null
  coverageComplete?: boolean
  conflict?: boolean
  horizons?: Array<{ name: string; classification: string; implementableReturnPct: number | null; targetDate: string | null }>
  chips: string[]
}
export interface NeverRunSnap {
  kind: 'never-run'
  note: string
}
export type Snapshot = ResearchSnap | SignalSnap | CommoditySnap | NeverRunSnap

const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

/** research: the frozen decision record + the live quote read; either half may be missing */
export function researchSnapshot(decision: any, quote: QuoteRead | null): ResearchSnap | NeverRunSnap {
  if (!decision || typeof decision !== 'object') return { kind: 'never-run', note: 'No finished run yet' }
  const snap: ResearchSnap = { kind: 'research' }
  // EFFECTIVE verdict/confidence — the run's own post-mortem cap / post-review score wins over the
  // synthesizer's original when one applies (same client-side resolver desktop surfaces use), so a call
  // the engine's own red-team downgraded can never render on the phone as the original, uncapped one.
  const v = resolveVerdict(decision)
  if (v) snap.verdict = v
  if (verdictIsCapped(decision)) snap.capped = true
  const { value: c, isPostReview } = resolveConfidence(decision)
  if (c != null) {
    snap.confidence = c
    if (isPostReview) {
      snap.capped = true
      const raw = num(decision.confidence_score)
      if (raw != null && raw !== c) snap.confidenceRaw = raw
    }
  }
  const e = num(decision.entry_price)
  if (e != null) snap.entry = e
  const cur = str(decision.currency)
  if (cur) snap.currency = cur
  const live = num(quote?.quote?.price)
  if (live != null) {
    snap.live = live
    if (quote?.quote?.as_of_is_close === true) snap.liveIsClose = true
    if (quote?.quote?.delayed === true) snap.liveDelayed = true
    if (quote?.quote?.stale === true) snap.liveStale = true
    const asOf = str(quote?.quote?.as_of)
    if (asOf) snap.liveAsOf = asOf
    // Desktop suppresses the vs-entry move% once the price is known stale — a stale price re-based
    // against entry would show a "move" that is really just how old the cached tick is (format.ts
    // priceQualifier: `if (quote.stale) return ' · not current'`, never the move%).
    if (!snap.liveStale) {
      const mv = num(quote?.call?.move_since_call_pct)
      if (mv != null) snap.movePct = mv
    }
  }
  return snap
}

/** screener: joined board rows — prefer the thesis headline (a signal's can be empty), live edge wins */
export function signalSnapshot(signal: BoardSignal | undefined, thesis: BoardThesis | undefined): SignalSnap | NeverRunSnap {
  if (!signal && !thesis) return { kind: 'never-run', note: 'Signal not on the board yet' }
  const snap: SignalSnap = { kind: 'signal' }
  const headline =
    str(thesis?.headline_en) ?? str(thesis?.headline) ?? str(signal?.headline_en) ?? str(signal?.headline)
  if (headline) snap.headline = headline
  const routing = str((thesis as any)?.effective_status) ?? str(thesis?.status) ?? str(signal?.status)
  if (routing) snap.routing = routing
  const edge = num(thesis?.conviction?.edge_score_live) ?? num(thesis?.edge_score)
  if (edge != null) snap.edge = edge
  return snap
}

/** commodity: the summaries row carries the CAPPED verdict/confidence (server applies post-mortem
 *  corrections); the record itself carries price + the four state fields */
export function commoditySnapshot(summary: SwarmSubjectSummary | undefined, record: any): CommoditySnap | NeverRunSnap {
  if (!summary?.hasRun) return { kind: 'never-run', note: 'No run yet — profile only' }
  const snap: CommoditySnap = { kind: 'commodity', chips: [] }
  const projection = commodityDecisionProjection(record)
  const freshInvalid = typeof record?.decision_date === 'string' && record.decision_date >= '2026-08-10' && !projection
  const v = projection?.action ?? (freshInvalid ? 'Research More' : str(summary.verdict))
  if (v) snap.verdict = v
  const c = projection?.confidence ?? (freshInvalid ? 0 : num(summary.confidence))
  if (c != null) snap.confidence = c
  if (projection ? (projection.action !== record?.action || projection.confidence !== num(record?.confidence))
    : !freshInvalid && ((summary as any).verdictIsPostMortemCapped === true || (summary as any).confidenceIsPostReview === true)) {
    snap.capped = true
    const raw = num(record?.confidence)
    if (raw != null && raw !== snap.confidence) snap.confidenceRaw = raw
  }
  const cp = record?.current_price
  const price = num(cp?.value)
  if (price != null) {
    snap.price = price
    const unit = [str(cp?.currency), str(cp?.unit)].filter(Boolean).join('/')
    if (unit) snap.priceUnit = unit
    const asOf = str(cp?.as_of)
    if (asOf) snap.asOf = asOf
  }
  for (const k of ['curve', 'balance', 'net_macro', 'positioning'] as const) {
    const val = str(record?.[k])
    if (val) snap.chips.push(k === 'net_macro' ? `macro ${val}` : val)
  }
  if (projection) {
    snap.targetExposure = projection.targetExposureRiskUnits
    if (projection.coverageComplete != null) snap.coverageComplete = projection.coverageComplete
    snap.conflict = projection.conflict
    snap.horizons = projection.horizons.map((horizon) => ({
      name: horizon.name,
      classification: horizon.classification,
      implementableReturnPct: horizon.implementableReturnPct,
      targetDate: horizon.targetDate,
    }))
  }
  return snap
}
