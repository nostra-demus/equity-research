// The lazy-loaded entry for the 3D globe view — this file (and everything it will import) is the chunk
// split point, so three.js never enters the main bundle and only downloads when the user opens the globe.
//
// PR1 scaffold: a calm placeholder that proves the toggle + React.lazy/Suspense + manualChunks plumbing
// without pulling in three.js yet. PR2 replaces the body with the real <Canvas> scene (sphere, nodes,
// edges, OrbitControls). Default export because React.lazy requires one.
export default function GlobeStage() {
  return (
    <div className="globestub" role="img" aria-label="3D globe view — scene initializing">
      <div className="globestub__ring" aria-hidden />
      <div className="globestub__text">Globe view — wiring up the 3D scene</div>
    </div>
  )
}
