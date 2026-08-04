// "Ideas" has two deliberately separate lanes. Qualified 3–6 month candidates come only from completed
// full-research artifacts and the deterministic risk gate. News leads come from the cheap free-LLM skim
// over the ranked wire and can only be escalated into research; they are never recommendations.
//
// Deliberate honesty, per the doctrine: the conviction is labelled a "pre-edge read", never the locked edge
// score (§7); a macro/commodity bet is flagged, not dressed as a single-name pick (§14); and when nothing
// clears the bar the view SAYS SO (§24, the Rejector) instead of manufacturing a pick. It fails closed on a
// missing ideas array (deploy skew, DESIGN.md §5), ships loading/empty/error states (§4), and — because it
// auto-refreshes on the board poll (a live tick) — never uses a mount/exit animation that a re-render could
// freeze (DESIGN.md §3, the LiveFeed rule); the only motion is a one-shot CSS fade keyed per idea.

import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import type { BoardIdea, IdeasHealth, IdeasScorecard, QualifiedIdeaEvaluation, QualifiedIdeasBoard } from '../../lib/types'
import { assessmentNeedsRefresh, ideaIsStaleNow, qualificationDetailCounts, qualifiedIdeaFreshnessNow, summarizeIdeasSurface, type QualifiedIdeaFreshness } from '../../lib/ideasView'

const MACRO_TYPES = new Set(['macro_conditional', 'commodity_conditional', 'policy_conditional', 'fx_rates', 'liquidity_positioning'])

// The same thumb glyphs the reader uses, so a rating feels identical across the cockpit.
const THUMB_UP = 'M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4.5-7a2 2 0 0 1 3.7 1.3L14.5 9H20a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 18.7 20H7'
const THUMB_DOWN = 'M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3zm0 0-4.5 7a2 2 0 0 1-3.7-1.3L9.5 15H4a2 2 0 0 1-2-2.3l1.3-7A2 2 0 0 1 5.3 4H17'
const UP_REASONS = ['clean setup', 'timely', 'non-obvious']
const DOWN_REASONS = ['not tradable', 'priced in', 'wrong way', 'too vague']

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

function sideLabel(d: BoardIdea['direction']): string { return d === 'pair' ? 'PAIR' : d.toUpperCase() }
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
function PromoteButton({ idea, compact }: { idea: BoardIdea; compact?: boolean }) {
  const promote = useStore((s) => s.scPromoteIdea)
  const [phase, setPhase] = useState<'idle' | 'armed' | 'sending'>('idle')
  const [err, setErr] = useState<string | null>(null)
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current) }, [])

  if (idea.status === 'promoted') return <span className={compact ? 'bidea-c__sent' : 'bidea__sent'}>In the machine</span>

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

  const label = compact
    ? phase === 'sending' ? '…' : phase === 'armed' ? 'confirm' : 'Run →'
    : phase === 'sending' ? 'Sending…' : phase === 'armed' ? 'Confirm · run the machine' : rated ? 'Re-run the machine →' : 'Run the full machine →'

  return (
    <span className={compact ? 'bidea-c__ctawrap' : 'bidea__ctawrap'}>
      <button
        type="button"
        className={`${compact ? 'bidea-c__cta' : 'bidea__cta'}${phase === 'armed' ? (compact ? ' bidea-c__cta--armed' : ' bidea__cta--armed') : ''}`}
        onClick={onClick}
        title={phase === 'armed' ? 'Click again to launch the paid gauntlet' : 'Send this idea into the full paid screener gauntlet for a deep check'}
      >
        {label}
      </button>
      {err && <span className={compact ? 'bidea-c__err' : 'bidea__err'} role="alert">{err}</span>}
    </span>
  )
}

function IdeaCard({ idea }: { idea: BoardIdea }) {
  const macro = MACRO_TYPES.has(idea.thesis_type)
  const pc = idea.prior_coverage
  const rated = pc?.has_run
  const themeAttribution = ideaThemeAttribution(idea)
  return (
    <article className={`bidea bidea--${idea.direction}`}>
      <div className="bidea__head">
        <span className={`bidea__side bidea__side--${idea.direction}`}>{sideLabel(idea.direction)}</span>
        <span className="bidea__ticker">{idea.ticker}</span>
        <span className="bidea__co">{[idea.company, idea.exchange].filter(Boolean).join(' · ')}</span>
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
        {idea.direction === 'pair' && idea.pair_with && <span className="bidea__tag">short {idea.pair_with}</span>}
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

export function CompactIdea({ idea }: { idea: BoardIdea }) {
  const themeAttribution = ideaThemeAttribution(idea)
  return (
    <div className="bidea-c">
      <span className={`bidea-c__side bidea-c__side--${idea.direction}`}>{sideLabel(idea.direction)}</span>
      <span className="bidea-c__ticker">{idea.ticker}</span>
      {themeAttribution && <span className="bidea-c__theme" title={themeAttribution.title}>{themeAttribution.label}</span>}
      <span className="bidea-c__reason">{idea.reason}</span>
      <span className="bidea-c__read" title="strict trade readiness; Signal Check still decides">{idea.trade_score ?? idea.conviction}</span>
      <PromoteButton idea={idea} compact />
    </div>
  )
}

function signedPct(n: number): string { return `${n > 0 ? '+' : ''}${n.toFixed(1)}%` }
function money(n: number, currency: string): string {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n) }
  catch { return `${currency} ${n.toFixed(2)}` }
}

function QualifiedCard({ idea, freshness }: { idea: QualifiedIdeaEvaluation; freshness: QualifiedIdeaFreshness }) {
  const c = idea.candidate
  const m = idea.metrics!
  return (
    <article className={`qidea qidea--${c.instrument.direction}${freshness.refreshRequired ? ' qidea--refresh' : ''}`}>
      <div className="qidea__head">
        <span className={`bidea__side bidea__side--${c.instrument.direction}`}>{c.instrument.direction.toUpperCase()}</span>
        <span className="bidea__ticker">{c.instrument.ticker}</span>
        <span className="bidea__co">{c.instrument.company} · {c.instrument.exchange}</span>
        <span
          className="qidea__layer"
          title="Risk/return frontier: layer 1 means no other qualified idea offers at least as much expected return with no more tail loss, worst-case loss, or chance of loss."
        >
          Risk/return frontier {idea.pareto_layer}{idea.pareto_layer === 1 ? ' · not dominated' : ''}
        </span>
      </div>
      {freshness.refreshRequired && (
        <div className="qidea__refresh" role="status">
          <strong>Refresh required — this is no longer a live qualified idea.</strong>
          <span>{freshness.reasons.join('; ')}. The frozen forecast remains visible for audit and outcome learning.</span>
        </div>
      )}
      <div className="qidea__metrics" aria-label="Risk and return distribution">
        <span><small>expected price return</small><strong className={m.expected_return_pct >= 0 ? 'qidea__good' : 'qidea__bad'}>{signedPct(m.expected_return_pct)}</strong></span>
        <span><small>worst 20% loss</small><strong className="qidea__bad">{m.tail_loss_pct.toFixed(1)}%</strong></span>
        <span><small>worst case loss</small><strong className="qidea__bad">{m.worst_case_loss_pct.toFixed(1)}%</strong></span>
        <span><small>loss probability</small><strong>{m.loss_probability_pct.toFixed(0)}%</strong></span>
        <span><small>best case</small><strong>{signedPct(m.best_case_return_pct)}</strong></span>
      </div>
      <p className="qidea__edge"><span>edge —</span> {c.research.edge_proof}</p>
      {c.research.unresolved_red_flags.length > 0 && <div className="qidea__flags">{c.research.unresolved_red_flags.map((flag) => <span key={flag.id}>{flag.severity} · {flag.description}</span>)}</div>}
      <div className="qidea__facts">
        <span>Entry {money(c.quote.price, c.instrument.currency)} · {new Date(c.quote.as_of).toLocaleDateString()}</span>
        <span>{new Date(c.horizon.start).toLocaleDateString()} → {new Date(c.horizon.end).toLocaleDateString()}</span>
        <span>Edge {c.research.edge_score}/100 · data {c.research.data_sufficiency_score}/100</span>
      </div>
      <div className="qidea__catalyst"><strong>{c.catalyst.name}</strong><span>{new Date(c.catalyst.window_start).toLocaleDateString()}–{new Date(c.catalyst.window_end).toLocaleDateString()}</span><p>{c.catalyst.causal_steps.join(' → ')}</p></div>
      <div className="qidea__scenarios">
        {m.scenario_returns.map((s) => <span key={s.label}><small>{s.label} · {s.probability_pct}%</small><strong className={s.return_pct < 0 ? 'qidea__bad' : 'qidea__good'}>{signedPct(s.return_pct)}</strong></span>)}
      </div>
      <p className="qidea__falsifier"><span>falsifier —</span> {c.falsifier.condition} · by {new Date(c.falsifier.deadline).toLocaleDateString()}</p>
      <div className="qidea__sources"><span>quote — {c.quote.source}</span><span>catalyst — {c.catalyst.source}</span><span>falsifier — {c.falsifier.source}</span></div>
      <p className="qidea__calnote">{idea.calibration_note}</p>
    </article>
  )
}

function QualificationDetails({ board }: { board: QualifiedIdeasBoard }) {
  const counts = qualificationDetailCounts(board)
  if (!counts.total) return null
  const summary = [
    counts.refreshNeeded ? `${counts.refreshNeeded} refresh needed` : null,
    counts.needsEvidence - counts.refreshNeeded ? `${counts.needsEvidence - counts.refreshNeeded} need more evidence` : null,
    counts.rejected ? `${counts.rejected} rejected` : null,
    counts.notAssessable ? `${counts.notAssessable} not assessable` : null,
  ].filter(Boolean).join(' · ')
  return (
    <details className="qideas__details" open={board.qualified.length === 0 || undefined}>
      <summary>Other assessed outcomes <span>{summary}</span></summary>
      <div className="qideas__detailrows">
        {board.needs_research.map((idea) => {
          const refreshNeeded = assessmentNeedsRefresh(idea)
          return (
            <div className={`qideas__detailrow${refreshNeeded ? ' qideas__detailrow--refresh' : ''}`} key={`needs-${idea.candidate.idea_id}`}>
              <strong>{idea.candidate.instrument.ticker}</strong>
              <span><b>{refreshNeeded ? 'Refresh needed' : 'Needs evidence'} —</b> {idea.issues.map((issue) => issue.message).join(' ')}</span>
            </div>
          )
        })}
        {board.does_not_clear.map((idea) => (
          <div className="qideas__detailrow qideas__detailrow--reject" key={`reject-${idea.candidate.idea_id}`}>
            <strong>{idea.candidate.instrument.ticker}</strong>
            <span><b>Rejected —</b> {idea.issues.filter((issue) => issue.disposition === 'reject').map((issue) => issue.message).join(' ') || idea.issues.map((issue) => issue.message).join(' ')}</span>
          </div>
        ))}
        {board.not_assessable.map((idea) => (
          <div className="qideas__detailrow" key={`unrated-${idea.assessment_id}`}>
            <strong>{idea.ticker}</strong>
            <span><b>Not assessable —</b> {idea.gaps.join(' ')}</span>
          </div>
        ))}
      </div>
      {counts.refreshNeeded > 0 && <p className="qideas__refreshnote">Refresh-needed rows keep their prior assessment immutable. A new full-research assessment must freeze current quote, liquidity, and market-risk evidence before the idea can re-enter.</p>}
    </details>
  )
}

function QualifiedSection({ board }: { board?: QualifiedIdeasBoard }) {
  if (!board) return <section className="qideas"><h2>Qualified · 3–6 months</h2><div className="qideas__state qideas__state--warn" role="status">This engine does not expose the full-research qualification board yet.</div></section>
  const h = board.health
  const freshness = board.qualified.map((idea) => ({ idea, freshness: qualifiedIdeaFreshnessNow(idea, board.policy) }))
  const current = freshness.filter((row) => !row.freshness.refreshRequired)
  const expired = freshness.filter((row) => row.freshness.refreshRequired)
  const outcomeNote = board.outcome_health_state === 'expired'
    ? `Outcome-runner health expired after ${board.outcome_health?.updated_at ? agoLabel(board.outcome_health.updated_at) : 'an unknown interval'}; the last green state is not current.`
    : board.outcome_health_state === 'unknown'
      ? 'Outcome-runner health is unavailable or invalid; no healthy state is inferred.'
      : board.outcome_health?.reason || 'The outcome runner has not recorded health yet.'
  return (
    <section className="qideas">
      <div className="qideas__title"><h2>Qualified · 3–6 months</h2><span className={`qideas__cal qideas__cal--${board.calibration.status}`}>{board.calibration.status.replace('_', ' ')} · {board.calibration.valid_outcome_count} outcomes</span></div>
      <p className="qideas__intro">Only full research can enter this list: verified identity and liquidity, a live dated catalyst, a loss-bearing scenario set, sufficient evidence, and no hard risk lock.</p>
      {h.outcome === 'no_artifacts' && <div className="qideas__state"><strong>No 3–6 month assessments have been produced yet.</strong><span>New full research runs now write one assessment—even when the honest result is “not assessable.” News leads below are not promoted into this list.</span></div>}
      {h.outcome === 'invalid_artifacts' && <div className="qideas__state qideas__state--bad"><strong>Assessment artifacts are invalid.</strong><span>{h.reason}</span></div>}
      {h.outcome === 'storage_error' && <div className="qideas__state qideas__state--bad"><strong>The assessment store cannot be read.</strong><span>{h.reason}</span></div>}
      {h.invalid_count > 0 && h.outcome !== 'invalid_artifacts' && <div className="qideas__artifactwarn">{h.invalid_count} malformed assessment artifact{h.invalid_count === 1 ? '' : 's'} excluded from this board.</div>}
      {h.outcome === 'none_clear' && (
        <div className="qideas__state qideas__state--warn">
          <strong>No assessed idea clears every gate.</strong><span>{h.reason}</span>
          <small>Open the assessed-outcomes detail below to see every rejection, missing input, and expired market check.</small>
        </div>
      )}
      {h.outcome === 'qualified' && current.length === 0 && expired.length > 0 && (
        <div className="qideas__state qideas__state--warn" role="status">
          <strong>The last qualified ideas now require refresh.</strong>
          <span>Time-sensitive evidence or an event window expired after the last successful board response. They no longer count as live qualified ideas.</span>
        </div>
      )}
      {current.length > 0 && <div className="qideas__cards">{current.map(({ idea, freshness: state }) => <QualifiedCard key={idea.candidate.idea_id} idea={idea} freshness={state} />)}</div>}
      {expired.length > 0 && (
        <details className="qideas__details qideas__details--expired" open={current.length === 0 || undefined}>
          <summary>Last-known qualified forecasts · refresh required <span>{expired.length}</span></summary>
          <div className="qideas__cards">{expired.map(({ idea, freshness: state }) => <QualifiedCard key={`expired-${idea.candidate.idea_id}`} idea={idea} freshness={state} />)}</div>
        </details>
      )}
      <QualificationDetails board={board} />
      <div className={`qideas__learning${board.outcome_health_state !== 'valid' ? ' qideas__learning--warn' : ''}`} role="status" aria-live="polite"><strong>Outcome loop —</strong> {outcomeNote} <span><strong>Calibration —</strong> {board.calibration.reason}</span></div>
    </section>
  )
}

function LeadHealth({ health }: { health?: IdeasHealth }) {
  if (!health) return <div className="bleadhealth bleadhealth--warn" role="status" aria-live="polite"><strong>Lead-pass health unavailable</strong><span>The connected engine cannot distinguish “empty” from “not run.”</span></div>
  const snapshotStore = health.snapshot_store
  const tone = (health.status === 'healthy' || health.status === 'running') && health.reason_code !== 'never_run' && Boolean(health.last_success_at || health.status === 'running')
    ? 'ok'
    : health.status === 'disabled' || health.status === 'waiting' || health.status === 'deferred' || health.status === 'degraded'
      ? 'warn'
      : 'bad'
  return (
    <div className={`bleadhealth bleadhealth--${tone}`} role="status" aria-live="polite">
      <strong>{health.status.replace('_', ' ')} · {health.outcome.replaceAll('_', ' ')}</strong>
      <span>{health.reason || 'No operational note.'}</span>
      <small>{health.last_success_at ? `last success ${agoLabel(health.last_success_at)}` : 'no successful provider pass yet'}{health.next_eligible_at ? ` · next eligible ${new Date(health.next_eligible_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</small>
      {snapshotStore && (snapshotStore.status === 'degraded' || snapshotStore.status === 'unreadable') && (
        <small className="bleadhealth__store">Snapshot store {snapshotStore.status}: {snapshotStore.corrupt_count} corrupt · {snapshotStore.invalid_count} invalid · {snapshotStore.unprojectable_count} unprojectable{snapshotStore.error ? ` · ${snapshotStore.error}` : ''}</small>
      )}
    </div>
  )
}

/** Empty copy is part of the operational truth contract: only a healthy provider pass with a literal
 * valid empty payload may say "returned no leads." A degraded/failed pass can carry success_empty from
 * an older writer, so status must independently clear the claim. Exported for a narrow regression test. */
export function leadEmptyMessage(health?: Pick<IdeasHealth, 'status' | 'outcome' | 'reason'>): string {
  return health?.status === 'healthy' && health.outcome === 'success_empty'
    ? 'The provider pass completed successfully and returned no leads.'
    : health?.reason || 'The lead pass has not produced a current result.'
}

export function BestIdeasView() {
  const scBoard = useStore((s) => s.scBoard)
  const boardFetch = useStore((s) => s.scBoardFetch)
  const refresh = useStore((s) => s.scRefreshBoard)

  // Keep the skim fresh while the tab is open — the same 30s cadence PipelineBoard uses. openIdeas already
  // kicked one refresh; this keeps it live as new passes land server-side.
  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 30_000)
    return () => clearInterval(id)
  }, [refresh])

  // Loading — a skeleton shaped like the cards, never a bare spinner.
  if (!scBoard) {
    if (boardFetch.status === 'error') {
      return (
        <div className="bideas">
          <Header subtitle="qualification and lead health unavailable" countLabel="fetch failed" />
          <div className="bideas__fetch bideas__fetch--bad" role="alert" aria-live="assertive">
            <strong>Ideas could not be loaded.</strong>
            <span>{boardFetch.error || 'The board request failed.'}</span>
            <button type="button" onClick={() => void refresh()}>Try again</button>
          </div>
        </div>
      )
    }
    return (
      <div className="bideas">
        <Header subtitle="loading qualification and lead health…" countLabel={null} />
        <div className="bideas__top"><div className="bidea bidea--skeleton" /><div className="bidea bidea--skeleton" /></div>
      </div>
    )
  }

  const leadsAvailable = Array.isArray(scBoard.ideas)
  const ideas = leadsAvailable ? scBoard.ideas! : []
  // Re-evaluate decay locally as a backstop while a failed poll is preserving the last good board.
  const live = ideas.filter((idea) => !ideaIsStaleNow(idea))
  const cooling = ideas.filter((idea) => ideaIsStaleNow(idea))
  const top = live.slice(0, 2)
  const more = live.slice(2)
  const surface = summarizeIdeasSurface(scBoard)

  return (
    <div className="bideas">
      <Header subtitle="full-research decisions above · unverified news leads below" countLabel={surface.headerLabel} />
      {boardFetch.error && (
        <div className="bideas__fetch bideas__fetch--warn" role="status" aria-live="polite">
          <strong>{boardFetch.status === 'refreshing' ? 'Retrying Ideas refresh…' : 'Ideas could not refresh.'}</strong>
          <span>Showing the last loaded board{boardFetch.lastSuccessAt ? ` from ${agoLabel(new Date(boardFetch.lastSuccessAt).toISOString())}` : ''}. {boardFetch.error}</span>
          <button type="button" disabled={boardFetch.status === 'refreshing'} onClick={() => void refresh()}>{boardFetch.status === 'refreshing' ? 'Retrying…' : 'Retry'}</button>
        </div>
      )}
      <QualifiedSection board={scBoard.qualified_ideas} />

      <section className="bleads">
        <div className="bleads__title"><h2>News leads · unverified</h2><span>{live.length} live</span></div>
        <p className="qideas__intro">A cheap skim of the ranked wire. These are leads to investigate, not 3–6 month recommendations; listing checks do not prove liquidity.</p>
        <LeadHealth health={scBoard.ideas_health} />
        <Track sc={scBoard.ideas_scorecard} />

      {!leadsAvailable ? (
        <div className="bideas__empty bideas__empty--reject"><p className="bideas__emptyhead">News-lead feed unavailable on this engine.</p></div>
      ) : live.length === 0 ? (
        <div className="bideas__empty bideas__empty--reject">
          <p className="bideas__emptyhead">No live news leads.</p>
          <p>{leadEmptyMessage(scBoard.ideas_health)}</p>
        </div>
      ) : (
        <>
          <div className="bideas__top">
            {top.map((i) => <IdeaCard key={i.idea_id} idea={i} />)}
          </div>
          {more.length > 0 && (
            <section className="bideas__more">
              <h3 className="bideas__morehead">More ideas</h3>
              {more.map((i) => <CompactIdea key={i.idea_id} idea={i} />)}
            </section>
          )}
        </>
      )}

      {cooling.length > 0 && (
        <section className="bideas__cooling">
          <h3 className="bideas__coolhead">Cooling off <span className="bideas__coolsub">— surfaced earlier, past their shelf life</span></h3>
          {cooling.slice(0, 6).map((i) => <CompactIdea key={i.idea_id} idea={i} />)}
        </section>
      )}
      </section>
      <p className="bideas__foot">Risk is a distribution, not a score. Qualified cards show expected price return beside the expected loss in the worst 20% of scenarios. Price returns exclude dividends, borrow costs, fees, and taxes; pre-data probabilities stay labelled until enough exact-horizon, benchmark-covered outcomes resolve.</p>
    </div>
  )
}

function Header({ subtitle, countLabel }: { subtitle: string; countLabel?: string | null }) {
  return (
    <header className="bideas__head">
      <div className="bideas__title">
        <span className="bideas__dot" aria-hidden />
        <span className="bideas__titlemain">Ideas</span>
        <span className="bideas__sub">{subtitle}</span>
      </div>
      {countLabel && <span className="bideas__count">{countLabel}</span>}
    </header>
  )
}

// The skim's honest track record — one quiet line. No price, no P&L: surfaced/run counts, how the deep
// machine graded the runs (only once enough have resolved, per §19), and the vote tally.
function Track({ sc }: { sc?: IdeasScorecard }) {
  if (!sc || sc.surfaced_total === 0) return null
  const parts = [`${sc.surfaced_total} surfaced`, `${sc.promoted_total} run through the machine`]
  if (sc.resolved >= 3) parts.push(`it backed ${sc.machine_confirmed} of ${sc.resolved}`)
  const votes = sc.up_votes || sc.down_votes ? ` · you rated ${sc.up_votes} good, ${sc.down_votes} off` : ''
  return <div className="bideas__track">Track record — {parts.join(' · ')}{votes}</div>
}
