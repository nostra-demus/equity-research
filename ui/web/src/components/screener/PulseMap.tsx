// The screener PULSE MAP — a geographic read of the live news wire. Every event the scanner reads is placed on
// an equirectangular world at its country/region; blooms cluster per geography and glow by how SERIOUS and how
// RECENT the news there is (brightness + size = quick-score × recency-decay), so a hot geography reads in one
// glance — "catching a pulse". Click a bloom to open the same event reader the rest of the screener uses.
// Deliberately SVG, not a second 3D globe: lighter (three.js stays out of the screener bundle), and the glow-
// heat IS the substance. Animates opacity only (GPU-cheap) and honours prefers-reduced-motion via CSS.

import { useMemo, useState } from 'react'
import type { FeedItem } from '../../lib/types'
import { displayHeadline } from '../../lib/plain'
import { project, resolveGeo } from '../../lib/geo-centroids'

const W = 720
const H = 360

// faint orientation labels — schematic, honest (no fake coastlines): names sit at their rough equirectangular home
const CONTINENTS: { label: string; lat: number; lng: number }[] = [
  { label: 'N. America', lat: 46, lng: -100 }, { label: 'S. America', lat: -18, lng: -60 },
  { label: 'Europe', lat: 55, lng: 12 }, { label: 'Africa', lat: 2, lng: 20 },
  { label: 'Middle East', lat: 27, lng: 46 }, { label: 'Asia', lat: 44, lng: 96 },
  { label: 'Oceania', lat: -27, lng: 140 },
]

interface Bloom {
  key: string
  x: number
  y: number
  count: number
  heat: number // 0..1 — brightest recent serious event here
  maxScore: number
  fresh: boolean // newest item < 3h old → gently pulses
  top: FeedItem // the item a click opens (highest score × recency)
}

// an event's weight decays over ~1.5 days so the map self-cleans (stale news stops shouting).
function recencyWeight(ts: string, now: number): number {
  const ageH = (now - new Date(ts).getTime()) / 3_600_000
  if (!isFinite(ageH)) return 0.3
  return Math.min(1, Math.max(0.15, Math.exp(-ageH / 36)))
}

// warm = serious, cool = routine. Brightness (opacity/size) still carries the heat; hue just separates a hot
// story from background chatter at a glance.
function hueFor(score: number): { halo: string; core: string } {
  if (score >= 75) return { halo: '#ff5a3c', core: '#fff1ea' }
  if (score >= 55) return { halo: '#ff9d3c', core: '#fff4e2' }
  if (score >= 40) return { halo: '#ffd24a', core: '#fffbe8' }
  return { halo: '#5aa9ff', core: '#eaf3ff' }
}

export function PulseMap({ items, now, onSelect }: { items: FeedItem[]; now: number; onSelect: (it: FeedItem) => void }) {
  const [hover, setHover] = useState<Bloom | null>(null)

  const blooms = useMemo<Bloom[]>(() => {
    const buckets = new Map<string, FeedItem[]>()
    for (const it of items) {
      const geo = resolveGeo(it.country, it.region)
      if (!geo) continue
      const arr = buckets.get(geo.key)
      if (arr) arr.push(it)
      else buckets.set(geo.key, [it])
    }
    const out: Bloom[] = []
    for (const [key, list] of buckets) {
      const geo = resolveGeo(key, key)! // key is already a resolved country/region
      const { x, y } = project(geo.ll, W, H)
      let heat = 0
      let maxScore = 0
      let latest = 0
      let top = list[0]
      let topW = -1
      for (const it of list) {
        const rw = recencyWeight(it.ts, now)
        const w = (it.triage_score / 100) * rw
        if (w > heat) heat = w
        if (it.triage_score > maxScore) maxScore = it.triage_score
        const t = new Date(it.ts).getTime()
        if (isFinite(t) && t > latest) latest = t
        if (w > topW) { topW = w; top = it }
      }
      out.push({ key, x, y, count: list.length, heat, maxScore, fresh: latest > 0 && now - latest < 3 * 3_600_000, top })
    }
    // biggest/hottest last so they paint on top
    return out.sort((a, b) => a.heat * a.count - b.heat * b.count)
  }, [items, now])

  const graticule: JSX.Element[] = []
  for (let lng = -120; lng <= 120; lng += 60) { const x = ((lng + 180) / 360) * W; graticule.push(<line key={`m${lng}`} x1={x} y1={0} x2={x} y2={H} />) }
  for (let lat = -60; lat <= 60; lat += 30) { const y = ((90 - lat) / 180) * H; graticule.push(<line key={`p${lat}`} x1={0} y1={y} x2={W} y2={y} />) }

  const placed = blooms.length
  const hidden = items.length - blooms.reduce((n, b) => n + b.count, 0)

  return (
    <div className="pulsemap">
      <svg className="pulsemap__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`News pulse map — ${items.length} events across ${placed} geographies`}>
        <rect x={0} y={0} width={W} height={H} rx={14} className="pulsemap__ocean" />
        <g className="pulsemap__grid" aria-hidden>{graticule}</g>
        <g className="pulsemap__continents" aria-hidden>
          {CONTINENTS.map((c) => { const { x, y } = project(c, W, H); return <text key={c.label} x={x} y={y} textAnchor="middle">{c.label}</text> })}
        </g>
        <g>
          {blooms.map((b) => {
            const r = Math.min(30, 5 + Math.sqrt(b.count) * 2.4 + b.heat * 9)
            const col = hueFor(b.maxScore)
            const isHover = hover?.key === b.key
            const label = b.count > 1 || b.maxScore >= 55
            return (
              <g
                key={b.key}
                className="pulsemap__bloom"
                transform={`translate(${b.x} ${b.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${b.key}: ${b.count} event${b.count === 1 ? '' : 's'}, top score ${b.maxScore}. Open the top story.`}
                onMouseEnter={() => setHover(b)}
                onMouseLeave={() => setHover((h) => (h?.key === b.key ? null : h))}
                onFocus={() => setHover(b)}
                onBlur={() => setHover((h) => (h?.key === b.key ? null : h))}
                onClick={() => onSelect(b.top)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(b.top) } }}
              >
                <circle
                  className={b.fresh ? 'pulsemap__halo pulsemap__halo--fresh' : 'pulsemap__halo'}
                  r={r * 2.1}
                  fill={col.halo}
                  style={{ ['--lo' as string]: (0.1 + b.heat * 0.14).toFixed(3), ['--hi' as string]: (0.22 + b.heat * 0.28).toFixed(3), opacity: 0.16 + b.heat * 0.22 }}
                />
                <circle r={r} fill={col.halo} opacity={0.28 + b.heat * 0.4} />
                <circle r={Math.max(2, r * 0.42)} fill={col.core} opacity={0.55 + b.heat * 0.45} />
                {isHover && <circle className="pulsemap__ring" r={r + 4} fill="none" stroke={col.core} strokeWidth={1.2} opacity={0.9} />}
                {label && <text className="pulsemap__tag" y={-r - 5} textAnchor="middle">{b.key}{b.count > 1 ? ` ·${b.count}` : ''}</text>}
              </g>
            )
          })}
        </g>
      </svg>

      <div className="pulsemap__foot">
        {hover ? (
          <button type="button" className="pulsemap__cap" onClick={() => onSelect(hover.top)} title="Open this story">
            <span className="pulsemap__cap-geo">{hover.key}</span>
            <span className="pulsemap__cap-head">{displayHeadline(hover.top)}</span>
            <span className="pulsemap__cap-meta">{hover.count} event{hover.count === 1 ? '' : 's'} · top score {hover.maxScore}{hover.fresh ? ' · fresh' : ''}</span>
          </button>
        ) : placed ? (
          <div className="pulsemap__legend">
            <span className="pulsemap__legend-item"><span className="pulsemap__dot pulsemap__dot--hot" /> brighter &amp; bigger = more serious &amp; recent</span>
            <span className="pulsemap__legend-item">·</span>
            <span>{placed} geograph{placed === 1 ? 'y' : 'ies'} lit</span>
            {hidden > 0 && <span className="pulsemap__legend-item pulsemap__legend-dim">· {hidden} without a location</span>}
            <span className="pulsemap__legend-item pulsemap__legend-dim">· hover a bloom, click to read</span>
          </div>
        ) : (
          <div className="pulsemap__legend pulsemap__legend-dim">No located events in this window yet — the map lights up as the scanner reads geographically-placeable news.</div>
        )}
      </div>
    </div>
  )
}
