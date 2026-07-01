import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { decisionColor, resetIn, sufficiencyColor, usageColor, usageLabel, usagePct } from '../lib/format'
import { plainKind } from '../lib/plain'
import { EngineStatusPill } from './EngineStatus'
import { ThemeToggle } from './ThemeToggle'

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
  const title = status?.enabled
    ? `The free scanner reads trusted news every ${status.intervalMin} min and scores each item. Today: read ${status.today.read} · kept ${status.today.kept} · dropped ${status.today.dropped}. Click to watch it live.`
    : 'The free scanner is off — it needs a (free) Groq key in the engine. Click to see the wire anyway.'
  return (
    <button className="autoscan" onClick={() => void openNewsFeed()} title={title}>
      <span className={`autoscan__dot${status?.enabled ? ' autoscan__dot--on' : ''}${status?.running ? ' autoscan__dot--busy' : ''}`} />
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

// Screener-mode middle controls: Recent runs · Check an event. The triage → idea funnel folded into
// the left Events rail (one unified stream); this button opens the run history. The news scan is
// automatic — its status chip (AutoScanChip) lives beside the engine pill.
function ScreenerControls() {
  const openSignalIntake = useStore((s) => s.openSignalIntake)
  const openPipeline = useStore((s) => s.openPipeline)
  const health = useStore((s) => s.health)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  return (
    <>
      <button className="btn btn--ghost" onClick={openPipeline} title="Recent runs — every event you've put through the checks, newest first; reopen any analysis">
        Recent runs
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
  const [open, setOpen] = useState(false)
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
              {swarmSubjectList.map((s) => (
                <button
                  key={s}
                  className={`tickerpick__item${s === selected ? ' tickerpick__item--active' : ''}`}
                  onClick={() => { selectTicker(s); setOpen(false) }}
                >
                  <span className="tickerpick__sym">{s}</span>
                  {activeRunsByTicker.has(s) && <span className="pulsedot" style={{ flexShrink: 0 }} title="Run in progress" />}
                </button>
              ))}
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
            {tickers.map((t) => (
              <button
                key={t.ticker}
                className={`tickerpick__item${t.ticker === selected ? ' tickerpick__item--active' : ''}${t.valid === false ? ' tickerpick__item--invalid' : ''}`}
                onClick={() => {
                  selectTicker(t.ticker)
                  setOpen(false)
                }}
              >
                <span className="tickerpick__sym">{t.ticker}</span>
                {activeRunsByTicker.has(t.ticker) && <span className="pulsedot" style={{ flexShrink: 0 }} title="Run in progress" />}
                {t.valid === false ? (
                  <span className="tickerpick__warn" title={`${t.invalidReason}. Rename the Drive folder to ${t.suggestedTicker}.`}>⚠ rename → {t.suggestedTicker}</span>
                ) : t.syncing ? (
                  <span className="tickerpick__meta tickerpick__meta--sync"><span className="pulsedot" style={{ flexShrink: 0 }} /> syncing… {t.fileCount} file{t.fileCount === 1 ? '' : 's'}</span>
                ) : (
                  <span className="tickerpick__meta">{t.fileCount} file{t.fileCount === 1 ? '' : 's'}</span>
                )}
                {t.valid !== false && t.latestRun?.decision && (
                  <span style={{ color: decisionColor(t.latestRun.decision), fontSize: 11, fontWeight: 600 }}>{t.latestRun.decision}</span>
                )}
              </button>
            ))}
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
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  const entry = selectedTicker
    ? resumableRuns.find((e) => e.kind === 'full' && e.subject === selectedTicker && e.swarm === activeSwarm)
    : undefined
  if (!entry) return null
  const noun = entry.unit === 'agent' ? 'check' : 'module'
  const title = engineDown
    ? 'Engine offline — live runs are paused until it reconnects'
    : `This run stopped partway (${entry.doneCount}/${entry.totalCount} ${noun}s done). Resume finishes it from where it stopped — the done work is reused.`
  return (
    <button className="aresume aresume--bar" disabled={engineDown} onClick={() => void resumeRun(entry)} title={title}>
      Resume<span className="aresume__glyph" aria-hidden>▸</span>
      <span className="aresume__meta">{entry.doneCount}/{entry.totalCount}</span>
    </button>
  )
}

function ReadinessStrip() {
  const graph = useStore((s) => s.graph)
  const dataStatus = useStore((s) => s.dataStatus)
  if (!graph || !dataStatus) return null
  const ready = graph.modules.filter((m) => dataStatus.modules[m.name]?.status === 'Sufficient').length
  return (
    <div className="readiness" title="Per-module data readiness">
      <div className="readiness__group">
        {graph.modules.map((m) => {
          const st = dataStatus.modules[m.name]?.status || 'Insufficient'
          return <span key={m.name} className="readiness__dot" style={{ background: sufficiencyColor(st as any) }} title={`${m.name} · ${st}`} />
        })}
      </div>
      <span className="readiness__label">{ready}/{graph.modules.length} ready</span>
    </div>
  )
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
  let label = 'usage · check'
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

export function CommandBar() {
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const openActivity = useStore((s) => s.openActivity)
  const openScoring = useStore((s) => s.openScoring)
  const openReview = useStore((s) => s.openReview)
  const openCalls = useStore((s) => s.openCalls)
  const openChat = useStore((s) => s.openChat)
  const requestFull = useStore((s) => s.requestFull)
  const anyRun = useStore((s) => s.anyRunForTicker(s.selectedTicker))
  const selectedTicker = useStore((s) => s.selectedTicker)
  const staticMode = useStore((s) => s.staticMode)
  const health = useStore((s) => s.health)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const swarms = useStore((s) => s.swarms)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  const screenerMode = activeSwarm === 'screener'
  const sub = screenerMode
    ? (swarms.find((s) => s.id === activeSwarm)?.label ? 'Idea Generation — Screener' : 'Screener')
    : activeSwarm === 'research'
      ? 'Equity Research Cockpit'
      : `${swarms.find((s) => s.id === activeSwarm)?.label || 'Commodity'} Research Cockpit`
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <div>
          <div className="brand__name">Nostradamus Swarm</div>
        </div>
        <span className="brand__sub">{sub}</span>
        <SwarmSwitcher />
        {staticMode && <span className="chip" style={{ color: 'var(--accent-bright)', borderColor: 'var(--accent-deep)' }} title="Live showcase of completed runs. Launching agents happens on your local machine.">read-only showcase</span>}
      </div>
      <div className="topbar__spacer" />
      <ThemeToggle />
      {screenerMode ? (
        <>
          <StopControl />
          <AutoScanChip />
          <EngineStatusPill />
          <button className="btn btn--ghost" onClick={openScoring} title="Scoring weights — tune how every event is scored, for the whole wire">Scoring</button>
          <button className="btn btn--ghost" onClick={openActivity} title="Activity log — who ran what, when">Activity</button>
          <button className="btn btn--ghost" onClick={openReview} title="Batch review — flag a day's worth of items fast, with keyboard shortcuts">Review</button>
          <ScreenerControls />
          <CreditBadge />
        </>
      ) : (
        <>
          <ReadinessStrip />
          <StopControl />
          <EngineStatusPill />
          <button className="btn btn--ghost" onClick={openCalls} title="Calls tracker — every call the engine made and what's happened since">Calls</button>
          <button className="btn btn--ghost" onClick={openActivity} title="Activity log — who ran what, when, on which company">Activity</button>
          {decision?.final_thesis_path !== undefined || decision?.decision ? (
            <button className="btn btn--ghost" onClick={openThesis}>Thesis</button>
          ) : null}
          <button className="btn cmdbar__ask" disabled={!selectedTicker} onClick={() => openChat('run')} title={selectedTicker ? 'Ask questions about this run’s output — answered only from what the engine wrote' : 'Select a company first'}>
            Ask ▸
          </button>
          <ResumeChip />
          <button className="btn btn--amber" disabled={!selectedTicker || anyRun || engineDown} onClick={requestFull} title={staticMode ? 'Runs on your local machine (npm run dev)' : engineDown ? 'Engine offline — live runs are paused until it reconnects' : anyRun ? 'A run is in flight — a full run needs exclusive access' : 'Run the full pipeline'}>
            Run full ▸
          </button>
          <CreditBadge />
          <TickerPicker />
        </>
      )}
    </div>
  )
}
