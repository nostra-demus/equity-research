import type { Layout } from '../../lib/layout'

export function EdgeLayer({ layout, highlighted, anyHover }: { layout: Layout; highlighted: Set<string>; anyHover: boolean }) {
  const { core, baselineY, edges } = layout
  return (
    <svg className="swarm__svg" aria-hidden>
      <defs>
        <marker id="arr-dim" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M0,1 L9,5 L0,9 L2.6,5 Z" style={{ fill: 'var(--hairline-strong)' }} />
        </marker>
        <marker id="arr-lit" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto">
          <path d="M0,1 L9,5 L0,9 L2.6,5 Z" style={{ fill: 'var(--accent)' }} />
        </marker>
      </defs>

      {/* faint baseline flanking the core — echoes the thesis line */}
      <line x1={core.x - 170} y1={baselineY} x2={core.x - core.r - 12} y2={baselineY} stroke="var(--hairline)" strokeWidth={1} />
      <line x1={core.x + core.r + 12} y1={baselineY} x2={core.x + 170} y2={baselineY} stroke="var(--hairline)" strokeWidth={1} />

      {edges.map((e) => {
        const hl = highlighted.has(e.id)
        const isBackbone = e.kind !== 'feeds'
        if (!isBackbone && !hl) return null // intra-module feeds stay hidden until hovered
        const faded = anyHover && !hl
        // cross-module dependency edges read at rest (dashed, deeper, higher opacity) so the
        // real dependency structure is always visible — what's safe to run in parallel is obvious.
        const isDep = e.kind === 'dep'
        return (
          <path
            key={e.id}
            d={e.d}
            fill="none"
            stroke={hl ? 'var(--accent)' : isDep ? 'var(--accent-deep)' : 'var(--hairline)'}
            strokeWidth={hl ? 1.6 : isDep ? 1.2 : 1}
            strokeOpacity={hl ? 0.95 : faded ? 0.14 : isDep ? 0.72 : 0.5}
            strokeDasharray={isDep && !hl ? '5,4' : undefined}
            markerEnd={`url(#${hl ? 'arr-lit' : 'arr-dim'})`}
            className={hl ? 'edge--flow' : undefined}
            style={{ transition: 'stroke-opacity 160ms ease, stroke 160ms ease' }}
          />
        )
      })}
    </svg>
  )
}
