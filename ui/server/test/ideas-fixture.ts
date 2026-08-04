import { eventIdFor } from '../src/news/normalize'
import { ideaId, ideaVersion, type SurfacedIdea } from '../src/news/ideas/ideas-store'
import type { IdeaDirection } from '../src/news/ideas/surface-ideas'

/** Complete on-disk lead fixture. Tests that corrupt one field start from an otherwise valid contract. */
export function validIdeaSnapshot(
  ticker = 'TEST',
  direction: IdeaDirection = 'long',
  patch: Partial<SurfacedIdea> = {},
): SurfacedIdea {
  const upper = ticker.toUpperCase()
  const sourceUrl = `https://exchange.test/${encodeURIComponent(upper.toLowerCase())}`
  const sourceEventId = eventIdFor(`${upper} files a material update`, sourceUrl)
  const base: SurfacedIdea = {
    idea_id: ideaId(upper, direction),
    idea_version: '',
    idea_version_started_at: '2026-08-03T05:30:00Z',
    ticker: upper,
    company: `${upper} Corp`,
    exchange: null,
    ticker_verified: false,
    listing_verified: false,
    liquidity_verified: false,
    listing_verification_source: null,
    direction,
    pair_with: direction === 'pair' ? 'PAIR' : null,
    reason: `${upper} has a direct earnings catalyst`,
    why_now: 'Results are due within the next month',
    conviction: 70,
    conviction_basis: 'pre_edge_proxy',
    trade_score: 62,
    trade_score_basis: 'evidence_gate_v1',
    trade_score_breakdown: {
      evidence: 25, impact: 20, specificity: 7, timing: 10,
      expression: 0, corroboration: 0, learning_adjustment: 0,
    },
    trade_readiness: 'watch_only',
    missing_checks: ['verified listing', 'live liquidity'],
    learning: {
      resolved: 0, positive: 0, negative: 0, neutral: 0,
      adjustment: 0, basis: 'not_enough_outcomes', evidenceIds: [],
    },
    priced_in: 'unknown',
    thesis_type: 'company_specific',
    source_event_ids: [sourceEventId],
    source_headlines: [`${upper} files a material update`],
    source_headline: `${upper} files a material update`,
    source_url: sourceUrl,
    source_name: 'Exchange',
    materiality_max: 80,
    newest_source_at: '2026-08-03T05:00:00Z',
    prior_coverage: null,
    surfaced_at: '2026-08-03T05:30:00Z',
    updated_at: '2026-08-03T06:00:00Z',
    decay_at: '2026-08-04T17:00:00Z',
    status: 'live',
    promoted_signal_id: null,
  }
  const value = { ...base, ...patch }
  if (!Object.prototype.hasOwnProperty.call(patch, 'idea_id')) {
    value.idea_id = ideaId(value.ticker, value.direction)
  }
  if (!Object.prototype.hasOwnProperty.call(patch, 'idea_version')) {
    value.idea_version = ideaVersion({
      ticker: value.ticker,
      direction: value.direction,
      pairWith: value.pair_with,
      thesisType: value.thesis_type,
      reason: value.reason,
      whyNow: value.why_now,
      sourceEventIds: value.source_event_ids,
      ...(Object.prototype.hasOwnProperty.call(value, 'origin_type')
        ? { originType: value.origin_type, sourceThemes: value.source_themes }
        : {}),
    })
  }
  return value
}
