import type { Layout } from '../../lib/layout'

export function EdgeLayer({ layout, activeModules }: { layout: Layout; activeModules: Set<string> }) {
  const { core, baselineY, edges } = layout
  return (
    <svg className="swarm__svg" aria-hidden>
      {/* faint baseline flanking the core — echoes the thesis line */}
      <line x1={core.x - 170} y1={baselineY} x2={core.x - core.r - 12} y2={baselineY} stroke="var(--hairline)" strokeWidth={1} />
      <line x1={core.x + core.r + 12} y1={baselineY} x2={core.x + 170} y2={baselineY} stroke="var(--hairline)" strokeWidth={1} />
      {edges.map((e) => {
        const srcMod = e.from.split('/')[0]
        const active = activeModules.has(srcMod)
        return (
          <path
            key={e.id}
            d={e.d}
            fill="none"
            stroke={active ? 'var(--accent-deep)' : 'var(--hairline)'}
            strokeWidth={active ? 1.4 : 1}
            strokeOpacity={active ? 0.85 : 0.5}
            className={active ? 'edge--pulse' : undefined}
          />
        )
      })}
    </svg>
  )
}
