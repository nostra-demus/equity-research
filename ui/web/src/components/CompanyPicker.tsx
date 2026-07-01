import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useStore } from '../lib/store'
import { decisionColor, fmtAgo, fmtDuration } from '../lib/format'
import { plainKind } from '../lib/plain'
import type { TickerSummary } from '../lib/types'

// In-stage company picker for the research empty state (when companies exist but none is chosen). A
// search-first, keyboard-driven palette right where the user is looking — no hunting to the top-right menu.
// Reuses every existing primitive (decisionColor, .pulsedot, .empty__spin/spin, .kbd, evshimmer, tokens)
// and the same actions (selectTicker / openAddCompany), so a pick here behaves identically to the dropdown.
// Default order is opinionated: a running company first, then most-recently-touched (the re-open path),
// then the rest, with syncing and invalid folders sinking to the bottom. Picking an invalid folder is NOT
// a dead click — it routes to the existing "rename the folder" explainer.
export function CompanyPicker() {
  const tickers = useStore((s) => s.tickers)
  const selectTicker = useStore((s) => s.selectTicker)
  const openAddCompany = useStore((s) => s.openAddCompany)
  const activeRuns = useStore((s) => s.activeRunsByTicker)
  const globalActive = useStore((s) => s.globalActive)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const driveEnabled = useStore((s) => s.driveEnabled)
  const staticMode = useStore((s) => s.staticMode)
  const connected = useStore((s) => s.connected)
  const canAdd = driveEnabled && !staticMode
  const reduced = useReducedMotion()

  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // In-flight RESEARCH runs, grouped by company (selectTicker reconnects ALL of a ticker's runs, so one
  // row per ticker). Scoped hard to research: filtered by swarmId AND by the live roster, so a concurrent
  // screener/commodity run — or a run for a folder since removed — never shows a phantom "resume" here.
  // Fail CLOSED on swarmId: require a positive 'research' tag rather than defaulting absence to research.
  // During a code deploy the new bundle can briefly be served by the still-running old engine whose
  // /api/runs omits swarmId; defaulting-to-research would then let a commodity run (whose ticker IS its
  // subject id, e.g. GOLD) leak in if a same-named research folder exists. Excluding untagged runs means
  // the banner simply doesn't show for those few seconds — self-heals once the new server reports swarmId.
  const tickerSet = useMemo(() => new Set(tickers.map((t) => t.ticker)), [tickers])
  const liveRuns = useMemo(() => {
    if (activeSwarm !== 'research') return []
    const groups = new Map<string, { ticker: string; kinds: string[]; startedAt?: number }>()
    for (const r of globalActive) {
      if (r.swarmId !== 'research' || !tickerSet.has(r.ticker)) continue
      const g = groups.get(r.ticker) ?? { ticker: r.ticker, kinds: [] as string[], startedAt: undefined as number | undefined }
      g.kinds.push(r.kind)
      if (r.startedAt != null) g.startedAt = g.startedAt == null ? r.startedAt : Math.min(g.startedAt, r.startedAt)
      groups.set(r.ticker, g)
    }
    return [...groups.values()].sort((a, b) => a.ticker.localeCompare(b.ticker))
  }, [globalActive, activeSwarm, tickerSet])

  // Live elapsed clock for the "running Nm" readout — a 1s text tick, only while a resume row is showing.
  const [nowTick, setNowTick] = useState(() => Date.now())
  useEffect(() => {
    if (!liveRuns.length) return
    setNowTick(Date.now())
    const id = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [liveRuns.length])

  // default sort: running → most-recently-touched → rest, with syncing then invalid demoted
  const sorted = useMemo(() => {
    const rank = (t: TickerSummary) => (activeRuns.has(t.ticker) ? 0 : t.valid === false ? 4 : t.syncing ? 3 : 1)
    return [...tickers].sort((a, b) => {
      const r = rank(a) - rank(b)
      if (r) return r
      const la = a.lastChangeAt ?? 0, lb = b.lastChangeAt ?? 0
      if (la !== lb) return lb - la
      return a.ticker.localeCompare(b.ticker)
    })
  }, [tickers, activeRuns])

  // filter: prefix matches rank above substring matches; otherwise keep the default order
  const filtered = useMemo(() => {
    const query = q.trim().toUpperCase()
    if (!query) return sorted
    const pref: TickerSummary[] = [], sub: TickerSummary[] = []
    for (const t of sorted) {
      const sym = t.ticker.toUpperCase()
      if (sym.startsWith(query)) pref.push(t)
      else if (sym.includes(query)) sub.push(t)
    }
    return [...pref, ...sub]
  }, [sorted, q])

  useEffect(() => { setHi(0) }, [q])
  useEffect(() => { setHi((h) => Math.min(h, Math.max(0, filtered.length - 1))) }, [filtered.length])

  // focus the search on mount — but never steal focus from an open modal/another field
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    const a = document.activeElement as HTMLElement | null
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable || a.closest('[role="dialog"]'))) return
    el.focus()
  }, [])

  // keep the keyboard-highlighted row in view (on keyboard moves only — hover never scrolls)
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${hi}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [hi])

  const onKeyDown = (e: React.KeyboardEvent) => {
    // a focused Resume button owns its own Enter/Space — don't let the list handler hijack them
    if ((e.target as HTMLElement).closest?.('.coco__resume')) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const t = filtered[hi]; if (t) selectTicker(t.ticker) }
    else if (e.key === 'Escape') { if (q) setQ(''); else inputRef.current?.blur() }
  }

  const filtering = q.trim().length > 0
  return (
    <motion.div className="coco" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }} onKeyDown={onKeyDown}>
      <div className="coco__head">
        <span className="coco__eyebrow">Select a company</span>
        <span className="coco__count">{tickers.length} compan{tickers.length === 1 ? 'y' : 'ies'}</span>
      </div>

      {liveRuns.length > 0 && (
        <motion.div
          className="coco__resume"
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="coco__resume-head">
            <span className="pulsedot" aria-hidden />
            <span className="coco__resume-title">
              {liveRuns.length === 1 ? 'A research run is live' : `${liveRuns.length} research runs are live`}
            </span>
            <span className="coco__resume-hint">— pick up where you left off</span>
          </div>
          <div className="coco__resume-rows">
            {liveRuns.map((g) => (
              <button
                key={g.ticker}
                type="button"
                className="coco__resume-row"
                onClick={() => selectTicker(g.ticker)}
                title={`Reconnect to the live run on ${g.ticker} — it never stopped, this just shows it again`}
              >
                <span className="coco__resume-sym">{g.ticker}</span>
                <span className="coco__resume-meta">
                  {g.kinds.length > 1 ? `${g.kinds.length} runs` : plainKind(g.kinds[0])}
                  {g.startedAt != null && <> · {fmtDuration(Math.max(0, nowTick - g.startedAt))}</>}
                </span>
                <span className="coco__resume-cta">Resume <span className="coco__resume-arrow" aria-hidden>▸</span></span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="coco__search">
        <svg className="coco__searchicon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={connected ? 'Search ticker (HCG, TMCV, EMAR)…' : 'Reconnecting…'}
          disabled={!connected}
          spellCheck={false}
          autoComplete="off"
          aria-label="Search companies by ticker"
        />
        {!q && <span className="kbd coco__hint">↑↓ Enter</span>}
      </div>

      <div className="coco__list" role="listbox" aria-label="Companies" ref={listRef}>
        {filtered.map((t, i) => {
          const running = activeRuns.has(t.ticker)
          const c = t.valid !== false && t.latestRun?.decision ? decisionColor(t.latestRun.decision) : null
          return (
            <button
              key={t.ticker}
              data-idx={i}
              role="option"
              aria-selected={i === hi}
              className={`coco__row${i === hi ? ' is-active' : ''}${t.valid === false ? ' coco__row--invalid' : ''}`}
              onClick={() => selectTicker(t.ticker)}
            >
              <span className="coco__sym">
                {running ? (
                  <span className="pulsedot" title="Run in progress" />
                ) : t.valid === false ? (
                  <span className="coco__pip coco__pip--bad" title={t.invalidReason} />
                ) : t.syncing ? (
                  <svg className="empty__spin coco__syncicon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" /></svg>
                ) : null}
                {t.ticker}
              </span>

              <span className="coco__meta">
                {t.valid === false ? (
                  <span style={{ color: 'var(--bad)' }}>rename → {t.suggestedTicker || 'a valid symbol'}</span>
                ) : t.syncing ? (
                  <span style={{ color: 'var(--accent-bright)' }}>syncing… {t.fileCount} file{t.fileCount === 1 ? '' : 's'}</span>
                ) : t.fileCount === 0 ? (
                  <span style={{ fontStyle: 'italic' }}>no documents yet</span>
                ) : (
                  <>{t.fileCount} file{t.fileCount === 1 ? '' : 's'}</>
                )}
              </span>

              <span className="coco__verdict">
                {c && t.latestRun?.decision && (
                  <span className="coco__pill" style={{ color: c, borderColor: `color-mix(in srgb, ${c} 40%, transparent)`, background: `color-mix(in srgb, ${c} 12%, transparent)` }}>
                    {t.latestRun.decision}
                    {t.latestRun.confidence != null && <span className="coco__pill-conf"> · {t.latestRun.confidence}</span>}
                  </span>
                )}
                {running ? (
                  <span className="coco__ago" style={{ color: 'var(--accent)' }}>running</span>
                ) : t.lastChangeAt ? (
                  <span className="coco__ago">{fmtAgo(t.lastChangeAt)}</span>
                ) : null}
              </span>
            </button>
          )
        })}

        {!filtered.length && (
          <div className="coco__nomatch">No company matches “{q.trim()}”</div>
        )}
      </div>

      <div className="coco__foot">
        {canAdd ? (
          <button className="empty__btn coco__add" onClick={() => openAddCompany()}>+ Add a company</button>
        ) : (
          <span className="coco__footnote">Drop a <b>&lt;TICKER&gt;/</b> folder of filings into the synced Drive folder.</span>
        )}
        {filtering && filtered.length !== tickers.length && <span className="coco__legend">{filtered.length} of {tickers.length}</span>}
      </div>
    </motion.div>
  )
}
