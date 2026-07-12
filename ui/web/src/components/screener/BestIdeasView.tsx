// "Best ideas" — the PM-skim tab. A sibling of Themes in the wire's tab row. It reads the server's
// board.ideas feed (the cheap free-LLM pass over the ranked wire top-N) and renders the best 1-2 tradable
// stock ideas as dead-simple cards, with a one-click escalation to the paid gauntlet.
//
// Deliberate honesty, per the doctrine: the conviction is labelled a "pre-edge read", never the locked edge
// score (§7); a macro/commodity bet is flagged, not dressed as a single-name pick (§14); and when nothing
// clears the bar the view SAYS SO (§24, the Rejector) instead of manufacturing a pick. It fails closed on a
// missing ideas array (deploy skew, DESIGN.md §5), ships loading/empty/error states (§4), and — because it
// auto-refreshes on the board poll (a live tick) — never uses a mount/exit animation that a re-render could
// freeze (DESIGN.md §3, the LiveFeed rule); the only motion is a one-shot CSS fade keyed per idea.

import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import type { BoardIdea } from '../../lib/types'

const MACRO_TYPES = new Set(['macro_conditional', 'commodity_conditional', 'policy_conditional', 'fx_rates', 'liquidity_positioning'])

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

      <div className="bidea__tags">
        {idea.direction === 'pair' && idea.pair_with && <span className="bidea__tag">short {idea.pair_with}</span>}
        {macro && <span className="bidea__tag bidea__tag--warn">{prettyType(idea.thesis_type)} bet — not a pure stock pick</span>}
        {idea.priced_in === 'room' && <span className="bidea__tag">may not be priced in yet</span>}
        {idea.priced_in === 'priced' && <span className="bidea__tag">may already be priced in</span>}
        <span className={`bidea__tag bidea__tag--cov${rated ? ' bidea__tag--rated' : ''}`}>
          {rated
            ? `already rated${pc?.latest_decision ? ` · ${pc.latest_decision}` : ''}`
            : pc?.data_pool_present ? 'data on file — never rated' : 'fresh — never rated'}
        </span>
      </div>

      <div className="bidea__foot">
        <div className="bidea__read" title="A surface read from the skim — NOT the locked edge score the full machine computes.">
          <span className="bidea__readlabel">read on it</span>
          <span className="bidea__readnum">{idea.conviction}<span className="bidea__readden">/100</span></span>
          <span className="bidea__bar" aria-hidden><span className="bidea__barfill" style={{ width: `${Math.max(0, Math.min(100, idea.conviction))}%` }} /></span>
        </div>
        <PromoteButton idea={idea} />
      </div>
    </article>
  )
}

function CompactIdea({ idea }: { idea: BoardIdea }) {
  return (
    <div className="bidea-c">
      <span className={`bidea-c__side bidea-c__side--${idea.direction}`}>{sideLabel(idea.direction)}</span>
      <span className="bidea-c__ticker">{idea.ticker}</span>
      <span className="bidea-c__reason">{idea.reason}</span>
      <span className="bidea-c__read" title="pre-edge read on it">{idea.conviction}</span>
      <PromoteButton idea={idea} compact />
    </div>
  )
}

export function BestIdeasView() {
  const scBoard = useStore((s) => s.scBoard)
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
    return (
      <div className="bideas">
        <Header subtitle="reading the top-ranked wire…" count={null} />
        <div className="bideas__top"><div className="bidea bidea--skeleton" /><div className="bidea bidea--skeleton" /></div>
      </div>
    )
  }

  const ideas = scBoard.ideas
  // Fail closed — an engine build before this feature sends no ideas array. The tab shouldn't even appear,
  // but guard anyway so an old engine can never crash the pane.
  if (!Array.isArray(ideas)) {
    return (
      <div className="bideas">
        <Header subtitle="not available on this engine yet" count={null} />
        <p className="bideas__empty">The best-ideas skim isn't running on the connected engine. It turns on when the engine is updated.</p>
      </div>
    )
  }

  const live = ideas.filter((i) => !i.stale)
  const cooling = ideas.filter((i) => i.stale)
  const top = live.slice(0, 2)
  const more = live.slice(2)
  const updated = scBoard.generated_at ? agoLabel(scBoard.generated_at) : ''

  return (
    <div className="bideas">
      <Header subtitle={`from today's top-ranked wire · read ${updated || 'just now'} · $0`} count={live.length} />

      {live.length === 0 ? (
        <div className="bideas__empty bideas__empty--reject">
          <p className="bideas__emptyhead">Nothing on the wire clears the bar right now.</p>
          <p>The desk skims the top-ranked items and surfaces an idea only when there's a specific, liquid stock to play with a live reason. Most of the time there isn't — and saying "nothing here" is a real answer, not a miss. Check back as fresh news lands.</p>
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

      <p className="bideas__foot">A surface skim — a fast read of the top of the wire, not a deep check. The "read on it" number is a hunch, not the locked edge score. Run the full machine to verify before you act.</p>
    </div>
  )
}

function Header({ subtitle, count }: { subtitle: string; count: number | null }) {
  return (
    <header className="bideas__head">
      <div className="bideas__title">
        <span className="bideas__dot" aria-hidden />
        <span className="bideas__titlemain">Best ideas</span>
        <span className="bideas__sub">{subtitle}</span>
      </div>
      {count != null && <span className="bideas__count">{count === 0 ? 'none clear the bar' : `${count} clear the bar`}</span>}
    </header>
  )
}
