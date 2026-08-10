// The transport hook: owns the AbortController and wires api.chatStream's callbacks into the pure
// turn reducer. All decisions live in chatTurn.ts; this file only moves bytes. The request shape is
// the desktop's exactly (store.ts sendChatMessage): research sends {ticker, runRoot}; every other
// swarm sends {swarm, subject} — a screener SIG id would fail the server's ticker regex.
import { useCallback, useEffect, useReducer, useRef } from 'react'
import { api } from '../../lib/api'
import type { ChatScope, ChatStyle } from '../../lib/types'
import { initialTurnState, newChatTurnId, turnReduce, windowMessages, type TurnState } from './chatTurn'

export interface ChatTarget {
  swarm: string
  subject: string
  scope: ChatScope
  module?: string
  orbPath?: string
  orbKey?: string
  /** research only: answer from this run root (a resumed conversation's original run) */
  runRoot?: string
  title?: string
}

export interface MobileChat {
  state: TurnState
  send: (text: string) => void
  retry: () => void
  stop: () => void
  reset: () => void
  hydrate: (msgs: TurnState['messages'], conversationId?: string, source?: string) => void
}

export function useMobileChat(target: ChatTarget | null, model: string, style: ChatStyle): MobileChat {
  const [state, dispatch] = useReducer(turnReduce, initialTurnState)
  const abortRef = useRef<AbortController | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // leaving the screen aborts the in-flight request — the reducer's stop already restored the thread
  useEffect(() => () => abortRef.current?.abort(), [])

  const run = useCallback(
    (text: string, turnId: string) => {
      const q = text.trim()
      if (!q || !target || stateRef.current.streaming) return
      const baseline = stateRef.current.messages
      const conversationId = stateRef.current.conversationId
      dispatch({ type: 'send', text: q, turnId, now: Date.now() })
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const live = () => abortRef.current === controller && !controller.signal.aborted
      const isResearch = target.swarm === 'research'
      void api.chatStream(
        {
          scope: target.scope,
          ...(isResearch ? { ticker: target.subject, runRoot: target.runRoot } : { swarm: target.swarm, subject: target.subject }),
          module: target.module,
          orbPath: target.orbPath,
          orbKey: target.orbKey,
          model,
          style,
          conversationId,
          turnId,
          title: target.title,
          messages: windowMessages(baseline, q, turnId),
        },
        {
          signal: controller.signal,
          onMeta: (m) => { if (live()) dispatch({ type: 'meta', sourcePath: m.sourcePath, conversationId: m.conversationId, now: Date.now() }) },
          onStatus: (st) => { if (live()) dispatch({ type: 'status', stage: st.stage ?? '', model: st.model, now: Date.now() }) },
          onThinking: (tok) => { if (live()) dispatch({ type: 'thinking', token: tok }) },
          onComputed: (c) => { if (live()) dispatch({ type: 'computed', card: c }) },
          onRecovered: (turn) => { if (live()) dispatch({ type: 'recovered', turn }) },
          onToken: (tok) => { if (live()) dispatch({ type: 'token', token: tok, now: Date.now() }) },
          onDone: () => { if (live()) { abortRef.current = null; dispatch({ type: 'done' }) } },
          onError: (msg) => { if (live()) { abortRef.current = null; dispatch({ type: 'error', message: msg }) } },
        },
      )
    },
    [target, model, style],
  )

  const send = useCallback((text: string) => run(text, newChatTurnId()), [run])
  // retry re-sends the exact failed question under the SAME turn id — the server treats it as the same
  // turn (idempotent), so a commit that raced the failure can never produce a duplicate answer
  const retry = useCallback(() => {
    const s = stateRef.current
    if (s.retryText && s.retryTurnId) run(s.retryText, s.retryTurnId)
  }, [run])
  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    dispatch({ type: 'stop' })
  }, [])
  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    dispatch({ type: 'reset' })
  }, [])
  const hydrate = useCallback((msgs: TurnState['messages'], conversationId?: string, source?: string) => {
    abortRef.current?.abort()
    abortRef.current = null
    dispatch({ type: 'hydrate', messages: msgs, conversationId, source })
  }, [])

  return { state, send, retry, stop, reset, hydrate }
}
