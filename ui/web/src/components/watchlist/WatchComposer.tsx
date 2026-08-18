import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { TriggerEditor, TRIGGER_LABEL, canAddTrigger, newTrigger, triggerDraftProblem, type DraftTrigger } from './TriggerEditor'
import { CompanyPicker } from '../CompanyPicker'
import type { WatchResolveCandidate } from '../../lib/types'

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const ABSENT_RESOLVE: Record<string, string> = {
  no_match: 'No listing found under that symbol.',
  directory_unavailable: 'The symbol directory could not be reached just now.',
  feed_unavailable: 'Found the listings, but prices could not be fetched — you can still add it.',
  quotes_disabled: 'Prices are switched off in this engine, so no live price is shown.',
}

/**
 * Add or edit a watchlist row.
 *
 * The important design decision is that you never type a currency. Typing a ticker searches the symbol
 * directory and prices every match, so PICKING one brings back company, exchange, currency and today's
 * price together, verified by the feed. A currency dropdown would not be enough: some venues signal a
 * minor unit by case alone (GBp is pence, GBP is pounds), so a person choosing from a list can still be
 * 100x wrong. Resolution is the only thing that actually removes the hazard.
 *
 * Opened prefilled from the decision banner, there is nothing to resolve — the run already knows all of
 * it, and the only thing left is your judgment.
 */
export function WatchComposer() {
  const composer = useStore((s) => s.watchComposer)
  const close = useStore((s) => s.closeWatchComposer)
  const save = useStore((s) => s.saveWatchRow)
  const prefill = composer?.prefill ?? null

  const [ticker, setTicker] = useState(prefill?.ticker ?? '')
  const [company, setCompany] = useState(prefill?.company_name ?? '')
  const [currency, setCurrency] = useState(prefill?.currency ?? '')
  const [exchange, setExchange] = useState(prefill?.exchange ?? '')
  const [reference, setReference] = useState<number | null>(null)
  const [why, setWhy] = useState(prefill?.why ?? '')
  const [conviction, setConviction] = useState<'high' | 'medium' | 'low' | null>(prefill?.conviction ?? null)
  const [reviewDate, setReviewDate] = useState(prefill?.review_date ?? '')
  const [tags, setTags] = useState<string[]>(prefill?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [triggers, setTriggers] = useState<DraftTrigger[]>(prefill?.triggers ?? [])
  const [saving, setSaving] = useState(false)

  // resolve
  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<WatchResolveCandidate[] | null>(null)
  const [resolveReason, setResolveReason] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const reqGen = useRef(0)
  const resolved = !!currency

  // Reseed every field whenever the panel is opened again. The fields are useState-seeded from `prefill`,
  // which only runs on the FIRST render — so without this, opening it for a second company would show the
  // first one's ticker and reason still filled in, and saving would file the new name under the old one's
  // details. Done here rather than with a changing key on the component: AnimatePresence cannot reconcile
  // a key change through a non-motion child, and leaves the old panel in the DOM forever.
  const openedAt = composer?.openedAt ?? 0
  useEffect(() => {
    setTicker(prefill?.ticker ?? '')
    setCompany(prefill?.company_name ?? '')
    setCurrency(prefill?.currency ?? '')
    setExchange(prefill?.exchange ?? '')
    setReference(null)
    setWhy(prefill?.why ?? '')
    setConviction(prefill?.conviction ?? null)
    setReviewDate(prefill?.review_date ?? '')
    setTags(prefill?.tags ?? [])
    setTagDraft('')
    setTriggers(prefill?.triggers ?? [])
    setQuery('')
    setCandidates(null)
    setResolveReason(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedAt])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  async function runResolve() { await resolveFor(query) }

  async function resolveFor(raw: string) {
    const q = raw.trim()
    if (!q) return
    const gen = ++reqGen.current
    setResolving(true)
    try {
      const r = await api.watchResolve(q)
      if (reqGen.current !== gen) return // a newer search superseded this one
      setCandidates(r.candidates)
      setResolveReason(r.reason)
    } catch {
      if (reqGen.current === gen) { setCandidates([]); setResolveReason('directory_unavailable') }
    } finally {
      if (reqGen.current === gen) setResolving(false)
    }
  }

  function pick(c: WatchResolveCandidate) {
    setTicker(c.symbol)
    setCompany(c.name)
    setExchange(c.exchange ?? '')
    setCurrency(c.currency ?? '')
    setReference(c.price)
    setCandidates(null)
  }

  // Everything the server would refuse, caught here — a 400 discards the whole entry behind an opaque
  // "invalid body", which is a bad way to learn that one field was blank.
  const triggerProblems = triggers.map((t) => triggerDraftProblem(t, currency))
  const blocker =
    !ticker.trim() ? 'Pick a listing first.'
    : !why.trim() ? 'Say why you are watching it.'
    : triggerProblems.find((p): p is string => !!p) ?? null
  const canSave = !blocker && !saving
  async function submit() {
    if (!canSave) return
    setSaving(true)
    const ok = await save({
      ticker: ticker.trim(),
      company_name: company.trim() || null,
      currency: currency.trim() || null,
      exchange: exchange.trim() || null,
      why: why.trim(),
      conviction,
      review_date: reviewDate || null,
      tags,
      triggers,
    }, composer?.entryId ?? null)
    setSaving(false)
    if (!ok) return
  }

  const trgCtx = { currency: currency || '', reference, today: todayISO() }

  return (
    <motion.div
      className="activity wlc"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="complementary" aria-label="Add to watchlist"
    >
      <div className="activity__head">
        <div>
          <div className="activity__title">{composer?.entryId ? 'Edit watchlist entry' : 'Add to watchlist'}</div>
          <div className="activity__sub">{ticker ? `${ticker}${company ? ` · ${company}` : ''}` : 'Find a listing, then say why you are watching it'}</div>
        </div>
        <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
      </div>

      <div className="wlc__body">
        {/* 1 — identity. Resolved, never typed. */}
        {!resolved && !composer?.entryId && (
          <div className="wlc__field">
            {/* Two ways to name it, because there are two cases. A company the engine already has a pool
                for is picked from the roster — the same picker the empty state uses, so the two surfaces
                cannot drift. Anything else is resolved against the symbol directory, which is what makes
                a never-researched name possible at all. */}
            <span className="wlc__label">Pick a company you already have</span>
            <div className="wlc__picker">
              <CompanyPicker
                allowFreeText
                onPick={(t) => { setQuery(t); setTicker(t); void resolveFor(t) }}
              />
            </div>
            <span className="wlc__label">Or look up any listing</span>
            <div className="wlc__row">
              <input
                className="fld" placeholder="Ticker, e.g. V" value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void runResolve() }}
                aria-label="Ticker to look up" autoFocus
              />
              <button className="btn" disabled={!query.trim() || resolving} onClick={() => void runResolve()}>
                {resolving ? 'Looking…' : 'Find'}
              </button>
            </div>
            {candidates && (
              candidates.length ? (
                <div className="wlc__cands">
                  {candidates.map((c) => (
                    <button key={c.symbol} className="wlc__cand" onClick={() => pick(c)}>
                      <span className="wlc__candsym">{c.symbol}</span>
                      <span className="wlc__candname">{c.name}{c.exchange ? ` · ${c.exchange}` : ''}</span>
                      <span className="wlc__candprice">
                        {c.price != null && c.currency ? `${c.currency} ${c.price.toFixed(2)}` : '—'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="wlc__hint">{ABSENT_RESOLVE[resolveReason ?? 'no_match'] ?? 'No listing found.'}</div>
              )
            )}
            {candidates && resolveReason === 'feed_unavailable' && (
              <div className="wlc__hint">{ABSENT_RESOLVE.feed_unavailable}</div>
            )}
          </div>
        )}

        {(resolved || composer?.entryId || ticker) && (
          <div className="wlc__ident">
            <div><span className="wlc__label">Ticker</span><div className="wlc__identv">{ticker || '—'}</div></div>
            <div>
              <span className="wlc__label">Currency</span>
              <div className={`wlc__identv${currency ? '' : ' wlc__identv--missing'}`}>{currency || 'unknown'}</div>
            </div>
            <div><span className="wlc__label">Exchange</span><div className="wlc__identv">{exchange || '—'}</div></div>
            {!composer?.entryId && (
              <button className="btn btn--mini" onClick={() => { setCurrency(''); setTicker(''); setCandidates(null); setReference(null) }}>Change</button>
            )}
          </div>
        )}
        {!currency && ticker && (
          <div className="wlc__warn">
            Without a currency this row cannot be priced, so its triggers will read “not evaluable” rather
            than showing a number from a same-named listing somewhere else.
          </div>
        )}

        {/* 2 — your judgment */}
        <div className="wlc__field">
          <span className="wlc__label">Why you're watching <span className="wlc__req">*</span></span>
          <textarea
            className="fld wlc__why" rows={3} value={why} onChange={(e) => setWhy(e.target.value)}
            placeholder="What would make you buy this, and at what level?" aria-label="Why you are watching"
          />
        </div>

        <div className="wlc__row">
          <div className="wlc__field" style={{ flex: 1 }}>
            <span className="wlc__label">Conviction</span>
            <div className="seg" role="group" aria-label="Conviction">
              {(['low', 'medium', 'high'] as const).map((c) => (
                <button key={c} className={`seg__btn${conviction === c ? ' seg__btn--on' : ''}`} onClick={() => setConviction(conviction === c ? null : c)}>
                  {c[0].toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="wlc__field">
            <span className="wlc__label">Review date</span>
            <input className="fld fld--date" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} aria-label="Review date" />
          </div>
        </div>

        <div className="wlc__field">
          <span className="wlc__label">Tags</span>
          <div className="wlc__tags">
            {tags.map((t) => (
              <button key={t} className="wl__trg" onClick={() => setTags(tags.filter((x) => x !== t))} title="Remove">{t} ✕</button>
            ))}
            <input
              className="fld wlc__taginput" placeholder="+ tag" value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                const v = tagDraft.trim().toLowerCase()
                if (v && !tags.includes(v) && tags.length < 12) setTags([...tags, v])
                setTagDraft('')
              }}
              aria-label="Add a tag"
            />
          </div>
        </div>

        {/* 3 — triggers */}
        <div className="wlc__field">
          <span className="wlc__label">Triggers <span className="wlc__labelnote">{triggers.length}/6</span></span>
          {triggers.map((t, i) => (
            <TriggerEditor
              key={i} trigger={t} currency={currency || '—'}
              onChange={(next) => setTriggers(triggers.map((x, j) => (j === i ? next : x)))}
              onRemove={() => setTriggers(triggers.filter((_, j) => j !== i))}
            />
          ))}
          {triggers.length < 6 && (
            <div className="wlc__addtrg">
              {(Object.keys(TRIGGER_LABEL) as DraftTrigger['kind'][]).map((k) => {
                const can = canAddTrigger(k, triggers)
                return (
                  <button
                    key={k}
                    className="btn btn--mini"
                    disabled={!can.ok}
                    title={can.why ?? `Add a trigger: ${TRIGGER_LABEL[k].toLowerCase()}`}
                    onClick={() => setTriggers([...triggers, newTrigger(k, trgCtx)])}
                  >
                    + {TRIGGER_LABEL[k]}
                  </button>
                )
              })}
            </div>
          )}
          {!triggers.length && (
            <div className="wlc__hint">Without a trigger this is a reminder — it will not be checked against the price.</div>
          )}
        </div>
      </div>

      <div className="wlc__foot">
        <button className="btn btn--ghost" onClick={close}>Cancel</button>
        {blocker && <span className="wlc__blocker">{blocker}</span>}
        <button className="btn btn--amber" disabled={!canSave} title={blocker ?? undefined} onClick={() => void submit()}>
          {saving ? 'Saving…' : composer?.entryId ? 'Save changes' : 'Add to watchlist'}
        </button>
      </div>
    </motion.div>
  )
}
