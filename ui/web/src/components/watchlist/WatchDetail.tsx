// The detail panel: everything one row deliberately left out.
//
// The list trades completeness for glanceability, and this panel is the other half of that trade — the signal
// and what is behind it, what the name is waiting for in the research's own words, the price and its
// provenance, your own reason and triggers, and the actions. It shows ONE name, which is the honest shape: a
// list that tried to show fifty of these is the old table again. It scrolls on its own and folds its long
// parts, so it is never taller than the screen; the actions sit at the top, where they are reached unscrolled.
import { useEffect, useState } from 'react'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { ABSENT_PRICE_COPY, decisionColor, money, shortDay } from '../../lib/format'
import type { WatchRow, WatchTriggerEval } from '../../lib/types'
import { absenceReason, nearestTarget, stillToMove } from '../../lib/watchlistView'
import { dateWords, gapWords, quoteNote, rowSignal, rowStatus } from '../../lib/watchStatus'
import { WatchPlanSection } from './WatchPlan'

/** A trigger's chip state — the three-valued vocabulary, so a refusal never renders as "not met". */
function chipClass(e: WatchTriggerEval): string {
  if (e.state === 'condition_met') return 'wl__trg wl__trg--met'
  if (e.due) return 'wl__trg wl__trg--due'
  if (e.state === 'not_evaluable') return 'wl__trg wl__trg--unevaluable'
  return 'wl__trg wl__trg--armed'
}

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}%`

interface Scen { label: string; price_target: number; probability: number | null; source: string | null }

/**
 * The scenario targets the engine's own run recorded, offered as a pre-filled trigger — for a name whose
 * research has no watch plan to arm it on its own (a research name with a plan already watches its prices).
 *
 * Three rules this obeys, each learned from the committed records rather than assumed:
 *  - It picks NOTHING. Labels are not a fixed vocabulary (`bear`, `bear_cyclical`, `bear_structural`,
 *    `deal_breaks_standalone`, `tail_structural_avoid_ruin` all occur), and the lowest number is often a
 *    ruin tail rather than an entry — one record's cheapest scenario is 4.00 against an 18.59 bear.
 *  - It states each row's citation honestly. Many scenario rows carry no `source`, so a blanket
 *    provenance line would imply something nobody wrote (§5).
 *  - It does not infer DIRECTION. The trigger schema is explicit that guessing "below = good" fires a
 *    short candidate's trigger backwards, so the card says which way it will draft and the composer
 *    still shows the control before anything is armed.
 */
function ScenarioAdopt({ row, onUse }: { row: WatchRow; onUse: (s: Scen, currency: string) => void }) {
  const [state, setState] = useState<{ loading: boolean; record: boolean; scenarios: Scen[]; currency: string | null }>(
    { loading: true, record: false, scenarios: [], currency: null },
  )
  const runRoot = row.run_root
  useEffect(() => {
    let live = true
    if (!runRoot) { setState({ loading: false, record: false, scenarios: [], currency: null }); return }
    setState((p) => ({ ...p, loading: true }))
    api.watchScenarios(runRoot)
      .then((r) => { if (live) setState({ loading: false, record: !!r.record, scenarios: r.scenarios ?? [], currency: r.currency ?? null }) })
      .catch(() => { if (live) setState({ loading: false, record: false, scenarios: [], currency: null }) })
    return () => { live = false }
  }, [runRoot])

  if (state.loading || !state.record || !state.scenarios.length) return null
  const currency = state.currency || row.currency || ''
  return (
    <section className="wdet__sec">
      <h4 className="wdet__seclabel">The engine priced {state.scenarios.length} scenario{state.scenarios.length === 1 ? '' : 's'}</h4>
      <div className="wdet__scens">
        {state.scenarios.map((sc) => (
          <div key={sc.label} className="wdet__scen">
            <span className="wdet__scenlabel" title={sc.label}>{sc.label.replace(/_/g, ' ')}</span>
            <span className="wdet__scenval">{sc.price_target.toFixed(2)}</span>
            <span className="wdet__scenprob">{sc.probability != null ? `${sc.probability}%` : ''}</span>
            <span className={`wdet__scencite${sc.source ? '' : ' wdet__scencite--none'}`} title={sc.source ?? 'This run did not record where this target came from.'}>
              {sc.source ? 'cited' : 'no source'}
            </span>
            <button className="btn btn--mini" onClick={() => onUse(sc, currency)} title={`Draft a buy-at-or-below trigger at ${sc.price_target.toFixed(2)} — you confirm it before it arms`}>
              Use
            </button>
          </div>
        ))}
      </div>
      <p className="wdet__runnote">
        Drafts a buy-at-or-below trigger you confirm before it arms — change the level or the direction there.
        The engine's target answers what this is worth, which is not the same question as when you want to own it.
      </p>
    </section>
  )
}

export function WatchDetail({ row }: { row: WatchRow | null }) {
  const [armed, setArmed] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const openComposer = useStore((s) => s.openWatchComposer)
  const openCallFile = useStore((s) => s.openCallFile)
  const openInlineDoc = useStore((s) => s.openInlineDoc)
  const openEmbeddedDoc = useStore((s) => s.openEmbeddedDoc)
  const archiveWatch = useStore((s) => s.archiveWatch)
  const restoreWatch = useStore((s) => s.restoreWatch)
  const staticMode = useStore((s) => s.staticMode)
  const tickers = useStore((s) => s.tickers)
  const selectTicker = useStore((s) => s.selectTicker)
  const setResearchView = useStore((s) => s.setResearchView)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  const pending = useStore((s) => s.watchlistPending) === row?.ticker
  const loadWatchlist = useStore((s) => s.loadWatchlist)
  const setToast = useStore((s) => s.setToast)
  const setEmailPaused = useStore((s) => s.setWatchEmailPaused)
  const emailSetUp = useStore((s) => s.watchMessages?.email.enabled === true)

  const target = row ? nearestTarget(row) : null
  const pool = row ? tickers.find((t) => t.ticker === row.ticker) : undefined
  // more than one trigger is the only case where listing the set adds anything the facts row did not
  const multi = (row?.evals?.length ?? 0) > 1
  const lastRunAt = pool?.latestRun?.decisionDate ?? row?.engine?.decision_date ?? null
  if (!row) {
    return (
      <aside className="wdet wdet--empty">
        <div className="wdet__hint">Pick a name to see what it is waiting for, where it stands, and what to do about it.</div>
      </aside>
    )
  }

  const w = row.watch
  const status = rowStatus(row)
  const sig = rowSignal(row)
  const verdict = row.engine?.decision ?? null
  const reason = row.why || (row.engine?.size_in_trigger ? `“${row.engine.size_in_trigger}”` : '')
  const isArchived = !!row.archive && !row.resurfaced
  const absent = absenceReason(row)
  // `attachments` and `evals` are declared non-optional but arrive over the wire — and in static mode from
  // the snapshot builder, a separate program. A missing array would take the whole panel down rather than
  // degrade, so read them defensively here even though the type says they are always present.
  const firstAttachment = row.attachments?.[0]
  const thesisHref = !staticMode && row.entry_id && firstAttachment
    ? api.watchAttachmentUrl(row.entry_id, firstAttachment.attachment_id)
    : null
  // Either kind is READ in the cockpit's own reader rather than downloaded, by two different routes.
  // Markdown: the route serves it as text/plain with nosniff, and the reader renders it through
  // react-markdown with no rehype-raw, so embedded HTML is escaped rather than executed. A PDF is
  // embedded instead and rendered by the browser's own viewer, which runs in its own sandboxed process
  // and cannot reach this origin's DOM, cookies or session — see the route in ui/server/src/server.ts
  // for why `attachment` was the original choice and what carries the safety now.
  const thesisFilename = firstAttachment?.filename
  const thesisIsMarkdown = !!thesisFilename && /\.md$/i.test(thesisFilename)
  const thesisTitle = thesisFilename ? `${row.ticker} — ${thesisFilename}` : ''
  // Hoisted so TypeScript narrows it for the callback below — a closure cannot narrow a property access.
  const thesisPath = row.final_thesis_path
  const edit = () =>
    openComposer(
      { ticker: row.ticker, company_name: row.company_name, currency: row.currency, exchange: row.exchange,
        why: row.why, conviction: row.conviction, review_date: row.review_date, triggers: row.triggers },
      row.entry_id,
    )
  const assign = async (assignee: 'AB' | 'NV' | 'CK' | null) => {
    setAssigning(true)
    try {
      const result = await api.watchAssign(row.ticker, row.currency, assignee)
      await loadWatchlist(true)
      setToast(result.publish_error
        ? { msg: `${row.ticker} assigned locally, but did not sync: ${result.publish_error}`, tone: 'bad' }
        : { msg: assignee ? `${row.ticker} assigned to ${assignee}.` : `${row.ticker} is unassigned.`, tone: 'good' })
    } catch (error: any) { setToast({ msg: error?.message || `Could not assign ${row.ticker}.`, tone: 'bad' }) }
    finally { setAssigning(false) }
  }
  const next = w?.next_line ?? null
  const nextDate = dateWords(w?.next_date)

  return (
    <aside className="wdet" aria-label={`Details for ${row.ticker}`}>
      <div className="wdet__head">
        <span className="wdet__sym">{row.ticker}</span>
        {verdict
          ? <span className="wl__verdict" style={{ color: decisionColor(verdict) }}>{verdict}</span>
          : <span className="wl__verdict wl__verdict--none" title="You added this — the engine has not researched it">yours</span>}
        {!staticMode && (
          <label className="wdet__owner" title={row.task_id ? 'Shared with this ticker’s Tasks card' : 'Assign this watchlist name'}>
            <span>{row.assignee ?? '—'}<i aria-hidden>⌄</i></span>
            <select disabled={assigning} value={row.assignee ?? ''} onChange={(event) => void assign((event.target.value || null) as 'AB' | 'NV' | 'CK' | null)} aria-label={`Assign ${row.ticker}`}>
              {!row.task_id && <option value="">Unassigned</option>}
              <option value="AB">AB · Ayush Banka</option>
              <option value="NV">NV · Noel Vaz</option>
              <option value="CK">CK · Chiraag Kapil</option>
            </select>
          </label>
        )}
      </div>
      <div className="wdet__co">
        {row.company_name ? `${row.company_name} · ` : ''}{row.exchange ? `${row.exchange} · ` : ''}{row.currency ?? '—'}
        {` · ${row.origin === 'engine' ? 'from research' : row.origin === 'both' ? 'research + you' : 'you added this'}`}
        {row.conviction ? ` · conviction ${row.conviction}` : ''}
      </div>

      {/* The signal, and one line on what is behind it. */}
      <div className="wdet__status">
        <span className={`wst wst--${sig.tone}`} title={sig.meaning}>{sig.label}</span>
        <span className="wdet__headline">{w?.headline ?? sig.meaning}</span>
      </div>

      {/* What you can do about it — at the top, reached without scrolling. */}
      <div className="wdet__actions">
        {isArchived ? (
          <button className="btn btn--mini" disabled={pending} onClick={() => void restoreWatch(row.ticker, row.currency)}>
            {pending ? '…' : 'Restore'}
          </button>
        ) : (
          <>
            {thesisHref && thesisIsMarkdown && thesisFilename
              ? (
                <button
                  className="btn btn--mini"
                  title="Your write-up"
                  onClick={() => {
                    void fetch(thesisHref)
                      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
                      .then((text) => openInlineDoc(thesisTitle, text))
                      .catch(() => openInlineDoc(thesisTitle, '*Could not load this write-up.*'))
                  }}
                >
                  Thesis
                </button>
              )
              : thesisHref && thesisFilename
              ? (
                /* Opened IN the cockpit rather than navigated to: a top-level navigation to a PDF is what
                   Chrome's "download PDFs instead of opening them" setting intercepts. */
                <button className="btn btn--mini" title="Your write-up" onClick={() => openEmbeddedDoc(thesisTitle, thesisHref)}>Thesis</button>
              )
              : thesisPath
                ? <button className="btn btn--mini" onClick={() => openCallFile(thesisPath, `Investment Thesis — ${row.ticker}`)}>Thesis</button>
                : null}
            <button className="btn btn--mini" onClick={edit}>Edit</button>
            {/* Only where email is on: without it the button would pause nothing (the Messages panel says why). */}
            {w && !staticMode && emailSetUp && (
              <button
                className="btn btn--mini"
                onClick={() => void setEmailPaused(row.ticker, row.currency, !w.email_paused)}
                title={w.email_paused
                  ? 'Email urgent messages about this name again'
                  : 'Stop emailing about this name. Its messages still arrive here.'}
              >
                {w.email_paused ? 'Resume email' : 'Pause email'}
              </button>
            )}
            {/* Two-click confirm, and the wording restates the act rather than saying "confirm". */}
            <button
              className={`btn btn--mini${armed ? ' btn--armed' : ''}`}
              disabled={pending}
              onClick={() => { if (armed) { void archiveWatch(row.ticker, row.currency, ''); setArmed(false) } else setArmed(true) }}
              onBlur={() => setArmed(false)}
            >
              {pending ? '…' : armed ? `Hide ${row.ticker}` : 'Archive'}
            </button>
          </>
        )}
      </div>
      {w?.email_paused && <p className="wdet__runnote">Email is paused for {row.ticker}; its messages still arrive in the cockpit.</p>}

      {w && w.conditions.length > 0 && (
        <section className="wdet__sec">
          <h4 className="wdet__seclabel">{w.conditions.length === 1 ? 'What this means' : `What this means · ${w.conditions.length}`}</h4>
          <ul className="wdet__conds">
            {w.conditions.map((c) => (
              <li key={c.id} className="wdet__cond">
                <b>{c.title}</b>
                <div className="wdet__condtext">{c.detail}</div>
                {/* A passed date's tests fold away: the same deal-breakers stand under every passed date, and the
                    plan below lists them once. Open, they are the checklist to work through by hand. */}
                {c.checklist && c.checklist.length > 0 && (
                  <details className="wdet__tests">
                    <summary>The research's tests to check by hand · {c.checklist.length}</summary>
                    <ul>{c.checklist.map((x, n) => <li key={n}>{x}</li>)}</ul>
                  </details>
                )}
                {c.quote && (
                  <blockquote className="wmsg__quote">
                    “{c.quote}”
                    {c.source && <cite>{c.source}</cite>}
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The three numbers, each LABELLED: where it is, where it is waiting to get to, and how far that is.
          For a research name those come from its watch plan; for your own row, from your triggers. */}
      <section className="wdet__sec">
        <h4 className="wdet__seclabel">Where the price stands</h4>
        <div className="wdet__facts">
          <div className="wdet__fact">
            <span className="wdet__factlabel">Price now</span>
            {row.quote ? (
              <>
                <span className="wdet__factval">{row.quote.price.toFixed(2)}</span>
                <span className="wdet__factnote">
                  {quoteNote(row.quote, w?.day_move_pct)}
                  {typeof w?.day_move_pct === 'number' && w.market && !row.quote.stale ? ` · ${w.market.label} ${signed(w.market.move_pct)}` : ''}
                </span>
              </>
            ) : (
              <>
                <span className="wdet__factval wdet__factval--none">—</span>
                <span className="wdet__factnote" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : undefined}>
                  {row.quote_reason ? String(row.quote_reason).replace(/_/g, ' ') : 'no price'}
                </span>
              </>
            )}
          </div>
          <div className="wdet__fact">
            <span className="wdet__factlabel">{next ? next.label : 'Nearest target'}</span>
            {next ? (
              <>
                <span className={`wdet__factval${NEEDS_ATTENTION(status) ? ' wdet__factval--met' : ''}`}>{next.text}</span>
                <span className="wdet__factnote">from the research</span>
              </>
            ) : target ? (
              <>
                <span className={`wdet__factval${row.state === 'condition_met' ? ' wdet__factval--met' : ''}`}>{target.value.toFixed(2)}</span>
                <span className="wdet__factnote">{target.how}</span>
              </>
            ) : (
              <>
                <span className="wdet__factval wdet__factval--none">—</span>
                <span className="wdet__factnote">{row.evals?.some((e) => e.kind === 'event_date') ? 'a date, not a price' : 'no price to wait for'}</span>
              </>
            )}
          </div>
          {(() => {
            // Distance AND caption are read off the same line as the figure beside them, so the panel can
            // never pair one line's distance with another line's price.
            if (next) {
              return (
                <div className="wdet__fact">
                  <span className="wdet__factlabel">Still to move</span>
                  <span className="wdet__factval">{gapWords(next.gap_pct) ?? '—'}</span>
                  <span className="wdet__factnote">{next.gap_pct == null ? 'no price to measure from' : 'to that price'}</span>
                </div>
              )
            }
            const move = stillToMove(row)
            return (
              <div className="wdet__fact">
                <span className="wdet__factlabel">Still to move</span>
                <span className={`wdet__factval${row.state === 'condition_met' ? ' wdet__factval--met' : ''}`}>{move.label}</span>
                <span className="wdet__factnote">{move.caption}</span>
              </div>
            )
          })()}
        </div>
      </section>

      {w && <WatchPlanSection key={row.listing_key} row={row} />}

      <section className="wdet__sec">
        <h4 className="wdet__seclabel">Why you're watching</h4>
        <div className={`wdet__why${row.why ? '' : ' wl__why--engine'}`}>{reason || 'No reason recorded yet.'}</div>
      </section>

      {/* Your own triggers — listed only when there is more than one (with one, the facts row above is that
          trigger), plus the absence and resurfaced notes, which the facts row cannot make. */}
      {(multi || absent || row.resurfaced || !row.evals?.length) && (
        <section className="wdet__sec">
          {multi && <h4 className="wdet__seclabel">Your triggers · {row.evals.length}</h4>}
          <div className="wdet__trigs">
            {multi ? row.evals.map((e) => (
              <div key={e.trigger_id} className="wdet__trig" title={e.detail}>
                <span className={chipClass(e)}>
                  {e.kind === 'event_date' ? 'date' : e.kind === 'price_level' ? 'level' : e.kind === 'pct_drop' ? 'drop' : 'value'}
                </span>
                {e.target ? (
                  <span className="wdet__trigterms">
                    <span className="wdet__trigtarget">{money(e.target.currency, e.target.value)}</span>
                    <span className="wdet__trigbasis">{e.target.basis}</span>
                  </span>
                ) : (
                  <span className="wdet__trigtext">{e.detail}</span>
                )}
                <span className="wdet__trigstate">
                  {e.state === 'condition_met' ? 'met'
                    : e.state === 'not_evaluable' ? 'not checkable'
                    : e.days_to != null ? (e.days_to === 0 ? 'today' : `${e.days_to}d`)
                    : e.gap_pct != null ? `${e.gap_pct > 0 ? '+' : ''}${e.gap_pct}%`
                    : ''}
                </span>
              </div>
            )) : row.evals?.length ? null : (
              !isArchived && <button className="wl__trg wl__trg--add" onClick={edit}>+ your own trigger</button>
            )}
            {absent && !next && <div className="wdet__absent">{absent}</div>}
            {row.resurfaced && (
              <div className="wdet__absent">
                Archived {row.archive?.at.slice(0, 10)} — the engine has since changed what it says, so it is back on the list.
              </div>
            )}
          </div>
        </section>
      )}

      <section className="wdet__sec">
        <h4 className="wdet__seclabel">Next date</h4>
        <div className="wdet__next">
          <span className="wdet__nextdate">{nextDate ?? (row.review_date ? shortDay(row.review_date) : 'no date set')}</span>
          {!nextDate && row.engine?.next_review_text && <span className="wdet__factnote">{row.engine.next_review_text}</span>}
        </div>
      </section>

      {/* Offered only where a decision record exists and no watch plan already watches its prices. Adopting
          is still a human act: the click records that YOU chose this number on this date. */}
      {!isArchived && !staticMode && w?.plan?.state !== 'ready' && (
        <ScenarioAdopt
          row={row}
          onUse={(sc, currency) =>
            openComposer(
              {
                ticker: row.ticker, company_name: row.company_name, currency: currency || row.currency, exchange: row.exchange,
                why: row.why, conviction: row.conviction, review_date: row.review_date,
                triggers: [
                  ...(row.triggers ?? []),
                  // level and currency come from the record; DIRECTION is a draft the composer shows for
                  // confirmation, never an inference.
                  { kind: 'price_level', direction: 'at_or_below', level: sc.price_target, currency: currency || row.currency || '', note: `engine ${sc.label.replace(/_/g, ' ')} target${sc.source ? ` — ${sc.source}` : ' — the run recorded no source for this target'}` },
                ],
              },
              row.entry_id,
            )
          }
        />
      )}

      {/* The rerun affordance, WITH the two durable staleness facts beside it — when the engine last ran and
          how many documents are in the pool — and the scoped new-data check as the primary action, because a
          rerun over unchanged documents reads the same evidence and reaches the same thesis. */}
      {!isArchived && !staticMode && (
        <section className="wdet__sec">
          <h4 className="wdet__seclabel">Engine run</h4>
          {pool ? (
            <>
              <div className="wdet__runfacts">
                <span>{lastRunAt ? `Last run ${shortDay(lastRunAt)}` : 'Never run'}</span>
                <span>· {pool.fileCount} {pool.fileCount === 1 ? 'document' : 'documents'} in the pool</span>
              </div>
              <div className="wdet__runrow">
                <button
                  className="btn btn--mini"
                  title="Open this name in the research view, where the new-data analysis scopes which orbs the fresh evidence actually invalidates"
                  onClick={() => { setResearchView('constellation'); void selectTicker(row.ticker) }}
                >
                  Check for new data
                </button>
                <button className="btn btn--mini" onClick={() => void requestFullForSubject(row.ticker)}>Rerun everything</button>
              </div>
              <p className="wdet__runnote">
                A rerun over unchanged documents reads the same evidence and reaches the same thesis — check first.
              </p>
            </>
          ) : (
            <p className="wdet__runnote">No documents for {row.ticker} yet — a run needs something to read.</p>
          )}
        </section>
      )}
    </aside>
  )
}

/** A status that means the line in the facts row is the news, so it takes the accent. */
function NEEDS_ATTENTION(s: string): boolean {
  return s === 'buy_price_reached' || s === 'getting_close' || s === 'warning'
}
