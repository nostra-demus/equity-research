import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { decisionColor } from '../lib/format'

// the three shareable tiers of a finished run, opened from below the Memo orb
const TIERS = [
  { key: 'memo' as const, label: 'Memo' },
  { key: 'thesis' as const, label: 'Thesis' },
  { key: 'dossier' as const, label: 'Full dossier' },
]

export function DecisionBanner() {
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const openReport = useStore((s) => s.openReport)
  const reports = useStore((s) => s.reports)
  const setToast = useStore((s) => s.setToast)
  const dataStatus = useStore((s) => s.dataStatus)
  const activeRun = useStore((s) => s.activeRun)
  if (!decision?.decision) return null
  if (dataStatus && !dataStatus.hasAnyData) return null
  if (activeRun && activeRun.status === 'running') return null
  const er = decision.expected_return_pct as number | undefined
  return (
    <motion.div className="decision" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} onClick={openThesis} style={{ cursor: 'pointer' }} title="Open the Thesis — the deep-dive synthesized view">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Decision</span>
        <span className="decision__call" style={{ color: decisionColor(decision.decision) }}>{decision.decision}</span>
      </div>
      <div className="decision__divider" />
      <span className="decision__stat">conf <b>{decision.confidence_score ?? '—'}</b></span>
      {typeof er === 'number' && (
        <span className="decision__stat">exp ret <b style={{ color: er >= 0 ? 'var(--accent)' : 'var(--bad)' }}>{er > 0 ? '+' : ''}{er}%</b></span>
      )}
      {decision.entry_price && <span className="decision__stat">@ <b>{decision.currency || ''} {decision.entry_price}</b></span>}
      <div className="decision__divider" />
      <div className="decision__tiers">
        {TIERS.map(({ key, label }) => {
          const on = reports[key]
          return (
            <button
              key={key}
              type="button"
              className={`tierbtn${on ? '' : ' tierbtn--off'}`}
              title={on ? `Open the ${label}` : `${label} not generated for this run`}
              onClick={(e) => {
                e.stopPropagation()
                if (on) openReport(key)
                else setToast({ msg: `${label} not generated for this run`, tone: 'info' })
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
