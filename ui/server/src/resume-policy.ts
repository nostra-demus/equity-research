/** Pure quota-pause policy shared by the headless supervisor and browser-facing resumable projections. */
export function autoResumeDue(
  reason: string | undefined,
  resetsAt: number | undefined,
  now: number = Date.now(),
  bufferMs: number = 60_000,
): boolean {
  if (reason !== 'out_of_credits') return true
  // Unknown telemetry is never permission to spend/retry. Manual explicit resume remains available.
  return typeof resetsAt === 'number' && Number.isFinite(resetsAt) && now >= resetsAt * 1000 + bufferMs
}
