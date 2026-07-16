// "Send to research" — route THIS wire event into a tracked subject's data pool as a dated note, so
// the research tab's doc-intake machinery flags the affected orbs and offers the scoped re-run. The
// event-level twin of PipelineBoard's thesis handoff. Free (a file write — no run, no LLM); every
// paid step stays behind its own click in the research tab.
//
// A popover menu (the .reportpop pattern RunChecksMenu uses), listing the tracked subjects newest
// evidence first: companies this story NAMES on top, then subjects with a finished research run,
// then the rest of the pool. Sending is a two-step confirm-in-place on the row (the PipelineBoard
// handoff idiom) — never a one-click write into an evidence pool.

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import { Spin } from '../Spin'
import type { EventResearchLink, FeedItem, TickerSummary } from '../../lib/types'
import type { ReportMenuAnchor } from '../ActivityReportMenu'
import '../swarm/CoreOrb.css' // the shared .reportpop / __item / __label / __hint / __scrim popover look

interface Props {
  it: FeedItem
}

interface SubjectRow {
  ticker: string
  named: boolean // this story names the company (wire guess or the article read)
  latestRun: TickerSummary['latestRun']
  sent: boolean
}

export function SendToResearchMenu({ it }: Props) {
  const send = useStore((s) => s.sendEventToResearch)
  const enrichCache = useStore((s) => s.enrichCache)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<ReportMenuAnchor | null>(null)
  const [subjects, setSubjects] = useState<TickerSummary[] | null>(null) // null = loading
  const [links, setLinks] = useState<EventResearchLink[]>([])
  const [armed, setArmed] = useState<string | null>(null) // row awaiting its confirm click
  const [sending, setSending] = useState<string | null>(null)
  const [sentLocal, setSentLocal] = useState<Set<string>>(new Set())

  // a newly-opened event resets the menu's transient state (mirrors EventDetail's own reset-on-event)
  useEffect(() => { setOpen(false); setArmed(null); setSending(null); setSentLocal(new Set()) }, [it.event_id])

  // Escape closes ONLY this menu — capture phase, same reasoning as RunChecksMenu (EventDetail's own
  // Escape handler would otherwise also drop the user out of the reader).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  const openMenu = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const right = Math.max(8, window.innerWidth - r.right)
    const below = window.innerHeight - r.bottom
    setAnchor(below < 360 ? { right, bottom: Math.max(8, window.innerHeight - r.top + 6) } : { right, top: r.bottom + 6 })
    setArmed(null)
    setOpen((v) => !v)
    if (!open) {
      // fresh data every open — the subject list and the "✓ sent" marks are cheap reads
      setSubjects(null)
      void api.tickers().then((r) => setSubjects(r.tickers)).catch(() => setSubjects([]))
      void api.eventResearchLinks(it.event_id).then(setLinks)
    }
  }

  // tickers this story names — the wire's headline guesses plus the article read, exact symbol and
  // its pre-suffix base (EMAAR.DU also matches a pool folder named EMAAR)
  const namedTickers = useMemo(() => {
    const out = new Set<string>()
    const add = (t?: string | null) => {
      if (!t) return
      const u = String(t).toUpperCase().trim()
      if (!u) return
      out.add(u)
      const base = u.split('.')[0]
      if (base) out.add(base)
    }
    for (const c of it.companies || []) add(c.ticker)
    const enr = enrichCache[it.event_id]
    if (enr && enr !== 'loading') for (const c of enr.companies || []) add(c.ticker)
    return out
  }, [it, enrichCache])

  const rows: SubjectRow[] = useMemo(() => {
    const sent = new Set([...links.map((l) => l.ticker), ...sentLocal])
    return (subjects || [])
      .filter((t) => t.valid)
      .map((t) => ({ ticker: t.ticker, named: namedTickers.has(t.ticker.toUpperCase()), latestRun: t.latestRun, sent: sent.has(t.ticker) }))
      .sort((a, b) =>
        Number(b.named) - Number(a.named) ||
        Number(!!b.latestRun) - Number(!!a.latestRun) ||
        a.ticker.localeCompare(b.ticker))
  }, [subjects, links, sentLocal, namedTickers])

  const fire = (ticker: string) => {
    setSending(ticker)
    void send(it, ticker).then((ok) => {
      setSending(null)
      setArmed(null)
      if (ok) {
        setSentLocal((s) => new Set(s).add(ticker))
        setOpen(false)
      }
    })
  }

  const subFor = (r: SubjectRow): string => {
    if (r.sent) return 'already in its data pool'
    if (r.named) return 'named in this story'
    if (r.latestRun) return `research run · ${r.latestRun.decision || 'finished'}${r.latestRun.decisionDate ? ` · ${r.latestRun.decisionDate}` : ''}`
    return 'data pool only — no run yet'
  }

  return (
    <>
      <button
        type="button"
        className="evdetail__sendbtn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={openMenu}
        title="Add this event to a company you're researching — its research view will flag what to re-run"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 6h9M4 12h6M4 18h4M13 15l4 4 4-8" />
          <circle cx="17" cy="19" r="0.5" />
        </svg>
        Send to research
      </button>

      {open && anchor && createPortal(
        <>
          <div className="reportpop__scrim" onClick={() => setOpen(false)} />
          <div
            className="reportpop"
            style={{ left: 'auto', right: anchor.right, top: anchor.top, bottom: anchor.bottom, transform: 'none', animation: 'none', minWidth: 264 }}
            onClick={(e) => e.stopPropagation()}
            role="menu"
            aria-label="Send this event to a tracked company"
          >
            <div className="reportpop__label">Add this event to a company’s evidence</div>
            {subjects === null && (
              <div className="reportpop__item" aria-disabled style={{ cursor: 'default' }}>
                <b><Spin /> Loading tracked companies…</b>
                <span>the research data folders</span>
              </div>
            )}
            {subjects !== null && rows.length === 0 && (
              <div className="reportpop__item" aria-disabled style={{ cursor: 'default' }}>
                <b>No tracked companies yet</b>
                <span>Create one in the research tab first — then events can be routed to it.</span>
              </div>
            )}
            {subjects !== null && rows.length > 0 && (
              <div style={{ maxHeight: 342, overflowY: 'auto' }}>
                {rows.map((r) => {
                  const busy = sending === r.ticker
                  const isArmed = armed === r.ticker && !busy
                  return (
                    <button
                      key={r.ticker}
                      className="reportpop__item"
                      role="menuitem"
                      disabled={!!sending}
                      onClick={() => (isArmed ? fire(r.ticker) : setArmed(r.ticker))}
                    >
                      <b style={isArmed ? { color: 'var(--accent-deep)' } : undefined}>
                        {busy ? <><Spin /> Sending to {r.ticker}…</> : isArmed ? `yes — send to ${r.ticker} ▸` : <>{r.sent ? '✓ ' : ''}{r.ticker}{r.named ? ' ·' : ''}{r.named && <span style={{ fontWeight: 600, color: 'var(--accent-bright)' }}> named here</span>}</>}
                      </b>
                      <span>{isArmed ? 'adds a dated wire note to its data folder' : subFor(r)}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="reportpop__hint">Free — writes a dated note into the company’s data folder. Research then shows which orbs it affects; any re-run stays your click.</div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
