import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import type { PipelineEntry, RecommendedNeed } from '../../lib/types'
import { ACQ_LABEL, CADENCE_LABEL } from '../../lib/labels'
import { DataLibraryFilters, dlFiltersActive, emptyDlFilters, matchesDlPipeline, matchesDlRecommended } from './DataLibraryFilters'
import './DataLibrary.css'

// The Data Library — the cockpit's cross-swarm view over the connector registry: every wired data
// pipeline (what it feeds, how fresh its pool series is, at what §4 tier it folds in) plus the
// recommended-to-add gaps (the runs' unmet data_needs). Full-screen slide-in; list ↔ detail on ONE
// store field with a ← back. Everything renders from the /api/pipelines payload — no swarm id and no
// pipeline id is hardcoded anywhere in this tree (§26; enforced by datalibrary-purity.test.ts).

const STATUS_TONE: Record<string, string> = {
  fresh: 'var(--live)', stale: 'var(--conv-warn)', missing: 'var(--bad)', unknown: 'var(--text-faint)',
}
const STATUS_RANK: Record<string, number> = { missing: 3, stale: 2, unknown: 1, fresh: 0 }
const STATUS_HINT: Record<string, string> = {
  fresh: 'inside its own staleness SLA',
  stale: 'past its staleness SLA — the self-heal runner retries; a failed fetch writes nothing, so stale IS the alert',
  missing: 'no pool series yet for this subject',
  unknown: 'the data pool is not mounted on this host',
}

function StatusDot({ status }: { status: string }) {
  return (
    <span className="datalib__dot" title={`${status} — ${STATUS_HINT[status] || ''}`}
      style={{ background: STATUS_TONE[status] || 'var(--text-faint)' }} aria-label={status} />
  )
}

// a multi-subject row surfaces its neediest subject (missing > stale > unknown > fresh)
function worstStatus(p: PipelineEntry, poolAvailable: boolean): string {
  if (!poolAvailable || !p.statuses.length) return 'unknown'
  return p.statuses.reduce((w, s) => ((STATUS_RANK[s.status] ?? 1) > (STATUS_RANK[w] ?? 0) ? s.status : w), 'fresh')
}

function helpsLine(p: PipelineEntry): string {
  if (p.helps.length) {
    const h = p.helps[0]
    const more = p.helps.length > 1 ? ` · +${p.helps.length - 1} more` : ''
    return `feeds ${h.subject} · ${h.entry_modules.join(', ') || h.swarm} — ${h.series}${more}`
  }
  if (p.satisfies.length) return `feeds: ${p.satisfies.join(', ')}`
  return `feeds ${p.subjects.join(', ')}`
}

function WiredRow({ p, poolAvailable, onOpen }: { p: PipelineEntry; poolAvailable: boolean; onOpen: () => void }) {
  const latest = p.statuses.find((s) => s.latestAsOf)
  return (
    <button className="datalib__row" onClick={onOpen}>
      <StatusDot status={worstStatus(p, poolAvailable)} />
      <div className="datalib__rowbody">
        <div className="datalib__series">{p.series}</div>
        <div className="datalib__chips">
          <span className="chip">{p.provider}</span>
          <span className="chip" title="the §4 source tier this series folds into the pool at (clamped by source_type)">tier {p.tier}</span>
          <span className="chip">{CADENCE_LABEL[p.cadence] ?? p.cadence}</span>
          {p.subjects.map((s) => <span key={s} className="chip datalib__chip--subj">{s}</span>)}
        </div>
        <div className="datalib__helps">{helpsLine(p)}</div>
      </div>
      <div className="datalib__rowmeta">
        {latest?.latestAsOf ? <span title="latest as-of in the pool (from the filename, never mtime)">{latest.latestAsOf}{typeof latest.ageDays === 'number' ? ` · ${latest.ageDays}d` : ''}</span> : <span>no pool file yet</span>}
        <span className="datalib__chev" aria-hidden>›</span>
      </div>
    </button>
  )
}

function RecommendedRow({ r }: { r: RecommendedNeed }) {
  const src = r.suggested_source
  return (
    <div className="datalib__row datalib__row--rec">
      <span className="datalib__dot datalib__dot--rec" title="not wired yet — a durable connector can be built for this" aria-label="recommended" />
      <div className="datalib__rowbody">
        <div className="datalib__series">{r.series}</div>
        <div className="datalib__chips">
          <span className="chip datalib__chip--subj">{r.swarm} · {r.subject}</span>
          <span className="chip" title="the §4 tier the series would fold in at">tier {r.tier}</span>
          <span className="chip">{CADENCE_LABEL[r.cadence] ?? r.cadence}</span>
          <span className="chip datalib__chip--rec" title="Connector-eligible — a durable feed can be built for this.">connector-eligible</span>
        </div>
        <div className="datalib__helps">{r.why_it_caps}</div>
      </div>
      <div className="datalib__rowmeta">
        <span title={src.licensing ? `licensing: ${src.licensing}` : undefined}>
          {src.name || 'source t.b.d.'} · {ACQ_LABEL[src.acquisition] ?? src.acquisition}
        </span>
        {r.next_release && <span title="next scheduled release">next: {r.next_release}</span>}
      </div>
    </div>
  )
}

function PipelineDetail({ p, poolAvailable }: { p: PipelineEntry; poolAvailable: boolean }) {
  const back = useStore((s) => s.setDlSelected)
  return (
    <div className="datalib__detail">
      <div className="datalib__detailtop">
        <button className="btn btn--ghost" onClick={() => back(null)}>← back</button>
        <StatusDot status={worstStatus(p, poolAvailable)} />
        <span className="datalib__detailid">{p.id}</span>
      </div>
      <div className="datalib__series datalib__series--lg">{p.series}</div>
      {!poolAvailable && (
        <div className="datalib__banner">the data pool isn’t mounted on this host — freshness is computed on the always-on machine</div>
      )}

      <section>
        <h4>Manifest</h4>
        <div className="datalib__scroll">
          <table className="atable">
            <tbody>
              <tr><td>provider</td><td>{p.provider}</td></tr>
              <tr><td>acquisition</td><td>{ACQ_LABEL[p.acquisition] ?? p.acquisition}</td></tr>
              <tr>
                <td>source type · tier</td>
                <td>
                  {p.sourceType} · tier {p.tier} {p.tierCorrected && <span className="chip datalib__chip--corr" title="the manifest declared a more-trusted tier than its source_type earns — served clamped">tier corrected</span>}
                  <div className="datalib__fine">every file this pipeline writes carries a .source.json sidecar; the pool gate clamps any self-declared tier to the ceiling its source_type earns</div>
                </td>
              </tr>
              {p.license && <tr><td>license</td><td>{p.license}</td></tr>}
              <tr><td>hosts</td><td>{p.hostAllowlist.join(', ') || '—'}</td></tr>
              <tr><td>cadence · SLA</td><td>{CADENCE_LABEL[p.cadence] ?? p.cadence} · {p.stalenessSlaDays} days</td></tr>
              <tr><td>run</td><td><code>{p.entry}</code> · verify: <code>{p.verify || '—'}</code></td></tr>
              <tr><td>writes</td><td><code>{p.outputPath}</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4>Freshness by subject</h4>
        <div className="datalib__scroll">
          <table className="atable">
            <thead><tr><th></th><th>subject</th><th>latest as-of</th><th>age</th><th>file</th></tr></thead>
            <tbody>
              {p.statuses.map((s) => (
                <tr key={s.subject}>
                  <td><StatusDot status={poolAvailable ? s.status : 'unknown'} /></td>
                  <td>{s.subject}</td>
                  <td>{s.latestAsOf || '—'}</td>
                  <td>{typeof s.ageDays === 'number' ? `${s.ageDays}d` : '—'}</td>
                  <td className="datalib__file">{s.latestFile || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {p.helps.length > 0 && (
        <section>
          <h4>What it helps</h4>
          {p.helps.map((h) => (
            <div key={`${h.swarm}/${h.subject}/${h.need_id}`} className="datalib__help">
              <div className="datalib__helphead">feeds {h.subject} · {h.entry_modules.join(', ') || h.swarm} — {h.series}</div>
              <div className="datalib__fine">{h.why_it_caps}</div>
            </div>
          ))}
        </section>
      )}

      {p.outputSchema != null && (
        <section>
          <h4>Output schema</h4>
          <pre className="datalib__schema">{JSON.stringify(p.outputSchema, null, 2)}</pre>
        </section>
      )}
    </div>
  )
}

function Skeletons() {
  return (
    <div className="datalib__list" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="datalib__row datalib__row--skel">
          <span className="skel datalib__dot" />
          <div className="datalib__rowbody">
            <div className="skel skel--line skel--w70" />
            <div className="skel skel--line skel--w45" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DataLibrary() {
  const read = useStore((s) => s.pipelines)
  const error = useStore((s) => s.pipelinesError)
  const refresh = useStore((s) => s.refreshPipelines)
  const close = useStore((s) => s.closeDataLibrary)
  const selectedId = useStore((s) => s.dlSelectedId)
  const setSelected = useStore((s) => s.setDlSelected)
  const filters = useStore((s) => s.dlFilters)
  const setFilters = useStore((s) => s.setDlFilters)
  const [spin, setSpin] = useState(false)

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 30_000)
    return () => clearInterval(id)
  }, [refresh])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const pipelines = read?.pipelines ?? []
  const recommended = read?.recommended ?? []
  const poolAvailable = read?.poolAvailable === true // deploy-skew fail-closed (§5): absent field → not mounted
  const wired = useMemo(() => pipelines.filter((p) => matchesDlPipeline(p, filters)), [pipelines, filters])
  const recs = useMemo(() => recommended.filter((r) => matchesDlRecommended(r, filters)), [recommended, filters])
  const subjects = useMemo(
    () => [...new Set([...pipelines.flatMap((p) => p.subjects), ...recommended.map((r) => r.subject)])].sort(),
    [pipelines, recommended])
  const cadences = useMemo(
    () => [...new Set([...pipelines.map((p) => p.cadence), ...recommended.map((r) => r.cadence)])].sort(),
    [pipelines, recommended])
  const tiers = useMemo(
    () => [...new Set([...pipelines.map((p) => String(p.tier)), ...recommended.map((r) => String(r.tier))])].sort(),
    [pipelines, recommended])
  const selected = selectedId ? pipelines.find((p) => p.id === selectedId) : undefined

  const doRefresh = () => { setSpin(true); void refresh().finally(() => setTimeout(() => setSpin(false), 600)) }
  const setKind = (kind: string) => setFilters({ ...filters, kind: filters.kind === kind ? '' : kind })

  return (
    <motion.div className="pipeline datalib" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div className="pipeline__titlewrap">
          <div className="pipeline__title">Data library</div>
          <div className="pipeline__sub">the wired pipelines feeding the pool — and the gaps worth wiring next</div>
        </div>
        <div className="pipeline__tools">
          <button className={`btn btn--ghost${spin ? ' is-spinning' : ''}`} onClick={doRefresh} title="Re-read the connector registry and pool freshness">↻</button>
          <button className="btn btn--ghost" onClick={close} title="Close">✕</button>
        </div>
      </div>

      {selected ? (
        <PipelineDetail p={selected} poolAvailable={poolAvailable} />
      ) : (
        <div className="datalib__body">
          {read === null && !error && <Skeletons />}
          {read === null && error && (
            <div className="bookempty">
              <div className="bookempty__title">Couldn’t load the pipeline library</div>
              <div className="bookempty__body">{error}</div>
              <button className="btn" onClick={doRefresh}>retry</button>
            </div>
          )}
          {read !== null && (
            <>
              {error && (
                <div className="datalib__degraded">
                  latest refresh failed ({error}) — showing the last good read
                  <button className="btn btn--ghost" onClick={doRefresh}>retry</button>
                </div>
              )}
              <div className="datalib__controls">
                <div className="seg" role="radiogroup" aria-label="Wired or recommended">
                  <button className={`seg__btn${!filters.kind ? ' seg__btn--on' : ''}`} role="radio" aria-checked={!filters.kind} onClick={() => setKind('')}>All {pipelines.length + recommended.length}</button>
                  <button className={`seg__btn${filters.kind === 'wired' ? ' seg__btn--on' : ''}`} role="radio" aria-checked={filters.kind === 'wired'} disabled={!pipelines.length} onClick={() => setKind('wired')}>Wired {pipelines.length}</button>
                  <button className={`seg__btn${filters.kind === 'recommended' ? ' seg__btn--on' : ''}`} role="radio" aria-checked={filters.kind === 'recommended'} disabled={!recommended.length} onClick={() => setKind('recommended')}>Recommended {recommended.length}</button>
                </div>
                <DataLibraryFilters value={filters} onChange={setFilters} subjects={subjects} cadences={cadences} tiers={tiers} />
              </div>

              {wired.length > 0 && filters.kind !== 'recommended' && (
                <div className="datalib__list">
                  {wired.map((p) => <WiredRow key={p.id} p={p} poolAvailable={poolAvailable} onOpen={() => setSelected(p.id)} />)}
                </div>
              )}
              {filters.kind !== 'recommended' && !wired.length && !pipelines.length && (
                <div className="bookempty">
                  <div className="bookempty__title">No pipelines discovered</div>
                  <div className="bookempty__body">nothing under .claude/connectors/ on this engine — a pipeline is a connector folder with a connector.json manifest and a fetch.py</div>
                </div>
              )}

              {filters.kind !== 'wired' && (
                <>
                  <div className="datalib__sechead">Recommended to add <span className="datalib__fine">— data the runs said would sharpen a call, not wired yet</span></div>
                  {recs.length > 0 ? (
                    <div className="datalib__list">{recs.map((r) => <RecommendedRow key={r.key} r={r} />)}</div>
                  ) : recommended.length === 0 ? (
                    <div className="bookempty bookempty--slim">
                      <div className="bookempty__body">No unmet data needs — every surfaced need is wired or filing-bound.</div>
                    </div>
                  ) : null}
                </>
              )}

              {dlFiltersActive(filters) && !wired.length && !recs.length && (pipelines.length + recommended.length > 0) && (
                <div className="bookempty bookempty--filtered">
                  <div className="bookempty__title">Nothing matches these filters</div>
                  <button className="btn" onClick={() => setFilters(emptyDlFilters())}>clear filters</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
