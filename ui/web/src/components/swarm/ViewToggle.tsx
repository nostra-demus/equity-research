import { useStore } from '../../lib/store'

// Stage-anchored segmented control to switch the research stage between the 3D globe (default) and the flat
// constellation. Both are the SAME WebGL scene at morph 1 / 0 — clicking just changes the morph target and
// the scene animates one continuous wrap/unwrap (no renderer swap). The Globe option is disabled when WebGL
// is unavailable (then the flat DOM constellation is shown instead).
export function ViewToggle() {
  const view = useStore((s) => s.researchView)
  const setView = useStore((s) => s.setResearchView)
  const webglOK = useStore((s) => s.webglOK)

  return (
    <div className="viewtoggle" role="radiogroup" aria-label="Research stage view">
      <button
        type="button"
        role="radio"
        aria-checked={view === 'constellation'}
        className={`viewtoggle__btn${view === 'constellation' ? ' is-on' : ''}`}
        onClick={() => setView('constellation')}
      >
        Constellation
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === 'globe'}
        disabled={!webglOK}
        title={webglOK ? undefined : '3D view needs WebGL — unavailable in this browser'}
        className={`viewtoggle__btn${view === 'globe' ? ' is-on' : ''}`}
        onClick={() => setView('globe')}
      >
        Globe
      </button>
    </div>
  )
}
