import { createPortal } from 'react-dom'
import { useStore } from '../../lib/store'
import './CoreOrb.css'

interface Props {
  module: string
  // screen coordinates of the module's synthesis orb (anchor the popup just above it)
  cx: number
  top: number
  onClose: () => void
}

type Tier = { tier: 'synthesis' | 'memo' | 'dossier'; label: string; sub: string }

// A module's three self-sufficient tiers — the module-level mirror of the run's Memo orb popup.
// Generic: it reads whatever tiers exist in the manifest's moduleReports for this module; nothing
// about the module is hardcoded, so a new module lights up automatically (CLAUDE.md §26).
export function ModuleReportPopup({ module, cx, top, onClose }: Props) {
  const reports = useStore((s) => s.moduleReports[module])
  const openModuleReport = useStore((s) => s.openModuleReport)

  const tiers: Tier[] = [
    reports?.synthesis && { tier: 'synthesis', label: 'Module Synthesis', sub: 'the full module deep-dive & verdict' },
    reports?.memo && { tier: 'memo', label: 'Module Memo', sub: 'the short plain-English read' },
    reports?.dossier && { tier: 'dossier', label: 'Module Dossier', sub: 'every specialist output, lossless' },
  ].filter(Boolean) as Tier[]
  if (!tiers.length) return null

  const name = module.replace(/-/g, ' ')
  return createPortal(
    <>
      <div className="reportpop__scrim" onClick={onClose} />
      <div className="reportpop" style={{ left: cx, top }} onClick={(e) => e.stopPropagation()}>
        <div className="reportpop__label">{name} — {tiers.length} document{tiers.length === 1 ? '' : 's'}</div>
        {tiers.map((t) => (
          <button key={t.tier} className="reportpop__item" onClick={() => { openModuleReport(module, t.tier); onClose() }}>
            <b>{t.label}</b>
            <span>{t.sub}</span>
          </button>
        ))}
        <div className="reportpop__hint">each opens with read + Download (PDF · Word · HTML · Markdown)</div>
      </div>
    </>,
    document.body,
  )
}
