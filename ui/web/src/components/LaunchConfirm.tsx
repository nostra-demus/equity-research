import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { resetIn, usageColor, usageLabel, usagePct } from '../lib/format'
import { cascadeLabel } from '../lib/cascade'
import { Spin } from './Spin'
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
  const confirmRerun = useStore((s) => s.confirmRerun)
  const cancel = useStore((s) => s.cancelLaunch)
  const credit = useStore((s) => s.credit)
  const launchPending = useStore((s) => s.launchPending)
  const [typed, setTyped] = useState('')
  if (!lc) return null
  // the confirm was clicked and the server hasn't acked yet — the modal stays up, its button spins
  const starting = launchPending?.key === 'confirm'
  const p = lc.preflight
  const isRerun = lc.kind === 'rerun'
  const batchN = lc.orbs && lc.orbs.length > 1 ? lc.orbs.length : 0
  const orbLabel = batchN ? `${batchN} orbs` : lc.node?.module === 'master' ? 'the Memo' : (lc.node?.name || lc.orbs?.[0]?.agent || 'orb').replace(/-/g, ' ')
  // full needs typed-ticker confirmation; a re-run does not
  const needsTyped = p.requiresTypedConfirm
  const ok = !needsTyped || typed.trim().toUpperCase() === (ticker || '').toUpperCase()
  const confirm = isRerun ? confirmRerun : confirmFull

  return (
    <div className="scrim" onClick={cancel}>
      <motion.div className="modal" initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">{isRerun ? `Re-run ${orbLabel} + downstream on ${ticker}` : `Run the full pipeline on ${ticker}`}</div>
          <div className="modal__sub">{isRerun ? (batchN ? 'Re-runs the orbs together, then only the syntheses their refreshed evidence actually changes (deterministic early cutoff) — one shared cascade, one commit.' : 'Re-runs the orb, then only the syntheses its refreshed evidence actually changes (deterministic early cutoff) — unchanged downstream work is skipped and shown as skipped.') : 'Launches the engine for real — every module, then the master synthesizer.'}</div>
        </div>
        <div className="modal__body">
          <div className="modal__row"><span className="modal__k">{isRerun ? 'Orbs (max)' : 'Agents'}</span><span className="modal__v">{p.agentCount}</span></div>
          <div className="modal__row"><span className="modal__k">Est. cost</span><span className="modal__v">${p.estCostUsdRange[0]}–{p.estCostUsdRange[1]}</span></div>
          <div className="modal__row"><span className="modal__k">Est. time</span><span className="modal__v">{p.estMinutesRange[0]}–{p.estMinutesRange[1]} min</span></div>
          <div className="modal__row"><span className="modal__k">Writes to main</span><span className="modal__v warn">{p.estCommits} commit{p.estCommits === 1 ? '' : 's'} · pushed</span></div>
          <div className="modal__row"><span className="modal__k">Plan usage</span><span className="modal__v" style={{ color: credit?.checked ? usageColor(credit.status, credit.utilization) : 'var(--text-faint)' }}>{usageText(credit)}</span></div>
        </div>
        {isRerun && lc.cascade && lc.cascade.length > 0 && (
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>Re-runs in order (pruned where upstream is proven unchanged)</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)', maxHeight: 120, overflowY: 'auto' }}>
              {lc.cascade.map((c, i) => (
                <span key={c.key}>
                  {i > 0 && <span style={{ color: 'var(--text-faint)' }}> → </span>}
                  <span style={{ color: c.kind === 'master' ? 'var(--accent-bright)' : 'var(--text)' }}>{cascadeLabel(c)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {credit?.checked && !credit.ok && (
          <div style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--bad)' }}>This window is rate-limited right now — the run will wait or fail until it resets.</div>
        )}
        {needsTyped && (
          <div className="modal__confirm">
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Type <b style={{ color: 'var(--text)' }}>{ticker}</b> to confirm</div>
            <input className="modal__input" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={ticker || ''} onKeyDown={(e) => { if (e.key === 'Enter' && ok && !starting) confirm() }} />
          </div>
        )}
        <div className="modal__actions">
          <button className="btn btn--ghost" disabled={starting} onClick={cancel}>Cancel</button>
          <button className="btn btn--amber" disabled={!ok || starting} onClick={confirm}>
            {starting ? <><Spin /> Starting…</> : isRerun ? 'Re-run ↻' : 'Launch full run'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
