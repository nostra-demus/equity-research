import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from '../../../lib/store'
import { buildGlobeMarkers } from '../../../lib/screener-globe-layout'
import { useGlobeColors } from '../../swarm/globe/useGlobeColors'
import { useMeasuredCanvasSize } from '../../swarm/useMeasuredCanvasSize'
import { ScreenerGlobeScene } from './ScreenerGlobeScene'

// The lazy-loaded Canvas host for the Screener Globe — this file (and ScreenerGlobeScene) pull in
// three.js, so this is the chunk boundary: it only downloads once the user opens the globe, exactly like
// the research GlobeStage. Owns the <Canvas>, gates its mount on useMeasuredCanvasSize() (the shared
// "wait for a real container size" workaround extracted from the research globe), and wires the scene to
// the already-fetched scGlobeSnapshot via the pure buildGlobeMarkers() layout.

const prefersReduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function ScreenerGlobeStage() {
  const snapshot = useStore((s) => s.scGlobeSnapshot)
  const selectedCountry = useStore((s) => s.scGlobeSelectedCountry)
  const selectCountry = useStore((s) => s.scSelectGlobeCountry)
  const colors = useGlobeColors()
  const reducedMotion = useMemo(prefersReduced, [])
  const [hoverCountry, setHoverCountry] = useState<string | null>(null)
  const { wrapRef, size } = useMeasuredCanvasSize<HTMLDivElement>()

  const markers = useMemo(() => (snapshot ? buildGlobeMarkers(snapshot) : []), [snapshot])

  return (
    <div className="sglobe__canvaswrap" ref={wrapRef}>
      {size && (
        <Canvas flat dpr={[1, 2]} style={{ width: size.w, height: size.h }} camera={{ position: [0, 2.5, 27], fov: 45 }} gl={{ antialias: true }}>
          <color attach="background" args={[colors.bg.getHex()]} />
          <ScreenerGlobeScene
            markers={markers}
            colors={colors}
            reducedMotion={reducedMotion}
            selectedCountry={selectedCountry}
            hoverCountry={hoverCountry}
            onHover={setHoverCountry}
            onSelect={selectCountry}
          />
        </Canvas>
      )}
    </div>
  )
}
