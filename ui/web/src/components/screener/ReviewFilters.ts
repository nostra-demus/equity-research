// The batch-review queue's filter state — a SIBLING to FeedFilterState (FeedFilters.tsx), not an
// extension of it: review-only concepts like "portfolio companies" have no business leaking into the
// main wire's filter bar. Several of these are stated approximations (the codebase has no per-item
// "is this routine" flag or brokerage holdings list cheap enough to check for a whole day's queue) —
// each is called out inline and should be shown as a tooltip wherever the control renders.
import type { FeedItem } from '../../lib/types'

export interface ReviewFilterState {
  highScore: boolean // triage_score >= HIGH_SCORE_THRESHOLD (same cutoff the wire's own color tone uses)
  routineFilings: boolean // APPROXIMATION: relevance === 'relevant_non_material' — a true per-item "routine
  // filing" flag only exists via on-demand enrichment, too expensive to fetch for a whole day's queue
  genericMedia: boolean // source_tier is one of the two lowest §4 tiers (News / Unconfirmed)
  lowConfidence: boolean // band === 'drop'
  portfolioCompanies: boolean // APPROXIMATION: companies[].ticker intersects the fetched coveredTickers set
  // (tickers with an analyses/ folder) — this codebase has no separate brokerage holdings list
  sourceTiers: Set<string> // direct multi-select on the source_tier label — no approximation
}

export const HIGH_SCORE_THRESHOLD = 70
const GENERIC_MEDIA_TIERS = new Set(['News', 'Unconfirmed'])

export const emptyReviewFilters = (): ReviewFilterState => ({
  highScore: false,
  routineFilings: false,
  genericMedia: false,
  lowConfidence: false,
  portfolioCompanies: false,
  sourceTiers: new Set(),
})

export const reviewFiltersActive = (f: ReviewFilterState): boolean =>
  f.highScore || f.routineFilings || f.genericMedia || f.lowConfidence || f.portfolioCompanies || f.sourceTiers.size > 0

export function matchesReviewFilters(it: FeedItem, f: ReviewFilterState, coveredTickers: Set<string>): boolean {
  if (f.highScore && !(it.triage_score >= HIGH_SCORE_THRESHOLD)) return false
  if (f.routineFilings && it.relevance !== 'relevant_non_material') return false
  if (f.genericMedia && !GENERIC_MEDIA_TIERS.has(it.source_tier || '')) return false
  if (f.lowConfidence && it.band !== 'drop') return false
  if (f.portfolioCompanies && !(it.companies || []).some((c) => c.ticker && coveredTickers.has(c.ticker.toUpperCase()))) return false
  if (f.sourceTiers.size > 0 && !f.sourceTiers.has(it.source_tier || '')) return false
  return true
}
