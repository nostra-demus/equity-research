import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import type { AgentNode } from '../../lib/types'
import { Spin } from '../Spin'
import { IntakeDocCard } from './IntakeDocCard'
import { RerunPlanList } from './RerunPlanList'
import './IntakeDock.css'

// Map {module, agent} pairs → constellation orb keys (matching name OR slug), so hovering a doc/plan row
// lights exactly the orbs its evidence bears on.
function orbKeys(pairs: { module: string; agent: string }[], nodesByKey: Map<string, AgentNode>): Set<string> {
  const want = new Set(pairs.map((p) => `${p.module}::${p.agent}`))
  const keys = new Set<string>()
  for (const n of nodesByKey.values()) if (want.has(`${n.module}::${n.name}`) || want.has(`${n.module}::${n.slug}`)) keys.add(n.key)
  return keys
}

// The distinct document-intake surface: freshly-arrived documents as angular shards (never orbs), plus the
// scoped rerun plan. A live-tick surface (it refreshes on the data-changed SSE), so it obeys the instant-
// close rule — no exit animation. Generic gate (research + a plan with new docs), never a swarm id.
export function IntakeDock() {
  const activeSwarm = useStore((s) => s.activeSwarm)
  const intake = useStore((s) => s.intake)
  const analyzing = useStore((s) => s.intakeAnalyzing)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const setFocus = useStore((s) => s.setIntakeFocus)
  const analyze = useStore((s) => s.analyzeIntake)
  const openPlan = useStore((s) => s.openThesisPlan)
  const [open, setOpen] = useState(true)

  const docCards = intake?.new_docs ?? []
  const keysFor = useMemo(() => (module: string, agent: string) => orbKeys([{ module, agent }], nodesByKey), [nodesByKey])
  const clear = () => setFocus(new Set())

  // Gate: research swarm + a plan that actually has new documents (or an analysis in flight). Absent/old
  // server → intake is null → nothing renders (fail-closed, the honest floor stands).
  if (activeSwarm !== 'research') return null
  if (!docCards.length && !analyzing) return null

  const cmds = intake?.rerun_plan.commands ?? []
  return (
    <div className="intake" onMouseLeave={clear}>
      <button className="intake__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="intake__chev" data-open={open} aria-hidden>▸</span>
        <span className="intake__title">New data</span>
        {docCards.length > 0 && <span className="intake__count">{docCards.length} doc{docCards.length === 1 ? '' : 's'}{cmds.length ? ` · ${cmds.length} to re-run` : ''}</span>}
        <span
          className="intake__reanalyze"
          role="button"
          tabIndex={0}
          title="Re-read the new documents and rebuild the scoped plan (launches no rerun)"
          onClick={(e) => { e.stopPropagation(); void analyze() }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); void analyze() } }}
        >
          {analyzing ? <Spin /> : '↻'}
        </span>
      </button>

      {open && (
        <div className="intake__body">
          {analyzing && !docCards.length && (
            <div className="intake__reading">Reading the new documents…</div>
          )}
          {docCards.length > 0 && (
            <div className="intake__docs">
              {docCards.map((d, i) => (
                <div key={d.path} style={{ '--i': i } as React.CSSProperties} className="intake__docwrap">
                  <IntakeDocCard doc={d} onEnter={() => setFocus(orbKeys(d.entry_orbs, nodesByKey))} onLeave={clear} />
                </div>
              ))}
            </div>
          )}
          {intake && docCards.length > 0 && (
            <RerunPlanList
              plan={intake}
              keysFor={keysFor}
              onRowEnter={setFocus}
              onLeave={clear}
              onRun={() => void openPlan()}
              running={false}
            />
          )}
        </div>
      )}
    </div>
  )
}
