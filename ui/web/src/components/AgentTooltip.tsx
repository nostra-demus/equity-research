import type { PlacedNode } from '../lib/layout'
import type { NodeStatus } from '../lib/types'

interface Props {
  node: PlacedNode
  status: NodeStatus
  verdict?: string | null
  screenX: number
  screenY: number
}

function hint(node: PlacedNode, status: NodeStatus): { text: string; go: boolean } {
  switch (status) {
    case 'ready':
      return { text: 'Click to launch · runs instantly', go: true }
    case 'notready':
      return { text: `Needs upstream: ${node.requiredUpstream.map((p) => p.split('/').pop()?.replace(/^\d+_|\.md$/g, '')).join(', ')}`, go: false }
    case 'locked':
      return { text: 'No data for this module yet', go: false }
    case 'done':
      return { text: 'Click to view output', go: true }
    case 'running':
      return { text: 'Running…', go: false }
    case 'queued':
      return { text: 'Queued', go: false }
    case 'failed':
      return { text: 'Failed — click to retry', go: true }
    default:
      return { text: '', go: false }
  }
}

export function AgentTooltip({ node, status, verdict, screenX, screenY }: Props) {
  const w = 300
  const left = Math.min(screenX + 18, window.innerWidth - w - 12)
  const top = Math.max(12, Math.min(screenY - 30, window.innerHeight - 220))
  const h = hint(node, status)
  return (
    <div className="tipcard" style={{ left, top, width: w }}>
      <div className="tipcard__top">
        <span className="tipcard__name">{node.name}</span>
        <span className="tipcard__layer">L{node.layer}{node.failFast ? ' · gate' : ''}{node.isSynthesis ? ' · synth' : ''}</span>
      </div>
      <div className="tipcard__desc">{node.description}</div>
      {status === 'done' && verdict && <div className="tipcard__verdict">{verdict}</div>}
      <div className="tipcard__tools">
        {node.tools.slice(0, 6).map((t) => (
          <span className="chip" key={t}>{t}</span>
        ))}
      </div>
      {h.text && <div className={`tipcard__hint${h.go ? ' tipcard__hint--go' : ''}`}>{h.go ? '→' : '•'} {h.text}</div>}
    </div>
  )
}
