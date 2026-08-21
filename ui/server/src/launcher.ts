import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execa, type ResultPromise } from 'execa'
import { logLaunch } from './activity-log'
import { admitRun, admissionMessage } from './admission'
import { CLAUDE_BIN, DATA_DIR, DEFAULT_MODEL, ESTIMATES, FULL_PER_MODULE, LAUNCH_GUARDS, MAX_CONCURRENT_RUNS, REPO_ROOT, type LaunchKind, RUN_STALL_MINUTES } from './config'
import { getCreditStatus, setCreditStatus } from './credit'
import { writeAgentMetrics } from './agent-metrics'
import { startRunWatcher, sweepRunOutputs } from './fs-watcher'
import { createRun, emit, finishRun, getRun, inFlightRunsForSubject, listRuns, setActiveSubjectRun, type ExpectedAgent, type RunState } from './registry'
import { clearRunMarker, resolveRunRoot, writeRunMarker } from './outputs'
import { runReadiness } from './readiness'
import { providerEnvKeys } from './load-env'
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
import type { LaunchPreflight, ReadinessDecision, ReadinessReport, RunKind, RunStatus } from './types'
import { validateAgentOutputFile } from '../../../scripts/agent-output-validity.mjs'

// Screener kinds are swarm-scoped; everything else is the research default. Generic by design:
// the kind->swarm mapping is the only place this file knows the screener exists, and it is driven
// by the discovered manifest (a missing manifest fails the launch with a clear 404).
const SCREENER_KINDS = new Set<RunKind>(['signal', 'sweep', 'screener-agent', 'handoff'])
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
function swarmStoreTargets(kind: RunKind, subjectId: string): string[] {
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

// ---- claude CLI flag capability detection (so we never pass an unknown flag) ----
let supportedFlags: Set<string> | null = null
export async function detectFlags(): Promise<Set<string>> {
  if (supportedFlags) return supportedFlags
  const flags = new Set<string>()
  try {
    const { stdout } = await execa(CLAUDE_BIN, ['--help'], { reject: false, timeout: 15000 })
    for (const m of stdout.matchAll(/--[a-z][a-z0-9-]+/g)) flags.add(m[0])
  } catch {
    /* fall back to a conservative core set */
  }
  // always-safe core flags even if --help parsing failed
  for (const f of ['--print', '--output-format', '--verbose', '--model', '--max-turns', '--permission-mode']) flags.add(f)
  supportedFlags = flags
  return flags
}

// ---- is the Claude CLI actually runnable? (cached) ----
// The cockpit reads the data pool itself but SPAWNS this CLI to run the engine. Because execa uses
// reject:false, a missing binary fails ASYNC (ENOENT) and surfaced only as a bare "error" with no
// detail. Probe once up front so a launch fails fast with an actionable message instead.
let claudeOk: boolean | null = null
/** Throw the launcher's canonical 503 when the engine CLI is missing. Exported so a route that STAGES
 *  disk state before launching (the scoped rerun) can fail on this BEFORE touching any files — the same
 *  message, one source of truth (Codex #358 r3672400207). */
export async function assertClaudeCli(): Promise<void> {
  if (await claudeAvailable()) return
  const err: any = new Error(
    `Claude CLI ('${CLAUDE_BIN}') not found on PATH — the cockpit can read the data pool but spawns the CLI to run the engine. ` +
    `Install it with \`npm i -g @anthropic-ai/claude-code\` (or set CLAUDE_BIN to its full path), then restart the cockpit server.`)
  err.statusCode = 503
  err.code = 'CLAUDE_CLI_MISSING'
  throw err
}

async function claudeAvailable(): Promise<boolean> {
  if (claudeOk !== null) return claudeOk
  try {
    const r: any = await execa(CLAUDE_BIN, ['--version'], { reject: false, timeout: 15000 })
    claudeOk = !r.failed && r.exitCode === 0
  } catch {
    claudeOk = false // ENOENT / not on PATH
  }
  return claudeOk
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

export function finalDeliverablesPresent(runRoot: string | null): boolean {
  if (!runRoot) return false
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  return fs.existsSync(path.join(root, 'final_thesis.md')) && fs.existsSync(path.join(root, 'decision_record.json'))
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
// decision_record.json; a constellation swarm (e.g. commodity) ends on decision_record.json alone —
// the same key the resume detector uses (resumable.ts). The screener (flow layout) has its own
// terminal-routing semantics and is never judged here.
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
  const root = path.isAbsolute(run.runRoot) ? run.runRoot : path.join(REPO_ROOT, run.runRoot)
  return !fs.existsSync(path.join(root, 'decision_record.json'))
}

// A full company run (monolithic `full`, or any step of a chained full) is the unit the resume
// supervisor relaunches. We mark its run folder on disk when it breaks, so the supervisor — which has
// NO in-memory state after a restart — can find and continue it. Solo `module`/`agent` runs are
// deliberate single pieces (the user ran exactly that), so a break there is NOT auto-resumed.
function isResumableResearchRun(run: RunState): boolean {
  return run.swarmId === 'research' && (run.kind === 'full' || run.chained === true)
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
  if (finalDeliverablesShippedByThisAttempt(run)) return // the run actually shipped — a trailing nonzero is not a failure
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
    fs.writeFileSync(path.join(abs, FAILURE_NOTE), md)
    commitRunFile(runRoot, FAILURE_NOTE, `Run failure note: ${run.ticker} (stopped at ${stoppedAt})`)
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

const streamResultErrors = new WeakMap<RunState, { reason: string; message: string }>()

// A structured stream error is authoritative immediately, but is not process-lifetime proof: a detached
// Task/tool descendant may still be writing. Record the SAME marker + failure-note + activity-log-note
// logic as the close-time error branch while retaining endedAt and writer claims for the group-extinct
// close finalizer. Exported so stream-parser.ts can call it; the two files import each other's exports but
// only from inside function bodies (never at module top level), which is safe under native ESM — a
// hoisted `export function` binding is live before either module's own top-level code runs.
// Fully best-effort: never throws (mirrors every other A2/A3 call site).
export function recordStreamResultFailure(run: RunState, reason: string, message: string): void {
  // Install close ownership semantics first. Persistence below is best-effort, but a filesystem failure must
  // never turn an authoritative streamed error back into a clean close or release its writer claim early.
  streamResultErrors.set(run, { reason, message })
  try {
    if (isResumableResearchRun(run) && !finalDeliverablesShippedByThisAttempt(run)) {
      writeRunMarker(run.runRoot, '.interrupted', { reason, module: run.module, message: redactSecrets((message || '').slice(-2000)) || undefined })
      recordRunFailure(run, reason, message)
    }
    run.note = failureNote(reason, message) // A3: durable reason in the activity log (shown on the row)
    // The result is authoritative, but finalization is close-owned. Keeping endedAt unset preserves subject /
    // write claims until the detached process group is extinct; otherwise a background Task can keep writing
    // after this streamed error while a replacement run has already been admitted.
  } catch { /* best-effort: must never affect the stream parser or the run */ }
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
  const code = res?.exitCode ?? res?.code
  // execa 9 reports signal termination as isTerminated/signal (exitCode undefined) — there is NO
  // `killed` property; checking only `killed` made an externally-killed run fall through to "done"
  // (and a killed handoff toast "memo seeded ✓" for a memo never written). `killed` kept for safety.
  const terminated = res?.isTerminated === true || res?.killed === true || !!res?.signal
  // A user can press Stop after the paid child has exited while the terminal Git publication proof is still
  // running. That proof remains awaited (and its pending marker remains useful on failure), but the user's
  // deliberate cancellation is still the terminal status; never rewrite it as a publication error.
  if ((run.status as string) === 'cancelled' || run.cancelRequested) {
    if (isResumableResearchRun(run)) clearRunMarker(run.runRoot, '.interrupted') // a deliberate stop — cancel() wrote .aborted; never auto-resume
    emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
    finishRun(run, 'cancelled')
  } else if (streamResultErrors.has(run)) {
    // handleStreamLine already emitted the detailed run-error and persisted the failure note. It deliberately
    // left endedAt/claims live; only this group-extinct close path may perform the terminal registry release.
    finishRun(run, 'error')
  } else if (!terminalProof.ok) {
    run.note = `incomplete: ${terminalProof.reason}`
    emit(run, {
      type: 'run-error', runId: run.runId, status: 'incomplete', reason: terminalProof.reason,
      message: terminalProof.message, ts: Date.now(),
    })
    finishRun(run, 'incomplete')
    return
  } else if (isResumableResearchRun(run) && finalDeliverablesShippedByThisAttempt(run)) {
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
    finishRun(run, 'done')
  } else if (terminated) {
    // killed from OUTSIDE cancel() (OOM killer, manual kill, parent shutdown, a dropped connection that
    // tears the process down) — an error, not a success. Mark the folder so the resume supervisor can pick
    // the broken full run back up and continue it (forever-living: a closed laptop / lost network resumes).
    const treason = `terminated_${res?.signal || 'signal'}`
    if (isResumableResearchRun(run)) {
      if (!finalDeliverablesShippedByThisAttempt(run)) writeRunMarker(run.runRoot, '.interrupted', { reason: treason, module: run.module, message: redactSecrets(stderr.slice(-2000)) || undefined })
    }
    if (shouldRecordStop(run)) recordRunFailure(run, treason, stderr) // A2: diagnosable note (self-guards + single-shot)
    run.note = failureNote(treason, stderr) // A3: durable reason in the activity log (shown on the row)
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: treason, message: stderr.slice(-400) || undefined, ts: Date.now() })
    finishRun(run, 'error')
  } else if ((code && code !== 0) || res?.failed === true) {
    // Match the CLI's own wording ("Claude AI usage limit reached", overage). The narrow
    // /credit|rate limit/ pattern labelled a real plan stop `nonzero_exit`, so no resetsAt was stamped
    // and the resume supervisor treated it as due immediately — relaunching straight back into the
    // exhausted window. Same set the sibling classifiers already use.
    const reason = /rate limit|usage limit|overage|credit/i.test(stderr) ? 'out_of_credits' : 'nonzero_exit'
    // Mark the broken full run for the resume supervisor. For an out_of_credits stop (the plan's usage
    // limit), stamp the rate-limit resetsAt so the paused run knows when it may continue WITHOUT spending
    // overage — durable on disk, so the wait survives a reboot. (A connection break shows up here as
    // nonzero_exit; it resumes on the next tick.)
    if (isResumableResearchRun(run)) {
      const resetsAt = reason === 'out_of_credits' ? getCreditStatus().resetsAt : undefined
      if (!finalDeliverablesShippedByThisAttempt(run)) writeRunMarker(run.runRoot, '.interrupted', { reason, resetsAt, module: run.module, message: redactSecrets(stderr.slice(-2000)) || undefined })
    }
    if (shouldRecordStop(run)) recordRunFailure(run, reason, stderr) // A2: diagnosable note (self-guards + single-shot)
    run.note = failureNote(reason, stderr) // A3: durable reason in the activity log (shown on the row)
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: stderr.slice(-400) || undefined, ts: Date.now() })
    finishRun(run, 'error')
  } else if (truncatedBeforeFinal(run)) {
    // The process exited cleanly, but a full/rerun that didn't write its terminal deliverable
    // (research: final thesis + decision record; constellation swarm: decision record) was almost
    // certainly budget/turn-truncated before the last synthesis finished. Report it honestly as
    // INCOMPLETE (not a misleading "done") so the cockpit + activity log show the truth and the
    // user can finish it / raise the cap.
    const orbs = run.kind === 'module' ? moduleOrbProgress(run.runRoot, run.module) : { landed: [], expected: 0 }
    const msg = run.kind === 'sweep'
      ? 'The scan ended without saving anything to the Inbox — it found no events, or it stopped before it could write. Nothing was added.'
      : run.kind === 'module'
        ? `The ${run.module} module stopped before writing its summary, so it has no result yet. `
          + `${orbs.landed.length}${orbs.expected ? ` of ${orbs.expected}` : ''} step(s) finished and were saved`
          + `${orbs.landed.length ? `: ${orbs.landed.map((f) => f.replace(/\.md$/, '')).join(', ')}` : ''}. `
          + 'Nothing is lost — re-run the module and it picks up from the steps already on disk.'
      : run.swarmId === 'research'
        ? 'Run ended without the final thesis & memo — likely budget- or turn-truncated before the master synthesizer finished. Re-run from the master (or any late orb) to finish; the cap is now higher.'
        : 'Run ended without the final dossier & decision record — likely budget- or turn-truncated before the terminal synthesis finished. Re-run the terminal module to finish.'
    run.note = run.kind === 'sweep'
      ? 'incomplete: sweep wrote no inbox file'
      : run.kind === 'module'
        ? `incomplete: ${run.module} stopped before its synthesis (${orbs.landed.length}${orbs.expected ? `/${orbs.expected}` : ''} steps saved)`
        : 'incomplete: no final thesis/decision (likely budget/turn truncation)'
    // A clean budget/turn truncation is a DELIBERATE cap, not an interruption — auto-resuming would just
    // re-hit the same cap and loop. Clear any interrupted-marker so the supervisor leaves it for the human.
    if (isResumableResearchRun(run)) clearRunMarker(run.runRoot, '.interrupted')
    // A clean truncation left NO durable trace anywhere — no marker, no off-host record — which is the
    // single reason "the module just stops" went undiagnosed for months. Record it with the same note
    // mechanism the error branches use. Deliberately NOT a .interrupted marker: that is the resume
    // QUEUE, and a deliberate cap-stop must never be auto-relaunched straight back into the cap.
    if (shouldRecordStop(run)) recordRunFailure(run, 'incomplete_deliverables', run.note ?? '')
    emit(run, { type: 'run-error', runId: run.runId, status: 'incomplete', reason: 'incomplete_deliverables', message: msg, ts: Date.now() })
    finishRun(run, 'incomplete')
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
    if (isResumableResearchRun(run) && finalDeliverablesShippedByThisAttempt(run)) {
      clearRunMarker(run.runRoot, '.interrupted')
      clearRunFailure(run.runRoot) // drop a stale RUN_FAILURE.md from an earlier break of this now-complete run
    }
    emit(run, { type: 'run-done', runId: run.runId, status: 'done', costUsd: run.costUsd, durationMs: run.durationMs, numTurns: run.numTurns, ...finalPaths(run), ts: Date.now() })
    finishRun(run, 'done')
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

// After a FORCE cancel, block until the stopped run(s)' child processes have actually EXITED before
// admission starts a replacement. cancel() only SIGTERMs (killProcessTree SIGKILLs the group +2s later)
// and returns BEFORE the process dies, yet the run has already left the in-flight status set — so without
// this wait admitRun would start a SECOND engine writing the SAME run dir concurrently. The cancelled run
// is no longer in inFlightRunsForSubject, so callers must hold the RunState objects and pass them here.
// Returns true once every child is gone; false if any is still alive at the timeout (caller must then NOT
// admit). `now`/`sleep` are injectable so the unit test drives it without real time.
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
  const anyAlive = () => runs.some((r) => processTreeAlive(r.child?.pid)
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

// Reap a single run if its engine child process is gone but onClose never fired. Returns true if it was
// finalized. Pre-spawn gate states (run.child === null: readiness-checking / awaiting-readiness-decision)
// are LEGITIMATELY waiting for the user, not dead — left untouched (a deliberate force stops those).
function reapDeadRun(r: RunState): boolean {
  if (!r.child) return false // pre-spawn gate — waiting on the human, not a dead process
  if (processTreeAlive(r.child.pid)) return false // leader or detached descendant still alive — leave it running
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
  // The child is gone but onClose never ran. Route it through the SINGLE finalizer as a termination so a
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
// the DAG-parallel scheduling FULL_PER_MODULE exists for. The race D2 would be guarding against here
// (two modules failing "at the same time" both writing+committing RUN_FAILURE.md) cannot actually happen:
// Node is single-threaded, recordRunFailure()'s dedup-check-then-set (the `recordedFailure` Set) is fully
// synchronous with no `await` in between, so two onClose callbacks landing "around the same time" still
// run to completion one at a time — the second always sees the first's dedup entry and returns before
// writing. Serialization is real, just done in-process rather than via admission's declared-write model.
const ROOT_ARTIFACTS_FULL = ['final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json', 'RUN_METADATA.md']
const ROOT_ARTIFACTS_RERUN = ['final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json']
// A screener signal run owns its whole SIG folder; these are its run-root JSON artifacts.
const ROOT_ARTIFACTS_SIGNAL = ['intake.json', 'signal_payload.json', 'thesis_record.json', 'candidates.json', 'RUN_METADATA.md']

// Subject-id shapes (mirrored in sandbox.ts for route validation).
const SIG_ID_RE = /^SIG-[0-9]{8}-[a-f0-9]{8}$/
const THESIS_ID_RE = /^THS-SIG-[0-9]{8}-[a-f0-9]{8}-v[0-9]+$/

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
  extra?: { thesisId?: string; runRoot?: string; decisionFingerprint?: string; intakeReceipt?: IntakeReceiptIntent },
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
    const ns = swarmById(swarmId)?.commandNs || swarmId
    if (kind === 'module') return `/${ns}:${module} ${ticker}`
    if (kind === 'agent') return `/${ns}:agent ${module} ${agent} ${ticker}`
    // rerun on a constellation swarm: AGENT is optional (whole-module vs single-orb). Never fall through
    // to the research `/research:rerun` line below — dispatch the swarm's own command namespace (§26).
    if (kind === 'rerun') return `/${ns}:rerun ${module}${agent ? ' ' + agent : ''} ${ticker}${exactDecisionArgs}${intakeReceiptArgs}`
    // doc-intake is the CHEAP advisory plan-writer (clone of 'review'), NOT a full run. Route it to the
    // swarm's own `:intake` command; without this branch it fell through to `/${ns}:full` below — so a
    // single landed file (the auto-analyze-on-landing signal) would trigger a full PAID run. (§26 namespace)
    if (kind === 'doc-intake') return `/${ns}:intake ${ticker}${exactDecisionArgs}`
    return `/${ns}:full ${ticker}` // 'full' (default)
  }
  if (kind === 'full') return `/research:full ${ticker}`
  if (kind === 'module') return `/research:${module} ${ticker}`
  if (kind === 'rerun') return `/research:rerun ${module} ${agent} ${ticker}${exactDecisionArgs}${intakeReceiptArgs}`
  // file one outcome review for this ticker's latest run (window defaults to ad-hoc — the "update now" snapshot).
  if (kind === 'review') return `/research:review-decisions ${ticker} ${window || 'ad-hoc'}`
  // rebuild the cross-ticker calls-tracker dashboard (ignores ticker — it is cross-ticker by design).
  if (kind === 'track') return `/research:track`
  // read the docs that landed since the ticker's last run + write a scoped rerun plan (advisory,
  // launches nothing). The command resolves the latest run root itself, like 'review'.
  if (kind === 'doc-intake') return `/research:intake ${ticker}${exactDecisionArgs}`
  // screener swarm — namespace from the manifest (never hardcode the literal beyond the kind map)
  if (SCREENER_KINDS.has(kind)) {
    const ns = swarmById(swarmId)?.commandNs || 'screener'
    if (kind === 'signal') return module ? `/${ns}:signal ${ticker} ${module}` : `/${ns}:signal ${ticker}` // ticker = SIG id; optional module = target to run THROUGH then stop
    if (kind === 'sweep') return `/${ns}:sweep`
    if (kind === 'handoff') return `/${ns}:handoff ${extra?.thesisId} ${ticker}` // ticker = the handoff target
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

export function estimate(kind: RunKind, ticker: string, module?: string, agent?: string, swarm?: string): LaunchPreflight {
  const swarmId = swarmIdFor(kind, swarm)
  const g = buildSwarmGraph(swarmId)
  let agentCount = 1
  if (kind === 'full') agentCount = g.totals.agents + 1
  else if (kind === 'signal') agentCount = g.totals.agents // gauntlet; gates mean most signals stop early
  else if (kind === 'module') agentCount = g.modules.find((m) => m.name === module)?.agentCount ?? 0
  else if (kind === 'rerun') agentCount = downstreamCascade(module!, agent, swarmId).length

  let estCostUsdRange: [number, number]
  let estMinutesRange: [number, number]
  if (kind === 'full') {
    // Calibrated to the one metered full run (TMCV, 2026-06-14): 60 orbs, $88.99, 153 min WALL-CLOCK
    // (the summed per-orb duration was ~257 min, but pipelined modules overlap, so the user waits ~153).
    // Ranged for ticker / data-volume / cache variance — an honest "~" band, not a single false-precise point.
    estCostUsdRange = [55, 130]
    estMinutesRange = [110, 210]
  } else if (kind === 'signal') {
    // a PROMOTE-to-candidates path runs every module; a Gate-0/LOG stop costs a fraction of this
    estCostUsdRange = [8, 45]
    estMinutesRange = [6, 30]
  } else if (kind === 'sweep') {
    estCostUsdRange = [2, 12]
    estMinutesRange = [3, 10]
  } else if (kind === 'handoff') {
    estCostUsdRange = [1, 4]
    estMinutesRange = [1, 4]
  } else {
    estCostUsdRange = [round1(agentCount * ESTIMATES.perAgentUsd[0]), round1(agentCount * ESTIMATES.perAgentUsd[1])]
    estMinutesRange = [Math.max(1, Math.ceil(agentCount * ESTIMATES.perAgentMin[0])), Math.max(2, Math.ceil(agentCount * ESTIMATES.perAgentMin[1]))]
  }

  return {
    kind,
    ticker,
    ...(swarmId !== 'research' ? { swarm: swarmId } : {}),
    module,
    agent,
    agentCount,
    estCostUsdRange,
    estMinutesRange,
    willCommitToMain: kind !== 'agent' && kind !== 'screener-agent',
    estCommits: kind === 'full' ? 2 : kind === 'module' || kind === 'rerun' || kind === 'signal' || kind === 'sweep' || kind === 'handoff' ? 1 : 0,
    requiresTypedConfirm: kind === 'full',
    creditPreflight: getCreditStatus(),
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

async function buildArgs(prompt: string, kind: LaunchKind, model: string): Promise<string[]> {
  const flags = await detectFlags()
  const guard = LAUNCH_GUARDS[kind]
  const args: string[] = ['--print', prompt, '--output-format', 'stream-json', '--verbose']
  if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')
  else if (flags.has('--dangerously-skip-permissions')) args.push('--dangerously-skip-permissions')
  if (flags.has('--model')) args.push('--model', model)
  if (flags.has('--max-turns')) args.push('--max-turns', String(guard.maxTurns))
  if (flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(guard.budgetUsd))
  return args
}

export interface LaunchParams {
  kind: RunKind
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
  intake?: SignalIntakeInput // kind 'signal' (new signal): materialized into <runRoot>/intake.json
  inboxId?: string // kind 'signal' launched from an Inbox card — recorded as the intake's provenance
  // kind 'signal' relaunch of an EXISTING sig: stamp override_promote onto its intake.json so the gauntlet
  // pushes a signal-gate PARK/LOG (a "noted, no action" / "set aside" cull) PAST the promotion gate and runs
  // the rest. A recorded human override of the auto-cull — the gate reads intake.json, so this is how it lands.
  overridePromote?: boolean
  thesisId?: string // kind 'handoff'
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
  // Exact, already-selected run identity for a data-need intake/rerun. It is revalidated in launch()
  // against the swarm manifest/research folder before it enters a prompt; ordinary launches omit it.
  runRoot?: string
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

// ---- chained full run (per-module budgets), DAG-PARALLEL — opt-in via FULL_PER_MODULE ----
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
const deferMarkerPath = (ticker: string) => path.join(REPO_ROOT, `analyses/${ticker}_${todayDate()}`, '.defer_module_memos')

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
const activeSubjectChains = new Map<string, symbol>()

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
  const token = Symbol(key)
  activeSubjectChains.set(key, token)
  let released = false
  return () => {
    if (released) return
    released = true
    // Token-bound delete: an old halted scheduler must never clear a newer replacement chain.
    if (activeSubjectChains.get(key) === token) activeSubjectChains.delete(key)
  }
}

export function haltAllChains(): void {
  chainEpoch++
  activeSubjectChains.clear()
}

export function haltSubjectChains(subjectId: string, swarmId = RESEARCH_SWARM_ID): void {
  const key = subjectChainKey(subjectId, swarmId)
  subjectChainEpoch.set(key, (subjectChainEpoch.get(key) ?? 0) + 1)
  activeSubjectChains.delete(key)
}

/** Capture the relevant chain epochs; the returned probe answers "may this chain still advance?".
 *  Omitting subjectId preserves the global-only probe used by the stop-everything test. */
export function captureChainEpoch(subjectId?: string, swarmId = RESEARCH_SWARM_ID): () => boolean {
  const epoch = chainEpoch
  const key = subjectId ? subjectChainKey(subjectId, swarmId) : null
  const subjectEpoch = key ? (subjectChainEpoch.get(key) ?? 0) : 0
  return () => epoch === chainEpoch && (!key || subjectEpoch === (subjectChainEpoch.get(key) ?? 0))
}

export interface FullChainDeps {
  // launch one run (params) and register its completion callback; resolves to the run's id + preflight.
  launchAndWire: (params: LaunchParams, onFinish: (status: RunStatus) => void) => Promise<{ runId: string; preflight: LaunchPreflight }>
  // drop the defer-module-memos marker in the run root (best-effort).
  writeMarker: (ticker: string) => void
  // remove the defer-module-memos marker (best-effort). Called on every failure path so a crashed chain
  // never leaves an orphaned marker that would make a later same-day standalone module run defer-and-DROP
  // its memo (the success path's marker removal is done by the master step, rerun.md Step 9A).
  clearMarker: (ticker: string) => void
  // schedule a re-pump after a transient 429 capacity rejection (default: setTimeout; tests fire it directly).
  scheduleRetry: (fn: () => void) => void
  // One stable bare-pool claim for the WHOLE chain, including child-transition and capacity-backoff gaps.
  // Optional so existing deterministic fake deps remain source-compatible; production always provides it.
  acquirePoolClaim?: (ticker: string) => () => void
}
const defaultFullChainDeps: FullChainDeps = {
  launchAndWire: async (params, onFinish) => {
    const out = await launch(params)
    const run = getRun(out.runId)
    // chained is now passed via params (set on the RunState pre-spawn so the launched-event log is
    // correct); re-assert it here for the fake-launcher test path, and wire onFinish (not a param).
    if (run) { run.chained = true; run.onFinish = onFinish } // chained:true so cancel()/cancelAll halt the whole chain (parity with the old serial launchChainStep)
    else onFinish('error') // run vanished before we could wire onFinish — treat as a failure
    return { runId: out.runId, preflight: out.preflight }
  },
  writeMarker: (ticker) => {
    try {
      const p = deferMarkerPath(ticker)
      fs.mkdirSync(path.dirname(p), { recursive: true })
      fs.writeFileSync(p, '')
    } catch { /* non-fatal: fall back to inline per-module memos */ }
  },
  clearMarker: (ticker) => {
    try { fs.rmSync(deferMarkerPath(ticker), { force: true }) } catch { /* best-effort */ }
  },
  scheduleRetry: (fn) => { setTimeout(fn, CAPACITY_RETRY_MS) },
  acquirePoolClaim: (ticker) => acquireSharedDataPoolClaim(RESEARCH_SWARM_ID, ticker, 'full'),
}
// A resume runs only the modules NOT already on disk (+ the master). Price and time-estimate just that
// remaining work, not the whole pipeline — otherwise a resume that skips 4 of 6 modules still shows the
// full "~$90 / ~150 min", which reads as "it's redoing everything" even though it isn't. Scaled from the
// calibrated full-run band by the fraction of agents left to run (an honest "~" band, not false precision).
export function chainedResumePreflight(ticker: string, plannedModules: string[], swarmId: string = RESEARCH_SWARM_ID): LaunchPreflight {
  // Swarm-aware so the "complete the thesis" panel prices a non-research subject against ITS OWN graph
  // (agent counts and full-run band), not the research one. Research callers pass nothing and are unchanged.
  const g = buildSwarmGraph(swarmId)
  const agentCountOf = new Map(g.modules.map((m) => [m.name, m.agentCount]))
  const totalAgents = g.totals.agents + 1 // + master
  const plannedAgents = plannedModules.reduce((s, n) => s + (agentCountOf.get(n) ?? 0), 0) + 1 // + master
  const frac = totalAgents > 0 ? Math.min(1, plannedAgents / totalAgents) : 1
  const full = estimate('full', ticker, undefined, undefined, swarmId === RESEARCH_SWARM_ID ? undefined : swarmId)
  return {
    ...full,
    agentCount: plannedAgents,
    estCostUsdRange: [round1(full.estCostUsdRange[0] * frac), round1(full.estCostUsdRange[1] * frac)],
    estMinutesRange: [Math.max(1, Math.round(full.estMinutesRange[0] * frac)), Math.max(2, Math.round(full.estMinutesRange[1] * frac))],
  }
}

export async function launchFullChained(
  ticker: string,
  user: string,
  userVia: 'cf-access' | 'local',
  deps: FullChainDeps = defaultFullChainDeps,
  decisionBinding?: { decisionRunRoot: string; decisionFingerprint: string },
): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean; skipped?: string[]; planned?: string[]; resumed?: boolean }> {
  const datedRoot = `analyses/${ticker}_${todayDate()}`
  if (isSealedResearchRun(datedRoot)) throw sealedResearchRunError(datedRoot)
  const g = buildSwarmGraph()
  const names = g.modules.map((m) => m.name)
  const synthesisFiles = new Map(g.modules.map((m) => [
    m.name,
    Object.values(m.layers).flat()
      .filter((agent) => agent.isSynthesis)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  ]))
  const known = new Set(names)
  const depsOf = new Map(g.modules.map((m) => [m.name, m.dependsOn.filter((d) => known.has(d))]))
  const total = names.length
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
  const releaseChainPool = () => {
    if (poolReleased) return
    poolReleased = true
    try { releasePool() } finally { releaseSubjectChain() }
  }

  // Drop a marker in the shared run root so each per-module run SKIPS its inline memo (MODULE_PIPELINE
  // Step 4.9A); the master step regenerates all module memos in ONE batch at the end (rerun.md Step 9A)
  // and removes the marker. Keeps the ~2.5-min-per-module memo off the parallel critical path —
  // output-neutral, only the memo's timing moves. Injected so the test asserts it without touching disk.
  try {
    deps.writeMarker(ticker)
  } catch (error) {
    releaseChainPool()
    throw error
  }

  const done = new Set<string>()
  const started = new Set<string>()
  const inflight = new Set<string>()
  // RESUME (forever-living): if today's run folder already holds finished modules from a prior attempt
  // that broke (a plan-limit pause, a dropped connection, a reboot), seed them as done so this relaunch
  // CONTINUES from where it stopped instead of redoing the whole pipeline. A first run finds nothing here;
  // a complete folder is left alone (this is then a fresh full, not a resume). A module is finished only
  // when its CURRENT discovered synthesis passes the same mechanical validator used by exact planning.
  const resumeRoot = `analyses/${ticker}_${todayDate()}`
  if (fs.existsSync(path.join(REPO_ROOT, resumeRoot)) && !finalDeliverablesPresent(resumeRoot)) {
    for (const name of names) {
      try {
        const finished = (synthesisFiles.get(name) ?? []).some((file) =>
          validateAgentOutputFile(path.join(REPO_ROOT, resumeRoot, name, file)).valid)
        if (finished) { done.add(name); started.add(name) }
      } catch { /* this module isn't finished yet */ }
    }
    clearRunMarker(resumeRoot, '.interrupted') // a deliberate (re)launch; a fresh break will re-mark it
    clearRunMarker(resumeRoot, '.aborted')
    resetForRelaunch(resumeRoot) // Findings 6/8: reset the single-shot dedup AND drop any stale RUN_FAILURE.md
    // eslint-disable-next-line no-console
    if (done.size) console.log(`[full-chain] ${ticker}: resuming — ${done.size}/${total} modules already on disk, running the rest`)
  }
  // Snapshot the resume split BEFORE anything runs: what's already done (skipped) vs what this relaunch
  // will actually run. `done` only holds seeded modules at this point. The cockpit uses this to show the
  // finished modules as done (not "starting") and to price/ETA only the remaining work.
  const skippedModules = [...done]
  const plannedModules = names.filter((n) => !done.has(n))
  const resumed = skippedModules.length > 0
  const preflight: LaunchPreflight = resumed ? chainedResumePreflight(ticker, plannedModules) : estimate('full', ticker)
  let stopped = false
  let masterLaunched = false
  let retryScheduled = false
  // Global stop halts every chain; a subject stop halts only this ticker's scheduler.
  const chainAlive = captureChainEpoch(ticker, RESEARCH_SWARM_ID)

  let firstRunId: string | null = null
  let settleFirst!: (out: { runId: string; preflight: LaunchPreflight }) => void
  let rejectFirst!: (e: unknown) => void
  const firstReady = new Promise<{ runId: string; preflight: LaunchPreflight }>((res, rej) => { settleFirst = res; rejectFirst = rej })

  // modules whose every (known) upstream is done and which we have not yet started
  const readyNow = () => names.filter((n) => !started.has(n) && (depsOf.get(n) ?? []).every((d) => done.has(d)))

  const launchMaster = (): Promise<{ runId: string; preflight: LaunchPreflight }> | null => {
    if (masterLaunched) return null
    masterLaunched = true
    const launched = deps.launchAndWire(
      { kind: 'rerun', ticker, module: 'master', agent: 'synthesizer', user, userVia, chained: true, ...decisionBinding },
      (status) => {
        deps.clearMarker(ticker) // always clear the defer-memo marker once master exits — success path: rerun.md Step 9A also rm -f's it (idempotent); this is the safety net for an abnormal 'done' before Step 9A ran, or any failure
        releaseChainPool()
        // eslint-disable-next-line no-console
        console.log(`[full-chain] ${ticker}: ${status === 'done' ? 'pipeline complete' : `stopped at master — ${status}`}`)
      },
    )
    void launched.catch((e) => {
      deps.clearMarker(ticker)
      releaseChainPool()
      // eslint-disable-next-line no-console
      console.error(`[full-chain] ${ticker}: failed to launch master synthesizer`, (e as any)?.message || e)
    })
    return launched
  }

  const onModuleFinish = (name: string, status: RunStatus) => {
    inflight.delete(name)
    if (!chainAlive()) { stopped = true; deps.clearMarker(ticker); releaseChainPool(); return } // stop-everything halted the chain — clear the defer-memo marker (no orphan) + launch nothing further
    if (status !== 'done') {
      stopped = true
      deps.clearMarker(ticker) // failed pipeline — don't leave an orphaned defer-memo marker
      releaseChainPool()
      // eslint-disable-next-line no-console
      console.log(`[full-chain] ${ticker}: stopped at module ${name} — ${status} (in-flight modules still finish)`)
      return
    }
    done.add(name)
    if (done.size === total) { launchMaster(); return }
    pump()
  }

  // A transient 429 (global concurrency cap momentarily full — usually runs on OTHER tickers) is retried,
  // not fatal. At most one pending retry; when it fires, pump() re-offers every un-started ready module.
  const scheduleRetry = () => {
    if (retryScheduled || stopped) return
    retryScheduled = true
    deps.scheduleRetry(() => {
      retryScheduled = false
      if (!chainAlive()) { stopped = true; deps.clearMarker(ticker); releaseChainPool(); return }
      pump()
    })
  }

  const launchModule = (name: string) => {
    started.add(name)
    inflight.add(name) // reserve the slot synchronously so the cap holds within one pump() pass
    void deps.launchAndWire(
      { kind: 'module', ticker, module: name, user, userVia, chained: true, ...decisionBinding },
      (status) => onModuleFinish(name, status),
    )
      .then((out) => {
        if (firstRunId === null) { firstRunId = out.runId; settleFirst({ runId: out.runId, preflight: out.preflight }) }
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
        stopped = true
        deps.clearMarker(ticker)
        releaseChainPool()
        // eslint-disable-next-line no-console
        console.error(`[full-chain] ${ticker}: failed to launch module ${name}`, (e as any)?.message || e)
        if (firstRunId === null) rejectFirst(e)
      })
  }

  function pump() {
    if (stopped) return
    if (!chainAlive()) { stopped = true; deps.clearMarker(ticker); releaseChainPool(); return }
    for (const name of readyNow()) {
      if (inflight.size >= MAX_CONCURRENT_RUNS) break
      launchModule(name)
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
  if (started.size === 0) { deps.clearMarker(ticker); releaseChainPool(); throw new Error(`[full-chain] ${ticker}: no module is runnable at start (depends_on cycle?)`) }
  // `chained: true` -> the cockpit live-follows the WHOLE pipeline (each module + master), celebrating only
  // when the master finishes — not after each module.
  const first = await firstReady
  return { runId: first.runId, preflight, chained: true, skipped: skippedModules, planned: plannedModules, resumed }
}

/** Stop EVERYTHING: halt every full-run chain, then cancel every in-flight run (running,
 *  starting, readiness-checking, or paused at the readiness gate). Returns the cancelled ids. */
export async function cancelAll(): Promise<string[]> {
  haltAllChains()
  const cancelled: string[] = []
  for (const r of listRuns()) {
    if (r.endedAt !== undefined || r.cancelRequested) continue
    try {
      if (await cancel(r.runId)) cancelled.push(r.runId)
    } catch {
      // keep stopping the rest — one stuck run must not shield the others
    }
  }
  return cancelled
}

/** Stop ONE subject's in-flight work — a chained full run plus whatever module step is live for it.
 *  The run panel's Cancel needs this: a chained full launches each module under a NEW runId as it
 *  advances, so the runId the panel is following may already have ended by the time the user clicks,
 *  and a plain /cancel on that stale id would 404 while the next module keeps spending. Halting the
 *  chain (so no queued module launches) + cancelling every in-flight run for the subject stops it for
 *  real. Only this subject's runs are touched; other subjects keep running. Returns the cancelled ids. */
export async function cancelSubject(subjectId: string, swarmId = 'research'): Promise<string[]> {
  haltSubjectChains(subjectId, swarmId) // no queued step for this subject can launch; other subjects continue
  const cancelled: string[] = []
  const stopping: RunState[] = []
  for (const r of subjectRunsAwaitingExit(subjectId, swarmId)) {
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
  return cancelled
}

export async function launch(params: LaunchParams): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean; skipped?: string[]; planned?: string[]; resumed?: boolean }> {
  const { kind, module, agent, window } = params
  const model = params.model || DEFAULT_MODEL
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
  const exactModuleRunRoot = params.exactModuleResume
    ? exactModuleRunRootBinding(params.ticker ?? '', params.exactModuleRunRoot)
    : null
  if (params.exactModuleResume && (swarmId !== RESEARCH_SWARM_ID || kind !== 'module'
      || !params.preSpawnGuard || !params.terminalGuard || !exactModuleRunRoot)) {
    throw Object.assign(new Error('Exact module-resume policy requires a guarded research module launch, terminal publication proof, and its immutable run root.'), { statusCode: 400 })
  }
  const exactModuleInputs = [...new Set(params.exactModuleInputs ?? [])].sort()
  const rawExactWritableOrbs = params.exactModuleWritableOrbs
  const rawExactSynthesisOrbs = params.exactModuleSynthesisOrbs
  const exactModuleWritableOrbs = [...new Set(rawExactWritableOrbs ?? [])].sort()
  const exactModuleSynthesisOrbs = [...new Set(rawExactSynthesisOrbs ?? [])].sort()
  const safeExactModule = typeof module === 'string' && /^[a-z][a-z0-9-]*$/.test(module)
  const specialistStem = /^(?!99_)\d{2}_[A-Za-z0-9][A-Za-z0-9_-]*$/
  const synthesisStem = /^99_[A-Za-z0-9][A-Za-z0-9_-]*-synthesis$/
  if ((!params.exactModuleResume && exactModuleInputs.length > 0)
      || (!params.exactModuleResume && params.exactModuleRunRoot !== undefined)
      || (!params.exactModuleResume && params.terminalGuard !== undefined)
      || (!params.exactModuleResume && rawExactWritableOrbs !== undefined)
      || (!params.exactModuleResume && rawExactSynthesisOrbs !== undefined)
      || exactModuleInputs.some((name) => !/^[a-z0-9][a-z0-9-]{0,79}$/.test(name))) {
    throw Object.assign(new Error('Exact module-resume inputs require a guarded research module launch and safe module names.'), { statusCode: 400 })
  }
  if (params.exactModuleResume && (!safeExactModule
      || !Array.isArray(rawExactWritableOrbs) || !Array.isArray(rawExactSynthesisOrbs)
      || rawExactWritableOrbs.length !== exactModuleWritableOrbs.length
      || rawExactSynthesisOrbs.length !== exactModuleSynthesisOrbs.length
      || exactModuleWritableOrbs.length > 256 || exactModuleSynthesisOrbs.length < 1
      || exactModuleSynthesisOrbs.length > 16
      || exactModuleWritableOrbs.some((stem) => !specialistStem.test(stem))
      || exactModuleSynthesisOrbs.some((stem) => !synthesisStem.test(stem)))) {
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

  // Fail fast with an actionable message if the engine CLI isn't installed (the #1 silent "error"):
  await assertClaudeCli()

  // ---- resolve the SUBJECT and a CONCRETE run root (never null) so admission can compute absolute
  // write targets and the fs-watcher can bind strictly ----
  let subjectId: string
  let runRoot: string
  let pendingIntake: { path: string; body: any } | null = null
  // Finding 13: set below (research 'full' branch) when this is a deliberate same-day relaunch into an
  // existing, still-incomplete run root — the actual dedup/marker reset happens only after admission
  // succeeds, never here.
  let isFullRelaunch = false

  if (kind === 'signal') {
    const date = todayDate()
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
      mustExist: kind === 'rerun' || kind === 'doc-intake',
      requestedRunRoot: params.runRoot,
    })
    if (!resolved) throw Object.assign(new Error('The swarm run-root contract is unsafe or does not match this subject.'), { statusCode: 400 })
    runRoot = resolved.relative
    // A rerun refreshes an EXISTING dossier — never create one. Fail fast before spawning the paid CLI
    // if the subject has no run folder yet (mirrors the research rerun guard).
    if ((kind === 'rerun' || kind === 'doc-intake') && !fs.existsSync(path.join(REPO_ROOT, runRoot))) {
      throw Object.assign(new Error(`No existing run to re-run for ${subjectId}. Run the full pipeline first.`), { statusCode: 400 })
    }
  } else {
    // research kinds — unchanged behavior
    const ticker = params.ticker || ''
    subjectId = ticker
    assertNoModulePublicationInFlight(swarmId, subjectId)
    assertNoForeignSubjectChain(swarmId, subjectId, params.chained)
    // opt-in: run a full pipeline as a chain of per-module runs + master (each its own budget)
    const datedRoot = `analyses/${ticker}_${todayDate()}`
    // A sealed full run uses full.md's read-only recovery route. Do not send it through the per-module
    // scheduler, which would begin rewriting modules before the command could observe the seal.
    if (kind === 'full' && FULL_PER_MODULE && !isSealedResearchRun(datedRoot)) {
      // launchFullChained writes its defer-memo marker before scheduling the first module. Validate the
      // selected-call CAS AND reserve the shared data-pool label first so even that benign scheduler
      // mutation cannot be authorized by a stale confirmation or race a first commodity run on the same
      // label. Every child module validates the same ownership/binding again in its own launch().
      const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, ticker, kind)
      try {
        assertLaunchBindingsStillCurrent(swarmId, ticker, params)
        const binding = params.decisionRunRoot && params.decisionFingerprint
          ? { decisionRunRoot: params.decisionRunRoot, decisionFingerprint: params.decisionFingerprint }
          : undefined
        // Await inside the try: releasing before firstReady would reopen the zero-owner window while the
        // outer scheduler has written its marker but its first child has not registered yet.
        return await launchFullChained(ticker, user, userVia, defaultFullChainDeps, binding)
      } finally {
        releasePoolClaim()
      }
    }
    if (kind === 'rerun' || kind === 'doc-intake') {
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
    } else if (kind === 'agent') {
      runRoot = resolveAgentRunRoot(ticker)
    } else {
      runRoot = `analyses/${ticker}_${todayDate()}`
      // A deliberate same-day relaunch of a FULL run reuses this run root. The plain launch() path (the
      // default when FULL_PER_MODULE is off) must reset the single-shot failure-note dedup — otherwise
      // recordRunFailure() suppresses the RELAUNCH's failure and RUN_FAILURE.md keeps the first attempt's
      // reason/stopped_at/stderr. The chained launcher already does this reset at its resume root (~900).
      // Finding 13: the ACTUAL reset (including clearing .interrupted) is deferred until admission below
      // actually admits this launch — NOT done here, while merely resolving the run root. Clearing the
      // marker this early, before admitRun() runs, would strand a genuinely-broken full run forever if
      // admission then REJECTS this attempt (capacity/lock): no run would start, yet the only marker that
      // makes the resume supervisor consider the folder resumable would already be gone. `isFullRelaunch`
      // just records the (cheap, side-effect-free) fact so the code after admission can act on it.
      isFullRelaunch = kind === 'full' && fs.existsSync(path.join(REPO_ROOT, runRoot)) && !finalDeliverablesPresent(runRoot)
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

  const ticker = subjectId // RunState display/compat field: research = the ticker; swarms = the subject id
  const prompt = buildPrompt(swarmId, kind, ticker, module, agent, window, {
    thesisId: params.thesisId,
    runRoot: (kind === 'rerun' || kind === 'doc-intake') && params.runRoot ? runRoot : undefined,
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
  const writeTargetsAbs = [...new Set([
    ...[...expected.values()].map((e) => path.join(REPO_ROOT, runRoot, e.outputRel)),
    ...rootArtifacts.map((f) => path.join(REPO_ROOT, runRoot, f)),
    ...swarmStoreTargets(kind, subjectId),
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
    const stopping = subjectRunsAwaitingExit(subjectId, swarmId)
    for (const r of stopping) {
      try { await cancel(r.runId) } catch { /* keep stopping the rest — one stuck run must not shield the others */ }
    }
    if (!(await awaitRunsExited(stopping))) {
      const err: any = new Error(`Could not stop the run(s) holding the lock on ${subjectId} — still alive after ${FORCE_STOP_WAIT_MS}ms. Try again shortly.`)
      err.statusCode = 409
      throw err
    }
    finalizeConfirmedSubjectCancellation(stopping)
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

  // Finding 13: NOW that admission has actually admitted this launch, reset the relaunch state — clearing
  // either marker earlier would strand the old run if admission rejected this attempt. A deliberate full
  // relaunch supersedes an exact-module `.aborted` pause; a fresh break re-marks `.interrupted` and remains
  // autonomously resumable. The failure-note dedup resets here too.
  if (isFullRelaunch) {
    resetAdmittedFullRelaunch(runRoot)
  }

  // Materialize the signal intake AFTER admission passes (no orphan folders on rejection).
  if (pendingIntake) {
    fs.mkdirSync(path.dirname(pendingIntake.path), { recursive: true })
    fs.writeFileSync(pendingIntake.path, JSON.stringify(pendingIntake.body, null, 2) + '\n')
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
        const marker = path.join(dir, '.target')
        if (module) fs.writeFileSync(marker, JSON.stringify({ module, at: new Date().toISOString() }) + '\n')
        else fs.rmSync(marker, { force: true })
      }
    } catch {
      /* best-effort marker; a missing marker only risks one auto-resume the user can re-cancel */
    }
  }

  const run = createRun({
    kind,
    ticker,
    subjectId,
    swarmId,
    unit: manifest.unit,
    module,
    agent,
    model,
    prompt,
    user,
    userVia,
    runRoot,
    selectedDecisionRunRoot: params.decisionRunRoot,
    selectedDecisionFingerprint: params.decisionFingerprint,
    willCommitToMain: kind !== 'agent' && kind !== 'screener-agent',
    writeTargetsAbs,
    coveredModules,
    readDepsAbs,
    closeWatcher: undefined,
    expected,
    chained: params.chained,
    onTerminal: params.onTerminal,
  })
  if (params.intakeOwner) intakeOwnerByRun.set(run, { ...params.intakeOwner })
  if (params.sharedPoolTarget) sharedPoolTargetByRun.set(run, { ...params.sharedPoolTarget })
  if (params.intakeReceipt) intakeReceiptByRun.set(run, { ...params.intakeReceipt })
  if (params.deferModuleMemo) deferredModuleMemoRuns.add(run)
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

  setActiveSubjectRun(run.runId, subjectId, swarmId) // register the swarm-qualified claim; finishRun releases it
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
  return { runId: run.runId, preflight: estimate(kind, ticker, module, agent, swarmId) }
  } finally {
    releaseTargetPoolClaim()
    releasePoolClaim()
  }
}

// The post-ack half of launch(): readiness gate, then spawn (or park at the gate for a human decision).
// Any hard failure here finalizes the run + emits run-error, so a fast-acked client is never left
// watching a phantom claim. Mirrors the pattern cancel() has always used: cheap sync flip, ack, let
// the outcome ride SSE.
async function continueLaunch(run: RunState): Promise<void> {
  try {
    // Pre-spawn data-readiness gate (deterministic, no LLM). Research data-consuming kinds only (swarm
    // kinds skip it). If the check isn't clean, BLOCK: pause in awaiting-readiness-decision and defer
    // the spawn until the user decides (decideReadiness). No CLI is spawned while paused.
    await runReadinessGate(run)
    // cancel() can finalize the run DURING the gate's async check (it yields the loop while the check
    // runs). A finalized run is never revived or spawned — mirrors finalizeRunOnClose's endedAt guard.
    if (run.endedAt !== undefined) return
    if (run.readiness && run.readiness.overall !== 'clean') {
      run.status = 'awaiting-readiness-decision'
      run.deferredSpawn = () => spawnEngine(run)
      emit(run, { type: 'readiness-blocked', runId: run.runId, report: run.readiness, ts: Date.now() })
      return
    }
    await spawnEngine(run)
  } catch (e: any) {
    // spawnEngine already emitted run-error + finalized on its own throw — only clean up if it didn't
    if (run.endedAt === undefined) {
      emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'launch_failed', message: String(e?.message || e), ts: Date.now() })
      finishRun(run, 'error')
    }
  }
}

// Spawn the engine CLI for an admitted, gate-cleared run and wire its lifecycle. Extracted from launch()
// so the readiness gate can defer the spawn (until the user proceeds) without duplicating this logic.
// onClose delegates to finalizeRunOnClose — the single endedAt-gated finalizer (PR12 review).
// Build the child env for a spawned engine run: the full server env MINUS the news-ingester provider
// secrets that load-env injected from providers.env (Groq/Cerebras/Mistral/OpenRouter/NVIDIA/Gemini). A
// research/screener run is a Claude (Anthropic) process and never needs them; handing them to every child
// widens secret exposure and lets a run spend news quotas. The CLI's OWN auth secrets are kept even when
// they come from providers.env — ANTHROPIC_API_KEY and CLAUDE_CODE_OAUTH_TOKEN (the long-lived headless
// subscription token from `claude setup-token`). Without this, a token dropped in providers.env (the
// install-survivable secret store) would be scrubbed before the claude child could authenticate with it.
// Keys set in the REAL environment (launchd plist / shell) aren't in providerEnvKeys, so they pass through
// regardless — this only matters for the providers.env path.
const CLAUDE_AUTH_ENV_KEYS = new Set(['ANTHROPIC_API_KEY', 'CLAUDE_CODE_OAUTH_TOKEN'])
export const DEFER_MODULE_MEMO_ENV = 'NOSTRA_DEFER_MODULE_MEMO'
export const EXACT_MODULE_RESUME_ENV = 'NOSTRA_EXACT_MODULE_RESUME'
export const EXACT_MODULE_INPUTS_ENV = 'NOSTRA_EXACT_MODULE_INPUTS'
export const EXACT_MODULE_RUN_ROOT_ENV = 'NOSTRA_EXACT_MODULE_RUN_ROOT'
export const EXACT_MODULE_NAME_ENV = 'NOSTRA_EXACT_MODULE_NAME'
export const EXACT_MODULE_WRITABLE_ORBS_ENV = 'NOSTRA_EXACT_MODULE_WRITABLE_ORBS'
export const EXACT_MODULE_SYNTHESIS_ORBS_ENV = 'NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS'
export function childEnv(options: {
  deferModuleMemo?: boolean
  exactModuleResume?: boolean
  exactModuleInputs?: string[]
  exactModuleRunRoot?: string
  exactModuleName?: string
  exactModuleWritableOrbs?: string[]
  exactModuleSynthesisOrbs?: string[]
} = {}): NodeJS.ProcessEnv {
  const e: NodeJS.ProcessEnv = { ...process.env }
  // Never inherit this execution-policy flag from the server/shell. Only the explicitly-authorized RunState
  // below may add it back, which keeps ordinary module/full/rerun commands byte-for-byte in their old mode.
  delete e[DEFER_MODULE_MEMO_ENV]
  delete e[EXACT_MODULE_RESUME_ENV]
  delete e[EXACT_MODULE_INPUTS_ENV]
  delete e[EXACT_MODULE_RUN_ROOT_ENV]
  delete e[EXACT_MODULE_NAME_ENV]
  delete e[EXACT_MODULE_WRITABLE_ORBS_ENV]
  delete e[EXACT_MODULE_SYNTHESIS_ORBS_ENV]
  for (const k of providerEnvKeys) if (!CLAUDE_AUTH_ENV_KEYS.has(k)) delete e[k]
  if (options.deferModuleMemo) e[DEFER_MODULE_MEMO_ENV] = '1'
  if (options.exactModuleResume) {
    const root = options.exactModuleRunRoot
    const module = options.exactModuleName
    const writable = options.exactModuleWritableOrbs
    const syntheses = options.exactModuleSynthesisOrbs
    const match = typeof root === 'string'
      ? /^analyses\/([A-Z0-9.\-]{1,15})_\d{4}-\d{2}-\d{2}$/.exec(root)
      : null
    if (!match || exactModuleRunRootBinding(match[1], root) !== root
        || typeof module !== 'string' || !/^[a-z][a-z0-9-]*$/.test(module)
        || !Array.isArray(writable) || !Array.isArray(syntheses) || syntheses.length < 1
        || new Set(writable).size !== writable.length || new Set(syntheses).size !== syntheses.length
        || writable.some((stem) => !/^(?!99_)\d{2}_[A-Za-z0-9][A-Za-z0-9_-]*$/.test(stem))
        || syntheses.some((stem) => !/^99_[A-Za-z0-9][A-Za-z0-9_-]*-synthesis$/.test(stem))) {
      throw new Error('Exact module-resume child environment requires a valid immutable run root and artifact scope.')
    }
    e[EXACT_MODULE_RESUME_ENV] = '1'
    e[EXACT_MODULE_INPUTS_ENV] = [...new Set(options.exactModuleInputs ?? [])].sort().join(',')
    e[EXACT_MODULE_RUN_ROOT_ENV] = root
    e[EXACT_MODULE_NAME_ENV] = module
    e[EXACT_MODULE_WRITABLE_ORBS_ENV] = [...writable].sort().join(',')
    e[EXACT_MODULE_SYNTHESIS_ORBS_ENV] = [...syntheses].sort().join(',')
  }
  return e
}

/** Warm the once-per-process CLI probes at server startup so the FIRST user launch doesn't pay
 *  ~1-4s for `claude --version` + `claude --help` inside its click-to-ack window. Best-effort. */
export async function warmLaunchProbes(): Promise<void> {
  try {
    await claudeAvailable()
    await buildArgs('warmup', 'agent', 'sonnet') // triggers + caches the --help flag probe; args discarded
  } catch {
    /* probes re-run (and surface their real error) on the first launch */
  }
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
  const args = await buildArgs(run.prompt, run.kind, run.model)
  if (run.cancelRequested) {
    // cancelled during the gate / the buildArgs window — finish WITHOUT creating the child (no orphan).
    // Guard the terminal emit on not-already-finalized: finishRun is idempotent but emit is not.
    if (run.endedAt === undefined) {
      emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
      finishRun(run, 'cancelled')
    }
    return
  }
  // buildArgs can cold-probe `claude --help` for several seconds. Re-check BOTH call bindings plus the
  // generic shared-pool owner/claim AFTER that await and immediately before execa: neither a new decision
  // nor a newly-ambiguous/cross-swarm owner in the probe/readiness window can spend.
  const beforeSpawn = changedLaunchBinding()
  if (beforeSpawn) {
    stopForChangedBinding(beforeSpawn)
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
  let child: ResultPromise
  try {
    child = execa(CLAUDE_BIN, args, {
      cwd: REPO_ROOT,
      env: childEnv({
        deferModuleMemo: deferredModuleMemoRuns.has(run),
        exactModuleResume: exactModuleResumeRuns.has(run),
        exactModuleInputs: exactModuleInputsByRun.get(run),
        exactModuleRunRoot: exactModuleRunRootByRun.get(run),
        exactModuleName: exactModuleArtifactScopeByRun.get(run)?.module,
        exactModuleWritableOrbs: exactModuleArtifactScopeByRun.get(run)?.writableOrbs,
        exactModuleSynthesisOrbs: exactModuleArtifactScopeByRun.get(run)?.synthesisOrbs,
      }), // secrets scrubbed + run-only execution policy
      stdin: 'ignore',
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
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed', message: String(e?.message || e), ts: Date.now() })
    finishRun(run, 'error')
    throw Object.assign(new Error('Failed to spawn claude CLI'), { statusCode: 500 })
  }

  run.child = child
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
  emit(run, { type: 'run-started', runId: run.runId, kind: run.kind, ticker: run.ticker, runRoot: run.runRoot, willCommitToMain: run.willCommitToMain, ...(run.swarmId !== 'research' ? { swarm: run.swarmId } : {}), ts: Date.now() })

  // perpetual audit record: who launched what, when, on which company (finish is logged in finishRun)
  logLaunch({ runId: run.runId, user: run.user, userVia: run.userVia, kind: run.kind, ticker: run.ticker, runRoot: run.runRoot ?? undefined, module: run.module, agent: run.agent, model: run.model, chained: run.chained, swarm: run.swarmId })

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
    // A clean exact-resume module is not done until its completed module directory is proven on origin/main.
    // Keep the subject/write claims live while this awaits, so no second run can race the terminal commit.
    // Failed/cancelled/truncated children retain their ordinary outcome and do not attempt publication.
    const childCouldReportDone = childCouldReportDoneOnClose(run, res)
    let terminalProof: PreSpawnGuardResult = { ok: true }
    let terminalWork: Promise<PreSpawnGuardResult> | undefined
    try {
      // Even when a descendant survived, exact output recovery still runs — but only AFTER group extinction.
      // A valid synthesis gets its content-bound pending marker/publication attempt; invalid/truncated 99 fails
      // the guard and remains runnable. Skipping this would leave a mechanically valid local 99 with neither
      // publication receipt nor a way for the plan to retry it.
      if (childCouldReportDone && terminalGuards.has(run)) {
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

      // per-agent cost/runtime from the transcripts (run_cost_report.py); fire-and-forget. Runs AFTER the
      // command's own commit-run.sh has already pushed the run folder, so the metrics file needs its own
      // commit here — otherwise it lands after the data commit and is never pushed (stranded on an ephemeral
      // host, defeating the "aggregate across runs" purpose it exists for).
      writeAgentMetrics(run, (r, filename) => {
        if (r.runRoot) commitRunFile(r.runRoot, filename, `Agent metrics: ${r.ticker} (${filename})`)
      })
      finalizeRunOnClose(run, res, stderr, terminalProof)
    } finally {
      // Keep the writer token through finalizeRunOnClose itself. Removing it immediately after the await
      // leaves a microtask-sized window where force can admit before endedAt/claims are released coherently.
      if (terminalWork) clearTerminalGuardWork(run, terminalWork)
    }
  }
  // Pass both fulfillment/rejection directly to the guarded handler. Using `.then(onClose).catch(onClose)`
  // would call it twice if its awaited terminal proof ever rejected; evaluateTerminalGuard itself never throws.
  void child.then(onClose, onClose)
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
  const sigGroup = (sig: NodeJS.Signals) => {
    if (pid) { try { process.kill(-pid, sig); return } catch { /* not a group leader / already gone */ } }
    try { child.kill(sig) } catch { /* already dead */ }
  }
  sigGroup('SIGTERM')
  // A leader can close/finalize while a detached Task/tool descendant survives. Probe the process GROUP,
  // not endedAt, before the fallback kill so a late descendant cannot keep writing after cancellation.
  setTimeout(() => { if (processTreeAlive(pid)) sigGroup('SIGKILL') }, 2000)
}

export async function cancel(runId: string): Promise<boolean> {
  const run = getRun(runId)
  if (!run || run.endedAt !== undefined) return false // gone, or already finalized
  run.cancelRequested = true // honored by spawnEngine if the child isn't up yet (the gate-proceed buildArgs window)
  // A user-initiated cancel of a screener signal is a deliberate stop, NOT a breakage. Drop a marker in
  // its run folder so the auto-resume scan (listResumableSignals) never resurrects it on the next reconnect.
  if (run.kind === 'signal') {
    try {
      // rebuild + containment-check the run dir from the validated subject id (same CWE-22 barrier as .target)
      const dir = screenerMarkerDir(run.swarmId, run.subjectId)
      if (dir) {
        fs.writeFileSync(path.join(dir, '.aborted'), JSON.stringify({ at: new Date().toISOString(), reason: 'cancelled' }))
      }
    } catch {
      /* best-effort marker; a missing marker only risks one auto-resume the user can re-cancel */
    }
  }
  // The research equivalent: a deliberately-stopped full company run must never be auto-resumed by the
  // supervisor. Drop .aborted in its run folder and clear any interrupted-marker. (Marker writes are
  // contained under analyses/ by writeRunMarker; best-effort, never throws into cancel.)
  if (isResumableResearchRun(run)) {
    writeRunMarker(run.runRoot, '.aborted', { reason: 'cancelled' })
    clearRunMarker(run.runRoot, '.interrupted')
  }
  // A chained full-run step: halt the chain HERE (any cancel path) so the next module can never launch —
  // not only on the stop-everything kill switch. Without this, cancelling one step could still advance.
  if (run.chained) haltSubjectChains(run.subjectId, run.swarmId)

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

  // Running child: mark cancelled + kill the whole process tree (claude + descendants) promptly, and let
  // finalizeRunOnClose finalize on close (endedAt-gated, takes the status==='cancelled' branch, releases
  // the subject). killProcessTree's SIGKILL fallback also gates on endedAt so it stands down once final.
  run.status = 'cancelled'
  killProcessTree(run)
  return true
}

// Run the deterministic data-readiness check for a run, record + emit the report. force re-reads a
// just-fixed pool. A check that itself THROWS fails SAFE — it returns a blocker, never a silent proceed.
async function checkReadiness(run: RunState, force: boolean): Promise<ReadinessReport> {
  try {
    const report = await runReadiness(run.ticker, run.kind, run.module, { outDir: path.join(REPO_ROOT, run.runRoot!, '_pool_extracts'), force })
    run.readiness = report
    emit(run, { type: 'readiness-report', runId: run.runId, report, ts: Date.now() })
    return report
  } catch (e) {
    console.warn(`[readiness] check threw for ${run.ticker} (${run.kind}); failing safe to a blocker:`, (e as Error)?.message || e)
    const report: ReadinessReport = {
      ticker: run.ticker, kind: run.kind, module: run.module, overall: 'blocked',
      fileCount: 0, usableCount: 0, entities: [],
      issues: [{ code: 'check_failed', severity: 'blocker', message: 'The data-readiness check could not run.', evidence: (e as Error)?.message }],
      ts: Date.now(),
    }
    run.readiness = report
    emit(run, { type: 'readiness-report', runId: run.runId, report, ts: Date.now() })
    return report
  }
}

// Pre-spawn data-readiness gate. Research data-consuming kinds only (swarm kinds skip it); sets
// readiness-checking, then runs the check.
async function runReadinessGate(run: RunState): Promise<void> {
  // Research data-consuming kinds only. Screener kinds aren't in the list below; a generic constellation
  // swarm (e.g. commodity) reuses full/module/agent but owns its sufficiency via its own in-run 00-triage
  // (and reads live public sources, not a company data pool), so it skips this research readiness gate.
  if (run.swarmId !== 'research') return
  if (!run.runRoot || !['full', 'module', 'agent', 'rerun'].includes(run.kind)) return
  run.status = 'readiness-checking'
  emit(run, { type: 'readiness-checking', runId: run.runId, ticker: run.ticker, kind: run.kind, ts: Date.now() })
  await checkReadiness(run, false)
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
    emit(run, { type: 'readiness-resolved', runId, action: 'cancel', ts: Date.now() })
    emit(run, { type: 'run-error', runId, status: 'cancelled', reason: 'cancelled_at_readiness_gate', ts: Date.now() })
    finishRun(run, 'cancelled')
    return { ok: true, status: 'cancelled' }
  }

  if (action === 'recheck') {
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
      if (report.overall !== 'clean') {
        run.status = 'awaiting-readiness-decision' // still gated — re-open for another decision
        return
      }
      await proceedSpawn(run, 'recheck', user) // the pool was fixed -> proceed CLEAN, no override trace
    })().catch(() => { /* checkReadiness never throws (fails safe); proceedSpawn returns errors */ })
    return { ok: true, status: 'readiness-checking' }
  }

  // proceed / override — a human chooses to run on a STILL-non-clean gate
  const hasBlocker = !!run.readiness?.issues.some((i) => i.severity === 'blocker')
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
    fs.writeFileSync(path.join(dir, 'readiness_override.json'), JSON.stringify(trace, null, 2))
  } catch (e) {
    console.warn(`[readiness] could not write override trace for ${run.ticker}:`, (e as Error)?.message || e)
  }
}

// Active, near-free credit probe (out-of-credits is rejected before generation).
export async function creditCheck(): Promise<ReturnType<typeof getCreditStatus>> {
  const flags = await detectFlags()
  const args: string[] = ['--print', 'ok', '--output-format', 'stream-json', '--verbose', '--model', 'haiku']
  if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')
  if (flags.has('--max-turns')) args.push('--max-turns', '1')
  try {
    const child = execa(CLAUDE_BIN, args, { cwd: REPO_ROOT, env: process.env, reject: false, timeout: 30000 })
    const { stdout } = await child
    let sawRateLimit = false
    for (const line of stdout.split('\n')) {
      const t = line.trim()
      if (!t) continue
      try {
        const obj = JSON.parse(t)
        if (obj.type === 'rate_limit_event') {
          const info = obj.rate_limit_info || {}
          sawRateLimit = true
          setCreditStatus({
            ok: info.status !== 'rejected' && info.status !== 'blocked',
            checked: true,
            status: info.status,
            rateLimitType: info.rateLimitType,
            utilization: typeof info.utilization === 'number' ? info.utilization : undefined,
            resetsAt: info.resetsAt,
            isUsingOverage: info.isUsingOverage,
            reason: info.overageDisabledReason || info.status,
          })
        }
        if (obj.type === 'result' && !sawRateLimit) {
          if (obj.is_error && /credit|overage|rate/i.test(JSON.stringify(obj))) {
            setCreditStatus({ ok: false, reason: 'rate_limited', checked: true })
          } else if (!obj.is_error) {
            setCreditStatus({ ok: true, reason: 'ok', checked: true })
          }
        }
      } catch {}
    }
  } catch {
    // a transient probe failure (e.g. a concurrent headless spawn) is NOT a rate limit —
    // keep the last-known usage rather than falsely flipping the badge to "rate limited"
  }
  return getCreditStatus()
}
