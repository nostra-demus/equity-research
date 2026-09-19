/** Pure automatic-resume policy shared by the headless supervisor and browser-facing resumable projections. */

/**
 * The supervisor refused this run's publication for a reason no retry can change (today: the data
 * catalogue rejected a path in the exact publication). It is a distinct durable reason, written by the
 * single close finalizer only when the failure carried the typed `PublicationRefusedError` — never inferred
 * from an error message. A transient publication failure (push, network, a lost remote race) keeps
 * `publication_failed` and keeps auto-resuming.
 */
export const PUBLICATION_REFUSED_REASON = 'publication_refused'

/**
 * Interruptions no automatic continuation can cure. Continuing one spends provider tokens to reach the
 * same refusal again (a full chain deletes the terminal artifacts and pays for the master synthesizer every
 * time), which is the "automatic paid retry" / "retry loop that merely hides the cause" CONTRIBUTING.md
 * bans. They wait for a human: the cause is fixed first, then an explicit manual resume continues the run.
 */
export function requiresManualResume(reason: string | undefined): boolean {
  return reason === PUBLICATION_REFUSED_REASON
}

export function autoResumeDue(
  reason: string | undefined,
  resetsAt: number | undefined,
  now: number = Date.now(),
  bufferMs: number = 60_000,
): boolean {
  // Checked first: a reset time is quota telemetry and can never make a deterministic refusal retryable.
  if (requiresManualResume(reason)) return false
  if (reason !== 'out_of_credits') return true
  // Unknown telemetry is never permission to spend/retry. Manual explicit resume remains available.
  return typeof resetsAt === 'number' && Number.isFinite(resetsAt) && now >= resetsAt * 1000 + bufferMs
}
