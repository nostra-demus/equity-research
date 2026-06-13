// The persistent left rail of the Screener stage: a live, ranked list of everything the auto-scanner
// reads. New items stream in over SSE the moment a cycle scores them (and backfill from disk on mount,
// so it survives a reload). "Kept" ranks the events worth a look by score; "All" is the raw firehose,
// newest first. Click a row to read the whole event in the main stage, then decide whether to run it.
// A drop here is a result, not a failure — most news should die at triage, cheaply.

import { useEffect, useMemo, useState } from 'react'
import { plainSize, plainTheme } from '../../lib/plain'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'

type Scope = 'kept' | 'all'

const hhmm = (iso?: string) => (iso ? iso.slice(11, 16) : '')
const agoMin = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) : null)
const sameEvent = (a: FeedItem | null, b: FeedItem) => !!a && a.event_id === b.event_id && a.ts === b.ts

function EventRow({ it, selected, onPick }: { it: FeedItem; selected: boolean; onPick: (it: FeedItem) => void }) {
  const kept = it.band !== 'drop'
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent)' : 'var(--text-faint)'
  const company = it.companies?.[0]
  const companyLabel = company ? [company.name, company.ticker].filter(Boolean).join(' · ') : null
  return (
    <button
      type="button"
      className={`evrow${selected ? ' evrow--on' : ''}${kept ? '' : ' evrow--dropped'}`}
      onClick={() => onPick(it)}
      title={it.headline}
    >
      <span className="evrow__rail" aria-hidden style={{ background: tone }} />
      <span className="evrow__top">
        <span className="evrow__score mono" style={{ color: tone, borderColor: tone }}>
          {it.triage_score}
        </span>
        <span className="evrow__time mono">{hhmm(it.ts)}</span>
        <span className="evrow__src">{it.source_name}</span>
        {it.via === 'rss' && <span className="evrow__tag evrow__tag--rss">RSS</span>}
      </span>
      <span className="evrow__headline">{it.headline}</span>
      <span className="evrow__meta">
        {it.event_types.slice(0, 2).map((t) => (
          <span key={t} className="evrow__tag evrow__tag--theme">
            {plainTheme(t)}
          </span>
        ))}
        {companyLabel && (
          <span className="evrow__company">
            {companyLabel}
            {it.size_bucket && it.size_bucket !== 'unknown' ? ` · ${plainSize(it.size_bucket)}` : ''}
          </span>
        )}
        {it.region && <span className="evrow__region">{it.region}</span>}
      </span>
    </button>
  )
}

export function EventRail() {
  const items = useStore((s) => s.newsItems)
  const status = useStore((s) => s.newsStatus)
  const selected = useStore((s) => s.scSelectedEvent)
  const ensure = useStore((s) => s.scEnsureNewsStream)
  const refreshStatus = useStore((s) => s.refreshNewsStatus)
  const pick = useStore((s) => s.scSelectEvent)
  const [scope, setScope] = useState<Scope>('kept')

  // backfill + attach the live stream the moment the rail mounts (self-healing if scInit raced)
  useEffect(() => {
    void ensure()
  }, [ensure])

  // keep the "last look Xm ago" line honest while the rail is open
  useEffect(() => {
    const id = setInterval(() => void refreshStatus(), 60_000)
    return () => clearInterval(id)
  }, [refreshStatus])

  const keptCount = useMemo(() => items.reduce((n, i) => n + (i.band !== 'drop' ? 1 : 0), 0), [items])

  const visible = useMemo(() => {
    if (scope === 'all') return items // already newest-first from the stream/backfill
    // ranked: the events worth a look, strongest score first, ties broken by recency
    return items
      .filter((i) => i.band !== 'drop')
      .slice()
      .sort((a, b) => b.triage_score - a.triage_score || (a.ts < b.ts ? 1 : -1))
  }, [items, scope])

  const ago = agoMin(status?.lastCycleAt)
  const statusLine = status
    ? status.enabled
      ? `Watching · last look ${ago != null ? `${ago}m ago` : 'soon'} · today ${status.today.read} read · ${status.today.kept} kept`
      : 'Auto-scan off — add a free Groq key to watch the wire'
    : 'connecting to the scanner…'

  return (
    <aside className="evrail">
      <header className="evrail__head">
        <div className="evrail__titlerow">
          <span className="evrail__title">Events</span>
          <span className={`evrail__dot${status?.enabled ? ' evrail__dot--live' : ''}`} aria-hidden />
        </div>
        <div className="evrail__status">{statusLine}</div>
        <div className="evrail__seg" role="radiogroup" aria-label="Which events to show">
          <button type="button" role="radio" aria-checked={scope === 'kept'} className={`evrail__segbtn${scope === 'kept' ? ' evrail__segbtn--on' : ''}`} onClick={() => setScope('kept')}>
            Ranked{keptCount ? ` · ${keptCount}` : ''}
          </button>
          <button type="button" role="radio" aria-checked={scope === 'all'} className={`evrail__segbtn${scope === 'all' ? ' evrail__segbtn--on' : ''}`} onClick={() => setScope('all')}>
            Everything{items.length ? ` · ${items.length}` : ''}
          </button>
        </div>
      </header>

      <div className="evrail__list">
        {visible.map((it) => (
          <EventRow key={`${it.event_id}-${it.ts}`} it={it} selected={sameEvent(selected, it)} onPick={pick} />
        ))}
        {!visible.length && (
          <div className="evrail__empty">
            {items.length
              ? 'Nothing ranked yet — switch to Everything to see the full wire.'
              : status?.enabled
                ? 'Nothing read yet. New events appear here the moment the scanner scores them.'
                : 'The auto-scan is off, so the wire is quiet. You can still check an event yourself from the top bar.'}
          </div>
        )}
      </div>
    </aside>
  )
}
