// Fast batch review: a focused, keyboard-driven queue for triaging a full day's wire quickly. One card
// at a time — pick a filter set, then hammer I/H/L/D (or the matching buttons) to flag items and
// auto-advance, or S to skip. Reuses the exact same submitFeedback/ledger path as the per-card
// FeedbackMenu (lib/store.ts reviewSubmit) — this is a faster UI on the same storage, not a parallel one.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { displayHeadline } from '../../lib/plain'
import { isCompanyNameClient, sourceTierDef } from '../../lib/scope'
import { buildSourceTierOptions } from './ReviewFilters'
import { api } from '../../lib/api'
import { feedbackLabel } from '../../lib/feedbackTypes'
import { KEY_TO_FEEDBACK, SKIP_KEY } from '../../lib/reviewKeymap'
import type { FeedbackSummary } from '../../lib/types'

// value = the SourceTierId the wire actually stamps (deriveSourceTier); label = what the user sees.
// Filtering on the label matched nothing on live data — the wire holds IDs like 'news', not 'News'.
// Derived from SOURCE_TIERS (the single source of truth) so every stamped tier — including the lowest-trust
// 'social' (Reddit/forum, rank 0) — gets a chip, and any future tier appears automatically. The derivation
// lives in ReviewFilters.ts (a pure, React-free module) so a bare-tsx regression test can guard it.
const SOURCE_TIER_OPTIONS: { id: string; label: string }[] = buildSourceTierOptions()

export function ReviewPanel() {
  const close = useStore((s) => s.closeReview)
  const filters = useStore((s) => s.reviewFilters)
  const setFilters = useStore((s) => s.setReviewFilters)
  const queue = useStore((s) => s.reviewQueue)
  const index = useStore((s) => s.reviewIndex)
  const sessionCount = useStore((s) => s.reviewSessionCount)
  const reviewSubmit = useStore((s) => s.reviewSubmit)
  const reviewSkip = useStore((s) => s.reviewSkip)
  const [reason, setReason] = useState('')
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)

  const it = queue[index]

  useEffect(() => { setReason('') }, [index])

  useEffect(() => {
    let alive = true
    api.feedbackSummary().then((s) => { if (alive) setSummary(s) }).catch(() => {})
    return () => { alive = false }
  }, [sessionCount])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return // never fire while the reason field has focus
      // Never hijack a browser/OS shortcut: Ctrl/Cmd+L (focus address bar), Alt+D (address bar), etc. all
      // still carry e.key 'l'/'d', so without this a chord would submit score_too_high/duplicate_stale AND
      // preventDefault the real shortcut. A bare letter (no modifier) is the only intended trigger.
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape') return close()
      if (!it) return
      const key = e.key.toLowerCase()
      const mapped = KEY_TO_FEEDBACK[key]
      if (mapped) { e.preventDefault(); void reviewSubmit(mapped, reason) }
      else if (key === SKIP_KEY) { e.preventDefault(); reviewSkip() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [it, reason, reviewSubmit, reviewSkip, close])

  const toggle = (patch: Partial<typeof filters>) => setFilters({ ...filters, ...patch })
  const toggleTier = (tier: string) => {
    const next = new Set(filters.sourceTiers)
    next.has(tier) ? next.delete(tier) : next.add(tier)
    setFilters({ ...filters, sourceTiers: next })
  }

  const company = it ? (it.companies || []).find((c) => isCompanyNameClient(c.name)) : null

  return (
    <motion.div className="review" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="review__head">
        <div style={{ minWidth: 0 }}>
          <div className="review__title">Batch review</div>
          <div className="review__sub">One item at a time — I irrelevant · H should be higher · L should be lower · D duplicate · S skip.</div>
        </div>
        <div className="review__headbtns">
          <span className="review__count mono">{sessionCount} flagged this session</span>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      <div className="review__filters">
        <label className="review__filter"><input type="checkbox" checked={filters.highScore} onChange={(e) => toggle({ highScore: e.target.checked })} /> High score</label>
        <label className="review__filter" title="Approximation: relevance is tagged 'relevant but not material' — a true per-item routine-filing flag would need an on-demand read of every item"><input type="checkbox" checked={filters.routineFilings} onChange={(e) => toggle({ routineFilings: e.target.checked })} /> Routine filings</label>
        <label className="review__filter" title="Source tier is News or Unconfirmed"><input type="checkbox" checked={filters.genericMedia} onChange={(e) => toggle({ genericMedia: e.target.checked })} /> Generic media</label>
        <label className="review__filter"><input type="checkbox" checked={filters.lowConfidence} onChange={(e) => toggle({ lowConfidence: e.target.checked })} /> Low confidence</label>
        <label className="review__filter" title="Approximation: the named company already has an analyses/ folder — this codebase has no separate holdings list"><input type="checkbox" checked={filters.portfolioCompanies} onChange={(e) => toggle({ portfolioCompanies: e.target.checked })} /> Portfolio companies</label>
        <span className="review__filtersep" aria-hidden />
        {SOURCE_TIER_OPTIONS.map((tier) => (
          <button key={tier.id} type="button" className={`review__tierchip${filters.sourceTiers.has(tier.id) ? ' review__tierchip--on' : ''}`} onClick={() => toggleTier(tier.id)}>
            {tier.label}
          </button>
        ))}
      </div>

      <div className="review__body">
        {queue.length === 0 ? (
          <div className="review__empty">No items match these filters right now — loosen one and try again.</div>
        ) : !it ? (
          <div className="review__empty">You've reviewed everything in this queue ({queue.length} item{queue.length === 1 ? '' : 's'}).</div>
        ) : (
          <>
            <div className="review__progress mono">{index + 1} of {queue.length}</div>
            <div className="review__card">
              <div className="review__cardtop">
                <span className="review__score mono">{it.triage_score}</span>
                <span className="review__src">{it.source_name}</span>
                {it.source_tier && <span className="review__tag">{sourceTierDef(it.source_tier)?.label ?? it.source_tier}</span>}
                <span className="review__tag">{it.band}</span>
              </div>
              <div className="review__headline">{displayHeadline(it)}</div>
              {company && <div className="review__company">{[company.name, company.ticker].filter(Boolean).join(' · ')}</div>}
            </div>
            <input
              className="review__reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional reason — rides along with whichever key/button you press next"
            />
            <div className="review__actions">
              <button className="btn btn--ghost review__actionbtn" onClick={() => void reviewSubmit('irrelevant', reason)}>I · {feedbackLabel('irrelevant')}</button>
              <button className="btn btn--ghost review__actionbtn" onClick={() => void reviewSubmit('should_be_higher', reason)}>H · {feedbackLabel('should_be_higher')}</button>
              <button className="btn btn--ghost review__actionbtn" onClick={() => void reviewSubmit('score_too_high', reason)}>L · {feedbackLabel('score_too_high')}</button>
              <button className="btn btn--ghost review__actionbtn" onClick={() => void reviewSubmit('duplicate_stale', reason)}>D · {feedbackLabel('duplicate_stale')}</button>
              <button className="btn btn--amber review__actionbtn" onClick={reviewSkip}>S · Skip</button>
            </div>
          </>
        )}
      </div>

      {summary && summary.active_total > 0 && (
        <div className="review__foot">
          <span className="review__footnote">
            Feedback so far — irrelevant {summary.by_type.irrelevant || 0} · too high {summary.by_type.score_too_high || 0} · too low {summary.by_type.score_too_low || 0}
            {summary.top_reasons.length > 0 && ` · top reason: "${summary.top_reasons[0].reason}" (${summary.top_reasons[0].count})`}
          </span>
        </div>
      )}
    </motion.div>
  )
}
