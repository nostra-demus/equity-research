// Shared worktree coding-agent runner — the isolation + PR plumbing that BOTH the connector build
// (connector-dispatch.ts) and the auto-repair (connector-repair.ts) reuse, so the security-critical parts
// live in exactly one place. It runs a coding agent in a FRESH git worktree on a namespaced branch cut from
// origin/main (never the prod checkout, never main), authenticated with the fine-grained CODE_PR_TOKEN
// (never the §28 data identity — dropped by buildChildEnv), reads a deterministic outcome file (a PR URL is
// trusted only if it is a real PR on THIS repo), and tears the worktree down. Never throws to the caller.

import { spawn, execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { CLAUDE_BIN, CODE_PR_TOKEN, DEFAULT_MODEL, REPO_ROOT } from './config'
import { buildChildEnv, isValidPrUrl } from './feedback-dispatch'

const execFileAsync = promisify(execFile)

export interface WorktreeAgentResult {
  outcome: 'pr_open' | 'assessed'
  pr_url?: string
  note?: string
}

export function connectorChildEnv(): NodeJS.ProcessEnv {
  return buildChildEnv(process.env, CODE_PR_TOKEN)
}

async function git(args: string[], cwd: string, env?: NodeJS.ProcessEnv): Promise<void> {
  await execFileAsync('git', args, { cwd, env: env || process.env, maxBuffer: 8_000_000 })
}

/** Remove a worktree + its branch, best-effort (idempotent — safe if they don't exist). */
export async function cleanupWorktree(branch: string, wt: string): Promise<void> {
  try { await git(['worktree', 'remove', '--force', wt], REPO_ROOT) } catch { /* not registered */ }
  try { fs.rmSync(wt, { recursive: true, force: true }) } catch { /* already gone */ }
  try { await git(['worktree', 'prune'], REPO_ROOT) } catch { /* noop */ }
  try { await git(['branch', '-D', branch], REPO_ROOT) } catch { /* no local branch */ }
}

/** Create a fresh worktree on <branch> from origin/main. Returns the worktree path. */
async function createWorktree(branch: string, wt: string): Promise<void> {
  fs.mkdirSync(path.dirname(wt), { recursive: true })
  await cleanupWorktree(branch, wt) // clear any stale attempt
  await git(['fetch', 'origin', 'main', '--quiet'], REPO_ROOT)
  await git(['worktree', 'add', '-B', branch, wt, 'origin/main'], REPO_ROOT)
}

async function readOutcome(wt: string, branch: string, outcomeFile: string, env: NodeJS.ProcessEnv): Promise<WorktreeAgentResult> {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(wt, outcomeFile), 'utf8'))
    if (o && o.outcome === 'pr_open') {
      if (isValidPrUrl(o.pr_url)) return { outcome: 'pr_open', pr_url: o.pr_url, note: typeof o.note === 'string' ? o.note : '' }
      return { outcome: 'assessed', note: 'Agent reported a PR but its URL was not a valid nostra-demus/equity-research pull request — recorded as assessed.' }
    }
    if (o && o.outcome === 'assessed') return { outcome: 'assessed', note: typeof o.note === 'string' ? o.note : '' }
  } catch { /* no/invalid outcome file — fall back to detecting a PR */ }
  try {
    const { stdout } = await execFileAsync('gh', ['pr', 'list', '--head', branch, '--json', 'url', '--limit', '1'], { cwd: wt, env, maxBuffer: 4_000_000 })
    const arr = JSON.parse(stdout || '[]')
    if (Array.isArray(arr) && isValidPrUrl(arr[0]?.url)) return { outcome: 'pr_open', pr_url: arr[0].url, note: 'PR opened (outcome file missing).' }
  } catch { /* gh unavailable or no PR */ }
  return { outcome: 'assessed', note: 'The agent finished without opening a PR (no outcome file, no PR found).' }
}

/**
 * Run one coding agent in an isolated worktree and return its deterministic outcome. Never throws — a
 * worktree/spawn failure resolves to `assessed` with the error in the note. Cleans up the worktree always.
 */
export async function runWorktreeAgent(opts: {
  branch: string
  worktree: string // absolute worktree path (unique per task)
  prompt: string
  outcomeFile: string
  logName: string
  maxTurns: number
  budgetUsd: number
  log?: (m: string) => void
}): Promise<WorktreeAgentResult> {
  const env = connectorChildEnv()
  const log = opts.log ?? (() => {})
  try {
    await createWorktree(opts.branch, opts.worktree)
    try { await execFileAsync('gh', ['auth', 'setup-git'], { cwd: opts.worktree, env }) } catch { /* gh may be absent; push then fails → assessed */ }
    const args = ['--print', opts.prompt, '--output-format', 'stream-json', '--verbose',
      '--permission-mode', 'bypassPermissions', '--model', DEFAULT_MODEL, '--max-turns', String(opts.maxTurns), '--max-budget-usd', String(opts.budgetUsd)]
    const logPath = path.join(opts.worktree, opts.logName)
    const out = fs.openSync(logPath, 'a')
    const code: number = await new Promise((resolve) => {
      const child = spawn(CLAUDE_BIN, args, { cwd: opts.worktree, env, stdio: ['ignore', out, out] })
      child.on('exit', (c) => resolve(c ?? -1))
      child.on('error', (e) => { log(`spawn error on ${opts.branch}: ${e.message}`); resolve(-1) })
    })
    try { fs.closeSync(out) } catch { /* already closed */ }
    log(`agent on ${opts.branch} exited ${code}`)
    return await readOutcome(opts.worktree, opts.branch, opts.outcomeFile, env)
  } catch (e: any) {
    log(`worktree agent failed on ${opts.branch}: ${e?.message || e}`)
    return { outcome: 'assessed', note: `Run failed: ${e?.message || 'error'}` }
  } finally {
    await cleanupWorktree(opts.branch, opts.worktree)
  }
}
