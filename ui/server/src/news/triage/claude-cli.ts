// The SUBSCRIPTION brain — the last-resort triage tier that costs no metered credits. When every FREE
// provider (Groq + the OpenAI-compatible overflow registry + the Gemini pool) is paced/capped/failing for
// a batch, it would otherwise DEFER, and on a sustained-overload day the deferred backlog overruns its
// 1,000-item cap and the low-priority tail is permanently dropped. This tier scores that spillover on the
// LOCAL `claude` CLI under the host keychain OAuth — the SAME subscription (and the same auth context:
// cwd=REPO_ROOT + childEnv()) the research runs and chat already use. No API key, ever.
//
// It speaks the EXACT same triage contract as the Groq/Gemini paths — same SYSTEM prompt, same batched
// user message, same coercion — so downstream (runCycle, ranking, themes) cannot tell which brain scored a
// batch. Only the transport differs: a one-shot `claude --print` completion instead of an HTTP call.
//
// The subscription is NOT free capacity: it is the same 5-hour / weekly plan pool the research runs draw
// from, so this tier is deliberately cheap and bounded — Haiku, `--tools ""`, `--max-turns 1` (one
// completion, no agentic loop), a per-call `--max-budget-usd`, and a caller-side daily $ ledger. When the
// plan itself is exhausted the CLI reports a usage-limit error; we surface it so the caller DEFERS and arms
// its cross-cycle cooldown (i.e. waits for the plan to reset instead of hammering it). Never throws.

import { execa } from 'execa'
import { CLAUDE_BIN, REPO_ROOT } from '../../config'
import { childEnv, detectFlags } from '../../launcher'
import type { NewsItem, Triage } from '../types'
import { buildUserMessage, coerceTriage, estimateTokens, SYSTEM, type TriageResult } from './groq'

export interface ClaudeCliTriageOptions {
  model: string
  timeoutMs?: number
  budgetUsd?: number // per-call --max-budget-usd guard (belt-and-braces; the daily ledger is the real bound)
}

/** One CLI completion. Returns the assistant text + the cost the CLI reported for it. Injectable for tests
 *  (the real one spawns a process; a test passes a fake). `error` set ⇒ the batch must be deferred. */
export type ClaudeCliRunner = (
  system: string,
  user: string,
  opts: ClaudeCliTriageOptions,
) => Promise<{ text: string; costUsd: number; error?: string }>

/** True when the CLI's failure is the plan's own quota being spent (not a bug) — the caller backs off
 *  until the plan resets rather than re-spawning every cycle. Mirrors chat-llm.ts's friendlyResultError. */
export function isUsageLimit(o: any): boolean {
  const text = typeof o?.result === 'string' ? o.result : ''
  return o?.api_error_status === 429 || /rate limit|overage|credit|usage limit/i.test(text)
}

/** The real runner: a one-shot `claude --print` under the host keychain OAuth. Mirrors chat-llm.ts's spawn
 *  exactly (cwd=REPO_ROOT, childEnv(), no --settings override) — that combination is what keeps the
 *  subscription auth working; a neutral cwd previously broke it (apiKeySource "none" → 401). */
export const defaultClaudeCliRunner: ClaudeCliRunner = async (system, user, opts) => {
  const flags = await detectFlags()
  const args: string[] = ['--print', '--output-format', 'stream-json', '--verbose']
  if (flags.has('--no-session-persistence')) args.push('--no-session-persistence')
  if (flags.has('--system-prompt')) args.push('--system-prompt', system)
  else if (flags.has('--append-system-prompt')) args.push('--append-system-prompt', system)
  // no tools + a single turn: this is a completion, not an agent — the cheapest possible draw on the plan
  if (flags.has('--tools')) args.push('--tools', '')
  else if (flags.has('--disallowed-tools')) args.push('--disallowed-tools', 'Bash Edit Write Read WebSearch WebFetch Task Glob Grep NotebookEdit')
  if (flags.has('--model')) args.push('--model', opts.model)
  if (flags.has('--max-turns')) args.push('--max-turns', '1')
  if (opts.budgetUsd && flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(opts.budgetUsd))
  if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')

  let child
  try {
    child = execa(CLAUDE_BIN, args, {
      cwd: REPO_ROOT, // match the research/chat spawn's auth context (host keychain OAuth)
      env: childEnv(), // news-provider secrets scrubbed; the keychain OAuth / subscription token kept
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      buffer: false,
      reject: false,
      timeout: opts.timeoutMs ?? 120_000,
    })
  } catch (e: any) {
    return { text: '', costUsd: 0, error: `could not start the claude CLI: ${e?.message || e}` }
  }
  // stdin can emit an ASYNC EPIPE if the child dies before reading (e.g. auth failure) — an unhandled
  // stream error would crash the whole server, so swallow it; the result event decides the outcome.
  child.stdin?.on('error', () => {})
  try { child.stdin?.write(user); child.stdin?.end() } catch { /* child may already be gone */ }

  let text = ''
  let costUsd = 0
  let error: string | undefined
  const handle = (line: string) => {
    const t = line.trim()
    if (!t) return
    let o: any
    try { o = JSON.parse(t) } catch { return }
    if (o.type === 'assistant') {
      if (o.error) return // synthetic auth/error message — the `result` event carries the real error
      const content = o.message?.content
      if (Array.isArray(content)) for (const b of content) if (b?.type === 'text' && typeof b.text === 'string') text += b.text
      return
    }
    if (o.type === 'result') {
      if (typeof o.total_cost_usd === 'number') costUsd = o.total_cost_usd
      if (o.is_error || o.api_error_status) {
        error = isUsageLimit(o)
          ? 'claude cli: usage limit reached — plan quota spent'
          : `claude cli: ${(typeof o.result === 'string' ? o.result : 'error').slice(0, 120)}`
      }
    }
  }

  let buf = ''
  child.stdout?.on('error', () => {})
  child.stderr?.on('error', () => {})
  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', (chunk: string) => {
    buf += chunk
    let idx: number
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx)
      buf = buf.slice(idx + 1)
      handle(line)
    }
  })
  let stderr = ''
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (c: string) => { stderr += c; if (stderr.length > 2000) stderr = stderr.slice(-2000) })

  let res: any
  try { res = await child } catch (e: any) { res = e }
  if (buf.trim()) handle(buf)
  if (res?.timedOut) return { text, costUsd, error: 'claude cli: timed out' }
  if (!error && !text.trim()) {
    const tail = (stderr || '').trim().slice(-160)
    error = tail ? `claude cli: no output (${tail})` : 'claude cli: no output'
  }
  return { text, costUsd, error }
}

/** Pull the first {…} or […] JSON blob out of a text response — the CLI is not in JSON mode, so the model
 *  can wrap the object in prose. Defensive twin of the JSON.parse fast path. */
function braceSlice(text: string): any {
  for (const [open, close] of [['{', '}'], ['[', ']']] as const) {
    const s = text.indexOf(open)
    const e = text.lastIndexOf(close)
    if (s >= 0 && e > s) {
      try { return JSON.parse(text.slice(s, e + 1)) } catch { /* try the other bracket */ }
    }
  }
  return null
}

/**
 * Triage one batch on the subscription CLI. Returns the same TriageResult shape as the free providers,
 * plus costUsd (what the CLI reported for this call — the figure the caller's daily $ ledger meters on).
 * On ok:false the caller treats the batch as UNSCORED (defer it), never scored-zero.
 */
export async function triageBatchClaudeCli(
  items: NewsItem[],
  opts: ClaudeCliTriageOptions,
  run: ClaudeCliRunner = defaultClaudeCliRunner,
): Promise<TriageResult & { costUsd: number }> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true, costUsd: 0 }

  const est = estimateTokens(items.length)
  let out: { text: string; costUsd: number; error?: string }
  try {
    out = await run(SYSTEM, buildUserMessage(items), opts)
  } catch (e: any) {
    // the runner is fail-soft by contract, but never let an unexpected throw kill the cycle
    return { byIndex, requests: 1, tokens: est, ok: false, note: `claude cli: ${e?.message || e}`, costUsd: 0 }
  }
  if (out.error) return { byIndex, requests: 1, tokens: est, ok: false, note: out.error, costUsd: out.costUsd }

  let parsed: any
  try { parsed = JSON.parse(out.text) } catch { parsed = braceSlice(out.text) }
  if (!parsed) return { byIndex, requests: 1, tokens: est, ok: false, note: 'claude cli: non-JSON content', costUsd: out.costUsd }
  const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
  for (const row of arr) {
    const i = Number(row?.i)
    if (Number.isInteger(i) && i >= 0 && i < items.length && !byIndex.has(i)) byIndex.set(i, coerceTriage(row))
  }
  return { byIndex, requests: 1, tokens: est, ok: true, costUsd: out.costUsd }
}
