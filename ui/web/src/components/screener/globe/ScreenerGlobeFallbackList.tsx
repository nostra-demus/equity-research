// The no-WebGL / list-mode read of the same GlobeSnapshot the 3D scene renders — grouped rows, one per
// country, sorted by count, EventRail-row idiom (score chip · headline · source), plus an explicit
// "Global / unknown" row for globalUnresolvedCount (CLAUDE.md §3/§8 — an honest miss stays visible, never
// silently dropped). Renders whenever webglOK is false or the user has no better option; ScreenerGlobeStage
// itself decides when to mount this vs the 3D scene — this component only needs the snapshot.

import { useState } from 'react'
import { displayHeadline } from '../../../lib/plain'
import { useStore } from '../../../lib/store'
import { resolveSampleFeedItem } from './resolveSampleFeedItem'
import type { GlobeCountryAggregate, GlobeEventRef } from '../../../lib/api'

function scoreTone(score: number): string {
  return score >= 70 ? 'var(--live)' : score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
}

function CountryRow({ c, selected, onSelect }: { c: GlobeCountryAggregate; selected: boolean; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`sglobe__row${selected ? ' sglobe__row--on' : ''}`}>
      <button type="button" className="sglobe__rowhit" onClick={onSelect} title={`${c.countryName} — ${c.count} event${c.count === 1 ? '' : 's'}`}>
        <span className="sglobe__rowscore mono" style={{ color: scoreTone(c.maxScore) }}>{c.maxScore}</span>
        <span className="sglobe__rowname">{c.countryName}</span>
        <span className="sglobe__rowregion">{c.region}</span>
        <span className="sglobe__rowcount mono">{c.count}</span>
      </button>
      {c.sample.length > 0 && (
        <button type="button" className={`evrow__dups${expanded ? ' evrow__dups--open' : ''}`} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} title="The sampled top events for this country">
          <span className="evrow__dups-label">{expanded ? 'hide' : `${c.sample.length} sample${c.sample.length === 1 ? '' : 's'}`}</span>
          <span className="evrow__dups-caret" aria-hidden>▾</span>
        </button>
      )}
      {expanded && (
        <ul className="evrow__duplist">
          {c.sample.map((it) => (
            <SampleRow key={`${it.event_id}-${it.ts}`} it={it} />
          ))}
        </ul>
      )}
    </div>
  )
}

function SampleRow({ it }: { it: GlobeEventRef }) {
  const pick = useStore((s) => s.scSelectEvent)
  const newsItems = useStore((s) => s.newsItems)
  const archiveResults = useStore((s) => s.scArchiveResults)
  return (
    <li>
      <button type="button" className="evrow__dup" onClick={() => pick(resolveSampleFeedItem(it, newsItems, archiveResults))} title={displayHeadline(it)}>
        <span className="evrow__dup-score mono">{it.triage_score}</span>
        <span className="evrow__dup-src">{it.source_name}</span>
        <span className="evrow__dup-hl">{displayHeadline(it)}</span>
      </button>
    </li>
  )
}

export function ScreenerGlobeFallbackList() {
  const snapshot = useStore((s) => s.scGlobeSnapshot)
  const loading = useStore((s) => s.scGlobeLoading)
  const selectedCountry = useStore((s) => s.scGlobeSelectedCountry)
  const selectCountry = useStore((s) => s.scSelectGlobeCountry)

  if (loading && !snapshot) {
    return <div className="sglobe__empty">Reading the wire and placing it on the map…</div>
  }
  if (!snapshot || (!snapshot.countries.length && !snapshot.globalUnresolvedCount)) {
    return <div className="sglobe__empty">No geography resolved yet in this window — widen the "When" filter or clear a narrow filter.</div>
  }
  return (
    <div className="sglobe__list">
      {snapshot.countries.map((c) => (
        <CountryRow key={c.country} c={c} selected={selectedCountry === c.country} onSelect={() => selectCountry(c.country)} />
      ))}
      {snapshot.globalUnresolvedCount > 0 && (
        <div className="sglobe__row sglobe__row--unresolved">
          <button type="button" className="sglobe__rowhit" onClick={() => selectCountry(null)} title="Events with no resolvable country — an honest miss, not a forced guess">
            <span className="sglobe__rowscore mono" style={{ color: 'var(--text-faint)' }}>—</span>
            <span className="sglobe__rowname">Global / unknown</span>
            <span className="sglobe__rowregion">unresolved</span>
            <span className="sglobe__rowcount mono">{snapshot.globalUnresolvedCount}</span>
          </button>
        </div>
      )}
    </div>
  )
}
