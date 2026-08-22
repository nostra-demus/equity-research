import { useStore } from '../lib/store'
import {
  executionProfileLabel,
  providerBlockedReason,
  providerIsBlocked,
  providerLabel,
  providerLaunchBlockedReason,
  providerNeedsCheck,
  providerUsagePercentText,
  type RunProvider,
} from '../lib/provider'

export function ProviderMiniSelector({
  agentCount,
  duration,
  className = '',
}: {
  agentCount?: number
  duration?: string
  className?: string
}) {
  const selected = useStore((s) => s.runProvider)
  const providers = useStore((s) => s.providers)
  const setSelected = useStore((s) => s.setRunProvider)
  const check = useStore((s) => s.refreshProviders)
  const current = providers[selected]
  const problem = providerLaunchBlockedReason(current, providers.catalogState)
  const utilization = Object.values(current.usage?.windows || {})
    .map((window) => window.utilization)
    .filter((value): value is number => typeof value === 'number')
  const usage = utilization.length ? providerUsagePercentText(Math.max(...utilization)) : null
  const details = [
    executionProfileLabel(current),
    selected === 'codex' ? 'selected plan' : null,
    usage ? `${usage} used` : 'Usage unavailable',
    typeof agentCount === 'number' ? `${agentCount} agent${agentCount === 1 ? '' : 's'}` : null,
    duration,
  ].filter(Boolean).join(' · ')

  return (
    <span className={`provider-mini${className ? ` ${className}` : ''}`}>
      <span className="providerseg" role="radiogroup" aria-label="Run provider for this action">
        {(['claude', 'codex'] as RunProvider[]).map((provider) => {
          const status = providers[provider]
          const blocked = providerBlockedReason(status)
          return <button
            key={provider}
            type="button"
            role="radio"
            aria-checked={selected === provider}
            className={`providerseg__btn${selected === provider ? ' providerseg__btn--on' : ''}`}
            disabled={providerIsBlocked(status)}
            title={blocked || (providerNeedsCheck(status) ? `Check ${providerLabel(provider)} status` : `Run with ${providerLabel(provider)}`)}
            onClick={(event) => {
              event.stopPropagation()
              setSelected(provider)
              if (providerNeedsCheck(status) && !status.checking) void check(provider)
            }}
          >{status.checking ? 'checking…' : providerLabel(provider)}</button>
        })}
      </span>
      <span className={`provider-mini__status${problem ? ' provider-mini__status--bad' : ''}`} title={problem || details}>
        {problem || details}
      </span>
    </span>
  )
}
