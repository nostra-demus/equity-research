import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import type { PipelineEntry, PipelineSubjectStatus, PipelineVerdict, RecommendedNeed, RunnerStatus } from '../../lib/types'
import { ACQ_LABEL, CADENCE_LABEL } from '../../lib/labels'
import { DataLibraryFilters, dlFiltersActive, emptyDlFilters, matchesDlPipeline, matchesDlRecommended } from './DataLibraryFilters'
import { DataLibraryBuild } from './DataLibraryBuild'
import { recommendedDiscoveryAction } from './buildAvailability'
import {
  connectorForNeed,
  existingConnectorGuidance,
  feedHealthDisplayOf,
  ledgerIntegrityWarningOf,
  repairForSubject,
  REPAIR_DISPLAY,
  pipelineIsWaitingForFirstCheck,
  worstPipelineRepair,
  worstPipelineStatus,
} from './feedHealth'
import './DataLibrary.css'

// The Data Library — the cockpit's cross-swarm view over the connector registry: every wired data
// pipeline (what it feeds, whether it is actually WORKING, how fresh its pool series is, at what §4 tier it
// folds in), the recommended-to-add gaps (the runs' unmet data_needs), and the find → build → live loop that
// closes them. Full-screen slide-in; list ↔ detail on ONE store field with a ← back. Everything renders from
// the /api/pipelines payload — no swarm id and no pipeline id is hardcoded anywhere in this tree (§26;
// enforced by datalibrary-purity.test.ts).
//
// The headline question this surface answers is "is my data actually arriving?", so the server's rolled-up
// verdict (live / needs attention / broken) leads every row and the header, and each one carries the sentence
// behind it. Freshness alone was never the answer: a feed whose source started failing yesterday still has a
// fresh file today, and that is exactly the case worth catching.

const VERDICT_LABEL: Record<PipelineVerdict, string> = {
  live: 'Live', attention: 'Needs attention', broken: 'Broken', unknown: 'Not visible here',
}
const STATUS_TONE: Record<string, string> = {
  fresh: 'var(--live)', stale: 'var(--conv-warn)', missing: 'var(--bad)', unknown: 'var(--text-faint)',
}
const VERDICT_TONE: Record<PipelineVerdict, string> = {
  live: 'var(--live)', attention: 'var(--conv-warn)', broken: 'var(--bad)', unknown: 'var(--text-faint)',
}
const STATUS_HINT: Record<string, string> = {
  fresh: 'a file inside its own freshness window',
  stale: 'the newest file is past its freshness window',
  missing: 'no file in the pool for this subject yet',
  unknown: 'the data pool is not mounted on this host',
}
function ago(iso: string | null): string {
  const t = iso ? Date.parse(iso) : NaN
  if (!t) return ''
  const m = Math.max(0, Math.round((Date.now() - t) / 60_000))
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`
}

function VerdictBadge({ verdict, title, label, tone }: { verdict: PipelineVerdict; title?: string; label?: string; tone?: string }) {
  return <span className="datalib__verdict" data-v={tone ?? verdict} title={title}>{label ?? VERDICT_LABEL[verdict]}</span>
}

function StatusDot({ status, feed }: { status: string; feed?: PipelineSubjectStatus }) {
  const fetch = feed ? feedHealthDisplayOf(feed) : null
  const fileHint = feed?.projectionIntact === false
    ? 'the pool projection or provenance sidecar does not match canonical current data'
    : STATUS_HINT[status] || ''
  const hint = [`${status} — ${fileHint}`, fetch ? `fetch: ${fetch.label} — ${fetch.hint}` : '']
    .filter(Boolean).join('\n')
  return (
    <span className="datalib__dot" title={hint}
      style={{ background: STATUS_TONE[status] || 'var(--text-faint)' }} aria-label={status} />
  )
}

function helpsLine(p: PipelineEntry): string {
  if (p.helps.length) {
    const h = p.helps[0]
    const more = p.helps.length > 1 ? ` · +${p.helps.length - 1} more` : ''
    return `feeds ${h.subject} · ${h.entry_modules.join(', ') || h.swarm} — ${h.series}${more}`
  }
  // Semantic need IDs are machine join keys, not useful operator copy.  When there is no plain-English
  // `helps` row, the subject chips above already say what this feed covers.
  return ''
}

/** The most recent dated subject (ISO dates sort lexicographically) — never the first one that has a date. */
function latestStatus(p: PipelineEntry): PipelineSubjectStatus | undefined {
  return p.statuses.filter((s) => s.latestAsOf).sort((a, b) => (b.latestAsOf ?? '').localeCompare(a.latestAsOf ?? ''))[0]
}

function WiredRow({ p, onOpen }: { p: PipelineEntry; onOpen: () => void }) {
  const latest = latestStatus(p)
  const worst = worstPipelineStatus(p.statuses)
  const worstHealth = worst ? feedHealthDisplayOf(worst) : null
  const ledgerWarning = ledgerIntegrityWarningOf(p.statuses)
  const repairState = worstPipelineRepair(p)
  const repair = REPAIR_DISPLAY[repairState.repair.status]
  const waiting = pipelineIsWaitingForFirstCheck(p)
  const help = helpsLine(p)
  return (
    <button className={`datalib__row datalib__row--${waiting ? 'waiting' : p.verdict}`} onClick={onOpen}>
      <span className={`datalib__dot${p.verdict === 'live' ? ' datalib__dot--live' : ''}`}
        style={{ background: waiting ? 'var(--text-faint)' : VERDICT_TONE[p.verdict] }}
        aria-label={waiting ? 'Waiting' : VERDICT_LABEL[p.verdict]} />
      <div className="datalib__rowbody">
        <div className="datalib__series">{p.series}</div>
        <div className="datalib__chips">
          <span className="chip">{p.provider}</span>
          <span className="chip" title="the §4 source tier this series folds into the pool at (clamped by source_type)">tier {p.tier}</span>
          <span className="chip">{CADENCE_LABEL[p.cadence] ?? p.cadence}</span>
          {p.subjects.map((s) => <span key={s} className="chip datalib__chip--subj">{s}</span>)}
        </div>
        {!waiting && p.verdictNote && <div className="datalib__helps">{p.verdictNote}</div>}
        {help && <div className="datalib__fine">{help}</div>}
      </div>
      <div className="datalib__rowmeta">
        <VerdictBadge verdict={p.verdict} label={waiting ? 'Waiting' : undefined} tone={waiting ? 'waiting' : undefined}
          title={worst && worstHealth ? `${worst.subject}: ${worstHealth.label} — ${worstHealth.hint}` : undefined} />
        {worstHealth && !waiting && <span title={worstHealth.hint}>{worstHealth.label}</span>}
        {ledgerWarning && <span className="chip" title={ledgerWarning}>Ledger warning</span>}
        <span className="datalib__asof" title="latest as-of in the pool (from the filename, never mtime)">
          {latest?.latestAsOf ? `${latest.latestAsOf}${typeof latest.ageDays === 'number' ? ` · ${latest.ageDays}d` : ''}` : 'no file yet'}
        </span>
        {repairState.repair.status !== 'none' && (repairState.repair.status === 'pr_open' && repairState.repair.prUrl ? (
          <a className="datalib__prlink" title={repair.detail ?? undefined} href={repairState.repair.prUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{repairState.subject}: {repair.row} ↗</a>
        ) : <span title={repair.detail ?? undefined}>{repairState.subject}: {repair.row}</span>)}
        <span className="datalib__chev" aria-hidden>›</span>
      </div>
    </button>
  )
}

function RecommendedRow({ r, pipelines, canScan, canBuild, onBuild, onOpenExisting }: {
  r: RecommendedNeed
  pipelines: PipelineEntry[]
  canScan: boolean
  canBuild: boolean
  onBuild: () => void
  onOpenExisting: (id: string) => void
}) {
  const src = r.suggested_source
  const existing = connectorForNeed(r, pipelines)
  const guidance = existingConnectorGuidance(r, pipelines)
  const discovery = recommendedDiscoveryAction(canBuild)
  return (
    <div className="datalib__row datalib__row--rec">
      <span className="datalib__dot datalib__dot--rec"
        title={guidance ? `connector ${guidance.id} exists — ${guidance.message}`
          : canBuild ? 'not wired yet — the isolated builder can implement a durable connector'
            : 'not wired yet — source discovery is available, but automatic connector coding is unavailable'}
        aria-label={guidance ? 'connector exists but data is not usable' : 'recommended'} />
      <div className="datalib__rowbody">
        <div className="datalib__series">{r.series}</div>
        <div className="datalib__chips">
          <span className="chip datalib__chip--subj">{r.swarm} · {r.subject}</span>
          <span className="chip" title="the §4 tier the series would fold in at">tier {r.tier}</span>
          <span className="chip">{CADENCE_LABEL[r.cadence] ?? r.cadence}</span>
          {r.entry_modules.length > 0 && <span className="chip">feeds {r.entry_modules.join(', ')}</span>}
        </div>
        <div className="datalib__why">{r.why_it_caps}</div>
        {r.cap_lifted && <div className="datalib__fine">wiring it lifts: {r.cap_lifted}</div>}
        {guidance && (
          <div className="datalib__fine datalib__existing">
            Connector <code>{guidance.id}</code> exists · {guidance.message}.
          </div>
        )}
      </div>
      <div className="datalib__rowmeta">
        <span title={src.licensing ? `licensing: ${src.licensing}` : undefined}>
          {src.name || 'source t.b.d.'} · {ACQ_LABEL[src.acquisition] ?? src.acquisition}
        </span>
        {r.next_release && <span title="next scheduled release">next: {r.next_release}</span>}
        {guidance && existing ? (
          <button className="btn btn--ghost datalib__mini" onClick={() => onOpenExisting(existing.id)}
            title="Open the existing connector and its repair state">
            View existing feed ›
          </button>
        ) : !guidance && canScan ? (
          <button className="btn btn--amber datalib__mini" onClick={onBuild}
            title={discovery.title}>
            {discovery.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function PipelineDetail({ p, poolAvailable }: { p: PipelineEntry; poolAvailable: boolean }) {
  const back = useStore((s) => s.setDlSelected)
  const ledgerWarning = ledgerIntegrityWarningOf(p.statuses)
  const waiting = pipelineIsWaitingForFirstCheck(p)
  const subjectRepairs = p.subjects.map((subject) => ({ subject, repair: repairForSubject(p, subject) }))
    .filter(({ repair }) => repair.status !== 'none')
  return (
    <div className="datalib__detail">
      <div className="datalib__col">
        <div className="datalib__detailtop">
          <button className="btn btn--ghost" onClick={() => back(null)}>← back</button>
          <span className="datalib__detailid">{p.id}</span>
        </div>
        <div className="datalib__series datalib__series--lg">{p.series}</div>
        <div className="datalib__verdictline">
          <VerdictBadge verdict={p.verdict} label={waiting ? 'Waiting' : undefined} tone={waiting ? 'waiting' : undefined} />
          <span className="datalib__why">{waiting ? 'Waiting for the Mac data service to complete its first check.' : p.verdictNote}</span>
        </div>
        {!poolAvailable && (
          <div className="datalib__banner">the data pool isn’t mounted on this host — freshness and fetch health are computed on the always-on machine</div>
        )}
        {ledgerWarning && (
          <div className="datalib__banner" title={ledgerWarning}>
            connector ledger warning: {ledgerWarning}
          </div>
        )}
        {subjectRepairs.map(({ subject, repair }) => (
          <div className="datalib__banner" key={`${subject}/${repair.status}`}>
            {subject}: {REPAIR_DISPLAY[repair.status].detail}
            {repair.prUrl && <> — <a className="datalib__prlink" href={repair.prUrl} target="_blank" rel="noreferrer">see the pull request ↗</a></>}
          </div>
        ))}

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
                <tr><td>cadence · release window</td><td>{CADENCE_LABEL[p.cadence] ?? p.cadence} · {p.releaseWindowDays} days</td></tr>
                <tr><td>run</td><td><code>{p.entry}</code> · verify: <code>{p.verify || '—'}</code></td></tr>
                <tr><td>writes</td><td><code>{p.outputPath}</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4>Per subject — the file, and the fetch</h4>
          <div className="datalib__scroll">
            <table className="atable">
              <thead><tr><th></th><th>subject</th><th>latest as-of</th><th>age</th><th>last fetch</th><th>file</th></tr></thead>
              <tbody>
                {p.statuses.map((s) => (
                  <tr key={s.subject}>
                    <td><StatusDot status={poolAvailable ? s.status : 'unknown'} feed={s} /></td>
                    <td>{s.subject}</td>
                    <td>{s.latestAsOf || '—'}</td>
                    <td>{typeof s.ageDays === 'number' ? `${s.ageDays}d` : '—'}</td>
                    <td title={[s.lastError || feedHealthDisplayOf(s).hint, s.ledgerIntegrityWarning].filter(Boolean).join('\n')}>
                      {feedHealthDisplayOf(s).label}
                      {s.failStreak > 1 ? ` ×${s.failStreak}` : ''}
                      {s.lastSweepAt ? <div className="datalib__fine">{ago(s.lastSweepAt)}</div> : null}
                      {s.ledgerIntegrityWarning ? <div className="datalib__fine">ledger warning</div> : null}
                    </td>
                    <td className="datalib__file">{s.latestFile || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {p.statuses.some((s) => s.lastError) && (
            <div className="datalib__err" style={{ marginTop: 8 }}>
              last fetch error: {p.statuses.find((s) => s.lastError)?.lastError}
            </div>
          )}
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

/** The header strip: how many feeds are working, how many are not, and when the fetcher last ran. */
function HealthStrip({ pipelines, poolAvailable, runner }: {
  pipelines: PipelineEntry[]
  poolAvailable: boolean
  runner?: RunnerStatus
}) {
  const live = pipelines.filter((p) => p.verdict === 'live').length
  const waiting = pipelines.filter(pipelineIsWaitingForFirstCheck).length
  const action = pipelines.filter((p) => !pipelineIsWaitingForFirstCheck(p)
    && (p.verdict === 'attention' || p.verdict === 'broken')).length
  if (!poolAvailable) {
    return (
      <div className="datalib__health">
        <div className="datalib__tally">
          <span className="datalib__tallynum">{pipelines.length}</span>
          <span>feeds wired · health is computed on the machine that holds the pool, not here</span>
        </div>
      </div>
    )
  }
  const fetcher = runner?.fetcher
  const fetcherState = String(fetcher?.state || 'unknown')
  // Positive match only: a newer server state must never fall through to a green certificate on an older UI.
  const serviceHealthy = fetcher && (fetcherState === 'online' || fetcherState === 'running')
  const serviceIncident = fetcher && !serviceHealthy
  const recoveryCopy = fetcherState === 'late'
    ? 'Mac watchdog will restart it'
    : fetcherState === 'failed' || fetcherState === 'not_started'
      ? 'Mac scheduler will retry automatically'
      : fetcherState === 'unknown'
        ? 'automatic restart paused for safety'
        : serviceIncident
          ? 'automatic action paused until this state is understood'
        : null
  return (
    <div className="datalib__healthwrap">
      {fetcher && (
        <div className={`datalib__service datalib__service--${serviceIncident ? 'incident' : 'good'}`} role="status">
          <span className="datalib__serviceicon" aria-hidden>{serviceIncident ? '!' : fetcherState === 'running' ? '↻' : '✓'}</span>
          <div className="datalib__servicecopy">
            <strong>{serviceIncident ? 'Data service needs attention' : fetcherState === 'running' ? 'Data service is checking feeds' : 'Data service online'}</strong>
            <span>{fetcher.note}{serviceIncident && waiting ? ` This is one service incident; ${waiting} feeds are waiting, not ${waiting} separate connector failures.` : ''}</span>
          </div>
          <div className="datalib__servicemeta">
            {fetcher.host ? `${fetcher.host} · ` : ''}{fetcher.lastProgressAt ? `checked in ${ago(fetcher.lastProgressAt)}` : 'no check-in yet'}
            {recoveryCopy ? ` · ${recoveryCopy}` : ` · every ${fetcher.intervalMin} min`}
          </div>
        </div>
      )}
      <div className="datalib__health">
        <div className={`datalib__tally${live && !action && !waiting ? ' datalib__tally--good' : ''}`}>
          <span className="datalib__tallynum">{live}</span><span>live</span>
        </div>
        {waiting > 0 && (
          <div className="datalib__tally">
            <span className="datalib__tallynum">{waiting}</span><span>waiting for first check</span>
          </div>
        )}
        {action > 0 && (
          <div className="datalib__tally datalib__tally--bad">
            <span className="datalib__tallynum">{action}</span><span>action required</span>
          </div>
        )}
        {!action && !waiting && pipelines.length > 0 && (
          <div className="datalib__fine">every wired feed is fetching cleanly and inside its freshness window</div>
        )}
        {/* §5: an older engine sends no fetcher block. Its empirical ledger time is still safe to show. */}
        {!fetcher && runner && (
          <div className="datalib__sweep">{runner.lastFetchSweepAt ? `last fetch sweep ${ago(runner.lastFetchSweepAt)}` : 'service status unavailable'}</div>
        )}
      </div>
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
  const [canScan, setCanScan] = useState(false)
  const [canBuild, setCanBuild] = useState(false)
  const [focusNeed, setFocusNeed] = useState<RecommendedNeed | null>(null)

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 30_000)
    return () => clearInterval(id)
  }, [refresh])
  useEffect(() => {
    // §5 deploy skew: a positive match only — an older engine that omits the flags leaves the paid
    // affordances hidden rather than showing buttons that 403.
    let alive = true
    api.whoami().then((w) => { if (alive) { setCanScan(w.canScanPipeline === true); setCanBuild(w.canBuildConnector === true) } }).catch(() => {})
    return () => { alive = false }
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const pipelines = useMemo(() => read?.pipelines ?? [], [read])
  // The server emits only open needs. Do not second-guess that list from a possibly stale `built_by` field:
  // a damaged/missing projection must remain visible even if an older server projection still names a builder.
  const recommended = useMemo(() => read?.recommended ?? [], [read])
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
  const waiting = useMemo(() => pipelines.filter(pipelineIsWaitingForFirstCheck).length, [pipelines])
  const action = useMemo(() => pipelines.filter((p) => !pipelineIsWaitingForFirstCheck(p)
    && (p.verdict === 'attention' || p.verdict === 'broken')).length, [pipelines])

  const doRefresh = useCallback(() => {
    setSpin(true)
    void refresh().finally(() => setTimeout(() => setSpin(false), 600))
  }, [refresh])
  // the funnel is one axis: picking a bucket clears the other, so the counts always match what is listed
  const setBucket = (patch: Partial<typeof filters>) => setFilters({ ...filters, kind: '', verdict: '', ...patch })
  const bucket = filters.kind === 'recommended' ? 'recommended' : filters.verdict || (filters.kind === 'wired' ? 'wired' : '')

  return (
    <motion.div className="pipeline datalib" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div className="pipeline__titlewrap">
          <div className="pipeline__title">Data</div>
          <div className="pipeline__sub">See what is arriving, what needs attention, and what is still missing.</div>
        </div>
        <div className="pipeline__tools">
          <button className={`btn btn--ghost pipeline__refresh${spin ? ' is-spinning' : ''}`} onClick={doRefresh} title="Re-read the connector registry, pool freshness and fetch health">↻</button>
          <button className="btn btn--ghost" onClick={close} title="Close">✕</button>
        </div>
      </div>

      {read !== null && !selected && <HealthStrip pipelines={pipelines} poolAvailable={poolAvailable} runner={read.runner} />}

      {selected ? (
        <PipelineDetail p={selected} poolAvailable={poolAvailable} />
      ) : (
        <div className="datalib__body">
          <div className="datalib__col">
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
                {read.widened.length > 0 && (
                  <details className="datalib__degraded">
                    <summary>{read.widened.length} connector/data contract warning{read.widened.length === 1 ? '' : 's'}</summary>
                    {read.widened.map((warning, index) => <div className="datalib__fine" key={`${index}/${warning}`}>{warning}</div>)}
                  </details>
                )}
                <div className="datalib__controls">
                  <div className="seg" role="radiogroup" aria-label="Which feeds to show">
                    <button className={`seg__btn${!bucket ? ' seg__btn--on' : ''}`} role="radio" aria-checked={!bucket} onClick={() => setBucket({})}>All {pipelines.length + recommended.length}</button>
                    <button className={`seg__btn${bucket === 'live' ? ' seg__btn--on' : ''}`} role="radio" aria-checked={bucket === 'live'} disabled={!pipelines.some((p) => p.verdict === 'live')} onClick={() => setBucket({ verdict: bucket === 'live' ? '' : 'live' })}>Live {pipelines.filter((p) => p.verdict === 'live').length}</button>
                    <button className={`seg__btn${bucket === 'action' ? ' seg__btn--on' : ''}`} role="radio" aria-checked={bucket === 'action'} disabled={!action} onClick={() => setBucket({ verdict: bucket === 'action' ? '' : 'action' })}>Action required {action}</button>
                    <button className={`seg__btn${bucket === 'waiting' ? ' seg__btn--on' : ''}`} role="radio" aria-checked={bucket === 'waiting'} disabled={!waiting} onClick={() => setBucket({ verdict: bucket === 'waiting' ? '' : 'waiting' })}>Waiting {waiting}</button>
                    <button className={`seg__btn${bucket === 'recommended' ? ' seg__btn--on' : ''}`} role="radio" aria-checked={bucket === 'recommended'} disabled={!recommended.length} onClick={() => setBucket({ kind: bucket === 'recommended' ? '' : 'recommended' })}>Missing {recommended.length}</button>
                  </div>
                  <DataLibraryFilters value={filters} onChange={setFilters} subjects={subjects} cadences={cadences} tiers={tiers} />
                </div>

                {wired.length > 0 && filters.kind !== 'recommended' && (
                  <div className="datalib__list">
                    {wired.map((p) => <WiredRow key={p.id} p={p} onOpen={() => setSelected(p.id)} />)}
                  </div>
                )}
                {filters.kind !== 'recommended' && !wired.length && !pipelines.length && (
                  <div className="bookempty">
                    <div className="bookempty__title">No feeds wired yet</div>
                    <div className="bookempty__body">
                      nothing under .claude/connectors/ on this engine — a feed is a connector folder with a connector.json manifest and a fetch.py.
                      {canBuild ? ' Find a source below and the isolated builder can implement it.' : ' Find a primary source below, then implement it through the manual branch and pull-request workflow.'}
                    </div>
                  </div>
                )}

                {filters.kind !== 'wired' && !filters.verdict && (
                  <>
                    <div className="datalib__sechead">
                      Missing data
                      <span className="datalib__fine">— the runs said these would sharpen a call, and no current, usable feed closes them yet</span>
                    </div>
                    {recs.length > 0 ? (
                      <div className="datalib__list">
                        {recs.map((r) => (
                          <RecommendedRow key={r.key} r={r} pipelines={pipelines} canScan={canScan} canBuild={canBuild}
                            onBuild={() => setFocusNeed(r)} onOpenExisting={setSelected} />
                        ))}
                      </div>
                    ) : recommended.length === 0 ? (
                      <div className="bookempty bookempty--slim">
                        <div className="bookempty__body">No unmet data needs — every gap a run surfaced is either wired or can only be closed by a filing.</div>
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

                <DataLibraryBuild
                  pipelines={pipelines} recommended={recommended}
                  canScan={canScan} canBuild={canBuild}
                  focusNeed={focusNeed} onFocusHandled={() => setFocusNeed(null)}
                  onRefresh={doRefresh}
                />
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
