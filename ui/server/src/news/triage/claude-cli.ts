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
import { buildUserMessage, coerceCompleteTriageRows, estimateTokens, SYSTEM, type TriageResult } from './groq'

export interface ClaudeCliTriageOptions {
  model: string
  timeoutMs?: number
  budgetUsd?: number // per-call --max-budget-usd guard (belt-and-braces; the daily ledger is the real bound)
  maxAttempts?: number // in-call retries on a TRANSIENT failure (default 2) — parity with the free adapters
  signal?: AbortSignal // the cycle's wall-clock abort — checked before each (re)try so an aborted cycle stops billing/holding the lock
  budgetRemainingUsd?: number // $ left under the daily ceiling at call start; once this call's cumulative cost reaches it, stop retrying
  /** Production hook used to admit the retry through the shared RPM limiter. The first attempt is admitted
   * by runCycle before entering this adapter; a retry may not bypass that same provider-wide limit. */
  beforeRetry?: () => Promise<boolean>
}

/** One CLI completion. Returns the assistant text + the cost the CLI reported for it. Injectable for tests
 *  (the real one spawns a process; a test passes a fake). `error` set ⇒ the batch must be deferred. */
export type ClaudeCliRunner = (
  system: string,
  user: string,
  opts: ClaudeCliTriageOptions,
) => Promise<{
  text: string
  costUsd: number
  /** True only when the CLI returned an exact total_cost_usd for this attempt. Missing metadata is
   * deliberately unknown, even when costUsd is zero: an aborted/timed-out child may still have spent. */
  costUsdKnown?: boolean
  /** False proves the provider process was never started. Omitted is conservative: injected runners are
   * treated as dispatched unless they explicitly prove otherwise. */
  requestDispatched?: boolean
  error?: string
}>

export type ClaudeCliTriageResult = TriageResult & { costUsd: number; costUsdKnown: boolean }

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
  if (opts.signal?.aborted) return { text: '', costUsd: 0, costUsdKnown: true, requestDispatched: false, error: 'claude cli: cycle aborted' }
  const flags = await detectFlags()
  if (opts.signal?.aborted) return { text: '', costUsd: 0, costUsdKnown: true, requestDispatched: false, error: 'claude cli: cycle aborted' }
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
      // The cycle deadline is authoritative even after the process has started. Without forwarding its
      // signal, the shared paid-tier lock could stay occupied until this separate 120s timeout elapsed.
      cancelSignal: opts.signal,
    })
  } catch (e: any) {
    return { text: '', costUsd: 0, costUsdKnown: true, requestDispatched: false, error: `could not start the claude CLI: ${e?.message || e}` }
  }
  // stdin can emit an ASYNC EPIPE if the child dies before reading (e.g. auth failure) — an unhandled
  // stream error would crash the whole server, so swallow it; the result event decides the outcome.
  child.stdin?.on('error', () => {})
  try { child.stdin?.write(user); child.stdin?.end() } catch { /* child may already be gone */ }

  let text = ''
  let costUsd = 0
  let costUsdKnown = false
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
      if (typeof o.total_cost_usd === 'number' && Number.isFinite(o.total_cost_usd) && o.total_cost_usd >= 0) {
        costUsd = o.total_cost_usd
        costUsdKnown = true
      }
      if (o.is_error || o.api_error_status) {
        const resultText = (typeof o.result === 'string' ? o.result : 'error').slice(0, 120)
        // Preserve a terminal HTTP status (bad/revoked key, no credits, …) IN the note text as "HTTP nnn" —
        // the caller (runCycle.ts) pattern-matches that exact shape to tell a terminal auth failure apart
        // from a transient blip and exhaust the day's budget instead of arming the short transient cooldown.
        // Without this, api_error_status (a numeric field) never reached the note, so a 401 read as an
        // ordinary transient error: retried in-call immediately, then re-probed every drain (Codex review,
        // PR #316).
        error = isUsageLimit(o)
          ? 'claude cli: usage limit reached — plan quota spent'
          : o.api_error_status
            ? `claude cli: HTTP ${o.api_error_status} — ${resultText}`
            : `claude cli: ${resultText}`
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
  if (opts.signal?.aborted || res?.isCanceled) return { text, costUsd, costUsdKnown, requestDispatched: true, error: 'claude cli: cycle aborted' }
  if (res?.timedOut) return { text, costUsd, costUsdKnown, requestDispatched: true, error: 'claude cli: timed out' }
  if (!error && !text.trim()) {
    const tail = (stderr || '').trim().slice(-160)
    error = tail ? `claude cli: no output (${tail})` : 'claude cli: no output'
  }
  // A nonempty dispatched completion cannot credibly have an exact $0 total. Treat zero telemetry like
  // missing telemetry so the caller keeps its conservative reservation instead of reopening the plan cap.
  if (!error && text.trim() && costUsdKnown && !(costUsd > 0)) costUsdKnown = false
  return { text, costUsd, costUsdKnown, requestDispatched: true, error }
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
 *
 * RETRY (parity with the free adapters, which retry a transient with maxAttempts=2): the subscription path
 * used to call the CLI exactly once, so a single spawn timeout / empty output / one-off non-JSON reply
 * failed the whole batch and — as the LAST line of defence — sidelined the paid tier via a cooldown while
 * the backlog dropped data. We now retry a TRANSIENT failure up to `maxAttempts` times. We do NOT retry a
 * real plan-quota exhaustion (re-asking a spent plan is waste — the caller wants that surfaced so it arms
 * the long backoff). A billed-but-unparseable reply (cost recorded, prose wrapping the JSON) is proof the
 * plan is alive, so the retry re-asks with a stricter "return only the JSON array" nudge. Every attempt's
 * cost is metered; `requests` is the number of provider processes actually dispatched, including a retry.
 */
export async function triageBatchClaudeCli(
  items: NewsItem[],
  opts: ClaudeCliTriageOptions,
  run: ClaudeCliRunner = defaultClaudeCliRunner,
): Promise<ClaudeCliTriageResult> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true, costUsd: 0, costUsdKnown: true }

  const est = estimateTokens(items.length)
  const baseUser = buildUserMessage(items)
  const maxAttempts = Math.max(1, opts.maxAttempts ?? 2)
  let costUsd = 0
  let costUsdKnown = true
  let dispatchedAttempts = 0
  let note = 'claude cli: no output'
  let failureKind: TriageResult['failureKind']

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Stop before a (re)try that must not run — both gates the caller's single pre-batch check cannot see
    // once we are already inside the loop (Codex review, PR #316):
    //   • the cycle was aborted (runAbortableCycle's wall-clock guard) — don't spawn another billed CLI and
    //     hold the shared `running` lock for another anthropicTimeoutMs after the cycle was told to stop.
    //   • this call's cumulative cost, PLUS the retry's own max possible cost (opts.budgetUsd, the
    //     --max-budget-usd guard passed to every call), already consumed the day's remaining allowance —
    //     the caller gates the batch once with `canSpend()` (est-less, one-call soft overshoot by design),
    //     but never re-checks between the adapter's own retries. Checking only `costUsd >= budgetRemainingUsd`
    //     (the actual spend so far) still let a retry start whenever the remaining allowance was merely
    //     LESS than double the per-call cap — e.g. $0.15 left, a billed $0.10 first attempt passes that
    //     check, and a second ~$0.10 attempt adds a SECOND overshoot past the operator's daily $ governor.
    //     Reserving the retry's max cost up front closes that gap (Codex review, PR #316).
    if (opts.signal?.aborted) { note = 'claude cli: cycle aborted before attempt'; break }
    // One runCycle reservation bounds one CLI attempt. An attempt whose exact total never arrived must keep
    // that whole bound, and cannot safely start a retry under the same reservation.
    if (attempt > 1 && !costUsdKnown) break
    if (attempt > 1 && opts.budgetRemainingUsd != null && costUsd + (opts.budgetUsd ?? 0) > opts.budgetRemainingUsd) {
      note = 'claude cli: daily budget consumed — retry skipped'
      break
    }
    if (attempt > 1 && opts.beforeRetry && !(await opts.beforeRetry())) {
      note = opts.signal?.aborted ? 'claude cli: cycle aborted before retry' : 'claude cli: retry waiting for capacity'
      break
    }
    if (opts.signal?.aborted) { note = 'claude cli: cycle aborted before attempt'; break }
    // after a billed-but-unparseable reply, push harder toward a bare JSON array on the retry
    const user = attempt === 1 ? baseUser : `${baseUser}\n\nReturn ONLY the JSON array — no prose, no markdown, no code fences.`
    let out: Awaited<ReturnType<ClaudeCliRunner>>
    try {
      out = await run(SYSTEM, user, opts)
    } catch (e: any) {
      // the runner is fail-soft by contract, but never let an unexpected throw kill the cycle
      dispatchedAttempts++
      costUsdKnown = false
      note = `claude cli: ${e?.message || e}`
      continue // transient (unexpected throw) → retry within the attempt budget
    }
    const attemptCost = Number.isFinite(out.costUsd) ? Math.max(0, out.costUsd) : 0
    const dispatched = out.requestDispatched !== false
    if (dispatched) {
      dispatchedAttempts++
      // A non-error completion cannot credibly be an exact free call. Error/pre-dispatch shapes may report
      // a real zero, but a usable or malformed model completion with zero telemetry remains unknown.
      const exactAttemptCost = out.costUsdKnown === true && (out.error ? attemptCost >= 0 : attemptCost > 0)
      costUsdKnown = costUsdKnown && exactAttemptCost
      costUsd += attemptCost
    }
    if (out.error) {
      note = out.error
      // a spent plan won't recover on retry — return now so the caller arms the LONG cooldown (wait for reset).
      // A terminal API error (bad/revoked key, no credits, …) is the same shape of "won't recover on retry":
      // re-asking an unauthenticated call bills nothing new but still spawns a second CLI process and holds
      // the lock for another timeout, only to fail again the same way (Codex review, PR #316).
      if (isPlanQuotaNote(out.error) || isTerminalApiNote(out.error)) return { byIndex, requests: dispatchedAttempts, tokens: dispatchedAttempts * est, ok: false, note, costUsd, costUsdKnown }
      continue // transient (timeout / no output / generic) → retry
    }
    let parsed: any
    try { parsed = JSON.parse(out.text) } catch { parsed = braceSlice(out.text) }
    if (!parsed) { note = 'claude cli: non-JSON content'; failureKind = 'contract'; continue } // formatting hiccup → retry with the stricter nudge
    const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
    const complete = coerceCompleteTriageRows(arr, items.length)
    if (!complete) { note = 'claude cli: incomplete batch response'; failureKind = 'contract'; continue }
    return { byIndex: complete, requests: dispatchedAttempts, tokens: dispatchedAttempts * est, ok: true, costUsd, costUsdKnown }
  }
  return {
    byIndex, requests: dispatchedAttempts, tokens: dispatchedAttempts * est,
    ok: false, note, costUsd, costUsdKnown, ...(failureKind ? { failureKind } : {}),
  }
}

/** A last-resort failure that is the PLAN's own quota being spent (not a transient blip) — the caller then
 *  arms the long backoff to wait for the plan reset, and the retry loop above stops rather than re-asking a
 *  spent plan. Mirrors the "usage limit reached — plan quota spent" note claude-cli canonicalises a 429 to. */
export function isPlanQuotaNote(note: string): boolean {
  return /usage limit|plan quota/i.test(note || '')
}

/** A last-resort failure that is a TERMINAL API error (bad/revoked key, no credits, blocked, …) — same
 *  regex runCycle.ts matches on `ar.note` to skip the day rather than arm the short transient cooldown.
 *  Exported so the retry loop above (and its tests) can name the same condition it stops retrying on,
 *  instead of duplicating the pattern (Codex review, PR #316).
 *
 *  NB 401 is deliberately STILL matched here: in-call, an expired sign-in is exactly as un-retryable as a
 *  revoked key, so the retry loop must stop on it. It is the CROSS-CYCLE response that differs — runCycle
 *  tests `isAuthExpiredNote` FIRST and treats it as recoverable. Keep that ordering if you touch either. */
export function isTerminalApiNote(note: string): boolean {
  return /HTTP (400|401|402|403|404|413)/.test(note || '')
}

/** A last-resort failure that is the host's Claude SIGN-IN having expired (HTTP 401 / an "authenticate"
 *  message). It is split out of the terminal-4xx class above because it is the one failure here a human
 *  repairs in seconds — `claude auth login` on the engine host — after which the tier works again immediately.
 *  Treating it as terminal-for-the-day was the real defect: the day's $ ledger was force-marked spent, so
 *  the tier stayed dark until the UTC rollover even once the sign-in was fixed, AND the cockpit reported
 *  $50 of spend that never happened. chat-llm.ts's friendlyResultError already told chat users the exact
 *  fix; this is the same judgement, finally applied on the news path. */
export function isAuthExpiredNote(note: string): boolean {
  return /HTTP 401|authenticat/i.test(note || '')
}
