import { useMemo } from 'react'
import { useStore } from '../lib/store'

// The warp — the cinematic travel between swarms. Three phases driven by the store
// (collapse 420ms → traverse 520ms → bloom 520ms; the active swarm flips at the start of
// traverse so the destination constellation mounts beneath the void and awakens during bloom):
//
//   collapse  the current stage implodes into a single bright core (CSS scale+blur on .stage,
//             handled by the .app--warp-collapse class), while this overlay fades the void in.
//   traverse  a comet (the source swarm's color) streaks across a faint perspective grid with
//             sparse parallax stars, crossfading into the destination color at midpoint. The
//             direction encodes the funnel: screener sits upstream (left), research downstream
//             (right). A handoff carries the ticker as a payload chip riding the comet.
//   bloom     one expanding ring at the destination; the new constellation's own staggered
//             awaken animation does the rest (its orbs replay because the stage remounts).
//
// prefers-reduced-motion: the store skips the warp entirely (instant switch); this overlay also
// degrades to a plain fade via the media query in global.css. Pure divs + CSS — no canvas.
export function SwarmWarp() {
  const warp = useStore((s) => s.warp)
  const swarms = useStore((s) => s.swarms)

  // sparse starfield, stable per warp (regenerated only when a warp begins)
  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: (i * 37 + ((i * i * 13) % 53)) % 100,
        top: (i * 53 + ((i * 7) % 31)) % 100,
        size: 1 + ((i * 11) % 3) * 0.5,
        depth: 0.35 + ((i * 17) % 10) / 14, // parallax factor
        delay: (i % 7) * 40,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [warp?.from, warp?.to],
  )

  if (!warp) return null
  const fromColor = swarms.find((s) => s.id === warp.from)?.color || 'var(--swarm-research)'
  const toColor = swarms.find((s) => s.id === warp.to)?.color || 'var(--swarm-screener)'
  // travel direction encodes the funnel: toward the screener = leftward (upstream), toward research = rightward
  const dir = warp.to === 'research' ? 1 : -1

  return (
    <div className={`warp warp--${warp.phase}`} style={{ ['--from' as any]: fromColor, ['--to' as any]: toColor, ['--dir' as any]: dir }}>
      {/* the void: perspective grid + parallax stars */}
      <div className="warp__void">
        <div className="warp__grid" />
        {stars.map((s, i) => (
          <span key={i} className="warp__star" style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, ['--depth' as any]: s.depth, animationDelay: `${s.delay}ms` }} />
        ))}
      </div>

      {/* the comet: stacked source/destination cores crossfade mid-flight; ghosts trail it */}
      <div className="warp__lane">
        <div className="warp__comet">
          <span className="warp__core warp__core--from" />
          <span className="warp__core warp__core--to" />
          <span className="warp__ghost warp__ghost--1" />
          <span className="warp__ghost warp__ghost--2" />
          <span className="warp__ghost warp__ghost--3" />
          {warp.payloadTicker && <span className="warp__payload">{warp.payloadTicker}</span>}
        </div>
        <div className="warp__flash" />
      </div>

      {/* destination bloom ring */}
      <div className="warp__bloom" />
    </div>
  )
}
