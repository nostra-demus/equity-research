// What the engine's own research says about what the fund actually holds.
//
// The screen is built around the two rows that are worth its space: a position held AGAINST its verdict,
// and a large position with no research behind it at all. A holding that matches its Buy is not news,
// so it is present but quiet.
//
// Three things this surface refuses to do:
//  · It never treats a verdict as a recommendation to act. It reports what the engine said and WHEN —
//    a Buy from five months ago is not an endorsement of today's price, so the age sits next to it.
//  · It never guesses which company a holding is. An identical ticker matches; anything else waits for
//    the operator. Near-misses are offered as questions, never applied as answers.
//  · It never reports coverage by counting names. Four researched 1% positions beside one unresearched
//    60% position is "80% covered" by count and 6% by weight, and only the second describes the risk.

import { useState } from 'react'
import { api } from '../../lib/api'
import type { PortfolioRead, PortfolioThesisRead, PortfolioThesisRow, PortfolioThesisStance } from '../../lib/types'

/** Amber is the cockpit's positive. Red is reserved for the one state that needs acting on. */
const STANCE: Record<PortfolioThesisStance, { label: string; tone: string }> = {
  supported: { label: 'matches', tone: 'var(--good)' },
  watch: { label: 'watchlist', tone: 'var(--text-muted)' },
  against: { label: 'held against', tone: 'var(--bad)' },
  unrated: { label: 'not rated', tone: 'var(--text-muted)' },
  hedge: { label: 'needs a hedge', tone: 'var(--text-muted)' },
  none: { label: 'no research', tone: 'var(--text-faint)' },
}

function age(days: number | null): string {
  if (days === null) return ''
  if (days < 1) return 'today'
  if (days < 60) return `${days}d ago`
  return `${Math.round(days / 30)} months ago`
}

export function ThesisPanel({ thesis, onChanged, onOpenRun }: {
  thesis: PortfolioThesisRead
  onChanged: (read: PortfolioRead) => void
  onOpenRun?: (runRoot: string, ticker: string) => void
}) {
  const [error, setError] = useState<string | null>(null)
  if (thesis.rows.length === 0) return null

  const against = thesis.rows.filter((r) => r.stance === 'against')
  // Only the unresearched positions big enough to matter lead the summary. A 0.2% stub with no dossier
  // is true and not worth a sentence.
  const uncoveredHeavy = thesis.rows.filter((r) => r.decision === null && (r.weightPct ?? 0) >= 5)

  return (
    <div className={`fundbook__panel${against.length ? ' is-against' : ''}`}>
      <div className="fundbook__panelhead">
        <div>
          <strong>What the research says</strong>
          <small>
            The engine&rsquo;s own standing verdict for each holding. Read-only — nothing here moves a
            position, and no position moves a verdict.
          </small>
        </div>
        <span className="fundbook__coverage">
          {thesis.coveredWeightPct === null
            ? 'no weights to measure'
            : <><b>{thesis.coveredWeightPct.toFixed(0)}%</b> of weight researched</>}
        </span>
      </div>

      {(against.length > 0 || uncoveredHeavy.length > 0) && (
        <div className="fundbook__subhead fundbook__subhead--lead">
          {against.length > 0 && (
            <span className="fundbook__againstlead">
              <b>{against.map((r) => r.symbol).join(', ')}</b> {against.length === 1 ? 'is' : 'are'} held
              against {against.length === 1 ? 'its own' : 'their own'} verdict.
            </span>
          )}
          {uncoveredHeavy.length > 0 && (
            <span>
              {uncoveredHeavy.map((r) => r.symbol).join(', ')} {uncoveredHeavy.length === 1 ? 'carries' : 'carry'}
              {' '}{uncoveredHeavy.reduce((a, r) => a + (r.weightPct ?? 0), 0).toFixed(0)}% of the book with no
              dossier behind {uncoveredHeavy.length === 1 ? 'it' : 'them'}.
            </span>
          )}
        </div>
      )}

      {error && <div className="fundbook__formerror">{error}</div>}

      <div className="fundbook__scroll">
        <div className="fundbook__row fundbook__row--thesis fundbook__row--head">
          <span>Holding</span><span className="num">Weight</span><span>Verdict</span>
          <span className="num">Confidence</span><span>Dated</span><span>Research</span>
        </div>
        {thesis.rows.map((r) => (
          <ThesisRowView
            key={`${r.symbol}-${r.currency ?? ''}`}
            row={r}
            covered={thesis.covered}
            onOpenRun={onOpenRun}
            onError={setError}
            onChanged={onChanged}
          />
        ))}
      </div>

      <div className="fundbook__foot">
        A verdict is what the engine concluded on its date, not advice for today&rsquo;s price — which is
        why the date is beside it. Holdings the engine has never covered are listed too: an unresearched
        position is a fact about the book, not a gap in this table.
      </div>
    </div>
  )
}

function ThesisRowView({ row, covered, onOpenRun, onError, onChanged }: {
  row: PortfolioThesisRow
  covered: string[]
  onOpenRun?: (runRoot: string, ticker: string) => void
  onError: (m: string | null) => void
  onChanged: (read: PortfolioRead) => void
}) {
  const [linking, setLinking] = useState(false)
  const [busy, setBusy] = useState(false)
  const stance = STANCE[row.stance]

  const link = async (ticker: string | null) => {
    setBusy(true); onError(null)
    try { onChanged(await api.linkThesis(row.symbol, ticker)); setLinking(false) }
    catch (e: any) { onError(e?.message || 'that link could not be saved') }
    finally { setBusy(false) }
  }

  return (
    <div className="fundbook__row fundbook__row--thesis">
      <strong className="mono">
        {row.symbol}
        {row.quantity !== null && row.quantity < 0 && <small className="fundbook__shortflag">short</small>}
      </strong>
      <span className="num dim">{row.weightPct === null ? '—' : `${row.weightPct.toFixed(1)}%`}</span>
      <span style={{ color: stance.tone }}>
        {row.decision ?? '—'}
        <small className="fundbook__stance">{stance.label}</small>
      </span>
      <span className="num dim">{row.confidence === null ? '—' : row.confidence.toFixed(0)}</span>
      <span className="dim mono">
        {row.decisionDate ?? '—'}
        {row.ageDays !== null && <small className="fundbook__stance">{age(row.ageDays)}</small>}
      </span>
      <span className="fundbook__thesisend">
        {row.ticker && !linking && (
          <>
            {onOpenRun && row.runRoot && (
              <button className="fundbook__btn" onClick={() => onOpenRun(row.runRoot!, row.ticker!)}>
                Open {row.ticker}
              </button>
            )}
            {row.matchedBy === 'linked' && (
              <button className="fundbook__linkbtn" disabled={busy} onClick={() => void link(null)} title={`Unlink ${row.symbol} from ${row.ticker}`}>
                unlink
              </button>
            )}
            {row.hasNewerPartial && <small title="A newer run has started but has no decision yet — the standing verdict is shown">re-run in progress</small>}
          </>
        )}

        {!row.ticker && !linking && (
          <>
            {/* A suggestion is a QUESTION, not an answer. NHYDY is very likely NHY's ADR — and BGC is
                very likely not BG — and only the operator can tell the two cases apart. */}
            {row.suggestions.length > 0 && (
              <span className="fundbook__suggest">
                same company as
                {row.suggestions.map((t) => (
                  <button key={t} className="fundbook__linkbtn" disabled={busy} onClick={() => void link(t)}>{t}</button>
                ))}
                ?
              </span>
            )}
            <button className="fundbook__linkbtn" onClick={() => setLinking(true)}>link…</button>
          </>
        )}

        {linking && (
          <span className="fundbook__suggest">
            <select
              className="fundbook__select"
              defaultValue=""
              disabled={busy}
              onChange={(e) => { if (e.target.value) void link(e.target.value) }}
            >
              <option value="" disabled>choose the company…</option>
              {covered.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="fundbook__linkbtn" onClick={() => setLinking(false)}>cancel</button>
          </span>
        )}
      </span>
    </div>
  )
}
