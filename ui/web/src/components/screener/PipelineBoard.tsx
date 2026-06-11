import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
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
    <div className="edgedial" title={`Edge confidence ${score}/100`} style={{ ['--deg' as any]: `${angle}deg` }}>
      <span className="edgedial__num">{score}</span>
    </div>
  )
}

function SignalCard({ s, onRelaunch }: { s: BoardSignal; onRelaunch?: (id: string) => void }) {
  return (
    <div className="pcard">
      <div className="pcard__head">
        <span className="pcard__chip">{s.source_name || 'signal'}{s.source_grade ? ` · ${s.source_grade}` : ''}</span>
        {typeof s.materiality_score === 'number' && <span className="pcard__chip pcard__chip--num" title="Materiality 0–100">M {s.materiality_score}</span>}
      </div>
      <div className="pcard__headline">{s.headline}</div>
      {s.status_reason && <div className="pcard__why">{s.status_reason}</div>}
      <div className="pcard__meta">
        <span>{fmtTs(s.processed_at)}</span>
        {s.status === 'PARK' && onRelaunch && (
          <button className="btn btn--ghost pcard__act" onClick={() => onRelaunch(s.signal_id)} title="Human override: run Phase 1 despite the PARK band">override ▸ run</button>
        )}
      </div>
    </div>
  )
}

function ThesisCard({ t, onOpen }: { t: BoardThesis; onOpen: (id: string) => void }) {
  return (
    <div className="pcard pcard--thesis" onClick={() => onOpen(t.thesis_id)}>
      <div className="pcard__head">
        <span className="pcard__chip">{t.horizon ? t.horizon.replace(/_/g, ' ') : 'thesis'}</span>
        <EdgeDial score={t.edge_score} />
      </div>
      <div className="pcard__headline">{t.headline || t.thesis_id}</div>
      {(t.routing_reason || t.status_reason) && <div className="pcard__why">{t.routing_reason || t.status_reason}</div>}
      {t.convergence_trigger && (
        <div className="pcard__trigger" title="Convergence trigger">⚡ {t.convergence_trigger}{t.trigger_date_range ? ` · ${t.trigger_date_range}` : ''}</div>
      )}
      <div className="pcard__meta">
        <span>{t.candidate_count ? `${t.candidate_count} candidate${t.candidate_count === 1 ? '' : 's'}` : 'no candidates yet'}</span>
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
        <span className={`chip tdetail__status tdetail__status--${meta.status}`}>{String(meta.status || '').replace(/_/g, ' ')}</span>
        {typeof m066.final_score === 'number' && <EdgeDial score={m066.final_score} />}
        <span className="tdetail__id">{meta.thesis_id}</span>
      </div>
      <div className="tdetail__headline">{t.headline}</div>

      <div className="tdetail__grid">
        <section>
          <h4>Event (sterile)</h4>
          <p>{t.M0_1?.event_statement}</p>
        </section>
        <section>
          <h4>World changes (already occurred)</h4>
          <ul>
            {(t.M0_2?.world_changes || []).map((w: any) => (
              <li key={w.id}><b>{w.id}</b> {w.change_description}: {w.quantitative_magnitude} <span className="tdetail__dim">vs {w.baseline_reference}</span></li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Kill switch (locked)</h4>
          <p>{m05.falsification_sentence}</p>
        </section>
        <section>
          <h4>Edge</h4>
          <p>{t.M0_6_3?.variant_paragraph}</p>
          {m066.blended_calculation && <p className="tdetail__dim mono">{m066.blended_calculation}</p>}
          {m065.trigger_name && <p>⚡ {m065.trigger_name} <span className="tdetail__dim">{m065.trigger_date_range}</span></p>}
        </section>
      </div>

      <h4 className="tdetail__cands-title">Candidates — the shortlist</h4>
      <table className="tdetail__cands">
        <thead>
          <tr><th>#</th><th>Ticker</th><th>Company</th><th>Side</th><th>Exposure</th><th>Pool</th><th></th></tr>
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
                <td><span className="pooldot" style={{ background: pool ? 'var(--live)' : 'var(--text-faint)' }} title={pool ? 'data pool present — research can launch' : 'no data pool yet — add filings first'} /></td>
                <td>
                  {done ? (
                    <span className="tdetail__dim">handed off ✓</span>
                  ) : confirmFor === c.ticker ? (
                    <button className="btn btn--amber" onClick={(e) => { e.stopPropagation(); void sendToResearch(meta.thesis_id, c.ticker, pool) }}>
                      confirm — seed memo{pool ? ' + go' : ''} ▸
                    </button>
                  ) : (
                    <button className="btn btn--ghost" onClick={(e) => { e.stopPropagation(); setConfirmFor(c.ticker) }} title={`Seeds data/${c.ticker}/screener_thesis_….md (idempotent). The research run launch stays a separate confirm.`}>
                      send to research
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
          {!cands.length && (
            <tr><td colSpan={7} className="tdetail__dim" style={{ padding: '10px 6px' }}>No candidates surfaced (watchlist routing keeps the industry map without ticker spend).</td></tr>
          )}
        </tbody>
      </table>
      {t.run_root && (
        <div className="tdetail__foot">
          <button className="btn btn--ghost" onClick={() => openCallFile(`${t.run_root}/edge-definition/99_edge-definition-synthesis.md`, 'Edge synthesis')}>read the edge synthesis</button>
          <button className="btn btn--ghost" onClick={() => openCallFile(`${t.run_root}/candidate-surfacing/99_candidate-surfacing-synthesis.md`, 'Candidate deck')}>read the deck</button>
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
      inbox: (board?.inbox || []).filter((r) => !r.consumed),
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
          <div className="pipeline__title">Idea Pipeline</div>
          <div className="pipeline__sub">
            {board?.counts ? `${board.counts.signals_total ?? 0} signals · ${board.counts.provisional ?? 0} provisional · ${board.counts.full_machine ?? 0} full machine · ${board.counts.handed_off ?? 0} handed off` : 'the screener funnel'}
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
            <div className="plane__title">Inbox <span className="plane__count">{buckets.inbox.length}</span></div>
            {buckets.inbox.map((r) => (
              <div key={r.inbox_id} className="pcard">
                <div className="pcard__head"><span className="pcard__chip">{r.source_name}</span>{r.dedup_status === 'possible_duplicate' && <span className="pcard__chip" style={{ color: 'var(--text-faint)' }}>dup?</span>}</div>
                <div className="pcard__headline">{r.headline}</div>
                {r.prelim_note && <div className="pcard__why">{r.prelim_note}</div>}
                <div className="pcard__meta">
                  <span>{fmtTs(r.found_at)}</span>
                  <button className="btn btn--ghost pcard__act" onClick={() => void submitFromInbox({ headline: r.headline, source_url: r.url, source_name: r.source_name, input_nature: r.input_nature || 'news_headline' })}>run ▸</button>
                </div>
              </div>
            ))}
            {!buckets.inbox.length && <div className="plane__empty">Scan sources to fill the inbox</div>}
          </div>

          <div className="plane">
            <div className="plane__title">In gauntlet <span className="plane__count">{buckets.gauntlet.length}</span></div>
            {buckets.gauntlet.map((s) => (
              <div key={s.signal_id} onClick={() => { void scSelectSignal(s.signal_id); close() }}>
                <SignalCard s={s} />
              </div>
            ))}
            {!buckets.gauntlet.length && <div className="plane__empty">No signal running</div>}
          </div>

          <div className="plane">
            <div className="plane__title">Parked / logged <span className="plane__count">{buckets.parked.length}</span></div>
            {buckets.parked.map((s) => (
              <SignalCard key={s.signal_id} s={s} onRelaunch={(id) => void relaunchSignal(id)} />
            ))}
            {!buckets.parked.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title">Watchlist <span className="plane__count">{buckets.watchlist.length}</span></div>
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
            <div className="plane__title">Provisional <span className="plane__count">{buckets.provisional.length}</span></div>
            {buckets.provisional.map((t) => (
              <ThesisCard key={t.thesis_id} t={t} onOpen={openThesisDetail} />
            ))}
            {!buckets.provisional.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title">Full machine <span className="plane__count">{buckets.fullMachine.length}</span></div>
            {buckets.fullMachine.map((t) => (
              <ThesisCard key={t.thesis_id} t={t} onOpen={openThesisDetail} />
            ))}
            {!buckets.fullMachine.length && <div className="plane__empty">—</div>}
          </div>

          <div className="plane">
            <div className="plane__title">Handed off <span className="plane__count">{buckets.handedOff.length}</span></div>
            {buckets.handedOff.map((h) => (
              <div key={h.handoff_id} className="pcard">
                <div className="pcard__head"><span className="pcard__chip mono">{h.ticker}</span></div>
                <div className="pcard__why">seeded {h.seeded_path}</div>
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
