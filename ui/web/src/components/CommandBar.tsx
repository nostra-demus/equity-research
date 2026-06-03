import { useState } from 'react'
import { useStore } from '../lib/store'
import { decisionColor, sufficiencyColor } from '../lib/format'

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
  const [open, setOpen] = useState(false)
  return (
    <div className="tickerpick">
      <button className="tickerpick__btn" onClick={() => setOpen((o) => !o)}>
        <span className="tickerpick__ticker">{selected || 'Select ticker'}</span>
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
            {!tickers.length && <div style={{ padding: '12px', color: 'var(--text-faint)', fontSize: 12 }}>No tickers in data/</div>}
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

function CreditBadge() {
  const credit = useStore((s) => s.credit)
  const checking = useStore((s) => s.creditChecking)
  const check = useStore((s) => s.checkCredit)
  let color = 'var(--text-faint)'
  let label = 'credits · check'
  if (credit?.checked) {
    color = credit.ok ? 'var(--accent)' : 'var(--bad)'
    label = credit.ok ? 'credits ok' : 'out of credits'
  }
  return (
    <button className="creditbadge" onClick={check} title="Check Claude credit / rate-limit status">
      <span className="creditbadge__dot" style={{ background: color }} />
      <span className={checking ? 'spin' : ''} style={{ display: 'inline-flex' }}>{checking ? '◴' : ''}</span>
      {checking ? 'checking…' : label}
    </button>
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
