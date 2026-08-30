// "Complete the thesis" — what is actually missing, and what can be REUSED instead of paid for again.
//
// The cockpit's core orb used to dead-end on a toast ("No final thesis yet"). That toast was true but
// useless, and it hid an expensive lie: a subject's finished modules can be spread across SEVERAL dated
// run folders (`analyses/<TICKER>_<DATE>/`), while the cockpit's manifest reads only the latest one and
// the master synthesizer reads only ONE folder. So a user staring at "no thesis" would click "Run full",
// land in a fresh `analyses/<TICKER>_<TODAY>` folder, and re-run every module from scratch — paying the
// full pipeline price for work already sitting on disk one folder over.
//
// This module makes the reuse explicit and priced:
//
//   1. `thesisPlan()` reads DISK TRUTH across every dated run folder (the same `latestModuleFolder`
//      resolution the dependency gate and the module commands' F30 upstream fallback already use), and
//      reports, per module: done / stale / partial / missing — plus the vintage (which dated run it came
//      from) and what the remaining work costs versus a naive full re-run.
//
//   2. `carryForwardModules()` copies the reused modules' outputs into TODAY's run root, each stamped with
//      a `CARRIED_FORWARD.md` provenance note recording the run it came from and that it was NOT re-run.
//
// Carrying into TODAY's root (never into a prior-dated folder) is what makes the rest of the engine work
// unchanged: `launchFullChained` already seeds its skip-set from `analyses/<TICKER>_<TODAY>`, and the
// monolithic `/research:full` step 8 already skips any module whose `99_*-synthesis.md` is non-empty in
// the run root. So after a carry-forward, BOTH full-run paths reuse the carried modules and run only the
// remainder + master, and `chainedResumePreflight` prices only that remainder. No launcher change needed.
// It also honours `synthesizer.md`'s standing rule — prior-run folders are never modified, only read.
//
// Staleness (CLAUDE.md §11 — a stale input must not masquerade as a fresh one): a carried module's
// evidence was read against the data pool as it stood on its run date. If `data/<TICKER>/` has gained a
// newer file since, the module predates the data it should have read (and `verify-evidence` would no
// longer find its citations in today's extract corpus). Such a module is reported `stale` and is NOT in
// the default reuse set — it is re-run unless the caller explicitly opts to keep it.
//
// Swarm-generic (CLAUDE.md §26): every module name comes from the discovered graph. Only the research
// swarm has dated run folders, so only it can carry forward; a constellation swarm keeps one stable
// folder per subject, where "reuse" is already the natural behaviour and the carry set is always empty.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, DATA_DIR, REPO_ROOT, STATE_DIR } from './config'
import { canonicalJsonText } from './canonical-json'
import {
  chainedResumePreflight, durableFrozenGenerationSummaryForRun, estimate, type RunProviderSelection,
} from './launcher'
import {
  readVerifiedOutputLineage, type OutputEvidenceLineageEntry,
} from './evidence-lineage'
import { runManifest } from './outputs'
import { buildSwarmGraph, findRunRootForSubject, moduleAncestors, terminalModuleName, transitiveDownstreamModules } from './roster'
import { resolveInsideAnalyses, resolveInsideRuns, safeSubjectSegment } from './sandbox'
import { RESEARCH_SWARM_ID, runRootForSubject, swarmById } from './swarms'
import type { LaunchPreflight, ModuleNode } from './types'
import { validateAgentOutputFile } from '../../../scripts/agent-output-validity.mjs'

/** How a module stands relative to a thesis that still needs to be produced. */
export type ModuleState =
  | 'done' // a non-empty 99 synthesis exists and predates no newer data — reuse it, do not pay again
  | 'stale' // a synthesis exists, but the data pool has gained a file since that run — re-run it
  | 'partial' // some specialist outputs exist, but no synthesis — the module never finished
  | 'missing' // the module has never run for this subject

export interface ModulePlanEntry {
  module: string
  state: ModuleState
  /** A clean exact-module run finished locally but its final module checkpoint did not reach origin/main.
   *  The UI may offer only the content-bound publish retry; it must not launch or pay for the module again. */
  publicationPending?: { targetRunRoot: string; fingerprint: string }
  /** the run this module's evidence truly dates to — read from the carry stamp when the newest
   *  candidate is itself a carried-forward copy, so vintage is never laundered into a copy's date.
   *  Provenance/display only — NOT necessarily a folder that still exists (see `copyFromRunRoot`). */
  sourceRunRoot?: string
  /** the run vintage — the `<DATE>` of `sourceRunRoot` (absent for a non-dated swarm root) */
  sourceDate?: string
  /** the folder to physically COPY FROM — always the real, currently-existing candidate folder
   *  (`finished.runRoot`), never a historical stamp target that may since have been pruned. Carrying
   *  reads bytes from here but reports the vintage from `sourceDate`/`sourceRunRoot`. */
  copyFromRunRoot?: string
  /** true when the newest outputs already live in the target run root (nothing to carry) */
  inTargetRoot: boolean
  /** orbs on disk that the module pipeline will actually REUSE — counted with `validAgentOutputs`, not by
   *  filename, so an empty or header-less file (which Step 4A re-dispatches) is never counted as finished. */
  doneAgents: number
  /** Exact reusable specialist identities for the module-resume CAS. Counts alone are insufficient: one orb
   *  can finish while another disappears and leave the same number behind. Stale/clean runs expose none. */
  doneOrbKeys: string[]
  totalAgents: number
  /** plain-English reason this module's evidence predates the data pool. Populated for `stale` (a finished
   *  module) AND for `partial` (its unfinished orbs) — in both cases it means "do not reuse this, run it". */
  staleReason?: string
  /** ancestors of this module that are themselves in `run` — this module cannot run until they have. Empty
   *  for a module whose whole `depends_on` closure is being reused. Never set for a reused module. */
  blockedBy: string[]
  /** this module can be launched on its own RIGHT NOW: it is in `run`, and nothing upstream of it is. */
  runnable: boolean
  /** orbs that would actually execute if this module ran now — `totalAgents` minus the orbs a resume would
   *  reuse. Equals `totalAgents` for a missing module and for a stale partial (whose orbs are discarded). */
  willRunAgents: number
  /** A synthesis exists, but it predates the current discovered roster and therefore omits one or more
   *  current specialist orbs. The old synthesis must be removed and regenerated after those gaps run. */
  synthesisNeedsRefresh?: boolean
  /** Candidate run roots whose current, non-stale specialist files form this partial resume. Newest first;
   *  `copyFromRunRoot` is the base tree and these roots overlay its reusable specialists per filename. */
  resumeFromRunRoots?: string[]
}

export interface ThesisPlan {
  /** Additive contract gate for the one-click roster-gap resume path. Older servers omit it, so a newer UI
   *  can fail closed instead of turning "finish empty orbs" into a whole-module rerun during rolling deploy. */
  moduleResumeVersion: 2
  /** Server-issued, content-addressed admission contract. POST must return this exact receipt; the server
   *  rebuilds it under the subject lock before any paid child can be admitted. */
  continuationReceipt: ContinuationPlanReceipt
  /** Present only for a module-heading plan. These inputs were selected from the target's declared graph
   * closure and each has a mechanically valid saved synthesis; global full-thesis reuse stays unchanged. */
  exactModuleScope?: { module: string; savedInputs: string[] }
  swarm: string
  subject: string
  /** the run root a completion would write into */
  targetRunRoot: string
  /** the run already produced its final deliverable — nothing to complete */
  complete: boolean
  finalReportPath: string | null
  modules: ModulePlanEntry[]
  /** every module a caller is ALLOWED to reuse — it has a finished synthesis somewhere on disk. Includes
   *  `stale` ones: staleness is a strong default, not a prohibition, and the user may knowingly keep one. */
  reusable: string[]
  /** modules the run CANNOT rebuild even if asked: their finished synthesis already sits in the target run
   *  root, and BOTH full-run paths skip any module whose `99_*-synthesis.md` is non-empty there. Offering a
   *  "re-run" toggle for these would be a lie — the launcher would skip them and their orbs would sit queued
   *  forever. They are always in `reuse`. To genuinely rebuild one, use the orb's Re-run (a rerun cascade). */
  mustReuse: string[]
  /** modules this plan REUSES (carried, never re-run). Defaults to the `done` set — stale is re-run — but
   *  a caller may override it with any subset of `reusable`. */
  reuse: string[]
  /** modules this plan actually runs — the exact complement of `reuse` */
  run: string[]
  /** modules that must be copied into the target root before the run (subset of `reuse`). `from`/`date`
   *  are the TRUE origin (provenance, written into the stamp); `copyFrom` is the folder actually read —
   *  they can differ when the newest candidate is itself an intermediate carried-forward copy. */
  carry: { module: string; from: string; date: string | null; copyFrom: string; staleReason?: string }[]
  master: { state: 'ready' | 'blocked' | 'done'; blockedBy: string[] }
  dataPool: { files: number; newestDate: string | null; newestMs: number }
  /** cost/time of running ONLY the remaining work (what the Run button commits to) */
  preflight: LaunchPreflight
  /** cost/time of the naive full re-run the user would otherwise pay — the savings, made visible */
  fullPreflight: LaunchPreflight
  /** carry-forward is only meaningful where run folders are dated (research) */
  canCarry: boolean
}

export interface ContinuationPlanReceiptPayload {
  version: 2
  action: 'continue' | 'complete'
  swarm: string
  subject: string
  sourceRunRoots: string[]
  targetRunRoot: string
  provider: {
    id: RunProviderSelection['provider']
    model: string | null
    reasoningLevel: string | null
    profileKey: string | null
  }
  reusableOrbKeys: string[]
  payableOrbKeys: string[]
  dataPool: { files: number; newestMs: number; sha256: string }
  /** Exact immutable evidence generation retained for this saved root. Null only for a fresh/multi-root plan. */
  evidenceGenerationDigest: string | null
  /** Protected supervisor lineage for the exact current bytes this plan proposes to reuse. */
  reusableArtifacts: Pick<OutputEvidenceLineageEntry, 'output_rel' | 'sha256' | 'generation_digest' | 'attempt_id'>[]
  reusableArtifactsSha256: string
  /** Digest of the complete protected manifest snapshot (including provider/profile/timestamps). */
  verifiedLineageSha256: string
  /** Content identity of every existing target byte and every module tree this plan will copy. */
  sourceArtifactsSha256: string
}

export interface ContinuationPlanReceipt extends ContinuationPlanReceiptPayload {
  fingerprint: string
}

export function continuationPlanReceiptFingerprint(payload: ContinuationPlanReceiptPayload): string {
  return `sha256:${createHash('sha256').update(canonicalJsonText(payload)).digest('hex')}`
}

/**
 * Convert one pre-snapshot saved run into a safe, current-generation completion plan.
 *
 * Legacy runs cannot satisfy exact Continue's frozen-generation proof, so they must never be written back
 * into the old root. When every reusable module comes from the one root the user selected, we can instead
 * copy those finished module trees into a new protected run and rebuild all unfinished modules against a
 * freshly frozen pool. Unbound partial orbs are deliberately made payable again; only whole module trees
 * covered by the receipt's source-artifact hash are reused.
 */
export function legacySingleRunMigrationPlan(plan: ThesisPlan, sourceRunRoot: string): ThesisPlan | null {
  if (plan.continuationReceipt.action !== 'complete'
      || plan.targetRunRoot === sourceRunRoot
      || plan.reuse.length === 0
      || plan.continuationReceipt.sourceRunRoots.length !== 1
      || plan.continuationReceipt.sourceRunRoots[0] !== sourceRunRoot
      || fs.existsSync(path.join(REPO_ROOT, plan.targetRunRoot))) return null

  const reused = new Set(plan.reuse)
  if (plan.carry.length !== reused.size || plan.carry.some((entry) =>
    !reused.has(entry.module) || entry.from !== sourceRunRoot || entry.copyFrom !== sourceRunRoot)) return null

  const reusableOrbKeys = plan.continuationReceipt.reusableOrbKeys
    .filter((key) => reused.has(key.split('/', 1)[0]!))
    .sort()
  const reusableSet = new Set(reusableOrbKeys)
  const payableOrbKeys = [...new Set([
    ...plan.continuationReceipt.payableOrbKeys,
    ...plan.continuationReceipt.reusableOrbKeys.filter((key) => !reusableSet.has(key)),
  ])].sort()
  const { fingerprint: _fingerprint, ...receipt } = plan.continuationReceipt
  const payload: ContinuationPlanReceiptPayload = {
    ...receipt,
    reusableOrbKeys,
    payableOrbKeys,
  }

  return {
    ...plan,
    modules: plan.modules.map((entry) => {
      if (reused.has(entry.module) || entry.doneOrbKeys.length === 0) return entry
      const {
        sourceRunRoot: _sourceRunRoot, sourceDate: _sourceDate, copyFromRunRoot: _copyFromRunRoot,
        staleReason: _staleReason, synthesisNeedsRefresh: _synthesisNeedsRefresh,
        resumeFromRunRoots: _resumeFromRunRoots, ...rest
      } = entry
      return {
        ...rest,
        state: 'missing',
        inTargetRoot: false,
        doneAgents: 0,
        doneOrbKeys: [],
        willRunAgents: entry.totalAgents,
      }
    }),
    continuationReceipt: {
      ...payload,
      fingerprint: continuationPlanReceiptFingerprint(payload),
    },
  }
}

function continuationSourceArtifactsSha256(
  targetRunRoot: string,
  carries: { module: string; copyFrom: string }[],
): string {
  const scopes = [
    { label: `target:${targetRunRoot}`, abs: path.join(REPO_ROOT, targetRunRoot) },
    ...carries.map((carry) => ({
      label: `carry:${carry.copyFrom}/${carry.module}`,
      abs: path.join(REPO_ROOT, carry.copyFrom, carry.module),
    })),
  ].sort((a, b) => a.label.localeCompare(b.label))
  const rows: {
    scope: string; path: string; mode?: number; bytes?: number; sha256?: string;
    kind?: 'symlink' | 'non-file'; missing?: true
  }[] = []
  const visit = (scope: string, root: string, current: string): void => {
    const info = fs.lstatSync(current)
    const rel = path.relative(root, current) || '.'
    if (info.isSymbolicLink()) {
      rows.push({
        scope, path: rel, mode: info.mode & 0o777, kind: 'symlink',
        sha256: createHash('sha256').update(fs.readlinkSync(current)).digest('hex'),
      })
      return
    }
    if (info.isFile()) {
      rows.push({
        scope, path: rel, mode: info.mode & 0o777, bytes: info.size,
        sha256: createHash('sha256').update(fs.readFileSync(current)).digest('hex'),
      })
      return
    }
    if (!info.isDirectory()) {
      rows.push({ scope, path: rel, mode: info.mode & 0o777, kind: 'non-file' })
      return
    }
    rows.push({ scope, path: `${rel}/`, mode: info.mode & 0o777 })
    for (const name of fs.readdirSync(current).sort()) visit(scope, root, path.join(current, name))
  }
  for (const scope of scopes) {
    try { visit(scope.label, scope.abs, scope.abs) } catch (error: any) {
      if (error?.code === 'ENOENT') rows.push({ scope: scope.label, path: '.', missing: true })
      else throw error
    }
  }
  return `sha256:${createHash('sha256').update(canonicalJsonText(rows)).digest('hex')}`
}

async function continuationSourceArtifactsSha256Async(
  targetRunRoot: string,
  carries: { module: string; copyFrom: string }[],
): Promise<string> {
  const scopes = [
    { label: `target:${targetRunRoot}`, abs: path.join(REPO_ROOT, targetRunRoot) },
    ...carries.map((carry) => ({
      label: `carry:${carry.copyFrom}/${carry.module}`,
      abs: path.join(REPO_ROOT, carry.copyFrom, carry.module),
    })),
  ].sort((a, b) => a.label.localeCompare(b.label))
  const rows: {
    scope: string; path: string; mode?: number; bytes?: number; sha256?: string;
    kind?: 'symlink' | 'non-file'; missing?: true
  }[] = []
  const visit = async (scope: string, root: string, current: string): Promise<void> => {
    const before = await fs.promises.lstat(current)
    const rel = path.relative(root, current) || '.'
    if (before.isSymbolicLink()) {
      rows.push({
        scope, path: rel, mode: before.mode & 0o777, kind: 'symlink',
        sha256: createHash('sha256').update(await fs.promises.readlink(current)).digest('hex'),
      })
      return
    }
    if (before.isFile()) {
      const bytes = await fs.promises.readFile(current)
      const after = await fs.promises.lstat(current)
      if (!after.isFile() || after.isSymbolicLink() || before.dev !== after.dev || before.ino !== after.ino
          || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
        throw new Error('continuation source artifact changed during planning')
      }
      rows.push({
        scope, path: rel, mode: before.mode & 0o777, bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      })
      return
    }
    if (!before.isDirectory()) {
      rows.push({ scope, path: rel, mode: before.mode & 0o777, kind: 'non-file' })
      return
    }
    rows.push({ scope, path: `${rel}/`, mode: before.mode & 0o777 })
    const names = (await fs.promises.readdir(current)).sort()
    for (const name of names) await visit(scope, root, path.join(current, name))
  }
  for (const scope of scopes) {
    try { await visit(scope.label, scope.abs, scope.abs) } catch (error: any) {
      if (error?.code === 'ENOENT') rows.push({ scope: scope.label, path: '.', missing: true })
      else throw error
    }
  }
  return `sha256:${createHash('sha256').update(canonicalJsonText(rows)).digest('hex')}`
}

function continuationDataPoolSha256(ticker: string, dataDir: string = DATA_DIR): string {
  const root = path.join(dataDir, safeSubjectSegment(ticker))
  const rows: { path: string; bytes: number; sha256: string }[] = []
  const walk = (directory: string, depth: number): void => {
    if (depth > 24) throw new Error('continuation data-pool nesting exceeds the supported boundary')
    const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    const isOutputDir = entries.some((entry) => entry.name === '.nostradamus_output' && entry.isFile())
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) continue // matches the evidence reader/freshness walk: never follow links
      if (entry.isDirectory()) { walk(absolute, depth + 1); continue }
      if (!entry.isFile() || isOutputDir) continue
      const before = fs.lstatSync(absolute)
      if (!before.isFile() || before.isSymbolicLink()) throw new Error('continuation data-pool entry changed during planning')
      const bytes = fs.readFileSync(absolute)
      const after = fs.lstatSync(absolute)
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
          || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
        throw new Error('continuation data-pool entry changed during planning')
      }
      rows.push({
        path: path.relative(root, absolute), bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      })
    }
  }
  try { walk(root, 0) } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  return `sha256:${createHash('sha256').update(canonicalJsonText(rows)).digest('hex')}`
}

async function continuationDataPoolSha256Async(ticker: string, dataDir: string = DATA_DIR): Promise<string> {
  const root = path.join(dataDir, safeSubjectSegment(ticker))
  const rows: { path: string; bytes: number; sha256: string }[] = []
  const walk = async (directory: string, depth: number): Promise<void> => {
    if (depth > 24) throw new Error('continuation data-pool nesting exceeds the supported boundary')
    const entries = (await fs.promises.readdir(directory, { withFileTypes: true }))
      .sort((a, b) => a.name.localeCompare(b.name))
    const isOutputDir = entries.some((entry) => entry.name === '.nostradamus_output' && entry.isFile())
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) { await walk(absolute, depth + 1); continue }
      if (!entry.isFile() || isOutputDir) continue
      const before = await fs.promises.lstat(absolute)
      if (!before.isFile() || before.isSymbolicLink()) throw new Error('continuation data-pool entry changed during planning')
      const bytes = await fs.promises.readFile(absolute)
      const after = await fs.promises.lstat(absolute)
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
          || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
        throw new Error('continuation data-pool entry changed during planning')
      }
      rows.push({
        path: path.relative(root, absolute), bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      })
    }
  }
  try { await walk(root, 0) } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  return `sha256:${createHash('sha256').update(canonicalJsonText(rows)).digest('hex')}`
}

export function continuationPlanReceiptMatches(
  expected: ContinuationPlanReceipt,
  actual: ContinuationPlanReceipt,
): boolean {
  const { fingerprint: expectedFingerprint, ...expectedPayload } = expected
  const { fingerprint: actualFingerprint, ...actualPayload } = actual
  return expectedFingerprint === continuationPlanReceiptFingerprint(expectedPayload)
    && actualFingerprint === continuationPlanReceiptFingerprint(actualPayload)
    && expectedFingerprint === actualFingerprint
    && canonicalJsonText(expectedPayload) === canonicalJsonText(actualPayload)
}

/**
 * Internal continuation scope. Ordinary completion plans deliberately aggregate reusable work across dated
 * folders and write into today's folder. A Continue action is different: it is bound to one saved folder,
 * and both planning and execution must remain inside that exact root.
 */
interface FrozenGenerationPlanScope {
  generationDigest: string
  fileCount: number
  newestMs: number
  verifiedLineageDigest: string
  reusableArtifacts: Pick<OutputEvidenceLineageEntry, 'output_rel' | 'sha256' | 'generation_digest' | 'attempt_id'>[]
}

export type ThesisPlanScope = {
  continuationRunRoot: string
  /** Internal supervisor proof. HTTP callers provide only the root; the request planner resolves this from
   * owner-only state. Keeping it on the scope makes the pure planner testable without ever touching Drive. */
  frozenGeneration?: FrozenGenerationPlanScope
  freshRunRoot?: never
} | {
  /** Internal supervisor-only scope for revalidating a deferred, already-reviewed fresh Full admission after
   * midnight. It preserves the original target identity without turning the action into Continue/reuse. */
  freshRunRoot: string
  continuationRunRoot?: never
  /** A pre-spend retry must compare the reviewed receipt with the live pool. Only a chain which already
   * crossed the paid boundary may resolve the owner-only frozen generation for this exact run root. */
  recoverFrozenGeneration?: true
  /** A started fresh Full already paid against one frozen generation. Restart recovery keeps action=Full
   * while resolving this protected snapshot; it never reopens today's live Drive pool. */
  frozenGeneration?: FrozenGenerationPlanScope
}

interface ContinuationReceiptHashes {
  dataPoolSha256: string
  sourceArtifactsSha256: string
}

const DEFERRED_RECEIPT_HASHES: ContinuationReceiptHashes = {
  dataPoolSha256: `sha256:${'0'.repeat(64)}`,
  sourceArtifactsSha256: `sha256:${'0'.repeat(64)}`,
}

function continuationPlanningError(code: string, message: string): Error & { code: string; statusCode: number } {
  return Object.assign(new Error(message), { code, statusCode: 409 })
}

function exactFrozenScope(subject: string, scope: ThesisPlanScope): ThesisPlanScope {
  if (scope.frozenGeneration) return scope
  const recoverFrozenGeneration = 'recoverFrozenGeneration' in scope
    && scope.recoverFrozenGeneration === true
  if (typeof scope.freshRunRoot === 'string' && !recoverFrozenGeneration) return scope
  const maybeFresh = 'freshRunRoot' in scope ? scope.freshRunRoot : undefined
  const runRoot = typeof maybeFresh === 'string' ? maybeFresh : scope.continuationRunRoot
  if (typeof runRoot !== 'string') throw continuationPlanningError(
    'saved_generation_unavailable', 'This run’s exact data snapshot identity is missing. Nothing was started.',
  )
  let summary: ReturnType<typeof durableFrozenGenerationSummaryForRun>
  try {
    summary = durableFrozenGenerationSummaryForRun({ ticker: subject, runRoot }, STATE_DIR)
  } catch (error: any) {
    const missing = /no frozen generation receipt/i.test(String(error?.message || error))
    throw continuationPlanningError(
      missing ? 'legacy_generation_unbound' : 'saved_generation_unavailable',
      missing
        ? 'This old run predates safe data snapshots. Start a new Full run; nothing was started.'
        : 'This saved run’s data snapshot could not be verified. Nothing was started.',
    )
  }
  let snapshot: ReturnType<typeof readVerifiedOutputLineage>
  try { snapshot = readVerifiedOutputLineage(runRoot) } catch {
    throw continuationPlanningError(
      'saved_generation_unavailable',
      'This saved run’s output record could not be verified. Nothing was started.',
    )
  }
  const reusableArtifacts = snapshot.entries
    .filter((entry) => entry.generation_digest === summary.generationDigest)
    .map(({ output_rel, sha256, generation_digest, attempt_id }) => ({
      output_rel, sha256, generation_digest, attempt_id,
    }))
    .sort((left, right) => left.output_rel.localeCompare(right.output_rel))
  const verifiedLineageDigest = snapshot.verifiedDigest
  return {
    ...scope,
    frozenGeneration: {
      generationDigest: summary.generationDigest,
      fileCount: summary.fileCount,
      newestMs: summary.newestMs,
      verifiedLineageDigest,
      reusableArtifacts,
    },
  }
}

const DATE_SUFFIX = /_(\d{4}-\d{2}-\d{2})$/

export function todayDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface SynthesisOnDisk { file: string; mtimeMs: number }
type ReusableOutputProof = (absolutePath: string) => boolean

interface SavedInputCandidate {
  sourceRunRoot: string
  sourceDate?: string
  copyFromRunRoot: string
  staleReason?: string
}

/** A module folder is current only when the CURRENT discovered synthesis filename passes the shared
 *  mechanical validator. A truncated or legacy `99_old-synthesis.md` must not look complete forever. */
function currentSynthesis(
  module: ModuleNode,
  moduleDirAbs: string,
  reusableOutput?: ReusableOutputProof,
): SynthesisOnDisk | null {
  let entries: string[]
  try {
    const dir = fs.lstatSync(moduleDirAbs)
    if (!dir.isDirectory() || dir.isSymbolicLink()) return null
    entries = fs.readdirSync(moduleDirAbs)
  } catch {
    return null
  }
  const expected = synthesisOutputFiles(module)
  for (const file of entries) {
    if (!expected.has(file)) continue
    try {
      const st = fs.lstatSync(path.join(moduleDirAbs, file))
      if (st.isFile() && !st.isSymbolicLink()
          && (!reusableOutput || reusableOutput(path.join(moduleDirAbs, file)))
          && validateAgentOutputFile(path.join(moduleDirAbs, file)).valid) {
        return { file, mtimeMs: st.mtimeMs }
      }
    } catch {
      /* keep looking if a multi-synthesis module ever declares another current output */
    }
  }
  return null
}

function hasSynthesis(module: ModuleNode, moduleDirAbs: string, reusableOutput?: ReusableOutputProof): boolean {
  return currentSynthesis(module, moduleDirAbs, reusableOutput) !== null
}

/** Generic legacy/obsolete synthesis detector, used only to force cleanup and a fresh current synthesis. */
function hasAnySynthesis(moduleDirAbs: string): boolean {
  try {
    const dir = fs.lstatSync(moduleDirAbs)
    if (!dir.isDirectory() || dir.isSymbolicLink()) return false
    return fs.readdirSync(moduleDirAbs).some((file) => {
      if (!/^99_.*\.md$/.test(file)) return false
      try {
        const st = fs.lstatSync(path.join(moduleDirAbs, file))
        return st.isFile() && !st.isSymbolicLink() && st.size > 0
      } catch { return false }
    })
  } catch { return false }
}

function specialistOutputFiles(module: ModuleNode): Set<string> {
  return new Set(
    Object.values(module.layers)
      .flat()
      .filter((agent) => !agent.isSynthesis)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  )
}

function synthesisOutputFiles(module: ModuleNode): Set<string> {
  return new Set(
    Object.values(module.layers)
      .flat()
      .filter((agent) => agent.isSynthesis)
      .map((agent) => `${agent.key.split('/').at(-1)}.md`),
  )
}

function orbKeys(module: string, files: Iterable<string>): string[] {
  return [...files].sort().map((file) => `${module}/${file.replace(/\.md$/, '')}`)
}

function modulePromptDir(module: ModuleNode, swarmId: string): string | null {
  if (module.moduleDir) return path.join(REPO_ROOT, module.moduleDir)
  const swarm = swarmById(swarmId)
  return swarm ? path.join(swarm.dir, module.name) : null
}

function mentionsExactOutputFile(text: string, file: string): boolean {
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Prompt lines may qualify an input with a directory, quotes, or backticks. Match those, but never a
  // longer filename such as 101_foo.md or 01_foo.md-backup: either false positive would make the planner
  // discard and repay a specialist that has no actual dependency on the changed orb.
  return new RegExp(`(^|[^A-Za-z0-9_.-])${escaped}(?![A-Za-z0-9_-]|\\.[A-Za-z0-9_-])`).test(text)
}

/** Read the module-local filenames explicitly named on an agent's `UPSTREAM_INPUTS` line. This keeps roster
 *  growth zero-touch: when a new specialist becomes an input to an older specialist, the older saved output
 *  is not reused before it has had a chance to read the new work. Cross-module inputs are intentionally cut
 *  off at their labelled clause; those are handled by module dependencies/carrying instead. */
function specialistDependencies(module: ModuleNode, swarmId: string): Map<string, Set<string>> {
  const expected = specialistOutputFiles(module)
  const out = new Map<string, Set<string>>()
  const promptDir = modulePromptDir(module, swarmId)
  if (!promptDir) return out
  for (const agent of Object.values(module.layers).flat().filter((node) => !node.isSynthesis)) {
    const basename = `${agent.key.split('/').at(-1)}.md`
    let body = ''
    try { body = fs.readFileSync(path.join(promptDir, basename), 'utf8') } catch { continue }
    const line = body.split(/\r?\n/).find((candidate) => candidate.includes('UPSTREAM_INPUTS'))
    if (!line) continue
    const local = line.split(/Optionally cross-module|Cross-module:/i, 1)[0]
    if (/none(?: required)? in-module/i.test(local)) continue
    const deps = new Set([...expected].filter((file) => file !== basename && mentionsExactOutputFile(local, file)))
    if (deps.size) out.set(basename, deps)
  }
  return out
}

interface SpecialistFact {
  file: string
  abs: string
  mtimeMs: number
  runRoot?: string
  sourceDate?: string
}

/** Current-roster specialist files that can safely coexist. Dependency freshness is evaluated on the
 *  selected file facts rather than one directory, so a manually-run new orb can first be merged with its
 *  older prerequisites and only then invalidate saved dependents that predate it. */
function reusableSpecialistFacts(module: ModuleNode, facts: Map<string, SpecialistFact>, swarmId: string): SpecialistFact[] {
  const expected = specialistOutputFiles(module)
  const reusable = new Set([...facts.keys()].filter((file) => expected.has(file)))
  const needsRun = new Set([...expected].filter((file) => !reusable.has(file)))
  const dependencies = specialistDependencies(module, swarmId)
  let changed = true
  while (changed) {
    changed = false
    for (const [file, deps] of dependencies) {
      if (!reusable.has(file)) continue
      const fileFact = facts.get(file)
      const invalidInput = [...deps].some((dep) => {
        if (needsRun.has(dep)) return true
        if (!reusable.has(dep)) return false
        const depFact = facts.get(dep)
        if (!fileFact || !depFact) return true

        // Git checkouts do not preserve mtimes. Across dated run folders, the provenance date is the
        // durable ordering authority: a dependency from a later research vintage invalidates an older
        // dependent even when the older file happens to have a newer checkout timestamp. Only compare
        // mtimes once the facts are proven to share a vintage (or are local facts from one directory).
        if (fileFact.sourceDate && depFact.sourceDate && fileFact.sourceDate !== depFact.sourceDate) {
          return depFact.sourceDate > fileFact.sourceDate
        }
        const sameRoot = fileFact.runRoot === depFact.runRoot
        const sameVintage = Boolean(fileFact.sourceDate && fileFact.sourceDate === depFact.sourceDate)
        if (!sameRoot && !sameVintage) return true // cross-folder ordering is unproven: fail closed
        return depFact.mtimeMs > fileFact.mtimeMs
      })
      if (!invalidInput) continue
      reusable.delete(file)
      needsRun.add(file)
      changed = true
    }
  }
  return [...reusable].sort().map((file) => facts.get(file)!).filter(Boolean)
}

function specialistFactsInDir(
  module: ModuleNode,
  moduleDirAbs: string,
  reusableOutput?: ReusableOutputProof,
): Map<string, SpecialistFact> {
  const out = new Map<string, SpecialistFact>()
  for (const file of validAgentOutputs(moduleDirAbs, specialistOutputFiles(module), reusableOutput)) {
    const abs = path.join(moduleDirAbs, file)
    try {
      const st = fs.lstatSync(abs)
      if (st.isFile() && !st.isSymbolicLink()) out.set(file, { file, abs, mtimeMs: st.mtimeMs })
    } catch { /* raced/vanished — not reusable */ }
  }
  return out
}

/** Valid specialist outputs that can safely be reused together from one module folder. */
function reusableSpecialistOutputs(
  module: ModuleNode,
  moduleDirAbs: string,
  swarmId: string,
  reusableOutput?: ReusableOutputProof,
): string[] {
  return reusableSpecialistFacts(module, specialistFactsInDir(module, moduleDirAbs, reusableOutput), swarmId)
    .map((fact) => fact.file)
}

/** An existing synthesis is structurally old when today's discovered roster differs from the numbered
 *  specialist files it summarized, or a selected specialist is newer. Dated provenance is authoritative
 *  across run folders; mtime is used only within one proven vintage/root. */
function synthesisNeedsRefresh(
  module: ModuleNode,
  moduleDirAbs: string,
  swarmId: string,
  selectedFacts?: SpecialistFact[],
  synthesisProvenance?: { runRoot: string; sourceDate?: string },
  reusableOutput?: ReusableOutputProof,
): boolean {
  const expected = specialistOutputFiles(module)
  let entries: string[]
  try { entries = fs.readdirSync(moduleDirAbs) } catch { return false }
  const synthesis = currentSynthesis(module, moduleDirAbs, reusableOutput)
  if (!synthesis) return hasAnySynthesis(moduleDirAbs)

  const local = reusableSpecialistFacts(module, specialistFactsInDir(module, moduleDirAbs, reusableOutput), swarmId)
  // A 99 can only have read specialists staged beside it. A matching file in some other run folder may be
  // useful to the new resume, but it cannot retroactively make this historical synthesis structurally whole.
  if (local.length < expected.size) return true
  const valid = selectedFacts ?? local
  if (valid.length < expected.size) return true
  if (entries.some((file) => /^[0-9]{2}_.*\.md$/.test(file) && !/^99_/.test(file) && !expected.has(file))) return true

  return valid.some((fact) => {
    if (fact.sourceDate && synthesisProvenance?.sourceDate
      && fact.sourceDate !== synthesisProvenance.sourceDate) {
      return fact.sourceDate > synthesisProvenance.sourceDate
    }
    const sameRoot = !fact.runRoot || fact.runRoot === synthesisProvenance?.runRoot
    const sameVintage = Boolean(fact.sourceDate && fact.sourceDate === synthesisProvenance?.sourceDate)
    if (!sameRoot && !sameVintage) return true // cross-folder ordering is unproven: refresh safely
    return fact.mtimeMs > synthesis.mtimeMs
  })
}

/** The orb outputs a resume will genuinely REUSE, newest-name-first-sorted, as `NN_slug.md` basenames.
 *
 *  Keyed on the SAME deterministic validator MODULE_PIPELINE invokes before deciding to skip an agent.
 *  A filename/header-only count overstates reusable work when a file has an unclosed fence or a trailing
 *  chat-confirmation block: the server would promise 8 executions while the child re-dispatches a ninth.
 *  Prose quality remains a synthesis judgment; it is never a hidden post-approval reason to widen scope. */
function validAgentOutputs(
  moduleDirAbs: string,
  expected?: Set<string>,
  reusableOutput?: ReusableOutputProof,
): string[] {
  let entries: string[]
  try {
    entries = fs.readdirSync(moduleDirAbs)
  } catch {
    return []
  }
  return entries
    .filter((f) => /^[0-9]{2}_.*\.md$/.test(f) && !/^99_/.test(f) && (!expected || expected.has(f)))
    .filter((f) => {
      try {
        const st = fs.lstatSync(path.join(moduleDirAbs, f))
        if (!st.isFile() || st.isSymbolicLink()) return false
        if (reusableOutput && !reusableOutput(path.join(moduleDirAbs, f))) return false
        return validateAgentOutputFile(path.join(moduleDirAbs, f)).valid
      } catch {
        return false
      }
    })
    .sort()
}

/** The machine-readable provenance line inside a `CARRIED_FORWARD.md` stamp. */
const CARRY_PROVENANCE = /<!--\s*carried-from:\s*(\S+)\s*\|\s*run-date:\s*(\d{4}-\d{2}-\d{2})\s*-->/

/** A carried module physically lives in a folder named for TODAY, but its evidence was read against the data
 *  pool of its SOURCE run. If we took the vintage from the folder name, a module carried once would report
 *  today's date and could never be stale again — the exact "silently age a conclusion forward" failure the
 *  stamp exists to prevent (§11). So the stamp, not the folder name, is the vintage of record. */
function carriedVintage(moduleDirAbs: string): { from: string; date: string } | null {
  try {
    const m = CARRY_PROVENANCE.exec(fs.readFileSync(path.join(moduleDirAbs, CARRY_MARKER), 'utf8'))
    return m ? { from: m[1], date: m[2] } : null
  } catch {
    return null
  }
}

/** The twin of `CARRIED_FORWARD.md`, for a module that was RESUMED rather than reused whole: its finished
 *  orbs were copied in from an unfinished earlier run, and the rest ran here.
 *
 *  It is deliberately a DIFFERENT filename with a DIFFERENT provenance key (`resumed-from:`, never
 *  `carried-from:`). `carriedVintage` above is what dates a FINISHED module, and it must never match this
 *  marker: a module that was resumed and then genuinely completed today did run today, and reading a
 *  carry stamp would back-date the whole module to the run its one leftover orb came from.
 *
 *  Matches none of the engine's output patterns (`NN_*.md`, `99_*-synthesis.md`, `*_memo.md`,
 *  `*_dossier.md`), so it is never mistaken for a specialist report — while still being swept into the
 *  module and audit dossiers' lossless `*.md` concatenation, which is where an auditor should find it. */
const RESUME_MARKER = 'RESUMED_FROM.md'
const RESUME_PROVENANCE = /<!--\s*resumed-from:\s*(\S+)\s*\|\s*run-date:\s*(\d{4}-\d{2}-\d{2})\s*-->/

/** A resumed module's orbs physically live in a folder named for the run that COPIED them, so — exactly as
 *  with `carriedVintage` — the stamp, not the folder name, is the vintage of record. Without this, orbs
 *  resumed on Jul 10 from a Jul 4 run would report "Jul 10" and never face a staleness check against data
 *  that landed Jul 5–9 (CLAUDE.md §11). Read for `partial` entries only. */
function resumedVintage(moduleDirAbs: string): { from: string; date: string } | null {
  try {
    const m = RESUME_PROVENANCE.exec(fs.readFileSync(path.join(moduleDirAbs, RESUME_MARKER), 'utf8'))
    return m ? { from: m[1], date: m[2] } : null
  } catch {
    return null
  }
}

interface RunFolderCandidate { runRoot: string; date: string }

/** A real directory whose own entry and resolved target stay below analyses/. Checking the final module path
 *  is not enough: `lstat(analyses/TICKER_DATE/module)` follows a symlink in the dated parent component. */
function realDirectoryInsideAnalyses(abs: string): boolean {
  try {
    const st = fs.lstatSync(abs)
    if (!st.isDirectory() || st.isSymbolicLink()) return false
    const analyses = fs.realpathSync(ANALYSES_DIR)
    const real = fs.realpathSync(abs)
    return real.startsWith(analyses + path.sep)
  } catch { return false }
}

function assertRealRunRootInsideAnalyses(runRoot: string): string {
  const abs = path.join(REPO_ROOT, runRoot)
  if (!realDirectoryInsideAnalyses(abs)) throw new Error(`run root is not a contained real directory: ${runRoot}`)
  return abs
}

/** Validate a module folder again at mutation time. Planning already rejects symlinked candidates, but a
 *  precomputed plan can outlive the directory entry it inspected. Never let a later copy/delete follow a
 *  swapped run-root or module symlink. */
function assertContainedModuleDir(runRoot: string, module: string): string {
  const runAbs = assertRealRunRootInsideAnalyses(runRoot)
  const moduleAbs = path.join(runAbs, module)
  const st = fs.lstatSync(moduleAbs)
  if (!st.isDirectory() || st.isSymbolicLink()) throw new Error(`module folder is not a real directory: ${runRoot}/${module}`)
  const runReal = fs.realpathSync(runAbs)
  const moduleReal = fs.realpathSync(moduleAbs)
  if (!moduleReal.startsWith(runReal + path.sep)) throw new Error(`module folder escapes its run root: ${runRoot}/${module}`)
  return moduleAbs
}

/** Create a missing target root, but reject an existing symlink even when it resolves back inside analyses.
 *  The root is the unit later removed/replaced, so accepting an alias makes the destructive target ambiguous. */
function ensureRealTargetRunRoot(runRoot: string): string {
  const abs = path.join(REPO_ROOT, runRoot)
  if (fs.existsSync(abs)) return assertRealRunRootInsideAnalyses(runRoot)
  fs.mkdirSync(abs, { recursive: true })
  return assertRealRunRootInsideAnalyses(runRoot)
}

function assertContainedTargetModuleOrMissing(runRoot: string, module: string): string {
  const runAbs = assertRealRunRootInsideAnalyses(runRoot)
  const moduleAbs = path.join(runAbs, module)
  if (!fs.existsSync(moduleAbs)) return moduleAbs
  return assertContainedModuleDir(runRoot, module)
}

/** Every dated run folder for `ticker`, newest date first. Read ONCE per plan: `GET /api/thesis-plan` fires
 *  on every checkbox toggle, and a per-module `readdirSync(ANALYSES_DIR)` would re-scan a directory that grows
 *  one folder per subject per run — N blocking directory reads per click, on the same event loop that is
 *  pushing the run's SSE stream. */
function datedRunFoldersFor(ticker: string): RunFolderCandidate[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(ANALYSES_DIR, { withFileTypes: true })
  } catch {
    return []
  }
  const out: RunFolderCandidate[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue
    const m = DATE_SUFFIX.exec(entry.name)
    // `m.index` is the offset of the `_`, so "AMZNX_2026-01-01" yields "AMZNX" and never matches "AMZN".
    if (!m || entry.name.slice(0, m.index) !== ticker) continue
    const runRoot = `analyses/${entry.name}`
    if (!realDirectoryInsideAnalyses(path.join(REPO_ROOT, runRoot))) continue
    out.push({ runRoot, date: m[1] })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** The folders (newest first) that actually contain `module`. */
function foldersWithModule(folders: RunFolderCandidate[], module: string): RunFolderCandidate[] {
  return folders.filter((f) => {
    try {
      const runAbs = assertRealRunRootInsideAnalyses(f.runRoot)
      const moduleAbs = path.join(runAbs, module)
      const st = fs.lstatSync(moduleAbs)
      if (!st.isDirectory() || st.isSymbolicLink()) return false
      const runReal = fs.realpathSync(runAbs)
      const moduleReal = fs.realpathSync(moduleAbs)
      return moduleReal.startsWith(runReal + path.sep)
    } catch {
      return false
    }
  })
}

/** Newest file in the subject's data pool. `data/` is untracked (gitignored), so unlike `analyses/` its
 *  mtimes are never rewritten by a checkout or a rebase — they are the one durable freshness signal we
 *  have. Returns the local calendar date, which is what run folders are named by. */
export function dataPoolNewest(ticker: string, dataDir: string = DATA_DIR): { files: number; newestDate: string | null; newestMs: number } {
  // `ticker` reaches here from a query string. Reduce it to a proven single path segment before it touches
  // the filesystem — otherwise `dataPoolNewest('..')` walks the whole repo on a blocking stat.
  const root = path.join(dataDir, safeSubjectSegment(ticker))
  let files = 0
  let newestMtimeMs = 0 // mtime-only → drives `newestDate`, the staleness floor's calendar-day basis (unchanged)
  let newestMs = 0 // max(mtime, ctime) → the intake freshness witness (see below)
  const walk = (dir: string, depth: number): void => {
    // Over-approximate the reader's scope: the intake command's `find` and the extractor's iter_pool_files
    // walk the pool unbounded, so this freshness scan must too — else a document nested deeper than the cap
    // (e.g. external/<provider>/<sub>/…) lands unseen and a stale run/plan reads as fresh. The walk never
    // follows symlinks (a symlinked dir is not e.isDirectory()), so a generous cap is loop-safe.
    if (depth > 24) return
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    // The launcher writes memos/dossiers back into the company's Drive folder and marks their immediate
    // parent with this sentinel. They are engine output, not evidence; counting them makes yesterday's own
    // memo look like a new filing and needlessly turns a safe gap resume into a clean, paid rerun.
    const isOutputDir = fs.existsSync(path.join(dir, '.nostradamus_output'))
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const p = path.join(dir, e.name)
      if (e.isDirectory()) {
        walk(p, depth + 1)
        continue
      }
      if (!e.isFile()) continue
      if (isOutputDir) continue
      files++
      try {
        const st = fs.statSync(p)
        if (st.mtimeMs > newestMtimeMs) newestMtimeMs = st.mtimeMs
        // newestMs = max(mtime, ctime): mtime is the document's own modification time, but data/ is a
        // Google-Drive mount and Drive — like `cp -p` / `rsync -t` / `unzip` — materialises a file with its
        // ORIGINAL (often older) mtime, so a doc dropped in late but authored earlier would look old. ctime
        // is the local inode-change time (link/create) which those tools do NOT preserve, so it reflects
        // true arrival. Only `newestMs` uses it (the intake witness, an over-approximation that never
        // under-reports arrival); `newestDate` stays mtime-only so the staleness floor keeps its calendar-
        // day meaning ("the pool gained a document DATED after this run").
        const arrivalMs = Math.max(st.mtimeMs, st.ctimeMs)
        if (arrivalMs > newestMs) newestMs = arrivalMs
      } catch {
        /* vanished mid-scan */
      }
    }
  }
  walk(root, 0)
  // `newestDate` is the calendar-day signal the staleness floor uses (same-day ambiguity tolerated),
  // mtime-only so it means "the pool gained a document DATED after this run". `newestMs` is the finer
  // arrival signal (max mtime/ctime) for callers that must prove a plan saw the whole pool — the intake
  // pool-currency check. Both are 0/null when the pool is empty.
  return { files, newestDate: newestMtimeMs > 0 ? todayDate(new Date(newestMtimeMs)) : null, newestMs }
}

/** A module is stale when the data pool gained a file on a LATER calendar day than the run that produced
 *  it. A same-day tie is NOT flagged: the run folder carries only a date, so we cannot tell whether the
 *  file landed before or after the module read the pool, and re-running on a coin-flip would burn money
 *  for nothing. Same-day ambiguity is disclosed in the returned reason, never silently resolved. */
function stalenessOf(sourceDate: string | undefined, newestDate: string | null): string | undefined {
  if (!sourceDate || !newestDate) return undefined
  if (newestDate <= sourceDate) return undefined
  return `ran ${sourceDate}; the data pool gained a file on ${newestDate} that this module never read`
}

interface CandidateVintage { sourceRunRoot: string; sourceDate?: string }

/** Vintage of specialist work in one candidate. A completed current synthesis dates to its physical run
 *  (unless it is a whole-module carry); a still-partial resume keeps the older `RESUMED_FROM` floor. */
function candidateVintage(
  module: ModuleNode,
  candidate: RunFolderCandidate,
  reusableOutput?: ReusableOutputProof,
): CandidateVintage {
  const dir = path.join(REPO_ROOT, candidate.runRoot, module.name)
  const carried = carriedVintage(dir)
  if (carried) return { sourceRunRoot: carried.from, sourceDate: carried.date }
  if (!hasSynthesis(module, dir, reusableOutput)) {
    const resumed = resumedVintage(dir)
    if (resumed) return { sourceRunRoot: resumed.from, sourceDate: resumed.date }
  }
  return { sourceRunRoot: candidate.runRoot, sourceDate: candidate.date || undefined }
}

interface MergedSpecialists {
  facts: SpecialistFact[]
  /** every non-stale candidate that supplied at least one selected reusable specialist, newest first */
  runRoots: string[]
  /** conservative provenance floor for a mixed resume */
  sourceRunRoot?: string
  sourceDate?: string
}

/** Merge first, validate dependencies second. Selecting within each folder first would reject a manually-run
 *  new 07 solely because its older 00 prerequisite lives one run folder back — exactly the progress-loss bug
 *  this path exists to avoid. Candidates arrive newest first, so the first valid copy of each orb wins. */
function mergedSpecialists(
  module: ModuleNode,
  candidates: RunFolderCandidate[],
  swarmId: string,
  poolNewestDate: string | null,
  reusableOutput?: ReusableOutputProof,
): MergedSpecialists {
  const selected = new Map<string, SpecialistFact>()
  const candidateByRoot = new Map(candidates.map((candidate) => [candidate.runRoot, candidate]))
  for (const candidate of candidates) {
    const vintage = candidateVintage(module, candidate, reusableOutput)
    if (stalenessOf(vintage.sourceDate, poolNewestDate)) continue
    const dir = path.join(REPO_ROOT, candidate.runRoot, module.name)
    for (const fact of specialistFactsInDir(module, dir, reusableOutput).values()) {
      if (selected.has(fact.file)) continue
      selected.set(fact.file, { ...fact, runRoot: candidate.runRoot, sourceDate: vintage.sourceDate })
    }
  }

  const facts = reusableSpecialistFacts(module, selected, swarmId)
  const used = new Set(facts.map((fact) => fact.runRoot).filter((root): root is string => Boolean(root)))
  const runRoots = candidates.map((candidate) => candidate.runRoot).filter((root) => used.has(root))
  let oldest: SpecialistFact | undefined
  for (const fact of facts) {
    if (!oldest || (fact.sourceDate && (!oldest.sourceDate || fact.sourceDate < oldest.sourceDate))) oldest = fact
  }
  const oldestCandidate = oldest?.runRoot ? candidateByRoot.get(oldest.runRoot) : undefined
  const oldestVintage = oldestCandidate ? candidateVintage(module, oldestCandidate, reusableOutput) : undefined
  return {
    facts,
    runRoots,
    sourceRunRoot: oldestVintage?.sourceRunRoot,
    sourceDate: oldestVintage?.sourceDate,
  }
}

function newestFreshPartialCandidate(
  module: ModuleNode,
  candidates: RunFolderCandidate[],
  newestDate: string | null,
  reusableOutput?: ReusableOutputProof,
): RunFolderCandidate | undefined {
  return candidates.find((candidate) => {
    const dir = path.join(REPO_ROOT, candidate.runRoot, module.name)
    const vintage = candidateVintage(module, candidate, reusableOutput)
    return !stalenessOf(vintage.sourceDate, newestDate)
      && validAgentOutputs(dir, specialistOutputFiles(module), reusableOutput).length > 0
  })
}

/**
 * @param reuseOverride the caller's chosen reuse set. Omit for the safe default (reuse everything `done`,
 *   re-run everything `stale`). Any module not in `reusable` is ignored — a caller can never reuse work
 *   that does not exist, and the server's own disk read always has the last word.
 */
export function thesisPlan(
  subject: string,
  swarmId: string = RESEARCH_SWARM_ID,
  reuseOverride?: string[],
  exactModule?: string,
  selection: RunProviderSelection = { provider: 'claude' },
  scope?: ThesisPlanScope,
  receiptHashes?: ContinuationReceiptHashes,
): ThesisPlan {
  const swarm = swarmById(swarmId)
  const graph = buildSwarmGraph(swarmId)
  const isResearch = swarmId === RESEARCH_SWARM_ID
  const exactTarget = exactModule ? graph.modules.find((module) => module.name === exactModule) : undefined
  if (exactModule && (!isResearch || exactTarget?.exactResume !== true)) {
    throw new Error(`module ${exactModule} does not support an exact saved-input plan`)
  }

  // Every path below is built from `safe`, never from the raw `subject` string that arrived on a query
  // string. `safeSubjectSegment` proves it is one path segment with no separator and no traversal, so no
  // amount of `..`/`/` in the request can steer a readdir, a stat, or a write out of its intended tree.
  const safe = safeSubjectSegment(subject)

  let continuationRunRoot: string | undefined
  let freshRunRoot: string | undefined
  let reusableOutput: ReusableOutputProof | undefined
  if (scope) {
    if (!isResearch) throw new Error('exact saved-run continuation is supported only for research runs')
    if ('freshRunRoot' in scope) {
      const fresh = scope.freshRunRoot
      if (typeof fresh !== 'string') throw new Error('fresh run root is missing')
      const match = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/.exec(fresh)
      if (!match || match[1] !== safe) throw new Error('fresh run root does not match this ticker')
      const parsedDate = new Date(`${match[2]}T00:00:00.000Z`)
      if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== match[2]) {
        throw new Error('fresh run root has an invalid date')
      }
      const absolute = path.join(REPO_ROOT, fresh)
      if (fs.existsSync(absolute)) assertRealRunRootInsideAnalyses(fresh)
      freshRunRoot = fresh
    } else {
    const match = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/.exec(scope.continuationRunRoot)
    if (!match || match[1] !== safe) throw new Error('saved run root does not match this ticker')
    const parsedDate = new Date(`${match[2]}T00:00:00.000Z`)
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== match[2]) {
      throw new Error('saved run root has an invalid date')
    }
    if (!realDirectoryInsideAnalyses(path.join(REPO_ROOT, scope.continuationRunRoot))) {
      throw new Error('saved run root is missing or unsafe')
    }
    if (!scope.frozenGeneration) {
      throw continuationPlanningError(
        'legacy_generation_unbound',
        'This old run predates safe data snapshots. Start a new Full run; nothing was started.',
      )
    }
    continuationRunRoot = scope.continuationRunRoot
    const exactRunAbs = path.join(REPO_ROOT, continuationRunRoot)
    const protectedArtifacts = new Map(scope.frozenGeneration.reusableArtifacts
      .map((artifact) => [artifact.output_rel, artifact]))
    reusableOutput = (absolutePath) => {
      const rel = path.relative(exactRunAbs, absolutePath).split(path.sep).join('/')
      if (!rel || rel.startsWith('../') || path.posix.isAbsolute(rel)) return false
      const protectedArtifact = protectedArtifacts.get(rel)
      if (!protectedArtifact
          || protectedArtifact.generation_digest !== scope.frozenGeneration!.generationDigest) return false
      try {
        const info = fs.lstatSync(absolutePath)
        if (!info.isFile() || info.isSymbolicLink()) return false
        return `sha256:${createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex')}`
          === protectedArtifact.sha256
      } catch { return false }
    }
    }
  }

  // Where a completion writes. Research: today's dated folder — the one BOTH full-run paths seed their
  // skip-set from. Any other swarm: its single stable per-subject folder.
  const targetRunRoot = isResearch
    ? continuationRunRoot ?? freshRunRoot ?? `analyses/${safe}_${todayDate()}`
    : (swarm && runRootForSubject(swarm, safe)) || `analyses/${safe}`

  // A hard process stop can land between the two synchronous renames used by partial staging. Restore the
  // old target (or clear an obsolete backup after the new target landed) BEFORE candidate discovery, so a
  // retry never loses target-only paid orbs merely because the canonical module name was briefly absent.
  if (isResearch) {
    for (const module of graph.modules) recoverInterruptedResumeSwap(targetRunRoot, module.name)
  }

  const targetAbs = path.join(REPO_ROOT, targetRunRoot)
  // Exact Continue is pinned to the retained immutable generation. It never stats or hashes today's Drive
  // folder: newer uploads belong to a separately confirmed Full run, not to work already in flight.
  const pool = scope?.frozenGeneration
    ? { files: scope.frozenGeneration.fileCount, newestDate: null, newestMs: scope.frozenGeneration.newestMs }
    : dataPoolNewest(safe)
  const dated = isResearch
    ? (continuationRunRoot
        ? datedRunFoldersFor(safe).filter((candidate) => candidate.runRoot === continuationRunRoot)
        : datedRunFoldersFor(safe))
    : []

  const modules: ModulePlanEntry[] = []
  const synthesisMeta = new Map<string, { runRoot: string; sourceDate?: string; mtimeMs: number }>()
  const savedInputCandidates = new Map<string, SavedInputCandidate>()
  for (const m of graph.modules) {
    const totalAgents = m.agentCount
    // Candidate folders holding this module, newest vintage first. For a non-dated swarm there is exactly
    // one root, so this collapses to "is it in the run folder".
    const candidates: RunFolderCandidate[] = isResearch
      ? foldersWithModule(dated, m.name)
      : (() => {
          const root = findRunRootForSubject(swarmId, safe)
          if (!root) return []
          const rel = path.relative(REPO_ROOT, root)
          return fs.existsSync(path.join(root, m.name)) ? [{ runRoot: rel, date: '' }] : []
        })()

    // Merge reusable current-roster specialists across every non-stale candidate, newest valid copy per orb.
    // This is deliberately done before dependency validation: a manually-run 07 in today's sparse folder
    // may depend on 00 in the older complete folder, and together they are a valid resume set.
    const freshMerged = mergedSpecialists(m, candidates, swarmId, pool.newestDate, reusableOutput)
    const structuralMerged = mergedSpecialists(m, candidates, swarmId, null, reusableOutput)
    const freshPartial = newestFreshPartialCandidate(m, candidates, pool.newestDate, reusableOutput)
    const anyPartial = candidates.find((candidate) => validAgentOutputs(
      path.join(REPO_ROOT, candidate.runRoot, m.name), specialistOutputFiles(m), reusableOutput,
    ).length > 0)
    const finishedIndex = candidates.findIndex((candidate) => hasSynthesis(
      m, path.join(REPO_ROOT, candidate.runRoot, m.name), reusableOutput,
    ))
    const finished = finishedIndex >= 0 ? candidates[finishedIndex] : undefined
    if (finished) {
      const finishedAbs = path.join(REPO_ROOT, finished.runRoot, m.name)
      const vintage = candidateVintage(m, finished, reusableOutput)
      const sourceRunRoot = vintage.sourceRunRoot
      const sourceDate = vintage.sourceDate
      const staleReason = stalenessOf(sourceDate, pool.newestDate)
      // Keep this separate from whole-module reuse. Roster growth or a newer partial attempt may correctly
      // make the module itself `partial`, while its older current-name 99 remains a valid, explicitly disclosed
      // input for ONE exact downstream module. The target route revalidates and fingerprints these bytes.
      savedInputCandidates.set(m.name, {
        sourceRunRoot,
        sourceDate,
        copyFromRunRoot: finished.runRoot,
        staleReason,
      })
      const refreshSynthesis = synthesisNeedsRefresh(
        m,
        finishedAbs,
        swarmId,
        staleReason ? structuralMerged.facts : freshMerged.facts,
        { runRoot: finished.runRoot, sourceDate },
        reusableOutput,
      )
      // A stale old synthesis must not suppress genuinely newer, non-stale partial progress. Ignore the stale
      // base and fall through to the merged partial branch; no byte from the stale folder will be staged.
      // Compare TRUE vintages, not physical folder order: a carried synthesis lives in today's folder (index
      // 0) while its CARRIED_FORWARD stamp can date it earlier than a genuinely fresher prior-folder partial.
      const freshVintage = freshPartial ? candidateVintage(m, freshPartial, reusableOutput) : undefined
      const newerFreshPartialSupersedes = Boolean(staleReason && freshVintage?.sourceDate
        && (!sourceDate || freshVintage.sourceDate > sourceDate))
      if (!newerFreshPartialSupersedes) {
        const reusableFacts = staleReason ? structuralMerged.facts : freshMerged.facts
        const reusableKeys = staleReason ? [] : orbKeys(m.name, reusableFacts.map((fact) => fact.file))
        const state: ModuleState = refreshSynthesis ? 'partial' : staleReason ? 'stale' : 'done'
        // A whole-module `done`/`stale` entry is in-target only when its synthesis is physically there. A
        // sparse target folder containing a duplicate/backdated specialist does not satisfy the launcher's
        // 99 skip predicate and must never suppress the carry of the actual finished module.
        const inTargetRoot = state === 'partial'
          ? finished.runRoot === targetRunRoot || freshMerged.runRoots.includes(targetRunRoot)
          : finished.runRoot === targetRunRoot
        modules.push({
          module: m.name,
          state,
          sourceRunRoot: refreshSynthesis ? (freshMerged.sourceRunRoot ?? sourceRunRoot) : sourceRunRoot,
          sourceDate: refreshSynthesis ? (freshMerged.sourceDate ?? sourceDate) : sourceDate,
          // Always the folder `foldersWithModule`/`hasSynthesis` just proved has the complete files RIGHT
          // NOW — never the stamp's historical origin, which may have been pruned since.
          copyFromRunRoot: finished.runRoot,
          inTargetRoot,
          doneAgents: reusableFacts.length,
          doneOrbKeys: reusableKeys,
          totalAgents,
          staleReason,
          // A reused module never runs, and a rebuilt one runs whole. Both are settled by the reuse set, not
          // by orbs on disk — filled in by the second pass below once `run`/`reuse` are known.
          blockedBy: [],
          runnable: false,
          willRunAgents: refreshSynthesis && !staleReason ? Math.max(1, totalAgents - reusableFacts.length) : totalAgents,
          synthesisNeedsRefresh: refreshSynthesis || undefined,
          resumeFromRunRoots: refreshSynthesis && !staleReason ? freshMerged.runRoots : undefined,
        })
        const synthesis = currentSynthesis(m, finishedAbs, reusableOutput)
        if (synthesis && state === 'done') synthesisMeta.set(m.name, {
          runRoot: finished.runRoot,
          sourceDate,
          mtimeMs: synthesis.mtimeMs,
        })
        continue
      }
    }

    // No usable current synthesis (including a legacy synthesis filename), but at least one non-stale current
    // specialist exists across the candidates. Stage their union; the base tree is preferably the newest
    // candidate with a synthesis so its derived artifacts can be invalidated in the private staging copy.
    if (freshMerged.facts.length > 0) {
      const legacyBase = candidates.find((candidate) => {
        const dir = path.join(REPO_ROOT, candidate.runRoot, m.name)
        const vintage = candidateVintage(m, candidate, reusableOutput)
        return !stalenessOf(vintage.sourceDate, pool.newestDate) && hasAnySynthesis(dir)
      })
      const base = legacyBase ?? freshPartial!
      const hadSynthesis = candidates.some((candidate) => hasAnySynthesis(path.join(REPO_ROOT, candidate.runRoot, m.name)))
      const doneKeys = orbKeys(m.name, freshMerged.facts.map((fact) => fact.file))
      modules.push({
        module: m.name,
        state: 'partial',
        sourceRunRoot: freshMerged.sourceRunRoot ?? base.runRoot,
        sourceDate: freshMerged.sourceDate ?? (base.date || undefined),
        copyFromRunRoot: base.runRoot,
        inTargetRoot: freshMerged.runRoots.includes(targetRunRoot),
        doneAgents: freshMerged.facts.length,
        doneOrbKeys: doneKeys,
        totalAgents,
        blockedBy: [],
        runnable: false,
        willRunAgents: Math.max(0, totalAgents - freshMerged.facts.length),
        synthesisNeedsRefresh: hadSynthesis || undefined,
        resumeFromRunRoots: freshMerged.runRoots,
      })
      continue
    }

    // Only stale partial work remains: show the provenance, but expose no reusable orb identities and run
    // clean. A legacy synthesis with no specialists is also staged as a zero-done partial so its old 99 is
    // removed before the ordinary module command sees it.
    const legacyOnly = candidates.find((candidate) => hasAnySynthesis(path.join(REPO_ROOT, candidate.runRoot, m.name)))
    const fallback = anyPartial ?? legacyOnly
    if (fallback) {
      const vintage = candidateVintage(m, fallback, reusableOutput)
      const staleReason = stalenessOf(vintage.sourceDate, pool.newestDate)
      const localDone = reusableSpecialistOutputs(
        m, path.join(REPO_ROOT, fallback.runRoot, m.name), swarmId, reusableOutput,
      )
      modules.push({
        module: m.name,
        state: 'partial',
        sourceRunRoot: vintage.sourceRunRoot,
        sourceDate: vintage.sourceDate,
        copyFromRunRoot: fallback.runRoot,
        inTargetRoot: fallback.runRoot === targetRunRoot,
        doneAgents: localDone.length,
        doneOrbKeys: staleReason ? [] : orbKeys(m.name, localDone),
        totalAgents,
        staleReason,
        blockedBy: [],
        runnable: false,
        willRunAgents: staleReason ? totalAgents : Math.max(0, totalAgents - localDone.length),
        synthesisNeedsRefresh: Boolean(legacyOnly) || undefined,
        resumeFromRunRoots: staleReason ? undefined : [fallback.runRoot],
      })
      continue
    }
    modules.push({ module: m.name, state: 'missing', inTargetRoot: false, doneAgents: 0, doneOrbKeys: [], totalAgents, blockedBy: [], runnable: false, willRunAgents: totalAgents })
  }

  // Persist module-only upstream rebuilds into future plans. The in-memory cascade below is sufficient only
  // before the upstream runs; once its new 99 lands, a fresh plan must still reject downstream syntheses that
  // read the older upstream. Different source dates are authoritative; same-day mtimes are compared only
  // inside today's physical run root, where write order is meaningful (git checkout mtimes elsewhere are not).
  const moduleByName = new Map(modules.map((entry) => [entry.module, entry]))
  for (const m of graph.modules) {
    const entry = moduleByName.get(m.name)
    const ownMeta = synthesisMeta.get(m.name)
    if (!entry || entry.state !== 'done' || !ownMeta) continue
    const newerUpstream = m.dependsOn.some((depName) => {
      const dep = moduleByName.get(depName)
      const depMeta = synthesisMeta.get(depName)
      if (!dep || dep.state !== 'done' || !depMeta) return false
      if (depMeta.sourceDate && ownMeta.sourceDate && depMeta.sourceDate !== ownMeta.sourceDate) {
        return depMeta.sourceDate > ownMeta.sourceDate
      }
      return depMeta.runRoot === targetRunRoot && ownMeta.runRoot === targetRunRoot && depMeta.mtimeMs > ownMeta.mtimeMs
    })
    if (!newerUpstream) continue
    entry.state = 'partial'
    entry.synthesisNeedsRefresh = true
    entry.willRunAgents = Math.max(1, entry.totalAgents - entry.doneAgents)
    entry.resumeFromRunRoots = entry.copyFromRunRoot ? [entry.copyFromRunRoot] : undefined
  }

  let mustReuse = modules
    // Ordinary completion cannot rebuild an in-target synthesis because both historical full launchers skip
    // it. Exact continuation prepares its bound folder before launch, so a stale synthesis is intentionally
    // removable there and must not be forced into reuse.
    .filter((entry) => entry.inTargetRoot && !entry.synthesisNeedsRefresh
      && (entry.state === 'done' || (!continuationRunRoot && entry.state === 'stale')))
    .map((entry) => entry.module)

  // A module can be reused iff a finished synthesis for it exists on disk — `done` or `stale`. Staleness
  // steers the DEFAULT (a stale module is re-run) without removing the user's ability to keep it knowingly.
  const byName = new Map(modules.map((m) => [m.module, m]))
  const reusable = modules.filter((m) => m.state === 'done' || m.state === 'stale').map((m) => m.module)
  const reusableSet = new Set(reusable)
  const exactDeclaredInputs = exactTarget
    ? [...new Set([...moduleAncestors(graph, exactTarget.name), ...(exactTarget.readsFrom ?? [])])]
    : []
  const exactSavedInputs = exactDeclaredInputs.filter((name) => {
    const candidate = savedInputCandidates.get(name)
    if (!candidate) return false
    // Never replace a newer/unfinished upstream already in today's root just to feed this scoped run. When
    // today's folder itself owns the valid synthesis it is already coherent; otherwise fail closed and leave
    // the paid partial untouched rather than overwriting it during carry-forward.
    const targetInputAbs = path.join(targetAbs, name)
    return candidate.copyFromRunRoot === targetRunRoot || !fs.existsSync(targetInputAbs)
  })
  const exactSavedSet = new Set(exactSavedInputs)
  const exactTargetEntry = exactTarget ? byName.get(exactTarget.name) : undefined
  const chosen = exactTarget
    ? [
        ...exactSavedInputs,
        ...(exactTargetEntry && !exactTargetEntry.synthesisNeedsRefresh
          && (exactTargetEntry.state === 'done' || exactTargetEntry.state === 'stale') ? [exactTarget.name] : []),
      ]
    : reuseOverride
      ? reuseOverride.filter((m) => reusableSet.has(m))
      : modules.filter((m) => m.state === 'done').map((m) => m.module)

  // A module the caller chooses to REBUILD invalidates every module downstream of it (directly or
  // transitively via depends_on): earnings depends on business-model, valuation/catalyst read prior
  // module syntheses, and so on. Reusing a downstream module's carried conclusions would synthesize a
  // thesis mixing fresh upstream evidence with an old downstream read of the PREVIOUS upstream output.
  // Expand each rebuild through its descendants before finalizing what actually runs — `mustReuse` below
  // still wins over this (a module already finished in today's root can never be forced to rebuild;
  // that is a pre-existing, separately-surfaced limitation, not one this expansion can lift).
  const rebuilding = modules
    .filter((m) => !exactSavedSet.has(m.module)
      && (continuationRunRoot
        ? !chosen.includes(m.module)
        : ((reusableSet.has(m.module) && !chosen.includes(m.module)) || m.synthesisNeedsRefresh)))
    .map((m) => m.module)
  const forcedDownstream = new Set<string>()
  for (const name of rebuilding) {
    for (const d of transitiveDownstreamModules(graph, name)) forcedDownstream.add(d)
  }
  const chosenAfterCascade = chosen.filter((m) => !forcedDownstream.has(m))

  // A downstream module's specialists read the previous upstream synthesis too. Removing only its 99 would
  // still presence-skip those old specialist bytes and rebuild a new 99 from evidence generated against the
  // wrong upstream generation. A cascade therefore invalidates the WHOLE descendant module: every specialist
  // becomes payable, and private/exact preparation removes the old tree before the provider starts.
  for (const name of forcedDownstream) {
    const entry = byName.get(name)
    if (!entry) continue
    entry.state = 'partial'
    entry.doneAgents = 0
    entry.doneOrbKeys = []
    entry.willRunAgents = entry.totalAgents
    entry.synthesisNeedsRefresh = true
    entry.resumeFromRunRoots = undefined
  }
  // Ordinary completion cannot safely remove a finished module already in today's target, but exact
  // Continue activates a privately reconstructed copy of its saved root. That transaction is precisely what
  // makes a forced in-root descendant removable instead of silently re-locking it through `mustReuse`.
  if (continuationRunRoot) mustReuse = mustReuse.filter((name) => !forcedDownstream.has(name))

  // `mustReuse` is not negotiable — the launcher skips those modules regardless. Fold them in so `run` is
  // exactly what will run, and the price on the button is exactly what the launcher will charge.
  const reuseSet = exactTarget
    ? new Set(chosenAfterCascade)
    : new Set([...chosenAfterCascade, ...mustReuse])
  const reuse = modules.filter((m) => reuseSet.has(m.module)).map((m) => m.module) // graph order, deduped
  const run = modules.filter((m) => !reuseSet.has(m.module)).map((m) => m.module)

  // Second pass, now that `run` is settled: which modules can be launched ON THEIR OWN from the panel.
  // A module is launchable iff it will run AND every module it depends on (directly or transitively) is
  // being REUSED, not itself waiting to run — because a research `module` launch reads its reused upstream
  // from the target run root, and an ancestor that has not run yet is not there. `blockedBy` names the
  // ancestors still in `run`; an empty list means the whole `depends_on` closure is reused and ready.
  const runSet = new Set(run)
  for (const m of modules) {
    m.blockedBy = [...moduleAncestors(graph, m.module)].filter((a) => runSet.has(a))
    m.runnable = runSet.has(m.module) && m.blockedBy.length === 0
  }

  // Only a research swarm can carry (dated folders). A reused module already in the target root needs no copy.
  const canCarry = isResearch
  const carry = canCarry
    ? reuse
        .map((name) => {
          const saved = exactSavedSet.has(name) ? savedInputCandidates.get(name) : undefined
          if (saved && saved.copyFromRunRoot !== targetRunRoot) return {
            module: name,
            from: saved.sourceRunRoot,
            date: saved.sourceDate ?? null,
            copyFrom: saved.copyFromRunRoot,
            ...(saved.staleReason ? { staleReason: saved.staleReason } : {}),
          }
          const m = byName.get(name)
          return m && !m.inTargetRoot && m.copyFromRunRoot ? {
            module: m.module,
            from: m.sourceRunRoot ?? m.copyFromRunRoot,
            date: m.sourceDate ?? null,
            copyFrom: m.copyFromRunRoot,
            ...(m.staleReason ? { staleReason: m.staleReason } : {}),
          } : null
        })
        .filter((entry): entry is Exclude<typeof entry, null> => entry !== null)
        // `from`/`date`: the TRUE origin — what the stamp should say this evidence's vintage really is.
        // `copyFrom`: the folder PROVEN (by `foldersWithModule`/`hasSynthesis` above) to physically hold
        // the files right now — which is what the copy step must actually read from. They can differ
        // when the newest candidate is itself an intermediate carried-forward copy whose true origin
        // folder has since been pruned; copying from the (possibly missing) origin would fail outright.
    : []

  let complete = false
  let finalReportPath: string | null = null
  if (fs.existsSync(targetAbs)) {
    try {
      // Research ends on final_thesis.md inside analyses/. A constellation swarm's run root lives OUTSIDE
      // analyses/ (e.g. commodity/runs/GOLD) and ends on its terminal module's synthesis — so it needs both
      // the runs-tree resolver and its terminal module name, or a finished dossier reads as "not complete".
      const man = isResearch
        ? runManifest(targetRunRoot, resolveInsideAnalyses)
        : runManifest(targetRunRoot, resolveInsideRuns, terminalModuleName(swarmId))
      const finalReport = man.finalReport
      const finalOutputRel = finalReport?.path?.startsWith(`${targetRunRoot}/`)
        ? finalReport.path.slice(targetRunRoot.length + 1)
        : null
      const finalVerified = !continuationRunRoot || (finalOutputRel
        && reusableOutput?.(path.join(REPO_ROOT, targetRunRoot, finalOutputRel)))
      complete = Boolean(finalReport && finalVerified)
      finalReportPath = complete ? (finalReport?.path ?? null) : null
    } catch {
      /* unreadable target root — treat as incomplete */
    }
  }

  const master: ThesisPlan['master'] = complete
    ? { state: 'done', blockedBy: [] }
    : run.length > 0
      ? { state: 'blocked', blockedBy: run }
      : { state: 'ready', blockedBy: [] }

  const reusableOrbKeys: string[] = []
  const payableOrbKeys: string[] = []
  for (const module of graph.modules) {
    const entry = byName.get(module.name)
    if (!entry) continue
    const all = Object.values(module.layers).flat().map((agent) => agent.key).sort()
    const reusableForModule = reuseSet.has(module.name) ? new Set(all) : new Set(entry.doneOrbKeys)
    for (const key of all) (reusableForModule.has(key) ? reusableOrbKeys : payableOrbKeys).push(key)
  }
  if (!complete) payableOrbKeys.push('master/synthesizer')
  const sourceRunRoots = continuationRunRoot
    ? [continuationRunRoot]
    : [...new Set(modules.flatMap((entry) => {
        if (reuseSet.has(entry.module)) {
          const root = entry.copyFromRunRoot ?? (entry.inTargetRoot ? targetRunRoot : null)
          return root ? [root] : []
        }
        // A partial module can reuse exact specialists from several physical dated roots. Those roots are
        // paid-scope inputs just like a whole reused module; omitting them made an old partial-only plan look
        // like a fresh Full and bypass the exact-root Continue boundary.
        if (entry.doneOrbKeys.length === 0) return []
        if (entry.resumeFromRunRoots?.length) return entry.resumeFromRunRoots
        const root = entry.copyFromRunRoot ?? (entry.inTargetRoot ? targetRunRoot : null)
        return root ? [root] : []
      }))]
      .sort()
  const reusableArtifactPaths = new Set<string>()
  if (continuationRunRoot && scope?.frozenGeneration) {
    for (const module of modules) {
      if (reuseSet.has(module.module)) {
        const node = graph.modules.find((candidate) => candidate.name === module.module)
        if (!node) throw new Error(`continuation module disappeared: ${module.module}`)
        for (const file of [...specialistOutputFiles(node), ...synthesisOutputFiles(node)]) {
          reusableArtifactPaths.add(`${module.module}/${file}`)
        }
      } else {
        for (const key of module.doneOrbKeys) reusableArtifactPaths.add(`${key}.md`)
      }
    }
    if (complete) reusableArtifactPaths.add('final_thesis.md')
  }
  const reusableArtifacts = (scope?.frozenGeneration?.reusableArtifacts ?? [])
    .filter((artifact) => reusableArtifactPaths.has(artifact.output_rel))
    .sort((left, right) => left.output_rel.localeCompare(right.output_rel))
  const reusableArtifactsSha256 = `sha256:${createHash('sha256')
    .update(canonicalJsonText(reusableArtifacts)).digest('hex')}`
  const receiptPayload: ContinuationPlanReceiptPayload = {
    version: 2,
    action: continuationRunRoot ? 'continue' : 'complete',
    swarm: swarmId,
    subject: safe,
    sourceRunRoots,
    targetRunRoot,
    provider: {
      id: selection.provider,
      model: selection.model ?? null,
      reasoningLevel: selection.reasoningLevel ?? null,
      profileKey: selection.expectedProfileKey ?? null,
    },
    reusableOrbKeys: [...new Set(reusableOrbKeys)].sort(),
    payableOrbKeys: [...new Set(payableOrbKeys)].sort(),
    dataPool: {
      files: pool.files,
      newestMs: pool.newestMs,
      sha256: scope?.frozenGeneration
        ? `sha256:${scope.frozenGeneration.generationDigest}`
        : receiptHashes?.dataPoolSha256 ?? continuationDataPoolSha256(safe),
    },
    evidenceGenerationDigest: scope?.frozenGeneration?.generationDigest ?? null,
    reusableArtifacts,
    reusableArtifactsSha256,
    verifiedLineageSha256: scope?.frozenGeneration?.verifiedLineageDigest
      ?? `sha256:${createHash('sha256').update(canonicalJsonText([])).digest('hex')}`,
    sourceArtifactsSha256: receiptHashes?.sourceArtifactsSha256
      ?? continuationSourceArtifactsSha256(targetRunRoot, carry),
  }
  const continuationReceipt: ContinuationPlanReceipt = {
    ...receiptPayload,
    fingerprint: continuationPlanReceiptFingerprint(receiptPayload),
  }

  return {
    moduleResumeVersion: 2,
    continuationReceipt,
    ...(exactTarget ? { exactModuleScope: { module: exactTarget.name, savedInputs: exactSavedInputs } } : {}),
    swarm: swarmId,
    subject: safe,
    targetRunRoot,
    complete,
    finalReportPath,
    modules,
    reusable,
    mustReuse,
    reuse,
    run,
    carry,
    master,
    dataPool: pool,
    // Scaled by THIS swarm's agent counts. NOTE the money itself is not swarm-specific: `estimate('full')`
    // returns a single band calibrated on one research run, with no swarm branch. So for a non-research swarm
    // these are research-derived numbers scaled by orb count — which is why the panel does not show a price
    // for a swarm it cannot launch (canCarry === false). Do not present them as that swarm's cost.
    preflight: chainedResumePreflight(safe, run, selection, swarmId),
    fullPreflight: estimate(
      'full', safe, selection.provider, undefined, undefined,
      isResearch ? undefined : swarmId, selection.model, selection.reasoningLevel, selection.expectedProfileKey,
    ),
    canCarry,
  }
}

/**
 * Request-safe plan builder. The existing synchronous planner remains available to deterministic local tools,
 * while HTTP/background callers hash large filing and artifact trees with promises so one plan cannot freeze
 * Fastify health checks, Activity streams, or unrelated users. Stable before/after metadata checks make a
 * concurrent byte change fail the receipt instead of producing a torn fingerprint.
 */
export async function thesisPlanForRequest(
  subject: string,
  swarmId: string = RESEARCH_SWARM_ID,
  reuseOverride?: string[],
  exactModule?: string,
  selection: RunProviderSelection = { provider: 'claude' },
  scope?: ThesisPlanScope,
): Promise<ThesisPlan> {
  const trustedScope = scope ? exactFrozenScope(subject, scope) : undefined
  const plan = thesisPlan(
    subject, swarmId, reuseOverride, exactModule, selection, trustedScope, DEFERRED_RECEIPT_HASHES,
  )
  const [dataPoolSha256, sourceArtifactsSha256] = await Promise.all([
    trustedScope?.frozenGeneration
      ? Promise.resolve(`sha256:${trustedScope.frozenGeneration.generationDigest}`)
      : continuationDataPoolSha256Async(plan.subject),
    continuationSourceArtifactsSha256Async(plan.targetRunRoot, plan.carry),
  ])
  const { fingerprint: _ignored, ...deferred } = plan.continuationReceipt
  const payload: ContinuationPlanReceiptPayload = {
    ...deferred,
    dataPool: { ...deferred.dataPool, sha256: dataPoolSha256 },
    sourceArtifactsSha256,
  }
  return {
    ...plan,
    continuationReceipt: {
      ...payload,
      fingerprint: continuationPlanReceiptFingerprint(payload),
    },
  }
}

/** Lightweight synchronous snapshot for the launcher's final no-await scope guard. Receipt bytes were already
 * checked asynchronously at admission; this guard compares only module/root/pool metadata after the last await. */
export function thesisPlanForScopeGuard(
  subject: string,
  swarmId: string = RESEARCH_SWARM_ID,
  reuseOverride?: string[],
  exactModule?: string,
  selection: RunProviderSelection = { provider: 'claude' },
  scope?: ThesisPlanScope,
): ThesisPlan {
  const trustedScope = scope ? exactFrozenScope(subject, scope) : undefined
  return thesisPlan(subject, swarmId, reuseOverride, exactModule, selection, trustedScope, DEFERRED_RECEIPT_HASHES)
}

// ---- carry-forward -------------------------------------------------------------------------------

export interface CarryResult {
  carried: { module: string; from: string }[]
  /** already present in the target root — nothing copied */
  skipped: string[]
}

const CARRY_MARKER = 'CARRIED_FORWARD.md'

/** Monotonic within the process — the temp staging dir must be unique per request, or two concurrent POSTs for
 *  the same subject delete each other's in-flight copy (the rate limit does not serialize them). */
let carrySeq = 0

/** Analysis outputs must be a closed tree of real directories and regular files. Dereferencing a descendant
 *  symlink can import arbitrary bytes from outside analyses into a checkpoint; preserving one can publish a
 *  path whose meaning changes later. Validate before AND after copy so either form fails closed. */
function assertCopyableTree(abs: string): void {
  const stat = fs.lstatSync(abs)
  if (stat.isSymbolicLink()) throw new Error(`module tree contains a symlink: ${abs}`)
  if (stat.isFile()) return
  if (!stat.isDirectory()) throw new Error(`module tree contains a non-file entry: ${abs}`)
  for (const entry of fs.readdirSync(abs)) assertCopyableTree(path.join(abs, entry))
}

function copyDir(srcAbs: string, dstAbs: string): void {
  assertCopyableTree(srcAbs)
  fs.cpSync(srcAbs, dstAbs, { recursive: true, dereference: false, force: true, preserveTimestamps: true })
  assertCopyableTree(dstAbs)
}

function resumeSwapBackupAbs(runRoot: string, module: string): string {
  return path.join(ANALYSES_DIR, `.resume-backup-${path.basename(runRoot)}-${module}`)
}

/** Recover the two possible crash points in a directory swap. If the new target never landed, restore the
 * old folder before planning so target-only paid orbs remain visible. If the new target landed and only
 * backup cleanup was interrupted, keep the new target and remove the obsolete backup. */
function recoverInterruptedResumeSwap(runRoot: string, module: string): void {
  const backupAbs = resumeSwapBackupAbs(runRoot, module)
  if (!fs.existsSync(backupAbs)) return
  if (!realDirectoryInsideAnalyses(backupAbs)) throw new Error(`unsafe module resume backup: ${backupAbs}`)
  assertCopyableTree(backupAbs)
  const targetRootAbs = ensureRealTargetRunRoot(runRoot)
  const dstAbs = path.join(targetRootAbs, module)
  if (fs.existsSync(dstAbs)) {
    assertContainedModuleDir(runRoot, module)
    fs.rmSync(backupAbs, { recursive: true, force: true })
    return
  }
  fs.renameSync(backupAbs, dstAbs)
}

/** The provenance stamp. A carried module's numbers were read against an OLDER data pool, so the thesis
 *  must be able to say so (CLAUDE.md §5 — vintage travels with the number). Deliberately named so it
 *  matches none of the engine's output patterns (`NN_*.md`, `99_*-synthesis.md`, `*_memo.md`,
 *  `*_dossier.md`), so it is never mistaken for a specialist report — while still being swept into the
 *  module dossier's lossless `*.md` concatenation, which is exactly where an auditor should find it. */
function carryNote(module: string, fromRunRoot: string, fromDate: string | null, intoRunRoot: string, replacedPartial: boolean, staleReason?: string): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  // A machine-readable line first: `thesisPlan` reads it back to recover this module's TRUE vintage, so a
  // carried module never launders its age into today's folder name (§11).
  const provenance = fromDate ? `<!-- carried-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  const replaced = replacedPartial
    ? '\n- Replaced: an unfinished copy of this module left in this run folder by an interrupted run. That partial work was superseded by the complete module below; nothing finished was discarded.\n'
    : ''
  // A module can be carried while STALE only when the caller knowingly kept it (thesisPlan's reuseOverride).
  // The default claim below ("the data pool has gained no newer file") is true for the default reuse path —
  // it is FALSE for a knowing keep, and the master synthesizer is told to read this stamp as provenance
  // (§5/§11). Saying so honestly here, rather than reusing the "current" claim, is what stops a knowingly
  // stale module from being documented as if it were current.
  const currency = staleReason
    ? `it was **knowingly kept despite newer data**: ${staleReason}`
    : 'the data pool has gained no newer file since that run'
  const staleNotice = staleReason
    ? `\n> **Kept stale, on purpose.** This module was NOT re-run to read the newer data — the reuse selection explicitly kept it anyway. Its figures reflect the data pool as of its source run only.\n`
    : ''
  return `${provenance}# Carried forward — ${module}

> This module was **not re-run** for this run. Its outputs were copied verbatim from a previous run of the
> same subject, because a completed \`99_*-synthesis.md\` already existed and ${currency}.
${staleNotice}
- Source run: \`${fromRunRoot}\`${vintage}
- Copied into: \`${intoRunRoot}\`
- Re-run: **no** — every figure below carries the vintage of the source run, not of this run.${replaced}

**How to read this.** Every claim in this module was evidenced against the data pool as it stood on the
source run's date. Cite it with that vintage. If a filing has landed since, this module did not read it —
re-run the module rather than ageing its conclusions forward.
`
}

/** Copy the requested finished modules from their source run folders into the target run root, each with a
 *  provenance stamp. Idempotent and non-destructive: a module already present in the target root is left
 *  exactly as-is (never overwritten), and no prior-run folder is ever written to.
 *
 *  `modules` is the caller's REUSE set. Whatever is carried gets skipped by the subsequent full run;
 *  whatever is not carried gets run. That is the whole control surface — the carry set IS the reuse set. */
export function carryForwardModules(subject: string, modules: string[], swarmId: string = RESEARCH_SWARM_ID, precomputed?: ThesisPlan): CarryResult {
  // Reduce to a proven single path segment BEFORE any mkdir — the target root is built from it, so a
  // separator or a traversal component must never reach the filesystem. Throws on anything else.
  const safe = safeSubjectSegment(subject)

  // Act on the caller's plan when it has one. The route validates `reuse` against a plan it already read; if
  // we re-read disk here, a module finishing in that window makes us carry work the route never approved (or
  // skip work it did). One snapshot decides both — no time-of-check/time-of-use gap.
  //
  // `precomputed` must have been built with THIS `modules` set as its reuse override, so that a knowingly-kept
  // stale module is carriable. Anything not backed by a finished synthesis on disk was already dropped by
  // `thesisPlan` — a caller can never smuggle in a module that does not exist.
  const plan = precomputed ?? thesisPlan(safe, swarmId, modules)
  if (!plan.canCarry) return { carried: [], skipped: [...modules] }

  const carriable = new Map(plan.carry.map((c) => [c.module, c]))
  // Looked up per module below so the stamp can say WHY a stale module was carried anyway (a caller's
  // knowing keep), rather than reusing the "current" wording that only holds for the default reuse path.
  const planModuleByName = new Map(plan.modules.map((m) => [m.module, m]))
  const toCarry = modules.filter((m) => carriable.has(m))
  // Nothing to copy — never create today's run folder as a side effect of merely asking.
  if (toCarry.length === 0) return { carried: [], skipped: [...modules] }

  const targetAbs = ensureRealTargetRunRoot(plan.targetRunRoot)

  const carried: { module: string; from: string }[] = []
  const skipped: string[] = []

  for (const module of modules) {
    const c = carriable.get(module)
    if (!c) {
      // Either already finished in the target root (mustReuse), or not a reusable module at all — nothing to
      // copy either way. `thesisPlan` already excluded both from `carry`.
      skipped.push(module)
      continue
    }
    // Build paths from the PLAN's own strings, never the caller's. `c.module` came from the discovered
    // agent graph and `c.from` from a directory listing, so neither is attacker-controlled — the caller's
    // `module` string is only ever used to look up this entry.
    const name = c.module
    const dstAbs = path.join(targetAbs, name)

    // A FINISHED module in the target root is left exactly as-is (that's `mustReuse`, never in `carry`).
    // But a PARTIAL folder — the leftover of an interrupted run, which is the very case this feature exists
    // for — must NOT block the carry. Skipping it here silently broke the plan's central promise: the panel
    // priced the module as reused and painted its orbs green, while the launcher's skip-test (a non-empty
    // 99 synthesis in the run root) failed and re-ran it at full cost.
    const replacedPartial = fs.existsSync(dstAbs)
    if (replacedPartial) {
      assertContainedTargetModuleOrMissing(plan.targetRunRoot, name)
      // An exact module plan selected this saved input only because no module folder existed in today's
      // target root. Re-check that fact at the mutation boundary: an external/manual writer is not covered
      // by the in-process subject lock, and its newly paid partial must never be deleted by an older carry.
      // A fresh plan can either use a valid target-root 99 or keep the exact target blocked; this stale plan
      // is no longer authorized to replace anything.
      if (plan.exactModuleScope?.savedInputs?.includes(name)) {
        throw new Error(`saved exact input changed in the target run root: ${name}`)
      }
    }

    // Read bytes from `c.copyFrom` — the folder PROVEN to physically hold them right now — never from
    // `c.from`, which is the TRUE-origin provenance for the stamp and may point at a folder that has
    // since been pruned (the module then reads as "reusable" in the plan but a copy from `c.from` would
    // ENOENT here).
    const srcAbs = assertContainedModuleDir(c.copyFrom, name)
    // Stage OUTSIDE the run root, then rename in. Two reasons a `.carry-*` dir must never sit inside the run
    // root: `runManifest` enumerates every subdirectory as a module (a crash mid-copy would mint a phantom
    // module orb, and `/research:full` would dispatch a paid memo-writer against it), and `commit-run.sh`
    // stages the run root wholesale. The unique suffix keeps two concurrent requests off each other's tree.
    const tmpAbs = path.join(ANALYSES_DIR, `.carry-${safe}-${name}-${process.pid}-${carrySeq++}`)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(srcAbs, tmpAbs)
      const staleReason = c.staleReason ?? planModuleByName.get(name)?.staleReason
      fs.writeFileSync(path.join(tmpAbs, CARRY_MARKER), carryNote(name, c.from, c.date, plan.targetRunRoot, replacedPartial, staleReason), 'utf8')
      // Swap into place. The complete module supersedes any unfinished copy; the SOURCE folder is untouched,
      // so nothing finished is ever destroyed — only unfinished work in TODAY's root is replaced.
      if (replacedPartial) {
        assertContainedTargetModuleOrMissing(plan.targetRunRoot, name)
        fs.rmSync(dstAbs, { recursive: true, force: true })
      }
      fs.renameSync(tmpAbs, dstAbs)
    } finally {
      // A throw anywhere above (ENOSPC, EXDEV, a mid-copy kill) must not leave the staging tree behind.
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    carried.push({ module: name, from: c.from })
  }
  return { carried, skipped }
}

// ---- single-module resume ------------------------------------------------------------------------

export interface ModuleResumeResult {
  /** reused upstream modules physically copied into the target root so the command can read them */
  carriedAncestors: { module: string; from: string }[]
  /** every reused ancestor the target module will read from today's root, including an ancestor copied by
   *  an earlier failed attempt. The route checkpoints these exact folders before starting paid work, so a
   *  retry cannot leave previously-carried prerequisites dirty and unpublished. */
  reusedAncestorModules: string[]
  /** the run the resumed orbs came from (null when the module ran clean — missing, or a stale partial) */
  resumedFrom: string | null
  /** orbs the resume reuses, as node keys `<module>/<NN>_<slug>` — empty when the module runs clean */
  doneOrbKeys: string[]
  /** orbs that will actually execute (the module's synthesis always among them) */
  willRunAgents: number
  /** true when stale partial work is deliberately not reused, so the module runs from scratch */
  discardedStaleOrbs: boolean
}

export interface PreparedModuleResumeScope {
  /** SHA-256 over every byte/path in the staged target module and reused ancestor folders. */
  fingerprint: string
}

/**
 * Capture the exact target-root bytes a smart module resume will read.
 *
 * `thesisPlan()` deliberately searches older run folders so it can recover paid work. That is correct while
 * PLANNING, but unsafe at the final paid boundary: if a staged orb disappears, the planner can rediscover the
 * same orb in yesterday's folder while MODULE_PIPELINE Step 4A sees it missing in today's folder and launches
 * an extra task. This guard therefore reads ONLY `targetRunRoot`, proves its current-roster specialist set is
 * exactly the reviewed set, proves every reused ancestor's current synthesis is physically present there, and
 * fingerprints the complete staged directories. A later byte edit, added file, deletion, or symlink changes
 * the fingerprint (or makes the scope invalid) before `execa` can start.
 */
export function capturePreparedModuleResumeScope(
  subject: string,
  module: string,
  targetRunRoot: string,
  expectedDoneOrbKeys: string[],
  reusedAncestorModules: string[],
  swarmId: string = RESEARCH_SWARM_ID,
): PreparedModuleResumeScope | null {
  try {
    safeSubjectSegment(subject)
    const graph = buildSwarmGraph(swarmId)
    const moduleNode = graph.modules.find((candidate) => candidate.name === module)
    if (!moduleNode) return null

    const ancestorSet = moduleAncestors(graph, module)
    for (const optional of moduleNode.readsFrom ?? []) ancestorSet.add(optional)
    const ancestors = [...new Set(reusedAncestorModules)].sort()
    if (ancestors.length !== reusedAncestorModules.length
        || ancestors.some((name) => !ancestorSet.has(name))) return null

    const expectedFiles = specialistOutputFiles(moduleNode)
    const expectedDone = [...new Set(expectedDoneOrbKeys)].sort()
    if (expectedDone.length !== expectedDoneOrbKeys.length) return null
    for (const key of expectedDone) {
      const prefix = `${module}/`
      if (!key.startsWith(prefix) || !expectedFiles.has(`${key.slice(prefix.length)}.md`)) return null
    }

    const targetRootAbs = path.join(REPO_ROOT, targetRunRoot)
    const targetExists = fs.existsSync(targetRootAbs)
    if (targetExists) assertRealRunRootInsideAnalyses(targetRunRoot)

    const moduleAbs = path.join(targetRootAbs, module)
    if (!fs.existsSync(moduleAbs)) {
      if (expectedDone.length > 0) return null
    } else {
      const contained = assertContainedModuleDir(targetRunRoot, module)
      const actualDone = orbKeys(module, reusableSpecialistOutputs(moduleNode, contained, swarmId))
      if (actualDone.length !== expectedDone.length
          || actualDone.some((key, index) => key !== expectedDone[index])) return null
      // A smart resume always refreshes the synthesis. If any 99 reappears, the command may skip or consume
      // work outside the reviewed specialist+fresh-summary scope, so fail closed regardless of its name.
      if (hasAnySynthesis(contained)) return null
    }

    for (const name of ancestors) {
      const ancestorNode = graph.modules.find((candidate) => candidate.name === name)
      if (!ancestorNode) return null
      const ancestorAbs = assertContainedModuleDir(targetRunRoot, name)
      if (!currentSynthesis(ancestorNode, ancestorAbs)) return null
    }

    const hash = createHash('sha256')
    const hashTree = (abs: string, rel: string): void => {
      const stat = fs.lstatSync(abs)
      if (stat.isSymbolicLink()) throw new Error('staged scope contains a symlink')
      if (stat.isDirectory()) {
        hash.update(`D\0${rel}\0`)
        for (const entry of fs.readdirSync(abs).sort()) hashTree(path.join(abs, entry), `${rel}/${entry}`)
        return
      }
      if (!stat.isFile()) throw new Error('staged scope contains a non-file entry')
      // Git preserves only whether owner-execute marks a regular file executable (100644 vs 100755). Host
      // umask/read-write/group/other bits must not make an otherwise identical checkpoint drift.
      const gitMode = stat.mode & 0o100 ? '100755' : '100644'
      hash.update(`F\0${rel}\0${gitMode}\0${stat.size}\0`)
      hash.update(fs.readFileSync(abs))
      hash.update('\0')
    }

    for (const name of [...ancestors, module].sort()) {
      const abs = path.join(targetRootAbs, name)
      if (!fs.existsSync(abs)) {
        hash.update(`M\0${name}\0`)
        continue
      }
      hashTree(assertContainedModuleDir(targetRunRoot, name), name)
    }
    return { fingerprint: `sha256:${hash.digest('hex')}` }
  } catch {
    return null
  }
}

/** The provenance stamp for a RESUMED module — the twin of `carryNote`, written under `RESUME_MARKER`.
 *  Says plainly that only SOME orbs were carried and the rest ran here, and records the true origin of the
 *  carried orbs so their vintage travels with them (§5/§11). Contains no `Agent:` line (eval check H). */
function resumeNote(
  module: string,
  fromRunRoot: string,
  fromDate: string | null,
  intoRunRoot: string,
  reusedOrbs: number,
  ranOrbs: number,
  sourceRunRoots: string[] = [fromRunRoot],
): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  const provenance = fromDate ? `<!-- resumed-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  const sources = [...new Set(sourceRunRoots)].map((root) => `\`${root}\``).join(', ')
  return `${provenance}# Resumed — ${module}

> This module was **resumed**, not run from scratch. ${reusedOrbs} finished specialist orb${reusedOrbs === 1 ? '' : 's'}
> ${reusedOrbs === 1 ? 'is' : 'are'} being reused verbatim from earlier work on this same module; the remaining
> ${ranOrbs} orb${ranOrbs === 1 ? '' : 's'} (including this module's synthesis) ${ranOrbs === 1 ? 'is' : 'are'} scoped to run for this run.
>
> **This note is written at staging time.** The module's new \`99_*-synthesis.md\` is the ground truth for
> whether the remaining work actually finished.

- Resumed from: \`${fromRunRoot}\`${vintage}
- Specialist source folder${sourceRunRoots.length === 1 ? '' : 's'}: ${sources}
- Copied into: \`${intoRunRoot}\`
- For staleness, this partial is conservatively dated to its oldest source; copying never makes older
  evidence look current.

**How to read this.** The orbs carried in were evidenced against the data pool as it stood on the source
run's date. If a filing has landed since, this module should be run clean, not resumed — the cockpit does
exactly that, so a resumed module is only ever resumed when no newer data has landed since its orbs ran.
`
}

/** Plain sidecar filenames attached to fenced blocks in an old synthesis. Step 4.9C only overwrites exports
 *  the NEW synthesis successfully emits, so every old labelled export must be cleared before refresh or a
 *  missing/pending new block can leave stale machine-readable truth beside the new 99. */
function labelledSynthesisArtifacts(body: string): Set<string> {
  const out = new Set<string>()
  const plain = /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}\.(?:csv|json)$/i
  // Opening fences are enough. A crashed synthesis can leave its final block unclosed while Step 4.9C has
  // already materialised the sidecar; requiring the closing fence would preserve exactly that stale export.
  const fences = /```([^\n]*)/g
  let match: RegExpExecArray | null
  while ((match = fences.exec(body))) {
    const info = match[1].trim()
    for (const token of info.split(/\s+/)) if (plain.test(token)) out.add(token)
    const before = body.slice(Math.max(0, match.index - 300), match.index)
    for (const named of before.matchAll(/`([A-Za-z0-9][A-Za-z0-9._-]{0,199}\.(?:csv|json))`/gi)) {
      if (plain.test(named[1])) out.add(named[1])
    }
  }
  return out
}

const PROTECTED_MODULE_ARTIFACTS = new Set(['source_manifest.csv', 'decision_record.json'])

function protectedModuleArtifact(file: string): boolean {
  return PROTECTED_MODULE_ARTIFACTS.has(file.toLowerCase()) || /\.schema\.json$/i.test(file)
}

/** Machine-readable files the CURRENT synthesis prompt says it emits. Parsing the discovered prompt keeps
 *  cleanup zero-touch when a module adds or renames an export; it also catches a sidecar omitted by an old
 *  99 body (for example `valuation_summary.json`). Source manifests belong to triage, and the run-level
 *  decision record belongs to the master, so both are explicit non-synthesis survivors. */
function declaredSynthesisArtifacts(module: ModuleNode, swarmId: string): Set<string> {
  const out = new Set<string>()
  const promptDir = modulePromptDir(module, swarmId)
  if (!promptDir) return out
  const artifact = /(?<![A-Za-z0-9._-])([A-Za-z0-9][A-Za-z0-9._-]{0,199}\.(?:csv|json))(?![A-Za-z0-9._-])/gi
  for (const agent of Object.values(module.layers).flat().filter((node) => node.isSynthesis)) {
    let body = ''
    try { body = fs.readFileSync(path.join(promptDir, `${agent.key.split('/').at(-1)}.md`), 'utf8') } catch { continue }
    for (const match of body.matchAll(artifact)) {
      const file = match[1]
      if (!protectedModuleArtifact(file)) out.add(file)
    }
  }
  return out
}

/** Turn a historical "complete" module into a safe resume workspace when the discovered roster has grown.
 *  Keep only specialists that are valid against the CURRENT roster and its in-module dependencies; remove
 *  the old synthesis plus everything it derived. The caller applies this only to a private staging copy. */
function invalidateOutdatedSynthesis(
  module: ModuleNode,
  dirAbs: string,
  reusableSpecialists: Set<string>,
  swarmId: string,
  containmentRoot: string = ANALYSES_DIR,
): void {
  const analysesResolved = path.resolve(containmentRoot)
  const resolved = path.resolve(dirAbs)
  if (!resolved.startsWith(analysesResolved + path.sep)) throw new Error('module refresh staging escaped analyses')
  const dirStat = fs.lstatSync(resolved)
  if (!dirStat.isDirectory() || dirStat.isSymbolicLink()) throw new Error('module refresh staging is not a real directory')
  const analyses = fs.realpathSync(analysesResolved)
  const real = fs.realpathSync(resolved)
  if (!real.startsWith(analyses + path.sep)) throw new Error('module refresh staging resolves outside analyses')

  let files: string[]
  try { files = fs.readdirSync(resolved) } catch { return }
  const synthesisFiles = files.filter((file) => /^99_.*\.md$/.test(file))
  const derived = declaredSynthesisArtifacts(module, swarmId)
  for (const file of synthesisFiles) {
    try {
      const st = fs.lstatSync(path.join(resolved, file))
      if (st.isFile() && !st.isSymbolicLink()) {
        for (const artifact of labelledSynthesisArtifacts(fs.readFileSync(path.join(resolved, file), 'utf8'))) {
          if (!protectedModuleArtifact(artifact)) derived.add(artifact)
        }
      }
    } catch { /* unreadable old synthesis — exact final artifacts below are still cleared */ }
  }

  for (const file of files) {
    const numberedSpecialist = /^[0-9]{2}_.*\.md$/.test(file) && !/^99_/.test(file)
    const specialistMustRun = numberedSpecialist && !reusableSpecialists.has(file)
    const finalArtifact = /^99_.*\.md$/.test(file)
      || file === `${module.name}_memo.md` || file === `${module.name}_dossier.md` || derived.has(file)
    if (!specialistMustRun && !finalArtifact) continue
    const target = path.join(resolved, file)
    try {
      const st = fs.lstatSync(target)
      if (st.isFile() && !st.isSymbolicLink()) fs.unlinkSync(target)
    } catch { /* absent/raced — the subsequent synthesis remains authoritative */ }
  }
  // One provenance story per folder: this is a partial resume now, not a whole-module carry.
  fs.rmSync(path.join(resolved, CARRY_MARKER), { force: true })
}

/**
 * Stage the target run root so ONE module can be launched on its own and resume from the orbs already on
 * disk. Does everything the launch needs EXCEPT calling `launch()` — so it is unit-testable without the CLI,
 * exactly like `carryForwardModules` (its finished-module twin). Three moves:
 *
 *   1. Carry every REUSED ancestor of `module` into the target root. A research `module` command reads its
 *      upstream from `<RUN_ROOT>/<dep>/` with no cross-folder fallback for some deps (valuation ← governance),
 *      so an ancestor reused from an older folder must be physically present, or the module runs degraded.
 *      Only ancestors are carried — never the whole reuse set — so launching valuation does not lock an
 *      unrelated reused module (balance-sheet-survival) into today's root (a `mustReuse` the user can't undo).
 *   2. If `module` is a resumable partial living in an OLDER folder, copy its finished orbs into the target
 *      root under a `RESUMED_FROM.md` stamp, so Step 4A skips them and only the remainder runs.
 *   3. If `module` is a STALE partial, discard any of its orbs sitting in today's root so it runs CLEAN —
 *      resuming stale orbs would synthesize a module from evidence read against two different data pools (§11).
 *
 * `plan` MUST have been built with the caller's reuse set as its override (the route does this), so the
 * ancestor set and the module's own state are read from one consistent snapshot. Caller must hold the
 * subject lock and have proven `module ∈ plan.run` with an empty `blockedBy` — this function trusts that.
 */
export function prepareModuleResume(subject: string, module: string, swarmId: string = RESEARCH_SWARM_ID, precomputed?: ThesisPlan): ModuleResumeResult {
  const safe = safeSubjectSegment(subject)
  const plan = precomputed ?? thesisPlan(safe, swarmId, undefined)
  const graph = buildSwarmGraph(swarmId)
  const entry = plan.modules.find((m) => m.module === module)
  if (!entry) throw new Error(`module ${module} is not in this swarm`)
  const moduleNode = graph.modules.find((m) => m.name === module)
  if (!moduleNode) throw new Error(`module ${module} is not in this swarm`)

  // (1) Carry the reused ancestors. `carryForwardModules` reads `plan.carry` (derived from `plan.reuse`), so
  // an ancestor already in the target root (`mustReuse`) or not reused is silently skipped — exactly right.
  const reuseSet = new Set(plan.reuse)
  const inputModules = moduleAncestors(graph, module)
  for (const optional of moduleNode.readsFrom ?? []) inputModules.add(optional)
  const ancestors = [...inputModules].filter((a) => reuseSet.has(a))
  const { carried: carriedAncestors } = ancestors.length ? carryForwardModules(safe, ancestors, swarmId, plan) : { carried: [] }
  const resumeBase = { carriedAncestors, reusedAncestorModules: ancestors.sort() }

  const targetAbs = path.join(REPO_ROOT, plan.targetRunRoot)
  const dstAbs = path.join(targetAbs, module)

  // (3) Any stale module → run clean. Drop target-root work and never carry older specialists into a run
  // whose data pool has moved on. This covers both an interrupted partial and an older finished synthesis.
  if ((entry.state === 'partial' || entry.state === 'stale') && entry.staleReason) {
    // Validate the dated root itself before even testing/removing its child. `existsSync(dstAbs)` follows a
    // symlink in the root component; without this guard a precomputed plan could erase an outside directory.
    if (fs.existsSync(targetAbs)) assertRealRunRootInsideAnalyses(plan.targetRunRoot)
    const discardedStaleOrbs = fs.existsSync(dstAbs)
    if (discardedStaleOrbs) {
      assertContainedTargetModuleOrMissing(plan.targetRunRoot, module)
      fs.rmSync(dstAbs, { recursive: true, force: true })
    }
    return { ...resumeBase, resumedFrom: null, doneOrbKeys: [], willRunAgents: entry.totalAgents, discardedStaleOrbs: true }
  }

  // (2) Resumable partial → atomically stage only the mutually-valid current-roster specialists, whether
  // its best copy is historical or already in today's root. The staging copy is also where an old 99 and
  // its labelled exports are removed; prior-run sources are never mutated, and target-root sanitizing never
  // deletes through a symlink or leaves a half-hole-punched folder behind.
  const stagePartial = (baseRunRoot: string, resumedFrom: string, sourceDate: string | null): ModuleResumeResult => {
    const expectedSpecialists = specialistOutputFiles(moduleNode)
    const doneOrbKeys = [...new Set(entry.doneOrbKeys)].sort()
    const reusableFiles = doneOrbKeys.map((key) => {
      const prefix = `${module}/`
      if (!key.startsWith(prefix)) throw new Error(`resume scope contains an orb outside ${module}`)
      const file = `${key.slice(prefix.length)}.md`
      if (!expectedSpecialists.has(file)) throw new Error(`resume scope contains an unknown orb: ${key}`)
      return file
    })
    if (new Set(reusableFiles).size !== reusableFiles.length) throw new Error('resume scope contains duplicate orb identities')
    const reusableSet = new Set(reusableFiles)
    const ranOrbs = Math.max(0, entry.totalAgents - doneOrbKeys.length)
    const baseAbs = assertContainedModuleDir(baseRunRoot, module)
    const overlayRoots = [...new Set(entry.resumeFromRunRoots?.length ? entry.resumeFromRunRoots : [baseRunRoot])]
    const overlayDirs = overlayRoots.map((runRoot) => ({ runRoot, abs: assertContainedModuleDir(runRoot, module) }))
    ensureRealTargetRunRoot(plan.targetRunRoot)
    // Stage OUTSIDE the run root, then rename in — same reasons as `carryForwardModules`: `runManifest`
    // reads every subdirectory as a module, and `commit-run.sh` stages the run root wholesale.
    const tmpAbs = path.join(ANALYSES_DIR, `.resume-${safe}-${module}-${process.pid}-${carrySeq++}`)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(baseAbs, tmpAbs)

      // Compose the exact union promised by the plan. For each orb, the first (newest) validated candidate
      // wins. `copyFileSync` does not preserve mtime, so restore it explicitly: dependency freshness compares
      // those mtimes, and staging time must never make an old prerequisite look newer than its dependent.
      for (const file of reusableFiles) {
        let copied = false
        for (const source of overlayDirs) {
          if (!validAgentOutputs(source.abs, new Set([file])).includes(file)) continue
          const from = path.join(source.abs, file)
          const st = fs.lstatSync(from)
          const to = path.join(tmpAbs, file)
          fs.copyFileSync(from, to)
          fs.chmodSync(to, st.mode)
          fs.utimesSync(to, st.atime, st.mtime)
          copied = true
          break
        }
        if (!copied) throw new Error(`resume scope changed on disk; planned orb is no longer reusable: ${module}/${file.replace(/\.md$/, '')}`)
      }

      invalidateOutdatedSynthesis(moduleNode, tmpAbs, reusableSet, swarmId)
      const stagedOrbKeys = orbKeys(module, reusableSpecialistOutputs(moduleNode, tmpAbs, swarmId))
      if (stagedOrbKeys.length !== doneOrbKeys.length || stagedOrbKeys.some((key, index) => key !== doneOrbKeys[index])) {
        throw new Error('resume scope changed on disk; staged reusable orbs no longer match the plan')
      }
      fs.writeFileSync(path.join(tmpAbs, RESUME_MARKER), resumeNote(
        module,
        resumedFrom,
        sourceDate,
        plan.targetRunRoot,
        doneOrbKeys.length,
        ranOrbs,
        overlayRoots,
      ), 'utf8')
      // A partial fragment could in principle sit in today's root already; the complete set of finished orbs
      // supersedes it. Swap through a recoverable backup instead of deleting the canonical target first: if
      // the process dies between renames, the next thesisPlan restores that backup before reading candidates.
      const backupAbs = resumeSwapBackupAbs(plan.targetRunRoot, module)
      if (fs.existsSync(backupAbs)) throw new Error('an interrupted module-resume swap needs recovery')
      let movedOldTarget = false
      if (fs.existsSync(dstAbs)) {
        assertContainedTargetModuleOrMissing(plan.targetRunRoot, module)
        fs.renameSync(dstAbs, backupAbs)
        movedOldTarget = true
      }
      try {
        fs.renameSync(tmpAbs, dstAbs)
      } catch (error) {
        if (movedOldTarget && fs.existsSync(backupAbs) && !fs.existsSync(dstAbs)) {
          fs.renameSync(backupAbs, dstAbs)
        }
        throw error
      }
      if (movedOldTarget) fs.rmSync(backupAbs, { recursive: true, force: true })
    } finally {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    return { ...resumeBase, resumedFrom, doneOrbKeys, willRunAgents: ranOrbs, discardedStaleOrbs: false }
  }

  // One branch for both historical and in-target partials: `copyFromRunRoot` is the base tree, while
  // `resumeFromRunRoots` supplies the exact merged specialist overlay. Copy-first/swap-last preserves every
  // completed orb if staging fails and makes retries idempotent after a mid-module interruption.
  if (entry.state === 'partial' && entry.copyFromRunRoot) {
    return stagePartial(entry.copyFromRunRoot, entry.sourceRunRoot ?? entry.copyFromRunRoot, entry.sourceDate ?? null)
  }

  // Missing module → runs whole. Nothing to carry for the module itself.
  return { ...resumeBase, resumedFrom: null, doneOrbKeys: [], willRunAgents: entry.totalAgents, discardedStaleOrbs: false }
}

export interface FullContinuationPreparation {
  /** Exact reusable specialist identities left in the saved root after sanitizing it. */
  doneOrbKeys: string[]
  /** Modules whose old bytes were stale and were removed before launch. */
  ranClean: string[]
}

export interface PrivateThesisPlanPreparation extends FullContinuationPreparation {
  stagingRootAbs: string
  targetRunRoot: string
  carried: { module: string; from: string }[]
}

/**
 * A saved run root is provider-writable. Exact continuation may retain only its immutable extraction cache
 * and module directories that are reconstructed below from protected output lineage. Every root-level memo,
 * metadata, audit, admission/projection file, marker, metric, and unknown directory is untrusted ambient
 * state: leaving even RUN_METADATA.md lets the master read stale instructions and presence-skip regeneration.
 *
 * This runs only in the private transaction copy. The canonical interrupted root (including its supervisor
 * marker) stays untouched until atomic activation, and is restored wholesale if no paid child starts.
 */
function sanitizePrivateContinuationRoot(stagingRootAbs: string, moduleNames: ReadonlySet<string>): void {
  for (const entry of fs.readdirSync(stagingRootAbs, { withFileTypes: true })) {
    if (entry.isDirectory() && (entry.name === '_pool_extracts' || moduleNames.has(entry.name))) continue
    const target = path.join(stagingRootAbs, entry.name)
    const info = fs.lstatSync(target)
    if (info.isSymbolicLink()) throw new Error(`private continuation root contains an unsafe link: ${entry.name}`)
    fs.rmSync(target, { recursive: info.isDirectory(), force: true })
  }
}

export interface RecoverableChainSanitizerInput {
  runRoot: string
  reviewedPlan: ThesisPlan
  doneOrbKeys: string[]
  completed: { module: string; artifacts: { outputRel: string; sha256: string }[] }[]
}

/**
 * A server crash can leave valid-looking markdown from an unsealed provider process in the canonical root.
 * The restarted command must not presence-skip that ambient work. Rebuild every module directory through
 * the existing crash-recoverable swap primitive from only (a) original prepared reusable orbs and (b)
 * synthesis hashes durably sealed in the chain intent. Everything else is payable again.
 */
export function sanitizeRecoverableChainRoot(input: RecoverableChainSanitizerInput): void {
  const runAbs = assertRealRunRootInsideAnalyses(input.runRoot)
  if (input.reviewedPlan.targetRunRoot !== input.runRoot || input.reviewedPlan.swarm !== RESEARCH_SWARM_ID) {
    throw new Error('recoverable chain sanitizer received the wrong reviewed root')
  }
  const graph = buildSwarmGraph(RESEARCH_SWARM_ID)
  const modules = new Set(graph.modules.map((module) => module.name))
  const reusable = new Map(input.reviewedPlan.continuationReceipt.reusableArtifacts
    .map((artifact) => [artifact.output_rel, artifact]))
  const allowed = new Map<string, string>()
  for (const key of input.doneOrbKeys) {
    const outputRel = `${key}.md`
    const artifact = reusable.get(outputRel)
    if (!artifact) throw new Error(`recoverable chain lost prepared lineage for ${outputRel}`)
    allowed.set(outputRel, artifact.sha256)
  }
  for (const entry of input.completed) {
    if (!modules.has(entry.module) || entry.artifacts.length === 0) {
      throw new Error(`recoverable chain has invalid completed module ${entry.module}`)
    }
    for (const artifact of entry.artifacts) {
      if (!artifact.outputRel.startsWith(`${entry.module}/`) || !/^sha256:[a-f0-9]{64}$/.test(artifact.sha256)) {
        throw new Error(`recoverable chain has an invalid completed artifact for ${entry.module}`)
      }
      allowed.set(artifact.outputRel, artifact.sha256)
    }
  }

  // Verify every protected source before mutating a single directory.
  for (const [outputRel, expected] of allowed) {
    const source = path.join(runAbs, outputRel)
    const info = fs.lstatSync(source)
    if (!info.isFile() || info.isSymbolicLink()) throw new Error(`recoverable chain artifact is unsafe: ${outputRel}`)
    const actual = `sha256:${createHash('sha256').update(fs.readFileSync(source)).digest('hex')}`
    if (actual !== expected) throw new Error(`recoverable chain artifact changed: ${outputRel}`)
  }

  for (const module of [...modules].sort()) {
    recoverInterruptedResumeSwap(input.runRoot, module)
    const tmpAbs = path.join(ANALYSES_DIR, `.chain-recovery-${path.basename(input.runRoot)}-${module}-${process.pid}-${carrySeq++}`)
    const dstAbs = path.join(runAbs, module)
    const backupAbs = resumeSwapBackupAbs(input.runRoot, module)
    fs.mkdirSync(tmpAbs, { mode: 0o700 })
    try {
      for (const [outputRel] of [...allowed].filter(([rel]) => rel.startsWith(`${module}/`))) {
        const file = outputRel.slice(module.length + 1)
        if (!file || file.includes('/') || file.includes('\\') || file === '.' || file === '..') {
          throw new Error(`recoverable chain artifact escaped its module: ${outputRel}`)
        }
        fs.copyFileSync(path.join(runAbs, outputRel), path.join(tmpAbs, file), fs.constants.COPYFILE_EXCL)
      }
      if (fs.existsSync(backupAbs)) throw new Error(`recoverable chain swap is already pending for ${module}`)
      let moved = false
      if (fs.existsSync(dstAbs)) {
        assertContainedTargetModuleOrMissing(input.runRoot, module)
        fs.renameSync(dstAbs, backupAbs)
        moved = true
      }
      try { fs.renameSync(tmpAbs, dstAbs) } catch (error) {
        if (moved && fs.existsSync(backupAbs) && !fs.existsSync(dstAbs)) fs.renameSync(backupAbs, dstAbs)
        throw error
      }
      if (moved) fs.rmSync(backupAbs, { recursive: true, force: true })
    } finally {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
  }

  // Root provider outputs are regenerated by the remaining chain/master. The frozen data capability and
  // transaction journal live outside this provider-writable directory.
  for (const entry of fs.readdirSync(runAbs, { withFileTypes: true })) {
    if (entry.name === '_pool_extracts' || modules.has(entry.name)) continue
    const target = path.join(runAbs, entry.name)
    const info = fs.lstatSync(target)
    if (info.isSymbolicLink()) throw new Error(`recoverable chain root contains an unsafe link: ${entry.name}`)
    fs.rmSync(target, { recursive: info.isDirectory(), force: true })
  }
}

/**
 * Build the exact post-admission run root outside Git. The canonical analyses tree is read-only here.
 * A caller may later activate this complete tree with the durable transaction in run-plan-transaction.ts.
 */
export function prepareThesisPlanPrivately(
  subject: string,
  plan: ThesisPlan,
  transactionDir: string,
  swarmId: string = RESEARCH_SWARM_ID,
): PrivateThesisPlanPreparation {
  const safe = safeSubjectSegment(subject)
  if (swarmId !== RESEARCH_SWARM_ID || plan.swarm !== RESEARCH_SWARM_ID || plan.subject !== safe) {
    throw new Error('private run-plan preparation does not match this research subject')
  }
  const exactRoot = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/.exec(plan.targetRunRoot)
  if (exactRoot?.[1] !== safe) throw new Error('private run-plan target is not the selected dated research root')

  const transactionInfo = fs.lstatSync(transactionDir)
  if (!transactionInfo.isDirectory() || transactionInfo.isSymbolicLink()) throw new Error('run-plan transaction directory is unsafe')
  const stagingRootAbs = path.join(transactionDir, 'prepared-root')
  if (fs.existsSync(stagingRootAbs)) throw new Error('run-plan staging root already exists')
  const targetAbs = path.join(REPO_ROOT, plan.targetRunRoot)
  if (fs.existsSync(targetAbs)) {
    assertRealRunRootInsideAnalyses(plan.targetRunRoot)
    copyDir(targetAbs, stagingRootAbs)
  } else {
    fs.mkdirSync(stagingRootAbs, { mode: 0o700 })
  }

  const graph = buildSwarmGraph(swarmId)
  const moduleByName = new Map(graph.modules.map((module) => [module.name, module]))
  const planByName = new Map(plan.modules.map((module) => [module.module, module]))
  const carried: { module: string; from: string }[] = []
  const doneOrbKeys: string[] = []
  const ranClean: string[] = []

  try {
    if (plan.continuationReceipt.action === 'continue') {
      sanitizePrivateContinuationRoot(stagingRootAbs, new Set(moduleByName.keys()))
    }
    for (const carry of plan.carry) {
      const module = moduleByName.get(carry.module)
      if (!module || !plan.reuse.includes(carry.module)) throw new Error(`private carry scope changed: ${carry.module}`)
      const sourceAbs = assertContainedModuleDir(carry.copyFrom, carry.module)
      const destinationAbs = path.join(stagingRootAbs, carry.module)
      if (fs.existsSync(destinationAbs)) {
        assertCopyableTree(destinationAbs)
        fs.rmSync(destinationAbs, { recursive: true, force: true })
      }
      copyDir(sourceAbs, destinationAbs)
      fs.writeFileSync(path.join(destinationAbs, CARRY_MARKER), carryNote(
        carry.module,
        carry.from,
        carry.date,
        plan.targetRunRoot,
        false,
        carry.staleReason ?? planByName.get(carry.module)?.staleReason,
      ), 'utf8')
      carried.push({ module: carry.module, from: carry.from })
    }

    if (plan.continuationReceipt.action === 'continue') {
      // A saved root can contain provider-authored bytes that are absent from, tampered against, or bound to
      // another frozen generation in the protected supervisor record. Presence must never make the command
      // skip payable work. Build each unfinished module from only the exact attested specialists and let the
      // transaction swap this private tree in atomically.
      const protectedArtifacts = new Map(plan.continuationReceipt.reusableArtifacts
        .map((artifact) => [artifact.output_rel, artifact]))

      // Wholly reused modules are just as security-sensitive as partial ones. The canonical saved root can
      // contain stale exports, obsolete-roster markdown, or unbound files beside the valid 99. Rebuild each
      // reused module from only the CURRENT roster outputs explicitly bound to this frozen generation; no
      // ambient byte is allowed to hitch a ride into the paid continuation or final synthesis.
      for (const name of plan.reuse) {
        const module = moduleByName.get(name)
        if (!module) throw new Error(`private reused module changed: ${name}`)
        const moduleAbs = path.join(stagingRootAbs, name)
        if (!fs.existsSync(moduleAbs)) throw new Error(`planned reused module disappeared: ${name}`)
        assertCopyableTree(moduleAbs)
        const rosterFiles = [...specialistOutputFiles(module), ...synthesisOutputFiles(module)].sort()
        // An exact standalone module consumes upstream syntheses, not a promise that every historical
        // specialist in those input folders matches today's expanded roster. Retain only current-roster
        // files that are individually bound to this frozen generation, and require the synthesis itself.
        // A whole-module Continue remains stricter: every roster output must be protected.
        const exactSavedInput = plan.exactModuleScope?.savedInputs.includes(name) === true
        const expectedFiles = exactSavedInput
          ? rosterFiles.filter((file) => {
              const artifact = protectedArtifacts.get(`${name}/${file}`)
              return artifact?.generation_digest === plan.continuationReceipt.evidenceGenerationDigest
            })
          : rosterFiles
        if (exactSavedInput && ![...synthesisOutputFiles(module)].some((file) => expectedFiles.includes(file))) {
          throw new Error(`protected exact-module input synthesis changed for ${name}`)
        }
        const cleanModuleAbs = path.join(stagingRootAbs, `.${name}.verified-${process.pid}-${carrySeq++}`)
        fs.mkdirSync(cleanModuleAbs, { mode: 0o700 })
        try {
          for (const file of expectedFiles) {
            const outputRel = `${name}/${file}`
            const protectedArtifact = protectedArtifacts.get(outputRel)
            if (!protectedArtifact || protectedArtifact.generation_digest
                !== plan.continuationReceipt.evidenceGenerationDigest) {
              throw new Error(`protected reused-module lineage changed for ${outputRel}`)
            }
            const source = path.join(moduleAbs, file)
            const info = fs.lstatSync(source)
            if (!info.isFile() || info.isSymbolicLink()) throw new Error(`reused module output is unsafe: ${outputRel}`)
            const sha256 = `sha256:${createHash('sha256').update(fs.readFileSync(source)).digest('hex')}`
            if (sha256 !== protectedArtifact.sha256) throw new Error(`reused module output changed: ${outputRel}`)
            fs.copyFileSync(source, path.join(cleanModuleAbs, file), fs.constants.COPYFILE_EXCL)
          }
          fs.rmSync(moduleAbs, { recursive: true, force: true })
          fs.renameSync(cleanModuleAbs, moduleAbs)
        } finally {
          if (fs.existsSync(cleanModuleAbs)) fs.rmSync(cleanModuleAbs, { recursive: true, force: true })
        }
      }

      for (const name of plan.run) {
        const entry = planByName.get(name)
        const module = moduleByName.get(name)
        if (!entry || !module) throw new Error(`private continuation module changed: ${name}`)
        const moduleAbs = path.join(stagingRootAbs, name)
        if (entry.staleReason) {
          if (fs.existsSync(moduleAbs)) {
            assertCopyableTree(moduleAbs)
            fs.rmSync(moduleAbs, { recursive: true, force: true })
            ranClean.push(name)
          }
          continue
        }
        const reusableFiles = new Set(entry.doneOrbKeys.map((key) => {
          const prefix = `${name}/`
          if (!key.startsWith(prefix)) throw new Error(`reusable orb escaped ${name}`)
          return `${key.slice(prefix.length)}.md`
        }))
        const cleanModuleAbs = path.join(stagingRootAbs, `.${name}.verified-${process.pid}-${carrySeq++}`)
        fs.mkdirSync(cleanModuleAbs, { mode: 0o700 })
        try {
          if (reusableFiles.size > 0 && !fs.existsSync(moduleAbs)) {
            throw new Error(`planned reusable orbs disappeared from ${name}`)
          }
          for (const file of [...reusableFiles].sort()) {
            const outputRel = `${name}/${file}`
            const protectedArtifact = protectedArtifacts.get(outputRel)
            const source = path.join(moduleAbs, file)
            if (!protectedArtifact || protectedArtifact.generation_digest
                !== plan.continuationReceipt.evidenceGenerationDigest) {
              throw new Error(`protected reusable-orb lineage changed for ${outputRel}`)
            }
            const info = fs.lstatSync(source)
            if (!info.isFile() || info.isSymbolicLink()) throw new Error(`reusable orb is unsafe: ${outputRel}`)
            const sha256 = `sha256:${createHash('sha256').update(fs.readFileSync(source)).digest('hex')}`
            if (sha256 !== protectedArtifact.sha256) throw new Error(`reusable orb changed: ${outputRel}`)
            fs.copyFileSync(source, path.join(cleanModuleAbs, file), fs.constants.COPYFILE_EXCL)
          }
          if (fs.existsSync(moduleAbs)) {
            assertCopyableTree(moduleAbs)
            fs.rmSync(moduleAbs, { recursive: true, force: true })
            if (reusableFiles.size === 0) ranClean.push(name)
          }
          if (reusableFiles.size > 0) fs.renameSync(cleanModuleAbs, moduleAbs)
        } finally {
          if (fs.existsSync(cleanModuleAbs)) fs.rmSync(cleanModuleAbs, { recursive: true, force: true })
        }
        if (entry.state !== 'partial' || reusableFiles.size === 0) continue
        invalidateOutdatedSynthesis(module, moduleAbs, reusableFiles, swarmId, stagingRootAbs)
        const stagedKeys = orbKeys(name, reusableSpecialistOutputs(module, moduleAbs, swarmId))
        const expectedKeys = [...entry.doneOrbKeys].sort()
        if (stagedKeys.length !== expectedKeys.length || stagedKeys.some((key, index) => key !== expectedKeys[index])) {
          throw new Error(`private reusable-orb scope changed for ${name}`)
        }
        fs.writeFileSync(path.join(moduleAbs, RESUME_MARKER), resumeNote(
          name,
          entry.sourceRunRoot ?? plan.targetRunRoot,
          entry.sourceDate ?? null,
          plan.targetRunRoot,
          expectedKeys.length,
          Math.max(0, entry.totalAgents - expectedKeys.length),
          entry.resumeFromRunRoots ?? [plan.targetRunRoot],
        ), 'utf8')
        doneOrbKeys.push(...expectedKeys)
      }
    }
    assertCopyableTree(stagingRootAbs)
    return {
      stagingRootAbs,
      targetRunRoot: plan.targetRunRoot,
      carried,
      doneOrbKeys: [...new Set(doneOrbKeys)].sort(),
      ranClean: [...new Set(ranClean)].sort(),
    }
  } catch (error) {
    fs.rmSync(stagingRootAbs, { recursive: true, force: true })
    throw error
  }
}

/**
 * Prepare one exact saved-root module Continue without mutating its canonical run. The parent plan may name
 * other unfinished modules because it is also used by the full-thesis panel; this scoped transaction keeps
 * only the reviewed saved inputs plus the selected module in its mutation set. Unrelated module folders are
 * left byte-for-byte intact, while the selected module and every input it may read are rebuilt solely from
 * same-generation protected lineage.
 */
export function prepareExactModuleContinuationPrivately(
  subject: string,
  module: string,
  plan: ThesisPlan,
  transactionDir: string,
): PrivateThesisPlanPreparation {
  if (plan.continuationReceipt.action !== 'continue'
      || plan.exactModuleScope?.module !== module
      || !plan.run.includes(module)) {
    throw new Error('private exact-module continuation does not match its reviewed plan')
  }
  const scope = new Set([...plan.exactModuleScope.savedInputs, module])
  const scopedModules = plan.modules.filter((entry) => scope.has(entry.module))
  if (!scopedModules.some((entry) => entry.module === module)
      || plan.exactModuleScope.savedInputs.some((name) => !scopedModules.some((entry) => entry.module === name))) {
    throw new Error('private exact-module continuation lost a reviewed input')
  }
  const scopedPlan: ThesisPlan = {
    ...plan,
    modules: scopedModules,
    reusable: plan.exactModuleScope.savedInputs,
    mustReuse: plan.exactModuleScope.savedInputs.filter((name) => plan.mustReuse.includes(name)),
    reuse: [...plan.exactModuleScope.savedInputs],
    run: [module],
    carry: plan.carry.filter((entry) => plan.exactModuleScope!.savedInputs.includes(entry.module)),
    master: { state: 'blocked', blockedBy: [module] },
  }
  return prepareThesisPlanPrivately(subject, scopedPlan, transactionDir)
}

/**
 * Prepare every unfinished module of an exact saved-root Continue action.
 *
 * This deliberately reuses the single-module staging primitive. It keeps mutually-valid specialists,
 * removes obsolete syntheses/derived files, and discards stale module trees. A missing module is untouched.
 * The caller must hold the subject lock and must pass a plan built with `continuationRunRoot`.
 */
export function prepareFullContinuation(
  subject: string,
  plan: ThesisPlan,
  swarmId: string = RESEARCH_SWARM_ID,
): FullContinuationPreparation {
  const safe = safeSubjectSegment(subject)
  if (swarmId !== RESEARCH_SWARM_ID || plan.swarm !== RESEARCH_SWARM_ID || plan.subject !== safe) {
    throw new Error('full continuation plan does not match this research subject')
  }
  const exactRoot = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/.exec(plan.targetRunRoot)
  if (exactRoot?.[1] !== safe || !realDirectoryInsideAnalyses(path.join(REPO_ROOT, plan.targetRunRoot))) {
    throw new Error('full continuation plan has no safe existing saved root')
  }

  const doneOrbKeys: string[] = []
  const ranClean: string[] = []
  for (const module of plan.run) {
    const prepared = prepareModuleResume(safe, module, swarmId, plan)
    doneOrbKeys.push(...prepared.doneOrbKeys)
    if (prepared.discardedStaleOrbs) ranClean.push(module)
  }
  return { doneOrbKeys: [...new Set(doneOrbKeys)].sort(), ranClean }
}

// ---- scoped batch rerun (executes an intake plan in ONE pass) --------------------------------------

export interface ScopedCarryResult {
  /** untouched modules carried whole (CARRIED_FORWARD provenance) */
  carried: { module: string; from: string }[]
  /** stale modules staged with HOLES so the full-run resume machinery re-runs exactly the gaps */
  scoped: { module: string; from: string | null; omittedOrbs: string[]; synthesisOnly: boolean; inPlace: boolean }[]
  /** modules the launched full run will (re)build — entry modules + their transitive downstream */
  staleModules: string[]
  /** entry orbs that failed roster validation and were dropped (fail-closed, INTAKE.md §4) */
  droppedEntries: { module: string; agent: string }[]
}

/** The provenance stamp for a SCOPED module — written under the same RESUMED_FROM.md filename the single-
 *  module resume uses, because structurally this IS a resume (finished orbs carried verbatim, the omitted
 *  ones re-run here) and the cockpit/roster already read that marker's provenance comment. No `Agent:`
 *  line (eval check H).
 *
 *  Deliberately PROSPECTIVE, not retrospective: this is written at STAGING time — before launch admission,
 *  the readiness gate, or a single agent has actually executed. Earlier wording asserted the omitted work
 *  "was re-run", which is false the instant admission fails or this module's agent aborts; the partial run
 *  would then keep an audit marker claiming evidence was refreshed that never was (Codex #358 r3673980767).
 *  So the prose only ever claims what is TRUE at write time — what was carried and what is scoped to run —
 *  and points the reader at the one thing that can't lie: whether `99_*-synthesis.md` actually exists. */
function scopedNote(module: string, fromRunRoot: string, fromDate: string | null, intoRunRoot: string, omittedOrbs: string[], synthesisOnly: boolean): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  const provenance = fromDate ? `<!-- resumed-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  const what = synthesisOnly
    ? 'only this module\'s synthesis (its upstream evidence changed — the specialists\' own inputs did not)'
    : `the orb${omittedOrbs.length === 1 ? '' : 's'} ${omittedOrbs.map((o) => `\`${o}\``).join(', ')} and this module's synthesis`
  return `${provenance}# Scoped re-run — ${module}

> New data invalidated part of this module, so it is **staged for a scoped rerun, not a rebuild from
> scratch**. The finished specialist orbs were carried verbatim from the run below; ${what}
> ${synthesisOnly ? 'is' : 'are'} scoped to re-run against the refreshed pool for THIS run.
>
> **This note is written at staging time, before the rerun executes.** It records what was carried and
> what is scoped to run — it is not a claim that the rerun has finished. If the launch never starts, or
> this module's agent aborts, the work above was never actually refreshed; this module's own
> \`99_*-synthesis.md\` (present or not) is the ground truth for whether it completed.

- Carried from: \`${fromRunRoot}\`${vintage}
- Copied into: \`${intoRunRoot}\`
- The carried orbs keep the vintage of the run that produced them, not this run's date.

**How to read this.** The intake plan that scoped these holes rides in THIS run root
(\`intake/*_intake_plan.json\`, copied verbatim from the run whose analysis produced it); it names the
documents that landed and the exact orbs they invalidate. This module is scoped to re-run exactly those
plus its synthesis, and every module downstream of it is scoped to re-run its synthesis. The rest of the
run is carried, priced and stamped.
`
}

/**
 * Stage the target run root so the EXISTING full-run machinery executes an intake plan's scoped rerun in
 * ONE pass — the batch twin of `prepareModuleResume`, built from the same three primitives:
 *
 *   - untouched modules → carried whole (`carryForwardModules`), so both full-run paths skip them;
 *   - an ENTRY module (an orb the new data invalidated) → carried with HOLES: the affected orb outputs and
 *     its `99_*` synthesis (+ memo/dossier, regenerated) are omitted, so MODULE_PIPELINE Step 4A re-runs
 *     exactly the missing orbs and then the synthesis;
 *   - a DOWNSTREAM module (transitively depends on an entry module) → carried with only its synthesis
 *     (+ memo/dossier) omitted: all orbs on disk → zero specialists dispatched, the `99` re-reads the
 *     refreshed upstream — precisely `/research:rerun`'s synthesis-only cascade, deduplicated across all
 *     entry orbs and finished by ONE master + finish-gate + commit.
 *
 * A stale module already FINISHED in the target root (`mustReuse` — both full-run paths skip on its `99`
 * presence, so no copy can force a re-run) is hole-punched IN PLACE: same deletion set, applied to today's
 * root directly. Prior-dated folders are never modified (synthesizer.md standing rule) — today's root is
 * the workspace.
 *
 * Validation is fail-closed like `readIntakePlan`: an entry orb naming an unknown module/agent is DROPPED
 * and reported, never guessed. Caller holds the subject lock and has proven the target root is not
 * complete; this function trusts that.
 */
export function carryForwardScoped(
  subject: string,
  entryOrbs: { module: string; agent: string }[],
  swarmId: string = RESEARCH_SWARM_ID,
  precomputed?: ThesisPlan,
  planFileAbs?: string | null,
): ScopedCarryResult {
  const safe = safeSubjectSegment(subject)
  const graph = buildSwarmGraph(swarmId)
  const byModule = new Map(graph.modules.map((m) => [m.name, m]))

  // resolve + validate the entry orbs against the discovered roster (fail-closed)
  const droppedEntries: { module: string; agent: string }[] = []
  const entryFilesByModule = new Map<string, Set<string>>() // module → orb output filenames to omit
  const synthesisEntry = new Set<string>() // modules whose ENTRY is the synthesis itself
  for (const e of entryOrbs || []) {
    const mod = byModule.get(e?.module)
    const agents = mod ? Object.values(mod.layers).flat() : []
    const hit = agents.find((a) => a.name === e?.agent || a.slug === e?.agent)
    if (!mod || !hit) { droppedEntries.push({ module: String(e?.module), agent: String(e?.agent) }); continue }
    if (hit.isSynthesis) { synthesisEntry.add(mod.name); continue } // synthesis-only entry: no specialist hole
    const set = entryFilesByModule.get(mod.name) ?? new Set<string>()
    set.add(`${hit.key.split('/')[1]}.md`)
    entryFilesByModule.set(mod.name, set)
  }
  const entryModules = new Set<string>([...entryFilesByModule.keys(), ...synthesisEntry])
  // Every entry invalid → nothing to scope. Return WITHOUT carrying anything: a bad plan must not create
  // today's run folder (or a full whole-run carry) as a side effect of merely asking (fail-closed).
  if (entryModules.size === 0) return { carried: [], scoped: [], staleModules: [], droppedEntries }

  // stale set = entry modules ∪ their transitive downstream (the deduplicated cascade)
  const stale = new Set<string>(entryModules)
  for (const m of entryModules) for (const d of transitiveDownstreamModules(graph, m)) stale.add(d)
  const staleModules = graph.modules.map((m) => m.name).filter((m) => stale.has(m)) // topo order

  // ONE plan snapshot decides everything (same discipline as carryForwardModules). Reuse override = every
  // reusable module: stale ones included, because we carry their FINISHED copy and then punch holes in it.
  const base = precomputed ?? thesisPlan(safe, swarmId, thesisPlan(safe, swarmId).reusable)
  const carriable = new Map(base.carry.map((c) => [c.module, c]))
  const mustReuse = new Set(base.mustReuse)
  const plannedByModule = new Map(base.modules.map((entry) => [entry.module, entry]))

  // 1) untouched modules → carried whole
  const keepWhole = base.reuse.filter((m) => !stale.has(m))
  const { carried } = keepWhole.length ? carryForwardModules(safe, keepWhole, swarmId, base) : { carried: [] as { module: string; from: string }[] }

  const targetAbs = path.join(REPO_ROOT, base.targetRunRoot)
  const scoped: ScopedCarryResult['scoped'] = []

  // the hole set for a stale module: entry orb files (if any) + its 99 synthesis + memo/dossier (both
  // regenerated — the dossier by the module pipeline's own Step 4.9B, the memo by the master step's batch)
  const holesFor = (module: string, dirAbs: string): string[] => {
    const files = fs.existsSync(dirAbs) ? fs.readdirSync(dirAbs) : []
    const orbHoles = entryFilesByModule.get(module) ?? new Set<string>()
    return files.filter((f) =>
      orbHoles.has(f) || /^99_.*\.md$/.test(f) || f === `${module}_memo.md` || f === `${module}_dossier.md`)
  }

  for (const module of staleModules) {
    const omittedOrbs = [...(entryFilesByModule.get(module) ?? [])].sort()
    const synthesisOnly = omittedOrbs.length === 0
    if (mustReuse.has(module)) {
      // finished in TODAY's root — both full-run paths skip on its 99 presence, so punch the holes in place
      const dstAbs = assertContainedModuleDir(base.targetRunRoot, module)
      for (const f of holesFor(module, dstAbs)) fs.rmSync(path.join(dstAbs, f), { force: true })
      // one provenance story per folder: a whole-carry marker from an EARLIER completion carry must not
      // survive the hole-punch — thesisPlan's carriedVintage would keep dating the refreshed module by its
      // old source run, and the dossier would claim it was both carried verbatim AND rerun scoped
      // (Codex #358 r3672206131)
      fs.rmSync(path.join(dstAbs, CARRY_MARKER), { force: true })
      fs.writeFileSync(path.join(dstAbs, RESUME_MARKER), scopedNote(module, base.targetRunRoot, null, base.targetRunRoot, omittedOrbs, synthesisOnly), 'utf8')
      scoped.push({ module, from: base.targetRunRoot, omittedOrbs, synthesisOnly, inPlace: true })
      continue
    }
    const planned = plannedByModule.get(module)
    const normalCarry = carriable.get(module)
    // A completed upstream module-only refresh persistently marks an older downstream 99 as `partial` so it
    // cannot be reused silently. That is correct for ordinary planning, but scoped intake staging still needs
    // the old folder as a synthesis-only BASE. It no longer appears in `base.carry`, so recover only this
    // narrow, non-stale structural-refresh source and sanitize it to the plan's exact reusable specialists.
    const refreshFallback = !normalCarry && planned?.synthesisNeedsRefresh && !planned.staleReason && planned.copyFromRunRoot
      ? {
          module,
          from: planned.sourceRunRoot ?? planned.copyFromRunRoot,
          date: planned.sourceDate ?? null,
          copyFrom: planned.copyFromRunRoot,
        }
      : undefined
    const c = normalCarry ?? refreshFallback
    if (!c) continue // never finished anywhere → the full run builds it whole; nothing to stage
    const srcAbs = assertContainedModuleDir(c.copyFrom, module)
    const dstAbs = path.join(targetAbs, module)
    ensureRealTargetRunRoot(base.targetRunRoot)
    // stage OUTSIDE the run root, then rename in — same reasons as carryForwardModules (phantom-module
    // manifest rows and wholesale commit staging)
    const tmpAbs = path.join(ANALYSES_DIR, `.scoped-${safe}-${module}-${process.pid}-${carrySeq++}`)
    const replacedPartial = fs.existsSync(dstAbs)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(srcAbs, tmpAbs)
      if (refreshFallback && planned) {
        const prefix = `${module}/`
        const reusable = new Set(planned.doneOrbKeys
          .filter((key) => key.startsWith(prefix))
          .map((key) => `${key.slice(prefix.length)}.md`))
        const moduleNode = byModule.get(module)
        if (!moduleNode) throw new Error(`module ${module} disappeared from the discovered graph`)
        invalidateOutdatedSynthesis(moduleNode, tmpAbs, reusable, swarmId)
      }
      for (const f of holesFor(module, tmpAbs)) fs.rmSync(path.join(tmpAbs, f), { force: true })
      // a whole-carry marker from the source copy must not survive into a scoped stage — one provenance
      // story per folder, and this one is "resumed with holes", not "carried verbatim"
      fs.rmSync(path.join(tmpAbs, CARRY_MARKER), { force: true })
      fs.writeFileSync(path.join(tmpAbs, RESUME_MARKER), scopedNote(module, c.from, c.date, base.targetRunRoot, omittedOrbs, synthesisOnly), 'utf8')
      if (replacedPartial) {
        assertContainedTargetModuleOrMissing(base.targetRunRoot, module)
        fs.rmSync(dstAbs, { recursive: true, force: true })
      }
      fs.renameSync(tmpAbs, dstAbs)
    } finally {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    scoped.push({ module, from: c.from, omittedOrbs, synthesisOnly, inPlace: false })
  }

  // Carry the plan itself into the target root: staging just made TODAY the ticker's latest dated root,
  // so without this a retry after a failed launch (or the audit trail after a finished one) would look for
  // the plan under the new root and find nothing — `readIntakePlan` searches only the latest root
  // (Codex #358 r3672400212). Almost-verbatim: the plan's own scanned_at/scan_date witnesses travel with it
  // unchanged, so the route's freshness gate keeps working against the copied file on a retry — but it is
  // stamped `staged_for_scoped_rerun: true` first, so `readIntakePlan` can tell "this copy exists because
  // its own commands were just staged against THIS root" apart from an original, not-yet-executed plan that
  // simply happens to sit in a finished run (the common, intended case: INTAKE.md's plan deliberately lives
  // under the older run it invalidates). Once this root's own final deliverables land, that stamp is what
  // lets the reader retire it — serving a plan whose work is already done would tell the cockpit
  // already-incorporated data still needs a rerun (Codex #358 r3673980745). Best-effort — a copy/stamp
  // failure must not undo an otherwise-correct staging.
  if (planFileAbs && (carried.length || scoped.length)) {
    const intakeDir = path.join(targetAbs, 'intake')
    const destAbs = path.join(intakeDir, path.basename(planFileAbs))
    try {
      fs.mkdirSync(intakeDir, { recursive: true })
      const planRaw = JSON.parse(fs.readFileSync(planFileAbs, 'utf8'))
      if (planRaw && typeof planRaw === 'object' && !Array.isArray(planRaw)) planRaw.staged_for_scoped_rerun = true
      fs.writeFileSync(destAbs, JSON.stringify(planRaw, null, 2), 'utf8')
    } catch {
      // fall back to a plain verbatim copy — provenance convenience must never fail the staging itself,
      // and an un-stamped copy is exactly today's (pre-fix) behaviour, never worse.
      try { fs.copyFileSync(planFileAbs, destAbs) } catch { /* still provenance-only */ }
    }
  }

  return { carried, scoped, staleModules, droppedEntries }
}
