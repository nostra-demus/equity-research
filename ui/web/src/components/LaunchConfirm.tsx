import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { resetIn, usageColor, usageLabel, usagePct } from '../lib/format'
import { cascadeLabel } from '../lib/cascade'
import { moduleRunConfirmation } from '../lib/moduleRun'
import { requiresTypedSubjectConfirmation, typedSubjectConfirmationMatches } from '../lib/launchExperience'
import { Spin } from './Spin'
import { ProviderProfileSelector } from './ProviderProfileSelector'
import type { Usage } from '../lib/types'
import { providerBlockedReason, providerIsBlocked, providerLabel, providerLaunchBlockedReason, providerNeedsCheck, providerUsageUnavailableText, type RunProvider } from '../lib/provider'

function usageText(credit: Usage | null): string {
  const unavailable = providerUsageUnavailableText(credit)
  if (unavailable) return unavailable
  if (!credit) return 'Usage unavailable'
  const pct = usagePct(credit.utilization)
  if (pct != null) {
    const reset = resetIn(credit.resetsAt)
    return `${usageLabel(credit.rateLimitType)} ${pct}%${reset ? ` · resets ${reset}` : ''}`
  }
  return 'Usage unavailable'
}

export function LaunchConfirm() {
  const lc = useStore((s) => s.launchConfirm)
  const confirmModule = useStore((s) => s.confirmModule)
  const confirmFull = useStore((s) => s.confirmFull)
  const confirmRerun = useStore((s) => s.confirmRerun)
  const cancel = useStore((s) => s.cancelLaunch)
  const credit = useStore((s) => s.credit)
  const providers = useStore((s) => s.providers)
  const changeProvider = useStore((s) => s.changeLaunchProvider)
  const changeProfile = useStore((s) => s.changeLaunchProfile)
  const launchPending = useStore((s) => s.launchPending)
  const health = useStore((s) => s.health)
  const [typed, setTyped] = useState('')
  useEffect(() => {
    // A typed spend confirmation belongs to one exact provider/profile price. Re-pricing the modal must
    // require a fresh acknowledgement even when the ticker itself did not change.
    setTyped('')
  }, [lc?.selection.provider, lc?.selection.expectedProfileKey, lc?.selection.model, lc?.selection.reasoningLevel])
  if (!lc) return null
  if (lc.kind === 'module') {
    const copy = moduleRunConfirmation(lc.module, lc.unfinishedSpecialists, lc.inputModules)
    const pendingKey = `module:${lc.module}`
    const starting = launchPending?.ticker === lc.selection.subject
      && (launchPending.key === pendingKey || launchPending.key.startsWith(`${pendingKey}:`))
    const moduleProviderProblem = providerLaunchBlockedReason(providers[lc.selection.provider], providers.catalogState)
    return (
      <div className="scrim" onClick={cancel}>
        <motion.div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="module-run-confirm-title"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal__head">
            <div className="modal__title" id="module-run-confirm-title">{copy.title}</div>
            <div className="modal__sub">{copy.subtitle}</div>
          </div>
          <div className="modal__body">
            <div className="modal__row"><span className="modal__k">Run with</span><span className="modal__v">
              <span className="providerseg" role="radiogroup" aria-label="Run provider">
                {(['claude', 'codex'] as RunProvider[]).map((choice) => {
                  const status = providers[choice]
                  const problem = providerBlockedReason(status)
                  return <button key={choice} role="radio" aria-checked={lc.selection.provider === choice} className={`providerseg__btn${lc.selection.provider === choice ? ' providerseg__btn--on' : ''}`} disabled={starting || providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(choice)} status` : `Run with ${providerLabel(choice)}`)} onClick={() => void changeProvider(choice)}>{status.checking ? 'checking…' : providerLabel(choice)}</button>
                })}
              </span>
            </span></div>
            <div className="modal__row"><span className="modal__k">Model</span><span className="modal__v">
              <ProviderProfileSelector status={providers[lc.selection.provider]} profileKey={lc.selection.expectedProfileKey} disabled={starting} onChange={(key) => void changeProfile(key)} />
            </span></div>
            <div className="modal__row"><span className="modal__k">Empty orbs</span><span className="modal__v">{copy.emptyValue}</span></div>
            <div className="modal__row"><span className="modal__k">Saved inputs</span><span className="modal__v" style={{ fontFamily: 'inherit', textAlign: 'right', maxWidth: 300 }}>{copy.savedInputsValue}</span></div>
            <div className="modal__row"><span className="modal__k">Related saved checks</span><span className="modal__v" style={{ fontFamily: 'inherit', textAlign: 'right', maxWidth: 230 }}>{copy.relatedValue}</span></div>
            <div className="modal__row"><span className="modal__k">Fresh summary</span><span className="modal__v">{copy.summaryValue}</span></div>
          </div>
          <div style={{ padding: '4px 20px 16px', color: 'var(--text-faint)', fontSize: 12 }}>
            Nothing is checked or started until you press {copy.actionLabel}.
          </div>
          {moduleProviderProblem && <div style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--bad)' }}>{moduleProviderProblem}. Choose an available provider to continue.</div>}
          <div className="modal__actions">
            <button className="btn btn--ghost" disabled={starting} onClick={cancel}>Cancel</button>
            <button className="btn btn--amber" disabled={starting || !!moduleProviderProblem} title={moduleProviderProblem || undefined} onClick={confirmModule}>
              {starting ? <><Spin /> Starting…</> : copy.actionLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }
  // the confirm was clicked and the server hasn't acked yet — the modal stays up, its button spins
  const starting = launchPending?.key === 'confirm'
  const p = lc.preflight
  const subject = lc.selection.subject
  const provider = lc.selection.provider
  const providerStatus = providers[provider]
  const providerProblem = providerLaunchBlockedReason(providerStatus, providers.catalogState)
  const providerUsage = providerStatus.usage || (provider === 'claude' ? credit : null)
  const isRerun = lc.kind === 'rerun'
  const orbLabel = lc.node?.module === 'master' ? 'the Memo' : (lc.node?.name || 'orb').replace(/-/g, ' ')
  // A full run always needs typed-subject confirmation, independent of provider and of a potentially
  // stale/malformed estimate. Compare with the frozen launch subject, never mutable stage selection.
  const needsTyped = requiresTypedSubjectConfirmation(lc.kind)
  const ok = !needsTyped || typedSubjectConfirmationMatches(typed, subject)
  const confirm = isRerun ? confirmRerun : confirmFull
  const costEstimated = p.estimateEvidence?.source === 'comparable_completed_runs' && p.estCostUsdRange[1] > 0
  const timeEstimated = p.estimateEvidence?.source === 'comparable_completed_runs' && p.estMinutesRange[1] > 0
  const queueingUpdate = health === 'updating' && !isRerun

  return (
    <div className="scrim" onClick={cancel}>
      <motion.div className="modal" initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">{isRerun ? `Re-run ${orbLabel} + downstream on ${subject}` : `Run the full pipeline on ${subject}`}</div>
          <div className="modal__sub">{isRerun ? 'Re-runs the orb, then every synthesis its output flows into — to the Memo. Reuses every other output.' : queueingUpdate ? 'Saves this exact full-run request. It starts once after the update is healthy.' : 'Launches the engine for real — every module, then the master synthesizer.'}</div>
        </div>
        <div className="modal__body">
          <div className="modal__row"><span className="modal__k">Run with</span><span className="modal__v">
            <span className="providerseg" role="radiogroup" aria-label="Run provider">
              {(['claude', 'codex'] as RunProvider[]).map((choice) => {
                const status = providers[choice]
                const problem = providerBlockedReason(status)
                return <button key={choice} role="radio" aria-checked={provider === choice} className={`providerseg__btn${provider === choice ? ' providerseg__btn--on' : ''}`} disabled={starting || providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(choice)} status` : `Run with ${providerLabel(choice)}`)} onClick={() => void changeProvider(choice)}>{status.checking ? 'checking…' : providerLabel(choice)}</button>
              })}
            </span>
          </span></div>
          <div className="modal__row"><span className="modal__k">Model</span><span className="modal__v"><ProviderProfileSelector status={providerStatus} profileKey={lc.selection.expectedProfileKey} disabled={starting} onChange={(key) => void changeProfile(key)} /></span></div>
          <div className="modal__row"><span className="modal__k">{isRerun ? 'Orbs re-run' : 'Agents'}</span><span className="modal__v">{p.agentCount}</span></div>
          {provider === 'claude' ? <div className="modal__row"><span className="modal__k">Est. cost</span><span className="modal__v">{costEstimated ? `$${p.estCostUsdRange[0]}–${p.estCostUsdRange[1]}` : 'Estimate unavailable'}</span></div> : <div className="modal__row"><span className="modal__k">Allowance impact</span><span className="modal__v">{p.agentCount} orbs · exact allowance change unavailable</span></div>}
          <div className="modal__row"><span className="modal__k">Est. time</span><span className="modal__v">{timeEstimated ? `${p.estMinutesRange[0]}–${p.estMinutesRange[1]} min` : 'Estimate unavailable'}</span></div>
          {p.estimateEvidence?.source === 'comparable_completed_runs' && <div className="modal__row"><span className="modal__k">Estimate basis</span><span className="modal__v">same {providerLabel(provider)} model · {Math.max(p.estimateEvidence.durationSampleSize, p.estimateEvidence.costSampleSize)} completed runs</span></div>}
          <div className="modal__row"><span className="modal__k">Writes to main</span><span className="modal__v warn">{p.estCommits} commit{p.estCommits === 1 ? '' : 's'} · pushed</span></div>
          <div className="modal__row"><span className="modal__k">Plan usage</span><span className="modal__v" style={{ color: providerUsage?.checked ? usageColor(providerUsage.status, providerUsage.utilization) : 'var(--text-faint)' }}>{providerUsage ? usageText(providerUsage) : 'Usage unavailable'}</span></div>
        </div>
        {isRerun && lc.cascade && lc.cascade.length > 0 && (
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6 }}>Re-runs in order</div>
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
        {providerUsage?.checked && !providerUsage.ok && (
          <div style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--bad)' }}>This window is rate-limited right now — the run will wait or fail until it resets.</div>
        )}
        {providerProblem && (
          <div style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--bad)' }}>{providerProblem}. Choose an available provider to continue.</div>
        )}
        {needsTyped && (
          <div className="modal__confirm">
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Type <b style={{ color: 'var(--text)' }}>{subject}</b> to confirm</div>
            <input className="modal__input" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={subject} onKeyDown={(e) => { if (e.key === 'Enter' && ok && !starting && !providerProblem) confirm() }} />
          </div>
        )}
        <div className="modal__actions">
          <button className="btn btn--ghost" disabled={starting} onClick={cancel}>Cancel</button>
          <button className="btn btn--amber" disabled={!ok || starting || !!providerProblem} title={providerProblem || undefined} onClick={confirm}>
            {starting ? <><Spin /> {queueingUpdate ? 'Saving…' : 'Starting…'}</> : isRerun ? 'Re-run ↻' : queueingUpdate ? 'Queue full run' : 'Launch full run'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
