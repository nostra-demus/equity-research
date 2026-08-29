import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import {
  executionProfileText,
  manualResumeConfirmation,
  providerBlockedReason,
  providerIsBlocked,
  providerLabel,
  providerLaunchBlockedReason,
  providerNeedsCheck,
  resumeExecutionDisposition,
  type RecordedRunExecution,
  type RunProvider,
} from '../lib/provider'
import { ProviderProfileSelector } from './ProviderProfileSelector'
import { Spin } from './Spin'

function recordedExecutionLabel(records: readonly RecordedRunExecution[]): string {
  const labels = records.map((record) => {
    if (!record.provider) return 'Unknown provider/profile'
    return `${providerLabel(record.provider)} · ${record.executionProfile ? executionProfileText(record.executionProfile) : 'profile unknown'}`
  })
  return [...new Set(labels)].join(' / ') || 'Unknown provider/profile'
}

const resumeModeLabel = {
  exact: 'Same provider + model',
  'profile-drift': 'Model change',
  'provider-change': 'Provider change',
  conflict: 'Conflicting saved records',
  unknown: 'Original profile unknown',
} as const

export function ResumeConfirm() {
  const rc = useStore((s) => s.resumeConfirm)
  const providers = useStore((s) => s.providers)
  const launchPending = useStore((s) => s.launchPending)
  const health = useStore((s) => s.health)
  const changeProvider = useStore((s) => s.changeResumeProvider)
  const changeProfile = useStore((s) => s.changeResumeProfile)
  const confirm = useStore((s) => s.confirmResume)
  const cancel = useStore((s) => s.cancelResume)
  if (!rc) return null

  const provider = rc.selection.provider
  const status = providers[provider]
  const providerProblem = providerLaunchBlockedReason(status, providers.catalogState)
  const starting = rc.kind === 'signal'
    ? launchPending?.key === `continue:${rc.sigId}`
    : launchPending?.key === `resume:${rc.info.subject}:${rc.info.module || ''}`
  const disposition = resumeExecutionDisposition(rc.records, rc.selection).disposition
  const warning = manualResumeConfirmation(rc.records, rc.selection)
  const noun = rc.unit === 'agent' ? 'check' : 'module'
  const remaining = Math.max(0, rc.totalCount - rc.doneCount)
  const progressKnown = rc.totalCount > 0
  const completedCopy = progressKnown ? `${rc.doneCount}/${rc.totalCount} ${noun}${rc.totalCount === 1 ? '' : 's'}` : 'Read from saved artifacts'
  const remainingCopy = !progressKnown
    ? 'Verified before launch'
    : remaining > 0
      ? `${remaining} remaining ${noun}${remaining === 1 ? '' : 's'}`
      : 'Final synthesis only'
  const action = rc.kind === 'signal' && rc.override ? 'Override & complete remaining' : 'Complete remaining work'
  const preflight = rc.preflight
  const costEstimated = preflight?.estimateEvidence?.source === 'comparable_completed_runs' && preflight.estCostUsdRange[1] > 0
  const timeEstimated = preflight?.estimateEvidence?.source === 'comparable_completed_runs' && preflight.estMinutesRange[1] > 0
  const queueingUpdate = health === 'updating' && rc.kind === 'run' && (rc.info.swarm || 'research') === 'research' && rc.info.kind === 'full'

  return (
    <div className="scrim" onClick={cancel}>
      <motion.div
        className="modal resumeconfirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-confirm-title"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__head">
          <div className="resumeconfirm__eyebrow">Continue saved work</div>
          <div className="modal__title" id="resume-confirm-title">Complete {rc.label}</div>
          <div className="modal__sub">{queueingUpdate ? 'Save this exact Continue request. It starts once after the update is healthy; completed work stays intact.' : 'Choose who finishes the run. Completed work stays intact; only the unfinished work runs.'}</div>
        </div>
        <div className="modal__body">
          <div className="modal__row"><span className="modal__k">Continue with</span><span className="modal__v">
            <span className="providerseg" role="radiogroup" aria-label="Completion provider">
              {(['claude', 'codex'] as RunProvider[]).map((choice) => {
                const choiceStatus = providers[choice]
                const problem = providerBlockedReason(choiceStatus)
                return (
                  <button
                    key={choice}
                    role="radio"
                    aria-checked={provider === choice}
                    className={`providerseg__btn${provider === choice ? ' providerseg__btn--on' : ''}`}
                    disabled={starting || providerIsBlocked(choiceStatus)}
                    title={problem || (providerNeedsCheck(choiceStatus) ? `Check ${providerLabel(choice)} status` : `Continue with ${providerLabel(choice)}`)}
                    onClick={() => void changeProvider(choice)}
                  >{choiceStatus.checking ? 'checking…' : providerLabel(choice)}</button>
                )
              })}
            </span>
          </span></div>
          <div className="modal__row"><span className="modal__k">Model</span><span className="modal__v">
            <ProviderProfileSelector status={status} profileKey={rc.selection.expectedProfileKey} disabled={starting} onChange={changeProfile} />
          </span></div>
          <div className="modal__row"><span className="modal__k">Already complete</span><span className="modal__v">{completedCopy}</span></div>
          <div className="modal__row"><span className="modal__k">Runs now</span><span className="modal__v">{preflight ? `${preflight.agentCount} exact orbs` : remainingCopy}</span></div>
          {provider === 'claude' ? <div className="modal__row"><span className="modal__k">Est. cost</span><span className="modal__v">{costEstimated ? `$${preflight!.estCostUsdRange[0]}–${preflight!.estCostUsdRange[1]}` : 'Estimate unavailable'}</span></div> : <div className="modal__row"><span className="modal__k">Allowance impact</span><span className="modal__v">{preflight ? `${preflight.agentCount} orbs` : remainingCopy} · exact allowance change unavailable</span></div>}
          <div className="modal__row"><span className="modal__k">Est. time</span><span className="modal__v">{timeEstimated ? `${preflight!.estMinutesRange[0]}–${preflight!.estMinutesRange[1]} min` : 'Estimate unavailable'}</span></div>
          {preflight?.estimateEvidence?.source === 'comparable_completed_runs' && <div className="modal__row"><span className="modal__k">Estimate basis</span><span className="modal__v">same {providerLabel(provider)} model · {Math.max(preflight.estimateEvidence.durationSampleSize, preflight.estimateEvidence.costSampleSize)} completed runs</span></div>}
          <div className="modal__row"><span className="modal__k">Original execution</span><span className="modal__v resumeconfirm__original">{recordedExecutionLabel(rc.records)}</span></div>
          <div className="modal__row"><span className="modal__k">Provenance</span><span className={`modal__v${disposition === 'exact' ? '' : ' warn'}`}>{resumeModeLabel[disposition]}</span></div>
        </div>
        <div className={`resumeconfirm__note${warning ? ' resumeconfirm__note--warn' : ''}`}>
          {warning || 'This matches the saved provider and model. The continuation keeps the same execution lineage.'}
        </div>
        {providerProblem && <div className="resumeconfirm__problem">{providerProblem}. Choose an available provider to continue.</div>}
        <div className="modal__actions">
          <button className="btn btn--ghost" disabled={starting} onClick={cancel}>Cancel</button>
          <button className="btn btn--amber" disabled={starting || !!providerProblem} title={providerProblem || undefined} onClick={() => void confirm()}>
            {starting ? <><Spin /> {queueingUpdate ? 'Saving…' : 'Starting…'}</> : queueingUpdate ? 'Queue Continue' : action}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
