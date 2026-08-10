// The screener's SECOND chat — the news wire, exactly as the desktop NewsChatPanel behaves and
// deliberately different from the run chat (a different closed book):
//   - three windows (24h / 7d / history); SWITCHING A WINDOW WIPES THE THREAD (a different book)
//   - request is {window, model, messages ≤ 30} — no scope, no style, no conversationId: these chats
//     are ephemeral by design and are NOT saved to history (the server never persists them)
//   - the header sub-line is the search RECEIPT (engine · items · sources · used)
//   - [N1]/[H1] refs in the LAST completed answer expand into the cited-items list
//   - waiting state is typing dots, no thinking block, no computed cards
// Desktop-only pieces stay desktop-only (stated in the plan): tapping a cited item opens it in the
// wire, and "Run Signal Check" seeds the intake form — neither surface exists on the phone.
import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { shouldStick } from '../chat/autoscroll'
import type { ChatMessage, NewsChatEvidence, NewsChatReceipt } from '../../lib/types'

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

export function NewsChat({ model }: { model: string }) {
  const [win, setWin] = useState<WindowId>('24h')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [receipt, setReceipt] = useState<NewsChatReceipt | null>(null)
  const [evidence, setEvidence] = useState<NewsChatEvidence[]>([])
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  const baselineRef = useRef<ChatMessage[]>([])

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
    setStreaming(false)
  }

  const send = useCallback((text: string) => {
    const q = text.trim()
    if (!q || streaming) return
    baselineRef.current = messages
    const next = [...messages, { role: 'user' as const, content: q }, { role: 'assistant' as const, content: '' }]
    setMessages(next)
    setStreaming(true)
    setError(null)
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    // Every callback is gated on this request still being the live one. Switching windows aborts the
    // stream, and the abort itself arrives as onError — which would otherwise restore baselineRef, i.e.
    // repopulate the thread the window switch just deliberately wiped, with the PREVIOUS window's
    // messages and an error banner. The guard makes a superseded request silent instead.
    const live = () => abortRef.current === controller && !controller.signal.aborted
    const idx = next.length - 1
    void api.newsChatStream(
      { window: win, model, messages: [...messages, { role: 'user', content: q }].slice(-NEWS_MAX) } as any,
      {
        signal: controller.signal,
        onMeta: (m) => { if (live()) { setReceipt(m.receipt); setEvidence(m.evidence) } },
        onToken: (t) => { if (live()) setMessages((ms) => { const c = ms.slice(); if (c[idx]?.role === 'assistant') c[idx] = { ...c[idx], content: c[idx].content + t }; return c }) },
        onDone: () => { if (live()) { abortRef.current = null; setStreaming(false) } },
        onError: (msg) => {
          if (!live()) return
          abortRef.current = null
          setStreaming(false)
          setMessages(baselineRef.current)
          setError(msg)
        },
      },
    )
  }, [messages, streaming, win, model])

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
          ? `${receipt.retrievalMode === 'hybrid_neural' ? 'Hybrid + neural' : 'Hybrid search'} · ${receipt.itemsSearched} items · ${receipt.sourceCount} sources · used ${receipt.evidenceCount}`
          : `Ask about ${WINDOWS.find((w) => w.id === win)?.greeting}`}
      </div>
      {receipt && receipt.coverageWarnings.length > 0 && (
        <div className="mchat__static">{receipt.coverageWarnings[0]}</div>
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
              <button key={q} className="mchat__starter" onClick={() => send(q)}>{q}</button>
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
        {error && <div className="mchat__error" role="alert">{error}</div>}
      </div>
      <div className="mchat__composer">
        <textarea
          className="mchat__input"
          rows={1}
          placeholder={`Ask ${WINDOWS.find((w) => w.id === win)?.greeting}…`}
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
          disabled={streaming}
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
