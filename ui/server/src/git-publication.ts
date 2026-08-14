import { execFile, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT } from './config'

const execFileAsync = promisify(execFile)

/** The shared research authority. Local HEAD can be ahead after a push outage or a dry-run; automatic
 * work must not call those private bytes complete because static clients and a failover host cannot see
 * them. Focused tests with an isolated repository may explicitly set ENGINE_PUBLISHED_GIT_REF=HEAD. */
export function publishedGitRef(): string {
  return process.env.ENGINE_PUBLISHED_GIT_REF || 'refs/remotes/origin/main'
}

/** Prove that the configured shared ref and its research tree exist before projecting an empty ledger. */
export function assertPublishedResearchAuthority(repoRoot = REPO_ROOT): void {
  try {
    const refType = execFileSync('git', ['-C', repoRoot, 'cat-file', '-t', `${publishedGitRef()}^{commit}`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    const analysesType = execFileSync('git', ['-C', repoRoot, 'cat-file', '-t', `${publishedGitRef()}:analyses`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    if (refType !== 'commit' || analysesType !== 'tree') throw new Error('invalid shared research tree')
  } catch (error: any) {
    throw Object.assign(new Error('shared Calls history cannot be read safely'), {
      code: 'CALLS_AUTHORITY_UNAVAILABLE', cause: error,
    })
  }
}

const SAFE_TREE_PATH_RE = /^(?:[A-Za-z0-9._-]+)(?:\/[A-Za-z0-9._-]+)*$/
const callsAuthorityError = (cause?: unknown): Error & { code: string; cause?: unknown } => Object.assign(
  new Error('shared Calls history cannot be read safely'),
  { code: 'CALLS_AUTHORITY_UNAVAILABLE', ...(cause === undefined ? {} : { cause }) },
)

/** Resolve the moving configured ref once. A Calls projection pins this OID so a concurrent fetch cannot
 * enumerate one tree and read another. */
export function publishedGitCommit(repoRoot = REPO_ROOT): string {
  try {
    const commit = execFileSync('git', ['-C', repoRoot, 'rev-parse', '--verify', `${publishedGitRef()}^{commit}`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    const type = execFileSync('git', ['-C', repoRoot, 'cat-file', '-t', commit], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    if (!/^[a-f0-9]{40,64}$/.test(commit) || type !== 'commit') throw new Error('invalid shared commit')
    return commit
  } catch (error) { throw callsAuthorityError(error) }
}

/** Enumerate regular blobs from one positively verified tree in the shared publication ref.
 *
 * This is the discovery half of the shared-authority contract. Comparing a local file with Git is not
 * enough: a fresh/static checkout may legitimately have no materialized file, while a dirty doer may
 * have a private extra directory. Both hosts must start from the same immutable tree and then read the
 * listed blobs with publishedBytes(). A missing/invalid ref or non-tree path is an authority failure,
 * never an empty result.
 */
export function publishedTreePaths(
  treePath = 'analyses',
  repoRoot = REPO_ROOT,
  revision = publishedGitCommit(repoRoot),
): string[] {
  if (!SAFE_TREE_PATH_RE.test(treePath) || treePath.split('/').some((part) => part === '.' || part === '..')) {
    throw Object.assign(new Error('shared Calls history cannot be read safely'), {
      code: 'CALLS_AUTHORITY_UNAVAILABLE',
    })
  }
  try {
    const refType = execFileSync('git', ['-C', repoRoot, 'cat-file', '-t', revision], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    const treeType = execFileSync('git', ['-C', repoRoot, 'cat-file', '-t', `${revision}:${treePath}`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    if (refType !== 'commit' || treeType !== 'tree') throw new Error('invalid shared research tree')
    const raw = execFileSync('git', ['-C', repoRoot, 'ls-tree', '-r', '-z', '--full-tree', revision, '--', treePath], {
      encoding: null, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024,
    })
    if (!Buffer.isBuffer(raw)) throw new Error('shared research tree was not readable')
    const prefix = `${treePath}/`
    const paths: string[] = []
    for (const row of raw.toString('utf8').split('\0').filter(Boolean)) {
      const match = /^(100644|100755) blob [a-f0-9]{40,64}\t(.+)$/.exec(row)
      if (!match) continue // trees contain only regular research blobs here; ignore gitlinks defensively
      const repoPath = match[2]
      if (!repoPath.startsWith(prefix) || repoPath.split('/').some((part) => !part || part === '.' || part === '..')) {
        throw new Error('shared research tree returned an unsafe path')
      }
      paths.push(repoPath)
    }
    return paths.sort()
  } catch (error: any) {
    if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
    throw Object.assign(new Error('shared Calls history cannot be read safely'), {
      code: 'CALLS_AUTHORITY_UNAVAILABLE', cause: error,
    })
  }
}

export interface PublishedTreeAuthority {
  commit: string
  paths: ReadonlySet<string>
  /** A path proven by this exact tree must remain readable. Object-store/read failure is an authority
   * outage, not absence: callers must not erase a call or turn a completed review back into “due”. */
  readRequired(repoPath: string): Buffer
}

/** One immutable, positively validated tree snapshot for a complete Calls projection. */
export function publishedTreeAuthority(treePath = 'analyses', repoRoot = REPO_ROOT): PublishedTreeAuthority {
  const commit = publishedGitCommit(repoRoot)
  const paths = new Set(publishedTreePaths(treePath, repoRoot, commit))
  return {
    commit,
    paths,
    readRequired(repoPath: string): Buffer {
      if (!paths.has(repoPath)) throw callsAuthorityError(new Error(`published blob is not in ${treePath}`))
      try {
        const value = execFileSync('git', ['-C', repoRoot, 'show', `${commit}:${repoPath}`], {
          encoding: null, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 8 * 1024 * 1024,
        })
        if (!Buffer.isBuffer(value)) throw new Error('published blob was not readable')
        return value
      } catch (error) { throw callsAuthorityError(error) }
    },
  }
}

export function publishedBytes(repoPath: string, repoRoot = REPO_ROOT): Buffer | null {
  if (!repoPath || repoPath.includes('\\') || repoPath.split('/').some((part) => !part || part === '.' || part === '..')) return null
  try {
    const value = execFileSync('git', ['-C', repoRoot, 'show', `${publishedGitRef()}:${repoPath}`], {
      encoding: null,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 4 * 1024 * 1024,
    })
    return Buffer.isBuffer(value) ? value : null
  } catch { return null }
}

export function publishedBytesEqual(repoPath: string, disk: Buffer | string, repoRoot = REPO_ROOT): boolean {
  try {
    const bytes = Buffer.isBuffer(disk) ? disk : fs.readFileSync(disk)
    const published = publishedBytes(repoPath, repoRoot)
    return !!published && published.equals(bytes)
  } catch { return false }
}

export function publishedResearchTerminalPair(runRoot: string, repoRoot = REPO_ROOT): boolean {
  if (!/^analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}$/.test(runRoot)) return false
  return publishedBytesEqual(`${runRoot}/decision_record.json`, path.join(repoRoot, runRoot, 'decision_record.json'), repoRoot)
    && publishedBytesEqual(`${runRoot}/final_thesis.md`, path.join(repoRoot, runRoot, 'final_thesis.md'), repoRoot)
}

const SAFE_COMMIT_RE = /^[a-f0-9]{40,64}$/
const NEVER_PUBLISH_TRAILER = 'Nostradamus-Publication: never'
const safePublicationPath = (value: string): boolean =>
  /^analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}(?:\/[A-Za-z0-9._\/-]+)?\/?$/.test(value)
  && !value.split('/').some((part) => part === '.' || part === '..')

const pathInside = (candidate: string, requested: string): boolean => {
  const root = requested.replace(/\/$/, '')
  return candidate === root || candidate.startsWith(`${root}/`)
}

export function localCommitChangedPaths(commit: string, repoRoot = REPO_ROOT): string[] {
  if (!SAFE_COMMIT_RE.test(commit)) return []
  try {
    const ancestry = execFileSync('git', ['-C', repoRoot, 'rev-list', '--parents', '-n', '1', commit], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim().split(/\s+/)
    if (ancestry.length !== 2) return []
    const changed = execFileSync('git', [
      '-C', repoRoot, 'diff-tree', '--no-commit-id', '--name-only', '-r', '-z', ancestry[1], commit,
    ], { encoding: null, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 4 * 1024 * 1024 })
    return Buffer.isBuffer(changed) ? changed.toString('utf8').split('\0').filter(Boolean) : []
  } catch { return [] }
}

function commitHasNeverPublishTrailer(commit: string, repoRoot = REPO_ROOT): boolean {
  if (!SAFE_COMMIT_RE.test(commit)) return true
  try {
    const message = execFileSync('git', ['-C', repoRoot, 'show', '-s', '--format=%B', commit], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    })
    return message.split(/\r?\n/).some((line) => line === NEVER_PUBLISH_TRAILER)
  } catch { return true } // unreadable local provenance can never authorize paid-result publication
}

function neverPublishCommitsAhead(repoRoot = REPO_ROOT): string[] {
  try {
    const commits = execFileSync('git', [
      '-C', repoRoot, 'rev-list', '--first-parent', 'HEAD', `^${publishedGitRef()}`,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 4 * 1024 * 1024 })
      .trim().split(/\s+/).filter((commit) => SAFE_COMMIT_RE.test(commit))
    return commits.filter((commit) => commitHasNeverPublishTrailer(commit, repoRoot))
  } catch { return [] }
}

function lineageContainsNeverPublish(
  commit: string,
  repoRoot = REPO_ROOT,
  marked = neverPublishCommitsAhead(repoRoot),
): boolean {
  return marked.some((candidate) => {
    if (candidate === commit) return true
    try {
      execFileSync('git', ['-C', repoRoot, 'merge-base', '--is-ancestor', candidate, commit], {
        stdio: ['ignore', 'ignore', 'ignore'], maxBuffer: 1024 * 1024,
      })
      return true
    } catch { return false }
  })
}

function sourceLineageContainsNeverPublish(commit: string, repoRoot = REPO_ROOT): boolean {
  try {
    const base = execFileSync('git', ['-C', repoRoot, 'merge-base', publishedGitRef(), commit], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    if (!SAFE_COMMIT_RE.test(base)) return true
    const commits = execFileSync('git', [
      '-C', repoRoot, 'rev-list', '--first-parent', `${base}..${commit}`,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 4 * 1024 * 1024 })
      .trim().split(/\s+/).filter(Boolean)
    return commits.some((candidate) => commitHasNeverPublishTrailer(candidate, repoRoot))
  } catch { return true }
}

/** Read one regular blob from a specific saved local commit. Worktree bytes are deliberately irrelevant. */
export function localCommitBytes(commit: string, repoPath: string, repoRoot = REPO_ROOT): Buffer | null {
  if (!SAFE_COMMIT_RE.test(commit) || !safePublicationPath(repoPath)) return null
  try {
    const row = execFileSync('git', ['-C', repoRoot, 'ls-tree', commit, '--', repoPath], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    const match = /^(100644|100755) blob ([a-f0-9]{40,64})\t(.+)$/.exec(row)
    if (!match || match[3] !== repoPath) return null
    const value = execFileSync('git', ['-C', repoRoot, 'cat-file', 'blob', match[2]], {
      encoding: null, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 8 * 1024 * 1024,
    })
    return Buffer.isBuffer(value) ? value : null
  } catch { return null }
}

/**
 * Find data-only commits saved locally after the shared ref. A terminal pair on disk is not proof: the
 * research command writes it before its final gates. A commit made by commit-run is the durable witness
 * that those gates finished. Candidates must be ordinary one-parent commits whose entire diff is confined
 * to the requested immutable research paths.
 */
export function localSavedResearchCommits(repoPaths: string[], repoRoot = REPO_ROOT): string[] {
  if (!repoPaths.length || repoPaths.some((value) => !safePublicationPath(value))) return []
  try {
    const output = execFileSync('git', [
      '-C', repoRoot, 'rev-list', '--first-parent', 'HEAD', `^${publishedGitRef()}`, '--', ...repoPaths,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 })
    const candidates: string[] = []
    const neverPublish = neverPublishCommitsAhead(repoRoot)
    for (const commit of output.trim().split(/\s+/).filter(Boolean)) {
      if (!SAFE_COMMIT_RE.test(commit)) continue
      if (lineageContainsNeverPublish(commit, repoRoot, neverPublish)) continue
      const names = localCommitChangedPaths(commit, repoRoot)
      if (!names.length || names.some((name) => !repoPaths.some((root) => pathInside(name, root)))) continue
      candidates.push(commit)
    }
    return candidates
  } catch { return [] }
}

const SAVED_REVIEW_PATH_RE = /^analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/reviews\/\d{4}-\d{2}-\d{2}_.+_(?:decision_review[^/]*\.json|memo_delta[^/]*\.md)$/

/** Review command commits use review-only globs and can validly save several due pairs in one commit. */
export function localSavedReviewCommits(repoRoot = REPO_ROOT): string[] {
  try {
    const output = execFileSync('git', [
      '-C', repoRoot, 'rev-list', '--first-parent', 'HEAD', `^${publishedGitRef()}`, '--', 'analyses',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 })
    const neverPublish = neverPublishCommitsAhead(repoRoot)
    return output.trim().split(/\s+/).filter((commit) => SAFE_COMMIT_RE.test(commit)).filter((commit) => {
      if (lineageContainsNeverPublish(commit, repoRoot, neverPublish)) return false
      const names = localCommitChangedPaths(commit, repoRoot)
      return names.length > 0 && names.every((name) => SAVED_REVIEW_PATH_RE.test(name))
    })
  } catch { return [] }
}

type PublicationRunner = (script: string, args: string[], cwd: string) => Promise<void>
let publicationRunner: PublicationRunner = async (script, args, cwd) => {
  await execFileAsync('bash', [script, ...args], { cwd, timeout: 20 * 60_000, maxBuffer: 4 * 1024 * 1024 })
}

/** Test seam for the publication-only recovery path. */
export function __setPublicationRunner(next: PublicationRunner): PublicationRunner {
  const previous = publicationRunner
  publicationRunner = next
  return previous
}

/** Publish already-produced research bytes without running a model again. The dedicated helper builds a
 * fresh, path-confined commit on shared main; it never pushes this checkout's branch or unrelated commits.
 * Callers must still verify their exact bytes through publishedBytesEqual afterward. */
export async function publishResearchPaths(
  message: string,
  repoPaths: string[],
  sourceCommit: string,
  repoRoot = REPO_ROOT,
): Promise<void> {
  if (!message.trim() || message.length > 180 || repoPaths.length < 1 || repoPaths.length > 8
      || !SAFE_COMMIT_RE.test(sourceCommit)) {
    throw new Error('invalid publication request')
  }
  if (sourceLineageContainsNeverPublish(sourceCommit, repoRoot)) {
    throw new Error('validation-only data is permanently non-publishable')
  }
  const realRepo = fs.realpathSync(repoRoot)
  const analysesStat = fs.lstatSync(path.join(repoRoot, 'analyses'))
  if (!analysesStat.isDirectory() || analysesStat.isSymbolicLink()) throw new Error('analyses authority is unsafe')
  const realAnalyses = fs.realpathSync(path.join(repoRoot, 'analyses'))
  const analysesFromRepo = path.relative(realRepo, realAnalyses)
  if (!analysesFromRepo || analysesFromRepo === '..' || analysesFromRepo.startsWith(`..${path.sep}`)
      || path.isAbsolute(analysesFromRepo)) throw new Error('analyses authority is unsafe')
  for (const rel of repoPaths) {
    if (!safePublicationPath(rel)) throw new Error('publication path is unsafe')
    // Publication bytes come exclusively from the immutable source commit. Requiring the same path to
    // still exist in the mutable checkout defeats crash/failover recovery after a cleanup and adds no
    // containment: the shell independently validates the lexical id, commit mode and per-path CAS.
    const target = rel.replace(/\/$/, '')
    if (rel.endsWith('/')) {
      if (publishedTreePaths(target, repoRoot, sourceCommit).length === 0) {
        throw new Error('saved publication tree is empty')
      }
    } else if (!localCommitBytes(sourceCommit, target, repoRoot)) {
      throw new Error('saved publication blob is unavailable')
    }
  }
  const script = path.join(repoRoot, 'scripts', 'publish-saved-research.sh')
  await publicationRunner(script, [message, '--source-commit', sourceCommit, '--', ...repoPaths], repoRoot)
}
