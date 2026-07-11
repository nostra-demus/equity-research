// The 9 feedback types a card can be rated with. Source of truth is the server's
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
  'relevant',
  'other',
]

// Full labels — read as a sentence in the "Feedback saved — …" toast and the batch-review panel. (The
// popover uses the shorter CHIP_LABELS below.)
const LABELS: Record<FeedbackType, string> = {
  irrelevant: 'Irrelevant',
  score_too_high: 'Score too high',
  score_too_low: 'Score too low',
  wrong_company: 'Wrong company',
  wrong_sector: 'Wrong sector/theme',
  duplicate_stale: 'Duplicate/stale',
  should_be_higher: 'Important/should be higher',
  relevant: 'Good call',
  other: 'Other',
}

export function feedbackLabel(type: FeedbackType): string {
  return LABELS[type]
}

// ---- polarity model for the thumbs-up / thumbs-down rating -------------------------------------------
// Every reason belongs to a thumb. 👍 = "the wire got this right" (keep it / rank it higher). 👎 = "this
// is off" (drop it / it's mis-scored / wrong). `other` lives under BOTH thumbs — its polarity is set by
// which thumb the reader opened. The two ordered lists ARE the two reason menus, most-common first.
export type FeedbackPolarity = 'up' | 'down'

export const UP_REASONS: FeedbackType[] = ['relevant', 'should_be_higher', 'score_too_low', 'other']
export const DOWN_REASONS: FeedbackType[] = ['irrelevant', 'score_too_high', 'wrong_company', 'wrong_sector', 'duplicate_stale', 'other']

export function reasonsFor(polarity: FeedbackPolarity): FeedbackType[] {
  return polarity === 'up' ? UP_REASONS : DOWN_REASONS
}

// The thumb a saved reason belongs to — derived so `submitFeedback` can record which thumb lit up without
// the caller threading it through. `other` is genuinely ambiguous (it sits under both thumbs), so callers
// that know the context pass the polarity explicitly; this derivation is only the fallback for the rest.
export function polarityOf(type: FeedbackType): FeedbackPolarity {
  return type !== 'other' && UP_REASONS.includes(type) ? 'up' : 'down'
}

// Short, verb-free chip labels for the rating popover — the full LABELS above stay for the toast and the
// batch-review panel, which read as sentences. A chip is a tap target, so it wants two words, not a phrase.
const CHIP_LABELS: Record<FeedbackType, string> = {
  relevant: 'Spot on',
  should_be_higher: 'Rank it higher',
  score_too_low: 'Underscored',
  irrelevant: 'Not relevant',
  score_too_high: 'Overscored',
  wrong_company: 'Wrong company',
  wrong_sector: 'Wrong sector',
  duplicate_stale: 'Duplicate / stale',
  other: 'Something else',
}

export function feedbackChipLabel(type: FeedbackType): string {
  return CHIP_LABELS[type]
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
