interface Props {
  x: number
  y: number
  r: number
  decision: any | null
  bloom: boolean
  armed: boolean
  onClick: () => void
  onHover?: (hovering: boolean) => void
}

export function CoreOrb({ x, y, r, decision, bloom, armed, onClick, onHover }: Props) {
  const size = r * 2
  const hasMemo = !!decision?.decision
  const cls = `core${bloom ? ' core--bloom' : armed ? ' core--armed' : ''}`
  return (
    <div
      className={cls}
      style={{ left: x, top: y, width: size, height: size }}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      title={hasMemo ? 'Open the Memo — the final synthesized view on the company' : 'The Memo — run the full pipeline to build it'}
    >
      <div className="core__ring" />
      <div className="core__decision" style={{ color: 'var(--text)' }}>Memo</div>
    </div>
  )
}
