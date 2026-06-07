import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../lib/store'
import './CoreOrb.css'

interface Props {
  x: number
  y: number
  r: number
  decision: any | null
  bloom: boolean
  armed: boolean
  onClick: () => void
  onHover?: (hovering: boolean) => void
}

type Tier = { tier: 'thesis' | 'memo' | 'dossier'; label: string; sub: string }

export function CoreOrb({ x, y, r, decision, bloom, armed, onClick, onHover }: Props) {
  const reports = useStore((s) => s.reports)
  const openReport = useStore((s) => s.openReport)
  const ref = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<{ cx: number; top: number } | null>(null)
  const size = r * 2
  const hasMemo = !!decision?.decision

  // a completed run writes up to three documents — show every one that exists, each opening in the
  // reader (which has read + Download for PDF/Word/HTML/Markdown). Order = most-distilled first.
  const tiers: Tier[] = [
    reports.thesis && { tier: 'thesis', label: 'Investment Thesis', sub: 'the full thesis & committee decision' },
    reports.memo && { tier: 'memo', label: 'Memo', sub: 'the ~10-page plain-English read' },
    reports.dossier && { tier: 'dossier', label: 'Full Dossier', sub: 'every artifact, lossless' },
  ].filter(Boolean) as Tier[]
  const hasReports = tiers.length > 0
  const cls = `core${bloom ? ' core--bloom' : armed ? ' core--armed' : ''}`

  const onCoreClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasReports) return onClick() // no run yet -> existing behavior (toasts "no thesis yet")
    if (anchor) return setAnchor(null)
    const rc = ref.current?.getBoundingClientRect()
    if (rc) setAnchor({ cx: rc.left + rc.width / 2, top: rc.top - 12 }) // just above the orb
  }

  return (
    <div
      ref={ref}
      className={cls}
      style={{ left: x, top: y, width: size, height: size }}
      onClick={onCoreClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      title={hasReports ? 'Open this run’s documents — Memo, Thesis, Full Dossier' : hasMemo ? 'Open the Memo' : 'The Memo — run the full pipeline to build it'}
    >
      <div className="core__ring" />
      <div className="core__decision" style={{ color: 'var(--text)' }}>Memo</div>

      {anchor && hasReports && createPortal(
        <>
          <div className="reportpop__scrim" onClick={() => setAnchor(null)} />
          <div className="reportpop" style={{ left: anchor.cx, top: anchor.top }} onClick={(e) => e.stopPropagation()}>
            <div className="reportpop__label">This run produced {tiers.length} document{tiers.length === 1 ? '' : 's'} — read or download each</div>
            {tiers.map((t) => (
              <button key={t.tier} className="reportpop__item" onClick={() => { openReport(t.tier); setAnchor(null) }}>
                <b>{t.label}</b>
                <span>{t.sub}</span>
              </button>
            ))}
            <div className="reportpop__hint">each opens with read + Download (PDF · Word · HTML · Markdown)</div>
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
