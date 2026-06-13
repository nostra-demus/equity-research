// The main-stage reader for one event the user picked off the rail. Shows everything the cheap scanner
// found — score, why it was kept or dropped, the companies it guessed, the themes — then offers the one
// decision that matters: run the paid checks (which animates the signal through the orbs) or step back.
// "Read it, then choose" — the rail accumulates and ranks; this is where a human commits the spend.

import { plainBand, plainSize, plainTheme } from '../../lib/plain'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'

const fmtTime = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso.slice(0, 16).replace('T', ' ') : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function EventDetail({ it }: { it: FeedItem }) {
  const close = useStore((s) => s.scSelectEvent)
  const run = useStore((s) => s.runEventChecks)
  const staticMode = useStore((s) => s.staticMode)
  const kept = it.band !== 'drop'
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent)' : 'var(--text-faint)'

  return (
    <div className="evdetail-wrap">
      <article className="evdetail" key={`${it.event_id}-${it.ts}`}>
        <div className="evdetail__top">
          <span className="evdetail__score mono" style={{ color: tone, borderColor: tone }} title="Quick score out of 100 — a first read by the free scanner, not the full check">
            {it.triage_score}
          </span>
          <span className={`evdetail__band${kept ? ' evdetail__band--kept' : ''}`}>{plainBand(it.band)}</span>
          <span className="evdetail__when">{fmtTime(it.ts)}</span>
          <button type="button" className="evdetail__close" onClick={() => close(null)} aria-label="Back to events" title="Back to events">
            ✕
          </button>
        </div>

        <h1 className="evdetail__headline">{it.headline}</h1>

        <div className="evdetail__source">
          <span>{it.source_name}</span>
          {it.region && <span className="evdetail__sep">·</span>}
          {it.region && <span>{it.region}</span>}
          {it.via === 'rss' && <span className="evrow__tag evrow__tag--rss">RSS</span>}
        </div>

        {it.triage_reason && (
          <div className="evdetail__block">
            <div className="evdetail__label">Why the scanner {kept ? 'kept' : 'dropped'} it</div>
            <p className="evdetail__why">{it.triage_reason}</p>
          </div>
        )}

        {!!it.companies?.length && (
          <div className="evdetail__block">
            <div className="evdetail__label">Best guess — company</div>
            <div className="evdetail__chips">
              {it.companies.map((c, i) => (
                <span key={`${c.name}-${i}`} className="evdetail__chip evdetail__chip--co">
                  {[c.name, c.ticker, c.listing_country].filter(Boolean).join(' · ')}
                </span>
              ))}
            </div>
            <div className="evdetail__hint">Guessed from the headline alone — the checks verify this properly.</div>
          </div>
        )}

        {!!it.event_types?.length && (
          <div className="evdetail__block">
            <div className="evdetail__label">Themes</div>
            <div className="evdetail__chips">
              {it.event_types.map((t) => (
                <span key={t} className="evdetail__chip evdetail__chip--theme">
                  {plainTheme(t)}
                </span>
              ))}
              {it.size_bucket && it.size_bucket !== 'unknown' && <span className="evdetail__chip">{plainSize(it.size_bucket)}</span>}
            </div>
          </div>
        )}

        <div className="evdetail__actions">
          <span className="evdetail__est mono">about $8–45 · stops early (and cheaper) if a check says no</span>
          {it.url && (
            <a className="btn btn--ghost" href={it.url} target="_blank" rel="noreferrer">
              Open source ↗
            </a>
          )}
          <button className="btn btn--amber" onClick={() => void run(it)} title={staticMode ? 'Runs on your local machine (npm run dev)' : 'Send this event through the screener checks'}>
            Run the checks ▸
          </button>
        </div>
      </article>
    </div>
  )
}
