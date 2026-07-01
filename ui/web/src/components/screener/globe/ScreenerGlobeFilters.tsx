// The Screener Globe's filter bar: every dimension the rail's own Filters panel already knows (themes,
// GICS sector/sub-sector, size, source, band, linkage, text — via the shared <FeedFilters> chrome), plus
// two genuinely new controls the globe adds: a sinceDays recency preset (24h/7d/30d/all — the globe wants
// "what's live now", not the whole since-inception archive) and a portfolioRelevant toggle (restrict to
// companies the engine already has an analyses/<TICKER> run for). Every change re-fetches the snapshot via
// scSetGlobeFilters (debounced — see store.ts), so the filters and the map always show the same query.

import { useMemo } from 'react'
import { FeedFilters } from '../FeedFilters'
import type { FeedFilterState } from '../FeedFilters'
import { useStore } from '../../../lib/store'

const SINCE_PRESETS: { label: string; days: number; title: string }[] = [
  { label: '24h', days: 1, title: 'The last day' },
  { label: '7d', days: 7, title: 'The last week' },
  { label: '30d', days: 30, title: 'The last month' },
  { label: 'All', days: 400, title: 'The whole recent window the server keeps (up to ~400 days)' },
]

export function ScreenerGlobeFilters() {
  const filters = useStore((s) => s.scGlobeFilters)
  const setFilters = useStore((s) => s.scSetGlobeFilters)
  // Read the raw facets object (a stable reference until it's re-fetched) and derive `sources` with
  // useMemo, rather than mapping inside the selector itself — a selector that returns a freshly-built
  // array on every call never satisfies useSyncExternalStore's reference-equality check, so React re-runs
  // it every render forever ("getSnapshot should be cached" -> "Maximum update depth exceeded").
  const scFacets = useStore((s) => s.scFacets)
  const sources = useMemo(() => scFacets?.sources.map((f) => f.key) || [], [scFacets])

  const setSince = (days: number) => setFilters({ ...filters, sinceDays: days })
  const togglePortfolio = () => setFilters({ ...filters, portfolioRelevant: !filters.portfolioRelevant })

  return (
    <div className="sglobe__filters">
      <div className="sglobe__sincerow">
        <span className="evscope__dim" aria-hidden>When</span>
        <div className="sglobe__since" role="radiogroup" aria-label="How far back to look">
          {SINCE_PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              role="radio"
              aria-checked={filters.sinceDays === p.days}
              className={`sglobe__sincebtn${filters.sinceDays === p.days ? ' sglobe__sincebtn--on' : ''}`}
              onClick={() => setSince(p.days)}
              title={p.title}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`chip sglobe__portfolio${filters.portfolioRelevant ? ' sglobe__portfolio--on' : ''}`}
          onClick={togglePortfolio}
          aria-pressed={filters.portfolioRelevant}
          title="Only companies the engine already has a research run for (analyses/<TICKER>)"
        >
          {filters.portfolioRelevant && <span className="evscope__tick" aria-hidden>✓</span>}
          Portfolio only
        </button>
      </div>
      <FeedFilters value={filters} onChange={(f: FeedFilterState) => setFilters({ ...filters, ...f })} sources={sources} compact />
    </div>
  )
}
