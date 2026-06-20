// The main-stage reader for one event — rebuilt around what a PM actually needs to make the call.
// The cheap scanner only saw the headline; on open we read the ARTICLE BODY (one Groq pass) and lead
// with its substance: the crux as bullets (THE STORY), WHO GAINS / WHO'S EXPOSED named from the
// article, the real companies (firms only, with their role) and whether we've analysed them, and the
// corrected theme. Triage metadata sits in the header, not in the way. Then: run / open / shelve.

import { useEffect, useRef } from 'react'
import { plainStage, plainTheme } from '../../lib/plain'
import { familyOf, isCompanyNameClient, roleLabel, SCOPES, scopeOf, sourceTierDef } from '../../lib/scope'
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
  useEffect(() => { wrapRef.current?.scrollTo({ top: 0 }) }, [it.event_id])
  // Esc backs out to the events list — the keyboard twin of the back button (this view fully owns the stage).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])
  const openRelated = (r: RelatedEvent) => {
    const full = newsItems.find((n) => n.event_id === r.event_id)
    selectEvent(
      full ||
        ({ kind: 'item', ts: r.ts, event_id: r.event_id, headline: r.headline, url: '', domain: '', source_name: r.source_name, via: 'rss', region: '', input_nature: '', triage_score: r.triage_score, band: 'pick', triage_reason: '', relevance: '', event_types: [], issuer_linkage: '', companies: [], size_bucket: 'unknown', scope: r.scope, dedup_status: '', inboxed: false } as FeedItem),
    )
  }

  const enr = enrichCache[it.event_id]
  const enrichment = enr && enr !== 'loading' ? enr : undefined
  const shelved = shelvedEvents.has(it.event_id)
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  const s = scopeOf(it)
  const fam = familyOf(s)
  const tier = sourceTierDef(it.source_tier)
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
          <span className="evdetail__score mono" style={{ color: tone, borderColor: tone }} title="Quick score out of 100 — a first read by the free scanner, not the full check">
            {it.triage_score}
          </span>
          {s !== 'unknown' && (
            <span className={`evdetail__scope evdetail__scope--${fam}`} title={SCOPES[s].meaning}>
              {SCOPES[s].label}
            </span>
          )}
          {tier && <span className="evdetail__tier" title={tier.meaning}>{tier.label}</span>}
          <span className="evdetail__when">{fmtTime(it.ts)}</span>
        </div>

        <h1 className="evdetail__headline">{it.headline}</h1>

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
                    <button type="button" className="evdetail__rel evdetail__rel--btn" onClick={() => openRelated(r)} title="Open this event to check it">
                      <span className="evdetail__rel-score mono">{r.triage_score}</span>
                      <span className="evdetail__rel-hl">{r.headline}</span>
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
