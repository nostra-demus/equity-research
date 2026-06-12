import { useState } from 'react'
import { useStore } from '../lib/store'
import { decisionColor, resetIn, sufficiencyColor, usageColor, usageLabel, usagePct } from '../lib/format'
import { EngineStatusPill } from './EngineStatus'

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

// Screener-mode middle controls: New signal · Scan sources (two-click confirm) · Inbox count · Pipeline.
function ScreenerControls() {
  const openSignalIntake = useStore((s) => s.openSignalIntake)
  const openPipeline = useStore((s) => s.openPipeline)
  const runSweep = useStore((s) => s.runSweep)
  const board = useStore((s) => s.scBoard)
  const health = useStore((s) => s.health)
  const [armSweep, setArmSweep] = useState(false)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  const inboxCount = board?.counts?.inbox_unconsumed ?? 0
  return (
    <>
      <button
        className={`btn btn--ghost${armSweep ? ' btn--armed' : ''}`}
        disabled={engineDown}
        onClick={() => {
          if (!armSweep) {
            setArmSweep(true)
            setTimeout(() => setArmSweep(false), 4000)
            return
          }
          setArmSweep(false)
          void runSweep()
        }}
        title="Scan the approved sources for material events (~$2–12) — fills the Inbox; nothing runs without you"
      >
        {armSweep ? 'confirm scan · ~$2–12 ▸' : 'Scan sources'}
      </button>
      <button className="btn btn--ghost" onClick={openPipeline} title="The idea pipeline — inbox, gauntlet, watchlist, provisional, full machine, handoffs">
        Pipeline{inboxCount > 0 && <span className="inboxchip" title={`${inboxCount} unprocessed inbox signal${inboxCount === 1 ? '' : 's'}`}>{inboxCount}</span>}
      </button>
      <button className="btn btn--amber" disabled={engineDown} onClick={openSignalIntake} title="Run one signal through the gauntlet">
        New signal ▸
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
  const [open, setOpen] = useState(false)
  const sel = tickers.find((t) => t.ticker === selected)
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
          </div>
        </>
      )}
    </div>
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
              {credit?.isUsingOverage && <div style={{ color: 'var(--accent)', marginTop: 3 }}>Currently using paid overage.</div>}
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
  const openCalls = useStore((s) => s.openCalls)
  const requestFull = useStore((s) => s.requestFull)
  const anyRun = useStore((s) => s.anyRunForTicker(s.selectedTicker))
  const selectedTicker = useStore((s) => s.selectedTicker)
  const staticMode = useStore((s) => s.staticMode)
  const health = useStore((s) => s.health)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const swarms = useStore((s) => s.swarms)
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'
  const screenerMode = activeSwarm === 'screener'
  const sub = screenerMode ? (swarms.find((s) => s.id === activeSwarm)?.label ? 'Idea Generation — Screener' : 'Screener') : 'Equity Research Cockpit'
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <div>
          <div className="brand__name">Nostradamus Swarm</div>
        </div>
        <span className="brand__sub">{sub}</span>
        <SwarmSwitcher />
        {staticMode && <span className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent-deep)' }} title="Live showcase of completed runs. Launching agents happens on your local machine.">read-only showcase</span>}
      </div>
      <div className="topbar__spacer" />
      {screenerMode ? (
        <>
          <EngineStatusPill />
          <button className="btn btn--ghost" onClick={openActivity} title="Activity log — who ran what, when">Activity</button>
          <ScreenerControls />
          <CreditBadge />
        </>
      ) : (
        <>
          <ReadinessStrip />
          <EngineStatusPill />
          <button className="btn btn--ghost" onClick={openCalls} title="Calls tracker — every call the engine made and what's happened since">Calls</button>
          <button className="btn btn--ghost" onClick={openActivity} title="Activity log — who ran what, when, on which company">Activity</button>
          {decision?.final_thesis_path !== undefined || decision?.decision ? (
            <button className="btn btn--ghost" onClick={openThesis}>Thesis</button>
          ) : null}
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
