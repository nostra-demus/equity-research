// The chat turn state machine, lifted from the desktop store's sendChatMessage (store.ts) into a PURE
// reducer so the phone shell gets the same hard-won semantics without importing the 5,000-line store:
//   - optimistic send: append the user turn + an empty assistant turn, grow it token-by-token
//   - a BASELINE snapshot of the committed transcript; any failure rolls back to it exactly, so a
//     half-written answer never becomes part of the thread
//   - retry keeps the SAME turn id, which is what makes a retry idempotent server-side
//   - recovery (the terminal SSE frame was lost after the durable commit) REPLACES the partial answer
//     with the canonical saved one — never appends a duplicate
//   - stages are positively matched (deploy skew, DESIGN.md §5): an unknown stage is ignored
//   - the transcript sent to the server is windowed to the last 40 turns (ChatBody rejects more)
// Pure and store-free on purpose: the test runner executes plain .ts only, and this file carries the
// logic worth testing.

import type { ChatComputed, ChatMessage, ChatWork, CompletedChatTurn } from '../../lib/types'

export const CHAT_MAX_SEND = 40

export function newChatTurnId(): string {
  const uuid = globalThis.crypto?.randomUUID?.().replace(/-/g, '')
  return `turn_${uuid || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`
}

export interface TurnState {
  messages: ChatMessage[]
  streaming: boolean
  work: ChatWork | null
  error?: string
  retryText?: string
  retryTurnId?: string
  conversationId?: string
  source?: string
  /** the committed transcript before the in-flight turn — restored verbatim on error or stop */
  baseline?: { messages: ChatMessage[]; conversationId?: string; source?: string }
  /** index of the assistant message the stream grows */
  pendingIdx?: number
}

export const initialTurnState: TurnState = { messages: [], streaming: false, work: null }

export type TurnEvent =
  | { type: 'send'; text: string; turnId: string; now: number }
  | { type: 'meta'; sourcePath?: string; conversationId?: string; now: number }
  | { type: 'status'; stage: string; model?: string; now: number }
  | { type: 'thinking'; token: string }
  | { type: 'token'; token: string; now: number }
  | { type: 'computed'; card: ChatComputed }
  | { type: 'recovered'; turn: CompletedChatTurn }
  | { type: 'done' }
  | { type: 'error'; message: string }
  /** the user's own Stop: roll back like an error, but keep it quiet — no error banner, retry ready */
  | { type: 'stop' }
  | { type: 'reset'; keep?: Partial<Pick<TurnState, 'conversationId' | 'source'>> }
  | { type: 'hydrate'; messages: ChatMessage[]; conversationId?: string; source?: string }

// the only stages the server actually streams; anything else is a future engine talking to an old shell
const KNOWN_STAGES = new Set(['sources', 'modeling', 'starting', 'connected', 'thinking', 'writing'])

const advance = (s: TurnState, stage: ChatWork['stage'], now: number, model?: string): ChatWork => ({
  stage,
  model: model ?? s.work?.model,
  startedAt: s.work?.startedAt ?? now,
  stageAt: now,
})

/** grow/patch the in-flight assistant message; a stray event outside a turn is a no-op */
function patchPending(s: TurnState, patch: (m: ChatMessage) => ChatMessage): TurnState {
  const i = s.pendingIdx
  if (i == null || s.messages[i]?.role !== 'assistant') return s
  const messages = s.messages.slice()
  messages[i] = patch(messages[i])
  return { ...s, messages }
}

export function turnReduce(s: TurnState, e: TurnEvent): TurnState {
  switch (e.type) {
    case 'send': {
      const q = e.text.trim()
      if (!q || s.streaming) return s
      const baseline = { messages: s.messages, conversationId: s.conversationId, source: s.source }
      return {
        ...s,
        baseline,
        pendingIdx: baseline.messages.length + 1,
        messages: [...baseline.messages, { role: 'user', content: q, turnId: e.turnId }, { role: 'assistant', content: '', turnId: e.turnId }],
        streaming: true,
        work: { stage: 'sending', startedAt: e.now, stageAt: e.now },
        error: undefined,
        retryText: undefined,
        retryTurnId: undefined,
        source: undefined,
      }
    }
    case 'meta':
      return {
        ...s,
        source: e.sourcePath ?? s.source,
        conversationId: e.conversationId ?? s.conversationId,
        work: advance(s, 'context', e.now),
      }
    case 'status':
      if (!KNOWN_STAGES.has(e.stage)) return s
      return { ...s, work: advance(s, e.stage as ChatWork['stage'], e.now, e.model) }
    case 'thinking':
      return patchPending(s, (m) => ({ ...m, thinking: (m.thinking || '') + e.token }))
    case 'computed':
      return patchPending(s, (m) => ({ ...m, computed: [...(m.computed || []), e.card] }))
    case 'token': {
      // the first answer token flips the stage to 'writing' even when no chat-status preceded it (an
      // older engine during deploy skew streams text without stages)
      const next = s.work?.stage !== 'writing' ? { ...s, work: advance(s, 'writing', e.now) } : s
      return patchPending(next, (m) => ({ ...m, content: m.content + e.token }))
    }
    case 'recovered': {
      const next = patchPending(s, (m) => ({ ...m, content: e.turn.answer, thinking: e.turn.thinking, computed: e.turn.computed }))
      return { ...next, conversationId: e.turn.conversationId, source: e.turn.sourcePath }
    }
    case 'done':
      return { ...s, streaming: false, work: null, baseline: undefined, pendingIdx: undefined, retryText: undefined, retryTurnId: undefined }
    case 'error':
    case 'stop': {
      // a turn enters the durable history only with a completed answer — mirror that in the thread:
      // restore the last committed transcript, keep the exact question so retry is one tap and reuses
      // the same turn id (idempotency). Stop differs only in showing no error banner.
      const rb = s.baseline
      const q = s.messages[s.pendingIdx != null ? s.pendingIdx - 1 : -1]
      const turnId = q?.turnId
      return {
        messages: rb?.messages ?? s.messages,
        conversationId: rb?.conversationId,
        source: rb?.source,
        streaming: false,
        work: null,
        error: e.type === 'error' ? e.message : undefined,
        retryText: q?.content,
        retryTurnId: turnId,
      }
    }
    case 'reset':
      return { ...initialTurnState, ...e.keep }
    case 'hydrate':
      // resuming a saved conversation: the transcript (with thinking + computed) becomes the thread
      return { ...initialTurnState, messages: e.messages, conversationId: e.conversationId, source: e.source }
    default:
      return s
  }
}

/** the transcript actually sent: baseline + the new user turn, windowed to the server's 40-turn cap */
export function windowMessages(baseline: ChatMessage[], text: string, turnId: string): ChatMessage[] {
  // Trim the baseline to an EVEN number of messages (whole Q&A pairs) BEFORE appending the new question,
  // reserving room for it. Slicing the combined array to CHAT_MAX_SEND after appending instead removes
  // only the oldest USER message once history exceeds the cap, so the request starts with an orphaned
  // assistant answer and every later turn gives the model mispaired history (same class of bug fixed in
  // NewsChat.tsx's windowing).
  const room = CHAT_MAX_SEND - 1
  const evenRoom = room - (room % 2)
  const trimmedBaseline = baseline.slice(-evenRoom)
  return [...trimmedBaseline, { role: 'user' as const, content: text.trim(), turnId }]
}
