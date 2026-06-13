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

// A plain, honest "should I spend on this?" read — guidance derived from the scope + source tier +
// score + prior coverage we already hold. Never a claim about the company itself (CLAUDE.md §3, §21).
function worthItPoints(it: FeedItem, enr?: EventEnrichment): string[] {
  const out: string[] = []
  const s = scopeOf(it)
  const fam = familyOf(s)
  const tier = it.source_tier
  if (fam === 'company') {
    out.push(s === 'multi_name'
      ? 'Names more than one company — read it as a possible pair or read-across, not just one stock.'
      : 'About a single named company — the most directly actionable kind of event.')
  } else if (fam === 'broad') {
    out.push('Broad context, not one company — useful for a basket or a macro/sector view; shelve it if you only want single-stock ideas.')
  }
  if (tier === 'primary_filing') out.push('It’s a primary filing or exchange disclosure — top of the evidence ladder, not second-hand.')
  else if (tier === 'unconfirmed') out.push('Sourced to unnamed people — treat it as a lead to verify, not a fact.')
  else if (tier === 'news') out.push('A newswire report — verify against the primary source before you lean on it.')
  if (it.triage_score < 40) out.push('The quick score is low — the scanner thinks most of these are noise. Open the source before spending.')
  if (enr?.prior_coverage?.length) {
    const a = enr.prior_coverage.find((p) => p.kind === 'analysis')
    if (a) out.push(`The engine has already analysed this name — ${a.detail.toLowerCase()}. A check would update that view.`)
    else out.push('There’s already a data pool for this name — a check can build on it.')
  }
  return out.slice(0, 3)
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
  const points = useMemo(() => worthItPoints(it, enrichment), [it, enrichment])

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

        {!!points.length && (
          <div className="evdetail__block">
            <div className="evdetail__label">Is it worth a check?</div>
            <ul className="evdetail__worth">
              {points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {!!enrichment?.related?.length && (
          <div className="evdetail__block">
            <div className="evdetail__label">Related recent events</div>
            <ul className="evdetail__related">
              {enrichment.related.map((r) => (
                <li key={`${r.event_id}-${r.ts}`} className="evdetail__rel">
                  <span className="evdetail__rel-score mono">{r.triage_score}</span>
                  <span className="evdetail__rel-hl">{r.headline}</span>
                  <span className="evdetail__rel-src">{r.source_name}</span>
                </li>
              ))}
            </ul>
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
