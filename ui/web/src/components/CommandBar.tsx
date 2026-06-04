import { useState } from 'react'
import { useStore } from '../lib/store'
import { decisionColor, resetIn, sufficiencyColor, usageColor, usageLabel, usagePct } from '../lib/format'

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

function TickerPicker() {
  const tickers = useStore((s) => s.tickers)
  const selected = useStore((s) => s.selectedTicker)
  const selectTicker = useStore((s) => s.selectTicker)
  const connected = useStore((s) => s.connected)
  const dataDir = useStore((s) => s.dataDir)
  const [open, setOpen] = useState(false)
  return (
    <div className="tickerpick">
      <button className="tickerpick__btn" onClick={() => setOpen((o) => !o)}>
        {!connected && <span className="readiness__dot" style={{ background: 'var(--bad)' }} title="Control plane offline" />}
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
                className={`tickerpick__item${t.ticker === selected ? ' tickerpick__item--active' : ''}`}
                onClick={() => {
                  selectTicker(t.ticker)
                  setOpen(false)
                }}
              >
                <span className="tickerpick__sym">{t.ticker}</span>
                <span className="tickerpick__meta">{t.fileCount} files</span>
                {t.latestRun?.decision && (
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
  const [open, setOpen] = useState(false)

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
  const requestFull = useStore((s) => s.requestFull)
  const activeRun = useStore((s) => s.activeRun)
  const selectedTicker = useStore((s) => s.selectedTicker)
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <div>
          <div className="brand__name">Swarm</div>
        </div>
        <span className="brand__sub">Equity Research Cockpit</span>
      </div>
      <div className="topbar__spacer" />
      <ReadinessStrip />
      {decision?.final_thesis_path !== undefined || decision?.decision ? (
        <button className="btn btn--ghost" onClick={openThesis}>Thesis</button>
      ) : null}
      <button className="btn btn--amber" disabled={!selectedTicker || !!activeRun} onClick={requestFull}>
        Run full ▸
      </button>
      <CreditBadge />
      <TickerPicker />
    </div>
  )
}
