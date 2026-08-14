import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify, TextDecoder } from 'node:util'
import { REPO_ROOT } from './config'
import {
  localCommitBytes,
  localCommitChangedPaths,
  localSavedResearchCommits,
  publishedTreeAuthority,
  publishResearchPaths,
} from './git-publication'
import { automaticIntakeRawEvidenceIsComplete, intakePlanSha256 } from './intake'

export interface AutomaticIntakePublicationProof {
  ticker: string
  swarm: string
  runRoot: string
  decisionFingerprint: string
  newestPoolMs: number
}

interface RecoveryDeps {
  candidates: typeof localSavedResearchCommits
  commitBytes: typeof localCommitBytes
  publish: typeof publishResearchPaths
  now?: () => number
  paths?: (commit: string) => string[]
  coverage?: typeof automaticIntakeRawEvidenceIsComplete
  localArtifact?: (proof: AutomaticIntakePublicationProof) => { paths: [string, string] } | null
  commit?: (message: string, paths: string[]) => Promise<void>
  sharedArtifact?: (proof: AutomaticIntakePublicationProof) => boolean
}

const PLAN_RE = /^\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.json$/
const CANONICAL_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3,6})?Z$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const execFileAsync = promisify(execFile)

function validIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false
  const parsed = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value
}

/** A complete intake memo is the human-readable final witness paired with the authoritative JSON.
 * Strict UTF-8, the exact bound title, and every required section prevent a one-byte/half-written memo
 * from turning an interrupted model turn into publishable research. */
export function validCompleteIntakeMemo(
  bytes: Buffer,
  raw: any,
  proof: AutomaticIntakePublicationProof,
): boolean {
  if (!Buffer.isBuffer(bytes) || bytes.length < 128 || bytes.length > 512 * 1024
      || !validIsoDate(raw?.scan_date) || typeof raw?.verdict !== 'string') return false
  let memo: string
  try { memo = new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch { return false }
  if (memo.includes('\0')) return false

  const headings = [
    `# ${proof.ticker} Document Intake — ${raw.scan_date}`,
    '## Verdict',
    `## New documents since the last run (${proof.runRoot})`,
    '## Scoped rerun plan',
    '## Watch (note-only)',
  ]
  let cursor = -1
  for (const heading of headings) {
    const matches = [...memo.matchAll(new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm'))]
    if (matches.length !== 1 || (matches[0].index ?? -1) <= cursor) return false
    cursor = matches[0].index ?? -1
  }
  if (memo.trimStart().split(/\r?\n/, 1)[0] !== headings[0]) return false

  for (let index = 1; index < headings.length; index++) {
    const start = memo.indexOf(headings[index]) + headings[index].length
    const end = index + 1 < headings.length ? memo.indexOf(headings[index + 1]) : memo.length
    if (!memo.slice(start, end).trim()) return false
  }
  const verdictStart = memo.indexOf('## Verdict') + '## Verdict'.length
  const verdictEnd = memo.indexOf(headings[2])
  if (!new RegExp(`(^|[^A-Za-z0-9_])${String(raw.verdict).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_]|$)`)
    .test(memo.slice(verdictStart, verdictEnd))) return false
  for (const command of Array.isArray(raw?.rerun_plan?.commands) ? raw.rerun_plan.commands : []) {
    if (typeof command?.command !== 'string' || !command.command.trim()
        || !memo.includes(command.command)) return false
  }
  return true
}

function exactPairIsComplete(
  proof: AutomaticIntakePublicationProof,
  json: Buffer | null,
  markdown: Buffer | null,
  deps: RecoveryDeps,
): boolean {
  if (!json || !markdown) return false
  try {
    const raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(json))
    const scannedMs = typeof raw?.scanned_at === 'string' && CANONICAL_UTC_RE.test(raw.scanned_at)
      ? Date.parse(raw.scanned_at) : NaN
    return !!raw && typeof raw === 'object' && !Array.isArray(raw)
      && raw.staged_for_scoped_rerun === undefined
      && raw.ticker === proof.ticker && raw.subject === proof.ticker && raw.swarm === proof.swarm
      && raw.run_root === proof.runRoot && raw.decision_fingerprint === proof.decisionFingerprint
      && Number.isFinite(scannedMs) && scannedMs <= (deps.now ?? Date.now)()
      && proof.newestPoolMs > 0 && scannedMs >= proof.newestPoolMs
      && !!intakePlanSha256(raw)
      && (deps.coverage ?? automaticIntakeRawEvidenceIsComplete)({
        raw, subject: proof.ticker, swarmId: proof.swarm, runRoot: proof.runRoot,
        decisionFingerprint: proof.decisionFingerprint, now: (deps.now ?? Date.now)(),
      })
      && validCompleteIntakeMemo(markdown, raw, proof)
  } catch { return false }
}

function versionKey(repoPath: string): [string, number] {
  const match = /^(\d{4}-\d{2}-\d{2})_intake_plan(?:_v(\d+))?\.json$/.exec(path.basename(repoPath))
  return match ? [match[1], match[2] ? Number(match[2]) : 1] : ['', 0]
}

function newestFirst(a: string, b: string): number {
  const [ad, av] = versionKey(a); const [bd, bv] = versionKey(b)
  return bd.localeCompare(ad) || bv - av
}

function exactSavedPlan(
  proof: AutomaticIntakePublicationProof,
  commit: string,
  deps: RecoveryDeps,
): { jsonPath: string; markdownPath: string } | null {
  const prefix = `${proof.runRoot}/intake/`
  const candidates = [
    ...localCommitPaths(commit, deps),
  ].filter((repoPath) => repoPath.startsWith(prefix) && PLAN_RE.test(path.basename(repoPath))).sort(newestFirst)
  for (const jsonPath of candidates) {
    const markdownPath = jsonPath.replace(/\.json$/, '.md')
    const json = deps.commitBytes(commit, jsonPath, REPO_ROOT)
    const markdown = deps.commitBytes(commit, markdownPath, REPO_ROOT)
    if (exactPairIsComplete(proof, json, markdown, deps)) return { jsonPath, markdownPath }
  }
  return null
}

function completeLocalArtifact(proof: AutomaticIntakePublicationProof, deps: RecoveryDeps): { paths: [string, string] } | null {
  try {
    const expectedDir = `${proof.runRoot}/intake`
    const absoluteDir = path.join(REPO_ROOT, expectedDir)
    for (const candidate of [path.join(REPO_ROOT, 'analyses'), path.join(REPO_ROOT, proof.runRoot), absoluteDir]) {
      const stat = fs.lstatSync(candidate)
      if (!stat.isDirectory() || stat.isSymbolicLink()) return null
    }
    const relativeReal = path.relative(fs.realpathSync(REPO_ROOT), fs.realpathSync(absoluteDir)).split(path.sep).join('/')
    if (relativeReal !== expectedDir) return null
    const candidates = fs.readdirSync(absoluteDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.isSymbolicLink() && PLAN_RE.test(entry.name))
      .map((entry) => `${expectedDir}/${entry.name}`).sort(newestFirst)
    for (const jsonPath of candidates) {
      const markdownPath = jsonPath.replace(/\.json$/, '.md')
      const jsonAbs = path.join(REPO_ROOT, jsonPath)
      const markdownAbs = path.join(REPO_ROOT, markdownPath)
      const jsonStat = fs.lstatSync(jsonAbs)
      const markdownStat = fs.lstatSync(markdownAbs)
      if (!jsonStat.isFile() || jsonStat.isSymbolicLink() || jsonStat.size > 8 * 1024 * 1024
          || !markdownStat.isFile() || markdownStat.isSymbolicLink() || markdownStat.size > 512 * 1024) continue
      if (exactPairIsComplete(proof, fs.readFileSync(jsonAbs), fs.readFileSync(markdownAbs), deps)) {
        return { paths: [jsonPath, markdownPath] }
      }
    }
  } catch { /* no complete contained local pair */ }
  return null
}

async function commitExactIntake(message: string, paths: string[]): Promise<void> {
  await execFileAsync('bash', [path.join(REPO_ROOT, 'scripts', 'commit-run.sh'), message, '--', ...paths], {
    cwd: REPO_ROOT, timeout: 20 * 60_000, maxBuffer: 4 * 1024 * 1024,
  })
}

function completeSharedArtifact(proof: AutomaticIntakePublicationProof, deps: RecoveryDeps): boolean {
  try {
    const authority = publishedTreeAuthority('analyses')
    const prefix = `${proof.runRoot}/intake/`
    const candidates = [...authority.paths]
      .filter((repoPath) => repoPath.startsWith(prefix) && PLAN_RE.test(path.basename(repoPath)))
      .sort(newestFirst)
    return candidates.some((jsonPath) => {
      const markdownPath = jsonPath.replace(/\.json$/, '.md')
      return authority.paths.has(markdownPath)
        && exactPairIsComplete(proof, authority.readRequired(jsonPath), authority.readRequired(markdownPath), deps)
    })
  } catch { return false }
}

function localCommitPaths(commit: string, deps: RecoveryDeps): string[] {
  // Choose only a pair written by this exact candidate commit. An inherited older v9 must never mask a
  // newer v10 that the failed intake command actually saved.
  if (deps.paths) return deps.paths(commit)
  return localCommitChangedPaths(commit, REPO_ROOT)
}

/** Publish a saved automatic intake plan before buying another intake analysis. */
export async function recoverAutomaticIntakePublication(
  proof: AutomaticIntakePublicationProof,
  deps: RecoveryDeps = {
    candidates: localSavedResearchCommits,
    commitBytes: localCommitBytes,
    publish: publishResearchPaths,
  },
): Promise<boolean> {
  const runIdentity = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/.exec(proof.runRoot)
  if (!/^[A-Z0-9.\-]{1,15}$/.test(proof.ticker)
      || !runIdentity || runIdentity[1] !== proof.ticker || !validIsoDate(runIdentity[2])
      || !/^sha256:[a-f0-9]{64}$/.test(proof.decisionFingerprint)
      || !Number.isFinite(proof.newestPoolMs) || proof.newestPoolMs <= 0) return false
  const root = [`${proof.runRoot}/intake/`]
  const findSaved = (): { commit: string; pair: NonNullable<ReturnType<typeof exactSavedPlan>> } | null => {
    for (const commit of deps.candidates(root, REPO_ROOT)) {
      const pair = exactSavedPlan(proof, commit, deps)
      if (pair) return { commit, pair }
    }
    return null
  }
  let found = findSaved()
  if (!found) {
    const local = (deps.localArtifact ?? ((candidate) => completeLocalArtifact(candidate, deps)))(proof)
    if (!local) return false
    // Once the exact local pair passes the full automatic contract, it is already-paid work. Commit or
    // publication failures remain publication-pending and must never authorize another intake model turn.
    try {
      await (deps.commit ?? commitExactIntake)(
        `Intake plan: ${proof.ticker} ${path.basename(local.paths[0]).slice(0, 10)}`,
        local.paths,
      )
    } catch { /* commit-run can save locally and fail only while pushing; discover that commit below */ }
    if ((deps.sharedArtifact ?? ((candidate) => completeSharedArtifact(candidate, deps)))(proof)) return true
    found = findSaved()
    if (!found) throw new Error('complete intake pair could not be committed safely')
  }
  await deps.publish(
    `Publish saved automatic intake for ${proof.ticker}`,
    [found.pair.jsonPath, found.pair.markdownPath],
    found.commit,
    REPO_ROOT,
  )
  return true
}
