// Read-only Data Library projection over the shared connector registry. It joins three truths:
// (1) strictly validated manifests, (2) canonical v2 current-pointer eligibility (legacy v1 alone uses
// filename/SLA freshness), and (3) each run's declared data_needs[]. No fetch or write occurs here.
// Malformed connectors fail closed in the registry, source tiers remain conservatively clamped for display,
// and a host without the pool mount reports `unknown` rather than inventing missing data.
import fs from 'node:fs'
import path from 'node:path'
import {
  connectorCurrentStatus, discoverConnectors, healthyBuiltBySatisfies, type ConnectorManifest,
} from './connector-registry'
import { CONNECTOR_RUNNER, DATA_DIR, REPO_ROOT, connectorAutoRepairReady, connectorRunnerReady } from './config'
import { readDataNeeds } from './data-needs'
import { latestRepairStatus, latestRepairStatusForSubject, type RepairStatus } from './connector-health'
import { feedHealthOf, readFeedHealth, type FeedHealth, type FeedHealthState } from './feed-health'
import { listSwarms } from './swarms'
import { swarmSubjects } from './roster'
import { readConnectorFetchServiceStatus, type ConnectorFetchServiceStatus } from './connector-service-status'

export interface PipelineSubjectStatus {
  subject: string
  status: 'fresh' | 'stale' | 'missing' | 'unknown'
  latestAsOf?: string
  ageDays?: number
  latestFile?: string
  projectionIntact?: boolean
  // The FETCH side of the same feed, from #287's run ledger — a different fact from the file freshness above
  // (a feed can be fresh-but-broken, or stale-but-healthy because the source published nothing new).
  health: FeedHealthState
  fetchOutcome?: string
  lastSweepAt?: string
  lastError?: string
  ledgerIntegrityWarning?: string
  failStreak: number
}
export interface PipelineHelp {
  swarm: string
  subject: string
  need_id: string
  series: string
  why_it_caps: string
  entry_modules: string[]
}
export interface PipelineEntry {
  id: string
  series: string
  provider: string
  acquisition: string
  sourceType: string
  tier: number
  tierCorrected?: boolean
  license?: string
  hostAllowlist: string[]
  cadence: string
  releaseWindowDays: number
  entry: string
  verify: string
  outputPath: string
  outputSchema?: unknown
  subjects: string[]
  satisfies: string[]
  helps: PipelineHelp[]
  statuses: PipelineSubjectStatus[]
  // The one-word answer to "is this feed working?", rolled up across its subjects, and the plain-English
  // sentence behind it. `unknown` is served honestly on a host with no pool mount — never a fake 'live'.
  verdict: PipelineVerdict
  verdictNote: string
  repair: { status: RepairStatus; prUrl: string | null }
  repairs: Record<string, { status: RepairStatus; prUrl: string | null }>
}
export type PipelineVerdict = 'live' | 'attention' | 'broken' | 'unknown'
export interface RecommendedNeed {
  key: string
  swarm: string
  subject: string
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  suggested_source: { name: string; acquisition: string; licensing?: string }
  tier: number
  cadence: string
  next_release?: string
  entry_modules: string[]
  built_by?: string
  connector_exists?: string
}
export interface PipelinesRead {
  generatedAt: string
  poolAvailable: boolean
  pipelines: PipelineEntry[]
  recommended: RecommendedNeed[]
  widened: string[]
  runner: RunnerStatus
}
// What is (and is not) keeping the feeds alive on this host. `lastFetchSweepAt` is EMPIRICAL — the newest row
// in the fetch ledger — so it stays truthful whether or not the launchd fetcher is installed here; the two
// booleans are the server's own repair loop, which is a different process from the fetcher.
export interface RunnerStatus {
  watchdogOn: boolean
  autoRepairOn: boolean
  pollIntervalMin: number
  lastFetchSweepAt: string | null
  // Positive OS-service proof from the runner-owned heartbeat.  Kept separate from the repair watchdog
  // above: connector code can be healthy while the scheduler is stopped, and vice versa.
  fetcher: ConnectorFetchServiceStatus
}

/**
 * A durable `repairing` row is only proof that work was active in the process which wrote it. When this
 * runtime cannot run the isolated coding agent, project that orphan honestly as assessed even if the repair
 * watchdog itself is disabled and therefore cannot append the terminal ledger row yet.
 */
export function runtimeRepairStatus(status: RepairStatus, automationAvailable: boolean): RepairStatus {
  return status === 'repairing' && !automationAvailable ? 'assessed' : status
}

// EXTERNAL_DATA.md §4 tier ceilings by source_type — unknown/missing fails closed to 9. A sidecar may
// still self-declare a MORE conservative tier than its ceiling (e.g. a web-scrape connector under the
// external_other ceiling of 9 self-labelling as the even-more-conservative tier-10 "reputable web source,
// unverified" per CLAUDE.md §4) — the clamp below only ever pushes a tier DOWN to its ceiling, never up.
const TIER_CEILING: Record<string, number> = {
  alt_data_panel: 5, vendor_export: 5, paid_api: 5, official_data: 5,
  broker_research: 7,
  expert_call: 9, channel_check: 9, management_meeting: 9,
  external_other: 9,
}

interface ParsedManifest {
  id: string
  series: string
  provider: string
  acquisition: string
  sourceType: string
  tier: number
  tierCorrected?: boolean
  license?: string
  hostAllowlist: string[]
  cadence: string
  releaseWindowDays: number
  entry: string
  verify: string
  outputPath: string
  outputSchema?: unknown
  subjects: string[]
  satisfies: string[]
}

function fromRegistry(m: ConnectorManifest): ParsedManifest | null {
  if (m.manifest_version === 1 && m.staleness_sla_days == null) return null
  const ceiling = TIER_CEILING[m.source_type] ?? 9
  const tier = Math.max(m.tier, ceiling)
  // Compatibility display field only for v2. Freshness itself is computed
  // from cadence -> next period + lag + grace in connectorCurrentStatus.
  const displayWindow = m.manifest_version === 2
    ? m.release.expected_lag_days + m.release.grace_days
    : m.staleness_sla_days!
  return {
    id: m.id, series: m.series, provider: m.provider, acquisition: m.acquisition,
    sourceType: m.source_type, tier, tierCorrected: m.tier < ceiling ? true : undefined,
    license: m.license, hostAllowlist: m.host_allowlist, cadence: m.cadence,
    releaseWindowDays: displayWindow, entry: m.entry, verify: m.verify,
    outputPath: m.output_path, outputSchema: m.output_schema,
    subjects: m.subjects, satisfies: m.satisfies,
  }
}

function subjectStatus(
  p: ParsedManifest, subject: string, poolAvailable: boolean, widened: string[], feed: FeedHealth,
  canonical: { asOf: string; retrievedAt: string; usable: boolean; projectionIntact: boolean } | null | undefined,
): PipelineSubjectStatus {
  const fetchSide = {
    health: feed.state,
    fetchOutcome: feed.outcome || undefined,
    lastSweepAt: feed.lastSweepAt || undefined,
    lastError: ['stalled', 'schema_failed', 'suspect', 'credentials_missing', 'broken', 'quarantined'].includes(feed.state) ? (feed.message || undefined) : undefined,
    ledgerIntegrityWarning: feed.ledgerIntegrityWarning || undefined,
    failStreak: feed.failStreak,
  }
  if (!poolAvailable) return { subject, status: 'unknown', ...fetchSide }
  if (canonical === null) return { subject, status: 'missing', ...fetchSide }
  if (canonical !== undefined && !canonical.projectionIntact) {
    return {
      subject, status: 'missing', projectionIntact: false, latestAsOf: canonical.asOf,
      ageDays: Math.floor((Date.now() - Date.parse(canonical.asOf)) / 86_400_000), ...fetchSide,
    }
  }
  const rel = p.outputPath.replaceAll('<SUBJECT>', subject)
  const dirAbs = path.resolve(REPO_ROOT, path.dirname(rel))
  if (dirAbs !== DATA_DIR && !dirAbs.startsWith(DATA_DIR + path.sep)) {
    widened.push(`${p.id}: output dir for ${subject} escapes the pool — status unknown`)
    return { subject, status: 'unknown', ...fetchSide }
  }
  const pieces = path.posix.basename(rel).split('<as_of>')
  if (pieces.length !== 2) {
    widened.push(`${p.id}: output_path for ${subject} has no single <as_of> filename token — freshness unknown`)
    return { subject, status: 'unknown', ...fetchSide }
  }
  const [pre, post] = pieces
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp('^' + esc(pre) + '(\\d{4}-\\d{2}-\\d{2})' + esc(post) + '$')
  let names: string[] = []
  try {
    names = fs.readdirSync(dirAbs)
  } catch {
    return { subject, status: 'missing', ...fetchSide }
  }
  let latest: string | undefined
  let latestFile: string | undefined
  for (const n of names) {
    const m = pattern.exec(n)
    if (!m || Number.isNaN(Date.parse(m[1]))) continue
    if (!latest || m[1] > latest) {
      latest = m[1]
      latestFile = path.relative(REPO_ROOT, path.join(dirAbs, n))
    }
  }
  if (!latest) return { subject, status: 'missing', ...fetchSide }
  const ageDays = Math.floor((Date.now() - Date.parse(latest)) / 86_400_000)
  return {
    subject,
    status: canonical === undefined ? (ageDays <= p.releaseWindowDays ? 'fresh' : 'stale')
      : (latest === canonical.asOf && canonical.usable && canonical.projectionIntact ? 'fresh' : 'stale'),
    latestAsOf: latest,
    ageDays,
    latestFile,
    projectionIntact: canonical === undefined ? undefined : true,
    ...fetchSide,
  }
}

// The row's headline, in the order a reader cares about: a dead fetcher outranks a stale file, and a stale
// file outranks a clean one. Every branch names the specific evidence (the error, age, or release window) — a
// coloured dot with no sentence behind it is what made the old surface unreadable.
export function rollUpVerdict(
  statuses: PipelineSubjectStatus[], _slaDays: number, poolAvailable: boolean,
): { verdict: PipelineVerdict; note: string } {
  if (!poolAvailable) return { verdict: 'unknown', note: 'the data pool is not mounted on this host — freshness and fetch health are computed on the always-on machine' }
  if (!statuses.length) return { verdict: 'unknown', note: 'the manifest names no subject to check' }

  const broken = statuses.find((s) => s.health === 'broken')
  if (broken) {
    return { verdict: 'broken', note: `the last ${broken.failStreak} fetches of ${broken.subject} failed${broken.lastError ? ` — ${broken.lastError}` : ''}` }
  }
  const stalled = statuses.find((s) => s.health === 'stalled')
  if (stalled) {
    return { verdict: 'attention', note: `the ${stalled.subject} release is stalled${stalled.lastError ? ` — ${stalled.lastError}` : ''}; it retries on the next sweep` }
  }
  const schemaFailed = statuses.find((s) => s.health === 'schema_failed')
  if (schemaFailed) {
    return { verdict: 'attention', note: `the last ${schemaFailed.subject} payload failed schema/provenance validation${schemaFailed.lastError ? ` — ${schemaFailed.lastError}` : ''}` }
  }
  const credentials = statuses.find((s) => s.health === 'credentials_missing')
  if (credentials) {
    return { verdict: 'attention', note: `${credentials.subject} cannot fetch because credentials are missing or rejected${credentials.lastError ? ` — ${credentials.lastError}` : ''}` }
  }
  const held = statuses.find((s) => s.health === 'suspect' || s.health === 'quarantined')
  if (held) {
    return { verdict: 'attention', note: `${held.subject} data is ${held.health} and was not published${held.lastError ? ` — ${held.lastError}` : ''}` }
  }
  const noPool = statuses.find((s) => s.health === 'no_pool')
  if (noPool) return { verdict: 'attention', note: `there is no data folder for ${noPool.subject} on the fetching host, so nothing can be written` }

  // A filename inside its date window is not a fetch attestation. Automatic feeds remain non-usable until
  // a real sweep has either validated the current vintage or published one. Explicit manual feeds are the
  // sole fresh-file exception and carry the distinct `manual` health state handled by the live branch below.
  const unattested = statuses.find((s) => s.health === 'never_run' || s.health === 'pending')
  if (unattested) {
    return unattested.health === 'never_run'
      ? { verdict: 'attention', note: `${unattested.subject} has not been swept by the fetcher; any existing file is not usable for data sufficiency` }
      : { verdict: 'attention', note: `${unattested.subject} has only a pending/dry-run fetch; any existing file is not usable for data sufficiency` }
  }

  const damagedProjection = statuses.find((s) => s.projectionIntact === false)
  if (damagedProjection) {
    return { verdict: 'attention', note: `${damagedProjection.subject} pool projection or provenance sidecar is missing or does not match canonical current data` }
  }

  const missing = statuses.find((s) => s.status === 'missing')
  if (missing) {
    return missing.health === 'never_run'
      ? { verdict: 'attention', note: `no file yet for ${missing.subject} — the fetcher has not swept this feed` }
      : { verdict: 'attention', note: `no file yet for ${missing.subject}` }
  }
  const stale = statuses.find((s) => s.status === 'stale')
  if (stale) return { verdict: 'attention', note: `${stale.subject} is past its expected release plus grace deadline` }

  const oldest = statuses.reduce((w, s) => ((s.ageDays ?? 0) > (w.ageDays ?? 0) ? s : w), statuses[0])
  const manual = statuses.every((s) => s.health === 'manual')
  return {
    verdict: 'live',
    note: manual
      ? `hand-staged by its own manifest; newest file is ${oldest.ageDays ?? 0} days old and inside its declared release window`
      : `fetching cleanly; newest file is ${oldest.ageDays ?? 0} days old and inside its declared release window`,
  }
}

let cache: { at: number; read: PipelinesRead } | null = null
const TTL_MS = 10_000

export function readPipelines(force = false): PipelinesRead {
  if (cache && !force && Date.now() - cache.at < TTL_MS) return cache.read
  const widened: string[] = []
  const discovery = discoverConnectors()
  const manifests = discovery.connectors
  widened.push(...discovery.widened)

  let poolAvailable = true
  try {
    fs.readdirSync(DATA_DIR)
  } catch {
    poolAvailable = false
  }

  // ONE ledger fold for the whole read (§2) — every pipeline × subject looks its fetch health up in this map.
  const feedHealth = readFeedHealth()
  const repairAutomationAvailable = connectorAutoRepairReady()
  let lastFetchSweepAt: string | null = null
  for (const h of feedHealth.values()) {
    if (h.lastSweepAt && (!lastFetchSweepAt || h.lastSweepAt > lastFetchSweepAt)) lastFetchSweepAt = h.lastSweepAt
  }

  const pipelines: PipelineEntry[] = []
  for (const manifest of manifests) {
    const p = fromRegistry(manifest)
    if (!p) continue
    const statuses = p.subjects.map((s) => subjectStatus(
      p, s, poolAvailable, widened, feedHealthOf(feedHealth, p.id, s),
      manifest.manifest_version === 2 ? connectorCurrentStatus(manifest, s) : undefined,
    ))
    const { verdict, note } = rollUpVerdict(statuses, p.releaseWindowDays, poolAvailable)
    const repair = latestRepairStatus(p.id)
    const repairs = Object.fromEntries(p.subjects.map((subject) => {
      const value = latestRepairStatusForSubject(p.id, subject)
      return [subject, { status: runtimeRepairStatus(value.status, repairAutomationAvailable), prUrl: value.pr_url }]
    }))
    const connectorWideRepair = repair.subject == null ? repair : null
    pipelines.push({
      ...p,
      helps: [],
      statuses,
      verdict,
      verdictNote: note,
      repair: connectorWideRepair
        ? { status: runtimeRepairStatus(connectorWideRepair.status, repairAutomationAvailable), prUrl: connectorWideRepair.pr_url }
        : { status: 'none', prUrl: null },
      repairs,
    })
  }

  const recommended: RecommendedNeed[] = []
  const healthyBySubject = new Map<string, Map<string, string>>()
  for (const swarm of listSwarms()) {
    let subjects: string[] = []
    try {
      subjects = swarmSubjects(swarm.id)
    } catch {
      continue // a swarm whose subjects cannot be listed contributes nothing (fail closed, never crashes the read)
    }
    for (const subject of subjects) {
      let read
      try {
        read = readDataNeeds(swarm.id, subject)
      } catch {
        continue
      }
      if (!read) continue
      widened.push(...read.widened)
      let healthy = healthyBySubject.get(read.subject)
      if (!healthy) {
        healthy = healthyBuiltBySatisfies(read.subject, { connectors: manifests, health: feedHealth })
        healthyBySubject.set(read.subject, healthy)
      }
      for (const need of read.needs) {
        if (need.filing_required) continue // advisory — no connector can satisfy a statutory-filing gap
        const covering = pipelines.filter(
          (p) => p.satisfies.includes(need.need_id) && p.subjects.includes(read.subject),
        )
        // `built_by` is an evidence assertion, not a display heuristic: the registry helper proves exact
        // ledger↔canonical identity, intact projection+sidecar, release eligibility, and provider agreement.
        const healthyConnectorId = healthy.get(need.need_id)
        const usable = healthyConnectorId ? covering.filter((p) => p.id === healthyConnectorId) : []
        if (usable.length) {
          for (const p of usable) {
            p.helps.push({
              swarm: swarm.id, subject: read.subject, need_id: need.need_id,
              series: need.series, why_it_caps: need.why_it_caps, entry_modules: need.entry_modules,
            })
          }
        }
        if (!usable.length) {
          recommended.push({
            key: `${swarm.id}/${read.subject}/${need.need_id}`,
            swarm: swarm.id, subject: read.subject, need_id: need.need_id,
            series: need.series, why_it_caps: need.why_it_caps, cap_lifted: need.cap_lifted,
            suggested_source: need.suggested_source, tier: need.tier, cadence: need.cadence,
            next_release: need.next_release, entry_modules: need.entry_modules,
            connector_exists: need.connector_exists ?? covering[0]?.id,
          })
        }
      }
    }
  }

  const fetcher = readConnectorFetchServiceStatus(poolAvailable)
  const read: PipelinesRead = {
    generatedAt: new Date().toISOString(),
    poolAvailable,
    pipelines,
    recommended,
    widened,
    runner: {
      watchdogOn: connectorRunnerReady(),
      autoRepairOn: repairAutomationAvailable,
      pollIntervalMin: CONNECTOR_RUNNER.pollIntervalMin,
      lastFetchSweepAt: fetcher.lastCompletedAt ?? lastFetchSweepAt,
      fetcher,
    },
  }
  cache = { at: Date.now(), read }
  return read
}
