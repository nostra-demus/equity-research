import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { decisionColor } from '../lib/format'

export function DecisionBanner() {
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const dataStatus = useStore((s) => s.dataStatus)
  const activeRun = useStore((s) => s.activeRun)
  if (!decision?.decision) return null
  if (dataStatus && !dataStatus.hasAnyData) return null
  if (activeRun && activeRun.status === 'running') return null
  const er = decision.expected_return_pct as number | undefined
  return (
    <motion.div className="decision" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} onClick={openThesis} style={{ cursor: 'pointer' }} title="Open the Memo — the final synthesized view">
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
      <span className="decision__stat" style={{ color: 'var(--accent)' }}>read memo →</span>
    </motion.div>
  )
}
