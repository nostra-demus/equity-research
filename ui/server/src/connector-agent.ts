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
  connector_id?: string
}

/** One thing the coding agent just did — the live "what is happening right now" line the cockpit renders. */
export interface AgentStep {
  tool: string // the tool it called (Edit, Bash, Read, …), or 'say' for a line of its own prose
  target: string // the file / command / subject of that call, already shortened for display
}

// The human-readable subject of one coding-agent tool call. Deliberately narrow: it must never echo a whole
// command or file body into the cockpit, only enough to recognise the step.
export function stepTarget(tool: string, input: any): string {
  const short = (s: any, n = 90) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
  try {
    if (typeof input?.file_path === 'string') return short(input.file_path.split('/').slice(-3).join('/'))
    if (tool === 'Bash' && typeof input?.command === 'string') return short(input.command, 110)
    if (tool === 'WebFetch' && typeof input?.url === 'string') {
      try { return new URL(input.url).hostname } catch { return short(input.url) }
    }
    if (typeof input?.pattern === 'string') return short(input.pattern)
    if (typeof input?.description === 'string') return short(input.description)
  } catch { /* fall through to the bare tool name */ }
  return ''
}

/** Classify one stream-json line from the coding agent into display steps. Pure over its input. */
export function classifyAgentLine(o: any): AgentStep[] {
  if (!o || typeof o !== 'object' || o.type !== 'assistant' || o.error) return []
  const content = o.message?.content
  if (!Array.isArray(content)) return []
  const steps: AgentStep[] = []
  for (const b of content) {
    if (b?.type === 'tool_use' && typeof b.name === 'string') steps.push({ tool: b.name, target: stepTarget(b.name, b.input) })
    else if (b?.type === 'text' && typeof b.text === 'string' && b.text.trim()) {
      steps.push({ tool: 'say', target: b.text.replace(/\s+/g, ' ').trim().slice(0, 180) })
    }
  }
  return steps
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

const CONNECTOR_SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,120}$/
const slugOrUndefined = (v: any): string | undefined =>
  typeof v === 'string' && CONNECTOR_SLUG_RE.test(v) ? v : undefined

async function readOutcome(wt: string, branch: string, outcomeFile: string, env: NodeJS.ProcessEnv): Promise<WorktreeAgentResult> {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(wt, outcomeFile), 'utf8'))
    if (o && o.outcome === 'pr_open') {
      if (isValidPrUrl(o.pr_url)) return { outcome: 'pr_open', pr_url: o.pr_url, note: typeof o.note === 'string' ? o.note : '', connector_id: slugOrUndefined(o.connector_id) }
      return { outcome: 'assessed', note: 'Agent reported a PR but its URL was not a valid nostra-demus/equity-research pull request — recorded as assessed.' }
    }
    if (o && o.outcome === 'assessed') return { outcome: 'assessed', note: typeof o.note === 'string' ? o.note : '', connector_id: slugOrUndefined(o.connector_id) }
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
  onStep?: (s: AgentStep) => void // live progress: every tool call / line of prose, as it happens
}): Promise<WorktreeAgentResult> {
  const env = connectorChildEnv()
  const log = opts.log ?? (() => {})
  try {
    await createWorktree(opts.branch, opts.worktree)
    try { await execFileAsync('gh', ['auth', 'setup-git'], { cwd: opts.worktree, env }) } catch { /* gh may be absent; push then fails → assessed */ }
    const args = ['--print', opts.prompt, '--output-format', 'stream-json', '--verbose',
      '--permission-mode', 'bypassPermissions', '--model', DEFAULT_MODEL, '--max-turns', String(opts.maxTurns), '--max-budget-usd', String(opts.budgetUsd)]
    // stdout is TEE'd: the raw stream-json still lands in the worktree log (unchanged), and each line is also
    // parsed into a display step so the cockpit can show the build happening rather than a spinner. Parsing
    // never affects the run — a malformed line is skipped, and onStep is called inside a try.
    const logPath = path.join(opts.worktree, opts.logName)
    const logStream = fs.createWriteStream(logPath, { flags: 'a' })
    logStream.on('error', () => { /* a full/removed disk must not kill the build */ })
    const code: number = await new Promise((resolve) => {
      const child = spawn(CLAUDE_BIN, args, { cwd: opts.worktree, env, stdio: ['ignore', 'pipe', 'pipe'] })
      child.stderr?.on('error', () => {})
      child.stderr?.on('data', (c) => { logStream.write(c) })
      let buf = ''
      const handle = (line: string) => {
        const t = line.trim()
        if (!t) return
        let o: any
        try { o = JSON.parse(t) } catch { return }
        for (const step of classifyAgentLine(o)) { try { opts.onStep?.(step) } catch { /* a bad subscriber must not kill the build */ } }
      }
      child.stdout?.on('error', () => {})
      child.stdout?.setEncoding('utf8')
      child.stdout?.on('data', (chunk: string) => {
        logStream.write(chunk)
        buf += chunk
        let idx: number
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx)
          buf = buf.slice(idx + 1)
          handle(line)
        }
        if (buf.length > 1_000_000) buf = '' // a pathological unterminated line must not grow without bound
      })
      child.on('exit', (c) => { if (buf.trim()) handle(buf); resolve(c ?? -1) })
      child.on('error', (e) => { log(`spawn error on ${opts.branch}: ${e.message}`); resolve(-1) })
    })
    try { logStream.end() } catch { /* already closed */ }
    log(`agent on ${opts.branch} exited ${code}`)
    return await readOutcome(opts.worktree, opts.branch, opts.outcomeFile, env)
  } catch (e: any) {
    log(`worktree agent failed on ${opts.branch}: ${e?.message || e}`)
    return { outcome: 'assessed', note: `Run failed: ${e?.message || 'error'}` }
  } finally {
    await cleanupWorktree(opts.branch, opts.worktree)
  }
}
