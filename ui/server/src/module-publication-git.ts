import { execa } from 'execa'

const SHA_RE = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/

export interface CommitRunAttempt {
  exitCode?: unknown
  stdout?: unknown
}

export interface RetryBoundModulePublicationOptions {
  repoRoot: string
  script: string
  pathspecs: string[]
  helperAttempt: CommitRunAttempt | null | undefined
  noPush?: boolean
  timeoutMs?: number
}

function outputLines(value: unknown): string[] {
  return typeof value === 'string' ? value.split(/\r?\n/) : []
}

/** Only the data-commit helper's machine-readable stdout can authorize a retry. */
export function commitRunReceipt(attempt: CommitRunAttempt | null | undefined): {
  commitSha: string | null
  noop: boolean
} {
  const lines = outputLines(attempt?.stdout).map((line) => line.trim())
  const shas = [...new Set(lines
    .map((line) => /^COMMIT_SHA=([a-f0-9]{40}(?:[a-f0-9]{24})?)$/.exec(line)?.[1])
    .filter((value): value is string => !!value))]
  const helperReachedCommit = attempt?.exitCode === 0 || attempt?.exitCode === 4
  return {
    // Ambiguous output is not authority. A normal helper invocation emits at most one exact SHA.
    commitSha: helperReachedCommit && shas.length === 1 ? shas[0] : null,
    noop: attempt?.exitCode === 0 && lines.includes('NOOP=1'),
  }
}

function safePathspec(pathspec: string): boolean {
  // Git accepts both separators on Windows. All engine-owned pathspecs are canonical repo-relative POSIX
  // paths, so reject a backslash outright instead of normalising one attacker-controlled spelling for the
  // check and then passing a different spelling to Git.
  return !!pathspec && !pathspec.includes('\\') && !pathspec.startsWith('-') && !pathspec.startsWith('/')
    && !pathspec.includes('\0') && !pathspec.split('/').includes('..')
}

/**
 * Prove that retrying HEAD would publish the requested bytes, not merely whatever unrelated local commit
 * happens to be current. `git diff <sha>` covers tracked/index bytes; the two ls-files checks close Git's
 * untracked and ignored blind spots under each module path.
 */
export async function modulePathspecStateMatchesRevision(
  repoRoot: string,
  revision: string,
  pathspecs: string[],
  timeoutMs: number = 30_000,
): Promise<boolean> {
  if (!SHA_RE.test(revision) || !pathspecs.length || pathspecs.some((item) => !safePathspec(item))) return false
  try {
    const head = await execa('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot, timeout: Math.min(timeoutMs, 10_000), reject: false,
    })
    if (head.exitCode !== 0 || head.stdout.trim() !== revision) return false
    const diff = await execa('git', ['diff', '--quiet', revision, '--', ...pathspecs], {
      cwd: repoRoot, timeout: timeoutMs, reject: false,
    })
    if (diff.exitCode !== 0) return false
    const untracked = await execa('git', ['ls-files', '--others', '--exclude-standard', '--', ...pathspecs], {
      cwd: repoRoot, timeout: timeoutMs, reject: false,
    })
    if (untracked.exitCode !== 0 || untracked.stdout.trim()) return false
    const ignored = await execa('git', ['ls-files', '--others', '--ignored', '--exclude-standard', '--', ...pathspecs], {
      cwd: repoRoot, timeout: timeoutMs, reject: false,
    })
    return ignored.exitCode === 0 && !ignored.stdout.trim()
  } catch {
    return false
  }
}

/**
 * Retry only a commit proven to contain the current requested pathspec state. A failed helper that never
 * reached commit emits neither COMMIT_SHA nor a successful NOOP receipt, so an unrelated HEAD is never
 * pushed. A later publish-only click can recover a clean local-only target commit via its NOOP receipt.
 */
export async function retryBoundModulePublication(
  options: RetryBoundModulePublicationOptions,
): Promise<boolean> {
  if (options.noPush) return false
  const receipt = commitRunReceipt(options.helperAttempt)
  let candidate = receipt.commitSha
  const timeoutMs = options.timeoutMs ?? 20 * 60_000
  try {
    if (!candidate && receipt.noop) {
      const head = await execa('git', ['rev-parse', 'HEAD'], {
        cwd: options.repoRoot, timeout: Math.min(timeoutMs, 10_000), reject: false,
      })
      if (head.exitCode !== 0 || !SHA_RE.test(head.stdout.trim())) return false
      candidate = head.stdout.trim()
    }
    if (!candidate || !await modulePathspecStateMatchesRevision(
      options.repoRoot, candidate, options.pathspecs, Math.min(timeoutMs, 30_000),
    )) return false

    const retry = await execa('bash', [options.script, '--retry-push', candidate], {
      cwd: options.repoRoot, timeout: timeoutMs, reject: false,
    })
    return retry.exitCode === 0
  } catch {
    return false
  }
}
