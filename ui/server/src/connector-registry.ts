// Connector registry — the single fail-closed view over `.claude/connectors/*/connector.json` used by the
// cadence runner, health/readiness gates, and Data Library. It launches and writes nothing. Directory
// discovery and raw JSON parsing live in `listConnectorDirs()`; strict v2 shape/semantic validation lives
// in `parseManifest()`; ambiguous provider coverage is removed by `honestCoverage()`.

import fs from 'node:fs'
import type { BigIntStats, Stats } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { TextDecoder } from 'node:util'
import { CONNECTORS_DIR, DATA_DIR } from './config'
import { canonicalJsonText } from './canonical-json'
import { feedHealthOf, readFeedHealth, type FeedHealth } from './feed-health'
import { safeConnectorSourceUrl } from './connector-url-policy'

export { CONNECTORS_DIR }

// The cadence enum a connector may declare, and its nominal interval for display. `event_driven` has no
// predictable source period; the runner automatically rechecks it from the last accepted retrieval using
// the manifest's grace_days. Manual acquisition is a separate manifest contract.
export const CADENCE_MS: Record<string, number | null> = {
  twelve_hourly: 12 * 3600_000, // two windows a day — the company-news bridge's cadence
  daily: 24 * 3600_000,
  weekly: 7 * 24 * 3600_000,
  monthly: 30 * 24 * 3600_000,
  quarterly: 90 * 24 * 3600_000,
  semiannual: 180 * 24 * 3600_000,
  annual: 365 * 24 * 3600_000,
  event_driven: null, // no fixed source-period interval
}
const CADENCE = new Set(Object.keys(CADENCE_MS))
const ID_RE = /^[a-z0-9][a-z0-9_-]*$/
const STABLE_ID_RE = /^[a-z0-9][a-z0-9._-]*$/
// V1 parsing retains its historical mixed-case grammar for read compatibility. Production v2 admission
// separately requires the one canonical pool spelling: ASCII uppercase.
const SUBJECT_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const ENV_RE = /^CONNECTOR_[A-Z0-9_]+$/
const OUTPUT_PATH_RE = /^data\/<SUBJECT>\/external\/(?:[a-z0-9][a-z0-9._-]*\/)*[a-z0-9][a-z0-9._-]*<as_of>[a-z0-9._-]*\.json$/
const PUBLIC_DNS_RE = /^(?=.{1,253}$)(?=.*[A-Za-z])(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/
const BUNDLE_COMPONENT_RE = /^[A-Za-z0-9._-]+$/
const TIER_CEILING: Record<string, number> = {
  alt_data_panel: 5, vendor_export: 5, paid_api: 5, official_data: 5,
  broker_research: 7, expert_call: 9, channel_check: 9, management_meeting: 9, external_other: 9,
}

interface CanonicalSchema {
  required: string[]
  properties?: Record<string, any>
  [key: string]: any
}
function canonicalSchema(): CanonicalSchema | null {
  try {
    const p = path.resolve(CONNECTORS_DIR, '..', '..', 'frameworks', 'connector.schema.json')
    const s = JSON.parse(fs.readFileSync(p, 'utf8'))
    return s && Array.isArray(s.required) ? s as CanonicalSchema : null
  } catch { return null }
}

/** Dependency-free enforcement of every JSON-Schema keyword currently used by connector.schema.json. */
export function canonicalSchemaMatches(value: any, schema: any): boolean {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return true
  if ('const' in schema && value !== schema.const) return false
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) return false
  if (Array.isArray(schema.allOf) && schema.allOf.some((part: any) => !canonicalSchemaMatches(value, part))) return false
  if (schema.if && typeof schema.if === 'object') {
    const condition = canonicalSchemaMatches(value, schema.if)
    if (condition && schema.then && !canonicalSchemaMatches(value, schema.then)) return false
    if (!condition && schema.else && !canonicalSchemaMatches(value, schema.else)) return false
  }
  const kind = schema.type
  if (kind === 'object' && (!value || typeof value !== 'object' || Array.isArray(value))) return false
  if (kind === 'array' && !Array.isArray(value)) return false
  if (kind === 'string' && typeof value !== 'string') return false
  if (kind === 'integer' && (!Number.isInteger(value) || typeof value === 'boolean')) return false
  if (kind === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) return false
  if (typeof value === 'string') {
    if (value.length < Number(schema.minLength ?? 0)) return false
    if (typeof schema.pattern === 'string') {
      try { if (!new RegExp(schema.pattern).test(value)) return false } catch { return false }
    }
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (schema.minimum != null && value < Number(schema.minimum)) return false
    if (schema.exclusiveMinimum != null && value <= Number(schema.exclusiveMinimum)) return false
  }
  if (Array.isArray(value)) {
    if (value.length < Number(schema.minItems ?? 0)) return false
    if (schema.uniqueItems) {
      const identities = value.map(canonicalJson)
      if (identities.some((identity) => identity == null) || new Set(identities).size !== value.length) return false
    }
    if (schema.items && value.some((item) => !canonicalSchemaMatches(item, schema.items))) return false
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (Array.isArray(schema.required) && schema.required.some((key: unknown) =>
      typeof key !== 'string' || !Object.prototype.hasOwnProperty.call(value, key))) return false
    if (schema.propertyNames && Object.keys(value).some((key) => !canonicalSchemaMatches(key, schema.propertyNames))) return false
    const properties = schema.properties && typeof schema.properties === 'object' && !Array.isArray(schema.properties)
      ? schema.properties : {}
    for (const [key, child] of Object.entries(value)) {
      if (key in properties) {
        if (!canonicalSchemaMatches(child, properties[key])) return false
      } else if (schema.additionalProperties === false) return false
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object'
          && !canonicalSchemaMatches(child, schema.additionalProperties)) return false
    }
  }
  return true
}

function outputSchemaAtPath(schema: any, dottedPath: string): any | undefined {
  let current = schema
  for (const part of dottedPath.split('.')) {
    if (!current || typeof current !== 'object' || Array.isArray(current)
        || !Object.prototype.hasOwnProperty.call(current, part)) return undefined
    current = current[part]
  }
  return current
}

function canonicalOutputPath(value: unknown): value is string {
  if (typeof value !== 'string' || !OUTPUT_PATH_RE.test(value) || value.includes('\\') || value.includes('%')) return false
  if (path.posix.normalize(value) !== value) return false
  return value.split('/').every((part) => part !== '' && part !== '.' && part !== '..')
}

export interface ConnectorManifest {
  manifest_version: 1 | 2
  schema_version: number
  id: string
  dir: string // absolute path to .claude/connectors/<id>
  dataset_id: string
  series_id: string
  series: string
  satisfies: string[] // data_need id(s) / topical slugs this feed covers
  subjects: string[] // the pool subjects it feeds (e.g. ["WHEAT"])
  provider: string
  authority_class: string
  provider_priority: number
  acquisition: string
  source_type: string
  tier: number
  license: string
  licensing: {
    access: 'public' | 'licensed' | 'restricted' | 'unknown'
    use: 'allowed' | 'entitlement_required' | 'unavailable'
    redistribution: 'allowed' | 'derived_only' | 'prohibited' | 'unknown'
    terms_url: string
  }
  cadence: string // twelve_hourly | daily | weekly | monthly | quarterly | semiannual | annual | event_driven
  staleness_sla_days: number | null
  entry: string // the fetcher, relative to dir (e.g. "fetch.py")
  verify: string // e.g. "fetch.py --verify"
  host_allowlist: string[]
  output_path: string
  output_schema: unknown
  units: Record<string, string>
  credential_env: string[]
  manual: boolean
  manual_ingest: { file_arg: string } | null
  release: {
    cadence: string
    timezone: string
    expected_lag_days: number
    grace_days: number
    active_months?: number[]
    revision_policy: 'revisable' | 'append_only'
  }
  minimum_history: { observations: number; path?: string }
  fallback_for: string | null
}

function schemaUnitPaths(schema: any, prefix = ''): { numeric: Set<string>; open: Set<string> } {
  const numeric = new Set<string>(); const open = new Set<string>()
  if (typeof schema === 'string') {
    const token = schema.trim().split(' ', 1)[0].replace(/\|null$/, '')
    if (token === 'int' || token === 'float') numeric.add(prefix)
    else if (token === 'object') open.add(prefix)
  } else if (Array.isArray(schema) && schema.length === 1) {
    const child = schemaUnitPaths(schema[0], `${prefix}[]`)
    child.numeric.forEach((p) => numeric.add(p)); child.open.forEach((p) => open.add(p))
  } else if (schema && typeof schema === 'object') {
    for (const [key, value] of Object.entries(schema)) {
      const child = schemaUnitPaths(value, prefix ? `${prefix}.${key}` : key)
      child.numeric.forEach((p) => numeric.add(p)); child.open.forEach((p) => open.add(p))
    }
  } else if (typeof schema === 'number' && Number.isFinite(schema)) numeric.add(prefix)
  return { numeric, open }
}

function validUnitContract(outputSchema: any, units: any): units is Record<string, string> {
  if (!units || typeof units !== 'object' || Array.isArray(units)) return false
  if (!Object.entries(units).every(([key, value]) => key.length > 0 && typeof value === 'string' && value.trim())) return false
  const paths = schemaUnitPaths(outputSchema)
  const allowed = new Set([...paths.numeric, ...[...paths.open].filter(Boolean).map((p) => `${p}.*`)])
  const declared = new Set(Object.keys(units))
  return [...paths.numeric].every((p) => declared.has(p)) && [...declared].every((p) => allowed.has(p))
}

/** Validate the repository's compact output-schema notation before a connector can be discovered. */
function validSchemaContract(schema: any): boolean {
  if (typeof schema === 'string') {
    let token = schema.trim().split(' ', 1)[0]
    if (!token) return false
    if (token.endsWith('|null')) token = token.slice(0, -5)
    if (token.startsWith('enum:')) {
      const options = token.slice(5).split('|')
      return options.length > 0 && options.every(Boolean) && new Set(options).size === options.length
    }
    return new Set(['string', 'date', 'datetime', 'YYYY-MM', 'int', 'float', 'bool', 'object']).has(token)
  }
  if (Array.isArray(schema)) return schema.length === 1 && validSchemaContract(schema[0])
  if (schema && typeof schema === 'object') {
    return Object.entries(schema).every(([key, child]) => key.length > 0 && validSchemaContract(child))
  }
  if (schema == null || typeof schema === 'boolean') return true
  return typeof schema === 'number' && Number.isFinite(schema)
}

/**
 * Licensing terms are frozen manifest identity, so validate the exact raw spelling and retain it unchanged.
 * The shared connector URL boundary supplies the origin, credential-query, IP, and public-DNS checks, but it
 * intentionally normalizes ordinary source URLs (including trimming and fragment removal). Those conveniences
 * are forbidden here: a manifest must fail rather than silently acquire a different terms URL identity.
 */
function validLicensingTermsUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || !raw || raw.trim() !== raw || raw.length > 2_000
      || [...raw].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f)) return false
  try {
    const parsed = new URL(raw)
    if (parsed.hash) return false

    // WHATWG URL parsing normalizes percent-escaped/Unicode host spellings. Python's publisher validates the
    // raw hostname instead, so bind the admitted hostname back to the exact authority text before using the
    // shared normalized boundary. Empty userinfo/ports are tolerated only to match urllib.parse; any non-empty
    // credential or a non-443 port is rejected by safeConnectorSourceUrl below.
    const rest = raw.slice('https://'.length)
    const authorityEnd = rest.search(/[/?#]/)
    const authority = authorityEnd < 0 ? rest : rest.slice(0, authorityEnd)
    const hostPort = authority.slice(authority.lastIndexOf('@') + 1)
    const colon = hostPort.lastIndexOf(':')
    const rawHost = colon < 0 ? hostPort : hostPort.slice(0, colon)
    if (!raw.startsWith('https://') || !PUBLIC_DNS_RE.test(rawHost)) return false

    const safe = safeConnectorSourceUrl(raw)
    return safe != null && safe.host === rawHost.toLowerCase()
  } catch { return false }
}

function canonicalJson(value: unknown): string | null {
  try { return canonicalJsonText(value) } catch { return null }
}

function canonicalJsonEqual(left: unknown, right: unknown): boolean {
  const leftText = canonicalJson(left); const rightText = canonicalJson(right)
  return leftText != null && rightText != null && leftText === rightText
}

/** Byte-for-byte match for run_connectors.py's shared publication-contract fingerprint. */
export function publisherContractFingerprint(repoRoot: string = path.resolve(CONNECTORS_DIR, '..', '..')): string {
  const listRel = 'frameworks/connector-publisher-files.json'
  const listPath = path.resolve(repoRoot, listRel)
  try {
    const listed = JSON.parse(fs.readFileSync(listPath, 'utf8'))
    const paths = listed?.paths
    if (!Array.isArray(paths) || !paths.length || new Set(paths).size !== paths.length
        || paths.some((rel: unknown) => typeof rel !== 'string' || !rel
          || path.isAbsolute(rel) || rel.split('/').includes('..'))) return ''
    const hash = createHash('sha256')
    for (const rel of [listRel, ...paths]) {
      const file = path.resolve(repoRoot, ...rel.split('/'))
      const stat = fs.lstatSync(file)
      if (!stat.isFile() || stat.isSymbolicLink()) return ''
      hash.update(rel, 'utf8'); hash.update('\0'); hash.update(fs.readFileSync(file)); hash.update('\0')
    }
    return hash.digest('hex')
  } catch { return '' }
}

export function parseManifest(dir: string, raw: any): ConnectorManifest | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const rawVersion = raw.manifest_version == null ? 1 : raw.manifest_version
  if (!Number.isInteger(rawVersion) || (rawVersion !== 1 && rawVersion !== 2)) return null
  const manifestVersion = rawVersion as 1 | 2
  const id = manifestVersion === 2
    ? (typeof raw.id === 'string' ? raw.id : '')
    : String(raw.id ?? path.basename(dir))
  if (!ID_RE.test(id)) return null
  const schemaVersion = manifestVersion === 2 ? raw.schema_version : Number(raw.schema_version ?? 1)
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) return null
  const schema = canonicalSchema()
  // A missing/malformed canonical schema disables v2 discovery fail closed;
  // legacy manifests remain readable during migration.
  if (manifestVersion === 2 && (!schema || !canonicalSchemaMatches(raw, schema))) return null
  // A v2 manifest becomes part of immutable publisher identity. Reject values the cross-runtime byte
  // contract cannot represent before discovery rather than waiting for the first publication/read.
  if (manifestVersion === 2 && canonicalJson(raw) == null) return null
  if (manifestVersion === 2) {
    for (const key of ['manual', 'manual_ingest', 'fallback_for']) {
      if (Object.prototype.hasOwnProperty.call(raw, key) && raw[key] === null) return null
    }
    const strings = ['id', 'dataset_id', 'series_id', 'series', 'provider', 'authority_class', 'acquisition',
      'source_type', 'license', 'entry', 'verify', 'output_path']
    if (strings.some((key) => typeof raw[key] !== 'string')) return null
    if (!Number.isInteger(raw.provider_priority) || !Number.isInteger(raw.tier)) return null
    if (!Array.isArray(raw.subjects) || !raw.subjects.every((v: unknown) => typeof v === 'string')
        || !Array.isArray(raw.satisfies) || !raw.satisfies.every((v: unknown) => typeof v === 'string')
        || !Array.isArray(raw.host_allowlist) || !raw.host_allowlist.every((v: unknown) => typeof v === 'string')
        || !Array.isArray(raw.credential_env) || !raw.credential_env.every((v: unknown) => typeof v === 'string')) return null
    if (!raw.release || typeof raw.release !== 'object' || Array.isArray(raw.release)
        || typeof raw.release.cadence !== 'string' || typeof raw.release.timezone !== 'string'
        || typeof raw.release.revision_policy !== 'string'
        || ['expected_lag_days', 'grace_days'].some((key) =>
          typeof raw.release[key] !== 'number' || !Number.isFinite(raw.release[key]))) return null
    if (!raw.minimum_history || typeof raw.minimum_history !== 'object' || Array.isArray(raw.minimum_history)
        || !Number.isInteger(raw.minimum_history.observations)
        || Object.keys(raw.minimum_history).some((key) => key !== 'observations' && key !== 'path')) return null
    if (raw.minimum_history.path != null && (typeof raw.minimum_history.path !== 'string'
        || !raw.minimum_history.path || raw.minimum_history.path.split('.').some((part: string) => !part))) return null
    if (raw.manual != null && typeof raw.manual !== 'boolean') return null
    if (raw.fallback_for != null && typeof raw.fallback_for !== 'string') return null
  }
  const datasetId = String(raw.dataset_id ?? `legacy.${id}`)
  const seriesId = String(raw.series_id ?? `legacy.${id}`)
  if (!STABLE_ID_RE.test(datasetId) || !STABLE_ID_RE.test(seriesId)) return null
  const releaseRaw = raw.release && typeof raw.release === 'object' && !Array.isArray(raw.release) ? raw.release : {}
  const cadence = String(releaseRaw.cadence ?? raw.cadence ?? (manifestVersion === 1 ? 'daily' : ''))
  if (!CADENCE.has(cadence)) return null
  const entry = String(raw.entry ?? '')
  if (!entry || entry.includes('/') || entry.includes('..')) return null // a plain filename in the connector dir
  // V2 arrays are already type-checked above. Preserve every raw element so an empty/invalid declaration
  // fails below instead of being silently filtered into a different manifest. Legacy v1 keeps its old
  // coercing compatibility path.
  const subjects: string[] = Array.isArray(raw.subjects)
    ? (manifestVersion === 2 ? raw.subjects.slice() : raw.subjects.map(String).filter(Boolean)) : []
  if (!subjects.length || new Set(subjects).size !== subjects.length
      || subjects.some((s: string) => !SUBJECT_RE.test(s) || s.includes('..'))) return null
  if (manifestVersion === 2 && (subjects.some((subject) => subject !== subject.toUpperCase())
      || new Set(subjects.map((subject) => subject.toLowerCase())).size !== subjects.length)) return null
  const satisfies: string[] = Array.isArray(raw.satisfies) ? raw.satisfies.map(String).filter(Boolean) : []
  const host_allowlist: string[] = Array.isArray(raw.host_allowlist)
    ? (manifestVersion === 2 ? raw.host_allowlist.slice() : raw.host_allowlist.map(String).filter(Boolean)) : []
  const credentialEnv: string[] = Array.isArray(raw.credential_env) ? raw.credential_env.map(String) : []
  const slaN = manifestVersion === 1 ? Number(raw.staleness_sla_days) : NaN
  const tierN = Number(raw.tier)
  const priorityN = Number(raw.provider_priority ?? 100)
  const lagN = Number(releaseRaw.expected_lag_days ?? 0)
  const graceN = Number(releaseRaw.grace_days ?? slaN)
  const activeMonths = releaseRaw.active_months
  const timezone = String(releaseRaw.timezone ?? 'UTC')
  const revisionPolicy = String(releaseRaw.revision_policy ?? 'revisable')
  const minimumRaw = raw.minimum_history && typeof raw.minimum_history === 'object' && !Array.isArray(raw.minimum_history) ? raw.minimum_history : {}
  const minimumN = Number(minimumRaw.observations ?? 1)
  const authorityValues = new Set(schema?.properties?.authority_class?.enum ?? ['other'])
  const acquisitionValues = new Set(schema?.properties?.acquisition?.enum ?? [])
  const sourceTypeValues = new Set(schema?.properties?.source_type?.enum ?? [])
  const authorityClass = String(raw.authority_class ?? 'other')
  const licensingRaw = raw.licensing
  if (manifestVersion === 2 && !authorityValues.has(authorityClass)) return null
  if (manifestVersion === 2 && !acquisitionValues.has(String(raw.acquisition ?? ''))) return null
  if (manifestVersion === 2 && (sourceTypeValues.size !== Object.keys(TIER_CEILING).length
      || Object.keys(TIER_CEILING).some((value) => !sourceTypeValues.has(value))
      || !sourceTypeValues.has(String(raw.source_type ?? '')))) return null
  if (!Number.isInteger(priorityN) || priorityN < 1) return null
  if (manifestVersion === 2 && (tierN < (TIER_CEILING[raw.source_type] ?? 9) || tierN > 10)) return null
  const validSla = Number.isFinite(slaN) && slaN > 0
  if (manifestVersion === 1 && !validSla) return null
  if (!Number.isFinite(lagN) || lagN < 0 || !Number.isFinite(graceN) || graceN < 0) return null
  if (activeMonths != null && (
    !new Set(['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual']).has(cadence)
    || !Array.isArray(activeMonths) || activeMonths.length === 0
    || activeMonths.some((month: unknown) => !Number.isInteger(month) || typeof month === 'boolean'
      || Number(month) < 1 || Number(month) > 12)
    || activeMonths.some((month: number, index: number) => index > 0 && activeMonths[index - 1] >= month)
  )) return null
  // Event-driven releases have no predictable release interval to which a lag could be added. Their
  // bounded recheck window is expressed solely by grace_days (§7.1); accepting a lag here would create
  // a second, inconsistent freshness clock in TypeScript.
  if (manifestVersion === 2 && cadence === 'event_driven' && lagN !== 0) return null
  if (!timezone || (revisionPolicy !== 'revisable' && revisionPolicy !== 'append_only')) return null
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date(0)) } catch { return null }
  if (!Number.isInteger(minimumN) || minimumN < 1) return null
  if (minimumRaw.path != null && (typeof minimumRaw.path !== 'string' || !minimumRaw.path)) return null
  if (manifestVersion === 2 && minimumN > 1) {
    if (typeof minimumRaw.path !== 'string' || !minimumRaw.path
        || !Array.isArray(outputSchemaAtPath(raw.output_schema, minimumRaw.path))) return null
  }
  if (manifestVersion === 2) {
    if (!String(raw.series ?? '').trim() || !String(raw.provider ?? '').trim() || !String(raw.license ?? '').trim()) return null
    if (!String(raw.source_type ?? '').trim() || !Number.isFinite(Number(raw.tier))
        || raw.entry !== 'fetch.py' || raw.verify !== 'fetch.py --verify') return null
    if (!Array.isArray(raw.satisfies) || satisfies.length !== raw.satisfies.length || new Set(satisfies).size !== satisfies.length || satisfies.some((s) => !STABLE_ID_RE.test(s))) return null
    if (!host_allowlist.length || host_allowlist.length !== new Set(host_allowlist).size
        || host_allowlist.some((h) => !h || h.trim() !== h || h.includes('://') || h.includes('/') || h.includes('@')
          || h.toLowerCase() === 'localhost' || h.toLowerCase().endsWith('.localhost')
          || h.toLowerCase().endsWith('.local') || isIP(h) !== 0
          || !PUBLIC_DNS_RE.test(h))) return null
    if (credentialEnv.length !== new Set(credentialEnv).size || credentialEnv.some((name) => !ENV_RE.test(name))) return null
    if (!licensingRaw || typeof licensingRaw !== 'object' || Array.isArray(licensingRaw)
        || Object.keys(licensingRaw).sort().join(',') !== ['access', 'redistribution', 'terms_url', 'use'].sort().join(',')) return null
    const access = new Set(['public', 'licensed', 'restricted', 'unknown'])
    const use = new Set(['allowed', 'entitlement_required', 'unavailable'])
    const redistribution = new Set(['allowed', 'derived_only', 'prohibited', 'unknown'])
    if (!access.has(licensingRaw.access) || !use.has(licensingRaw.use)
        || !redistribution.has(licensingRaw.redistribution) || typeof licensingRaw.terms_url !== 'string'
        || licensingRaw.terms_url.trim() !== licensingRaw.terms_url) return null
    if (!validLicensingTermsUrl(licensingRaw.terms_url)) return null
    if (licensingRaw.use === 'unavailable' || (licensingRaw.access === 'unknown' && raw.manual !== true)
        || (licensingRaw.use === 'entitlement_required' && credentialEnv.length === 0 && raw.manual !== true)) return null
    const unitPathPattern = schema?.properties?.units?.propertyNames?.pattern
    let unitPathRe: RegExp | null = null
    try { unitPathRe = typeof unitPathPattern === 'string' ? new RegExp(unitPathPattern) : null } catch { return null }
    if (!unitPathRe || Object.keys(raw.units ?? {}).some((key) => !unitPathRe!.test(key))
        || !validSchemaContract(raw.output_schema) || !validUnitContract(raw.output_schema, raw.units)) return null
    const releaseKeys = Object.keys(releaseRaw).sort().join(',')
    const allowedReleaseKeys = ['cadence', 'expected_lag_days', 'grace_days', 'revision_policy', 'timezone',
      ...(activeMonths == null ? [] : ['active_months'])].sort().join(',')
    if (releaseKeys !== allowedReleaseKeys) return null
    const outputPath = String(raw.output_path ?? '')
    const basename = path.posix.basename(outputPath)
    if (!canonicalOutputPath(outputPath) || outputPath.split('<SUBJECT>').length !== 2
        || outputPath.split('<as_of>').length !== 2 || !basename.includes('<as_of>') || !basename.endsWith('.json')
        || outputPath.split('/').includes('..')) return null
    if (raw.manual === true) {
      const ingest = raw.manual_ingest
      if (!ingest || typeof ingest !== 'object' || Array.isArray(ingest) || Object.keys(ingest).length !== 1
          || !/^--[a-z0-9-]+$/.test(String(ingest.file_arg ?? ''))) return null
    }
    if ((raw.manual === true) !== (String(raw.acquisition) === 'manual')) return null
    if (raw.manual_ingest != null && raw.manual !== true) return null
  }
  const fallbackFor = raw.fallback_for == null ? null : String(raw.fallback_for)
  if (fallbackFor != null && (!ID_RE.test(fallbackFor) || fallbackFor === id)) return null
  return {
    manifest_version: manifestVersion,
    schema_version: schemaVersion,
    id,
    dir,
    dataset_id: datasetId,
    series_id: seriesId,
    series: String(raw.series ?? id),
    satisfies,
    subjects,
    provider: String(raw.provider ?? 'legacy'),
    authority_class: authorityClass,
    provider_priority: priorityN,
    acquisition: String(raw.acquisition ?? 'manual'),
    source_type: String(raw.source_type ?? 'external_other'),
    tier: Number.isFinite(tierN) ? tierN : 0,
    license: String(raw.license ?? 'unspecified'),
    licensing: manifestVersion === 2 ? licensingRaw : {
      access: 'unknown', use: 'unavailable', redistribution: 'unknown', terms_url: '',
    },
    cadence,
    staleness_sla_days: manifestVersion === 1 && validSla ? slaN : null,
    entry,
    verify: String(raw.verify ?? `${entry} --verify`),
    host_allowlist,
    output_path: String(raw.output_path ?? ''),
    output_schema: raw.output_schema ?? {},
    units: raw.units && typeof raw.units === 'object' && !Array.isArray(raw.units) ? raw.units : {},
    credential_env: credentialEnv,
    manual: raw.manual === true,
    manual_ingest: raw.manual_ingest && typeof raw.manual_ingest === 'object'
      ? { file_arg: String(raw.manual_ingest.file_arg ?? '') } : null,
    release: {
      cadence, timezone, expected_lag_days: lagN, grace_days: graceN,
      ...(activeMonths == null ? {} : { active_months: activeMonths.slice() }),
      revision_policy: revisionPolicy as 'revisable' | 'append_only',
    },
    minimum_history: { observations: minimumN, ...(minimumRaw.path ? { path: minimumRaw.path } : {}) },
    fallback_for: fallbackFor,
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
    try { stat = fs.lstatSync(dir) } catch { continue }
    if (stat.isSymbolicLink()) {
      out.push({ id: name, dir, raw: null, parseError: 'unsafe symlinked connector directory' })
      continue
    }
    if (!stat.isDirectory()) continue
    try {
      out.push({ id: name, dir, raw: JSON.parse(fs.readFileSync(path.join(dir, 'connector.json'), 'utf8')) })
    } catch (e: any) {
      out.push({ id: name, dir, raw: null, parseError: e?.message || 'bad JSON' })
    }
  }
  return out
}

export interface ConnectorDiscovery {
  connectors: ConnectorManifest[]
  widened: string[]
}

/**
 * Discover every valid connector and retain an audit row for every directory that was dropped.  Callers
 * which render operator state use this form; compatibility callers may use listConnectors().
 */
export function discoverConnectors(): ConnectorDiscovery {
  const parsed: ConnectorManifest[] = []
  const widened: string[] = []
  for (const { id: folder, dir, raw, parseError } of listConnectorDirs()) {
    if (raw == null) {
      widened.push(`dropped connector manifest ${folder}: ${String(parseError || 'unreadable connector.json').slice(0, 240)}`)
      continue
    }
    const m = parseManifest(dir, raw)
    if (!m) {
      widened.push(`dropped connector manifest ${folder}: invalid connector contract`)
      continue
    }
    // parseManifest keeps v1 readable for historical tooling, but the production registry is v2-only. A
    // filename plus legacy health can never close a current required need.
    if (m.manifest_version !== 2) {
      widened.push(`dropped connector manifest ${folder}: production registry requires manifest_version 2`)
      continue
    }
    if (m.id !== folder) {
      widened.push(`dropped connector manifest ${folder}: manifest id ${m.id} does not match its directory`)
      continue
    }
    // A connector is executable only when its complete transform tree is reproducibly fingerprintable.
    if (!fs.existsSync(path.join(dir, m.entry)) || !connectorFingerprint(dir)) {
      widened.push(`dropped connector manifest ${folder}: missing entry or unsafe connector file tree`)
      continue
    }
    parsed.push(m)
  }
  const connectors = honestCoverage(parsed)
  const admitted = new Set(connectors.map((connector) => connector.id))
  for (const connector of parsed) if (!admitted.has(connector.id)) {
    widened.push(`dropped connector manifest ${connector.id}: ambiguous series, fallback, or projection ownership`)
  }
  return { connectors, widened }
}

/** Every valid connector manifest on disk. [] when the dir is absent — never throws. */
export function listConnectors(): ConnectorManifest[] {
  return discoverConnectors().connectors
}

/** Fail closed on ambiguous subject+series ownership; explicit fallbacks are the only admitted overlap. */
export function honestCoverage(connectors: ConnectorManifest[]): ConnectorManifest[] {
  const bad = new Set<string>()
  for (const connector of connectors) if (connector.manifest_version !== 2) bad.add(connector.id)
  const byId = new Map(connectors.map((c) => [c.id, c]))
  // Credential names are process-environment capabilities, not harmless labels. A name shared by two
  // connectors could send one provider's value to another connector's different host. Require one manifest
  // owner; an operator who intentionally reuses a token declares two provider-scoped names with equal values.
  const credentialOwners = new Map<string, ConnectorManifest[]>()
  for (const connector of connectors) for (const name of connector.credential_env) {
    credentialOwners.set(name, [...(credentialOwners.get(name) ?? []), connector])
  }
  for (const owners of credentialOwners.values()) if (owners.length > 1) {
    for (const owner of owners) bad.add(owner.id)
  }
  // Subject names become directories and immutable identity fields. Fail every owner of a case alias,
  // including unchecked callers which bypass parseManifest, rather than relying on host filesystem rules.
  const subjectSpellings = new Map<string, { spelling: string; owner: ConnectorManifest }[]>()
  for (const connector of connectors) for (const subject of connector.subjects) {
    const key = subject.toLowerCase()
    subjectSpellings.set(key, [...(subjectSpellings.get(key) ?? []), { spelling: subject, owner: connector }])
    if (subject !== subject.toUpperCase()) bad.add(connector.id)
  }
  for (const entries of subjectSpellings.values()) {
    if (new Set(entries.map((entry) => entry.spelling)).size > 1) {
      for (const entry of entries) bad.add(entry.owner.id)
    }
  }
  const groups = new Map<string, ConnectorManifest[]>()
  for (const c of connectors) for (const subject of c.subjects) {
    const key = `${subject.toLowerCase()}::${c.series_id}`
    groups.set(key, [...(groups.get(key) ?? []), c])
  }
  for (const members of groups.values()) {
    const primaries = members.filter((m) => !m.fallback_for)
    if (primaries.length !== 1) { for (const m of members) bad.add(m.id); continue }
    const primary = primaries[0]
    const byPriority = new Map<number, ConnectorManifest[]>()
    for (const m of members) byPriority.set(m.provider_priority, [...(byPriority.get(m.provider_priority) ?? []), m])
    for (const peers of byPriority.values()) if (peers.length > 1) for (const peer of peers) bad.add(peer.id)
    for (const m of members) {
      if (m === primary) continue
      if (m.fallback_for !== primary.id || m.provider === primary.provider || m.dataset_id === primary.dataset_id) bad.add(m.id)
      if (m.provider_priority <= primary.provider_priority) bad.add(m.id)
      if (m.series !== primary.series || !canonicalJsonEqual(m.output_schema, primary.output_schema)
          || !canonicalJsonEqual(m.units, primary.units)
          || !canonicalJsonEqual(m.minimum_history, primary.minimum_history)) bad.add(m.id)
    }
  }
  for (const c of connectors) {
    if (!c.fallback_for) continue
    const p = byId.get(c.fallback_for)
    const primarySubjects = new Set((p?.subjects ?? []).map((subject) => subject.toLowerCase()))
    if (!p || p.series_id !== c.series_id
        || c.subjects.some((subject) => !primarySubjects.has(subject.toLowerCase()))) bad.add(c.id)
  }
  const projections = new Map<string, ConnectorManifest[]>()
  const currentIdentities = new Map<string, ConnectorManifest[]>()
  for (const c of connectors) for (const subject of c.subjects) {
    const projected = c.output_path.replaceAll('<SUBJECT>', subject)
    const projectionKey = path.posix.normalize(projected).toLowerCase()
    projections.set(projectionKey, [...(projections.get(projectionKey) ?? []), c])
    const currentKey = path.posix.normalize(
      `_connectors/current/${c.dataset_id}/${c.series_id}/${subject}.json`,
    ).toLowerCase()
    currentIdentities.set(currentKey, [...(currentIdentities.get(currentKey) ?? []), c])
  }
  for (const owners of projections.values()) if (owners.length > 1) {
    for (const owner of owners) bad.add(owner.id)
  }
  for (const owners of currentIdentities.values()) if (owners.length > 1) {
    for (const owner of owners) bad.add(owner.id)
  }
  // A connector can be invalidated by one of several coverage rows.  Cascade
  // that invalidity to every fallback which names it, including rows whose
  // local group looked valid before the primary was rejected elsewhere.
  let changed = true
  while (changed) {
    changed = false
    for (const c of connectors) if (c.fallback_for && bad.has(c.fallback_for) && !bad.has(c.id)) {
      bad.add(c.id); changed = true
    }
  }
  return connectors.filter((c) => !bad.has(c.id))
}

export interface ConnectorCoverage {
  connector_id: string
  dataset_id: string
  series_id: string
  subject: string
  provider: string
  provider_priority: number
  fallback_for: string | null
}

/** Honest, series-qualified coverage rows; no provider-blind subject claims. */
export function connectorCoverage(connectors: ConnectorManifest[] = listConnectors()): ConnectorCoverage[] {
  return connectors.flatMap((c) => c.subjects.map((subject) => ({
    connector_id: c.id, dataset_id: c.dataset_id, series_id: c.series_id, subject,
    provider: c.provider, provider_priority: c.provider_priority, fallback_for: c.fallback_for,
  })))
}

/** One connector by id, or null. */
export function getConnector(id: string): ConnectorManifest | null {
  return listConnectors().find((c) => c.id === id) ?? null
}

/** The clock interval for a cadence, or null when it has no fixed clock (event_driven / unknown). */
export function cadenceIntervalMs(cadence: string): number | null {
  return cadence in CADENCE_MS ? CADENCE_MS[cadence] : null
}

/** Byte-for-byte match for run_connectors.py's recursively sealed deployed transform fingerprint. */
export function connectorFingerprint(dir: string): string {
  const hash = createHash('sha256')
  const files: { rel: string; abs: string }[] = []
  try {
    if (fs.lstatSync(dir).isSymbolicLink() || !fs.lstatSync(dir).isDirectory()) return ''
    const walk = (absDir: string, relDir: string): boolean => {
      const names = fs.readdirSync(absDir).sort()
      for (const name of names) {
        // The relative pathname is hashed bytes, not display metadata. Restrict every file/directory
        // component to one ASCII grammar so Python code-point ordering and JavaScript UTF-16 ordering can
        // never disagree on an otherwise legal Unicode tree.
        if (!BUNDLE_COMPONENT_RE.test(name) || name === '.' || name === '..') return false
        const abs = path.join(absDir, name)
        const rel = relDir ? `${relDir}/${name}` : name
        const stat = fs.lstatSync(abs)
        if (stat.isSymbolicLink()) return false
        if (stat.isDirectory()) {
          if (name === '__pycache__') continue
          if (!walk(abs, rel)) return false
        } else if (stat.isFile()) {
          files.push({ rel, abs })
        } else {
          return false
        }
      }
      return true
    }
    if (!walk(dir, '')) return ''
  } catch { return '' }
  for (const file of files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))) {
    try {
      hash.update(file.rel, 'utf8'); hash.update('\0'); hash.update(fs.readFileSync(file.abs)); hash.update('\0')
    } catch { return '' }
  }
  return hash.digest('hex')
}

/** Map each satisfied data_need slug → the connector id that covers it (loop-close marker source). */
export function builtBySatisfies(connectors: ConnectorManifest[] = listConnectors()): Map<string, string> {
  const out = new Map<string, string>()
  for (const c of connectors) if (c.manifest_version === 2) {
    for (const s of c.satisfies) if (!out.has(s)) out.set(s, c.id)
  }
  return out
}

type PoolEntryKind = 'file' | 'directory'

/**
 * Resolve one canonical POSIX-relative pool entry without following any alias below the configured root.
 * `dataDir` itself may be a symlink to the mounted pool; that is the single allowed alias boundary. Every
 * descendant component must exist under its exact stored spelling, must not be a symlink, and the leaf must
 * be a regular file/directory of the requested kind.
 */
function safePoolEntry(dataDir: string, relative: string, kind: PoolEntryKind): string | null {
  try {
    if (!relative || path.posix.isAbsolute(relative) || relative.includes('\\')
        || path.posix.normalize(relative) !== relative) return null
    const components = relative.split('/')
    if (!components.length || components.some((component) => !component || component === '.' || component === '..')) return null

    const root = fs.realpathSync(path.resolve(dataDir))
    if (!fs.statSync(root).isDirectory()) return null
    let cursor = root
    for (let index = 0; index < components.length; index++) {
      const component = components[index]
      // On a case-insensitive filesystem lstat("gold") can open a stored "GOLD". Requiring the exact
      // directory entry preserves the canonical lexical identity independently of host behavior.
      if (!fs.readdirSync(cursor).includes(component)) return null
      const next = path.join(cursor, component)
      const stat = fs.lstatSync(next)
      if (stat.isSymbolicLink()) return null
      const last = index === components.length - 1
      if ((!last && !stat.isDirectory())
          || (last && kind === 'file' && !stat.isFile())
          || (last && kind === 'file' && stat.nlink !== 1)
          || (last && kind === 'directory' && !stat.isDirectory())) return null
      if (fs.realpathSync(next) !== next) return null
      cursor = next
    }
    return cursor
  } catch { return null }
}

const safePoolFile = (dataDir: string, relative: string) => safePoolEntry(dataDir, relative, 'file')
const safePoolDirectory = (dataDir: string, relative: string) => safePoolEntry(dataDir, relative, 'directory')

/** Open an already-resolved canonical leaf without following a last-moment symlink replacement.
 *
 * The stability identity deliberately EXCLUDES ctime. `dataDir` is normally a symlink to a Google
 * Drive for Desktop mount, and Drive (like macOS' own `com.apple.lastuseddate#PS`) writes extended
 * attributes onto pool files independently of their content. An xattr write bumps ctime and nothing
 * else, so comparing it rejected files whose bytes never moved — the defect that turned a whole
 * 87-file evidence pool into "changed during read" failures (see the stable-read note in
 * .claude/tools/extract_pool.py).
 *
 * A content write always bumps mtime, so mtime + size + (dev, ino, nlink) still catch every real
 * change. Stats are taken with `bigint: true` so the comparison uses NANOSECOND mtime rather than
 * the float-millisecond `mtimeMs` — strictly finer than what it replaces.
 *
 * When ctime moved we do not simply shrug: we re-read the same pinned descriptor from offset 0 and
 * compare the bytes. Equal bytes prove a metadata-only touch; anything else fails closed. That
 * catches a same-length rewrite landing after the read, which is otherwise invisible once ctime is
 * out of the identity.
 *
 * KNOWN RESIDUAL: a same-uid writer who rewrites same-length bytes DURING the read and then
 * restores mtime to the nanosecond with utimensat is no longer detectable here — ctime was the only
 * stamp that could not be rolled back, and it is exactly the stamp Drive makes unusable. Everything
 * else PR #407 named still fails closed (hard-link, symlink, partial write, inode swap,
 * differing-length or mtime-moving rewrite). Content-addressed reads are additionally bound by
 * their sha256 in jsonFileWithBytes/canonicalCurrent, which is the real defence for those.
 *
 * Transient cloud-filesystem errors are retried: Drive hydrating a streamed placeholder raises
 * ETIMEDOUT on a file that is perfectly readable, and swallowing that as `null` made a satisfied
 * connector read as not-current.
 */
const TRANSIENT_FS_ERRNOS = new Set([
  'ETIMEDOUT', 'EIO', 'EINTR', 'EAGAIN', 'EBUSY', 'ENOENT', 'ESTALE', 'ENXIO', 'EDEADLK',
  'ENOTCONN', 'EHOSTDOWN',
])
const STABLE_READ_ATTEMPTS = Math.max(1, Number(process.env.ENGINE_STABLE_READ_ATTEMPTS) || 4)

function readRegularFileNoFollowOnce(file: string): { bytes: Buffer | null; transient: boolean } {
  let descriptor: number | null = null
  try {
    const before = fs.lstatSync(file, { bigint: true })
    if (before.isSymbolicLink() || !before.isFile() || before.nlink !== 1n) return { bytes: null, transient: false }
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW)
    const opened = fs.fstatSync(descriptor, { bigint: true })
    const sameStableIdentity = (candidate: BigIntStats) => candidate.isFile() && candidate.nlink === 1n
      && candidate.dev === opened.dev && candidate.ino === opened.ino && candidate.size === opened.size
      && candidate.mtimeNs === opened.mtimeNs
    if (!sameStableIdentity(before) || !sameStableIdentity(opened)) return { bytes: null, transient: true }
    const bytes = fs.readFileSync(descriptor)
    const afterOpen = fs.fstatSync(descriptor, { bigint: true })
    const afterPath = fs.lstatSync(file, { bigint: true })
    if (!sameStableIdentity(afterOpen) || !sameStableIdentity(afterPath)) return { bytes: null, transient: true }
    if (afterOpen.ctimeNs !== opened.ctimeNs || afterPath.ctimeNs !== opened.ctimeNs) {
      // ctime moved but content identity held: prove the bytes rather than trusting the clock.
      const again = Buffer.allocUnsafe(bytes.length)
      let filled = 0
      while (filled < again.length) {
        const n = fs.readSync(descriptor, again, filled, again.length - filled, filled)
        if (n <= 0) return { bytes: null, transient: true }
        filled += n
      }
      if (!bytes.equals(again)) return { bytes: null, transient: true }
    }
    return { bytes, transient: false }
  } catch (e: any) {
    return { bytes: null, transient: TRANSIENT_FS_ERRNOS.has(String(e?.code || '')) }
  } finally { if (descriptor != null) try { fs.closeSync(descriptor) } catch { /* already failed closed */ } }
}

// Retries are immediate and un-delayed ON PURPOSE: this reader is synchronous and runs on the
// Fastify event loop, so a blocking sleep between attempts would freeze every other request —
// strictly worse than the failure it would paper over. Immediate retries fully cover the identity
// race (a Drive sync touch is over in microseconds) and partially cover hydration, since the first
// read is what triggers the download. A placeholder still cold after 4 attempts falls back to the
// original `null`, which is the pre-existing behaviour rather than a new regression.
function readRegularFileNoFollow(file: string): Buffer | null {
  for (let attempt = 0; attempt < STABLE_READ_ATTEMPTS; attempt++) {
    const { bytes, transient } = readRegularFileNoFollowOnce(file)
    if (bytes != null) return bytes
    if (!transient) return null
  }
  return null
}

function digestBytes(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function jsonFileWithBytes(file: string): { value: any; bytes: Buffer } | null {
  const bytes = readRegularFileNoFollow(file)
  if (!bytes) return null
  try {
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    const canonical = canonicalJson(value)
    if (canonical == null || !Buffer.from(`${canonical}\n`, 'utf8').equals(bytes)) return null
    return { value, bytes }
  } catch { return null }
}

const PREFIX_INVALID = -1
const PREFIX_INCOMPLETE = 0
const PREFIX_COMPLETE = 1
type PrefixResult = [status: number, end: number]
type StringPrefixResult = [status: number, end: number, value: string | null]

function prefixString(text: string, start: number): StringPrefixResult {
  let index = start + 1
  while (index < text.length) {
    const char = text[index]
    if (char === '"') {
      try {
        const value = JSON.parse(text.slice(start, index + 1))
        return [PREFIX_COMPLETE, index + 1, typeof value === 'string' ? value : null]
      } catch { return [PREFIX_INVALID, index, null] }
    }
    if (char === '\\') {
      index++
      if (index >= text.length) return [PREFIX_INCOMPLETE, index, null]
      const escape = text[index]
      if (escape === 'u') {
        const available = text.slice(index + 1, index + 5)
        if ([...available].some((unit) => !/[0-9a-fA-F]/.test(unit))) return [PREFIX_INVALID, index, null]
        if (available.length < 4) return [PREFIX_INCOMPLETE, text.length, null]
        index += 4
      } else if (!'"\\/bfnrt'.includes(escape)) return [PREFIX_INVALID, index, null]
    } else if (char.charCodeAt(0) < 0x20) return [PREFIX_INVALID, index, null]
    index++
  }
  return [PREFIX_INCOMPLETE, index, null]
}

function prefixNumber(text: string, start: number): PrefixResult {
  let index = start
  if (text[index] === '-') {
    index++
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
  }
  if (index >= text.length || !/\d/.test(text[index])) return [PREFIX_INVALID, index]
  if (text[index] === '0') {
    index++
    if (index < text.length && /\d/.test(text[index])) return [PREFIX_INVALID, index]
  } else while (index < text.length && /\d/.test(text[index])) index++
  if (index < text.length && text[index] === '.') {
    index++
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
    if (!/\d/.test(text[index])) return [PREFIX_INVALID, index]
    while (index < text.length && /\d/.test(text[index])) index++
  }
  if (index < text.length && (text[index] === 'e' || text[index] === 'E')) {
    index++
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
    if (text[index] === '+' || text[index] === '-') {
      index++
      if (index === text.length) return [PREFIX_INCOMPLETE, index]
    }
    if (!/\d/.test(text[index])) return [PREFIX_INVALID, index]
    while (index < text.length && /\d/.test(text[index])) index++
  }
  return [PREFIX_COMPLETE, index]
}

function prefixValue(text: string, index: number): PrefixResult {
  if (index >= text.length) return [PREFIX_INCOMPLETE, index]
  const char = text[index]
  if (char === '"') {
    const [status, end] = prefixString(text, index)
    return [status, end]
  }
  if (char === '{') return prefixObject(text, index)
  if (char === '[') return prefixArray(text, index)
  for (const literal of ['true', 'false', 'null']) {
    const remaining = text.slice(index)
    if (text.startsWith(literal, index)) return [PREFIX_COMPLETE, index + literal.length]
    if (literal.startsWith(remaining)) return [PREFIX_INCOMPLETE, text.length]
  }
  return char === '-' || /\d/.test(char) ? prefixNumber(text, index) : [PREFIX_INVALID, index]
}

function prefixArray(text: string, start: number): PrefixResult {
  let index = start + 1
  if (index === text.length) return [PREFIX_INCOMPLETE, index]
  if (text[index] === ']') return [PREFIX_COMPLETE, index + 1]
  while (true) {
    const parsed = prefixValue(text, index); index = parsed[1]
    if (parsed[0] !== PREFIX_COMPLETE) return parsed
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
    if (text[index] === ']') return [PREFIX_COMPLETE, index + 1]
    if (text[index] !== ',') return [PREFIX_INVALID, index]
    index++
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
  }
}

function prefixObject(text: string, start: number): PrefixResult {
  let index = start + 1
  if (index === text.length) return [PREFIX_INCOMPLETE, index]
  if (text[index] === '}') return [PREFIX_COMPLETE, index + 1]
  let priorKey: string | null = null
  while (true) {
    if (text[index] !== '"') return [PREFIX_INVALID, index]
    const parsedKey = prefixString(text, index); index = parsedKey[1]
    if (parsedKey[0] !== PREFIX_COMPLETE) return [parsedKey[0], index]
    const key = parsedKey[2]
    if (key == null || (priorKey != null && key <= priorKey)) return [PREFIX_INVALID, index]
    priorKey = key
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
    if (text[index] !== ':') return [PREFIX_INVALID, index]
    const parsedValue = prefixValue(text, index + 1); index = parsedValue[1]
    if (parsedValue[0] !== PREFIX_COMPLETE) return parsedValue
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
    if (text[index] === '}') return [PREFIX_COMPLETE, index + 1]
    if (text[index] !== ',') return [PREFIX_INVALID, index]
    index++
    if (index === text.length) return [PREFIX_INCOMPLETE, index]
  }
}

/** Match Python's narrowly admitted interrupted O_EXCL artifact, never a complete or arbitrary file. */
function canonicalJsonObjectStrictPrefix(file: string): boolean {
  const bytes = readRegularFileNoFollow(file)
  if (!bytes || bytes.length > 16 * 1024 * 1024) return false
  let text: string
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch { return false }
  if (!text.startsWith('{')) return false
  try {
    const parsed = JSON.parse(text)
    const canonical = canonicalJson(parsed)
    if (canonical != null) {
      const expected = Buffer.from(`${canonical}\n`, 'utf8')
      if (bytes.length < expected.length && expected.subarray(0, bytes.length).equals(bytes)) return true
    }
  } catch { /* incomplete JSON continues through the strict prefix grammar */ }
  const [status, end] = prefixObject(text, 0)
  return status === PREFIX_INCOMPLETE && end === text.length
}

function localWallMs(epochMs: number, timezone: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(epochMs))
    const get = (kind: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === kind)?.value)
    const values = [get('year'), get('month'), get('day'), get('hour'), get('minute'), get('second')]
    return values.every(Number.isFinite) ? Date.UTC(values[0], values[1] - 1, values[2], values[3], values[4], values[5]) : null
  } catch { return null }
}

const CALENDAR_CADENCE_MONTHS: Record<string, number> = {
  monthly: 1, quarterly: 3, semiannual: 6, annual: 12,
}

function advanceCalendarPeriod(observedMs: number, cadence: string): number | null {
  const months = CALENDAR_CADENCE_MONTHS[cadence]
  if (months != null) {
    const observed = new Date(observedMs)
    const monthIndex = observed.getUTCFullYear() * 12 + observed.getUTCMonth() + months
    const year = Math.floor(monthIndex / 12)
    const month = monthIndex % 12
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    return Date.UTC(year, month, Math.min(observed.getUTCDate(), lastDay))
  }
  if (cadence === 'weekly') return observedMs + 7 * 86_400_000
  if (cadence === 'daily') return observedMs + 86_400_000
  return null
}

interface CalendarDateParts { year: number; month: number; day: number }

function exactCalendarDate(value: unknown): CalendarDateParts | null {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12) return null
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= days[month - 1] ? { year, month, day } : null
}

function exactUtcDatetime(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/.exec(value)
  if (!match || !exactCalendarDate(match[1])) return false
  const hour = Number(match[2]); const minute = Number(match[3]); const second = Number(match[4])
  return hour <= 23 && minute <= 59 && second <= 59 && Number.isFinite(Date.parse(value))
}

function calendarDateMs(parts: CalendarDateParts): number {
  const date = new Date(0)
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day)
  date.setUTCHours(0, 0, 0, 0)
  return date.getTime()
}

function releaseEligibleAt(current: any, nowMs: number): boolean {
  const release = current?.release
  if (!release || typeof release !== 'object' || typeof current?.as_of !== 'string') return false
  if (!Number.isFinite(nowMs) || !exactUtcDatetime(current?.retrieved_at)) return false
  const retrievedMs = Date.parse(current.retrieved_at)
  // Eligibility is an interval, not only an expiry ceiling: evidence cannot
  // be usable before the instant at which the engine actually retrieved it.
  if (!Number.isFinite(retrievedMs) || retrievedMs > nowMs) return false
  const observedParts = exactCalendarDate(current.as_of)
  const nowWall = localWallMs(nowMs, release.timezone)
  if (!observedParts || nowWall == null) return false
  const observed = calendarDateMs(observedParts)
  let nextPeriod: number
  const calendarPeriod = advanceCalendarPeriod(observed, release.cadence)
  if (calendarPeriod != null) nextPeriod = calendarPeriod
  else {
    const retrievedWall = localWallMs(retrievedMs, release.timezone)
    if (retrievedWall == null) return false
    if (release.cadence === 'twelve_hourly') nextPeriod = retrievedWall + 12 * 3600_000
    else if (release.cadence === 'event_driven') {
      return nowWall <= retrievedWall + Number(release.grace_days) * 86_400_000
    } else return false
  }
  const through = nextPeriod + (Number(release.expected_lag_days) + Number(release.grace_days)) * 86_400_000
  return Number.isFinite(through) && nowWall <= through
}

function jsonFile(file: string): any | null {
  return jsonFileWithBytes(file)?.value ?? null
}

function exactKeys(value: any, keys: string[]): boolean {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).sort().join(',') === [...keys].sort().join(',')
}

interface LinkedHead { sequence: number; path: string; metadata_sha256: string; chain_sha256: string }

function validLinkedHead(value: any): value is LinkedHead {
  return exactKeys(value, ['sequence', 'path', 'metadata_sha256', 'chain_sha256'])
    && Number.isInteger(value.sequence) && value.sequence >= 1 && typeof value.path === 'string'
    && /^[0-9a-f]{64}$/.test(value.metadata_sha256) && /^[0-9a-f]{64}$/.test(value.chain_sha256)
}

function linkedChainSha256(head: Omit<LinkedHead, 'chain_sha256'>, priorHead: LinkedHead | null): string {
  const material = {
    sequence: head.sequence, vintage_path: head.path,
    vintage_metadata_sha256: head.metadata_sha256, prior_head: priorHead,
  }
  const canonical = canonicalJson(material)
  return canonical == null ? '' : createHash('sha256').update(canonical + '\n').digest('hex')
}

function vintageId(vintage: any): string {
  const identity = { ...vintage }
  delete identity.vintage_id
  if (identity.provenance && typeof identity.provenance === 'object' && !Array.isArray(identity.provenance)) {
    identity.provenance = { ...identity.provenance }
    delete identity.provenance.vintage_id
  }
  const canonical = canonicalJson(identity)
  return canonical == null ? '' : `sha256:${createHash('sha256').update(canonical + '\n').digest('hex')}`
}

function validVintageIdentity(vintage: any, c: ConnectorManifest, subject: string): boolean {
  if (!vintage || vintage.connector_id !== c.id || vintage.dataset_id !== c.dataset_id) return false
  if (vintage.series_id !== c.series_id || vintage.subject !== subject || vintage.provider !== c.provider
      || !Number.isInteger(vintage.provider_priority) || vintage.provider_priority < 1
      || vintage.provider_priority !== c.provider_priority
      || !exactCalendarDate(vintage.as_of) || !exactUtcDatetime(vintage.retrieved_at)
      || vintage.manifest_version !== 2 || !Number.isInteger(vintage.schema_version)
      || vintage.schema_version < 1 || vintage.schema_version !== c.schema_version
      || vintage.series !== c.series || vintage.authority_class !== c.authority_class
      || vintage.fallback_for !== c.fallback_for || vintage.acquisition !== c.acquisition
      || vintage.source_type !== c.source_type || !Number.isInteger(vintage.tier) || vintage.tier !== c.tier
      || vintage.license !== c.license || !canonicalJsonEqual(vintage.licensing, c.licensing)
      || !canonicalJsonEqual(vintage.release, c.release) || !canonicalJsonEqual(vintage.output_schema, c.output_schema)
      || !canonicalJsonEqual(vintage.units, c.units) || !canonicalJsonEqual(vintage.minimum_history, c.minimum_history)
      || !/^[0-9a-f]{64}$/.test(vintage.content_sha256)
      || vintage.blob_path !== path.posix.join(
        '_connectors', 'blobs', 'sha256', vintage.content_sha256.slice(0, 2), `${vintage.content_sha256}.json`,
      )
      || !/^[0-9a-f]{64}$/.test(vintage.connector_fingerprint)
      || !/^[0-9a-f]{64}$/.test(vintage.publisher_contract_fingerprint)
      || typeof vintage.connector_commit !== 'string' || !vintage.connector_commit
      || !/^sha256:[0-9a-f]{64}$/.test(vintage.vintage_id)
      || !vintage.provenance || typeof vintage.provenance !== 'object' || Array.isArray(vintage.provenance)
      || vintage.provenance.vintage_id !== vintage.vintage_id
      || vintage.provenance.revision_of !== vintage.revision_of
      || (vintage.revision_of != null && !/^sha256:[0-9a-f]{64}$/.test(vintage.revision_of))) return false
  const provenanceIdentity = [
    'connector_id', 'dataset_id', 'series_id', 'series', 'subject', 'provider', 'as_of', 'retrieved_at',
    'provider_priority', 'fallback_for', 'acquisition', 'authority_class', 'source_type', 'tier', 'license',
    'licensing', 'content_sha256', 'connector_fingerprint', 'publisher_contract_fingerprint',
    'connector_commit', 'manifest_version', 'schema_version',
  ]
  if (provenanceIdentity.some((key) => !Object.prototype.hasOwnProperty.call(vintage.provenance, key)
      || !canonicalJsonEqual(vintage.provenance[key], vintage[key]))
      || !Object.prototype.hasOwnProperty.call(vintage.provenance, 'revision_of')) return false
  const provenanceSourceUrl = vintage.provenance.source_url
    || (Array.isArray(vintage.provenance.source_urls) && vintage.provenance.source_urls.length
      ? vintage.provenance.source_urls[0] : null)
  const provenancePublishedAt = vintage.provenance.published_at || vintage.provenance.published || null
  if ((vintage.source_url ?? null) !== provenanceSourceUrl
      || (vintage.published_at ?? null) !== provenancePublishedAt) return false
  if (vintage.acquisition === 'manual') {
    const manual = vintage.manual_input
    if (!exactKeys(manual, ['sha256', 'size_bytes', 'filename', 'detected_format'])
        || !/^[0-9a-f]{64}$/.test(manual.sha256) || !Number.isInteger(manual.size_bytes) || manual.size_bytes <= 0
        || typeof manual.filename !== 'string' || !manual.filename || path.basename(manual.filename) !== manual.filename
        || typeof manual.detected_format !== 'string' || !manual.detected_format
        || !canonicalJsonEqual(vintage.provenance.manual_input, manual)
        || vintage.provenance.acquired_via !== 'manual_local_file') return false
  } else if (Object.prototype.hasOwnProperty.call(vintage.provenance, 'manual_input')
      || Object.prototype.hasOwnProperty.call(vintage.provenance, 'acquired_via')) return false
  return vintageId(vintage) === vintage.vintage_id
}

function loadLinkedHead(
  c: ConnectorManifest, subject: string, dataDir: string, head: LinkedHead,
): { vintage: any; priorHead: LinkedHead | null } | null {
  if (!validLinkedHead(head)) return null
  const expectedDirRelative = path.posix.join('_connectors', 'vintages', c.dataset_id, c.series_id, subject)
  if (path.posix.dirname(head.path) !== expectedDirRelative) return null
  const expectedDir = safePoolDirectory(dataDir, expectedDirRelative)
  const vintagePath = safePoolFile(dataDir, head.path)
  if (!expectedDir || !vintagePath || path.dirname(vintagePath) !== expectedDir) return null
  const parsedVintage = jsonFileWithBytes(vintagePath)
  if (!parsedVintage || digestBytes(parsedVintage.bytes) !== head.metadata_sha256) return null
  const vintage = parsedVintage.value
  if (!validVintageIdentity(vintage, c, subject)) return null
  const receiptRelative = path.posix.join(
    '_connectors', 'commits', c.dataset_id, c.series_id, subject, `${head.metadata_sha256}.json`,
  )
  const receiptPath = safePoolFile(dataDir, receiptRelative)
  const receipt = receiptPath ? jsonFile(receiptPath) : null
  const receiptKeys = ['commit_protocol_version', 'connector_id', 'dataset_id', 'series_id', 'subject', 'sequence',
    'vintage_id', 'vintage_path', 'vintage_metadata_sha256', 'content_sha256', 'retrieved_at', 'prior_head', 'chain_sha256']
  if (!exactKeys(receipt, receiptKeys) || receipt.commit_protocol_version !== 1 || receipt.connector_id !== c.id
      || receipt.dataset_id !== c.dataset_id || receipt.series_id !== c.series_id || receipt.subject !== subject
      || receipt.sequence !== head.sequence || receipt.vintage_path !== head.path
      || receipt.vintage_id !== vintage.vintage_id
      || receipt.vintage_metadata_sha256 !== head.metadata_sha256
      || receipt.content_sha256 !== vintage.content_sha256 || receipt.retrieved_at !== vintage.retrieved_at
      || receipt.chain_sha256 !== head.chain_sha256) return null
  const priorHead = receipt.prior_head
  if ((head.sequence === 1 && priorHead !== null)
      || (head.sequence > 1 && (!validLinkedHead(priorHead) || priorHead.sequence !== head.sequence - 1))) return null
  if (linkedChainSha256(head, priorHead) !== head.chain_sha256) return null
  return { vintage, priorHead }
}

function markerRelative(c: ConnectorManifest, subject: string, sequence: number): string {
  return path.posix.join('_connectors', 'committed_heads', c.dataset_id, c.series_id, subject,
    `${String(sequence).padStart(20, '0')}.json`)
}

function markerMatches(c: ConnectorManifest, subject: string, marker: any, head: LinkedHead): boolean {
  return exactKeys(marker, ['commit_protocol_version', 'connector_id', 'dataset_id', 'series_id', 'subject', 'committed_head'])
    && marker.commit_protocol_version === 1 && marker.connector_id === c.id && marker.dataset_id === c.dataset_id
    && marker.series_id === c.series_id && marker.subject === subject
    && canonicalJsonEqual(marker.committed_head, head)
}

interface LaneFile { name: string; realPath: string }

/** Inventory one immutable lane without following symlinks or opening file contents. */
function regularLaneFiles(dataDir: string, directoryRelative: string): LaneFile[] | null {
  try {
    const realDirectory = safePoolDirectory(dataDir, directoryRelative)
    if (!realDirectory) return null

    const seen = new Set<string>()
    const files: LaneFile[] = []
    for (const entry of fs.readdirSync(realDirectory, { withFileTypes: true })) {
      if (seen.has(entry.name) || entry.isSymbolicLink() || !entry.isFile()) return null
      seen.add(entry.name)
      if (entry.name.endsWith('.tmp')) continue
      const realPath = safePoolFile(dataDir, path.posix.join(directoryRelative, entry.name))
      if (!realPath) return null
      files.push({ name: entry.name, realPath })
    }
    return files.sort((a, b) => a.name.localeCompare(b.name))
  } catch { return null }
}

/** Require every and only the immutable marker name claimed by the current count. */
function markerInventoryConsistent(
  c: ConnectorManifest, subject: string, dataDir: string, count: number,
): boolean {
  if (!Number.isInteger(count) || count < 1) return false
  const directoryRelative = path.posix.dirname(markerRelative(c, subject, 1))
  const files = regularLaneFiles(dataDir, directoryRelative)
  if (!files || files.length !== count) return false
  const names = new Set(files.map((file) => file.name))
  for (let sequence = 1; sequence <= count; sequence++) {
    if (!names.has(`${String(sequence).padStart(20, '0')}.json`)) return false
  }
  return true
}

function committedHeadBoundaryConsistent(
  c: ConnectorManifest, subject: string, dataDir: string, head: LinkedHead,
): boolean {
  const own = markerRelative(c, subject, head.sequence)
  if (!markerInventoryConsistent(c, subject, dataDir, head.sequence)) return false
  const safeOwn = safePoolFile(dataDir, own)
  return !!safeOwn && markerMatches(c, subject, jsonFile(safeOwn), head)
}

function headFromReceipt(receipt: any): LinkedHead | null {
  const head = {
    sequence: receipt?.sequence,
    path: receipt?.vintage_path,
    metadata_sha256: receipt?.vintage_metadata_sha256,
    chain_sha256: receipt?.chain_sha256,
  }
  return validLinkedHead(head) ? head : null
}

/** Reject rollback when a later receipt survives, while allowing unclaimed forensic vintages. */
function sealedLaneInventoryConsistent(
  c: ConnectorManifest, subject: string, dataDir: string, count: number, head: LinkedHead,
): boolean {
  if (!Number.isInteger(count) || count < 1) return false
  const vintageDirectory = path.posix.join('_connectors', 'vintages', c.dataset_id, c.series_id, subject)
  const receiptDirectory = path.posix.join('_connectors', 'commits', c.dataset_id, c.series_id, subject)
  const vintages = regularLaneFiles(dataDir, vintageDirectory)
  const receipts = regularLaneFiles(dataDir, receiptDirectory)
  if (!vintages || !receipts || vintages.length < count || receipts.length < count) return false
  // Only publisher-shaped immutable names may survive in canonical lanes. Check every entry before the
  // O(1) happy-path return: otherwise an arbitrary vintage or renamed older receipt can stay invisible to
  // current health until the next publisher sweep fails on the same debris.
  if (vintages.some((file) => !/^\d{8}T\d{12}Z_[0-9a-f]{64}\.json$/.test(file.name))
      || receipts.some((file) => !/^[0-9a-f]{64}\.json$/.test(file.name))) return false

  const latestVintage = safePoolFile(dataDir, head.path)
  const latestReceipt = safePoolFile(dataDir, path.posix.join(
    receiptDirectory, `${head.metadata_sha256}.json`,
  ))
  if (!latestVintage || !latestReceipt
      || !vintages.some((file) => file.realPath === latestVintage)
      || !receipts.some((file) => file.realPath === latestReceipt)) return false

  // The ordinary path inventories names but keeps record reads O(1). Extra receipts are exceptional:
  // publication may leave a fully sealed loser after two hosts race for the same sequence marker. Audit
  // every receipt then. Each is either the marker winner or a valid same-sequence branch whose different
  // immutable marker and prior marker prove it lost. An unmarked successor remains unavailable until the
  // publisher's recovery path claims its marker and advances current.
  if (receipts.length === count) return true
  let accepted = 0
  for (const file of receipts) {
    const receipt = jsonFile(file.realPath)
    if (receipt == null) {
      if (canonicalJsonObjectStrictPrefix(file.realPath)) continue
      return false
    }
    const receiptHead = headFromReceipt(receipt)
    if (!receiptHead || file.name !== `${receiptHead.metadata_sha256}.json`) return false
    const loaded = loadLinkedHead(c, subject, dataDir, receiptHead)
    if (!loaded) return false
    const markerPath = safePoolFile(dataDir, markerRelative(c, subject, receiptHead.sequence))
    const marker = markerPath ? jsonFile(markerPath) : null
    if (markerMatches(c, subject, marker, receiptHead)) {
      if (receiptHead.sequence > count) return false
      accepted++
      continue
    }
    const winnerHead = marker?.committed_head
    if (receiptHead.sequence > count || !validLinkedHead(winnerHead)
        || canonicalJsonEqual(winnerHead, receiptHead)
        || !markerMatches(c, subject, marker, winnerHead)) return false
    if (receiptHead.sequence === 1) {
      if (loaded.priorHead !== null) return false
    } else {
      const priorMarkerPath = safePoolFile(dataDir, markerRelative(c, subject, receiptHead.sequence - 1))
      const priorMarker = priorMarkerPath ? jsonFile(priorMarkerPath) : null
      if (!loaded.priorHead || !markerMatches(c, subject, priorMarker, loaded.priorHead)) return false
    }
  }
  return accepted === count
}

/** Verify current using constant record reads plus complete immutable-lane inventories. */
function canonicalCurrent(c: ConnectorManifest, subject: string, dataDir: string): any | null {
  const currentRelative = path.posix.join(
    '_connectors', 'current', c.dataset_id, c.series_id, `${subject}.json`,
  )
  const safeCurrent = safePoolFile(dataDir, currentRelative)
  if (!safeCurrent) return null
  const current = jsonFile(safeCurrent)
  const fingerprint = connectorFingerprint(c.dir)
  const publisherFingerprint = publisherContractFingerprint()
  if (!fingerprint || !publisherFingerprint || current?.connector_id !== c.id || current?.dataset_id !== c.dataset_id
      || current?.series_id !== c.series_id || current?.subject !== subject || current?.provider !== c.provider
      || current?.provider_priority !== c.provider_priority || current?.connector_fingerprint !== fingerprint
      || current?.publisher_contract_fingerprint !== publisherFingerprint
      || current?.manifest_version !== 2 || current?.schema_version !== c.schema_version
      || current?.series !== c.series || current?.authority_class !== c.authority_class
      || current?.fallback_for !== c.fallback_for
      || current?.acquisition !== c.acquisition || current?.source_type !== c.source_type
      || current?.tier !== c.tier || current?.license !== c.license
      || !canonicalJsonEqual(current?.release, c.release)
      || !canonicalJsonEqual(current?.licensing, c.licensing)
      || !canonicalJsonEqual(current?.output_schema, c.output_schema)
      || !canonicalJsonEqual(current?.units, c.units)
      || !canonicalJsonEqual(current?.minimum_history, c.minimum_history)
      || !exactCalendarDate(current?.as_of) || !exactUtcDatetime(current?.retrieved_at)) return null

  const count = current.committed_count
  const head = current.committed_head
  if (current.commit_protocol_version !== 1 || !Number.isInteger(count) || count < 1
      || !validLinkedHead(head) || head.sequence !== count) return null
  const expectedReceipt = path.posix.join('_connectors', 'commits', c.dataset_id, c.series_id, subject,
    `${head.metadata_sha256}.json`)
  if (current.commit_receipt_path !== expectedReceipt) return null
  const loaded = loadLinkedHead(c, subject, dataDir, head)
  if (!loaded || !committedHeadBoundaryConsistent(c, subject, dataDir, head)
      || !sealedLaneInventoryConsistent(c, subject, dataDir, count, head)) return null
  const vintage = loaded.vintage
  for (const [key, value] of Object.entries(vintage)) if (!canonicalJsonEqual(current[key], value)) return null

  const digest = String(current.content_sha256 || '')
  if (!/^[0-9a-f]{64}$/.test(digest)) return null
  const blobRelative = path.posix.join('_connectors', 'blobs', 'sha256', digest.slice(0, 2), `${digest}.json`)
  if (current.blob_path !== blobRelative) return null
  const blobPath = safePoolFile(dataDir, blobRelative)
  if (!blobPath) return null
  const parsedBlob = jsonFileWithBytes(blobPath)
  const payload = parsedBlob?.value
  if (!parsedBlob || !payload || digestBytes(parsedBlob.bytes) !== digest || payload?.as_of !== current.as_of
      || (typeof current.series === 'string' && payload?.series !== current.series)) return null
  return current
}

/** Verify the recoverable pool projection and its provenance sidecar against the canonical current head. */
function currentProjectionIntact(c: ConnectorManifest, subject: string, dataDir: string, current: any): boolean {
  try {
    const rel = c.output_path.replaceAll('<SUBJECT>', subject).replaceAll('<as_of>', String(current.as_of))
    if (!rel.startsWith('data/')) return false
    const withoutData = rel.slice(5)
    if (current.legacy_path !== withoutData) return false
    const projection = safePoolFile(dataDir, withoutData)
    const sidecar = safePoolFile(dataDir, `${withoutData}.source.json`)
    const blob = safePoolFile(dataDir, String(current.blob_path || ''))
    if (!projection || !sidecar || !blob) return false
    const payload = jsonFileWithBytes(projection)
    const canonicalPayload = jsonFileWithBytes(blob)
    const provenance = jsonFileWithBytes(sidecar)
    const expectedProvenance = canonicalJson(current.provenance)
    return payload != null && canonicalPayload != null && provenance != null && expectedProvenance != null
      && payload.bytes.equals(canonicalPayload.bytes)
      && provenance.bytes.equals(Buffer.from(`${expectedProvenance}\n`, 'utf8'))
  } catch { return false }
}

export function connectorCurrentStatus(
  connector: ConnectorManifest, subject: string, dataDir: string = DATA_DIR, nowMs: number = Date.now(),
): { asOf: string; retrievedAt: string; vintageId: string; usable: boolean; projectionIntact: boolean } | null {
  if (connector.manifest_version !== 2) return null
  const current = canonicalCurrent(connector, subject, dataDir)
  return current ? {
    asOf: current.as_of, retrievedAt: current.retrieved_at, vintageId: current.vintage_id,
    usable: releaseEligibleAt(current, nowMs), projectionIntact: currentProjectionIntact(connector, subject, dataDir, current),
  } : null
}

/** A code declaration closes a need only while that subject+series is current and usable. */
export function healthyBuiltBySatisfies(
  subject: string,
  opts: {
    connectors?: ConnectorManifest[]; health?: Map<string, FeedHealth>; dataDir?: string; nowMs?: number;
  } = {},
): Map<string, string> {
  const connectors = opts.connectors ?? listConnectors()
  const health = opts.health ?? readFeedHealth()
  const dataDir = opts.dataDir ?? DATA_DIR
  const nowMs = opts.nowMs ?? Date.now()
  const candidates = connectors
    .filter((c) => c.manifest_version === 2 && c.subjects.includes(subject))
    .sort((a, b) => {
      const af = a.fallback_for ? 1 : 0; const bf = b.fallback_for ? 1 : 0
      return af - bf || a.provider_priority - b.provider_priority || a.id.localeCompare(b.id)
    })
  // A point-in-time disagreement is a property of the semantic series, not merely of whichever provider
  // happened to be fetched last.  Do not let a still-current sibling provider close the need while the
  // primary/fallback comparison is explicitly unresolved.
  const disputedSeries = new Set(candidates.filter((c) => {
    const feed = feedHealthOf(health, c.id, subject)
    return feed.failureKind === 'provider_disagreement'
  }).map((c) => c.series_id))
  const out = new Map<string, string>()
  for (const c of candidates) {
    if (disputedSeries.has(c.series_id)) continue
    const feed = feedHealthOf(health, c.id, subject)
    if (!['current', 'no_new_release', 'manual'].includes(feed.state)) continue
    const current = canonicalCurrent(c, subject, dataDir)
    if (!current || !releaseEligibleAt(current, nowMs) || !currentProjectionIntact(c, subject, dataDir, current)) continue
    if (feed.datasetId !== c.dataset_id || feed.seriesId !== c.series_id || feed.provider !== c.provider
        || feed.latestAsOf !== current.as_of || feed.retrievedAt !== current.retrieved_at
        || feed.contentSha256 !== current.content_sha256 || feed.vintageId !== current.vintage_id
        || feed.connectorFingerprint !== current.connector_fingerprint
        || feed.publisherContractFingerprint !== current.publisher_contract_fingerprint
        || feed.connectorCommit !== current.connector_commit) continue
    for (const need of c.satisfies) if (!out.has(need)) out.set(need, c.id)
  }
  return out
}
