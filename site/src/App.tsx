import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Agent, Manifest, Module } from './types'

const BASE = import.meta.env.BASE_URL
const dataUrl = (file: string) => `${BASE}data/${file}`

type Tone = 'positive' | 'neutral' | 'negative' | 'none'
function decisionTone(d?: string | null): Tone {
  if (!d) return 'none'
  const s = d.toLowerCase()
  if (/strong buy|^buy|starter/.test(s)) return 'positive'
  if (/avoid|short/.test(s)) return 'negative'
  if (/watchlist|pair|hedge/.test(s)) return 'neutral'
  return 'neutral'
}
const pct = (n: any) => (typeof n === 'number' ? `${n > 0 ? '+' : ''}${n}%` : '—')
const num = (n: any) => (typeof n === 'number' ? String(n) : '—')
// forecast probabilities may be stored as a fraction (0.6) or a percent (60) depending on the run
const prob = (p: any) => (typeof p === 'number' ? `${p <= 1 ? Math.round(p * 100) : Math.round(p)}%` : '—')

function BrandMark() {
  return (
    <svg className="brandmark" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="7.5" stroke="var(--hairline-strong)" />
      <circle cx="9" cy="9" r="2.4" fill="var(--accent)" />
      <circle cx="9" cy="1.6" r="1.1" fill="var(--text-faint)" />
      <circle cx="15.4" cy="12.6" r="1.1" fill="var(--text-faint)" />
      <circle cx="2.6" cy="12.6" r="1.1" fill="var(--text-faint)" />
    </svg>
  )
}

function Reader({ file, title, verdict, onClose }: { file: string; title: string; verdict?: string | null; onClose: () => void }) {
  const [md, setMd] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    fetch(dataUrl(file))
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(setMd)
      .catch(() => setMd('*Could not load this report.*'))
      .finally(() => setLoading(false))
  }, [file])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="reader">
        <div className="reader__head">
          <div style={{ minWidth: 0 }}>
            <div className="reader__title"><span className="reader__done">✓ Completed</span> {title}</div>
            {verdict && <div className="reader__verdict">{verdict}</div>}
          </div>
          <button className="btn" style={{ height: 32 }} onClick={onClose}>Close ✕</button>
        </div>
        <div className="reader__body">
          {loading ? <div style={{ color: 'var(--text-faint)' }}>Loading…</div> : <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown></div>}
        </div>
      </div>
    </>
  )
}

export function App() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reader, setReader] = useState<{ file: string; title: string; verdict?: string | null } | null>(null)
  const [openModule, setOpenModule] = useState<string | null>(null)
  const reportsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${BASE}data/manifest.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('manifest not found'))))
      .then(setManifest)
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const d = manifest?.decision || {}
  const tone = decisionTone(d.decision)
  const thesisTypes: string[] = Array.isArray(d.thesis_type) ? d.thesis_type : d.thesis_type ? [d.thesis_type] : []

  const openAgent = (a: Agent) => setReader({ file: a.file, title: a.name, verdict: a.verdict })
  const focusModule = (m: Module) => {
    setOpenModule(m.name)
    setTimeout(() => reportsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  const sevClass = (s: string) => `sev-${(s || 'low').toLowerCase()}`
  const flagClass = (s: string) => `flag--${(s || 'low').toLowerCase()}`

  const totalAgents = useMemo(() => manifest?.modules.reduce((n, m) => n + m.agents.length, 0) ?? 0, [manifest])

  if (error) {
    return (
      <div className="center">
        <div>
          <div style={{ color: 'var(--bad)', marginBottom: 8 }}>Could not load the dossier.</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{error}</div>
        </div>
      </div>
    )
  }
  if (!manifest) {
    return <div className="center"><div><div className="spin" />Loading dossier…</div></div>
  }

  return (
    <>
      <header className="top">
        <div className="top__inner">
          <BrandMark />
          <span className="brand">Nostradamus <span>Swarm</span></span>
          <span className="top__sub">Investment Dossier</span>
          <span className="top__spacer" />
          <span className="top__ticker">{manifest.ticker} · {manifest.date}</span>
        </div>
      </header>

      <div className="wrap">
        {/* HERO */}
        <section className="hero">
          <div className="hero__eyebrow">{d.exchange ? `${d.exchange} · ${d.ticker}` : manifest.ticker} · Research Verdict</div>
          <h1 className="hero__company">{d.company_name || manifest.ticker}</h1>
          <div className="hero__sub">
            {[d.currency, d.time_horizon && `Horizon ${d.time_horizon}`, d.benchmark && `vs ${d.benchmark}`, `Run ${manifest.date}`].filter(Boolean).join('   ·   ')}
          </div>

          <div className="hero__row">
            <div className={`badge badge--${tone}`}>
              <span className="badge__k">Decision</span>
              <span className="badge__v">{d.decision || '—'}</span>
            </div>
            <div className="action">
              {d.suggested_action && <div><b>Suggested action.</b> {d.suggested_action}</div>}
              <div className="chips">
                {thesisTypes.map((t) => <span className="chip" key={t}>{t}</span>)}
                {d.basket && <span className="chip chip--muted">Basket: {d.basket}</span>}
              </div>
            </div>
          </div>

          <div className="metrics">
            <div className="metric"><div className="metric__k">Confidence</div><div className="metric__v">{num(d.confidence_score)}</div></div>
            <div className="metric"><div className="metric__k">Data sufficiency</div><div className="metric__v">{num(d.data_sufficiency_score)}</div></div>
            <div className="metric"><div className="metric__k">Expected return</div><div className={`metric__v ${typeof d.expected_return_pct === 'number' ? (d.expected_return_pct >= 0 ? 'pos' : 'neg') : ''}`}>{pct(d.expected_return_pct)}</div></div>
            <div className="metric"><div className="metric__k">Downside</div><div className="metric__v neg">{pct(d.downside_risk_pct)}</div></div>
            <div className="metric"><div className="metric__k">Risk / reward</div><div className="metric__v">{num(d.risk_reward)}</div></div>
            <div className="metric"><div className="metric__k">Reference price</div><div className="metric__v">{d.currency ? `${d.entry_price ?? '—'}` : d.entry_price ?? '—'}</div></div>
          </div>
        </section>

        {/* VARIANT PERCEPTION */}
        {(d.variant_perception_summary || d.what_everyone_knows) && (
          <section className="section">
            <div className="section__title">Variant Perception — where the engine differs from the market</div>
            {d.variant_perception_summary && <p className="lede">{d.variant_perception_summary}</p>}
            <div className="vp-grid">
              {d.what_everyone_knows && <div className="card"><div className="card__k">What everyone knows</div><div className="card__body">{d.what_everyone_knows}</div></div>}
              {d.what_is_priced_in && <div className="card"><div className="card__k">What's priced in</div><div className="card__body">{d.what_is_priced_in}</div></div>}
              {d.what_market_may_be_missing && <div className="card"><div className="card__k">What the market may miss</div><div className="card__body">{d.what_market_may_be_missing}</div></div>}
              {d.killer_risk && <div className="card card--risk"><div className="card__k">Killer risk</div><div className="card__body">{d.killer_risk}</div></div>}
            </div>
          </section>
        )}

        {/* MODULE SCORECARDS */}
        <section className="section">
          <div className="section__title">Module Scorecards — {manifest.modules.length} modules · {totalAgents} agent reports</div>
          <div className="modgrid">
            {manifest.modules.map((m) => (
              <div className="modcard" key={m.name} onClick={() => focusModule(m)}>
                <div className="modcard__top">
                  <span className="modcard__name">{m.label}</span>
                  <span className="modcard__score">{m.score ?? '—'}</span>
                </div>
                <div className="modcard__bar"><div className="modcard__fill" style={{ width: `${m.score ?? 0}%` }} /></div>
                <div className="modcard__verdict">{m.verdict || `${m.agents.length} specialist reports`}</div>
                <div className="modcard__more">Open {m.agents.length} reports →</div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL THESIS */}
        {manifest.files.finalThesis && (
          <section className="section">
            <div className="section__title">The Thesis</div>
            <p className="lede lede--quiet">The master synthesizer's full buy-side write-up, reconciling all {manifest.modules.length} modules into a single verdict.</p>
            <div className="btnrow">
              <button className="btn btn--amber" onClick={() => setReader({ file: manifest.files.finalThesis!, title: `Investment Thesis — ${manifest.ticker}`, verdict: d.decision })}>Read the full thesis →</button>
              {manifest.files.runMetadata && <button className="btn" onClick={() => setReader({ file: manifest.files.runMetadata!, title: 'Run Metadata' })}>Run metadata</button>}
            </div>
          </section>
        )}

        {/* REPORTS BROWSER */}
        <section className="section" ref={reportsRef}>
          <div className="section__title">All Reports — click any agent to read its output</div>
          {manifest.modules.map((m) => {
            const open = openModule === m.name
            return (
              <div className={`modblock${open ? ' modblock--open' : ''}`} key={m.name}>
                <div className="modblock__head" onClick={() => setOpenModule(open ? null : m.name)}>
                  <span className="modblock__name">{m.label}</span>
                  <span className="modblock__count">{m.agents.length} reports{m.score != null ? ` · score ${m.score}` : ''}</span>
                  <span className="modblock__chev">›</span>
                </div>
                {open &&
                  m.agents.map((a) => (
                    <div className="agentrow" key={a.file} onClick={() => openAgent(a)}>
                      <span className={`agentrow__dot${a.isSynthesis ? ' agentrow__dot--synth' : ''}`} />
                      <div className="agentrow__body">
                        <div className="agentrow__name">{a.name} <span className="agentrow__nn">{a.nn}{a.isSynthesis ? ' · synthesis' : ''}</span></div>
                        {a.verdict && <div className="agentrow__verdict">{a.verdict}</div>}
                      </div>
                      <span className="agentrow__read">Read →</span>
                    </div>
                  ))}
              </div>
            )
          })}
        </section>

        {/* RED FLAGS */}
        {Array.isArray(d.red_flags) && d.red_flags.length > 0 && (
          <section className="section">
            <div className="section__title">Red Flags — {d.red_flags.length}</div>
            <div className="flags">
              {d.red_flags.map((f: any, i: number) => (
                <div className={`flag ${flagClass(f.severity)}`} key={f.id || i}>
                  <span className={`flag__sev ${sevClass(f.severity)}`}>{f.severity || 'Flag'}</span>
                  <div className="flag__body">
                    {f.description || f.desc}
                    {(f.id || f.module) && <div className="flag__id">{[f.id, f.module].filter(Boolean).join(' · ')}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FORECAST LEDGER */}
        {Array.isArray(d.forecast_ledger) && d.forecast_ledger.length > 0 && (
          <section className="section">
            <div className="section__title">Forecast Ledger — {d.forecast_ledger.length} tracked predictions</div>
            <div className="ledger">
              {d.forecast_ledger.map((f: any, i: number) => (
                <div className="fcast" key={i}>
                  <div className="fcast__pred">{f.prediction}</div>
                  <div className="fcast__meta">
                    <span className="fcast__prob">{prob(f.probability)}</span>
                    <span className="fcast__win">{f.time_window}{f.owner_module ? ` · ${f.owner_module}` : ''}</span>
                  </div>
                  {f.confirmation_trigger && <div className="fcast__trig"><b>Confirms</b> — {f.confirmation_trigger}</div>}
                  {f.falsification_trigger && <div className="fcast__trig"><b>Falsifies</b> — {f.falsification_trigger}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="foot">
          {d.rating_cap && <div style={{ marginBottom: 10 }}><b>Rating cap.</b> {d.rating_cap}</div>}
          {Array.isArray(d.missing_data) && d.missing_data.length > 0 && (
            <div style={{ marginBottom: 10 }}><b>Highest-value missing data.</b> {d.missing_data[0]}</div>
          )}
          <div className="foot__mono">
            Source: analyses/{manifest.run} · {manifest.modules.length} modules · {totalAgents} agent reports{manifest.generatedAt ? ` · bundled ${manifest.generatedAt.slice(0, 10)}` : ''}
          </div>
          <div className="foot__mono" style={{ marginTop: 6 }}>
            Nostradamus Swarm — a research artifact viewer. Not investment advice.
          </div>
        </footer>
      </div>

      {reader && <Reader file={reader.file} title={reader.title} verdict={reader.verdict} onClose={() => setReader(null)} />}
    </>
  )
}
