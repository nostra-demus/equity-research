// The "Calendar" tab — the forward events calendar (server /api/calendar): upcoming earnings (Nasdaq US +
// NSE India) and macro releases (BEA US), date-sorted, "what's scheduled ahead". A sibling of Themes /
// Best-ideas in the wire's tab row. Read-only: it fetches the snapshot on mount and renders it grouped by
// day. Every source's liveness is shown in a health strip (the "which scraper is down" signal the server
// surfaces) so a degraded calendar reads as degraded, never as silently empty.
import { useEffect, useMemo, useState } from 'react'
import { api, type CalendarEvent, type CalendarSnapshot } from '../../lib/api'

type RegionFilter = 'all' | 'US' | 'IN'
type KindFilter = 'all' | 'earnings' | 'macro'

const SOURCE_LABEL: Record<string, string> = { nasdaq: 'US earnings (Nasdaq)', nse: 'India earnings (NSE)', bea: 'US macro (BEA)' }

// "Today", "Tomorrow", else "Mon 14 Jul". Pure; treats the ISO date as a local wall-clock day.
function dayHeading(dateIso: string, todayIso: string): { rel: string; date: string } {
  const d = new Date(`${dateIso}T00:00:00`)
  const today = new Date(`${todayIso}T00:00:00`)
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  const rel = diff <= 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short' })
  const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return { rel, date }
}

const timeBadge = (t: string | null): string | null => (t === 'bmo' ? 'Pre-open' : t === 'amc' ? 'After close' : t && /^\d{2}:\d{2}$/.test(t) ? `${t} UTC` : null)

function EventLine({ e }: { e: CalendarEvent }) {
  const badge = timeBadge(e.time)
  return (
    <li className={`calrow calrow--${e.kind}`}>
      <span className={`calrow__kind calrow__kind--${e.kind}${e.importance ? ` calrow__kind--${e.importance}` : ''}`} aria-hidden>
        {e.kind === 'macro' ? '◆' : '▪'}
      </span>
      <span className="calrow__title" title={e.title}>{e.title}</span>
      {e.ticker && <span className="calrow__ticker mono">{e.ticker}</span>}
      <span className="calrow__spacer" />
      {e.detail && <span className="calrow__detail">{e.detail}</span>}
      <span className="calrow__region">{e.region}</span>
      {badge && <span className="calrow__time mono">{badge}</span>}
    </li>
  )
}

export function CalendarView() {
  // undefined = loading, null = unavailable (404/disabled/old server), else the snapshot
  const [snap, setSnap] = useState<CalendarSnapshot | null | undefined>(undefined)
  const [region, setRegion] = useState<RegionFilter>('all')
  const [kind, setKind] = useState<KindFilter>('all')

  useEffect(() => {
    let alive = true
    setSnap(undefined)
    api.calendar().then((s) => { if (alive) setSnap(s) }).catch(() => { if (alive) setSnap(null) })
    return () => { alive = false }
  }, [])

  const today = snap?.window?.from || new Date().toISOString().slice(0, 10)
  const groups = useMemo(() => {
    const evs = (snap?.events || []).filter((e) => (region === 'all' || e.region === region) && (kind === 'all' || e.kind === kind))
    const byDay = new Map<string, CalendarEvent[]>()
    for (const e of evs) { const g = byDay.get(e.date) || []; g.push(e); byDay.set(e.date, g) }
    return [...byDay.entries()] // events already date-sorted server-side, so insertion order is chronological
  }, [snap, region, kind])

  // region toggles only show a region that actually has events (don't offer an empty filter)
  const regionsPresent = useMemo(() => new Set((snap?.events || []).map((e) => e.region)), [snap])

  return (
    <div className="calview">
      <header className="calview__head">
        <div className="calview__titlerow">
          <span className="calview__title">Upcoming</span>
          {snap && <span className="calview__count">{snap.events.length} scheduled · next {snap.window ? Math.max(1, Math.round((new Date(snap.window.to).getTime() - new Date(snap.window.from).getTime()) / 86_400_000)) : 14}d</span>}
        </div>
        {/* filters + health */}
        <div className="calview__controls">
          <div className="calview__seg" role="radiogroup" aria-label="Type">
            {(['all', 'earnings', 'macro'] as KindFilter[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={kind === k} className={`calview__segbtn${kind === k ? ' is-on' : ''}`} onClick={() => setKind(k)}>
                {k === 'all' ? 'All' : k === 'earnings' ? 'Earnings' : 'Macro'}
              </button>
            ))}
          </div>
          {(regionsPresent.has('US') && regionsPresent.has('IN')) && (
            <div className="calview__seg" role="radiogroup" aria-label="Region">
              {(['all', 'US', 'IN'] as RegionFilter[]).map((r) => (
                <button key={r} type="button" role="radio" aria-checked={region === r} className={`calview__segbtn${region === r ? ' is-on' : ''}`} onClick={() => setRegion(r)}>
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          )}
        </div>
        {snap && (
          <div className={`calview__health${snap.stale ? ' calview__health--stale' : ''}`}>
            {snap.health.map((h) => (
              <span key={h.source} className={`calhealth${h.ok ? ' calhealth--ok' : ' calhealth--down'}`} title={h.ok ? `${h.count} events` : (h.note || 'unavailable — showing last-good')}>
                <span className="calhealth__dot" aria-hidden />
                {SOURCE_LABEL[h.source] || h.source} <span className="calhealth__n">{h.count}</span>
              </span>
            ))}
            {snap.stale && <span className="calview__stalenote">a source is down — showing what still works</span>}
          </div>
        )}
      </header>

      <div className="calview__body">
        {snap === undefined && (
          <div className="calview__skeleton" aria-busy="true" aria-label="Loading the calendar">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="calskel" style={{ ['--i' as string]: String(i) }} />)}
          </div>
        )}
        {snap === null && (
          <div className="calview__empty">
            <div className="calview__emptytitle">Calendar unavailable</div>
            <div className="calview__emptysub">The events calendar is off on this engine, or the server hasn’t got it yet.</div>
          </div>
        )}
        {snap && groups.length === 0 && (
          <div className="calview__empty">
            <div className="calview__emptytitle">Nothing scheduled in this window</div>
            <div className="calview__emptysub">No {kind === 'all' ? '' : `${kind} `}events{region === 'all' ? '' : ` for ${region}`} in the next {snap.window ? Math.round((new Date(snap.window.to).getTime() - new Date(snap.window.from).getTime()) / 86_400_000) : 14} days.</div>
          </div>
        )}
        {snap && groups.map(([date, evs]) => {
          const { rel, date: dLabel } = dayHeading(date, today)
          return (
            <section key={date} className="calday">
              <div className="calday__head">
                <span className="calday__rel">{rel}</span>
                <span className="calday__date">{dLabel}</span>
                <span className="calday__n">{evs.length}</span>
              </div>
              <ul className="calday__list">
                {evs.map((e) => <EventLine key={e.id} e={e} />)}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
