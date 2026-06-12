import type { Layout } from '../../lib/layout'

// The routing switchyard — the screener's terminal where the gauntlet's three exits fan out:
// watchlist (no source / no world change / no edge), provisional, full machine. The thesis status
// (or live module-routed events) lights the taken rail. Clicking opens the Pipeline board.
export function Switchyard({ layout, routed, onClick }: { layout: Layout; routed: Record<string, { route: string; terminal: boolean }>; onClick: () => void }) {
  const { core, exits } = layout
  if (!exits) return null
  const thesisRoute = routed['__thesis__']?.route || null
  const taken = thesisRoute === 'provisional' ? 'provisional' : thesisRoute === 'full_machine' ? 'full_machine' : thesisRoute ? 'watchlist' : null
  const anyTerminal = Object.values(routed).some((r) => r.terminal)
  return (
    <>
      <div
        className={`switchyard${taken || anyTerminal ? ' switchyard--routed' : ''}`}
        style={{ left: core.x, top: core.y, width: core.r * 2, height: core.r * 2 }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        title="Where ideas end up — click to open the idea board"
      >
        <div className="switchyard__ring" />
        <div className="switchyard__label">Result</div>
      </div>
      {exits.map((x) => {
        const lit = taken === x.id
        return (
          <div key={x.id} className={`switchyard__exit${lit ? ' switchyard__exit--lit' : ''}`} style={{ left: x.x, top: x.y }} onClick={(e) => { e.stopPropagation(); onClick() }}>
            <span className="switchyard__exit-dot" />
            <span className="switchyard__exit-label">{x.label}</span>
          </div>
        )
      })}
    </>
  )
}
