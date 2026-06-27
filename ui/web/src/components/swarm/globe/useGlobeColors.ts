import { useEffect, useState } from 'react'
import { Color } from 'three'
import { useStore } from '../../../lib/store'

// Bridge the app's CSS design tokens into THREE.Color so the globe obeys the same theme/swarm palette
// (amber research, light/dark) with zero hardcoded hex. Re-reads when <html data-theme> flips (via a
// MutationObserver) or the active swarm changes (via the store). Only solid hex tokens are read — never
// the rgba glow tokens, which THREE.Color can't parse.
export interface GlobeColors {
  accent: Color
  accentBright: Color
  accentDeep: Color
  bad: Color
  live: Color
  bg: Color
  faint: Color
  hairline: Color
}

function readColor(name: string, fallback: string): Color {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return new Color(raw || fallback)
  } catch {
    return new Color(fallback)
  }
}

function readAll(): GlobeColors {
  return {
    accent: readColor('--accent', '#e0a33e'),
    accentBright: readColor('--accent-bright', '#f4c66b'),
    accentDeep: readColor('--accent-deep', '#b9842c'),
    bad: readColor('--bad', '#c9514e'),
    live: readColor('--live', '#43b581'),
    bg: readColor('--bg', '#0e0e10'),
    faint: readColor('--text-faint', '#56565f'),
    hairline: readColor('--hairline-strong', '#34343b'),
  }
}

export function useGlobeColors(): GlobeColors {
  const activeSwarm = useStore((s) => s.activeSwarm)
  const [colors, setColors] = useState<GlobeColors>(() => readAll())

  // swarm switch remaps the accent token ([data-swarm]) — re-read
  useEffect(() => { setColors(readAll()) }, [activeSwarm])

  // theme toggle flips <html data-theme> (not in the store) — observe the attribute directly
  useEffect(() => {
    const mo = new MutationObserver(() => setColors(readAll()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-swarm'] })
    return () => mo.disconnect()
  }, [])

  return colors
}
