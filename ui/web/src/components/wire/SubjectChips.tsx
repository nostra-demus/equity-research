// SUBJECT chips — what replaces the company/broad SCOPE chips when a wire groups by its swarm's
// canonical subjects (WireConfig.groupBy === 'subject'): one chip per subject (GOLD, SUGAR, …) plus
// "Other" for on-wire stories no tracked subject claims. Multi-select union, exactly like the scope
// chips (same .evscope classes, so the two renderings are visually identical and any restyle of one
// restyles both). Each chip also carries the subject's living state: a verdict tick colored by the
// last run's action (from the wire pulse) and a run pulse-dot while a full run is in flight.
// Zero-count chips hide unless picked — the same rule the scope chips apply.

import { useMemo } from 'react'
import { useStore } from '../../lib/store'
import { WIRE_OTHER } from '../../lib/wire'
import { useWireConfig } from './WireContext'

// verdict → the tone class suffix (token colors only; global.css maps them)
function verdictTone(action?: string): string {
  const a = (action || '').toLowerCase()
  if (!a) return ''
  if (a.startsWith('buy')) return 'good'
  if (a.startsWith('avoid') || a.startsWith('trim')) return 'bad'
  return 'mid' // Hold / Research More / anything else — a neutral "has a dossier" state
}

export function SubjectChips({ counts, total, sel, onChange }: {
  counts: Record<string, number> // per-subject story counts over the refined set (incl. WIRE_OTHER)
  total: number // the refined total behind the All chip
  sel: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const cfg = useWireConfig()
  const pulse = useStore((s) => s.wirePulse)
  const activeRuns = useStore((s) => s.activeRunsByTicker)
  const chips = useMemo(() => [...cfg.subjects, WIRE_OTHER], [cfg.subjects])
  const toggle = (id: string) => {
    const next = new Set(sel)
    next.has(id) ? next.delete(id) : next.add(id)
    onChange(next)
  }
  return (
    <div className="evscope subjectchips" role="group" aria-label="Filter by subject — tap to add or remove">
      <button type="button" className={`evscope__chip evscope__chip--all${sel.size === 0 ? ' evscope__chip--on' : ''}`} onClick={() => onChange(new Set())} aria-pressed={sel.size === 0} title="Show every subject">
        {sel.size === 0 && <span className="evscope__tick" aria-hidden>✓</span>}
        All<span className="evscope__n">{total}</span>
      </button>
      {chips.map((id) => {
        const n = counts[id] || 0
        const on = sel.has(id)
        if (!n && !on) return null // quiet subjects stay out of the way until they have news (or are picked)
        const verdict = pulse[id]?.verdict
        const tone = verdictTone(verdict?.action)
        const running = activeRuns.has(id)
        const title = [
          id === WIRE_OTHER ? 'On this wire, but not one of the tracked subjects' : id,
          verdict ? `last run: ${verdict.action}` : 'no dossier yet',
          running ? 'a full run is in flight' : '',
          on ? 'tap to remove' : 'tap to add',
        ].filter(Boolean).join(' · ')
        return (
          <button key={id} type="button" className={`evscope__chip evscope__chip--broad${on ? ' evscope__chip--on' : ''}`} onClick={() => toggle(id)} aria-pressed={on} title={title}>
            {on && <span className="evscope__tick" aria-hidden>✓</span>}
            {running && <span className="subjectchips__run" aria-hidden />}
            {id === WIRE_OTHER ? 'Other' : id}
            {tone && <span className={`subjectchips__verdict subjectchips__verdict--${tone}`} aria-hidden />}
            <span className="evscope__n">{n}</span>
          </button>
        )
      })}
    </div>
  )
}
