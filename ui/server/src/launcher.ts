import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { execa, type ResultPromise } from 'execa'
import { estimateFromComparableRuns, logFinish, logLaunch } from './activity-log'
import { admitRun, admissionMessage } from './admission'
import { DATA_DIR, HOST, LAUNCH_GUARDS, MAX_CONCURRENT_RUNS, PORT, PUBLICATION_SOCKET_ROOT, REPO_ROOT, RUN_STALL_MINUTES, STATE_DIR } from './config'
import { getCreditStatus, setCreditStatus } from './credit'
import { writeAgentMetrics } from './agent-metrics'
import { startRunWatcher, sweepRunOutputs } from './fs-watcher'
import { createRun, emit, emitTransient, finishRun, getRun, IN_FLIGHT_STATUSES, inFlightRunsForSubject, listRuns, recordActivity, setActiveSubjectRun, type ExpectedAgent, type RunState } from './registry'
import { clearRunMarker, hasRunMarker, isValidCalendarISODate, readRunMarker, resolveRunRoot, writeRunMarker, writeSupervisorRunFile } from './outputs'
import { isReadinessCancelledError, ReadinessCancelledError, runReadiness } from './readiness'
import { buildSwarmGraph, downstreamCascade } from './roster'
import { isValidTicker, resolveInsideScreener } from './sandbox'
import { normalizeDataSubject } from './data-subject'
import { resolveManifestRunRoot } from './swarm-run-root'
import { readDataNeeds } from './data-needs'
import { intakeReceiptIntentStillActionable, type IntakeReceiptIntent } from './intake'
import {
  isSharedDataPoolConsumer,
  listFinishedIntakeOwners,
  resolveUniqueFinishedIntakeOwner,
  sharedDataPoolConflict,
  type IntakeOwner,
  type SharedDataPoolClaim,
  type SharedDataPoolConflict,
} from './intake-owner'
import { RESEARCH_SWARM_ID, swarmById } from './swarms'
import { finalPaths, handleStreamLine } from './stream-parser'
import { extractTriageStatus } from './verdict'
import {
  modulePublicationInFlight,
  recoverNonCleanExactModulePublication,
  type NonCleanExactModuleRecovery,
} from './module-publication'
import type { LaunchPreflight, ReadinessDecision, ReadinessReport, ResearchMemoryIdentity, RunKind, RunStatus } from './types'
import { validateAgentOutputFile, validateAgentOutputText } from '../../../scripts/agent-output-validity.mjs'
import './providers/claude'
import './providers/codex'
import { claudeChildEnv, detectClaudeFlags } from './providers/claude'
import { getProviderAdapter, isProviderEnabled, listProviderAdapters, providerDisabledReason } from './providers/registry'
import { PROVIDER_NEUTRAL_RUN_ENV, type ProviderExecutionProfile, type RunProvider } from './providers/types'
import {
  appendExecutionAttempt, artifactIsFresh, attestParitySnapshotAtPublication,
  canonicalManifestJsonl, canonicalManifestPath, decisionArtifacts,
  EXECUTION_PROVENANCE_RECEIPT, receiptPath, recordAdmittedProviderSelection, recordProviderInterruptionAuthority,
  protectedInterruptedExecutionLineage, readProviderInterruptionAuthority, recordRecoveredPublicationAuthority, releaseExecutionEpochAfterPublication,
  releaseParityRegistration, resolveParityBindingPath, supersedeIncompleteDecisionAuthorAttempt, writeExecutionReceipt,
} from './execution-provenance'
import { runIbkrPaperAutoSyncAfterPublication, scheduleIbkrPaperAutoSyncAfterPublication } from './ibkr-paper-auto-sync'
import type { PreSpendRetryAuthority, PreparedRunPlanTransaction } from './run-plan-transaction'
import {
  createProviderSpawnGate,
  inspectProviderSpawnGate,
  providerSpawnCommandDigest,
  PROVIDER_SPAWN_GATE_DIR_ENV,
  PROVIDER_SPAWN_GATE_TOKEN_ENV,
  PROVIDER_SPAWN_TRAMPOLINE,
  recordProviderSpawnGateProcessProof,
  releaseProviderSpawnGate,
  removeProviderSpawnGate,
  sweepUnreleasedProviderSpawnGates,
  type ProviderSpawnGate,
} from './provider-spawn-gate'
import { parityCanaryRootBasenameMatches } from './provider-parity-path'
import {
  attestResearchMemoryUse,
  compileResearchMemoryPacket,
  finalizeResearchMemory,
  prepareResearchMemory,
  researchMemoryTaskStatus,
  verifyResearchMemoryBeforeSpawn,
} from './research-memory'
import { acquireProviderRunDeployLease } from './deploy-barrier'
import { captureOutputLineageAttempt, settleOutputLineageAttempt } from './evidence-lineage'
import {
  createFrozenEvidenceReadCapability,
  destroyFrozenEvidenceReadCapability,
  verifyFrozenEvidenceReadCapability,
  type FrozenEvidenceReadCapability,
} from './frozen-evidence-capability'

// Provider adapters may issue a short-lived auth/binary lease while building a launch spec. Keep the
// disposer supervisor-owned and keyed by the in-memory RunState: it is never exported to the child env.
// A one-shot wrapper makes racing stream-result/close/cancel paths harmless.
const providerLaunchCleanup = new WeakMap<RunState, () => void>()
const providerEvidenceBoundary = new WeakMap<RunState, {
  frozenPool: FrozenPoolBinding
  capability: FrozenEvidenceReadCapability
}>()
function releaseProviderLaunchResources(run: RunState): void {
  providerEvidenceBoundary.delete(run)
  const cleanup = providerLaunchCleanup.get(run)
  if (!cleanup) return
  providerLaunchCleanup.delete(run)
  try { cleanup() } catch (error: any) {
    console.error(`[provider] launch cleanup failed for ${run.runId}: ${String(error?.message || error)}`) // eslint-disable-line no-console
  }
}

// Screener kinds are swarm-scoped; everything else is the research default. Generic by design:
// the kind->swarm mapping is the only place this file knows the screener exists, and it is driven
// by the discovered manifest (a missing manifest fails the launch with a clear 404).
const SCREENER_KINDS = new Set<RunKind>(['signal', 'sweep', 'screener-agent', 'handoff', 'conviction'])
// Resolve the swarm for a launch. An explicit `swarm` (from the launch body) wins when it names a
// discovered, non-research swarm — this is how a generic constellation swarm (e.g. commodity) routes
// its REUSED full/module/agent kinds without inventing new per-swarm kinds. Otherwise the screener
// kinds map to screener and everything else is the research default. No swarm id beyond the screener
// literal is hardcoded here (CLAUDE.md §26 — a future swarm needs no engine-code edit).
function swarmIdFor(kind: RunKind, swarm?: string): string {
  if (swarm && swarm !== 'research' && swarmById(swarm)) return swarm
  return SCREENER_KINDS.has(kind) ? 'screener' : 'research'
}

// The cockpit's signal-intake form payload (materialized into <runRoot>/intake.json at launch so
// only the SIG id ever crosses the CLI — no shell-quoting hazards on long headlines/notes).
export interface SignalIntakeInput {
  headline: string
  source_url?: string
  source_name?: string
  input_nature?: string
  body_text?: string
  human_prompt_note?: string
  override_promote?: boolean
}

// The input_nature values the Phase 0.1 intake contract accepts. MUST mirror the enum in
// frameworks/screener/intake.schema.json — intake-input-nature.test.ts asserts they stay in lockstep, so
// a schema edit that isn't reflected here fails CI rather than silently writing an invalid intake.json.
const INTAKE_INPUT_NATURES = new Set([
  'human_prompt', 'news_headline', 'price_alert', 'regulatory_filing', 'earnings_release',
  'earnings_call_transcript', 'company_press_release', 'exchange_announcement', 'commodity_price_move',
  'shipping_rate_move', 'options_flow_alert', 'chart_pattern', 'geopolitical_event', 'macro_data_release',
])

/**
 * Clamp an incoming intake.input_nature to a value the intake schema accepts. A wire row can carry an
 * ingest-only nature that is NOT a valid intake value — most importantly 'social_discussion' (the Reddit/
 * `social` tier from approved-domains.ts), which the cockpit forwards when a user clicks "Run the checks"
 * on a Reddit row. Writing it verbatim makes intake.json schema-invalid (validate_screener_json.py rejects
 * it) instead of cleanly failing Gate 0 as an off-list source. The source_name/source_url (reddit.com)
 * are preserved on the intake, so Gate 0 still rejects it off-list — we only normalize the nature label to
 * the generic default so the intake stays schema-valid. An unset/unknown nature falls back per `isHuman`.
 */
export function sanitizeIntakeInputNature(raw: string | undefined, isHuman: boolean): string {
  if (raw && INTAKE_INPUT_NATURES.has(raw)) return raw
  return isHuman ? 'human_prompt' : 'news_headline'
}

// THE canonical signal identity: normalized headline | source URL (empty when none) | date.
// Exported so tests can pin it; `.claude/commands/screener/signal.md` step B.1 documents the SAME
// recipe for the CLI path — the two must never drift, or the same event gets two SIG folders.
export function sigIdFor(intake: SignalIntakeInput, date: string): string {
  const normalized = `${intake.headline.toLowerCase().replace(/\s+/g, ' ').trim()}|${intake.source_url || ''}|${date}`
  const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 8)
  return `SIG-${date.replace(/-/g, '')}-${hash}`
}

// Shared screener stores a sweep/handoff writes OUTSIDE any run root. NOTE the honest mechanics:
// admission's target-overlap rule (D2) only compares runs of the SAME subject, and same-subject
// duplicates are already rejected at D1 by the sweep/handoff exclusivity — so these declarations are
// best-effort METADATA (introspection, future cross-subject rules), not the operative guard. The
// operative protections are: D1 exclusivity per subject; append-ndjson.sh's lock + idempotency key
// on the ledger; and update_board_index.py's deterministic rebuild via a per-process temp file +
// atomic rename, which makes cross-subject board rebuilds converge instead of corrupting.
// The sweep inbox filename uses the LAUNCH-time date — a run that crosses midnight may write the
// next day's file instead (acceptable for metadata; do not build hard rules on this path).
function swarmStoreTargets(kind: RunKind, subjectId: string, swarmId: string): string[] {
  const manifest = swarmById(swarmId)
  if (kind === 'signal') {
    return [
      ...(manifest?.ledgerRoot ? [path.join(REPO_ROOT, manifest.ledgerRoot)] : []),
      ...(manifest?.boardIndex ? [path.join(REPO_ROOT, manifest.boardIndex)] : []),
    ]
  }
  if (kind === 'sweep') {
    return [
      path.join(REPO_ROOT, 'screener', 'inbox', `${todayDate()}_sweep.json`),
      path.join(REPO_ROOT, 'screener', 'board', 'index.json'),
    ]
  }
  if (kind === 'handoff') {
    const [thesisId, target] = subjectId.split('::')
    return [
      path.join(REPO_ROOT, 'screener', 'ledger', 'handoffs.ndjson'),
      path.join(REPO_ROOT, 'screener', 'board', 'index.json'),
      path.join(DATA_DIR, target || '', `screener_thesis_${thesisId}.md`),
    ]
  }
  return []
}

// Back-compatible Claude helpers used by the small non-cockpit CLI wrappers. Tracked cockpit runs go
// through ProviderAdapter below; these aliases keep existing untracked callers byte-for-byte unchanged.
export async function detectFlags(): Promise<Set<string>> {
  return detectClaudeFlags()
}

// ---- is the Claude CLI actually runnable? (cached) ----
// The cockpit reads the data pool itself but SPAWNS this CLI to run the engine. Because execa uses
// reject:false, a missing binary fails ASYNC (ENOENT) and surfaced only as a bare "error" with no
// detail. Probe once up front so a launch fails fast with an actionable message instead.
/** Throw the launcher's canonical 503 when the engine CLI is missing. Exported so a route that STAGES
 *  disk state before launching (the scoped rerun) can fail on this BEFORE touching any files — the same
 *  message, one source of truth (Codex #358 r3672400207). */
export async function assertClaudeCli(): Promise<void> {
  const availability = await getProviderAdapter('claude').getAvailability({ refresh: true })
  if (availability.available) return
  const err: any = new Error(
    availability.reason || 'Claude CLI is not available in this cockpit runtime.')
  err.statusCode = 503
  err.code = 'CLAUDE_CLI_MISSING'
  throw err
}

export async function assertProviderAvailable(
  provider: RunProvider,
  proofId?: string,
  scope: 'normal' | 'provider-parity' = 'normal',
): Promise<void> {
  if (!isProviderEnabled(provider, process.env, scope)) {
    const reason = providerDisabledReason(provider)
    const error: any = new Error(reason)
    error.statusCode = 503
    error.code = 'PROVIDER_DISABLED'
    error.body = { provider, availability: 'unavailable', reason }
    throw error
  }
  const availability = await getProviderAdapter(provider).getAvailability({ refresh: true, proofId })
  if (availability.available) return
  const error: any = new Error(availability.reason || `${provider} is unavailable in this cockpit runtime.`)
  error.statusCode = 503
  // Keep the established Claude launch contract stable for old clients and tests; new providers use
  // the provider-neutral code and the structured body below.
  error.code = provider === 'claude' ? 'CLAUDE_CLI_MISSING' : 'PROVIDER_UNAVAILABLE'
  error.body = { provider, availability: availability.availability, reason: availability.reason }
  throw error
}

// Local-calendar date that stamps a launch's SIG-id (both the hash input and the id prefix). Exported so
// the read-only signal-state probe computes the SAME id instead of re-deriving the recipe from a comment —
// if this ever changes (UTC, format), the probe follows automatically rather than silently reading 'never'.
// Accepts an optional Date so callers can derive the date a past run started on, not just "today".
export function todayDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// The deliverables a completed full/rerun MUST have written (the master synthesizer's primary outputs).
// Their absence after a clean exit means the run was truncated before the master finished.
/** A module run's whole deliverable is its `99_<module>-synthesis.md`. Existence-only and size-checked,
 * matching the "module done" test the resume supervisor already uses — a module whose synthesis is on
 * disk is exactly what a resume skips. */
/** Which orb files a module run actually landed, for an honest incomplete note. A stalled module used to
 * say nothing at all; naming the orbs on disk turns "it just stops" into "9 of 14 landed, these are
 * missing" — and tells the user exactly what to re-run. Best-effort: never throws. */
/** Did this module abort by DESIGN, on a fail-fast triage verdict of Insufficient? Every module command
 * says so explicitly ("Do NOT proceed to commit") — the module writes no synthesis and commits nothing,
 * and that is a correct, reasoned outcome, not a stall. Reporting it as "incomplete" would be a FALSE
 * failure: the same defect class the incomplete branch exists to remove, pointed the other way.
 * Fails closed — an unreadable or absent triage returns false and the caller's normal test applies. */
export function moduleFailFastAborted(runRoot: string | null, moduleName?: string): boolean {
  if (!runRoot || !moduleName) return false
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  const dir = path.join(root, moduleName)
  try {
    const triage = fs.readdirSync(dir).filter((f) => /^00_.*\.md$/.test(f)).sort()[0]
    if (!triage) return false
    return extractTriageStatus(fs.readFileSync(path.join(dir, triage), 'utf8')) === 'Insufficient'
  } catch { return false }
}

export function moduleOrbProgress(runRoot: string | null, moduleName?: string): { landed: string[]; expected: number } {
  if (!runRoot || !moduleName) return { landed: [], expected: 0 }
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  let landed: string[] = []
  try {
    landed = fs.readdirSync(path.join(root, moduleName))
      .filter((f) => /^\d\d_.*\.md$/.test(f) || /^99_.*-synthesis\.md$/.test(f))
      .filter((f) => { try { return fs.statSync(path.join(root, moduleName, f)).size > 0 } catch { return false } })
      .sort()
  } catch { /* module folder absent — nothing landed */ }
  let expected = 0
  try {
    expected = fs.readdirSync(path.join(REPO_ROOT, '.claude', 'agents', moduleName))
      .filter((f) => /^\d\d_.*\.md$/.test(f) || /^99_.*-synthesis\.md$/.test(f)).length
  } catch { /* unknown roster — report what landed without a denominator */ }
  return { landed, expected }
}

export function moduleSynthesisPresent(
  runRoot: string | null,
  moduleName?: string,
  swarmId: string = RESEARCH_SWARM_ID,
): boolean {
  if (!runRoot || !moduleName) return false
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  const dir = path.join(root, moduleName)
  try {
    const module = buildSwarmGraph(swarmId).modules.find((candidate) => candidate.name === moduleName)
    if (!module) return false
    return Object.values(module.layers).flat()
      .filter((agent) => agent.isSynthesis)
      .some((agent) => validateAgentOutputFile(
        path.join(dir, `${agent.key.split('/').at(-1)}.md`),
      ).valid)
  } catch { return false }
}

const IDEA_PUBLICATION_MARKER = '.requires_idea_publication'

function ideaPublicationMarkerPath(runRoot: string): string {
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  return path.join(root, IDEA_PUBLICATION_MARKER)
}

function markIdeaPublicationRequired(runRoot: string): void {
  writeSupervisorRunFile(runRoot, IDEA_PUBLICATION_MARKER, '')
}

export function ideaPublicationPending(runRoot: string | null): boolean {
  if (!runRoot) return false
  try { return fs.existsSync(ideaPublicationMarkerPath(runRoot)) } catch { return true }
}

export function finalDeliverablesPresent(runRoot: string | null): boolean {
  if (!runRoot) return false
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  return fs.existsSync(path.join(root, 'final_thesis.md'))
    && fs.existsSync(path.join(root, 'decision_record.json'))
    && !ideaPublicationPending(runRoot)
}

// Were the terminal deliverables actually produced by THIS run attempt — not stale leftovers from an
// EARLIER completed run left sitting in the same analyses/<ticker>_<date> folder (a same-day relaunch
// into an already-finished root)? Only the master synthesizer step ever writes final_thesis.md /
// decision_record.json, so a copy whose mtime predates this run's OWN startedAt cannot have been written
// by it — it is a success this attempt did not earn. Comparing against run.startedAt (rather than some
// separate "pipeline start" concept) is correct for every caller: the monolithic `full` run and every
// per-module step of a chained full are each created strictly AFTER a pre-existing stale file, so the
// freshness test holds regardless of which step of the pipeline is asking. A small negative skew
// tolerance absorbs clock/filesystem timestamp granularity.
//
// Shared by every place that used to ask "does finalDeliverablesPresent(run.runRoot) mean this run
// shipped?" — the failure-note guard (recordRunFailure), the .interrupted-marker guards, the run-done
// success-override branch, and the marker/failure-note clear guard in finalizeRunOnClose. The fix for
// Findings 5, 12 and 14 is this ONE helper, not three separate patches.
const DELIVERABLE_MTIME_SKEW_TOLERANCE_MS = 2000
export function finalDeliverablesShippedByThisAttempt(run: RunState): boolean {
  const runRoot = run.runRoot
  if (!finalDeliverablesPresent(runRoot)) return false
  try {
    const root = path.isAbsolute(runRoot!) ? runRoot! : path.join(REPO_ROOT, runRoot!)
    const thesisM = fs.statSync(path.join(root, 'final_thesis.md')).mtimeMs
    const decisionM = fs.statSync(path.join(root, 'decision_record.json')).mtimeMs
    const floor = run.startedAt - DELIVERABLE_MTIME_SKEW_TOLERANCE_MS
    return thesisM >= floor && decisionM >= floor
  } catch {
    return false // stat raced the existsSync check (e.g. removed mid-check) — treat conservatively as not shipped
  }
}

// Did a full/rerun exit cleanly WITHOUT its terminal deliverable? Research ends on final_thesis.md +
// decision_record.json and, when publication was required, a cleared publication marker proving the
// immutable idea-admission step finished. A constellation swarm (e.g. commodity) ends on
// decision_record.json alone — the same key the resume detector uses (resumable.ts). The screener (flow
// layout) has its own terminal-routing semantics and is never judged here.
export function truncatedBeforeFinal(run: RunState): boolean {
  // A sweep's whole deliverable is the day's inbox file. A clean exit that never wrote one means the scan
  // found and saved nothing — say so, instead of reporting the misleading "done" the cockpit turns into
  // "Checks finished". Deliberately EXISTENCE-only, and keyed on the LAUNCH date (a run that crosses
  // midnight wrote the launch day's file, per swarmStoreTargets): the auto-ingester merges into the very
  // same file, so a row-count delta would read a concurrent ingest as sweep work — and would call a
  // legitimate dedup-only sweep a failure. Never report a false failure.
  if (run.kind === 'sweep') {
    return !fs.existsSync(path.join(REPO_ROOT, 'screener', 'inbox', `${todayDate(new Date(run.startedAt))}_sweep.json`))
  }
  // A MODULE run's deliverable is its own synthesis. Without this branch a module run that exited 0
  // having stalled mid-pipeline fell through every check to `finishRun(run, 'done')` — so a wave that
  // died after 12 of 14 orbs was recorded as a SUCCESS, with no error, no reports button and no note.
  // That is what "it just stops and I can't tell why" actually was, and it is chronic and cross-module,
  // not governance-specific: ORCL 2026-08-14 business-model (13 agents, no synthesis, $14.15) and TSLA
  // 2026-07-24 earnings (6 agents, no synthesis, $8.77) have the identical silhouette, both long before
  // the governance expansion, and both needed a human to notice and re-run.
  // Only judge a module run we can actually identify. With no `run.module` there is no synthesis path to
  // look for, and claiming "incomplete" on that absence would fail a genuinely-finished run — so an
  // unknown module falls through to the pre-existing behaviour rather than guessing.
  if (run.kind === 'module' && run.module) {
    if (moduleFailFastAborted(run.runRoot, run.module)) return false
    return !moduleSynthesisPresent(run.runRoot, run.module, run.swarmId)
  }
  if (run.kind !== 'full' && run.kind !== 'rerun') return false
  if (run.swarmId === 'research') return !finalDeliverablesPresent(run.runRoot)
  if (!run.runRoot || swarmById(run.swarmId)?.layout !== 'constellation') return false
  const declared = decisionArtifacts(run)
  // Stable roots retain an older terminal record. A clean refresh only succeeds if THIS attempt changed
  // every declared decision artifact relative to the supervisor's pre-spawn baseline.
  return !declared.length || declared.some((relative) => !artifactIsFresh(run, relative))
}

// A full company run (monolithic `full`, or any step of a chained full) is the unit the resume
// supervisor relaunches. We mark its run folder on disk when it breaks, so the supervisor — which has
// NO in-memory state after a restart — can find and continue it. Solo `module`/`agent` runs are
// deliberate single pieces (the user ran exactly that), so a break there is NOT auto-resumed.
function isResumableResearchRun(run: RunState): boolean {
  return run.swarmId === 'research' && (run.kind === 'full' || run.chained === true)
}

// Stable-root constellation swarms (commodity today, future discovered swarms tomorrow) also need a
// durable per-attempt interruption queue. Their prior decision_record.json remains in place while a
// refresh runs, so the marker — not mere terminal-file presence — identifies the unfinished new epoch.
function isResumableTerminalRun(run: RunState): boolean {
  if (isResumableResearchRun(run)) return true
  return run.swarmId !== RESEARCH_SWARM_ID
    && swarmById(run.swarmId)?.layout === 'constellation'
    && (run.kind === 'full' || run.kind === 'rerun')
}

// Recording WHY a run stopped and AUTO-RESUMING it are different questions, and conflating them is what
// made months of standalone module stalls invisible: a solo `module` launch is deliberately never
// auto-resumed (the user ran exactly that piece), but it must still say why it stopped. Recording is
// therefore WIDER than resumption — never narrower. The `.interrupted` marker stays behind
// isResumableResearchRun: that marker is the resume supervisor's QUEUE, and widening it would enqueue
// solo runs the user never asked to continue.
function shouldRecordStop(run: RunState): boolean {
  return isResumableResearchRun(run) || (run.swarmId === 'research' && run.kind === 'module')
}

// --- A2: commit a diagnosable failure note WITH the run (a DISTINCT file, never the success contract) ----
// When a chained/full research run BREAKS (crash / external kill / plan-limit / nonzero exit) BEFORE it
// ships its terminal deliverables, the machine reason lands only in the on-host `.interrupted` marker + a
// transient SSE event — neither survives off-host. So a broken run committed just its finished modules with
// NO record of WHY it stopped (the hole that made a real MGM run un-diagnosable). This writes RUN_FAILURE.md
// into the run folder — modules finished, the module it broke at, the reason, the stderr tail — and
// best-effort commits just that ONE file via the serialized commit helper (a DATA pathspec, §25/§28-clean).
//
// Correctness guards (do NOT remove — each closes a confirmed bug):
//  1. DISTINCT filename RUN_FAILURE.md, NEVER RUN_METADATA.md — RUN_METADATA.md is the SUCCESS-metadata
//     CONTRACT written by full.md/rerun.md and READ by the synthesizer + eval; a FAILED note there would
//     corrupt it and race the master's own write. RUN_FAILURE.md has no other writer/reader.
//  2. finalDeliverablesPresent guard — a run that shipped final_thesis + decision_record is a SUCCESS
//     regardless of a trailing nonzero exit / late kill; never stamp it failed (mirrors the clear at ~297).
//  3. single-shot per run folder — concurrent chained-module closes must not each write+commit the note.
// Fully best-effort: recording never throws and never blocks run finalization. The git spawn is injectable
// so tests assert the note without committing for real.
const FAILURE_NOTE = 'RUN_FAILURE.md'
const recordedFailure = new Set<string>() // runRoots already recorded this process (single-shot dedup)

let commitRunFile: (runRoot: string, file: string, msg: string) => void = (runRoot, file, msg) => {
  const script = path.join(REPO_ROOT, 'scripts', 'commit-run.sh')
  // Timeout must EXCEED commit-run.sh's own ~15-min git-lock wait — a 60s cap would kill the helper while
  // it legitimately waits behind a concurrent full/chained commit, so the note would never reach git
  // (defeating the durable off-host diagnostic). commit-run.sh gives up on its own at 15m (exit 4).
  void execa('bash', [script, msg, '--', `${runRoot}/${file}`], { cwd: REPO_ROOT, timeout: 20 * 60_000 })
    .catch(() => { /* best-effort: a failed commit must never affect the run */ })
}
/** Test seam — override the git committer so tests never spawn real git. Returns the prior fn. */
export function __setFailureNoteCommitter(fn: typeof commitRunFile): typeof commitRunFile {
  const prev = commitRunFile; commitRunFile = fn; return prev
}

// Mask common secret shapes before a stderr tail is PERSISTED: RUN_FAILURE.md is committed to a public
// repo, and the marker/activity note surface in the UI. A failing tool or auth error can print an API key,
// token, JWT, or signed URL to stderr — this stops a transient error stream from becoming a permanent git
// artifact. Best-effort masking (targeted shapes, not a general DLP), applied at every persist point.
function redactSecrets(s: string): string {
  if (!s) return s
  return s
    .replace(/\b(sk|rk|pk|sk-ant|xoxb|xoxp)-[A-Za-z0-9_-]{12,}/gi, '$1-***REDACTED***') // Anthropic/OpenAI/Stripe/Slack
    .replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, 'gh*_***REDACTED***')                    // GitHub tokens
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, 'AKIA***REDACTED***')                              // AWS access key id
    .replace(/\b(?:ey[A-Za-z0-9_-]{8,}\.){2}[A-Za-z0-9_-]{8,}/g, '***JWT-REDACTED***')   // JWTs
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{12,}/gi, '$1 ***REDACTED***')        // Authorization headers
    .replace(/\b(api[_-]?key|secret|token|password|passwd|auth|access[_-]?key|client[_-]?secret)(["'\s:=]{1,4})[A-Za-z0-9._~+/=-]{8,}/gi, '$1$2***REDACTED***') // key=value
    .replace(/([?&](?:sig|signature|token|key|secret|password|api[_-]?key|access[_-]?token|x-amz-signature)=)[^&\s"']+/gi, '$1***REDACTED***') // signed URLs / query strings
}

function recordRunFailure(run: RunState, reason: string, stderr: string): void {
  const runRoot = run.runRoot
  if (!runRoot) return
  // Finding 5: a stale final_thesis.md/decision_record.json from an EARLIER completed run in this same
  // folder must not suppress a genuinely NEW failure — only deliverables THIS attempt actually shipped do.
  if (finalDeliverablesShippedByThisAttempt(run) && (!run.willCommitToMain || run.publicationCompleted)) return
  // Keyed per (runRoot, module), not per runRoot: several module runs land in the SAME analyses folder
  // (INDIAMART ran five into two folders), and a folder-wide single-shot silently swallowed all but the
  // first — the dedup would have eaten the very records this change exists to create.
  const recordKey = `${runRoot}\u0000${run.module ?? ''}`
  if (recordedFailure.has(recordKey)) return     // single-shot: dedup concurrent chained-module closes
  recordedFailure.add(recordKey)
  try {
    const abs = path.join(REPO_ROOT, runRoot)
    if (!fs.existsSync(abs)) return
    // modules finished = subfolders with a non-empty 99_*-synthesis.md (the "module done" test the resume
    // uses). Exclude the module it broke AT so it never shows as both completed and stopped-at.
    let doneAll: string[] = []
    try {
      doneAll = fs.readdirSync(abs, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .filter((d) => {
          try {
            return fs.readdirSync(path.join(abs, d.name)).some((f) =>
              /^99_.*-synthesis\.md$/.test(f) && fs.statSync(path.join(abs, d.name, f)).size > 0)
          } catch { return false }
        })
        .map((d) => d.name).sort()
    } catch { /* best-effort inventory */ }
    // Completed = DISK TRUTH: every module whose 99_*-synthesis.md is on disk — exactly what a resume will
    // skip. Do NOT drop run.module: if its synthesis already shipped (a commit/handoff failed AFTER it), the
    // module IS complete and belongs here; the failed phase is reported separately in stopped_at below.
    const done = doneAll
    const moduleShipped = !!run.module && doneAll.includes(run.module)
    // stopped-at: the chained step that broke. If run.module's synthesis is already on disk, the break was on
    // its commit/handoff AFTER the module completed — say so, so the note never contradicts the completed
    // list. Else (monolithic full, no run.module) the master if every module synthesis shipped but
    // final_thesis didn't, else the first module still missing.
    let stoppedAt = run.module
      ? (moduleShipped ? `after ${run.module} (its synthesis shipped)` : run.module)
      : undefined
    if (!stoppedAt) {
      let allModules: string[] = []
      try { allModules = buildSwarmGraph().modules.map((m) => m.name) } catch { /* graph unavailable */ }
      const missing = allModules.filter((m) => !doneAll.includes(m))
      stoppedAt = missing.length === 0 ? 'master synthesis' : (missing[0] || 'unknown')
    }
    const md = [
      '# Run Failure', '',
      `- ticker: ${run.ticker}`,
      '- orchestrator: chained full run (server)',
      '- status: FAILED — stopped mid-run before the final thesis',
      `- stopped_at: ${stoppedAt}`,
      `- reason: ${reason}`,
      `- stopped_at_utc: ${new Date().toISOString()}`, '',
      '## Modules completed', '',
      done.length ? done.map((m) => `- ${m}`).join('\n') : '(none)', '',
      '## Error (last 2000 chars of the engine stderr, secrets redacted)', '', '```',
      redactSecrets((stderr || '').slice(-2000)) || '(no stderr captured)', '```', '',
      '## Resume', '',
      'This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.', '',
    ].join('\n')
    writeSupervisorRunFile(runRoot, FAILURE_NOTE, md)
    // A frozen intermediate stage must leave HEAD unchanged for the paired-provider comparison. Retain the
    // local diagnostic and interruption authority, but never invoke the Git publisher from a module child.
    if (!(run.parityCanary && run.parityCanaryStage === 'module')) {
      commitRunFile(runRoot, FAILURE_NOTE, `Run failure note: ${run.ticker} (stopped at ${stoppedAt})`)
    }
  } catch { /* best-effort: recording a failure must never itself fail the run */ }
}

// On genuine completion, drop a stale RUN_FAILURE.md left by an EARLIER break of the same run folder (a run
// that broke, was resumed, then finished) so a completed run never carries a failure note. Best-effort;
// commits the removal only when the file is actually present (a no-op for the vast majority of runs).
function clearRunFailure(runRoot: string | null): void {
  if (!runRoot) return
  for (const k of [...recordedFailure]) if (k === runRoot || k.startsWith(`${runRoot}\u0000`)) recordedFailure.delete(k)
  try {
    const p = path.join(REPO_ROOT, runRoot, FAILURE_NOTE)
    if (!fs.existsSync(p)) return
    fs.rmSync(p, { force: true })
    commitRunFile(runRoot, FAILURE_NOTE, `Clear stale failure note: ${path.basename(runRoot)} (run completed)`)
  } catch { /* best-effort */ }
}

// Reset all per-attempt failure-note state for a DELIBERATE relaunch into an existing, still-incomplete
// run root (Findings 6/8/9): the single-shot dedup (so a FRESH failure re-records RUN_FAILURE.md instead
// of being suppressed by the prior attempt's entry) AND any stale RUN_FAILURE.md file ITSELF, deleted here
// synchronously — not only via the eventual clearRunFailure() at true completion. Finding 8: a resumed
// chained run's master step (rerun.md Step 9B) already `rm -f`s RUN_FAILURE.md before its own success
// commit, but deleting it here too, at the moment the relaunch starts, closes the same hole for any OTHER
// commit of the run root that might fire before that step ever runs. No git commit here (the removal is
// silent + local) — if the resumed attempt fails again, recordRunFailure (dedup now reset) recreates and
// re-commits a FRESH note; nothing here can drop a note a genuinely-still-broken run still needs.
function resetForRelaunch(runRoot: string): void {
  for (const k of [...recordedFailure]) if (k === runRoot || k.startsWith(`${runRoot}\u0000`)) recordedFailure.delete(k)
  try { fs.rmSync(path.join(REPO_ROOT, runRoot, FAILURE_NOTE), { force: true }) } catch { /* best-effort */ }
}

/** Reset disk resume policy only after a monolithic full relaunch has passed admission. Exact standalone
 * modules leave `.aborted` deliberately so an old `.interrupted` cannot wake a full chain; an explicit full
 * click supersedes that scoped pause. Clearing both markers here lets a fresh break write `.interrupted` and
 * become autonomously resumable again. Exported for the disk-policy regression. */
export function resetAdmittedFullRelaunch(runRoot: string): void {
  clearRunMarker(runRoot, '.interrupted')
  clearRunMarker(runRoot, '.aborted')
  resetForRelaunch(runRoot)
}

// A3: a compact one-line failure reason for the DURABLE activity log (reason + a short, whitespace-
// collapsed stderr tail). finishRun() already forwards run.note to logFinish, and the cockpit's activity
// row already renders it (a ⚠ pill + hover) — the same path the 'incomplete' note uses. So setting run.note
// here surfaces WHY a run stopped both in the queryable log and the UI, with no new field or web code (A4).
const failureNote = (reason: string, stderr: string): string =>
  reason + (stderr?.trim() ? `: ${redactSecrets(stderr.slice(-300)).replace(/\s+/g, ' ').trim()}` : '')

function publicationFailureMessage(run: RunState, reason: string): string {
  if (!run.lastProviderMessage || reason.includes('Provider final message:')) return reason
  return `${reason}\n\nProvider final message:\n${redactSecrets(run.lastProviderMessage)}`
}

interface UnresolvedExpectedArtifact {
  key: string
  outputRel: string
  cockpitStatus: string
  nativeStatuses: string[]
}

/**
 * Codex's public exec JSONL is useful telemetry, but it is not a complete child-thread ledger on every
 * CLI version. Build the terminal diagnosis from the canonical expected set plus filesystem-authoritative
 * watcher state; attach any native statuses that were observable without ever treating their absence as
 * proof that no child exists.
 */
export function unresolvedExpectedArtifacts(run: RunState): UnresolvedExpectedArtifact[] {
  return [...run.expected.values()].flatMap((expected) => {
    const agent = run.agents.get(expected.key)
    if (agent?.status === 'done') return []
    const nativeStatuses = [...run.nativeThreadToAgent.entries()]
      .filter(([, key]) => key === expected.key)
      .map(([threadId]) => run.nativeAgentStates.get(threadId) || 'observed_without_status')
    return [{
      key: expected.key,
      outputRel: expected.outputRel,
      cockpitStatus: agent?.status || 'queued',
      nativeStatuses: [...new Set(nativeStatuses)].sort(),
    }]
  })
}

function codexIncompleteOrchestrationMessage(run: RunState): string {
  const unresolved = unresolvedExpectedArtifacts(run)
  const shown = unresolved.slice(0, 20).map((item) => {
    const native = item.nativeStatuses.length ? item.nativeStatuses.join(',') : 'unobserved'
    return `- ${item.key}: missing ${item.outputRel} (cockpit=${item.cockpitStatus}; native=${native})`
  })
  const more = unresolved.length > shown.length ? `\n- ...and ${unresolved.length - shown.length} more` : ''
  const inventory = shown.length
    ? `\n\nUnresolved canonical outputs (${unresolved.length}):\n${shown.join('\n')}${more}`
    : '\n\nThe command stopped before its terminal deliverable was accepted.'
  return publicationFailureMessage(
    run,
    'Codex ended its parent orchestration before the canonical completion barrier passed.' + inventory,
  )
}

const streamResultErrors = new WeakMap<RunState, { reason: string; message: string }>()

const CODEX_AUTOMATIC_CONTINUATION_MAX = 64

export interface CodexAutomaticContinuationPlan {
  continue: boolean
  reason: string
  index?: number
  checkpoint?: string
  stagnantTurns?: number
  completedOutputs?: string[]
  unresolvedOutputs?: string[]
}

function codexContinuationTerminalOutputs(run: RunState): string[] {
  if (run.kind === 'signal') return ['RUN_METADATA.md']
  if (run.kind !== 'full' && run.kind !== 'rerun') return []
  if (run.swarmId === RESEARCH_SWARM_ID) {
    return run.kind === 'full' ? ROOT_ARTIFACTS_FULL : ROOT_ARTIFACTS_RERUN
  }
  return swarmById(run.swarmId)?.layout === 'constellation' ? decisionArtifacts(run) : []
}

const FINISH_GATE_PROVISIONAL_MARK = 'PROVISIONAL — the automated finish-gate'

function regularFileSha256(absolute: string): string | null {
  try {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink()) return null
    return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
  } catch { return null }
}

function captureCodexContinuationBaselines(run: RunState): void {
  if (run.provider !== 'codex' || run.automaticContinuationBaselines || !run.runRoot) return
  const root = path.isAbsolute(run.runRoot) ? run.runRoot : path.join(REPO_ROOT, run.runRoot)
  run.automaticContinuationBaselines = Object.fromEntries(
    codexContinuationTerminalOutputs(run).map((relative) => [
      relative, regularFileSha256(path.join(root, relative)),
    ]),
  )
}

function validCodexTerminalMarkdown(absolute: string, relative: string): boolean {
  const ordinary = validateAgentOutputFile(absolute)
  if (ordinary.valid) return true
  if (relative !== 'final_thesis.md') return false
  try {
    const lines = fs.readFileSync(absolute, 'utf8').replace(/\r\n?/g, '\n').split('\n')
    let index = 0
    while (index < lines.length && lines[index].trim() === '') index++
    if (index >= lines.length || !lines[index].startsWith('>')
        || !lines.slice(index, index + 6).join('\n').includes(FINISH_GATE_PROVISIONAL_MARK)) return false
    while (index < lines.length && lines[index].startsWith('>')) index++
    while (index < lines.length && lines[index].trim() === '') index++
    return validateAgentOutputText(lines.slice(index).join('\n')).valid
  } catch { return false }
}

function codexContinuationArtifactComplete(run: RunState, relative: string): boolean {
  if (!run.runRoot) return false
  // A full research run has not crossed its terminal publication boundary while the immutable-idea
  // marker remains, even if a RUN_METADATA file was staged during a failed publication attempt.
  if (run.kind === 'full' && run.swarmId === RESEARCH_SWARM_ID
      && relative === 'RUN_METADATA.md' && ideaPublicationPending(run.runRoot)) return false
  const root = path.isAbsolute(run.runRoot) ? run.runRoot : path.join(REPO_ROOT, run.runRoot)
  const absolute = path.join(root, relative)
  try {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink() || info.size === 0) return false
    const baselines = run.automaticContinuationBaselines
    if (baselines && Object.prototype.hasOwnProperty.call(baselines, relative)) {
      const current = regularFileSha256(absolute)
      if (current === null || current === baselines[relative]) return false
    } else if (!artifactIsFresh(run, relative)) return false
    if (relative.endsWith('.md')) return validCodexTerminalMarkdown(absolute, relative)
    if (relative.endsWith('.json')) {
      const parsed = JSON.parse(fs.readFileSync(absolute, 'utf8'))
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    }
    return true
  } catch { return false }
}

function codexContinuationInventory(run: RunState): {
  checkpoint: string
  completedOutputs: string[]
  unresolvedOutputs: string[]
} {
  const completed = [...run.expected.values()]
    .filter((expected) => run.agents.get(expected.key)?.status === 'done')
    .sort((left, right) => left.key.localeCompare(right.key))
  const unresolved = [...run.expected.values()]
    .filter((expected) => run.agents.get(expected.key)?.status !== 'done')
    .sort((left, right) => left.key.localeCompare(right.key))
  const completedOutputs = completed.map((item) => item.outputRel)
  const unresolvedOutputs = unresolved.map((item) => item.outputRel)
  const completedSet = new Set(completedOutputs)
  const unresolvedSet = new Set(unresolvedOutputs)
  const terminalCheckpoint: string[] = []
  for (const relative of codexContinuationTerminalOutputs(run)) {
    // A future discovered swarm may declare a terminal artifact that is also represented by a roster
    // agent. The filesystem verdict for a terminal artifact wins, and each path appears in one cohort.
    completedSet.delete(relative)
    unresolvedSet.delete(relative)
    if (codexContinuationArtifactComplete(run, relative)) {
      completedSet.add(relative)
      terminalCheckpoint.push(`terminal:${relative}`)
    } else {
      unresolvedSet.add(relative)
    }
  }
  return {
    // Root-terminal progress must reset the stagnant-turn guard too. Previously every module could be
    // complete while final_thesis/decision_record advanced, yet the checkpoint stayed frozen and the
    // next fresh Codex process was rejected with an empty inventory before it could publish provenance.
    checkpoint: [
      ...completed.filter((item) => completedSet.has(item.outputRel)).map((item) => item.key),
      ...terminalCheckpoint,
    ].join('\n'),
    completedOutputs: [...completedSet],
    unresolvedOutputs: [...unresolvedSet],
  }
}

/**
 * Decide whether a clean, prematurely-ended Codex process may continue inside the SAME admitted RunState.
 * Files remain the completion truth. Explicit errors, cancellation, publication activity, descendant-writer
 * races, fail-fast module exits, and two consecutive no-progress boundaries all fail closed.
 */
export function planCodexAutomaticContinuation(
  run: RunState,
  res: any,
  stderr = '',
  descendantObserved = false,
): CodexAutomaticContinuationPlan {
  if (run.provider !== 'codex') return { continue: false, reason: 'provider_not_codex' }
  if (!['module', 'full', 'rerun', 'signal'].includes(run.kind) || run.expected.size === 0) {
    return { continue: false, reason: 'scope_not_orchestrated' }
  }
  if (run.endedAt !== undefined || (run.status as string) === 'cancelled' || run.cancelRequested) {
    return { continue: false, reason: 'run_not_active' }
  }
  if (streamResultErrors.has(run) || run.streamFailure) return { continue: false, reason: 'provider_stream_error' }
  if (descendantObserved) return { continue: false, reason: 'descendant_writer_observed' }
  if (run.publicationRequested || run.publicationCompleted || run.publicationError) {
    return { continue: false, reason: 'publication_started' }
  }
  // A screener signal may deliberately stop at a terminal routing before later discovered modules run.
  // RUN_METADATA is written only after that routing is adjudicated, so it is the exact parent-completion
  // barrier; requiring every expected orb would incorrectly continue valid PARK/LOG/watchlist outcomes.
  const terminalMissing = codexContinuationTerminalOutputs(run)
    .some((relative) => !codexContinuationArtifactComplete(run, relative))
  const missingBarrier = run.kind === 'signal'
    ? terminalMissing
    : truncatedBeforeFinal(run) || terminalMissing
  if (!missingBarrier) return { continue: false, reason: 'completion_barrier_not_missing' }
  // A missing close result cannot prove a clean provider boundary and must never authorize another process.
  if (!res || typeof res !== 'object') return { continue: false, reason: 'provider_process_nonclean' }
  const code = res.exitCode ?? res.code
  const terminated = res.isTerminated === true || res.killed === true || !!res.signal
  if (terminated || res.failed === true || (typeof code === 'number' && code !== 0)) {
    return { continue: false, reason: 'provider_process_nonclean' }
  }
  const classified = getProviderAdapter(run.provider).classifyExit({
    result: res, stderr, status: run.status, cliResult: run.cliResult,
  })
  const cleanIncomplete = classified.outcome === 'success'
    || (classified.outcome === 'error' && classified.reason === 'codex_missing_turn_completed')
  if (!cleanIncomplete) return { continue: false, reason: `provider_${classified.outcome}` }

  const currentCount = run.automaticContinuationCount ?? 0
  const max = Math.min(Math.max(run.expected.size * 2 + 4, 8), CODEX_AUTOMATIC_CONTINUATION_MAX)
  if (currentCount >= max) return { continue: false, reason: 'continuation_limit_reached' }
  const inventory = codexContinuationInventory(run)
  const repeated = run.automaticContinuationCheckpoint !== undefined
    && run.automaticContinuationCheckpoint === inventory.checkpoint
  const stagnantTurns = repeated ? (run.automaticContinuationStagnantTurns ?? 0) + 1 : 0
  if (stagnantTurns >= 2) return { continue: false, reason: 'no_artifact_progress' }
  return {
    continue: true,
    reason: 'clean_incomplete_codex_process',
    index: currentCount + 1,
    checkpoint: inventory.checkpoint,
    stagnantTurns,
    completedOutputs: inventory.completedOutputs,
    unresolvedOutputs: inventory.unresolvedOutputs,
  }
}

function interruptionMarker(run: RunState, reason: string, message?: string, resetsAt?: number) {
  return {
    reason,
    resetsAt,
    module: run.module,
    message: redactSecrets((message || '').slice(-2000)) || undefined,
    provider: run.provider,
    profileKey: run.profileKey,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    executionEpoch: run.provenanceEpoch,
    runId: run.runId,
    attemptId: run.providerAttemptId ?? run.runId,
    startedAt: run.startedAt,
  }
}

function writeInterruptionMarker(run: RunState, reason: string, message?: string, resetsAt?: number): void {
  writeRunMarker(run.runRoot, '.interrupted', interruptionMarker(run, reason, message, resetsAt))
  // The run-root marker is provider-writable. Automatic restart recovery may trust it only after the
  // protected supervisor state records its exact bytes alongside the immutable provider/profile.
  try { recordProviderInterruptionAuthority(run) } catch (error: any) {
    console.error(`[resume] could not seal interruption authority for ${run.runId}: ${String(error?.message || error)}`) // eslint-disable-line no-console
  }
}

// A structured stream error is authoritative immediately, but is not process-lifetime proof: a detached
// Task/tool descendant may still be writing. Record the same marker, failure note, and activity-log note
// while retaining endedAt and writer claims for the group-extinct close finalizer. Exported so
// stream-parser.ts can call it; the two files import each other's exports but
// only from inside function bodies (never at module top level), which is safe under native ESM — a
// hoisted `export function` binding is live before either module's own top-level code runs.
// Fully best-effort: never throws (mirrors every other A2/A3 call site).
export function recordStreamResultFailure(run: RunState, reason: string, message: string): void {
  // Install close ownership semantics first. Persistence below is best-effort, but a filesystem failure must
  // never turn an authoritative streamed error back into a clean close or release its writer claim early.
  streamResultErrors.set(run, { reason, message })
  try {
    if (!run.streamFailure) run.streamFailure = { reason, message }
    const resumable = isResumableTerminalRun(run) || run.kind === 'signal'
    if (resumable && !finalDeliverablesShippedByThisAttempt(run)) {
      const resetsAt = reason === 'out_of_credits' ? getCreditStatus(run.provider).resetsAt : undefined
      writeInterruptionMarker(run, reason, message, resetsAt)
      if (isResumableResearchRun(run)) recordRunFailure(run, reason, message)
    }
    run.note = failureNote(reason, message) // A3: durable reason in the activity log (shown on the row)
    // The result is authoritative, but finalization is close-owned. Keeping endedAt unset preserves subject /
    // write claims until the detached process group is extinct; otherwise a background Task can keep writing
    // after this streamed error while a replacement run has already been admitted.
  } catch { /* best-effort: must never affect the stream parser or the run */ }
  // Do not finish/release admission here. A structured error can arrive while the detached provider
  // process (and Task descendants) are still alive. Stop its whole group, then let the close handler
  // drain that group and become the single terminal finalizer.
  killProcessTree(run)
}

export function streamResultAwaitsProcessClose(run: RunState): boolean {
  return streamResultErrors.has(run) && run.endedAt === undefined
}

/** Close-result authority shared by the real handler and regressions. It is evaluated only after the final
 * process-group extinction proof + output sweep in production. A requested Stop is non-clean even if its
 * status has deliberately stayed `running` to retain the writer claim. */
export function childCouldReportDoneOnClose(run: RunState, res: any): boolean {
  const code = res?.exitCode ?? res?.code
  const terminated = res?.isTerminated === true || res?.killed === true || !!res?.signal
  return run.endedAt === undefined && (run.status as string) !== 'cancelled' && !run.cancelRequested
    && !streamResultErrors.has(run)
    && !terminated && !(code && code !== 0) && res?.failed !== true && !truncatedBeforeFinal(run)
    && !(run.provider === 'codex' && codexContinuationTerminalOutputs(run)
      .some((relative) => !codexContinuationArtifactComplete(run, relative)))
}

// The SINGLE place a run's final status is decided on process close (exported for tests).
// Gated on `endedAt` rather than status so (a) a racing reaper/real close is never double-applied,
// and (b) a cancel() — which sets status='cancelled' directly — still gets
// finalized here and releases its subject; gating on status leaked cancelled runs' subjects and
// blocked that ticker's admission until restart. Clean stream `result` events do NOT finalize
// (stream-parser): success is decided here, AFTER the final output sweep, so the full/rerun
// missing-final-thesis integrity check can never be bypassed by an early clean result.
export function finalizeRunOnClose(run: RunState, res: any, stderr: string, terminalProof: PreSpawnGuardResult = { ok: true }) {
  if (run.endedAt !== undefined) return // already finalized (stream-parser error path)
  const outputLineageFailure = settleRunOutputLineage(run)
  if (outputLineageFailure && !run.cancelRequested && (run.status as string) !== 'cancelled') {
    run.streamFailure = {
      reason: 'output_lineage_failed',
      message: `completed output lineage could not be sealed: ${outputLineageFailure}`,
    }
    run.note = run.streamFailure.message
  }
  const finishClose = (status: RunStatus) => {
    finishRun(run, status)
    if (status === 'done') scheduleIbkrPaperAutoSyncAfterPublication(run)
    // Clear the crash-recovery lease last. If the supervisor dies anywhere before the durable terminal
    // status/marker/publication above, startup still sees the lease and holds the root for recovery.
    if (!runProcessTreeAlive(run)) clearProviderProcessLease(run.runId)
  }
  let publicationTransportFailure: string | null = null
  try { run.publicationTransportVerify?.() } catch (error: any) {
    publicationTransportFailure = String(error?.message || error)
  }
  const publicationSnapshotFailure = settlePublicationSnapshot(run)
  if (publicationSnapshotFailure) publicationTransportFailure = publicationSnapshotFailure
  releaseProviderLaunchResources(run)
  let classified = getProviderAdapter(run.provider).classifyExit({
    result: res,
    stderr,
    status: run.status,
    cliResult: run.cliResult,
  })
  if (run.streamFailure && (run.status as string) !== 'cancelled') {
    classified = {
      outcome: 'error',
      reason: run.streamFailure.reason,
      message: run.streamFailure.message,
      outOfCredits: run.streamFailure.reason === 'out_of_credits',
    }
  }
  if (publicationTransportFailure && (run.status as string) !== 'cancelled') {
    classified = { outcome: 'error', reason: 'publication_transport_changed', message: publicationTransportFailure }
  }
  // Never downgrade this into a generic missing-turn or publication error. A Codex parent can emit an
  // assistant message while native children are still working, and some CLI versions then exit zero without
  // `turn.completed`. The expected-artifact graph is the durable contract: when its terminal deliverable is
  // absent, report the exact unresolved orbs and retain everything already written for same-provider resume.
  // Explicit provider errors/quota stops keep their own reason; this refinement applies only to a claimed
  // success or the clean-exit/missing-terminal silhouette seen in the AMZN parity canary.
  if (run.provider === 'codex'
      && (truncatedBeforeFinal(run) || codexContinuationTerminalOutputs(run)
        .some((relative) => !codexContinuationArtifactComplete(run, relative)))
      && (classified.outcome === 'success'
        || (classified.outcome === 'error' && classified.reason === 'codex_missing_turn_completed'))) {
    classified = {
      outcome: 'error',
      reason: 'codex_incomplete_orchestration',
      message: codexIncompleteOrchestrationMessage(run),
    }
  }
  if (classified.outcome === 'success' && run.kind === 'parity') {
    let verified = run.parityVerificationCompleted === true
    if (verified) {
      try {
        const receipt = run.parityVerificationReceiptPath!
        assertRegularArtifact(receipt, 'verified provider-parity receipt')
        verified = `sha256:${createHash('sha256').update(fs.readFileSync(receipt)).digest('hex')}`
          === run.parityVerificationReceiptSha256
      } catch { verified = false }
    }
    if (!verified) {
      classified = {
        outcome: 'error', reason: 'parity_verification_missing',
        message: 'the parity adjudicator exited without a live supervisor-verified terminal receipt',
      }
    }
  }
  // Success is a two-party protocol for cockpit data runs: the provider authors bytes, then the
  // supervisor validates/stamps/publishes them. A clean child exit without that second half is not a
  // success, even when fresh terminal files are present. Keep this invariant here (the single finalizer),
  // not only in the execa close wrapper, so every caller and recovery path gets the same fail-closed result.
  if (classified.outcome === 'success' && run.willCommitToMain && !run.publicationCompleted) {
    classified = {
      outcome: 'error',
      reason: 'publication_failed',
      message: publicationFailureMessage(
        run,
        run.publicationError || 'the provider exited without a supervisor-owned publication request',
      ),
    }
  }
  if ((run.status as string) === 'cancelled' || run.cancelRequested) {
    if (isResumableTerminalRun(run)) clearRunMarker(run.runRoot, '.interrupted') // a deliberate stop — cancel() wrote .aborted; never auto-resume
    emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
    finishClose('cancelled')
  } else if (streamResultErrors.has(run)) {
    // The stream path emitted the detailed error while retaining claims. Only this group-extinct close
    // finalizer releases them.
    finishClose('error')
  } else if (!terminalProof.ok) {
    const terminalMessage = terminalProof.message || terminalProof.reason
    run.note = `incomplete: ${terminalProof.reason}`
    if (isResumableResearchRun(run) && run.runRoot) {
      try { writeInterruptionMarker(run, terminalProof.reason, terminalMessage) } catch { /* event remains truthful */ }
      try { recordRunFailure(run, terminalProof.reason, terminalMessage) } catch { /* best effort */ }
    }
    emit(run, {
      type: 'run-error', runId: run.runId, status: 'incomplete', reason: terminalProof.reason,
      message: terminalProof.message, ts: Date.now(),
    })
    finishClose('incomplete')
  } else if (isResumableResearchRun(run) && finalDeliverablesShippedByThisAttempt(run)
      && (!run.willCommitToMain || run.publicationCompleted)) {
    // SHIPPED before a trailing nonzero/kill: the terminal deliverables (final_thesis + decision_record) were
    // written by THIS attempt (Findings 12/14 — not just present, which a same-day stale relaunch could also
    // satisfy from an EARLIER completed run), so the research SUCCEEDED — a nonzero exit or a late kill on the
    // final commit/handoff does NOT un-ship it. Finalize as DONE, consistent with recordRunFailure's own
    // finalDeliverablesShippedByThisAttempt guard (which already skips RUN_FAILURE.md here), and never log a
    // failure reason for a run that shipped. Only full/chained research runs qualify — a rerun's folder may
    // hold the ORIGINAL run's deliverables, so a failed rerun must NOT be called done on their presence (it
    // falls through to the error branches below).
    if ((run.kind === 'full' || run.kind === 'rerun') && run.swarmId === 'research') saveMemosToCompanyFolder(run.ticker, run.runRoot)
    clearRunMarker(run.runRoot, '.interrupted')
    clearRunFailure(run.runRoot)
    emit(run, { type: 'run-done', runId: run.runId, status: 'done', costUsd: run.costUsd, durationMs: run.durationMs, numTurns: run.numTurns, ...finalPaths(run), ts: Date.now() })
    finishClose('done')
  } else if (classified.outcome === 'terminated') {
    // killed from OUTSIDE cancel() (OOM killer, manual kill, parent shutdown, a dropped connection that
    // tears the process down) — an error, not a success. Mark the folder so the resume supervisor can pick
    // the broken full run back up and continue it (forever-living: a closed laptop / lost network resumes).
    const treason = classified.reason
    const terminalMessage = classified.message || stderr
    if (isResumableTerminalRun(run)) {
      if (!finalDeliverablesShippedByThisAttempt(run)) writeInterruptionMarker(run, treason, terminalMessage)
    }
    if (shouldRecordStop(run)) recordRunFailure(run, treason, terminalMessage) // A2: diagnosable note (self-guards + single-shot)
    run.note = failureNote(treason, terminalMessage) // A3: durable reason in the activity log (shown on the row)
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: treason, message: terminalMessage.slice(-400) || undefined, ts: Date.now() })
    finishClose('error')
  } else if (classified.outcome === 'error') {
    // A clean provider exit that we converted above because publication never happened is itself a
    // publication failure, even though there was no request to set publicationRequested. Conversely,
    // a provider/quota failure before any publication request keeps its provider reason; missing a
    // request must not rewrite `out_of_credits` to `publication_failed` and lose its reset hold.
    const publicationFailure = classified.reason === 'publication_failed'
      ? publicationFailureMessage(
          run,
          classified.message || run.publicationError || 'the provider exited without a supervisor-owned publication request',
        )
      : run.willCommitToMain && run.publicationRequested === true
          && !run.publicationCompleted && run.publicationError
        ? publicationFailureMessage(run, run.publicationError)
        : null
    const reason = publicationFailure ? 'publication_failed' : classified.reason
    const errorMessage = publicationFailure || classified.message || stderr
    // Mark the broken full run for the resume supervisor. For an out_of_credits stop (the plan's usage
    // limit), stamp the rate-limit resetsAt so the paused run knows when it may continue WITHOUT spending
    // overage — durable on disk, so the wait survives a reboot. (A connection break shows up here as
    // nonzero_exit; it resumes on the next tick.)
    if (isResumableTerminalRun(run) || run.kind === 'signal') {
      const resetsAt = classified.outOfCredits ? getCreditStatus(run.provider).resetsAt : undefined
      if (publicationFailure || !finalDeliverablesShippedByThisAttempt(run)) {
        writeInterruptionMarker(run, reason, errorMessage, resetsAt)
      }
    }
    if (shouldRecordStop(run)) recordRunFailure(run, reason, errorMessage) // A2: diagnosable note (self-guards + single-shot)
    run.note = failureNote(reason, errorMessage) // A3: durable reason in the activity log (shown on the row)
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: errorMessage.slice(-400) || undefined, ts: Date.now() })
    finishClose('error')
  } else if (truncatedBeforeFinal(run)) {
    // The process exited cleanly, but a full/rerun that didn't write its terminal deliverable
    // (research: final thesis + decision record; constellation swarm: decision record) was almost
    // certainly budget/turn-truncated before the last synthesis finished. Report it honestly as
    // INCOMPLETE (not a misleading "done") so the cockpit + activity log show the truth and the
    // user can finish it / raise the cap.
    const orbs = run.kind === 'module' ? moduleOrbProgress(run.runRoot, run.module) : { landed: [], expected: 0 }
    const publicationPending = run.swarmId === RESEARCH_SWARM_ID && ideaPublicationPending(run.runRoot)
    const msg = run.kind === 'sweep'
      ? 'The scan ended without saving anything to the Inbox — it found no events, or it stopped before it could write. Nothing was added.'
      : run.kind === 'module'
        ? `The ${run.module} module stopped before writing its summary, so it has no result yet. `
          + `${orbs.landed.length}${orbs.expected ? ` of ${orbs.expected}` : ''} step(s) finished and were saved`
          + `${orbs.landed.length ? `: ${orbs.landed.map((f) => f.replace(/\.md$/, '')).join(', ')}` : ''}. `
          + 'Nothing is lost — re-run the module and it picks up from the steps already on disk.'
      : publicationPending
        ? 'The thesis finished, but immutable Ideas publication did not. The run is incomplete until a post-audit admission record freezes an admitted, not-admitted, or not-applicable result.'
      : run.swarmId === 'research'
        ? 'Run ended without the final thesis & memo — likely budget- or turn-truncated before the master synthesizer finished. Re-run from the master (or any late orb) to finish; the cap is now higher.'
        : 'Run ended without the final dossier & decision record — likely budget- or turn-truncated before the terminal synthesis finished. Re-run the terminal module to finish.'
    run.note = run.kind === 'sweep'
      ? 'incomplete: sweep wrote no inbox file'
      : run.kind === 'module'
        ? `incomplete: ${run.module} stopped before its synthesis (${orbs.landed.length}${orbs.expected ? `/${orbs.expected}` : ''} steps saved)`
        : publicationPending
          ? 'incomplete: thesis exists but immutable Ideas publication did not finish'
        : 'incomplete: no final thesis/decision (likely budget/turn truncation)'
    // Clean/incomplete provider exits are recoverable process outcomes, not a request for a human to babysit
    // a two-hour chain. Seal the exact root/provider/profile and let the progress-aware supervisor continue
    // only while protected outputs advance; its durable no-progress bound turns a genuinely impossible loop
    // into Needs attention without redoing valid work or widening Continue into Full.
    if (isResumableResearchRun(run) && run.runRoot) {
      try { writeInterruptionMarker(run, 'incomplete_deliverables', run.note ?? msg) } catch { /* event remains truthful */ }
    }
    if (shouldRecordStop(run)) recordRunFailure(run, 'incomplete_deliverables', run.note ?? '')
    emit(run, { type: 'run-error', runId: run.runId, status: 'incomplete', reason: 'incomplete_deliverables', message: msg, ts: Date.now() })
    finishClose('incomplete')
  } else {
    // a completed research full/rerun has the 3 memos — copy them into the company's Drive folder
    // (timestamped). Constellation swarms (e.g. commodity) have no such memos, so this is research-only.
    if ((run.kind === 'full' || run.kind === 'rerun') && run.swarmId === 'research') saveMemosToCompanyFolder(run.ticker, run.runRoot)
    // Clear the interrupted-marker only when the WHOLE run is finished (final thesis + decision record on
    // disk). A single chained MODULE finishing 'done' must NOT clear a marker a FAILED sibling just wrote
    // — that would lose a genuine interruption and strand the run unresumable. Final deliverables are
    // present only after the master synthesis, so this fires once, at true completion.
    // finalDeliverablesShippedByThisAttempt (not mere presence) — else a SIBLING chained module finishing
    // cleanly while stale deliverables sit in the folder from an earlier completed run could clear a
    // FRESH RUN_FAILURE.md that a different sibling's genuine failure just wrote for THIS same attempt.
    if (isResumableTerminalRun(run)
        && (run.swarmId !== RESEARCH_SWARM_ID || finalDeliverablesShippedByThisAttempt(run))) {
      clearRunMarker(run.runRoot, '.interrupted')
      if (isResumableResearchRun(run)) clearRunFailure(run.runRoot) // drop a stale RUN_FAILURE.md from an earlier break of this now-complete run
    }
    emit(run, { type: 'run-done', runId: run.runId, status: 'done', costUsd: run.costUsd, durationMs: run.durationMs, numTurns: run.numTurns, ...finalPaths(run), ts: Date.now() })
    finishClose('done')
  }
}

// Is a process id still alive? `kill(pid, 0)` sends no signal — it only probes existence. ESRCH = the
// process is gone (dead); EPERM = it exists but isn't ours to signal (still alive). Any other outcome
// (including success) means alive. A missing pid counts as not-alive so a child we never got a pid for
// is treated as dead rather than pinning the subject forever.
function signalTargetAlive(target: number): boolean {
  try { process.kill(target, 0); return true } catch (e: any) { return e?.code === 'EPERM' }
}

/** A detached Claude child is its process-group leader. The leader can exit while a Task/tool descendant
 * keeps the group (and its file writes) alive, so cancellation proof must check both the negative PGID and
 * the leader PID. `probe` is injectable for the leader-dead/descendant-alive regression. */
export function processTreeAlive(
  pid: number | undefined,
  probe: (target: number) => boolean = signalTargetAlive,
): boolean {
  if (!pid) return false
  const groupAlive = probe(-pid)
  const leaderAlive = probe(pid)
  return groupAlive || leaderAlive
}

export interface CloseProcessGroupProof {
  extinct: boolean
  descendantObserved: boolean
  forced: boolean
}

export interface CloseProcessGroupProofOptions {
  probe?: (target: number) => boolean
  signalGroup?: (pid: number, signal: NodeJS.Signals) => void
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  termGraceMs?: number
  killGraceMs?: number
  pollMs?: number
}

const CLOSE_DESCENDANT_TERM_GRACE_MS = 500
const CLOSE_DESCENDANT_KILL_GRACE_MS = 2500
const CLOSE_DESCENDANT_POLL_MS = 50

const defaultSignalProcessGroup = (pid: number, signal: NodeJS.Signals) => {
  try { process.kill(-pid, signal) } catch { /* ESRCH = already extinct; EPERM remains visible to the probe */ }
}

/**
 * A detached leader resolving is not proof that its Task/tool descendants stopped. Before ANY final sweep,
 * terminal publication, or claim release, probe the process group, give survivors a short TERM grace, then
 * force KILL and prove extinction. Injectable timing/signals make the leader-dead/descendant-live race a
 * deterministic regression instead of relying only on a source-order assertion.
 */
export async function proveCloseProcessGroupExtinct(
  pid: number | undefined,
  options: CloseProcessGroupProofOptions = {},
): Promise<CloseProcessGroupProof> {
  if (!pid) return { extinct: true, descendantObserved: false, forced: false }
  const probe = options.probe ?? signalTargetAlive
  const signalGroup = options.signalGroup ?? defaultSignalProcessGroup
  const now = options.now ?? Date.now
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const pollMs = Math.max(1, options.pollMs ?? CLOSE_DESCENDANT_POLL_MS)
  const groupAlive = () => probe(-pid)
  const waitUntil = async (deadline: number): Promise<boolean> => {
    while (groupAlive() && now() < deadline) await sleep(Math.min(pollMs, Math.max(1, deadline - now())))
    return !groupAlive()
  }

  if (!groupAlive()) return { extinct: true, descendantObserved: false, forced: false }
  try { signalGroup(pid, 'SIGTERM') } catch { /* the final probe remains authoritative */ }
  if (await waitUntil(now() + Math.max(0, options.termGraceMs ?? CLOSE_DESCENDANT_TERM_GRACE_MS))) {
    return { extinct: true, descendantObserved: true, forced: false }
  }

  try { signalGroup(pid, 'SIGKILL') } catch { /* the final probe remains authoritative */ }
  const extinct = await waitUntil(now() + Math.max(0, options.killGraceMs ?? CLOSE_DESCENDANT_KILL_GRACE_MS))
  return { extinct, descendantObserved: true, forced: true }
}

export function descendantCloseTerminalProof(
  descendantObserved: boolean,
  childCouldReportDone: boolean,
  outputProof: PreSpawnGuardResult,
): PreSpawnGuardResult {
  // Preserve a content/publication failure from the exact terminal guard: it carries the durable pending
  // marker (when bytes are valid) or an invalid-output reason that makes the next plan retry. Only after that
  // recovery authority succeeds do we replace success with the orphan-writer incomplete diagnosis.
  if (!descendantObserved || !childCouldReportDone || !outputProof.ok) return outputProof
  return {
    ok: false,
    reason: 'descendant_process_survived_close',
    message: 'The engine leader exited while a background task was still writing. The task was stopped and the completed bytes were checked; re-run this scope before relying on the result.',
  }
}

async function holdClaimsUntilProcessGroupExtinct(pid: number | undefined): Promise<void> {
  if (!pid) return
  // SIGKILL was already sent by the bounded proof. If the kernel still reports the group (usually a zombie
  // awaiting reaping), do not guess: retain every subject/write claim and passively wait for real extinction.
  // This intentionally has no timeout: returning while a writer can still exist would release the claims and
  // let a replacement corrupt the same run root. The async interval yields to the event loop while failing safe.
  while (signalTargetAlive(-pid)) await new Promise<void>((resolve) => setTimeout(resolve, 250))
}

// A tracked provider is spawned detached, so its pid is also the process-group id inherited by every Task
// descendant. The leader can exit before a descendant (especially while the SIGKILL fallback is pending),
// therefore probing only child.pid is not a safe writer-drain barrier. Prefer the captured group id and use
// the leader probe only for legacy/test RunState objects created before processGroupPid existed.
function runProcessTreeAlive(run: RunState): boolean {
  if (run.processGroupPid) return processGroupAlive(run.processGroupPid)
  return processTreeAlive(run.child?.pid)
}

interface ProviderProcessLease {
  schema_version: 'cockpit-provider-process/1.0'
  run_id: string
  /** Exact provider process inside the logical run. Absent only on pre-continuation leases. */
  attempt_id?: string
  run_root: string
  subject: string
  swarm: string
  kind: RunKind
  provider: RunProvider
  profile_key: string
  model: string
  reasoning_level?: string
  execution_profile: ProviderExecutionProfile
  pid: number
  process_started: string
  run_started_at: number
  /** Present only for a transaction-owned gated trampoline. `released` on disk is the paid boundary. */
  spawn_gate_id?: string
  spawn_gate_request_id?: string
  self_sha256: string
}

const providerProcessLeaseDir = path.join(STATE_DIR, 'provider-process-groups')
const providerProcessLeasePath = (runId: string) => path.join(providerProcessLeaseDir, `${runId}.json`)

function processIdentity(pid: number): { pgid: number; started: string } | null {
  try {
    const raw = execFileSync('ps', ['-o', 'pgid=', '-o', 'lstart=', '-p', String(pid)], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const match = /^(\d+)\s+(.+)$/.exec(raw)
    if (!match) return null
    return { pgid: Number(match[1]), started: match[2].trim() }
  } catch { return null }
}

function leaseDigest(value: Omit<ProviderProcessLease, 'self_sha256'>): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`
}

function persistProviderProcessLease(run: RunState, spawnGate?: ProviderSpawnGate): {
  pid: number
  processStarted: string
  leaseSha256: string
} {
  const pid = run.processGroupPid
  if (!pid || !run.runRoot) throw new Error('provider process lease requires a process group and run root')
  if (spawnGate && (spawnGate.identity.runId !== run.runId
      || spawnGate.identity.providerAttemptId !== (run.providerAttemptId ?? run.runId)
      || spawnGate.identity.runRoot !== run.runRoot)) {
    throw new Error('provider spawn gate does not match the exact provider process')
  }
  const identity = processIdentity(pid)
  if (!identity || identity.pgid !== pid) throw new Error('spawned provider is not its own process-group leader')
  fs.mkdirSync(providerProcessLeaseDir, { recursive: true, mode: 0o700 })
  fs.chmodSync(providerProcessLeaseDir, 0o700)
  const unsigned: Omit<ProviderProcessLease, 'self_sha256'> = {
    schema_version: 'cockpit-provider-process/1.0', run_id: run.runId,
    attempt_id: run.providerAttemptId ?? run.runId, run_root: run.runRoot,
    subject: run.subjectId, swarm: run.swarmId, kind: run.kind, provider: run.provider,
    profile_key: run.profileKey, model: run.model, reasoning_level: run.reasoningLevel,
    execution_profile: run.executionProfile, pid, process_started: identity.started,
    run_started_at: run.startedAt,
    ...(spawnGate ? {
      spawn_gate_id: spawnGate.gateId,
      spawn_gate_request_id: spawnGate.identity.requestId,
    } : {}),
  }
  const lease: ProviderProcessLease = { ...unsigned, self_sha256: leaseDigest(unsigned) }
  const target = providerProcessLeasePath(run.runId)
  const temporary = `${target}.${process.pid}.tmp`
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600)
    fs.writeFileSync(descriptor, JSON.stringify(lease, null, 2) + '\n')
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    fs.renameSync(temporary, target)
    syncDirectory(providerProcessLeaseDir)
    return { pid, processStarted: identity.started, leaseSha256: lease.self_sha256 }
  } catch (error) {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ }
    try { fs.unlinkSync(temporary) } catch { /* absent */ }
    throw error
  }
}

function clearProviderProcessLease(runId: string, preserveSpawnGate = false): void {
  const target = providerProcessLeasePath(runId)
  try {
    const lease = readProviderProcessLease(target)
    const info = fs.lstatSync(target)
    if (info.isFile() && !info.isSymbolicLink()) {
      fs.unlinkSync(target)
      syncDirectory(providerProcessLeaseDir)
      if (lease?.spawn_gate_id && !preserveSpawnGate) {
        try { removeProviderSpawnGate(lease.spawn_gate_id) } catch { /* startup sweep remains fail closed */ }
      }
    }
  } catch { /* absent or unsafe entries are reconciled on startup */ }
}

function readProviderProcessLease(absolute: string): ProviderProcessLease | null {
  try {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink() || fs.realpathSync(absolute) !== absolute) return null
    const value = JSON.parse(fs.readFileSync(absolute, 'utf8')) as ProviderProcessLease
    if (value.schema_version !== 'cockpit-provider-process/1.0' || !/^[0-9a-f-]{36}$/.test(value.run_id)
        || (value.attempt_id !== undefined && !/^[0-9a-f-]{36}$/.test(value.attempt_id))
        || typeof value.run_root !== 'string' || typeof value.subject !== 'string'
        || typeof value.swarm !== 'string' || !['claude', 'codex'].includes(value.provider)
        || !Number.isSafeInteger(value.pid) || value.pid <= 1 || typeof value.process_started !== 'string'
        || typeof value.profile_key !== 'string' || typeof value.model !== 'string'
        || ((value.spawn_gate_id === undefined) !== (value.spawn_gate_request_id === undefined))
        || (value.spawn_gate_id !== undefined && (!/^[0-9a-f-]{36}$/.test(value.spawn_gate_id)
          || !/^[0-9a-f-]{36}$/.test(value.spawn_gate_request_id!)))
        || !value.execution_profile || typeof value.execution_profile !== 'object') return null
    const { self_sha256, ...unsigned } = value
    return self_sha256 === leaseDigest(unsigned) ? value : null
  } catch { return null }
}

/** Kill and seal any detached provider group left by SIGKILL/OOM before this process admits work. */
export async function reconcileOrphanedProviderGroups(): Promise<number> {
  fs.mkdirSync(providerProcessLeaseDir, { recursive: true, mode: 0o700 })
  fs.chmodSync(providerProcessLeaseDir, 0o700)
  let reconciled = 0
  for (const entry of fs.readdirSync(providerProcessLeaseDir, { withFileTypes: true })) {
    if (!entry.name.endsWith('.json')) continue
    const absolute = path.join(providerProcessLeaseDir, entry.name)
    if (!entry.isFile() || entry.isSymbolicLink()) {
      throw new Error(`unsafe provider-process lease entry: ${entry.name}`)
    }
    const lease = readProviderProcessLease(absolute)
    if (!lease || entry.name !== `${lease.run_id}.json`) {
      throw new Error(`invalid provider-process lease: ${entry.name}`)
    }
    const gate = lease.spawn_gate_id ? inspectProviderSpawnGate(lease.spawn_gate_id) : null
    const provenUnreleasedGate = gate !== null && (gate.state === 'waiting' || gate.state === 'aborted')
      && gate.intent.requestId === lease.spawn_gate_request_id
      && gate.intent.runId === lease.run_id
      && gate.intent.providerAttemptId === (lease.attempt_id ?? lease.run_id)
      && gate.intent.runRoot === lease.run_root
    const identity = processIdentity(lease.pid)
    if (identity && identity.pgid === lease.pid && identity.started === lease.process_started) {
      try { process.kill(-lease.pid, 'SIGTERM') } catch { /* exited between proof and signal */ }
      const termDeadline = Date.now() + 1000
      while (signalTargetAlive(-lease.pid) && Date.now() < termDeadline) {
        await new Promise<void>((resolve) => setTimeout(resolve, 25))
      }
      if (signalTargetAlive(-lease.pid)) {
        try { process.kill(-lease.pid, 'SIGKILL') } catch { /* exited between proof and signal */ }
      }
      while (signalTargetAlive(-lease.pid)) await new Promise<void>((resolve) => setTimeout(resolve, 25))
    }
    if (provenUnreleasedGate) {
      // The detached process was only the trampoline. Its owner-only gate was never released, so the paid
      // provider command could not have run. Transaction recovery may safely restore/retry the exact root;
      // do not manufacture an interruption marker for work that was provably never started.
      reconciled++
      clearProviderProcessLease(lease.run_id)
      continue
    }
    // A surviving lease proves the prior supervisor never owned a clean terminal close, even if the
    // detached group happened to exit before this reconciliation. Preserve the bytes, but require an
    // explicit provider-aware continuation instead of inferring completion from provider-authored files.
    try {
      writeRunMarker(lease.run_root, '.interrupted', {
        reason: 'supervisor_restart', provider: lease.provider, profileKey: lease.profile_key,
        model: lease.model, reasoningLevel: lease.reasoning_level,
        runId: lease.run_id, attemptId: lease.attempt_id ?? lease.run_id, startedAt: lease.run_started_at,
      })
      recordProviderInterruptionAuthority({
        runId: lease.run_id, providerAttemptId: lease.attempt_id ?? lease.run_id,
        runRoot: lease.run_root, provider: lease.provider,
        profileKey: lease.profile_key, model: lease.model, reasoningLevel: lease.reasoning_level,
        executionProfile: lease.execution_profile,
      })
    } catch (error: any) {
      throw new Error(`orphan ${lease.run_id} was stopped but resume authority could not be sealed: ${String(error?.message || error)}`)
    }
    reconciled++
    clearProviderProcessLease(lease.run_id)
  }
  reconciled += sweepUnreleasedProviderSpawnGates()
  return reconciled
}

/** Graceful shutdown writer barrier: stop every provider group and wait before releasing the singleton. */
export async function drainProviderRunsForShutdown(): Promise<void> {
  const active = listRuns().filter((run) => run.endedAt === undefined)
  // Freeze every scheduler first, but retain its deployment/subject leases while pre-spend extractors
  // drain. Shutdown must not advertise an idle engine while an OCR/converter descendant still writes.
  stopAllChainScheduling()
  for (const run of active) if (run.chained) haltChain(run.chainId)
  await Promise.all(active.map(async (run) => {
    await abortChainedReadiness(run.chainId)
    await abortRunReadiness(run)
  }))
  releaseAllSubjectChainReservations()
  for (const run of active) {
    if (run.endedAt !== undefined) continue
    if (run.child) {
      if (isResumableTerminalRun(run) || run.kind === 'signal') {
        try { writeInterruptionMarker(run, 'supervisor_shutdown', 'The cockpit stopped while this run was active.') } catch { /* best effort */ }
      }
      killProcessTree(run)
    } else {
      emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'supervisor_shutdown', ts: Date.now() })
      finishRun(run, 'error')
    }
  }
  const spawned = active.filter((run) => run.child)
  if (spawned.length && !(await awaitRunsExited(spawned, 15_000))) {
    throw new Error('provider process groups did not drain during graceful shutdown')
  }
  for (const run of spawned) {
    if (run.endedAt === undefined) finalizeRunOnClose(run, { isTerminated: true, signal: 'SIGTERM' }, '')
    clearProviderProcessLease(run.runId)
  }
}

const MODEL_WRITABLE_TOP_LEVEL = new Set(['analyses', 'screener', 'commodity', 'watchlist', 'data'])

/** Minimal output allowlist for one tracked run. Paths may not exist yet; adapters must enforce them as
 * future-capable exact descendants while treating the rest of the repo and shared data pool as read-only. */
export function providerWritablePaths(run: RunState): string[] {
  if (!run.runRoot) return [...new Set(run.writeTargetsAbs.map((value) => path.resolve(value)))]
  const root = path.resolve(REPO_ROOT, run.runRoot)
  if (run.kind === 'full' || run.kind === 'signal') return [root]
  if (run.kind === 'review') return [path.join(root, 'reviews')]
  if (run.kind === 'doc-intake') return [path.join(root, 'intake')]
  if (run.kind === 'module' && run.module && run.module !== 'master') return [path.join(root, run.module)]
  if (run.kind === 'agent' || run.kind === 'screener-agent') {
    return [...new Set(run.writeTargetsAbs.map((value) => path.resolve(value)))]
  }
  if (run.kind === 'rerun') {
    const moduleRoots = run.coveredModules.map((module) => path.join(root, module))
    const rootFiles = run.writeTargetsAbs.filter((value) => path.dirname(path.resolve(value)) === root)
    return [...new Set([...moduleRoots, ...rootFiles.map((value) => path.resolve(value))])]
  }
  // Sweep, handoff, conviction, track, parity, and master synthesis declare every shared/root output
  // explicitly at admission. Do not widen a single file into its parent shared history directory.
  return [...new Set(run.writeTargetsAbs.map((value) => path.resolve(value)))]
}

/** Paths a tracked provider may read but must never mutate through model-authored tools/subprocesses. */
function providerProtectedWritePaths(run: RunState): string[] {
  const protectedPaths = new Set<string>()
  // The model writes research data, not the engine/prompt program which validates and publishes it.
  for (const entry of fs.readdirSync(REPO_ROOT, { withFileTypes: true })) {
    if (!MODEL_WRITABLE_TOP_LEVEL.has(entry.name)) protectedPaths.add(path.resolve(REPO_ROOT, entry.name))
  }
  protectedPaths.add(path.resolve(STATE_DIR))
  protectedPaths.add(path.resolve(REPO_ROOT, '.git')) // worktree .git may itself be a pointer file
  for (const args of [['rev-parse', '--absolute-git-dir'], ['rev-parse', '--git-common-dir']]) {
    try {
      const raw = execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
      if (raw) protectedPaths.add(path.resolve(REPO_ROOT, raw))
    } catch { /* availability/assertion later fails closed if the repository itself is unavailable */ }
  }
  // The terminal model may author commodity decision_record.json, but only the supervisor may create the
  // immutable content-addressed archive. Unsetting cockpit env therefore cannot take the standalone path.
  if (run.swarmId === 'commodity' && run.runRoot) {
    protectedPaths.add(path.resolve(REPO_ROOT, run.runRoot, 'decisions'))
  }
  // Reviews are append-only historical observations. Only a tracked review run may create a new file;
  // research/full/rerun/module providers must never rewrite the outcome history retained in their root.
  if (run.runRoot && run.kind !== 'review') {
    protectedPaths.add(path.resolve(REPO_ROOT, run.runRoot, 'reviews'))
  }
  // A screener thesis becomes immutable only when the supervisor derives it from the fresh run-local
  // thesis and stamps it. Provider children may author the run-local record, but never the shared ledger
  // copy consumed by handoff/conviction/calibration.
  protectedPaths.add(path.resolve(REPO_ROOT, 'screener', 'ledger', 'theses'))
  // A full-chain provider may read its supervisor-verified generation, but it may never rewrite the
  // evidence receipt or bytes. This carve-out matters for full runs because their ordinary writable
  // root contains `_pool_extracts`.
  const frozenEvidence = providerEvidenceBinding(run)
  if (frozenEvidence) {
    protectedPaths.add(frozenEvidence.frozenPool.generationDir)
    protectedPaths.add(frozenEvidence.capability.root)
  }
  // Continue activation may place already-paid, lineage-verified orb outputs beside the payable files this
  // child must author. A module/root writable grant is too broad by itself: protect each reused file as an
  // exact read-only exception in both provider sandboxes. The same immutable set is hashed before/after the
  // child below, so an adapter or OS-policy regression fails the run rather than laundering rewritten bytes.
  for (const output of immutableReusedOutputsByRun.get(run) ?? []) protectedPaths.add(output.absolutePath)
  return [...protectedPaths]
}

/** Paths a bound chain provider must not read at all. Its evidence is the immutable generation, never
 * the live Drive tree which may change while a two-hour chain is running. */
function liveDataPathAliases(dataPath: string): string[] {
  const aliases = new Set<string>([path.resolve(dataPath)])
  try { aliases.add(fs.realpathSync(dataPath)) } catch {
    // A disappeared live path is already unusable and the lexical deny remains in force. When present,
    // the canonical target is mandatory so a provider cannot bypass a DATA_DIR symlink via Drive's path.
  }
  return [...aliases]
}

function pathIsWithin(candidate: string, parent: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

/** Deny the mixed projection namespace itself, not a spawn-time enumeration of its children. The exact
 * generation is copied into an external read capability, so every current or future child beneath the
 * original `_pool_extracts` path remains mechanically unreachable for the whole sandbox lifetime. */
function mutablePoolProjectionReadAliases(frozenPool: FrozenPoolBinding): string[] {
  const outDir = path.resolve(frozenPool.outDir)
  const candidates = [outDir, path.join(path.dirname(outDir), 'relationships.json')]
  const denied = new Set<string>()
  for (const candidate of candidates) {
    for (const alias of liveDataPathAliases(candidate)) denied.add(alias)
  }
  return [...denied]
}

function providerProtectedReadPaths(run: RunState): string[] {
  const protectedPaths = new Set<string>([path.resolve(STATE_DIR)])
  const frozenEvidence = providerEvidenceBinding(run)
  if (frozenEvidence) {
    // A frozen chain has no business reading any mutable Drive company, not only its own ticker. Deny the
    // complete live data namespace so a future sibling/upload cannot appear after sandbox construction.
    for (const alias of liveDataPathAliases(DATA_DIR)) protectedPaths.add(alias)
    for (const alias of liveDataPathAliases(frozenEvidence.frozenPool.dataPath)) protectedPaths.add(alias)
    for (const alias of mutablePoolProjectionReadAliases(frozenEvidence.frozenPool)) protectedPaths.add(alias)
  }
  if (exactModuleResumeRuns.has(run) && run.runRoot && run.module) {
    // The private transaction keeps unrelated module folders byte-identical so a scoped repair cannot erase
    // prior work. They are not evidence for this child, though: only the selected module and the planner's
    // exact saved-input allowlist were lineage-verified. Deny every other discovered sibling mechanically in
    // both provider sandboxes; prompt/env guidance alone is not a security boundary.
    const readable = new Set([run.module, ...(exactModuleInputsByRun.get(run) ?? [])])
    const siblingNames = new Set(buildSwarmGraph(run.swarmId || RESEARCH_SWARM_ID).modules
      .map((candidate) => candidate.name))
    // Historical/removed modules may still exist in the saved root but no longer appear in today's graph.
    // They are the most dangerous ambient evidence: enumerate every present directory/symlink as well as the
    // current graph, then deny it unless the reviewed lineage allowlist named it positively.
    try {
      for (const entry of fs.readdirSync(path.resolve(REPO_ROOT, run.runRoot), { withFileTypes: true })) {
        if (entry.isDirectory() || entry.isSymbolicLink()) siblingNames.add(entry.name)
      }
    } catch {
      // The exact paid boundary separately requires the prepared root to exist. Keep the graph-level future
      // denies here so a missing/raced root cannot turn into a permissive sibling policy.
    }
    for (const sibling of siblingNames) {
      if (!readable.has(sibling)) {
        protectedPaths.add(path.resolve(REPO_ROOT, run.runRoot, sibling))
      }
    }
  }
  return [...protectedPaths]
}

function providerReadOnlyCapabilityPaths(run: RunState): string[] {
  const frozenEvidence = providerEvidenceBinding(run)
  return frozenEvidence ? [frozenEvidence.capability.root] : []
}

/** Deterministic seam for the lexical + canonical live-pool deny boundary. */
export function liveDataPathAliasesForTest(dataPath: string): string[] {
  return liveDataPathAliases(dataPath)
}

/** Deterministic seam for the mutable-projection deny boundary. */
export function mutablePoolProjectionReadAliasesForTest(frozenPool: FrozenPoolBinding): string[] {
  return mutablePoolProjectionReadAliases(frozenPool)
}

/** Deterministic seam proving Claude and Codex receive the same frozen-evidence sandbox boundary. */
export function providerProtectionPathsForTest(run: RunState): {
  protectedWritePaths: string[]
  protectedReadPaths: string[]
} {
  return {
    protectedWritePaths: providerProtectedWritePaths(run),
    protectedReadPaths: providerProtectedReadPaths(run),
  }
}

/** Test-only binding seam for the launch-private exact module read scope. */
export function bindExactModuleReadScopeForTest(run: RunState, inputs: string[]): void {
  exactModuleResumeRuns.add(run)
  exactModuleInputsByRun.set(run, [...new Set(inputs)].sort())
}

// After a FORCE cancel, block until the stopped run(s)' WHOLE detached process groups have actually EXITED
// before admission starts a replacement. cancel() only SIGTERMs (killProcessTree SIGKILLs the group +2s
// later) and returns BEFORE the processes die, yet the run has already left the in-flight status set — so
// without this wait admitRun would start a SECOND engine writing the SAME run dir concurrently. The
// cancelled run is no longer in inFlightRunsForSubject, so callers must hold the RunState objects and pass
// them here. Returns true once every group is gone; false if any descendant is still alive at the timeout
// (caller must then NOT admit). `now`/`sleep` are injectable so unit tests can drive it without real time.
const FORCE_STOP_WAIT_MS = 5000 // > killProcessTree's 2s SIGKILL fallback + OS-delivery/finalize margin
export async function awaitRunsExited(
  runs: RunState[],
  timeoutMs: number = FORCE_STOP_WAIT_MS,
  now: () => number = Date.now,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<boolean> {
  // A clean exact-module child can be gone while its terminal Git publisher is still writing/rebasing the
  // same module folder. Treat that async publisher as part of the writer lifecycle: force must not admit a
  // replacement merely because the paid process PID has disappeared.
  const anyAlive = () => runs.some((r) => runProcessTreeAlive(r)
    || runHasUnfinishedTerminalWork(r) || terminalGuardOwnsClose(r) || processCloseOwnsFinalization(r))
  const deadline = now() + timeoutMs
  while (anyAlive() && now() < deadline) await sleep(50)
  return !anyAlive()
}

/** Fail closed before a cancelled subject can be launched again. The cancellation path removes runs from
 * the in-flight registry before their child processes necessarily exit, so a timeout is not success: the
 * old process may still be writing the same run root. The injectable waiter keeps the timeout branch
 * deterministic in tests without sending signals to the test runner itself. */
export async function requireSubjectRunsExited(
  subjectId: string,
  runs: RunState[],
  waitForExit: (runs: RunState[]) => Promise<boolean> = awaitRunsExited,
): Promise<void> {
  if (!runs.length || await waitForExit(runs)) return
  const err: any = new Error(`Could not confirm that the old run on ${subjectId} stopped. Try again shortly.`)
  err.statusCode = 409
  throw err
}

/** A child can exit before execa delivers its close callback (or the callback can be lost). Once PID exit is
 * confirmed, finalize captured cancelled runs synchronously so the route's endedAt-based busy check cannot
 * strand the subject forever. finalizeRunOnClose is endedAt-gated, so a racing real close stays idempotent. */
export function finalizeConfirmedSubjectCancellation(runs: RunState[]): void {
  for (const run of runs) {
    if (run.endedAt === undefined && !runHasUnfinishedTerminalWork(run) && !terminalGuardOwnsClose(run)
        && !processCloseOwnsFinalization(run)
        && ((run.status as string) === 'cancelled' || run.cancelRequested)) {
      finalizeRunOnClose(run, { isTerminated: true, signal: 'SIGKILL' }, '')
    }
  }
}

/** Include a previously-cancelled-but-unfinalized child on every retry. Restricting this to display
 * statuses lets a second force attempt forget the still-alive first writer. */
export function subjectRunsAwaitingExit(subjectId: string, swarmId = RESEARCH_SWARM_ID): RunState[] {
  return listRuns().filter((run) => run.endedAt === undefined
    && run.subjectId === subjectId && run.swarmId === swarmId)
}

// Reap any in-flight run on this subject whose engine CHILD PROCESS is gone but whose close handler never
// fired — a wedged pipe, a lost 'close' event, a child the OS reaped without notifying us. Such a run
// would hold its subject claim + write targets forever and block every future launch on that subject (the
// "stuck forever, can never run anything again" failure). inFlightRunsForSubject already self-heals on
// STATUS, but a dead-yet-'running' child is invisible to it — so we probe the pid and finalize the corpse
// as an interruption (releasing the claim) the same way an external kill would. Pre-spawn gate states
// (run.child === null: readiness-checking / awaiting-readiness-decision) are LEGITIMATELY waiting for the
// user, not dead — left untouched (a deliberate force stops those instead). Returns the reaped run ids.
// Called on every launch attempt so a stuck subject auto-recovers with zero user action.
export function reapDeadSubjectRuns(subjectId: string, swarmId = RESEARCH_SWARM_ID): string[] {
  const reaped: string[] = []
  for (const r of inFlightRunsForSubject(subjectId, swarmId)) {
    if (reapDeadRun(r)) reaped.push(r.runId)
  }
  return reaped
}

// Reap a single run only if its whole engine process tree is gone but onClose never fired. A dead leader
// with a live Task descendant is still a live writer and must retain the lock. Returns true if finalized.
// Pre-spawn gate states (run.child === null: readiness-checking / awaiting-readiness-decision) are
// LEGITIMATELY waiting for the user, not dead — left untouched (a deliberate force stops those).
function reapDeadRun(r: RunState): boolean {
  if (!r.child) return false // pre-spawn gate — waiting on the human, not a dead process
  if (runProcessTreeAlive(r)) return false // leader or detached descendant still alive — leave it running
  // The real close handler owns final output sweep/publication/status once it starts. This applies to every
  // run, not only exact modules with a terminal guard: force/reaper cannot finalize in its extinction-proof
  // await and release claims before the handler has observed the last possible descendant write.
  if (processCloseOwnsFinalization(r)) return false
  // A terminal guard owns close from admission, including the short interval before execa invokes onClose.
  // Give the real handler its grace period; if it was genuinely lost, the bounded watchdog executes the
  // memoized proof and single finalizer. Never release this run's claims through the generic reap path.
  if (terminalGuardOwnsClose(r)) {
    inspectTerminalCloseWatchdog(r)
    return false
  }
  // onClose owns the completed child's final publication and status decision. The PID being dead is expected
  // here; reaping while its async guard is active would release subject/write claims mid-commit.
  if (runHasUnfinishedTerminalWork(r)) return false
  // The whole tree is gone but onClose never ran. Route it through the SINGLE finalizer as a termination so a
  // resumable full/rerun gets its .interrupted marker (the supervisor can continue it) and the subject
  // claim + write targets release — exactly the path an OOM/manual kill would take.
  finalizeRunOnClose(r, { isTerminated: true, signal: 'SIGKILL' }, '')
  // eslint-disable-next-line no-console
  console.warn(`[reap] ${r.subjectId}: finalized a run whose engine process had died (${r.runId}) — releasing its lock`)
  return true
}

// Reap EVERY in-flight run whose engine process has died, across ALL subjects. The per-subject reaper
// releases the launch's own subject lock, but admission's GLOBAL concurrency cap (D5) counts every
// in-flight run regardless of subject — so dead children on OTHER subjects still consume the cap and make
// a DIFFERENT-subject launch fail `capacity` even though that capacity is held by corpses. Sweeping the
// whole registry before admission finalizes those corpses too, so the cap reflects live runs only.
// Same finalize path and same safety as the per-subject reaper (only genuinely-dead pids are touched).
// Returns the reaped run ids.
export function reapAllDeadRuns(): string[] {
  const reaped: string[] = []
  for (const r of listRuns()) {
    if (r.endedAt !== undefined) continue
    if (reapDeadRun(r)) reaped.push(r.runId)
  }
  return reaped
}

function memosFolderName(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `Memos ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`
}

// Save the three finished memos into the company's Google Drive folder, in a fresh date-and-time-stamped
// subfolder, so they're shareable from Drive. A .nostradamus_output sentinel marks the folder so the data
// pool (extract_pool.py) never re-ingests these outputs as input. Best-effort: never throws into the run
// lifecycle (a Drive write failure must not fail the run).
function saveMemosToCompanyFolder(ticker: string, runRoot: string | null): void {
  try {
    if (!runRoot) return
    const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
    const companyDir = path.join(DATA_DIR, ticker)
    if (!fs.existsSync(companyDir)) return // no Drive folder for this ticker (e.g. cleaned up)
    const docs: [string, string][] = [
      ['final_thesis.md', `${ticker} - Investment Thesis.md`],
      ['memo.md', `${ticker} - Memo.md`],
      ['audit_dossier.md', `${ticker} - Full Dossier.md`],
    ]
    const present = docs.filter(([src]) => fs.existsSync(path.join(root, src)))
    if (!present.length) return
    const dest = path.join(companyDir, memosFolderName())
    fs.mkdirSync(dest, { recursive: true })
    fs.writeFileSync(path.join(dest, '.nostradamus_output'), 'Engine-written research output — excluded from the data pool so a future run never re-ingests it.\n')
    for (const [src, nice] of present) fs.copyFileSync(path.join(root, src), path.join(dest, nice))
    // eslint-disable-next-line no-console
    console.log(`[memos→drive] ${ticker}: saved ${present.length} document(s) to ${dest}`)
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[memos→drive] failed for', ticker, e?.message || e)
  }
}

// A solo agent writes into the run folder its slash command will resolve: today's if it already
// exists, else the latest prior run, else today's. Concrete (never null) so admission/watcher work.
function resolveAgentRunRoot(ticker: string): string {
  const today = `analyses/${ticker}_${todayDate()}`
  if (fs.existsSync(path.join(REPO_ROOT, today))) return today
  return resolveRunRoot({ ticker }) ?? today
}

/** A projection/admission makes the dated research folder immutable. This is checked before any paid
 * module/agent/rerun launch, in addition to the slash-command guard, so UI launches cannot spend first
 * and discover the seal later. A full launch may still enter its explicit read-only recovery route. */
export function isSealedResearchRun(runRoot: string): boolean {
  const abs = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  return fs.existsSync(path.join(abs, 'idea_projection_manifest.json')) || fs.existsSync(path.join(abs, 'idea_admission.json'))
}

function sealedResearchRunError(runRoot: string): Error {
  const err: any = new Error(
    `Research run ${runRoot} is sealed by its Ideas projection/admission. Start a new dated full run; the old ex-ante result cannot be rewritten.`,
  )
  err.statusCode = 409
  err.body = { code: 'research_run_sealed', reason: 'immutable_projection', detail: runRoot }
  return err
}

// Modules this run writes into (for D2b / D3 admission). swarmId is resolved by the caller.
function coveredModulesFor(swarmId: string, kind: RunKind, module?: string, agent?: string): string[] {
  const g = buildSwarmGraph(swarmId)
  if (kind === 'full' || kind === 'signal') return g.modules.map((m) => m.name)
  if (kind === 'rerun') return [...new Set(downstreamCascade(module!, agent, swarmId).filter((c) => c.module !== 'master').map((c) => c.module))]
  return module ? [module] : []
}

// The target agent's intra-module required-upstream files (for D4b).
function agentRequiredUpstream(swarmId: string, module?: string, agent?: string): string[] {
  if (!module || !agent) return []
  const g = buildSwarmGraph(swarmId)
  const m = g.modules.find((x) => x.name === module)
  const a = m && Object.values(m.layers).flat().find((x) => x.name === agent || x.slug === agent)
  return a?.requiredUpstream ?? []
}

// Run-root artifacts full/rerun also write (diagnostics for D2; D1 is the real exclusivity guard).
// RUN_FAILURE.md is deliberately NOT declared here for chained `module` runs (Finding 2 review comment).
// Declaring it as a write target would make admission's D2 (exact-match disjoint-write) treat EVERY
// concurrently-scheduled sibling module for a ticker as conflicting on this one shared root file — killing
// the DAG-parallel chained scheduler exists for. The race D2 would be guarding against here
// (two modules failing "at the same time" both writing+committing RUN_FAILURE.md) cannot actually happen:
// Node is single-threaded, recordRunFailure()'s dedup-check-then-set (the `recordedFailure` Set) is fully
// synchronous with no `await` in between, so two onClose callbacks landing "around the same time" still
// run to completion one at a time — the second always sees the first's dedup entry and returns before
// writing. Serialization is real, just done in-process rather than via admission's declared-write model.
const ROOT_ARTIFACTS_FULL = [
  'final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json', 'idea_3_6m.json', 'RUN_METADATA.md',
]
const ROOT_ARTIFACTS_RERUN = ['final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json']
// A screener signal run owns its whole SIG folder; these are its run-root JSON artifacts.
const ROOT_ARTIFACTS_SIGNAL = ['intake.json', 'signal_payload.json', 'thesis_record.json', 'candidates.json', 'RUN_METADATA.md']

// Subject-id shapes (mirrored in sandbox.ts for route validation).
const SIG_ID_RE = /^SIG-[0-9]{8}-[a-f0-9]{8}$/
const THESIS_ID_RE = /^THS-SIG-[0-9]{8}-[a-f0-9]{8}-v[0-9]+$/
const RECOVERY_REQUEST_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Resolve a screener signal run folder to a CONTAINED absolute path, REBUILT from a shape-validated SIG
// id. The id is asserted against the anchored SIG_ID_RE (`^SIG-[0-9]{8}-[a-f0-9]{8}$` — no '.' or '/',
// so no '..' or path separator can appear) BEFORE it is spliced into the run-root template, then the
// result is realpath + containment-checked by the screener sandbox guard. Validating the id component in
// the SAME scope as the marker write is the form a CWE-22 (path-injection) check recognises as a barrier:
// the sandbox guard's realpath + startsWith containment does NOT propagate across its return, so routing a
// raw request-derived `runRoot` string through resolveInsideScreener alone still left the .target / .aborted
// writes flagged. Returns null when the id isn't a valid SIG id or the swarm is absent — the caller then
// skips the best-effort marker (the same harmless failure mode as the surrounding try/catch). Used by every
// run-folder marker write so a request-derived id can never steer a write outside the screener store.
export function screenerMarkerDir(swarmId: string | undefined, sigId: string): string | null {
  if (!SIG_ID_RE.test(sigId)) return null
  const m = swarmById(swarmId)
  if (!m?.runRootTemplate || !m.placeholder) return null
  const abs = path.join(REPO_ROOT, m.runRootTemplate.replace(`{${m.placeholder}}`, sigId))
  fs.mkdirSync(abs, { recursive: true })
  return resolveInsideScreener(abs)
}

// Exported for the build-prompt routing test (test/build-prompt.test.ts).
export function buildPrompt(
  swarmId: string,
  kind: RunKind,
  ticker: string,
  module?: string,
  agent?: string,
  window?: string,
  extra?: {
    thesisId?: string
    checkpointId?: string
    runRoot?: string
    decisionFingerprint?: string
    intakeReceipt?: IntakeReceiptIntent
    parity?: { claudeRunRoot: string; codexRunRoot: string; freezeReceipt: string; outputDir: string }
    parityCanary?: { runRoot: string; freezeReceipt: string; stage?: ParityCanaryStage }
  },
): string {
  const exactDecisionArgs = extra?.runRoot && extra?.decisionFingerprint
    ? ` ${extra.runRoot} ${extra.decisionFingerprint}`
    : ''
  const intakeReceiptArgs = extra?.intakeReceipt
    ? ` ${extra.intakeReceipt.planPath} ${extra.intakeReceipt.planSha256} ${extra.intakeReceipt.sourceDecisionFingerprint}`
    : ''
  // Generic constellation swarm (e.g. commodity): full/module/agent through the manifest's command
  // namespace — never hardcode the swarm's literal beyond reading commandNs (CLAUDE.md §26).
  if (swarmId !== 'research' && !SCREENER_KINDS.has(kind)) {
    const swarm = swarmById(swarmId)
    const ns = swarm?.commandNs || swarmId
    if (kind === 'module') return `/${ns}:${module} ${ticker}`
    if (kind === 'agent') return `/${ns}:agent ${module} ${agent} ${ticker}`
    // rerun on a constellation swarm: AGENT is optional (whole-module vs single-orb). Never fall through
    // to the research `/research:rerun` line below — dispatch the swarm's own command namespace (§26).
    if (kind === 'rerun') return `/${ns}:rerun ${module}${agent ? ' ' + agent : ''} ${ticker}${exactDecisionArgs}${intakeReceiptArgs}`
    // doc-intake is the CHEAP advisory plan-writer (clone of 'review'), NOT a full run. Route it to the
    // swarm's own `:intake` command; without this branch it fell through to `/${ns}:full` below — so a
    // single landed file (the auto-analyze-on-landing signal) would trigger a full PAID run. (§26 namespace)
    if (kind === 'doc-intake') return `/${ns}:intake ${ticker}${exactDecisionArgs}`
    if (kind === 'review') {
      if (!swarm?.reviewCommand || !swarm.calibrator) throw new Error(`swarm '${swarmId}' does not declare tracked review + calibration support`)
      return `/${ns}:${swarm.reviewCommand} ${ticker} ${window || 'ad-hoc'}`
    }
    return `/${ns}:full ${ticker}` // 'full' (default)
  }
  if (kind === 'module' && extra?.parityCanary?.stage === 'module') {
    return `/research:module-canary ${module} ${ticker} ${extra.parityCanary.runRoot} ${extra.parityCanary.freezeReceipt}`
  }
  if (kind === 'full' && extra?.parityCanary) {
    return `/research:full-canary ${ticker} ${extra.parityCanary.runRoot} ${extra.parityCanary.freezeReceipt}`
  }
  if (kind === 'full') return `/research:full ${ticker}`
  if (kind === 'module') return `/research:${module} ${ticker}`
  if (kind === 'rerun') return `/research:rerun ${module} ${agent} ${ticker}${exactDecisionArgs}${intakeReceiptArgs}`
  // file one outcome review for this ticker's latest run (window defaults to ad-hoc — the "update now" snapshot).
  if (kind === 'review') return `/research:review-decisions ${extra?.runRoot || ticker} ${window || 'ad-hoc'}`
  // rebuild the cross-ticker calls-tracker dashboard (ignores ticker — it is cross-ticker by design).
  if (kind === 'track') return `/research:track`
  // read the docs that landed since the ticker's last run + write a scoped rerun plan (advisory,
  // launches nothing). The command resolves the latest run root itself, like 'review'.
  if (kind === 'doc-intake') return `/research:intake ${ticker}${exactDecisionArgs}`
  if (kind === 'parity' && extra?.parity) {
    return `/research:provider-parity ${extra.parity.claudeRunRoot} ${extra.parity.codexRunRoot} ${extra.parity.freezeReceipt} ${extra.parity.outputDir}`
  }
  // screener swarm — namespace from the manifest (never hardcode the literal beyond the kind map)
  if (SCREENER_KINDS.has(kind)) {
    const ns = swarmById(swarmId)?.commandNs || 'screener'
    if (kind === 'signal') return module ? `/${ns}:signal ${ticker} ${module}` : `/${ns}:signal ${ticker}` // ticker = SIG id; optional module = target to run THROUGH then stop
    if (kind === 'sweep') return `/${ns}:sweep`
    if (kind === 'handoff') return `/${ns}:handoff ${extra?.thesisId} ${ticker}` // ticker = the handoff target
    if (kind === 'conviction') return `/${ns}:validate ${extra?.thesisId} ${extra?.checkpointId}`
    return `/${ns}:agent ${module} ${agent} ${ticker}` // screener-agent: ticker carries the SIG id
  }
  return `/research:agent ${module} ${agent} ${ticker}`
}

function plannedModules(swarmId: string, kind: RunKind, module?: string): string[] {
  const g = buildSwarmGraph(swarmId)
  if (kind === 'full') return g.modules.map((m) => m.name)
  if (kind === 'signal') {
    // a TARGETED signal plans only modules up to & including the target, so a partial run reads as a
    // clean "stopped here" (continuable) rather than a half-finished full run. Graph order = topo order.
    const all = g.modules.map((m) => m.name)
    const i = module ? all.indexOf(module) : -1
    return i >= 0 ? all.slice(0, i + 1) : all
  }
  return module ? [module] : []
}

function buildExpected(swarmId: string, kind: RunKind, module?: string, agent?: string): Map<string, ExpectedAgent> {
  const g = buildSwarmGraph(swarmId)
  const map = new Map<string, ExpectedAgent>()
  if (kind === 'sweep' || kind === 'handoff') return map // no orb outputs — inbox/ledger writes only
  if (kind === 'agent' || kind === 'screener-agent') {
    const m = g.modules.find((x) => x.name === module)
    const a = m && Object.values(m.layers).flat().find((x) => x.name === agent || x.slug === agent)
    if (a) map.set(a.key, { key: a.key, module: a.module, name: a.name, layer: a.layer, outputRel: `${a.module}/${a.nn}_${a.slug}.md` })
    return map
  }
  if (kind === 'rerun') {
    // the target orb (or whole module) + the downstream synthesis chain (so the swarm shows the planned re-run)
    for (const c of downstreamCascade(module!, agent, swarmId)) {
      map.set(c.key, { key: c.key, module: c.module, name: c.name, layer: c.layer, outputRel: c.outputRel || 'final_thesis.md' })
    }
    return map
  }
  for (const mn of plannedModules(swarmId, kind, module)) {
    const m = g.modules.find((x) => x.name === mn)
    if (!m) continue
    for (const a of Object.values(m.layers).flat()) {
      map.set(a.key, { key: a.key, module: a.module, name: a.name, layer: a.layer, outputRel: `${a.module}/${a.nn}_${a.slug}.md` })
    }
  }
  return map
}

function potentialOutputLineagePaths(run: RunState): string[] {
  const outputs = new Set([...run.expected.values()].map((expected) => expected.outputRel))
  const covered = new Set(run.coveredModules)
  for (const module of buildSwarmGraph(run.swarmId).modules) {
    if (!covered.has(module.name)) continue
    for (const agent of Object.values(module.layers).flat()) {
      if (!agent.isSynthesis) continue
      outputs.add(`${agent.module}/${agent.key.split('/').at(-1)}.md`)
    }
  }
  const immutable = new Set((immutableReusedOutputsByRun.get(run) ?? []).map((output) => output.outputRel))
  return [...outputs].filter((outputRel) => !immutable.has(outputRel)).sort()
}

/** Read-only test seam proving reused outputs can never be re-attested by the paid child. */
export function potentialOutputLineagePathsForTest(run: RunState): string[] {
  return potentialOutputLineagePaths(run)
}

function captureRunOutputLineage(run: RunState): void {
  if (!run.runRoot) throw new Error('provider output lineage requires an exact run root')
  // Pre-spawn proof. This function runs inside the final synchronous launch block immediately before
  // provenance and execa, so no await can open a race after this check.
  verifyPreparedImmutableReusedOutputs(run)
  run.outputLineageAttempt = captureOutputLineageAttempt({
    runRoot: run.runRoot,
    outputRels: potentialOutputLineagePaths(run),
    generationDigest: run.evidenceGenerationDigest ?? null,
    attemptId: run.providerAttemptId ?? run.runId,
    provider: run.provider,
    profileKey: run.profileKey,
  })
}

/** Settle once. Every production caller reaches this only after the detached writer group is extinct. */
function settleRunOutputLineage(run: RunState): string | null {
  const attempt = run.outputLineageAttempt
  if (!attempt) return null
  run.outputLineageAttempt = undefined
  try {
    // Post-extinction proof. Reused files are excluded from this attempt's eligible lineage set, so they can
    // retain old trust only when their exact pre-Continue bytes remain unchanged.
    verifyPreparedImmutableReusedOutputs(run)
    settleOutputLineageAttempt(attempt)
    return null
  } catch (error: any) {
    return String(error?.message || error)
  }
}

function launchScopeFingerprint(swarmId: string, kind: RunKind, module?: string, agent?: string): string {
  const exactOrbKeys = [...buildExpected(swarmId, kind, module, agent).keys()].sort()
  return `sha256:${createHash('sha256').update(JSON.stringify({ swarmId, kind, module: module ?? null, agent: agent ?? null, exactOrbKeys })).digest('hex')}`
}

export function estimate(
  kind: RunKind,
  ticker: string,
  provider: RunProvider,
  module?: string,
  agent?: string,
  swarm?: string,
  model?: string,
  reasoningLevel?: string,
  profileKey?: string,
): LaunchPreflight {
  const profile = getProviderAdapter(provider).resolveProfile({ model, reasoningLevel, profileKey })
  const swarmId = swarmIdFor(kind, swarm)
  const g = buildSwarmGraph(swarmId)
  let agentCount = 1
  if (kind === 'full') agentCount = g.totals.agents + 1
  else if (kind === 'signal') agentCount = g.totals.agents // gauntlet; gates mean most signals stop early
  else if (kind === 'module') agentCount = g.modules.find((m) => m.name === module)?.agentCount ?? 0
  else if (kind === 'rerun') agentCount = downstreamCascade(module!, agent, swarmId).length

  const historical = estimateFromComparableRuns({
    kind, provider: profile.provider, profileKey: profile.profileKey, swarm: swarmId, module, agent,
    scopeFingerprint: launchScopeFingerprint(swarmId, kind, module, agent),
  })
  const estCostUsdRange: [number, number] = historical.costUsdRange ?? [0, 0]
  const estMinutesRange: [number, number] = historical.minutesRange ?? [0, 0]

  return {
    kind,
    ticker,
    provider: profile.provider,
    executionProfile: profile.executionProfile,
    profileKey: profile.profileKey,
    model: profile.model,
    reasoningLevel: profile.reasoningLevel,
    ...(swarmId !== 'research' ? { swarm: swarmId } : {}),
    module,
    agent,
    agentCount,
    estCostUsdRange,
    estMinutesRange,
    estimateEvidence: {
      source: historical.source,
      provider: historical.provider,
      profileKey: historical.profileKey,
      durationSampleSize: historical.durationSampleSize,
      costSampleSize: historical.costSampleSize,
    },
    willCommitToMain: kind !== 'agent' && kind !== 'screener-agent' && kind !== 'parity',
    estCommits: kind === 'full' ? 2 : kind === 'module' || kind === 'rerun' || kind === 'signal'
      || kind === 'sweep' || kind === 'handoff' || kind === 'conviction' ? 1 : 0,
    requiresTypedConfirm: kind === 'full',
    creditPreflight: getCreditStatus(provider),
  }
}

export interface LaunchParams {
  kind: RunKind
  // Required below the HTTP boundary. Routes default a missing legacy-client field to Claude once;
  // chains/resume/internal launchers must carry the selected provider explicitly and immutably.
  provider: RunProvider
  // explicit swarm for a generic constellation swarm's reused full/module/agent kinds (e.g. 'commodity').
  // Omitted for research + screener (their swarm is derived from the kind).
  swarm?: string
  // research kinds: the ticker. signal: omit (derived SIG id) or pass an existing SIG id.
  // screener-agent: the SIG id. handoff: the target TICKER. sweep: omit. constellation swarm: the subject id.
  ticker?: string
  module?: string
  agent?: string
  window?: string // review window (kind 'review'); ignored by other kinds
  model?: string
  reasoningLevel?: string
  /** Optional estimate-to-launch CAS. Missing remains the legacy-client compatibility path. */
  expectedProfileKey?: string
  /** Full legal listing tuple for a first run; the runtime still resolves it against its frozen registry. */
  memoryIdentity?: ResearchMemoryIdentity
  resumeSessionId?: string
  intake?: SignalIntakeInput // kind 'signal' (new signal): materialized into <runRoot>/intake.json
  /** Internal date frozen before an Idea promotion reserves its deterministic signal id. Ordinary signal
   * launches omit it and keep the launch-time date. This closes the reserve -> provider-gate midnight race. */
  signalDate?: string
  inboxId?: string // kind 'signal' launched from an Inbox card — recorded as the intake's provenance
  // kind 'signal' relaunch of an EXISTING sig: stamp override_promote onto its intake.json so the gauntlet
  // pushes a signal-gate PARK/LOG (a "noted, no action" / "set aside" cull) PAST the promotion gate and runs
  // the rest. A recorded human override of the auto-cull — the gate reads intake.json, so this is how it lands.
  overridePromote?: boolean
  thesisId?: string // kind 'handoff'
  checkpointId?: string // kind 'conviction'
  /** Internal tracked provider-parity command. The normal launch API never accepts this object. */
  parity?: {
    claudeRunRoot: string
    codexRunRoot: string
    freezeReceipt: string
    outputDir: string
  }
  /** Internal operator-only frozen-input full canary. Ordinary launch routes never accept this object. */
  parityCanary?: {
    runRoot: string
    freezeReceipt: string
    /** Internal chain lifecycle. The HTTP body never accepts this field. */
    stage?: ParityCanaryStage
    /** Supervisor-only marker for the terminal process of an authorized same-root recovery. */
    continuation?: boolean
  }
  user?: string // who launched it (from Cloudflare Access at the route); defaults to "local"
  userVia?: 'cf-access' | 'local'
  // FORCE override (research kinds): the user explicitly chose to run despite a same-subject run-lock
  // ("overwrite is fine — just run it"). Before admission we STOP every in-flight run on this subject so
  // its subject claim + write targets release, then admit normally. Deliberately does NOT bypass the
  // GLOBAL concurrency cap (other tickers' runs) or the data-readiness gate — those are orthogonal guards.
  force?: boolean
  // This run is a STEP of a chained full run. Set it via params (not after launch() returns) so it is on
  // the RunState BEFORE spawnEngine's logLaunch fires — otherwise the perpetual activity-log `launched`
  // event records chained=false for every chained module step, and the cockpit can't tell a chained-full
  // module from a standalone module run when deciding whether Resume should continue the whole pipeline.
  chained?: boolean
  /** Internal immutable identity shared by every step of one per-module full-run chain. */
  chainId?: string
  // Exact, already-selected run identity for a data-need intake/rerun. It is revalidated in launch()
  // against the swarm manifest/research folder before it enters a prompt; ordinary launches omit it.
  runRoot?: string
  /** Internal Continue binding. Requires `runRoot` to be the exact saved research root and keeps every
   * chained child, command, registry row, watcher, and publication inside it. Never accepted by /api/launch. */
  continuation?: boolean
  /** Internal automatic recovery for a fresh Full whose deterministic readiness transaction failed before
   * any provider child started. It reuses this exact root/provider/profile, but remains a Full (not Continue)
   * and therefore may take one new frozen live-data snapshot. Never accepted by the public launch route. */
  technicalReadinessRetry?: boolean
  /** Durable exact-plan authority for a fresh Full that may be deferred before any provider child starts.
   * Internal only: it is persisted with the prepared transaction and never accepted from public JSON. */
  preSpendRetryAuthority?: PreSpendRetryAuthority
  /** Restart-stable UUID for the exact automatic pre-spend recovery request. It is required with
   * technicalReadinessRetry so repeated supervisor ticks cannot create distinct paid intents. */
  recoveryRequestId?: string
  /** Internal full-chain invariant. A child that may reuse saved provider output must recover the exact
   * durable frozen-generation receipt for `runRoot`; it may never silently re-freeze the live pool. */
  requireExistingFrozenPoolReceipt?: boolean
  /** Internal only: a complete run root prepared outside Git. Activated after admission and committed by
   *  the first real provider child; rolled back if the logical attempt terminates before one starts. */
  preparedRunPlanTransaction?: PreparedRunPlanTransaction
  /** Internal attempt identity allocated synchronously by launch() before any provider/preflight await.
   * Every child sharing one prepared transaction gets a distinct value. HTTP callers cannot supply it. */
  preparedRunPlanAttemptId?: string
  // A scoped carry may launch into a fresh staging root while still being authorized by the selected
  // decision it copied. Single-orb reruns use the same path for both.
  decisionRunRoot?: string
  decisionFingerprint?: string
  // Optional one-time-consumption proof for an exact single-orb rerun selected from a live intake plan.
  // Ordinary constellation clicks omit it and therefore create no intake receipt.
  intakeReceipt?: IntakeReceiptIntent
  // Automatic landed-document intake is authorized only while this remains the ONE finished owner of
  // the shared data/<SUBJECT> pool. Subject labels are swarm-local (research GOLD and commodity GOLD can
  // both exist), so the launcher re-resolves this binding before any force cancellation and again at the
  // final paid-process boundary. Manual launches omit it.
  intakeOwner?: IntakeOwner
  // Optional terminal observer for headless orchestration. launch() itself ACKs before readiness/CAS/spawn;
  // this callback fires only once the real command (or a pre-spawn failure) reaches a terminal status.
  onTerminal?: (status: RunStatus) => void
  // Standalone research modules normally build one extra LLM-written module memo after their graph has
  // completed. The thesis-plan module route promises an EXACT unfinished-orb scope, so it opts out of that
  // leaf task for this launch only. Kept off RunState/public snapshots; the WeakSet below carries it only to
  // this run's child environment. Ordinary module/full/rerun launches must omit it.
  deferModuleMemo?: boolean
  // One-click exact module resumes may read only the staged/current cross-module inputs that were included
  // in their publication fingerprint. Standalone commands may keep their historical fallback behavior.
  exactModuleResume?: boolean
  // Exact module names staged + fingerprinted for that resume. They become directory-scoped read claims
  // for admission and a child-only allowlist; a same-day partial folder that was NOT reviewed cannot be
  // picked up merely because it happens to exist beside the target module.
  exactModuleInputs?: string[]
  // Exact specialist and synthesis stems the reviewed plan authorizes this child to replace. These are
  // derived from the server-side roster + done-orb receipt, never accepted from a public launch body.
  // The shared pipeline's quarantine helper fails closed outside this allowlist.
  exactModuleWritableOrbs?: string[]
  exactModuleSynthesisOrbs?: string[]
  // Immutable target root reviewed and fingerprinted by the smart-resume route. The module command would
  // otherwise call `date` again after spawn and could cross midnight into a different, unreviewed folder.
  // Kept child-only and required only with exactModuleResume.
  exactModuleRunRoot?: string
  // Internal, synchronous compare-and-set at the FINAL paid-process boundary. Routes that stage or publish
  // filesystem state before launch use this to re-read their exact disk truth after readiness/buildArgs
  // delays. Kept in a WeakMap (not RunState/public snapshots) and never accepted by public request schemas.
  preSpawnGuard?: PreSpawnGuard
  // Optional async proof after a clean child exit but before the run can be reported done. Exact module
  // resumes use it to prove the completed module path reached origin/main (and retry a local-only commit).
  // Kept launch-private like preSpawnGuard; ordinary runs omit it.
  terminalGuard?: TerminalGuard
  // A command whose own run subject is NOT the shared-pool subject may still publish there. Screener
  // handoff runs are keyed by THESIS::TICKER but write data/<TICKER>; bind that target explicitly so the
  // owner is checked before admission and again immediately before the paid command can write.
  sharedPoolTarget?: { swarm: string; subject: string }
}

export type ParityCanaryStage = 'chain' | 'continuation' | 'module' | 'final'

/** A model child is allowed to finish successfully only after this supervisor-owned publication phase. */
export function requiresSupervisorPublication(kind: RunKind, parityStage?: ParityCanaryStage): boolean {
  if (kind === 'agent' || kind === 'screener-agent' || kind === 'parity') return false
  if (!parityStage) return true
  return kind === 'full' && parityStage === 'final'
}

export type PreSpawnGuardResult =
  | { ok: true }
  | { ok: false; reason: string; message: string }
export type PreSpawnGuard = () => PreSpawnGuardResult
export type TerminalGuard = () => Promise<PreSpawnGuardResult> | PreSpawnGuardResult

type DecisionBinding = { decisionRunRoot?: string; decisionFingerprint: string }

/** Pure equality check exported for the force-order regression. A stale owner A must not be treated as
 *  authority once the filesystem resolves a different/ambiguous owner B (null is ambiguity). */
export function intakeOwnerBindingMatches(bound: IntakeOwner, current: IntakeOwner | null): boolean {
  return !!current && current.swarm === bound.swarm && current.runRoot === bound.runRoot
    && current.decisionFingerprint === bound.decisionFingerprint
}

function decisionBindingStillCurrent(swarmId: string, subjectId: string, binding?: DecisionBinding): boolean {
  if (!binding?.decisionFingerprint) return true
  const exact = binding.decisionRunRoot ? readDataNeeds(swarmId, subjectId, binding.decisionRunRoot) : null
  const current = readDataNeeds(swarmId, subjectId)
  return !!exact && !!current && exact.run_root === current.run_root
    && exact.decision_fingerprint === binding.decisionFingerprint
    && current.decision_fingerprint === binding.decisionFingerprint
}

function launchBindingError(code: 'selected_decision_changed' | 'intake_plan_changed' | 'intake_owner_changed' | 'shared_pool_target_changed'): Error {
  const selected = code === 'selected_decision_changed'
  const err: any = new Error(selected
    ? 'The selected call changed before launch. Refresh it and review the rerun again.'
    : code === 'intake_plan_changed'
      ? 'That intake-plan orb is no longer actionable. Refresh or re-analyze before rerunning.'
    : code === 'intake_owner_changed'
      ? 'The data-pool owner changed before launch. Refresh the idea before analyzing the landed data.'
      : 'The destination data-pool owner changed before launch. Refresh the handoff and try again.')
  err.statusCode = 409
  err.body = { code }
  return err
}

function assertNoModulePublicationInFlight(swarmId: string, subjectId: string): void {
  if (swarmId !== RESEARCH_SWARM_ID || !modulePublicationInFlight(subjectId)) return
  const err: any = new Error(`The completed module for ${subjectId} is still being published. Try again when it finishes.`)
  err.statusCode = 409
  err.body = { code: 'subject_busy' }
  throw err
}

function assertNoForeignSubjectChain(swarmId: string, subjectId: string, chained?: boolean): void {
  if (swarmId !== RESEARCH_SWARM_ID || chained || !subjectChainActive(subjectId, swarmId)) return
  const err: any = new Error(`A full-analysis chain is already active on ${subjectId}. Let it finish (or stop it) before starting more work.`)
  err.statusCode = 409
  err.body = { code: 'subject_busy' }
  throw err
}

type SharedDataPoolBoundaryConflict = SharedDataPoolConflict | {
  code: 'shared_data_owner_unavailable'
  owners: string[]
}

// A launch has several asynchronous pre-registration steps (CLI capability probes, and the outer
// chained-full scheduler waiting for its first module). While no finished owner exists, an in-memory
// pending claim closes that otherwise-unowned window: research GOLD and commodity GOLD cannot both pass
// the zero-owner check before either has registered a RunState. Counts permit the chained launcher's
// nested same-swarm module launch; cross-swarm claims are always rejected by sharedDataPoolConflict().
const pendingSharedDataPoolClaims = new Map<string, Map<string, number>>()

function sharedDataPoolClaims(subjectId: string, ignoreRunId?: string): SharedDataPoolClaim[] {
  const claims: SharedDataPoolClaim[] = []
  for (const run of listRuns()) {
    if (run.runId === ignoreRunId || run.endedAt !== undefined) continue
    if (run.subjectId === subjectId && isSharedDataPoolConsumer(run.kind, swarmById(run.swarmId)?.layout)) {
      claims.push({ swarm: run.swarmId, runId: run.runId })
    }
    // Handoff is keyed in the screener registry by THESIS::TICKER, not by its data destination. Count its
    // explicit target as a research claim so a commodity launch is blocked for the handoff's full life.
    const target = sharedPoolTargetByRun.get(run)
    if (target?.subject === subjectId) claims.push({ swarm: target.swarm, runId: run.runId })
  }
  for (const [swarm, count] of pendingSharedDataPoolClaims.get(subjectId) ?? []) {
    if (count > 0) claims.push({ swarm })
  }
  return claims
}

function currentSharedDataPoolConflict(
  swarmId: string,
  subjectId: string,
  kind: RunKind,
  ignoreRunId?: string,
): SharedDataPoolBoundaryConflict | null {
  if (!isSharedDataPoolConsumer(kind, swarmById(swarmId)?.layout)) return null
  try {
    return sharedDataPoolConflict(
      swarmId,
      listFinishedIntakeOwners(subjectId),
      sharedDataPoolClaims(subjectId, ignoreRunId),
    )
  } catch {
    // A filesystem/manifest read failure must never be interpreted as "zero owners".
    return { code: 'shared_data_owner_unavailable', owners: [] }
  }
}

function sharedDataPoolLaunchError(subjectId: string, conflict: SharedDataPoolBoundaryConflict): Error {
  let message: string
  if (conflict.code === 'shared_data_owner_ambiguous') {
    message = `${subjectId} has finished ideas in more than one cockpit (${conflict.owners.join(', ')}). Separate or rename the shared data folder before running it.`
  } else if (conflict.code === 'shared_data_owner_mismatch') {
    message = `data/${subjectId} belongs to the ${conflict.owners[0]} cockpit, not this cockpit.`
  } else if (conflict.code === 'shared_data_subject_busy') {
    message = `${subjectId} is already being analyzed by the ${conflict.blockingSwarm} cockpit. Wait for that first run to finish.`
  } else {
    message = `The owner of data/${subjectId} could not be verified. No analysis was started.`
  }
  const err: any = new Error(message)
  err.statusCode = 409
  err.body = { ...conflict, subject: subjectId }
  return err
}

/** Atomically check ownership + reserve the bare data-pool label until launch() has either registered its
 *  RunState or failed. The returned release is idempotent so every throw/return path can use finally. */
function acquireSharedDataPoolClaim(swarmId: string, subjectId: string, kind: RunKind): () => void {
  if (!isSharedDataPoolConsumer(kind, swarmById(swarmId)?.layout)) return () => {}
  const conflict = currentSharedDataPoolConflict(swarmId, subjectId, kind)
  if (conflict) throw sharedDataPoolLaunchError(subjectId, conflict)
  let bySwarm = pendingSharedDataPoolClaims.get(subjectId)
  if (!bySwarm) {
    bySwarm = new Map()
    pendingSharedDataPoolClaims.set(subjectId, bySwarm)
  }
  bySwarm.set(swarmId, (bySwarm.get(swarmId) ?? 0) + 1)
  let released = false
  return () => {
    if (released) return
    released = true
    const current = pendingSharedDataPoolClaims.get(subjectId)
    if (!current) return
    const next = (current.get(swarmId) ?? 1) - 1
    if (next > 0) current.set(swarmId, next)
    else current.delete(swarmId)
    if (current.size === 0) pendingSharedDataPoolClaims.delete(subjectId)
  }
}

/** The paid launch is a compare-and-set against BOTH identities that can authorize it. This assertion is
 *  intentionally synchronous: after it returns, launch() reaches force cancellation without yielding the
 *  event loop, so a stale automatic intake A can never cancel a live B-bound run. */
function assertLaunchBindingsStillCurrent(swarmId: string, subjectId: string, params: LaunchParams): void {
  const decision = params.decisionFingerprint
    ? { decisionRunRoot: params.decisionRunRoot, decisionFingerprint: params.decisionFingerprint }
    : undefined
  if (!decisionBindingStillCurrent(swarmId, subjectId, decision)) {
    throw launchBindingError('selected_decision_changed')
  }
  if (params.intakeReceipt && (!params.runRoot || !params.module || !params.agent
      || !intakeReceiptIntentStillActionable(
        swarmId, subjectId, params.runRoot, params.module, params.agent, params.intakeReceipt,
      ))) {
    throw launchBindingError('intake_plan_changed')
  }
  if (params.intakeOwner) {
    if (params.intakeOwner.swarm !== swarmId) throw launchBindingError('intake_owner_changed')
    let current: IntakeOwner | null = null
    try { current = resolveUniqueFinishedIntakeOwner(subjectId) } catch { /* fail closed */ }
    if (!intakeOwnerBindingMatches(params.intakeOwner, current)) throw launchBindingError('intake_owner_changed')
  }
  if (params.sharedPoolTarget) {
    let conflict: SharedDataPoolBoundaryConflict | null
    try {
      conflict = sharedDataPoolConflict(
        params.sharedPoolTarget.swarm,
        listFinishedIntakeOwners(params.sharedPoolTarget.subject),
        sharedDataPoolClaims(params.sharedPoolTarget.subject),
      )
    } catch {
      conflict = { code: 'shared_data_owner_unavailable', owners: [] }
    }
    if (conflict) throw launchBindingError('shared_pool_target_changed')
  }
}

// LaunchParams is not part of RunState's durable/public contract. Keep this short-lived launch-only CAS
// binding off the registry object; WeakMap also guarantees it cannot leak after a run is collected.
const intakeOwnerByRun = new WeakMap<RunState, IntakeOwner>()
const sharedPoolTargetByRun = new WeakMap<RunState, { swarm: string; subject: string }>()
const intakeReceiptByRun = new WeakMap<RunState, IntakeReceiptIntent>()
// One-shot execution policy, deliberately not a run-folder marker: a marker can outlive a crashed server
// and make a later ordinary module silently skip its memo. WeakSet lifetime is the admitted RunState only;
// spawnEngine turns it into a child-only environment value and childEnv strips any ambient copy.
const deferredModuleMemoRuns = new WeakSet<RunState>()
const continuationRunRootByRun = new WeakMap<RunState, string>()
// A chained child that may reuse provider-authored output must recover the exact durable frozen-generation
// receipt for that run root. Keeping this launch-only bit off RunState prevents it becoming public API while
// still letting the readiness boundary distinguish a fresh Full from Continue/reuse after a restart.
const durableFrozenGenerationReuseRuns = new WeakSet<RunState>()
const preparedRunPlanTransactionByRun = new WeakMap<RunState, {
  transaction: PreparedRunPlanTransaction
  rootAttemptId: string
  /** One durable child-attempt identity per provider process. Automatic Codex continuation rotates this
   * before any replacement-process await while retaining the same logical RunState/request/root. */
  attemptId: string
}>()
// Fresh Full only: an exact reviewed transaction may wait outside analyses after a transient pre-spend
// failure. The authority never becomes public RunState data; every child in the logical chain receives the
// same immutable seed and the transaction itself is the durable at-most-once owner.
const preSpendRetryAuthorityByRun = new WeakMap<RunState, PreSpendRetryAuthority>()
const deferredPreSpendRetryTransactions = new WeakSet<PreparedRunPlanTransaction>()

const PRE_SPEND_RETRY_MAX_BACKOFF_MS = 30 * 60 * 1000

function nextPreSpendRetryAuthority(
  authority: PreSpendRetryAuthority,
  reason: PreSpendRetryAuthority['reason'],
  now: number = Date.now(),
): PreSpendRetryAuthority {
  const localAttempts = authority.localAttempts + 1
  const delay = Math.min(PRE_SPEND_RETRY_MAX_BACKOFF_MS, 30_000 * 2 ** Math.min(localAttempts - 1, 8))
  return { ...authority, reason, localAttempts, notBeforeMs: now + delay }
}

async function deferPreparedPreSpendRetry(
  transaction: PreparedRunPlanTransaction,
  authority: PreSpendRetryAuthority,
  reason: PreSpendRetryAuthority['reason'],
): Promise<boolean> {
  if (deferredPreSpendRetryTransactions.has(transaction)) return true
  await transaction.deferPreSpendRetry(nextPreSpendRetryAuthority(authority, reason))
  deferredPreSpendRetryTransactions.add(transaction)
  return true
}

export function preparedProviderContinuationAttemptId(rootAttemptId: string, providerAttemptId: string): string {
  const root = String(rootAttemptId || '').trim()
  const provider = String(providerAttemptId || '').trim()
  if (!root || !provider || root.length > 100 || provider.length > 80) {
    throw new Error('invalid prepared provider continuation attempt identity')
  }
  return `${root}:${provider}`
}
const providerSpawnRequestIdByRun = new WeakMap<RunState, string>()
interface ImmutableReusedOutput {
  outputRel: string
  absolutePath: string
  sha256: string
}
const immutableReusedOutputsByRun = new WeakMap<RunState, ImmutableReusedOutput[]>()
const exactModuleResumeRuns = new WeakSet<RunState>()
const exactModuleInputsByRun = new WeakMap<RunState, string[]>()
const exactModuleRunRootByRun = new WeakMap<RunState, string>()
const exactModuleArtifactScopeByRun = new WeakMap<RunState, {
  module: string
  writableOrbs: string[]
  synthesisOrbs: string[]
}>()
const preSpawnGuards = new WeakMap<RunState, PreSpawnGuard>()
const terminalGuards = new WeakMap<RunState, TerminalGuard>()
// The child PID is already dead while a terminal guard publishes completed outputs. Keep an explicit writer
// token until BOTH the guard and close finalizer have finished so force/reaper/admission cannot mistake that
// ordinary state for an abandoned run and release its subject/write claims mid-Git operation.
const terminalWorkByRun = new WeakMap<RunState, Promise<PreSpawnGuardResult>>()
// A terminalGuard makes process close an owned lifecycle phase from admission onward — not only after the
// close callback happens to start. A dead PID can be observed a few event-loop turns before execa delivers
// close, and in the pathological lost-close case it never delivers it. The watchdog gives ordinary close a
// short grace period, then performs the same proof + single finalization itself. Weak state cannot survive or
// leak beyond its RunState, and every async guard is memoized below so real close/fallback execute it once.
const TERMINAL_CLOSE_GRACE_MS = 2000
const TERMINAL_CLOSE_POLL_MS = 250
const terminalCloseHandlers = new WeakSet<RunState>()
const terminalDeadObservedAt = new WeakMap<RunState, number>()
const terminalCloseWatchdogTimers = new WeakMap<RunState, NodeJS.Timeout>()

function immutableOutputDigest(absolutePath: string): string {
  let fd: number | null = null
  try {
    fd = fs.openSync(absolutePath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const before = fs.fstatSync(fd)
    if (!before.isFile()) throw new Error('reused output is not a regular file')
    const bytes = fs.readFileSync(fd)
    const after = fs.fstatSync(fd)
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
        || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      throw new Error('reused output changed while being verified')
    }
    return createHash('sha256').update(bytes).digest('hex')
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

function bindPreparedImmutableReusedOutputs(run: RunState, doneOrbKeys: readonly string[]): void {
  if (!run.runRoot) throw new Error('prepared Continue lost its exact run root')
  if (run.kind !== 'full' && run.kind !== 'module') {
    if (doneOrbKeys.length) throw new Error('prepared non-research run cannot carry reusable orb outputs')
    return
  }
  const exactRoot = path.resolve(REPO_ROOT, run.runRoot)
  const outputs: ImmutableReusedOutput[] = []
  for (const key of [...new Set(doneOrbKeys)].sort()) {
    // One full transaction is shared by sibling module children. Each module child protects only reused
    // bytes inside its own writable directory; the terminal full/master child protects every reused key.
    if (run.kind === 'module' && run.module && !key.startsWith(`${run.module}/`)) continue
    const expected = run.expected.get(key)
    if (!expected) throw new Error(`prepared Continue reusable orb is outside the admitted graph: ${key}`)
    const absolutePath = path.resolve(exactRoot, expected.outputRel)
    if (!pathIsWithin(absolutePath, exactRoot)) throw new Error('prepared Continue reusable output escaped its run root')
    outputs.push({
      outputRel: expected.outputRel,
      absolutePath,
      sha256: immutableOutputDigest(absolutePath),
    })
  }
  immutableReusedOutputsByRun.set(run, outputs)
}

function verifyPreparedImmutableReusedOutputs(run: RunState): void {
  for (const output of immutableReusedOutputsByRun.get(run) ?? []) {
    if (immutableOutputDigest(output.absolutePath) !== output.sha256) {
      throw new Error(`reused Continue output changed across the paid child boundary: ${output.outputRel}`)
    }
  }
}

/** Focused parity/test seam for Continue's per-file read-only exceptions. */
export function bindPreparedImmutableReusedOutputsForTest(run: RunState, doneOrbKeys: readonly string[]): void {
  bindPreparedImmutableReusedOutputs(run, doneOrbKeys)
}

/** Focused pre/post test seam; production calls this immediately before spawn and after process extinction. */
export function verifyPreparedImmutableReusedOutputsForTest(run: RunState): void {
  verifyPreparedImmutableReusedOutputs(run)
}

function recoverNonCleanExactClose(run: RunState): NonCleanExactModuleRecovery | null {
  if (run.endedAt !== undefined || !exactModuleResumeRuns.has(run) || !run.module) return null
  const targetRunRoot = exactModuleRunRootByRun.get(run)
  const artifactScope = exactModuleArtifactScopeByRun.get(run)
  if (!targetRunRoot || !artifactScope || artifactScope.module !== run.module) {
    return { disposition: 'recovery-failed', reason: 'missing_exact_module_scope' }
  }
  const recovery = recoverNonCleanExactModulePublication({
    ticker: run.ticker,
    module: run.module,
    targetRunRoot,
    synthesisOrbs: artifactScope.synthesisOrbs,
  })
  if (recovery.disposition === 'recovery-failed') {
    // Keep the terminal status (cancel/error) authoritative. This note makes a fail-closed filesystem
    // refusal diagnosable without changing Stop semantics or attempting any publication work.
    run.note = `${run.note ? `${run.note}; ` : ''}exact output recovery failed: ${recovery.reason}`
  }
  return recovery
}

/** The actual child close callback has claimed the final sweep/status lifecycle. While it awaits process-
 * group extinction or publication, no reaper/force path may substitute its own finalizer. */
export function processCloseOwnsFinalization(run: RunState): boolean {
  return run.endedAt === undefined && terminalCloseHandlers.has(run)
}

export function bindTerminalGuard(run: RunState, guard: TerminalGuard): void {
  terminalGuards.set(run, guard)
}

export function trackTerminalGuardWork(
  run: RunState,
  work: Promise<PreSpawnGuardResult>,
): Promise<PreSpawnGuardResult> {
  terminalWorkByRun.set(run, work)
  return work
}

export function clearTerminalGuardWork(run: RunState, work: Promise<PreSpawnGuardResult>): void {
  if (terminalWorkByRun.get(run) === work) terminalWorkByRun.delete(run)
}

export function runHasUnfinishedTerminalWork(run: RunState): boolean {
  return terminalWorkByRun.has(run)
}

/** A bound terminal guard owns a dead child's close/finalization until the real handler or watchdog proves
 * the outcome. This is intentionally broader than `runHasUnfinishedTerminalWork`: the guard promise may not
 * have started yet, but reaper/force still must not release the subject in that pre-onClose window. */
export function terminalGuardOwnsClose(run: RunState): boolean {
  return run.endedAt === undefined && terminalGuards.has(run)
}

function beginTerminalGuardWork(run: RunState): Promise<PreSpawnGuardResult> {
  const existing = terminalWorkByRun.get(run)
  if (existing) return existing
  // Defer invocation one microtask so the writer token is installed before any user callback can run.
  const work = Promise.resolve().then(() => evaluateTerminalGuard(terminalGuards.get(run)))
  return trackTerminalGuardWork(run, work)
}

function stopTerminalCloseWatchdog(run: RunState): void {
  const timer = terminalCloseWatchdogTimers.get(run)
  if (timer) clearInterval(timer)
  terminalCloseWatchdogTimers.delete(run)
  terminalDeadObservedAt.delete(run)
}

/** One deterministic watchdog inspection. Exported so the dead-PID-before-onClose regression advances its
 * clock without sleeping. The real timer below calls the exact same path. */
export function inspectTerminalCloseWatchdog(
  run: RunState,
  now: number = Date.now(),
  graceMs: number = TERMINAL_CLOSE_GRACE_MS,
): 'inactive' | 'alive' | 'grace' | 'owned' | 'started' {
  if (!terminalGuardOwnsClose(run)) {
    stopTerminalCloseWatchdog(run)
    return 'inactive'
  }
  if (terminalCloseHandlers.has(run)) {
    stopTerminalCloseWatchdog(run)
    return 'owned'
  }
  if (!run.child || processTreeAlive(run.child.pid)) {
    terminalDeadObservedAt.delete(run)
    return 'alive'
  }
  const firstDeadAt = terminalDeadObservedAt.get(run)
  if (firstDeadAt === undefined) {
    terminalDeadObservedAt.set(run, now)
    return 'grace'
  }
  if (now - firstDeadAt < Math.max(0, graceMs)) return 'grace'

  // Claim the close synchronously before starting any async work. A racing real close can share the same
  // guard promise and endedAt-gated finalizer, but no second watchdog/reaper can create another publisher.
  terminalCloseHandlers.add(run)
  stopTerminalCloseWatchdog(run)
  sweepRunOutputs(run)

  // A deliberate stop never publishes. It still finalizes only through this close-owned fallback, so the
  // claim remains held until the dead process is proven and the status/endedAt transition is coherent.
  if ((run.status as string) === 'cancelled' || run.cancelRequested) {
    recoverNonCleanExactClose(run)
    finalizeRunOnClose(run, { isTerminated: true, signal: 'SIGKILL' }, '')
    return 'started'
  }

  // A structured stream error is already authoritative and recorded, but it retained claims for this exact
  // dead-process proof. Never run terminal publication for an errored child; release only through finalizer.
  if (streamResultErrors.has(run)) {
    recoverNonCleanExactClose(run)
    finalizeRunOnClose(run, { exitCode: 1 }, '')
    return 'started'
  }

  // A lost close has no authoritative exit result. It may have been error_max_turns/nonzero after 99 landed,
  // so it must NEVER guess clean and enter the normal terminalGuard (which publishes Git). Marker-only
  // recovery either records the exact stable bytes for an explicit publish retry or quarantines 99; then the
  // run finishes incomplete. If real onClose arrived first it claimed terminalCloseHandlers above and this
  // branch was unreachable, so normal clean publication still has one owner.
  const recovery = recoverNonCleanExactClose(run)
  const reason = recovery?.disposition === 'recovery-failed'
    ? 'terminal_close_recovery_failed'
    : 'terminal_close_result_unavailable'
  finalizeRunOnClose(run, { exitCode: 0 }, '', {
    ok: false,
    reason,
    message: recovery?.disposition === 'publication-pending'
      ? 'The engine close result was lost. The completed module bytes were saved for an explicit publish-only retry.'
      : 'The engine close result was lost, so the module was not published. Re-run the unfinished synthesis.',
  })
  return 'started'
}

function armTerminalCloseWatchdog(run: RunState): void {
  if (!terminalGuardOwnsClose(run) || terminalCloseWatchdogTimers.has(run)) return
  const timer = setInterval(() => { inspectTerminalCloseWatchdog(run) }, TERMINAL_CLOSE_POLL_MS)
  timer.unref?.()
  terminalCloseWatchdogTimers.set(run, timer)
}

/** Validate the immutable research root carried by a smart module resume. The optional `resolvedRunRoot`
 * check is the launch-time rollover CAS: if the route reviewed Aug 21 but launch() resolves Aug 22, the
 * launch stops before admission/spawn instead of silently changing folders. */
export function exactModuleRunRootBinding(
  subject: string,
  requestedRunRoot: unknown,
  resolvedRunRoot?: string,
): string | null {
  if (!isValidTicker(subject) || typeof requestedRunRoot !== 'string') return null
  const match = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/.exec(requestedRunRoot)
  if (!match || match[1] !== subject || (resolvedRunRoot !== undefined && requestedRunRoot !== resolvedRunRoot)) return null
  const parsed = new Date(`${match[2]}T00:00:00.000Z`)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== match[2]) return null
  return requestedRunRoot
}

/** Normalize an internal final-boundary callback. A thrown/malformed callback fails CLOSED with generic
 *  wording; a well-formed route reason is preserved for SSE/UI handling. Exported for the no-spend unit test. */
export function evaluatePreSpawnGuard(guard?: PreSpawnGuard): PreSpawnGuardResult {
  if (!guard) return { ok: true }
  try {
    const result = guard()
    if (result?.ok === true) return { ok: true }
    const reason = typeof result?.reason === 'string' && /^[a-z][a-z0-9_]{2,63}$/.test(result.reason)
      ? result.reason : 'launch_scope_changed'
    const message = typeof result?.message === 'string' && result.message.trim()
      ? result.message.trim().slice(0, 500)
      : 'The launch scope changed before the engine could start. Refresh and try again.'
    return { ok: false, reason, message }
  } catch {
    return {
      ok: false,
      reason: 'launch_scope_changed',
      message: 'The launch scope could not be verified immediately before starting. No run was started.',
    }
  }
}

/** Async twin of the final paid-boundary guard. A thrown/malformed publication proof fails closed and
 * never exposes internal Git/path details in SSE or Activity. */
export async function evaluateTerminalGuard(guard?: TerminalGuard): Promise<PreSpawnGuardResult> {
  if (!guard) return { ok: true }
  try {
    const result = await guard()
    if (result?.ok === true) return { ok: true }
    const reason = typeof result?.reason === 'string' && /^[a-z][a-z0-9_]{2,63}$/.test(result.reason)
      ? result.reason : 'terminal_proof_failed'
    const message = typeof result?.message === 'string' && result.message.trim()
      ? result.message.trim().slice(0, 500)
      : 'The completed analysis could not be verified as safely published. Its saved work remains on disk.'
    return { ok: false, reason, message }
  } catch {
    return {
      ok: false,
      reason: 'terminal_proof_failed',
      message: 'The completed analysis could not be verified as safely published. Its saved work remains on disk.',
    }
  }
}

// ---- chained full run (per-module budgets), DAG-PARALLEL — the only Full/Continue execution path ----
// A full pipeline as a set of SEPARATE per-module runs (each its own budget + activity-log entry),
// scheduled by the depends_on DAG: a module launches as soon as ALL its upstream modules are done, so
// INDEPENDENT modules run CONCURRENTLY instead of in series. For the research swarm this means
// business-model -> earnings -> { balance-sheet-survival || management-governance } -> valuation -> catalyst -> master
// -> catalyst -> master synthesizer. The modules write disjoint subfolders of ONE shared
// analyses/<ticker>_<date> root, so admission's disjoint-writes rule (D2) is satisfied and the master
// reads them all; admission D3 blocks only ancestor/descendant overlaps, so siblings are allowed.
// Concurrency is bounded by MAX_CONCURRENT_RUNS. This is purely a SCHEDULE change — same modules, same
// orbs, same model, byte-identical outputs — so it is output-neutral; the only effect is wall-clock (the
// independent wave overlaps) and the disappearance of the single-budget truncation a monolithic
// /research:full can suffer. A failed/incomplete/cancelled module stops scheduling NEW modules (already
// in-flight ones still finish), leaving the pipeline visibly stopped at that module to fix and resume.
// Self-discovers modules + deps from buildSwarmGraph (no hardcoded names), so a new module auto-joins the
// DAG (CLAUDE.md §26).
// The scheduler's two I/O touchpoints are INJECTED so the DAG logic can be unit-tested with a fake
// launcher (no spawned CLI, no filesystem). The defaults wire the real launch() + getRun().onFinish and
// the real marker file — so production behavior is unchanged.
// A transient global-capacity rejection (admission D5 → HTTP 429) is backpressure, not a failure: the
// chain re-pumps after this delay until a slot frees. Injected scheduleRetry lets tests drive it.
const CAPACITY_RETRY_MS = 5000
const defaultResearchRunRoot = (ticker: string) => `analyses/${ticker}_${todayDate()}`
const deferMarkerPath = (ticker: string, runRoot = defaultResearchRunRoot(ticker)) =>
  path.join(REPO_ROOT, runRoot, '.defer_module_memos')

// Kill switches for chained full runs. Every scheduler captures both the global epoch and its own
// subject epoch. "Stop everything" bumps the global epoch; cancelling one subject bumps only that
// subject's epoch, so stopping INDIAMART can never strand an unrelated TCS chain.
let chainEpoch = 0
const subjectChainEpoch = new Map<string, number>()
const subjectChainKey = (subjectId: string, swarmId: string) => `${swarmId}\u0000${subjectId}`
// A chained full run is one logical writer even when no child RunState exists (for example, every ready
// module is backed off on capacity between waves). Keep a token for that whole lifetime so disk-staging and
// publish-only routes cannot mistake a child-transition gap for an idle subject. The token is deliberately
// separate from child admission: deferred children carry `chained:true` and are allowed to join their owner.
interface ActiveSubjectChain {
  token: symbol
  releaseDeployBarrier: () => void
}
const activeSubjectChains = new Map<string, ActiveSubjectChain>()
const cancelledChainIds = new Set<string>()

/**
 * One logical full/continue chain owns one readiness snapshot. Children are separate RunStates (and a
 * dependency wave may admit several in the same turn), so keeping this on a child would make every child
 * re-extract the same pool and could open several identical decision panels. The first child is the sole
 * evaluator/decision owner; every later child awaits and reuses its exact report.
 */
export type ChainedReadinessResolution = {
  action: ReadinessDecision['action']
  user: string
  acknowledgedText?: string
  report: ReadinessReport | null
}

export interface ChainedReadinessBinding {
  ticker: string
  runRoot: string
}

export type FrozenPoolBinding = NonNullable<ReadinessReport['frozenPool']>

interface FrozenPathIdentity {
  path: string
  label: string
  kind: 'directory' | 'file'
  dev: number
  ino: number
  mode: number
  size: number
  mtimeMs: number
  ctimeMs: number
}

interface FrozenPoolMetadataProof {
  identities: readonly FrozenPathIdentity[]
}

// A generation can contain hundreds of source/extract artifacts. Hash every byte once when the Python
// receipt crosses into the chain coordinator, then retain an inode/size/mode/mtime/ctime proof. Every later
// provider boundary re-stats that complete set. That catches chmod, replacement, deletion, or byte writes
// without re-reading gigabytes before every orb, while the first proof still independently checks the full
// content-addressed receipt rather than trusting a manifest's claims about itself.
const frozenPoolMetadataByBinding = new WeakMap<FrozenPoolBinding, FrozenPoolMetadataProof>()

interface ChainedReadinessState {
  ownerRunId: string
  binding: { ticker: string; runRoot: string }
  requireExistingReceipt: boolean
  stateDir: string
  controller: AbortController
  assessment: Promise<ReadinessReport>
  assessmentActive: boolean
  report: ReadinessReport | null
  frozenPool: FrozenPoolBinding | null
  evidenceCapability: FrozenEvidenceReadCapability | null
  resolution: ChainedReadinessResolution | null
  resolutionPromise: Promise<ChainedReadinessResolution>
  settleResolution: (resolution: ChainedReadinessResolution) => void
}

const chainedReadinessById = new Map<string, ChainedReadinessState>()

function canonicalChainedReadinessBinding(binding: ChainedReadinessBinding): ChainedReadinessState['binding'] {
  const ticker = binding.ticker.trim().toUpperCase()
  if (exactModuleRunRootBinding(ticker, binding.runRoot) !== binding.runRoot) {
    throw new Error('frozen generation receipt has an invalid exact run-root binding')
  }
  return { ticker, runRoot: path.resolve(REPO_ROOT, binding.runRoot) }
}

function sameChainedReadinessBinding(
  left: ChainedReadinessState['binding'],
  right: ChainedReadinessState['binding'],
): boolean {
  return left.ticker === right.ticker && left.runRoot === right.runRoot
}

const DURABLE_FROZEN_GENERATION_SCHEMA = 'chained-frozen-generation/v1'
const DURABLE_FROZEN_GENERATION_DIR = 'chained-frozen-generations'

interface DurableFrozenGenerationReceipt {
  schema_version: typeof DURABLE_FROZEN_GENERATION_SCHEMA
  root_key: string
  ticker: string
  run_root: string
  generation_digest: string
  frozen_pool: FrozenPoolBinding
  readiness_report: ReadinessReport
  created_at: string
  self_sha256: string
}

export interface ChainedReadinessPersistenceOptions {
  /** Continue or any launch that may reuse provider-authored files must load, never replace, this receipt. */
  requireExistingReceipt?: boolean
  /** Test seam. Production always uses the engine's gitignored, restart-durable STATE_DIR. */
  stateDir?: string
}

function exactRelativeResearchRoot(binding: ChainedReadinessState['binding']): string {
  const relative = path.relative(REPO_ROOT, binding.runRoot).split(path.sep).join('/')
  if (exactModuleRunRootBinding(binding.ticker, relative) !== relative) {
    throw new Error('frozen generation receipt has an invalid exact run-root binding')
  }
  return relative
}

function durableFrozenGenerationRoot(stateDir: string): string {
  return path.join(path.resolve(stateDir), DURABLE_FROZEN_GENERATION_DIR)
}

function durableFrozenGenerationRootKey(binding: ChainedReadinessState['binding']): string {
  // Key by the already-validated repository-relative root. This remains collision-proof between dated
  // roots while surviving an owner moving the whole checkout to another absolute path.
  return createHash('sha256')
    .update(`${binding.ticker}\0${exactRelativeResearchRoot(binding)}`, 'utf8')
    .digest('hex')
}

function durableFrozenGenerationReceiptPath(
  binding: ChainedReadinessState['binding'],
  stateDir: string,
): string {
  return path.join(
    durableFrozenGenerationRoot(stateDir),
    `${durableFrozenGenerationRootKey(binding)}.json`,
  )
}

/** Deterministic path seam used only to corrupt/remove a test receipt between simulated restarts. */
export function durableFrozenGenerationReceiptPathForTest(
  binding: ChainedReadinessBinding,
  stateDir: string,
): string {
  return durableFrozenGenerationReceiptPath(canonicalChainedReadinessBinding(binding), stateDir)
}

function ensureOwnerOnlyReceiptRoot(stateDir: string): string {
  const state = path.resolve(stateDir)
  fs.mkdirSync(state, { recursive: true, mode: 0o700 })
  const stateInfo = fs.lstatSync(state)
  if (!stateInfo.isDirectory() || stateInfo.isSymbolicLink()) {
    throw new Error('frozen generation state root is unsafe')
  }
  const root = durableFrozenGenerationRoot(state)
  fs.mkdirSync(root, { recursive: true, mode: 0o700 })
  const rootInfo = fs.lstatSync(root)
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || fs.realpathSync(root) !== root) {
    throw new Error('frozen generation receipt directory is unsafe')
  }
  if (process.platform !== 'win32') {
    fs.chmodSync(root, 0o700)
    if ((fs.lstatSync(root).mode & 0o077) !== 0) {
      throw new Error('frozen generation receipt directory is not owner-only')
    }
  }
  return root
}

function syncReceiptDirectory(directory: string): void {
  if (process.platform === 'win32') return
  const descriptor = fs.openSync(directory, fs.constants.O_RDONLY)
  try { fs.fsyncSync(descriptor) } finally { fs.closeSync(descriptor) }
}

function durableReceiptDigest(value: Omit<DurableFrozenGenerationReceipt, 'self_sha256'>): string {
  return createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex')
}

function writeDurableFrozenGenerationReceipt(
  binding: ChainedReadinessState['binding'],
  report: ReadinessReport,
  frozenPool: FrozenPoolBinding,
  stateDir: string,
): void {
  const root = ensureOwnerOnlyReceiptRoot(stateDir)
  const target = durableFrozenGenerationReceiptPath(binding, stateDir)
  try {
    const existing = fs.lstatSync(target)
    if (!existing.isFile() || existing.isSymbolicLink()) {
      throw new Error('existing frozen generation receipt is unsafe')
    }
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  const unsigned: Omit<DurableFrozenGenerationReceipt, 'self_sha256'> = {
    schema_version: DURABLE_FROZEN_GENERATION_SCHEMA,
    root_key: durableFrozenGenerationRootKey(binding),
    ticker: binding.ticker,
    run_root: exactRelativeResearchRoot(binding),
    generation_digest: frozenPool.generationDigest,
    frozen_pool: frozenPool,
    readiness_report: { ...report, frozenPool },
    created_at: new Date().toISOString(),
  }
  const receipt: DurableFrozenGenerationReceipt = {
    ...unsigned,
    self_sha256: durableReceiptDigest(unsigned),
  }
  const temporary = path.join(root, `.${receipt.root_key}.${process.pid}.${randomUUID()}.tmp`)
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    fs.writeFileSync(descriptor, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8')
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    fs.renameSync(temporary, target)
    if (process.platform !== 'win32') fs.chmodSync(target, 0o600)
    syncReceiptDirectory(root)
  } finally {
    if (descriptor != null) fs.closeSync(descriptor)
    try { fs.rmSync(temporary, { force: true }) } catch { /* preserve the receipt write error */ }
  }
}

function readOwnerOnlyReceiptFile(target: string): Buffer {
  let before: fs.Stats
  try { before = fs.lstatSync(target) } catch {
    throw new Error('saved run has no frozen generation receipt')
  }
  const ownUid = typeof process.getuid === 'function' ? process.getuid() : null
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1
      || (process.platform !== 'win32' && (before.mode & 0o077) !== 0)
      || (ownUid !== null && before.uid !== ownUid)) {
    throw new Error('saved run frozen generation receipt is unsafe')
  }
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(target, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(descriptor)
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino
        || opened.size <= 0 || opened.size > 8 * 1024 * 1024) {
      throw new Error('saved run frozen generation receipt changed while opening')
    }
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (opened.size !== after.size || opened.mtimeMs !== after.mtimeMs || opened.ctimeMs !== after.ctimeMs) {
      throw new Error('saved run frozen generation receipt changed while reading')
    }
    const current = fs.lstatSync(target)
    if (current.dev !== before.dev || current.ino !== before.ino || current.size !== before.size
        || current.mtimeMs !== before.mtimeMs || current.ctimeMs !== before.ctimeMs) {
      throw new Error('saved run frozen generation receipt changed while reading')
    }
    return bytes
  } finally {
    if (descriptor != null) fs.closeSync(descriptor)
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function validatedDurableReadinessReport(
  value: unknown,
  binding: ChainedReadinessState['binding'],
  frozenPool: FrozenPoolBinding,
): ReadinessReport {
  if (!isPlainRecord(value)
      || value.ticker !== binding.ticker
      || value.kind !== 'full'
      || !['clean', 'degraded', 'blocked'].includes(String(value.overall))
      || !Number.isInteger(value.fileCount) || Number(value.fileCount) < 0
      || !Number.isInteger(value.usableCount) || Number(value.usableCount) < 0
      || !Array.isArray(value.entities) || !value.entities.every((entry) => isPlainRecord(entry)
        && typeof entry.file === 'string' && typeof entry.entity === 'string')
      || !Array.isArray(value.issues) || !value.issues.every((issue) => isPlainRecord(issue)
        && typeof issue.code === 'string' && typeof issue.message === 'string'
        && ['blocker', 'degrade', 'info'].includes(String(issue.severity)))
      || !Number.isFinite(Number(value.ts))) {
    throw new Error('saved run frozen generation receipt has an invalid readiness report')
  }
  if (value.physicalPool !== undefined && (!isPlainRecord(value.physicalPool)
      || !['empty', 'nonempty', 'unknown'].includes(String(value.physicalPool.state))
      || !Number.isInteger(value.physicalPool.fileCount)
      || !Number.isInteger(value.physicalPool.nonEmptyFileCount))) {
    throw new Error('saved run frozen generation receipt has an invalid pool proof')
  }
  return { ...(value as unknown as ReadinessReport), frozenPool }
}

function loadDurableFrozenGenerationReceipt(
  binding: ChainedReadinessState['binding'],
  stateDir: string,
): { report: ReadinessReport; frozenPool: FrozenPoolBinding } {
  ensureOwnerOnlyReceiptRoot(stateDir)
  const target = durableFrozenGenerationReceiptPath(binding, stateDir)
  let parsed: unknown
  try { parsed = JSON.parse(readOwnerOnlyReceiptFile(target).toString('utf8')) } catch (error) {
    if (error instanceof Error && error.message.startsWith('saved run')) throw error
    throw new Error('saved run frozen generation receipt is corrupt')
  }
  if (!isPlainRecord(parsed)) throw new Error('saved run frozen generation receipt is corrupt')
  const { self_sha256: selfSha256, ...unsigned } = parsed
  const expected = durableReceiptDigest(unsigned as Omit<DurableFrozenGenerationReceipt, 'self_sha256'>)
  if (typeof selfSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(selfSha256)
      || !timingSafeEqual(Buffer.from(selfSha256, 'hex'), Buffer.from(expected, 'hex'))
      || parsed.schema_version !== DURABLE_FROZEN_GENERATION_SCHEMA
      || parsed.root_key !== durableFrozenGenerationRootKey(binding)
      || parsed.ticker !== binding.ticker
      || parsed.run_root !== exactRelativeResearchRoot(binding)
      || typeof parsed.generation_digest !== 'string'
      || !isPlainRecord(parsed.frozen_pool)
      || parsed.frozen_pool.generationDigest !== parsed.generation_digest) {
    throw new Error('saved run frozen generation receipt is corrupt or belongs to another run')
  }
  const provisional = parsed.frozen_pool as unknown as FrozenPoolBinding
  const report = validatedDurableReadinessReport(parsed.readiness_report, binding, provisional)
  const frozenPool = verifiedFrozenPoolBinding(binding, report)
  if (!frozenPool || frozenPool.generationDigest !== parsed.generation_digest) {
    throw new Error('saved run frozen generation no longer verifies')
  }
  return { report: { ...report, frozenPool }, frozenPool }
}

/**
 * Planner-facing restart proof. This reads only the owner-only durable receipt and its already-frozen,
 * content-verified generation; it never opens data/<TICKER> or rebuilds an extraction.
 */
export function durableFrozenGenerationSummaryForRun(
  binding: ChainedReadinessBinding,
  stateDir: string = STATE_DIR,
): { generationDigest: string; fileCount: number; newestMs: number; frozenPool: FrozenPoolBinding } {
  const canonical = canonicalChainedReadinessBinding(binding)
  const { report, frozenPool } = loadDurableFrozenGenerationReceipt(canonical, path.resolve(stateDir))
  const artifact = readFrozenArtifact(
    path.join(frozenPool.generationDir, 'manifest.json'),
    'frozen evidence manifest',
  )
  let manifest: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(artifact.content.toString('utf8'))
    if (!isPlainRecord(parsed)) throw new Error('not an object')
    manifest = parsed
  } catch {
    throw new Error('saved run frozen generation manifest is corrupt')
  }
  const cacheGuard = isPlainRecord(manifest.cache_guard) ? manifest.cache_guard : null
  const poolInputs = cacheGuard && isPlainRecord(cacheGuard.pool_inputs) ? cacheGuard.pool_inputs : null
  if (poolInputs && Object.keys(poolInputs).length !== report.fileCount) {
    throw new Error('saved run frozen generation file snapshot is inconsistent')
  }
  // v2 extractor receipts carry source mtime_ns. Retained early-v2 receipts did not; their immutable
  // readiness timestamp is the conservative stable fallback and still requires no mutable Drive read.
  let newestMs = Number.isFinite(report.ts) ? report.ts : 0
  for (const value of Object.values(poolInputs ?? {})) {
    if (!isPlainRecord(value) || !Number.isFinite(Number(value.mtime_ns)) || Number(value.mtime_ns) < 0) {
      throw new Error('saved run frozen generation file timestamp is invalid')
    }
    newestMs = Math.max(newestMs, Number(value.mtime_ns) / 1_000_000)
  }
  return {
    generationDigest: frozenPool.generationDigest,
    fileCount: report.fileCount,
    newestMs,
    frozenPool,
  }
}

function frozenPathIdentity(
  candidate: string,
  label: string,
  kind: FrozenPathIdentity['kind'],
  requireReadOnly = true,
): FrozenPathIdentity {
  let stat: fs.Stats
  try { stat = fs.lstatSync(candidate) } catch {
    throw new Error(`${label} is unavailable`)
  }
  if (stat.isSymbolicLink()
      || (kind === 'directory' ? !stat.isDirectory() : !stat.isFile())) {
    throw new Error(`${label} is not a plain ${kind}`)
  }
  if (kind === 'file' && stat.nlink !== 1) {
    throw new Error(`${label} has an unsafe external hard-link`)
  }
  if (requireReadOnly && process.platform !== 'win32' && (stat.mode & 0o222) !== 0) {
    throw new Error(`${label} is writable`)
  }
  return {
    path: candidate,
    label,
    kind,
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    ctimeMs: stat.ctimeMs,
  }
}

function sameFrozenPathIdentity(left: FrozenPathIdentity, right: FrozenPathIdentity): boolean {
  return left.path === right.path
    && left.kind === right.kind
    && left.dev === right.dev
    && left.ino === right.ino
    && left.mode === right.mode
    && left.size === right.size
    && left.mtimeMs === right.mtimeMs
    && left.ctimeMs === right.ctimeMs
}

const GENERATION_BINDING_FORMAT = 'python-json-sort-keys-compact-utf8/v1'

/** Compare parsed JSON by JSON type and value, independent of object-key order.
 *
 * Never stringify either side here. Python and JavaScript spell valid JSON
 * numbers differently (5.0 vs 5, 1e-07 vs 1e-7). The receipt retains the
 * exact Python bytes for hashing; this walk independently proves that their
 * parsed meaning is exactly the manifest/artifact/input/source/entity binding
 * reconstructed by the server.
 */
function assertSameGenerationSemantics(actual: unknown, expected: unknown, at = '$'): void {
  if (actual === null || expected === null) {
    if (actual !== expected) throw new Error(`frozen evidence generation binding differs at ${at}`)
    return
  }
  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) {
      throw new Error(`frozen evidence generation binding differs at ${at}`)
    }
    for (let index = 0; index < expected.length; index++) {
      assertSameGenerationSemantics(actual[index], expected[index], `${at}[${index}]`)
    }
    return
  }
  if (typeof actual === 'number' || typeof expected === 'number') {
    if (typeof actual !== 'number' || typeof expected !== 'number'
        || !Number.isFinite(actual) || !Number.isFinite(expected)
        || !Object.is(actual, expected)) {
      throw new Error(`frozen evidence generation binding differs at ${at}`)
    }
    return
  }
  if (typeof actual !== 'object' || typeof expected !== 'object') {
    if (typeof actual !== typeof expected || actual !== expected) {
      throw new Error(`frozen evidence generation binding differs at ${at}`)
    }
    return
  }
  const actualRecord = actual as Record<string, unknown>
  const expectedRecord = expected as Record<string, unknown>
  const actualKeys = Object.keys(actualRecord)
  const expectedKeys = Object.keys(expectedRecord)
  if (actualKeys.length !== expectedKeys.length
      || expectedKeys.some((key) => !Object.prototype.hasOwnProperty.call(actualRecord, key))) {
    throw new Error(`frozen evidence generation binding differs at ${at}`)
  }
  for (const key of expectedKeys) {
    assertSameGenerationSemantics(actualRecord[key], expectedRecord[key], `${at}.${key}`)
  }
}

function localizeGenerationSourcesForDigest(
  value: unknown,
  generationDigest: string,
  artifacts: Record<string, string>,
): unknown[] {
  if (!Array.isArray(value)) throw new Error('frozen evidence source binding is malformed')
  const sources = JSON.parse(JSON.stringify(value)) as unknown[]
  const exactPrefix = `.extract-generations/${generationDigest}/`
  for (const item of sources) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('frozen evidence source binding is malformed')
    }
    const source = item as Record<string, unknown>
    const owners: Record<string, unknown>[] = [source]
    if (Array.isArray(source.sheets)) {
      owners.push(...source.sheets.filter((sheet): sheet is Record<string, unknown> =>
        !!sheet && typeof sheet === 'object' && !Array.isArray(sheet)))
    }
    for (const owner of owners) {
      const reference = owner.extract
      if (reference == null) continue
      if (typeof reference !== 'string' || !reference.startsWith(exactPrefix)) {
        throw new Error('frozen evidence extract escapes its bound generation')
      }
      const local = reference.slice(exactPrefix.length)
      if (!(local in artifacts)) {
        throw new Error('frozen evidence extract is not a bound artifact')
      }
      owner.extract = local
    }
  }
  return sources
}

function readFrozenArtifact(
  candidate: string,
  label: string,
): { content: Buffer; identity: FrozenPathIdentity } {
  const before = frozenPathIdentity(candidate, label, 'file')
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(candidate, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(descriptor)
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error(`${label} changed while it was being verified`)
    }
    if (process.platform !== 'win32' && (opened.mode & 0o222) !== 0) {
      throw new Error(`${label} is writable`)
    }
    const content = fs.readFileSync(descriptor)
    const afterRead = fs.fstatSync(descriptor)
    if (opened.size !== afterRead.size
        || opened.mode !== afterRead.mode
        || opened.mtimeMs !== afterRead.mtimeMs
        || opened.ctimeMs !== afterRead.ctimeMs) {
      throw new Error(`${label} changed while it was being verified`)
    }
    const afterPath = frozenPathIdentity(candidate, label, 'file')
    if (!sameFrozenPathIdentity(before, afterPath)) {
      throw new Error(`${label} changed while it was being verified`)
    }
    return { content, identity: afterPath }
  } finally {
    if (descriptor != null) fs.closeSync(descriptor)
  }
}

function verifyFrozenPoolMetadata(frozen: FrozenPoolBinding): FrozenPoolBinding {
  const proof = frozenPoolMetadataByBinding.get(frozen)
  if (!proof) throw new Error('frozen evidence has no admission-time content proof')
  for (const expected of proof.identities) {
    const actual = frozenPathIdentity(expected.path, expected.label, expected.kind)
    if (!sameFrozenPathIdentity(expected, actual)) {
      throw new Error(`${expected.label} changed after readiness admission`)
    }
  }
  return frozen
}

function verifyFrozenPoolReceipt(
  binding: ChainedReadinessState['binding'],
  frozen: FrozenPoolBinding,
): FrozenPoolBinding {
  const expectedData = path.resolve(DATA_DIR, binding.ticker)
  const expectedOut = path.resolve(binding.runRoot, '_pool_extracts')
  const expectedGenerationParent = path.join(expectedOut, '.extract-generations')
  const expectedGenerationDir = path.join(expectedGenerationParent, frozen.generationDigest)
  if (path.resolve(frozen.dataPath) !== expectedData
      || path.resolve(frozen.outDir) !== expectedOut
      || !/^[a-f0-9]{64}$/.test(frozen.generationDigest)
      || path.resolve(frozen.generationDir) !== expectedGenerationDir) {
    throw new Error('chained readiness generation does not match its exact ticker/run-root binding')
  }

  // The Python extractor proves the same schema before returning, but admission independently verifies
  // every artifact hash, source reference, digest, mode, and filesystem identity. A forged or legacy JSON
  // file therefore cannot turn a mutable Drive view into provider evidence.
  frozenPathIdentity(expectedGenerationParent, 'frozen evidence generation parent', 'directory', false)
  const identities = new Map<string, FrozenPathIdentity>()
  const recordIdentity = (identity: FrozenPathIdentity) => { identities.set(identity.path, identity) }
  recordIdentity(frozenPathIdentity(expectedGenerationDir, 'frozen evidence generation', 'directory'))
  const manifestPath = path.join(expectedGenerationDir, 'manifest.json')
  let manifest: Record<string, unknown>
  try {
    const manifestArtifact = readFrozenArtifact(manifestPath, 'frozen evidence manifest')
    recordIdentity(manifestArtifact.identity)
    const parsed: unknown = JSON.parse(manifestArtifact.content.toString('utf8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    manifest = parsed as Record<string, unknown>
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('frozen evidence manifest')) throw error
    throw new Error('frozen evidence manifest is unreadable')
  }
  const generation = manifest.generation
  const generationRecord = generation && typeof generation === 'object' && !Array.isArray(generation)
    ? generation as Record<string, unknown> : null
  const digestMapValid = (value: unknown) => !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.entries(value as Record<string, unknown>).every(([name, digest]) =>
      !!name && !name.includes('\\') && !path.isAbsolute(name)
      && !name.split('/').some((part) => !part || part === '.' || part === '..')
      && typeof digest === 'string' && /^[a-f0-9]{64}$/.test(digest))
  const rawPrefix = generationRecord?.raw_prefix
  const bindingJson = generationRecord?.binding_json
  if (!generationRecord
      || generationRecord.schema_version !== 'pool-generation/v2'
      || generationRecord.digest !== frozen.generationDigest
      || path.resolve(String(manifest.data_path ?? '')) !== expectedData
      || path.resolve(String(manifest.out_dir ?? '')) !== expectedOut
      || manifest.offline_extraction_complete !== true
      || typeof bindingJson !== 'string'
      || typeof rawPrefix !== 'string'
      || path.isAbsolute(rawPrefix)
      || rawPrefix.split('/').some((part) => !part || part === '.' || part === '..')
      || !digestMapValid(generationRecord.inputs)
      || !digestMapValid(generationRecord.artifacts)) {
    throw new Error('frozen evidence manifest does not match its verified v2 binding')
  }
  const computedGenerationDigest = createHash('sha256')
    .update(bindingJson, 'utf8')
    .digest('hex')
  if (computedGenerationDigest !== frozen.generationDigest) {
    throw new Error('frozen evidence generation digest does not verify')
  }
  let retainedBinding: unknown
  try {
    retainedBinding = JSON.parse(bindingJson)
  } catch {
    throw new Error('frozen evidence generation binding JSON is unreadable')
  }
  if (!retainedBinding || typeof retainedBinding !== 'object' || Array.isArray(retainedBinding)) {
    throw new Error('frozen evidence generation binding JSON is not an object')
  }
  const artifacts = generationRecord.artifacts as Record<string, string>
  if ('manifest.json' in artifacts) {
    throw new Error('frozen evidence manifest cannot bind itself as a generation artifact')
  }
  for (const [source, digest] of Object.entries(generationRecord.inputs as Record<string, string>)) {
    if (artifacts[`${rawPrefix}/${source}`] !== digest) {
      throw new Error('frozen evidence manifest does not bind every live-pool input')
    }
  }
  const expectedEvidenceRoot = path.join(expectedGenerationDir, rawPrefix)
  if (path.resolve(frozen.evidenceRoot) !== expectedEvidenceRoot) {
    throw new Error('frozen evidence root does not match the verified raw generation binding')
  }

  const expectedFiles = new Set(['manifest.json', ...Object.keys(artifacts)])
  const foundFiles = new Set<string>()
  const walk = (directory: string, relative = '') => {
    const names = fs.readdirSync(directory).sort()
    for (const name of names) {
      const candidate = path.join(directory, name)
      const rel = relative ? `${relative}/${name}` : name
      let stat: fs.Stats
      try { stat = fs.lstatSync(candidate) } catch { throw new Error(`frozen evidence member is unavailable: ${rel}`) }
      if (stat.isSymbolicLink()) throw new Error(`frozen evidence member is a symlink: ${rel}`)
      if (stat.isDirectory()) {
        recordIdentity(frozenPathIdentity(candidate, `frozen evidence directory ${rel}`, 'directory'))
        walk(candidate, rel)
      } else if (stat.isFile()) {
        foundFiles.add(rel)
        if (!expectedFiles.has(rel)) throw new Error(`frozen evidence contains an unbound file: ${rel}`)
      } else {
        throw new Error(`frozen evidence member is not a plain file or directory: ${rel}`)
      }
    }
  }
  walk(expectedGenerationDir)
  for (const expected of expectedFiles) {
    if (!foundFiles.has(expected)) throw new Error(`frozen evidence artifact is missing: ${expected}`)
  }

  for (const [rel, expectedDigest] of Object.entries(artifacts)) {
    const artifact = readFrozenArtifact(
      path.join(expectedGenerationDir, ...rel.split('/')),
      `frozen evidence artifact ${rel}`,
    )
    recordIdentity(artifact.identity)
    const actualDigest = createHash('sha256').update(artifact.content).digest('hex')
    if (actualDigest !== expectedDigest) throw new Error(`frozen evidence artifact changed: ${rel}`)
  }

  const localizedSources = localizeGenerationSourcesForDigest(
    manifest.sources ?? [], frozen.generationDigest, artifacts,
  )
  if (manifest.entities != null && !Array.isArray(manifest.entities)) {
    throw new Error('frozen evidence entity binding is malformed')
  }
  const payload = {
    schema_version: generationRecord.schema_version,
    binding_format: GENERATION_BINDING_FORMAT,
    data_path: expectedData,
    out_dir: expectedOut,
    vision_mode: Boolean(manifest.vision_mode),
    offline_extraction_complete: Boolean(manifest.offline_extraction_complete),
    raw_prefix: rawPrefix,
    inputs: generationRecord.inputs,
    sources: localizedSources,
    entities: manifest.entities ?? [],
    artifacts,
  }
  try {
    assertSameGenerationSemantics(retainedBinding, payload)
  } catch {
    throw new Error('frozen evidence generation binding does not match its manifest')
  }

  // Re-stat the whole tree after hashing. A concurrent chmod/replacement cannot race the expensive pass
  // and leave behind a proof for different bytes.
  for (const expected of identities.values()) {
    const actual = frozenPathIdentity(expected.path, expected.label, expected.kind)
    if (!sameFrozenPathIdentity(expected, actual)) {
      throw new Error(`${expected.label} changed while its generation was being verified`)
    }
  }
  const verified = Object.freeze({
    dataPath: expectedData,
    outDir: expectedOut,
    generationDigest: frozen.generationDigest,
    generationDir: expectedGenerationDir,
    evidenceRoot: expectedEvidenceRoot,
  })
  frozenPoolMetadataByBinding.set(verified, {
    identities: Object.freeze([...identities.values()].map((identity) => Object.freeze(identity))),
  })
  return verified
}

function verifiedFrozenPoolBinding(
  binding: ChainedReadinessState['binding'],
  report: ReadinessReport,
): FrozenPoolBinding | null {
  if (report.ticker.trim().toUpperCase() !== binding.ticker) {
    throw new Error('chained readiness report ticker does not match its exact chain binding')
  }
  if (!report.frozenPool) {
    if (readinessProvesEmpty(report)) return null
    // A legacy/technical report without a generation cannot give a two-hour chain a stable evidence
    // boundary. Fail before provider spend instead of silently falling back to the changing live pool.
    throw new Error('chained readiness did not produce a verified frozen evidence generation')
  }
  return verifyFrozenPoolReceipt(binding, report.frozenPool)
}

function frozenPoolBindingForRun(run: RunState): FrozenPoolBinding | null {
  if (!run.chained || !run.chainId || !run.runRoot) return null
  const state = chainedReadinessById.get(run.chainId)
  if (!state) {
    throw new Error('chained provider launch lost its exact readiness generation before spend')
  }
  const candidate = canonicalChainedReadinessBinding({ ticker: run.ticker, runRoot: run.runRoot })
  if (!sameChainedReadinessBinding(state.binding, candidate)) {
    throw new Error('provider launch does not match its exact chained readiness binding')
  }
  // Re-prove the complete filesystem identity immediately at each provider boundary. The expensive hash
  // proof ran once at chain admission; later waves get a cheap O(files) metadata check that still catches
  // chmod/write/replace/delete before spend.
  return state.frozenPool ? verifyFrozenPoolMetadata(state.frozenPool) : null
}

const FROZEN_EVIDENCE_CAPABILITY_PARENT = path.join(PUBLICATION_SOCKET_ROOT, 'frozen-evidence')

function frozenEvidenceCapabilityOptions() {
  return {
    capabilityRoot: FROZEN_EVIDENCE_CAPABILITY_PARENT,
    forbiddenRoots: [REPO_ROOT, DATA_DIR, STATE_DIR],
  }
}

function destroyChainedEvidenceCapability(state: ChainedReadinessState): void {
  const capability = state.evidenceCapability
  state.evidenceCapability = null
  if (!capability) return
  destroyFrozenEvidenceReadCapability(capability, frozenEvidenceCapabilityOptions())
}

function frozenEvidenceBindingForRun(
  run: RunState,
  verifyCapabilityContent = false,
): { frozenPool: FrozenPoolBinding; capability: FrozenEvidenceReadCapability } | null {
  const frozenPool = frozenPoolBindingForRun(run)
  if (!frozenPool) return null
  const state = chainedReadinessById.get(run.chainId!)
  if (!state) throw new Error('frozen evidence capability lost its exact chain owner')
  let created = false
  if (!state.evidenceCapability) {
    state.evidenceCapability = createFrozenEvidenceReadCapability(
      frozenPool,
      frozenEvidenceCapabilityOptions(),
    )
    created = true
  }
  if (verifyCapabilityContent && !created) {
    verifyFrozenEvidenceReadCapability(
      state.evidenceCapability,
      frozenPool,
      frozenEvidenceCapabilityOptions(),
    )
  }
  return { frozenPool, capability: state.evidenceCapability }
}

function providerEvidenceBinding(run: RunState) {
  return providerEvidenceBoundary.get(run) ?? frozenEvidenceBindingForRun(run)
}

function prepareProviderEvidenceBoundary(
  run: RunState,
): { frozenPool: FrozenPoolBinding; capability: FrozenEvidenceReadCapability } | null {
  const binding = frozenEvidenceBindingForRun(run, true)
  if (binding) providerEvidenceBoundary.set(run, binding)
  else providerEvidenceBoundary.delete(run)
  return binding
}

/** Deterministic integration seam for capability isolation/lifecycle tests. */
export function frozenEvidenceBindingForRunForTest(
  run: RunState,
  verifyCapabilityContent = true,
): { frozenPool: FrozenPoolBinding; capability: FrozenEvidenceReadCapability } | null {
  return frozenEvidenceBindingForRun(run, verifyCapabilityContent)
}

/** Exact adapter-build boundary used by both providers; verifies all capability bytes before return. */
export function prepareProviderEvidenceBoundaryForTest(
  run: RunState,
): { frozenPool: FrozenPoolBinding; capability: FrozenEvidenceReadCapability } | null {
  return prepareProviderEvidenceBoundary(run)
}

/** Single-flight coordinator used by the real gate and deterministic tests. The map insertion happens
 * before `evaluate` enters its async work, so same-turn sibling admissions cannot both become owners. */
export async function assessChainedReadinessOnce(
  chainId: string,
  runId: string,
  binding: ChainedReadinessBinding,
  evaluate: (signal: AbortSignal) => Promise<ReadinessReport>,
  persistence: ChainedReadinessPersistenceOptions = {},
): Promise<{
  owner: boolean
  report: ReadinessReport
  frozenPool: FrozenPoolBinding | null
  resolution: Promise<ChainedReadinessResolution>
}> {
  const exactBinding = canonicalChainedReadinessBinding(binding)
  const requireExistingReceipt = persistence.requireExistingReceipt === true
  const stateDir = path.resolve(persistence.stateDir ?? STATE_DIR)
  let state = chainedReadinessById.get(chainId)
  if (state && !sameChainedReadinessBinding(state.binding, exactBinding)) {
    throw new Error('chain id is already bound to a different ticker or run root')
  }
  if (state && (state.requireExistingReceipt !== requireExistingReceipt || state.stateDir !== stateDir)) {
    throw new Error('chain id is already bound to a different frozen generation receipt policy')
  }
  if (!state) {
    let settleResolution!: (resolution: ChainedReadinessResolution) => void
    const resolutionPromise = new Promise<ChainedReadinessResolution>((resolve) => {
      settleResolution = resolve
    })
    const controller = new AbortController()
    let created!: ChainedReadinessState
    // Promise.resolve().then() deliberately defers work until after the state is published. A Continue or
    // any implicit output reuse loads only the durable exact-root receipt: it never invokes the live-pool
    // evaluator. A genuinely fresh Full evaluates once, verifies the immutable generation, then fsyncs its
    // owner-only receipt before the report can release any child toward a paid provider boundary.
    const assessment = Promise.resolve().then(() => {
      if (requireExistingReceipt) {
        const retained = loadDurableFrozenGenerationReceipt(exactBinding, stateDir)
        created.frozenPool = retained.frozenPool
        return retained.report
      }
      return evaluate(controller.signal).then((report) => {
        created.frozenPool = verifiedFrozenPoolBinding(exactBinding, report)
        if (created.frozenPool) {
          writeDurableFrozenGenerationReceipt(exactBinding, report, created.frozenPool, stateDir)
        }
        return report
      })
    })
    created = {
      ownerRunId: runId,
      binding: exactBinding,
      requireExistingReceipt,
      stateDir,
      controller,
      assessment,
      assessmentActive: true,
      report: null,
      frozenPool: null,
      evidenceCapability: null,
      resolution: null,
      resolutionPromise,
      settleResolution,
    }
    state = created
    chainedReadinessById.set(chainId, state)
    void assessment.then(
      (report) => {
        state!.assessmentActive = false
        if (chainedReadinessById.get(chainId) === state) state!.report = report
      },
      () => {
        state!.assessmentActive = false
        // checkReadiness normally converts failures to a technical report. Keep the coordinator itself
        // recoverable if a future evaluator violates that contract instead of pinning a rejected promise.
        if (chainedReadinessById.get(chainId) === state) {
          try { destroyChainedEvidenceCapability(state!) } catch { /* no paid child received this failed state */ }
          chainedReadinessById.delete(chainId)
        }
      },
    )
  }
  const report = await state.assessment
  state.report = report
  return {
    owner: state.ownerRunId === runId,
    report,
    frozenPool: state.frozenPool,
    resolution: state.resolutionPromise,
  }
}

export function resolveChainedReadiness(
  chainId: string,
  ownerRunId: string,
  resolution: ChainedReadinessResolution,
): boolean {
  const state = chainedReadinessById.get(chainId)
  if (!state || state.ownerRunId !== ownerRunId || state.resolution) return false
  // A physically empty pool has no meaningful paid override. Only re-checking
  // after files arrive or cancelling may release this chain; keep the guard in
  // the coordinator as well as the HTTP decision path so future callers cannot
  // bypass it.
  if (state.report && readinessProvesEmpty(state.report) && resolution.action !== 'cancel') return false
  state.report = resolution.report
  state.resolution = resolution
  state.settleResolution(resolution)
  return true
}

function replaceChainedReadinessReport(chainId: string, ownerRunId: string, report: ReadinessReport): boolean {
  const state = chainedReadinessById.get(chainId)
  if (!state || state.ownerRunId !== ownerRunId || state.resolution) return false
  // Continue/reuse is permanently bound to the retained generation. A UI re-check must never read the
  // changing Drive tree and then replace that receipt underneath already-authored provider output.
  if (state.requireExistingReceipt) return false
  destroyChainedEvidenceCapability(state)
  state.frozenPool = verifiedFrozenPoolBinding(state.binding, report)
  if (state.frozenPool) {
    writeDurableFrozenGenerationReceipt(state.binding, report, state.frozenPool, state.stateDir)
  }
  state.report = report
  // A child admitted after an explicit re-check must inherit the new report, not the original empty one.
  state.assessment = Promise.resolve(report)
  return true
}

export function waitForChainedReadinessResolution(chainId: string): Promise<ChainedReadinessResolution> {
  const state = chainedReadinessById.get(chainId)
  if (!state) return Promise.reject(new Error(`readiness state for chain ${chainId} is no longer active`))
  return state.resolution ? Promise.resolve(state.resolution) : state.resolutionPromise
}

export function clearChainedReadiness(chainId: string): void {
  cancelledChainIds.delete(chainId)
  const state = chainedReadinessById.get(chainId)
  if (!state) return
  state.controller.abort(new ReadinessCancelledError('chain readiness released'))
  if (!state.resolution) {
    const resolution: ChainedReadinessResolution = {
      action: 'cancel', user: 'chain-supervisor', report: state.report,
    }
    state.resolution = resolution
    state.settleResolution(resolution) // release any sibling parked behind the one owner
  }
  try { destroyChainedEvidenceCapability(state) } catch (error: any) {
    console.error(`[readiness] frozen evidence capability cleanup failed for ${chainId}: ${String(error?.message || error)}`) // eslint-disable-line no-console
  }
  chainedReadinessById.delete(chainId)
}

/** Read-only test/diagnostic seam; chain terminal cleanup must return this to its prior value. */
export function chainedReadinessStateCount(): number {
  return chainedReadinessById.size
}

function chainedReadinessAssessmentActive(chainId: string): boolean {
  return chainedReadinessById.get(chainId)?.assessmentActive === true
    || listRuns().some((run) => run.chainId === chainId && activeReadinessByRun.has(run))
}

export function cancelledChainStateCount(): number {
  return cancelledChainIds.size
}

async function abortChainedReadiness(chainId: string | undefined): Promise<void> {
  if (!chainId) return
  const state = chainedReadinessById.get(chainId)
  if (!state) return
  if (!state.resolution) {
    const resolution: ChainedReadinessResolution = {
      action: 'cancel', user: 'chain-supervisor', report: state.report,
    }
    state.resolution = resolution
    state.settleResolution(resolution)
  }
  state.controller.abort(new ReadinessCancelledError('chain readiness cancelled'))
  const activeRunDrains = listRuns()
    .filter((run) => run.chainId === chainId)
    .map((run) => abortRunReadiness(run))
  try { await state.assessment } catch (error) {
    if (!isReadinessCancelledError(error)) throw error
  }
  await Promise.all(activeRunDrains)
}

export interface ParityCanaryChainStatus {
  chainId: string
  runRoot: string
  runId: string | null
  provider: RunProvider
  profileKey: string | null
  status: 'starting' | 'running' | 'done' | 'error' | 'cancelled' | 'incomplete'
  startedAt: number
  endedAt: number | null
  message: string | null
}

// The canary endpoint admits one logical chain but the registry contains bounded child RunStates. Keep a
// supervisor-owned aggregate so polling cannot mistake a completed child or a capacity gap for completion.
const parityCanaryChainsByRoot = new Map<string, ParityCanaryChainStatus>()

export function getParityCanaryChainStatus(runRoot: string): ParityCanaryChainStatus | null {
  const state = parityCanaryChainsByRoot.get(runRoot)
  return state ? { ...state } : null
}

export function subjectChainActive(subjectId: string, swarmId = RESEARCH_SWARM_ID): boolean {
  return activeSubjectChains.has(subjectChainKey(subjectId, swarmId))
}

function acquireSubjectChainReservation(subjectId: string, swarmId = RESEARCH_SWARM_ID): () => void {
  const key = subjectChainKey(subjectId, swarmId)
  if (activeSubjectChains.has(key)) {
    const error: any = new Error(`A full-analysis chain is already active on ${subjectId}. Let it finish (or stop it) before starting more work.`)
    error.statusCode = 409
    error.body = { code: 'subject_busy' }
    throw error
  }
  // Hold this across the WHOLE logical chain, including capacity backoff and the child-transition gap
  // where no RunState exists. A per-child barrier alone would leave that exact gap open to launchctl.
  const releaseDeployBarrier = acquireProviderRunDeployLease()
  const token = Symbol(key)
  const active = { token, releaseDeployBarrier }
  activeSubjectChains.set(key, active)
  let released = false
  return () => {
    if (released) return
    released = true
    // Token-bound delete: an old halted scheduler must never clear a newer replacement chain.
    if (activeSubjectChains.get(key) === active) activeSubjectChains.delete(key)
    releaseDeployBarrier()
  }
}

export function haltAllChains(): void {
  stopAllChainScheduling()
  releaseAllSubjectChainReservations()
}

function stopAllChainScheduling(): void {
  chainEpoch++
}

function releaseAllSubjectChainReservations(): void {
  for (const active of activeSubjectChains.values()) active.releaseDeployBarrier()
  activeSubjectChains.clear()
}

export function haltSubjectChains(subjectId: string, swarmId = RESEARCH_SWARM_ID): void {
  stopSubjectChainScheduling(subjectId, swarmId)
  releaseSubjectChainReservation(subjectId, swarmId)
}

function stopSubjectChainScheduling(subjectId: string, swarmId = RESEARCH_SWARM_ID): void {
  const key = subjectChainKey(subjectId, swarmId)
  subjectChainEpoch.set(key, (subjectChainEpoch.get(key) ?? 0) + 1)
}

function releaseSubjectChainReservation(subjectId: string, swarmId = RESEARCH_SWARM_ID): void {
  const key = subjectChainKey(subjectId, swarmId)
  activeSubjectChains.get(key)?.releaseDeployBarrier()
  activeSubjectChains.delete(key)
}

export function haltChain(chainId: string | undefined): void {
  if (chainId) cancelledChainIds.add(chainId)
}

/** Capture the relevant chain epochs; the returned probe answers "may this chain still advance?".
 *  Omitting subjectId preserves the global-only probe used by the stop-everything test. */
export function captureChainEpoch(subjectId?: string, swarmId = RESEARCH_SWARM_ID, chainId?: string): () => boolean {
  const epoch = chainEpoch
  const key = subjectId ? subjectChainKey(subjectId, swarmId) : null
  const subjectEpoch = key ? (subjectChainEpoch.get(key) ?? 0) : 0
  const candidateChainId = chainId ?? (swarmId === RESEARCH_SWARM_ID ? subjectId : undefined)
  return () => epoch === chainEpoch
    && (!key || subjectEpoch === (subjectChainEpoch.get(key) ?? 0))
    && (!candidateChainId || !cancelledChainIds.has(candidateChainId))
}

export interface FullChainDeps {
  // launch one run (params) and register its completion callback; resolves to the run's id + preflight.
  launchAndWire: (params: LaunchParams, onFinish: (status: RunStatus) => void) => Promise<{ runId: string; preflight: LaunchPreflight }>
  // Establish both chained-full routing/completion markers before any paid work.
  writeMarker: (ticker: string, runRoot?: string) => void
  // remove the defer-module-memos marker (best-effort). Called on every failure path so a crashed chain
  // never leaves an orphaned marker that would make a later same-day standalone module run defer-and-DROP
  // its memo (the success path's marker removal is done by the master step, rerun.md Step 9B).
  clearMarker: (ticker: string, runRoot?: string) => void
  // schedule a re-pump after a transient 429 capacity rejection (default: setTimeout; tests fire it directly).
  scheduleRetry: (fn: () => void) => void
  // One stable bare-pool claim for the WHOLE chain, including child-transition and capacity-backoff gaps.
  // Optional so existing deterministic fake deps remain source-compatible; production always provides it.
  acquirePoolClaim?: (ticker: string) => () => void
  // Test seam for malformed discovered DAGs. Production always uses buildSwarmGraph(); keeping graph
  // discovery injectable lets CI prove that a downstream cycle fails closed after an acyclic prefix.
  buildGraph?: () => ReturnType<typeof buildSwarmGraph>
  /** Durable recovery record for a scheduler rejection that happens after the logical chain already
   * started but before a later provider RunState can exist. Tests capture this instead of touching disk. */
  recordInterruption?: (input: FullChainSchedulerInterruption) => void
}

export interface FullChainSchedulerInterruption {
  ticker: string
  runRoot: string
  chainId: string
  user: string
  userVia: 'cf-access' | 'local'
  selection: RunProviderSelection
  step: 'module' | 'master'
  module?: string
  message: string
}

function recordFullChainSchedulerInterruption(input: FullChainSchedulerInterruption): void {
  const profile = getProviderAdapter(input.selection.provider).resolveProfile({
    model: input.selection.model,
    reasoningLevel: input.selection.reasoningLevel,
    profileKey: input.selection.expectedProfileKey,
  })
  const runId = randomUUID()
  const reason = input.step === 'master' ? 'terminal_launch_rejected' : 'module_launch_rejected'
  writeRunMarker(input.runRoot, '.interrupted', {
    reason,
    message: redactSecrets(input.message).slice(-2000),
    module: input.module,
    provider: profile.provider,
    profileKey: profile.profileKey,
    model: profile.model,
    reasoningLevel: profile.reasoningLevel,
    executionEpoch: input.chainId,
    runId,
    attemptId: runId,
    startedAt: Date.now(),
  })
  recordProviderInterruptionAuthority({
    runId,
    providerAttemptId: runId,
    runRoot: input.runRoot,
    provider: profile.provider,
    model: profile.model,
    reasoningLevel: profile.reasoningLevel,
    profileKey: profile.profileKey,
    executionProfile: profile.executionProfile,
  })
  const common = {
    runId,
    user: input.user,
    userVia: input.userVia,
    kind: input.step === 'master' ? 'rerun' as const : 'module' as const,
    ticker: input.ticker,
    swarm: RESEARCH_SWARM_ID,
    chained: true,
    chainId: input.chainId,
    executionEpoch: input.chainId,
    runRoot: input.runRoot,
    module: input.step === 'master' ? 'master' : input.module,
    agent: input.step === 'master' ? 'synthesizer' : undefined,
    provider: profile.provider,
    executionProfile: profile.executionProfile,
    profileKey: profile.profileKey,
    model: profile.model,
    reasoningLevel: profile.reasoningLevel,
  }
  logLaunch(common)
  logFinish({
    ...common,
    status: 'error',
    costUsd: 0,
    durationMs: 0,
    numTurns: 0,
    note: `Waiting for automatic exact-root recovery: ${redactSecrets(input.message).slice(-500)}`,
  })
}
const defaultFullChainDeps: FullChainDeps = {
  launchAndWire: async (params, onFinish) => {
    const out = await launch(params)
    const run = getRun(out.runId)
    // chained is now passed via params (set on the RunState pre-spawn so the launched-event log is
    // correct); re-assert it here for the fake-launcher test path, and wire onFinish (not a param).
    // A provider can fail between createRun()/spawn and launch() returning (for example a fast Codex
    // bootstrap SIGTERM). In that race finishRun() has already passed the callback site, so merely storing
    // onFinish would strand the invisible full-chain reservation forever: no active RunState, no Activity
    // row in "Now", and the production deploy barrier pinned by an owner that can never advance. Replay the
    // terminal status when launch() returns an already-finished child. The replay is deferred one event-loop
    // turn so launchFullChained records the launch ACK/firstRunId before the callback can pump another wave.
    wireChainedRunFinish(run, onFinish)
    return { runId: out.runId, preflight: out.preflight }
  },
  writeMarker: (ticker, requestedRunRoot) => {
    const runRoot = requestedRunRoot ?? defaultResearchRunRoot(ticker)
    const p = deferMarkerPath(ticker, runRoot)
    // Both markers are correctness-critical: .defer_module_memos routes the master through the chained-full
    // audit/publication branch, while the publication marker prevents close-time success until it freezes.
    // If either cannot be recorded, refuse to start a chain that could later be mistaken for complete.
    fs.mkdirSync(path.join(REPO_ROOT, runRoot), { recursive: true })
    try {
      writeSupervisorRunFile(runRoot, '.defer_module_memos', '')
      markIdeaPublicationRequired(runRoot)
    } catch (error) {
      try { fs.rmSync(p, { force: true }) } catch { /* best-effort rollback of the routing marker */ }
      throw error
    }
  },
  clearMarker: (ticker, runRoot) => {
    try { fs.rmSync(deferMarkerPath(ticker, runRoot), { force: true }) } catch { /* best-effort */ }
  },
  scheduleRetry: (fn) => { setTimeout(fn, CAPACITY_RETRY_MS) },
  acquirePoolClaim: (ticker) => acquireSharedDataPoolClaim(RESEARCH_SWARM_ID, ticker, 'full'),
  recordInterruption: recordFullChainSchedulerInterruption,
}

/** Attach the full-chain terminal callback without losing a fast provider exit that happened before the
 * launch acknowledgement returned. Exported only so the zero-spend regression test can pin this race. */
export function wireChainedRunFinish(
  run: Pick<RunState, 'chained' | 'endedAt' | 'finishLogged' | 'onFinish' | 'status'> | undefined,
  onFinish: (status: RunStatus) => void,
): void {
  const replay = (status: RunStatus) => {
    // launchAndWire's promise must settle before the terminal callback advances the DAG. In particular, a
    // synchronously replayed first child could launch a second wave whose immediate 429 was misclassified as
    // a pre-first-launch failure because launchFullChained had not recorded firstRunId yet.
    setImmediate(() => {
      try { onFinish(status) } catch { /* match finishRun's terminal-hook isolation */ }
    })
  }
  if (!run) {
    replay('error')
    return
  }
  run.chained = true
  if (run.endedAt !== undefined || run.finishLogged) {
    replay(run.status)
    return
  }
  run.onFinish = onFinish
}
// A resume runs only the modules NOT already on disk (+ the master). Price and time-estimate just that
// remaining work, not the whole pipeline — otherwise a resume that skips 4 of 6 modules still shows the
// full "~$90 / ~150 min", which reads as "it's redoing everything" even though it isn't. Scaled from the
// calibrated full-run band by the fraction of agents left to run (an honest "~" band, not false precision).
export interface RunProviderSelection {
  provider: RunProvider
  model?: string
  reasoningLevel?: string
  expectedProfileKey?: string
}

interface FullChainScope {
  /** Exact supervisor-validated root. Ordinary full runs omit this and use analyses/<TICKER>_<today>. */
  runRoot?: string
  /** Frozen canaries use per-module loaders, then one terminal full-canary adjudicator. */
  parityCanary?: { runRoot: string; freezeReceipt: string }
  /** Operator-authorized same-root recovery seeds completed modules even when raw terminal files exist. */
  continuation?: boolean
  /** Exact fresh-Full pre-spend retry. The stable request id also becomes the chain/execution epoch so
   * Activity and crash reconciliation expose one durable intent instead of unrelated retry identities. */
  technicalReadinessRetry?: boolean
  recoveryRequestId?: string
  preparedRunPlanTransaction?: PreparedRunPlanTransaction
  preSpendRetryAuthority?: PreSpendRetryAuthority
}

export function chainedResumePreflight(
  ticker: string,
  plannedModules: string[],
  selection: RunProviderSelection,
  swarmId: string = RESEARCH_SWARM_ID,
): LaunchPreflight {
  // Swarm-aware so the "complete the thesis" panel prices a non-research subject against ITS OWN graph
  // (agent counts and full-run band), not the research one. Research callers pass nothing and are unchanged.
  const g = buildSwarmGraph(swarmId)
  const agentCountOf = new Map(g.modules.map((m) => [m.name, m.agentCount]))
  const totalAgents = g.totals.agents + 1 // + master
  const plannedAgents = plannedModules.reduce((s, n) => s + (agentCountOf.get(n) ?? 0), 0) + 1 // + master
  const full = estimate(
    'full', ticker, selection.provider, undefined, undefined,
    swarmId === RESEARCH_SWARM_ID ? undefined : swarmId,
    selection.model, selection.reasoningLevel, selection.expectedProfileKey,
  )
  return {
    ...full,
    agentCount: plannedAgents,
    // A subset of a full run has different dependency overlap. Scaling one old full-run bill by orb count
    // was invented precision, so only an actual full-sized plan may inherit the comparable full-run range.
    ...(plannedAgents === totalAgents
      ? {}
      : {
          estCostUsdRange: [0, 0] as [number, number],
          estMinutesRange: [0, 0] as [number, number],
          estimateEvidence: {
            source: 'unavailable' as const,
            provider: full.provider,
            profileKey: full.profileKey,
            durationSampleSize: 0,
            costSampleSize: 0,
          },
        }),
  }
}

/** Provider commands reuse valid specialist files already present inside a module even when no synthesis
 * exists yet. Therefore `done.size` alone is not a safe generation-reuse signal. Any pre-existing entry in
 * a discovered module directory makes the launch receipt-bound; a fresh Full with only supervisor markers
 * or `_pool_extracts` remains free to create a new generation. */
function researchRunRootMayReuseProviderWork(runRoot: string, moduleNames: readonly string[]): boolean {
  const root = path.resolve(REPO_ROOT, runRoot)
  for (const moduleName of moduleNames) {
    const moduleRoot = path.join(root, moduleName)
    try {
      const stat = fs.lstatSync(moduleRoot)
      if (!stat.isDirectory() || stat.isSymbolicLink()) return true
      if (fs.readdirSync(moduleRoot).length > 0) return true
    } catch (error: any) {
      if (error?.code !== 'ENOENT') return true
    }
  }
  return false
}

export async function launchFullChained(
  ticker: string,
  user: string,
  userVia: 'cf-access' | 'local',
  selection: RunProviderSelection,
  deps: FullChainDeps = defaultFullChainDeps,
  decisionBinding?: { decisionRunRoot: string; decisionFingerprint: string },
  memoryIdentity?: ResearchMemoryIdentity,
  scope: FullChainScope = {},
): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean; skipped?: string[]; planned?: string[]; resumed?: boolean }> {
  const chainId = scope.recoveryRequestId ?? scope.preSpendRetryAuthority?.recoveryRequestId ?? randomUUID()
  const datedRoot = scope.runRoot ?? defaultResearchRunRoot(ticker)
  if (isSealedResearchRun(datedRoot)) throw sealedResearchRunError(datedRoot)
  const g = deps.buildGraph?.() ?? buildSwarmGraph()
  const names = g.modules.map((m) => m.name)
  const synthesisFiles = new Map(g.modules.map((m) => [
    m.name,
    Object.values(m.layers).flat()
      .filter((agent) => agent.isSynthesis)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  ]))
  const failFastTriageFiles = new Map(g.modules.map((m) => [
    m.name,
    Object.values(m.layers).flat()
      .filter((agent) => agent.nn === '00' && agent.failFast)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  ]))
  const known = new Set(names)
  const depsOf = new Map(g.modules.map((m) => [m.name, m.dependsOn.filter((d) => known.has(d))]))
  const total = names.length
  const chainModules = names.map((name) => ({
    module: name,
    dependsOn: [...(depsOf.get(name) ?? [])].sort(),
    synthesisOutputs: (synthesisFiles.get(name) ?? []).map((file) => `${name}/${file}`).sort(),
  }))
  // Acquire after all read-only graph construction but BEFORE the first marker/filesystem mutation. The
  // subject token and pool claim live until master terminal or abort; child ACKs/finishes never release them.
  const releaseSubjectChain = acquireSubjectChainReservation(ticker, RESEARCH_SWARM_ID)
  let releasePool: () => void
  try {
    releasePool = deps.acquirePoolClaim?.(ticker) ?? (() => {})
  } catch (error) {
    releaseSubjectChain()
    throw error
  }
  let poolReleased = false
  // Assigned once the scheduler owns its in-flight set. A sibling can fail while another same-wave child
  // is still building its provider launch. Never drop the chain's frozen receipt/leases until every such
  // child reaches its terminal callback; otherwise that sibling can lose its frozen env and reopen Drive.
  let chainHasActiveChildren = () => false
  const releaseChainPool = () => {
    if (poolReleased) return
    if (chainHasActiveChildren()) return
    poolReleased = true
    const releaseAfterReadiness = () => {
      try { releasePool() } finally {
      // The readiness receipt is chain-scoped, not process-global cache state. Release waiters and drop it
      // exactly when the logical chain releases its own reservation, on every success/failure/cancel path.
        clearChainedReadiness(chainId)
        releaseSubjectChain()
      }
    }
    if (chainedReadinessAssessmentActive(chainId)) {
      // An admission/sibling can fail while the elected owner is still extracting. Keep every chain/pool/
      // deploy lease until that detached process group has been aborted and proven extinct.
      void abortChainedReadiness(chainId).then(releaseAfterReadiness, (error) => {
        console.error(`[readiness] chain ${chainId} assessment failed while draining: ${String((error as any)?.message || error)}`) // eslint-disable-line no-console
        releaseAfterReadiness() // the rejected assessment has already drained its process group
      })
      return
    }
    releaseAfterReadiness()
  }
  const logicalCanary: ParityCanaryChainStatus | null = scope.parityCanary ? {
    chainId,
    runRoot: datedRoot,
    runId: null,
    provider: selection.provider,
    profileKey: selection.expectedProfileKey ?? null,
    status: 'starting',
    startedAt: Date.now(),
    endedAt: null,
    message: null,
  } : null
  if (logicalCanary) parityCanaryChainsByRoot.set(datedRoot, logicalCanary)
  const markLogicalRunning = (runId?: string) => {
    if (!logicalCanary || logicalCanary.endedAt !== null) return
    if (runId) logicalCanary.runId = runId
    logicalCanary.status = 'running'
  }
  const finishLogicalCanary = (status: RunStatus, message: string) => {
    if (!logicalCanary || logicalCanary.endedAt !== null) return
    logicalCanary.status = status === 'done' || status === 'cancelled' || status === 'incomplete'
      ? status : 'error'
    logicalCanary.endedAt = Date.now()
    logicalCanary.message = message
  }

  // From this point onward the chain owns both the subject reservation and the shared provider-deploy
  // lease. Setup can still fail before launchAndWire creates a RunState (for example while freezing an
  // invalid provider profile). Such a failure has no child completion callback and therefore no Activity
  // row to release the leases. Keep one outer rollback boundary around setup + first launch ACK so every
  // pre-child exception restores the marker and both reservations. The cleanup operations are idempotent;
  // asynchronous child/master terminal paths remain the ordinary owners after this function returns.
  try {
  await scope.preparedRunPlanTransaction?.activate()
  const recoveredIntent = scope.preparedRunPlanTransaction?.recoveredChainIntent
  // Activation may atomically replace the target root with a privately prepared copy, so both reusable-
  // output detection and immutable-generation verification must happen after it. A Continue is always
  // reuse-only even if its saved root currently has no finished synthesis; an ordinary Full becomes
  // reuse-only whenever any specialist/module byte could be consumed by the provider command. A recovered
  // paid chain always keeps its original receipt too: its first child may have crossed the spawn boundary
  // and crashed before writing one byte, which is still not authority to re-read today's Drive.
  // A privately prepared completion target is a newly admitted generation even when the transaction
  // carried whole finished modules into it. Its first missing child must freeze today's reviewed pool;
  // requiring a receipt for the not-yet-published target would make every legacy migration fail before
  // spend. Exact Continue and any chain that already crossed the paid boundary still load their retained
  // receipt and can never re-open live Drive data.
  const preparedFreshGeneration = scope.preparedRunPlanTransaction !== undefined
    && scope.continuation !== true
    && recoveredIntent === undefined
  const requireExistingFrozenPoolReceipt = recoveredIntent !== undefined
    || scope.continuation === true
    || (!preparedFreshGeneration && researchRunRootMayReuseProviderWork(datedRoot, names))
  // Drop a marker in the shared run root so each per-module run SKIPS its inline memo (MODULE_PIPELINE
  // Step 4.9A); the master step regenerates all module memos in ONE batch at the end (rerun.md Step 9B)
  // and removes the marker. Keeps the ~2.5-min-per-module memo off the parallel critical path —
  // output-neutral, only the memo's timing moves. Injected so the test asserts it without touching disk.
  try {
    deps.writeMarker(ticker, datedRoot)
  } catch (error) {
    finishLogicalCanary('error', `The canary could not establish its supervisor markers: ${String((error as any)?.message || error)}`)
    releaseChainPool()
    throw error
  }

  const done = new Set<string>()
  const started = new Set<string>()
  const inflight = new Set<string>()
  chainHasActiveChildren = () => inflight.size > 0
  // RESUME (forever-living): if today's run folder already holds finished modules from a prior attempt
  // that broke (a plan-limit pause, a dropped connection, a reboot), seed them as done so this relaunch
  // CONTINUES from where it stopped instead of redoing the whole pipeline. A first run finds nothing here;
  // a complete folder is left alone (this is then a fresh full, not a resume). A module is finished only
  // when its CURRENT discovered synthesis passes the same mechanical validator used by exact planning.
  const resumeRoot = datedRoot
  if (recoveredIntent) {
    if (!isDeepStrictEqual(recoveredIntent.modules, chainModules)) {
      throw new Error('recoverable full-chain module roster changed; refusing to widen or rebuild its scope')
    }
    const resolved = getProviderAdapter(selection.provider).resolveProfile({
      model: selection.model,
      reasoningLevel: selection.reasoningLevel,
      profileKey: selection.expectedProfileKey,
    })
    if (!isDeepStrictEqual(recoveredIntent.selection, {
      provider: resolved.provider,
      model: resolved.model,
      reasoningLevel: resolved.reasoningLevel ?? null,
      profileKey: resolved.profileKey,
      executionProfile: resolved.executionProfile,
    })) {
      throw new Error('recoverable full-chain provider profile changed')
    }
    const completedByModule = new Map(recoveredIntent.completed.map((entry) => [entry.module, entry]))
    const rootAbs = path.resolve(REPO_ROOT, resumeRoot)
    for (const name of names) {
      const sealed = completedByModule.get(name)
      if (sealed) {
        for (const artifact of sealed.artifacts) {
          const absolute = path.resolve(rootAbs, artifact.outputRel)
          if (!absolute.startsWith(`${rootAbs}${path.sep}`)
              || !validateAgentOutputFile(absolute).valid
              || `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}` !== artifact.sha256) {
            throw new Error(`recoverable full-chain completed evidence changed for ${name}`)
          }
        }
        done.add(name)
        started.add(name)
        continue
      }
      // A provider can be killed after writing a syntactically valid synthesis but before its terminal
      // callback/lineage receipt. It is partial work, not a completed module. Remove only the unsealed
      // synthesis so the exact same module must adjudicate its retained specialist outputs again.
      for (const file of synthesisFiles.get(name) ?? []) {
        fs.rmSync(path.join(rootAbs, name, file), { force: true })
      }
    }
    // A killed terminal master can likewise leave plausible-looking root artifacts without publication
    // authority. Recovery owns the exact completed modules, never those unsealed terminal bytes.
    for (const artifact of ROOT_ARTIFACTS_FULL) fs.rmSync(path.join(rootAbs, artifact), { force: true })
  }
  if (fs.existsSync(path.join(REPO_ROOT, resumeRoot))
      && (recoveredIntent || scope.continuation === true || !finalDeliverablesPresent(resumeRoot))) {
    for (const name of names) {
      if (recoveredIntent) continue
      try {
        const finished = validModuleOutcomeFiles(
          path.join(REPO_ROOT, resumeRoot, name),
          synthesisFiles.get(name) ?? [],
          failFastTriageFiles.get(name) ?? [],
        ).length > 0
        if (finished) { done.add(name); started.add(name) }
      } catch { /* this module isn't finished yet */ }
    }
    // Preserve the sealed technical-preflight marker until a real child advances provider authority. It is
    // the only crash-recovery proof in the scheduler-before-first-child window. Live-subject admission
    // prevents a duplicate in-process dispatch, and spawned authority makes the old marker ineligible.
    if (!scope.technicalReadinessRetry) clearRunMarker(resumeRoot, '.interrupted')
    clearRunMarker(resumeRoot, '.aborted')
    resetForRelaunch(resumeRoot) // Findings 6/8: reset the single-shot dedup AND drop any stale RUN_FAILURE.md
    // eslint-disable-next-line no-console
    if (done.size) console.log(`[full-chain] ${ticker}: resuming — ${done.size}/${total} modules already on disk, running the rest`)
  }
  const completedChainEvidence = () => [...done].sort().map((name) => {
    const moduleAbsolute = path.join(REPO_ROOT, resumeRoot, name)
    const artifacts = validModuleOutcomeFiles(
      moduleAbsolute,
      synthesisFiles.get(name) ?? [],
      failFastTriageFiles.get(name) ?? [],
    ).flatMap((file) => {
      try {
        return [{
          outputRel: `${name}/${file}`,
          sha256: `sha256:${createHash('sha256').update(fs.readFileSync(path.join(moduleAbsolute, file))).digest('hex')}`,
        }]
      } catch {
        return []
      }
    })
    if (artifacts.length === 0) {
      throw new Error(`completed chain module ${name} lost its validated terminal outcome before progress was sealed`)
    }
    return { module: name, artifacts }
  })
  if (scope.preparedRunPlanTransaction) {
    const resolved = getProviderAdapter(selection.provider).resolveProfile({
      model: selection.model,
      reasoningLevel: selection.reasoningLevel,
      profileKey: selection.expectedProfileKey,
    })
    const initialNext = names.filter((name) => !done.has(name)
      && (depsOf.get(name) ?? []).every((dependency) => done.has(dependency)))
    await scope.preparedRunPlanTransaction.beginChainIntent({
      chainId,
      user,
      userVia,
      selection: {
        provider: resolved.provider,
        model: resolved.model,
        reasoningLevel: resolved.reasoningLevel ?? null,
        profileKey: resolved.profileKey,
        executionProfile: resolved.executionProfile,
      },
      modules: chainModules,
      completed: completedChainEvidence(),
      nextModules: initialNext,
    })
  }
  // Snapshot the resume split BEFORE anything runs: what's already done (skipped) vs what this relaunch
  // will actually run. `done` only holds seeded modules at this point. The cockpit uses this to show the
  // finished modules as done (not "starting") and to price/ETA only the remaining work.
  const skippedModules = [...done]
  const plannedModules = names.filter((n) => !done.has(n))
  const resumed = skippedModules.length > 0
  const preflight: LaunchPreflight = resumed
    ? chainedResumePreflight(ticker, plannedModules, selection)
    : estimate('full', ticker, selection.provider, undefined, undefined, undefined, selection.model, selection.reasoningLevel, selection.expectedProfileKey)
  let stopped = false
  let stoppedOutcome: RunStatus | null = null
  let stoppedMessage = ''
  const stoppedRetryModules = new Set<string>()
  let masterLaunched = false
  let retryScheduled = false
  // Global stop halts every chain; a subject stop halts only this ticker's scheduler.
  const chainAlive = captureChainEpoch(ticker, RESEARCH_SWARM_ID, chainId)

  let firstRunId: string | null = null
  let initialLaunchFailure: { module: string; error: unknown; message: string } | null = null
  let schedulerInterruptionRecorded = false
  let settleFirst!: (out: { runId: string; preflight: LaunchPreflight }) => void
  let rejectFirst!: (e: unknown) => void
  const firstReady = new Promise<{ runId: string; preflight: LaunchPreflight }>((res, rej) => { settleFirst = res; rejectFirst = rej })

  // modules whose every (known) upstream is done and which we have not yet started
  const readyNow = () => names.filter((n) => !started.has(n) && (depsOf.get(n) ?? []).every((d) => done.has(d)))
  const recordChainProgress = async (
    masterState: 'pending' | 'ready' | 'launching' | 'running' | 'published' | 'failed',
    nextModules: string[] = readyNow(),
  ): Promise<void> => {
    if (!scope.preparedRunPlanTransaction) return
    await scope.preparedRunPlanTransaction.recordChainProgress({
      completed: completedChainEvidence(),
      nextModules: [...new Set(nextModules)].sort(),
      inflightModules: [...inflight].filter((name) => !done.has(name)).sort(),
      masterState,
    })
  }

  const recordSchedulerInterruption = (
    step: FullChainSchedulerInterruption['step'],
    message: string,
    module?: string,
  ) => {
    if (schedulerInterruptionRecorded) return
    schedulerInterruptionRecorded = true
    try {
      deps.recordInterruption?.({
        ticker, runRoot: datedRoot, chainId, user, userVia, selection, step, module, message,
      })
    } catch (error: any) {
      // The chain still releases its live leases; the protected-state failure is explicit in server logs
      // and no provider child or fake success is created. An unsealed marker is never trusted by recovery.
      console.error(`[full-chain] ${ticker}: could not seal ${step} recovery authority: ${String(error?.message || error)}`) // eslint-disable-line no-console
    }
  }

  const launchMaster = (): Promise<{ runId: string; preflight: LaunchPreflight }> | null => {
    if (masterLaunched) return null
    masterLaunched = true
    const masterParams: LaunchParams = scope.parityCanary
      ? { kind: 'full', ticker, user, userVia, chained: true, chainId, ...selection,
        parityCanary: { ...scope.parityCanary, stage: 'final', continuation: scope.continuation === true } }
      : { kind: 'rerun', ticker, module: 'master', agent: 'synthesizer', user, userVia, chained: true,
        chainId, memoryIdentity, runRoot: datedRoot, ...selection, ...decisionBinding,
        requireExistingFrozenPoolReceipt,
        ...(scope.continuation ? { continuation: true } : {}),
        ...(scope.preparedRunPlanTransaction
          ? { preparedRunPlanTransaction: scope.preparedRunPlanTransaction } : {}),
        ...(scope.preSpendRetryAuthority
          ? { preSpendRetryAuthority: scope.preSpendRetryAuthority } : {}) }
    const launched = deps.launchAndWire(
      masterParams,
      (status) => {
        if (!scope.preparedRunPlanTransaction) {
          deps.clearMarker(ticker, datedRoot)
          releaseChainPool()
          finishLogicalCanary(status, status === 'done'
            ? 'Canary pipeline completed.' : `Canary stopped at terminal adjudication — ${status}.`)
          // eslint-disable-next-line no-console
          console.log(`[full-chain] ${ticker}: ${status === 'done' ? 'pipeline complete' : `stopped at master — ${status}`}`)
          return
        }
        void (async () => {
          try {
            if (status === 'done') {
              await recordChainProgress('published', [])
              await scope.preparedRunPlanTransaction?.recordChainTerminal('done')
            } else if (status === 'cancelled') {
              await scope.preparedRunPlanTransaction?.recordChainTerminal('cancelled')
            } else {
              await recordChainProgress('failed', [])
            }
          } catch (error: any) {
            recordSchedulerInterruption(
              'master',
              `The terminal result could not be sealed for exact recovery: ${String(error?.message || error)}`,
            )
          } finally {
            deps.clearMarker(ticker, datedRoot) // always clear the defer-memo marker once master exits — success path: rerun.md Step 9B also rm -f's it (idempotent); this is the safety net for an abnormal 'done' before Step 9B ran, or any failure
            releaseChainPool()
            finishLogicalCanary(status, status === 'done'
              ? 'Canary pipeline completed.' : `Canary stopped at terminal adjudication — ${status}.`)
            // eslint-disable-next-line no-console
            console.log(`[full-chain] ${ticker}: ${status === 'done' ? 'pipeline complete' : `stopped at master — ${status}`}`)
          }
        })()
      },
    )
    // One settled branch owns both outcomes. A success-only `.then()` plus a separate catch on the
    // original promise creates an unhandled rejected *derived* promise when launch fails.
    void launched.then(
      (out) => {
        markLogicalRunning(out.runId)
        void recordChainProgress('running', []).catch((error: any) => {
          recordSchedulerInterruption(
            'master', `The launched terminal master could not seal its recovery state: ${String(error?.message || error)}`,
          )
        })
      },
      async (e) => {
        try { await recordChainProgress('failed', []) } catch { /* rejection below remains authoritative */ }
        recordSchedulerInterruption(
          'master',
          `The terminal master could not launch after the saved modules finished: ${String((e as any)?.message || e)}`,
        )
        deps.clearMarker(ticker, datedRoot)
        releaseChainPool()
        finishLogicalCanary('error', `Canary terminal adjudicator could not launch: ${String((e as any)?.message || e)}`)
        // eslint-disable-next-line no-console
        console.error(`[full-chain] ${ticker}: failed to launch master synthesizer`, (e as any)?.message || e)
      },
    )
    return launched
  }

  const onModuleFinish = async (name: string, status: RunStatus) => {
    inflight.delete(name)
    if (scope.preparedRunPlanTransaction
        && deferredPreSpendRetryTransactions.has(scope.preparedRunPlanTransaction)) {
      stopped = true
      stoppedOutcome = 'incomplete'
      stoppedMessage = 'Waiting for an automatic pre-spend retry of this exact reviewed Full run.'
      try { deps.clearMarker(ticker, datedRoot) } catch { /* target may already be private again */ }
      releaseChainPool()
      if (inflight.size === 0) finishLogicalCanary(stoppedOutcome, stoppedMessage)
      return
    }
    if (stopped) {
      // A paid same-wave sibling may finish after another sibling already stopped future scheduling. Its
      // terminally validated synthesis is still paid, reusable work: seal the exact hashes without ever
      // pumping another wave. Otherwise restart would delete and repay for a successfully published sibling.
      if (scope.preparedRunPlanTransaction && stoppedOutcome !== 'cancelled') {
        try {
          if (status === 'done') done.add(name)
          else stoppedRetryModules.add(name)
          await recordChainProgress('pending', [...stoppedRetryModules].sort())
        } catch (error: any) {
          recordSchedulerInterruption(
            'module', `The drained ${name} result could not seal exact recovery state: ${String(error?.message || error)}`, name,
          )
        }
      }
      if (inflight.size === 0 && stoppedOutcome) {
        releaseChainPool()
        finishLogicalCanary(stoppedOutcome, stoppedMessage)
      }
      return
    }
    if (!chainAlive()) {
      stopped = true
      stoppedOutcome = 'cancelled'
      stoppedMessage = 'Canary chain was stopped by the operator.'
      deps.clearMarker(ticker, datedRoot)
      releaseChainPool()
      if (inflight.size === 0) finishLogicalCanary(stoppedOutcome, stoppedMessage)
      return
    } // stop-everything halted the chain — clear the defer-memo marker (no orphan) + launch nothing further
    if (status !== 'done') {
      if (status !== 'cancelled') stoppedRetryModules.add(name)
      if (scope.preparedRunPlanTransaction) {
        try {
          if (status === 'cancelled') await scope.preparedRunPlanTransaction.recordChainTerminal('cancelled')
          else await recordChainProgress('pending', [...stoppedRetryModules].sort())
        } catch (error: any) {
          recordSchedulerInterruption(
            'module', `The ${name} failure could not seal exact recovery state: ${String(error?.message || error)}`, name,
          )
        }
      }
      stopped = true
      stoppedOutcome = status
      stoppedMessage = `Canary stopped at module ${name} — ${status}.`
      if (logicalCanary) logicalCanary.message = `${stoppedMessage} Waiting for ${inflight.size} active sibling(s) to drain.`
      deps.clearMarker(ticker, datedRoot) // failed pipeline — don't leave an orphaned defer-memo marker
      releaseChainPool()
      if (inflight.size === 0) finishLogicalCanary(stoppedOutcome, stoppedMessage)
      // eslint-disable-next-line no-console
      console.log(`[full-chain] ${ticker}: stopped at module ${name} — ${status} (in-flight modules still finish)`)
      return
    }
    done.add(name)
    try {
      if (done.size === total) {
        // This durable `ready` receipt closes the last-module -> master registration crash window.
        if (scope.preparedRunPlanTransaction) await recordChainProgress('ready', [])
        launchMaster()
        return
      }
      // Seal exact completed hashes and the next runnable wave before a single later child is registered.
      if (scope.preparedRunPlanTransaction) await recordChainProgress('pending')
    } catch (error: any) {
      stopped = true
      stoppedOutcome = 'error'
      stoppedMessage = `Full-chain progress could not be sealed after ${name}: ${String(error?.message || error)}`
      recordSchedulerInterruption('module', stoppedMessage, name)
      deps.clearMarker(ticker, datedRoot)
      releaseChainPool()
      if (inflight.size === 0) finishLogicalCanary('error', stoppedMessage)
      return
    }
    pump()
  }

  // A transient 429 (global concurrency cap momentarily full — usually runs on OTHER tickers) is retried,
  // not fatal. At most one pending retry; when it fires, pump() re-offers every un-started ready module.
  const scheduleRetry = () => {
    if (retryScheduled || stopped) return
    retryScheduled = true
    deps.scheduleRetry(() => {
      retryScheduled = false
      if (!chainAlive()) {
        stopped = true
        stoppedOutcome = 'cancelled'
        stoppedMessage = 'Canary chain was stopped by the operator.'
        deps.clearMarker(ticker, datedRoot)
        releaseChainPool()
        if (inflight.size === 0) finishLogicalCanary(stoppedOutcome, stoppedMessage)
        return
      }
      pump()
    })
  }

  const launchModule = (name: string) => {
    started.add(name)
    inflight.add(name) // reserve the slot synchronously so the cap holds within one pump() pass
    const moduleParams: LaunchParams = {
      kind: 'module', ticker, module: name, user, userVia, chained: true, chainId, ...selection,
      memoryIdentity, runRoot: datedRoot, ...decisionBinding,
      requireExistingFrozenPoolReceipt,
      ...(scope.continuation ? { continuation: true } : {}),
      ...(scope.preparedRunPlanTransaction
        ? { preparedRunPlanTransaction: scope.preparedRunPlanTransaction } : {}),
      ...(scope.preSpendRetryAuthority
        ? { preSpendRetryAuthority: scope.preSpendRetryAuthority } : {}),
      ...(scope.parityCanary ? { parityCanary: { ...scope.parityCanary, stage: 'module' as const } } : {}),
    }
    void deps.launchAndWire(
      moduleParams,
      (status) => { void onModuleFinish(name, status) },
    )
      .then((out) => {
        markLogicalRunning(out.runId)
        if (firstRunId === null) {
          firstRunId = out.runId
          // An initial parallel sibling may have rejected one microtask before this successful ACK. That
          // rejection cannot be called "pre-child" or erase the chain: a paid child now exists. Seal the
          // rejected step against this exact root/profile, return the real live run id, and let its terminal
          // callback release the stopped scheduler after every writer drains.
          if (stopped && initialLaunchFailure) {
            recordSchedulerInterruption(
              'module', initialLaunchFailure.message, initialLaunchFailure.module,
            )
          }
          settleFirst({ runId: out.runId, preflight: out.preflight })
        }
      })
      .catch((e) => {
        inflight.delete(name)
        // A transient 429 (admission D5 capacity) is backpressure, not a failure — once the chain is underway
        // (firstRunId set). Un-reserve so readyNow() offers the module again, and retry; do NOT kill the
        // in-flight pipeline. A 429 before any module launched, or any non-capacity error, stops the chain
        // at that module (matches the old serial chain).
        const transient = (e as any)?.statusCode === 429 || (e as any)?.body?.code === 'capacity'
        if (transient && firstRunId !== null && !stopped) {
          started.delete(name)
          // eslint-disable-next-line no-console
          console.warn(`[full-chain] ${ticker}: ${name} hit the concurrency cap (429) — retrying shortly`)
          scheduleRetry()
          return
        }
        const failureMessage = `The ${name} module could not launch: ${String((e as any)?.message || e)}`
        const interruptedAfterStart = firstRunId !== null && !stopped
        if (interruptedAfterStart) {
          recordSchedulerInterruption(
            'module',
            failureMessage,
            name,
          )
        }
        if (firstRunId === null && initialLaunchFailure === null) {
          initialLaunchFailure = { module: name, error: e, message: failureMessage }
        }
        stoppedRetryModules.add(name)
        stopped = true
        stoppedOutcome = 'error'
        stoppedMessage = `Canary module ${name} could not launch: ${String((e as any)?.message || e)}`
        deps.clearMarker(ticker, datedRoot)
        releaseChainPool()
        if (inflight.size === 0) finishLogicalCanary(stoppedOutcome, stoppedMessage)
        // eslint-disable-next-line no-console
        console.error(`[full-chain] ${ticker}: failed to launch module ${name}`, (e as any)?.message || e)
        // Do not reject while an initial parallel sibling can still ACK a real provider child. If every
        // initial launch rejects, inflight reaches zero and the original failure ends the request normally.
        if (firstRunId === null && inflight.size === 0) rejectFirst(initialLaunchFailure?.error ?? e)
      })
  }

  function pump() {
    if (stopped) return
    if (!chainAlive()) {
      stopped = true
      stoppedOutcome = 'cancelled'
      stoppedMessage = 'Canary chain was stopped by the operator.'
      deps.clearMarker(ticker, datedRoot)
      releaseChainPool()
      if (inflight.size === 0) finishLogicalCanary(stoppedOutcome, stoppedMessage)
      return
    }
    const ready = readyNow()
    for (const name of ready) {
      if (inflight.size >= MAX_CONCURRENT_RUNS) break
      launchModule(name)
    }
    // A cycle can be hidden behind an acyclic prefix: the first module launches normally, then the
    // remaining graph becomes impossible once that prefix drains. The old startup-only check never saw
    // this state, leaving the subject reservation and defer marker pinned forever. Capacity backoff is
    // not confused with a cycle: a rejected 429 has a scheduled retry, while an admitted wave still has
    // at least one in-flight child.
    if (started.size > 0 && done.size < total && inflight.size === 0 && ready.length === 0 && !retryScheduled) {
      const unresolved = names.filter((name) => !done.has(name))
      stopped = true
      stoppedOutcome = 'error'
      stoppedMessage = `Canary dependency graph stalled with no runnable module: ${unresolved.join(', ')}.`
      deps.clearMarker(ticker, datedRoot)
      releaseChainPool()
      finishLogicalCanary(stoppedOutcome, stoppedMessage)
      // eslint-disable-next-line no-console
      console.error(`[full-chain] ${ticker}: no runnable module remains (depends_on cycle?): ${unresolved.join(', ')}`)
      if (firstRunId === null) rejectFirst(new Error(`[full-chain] ${ticker}: no runnable module remains`))
    }
  }

  // No modules to run — either an empty graph, or a resume where every module was already finished and
  // only the master synthesis remains. Launch the master directly (firstReady would never resolve here).
  if (total === 0 || done.size === total) {
    const master = launchMaster()
    if (!master) { releaseChainPool(); throw new Error(`[full-chain] ${ticker}: master launch was already claimed`) }
    // Wait only for the launch ACK, not terminal completion. Besides returning a real runId, this keeps
    // launch()'s pending shared-pool reservation held until the direct-resume master has registered its
    // RunState; returning the historical empty id here reopened a zero-owner cross-swarm race.
    try {
      const first = await master
      return { runId: first.runId, preflight, chained: true, skipped: skippedModules, planned: plannedModules, resumed }
    } catch (error) {
      releaseChainPool()
      throw error
    }
  }
  pump()
  // business-model has no deps, so something is always runnable; if not, the graph has a cycle — fail loud
  // rather than hang on the firstReady promise below.
  if (started.size === 0) {
    deps.clearMarker(ticker, datedRoot)
    releaseChainPool()
    finishLogicalCanary('error', 'Canary graph has no runnable module at start.')
    throw new Error(`[full-chain] ${ticker}: no module is runnable at start (depends_on cycle?)`)
  }
  // `chained: true` -> the cockpit live-follows the WHOLE pipeline (each module + master), celebrating only
  // when the master finishes — not after each module.
  const first = await firstReady
  return { runId: first.runId, preflight, chained: true, skipped: skippedModules, planned: plannedModules, resumed }
  } catch (error) {
    try { await scope.preparedRunPlanTransaction?.rollbackIfUnstarted('full-chain setup or first child failed') } catch {}
    try { deps.clearMarker(ticker, datedRoot) } catch { /* preserve the launch error */ }
    try { releaseChainPool() } catch { /* subject release still runs in releaseChainPool's finally */ }
    finishLogicalCanary(
      'error',
      `Canary chain setup or first launch failed: ${String((error as any)?.message || error)}`,
    )
    throw error
  }
}

/** Stop EVERYTHING: halt every full-run chain, then cancel every in-flight run (running,
 *  starting, readiness-checking, or paused at the readiness gate). Returns the cancelled ids. */
export async function cancelAll(): Promise<string[]> {
  stopAllChainScheduling()
  const active = listRuns().filter((run) => run.endedAt === undefined && !run.cancelRequested)
  for (const run of active) if (run.chained) haltChain(run.chainId)
  const cancelled: string[] = []
  for (const r of active) {
    try {
      if (await cancel(r.runId)) cancelled.push(r.runId)
    } catch {
      // keep stopping the rest — one stuck run must not shield the others
    }
  }
  releaseAllSubjectChainReservations()
  return cancelled
}

/** Stop ONE subject's in-flight work — a chained full run plus whatever module step is live for it.
 *  The run panel's Cancel needs this: a chained full launches each module under a NEW runId as it
 *  advances, so the runId the panel is following may already have ended by the time the user clicks,
 *  and a plain /cancel on that stale id would 404 while the next module keeps spending. Halting the
 *  chain (so no queued module launches) + cancelling every in-flight run for the subject stops it for
 *  real. Only this subject's runs are touched; other subjects keep running. Returns the cancelled ids. */
export async function cancelSubject(subjectId: string, swarmId = 'research'): Promise<string[]> {
  // Stop scheduling synchronously, but retain the subject/deploy reservation until every readiness/provider
  // writer has drained. `cancel()` releases it only after that proof.
  stopSubjectChainScheduling(subjectId, swarmId)
  const cancelled: string[] = []
  const stopping: RunState[] = []
  for (const r of subjectRunsAwaitingExit(subjectId, swarmId)) {
    if (r.chained) haltChain(r.chainId)
    stopping.push(r) // hold the RunState — cancel() drops it from the in-flight set, so we can't re-find it after
    try {
      if (await cancel(r.runId)) cancelled.push(r.runId)
    } catch {
      // keep stopping the rest — one stuck run must not shield the others
    }
  }
  // cancel() only SIGTERMs and returns BEFORE the child dies, yet the run has already left the in-flight set —
  // so a relaunch admitted immediately after (a Stop→Continue on the same subject) could start a SECOND engine
  // writing the SAME run dir while the first is still flushing. Wait for the killed children to actually exit
  // before returning, so the next launch admits onto a clean subject. A bounded wait that cannot prove exit
  // is an error, not a successful cancellation: returning 200 would let Stop -> run again start a second
  // writer on the same run root. This mirrors the force-launch guard on the explicit-cancel path.
  await requireSubjectRunsExited(subjectId, stopping)
  finalizeConfirmedSubjectCancellation(stopping)
  releaseSubjectChainReservation(subjectId, swarmId)
  return cancelled
}

/** Force is an explicit replacement of every writer on one subject. Keep the kill/drain/finalize
 * protocol in one provider-neutral helper so monolithic and default chained full launches cannot drift. */
async function stopSubjectForForce(subjectId: string, swarmId: string): Promise<void> {
  const activeChainWithoutChild = subjectChainActive(subjectId, swarmId)
    && subjectRunsAwaitingExit(subjectId, swarmId).length === 0
  // This also closes a chained scheduler's between-child admission gap. The token-bound release in the
  // old scheduler cannot clear a newer reservation when its final callback eventually drains.
  stopSubjectChainScheduling(subjectId, swarmId)
  const stopping = subjectRunsAwaitingExit(subjectId, swarmId)
  for (const run of stopping) if (run.chained) haltChain(run.chainId)
  if (activeChainWithoutChild) {
    // No RunState exists to drain, so the old scheduler still owns a pending retry/launch callback which
    // may clear the shared defer marker. Stop it, but do not admit a replacement into that callback race;
    // its bounded callback observes the halted epoch and cleans up, after which one retry is safe.
    releaseSubjectChainReservation(subjectId, swarmId)
    throw Object.assign(
      new Error(`The old full-run chain on ${subjectId} is between stages and is stopping. Try again shortly.`),
      { statusCode: 409 },
    )
  }
  for (const run of stopping) {
    try { await cancel(run.runId) } catch { /* keep stopping the rest */ }
  }
  if (!(await awaitRunsExited(stopping))) {
    throw Object.assign(
      new Error(
        `Could not stop the run(s) holding the lock on ${subjectId} — still alive after ${FORCE_STOP_WAIT_MS}ms. Try again shortly.`,
      ),
      { statusCode: 409 },
    )
  }
  finalizeConfirmedSubjectCancellation(stopping)
}

type LaunchResult = {
  runId: string
  preflight: LaunchPreflight
  chained?: boolean
  skipped?: string[]
  planned?: string[]
  resumed?: boolean
}

/** Register prepared-root ownership synchronously, before provider availability or any other await. The
 * wrapper also owns every throw before a RunState exists, so one rejected same-wave child releases only
 * its own attempt and can never roll back a sibling that is still admitting or already spawning. */
export async function launch(params: LaunchParams): Promise<LaunchResult> {
  const transaction = params.preparedRunPlanTransaction
  const attemptId = transaction ? (params.preparedRunPlanAttemptId || randomUUID()) : undefined
  if (transaction && attemptId) transaction.registerPaidChildAttempt(attemptId)
  try {
    const result = await launchRegistered(transaction && attemptId
      ? { ...params, preparedRunPlanAttemptId: attemptId }
      : params)
    if (transaction && attemptId && result.chained) {
      // The outer Full call delegated ownership to real module/master children and has no provider child
      // of its own. Release its setup attempt after the first child ACK. If that child already proved it
      // never started, this becomes the last release and atomically restores the prior target.
      await transaction.rollbackIfUnstarted('full-chain scheduler delegated to its paid children', attemptId)
    }
    return result
  } catch (error) {
    if (transaction && attemptId) {
      const authority = params.preSpendRetryAuthority
      const unavailable = (error as any)?.statusCode === 503
        || ['PROVIDER_DISABLED', 'PROVIDER_UNAVAILABLE', 'CLAUDE_CLI_MISSING']
          .includes(String((error as any)?.code || ''))
      let deferred = false
      if (authority && unavailable) {
        try {
          deferred = await deferPreparedPreSpendRetry(
            transaction, authority, 'provider_unavailable_before_spend',
          )
        } catch { /* fall through to the ordinary rollback below */ }
      }
      if (!deferred) {
        try {
          await transaction.rollbackIfUnstarted(
            `launch failed before provider start: ${String((error as any)?.message || error)}`,
            attemptId,
          )
        } catch { /* preserve the authoritative launch failure */ }
      } else if (error && typeof error === 'object') {
        Object.assign(error as object, {
          preSpendRetryDeferred: true,
          preSpendRetryRequestId: transaction.requestId,
        })
      }
    }
    throw error
  }
}

async function launchRegistered(params: LaunchParams): Promise<LaunchResult> {
  const { kind, module, agent, window } = params
  if (params.signalDate !== undefined && (kind !== 'signal' || params.ticker !== undefined
      || !isValidCalendarISODate(params.signalDate))) {
    throw Object.assign(new Error('A frozen signal date is valid only for a new signal launch.'), { statusCode: 400 })
  }
  const profile = getProviderAdapter(params.provider).resolveProfile({
    model: params.model,
    reasoningLevel: params.reasoningLevel,
    profileKey: params.expectedProfileKey,
  })
  if (params.expectedProfileKey && params.expectedProfileKey !== profile.profileKey) {
    const error: any = new Error('The selected provider profile changed after preflight. Refresh and confirm the run again.')
    error.statusCode = 409
    error.code = 'profile_changed'
    error.body = { code: 'profile_changed', expectedProfileKey: params.expectedProfileKey, profileKey: profile.profileKey }
    throw error
  }
  if (params.preSpendRetryAuthority) {
    const authority = params.preSpendRetryAuthority
    const profileMatches = authority.provider === profile.provider && authority.model === profile.model
      && authority.reasoningLevel === (profile.reasoningLevel ?? null)
      && authority.profileKey === profile.profileKey
      && isDeepStrictEqual(authority.executionProfile, profile.executionProfile)
    if (!params.preparedRunPlanTransaction || params.continuation || params.technicalReadinessRetry
        || params.parityCanary || params.parity || !['full', 'module', 'rerun'].includes(kind)
        || authority.localAttempts < 0 || !Number.isSafeInteger(authority.localAttempts)
        || !Number.isSafeInteger(authority.notBeforeMs)
        || !RECOVERY_REQUEST_ID_RE.test(authority.recoveryRequestId) || !profileMatches) {
      throw Object.assign(new Error('Pre-spend retry authority does not match this exact fresh Full plan.'), {
        statusCode: 409, code: 'pre_spend_retry_authority_changed',
      })
    }
  }
  const availabilityProofId = randomUUID()
  const user = params.user || 'local'
  const userVia = params.userVia || 'local'
  const swarmId = swarmIdFor(kind, params.swarm)
  const manifest = swarmById(swarmId)
  if (!manifest) {
    throw Object.assign(new Error(`swarm '${swarmId}' is not installed`), { statusCode: 404 })
  }
  if (params.intakeOwner && kind !== 'doc-intake') {
    throw Object.assign(new Error('An automatic intake-owner binding is valid only for doc-intake.'), { statusCode: 400 })
  }
  if (params.sharedPoolTarget && (kind !== 'handoff' || params.sharedPoolTarget.swarm !== RESEARCH_SWARM_ID
      || !normalizeDataSubject(RESEARCH_SWARM_ID, params.sharedPoolTarget.subject))) {
    throw Object.assign(new Error('A shared-pool target binding is valid only for a research handoff destination.'), { statusCode: 400 })
  }
  if (params.decisionFingerprint && SCREENER_KINDS.has(kind)) {
    throw Object.assign(new Error('A selected decision binding is not valid for screener launches.'), { statusCode: 400 })
  }
  if (params.deferModuleMemo && (swarmId !== RESEARCH_SWARM_ID || kind !== 'module')) {
    throw Object.assign(new Error('Module-memo deferral is valid only for a research module launch.'), { statusCode: 400 })
  }
  const continuationRunRoot = params.continuation
    ? exactModuleRunRootBinding(params.ticker ?? '', params.runRoot)
    : null
  const chainedRunRoot = params.chained && params.runRoot && !params.parityCanary
    ? exactModuleRunRootBinding(params.ticker ?? '', params.runRoot)
    : null
  const preparedRunRoot = params.preparedRunPlanTransaction
    ? exactModuleRunRootBinding(params.ticker ?? '', params.preparedRunPlanTransaction.preparation.targetRunRoot)
    : null
  const technicalRetryRunRoot = params.technicalReadinessRetry
    ? exactModuleRunRootBinding(params.ticker ?? '', params.runRoot)
    : null
  if (params.continuation && (swarmId !== RESEARCH_SWARM_ID
      || (kind !== 'full' && kind !== 'module' && kind !== 'rerun')
      || !continuationRunRoot)) {
    throw Object.assign(new Error('Continue requires one exact saved research run root.'), { statusCode: 400 })
  }
  if (params.chained && params.runRoot && !params.parityCanary && !chainedRunRoot) {
    throw Object.assign(new Error('A chained launch requires one exact captured research run root.'), { statusCode: 400 })
  }
  if (params.preparedRunPlanTransaction && (!preparedRunRoot
      || (continuationRunRoot && continuationRunRoot !== preparedRunRoot)
      || (chainedRunRoot && chainedRunRoot !== preparedRunRoot))) {
    throw Object.assign(new Error('Prepared run-plan root does not match this exact research launch.'), { statusCode: 400 })
  }
  if (params.recoveryRequestId !== undefined && !params.technicalReadinessRetry) {
    throw Object.assign(new Error('A recovery request id is valid only for an exact technical-readiness retry.'), { statusCode: 400 })
  }
  if (params.technicalReadinessRetry) {
    if (swarmId !== RESEARCH_SWARM_ID || kind !== 'full' || params.chained || params.continuation
        || params.preparedRunPlanTransaction || params.requireExistingFrozenPoolReceipt
        || !technicalRetryRunRoot || !params.recoveryRequestId
        || !RECOVERY_REQUEST_ID_RE.test(params.recoveryRequestId)) {
      throw Object.assign(new Error('Technical-readiness recovery requires one exact fresh-Full root and stable request id.'), { statusCode: 400 })
    }
    if (hasRunMarker(technicalRetryRunRoot, '.aborted') || isSealedResearchRun(technicalRetryRunRoot)) {
      throw Object.assign(new Error('This exact Full was cancelled or completed and cannot be recovered automatically.'), {
        statusCode: 409, code: 'recovery_authority_changed', body: { code: 'recovery_authority_changed' },
      })
    }
    const marker = readRunMarker(technicalRetryRunRoot, '.interrupted')
    const authority = readProviderInterruptionAuthority(technicalRetryRunRoot)
    const exactAuthority = authority !== null
      && marker?.reason === 'technical_readiness_failed_before_spend'
      && typeof marker.runId === 'string' && marker.runId === authority.runId
      && authority.provider === profile.provider && authority.model === profile.model
      && authority.reasoningLevel === profile.reasoningLevel && authority.profileKey === profile.profileKey
      && isDeepStrictEqual(authority.executionProfile, profile.executionProfile)
    if (!exactAuthority) {
      throw Object.assign(new Error('The saved pre-spend recovery authority changed. No provider was started.'), {
        statusCode: 409, code: 'recovery_authority_changed', body: { code: 'recovery_authority_changed' },
      })
    }
  }
  const exactModuleRunRoot = params.exactModuleResume
    ? exactModuleRunRootBinding(params.ticker ?? '', params.exactModuleRunRoot)
    : null
  if (params.exactModuleResume && (swarmId !== RESEARCH_SWARM_ID || kind !== 'module'
      || !params.preSpawnGuard || !params.terminalGuard || !exactModuleRunRoot)) {
    throw Object.assign(new Error('Exact module-resume policy requires a guarded research module launch, terminal publication proof, and its immutable run root.'), { statusCode: 400 })
  }
  const rawExactModuleInputs: unknown = params.exactModuleInputs
  const exactModuleInputs = Array.isArray(rawExactModuleInputs)
    ? [...new Set(rawExactModuleInputs.filter((name): name is string => typeof name === 'string'))].sort()
    : []
  const rawExactWritableOrbs = params.exactModuleWritableOrbs
  const rawExactSynthesisOrbs = params.exactModuleSynthesisOrbs
  // LaunchParams is typed, but launch() is also a runtime trust boundary for internal HTTP/supervisor
  // callers. Validate the container before iterating so malformed truthy values fail with our 400 below
  // instead of escaping as an unhandled "not iterable" TypeError.
  const exactModuleWritableOrbs = Array.isArray(rawExactWritableOrbs)
      && rawExactWritableOrbs.every((stem) => typeof stem === 'string')
    ? [...new Set(rawExactWritableOrbs)].sort()
    : []
  const exactModuleSynthesisOrbs = Array.isArray(rawExactSynthesisOrbs)
      && rawExactSynthesisOrbs.every((stem) => typeof stem === 'string')
    ? [...new Set(rawExactSynthesisOrbs)].sort()
    : []
  const safeExactModule = typeof module === 'string' && /^[a-z][a-z0-9-]*$/.test(module)
  const specialistStem = /^(?!99_)\d{2}_[A-Za-z0-9][A-Za-z0-9_-]*$/
  const synthesisStem = /^99_[A-Za-z0-9][A-Za-z0-9_-]*-synthesis$/
  if ((!params.exactModuleResume && exactModuleInputs.length > 0)
      || (rawExactModuleInputs !== undefined && !Array.isArray(rawExactModuleInputs))
      || (!params.exactModuleResume && params.exactModuleRunRoot !== undefined)
      || (!params.exactModuleResume && params.terminalGuard !== undefined)
      || (!params.exactModuleResume && rawExactWritableOrbs !== undefined)
      || (!params.exactModuleResume && rawExactSynthesisOrbs !== undefined)
      || (Array.isArray(rawExactModuleInputs)
        && rawExactModuleInputs.some((name) => typeof name !== 'string'
          || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(name)))) {
    throw Object.assign(new Error('Exact module-resume inputs require a guarded research module launch and safe module names.'), { statusCode: 400 })
  }
  if (params.exactModuleResume && (!safeExactModule
      || !Array.isArray(rawExactWritableOrbs) || !Array.isArray(rawExactSynthesisOrbs)
      || rawExactWritableOrbs.some((stem) => typeof stem !== 'string')
      || rawExactSynthesisOrbs.some((stem) => typeof stem !== 'string')
      || rawExactWritableOrbs.length !== exactModuleWritableOrbs.length
      || rawExactSynthesisOrbs.length !== exactModuleSynthesisOrbs.length
      || exactModuleWritableOrbs.length > 256 || exactModuleSynthesisOrbs.length < 1
      || exactModuleSynthesisOrbs.length > 16
      || exactModuleWritableOrbs.some((stem) => typeof stem !== 'string' || !specialistStem.test(stem))
      || exactModuleSynthesisOrbs.some((stem) => typeof stem !== 'string' || !synthesisStem.test(stem)))) {
    throw Object.assign(new Error('Exact module-resume artifact scope is missing or invalid.'), { statusCode: 400 })
  }
  let exactResumeBinding: { module: string; runRoot: string } | null = null
  if (params.exactModuleResume) {
    // Keep the validated exact-mode values together so every later child/run binding is typed from the
    // same fail-closed proof instead of relying on non-null assertions far past the validation boundary.
    if (typeof module !== 'string' || exactModuleRunRoot === null) {
      throw Object.assign(new Error('Exact module-resume binding is missing or invalid.'), { statusCode: 400 })
    }
    exactResumeBinding = { module, runRoot: exactModuleRunRoot }
  }
  if (params.intakeReceipt) {
    const receipt = params.intakeReceipt
    if (kind !== 'rerun' || !params.runRoot || !params.decisionFingerprint
        || !/^[A-Za-z0-9._/-]{1,500}$/.test(receipt.planPath)
        || !/^sha256:[a-f0-9]{64}$/.test(receipt.planSha256)
        || !/^sha256:[a-f0-9]{64}$/.test(receipt.sourceDecisionFingerprint)) {
      throw Object.assign(new Error('The intake receipt binding is invalid.'), { statusCode: 400 })
    }
  }

  // Fail fast before staging/mutating any run-root state if the selected engine CLI or its login is unavailable.
  const providerGateScope = params.parityCanary || kind === 'parity' ? 'provider-parity' : 'normal'
  await assertProviderAvailable(profile.provider, availabilityProofId, providerGateScope)

  // ---- resolve the SUBJECT and a CONCRETE run root (never null) so admission can compute absolute
  // write targets and the fs-watcher can bind strictly ----
  let subjectId: string
  let runRoot: string
  let pendingIntake: { path: string; body: any } | null = null
  if ((kind === 'full' || kind === 'module') && params.parityCanary) {
    const requestedRoot = params.parityCanary.runRoot
    const requestedFreeze = params.parityCanary.freezeReceipt
    if (path.isAbsolute(requestedRoot) || path.isAbsolute(requestedFreeze)
        || requestedRoot.includes('\\') || requestedFreeze.includes('\\')
        || requestedRoot.split('/').includes('..') || requestedFreeze.split('/').includes('..')) {
      throw Object.assign(new Error('parity canary paths must be repository-relative'), { statusCode: 400 })
    }
    const rootAbsolute = path.resolve(REPO_ROOT, requestedRoot)
    const freezeAbsolute = path.resolve(REPO_ROOT, requestedFreeze)
    const rootRelative = path.relative(REPO_ROOT, rootAbsolute).split(path.sep).join('/')
    const freezeRelative = path.relative(REPO_ROOT, freezeAbsolute).split(path.sep).join('/')
    if (rootRelative.split('/')[0] !== 'analyses' || !['analyses', 'screener', 'commodity', 'watchlist'].includes(freezeRelative.split('/')[0])) {
      throw Object.assign(new Error('parity canary paths are outside the research-data lane'), { statusCode: 400 })
    }
    let rootInfo: fs.Stats
    let freezeInfo: fs.Stats
    try { rootInfo = fs.lstatSync(rootAbsolute); freezeInfo = fs.lstatSync(freezeAbsolute) } catch {
      throw Object.assign(new Error('parity canary run root or freeze receipt does not exist'), { statusCode: 400 })
    }
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || fs.realpathSync(rootAbsolute) !== rootAbsolute
        || !freezeInfo.isFile() || freezeInfo.isSymbolicLink() || fs.realpathSync(freezeAbsolute) !== freezeAbsolute) {
      throw Object.assign(new Error('parity canary paths must be real non-symlink paths'), { statusCode: 400 })
    }
    let binding: any
    let freeze: any
    try {
      binding = JSON.parse(fs.readFileSync(path.join(rootAbsolute, '.provider-parity-input.json'), 'utf8'))
      freeze = JSON.parse(fs.readFileSync(freezeAbsolute, 'utf8'))
    } catch {
      throw Object.assign(new Error('parity canary binding/freeze receipt is unreadable'), { statusCode: 400 })
    }
    subjectId = String(binding.subject || '').toUpperCase()
    if (!/^[A-Z0-9.\-]{1,12}$/.test(subjectId) || params.ticker && params.ticker.toUpperCase() !== subjectId
        || binding.provider !== profile.provider || binding.expected_model !== profile.model
        || binding.expected_reasoning_level !== profile.reasoningLevel || binding.expected_profile_key !== profile.profileKey
        || resolveParityBindingPath(String(binding.run_root || '')) !== rootAbsolute
        || resolveParityBindingPath(String(binding.receipt_path || '')) !== freezeAbsolute
        || binding.receipt_sha256 !== freeze.receipt_sha256) {
      throw Object.assign(new Error('parity canary binding does not match the requested provider/profile/root'), { statusCode: 409 })
    }
    const decisionDate = String(binding.decision_date || '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(decisionDate)
        || !parityCanaryRootBasenameMatches(path.basename(rootAbsolute), subjectId, decisionDate)) {
      throw Object.assign(new Error('parity canary root basename must be <SUBJECT>_<FROZEN_DECISION_DATE> or that name plus an immutable __attempt-<id> suffix'), { statusCode: 400 })
    }
    const snapshotRoot = path.resolve(path.dirname(freezeAbsolute), String(freeze.data_snapshot?.root || ''))
    if (!paritySnapshotRootMatchesDataSubject(snapshotRoot, DATA_DIR, subjectId)) {
      throw Object.assign(new Error('equity full canary must bind the exact data/<SUBJECT> frozen snapshot'), { statusCode: 400 })
    }
    const stage = params.parityCanary.stage ?? 'chain'
    const stageMatchesKind = (stage === 'module' && kind === 'module')
      || (stage !== 'module' && kind === 'full')
    if (!stageMatchesKind) {
      throw Object.assign(new Error('parity canary stage does not match its launch kind'), { statusCode: 400 })
    }
    assertParityCanaryStageRoot(rootAbsolute, stage)
    runRoot = rootRelative
    params.parityCanary = {
      runRoot: rootRelative, freezeReceipt: freezeRelative, stage,
      continuation: params.parityCanary.continuation === true,
    }
  } else if (kind === 'parity') {
    const request = params.parity
    if (!request) {
      throw Object.assign(new Error('parity launch needs both run roots, a freeze receipt, and an output directory'), { statusCode: 400 })
    }
    const safeExistingDataPath = (value: string, label: string, expected: 'file' | 'directory'): string => {
      if (path.isAbsolute(value) || value.includes('\\') || value.split('/').includes('..')) {
        throw Object.assign(new Error(`${label} must be a repository-relative research-data path`), { statusCode: 400 })
      }
      const absolute = path.resolve(REPO_ROOT, value)
      const relative = path.relative(REPO_ROOT, absolute).split(path.sep).join('/')
      if (!['analyses', 'screener', 'commodity', 'watchlist'].includes(relative.split('/')[0])) {
        throw Object.assign(new Error(`${label} is outside the research-data lane`), { statusCode: 400 })
      }
      let info: fs.Stats
      try { info = fs.lstatSync(absolute) } catch {
        throw Object.assign(new Error(`${label} does not exist`), { statusCode: 400 })
      }
      const shapeOk = expected === 'file' ? info.isFile() : info.isDirectory()
      if (!shapeOk || info.isSymbolicLink() || fs.realpathSync(absolute) !== absolute) {
        throw Object.assign(new Error(`${label} must be an existing non-symlink ${expected}`), { statusCode: 400 })
      }
      return relative
    }
    const claudeRoot = safeExistingDataPath(request.claudeRunRoot, 'claudeRunRoot', 'directory')
    const codexRoot = safeExistingDataPath(request.codexRunRoot, 'codexRunRoot', 'directory')
    const outputDir = safeExistingDataPath(request.outputDir, 'outputDir', 'directory')
    const freezeReceipt = safeExistingDataPath(request.freezeReceipt, 'freezeReceipt', 'file')
    const selectedRoot = profile.provider === 'claude' ? claudeRoot : codexRoot
    let binding: any
    try { binding = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, selectedRoot, '.provider-parity-input.json'), 'utf8')) } catch {
      throw Object.assign(new Error('selected parity run has no readable prelaunch binding'), { statusCode: 400 })
    }
    subjectId = String(binding.subject || '')
    if (!subjectId || binding.provider !== profile.provider) {
      throw Object.assign(new Error('selected parity binding does not match the requested provider'), { statusCode: 400 })
    }
    runRoot = selectedRoot
    params.parity = { claudeRunRoot: claudeRoot, codexRunRoot: codexRoot, freezeReceipt, outputDir }
  } else if (kind === 'conviction') {
    const thesisId = params.thesisId || ''
    const checkpointId = params.checkpointId || ''
    if (!THESIS_ID_RE.test(thesisId) || !/^CHK-[a-f0-9]{8}-[0-9]{2}$/.test(checkpointId)) {
      throw Object.assign(new Error('conviction launch needs valid thesis and checkpoint ids'), { statusCode: 400 })
    }
    subjectId = `${thesisId}::${checkpointId}`
    runRoot = `screener/ledger/conviction/runs/${checkpointId}`
  } else if (kind === 'signal') {
    const date = params.signalDate ?? todayDate()
    if (params.ticker && SIG_ID_RE.test(params.ticker)) {
      // relaunch/override of an existing signal: its intake.json must already exist
      subjectId = params.ticker
      runRoot = manifest.runRootTemplate.replace(`{${manifest.placeholder}}`, subjectId)
      if (!fs.existsSync(path.join(REPO_ROOT, runRoot, 'intake.json'))) {
        throw Object.assign(new Error(`No intake.json for ${subjectId} — submit the signal form instead.`), { statusCode: 400 })
      }
      // a deliberate relaunch (manual Continue / Re-run) clears any prior user-abort marker, so the run
      // becomes live again rather than staying excluded from the resumable scan. Path rebuilt from the
      // SIG_ID_RE-validated subject id (same CWE-22 barrier as the .target / .aborted writes), not the raw path.
      try {
        const dir = screenerMarkerDir(swarmId, subjectId)
        if (dir) fs.rmSync(path.join(dir, '.aborted'), { force: true })
      } catch {
        /* best-effort */
      }
      // Human "Override & run forward": stamp override_promote onto the EXISTING intake.json (preserving
      // every other field) so the gauntlet's promotion gate reads it and pushes a signal-gate PARK/LOG past
      // the cull. Written via pendingIntake so it lands on the same materialize-before-spawn path the fresh
      // intake uses — the command re-reads intake.json when it re-evaluates the gate on the resumed run.
      if (params.overridePromote) {
        try {
          const p = path.join(REPO_ROOT, runRoot, 'intake.json')
          const cur = JSON.parse(fs.readFileSync(p, 'utf8'))
          if (cur && typeof cur === 'object' && !Array.isArray(cur) && cur.override_promote !== true) {
            pendingIntake = { path: p, body: { ...cur, override_promote: true } }
          }
        } catch {
          /* unreadable/absent intake — the existing-file check above already threw; nothing to stamp */
        }
      }
    } else {
      const intake = params.intake
      if (!intake?.headline || intake.headline.trim().length < 8) {
        throw Object.assign(new Error('signal launch needs an intake with a headline (≥ 8 chars)'), { statusCode: 400 })
      }
      subjectId = sigIdFor(intake, date)
      runRoot = manifest.runRootTemplate.replace(`{${manifest.placeholder}}`, subjectId)
      const isHuman = (intake.input_nature || '') === 'human_prompt' || (!intake.source_url && !intake.source_name)
      pendingIntake = {
        path: path.join(REPO_ROOT, runRoot, 'intake.json'),
        body: {
          signal_id: subjectId,
          input_nature: sanitizeIntakeInputNature(intake.input_nature, isHuman),
          input_datetime: new Date().toISOString(),
          headline: intake.headline.trim().slice(0, 500),
          body_text: intake.body_text || '',
          source_name: intake.source_name || '',
          source_url: intake.source_url || '',
          human_prompt_note: isHuman ? (intake.human_prompt_note || intake.headline.trim()) : (intake.human_prompt_note || ''),
          requested_by: user,
          // provenance: an Inbox-card launch records its origin so the engine's own record and the
          // sweep row's consumed mark tell the same story (§5 — no contradictory artifacts)
          from_inbox: Boolean(params.inboxId),
          sweep_ref: params.inboxId || '',
          override_promote: intake.override_promote === true,
        },
      }
    }
  } else if (kind === 'sweep') {
    subjectId = 'sweep'
    runRoot = manifest.inboxRoot || 'screener/inbox'
  } else if (kind === 'handoff') {
    const thesisId = params.thesisId || ''
    const target = (params.ticker || '').toUpperCase()
    if (!THESIS_ID_RE.test(thesisId)) throw Object.assign(new Error('handoff needs a valid thesisId'), { statusCode: 400 })
    subjectId = `${thesisId}::${target}`
    runRoot = manifest.ledgerRoot || 'screener/ledger'
  } else if (kind === 'screener-agent') {
    subjectId = params.ticker || ''
    if (!SIG_ID_RE.test(subjectId)) throw Object.assign(new Error('screener-agent needs a SIG id'), { statusCode: 400 })
    runRoot = manifest.runRootTemplate.replace(`{${manifest.placeholder}}`, subjectId)
    if (!fs.existsSync(path.join(REPO_ROOT, runRoot))) {
      throw Object.assign(new Error(`No signal run folder at ${runRoot}.`), { statusCode: 400 })
    }
  } else if (swarmId !== 'research') {
    // generic constellation swarm (e.g. commodity): the subject IS the run folder — one stable folder
    // per subject (not date-stamped), resolved from the manifest template, mirroring the screener-agent
    // branch. Reused kinds full/module/agent all write into this same folder; the slash command creates
    // it. The subject id must already be the canonical (uppercase) folder name the command will use.
    subjectId = normalizeDataSubject(swarmId, params.ticker) || ''
    if (!subjectId) throw Object.assign(new Error('This swarm received an invalid subject id.'), { statusCode: 400 })
    const resolved = resolveManifestRunRoot(swarmId, subjectId, {
      mustExist: kind === 'rerun' || kind === 'doc-intake' || kind === 'review',
      requestedRunRoot: params.runRoot,
    })
    if (!resolved) throw Object.assign(new Error('The swarm run-root contract is unsafe or does not match this subject.'), { statusCode: 400 })
    runRoot = resolved.relative
    // A rerun refreshes an EXISTING dossier — never create one. Fail fast before spawning the paid CLI
    // if the subject has no run folder yet (mirrors the research rerun guard).
    if ((kind === 'rerun' || kind === 'doc-intake' || kind === 'review') && !fs.existsSync(path.join(REPO_ROOT, runRoot))) {
      throw Object.assign(new Error(`No existing run to re-run for ${subjectId}. Run the full pipeline first.`), { statusCode: 400 })
    }
  } else {
    // research kinds — unchanged behavior
    const ticker = params.ticker || ''
    subjectId = ticker
    assertNoModulePublicationInFlight(swarmId, subjectId)
    // Force owns the explicit stop/drain protocol below, so an existing chain must not reject it before
    // that protocol can run. Every non-force launch keeps the ordinary fail-fast subject-chain guard.
    assertNoForeignSubjectChain(swarmId, subjectId, params.chained || params.force)
    // Full/Continue always runs as a chain of per-module runs + master (each with its own budget).
    const datedRoot = technicalRetryRunRoot ?? continuationRunRoot ?? preparedRunRoot ?? chainedRunRoot
      ?? `analyses/${ticker}_${todayDate()}`
    // Full has exactly two outcomes here: an immutable completed root is rejected before any launch, or
    // the request enters the chained scheduler. There is deliberately no fallthrough to the legacy
    // monolithic /research:full provider path — not for host flags, same-day sealed roots, or Continue.
    if (kind === 'full') {
      if (isSealedResearchRun(datedRoot)) throw sealedResearchRunError(datedRoot)
      // launchFullChained writes its defer-memo marker before scheduling the first module. Validate the
      // selected-call CAS AND reserve the shared data-pool label first so even that benign scheduler
      // mutation cannot be authorized by a stale confirmation or race a first commodity run on the same
      // label. Every child module validates the same ownership/binding again in its own launch().
      const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, ticker, kind)
      try {
        assertLaunchBindingsStillCurrent(swarmId, ticker, params)
        assertNoModulePublicationInFlight(swarmId, ticker)
        if (params.force) {
          // This path returns before ordinary admission below, so it must perform the same force
          // cancellation itself. Do it before the scheduler writes either chain marker.
          reapAllDeadRuns()
          await stopSubjectForForce(ticker, swarmId)
          const afterForcePoolConflict = currentSharedDataPoolConflict(swarmId, ticker, kind)
          if (afterForcePoolConflict) throw sharedDataPoolLaunchError(ticker, afterForcePoolConflict)
          assertLaunchBindingsStillCurrent(swarmId, ticker, params)
          assertNoModulePublicationInFlight(swarmId, ticker)
          assertNoForeignSubjectChain(swarmId, ticker, false)
        }
        const binding = params.decisionRunRoot && params.decisionFingerprint
          ? { decisionRunRoot: params.decisionRunRoot, decisionFingerprint: params.decisionFingerprint }
          : undefined
        // Await inside the try: releasing before firstReady would reopen the zero-owner window while the
        // outer scheduler has written its marker but its first child has not registered yet.
        return await launchFullChained(
          ticker,
          user,
          userVia,
          { provider: profile.provider, model: profile.model, reasoningLevel: profile.reasoningLevel,
            expectedProfileKey: profile.profileKey },
          defaultFullChainDeps,
          binding,
          params.memoryIdentity,
          technicalRetryRunRoot || continuationRunRoot || params.preparedRunPlanTransaction
            ? {
                runRoot: technicalRetryRunRoot ?? preparedRunRoot ?? continuationRunRoot!,
                ...(technicalRetryRunRoot
                  ? {
                      technicalReadinessRetry: true,
                      recoveryRequestId: params.recoveryRequestId!,
                    }
                  : {}),
                ...(continuationRunRoot ? { continuation: true } : {}),
                ...(params.preparedRunPlanTransaction
                  ? { preparedRunPlanTransaction: params.preparedRunPlanTransaction } : {}),
                ...(params.preSpendRetryAuthority
                  ? { preSpendRetryAuthority: params.preSpendRetryAuthority } : {}),
              }
            : undefined,
        )
      } finally {
        releasePoolClaim()
      }
    }
    if (kind === 'rerun' || kind === 'doc-intake' || (kind === 'review' && params.runRoot)) {
      // An explicitly selected call always supplies runRoot and was already bound to its decision
      // fingerprint by the route. Internal chained-full master launches deliberately omit runRoot: they
      // must continue the newest (today's staged) root, not jump back to the older standing decision.
      const latest = resolveRunRoot({ ticker, runRoot: params.runRoot })
      if (!latest) {
        const err: any = new Error(`No existing run to re-run for ${ticker}. Run a module or the full pipeline first.`)
        err.statusCode = 400
        throw err
      }
      if (params.runRoot && latest !== params.runRoot) throw Object.assign(new Error('The selected run no longer matches this subject.'), { statusCode: 409 })
      runRoot = latest
    } else if (continuationRunRoot || preparedRunRoot || chainedRunRoot) {
      runRoot = continuationRunRoot ?? preparedRunRoot ?? chainedRunRoot!
    } else if (kind === 'agent') {
      runRoot = resolveAgentRunRoot(ticker)
    } else {
      runRoot = `analyses/${ticker}_${todayDate()}`
    }
  }

  // The route's reviewed root and launcher's own resolved root must be identical. This catches a midnight
  // rollover that occurs before launch() resolves the module target; a later rollover is harmless because
  // the immutable value below is passed to the child instead of asking the command to call `date` again.
  if (params.exactModuleResume
      && exactModuleRunRootBinding(subjectId, exactModuleRunRoot, runRoot) === null) {
    throw Object.assign(new Error('The exact module run root changed before launch. Refresh and try again.'), {
      statusCode: 409,
      code: 'module_scope_changed',
    })
  }

  if (swarmId === 'research' && ['module', 'agent', 'rerun'].includes(kind) && isSealedResearchRun(runRoot)) {
    throw sealedResearchRunError(runRoot)
  }

  // The operator endpoint admits one LOGICAL full attempt. Its provider-neutral scheduler launches every
  // discovered module as a bounded child, then a single terminal full-canary adjudicator. Child stages carry
  // the same chainId/profile/root/freeze binding and therefore re-enter launch() without recursing here.
  if (kind === 'full' && (params.parityCanary?.stage === 'chain' || params.parityCanary?.stage === 'continuation')) {
    return launchFullChained(
      subjectId,
      user,
      userVia,
      { provider: profile.provider, model: profile.model, reasoningLevel: profile.reasoningLevel,
        expectedProfileKey: profile.profileKey },
      defaultFullChainDeps,
      undefined,
      undefined,
      {
        runRoot,
        continuation: params.parityCanary.stage === 'continuation',
        parityCanary: { runRoot, freezeReceipt: params.parityCanary.freezeReceipt },
      },
    )
  }

  const ticker = subjectId // RunState display/compat field: research = the ticker; swarms = the subject id
  const prompt = buildPrompt(swarmId, kind, ticker, module, agent, window, {
    thesisId: params.thesisId,
    checkpointId: params.checkpointId,
    parity: params.parity,
    parityCanary: params.parityCanary,
    runRoot: (kind === 'rerun' || kind === 'doc-intake' || kind === 'review') && params.runRoot ? runRoot : undefined,
    decisionFingerprint: (kind === 'rerun' || kind === 'doc-intake') ? params.decisionFingerprint : undefined,
    intakeReceipt: kind === 'rerun' ? params.intakeReceipt : undefined,
  })
  const expected = buildExpected(swarmId, kind, module, agent)

  // Admission metadata — derived once here, stored on the run, reused by admitRun.
  const coveredModules = coveredModulesFor(swarmId, kind, module, agent)
  // Root artifacts a research full/rerun writes (final_thesis / memo / decision) are research-only — a
  // constellation swarm (e.g. commodity) has no master synthesizer, so it declares none here.
  const rootArtifacts = swarmId === 'research' && kind === 'full' ? ROOT_ARTIFACTS_FULL
    : swarmId === 'research' && kind === 'rerun' ? ROOT_ARTIFACTS_RERUN
    : kind === 'signal' ? ROOT_ARTIFACTS_SIGNAL : []
  const convictionTargets = kind === 'conviction' ? [
    path.join(REPO_ROOT, 'screener', 'ledger', 'conviction', 'checkpoints.ndjson'),
    path.join(REPO_ROOT, 'screener', 'ledger', 'conviction', 'conviction.ndjson'),
    path.join(REPO_ROOT, 'screener', 'ledger', 'conviction', 'conviction_state', `${params.thesisId}.json`),
    path.join(REPO_ROOT, 'screener', 'board', 'index.json'),
  ] : []
  const parityTargets = kind === 'parity' && params.parity
    ? [path.join(REPO_ROOT, params.parity.outputDir)] : []
  const reviewTargets = kind === 'review' ? [
    path.join(REPO_ROOT, runRoot, 'reviews'),
    ...(manifest.calibrationRoot ? [path.join(REPO_ROOT, manifest.calibrationRoot)] : []),
  ] : []
  const writeTargetsAbs = [...new Set([
    ...[...expected.values()].map((e) => path.join(REPO_ROOT, runRoot, e.outputRel)),
    ...rootArtifacts.map((f) => path.join(REPO_ROOT, runRoot, f)),
    ...swarmStoreTargets(kind, subjectId, swarmId),
    ...convictionTargets,
    ...parityTargets,
    ...reviewTargets,
  ])]
  const readDepsAbs = kind === 'agent' || kind === 'screener-agent'
    ? agentRequiredUpstream(swarmId, module, agent).map((relp) => path.join(REPO_ROOT, runRoot, relp))
    : params.exactModuleResume
      ? exactModuleInputs.map((name) => path.join(REPO_ROOT, runRoot, name))
      : []

  // Reserve the bare shared-pool label before ANY launch-side mutation. For an unowned label this is the
  // atomic "first cockpit wins" claim; once setActiveSubjectRun() runs, the durable in-flight claim takes
  // over and this short-lived pending claim can be released in finally.
  const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, subjectId, kind)
  let releaseTargetPoolClaim = () => {}
  try {
  if (params.sharedPoolTarget) {
    releaseTargetPoolClaim = acquireSharedDataPoolClaim(
      params.sharedPoolTarget.swarm, params.sharedPoolTarget.subject, 'full',
    )
  }
  // FIRST compare-and-set boundary. Keep this immediately before every launch-side mutation below:
  // reapAllDeadRuns can finalize registry state; force can cancel a current run; admission claims the
  // subject; later blocks materialize files/markers. There is no await between this assertion and the
  // first force cancellation, so stale auto-intake owner A cannot cancel current B-bound work.
  assertLaunchBindingsStillCurrent(swarmId, subjectId, params)
  assertNoModulePublicationInFlight(swarmId, subjectId)
  assertNoForeignSubjectChain(swarmId, subjectId, params.chained)

  // Self-heal first: finalize any run whose engine process has died but never closed, so a wedged lock can
  // never permanently block this launch (the "stuck forever" failure). Sweep ALL subjects, not just this
  // one: admission's global concurrency cap (D5) counts in-flight runs across every subject, so a dead
  // child on ANOTHER subject would still fill the cap and fail this launch with `capacity`. Runs every launch.
  reapAllDeadRuns()

  // FORCE override: the user explicitly chose to run despite a same-subject lock ("overwrite is fine").
  // Stop every still-in-flight run on this subject — a running engine, or one parked at the readiness gate
  // — so its claim + write targets release before we admit. cancel() flips the run out of the in-flight
  // status set synchronously (running child: status='cancelled' + group-kill; gate-parked: finalized here).
  // BUT for a running child, cancel() only SIGTERMs and returns BEFORE the process exits (killProcessTree
  // SIGKILLs +2s later), while the run has ALREADY left the in-flight set — so if we admit now, admitRun
  // sees a "clean" subject and starts a SECOND engine writing the SAME run dir while the first is still
  // alive (interleaved / lost writes). So capture the runs BEFORE cancel (they vanish from the set) and
  // WAIT for their child processes to actually die before admitting; if any is still alive past the SIGKILL
  // window, REFUSE to admit (throw) rather than risk a concurrent double-write. We do NOT touch other
  // tickers' runs, so the global capacity cap (D5) still binds — force overrides a LOCK, never the cost guard.
  if (params.force) {
    await stopSubjectForForce(subjectId, swarmId)
  }

  // Force-stop can await a process-tree exit. Re-read ownership after that yield and before admission or
  // any run-root materialization; the pending claim blocks other local cockpits, while this catches an
  // owner published by another process/checkout during the wait.
  const afterForcePoolConflict = currentSharedDataPoolConflict(swarmId, subjectId, kind)
  if (afterForcePoolConflict) throw sharedDataPoolLaunchError(subjectId, afterForcePoolConflict)
  // Force cancellation can yield while the plan is consumed/replaced. Re-read the exact plan/orb/hash
  // immediately before admission so a stale plan-origin request never claims a paid run slot.
  assertLaunchBindingsStillCurrent(swarmId, subjectId, params)
  assertNoModulePublicationInFlight(swarmId, subjectId)
  assertNoForeignSubjectChain(swarmId, subjectId, params.chained)

  // Dependency-aware admission + register in ONE synchronous block (no await before
  // setActiveSubjectRun) so the check-and-claim is atomic under Node's single-threaded loop.
  const decision = admitRun({ ticker: subjectId, kind, swarmId, coveredModules, writeTargetsAbs, readDepsAbs })
  if (!decision.ok) {
    const { ok: _ok, ...rejection } = decision
    const err: any = new Error(admissionMessage(rejection, subjectId))
    err.statusCode = rejection.httpStatus
    err.body = rejection
    throw err
  }

  // Atomic deploy/run boundary. There is no await between this shared-kernel-lease acquisition and the
  // registry claim below. If deploy.sh already owns the exclusive side, fail before provider spend; once
  // this succeeds, a deploy cannot restart either Claude or Codex until finishRun releases the lease.
  const releaseDeployBarrier = acquireProviderRunDeployLease()

  // Admission and registry claim stay in one synchronous turn. Persist the immutable provider/profile
  // selection before touching the run root; process-attempt provenance still begins only at spawn.
  let run: RunState
  try {
    run = createRun({
      kind,
      ticker,
      subjectId,
      swarmId,
      unit: manifest.unit,
      module,
      agent,
      provider: profile.provider,
      executionProfile: profile.executionProfile,
      profileKey: profile.profileKey,
      model: profile.model,
      reasoningLevel: profile.reasoningLevel,
      availabilityProofId,
      resumeSessionId: params.resumeSessionId,
      prompt,
      user,
      userVia,
      runRoot,
      selectedDecisionRunRoot: params.decisionRunRoot,
      selectedDecisionFingerprint: params.decisionFingerprint,
      // `willCommitToMain` is the historical name for the mandatory terminal publication protocol. A frozen
      // terminal canary performs a stamp+receipt without Git, but must still fail if that protocol is skipped.
      willCommitToMain: requiresSupervisorPublication(kind, params.parityCanary?.stage),
      writeTargetsAbs,
      coveredModules,
      readDepsAbs,
      closeWatcher: undefined,
      releaseDeployBarrier,
      expected,
      chained: params.chained,
      continuation: params.continuation === true,
      chainId: params.chainId,
      onTerminal: params.onTerminal,
      parityCanary: Boolean(params.parityCanary),
      memoryIdentity: params.memoryIdentity,
      parityCanaryStage: params.parityCanary?.stage === 'module' || params.parityCanary?.stage === 'final'
        ? params.parityCanary.stage : undefined,
      parityCanaryContinuation: params.parityCanary?.stage === 'final'
        && params.parityCanary.continuation === true,
      protectedPriorExecutionAttempts: params.parityCanary?.stage === 'final'
        && params.parityCanary.continuation === true
        ? protectedInterruptedExecutionLineage(runRoot) : undefined,
    })
  } catch (error) {
    releaseDeployBarrier()
    throw error
  }
  run.publicationToken = randomUUID()
  run.provenanceEpoch = params.chainId || run.runId
  if (params.preSpendRetryAuthority) {
    preSpendRetryAuthorityByRun.set(run, params.preSpendRetryAuthority)
  }
  providerSpawnRequestIdByRun.set(
    run,
    params.preparedRunPlanTransaction?.requestId ?? params.recoveryRequestId ?? run.runId,
  )
  try {
    recordAdmittedProviderSelection(run)
    setActiveSubjectRun(run.runId, subjectId, swarmId)
  } catch (error) {
    finishRun(run, 'error')
    throw error
  }

  if (params.preparedRunPlanTransaction) {
    const transaction = params.preparedRunPlanTransaction
    const attemptId = params.preparedRunPlanAttemptId
    if (!attemptId) {
      finishRun(run, 'error')
      throw new Error('prepared run-plan child lost its pre-await attempt identity')
    }
    preparedRunPlanTransactionByRun.set(run, { transaction, rootAttemptId: attemptId, attemptId })
    run.onNoChildTerminal = () => {
      void transaction.rollbackIfUnstarted('admitted run ended before provider start', attemptId).catch((error: any) => {
        console.error(`[run-plan] terminal rollback failed for ${run.runId}: ${String(error?.message || error)}`) // eslint-disable-line no-console
      })
    }
    try {
      await transaction.activate()
      bindPreparedImmutableReusedOutputs(run, transaction.preparation.doneOrbKeys)
    } catch (error) {
      finishRun(run, 'error')
      throw error
    }
  }

  // A research full run is not terminal at thesis creation. It must also freeze the post-audit Ideas
  // admission (including an honest not-admitted/not-applicable result). The freezer removes this marker
  // only after it has atomically written or revalidated that immutable record; close-time success therefore
  // cannot race ahead of publication. Chained full runs create the same marker in writeMarker() above.
  if (swarmId === RESEARCH_SWARM_ID && kind === 'full') markIdeaPublicationRequired(runRoot)

  // Materialize the signal intake AFTER admission passes (no orphan folders on rejection).
  if (pendingIntake) {
    try {
      if (!run.runRoot) throw new Error('signal intake has no admitted run root')
      fs.mkdirSync(path.join(REPO_ROOT, run.runRoot), { recursive: true })
      const relative = path.relative(path.join(REPO_ROOT, run.runRoot), pendingIntake.path).split(path.sep).join('/')
      writeSupervisorRunFile(run.runRoot, relative, JSON.stringify(pendingIntake.body, null, 2) + '\n')
    } catch (error) {
      finishRun(run, 'error')
      throw error
    }
  }

  // Record (or clear) the deliberate-stop TARGET for a signal run. A `--until` partial run stops the
  // gauntlet at `module` on purpose ("run through here, continue the rest later"). That target is
  // otherwise never persisted — it lives only in the prompt string and free-text RUN_METADATA.md, and
  // intake.json's schema carries no `until`/`module` field — so on disk a deliberate partial is
  // indistinguishable from a run broken mid-flight. Without this marker the auto-resume scan
  // (listResumableSignals) classifies the staged run "resumable" and relaunches it WITHOUT the target,
  // running the full gauntlet the user explicitly deferred — locking a thesis_record.json, surfacing
  // candidates they chose not to surface yet, and spending unbudgeted CLI. The marker makes a staged
  // stop self-identifying. A relaunch WITHOUT a target (a manual "Continue the rest") clears it — the
  // user has now chosen to run the remainder — mirroring the .aborted clear in the relaunch branch above.
  // Path rebuilt from the anchored-regex-validated subject id (not the raw `runRoot` string) and
  // containment-checked, so a request-derived id can never steer the write outside the run folder.
  if (kind === 'signal') {
    try {
      const dir = screenerMarkerDir(swarmId, subjectId)
      if (dir) {
        if (module) writeRunMarker(run.runRoot, '.target', { module })
        else clearRunMarker(run.runRoot, '.target')
      }
    } catch {
      /* best-effort marker; a missing marker only risks one auto-resume the user can re-cancel */
    }
  }

  if (params.intakeOwner) intakeOwnerByRun.set(run, { ...params.intakeOwner })
  if (params.sharedPoolTarget) sharedPoolTargetByRun.set(run, { ...params.sharedPoolTarget })
  if (params.intakeReceipt) intakeReceiptByRun.set(run, { ...params.intakeReceipt })
  if (params.deferModuleMemo) deferredModuleMemoRuns.add(run)
  if (continuationRunRoot) continuationRunRootByRun.set(run, continuationRunRoot)
  if (params.requireExistingFrozenPoolReceipt) durableFrozenGenerationReuseRuns.add(run)
  if (exactResumeBinding) {
    exactModuleResumeRuns.add(run)
    exactModuleInputsByRun.set(run, exactModuleInputs)
    exactModuleRunRootByRun.set(run, exactResumeBinding.runRoot)
    exactModuleArtifactScopeByRun.set(run, {
      module: exactResumeBinding.module,
      writableOrbs: exactModuleWritableOrbs,
      synthesisOrbs: exactModuleSynthesisOrbs,
    })
  }
  if (params.preSpawnGuard) preSpawnGuards.set(run, params.preSpawnGuard)
  if (params.terminalGuard) bindTerminalGuard(run, params.terminalGuard)

  // seed expected agents as queued so the UI can show the planned swarm immediately
  for (const e of expected.values()) {
    run.agents.set(e.key, { key: e.key, module: e.module, name: e.name, layer: e.layer, status: 'queued' })
  }

  startRunWatcher(run)

  // EARLY ACK — respond the moment the claim is registered. Every outcome the caller can branch on
  // synchronously (validation 4xx, admission 409/429, typed-confirm 412, CLI-missing 503, force-stop
  // 409) has already been decided above. The readiness gate and the spawn were ALWAYS async state to
  // the client: a gate-blocked launch returns this exact same {runId, preflight} shape, and the gate's
  // readiness-* events reach the client via the SSE backlog replay (registry.subscribe) once it
  // connects with the runId from this response. Holding the response through the gate added
  // seconds-to-minutes of dead air after the click — and on a cold/scanned pool (extract timeout 300s)
  // it could outlive the edge's ~100s proxy timeout, showing a FAILED launch for a run that started.
  void continueLaunch(run)
  return {
    runId: run.runId,
    preflight: estimate(kind, ticker, profile.provider, module, agent, swarmId, profile.model, profile.reasoningLevel, profile.profileKey),
  }
  } finally {
    releaseTargetPoolClaim()
    releasePoolClaim()
  }
}

/**
 * The production `data/` directory may be a parent symlink to the mounted Drive pool. The freeze builder
 * deliberately stores the canonical snapshot root, so compare real directory identities rather than the
 * two lexical spellings. A symlink at the subject itself, a missing path, or any sibling remains invalid.
 */
export function paritySnapshotRootMatchesDataSubject(snapshotRoot: string, dataDir: string, subjectId: string): boolean {
  try {
    const boundInfo = fs.lstatSync(snapshotRoot)
    const expected = path.resolve(dataDir, subjectId)
    const expectedInfo = fs.lstatSync(expected)
    if (!boundInfo.isDirectory() || boundInfo.isSymbolicLink()
        || !expectedInfo.isDirectory() || expectedInfo.isSymbolicLink()) return false
    return fs.realpathSync(snapshotRoot) === fs.realpathSync(expected)
  } catch {
    return false
  }
}

const RECOVERABLE_PARITY_INTERRUPTION_REASONS = new Set([
  'codex_incomplete_orchestration',
  'codex_continuation_failed',
  'continuation_spawn_failed',
  'terminated_sigterm',
  'supervisor_shutdown',
  'supervisor_restart',
])

/** The route still requires exact supervisor authority, profile/root equality, no abort marker, and no
 * completed supervisor receipt. These are only the machine-stop reasons eligible to enter that gate. */
export function isRecoverableParityInterruptionReason(value: unknown): boolean {
  return typeof value === 'string' && RECOVERABLE_PARITY_INTERRUPTION_REASONS.has(value)
}

/**
 * A frozen canary starts with only its immutable binding. Once the shared scheduler owns it, the only
 * additional top-level entries allowed before terminal adjudication are supervisor support, the deterministic
 * extraction cache, and discovered module folders. Module stages may overlap, so a sibling folder can be
 * legitimately partial while another ready module is admitted; the final stage requires every discovered
 * synthesis to be complete. This prevents a child-stage loader from turning arbitrary top-level content into
 * trusted parity evidence while still allowing one logical canary to advance module by module.
 */
export function assertParityCanaryStageRoot(rootAbsolute: string, stage: ParityCanaryStage): void {
  let rootInfo: fs.Stats
  let rootReal: string
  try {
    rootInfo = fs.lstatSync(rootAbsolute)
    rootReal = fs.realpathSync(rootAbsolute)
  } catch {
    throw Object.assign(new Error('parity canary root no longer exists'), { statusCode: 409 })
  }
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) {
    throw Object.assign(new Error('parity canary root is not a real directory'), { statusCode: 409 })
  }
  const graph = buildSwarmGraph(RESEARCH_SWARM_ID)
  const syntheses = new Map(graph.modules.map((module) => [
    module.name,
    Object.values(module.layers).flat()
      .filter((agent) => agent.isSynthesis)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  ]))
  const failFastTriages = new Map(graph.modules.map((module) => [
    module.name,
    Object.values(module.layers).flat()
      .filter((agent) => agent.nn === '00' && agent.failFast)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  ]))
  const support = new Set([
    '.provider-parity-input.json', '.defer_module_memos', IDEA_PUBLICATION_MARKER,
    'readiness_override.json', '_pool_extracts',
  ])
  // Finder may create this metadata file merely by displaying the directory. It carries no research
  // evidence and is never passed to a provider, so ignore it without widening the support-file contract.
  const entries = fs.readdirSync(rootAbsolute, { withFileTypes: true })
    .filter((entry) => entry.name !== '.DS_Store')
  const names = new Set(entries.map((entry) => entry.name))
  if (!names.has('.provider-parity-input.json')) {
    throw Object.assign(new Error('parity canary root has no immutable provider binding'), { statusCode: 409 })
  }
  if (stage === 'chain') {
    const unexpected = entries.filter((entry) => entry.name !== '.provider-parity-input.json')
    if (unexpected.length) {
      throw Object.assign(new Error('parity full canary root is no longer pristine'), { statusCode: 409 })
    }
    return
  }
  if (stage === 'continuation') {
    if (!names.has('.interrupted') || names.has('.aborted')) {
      throw Object.assign(new Error('parity canary continuation requires an interruption marker and no abort marker'), { statusCode: 409 })
    }
  }
  if ((stage === 'continuation' || stage === 'final') && names.has(EXECUTION_PROVENANCE_RECEIPT)) {
    throw Object.assign(new Error('parity canary continuation is already supervisor-published'), { statusCode: 409 })
  }
  const stageSupport = stage === 'continuation'
    ? new Set([...support, ...ROOT_ARTIFACTS_FULL, '.interrupted', FAILURE_NOTE])
    : stage === 'final' ? new Set([...support, ...ROOT_ARTIFACTS_FULL]) : support
  for (const entry of entries) {
    const absolute = path.join(rootAbsolute, entry.name)
    const info = fs.lstatSync(absolute)
    if (info.isSymbolicLink() || fs.realpathSync(absolute) !== path.join(rootReal, entry.name)) {
      throw Object.assign(new Error(`parity canary stage contains an unsafe path: ${entry.name}`), { statusCode: 409 })
    }
    if (stageSupport.has(entry.name)) {
      const directoryExpected = entry.name === '_pool_extracts'
      if (directoryExpected !== info.isDirectory() || (!directoryExpected && !info.isFile())) {
        throw Object.assign(new Error(`parity canary support path has the wrong type: ${entry.name}`), { statusCode: 409 })
      }
      continue
    }
    const expectedSyntheses = syntheses.get(entry.name)
    if (!expectedSyntheses || !info.isDirectory()) {
      throw Object.assign(new Error(`parity canary stage contains an unexpected top-level path: ${entry.name}`), { statusCode: 409 })
    }
    if (stage === 'final' && !hasValidParityModuleOutcome(
      absolute, expectedSyntheses, failFastTriages.get(entry.name) ?? [],
    )) {
      throw Object.assign(new Error(`parity canary module is not complete: ${entry.name}`), { statusCode: 409 })
    }
  }
  if (stage === 'final') {
    const missing = [...syntheses].filter(([module, files]) =>
      !hasValidParityModuleOutcome(
        path.join(rootAbsolute, module), files, failFastTriages.get(module) ?? [],
      ))
      .map(([module]) => module)
    if (missing.length) {
      throw Object.assign(new Error(`parity canary cannot adjudicate before every module is complete: ${missing.join(', ')}`), { statusCode: 409 })
    }
  }
}

function hasValidParitySynthesis(moduleAbsolute: string, files: string[]): boolean {
  return validModuleOutcomeFiles(moduleAbsolute, files, []).length > 0
}

/** `/research:full` treats a fail-fast 00 triage verdict of Insufficient as a completed, capped module
 * outcome. The frozen terminal gate must accept that same deliberate outcome, but only from a discovered
 * fail-fast triage file that passes the canonical regular-file validator. */
function validModuleOutcomeFiles(
  moduleAbsolute: string,
  synthesisFiles: string[],
  failFastTriageFiles: string[],
): string[] {
  const validRegularFiles = (files: string[]) => files.filter((file) => {
    const candidate = path.join(moduleAbsolute, file)
    try {
      const info = fs.lstatSync(candidate)
      return info.isFile() && !info.isSymbolicLink() && validateAgentOutputFile(candidate).valid
    } catch {
      return false
    }
  })
  const syntheses = validRegularFiles(synthesisFiles)
  if (syntheses.length) return syntheses
  return validRegularFiles(failFastTriageFiles).filter((file) => {
    try {
      return extractTriageStatus(fs.readFileSync(path.join(moduleAbsolute, file), 'utf8')) === 'Insufficient'
    } catch {
      return false
    }
  })
}

function hasValidParityModuleOutcome(
  moduleAbsolute: string,
  synthesisFiles: string[],
  failFastTriageFiles: string[],
): boolean {
  return validModuleOutcomeFiles(moduleAbsolute, synthesisFiles, failFastTriageFiles).length > 0
}

// The post-ack half of launch(): readiness gate, then spawn (or park at the gate for a human decision).
// Any hard failure here finalizes the run + emits run-error, so a fast-acked client is never left
// watching a phantom claim. Mirrors the pattern cancel() has always used: cheap sync flip, ack, let
// the outcome ride SSE.
async function continueLaunch(run: RunState): Promise<void> {
  try {
    if (run.endedAt !== undefined) return
    if (run.cancelRequested) {
      emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
      finishRun(run, 'cancelled')
      return
    }
    // Pre-spawn data-readiness gate (deterministic, no LLM). Research data-consuming kinds only (swarm
    // kinds skip it). If the check isn't clean, BLOCK: pause in awaiting-readiness-decision and defer
    // the spawn until the user decides (decideReadiness). No CLI is spawned while paused.
    const readinessGate = await runReadinessGate(run)
    // cancel() can finalize the run DURING the gate's async check (it yields the loop while the check
    // runs). A finalized run is never revived or spawned — mirrors finalizeRunOnClose's endedAt guard.
    if (run.endedAt !== undefined || run.cancelRequested) return
    const chainNeedsDecision = !!(readinessGate && run.readiness && readinessNeedsDecision(run, run.readiness))
    // Every chain child waits on the chain resolution except the one empty-data owner that must expose the
    // panel first. This includes the automatic non-empty owner: a sibling admission failure/cancel can clear
    // the chain while its evaluator is running, and that cancellation must win over a late provider spawn.
    if (readinessGate && (!readinessGate.owner || !chainNeedsDecision)) {
      const resolution = await readinessGate.resolution
      if (run.endedAt !== undefined || run.cancelRequested) return
      if (resolution.action === 'cancel') {
        emit(run, {
          type: 'run-error', runId: run.runId, status: 'cancelled',
          reason: 'cancelled_at_chain_readiness_gate', ts: Date.now(),
        })
        finishRun(run, 'cancelled')
        return
      }
      if (resolution.report && resolution.report !== run.readiness) {
        run.readiness = resolution.report
        emit(run, { type: 'readiness-report', runId: run.runId, report: resolution.report, ts: Date.now() })
      }
      run.readinessDecision = {
        action: resolution.action,
        user: resolution.user,
        acknowledgedText: resolution.acknowledgedText,
        ts: Date.now(),
      }
      emit(run, { type: 'readiness-resolved', runId: run.runId, action: resolution.action, ts: Date.now() })
      await spawnEngine(run)
      return
    }
    if (run.readiness && readinessNeedsDecision(run, run.readiness)) {
      run.status = 'awaiting-readiness-decision'
      run.deferredSpawn = () => spawnEngine(run)
      emit(run, { type: 'readiness-blocked', runId: run.runId, report: run.readiness, ts: Date.now() })
      return
    }
    await spawnEngine(run)
  } catch (e: any) {
    if (isReadinessCancelledError(e) || run.cancelRequested
        || (!!run.chainId && cancelledChainIds.has(run.chainId))) {
      if (run.endedAt === undefined) {
        emit(run, {
          type: 'run-error', runId: run.runId, status: 'cancelled',
          reason: 'cancelled_at_readiness_gate', ts: Date.now(),
        })
        finishRun(run, 'cancelled')
      }
      return
    }
    // spawnEngine already emitted run-error + finalized on its own throw — only clean up if it didn't
    if (run.endedAt === undefined) {
      let message: string
      if (e instanceof Error) message = e.message
      else if (typeof e === 'string') message = e
      else {
        try { message = JSON.stringify(e) || String(e) } catch { message = String(e) }
      }
      let deferredPreSpend = false
      const retryAuthority = preSpendRetryAuthorityByRun.get(run)
      const prepared = preparedRunPlanTransactionByRun.get(run)?.transaction
      if (retryAuthority && prepared && !run.child) {
        const technicalReadinessFailure = !durableFrozenGenerationReuseRuns.has(run)
          && run.readiness?.issues.some((issue) => issue.code === 'check_failed') === true
          && !run.readiness?.frozenPool
        const unavailable = e?.statusCode === 503
          || ['PROVIDER_DISABLED', 'PROVIDER_UNAVAILABLE', 'CLAUDE_CLI_MISSING']
            .includes(String(e?.code || ''))
        const retryReason: PreSpendRetryAuthority['reason'] = technicalReadinessFailure
          ? 'technical_readiness_failed_before_spend'
          : unavailable ? 'provider_unavailable_before_spend' : 'provider_spawn_failed_before_spend'
        try {
          deferredPreSpend = await deferPreparedPreSpendRetry(prepared, retryAuthority, retryReason)
          // The transaction deliberately moved the new root back into its owner-only workspace. Let the
          // logical chain drain, but do not let finishRun's generic no-child hook roll it back or create a
          // run-folder interruption marker that could bypass the exact protected rearm API.
          run.onNoChildTerminal = undefined
          run.note = `Waiting for automatic exact-plan retry after ${retryReason.replaceAll('_', ' ')}.`
        } catch (deferError: any) {
          message = `${message}; exact retry could not be sealed: ${String(deferError?.message || deferError)}`
        }
      }
      // Any admitted chain child that fails before execa remains recoverable on this exact root/profile.
      // A fresh Full whose bounded local checker exhausted gets its own reason: the headless supervisor may
      // retry that pre-spend readiness transaction against live data. Continue/reuse children are excluded
      // because they must retain their original frozen generation and must never reopen Drive.
      if (!deferredPreSpend && isResumableResearchRun(run) && !run.child) {
        const technicalReadinessFailure = !durableFrozenGenerationReuseRuns.has(run)
          && run.readiness?.issues.some((issue) => issue.code === 'check_failed') === true
          && !run.readiness?.frozenPool
        const reason = technicalReadinessFailure
          ? 'technical_readiness_failed_before_spend'
          : 'continuation_spawn_failed'
        try { writeInterruptionMarker(run, reason, message) } catch { /* fail closed below */ }
        try { recordRunFailure(run, reason, message) } catch { /* Activity remains authoritative */ }
        run.note = failureNote(reason, message)
      }
      emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'launch_failed', message, ts: Date.now() })
      finishRun(run, 'error')
    }
  }
}

export const DEFER_MODULE_MEMO_ENV = PROVIDER_NEUTRAL_RUN_ENV.deferModuleMemo
export const CONTINUATION_RUN_ROOT_ENV = PROVIDER_NEUTRAL_RUN_ENV.continuationRunRoot
export const EXACT_MODULE_RESUME_ENV = PROVIDER_NEUTRAL_RUN_ENV.exactModuleResume
export const EXACT_MODULE_INPUTS_ENV = PROVIDER_NEUTRAL_RUN_ENV.exactModuleInputs
export const EXACT_MODULE_RUN_ROOT_ENV = PROVIDER_NEUTRAL_RUN_ENV.exactModuleRunRoot
export const EXACT_MODULE_NAME_ENV = PROVIDER_NEUTRAL_RUN_ENV.exactModuleName
export const EXACT_MODULE_WRITABLE_ORBS_ENV = PROVIDER_NEUTRAL_RUN_ENV.exactModuleWritableOrbs
export const EXACT_MODULE_SYNTHESIS_ORBS_ENV = PROVIDER_NEUTRAL_RUN_ENV.exactModuleSynthesisOrbs
export const PARITY_CANARY_CONTINUATION_ENV = PROVIDER_NEUTRAL_RUN_ENV.parityCanaryContinuation
export const FROZEN_POOL_DATA_PATH_ENV = PROVIDER_NEUTRAL_RUN_ENV.frozenPoolDataPath
export const FROZEN_POOL_OUT_DIR_ENV = PROVIDER_NEUTRAL_RUN_ENV.frozenPoolOutDir
export const FROZEN_POOL_BINDING_OUT_DIR_ENV = PROVIDER_NEUTRAL_RUN_ENV.frozenPoolBindingOutDir
export const FROZEN_POOL_GENERATION_ENV = PROVIDER_NEUTRAL_RUN_ENV.frozenPoolGeneration
export const FROZEN_EVIDENCE_ROOT_ENV = PROVIDER_NEUTRAL_RUN_ENV.frozenEvidenceRoot
// Back-compatible helper for the few untracked Claude-only wrappers that import childEnv(). Tracked
// cockpit processes get their environment from their selected ProviderAdapter.
interface RunPolicyEnvOptions {
  deferModuleMemo?: boolean
  continuationRunRoot?: unknown
  exactModuleResume?: boolean
  exactModuleInputs?: unknown
  exactModuleRunRoot?: unknown
  exactModuleName?: unknown
  exactModuleWritableOrbs?: unknown
  exactModuleSynthesisOrbs?: unknown
}

function applyRunPolicyOptions(source: NodeJS.ProcessEnv, options: RunPolicyEnvOptions = {}): NodeJS.ProcessEnv {
  const env = { ...source }
  for (const key of [
    DEFER_MODULE_MEMO_ENV, CONTINUATION_RUN_ROOT_ENV, EXACT_MODULE_RESUME_ENV, EXACT_MODULE_INPUTS_ENV,
    EXACT_MODULE_RUN_ROOT_ENV, EXACT_MODULE_NAME_ENV, EXACT_MODULE_WRITABLE_ORBS_ENV,
    EXACT_MODULE_SYNTHESIS_ORBS_ENV,
  ]) delete env[key]
  if (options.deferModuleMemo) env[DEFER_MODULE_MEMO_ENV] = '1'
  if (options.continuationRunRoot !== undefined) {
    const root = typeof options.continuationRunRoot === 'string' ? options.continuationRunRoot : ''
    if (!/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/.test(root)) {
      throw new Error('continuation requires a valid immutable run root')
    }
    env[CONTINUATION_RUN_ROOT_ENV] = root
  }
  if (!options.exactModuleResume) return env

  const root = typeof options.exactModuleRunRoot === 'string' ? options.exactModuleRunRoot : ''
  if (!/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/.test(root)) {
    throw new Error('exact module resume requires a valid immutable run root')
  }
  const rawInputs = options.exactModuleInputs
  const module = typeof options.exactModuleName === 'string' ? options.exactModuleName : ''
  const rawWritable = options.exactModuleWritableOrbs
  const rawSyntheses = options.exactModuleSynthesisOrbs
  const validStrings = (value: unknown, pattern: RegExp): value is string[] => Array.isArray(value)
    && value.every((item) => typeof item === 'string' && pattern.test(item))
  if (!validStrings(rawInputs, /^[a-z0-9][a-z0-9-]*$/)) {
    throw new Error('exact module resume requires a valid immutable run root and artifact scope')
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(module)
      || !validStrings(rawWritable, /^\d{2}_[a-z0-9][a-z0-9-]*$/)
      || !validStrings(rawSyntheses, /^99_[a-z0-9][a-z0-9-]*$/)) {
    throw new Error('exact module resume requires a valid immutable run root and artifact scope')
  }
  env[EXACT_MODULE_RESUME_ENV] = '1'
  env[EXACT_MODULE_INPUTS_ENV] = [...new Set(rawInputs)].sort().join(',')
  env[EXACT_MODULE_RUN_ROOT_ENV] = root
  env[EXACT_MODULE_NAME_ENV] = module
  env[EXACT_MODULE_WRITABLE_ORBS_ENV] = [...new Set(rawWritable)].sort().join(',')
  env[EXACT_MODULE_SYNTHESIS_ORBS_ENV] = [...new Set(rawSyntheses)].sort().join(',')
  return env
}

export function childEnv(options: RunPolicyEnvOptions = {}): NodeJS.ProcessEnv {
  return applyRunPolicyOptions(claudeChildEnv(), options)
}

/** Reassert supervisor-only controls after a provider adapter applies its model-visible env allowlist. */
export function applySupervisorPublicationEnv(
  source: NodeJS.ProcessEnv,
  binding: { runId: string; runRoot: string; token: string; socketPath?: string },
): NodeJS.ProcessEnv {
  const env = { ...source }
  // A stale shell-level value must not resurrect the retired child-writable manifest contract.
  delete env.NOSTRA_PROVENANCE_MANIFEST
  return {
    ...env,
    NOSTRA_COCKPIT_RUN: '1',
    NOSTRA_PUBLICATION_ENDPOINT: binding.socketPath
      ? 'http://localhost/publication'
      : `http://${HOST}:${PORT}/api/internal/runs/${binding.runId}/publication`,
    NOSTRA_PUBLICATION_TOKEN: binding.token,
    ...(binding.socketPath ? { NOSTRA_PUBLICATION_SOCKET: binding.socketPath } : {}),
  }
}

function applyRunPolicyEnv(source: NodeJS.ProcessEnv, run: RunState): NodeJS.ProcessEnv {
  const scope = exactModuleArtifactScopeByRun.get(run)
  // A two-hour fresh Full is just as vulnerable to midnight as Continue: commands historically called
  // `date` again and could move a later module/master into tomorrow's folder. Bind every research chain
  // child to the scheduler's already-captured exact root. The env name is retained for command compatibility;
  // its contract is now the provider-neutral exact chain root, not a signal that this is a Continue action.
  const exactChainRunRoot = run.chained && run.swarmId === RESEARCH_SWARM_ID
    ? exactModuleRunRootBinding(run.ticker, run.runRoot) ?? undefined
    : undefined
  const env = applyRunPolicyOptions(source, {
    deferModuleMemo: deferredModuleMemoRuns.has(run),
    continuationRunRoot: continuationRunRootByRun.get(run) ?? exactChainRunRoot,
    exactModuleResume: exactModuleResumeRuns.has(run),
    exactModuleInputs: exactModuleInputsByRun.get(run),
    exactModuleRunRoot: exactModuleRunRootByRun.get(run),
    exactModuleName: scope?.module,
    exactModuleWritableOrbs: scope?.writableOrbs,
    exactModuleSynthesisOrbs: scope?.synthesisOrbs,
  })
  delete env.NOSTRA_MEMORY_MODE
  delete env[PARITY_CANARY_CONTINUATION_ENV]
  delete env[FROZEN_POOL_DATA_PATH_ENV]
  delete env[FROZEN_POOL_OUT_DIR_ENV]
  delete env[FROZEN_POOL_BINDING_OUT_DIR_ENV]
  delete env[FROZEN_POOL_GENERATION_ENV]
  delete env[FROZEN_EVIDENCE_ROOT_ENV]
  if (run.memoryRuntime && run.memoryRuntime.mode !== 'off') {
    env.NOSTRA_MEMORY_MODE = run.memoryRuntime.mode
  }
  if (run.parityCanaryContinuation) env[PARITY_CANARY_CONTINUATION_ENV] = '1'
  const frozenEvidence = providerEvidenceBinding(run)
  if (frozenEvidence) {
    env[FROZEN_POOL_DATA_PATH_ENV] = frozenEvidence.frozenPool.dataPath
    env[FROZEN_POOL_OUT_DIR_ENV] = frozenEvidence.capability.poolOutDir
    env[FROZEN_POOL_BINDING_OUT_DIR_ENV] = frozenEvidence.frozenPool.outDir
    env[FROZEN_POOL_GENERATION_ENV] = frozenEvidence.frozenPool.generationDigest
    env[FROZEN_EVIDENCE_ROOT_ENV] = frozenEvidence.capability.evidenceRoot
  }
  return env
}

/** Read-only deterministic seam proving provider adapters receive only the supervisor-bound generation. */
export function applyRunPolicyEnvForTest(source: NodeJS.ProcessEnv, run: RunState): NodeJS.ProcessEnv {
  return applyRunPolicyEnv(source, run)
}

const PUBLICATION_SOCKET_MAX_BODY = 64 * 1024
const publicationTokenMatches = (expected: string, value: string): boolean => {
  const a = Buffer.from(expected)
  const b = Buffer.from(value)
  return a.length === b.length && timingSafeEqual(a, b)
}

function validSupervisorPublicationRequest(value: unknown): value is SupervisorPublicationRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const allowed = new Set([
    'phase', 'message', 'pathspecs', 'comparisonArtifact', 'freezeReceipt', 'receiptOutput',
    'executedAgainstDecisionFingerprint',
  ])
  if (Object.keys(record).some((key) => !allowed.has(key))) return false
  if (record.phase !== undefined && !['stamp', 'archive', 'commit', 'intake-receipt', 'attest', 'verify-attestation'].includes(String(record.phase))) return false
  if (record.message !== undefined && (typeof record.message !== 'string' || record.message.length > 500)) return false
  if (record.pathspecs !== undefined && (!Array.isArray(record.pathspecs) || record.pathspecs.length > 32
      || record.pathspecs.some((item) => typeof item !== 'string' || item.length > 500))) return false
  for (const key of ['comparisonArtifact', 'freezeReceipt', 'receiptOutput']) {
    if (record[key] !== undefined && (typeof record[key] !== 'string' || record[key].length > 1000)) return false
  }
  if (record.executedAgainstDecisionFingerprint !== undefined
      && (typeof record.executedAgainstDecisionFingerprint !== 'string'
        || !/^sha256:[a-f0-9]{64}$/.test(record.executedAgainstDecisionFingerprint))) return false
  return true
}

function validMemoryCompileRequest(value: unknown): value is { agentKey: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.keys(record).length === 1 && typeof record.agentKey === 'string'
    && /^(?:[a-z][a-z0-9-]*\/[0-9]{2}_[a-z0-9-]+|master\/synthesizer)$/.test(record.agentKey)
}

function validMemoryUseRequest(value: unknown): value is { agentKey: string; outputRel: string; use: Record<string, unknown> } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.keys(record).length === 3 && typeof record.agentKey === 'string'
    && /^(?:[a-z][a-z0-9-]*\/[0-9]{2}_[a-z0-9-]+|master\/synthesizer)$/.test(record.agentKey)
    && typeof record.outputRel === 'string' && record.outputRel.length <= 500
    && Boolean(record.use) && typeof record.use === 'object' && !Array.isArray(record.use)
}

function validMemoryStatusRequest(value: unknown): value is { agentKey: string; outputRel: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.keys(record).length === 2 && typeof record.agentKey === 'string'
    && /^(?:[a-z][a-z0-9-]*\/[0-9]{2}_[a-z0-9-]+|master\/synthesizer)$/.test(record.agentKey)
    && typeof record.outputRel === 'string' && record.outputRel.length <= 500
}

export interface SupervisorPublicationSocket {
  socketPath: string
  verify: () => void
  close: () => Promise<void>
}

/**
 * Per-run capability transport for sandboxed providers. AF_UNIX keeps publication available without
 * granting a model public or loopback TCP access. The listener is closure-bound to one live RunState and
 * token, accepts only a small strict JSON POST, and is removed only after the launcher's process drain.
 */
export async function startSupervisorPublicationSocket(run: RunState): Promise<SupervisorPublicationSocket> {
  if (!run.publicationToken) throw new Error('run has no supervisor publication capability')
  if (typeof process.getuid !== 'function') {
    throw new Error('publication capabilities require Unix owner identity checks')
  }
  const ownerUid = process.getuid()
  const identity = (target: string, kind: 'directory' | 'socket'): string => {
    const info = fs.lstatSync(target, { bigint: true })
    if ((kind === 'directory' && !info.isDirectory()) || (kind === 'socket' && !info.isSocket())
        || info.isSymbolicLink() || Number(info.uid) !== ownerUid
        || Number(info.mode & 0o077n) !== 0 || fs.realpathSync(target) !== target) {
      throw new Error(`publication ${kind} identity is unsafe`)
    }
    return [info.dev, info.ino, info.mode, info.size, info.mtimeNs, info.ctimeNs].join(':')
  }
  const rootIdentity = (target: string): string => {
    const info = fs.lstatSync(target, { bigint: true })
    if (!info.isDirectory() || info.isSymbolicLink()
        || Number(info.uid) !== ownerUid
        || Number(info.mode & 0o077n) !== 0 || fs.realpathSync(target) !== target) {
      throw new Error('publication socket root identity is unsafe')
    }
    // Concurrent runs legitimately add/remove their own private child directory. Pin the root inode and
    // mode, not its mutable directory timestamps/size, so one admitted run cannot poison another.
    return [info.dev, info.ino, info.mode, info.uid].join(':')
  }
  const socketRoot = PUBLICATION_SOCKET_ROOT
  fs.mkdirSync(socketRoot, { recursive: true, mode: 0o700 })
  fs.chmodSync(socketRoot, 0o700)
  const socketRootIdentity = rootIdentity(socketRoot)
  const directory = fs.mkdtempSync(path.join(socketRoot, 'r-'))
  fs.chmodSync(directory, 0o700)
  const socketPath = path.join(directory, 'p.sock')
  // Darwin sockaddr_un.sun_path is 104 bytes including the NUL. Fail before listen rather than silently
  // truncating the owner-only capability path into a different socket.
  if (Buffer.byteLength(socketPath) > 103) {
    fs.rmdirSync(directory)
    throw new Error('the owner-only publication socket path is too long for a safe Unix socket')
  }
  let closed = false
  let dirty: string | null = null
  let directoryIdentity = ''
  let socketIdentity = ''
  let watcher: fs.FSWatcher | null = null
  const invalidate = (reason: string): never => {
    dirty = dirty || reason
    run.publicationError = `publication transport integrity failed: ${dirty}`
    run.publicationCompleted = false
    run.parityVerificationCompleted = false
    killProcessTree(run)
    throw new Error(run.publicationError)
  }
  const verify = (): void => {
    if (closed) invalidate('socket already closed')
    if (dirty) invalidate(dirty)
    try {
      if (rootIdentity(socketRoot) !== socketRootIdentity) invalidate('socket root changed')
      if (identity(directory, 'directory') !== directoryIdentity) invalidate('socket directory changed')
      if (identity(socketPath, 'socket') !== socketIdentity) invalidate('socket inode changed')
    } catch (error: any) {
      if (String(error?.message || error).startsWith('publication transport integrity failed:')) throw error
      invalidate(String(error?.message || error))
    }
  }
  const server = http.createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    try { verify() } catch (error: any) {
      response.statusCode = 409
      response.end(JSON.stringify({ error: 'publication transport rejected' }))
      request.resume()
      return
    }
    const route = request.url
    if (request.method !== 'POST' || !['/publication', '/memory/compile', '/memory/use', '/memory/status'].includes(route || '')) {
      response.statusCode = 405
      response.setHeader('Allow', 'POST')
      response.end(JSON.stringify({ error: 'supervisor socket route is not allowed' }))
      request.resume()
      return
    }
    const rawToken = request.headers['x-nostra-publication-token']
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken
    if (!run.publicationToken || typeof token !== 'string' || !publicationTokenMatches(run.publicationToken, token)) {
      response.statusCode = 403
      response.end(JSON.stringify({ error: 'missing or invalid publication capability' }))
      request.resume()
      return
    }
    const chunks: Buffer[] = []
    let size = 0
    let rejected = false
    request.on('data', (chunk: Buffer) => {
      if (rejected) return
      size += chunk.length
      if (size > PUBLICATION_SOCKET_MAX_BODY) {
        rejected = true
        response.statusCode = 413
        response.end(JSON.stringify({ error: 'publication request is too large' }))
        return
      }
      chunks.push(Buffer.from(chunk))
    })
    request.on('end', () => {
      if (rejected) return
      let body: unknown
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { body = null }
      const valid = route === '/publication'
        ? validSupervisorPublicationRequest(body)
        : route === '/memory/compile'
          ? validMemoryCompileRequest(body)
          : route === '/memory/use'
            ? validMemoryUseRequest(body)
            : validMemoryStatusRequest(body)
      if (!valid) {
        response.statusCode = 400
        response.end(JSON.stringify({ error: 'invalid supervisor request' }))
        return
      }
      try { verify() } catch (error: any) {
        response.statusCode = 409
        response.end(JSON.stringify({ error: 'publication transport rejected' }))
        return
      }
      const operation = route === '/publication'
        ? queuePublicationIntent(run.runId, token, body as SupervisorPublicationRequest)
        : route === '/memory/compile'
          ? compileResearchMemoryPacket(run, (body as { agentKey: string }).agentKey)
          : route === '/memory/use'
            ? attestResearchMemoryUse(
              run,
              (body as { agentKey: string }).agentKey,
              (body as { outputRel: string }).outputRel,
              (body as { use: Record<string, unknown> }).use,
            )
            : Promise.resolve().then(() => researchMemoryTaskStatus(
                run,
                (body as { agentKey: string }).agentKey,
                (body as { outputRel: string }).outputRel,
              ))
      void operation.then((result) => {
        if (!response.writableEnded) response.end(JSON.stringify(result))
      }, (error: any) => {
        if (route === '/publication') run.publicationError = String(error?.message || error).slice(0, 1000)
        if (!response.writableEnded) {
          response.statusCode = error?.statusCode || 409
          response.end(JSON.stringify({ error: route === '/publication' ? 'publication request rejected' : 'memory request rejected' }))
        }
      })
    })
    request.on('error', () => { if (!response.writableEnded) response.destroy() })
  })
  try {
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => { server.off('listening', onListening); reject(error) }
      const onListening = () => { server.off('error', onError); resolve() }
      server.once('error', onError)
      server.once('listening', onListening)
      server.listen(socketPath)
    })
    fs.chmodSync(socketPath, 0o600)
    directoryIdentity = identity(directory, 'directory')
    socketIdentity = identity(socketPath, 'socket')
    watcher = fs.watch(directory, (event, filename) => {
      if (closed || dirty) return
      // Darwin can deliver the listen/chmod notifications after fs.watch is installed even though the
      // socket's bound identity is unchanged. Treat the event as a prompt to re-attest, not as proof of
      // tampering. A real unlink/rebind/chmod necessarily changes the socket or parent ctime/inode and is
      // still poisoned synchronously here as well as at every request/finalization boundary.
      try {
        if (rootIdentity(socketRoot) === socketRootIdentity
            && identity(directory, 'directory') === directoryIdentity
            && identity(socketPath, 'socket') === socketIdentity) return
      } catch { /* unsafe/missing identity is handled below */ }
      dirty = `${event}:${filename?.toString() || path.basename(socketPath)}`
      run.publicationError = `publication transport integrity failed: ${dirty}`
      run.publicationCompleted = false
      run.parityVerificationCompleted = false
      killProcessTree(run)
    })
    watcher.on('error', (error) => {
      if (closed) return
      dirty = dirty || `watch-error:${error.message}`
      run.publicationError = `publication transport integrity failed: ${dirty}`
      run.publicationCompleted = false
      run.parityVerificationCompleted = false
      killProcessTree(run)
    })
    watcher.unref?.()
    run.publicationTransportVerify = verify
    server.unref()
  } catch (error) {
    try { server.close() } catch { /* never listened */ }
    try { fs.unlinkSync(socketPath) } catch { /* absent */ }
    try { fs.rmdirSync(directory) } catch { /* absent/nonempty */ }
    throw error
  }
  return {
    socketPath,
    verify,
    close: () => {
      if (closed) return Promise.resolve()
      try { verify() } catch { /* integrity failure already poisoned the run */ }
      closed = true
      if (run.publicationTransportVerify === verify) run.publicationTransportVerify = undefined
      watcher?.close()
      watcher = null
      return new Promise<void>((resolve) => {
        const cleanup = () => {
          try { fs.unlinkSync(socketPath) } catch { /* already removed */ }
          try { fs.rmdirSync(directory) } catch { /* already removed */ }
          resolve()
        }
        try { server.close(cleanup) } catch { cleanup() }
      })
    },
  }
}

export interface SupervisorPublicationRequest {
  phase?: 'stamp' | 'archive' | 'commit' | 'intake-receipt' | 'attest' | 'verify-attestation'
  message?: string
  pathspecs?: string[]
  comparisonArtifact?: string
  freezeReceipt?: string
  receiptOutput?: string
  executedAgainstDecisionFingerprint?: string
}

interface QueuedPublicationIntent {
  id: string
  sequence: number
  queuedAt: number
  request: SupervisorPublicationRequest
}

const publicationIntentsByRun = new WeakMap<RunState, QueuedPublicationIntent[]>()
const publicationDrainRuns = new WeakSet<RunState>()
const MAX_PUBLICATION_INTENTS = 32

function assertLivePublicationCapability(runId: string, token: string): RunState {
  const run = getRun(runId)
  if (!run || run.endedAt !== undefined || !run.publicationToken
      || !publicationTokenMatches(run.publicationToken, token)) {
    throw Object.assign(new Error('invalid or expired publication capability'), { statusCode: 403 })
  }
  run.publicationTransportVerify?.()
  return run
}

/**
 * Child-time publication is intent capture only. The provider and every detached descendant still own
 * write access at this point, so stamping, archiving, Git, and calibration are forbidden here. The close
 * owner drains these requests only after proving the whole process group extinct.
 */
export async function queuePublicationIntent(
  runId: string,
  token: string,
  request: SupervisorPublicationRequest,
): Promise<Record<string, unknown>> {
  const run = assertLivePublicationCapability(runId, token)
  if (run.parityCanary && run.kind !== 'full') {
    throw Object.assign(new Error('only the terminal full canary may publish provider-parity artifacts'), { statusCode: 409 })
  }
  // Parity adjudication is a live read/attestation exchange, not a data publication. Its finalizer still
  // requires the supervisor-verified receipt, and no Git/stamping occurs in these two phases.
  if (request.phase === 'attest' || request.phase === 'verify-attestation') {
    return supervisePublication(runId, token, request)
  }
  if (request.phase === 'archive' && (run.swarmId !== 'commodity' || !run.runRoot
      || !['full', 'rerun'].includes(run.kind))) {
    throw Object.assign(new Error('commodity archive intent is valid only for a tracked terminal commodity run'), { statusCode: 409 })
  }
  if (request.phase === 'intake-receipt' && (run.swarmId !== 'commodity'
      || !intakeReceiptByRun.has(run) || !run.module || !run.agent
      || !request.executedAgainstDecisionFingerprint)) {
    throw Object.assign(new Error('commodity intake-receipt intent does not match this tracked rerun'), { statusCode: 409 })
  }
  if (request.phase !== undefined && !['commit', 'stamp', 'archive', 'intake-receipt'].includes(request.phase)) {
    throw Object.assign(new Error('unsupported publication intent phase'), { statusCode: 400 })
  }
  if (request.phase === 'commit' || request.phase === undefined) authorizedPublicationPaths(run, request.pathspecs)
  const intents = publicationIntentsByRun.get(run) ?? []
  if (intents.length >= MAX_PUBLICATION_INTENTS) {
    throw Object.assign(new Error('too many publication intents for one run'), { statusCode: 409 })
  }
  const id = randomUUID()
  intents.push({
    id,
    sequence: intents.length + 1,
    queuedAt: Date.now(),
    request: {
      ...request,
      pathspecs: request.pathspecs ? [...request.pathspecs] : undefined,
    },
  })
  publicationIntentsByRun.set(run, intents)
  run.publicationRequested = true
  const response: Record<string, unknown> = {
    ok: true,
    phase: 'queued',
    intentId: id,
    sequence: intents.length,
    output: `PUBLICATION_QUEUED=${id}`,
  }
  if (request.phase === 'archive') {
    const deferredId = `PENDING-${run.subjectId}-${run.runId.slice(0, 8)}`
    response.phase = 'archive'
    response.archiveDecision = {
      decisionId: deferredId,
      path: path.join(REPO_ROOT, run.runRoot!, 'decisions', deferredId, 'decision_record.json'),
      created: false,
      deferred: true,
    }
  }
  return response
}

/** Execute queued writes only after the caller has proved the detached provider group extinct. */
export async function drainPublicationIntents(run: RunState): Promise<void> {
  const intents = publicationIntentsByRun.get(run) ?? []
  if (!intents.length) {
    if (run.willCommitToMain) throw new Error('the provider exited without a queued terminal publication intent')
    return
  }
  const stamp = intents.find((intent) => intent.request.phase === 'stamp')
  const archive = intents.find((intent) => intent.request.phase === 'archive')
  const receiptIntent = intents.find((intent) => intent.request.phase === 'intake-receipt')
  const commits = intents.filter((intent) => !['stamp', 'archive', 'intake-receipt'].includes(intent.request.phase ?? 'commit'))
  if (stamp && (archive || receiptIntent || commits.length)) throw new Error('a stamp-only canary cannot also request a normal publication')
  if (!run.publicationToken) throw new Error('queued publication capability expired before terminal drain')
  publicationDrainRuns.add(run)
  try {
    if (stamp) {
      await supervisePublication(run.runId, run.publicationToken, stamp.request)
    } else {
    if (run.swarmId === 'commodity') {
      if (!archive) throw new Error('terminal commodity publication has no queued archive intent')
      await supervisePublication(run.runId, run.publicationToken, { phase: 'archive' })
      if (receiptIntent) {
        const bound = intakeReceiptByRun.get(run)
        if (!bound || !run.runRoot || !run.module || !run.agent) {
          throw new Error('queued commodity intake receipt lost its frozen launch binding')
        }
        const executed = receiptIntent.request.executedAgainstDecisionFingerprint
        if (!executed) throw new Error('queued commodity intake receipt has no executed-against fingerprint')
        const env = { ...process.env }
        for (const key of ['NOSTRA_COCKPIT_RUN', 'NOSTRA_PUBLICATION_ENDPOINT', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_PUBLICATION_SOCKET']) delete env[key]
        const result = await execa('python3', ['scripts/intake_execution_receipt.py', 'create',
          '--swarm', run.swarmId, '--subject', run.subjectId, '--run-root', run.runRoot,
          '--plan-path', bound.planPath, '--plan-sha256', bound.planSha256,
          '--source-decision-fingerprint', bound.sourceDecisionFingerprint,
          '--executed-against-decision-fingerprint', executed,
          '--module', run.module, '--agent', run.agent,
        ], { cwd: REPO_ROOT, env, reject: true })
        const receiptPath = /^INTAKE-RECEIPT: ([A-Za-z0-9._/-]+) sha256:[a-f0-9]{64}$/m.exec(result.stdout)?.[1]
        if (!receiptPath) throw new Error('supervisor commodity intake receipt returned no exact artifact')
        run.supervisorPublicationArtifacts = [...new Set([...(run.supervisorPublicationArtifacts ?? []), receiptPath])]
      }
    } else if (archive || receiptIntent) {
      throw new Error('archive/intake-receipt intents are commodity-only')
    }
    if (!commits.length) throw new Error('the provider exited without a queued terminal commit intent')
    const pathspecs = [...new Set(commits.flatMap((intent) => intent.request.pathspecs ?? []))]
    const terminal = [...commits].reverse().find((intent) =>
      !String(intent.request.message ?? '').startsWith('Checkpoint:')) ?? commits.at(-1)!
      await supervisePublication(run.runId, run.publicationToken, {
        phase: 'commit',
        message: terminal.request.message,
        pathspecs,
      })
    }
    publicationIntentsByRun.delete(run)
  } finally {
    publicationDrainRuns.delete(run)
  }
}

const DATA_PUBLICATION_ROOTS = new Set(['analyses', 'screener', 'commodity', 'watchlist'])
interface IssuedParityAttestation {
  runId: string
  manifestPath: string
  receiptSha256: string
  manifestSha256: string
  comparisonSha256: string
  freezeSha256: string
  pairedCanaries: Array<Record<string, unknown>>
  expiresAt: number
}
const issuedParityAttestations = new Map<string, IssuedParityAttestation>()
const PARITY_ATTESTATION_TTL_MS = 30 * 60_000

let postReviewCalibration: (run: RunState) => Promise<void> = async (run) => {
  const env: NodeJS.ProcessEnv = { ...process.env, ENGINE_REPO_ROOT: REPO_ROOT }
  for (const key of ['NOSTRA_COCKPIT_RUN', 'NOSTRA_PROVENANCE_MANIFEST', 'NOSTRA_PUBLICATION_ENDPOINT', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_PUBLICATION_SOCKET']) delete env[key]
  if (run.swarmId === RESEARCH_SWARM_ID) {
    await execa('bash', [path.join(REPO_ROOT, 'scripts', 'ops', 'calibrate-local.sh'), 'post-review'], {
      cwd: REPO_ROOT, env, reject: true, timeout: 20 * 60_000,
    })
    return
  }
  const calibrator = swarmById(run.swarmId)?.calibrator
  if (!calibrator) throw new Error(`swarm '${run.swarmId}' has no deterministic calibrator declaration`)
  const result = await execa('python3', [path.join(REPO_ROOT, calibrator)], {
    cwd: REPO_ROOT, env, reject: true, timeout: 20 * 60_000,
  })
  const paths = result.stdout.split('\n').flatMap((line) => {
    const match = /^WROTE ([A-Za-z0-9._/-]+)$/.exec(line.trim())
    return match ? [match[1]] : []
  })
  if (!paths.length) throw new Error(`swarm '${run.swarmId}' calibrator reported no exact output paths`)
  const calibrationRoot = swarmById(run.swarmId)?.calibrationRoot
  if (!calibrationRoot) throw new Error(`swarm '${run.swarmId}' has no deterministic calibration output root`)
  const root = path.resolve(REPO_ROOT, calibrationRoot)
  const safe = [...new Set(paths.map((relative) => {
    if (path.isAbsolute(relative) || relative.includes('\\') || path.posix.normalize(relative) !== relative) {
      throw new Error(`calibrator reported unsafe output path: ${relative}`)
    }
    const absolute = path.resolve(REPO_ROOT, relative)
    if (absolute === root || !absolute.startsWith(`${root}${path.sep}`)) {
      throw new Error(`calibrator output escapes declared calibration root: ${relative}`)
    }
    assertRegularArtifact(absolute, 'deterministic calibration output')
    return path.relative(REPO_ROOT, absolute).split(path.sep).join('/')
  }))]
  const snapshot = createPublicationSnapshot(run, safe, safe)
  env.NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST = snapshot.manifest
  try {
    const output = await supervisorCommitter(`Calibrate ${run.swarmId}: post-${run.kind}`, snapshot.paths, env)
    await supervisorCommitVerifier(output, snapshot.paths, snapshot.hashes)
  } finally {
    snapshot.cleanup()
  }
}

type SupervisorCommitter = (message: string, pathspecs: string[], env: NodeJS.ProcessEnv) => Promise<string>
let supervisorCommitter: SupervisorCommitter = async (message, pathspecs, env) => {
  const result = await execa('bash', [path.join(REPO_ROOT, 'scripts', 'commit-run.sh'), message, '--', ...pathspecs], {
    cwd: REPO_ROOT, env, reject: true, timeout: 20 * 60_000,
  })
  return result.stdout
}
type PublicationAuthoritySealer = (run: RunState) => void
let publicationAuthoritySealer: PublicationAuthoritySealer = releaseExecutionEpochAfterPublication

type SupervisorCommitVerifier = (
  output: string, requiredPaths: string[], fixedHashes?: Record<string, string>,
) => Promise<void>
let supervisorCommitVerifier: SupervisorCommitVerifier = async (output, requiredPaths, fixedHashes) => {
  const reported = /(?:^|\n)COMMIT_SHA=([0-9a-f]{40}|[0-9a-f]{64})(?:\n|$)/.exec(output)?.[1]
  const noop = /(?:^|\n)NOOP=1(?:\n|$)/.test(output)
  if (!reported && !noop) throw new Error('commit-run returned no verifiable commit identity')
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
  const commit = reported || head
  if (commit !== head) throw new Error('published commit identity does not match repository HEAD')
  for (const relative of requiredPaths) {
    const expected = fixedHashes?.[relative]?.replace(/^sha256:/, '')
    if (!expected) throw new Error(`publication verifier has no fixed precommit hash: ${relative}`)
    let committed: Buffer
    try {
      committed = execFileSync('git', ['show', `${commit}:${relative}`], {
        cwd: REPO_ROOT, encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024,
      })
    } catch { throw new Error(`published commit omitted required artifact: ${relative}`) }
    if (createHash('sha256').update(committed).digest('hex') !== expected) {
      throw new Error(`published commit bytes differ from the supervisor-verified artifact: ${relative}`)
    }
  }
}

function verifiedPublishedRevision(output: string): string {
  const reported = /(?:^|\n)COMMIT_SHA=([0-9a-f]{40}|[0-9a-f]{64})(?:\n|$)/.exec(output)?.[1]
  if (reported) return reported
  if (!/(?:^|\n)NOOP=1(?:\n|$)/.test(output)) throw new Error('publication has no verified revision')
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

function nulPaths(value: Buffer): string[] {
  return value.toString('utf8').split('\0').filter(Boolean)
}

function createPublicationSnapshot(run: RunState, pathspecs: string[], requiredPaths: string[]): {
  manifest: string; directory: string; paths: string[]
  entries: Array<{ path: string; snapshot: string; sha256: string }>
  hashes: Record<string, string>; cleanup: () => void
} {
  const deleted = nulPaths(execFileSync('git', [
    'diff', '--name-only', '-z', '--diff-filter=D', 'HEAD', '--', ...pathspecs,
  ], { cwd: REPO_ROOT, encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] }))
  if (deleted.length) throw new Error(`cockpit publication cannot delete terminal data: ${deleted[0]}`)
  const changed = nulPaths(execFileSync('git', [
    'diff', '--name-only', '-z', '--diff-filter=ACMRT', 'HEAD', '--', ...pathspecs,
  ], { cwd: REPO_ROOT, encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] }))
  const untracked = nulPaths(execFileSync('git', [
    'ls-files', '--others', '--exclude-standard', '-z', '--', ...pathspecs,
  ], { cwd: REPO_ROOT, encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] }))
  const paths = [...new Set([...changed, ...untracked, ...requiredPaths])].sort()
  if (!paths.length) throw new Error('cockpit publication resolved to no exact files')
  const directory = fs.mkdtempSync(path.join(STATE_DIR, 'publication-snapshot-'))
  fs.chmodSync(directory, 0o700)
  const entries: Array<{ path: string; snapshot: string; sha256: string }> = []
  try {
    for (const [index, relative] of paths.entries()) {
      if (!DATA_PUBLICATION_ROOTS.has(relative.split('/')[0])) throw new Error(`snapshot refused non-data path: ${relative}`)
      const absolute = path.join(REPO_ROOT, relative)
      const before = assertRegularArtifact(absolute, 'fixed publication artifact')
      const bytes = fs.readFileSync(absolute)
      const after = assertRegularArtifact(absolute, 'fixed publication artifact')
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
          || before.mtimeMs !== after.mtimeMs) throw new Error(`publication artifact changed while frozen: ${relative}`)
      const snapshot = path.join(directory, String(index))
      fs.writeFileSync(snapshot, bytes, { flag: 'wx', mode: 0o600 })
      entries.push({ path: relative, snapshot, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}` })
    }
    const manifest = path.join(directory, 'manifest.json')
    fs.writeFileSync(manifest, JSON.stringify({
      schema_version: 'cockpit-publication-snapshot/1.0', run_id: run.runId,
      requested_pathspecs: paths, entries,
    }, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
    return {
      manifest, directory, paths, entries,
      hashes: Object.fromEntries(entries.map((entry) => [entry.path, entry.sha256])),
      cleanup: () => fs.rmSync(directory, { recursive: true, force: true }),
    }
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true })
    throw error
  }
}

type ReadyPublicationStage = 'primary-ready' | 'backfill-ready'
interface ReadyPublicationRecord {
  schema_version: 'cockpit-publication-ready/1.0'
  run_id: string
  run_root: string
  subject: string
  swarm: string
  kind: RunKind
  provider: RunProvider
  profile_key: string
  model: string
  reasoning_level?: string
  execution_profile: ProviderExecutionProfile
  stage: ReadyPublicationStage
  message: string
  snapshot_manifest: string
  snapshot_manifest_sha256: string
  paths: string[]
  artifact_hashes: Record<string, string>
  primary_commit_sha?: string
  created_at: string
  self_sha256: string
}

const readyPublicationDir = path.join(STATE_DIR, 'publication-ready')
const readyPublicationPath = (runId: string) => path.join(readyPublicationDir, `${runId}.json`)
const readyPublicationDigest = (value: Omit<ReadyPublicationRecord, 'self_sha256'>): string =>
  `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`

function syncDirectory(directory: string): void {
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(directory, fs.constants.O_RDONLY)
    fs.fsyncSync(descriptor)
  } catch { /* the file fsync + atomic rename remain the primary durability boundary */ }
  finally { if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ } }
}

function writeReadyPublication(
  run: RunState,
  snapshot: ReturnType<typeof createPublicationSnapshot>,
  message: string,
  stage: ReadyPublicationStage,
  artifactHashes: Record<string, string>,
  primaryCommitSha?: string,
): ReadyPublicationRecord {
  if (!run.runRoot || !/^[0-9a-f-]{36}$/.test(run.runId)) throw new Error('ready publication has no canonical run identity')
  const manifestInfo = assertRegularArtifact(snapshot.manifest, 'ready publication snapshot manifest')
  if (manifestInfo.mode & 0o077 || path.dirname(snapshot.manifest) !== snapshot.directory
      || !snapshot.directory.startsWith(`${path.resolve(STATE_DIR)}${path.sep}`)) {
    throw new Error('ready publication snapshot is outside protected supervisor state')
  }
  const unsigned: Omit<ReadyPublicationRecord, 'self_sha256'> = {
    schema_version: 'cockpit-publication-ready/1.0', run_id: run.runId, run_root: run.runRoot,
    subject: run.subjectId, swarm: run.swarmId, kind: run.kind, provider: run.provider,
    profile_key: run.profileKey, model: run.model, reasoning_level: run.reasoningLevel,
    execution_profile: run.executionProfile, stage, message,
    snapshot_manifest: snapshot.manifest,
    snapshot_manifest_sha256: fileSha256(snapshot.manifest),
    paths: [...snapshot.paths], artifact_hashes: { ...artifactHashes },
    ...(primaryCommitSha ? { primary_commit_sha: primaryCommitSha } : {}),
    created_at: new Date().toISOString(),
  }
  const record: ReadyPublicationRecord = { ...unsigned, self_sha256: readyPublicationDigest(unsigned) }
  fs.mkdirSync(readyPublicationDir, { recursive: true, mode: 0o700 })
  fs.chmodSync(readyPublicationDir, 0o700)
  const target = readyPublicationPath(run.runId)
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600)
    fs.writeFileSync(descriptor, `${JSON.stringify(record, null, 2)}\n`)
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    fs.renameSync(temporary, target)
    syncDirectory(readyPublicationDir)
  } finally {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ }
    try { fs.rmSync(temporary, { force: true }) } catch { /* best effort */ }
  }
  return record
}

function readReadyPublication(absolute: string): ReadyPublicationRecord | null {
  let descriptor: number | null = null
  try {
    // Open first with NOFOLLOW, then compare the descriptor to the directory entry. This closes the
    // lstat -> open replacement window while still allowing another recovery worker to atomically finish
    // and unlink the receipt between readdir() and this read.
    descriptor = fs.openSync(absolute,
      fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const info = fs.fstatSync(descriptor)
    const current = fs.lstatSync(absolute)
    const uid = process.getuid?.()
    if (!info.isFile() || current.isSymbolicLink() || current.dev !== info.dev || current.ino !== info.ino
        || (info.mode & 0o077) !== 0 || (uid !== undefined && info.uid !== uid)
        || fs.realpathSync(absolute) !== absolute || info.size <= 0 || info.size > 1024 * 1024) {
      throw new Error('unsafe ready-publication receipt')
    }
    const value = JSON.parse(fs.readFileSync(descriptor, 'utf8')) as ReadyPublicationRecord
    if (value.schema_version !== 'cockpit-publication-ready/1.0'
        || !/^[0-9a-f-]{36}$/.test(value.run_id) || path.basename(absolute) !== `${value.run_id}.json`
        || !value.run_root || !value.subject || !value.swarm || !['claude', 'codex'].includes(value.provider)
        || !['primary-ready', 'backfill-ready'].includes(value.stage)
        || !value.profile_key || !value.model || !value.execution_profile
        || !Array.isArray(value.paths) || !value.paths.length
        || !value.artifact_hashes || typeof value.artifact_hashes !== 'object'
        || typeof value.self_sha256 !== 'string') throw new Error('invalid ready-publication receipt')
    const { self_sha256, ...unsigned } = value
    if (readyPublicationDigest(unsigned) !== self_sha256) throw new Error('ready-publication receipt digest mismatch')
    const manifest = path.resolve(value.snapshot_manifest)
    const state = path.resolve(STATE_DIR)
    if (!manifest.startsWith(`${state}${path.sep}`) || fileSha256(manifest) !== value.snapshot_manifest_sha256) {
      throw new Error('ready-publication snapshot manifest is missing or changed')
    }
    const manifestValue = JSON.parse(fs.readFileSync(manifest, 'utf8')) as Record<string, any>
    if (manifestValue.schema_version !== 'cockpit-publication-snapshot/1.0'
        || manifestValue.run_id !== value.run_id || !Array.isArray(manifestValue.entries)) {
      throw new Error('ready-publication snapshot manifest contract mismatch')
    }
    const entries = manifestValue.entries as Array<Record<string, unknown>>
    const paths = entries.map((entry) => entry.path)
    if (!isDeepStrictEqual(paths, value.paths)) throw new Error('ready-publication path list disagrees with its snapshot')
    for (const entry of entries) {
      if (typeof entry.path !== 'string' || typeof entry.snapshot !== 'string' || typeof entry.sha256 !== 'string'
          || value.artifact_hashes[entry.path] !== entry.sha256) {
        throw new Error('ready-publication entry disagrees with its bound hashes')
      }
      const snapshot = path.resolve(entry.snapshot)
      if (path.dirname(snapshot) !== path.dirname(manifest)) throw new Error('ready-publication entry escapes its snapshot directory')
      const snapshotInfo = assertRegularArtifact(snapshot, 'ready publication snapshot entry')
      if (snapshotInfo.mode & 0o077 || fileSha256(snapshot) !== entry.sha256) {
        throw new Error('ready-publication snapshot entry changed')
      }
    }
    return value
  } catch (error: any) {
    // Atomic absence is a successful hand-off to the worker that already consumed this exact receipt.
    // An entry that still exists but is malformed, replaced, inaccessible, or has lost its snapshot is
    // not a race: preserve the existing fail-closed behavior and surface it.
    try { fs.lstatSync(absolute) } catch (current: any) {
      if (current?.code === 'ENOENT') return null
      throw error
    }
    throw error
  } finally {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ }
  }
}

function clearReadyPublication(record: ReadyPublicationRecord): void {
  const target = readyPublicationPath(record.run_id)
  const current = readReadyPublication(target)
  if (!current) return // another recovery owner atomically consumed this exact receipt
  if (current.self_sha256 !== record.self_sha256) throw new Error('a newer ready publication replaced this receipt')
  try { fs.unlinkSync(target) } catch (error: any) {
    if (error?.code === 'ENOENT') return
    throw error
  }
  syncDirectory(readyPublicationDir)
  fs.rmSync(path.dirname(record.snapshot_manifest), { recursive: true, force: true })
}

function retainPublicationSnapshot(
  run: RunState,
  snapshot: ReturnType<typeof createPublicationSnapshot>,
): void {
  if (run.publicationSnapshot) throw new Error('run already retains a terminal publication snapshot')
  run.publicationSnapshot = {
    directory: snapshot.directory,
    entries: snapshot.entries.map((entry) => ({ ...entry })),
  }
}

/**
 * Called only after the detached provider group is gone. A post-commit writer race is a failed run, but
 * leaving its corrupt worktree bytes behind would poison resume/read paths. Restore the exact committed
 * supervisor snapshot atomically while retaining the failure signal.
 */
function settlePublicationSnapshot(run: RunState): string | null {
  const retained = run.publicationSnapshot
  if (!retained) return null
  let failure: string | null = null
  try {
    const changed: string[] = []
    for (const [index, entry] of retained.entries.entries()) {
      const snapshotInfo = assertRegularArtifact(entry.snapshot, 'retained supervisor publication snapshot')
      if (path.dirname(entry.snapshot) !== retained.directory || snapshotInfo.mode & 0o077) {
        throw new Error(`retained publication snapshot identity is unsafe: ${entry.path}`)
      }
      const bytes = fs.readFileSync(entry.snapshot)
      if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== entry.sha256) {
        throw new Error(`retained publication snapshot digest changed: ${entry.path}`)
      }
      const absolute = path.resolve(REPO_ROOT, entry.path)
      if (!absolute.startsWith(`${path.resolve(REPO_ROOT)}${path.sep}`)
          || !DATA_PUBLICATION_ROOTS.has(entry.path.split('/')[0])) {
        throw new Error(`retained publication snapshot escaped data roots: ${entry.path}`)
      }
      let current = ''
      try {
        assertRegularArtifact(absolute, 'published terminal artifact')
        current = `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}`
      } catch { /* missing/symlink/special is drift and is replaced below */ }
      if (current === entry.sha256) continue
      changed.push(entry.path)
      const parent = path.dirname(absolute)
      const parentInfo = fs.lstatSync(parent)
      if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink() || fs.realpathSync(parent) !== parent) {
        throw new Error(`cannot restore published artifact through unsafe parent: ${entry.path}`)
      }
      const temporary = path.join(parent, `.nostra-restore-${run.runId}-${index}.tmp`)
      const descriptor = fs.openSync(
        temporary,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
        0o600,
      )
      try { fs.writeFileSync(descriptor, bytes); fs.fsyncSync(descriptor) } finally { fs.closeSync(descriptor) }
      try { fs.renameSync(temporary, absolute) } catch (error) {
        try { fs.unlinkSync(temporary) } catch { /* absent */ }
        throw error
      }
    }
    if (changed.length) failure = `published terminal artifact changed after supervisor commit: ${changed[0]}`
  } catch (error: any) {
    failure = `published terminal artifact could not be restored safely: ${String(error?.message || error)}`
  } finally {
    fs.rmSync(retained.directory, { recursive: true, force: true })
    run.publicationSnapshot = undefined
  }
  if (failure) {
    run.publicationCompleted = false
    run.publicationError = failure
  }
  return failure
}

/** Focused test seam; the production hook runs deterministic Python and never starts another model. */
export function __setPostReviewCalibration(fn: (run: RunState) => Promise<void>): (run: RunState) => Promise<void> {
  const previous = postReviewCalibration
  postReviewCalibration = fn
  return previous
}

/** Focused publication test seam; production remains the serialized commit-run helper above. */
export function __setSupervisorCommitter(fn: SupervisorCommitter): SupervisorCommitter {
  const previous = supervisorCommitter
  supervisorCommitter = fn
  return previous
}

/** Focused test seam for post-commit HEAD/blob verification. */
export function __setSupervisorCommitVerifier(fn: SupervisorCommitVerifier): SupervisorCommitVerifier {
  const previous = supervisorCommitVerifier
  supervisorCommitVerifier = fn
  return previous
}

/** Focused crash-injection seam at the post-commit/pre-authority durability boundary. */
export function __setPublicationAuthoritySealer(fn: PublicationAuthoritySealer): PublicationAuthoritySealer {
  const previous = publicationAuthoritySealer
  publicationAuthoritySealer = fn
  return previous
}
const firstWildcard = (value: string) => {
  const indexes = ['*', '?', '['].map((token) => value.indexOf(token)).filter((index) => index >= 0)
  return indexes.length ? value.slice(0, Math.min(...indexes)) : value
}

function authorizedPublicationPaths(run: RunState, raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 32) throw new Error('publication needs 1-32 pathspecs')
  const authorized = [
    ...(run.runRoot ? [path.resolve(REPO_ROOT, run.runRoot)] : []),
    ...run.writeTargetsAbs.map((value) => path.resolve(value)),
  ]
  const result: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string' || !item.trim() || item.length > 500) throw new Error('invalid publication pathspec')
    const value = item.trim().replace(/\/$/, '')
    if (path.isAbsolute(value) || value.includes('\\') || value.split('/').includes('..') || value.startsWith('-')) {
      throw new Error(`unsafe publication pathspec: ${value}`)
    }
    const root = value.split('/')[0]
    if (!DATA_PUBLICATION_ROOTS.has(root)) throw new Error(`non-data publication pathspec: ${value}`)
    const stablePrefix = firstWildcard(value).replace(/\/$/, '')
    const requested = path.resolve(REPO_ROOT, stablePrefix || root)
    const overlaps = authorized.some((target) => requested === target
      || requested.startsWith(`${target}${path.sep}`))
    if (run.kind === 'review' && firstWildcard(value) !== value) {
      throw new Error('tracked reviews must publish exact files; wildcard review commits are forbidden')
    }
    if (run.kind === 'review') {
      const runRoot = run.runRoot?.replace(/\/$/, '')
      const prefix = runRoot ? `${runRoot}/reviews/` : ''
      const name = prefix && value.startsWith(prefix) ? value.slice(prefix.length) : ''
      const relative = name ? `reviews/${name}` : ''
      if (!name || name.includes('/') || !/^[A-Za-z0-9._-]+\.(?:json|md)$/.test(name)) {
        throw new Error(`tracked reviews may publish only exact files created in ${runRoot || 'the run root'}/reviews`)
      }
      if (Object.prototype.hasOwnProperty.call(run.publicationBaselines ?? {}, relative)) {
        throw new Error(`tracked reviews are append-only and cannot overwrite a pre-existing file: ${value}`)
      }
      assertRegularArtifact(path.join(REPO_ROOT, value), 'new review publication artifact')
    }
    const narrowTrackBatch = run.kind === 'track'
      && /^analyses\/tracking\/[0-9]{4}-[0-9]{2}-[0-9]{2}_calls_tracker[^/]*$/.test(value)
    if (!overlaps && !narrowTrackBatch) {
      throw new Error(`pathspec is outside this run's publication scope: ${value}`)
    }
    if (!result.includes(value)) result.push(value)
  }
  return result
}

function dataArtifactPath(raw: unknown, label: string, mustExist: boolean): string {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 1000) throw new Error(`${label} is missing or invalid`)
  const absolute = path.resolve(REPO_ROOT, raw.trim())
  const relative = path.relative(REPO_ROOT, absolute).split(path.sep).join('/')
  if (!relative || relative.startsWith('../') || path.isAbsolute(relative)
      || !DATA_PUBLICATION_ROOTS.has(relative.split('/')[0])) throw new Error(`${label} is outside the research-data lane`)
  if (mustExist) {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink() || fs.realpathSync(absolute) !== absolute) {
      throw new Error(`${label} must be one non-symlink regular file`)
    }
  } else {
    if (fs.existsSync(absolute) || fs.lstatSync(path.dirname(absolute)).isSymbolicLink()
        || fs.realpathSync(path.dirname(absolute)) !== path.dirname(absolute)) {
      throw new Error(`${label} must be a new file under a real research-data directory`)
    }
  }
  return absolute
}

const fileSha256 = (absolute: string): string => `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}`
const canonicalJson = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(',')}}`
}
const jsonSha256 = (value: unknown): string => `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`

function readJsonObject(absolute: string, label: string): Record<string, any> {
  try {
    const value = JSON.parse(fs.readFileSync(absolute, 'utf8'))
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object')
    return value
  } catch (error: any) {
    throw new Error(`${label} is not valid JSON: ${error?.message || error}`)
  }
}

function recomputeInitialParityComparison(
  freeze: string,
  freezeValue: Record<string, any>,
  supervisorRows: Record<string, Array<Record<string, unknown>>>,
): Record<string, any> {
  const runs = Array.isArray(freezeValue.runs) ? freezeValue.runs : []
  const runA = runs.find((item: any) => item?.label === 'run_a')
  const runB = runs.find((item: any) => item?.label === 'run_b')
  if (!runA || !runB) throw new Error('freezeReceipt does not contain the exact run_a/run_b pair')
  const resolveRun = (item: any) => path.resolve(path.dirname(freeze), String(item.run_root || ''))
  const pairA = resolveRun(runA)
  const pairB = resolveRun(runB)
  const code = [
    'import json,sys',
    'from pathlib import Path',
    'from scripts.compare_provider_runs import compare_run_roots',
    'p=json.load(sys.stdin)',
    'rows=p["supervisor_rows"]',
    'def loader(root): return rows.get(str(Path(root).resolve()), [])',
    'report,status=compare_run_roots(p["run_a"],p["run_b"],label_a="Claude",label_b="Codex",freeze_manifest_path=p["freeze"],require_freeze_manifest=True,supervisor_receipt_loader=loader)',
    'print(json.dumps(report,ensure_ascii=False,sort_keys=True,separators=(",",":")))',
    'raise SystemExit(status)',
  ].join('\n')
  let stdout = ''
  try {
    stdout = execFileSync('python3', ['-c', code], {
      cwd: REPO_ROOT, encoding: 'utf8',
      input: JSON.stringify({ run_a: pairA, run_b: pairB, freeze, supervisor_rows: supervisorRows }),
      stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024,
    })
  } catch (error: any) {
    // Exit 2 (adjudication required) and 3 (deterministic blocker) still produce the immutable initial
    // report. Input/gate failures do not qualify for a runtime attestation.
    if (![2, 3].includes(Number(error?.status)) || typeof error?.stdout !== 'string') {
      throw new Error('the supervisor could not reproduce the initial provider-parity comparison')
    }
    stdout = error.stdout
  }
  return readJsonObjectFromText(stdout, 'recomputed initial comparison')
}

function readJsonObjectFromText(raw: string, label: string): Record<string, any> {
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object')
    return value
  } catch (error: any) {
    throw new Error(`${label} is not valid JSON: ${error?.message || error}`)
  }
}

function liveParityCanaryAuthority(
  adjudicator: RunState,
  freezePath: string,
  freezeValue: Record<string, any>,
): Array<{ attestation: Record<string, unknown>; root: string; rows: Array<Record<string, unknown>> }> {
  const adjudicatorBinding = adjudicator.parityPrelaunchBinding as Record<string, any> | undefined
  if (!adjudicatorBinding) throw new Error('parity adjudicator has no live pair registration')
  const declared = Array.isArray(freezeValue.runs) ? freezeValue.runs : []
  if (declared.length !== 2) throw new Error('freeze receipt does not declare exactly two canary runs')
  return declared.map((item: any) => {
    const absoluteRoot = path.resolve(path.dirname(freezePath), String(item.run_root || ''))
    const relativeRoot = path.relative(REPO_ROOT, absoluteRoot).split(path.sep).join('/')
    if (relativeRoot.startsWith('../') || path.isAbsolute(relativeRoot)) throw new Error('parity canary root escapes the repository')
    const candidates = listRuns().filter((candidate) => candidate.kind === 'full'
      && candidate.runRoot === relativeRoot && candidate.provider === item.provider
      && candidate.status === 'done' && candidate.publicationCompleted === true)
    if (candidates.length !== 1) {
      throw new Error(`parity canary ${item.label || item.provider} has no unique completed run in this live supervisor`)
    }
    const candidate = candidates[0]
    const binding = candidate.parityPrelaunchBinding as Record<string, any> | undefined
    if (!binding || binding.supervisor_instance_id !== adjudicatorBinding.supervisor_instance_id
        || binding.pair_registration_id !== adjudicatorBinding.pair_registration_id
        || binding.freeze_receipt_sha256 !== adjudicatorBinding.freeze_receipt_sha256) {
      throw new Error(`parity canary ${item.label || item.provider} was not registered by this live supervisor pair`)
    }
    const rows = candidate.currentExecutionAttempts ?? []
    const recorded = rows.filter((row) => row.attribution === 'recorded' && row.decision_author === true
      && row.role === 'terminal_adjudicator' && row.provider === candidate.provider)
    if (recorded.length !== 1 || !recorded[0].parity_prelaunch || !recorded[0].parity_publication) {
      throw new Error(`parity canary ${item.label || item.provider} lacks one canonical prelaunch/publication attempt`)
    }
    if (recorded[0].model !== item.expected_model || recorded[0].reasoning_level !== item.expected_reasoning_level
        || recorded[0].profile_key !== item.expected_profile_key) {
      throw new Error(`parity canary ${item.label || item.provider} runtime profile differs from the freeze binding`)
    }
    const artifacts = decisionArtifacts(candidate).map((relative) => `${relativeRoot}/${relative}`)
    if (!artifacts.length) throw new Error(`parity canary ${item.label || item.provider} has no terminal artifact`)
    for (const relative of artifacts) {
      const absolute = path.join(REPO_ROOT, relative)
      assertRegularArtifact(absolute, 'live parity canary terminal artifact')
      const current = `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}`
      if (candidate.publicationArtifactHashes?.[relative] !== current) {
        throw new Error(`parity canary ${item.label || item.provider} changed after supervisor publication`)
      }
    }
    try {
      execFileSync('python3', ['scripts/execution_provenance.py', 'verify', '--manifest', '-', '--repo-root', REPO_ROOT,
        ...artifacts.flatMap((relative) => ['--repo-artifact', relative])], {
        cwd: REPO_ROOT, input: canonicalManifestJsonl(candidate), encoding: 'utf8', stdio: ['pipe', 'ignore', 'ignore'],
      })
    } catch {
      throw new Error(`parity canary ${item.label || item.provider} terminal provenance no longer matches supervisor state`)
    }
    const manifestPath = canonicalManifestPath(candidate)
    const attestation = {
      label: item.label,
      run_id: candidate.runId,
      run_root: relativeRoot,
      provider: candidate.provider,
      attempt_id: recorded[0].attempt_id,
      attempt_sha256: jsonSha256(recorded[0]),
      manifest_sha256: fileSha256(manifestPath),
      terminal_artifacts: artifacts.map((relative) => ({ path: relative, sha256: candidate.publicationArtifactHashes![relative] })),
      supervisor_instance_id: binding.supervisor_instance_id,
      pair_registration_id: binding.pair_registration_id,
    }
    const receiptRelative = receiptPath(candidate)
    const canonicalRows = rows.map((row) => ({
      ...row,
      ...(receiptRelative ? { _committed_receipt_path: receiptRelative } : {}),
    }))
    return { attestation, root: absoluteRoot, rows: canonicalRows }
  })
}

function issueParityAttestation(run: RunState, request: SupervisorPublicationRequest): {
  ok: true; phase: 'attest'; receiptPath: string; receiptSha256: string; attempt: Record<string, unknown>
} {
  run.publicationTransportVerify?.()
  if ((run.publicationPhase ?? 'open') !== 'open') throw new Error('parity attestation phase was already consumed')
  if (run.kind !== 'parity') {
    throw new Error('runtime parity attestations are available only to a tracked parity adjudication run')
  }
  const comparison = dataArtifactPath(request.comparisonArtifact, 'comparisonArtifact', true)
  const freeze = dataArtifactPath(request.freezeReceipt, 'freezeReceipt', true)
  const output = dataArtifactPath(request.receiptOutput, 'receiptOutput', false)
  const withinWriteScope = (absolute: string) => run.writeTargetsAbs.some((target) => {
    const resolved = path.resolve(target)
    return absolute === resolved || absolute.startsWith(`${resolved}${path.sep}`)
  })
  if (!withinWriteScope(comparison) || !withinWriteScope(output)) {
    throw new Error('parity comparison and execution receipt must stay inside this run\'s exact output scope')
  }
  const comparisonValue = readJsonObject(comparison, 'comparisonArtifact')
  const freezeValue = readJsonObject(freeze, 'freezeReceipt')
  const prelaunch = run.parityPrelaunchBinding as Record<string, any> | undefined
  if (!prelaunch) throw new Error('this attempt has no supervisor-verified provider-parity prelaunch binding')
  attestParitySnapshotAtPublication(run)
  const boundFreeze = path.isAbsolute(prelaunch.freeze_receipt_path)
    ? path.resolve(prelaunch.freeze_receipt_path)
    : path.resolve(REPO_ROOT, prelaunch.freeze_receipt_path)
  const boundInput = path.isAbsolute(prelaunch.binding_path)
    ? path.resolve(prelaunch.binding_path)
    : path.resolve(REPO_ROOT, prelaunch.binding_path)
  if (freeze !== boundFreeze || fileSha256(freeze) !== prelaunch.freeze_receipt_file_sha256) {
    throw new Error('freezeReceipt is not the exact receipt registered before provider launch')
  }
  const bindingBytes = fs.readFileSync(boundInput)
  try {
    execFileSync('python3', ['-c', [
      'import json,sys',
      'from scripts.provider_parity_freeze import validate_against_schema,RUN_BINDING_SCHEMA_PATH,FREEZE_SCHEMA_PATH,receipt_digest',
      'v=json.load(sys.stdin)',
      'validate_against_schema(v["binding"],RUN_BINDING_SCHEMA_PATH,label="run binding")',
      'validate_against_schema(v["freeze"],FREEZE_SCHEMA_PATH,label="freeze receipt")',
      'assert receipt_digest(v["freeze"]) == v["freeze"]["receipt_sha256"]',
    ].join(';')], {
      cwd: REPO_ROOT,
      input: JSON.stringify({ binding: JSON.parse(bindingBytes.toString('utf8')), freeze: freezeValue }),
      encoding: 'utf8', stdio: ['pipe', 'ignore', 'ignore'],
    })
  } catch {
    throw new Error('the bound provider-parity binding/freeze contracts no longer validate')
  }
  if (fileSha256(boundInput) !== prelaunch.binding_file_sha256
      || freezeValue.receipt_sha256 !== prelaunch.freeze_receipt_sha256) {
    throw new Error('the bound provider-parity input or freeze self-digest changed')
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(comparisonValue.comparison_id || '')) {
    throw new Error('comparisonArtifact has no canonical comparison_id')
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(freezeValue.receipt_sha256 || '')) {
    throw new Error('freezeReceipt has no canonical self-digest')
  }
  const liveCanaries = liveParityCanaryAuthority(run, freeze, freezeValue)
  const supervisorRows = Object.fromEntries(liveCanaries.map((item) => [item.root, item.rows]))
  const expectedComparison = recomputeInitialParityComparison(freeze, freezeValue, supervisorRows)
  if (!isDeepStrictEqual(comparisonValue, expectedComparison)) {
    throw new Error('comparisonArtifact is not the immutable initial comparison for the bound parity pair')
  }
  // A checked-in/worktree receipt is evidence, not authority: a provider with Bash can make a raw git
  // commit. Bind both completed canaries to their still-live supervisor RunState and canonical manifests;
  // any restart, missing side, profile mismatch, post-publication edit, or pair-id mismatch fails closed.
  const pairedCanaries = liveCanaries.map((item) => item.attestation)
  const rows = run.executionAttempts ?? []
  let index = -1
  for (let candidate = rows.length - 1; candidate >= 0; candidate--) {
    if (rows[candidate].attempt_id === run.runId && rows[candidate].attribution === 'recorded') {
      index = candidate
      break
    }
  }
  if (index < 0) throw new Error('the supervisor has no recorded current attempt to attest')
  const row = rows[index]
  if (row.role !== 'terminal_adjudicator' || row.decision_author !== true || row.provider !== run.provider) {
    throw new Error('the current parity attempt is not the supervisor-recorded terminal adjudicator')
  }
  const required = ['attempt_id', 'provider', 'model', 'reasoning_level', 'profile_key', 'started_at'] as const
  if (required.some((key) => typeof row[key] !== 'string' || !(row[key] as string).trim())) {
    throw new Error('the recorded current attempt is missing provider/model/profile identity')
  }
  const attempt = {
    ...Object.fromEntries(required.map((key) => [key, row[key]])),
    kind: run.kind,
    role: row.role,
    decision_author: true,
  }
  const manifestPath = canonicalManifestPath(run)
  const manifestSha256 = fileSha256(manifestPath)
  const receipt = {
    schema_version: 'provider-parity-adjudication-execution/1.0',
    issued_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    comparison_id: comparisonValue.comparison_id,
    comparison_artifact: { path: comparison, sha256: fileSha256(comparison) },
    freeze_receipt: { path: freeze, sha256: fileSha256(freeze), receipt_sha256: freezeValue.receipt_sha256 },
    attempt,
    runtime_provenance: {
      manifest_path: manifestPath,
      manifest_sha256: manifestSha256,
      attempt_locator: `jsonl:${index + 1}`,
      attempt_sha256: jsonSha256(row),
      paired_canaries: pairedCanaries,
    },
  }
  const rendered = `${JSON.stringify(receipt, null, 2)}\n`
  const descriptor = fs.openSync(output, 'wx', 0o444)
  try { fs.writeFileSync(descriptor, rendered); fs.fsyncSync(descriptor) } finally { fs.closeSync(descriptor) }
  const issued = {
    runId: run.runId,
    manifestPath,
    receiptSha256: fileSha256(output),
    manifestSha256,
    comparisonSha256: receipt.comparison_artifact.sha256,
    freezeSha256: receipt.freeze_receipt.sha256,
    pairedCanaries,
    expiresAt: Date.now() + PARITY_ATTESTATION_TTL_MS,
  }
  run.publicationTransportVerify?.()
  issuedParityAttestations.set(output, issued)
  run.publicationPhase = 'parity-attested'
  return { ok: true, phase: 'attest', receiptPath: output, receiptSha256: issued.receiptSha256, attempt }
}

function verifyParityAttestation(run: RunState, request: SupervisorPublicationRequest): {
  ok: true; phase: 'verify-attestation'; receiptPath: string; receiptSha256: string
} {
  run.publicationTransportVerify?.()
  if (run.publicationPhase !== 'parity-attested') throw new Error('parity terminal verification requires one live issued attestation')
  run.publicationPhase = 'terminal-in-progress'
  if (run.kind !== 'parity') {
    throw new Error('runtime parity attestations are available only to a tracked parity adjudication run')
  }
  const output = dataArtifactPath(request.receiptOutput, 'receiptOutput', true)
  const issued = issuedParityAttestations.get(output)
  if (!issued || issued.runId !== run.runId) throw new Error('receipt was not issued by this live supervisor attempt')
  if (issued.expiresAt <= Date.now()) {
    issuedParityAttestations.delete(output)
    throw new Error('supervisor-issued parity attestation expired before terminal verification')
  }
  attestParitySnapshotAtPublication(run)
  const receipt = readJsonObject(output, 'receiptOutput')
  if (receipt.attempt?.kind !== 'parity' || receipt.attempt?.role !== 'terminal_adjudicator'
      || receipt.attempt?.decision_author !== true) {
    throw new Error('runtime parity attestation is not bound to the terminal adjudicator role')
  }
  const manifest = path.resolve(String(receipt.runtime_provenance?.manifest_path || ''))
  if (manifest !== issued.manifestPath || !fs.lstatSync(manifest).isFile() || fs.lstatSync(manifest).isSymbolicLink()) {
    throw new Error('runtime provenance manifest is not the one issued by the supervisor')
  }
  const comparison = dataArtifactPath(receipt.comparison_artifact?.path, 'bound comparison artifact', true)
  const freeze = dataArtifactPath(receipt.freeze_receipt?.path, 'bound freeze receipt', true)
  if (fileSha256(output) !== issued.receiptSha256 || fileSha256(manifest) !== issued.manifestSha256
      || fileSha256(comparison) !== issued.comparisonSha256 || fileSha256(freeze) !== issued.freezeSha256) {
    throw new Error('supervisor-issued parity attestation or one of its bound artifacts changed')
  }
  // Re-establish live authority at terminal verification. The receipt is immutable, but the two model
  // output roots remain ordinary worktree files; a provider must not be able to mutate a canary after
  // issuance and still release against the older attestation. This also deliberately fails across a
  // supervisor restart because the canonical RunStates/pair watcher are process-local trust material.
  const currentCanaries = liveParityCanaryAuthority(run, freeze, readJsonObject(freeze, 'bound freeze receipt'))
    .map((item) => item.attestation)
  if (!isDeepStrictEqual(receipt.runtime_provenance?.paired_canaries, issued.pairedCanaries)
      || !isDeepStrictEqual(currentCanaries, issued.pairedCanaries)) {
    throw new Error('paired canary authority or terminal artifact hashes changed after attestation')
  }
  run.publicationTransportVerify?.()
  issuedParityAttestations.delete(output)
  run.parityVerificationCompleted = true
  run.parityVerificationReceiptPath = output
  run.parityVerificationReceiptSha256 = issued.receiptSha256
  run.publicationPhase = 'terminal-complete'
  run.publicationToken = undefined
  releaseParityRegistration(run)
  return { ok: true, phase: 'verify-attestation', receiptPath: output, receiptSha256: issued.receiptSha256 }
}

function withoutExecutionProvenance(value: any): any {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const copy = { ...value }
  delete copy.execution_provenance
  return copy
}

function withoutLedgerOnlyFields(value: any): any {
  const copy = withoutExecutionProvenance(value)
  if (!copy || typeof copy !== 'object' || Array.isArray(copy)) return copy
  const result = { ...copy }
  delete result.integrity_review
  return result
}

function assertRegularArtifact(absolute: string, label: string): fs.Stats {
  let info: fs.Stats
  try { info = fs.lstatSync(absolute) } catch { throw new Error(`missing ${label}: ${path.relative(REPO_ROOT, absolute)}`) }
  if (!info.isFile() || info.isSymbolicLink() || fs.realpathSync(absolute) !== path.resolve(absolute)) {
    throw new Error(`${label} must be one regular non-symlink file: ${path.relative(REPO_ROOT, absolute)}`)
  }
  return info
}

function supervisorWriteJsonAtomic(absolute: string, value: unknown, label: string): void {
  const parent = path.dirname(absolute)
  fs.mkdirSync(parent, { recursive: true })
  const parentInfo = fs.lstatSync(parent)
  if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink() || fs.realpathSync(parent) !== path.resolve(parent)) {
    throw new Error(`${label} parent must be one real directory: ${path.relative(REPO_ROOT, parent)}`)
  }
  if (fs.existsSync(absolute)) assertRegularArtifact(absolute, label)
  const temporary = path.join(parent, `.${path.basename(absolute)}.${randomUUID()}.tmp`)
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
    fs.renameSync(temporary, absolute)
  } finally {
    try { fs.unlinkSync(temporary) } catch { /* renamed or never created */ }
  }
}

function expectedLedgerIntegrityReview(run: RunState): Record<string, unknown> | null {
  const root = path.join(REPO_ROOT, run.runRoot!)
  let names: string[] = []
  try { names = fs.readdirSync(root).filter((name) => /^thesis_integrity_review(?:_v[0-9]+)?\.json$/.test(name)) } catch { return null }
  if (!names.length) return null
  const version = (name: string) => Number(/_v([0-9]+)\.json$/.exec(name)?.[1] || 1)
  const name = names.sort((a, b) => version(a) - version(b)).at(-1)!
  const absolute = path.join(root, name)
  assertRegularArtifact(absolute, 'screener integrity review')
  const review = readJsonObject(absolute, 'screener integrity review')
  const routes: Record<string, string> = {
    'Survives': 'Proceed',
    'Survives with haircut': 'Proceed',
    'Does not survive — downgrade': 'watchlist_integrity_downgrade',
    'Thesis broken': 'watchlist_integrity_broken',
  }
  const verdict = typeof review.verdict === 'string' ? review.verdict : ''
  if (!routes[verdict] || review.routing !== routes[verdict]) {
    throw new Error('screener integrity review has an invalid verdict/routing pair')
  }
  return {
    verdict,
    routing: review.routing,
    reviewed_at: typeof review.reviewed_at === 'string' ? review.reviewed_at : '',
    review_file: path.relative(REPO_ROOT, absolute).split(path.sep).join('/'),
    edge_score_haircut_note: typeof review.edge_score_haircut_note === 'string' ? review.edge_score_haircut_note : '',
  }
}

/**
 * Trusted publication boundary. The provider can request a phase and data pathspecs, but it never supplies
 * provider/model/attempt rows or artifact identities. Those come from the live RunState and pre-spawn
 * baselines; the server stamps and performs the serialized git operation before acknowledging the child.
 */
export async function supervisePublication(
  runId: string, token: string, request: SupervisorPublicationRequest,
): Promise<{
  ok: true; phase: 'stamp' | 'archive' | 'commit'; output?: string; artifacts: string[]
  artifactHashes: Record<string, string>; postPublicationWarning?: string
  archiveDecision?: { decisionId: string; path: string; created: boolean }
} | ReturnType<typeof issueParityAttestation> | ReturnType<typeof verifyParityAttestation>> {
  const run = getRun(runId)
  if (!run || run.endedAt !== undefined || !run.publicationToken || token !== run.publicationToken) {
    throw Object.assign(new Error('invalid or expired publication capability'), { statusCode: 403 })
  }
  run.publicationTransportVerify?.()
  // Frozen module stages are deliberately non-publishing. Only the one terminal full-canary adjudicator
  // may stamp decision artifacts and issue a supervisor receipt. Fail closed if a loader ever disobeys its
  // no-commit contract instead of letting an intermediate child mutate Git or seal the shared run root.
  if (run.parityCanary && run.kind !== 'full') {
    throw Object.assign(new Error('only the terminal full canary may publish provider-parity artifacts'), { statusCode: 409 })
  }
  if (request.phase === 'attest') return issueParityAttestation(run, request)
  if (request.phase === 'verify-attestation') return verifyParityAttestation(run, request)
  const archiveRequested = request.phase === 'archive'
  if (archiveRequested && (run.swarmId !== 'commodity' || !run.runRoot
      || !['full', 'rerun'].includes(run.kind))) {
    throw new Error('immutable commodity archive publication is available only to a tracked terminal commodity run')
  }
  // Frozen full canaries must never mutate HEAD between the Claude and Codex sides. Their command may
  // use the normal commit request, but the trusted boundary converts it to a single stamp+receipt and
  // performs no git operation. The adjudication run later releases the pair.
  const parityCanary = run.kind === 'full' && Boolean(run.parityPrelaunchBinding)
  if (parityCanary && run.publicationCompleted) throw new Error('parity full canary publication is already sealed')
  const phase = archiveRequested ? 'archive' : parityCanary || request.phase === 'stamp' ? 'stamp' : 'commit'
  const currentPhase = run.publicationPhase ?? 'open'
  if (phase === 'archive') {
    if (currentPhase !== 'open') throw new Error('commodity archive phase was already consumed')
  } else if (phase === 'commit') {
    const expected = run.swarmId === 'commodity' ? 'archive-sealed' : 'open'
    if (currentPhase !== expected) throw new Error(`terminal publication is not allowed from phase ${currentPhase}`)
  } else if (parityCanary) {
    if (currentPhase !== 'open') throw new Error('parity canary publication was already consumed')
  }
  attestParitySnapshotAtPublication(run)
  const pathspecs = phase === 'commit' ? authorizedPublicationPaths(run, request.pathspecs) : []
  const artifacts: string[] = []
  const supervisorAuthoredHashes: Record<string, string> = {}
  let signalProjection: { thesisId: string; seedCheckpoints: boolean } | null = null
  let signalLedger: { relative: string; absolute: string; value: Record<string, unknown> } | null = null
  for (const relative of decisionArtifacts(run)) {
    const absolute = path.join(REPO_ROOT, run.runRoot!, relative)
    const exists = fs.existsSync(absolute)
    const fresh = exists && artifactIsFresh(run, relative)
    if (run.kind === 'signal' && !fresh) continue // valid early stop, including an old retained thesis
    if (!exists) throw new Error(`missing terminal decision artifact: ${run.runRoot}/${relative}`)
    assertRegularArtifact(absolute, 'terminal decision artifact')
    if (!fresh) throw new Error(`terminal decision artifact was not authored by this attempt: ${run.runRoot}/${relative}`)
    artifacts.push(`${run.runRoot}/${relative}`)
  }
  if (phase === 'commit' && run.swarmId === 'commodity') {
    const binding = run.commodityArchiveBinding
    if (!binding) throw new Error('commodity decision commit requires a completed supervisor archive phase')
    const currentTop = fileSha256(path.join(REPO_ROOT, binding.topRecord))
    if (currentTop !== binding.topRecordSha256) throw new Error('commodity top-level decision changed after supervisor archive')
    for (const [relative, expected] of Object.entries(binding.archiveArtifactHashes)) {
      const absolute = path.join(REPO_ROOT, relative)
      assertRegularArtifact(absolute, 'bound commodity archive artifact')
      if (fileSha256(absolute) !== expected) throw new Error(`commodity archive changed before commit: ${relative}`)
    }
    const archivedDecision = Object.keys(binding.archiveArtifactHashes)
      .find((relative) => relative.endsWith('/decision_record.json'))
    if (!archivedDecision
        || !fs.readFileSync(path.join(REPO_ROOT, archivedDecision)).equals(fs.readFileSync(path.join(REPO_ROOT, binding.topRecord)))) {
      throw new Error('commodity top-level decision no longer equals its immutable archive')
    }
  }

  // Validate the deterministic screener projection before consuming the one-shot terminal phase. The
  // actual ledger write happens only after every child-supplied path/artifact has passed validation.
  if (run.kind === 'signal' && artifacts.length) {
    const runThesis = path.join(REPO_ROOT, artifacts[0])
    const record = JSON.parse(fs.readFileSync(runThesis, 'utf8'))
    const thesisId = typeof record?.meta?.thesis_id === 'string' ? record.meta.thesis_id : ''
    if (!/^THS-SIG-[0-9]{8}-[a-f0-9]{8}-v[0-9]+$/.test(thesisId)) throw new Error('fresh screener thesis has an invalid thesis id')
    const ledgerRelative = `screener/ledger/theses/${thesisId}.json`
    const ledgerAbsolute = path.join(REPO_ROOT, ledgerRelative)
    const expectedIntegrity = expectedLedgerIntegrityReview(run)
    const ledger = JSON.parse(JSON.stringify(withoutLedgerOnlyFields(record)))
    if (expectedIntegrity) ledger.integrity_review = expectedIntegrity
    signalLedger = { relative: ledgerRelative, absolute: ledgerAbsolute, value: ledger }
    signalProjection = {
      thesisId,
      seedCheckpoints: ['provisional', 'full_machine'].includes(String(record?.meta?.status || ''))
        && (!expectedIntegrity || expectedIntegrity.routing === 'Proceed'),
    }
  }

  // From this point onward the supervisor mutates/stamps durable bytes. Validation failures above remain
  // retryable; once mutation begins, the terminal capability is deliberately consumed fail-closed.
  if (phase === 'archive') run.publicationPhase = 'archive-in-progress'
  else if (phase === 'commit' || parityCanary) run.publicationPhase = 'terminal-in-progress'
  run.publicationRequested = true
  if (signalLedger) {
    supervisorWriteJsonAtomic(signalLedger.absolute, signalLedger.value, 'immutable screener ledger thesis')
    artifacts.push(signalLedger.relative)
    supervisorAuthoredHashes[signalLedger.relative] = fileSha256(signalLedger.absolute)
  }

  if (artifacts.length) {
    const manifest = canonicalManifestJsonl(run)
    const args = ['scripts/execution_provenance.py', 'stamp', '--manifest', '-', '--repo-root', REPO_ROOT]
    for (const artifact of artifacts) args.push('--repo-artifact', artifact)
    await execa('python3', args, { cwd: REPO_ROOT, input: manifest, reject: true })
  }
  // Only the terminal commit projects the shared board/checkpoint stores. A stamp-only phase validates
  // and stamps the run/ledger pair but must remain side-effect free outside those artifacts; otherwise a
  // retry or test stamp could update globally shared screener state without a corresponding publication.
  if (signalProjection && phase === 'commit') {
    if (signalProjection.seedCheckpoints) {
      await execa('python3', ['scripts/screener_emit_checkpoints.py', signalProjection.thesisId], {
        cwd: REPO_ROOT, reject: true, timeout: 5 * 60_000,
      })
    }
    await execa('python3', ['scripts/update_board_index.py'], {
      cwd: REPO_ROOT, reject: true, timeout: 5 * 60_000,
    })
    const derived = [
      'screener/board/index.json',
      ...(signalProjection.seedCheckpoints ? [
        'screener/ledger/conviction/checkpoints.ndjson',
        `screener/ledger/conviction/conviction_state/${signalProjection.thesisId}.json`,
      ] : []),
    ].filter((relative) => {
      try { assertRegularArtifact(path.join(REPO_ROOT, relative), 'supervisor screener projection'); return true } catch { return false }
    })
    run.supervisorPublicationArtifacts = [...new Set([...(run.supervisorPublicationArtifacts ?? []), ...derived])]
    for (const relative of derived) supervisorAuthoredHashes[relative] = fileSha256(path.join(REPO_ROOT, relative))
  }
  const artifactHashes = Object.fromEntries(artifacts.map((relative) => [
    relative, `sha256:${createHash('sha256').update(fs.readFileSync(path.join(REPO_ROOT, relative))).digest('hex')}`,
  ]))
  if (phase === 'archive') {
    const env: NodeJS.ProcessEnv = { ...process.env }
    for (const key of ['NOSTRA_COCKPIT_RUN', 'NOSTRA_PROVENANCE_MANIFEST', 'NOSTRA_PUBLICATION_ENDPOINT', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_PUBLICATION_SOCKET']) delete env[key]
    run.publicationTransportVerify?.()
    const result = await execa('python3', ['scripts/commodity_decision_archive.py', '--json', run.runRoot!], {
      cwd: REPO_ROOT, env, reject: true, timeout: 5 * 60_000,
    })
    let archived: any
    try { archived = JSON.parse(result.stdout) } catch { throw new Error('supervisor commodity archive returned invalid output') }
    if (!archived || typeof archived.decision_id !== 'string' || typeof archived.path !== 'string') {
      throw new Error('supervisor commodity archive returned no immutable decision identity')
    }
    run.publicationTransportVerify?.()
    const archiveAbsolute = path.resolve(archived.path)
    const archiveDir = path.dirname(archiveAbsolute)
    const archiveFiles = fs.readdirSync(archiveDir, { withFileTypes: true }).flatMap((entry) => {
      if (!entry.isFile() || entry.isSymbolicLink()) throw new Error('supervisor commodity archive contains a non-regular entry')
      const absolute = path.join(archiveDir, entry.name)
      assertRegularArtifact(absolute, 'supervisor commodity archive artifact')
      return [path.relative(REPO_ROOT, absolute).split(path.sep).join('/')]
    })
    run.supervisorPublicationArtifacts = [...new Set([
      ...(run.supervisorPublicationArtifacts ?? []), ...archiveFiles,
    ])]
    const topRecord = `${run.runRoot}/decision_record.json`
    assertRegularArtifact(path.join(REPO_ROOT, topRecord), 'commodity top-level decision')
    const archiveArtifactHashes = Object.fromEntries(archiveFiles.map((relative) => [
      relative, fileSha256(path.join(REPO_ROOT, relative)),
    ]))
    const archivedDecision = archiveFiles.find((relative) => relative.endsWith('/decision_record.json'))
    if (!archivedDecision
        || !fs.readFileSync(path.join(REPO_ROOT, archivedDecision)).equals(fs.readFileSync(path.join(REPO_ROOT, topRecord)))) {
      throw new Error('supervisor commodity archive does not exactly match the current top-level decision')
    }
    run.commodityArchiveBinding = {
      decisionId: archived.decision_id,
      topRecord,
      topRecordSha256: fileSha256(path.join(REPO_ROOT, topRecord)),
      archiveArtifactHashes,
    }
    run.publicationPhase = 'archive-sealed'
    const refreshedHashes = Object.fromEntries(artifacts.map((relative) => [
      relative, `sha256:${createHash('sha256').update(fs.readFileSync(path.join(REPO_ROOT, relative))).digest('hex')}`,
    ]))
    return {
      ok: true, phase, artifacts, artifactHashes: refreshedHashes,
      archiveDecision: { decisionId: archived.decision_id, path: archived.path, created: archived.created === true },
    }
  }
  if (phase === 'stamp') {
    if (parityCanary) {
      const receipt = writeExecutionReceipt(run)
      const receiptArtifacts = receipt ? [receipt.path] : []
      if (receipt) supervisorAuthoredHashes[receipt.path] = receipt.sha256
      const fixed = { ...supervisorAuthoredHashes, ...artifactHashes }
      const snapshot = createPublicationSnapshot(run, [...artifacts, ...receiptArtifacts], [...artifacts, ...receiptArtifacts])
      for (const [relative, expected] of Object.entries(fixed)) {
        if (snapshot.hashes[relative] !== expected) {
          snapshot.cleanup()
          throw new Error(`fixed canary snapshot disagrees with supervisor-authored artifact: ${relative}`)
        }
      }
      retainPublicationSnapshot(run, snapshot)
      run.publicationArtifactHashes = { ...snapshot.hashes }
      run.publicationTransportVerify?.()
      run.publicationCompleted = true
      run.publicationPhase = 'terminal-complete'
      run.publicationToken = undefined
      return {
        ok: true, phase, artifacts: [...artifacts, ...receiptArtifacts],
        artifactHashes: fixed,
      }
    }
    return { ok: true, phase, artifacts, artifactHashes }
  }

  const receipt = ['full', 'rerun', 'module', 'agent', 'signal', 'screener-agent', 'conviction'].includes(run.kind)
    ? writeExecutionReceipt(run) : null
  if (receipt) supervisorAuthoredHashes[receipt.path] = receipt.sha256
  const exactRequestedFiles = pathspecs.flatMap((relative) => {
    if (firstWildcard(relative) !== relative) return []
    try {
      const absolute = path.join(REPO_ROOT, relative)
      assertRegularArtifact(absolute, 'requested publication artifact')
      return [relative]
    } catch { return [] }
  })
  const requiredCommitPaths = [...new Set([
    ...exactRequestedFiles,
    ...artifacts,
    ...(run.supervisorPublicationArtifacts ?? []),
    ...(receipt ? [receipt.path] : []),
    ...(publicationDrainRuns.has(run) && run.kind === 'full' && run.swarmId === RESEARCH_SWARM_ID && run.runRoot
      ? [`${run.runRoot}/RUN_METADATA.md`] : []),
  ])]
  for (const required of requiredCommitPaths) if (!pathspecs.includes(required)) pathspecs.push(required)
  const message = typeof request.message === 'string' && request.message.trim()
    ? request.message.trim().slice(0, 500) : `${run.swarmId} run: ${run.subjectId}`
  const env: NodeJS.ProcessEnv = { ...process.env }
  for (const key of ['NOSTRA_COCKPIT_RUN', 'NOSTRA_PROVENANCE_MANIFEST', 'NOSTRA_PUBLICATION_ENDPOINT', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_PUBLICATION_SOCKET']) delete env[key]
  run.publicationTransportVerify?.()
  // Freeze exact bytes into protected supervisor state before Git ever sees a path. Provider descendants
  // may keep running while their HTTP request is in flight, but commit-run stages only these immutable
  // snapshots and HEAD verification compares against these fixed hashes, never mutable worktree bytes.
  const fixedAuthoredHashes = { ...supervisorAuthoredHashes, ...artifactHashes }
  if (publicationDrainRuns.has(run) && run.kind === 'full' && run.swarmId === RESEARCH_SWARM_ID && run.runRoot) {
    const metadata = path.join(REPO_ROOT, run.runRoot, 'RUN_METADATA.md')
    assertRegularArtifact(metadata, 'full-run metadata awaiting commit-SHA backfill')
    const body = fs.readFileSync(metadata, 'utf8')
    const placeholder = '(to be filled after commit)'
    if (!body.includes(placeholder) || body.replace(placeholder, '').includes(placeholder)) {
      throw new Error('RUN_METADATA.md must contain exactly one commit-SHA placeholder')
    }
  }
  for (const [relative, expected] of Object.entries(fixedAuthoredHashes)) {
    if (fileSha256(path.join(REPO_ROOT, relative)) !== expected) {
      throw new Error(`terminal decision artifact changed before fixed publication snapshot: ${relative}`)
    }
  }
  const snapshot = createPublicationSnapshot(run, pathspecs, requiredCommitPaths)
  for (const [relative, expected] of Object.entries(fixedAuthoredHashes)) {
    if (snapshot.hashes[relative] !== expected) {
      snapshot.cleanup()
      throw new Error(`fixed publication snapshot disagrees with stamped terminal artifact: ${relative}`)
    }
  }
  if (run.commodityArchiveBinding) {
    const binding = run.commodityArchiveBinding
    if (snapshot.hashes[binding.topRecord] !== binding.topRecordSha256
        || Object.entries(binding.archiveArtifactHashes).some(([relative, expected]) => snapshot.hashes[relative] !== expected)) {
      snapshot.cleanup()
      throw new Error('fixed publication snapshot disagrees with bound commodity archive')
    }
  }
  env.NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST = snapshot.manifest
  let output: string
  let retained = false
  const deferredDrain = publicationDrainRuns.has(run)
  let ready = deferredDrain
    ? writeReadyPublication(run, snapshot, message, 'primary-ready', snapshot.hashes)
    : null
  if (ready) clearProviderProcessLease(run.runId)
  const finalHashes = { ...snapshot.hashes }
  try {
    output = await supervisorCommitter(message, snapshot.paths, env)
    await supervisorCommitVerifier(output, snapshot.paths, snapshot.hashes)
    run.publicationTransportVerify?.()
    if (!deferredDrain) retainPublicationSnapshot(run, snapshot)
    retained = true
  } finally {
    // A post-extinction ready receipt deliberately retains its immutable snapshot across a helper crash
    // or push failure. Startup may retry only this protected receipt; merely queued/live intents carry no
    // providerless authority. Direct focused-test calls retain their historical settle-on-close behavior.
    if (!retained && !ready) snapshot.cleanup()
  }
  // A commit cannot contain its own SHA. Full research runs therefore publish the frozen primary
  // snapshot first, then the supervisor (after provider extinction) fills only RUN_METADATA.md and
  // publishes that exact second snapshot. The model never receives authority to amend or infer HEAD.
  if (deferredDrain && run.kind === 'full' && run.swarmId === RESEARCH_SWARM_ID && run.runRoot) {
    const primarySha = verifiedPublishedRevision(output)
    const metadataRelative = `${run.runRoot}/RUN_METADATA.md`
    const metadataAbsolute = path.join(REPO_ROOT, metadataRelative)
    if (fs.existsSync(metadataAbsolute)) {
      assertRegularArtifact(metadataAbsolute, 'full-run metadata backfill')
      const original = fs.readFileSync(metadataAbsolute, 'utf8')
      const placeholder = '(to be filled after commit)'
      if (!original.includes(placeholder)) throw new Error('RUN_METADATA.md has no exact commit-SHA placeholder')
      const updated = original.replace(placeholder, primarySha)
      if (updated.includes(placeholder)) throw new Error('RUN_METADATA.md contains more than one commit-SHA placeholder')
      writeSupervisorRunFile(run.runRoot, 'RUN_METADATA.md', updated)
      const backfill = createPublicationSnapshot(run, [metadataRelative], [metadataRelative])
      const backfillEnv = { ...env, NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST: backfill.manifest }
      finalHashes[metadataRelative] = backfill.hashes[metadataRelative]
      const backfillReady = writeReadyPublication(
        run, backfill, `Backfill commit SHA in RUN_METADATA for ${run.subjectId}`,
        'backfill-ready', finalHashes, primarySha,
      )
      // The atomically replaced ready receipt now owns the backfill snapshot. The obsolete primary
      // snapshot can be removed without creating a recovery gap.
      snapshot.cleanup()
      ready = backfillReady
      try {
        const backfillOutput = await supervisorCommitter(
          `Backfill commit SHA in RUN_METADATA for ${run.subjectId}`,
          backfill.paths,
          backfillEnv,
        )
        await supervisorCommitVerifier(backfillOutput, backfill.paths, backfill.hashes)
        await supervisorCommitVerifier(backfillOutput, Object.keys(finalHashes), finalHashes)
        output = `${output}\n${backfillOutput}`
      } finally { /* a failed backfill deliberately retains its protected ready snapshot */ }
    }
  }
  run.publicationRevision = verifiedPublishedRevision(output)
  run.publicationArtifactHashes = finalHashes
  // The publication authority sealer currently requires the in-memory completion bit while it writes the
  // protected provider/profile receipt. Treat that bit as provisional until the write returns: a failed
  // fsync must leave the immutable ready receipt actionable and the run visibly non-terminal, never let the
  // close finalizer convert a committed-but-unsealed publication into `done`.
  run.publicationCompleted = true
  run.publicationPhase = 'terminal-in-progress'
  // The owner-only ready receipt is the last providerless recovery path after Git accepted the immutable
  // snapshot. Keep it until the exact artifact hashes and provider/profile publication authority are fsynced;
  // a crash in between can then finish publication without ever paying the terminal model again.
  try {
    publicationAuthoritySealer(run)
  } catch (error: any) {
    run.publicationCompleted = false
    run.publicationPhase = 'terminal-failed'
    run.publicationError = `publication authority could not be sealed: ${String(error?.message || error)}`
    throw error
  }
  run.publicationPhase = 'terminal-complete'
  run.publicationToken = undefined
  if (ready) clearReadyPublication(ready)
  let postPublicationWarning: string | undefined
  if (run.kind === 'review' || run.kind === 'conviction') {
    try {
      await postReviewCalibration(run)
    } catch (error: any) {
      // The review itself is already safely committed. Keep that outcome successful and make the derived
      // calibration failure visible on the run/activity row; the daily/monthly deterministic timers retry it.
      postPublicationWarning = `${run.kind} published, but deterministic calibration refresh failed: ${String(error?.message || error).slice(0, 500)}`
      run.note = postPublicationWarning
      console.error(`[publication] ${postPublicationWarning}`) // eslint-disable-line no-console
    }
  }
  return { ok: true, phase, output, artifacts, artifactHashes: finalHashes, ...(postPublicationWarning ? { postPublicationWarning } : {}) }
}

function readySnapshotEntries(record: ReadyPublicationRecord): Array<{ path: string; snapshot: string; sha256: string }> {
  const manifest = JSON.parse(fs.readFileSync(record.snapshot_manifest, 'utf8')) as Record<string, unknown>
  return (manifest.entries as Array<{ path: string; snapshot: string; sha256: string }>).map((entry) => ({ ...entry }))
}

function runFromReadyPublication(record: ReadyPublicationRecord): RunState {
  return {
    runId: record.run_id, runRoot: record.run_root, subjectId: record.subject, ticker: record.subject,
    swarmId: record.swarm, kind: record.kind, provider: record.provider, profileKey: record.profile_key,
    model: record.model, reasoningLevel: record.reasoning_level, executionProfile: record.execution_profile,
  } as RunState
}

/** Retry only post-extinction publications whose immutable snapshot and provider identity were sealed in
 * protected supervisor state before Git began. Live/queued intents are intentionally unrecoverable: the
 * preserved run is marked interrupted and requires an explicit continuation after a crash. */
export async function recoverReadyPublications(): Promise<number> {
  fs.mkdirSync(readyPublicationDir, { recursive: true, mode: 0o700 })
  fs.chmodSync(readyPublicationDir, 0o700)
  let recovered = 0
  for (const entry of fs.readdirSync(readyPublicationDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.name.endsWith('.json')) continue
    if (!entry.isFile() || entry.isSymbolicLink()) throw new Error(`unsafe ready-publication entry: ${entry.name}`)
    let record = readReadyPublication(path.join(readyPublicationDir, entry.name))
    if (!record) continue
    const env: NodeJS.ProcessEnv = { ...process.env, NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST: record.snapshot_manifest }
    for (const key of ['NOSTRA_COCKPIT_RUN', 'NOSTRA_PROVENANCE_MANIFEST', 'NOSTRA_PUBLICATION_ENDPOINT', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_PUBLICATION_SOCKET']) delete env[key]
    const output = await supervisorCommitter(record.message, record.paths, env)
    const snapshotHashes = Object.fromEntries(readySnapshotEntries(record).map((item) => [item.path, item.sha256]))
    await supervisorCommitVerifier(output, record.paths, snapshotHashes)
    let recoveredRevision = verifiedPublishedRevision(output)

    if (record.stage === 'primary-ready' && record.kind === 'full' && record.swarm === RESEARCH_SWARM_ID) {
      const primarySha = verifiedPublishedRevision(output)
      const metadataRelative = `${record.run_root}/RUN_METADATA.md`
      const metadataEntry = readySnapshotEntries(record).find((item) => item.path === metadataRelative)
      if (!metadataEntry) throw new Error('recovered full publication omitted RUN_METADATA.md')
      {
        const original = fs.readFileSync(metadataEntry.snapshot, 'utf8')
        const placeholder = '(to be filled after commit)'
        if (!original.includes(placeholder) || original.replace(placeholder, primarySha).includes(placeholder)) {
          throw new Error('recovered full-run metadata has no single exact commit-SHA placeholder')
        }
        writeSupervisorRunFile(record.run_root, 'RUN_METADATA.md', original.replace(placeholder, primarySha))
        const run = runFromReadyPublication(record)
        const backfill = createPublicationSnapshot(run, [metadataRelative], [metadataRelative])
        const finalHashes = { ...record.artifact_hashes, [metadataRelative]: backfill.hashes[metadataRelative] }
        const backfillRecord = writeReadyPublication(
          run, backfill, `Backfill commit SHA in RUN_METADATA for ${record.subject}`,
          'backfill-ready', finalHashes, primarySha,
        )
        fs.rmSync(path.dirname(record.snapshot_manifest), { recursive: true, force: true })
        record = backfillRecord
        const backfillEnv = { ...env, NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST: backfill.manifest }
        const backfillOutput = await supervisorCommitter(record.message, record.paths, backfillEnv)
        await supervisorCommitVerifier(backfillOutput, record.paths, backfill.hashes)
        await supervisorCommitVerifier(backfillOutput, Object.keys(record.artifact_hashes), record.artifact_hashes)
        recoveredRevision = verifiedPublishedRevision(backfillOutput)
      }
    } else {
      await supervisorCommitVerifier(output, Object.keys(record.artifact_hashes), record.artifact_hashes)
    }

    recordRecoveredPublicationAuthority({
      runId: record.run_id, runRoot: record.run_root, provider: record.provider,
      model: record.model, reasoningLevel: record.reasoning_level, profileKey: record.profile_key,
      executionProfile: record.execution_profile,
    }, record.artifact_hashes)
    await runIbkrPaperAutoSyncAfterPublication({
      runId: record.run_id, kind: record.kind, ticker: record.subject, swarmId: record.swarm,
      willCommitToMain: true, publicationCompleted: true, publicationPhase: 'terminal-complete',
      publicationRevision: recoveredRevision,
    })
    clearReadyPublication(record)
    recovered++
  }
  return recovered
}

/** Warm the once-per-process CLI probes at server startup so the FIRST user launch doesn't pay
 *  ~1-4s for `claude --version` + `claude --help` inside its click-to-ack window. Best-effort. */
export async function warmLaunchProbes(): Promise<void> {
  await Promise.all(listProviderAdapters().filter((adapter) => isProviderEnabled(adapter.profile.provider)).map(async (adapter) => {
    try { await (adapter.warmup?.() ?? adapter.getAvailability()) } catch { /* surfaced on launch/check */ }
  }))
}

async function continueIncompleteCodexProcess(
  run: RunState,
  res: any,
  stderr: string,
  descendantObserved: boolean,
  publicationSocket: SupervisorPublicationSocket,
): Promise<boolean> {
  const plan = planCodexAutomaticContinuation(run, res, stderr, descendantObserved)
  if (!plan.continue) return false

  // Verify and fully retire every capability/resource from the old process before a new credential lease,
  // publication socket, or detached process group can exist for this same RunState.
  try { run.publicationTransportVerify?.() } catch { return false }
  await publicationSocket.close()
  releaseProviderLaunchResources(run)
  if (run.publicationError) return false
  clearProviderProcessLease(run.runId)

  run.automaticContinuationMetricBase = {
    costUsd: run.costUsd ?? 0,
    numTurns: run.numTurns ?? 0,
    durationMs: run.durationMs ?? 0,
  }
  const declaredDecisionArtifacts = decisionArtifacts(run)
  const retainedDecisionAuthor = declaredDecisionArtifacts.length > 0
    && declaredDecisionArtifacts.every((relative) => plan.completedOutputs!.includes(relative))
  if (!retainedDecisionAuthor) {
    supersedeIncompleteDecisionAuthorAttempt(
      run, run.automaticContinuationRetainsDecisionAuthor === true,
    )
  }
  run.automaticContinuationRetainsDecisionAuthor = retainedDecisionAuthor
  run.automaticContinuationCount = plan.index!
  const nextProviderAttemptId = randomUUID()
  const preparedBinding = preparedRunPlanTransactionByRun.get(run)
  if (preparedBinding) {
    const nextTransactionAttemptId = preparedProviderContinuationAttemptId(
      preparedBinding.rootAttemptId,
      nextProviderAttemptId,
    )
    try {
      // Register synchronously while the old close handler still owns the logical run. A crash/rejection
      // after this point is one exact unstarted child, never reuse of process 1's released gate.
      preparedBinding.transaction.registerPaidChildAttempt(nextTransactionAttemptId)
      preparedRunPlanTransactionByRun.set(run, {
        ...preparedBinding,
        attemptId: nextTransactionAttemptId,
      })
    } catch (error: any) {
      run.streamFailure = {
        reason: 'codex_continuation_failed',
        message: `Codex continuation identity could not be sealed: ${String(error?.message || error)}`,
      }
      return false
    }
  }
  run.providerAttemptId = nextProviderAttemptId
  run.automaticContinuationCheckpoint = plan.checkpoint!
  run.automaticContinuationStagnantTurns = plan.stagnantTurns!
  run.child = null
  run.processGroupPid = undefined
  run.processGroupKillRequested = undefined
  run.cliResult = undefined
  run.streamFailure = undefined
  run.lastProviderMessage = undefined
  run.sessionId = undefined
  run.resumeSessionId = undefined
  run.lastStdoutAt = Date.now()
  run.note = undefined
  run.publicationToken = randomUUID()
  run.publicationPhase = 'open'
  run.publicationTransportVerify = undefined
  run.availabilityProofId = randomUUID()
  streamResultErrors.delete(run)
  run.toolUseToAgent.clear()
  run.nativeThreadToAgent.clear()
  run.nativeAgentStates.clear()
  for (const agent of run.agents.values()) {
    if (agent.status !== 'done') agent.status = 'queued'
  }
  terminalCloseHandlers.delete(run)
  run.status = 'starting'

  const ts = Date.now()
  const totalOutputs = new Set([
    ...plan.completedOutputs!, ...plan.unresolvedOutputs!,
  ]).size
  const activity = {
    tool: 'Task',
    target: `Continue same Codex run · process ${plan.index} · ${plan.completedOutputs!.length}/${totalOutputs} outputs complete`,
    ts,
  }
  run.lastActivity = activity
  recordActivity(run, activity)
  emitTransient(run, {
    type: 'run-activity', runId: run.runId, tool: activity.tool, target: activity.target,
    provider: run.provider, executionProfile: run.executionProfile, ts,
  })

  try {
    await spawnEngine(run)
  } catch (error: any) {
    if (run.endedAt === undefined) {
      const message = `Codex automatic continuation ${plan.index} could not start: ${String(error?.message || error)}`
      run.streamFailure = { reason: 'codex_continuation_failed', message }
      finalizeRunOnClose(run, { exitCode: 1, failed: true, shortMessage: message }, message)
    }
  }
  // The old close handler must never continue into memory/publication/finalization after ownership moved
  // to the replacement process (or its failed-start finalizer).
  return true
}

async function spawnEngine(run: RunState): Promise<void> {
  // A confirmation can stay open while another process publishes a newer call; likewise, a shared
  // data/<SUBJECT> pool can acquire a second finished swarm owner after an automatic intake was queued.
  // Re-read both identities at the final process boundary. A stale/ambiguous authorization never spends.
  type LaunchBoundaryChange = 'selected_decision_changed' | 'intake_owner_changed'
    | 'intake_plan_changed' | 'shared_pool_target_changed'
    | 'shared_data_owner_ambiguous' | 'shared_data_owner_mismatch'
    | 'shared_data_subject_busy' | 'shared_data_owner_unavailable'
  const changedLaunchBinding = (): LaunchBoundaryChange | null => {
    const poolConflict = currentSharedDataPoolConflict(run.swarmId, run.subjectId, run.kind, run.runId)
    if (poolConflict) return poolConflict.code
    const decision = run.selectedDecisionFingerprint
      ? { decisionRunRoot: run.selectedDecisionRunRoot ?? run.runRoot ?? undefined, decisionFingerprint: run.selectedDecisionFingerprint }
      : undefined
    if (!decisionBindingStillCurrent(run.swarmId, run.subjectId, decision)) return 'selected_decision_changed'
    const receipt = intakeReceiptByRun.get(run)
    if (receipt && (!run.runRoot || !run.module || !run.agent
        || !intakeReceiptIntentStillActionable(
          run.swarmId, run.subjectId, run.runRoot, run.module, run.agent, receipt,
        ))) return 'intake_plan_changed'
    const owner = intakeOwnerByRun.get(run)
    if (owner) {
      if (owner.swarm !== run.swarmId) return 'intake_owner_changed'
      let current: IntakeOwner | null = null
      try { current = resolveUniqueFinishedIntakeOwner(run.subjectId) } catch { /* fail closed */ }
      if (!intakeOwnerBindingMatches(owner, current)) return 'intake_owner_changed'
    }
    const target = sharedPoolTargetByRun.get(run)
    if (target) {
      try {
        const conflict = sharedDataPoolConflict(
          target.swarm,
          listFinishedIntakeOwners(target.subject),
          sharedDataPoolClaims(target.subject, run.runId),
        )
        if (conflict) return 'shared_pool_target_changed'
      } catch {
        return 'shared_pool_target_changed'
      }
    }
    return null
  }
  const stopForChangedBinding = (reason: LaunchBoundaryChange): void => {
    let message: string
    if (reason === 'selected_decision_changed') {
      message = 'The selected call changed before launch. Refresh it and review the rerun again.'
    } else if (reason === 'intake_plan_changed') {
      message = 'That intake-plan orb was already consumed or the plan changed. No rerun was started.'
    } else if (reason === 'intake_owner_changed') {
      message = 'The data-pool owner changed before launch. Refresh the idea before analyzing the landed data.'
    } else if (reason === 'shared_pool_target_changed') {
      message = 'The destination data-pool owner changed before launch. Refresh the handoff and try again.'
    } else if (reason === 'shared_data_owner_ambiguous') {
      message = `${run.subjectId} now has finished ideas in more than one cockpit. No analysis was started.`
    } else if (reason === 'shared_data_owner_mismatch') {
      message = `data/${run.subjectId} now belongs to another cockpit. No analysis was started.`
    } else if (reason === 'shared_data_subject_busy') {
      message = `${run.subjectId} is now being analyzed by another cockpit. No analysis was started.`
    } else {
      message = `The owner of data/${run.subjectId} could not be verified. No analysis was started.`
    }
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message, ts: Date.now() })
    finishRun(run, 'error')
  }
  const beforeArgs = changedLaunchBinding()
  if (beforeArgs) {
    stopForChangedBinding(beforeArgs)
    return
  }
  // Freeze and verify memory before any paid provider process exists. In shadow mode an
  // unavailable snapshot is recorded but baseline execution continues; enforced mode throws here.
  await prepareResearchMemory(run)
  const adapter = getProviderAdapter(run.provider)
  const publicationSocket = await startSupervisorPublicationSocket(run)
  const publicationBinding = {
    runId: run.runId, runRoot: run.runRoot!, token: run.publicationToken!, socketPath: publicationSocket.socketPath,
  }
  const continuationInventory = (run.provider === 'codex' && (run.automaticContinuationCount ?? 0) > 0)
    ? codexContinuationInventory(run) : null
  // Bind one exact external evidence capability for every policy/env calculation below. Hash it once at
  // this adapter-build boundary; helpers must reuse this object rather than lazily creating alternatives.
  try {
    prepareProviderEvidenceBoundary(run)
  } catch (error) {
    await publicationSocket.close()
    throw error
  }
  let launchSpec: Awaited<ReturnType<typeof adapter.buildLaunch>>
  try {
    launchSpec = await adapter.buildLaunch({
      prompt: run.prompt,
      kind: run.kind,
      profile: {
        provider: run.provider,
        profileKey: run.profileKey,
        model: run.model,
        reasoningLevel: run.reasoningLevel,
        executionProfile: run.executionProfile,
      },
      cwd: path.resolve(REPO_ROOT),
      additionalWritableDataRoot: path.resolve(DATA_DIR),
      writablePaths: providerWritablePaths(run),
      protectedWritePaths: providerProtectedWritePaths(run),
      protectedReadPaths: providerProtectedReadPaths(run),
      readOnlyCapabilityPaths: providerReadOnlyCapabilityPaths(run),
      env: applyRunPolicyEnv(applySupervisorPublicationEnv(process.env, publicationBinding), run),
      guard: LAUNCH_GUARDS[run.kind],
      resumeSessionId: run.resumeSessionId,
      automaticContinuation: continuationInventory ? {
        index: run.automaticContinuationCount!,
        completedOutputs: continuationInventory.completedOutputs,
        unresolvedOutputs: continuationInventory.unresolvedOutputs,
      } : undefined,
      availabilityProofId: run.availabilityProofId,
      publicationSocketPath: publicationSocket.socketPath,
    })
  } catch (error) {
    providerEvidenceBoundary.delete(run)
    await publicationSocket.close()
    throw error
  }
  // Runtime-owned publication controls are invariant across adapters. Reassert them after adapter env
  // scrubbing so a future provider cannot accidentally drop provenance or cockpit-mode signaling.
  launchSpec.env = applyRunPolicyEnv(applySupervisorPublicationEnv(launchSpec.env, publicationBinding), run)
  run.cliVersion = launchSpec.cliVersion
  let launchSpecCleaned = false
  const cleanupLaunchSpec = () => {
    if (launchSpecCleaned) return
    launchSpecCleaned = true
    try { launchSpec.cleanup?.() } catch (error: any) {
      console.error(`[provider] launch cleanup failed for ${run.runId}: ${String(error?.message || error)}`) // eslint-disable-line no-console
    }
    void publicationSocket.close().catch((error: any) => {
      console.error(`[provider] publication socket cleanup failed for ${run.runId}: ${String(error?.message || error)}`) // eslint-disable-line no-console
    })
  }
  providerLaunchCleanup.set(run, cleanupLaunchSpec)
  if (run.cancelRequested) {
    // cancelled during the gate / the buildArgs window — finish WITHOUT creating the child (no orphan).
    // Guard the terminal emit on not-already-finalized: finishRun is idempotent but emit is not.
    if (run.endedAt === undefined) {
      emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
      finishRun(run, 'cancelled')
    }
    releaseProviderLaunchResources(run)
    return
  }
  // buildArgs can cold-probe `claude --help` for several seconds. Re-check BOTH call bindings plus the
  // generic shared-pool owner/claim AFTER that await and immediately before execa: neither a new decision
  // nor a newly-ambiguous/cross-swarm owner in the probe/readiness window can spend.
  const beforeSpawn = changedLaunchBinding()
  if (beforeSpawn) {
    stopForChangedBinding(beforeSpawn)
    releaseProviderLaunchResources(run)
    return
  }
  // FINAL scope CAS: nothing asynchronous occurs between this callback and execa below. In particular, a
  // readiness pause or cold `claude --help` probe cannot widen a reviewed module-resume scope unnoticed.
  const guarded = evaluatePreSpawnGuard(preSpawnGuards.get(run))
  if (!guarded.ok) {
    run.note = guarded.message
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: guarded.reason, message: guarded.message, ts: Date.now() })
    finishRun(run, 'error')
    return
  }
  // buildLaunch may cold-probe provider binaries. Revalidate the pinned receipt and immutable
  // per-run projection after that await, immediately before the final synchronous spawn boundary.
  try {
    await verifyResearchMemoryBeforeSpawn(run)
  } catch (error) {
    releaseProviderLaunchResources(run)
    throw error
  }
  const preparedBinding = preparedRunPlanTransactionByRun.get(run)
  const preparedTransaction = preparedBinding?.transaction
  const preparedAttemptId = preparedBinding?.attemptId
  let providerSpawnGate: ProviderSpawnGate | undefined
  if (preparedTransaction) {
    try {
      providerSpawnGate = await preparedTransaction.markPaidChildSpawning(preparedAttemptId!, {
        runId: run.runId,
        providerAttemptId: run.providerAttemptId ?? run.runId,
        commandDigest: providerSpawnCommandDigest(launchSpec.command, launchSpec.args, launchSpec.cwd),
      })
    } catch (error: any) {
      releaseProviderLaunchResources(run)
      emit(run, {
        type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed',
        message: `provider spawn boundary could not be sealed: ${String(error?.message || error)}`, ts: Date.now(),
      })
      finishRun(run, 'error')
      throw Object.assign(new Error('Failed to seal provider spawn boundary'), { statusCode: 500 })
    }
    // The durable journal write above is asynchronous. Recheck every synchronous spend guard after it and
    // before execa; a binding/scope change in that fsync window fails without creating a paid child.
    const afterSealBinding = changedLaunchBinding()
    if (afterSealBinding) {
      await preparedTransaction.rollbackIfUnstarted(afterSealBinding, preparedAttemptId)
      stopForChangedBinding(afterSealBinding)
      releaseProviderLaunchResources(run)
      return
    }
    const afterSealGuard = evaluatePreSpawnGuard(preSpawnGuards.get(run))
    if (!afterSealGuard.ok) {
      await preparedTransaction.rollbackIfUnstarted(afterSealGuard.message, preparedAttemptId)
      run.note = afterSealGuard.message
      emit(run, {
        type: 'run-error', runId: run.runId, status: 'error', reason: afterSealGuard.reason,
        message: afterSealGuard.message, ts: Date.now(),
      })
      finishRun(run, 'error')
      releaseProviderLaunchResources(run)
      return
    }
  }
  // markPaidChildSpawning() and the final memory proof both await durable I/O. A cancel can land during
  // either window after the earlier check. Re-check at the last boundary and roll back the unstarted paid
  // attempt; no async operation follows this branch before execa.
  if (run.cancelRequested || run.endedAt !== undefined || run.status === 'cancelled') {
    try { await preparedTransaction?.rollbackIfUnstarted('cancelled before provider spawn', preparedAttemptId) } catch {}
    if (run.endedAt === undefined) {
      emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
      finishRun(run, 'cancelled')
    }
    releaseProviderLaunchResources(run)
    return
  }
  // The immutable-memory proof and (for reviewed plans) transaction journal both await durable I/O.
  // Re-read every launch binding and scope after those awaits. The success path from these checks through
  // the gated execa below is synchronous, so a newly ambiguous shared pool cannot cross the paid boundary.
  const finalSpawnBinding = changedLaunchBinding()
  if (finalSpawnBinding) {
    try { await preparedTransaction?.rollbackIfUnstarted(finalSpawnBinding, preparedAttemptId) } catch {}
    stopForChangedBinding(finalSpawnBinding)
    releaseProviderLaunchResources(run)
    return
  }
  const finalSpawnGuard = evaluatePreSpawnGuard(preSpawnGuards.get(run))
  if (!finalSpawnGuard.ok) {
    try { await preparedTransaction?.rollbackIfUnstarted(finalSpawnGuard.message, preparedAttemptId) } catch {}
    run.note = finalSpawnGuard.message
    emit(run, {
      type: 'run-error', runId: run.runId, status: 'error', reason: finalSpawnGuard.reason,
      message: finalSpawnGuard.message, ts: Date.now(),
    })
    finishRun(run, 'error')
    releaseProviderLaunchResources(run)
    return
  }
  // Re-stat the immutable generation after every asynchronous pre-spawn proof/journal write. If a sibling
  // failure cleared the chain receipt or an owner changed the frozen bytes, this throws before provenance
  // records a paid attempt and before either provider process exists.
  try {
    const preparedEvidence = providerEvidenceBoundary.get(run)
    const frozenEvidence = frozenEvidenceBindingForRun(run, true)
    if ((preparedEvidence?.capability ?? null) !== (frozenEvidence?.capability ?? null)
        || (preparedEvidence?.frozenPool ?? null) !== (frozenEvidence?.frozenPool ?? null)) {
      throw new Error('provider launch evidence capability changed after adapter construction')
    }
    run.evidenceGenerationDigest = frozenEvidence?.frozenPool.generationDigest
  } catch (error) {
    try {
      await preparedTransaction?.rollbackIfUnstarted(
        'frozen readiness generation changed before spawn', preparedAttemptId,
      )
    } catch {}
    releaseProviderLaunchResources(run)
    throw error
  }
  if (!providerSpawnGate) {
    try {
      providerSpawnGate = createProviderSpawnGate({
        requestId: providerSpawnRequestIdByRun.get(run) ?? run.runId,
        runId: run.runId,
        attemptId: run.providerAttemptId ?? run.runId,
        providerAttemptId: run.providerAttemptId ?? run.runId,
        runRoot: run.runRoot!,
        commandDigest: providerSpawnCommandDigest(launchSpec.command, launchSpec.args, launchSpec.cwd),
      })
    } catch (error) {
      try {
        await preparedTransaction?.rollbackIfUnstarted('provider spawn gate could not be prepared', preparedAttemptId)
      } catch { /* original gate error wins */ }
      releaseProviderLaunchResources(run)
      throw error
    }
  }
  let child: ResultPromise
  try {
    // Provider-owned lease/binary validation is deliberately the final synchronous operation before
    // supervisor provenance begins and the process is created. It must not perform asynchronous work.
    launchSpec.beforeSpawn?.()
    captureCodexContinuationBaselines(run)
    captureRunOutputLineage(run)
    appendExecutionAttempt(run)
    const gatedCommand = providerSpawnGate ? process.execPath : launchSpec.command
    const gatedArgs = providerSpawnGate
      ? [PROVIDER_SPAWN_TRAMPOLINE, launchSpec.command, ...launchSpec.args]
      : launchSpec.args
    const gatedEnv = providerSpawnGate
      ? {
          ...launchSpec.env,
          [PROVIDER_SPAWN_GATE_DIR_ENV]: providerSpawnGate.directory,
          [PROVIDER_SPAWN_GATE_TOKEN_ENV]: providerSpawnGate.releaseToken,
        }
      : launchSpec.env
    child = execa(gatedCommand, gatedArgs, {
      cwd: launchSpec.cwd,
      env: gatedEnv,
      extendEnv: false,
      stdin: launchSpec.input === undefined ? 'ignore' : 'pipe',
      input: launchSpec.input,
      stdout: 'pipe',
      stderr: 'pipe',
      buffer: false,
      reject: false,
      // own process group (setsid) so cancel() can kill the WHOLE tree — claude + every tool/subagent
      // process it spawns — with one group signal. Without this, kill() hits only the top pid and the
      // descendants orphan and keep running (the "stop doesn't work" bug). We never unref it: the engine
      // tracks the child for streaming + finalize, and on cancel we group-kill it explicitly.
      detached: true,
    })
  } catch (e: any) {
    run.outputLineageAttempt = undefined // execa never returned a child; no provider bytes can exist
    try {
      await preparedTransaction?.rollbackIfUnstarted(
        `provider spawn failed: ${String(e?.message || e)}`, preparedAttemptId,
      )
    } catch {}
    if (providerSpawnGate) {
      try { removeProviderSpawnGate(providerSpawnGate.gateId) } catch { /* execa returned no child */ }
    }
    releaseProviderLaunchResources(run)
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed', message: String(e?.message || e), ts: Date.now() })
    finishRun(run, 'error')
    throw Object.assign(new Error(`Failed to spawn ${run.provider} CLI`), { statusCode: 500 })
  }

  run.child = child
  run.processGroupPid = child.pid
  let processLeaseSealed = false
  try {
    // The detached child is a non-spending trampoline while a run-plan transaction owns it. Persist its
    // exact process-group identity first, then fsync the matching transaction proof. Only after both are
    // durable may the one-shot release file appear and let the trampoline invoke the provider.
    const proof = persistProviderProcessLease(run, providerSpawnGate)
    processLeaseSealed = true
    recordProviderSpawnGateProcessProof(providerSpawnGate, proof)
    if (preparedTransaction) {
      await preparedTransaction.markPaidChildSpawnReady(preparedAttemptId!, proof)
    }
    releaseProviderSpawnGate(providerSpawnGate)
  } catch (error: any) {
    const gateState = providerSpawnGate
      ? inspectProviderSpawnGate(providerSpawnGate.gateId)
      : null
    const paidMayHaveStarted = gateState !== null
      && gateState.state !== 'waiting' && gateState.state !== 'aborted'
    try { if (child.pid) process.kill(-child.pid, 'SIGKILL') } catch { /* exited during sealing */ }
    try { await child } catch { /* reject:false normally resolves */ }
    if (child.pid) await holdClaimsUntilProcessGroupExtinct(child.pid)
    settleRunOutputLineage(run)
    if (!paidMayHaveStarted) {
      try {
        await preparedTransaction?.rollbackIfUnstarted(
          `provider spawn proof could not be sealed: ${String(error?.message || error)}`,
          preparedAttemptId,
        )
      } catch { /* original sealing error wins */ }
      if (processLeaseSealed) clearProviderProcessLease(run.runId)
      else if (providerSpawnGate) {
        try { removeProviderSpawnGate(providerSpawnGate.gateId) } catch { /* no paid command was released */ }
      }
    } else {
      // A released/unsafe gate means the provider may have observed its input. Preserve the exact root and
      // seal recovery authority; never roll it back or silently create a second paid attempt.
      try { writeInterruptionMarker(run, 'provider_spawn_receipt_failed', String(error?.message || error)) } catch { /* surfaced below */ }
    }
    releaseProviderLaunchResources(run)
    emit(run, {
      type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed',
      message: `provider process identity could not be sealed: ${String(error?.message || error)}`, ts: Date.now(),
    })
    finishRun(run, 'error')
    throw Object.assign(new Error('Failed to seal provider process identity'), { statusCode: 500 })
  }
  try {
    await preparedTransaction?.markPaidChildStarted(preparedAttemptId!)
  } catch (error: any) {
    try { if (child.pid) process.kill(-child.pid, 'SIGKILL') } catch { /* exited between spawn and receipt */ }
    try { await child } catch { /* reject:false normally resolves */ }
    if (child.pid) await holdClaimsUntilProcessGroupExtinct(child.pid)
    settleRunOutputLineage(run)
    // The gate was released before this journal promotion. The provider may have spent, so this is an
    // exact-root interruption—not a pre-spend rollback—and the durable gate remains the no-retry seal.
    try { writeInterruptionMarker(run, 'provider_start_receipt_failed', String(error?.message || error)) } catch { /* surfaced below */ }
    clearProviderProcessLease(run.runId, true)
    releaseProviderLaunchResources(run)
    emit(run, {
      type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed',
      message: `provider start could not be sealed to its request receipt: ${String(error?.message || error)}`, ts: Date.now(),
    })
    finishRun(run, 'error')
    throw Object.assign(new Error('Failed to seal provider start receipt'), { statusCode: 500 })
  }
  // Install close ownership as soon as the paid child exists. Usually execa's real close callback wins;
  // if that notification is lost after PID exit, this bounded fallback prevents a permanent subject pin.
  armTerminalCloseWatchdog(run)

  // STALL WATCHDOG — nothing else in the engine notices a hung child. `lastStdoutAt` was already
  // recorded (and shown on the heartbeat) but nothing ever acted on it, so a wedged run held its slot
  // silently and forever. Any stdout at all counts as alive, so this never touches a slow-but-working
  // run; only true silence trips it, and it stops the run through the ordinary cancel path so the
  // group-kill, markers and activity-log note all behave exactly as a user-initiated stop would.
  let stallTimer: NodeJS.Timeout | null = null
  // Declared BEFORE the interval so the callback can clear ITSELF. Defensive endedAt checks also stop the
  // timer if any close fallback has already finalized the run.
  const clearStallTimer = () => { if (stallTimer) { clearInterval(stallTimer); stallTimer = null } }
  if (RUN_STALL_MINUTES > 0) {
    const stallMs = RUN_STALL_MINUTES * 60_000
    stallTimer = setInterval(() => {
      if (run.endedAt !== undefined) { clearStallTimer(); return }
      const since = Date.now() - (run.lastStdoutAt ?? run.startedAt)
      if (since < stallMs) return
      run.note = `stalled: no output for ${Math.round(since / 60_000)} min — stopped by the stall guard`
      console.log(`[stall-guard] ${run.ticker} ${run.kind}${run.module ? ` ${run.module}` : ''}: no output for ${Math.round(since / 60_000)} min — stopping`)
      clearStallTimer() // one cancel is enough; never re-fire while the kill is in flight
      void cancel(run.runId).catch(() => { /* best-effort; the close handler still finalizes */ })
    }, 60_000)
    stallTimer.unref?.()
  }
  run.status = 'running'
  // One logical cockpit run has one started event and one audit-launch row. A bounded Codex continuation
  // swaps only the provider process underneath that RunState and was already surfaced as run-activity.
  if ((run.automaticContinuationCount ?? 0) === 0) {
    emit(run, {
      type: 'run-started', runId: run.runId, kind: run.kind, ticker: run.ticker,
      runRoot: run.runRoot, willCommitToMain: run.willCommitToMain,
      continuation: run.continuation,
      provider: run.provider, executionProfile: run.executionProfile, profileKey: run.profileKey,
      model: run.model, reasoningLevel: run.reasoningLevel, cliVersion: run.cliVersion,
      ...(run.swarmId !== 'research' ? { swarm: run.swarmId } : {}), ts: Date.now(),
    })

    // perpetual audit record: who launched what, when, on which company (finish is logged in finishRun)
    logLaunch({
      runId: run.runId, user: run.user, userVia: run.userVia, kind: run.kind, ticker: run.ticker,
      runRoot: run.runRoot ?? undefined, module: run.module, agent: run.agent, provider: run.provider,
      executionProfile: run.executionProfile, profileKey: run.profileKey, model: run.model,
      reasoningLevel: run.reasoningLevel, cliVersion: run.cliVersion, chained: run.chained,
      chainId: run.chainId, executionEpoch: run.provenanceEpoch, swarm: run.swarmId,
      scopeFingerprint: launchScopeFingerprint(run.swarmId, run.kind, run.module, run.agent),
    })
  }

  // line-buffered stdout -> stream parser
  let buf = ''
  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', (chunk: string) => {
    run.lastStdoutAt = Date.now() // any output at all = the engine is alive (heartbeat payload)
    buf += chunk
    let idx: number
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx)
      buf = buf.slice(idx + 1)
      handleStreamLine(run, line)
    }
  })
  let stderr = ''
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk: string) => {
    stderr += chunk
    if (stderr.length > 8000) stderr = stderr.slice(-8000)
  })

  const onClose = async (res: any) => {
    // Claim close before the first sweep/await. Reaper/watchdog may observe the PID as dead in this exact
    // interval, but must share this handler's proof instead of finalizing the run as abandoned.
    terminalCloseHandlers.add(run)
    stopTerminalCloseWatchdog(run)
    clearStallTimer()
    const closeGroupProof = await proveCloseProcessGroupExtinct(run.child?.pid)
    if (!closeGroupProof.extinct) {
      // eslint-disable-next-line no-console
      console.error(`[close] ${run.subjectId}: detached descendants survived SIGKILL after leader exit; retaining claims until the kernel proves the process group extinct`)
      await holdClaimsUntilProcessGroupExtinct(run.child?.pid)
    }
    if (buf.trim()) {
      handleStreamLine(run, buf)
      buf = ''
    }
    // heal any file event the watcher missed in the final moments (awaitWriteFinish hold vs exit)
    sweepRunOutputs(run)
    const lineageFailure = settleRunOutputLineage(run)
    if (lineageFailure && !run.cancelRequested && (run.status as string) !== 'cancelled') {
      run.streamFailure = {
        reason: 'output_lineage_failed',
        message: `completed output lineage could not be sealed: ${lineageFailure}`,
      }
      run.note = run.streamFailure.message
    }
    // Codex can end a clean parent turn after one native child even though the canonical filesystem graph
    // is still incomplete. Continue inside this exact admitted RunState: no second frontend POST, no new
    // run/root/provider/profile, and no publication between processes. Claude never enters this branch.
    if (await continueIncompleteCodexProcess(
      run, res, stderr, closeGroupProof.descendantObserved, publicationSocket,
    )) return
    // A clean exact-resume module is not done until its completed module directory is proven on origin/main.
    // Keep the subject/write claims live while this awaits, so no second run can race the terminal commit.
    // Failed/cancelled/truncated children retain their ordinary outcome and do not attempt publication.
    let childCouldReportDone = childCouldReportDoneOnClose(run, res)
    if (childCouldReportDone && run.willCommitToMain && run.runRoot) {
      const metrics = await writeAgentMetrics(run)
      if (metrics) {
        run.supervisorPublicationArtifacts = [...new Set([
          ...(run.supervisorPublicationArtifacts ?? []), `${run.runRoot}/${metrics}`,
        ])]
      }
    }
    let publicationDrainError: string | null = null
    const memoryResult = await finalizeResearchMemory(run, childCouldReportDone)
    if (childCouldReportDone && !memoryResult.ok) {
      childCouldReportDone = false
      publicationDrainError = `memory contract failed: ${memoryResult.error || 'coverage/attestation invalid'}`
      run.note = publicationDrainError
      publicationIntentsByRun.delete(run)
      run.publicationToken = undefined
    }
    if (childCouldReportDone && (run.publicationRequested || run.willCommitToMain)) {
      try {
        await drainPublicationIntents(run)
      } catch (error: any) {
        publicationDrainError = String(error?.message || error)
        run.publicationError = publicationDrainError
        run.publicationPhase = 'terminal-failed'
        run.publicationToken = undefined
      }
    } else if (!childCouldReportDone) {
      publicationIntentsByRun.delete(run)
      run.publicationToken = undefined
    }
    let terminalProof: PreSpawnGuardResult = { ok: true }
    let terminalWork: Promise<PreSpawnGuardResult> | undefined
    try {
      // Even when a descendant survived, exact output recovery still runs — but only AFTER group extinction.
      // A valid synthesis gets its content-bound pending marker/publication attempt; invalid/truncated 99 fails
      // the guard and remains runnable. Skipping this would leave a mechanically valid local 99 with neither
      // publication receipt nor a way for the plan to retry it.
      if (childCouldReportDone && !publicationDrainError && terminalGuards.has(run)) {
        terminalWork = beginTerminalGuardWork(run)
        terminalProof = await terminalWork
        if (!terminalProof.ok) {
          // A clean child can still fail before Git starts because its durable publication marker could not
          // be written, or because its completed bytes stopped validating. Re-run marker-only recovery while
          // close owns every claim: a verified existing/new marker keeps publish retry actionable; otherwise
          // the exact 99 is quarantined so completion cannot misclassify it as done.
          recoverNonCleanExactClose(run)
        }
      } else {
        // Serialize behind any already-owned terminal work before marker-only recovery. The lost-close
        // watchdog no longer starts publication, but this also keeps injected/legacy work from racing the
        // content fingerprint and marker. Its proof is ignored for a non-clean authoritative close result.
        terminalWork = terminalWorkByRun.get(run)
        if (terminalWork) await terminalWork
        recoverNonCleanExactClose(run)
      }
      terminalProof = descendantCloseTerminalProof(
        closeGroupProof.descendantObserved, childCouldReportDone, terminalProof,
      )

      let finalResult = res
      const cleanExit = !res?.failed && !res?.isTerminated && (res?.exitCode === 0 || res?.exitCode === undefined)
      if (publicationDrainError) {
        run.note = `publication failed: ${publicationDrainError}`
        stderr = `${stderr}\nSupervisor publication failed: ${publicationDrainError}`.trim()
        finalResult = { ...res, failed: true, exitCode: 5, shortMessage: publicationDrainError }
      }
      if (run.publicationCompleted && run.publicationArtifactHashes) {
        const changed = Object.entries(run.publicationArtifactHashes).find(([relative, expected]) => {
          try {
            const absolute = path.join(REPO_ROOT, relative)
            assertRegularArtifact(absolute, 'published terminal artifact')
            return `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}` !== expected
          } catch { return true }
        })
        if (changed) {
          run.publicationCompleted = false
          run.publicationError = `published terminal artifact changed after supervisor stamping: ${changed[0]}`
        }
      }
      if (cleanExit && run.willCommitToMain && !run.publicationCompleted && run.status !== 'cancelled') {
        const reason = run.publicationError || 'the provider exited without a supervisor-owned publication request'
        run.publicationError = reason
        run.note = `publication failed: ${reason}`
        stderr = `${stderr}\nSupervisor publication failed: ${publicationFailureMessage(run, reason)}`.trim()
      }
      await awaitProviderProcessGroupExit(run)
      finalizeRunOnClose(run, finalResult, stderr, terminalProof)
    } finally {
      // Keep the writer token through finalizeRunOnClose itself. Removing it immediately after the await
      // leaves a microtask-sized window where force can admit before endedAt/claims are released coherently.
      if (terminalWork) clearTerminalGuardWork(run, terminalWork)
    }
  }
  // Pass both fulfillment/rejection directly to the guarded handler. Using `.then(onClose).catch(onClose)`
  // would call it twice if its awaited terminal proof ever rejected; evaluateTerminalGuard itself never throws.
  void child.then(onClose, onClose).catch((error) => {
    // The only awaited operation is process-group drainage. Keep the run in flight on an unexpected
    // drain failure instead of releasing a slot while a same-root writer may still be alive.
    run.note = `terminal process group could not be confirmed stopped: ${String(error?.message || error)}`
    console.error(`[provider] ${run.note}`) // eslint-disable-line no-console
  })
}

// Kill the run's WHOLE process tree promptly. The detached spawn put claude in its own process group, so
// a negative-pid signal reaches claude AND every tool/subagent process it spawned — fixing the bug where
// kill() hit only the top pid and the descendants kept running. SIGTERM first (lets claude flush / abort a
// commit cleanly), then SIGKILL the group ~2s later if anything survives. Falls back to a single-pid kill
// if the group signal can't be sent. endedAt-gated so it stands down once the run has finalized.
function killProcessTree(run: RunState): void {
  const child = run.child
  if (!child) return
  const pid = child.pid
  run.processGroupPid = pid
  run.processGroupKillRequested = true
  const sigGroup = (sig: NodeJS.Signals) => {
    if (pid) { try { process.kill(-pid, sig); return } catch { /* not a group leader / already gone */ } }
    try { child.kill(sig) } catch { /* already dead */ }
  }
  sigGroup('SIGTERM')
  // A leader can close/finalize while a detached Task/tool descendant survives. Probe the process GROUP,
  // not endedAt, before the fallback kill so a late descendant cannot keep writing after cancellation.
  setTimeout(() => { if (processTreeAlive(pid)) sigGroup('SIGKILL') }, 2000)
}

function processGroupAlive(pid: number | undefined): boolean {
  if (!pid) return false
  try { process.kill(-pid, 0); return true } catch (error: any) { return error?.code === 'EPERM' }
}

export async function awaitProviderProcessGroupExit(run: RunState): Promise<void> {
  if (!run.processGroupPid) return
  const pid = run.processGroupPid
  // A clean leader exit is not proof that Task descendants exited. Once the provider leader closes,
  // remaining members are orphans; terminate them before releasing admission just as cancel() does.
  if (processGroupAlive(pid) && !run.processGroupKillRequested) {
    run.processGroupKillRequested = true
    try { process.kill(-pid, 'SIGTERM') } catch { /* group exited between probe and signal */ }
  }
  const deadline = Date.now() + 2000
  while (processGroupAlive(pid)) {
    if (Date.now() >= deadline) {
      try { process.kill(-pid, 'SIGKILL') } catch { /* group exited between probe and signal */ }
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 25))
  }
}

export async function cancel(runId: string): Promise<boolean> {
  const run = getRun(runId)
  if (!run || run.endedAt !== undefined) return false // gone, or already finalized
  const protectedChain = preparedRunPlanTransactionByRun.get(run)?.transaction
  if (run.chained && protectedChain) {
    if (!run.chainId || !run.runRoot) {
      throw new Error('protected chained run lost its exact cancellation identity')
    }
    // This fsynced terminal receipt is the first cancellation side effect. A crash after the visible
    // `.aborted` marker or SIGTERM must never let startup rediscover and resume the protected chain.
    await protectedChain.cancelChainIntent({
      requestId: protectedChain.requestId,
      chainId: run.chainId,
      targetRunRoot: run.runRoot,
    })
  }
  run.cancelRequested = true // honored by spawnEngine if the child isn't up yet (the gate-proceed buildArgs window)
  // A user-initiated cancel of a screener signal is a deliberate stop, NOT a breakage. Drop a marker in
  // its run folder so the auto-resume scan (listResumableSignals) never resurrects it on the next reconnect.
  if (run.kind === 'signal') {
    try {
      // rebuild + containment-check the run dir from the validated subject id (same CWE-22 barrier as .target)
      const dir = screenerMarkerDir(run.swarmId, run.subjectId)
      if (dir) {
        writeRunMarker(run.runRoot, '.aborted', { reason: 'cancelled' })
      }
    } catch {
      /* best-effort marker; a missing marker only risks one auto-resume the user can re-cancel */
    }
  }
  // The research equivalent: a deliberately-stopped full company run must never be auto-resumed by the
  // supervisor. Drop .aborted in its run folder and clear any interrupted-marker. (Marker writes are
  // contained under analyses/ by writeRunMarker; best-effort, never throws into cancel.)
  if (isResumableTerminalRun(run)) {
    writeRunMarker(run.runRoot, '.aborted', { reason: 'cancelled' })
    clearRunMarker(run.runRoot, '.interrupted')
  }
  // A chained full-run step: halt the chain HERE (any cancel path) so the next module can never launch —
  // not only on the stop-everything kill switch. Without this, cancelling one step could still advance.
  if (run.chained) haltChain(run.chainId)
  if (run.chained && run.chainId && !run.child) {
    resolveChainedReadiness(run.chainId, run.runId, {
      action: 'cancel', user: run.user, report: run.readiness ?? null,
    })
  }
  // The readiness extractor is a detached writer too: it can own `_pool_extracts` and converter children
  // even though `run.child` is still null. Stop and PROVE that whole group is gone before releasing the
  // subject/deploy reservation or calling finishRun. The chain-id kill switch above already prevents the
  // scheduler from launching its next paid module during this bounded drain.
  await abortChainedReadiness(run.chainId)
  await abortRunReadiness(run)
  if (run.chained) haltSubjectChains(run.subjectId, run.swarmId)
  if (run.endedAt !== undefined) return true

  // The paid child has already exited, but the exact module's terminal publisher is still a live writer.
  // Record the user's stop request without changing the in-flight status or releasing admission claims;
  // onClose will finish it as cancelled only after publication settles and its marker is durable.
  if (runHasUnfinishedTerminalWork(run)) return true

  // No child yet: the run is pre-spawn — parked at the readiness gate, or in the proceedSpawn->spawnEngine
  // buildArgs window. There is no process to signal and no onClose will fire, so handle it here.
  if (!run.child) {
    // mid-spawn window (proceedSpawn set status='running' before spawnEngine's buildArgs await): just mark
    // it; spawnEngine sees cancelRequested and finalizes before creating the child (no orphan, single emit).
    if (run.status === 'running' || run.status === 'starting') {
      run.status = 'cancelled'
      return true
    }
    // parked at the gate (readiness-checking / awaiting-readiness-decision): finalize directly here.
    emit(run, { type: 'run-error', runId, status: 'cancelled', reason: 'cancelled_at_readiness_gate', ts: Date.now() })
    finishRun(run, 'cancelled')
    return true
  }

  // Keep the admission claim while the detached process group drains. If status became `cancelled`
  // before group exit, ordinary relaunch (without force) could overlap a surviving Task writer.
  killProcessTree(run)
  if (!(await awaitRunsExited([run]))) {
    run.note = 'cancellation requested, but the detached provider process group has not drained'
    const error: any = new Error(run.note)
    error.statusCode = 409
    error.code = 'process_group_draining'
    throw error
  }
  // Group drainage is the writer-safety boundary. Finalize here if the execa close callback has not yet
  // won the race; its endedAt guard makes the later callback a no-op.
  if (run.endedAt === undefined) {
    run.status = 'cancelled'
    finalizeRunOnClose(run, { isTerminated: true, signal: 'SIGKILL' }, '')
  }
  return true
}

// Run the deterministic data-readiness check for a run, record + emit the report. force re-reads a
// just-fixed pool. A check that itself THROWS fails SAFE — it returns a blocker, never a silent proceed.
interface ActiveReadinessAssessment {
  controller: AbortController
  settled: Promise<void>
}

const activeReadinessByRun = new WeakMap<RunState, ActiveReadinessAssessment>()

async function abortRunReadiness(run: RunState): Promise<void> {
  const active = activeReadinessByRun.get(run)
  if (!active) return
  active.controller.abort(new ReadinessCancelledError('run readiness cancelled'))
  await active.settled
}

async function checkReadiness(
  run: RunState,
  force: boolean,
  parentSignal?: AbortSignal,
): Promise<ReadinessReport> {
  const controller = new AbortController()
  const onParentAbort = () => controller.abort(parentSignal?.reason)
  if (parentSignal?.aborted) onParentAbort()
  else parentSignal?.addEventListener('abort', onParentAbort, { once: true })
  let settle!: () => void
  const settled = new Promise<void>((resolve) => { settle = resolve })
  const active = { controller, settled }
  activeReadinessByRun.set(run, active)
  try {
    const scope = readinessScopeForRun(run)
    const report = await runReadiness(run.ticker, scope.kind, scope.module, {
      outDir: path.join(REPO_ROOT, run.runRoot!, '_pool_extracts'),
      force,
      signal: controller.signal,
    })
    run.readiness = report
    emit(run, { type: 'readiness-report', runId: run.runId, report, ts: Date.now() })
    return report
  } catch (e) {
    if (controller.signal.aborted || isReadinessCancelledError(e)) throw new ReadinessCancelledError()
    console.warn(`[readiness] check threw for ${run.ticker} (${run.kind}); failing safe to a blocker:`, (e as Error)?.message || e)
    const report: ReadinessReport = {
      ticker: run.ticker, kind: run.kind, module: run.module, overall: 'blocked',
      fileCount: 0, usableCount: 0, entities: [],
      physicalPool: {
        state: 'unknown', fileCount: 0, nonEmptyFileCount: 0,
        reason: 'readiness_check_threw',
      },
      issues: [{
        code: 'check_failed', severity: 'blocker',
        message: 'The safety checker had a technical error. This does not mean your files are bad.',
        evidence: 'No provider was started and no tokens were spent.',
        suggestedFix: 'Try the check once more. If it returns, the checker needs repair; your files were not judged bad.',
      }],
      ts: Date.now(),
    }
    run.readiness = report
    emit(run, { type: 'readiness-report', runId: run.runId, report, ts: Date.now() })
    return report
  } finally {
    parentSignal?.removeEventListener('abort', onParentAbort)
    if (activeReadinessByRun.get(run) === active) activeReadinessByRun.delete(run)
    settle()
  }
}

/** Every chained child is a piece of one full/continue decision, not a standalone request. */
export function readinessScopeForRun(
  run: Pick<RunState, 'kind' | 'module' | 'chained'>,
): { kind: RunKind; module?: string } {
  return run.chained
    ? { kind: 'full' }
    : { kind: run.kind, module: run.module }
}

/** A chain-level human decision is justified only by a complete parser-free proof that the pool contains
 * no non-empty bytes. Parser usability is deliberately irrelevant: a corrupt or unsupported non-empty
 * file is data for the in-run triage, not an empty pool. */
export function readinessProvesEmpty(report: ReadinessReport): boolean {
  return report.physicalPool?.state === 'empty'
    && report.physicalPool.nonEmptyFileCount === 0
    && report.physicalPool.fileCount === report.fileCount
    && (
      (report.physicalPool.fileCount === 0
        && report.issues.some((issue) => issue.code === 'zero_files'))
      || (report.physicalPool.fileCount > 0
        && report.issues.some((issue) => issue.code === 'zero_usable_data'))
    )
}

/** Once a full/continue chain is admitted, every non-empty gap becomes an in-run evidence cap. Only a
 * proven empty pool may ask once. Standalone module/agent routes keep their existing strict behavior. */
export function readinessNeedsDecision(
  run: Pick<RunState, 'kind' | 'chained'>,
  report: ReadinessReport,
): boolean {
  if (run.chained) return readinessProvesEmpty(report)
  if (report.overall === 'clean') return false
  return true
}

// Pre-spawn data-readiness gate. Research data-consuming kinds only (swarm kinds skip it); sets
// readiness-checking, then runs the check.
async function runReadinessGate(run: RunState): Promise<{
  chainId: string
  owner: boolean
  resolution: Promise<ChainedReadinessResolution>
} | null> {
  // Research data-consuming kinds only. Screener kinds aren't in the list below; a generic constellation
  // swarm (e.g. commodity) reuses full/module/agent but owns its sufficiency via its own in-run 00-triage
  // (and reads live public sources, not a company data pool), so it skips this research readiness gate.
  if (run.swarmId !== 'research') return null
  if (!run.runRoot || !['full', 'module', 'agent', 'rerun'].includes(run.kind)) return null
  // The terminal canary follows a completed, readiness-scoped module DAG. Re-running the full gate here
  // could park the one terminal adjudicator after every module already finished, with no logical parent
  // RunState for the operator to resolve. Child gates remain authoritative for the frozen chain.
  if (run.parityCanary && run.parityCanaryStage === 'final') return null
  run.status = 'readiness-checking'
  emit(run, { type: 'readiness-checking', runId: run.runId, ticker: run.ticker, kind: run.kind, ts: Date.now() })
  if (!run.chained || !run.chainId) {
    await checkReadiness(run, false)
    return null
  }

  const assessment = await assessChainedReadinessOnce(
    run.chainId,
    run.runId,
    { ticker: run.ticker, runRoot: run.runRoot },
    (signal) => checkReadiness(run, false, signal),
    { requireExistingReceipt: durableFrozenGenerationReuseRuns.has(run) },
  )
  if (!assessment.owner) {
    // checkReadiness writes/emits only for the owner that actually evaluated. Give every child the same
    // immutable report for Activity/provenance without touching the data pool again.
    run.readiness = assessment.report
    emit(run, { type: 'readiness-report', runId: run.runId, report: assessment.report, ts: Date.now() })
  }
  if (assessment.owner && !readinessProvesEmpty(assessment.report)) {
    resolveChainedReadiness(run.chainId, run.runId, {
      action: 'proceed', user: 'chain-supervisor', report: assessment.report,
    })
  }
  return { chainId: run.chainId, owner: assessment.owner, resolution: assessment.resolution }
}

// Resolve a run paused at the data-readiness gate (status awaiting-readiness-decision).
export async function decideReadiness(
  runId: string,
  action: ReadinessDecision['action'],
  user: string,
  acknowledgedText?: string,
): Promise<{ ok: boolean; status: string; report?: ReadinessReport; error?: string; httpStatus?: number }> {
  const run = getRun(runId)
  if (!run) return { ok: false, status: 'not_found', error: 'no such run', httpStatus: 404 }
  if (run.status !== 'awaiting-readiness-decision') {
    return { ok: false, status: run.status, error: 'run is not awaiting a readiness decision', httpStatus: 409 }
  }

  if (action === 'cancel') {
    if (run.chained && run.chainId) {
      haltChain(run.chainId)
      resolveChainedReadiness(run.chainId, run.runId, {
        action: 'cancel', user, acknowledgedText, report: run.readiness ?? null,
      })
    }
    // Ordinarily this status means the check already settled. Keep the terminal boundary defensive: a
    // future event-order change must not let this direct decision route release the run while a recheck or
    // converter descendant still owns `_pool_extracts`.
    await abortChainedReadiness(run.chainId)
    await abortRunReadiness(run)
    if (run.endedAt !== undefined) return { ok: true, status: 'cancelled' }
    emit(run, { type: 'readiness-resolved', runId, action: 'cancel', ts: Date.now() })
    emit(run, { type: 'run-error', runId, status: 'cancelled', reason: 'cancelled_at_readiness_gate', ts: Date.now() })
    finishRun(run, 'cancelled')
    return { ok: true, status: 'cancelled' }
  }

  if (action === 'recheck') {
    const retainedChain = run.chained && run.chainId ? chainedReadinessById.get(run.chainId) : undefined
    if (retainedChain?.requireExistingReceipt) {
      return {
        ok: false,
        status: run.status,
        error: 'This saved run is bound to its original data snapshot and cannot be re-checked against live data.',
        httpStatus: 409,
      }
    }
    // Claim the run SYNCHRONOUSLY (before the async re-check's await) so a concurrent decision — a
    // double-clicked re-check, or a recheck racing a proceed — hits the entry guard and is rejected,
    // instead of both passing it and each calling proceedSpawn (which would spawn TWO engine CLIs for one
    // run, both committing to main). readiness-checking is an IN_FLIGHT status and cancel() treats it as
    // gate-parked, so a cancel landing mid-recheck still finalizes (caught by the endedAt re-check below).
    run.status = 'readiness-checking'
    // Tell the open gate panel a re-check is in flight (the initial gate emits this too, at
    // runReadinessGate). Without it the panel looks frozen for the whole check — which can be
    // minutes when OCR runs on a fresh scanned pool — and the user clicks dead buttons.
    emit(run, { type: 'readiness-checking', runId: run.runId, ticker: run.ticker, kind: run.kind, ts: Date.now() })
    // EARLY ACK — this was the single slowest response-held path in the API: checkReadiness(force)
    // re-extracts the ENTIRE pool with the cache bypassed (OCR re-budgeted — minutes on a scanned
    // pool) while the gate panel's button spinner waited on this response. The panel already listens
    // to the readiness-checking / readiness-report / readiness-resolved SSE events this flow emits,
    // so the held response carried nothing it needed. Outcomes ride SSE; failures fail safe to a
    // blocker report inside checkReadiness itself.
    void (async () => {
      const report = await checkReadiness(run, true)
      if (run.endedAt !== undefined) return // cancelled mid-recheck
      if (run.chained && run.chainId) replaceChainedReadinessReport(run.chainId, run.runId, report)
      if (readinessNeedsDecision(run, report)) {
        run.status = 'awaiting-readiness-decision' // still gated — re-open for another decision
        emit(run, { type: 'readiness-blocked', runId: run.runId, report, ts: Date.now() })
        return
      }
      await proceedSpawn(run, 'recheck', user) // the pool was fixed -> proceed CLEAN, no override trace
    })().catch((error: unknown) => {
      if (run.endedAt !== undefined || run.cancelRequested || isReadinessCancelledError(error)) return
      // The checker itself normally returns a report, but the immutable-generation verifier can still
      // reject a missing/replaced/legacy receipt. Keep the pre-spend run recoverable and visibly gated;
      // never leave it stuck at "checking" and never fall through to an unbound provider spawn.
      const prior = run.readiness
      const report: ReadinessReport = {
        ticker: run.ticker,
        kind: run.kind,
        module: run.module,
        overall: 'blocked',
        fileCount: prior?.fileCount ?? 0,
        usableCount: prior?.usableCount ?? 0,
        physicalPool: prior?.physicalPool,
        entities: prior?.entities ?? [],
        issues: [{
          code: 'check_failed',
          severity: 'blocker',
          message: 'The immutable data snapshot could not be verified. No provider was started.',
          evidence: error instanceof Error ? error.message : String(error),
          suggestedFix: 'Re-check to build and verify one complete data snapshot, or cancel.',
        }],
        ts: Date.now(),
      }
      run.readiness = report
      run.status = 'awaiting-readiness-decision'
      emit(run, { type: 'readiness-report', runId: run.runId, report, ts: Date.now() })
      emit(run, { type: 'readiness-blocked', runId: run.runId, report, ts: Date.now() })
    })
    return { ok: true, status: 'readiness-checking' }
  }

  if (run.chained && run.readiness && readinessProvesEmpty(run.readiness)) {
    return {
      ok: false, status: 'awaiting-readiness-decision', httpStatus: 409,
      error: 'the data folder is empty — add files and recheck, or cancel; running anyway is unavailable',
    }
  }

  // proceed / override — a human chooses to run on a STILL-non-clean gate
  // A technical failure is not a data judgment the user can knowingly accept.
  // Keep it fail-closed even when a caller bypasses the UI and POSTs a typed
  // override directly: only recheck or cancel are legal until the checker can
  // produce a schema-valid report.
  const checkerFailed = !!run.readiness?.issues?.some((i) => i.code === 'check_failed')
  if (checkerFailed) {
    return {
      ok: false, status: 'awaiting-readiness-decision', httpStatus: 409,
      error: 'the safety checker had a technical error — recheck or cancel; override is unavailable',
    }
  }
  const hasBlocker = !!run.readiness?.issues?.some((i) => i.severity === 'blocker')
  if (hasBlocker && action !== 'override') {
    return { ok: false, status: 'awaiting-readiness-decision', error: 'blockers present — use override with a typed acknowledgment', httpStatus: 409 }
  }
  if (action === 'override' && hasBlocker && acknowledgedText?.trim().toUpperCase() !== run.ticker.toUpperCase()) {
    return { ok: false, status: 'awaiting-readiness-decision', error: `type the ticker (${run.ticker}) to acknowledge overriding the blocker`, httpStatus: 412 }
  }
  writeReadinessOverride(run, user, acknowledgedText) // indelible trace — a human accepted the gaps
  return proceedSpawn(run, action, user, acknowledgedText)
}

// Record the gate decision, emit, and spawn the deferred engine. Shared by proceed / override / recheck-clean.
async function proceedSpawn(
  run: RunState, action: ReadinessDecision['action'], user: string, acknowledgedText?: string,
): Promise<{ ok: boolean; status: string; error?: string; httpStatus?: number }> {
  // A cancel() that landed during decideReadiness's own await (recheck re-runs the async check) finalizes
  // the run. Never revive a finalized run to 'running' or spawn its engine.
  if (run.endedAt !== undefined) return { ok: false, status: 'cancelled', error: 'run was cancelled', httpStatus: 409 }
  // Flip the status SYNCHRONOUSLY (before the first await) so a concurrent decision — a double-click — sees
  // a non-awaiting status and is rejected by decideReadiness's guard (else both spawn a CLI for one run).
  run.status = 'running'
  run.readinessDecision = { action, user, acknowledgedText, ts: Date.now() }
  if (run.chained && run.chainId) {
    resolveChainedReadiness(run.chainId, run.runId, {
      action, user, acknowledgedText, report: run.readiness ?? null,
    })
  }
  emit(run, { type: 'readiness-resolved', runId: run.runId, action, ts: Date.now() })
  // EARLY ACK — the guard outcomes the client needs (404/409 wrong-state for the gate panel's button
  // self-heal, 412 bad acknowledgment) were all decided before this point; the deferred spawn's own
  // outcome travels as run-started / run-error SSE (spawnEngine emits + finalizes on its own failure).
  void Promise.resolve(run.deferredSpawn?.()).catch((e: any) => {
    if (run.endedAt === undefined) {
      emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed', message: String(e?.message || e), ts: Date.now() })
      finishRun(run, 'error')
    }
  })
  return { ok: true, status: 'running' }
}

// Write the indelible override trace PRE-SPAWN (the source of truth the synthesizer merges into
// decision_record.json + a final_thesis.md banner). Override does NOT bypass caps — it records that a
// human accepted the gaps; the confidence caps still propagate from the in-run triage.
function writeReadinessOverride(run: RunState, user: string, acknowledgedText?: string): void {
  if (!run.runRoot || !run.readiness) return
  const trace = {
    ticker: run.ticker,
    decided_by: user,
    decided_at: new Date().toISOString(),
    action: run.readiness.overall === 'blocked' ? 'override-blocker' : 'proceed-degraded',
    overall: run.readiness.overall,
    acknowledged_text: acknowledgedText ?? null,
    issues: run.readiness.issues.map((i) => ({ code: i.code, severity: i.severity, message: i.message, file: i.file, module: i.module })),
  }
  try {
    const dir = path.join(REPO_ROOT, run.runRoot)
    fs.mkdirSync(dir, { recursive: true })
    writeSupervisorRunFile(run.runRoot, 'readiness_override.json', JSON.stringify(trace, null, 2) + '\n')
  } catch (e) {
    console.warn(`[readiness] could not write override trace for ${run.ticker}:`, (e as Error)?.message || e)
  }
}

/** Active provider usage probe. null is an explicit "this CLI exposes no reliable usage" signal. */
export async function checkProviderUsage(provider: RunProvider) {
  const usage = await getProviderAdapter(provider).checkUsage()
  if (usage) setCreditStatus(usage, provider)
  return usage
}

// Legacy Claude-only API used by /api/credit-check. A transient probe failure preserves last-known data.
export async function creditCheck(): Promise<ReturnType<typeof getCreditStatus>> {
  try { await checkProviderUsage('claude') } catch { /* preserve last-known Claude usage */ }
  return getCreditStatus('claude')
}
