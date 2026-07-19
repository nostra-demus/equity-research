import { useState } from 'react'
import { useStore } from '../../lib/store'
import type { DataNeed } from '../../lib/types'
import './DataNeedsDock.css'

// Plain-English labels for the machine enums the decision_record carries.
const ACQ_LABEL: Record<string, string> = {
  official_api: 'official API', free_key_api: 'free API', paid_api: 'paid API', scrape: 'web scrape', manual: 'manual',
}
const CADENCE_LABEL: Record<string, string> = {
  realtime: 'realtime', daily: 'daily', weekly: 'weekly', monthly: 'monthly', event_driven: 'per release',
}

// The "Data needs" dock: the external data series the run's terminal synthesizer said were capping conviction,
// surfaced so a durable connector can be built to feed them in. This is the ENTRY POINT to the Data Pipeline
// builder — each connector-eligible need has a "Build a feed →" that opens the panel focused on it, and a need
// a connector already satisfies shows "feed built ✓" (the loop closed). A per-run advisory surface, top-right
// of the constellation. Gated GENERICALLY on the presence of needs — never a swarm id — so research + commodity
// both get it the moment their synthesizer emits data_needs[]. Deploy-skew fail-closed: an old server returns
// none (or no field) → nothing renders.
export function DataNeedsDock() {
  const read = useStore((s) => s.dataNeeds)
  const openPipeline = useStore((s) => s.openDataPipeline)
  const [open, setOpen] = useState(true)
  const needs = read?.needs ?? []
  if (!needs.length) return null
  return (
    <div className="dneeds">
      <button className="dneeds__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="dneeds__chev" data-open={open} aria-hidden>▸</span>
        <span className="dneeds__title">Data needs</span>
        <span className="dneeds__count">{needs.length} to feed in</span>
      </button>
      {open && (
        <div className="dneeds__body">
          {needs.map((n, i) => <NeedCard key={n.need_id} need={n} i={i} onBuild={() => openPipeline(n.need_id)} />)}
          <button className="dneeds__add" onClick={() => openPipeline()}>＋ Add a source →</button>
        </div>
      )}
    </div>
  )
}

function NeedCard({ need, i, onBuild }: { need: DataNeed; i: number; onBuild: () => void }) {
  const src = need.suggested_source
  return (
    <div className={`dneed${need.filing_required ? ' dneed--filing' : ''}`} style={{ '--i': i } as React.CSSProperties}>
      <div className="dneed__top">
        <span className="dneed__series">{need.series}</span>
        <span className="dneed__tier" title={`§4 source tier ${need.tier} — a live feed, never a filing`}>tier {need.tier}</span>
      </div>
      <p className="dneed__why">{need.why_it_caps}</p>
      <div className="dneed__meta">
        <span className="dneed__src" title={src.licensing ? `licensing: ${src.licensing}` : undefined}>
          {src.name || 'source t.b.d.'}<span className="dneed__acq"> · {ACQ_LABEL[src.acquisition] ?? src.acquisition}</span>
        </span>
        <span className="dneed__cadence">{CADENCE_LABEL[need.cadence] ?? need.cadence}{need.next_release ? ` · ${need.next_release}` : ''}</span>
        {need.built_by ? (
          <span className="dneed__built" title={`A connector (${need.built_by}) already feeds this need.`}>feed built ✓</span>
        ) : need.filing_required ? (
          <span className="dneed__flag" title="Only a statutory filing can close this — no connector can satisfy it.">filing · advisory</span>
        ) : (
          <button className="dneed__build" title="Add a source and build a durable feed for this need" onClick={onBuild}>Build a feed →</button>
        )}
      </div>
    </div>
  )
}
