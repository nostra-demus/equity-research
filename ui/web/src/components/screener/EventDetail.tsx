// The main-stage reader for one event the user picked off the rail — rebuilt as a decision surface.
// The cheap scanner only ever saw the headline; this view pulls everything else a person needs to
// answer "is this worth a paid check, or do I set it aside?": what KIND of event it is (company vs
// broad scope), how good the SOURCE is (§4 tier), the at-a-glance read (materiality / relevance /
// novelty / size), the named companies AND whether the engine has already analysed them, the real
// STORY behind the headline (and, for SEC filings, the actual items filed), related recent events,
// and a plain "is it worth it?" read. Then the one decision: run the checks, open the source, or shelve.

import { useMemo } from 'react'
import { plainBand, plainSize, plainTheme } from '../../lib/plain'
import { familyOf, SCOPES, scopeOf, sourceTierDef } from '../../lib/scope'
import { useStore } from '../../lib/store'
import type { EventEnrichment, FeedItem } from '../../lib/types'

const fmtTime = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso.slice(0, 16).replace('T', ' ') : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const relevanceLabel = (r?: string) => (r === 'material' ? 'Material' : r === 'relevant_non_material' ? 'Relevant, smaller' : r === 'irrelevant' ? 'Not material' : '—')

// How a buy-side reader would PLAY this kind of event — the trade shape, by scope. Honest about the
// fact that broad events aren't single-stock ideas (CLAUDE.md §21).
const PLAY_BY_SCOPE: Record<string, string> = {
  single_name: 'Single-stock idea — the most direct kind. Worth a look if it’s a name you’d consider owning or shorting.',
  multi_name: 'A pair / read-across — the named companies move together or against each other (often a relative trade).',
  sector: 'A sector basket — play the group or an ETF, not one stock; look for the read-across winners and losers.',
  macro: 'A top-down macro view — usually a portfolio tilt (rates / FX / cyclicals), not a single name.',
  commodity: 'A commodity play — the affected producers and users, not the headline itself.',
  policy: 'A policy / rules theme — the winners and losers from the rule change, usually expressed as a basket.',
  unknown: 'Open the source to see what it’s about before deciding how to play it.',
}
const SEC_FLAG = /^(4\.02|5\.02|5\.01|3\.01|1\.03|2\.06|2\.01|2\.04)$/

// The one-glance judgement: what to play, the reasons FOR a paid check, and the reasons to skip/shelve.
// Every line is tied to a concrete signal we already hold (scope / source tier / score / newness /
// the filing's own items / prior coverage) — never an unsupported claim about the company (§3).
function playRead(it: FeedItem, enr?: EventEnrichment): { play: string; pros: string[]; cons: string[] } {
  const s = scopeOf(it)
  const fam = familyOf(s)
  const tier = it.source_tier
  const co = it.companies?.[0]
  const ticker = co?.ticker
  const pros: string[] = []
  const cons: string[] = []

  // ---- pros (why it could be worth the spend) ----
  if (it.triage_score >= 70) pros.push(`Scored ${it.triage_score}/100 — the scanner flags it as clearly decision-relevant.`)
  if (tier === 'primary_filing') pros.push('Primary source — a filing / exchange disclosure, not second-hand.')
  const flagged = enr?.sec?.items?.find((i) => SEC_FLAG.test(i.code))
  if (flagged) pros.push(`The filing flags a real corporate event: ${flagged.label.toLowerCase()}.`)
  if (enr?.sec?.items?.some((i) => i.code === '2.02')) pros.push('An earnings filing — fresh numbers to react to.')
  if (fam === 'company' && ticker) pros.push(`Names a listed company (${ticker}) you can act on directly.`)
  const pool = enr?.prior_coverage?.find((p) => p.kind === 'data_pool')
  if (pool) pros.push(`We already hold a data pool for ${pool.ticker} — a check is cheap to extend.`)
  if (it.dedup_status !== 'possible_duplicate' && it.relevance === 'material' && it.triage_score >= 60) pros.push('New to us and material — not a recycled story.')
  if (fam === 'company' && (it.size_bucket === 'mega' || it.size_bucket === 'large')) pros.push('A large, liquid name — easy to size a position.')

  // ---- cons (why you might skip or shelve) ----
  if (fam === 'broad') cons.push('No single stock — you’d express this as a basket or a macro view, not one name.')
  if (tier === 'unconfirmed') cons.push('Sourced to unnamed people — a lead to verify, not a fact.')
  else if (tier === 'news') cons.push('A newswire report — verify against the primary source before you lean on it.')
  if (it.triage_score < 50) cons.push(`Low score (${it.triage_score}) — most of these are noise; read the source before spending.`)
  if (fam === 'company' && !ticker) cons.push('No ticker pinned yet — confirm the exact listing before acting.')
  if (!it.companies?.length && fam !== 'broad') cons.push('No company named yet — harder to act on directly.')
  const analysed = enr?.prior_coverage?.find((p) => p.kind === 'analysis')
  if (analysed) cons.push(`Already analysed — ${analysed.detail.toLowerCase()}; the news may be priced in, so a check mostly refreshes the view.`)
  if (it.dedup_status === 'possible_duplicate') cons.push('Possibly a duplicate of an event already in the ledger.')

  return { play: PLAY_BY_SCOPE[s] || PLAY_BY_SCOPE.unknown, pros: pros.slice(0, 4), cons: cons.slice(0, 4) }
}

function StoryBlock({ it, enr }: { it: FeedItem; enr: EventEnrichment | 'loading' | undefined }) {
  if (enr === 'loading' || enr === undefined) {
    return (
      <div className="evdetail__block">
        <div className="evdetail__label">The story</div>
        <div className="evdetail__shimmer" aria-hidden />
        <div className="evdetail__shimmer evdetail__shimmer--short" aria-hidden />
        <div className="evdetail__hint">Reading the source…</div>
      </div>
    )
  }
  const sec = enr.sec
  return (
    <>
      {sec && (
        <div className="evdetail__block">
          <div className="evdetail__label">What was filed</div>
          <div className="evdetail__filing">
            <span className="evdetail__form mono">{sec.form}</span>
            {sec.form_label && <span className="evdetail__formlabel">{sec.form_label}</span>}
            {sec.filer && <span className="evdetail__filer">{sec.filer}</span>}
          </div>
          {!!sec.items.length && (
            <ul className="evdetail__items">
              {sec.items.map((i) => (
                <li key={i.code} className={`evdetail__item${/^4\.02$|^5\.0[12]$|^1\.03$|^3\.01$|^2\.06$/.test(i.code) ? ' evdetail__item--flag' : ''}`}>
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
      {enr.summary && (
        <div className="evdetail__block">
          <div className="evdetail__label">The story</div>
          <p className="evdetail__story">{enr.summary}</p>
          {enr.published && <div className="evdetail__hint">Published {fmtTime(enr.published)}</div>}
        </div>
      )}
      {!sec && !enr.summary && enr.note && (
        <div className="evdetail__block">
          <div className="evdetail__label">The story</div>
          <div className="evdetail__hint">{enr.note}</div>
        </div>
      )}
    </>
  )
}

export function EventDetail({ it }: { it: FeedItem }) {
  const close = useStore((s) => s.scSelectEvent)
  const run = useStore((s) => s.runEventChecks)
  const staticMode = useStore((s) => s.staticMode)
  const enrichCache = useStore((s) => s.enrichCache)
  const shelvedEvents = useStore((s) => s.shelvedEvents)
  const toggleShelve = useStore((s) => s.toggleShelve)

  const enr = enrichCache[it.event_id]
  const enrichment = enr && enr !== 'loading' ? enr : undefined
  const shelved = shelvedEvents.has(it.event_id)
  const kept = it.band !== 'drop'
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  const s = scopeOf(it)
  const fam = familyOf(s)
  const tier = sourceTierDef(it.source_tier)
  const read = useMemo(() => playRead(it, enrichment), [it, enrichment])

  // map a guessed company (by ticker/name) to its prior-coverage row, if any
  const coverageFor = (name: string, ticker: string | null) => {
    const tk = (ticker || '').toUpperCase()
    return enrichment?.prior_coverage?.find((p) => p.ticker === tk || p.ticker.toLowerCase() === name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  }

  return (
    <div className="evdetail-wrap">
      <article className="evdetail" key={`${it.event_id}-${it.ts}`}>
        <div className="evdetail__top">
          <span className="evdetail__score mono" style={{ color: tone, borderColor: tone }} title="Quick score out of 100 — a first read by the free scanner, not the full check">
            {it.triage_score}
          </span>
          {s !== 'unknown' && (
            <span className={`evdetail__scope evdetail__scope--${fam}`} title={SCOPES[s].meaning}>
              {SCOPES[s].label}
            </span>
          )}
          {tier && (
            <span className="evdetail__tier" title={tier.meaning}>
              {tier.label}
            </span>
          )}
          <span className={`evdetail__band${kept ? ' evdetail__band--kept' : ''}`}>{plainBand(it.band)}</span>
          <span className="evdetail__when">{fmtTime(it.ts)}</span>
          <button type="button" className="evdetail__close" onClick={() => close(null)} aria-label="Back to events" title="Back to events">
            ✕
          </button>
        </div>

        <h1 className="evdetail__headline">{it.headline}</h1>

        <div className="evdetail__source">
          <span>{it.source_name}</span>
          {it.region && <span className="evdetail__sep">·</span>}
          {it.region && <span>{it.region}</span>}
          {it.via === 'rss' && <span className="evrow__tag evrow__tag--rss">RSS</span>}
        </div>

        {/* what KIND of event — the company-vs-broad call, stated plainly */}
        {s !== 'unknown' && (
          <div className={`evdetail__scopebar evdetail__scopebar--${fam}`}>
            <span className="evdetail__scopebar-fam">{fam === 'company' ? 'Company-specific' : 'Broad context'}</span>
            <span className="evdetail__scopebar-meaning">{SCOPES[s].meaning}</span>
          </div>
        )}

        {/* at-a-glance read — the numbers the scanner already has */}
        <div className="evdetail__glance">
          <div className="evdetail__stat">
            <span className="evdetail__stat-k">Materiality</span>
            <span className="evdetail__stat-v">{it.triage_score}<span className="evdetail__stat-sub">/100 · {plainBand(it.band)}</span></span>
          </div>
          <div className="evdetail__stat">
            <span className="evdetail__stat-k">Relevance</span>
            <span className="evdetail__stat-v">{relevanceLabel(it.relevance)}</span>
          </div>
          <div className="evdetail__stat">
            <span className="evdetail__stat-k">Source</span>
            <span className="evdetail__stat-v">{tier?.label || '—'}</span>
          </div>
          <div className="evdetail__stat">
            <span className="evdetail__stat-k">Newness</span>
            <span className="evdetail__stat-v">{it.dedup_status === 'possible_duplicate' ? 'Seen before' : 'New to us'}</span>
          </div>
          {it.size_bucket && it.size_bucket !== 'unknown' && (
            <div className="evdetail__stat">
              <span className="evdetail__stat-k">Size</span>
              <span className="evdetail__stat-v">{plainSize(it.size_bucket)}</span>
            </div>
          )}
        </div>

        {/* the one-glance judgement — how to play it, then the reasons FOR and AGAINST a paid check */}
        <div className="evdetail__verdict">
          <div className="evdetail__play">
            <span className="evdetail__play-k">How to play it</span>
            <span className="evdetail__play-v">{read.play}</span>
          </div>
          <div className="evdetail__pc">
            <div className="evdetail__pccol evdetail__pccol--pro">
              <div className="evdetail__pchead">Why look</div>
              {read.pros.length ? (
                <ul className="evdetail__pclist">{read.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
              ) : (
                <div className="evdetail__pcnone">Nothing strongly in its favour yet.</div>
              )}
            </div>
            <div className="evdetail__pccol evdetail__pccol--con">
              <div className="evdetail__pchead">Why skip</div>
              {read.cons.length ? (
                <ul className="evdetail__pclist">{read.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
              ) : (
                <div className="evdetail__pcnone">No obvious reason to pass.</div>
              )}
            </div>
          </div>
        </div>

        {it.triage_reason && (
          <div className="evdetail__block">
            <div className="evdetail__label">Why the scanner {kept ? 'kept' : 'dropped'} it</div>
            <p className="evdetail__why">{it.triage_reason}</p>
          </div>
        )}

        {/* the real detail — fetched on open, never on the firehose path */}
        <StoryBlock it={it} enr={enr} />

        {!!it.companies?.length && (
          <div className="evdetail__block">
            <div className="evdetail__label">Companies named</div>
            <div className="evdetail__colist">
              {it.companies.map((c, i) => {
                const cov = coverageFor(c.name, c.ticker)
                return (
                  <div key={`${c.name}-${i}`} className="evdetail__co">
                    <span className="evdetail__chip evdetail__chip--co">{[c.name, c.ticker, c.listing_country].filter(Boolean).join(' · ')}</span>
                    {cov ? (
                      <span className={`evdetail__cov evdetail__cov--${cov.kind}`} title={cov.path}>{cov.kind === 'analysis' ? '✓ ' : ''}{cov.detail}</span>
                    ) : (
                      <span className="evdetail__cov evdetail__cov--new">Net-new name</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="evdetail__hint">Guessed from the headline alone — the checks verify this properly.</div>
          </div>
        )}

        {!!it.event_types?.length && (
          <div className="evdetail__block">
            <div className="evdetail__label">Themes</div>
            <div className="evdetail__chips">
              {it.event_types.map((t) => (
                <span key={t} className="evdetail__chip evdetail__chip--theme">
                  {plainTheme(t)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* related — only genuinely on-topic items (same company or real headline overlap), else say so */}
        {enrichment && (
          <div className="evdetail__block">
            <div className="evdetail__label">Related recent events</div>
            {enrichment.related.length ? (
              <ul className="evdetail__related">
                {enrichment.related.map((r) => (
                  <li key={`${r.event_id}-${r.ts}`} className="evdetail__rel">
                    <span className="evdetail__rel-score mono">{r.triage_score}</span>
                    <span className="evdetail__rel-hl">{r.headline}</span>
                    <span className="evdetail__rel-src">{r.source_name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="evdetail__hint">Nothing closely related on the wire in the last two days.</div>
            )}
          </div>
        )}

        <div className="evdetail__actions">
          <span className="evdetail__est mono">about $8–45 · stops early (and cheaper) if a check says no</span>
          <button className="btn btn--ghost evdetail__shelfbtn" onClick={() => toggleShelve(it.event_id)} title={shelved ? 'Bring this back to the wire' : 'Set this aside — not worth a check right now'}>
            {shelved ? 'Bring back' : 'Set aside'}
          </button>
          {it.url && (
            <a className="btn btn--ghost" href={it.url} target="_blank" rel="noreferrer">
              Open source ↗
            </a>
          )}
          <button className="btn btn--amber" onClick={() => void run(it)} title={staticMode ? 'Runs on your local machine (npm run dev)' : 'Send this event through the screener checks'}>
            Run the checks ▸
          </button>
        </div>
      </article>
    </div>
  )
}
