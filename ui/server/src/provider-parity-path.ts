const ATTEMPT_ID_RE = /^[a-f0-9]{8,32}$/

/**
 * A canary's first immutable root keeps the historical `<SUBJECT>_<DATE>` name. A later paid attempt
 * must never reuse or move that root: it gets an explicit, immutable attempt suffix instead.
 */
export const PARITY_CANARY_RUN_ROOT_RE = /^analyses\/provider-parity\/\d{4}-\d{2}-\d{2}\/(?:claude|codex)\/[A-Z0-9.\-]{1,12}_\d{4}-\d{2}-\d{2}(?:__attempt-[a-f0-9]{8,32})?$/

export function parityCanaryRootBasenameMatches(
  basename: string,
  subject: string,
  decisionDate: string,
): boolean {
  const canonical = `${subject}_${decisionDate}`
  if (basename === canonical) return true
  const prefix = `${canonical}__attempt-`
  return basename.startsWith(prefix) && ATTEMPT_ID_RE.test(basename.slice(prefix.length))
}
