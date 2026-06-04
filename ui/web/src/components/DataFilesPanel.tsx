import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

// short label per classified file type (server FileType)
const TYPE_LABEL: Record<string, string> = {
  annual_filing: 'Annual',
  quarterly_filing: 'Quarterly',
  transcript: 'Transcript',
  investor_deck: 'Deck',
  consensus_estimates: 'Estimates',
  multiples_export: 'Multiples',
  peer_comps: 'Peers',
  ownership_insider: 'Ownership',
  proxy_comp: 'Proxy',
  financials: 'Financials',
  guidance: 'Guidance',
  user_note: 'Note',
  other: 'Other',
}

// The data-pool inspector. Lists every file the cockpit classified, and — the point —
// expands a multi-tab workbook into its tabs so you can see nothing was left behind.
// Populated only in live mode (the static showcase ships an empty file list).
export function DataFilesPanel() {
  const dataStatus = useStore((s) => s.dataStatus)
  const [open, setOpen] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (!dataStatus || !dataStatus.hasAnyData || !dataStatus.files?.length) return null
  const files = dataStatus.files
  const tabTotal = files.reduce((n, f) => n + (f.sheets?.length || 0), 0)

  return (
    <motion.div className="datafiles" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <button className="datafiles__head" onClick={() => setOpen((o) => !o)}>
        <span className="datafiles__chev" data-open={open}>▸</span>
        <span className="datafiles__title">Data pool</span>
        <span className="datafiles__count">
          {files.length} file{files.length === 1 ? '' : 's'}
          {tabTotal ? ` · ${tabTotal} tabs` : ''}
        </span>
      </button>

      {open && (
        <div className="datafiles__list">
          {files.map((f, i) => {
            const tabs = f.sheets ?? []
            const hasTabs = tabs.length > 0
            const isOpen = !!expanded[f.filename]
            return (
              <div className="datafiles__file" key={`${f.filename}:${i}`}>
                <div
                  className={`datafiles__row${hasTabs ? ' datafiles__row--btn' : ''}`}
                  onClick={hasTabs ? () => setExpanded((e) => ({ ...e, [f.filename]: !e[f.filename] })) : undefined}
                >
                  <span className="datafiles__badge" data-conf={f.confidence}>{TYPE_LABEL[f.type] || f.type}</span>
                  <span className="datafiles__name" title={f.filename}>{f.filename}</span>
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
      )}
    </motion.div>
  )
}
