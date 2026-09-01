import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore, isFlowActive } from '../lib/store'
import { focusAskDrawer, restoreAskEntryFocus } from '../lib/askFocus'
import type { AskMemoryMode, ChatScope, ChatStyle, ChatWork } from '../lib/types'
import { ComputedCard } from './chat/computed'
import { ChatModelMenu } from './chat/ChatModelMenu'

const titleize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// per-scope starter prompts shown in the empty state (clicking one sends it)
const SUGGESTIONS: Record<ChatScope, string[]> = {
  run: ['What’s the bull case in one paragraph?', 'What are the top 3 risks?', 'What would change the rating?'],
  module: ['Summarize this module’s verdict', 'Where is the evidence weakest?', 'What did this module flag to watch?'],
  orb: ['Summarize this output', 'What’s the single most important number?', 'What does this rely on?'],
  wire: ['What changed today?', 'Which themes are getting stronger?', 'What looks new compared with history?'],
}

const MEMORY_MODES: { id: AskMemoryMode; label: string; sub: string }[] = [
  { id: 'auto', label: 'Auto sources', sub: 'Ask uses the run, matching past calls, saved news, and earlier chats when useful' },
  { id: 'run', label: 'This run only', sub: 'Use this run plus any exact matching past call; ignore news and earlier chats' },
  { id: 'news', label: 'Include news', sub: 'Use the run, matching past calls, saved news, and earlier chats' },
]

// narration style — HOW the answer is phrased (the closed-book + citation rules never change)
const STYLES: { id: ChatStyle; label: string; sub: string }[] = [
  { id: 'simple', label: 'Simple', sub: 'plain English, like you’re 18 — no jargon' },
  { id: 'analyst', label: 'Analyst', sub: 'terse, technical buy-side notes' },
  { id: 'detailed', label: 'Detailed', sub: 'thorough, structured walkthrough' },
]

export function retryAndFocusAskDrawer(onRetry: () => void): void {
  onRetry()
  focusAskDrawer()
}

export function ChatErrorNotice({ error, retryText, onRetry, staticMessage }: { error: string; retryText?: string; onRetry: () => void; staticMessage: ReactNode }) {
  return (
    <div className="chatpanel__error" role="alert">
      {error === 'static-deploy'
        ? <span>{staticMessage}</span>
        : <><span>{error}</span>{retryText && <button className="chatpanel__retry" onClick={() => retryAndFocusAskDrawer(onRetry)}>Retry</button>}</>}
    </div>
  )
}

export function ChatPanel() {
  const reduce = useReducedMotion()
  const dismiss = useStore((s) => s.closeChat)
  const scope = useStore((s) => s.chatScope)
  const chatModule = useStore((s) => s.chatModule)
  const chatOrbKey = useStore((s) => s.chatOrbKey)
  // set only for a resumed conversation the current run can't serve — it answers from its original run
  const answerRunRoot = useStore((s) => s.chatAnswerRunRoot)
  const title = useStore((s) => s.chatTitle)
  const messages = useStore((s) => s.chatMessages)
  const streaming = useStore((s) => s.chatStreaming)
  const work = useStore((s) => s.chatWork)
  const error = useStore((s) => s.chatError)
  const retryText = useStore((s) => s.chatRetryText)
  const retryTurnId = useStore((s) => s.chatRetryTurnId)
  const source = useStore((s) => s.chatSource)
  const model = useStore((s) => s.chatModel)
  const style = useStore((s) => s.chatStyle)
  const memoryMode = useStore((s) => s.chatMemoryMode)
  const memory = useStore((s) => s.chatMemory)
  const send = useStore((s) => s.sendChatMessage)
  const setScope = useStore((s) => s.setChatScope)
  const setModel = useStore((s) => s.setChatModel)
  const setStyle = useStore((s) => s.setChatStyle)
  const setMemoryMode = useStore((s) => s.setChatMemoryMode)
  const clear = useStore((s) => s.clearChat)
  const openHistory = useStore((s) => s.openChatHistory)
  const historyOpen = useStore((s) => s.chatHistoryOpen)
  const staticMode = useStore((s) => s.staticMode)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const launchModule = useStore((s) => s.launchModule)
  const launchAgent = useStore((s) => s.launchAgent)
  // this panel's own launch (module or orb) is awaiting the server ack — the run-first button spins
  const chatLaunchPending = useStore((s) => !!s.launchPending && (s.launchPending.key === `module:${s.chatModule || ''}` || s.launchPending.key === `agent:${s.chatOrbKey || ''}`))
  // Derive scope availability via useMemo over the STABLE state slices — never select a function that
  // builds fresh arrays each render (that returns a new reference every time and infinite-loops zustand's
  // getSnapshot). The store action is referentially stable, so it's safe as a memo input.
  const scopesFn = useStore((s) => s.chatScopesAvailable)
  const reports = useStore((s) => s.reports)
  const moduleReports = useStore((s) => s.moduleReports)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const graph = useStore((s) => s.graph)
  // the flow stage (screener) derives its scopes from the screener graph slices instead — keep them in the
  // memo deps so a screener conversation's scope availability recomputes as the signal's orbs finish
  const scGraph = useStore((s) => s.scGraph)
  const scNodesByKey = useStore((s) => s.scNodesByKey)
  const scRuntime = useStore((s) => s.scRuntime)
  // scopesFn() branches internally on isFlowActive(s) — keep that same slice in the deps array so scopes
  // recomputes if the active swarm's flow status changes while this panel stays mounted.
  const isFlow = useStore((s) => isFlowActive(s))
  const scopes = useMemo(() => scopesFn(), [scopesFn, reports, moduleReports, nodeRuntime, graph, nodesByKey, scGraph, scNodesByKey, scRuntime, isFlow])
  // the flow stage (screener) runs its orbs through the gauntlet, not from this panel — so its "not produced
  // yet" state offers no in-panel launch (the constellation launch actions don't apply to a screener signal)

  const [draft, setDraft] = useState('')
  const [scopeMenu, setScopeMenu] = useState(false)
  const [modelMenu, setModelMenu] = useState(false)
  const [styleMenu, setStyleMenu] = useState(false)
  const [memoryMenu, setMemoryMenu] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const lockedRef = useRef(true) // auto-scroll to bottom while the user hasn't scrolled up

  // is the chosen scope present on disk? drives the "run this first" body + send-enabled. A resumed
  // conversation that resolved to a concrete answer run (its original run, when the current one can't serve
  // it) is always chat-able — never gate an already-answered thread behind "run this first".
  const present =
    !!answerRunRoot ||
    (scope === 'run' ? scopes.run
    : scope === 'module' ? !!scopes.modules.find((m) => m.module === chatModule)?.present
    : scope === 'orb' ? !!scopes.orbs.find((o) => o.key === chatOrbKey)?.present
    : true)

  const close = useCallback(() => { dismiss(); restoreAskEntryFocus() }, [dismiss])

  // Focus the composer when it can accept input. If the output is not ready (or this is the static
  // showcase), focus the drawer's Close control instead of silently targeting a disabled textarea.
  useEffect(() => { (present && !staticMode ? inputRef.current : closeRef.current)?.focus() }, [])
  // Esc closes (also aborts any in-flight stream via closeChat). When the History panel is open ON TOP of
  // this one, it owns Escape — ignore it here so one keypress doesn't close both.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (scopeMenu || modelMenu || styleMenu || memoryMenu) { setScopeMenu(false); setModelMenu(false); setStyleMenu(false); setMemoryMenu(false) } else if (!historyOpen) close() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, scopeMenu, modelMenu, styleMenu, memoryMenu, historyOpen])

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

  const doSend = (text: string, turnId?: string) => {
    const t = text.trim()
    if (!t || streaming || !present || staticMode) return
    lockedRef.current = true
    void send(t, turnId)
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
    if (retryText) doSend(retryText, retryTurnId)
  }
  const runThisScope = () => {
    if (scope === 'module' && chatModule) void launchModule(chatModule)
    else if (scope === 'orb' && chatOrbKey) { const n = nodesByKey.get(chatOrbKey); if (n) void launchAgent(n) }
  }

  const enter = reduce ? { opacity: 1 } : { transform: 'translateX(0%)' }
  const from = reduce ? { opacity: 0 } : { transform: 'translateX(100%)' }

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
          <div className="chatpanel__source" title={memory?.reason || source || undefined}>
            {memory
              ? `Used: ${memory.shelves.map((shelf) => `${shelf.label}${shelf.count > 1 ? ` (${shelf.count})` : ''}`).join(' · ')}`
              : memoryMode === 'auto' ? 'Auto will choose from this run, matching past calls, saved news, and your earlier chats.' : memoryMode === 'run' ? 'Using this run and an exact matching past call.' : 'Will include matching past calls, saved news, and earlier chats.'}
            {messages.some((m) => m.role === 'assistant' && m.computed?.some((c) => c.kind === 'scenario')) && <span className="chatpanel__source-modeled"> · modeled with the sensitivity engine</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {/* source routing is optional. Auto is the default; no choice is required before asking. */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ height: 30 }} aria-expanded={memoryMenu} onClick={() => { setMemoryMenu((o) => !o); setScopeMenu(false); setModelMenu(false); setStyleMenu(false) }} title="Optional source override; Auto normally decides">
              {MEMORY_MODES.find((mode) => mode.id === memoryMode)?.label ?? 'Auto sources'} ▾
            </button>
            {memoryMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setMemoryMenu(false)} />
                <div className="dlmenu">
                  <div className="pmenu__label">Use for the next question</div>
                  {MEMORY_MODES.map((mode) => (
                    <button key={mode.id} className="dlmenu__item" onClick={() => { setMemoryMode(mode.id); setMemoryMenu(false) }}>
                      <b>{mode.label}{mode.id === memoryMode ? ' ✓' : ''}</b><span>{mode.sub}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* scope selector */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ height: 30 }} aria-expanded={scopeMenu} onClick={() => { setScopeMenu((o) => !o); setModelMenu(false); setStyleMenu(false); setMemoryMenu(false) }} title="Choose what to chat with">
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
          <ChatModelMenu
            model={model}
            open={modelMenu}
            onOpenChange={(open) => { setModelMenu(open); if (open) { setScopeMenu(false); setStyleMenu(false); setMemoryMenu(false) } }}
            onSelect={setModel}
          />
          {/* narration-style selector — HOW the answer is phrased (default: Simple) */}
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ height: 30 }} aria-expanded={styleMenu} onClick={() => { setStyleMenu((o) => !o); setScopeMenu(false); setModelMenu(false); setMemoryMenu(false) }} title="How answers are explained">
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
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={openHistory} title="View and reopen saved conversations">History</button>
          {messages.length > 0 && <button className="btn btn--ghost" style={{ height: 30 }} onClick={clear} title="Start a new conversation (this one stays saved in History)">New</button>}
          <button ref={closeRef} data-ask-close="true" className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      <div className="chatpanel__body">
        {!!memory?.newsEvidence?.length && (
          <details className="chatpanel__memory-evidence">
            <summary>{memory.newsEvidence.length} saved news item{memory.newsEvidence.length === 1 ? '' : 's'} considered</summary>
            <div>
              {memory.newsEvidence.slice(0, 6).map((evidence) => evidence.item.url
                ? <a key={evidence.ref} href={evidence.item.url} target="_blank" rel="noreferrer"><b>{evidence.ref}</b> {evidence.item.headline_en || evidence.item.headline}</a>
                : <span key={evidence.ref}><b>{evidence.ref}</b> {evidence.item.headline_en || evidence.item.headline}</span>)}
            </div>
          </details>
        )}
        {!present ? (
          <div className="chatpanel__runfirst">
            <div className="chatpanel__runfirst-h">This {scope === 'run' ? 'run' : scope} hasn’t been produced yet</div>
            <p>Chat answers only from output the engine has already written. Run it first, then come back to ask about it.</p>
            {isFlow
              ? <p className="chatpanel__hintline">This part of the signal hasn’t finished yet — it runs as part of the gauntlet. Come back once it completes.</p>
              : scope === 'run'
                ? <p className="chatpanel__hintline">Use <b>Run full ▸</b> in the top bar to run the whole pipeline.</p>
                : <button className="btn btn--amber" disabled={staticMode || !!chatLaunchPending} onClick={runThisScope}>{chatLaunchPending ? 'Starting…' : scope === 'module' ? `Run ${titleize(chatModule || '')} ▸` : 'Run this orb ▸'}</button>}
          </div>
        ) : messages.length === 0 && !error ? (
          <div className="chatpanel__empty">
            <div className="chatpanel__greet">Ask anything about <b>{title.replace(/^Ask · /, '')}</b>.<br />Auto chooses the useful shelves: this run, matching past calls and lessons, saved news when freshness matters, and your relevant earlier chats. The line above shows what it used.</div>
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
            {messages.map((m, i) => {
              if (m.role === 'user') return <div key={i} className="chatmsg chatmsg--user">{m.content}</div>
              // The live turn shows exactly what is happening, as it happens: the model's own streamed
              // reasoning (ThinkingBlock), the answer text growing token-by-token, and a working strip
              // naming the current REAL stage with a running stopwatch — never a blind spinner.
              const live = streaming && i === messages.length - 1
              return (
                <div key={i} className="chatmsg chatmsg--assistant">
                  {m.thinking && <ThinkingBlock text={m.thinking} live={live && work?.stage === 'thinking'} />}
                  {m.computed?.map((c, ci) => <ComputedCard key={ci} c={c} />)}
                  {m.content !== '' && (
                    <div className="md">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      {live && <span className="chatpanel__caret" aria-hidden />}
                    </div>
                  )}
                  {live && work && <WorkStrip work={work} reduce={!!reduce} />}
                  {!streaming && m.content && (
                    <button className="chatpanel__copy" onClick={() => copyAnswer(i, m.content)}>{copied === i ? 'Copied' : 'Copy'}</button>
                  )}
                </div>
              )
            })}
            {error && <ChatErrorNotice error={error} retryText={retryText} onRetry={retry} staticMessage={<>Chat runs live — start the engine with <code>npm run dev</code> to ask questions.</>} />}
          </div>
        )}
      </div>

      <div className="chatpanel__input">
        <textarea
          ref={inputRef}
          data-ask-composer="true"
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

// Live working strip for the in-flight turn. Every label maps 1:1 to a REAL streamed lifecycle event
// (ChatWork in types.ts) and the stopwatch is true elapsed time — nothing here is simulated progress.
const WORK_LABELS: Record<ChatWork['stage'], string> = {
  sending: 'Loading research…',
  sources: 'Loading your selected sources…',
  context: 'Research ready — starting your selected model…',
  modeling: 'Modeling the scenario…',
  starting: 'Starting the engine…',
  connected: 'Reading the context…',
  thinking: 'Thinking…',
  writing: 'Writing the answer…',
}

function WorkStrip({ work, reduce }: { work: ChatWork; reduce: boolean }) {
  // 10Hz stopwatch so the panel visibly moves the whole time (whole seconds under reduced motion —
  // the tick is a text update, but a calmer cadence honors the preference in spirit)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), reduce ? 1000 : 100)
    return () => clearInterval(t)
  }, [reduce])
  const secs = Math.max(0, now - work.startedAt) / 1000
  return (
    <div className="chatpanel__work">
      <span className="chatpanel__workdot" aria-hidden />
      <span className="chatpanel__worklabel" role="status">{WORK_LABELS[work.stage]}</span>
      {work.model && <span className="chatpanel__workmodel" title={work.model}>{work.model.replace(/^claude-/, '')}</span>}
      <span className="chatpanel__worktimer" aria-hidden>{reduce ? `${Math.floor(secs)}s` : `${secs.toFixed(1)}s`}</span>
    </div>
  )
}

// The model's reasoning, verbatim as it streams. Open + following the newest thought while the model is
// thinking; collapses to a one-line toggle once the answer starts, unless the user pins it open — so the
// thought process stays readable during AND after the turn (including reopened saved conversations).
function ThinkingBlock({ text, live }: { text: string; live: boolean }) {
  const [pinned, setPinned] = useState<boolean | null>(null) // null = follow the live default
  const open = pinned ?? live
  const bodyRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const el = bodyRef.current
    if (el && live) el.scrollTop = el.scrollHeight // keep the newest thought in view while streaming
  }, [text, live, open])
  return (
    <div className="chatpanel__think">
      <button className="chatpanel__think-head" onClick={() => setPinned(!open)} aria-expanded={open}>
        <span className="chatpanel__think-title">{live ? 'Thinking' : 'Thought process'}</span>
        <span className="chatpanel__think-caret" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="chatpanel__think-body" ref={bodyRef}>{text}</div>}
    </div>
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
