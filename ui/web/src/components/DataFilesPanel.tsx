import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { DataCoverage } from './DataCoverage'

// short label per classified file type (server FileType)
const TYPE_LABEL: Record<string, string> = {
  annual_filing: 'Annual',
  quarterly_filing: 'Quarterly',
  transcript: 'Transcript',
  sell_side_earnings_note: 'Sell-side note',
  investor_deck: 'Deck',
  consensus_estimates: 'Estimates',
  multiples_export: 'Multiples',
  peer_comps: 'Peers',
  ownership_insider: 'Ownership',
  proxy_comp: 'Proxy',
  financials: 'Financials',
  guidance: 'Guidance',
  business_relationships: 'Suppliers/Customers',
  user_note: 'Note',
  external_data: 'External',
  other: 'Other',
}

// The data-pool inspector. Lists every file the cockpit classified, and — the point —
// expands a multi-tab workbook into its tabs so you can see nothing was left behind. Below the
// file list, the source-document coverage (DataCoverage) shows what's present (with the satisfying
// file named, tab/content-aware) vs what could be added — proactive and non-gating, so a thin pool
// is caught before the run, not after.
// Populated only in live mode (the static showcase ships an empty file list).
export function DataFilesPanel() {
  const dataStatus = useStore((s) => s.dataStatus)
  const dataScan = useStore((s) => s.dataScan)
  const driveEnabled = useStore((s) => s.driveEnabled)
  const staticMode = useStore((s) => s.staticMode)
  const openUploader = useStore((s) => s.openUploader)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const intakeAnalyzing = useStore((s) => s.intakeAnalyzing)
  const analyzeIntake = useStore((s) => s.analyzeIntake)
  const [open, setOpen] = useState(false) // collapsed by default — just the pill; click the header to expand
  const openedScan = useRef<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  // Bumped by e.g. the news-bridge chip after it selects the subject holding the newest routed note — a
  // click that only changed the selection would leave the note hidden behind a still-collapsed panel
  // (Codex #374 P2). Only ever pushes OPEN; a user who explicitly re-collapses it after arriving is
  // respected (this does not run again until the next bump).
  const expandRequest = useStore((s) => s.dataPoolExpandRequest)
  useEffect(() => {
    if (expandRequest > 0) setOpen(true)
  }, [expandRequest])
  useEffect(() => {
    if (dataScan?.stage === 'ready' && openedScan.current !== dataScan.scanId) {
      openedScan.current = dataScan.scanId
      setOpen(true)
    }
  }, [dataScan?.scanId, dataScan?.stage])

  if (!dataStatus || !dataStatus.hasAnyData || !dataStatus.files?.length) return null
  const files = dataStatus.files
  const tabTotal = files.reduce((n, f) => n + (f.sheets?.length || 0), 0)
  const canAdd = driveEnabled && !staticMode
  // "Analyze new data" — the one-click way to (re)generate the scoped intake plan, so a user never has to
  // drop to `/research:intake`. Research runs only (the intake/rerun flow is research-swarm), live mode.
  const canAnalyze = activeSwarm === 'research' && !staticMode

  return (
    <motion.div className="datafiles" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="datafiles__headrow">
        <button className="datafiles__head" onClick={() => setOpen((o) => !o)}>
          <span className="datafiles__chev" data-open={open}>▸</span>
          <span className="datafiles__title">Data pool</span>
          <span className="datafiles__count">
            {files.length} file{files.length === 1 ? '' : 's'}
            {tabTotal ? ` · ${tabTotal} tabs` : ''}
            {dataScan?.stage === 'ready' ? ' · Ready' : ''}
          </span>
        </button>
        {canAnalyze && (
          <button
            className="datafiles__analyze"
            disabled={intakeAnalyzing}
            aria-busy={intakeAnalyzing}
            title="Read the newest documents in the pool and show which orbs to re-run for them, right on the map. This launches NO re-run — it just points you at what changed."
            onClick={() => void analyzeIntake()}
          >
            {intakeAnalyzing ? <span className="datafiles__spin" aria-hidden /> : <span className="datafiles__analyze-ic" aria-hidden>✦</span>}
            {intakeAnalyzing ? 'Analyzing…' : 'Analyze new data'}
          </button>
        )}
        {canAdd && <button className="datafiles__add" title="Upload more documents to this company's Drive folder" onClick={() => openUploader(dataStatus.ticker)}>＋ Add files</button>}
      </div>

      {open && (
        // one scroller for the list + coverage together: the dock is a rail child now, so a long pool
        // has to scroll INSIDE it rather than grow the column into the dock above
        <div className="datafiles__body">
          <div className="datafiles__list">
            {files.map((f, i) => {
              const tabs = f.sheets ?? []
              const hasTabs = tabs.length > 0
              // Identify a row by its full pool location, not its basename: two filings named "annual.pdf"
              // in different subfolders (e.g. "Filings 3/" and "Filings 4/") must expand independently.
              const rowId = f.path ?? f.filename
              const isOpen = !!expanded[rowId]
              // external rows (data/<T>/external/**): show the document's own name (the full
              // pool-relative path stays in the tooltip) + a compact provider · §4-tier chip.
              // A routed wire-event note shows its news HEADLINE (server-parsed `displayName`) instead of
              // the machine filename, and its hover carries the source + timestamp (`note`), so a routed
              // event is identifiable at a glance.
              const ext = f.external
              const displayName = f.displayName || (ext ? f.filename.split('/').pop() || f.filename : f.filename)
              // a nested pool document (server `path`) shows its containing subfolder as a quiet prefix, so
              // "which folder is this in" is answered at a glance; the tooltip carries the full location.
              const folder = !ext && f.path ? f.path.split('/').slice(0, -1).join('/') : ''
              const rowTitle = f.note ? `${f.note}\n${f.path ?? f.filename}` : (f.path ?? f.filename)
              const extChip = ext ? [ext.provider, ext.tier ? `T${ext.tier}` : null].filter(Boolean).join(' · ') : ''
              const extTitle = ext
                ? [ext.provider, ext.sourceType, ext.tier ? `§4 tier ${ext.tier}` : null, ext.asOf ? `as-of ${ext.asOf}` : null]
                    .filter(Boolean).join(' · ')
                : ''
              return (
                <div className="datafiles__file" key={`${rowId}:${i}`}>
                  <div
                    className={`datafiles__row${hasTabs ? ' datafiles__row--btn' : ''}`}
                    onClick={hasTabs ? () => setExpanded((e) => ({ ...e, [rowId]: !e[rowId] })) : undefined}
                  >
                    {/* a routed wire-event note is NEWS, not an opaque "other" file */}
                    <span className="datafiles__badge" data-conf={f.confidence}>{f.displayName ? 'NEWS' : TYPE_LABEL[f.type] || f.type}</span>
                    <span className="datafiles__name" title={rowTitle}>
                      {folder && <span className="datafiles__folder">{folder}/</span>}
                      {displayName}
                    </span>
                    {extChip && <span className="datafiles__ext" title={extTitle}>{extChip}</span>}
                    {hasTabs ? (
                      <span className="datafiles__tabsn">{tabs.length} tabs {isOpen ? '▾' : '▸'}</span>
                    ) : (
                      f.periodHint && <span className="datafiles__period">{f.periodHint}</span>
                    )}
                  </div>
                  {hasTabs && isOpen && (
                    <div className="datafiles__tabs">
                      {tabs.map((s, j) => (
                        <div className="datafiles__tab" key={`${s.name}:${j}`}>
                          <span className="datafiles__tabname">{s.name}</span>
                          <span className="datafiles__tabdim">{s.rows}×{s.cols} · {s.cells} cells</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <DataCoverage coverage={dataStatus.coverage} mode="panel" />
        </div>
      )}
    </motion.div>
  )
}
