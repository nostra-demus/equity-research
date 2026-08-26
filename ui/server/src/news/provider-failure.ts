import { createHmac, randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../singleton-lock'

/** One vocabulary for every LLM adapter. These names describe the root cause, not the retry timer. */
export type ProviderFailureCode =
  | 'auth'
  | 'entitlement'
  | 'billing'
  | 'model_terminal'
  | 'request_invalid'
  | 'rate_limited'
  | 'transient_upstream'
  | 'timeout'
  | 'contract_invalid'
  | 'local_state'
  | 'unknown'

export type ProviderFailureScope = 'provider' | 'workload'
export type ProviderFailureAction = 'quarantine' | 'cooldown' | 'none'

export interface ProviderFailureClassification {
  code: ProviderFailureCode
  scope: ProviderFailureScope
  action: ProviderFailureAction
  providerWide: boolean
  httpStatus?: number
  /** Bounded upstream identifiers only. The error message/body never crosses this boundary. */
  evidenceType?: string
  evidenceCode?: string
}

export interface ProviderHttpRequestContext {
  providerId?: string
  model?: string
  models?: string[]
}

export interface ProviderRequestIdentityInput {
  providerId: string
  baseUrl: string
  model: string
  models?: string[]
  apiKey?: string
  keyEnvVar?: string
  transport?: 'openai' | 'gemini' | 'anthropic'
  workload: string
  contractVersion: string
  request?: Record<string, unknown>
}

export interface ProviderRequestIdentity {
  providerId: string
  workload: string
  providerFingerprint: string
  requestFingerprint: string
  /** Safe configuration evidence for diagnostics. No credential value is retained. */
  configuration: {
    baseUrl: string
    models: string[]
    credentialHashPrefix: string
    keyEnvVar?: string
    transport: 'openai' | 'gemini' | 'anthropic'
    contractVersion: string
  }
}

export interface ProviderQuarantine {
  version: 1
  providerId: string
  workload?: string
  scope: ProviderFailureScope
  failureCode: ProviderFailureCode
  fingerprint: string
  providerFingerprint: string
  requestFingerprint: string
  firstObservedAt: number
  observedAt: number
  observations: number
  configuration: ProviderRequestIdentity['configuration']
  httpStatus?: number
  evidenceType?: string
  evidenceCode?: string
  persisted: boolean
}

const VERSION = 1
const MAX_ERROR_BODY = 64 * 1024
// Domain separation for change-detection fingerprints. These are not password verifiers or authorization
// tokens: provider API keys are high-entropy credentials, and only the HMAC output enters durable state.
const FINGERPRINT_DOMAIN = 'nostra/provider-quarantine/v1'
const memory = new Map<string, ProviderQuarantine>()
const FAILURE_CODES = new Set<ProviderFailureCode>([
  'auth', 'entitlement', 'billing', 'model_terminal', 'request_invalid', 'rate_limited',
  'transient_upstream', 'timeout', 'contract_invalid', 'local_state', 'unknown',
])

function boundedToken(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const token = value.trim().slice(0, 96)
  return token && /^[a-z0-9_.:/-]+$/i.test(token) ? token : undefined
}

function safeProviderId(value: string): string {
  return String(value || 'provider').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 80) || 'provider'
}

function safeWorkload(value: string): string {
  return String(value || 'default').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 80) || 'default'
}

function safeBaseUrl(value: string): string {
  try {
    const url = new URL(value)
    url.username = ''
    url.password = ''
    url.search = ''
    url.hash = ''
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
  } catch {
    return String(value || '').split(/[?#]/, 1)[0].replace(/\/+$/, '').slice(0, 512)
  }
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable)
  if (!value || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) return String(value)
    return value
  }
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    const entry = (value as Record<string, unknown>)[key]
    if (entry !== undefined) out[key] = stable(entry)
  }
  return out
}

/** Hashes the credential, transport, model and request contract without retaining the secret. A key/model/
 * contract change therefore reopens the route automatically; an unchanged standing fault never does. */
export function providerRequestIdentity(input: ProviderRequestIdentityInput): ProviderRequestIdentity {
  const providerId = safeProviderId(input.providerId)
  const workload = safeWorkload(input.workload)
  const models = [...new Set([input.model, ...(input.models || [])].map((x) => String(x || '').trim()).filter(Boolean))]
  const credentialHashPrefix = input.apiKey
    ? createHmac('sha256', FINGERPRINT_DOMAIN).update('credential\0').update(input.apiKey).digest('hex').slice(0, 24)
    : 'none'
  const configuration: ProviderRequestIdentity['configuration'] = {
    baseUrl: safeBaseUrl(input.baseUrl),
    models,
    credentialHashPrefix,
    ...(input.keyEnvVar ? { keyEnvVar: input.keyEnvVar } : {}),
    transport: input.transport || 'openai',
    contractVersion: String(input.contractVersion || 'unknown').slice(0, 96),
  }
  // The credential is the HMAC key, never message data and never persisted. The message contains only
  // canonical configuration. This makes both identities change on key rotation without treating the API
  // key like a human password or feeding credential lineage through a generic fast-hash helper.
  const fingerprintKey = input.apiKey || FINGERPRINT_DOMAIN
  const providerFingerprint = `hmac-sha256:${createHmac('sha256', fingerprintKey)
    .update('provider\0')
    .update(JSON.stringify(stable({
      providerId,
      baseUrl: configuration.baseUrl,
      models,
      transport: configuration.transport,
    })))
    .digest('hex')}`
  const requestFingerprint = `hmac-sha256:${createHmac('sha256', fingerprintKey)
    .update('request\0')
    .update(JSON.stringify(stable({
      providerId,
      baseUrl: configuration.baseUrl,
      models,
      transport: configuration.transport,
      workload,
      contractVersion: configuration.contractVersion,
      request: input.request || {},
    })))
    .digest('hex')}`
  return { providerId, workload, providerFingerprint, requestFingerprint, configuration }
}

interface ErrorEvidence {
  type?: string
  code?: string
  search: string
}

function errorEvidence(rawBody: unknown): ErrorEvidence {
  let body: any = rawBody
  if (typeof rawBody === 'string') {
    const text = rawBody.slice(0, MAX_ERROR_BODY)
    try { body = JSON.parse(text) } catch { body = { message: text } }
  }
  const error = body?.error && typeof body.error === 'object' ? body.error : body
  const type = boundedToken(error?.type ?? body?.type)
  const code = boundedToken(error?.code ?? body?.code)
  const message = typeof error?.message === 'string' ? error.message : typeof body?.message === 'string' ? body.message : ''
  return {
    type,
    code,
    // Provider codes commonly use model_not_found while messages use "model not found". Normalize only
    // for in-memory classification; neither form of the message is returned or persisted.
    search: `${type || ''} ${code || ''} ${message}`.toLowerCase().replace(/[_-]+/g, ' ').slice(0, 4096),
  }
}

/** Provider-neutral HTTP classification. Status supplies the safe baseline; the body is used only in-memory
 * to distinguish a model/resource 404 and is never returned, logged, or persisted. */
export function classifyProviderHttpFailure(
  status: number,
  rawBody?: unknown,
  context?: ProviderHttpRequestContext,
): ProviderFailureClassification {
  const evidence = errorEvidence(rawBody)
  const carry = {
    httpStatus: status,
    ...(evidence.type ? { evidenceType: evidence.type } : {}),
    ...(evidence.code ? { evidenceCode: evidence.code } : {}),
  }
  if (status === 401) return { code: 'auth', scope: 'provider', action: 'quarantine', providerWide: true, ...carry }
  if (status === 402) return { code: 'billing', scope: 'provider', action: 'quarantine', providerWide: true, ...carry }
  if (status === 403) return { code: 'entitlement', scope: 'provider', action: 'quarantine', providerWide: true, ...carry }
  if (status === 404) {
    // `openrouter/free` is a live pool, not a fixed model deployment. OpenRouter documents that it filters
    // the changing free pool for the request's required capabilities, and that availability can vary. More
    // generally, its documented "No allowed providers are available" 404 is distinct from model_not_found:
    // it describes a routing gap that may heal without any configuration change. Keep that exact request
    // contract on a cooldown; a genuinely missing/retired model still follows the terminal path below.
    const models = [context?.model, ...(context?.models || [])]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase())
    const openRouterRoute = String(context?.providerId || '').trim().toLowerCase() === 'openrouter'
      && models.length > 0
    const noProviderRoute = /no (?:allowed )?providers? (?:are )?(?:currently )?available/.test(evidence.search)
    if (openRouterRoute && noProviderRoute) {
      return {
        code: 'transient_upstream', scope: 'workload', action: 'cooldown', providerWide: false, ...carry,
      }
    }
    const model = /(?:model|deployment|endpoint|route).*(?:not found|does not exist|unavailable|deprecated|decommissioned|retired|no endpoint)|(?:not found|unavailable).*(?:model|deployment|endpoint|route)/.test(evidence.search)
    return {
      code: model ? 'model_terminal' : 'request_invalid',
      scope: 'provider', action: 'quarantine', providerWide: true, ...carry,
    }
  }
  if (status === 408 || status === 499) return { code: 'timeout', scope: 'workload', action: 'cooldown', providerWide: false, ...carry }
  if (status === 429) return { code: 'rate_limited', scope: 'provider', action: 'cooldown', providerWide: true, ...carry }
  if (status === 424 || status === 498 || status >= 500) return { code: 'transient_upstream', scope: 'provider', action: 'cooldown', providerWide: true, ...carry }
  if ([400, 405, 406, 409, 413, 415, 422].includes(status)) {
    // An unchanged schema, endpoint parameter, or payload bound will not heal with time. Quarantine only
    // this request contract/workload; another workload and every later provider remain eligible.
    return { code: 'request_invalid', scope: 'workload', action: 'quarantine', providerWide: false, ...carry }
  }
  return { code: 'unknown', scope: status >= 400 && status < 500 ? 'workload' : 'provider', action: 'cooldown', providerWide: status >= 500, ...carry }
}

export function classifyProviderCaughtFailure(error: any): ProviderFailureClassification {
  const evidenceType = boundedToken(error?.name)
  const evidenceCode = boundedToken(error?.code ?? error?.cause?.code)
  const carry = {
    ...(evidenceType ? { evidenceType } : {}),
    ...(evidenceCode ? { evidenceCode } : {}),
  }
  const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError'
  if (timedOut) return { code: 'timeout', scope: 'workload', action: 'cooldown', providerWide: false, ...carry }
  if (error instanceof SyntaxError) return { code: 'contract_invalid', scope: 'workload', action: 'cooldown', providerWide: false, ...carry }
  if (evidenceCode === 'ERR_INVALID_URL' || evidenceCode === 'ERR_INVALID_ARG_TYPE') {
    return { code: 'request_invalid', scope: 'workload', action: 'quarantine', providerWide: false, ...carry }
  }
  return { code: 'transient_upstream', scope: 'provider', action: 'cooldown', providerWide: true, ...carry }
}

export function classifyProviderContractFailure(): ProviderFailureClassification {
  return { code: 'contract_invalid', scope: 'workload', action: 'cooldown', providerWide: false }
}

export function classifyProviderLocalStateFailure(): ProviderFailureClassification {
  return { code: 'local_state', scope: 'provider', action: 'none', providerWide: false }
}

export function publicProviderFailureNote(provider: string, failure: ProviderFailureClassification, dailyLimit = false): string {
  const prefix = failure.httpStatus != null ? `${provider} HTTP ${failure.httpStatus}` : provider
  if (failure.code === 'auth') return `${prefix} — API key rejected`
  if (failure.code === 'entitlement') return `${prefix} — account lacks permission`
  if (failure.code === 'billing') return `${prefix} — billing or credits unavailable`
  if (failure.code === 'model_terminal') return `${prefix} — configured model or endpoint is unavailable`
  if (failure.code === 'request_invalid') return `${prefix} — request or endpoint rejected`
  if (failure.code === 'rate_limited') return `${prefix} — ${dailyLimit ? 'daily quota reached' : 'rate limited'}`
  if (failure.code === 'transient_upstream') return `${prefix} — service temporarily unavailable`
  if (failure.code === 'timeout') return `${prefix} — request timed out`
  if (failure.code === 'contract_invalid') return `${prefix} — response did not match the required contract`
  if (failure.code === 'local_state') return `${prefix} — local provider configuration needs attention`
  return `${prefix} — provider request failed for an unknown reason`
}

/** Rehydrate only the bounded public classification carried by a durable marker. */
export function providerFailureFromQuarantine(marker: ProviderQuarantine): ProviderFailureClassification {
  return {
    code: marker.failureCode,
    scope: marker.scope,
    action: 'quarantine',
    providerWide: marker.scope === 'provider',
    ...(marker.httpStatus != null ? { httpStatus: marker.httpStatus } : {}),
    ...(marker.evidenceType ? { evidenceType: marker.evidenceType } : {}),
    ...(marker.evidenceCode ? { evidenceCode: marker.evidenceCode } : {}),
  }
}

/** An explicit Retry-After can make a request rejection self-clearing. Auth, billing, entitlement, and
 * explicit model-retirement evidence remain terminal regardless of a retry header. */
export function honorProviderRetryAfter(
  failure: ProviderFailureClassification,
  retryAfterMs: number | null | undefined,
): ProviderFailureClassification {
  return failure.code === 'request_invalid'
    && retryAfterMs != null && Number.isFinite(retryAfterMs) && retryAfterMs > 0
    ? { ...failure, action: 'cooldown' }
    : failure
}

export function publicProviderQuarantineNote(provider: string, marker: ProviderQuarantine): string {
  return `${publicProviderFailureNote(provider, providerFailureFromQuarantine(marker))}; waiting will not repair this configuration`
}

function quarantineFile(stateDir: string, identity: ProviderRequestIdentity, scope: ProviderFailureScope): string {
  const suffix = scope === 'provider' ? '' : `-${safeWorkload(identity.workload)}`
  return path.join(stateDir, `provider-${safeProviderId(identity.providerId)}${suffix}-quarantine.json`)
}

function markerFingerprint(identity: ProviderRequestIdentity, scope: ProviderFailureScope): string {
  return scope === 'provider' ? identity.providerFingerprint : identity.requestFingerprint
}

function validMarker(value: any): value is Omit<ProviderQuarantine, 'persisted'> {
  return value?.version === VERSION
    && typeof value.providerId === 'string'
    && (value.scope === 'provider' || value.scope === 'workload')
    && FAILURE_CODES.has(value.failureCode)
    && typeof value.fingerprint === 'string'
    && typeof value.providerFingerprint === 'string'
    && typeof value.requestFingerprint === 'string'
    && Number.isFinite(value.firstObservedAt) && value.firstObservedAt >= 0
    && Number.isFinite(value.observedAt) && value.observedAt >= value.firstObservedAt
    && Number.isInteger(value.observations) && value.observations >= 1
    && (value.scope !== 'workload' || typeof value.workload === 'string')
    && value.configuration && typeof value.configuration === 'object'
    && typeof value.configuration.baseUrl === 'string'
    && Array.isArray(value.configuration.models) && value.configuration.models.every((model: unknown) => typeof model === 'string')
    && typeof value.configuration.credentialHashPrefix === 'string'
    && ['openai', 'gemini', 'anthropic'].includes(value.configuration.transport)
    && typeof value.configuration.contractVersion === 'string'
    && (value.httpStatus == null || (Number.isInteger(value.httpStatus) && value.httpStatus >= 100 && value.httpStatus <= 599))
    && (value.evidenceType == null || boundedToken(value.evidenceType) === value.evidenceType)
    && (value.evidenceCode == null || boundedToken(value.evidenceCode) === value.evidenceCode)
}

function readFileMarker(file: string): ProviderQuarantine | null {
  const remembered = memory.get(file)
  try {
    const stat = fs.lstatSync(file)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('unsafe marker inode')
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!validMarker(parsed)) throw new Error('invalid marker')
    const disk = { ...parsed, persisted: true } as ProviderQuarantine
    if (!remembered || disk.observedAt >= remembered.observedAt) {
      // Disk remains authoritative and is re-read on every check so another process can repair, clear, or
      // corrupt a marker. Keep the cache synchronized as well so a later ENOENT can invalidate this exact
      // persisted observation instead of retaining stale process-local state.
      memory.set(file, disk)
      return disk
    }
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      // Another process may have cleared a repaired marker. A persisted cache must follow that durable
      // deletion; only an unpersisted, fail-safe in-process marker survives a missing file.
      if (remembered?.persisted) {
        memory.delete(file)
        return null
      }
      return remembered || null
    }
    // Unknown durable state fails safe. The fixed code is public; corrupt marker bytes never are. Replace
    // even a previously cached valid marker so diagnostics expose the storage fault that now needs repair.
    const at = Date.now()
    const corrupt: ProviderQuarantine = {
      version: 1, providerId: 'unknown', scope: 'provider', failureCode: 'local_state',
      fingerprint: 'unreadable', providerFingerprint: 'unreadable', requestFingerprint: 'unreadable',
      firstObservedAt: at, observedAt: at, observations: 1,
      configuration: { baseUrl: '', models: [], credentialHashPrefix: 'unknown', transport: 'openai', contractVersion: 'unknown' },
      persisted: true,
    }
    memory.set(file, corrupt)
    return corrupt
  }
  return remembered || null
}

/** Returns a matching standing quarantine. A marker from an old key/model/contract is logically cleared and
 * ignored immediately; callers need no timer and no manual file deletion after a configuration repair. */
export function readProviderQuarantine(stateDir: string, identity: ProviderRequestIdentity): ProviderQuarantine | null {
  for (const scope of ['provider', 'workload'] as const) {
    const marker = readFileMarker(quarantineFile(stateDir, identity, scope))
    if (!marker) continue
    if (marker.failureCode === 'local_state') return { ...marker, providerId: identity.providerId, scope }
    if (marker.providerId !== identity.providerId || marker.scope !== scope) continue
    if (scope === 'workload' && marker.workload !== identity.workload) continue
    if (marker.fingerprint === markerFingerprint(identity, scope)) return marker
  }
  return null
}

function atomicWrite(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`
  let fd: number | undefined
  try {
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, `${JSON.stringify(value)}\n`, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd); fd = undefined
    fs.renameSync(temp, file)
    fsyncDirectory(path.dirname(file))
  } finally {
    if (fd != null) try { fs.closeSync(fd) } catch { /* process cleanup */ }
    try { fs.rmSync(temp, { force: true }) } catch { /* best effort */ }
  }
}

function fsyncDirectory(directory: string): void {
  let fd: number | undefined
  try {
    fd = fs.openSync(directory, 'r')
    fs.fsyncSync(fd)
  } catch {
    // File fsync + atomic rename remain the strongest portable fallback where directory fsync is rejected.
  } finally {
    if (fd != null) try { fs.closeSync(fd) } catch { /* process cleanup */ }
  }
}

/** Atomically records a standing configuration fault. Memory is updated first so a full/read-only disk still
 * prevents this process from burning the provider repeatedly; the return value says whether disk agreed. */
export function quarantineProviderFailure(
  stateDir: string,
  identity: ProviderRequestIdentity,
  failure: ProviderFailureClassification,
  at = Date.now(),
): ProviderQuarantine | null {
  if (failure.action !== 'quarantine') return null
  const file = quarantineFile(stateDir, identity, failure.scope)
  let lock: number | undefined
  const fingerprint = markerFingerprint(identity, failure.scope)
  try {
    // This is a rare terminal-fault path. Prefer waiting for the other process's tiny atomic update over
    // dropping corroborating evidence and leaving another process able to spend a duplicate provider call.
    lock = acquireRetainedFlockSync(`${file}.lock`, { waitMs: 10_000, busyMessage: 'provider quarantine writer busy' })
    const prior = readFileMarker(file)
    const same = prior && prior.providerId === identity.providerId && prior.scope === failure.scope && prior.fingerprint === fingerprint
    // `at` is normally captured before this process waits for the cross-process lock. A later lock owner
    // can therefore carry an earlier wall-clock value than the marker it just read. Never let durable time
    // move backward: doing so makes an otherwise valid marker fail its own schema after correct serialization.
    const observedAt = same ? Math.max(prior.observedAt, at) : at
    const marker: ProviderQuarantine = {
      version: 1,
      providerId: identity.providerId,
      ...(failure.scope === 'workload' ? { workload: identity.workload } : {}),
      scope: failure.scope,
      failureCode: failure.code,
      fingerprint,
      providerFingerprint: identity.providerFingerprint,
      requestFingerprint: identity.requestFingerprint,
      firstObservedAt: same ? prior.firstObservedAt : at,
      observedAt,
      observations: same ? prior.observations + 1 : 1,
      configuration: identity.configuration,
      ...(failure.httpStatus != null ? { httpStatus: failure.httpStatus } : {}),
      ...(failure.evidenceType ? { evidenceType: failure.evidenceType } : {}),
      ...(failure.evidenceCode ? { evidenceCode: failure.evidenceCode } : {}),
      persisted: false,
    }
    memory.set(file, marker)
    try {
      const disk = { ...marker } as any
      delete disk.persisted
      atomicWrite(file, disk)
      const persisted = { ...marker, persisted: true }
      memory.set(file, persisted)
      return persisted
    } catch {
      return marker
    }
  } catch {
    const observed = readFileMarker(file)
    if (observed && observed.providerId === identity.providerId && observed.scope === failure.scope && observed.fingerprint === fingerprint) {
      memory.set(file, observed)
      return observed
    }
    const marker: ProviderQuarantine = {
      version: 1, providerId: identity.providerId,
      ...(failure.scope === 'workload' ? { workload: identity.workload } : {}),
      scope: failure.scope, failureCode: failure.code, fingerprint,
      providerFingerprint: identity.providerFingerprint, requestFingerprint: identity.requestFingerprint,
      firstObservedAt: at, observedAt: at, observations: 1, configuration: identity.configuration,
      ...(failure.httpStatus != null ? { httpStatus: failure.httpStatus } : {}),
      ...(failure.evidenceType ? { evidenceType: failure.evidenceType } : {}),
      ...(failure.evidenceCode ? { evidenceCode: failure.evidenceCode } : {}),
      persisted: false,
    }
    memory.set(file, marker)
    return marker
  } finally {
    if (lock != null) releaseRetainedFlock(lock)
  }
}

/** A successful request is the canary. It clears only matching, older markers; a late success cannot erase a
 * newer concurrent failure, and a config change does not accidentally bless the old fingerprint. */
export function clearProviderQuarantine(
  stateDir: string,
  identity: ProviderRequestIdentity,
  attemptStartedAt = Date.now(),
): void {
  for (const scope of ['provider', 'workload'] as const) {
    const file = quarantineFile(stateDir, identity, scope)
    let lock: number | undefined
    try {
      lock = acquireRetainedFlockSync(`${file}.lock`, { waitMs: 2_000, busyMessage: 'provider quarantine clearer busy' })
      const marker = readFileMarker(file)
      if (!marker) continue
      // A rolling deploy can briefly run two fingerprints against one state directory. A success for the
      // old one must never delete the new one's marker; mismatched debt is already logically cleared for
      // this caller by readProviderQuarantine and can be overwritten atomically if this config later fails.
      if (marker.failureCode !== 'local_state' && marker.fingerprint !== markerFingerprint(identity, scope)) continue
      if (marker.failureCode !== 'local_state' && marker.observedAt >= attemptStartedAt) continue
      memory.delete(file)
      fs.rmSync(file, { force: true })
      fsyncDirectory(path.dirname(file))
    } catch {
      // Fail safe: an uncleared durable marker still blocks the route and remains visible in diagnostics.
    } finally {
      if (lock != null) releaseRetainedFlock(lock)
    }
  }
}

/** Test hook only. Durable files remain the authority. */
export function resetProviderQuarantineMemory(): void { memory.clear() }
