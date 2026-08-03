import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../../lib/store'
import { restoreAskEntryFocus } from '../../lib/askFocus'
import { displayHeadline } from '../../lib/plain'
import type { NewsChatEvidence, NewsChatWindow } from '../../lib/types'
import { ChatErrorNotice } from '../ChatPanel'

const WINDOWS: { id: NewsChatWindow; label: string; intro: string; help: string }[] = [
  { id: '24h', label: '24H', intro: 'the last 24 hours', help: 'News from the last 24 hours. Older news is used only to test what is new.' },
  { id: '7d', label: '7D', intro: 'the last 7 days', help: 'News from the last 7 days. Older news is used to test if a theme is lasting.' },
  { id: 'history', label: 'History', intro: 'all saved history', help: 'Search all saved news.' },
]

const STARTERS = [
  'What changed that may create a trade in the next 1–4 weeks?',
  'Which themes are getting stronger?',
  'Show me second-order winners and losers.',
  'What looks new compared with history?',
]

export function focusSelectedEventDetail(): void {
  if (typeof document === 'undefined') return
  const focus = () => document.querySelector<HTMLElement>('[data-event-detail-focus="true"]')?.focus()
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(focus)
  else focus()
}

export function NewsChatPanel() {
  const reduce = useReducedMotion()
  const dismiss = useStore((s) => s.closeNewsChat)
  const timeWindow = useStore((s) => s.newsChatWindow)
  const setWindow = useStore((s) => s.setNewsChatWindow)
  const messages = useStore((s) => s.newsChatMessages)
  const streaming = useStore((s) => s.newsChatStreaming)
  const error = useStore((s) => s.newsChatError)
  const receipt = useStore((s) => s.newsChatReceipt)
  const completedTurn = useStore((s) => s.newsChatCompletedTurn)
  const retryText = useStore((s) => s.newsChatRetryText)
  const send = useStore((s) => s.sendNewsChatMessage)
  const clear = useStore((s) => s.clearNewsChat)
  const runSignal = useStore((s) => s.sendNewsChatToSignalCheck)
  const openEvent = useStore((s) => s.scSelectEvent)
  const staticMode = useStore((s) => s.staticMode)
  const [draft, setDraft] = useState('')
  const [showSources, setShowSources] = useState(true)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const lockedRef = useRef(true)

  const windowInfo = WINDOWS.find((w) => w.id === timeWindow) || WINDOWS[0]
  const lastAnswer = completedTurn?.answer || ''
  const cited = useMemo(() => {
    const refs = new Set([...lastAnswer.matchAll(/\[((?:N|H)\d+)\]/g)].map((m) => m[1]))
    return (completedTurn?.evidence || []).filter((e) => refs.has(e.ref))
  }, [lastAnswer, completedTurn])
  const canRunSignal = !!completedTurn && !streaming
  const close = useCallback(() => { dismiss(); restoreAskEntryFocus() }, [dismiss])

  useEffect(() => { (staticMode ? closeRef.current : inputRef.current)?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])
  useLayoutEffect(() => {
    const el = threadRef.current
    if (el && lockedRef.current) el.scrollTop = el.scrollHeight
  }, [messages, streaming, showSources])

  const grow = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }
  const doSend = (text: string) => {
    const q = text.trim()
    if (!q || streaming || staticMode) return
    lockedRef.current = true
    setShowSources(true)
    void send(q)
    setDraft('')
    requestAnimationFrame(() => grow(inputRef.current))
  }
  const retry = () => { if (retryText) doSend(retryText) }
  const copy = () => {
    if (!lastAnswer) return
    navigator.clipboard?.writeText(lastAnswer).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    }).catch(() => {})
  }
  const selectEvidence = (ev: NewsChatEvidence) => {
    openEvent(ev.item)
    dismiss()
    focusSelectedEventDetail()
  }
  const onThreadScroll = () => {
    const el = threadRef.current
    if (el) lockedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  const from = reduce ? { opacity: 0 } : { transform: 'translateX(100%)' }
  const enter = reduce ? { opacity: 1 } : { transform: 'translateX(0%)' }
  const waiting = streaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === ''

  return (
    <motion.aside
      className="chatpanel newschat"
      initial={from}
      animate={enter}
      exit={from}
      transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.32, 0.72, 0, 1] }}
      role="complementary"
      aria-label="Chat with saved news"
    >
      <div className="chatpanel__head newschat__head">
        <div className="newschat__heading">
          <div className="chatpanel__title"><span className="chatpanel__badge newschat__badge">Ask</span><span className="chatpanel__titletext">the news wire</span></div>
          <div className="chatpanel__source">
            {receipt
              ? `${receipt.retrievalMode === 'hybrid_neural' ? 'Hybrid + neural' : 'Hybrid search'} · ${receipt.itemsSearched.toLocaleString()} items · ${receipt.sourceCount} sources · ${receipt.relationships?.length || 0} connections · used ${receipt.evidenceCount + receipt.historicalEvidenceCount}`
              : windowInfo.help}
          </div>
        </div>
        <div className="newschat__headbuttons">
          {messages.length > 0 && <button className="btn btn--ghost" onClick={clear}>Clear</button>}
          <button ref={closeRef} data-ask-close="true" className="btn btn--ghost" onClick={close}>Close ✕</button>
        </div>
      </div>

      <div className="newschat__windows" role="group" aria-label="News time window">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            type="button"
            aria-pressed={timeWindow === w.id}
            aria-label={`${w.label}: ${w.help}`}
            className={`newschat__window${timeWindow === w.id ? ' newschat__window--on' : ''}`}
            onClick={() => setWindow(w.id)}
            title={w.help}
          >
            {w.label}
          </button>
        ))}
      </div>

      {!!receipt?.coverageWarnings?.length && (
        <div className="newschat__coverage" role="status">
          <b>Coverage gap:</b> {receipt.coverageWarnings.join(' ')}
        </div>
      )}

      <div className="chatpanel__body">
        {messages.length === 0 ? (
          <div className="chatpanel__empty newschat__empty">
            <div className="chatpanel__greet">
              Ask about <b>{windowInfo.intro}</b>. The answer can use older news to check if something is truly new.
            </div>
            <div className="chatpanel__stylepick">
              <div className="chatpanel__picklabel">Try one</div>
              <div className="chatpanel__suggest">
                {STARTERS.map((s) => <button key={s} className="chatpanel__chip" onClick={() => doSend(s)} disabled={staticMode}>{s}</button>)}
              </div>
            </div>
            <div className="newschat__rule">Chat finds a possible idea. Signal Check tests it. It is fine if no idea passes.</div>
          </div>
        ) : (
          <div className="chatpanel__thread" ref={threadRef} onScroll={onThreadScroll}>
            {messages.map((m, i) => m.role === 'user' ? (
              <div key={i} className="chatmsg chatmsg--user">{m.content}</div>
            ) : (
              <div key={i} className="chatmsg chatmsg--assistant">
                {i === messages.length - 1 && waiting ? (
                  <div className="chatpanel__typing" aria-label="Reading the news"><i /><i /><i /></div>
                ) : (
                  <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>{streaming && i === messages.length - 1 && <span className="chatpanel__caret" aria-hidden />}</div>
                )}
              </div>
            ))}

            {completedTurn && !streaming && (
              <div className="newschat__actions">
                <button className="btn btn--ghost" onClick={copy}>{copied ? 'Copied' : 'Copy answer'}</button>
                <button className="btn btn--amber" onClick={runSignal} disabled={!canRunSignal}>Run Signal Check ▸</button>
              </div>
            )}

            {!streaming && cited.length > 0 && (
              <div className="newschat__sources">
                <button className="newschat__sources-toggle" onClick={() => setShowSources((v) => !v)} aria-expanded={showSources}>
                  {cited.length} cited news item{cited.length === 1 ? '' : 's'} {showSources ? '▴' : '▾'}
                </button>
                {showSources && (
                  <div className="newschat__source-list">
                    {cited.map((ev) => (
                      <button key={ev.ref} className="newschat__source-row" onClick={() => selectEvidence(ev)}>
                        <span className={`newschat__ref${ev.historical ? ' newschat__ref--old' : ''}`}>{ev.ref}</span>
                        <span className="newschat__source-copy">
                          <b>{displayHeadline(ev.item)}</b>
                          <span>{ev.item.source_name} · {new Date(ev.item.ts).toLocaleString()}{ev.historical ? ' · older match' : ''}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
        {error && <ChatErrorNotice error={error} retryText={retryText} onRetry={retry} staticMessage="News chat runs on the live engine." />}
      </div>

      <div className="chatpanel__input">
        <textarea
          ref={inputRef}
          data-ask-composer="true"
          className="chatpanel__textarea"
          placeholder={`Ask the ${windowInfo.label.toLowerCase()}…`}
          value={draft}
          disabled={staticMode}
          onChange={(e) => { setDraft(e.target.value); grow(e.target) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(draft) } }}
          rows={1}
        />
        <button className="btn btn--amber chatpanel__send" disabled={streaming || !draft.trim() || staticMode} onClick={() => doSend(draft)}>
          {streaming ? '…' : 'Send'}
        </button>
      </div>
    </motion.aside>
  )
}
