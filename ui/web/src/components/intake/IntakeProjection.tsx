import type { PlacedNode } from '../../lib/layout'

// Impact beams: faint lines from the intake dock's anchor (top-left) to each orb the new evidence bears on,
// so "this document → these orbs" is literal on the canvas. Rendered inside SwarmField, so it shares the
// orbs' stage-pixel coordinate space (no viewBox → 1:1 px). Beams reuse the flowing-dash `.edge--flow`
// idiom (already reduced-motion-gated in global.css) — clearly different from the static dependency dashes.
const ORIGIN = { x: 322, y: 104 } // ~ the dock's right edge, top-left of the stage (see IntakeDock.css)

export function IntakeProjection({ nodes, keys, bright }: { nodes: PlacedNode[]; keys: Set<string>; bright: boolean }) {
  if (!keys.size) return null
  const targets = nodes.filter((n) => keys.has(n.key))
  if (!targets.length) return null
  return (
    <svg className="intake-beams" aria-hidden>
      {targets.map((n) => (
        <line
          key={n.key}
          className={`intake-beam${bright ? ' intake-beam--bright' : ''}`}
          x1={ORIGIN.x}
          y1={ORIGIN.y}
          x2={n.x}
          y2={n.y}
        />
      ))}
    </svg>
  )
}
