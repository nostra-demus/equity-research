import { useEffect } from 'react'
import { SCOPE_LABELS, usePersonalScopeStore, type PersonalScope } from '../../lib/personalScope'
import { useStore } from '../../lib/store'
import './personal-scope.css'

export function PersonalScopeToggle() {
  const state = usePersonalScopeStore()
  useEffect(() => {
    void state.refresh()
    const refresh = () => { if (document.visibilityState === 'visible') void state.refresh() }
    const timer = setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [state.refresh])
  const membership = state.scope === 'watchlist' ? state.watchlist : state.portfolio
  const choose = (scope: PersonalScope) => {
    state.setScope(scope)
    useStore.setState({ scSelectedEvent: null, scFocusedCompany: null, selectedTheme: null })
  }
  return <section className="personal-scope" aria-label="Companies to follow">
    <div className="personal-scope__toggle" role="group" aria-label="Filter all news and ideas">
      {(Object.keys(SCOPE_LABELS) as PersonalScope[]).map((scope) => <button type="button" key={scope}
        aria-pressed={state.scope === scope} onClick={() => choose(scope)}>
        {SCOPE_LABELS[scope]}{scope !== 'universe' && state[scope].status === 'ready' && <span>{' '}{state[scope].members.length}</span>}
      </button>)}
    </div>
    <div className="personal-scope__note" aria-live="polite">
      {state.scope === 'universe' ? 'All companies · news, ideas, themes and calendar'
        : membership.status === 'error' ? `Could not load ${SCOPE_LABELS[state.scope].toLowerCase()}. ${membership.error}`
        : membership.status === 'idle' || (membership.status === 'loading' && !membership.members.length) ? `Loading your ${SCOPE_LABELS[state.scope].toLowerCase()}…`
        : !membership.members.length ? `No companies in your ${SCOPE_LABELS[state.scope].toLowerCase()}. Add them in Research or choose Universe.`
        : `${SCOPE_LABELS[state.scope]} companies across all views${state.scope === 'portfolio' && membership.asOf ? ` · holdings as of ${membership.asOf}` : ''}`}
      {state.scope !== 'universe' && membership.warning && <span> · {membership.warning}</span>}
      {state.scope !== 'universe' && membership.status === 'ready' && membership.unresolved > 0 && <span> · {membership.unresolved} company lookup{membership.unresolved === 1 ? '' : 's'} unavailable; using known names and tickers</span>}
      {state.scope !== 'universe' && membership.status === 'error' && <button type="button" onClick={() => void state.refresh()}>Retry</button>}
    </div>
  </section>
}
