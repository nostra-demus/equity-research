// The News wire — a live view of EVERYTHING the auto-scanner reads: each item as it's scored,
// its theme tags, the company it's guessed to be about, and whether it was kept for the Inbox or
// dropped (and why). Backfills from disk (restart-proof) and streams new items over SSE the moment
// a cycle scores them. A drop here is a result, not a failure — most news should die at this stage.

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { groupByDedup, type StoryGroup } from '../../lib/dedup'
import { plainBand, plainSize, plainTheme } from '../../lib/plain'
import { dayDividerLabel, dayKeyLocal, hhmmLocal } from '../../lib/format'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'
import { emptyFilters, FeedFilters, matchesFilters, type FeedFilterState } from './FeedFilters'

const agoMin = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) : null)

// Time-travel windows over the on-disk news archive. 2 = the live view (SSE keeps appending); the rest
// pull a historical snapshot (newest items in range) from the daily firehose files. 370 ≈ "all".
const FEED_WINDOWS: { d: number; label: string }[] = [
  { d: 2, label: 'Live · 2d' },
  { d: 14, label: '14 days' },
  { d: 30, label: '1 month' },
  { d: 90, label: '3 months' },
  { d: 180, label: '6 months' },
  { d: 370, label: 'All' },
]

// compact 405000 → "405k", 14 → "14"
const kfmt = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : `${Math.round(n)}`)

// A historical look-back window can hold up to ~6,000 items; painting all of them on every filter
// toggle is what made the wire feel slow. We render in PAGE-sized chunks and reveal the next chunk as a
// bottom sentinel scrolls into view, so a filter click only ever paints ~PAGE rows — independent of how
// deep the archive in range is — while every row stays reachable by scrolling.
const PAGE = 60

// A small daily-budget pool readout: a label, a fill bar, used/cap. The fill animates with a GPU transform
// (scaleX) so the poll-driven update never triggers layout. `color` is a CSS var name (per provider), so a
// newly-wired provider gets its own colour with no code change. `active` tints the border (overflow firing).
function BudgetChip({ label, used, cap, unit, color, active, title }: { label: string; used: number; cap: number; unit: string; color: string; active?: boolean; title: string }) {
  const frac = cap > 0 ? Math.min(1, Math.max(0, used / cap)) : 0
  const c = `var(${color})`
  return (
    <span className="poolchip" style={active ? { borderColor: `color-mix(in srgb, ${c} 40%, var(--hairline))` } : undefined} title={title}>
      <span className="poolchip__label" style={{ color: c }}>{label}</span>
      <span className="poolchip__bar" aria-hidden><span className="poolchip__fill" style={{ transform: `scaleX(${frac})`, background: c }} /></span>
      <span className="poolchip__val mono">{kfmt(used)}<span className="poolchip__sep">/</span>{kfmt(cap)}<span className="poolchip__unit"> {unit}</span></span>
    </span>
  )
}

function ScorePill({ score }: { score: number }) {
  const tone = score >= 70 ? 'var(--live)' : score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  return (
    <span className="pcard__chip pcard__chip--num wire__score" style={{ color: tone, borderColor: tone }} title={`Quick score ${score} out of 100 — a first read by the free scanner, not the full check`}>
      {score}
    </span>
  )
}

function CompanyChip({ it }: { it: FeedItem }) {
  const c = it.companies?.[0]
  if (!c) return null
  const label = [c.name, c.ticker, it.size_bucket && it.size_bucket !== 'unknown' ? plainSize(it.size_bucket) : null].filter(Boolean).join(' · ')
  return (
    <span className="pcard__chip wire__company" title="Guessed by the quick scanner from the headline alone — check before relying on it">
      best guess: {label}
      {it.companies.length > 1 ? ` +${it.companies.length - 1}` : ''}
    </span>
  )
}

function WireRow({ group }: { group: StoryGroup }) {
  const it = group.rep
  const kept = it.band !== 'drop'
  const otherSources = group.sources.slice(1)
  return (
    <div className={`wire__row${kept ? '' : ' wire__row--dropped'}`}>
      <span className="wire__time mono">{hhmmLocal(it.ts)}</span>
      <ScorePill score={it.triage_score} />
      <span className={`pcard__chip wire__band${kept ? ' wire__band--kept' : ''}`} title={it.triage_reason || undefined}>
        {plainBand(it.band)}
      </span>
      <div className="wire__main">
        <a className="wire__headline" href={it.url} target="_blank" rel="noreferrer" title={it.url}>
          {it.headline}
        </a>
        <div className="wire__meta">
          <span>{it.source_name}</span>
          {it.via === 'rss' && <span className="pcard__chip wire__via">RSS</span>}
          {it.region && <span>{it.region}</span>}
          {otherSources.length > 0 && (
            <span className="pcard__chip wire__dups" title={`Same story also reported by: ${otherSources.join(', ')}`}>
              +{otherSources.length} {otherSources.length === 1 ? 'source' : 'sources'}
            </span>
          )}
          {it.event_types.map((t) => (
            <span key={t} className="pcard__chip wire__theme">
              {plainTheme(t)}
            </span>
          ))}
          <CompanyChip it={it} />
        </div>
        {it.triage_reason && <div className="wire__why">{it.triage_reason}</div>}
      </div>
    </div>
  )
}

export function LiveFeed() {
  const close = useStore((s) => s.closeNewsFeed)
  const items = useStore((s) => s.newsItems)
  const status = useStore((s) => s.newsStatus)
  const refreshStatus = useStore((s) => s.refreshNewsStatus)
  const openFeed = useStore((s) => s.openNewsFeed)
  const feedWindowDays = useStore((s) => s.feedWindowDays)
  const setFeedWindow = useStore((s) => s.setFeedWindow)
  const feedWindowLoading = useStore((s) => s.feedWindowLoading)
  const [filters, setFilters] = useState<FeedFilterState>(emptyFilters())

  // keep the "last look Xm ago" line honest while the panel is open
  useEffect(() => {
    const id = setInterval(() => void refreshStatus(), 60_000)
    return () => clearInterval(id)
  }, [refreshStatus])

  const sources = useMemo(() => [...new Set(items.map((i) => i.source_name).filter(Boolean))].sort(), [items])
  // filter first, then collapse near-duplicate stories so the wire shows one row per story (newest-first)
  const visibleGroups = useMemo(() => groupByDedup(items.filter((i) => matchesFilters(i, filters))), [items, filters])

  // Incremental render: show the first `shownCount` stories, grow as a bottom sentinel scrolls into
  // view, and snap back to the top + first page whenever the filtered set changes (a filter toggle or a
  // new look-back window). This is what keeps a filter click snappy on a multi-thousand-item archive.
  const listRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [shownCount, setShownCount] = useState(PAGE)
  useEffect(() => {
    setShownCount(PAGE)
    listRef.current?.scrollTo?.({ top: 0 })
  }, [filters, feedWindowDays])
  const shown = useMemo(() => visibleGroups.slice(0, shownCount), [visibleGroups, shownCount])
  const hasMore = shownCount < visibleGroups.length
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) setShownCount((c) => Math.min(c + PAGE, visibleGroups.length)) },
      { root: listRef.current, rootMargin: '900px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visibleGroups.length, hasMore])

  const ago = agoMin(status?.lastCycleAt)

  const statusLine = status
    ? status.enabled
      ? `Auto-scan on · looks every ${status.intervalMin} min${ago != null ? ` · last look ${ago}m ago` : ' · first look coming up'} · today: read ${status.today.read} · kept ${status.today.kept} · dropped ${status.today.dropped}`
      : 'Auto-scan off — it needs a (free) Groq key in the engine to run'
    : 'checking the scanner…'

  return (
    <motion.div className="pipeline wire" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div>
          <div className="pipeline__title">News wire — everything the scanner read</div>
          <div className="pipeline__sub">{statusLine}</div>
          {status?.enabled && status.budget && (
            <div className="pipeline__pools">
              <BudgetChip
                label="Groq"
                used={status.budget.tokens}
                cap={status.budget.tokenTarget || status.budget.tokenCap}
                unit="tok"
                color="--accent"
                title={`Groq daily token budget — paced evenly across the day so it never runs dry by noon. ${kfmt(status.budget.tokens)} of ${kfmt(status.budget.tokenTarget || status.budget.tokenCap)} tokens used today${status.budget.paceCeiling ? ` · ${kfmt(status.budget.paceCeiling)} released so far on the clock schedule` : ''}.`}
              />
              {(status.overflow || []).map((o) => (
                <BudgetChip
                  key={o.id}
                  label={`${o.label} overflow`}
                  used={o.requests}
                  cap={o.reqCap}
                  unit="req"
                  color={o.color}
                  active={o.requests > 0}
                  title={`Free-tier overflow (${o.model}) — picks up triage when Groq is paced or capped, so the day's throughput is Groq + every free pool. ${o.requests} of ${o.reqCap} requests used today.`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="pipeline__tools">
          <button className="btn btn--ghost" onClick={() => void openFeed()}>
            refresh
          </button>
          <button className="btn btn--ghost" onClick={close}>
            ✕
          </button>
        </div>
      </div>

      <div className="wirewindow" role="group" aria-label="Time window">
        <span className="wirewindow__label">Look back</span>
        {FEED_WINDOWS.map((w) => (
          <button
            key={w.d}
            type="button"
            className={`wirewindow__chip${feedWindowDays === w.d ? ' is-active' : ''}`}
            onClick={() => { if (feedWindowDays !== w.d) void setFeedWindow(w.d) }}
            disabled={feedWindowLoading}
          >
            {w.label}
          </button>
        ))}
        <span className="wirewindow__note">
          {feedWindowLoading ? 'loading…' : feedWindowDays > 2 ? `historical · newest ${items.length.toLocaleString()} in range` : `live · ${items.length.toLocaleString()} loaded`}
        </span>
      </div>

      <FeedFilters value={filters} onChange={setFilters} sources={sources} />

      <div className="wire__list" ref={listRef}>
        {shown.map((g, i) => {
          // a sticky date divider whenever the calendar day changes — so a list that only shows HH:MM
          // stays legible across a 14-day (or longer) window as you scroll
          const showDay = i === 0 || dayKeyLocal(g.rep.ts) !== dayKeyLocal(shown[i - 1].rep.ts)
          const dayLabel = showDay ? dayDividerLabel(g.rep.ts) : ''
          return (
            <Fragment key={g.group}>
              {dayLabel && (
                <div className="wire__daydiv">
                  <span>{dayLabel}</span>
                </div>
              )}
              <WireRow group={g} />
            </Fragment>
          )
        })}
        {hasMore && (
          <div ref={sentinelRef} className="wire__more">
            showing {shown.length.toLocaleString()} of {visibleGroups.length.toLocaleString()} — scroll for more
          </div>
        )}
        {!visibleGroups.length && (
          <div className="plane__empty wire__empty">
            {items.length
              ? 'Nothing matches these filters — clear them to see everything again.'
              : status?.enabled
                ? `Nothing read yet today. The scanner looks every ${status.intervalMin} minutes; items appear here the moment they are scored.`
                : 'The auto-scan is off, so there is nothing to show. It needs a free Groq key in the engine.'}
          </div>
        )}
      </div>
    </motion.div>
  )
}
