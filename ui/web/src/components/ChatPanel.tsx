import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore, isFlowActive } from '../lib/store'
import type { ChatComputed, ChatScope, ChatStyle, ChatWork } from '../lib/types'

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
  // set only for a resumed conversation the current run can't serve — it answers from its original run
  const answerRunRoot = useStore((s) => s.chatAnswerRunRoot)
  const title = useStore((s) => s.chatTitle)
  const messages = useStore((s) => s.chatMessages)
  const streaming = useStore((s) => s.chatStreaming)
  const work = useStore((s) => s.chatWork)
  const error = useStore((s) => s.chatError)
  const source = useStore((s) => s.chatSource)
  const model = useStore((s) => s.chatModel)
  const style = useStore((s) => s.chatStyle)
  const send = useStore((s) => s.sendChatMessage)
  const setScope = useStore((s) => s.setChatScope)
  const setModel = useStore((s) => s.setChatModel)
  const setStyle = useStore((s) => s.setChatStyle)
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
  const [copied, setCopied] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const lockedRef = useRef(true) // auto-scroll to bottom while the user hasn't scrolled up

  // is the chosen scope present on disk? drives the "run this first" body + send-enabled. A resumed
  // conversation that resolved to a concrete answer run (its original run, when the current one can't serve
  // it) is always chat-able — never gate an already-answered thread behind "run this first".
  const present =
    !!answerRunRoot ||
    (scope === 'run' ? scopes.run
    : scope === 'module' ? !!scopes.modules.find((m) => m.module === chatModule)?.present
    : !!scopes.orbs.find((o) => o.key === chatOrbKey)?.present)

  // focus the composer on open (occasional surface → autofocus is fine)
  useEffect(() => { inputRef.current?.focus() }, [])
  // Esc closes (also aborts any in-flight stream via closeChat). When the History panel is open ON TOP of
  // this one, it owns Escape — ignore it here so one keypress doesn't close both.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (scopeMenu || modelMenu || styleMenu) { setScopeMenu(false); setModelMenu(false); setStyleMenu(false) } else if (!historyOpen) close() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, scopeMenu, modelMenu, styleMenu, historyOpen])

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
            {messages.some((m) => m.role === 'assistant' && m.computed?.some((c) => c.kind === 'scenario')) && <span className="chatpanel__source-modeled"> · modeled with the sensitivity engine</span>}
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
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={openHistory} title="View and reopen saved conversations">History</button>
          {messages.length > 0 && <button className="btn btn--ghost" style={{ height: 30 }} onClick={clear} title="Start a new conversation (this one stays saved in History)">New</button>}
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      <div className="chatpanel__body">
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

// Live working strip for the in-flight turn. Every label maps 1:1 to a REAL streamed lifecycle event
// (ChatWork in types.ts) and the stopwatch is true elapsed time — nothing here is simulated progress.
const WORK_LABELS: Record<ChatWork['stage'], string> = {
  sending: 'Sending your question…',
  context: 'Context assembled — starting the engine…',
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

// number helpers for the computed card — the figures are the ENGINE's; these only format, never recompute.
const nfmt = (n: number | null | undefined, d = 0) =>
  typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'
const nsigned = (n: number | null | undefined, d = 0, suffix = '') =>
  typeof n === 'number' ? `${n >= 0 ? '+' : ''}${nfmt(n, d)}${suffix}` : '—'
// humanize the base-metric key (e.g. adjusted_ebitda_nok_m -> "Adjusted EBITDA"): drop currency/scale
// tokens and uppercase the finance acronyms. Cosmetic only.
const METRIC_UNIT_TOKENS = new Set(['nok', 'usd', 'inr', 'eur', 'gbp', 'jpy', 'cny', 'm', 'mn', 'bn', 'cr', 'k'])
function metricLabel(k?: string | null): string {
  if (!k) return 'Base metric'
  const s = k.split('_').filter((p) => !METRIC_UNIT_TOKENS.has(p.toLowerCase())).join(' ')
  return s.replace(/\b(ebitda|ebit|eps|fcf|roic|roce|nav|ddm)\b/gi, (m) => m.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase())
}
// the margin's honest name, from the base metric — an EBITDA base is an EBITDA margin, never "operating margin"
function marginName(metric?: string | null): string {
  const m = String(metric || '').toLowerCase()
  if (m.includes('ebitda')) return 'EBITDA margin'
  if (m.includes('ebit') || m.includes('operating')) return 'operating margin'
  if (m.includes('net') && m.includes('income')) return 'net margin'
  return 'margin'
}

// The deterministic what-if card. Its numbers come straight from the engine (scripts/sensitivity_math.py via
// the server) — this component only formats them. A computed scenario renders in one of three modes
// (forward move / from a target level / reverse solve-for), or an "unsupported" refusal that says WHY and
// lists what IS modelable.
function ComputedCard({ c }: { c: ChatComputed }) {
  if (c.kind === 'unsupported') {
    const multi = c.reason === 'multi' || c.reason === 'ambiguous'
    const norev = c.reason === 'no_revenue_base'
    return (
      <div className="chatpanel__computed chatpanel__computed--refuse">
        <div className="chatpanel__computed-head">
          <span className="chatpanel__computed-glyph" aria-hidden>∑</span>
          <span className="chatpanel__computed-kicker">{multi ? 'One at a time' : 'Cannot model'}</span>
          <span className="chatpanel__computed-conf chatpanel__computed-conf--na">Not modeled</span>
        </div>
        <div className="chatpanel__computed-refuse">
          {multi
            ? <>The engine models <b>one variable at a time</b> — a joint move mixes effects that don’t simply add. Ask about each and I’ll compute both:</>
            : norev
              ? <>This run recorded no revenue base, so the engine can’t solve for a <b>margin</b> target. It can still model these directly:</>
              : <>That isn’t a recorded sensitivity for this company, so the engine won’t put a number on it. It can model:</>}
          {c.recorded.length > 0 && (
            <div className="chatpanel__computed-chips">
              {c.recorded.map((r) => <span key={r.variable} className="chatpanel__computed-chip">{r.label || r.variable}{r.unit ? ` (${r.unit})` : ''}</span>)}
            </div>
          )}
        </div>
      </div>
    )
  }
  const s = c.scenario
  const oor = s.withinDisclosedRange === false
  const reverse = s.mode === 'reverse'
  const level = s.mode === 'level'
  const confClass = reverse ? 'solve' : oor ? 'low' : s.confidence === 'high' ? 'high' : 'low'
  const confLabel = reverse ? 'Solve · linear' : oor ? 'Extrapolated' : s.confidence ? `Confidence · ${s.confidence}` : 'Computed'
  const kicker = reverse ? 'Computed · solved for the input' : level ? 'Computed · from a target level' : 'Computed · sensitivity engine'
  return (
    <div className={`chatpanel__computed${oor ? ' chatpanel__computed--oor' : ''}`}>
      <div className="chatpanel__computed-head">
        <span className="chatpanel__computed-glyph" aria-hidden>∑</span>
        <span className="chatpanel__computed-kicker" title="Computed by scripts/sensitivity_math.py from the orb’s recorded coefficient — the model never does the arithmetic.">{kicker}</span>
        <span className={`chatpanel__computed-conf chatpanel__computed-conf--${confClass}`}>{confLabel}</span>
      </div>
      {s.note && <div className="chatpanel__computed-note">{s.note}</div>}
      {s.basis === 'inferred' && <div className="chatpanel__computed-note">Inferred coefficient — not disclosed in filings.</div>}
      {/* the parse's interpretation, printed back — a misread is visible and correctable, never silent */}
      <div className="chatpanel__computed-echo">
        <span className="k">Read as</span>
        {level && s.targetLevel != null ? (
          <span>{s.label || s.variable} <b>at a level of {nfmt(s.targetLevel)}</b>{s.variableBase != null && <> — a <b>{nsigned(s.resolvedDelta)}</b> move from the recorded base {nfmt(s.variableBase)}</>}. <span className="fixit">Meant a move of {nsigned(s.targetLevel)}? Say “rises by {nfmt(s.targetLevel)}”.</span></span>
        ) : reverse ? (
          <span>solve for the {s.label || s.variable} level that reaches {s.targetMarginPct != null ? <b>a {nfmt(s.targetMarginPct, 0)}% margin</b> : 'the target'}.</span>
        ) : (
          <span>{s.label || s.variable} <b>moves {nsigned(s.delta)}{s.unit ? ` ${s.unit}` : ''}</b>.{Number.isInteger(s.delta) && Math.abs(s.delta) >= 100 ? <span className="fixit"> Meant a level of {nfmt(Math.abs(s.delta))}? Say “at {nfmt(Math.abs(s.delta))}”.</span> : null}</span>
        )}
      </div>

      {reverse ? (
        <>
          <div className="chatpanel__computed-solve">
            <span className="k">Answer</span>
            <span>{s.label || s.variable} <b>{s.solvedVariableLevel != null ? `≈ ${nfmt(s.solvedVariableLevel)}${s.unit ? ` ${s.unit}` : ''}` : `${nsigned(s.resolvedDelta)}`}</b>{s.solvedVariableLevel != null && <span className="sub"> ({nsigned(s.resolvedDelta)})</span>}</span>
          </div>
          <div className="chatpanel__computed-rows">
            <div className="chatpanel__computed-row">
              <span className="rl">Target — {s.targetMarginPct != null ? marginName(s.impactMetric) : metricLabel(s.impactMetric)}</span>
              <span className="rv"><b>{s.targetMarginPct != null ? `${nfmt(s.targetMarginPct, 2)}%` : nfmt(s.targetValue)}</b></span>
              <span className="rd">{s.targetMarginPct != null && s.baseMarginPct != null ? `from ${nfmt(s.baseMarginPct, 2)}%` : ''}</span>
            </div>
            <div className="chatpanel__computed-row">
              <span className="rl">Implies {metricLabel(s.impactMetric)}</span>
              <span className="rv">{nfmt(s.baseValue)}<span className="ar" aria-hidden>→</span><b>{nfmt(s.newValue)}</b></span>
              <span className="rd">{nsigned(s.impact)}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="chatpanel__computed-ask">
            {level
              ? <><span className="lab">{s.label || s.variable}</span><span className="val">{nfmt(s.variableBase)}<span className="ar" aria-hidden>→</span><b>{nfmt(s.targetLevel)}</b></span><span className="delta">{nsigned(s.resolvedDelta)}{s.unit ? ` ${s.unit}` : ''}</span></>
              : <><span className="lab">{s.label || s.variable}</span><span className="delta">{nsigned(s.delta)}{s.unit ? ` ${s.unit}` : ''}</span></>}
          </div>
          <div className="chatpanel__computed-rows">
            <div className="chatpanel__computed-row">
              <span className="rl">{metricLabel(s.impactMetric)}</span>
              <span className="rv">{nfmt(s.baseValue)}<span className="ar" aria-hidden>→</span><b>{nfmt(s.newValue)}</b></span>
              <span className="rd">{nsigned(s.impact)}</span>
            </div>
            {s.marginChangeBps != null && (
              <div className="chatpanel__computed-row">
                <span className="rl" title={s.marginBasis === 'revenue_constant' ? 'Revenue held constant — no revenue coefficient is recorded, so this is an implied margin, not a fully-modeled one.' : undefined}>{marginName(s.impactMetric)}{s.marginBasis === 'revenue_constant' && <small> · rev. unchanged</small>}</span>
                <span className="rv">{s.baseMarginPct != null ? `${nfmt(s.baseMarginPct, 2)}%` : '—'}<span className="ar" aria-hidden>→</span><b>{s.newMarginPct != null ? `${nfmt(s.newMarginPct, 2)}%` : '—'}</b></span>
                <span className="rd">{nsigned(s.marginChangeBps, 1, ' bps')}</span>
              </div>
            )}
          </div>
        </>
      )}

      {oor && s.rangeNote && <div className="chatpanel__computed-warn"><span aria-hidden>▲ </span>{s.rangeNote}</div>}
      {s.periodBase && <div className="chatpanel__computed-note">Asked about a period this scenario doesn’t forecast — a single-period scenario on the {s.periodBase} base, not a multi-year forecast.</div>}
      <Provenance
        lead={reverse ? `need ${nsigned(s.neededImpact)} ÷ coefficient ${s.coefficient} = ${nsigned(s.resolvedDelta)}${s.unit ? ` ${s.unit}` : ''}` : `coefficient ${s.coefficient} per unit`}
        source={s.source}
      />
    </div>
  )
}

// The compressed §5 citation: the first source inline, the rest (a compound "a; b" citation) behind a
// click-to-expand — the DATA is unchanged, only the display folds. Non-compound short sources render as a
// plain line with no affordance.
function Provenance({ lead, source }: { lead: string; source?: string | null }) {
  const parts = (source || '').split(';').map((t) => t.trim()).filter(Boolean)
  const first = parts[0] || null
  const short = first && first.length > 56 ? first.slice(0, 56) + '…' : first
  const more = Math.max(0, parts.length - 1)
  const expandable = more > 0 || (first != null && first.length > 56)
  if (!expandable) {
    return <div className="chatpanel__computed-prov">{lead}{short ? <> · <span className="src">{short}</span></> : null}</div>
  }
  return (
    <details className="chatpanel__computed-prov">
      <summary>{lead}{short ? <> · <span className="src">{short}</span></> : null}<span className="more">{more > 0 ? `+${more} source${more > 1 ? 's' : ''}` : 'full'} ⌄</span></summary>
      <div className="full">{source}</div>
    </details>
  )
}
