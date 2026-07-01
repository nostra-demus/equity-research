// Keyboard shortcuts for the batch-review queue. Deliberately a small, independently-testable map so
// the one error-prone entry below gets a dedicated assertion (reviewKeymap.test.ts): the mnemonic "L"
// suggests "Low", but it maps to the "score_too_high" type — because pressing L means "the CURRENT
// score is too high, it should go lower." Do not "fix" this to score_too_low.
import type { FeedbackType } from './types'

export const KEY_TO_FEEDBACK: Record<string, FeedbackType> = {
  i: 'irrelevant',
  h: 'should_be_higher',
  l: 'score_too_high', // the score should go LOWER — see file header, do not swap with score_too_low
  d: 'duplicate_stale',
}

// 's' is intentionally absent: Skip is a pure client-side queue-advance, never a feedback submission —
// it must not appear here or a future edit could accidentally wire it into the API call path.
export const SKIP_KEY = 's'
