import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { REPO_ROOT } from './config'
import {
  localCommitBytes,
  localSavedResearchCommits,
  publishedBytes,
  publishedGitCommit,
  publishedTreeAuthority,
  publishedTreePaths,
  publishResearchPaths,
} from './git-publication'
import { intakePlanSha256 } from './intake'
import { validateCompletedIdeaPublication } from './qualified-ideas-store'
import { SCOPED_STAGE_INTENT_FILE, SCOPED_STAGE_INTENT_VERSION } from './types'

export interface AutomaticCallPublicationRecovery {
  subject: string
  swarmId: string
  sourceRunRoot: string
  targetRunRoot: string
  planPath: string
  planSha256: string
  sourceDecisionFingerprint: string
}

export interface CompletedResearchPublication {
  subject: string
  targetRunRoot: string
}

interface RecoveryDeps {
  candidates: typeof localSavedResearchCommits
  commitBytes: typeof localCommitBytes
  publish: typeof publishResearchPaths
  sharedBytes?: typeof publishedBytes
  commitPaths?: (commit: string, prefix: string) => string[]
  sharedPaths?: (prefix: string) => string[]
  validateTerminal?: (runAbs: string, expectedRoot: string) => boolean
}

const SHA_RE = /^sha256:[a-f0-9]{64}$/
const READY_TO_PUBLISH = /^## Publication\s*\n\s*ready for one path-confined commit\s*$/m
const execFileAsync = promisify(execFile)

export type AutomaticCallRecoveryStage =
  | 'none' | 'unsafe' | 'unstamped_partial' | 'partial' | 'preseal_pair'
  | 'projection_sealed' | 'admission_sealed' | 'ready_worktree'

interface WorktreeInspectionDeps {
  repoRoot?: string
  sourceBytes?: (repoPath: string) => Buffer | null
  validateTerminal?: (runAbs: string, expectedRoot: string) => boolean
}

function publishedSourceBytes(repoRoot: string): (repoPath: string) => Buffer | null {
  let authority: ReturnType<typeof publishedTreeAuthority> | null = null
  return (repoPath: string) => {
    authority ??= publishedTreeAuthority('analyses', repoRoot)
    return authority.paths.has(repoPath) ? authority.readRequired(repoPath) : null
  }
}

function regularDirectFile(parent: string, name: string): Buffer | null {
  try {
    if (name !== path.basename(name)) return null
    const candidate = path.join(parent, name)
    const lst = fs.lstatSync(candidate)
    if (!lst.isFile() || lst.isSymbolicLink() || fs.realpathSync(path.dirname(candidate)) !== fs.realpathSync(parent)) return null
    return fs.readFileSync(candidate)
  } catch { return null }
}

/** Classify exact, already-paid progress in one target without treating the visible thesis/decision pair
 * as completion. The source plan is re-read from shared Git and the target copy must be its exact
 * server-stamped identity, so a stale/manual folder cannot enter automatic recovery. */
export function inspectAutomaticCallRecoveryWorktree(
  input: AutomaticCallPublicationRecovery,
  deps: WorktreeInspectionDeps = {},
): AutomaticCallRecoveryStage {
  const repoRoot = deps.repoRoot ?? REPO_ROOT
  const sourceBytes = deps.sourceBytes ?? publishedSourceBytes(repoRoot)
  const validate = deps.validateTerminal ?? ((runAbs: string, expectedRoot: string) =>
    validateCompletedIdeaPublication(runAbs, expectedRoot) !== null)
  try {
    if (!/^analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}$/.test(input.targetRunRoot)
        || !input.targetRunRoot.startsWith(`analyses/${input.subject}_`)
        || !SHA_RE.test(input.planSha256) || !SHA_RE.test(input.sourceDecisionFingerprint)) return 'unsafe'
    const realRepo = fs.realpathSync(repoRoot)
    const analyses = path.join(repoRoot, 'analyses')
    const analysesLst = fs.lstatSync(analyses)
    if (!analysesLst.isDirectory() || analysesLst.isSymbolicLink()) return 'unsafe'
    const realAnalyses = fs.realpathSync(analyses)
    const target = path.join(repoRoot, input.targetRunRoot)
    if (!fs.existsSync(target)) return 'none'
    const targetLst = fs.lstatSync(target)
    if (!targetLst.isDirectory() || targetLst.isSymbolicLink()) return 'unsafe'
    const realTarget = fs.realpathSync(target)
    if (path.dirname(realTarget) !== realAnalyses || !realTarget.startsWith(`${realRepo}${path.sep}`)) return 'unsafe'

    const planName = path.basename(input.planPath)
    if (!planName || !/_intake_plan(?:_v\d+)?\.json$/.test(planName)) return 'unsafe'
    const sourcePlanBytes = sourceBytes(input.planPath)
    if (!sourcePlanBytes) return 'unsafe'
    const source = JSON.parse(sourcePlanBytes.toString('utf8'))
    if (source?.staged_for_scoped_rerun === true || source.run_root !== input.sourceRunRoot
        || source.decision_fingerprint !== input.sourceDecisionFingerprint
        || intakePlanSha256(source) !== input.planSha256) return 'unsafe'

    // carryForwardScoped intentionally stamps the plan last, after every copied/hole-punched module is
    // ready. A kill in that window is recoverable and must converge by idempotently staging the same exact
    // shared plan again; it is not permission to launch the unstamped tree. Any terminal pair/seal or a
    // different plan in the target remains unsafe and can never be overwritten by this exception.
    const terminalOrSeal = ['final_thesis.md', 'decision_record.json', 'idea_projection_manifest.json', 'idea_admission.json']
      .some((name) => regularDirectFile(realTarget, name) !== null)
    const expectedIntent = {
      schema_version: SCOPED_STAGE_INTENT_VERSION,
      swarm: input.swarmId,
      subject: input.subject,
      source_run_root: input.sourceRunRoot,
      target_run_root: input.targetRunRoot,
      plan_path: input.planPath,
      plan_sha256: input.planSha256,
      source_decision_fingerprint: input.sourceDecisionFingerprint,
    }
    const intentBytes = regularDirectFile(realTarget, SCOPED_STAGE_INTENT_FILE)
    let intentMatches = false
    if (intentBytes) {
      try { intentMatches = JSON.stringify(JSON.parse(intentBytes.toString('utf8'))) === JSON.stringify(expectedIntent) }
      catch { return 'unsafe' }
      if (!intentMatches) return 'unsafe'
    }
    const intakeDir = path.join(realTarget, 'intake')
    if (!fs.existsSync(intakeDir)) {
      if (terminalOrSeal) return 'unsafe'
      if (intentMatches) return 'unstamped_partial'
      return fs.readdirSync(realTarget).length === 0 ? 'none' : 'unsafe'
    }
    const intakeLst = fs.lstatSync(intakeDir)
    const realIntake = fs.realpathSync(intakeDir)
    if (!intakeLst.isDirectory() || intakeLst.isSymbolicLink() || path.dirname(realIntake) !== realTarget) return 'unsafe'
    const stagedBytes = regularDirectFile(realIntake, planName)
    if (!stagedBytes) {
      const otherPlan = fs.readdirSync(realIntake).some((name) => /_intake_plan(?:_v\d+)?\.json$/.test(name))
      if (terminalOrSeal || otherPlan) return 'unsafe'
      if (intentMatches) return 'unstamped_partial'
      const rootEntries = fs.readdirSync(realTarget).filter((name) => name !== 'intake')
      return rootEntries.length === 0 && fs.readdirSync(realIntake).length === 0 ? 'none' : 'unsafe'
    }
    const staged = JSON.parse(stagedBytes.toString('utf8'))
    if (staged?.staged_for_scoped_rerun !== true || staged.run_root !== input.sourceRunRoot
        || staged.decision_fingerprint !== input.sourceDecisionFingerprint
        || source?.staged_for_scoped_rerun === true || source.run_root !== input.sourceRunRoot
        || source.decision_fingerprint !== input.sourceDecisionFingerprint
        || intakePlanSha256(staged) !== input.planSha256 || intakePlanSha256(source) !== input.planSha256) return 'unsafe'

    const thesis = regularDirectFile(realTarget, 'final_thesis.md')
    const decisionBytes = regularDirectFile(realTarget, 'decision_record.json')
    let pair = false
    if (thesis?.length && decisionBytes?.length) {
      const decision = JSON.parse(decisionBytes.toString('utf8'))
      pair = decision?.ticker === input.subject && decision?.run_root === input.targetRunRoot
        && decision?.decision_date === input.targetRunRoot.slice(-10)
    }
    const metadata = regularDirectFile(realTarget, 'RUN_METADATA.md')
    if (pair && metadata?.length && READY_TO_PUBLISH.test(metadata.toString('utf8'))
        && validate(realTarget, input.targetRunRoot)) return 'ready_worktree'
    if (regularDirectFile(realTarget, 'idea_admission.json')) return 'admission_sealed'
    if (regularDirectFile(realTarget, 'idea_projection_manifest.json')) return 'projection_sealed'
    if (pair) return 'preseal_pair'
    return fs.readdirSync(realTarget).length ? 'partial' : 'none'
  } catch (error: any) {
    if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
    return 'unsafe'
  }
}

/** Finish the last, crash-safe scoped-staging step. The runnable plan is renamed before its intent is
 * removed, so a kill between those two durable operations can leave both files behind. Only an exact
 * server-stamped plan + matching intent may clear the marker; every mismatch remains fail-closed. Callers
 * must hold the subject mutation lock. */
export function clearMatchingScopedStageIntent(
  input: AutomaticCallPublicationRecovery,
  deps: WorktreeInspectionDeps = {},
): boolean {
  const stage = inspectAutomaticCallRecoveryWorktree(input, deps)
  if (stage === 'unsafe' || stage === 'unstamped_partial') {
    throw new Error('scoped rerun stage intent is not paired with its exact runnable plan')
  }
  const repoRoot = deps.repoRoot ?? REPO_ROOT
  const target = path.join(repoRoot, input.targetRunRoot)
  const intent = path.join(target, SCOPED_STAGE_INTENT_FILE)
  if (!fs.existsSync(intent)) return false

  const realRepo = fs.realpathSync(repoRoot)
  const realAnalyses = fs.realpathSync(path.join(repoRoot, 'analyses'))
  const targetLst = fs.lstatSync(target)
  const realTarget = fs.realpathSync(target)
  const intentLst = fs.lstatSync(intent)
  if (!targetLst.isDirectory() || targetLst.isSymbolicLink() || path.dirname(realTarget) !== realAnalyses
      || !realTarget.startsWith(`${realRepo}${path.sep}`) || !intentLst.isFile() || intentLst.isSymbolicLink()
      || fs.realpathSync(path.dirname(intent)) !== realTarget) {
    throw new Error('scoped rerun stage intent path is unsafe')
  }
  const expected = {
    schema_version: SCOPED_STAGE_INTENT_VERSION,
    swarm: input.swarmId,
    subject: input.subject,
    source_run_root: input.sourceRunRoot,
    target_run_root: input.targetRunRoot,
    plan_path: input.planPath,
    plan_sha256: input.planSha256,
    source_decision_fingerprint: input.sourceDecisionFingerprint,
  }
  let actual: unknown
  try { actual = JSON.parse(fs.readFileSync(intent, 'utf8')) }
  catch { throw new Error('scoped rerun stage intent cannot be read safely') }
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('scoped rerun stage intent does not match its exact runnable plan')
  }

  const planName = path.basename(input.planPath)
  const intake = path.join(realTarget, 'intake')
  const intakeLst = fs.lstatSync(intake)
  const realIntake = fs.realpathSync(intake)
  const stagedBytes = regularDirectFile(realIntake, planName)
  const sourceBytes = (deps.sourceBytes ?? publishedSourceBytes(repoRoot))(input.planPath)
  if (!intakeLst.isDirectory() || intakeLst.isSymbolicLink() || path.dirname(realIntake) !== realTarget
      || !stagedBytes || !sourceBytes) {
    throw new Error('scoped rerun runnable plan is unavailable during intent cleanup')
  }
  let staged: any
  let source: any
  try {
    staged = JSON.parse(stagedBytes.toString('utf8'))
    source = JSON.parse(sourceBytes.toString('utf8'))
  } catch { throw new Error('scoped rerun runnable plan cannot be read safely') }
  if (staged?.staged_for_scoped_rerun !== true || source?.staged_for_scoped_rerun === true
      || staged.run_root !== input.sourceRunRoot || source.run_root !== input.sourceRunRoot
      || staged.decision_fingerprint !== input.sourceDecisionFingerprint
      || source.decision_fingerprint !== input.sourceDecisionFingerprint
      || intakePlanSha256(staged) !== input.planSha256 || intakePlanSha256(source) !== input.planSha256) {
    throw new Error('scoped rerun runnable plan changed during intent cleanup')
  }

  fs.unlinkSync(intent)
  const dir = fs.openSync(realTarget, 'r')
  try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
  return true
}

interface ProjectionSealPromotionDeps extends WorktreeInspectionDeps {
  run?: (repoRoot: string, targetRunRoot: string) => Promise<void>
}

/** Promote a finished, exact terminal pair to the immutable projection seal without buying the same three
 * final audit turns again. The canonical Python producer writes only when the latest audit trio is complete,
 * schema-valid and SHA-bound to this pair; any missing/stale audit simply leaves the normal full-recovery
 * path in charge. Callers must hold the subject mutation lock. */
export async function promoteAuditedAutomaticCallToProjectionSeal(
  input: AutomaticCallPublicationRecovery,
  deps: ProjectionSealPromotionDeps = {},
): Promise<boolean> {
  if (inspectAutomaticCallRecoveryWorktree(input, deps) !== 'preseal_pair') return false
  const repoRoot = deps.repoRoot ?? REPO_ROOT
  const run = deps.run ?? (async (root, target) => {
    await execFileAsync('python3', ['scripts/create_idea_projection_manifest.py', target], {
      cwd: root, timeout: 30_000, maxBuffer: 1024 * 1024,
    })
  })
  try { await run(repoRoot, input.targetRunRoot) } catch { return false }
  return inspectAutomaticCallRecoveryWorktree(input, deps) === 'projection_sealed'
}

/** Commit a fully sealed worktree result without launching a model, then run the immutable saved/public
 * recovery. A nonzero commit helper may still have created the local data commit before a push failure,
 * so the postcondition is the exact saved/shared proof rather than the shell exit code. */
export async function commitAndRecoverAutomaticCallWorktree(
  input: AutomaticCallPublicationRecovery,
): Promise<boolean> {
  if (inspectAutomaticCallRecoveryWorktree(input) !== 'ready_worktree') return false
  const target = path.join(REPO_ROOT, input.targetRunRoot)
  for (const marker of ['.interrupted', '.aborted', '.defer_module_memos', 'RUN_FAILURE.md']) {
    try { fs.rmSync(path.join(target, marker), { force: true }) } catch { /* commit helper remains fail-closed */ }
  }
  try {
    await execFileAsync('bash', [path.join(REPO_ROOT, 'scripts', 'commit-run.sh'),
      `Recover completed automatic call: ${input.subject}`, '--', `${input.targetRunRoot}/`], {
      cwd: REPO_ROOT, timeout: 20 * 60_000, maxBuffer: 4 * 1024 * 1024,
    })
  } catch { /* a push failure can still leave the exact complete local commit for saved publication */ }
  const recovered = await recoverCompletedAutomaticCallPublication(input)
  if (!recovered) throw new Error('completed automatic call could not be committed safely')
  return true
}

/** Materialize the complete root-level terminal set from one immutable Git tree and run the canonical
 * producer-side validator. Listing every audit-shaped file matters: a stale manifest pinned to v1 must
 * not pass merely because recovery hid a newer v2 from the canonical "latest audit" check. */
function projectionIsSealed(
  targetRunRoot: string,
  read: (repoPath: string) => Buffer | null,
  repoPaths: string[],
  validate: (runAbs: string, expectedRoot: string) => boolean,
): boolean {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-projection-proof-'))
  try {
    const prefix = `${targetRunRoot}/`
    const names = repoPaths
      .filter((repoPath) => repoPath.startsWith(prefix) && path.posix.dirname(repoPath) === targetRunRoot)
      .map((repoPath) => path.posix.basename(repoPath))
    // Injected legacy tests may omit tree enumeration; recover the minimum named set from the manifest,
    // but production always supplies the exact tree and therefore gets latest-audit/admission parity.
    if (!names.length) {
      const manifestBytes = read(`${targetRunRoot}/idea_projection_manifest.json`)
      if (!manifestBytes) return false
      const manifest = JSON.parse(manifestBytes.toString('utf8'))
      if (!manifest?.artifacts || typeof manifest.artifacts !== 'object') return false
      names.push('idea_projection_manifest.json', 'idea_admission.json', 'idea_3_6m.json')
      for (const item of Object.values(manifest.artifacts) as any[]) {
        if (!item || typeof item.path !== 'string') return false
        names.push(item.path)
      }
    }
    for (const name of [...new Set(names)]) {
      if (!/^[A-Za-z0-9_.-]+$/.test(name) || name !== path.basename(name)) return false
      const artifact = read(`${targetRunRoot}/${name}`)
      if (!artifact || artifact.length > 16 * 1024 * 1024) return false
      fs.writeFileSync(path.join(tempRoot, name), artifact)
    }
    return validate(tempRoot, targetRunRoot)
  } catch { return false }
  finally { try { fs.rmSync(tempRoot, { recursive: true, force: true }) } catch {} }
}

function terminalBytesMatch(
  input: CompletedResearchPublication,
  read: (repoPath: string) => Buffer | null,
  repoPaths: string[] = [],
  validate: (runAbs: string, expectedRoot: string) => boolean =
    (runAbs, expectedRoot) => validateCompletedIdeaPublication(runAbs, expectedRoot) !== null,
): boolean {
  const date = input.targetRunRoot.slice(-10)
  try {
    const decision = JSON.parse(read(`${input.targetRunRoot}/decision_record.json`)?.toString('utf8') || '')
    const thesis = read(`${input.targetRunRoot}/final_thesis.md`)
    const metadata = read(`${input.targetRunRoot}/RUN_METADATA.md`)
    const metadataText = metadata?.toString('utf8') ?? ''
    return decision?.ticker === input.subject
      && decision.run_root === input.targetRunRoot
      && decision.decision_date === date
      && !!thesis?.length
      && !!metadata?.length
      && READY_TO_PUBLISH.test(metadataText)
      && projectionIsSealed(input.targetRunRoot, read, repoPaths, validate)
  } catch { return false }
}

function bytesMatch(
  input: AutomaticCallPublicationRecovery,
  read: (repoPath: string) => Buffer | null,
  repoPaths: string[] = [],
  validate: (runAbs: string, expectedRoot: string) => boolean =
    (runAbs, expectedRoot) => validateCompletedIdeaPublication(runAbs, expectedRoot) !== null,
): boolean {
  const planName = input.planPath.split('/').pop()
  if (!planName || !SHA_RE.test(input.planSha256) || !SHA_RE.test(input.sourceDecisionFingerprint)) return false
  try {
    const staged = JSON.parse(read(`${input.targetRunRoot}/intake/${planName}`)?.toString('utf8') || '')
    return staged?.staged_for_scoped_rerun === true
      && staged.run_root === input.sourceRunRoot
      && staged.decision_fingerprint === input.sourceDecisionFingerprint
      && intakePlanSha256(staged) === input.planSha256
      && terminalBytesMatch(input, read, repoPaths, validate)
  } catch { return false }
}

/** Exact shared-Git completion proof for a full research run. A fresh thesis/decision pair is only an
 * intermediate master output; DONE requires the producer's audits, admission, READY marker and every
 * bound byte to exist in one immutable published tree. */
export function completedResearchPublicationIsShared(
  input: CompletedResearchPublication,
  deps: Pick<RecoveryDeps, 'sharedBytes' | 'sharedPaths' | 'validateTerminal'> = {},
): boolean {
  try {
    let commit: string | null = null
    const read = deps.sharedBytes ?? ((repoPath: string) => {
      commit ??= publishedGitCommit(REPO_ROOT)
      return localCommitBytes(commit, repoPath, REPO_ROOT)
    })
    const paths = deps.sharedPaths
      ? deps.sharedPaths(input.targetRunRoot)
      : deps.sharedBytes
        ? []
        : publishedTreePaths('analyses', REPO_ROOT, commit ??= publishedGitCommit(REPO_ROOT))
          .filter((repoPath) => repoPath.startsWith(`${input.targetRunRoot}/`))
    return terminalBytesMatch(
      input,
      (repoPath) => read(repoPath, REPO_ROOT),
      paths,
      deps.validateTerminal,
    )
  } catch { return false }
}

/** Exact shared-Git completion proof for one automatic scoped plan. Unlike the root-level terminal
 * proof, this also binds the server-stamped transport copy to the published source plan hash and
 * decision fingerprint. A different same-day run in the same target folder cannot satisfy it. */
export function automaticCallPublicationIsShared(
  input: AutomaticCallPublicationRecovery,
  deps: Pick<RecoveryDeps, 'sharedBytes' | 'sharedPaths' | 'validateTerminal'> = {},
): boolean {
  try {
    let commit: string | null = null
    const read = deps.sharedBytes ?? ((repoPath: string) => {
      commit ??= publishedGitCommit(REPO_ROOT)
      return localCommitBytes(commit, repoPath, REPO_ROOT)
    })
    const paths = deps.sharedPaths
      ? deps.sharedPaths(input.targetRunRoot)
      : deps.sharedBytes
        ? []
        : publishedTreePaths('analyses', REPO_ROOT, commit ??= publishedGitCommit(REPO_ROOT))
          .filter((repoPath) => repoPath.startsWith(`${input.targetRunRoot}/`))
    return bytesMatch(
      input,
      (repoPath) => read(repoPath, REPO_ROOT),
      paths,
      deps.validateTerminal,
    )
  } catch { return false }
}

function savedCommitMatches(input: AutomaticCallPublicationRecovery, commit: string, deps: RecoveryDeps): boolean {
  let paths: string[]
  try {
    paths = deps.commitPaths
      ? deps.commitPaths(commit, input.targetRunRoot)
      : publishedTreePaths(input.targetRunRoot, REPO_ROOT, commit)
  } catch { return false }
  return bytesMatch(
    input,
    (repoPath) => deps.commitBytes(commit, repoPath, REPO_ROOT),
    paths,
    deps.validateTerminal,
  )
}

/**
 * Publish an already-finished automatic call without launching research again.
 *
 * A pair of files in the worktree is not completion proof: the command writes them before its final gates.
 * Recovery therefore accepts only a local data-only commit produced after shared main which contains the
 * exact staged plan, correctly-bound decision and nonempty thesis. Publication copies bytes from that saved
 * commit, never from the mutable worktree, then rechecks the shared terminal pair.
 */
export async function recoverCompletedAutomaticCallPublication(
  input: AutomaticCallPublicationRecovery,
  deps: RecoveryDeps = {
    candidates: localSavedResearchCommits,
    commitBytes: localCommitBytes,
    publish: publishResearchPaths,
  },
): Promise<boolean> {
  const paths = [`${input.targetRunRoot}/`]
  let sharedCommit: string | null = null
  const sharedBytes = deps.sharedBytes ?? ((repoPath: string) => {
    sharedCommit ??= publishedGitCommit(REPO_ROOT)
    return localCommitBytes(sharedCommit, repoPath, REPO_ROOT)
  })
  const sharedPaths = (): string[] => deps.sharedPaths
    ? deps.sharedPaths(input.targetRunRoot)
    : deps.sharedBytes
      ? []
      // A first-ever target is normally absent from shared Git. Enumerate the positively-validated
      // analyses authority and filter it, rather than asking Git to treat that missing child as an
      // authority failure. A missing/broken shared analyses tree still throws fail-closed.
      : publishedTreePaths('analyses', REPO_ROOT, sharedCommit ??= publishedGitCommit(REPO_ROOT))
        .filter((repoPath) => repoPath.startsWith(`${input.targetRunRoot}/`))
  const commit = deps.candidates(paths, REPO_ROOT).find((candidate) => savedCommitMatches(input, candidate, deps))
  if (!commit) {
    // The normal success path has already pushed its data commit, so it is intentionally absent from the
    // local-ahead list. Prove the exact staged plan and bound terminal pair directly in shared Git.
    return bytesMatch(
      input,
      (repoPath) => sharedBytes(repoPath, REPO_ROOT),
      sharedPaths(),
      deps.validateTerminal,
    )
  }
  // Always run the idempotent publisher when a matching ahead commit exists so every path-confined byte
  // from the terminal data commit reaches the shared authority before the job is retired.
  await deps.publish(`Publish saved automatic call for ${input.subject}`, paths, commit, REPO_ROOT)
  if (!bytesMatch(
    input,
    (repoPath) => sharedBytes(repoPath, REPO_ROOT),
    sharedPaths(),
    deps.validateTerminal,
  )) {
    throw new Error('saved automatic call is still not available to the shared app')
  }
  return true
}
