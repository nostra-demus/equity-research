import type { ChatTurnOutcome } from '../chat-llm'

export interface NewsChatFallbackConfig {
  enabled: boolean
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs: number
  maxTokens: number
}

export interface NewsChatFallbackOutcome extends ChatTurnOutcome {
  attempted: boolean
  model?: string
}

function compactEvidenceBlock(block: string, maxChars = 950): string {
  const lines = block.split('\n').filter(Boolean)
  const kept = lines.filter((line, index) => index === 0 || /^(source snippet|saved article read|saved article points|saved figures|saved impact|url):/i.test(line))
  const text = kept.join('\n')
  return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1).trim()}…`
}

/** Keep the receipt, the best cited rows, and the exact question inside a small-provider TPM limit. */
export function compactNewsChatUserPrompt(user: string, maxChars = 12_000): string {
  if (user.length <= maxChars) return user
  const currentAt = user.indexOf('\nCURRENT EVIDENCE:')
  const questionAt = user.lastIndexOf('\nQUESTION:')
  const head = (currentAt >= 0 ? user.slice(0, currentAt) : user).slice(0, 3_200)
  const evidenceArea = currentAt >= 0 ? user.slice(currentAt, questionAt >= 0 ? questionAt : undefined) : ''
  const blocks = evidenceArea.match(/^\[(?:N|H)\d+\][\s\S]*?(?=^\[(?:N|H)\d+\]|\nOLDER EVIDENCE|$)/gm) || []
  const current = blocks.filter((b) => /^\[N/.test(b)).slice(0, 7)
  const older = blocks.filter((b) => /^\[H/.test(b)).slice(0, 2)
  const question = questionAt >= 0 ? user.slice(questionAt).slice(0, 1_800) : user.slice(-1_800)
  const compact = [
    head,
    '',
    'COMPACT CURRENT EVIDENCE:',
    ...current.map((b) => compactEvidenceBlock(b)),
    '',
    'COMPACT OLDER EVIDENCE:',
    ...(older.length ? older.map((b) => compactEvidenceBlock(b)) : ['No older row kept in the backup prompt.']),
    '',
    question,
  ].join('\n')
  return compact.slice(0, maxChars)
}

function endpoint(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`
}

/**
 * Closed-book backup for news chat only.
 *
 * The caller supplies the same locked system prompt and cited evidence block used by the primary
 * subscription model. This call has no tools and can only read those two messages. It is deliberately
 * limited to public saved-news context; research reports continue to use the stronger primary model.
 */
export async function runNewsChatFallback(opts: {
  system: string
  user: string
  signal: AbortSignal
  onToken: (text: string) => void
  config: NewsChatFallbackConfig
  fetchImpl?: typeof fetch
}): Promise<NewsChatFallbackOutcome> {
  const { config } = opts
  if (!config.enabled || !config.apiKey) return { attempted: false, costUsd: 0, error: 'News chat backup is not configured.' }
  if (opts.signal.aborted) return { attempted: false, costUsd: 0, error: 'aborted' }

  const timeout = new AbortController()
  const stop = () => timeout.abort()
  opts.signal.addEventListener('abort', stop, { once: true })
  const timer = setTimeout(stop, Math.max(1_000, config.timeoutMs))
  try {
    const response = await (opts.fetchImpl || fetch)(endpoint(config.baseUrl), {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: compactNewsChatUserPrompt(opts.user) },
        ],
        temperature: 0.1,
        max_tokens: Math.max(200, config.maxTokens),
        stream: false,
      }),
      signal: timeout.signal,
    })
    if (!response.ok) {
      // Provider bodies can contain account or organisation identifiers. Keep them in neither the UI nor
      // logs; the status code is enough for the operator to diagnose the configured backup.
      return { attempted: true, costUsd: 0, error: `News chat backup failed (${response.status}).` }
    }
    const payload: any = await response.json()
    const answer = payload?.choices?.[0]?.message?.content
    if (typeof answer !== 'string' || !answer.trim()) return { attempted: true, costUsd: 0, error: 'News chat backup returned no answer.' }
    opts.onToken(answer)
    return { attempted: true, costUsd: 0, model: `groq/${config.model}` }
  } catch (error: any) {
    if (opts.signal.aborted) return { attempted: true, costUsd: 0, error: 'aborted' }
    const reason = error?.name === 'AbortError' ? 'timed out' : String(error?.message || error).slice(0, 180)
    return { attempted: true, costUsd: 0, error: `News chat backup ${reason}.` }
  } finally {
    clearTimeout(timer)
    opts.signal.removeEventListener('abort', stop)
  }
}

export function shouldUseNewsChatFallback(error?: string): boolean {
  return Boolean(error && /usage limit|rate limit|busy|authenticate|no answer|took too long/i.test(error))
}
