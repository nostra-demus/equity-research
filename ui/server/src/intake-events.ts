import { createHash } from 'node:crypto'
import { canonicalJsonText } from './canonical-json'
import { publishedTreeAuthority, type PublishedTreeAuthority } from './git-publication'
import {
  AUTOMATIC_INTAKE_OUTCOME_DIRECTORY,
  parseAutomaticIntakeOutcomeReceipt,
} from './intake-outcome-receipt'

export interface SharedIntakeOwner {
  ticker: string
  runRoot: string
  /** Fingerprint of the same corrected, published decision record Calls is displaying. */
  decisionFingerprint: string
}

export interface SharedIntakeEvent {
  id: string
  ticker: string
  run_root: string
  receipt_path: string
  plan_path: string
  plan_sha256: string
  decision_fingerprint: string
  evidence_coverage_digest: string
  verdict: 'note_only' | 'scoped_rerun' | 'insufficient'
  at: string
  headline: string
  detail: null
}

const RUN_RE = /^analyses\/([A-Z0-9.\-]{1,15})_\d{4}-\d{2}-\d{2}$/
const RECEIPT_NAME_RE = /^[a-f0-9]{64}\.json$/
const SHA_RE = /^sha256:[a-f0-9]{64}$/

/** Keep this identity byte-for-byte aligned with the normalized decision fingerprint used by intake.ts. */
export function decisionFingerprintForSharedIntake(runRoot: string, decision: unknown): string | null {
  if (!RUN_RE.test(runRoot)) return null
  try {
    return `sha256:${createHash('sha256').update(`${runRoot}\n${canonicalJsonText(decision)}`, 'utf8').digest('hex')}`
  } catch { return null }
}

function containedReceiptPath(owner: SharedIntakeOwner, name: string, publishedPaths: ReadonlySet<string>): string | null {
  const match = RUN_RE.exec(owner.runRoot)
  if (!match || match[1] !== owner.ticker || !RECEIPT_NAME_RE.test(name)
      || !SHA_RE.test(owner.decisionFingerprint)) return null
  const relative = `${owner.runRoot}/intake/${AUTOMATIC_INTAKE_OUTCOME_DIRECTORY}/${name}`
  return publishedPaths.has(relative) ? relative : null
}

/**
 * Project only a published server-authored outcome receipt. Raw model-authored plan JSON is deliberately
 * absent from this trust boundary: its existence, shape, or staged copies can never mint a shared
 * “checked new data” row. The server writes a receipt only after the strict local plan/pool proof passes.
 */
export function sharedIntakeEventForReceipt(
  owner: SharedIntakeOwner,
  name: string,
  authority: PublishedTreeAuthority = publishedTreeAuthority('analyses'),
): SharedIntakeEvent | null {
  const relative = containedReceiptPath(owner, name, authority.paths)
  if (!relative) return null
  try {
    const receipt = parseAutomaticIntakeOutcomeReceipt(authority.readRequired(relative), relative)
    if (!receipt || receipt.ticker !== owner.ticker || receipt.run_root !== owner.runRoot
        || receipt.decision_fingerprint !== owner.decisionFingerprint) return null
    return {
      id: receipt.event_id,
      ticker: receipt.ticker,
      run_root: receipt.run_root,
      receipt_path: relative,
      plan_path: receipt.plan_path,
      plan_sha256: receipt.plan_sha256,
      decision_fingerprint: receipt.decision_fingerprint,
      evidence_coverage_digest: receipt.evidence_coverage_digest,
      verdict: receipt.verdict,
      at: receipt.checked_at,
      headline: receipt.verdict === 'note_only'
        ? 'Checked new data. The call did not change.'
        : receipt.verdict === 'scoped_rerun'
          ? 'Checked new data. The call is being updated.'
          : 'Checked new data. There was not enough proof to change the call.',
      detail: null,
    }
  } catch (error: any) {
    // A malformed receipt is not a success notification. A blob listed by this exact pinned tree but no
    // longer readable is an authority outage and must not silently erase shared history on this host.
    if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
    return null
  }
}

/** Deterministic shared notification projection; static/failover hosts read only published receipts. */
export function listSharedIntakeEvents(
  owners: SharedIntakeOwner[],
  authority: PublishedTreeAuthority = publishedTreeAuthority('analyses'),
): SharedIntakeEvent[] {
  const events: SharedIntakeEvent[] = []
  const seenOwners = new Set<string>()
  const seenEvents = new Set<string>()
  for (const owner of owners) {
    const ownerIdentity = `${owner.runRoot}\0${owner.decisionFingerprint}`
    if (seenOwners.has(ownerIdentity)) continue
    seenOwners.add(ownerIdentity)
    const prefix = `${owner.runRoot}/intake/${AUTOMATIC_INTAKE_OUTCOME_DIRECTORY}/`
    const names = [...authority.paths]
      .filter((repoPath) => repoPath.startsWith(prefix))
      .map((repoPath) => repoPath.slice(prefix.length))
      .filter((name) => !name.includes('/') && RECEIPT_NAME_RE.test(name))
      .sort()
    for (const name of names) {
      const event = sharedIntakeEventForReceipt(owner, name, authority)
      if (!event || seenEvents.has(event.id)) continue
      seenEvents.add(event.id)
      events.push(event)
    }
  }
  return events.sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id))
}
