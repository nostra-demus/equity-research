import type { PlacedNode } from '../lib/layout'
import type { NodeStatus } from '../lib/types'
import { fmtClock, fmtEtaLeft, fmtSpan, orbProgress } from '../lib/eta'

interface Props {
  node: PlacedNode
  status: NodeStatus
  verdict?: string | null
  startedAt?: number
  endedAt?: number
  expectedMs?: number
  now?: number
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

// the live/finished timing line — the one spot where a precise numeral sits with the orb, on hover
function timeLine(status: NodeStatus, startedAt?: number, endedAt?: number, expectedMs?: number, now?: number): string | null {
  if (status === 'running' && startedAt && now && expectedMs) {
    const p = orbProgress(startedAt, expectedMs, now)
    return p.overrun ? `elapsed ${fmtClock(p.elapsedMs)} · over estimate` : `elapsed ${fmtClock(p.elapsedMs)} · ${fmtEtaLeft(p.remainingMs)}`
  }
  if (status === 'done' && startedAt && endedAt && endedAt > startedAt) return `took ${fmtSpan(endedAt - startedAt)}`
  if (status === 'queued') return 'queued — timer starts when data arrives'
  return null
}

export function AgentTooltip({ node, status, verdict, startedAt, endedAt, expectedMs, now, screenX, screenY }: Props) {
  const w = 300
  const left = Math.min(screenX + 18, window.innerWidth - w - 12)
  const top = Math.max(12, Math.min(screenY - 30, window.innerHeight - 220))
  const h = hint(node, status)
  const t = timeLine(status, startedAt, endedAt, expectedMs, now)
  const tdim = status === 'done' || status === 'queued'
  return (
    <div className="tipcard" style={{ left, top, width: w }}>
      <div className="tipcard__top">
        <span className="tipcard__name">{node.name}</span>
        <span className="tipcard__layer">L{node.layer}{node.failFast ? ' · gate' : ''}{node.isSynthesis ? ' · synth' : ''}</span>
      </div>
      <div className="tipcard__desc">{node.description}</div>
      {t && <div className={`tipcard__time${tdim ? ' tipcard__time--dim' : ''}`}>{t}</div>}
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
