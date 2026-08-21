import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { captureAskOpener } from '../lib/askFocus'
import { decisionColor, fmtAgo, fmtMinutes, nextSweepLabel, resetIn, resolveVerdict, usageColor, usageLabel, usagePct } from '../lib/format'
import { plainKind } from '../lib/plain'
import { EngineStatusPill } from './EngineStatus'
import { todayOutcomeCopy } from './screener/pipelineDiagnosticsView'
import { ThemeToggle } from './ThemeToggle'
import { RunHistory } from './RunHistory'

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="var(--hairline-strong)" />
      <circle cx="9" cy="9" r="2.4" fill="var(--accent)" />
      <circle cx="9" cy="1.6" r="1.1" fill="var(--text-faint)" />
      <circle cx="15.4" cy="12.6" r="1.1" fill="var(--text-faint)" />
      <circle cx="2.6" cy="12.6" r="1.1" fill="var(--text-faint)" />
    </svg>
  )
}

// The swarm switcher: one orb-dot per swarm (amber research, cyan screener, future swarms join
// automatically from /api/swarms). Clicking an inactive swarm triggers the warp.
function SwarmSwitcher() {
  const swarms = useStore((s) => s.swarms)
  const active = useStore((s) => s.activeSwarm)
  const warp = useStore((s) => s.warp)
  const switchSwarm = useStore((s) => s.switchSwarm)
  if (swarms.length < 2) return null
  return (
    <div className="swarmswitch" role="tablist" aria-label="Swarms">
      {swarms.map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={active === s.id}
          className={`swarmswitch__item${active === s.id ? ' swarmswitch__item--on' : ''}`}
          disabled={!!warp}
          onClick={() => switchSwarm(s.id)}
          title={`${s.label} swarm — unit: ${s.unit}`}
        >
          <span className="swarmswitch__orb" style={{ ['--orb' as any]: s.color }} />
          <span className="swarmswitch__label">{s.label}</span>
        </button>
      ))}
    </div>
  )
}

// The auto-scanner's always-visible status: on/off, when it last looked, what it found today.
// Click → the News wire (the live view of everything it read). The free scanner replaced the old
// top-bar "Find news" button — the paid manual top-up scan now lives at the top of the Events rail.
function AutoScanChip() {
  const status = useStore((s) => s.newsStatus)
  const refresh = useStore((s) => s.refreshNewsStatus)
  const openNewsFeed = useStore((s) => s.openNewsFeed)
  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 60_000)
    return () => clearInterval(id)
  }, [refresh])
  const ago = status?.lastCycleAt ? Math.max(0, Math.round((Date.now() - new Date(status.lastCycleAt).getTime()) / 60_000)) : null
  const label = !status
    ? 'Auto-scan …'
    : status.enabled
      ? status.running
        ? 'Auto-scan looking now…'
        : ago != null
          ? `Auto-scan on · last look ${ago}m ago`
          : 'Auto-scan on'
      : 'Auto-scan off'
  const todayCopy = status ? todayOutcomeCopy(status.today) : null
  const title = status?.enabled
    ? `The free scanner reads trusted news every ${status.intervalMin} min and scores each item. ${todayCopy ? `Today: ${todayCopy}.` : 'No completed look is recorded today.'} Click to watch it live.`
    : 'The free scanner is off — it needs a (free) Groq key in the engine. Click to see the wire anyway.'
  return (
    <button className="autoscan" onClick={() => void openNewsFeed()} title={title}>
      <span className={`autoscan__dot${status?.enabled ? ' autoscan__dot--on' : ''}${status?.running ? ' autoscan__dot--busy' : ''}`} />
      {label}
    </button>
  )
}

// The company-news bridge's status: is the 12-hourly sweep running, and how much has it routed into the
// research pools so far. Deliberately mirrors AutoScanChip (same .autoscan chip, same dot language: grey
// off / green on / pulsing while sweeping) so it reads as one family, and stays VISIBLE when off — like
// its two sibling chips, and unlike StopControl — so the switch remains discoverable. `idleReason` comes
// from the server, so "off" is never unexplained. Click → the Data pool view, where the notes land.
function BridgeChip() {
  const status = useStore((s) => s.bridgeStatus)
  const refresh = useStore((s) => s.refreshBridgeStatus)
  const openDataLibrary = useStore((s) => s.openDataLibrary)
  const selectTicker = useStore((s) => s.selectTicker)
  const requestDataPoolExpand = useStore((s) => s.requestDataPoolExpand)
  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 60_000)
    return () => clearInterval(id)
  }, [refresh])
  if (!status) return null // pre-first-read: show nothing rather than a wrong state
  const sweeping = status.sweeping // the server's in-flight flag — not inferred from the schedule
  // WHERE THE NOTES ACTUALLY ARE. This chip used to open the Data LIBRARY, which lists connector feed
  // health and — by the bridge manifest's own deliberate design — can never contain a routed note: the
  // bridge is kept out of .claude/connectors/ precisely so it doesn't sit there as a permanently-un-run
  // feed. So the chip promised "the data pools" and opened the one panel where the notes cannot appear.
  // The notes live per-subject in data/<TICKER>/, shown by the always-visible Data-pool panel, which is
  // scoped to the SELECTED ticker. So: select the covered subject holding the newest note and let that
  // panel show it. Falls back to the library only when nothing has been routed yet — there is no pool
  // worth jumping to then.
  const newestSubject = [...status.subjects]
    .filter((s) => s.notes > 0 && s.newestAt)
    .sort((a, b) => Date.parse(b.newestAt as string) - Date.parse(a.newestAt as string))[0]
  const goToNotes = () => {
    // Selecting alone isn't enough — the Data-pool panel collapses itself by default, so switching to the
    // right subject behind a still-closed panel is the same dead end the library used to be. Expand it too.
    if (newestSubject) { void selectTicker(newestSubject.subject); requestDataPoolExpand() }
    else openDataLibrary()
  }
  // Rounding straight to HOURS printed "next 0h" for anything under half an hour — the exact case an
  // operator creates when they drop BRIDGE_INTERVAL_MIN to its 15m clamp floor to watch a sweep. Share the
  // one duration ladder (fmtMinutes) instead, so a short cadence reads "next 12m". A schedule that has
  // already passed (a retained snapshot after a failed poll) reads "due now", not a false "next 1m".
  const nextIn = nextSweepLabel(status.nextSweepAt, Date.now())
  // a malformed manifest is a real config error, distinct from off/idle — surface it even while `running`
  // is otherwise true, instead of it reading as a quiet, valid zero-subject sweep (Codex #359)
  const label = status.manifestError
    ? 'News bridge — config error'
    : !status.running
      ? 'News bridge off'
      : sweeping
        ? 'News bridge sweeping now…'
        : `News bridge on · ${status.totalNotes} routed${nextIn ? ` · ${nextIn}` : ''}`
  const perSubject = status.subjects.length
    ? status.subjects.map((s) => `  ${s.subject}: ${s.notes} note${s.notes === 1 ? '' : 's'}${s.newestAt ? ` · newest ${new Date(s.newestAt).toLocaleDateString()}` : ''}`).join('\n')
    : '  (no subjects covered yet)'
  const title = status.manifestError
    ? `News bridge — configuration error.\n${status.manifestError}\nUnattended routing is not reading a valid subject list right now. Fix the manifest, then click to see the data pools.`
    : status.running
      ? `News bridge — on, sweeping every ${fmtMinutes(status.intervalMin)}.\nRouted into research pools so far:\n${perSubject}\nEach note lands in that company's data pool and the cheap analysis scopes which orbs it affects — the paid re-run stays your click.\nClick to open ${newestSubject ? `${newestSubject.subject}'s data pool, where the newest note landed` : 'the data library'}.`
      : `News bridge — off.\n${status.idleReason || 'No reason reported by the engine.'}\nRouted so far: ${status.totalNotes}.${newestSubject ? ` Click to open ${newestSubject.subject}'s data pool.` : ''}`
  return (
    <button className="autoscan" onClick={goToNotes} title={title}>
      <span className={`autoscan__dot${status.running ? ' autoscan__dot--on' : ''}${sweeping ? ' autoscan__dot--busy' : ''}${status.manifestError ? ' autoscan__dot--error' : ''}`} />
      {!status.manifestError && status.running && status.totalNotes > 0
        ? <>News bridge on · <span className="autoscan__count">{status.totalNotes} routed</span>{nextIn ? ` · ${nextIn}` : ''}</>
        : label}
    </button>
  )
}

// Full pipeline diagnostics — every scanner tier, the deferred backlog, and exactly why anything is waiting.
// Surfaces the backlog count inline (the "no surprise" signal) and, on click, opens the diagnostics panel.
// Reads the same 60s-polled newsStatus the auto-scan chip does, so it needs no second poller. The backlog +
// readOnly fields are optional (deploy-skew): an older server omits them and the chip stays a plain entry point.
function PipelineChip() {
  const status = useStore((s) => s.newsStatus)
  const openDiagnostics = useStore((s) => s.openDiagnostics)
  const backlog = status?.backlog?.count ?? 0
  const readOnly = !!status?.readOnly
  const alert = backlog > 0 || readOnly
  const label = readOnly ? 'Read-only' : backlog > 0 ? `${backlog.toLocaleString()} waiting` : 'Pipeline'
  const title = readOnly
    ? 'Another engine owns the scanner for this data dir — this one is read-only. Click for the full pipeline diagnostics.'
    : backlog > 0
      ? `${backlog.toLocaleString()} item${backlog === 1 ? '' : 's'} waiting to be scored. Click to see every tier, the backlog, and exactly why.`
      : 'Pipeline diagnostics — every scanner tier, the backlog, and why anything is waiting. End to end, no surprises.'
  return (
    <button className={`diagpill${alert ? ' diagpill--alert' : ''}`} onClick={() => void openDiagnostics()} title={title}>
      <span className="diagpill__icon" aria-hidden>▚</span>
      {label}
    </button>
  )
}

// The kill switch — visible in BOTH swarms whenever anything is running. One click shows what's
// running; each row can be stopped alone, or everything at once (two-click confirm).
function StopControl() {
  const active = useStore((s) => s.globalActive)
  const open = useStore((s) => s.stopListOpen)
  const setOpen = useStore((s) => s.setStopListOpen)
  const cancelRun = useStore((s) => s.cancelRun)
  const stopEverything = useStore((s) => s.stopEverything)
  const [armAll, setArmAll] = useState(false)
  if (!active.length) return null
  return (
    <div className="tickerpick">
      <button className="stopctl" onClick={() => setOpen(!open)} title="Something is running — click to see it, stop one thing, or stop everything">
        <span className="stopctl__square">■</span>
        {active.length} running
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => { setOpen(false); setArmAll(false) }} />
          <div className="tickerpick__menu stopctl__menu">
            <div className="stopctl__head">Running now</div>
            {active.map((r) => (
              <div key={r.runId} className="stopctl__row">
                <span className="stopctl__kind">{plainKind(r.kind)}</span>
                <span className="stopctl__subject mono">{r.ticker}</span>
                <button className="btn btn--ghost stopctl__stop" onClick={() => void cancelRun(r.runId)} title="Stop just this one">
                  stop
                </button>
              </div>
            ))}
            <button
              className={`btn stopctl__all${armAll ? ' btn--armed' : ' btn--ghost'}`}
              onClick={() => {
                if (!armAll) {
                  setArmAll(true)
                  setTimeout(() => setArmAll(false), 4000)
                  return
                }
                setArmAll(false)
                void stopEverything()
              }}
            >
              {armAll ? `yes — stop all ${active.length} ▸` : 'Stop everything'}
            </button>
            <div className="stopctl__note">Stopping also halts a full run's later steps — nothing new starts on its own.</div>
          </div>
        </>
      )}
    </div>
  )
}

// One top-level Ask entry, two deliberately separate evidence books. Signal chat is closed-book over
// what the selected gauntlet run wrote; news chat searches the saved wire. Combining their transcripts
// would blur provenance, so the menu unifies navigation while the two chat systems stay independent.
export type AskMenuKeyIntent = 'escape' | 'tab' | 'first' | 'last' | 'previous' | 'next' | null
export function askMenuKeyIntent(key: string): AskMenuKeyIntent {
  if (key === 'Escape') return 'escape'
  if (key === 'Tab') return 'tab'
  if (key === 'Home') return 'first'
  if (key === 'End') return 'last'
  if (key === 'ArrowUp') return 'previous'
  if (key === 'ArrowDown') return 'next'
  return null
}

export function ScreenerAskMenu() {
  const selectedSignal = useStore((s) => s.scSelectedSignal)
  const openChat = useStore((s) => s.openChat)
  const openNewsChat = useStore((s) => s.openNewsChat)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const focusable = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') || [])
    requestAnimationFrame(() => focusable()[0]?.focus())
    const onKey = (e: KeyboardEvent) => {
      const intent = askMenuKeyIntent(e.key)
      if (intent === 'escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setOpen(false)
        requestAnimationFrame(() => triggerRef.current?.focus())
        return
      }
      // Let the browser advance focus normally, but dismiss the popover before focus reaches the next
      // command-bar control. This prevents a stale menu from remaining open behind Runs / Check an event.
      if (intent === 'tab') {
        e.preventDefault()
        const trigger = triggerRef.current
        const controls = Array.from(trigger?.closest('.topbar')?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || [])
          .filter((item) => !item.closest('[role="menu"]'))
        const current = trigger ? controls.indexOf(trigger) : -1
        const target = controls[current + (e.shiftKey ? -1 : 1)] || trigger
        setOpen(false)
        requestAnimationFrame(() => target?.focus())
        return
      }
      if (!intent) return
      const items = focusable()
      if (!items.length) return
      e.preventDefault()
      e.stopImmediatePropagation()
      const current = items.indexOf(document.activeElement as HTMLButtonElement)
      const next = intent === 'first' ? 0
        : intent === 'last' ? items.length - 1
          : intent === 'previous' ? (current <= 0 ? items.length - 1 : current - 1)
            : (current + 1) % items.length
      items[next]?.focus()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  const choose = (action: () => void) => { captureAskOpener(triggerRef.current); setOpen(false); action() }
  const closeAndRestore = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div className="cmdask">
      <button
        ref={triggerRef}
        data-ask-entry="true"
        className="btn cmdbar__ask cmdask__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="screener-ask-menu"
        onClick={() => setOpen((v) => !v)}
        title="Choose whether to ask about this signal or search the saved news wire"
      >
        Ask <span className="cmdask__chev" aria-hidden>▾</span>
      </button>
      {open && (
        <>
          <div className="cmdask__scrim" onClick={closeAndRestore} />
          <div ref={menuRef} id="screener-ask-menu" className="tickerpick__menu cmdask__menu" role="menu" aria-label="Choose what to ask">
            <div className="cmdask__head">Ask about…</div>
            <button
              className="tickerpick__item cmdask__item"
              role="menuitem"
              aria-disabled={!selectedSignal}
              onClick={() => { if (selectedSignal) choose(() => openChat('run')) }}
            >
              <span className="cmdask__copy">
                <b>This signal’s output</b>
                <span>{selectedSignal ? 'Answer only from what this run wrote' : 'Open a signal first'}</span>
              </span>
            </button>
            <button className="tickerpick__item cmdask__item" role="menuitem" onClick={() => choose(openNewsChat)}>
              <span className="cmdask__copy">
                <b>News wire</b>
                <span>Search the last 24 hours, 7 days, or all saved news</span>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Screener-mode middle controls: Runs · Check an event. The triage → idea funnel is folded into
// the left Events rail (one unified stream); the news scan is automatic and Ask owns its two contexts.
function ScreenerControls() {
  const openSignalIntake = useStore((s) => s.openSignalIntake)
  const openPipeline = useStore((s) => s.openPipeline)
  const openActivity = useStore((s) => s.openActivity)
  const health = useStore((s) => s.health)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  // ONE runs entry: opens the book (every event you've checked) AND un-hides the live-progress rail, so
  // "Runs" is the single home for both what's running now and everything you've run — replacing the
  // confusing pair of "Runs" (reopen the live rail) + "Recent runs" (open the book) that read as duplicates.
  const openRuns = () => { openActivity(); openPipeline() }
  return (
    <>
      <button className="btn btn--ghost" onClick={openRuns} title="Your runs — the live progress of anything running now, plus the full book of every event you've checked; reopen any analysis">
        Runs
      </button>
      <button className="btn btn--amber" disabled={engineDown} onClick={openSignalIntake} title="Paste one news event and run it through the checks">
        Check an event ▸
      </button>
    </>
  )
}

function TickerPicker() {
  const tickers = useStore((s) => s.tickers)
  const selected = useStore((s) => s.selectedTicker)
  const selectTicker = useStore((s) => s.selectTicker)
  const activeRunsByTicker = useStore((s) => s.activeRunsByTicker)
  const connected = useStore((s) => s.connected)
  const dataDir = useStore((s) => s.dataDir)
  const driveEnabled = useStore((s) => s.driveEnabled)
  const staticMode = useStore((s) => s.staticMode)
  const openAddCompany = useStore((s) => s.openAddCompany)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const swarmSubjectList = useStore((s) => s.swarmSubjectList)
  const swarmSubjectRuns = useStore((s) => s.swarmSubjectRuns)
  const [open, setOpen] = useState(false)
  // which company's run history is expanded inside the dropdown (research only; same shared surface as the
  // first-time picker). A company only offers it when it has >1 run.
  const [expanded, setExpanded] = useState<string | null>(null)
  const toggleExpand = (ticker: string) => setExpanded((cur) => (cur === ticker ? null : ticker))
  // collapse any open history when the dropdown closes, so reopening it starts clean (and unmounts RunHistory)
  useEffect(() => { if (!open) setExpanded(null) }, [open])
  // Non-research constellation swarm (e.g. commodity): a simple subject picker over the swarm's subjects.
  // All hooks above are called unconditionally, so this early return is rules-of-hooks safe.
  if (activeSwarm !== 'research') {
    return (
      <div className="tickerpick">
        <button className="tickerpick__btn" onClick={() => setOpen((o) => !o)}>
          {selected && activeRunsByTicker.has(selected) && <span className="pulsedot" style={{ flexShrink: 0 }} title="Run in progress" />}
          <span className="tickerpick__ticker">{selected || 'Select commodity'}</span>
          <span className="tickerpick__caret">▾</span>
        </button>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
            <div className="tickerpick__menu">
              {swarmSubjectList.map((s) => {
                const run = swarmSubjectRuns[s]
                const running = activeRunsByTicker.has(s)
                return (
                  <button
                    key={s}
                    className={`tickerpick__item${s === selected ? ' tickerpick__item--active' : ''}`}
                    onClick={() => { selectTicker(s); setOpen(false) }}
                  >
                    <span className="tickerpick__sym">{s}</span>
                    {running && <span className="pulsedot" style={{ flexShrink: 0 }} title="Run in progress" />}
                    {/* flex:1 spacer that also carries the confidence when this subject has a verdict — pushes
                        the verdict to the right, matching the research branch's row layout */}
                    <span className="tickerpick__meta">{run?.verdict && run.confidence != null ? `conf ${run.confidence}` : ''}</span>
                    {run?.verdict && (
                      <span style={{ color: decisionColor(run.verdict), fontSize: 11, fontWeight: 600 }}>{run.verdict}</span>
                    )}
                  </button>
                )
              })}
              {!swarmSubjectList.length && (
                <div style={{ padding: '12px', color: 'var(--text-faint)', fontSize: 12, lineHeight: 1.55 }}>
                  No commodities yet. Add a <b style={{ color: 'var(--text-muted)' }}>## NAME</b> section to
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, wordBreak: 'break-all' }}> frameworks/commodity/COMMODITY_PROFILES.md</span>, or run <span className="kbd">/commodity:full GOLD</span>.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }
  const sel = tickers.find((t) => t.ticker === selected)
  const canAdd = driveEnabled && !staticMode
  return (
    <div className="tickerpick">
      <button className="tickerpick__btn" onClick={() => setOpen((o) => !o)}>
        {!connected && <span className="readiness__dot" style={{ background: 'var(--bad)' }} title="Control plane offline" />}
        {connected && sel?.valid === false && <span className="readiness__dot" style={{ background: 'var(--bad)' }} title={`Unusable name — ${sel.invalidReason}`} />}
        {connected && sel?.syncing && <span className="pulsedot" style={{ flexShrink: 0 }} title="Syncing from Google Drive…" />}
        {connected && selected && activeRunsByTicker.has(selected) && <span className="pulsedot" style={{ flexShrink: 0 }} title="Run in progress" />}
        <span className="tickerpick__ticker">{selected || (connected ? 'Select ticker' : 'Offline')}</span>
        <span className="tickerpick__caret">▾</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
          <div className="tickerpick__menu">
            {tickers.map((t) => {
              const isExp = expanded === t.ticker
              const canExpand = t.valid !== false && t.runCount > 1
              return (
                <div key={t.ticker} className="tickerpick__itemwrap">
                  <button
                    className={`tickerpick__item${t.ticker === selected ? ' tickerpick__item--active' : ''}${t.valid === false ? ' tickerpick__item--invalid' : ''}`}
                    aria-expanded={canExpand ? isExp : undefined}
                    onClick={(e) => {
                      // the chevron toggles history in place; the rest of the row opens the company (and closes the menu)
                      if ((e.target as HTMLElement).closest('.rh-disc')) { toggleExpand(t.ticker); return }
                      selectTicker(t.ticker)
                      setOpen(false)
                    }}
                    onKeyDown={(e) => {
                      // Keyboard parity with the in-stage picker: the chevron is pointer-only + aria-hidden, so
                      // →/← on the focused row open/close its run history (Enter/Space still select the company).
                      if (canExpand && e.key === 'ArrowRight' && !isExp) { e.preventDefault(); toggleExpand(t.ticker) }
                      else if (isExp && e.key === 'ArrowLeft') { e.preventDefault(); toggleExpand(t.ticker) }
                    }}
                  >
                    {canExpand ? (
                      <span className={`rh-disc${isExp ? ' is-open' : ''}`} title={`${t.runCount} runs — ${isExp ? 'hide' : 'show'} history`} aria-hidden>
                        <svg className="rh-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
                      </span>
                    ) : (
                      <span className="rh-disc-sp" aria-hidden />
                    )}
                    <span className="tickerpick__sym">{t.ticker}</span>
                    {activeRunsByTicker.has(t.ticker) && <span className="pulsedot" style={{ flexShrink: 0 }} title="Run in progress" />}
                    {t.valid === false ? (
                      <span className="tickerpick__warn" title={`${t.invalidReason}. Rename the Drive folder to ${t.suggestedTicker}.`}>⚠ rename → {t.suggestedTicker}</span>
                    ) : t.syncing ? (
                      <span className="tickerpick__meta tickerpick__meta--sync"><span className="pulsedot" style={{ flexShrink: 0 }} /> syncing… {t.fileCount} file{t.fileCount === 1 ? '' : 's'}</span>
                    ) : (
                      <span className="tickerpick__meta">
                        {t.runCount > 1 && <><span className="rh-runs">{t.runCount} runs</span><span className="rh-sep"> · </span></>}
                        {t.fileCount} file{t.fileCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {t.valid !== false && t.latestRun?.decision && (
                      <span style={{ color: decisionColor(t.latestRun.decision), fontSize: 11, fontWeight: 600 }}>{t.latestRun.decision}</span>
                    )}
                    {t.hasNewerPartial && (
                      <span className="rh-refresh" title="A newer re-run has looked at more recent data but hasn’t produced an updated call yet — so the verdict shown is from your last complete analysis. Open the ▸ history to see the re-run.">⟳ newer run</span>
                    )}
                  </button>
                  {isExp && (
                    <RunHistory
                      ticker={t.ticker}
                      standingRunRoot={t.latestRun?.runRoot ?? null}
                      onOpen={(rr) => { selectTicker(t.ticker, rr); setOpen(false) }}
                    />
                  )}
                </div>
              )
            })}
            {!tickers.length && (
              <div style={{ padding: '12px', color: 'var(--text-faint)', fontSize: 12, lineHeight: 1.55 }}>
                {connected ? (
                  <>
                    No ticker folders found in your Google Drive data folder:
                    <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{dataDir || 'data/'}</div>
                    <div style={{ marginTop: 6 }}>Drop a <b style={{ color: 'var(--text-muted)' }}>&lt;TICKER&gt;/</b> folder of filings there.</div>
                  </>
                ) : (
                  <>
                    <span style={{ color: 'var(--bad)' }}>Control plane offline.</span>
                    <div style={{ marginTop: 6 }}>Start it: <span className="kbd">cd ui &amp;&amp; npm run dev</span></div>
                    <div style={{ marginTop: 4, color: 'var(--text-faint)' }}>The UI reconnects automatically.</div>
                  </>
                )}
              </div>
            )}
            {canAdd && (
              <button className="tickerpick__add" onClick={() => { openAddCompany(); setOpen(false) }}>+ Add a company</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Orb-view mirror of the screener's Continue: when the SELECTED subject has an interrupted run whose
// final thesis is missing, offer to finish it from where it stopped. Resuming skips the modules already
// on disk, so it's cheaper than a fresh full run — the hint shows how much is already done. Hidden while
// the subject is live (the resumable set excludes in-flight subjects) or when nothing is resumable.
function ResumeChip() {
  const resumableRuns = useStore((s) => s.resumableRuns)
  const resumeRun = useStore((s) => s.resumeRun)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const health = useStore((s) => s.health)
  const launchPending = useStore((s) => s.launchPending)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  const entry = selectedTicker
    ? resumableRuns.find((e) => e.kind === 'full' && e.subject === selectedTicker && e.swarm === activeSwarm)
    : undefined
  if (!entry) return null
  const resuming = launchPending?.key?.startsWith(`resume:${entry.subject}:`)
  const noun = entry.unit === 'agent' ? 'check' : 'module'
  const title = engineDown
    ? 'Engine offline — live runs are paused until it reconnects'
    : `This run stopped partway (${entry.doneCount}/${entry.totalCount} ${noun}s done). Resume finishes it from where it stopped — the done work is reused.`
  return (
    <button className="aresume aresume--bar" disabled={engineDown || !!resuming} onClick={() => void resumeRun(entry)} title={title}>
      {resuming ? 'Resuming…' : 'Resume'}<span className="aresume__glyph" aria-hidden>▸</span>
      <span className="aresume__meta">{entry.doneCount}/{entry.totalCount}</span>
    </button>
  )
}

// Data-readiness at a glance: how many of the swarm's modules have SUFFICIENT data. The compact "N/M ready"
// count replaces the per-module dot row (each module's own status is already shown in the swarm view); the
// tooltip still names any capped module so no detail is lost.
function ReadinessStrip() {
  const graph = useStore((s) => s.graph)
  const dataStatus = useStore((s) => s.dataStatus)
  if (!graph || !dataStatus) return null
  const statuses = graph.modules.map((m) => ({ name: m.name, st: dataStatus.modules[m.name]?.status || 'Insufficient' }))
  const ready = statuses.filter((m) => m.st === 'Sufficient').length
  const capped = statuses.filter((m) => m.st !== 'Sufficient')
  const tip = capped.length
    ? `Data readiness — ${ready}/${statuses.length} modules have sufficient data. Capped: ${capped.map((m) => `${m.name} (${m.st})`).join(', ')}`
    : `Data readiness — all ${statuses.length} modules have sufficient data`
  return <span className="readiness__label" title={tip}>{ready}/{statuses.length} ready</span>
}

const windowOrder = (t: string) => (t === 'five_hour' ? 0 : t.startsWith('seven_day') && !t.includes('opus') ? 1 : t.includes('opus') ? 2 : 3)

function CreditBadge() {
  const credit = useStore((s) => s.credit)
  const checking = useStore((s) => s.creditChecking)
  const check = useStore((s) => s.checkCredit)
  const staticMode = useStore((s) => s.staticMode)
  const [open, setOpen] = useState(false)

  // static showcase has no Claude usage to report — the "read-only showcase" chip already says so
  if (staticMode) return null

  const windows = credit?.windows ? Object.entries(credit.windows).sort((a, b) => windowOrder(a[0]) - windowOrder(b[0])) : []
  // headline a real window if we have one (binding window preferred, else highest utilization)
  const headline = windows.find(([t]) => t === credit?.rateLimitType) || [...windows].sort((a, b) => (b[1].utilization ?? 0) - (a[1].utilization ?? 0))[0]
  let label = 'usage'
  let dotColor = 'var(--text-faint)'
  if (headline) {
    const [type, w] = headline
    label = `${usageLabel(type)} ${usagePct(w.utilization) ?? 0}%`
    dotColor = usageColor(w.status, w.utilization)
  } else if (credit?.checked) {
    if (credit.status === 'rejected' || credit.status === 'blocked') {
      label = 'rate limited'
      dotColor = 'var(--bad)'
    } else if (credit.ok) {
      label = 'usage ok'
      dotColor = 'var(--accent)'
    }
  }

  return (
    <div className="tickerpick">
      <button className="creditbadge" onClick={() => { setOpen((o) => !o); if (!credit?.checked && !checking) check() }} title="Claude plan usage — 5-hour / weekly limits">
        <span className="creditbadge__dot" style={{ background: dotColor }} />
        {checking ? 'checking…' : label}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
          <div className="tickerpick__menu" style={{ minWidth: 320, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Plan usage</span>
              <button className="btn btn--ghost" style={{ height: 24, padding: '0 8px', fontSize: 11 }} onClick={check}>{checking ? 'checking…' : 'refresh'}</button>
            </div>
            {windows.length ? (
              windows.map(([type, w]) => {
                const pct = usagePct(w.utilization) ?? 0
                const reset = resetIn(w.resetsAt)
                return (
                  <div key={type} className="usagerow">
                    <div className="usagerow__top">
                      <span>{usageLabel(type)}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{pct}%{reset ? ` · resets ${reset}` : ''}</span>
                    </div>
                    <div className="usagebar"><div className="usagebar__fill" style={{ width: `${Math.min(100, pct)}%`, background: usageColor(w.status, w.utilization) }} /></div>
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '8px 2px', fontSize: 12, color: 'var(--text-faint)' }}>{checking ? 'checking…' : 'No usage data yet — click refresh.'}</div>
            )}
            <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--text-faint)', lineHeight: 1.5 }}>
              Live from the Claude CLI this cockpit runs. Each check reports the currently binding window; others fill in as runs report them.
              {credit?.isUsingOverage && <div style={{ color: 'var(--accent-bright)', marginTop: 3 }}>Currently using paid overage.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Compact icon-only entry to the cockpit-wide feedback panel. Replaces the old full-width "Feedback"
// text button to reclaim top-bar space; the panel it opens (FeedbackPanel) is unchanged. Rendered once
// beside the theme toggle, so it appears in every swarm without duplicating the control per branch.
function FeedbackButton() {
  const openCockpitFeedback = useStore((s) => s.openCockpitFeedback)
  return (
    <button
      className="iconbtn"
      onClick={openCockpitFeedback}
      title="Feedback — report a bug, share an idea, or drop a screenshot"
      aria-label="Feedback — report a bug, share an idea, or drop a screenshot"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m8 2 1.88 1.88" />
        <path d="M14.12 3.88 16 2" />
        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
        <path d="M12 20v-9" />
        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
        <path d="M6 13H2" />
        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
        <path d="M22 13h-4" />
        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
      </svg>
    </button>
  )
}

export function CommandBar() {
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const openActivity = useStore((s) => s.openActivity)
  const openScoring = useStore((s) => s.openScoring)
  const openReview = useStore((s) => s.openReview)
  const openCalls = useStore((s) => s.openCalls)
  const openDataLibrary = useStore((s) => s.openDataLibrary)
  const openMemory = useStore((s) => s.openMemory)
  const pipelines = useStore((s) => s.pipelines)
  const openChat = useStore((s) => s.openChat)
  const openChatHistory = useStore((s) => s.openChatHistory)
  // "Runs" reopen: shown only while the run panel is closed (dismiss only happens from the panel, and switching
  // company/starting a run clears the flag — so a visible flag always means there's a hidden panel to bring back)
  const requestFull = useStore((s) => s.requestFull)
  const anyRun = useStore((s) => s.anyRunForTicker(s.selectedTicker))
  const launchPending = useStore((s) => s.launchPending)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const staticMode = useStore((s) => s.staticMode)
  const snapshotAt = useStore((s) => s.snapshotAt)
  const health = useStore((s) => s.health)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const swarms = useStore((s) => s.swarms)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  const screenerMode = activeSwarm === 'screener'
  const pendingOnSelectedTicker = Boolean(selectedTicker && launchPending?.ticker === selectedTicker)
  const fullPending = pendingOnSelectedTicker && launchPending?.key === 'full:request'
  // a swarm's decision record carries its own verdict field (e.g. commodity `action`) — resolve it
  // generically so the final-report button shows for any finished constellation-swarm run too
  const verdict = resolveVerdict(decision, swarms.find((s) => s.id === activeSwarm)?.verdictField)
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <div className="brand__title">
          <div className="brand__name">Nostra</div>
        </div>
        <SwarmSwitcher />
        {staticMode && <span className="chip" style={{ color: 'var(--accent-bright)', borderColor: 'var(--accent-deep)' }} title={snapshotAt ? `Read-only snapshot, synced ${fmtAgo(Date.parse(snapshotAt))} — the live engine is offline or unreachable. Actions resume when it's back.` : 'Read-only snapshot — the live engine runs on your machine.'}>read-only{snapshotAt ? ` · synced ${fmtAgo(Date.parse(snapshotAt))}` : ''}</span>}
      </div>
      <div className="topbar__spacer" />
      <ThemeToggle />
      <FeedbackButton />
      {/* shared across BOTH modes; gated on the read having answered — an old engine 404s and the
          button never renders (deploy-skew fail-closed, DESIGN.md §5) */}
      {pipelines !== null && (
        <button className="btn btn--ghost" onClick={openDataLibrary} title="Data library — the wired data pipelines feeding the pool, and the gaps worth wiring next">Data</button>
      )}
      <button className="btn btn--ghost" data-memory-entry="true" onClick={openMemory} title="Memory — find what the system remembers across every cockpit">Memory</button>
      {screenerMode ? (
        <>
          <StopControl />
          <AutoScanChip />
          <PipelineChip />
          <EngineStatusPill />
          <CreditBadge />
          <button className="btn btn--ghost" onClick={openScoring} title="Scoring weights — tune how every event is scored, for the whole wire">Scoring</button>
          <button className="btn btn--ghost" onClick={openActivity} title="Activity — what is running now, and everything that has ever run">Activity</button>
          <button className="btn btn--ghost" onClick={openReview} title="Batch review — flag a day's worth of items fast, with keyboard shortcuts">Review</button>
          {/* the live-run rail's reopen is folded into the single "Runs" button below (ScreenerControls) —
              no separate top-bar button, so "Runs" and "Recent runs" no longer read as duplicates */}
          <button className="btn btn--ghost" onClick={openChatHistory} title="Chat history — reopen and continue any past Ask conversation">Chats</button>
          <ScreenerAskMenu />
          <ScreenerControls />
        </>
      ) : (
        <>
          <ReadinessStrip />
          <StopControl />
          {/* a constellation swarm with a declared wire watches the same scanner — show its status chip */}
          {swarms.find((s) => s.id === activeSwarm)?.wire && <AutoScanChip />}
          {/* the news→pool bridge only covers the research swarm's subjects (.claude/bridge/company-news-
              bridge.json) — showing it on e.g. the commodity bar would present a global research-pool note
              count as if it fed the current (unrelated) dossier (Codex #359, "Show the research bridge
              only in the research swarm") */}
          {activeSwarm === 'research' && <BridgeChip />}
          <EngineStatusPill />
          <CreditBadge />
          <button className="btn btn--ghost" onClick={openCalls} title="Calls tracker — every call the engine made and what's happened since">Calls</button>
          <button className="btn btn--ghost" onClick={openActivity} title="Activity — what is running now, and everything that has ever run">Activity</button>
          <button className="btn btn--ghost" onClick={openChatHistory} title="Chat history — reopen and continue any past Ask conversation">Chats</button>
          {decision?.final_thesis_path !== undefined || verdict ? (
            <button className="btn btn--ghost" onClick={openThesis}>{activeSwarm === 'research' ? 'Thesis' : 'Dossier'}</button>
          ) : null}
          <button data-ask-entry="true" className="btn cmdbar__ask" disabled={!selectedTicker} onClick={(event) => { captureAskOpener(event.currentTarget); openChat('run') }} title={selectedTicker ? 'Ask questions about this run’s output — answered only from what the engine wrote' : 'Select a company first'}>
            Ask ▸
          </button>
          <ResumeChip />
          <button className="btn btn--amber" disabled={!selectedTicker || anyRun || engineDown || pendingOnSelectedTicker} onClick={requestFull} title={staticMode ? 'Runs on your local machine (npm run dev)' : engineDown ? 'Engine offline — live runs are paused until it reconnects' : anyRun ? 'A run is in flight — a full run needs exclusive access' : pendingOnSelectedTicker ? 'Another action is already starting for this company' : 'Run the full pipeline'}>
            {fullPending ? 'Preparing…' : 'Run full ▸'}
          </button>
          <TickerPicker />
        </>
      )}
    </div>
  )
}
