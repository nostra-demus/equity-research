// Ideas is deliberately a two-tab skim: live LONG ideas and live SHORT ideas. The payload's direction is
// authoritative; stale rows stay out, while pair trades appear under each of their explicit legs.
//
// Deliberate honesty, per the doctrine: the conviction is labelled a "pre-edge read", never the locked edge
// score (§7); a macro/commodity bet is flagged, not dressed as a single-name pick (§14); and when nothing
// clears the bar the view SAYS SO (§24, the Rejector) instead of manufacturing a pick. It fails closed on a
// missing ideas array (deploy skew, DESIGN.md §5), ships loading/empty/error states (§4), and — because it
// auto-refreshes on the board poll (a live tick) — never uses a mount/exit animation that a re-render could
// freeze (DESIGN.md §3, the LiveFeed rule); the only motion is a one-shot CSS fade keyed per idea.

import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import type { BoardIdea, IdeasHealth, QualifiedIdeaEvaluation, QualifiedIdeasBoard } from '../../lib/types'
import { ideaIsStaleNow, qualifiedIdeaFreshnessNow } from '../../lib/ideasView'

const MACRO_TYPES = new Set(['macro_conditional', 'commodity_conditional', 'policy_conditional', 'fx_rates', 'liquidity_positioning'])

// The same thumb glyphs the reader uses, so a rating feels identical across the cockpit.
const THUMB_UP = 'M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4.5-7a2 2 0 0 1 3.7 1.3L14.5 9H20a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 18.7 20H7'
const THUMB_DOWN = 'M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3zm0 0-4.5 7a2 2 0 0 1-3.7-1.3L9.5 15H4a2 2 0 0 1-2-2.3l1.3-7A2 2 0 0 1 5.3 4H17'
const UP_REASONS = ['clean setup', 'timely', 'non-obvious']
const DOWN_REASONS = ['not tradable', 'priced in', 'wrong way', 'too vague']

export type IdeaSide = 'long' | 'short'
const IDEA_SIDES: readonly IdeaSide[] = ['long', 'short']

/** A pair is shown once for each explicit leg: its primary ticker is long and pair_with is short. */
export function ideasForSide(ideas: readonly BoardIdea[], side: IdeaSide, nowMs = Date.now()): BoardIdea[] {
  return ideas.filter((idea) => {
    if (ideaIsStaleNow(idea, nowMs)) return false
    if (idea.direction === side) return true
    return idea.direction === 'pair' && Boolean(idea.pair_with)
  })
}

export function qualifiedIdeasForSide(board: QualifiedIdeasBoard | null | undefined, side: IdeaSide, nowMs = Date.now()): QualifiedIdeaEvaluation[] {
  if (!board || !Array.isArray(board.qualified)) return []
  return board.qualified.filter((idea) => (
    idea.candidate.instrument.direction === side
    && !qualifiedIdeaFreshnessNow(idea, board.policy, nowMs).refreshRequired
  ))
}

export function ideasEmptyMessage(
  side: IdeaSide,
  leadsAvailable: boolean,
  hasAnyLiveLead: boolean,
  health?: Pick<IdeasHealth, 'status'>,
): string {
  if (!leadsAvailable) return 'Ideas unavailable.'
  if (health?.status === 'running' && !hasAnyLiveLead) return 'Checking for ideas…'
  if (hasAnyLiveLead || health?.status === 'healthy') return `No ${side.toUpperCase()} ideas.`
  return 'Ideas unavailable.'
}

export function IdeasTabs({ active, onSelect }: { active: IdeaSide; onSelect: (side: IdeaSide) => void }) {
  return (
    <div className="bideas__tabs" role="tablist" aria-label="Idea direction">
      {IDEA_SIDES.map((side) => (
        <button
          key={side}
          id={`ideas-${side}-tab`}
          type="button"
          role="tab"
          aria-controls={`ideas-${side}-panel`}
          aria-selected={active === side}
          tabIndex={active === side ? 0 : -1}
          className={`bideas__tab bideas__tab--${side}${active === side ? ' bideas__tab--on' : ''}`}
          onClick={() => onSelect(side)}
          onKeyDown={(event) => {
            const keyTarget = event.key === 'Home'
              ? 'long'
              : event.key === 'End'
                ? 'short'
                : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                  ? side === 'long' ? 'short' : 'long'
                : null
            if (!keyTarget) return
            event.preventDefault()
            onSelect(keyTarget)
            document.getElementById(`ideas-${keyTarget}-tab`)?.focus()
          }}
        >
          {side.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// 👍/👎 on a surfaced idea — the self-grading loop, in the reader's exact visual language. A thumb click
// files the vote instantly (optimistic) and reveals an OPTIONAL one-tap reason above it; clicking the lit
// thumb again un-votes. Reasons refine the vote but are never required — fast by default.
function IdeaFeedback({ idea }: { idea: BoardIdea }) {
  const rate = useStore((s) => s.scRateIdea)
  const [open, setOpen] = useState<null | 'up' | 'down'>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])
  // While the reason popover is open, Escape or an outside click dismisses it, and focus moves into the
  // group so a keyboard / screen-reader user actually reaches (and hears) the reason chips.
  useEffect(() => {
    if (!open) return
    rootRef.current?.querySelector<HTMLButtonElement>('.ideafb__chip')?.focus()
    const onDown = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(null) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const vote = idea.feedback

  const clickThumb = (pol: 'up' | 'down') => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (vote === pol) { setOpen(null); void rate(idea, 'clear'); return } // toggle off
    setOpen(pol)
    void rate(idea, pol) // files immediately; the reason is an optional refinement
    closeTimer.current = setTimeout(() => setOpen(null), 5000)
  }
  const pickReason = (pol: 'up' | 'down', reason: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(null); void rate(idea, pol, reason) }

  return (
    <div className="ideafb" ref={rootRef}>
      {open && (
        <span className="ideafb__reasons" role="group" aria-label="Why?">
          {(open === 'up' ? UP_REASONS : DOWN_REASONS).map((r) => (
            <button key={r} type="button" className="ideafb__chip" onClick={() => pickReason(open, r)}>{r}</button>
          ))}
        </span>
      )}
      <span className={`ideafb__shell${vote ? ' ideafb__shell--rated' : ''}`} role="group" aria-label="Rate this idea">
        <button type="button" className={`ideafb__thumb ideafb__thumb--up${vote === 'up' ? ' ideafb__thumb--on' : ''}`} onClick={() => clickThumb('up')} aria-pressed={vote === 'up'} aria-label="Good idea" title="Good idea">
          <svg viewBox="0 0 24 24" aria-hidden><path d={THUMB_UP} /></svg>
        </button>
        <button type="button" className={`ideafb__thumb ideafb__thumb--down${vote === 'down' ? ' ideafb__thumb--on' : ''}`} onClick={() => clickThumb('down')} aria-pressed={vote === 'down'} aria-label="Not a good idea" title="Not a good idea">
          <svg viewBox="0 0 24 24" aria-hidden><path d={THUMB_DOWN} /></svg>
        </button>
      </span>
    </div>
  )
}

function agoLabel(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const mins = Math.max(0, Math.round((Date.now() - t) / 60_000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

function prettyType(t: string): string { return t.replace(/_/g, ' ') }

export interface IdeaThemeAttribution {
  label: 'found through Themes' | 'theme corroborated'
  title: string
}

/** Keep provenance language narrower than the underlying data. A theme-only lead was discovered through
 * Themes; a mixed lead was already present on the wire and Themes supplied corroborating evidence. */
export function ideaThemeAttribution(
  idea: Pick<BoardIdea, 'origin_type' | 'source_themes'>,
): IdeaThemeAttribution | null {
  if (!idea.source_themes?.length) return null
  if (idea.origin_type === 'theme') {
    return {
      label: 'found through Themes',
      title: 'This lead entered the skim through a theme that cleared the evidence gate',
    }
  }
  if (idea.origin_type === 'mixed') {
    return {
      label: 'theme corroborated',
      title: 'This lead appeared on the wire and was corroborated by a theme that cleared the evidence gate',
    }
  }
  return null
}

// A paid gauntlet run is a real spend, so the CTA arms on the first click and fires on the second (the
// cockpit's "Scan now" idiom), auto-disarming after a few seconds. Self-contained: manages its own arm /
// sending / error state and calls the store directly, so the card list stays declarative.
function PromoteButton({ idea }: { idea: BoardIdea }) {
  const promote = useStore((s) => s.scPromoteIdea)
  const [phase, setPhase] = useState<'idle' | 'armed' | 'sending'>('idle')
  const [err, setErr] = useState<string | null>(null)
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current) }, [])

  if (idea.status === 'promoted') return <span className="bidea__sent">In the machine</span>

  const rated = idea.prior_coverage?.has_run
  const onClick = () => {
    if (phase === 'sending') return
    if (phase === 'idle') {
      setErr(null)
      setPhase('armed')
      if (armTimer.current) clearTimeout(armTimer.current)
      armTimer.current = setTimeout(() => setPhase('idle'), 4000)
      return
    }
    if (armTimer.current) clearTimeout(armTimer.current)
    setPhase('sending')
    promote(idea).then(
      () => { /* board refresh flips the card to promoted; if it survives, reset */ setPhase('idle') },
      (e: any) => { setErr(e?.message || 'launch failed'); setPhase('idle') },
    )
  }

  const label = phase === 'sending' ? 'Sending…' : phase === 'armed' ? 'Confirm · run the machine' : rated ? 'Re-run the machine →' : 'Run the full machine →'

  return (
    <span className="bidea__ctawrap">
      <button
        type="button"
        className={`bidea__cta${phase === 'armed' ? ' bidea__cta--armed' : ''}`}
        onClick={onClick}
        title={phase === 'armed' ? 'Click again to launch the paid gauntlet' : 'Send this idea into the full paid screener gauntlet for a deep check'}
      >
        {label}
      </button>
      {err && <span className="bidea__err" role="alert">{err}</span>}
    </span>
  )
}

function signedPct(value: number): string { return `${value > 0 ? '+' : ''}${value.toFixed(1)}%` }

export function qualifiedIdeaReturnTag(idea: Pick<QualifiedIdeaEvaluation, 'metrics' | 'ranking'>): { label: string; title?: string } | null {
  const raw = idea.metrics?.expected_return_pct
  const adjusted = idea.ranking?.conservative_expected_return_pct
  if (typeof adjusted === 'number' && Number.isFinite(adjusted)) {
    return {
      label: `policy-adjusted ${signedPct(adjusted)}`,
      title: typeof raw === 'number' && Number.isFinite(raw) ? `Raw scenario return ${signedPct(raw)}` : undefined,
    }
  }
  return typeof raw === 'number' && Number.isFinite(raw)
    ? { label: `raw scenario return ${signedPct(raw)}`, title: 'Policy adjustment unavailable on this older research record.' }
    : null
}

export function qualifiedIdeasWarning(board: QualifiedIdeasBoard | null | undefined): { label: string; title?: string } | null {
  if (board?.health.status !== 'degraded') return null
  const incomplete = board.health.incomplete_count ?? 0
  return {
    label: incomplete > 0
      ? `${incomplete} research run${incomplete === 1 ? '' : 's'} not published`
      : 'Research results incomplete',
    title: board.health.reason || undefined,
  }
}

function QualifiedIdeaCard({ idea }: { idea: QualifiedIdeaEvaluation }) {
  const candidate = idea.candidate
  const metrics = idea.metrics
  const returnTag = qualifiedIdeaReturnTag(idea)
  return (
    <article className="bidea">
      <div className="bidea__head">
        <span className="bidea__ticker">{candidate.instrument.ticker}</span>
        <span className="bidea__co">{[candidate.instrument.company, candidate.instrument.exchange].filter(Boolean).join(' · ')}</span>
      </div>
      <p className="bidea__reason">{candidate.research.edge_proof}</p>
      <p className="bidea__why"><span className="bidea__whylabel">catalyst —</span> {candidate.catalyst.name}</p>
      <div className="bidea__tags">
        <span className="bidea__tag bidea__tag--rated">full research</span>
        {returnTag && <span className="bidea__tag" title={returnTag.title}>{returnTag.label}</span>}
        {metrics && <span className="bidea__tag">worst case {metrics.worst_case_loss_pct.toFixed(1)}% loss</span>}
      </div>
    </article>
  )
}

function IdeaCard({ idea, side }: { idea: BoardIdea; side: IdeaSide }) {
  const macro = MACRO_TYPES.has(idea.thesis_type)
  const pc = idea.prior_coverage
  const rated = pc?.has_run
  const themeAttribution = ideaThemeAttribution(idea)
  const pair = idea.direction === 'pair'
  const ticker = pair && side === 'short' ? idea.pair_with : idea.ticker
  const company = pair && side === 'short' ? '' : [idea.company, idea.exchange].filter(Boolean).join(' · ')
  return (
    <article className="bidea">
      <div className="bidea__head">
        <span className="bidea__ticker">{ticker}</span>
        {company && <span className="bidea__co">{company}</span>}
        {idea.newest_source_at && <span className="bidea__ago">{agoLabel(idea.newest_source_at)}</span>}
      </div>

      <p className="bidea__reason">{idea.reason || 'No plain-English reason produced for this idea.'}</p>

      {idea.why_now && (
        <p className="bidea__why"><span className="bidea__whylabel">why now —</span> {idea.why_now}</p>
      )}

      {(idea.source_headlines?.[0] || idea.source_name) && (
        <p className="bidea__source">
          <span>unverified lead · </span>
          {idea.source_url
            ? <a href={idea.source_url} target="_blank" rel="noreferrer">{idea.source_headlines?.[0] || idea.source_name}</a>
            : <span>{idea.source_headlines?.[0] || idea.source_name}</span>}
          {idea.source_name && idea.source_headlines?.[0] && <small> · {idea.source_name}</small>}
          {idea.newest_source_at && <time dateTime={idea.newest_source_at}> · {agoLabel(idea.newest_source_at)}</time>}
        </p>
      )}

      <div className="bidea__tags">
        {themeAttribution && (
          <span className="bidea__tag bidea__tag--theme" title={themeAttribution.title}>
            {themeAttribution.label}
          </span>
        )}
        {pair && <span className="bidea__tag">pair · {side === 'long' ? `short ${idea.pair_with}` : `long ${idea.ticker}`}</span>}
        {macro && <span className="bidea__tag bidea__tag--warn">{prettyType(idea.thesis_type)} bet — not a pure stock pick</span>}
        {idea.priced_in === 'room' && <span className="bidea__tag">may not be priced in yet</span>}
        {idea.priced_in === 'priced' && <span className="bidea__tag">may already be priced in</span>}
        {!!idea.missing_checks?.length && <span className="bidea__tag bidea__tag--warn">needs {idea.missing_checks.slice(0, 2).join(' + ')}</span>}
        <span className={`bidea__tag bidea__tag--cov${rated ? ' bidea__tag--rated' : ''}`}>
          {rated
            ? `already rated${pc?.latest_decision ? ` · ${pc.latest_decision}` : ''}`
            : pc?.data_pool_present ? 'data on file — never rated' : 'fresh — never rated'}
        </span>
      </div>

      <div className="bidea__foot">
        <div className="bidea__read" title="A surface read from the skim — NOT the locked edge score the full machine computes.">
          <span className="bidea__readlabel">trade readiness</span>
          <span className="bidea__readnum">{idea.trade_score ?? idea.conviction}<span className="bidea__readden">/100</span></span>
          <span className="bidea__bar" aria-hidden><span className="bidea__barfill" style={{ width: `${Math.max(0, Math.min(100, idea.trade_score ?? idea.conviction))}%` }} /></span>
        </div>
        <div className="bidea__actions">
          <IdeaFeedback idea={idea} />
          <PromoteButton idea={idea} />
        </div>
      </div>
    </article>
  )
}

export function BestIdeasView() {
  const scBoard = useStore((s) => s.scBoard)
  const boardFetch = useStore((s) => s.scBoardFetch)
  const refresh = useStore((s) => s.scRefreshBoard)
  const [side, setSide] = useState<IdeaSide>('long')

  // Keep the skim fresh while the tab is open — the same 30s cadence PipelineBoard uses. openIdeas already
  // kicked one refresh; this keeps it live as new passes land server-side.
  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 30_000)
    return () => clearInterval(id)
  }, [refresh])

  const leadsAvailable = Array.isArray(scBoard?.ideas)
  const leadRows = leadsAvailable ? scBoard!.ideas! : []
  const hasAnyLiveLead = leadRows.some((idea) => !ideaIsStaleNow(idea))
  const coldError = !scBoard && boardFetch.status === 'error'
  const qualifiedWarning = qualifiedIdeasWarning(scBoard?.qualified_ideas)

  return (
    <div className="bideas">
      <IdeasTabs active={side} onSelect={setSide} />
      {qualifiedWarning && (
        <div className="bideas__truthwarn" role="status" title={qualifiedWarning.title}>
          <span aria-hidden>!</span> {qualifiedWarning.label}
        </div>
      )}
      {(coldError || (scBoard && boardFetch.error)) && (
        <div className={`bideas__fetch ${coldError ? 'bideas__fetch--bad' : 'bideas__fetch--warn'}`} role={coldError ? 'alert' : 'status'} aria-live={coldError ? 'assertive' : 'polite'} title={boardFetch.error || undefined}>
          <strong>{coldError ? 'Could not load ideas.' : boardFetch.status === 'refreshing' ? 'Refreshing…' : 'Could not refresh. Showing saved ideas.'}</strong>
          <button type="button" disabled={boardFetch.status === 'refreshing'} onClick={() => void refresh()}>{boardFetch.status === 'refreshing' ? 'Retrying…' : 'Retry'}</button>
        </div>
      )}
      {IDEA_SIDES.map((panelSide) => {
        const qualified = qualifiedIdeasForSide(scBoard?.qualified_ideas, panelSide)
        const ideas = ideasForSide(leadRows, panelSide)
        const hasIdeas = qualified.length > 0 || ideas.length > 0
        return (
          <section
            key={panelSide}
            id={`ideas-${panelSide}-panel`}
            className="bideas__panel"
            role="tabpanel"
            aria-labelledby={`ideas-${panelSide}-tab`}
            hidden={side !== panelSide}
          >
            {!scBoard && !coldError ? (
              <div className="bideas__list" aria-busy="true"><div className="bidea bidea--skeleton" /><div className="bidea bidea--skeleton" /></div>
            ) : hasIdeas ? (
              <div className="bideas__list">
                {qualified.map((idea) => <QualifiedIdeaCard key={`qualified-${idea.candidate.idea_id}`} idea={idea} />)}
                {ideas.map((idea) => <IdeaCard key={`lead-${idea.idea_id}`} idea={idea} side={panelSide} />)}
              </div>
            ) : !coldError ? (
              <p className="bideas__empty">{ideasEmptyMessage(panelSide, leadsAvailable, hasAnyLiveLead, scBoard?.ideas_health)}</p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
