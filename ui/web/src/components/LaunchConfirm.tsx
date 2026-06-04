import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { resetIn, usageColor, usageLabel, usagePct } from '../lib/format'
import type { Usage } from '../lib/types'

function usageText(credit: Usage | null): string {
  if (!credit?.checked) return 'not checked'
  const pct = usagePct(credit.utilization)
  if (pct != null) {
    const reset = resetIn(credit.resetsAt)
    return `${usageLabel(credit.rateLimitType)} ${pct}%${reset ? ` · resets ${reset}` : ''}`
  }
  return credit.ok ? 'available' : 'rate limited'
}

export function LaunchConfirm() {
  const lc = useStore((s) => s.launchConfirm)
  const ticker = useStore((s) => s.selectedTicker)
  const confirmFull = useStore((s) => s.confirmFull)
  const cancel = useStore((s) => s.cancelLaunch)
  const credit = useStore((s) => s.credit)
  const [typed, setTyped] = useState('')
  if (!lc) return null
  const p = lc.preflight
  const ok = typed.trim().toUpperCase() === (ticker || '').toUpperCase()
  return (
    <div className="scrim" onClick={cancel}>
      <motion.div className="modal" initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">Run the full pipeline on {ticker}</div>
          <div className="modal__sub">Launches the engine for real — every module, then the master synthesizer.</div>
        </div>
        <div className="modal__body">
          <div className="modal__row"><span className="modal__k">Agents</span><span className="modal__v">{p.agentCount}</span></div>
          <div className="modal__row"><span className="modal__k">Est. cost</span><span className="modal__v">${p.estCostUsdRange[0]}–{p.estCostUsdRange[1]}</span></div>
          <div className="modal__row"><span className="modal__k">Est. time</span><span className="modal__v">{p.estMinutesRange[0]}–{p.estMinutesRange[1]} min</span></div>
          <div className="modal__row"><span className="modal__k">Writes to main</span><span className="modal__v warn">{p.estCommits} commits · pushed</span></div>
          <div className="modal__row"><span className="modal__k">Plan usage</span><span className="modal__v" style={{ color: credit?.checked ? usageColor(credit.status, credit.utilization) : 'var(--text-faint)' }}>{usageText(credit)}</span></div>
        </div>
        {credit?.checked && !credit.ok && (
          <div style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--bad)' }}>This window is rate-limited right now — the run will wait or fail until it resets.</div>
        )}
        <div className="modal__confirm">
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Type <b style={{ color: 'var(--text)' }}>{ticker}</b> to confirm</div>
          <input className="modal__input" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={ticker || ''} onKeyDown={(e) => { if (e.key === 'Enter' && ok) confirmFull() }} />
        </div>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={cancel}>Cancel</button>
          <button className="btn btn--amber" disabled={!ok} onClick={confirmFull}>Launch full run</button>
        </div>
      </motion.div>
    </div>
  )
}
