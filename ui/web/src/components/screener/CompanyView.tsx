// The company drill-down: click a company anywhere in the event reader and the main stage shows
// EVERYTHING the wire knows about it — every story (deduped, newest-first), the themes it shows up
// under, and where it's listed. Pure client-side over the live wire (newsItems); no server call.
// Click any story to open it; "back" returns to the article you came from.

import { useMemo } from 'react'
import { groupByDedup } from '../../lib/dedup'
import { fmtStampLocal } from '../../lib/format'
import { displayHeadline, originalHeadline, plainTheme } from '../../lib/plain'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'

const norm = (s?: string | null) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

export function CompanyView() {
  const focus = useStore((s) => s.scFocusedCompany)
  const newsItems = useStore((s) => s.newsItems)
  const closeFocus = useStore((s) => s.scFocusCompany)
  const openEvent = useStore((s) => s.scSelectEvent)

  const target = norm(focus?.name)
  const tkr = (focus?.ticker || '').toUpperCase()

  // every wire story about this company: ticker match (tightest), exact company-name match, or the
  // headline naming it (only when the name is long enough to be safe). Then collapse to one row/story.
  const groups = useMemo(() => {
    if (!focus) return []
    const hit = (it: FeedItem) => {
      if (tkr && (it.companies || []).some((c) => (c.ticker || '').toUpperCase() === tkr)) return true
      if ((it.companies || []).some((c) => norm(c.name) === target)) return true
      if (target.length >= 4 && (norm(it.headline).includes(target) || norm(it.headline_en).includes(target))) return true
      return false
    }
    return groupByDedup(newsItems.filter(hit)).sort((a, b) => (a.rep.ts < b.rep.ts ? 1 : -1))
  }, [focus, newsItems, target, tkr])

  // theme mix across the stories — what KIND of news this company is making
  const topThemes = useMemo(() => {
    const c: Record<string, number> = {}
    for (const g of groups) for (const t of g.rep.event_types || []) c[t] = (c[t] || 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [groups])

  if (!focus) return null
  const listing = [focus.listing_country, focus.exchange].filter(Boolean).join(' · ')
  const newest = groups[0]?.rep.ts
  const oldest = groups[groups.length - 1]?.rep.ts

  return (
    <div className="coview">
      <div className="coview__top">
        <button type="button" className="btn btn--ghost" onClick={() => closeFocus(null)}>← back</button>
      </div>

      <div className="coview__headrow">
        <h1 className="coview__name">{focus.name}</h1>
        {focus.ticker && <span className="coview__ticker mono">{focus.ticker}</span>}
        {listing && <span className="coview__listing">{listing}</span>}
      </div>
      <div className="coview__stat">
        {groups.length > 0 ? (
          <>
            {groups.length} stor{groups.length === 1 ? 'y' : 'ies'} on the wire
            {newest && <> · latest {fmtStampLocal(newest)}</>}
            {oldest && oldest !== newest && <> · since {fmtStampLocal(oldest)}</>}
          </>
        ) : (
          'No stories on the live wire mention this company right now.'
        )}
      </div>

      {topThemes.length > 0 && (
        <div className="coview__themes">
          {topThemes.map(([t, n]) => (
            <span key={t} className="coview__themechip">
              {plainTheme(t)}
              <span className="coview__themen">{n}</span>
            </span>
          ))}
        </div>
      )}

      <div className="coview__list">
        {groups.map((g) => {
          const it = g.rep
          const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
          const others = g.sources.slice(1)
          return (
            <button key={g.group} type="button" className="coview__row" onClick={() => openEvent(it)} title={[displayHeadline(it), originalHeadline(it) && `original: ${originalHeadline(it)}`].filter(Boolean).join('\n')}>
              <span className="coview__score mono" style={{ color: tone, borderColor: tone }}>{it.triage_score}</span>
              <span className="coview__rowmain">
                <span className="coview__rowhead">{displayHeadline(it)}</span>
                <span className="coview__rowmeta">
                  <span className="coview__when mono">{fmtStampLocal(it.ts)}</span>
                  <span className="coview__src">{it.source_name}</span>
                  {it.region && <span className="coview__region">{it.region}</span>}
                  {others.length > 0 && (
                    <span className="coview__more" title={`Also: ${others.join(', ')}`}>+{others.length} {others.length === 1 ? 'source' : 'sources'}</span>
                  )}
                  {(it.event_types || []).slice(0, 2).map((t) => (
                    <span key={t} className="coview__tag">{plainTheme(t)}</span>
                  ))}
                </span>
              </span>
              <span className="coview__go" aria-hidden>›</span>
            </button>
          )
        })}
        {!groups.length && (
          <div className="coview__empty">
            Nothing on the live wire mentions {focus.name} yet. As the scanner reads more, its news collects here — or open the source to read the original story.
          </div>
        )}
      </div>
    </div>
  )
}
