import { useEffect, useState } from 'react'
import { Color, SRGBColorSpace } from 'three'
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

// THREE.Color parses hex / rgb() / hsl(), but NOT the CSS Color 4 `color(srgb r g b)` form the
// browser uses to serialize a registered (@property) token computed through color-mix() — which is
// exactly what a manifest-derived swarm palette (tokens.css) resolves to. Parse that form by hand
// (components are 0–1 sRGB floats); every other format still goes through THREE.
function parseCssColor(raw: string, fallback: string): Color {
  const m = raw.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (m) return new Color().setRGB(Number(m[1]), Number(m[2]), Number(m[3]), SRGBColorSpace)
  return new Color(raw || fallback)
}

function readColor(name: string, fallback: string): Color {
  try {
    // read from the token-scope carrier: the [data-swarm] app root (App.tsx), where the per-swarm
    // accent remaps land — <html> only carries data-theme, so reading it would miss every swarm
    // palette (e.g. the commodity swarm's manifest-derived accents). Fallback: the doc root.
    const el = document.querySelector('.app[data-swarm]') ?? document.documentElement
    const raw = getComputedStyle(el).getPropertyValue(name).trim()
    return parseCssColor(raw, fallback)
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
