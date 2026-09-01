import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isEngineUnavailable, isLaunchHealthBlocked, useStore } from '../lib/store'
import { api } from '../lib/api'
import type { ProviderParityCanaryStatus } from '../lib/api'
import { captureAskOpener } from '../lib/askFocus'
import { decisionColor, fmtAgo, fmtMinutes, nextSweepLabel, resetIn, resolveVerdict, usageColor, usageLabel } from '../lib/format'
import { plainKind } from '../lib/plain'
import { EngineStatusPill } from './EngineStatus'
import { todayOutcomeCopy } from './screener/pipelineDiagnosticsView'
import { ThemeToggle } from './ThemeToggle'
import { RunHistory } from './RunHistory'
import { executionProfileLabel, providerBlockedReason, providerIsBlocked, providerLabel, providerNeedsCheck, providerUsagePercentText, type RunProvider } from '../lib/provider'
import { CODEX_PARITY_CANARY_SELECTION, providerParityCanaryPrefill, providerParityCanaryResponseMatches, providerParityCanaryRunRootIsValid, providerParityCanarySubject } from '../lib/parityCanary'
import { Spin } from './Spin'
import { ProviderProfileSelector } from './ProviderProfileSelector'
import { PerformancePanel, PerformanceStatusChip } from './PerformancePanel'

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
    ? `The free scanner checks trusted news every ${status.intervalMin} min. ${todayCopy ? `Today: ${todayCopy}.` : 'No finished check is recorded today.'} Click to watch it live.`
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
  const label = readOnly ? 'View only' : backlog > 0 ? `${backlog.toLocaleString()} waiting` : 'Scanner'
  const title = readOnly
    ? 'This copy is not running the scanner. Click to see its status.'
    : backlog > 0
      ? `${backlog.toLocaleString()} item${backlog === 1 ? '' : 's'} waiting to be checked. Click to see why.`
      : 'News scanner status — see whether it is working, keeping up, or missing anything.'
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

// One top-level Ask entry. With a selected signal it opens unified Ask, whose server-side Auto router decides
// question by question whether to use the signal, saved wire, and prior chats. With no signal selected there
// is no run context yet, so the same button opens the durable saved-wire conversation directly.
export function ScreenerAskButton() {
  const selectedSignal = useStore((s) => s.scSelectedSignal)
  const openChat = useStore((s) => s.openChat)
  const openNewsChat = useStore((s) => s.openNewsChat)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const openAsk = () => {
    captureAskOpener(triggerRef.current)
    if (selectedSignal) openChat('run')
    else openNewsChat()
  }

  return (
    <button
      ref={triggerRef}
      data-ask-entry="true"
      className="btn cmdbar__ask"
      onClick={openAsk}
      title={selectedSignal
        ? 'Ask normally — Auto chooses from this signal, matching past calls, saved news, and your earlier chats'
        : 'Ask the saved news wire; matching past calls and lessons are added automatically'}
    >
      Ask
    </button>
  )
}

// Screener-mode middle controls: Runs · Check an event. The triage → idea funnel is folded into
// the left Events rail (one unified stream); the news scan is automatic and Ask routes its evidence.
function ScreenerControls() {
  const openSignalIntake = useStore((s) => s.openSignalIntake)
  const health = useStore((s) => s.health)
  const engineDown = isLaunchHealthBlocked(health)
  return (
    <button className="btn btn--amber" disabled={engineDown} onClick={openSignalIntake} title="Paste one news event and run it through the checks">
      Check an event ▸
    </button>
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

// When the SELECTED subject has an unfinished saved run, put the two honest choices beside each other:
// "Complete old run" explicitly keeps valid finished work; "Run full" requests the ordinary full pipeline.
// The saved-run detector survives midnight, so this choice does not disappear merely because the calendar
// date changed.
function ResumeChip() {
  const resumableRuns = useStore((s) => s.resumableRuns)
  const resumeRun = useStore((s) => s.resumeRun)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const health = useStore((s) => s.health)
  const launchPending = useStore((s) => s.launchPending)
  const engineDown = isEngineUnavailable(health)
  const entry = selectedTicker
    ? resumableRuns.find((e) => e.kind === 'full' && e.subject === selectedTicker && e.swarm === activeSwarm)
    : undefined
  if (!entry) return null
  const resuming = launchPending?.key?.startsWith(`resume:${entry.subject}:`)
  const noun = entry.unit === 'agent' ? 'check' : 'module'
  const title = health === 'updating'
    ? 'Save this exact Continue request now — it starts once after the update and keeps valid finished work'
    : engineDown
      ? 'Engine offline — live runs are paused until it reconnects'
      : `This saved run stopped partway (${entry.doneCount}/${entry.totalCount} ${noun}s done). Complete it from where it stopped — valid finished work is reused.`
  return (
    <button className="aresume aresume--bar" disabled={engineDown || !!resuming} onClick={() => void resumeRun(entry)} title={title}>
      {resuming ? 'Starting…' : 'Complete old run'}<span className="aresume__glyph" aria-hidden>▸</span>
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

function ProviderSelector() {
  const selected = useStore((s) => s.runProvider)
  const setSelected = useStore((s) => s.setRunProvider)
  const providers = useStore((s) => s.providers)
  const profileKey = useStore((s) => s.runProfileKeys[selected])
  const setProfile = useStore((s) => s.setRunProfile)
  const checking = useStore((s) => s.providersChecking)
  const check = useStore((s) => s.refreshProviders)
  const staticMode = useStore((s) => s.staticMode)
  const refreshActiveRuns = useStore((s) => s.refreshActiveRuns)
  const setToast = useStore((s) => s.setToast)
  const selectTicker = useStore((s) => s.selectTicker)
  const openActivity = useStore((s) => s.openActivity)
  const [open, setOpen] = useState(false)
  const [canInspectCanary, setCanInspectCanary] = useState(false)
  const [canLaunchCanary, setCanLaunchCanary] = useState(false)
  const [canaryOpen, setCanaryOpen] = useState(false)
  const [canaryRunRoot, setCanaryRunRoot] = useState('')
  const [canaryFreeze, setCanaryFreeze] = useState('')
  const [canaryTyped, setCanaryTyped] = useState('')
  const [canarySubmitting, setCanarySubmitting] = useState(false)
  const [canaryAttempted, setCanaryAttempted] = useState(false)
  const [canaryError, setCanaryError] = useState<string | null>(null)
  const [canaryStatus, setCanaryStatus] = useState<ProviderParityCanaryStatus | null>(null)
  const canaryPrefill = useRef(typeof window === 'undefined' ? null : providerParityCanaryPrefill(window.location.search))

  useEffect(() => {
    // Release calibration is an operator workflow, not a research-user control. Keep the deep-link path
    // for an authenticated operator, but do not even perform its identity lookup during an ordinary
    // cockpit visit. The normal provider menu therefore has no canary button, state fetch, or extra work.
    const prefill = canaryPrefill.current
    if (!prefill) return
    let alive = true
    void api.whoami().then((who) => {
      if (!alive) return
      const inspect = who.canInspectProviderParity === true && who.userVia === 'cf-access'
      const launch = who.canLaunchProviderParity === true && inspect
      setCanInspectCanary(inspect)
      setCanLaunchCanary(launch)
      if (inspect) {
        setCanaryRunRoot(prefill.runRoot)
        setCanaryFreeze(prefill.freezeReceipt)
        setCanaryOpen(true)
      }
    }).catch(() => { if (alive) { setCanInspectCanary(false); setCanLaunchCanary(false) } })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!canInspectCanary || !canaryOpen || !providerParityCanaryRunRootIsValid(canaryRunRoot)) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null
    const refresh = async () => {
      try {
        const status = await api.providerParityCanaryStatus(canaryRunRoot.trim())
        if (!alive) return
        setCanaryStatus(status)
        if (['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'].includes(status.status)
            || (canaryAttempted && status.status === 'unknown')) {
          timer = setTimeout(() => void refresh(), 2_000)
        }
      } catch (error: any) {
        if (!alive) return
        if (error?.status !== 404) {
          setCanaryError(error?.body?.error || error?.message || 'Could not read canary status.')
          // A brief tunnel restart or rate limit must not strand an already-spent attempt. This endpoint
          // is read-only and the root has passed the exact grammar gate, so retry at the normal poll rate.
          timer = setTimeout(() => void refresh(), 2_000)
        }
      }
    }
    void refresh()
    return () => { alive = false; if (timer) clearTimeout(timer) }
  }, [canInspectCanary, canaryOpen, canaryRunRoot, canaryAttempted])

  // static showcase has no Claude usage to report — the "read-only showcase" chip already says so
  if (staticMode) return null

  const current = providers[selected]
  const currentProblem = providerBlockedReason(current)
  const credit = current.usage
  const windows = credit?.windows ? Object.entries(credit.windows).sort((a, b) => windowOrder(a[0]) - windowOrder(b[0])) : []
  // headline a real window if we have one (binding window preferred, else highest utilization)
  const headline = windows.find(([t]) => t === credit?.rateLimitType) || [...windows].sort((a, b) => (b[1].utilization ?? 0) - (a[1].utilization ?? 0))[0]
  let dotColor = 'var(--text-faint)'
  if (currentProblem) {
    dotColor = 'var(--bad)'
  } else if (headline) {
    const [, w] = headline
    const pct = providerUsagePercentText(w.utilization)
    dotColor = pct === null ? 'var(--text-faint)' : usageColor(w.status, w.utilization)
  } else if (credit?.checked && (credit.status === 'rejected' || credit.status === 'blocked')) {
    dotColor = 'var(--bad)'
  } else if (current.available) {
    dotColor = 'var(--accent)'
  }

  const compact = (provider: RunProvider): string => {
    const status = providers[provider]
    if (status.checking) return 'checking'
    if (providerNeedsCheck(status)) return 'check'
    if (providerBlockedReason(status)) return 'off'
    const providerWindows = Object.values(status.usage?.windows || {})
    const utilization = providerWindows.map((w) => w.utilization).filter((v): v is number => typeof v === 'number')
    if (utilization.length) return `${Math.round(Math.max(...utilization) * 100)}%`
    return status.available ? 'ready' : 'unknown'
  }

  const canarySubject = providerParityCanarySubject(canaryRunRoot)
  const canaryReady = canLaunchCanary && providerParityCanaryRunRootIsValid(canaryRunRoot)
    && !!canarySubject && !!canaryFreeze.trim()
    && canaryTyped.trim().toUpperCase() === canarySubject
    && !canarySubmitting && !canaryAttempted
  const launchCanary = async () => {
    if (!canaryReady || !canarySubject) return
    // This modal represents one explicit paid attempt. Once the POST begins, no UI retry is offered;
    // an uncertain response may already have admitted a run and must be resolved from Activity.
    setCanaryAttempted(true)
    setCanarySubmitting(true)
    setCanaryError(null)
    try {
      const out = await api.providerParityCanary({
        provider: 'codex',
        model: CODEX_PARITY_CANARY_SELECTION.model!,
        reasoningLevel: CODEX_PARITY_CANARY_SELECTION.reasoningLevel!,
        expectedProfileKey: CODEX_PARITY_CANARY_SELECTION.expectedProfileKey!,
        runRoot: canaryRunRoot.trim(),
        freezeReceipt: canaryFreeze.trim(),
      })
      if (!providerParityCanaryResponseMatches(out, canarySubject)) {
        throw new Error(out?.runId
          ? `Run ${out.runId} may have been admitted, but its provider receipt was invalid. Do not retry; check Activity.`
          : 'The server did not return an exact Codex canary receipt. Do not retry until Activity is checked.')
      }
      setCanaryStatus({ runRoot: canaryRunRoot.trim(), runId: out.runId, status: 'starting', startedAt: Date.now(), endedAt: null, provider: 'codex', profileKey: CODEX_PARITY_CANARY_SELECTION.expectedProfileKey!, message: null, failureNote: null, interruption: null, artifacts: {} })
      setToast({ msg: `Codex canary ${out.runId} admitted for ${canarySubject}. Follow it in Activity.`, tone: 'good' })
      await refreshActiveRuns()
    } catch (error: any) {
      setCanaryError(error?.body?.error || error?.message || 'Canary launch failed. Do not retry until Activity is checked.')
    } finally {
      setCanarySubmitting(false)
    }
  }

  return (
    <div className="tickerpick providerpick">
      <div className="providerseg providerseg--top" role="radiogroup" aria-label="Run new work with">
        {(['claude', 'codex'] as RunProvider[]).map((provider) => {
          const status = providers[provider]
          const problem = providerBlockedReason(status)
          return <button key={provider} role="radio" aria-checked={selected === provider} className={`providerseg__btn${selected === provider ? ' providerseg__btn--on' : ''}`} disabled={providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(provider)} status` : `Run new work with ${providerLabel(provider)}`)} onClick={() => { setSelected(provider); if (providerNeedsCheck(status) && !status.checking) void check(provider) }}>
            <span>{providerLabel(provider)}</span><small>{compact(provider)}</small>
          </button>
        })}
      </div>
      <button className="creditbadge creditbadge--details" aria-label="Provider status details" aria-expanded={open} onClick={() => { setOpen((o) => !o); if (providerNeedsCheck(current) && !current.checking) void check(selected) }} title={currentProblem || `Details for ${providerLabel(selected)}`}>
        <span className="creditbadge__dot" style={{ background: dotColor }} />{checking ? '…' : 'Usage'}<span aria-hidden>▾</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
          <div className="tickerpick__menu" style={{ minWidth: 320, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Run new work with</span>
              <button className="btn btn--ghost" style={{ height: 24, padding: '0 8px', fontSize: 11 }} onClick={() => void check(selected)}>{checking ? 'checking…' : 'refresh'}</button>
            </div>
            <div className="providerseg" role="radiogroup" aria-label="Run provider">
              {(['claude', 'codex'] as RunProvider[]).map((provider) => {
                const status = providers[provider]
                const problem = providerBlockedReason(status)
                return <button key={provider} role="radio" aria-checked={selected === provider} className={`providerseg__btn${selected === provider ? ' providerseg__btn--on' : ''}`} disabled={providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(provider)} status` : `Run new work with ${providerLabel(provider)}`)} onClick={() => { setSelected(provider); if (providerNeedsCheck(status) && !status.checking) void check(provider) }}>
                  <span className="creditbadge__dot" style={{ background: status.available ? 'var(--good)' : providerNeedsCheck(status) ? 'var(--text-faint)' : 'var(--bad)' }} />{status.checking ? 'checking…' : providerLabel(provider)}
                </button>
              })}
            </div>
            <div style={{ margin: '9px 2px 5px' }}>
              <ProviderProfileSelector status={current} profileKey={profileKey} onChange={(key) => setProfile(selected, key)} />
            </div>
            <div style={{ margin: '8px 2px', fontSize: 11, color: current.available ? 'var(--text-muted)' : 'var(--bad)' }}>
              {current.available ? executionProfileLabel(current, profileKey) : currentProblem || (providerNeedsCheck(current) ? current.reason || 'Status unknown — choose the provider to check again' : 'Unavailable')}
            </div>
            {windows.length ? (
              windows.map(([type, w]) => {
                const pct = providerUsagePercentText(w.utilization)
                const reset = resetIn(w.resetsAt)
                return (
                  <div key={type} className="usagerow">
                    <div className="usagerow__top">
                      <span>{usageLabel(type)}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{pct ?? 'Usage unavailable'}{reset ? ` · resets ${reset}` : ''}</span>
                    </div>
                    {pct !== null && <div className="usagebar"><div className="usagebar__fill" style={{ width: pct, background: usageColor(w.status, w.utilization) }} /></div>}
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '8px 2px', fontSize: 12, color: 'var(--text-faint)' }}>{checking ? 'checking…' : 'Usage unavailable'}</div>
            )}
            <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--text-faint)', lineHeight: 1.5 }}>
              Provider and model are remembered for new work. A run already in progress keeps its frozen execution profile.
              {credit?.isUsingOverage && <div style={{ color: 'var(--accent-bright)', marginTop: 3 }}>Currently using paid overage.</div>}
            </div>
          </div>
        </>
      )}
      {canaryOpen && canInspectCanary && typeof document !== 'undefined' && createPortal((
        <div className="scrim" onClick={() => { if (!canarySubmitting) setCanaryOpen(false) }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="provider-canary-title" onClick={(event) => event.stopPropagation()} style={{ width: 'min(560px, calc(100vw - 24px))' }}>
            <div className="modal__head">
              <div className="modal__title" id="provider-canary-title">Launch frozen Codex release canary</div>
              <div className="modal__sub">Admin-only. Uses ChatGPT plan capacity, keeps global Codex off, and does not commit or push.</div>
            </div>
            <div className="modal__body">
              <label style={{ display: 'block', padding: '7px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Frozen Codex run root
                <input className="modal__input" style={{ letterSpacing: 0, marginTop: 5 }} value={canaryRunRoot} disabled={canaryAttempted} onChange={(event) => { setCanaryRunRoot(event.target.value); setCanaryTyped(''); setCanaryError(null); setCanaryStatus(null) }} autoComplete="off" spellCheck={false} />
              </label>
              <label style={{ display: 'block', padding: '7px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Immutable freeze receipt
                <input className="modal__input" style={{ letterSpacing: 0, marginTop: 5 }} value={canaryFreeze} disabled={canaryAttempted} onChange={(event) => { setCanaryFreeze(event.target.value); setCanaryError(null) }} autoComplete="off" spellCheck={false} />
              </label>
              <div className="modal__row"><span className="modal__k">Provider</span><span className="modal__v">Codex · ChatGPT plan</span></div>
              <div className="modal__row"><span className="modal__k">Profile</span><span className="modal__v" style={{ maxWidth: 330, textAlign: 'right' }}>Sol max · Terra xhigh</span></div>
              <div className="modal__row"><span className="modal__k">Publication</span><span className="modal__v">stamp only · no Git</span></div>
              {canaryStatus && (
                <div style={{ marginTop: 12, padding: 10, border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
                  <div><b>Status:</b> {canaryStatus.status}{canaryStatus.runId ? ` · ${canaryStatus.runId}` : ''}</div>
                  <div><b>Profile:</b> {canaryStatus.profileKey || 'not available after restart'}</div>
                  {canaryStatus.message && <div style={{ color: canaryStatus.status === 'done' ? 'var(--good)' : 'var(--bad)' }}>{canaryStatus.message}</div>}
                  {canaryStatus.failureNote && <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 190, overflow: 'auto', margin: '8px 0 0', color: 'var(--bad)' }}>{canaryStatus.failureNote}</pre>}
                  {canaryStatus.status === 'awaiting-readiness-decision' && canarySubject && (
                    <button className="btn btn--amber" style={{ marginTop: 8 }} onClick={() => {
                      setCanaryOpen(false)
                      void selectTicker(canarySubject).then(() => openActivity())
                    }}>
                      Resolve data check…
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="modal__confirm">
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Type <b style={{ color: 'var(--text)' }}>{canarySubject || 'the subject'}</b> to authorize one paid launch</div>
              <input className="modal__input" autoFocus value={canaryTyped} disabled={canaryAttempted} onChange={(event) => setCanaryTyped(event.target.value)} placeholder={canarySubject || ''} onKeyDown={(event) => { if (event.key === 'Enter' && canaryReady) void launchCanary() }} />
              {canaryError && <div style={{ color: 'var(--bad)', fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>{canaryError}</div>}
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost" disabled={canarySubmitting} onClick={() => setCanaryOpen(false)}>Close</button>
              {canLaunchCanary && <button className="btn btn--amber" disabled={!canaryReady} onClick={() => void launchCanary()}>{canarySubmitting ? <><Spin /> Launching once…</> : canaryAttempted ? 'Attempt sent' : 'Launch once'}</button>}
            </div>
          </div>
        </div>
      ), document.body)}
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

function BarMenu({ label, title, children, alert = false, workspace = false, closeOnNavigation = false }: { label: React.ReactNode; title: string; children: React.ReactNode; alert?: boolean; workspace?: boolean; closeOnNavigation?: boolean }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const away = (event: MouseEvent) => { if (!wrap.current?.contains(event.target as Node)) setOpen(false) }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key) }
  }, [open])
  return (
    <div className="barmenu" ref={wrap}>
      <button className={`btn btn--ghost barmenu__trigger${alert ? ' barmenu__trigger--alert' : ''}`} data-memory-entry={workspace ? 'true' : undefined} data-tools-entry={workspace ? 'true' : undefined} aria-expanded={open} onClick={() => setOpen(!open)} title={title}>{label}<span aria-hidden>▾</span></button>
      <div className="barmenu__panel" hidden={!open} onClick={(event) => {
        const target = event.target as Element
        if ((workspace && target.closest('button')) || (closeOnNavigation && target.closest('[data-menu-nav] button'))) setOpen(false)
      }}>{children}</div>
    </div>
  )
}

function WorkspaceMenu({ screenerMode, hasData }: { screenerMode: boolean; hasData: boolean }) {
  const openDataLibrary = useStore((s) => s.openDataLibrary)
  const openMemory = useStore((s) => s.openMemory)
  const openTools = useStore((s) => s.openTools)
  const openCalls = useStore((s) => s.openCalls)
  const openActivity = useStore((s) => s.openActivity)
  const openPipeline = useStore((s) => s.openPipeline)
  const openChatHistory = useStore((s) => s.openChatHistory)
  const openScoring = useStore((s) => s.openScoring)
  const openReview = useStore((s) => s.openReview)
  const item = (label: string, note: string, action: () => void) => <button className="barmenu__item" onClick={action}><b>{label}</b><span>{note}</span></button>
  return (
    <BarMenu workspace label="Workspace" title="Data, tools, activity and saved conversations">
      <div className="barmenu__label">Work</div>
      {hasData && item('Data', 'Pipelines, sources and gaps', openDataLibrary)}
      <button className="barmenu__item" onClick={openMemory}><b>Memory</b><span>What the system remembers</span></button>
      <button className="barmenu__item" onClick={openTools}><b>Tools</b><span>Focused everyday mini-apps</span></button>
      {item('Activity', 'Live and completed runs', () => { openActivity(); if (screenerMode) openPipeline() })}
      {item('Chats', 'Reopen saved Ask conversations', openChatHistory)}
      <div className="barmenu__rule" />
      {screenerMode
        ? <>{item('Review', 'Batch-review the news wire', openReview)}{item('Scoring', 'Tune event weights', openScoring)}</>
        : item('Calls', 'Every decision and what happened', openCalls)}
    </BarMenu>
  )
}

function StatusMenu({ screenerMode, showScanner, showBridge, onOpenPerformance }: { screenerMode: boolean; showScanner: boolean; showBridge: boolean; onOpenPerformance: () => void }) {
  const health = useStore((s) => s.health)
  const status = useStore((s) => s.newsStatus)
  const backlog = status?.backlog?.count ?? 0
  const bad = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  return (
    <BarMenu
      alert={bad || backlog > 0}
      closeOnNavigation
      title="Engine, provider and background scanner status"
      label={<><span className={`barmenu__dot${bad ? ' is-bad' : ''}`} />Status{backlog > 0 && <em>{backlog > 999 ? `${Math.round(backlog / 1000)}k` : backlog}</em>}</>}
    >
      <div className="barmenu__label">System</div>
      <div className="barmenu__statusrow"><EngineStatusPill /></div>
      <div className="barmenu__statusrow" data-menu-nav><PerformanceStatusChip onOpen={onOpenPerformance} /></div>
      {!screenerMode && <div className="barmenu__statusrow"><ReadinessStrip /></div>}
      <div className="barmenu__statusrow barmenu__statusrow--provider"><ProviderSelector /></div>
      {(showScanner || showBridge || screenerMode) && <div className="barmenu__rule" />}
      {showScanner && <div className="barmenu__statusrow" data-menu-nav><AutoScanChip /></div>}
      {screenerMode && <div className="barmenu__statusrow" data-menu-nav><PipelineChip /></div>}
      {showBridge && <div className="barmenu__statusrow" data-menu-nav><BridgeChip /></div>}
    </BarMenu>
  )
}

export function CommandBar() {
  const [performanceOpen, setPerformanceOpen] = useState(false)
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const pipelines = useStore((s) => s.pipelines)
  const openChat = useStore((s) => s.openChat)
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
  const engineDown = isEngineUnavailable(health)
  const screenerMode = activeSwarm === 'screener'
  const pendingOnSelectedTicker = Boolean(selectedTicker && launchPending?.ticker === selectedTicker)
  const fullPending = pendingOnSelectedTicker && launchPending?.key === 'full:request'
  const fullRunTitle = staticMode
    ? 'Runs on your local machine (npm run dev)'
    : health === 'updating'
      ? 'Save this full-run request now — it starts once after the update'
      : engineDown
        ? 'Engine offline — live runs are paused until it reconnects'
        : anyRun
          ? 'A run is in flight — a full run needs exclusive access'
          : pendingOnSelectedTicker
            ? 'Another action is already starting for this company'
            : 'Run the full pipeline'
  // a swarm's decision record carries its own verdict field (e.g. commodity `action`) — resolve it
  // generically so the final-report button shows for any finished constellation-swarm run too
  const verdict = resolveVerdict(decision, swarms.find((s) => s.id === activeSwarm)?.verdictField)
  return (
    <>
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
      <WorkspaceMenu screenerMode={screenerMode} hasData={pipelines !== null} />
      {screenerMode ? (
        <>
          <StopControl />
          <StatusMenu screenerMode showScanner showBridge={false} onOpenPerformance={() => setPerformanceOpen(true)} />
          <ScreenerAskButton />
          <ScreenerControls />
        </>
      ) : (
        <>
          <StopControl />
          <StatusMenu screenerMode={false} showScanner={!!swarms.find((s) => s.id === activeSwarm)?.wire} showBridge={activeSwarm === 'research'} onOpenPerformance={() => setPerformanceOpen(true)} />
          {decision?.final_thesis_path !== undefined || verdict ? (
            <button className="btn btn--ghost" onClick={openThesis}>{activeSwarm === 'research' ? 'Thesis' : 'Dossier'}</button>
          ) : null}
          <button data-ask-entry="true" className="btn cmdbar__ask" disabled={!selectedTicker} onClick={(event) => { captureAskOpener(event.currentTarget); openChat('run') }} title={selectedTicker ? 'Ask questions about this run’s output — answered only from what the engine wrote' : 'Select a company first'}>
            Ask ▸
          </button>
          <ResumeChip />
          <button className="btn btn--amber" disabled={!selectedTicker || anyRun || engineDown || pendingOnSelectedTicker} onClick={requestFull} title={fullRunTitle}>
            {fullPending ? 'Preparing…' : 'Run full ▸'}
          </button>
          <TickerPicker />
        </>
      )}
      </div>
      {performanceOpen && <PerformancePanel onClose={() => setPerformanceOpen(false)} />}
    </>
  )
}
