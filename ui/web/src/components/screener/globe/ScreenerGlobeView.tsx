// The top-level Screener Globe container: filters + (3D globe or the list fallback) + the click-through
// country panel. This is the default export ui/App.tsx lazy-loads (it re-exports the 3D Canvas host,
// which is itself also lazy so three.js stays out of ScreenerGlobeView's own weight) — mirroring the
// research side's GlobeStage lazy-boundary. The WebGL gate reuses the EXISTING webglOK store flag
// (ViewToggle.tsx already gates the research globe on it) — no new detection code, per the plan.

import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from '../../../lib/store'
import { ScreenerGlobeFilters } from './ScreenerGlobeFilters'
import { ScreenerGlobeFallbackList } from './ScreenerGlobeFallbackList'
import { CountryEventPanel } from './CountryEventPanel'

const ScreenerGlobeStage = lazy(() => import('./ScreenerGlobeStage'))

function ScreenerGlobeLoading() {
  return (
    <div className="globeloading">
      <div className="empty__spin" aria-hidden />
      <div className="globeloading__label">Placing events on the map…</div>
    </div>
  )
}

export default function ScreenerGlobeView() {
  const closeGlobe = useStore((s) => s.closeGlobe)
  const snapshot = useStore((s) => s.scGlobeSnapshot)
  const loading = useStore((s) => s.scGlobeLoading)
  const webglOK = useStore((s) => s.webglOK)
  // a manual override so a WebGL-capable browser can still ask for the plain list — same idea as the
  // research ViewToggle, kept LOCAL (not persisted) since the globe/list choice here is a per-visit toggle
  const [listMode, setListMode] = useState(false)
  const showList = !webglOK || listMode

  // load once on mount (openGlobe already triggers the first fetch — this covers a hot-reload/direct-open
  // edge case where the view mounts without going through openGlobe)
  const loadSnapshot = useStore((s) => s.scLoadGlobeSnapshot)
  useEffect(() => { if (!snapshot && !loading) void loadSnapshot() }, [snapshot, loading, loadSnapshot])

  return (
    <div className="sglobe">
      <header className="sglobe__head">
        <div className="sglobe__titlerow">
          <span className="sglobe__title">Globe</span>
          <span className="sglobe__sub">
            {snapshot ? `${snapshot.total.toLocaleString()} events · ${snapshot.countries.length} countries · last ${snapshot.sinceDays}d` : 'placing events on the map…'}
          </span>
        </div>
        <div className="sglobe__headctl">
          {webglOK && (
            <div className="sglobe__viewtoggle" role="radiogroup" aria-label="Map or list">
              <button type="button" role="radio" aria-checked={!listMode} className={`themes__vbtn${!listMode ? ' is-on' : ''}`} onClick={() => setListMode(false)}>Map</button>
              <button type="button" role="radio" aria-checked={listMode} className={`themes__vbtn${listMode ? ' is-on' : ''}`} onClick={() => setListMode(true)}>List</button>
            </div>
          )}
          <button type="button" className="evdetail__back" onClick={closeGlobe}>← Back</button>
        </div>
      </header>

      <ScreenerGlobeFilters />

      <div className="sglobe__body">
        {showList ? (
          <ScreenerGlobeFallbackList />
        ) : (
          <Suspense fallback={<ScreenerGlobeLoading />}>
            <ScreenerGlobeStage />
          </Suspense>
        )}
        <CountryEventPanel />
      </div>
    </div>
  )
}
