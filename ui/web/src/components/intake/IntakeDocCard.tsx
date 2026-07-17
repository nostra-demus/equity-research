import type { IntakeNewDoc } from '../../lib/types'

// One freshly-arrived document, drawn as an angular "shard" (folded top-right corner + left accent spine)
// so it can never read as a round analysis orb. Hovering it lights the orbs its evidence bears on.
const humanType = (t?: string | null) => (t || 'document').replace(/_/g, ' ')
export const fileName = (p: string) => p.split('/').pop() || p
const tierLabel = (t?: number | null) => (typeof t === 'number' ? `T${t}` : null)

function impactMark(dir: string): { glyph: string; tone: string } {
  if (dir === 'negative') return { glyph: '↓', tone: 'bad' }
  if (dir === 'positive') return { glyph: '↑', tone: 'good' }
  if (dir === 'mixed') return { glyph: '↕', tone: 'warn' }
  return { glyph: '·', tone: 'muted' }
}

export function IntakeDocCard({ doc, onEnter, onLeave }: { doc: IntakeNewDoc; onEnter: () => void; onLeave: () => void }) {
  const im = impactMark(doc.impact_direction)
  const tier = tierLabel(doc.tier)
  return (
    <div className="idoc" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="idoc__spine" aria-hidden />
      <div className="idoc__body">
        <div className="idoc__top">
          <span className="idoc__name" title={doc.path}>{fileName(doc.path)}</span>
          <span className={`idoc__mat idoc__mat--${im.tone}`}><span className="idoc__mat-glyph">{im.glyph}</span>{doc.materiality_score}</span>
        </div>
        <div className="idoc__chips">
          {doc.provider && <span className="idoc__chip idoc__chip--prov">{doc.provider}</span>}
          <span className="idoc__chip">{humanType(doc.source_type)}</span>
          {tier && <span className="idoc__chip idoc__chip--tier">{tier}</span>}
          {doc.as_of && <span className="idoc__chip idoc__chip--date">as of {doc.as_of}</span>}
        </div>
        {doc.claims_summary && <div className="idoc__summary">{doc.claims_summary}</div>}
        {doc.entry_orbs.length > 0 && (
          <div className="idoc__orbs">bears on {doc.entry_orbs.map((o) => o.agent.replace(/-/g, ' ')).join(', ')}</div>
        )}
      </div>
    </div>
  )
}
