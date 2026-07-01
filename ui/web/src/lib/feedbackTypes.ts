// The 8 feedback types a card can be flagged with. Source of truth is the server's
// ui/server/src/screener-feedback.ts FEEDBACK_TYPES — kept as a literal duplicate here (the client
// can't import server code), with a test (feedbackTypes.test.ts) asserting the two stay in lockstep.
import { isCompanyNameClient } from './scope'
import type { FeedbackSubmitInput, FeedbackType, FeedItem } from './types'

export const FEEDBACK_TYPES: FeedbackType[] = [
  'irrelevant',
  'score_too_high',
  'score_too_low',
  'wrong_company',
  'wrong_sector',
  'duplicate_stale',
  'should_be_higher',
  'other',
]

const LABELS: Record<FeedbackType, string> = {
  irrelevant: 'Flag as irrelevant',
  score_too_high: 'Score too high',
  score_too_low: 'Score too low',
  wrong_company: 'Wrong company',
  wrong_sector: 'Wrong sector/theme',
  duplicate_stale: 'Duplicate/stale',
  should_be_higher: 'Important/should be higher',
  other: 'Other',
}

export function feedbackLabel(type: FeedbackType): string {
  return LABELS[type]
}

// Shared "snapshot this card's own visible fields" builder — used by both the per-card FeedbackMenu
// and the batch-review queue, so the two flows can never drift on what gets sent to the server.
export function feedbackInputFromItem(item: FeedItem, feedback_type: FeedbackType, reason: string): FeedbackSubmitInput {
  // Snapshot the SAME company the rail/ReviewPanel show: when companies[0] is a country/regulator/index
  // (fails isCompanyNameClient), the UI displays the FIRST entry passing isCompanyNameClient (EventRail.tsx
  // and ReviewPanel.tsx both use exactly this predicate, with no fallback), so the ledger record must pin
  // that same entry — not the raw first slot — or the saved company_name/ticker won't match what the
  // reviewer saw. When no entry passes, the UI shows no company, so we record none too (undefined).
  const company = (item.companies || []).find((c) => isCompanyNameClient(c.name))
  return {
    event_id: item.event_id,
    feedback_type,
    feedback_reason: reason || undefined,
    current_score: typeof item.triage_score === 'number' ? item.triage_score : null,
    event_title: item.headline,
    source: item.source_name,
    company_name: company?.name || undefined,
    company_ticker: company?.ticker || undefined,
    sector_theme: item.event_types?.length ? item.event_types.join(', ') : undefined,
    score_breakdown: item.rank_factors ? { ...item.rank_factors } : null,
  }
}
