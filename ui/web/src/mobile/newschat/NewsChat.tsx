// The no-signal form of unified Ask: the saved wire is the only available evidence shelf until a signal
// is opened. Completed turns use the same durable History store as desktop and research Ask.
//   - three windows (24h / 7d / history); SWITCHING A WINDOW WIPES THE THREAD (a different book)
//   - request is {window, model, messages ≤ 30, conversationId, turnId}; completed turns are durable
//   - the header sub-line is the search RECEIPT (engine · items · sources · used)
//   - [N1]/[H1] refs in the LAST completed answer expand into the cited-items list
//   - waiting state is typing dots, no thinking block, no computed cards
// Desktop-only pieces stay desktop-only (stated in the plan): tapping a cited item opens it in the
// wire, and "Run Signal Check" seeds the intake form — neither surface exists on the phone.
import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { shouldStick } from '../chat/autoscroll'
import type { ChatConversationDetail, ChatMessage, NewsChatEvidence, NewsChatReceipt } from '../../lib/types'
import { newChatTurnId } from '../chat/chatTurn'

// the same lazy renderer the run chat uses — a news answer carries the identical markdown (lists,
// tables, emphasis), and a plain-text div renders that as literal punctuation
const Markdown = lazy(() => import('../chat/Markdown'))

const WINDOWS = [
  { id: '24h', label: '24h', greeting: 'the last 24 hours' },
  { id: '7d', label: '7d', greeting: 'the last 7 days' },
  { id: 'history', label: 'history', greeting: 'all saved history' },
] as const
type WindowId = (typeof WINDOWS)[number]['id']

const NEWS_MAX = 30

export function NewsChat({ model, staticMode, initial }: { model: string; staticMode?: boolean; initial?: ChatConversationDetail | null }) {
  const [win, setWin] = useState<WindowId>('24h')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [receipt, setReceipt] = useState<NewsChatReceipt | null>(null)
  const [evidence, setEvidence] = useState<NewsChatEvidence[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryText, setRetryText] = useState<string | null>(null)
  const [retryTurnId, setRetryTurnId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const abortRef = useRef<AbortController | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  const baselineRef = useRef<ChatMessage[]>([])
  const pendingTextRef = useRef('')
  const baselineConversationRef = useRef<string | undefined>()

  useEffect(() => {
    if (!initial || initial.scope !== 'wire') return
    const messages = Array.isArray(initial.messages) ? initial.messages : []
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant')
    const memory = lastAssistant?.memory?.kind === 'news-wire' ? lastAssistant.memory : undefined
    setWin(memory?.window || '24h')
    setMessages(messages.map((message) => ({ role: message.role, content: message.content, turnId: message.turnId, memory: message.memory })))
    setConversationId(initial.id)
    setReceipt(memory?.receipt || null)
    setEvidence(Array.isArray(memory?.evidence) ? memory.evidence : [])
    setError(null)
    setRetryText(null)
    setRetryTurnId(null)
    setStreaming(false)
  }, [initial])

  useEffect(() => () => abortRef.current?.abort(), [])

  // follow the stream only while the user is inside the same 96px bottom band the run thread uses, so
  // scrolling up to read an earlier answer is not yanked back on the next token
  useLayoutEffect(() => {
    const el = threadRef.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  const switchWindow = (w: WindowId) => {
    if (w === win) return
    abortRef.current?.abort()
    setWin(w)
    // a different window is a different evidence book — the desktop wipes everything, so do we
    setMessages([])
    setReceipt(null)
    setEvidence([])
    setError(null)
    setRetryText(null)
    setRetryTurnId(null)
    setConversationId(undefined)
    setStreaming(false)
  }

  const send = useCallback((text: string, requestedTurnId?: string) => {
    const q = text.trim()
    if (!q || streaming || staticMode) return
    // Trim the baseline to an even count BEFORE appending the new turn (mirrors desktop store.ts
    // sendNewsChatMessage's `messages.slice(-(NEWS_CHAT_MAX_MESSAGES - 2))`). Slicing to NEWS_MAX only
    // after appending removes just the oldest USER message once history exceeds the cap, so every
    // later request starts with an orphaned assistant answer and the model sees mispaired history.
    const baseline = messages.slice(-(NEWS_MAX - 2))
    const baselineConversation = conversationId
    baselineRef.current = baseline
    baselineConversationRef.current = baselineConversation
    pendingTextRef.current = q
    const turnId = requestedTurnId || newChatTurnId()
    const next = [...baseline, { role: 'user' as const, content: q, turnId }, { role: 'assistant' as const, content: '', turnId }]
    setMessages(next)
    setStreaming(true)
    setError(null)
    setRetryText(null)
    setRetryTurnId(null)
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    // Every callback is gated on this request still being the live one. Switching windows aborts the
    // stream, and the abort itself arrives as onError — which would otherwise restore baselineRef, i.e.
    // repopulate the thread the window switch just deliberately wiped, with the PREVIOUS window's
    // messages and an error banner. The guard makes a superseded request silent instead.
    const live = () => abortRef.current === controller && !controller.signal.aborted
    const idx = next.length - 1
    let turnReceipt: NewsChatReceipt | null = null
    let turnEvidence: NewsChatEvidence[] = []
    void api.newsChatStream(
      { window: win, model, conversationId: baselineConversation, turnId, title: 'Ask · news wire', messages: [...baseline, { role: 'user' as const, content: q }].slice(-NEWS_MAX) },
      {
        signal: controller.signal,
        onMeta: (m) => { if (live()) { turnReceipt = m.receipt; turnEvidence = m.evidence; setReceipt(m.receipt); setEvidence(m.evidence); if (m.conversationId) setConversationId(m.conversationId) } },
        onToken: (t) => { if (live()) setMessages((ms) => { const c = ms.slice(); if (c[idx]?.role === 'assistant') c[idx] = { ...c[idx], content: c[idx].content + t }; return c }) },
        onDone: () => { if (live()) { abortRef.current = null; setStreaming(false); setMessages((current) => { const copy = current.slice(); if (copy[idx]?.role === 'assistant' && turnReceipt) copy[idx] = { ...copy[idx], memory: { kind: 'news-wire', window: win, receipt: turnReceipt, evidence: turnEvidence } }; return copy }) } },
        onError: (msg) => {
          if (!live()) return
          abortRef.current = null
          setStreaming(false)
          setMessages(baselineRef.current)
          setConversationId(baselineConversationRef.current)
          setError(msg)
          // Keep the failed question retrievable instead of forcing a retype on a transient 429 or a
          // dropped stream (matches the regular mobile chat's stop/error retry chip).
          setRetryText(pendingTextRef.current)
          setRetryTurnId(turnId)
        },
      },
    )
  }, [messages, streaming, win, model, staticMode, conversationId])

  const stop = useCallback(() => {
    if (!streaming) return
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
    setMessages(baselineRef.current)
    setRetryText(pendingTextRef.current)
    setRetryTurnId(null)
  }, [streaming])

  const retry = useCallback(() => { if (retryText) send(retryText, retryTurnId || undefined) }, [retryText, retryTurnId, send])

  // refs in the LAST completed answer only (the desktop rule)
  const last = [...messages].reverse().find((m) => m.role === 'assistant' && m.content)
  const refIds = new Set<string>()
  if (last && !streaming) for (const m of last.content.matchAll(/\[((?:N|H)\d+)\]/g)) refIds.add(m[1])
  const cited = evidence.filter((e) => refIds.has(e.ref))

  return (
    <>
      <div className="mnews__bar">
        {WINDOWS.map((w) => (
          <button key={w.id} className={`msheet__tab${w.id === win ? ' msheet__tab--on' : ''}`} onClick={() => switchWindow(w.id)}>{w.label}</button>
        ))}
      </div>
      <div className="mnews__receipt">
        {receipt
          ? `${receipt.retrievalMode === 'hybrid_neural' ? 'Hybrid + neural' : 'Hybrid search'} · ${receipt.itemsSearched} items · ${receipt.sourceCount} sources · used ${receipt.evidenceCount + receipt.historicalEvidenceCount}`
          : `Ask about ${WINDOWS.find((w) => w.id === win)?.greeting}`}
      </div>
      {receipt && receipt.coverageWarnings.length > 0 && (
        <div className="mchat__static">{receipt.coverageWarnings.join(' ')}</div>
      )}
      <div
        className="mchat__thread"
        ref={threadRef}
        onScroll={(e) => { const el = e.currentTarget; stickRef.current = shouldStick(el.scrollTop, el.scrollHeight, el.clientHeight) }}
      >
        {messages.length === 0 && (
          <div className="mchat__starters">
            <div className="mchat__startershead">Or jump in</div>
            {['What moved today that matters?', 'Anything on the companies we cover?', 'Biggest supply-side story this week?'].map((q) => (
              <button key={q} className="mchat__starter" disabled={staticMode} onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          m.role === 'user'
            ? <div key={i} className="mchat__msg mchat__msg--user">{m.content}</div>
            : (
              <div key={i} className="mchat__msg mchat__msg--ai">
                {m.content
                  ? (
                    <Suspense fallback={<div className="mchat__md mchat__md--plain">{m.content}</div>}>
                      <Markdown text={m.content} />
                    </Suspense>
                  )
                  : null}
                {streaming && i === messages.length - 1 ? <span className="mchat__md--plain">…</span> : null}
              </div>
            )
        ))}
        {cited.length > 0 && (
          <details className="mnews__cited">
            <summary>{cited.length} cited news item{cited.length > 1 ? 's' : ''}</summary>
            {cited.map((e) => (
              <div key={e.ref} className="mnews__citedrow">
                <span className="mnews__ref mono">{e.ref}</span>
                <span className="mnews__citedbody">
                  {(e.item as any)?.headline_en || (e.item as any)?.headline || '(headline unavailable)'}
                  <span className="msnap__faint"> {(e.item as any)?.source_name}</span>
                </span>
              </div>
            ))}
          </details>
        )}
        {/* keeps the surface's own "typing dots, no thinking block" waiting state (the inline "…" above)
            while still giving a phone user a real way to stop a long or unwanted request — previously
            only switching windows or leaving the surface could interrupt a stream */}
        {streaming && (
          <div className="mchat__work" role="status">
            <button className="mchat__stop" onClick={stop}>◼ Stop</button>
          </div>
        )}
        {error && (
          <div className="mchat__error" role="alert">
            <div>{error}</div>
            {retryText && <button className="mchat__retry" onClick={retry}>Retry</button>}
          </div>
        )}
        {!streaming && !error && retryText && (
          <div className="mchat__stopped">
            Stopped. <button className="mchat__retry" onClick={retry}>Ask again</button>
          </div>
        )}
      </div>
      <div className="mchat__composer">
        <textarea
          className="mchat__input"
          rows={1}
          disabled={staticMode}
          placeholder={staticMode ? 'Chat runs live — start the engine to ask questions' : `Ask ${WINDOWS.find((w) => w.id === win)?.greeting}…`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && matchMedia('(hover: hover) and (pointer: fine)').matches) {
              e.preventDefault()
              send((e.target as HTMLTextAreaElement).value)
              ;(e.target as HTMLTextAreaElement).value = ''
            }
          }}
        />
        <button
          className="mchat__send"
          disabled={streaming || staticMode}
          onClick={(e) => {
            const ta = (e.currentTarget.parentElement?.querySelector('.mchat__input') as HTMLTextAreaElement)
            if (ta) { send(ta.value); ta.value = '' }
          }}
          aria-label="Send"
        >↑</button>
      </div>
    </>
  )
}
