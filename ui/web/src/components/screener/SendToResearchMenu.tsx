// "Send to research" — route THIS wire event into a tracked subject's data pool as a dated note, so
// the research tab's doc-intake machinery flags the affected orbs and offers the scoped re-run. The
// event-level twin of PipelineBoard's thesis handoff. Sending is manual BY DESIGN — every send is
// logged as training data for the eventual automatic bridge — and the server dedupes syndicated
// copies of the same story, launches the advisory intake analysis (the quality gate), and keeps
// every paid re-run behind its own click in the research tab.
//
// A popover menu (the .reportpop pattern RunChecksMenu uses), listing the tracked subjects newest
// evidence first: companies this story NAMES on top, then subjects with a finished research run,
// then the rest of the pool. Sending is a two-step confirm-in-place on the row (the PipelineBoard
// handoff idiom) — never a one-click write into an evidence pool.

import { useEffect, useMemo, useRef, useState } from 'react'
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
  /** Undefined on an older engine — see TickerSummary. Only an explicit false marks a row unsendable. */
  hasStandingDecision?: boolean
  runCount?: number
  sent: boolean
}

export function SendToResearchMenu({ it }: Props) {
  const send = useStore((s) => s.sendEventToResearch)
  const enrichCache = useStore((s) => s.enrichCache)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<ReportMenuAnchor | null>(null)
  const [subjects, setSubjects] = useState<TickerSummary[] | null>(null) // null = loading
  const [loadFailed, setLoadFailed] = useState(false) // an error is NOT the empty state — never claim "no companies" on a failed fetch
  const [links, setLinks] = useState<EventResearchLink[]>([])
  const [armed, setArmed] = useState<string | null>(null) // row awaiting its confirm click
  const [sending, setSending] = useState<string | null>(null)
  const [sentLocal, setSentLocal] = useState<Set<string>>(new Set())
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  // the CURRENT event id, readable from inside stale fetch closures (the closure's own `it` would
  // always equal its captured copy — a ref is the only honest "did the event change?" check)
  const eventRef = useRef(it.event_id)
  eventRef.current = it.event_id

  // a newly-opened event resets ALL of the menu's per-event state (links included — a stale list
  // would paint the previous event's "✓ sent" marks onto this one)
  useEffect(() => { setOpen(false); setArmed(null); setSending(null); setSentLocal(new Set()); setLinks([]) }, [it.event_id])

  // Escape closes ONLY this menu — capture phase, same reasoning as RunChecksMenu (EventDetail's own
  // Escape handler would otherwise also drop the user out of the reader).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  // move focus into the menu once its rows exist (menu semantics), and back to the trigger on close
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLButtonElement>('button.reportpop__item')?.focus()
  }, [open, subjects])

  const loadLists = () => {
    setSubjects(null)
    setLoadFailed(false)
    const forEvent = it.event_id // guard: a slow response must not land on a different event's menu
    void api.tickers()
      .then((r) => { if (forEvent === eventRef.current) { setSubjects(r.tickers); setLoadFailed(false) } })
      .catch(() => { if (forEvent === eventRef.current) { setSubjects([]); setLoadFailed(true) } })
    void api.eventResearchLinks(forEvent).then((l) => { if (forEvent === eventRef.current) setLinks(l) })
  }

  const openMenu = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const right = Math.max(8, window.innerWidth - r.right)
    const below = window.innerHeight - r.bottom
    // flip up when the space below can't hold the menu's SATURATED height (~460px: label + 342px
    // list + the multi-line hint) — 360 was measured too small and let long lists overflow the fold
    setAnchor(below < 470 ? { right, bottom: Math.max(8, window.innerHeight - r.top + 6) } : { right, top: r.bottom + 6 })
    setArmed(null)
    setOpen((v) => !v)
    if (!open) loadLists()
  }

  // tickers this story names — the wire's headline guesses plus the article read, exact symbol and
  // its pre-suffix base (EMAAR.DU also matches a pool folder named EMAAR). Loose matching is fine
  // HERE because a human confirms the row; the automatic bridge matches exact-only.
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
      .map((t) => ({ ticker: t.ticker, named: namedTickers.has(t.ticker.toUpperCase()), latestRun: t.latestRun, hasStandingDecision: t.hasStandingDecision, runCount: t.runCount, sent: sent.has(t.ticker) }))
      .sort((a, b) =>
        Number(b.named) - Number(a.named) ||
        Number(!!b.latestRun) - Number(!!a.latestRun) ||
        a.ticker.localeCompare(b.ticker))
  }, [subjects, links, sentLocal, namedTickers])

  const fire = (ticker: string) => {
    const forEvent = it.event_id // guard: switching events mid-flight must not paint state onto the new one
    setSending(ticker)
    void send(it, ticker).then((ok) => {
      if (forEvent !== eventRef.current) return
      setSending(null)
      setArmed(null)
      if (ok) {
        setSentLocal((s) => new Set(s).add(ticker))
        setOpen(false)
        triggerRef.current?.focus()
      }
    })
  }

  // the wire's own read of this event, shown so the sender SEES what they're routing (quality stays
  // a human judgment on the manual path — but an informed one)
  const lowSignal = typeof it.triage_score === 'number' && it.triage_score < 40
  const eventContext = typeof it.triage_score === 'number' ? `score ${Math.round(it.triage_score)} · ${it.band || 'unbanded'}` : ''

  // A row the server will certainly refuse: the pool has run folders but none carries a usable decision
  // record, so there is no dossier for the note to become evidence against. Only an EXPLICIT false blocks —
  // an older engine omits the field, and disabling a working feature on a missing value is the worse failure.
  const unfinished = (r: SubjectRow): boolean => r.hasStandingDecision === false && !!r.latestRun

  const subFor = (r: SubjectRow): string => {
    if (r.sent) return 'already in its data pool'
    if (unfinished(r)) return r.runCount && r.runCount > 1
      ? `${r.runCount} runs, none finished — no decision to attach evidence to`
      : 'run never finished — no decision to attach evidence to'
    if (r.named) return 'named in this story'
    // `decision || 'finished'` used to print "finished" for a run with NO decision — the exact opposite of
    // the truth, and what invited a click the server could only refuse.
    if (r.latestRun) return `research run · ${r.latestRun.decision || 'no verdict recorded'}${r.latestRun.decisionDate ? ` · ${r.latestRun.decisionDate}` : ''}`
    return 'data pool only — no run yet'
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
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
            <div className="reportpop__label">Add this event to a company’s evidence{eventContext ? ` · ${eventContext}` : ''}</div>
            {subjects === null && (
              <div className="reportpop__item" aria-disabled style={{ cursor: 'default' }}>
                <b><Spin /> Loading tracked companies…</b>
                <span>the research data folders</span>
              </div>
            )}
            {subjects !== null && loadFailed && (
              <button className="reportpop__item" role="menuitem" onClick={loadLists}>
                <b>Couldn’t load the company list</b>
                <span>Check the engine connection — click to try again.</span>
              </button>
            )}
            {subjects !== null && !loadFailed && rows.length === 0 && (
              <div className="reportpop__item" aria-disabled style={{ cursor: 'default' }}>
                <b>No tracked companies yet</b>
                <span>Create one in the research tab first — then events can be routed to it.</span>
              </div>
            )}
            {subjects !== null && !loadFailed && rows.length > 0 && (
              <div ref={listRef} style={{ maxHeight: 342, overflowY: 'auto' }}>
                {rows.map((r) => {
                  const busy = sending === r.ticker
                  const isArmed = armed === r.ticker && !busy
                  const blocked = unfinished(r)
                  return (
                    <button
                      key={r.ticker}
                      className="reportpop__item"
                      role="menuitem"
                      disabled={!!sending || blocked}
                      aria-disabled={blocked || undefined}
                      title={blocked ? `${r.ticker} has no finished research run yet — a note needs a decision to be evidence against.` : undefined}
                      style={blocked ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                      onClick={() => { if (blocked) return; isArmed ? fire(r.ticker) : setArmed(r.ticker) }}
                    >
                      <b style={isArmed ? { color: 'var(--accent-deep)' } : undefined}>
                        {busy ? <><Spin /> Sending to {r.ticker}…</> : isArmed ? `yes — send to ${r.ticker} ▸` : <>{r.sent ? '✓ ' : ''}{r.ticker}{r.named ? ' ·' : ''}{r.named && <span style={{ fontWeight: 600, color: 'var(--accent-bright)' }}> named here</span>}</>}
                      </b>
                      <span>{isArmed ? (lowSignal ? 'low-signal item — send only if you’re sure it’s evidence' : 'adds a dated wire note to its data folder') : subFor(r)}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="reportpop__hint">Free — writes a dated note into the company’s data folder and asks research to check what it changes. One note per story; any re-run stays your click.</div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
