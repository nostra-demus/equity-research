// The main-stage reader for one event — rebuilt around what a PM actually needs to make the call.
// The cheap scanner only saw the headline; on open we read the ARTICLE BODY (one Groq pass) and lead
// with its substance: the crux as bullets (THE STORY), WHO GAINS / WHO'S EXPOSED named from the
// article, the real companies (firms only, with their role) and whether we've analysed them, and the
// corrected theme. Triage metadata sits in the header, not in the way. Then: run / open / shelve.

import { useEffect, useRef, useState } from 'react'
import { displayHeadline, originalHeadline, translatedFromLang, plainSize, plainStage, plainTheme } from '../../lib/plain'
import { familyOf, isCompanyNameClient, roleLabel, SCOPES, scopeOf, sourceTierDef } from '../../lib/scope'
import { discoveryCapDelta } from '../../lib/rankWeights'
import { useStore } from '../../lib/store'
import type { ArticleParty, EventEnrichment, FeedItem, RelatedEvent } from '../../lib/types'

const fmtTime = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso.slice(0, 16).replace('T', ' ') : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const SEC_FLAG = /^(4\.02|5\.02|5\.01|3\.01|1\.03|2\.06)$/

// THE STORY — gist bullets read from the body (primary), the parsed SEC filing (for EDGAR), the regex
// summary (fallback), or an honest note. Never a blank card.
function StoryBlock({ enr }: { enr: EventEnrichment | 'loading' | undefined }) {
  if (enr === 'loading' || enr === undefined) {
    return (
      <div className="evdetail__block">
        <div className="evdetail__label">The story</div>
        <div className="evdetail__shimmer" aria-hidden />
        <div className="evdetail__shimmer evdetail__shimmer--short" aria-hidden />
        <div className="evdetail__hint">Reading the article…</div>
      </div>
    )
  }
  const sec = enr.sec
  return (
    <>
      {!sec && enr.corroborated && (
        <div className="evdetail__corrob" title="The original publisher blocked our reader, so this brief is pieced together from other outlets reporting the same event — verify against the source before relying on it.">
          <span className="evdetail__corrob-tag">Corroborated</span>
          <span className="evdetail__corrob-text">
            Publisher blocked the direct read — pieced together from {enr.corroborated.count} other outlet{enr.corroborated.count === 1 ? '' : 's'}
            {enr.corroborated.domains.length ? ` · ${enr.corroborated.domains.slice(0, 4).join(', ')}` : ''}.
          </span>
        </div>
      )}
      {sec && (
        <div className="evdetail__block">
          <div className="evdetail__label">What was filed</div>
          <div className="evdetail__filing">
            <span className="evdetail__form mono">{sec.form}</span>
            {sec.form_label && <span className="evdetail__formlabel">{sec.form_label}</span>}
            {sec.filer && <span className="evdetail__filer">{sec.filer}</span>}
            {sec.routine && <span className="evdetail__routine" title="A high-volume filing that rarely moves the stock on its own">routine</span>}
          </div>
          {/* What this form IS, in plain English — the answer to "what am I even looking at" */}
          {sec.form_meaning && <p className="evdetail__formmeaning">{sec.form_meaning}</p>}
          {!!sec.items.length && (
            <ul className="evdetail__items">
              {sec.items.map((i) => (
                <li key={i.code} className={`evdetail__item${SEC_FLAG.test(i.code) ? ' evdetail__item--flag' : ''}`}>
                  <span className="evdetail__itemcode mono">{i.code}</span>
                  <span className="evdetail__itemlabel">{i.label}</span>
                </li>
              ))}
            </ul>
          )}
          {(sec.period || sec.filed) && (
            <div className="evdetail__hint">
              {sec.filed && `Filed ${sec.filed}`}
              {sec.filed && sec.period && ' · '}
              {sec.period && `covers ${sec.period}`}
            </div>
          )}
        </div>
      )}
      {!sec && !!enr.gist?.length && (
        <div className="evdetail__block">
          <div className="evdetail__label">The story</div>
          <ul className="evdetail__gist">
            {enr.gist.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
          {enr.published && <div className="evdetail__hint">Published {fmtTime(enr.published)}</div>}
        </div>
      )}
      {!sec && !enr.gist?.length && enr.summary && (
        <div className="evdetail__block">
          <div className="evdetail__label">The story</div>
          <p className="evdetail__story">{enr.summary}</p>
          {enr.published && <div className="evdetail__hint">Published {fmtTime(enr.published)}</div>}
        </div>
      )}
      {!sec && !enr.gist?.length && !enr.summary && (
        <div className="evdetail__block">
          <div className="evdetail__label">The story</div>
          <div className="evdetail__hint">{enr.note || 'Source blocked — headline only. Open the source to read it.'}</div>
        </div>
      )}
    </>
  )
}

// WHO GAINS / WHO'S EXPOSED — the value the reader actually asked for: WHICH names, from the article.
// Named firms render solid; an inferred sector/group renders muted with a "(sector)" tag; never invented.
function PartyList({ parties }: { parties: ArticleParty[] }) {
  const focusCompany = useStore((s) => s.scFocusCompany)
  return (
    <ul className="evdetail__pclist">
      {parties.map((p, i) => (
        <li key={`${p.name}-${i}`} className="evdetail__party">
          {p.named_in_article ? (
            <button type="button" className="evdetail__party-name evdetail__party-name--btn" onClick={() => focusCompany({ name: p.name, ticker: null })} title={`See all wire news on ${p.name}`}>{p.name}</button>
          ) : (
            <span className="evdetail__party-name">{p.name}</span>
          )}
          {!p.named_in_article && <span className="evdetail__party-tag">sector</span>}
          {p.basis && <span className="evdetail__party-basis"> — {p.basis}</span>}
        </li>
      ))}
    </ul>
  )
}

// WHY THIS SCORE — the number is the cheap scanner's first read, and a "100" on its own tells the PM
// nothing. This opens the box: the Groq title read is the anchor, then deterministic §4-hierarchy
// adjustments (source / focus / event / size / freshness) sum and clamp to it. Each row shows the
// exact value that won and the points it added — so the score is explainable from evidence rows, not
// vibes (CLAUDE.md §12), and the levers are visible to anyone tuning the weights.
// Freshness label from the item's actual age — NOT from the recency POINTS (which the weight panel makes
// tunable; keying the label on points showed a blank/wrong bucket after any edit). Mirrors the fixed
// thresholds in the server's recencyBonus (rank.ts), which are tunable in points but fixed in buckets.
function freshnessLabel(ts: string): string {
  const t = new Date(ts).getTime()
  if (Number.isNaN(t)) return ''
  const hrs = (Date.now() - t) / 3_600_000
  if (hrs < 1) return 'under an hour old'
  if (hrs < 3) return 'under 3 hours old'
  if (hrs < 6) return 'under 6 hours old'
  if (hrs < 12) return 'under 12 hours old'
  if (hrs < 24) return 'under a day old'
  return 'over a day old'
}
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)
const ptsClass = (n: number) => (n > 0 ? 'scorewhy__pts--pos' : n < 0 ? 'scorewhy__pts--neg' : 'scorewhy__pts--zero')

function ScoreWhy({ it, anchorRef, open, onToggle }: { it: FeedItem; anchorRef: React.RefObject<HTMLDivElement>; open: boolean; onToggle: () => void }) {
  const score = it.triage_score
  const tone = score >= 70 ? 'var(--live)' : score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  const band = score >= 70 ? 'High — a real candidate' : score >= 40 ? 'Medium — worth a look' : 'Low — probably noise'
  const rf = it.rank_factors

  // Nothing to explain at all — no breakdown AND no reason → render nothing, never an empty card.
  if (!rf && !it.triage_reason) return null

  // The header doubles as the toggle: the score + band stay visible (the answer at a glance), the
  // build-up collapses underneath. Collapsed by default — the reader opens it on demand.
  const header = (
    <button
      type="button"
      className="scorewhy__toggle"
      onClick={onToggle}
      aria-expanded={open}
      title={open ? 'Hide the score breakdown' : 'See why this score — the headline read and the §4 adjustments'}
    >
      <span className="evdetail__label scorewhy__label">Why this score</span>
      <span className="scorewhy__num mono" style={{ color: tone, borderColor: tone }}>{score}</span>
      <span className="scorewhy__band" style={{ color: tone }}>{band}</span>
      <span className="scorewhy__caret" aria-hidden>▾</span>
    </button>
  )

  // No breakdown on this item (an older wire line, or a related-event stand-in) — show the plain
  // reason alone rather than a broken card.
  if (!rf) {
    return (
      <div className={`evdetail__block scorewhy${open ? ' scorewhy--open' : ''}`} ref={anchorRef}>
        {header}
        {open && (
          <div className="scorewhy__body">
            {it.triage_reason && <p className="scorewhy__reason">{it.triage_reason}</p>}
            <div className="scorewhy__foot">A quick first read of the headline only — running the checks scores it properly with the full evidence.</div>
          </div>
        )}
      </div>
    )
  }

  const base = rf.materiality
  const tier = sourceTierDef(rf.source_tier_id)
  const scopeDef = SCOPES[rf.scope_id as keyof typeof SCOPES]
  const adjRows = [
    { k: 'Source', v: tier?.label ?? rf.source_tier_id, why: tier?.meaning, pts: rf.source_tier },
    { k: 'Focus', v: scopeDef?.label ?? rf.scope_id, why: scopeDef?.meaning, pts: rf.scope },
    { k: 'Event', v: it.event_types?.length ? it.event_types.map(plainTheme).join(', ') : '—', why: 'The biggest event named in the headline counts.', pts: rf.event },
    { k: 'Size', v: plainSize(it.size_bucket), why: undefined as string | undefined, pts: rf.size },
    { k: 'Freshness', v: freshnessLabel(it.ts), why: 'Newer news counts for a little more.', pts: rf.recency },
  ]
  // The §4 adjustments are summed, then scaled by the GLOBAL boost — the Scoring panel's own formula
  // ("the AI's headline read + these adjustments × overall boost"); see rank.ts:
  // boost = (source_tier+scope+event+size+recency) × boost_weight. The boost_weight that produced THIS
  // score travels with it in rank_factors, so the ledger reconciles exactly even after a panel edit.
  // Show the boost as its own row only when it actually moves the total (weight ≠ 1).
  const w = typeof rf.boost_weight === 'number' ? rf.boost_weight : 1
  const adjSum = adjRows.reduce((s, r) => s + r.pts, 0)
  const boostDelta = Math.round(adjSum * w) - adjSum
  const baseRows = boostDelta !== 0
    ? [...adjRows, { k: 'Overall boost', v: `×${w.toFixed(2)} on the adjustments above`, why: undefined as string | undefined, pts: boostDelta }]
    : adjRows
  // A `social` (Reddit/discovery) item carries its UNcapped factors, but the server holds its displayed
  // score below the pick/watch line (capSocialScore, §4/§24). Surface that hold-down as an explicit cut so
  // the ledger reconciles to the shown score (CLAUDE.md §12) instead of the rows silently overshooting it.
  const buildup = base + baseRows.reduce((s, r) => s + r.pts, 0)
  const capDelta = discoveryCapDelta(buildup, score, rf.source_tier_id)
  const rows = capDelta !== 0
    ? [...baseRows, { k: 'Discovery cap', v: 'Reddit / social — held below the pick line', why: 'Low-trust chatter can surface a story but never lead the wire.', pts: capDelta }]
    : baseRows
  const raw = base + rows.reduce((s, r) => s + r.pts, 0)
  const capped = raw > score && score >= 100
  const floored = raw < score && score <= 0
  const isAdd = score >= base
  const lo = Math.min(base, score)
  const hi = Math.max(base, score)

  return (
    <div className={`evdetail__block scorewhy${open ? ' scorewhy--open' : ''}`} ref={anchorRef}>
      {header}
      {open && (
        <div className="scorewhy__body">
          {it.triage_reason && <p className="scorewhy__reason">{it.triage_reason}</p>}

          {/* meter: the title read got it most of the way; the §4 adjustments pushed it the rest */}
          <div className="scorewhy__meter" role="img" aria-label={`Headline read ${base}, final score ${score}`}>
            <span className="scorewhy__seg scorewhy__seg--base" style={{ width: `${lo}%` }} />
            <span className={`scorewhy__seg scorewhy__seg--${isAdd ? 'add' : 'cut'}`} style={{ width: `${hi - lo}%` }} />
          </div>
          <div className="scorewhy__metercap">
            <span>Headline read <b>{base}</b></span>
            <span className="scorewhy__arrow" aria-hidden>→</span>
            <span>{isAdd ? 'lifted to' : 'trimmed to'} <b style={{ color: tone }}>{score}</b></span>
          </div>

          {/* the ledger — every parameter considered, the value that won, and the points it moved */}
          <div className="scorewhy__ledger">
            <div className="scorewhy__row scorewhy__row--base">
              <span className="scorewhy__rk">Headline read</span>
              <span className="scorewhy__rv">A quick AI scan of the title — how big a deal it looks</span>
              <span className="scorewhy__pts">{base}</span>
            </div>
            {rows.map((r) => (
              <div className="scorewhy__row" key={r.k}>
                <span className="scorewhy__rk">{r.k}</span>
                <span className="scorewhy__rv">{r.v}{r.why && <span className="scorewhy__rwhy">{r.why}</span>}</span>
                <span className={`scorewhy__pts ${ptsClass(r.pts)}`}>{signed(r.pts)}</span>
              </div>
            ))}
            <div className="scorewhy__row scorewhy__row--total">
              <span className="scorewhy__rk">Score</span>
              <span className="scorewhy__rv">{capped ? `adds to ${raw}, capped at 100` : floored ? `adds to ${raw}, held at 0` : 'out of 100'}</span>
              <span className="scorewhy__pts scorewhy__pts--total mono" style={{ color: tone }}>{score}</span>
            </div>
          </div>

          <div className="scorewhy__foot">A first read of the headline only — running the checks re-scores it with the full evidence.</div>
        </div>
      )}
    </div>
  )
}

export function EventDetail({ it }: { it: FeedItem }) {
  const close = useStore((s) => s.scSelectEvent)
  const run = useStore((s) => s.runEventChecks)
  const scGraph = useStore((s) => s.scGraph) // the SCREENER swarm graph (signal-gate…candidate-surfacing) — NOT the research s.graph
  // the screener pipeline stages in dependency order — drives the "run only through X" picker.
  // Derived from the live screener graph (zero-touch: new modules appear automatically); plain names via plainStage.
  const scStages = (scGraph?.modules || []).slice().sort((a, b) => a.order - b.order)
  const staticMode = useStore((s) => s.staticMode)
  const enrichCache = useStore((s) => s.enrichCache)
  const shelvedEvents = useStore((s) => s.shelvedEvents)
  const toggleShelve = useStore((s) => s.toggleShelve)
  const newsItems = useStore((s) => s.newsItems)
  const selectEvent = useStore((s) => s.scSelectEvent)
  const focusCompany = useStore((s) => s.scFocusCompany)

  // jump to a related event so the user can check it: open the full wire item if we still hold it,
  // else a minimal stand-in (the reader re-fetches its detail by event_id either way).
  const wrapRef = useRef<HTMLDivElement>(null)
  const whyRef = useRef<HTMLDivElement>(null)
  // "Why this score" is collapsed by default and resets to collapsed on every newly-opened event —
  // the breakdown is on-demand, not in the way (the score + band stay visible in its header).
  const [whyOpen, setWhyOpen] = useState(false)
  useEffect(() => { wrapRef.current?.scrollTo({ top: 0 }); setWhyOpen(false) }, [it.event_id])
  // Esc backs out to the events list — the keyboard twin of the back button. But a panel/modal layered ON
  // TOP of the reader (Sources / Calls / Activity / Output / pipeline / news-feed / Scoring / signal-intake /
  // stop-list) owns Escape — Scoring and the others close on their own Escape, and the modals should swallow
  // it rather than let the reader vanish from under them. Don't STEAL that — only back out when nothing is
  // open over the reader. Read the store non-reactively so the listener isn't re-bound on every panel toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const s = useStore.getState()
      if (s.activityOpen || s.callsOpen || s.sourcesOpen || s.pipelineOpen || s.newsFeedOpen || s.openOutput || s.scoringOpen || s.signalIntakeOpen || s.stopListOpen) return
      close(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])
  // the header score chip is the "see why" affordance — open the breakdown, then scroll it into view
  // (next frame, so the now-expanded panel is measured before centering)
  const jumpToWhy = () => {
    setWhyOpen(true)
    requestAnimationFrame(() => whyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
  const openRelated = (r: RelatedEvent) => {
    const full = newsItems.find((n) => n.event_id === r.event_id)
    selectEvent(
      full ||
        ({ kind: 'item', ts: r.ts, event_id: r.event_id, headline: r.headline, headline_en: r.headline_en, url: '', domain: '', source_name: r.source_name, via: 'rss', region: '', input_nature: '', triage_score: r.triage_score, band: 'pick', triage_reason: '', relevance: '', event_types: [], issuer_linkage: '', companies: [], size_bucket: 'unknown', scope: r.scope, dedup_status: '', inboxed: false } as FeedItem),
    )
  }

  const enr = enrichCache[it.event_id]
  const enrichment = enr && enr !== 'loading' ? enr : undefined
  const shelved = shelvedEvents.has(it.event_id)
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  const s = scopeOf(it)
  const fam = familyOf(s)
  const tier = sourceTierDef(it.source_tier)
  const origHeadline = originalHeadline(it) // source-language original, shown under the English when translated
  const origLang = translatedFromLang(it) // the named source language (e.g. "Finnish"), when we have it
  // when the publisher blocked the direct read, the read-through (who gains / companies) was pieced together
  // from OTHER outlets, NOT read from THIS article — so the attribution copy must say so (CLAUDE.md §3).
  const corroborated = !!enrichment?.corroborated

  // companies: prefer the body-read firms (with role + where they're listed); else the headline guess
  const companies = enrichment?.companies?.length
    ? enrichment.companies.map((c) => ({ name: c.name, ticker: c.ticker, listing_country: c.listing_country ?? null, exchange: c.exchange ?? null, role: c.role }))
    : (it.companies || []).filter((c) => isCompanyNameClient(c.name)).map((c) => ({ name: c.name, ticker: c.ticker, listing_country: null as string | null, exchange: null as string | null, role: undefined as string | undefined }))
  // the company the story is about + where it trades — the "which market / where would I buy this"
  // glance a global investor needs. From the article-body read; null until that read lands.
  const subject = companies.find((c) => c.role === 'subject') || (companies.length === 1 ? companies[0] : undefined)
  const subjectWhere = subject ? [subject.listing_country, subject.exchange].filter(Boolean).join(' · ') : ''
  const didRead = !!(enrichment && (enrichment.gist?.length || enrichment.companies?.length || enrichment.beneficiaries?.length || enrichment.exposed?.length))
  const benefits = enrichment?.beneficiaries || []
  const exposed = enrichment?.exposed || []
  const themeKey = enrichment?.theme || it.event_types?.[0]

  const coverageFor = (name: string, ticker: string | null) => {
    const tk = (ticker || '').toUpperCase()
    return enrichment?.prior_coverage?.find((p) => p.ticker === tk || p.ticker.toLowerCase() === name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  }

  return (
    <div className="evdetail-wrap" ref={wrapRef}>
      <article className="evdetail" key={`${it.event_id}-${it.ts}`}>
        <button type="button" className="evdetail__back" onClick={() => close(null)} title="Back to events (Esc)">
          <span className="evdetail__back-arrow" aria-hidden>‹</span>
          Back to events
        </button>

        <div className="evdetail__top">
          <button type="button" className="evdetail__score evdetail__score--btn mono" style={{ color: tone, borderColor: tone }} onClick={jumpToWhy} title="Quick score out of 100 — a first read by the free scanner. Click to see why.">
            {it.triage_score}
          </button>
          {s !== 'unknown' && (
            <span className={`evdetail__scope evdetail__scope--${fam}`} title={SCOPES[s].meaning}>
              {SCOPES[s].label}
            </span>
          )}
          {tier && <span className="evdetail__tier" title={tier.meaning}>{tier.label}</span>}
          <span className="evdetail__when">{fmtTime(it.ts)}</span>
        </div>

        <h1 className="evdetail__headline">{displayHeadline(it)}</h1>
        {origHeadline && (
          <div className="evdetail__headline-orig" title={`The headline as the source published it${origLang ? ` (${origLang})` : ''}, before translation to English`}>
            <span className="evdetail__headline-orig-tag">{origLang ? `original · ${origLang}` : 'original'}</span>
            {origHeadline}
          </div>
        )}

        <div className="evdetail__source">
          <span>{it.source_name}</span>
          {it.region && <span className="evdetail__sep">·</span>}
          {it.region && <span title="Where the news SOURCE is based — not necessarily where the company trades">{it.region}</span>}
          {it.via === 'rss' && <span className="evrow__tag evrow__tag--rss">RSS</span>}
        </div>

        {/* WHERE IT'S LISTED — the country + exchange for the company the story is about, at a glance */}
        {subjectWhere && (
          <div className="evdetail__listing" title="Where the company in this story is listed — read from the article; the checks verify it before any thesis">
            <span className="evdetail__listing-label">Listed</span>
            <span className="evdetail__listing-co">{[subject!.name, subject!.ticker].filter(Boolean).join(' · ')}</span>
            <span className="evdetail__listing-sep" aria-hidden>—</span>
            <span className="evdetail__listing-where">{subjectWhere}</span>
          </div>
        )}

        {/* what KIND of event — the company-vs-broad call, stated plainly */}
        {s !== 'unknown' && (
          <div className={`evdetail__scopebar evdetail__scopebar--${fam}`}>
            <span className="evdetail__scopebar-fam">{fam === 'company' ? 'Company-specific' : 'Broad context'}</span>
            <span className="evdetail__scopebar-meaning">{SCOPES[s].meaning}</span>
          </div>
        )}

        {/* WHY THIS SCORE — collapsed by default; the header (score + band) is the toggle */}
        <ScoreWhy it={it} anchorRef={whyRef} open={whyOpen} onToggle={() => setWhyOpen((v) => !v)} />

        {/* THE STORY — the crux, read from the article body */}
        <StoryBlock enr={enr} />

        {/* WHO GAINS / WHO'S EXPOSED — the named read-through (only once we've read the body) */}
        {didRead && (
          <div className="evdetail__verdict">
            <div className="evdetail__pc">
              <div className="evdetail__pccol evdetail__pccol--pro">
                <div className="evdetail__pchead">Who gains</div>
                {benefits.length ? <PartyList parties={benefits} /> : <div className="evdetail__pcnone">No specific winners named {corroborated ? 'across the corroborating outlets' : 'in the article'}.</div>}
              </div>
              <div className="evdetail__pccol evdetail__pccol--con">
                <div className="evdetail__pchead">Who’s exposed</div>
                {exposed.length ? <PartyList parties={exposed} /> : <div className="evdetail__pcnone">No specific losers named {corroborated ? 'across the corroborating outlets' : 'in the article'}.</div>}
              </div>
            </div>
          </div>
        )}

        {/* COMPANIES NAMED — firms only, with their role + whether we've analysed them */}
        {companies.length ? (
          <div className="evdetail__block">
            <div className="evdetail__label">Companies named</div>
            <div className="evdetail__colist">
              {companies.map((c, i) => {
                const cov = coverageFor(c.name, c.ticker)
                return (
                  <div key={`${c.name}-${i}`} className="evdetail__co">
                    <button type="button" className="evdetail__chip evdetail__chip--co evdetail__chip--btn" onClick={() => focusCompany({ name: c.name, ticker: c.ticker, listing_country: c.listing_country, exchange: c.exchange })} title={`See all wire news on ${c.name}`}>
                      {[c.name, c.ticker].filter(Boolean).join(' · ')}
                      <span className="evdetail__chip-go" aria-hidden>›</span>
                    </button>
                    {(c.listing_country || c.exchange) && (
                      <span className="evdetail__listingtag" title={corroborated ? "Where it's listed (from the corroborating wire)" : "Where it's listed (from the article read)"}>{[c.listing_country, c.exchange].filter(Boolean).join(' · ')}</span>
                    )}
                    {c.role && c.role !== 'mentioned' && <span className="evdetail__role">{roleLabel(c.role)}</span>}
                    {cov ? (
                      <span className={`evdetail__cov evdetail__cov--${cov.kind}`} title={cov.path}>{cov.kind === 'analysis' ? '✓ ' : ''}{cov.detail}</span>
                    ) : (
                      <span className="evdetail__cov evdetail__cov--new">Net-new name</span>
                    )}
                  </div>
                )
              })}
            </div>
            {!enrichment?.companies?.length && <div className="evdetail__hint">Guessed from the headline — the checks verify this properly.</div>}
          </div>
        ) : didRead ? (
          <div className="evdetail__block">
            <div className="evdetail__label">Companies named</div>
            <div className="evdetail__hint">No company is the subject — this is a {fam === 'broad' ? 'macro / sector / policy' : 'broad'} read, not a single name.</div>
          </div>
        ) : null}

        {/* THEME — the corrected single tag */}
        {themeKey && (
          <div className="evdetail__block">
            <div className="evdetail__label">Theme</div>
            <div className="evdetail__chips">
              <span className="evdetail__chip evdetail__chip--theme">{plainTheme(themeKey)}</span>
              {s !== 'unknown' && <span className="evdetail__chip">{SCOPES[s].label}</span>}
            </div>
          </div>
        )}

        {/* RELATED — only genuinely on-topic items, else say so */}
        {enrichment && (
          <div className="evdetail__block">
            <div className="evdetail__label">Related recent events</div>
            {enrichment.related.length ? (
              <ul className="evdetail__related">
                {enrichment.related.map((r) => (
                  <li key={`${r.event_id}-${r.ts}`}>
                    <button type="button" className="evdetail__rel evdetail__rel--btn" onClick={() => openRelated(r)} title={originalHeadline(r) ? `original: ${originalHeadline(r)}` : 'Open this event to check it'}>
                      <span className="evdetail__rel-score mono">{r.triage_score}</span>
                      <span className="evdetail__rel-hl">{displayHeadline(r)}</span>
                      <span className="evdetail__rel-src">{r.source_name}</span>
                      <span className="evdetail__rel-go" aria-hidden>↗</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="evdetail__hint">Nothing closely related on the wire in the last two days.</div>
            )}
          </div>
        )}

        <div className="evdetail__actions">
          <div className="evdetail__actions-bar">
            <div className="evdetail__run">
              <button className="btn btn--amber evdetail__runbtn" onClick={() => void run(it)} title={staticMode ? 'Runs on your local machine (npm run dev)' : 'Run the full gauntlet — every stage'}>
                Run the checks ▸
              </button>
              <span className="evdetail__est mono">about $8–45 · stops early (and cheaper) if a check says no</span>
            </div>
            <div className="evdetail__utility">
              <button className="btn btn--ghost evdetail__shelfbtn" onClick={() => toggleShelve(it.event_id)} title={shelved ? 'Bring this back to the wire' : 'Set this aside — not worth a check right now'}>
                {shelved ? 'Bring back' : 'Set aside'}
              </button>
              {it.url && (
                <a className="btn btn--ghost" href={it.url} target="_blank" rel="noreferrer">Open source ↗</a>
              )}
            </div>
          </div>
          {scStages.length > 1 && (
            <div className="evdetail__through">
              <span className="evdetail__through-label mono">or run only through</span>
              <div className="evdetail__through-chips">
                {scStages.slice(0, -1).map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    className="evdetail__chip evdetail__chip--btn"
                    onClick={() => void run(it, m.name)}
                    title={`Run the gauntlet through "${plainStage(m.name)}" and stop there — finished checks are saved, and you can Continue the rest later`}
                  >
                    {plainStage(m.name)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
