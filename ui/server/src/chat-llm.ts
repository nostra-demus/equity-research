// One closed-book chat turn against the LOCAL subscription Claude — the SAME `claude` CLI the engine
// reasons with (keychain OAuth, no API key). It is deliberately NOT routed through the run launcher /
// registry / admission: a chat turn is a one-shot completion, not a research run.
//
// The lockdown that makes it answer ONLY from the provided context:
//   --tools ""              -> the model has NO tools (init reports "tools":[]); it cannot browse, read
//                             files, run bash, or spawn subagents. The closed book is enforced, not asked.
//   --max-turns 1           -> a single answer; no agentic loop.
//   --system-prompt <...>   -> replaces the default Claude Code agent persona with the closed-book one.
//   cwd = a neutral dir     -> no project CLAUDE.md / project hooks load (the repo's doctrine + hooks are
//                             irrelevant noise for a finance Q&A, and we don't want hooks firing).
//   prompt via STDIN        -> a whole-run context can be ~90k tokens; piping avoids any ARG_MAX limit.
// The prompt itself carries the context + the closed-book instruction, so even the model's own knowledge
// is fenced off by instruction on top of the tool lockdown.
import fs from 'node:fs'
import path from 'node:path'
import { execa, type ResultPromise } from 'execa'
import { CHAT, CLAUDE_BIN, STATE_DIR } from './config'
import { childEnv, detectFlags } from './launcher'

// light backstop so a stuck UI can't spawn dozens of CLIs at once (chat is cheap, but each is a process)
let activeChatTurns = 0
export function chatTurnsInFlight(): number {
  return activeChatTurns
}

// a stable empty working dir so project CLAUDE.md auto-discovery + project hooks never apply to chat.
function chatCwd(): string {
  const d = path.join(STATE_DIR, 'chat-cwd')
  try { fs.mkdirSync(d, { recursive: true }) } catch { /* fall back to STATE_DIR */ }
  return fs.existsSync(d) ? d : STATE_DIR
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

export async function runChatTurn(opts: {
  system: string
  user: string
  model: string
  signal: AbortSignal
  onToken: (t: string) => void
}): Promise<ChatTurnOutcome> {
  if (activeChatTurns >= CHAT.maxConcurrent) {
    return { costUsd: 0, error: 'Chat is busy right now — try again in a moment.' }
  }
  activeChatTurns++
  try {
    const flags = await detectFlags()
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
    if (flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(CHAT.budgetUsd))
    // best-effort: don't fire any user-level hooks for a chat turn (project hooks are already out via cwd)
    if (flags.has('--settings')) args.push('--settings', '{"hooks":{}}')
    if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')

    let child: ResultPromise
    try {
      child = execa(CLAUDE_BIN, args, {
        cwd: chatCwd(),
        env: childEnv(), // news-provider secrets scrubbed; ANTHROPIC_API_KEY (if any) + keychain OAuth kept
        stdin: 'pipe',
        stdout: 'pipe',
        stderr: 'pipe',
        buffer: false,
        reject: false,
        timeout: CHAT.timeoutMs,
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
      // incremental tokens (with --include-partial-messages): a stream_event wrapping an Anthropic SSE event
      if (o.type === 'stream_event') {
        const ev = o.event
        if (ev?.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && typeof ev.delta.text === 'string') {
          streamedText = true
          opts.onToken(ev.delta.text)
        }
        return
      }
      // the final assembled assistant message — a fallback that fires only if partials didn't stream
      if (o.type === 'assistant') {
        if (o.error) return // synthetic auth/error message — the `result` event carries the real error
        const content = o.message?.content
        if (Array.isArray(content) && !streamedText) {
          let emitted = false
          for (const b of content) if (b?.type === 'text' && typeof b.text === 'string') { opts.onToken(b.text); emitted = true }
          if (emitted) streamedText = true
        }
        return
      }
      if (o.type === 'result') {
        if (typeof o.total_cost_usd === 'number') cost = o.total_cost_usd
        if (o.is_error || o.api_error_status) resultError = friendlyResultError(o)
        return
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
