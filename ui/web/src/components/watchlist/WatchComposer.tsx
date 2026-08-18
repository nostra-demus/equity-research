import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { TriggerEditor, TRIGGER_LABEL, canAddTrigger, newTrigger, triggerDraftProblem, type DraftTrigger } from './TriggerEditor'
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
  const tickers = useStore((s) => s.tickers)
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
  const [files, setFiles] = useState<File[]>([])
  const [isDrag, setIsDrag] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

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
    setFiles([])
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
    }, composer?.entryId ?? null, files)
    setSaving(false)
    if (!ok) return
  }

  function addFiles(next: File[]) {
    const pdfs = next.filter((f) => /\.pdf$/i.test(f.name))
    setFiles((cur) => [...cur, ...pdfs].slice(0, 5))
  }

  // The companies the engine already has documents for, filtered by the same box. Prefix matches first,
  // which is what someone typing a ticker means.
  const poolMatches = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return []
    return tickers
      .filter((t) => t.ticker.includes(q))
      .sort((a, b) => Number(b.ticker.startsWith(q)) - Number(a.ticker.startsWith(q)) || a.ticker.localeCompare(b.ticker))
      .slice(0, 5)
  }, [tickers, query])

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
          {/* An engine row has no entry file until you touch it, so "Edit" on one is really "add your own
              layer to it". Saying "Add to watchlist" after the person clicked Edit is just wrong. */}
          <div className="activity__title">
            {composer?.entryId ? `Edit ${ticker}` : prefill?.ticker ? `Track ${ticker} yourself` : 'Add to watchlist'}
          </div>
          <div className="activity__sub">
            {composer?.entryId ? (company || 'Change the reason, the triggers or the review date')
              : prefill?.ticker ? 'The engine already lists this — add your own reason and a trigger it can check'
              : 'Find a listing, then say why you are watching it'}
          </div>
        </div>
        <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
      </div>

      <div className="wlc__body">
        {/* 1 — identity. Resolved, never typed. */}
        {!resolved && !composer?.entryId && (
          <div className="wlc__field">
            {/* ONE search, not two lists. Typing filters the companies you already have (instant, local)
                and the same box looks the name up against the symbol directory when it is not one of
                them. Two stacked sections asked the person to know which kind of name they were adding
                before they had typed it. */}
            <span className="wlc__label">Which company?</span>
            <div className="wlc__row">
              <input
                className="fld" placeholder="Ticker or name — e.g. V, or AMZN" value={query}
                onChange={(e) => { setQuery(e.target.value); setCandidates(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter') void runResolve() }}
                aria-label="Company to add" autoFocus
              />
              <button className="btn" disabled={!query.trim() || resolving} onClick={() => void runResolve()}>
                {resolving ? 'Looking…' : 'Look up'}
              </button>
            </div>

            {/* the pool first: these are names the engine already has documents for */}
            {!!poolMatches.length && !candidates && (
              <div className="wlc__cands">
                <div className="wlc__candhead">Companies you already have</div>
                {poolMatches.map((t) => (
                  <button key={t.ticker} className="wlc__cand" onClick={() => { setQuery(t.ticker); void resolveFor(t.ticker) }}>
                    <span className="wlc__candsym">{t.ticker}</span>
                    <span className="wlc__candname">{t.fileCount} file{t.fileCount === 1 ? '' : 's'}{t.latestRun?.decision ? ` · ${t.latestRun.decision}` : ''}</span>
                    <span className="wlc__candprice">in your pool</span>
                  </button>
                ))}
              </div>
            )}

            {candidates && (
              candidates.length ? (
                <div className="wlc__cands">
                  <div className="wlc__candhead">Listings matching “{query.trim()}”</div>
                  {candidates.map((c) => (
                    <button key={c.symbol} className="wlc__cand" onClick={() => pick(c)}>
                      <span className="wlc__candsym">{c.symbol}</span>
                      <span className="wlc__candname">{c.name}{c.exchange ? ` · ${c.exchange}` : ''}</span>
                      <span className="wlc__candprice">{c.price != null && c.currency ? `${c.currency} ${c.price.toFixed(2)}` : '—'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="wlc__hint">{ABSENT_RESOLVE[resolveReason ?? 'no_match'] ?? 'No listing found.'}</div>
              )
            )}
            {!candidates && !poolMatches.length && query.trim() && (
              <div className="wlc__hint">Press Look up to search every listing, including names the engine has never researched.</div>
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
        <div className="wlc__field">
          <span className="wlc__label">Thesis <span className="wlc__labelnote">{files.length}/5</span></span>
          <div
            className={`wlc__drop${isDrag ? ' is-drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDrag(true) }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={(e) => { e.preventDefault(); setIsDrag(false); addFiles(Array.from(e.dataTransfer.files)) }}
            onClick={() => fileInput.current?.click()}
          >
            <input ref={fileInput} type="file" accept="application/pdf" multiple hidden
              onChange={(e) => { addFiles(Array.from(e.target.files || [])); e.target.value = '' }} />
            {files.length
              ? `${files.length} file${files.length === 1 ? '' : 's'} ready — click to add more`
              : 'Drop or click to attach your write-up — PDF, up to 5'}
          </div>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="wlc__file">
              <span>{f.name}</span>
              <span className="wlc__filesize">{Math.round(f.size / 1024)} KB</span>
              <button className="btn btn--mini" onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          {/* The distinction that matters: this is a document you read, not a source a run may cite. */}
          <div className="wlc__hint">Kept with this row, not added to the company's research documents — so no run can cite it as evidence.</div>
        </div>
      </div>

      <div className="wlc__foot">
        <button className="btn btn--ghost" onClick={close}>Cancel</button>
        {blocker && <span className="wlc__blocker">{blocker}</span>}
        <button className="btn btn--amber" disabled={!canSave} title={blocker ?? undefined} onClick={() => void submit()}>
          {saving ? 'Saving…' : composer?.entryId ? 'Save changes' : prefill?.ticker ? `Track ${ticker}` : 'Add to watchlist'}
        </button>
      </div>
    </motion.div>
  )
}
