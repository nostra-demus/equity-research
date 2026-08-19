import { useEffect } from 'react'
import { useStore } from '../../lib/store'
import { handleRovingRadioKeyDown, rovingRadioTabStopIndex } from '../../lib/rovingRadio'
import { effectiveResearchView, type ResearchView } from '../../lib/researchView'

// Stage-anchored segmented control for what the research stage is showing.
//
// Constellation and Globe are the SAME WebGL scene at morph 0 / 1 — clicking between them changes the
// morph target and the scene animates one continuous wrap/unwrap (no renderer swap). The Globe option is
// disabled when WebGL is unavailable (then the flat DOM constellation is shown instead).
//
// Watchlist is a different kind of thing: not a rendering of this company's swarm but a cross-company
// list of names you are waiting on. It is RESEARCH-ONLY — the commodity swarm shares this stage, and a
// watchlist of commodities would need a different price feed — so the pill is gated the same way
// CoreOrb and DecisionBanner gate their research-only surfaces.
//
// Keyboard: the group is one tab stop and arrows move between the pills, skipping a disabled Globe.
// It declared role="radiogroup" long before it behaved like one; adopting the shared roving-radio helper
// fixes that as a side effect of adding the third option.
export function ViewToggle() {
  const view = useStore((s) => s.researchView)
  const setView = useStore((s) => s.setResearchView)
  const webglOK = useStore((s) => s.webglOK)
  const isResearch = useStore((s) => s.constellationSwarm === 'research')
  const metCount = useStore((s) => s.watchlistMetCount)
  const loadWatchlist = useStore((s) => s.loadWatchlist)

  // The badge is the whole point of showing a count here — it has to be right while you are looking at
  // the constellation or the globe, not only once you open the list. The load is TTL-gated, so calling it
  // on mount and on a slow interval costs one request a few minutes at most.
  useEffect(() => {
    if (!isResearch) return
    void loadWatchlist()
    const id = setInterval(() => void loadWatchlist(), 5 * 60_000)
    return () => clearInterval(id)
  }, [isResearch, loadWatchlist])

  const options: { id: ResearchView; label: string; enabled: boolean; title?: string }[] = [
    { id: 'constellation', label: 'Constellation', enabled: true },
    { id: 'globe', label: 'Globe', enabled: webglOK, title: webglOK ? undefined : '3D view needs WebGL — unavailable in this browser' },
    ...(isResearch ? [{ id: 'watchlist' as const, label: 'Watchlist', enabled: true }] : []),
  ]
  // The view ACTUALLY on screen, not the raw preference: on a non-research swarm a stored 'watchlist'
  // falls back to the constellation (App.tsx renders effectiveResearchView too), but the Watchlist pill is
  // also absent from `options` there — so comparing raw `view` against each option left BOTH remaining
  // pills unchecked while the constellation was plainly what was showing.
  const effective = effectiveResearchView(view, isResearch)
  const tabStop = rovingRadioTabStopIndex(options.findIndex((o) => o.id === effective), options.map((o) => o.enabled))

  return (
    <div className="viewtoggle" role="radiogroup" aria-label="Research stage view">
      {options.map((o, i) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={effective === o.id}
          disabled={!o.enabled}
          tabIndex={i === tabStop ? 0 : -1}
          title={o.title}
          className={`viewtoggle__btn${effective === o.id ? ' is-on' : ''}`}
          onKeyDown={handleRovingRadioKeyDown}
          onClick={() => setView(o.id)}
        >
          {o.label}
          {/* How many conditions are met right now, so a fired trigger is visible from the other two
              views rather than only once you go looking. Same badge the wire's refine control uses. */}
          {o.id === 'watchlist' && metCount > 0 && (
            <span className="evrefine__badge" title={`${metCount} watchlist ${metCount === 1 ? 'condition has' : 'conditions have'} been met`}>{metCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
