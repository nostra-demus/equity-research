import { decisionColor } from '../../lib/format'

interface Props {
  x: number
  y: number
  r: number
  decision: any | null
  bloom: boolean
  armed: boolean
  onClick: () => void
}

export function CoreOrb({ x, y, r, decision, bloom, armed, onClick }: Props) {
  const size = r * 2
  const call = decision?.decision as string | undefined
  const cls = `core${bloom ? ' core--bloom' : armed ? ' core--armed' : ''}`
  return (
    <div className={cls} style={{ left: x, top: y, width: size, height: size }} onClick={(e) => { e.stopPropagation(); onClick() }} title="Run the full multi-module pipeline">
      <div className="core__ring" />
      {call ? (
        <div className="core__decision" style={{ color: decisionColor(call) }}>{call}</div>
      ) : (
        <div className="core__label">Thesis</div>
      )}
    </div>
  )
}
