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

// The doc types worth having before a full run, in rough order of how much they move the analysis.
// This list is informed-consent only: it surfaces what's PRESENT vs what could still be ADDED so a
// thin data pool is visible BEFORE the spend, not discovered in the output. It never blocks a launch —
// the readiness gate already handles blocking, and per CLAUDE.md §11 a thinner pool caps conviction,
// it does not forbid the run. Keys are server FileTypes (matched against dataStatus.recentByType);
// `helps` says in plain English what each doc sharpens, so the user can judge whether a gap is worth
// filling. Not every type fits every company (a single-segment firm needs no peer comps) — hence
// "recommended", not "required".
const CHECKLIST: { type: string; helps: string }[] = [
  { type: 'annual_filing', helps: 'spine for every module' },
  { type: 'quarterly_filing', helps: 'latest-quarter trend' },
  { type: 'transcript', helps: 'guidance & management tone' },
  { type: 'consensus_estimates', helps: 'the bar to beat' },
  { type: 'guidance', helps: 'management targets' },
  { type: 'financials', helps: 'clean statement extract' },
  { type: 'multiples_export', helps: 'own valuation history' },
  { type: 'peer_comps', helps: 'relative valuation' },
  { type: 'proxy_comp', helps: 'pay & governance' },
  { type: 'ownership_insider', helps: 'insider skin-in-the-game' },
  { type: 'investor_deck', helps: 'segment & strategy detail' },
]

// Plain-English age for a present doc, from the server's ageMonths (null => unknown date).
function ageLabel(ageMonths: number | null): string {
  if (ageMonths == null) return ''
  if (ageMonths < 1) return '<1mo'
  if (ageMonths < 12) return `${Math.round(ageMonths)}mo`
  return `${(ageMonths / 12).toFixed(1)}yr`
}

// The data-pool inspector. Lists every file the cockpit classified, and — the point —
// expands a multi-tab workbook into its tabs so you can see nothing was left behind. Below the
// file list, a recommended-docs checklist shows what's present (with age) vs what could be added —
// proactive and non-gating, so a thin pool is caught before the run, not after.
// Populated only in live mode (the static showcase ships an empty file list).
export function DataFilesPanel() {
  const dataStatus = useStore((s) => s.dataStatus)
  const [open, setOpen] = useState(true)
  const [checkOpen, setCheckOpen] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (!dataStatus || !dataStatus.hasAnyData || !dataStatus.files?.length) return null
  const files = dataStatus.files
  const tabTotal = files.reduce((n, f) => n + (f.sheets?.length || 0), 0)
  const recent = dataStatus.recentByType || {}
  const presentCount = CHECKLIST.reduce((n, c) => n + (recent[c.type] ? 1 : 0), 0)

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
        <>
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

        <div className="datafiles__checklist">
          <button className="datafiles__checkhead" onClick={() => setCheckOpen((o) => !o)}>
            <span className="datafiles__chev" data-open={checkOpen}>▸</span>
            <span className="datafiles__checktitle">Recommended docs</span>
            <span className="datafiles__checkcount">{presentCount}/{CHECKLIST.length}</span>
          </button>
          {checkOpen && (
            <div className="datafiles__checkrows">
              {CHECKLIST.map((c) => {
                const have = recent[c.type]
                return (
                  <div className="datafiles__check" data-have={have ? 'true' : 'false'} key={c.type}>
                    <span className="datafiles__checkmark">{have ? '✓' : '○'}</span>
                    <span className="datafiles__checklabel">{TYPE_LABEL[c.type] || c.type}</span>
                    {have ? (
                      <span className="datafiles__checkage">{ageLabel(have.ageMonths)}</span>
                    ) : (
                      <span className="datafiles__checkhelp">{c.helps}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        </>
      )}
    </motion.div>
  )
}
