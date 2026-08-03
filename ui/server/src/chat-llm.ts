// One closed-book chat turn against the LOCAL subscription Claude — the SAME `claude` CLI the engine
// reasons with (keychain OAuth, no API key). It is deliberately NOT routed through the run launcher /
// registry / admission: a chat turn is a one-shot completion, not a research run.
//
// The lockdown that makes it answer ONLY from the provided context:
//   --tools ""              -> the model has NO tools (init reports "tools":[]); it cannot browse, read
//                             files, run bash, or spawn subagents. The closed book is enforced, not asked.
//   --max-turns 1           -> a single answer; no agentic loop.
//   --system-prompt <...>   -> replaces the default Claude Code agent persona with the closed-book one.
//   prompt via STDIN        -> a whole-run context can be ~90k tokens; piping avoids any ARG_MAX limit.
// The prompt itself carries the context + the closed-book instruction, so even the model's own knowledge
// is fenced off by instruction on top of the tool lockdown.
//
// cwd = REPO_ROOT and NO `--settings` override: this exactly matches the auth context of the engine's
// research spawn, which authenticates via the host keychain OAuth. A neutral cwd + `--settings '{"hooks":{}}'`
// (an earlier attempt to suppress the harmless review-due SessionStart hook) broke that keychain auth — the
// chat child reported apiKeySource:"none" and 401'd while research runs on the same host succeeded. The
// SessionStart hook is benign and `--tools ""` + `--max-turns 1` already neutralize any agentic behaviour,
// so running from REPO_ROOT (loading the doctrine CLAUDE.md as harmless context) is the safe, working setup.
import { execa, type ResultPromise } from 'execa'
import { CHAT, CLAUDE_BIN, REPO_ROOT } from './config'
import { childEnv, detectFlags } from './launcher'

// light backstop so a stuck UI can't spawn dozens of CLIs at once (chat is cheap, but each is a process)
let activeChatTurns = 0
export function chatTurnsInFlight(): number {
  return activeChatTurns
}

function friendlyResultError(o: any): string {
  const status = o?.api_error_status
  const text = typeof o?.result === 'string' ? o.result : ''
  if (status === 401 || /authenticat/i.test(text)) {
    return "The engine's Claude session isn't signed in on the server. Run `claude` once on the host to authenticate, then try again."
  }
  if (status === 429 || /rate limit|overage|credit|usage limit/i.test(text)) {
    return 'Claude usage limit reached — try again after the plan resets.'
  }
  if (o?.subtype === 'error_max_turns') return 'The answer was cut off (turn limit). Try a shorter or narrower question.'
  return text ? text.slice(0, 300) : 'The model returned an error.'
}

export interface ChatTurnOutcome {
  costUsd: number
  error?: string // a friendly message when the turn failed (absent on success); 'aborted' on client close
}

// Live signals of what the turn is ACTUALLY doing right now, surfaced so the panel never sits on a blind
// spinner. Every signal maps 1:1 to a real event in the CLI's stream-json output — none is invented:
//   ready          -> the CLI session initialized (the model is now consuming the prompt)
//   thinking-start -> an extended-thinking block opened
//   thinking       -> one extended-thinking delta (the model's own visible reasoning, verbatim)
//   answer-start   -> the first visible-text block opened (the answer is now being written)
export type ChatTurnSignal =
  | { kind: 'ready'; model?: string }
  | { kind: 'thinking-start' }
  | { kind: 'thinking'; text: string }
  | { kind: 'answer-start' }

// Everything classifyChatLine can extract from one stream-json line. Pure and stateless so it is unit-
// testable; runChatTurn layers the stateful fallback rule (emit assembled text only if partials never
// streamed) on top.
export type ChatStreamEvent =
  | ChatTurnSignal
  | { kind: 'token'; text: string } // one incremental answer delta
  | { kind: 'fallback-text'; text: string } // assembled answer text from the final assistant message
  | { kind: 'result'; costUsd: number; error?: string }

/** Classify one parsed stream-json line into semantic events (possibly none). */
export function classifyChatLine(o: any): ChatStreamEvent[] {
  if (!o || typeof o !== 'object') return []
  // CLI session initialized — carries the resolved model id
  if (o.type === 'system' && o.subtype === 'init') return [{ kind: 'ready', model: typeof o.model === 'string' ? o.model : undefined }]
  // incremental frames (with --include-partial-messages): a stream_event wrapping an Anthropic SSE event
  if (o.type === 'stream_event') {
    const ev = o.event
    if (ev?.type === 'content_block_start') {
      const bt = ev.content_block?.type
      if (bt === 'thinking' || bt === 'redacted_thinking') return [{ kind: 'thinking-start' }]
      if (bt === 'text') return [{ kind: 'answer-start' }]
      return []
    }
    if (ev?.type === 'content_block_delta') {
      if (ev.delta?.type === 'thinking_delta' && typeof ev.delta.thinking === 'string') return [{ kind: 'thinking', text: ev.delta.thinking }]
      if (ev.delta?.type === 'text_delta' && typeof ev.delta.text === 'string') return [{ kind: 'token', text: ev.delta.text }]
      return []
    }
    return []
  }
  // the final assembled assistant message — fallback text if partials didn't stream (thinking blocks are
  // deliberately NOT replayed here: replaying reasoning after the answer landed would read as new output)
  if (o.type === 'assistant') {
    if (o.error) return [] // synthetic auth/error message — the `result` event carries the real error
    const content = o.message?.content
    if (!Array.isArray(content)) return []
    return content.filter((b: any) => b?.type === 'text' && typeof b.text === 'string').map((b: any) => ({ kind: 'fallback-text' as const, text: b.text }))
  }
  if (o.type === 'result') {
    return [{
      kind: 'result',
      costUsd: typeof o.total_cost_usd === 'number' ? o.total_cost_usd : 0,
      error: o.is_error || o.api_error_status ? friendlyResultError(o) : undefined,
    }]
  }
  return []
}

export async function runChatTurn(opts: {
  system: string
  user: string
  model: string
  signal: AbortSignal
  onToken: (t: string) => void
  onSignal?: (s: ChatTurnSignal) => void // live progress + thinking stream (optional — safe to omit)
  // Small-call overrides, used by the what-if PARSER (chat-whatif.ts): a tight wall-clock so a hung parse
  // can't stall the turn, thinkingTokens: 0 to disable extended thinking (a parse needs none), and a small
  // separate $ ceiling so a what-if turn can never consume two full CHAT.budgetUsd budgets.
  timeoutMs?: number
  thinkingTokens?: number
  budgetUsd?: number
}): Promise<ChatTurnOutcome> {
  // A request can disappear while the route is still assembling context or parsing a what-if. Refuse the
  // turn before touching the concurrency counter or doing the async CLI capability probe, and check again
  // after that probe so an abort during it can never spawn a paid model process.
  if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
  if (activeChatTurns >= CHAT.maxConcurrent) {
    return { costUsd: 0, error: 'Chat is busy right now — try again in a moment.' }
  }
  activeChatTurns++
  try {
    const flags = await detectFlags()
    if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
    const args: string[] = ['--print', '--output-format', 'stream-json', '--verbose']
    if (flags.has('--no-session-persistence')) args.push('--no-session-persistence')
    if (flags.has('--include-partial-messages')) args.push('--include-partial-messages')
    // closed-book persona (replace the default agent prompt; fall back to appending if unsupported)
    if (flags.has('--system-prompt')) args.push('--system-prompt', opts.system)
    else if (flags.has('--append-system-prompt')) args.push('--append-system-prompt', opts.system)
    // the closed-book lock: no tools at all
    if (flags.has('--tools')) args.push('--tools', '')
    else if (flags.has('--disallowed-tools')) args.push('--disallowed-tools', 'Bash Edit Write Read WebSearch WebFetch Task Glob Grep NotebookEdit')
    if (flags.has('--model')) args.push('--model', opts.model)
    if (flags.has('--max-turns')) args.push('--max-turns', '1')
    if (flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(opts.budgetUsd ?? CHAT.budgetUsd))
    if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')

    // Extended thinking, ON REQUEST of the UI: with a thinking budget set, the CLI streams the model's
    // own reasoning as thinking deltas, which we forward live (onSignal) so the user can READ the thought
    // process while waiting instead of staring at a spinner. Real reasoning, not a fabricated status.
    // A host-set MAX_THINKING_TOKENS wins; ENGINE_CHAT_THINKING_TOKENS=0 disables (turn degrades cleanly
    // to status signals only).
    const env = childEnv()
    // An explicit per-call thinkingTokens (the parser passes 0) wins over the session default; otherwise
    // the existing rule holds (host-set MAX_THINKING_TOKENS wins, else the CHAT default when > 0).
    if (opts.thinkingTokens !== undefined) env.MAX_THINKING_TOKENS = String(Math.max(0, Math.floor(opts.thinkingTokens)))
    else if (CHAT.thinkingTokens > 0 && env.MAX_THINKING_TOKENS === undefined) env.MAX_THINKING_TOKENS = String(CHAT.thinkingTokens)

    let child: ResultPromise
    try {
      child = execa(CLAUDE_BIN, args, {
        cwd: REPO_ROOT, // match the research spawn's auth context (host keychain OAuth)
        env, // news-provider secrets scrubbed; ANTHROPIC_API_KEY (if any) + keychain OAuth kept
        stdin: 'pipe',
        stdout: 'pipe',
        stderr: 'pipe',
        buffer: false,
        reject: false,
        timeout: opts.timeoutMs ?? CHAT.timeoutMs,
      })
    } catch (e: any) {
      return { costUsd: 0, error: `Could not start the chat engine: ${e?.message || e}` }
    }
    // feed the (possibly large) prompt via stdin to dodge ARG_MAX. The stdin stream can emit an ASYNC
    // 'error' (EPIPE) if the child dies before reading it (e.g. an auth failure) — an unhandled stream
    // error would crash the whole server, so swallow it; the run's outcome is decided by the result event.
    child.stdin?.on('error', () => { /* EPIPE — child exited before reading the prompt */ })
    try { child.stdin?.write(opts.user); child.stdin?.end() } catch { /* child may have died already */ }

    const kill = () => {
      try { child.kill('SIGTERM') } catch { /* already gone */ }
      setTimeout(() => { try { child.kill('SIGKILL') } catch { /* gone */ } }, 1500)
    }
    if (opts.signal.aborted) { kill(); return { costUsd: 0, error: 'aborted' } }
    const onAbort = () => kill()
    opts.signal.addEventListener('abort', onAbort)

    let cost = 0
    let streamedText = false
    let resultError: string | undefined

    const handle = (line: string) => {
      const t = line.trim()
      if (!t) return
      let o: any
      try { o = JSON.parse(t) } catch { return }
      const events = classifyChatLine(o)
      // fallback rule (stateful, so it lives here and not in the classifier): the assembled assistant text
      // is emitted only when no partial ever streamed — and one message's blocks all emit before the flag
      // flips, so a multi-block answer isn't half-swallowed.
      const fallback = events.filter((e) => e.kind === 'fallback-text')
      if (fallback.length && !streamedText) {
        for (const e of fallback) if (e.kind === 'fallback-text') opts.onToken(e.text)
        streamedText = true
      }
      for (const e of events) {
        if (e.kind === 'token') { streamedText = true; opts.onToken(e.text) }
        else if (e.kind === 'result') { cost = e.costUsd; if (e.error) resultError = e.error }
        else if (e.kind === 'ready' || e.kind === 'thinking-start' || e.kind === 'thinking' || e.kind === 'answer-start') opts.onSignal?.(e)
      }
    }

    let buf = ''
    child.stdout?.on('error', () => { /* stream torn down on kill — handled by the result/abort paths */ })
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
    child.stderr?.on('data', (c: string) => { stderr += c; if (stderr.length > 4000) stderr = stderr.slice(-4000) })

    let res: any
    try { res = await child } catch (e: any) { res = e }
    opts.signal.removeEventListener('abort', onAbort)
    if (buf.trim()) handle(buf)

    if (opts.signal.aborted) return { costUsd: cost, error: 'aborted' }
    if (resultError) return { costUsd: cost, error: resultError }
    if (res?.timedOut) return { costUsd: cost, error: 'The answer took too long and was stopped. Try a narrower scope or a shorter question.' }
    if (!streamedText) {
      const tail = (stderr || '').trim().slice(-300)
      return { costUsd: cost, error: tail ? `The chat engine returned no answer: ${tail}` : 'The chat engine returned no answer.' }
    }
    return { costUsd: cost }
  } finally {
    activeChatTurns--
  }
}
