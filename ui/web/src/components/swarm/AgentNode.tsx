import { memo } from 'react'
import type { PlacedNode } from '../../lib/layout'
import type { NodeStatus } from '../../lib/types'

interface Props {
  node: PlacedNode
  status: NodeStatus
  selected: boolean
  delayMs?: number
  onEnter: (n: PlacedNode) => void
  onLeave: () => void
  onClick: (n: PlacedNode) => void
}

function AgentNodeImpl({ node, status, selected, delayMs = 0, onEnter, onLeave, onClick }: Props) {
  const size = node.r * 2
  const cls = `node node--${status}${node.isSynthesis ? ' node--synthesis' : ''}${selected ? ' node--selected' : ''}`
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
    </div>
  )
}

export const AgentNode = memo(AgentNodeImpl)
