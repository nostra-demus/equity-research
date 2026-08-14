// Resolve the one swarm allowed to auto-analyze a shared data/<SUBJECT>/ pool.
// A label is not globally unique (research GOLD and commodity GOLD can both exist), so every finished
// owner counts before any one owner's newer decision contract is considered. Ambiguity always abstains.
import { normalizeDataSubject } from './data-subject'
import { readDataNeeds } from './data-needs'
import { finishedForIntake, resolveIntakeRunRoot } from './intake'
import { listSwarms } from './swarms'
import type { RunKind } from './types'

/** A finished dossier that can claim the shared data/<SUBJECT>/ namespace. This deliberately carries
 *  no data-needs projection or decision fingerprint: old finished runs still count as owners, even when
 *  they predate the modern Data Needs contract. Hiding those legacy owners is how the same GOLD pool
 *  could otherwise be silently routed to both equity research and the commodity cockpit. */
export interface FinishedIntakeOwner {
  swarm: string
  subject: string
  runRoot: string
}

/** Enumerate every finished swarm owner for one shared data-pool label. There is at most one row per
 *  swarm (its standing finished run), but there may be several swarms. Callers must treat >1 as ambiguity,
 *  never pick the newest across unlike idea types. */
export function listFinishedIntakeOwners(subject: string): FinishedIntakeOwner[] {
  const finished: FinishedIntakeOwner[] = []
  for (const manifest of listSwarms()) {
    const normalized = normalizeDataSubject(manifest.id, subject)
    if (!normalized) continue
    const resolved = resolveIntakeRunRoot(normalized, { swarmId: manifest.id }, true)
    if (resolved && finishedForIntake(manifest, resolved.root)) {
      finished.push({ swarm: manifest.id, subject: normalized, runRoot: resolved.runRoot })
    }
  }
  return finished.sort((a, b) => a.swarm.localeCompare(b.swarm))
}

/** Unattended company-news writers are research-only. They need a positive, sole finished research owner;
 *  zero-owner, commodity-only, and ambiguous labels all receive zero bytes. */
export function researchSolelyOwnsSharedPool(subject: string): boolean {
  try {
    const owners = listFinishedIntakeOwners(subject)
    return owners.length === 1 && owners[0].swarm === 'research'
  } catch {
    return false
  }
}

// These commands read data/<SUBJECT> directly. Review/track consume already-published decisions, and
// flow swarms (the screener) use their own signal stores, so neither belongs in the shared-pool guard.
const SHARED_DATA_KINDS = new Set<RunKind>(['full', 'module', 'agent', 'rerun', 'doc-intake'])

/** Generic capability check: a future constellation swarm automatically joins the guard through its
 *  manifest layout; no swarm id is wired here. */
export function isSharedDataPoolConsumer(kind: RunKind, layout: string | undefined): boolean {
  return layout === 'constellation' && SHARED_DATA_KINDS.has(kind)
}

export interface SharedDataPoolClaim {
  swarm: string
  runId?: string
}

export type SharedDataPoolConflict =
  | { code: 'shared_data_owner_ambiguous'; owners: string[] }
  | { code: 'shared_data_owner_mismatch'; owners: string[] }
  | { code: 'shared_data_subject_busy'; owners: string[]; blockingSwarm: string; blockingRunId?: string }

/** Manual producers may write a shared pool before any dossier exists (new-company upload / screener
 *  handoff), but once the label has a finished owner they may only write for that exact cockpit. This is
 *  intentionally independent of modern Data Needs so a legacy finished dossier still owns its pool. */
export function finishedOwnerConflict(
  expectedSwarm: string,
  owners: FinishedIntakeOwner[],
): Extract<SharedDataPoolConflict, { code: 'shared_data_owner_ambiguous' | 'shared_data_owner_mismatch' }> | null {
  const ownerSwarms = [...new Set(owners.map((owner) => owner.swarm))].sort()
  if (ownerSwarms.length > 1) return { code: 'shared_data_owner_ambiguous', owners: ownerSwarms }
  if (ownerSwarms.length === 1 && ownerSwarms[0] !== expectedSwarm) {
    return { code: 'shared_data_owner_mismatch', owners: ownerSwarms }
  }
  return null
}

/** Pure ownership/concurrency decision used at both launch boundaries. Rules are intentionally small:
 *  zero finished owners is available; one owner is available only to that swarm; two owners are always
 *  ambiguous. While there is no owner yet, an in-flight/pending first run reserves the bare pool label so
 *  another swarm cannot simultaneously become a second owner. A cross-swarm claim is rejected in every
 *  state as a fail-closed repair for any stale process admitted by older code. */
export function sharedDataPoolConflict(
  launchSwarm: string,
  owners: FinishedIntakeOwner[],
  claims: SharedDataPoolClaim[],
): SharedDataPoolConflict | null {
  const ownerConflict = finishedOwnerConflict(launchSwarm, owners)
  if (ownerConflict) return ownerConflict
  const ownerSwarms = [...new Set(owners.map((owner) => owner.swarm))].sort()
  const competing = claims.find((claim) => claim.swarm !== launchSwarm)
  if (competing) {
    return {
      code: 'shared_data_subject_busy',
      owners: ownerSwarms,
      blockingSwarm: competing.swarm,
      ...(competing.runId ? { blockingRunId: competing.runId } : {}),
    }
  }
  return null
}

export interface IntakeOwner {
  swarm: string
  runRoot: string
  decisionFingerprint: string
}

export function resolveUniqueFinishedIntakeOwner(subject: string): IntakeOwner | null {
  const finished = listFinishedIntakeOwners(subject)

  if (finished.length !== 1) return null
  const owner = finished[0]
  const exact = readDataNeeds(owner.swarm, owner.subject, owner.runRoot)
  const current = readDataNeeds(owner.swarm, owner.subject)
  if (!exact || !current || exact.run_root !== current.run_root
      || exact.decision_fingerprint !== current.decision_fingerprint) return null
  return { swarm: owner.swarm, runRoot: exact.run_root, decisionFingerprint: exact.decision_fingerprint }
}
