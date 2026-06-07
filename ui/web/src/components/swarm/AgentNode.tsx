import { memo } from 'react'
import type { PlacedNode } from '../../lib/layout'
import type { NodeStatus } from '../../lib/types'
import { orbProgress } from '../../lib/eta'

interface Props {
  node: PlacedNode
  status: NodeStatus
  selected: boolean
  delayMs?: number
  // live timing — present only while this orb is running (its clock started when the data reached it).
  // tStart/tExpected/tNow are undefined otherwise, so a memoized non-running orb never re-renders on tick.
  tStart?: number
  tExpected?: number
  tNow?: number
  onEnter: (n: PlacedNode) => void
  onLeave: () => void
  onClick: (n: PlacedNode) => void
}

function AgentNodeImpl({ node, status, selected, delayMs = 0, tStart, tExpected, tNow, onEnter, onLeave, onClick }: Props) {
  const size = node.r * 2
  const live = status === 'running' && tStart != null && tNow != null && tExpected != null
  const p = live ? orbProgress(tStart!, tExpected!, tNow!) : null
  const overrun = !!p?.overrun
  // water level = elapsed/expected, clamped to 0.94 so it never reads "full" before the file lands;
  // the empty fraction is expressed as a downward translate (GPU transform), the meniscus rising as it works
  const fillY = p ? (1 - Math.min(p.fraction, 0.94)) * 100 : 100
  // ring sweep = same progress, clamped to 1 (a full ring at/after the estimate); pathLength=100 normalizes
  const dash = p ? 100 - Math.min(p.fraction, 1) * 100 : 100
  const cls = `node node--${status}${node.isSynthesis ? ' node--synthesis' : ''}${selected ? ' node--selected' : ''}${overrun ? ' node--overrun' : ''}`
  return (
    <div
      className={cls}
      style={{ left: node.x, top: node.y, width: size, height: size, animationDelay: `${delayMs}ms` }}
      onMouseEnter={() => onEnter(node)}
      onMouseLeave={onLeave}
      onClick={(e) => {
        e.stopPropagation()
        onClick(node)
      }}
    >
      <div className="node__hit" />
      <div className="node__ring" />
      <div className="node__core" />
      <div className="node__fill">
        <div className="node__fill-level" style={{ ['--fill-y' as any]: `${fillY}%` }} />
      </div>
      <svg className="node__sweep" viewBox="0 0 100 100" aria-hidden>
        <circle className="node__sweep-arc" cx="50" cy="50" r="46" pathLength={100} vectorEffect="non-scaling-stroke" style={{ strokeDashoffset: dash }} />
      </svg>
    </div>
  )
}

export const AgentNode = memo(AgentNodeImpl)
