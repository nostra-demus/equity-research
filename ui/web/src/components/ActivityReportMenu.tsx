import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { moduleLabel } from '../lib/format'
import type { ActivityRow } from '../lib/types'
import './swarm/CoreOrb.css' // reuse the .reportpop__item / __label / __hint / __scrim look

// The activity-row report chooser — a finished run produces several documents (a run summary, each
// module's synthesis, and for research runs the memo / thesis / dossier). Mirrors ModuleReportPopup:
// portaled to <body> so the activity overlay never clips it; manifest-driven so it only ever lists
// files that exist on disk (no dead links). Generic — no module name is hardcoded (CLAUDE.md §26).

// viewport anchor: the report button's right edge + the side to grow from (down by default, up near the bottom).
export interface ReportMenuAnchor {
  right: number
  top?: number
  bottom?: number
}

interface Props {
  row: ActivityRow
  anchor: ReportMenuAnchor
  onClose: () => void
}

type Item = { label: string; sub: string; path: string }

const SIG_RE = /^SIG-[0-9]{8}-[a-f0-9]{8}$/
const SCREENER_KINDS = new Set(['signal', 'screener-agent'])
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// the SIG id for a screener row: prefer its exact run folder, else the ticker (which IS the SIG for swarm runs).
function sigForRow(row: ActivityRow): string | null {
  const fromRoot = row.runRoot ? row.runRoot.split('/').pop() || '' : ''
  if (SIG_RE.test(fromRoot)) return fromRoot
  if (SIG_RE.test(row.ticker)) return row.ticker
  return null
}

export function ActivityReportMenu({ row, anchor, onClose }: Props) {
  const openCallFile = useStore((s) => s.openCallFile)
  const [items, setItems] = useState<Item[] | null>(null) // null = loading
  const [label, setLabel] = useState('')

  useEffect(() => {
    let alive = true
    const run = async (): Promise<{ items: Item[]; label: string }> => {
      if (SCREENER_KINDS.has(row.kind)) {
        const sig = sigForRow(row)
        if (!sig) return { items: [], label: '' }
        const runRoot = row.runRoot || `screener/runs/${sig}`
        const m = await api.screenerRun(sig)
        const out: Item[] = []
        if (m?.runMetadata) out.push({ label: 'Run summary', sub: 'whole-run overview & routing', path: `${runRoot}/RUN_METADATA.md` })
        for (const [mod, agents] of Object.entries(m?.modules || {})) {
          const synth = (agents as any[]).find((a) => /(^|\/)99_.*-synthesis$/.test(a?.agentKey || ''))
          if (synth) out.push({ label: `${cap(moduleLabel(mod))} — synthesis`, sub: 'module verdict & routing', path: `${runRoot}/${synth.agentKey}.md` })
        }
        return { items: out, label: `${sig} · ${out.length} document${out.length === 1 ? '' : 's'}` }
      }
      // research kinds: full / module / agent / rerun / review — open this run's reports under analyses/
      const m = await api.runManifest(row.ticker, row.runRoot)
      const rr: string | undefined = m?.runRoot || row.runRoot
      const out: Item[] = []
      if (rr) {
        if (m?.finalThesis) out.push({ label: 'Investment thesis', sub: 'final verdict & scenarios', path: `${rr}/final_thesis.md` })
        if (m?.memo) out.push({ label: 'Memo', sub: 'the plain-English colleague read', path: `${rr}/memo.md` })
        if (m?.fullDossier) out.push({ label: 'Full dossier', sub: 'every module, lossless', path: `${rr}/audit_dossier.md` })
        for (const [mod, tiers] of Object.entries(m?.moduleReports || {})) {
          const synthesis = (tiers as any)?.synthesis
          if (synthesis) out.push({ label: `${cap(moduleLabel(mod))} — synthesis`, sub: 'module deep-dive & verdict', path: synthesis })
        }
      }
      return { items: out, label: `${row.ticker} · ${out.length} document${out.length === 1 ? '' : 's'}` }
    }
    run()
      .then((r) => { if (alive) { setItems(r.items); setLabel(r.label) } })
      .catch(() => { if (alive) { setItems([]); setLabel('') } })
    return () => { alive = false }
  }, [row])

  const open = (it: Item) => { openCallFile(it.path, it.label); onClose() }

  return createPortal(
    <>
      <div className="reportpop__scrim" onClick={onClose} />
      <div
        className="reportpop"
        style={{ left: 'auto', right: anchor.right, top: anchor.top, bottom: anchor.bottom, transform: 'none', animation: 'none' }}
        onClick={(e) => e.stopPropagation()}
        role="menu"
      >
        {items === null ? (
          <div className="reportpop__label">Loading…</div>
        ) : items.length === 0 ? (
          <div className="reportpop__label">No reports for this run.</div>
        ) : (
          <>
            <div className="reportpop__label">{label}</div>
            {items.map((it) => (
              <button key={it.path} className="reportpop__item" onClick={() => open(it)} role="menuitem">
                <b>{it.label}</b>
                <span>{it.sub}</span>
              </button>
            ))}
            <div className="reportpop__hint">each opens with read + Download (PDF · Word · HTML · Markdown)</div>
          </>
        )}
      </div>
    </>,
    document.body,
  )
}
