import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { plainRoute } from '../../lib/plain'
import { useStore } from '../../lib/store'
import type { BoardSignal, BoardThesis } from '../../lib/types'

// The Idea Pipeline — the screener's funnel board, reading ONLY the canonical board index (plus
// live runs). Buckets mirror the routing doctrine: Inbox → In gauntlet → Parked → Watchlist →
// Provisional → Full machine → Handed off. Cards explain themselves via status_reason /
// routing_reason; the thesis detail view carries the candidates and the Send to Research action.

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

// The autonomous ingester's cheap pre-score, as a small colored pill. Green = worth a look,
// amber = maybe, faint = low. It is a CHEAP pre-read, not the full materiality score the gauntlet
// computes once you check the item.
function TriagePill({ score }: { score?: number | null }) {
  if (score == null) return null
  const tone = score >= 70 ? 'var(--live)' : score >= 40 ? '#d2a13f' : 'var(--text-faint)'
  return (
    <span className="pcard__chip pcard__chip--num" style={{ color: tone, borderColor: tone }} title={`How worth-a-look the auto-scan judged this: ${score} out of 100 (a quick first read, not the full check)`}>
      {score}
    </span>
  )
}

function SignalCard({ s, onRelaunch }: { s: BoardSignal; onRelaunch?: (id: string) => void }) {
  return (
    <div className="pcard">
      <div className="pcard__head">
        <span className="pcard__chip">{s.source_name || 'event'}{s.source_grade ? ` · ${s.source_grade}` : ''}</span>
        {typeof s.materiality_score === 'number' && <span className="pcard__chip pcard__chip--num" title={`How much this event matters: ${s.materiality_score} out of 100`}>M {s.materiality_score}</span>}
      </div>
      <div className="pcard__headline">{s.headline}</div>
      {s.status_reason && <div className="pcard__why">{s.status_reason}</div>}
      <div className="pcard__meta">
        <span>{fmtTs(s.processed_at)}</span>
        {s.status === 'PARK' && onRelaunch && (
          <button className="btn btn--ghost pcard__act" onClick={() => onRelaunch(s.signal_id)} title="The checks said wait — run it anyway (your call)">run anyway ▸</button>
        )}
      </div>
    </div>
  )
}

function ThesisCard({ t, onOpen }: { t: BoardThesis; onOpen: (id: string) => void }) {
  return (
    <div className="pcard pcard--thesis" onClick={() => onOpen(t.thesis_id)}>
      <div className="pcard__head">
        <span className="pcard__chip">{t.horizon ? t.horizon.replace(/_/g, ' ') : 'idea'}</span>
        <EdgeDial score={t.edge_score} />
      </div>
      <div className="pcard__headline">{t.headline || t.thesis_id}</div>
      {(t.routing_reason || t.status_reason) && <div className="pcard__why">{t.routing_reason || t.status_reason}</div>}
      {t.convergence_trigger && (
        <div className="pcard__trigger" title="What would make the market notice this — and when">⚡ {t.convergence_trigger}{t.trigger_date_range ? ` · ${t.trigger_date_range}` : ''}</div>
      )}
      <div className="pcard__meta">
        <span>{t.candidate_count ? `${t.candidate_count} compan${t.candidate_count === 1 ? 'y' : 'ies'} found` : 'no companies yet'}</span>
        <span className="pcard__open">open ▸</span>
      </div>
    </div>
  )
}

function ThesisDetail() {
  const detail = useStore((s) => s.scThesisDetail)
  const close = useStore((s) => s.closeThesisDetail)
  const sendToResearch = useStore((s) => s.sendToResearch)
  const openCallFile = useStore((s) => s.openCallFile)
  const [confirmFor, setConfirmFor] = useState<string | null>(null)
  if (!detail?.thesis) return null
  const t = detail.thesis
  const meta = t.meta || {}
  const m05 = t.M0_5 || {}
  const m065 = t.M0_6_5 || {}
  const m066 = t.M0_6_6 || {}
  const cands = detail.candidates?.candidates || []
  const handedOff = new Set((detail.handoffs || []).map((h: any) => h.ticker))
  return (
    <div className="tdetail" onClick={() => setConfirmFor(null)}>
      <div className="tdetail__top">
        <button className="btn btn--ghost" onClick={close}>← back</button>
        <span className={`chip tdetail__status tdetail__status--${meta.status}`}>{plainRoute(meta.status)}</span>
        {typeof m066.final_score === 'number' && <EdgeDial score={m066.final_score} />}
        <span className="tdetail__id">{meta.thesis_id}</span>
      </div>
      <div className="tdetail__headline">{t.headline}</div>

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

export function PipelineBoard() {
  const board = useStore((s) => s.scBoard)
  const refresh = useStore((s) => s.scRefreshBoard)
  const close = useStore((s) => s.closePipeline)
  const detail = useStore((s) => s.scThesisDetail)
  const openThesisDetail = useStore((s) => s.openThesisDetail)
  const relaunchSignal = useStore((s) => s.relaunchSignal)
  const scSelectSignal = useStore((s) => s.scSelectSignal)
  const submitFromInbox = useStore((s) => s.submitSignal)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const buckets = useMemo(() => {
    const signals = board?.signals || []
    const theses = board?.theses || []
    const live = new Set((board?.live || []).filter((l) => l.kind === 'signal').map((l) => l.subjectId))
    const thesisBySignal = new Map(theses.map((t) => [t.signal_id, t]))
    const watch = (t: BoardThesis) => ['watchlist_no_source', 'watchlist_no_world_change', 'watchlist_no_edge'].includes(t.status)
    return {
      // ranked by the ingester's pre-triage score (highest first); manual-sweep rows (no score) sink below
      inbox: (board?.inbox || []).filter((r) => !r.consumed).slice().sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1)),
      gauntlet: signals.filter((s) => live.has(s.signal_id)),
      parked: signals.filter((s) => !live.has(s.signal_id) && (s.status === 'PARK' || s.status === 'LOG' || s.status === 'suppress') && !thesisBySignal.get(s.signal_id)),
      watchlist: [
        ...theses.filter(watch),
        ...signals.filter((s) => s.status === 'watchlist_no_source' && !s.thesis_id),
      ] as (BoardThesis | BoardSignal)[],
      provisional: theses.filter((t) => t.status === 'provisional'),
      fullMachine: theses.filter((t) => t.status === 'full_machine'),
      handedOff: board?.handoffs || [],
    }
  }, [board])

  return (
    <motion.div className="pipeline" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div>
          <div className="pipeline__title">Idea board</div>
          <div className="pipeline__sub">
            {board?.counts
              ? [
                  `${board.counts.signals_total ?? 0} event${(board.counts.signals_total ?? 0) === 1 ? '' : 's'} checked`,
                  `${board.counts.provisional ?? 0} early idea${(board.counts.provisional ?? 0) === 1 ? '' : 's'}`,
                  `${board.counts.full_machine ?? 0} strong idea${(board.counts.full_machine ?? 0) === 1 ? '' : 's'}`,
                  `${board.counts.handed_off ?? 0} sent to research`,
                ].join(' · ')
              : 'news goes in on the left, checked step by step, and comes out as ideas on the right'}
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
        <div className="pipeline__lanes">
          <div className="plane">
            <div className="plane__title" title="News the system pulled and scored, waiting for you to pick what to check">Inbox <span className="plane__count">{buckets.inbox.length}</span></div>
            {board?.counts && (board.counts.news_seen_today ?? 0) > 0 && (
              <div className="plane__firehose" title="What the automatic news scan did today: how many it read, how many it kept for you, how many it dropped as not worth it">
                today: read {board.counts.news_seen_today ?? 0} · kept {board.counts.news_picked_today ?? 0} · dropped {board.counts.news_dropped_today ?? 0}
              </div>
            )}
            {buckets.inbox.map((r) => (
              <div key={r.inbox_id} className="pcard">
                <div className="pcard__head">
                  <TriagePill score={r.triage_score} />
                  <span className="pcard__chip">{r.source_name}</span>
                  {r.region && r.region !== 'GLOBAL' && <span className="pcard__chip" style={{ color: 'var(--text-faint)' }}>{r.region}</span>}
                  {r.dedup_status === 'possible_duplicate' && <span className="pcard__chip" style={{ color: 'var(--text-faint)' }} title="This may be the same story we have already seen">maybe seen before</span>}
                </div>
                <div className="pcard__headline">{r.headline}</div>
                {(r.triage_reason || r.prelim_note) && <div className="pcard__why">{r.triage_reason || r.prelim_note}</div>}
                <div className="pcard__meta">
                  <span>{fmtTs(r.found_at)}</span>
                  <button className="btn btn--ghost pcard__act" onClick={() => void submitFromInbox({ headline: r.headline, source_url: r.url, source_name: r.source_name, input_nature: r.input_nature || 'news_headline' })}>check it ▸</button>
                </div>
              </div>
            ))}
            {!buckets.inbox.length && <div className="plane__empty">Empty — the news scan fills this automatically; or click "Find news" up top</div>}
          </div>

          <div className="plane">
            <div className="plane__title" title="Events going through the checks right now">Being checked <span className="plane__count">{buckets.gauntlet.length}</span></div>
            {buckets.gauntlet.map((s) => (
              <div key={s.signal_id} onClick={() => { void scSelectSignal(s.signal_id); close() }}>
                <SignalCard s={s} />
              </div>
            ))}
            {!buckets.gauntlet.length && <div className="plane__empty">Nothing being checked right now</div>}
          </div>

          <div className="plane">
            <div className="plane__title" title="Events the checks decided not to pursue — kept here so nothing is lost">Set aside <span className="plane__count">{buckets.parked.length}</span></div>
            {buckets.parked.map((s) => (
              <SignalCard key={s.signal_id} s={s} onRelaunch={(id) => void relaunchSignal(id)} />
            ))}
            {!buckets.parked.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title" title="Interesting, but something is missing — a trusted source, a real change, or an angle the market doesn't already know">Watching <span className="plane__count">{buckets.watchlist.length}</span></div>
            {buckets.watchlist.map((x: any) =>
              x.thesis_id && x.status?.startsWith('watchlist') && 'edge_score' in x ? (
                <ThesisCard key={x.thesis_id} t={x} onOpen={openThesisDetail} />
              ) : (
                <SignalCard key={x.signal_id || x.thesis_id} s={x} />
              ),
            )}
            {!buckets.watchlist.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title" title="Passed the checks, but the case is not fully proven yet">Early ideas <span className="plane__count">{buckets.provisional.length}</span></div>
            {buckets.provisional.map((t) => (
              <ThesisCard key={t.thesis_id} t={t} onOpen={openThesisDetail} />
            ))}
            {!buckets.provisional.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title" title="Passed every check — ready to send to deep research">Strong ideas <span className="plane__count">{buckets.fullMachine.length}</span></div>
            {buckets.fullMachine.map((t) => (
              <ThesisCard key={t.thesis_id} t={t} onOpen={openThesisDetail} />
            ))}
            {!buckets.fullMachine.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title" title="Ideas whose memo is already in a company's data folder, ready for a deep research run">Sent to research <span className="plane__count">{buckets.handedOff.length}</span></div>
            {buckets.handedOff.map((h) => (
              <div key={h.handoff_id} className="pcard">
                <div className="pcard__head"><span className="pcard__chip mono">{h.ticker}</span></div>
                <div className="pcard__why">memo saved at {h.seeded_path}</div>
                <div className="pcard__meta"><span>{fmtTs(h.handed_off_at)}</span></div>
              </div>
            ))}
            {!buckets.handedOff.length && <div className="plane__empty">—</div>}
          </div>
        </div>
      )}
    </motion.div>
  )
}
