// One closed-book Ask turn against the selected LOCAL subscription CLI. Claude and Codex share the same
// public contract: one answer, bounded wall time/concurrency, prompt through stdin, no research-run state.
// Claude exposes a native no-tools flag. Codex gets the equivalent hard boundary through explicit config:
// shell/unified-exec, agents, apps, web search and image tools are disabled; its workspace is an empty,
// read-only temporary directory; project/user instructions and session persistence are disabled.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execa, type ResultPromise } from 'execa'
import { CHAT, CLAUDE_BIN, REPO_ROOT } from './config'
import { childEnv, detectFlags } from './launcher'
import { resolveChatModel, type ChatModelSpec } from './chat-models'
import { codexChildEnv, resolveCodexBin } from './providers/codex'

// Light backstop so a stuck UI cannot spawn dozens of subscription CLIs at once.
let activeChatTurns = 0
export function chatTurnsInFlight(): number {
  return activeChatTurns
}

function friendlyClaudeResultError(o: any): string {
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

function friendlyCodexError(value: unknown): string {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (/not logged in|login required|sign.?in|authenticat|unauthori[sz]ed|\b401\b/i.test(text)) {
    return "The engine's Codex session isn't signed in on the server. Run `codex login` once on the host, then try again."
  }
  if (/rate limit|usage limit|quota|weekly limit|5-hour limit|too many requests|\b429\b/i.test(text)) {
    return 'Codex usage limit reached — try again after the plan resets or choose a Claude model.'
  }
  if (/model.+(?:not found|unsupported|unavailable)|(?:not found|unsupported|unavailable).+model/i.test(text)) {
    return 'That Codex GPT model is not available on this server yet. Choose another Ask model and retry.'
  }
  return text ? `Codex could not answer: ${text.slice(0, 260)}` : 'Codex returned no answer.'
}

export interface ChatTurnOutcome {
  costUsd: number
  error?: string
}

// Live signals surfaced by the existing SSE/UI contract. Codex JSONL currently yields completed answer
// items rather than Claude-style token deltas; the final item still travels through the same token event.
export type ChatTurnSignal =
  | { kind: 'ready'; model?: string }
  | { kind: 'thinking-start' }
  | { kind: 'thinking'; text: string }
  | { kind: 'answer-start' }

export type ChatStreamEvent =
  | ChatTurnSignal
  | { kind: 'token'; text: string }
  | { kind: 'fallback-text'; text: string }
  | { kind: 'result'; costUsd: number; error?: string }

/** Classify one Claude stream-json line into the provider-neutral Ask events. */
export function classifyChatLine(o: any): ChatStreamEvent[] {
  if (!o || typeof o !== 'object') return []
  if (o.type === 'system' && o.subtype === 'init') return [{ kind: 'ready', model: typeof o.model === 'string' ? o.model : undefined }]
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
  if (o.type === 'assistant') {
    if (o.error) return []
    const content = o.message?.content
    if (!Array.isArray(content)) return []
    return content
      .filter((block: any) => block?.type === 'text' && typeof block.text === 'string')
      .map((block: any) => ({ kind: 'fallback-text' as const, text: block.text }))
  }
  if (o.type === 'result') {
    return [{
      kind: 'result',
      costUsd: typeof o.total_cost_usd === 'number' ? o.total_cost_usd : 0,
      error: o.is_error || o.api_error_status ? friendlyClaudeResultError(o) : undefined,
    }]
  }
  return []
}

/** Classify one `codex exec --json` line into the same Ask events. */
export function classifyCodexChatLine(o: any, model?: string): ChatStreamEvent[] {
  if (!o || typeof o !== 'object') return []
  if (o.type === 'thread.started') return [{ kind: 'ready', model }]
  if (o.type === 'item.started' && o.item?.type === 'reasoning') return [{ kind: 'thinking-start' }]
  if (o.type === 'item.completed' && o.item?.type === 'reasoning' && typeof o.item.text === 'string' && o.item.text) {
    return [{ kind: 'thinking', text: o.item.text }]
  }
  if (o.type === 'item.completed' && o.item?.type === 'agent_message' && typeof o.item.text === 'string' && o.item.text.trim()) {
    return [{ kind: 'answer-start' }, { kind: 'token', text: o.item.text }]
  }
  if (o.type === 'turn.completed') return [{ kind: 'result', costUsd: 0 }]
  if (o.type === 'turn.failed') return [{ kind: 'result', costUsd: 0, error: friendlyCodexError(o.error?.message || 'Codex turn failed.') }]
  if (o.type === 'error') return [{ kind: 'result', costUsd: 0, error: friendlyCodexError(o.message || 'Codex emitted an error.') }]
  return []
}

export interface ChatTurnOptions {
  system: string
  user: string
  model: string
  signal: AbortSignal
  onToken: (text: string) => void
  onSignal?: (signal: ChatTurnSignal) => void
  timeoutMs?: number
  thinkingTokens?: number
  budgetUsd?: number
}

/** Pure launch contract kept exported so tests pin every closed-book Codex boundary. */
export function buildCodexChatArgs(choice: ChatModelSpec, chatRoot: string, system: string, parser = false): string[] {
  const reasoning = parser ? 'low' : choice.reasoningLevel || 'medium'
  return [
    'exec',
    '--strict-config',
    '--model', choice.model,
    '--config', 'model_provider="openai"',
    '--config', `model_reasoning_effort="${reasoning}"`,
    '--config', `developer_instructions=${JSON.stringify(system)}`,
    '--config', 'approval_policy="never"',
    '--config', 'history.persistence="none"',
    '--config', 'agents.enabled=false',
    '--config', 'features.apps=false',
    '--config', 'features.shell_tool=false',
    '--config', 'features.unified_exec=false',
    '--config', 'features.skill_mcp_dependency_install=false',
    '--config', 'web_search="disabled"',
    '--config', 'tools.web_search=false',
    '--config', 'shell_environment_policy.inherit="none"',
    '--sandbox', 'read-only',
    '--cd', chatRoot,
    '--skip-git-repo-check',
    '--ephemeral',
    '--ignore-user-config',
    '--ignore-rules',
    '--json',
    '--color', 'never',
    '-',
  ]
}

function stopChild(child: ResultPromise): void {
  try { child.kill('SIGTERM') } catch { /* already gone */ }
  setTimeout(() => { try { child.kill('SIGKILL') } catch { /* gone */ } }, 1500)
}

async function runClaudeChatTurn(opts: ChatTurnOptions, choice: ChatModelSpec): Promise<ChatTurnOutcome> {
  const flags = await detectFlags()
  if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
  const args: string[] = ['--print', '--output-format', 'stream-json', '--verbose']
  if (flags.has('--no-session-persistence')) args.push('--no-session-persistence')
  if (flags.has('--include-partial-messages')) args.push('--include-partial-messages')
  if (flags.has('--system-prompt')) args.push('--system-prompt', opts.system)
  else if (flags.has('--append-system-prompt')) args.push('--append-system-prompt', opts.system)
  if (flags.has('--tools')) args.push('--tools', '')
  else if (flags.has('--disallowed-tools')) args.push('--disallowed-tools', 'Bash Edit Write Read WebSearch WebFetch Task Glob Grep NotebookEdit')
  if (flags.has('--model')) args.push('--model', choice.model)
  if (flags.has('--max-turns')) args.push('--max-turns', '1')
  if (flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(opts.budgetUsd ?? CHAT.budgetUsd))
  if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')

  const env = childEnv()
  if (opts.thinkingTokens !== undefined) env.MAX_THINKING_TOKENS = String(Math.max(0, Math.floor(opts.thinkingTokens)))
  else if (CHAT.thinkingTokens > 0 && env.MAX_THINKING_TOKENS === undefined) env.MAX_THINKING_TOKENS = String(CHAT.thinkingTokens)

  let child: ResultPromise
  try {
    child = execa(CLAUDE_BIN, args, {
      cwd: REPO_ROOT,
      env,
      stdin: 'pipe', stdout: 'pipe', stderr: 'pipe', buffer: false, reject: false,
      timeout: opts.timeoutMs ?? CHAT.timeoutMs,
    })
  } catch (error: any) {
    return { costUsd: 0, error: `Could not start Claude chat: ${error?.message || error}` }
  }
  child.stdin?.on('error', () => {})
  try { child.stdin?.write(opts.user); child.stdin?.end() } catch { /* child may have exited */ }
  if (opts.signal.aborted) { stopChild(child); return { costUsd: 0, error: 'aborted' } }
  const onAbort = () => stopChild(child)
  opts.signal.addEventListener('abort', onAbort)

  let cost = 0
  let streamedText = false
  let resultError: string | undefined
  const handle = (line: string) => {
    const text = line.trim()
    if (!text) return
    let parsed: any
    try { parsed = JSON.parse(text) } catch { return }
    const events = classifyChatLine(parsed)
    const fallback = events.filter((event) => event.kind === 'fallback-text')
    if (fallback.length && !streamedText) {
      for (const event of fallback) if (event.kind === 'fallback-text') opts.onToken(event.text)
      streamedText = true
    }
    for (const event of events) {
      if (event.kind === 'token') { streamedText = true; opts.onToken(event.text) }
      else if (event.kind === 'result') { cost = event.costUsd; if (event.error) resultError = event.error }
      else if (event.kind !== 'fallback-text') opts.onSignal?.(event)
    }
  }
  let buffer = ''
  child.stdout?.on('error', () => {})
  child.stderr?.on('error', () => {})
  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', (chunk: string) => {
    buffer += chunk
    let index: number
    while ((index = buffer.indexOf('\n')) >= 0) {
      handle(buffer.slice(0, index))
      buffer = buffer.slice(index + 1)
    }
  })
  let stderr = ''
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk: string) => { stderr += chunk; if (stderr.length > 4000) stderr = stderr.slice(-4000) })
  let result: any
  try { result = await child } catch (error: any) { result = error }
  opts.signal.removeEventListener('abort', onAbort)
  if (buffer.trim()) handle(buffer)

  if (opts.signal.aborted) return { costUsd: cost, error: 'aborted' }
  if (resultError) return { costUsd: cost, error: resultError }
  if (result?.timedOut) return { costUsd: cost, error: 'The answer took too long and was stopped. Try a narrower scope or a shorter question.' }
  if (!streamedText) {
    const tail = stderr.trim().slice(-300)
    return { costUsd: cost, error: tail ? `Claude returned no answer: ${tail}` : 'Claude returned no answer.' }
  }
  return { costUsd: cost }
}

async function runCodexChatTurn(opts: ChatTurnOptions, choice: ChatModelSpec): Promise<ChatTurnOutcome> {
  if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
  let chatRoot: string
  try {
    chatRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-chat-'))
    fs.chmodSync(chatRoot, 0o700)
  } catch (error: any) {
    return { costUsd: 0, error: `Could not prepare Codex chat: ${error?.message || error}` }
  }
  try {
    if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
    const env = codexChildEnv()
    env.TMPDIR = chatRoot
    env.TMP = chatRoot
    env.TEMP = chatRoot
    const args = buildCodexChatArgs(choice, chatRoot, opts.system, opts.thinkingTokens === 0)
    let child: ResultPromise
    try {
      child = execa(resolveCodexBin(), args, {
        cwd: chatRoot,
        env,
        stdin: 'pipe', stdout: 'pipe', stderr: 'pipe', buffer: false, reject: false,
        timeout: opts.timeoutMs ?? CHAT.timeoutMs,
      })
    } catch (error: any) {
      return { costUsd: 0, error: friendlyCodexError(error?.message || error) }
    }
    child.stdin?.on('error', () => {})
    try { child.stdin?.write(opts.user); child.stdin?.end() } catch { /* child may have exited */ }
    if (opts.signal.aborted) { stopChild(child); return { costUsd: 0, error: 'aborted' } }
    const onAbort = () => stopChild(child)
    opts.signal.addEventListener('abort', onAbort)

    let streamedText = false
    let resultError: string | undefined
    let terminal = false
    const handle = (line: string) => {
      const text = line.trim()
      if (!text) return
      let parsed: any
      try { parsed = JSON.parse(text) } catch { return }
      for (const event of classifyCodexChatLine(parsed, choice.model)) {
        if (event.kind === 'token') { streamedText = true; opts.onToken(event.text) }
        else if (event.kind === 'result') { terminal = !event.error; if (event.error) resultError = event.error }
        else if (event.kind !== 'fallback-text') opts.onSignal?.(event)
      }
    }
    let buffer = ''
    child.stdout?.on('error', () => {})
    child.stderr?.on('error', () => {})
    child.stdout?.setEncoding('utf8')
    child.stdout?.on('data', (chunk: string) => {
      buffer += chunk
      let index: number
      while ((index = buffer.indexOf('\n')) >= 0) {
        handle(buffer.slice(0, index))
        buffer = buffer.slice(index + 1)
      }
    })
    let stderr = ''
    child.stderr?.setEncoding('utf8')
    child.stderr?.on('data', (chunk: string) => { stderr += chunk; if (stderr.length > 4000) stderr = stderr.slice(-4000) })
    let result: any
    try { result = await child } catch (error: any) { result = error }
    opts.signal.removeEventListener('abort', onAbort)
    if (buffer.trim()) handle(buffer)

    if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
    if (resultError) return { costUsd: 0, error: resultError }
    if (result?.timedOut) return { costUsd: 0, error: 'The Codex answer took too long and was stopped. Try a narrower scope or a faster GPT model.' }
    if (!terminal || result?.exitCode !== 0) return { costUsd: 0, error: friendlyCodexError(stderr || `Codex exited with code ${result?.exitCode ?? 'unknown'}.`) }
    if (!streamedText) return { costUsd: 0, error: 'Codex returned no answer. Retry or choose another Ask model.' }
    return { costUsd: 0 }
  } finally {
    try { fs.rmSync(chatRoot, { recursive: true, force: true }) } catch { /* bounded temporary workspace */ }
  }
}

export async function runChatTurn(opts: ChatTurnOptions): Promise<ChatTurnOutcome> {
  if (opts.signal.aborted) return { costUsd: 0, error: 'aborted' }
  const choice = resolveChatModel(opts.model)
  if (!choice || !CHAT.allowedModels.includes(choice.id)) {
    return { costUsd: 0, error: 'That Ask model is not supported or allowed. Choose another model and retry.' }
  }
  if (activeChatTurns >= CHAT.maxConcurrent) return { costUsd: 0, error: 'Chat is busy right now — try again in a moment.' }
  activeChatTurns++
  try {
    return choice.provider === 'codex'
      ? await runCodexChatTurn(opts, choice)
      : await runClaudeChatTurn(opts, choice)
  } finally {
    activeChatTurns--
  }
}
