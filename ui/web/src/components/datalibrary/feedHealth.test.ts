// Connector-v2 display contract. Run: npx tsx src/components/datalibrary/feedHealth.test.ts
// Fixture ids are intentionally synthetic; the cross-swarm purity guard scans this directory.
import assert from 'node:assert/strict'
import type {
  DiscoveredFeed,
  FeedHealthPayloadState,
  FeedHealthState,
  PipelineEntry,
  PipelineSubjectStatus,
  RecommendedNeed,
  RepairStatus,
} from '../../lib/types'
import {
  connectorForCandidate,
  connectorIdForCandidate,
  connectorForNeed,
  existingConnectorGuidance,
  FEED_HEALTH_DISPLAY,
  feedHealthOf,
  ledgerIntegrityWarningOf,
  normalizeFeedHealth,
  pipelineIsUsable,
  repairForSubject,
  REPAIR_DISPLAY,
  worstPipelineRepair,
  worstPipelineStatus,
} from './feedHealth'
import {
  AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE,
  recommendedDiscoveryAction,
} from './buildAvailability'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const V2_STATES: FeedHealthState[] = [
  'current', 'no_new_release', 'stalled', 'schema_failed', 'suspect', 'credentials_missing',
  'broken', 'quarantined', 'manual', 'no_pool', 'pending', 'never_run',
]
const REPAIR_STATES: RepairStatus[] = ['none', 'repairing', 'pr_open', 'verified', 'assessed', 'source_gone']

const mkStatus = (
  subject: string,
  health: FeedHealthPayloadState,
  status: PipelineSubjectStatus['status'] = 'fresh',
  fetchOutcome?: string,
): PipelineSubjectStatus => ({ subject, status, health, fetchOutcome, failStreak: health === 'broken' ? 3 : 0 })

const mkPipeline = (over: Partial<PipelineEntry> = {}): PipelineEntry => ({
  id: 'fixture-connector-ui', series: 'Fixture series', provider: 'Fixture provider', acquisition: 'official_api',
  sourceType: 'paid_api', tier: 5, hostAllowlist: ['fixture.test'], cadence: 'weekly', releaseWindowDays: 10,
  entry: 'fetch.py', verify: 'fetch.py --verify', outputPath: 'data/<SUBJECT>/external/fixture/a_<as_of>.json',
  subjects: ['ZZZ'], satisfies: ['fixture-need'], helps: [],
  statuses: [mkStatus('ZZZ', 'current')], verdict: 'live', verdictNote: 'current',
  repair: { status: 'none', prUrl: null },
  ...over,
})

const mkNeed = (over: Partial<RecommendedNeed> = {}): RecommendedNeed => ({
  key: 'fixture/ZZZ/fixture-need', swarm: 'fixture', subject: 'ZZZ', need_id: 'fixture-need',
  series: 'Missing fixture series', why_it_caps: 'caps the fixture read',
  suggested_source: { name: 'Fixture source', acquisition: 'official_api' },
  tier: 5, cadence: 'weekly', entry_modules: ['fixture-module'],
  ...over,
})

const mkCandidate = (matched_need_ids: string[]): DiscoveredFeed => ({
  pipeline_id: 'PIPE-20260809-deadbeef', source_url: 'https://fixture.test/data', why: 'fixture', building: false,
  verdict: {
    relevance: 'exact', confidence: 90, series: 'Fixture series', matched_need_ids,
    entry_modules: ['fixture-module'], acquisition: 'official_api', tier: 5, cadence: 'weekly',
    host: 'fixture.test', endpoint_hint: '/data', verdict_note: 'fixture', buildable: true,
  },
})

check('the display map covers the exact connector-v2 public states', () => {
  assert.deepEqual(Object.keys(FEED_HEALTH_DISPLAY).sort(), [...V2_STATES].sort())
  for (const state of V2_STATES) {
    assert.ok(FEED_HEALTH_DISPLAY[state].label.trim(), `${state} needs a label`)
    assert.ok(FEED_HEALTH_DISPLAY[state].hint.trim(), `${state} needs a hint`)
    assert.ok(Number.isFinite(FEED_HEALTH_DISPLAY[state].severity), `${state} needs a severity`)
  }
})

check('legacy ok/failing payloads normalize without leaking legacy labels', () => {
  assert.equal(normalizeFeedHealth('ok'), 'current')
  assert.equal(normalizeFeedHealth('failing'), 'stalled')
  assert.equal(normalizeFeedHealth('schema_failed'), 'schema_failed')
  assert.equal(feedHealthOf(mkStatus('ZZZ', 'ok', 'fresh', 'no_new_release')), 'no_new_release', 'precise v2 outcome wins on a mixed deploy')
  assert.equal(feedHealthOf(mkStatus('ZZZ', 'broken', 'fresh', 'stalled')), 'broken', 'v2 repeated-failure rollup is not downgraded by its raw outcome')
})

check('worst status uses explicit severity, freshness, then subject — never array order', () => {
  const rows = [
    mkStatus('CCC', 'current'),
    mkStatus('BBB', 'broken'),
    mkStatus('AAA', 'quarantined'),
    mkStatus('DDD', 'schema_failed'),
  ]
  assert.equal(worstPipelineStatus(rows)?.subject, 'AAA')
  assert.equal(worstPipelineStatus([...rows].reverse())?.subject, 'AAA')

  const tied = [mkStatus('BBB', 'stalled', 'stale'), mkStatus('AAA', 'stalled', 'missing')]
  assert.equal(worstPipelineStatus(tied)?.subject, 'AAA', 'missing file breaks an equal-health tie')
  assert.equal(worstPipelineStatus([mkStatus('BBB', 'stalled'), mkStatus('AAA', 'stalled')])?.subject, 'AAA', 'subject is the stable final tie-breaker')
})

check('usable means a fresh file plus current/no-new-release/manual health', () => {
  for (const health of ['current', 'no_new_release', 'manual', 'ok'] as FeedHealthPayloadState[]) {
    assert.equal(pipelineIsUsable(mkPipeline({ statuses: [mkStatus('ZZZ', health)] }), 'ZZZ'), true, health)
  }
  assert.equal(pipelineIsUsable(mkPipeline({ statuses: [mkStatus('ZZZ', 'current', 'stale')] }), 'ZZZ'), false)
  assert.equal(pipelineIsUsable(mkPipeline({ statuses: [mkStatus('ZZZ', 'stalled')] }), 'ZZZ'), false)
  assert.equal(pipelineIsUsable(mkPipeline(), 'OTHER'), false, 'an absent subject is never usable')
})

check('a ledger-integrity warning remains visible independently of current usable health', () => {
  const warning = 'connector run ledger contains 1 malformed row; valid prior clocks were retained'
  const current = { ...mkStatus('ZZZ', 'current'), ledgerIntegrityWarning: warning }
  const pipeline = mkPipeline({ statuses: [current] })
  assert.equal(pipelineIsUsable(pipeline, 'ZZZ'), true)
  assert.equal(ledgerIntegrityWarningOf(pipeline.statuses), warning)
  assert.equal(ledgerIntegrityWarningOf([mkStatus('ZZZ', 'current')]), null)
})

check('scan-only mode never promises an automatic connector build', () => {
  const scanOnly = recommendedDiscoveryAction(false)
  assert.equal(scanOnly.label, 'Find source ▸')
  assert.doesNotMatch(scanOnly.label, /build/i)
  assert.match(scanOnly.title, /Automatic connector coding is unavailable/i)
  assert.doesNotMatch(scanOnly.title, /send it to|builder/i)
  assert.match(AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE, /manual branch and pull-request workflow/i)
  assert.doesNotMatch(AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE, /admin-only/i)
})

check('repair copy covers every lifecycle state and does not call a PR-open feed fixed', () => {
  assert.deepEqual(Object.keys(REPAIR_DISPLAY).sort(), [...REPAIR_STATES].sort())
  assert.equal(REPAIR_DISPLAY.none.detail, null)
  assert.match(REPAIR_DISPLAY.repairing.detail || '', /remains unavailable/i)
  assert.match(REPAIR_DISPLAY.pr_open.detail || '', /not fixed yet/i)
  assert.match(REPAIR_DISPLAY.pr_open.detail || '', /successful fetch/i)
  assert.match(REPAIR_DISPLAY.verified.detail || '', /successful fetch after/i)
  assert.match(REPAIR_DISPLAY.assessed.detail || '', /No automatic repair is running/i)
  assert.match(REPAIR_DISPLAY.assessed.detail || '', /manual attention/i)
  assert.match(REPAIR_DISPLAY.source_gone.detail || '', /permanently unavailable/i)
})

check('subject-scoped repairs are visible and drive guidance for their own need', () => {
  const pipeline = mkPipeline({
    subjects: ['AAA', 'ZZZ'],
    statuses: [mkStatus('AAA', 'current'), mkStatus('ZZZ', 'broken', 'stale')],
    repairs: {
      AAA: { status: 'none', prUrl: null },
      ZZZ: { status: 'pr_open', prUrl: 'https://example.test/pr/2' },
    },
  })
  assert.equal(repairForSubject(pipeline, 'AAA').status, 'none')
  assert.equal(repairForSubject(pipeline, 'ZZZ').status, 'pr_open')
  assert.deepEqual(worstPipelineRepair(pipeline), {
    subject: 'ZZZ', repair: { status: 'pr_open', prUrl: 'https://example.test/pr/2' },
  })
  assert.equal(existingConnectorGuidance(mkNeed({ connector_exists: pipeline.id }), [pipeline])?.action, 'wait')
})

check('connector_exists keeps an unhealthy need open but suppresses duplicate-build guidance', () => {
  const broken = mkPipeline({
    statuses: [mkStatus('ZZZ', 'broken', 'stale')], verdict: 'broken', repair: { status: 'none', prUrl: null },
  })
  const need = mkNeed({ connector_exists: broken.id })
  assert.equal(connectorForNeed(need, [broken])?.id, broken.id)
  assert.deepEqual(existingConnectorGuidance(need, [broken]), {
    id: broken.id, action: 'repair', message: 'repair this feed; do not build a duplicate',
  })
})

check('manifest coverage is a deploy-skew fallback when connector_exists is absent', () => {
  const pending = mkPipeline({ statuses: [mkStatus('ZZZ', 'never_run', 'missing')], verdict: 'attention' })
  assert.equal(connectorForNeed(mkNeed(), [pending])?.id, pending.id)
  assert.equal(existingConnectorGuidance(mkNeed(), [pending])?.action, 'wait')

  const explicit = mkNeed({ connector_exists: 'fixture-connector-not-in-read' })
  assert.equal(connectorForNeed(explicit, [pending]), undefined, 'an explicit server join is not replaced by a different covering row')
  assert.equal(existingConnectorGuidance(explicit, [pending])?.id, 'fixture-connector-not-in-read')
})

check('generic discovery cannot offer a second primary for an already-covered subject and need', () => {
  const existing = mkPipeline({ statuses: [mkStatus('ZZZ', 'broken', 'stale')], verdict: 'broken' })
  assert.equal(connectorForCandidate(mkCandidate(['fixture-need']), 'zzz', [existing])?.id, existing.id)
  assert.equal(connectorForCandidate(mkCandidate(['another-need']), 'ZZZ', [existing]), undefined)
  assert.equal(connectorForCandidate(mkCandidate(['fixture-need']), 'OTHER', [existing]), undefined)
  assert.equal(connectorForCandidate(mkCandidate([]), 'ZZZ', [existing]), undefined,
    'a host or loose series name is not enough to suppress a distinct feed')
})

check('server connector_exists survives discovery as duplicate-build proof even if the pipeline read is stale', () => {
  const candidate = { ...mkCandidate(['fixture-need']), connector_exists: 'server-known-connector' }
  assert.equal(connectorIdForCandidate(candidate, 'ZZZ', []), 'server-known-connector')
})

check('built_by is current+usable proof; repair states give wait/repair/replace instructions', () => {
  const id = 'fixture-connector-ui'
  assert.deepEqual(existingConnectorGuidance(mkNeed({ built_by: id, connector_exists: id }), []), {
    id, action: 'usable', message: 'current and usable; this need is already closed',
  })
  assert.equal(existingConnectorGuidance(mkNeed({ connector_exists: id }), [mkPipeline({ repair: { status: 'pr_open', prUrl: 'https://example.test/pr/1' } })])?.action, 'wait')
  assert.equal(existingConnectorGuidance(mkNeed({ connector_exists: id }), [mkPipeline({ repair: { status: 'assessed', prUrl: null } })])?.action, 'repair')
  assert.equal(existingConnectorGuidance(mkNeed({ connector_exists: id }), [mkPipeline({ repair: { status: 'source_gone', prUrl: null } })])?.action, 'replace')
})

console.log(`\nfeedHealth.test.ts: ${passed} passed`)
