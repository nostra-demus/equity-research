import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { REPO_ROOT } from './config'

const execFileAsync = promisify(execFile)

const COMMIT_RE = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/
const SAFE_TREE_PATH_RE = /^(?:[A-Za-z0-9._-]+)(?:\/[A-Za-z0-9._-]+)*$/
const MAX_AUTHORITY_BLOB_BYTES = 8 * 1024 * 1024
const MAX_AUTHORITY_BATCH_BYTES = 96 * 1024 * 1024
const COMMIT_CACHE_MS = 15_000
const MAX_TREE_ENTRY_CACHES = 8

const commitCache = new Map<string, { commit: string; expiresAt: number }>()
const commitInflight = new Map<string, Promise<string>>()

const authorityError = (cause?: unknown): Error & { code: string; cause?: unknown } => Object.assign(
  new Error('shared Calls history cannot be read safely'),
  { code: 'CALLS_AUTHORITY_UNAVAILABLE', ...(cause === undefined ? {} : { cause }) },
)

function catFileBatch(repoRoot: string, oids: string[], maxBuffer: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['-C', repoRoot, 'cat-file', '--batch'], {
      stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, timeout: 15_000,
    })
    const chunks: Buffer[] = []
    let size = 0
    let settled = false
    const fail = (error: unknown) => {
      if (settled) return
      settled = true
      child.kill()
      reject(error)
    }
    child.once('error', fail)
    child.stdin.once('error', fail)
    child.stdout.once('error', fail)
    child.stdout.on('data', (chunk: Buffer | Uint8Array) => {
      if (settled) return
      const bytes = Buffer.from(chunk)
      size += bytes.length
      if (size > maxBuffer) return fail(new Error('shared research batch exceeded its byte limit'))
      chunks.push(bytes)
    })
    child.once('close', (code) => {
      if (settled) return
      settled = true
      if (code !== 0) return reject(new Error('shared research blobs were not readable'))
      resolve(Buffer.concat(chunks, size))
    })
    child.stdin.end(`${oids.join('\n')}\n`)
  })
}

/**
 * The shared research authority. A doer's local HEAD may be ahead after a push outage, while a static
 * host may have no materialized analyses tree. Both must project Calls from the same published commit.
 * Focused snapshot tests may explicitly use HEAD.
 */
export function publishedGitRef(): string {
  return process.env.ENGINE_PUBLISHED_GIT_REF || 'refs/remotes/origin/main'
}

/** Resolve the moving ref once so one projection cannot mix files from two fetches. */
export async function publishedGitCommit(repoRoot = REPO_ROOT): Promise<string> {
  const ref = publishedGitRef()
  const cacheKey = `${repoRoot}\u0000${ref}`
  const cached = commitCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.commit
  const existing = commitInflight.get(cacheKey)
  if (existing) return existing
  const resolving = (async () => {
    try {
      // `^{commit}` peels tags and fails unless the result is a commit; a second type probe is redundant.
      const { stdout } = await execFileAsync('git', ['-C', repoRoot, 'rev-parse', '--verify', `${ref}^{commit}`], {
        encoding: 'utf8', windowsHide: true, timeout: 15_000, maxBuffer: 1024 * 1024,
      })
      const commit = stdout.trim()
      if (!COMMIT_RE.test(commit)) throw new Error('invalid shared commit')
      commitCache.set(cacheKey, { commit, expiresAt: Date.now() + COMMIT_CACHE_MS })
      return commit
    } catch (error) {
      throw authorityError(error)
    } finally {
      commitInflight.delete(cacheKey)
    }
  })()
  commitInflight.set(cacheKey, resolving)
  return resolving
}

interface PublishedTreeEntry {
  oid: string
  size: number
}

const treeEntriesCache = new Map<string, Map<string, PublishedTreeEntry>>()
const treeEntriesInflight = new Map<string, Promise<Map<string, PublishedTreeEntry>>>()

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

async function publishedTreeEntries(
  treePath: string,
  repoRoot: string,
  revision: string,
): Promise<Map<string, PublishedTreeEntry>> {
  if (!safeTreePath(treePath) || !COMMIT_RE.test(revision)) throw authorityError()
  const cacheKey = `${repoRoot}\u0000${revision}\u0000${treePath}`
  const cached = treeEntriesCache.get(cacheKey)
  if (cached) {
    // Refresh the bounded insertion order so frequently used production trees outlive one-off test repos.
    treeEntriesCache.delete(cacheKey)
    treeEntriesCache.set(cacheKey, cached)
    return cached
  }
  const existing = treeEntriesInflight.get(cacheKey)
  if (existing) return existing
  const loading = (async () => {
    try {
      // `ls-tree` verifies the revision is tree-ish. Missing/non-tree paths yield no regular blobs and
      // are rejected below. The async subprocess keeps cold Calls reads off the server event loop.
      const { stdout } = await execFileAsync('git', [
        '-C', repoRoot, 'ls-tree', '-r', '-l', '-z', '--full-tree', revision, '--', treePath,
      ], { encoding: null, windowsHide: true, timeout: 15_000, maxBuffer: 32 * 1024 * 1024 })
      if (!Buffer.isBuffer(stdout)) throw new Error('shared research tree was not readable')
      const raw = stdout
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
    } finally {
      treeEntriesInflight.delete(cacheKey)
    }
  })()
  treeEntriesInflight.set(cacheKey, loading)
  return loading
}

/** Enumerate regular blobs from one positively verified published tree. */
export async function publishedTreePaths(
  treePath = 'analyses',
  repoRoot = REPO_ROOT,
  revision?: string,
): Promise<string[]> {
  const commit = revision ?? await publishedGitCommit(repoRoot)
  return [...(await publishedTreeEntries(treePath, repoRoot, commit)).keys()].sort()
}

export interface PublishedTreeAuthority {
  commit: string
  paths: ReadonlySet<string>
  readRequired(repoPath: string): Buffer
  loadRequired(repoPaths: Iterable<string>): Promise<void>
}

/**
 * Build one immutable Calls snapshot. Requested blobs are read through one `git cat-file --batch` call,
 * avoiding a child process per decision/review on the 15-second Calls poll path.
 */
export async function publishedTreeAuthority(
  treePath = 'analyses',
  repoRoot = REPO_ROOT,
  requestedCommit?: string,
): Promise<PublishedTreeAuthority> {
  const commit = requestedCommit ?? await publishedGitCommit(repoRoot)
  if (!COMMIT_RE.test(commit)) throw authorityError()
  const entries = await publishedTreeEntries(treePath, repoRoot, commit)
  const paths = new Set(entries.keys())
  const cache = new Map<string, Buffer>()

  const loadRequired = async (requested: Iterable<string>): Promise<void> => {
    const repoPaths = [...new Set(requested)]
    for (const repoPath of repoPaths) {
      if (!paths.has(repoPath)) throw authorityError(new Error(`published blob is not in ${treePath}`))
    }

    const uncached = repoPaths.filter((repoPath) => !cache.has(repoPath))
    if (uncached.length) {
      const oidToPaths = new Map<string, string[]>()
      let totalBytes = 0
      for (const repoPath of uncached) {
        const entry = entries.get(repoPath)
        if (!entry) throw authorityError(new Error(`published blob is not in ${treePath}`))
        if (entry.size > MAX_AUTHORITY_BLOB_BYTES) {
          throw authorityError(new Error('shared Calls artifact is too large to read safely'))
        }
        const aliases = oidToPaths.get(entry.oid) || []
        if (!aliases.length) totalBytes += entry.size
        aliases.push(repoPath)
        oidToPaths.set(entry.oid, aliases)
      }
      const oids = [...oidToPaths.keys()]
      if (totalBytes > MAX_AUTHORITY_BATCH_BYTES) {
        throw authorityError(new Error('shared Calls projection is too large to read safely'))
      }

      try {
        const raw = await catFileBatch(
          repoRoot,
          oids,
          totalBytes + Math.max(1024 * 1024, oids.length * 160),
        )
        let cursor = 0
        for (const expectedOid of oids) {
          const headerEnd = raw.indexOf(0x0a, cursor)
          if (headerEnd < 0) throw new Error('truncated shared research batch header')
          const header = raw.subarray(cursor, headerEnd).toString('utf8')
          const match = /^([a-f0-9]{40}(?:[a-f0-9]{24})?) blob (\d+)$/.exec(header)
          if (!match || match[1] !== expectedOid) throw new Error('shared research batch returned another object')
          const size = Number(match[2])
          const aliases = oidToPaths.get(expectedOid)
          if (!aliases?.length) throw new Error('shared research batch returned an unexpected object')
          const entry = entries.get(aliases[0])
          if (!entry) throw new Error('shared research batch returned an unknown object')
          const entrySize = entry.size
          if (!Number.isSafeInteger(size) || size !== entrySize) throw new Error('shared research blob size changed')
          const bodyStart = headerEnd + 1
          const bodyEnd = bodyStart + size
          if (bodyEnd >= raw.length || raw[bodyEnd] !== 0x0a) throw new Error('truncated shared research blob')
          const bytes = Buffer.from(raw.subarray(bodyStart, bodyEnd))
          for (const repoPath of aliases) cache.set(repoPath, bytes)
          cursor = bodyEnd + 1
        }
        if (cursor !== raw.length) throw new Error('shared research batch returned unexpected bytes')
      } catch (error) {
        throw authorityError(error)
      }
    }
    for (const repoPath of repoPaths) {
      if (!cache.has(repoPath)) throw authorityError(new Error('shared research batch omitted a requested blob'))
    }
  }

  return {
    commit,
    paths,
    loadRequired,
    readRequired(repoPath: string): Buffer {
      const bytes = cache.get(repoPath)
      if (bytes === undefined) throw authorityError(new Error('published blob was not loaded'))
      return bytes
    },
  }
}
