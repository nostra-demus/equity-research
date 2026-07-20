// Data-pipelines reader — the SERVER-side registry over `.claude/connectors/*/connector.json`, the
// self-describing durable-feed manifests (frameworks/EXTERNAL_DATA.md §7). It joins three existing truths
// into one read: (1) the discovered connector manifests, (2) live pool freshness computed from each
// manifest's own output_path filenames (as_of from FILENAMES, never mtime — fix F23), and (3) the runs'
// data_needs[] demand (readDataNeeds), so an unmet need surfaces as a recommended-to-add row and a met
// need attaches to its covering pipeline as `helps`. It launches nothing and writes nothing.
//   - Fail-closed discovery: a manifest with ANY defect is dropped whole and audited in `widened` —
//     the cockpit never renders a malformed pipeline card (same posture as readDataNeeds).
//   - Tier clamp mirror (§4): a fetcher's self-declared tier is UNTRUSTED — the served tier is clamped
//     DOWN to the ceiling its source_type earns, exactly like extract_pool.py clamps the pool sidecars.
//   - Honest degradation: a host without the Drive pool mount serves poolAvailable:false and status
//     'unknown' — never a fabricated 'missing'.
//   - Single directory scan (§2): the raw `.claude/connectors/*/connector.json` walk + JSON.parse lives in
//     ONE place, connector-registry.ts's listConnectorDirs() — this reader consumes that same raw scan and
//     layers its own stricter, UI-facing validation (tier ceiling, id/folder match, output_path shape) on
//     top, rather than re-walking the directory. The cadence runner / health store / data-needs "feed built"
//     marker read connector-registry.ts's OWN (more lenient, operational) parse of the same raw scan.
import fs from 'node:fs'
import path from 'node:path'
import { listConnectorDirs, type ConnectorDirEntry } from './connector-registry'
import { DATA_DIR, REPO_ROOT } from './config'
import { readDataNeeds } from './data-needs'
import { listSwarms } from './swarms'
import { swarmSubjects } from './roster'
import { TICKER_RE, isValidTicker } from './sandbox'

export interface PipelineSubjectStatus {
  subject: string
  status: 'fresh' | 'stale' | 'missing' | 'unknown'
  latestAsOf?: string
  ageDays?: number
  latestFile?: string
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
  stalenessSlaDays: number
  entry: string
  verify: string
  outputPath: string
  outputSchema?: unknown
  subjects: string[]
  satisfies: string[]
  helps: PipelineHelp[]
  statuses: PipelineSubjectStatus[]
}
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
}
export interface PipelinesRead {
  generatedAt: string
  poolAvailable: boolean
  pipelines: PipelineEntry[]
  recommended: RecommendedNeed[]
  widened: string[]
}

// Enums mirrored from the decision_record schema / connector convention — a manifest outside them is
// dropped at read time, never surfaced malformed.
const ACQUISITION = new Set(['official_api', 'free_key_api', 'paid_api', 'scrape', 'manual'])
const CADENCE = new Set(['realtime', 'daily', 'weekly', 'monthly', 'event_driven'])
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/
const SATISFIES_RE = /^[a-z0-9][a-z0-9_-]*$/

// EXTERNAL_DATA.md §4 tier ceilings by source_type — unknown/missing fails closed to 9. A sidecar may
// still self-declare a MORE conservative tier than its ceiling (e.g. a web-scrape connector under the
// external_other ceiling of 9 self-labelling as the even-more-conservative tier-10 "reputable web source,
// unverified" per CLAUDE.md §4) — the clamp below only ever pushes a tier DOWN to its ceiling, never up.
const TIER_CEILING: Record<string, number> = {
  alt_data_panel: 5, vendor_export: 5, paid_api: 5,
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
  stalenessSlaDays: number
  entry: string
  verify: string
  outputPath: string
  outputSchema?: unknown
  subjects: string[]
  satisfies: string[]
}

function parseManifest(entry: ConnectorDirEntry, widened: string[]): ParsedManifest | null {
  const folder = entry.id
  const drop = (why: string) => {
    widened.push(`dropped connector manifest ${folder}: ${why}`)
    return null
  }
  if (entry.parseError) return drop(`does not parse (${entry.parseError})`)
  const m = entry.raw
  if (!m || typeof m !== 'object' || Array.isArray(m)) return drop('not an object')
  const id = String(m.id ?? '')
  if (!SLUG_RE.test(id) || id !== folder) return drop(`id ${JSON.stringify(m.id)} is not a slug matching its folder`)
  const series = String(m.series ?? '').trim()
  const provider = String(m.provider ?? '').trim()
  if (!series || !provider) return drop('series/provider missing')
  const subjects = Array.isArray(m.subjects) ? m.subjects.map(String) : []
  if (!subjects.length || !subjects.every((s: string) => TICKER_RE.test(s) && isValidTicker(s))) {
    return drop('subjects must be a non-empty list of valid subject names')
  }
  const acquisition = String(m.acquisition ?? '')
  if (!ACQUISITION.has(acquisition)) return drop(`acquisition '${acquisition}' outside the schema enum`)
  const cadence = String(m.cadence ?? '')
  if (!CADENCE.has(cadence)) return drop(`cadence '${cadence}' outside the schema enum`)
  const sla = Number(m.staleness_sla_days)
  if (!Number.isFinite(sla) || sla <= 0) return drop(`staleness_sla_days ${m.staleness_sla_days} must be > 0`)
  const outputPath = String(m.output_path ?? '')
  const basename = path.posix.basename(outputPath)
  if (!outputPath.startsWith('data/<SUBJECT>/external/')
      || basename.split('<as_of>').length !== 2
      || path.posix.dirname(outputPath).includes('<as_of>')
      || outputPath.split('/').includes('..')) {
    return drop(`output_path ${JSON.stringify(outputPath)} must be data/<SUBJECT>/external/... with one <as_of> in its basename`)
  }
  const satisfiesRaw = m.satisfies ?? []
  if (!Array.isArray(satisfiesRaw) || !satisfiesRaw.every((s: any) => typeof s === 'string' && SATISFIES_RE.test(s))) {
    return drop('satisfies must be a list of need-id slugs')
  }
  const sourceType = String(m.source_type ?? '')
  const ceiling = TIER_CEILING[sourceType] ?? 9
  const declared = Number(m.tier)
  const tier = Number.isFinite(declared) ? Math.max(declared, ceiling) : ceiling
  const tierCorrected = Number.isFinite(declared) && declared < ceiling ? true : undefined
  return {
    id, series, provider, acquisition, sourceType, tier, tierCorrected,
    license: m.license ? String(m.license) : undefined,
    hostAllowlist: Array.isArray(m.host_allowlist) ? m.host_allowlist.map(String) : [],
    cadence, stalenessSlaDays: sla,
    entry: String(m.entry ?? 'fetch.py'),
    verify: String(m.verify ?? ''),
    outputPath,
    outputSchema: m.output_schema,
    subjects, satisfies: satisfiesRaw as string[],
  }
}

function subjectStatus(p: ParsedManifest, subject: string, poolAvailable: boolean, widened: string[]): PipelineSubjectStatus {
  if (!poolAvailable) return { subject, status: 'unknown' }
  const rel = p.outputPath.replaceAll('<SUBJECT>', subject)
  const dirAbs = path.resolve(REPO_ROOT, path.dirname(rel))
  if (dirAbs !== DATA_DIR && !dirAbs.startsWith(DATA_DIR + path.sep)) {
    widened.push(`${p.id}: output dir for ${subject} escapes the pool — status unknown`)
    return { subject, status: 'unknown' }
  }
  const [pre, post] = path.posix.basename(rel).split('<as_of>')
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp('^' + esc(pre) + '(\\d{4}-\\d{2}-\\d{2})' + esc(post) + '$')
  let names: string[] = []
  try {
    names = fs.readdirSync(dirAbs)
  } catch {
    return { subject, status: 'missing' }
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
  if (!latest) return { subject, status: 'missing' }
  const ageDays = Math.floor((Date.now() - Date.parse(latest)) / 86_400_000)
  return {
    subject,
    status: ageDays <= p.stalenessSlaDays ? 'fresh' : 'stale',
    latestAsOf: latest,
    ageDays,
    latestFile,
  }
}

let cache: { at: number; read: PipelinesRead } | null = null
const TTL_MS = 10_000

export function readPipelines(force = false): PipelinesRead {
  if (cache && !force && Date.now() - cache.at < TTL_MS) return cache.read
  const widened: string[] = []

  let poolAvailable = true
  try {
    fs.readdirSync(DATA_DIR)
  } catch {
    poolAvailable = false
  }

  const pipelines: PipelineEntry[] = []
  for (const entry of listConnectorDirs()) {
    const p = parseManifest(entry, widened)
    if (!p) continue
    pipelines.push({
      ...p,
      helps: [],
      statuses: p.subjects.map((s) => subjectStatus(p, s, poolAvailable, widened)),
    })
  }

  const recommended: RecommendedNeed[] = []
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
      for (const need of read.needs) {
        if (need.filing_required) continue // advisory — no connector can satisfy a statutory-filing gap
        const covering = pipelines.filter(
          (p) => p.satisfies.includes(need.need_id) && p.subjects.includes(read.subject),
        )
        if (covering.length) {
          for (const p of covering) {
            p.helps.push({
              swarm: swarm.id, subject: read.subject, need_id: need.need_id,
              series: need.series, why_it_caps: need.why_it_caps, entry_modules: need.entry_modules,
            })
          }
        } else {
          recommended.push({
            key: `${swarm.id}/${read.subject}/${need.need_id}`,
            swarm: swarm.id, subject: read.subject, need_id: need.need_id,
            series: need.series, why_it_caps: need.why_it_caps, cap_lifted: need.cap_lifted,
            suggested_source: need.suggested_source, tier: need.tier, cadence: need.cadence,
            next_release: need.next_release, entry_modules: need.entry_modules,
          })
        }
      }
    }
  }

  const read: PipelinesRead = {
    generatedAt: new Date().toISOString(),
    poolAvailable,
    pipelines,
    recommended,
    widened,
  }
  cache = { at: Date.now(), read }
  return read
}
