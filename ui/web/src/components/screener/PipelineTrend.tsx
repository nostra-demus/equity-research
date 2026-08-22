import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import type { NewsDiagnostics, PipelineAuditEvent, PipelineTrend, PipelineTrendBucket } from '../../lib/types'

const PRESETS = [
  { id: '1h', label: '1h', ms: 3_600_000 },
  { id: '24h', label: '24h', ms: 86_400_000 },
  { id: '7d', label: '7d', ms: 7 * 86_400_000 },
  { id: '30d', label: '30d', ms: 30 * 86_400_000 },
] as const

function localInput(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function pathSegments(
  buckets: PipelineTrendBucket[],
  value: (bucket: PipelineTrendBucket) => number | null,
  x: (index: number) => number,
  y: (value: number) => number,
): string[] {
  const paths: string[] = []
  let current = ''
  buckets.forEach((bucket, index) => {
    const point = value(bucket)
    if (point == null || !Number.isFinite(point) || !bucket.verified) {
      if (current) paths.push(current)
      current = ''
      return
    }
    current += `${current ? ' L' : 'M'} ${x(index).toFixed(2)} ${y(point).toFixed(2)}`
  })
  if (current) paths.push(current)
  return paths
}

function nice(value: number | null, digits = 3): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString(undefined, { maximumFractionDigits: digits })
}

function eventAt(events: PipelineAuditEvent[], bucket: PipelineTrendBucket) {
  const from = Date.parse(bucket.start)
  const to = Date.parse(bucket.end)
  const inside = events.filter((event) => {
    const time = Date.parse(event.ts)
    return time >= from && time < to
  }).sort((left, right) => left.ts.localeCompare(right.ts))
  const decision = [...inside].reverse().find((event): event is Extract<PipelineAuditEvent, { kind: 'provider_decision' }> => event.kind === 'provider_decision')
  const outcome = decision
    ? inside.find((event): event is Extract<PipelineAuditEvent, { kind: 'provider_outcome' }> => event.kind === 'provider_outcome' && event.decisionId === decision.decisionId)
    : undefined
  const snapshot = [...inside].reverse().find((event): event is Extract<PipelineAuditEvent, { kind: 'provider_snapshot' }> => event.kind === 'provider_snapshot')
  return { decision, outcome, snapshot }
}

function auditEventKey(event: PipelineAuditEvent): string {
  if (event.kind === 'provider_decision' || event.kind === 'provider_outcome') return `${event.kind}:${event.ts}:${event.decisionId}`
  if (event.kind === 'provider_snapshot') return `${event.kind}:${event.ts}:${event.cycleId}:${event.phase}`
  return `${event.kind}:${event.ts}:${event.cycleId}:${event.from}:${event.to}`
}

export function PipelineTrendView({ diagnostics }: { diagnostics: NewsDiagnostics }) {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]['id'] | 'custom'>('24h')
  const [range, setRange] = useState(() => {
    const to = new Date().toISOString()
    return { from: new Date(Date.now() - 86_400_000).toISOString(), to }
  })
  const [custom, setCustom] = useState(() => ({ from: localInput(range.from), to: localInput(range.to) }))
  const [trend, setTrend] = useState<PipelineTrend | null>(null)
  const [events, setEvents] = useState<PipelineAuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    void Promise.all([
      api.newsDiagnosticsTrend(range.from, range.to),
      api.newsDiagnosticsTrendEvents(range.from, range.to, '', '', 250),
    ]).then(([nextTrend, page]) => {
      if (!live) return
      setTrend(nextTrend)
      setEvents(page.events)
      setSelected(Math.max(0, nextTrend.buckets.length - 1))
    }).catch((reason: any) => {
      if (live) setError(reason?.message || 'Trend history could not be read.')
    }).finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [range])

  const choosePreset = (id: (typeof PRESETS)[number]['id'], ms: number) => {
    const to = Date.now()
    const next = { from: new Date(to - ms).toISOString(), to: new Date(to).toISOString() }
    setPreset(id)
    setRange(next)
    setCustom({ from: localInput(next.from), to: localInput(next.to) })
  }
  const applyCustom = () => {
    const from = new Date(custom.from).getTime()
    const to = new Date(custom.to).getTime()
    if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to || to - from > 90 * 86_400_000) {
      setError('Choose a valid range up to 90 days.')
      return
    }
    setPreset('custom')
    setRange({ from: new Date(from).toISOString(), to: new Date(to).toISOString() })
  }

  const chart = useMemo(() => {
    const buckets = trend?.buckets || []
    const providerIds = trend?.providers.map((provider) => provider.id) || []
    const width = 960
    const left = 82
    const right = 18
    const plotWidth = width - left - right
    const laneHeight = 26
    const providerTop = 274
    const height = providerTop + Math.max(1, providerIds.length) * laneHeight + 28
    const x = (index: number) => left + (buckets.length <= 1 ? plotWidth / 2 : index * plotWidth / (buckets.length - 1))
    const maxRate = Math.max(0.001, ...buckets.flatMap((bucket) => [bucket.inflowPerSecond || 0, bucket.scanningPerSecond || 0]))
    const maxBacklog = Math.max(1, ...buckets.map((bucket) => bucket.backlog || 0))
    const maxLoss = Math.max(1, ...buckets.flatMap((bucket) => [bucket.retired || 0, bucket.legacyLoss || 0]))
    const rateY = (value: number) => 102 - value / maxRate * 70
    const backlogY = (value: number) => 228 - value / maxBacklog * 74
    const lossY = (value: number) => 228 - value / maxLoss * 48
    return { buckets, providerIds, width, left, plotWidth, laneHeight, providerTop, height, x, rateY, backlogY, lossY, maxRate, maxBacklog }
  }, [trend])

  const selectedBucket = chart.buckets[Math.min(selected, Math.max(0, chart.buckets.length - 1))]

  // The overview deliberately loads only one bounded event page. When the crosshair moves outside that
  // page, fetch the exact bucket on demand so an older tooltip never guesses an outcome from chart totals.
  useEffect(() => {
    if (!selectedBucket) return
    let live = true
    const timer = window.setTimeout(() => {
      void api.newsDiagnosticsTrendEvents(selectedBucket.start, selectedBucket.end, '', '', 250).then((page) => {
        if (!live) return
        setEvents((current) => {
          const keyed = new Map(current.map((event) => [auditEventKey(event), event]))
          for (const event of page.events) keyed.set(auditEventKey(event), event)
          return [...keyed.values()]
        })
      }).catch(() => { /* overview coverage remains visible; never invent an exact event */ })
    }, 250)
    return () => { live = false; window.clearTimeout(timer) }
  }, [selectedBucket?.start, selectedBucket?.end])

  const audit = selectedBucket ? eventAt(events, selectedBucket) : null
  const selectedProvider = audit?.decision?.actualProviderId || audit?.decision?.shadowProviderId || null
  const selectedCandidate = selectedProvider ? audit?.decision?.candidates.find((candidate) => candidate.id === selectedProvider) : undefined
  const allowance = selectedProvider ? audit?.snapshot?.providers.find((provider) => provider.id === selectedProvider) : undefined
  const crosshairX = chart.buckets.length ? chart.x(Math.min(selected, chart.buckets.length - 1)) : chart.left

  return (
    <div className="diagtrend">
      <div className="diagtrend__bar">
        <div className="diagtrend__presets" aria-label="Trend range">
          {PRESETS.map((item) => <button key={item.id} className={`btn btn--ghost diag__mini${preset === item.id ? ' is-active' : ''}`} onClick={() => choosePreset(item.id, item.ms)} aria-pressed={preset === item.id}>{item.label}</button>)}
        </div>
        <div className="diagtrend__custom">
          <label>From <input type="datetime-local" value={custom.from} onChange={(event) => setCustom((value) => ({ ...value, from: event.target.value }))} /></label>
          <label>To <input type="datetime-local" value={custom.to} onChange={(event) => setCustom((value) => ({ ...value, to: event.target.value }))} /></label>
          <button className="btn btn--ghost diag__mini" onClick={applyCustom}>Apply</button>
        </div>
      </div>

      <div className="diagtrend__router" data-mode={diagnostics.router?.mode || 'static'}>
        <span>{(diagnostics.router?.mode || 'static').replace('-', ' ')}</span>
        <b>{diagnostics.router?.reason || 'This server has no adaptive-router summary; configured order remains authoritative.'}</b>
        {diagnostics.router?.mode === 'shadow' && diagnostics.router.activatesAt && <small>Earliest activation {new Date(diagnostics.router.activatesAt).toLocaleString()} · {diagnostics.router.outcomeCount} completed outcomes · {diagnostics.router.pendingDecisions} open audit gaps</small>}
      </div>

      {loading ? <div className="diagtrend__state">Loading the audit timeline…</div> : error ? <div className="diagtrend__state is-error" role="alert">{error}</div> : !trend || trend.buckets.length === 0 ? <div className="diagtrend__state">No verified trend history exists for this range yet. Older summaries remain legacy/unverified.</div> : <>
        {!trend.coverage.complete && <div className="diagtrend__coverage" role="status">Hatched spans are unproved history. Missing pipeline days: {trend.coverage.missingPipelineDays.length}; missing flow days: {trend.coverage.missingFirehoseDays.length}; corrupt rows: {trend.coverage.corruptRows}.</div>}
        <div className="diagtrend__canvas">
          <svg
            className="diagtrend__svg"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="application"
            aria-label="Pipeline audit timeline. Use left and right arrow keys to move the crosshair."
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') { event.preventDefault(); setSelected((value) => Math.max(0, value - 1)) }
              if (event.key === 'ArrowRight') { event.preventDefault(); setSelected((value) => Math.min(chart.buckets.length - 1, value + 1)) }
              if (event.key === 'Home') { event.preventDefault(); setSelected(0) }
              if (event.key === 'End') { event.preventDefault(); setSelected(chart.buckets.length - 1) }
            }}
            onPointerMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect()
              const svgX = (event.clientX - bounds.left) / bounds.width * chart.width
              const index = Math.round((svgX - chart.left) / chart.plotWidth * Math.max(1, chart.buckets.length - 1))
              setSelected(Math.max(0, Math.min(chart.buckets.length - 1, index)))
            }}
          >
            <defs>
              <pattern id="audit-gap" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--text-faint)" strokeWidth="2" opacity=".35" /></pattern>
            </defs>
            <text x="8" y="22" className="diagtrend__label">FLOW / SECOND</text>
            <text x="8" y="142" className="diagtrend__label">QUEUE + LOSS</text>
            <text x="8" y="264" className="diagtrend__label">PROVIDERS</text>
            {[116, 246].map((y) => <line key={y} x1={chart.left} x2={chart.width - 18} y1={y} y2={y} className="diagtrend__divider" />)}
            {chart.buckets.map((bucket, index) => !bucket.verified && <rect key={`gap-${bucket.start}`} x={chart.x(index) - Math.max(2, chart.plotWidth / chart.buckets.length / 2)} y="27" width={Math.max(4, chart.plotWidth / chart.buckets.length)} height={chart.height - 50} fill="url(#audit-gap)" />)}
            {pathSegments(chart.buckets, (bucket) => bucket.inflowPerSecond, chart.x, chart.rateY).map((path, index) => <path key={`in-${index}`} d={path} className="diagtrend__line is-inflow" />)}
            {pathSegments(chart.buckets, (bucket) => bucket.scanningPerSecond, chart.x, chart.rateY).map((path, index) => <path key={`scan-${index}`} d={path} className="diagtrend__line is-scanning" />)}
            {pathSegments(chart.buckets, (bucket) => bucket.backlog, chart.x, chart.backlogY).map((path, index) => <path key={`backlog-${index}`} d={path} className="diagtrend__line is-backlog" />)}
            {pathSegments(chart.buckets, (bucket) => bucket.retired, chart.x, chart.lossY).map((path, index) => <path key={`retired-${index}`} d={path} className="diagtrend__line is-retired" />)}
            {pathSegments(chart.buckets, (bucket) => bucket.legacyLoss, chart.x, chart.lossY).map((path, index) => <path key={`loss-${index}`} d={path} className="diagtrend__line is-loss" />)}
            {chart.buckets.map((bucket, index) => bucket.routerTransition && <g key={`route-${bucket.start}`}>
              <line x1={chart.x(index)} x2={chart.x(index)} y1="26" y2={chart.height - 18} className="diagtrend__transition" />
              <text x={chart.x(index) + 4} y="255" className="diagtrend__transitionlabel">{bucket.routerTransition}</text>
            </g>)}
            <text x={chart.left + 6} y="42" className="diagtrend__legend is-inflow">inflow</text>
            <text x={chart.left + 58} y="42" className="diagtrend__legend is-scanning">scanning</text>
            <text x={chart.left + 6} y="158" className="diagtrend__legend is-backlog">backlog</text>
            <text x={chart.left + 68} y="158" className="diagtrend__legend is-retired">retired</text>
            <text x={chart.left + 124} y="158" className="diagtrend__legend is-loss">legacy loss</text>
            {chart.providerIds.map((providerId, lane) => {
              const y = chart.providerTop + lane * chart.laneHeight
              return <g key={providerId}>
                <text x="8" y={y + 5} className="diagtrend__provider">{providerId.slice(0, 13)}</text>
                <line x1={chart.left} x2={chart.width - 18} y1={y} y2={y} className="diagtrend__lane" />
                {chart.buckets.map((bucket, index) => {
                  const point = bucket.providers[providerId]
                  if (!point) return null
                  const radius = Math.min(7, 2 + Math.sqrt(point.scoredItems || point.successes))
                  return <g key={`${providerId}-${bucket.start}`}>
                    {point.successes > 0 && <circle cx={chart.x(index)} cy={y} r={radius} className="diagtrend__success" />}
                    {point.failures > 0 && <path d={`M ${chart.x(index) - 4} ${y - 4} l 8 8 M ${chart.x(index) + 4} ${y - 4} l -8 8`} className="diagtrend__failure" />}
                    {point.routingChanges > 0 && <path d={`M ${chart.x(index)} ${y - 8} l 4 4 l -4 4 l -4 -4 z`} className="diagtrend__routechange" />}
                    {point.actualRank != null && <text x={chart.x(index) + 5} y={y - 5} className="diagtrend__rank">#{point.actualRank}{point.shadowRank != null && point.shadowRank !== point.actualRank ? `→${point.shadowRank}` : ''}</text>}
                  </g>
                })}
              </g>
            })}
            <line x1={crosshairX} x2={crosshairX} y1="26" y2={chart.height - 18} className="diagtrend__crosshair" />
            <circle cx={crosshairX} cy="26" r="4" className="diagtrend__crossdot" />
            <text x={chart.left} y={chart.height - 4} className="diagtrend__axis">{new Date(trend.from).toLocaleString()}</text>
            <text x={chart.width - 18} y={chart.height - 4} textAnchor="end" className="diagtrend__axis">{new Date(trend.to).toLocaleString()}</text>
          </svg>
          {selectedBucket && <div className="diagtrend__tooltip" role="status" aria-live="polite">
            <b>{new Date(selectedBucket.start).toISOString()} UTC</b>
            <span>{new Date(selectedBucket.start).toLocaleString()} local</span>
            <span>Inflow {nice(selectedBucket.inflowPerSecond)} /s · scanning {nice(selectedBucket.scanningPerSecond)} /s · backlog {nice(selectedBucket.backlog, 0)}</span>
            <span>Retired {nice(selectedBucket.retired, 0)} · legacy loss {nice(selectedBucket.legacyLoss, 0)} · {selectedBucket.verified ? 'verified' : 'unproved gap'}</span>
            <span>Router {selectedBucket.routerMode || 'unverified'}{selectedBucket.routerTransition ? ` · transition ${selectedBucket.routerTransition}` : ''}</span>
            {audit?.decision ? <>
              <span>Decision {audit.decision.decisionId} · {audit.decision.mode}{audit.decision.exploration ? ' · recovery probe' : ''}</span>
              <span>Selected {audit.decision.actualProviderId || 'none'} · shadow {audit.decision.shadowProviderId || 'none'}</span>
              {selectedCandidate && <span>Actual rank {selectedCandidate.actualRank == null ? '—' : `#${selectedCandidate.actualRank}`} · shadow rank {selectedCandidate.shadowRank == null ? '—' : `#${selectedCandidate.shadowRank}`} · {selectedCandidate.eligible ? 'eligible' : selectedCandidate.reason}</span>}
              {selectedCandidate && <span>Score {nice(selectedCandidate.score, 1)} = yield {nice(selectedCandidate.components.usableBatchYield * 45, 1)} + throughput {nice(selectedCandidate.components.usefulThroughput * 25, 1)} + urgency {nice(selectedCandidate.components.releasedCapacityUrgency * 30, 1)} − failures {nice(selectedCandidate.components.failurePenalty, 0)} − cost {nice(selectedCandidate.components.costPenalty, 0)}</span>}
              {audit.outcome ? <span>Outcome {audit.outcome.outcome}{audit.outcome.failureClass ? ` (${audit.outcome.failureClass})` : ''} · {audit.outcome.scoredItems}/{audit.outcome.batchSize} items · {nice(audit.outcome.elapsedMs / 1000, 2)}s · {audit.outcome.tokens.toLocaleString()} tokens · ${nice(audit.outcome.costUsd, 4)}</span> : <span>Outcome missing — explicit audit gap.</span>}
              {allowance && <span>Allowance {nice(allowance.allowanceUsed ?? null)} used / {nice(allowance.allowanceReleased ?? null)} released / {nice(allowance.allowanceCap ?? null)} cap · {allowance.state}</span>}
            </> : <span>No exact decision is present in the loaded audit page for this bucket.</span>}
          </div>}
        </div>

        <div className="diagtrend__tablewrap">
          <table className="diagtrend__table">
            <caption>Provider contribution and fitness summary for this range</caption>
            <thead><tr><th>Provider</th><th>Contribution</th><th>Usable-batch yield</th><th>Useful throughput</th><th>Released-capacity use</th><th>Failures</th><th>Current rank</th></tr></thead>
            <tbody>{trend.providers.map((provider) => <tr key={provider.id}><th>{provider.id}</th><td>{nice(provider.contributionShare * 100, 1)}%</td><td>{nice(provider.usableBatchYield * 100, 1)}%</td><td>{nice(provider.usefulThroughput)} items/s</td><td>{provider.releasedCapacityUtilization == null ? '—' : `${nice(provider.releasedCapacityUtilization * 100, 1)}%`}</td><td>{provider.failures}</td><td>{provider.currentRank == null ? '—' : `#${provider.currentRank}`}</td></tr>)}</tbody>
          </table>
        </div>
      </>}
    </div>
  )
}
