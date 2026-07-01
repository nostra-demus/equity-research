// The click-through panel for one marker/row: country name, count, max/avg materiality score, top themes
// as chips, and a capped sample event list (EventRail row idiom) that opens EventDetail via the existing
// scSelectEvent action. Reads the matching aggregate straight out of the already-fetched scGlobeSnapshot —
// no extra round trip (requirement: click-to-filter needs no second server call).

import { displayHeadline, plainTheme } from '../../../lib/plain'
import { useStore } from '../../../lib/store'
import { resolveSampleFeedItem } from './resolveSampleFeedItem'
import type { GlobeEventRef } from '../../../lib/api'

const scoreTone = (score: number): string => (score >= 70 ? 'var(--live)' : score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)')

function SampleEventRow({ it }: { it: GlobeEventRef }) {
  const pick = useStore((s) => s.scSelectEvent)
  const newsItems = useStore((s) => s.newsItems)
  const archiveResults = useStore((s) => s.scArchiveResults)
  return (
    <button
      type="button"
      className="evrow__dup sglobe__samplerow"
      onClick={() => pick(resolveSampleFeedItem(it, newsItems, archiveResults))}
      title={displayHeadline(it)}
    >
      <span className="evrow__dup-score mono" style={{ color: scoreTone(it.triage_score) }}>{it.triage_score}</span>
      <span className="evrow__dup-src">{it.source_name}</span>
      <span className="evrow__dup-hl">{displayHeadline(it)}</span>
    </button>
  )
}

export function CountryEventPanel() {
  const snapshot = useStore((s) => s.scGlobeSnapshot)
  const selectedCountry = useStore((s) => s.scGlobeSelectedCountry)
  const selectCountry = useStore((s) => s.scSelectGlobeCountry)
  const runArchiveSearch = useStore((s) => s.scRunArchiveSearch)
  const closeGlobe = useStore((s) => s.closeGlobe)

  if (!selectedCountry) return null
  const c = snapshot?.countries.find((x) => x.country === selectedCountry)
  if (!c) return null

  // hand off to EventRail's own archive-search machinery instead of reimplementing filtering here — the
  // rail switches to archive mode and narrows to this country the same way its own Geography picker does.
  // Closing the globe lets the rail's main-stage fall through to the gauntlet/idle canvas behind the rail.
  const seeAllInRail = () => { void runArchiveSearch({ country: c.country }); closeGlobe() }

  return (
    <div className="sglobe__panel" role="dialog" aria-label={`${c.countryName} — event summary`}>
      <div className="sglobe__panelhead">
        <div>
          <div className="sglobe__panelname">{c.countryName}</div>
          <div className="sglobe__panelregion">{c.region}</div>
        </div>
        <button type="button" className="evdetail__back sglobe__panelclose" onClick={() => selectCountry(null)} aria-label="Close">✕</button>
      </div>
      <div className="sglobe__panelstats">
        <div className="sglobe__stat">
          <span className="sglobe__statval mono">{c.count}</span>
          <span className="sglobe__statlabel">event{c.count === 1 ? '' : 's'}</span>
        </div>
        <div className="sglobe__stat">
          <span className="sglobe__statval mono" style={{ color: scoreTone(c.maxScore) }}>{c.maxScore}</span>
          <span className="sglobe__statlabel">highest score</span>
        </div>
        <div className="sglobe__stat">
          <span className="sglobe__statval mono">{Math.round(c.avgScore)}</span>
          <span className="sglobe__statlabel">average score</span>
        </div>
      </div>
      {c.topThemes.length > 0 && (
        <div className="sglobe__themes">
          {c.topThemes.map((t) => (
            <span key={t} className="evrow__tag evrow__tag--theme">{plainTheme(t)}</span>
          ))}
        </div>
      )}
      <div className="sglobe__panelnewshead">Sampled events</div>
      <div className="sglobe__panelnews">
        {c.sample.map((it) => (
          <SampleEventRow key={`${it.event_id}-${it.ts}`} it={it} />
        ))}
        {!c.sample.length && <div className="sglobe__empty">No sampled events for this country in the current window.</div>}
      </div>
      <button type="button" className="btn btn--ghost sglobe__panelall" onClick={seeAllInRail}>
        See all {c.countryName} events in the rail →
      </button>
    </div>
  )
}
