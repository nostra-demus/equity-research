// Why an archive search did not FINISH — as opposed to finishing with no matches.
//
// The two are opposite facts that look identical in the data: both leave an empty result list. The rail used
// to collapse them, so a request that timed out rendered as "Searched all history back to 17 Jul — genuinely
// nothing matches AMZN (Amazon). This is the WHOLE archive" for a wire holding 160 Amazon items. A dated,
// specific, confident claim of absence, produced by a failure. An unproven absence must never be reported as
// a proven one (CLAUDE.md §3), so a failure gets its own wording and never borrows the language of a result.
//
// Its own module (not the store) because it is a pure string function the unit tests can import without
// dragging in the app.

/** A lowercase CLAUSE, so it reads correctly after a dash ("The search didn't finish — …") and, via
 *  `archiveErrorSentence`, as a sentence of its own. AbortSignal.timeout rejects with a TimeoutError; some
 *  browsers and older engines report the abort as AbortError. Anything else is reported by HTTP status:
 *  5xx = the engine broke while searching, otherwise we never reached it. */
export function archiveErrorNote(e: unknown): string {
  const err = e as { name?: unknown; status?: unknown } | null | undefined
  const name = String(err?.name ?? '')
  if (name === 'TimeoutError' || name === 'AbortError') return 'the engine took too long to answer, so nothing was searched'
  const status = Number(err?.status)
  if (status >= 500) return 'the engine hit an error while searching'
  return 'the engine could not be reached'
}

/** The same note as a standalone sentence — capitalised, full stop. */
export function archiveErrorSentence(note: string): string {
  if (!note) return ''
  return `${note.charAt(0).toUpperCase()}${note.slice(1)}.`
}
