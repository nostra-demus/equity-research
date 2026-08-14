// Validate a completed research publication from one immutable Git snapshot. This command is used at
// the two privileged data-write seams: commit-run reads the exact staged index, while saved recovery
// reads the exact source commit. It deliberately never consults the mutable worktree for run bytes.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { canonicalJsonText } from '../src/canonical-json'
import { validateCompletedIdeaPublication } from '../src/qualified-ideas-store'

const RUN_ROOT_RE = /^analyses\/[-A-Z0-9.]{1,24}_\d{4}-\d{2}-\d{2}$/
const COMMIT_RE = /^[a-f0-9]{40,64}$/
const READY_RE = /^## Publication\s*\n\s*ready for one path-confined commit\s*$/m
const MAX_BLOB_BYTES = 32 * 1024 * 1024
const MAX_TREE_BYTES = 128 * 1024 * 1024
const SHA256_RE = /^sha256:[a-f0-9]{64}$/
const STAGED_PLAN_RE = /^analyses\/[-A-Z0-9.]{1,24}_\d{4}-\d{2}-\d{2}\/intake\/(\d{4}-\d{2}-\d{2})_intake_plan(?:_v\d+)?\.json$/
const PAID_COMPLETION_ROLLOUT_DATE = '2026-08-14'
const PROJECTION_PAID_AUTHORITY_SCHEMA = 'research-projection-paid-authority/v1'

type Source = { kind: 'index' } | { kind: 'commit'; oid: string }
interface Entry { mode: string; type: 'blob' | 'tree' | 'commit' | null; oid: string; repoPath: string }

function git(repo: string, args: string[], encoding?: BufferEncoding): Buffer | string {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: encoding ?? 'buffer',
    maxBuffer: MAX_TREE_BYTES,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function decodePath(raw: Buffer): string {
  const decoded = new TextDecoder('utf-8', { fatal: true }).decode(raw)
  if (decoded.includes('\0') || decoded.includes('\\')) throw new Error('unsafe Git path')
  return decoded
}

function entriesFromIndex(repo: string, runRoot: string): Entry[] {
  const raw = git(repo, ['ls-files', '--stage', '-z', '--', runRoot]) as Buffer
  const entries: Entry[] = []
  for (const row of raw.subarray(0, raw.length && raw[raw.length - 1] === 0 ? raw.length - 1 : raw.length).toString('binary').split('\0')) {
    if (!row) continue
    const bytes = Buffer.from(row, 'binary')
    const tab = bytes.indexOf(0x09)
    if (tab < 0) throw new Error('malformed staged entry')
    const fields = bytes.subarray(0, tab).toString('ascii').split(' ')
    if (fields.length !== 3 || fields[2] !== '0') throw new Error('unmerged staged entry')
    entries.push({ mode: fields[0], type: null, oid: fields[1], repoPath: decodePath(bytes.subarray(tab + 1)) })
  }
  return entries
}

function entriesFromCommit(repo: string, commit: string, runRoot: string): Entry[] {
  git(repo, ['cat-file', '-e', `${commit}^{commit}`])
  const raw = git(repo, ['ls-tree', '-r', '-z', '--full-tree', commit, '--', runRoot]) as Buffer
  const entries: Entry[] = []
  for (const row of raw.subarray(0, raw.length && raw[raw.length - 1] === 0 ? raw.length - 1 : raw.length).toString('binary').split('\0')) {
    if (!row) continue
    const bytes = Buffer.from(row, 'binary')
    const tab = bytes.indexOf(0x09)
    if (tab < 0) throw new Error('malformed tree entry')
    const fields = bytes.subarray(0, tab).toString('ascii').split(' ')
    if (fields.length !== 3 || !['blob', 'tree', 'commit'].includes(fields[1])) throw new Error('malformed tree type')
    entries.push({ mode: fields[0], type: fields[1] as Entry['type'], oid: fields[2], repoPath: decodePath(bytes.subarray(tab + 1)) })
  }
  return entries
}

function requiresPaidCompletionProtocol(runRoot: string): boolean {
  const runDate = runRoot.slice(-10)
  return /^\d{4}-\d{2}-\d{2}$/.test(runDate) && runDate >= PAID_COMPLETION_ROLLOUT_DATE
}

function paidCompletionAuthorityIsValid(workspace: string, runRoot: string): boolean {
  const helper = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/research_paid_completion.py')
  try {
    const stdout = execFileSync('python3', [helper, '--repo-root', workspace,
      'projection-require-complete', runRoot], {
      encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    })
    const value = JSON.parse(stdout)
    return value?.schema_version === PROJECTION_PAID_AUTHORITY_SCHEMA
      && value?.status === 'complete' && value?.run_root === runRoot
  } catch { return false }
}

export function validateTerminalGitPublication(repoInput: string, source: Source, runRoot: string): boolean {
  if (!RUN_ROOT_RE.test(runRoot)) return false
  if (source.kind === 'commit' && !COMMIT_RE.test(source.oid)) return false
  let repo: string
  try {
    repo = String(git(repoInput, ['rev-parse', '--show-toplevel'], 'utf8')).trim()
    if (!repo || fs.realpathSync(repo) !== fs.realpathSync(repoInput)) return false
  } catch { return false }

  let entries: Entry[]
  try {
    entries = source.kind === 'index'
      ? entriesFromIndex(repo, runRoot)
      : entriesFromCommit(repo, source.oid, runRoot)
  } catch { return false }
  if (!entries.length) return false

  const prefix = `${runRoot}/`
  const seen = new Set<string>()
  let totalBytes = 0
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-terminal-publication.'))
  const runAbs = path.join(workspace, ...runRoot.split('/'))
  try {
    for (const entry of entries) {
      if (!entry.repoPath.startsWith(prefix) || seen.has(entry.repoPath)) return false
      seen.add(entry.repoPath)
      const relative = entry.repoPath.slice(prefix.length)
      const parts = relative.split('/')
      if (!relative || parts.some((part) => !part || part === '.' || part === '..')) return false
      // The terminal projection is direct-root authority plus the narrowly-scoped, content-addressed
      // diagnostic snapshots. Module, review, intake, and derived-memo trees remain separate authorities.
      // The Python completion validator needs these exact immutable snapshots to prove the diagnostic
      // transform/prewrite checkpoint before a post-rollout final audit can be accepted.
      const paidSnapshot = relative.startsWith('.completion_receipts/diagnostic-inputs/')
        || relative.startsWith('.completion_receipts/diagnostic-derived-outputs/')
      if (parts.length !== 1 && !paidSnapshot) continue
      if (entry.type !== null && entry.type !== 'blob') return false
      if (!['100644', '100755'].includes(entry.mode) || !/^[a-f0-9]{40,64}$/.test(entry.oid)) return false
      const bytes = git(repo, ['cat-file', 'blob', entry.oid]) as Buffer
      if (bytes.length > MAX_BLOB_BYTES || (totalBytes += bytes.length) > MAX_TREE_BYTES) return false
      const target = path.join(runAbs, ...parts)
      if (!target.startsWith(`${runAbs}${path.sep}`)) return false
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, bytes, { flag: 'wx' })
    }
    let metadata: string
    try {
      metadata = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(runAbs, 'RUN_METADATA.md')))
    } catch { return false }
    if (!READY_RE.test(metadata) || validateCompletedIdeaPublication(runAbs, runRoot) === null) return false
    // Missing seals are not evidence of legacy. The dated rollout is the explicit compatibility boundary:
    // every new publication must carry the paid diagnostic/final chain, while immutable pre-rollout calls
    // retain their historical projection validator.
    return !requiresPaidCompletionProtocol(runRoot) || paidCompletionAuthorityIsValid(workspace, runRoot)
  } catch {
    return false
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true })
  }
}

function jsonObject(bytes: Buffer): Record<string, unknown> | null {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    const value = JSON.parse(text)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null
  } catch { return null }
}

function planIdentity(value: Record<string, unknown>): string | null {
  try {
    const authored = { ...value }
    delete authored.staged_for_scoped_rerun
    return `sha256:${createHash('sha256').update(canonicalJsonText(authored), 'utf8').digest('hex')}`
  } catch { return null }
}

/**
 * Creation-time roster checks must not be re-run after a paid automatic scoped update has reached its
 * immutable terminal seal: the roster may legitimately have changed while that run was executing. This
 * exception is deliberately unavailable to ordinary/manual trees. The exact staged transport copy must
 * match an unstamped source plan already present in the shared Git authority, including its source call
 * fingerprint and subject identity. The terminal set itself is still validated from this exact index.
 */
export function validateAutomaticTerminalIndexRecovery(repoInput: string, runRoot: string): boolean {
  if (!validateTerminalGitPublication(repoInput, { kind: 'index' }, runRoot)) return false
  const match = RUN_ROOT_RE.exec(runRoot)
  if (!match) return false
  const subject = runRoot.slice('analyses/'.length, -11)
  let repo: string
  let entries: Entry[]
  let sharedCommit: string
  try {
    repo = String(git(repoInput, ['rev-parse', '--show-toplevel'], 'utf8')).trim()
    if (!repo || fs.realpathSync(repo) !== fs.realpathSync(repoInput)) return false
    entries = entriesFromIndex(repo, runRoot)
    const sharedRef = process.env.ENGINE_PUBLISHED_GIT_REF || 'refs/remotes/origin/main'
    sharedCommit = String(git(repo, ['rev-parse', '--verify', `${sharedRef}^{commit}`], 'utf8')).trim()
    if (!COMMIT_RE.test(sharedCommit)) return false
  } catch { return false }

  let proved = 0
  for (const entry of entries) {
    if (!STAGED_PLAN_RE.test(entry.repoPath) || !entry.repoPath.startsWith(`${runRoot}/intake/`)) continue
    if (entry.mode !== '100644' || !/^[a-f0-9]{40,64}$/.test(entry.oid)) return false
    let stagedBytes: Buffer
    try { stagedBytes = git(repo, ['cat-file', 'blob', entry.oid]) as Buffer } catch { return false }
    const staged = jsonObject(stagedBytes)
    const fingerprint = staged?.decision_fingerprint
    const sourceRoot = staged?.run_root
    if (!staged || staged.staged_for_scoped_rerun !== true || staged.swarm !== 'research'
        || (staged.subject !== subject && staged.ticker !== subject)
        || typeof sourceRoot !== 'string' || !new RegExp(`^analyses/${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_\\d{4}-\\d{2}-\\d{2}$`).test(sourceRoot)
        || typeof fingerprint !== 'string' || !SHA256_RE.test(fingerprint)) return false
    const sourcePath = `${sourceRoot}/intake/${path.posix.basename(entry.repoPath)}`
    let sourceBytes: Buffer
    try {
      const row = String(git(repo, ['ls-tree', sharedCommit, '--', sourcePath], 'utf8')).trim().split(/\s+/)
      if (row.length < 4 || row[0] !== '100644' || row[1] !== 'blob' || !COMMIT_RE.test(row[2])) return false
      sourceBytes = git(repo, ['cat-file', 'blob', row[2]]) as Buffer
    } catch { return false }
    const source = jsonObject(sourceBytes)
    if (!source || source.staged_for_scoped_rerun === true || source.run_root !== sourceRoot
        || source.decision_fingerprint !== fingerprint || source.swarm !== 'research'
        || (source.subject !== subject && source.ticker !== subject)
        || planIdentity(source) === null || planIdentity(source) !== planIdentity(staged)) return false
    proved++
  }
  return proved === 1
}

function usage(): never {
  process.stderr.write('usage: validate-terminal-publication.ts --repo <repo> (--index | --automatic-index | --commit <sha>) <analyses/run_root>\n')
  process.exit(2)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2)
  if (args[0] !== '--repo' || !args[1]) usage()
  const repo = args[1]
  let source: Source
  let runRoot: string
  let automaticIndex = false
  if (args[2] === '--index' && args.length === 4) {
    source = { kind: 'index' }
    runRoot = args[3]
  } else if (args[2] === '--automatic-index' && args.length === 4) {
    source = { kind: 'index' }
    runRoot = args[3]
    automaticIndex = true
  } else if (args[2] === '--commit' && args[3] && args.length === 5) {
    source = { kind: 'commit', oid: args[3] }
    runRoot = args[4]
  } else usage()
  if (automaticIndex
    ? !validateAutomaticTerminalIndexRecovery(repo, runRoot)
    : !validateTerminalGitPublication(repo, source, runRoot)) process.exit(1)
  process.stdout.write('TERMINAL_PUBLICATION_VALID=1\n')
}
