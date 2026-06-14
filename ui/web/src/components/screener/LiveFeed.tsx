// The News wire — a live view of EVERYTHING the auto-scanner reads: each item as it's scored,
// its theme tags, the company it's guessed to be about, and whether it was kept for the Inbox or
// dropped (and why). Backfills from disk (restart-proof) and streams new items over SSE the moment
// a cycle scores them. A drop here is a result, not a failure — most news should die at this stage.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { groupByDedup, type StoryGroup } from '../../lib/dedup'
import { plainBand, plainSize, plainTheme } from '../../lib/plain'
import { hhmmLocal } from '../../lib/format'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'
import { emptyFilters, FeedFilters, matchesFilters, type FeedFilterState } from './FeedFilters'

const agoMin = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) : null)

// compact 405000 → "405k", 14 → "14"
const kfmt = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : `${Math.round(n)}`)

// A small daily-budget pool readout: a label, a fill bar, and used/cap. The fill animates with a GPU
// transform (scaleX) so the poll-driven update never triggers layout. `tone` distinguishes the two
// providers — Groq (the paced primary) from the Gemini free-tier overflow (green = bonus capacity).
function BudgetChip({ label, used, cap, unit, tone, title }: { label: string; used: number; cap: number; unit: string; tone: 'groq' | 'gemini' | 'openrouter'; title: string }) {
  const frac = cap > 0 ? Math.min(1, Math.max(0, used / cap)) : 0
  return (
    <span className={`poolchip poolchip--${tone}${used > 0 && (tone === 'gemini' || tone === 'openrouter') ? ' is-active' : ''}`} title={title}>
      <span className="poolchip__label">{label}</span>
      <span className="poolchip__bar" aria-hidden><span className="poolchip__fill" style={{ transform: `scaleX(${frac})` }} /></span>
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
  const [filters, setFilters] = useState<FeedFilterState>(emptyFilters())

  // keep the "last look Xm ago" line honest while the panel is open
  useEffect(() => {
    const id = setInterval(() => void refreshStatus(), 60_000)
    return () => clearInterval(id)
  }, [refreshStatus])

  const sources = useMemo(() => [...new Set(items.map((i) => i.source_name).filter(Boolean))].sort(), [items])
  // filter first, then collapse near-duplicate stories so the wire shows one row per story (newest-first)
  const visibleGroups = useMemo(() => groupByDedup(items.filter((i) => matchesFilters(i, filters))), [items, filters])
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
                tone="groq"
                title={`Groq daily token budget — paced evenly across the day so it never runs dry by noon. ${kfmt(status.budget.tokens)} of ${kfmt(status.budget.tokenTarget || status.budget.tokenCap)} tokens used today${status.budget.paceCeiling ? ` · ${kfmt(status.budget.paceCeiling)} released so far on the clock schedule` : ''}.`}
              />
              {status.gemini?.enabled && (
                <BudgetChip
                  label="Gemini overflow"
                  used={status.gemini.requests}
                  cap={status.gemini.reqCap}
                  unit="req"
                  tone="gemini"
                  title={`Free-tier overflow (${status.gemini.model}) — a second provider that picks up triage when Groq is paced or capped, so the day's throughput is Groq + Gemini. ${status.gemini.requests} of ${status.gemini.reqCap} requests used today.`}
                />
              )}
              {status.openrouter?.enabled && (
                <BudgetChip
                  label="OpenRouter overflow"
                  used={status.openrouter.requests}
                  cap={status.openrouter.reqCap}
                  unit="req"
                  tone="openrouter"
                  title={`Free-tier overflow (${status.openrouter.model}) — the strongest free models (gpt-oss-120b, llama-3.3-70b…), used as the highest-quality overflow tier. ${status.openrouter.requests} of ${status.openrouter.reqCap} requests used today.`}
                />
              )}
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

      <FeedFilters value={filters} onChange={setFilters} sources={sources} />

      <div className="wire__list">
        {visibleGroups.map((g) => (
          <WireRow key={g.group} group={g} />
        ))}
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
