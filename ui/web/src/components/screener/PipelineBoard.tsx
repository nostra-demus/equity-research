import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { displayHeadline, originalHeadline, plainRoute } from '../../lib/plain'
import { useStore } from '../../lib/store'
import type { BoardThesis } from '../../lib/types'
import { BookHealth, CheckpointTimeline, ConvictionStrip, NextCheck, ProofProgress, Sparkline, StancePill, VelocityBadge, convDir } from './ConvictionCard'
import { BookFilters, type BookRow, bookComparator, bookFiltersActive, emptyBookFilters, matchesBookFilters } from './BookFilters'

// "Recent runs" — the screener's live book. Every event you put through the checks becomes an idea
// card, ranked by conviction, filterable + sortable. One click reopens the full analysis; "Replay"
// drops the run back onto the board. Reads ONLY the canonical board index. The triage → idea funnel
// this panel used to host now lives as ONE unified stream on the left (the Events rail).

// where the human can put an idea by hand (plus "engine" = follow the checks again)
const MOVE_LANES: { to: 'watchlist' | 'provisional' | 'full_machine'; label: string }[] = [
  { to: 'watchlist', label: 'Watching' },
  { to: 'provisional', label: 'Early ideas' },
  { to: 'full_machine', label: 'Strong ideas' },
]
const effStatus = (t: BoardThesis) => t.effective_status || t.status

const fmtTs = (s?: string | null) => (s ? s.replace('T', ' ').replace(/:\d\d(\.\d+)?Z?$/, '') : '')

// nicer absolute timestamp for the history list — "Jun 12, 01:39 PM"
const fmtWhen = (s?: string | null) => {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? fmtTs(s) : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// The score ring — conviction 0–100 as a conic dial, the ring colour encoding which way the idea is
// moving (teal up, red down, quiet grey while it's still awaiting its first check).
function EdgeDial({ score, dir = 'flat', size = 38 }: { score: number | null | undefined; dir?: 'up' | 'down' | 'await' | 'flat'; size?: number }) {
  if (score == null) return null
  const angle = Math.round((score / 100) * 360)
  return (
    <div
      className={`edgedial edgedial--${dir}`}
      title={`Idea strength ${score}/100 — how confident the checks are that the market is missing this`}
      style={{ ['--deg' as any]: `${angle}deg`, ['--dial-size' as any]: `${size}px` }}
    >
      <span className="edgedial__num">{score}</span>
    </div>
  )
}

function ThesisDetail() {
  const detail = useStore((s) => s.scThesisDetail)
  const close = useStore((s) => s.closeThesisDetail)
  const sendToResearch = useStore((s) => s.sendToResearch)
  const openCallFile = useStore((s) => s.openCallFile)
  const board = useStore((s) => s.scBoard)
  const moveThesis = useStore((s) => s.moveThesis)
  const restoreConviction = useStore((s) => s.restoreConviction)
  const [confirmFor, setConfirmFor] = useState<string | null>(null)
  if (!detail?.thesis) return null
  const t = detail.thesis
  const meta = t.meta || {}
  // the board carries the human-move state (effective status + override marker) for this thesis
  const bt = board?.theses.find((x) => x.thesis_id === meta.thesis_id)
  const m05 = t.M0_5 || {}
  const m065 = t.M0_6_5 || {}
  const m066 = t.M0_6_6 || {}
  const cands = detail.candidates?.candidates || []
  const handedOff = new Set((detail.handoffs || []).map((h: any) => h.ticker))
  return (
    <div className="tdetail" onClick={() => setConfirmFor(null)}>
      <div className="tdetail__top">
        <button className="btn btn--ghost tdetail__back" onClick={close}>← back</button>
        <span className={`chip tdetail__status tdetail__status--${bt ? effStatus(bt) : meta.status}`}>{plainRoute(bt ? effStatus(bt) : meta.status)}</span>
        {bt?.override && (
          <span className="pcard__chip pcard__chip--moved" title={`Your move${bt.override.reason ? ` — "${bt.override.reason}"` : ''}`}>
            moved by you · the checks said: {plainRoute(bt.status)}
          </span>
        )}
        {typeof m066.final_score === 'number' && <EdgeDial score={m066.final_score} dir={convDir(bt?.conviction)} size={34} />}
        <span className="tdetail__id">{meta.thesis_id}</span>
      </div>
      <div className="tdetail__headline" title={originalHeadline(t) || undefined}>{displayHeadline(t)}</div>
      {bt?.conviction && <ConvictionStrip conv={bt.conviction} />}
      {detail.conviction?.checkpoints?.length ? (
        <section className="tdetail__cptl">
          <h4>{bt?.conviction?.archived ? 'The proof points — how this idea closed' : 'The proof points — what we are waiting on'}</h4>
          <CheckpointTimeline detail={detail.conviction} />
          {bt?.conviction?.archived && (
            <button className="btn btn--ghost tdetail__restore" onClick={() => void restoreConviction(meta.thesis_id)} title="Re-open this idea onto the live book and keep monitoring it">
              ↩ restore to the live book
            </button>
          )}
        </section>
      ) : null}

      <div className="tdetail__move" onClick={(e) => e.stopPropagation()}>
        <span className="tdetail__move-label" title="Put this idea where YOU think it belongs. Your move is marked on the card; the checks' own verdict stays visible, and nothing the engine wrote is changed.">
          move this idea:
        </span>
        <div className="seg tdetail__lanes" role="group" aria-label="Move this idea">
          {MOVE_LANES.map((l) => {
            const here = bt ? effStatus(bt) === (l.to === 'watchlist' ? 'watchlist_manual' : l.to) || (l.to === 'watchlist' && effStatus(bt).startsWith('watchlist')) : false
            return (
              // no board entry (bt missing) → moves are disabled rather than blind: a move needs the
              // board's effective status to mean anything
              <button key={l.to} className={`seg__btn${here ? ' seg__btn--on' : ''}`} disabled={here || !bt} onClick={() => void moveThesis(meta.thesis_id, l.to)}>
                {l.label}
              </button>
            )
          })}
        </div>
        {bt?.override && (
          <button className="btn btn--ghost tdetail__follow" onClick={() => void moveThesis(meta.thesis_id, 'engine')} title="Clear your move and show this idea where the checks put it">
            follow the checks again
          </button>
        )}
      </div>

      <div className="tdetail__grid">
        <section>
          <h4>What happened — just the fact</h4>
          <p>{t.M0_1?.event_statement}</p>
        </section>
        <section>
          <h4>What has actually changed</h4>
          <ul>
            {(t.M0_2?.world_changes || []).map((w: any) => (
              <li key={w.id}><b>{w.id}</b> {w.change_description}: {w.quantitative_magnitude} <span className="tdetail__dim">vs {w.baseline_reference}</span></li>
            ))}
          </ul>
        </section>
        <section>
          <h4>When we would drop this idea</h4>
          <p>{m05.falsification_sentence}</p>
        </section>
        <section>
          <h4>Why the market may be missing this</h4>
          <p>{t.M0_6_3?.variant_paragraph}</p>
          {m066.blended_calculation && <p className="tdetail__dim mono">{m066.blended_calculation}</p>}
          {m065.trigger_name && <p>⚡ {m065.trigger_name} <span className="tdetail__dim">{m065.trigger_date_range}</span></p>}
        </section>
      </div>

      <h4 className="tdetail__cands-title">Companies this idea points to</h4>
      <table className="atable tdetail__cands">
        <thead>
          <tr><th>#</th><th>Ticker</th><th>Company</th><th>Buy or short?</th><th className="atable__num" title="How directly this company feels the event, 0–100">Exposure</th><th title="Are its filings already in the data folder?">Filings</th><th></th></tr>
        </thead>
        <tbody>
          {cands.map((c: any, i: number) => {
            const pool = !!c.prior_coverage?.data_pool_present
            const done = handedOff.has(c.ticker)
            return (
              <tr key={c.candidate_id || c.ticker}>
                <td>{i + 1}</td>
                <td className="mono">{c.ticker}</td>
                <td>{c.company_name}<div className="tdetail__dim">{c.exposure_rationale}</div></td>
                <td>{String(c.side || '').replace(/_/g, ' ')}</td>
                <td className="atable__num">{c.exposure_score}/100</td>
                <td><span className="pooldot" style={{ background: pool ? 'var(--live)' : 'var(--text-faint)' }} title={pool ? 'filings are in — deep research can start' : 'no filings yet — add them before research'} /></td>
                <td>
                  {done ? (
                    <span className="tdetail__dim">sent ✓</span>
                  ) : confirmFor === c.ticker ? (
                    <button className="btn btn--amber" onClick={(e) => { e.stopPropagation(); void sendToResearch(meta.thesis_id, c.ticker, pool) }}>
                      yes — send it ▸
                    </button>
                  ) : (
                    <button className="btn btn--ghost" onClick={(e) => { e.stopPropagation(); setConfirmFor(c.ticker) }} title={`Copies this idea's memo into data/${c.ticker}/ for the research team. Starting the deep research run stays a separate click.`}>
                      send to research
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
          {!cands.length && (
            <tr><td colSpan={7} className="tdetail__dim" style={{ padding: '10px 6px' }}>No companies listed — this idea stopped before the company-picking step.</td></tr>
          )}
        </tbody>
      </table>
      {t.run_root && (
        <div className="tdetail__foot">
          <button className="btn btn--ghost" onClick={() => openCallFile(`${t.run_root}/edge-definition/99_edge-definition-synthesis.md`, 'Why this might be mispriced')}>read: why this might be mispriced</button>
          <button className="btn btn--ghost" onClick={() => openCallFile(`${t.run_root}/candidate-surfacing/99_candidate-surfacing-synthesis.md`, 'Company shortlist')}>read: the company shortlist</button>
        </div>
      )}
    </div>
  )
}

// the stage funnel: an overview + a quick filter. Counts come straight from the board; a zero-count
// stage is shown but disabled ("none yet", not broken). Clicking the active stage clears back to All.
function BookFunnel({ counts, stage, onStage }: { counts: Record<string, number>; stage: string; onStage: (s: string) => void }) {
  const segs = [
    { key: '', label: 'All', n: counts.signals_total ?? 0 },
    { key: 'provisional', label: 'Early', n: counts.provisional ?? 0 },
    { key: 'full_machine', label: 'Strong', n: counts.full_machine ?? 0 },
    { key: 'handed_off', label: 'Sent', n: counts.handed_off ?? 0 },
  ]
  return (
    <div className="seg bookfunnel" role="group" aria-label="Filter by stage">
      {segs.map((s) => (
        <button
          key={s.key || 'all'}
          className={`seg__btn${stage === s.key ? ' seg__btn--on' : ''}`}
          disabled={s.key !== '' && s.n === 0}
          aria-pressed={stage === s.key}
          onClick={() => onStage(stage === s.key ? '' : s.key)}
        >
          {s.label} <span className="bookfunnel__n">{s.n}</span>
        </button>
      ))}
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="recent recent--skel" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ideacard ideacard--skeleton">
          <span className="skel skel--dial" />
          <div className="ideacard__body">
            <span className="skel skel--line skel--w70" />
            <span className="skel skel--line skel--w45" />
            <span className="skel skel--bar" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Every event you've put through the checks. Live ideas rank by conviction (climbing ideas float up);
// killed/expired ideas drop to the archived tray. The funnel + filter bar narrow BOTH sets.
function RecentChecks({ onOpen, onReplay }: { onOpen: (thesisId: string) => void; onReplay: (sigId: string) => void }) {
  const board = useStore((s) => s.scBoard)
  const restoreConviction = useStore((s) => s.restoreConviction)
  const filters = useStore((s) => s.scBookFilters)
  const sort = useStore((s) => s.scBookSort)
  const setFilters = useStore((s) => s.setBookFilters)
  const setSort = useStore((s) => s.setBookSort)
  const archivedOpen = useStore((s) => s.scBookArchivedOpen)
  const setArchivedOpen = useStore((s) => s.setBookArchivedOpen)

  const { liveAll, archAll, live, archived, sources, themesAvailable } = useMemo(() => {
    const tBySig = new Map((board?.theses || []).map((t) => [t.signal_id, t]))
    const all: BookRow[] = (board?.signals || []).filter((s) => s.processed_at).map((s) => ({ s, t: tBySig.get(s.signal_id) }))
    const liveAll = all.filter((r) => !r.t?.conviction?.archived)
    const archAll = all.filter((r) => r.t?.conviction?.archived)
    const live = liveAll.filter((r) => matchesBookFilters(r, filters)).sort(bookComparator(sort))
    const archived = archAll.filter((r) => matchesBookFilters(r, filters)).sort((a, b) => ((a.s.processed_at || '') < (b.s.processed_at || '') ? 1 : -1))
    const sources = [...new Set(all.map((r) => r.s.source_name).filter(Boolean))].sort() as string[]
    const themesAvailable = all.some((r) => (r.s.event_types?.length ?? 0) > 0)
    return { liveAll, archAll, live, archived, sources, themesAvailable }
  }, [board, filters, sort])

  // loading — the board has never resolved yet (first open). A manual refresh keeps the prior board,
  // so this skeleton only ever shows on first load, never as a flash on refresh.
  if (!board) return <SkeletonCards />

  // truly empty (no checks at all) — gated on UNFILTERED totals so a filter can't trigger it.
  if (!liveAll.length && !archAll.length) {
    return (
      <div className="recent recent--center">
        <div className="bookempty">
          <div className="bookempty__icon" aria-hidden="true">◷</div>
          <div className="bookempty__title">No checks yet</div>
          <div className="bookempty__body">
            Open a news event on the left of the Screener and press “Run the checks” — every event you run shows up here, ranked by how the idea is holding up, to reopen any time.
          </div>
        </div>
      </div>
    )
  }

  const active = bookFiltersActive(filters)
  const archShown = archived.length > 0 && (archivedOpen || active)
  const nothingMatches = live.length === 0 && archived.length === 0

  const card = ({ s, t }: BookRow, archivedCard = false) => {
    const c = t?.conviction
    const score = c?.edge_score_live ?? t?.edge_score
    const open = () => t && onOpen(t.thesis_id)
    const clickable = !!t
    return (
      <div
        key={s.signal_id}
        className={`ideacard${archivedCard ? ' ideacard--archived' : ''}`}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={clickable ? `Open analysis: ${displayHeadline(s)}` : undefined}
        onClick={clickable ? open : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } } : undefined}
      >
        <div className="ideacard__cluster">
          <EdgeDial score={score} dir={archivedCard ? 'flat' : convDir(c)} size={archivedCard ? 32 : 38} />
          {c && !archivedCard && <VelocityBadge conv={c} compact />}
        </div>
        <div className="ideacard__body">
          <div className="ideacard__topline">
            <div className="ideacard__headline" title={originalHeadline(s) || undefined}>{displayHeadline(s)}</div>
            {t && !archivedCard && (
              <button className="btn btn--ghost ideacard__replay" onClick={(e) => { e.stopPropagation(); onReplay(s.signal_id) }} title="Show this run playing out on the board">
                Replay
              </button>
            )}
            {t && archivedCard && (
              <button className="btn btn--ghost ideacard__replay" onClick={(e) => { e.stopPropagation(); void restoreConviction(t.thesis_id) }} title="Re-open this idea onto the live book">
                ↩ restore
              </button>
            )}
          </div>
          {archivedCard ? (
            <div className="ideacard__note">{c?.plain_note || (c?.state === 'expired_unproven' ? 'The window closed without proof.' : 'Killed by its own rule.')}</div>
          ) : c ? (
            <>
              <div className="ideacard__stance">
                <StancePill conv={c} />
                {c.validated && (c.trajectory?.length ?? 0) > 1 && <Sparkline conv={c} w={88} h={22} />}
                <ProofProgress conv={c} />
              </div>
              <NextCheck conv={c} />
            </>
          ) : null}
          <div className="ideacard__meta">
            {s.source_name && <span className="ideacard__src">{s.source_name}</span>}
            <span>{fmtWhen(s.processed_at)}</span>
            {t?.candidate_count ? <span>{t.candidate_count} compan{t.candidate_count === 1 ? 'y' : 'ies'} found</span> : null}
          </div>
        </div>
        {clickable && !archivedCard && <span className="ideacard__chev" aria-hidden="true">›</span>}
      </div>
    )
  }

  return (
    <>
      <div className="bookctl">
        <BookFunnel counts={board.counts || {}} stage={filters.stage} onStage={(st) => setFilters({ ...filters, stage: st })} />
        <BookFilters value={filters} onChange={setFilters} sort={sort} onSortChange={setSort} sources={sources} themesAvailable={themesAvailable} />
      </div>
      <div className="recent">
        <BookHealth m={board.book_momentum} />
        {active ? (
          <div className="recent__count">
            Showing {live.length} of {liveAll.length} live idea{liveAll.length === 1 ? '' : 's'}
            {archAll.length ? ` · ${archived.length} of ${archAll.length} archived` : ''}
          </div>
        ) : (
          <div className="recent__lead">Your live book — ideas ranked by how strongly they’re holding up. Open one to re-read it, or replay it on the board.</div>
        )}

        {nothingMatches && active && (
          <div className="bookempty bookempty--filtered">
            <div className="bookempty__title">No ideas match these filters</div>
            <div className="bookempty__body">Loosen or clear the filters to see your whole book.</div>
            <button className="btn btn--ghost" onClick={() => setFilters(emptyBookFilters())}>clear filters</button>
          </div>
        )}

        {live.map((r) => card(r))}

        {archAll.length > 0 && (
          <div className="archived">
            <button className="archived__head" onClick={() => setArchivedOpen(!archivedOpen)} aria-expanded={archShown}>
              <span className="archived__chev" data-open={archShown}>›</span>
              {active
                ? `Archived — ${archived.length} of ${archAll.length} match (kept on record)`
                : `Archived — ${archAll.length} idea${archAll.length === 1 ? '' : 's'} closed by their own rules (kept on record)`}
            </button>
            {archShown && (
              <div className="archived__list">
                {archived.map((r) => card(r, true))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// The Recent-runs drawer: the analysis deep-dive when an idea is open, else the live book. Slides in
// from the right; opened from the top bar, closed with ✕.
export function PipelineBoard() {
  const board = useStore((s) => s.scBoard)
  const refresh = useStore((s) => s.scRefreshBoard)
  const close = useStore((s) => s.closePipeline)
  const detail = useStore((s) => s.scThesisDetail)
  const openThesisDetail = useStore((s) => s.openThesisDetail)
  const scSelectSignal = useStore((s) => s.scSelectSignal)
  const [spin, setSpin] = useState(false)

  useEffect(() => {
    void refresh()
    // keep the live book current while it's open: re-pull the board (and the open idea's detail, so
    // its checkpoint timeline updates) every 30s — a check that resolves shows up on its own.
    const id = setInterval(() => {
      void refresh()
      const tid = useStore.getState().scThesisDetail?.thesis?.meta?.thesis_id
      if (tid) void useStore.getState().openThesisDetail(tid)
    }, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  const doRefresh = () => { setSpin(true); void refresh().finally(() => setTimeout(() => setSpin(false), 600)) }

  return (
    <motion.div className="pipeline" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div className="pipeline__titlewrap">
          <div className="pipeline__title">{detail?.thesis ? 'Analysis' : 'Recent runs'}</div>
          <div className="pipeline__sub">{detail?.thesis ? 'one idea, opened up' : 'your live book — every checked event, ranked by how it’s holding up'}</div>
        </div>
        <div className="pipeline__tools">
          <button className={`btn btn--ghost pipeline__refresh${spin ? ' is-spinning' : ''}`} onClick={doRefresh} title="Re-pull the board now">↻</button>
          <button className="btn btn--ghost" onClick={close} title="Close">✕</button>
        </div>
      </div>

      {detail?.thesis ? (
        <ThesisDetail />
      ) : (
        <RecentChecks onOpen={openThesisDetail} onReplay={(id) => { void scSelectSignal(id); close() }} />
      )}
    </motion.div>
  )
}
