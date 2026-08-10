export type CommodityHorizonStatus = 'assessable' | 'not_assessable'

export interface CommodityEvidenceLink {
  conclusion: string
  clusterIds: string[]
  sourceVintageIds: string[]
}

export interface CommodityHorizonCard {
  name: 'tactical' | 'strategic'
  status: CommodityHorizonStatus
  classification: 'positive' | 'mixed' | 'negative' | 'not_assessable'
  horizonDays: number | null
  targetDate: string | null
  confidence: number
  implementableReturnPct: number | null
  lossProbabilityPct: number | null
  downsidePct: number | null
  riskReward: number | 'unbounded' | null
  cashHurdlePct: number | null
  notAssessableReason: string | null
  evidenceLinks: CommodityEvidenceLink[]
}

export interface CommodityDecisionProjection {
  action: string
  targetExposureRiskUnits: number | null
  confidence: number
  priceFreshness: string | null
  evidenceFreshness: string | null
  coverageComplete: boolean | null
  conflict: boolean
  horizons: [CommodityHorizonCard, CommodityHorizonCard]
}

const finite = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
const EXPOSURE_BY_ACTION: Record<string, number | null> = {
  Buy: 1, Hold: 0.5, Trim: 0.25, Avoid: 0, 'Research More': null,
}
const ACTION_MATRIX: Record<string, string> = {
  'positive/positive': 'Buy', 'positive/mixed': 'Hold', 'positive/negative': 'Trim',
  'mixed/positive': 'Hold', 'mixed/mixed': 'Hold', 'mixed/negative': 'Avoid',
  'negative/positive': 'Trim', 'negative/mixed': 'Trim', 'negative/negative': 'Avoid',
}
const confidence = (value: unknown): number | null => {
  const parsed = finite(value)
  return parsed != null && parsed >= 0 && parsed <= 100 ? parsed : null
}

function effectiveAction(value: any): string | null {
  const original = typeof value.action === 'string' && value.action in EXPOSURE_BY_ACTION ? value.action : null
  if (!original) return null
  if (Object.prototype.hasOwnProperty.call(value, 'post_mortem_action')
    && !(typeof value.post_mortem_action === 'string' && value.post_mortem_action in EXPOSURE_BY_ACTION)) return null
  const candidate = typeof value.post_mortem_action === 'string' && value.post_mortem_action in EXPOSURE_BY_ACTION
    ? value.post_mortem_action : null
  if (!candidate || candidate === original) return original
  // A pre-mortem may abstain or reduce exposure, never upgrade it. Research More can only remain
  // abstinent or be forced to Avoid by a critical risk.
  if (candidate === 'Research More' || candidate === 'Avoid') return candidate
  const originalExposure = EXPOSURE_BY_ACTION[original]
  const candidateExposure = EXPOSURE_BY_ACTION[candidate]
  return originalExposure != null && candidateExposure != null && candidateExposure <= originalExposure
    ? candidate : original
}

function horizon(value: any, name: 'tactical' | 'strategic'): CommodityHorizonCard | null {
  if (!value || value.horizon !== name || !['assessable', 'not_assessable'].includes(value.status)) return null
  const links: CommodityEvidenceLink[] = Array.isArray(value.evidence_links)
    ? value.evidence_links.flatMap((link: any) => {
      if (!link || typeof link.conclusion !== 'string' || !Array.isArray(link.cluster_ids) || !Array.isArray(link.source_vintage_ids)) return []
      return [{
        conclusion: link.conclusion,
        clusterIds: link.cluster_ids.filter((id: unknown): id is string => typeof id === 'string'),
        sourceVintageIds: link.source_vintage_ids.filter((id: unknown): id is string => typeof id === 'string'),
      }]
    })
    : []
  const status = value.status as CommodityHorizonStatus
  const horizonDays = finite(value.horizon_days)
  const horizonRange = name === 'tactical' ? [30, 92] : [182, 548]
  const targetDate = typeof value.target_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.target_date)
    && !Number.isNaN(Date.parse(`${value.target_date}T00:00:00Z`)) ? value.target_date : null
  const horizonConfidence = confidence(value.confidence)
  if (horizonDays == null || !Number.isInteger(horizonDays) || horizonDays < horizonRange[0] || horizonDays > horizonRange[1]
    || !targetDate || horizonConfidence == null) return null
  if (status === 'assessable') {
    const loss = finite(value.loss_probability_pct)
    const downside = finite(value.downside_pct)
    const riskReward = value.risk_reward === 'unbounded' ? value.risk_reward : finite(value.risk_reward)
    if (!['positive', 'mixed', 'negative'].includes(value.classification)
      || finite(value.expected_return_components_pct?.implementable_return_pct) == null
      || loss == null || loss < 0 || loss > 100 || downside == null || downside > 0
      || riskReward == null || (typeof riskReward === 'number' && riskReward < 0)
      || finite(value.cash_hurdle?.return_pct) == null || links.length === 0
      || links.some((link) => !link.conclusion.trim() || link.clusterIds.length === 0 || link.sourceVintageIds.length === 0)) return null
  } else if (value.classification !== 'not_assessable' || horizonConfidence !== 0
    || typeof value.not_assessable_reason !== 'string' || !value.not_assessable_reason.trim()) return null
  return {
    name,
    status,
    classification: ['positive', 'mixed', 'negative', 'not_assessable'].includes(value.classification)
      ? value.classification : 'not_assessable',
    horizonDays,
    targetDate,
    confidence: horizonConfidence,
    implementableReturnPct: status === 'assessable' ? finite(value.expected_return_components_pct?.implementable_return_pct) : null,
    lossProbabilityPct: status === 'assessable' ? finite(value.loss_probability_pct) : null,
    downsidePct: status === 'assessable' ? finite(value.downside_pct) : null,
    riskReward: status === 'assessable' && (value.risk_reward === 'unbounded' || finite(value.risk_reward) != null)
      ? value.risk_reward : null,
    cashHurdlePct: status === 'assessable' ? finite(value.cash_hurdle?.return_pct) : null,
    notAssessableReason: status === 'not_assessable' && typeof value.not_assessable_reason === 'string'
      ? value.not_assessable_reason : null,
    evidenceLinks: links,
  }
}

/** Action-first UI model. Deliberately has no blended expected-return field. */
export function commodityDecisionProjection(value: any): CommodityDecisionProjection | null {
  if (!value || value.swarm !== 'commodity' || !value.forecast_horizons || typeof value.action !== 'string') return null
  const tactical = horizon(value.forecast_horizons.tactical, 'tactical')
  const strategic = horizon(value.forecast_horizons.strategic, 'strategic')
  if (!tactical || !strategic) return null
  if (value.critical_risk_override != null
    && (typeof value.critical_risk_override !== 'object' || typeof value.critical_risk_override.applied !== 'boolean')) return null
  const criticalAvoid = value.critical_risk_override?.applied === true
  const mechanicalAction = criticalAvoid ? 'Avoid'
    : tactical.status === 'not_assessable' || strategic.status === 'not_assessable' ? 'Research More'
      : ACTION_MATRIX[`${tactical.classification}/${strategic.classification}`]
  if (!mechanicalAction || value.action !== mechanicalAction) return null
  const action = effectiveAction(value)
  if (!action) return null
  if (Object.prototype.hasOwnProperty.call(value, 'post_review_confidence_score')
    && confidence(value.post_review_confidence_score) == null) return null
  const expectedExposure = EXPOSURE_BY_ACTION[action]
  const confidenceCandidates = [
    confidence(tactical.confidence), confidence(strategic.confidence), confidence(value.forecast_confidence),
    confidence(value.confidence), confidence(value.post_review_confidence_score),
  ].filter((candidate): candidate is number => candidate != null)
  return {
    action,
    targetExposureRiskUnits: expectedExposure,
    confidence: confidenceCandidates.length ? Math.min(...confidenceCandidates) : 0,
    priceFreshness: typeof value.current_price?.as_of === 'string' ? value.current_price.as_of : null,
    evidenceFreshness: typeof value.required_series_coverage?.generated_at === 'string' ? value.required_series_coverage.generated_at : null,
    coverageComplete: typeof value.required_series_coverage?.complete === 'boolean' ? value.required_series_coverage.complete : null,
    conflict: tactical.classification !== strategic.classification,
    horizons: [tactical, strategic],
  }
}
