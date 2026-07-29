// Connector registry — the single source of truth over `.claude/connectors/*/connector.json`. A connector
// is a durable data feed the pipeline builder authored (connector.json + fetch.py + test_fetch.py); this
// module discovers + fail-closed-validates every manifest so the cadence runner, the staleness watchdog, the
// health store, and the data-needs "feed built ✓" marker all read ONE parsed view. It launches nothing and
// writes nothing. A malformed manifest is dropped (never surfaced), never throws.
//   - `listConnectorDirs()` is the ONE place that walks the directory and parses each connector.json's raw
//     JSON — pipelines.ts (the cockpit's Data Library reader) consumes the same raw scan for its own,
//     stricter §4-tier-ceiling validation, instead of re-implementing the directory walk. Two callers, one
//     filesystem scan (CLAUDE.md §2 — no parallel discovery of the same manifests).

import fs from 'node:fs'
import path from 'node:path'
import { CONNECTORS_DIR } from './config'

export { CONNECTORS_DIR }

// The cadence enum a connector may declare, and how often the runner re-fetches it. `event_driven` has no
// fixed clock — it is fetched only manually or near a known release, so the runner treats it as manual-only.
export const CADENCE_MS: Record<string, number | null> = {
  realtime: 15 * 60_000, // a "realtime" feed is polled every 15 min (the runner is not a tick-by-tick streamer)
  twelve_hourly: 12 * 3600_000, // two windows a day — the company-news bridge's cadence
  daily: 24 * 3600_000,
  weekly: 7 * 24 * 3600_000,
  monthly: 30 * 24 * 3600_000,
  event_driven: null, // manual-only on the clock
}
const CADENCE = new Set(Object.keys(CADENCE_MS))
const ID_RE = /^[a-z0-9][a-z0-9_-]*$/

export interface ConnectorManifest {
  id: string
  dir: string // absolute path to .claude/connectors/<id>
  series: string
  satisfies: string[] // data_need id(s) / topical slugs this feed covers
  subjects: string[] // the pool subjects it feeds (e.g. ["WHEAT"])
  provider: string
  acquisition: string
  tier: number
  cadence: string // realtime | daily | weekly | monthly | event_driven
  staleness_sla_days: number | null
  entry: string // the fetcher, relative to dir (e.g. "fetch.py")
  verify: string // e.g. "fetch.py --verify"
  host_allowlist: string[]
  output_path: string
}

export function parseManifest(dir: string, raw: any): ConnectorManifest | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const id = String(raw.id ?? path.basename(dir))
  if (!ID_RE.test(id)) return null
  const cadence = String(raw.cadence ?? '')
  if (!CADENCE.has(cadence)) return null
  const entry = String(raw.entry ?? '')
  if (!entry || entry.includes('/') || entry.includes('..')) return null // a plain filename in the connector dir
  const subjects = Array.isArray(raw.subjects) ? raw.subjects.map(String).filter(Boolean) : []
  if (!subjects.length) return null
  const satisfies = Array.isArray(raw.satisfies) ? raw.satisfies.map(String).filter(Boolean) : []
  const host_allowlist = Array.isArray(raw.host_allowlist) ? raw.host_allowlist.map(String).filter(Boolean) : []
  const slaN = Number(raw.staleness_sla_days)
  const tierN = Number(raw.tier)
  return {
    id,
    dir,
    series: String(raw.series ?? ''),
    satisfies,
    subjects,
    provider: String(raw.provider ?? ''),
    acquisition: String(raw.acquisition ?? ''),
    tier: Number.isFinite(tierN) ? tierN : 0,
    cadence,
    staleness_sla_days: Number.isFinite(slaN) && slaN > 0 ? slaN : null,
    entry,
    verify: String(raw.verify ?? `${entry} --verify`),
    host_allowlist,
    output_path: String(raw.output_path ?? ''),
  }
}

export interface ConnectorDirEntry {
  id: string // the folder name under CONNECTORS_DIR
  dir: string // absolute path to that folder
  raw: any // JSON.parse of its connector.json, or null when the folder/file is unreadable / does not parse
  parseError?: string // set only when raw is null because of a read/parse failure (vs. a missing file)
}

/**
 * The ONE raw directory scan over `.claude/connectors/*<slash>*connector.json` — lists every subfolder,
 * reads its manifest, and parses the JSON. Does NOT validate the parsed shape (that is `parseManifest`'s
 * job, done differently by each caller's own strictness). Sorted by folder name for determinism. Never
 * throws: an unreadable dir yields [], an unreadable/unparsable connector.json yields a `parseError` entry
 * rather than being silently skipped, so a caller that wants to audit WHY a manifest was dropped can.
 */
export function listConnectorDirs(): ConnectorDirEntry[] {
  let names: string[]
  try { names = fs.readdirSync(CONNECTORS_DIR) } catch { return [] }
  const out: ConnectorDirEntry[] = []
  for (const name of names.sort()) {
    const dir = path.join(CONNECTORS_DIR, name)
    let stat: fs.Stats
    try { stat = fs.statSync(dir) } catch { continue }
    if (!stat.isDirectory()) continue
    try {
      out.push({ id: name, dir, raw: JSON.parse(fs.readFileSync(path.join(dir, 'connector.json'), 'utf8')) })
    } catch (e: any) {
      out.push({ id: name, dir, raw: null, parseError: e?.message || 'bad JSON' })
    }
  }
  return out
}

/** Every valid connector manifest on disk. [] when the dir is absent — never throws. */
export function listConnectors(): ConnectorManifest[] {
  const out: ConnectorManifest[] = []
  for (const { dir, raw } of listConnectorDirs()) {
    if (raw == null) continue
    const m = parseManifest(dir, raw)
    // require the fetcher to actually exist on disk (a manifest pointing at a missing entry is dead)
    if (m && fs.existsSync(path.join(dir, m.entry))) out.push(m)
  }
  return out
}

/** One connector by id, or null. */
export function getConnector(id: string): ConnectorManifest | null {
  return listConnectors().find((c) => c.id === id) ?? null
}

/** The clock interval for a cadence, or null when it has no fixed clock (event_driven / unknown). */
export function cadenceIntervalMs(cadence: string): number | null {
  return cadence in CADENCE_MS ? CADENCE_MS[cadence] : null
}

/** Map each satisfied data_need slug → the connector id that covers it (loop-close marker source). */
export function builtBySatisfies(connectors: ConnectorManifest[] = listConnectors()): Map<string, string> {
  const out = new Map<string, string>()
  for (const c of connectors) for (const s of c.satisfies) if (!out.has(s)) out.set(s, c.id)
  return out
}
