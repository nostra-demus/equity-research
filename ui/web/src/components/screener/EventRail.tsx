// The persistent left rail of the Screener stage: a live, ranked list of everything the auto-scanner
// reads. New items stream in over SSE the moment a cycle scores them (and backfill from disk on mount,
// so it survives a reload). "Ranked" sorts the events worth a look by score; "Everything" is the raw
// firehose, newest first. A SCOPE filter splits the wire into what a buy-side reader can act on —
// company-specific names vs broad macro/sector/commodity/policy context — so "what should I work on?"
// is answerable at a glance. The same story reworded or carried by several outlets collapses into ONE
// row (server dedup) with a "+N · also …" expander; multi-source corroboration nudges its rank up.
// Click a row to read the whole event; set aside the ones not worth a check.

import { useEffect, useMemo, useState } from 'react'
import { groupByDedup, type StoryGroup } from '../../lib/dedup'
import { plainSize, plainTheme } from '../../lib/plain'
import { BROAD_SCOPES, COMPANY_SCOPES, familyOf, isCompanyNameClient, SCOPES, scopeLabel, scopeOf, type ScopeId } from '../../lib/scope'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'

type Scope = 'kept' | 'all'

const hhmm = (iso?: string) => (iso ? iso.slice(11, 16) : '')
const agoMin = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) : null)
const inGroup = (sel: FeedItem | null, g: StoryGroup) => !!sel && g.members.some((m) => m.event_id === sel.event_id && m.ts === sel.ts)

function ScopeChip({ it }: { it: FeedItem }) {
  const s = scopeOf(it)
  if (s === 'unknown') return null
  const fam = familyOf(s)
  return (
    <span className={`evrow__scope evrow__scope--${fam}`} title={SCOPES[s].meaning}>
      {scopeLabel(s)}
    </span>
  )
}

function EventRow({ group, selected, shelved, onPick, onShelve }: { group: StoryGroup; selected: boolean; shelved: boolean; onPick: (it: FeedItem) => void; onShelve: (id: string) => void }) {
  const it = group.rep
  const [expanded, setExpanded] = useState(false)
  const kept = it.band !== 'drop'
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  const company = (it.companies || []).find((c) => isCompanyNameClient(c.name)) // skip a country/agency guess
  const companyLabel = company ? [company.name, company.ticker].filter(Boolean).join(' · ') : null
  const otherSources = group.sources.slice(1)
  const dupLabel = otherSources.length
    ? `+${otherSources.length} · also ${otherSources.slice(0, 2).join(', ')}${otherSources.length > 2 ? '…' : ''}`
    : group.others.length
      ? `+${group.others.length} more`
      : ''
  return (
    <div className={`evrow${selected ? ' evrow--on' : ''}${kept ? '' : ' evrow--dropped'}${shelved ? ' evrow--shelved' : ''}`}>
      <button type="button" className="evrow__hit" onClick={() => onPick(it)} title={it.headline}>
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
          <ScopeChip it={it} />
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
      <button
        type="button"
        className="evrow__shelve"
        onClick={(e) => { e.stopPropagation(); onShelve(it.event_id) }}
        title={shelved ? 'Bring this back to the wire' : 'Set aside — hide it from the wire'}
        aria-label={shelved ? 'Un-shelve event' : 'Set event aside'}
      >
        {shelved ? '↩' : '⌄'}
      </button>
      {group.others.length > 0 && (
        <button type="button" className={`evrow__dups${expanded ? ' evrow__dups--open' : ''}`} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} title="The same story from other sources — click to expand">
          <span className="evrow__dups-label">{dupLabel}</span>
          <span className="evrow__dups-caret" aria-hidden>▾</span>
        </button>
      )}
      {expanded && (
        <ul className="evrow__duplist">
          {group.others.map((m) => (
            <li key={`${m.event_id}-${m.ts}`}>
              <button type="button" className="evrow__dup" onClick={() => onPick(m)} title={m.headline}>
                <span className="evrow__dup-score mono">{m.triage_score}</span>
                <span className="evrow__dup-src">{m.source_name}</span>
                <span className="evrow__dup-hl">{m.headline}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function EventRail() {
  const items = useStore((s) => s.newsItems)
  const status = useStore((s) => s.newsStatus)
  const selected = useStore((s) => s.scSelectedEvent)
  const ensure = useStore((s) => s.scEnsureNewsStream)
  const refreshStatus = useStore((s) => s.refreshNewsStatus)
  const pick = useStore((s) => s.scSelectEvent)
  const shelvedEvents = useStore((s) => s.shelvedEvents)
  const toggleShelve = useStore((s) => s.toggleShelve)
  const themesOpen = useStore((s) => s.themesView !== null)
  const openThemes = useStore((s) => s.openThemes)
  const closeThemes = useStore((s) => s.closeThemes)
  const [scope, setScope] = useState<Scope>('kept')
  // multi-select: empty = show everything; otherwise show the UNION of the picked scopes
  const [scopeFilter, setScopeFilter] = useState<Set<ScopeId>>(new Set())
  const [showShelved, setShowShelved] = useState(false)
  const toggleScope = (s: ScopeId) => {
    const next = new Set(scopeFilter)
    next.has(s) ? next.delete(s) : next.add(s)
    setScopeFilter(next)
  }

  // backfill + attach the live stream the moment the rail mounts (self-healing if scInit raced)
  useEffect(() => {
    void ensure()
  }, [ensure])

  // keep the "last look Xm ago" line honest while the rail is open
  useEffect(() => {
    const id = setInterval(() => void refreshStatus(), 60_000)
    return () => clearInterval(id)
  }, [refreshStatus])

  // number of distinct kept STORIES (after story-collapse) — what the "Ranked" segment counts
  const keptCount = useMemo(() => groupByDedup(items.filter((i) => i.band !== 'drop')).length, [items])

  // the band-filtered wire, collapsed into one entry per story, sorted by the current mode. Ranked uses
  // the corroboration-boosted score (a multi-source story rises); Everything is newest-first.
  const groups = useMemo(() => {
    const inScopeBand = scope === 'all' ? items : items.filter((i) => i.band !== 'drop')
    const gs = groupByDedup(inScopeBand)
    if (scope === 'all') gs.sort((a, b) => (a.rep.ts < b.rep.ts ? 1 : -1))
    else gs.sort((a, b) => b.effectiveScore - a.effectiveScore || (a.rep.ts < b.rep.ts ? 1 : -1))
    return gs
  }, [items, scope])

  // story groups minus the ones the user set aside (the rep carries the group's shelved state)
  const baseGroups = useMemo(() => (showShelved ? groups : groups.filter((g) => !shelvedEvents.has(g.rep.event_id))), [groups, shelvedEvents, showShelved])

  // per-scope counts over the base groups — drive the filter chips + the at-a-glance split
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const g of baseGroups) c[scopeOf(g.rep)] = (c[scopeOf(g.rep)] || 0) + 1
    return c
  }, [baseGroups])
  const companyTotal = COMPANY_SCOPES.reduce((n, s) => n + (counts[s] || 0), 0)
  const broadTotal = BROAD_SCOPES.reduce((n, s) => n + (counts[s] || 0), 0)

  const visibleGroups = useMemo(() => (scopeFilter.size ? baseGroups.filter((g) => scopeFilter.has(scopeOf(g.rep))) : baseGroups), [baseGroups, scopeFilter])

  const shelvedInBand = useMemo(() => groups.reduce((n, g) => n + (shelvedEvents.has(g.rep.event_id) ? 1 : 0), 0), [groups, shelvedEvents])

  const ago = agoMin(status?.lastCycleAt)
  const statusLine = status
    ? status.enabled
      ? `Watching · last look ${ago != null ? `${ago}m ago` : 'soon'} · today ${status.today.read} read · ${status.today.kept} kept`
      : 'Auto-scan off — add a free Groq key to watch the wire'
    : 'connecting to the scanner…'

  const scopeChip = (s: ScopeId) => {
    const n = counts[s] || 0
    const on = scopeFilter.has(s)
    if (!n && !on) return null
    const fam = familyOf(s)
    return (
      <button
        key={s}
        type="button"
        className={`evscope__chip evscope__chip--${fam}${on ? ' evscope__chip--on' : ''}`}
        onClick={() => toggleScope(s)}
        title={`${SCOPES[s].meaning}${on ? ' · tap to remove' : ' · tap to add'}`}
        aria-pressed={on}
      >
        {on && <span className="evscope__tick" aria-hidden>✓</span>}
        {SCOPES[s].label}
        <span className="evscope__n">{n}</span>
      </button>
    )
  }

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
          <button type="button" role="radio" aria-checked={scope === 'all' && !themesOpen} className={`evrail__segbtn${scope === 'all' && !themesOpen ? ' evrail__segbtn--on' : ''}`} onClick={() => { setScope('all'); if (themesOpen) closeThemes() }}>
            Everything{items.length ? ` · ${items.length}` : ''}
          </button>
          <button type="button" role="radio" aria-checked={themesOpen} className={`evrail__segbtn${themesOpen ? ' evrail__segbtn--on' : ''}`} onClick={() => void openThemes('map')}>
            Themes
          </button>
        </div>

        {/* SCOPE filter — tap to add/remove (multi-select); company-specific vs broad context */}
        <div className="evscope" role="group" aria-label="Filter by what the event is about — tap to add or remove">
          <button type="button" className={`evscope__chip evscope__chip--all${scopeFilter.size === 0 ? ' evscope__chip--on' : ''}`} onClick={() => setScopeFilter(new Set())} aria-pressed={scopeFilter.size === 0} title="Show every category">
            {scopeFilter.size === 0 && <span className="evscope__tick" aria-hidden>✓</span>}
            All<span className="evscope__n">{baseGroups.length}</span>
          </button>
          {(companyTotal > 0 || COMPANY_SCOPES.some((s) => scopeFilter.has(s))) && (
            <span className="evscope__group" title="A specific listed company is in play — a potential single-stock idea">
              {COMPANY_SCOPES.map(scopeChip)}
            </span>
          )}
          {companyTotal > 0 && broadTotal > 0 && <span className="evscope__div" aria-hidden />}
          {(broadTotal > 0 || BROAD_SCOPES.some((s) => scopeFilter.has(s))) && (
            <span className="evscope__group" title="Broad — macro, sector, commodity or policy context, not one company">
              {BROAD_SCOPES.map(scopeChip)}
            </span>
          )}
        </div>
        {scopeFilter.size === 1 && <div className="evscope__meaning">{SCOPES[[...scopeFilter][0]].meaning}</div>}
        {scopeFilter.size > 1 && <div className="evscope__meaning">Showing {scopeFilter.size} categories together — tap All to reset.</div>}
      </header>

      <div className="evrail__list">
        {visibleGroups.map((g) => (
          <EventRow key={g.group} group={g} selected={inGroup(selected, g)} shelved={shelvedEvents.has(g.rep.event_id)} onPick={pick} onShelve={toggleShelve} />
        ))}
        {!visibleGroups.length && (
          <div className="evrail__empty">
            {scopeFilter.size
              ? `Nothing in the selected ${scopeFilter.size === 1 ? `“${SCOPES[[...scopeFilter][0]].label}”` : 'categories'} right now — tap All to see the rest.`
              : items.length
                ? 'Nothing ranked yet — switch to Everything to see the full wire.'
                : status?.enabled
                  ? 'Nothing read yet. New events appear here the moment the scanner scores them.'
                  : 'The auto-scan is off, so the wire is quiet. You can still check an event yourself from the top bar.'}
          </div>
        )}
        {shelvedInBand > 0 && (
          <button type="button" className="evrail__shelfline" onClick={() => setShowShelved((v) => !v)}>
            {showShelved ? `Hide ${shelvedInBand} set aside` : `Show ${shelvedInBand} set aside`}
          </button>
        )}
      </div>
    </aside>
  )
}
