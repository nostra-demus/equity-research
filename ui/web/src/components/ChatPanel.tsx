import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../lib/store'
import type { ChatScope, ChatStyle } from '../lib/types'

const titleize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// per-scope starter prompts shown in the empty state (clicking one sends it)
const SUGGESTIONS: Record<ChatScope, string[]> = {
  run: ['What’s the bull case in one paragraph?', 'What are the top 3 risks?', 'What would change the rating?'],
  module: ['Summarize this module’s verdict', 'Where is the evidence weakest?', 'What did this module flag to watch?'],
  orb: ['Summarize this output', 'What’s the single most important number?', 'What does this rely on?'],
}

const MODELS: { id: string; label: string; sub: string }[] = [
  { id: 'sonnet', label: 'Sonnet', sub: 'fast · strong default' },
  { id: 'opus', label: 'Opus', sub: 'deepest reasoning' },
  { id: 'haiku', label: 'Haiku', sub: 'fastest · lightest' },
]

// narration style — HOW the answer is phrased (the closed-book + citation rules never change)
const STYLES: { id: ChatStyle; label: string; sub: string }[] = [
  { id: 'simple', label: 'Simple', sub: 'plain English, like you’re 18 — no jargon' },
  { id: 'analyst', label: 'Analyst', sub: 'terse, technical buy-side notes' },
  { id: 'detailed', label: 'Detailed', sub: 'thorough, structured walkthrough' },
]

export function ChatPanel() {
  const reduce = useReducedMotion()
  const close = useStore((s) => s.closeChat)
  const scope = useStore((s) => s.chatScope)
  const chatModule = useStore((s) => s.chatModule)
  const chatOrbKey = useStore((s) => s.chatOrbKey)
  const title = useStore((s) => s.chatTitle)
  const messages = useStore((s) => s.chatMessages)
  const streaming = useStore((s) => s.chatStreaming)
  const error = useStore((s) => s.chatError)
  const source = useStore((s) => s.chatSource)
  const model = useStore((s) => s.chatModel)
  const style = useStore((s) => s.chatStyle)
  const send = useStore((s) => s.sendChatMessage)
  const setScope = useStore((s) => s.setChatScope)
  const setModel = useStore((s) => s.setChatModel)
  const setStyle = useStore((s) => s.setChatStyle)
  const clear = useStore((s) => s.clearChat)
  const staticMode = useStore((s) => s.staticMode)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const launchModule = useStore((s) => s.launchModule)
  const launchAgent = useStore((s) => s.launchAgent)
  // Derive scope availability via useMemo over the STABLE state slices — never select a function that
  // builds fresh arrays each render (that returns a new reference every time and infinite-loops zustand's
  // getSnapshot). The store action is referentially stable, so it's safe as a memo input.
  const scopesFn = useStore((s) => s.chatScopesAvailable)
  const reports = useStore((s) => s.reports)
  const moduleReports = useStore((s) => s.moduleReports)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const graph = useStore((s) => s.graph)
  const scopes = useMemo(() => scopesFn(), [scopesFn, reports, moduleReports, nodeRuntime, graph, nodesByKey])

  const [draft, setDraft] = useState('')
  const [scopeMenu, setScopeMenu] = useState(false)
  const [modelMenu, setModelMenu] = useState(false)
  const [styleMenu, setStyleMenu] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const lockedRef = useRef(true) // auto-scroll to bottom while the user hasn't scrolled up

  // is the chosen scope present on disk? drives the "run this first" body + send-enabled
  const present =
    scope === 'run' ? scopes.run
    : scope === 'module' ? !!scopes.modules.find((m) => m.module === chatModule)?.present
    : !!scopes.orbs.find((o) => o.key === chatOrbKey)?.present

  // focus the composer on open (occasional surface → autofocus is fine)
  useEffect(() => { inputRef.current?.focus() }, [])
  // Esc closes (also aborts any in-flight stream via closeChat)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (scopeMenu || modelMenu || styleMenu) { setScopeMenu(false); setModelMenu(false); setStyleMenu(false) } else close() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, scopeMenu, modelMenu, styleMenu])

  // auto-scroll to the newest token while locked; lock releases when the user scrolls up
  useLayoutEffect(() => {
    const el = threadRef.current
    if (el && lockedRef.current) el.scrollTop = el.scrollHeight
  }, [messages, streaming])
  const onThreadScroll = () => {
    const el = threadRef.current
    if (!el) return
    lockedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  const grow = (el: HTMLTextAreaElement | null) => { if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px' } }

  const doSend = (text: string) => {
    const t = text.trim()
    if (!t || streaming || !present || staticMode) return
    lockedRef.current = true
    void send(t)
    setDraft('')
    requestAnimationFrame(() => grow(inputRef.current))
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(draft) }
  }
  const copyAnswer = (i: number, text: string) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(i); setTimeout(() => setCopied((c) => (c === i ? null : c)), 1400) }).catch(() => {})
  }
  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) doSend(lastUser.content)
  }
  const runThisScope = () => {
    if (scope === 'module' && chatModule) void launchModule(chatModule)
    else if (scope === 'orb' && chatOrbKey) { const n = nodesByKey.get(chatOrbKey); if (n) void launchAgent(n) }
  }

  const enter = reduce ? { opacity: 1 } : { transform: 'translateX(0%)' }
  const from = reduce ? { opacity: 0 } : { transform: 'translateX(100%)' }
  const lastAssistantEmpty = streaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === ''

  return (
    <motion.div
      className="chatpanel"
      initial={from}
      animate={enter}
      exit={from}
      transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.32, 0.72, 0, 1] }}
      role="complementary"
      aria-label="Chat with your data"
    >
      <div className="chatpanel__head">
        <div style={{ minWidth: 0 }}>
          <div className="chatpanel__title">
            <span className="chatpanel__badge">Ask</span>
            <span className="chatpanel__titletext">{title}</span>
          </div>
          <div className="chatpanel__source" title={source || undefined}>
            {source ? `Answering from ${source}` : 'Answers come only from this run’s synthesized output.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {/* scope selector */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ height: 30 }} aria-expanded={scopeMenu} onClick={() => { setScopeMenu((o) => !o); setModelMenu(false); setStyleMenu(false) }} title="Choose what to chat with">
              Scope ▾
            </button>
            {scopeMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setScopeMenu(false)} />
                <div className="dlmenu chatpanel__scopemenu">
                  <div className="pmenu__label">Chat with</div>
                  <ScopeRow label="Whole run" sub="thesis + every module synthesis" present={scopes.run} active={scope === 'run'} onPick={() => { setScope('run'); setScopeMenu(false) }} />
                  {scopes.modules.map((m) => (
                    <ScopeRow key={m.module} label={titleize(m.module)} sub="this module’s output" present={m.present} active={scope === 'module' && chatModule === m.module} onPick={() => { setScope('module', { module: m.module }); setScopeMenu(false) }} />
                  ))}
                  {scope === 'orb' && (
                    <div className="chatpanel__scoperow chatpanel__scoperow--current">
                      <span><b>{title.replace(/^Ask · [^—]+— ?/, '') || 'This orb'}</b><span>single orb · currently selected</span></span>
                      <span className="chatpanel__present">●</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* model selector */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ height: 30 }} aria-expanded={modelMenu} onClick={() => { setModelMenu((o) => !o); setScopeMenu(false); setStyleMenu(false) }} title="Model used for the answer">
              {MODELS.find((m) => m.id === model)?.label ?? model} ▾
            </button>
            {modelMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setModelMenu(false)} />
                <div className="dlmenu">
                  {MODELS.map((m) => (
                    <button key={m.id} className="dlmenu__item" onClick={() => { setModel(m.id); setModelMenu(false) }}>
                      <b>{m.label}{m.id === model ? ' ✓' : ''}</b><span>{m.sub}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* narration-style selector — HOW the answer is phrased (default: Simple) */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ height: 30 }} aria-expanded={styleMenu} onClick={() => { setStyleMenu((o) => !o); setScopeMenu(false); setModelMenu(false) }} title="How answers are explained">
              {STYLES.find((s) => s.id === style)?.label ?? 'Style'} ▾
            </button>
            {styleMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setStyleMenu(false)} />
                <div className="dlmenu">
                  <div className="pmenu__label">Explain answers as…</div>
                  {STYLES.map((s) => (
                    <button key={s.id} className="dlmenu__item" onClick={() => { setStyle(s.id); setStyleMenu(false) }}>
                      <b>{s.label}{s.id === style ? ' ✓' : ''}</b><span>{s.sub}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {messages.length > 0 && <button className="btn btn--ghost" style={{ height: 30 }} onClick={clear} title="Clear this conversation">Clear</button>}
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      <div className="chatpanel__body">
        {!present ? (
          <div className="chatpanel__runfirst">
            <div className="chatpanel__runfirst-h">This {scope === 'run' ? 'run' : scope} hasn’t been produced yet</div>
            <p>Chat answers only from output the engine has already written. Run it first, then come back to ask about it.</p>
            {scope === 'run'
              ? <p className="chatpanel__hintline">Use <b>Run full ▸</b> in the top bar to run the whole pipeline.</p>
              : <button className="btn btn--amber" disabled={staticMode} onClick={runThisScope}>{scope === 'module' ? `Run ${titleize(chatModule || '')} ▸` : 'Run this orb ▸'}</button>}
          </div>
        ) : messages.length === 0 ? (
          <div className="chatpanel__empty">
            <div className="chatpanel__greet">Ask anything about <b>{title.replace(/^Ask · /, '')}</b>.<br />Every answer is drawn only from what the engine already wrote — with the orb or module it came from cited.</div>
            <div className="chatpanel__stylepick">
              <div className="chatpanel__picklabel">How should I explain it?</div>
              <div className="chatpanel__suggest">
                {STYLES.map((s) => (
                  <button key={s.id} className={`chatpanel__chip${style === s.id ? ' chatpanel__chip--on' : ''}`} onClick={() => setStyle(s.id)} title={s.sub} aria-pressed={style === s.id}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="chatpanel__stylepick">
              <div className="chatpanel__picklabel">Or jump in</div>
              <div className="chatpanel__suggest">
                {SUGGESTIONS[scope].map((s) => (
                  <button key={s} className="chatpanel__chip" onClick={() => doSend(s)} disabled={staticMode}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="chatpanel__thread" ref={threadRef} onScroll={onThreadScroll}>
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="chatmsg chatmsg--user">{m.content}</div>
              ) : (
                <div key={i} className="chatmsg chatmsg--assistant">
                  {i === messages.length - 1 && lastAssistantEmpty ? (
                    <div className="chatpanel__typing" aria-label="Thinking"><i /><i /><i /></div>
                  ) : (
                    <>
                      <div className="md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        {streaming && i === messages.length - 1 && <span className="chatpanel__caret" aria-hidden />}
                      </div>
                      {!streaming && m.content && (
                        <button className="chatpanel__copy" onClick={() => copyAnswer(i, m.content)}>{copied === i ? 'Copied' : 'Copy'}</button>
                      )}
                    </>
                  )}
                </div>
              ),
            )}
            {error && (
              <div className="chatpanel__error">
                {error === 'static-deploy'
                  ? <span>Chat runs live — start the engine with <code>npm run dev</code> to ask questions.</span>
                  : <><span>{error}</span><button className="chatpanel__retry" onClick={retry}>Retry</button></>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chatpanel__input">
        <textarea
          ref={inputRef}
          className="chatpanel__textarea"
          placeholder={present ? 'Ask about this output…' : 'Run this output first to chat with it'}
          value={draft}
          disabled={!present || staticMode}
          onChange={(e) => { setDraft(e.target.value); grow(e.target) }}
          onKeyDown={onKeyDown}
          rows={1}
        />
        <button className="btn btn--amber chatpanel__send" disabled={streaming || !draft.trim() || !present || staticMode} onClick={() => doSend(draft)} aria-label="Send">
          {streaming ? '…' : 'Send'}
        </button>
      </div>
    </motion.div>
  )
}

function ScopeRow({ label, sub, present, active, onPick }: { label: string; sub: string; present: boolean; active: boolean; onPick: () => void }) {
  return (
    <button className={`chatpanel__scoperow${active ? ' chatpanel__scoperow--active' : ''}`} aria-disabled={!present} disabled={!present} onClick={present ? onPick : undefined}>
      <span><b>{label}</b><span>{sub}</span></span>
      {present ? <span className="chatpanel__present" title="Ready">●</span> : <span className="chatpanel__runpill">run first</span>}
    </button>
  )
}
