// Document-intake reader — the SERVER-side authority over the scoped rerun plan a swarm's
// `<command namespace>:intake` command writes (frameworks/INTAKE.md). It reads the latest plan from
// the subject's manifest-derived run root, then does the two things a prompt-written
// plan must NOT be trusted to have gotten right on its own:
//   1. VALIDATES every module/agent name against the discovered roster (a hallucinated name is
//      dropped, its document widened to blanket-stale) — so the cockpit can never be handed a
//      launchable `/<namespace>:rerun badmodule …` command (fail-closed, CLAUDE.md §26 + INTAKE.md §4).
//   2. RE-EXPANDS each surviving command's downstream cascade from the live DAG (roster.ts
//      downstreamCascade) — the single source of truth, so a hand-written cascade can never drift.
//
// It NEVER launches anything and NEVER touches the staleness floor (completion.ts) — the plan is
// advisory guidance layered on top of the honest floor (INTAKE.md §1). Returns null when there is
// no run or no readable plan, so the client shows the honest floor rather than a fabricated one.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { DATA_DIR, REPO_ROOT } from './config'
import { dataPoolNewest, todayDate } from './completion'
import { readDataNeeds } from './data-needs'
import { normalizeDataSubject } from './data-subject'
import { finalDeliverablesPresent } from './launcher'
import { listModuleNames, agentNamesForModule, downstreamCascade } from './roster'
import { RESEARCH_SWARM_ID, swarmById } from './swarms'
import { canonicalJsonText } from './canonical-json'
import type { SwarmManifest } from './types'

export interface IntakeEntryOrb {
  module: string
  agent: string
  why: string
  confidence: number
}
export interface IntakeNewDoc {
  path: string
  sha256?: string | null
  provider?: string | null
  source_type?: string | null
  tier?: number | null
  as_of?: string | null
  claims_summary: string
  materiality_score: number
  impact_direction: string
  entry_orbs: IntakeEntryOrb[]
}
export interface IntakeRerunCommand {
  command: string
  module: string
  agent: string
  cascade_modules: string[]
  triggered_by: string[]
}
export interface IntakeRerunPlan {
  materiality_gate: number
  entry_orbs: { module: string; agent: string }[]
  commands: IntakeRerunCommand[]
  note_only: { path: string; reason: string }[]
}
export interface IntakePlan {
  schema_version: string
  // Server-stamped routing identity. `ticker` remains the schema-v1/back-compat subject alias.
  swarm: string
  subject: string
  ticker: string
  run_root: string
  // Authored by the intake command from the launcher's exact selected-call binding, then verified by this
  // reader against the contained decision. A legacy/mismatched value leaves the plan audit-readable but
  // never paid-rerun actionable.
  decision_fingerprint?: string
  // Server-derived immutable identity of the exact plan bytes (apart from the scoped-copy staging stamp).
  // These fields are the receipt intent a single-orb exact launch carries into the rerun command.
  plan_path: string
  plan_sha256: string
  actionable: boolean
  scan_date: string
  scanned_at?: string // ISO wall-clock the command stamps BEFORE it reads the pool — the durable "as-of"
  watermark?: string
  new_docs: IntakeNewDoc[]
  rerun_plan: IntakeRerunPlan
  verdict: 'scoped_rerun' | 'note_only' | 'insufficient'
  summary: string
  // stamped by the reader (never trusted from the file):
  analyzed_at: string // the plan file's mtime, ISO — used only for "did the plan file change" detection
  widened: string[] // human-readable notes about dropped/widened entries (fail-closed audit trail)
  // True iff this analysis provably accounts for the WHOLE current pool — no pool file arrived after the
  // analysis read it. It is the safety gate on the cockpit's affirmative "no new data — everything's been
  // read and considered" message: that claim may ONLY be shown when `new_docs` is empty AND `pool_current`
  // is true, so a document dropped after the analysis can never be reported as "nothing new".
  //
  // The witness is DURABLE, never the plan file's mtime. Plan files live under a Git-tracked runs tree, and
  // any checkout / clone / worktree / rebase / fresh-deploy tree rewrites their mtime FORWARD to the
  // operation time — always toward a falsely-fresh verdict — while data/ mtimes are durable (gitignored).
  // So `pool_current` compares the live pool against the plan's own recorded `scanned_at` (precise), or
  // `scan_date` (date-granular, strict — a same-day file counts as unread) for older plans, and is false
  // when neither witness is provable. Fail-safe by construction: any doubt → false → the cockpit prompts a
  // re-analysis instead of claiming "nothing new".
  pool_current: boolean
  // True iff this plan is a copy `carryForwardScoped` staged into THIS run root, and that root's scoped
  // rerun has since actually finished (final_thesis.md + decision_record.json on disk) — its commands were
  // already carried out here. Serving them again would tell the cockpit that already-incorporated data
  // still needs a rerun (Codex #358 r3673980745). The file is never deleted (kept for the audit trail);
  // `rerun_plan.commands`/`entry_orbs` are emptied instead, so the client's existing "nothing to re-run"
  // state covers it with no UI change needed.
  consumed: boolean
}

export interface IntakeReceiptIntent {
  planPath: string
  planSha256: string
  sourceDecisionFingerprint: string
}

export interface IntakeReadOptions {
  swarmId?: string
  // Optional repo-relative (or contained absolute) run root for a point-in-time/historical read.
  // It must match this swarm's run_root_template with this exact subject in the placeholder.
  runRoot?: string
}

// The downstream module set a single-orb rerun re-runs, recomputed from the live DAG. Mirrors
// launcher.ts coveredModulesFor('rerun') exactly (minus the master synthesizer, which is not a module).
function cascadeModulesFor(module: string, agent: string, swarmId: string): string[] {
  try {
    return [...new Set(downstreamCascade(module, agent, swarmId).filter((c) => c.kind !== 'master' && c.module !== 'master').map((c) => c.module))]
  } catch {
    return []
  }
}

const toRepoPath = (p: string): string => p.split(path.sep).join('/')
const reEscape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const inside = (candidate: string, root: string): boolean => candidate === root || candidate.startsWith(root + path.sep)
const relativeToRepo = (realPath: string): string => {
  try { return toRepoPath(path.relative(fs.realpathSync(REPO_ROOT), realPath)) }
  catch { return toRepoPath(path.relative(REPO_ROOT, realPath)) }
}
const validIsoDate = (value: unknown, notAfter?: string): string | null => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || (notAfter && value > notAfter)) return null
  const ms = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value ? value : null
}

const SHA256_RE = /^sha256:[a-f0-9]{64}$/
const CANONICAL_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3,6})?Z$/
export const INTAKE_EXECUTION_RECEIPT_VERSION = 'intake-execution-receipt/1' as const

// Same canonical JSON rules as data-needs.ts. Plan hashing deliberately omits only the scoped-copy stamp:
// carryForwardScoped adds that transport flag to an otherwise-identical plan, and the source plan's hash
// must remain its durable identity in the staged audit copy.
const canonicalJson = canonicalJsonText

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`
}

export function intakePlanSha256(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const authored = { ...(value as Record<string, unknown>) }
  delete authored.staged_for_scoped_rerun
  try { return sha256(canonicalJson(authored)) } catch { return null }
}

type IntakeReceiptPayload = {
  schema_version: typeof INTAKE_EXECUTION_RECEIPT_VERSION
  swarm: string
  subject: string
  run_root: string
  plan_path: string
  plan_sha256: string
  source_decision_fingerprint: string
  executed_against_decision_fingerprint: string
  executed_orbs: { module: string; agent: string }[]
  completed_at: string
  result_decision_fingerprint: string
  result_decision_id: string | null
}

export function intakeExecutionReceiptId(value: IntakeReceiptPayload): string {
  return sha256(canonicalJson(value))
}

interface ValidatedReceipt extends IntakeReceiptPayload {
  receipt_id: string
}

// Validate a prompt-written evidence reference without opening it. Intake evidence lives in the shared,
// configured data pool under exactly data/<SUBJECT>/... . The returned path is canonical repo-relative
// POSIX text; traversal, aliases (`.`/`..`/double slash), absolute paths, cross-subject paths, nested symlink
// redirects, directories, and control characters fail the WHOLE plan closed. A referenced file may have
// since been removed — the audit trail remains readable — so non-existence alone is not an error.
function normalizePoolEvidencePath(subject: string, value: unknown): string | null {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || /[\\\x00-\x1f\x7f]/.test(value)) return null
  const normalized = path.posix.normalize(value)
  if (normalized !== value || value.startsWith('./') || value.includes('//')) return null

  const repo = path.resolve(REPO_ROOT)
  const data = path.resolve(DATA_DIR)
  const pool = path.resolve(data, subject)
  const candidate = path.resolve(repo, value)
  if (!inside(data, repo) || !inside(pool, data) || candidate === pool || !inside(candidate, pool)) return null
  const expectedPrefix = `${toRepoPath(path.relative(repo, pool))}/`
  if (!value.startsWith(expectedPrefix)) return null

  // A Drive-backed DATA_DIR / subject pool may itself be a mount/symlink, but no descendant alias may
  // redirect one document reference elsewhere. Walk only existing components; a removed tail is audit text.
  const relParts = path.relative(pool, candidate).split(path.sep).filter(Boolean)
  let cursor = pool
  for (const part of relParts) {
    cursor = path.join(cursor, part)
    try {
      const stat = fs.lstatSync(cursor)
      if (stat.isSymbolicLink()) return null
      if (cursor === candidate && !stat.isFile()) return null
    } catch {
      break
    }
  }
  try {
    const realPool = fs.realpathSync(pool)
    const realCandidate = fs.realpathSync(candidate)
    if (!inside(realCandidate, realPool)) return null
  } catch { /* removed/missing reference: lexical + no-known-nested-link checks above are authoritative */ }
  return value
}

// completion.dataPoolNewest predates manifest swarms and intentionally enforces the research ticker
// grammar. Preserve that byte-for-byte path for research; use the same mtime/ctime/depth semantics here for
// a manifest-normalized subject that may be longer than an exchange symbol. This is read-only and never
// follows symlinked directories.
export function intakePoolNewest(subject: string, swarmId: string): { files: number; newestDate: string | null; newestMs: number } {
  if (swarmId === RESEARCH_SWARM_ID) return dataPoolNewest(subject)
  const root = path.join(DATA_DIR, subject)
  let files = 0
  let newestMtimeMs = 0
  let newestMs = 0
  const walk = (dir: string, depth: number): void => {
    if (depth > 24) return
    let entries: fs.Dirent[]
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const candidate = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(candidate, depth + 1); continue }
      if (!entry.isFile()) continue
      files++
      try {
        const stat = fs.statSync(candidate)
        newestMtimeMs = Math.max(newestMtimeMs, stat.mtimeMs)
        newestMs = Math.max(newestMs, stat.mtimeMs, stat.ctimeMs)
      } catch { /* disappeared mid-scan */ }
    }
  }
  walk(root, 0)
  return { files, newestDate: newestMtimeMs > 0 ? todayDate(new Date(newestMtimeMs)) : null, newestMs }
}

// Compile a swarm's run-root template for ONE exact subject. The manifest owns both the folder shape and
// the subject placeholder; any other token (research's DATE, or a future version token) is one path segment.
// This is also the subject-isolation guard on caller-supplied point-in-time roots: a valid root for another
// subject is still rejected even though it sits inside the same runsRoot.
function runRootPattern(swarm: SwarmManifest, subject: string): RegExp | null {
  const template = toRepoPath(path.normalize(swarm.runRootTemplate)).replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')
  const token = /\{([^{}]+)\}/g
  let source = '^'
  let cursor = 0
  let sawSubject = false
  for (const match of template.matchAll(token)) {
    source += reEscape(template.slice(cursor, match.index))
    if (match[1] === swarm.placeholder) {
      source += reEscape(subject)
      sawSubject = true
    } else {
      source += '[^/]+'
    }
    cursor = (match.index ?? 0) + match[0].length
  }
  if (!sawSubject) return null
  source += reEscape(template.slice(cursor)) + '$'
  return new RegExp(source)
}

// Read a durable date only from a manifest TOKEN in the resolved run root, never from arbitrary basename
// text. A singleton subject is allowed to contain `YYYY-MM-DD`; treating that as the run date would let an
// invalid/missing decision_date falsely satisfy the freshness floor. Research's `{DATE}` is captured here,
// while a singleton template has no non-subject token and therefore falls through to its terminal record.
function dateTokenFromRunRoot(swarm: SwarmManifest, subject: string, runRootAbs: string, notAfter: string): string | null {
  const template = toRepoPath(path.normalize(swarm.runRootTemplate)).replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')
  const token = /\{([^{}]+)\}/g
  const capturedNames: string[] = []
  let source = '^'
  let cursor = 0
  for (const match of template.matchAll(token)) {
    source += reEscape(template.slice(cursor, match.index))
    if (match[1] === swarm.placeholder) source += reEscape(subject)
    else {
      source += '([^/]+)'
      capturedNames.push(match[1])
    }
    cursor = (match.index ?? 0) + match[0].length
  }
  source += reEscape(template.slice(cursor)) + '$'
  const match = new RegExp(source).exec(relativeToRepo(runRootAbs))
  if (!match) return null
  const dates = capturedNames.map((_, i) => validIsoDate(match[i + 1], notAfter)).filter((d): d is string => d !== null)
  return dates.length === 1 ? dates[0] : null
}

interface SwarmPaths {
  repo: string
  realRepo: string
  runsRoot: string
  realRunsRoot: string
}

function swarmPaths(swarm: SwarmManifest): SwarmPaths | null {
  const repo = path.resolve(REPO_ROOT)
  const runsRoot = path.resolve(repo, swarm.runsRoot)
  if (!inside(runsRoot, repo)) return null // a malformed manifest cannot widen the filesystem sandbox
  try {
    const realRepo = fs.realpathSync(repo)
    const realRunsRoot = fs.realpathSync(runsRoot)
    return inside(realRunsRoot, realRepo) ? { repo, realRepo, runsRoot, realRunsRoot } : null
  } catch {
    return null
  }
}

// Resolve and contain one exact run root. Both the requested lexical path and its real path must match the
// manifest template, which rejects `..`, cross-swarm roots, cross-subject roots, and symlink redirects.
function exactRunRoot(swarm: SwarmManifest, subject: string, requested: string): string | null {
  const roots = swarmPaths(swarm)
  const pattern = runRootPattern(swarm, subject)
  if (!roots || !pattern || typeof requested !== 'string' || !requested.trim()) return null
  const lexical = path.resolve(roots.repo, requested)
  const lexicalBase = inside(lexical, roots.runsRoot)
    ? roots.repo
    : (inside(lexical, roots.realRunsRoot) ? roots.realRepo : null)
  if (!lexicalBase) return null
  const lexicalRel = toRepoPath(path.relative(lexicalBase, lexical))
  if (!pattern.test(lexicalRel)) return null
  try {
    const real = fs.realpathSync(lexical)
    if (!inside(real, roots.realRunsRoot) || !fs.statSync(real).isDirectory()) return null
    const realRel = toRepoPath(path.relative(roots.realRepo, real))
    return pattern.test(realRel) ? real : null
  } catch {
    return null
  }
}

// Enumerate the concrete run directories described by a manifest. Templates currently resolve one folder
// below runsRoot, but walking to the template's declared depth also covers a future nested run layout with no
// family-specific code. Symlinked directories are never followed.
function runRootsForSubject(swarm: SwarmManifest, subject: string): string[] {
  const roots = swarmPaths(swarm)
  const pattern = runRootPattern(swarm, subject)
  if (!roots || !pattern) return []
  const rootRel = toRepoPath(path.relative(roots.realRepo, roots.realRunsRoot)).replace(/^\/+|\/+$/g, '')
  const templateRel = toRepoPath(path.normalize(swarm.runRootTemplate)).replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')
  const rootParts = rootRel ? rootRel.split('/') : []
  const templateParts = templateRel ? templateRel.split('/') : []
  if (templateParts.length <= rootParts.length || templateParts.slice(0, rootParts.length).join('/') !== rootParts.join('/')) return []
  const depth = templateParts.length - rootParts.length
  const found: string[] = []
  const walk = (dir: string, left: number): void => {
    let entries: fs.Dirent[]
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue
      const candidate = path.join(dir, entry.name)
      if (left > 1) {
        walk(candidate, left - 1)
        continue
      }
      const rel = toRepoPath(path.relative(roots.realRepo, candidate))
      if (pattern.test(rel)) found.push(candidate)
    }
  }
  walk(roots.realRunsRoot, depth)
  return found.sort((a, b) => toRepoPath(path.relative(roots.realRepo, b)).localeCompare(toRepoPath(path.relative(roots.realRepo, a))))
}

function hasObjectDecision(runRootAbs: string): boolean {
  const raw = readContainedDecision(runRootAbs)
  return !!raw && typeof raw === 'object' && !Array.isArray(raw)
}

function hasContainedFile(runRootAbs: string, basename: string): boolean {
  try {
    const realRoot = fs.realpathSync(runRootAbs)
    const requested = path.join(realRoot, basename)
    if (fs.lstatSync(requested).isSymbolicLink()) return false
    const real = fs.realpathSync(requested)
    return path.dirname(real) === realRoot && path.basename(real) === basename && fs.statSync(real).isFile()
  } catch {
    return false
  }
}

function readContainedDecision(runRootAbs: string): any | null {
  try {
    const realRoot = fs.realpathSync(runRootAbs)
    const file = fs.realpathSync(path.join(realRoot, 'decision_record.json'))
    if (path.dirname(file) !== realRoot || path.basename(file) !== 'decision_record.json' || !fs.statSync(file).isFile()) return null
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

export function finishedForIntake(swarm: SwarmManifest, runRootAbs: string): boolean {
  // Research's command has always treated either terminal artifact as a finished thesis; keep that writer /
  // reader agreement even when the newest final_thesis predates its decision_record. Manifest swarms have
  // no research master thesis and require their exact object decision record, the terminal artifact their
  // intake command scopes against.
  if (swarm.id === RESEARCH_SWARM_ID) return hasContainedFile(runRootAbs, 'final_thesis.md') || hasObjectDecision(runRootAbs)
  return hasObjectDecision(runRootAbs)
}

export function resolveIntakeRunRoot(subject: string, options: IntakeReadOptions = {}, preferComplete = true): { swarm: SwarmManifest; subject: string; root: string; runRoot: string } | null {
  const swarmId = options.swarmId ?? RESEARCH_SWARM_ID
  const safeSubject = normalizeDataSubject(swarmId, subject)
  if (!safeSubject) return null
  const swarm = swarmById(swarmId)
  if (!swarm || !/^[a-z0-9-]{1,40}$/.test(swarm.commandNs)) return null
  if (options.runRoot !== undefined) {
    const root = exactRunRoot(swarm, safeSubject, options.runRoot)
    if (!root || (preferComplete ? !finishedForIntake(swarm, root)
      : (swarm.id !== RESEARCH_SWARM_ID && !hasObjectDecision(root)))) return null
    return { swarm, subject: safeSubject, root, runRoot: relativeToRepo(root) }
  }
  const roots = runRootsForSubject(swarm, safeSubject)
  if (!roots.length) return null
  // Preserve research's standing-run rule, generalized to every manifest: display the newest run that
  // actually finished. Research can fall back to its newest in-flight/staged folder when nothing has ever
  // finished (backward-compatible retry behavior); manifest swarms require their decision record.
  const finished = roots.find((root) => finishedForIntake(swarm, root))
  const root = preferComplete
    ? (finished ?? (swarm.id === RESEARCH_SWARM_ID ? roots[0] : null))
    : (swarm.id === RESEARCH_SWARM_ID ? roots[0] : finished)
  if (!root) return null
  return { swarm, subject: safeSubject, root, runRoot: relativeToRepo(root) }
}

/** ABSOLUTE path of the subject's current intake plan file, or null. By default this is newest-run-wins
 * (the research scoped-rerun staging contract); an exact `runRoot` makes it a point-in-time lookup. */
export function latestPlanFileFor(subject: string, options: IntakeReadOptions = {}): string | null {
  const context = resolveIntakeRunRoot(subject, options, false)
  return context ? latestPlanFile(context.root) : null
}

function latestPlanFile(runRootAbs: string): string | null {
  let realRoot: string
  let dir: string
  let names: string[]
  try {
    realRoot = fs.realpathSync(runRootAbs)
    const requestedDir = path.join(realRoot, 'intake')
    if (fs.lstatSync(requestedDir).isSymbolicLink()) return null
    dir = fs.realpathSync(requestedDir)
    if (path.dirname(dir) !== realRoot || path.basename(dir) !== 'intake') return null
    names = fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.json$/.test(n))
  } catch {
    return null
  }
  if (!names.length) return null
  names.sort((a, b) => {
    const parse = (name: string): [string, number] => {
      const m = name.match(/^(\d{4}-\d{2}-\d{2})_intake_plan(?:_v(\d+))?\.json$/)!
      return [m[1], m[2] ? Number(m[2]) : 1]
    }
    const [ad, av] = parse(a)
    const [bd, bv] = parse(b)
    return ad.localeCompare(bd) || av - bv
  })
  const candidate = path.join(dir, names[names.length - 1])
  try {
    if (fs.lstatSync(candidate).isSymbolicLink()) return null
    const real = fs.realpathSync(candidate)
    return path.dirname(real) === dir && fs.statSync(real).isFile() ? real : null
  } catch {
    return null
  }
}

const RECEIPT_KEYS = new Set([
  'schema_version', 'receipt_id', 'swarm', 'subject', 'run_root', 'plan_path', 'plan_sha256',
  'source_decision_fingerprint', 'executed_against_decision_fingerprint', 'executed_orbs', 'completed_at', 'result_decision_fingerprint',
  'result_decision_id',
])
const RECEIPT_PAYLOAD_KEYS = new Set([...RECEIPT_KEYS].filter((key) => key !== 'receipt_id'))
const RECEIPT_ORB_KEYS = new Set(['module', 'agent'])
const RECEIPT_FILE_RE = /^\d{8}T\d{6}(?:\d{3})?Z_[a-f0-9]{12}\.json$/

function exactKeys(value: Record<string, unknown>, keys: Set<string>): boolean {
  const actual = Object.keys(value)
  return actual.length === keys.size && actual.every((key) => keys.has(key))
}

function committedBytesEqual(repoPath: string, diskBytes: Buffer): boolean {
  try {
    const committed = execFileSync('git', ['-C', REPO_ROOT, 'show', `HEAD:${repoPath}`], {
      encoding: null,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 128 * 1024,
    })
    return Buffer.isBuffer(committed) && committed.equals(diskBytes)
  } catch {
    return false
  }
}

function committedBytes(repoPath: string): Buffer | null {
  try {
    const value = execFileSync('git', ['-C', REPO_ROOT, 'show', `HEAD:${repoPath}`], {
      encoding: null,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 2 * 1024 * 1024,
    })
    return Buffer.isBuffer(value) ? value : null
  } catch {
    return null
  }
}

function planHasCommittedAuthority(
  file: string,
  planPath: string,
  raw: Record<string, unknown>,
  planSha256: string,
): boolean {
  let diskBytes: Buffer
  try { diskBytes = fs.readFileSync(file) } catch { return false }
  if (raw.staged_for_scoped_rerun !== true) return committedBytesEqual(planPath, diskBytes)

  // A scoped staging copy is server-authored and deliberately uncommitted until its rerun succeeds. Its
  // authority is the exact raw source plan in HEAD: remove only the transport stamp and require canonical
  // equality/hash with that committed source. A watcher can therefore expose a retryable staged copy, but
  // never an uncommitted prompt-authored plan or arbitrarily edited staged bytes.
  if (typeof raw.run_root !== 'string') return false
  const sourcePath = `${raw.run_root}/intake/${path.basename(file)}`
  const sourceBytes = committedBytes(sourcePath)
  if (!sourceBytes) return false
  try {
    const source = JSON.parse(sourceBytes.toString('utf8'))
    if (!source || typeof source !== 'object' || Array.isArray(source) || source.staged_for_scoped_rerun !== undefined) return false
    const stagedAuthored = { ...raw }
    delete stagedAuthored.staged_for_scoped_rerun
    return intakePlanSha256(source) === planSha256 && canonicalJson(source) === canonicalJson(stagedAuthored)
  } catch {
    return false
  }
}

/**
 * Read append-only, content-addressed single-orb completion receipts. A candidate receipt is accepted only
 * when the receipts directory and file are real, direct descendants of this run, its schema is exact, its
 * self-hash and filename hash-prefix agree, and every claimed orb belongs to this exact plan. Structurally
 * valid receipts for another historical plan in the same run are ignored; a malformed/tampered candidate
 * fails this plan closed so corrupted proof can never reopen an already-paid command.
 */
function readExecutionReceipts(
  runRootAbs: string,
  identity: { swarm: string; subject: string; runRoot: string; planPath: string; planSha256: string; sourceDecisionFingerprint: string },
  commands: IntakeRerunCommand[],
): { receipts: ValidatedReceipt[]; unsafe: boolean } {
  const validPairs = new Set(commands.map((command) => `${command.module}\0${command.agent}`))
  let receiptDir: string
  let names: string[]
  try {
    const realRoot = fs.realpathSync(runRootAbs)
    const intakeDir = fs.realpathSync(path.join(realRoot, 'intake'))
    if (path.dirname(intakeDir) !== realRoot || path.basename(intakeDir) !== 'intake') return { receipts: [], unsafe: true }
    const requested = path.join(intakeDir, 'receipts')
    try {
      const requestedStat = fs.lstatSync(requested)
      if (requestedStat.isSymbolicLink() || !requestedStat.isDirectory()) return { receipts: [], unsafe: true }
    } catch (error: any) {
      if (error?.code === 'ENOENT') return { receipts: [], unsafe: false }
      return { receipts: [], unsafe: true }
    }
    receiptDir = fs.realpathSync(requested)
    if (path.dirname(receiptDir) !== intakeDir || path.basename(receiptDir) !== 'receipts' || !fs.statSync(receiptDir).isDirectory()) {
      return { receipts: [], unsafe: true }
    }
    names = fs.readdirSync(receiptDir).filter((name) => name.endsWith('.json'))
  } catch {
    return { receipts: [], unsafe: true }
  }

  const receipts: ValidatedReceipt[] = []
  for (const name of names) {
    if (!RECEIPT_FILE_RE.test(name)) return { receipts: [], unsafe: true }
    let raw: any
    try {
      const candidate = path.join(receiptDir, name)
      if (fs.lstatSync(candidate).isSymbolicLink() || !fs.statSync(candidate).isFile()) return { receipts: [], unsafe: true }
      const real = fs.realpathSync(candidate)
      if (path.dirname(real) !== receiptDir || path.basename(real) !== name || fs.statSync(real).size > 64 * 1024) {
        return { receipts: [], unsafe: true }
      }
      const bytes = fs.readFileSync(real)
      // A receipt written before a failed/interrupted commit is not completion proof. Requiring its exact
      // bytes in HEAD makes the proof atomic with commit-run.sh's run-data commit, with no process-local
      // state or timestamp heuristic.
      if (!committedBytesEqual(relativeToRepo(real), bytes)) return { receipts: [], unsafe: true }
      raw = JSON.parse(bytes.toString('utf8'))
    } catch {
      return { receipts: [], unsafe: true }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !exactKeys(raw, RECEIPT_KEYS)) {
      return { receipts: [], unsafe: true }
    }
    const payload: Record<string, unknown> = { ...raw }
    delete payload.receipt_id
    if (!exactKeys(payload, RECEIPT_PAYLOAD_KEYS)
        || raw.schema_version !== INTAKE_EXECUTION_RECEIPT_VERSION
        || typeof raw.receipt_id !== 'string' || !SHA256_RE.test(raw.receipt_id)
        || intakeExecutionReceiptId(payload as IntakeReceiptPayload) !== raw.receipt_id
        || !name.endsWith(`_${raw.receipt_id.slice(7, 19)}.json`)
        || typeof raw.swarm !== 'string' || !/^[a-z0-9-]{1,40}$/.test(raw.swarm)
        || typeof raw.subject !== 'string' || raw.subject.length < 1 || raw.subject.length > 160
        || typeof raw.run_root !== 'string' || raw.run_root.length < 1 || raw.run_root.length > 500
        || typeof raw.plan_path !== 'string' || raw.plan_path.length < 1 || raw.plan_path.length > 700
        || typeof raw.plan_sha256 !== 'string' || !SHA256_RE.test(raw.plan_sha256)
        || typeof raw.source_decision_fingerprint !== 'string' || !SHA256_RE.test(raw.source_decision_fingerprint)
        || typeof raw.executed_against_decision_fingerprint !== 'string' || !SHA256_RE.test(raw.executed_against_decision_fingerprint)
        || typeof raw.completed_at !== 'string' || !CANONICAL_UTC_RE.test(raw.completed_at)
        || !Number.isFinite(Date.parse(raw.completed_at))
        || typeof raw.result_decision_fingerprint !== 'string' || !SHA256_RE.test(raw.result_decision_fingerprint)
        || !(raw.result_decision_id === null || (typeof raw.result_decision_id === 'string' && /^[A-Za-z0-9._:-]{1,160}$/.test(raw.result_decision_id)))
        || !Array.isArray(raw.executed_orbs) || raw.executed_orbs.length < 1 || raw.executed_orbs.length > 64) {
      return { receipts: [], unsafe: true }
    }
    const seen = new Set<string>()
    for (const orb of raw.executed_orbs) {
      if (!orb || typeof orb !== 'object' || Array.isArray(orb) || !exactKeys(orb, RECEIPT_ORB_KEYS)
          || typeof orb.module !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(orb.module)
          || typeof orb.agent !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(orb.agent)) {
        return { receipts: [], unsafe: true }
      }
      const pair = `${orb.module}\0${orb.agent}`
      if (seen.has(pair)) return { receipts: [], unsafe: true }
      seen.add(pair)
    }

    // A run may hold receipts for multiple append-only plan versions. Only a receipt naming THIS exact
    // plan can consume its commands; unrelated, otherwise-valid receipts remain ordinary audit history.
    // Identity filtering deliberately precedes current-plan orb membership: a valid older plan can name an
    // orb that the newer plan does not, and that history must neither consume nor poison the newer plan.
    const related = raw.swarm === identity.swarm && raw.subject === identity.subject
      && raw.run_root === identity.runRoot && raw.plan_path === identity.planPath
      && raw.plan_sha256 === identity.planSha256
    if (!related) continue
    if (raw.source_decision_fingerprint !== identity.sourceDecisionFingerprint) {
      return { receipts: [], unsafe: true }
    }
    if (raw.executed_orbs.some((orb: { module: string; agent: string }) =>
      !validPairs.has(`${orb.module}\0${orb.agent}`))) return { receipts: [], unsafe: true }
    receipts.push(raw as ValidatedReceipt)
  }
  receipts.sort((a, b) => a.completed_at.localeCompare(b.completed_at) || a.receipt_id.localeCompare(b.receipt_id))
  let expected = identity.sourceDecisionFingerprint
  const executed = new Set<string>()
  for (const receipt of receipts) {
    if (receipt.executed_against_decision_fingerprint !== expected) return { receipts: [], unsafe: true }
    for (const orb of receipt.executed_orbs) {
      const pair = `${orb.module}\0${orb.agent}`
      if (executed.has(pair)) return { receipts: [], unsafe: true }
      executed.add(pair)
    }
    expected = receipt.result_decision_fingerprint
  }
  return { receipts, unsafe: false }
}

// Read + normalize the latest scoped rerun plan for a subject. Returns null when there is no resolved
// run, no plan yet, or the plan is unreadable/malformed (fail toward the honest floor, INTAKE.md §1).
export function readIntakePlan(subject: string, options: IntakeReadOptions = {}): IntakePlan | null {
  // Resolve the STANDING run — the newest one that actually decided — not the literal newest folder.
  // This has to match where `/research:intake` WRITES: that command is told to find "the latest FINISHED
  // run root" and to "skip over a newer but incomplete/failed run folder". This reader used
  // findLatestRunRoot, a lexical newest-`<TICKER>_*` pick with no completeness check, so a decision-less
  // shell (an aborted run that left only a couple of agent_metrics files) won the pick, its absent intake/
  // read as "no plan", and this returned null. Downstream that is indistinguishable from "nothing to do":
  // zero orbs lit, the New-data dock hidden, and the decision banner left offering only the blunt full
  // re-run — which is exactly what the feature exists to avoid. Writer and reader must agree on which
  // folder IS the run. preferComplete is the SAME standing-run pick the other display routes already use
  // (server.ts), so reuse it rather than teach a second definition of "the run" (CLAUDE.md §2).
  //
  // NOTE this is deliberately NOT the resolution latestPlanFileFor() above uses: that one serves the
  // scoped-rerun STAGING path, which copies the plan into the newer root it just staged and therefore
  // genuinely wants newest-wins. Display reads the standing run; staging reads the newest. Both correct.
  const context = resolveIntakeRunRoot(subject, options, true)
  if (!context) return null
  const { swarm, subject: safeSubject, root: runRootAbs, runRoot: selectedRunRoot } = context
  const file = latestPlanFile(runRootAbs)
  if (!file) return null

  let raw: any
  let mtime: string
  try {
    const stat = fs.statSync(file)
    mtime = stat.mtime.toISOString()
    raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null // malformed → show the blunt floor, never a fabricated plan
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  // Frozen routing identity: schema v1 calls the subject `ticker`; newer emitters may also carry explicit
  // subject/swarm fields. Every present identity must byte-match the manifest-normalized request. A copied
  // plan's raw run_root may intentionally name the run it invalidated, so that field is not an identity
  // authority — the server stamps the exact contained root it selected below.
  if (normalizeDataSubject(swarm.id, raw.ticker) !== safeSubject) return null
  if (raw.subject !== undefined && normalizeDataSubject(swarm.id, raw.subject) !== safeSubject) return null
  if (raw.swarm !== undefined && raw.swarm !== swarm.id) return null

  const planPath = relativeToRepo(file)
  const planSha256 = intakePlanSha256(raw)
  if (!planSha256) return null
  const planCommitted = planHasCommittedAuthority(file, planPath, raw, planSha256)
  const authoredDecisionFingerprint = typeof raw.decision_fingerprint === 'string' && SHA256_RE.test(raw.decision_fingerprint)
    ? raw.decision_fingerprint
    : null
  // Use the same effective-decision projection/fingerprint as the exact launch API (including research's
  // append-only correction projection). This is the authority that makes a raw plan actionable.
  const selectedDecisionFingerprint = readDataNeeds(swarm.id, safeSubject, selectedRunRoot)?.decision_fingerprint ?? null
  // A scoped batch copy lives in the NEW staging root but retains the source plan's authored `run_root`.
  // Its exact source decision remains the identity authority until the staged root finishes. This is the
  // one intentional exception to selected-root equality; it is available only with the server-authored
  // staging stamp and the claimed source must independently pass the same manifest/subject containment.
  const identityDecisionFingerprint = (() => {
    if (raw.staged_for_scoped_rerun !== true || typeof raw.run_root !== 'string' || raw.run_root === selectedRunRoot) {
      return selectedDecisionFingerprint
    }
    const source = exactRunRoot(swarm, safeSubject, raw.run_root)
    if (!source) return null
    return readDataNeeds(swarm.id, safeSubject, relativeToRepo(source))?.decision_fingerprint ?? null
  })()

  const rawPlan = raw.rerun_plan ?? {}
  // Evidence paths are untrusted prompt output. Validate every path before freshness/verdict work so one
  // cross-subject or traversal reference cannot survive as display text OR trigger a scoped command.
  if (Array.isArray(raw.new_docs)
      && raw.new_docs.some((doc: any) => normalizePoolEvidencePath(safeSubject, doc?.path) === null)) return null
  if (Array.isArray(rawPlan.commands)
      && rawPlan.commands.some((command: any) => Array.isArray(command?.triggered_by)
        && command.triggered_by.some((p: unknown) => normalizePoolEvidencePath(safeSubject, p) === null))) return null
  if (Array.isArray(rawPlan.note_only)
      && rawPlan.note_only.some((note: any) => normalizePoolEvidencePath(safeSubject, note?.path) === null)) return null

  const pool = intakePoolNewest(safeSubject, swarm.id)

  // ---- durable freshness witnesses (NEVER the plan file's mtime) ----
  // Plan files live under a Git-tracked runs tree; any checkout / clone / worktree / rebase / fresh-deploy
  // tree rewrites their mtime FORWARD to the operation time — always toward a falsely-fresh verdict — while
  // data/ mtimes are durable (gitignored). So freshness is judged against the plan's OWN recorded values,
  // which survive materialization: `scanned_at` (an ISO wall-clock the command stamps before it reads the
  // pool — precise) preferred, else the date-only `scan_date`. A future `scanned_at` is a prompt bug, not a
  // witness → discard it (fail closed).
  const nowMs = Date.now()
  const today = todayDate(new Date(nowMs))
  const scannedAtMs = (() => {
    const s = raw.scanned_at
    if (typeof s !== 'string' || !CANONICAL_UTC_RE.test(s)) return null
    const ms = Date.parse(s)
    if (!Number.isFinite(ms) || ms > nowMs) return null // a future stamp is a prompt/clock-skew bug → discard
    return ms
  })()
  const scanDate = String(raw.scan_date ?? '')
  const scanDateValid = validIsoDate(scanDate, today) !== null // a malformed/future scan_date is not a witness
  // The run's DURABLE vintage — read from a date-valued manifest template token (research's `{DATE}`),
  // which git cannot rewrite, unlike the folder's file mtimes. This is the same basis the staleness floor
  // uses. Never search arbitrary basename text: a singleton SUBJECT itself may contain YYYY-MM-DD.
  const runDate = (() => {
    const manifestDate = dateTokenFromRunRoot(swarm, safeSubject, runRootAbs, today)
    if (manifestDate) return manifestDate
    // Singleton run roots have no date in their folder name. Their terminal record's decision_date is
    // content (durable across checkout/rebase), so it can supply the same staleness-floor cross-check.
    try {
      const dr = readContainedDecision(runRootAbs)
      return validIsoDate(dr?.decision_date, today)
    } catch { return null }
  })()

  // Expire a stale SCOPED plan (never an empty one — those are served so the cockpit can nudge a re-analysis
  // rather than silently hiding): if the pool gained a file the analysis never saw, its scoping is missing
  // that document, so don't trust it (null → the honest floor, INTAKE.md §1). Date-granular / same-day
  // tolerant here (matching stalenessOf's convention) so a plan is not nulled the same day it was written;
  // the stricter bar is reserved for the user-facing affirmative below. Falls back to the (legacy,
  // non-durable) mtime date only when scan_date is somehow absent — never worse than the prior behaviour.
  const rawScoped = (Array.isArray(raw.new_docs) && raw.new_docs.length > 0) ||
    (Array.isArray(raw.rerun_plan?.commands) && raw.rerun_plan.commands.length > 0)
  const freshnessDate = scanDateValid ? scanDate : todayDate(new Date(mtime))
  if (rawScoped && pool.newestDate && pool.newestDate > freshnessDate) return null

  // Pool-currency proof for the affirmative "no new data — everything read and considered". Held to a
  // STRICTER, fail-safe bar than the scoped-trust decision above, because a false affirmative is the exact
  // failure mode this feature exists to prevent. It layers two DURABLE checks, and both must pass:
  //
  //  (1) witnessCurrent — nothing landed since the analysis READ the pool. Precise when `scanned_at` is
  //      present (a file whose newest timestamp is after the scan is unread); else date-granular and STRICT
  //      on `scan_date` (a same-day file counts as unread); else false (never affirm on an unprovable
  //      basis — old plans / deploy-skew). Uses dataPoolNewest's max(mtime, ctime) so a doc dropped with a
  //      preserved-older mtime (Google-Drive / cp -p / rsync -t materialise files with their ORIGINAL
  //      mtime) still trips it via its local ctime.
  //  (2) NOT floorStale — the DURABLE staleness floor agrees the pool has gained nothing dated after the
  //      RUN itself (pool.newestDate ≤ the run-folder date). This is the belt-and-suspenders the first fix
  //      missed: the intake COMMAND discovers new docs with `find -newer final_thesis.md`, and that
  //      watermark's mtime is rewritten forward by a git checkout exactly like the plan file's — so after
  //      materialisation the command can MISS a real post-run document and write an empty plan. If the floor
  //      disagrees, that empty plan cannot be trusted → withhold the affirmative, and never contradict the
  //      stale badges the constellation already shows for the same document.
  let witnessCurrent: boolean
  if (scannedAtMs !== null) witnessCurrent = !pool.newestMs || pool.newestMs <= scannedAtMs
  else if (scanDateValid) witnessCurrent = !pool.newestDate || pool.newestDate < scanDate
  else witnessCurrent = false
  // The cross-gate itself must be PROVABLE. A manifest whose root carries no date needs a valid terminal
  // `decision_date`; without either vintage, an empty prompt-written plan could have missed older files off
  // a Git-bumped watermark and there is no durable floor with which to catch the miss.
  const floorCurrent = runDate !== null && (!pool.newestDate || pool.newestDate <= runDate)
  const poolCurrent = witnessCurrent && floorCurrent

  // Consumed: this file is a copy `carryForwardScoped` staged into THIS root (stamped when it copied the
  // plan — see completion.ts), and the root has since actually finished. `finalDeliverablesPresent` proves
  // real completion, not merely presence-after-relaunch, which is exactly the distinction the copied plan
  // needs: a plan staged for a run still IN FLIGHT (root exists, deliverables don't yet) must stay live so
  // a retry after a failed launch can still find it (Codex #358 r3672400212's whole point).
  // A singleton swarm reruns in its existing root; its pre-existing decision_record alone cannot prove
  // that a plan's commands were consumed. Only the explicit staging stamp plus the copy-forward path's
  // complete deliverable pair can retire a plan.
  const scopedConsumed = raw.staged_for_scoped_rerun === true && finalDeliverablesPresent(runRootAbs)

  const moduleNames = new Set(listModuleNames(swarm.id))
  const agentsByModule = new Map<string, Set<string>>()
  const orbValid = (module: string, agent: string): boolean => {
    if (!moduleNames.has(module)) return false
    let set = agentsByModule.get(module)
    if (!set) {
      set = new Set(agentNamesForModule(module, swarm.id))
      agentsByModule.set(module, set)
    }
    return set.has(agent)
  }

  const widened: string[] = []
  if (!planCommitted) {
    widened.push('the intake plan bytes are not committed proof — wait for completion or re-analyze before any paid rerun')
  }
  if (!authoredDecisionFingerprint) {
    widened.push('legacy intake plan has no valid exact decision fingerprint — re-analyze new data before any paid rerun')
  } else if (!identityDecisionFingerprint) {
    widened.push('the plan decision can no longer be verified — re-analyze new data before any paid rerun')
  }

  // ---- validate new_docs[].entry_orbs (drop hallucinated names; note the widen) ----
  const newDocs: IntakeNewDoc[] = Array.isArray(raw.new_docs) ? raw.new_docs.map((d: any): IntakeNewDoc => {
    const entryOrbs: IntakeEntryOrb[] = Array.isArray(d?.entry_orbs) ? d.entry_orbs.filter((o: any) => {
      const ok = orbValid(String(o?.module), String(o?.agent))
      if (!ok) widened.push(`${d?.path ?? 'a document'}: dropped ${o?.module}/${o?.agent} (not in the roster) — widened to blanket-stale`)
      return ok
    }).map((o: any): IntakeEntryOrb => ({
      module: String(o.module),
      agent: String(o.agent),
      why: String(o.why ?? ''),
      confidence: typeof o.confidence === 'number' ? o.confidence : 0,
    })) : []
    return {
      path: normalizePoolEvidencePath(safeSubject, d?.path)!,
      sha256: d?.sha256 ?? null,
      provider: d?.provider ?? null,
      source_type: d?.source_type ?? null,
      tier: typeof d?.tier === 'number' ? d.tier : null,
      as_of: d?.as_of ?? null,
      claims_summary: String(d?.claims_summary ?? ''),
      materiality_score: typeof d?.materiality_score === 'number' ? d.materiality_score : 0,
      impact_direction: String(d?.impact_direction ?? 'neutral'),
      entry_orbs: entryOrbs,
    }
  }) : []

  // ---- validate + re-expand the rerun plan (authoritative cascade from the live DAG) ----
  const mappedCommands: IntakeRerunCommand[] = Array.isArray(rawPlan.commands) ? rawPlan.commands
    .filter((c: any) => {
      const ok = orbValid(String(c?.module), String(c?.agent))
      if (!ok) widened.push(`dropped command for ${c?.module}/${c?.agent} (not in the roster)`)
      return ok
    })
    .map((c: any): IntakeRerunCommand => {
      const module = String(c.module)
      const agent = String(c.agent)
      return {
        command: `/${swarm.commandNs}:rerun ${module} ${agent} ${safeSubject}`, // rebuilt from the manifest, never trusted from the file
        module,
        agent,
        cascade_modules: cascadeModulesFor(module, agent, swarm.id), // recomputed from the live DAG
        triggered_by: Array.isArray(c.triggered_by) ? c.triggered_by.map((p: unknown) => normalizePoolEvidencePath(safeSubject, p)!) : [],
      }
    }) : []
  const commandPairs = new Set<string>()
  const commands = mappedCommands.filter((command) => {
    const pair = `${command.module}\0${command.agent}`
    if (!commandPairs.has(pair)) { commandPairs.add(pair); return true }
    widened.push(`dropped duplicate command for ${command.module}/${command.agent}`)
    return false
  })

  const planEntryOrbs: { module: string; agent: string }[] = Array.isArray(rawPlan.entry_orbs)
    ? rawPlan.entry_orbs.filter((o: any) => orbValid(String(o?.module), String(o?.agent))).map((o: any) => ({ module: String(o.module), agent: String(o.agent) }))
    : []

  const receiptState = authoredDecisionFingerprint
    ? readExecutionReceipts(runRootAbs, {
      swarm: swarm.id,
      subject: safeSubject,
      runRoot: relativeToRepo(runRootAbs),
      planPath,
      planSha256,
      sourceDecisionFingerprint: authoredDecisionFingerprint,
    }, commands)
    : { receipts: [] as ValidatedReceipt[], unsafe: false }
  if (receiptState.unsafe) widened.push('an intake execution receipt is malformed or has been altered — re-analyze before any paid rerun')

  // Count only the contiguous receipt prefix whose resulting state is the current effective decision.
  // A later receipt on an abandoned/reverted branch remains audit history but cannot consume its orb in
  // the current call. Because such a branch means continuity is no longer linear, freeze the residual plan
  // until re-analysis instead of reopening any previously paid command.
  let chainState = authoredDecisionFingerprint
  let currentPrefixLength = chainState && chainState === identityDecisionFingerprint ? 0 : -1
  receiptState.receipts.forEach((receipt, index) => {
    chainState = receipt.result_decision_fingerprint
    if (chainState === identityDecisionFingerprint) currentPrefixLength = index + 1
  })
  const chainDiverged = currentPrefixLength >= 0 && currentPrefixLength < receiptState.receipts.length
  if (chainDiverged) {
    widened.push('the decision reverted behind a later intake receipt — re-analyze before any further paid rerun')
  }
  const currentReceipts = currentPrefixLength >= 0
    ? receiptState.receipts.slice(0, currentPrefixLength)
    : []
  const provedPairs = new Set(currentReceipts.flatMap((receipt) =>
    receipt.executed_orbs.map((orb: { module: string; agent: string }) => `${orb.module}\0${orb.agent}`)))
  // After a partial rerun, the current decision may differ from the plan's source. A valid receipt whose
  // result names the current exact decision proves continuity, so the plan's still-unexecuted orbs remain
  // actionable. An unrelated decision change has no such bridge and freezes the residual plan.
  const decisionCurrent = !!authoredDecisionFingerprint && !!identityDecisionFingerprint
    && currentPrefixLength >= 0 && !chainDiverged
  if (authoredDecisionFingerprint && identityDecisionFingerprint && !decisionCurrent) {
    widened.push('the decision changed after this intake plan and no valid receipt links it to the current call — re-analyze new data')
  }
  const receiptConsumed = commands.length > 0 && commands.every((command) => provedPairs.has(`${command.module}\0${command.agent}`))
  const consumed = scopedConsumed || receiptConsumed
  const actionable = planCommitted && !consumed && !receiptState.unsafe && decisionCurrent

  // A consumed plan remains visible for audit but has no executable commands. For a partially consumed
  // plan, filter exactly the proved orb(s); identical resulting decision bytes do not matter because the
  // receipt, rather than a fingerprint change, is the durable one-time-spend proof.
  const effectiveCommands = actionable
    ? commands.filter((command) => !provedPairs.has(`${command.module}\0${command.agent}`))
    : []
  const effectivePairs = new Set(effectiveCommands.map((command) => `${command.module}\0${command.agent}`))
  const effectiveEntryOrbs = effectiveCommands.length
    ? planEntryOrbs.filter((orb: { module: string; agent: string }) => effectivePairs.has(`${orb.module}\0${orb.agent}`))
    : []

  const rerunPlan: IntakeRerunPlan = {
    materiality_gate: typeof rawPlan.materiality_gate === 'number' ? rawPlan.materiality_gate : 60,
    entry_orbs: effectiveEntryOrbs,
    commands: effectiveCommands,
    note_only: Array.isArray(rawPlan.note_only) ? rawPlan.note_only.map((n: any) => ({ path: normalizePoolEvidencePath(safeSubject, n?.path)!, reason: String(n?.reason ?? '') })) : [],
  }

  // verdict is derived from the VALIDATED commands, not trusted from the file: if every command was
  // dropped as invalid, this is not a scoped rerun anymore.
  //   - A file-declared `insufficient` is preserved regardless of new_docs (it means "the run/data
  //     can't support a judgment", which new documents existing does not resolve).
  //   - Fail closed (INTAKE.md §1): if a command was dropped as invalid AND none survived AND a
  //     dropped document actually cleared the materiality gate, this is NOT a quiet "nothing to
  //     re-run" — a material recommendation was lost to a hallucinated name, so treat it the same as
  //     `insufficient` rather than silently reporting note_only.
  //   - A CONSUMED plan never falls into `insufficient` on this ground — its commands were withheld
  //     because they already ran, not because roster validation dropped anything material.
  const identityBlocked = !consumed && commands.length > 0 && !actionable
  const droppedMaterialCommand = !consumed && effectiveCommands.length === 0 && widened.length > 0 &&
    newDocs.some((d) => d.materiality_score >= rerunPlan.materiality_gate)
  const verdict: IntakePlan['verdict'] = effectiveCommands.length > 0
    ? 'scoped_rerun'
    : (raw.verdict === 'insufficient' || droppedMaterialCommand || identityBlocked ? 'insufficient' : 'note_only')

  return {
    schema_version: String(raw.schema_version ?? '1.0'),
    swarm: swarm.id,
    subject: safeSubject,
    ticker: safeSubject,
    run_root: relativeToRepo(runRootAbs),
    ...(authoredDecisionFingerprint ? { decision_fingerprint: authoredDecisionFingerprint } : {}),
    plan_path: planPath,
    plan_sha256: planSha256,
    actionable,
    scan_date: String(raw.scan_date ?? ''),
    scanned_at: scannedAtMs !== null ? new Date(scannedAtMs).toISOString() : undefined,
    watermark: raw.watermark ? String(raw.watermark) : undefined,
    new_docs: newDocs,
    rerun_plan: rerunPlan,
    verdict,
    summary: String(raw.summary ?? ''),
    analyzed_at: mtime,
    widened,
    pool_current: poolCurrent,
    consumed,
  }
}

/**
 * Re-read a receipt intent at a paid launch boundary. This is intentionally stricter than plan display:
 * the exact plan bytes, authored source decision and named orb must all still be live/actionable. A stale
 * UI confirmation therefore cannot turn a consumed plan command into an ordinary duplicate rerun.
 */
export function intakeReceiptIntentStillActionable(
  swarmId: string,
  subject: string,
  runRoot: string,
  module: string,
  agent: string,
  intent: IntakeReceiptIntent,
): boolean {
  const plan = readIntakePlan(subject, { swarmId, runRoot })
  return plan?.actionable === true
    && plan.widened.length === 0
    && plan.plan_path === intent.planPath
    && plan.plan_sha256 === intent.planSha256
    && plan.decision_fingerprint === intent.sourceDecisionFingerprint
    && plan.rerun_plan.commands.some((command) => command.module === module && command.agent === agent)
}
