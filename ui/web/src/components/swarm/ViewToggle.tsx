import { useStore } from '../../lib/store'

// Stage-anchored segmented control to switch the research stage between the 3D globe (default) and the flat
// 2D constellation. Mounted only inside ResearchStage, so it's research-only by construction. Modeled on
// the screener's themes__viewtoggle radiogroup (same a11y + token styling). The Globe option is disabled
// when WebGL is unavailable so a no-WebGL browser is never offered a view it can't render.
//
// Going to the constellation routes through requestConstellation() so the globe plays its slow UNWRAP
// (deflate) before handing back to the flat view — the toggle highlights the pending target immediately
// (globeExiting) so the click feels instant even though the morph takes ~1.6s.
export function ViewToggle() {
  const view = useStore((s) => s.researchView)
  const exiting = useStore((s) => s.globeExiting)
  const setView = useStore((s) => s.setResearchView)
  const requestConstellation = useStore((s) => s.requestConstellation)
  const webglOK = useStore((s) => s.webglOK)

  // while the globe is unwrapping, show Constellation as the chosen target
  const onConstellation = view === 'constellation' || exiting
  const onGlobe = view === 'globe' && !exiting

  return (
    <div className="viewtoggle" role="radiogroup" aria-label="Research stage view">
      <button
        type="button"
        role="radio"
        aria-checked={onConstellation}
        className={`viewtoggle__btn${onConstellation ? ' is-on' : ''}`}
        onClick={() => requestConstellation()}
      >
        Constellation
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={onGlobe}
        disabled={!webglOK}
        title={webglOK ? undefined : '3D view needs WebGL — unavailable in this browser'}
        className={`viewtoggle__btn${onGlobe ? ' is-on' : ''}`}
        onClick={() => setView('globe')}
      >
        Globe
      </button>
    </div>
  )
}
