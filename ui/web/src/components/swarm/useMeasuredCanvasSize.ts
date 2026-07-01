import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Shared "wait for a real container size before mounting <Canvas>" hook — extracted from GlobeStage.tsx
// (the research globe), so any R3F host (the research globe, the screener globe, ...) can gate its Canvas
// mount on the same workaround instead of re-deriving it.
//
// R3F measures its container once on mount; mounting inside Suspense races the layout flush and can leave
// the canvas stuck at its 300×150 fallback (a real resize is needed to clear it). So gate the <Canvas> on
// our OWN ResizeObserver: mount it only once the container has a real size, and feed that size as explicit
// pixels — the canvas then mounts into a settled, sized box and stays responsive as the stage resizes.
//
// R3F's own measure can come up stale from the lazy/Suspense mount (StrictMode double-mounts it in dev),
// leaving the drawing buffer at its 300×150 fallback until a real window 'resize'. Poll a resize every
// ~150ms until R3F snaps the canvas to the real size (buffer width > the 300 fallback), then stop — this
// rides out the StrictMode settle without a Canvas remount/flash. Self-terminating + idempotent.
export function useMeasuredCanvasSize<T extends HTMLElement = HTMLDivElement>() {
  const wrapRef = useRef<T>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setSize((p) => (p && p.w === r.width && p.h === r.height ? p : { w: r.width, h: r.height }))
    }
    measure() // synchronous, post-commit pre-paint — gets the real size immediately (no mount race)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!size) return
    let tries = 0
    const id = setInterval(() => {
      window.dispatchEvent(new Event('resize'))
      const c = wrapRef.current?.querySelector('canvas')
      if ((c && c.width > 320) || ++tries > 14) clearInterval(id)
    }, 150)
    return () => clearInterval(id)
  }, [size])

  return { wrapRef, size }
}
