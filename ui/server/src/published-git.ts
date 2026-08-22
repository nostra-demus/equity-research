import { execFileSync } from 'node:child_process'
import { REPO_ROOT } from './config'

const COMMIT_RE = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/
const SAFE_TREE_PATH_RE = /^(?:[A-Za-z0-9._-]+)(?:\/[A-Za-z0-9._-]+)*$/
const MAX_AUTHORITY_BLOB_BYTES = 8 * 1024 * 1024
const MAX_AUTHORITY_BATCH_BYTES = 96 * 1024 * 1024
const COMMIT_CACHE_MS = 15_000
const MAX_TREE_ENTRY_CACHES = 8

const commitCache = new Map<string, { commit: string; expiresAt: number }>()

const authorityError = (cause?: unknown): Error & { code: string; cause?: unknown } => Object.assign(
  new Error('shared Calls history cannot be read safely'),
  { code: 'CALLS_AUTHORITY_UNAVAILABLE', ...(cause === undefined ? {} : { cause }) },
)

/**
 * The shared research authority. A doer's local HEAD may be ahead after a push outage, while a static
 * host may have no materialized analyses tree. Both must project Calls from the same published commit.
 * Focused snapshot tests may explicitly use HEAD.
 */
export function publishedGitRef(): string {
  return process.env.ENGINE_PUBLISHED_GIT_REF || 'refs/remotes/origin/main'
}

/** Resolve the moving ref once so one projection cannot mix files from two fetches. */
export function publishedGitCommit(repoRoot = REPO_ROOT): string {
  const ref = publishedGitRef()
  const cacheKey = `${repoRoot}\u0000${ref}`
  const cached = commitCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.commit
  try {
    // `^{commit}` peels tags and fails unless the result is a commit; a second `cat-file -t` process is
    // redundant. The short cache matches the cockpit's poll interval and bounds synchronous Git work.
    const commit = execFileSync('git', ['-C', repoRoot, 'rev-parse', '--verify', `${ref}^{commit}`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    }).trim()
    if (!COMMIT_RE.test(commit)) throw new Error('invalid shared commit')
    commitCache.set(cacheKey, { commit, expiresAt: Date.now() + COMMIT_CACHE_MS })
    return commit
  } catch (error) {
    throw authorityError(error)
  }
}

interface PublishedTreeEntry {
  oid: string
  size: number
}

const treeEntriesCache = new Map<string, Map<string, PublishedTreeEntry>>()

function rememberTreeEntries(key: string, entries: Map<string, PublishedTreeEntry>): void {
  if (treeEntriesCache.size >= MAX_TREE_ENTRY_CACHES) {
    const oldest = treeEntriesCache.keys().next().value
    if (oldest !== undefined) treeEntriesCache.delete(oldest)
  }
  treeEntriesCache.set(key, entries)
}

function safeTreePath(value: string): boolean {
  return SAFE_TREE_PATH_RE.test(value) && !value.split('/').some((part) => part === '.' || part === '..')
}

function publishedTreeEntries(
  treePath: string,
  repoRoot: string,
  revision: string,
): Map<string, PublishedTreeEntry> {
  if (!safeTreePath(treePath) || !COMMIT_RE.test(revision)) throw authorityError()
  const cacheKey = `${repoRoot}\u0000${revision}\u0000${treePath}`
  const cached = treeEntriesCache.get(cacheKey)
  if (cached) {
    // Refresh the bounded insertion order so frequently used production trees outlive one-off test repos.
    treeEntriesCache.delete(cacheKey)
    treeEntriesCache.set(cacheKey, cached)
    return cached
  }
  try {
    // `ls-tree` verifies the revision is tree-ish. A missing/non-tree research path yields no regular
    // blobs and is rejected below, so separate commit/tree type probes only add event-loop stalls.
    const raw = execFileSync('git', [
      '-C', repoRoot, 'ls-tree', '-r', '-l', '-z', '--full-tree', revision, '--', treePath,
    ], { encoding: null, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024 })
    if (!Buffer.isBuffer(raw)) throw new Error('shared research tree was not readable')

    const prefix = `${treePath}/`
    const entries = new Map<string, PublishedTreeEntry>()
    for (const row of raw.toString('utf8').split('\0').filter(Boolean)) {
      const match = /^(100644|100755) blob ([a-f0-9]{40}(?:[a-f0-9]{24})?)\s+(\d+)\t(.+)$/.exec(row)
      if (!match) continue // ignore trees, symlinks and gitlinks defensively
      const repoPath = match[4]
      if (!repoPath.startsWith(prefix) || !safeTreePath(repoPath)) {
        throw new Error('shared research tree returned an unsafe path')
      }
      const size = Number(match[3])
      if (!Number.isSafeInteger(size) || size < 0) throw new Error('shared research blob has an invalid size')
      entries.set(repoPath, { oid: match[2], size })
    }
    if (!entries.size) throw new Error('shared research tree is missing or empty')
    rememberTreeEntries(cacheKey, entries)
    return entries
  } catch (error: any) {
    if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
    throw authorityError(error)
  }
}

/** Enumerate regular blobs from one positively verified published tree. */
export function publishedTreePaths(
  treePath = 'analyses',
  repoRoot = REPO_ROOT,
  revision = publishedGitCommit(repoRoot),
): string[] {
  return [...publishedTreeEntries(treePath, repoRoot, revision).keys()].sort()
}

export interface PublishedTreeAuthority {
  commit: string
  paths: ReadonlySet<string>
  readRequired(repoPath: string): Buffer
  readManyRequired(repoPaths: Iterable<string>): ReadonlyMap<string, Buffer>
}

/**
 * Build one immutable Calls snapshot. Requested blobs are read through one `git cat-file --batch` call,
 * avoiding a child process per decision/review on the 15-second Calls poll path.
 */
export function publishedTreeAuthority(
  treePath = 'analyses',
  repoRoot = REPO_ROOT,
  commit = publishedGitCommit(repoRoot),
): PublishedTreeAuthority {
  if (!COMMIT_RE.test(commit)) throw authorityError()
  const entries = publishedTreeEntries(treePath, repoRoot, commit)
  const paths = new Set(entries.keys())
  const cache = new Map<string, Buffer>()

  const readManyRequired = (requested: Iterable<string>): ReadonlyMap<string, Buffer> => {
    const repoPaths = [...new Set(requested)]
    for (const repoPath of repoPaths) {
      if (!paths.has(repoPath)) throw authorityError(new Error(`published blob is not in ${treePath}`))
    }

    const uncached = repoPaths.filter((repoPath) => !cache.has(repoPath))
    if (uncached.length) {
      const oidToPaths = new Map<string, string[]>()
      for (const repoPath of uncached) {
        const entry = entries.get(repoPath)!
        if (entry.size > MAX_AUTHORITY_BLOB_BYTES) {
          throw authorityError(new Error('shared Calls artifact is too large to read safely'))
        }
        const aliases = oidToPaths.get(entry.oid) || []
        aliases.push(repoPath)
        oidToPaths.set(entry.oid, aliases)
      }
      const oids = [...oidToPaths.keys()]
      const totalBytes = oids.reduce((sum, oid) => sum + entries.get(oidToPaths.get(oid)![0])!.size, 0)
      if (totalBytes > MAX_AUTHORITY_BATCH_BYTES) {
        throw authorityError(new Error('shared Calls projection is too large to read safely'))
      }

      try {
        const raw = execFileSync('git', ['-C', repoRoot, 'cat-file', '--batch'], {
          input: `${oids.join('\n')}\n`, encoding: null, stdio: ['pipe', 'pipe', 'ignore'],
          maxBuffer: totalBytes + Math.max(1024 * 1024, oids.length * 160),
        })
        if (!Buffer.isBuffer(raw)) throw new Error('shared research blobs were not readable')
        let cursor = 0
        for (const expectedOid of oids) {
          const headerEnd = raw.indexOf(0x0a, cursor)
          if (headerEnd < 0) throw new Error('truncated shared research batch header')
          const header = raw.subarray(cursor, headerEnd).toString('utf8')
          const match = /^([a-f0-9]{40}(?:[a-f0-9]{24})?) blob (\d+)$/.exec(header)
          if (!match || match[1] !== expectedOid) throw new Error('shared research batch returned another object')
          const size = Number(match[2])
          const entrySize = entries.get(oidToPaths.get(expectedOid)![0])!.size
          if (!Number.isSafeInteger(size) || size !== entrySize) throw new Error('shared research blob size changed')
          const bodyStart = headerEnd + 1
          const bodyEnd = bodyStart + size
          if (bodyEnd >= raw.length || raw[bodyEnd] !== 0x0a) throw new Error('truncated shared research blob')
          const bytes = Buffer.from(raw.subarray(bodyStart, bodyEnd))
          for (const repoPath of oidToPaths.get(expectedOid)!) cache.set(repoPath, bytes)
          cursor = bodyEnd + 1
        }
        if (cursor !== raw.length) throw new Error('shared research batch returned unexpected bytes')
      } catch (error) {
        throw authorityError(error)
      }
    }

    return new Map(repoPaths.map((repoPath) => [repoPath, cache.get(repoPath)!]))
  }

  return {
    commit,
    paths,
    readManyRequired,
    readRequired(repoPath: string): Buffer {
      return readManyRequired([repoPath]).get(repoPath)!
    },
  }
}
