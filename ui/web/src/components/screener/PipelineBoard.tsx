import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { plainRoute } from '../../lib/plain'
import { useStore } from '../../lib/store'
import type { BoardThesis } from '../../lib/types'
import { BookMomentumBanner, CheckpointTimeline, ConvictionStrip } from './ConvictionCard'

// "Recent runs" — the screener's run history. Every event you put through the checks shows up here,
// newest first; one click reopens the full analysis (with the hand-move + send-to-research controls).
// Reads ONLY the canonical board index. The triage → idea funnel this panel used to host now lives as
// ONE unified stream on the left (the Events rail): you filter, pick and run an event there, and it
// lands here as a checked run.

// where the human can put an idea by hand (plus "engine" = follow the checks again)
const MOVE_LANES: { to: 'watchlist' | 'provisional' | 'full_machine'; label: string }[] = [
  { to: 'watchlist', label: 'Watching' },
  { to: 'provisional', label: 'Early ideas' },
  { to: 'full_machine', label: 'Strong ideas' },
]
const effStatus = (t: BoardThesis) => t.effective_status || t.status

const fmtTs = (s?: string | null) => (s ? s.replace('T', ' ').replace(/:\d\d(\.\d+)?Z?$/, '') : '')

function EdgeDial({ score }: { score: number | null | undefined }) {
  if (score == null) return null
  const angle = Math.round((score / 100) * 360)
  return (
    <div className="edgedial" title={`Idea strength ${score}/100 — how confident the checks are that the market is missing this`} style={{ ['--deg' as any]: `${angle}deg` }}>
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
        <button className="btn btn--ghost" onClick={close}>← back</button>
        <span className={`chip tdetail__status tdetail__status--${bt ? effStatus(bt) : meta.status}`}>{plainRoute(bt ? effStatus(bt) : meta.status)}</span>
        {bt?.override && (
          <span className="pcard__chip pcard__chip--moved" title={`Your move${bt.override.reason ? ` — "${bt.override.reason}"` : ''}`}>
            moved by you · the checks said: {plainRoute(bt.status)}
          </span>
        )}
        {typeof m066.final_score === 'number' && <EdgeDial score={m066.final_score} />}
        <span className="tdetail__id">{meta.thesis_id}</span>
      </div>
      <div className="tdetail__headline">{t.headline}</div>
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
        {MOVE_LANES.map((l) => {
          const here = bt ? effStatus(bt) === (l.to === 'watchlist' ? 'watchlist_manual' : l.to) || (l.to === 'watchlist' && effStatus(bt).startsWith('watchlist')) : false
          return (
            // no board entry (bt missing) → moves are disabled rather than blind: a move needs the
            // board's effective status to mean anything
            <button key={l.to} className={`btn btn--ghost tdetail__move-btn${here ? ' tdetail__move-btn--here' : ''}`} disabled={here || !bt} onClick={() => void moveThesis(meta.thesis_id, l.to)}>
              {l.label}
            </button>
          )
        })}
        {bt?.override && (
          <button className="btn btn--ghost tdetail__move-btn" onClick={() => void moveThesis(meta.thesis_id, 'engine')} title="Clear your move and show this idea where the checks put it">
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
      <table className="tdetail__cands">
        <thead>
          <tr><th>#</th><th>Ticker</th><th>Company</th><th>Buy or short?</th><th title="How directly this company feels the event, 0–100">Exposure</th><th title="Are its filings already in the data folder?">Filings</th><th></th></tr>
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
                <td className="mono">{c.exposure_score}/100</td>
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

// nicer absolute timestamp for the history list — "Jun 12, 01:39 PM"
const fmtWhen = (s?: string | null) => {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? fmtTs(s) : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Every event you've actually put through the checks, NEWEST FIRST, as a flat revisit list. One click
// reopens the full analysis; "Replay" drops the run back onto the gauntlet. Reads only the canonical
// board (signals = the runs, joined to their theses for the edge score + company count).
function RecentChecks({ onOpen, onReplay }: { onOpen: (thesisId: string) => void; onReplay: (sigId: string) => void }) {
  const board = useStore((s) => s.scBoard)
  const restoreConviction = useStore((s) => s.restoreConviction)
  const [showArchived, setShowArchived] = useState(false)
  // Live ideas rank by conviction (climbing ideas float up); archived (killed/expired) drop to a tray.
  const { live, archived } = useMemo(() => {
    const tBySig = new Map((board?.theses || []).map((t) => [t.signal_id, t]))
    const all = (board?.signals || []).filter((s) => s.processed_at).map((s) => ({ s, t: tBySig.get(s.signal_id) }))
    const arch = all.filter((r) => r.t?.conviction?.archived)
    const liveRows = all.filter((r) => !r.t?.conviction?.archived)
    liveRows.sort((a, b) => {
      const ra = a.t?.conviction?.rank_score, rb = b.t?.conviction?.rank_score
      if (ra != null && rb != null && ra !== rb) return rb - ra // higher conviction first
      if (ra != null && rb == null) return -1
      if (rb != null && ra == null) return 1
      return (a.s.processed_at || '') < (b.s.processed_at || '') ? 1 : -1 // else newest
    })
    arch.sort((a, b) => ((a.s.processed_at || '') < (b.s.processed_at || '') ? 1 : -1))
    return { live: liveRows, archived: arch }
  }, [board])

  if (!live.length && !archived.length) {
    return (
      <div className="recent__empty">
        No checks yet. Open a news event on the left of the Screener and press “Run the checks” — every event you run shows up here, ranked by how the idea is holding up, to reopen any time.
      </div>
    )
  }
  const liveRow = ({ s, t }: { s: any; t?: BoardThesis }) => {
    const outcome = plainRoute(t ? effStatus(t) : s.status)
    return (
      <div key={s.signal_id} className="recentrow">
        <EdgeDial score={t?.conviction?.edge_score_live ?? t?.edge_score} />
        <div className="recentrow__main">
          <div className="recentrow__headline">{s.headline}</div>
          <div className="recentrow__meta">
            {s.source_name && <span className="recentrow__src">{s.source_name}</span>}
            <span>{fmtWhen(s.processed_at)}</span>
            {outcome && <span className="recentrow__outcome">{outcome}</span>}
            {t?.candidate_count ? <span>{t.candidate_count} compan{t.candidate_count === 1 ? 'y' : 'ies'} found</span> : null}
          </div>
        </div>
        <div className="recentrow__actions">
          {t && <button className="btn btn--ghost recentrow__act" onClick={() => onOpen(t.thesis_id)}>Open analysis ▸</button>}
          <button className="btn btn--ghost recentrow__act" onClick={() => onReplay(s.signal_id)} title="Show this run playing out on the board">Replay</button>
        </div>
        {t?.conviction && <ConvictionStrip conv={t.conviction} />}
      </div>
    )
  }
  return (
    <div className="recent">
      <div className="recent__lead">Your live book — ideas ranked by how strongly they’re holding up. Open one to re-read it, or replay it on the board.</div>
      {board?.book_momentum && <BookMomentumBanner m={board.book_momentum} />}
      {live.map(liveRow)}
      {archived.length > 0 && (
        <div className="archived">
          <button className="archived__head" onClick={() => setShowArchived((v) => !v)} aria-expanded={showArchived}>
            <span className="archived__chev" data-open={showArchived}>›</span>
            Archived — {archived.length} idea{archived.length === 1 ? '' : 's'} closed by their own rules (kept on record)
          </button>
          {showArchived && archived.map(({ s, t }) => (
            <div key={s.signal_id} className="archivedrow">
              <EdgeDial score={t?.conviction?.edge_score_live ?? t?.edge_score} />
              <div className="recentrow__main">
                <div className="recentrow__headline">{s.headline}</div>
                <div className="archivedrow__note">{t?.conviction?.plain_note || (t?.conviction?.state === 'expired_unproven' ? 'The window closed without proof.' : 'Killed by its own rule.')}</div>
              </div>
              <div className="recentrow__actions">
                {t && <button className="btn btn--ghost recentrow__act" onClick={() => onOpen(t.thesis_id)}>Open ▸</button>}
                {t && <button className="btn btn--ghost recentrow__act" onClick={() => void restoreConviction(t.thesis_id)} title="Re-open this idea onto the live book">↩ restore</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// The Recent-runs drawer: the analysis deep-dive when an idea is open, else the run history. Slides in
// from the right; opened from the top bar, closed with ✕.
export function PipelineBoard() {
  const board = useStore((s) => s.scBoard)
  const refresh = useStore((s) => s.scRefreshBoard)
  const close = useStore((s) => s.closePipeline)
  const detail = useStore((s) => s.scThesisDetail)
  const openThesisDetail = useStore((s) => s.openThesisDetail)
  const scSelectSignal = useStore((s) => s.scSelectSignal)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <motion.div className="pipeline" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div>
          <div className="pipeline__title">Recent runs</div>
          <div className="pipeline__sub">
            {board?.counts
              ? [
                  `${board.counts.signals_total ?? 0} event${(board.counts.signals_total ?? 0) === 1 ? '' : 's'} checked`,
                  `${board.counts.provisional ?? 0} early idea${(board.counts.provisional ?? 0) === 1 ? '' : 's'}`,
                  `${board.counts.full_machine ?? 0} strong idea${(board.counts.full_machine ?? 0) === 1 ? '' : 's'}`,
                  `${board.counts.handed_off ?? 0} sent to research`,
                ].join(' · ')
              : 'every event you check on the left shows up here, newest first'}
          </div>
        </div>
        <div className="pipeline__tools">
          <button className="btn btn--ghost" onClick={() => void refresh()}>refresh</button>
          <button className="btn btn--ghost" onClick={close}>✕</button>
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
