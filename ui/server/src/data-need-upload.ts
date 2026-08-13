// Provenance-safe manual intake for one exact, currently-selected data need.
//
// The web server is only a STAGER. It writes an opaque payload plus a signed, server-owned intent into
// EXTERNAL-INBOX/.data-need-requests/<request_id> and never publishes evidence into a subject pool. The
// existing ingest_external.py router is the sole publisher. Its signed result and hash-bound provenance
// sidecar are what this module projects back to the UI; neither staging nor routing claims that evidence
// was considered by a run or that the selected need was resolved.
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Readable } from 'node:stream'
import { promisify } from 'node:util'
import { DATA_DIR, REPO_ROOT, STATE_DIR } from './config'
import type { DataNeed, DataNeedsRead } from './data-needs'
import { sanitizeUploadFilename } from './sandbox'

const execFileAsync = promisify(execFile)

export const DATA_NEED_UPLOAD_CONTRACT = 'data-need-upload/1' as const
export const DATA_NEED_UPLOAD_MAX_BYTES = 40 * 1024 * 1024
export const DATA_NEED_UPLOAD_ACTIVE_DIR = '.data-need-requests'
export const DATA_NEED_UPLOAD_STAGING_DIR = '.data-need-staging'
export const DATA_NEED_UPLOAD_ARCHIVE_DIR = path.join('_routed', DATA_NEED_UPLOAD_ACTIVE_DIR)

const INTENT_CONTRACT = 'data-need-upload-intent/1'
const RESULT_CONTRACT = 'data-need-upload-result/1'
const CONTEXT_CONTRACT = 'data-need-upload-context/1'
const REQUEST_ID_RE = /^DNU-[a-f0-9]{32}$/
const NEED_ID_RE = /^[a-z0-9][a-z0-9_-]{0,127}$/
const SUBJECT_RE = /^[A-Z0-9][A-Z0-9._-]{0,63}$/
const SWARM_RE = /^[a-z0-9][a-z0-9_-]{0,119}$/
const FINGERPRINT_RE = /^sha256:[a-f0-9]{64}$/
const SHA256_RE = /^[a-f0-9]{64}$/
const SIGNATURE_RE = /^hmac-sha256:[a-f0-9]{64}$/
const HOST_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,254}$/
const NAME_MAX_BYTES = 255
const ROUTED_FILENAME_MAX_BYTES = 200
const SIDECAR_SUFFIX = '.source.json'
const RESERVED_SUBJECTS = new Set(['news-archive', 'external-inbox'])

export type DataNeedUploadStatus = 'none' | 'staged_waiting' | 'routed_provenance_verified' | 'rejected_policy' | 'failed_tampered'
export type DataNeedUploadFailureReason = 'malformed_request' | 'tampered_request' | 'routing_failed' | 'policy_rejected'

export interface DataNeedUploadItem {
  request_id: string
  filename: string
  sha256: string
  staged_at: string
  routed_path?: string
  reason?: DataNeedUploadFailureReason
}

export interface DataNeedUploadRead {
  contract_version: typeof DATA_NEED_UPLOAD_CONTRACT
  subject: string
  swarm: string
  run_root: string
  decision_fingerprint: string
  need_id: string
  series: string
  status: DataNeedUploadStatus
  items: DataNeedUploadItem[]
}

export interface DataNeedUploadIdentity {
  subject: string
  swarm: string
  run_root: string
  decision_fingerprint: string
  need_id: string
  series: string
}

export interface ReceivedDataNeedUpload {
  temp_path: string
  filename: string
  mimetype: string
  size: number
  sha256: string
  file_dev: number
  file_ino: number
}

export interface CommitDataNeedUploadInput extends DataNeedUploadIdentity {
  provider: string
  source_url: string | null
  source_url_basis: 'server_lookup_public_dns' | 'user_supplied_unverified' | 'absent'
  requested_by: string
}

export interface DataNeedUploadStorage {
  dataDir?: string
  stateDir?: string
  repoRoot?: string
  now?: () => Date
  requestId?: () => string
}

export interface DataNeedUploadWriterOptions {
  dataDir?: string
  repoRoot?: string
  homeDir?: string
  hostname?: string
  uid?: number
}

export type DataNeedUploadSelectionFailure = 'selected_decision_changed' | 'selected_call_not_current' | 'selected_need_changed'

/** Pure exact-match policy used by the HTTP route and adversarial fixtures. */
export function selectCurrentDataNeedForUpload(
  selected: DataNeedsRead | null,
  current: DataNeedsRead | null,
  binding: Pick<DataNeedUploadIdentity, 'run_root' | 'decision_fingerprint' | 'need_id' | 'series'>,
): { read: DataNeedsRead; need: DataNeed } | DataNeedUploadSelectionFailure {
  if (!selected || selected.contract_version !== 'data-needs-read/2' || selected.run_root !== binding.run_root
      || selected.decision_fingerprint !== binding.decision_fingerprint) return 'selected_decision_changed'
  if (!current || current.run_root !== selected.run_root
      || current.decision_fingerprint !== selected.decision_fingerprint) return 'selected_call_not_current'
  const need = selected.needs.find((candidate) => candidate.need_id === binding.need_id)
  if (!need || need.series !== binding.series || need.built_by || need.entry_modules.length === 0) return 'selected_need_changed'
  return { read: selected, need }
}

interface UploadIntent extends DataNeedUploadIdentity {
  contract_version: typeof INTENT_CONTRACT
  request_id: string
  provider: string
  source_url: string | null
  source_url_basis: 'server_lookup_public_dns' | 'user_supplied_unverified' | 'absent'
  filename: string
  payload_sha256: string
  payload_size: number
  staged_at: string
  requested_by: string
  signature: string
}

interface UploadResult {
  contract_version: typeof RESULT_CONTRACT
  request_id: string
  intent_sha256: string
  payload_sha256: string
  sidecar_sha256: string | null
  status: 'routed_provenance_verified' | 'rejected_policy' | 'failed_tampered'
  routed_path: string | null
  reason: DataNeedUploadFailureReason | null
  completed_at: string
  signature: string
}

const INTENT_KEYS = new Set([
  'contract_version', 'request_id', 'subject', 'swarm', 'run_root', 'decision_fingerprint', 'need_id',
  'series', 'provider', 'source_url', 'filename', 'payload_sha256', 'payload_size', 'staged_at',
  'source_url_basis', 'requested_by', 'signature',
])
const RESULT_KEYS = new Set([
  'contract_version', 'request_id', 'intent_sha256', 'payload_sha256', 'sidecar_sha256', 'status', 'routed_path', 'reason',
  'completed_at', 'signature',
])

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function unsigned<T extends { signature: string }>(value: T): Omit<T, 'signature'> {
  const { signature: _signature, ...rest } = value
  return rest
}

function signatureFor(value: Record<string, unknown>, key: Buffer): string {
  return `hmac-sha256:${createHmac('sha256', key).update(canonicalJson(value), 'utf8').digest('hex')}`
}

function signatureMatches(value: { signature: string } & Record<string, unknown>, key: Buffer): boolean {
  if (!SIGNATURE_RE.test(value.signature)) return false
  const expected = Buffer.from(signatureFor(unsigned(value), key), 'utf8')
  const actual = Buffer.from(value.signature, 'utf8')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function exactKeys(value: unknown, keys: Set<string>): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.size && Object.keys(value).every((key) => keys.has(key))
}

function plain(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)
}

function validIso(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false
  try { return new Date(value).toISOString() === value } catch { return false }
}

function safeManualFilename(value: string): boolean {
  const safe = sanitizeUploadFilename(value)
  return safe.ok && safe.name === value
    && Buffer.byteLength(value, 'utf8') <= ROUTED_FILENAME_MAX_BYTES
    && Buffer.byteLength(`${value}${SIDECAR_SUFFIX}`, 'utf8') <= NAME_MAX_BYTES
}

export function normalizeDataNeedSourceUrl(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || value.length > 2048 || /[\x00-\x20\x7f]/.test(value)) return undefined
  try {
    const parsed = new URL(value)
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || !parsed.hostname) return undefined
    return parsed.href
  } catch {
    return undefined
  }
}

function validIdentity(value: DataNeedUploadIdentity): boolean {
  return SUBJECT_RE.test(value.subject) && !RESERVED_SUBJECTS.has(value.subject.toLowerCase())
    && SWARM_RE.test(value.swarm) && plain(value.run_root, 300) && !path.isAbsolute(value.run_root)
    && !value.run_root.split(/[\\/]/).includes('..') && FINGERPRINT_RE.test(value.decision_fingerprint)
    && NEED_ID_RE.test(value.need_id) && plain(value.series, 1000)
}

function validIntent(value: unknown, key: Buffer): value is UploadIntent {
  if (!exactKeys(value, INTENT_KEYS)) return false
  const v = value as unknown as UploadIntent
  return v.contract_version === INTENT_CONTRACT && REQUEST_ID_RE.test(v.request_id)
    && validIdentity(v) && plain(v.provider, 200)
    && normalizeDataNeedSourceUrl(v.source_url) === v.source_url
    && ['server_lookup_public_dns', 'user_supplied_unverified', 'absent'].includes(v.source_url_basis)
    && ((v.source_url === null) === (v.source_url_basis === 'absent'))
    && safeManualFilename(v.filename) && SHA256_RE.test(v.payload_sha256)
    && Number.isSafeInteger(v.payload_size) && v.payload_size > 0 && v.payload_size <= DATA_NEED_UPLOAD_MAX_BYTES
    && validIso(v.staged_at) && plain(v.requested_by, 320) && signatureMatches(v as any, key)
}

function validResult(value: unknown, key: Buffer): value is UploadResult {
  if (!exactKeys(value, RESULT_KEYS)) return false
  const v = value as unknown as UploadResult
  const routed = v.routed_path === null || (plain(v.routed_path, 500) && v.routed_path.startsWith('data/')
    && !path.posix.isAbsolute(v.routed_path) && !v.routed_path.split('/').includes('..') && !v.routed_path.includes('\\'))
  const reason = v.reason === null || ['malformed_request', 'tampered_request', 'routing_failed', 'policy_rejected'].includes(v.reason)
  return v.contract_version === RESULT_CONTRACT && REQUEST_ID_RE.test(v.request_id)
    && SHA256_RE.test(v.intent_sha256) && SHA256_RE.test(v.payload_sha256)
    && (v.sidecar_sha256 === null || SHA256_RE.test(v.sidecar_sha256))
    && ['routed_provenance_verified', 'rejected_policy', 'failed_tampered'].includes(v.status)
    && routed && reason && validIso(v.completed_at) && signatureMatches(v as any, key)
    && (v.status === 'routed_provenance_verified'
      ? v.routed_path !== null && v.sidecar_sha256 !== null && v.reason === null
      : v.routed_path === null && v.sidecar_sha256 === null && v.reason !== null
        && ((v.status === 'rejected_policy') === (v.reason === 'policy_rejected')))
}

function canonicalRoot(root: string): string {
  return fs.realpathSync(path.resolve(root))
}

function isContained(root: string, candidate: string): boolean {
  const rel = path.relative(root, candidate)
  return rel === '' || (!path.isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${path.sep}`))
}

interface DirectoryPin { file: string; fd: number; dev: number; ino: number }

function pinDirectory(file: string, privateOwnerOnly = false, uid = process.getuid?.() ?? -1): DirectoryPin {
  const before = fs.lstatSync(file)
  if (!before.isDirectory() || before.isSymbolicLink() || (uid >= 0 && before.uid !== uid)
      || (privateOwnerOnly && (before.mode & 0o077) !== 0)) throw new Error('unsafe upload directory')
  const noFollow = (fs.constants as any).O_NOFOLLOW ?? 0
  const directory = (fs.constants as any).O_DIRECTORY ?? 0
  const fd = fs.openSync(file, fs.constants.O_RDONLY | noFollow | directory)
  try {
    const opened = fs.fstatSync(fd)
    const named = fs.lstatSync(file)
    if (!opened.isDirectory() || (uid >= 0 && opened.uid !== uid)
        || (privateOwnerOnly && (opened.mode & 0o077) !== 0)
        || opened.dev !== before.dev || opened.ino !== before.ino
        || named.isSymbolicLink() || named.dev !== opened.dev || named.ino !== opened.ino) {
      throw new Error('upload directory changed')
    }
    return { file, fd, dev: opened.dev, ino: opened.ino }
  } catch (error) {
    fs.closeSync(fd)
    throw error
  }
}

function assertDirectoryPin(pin: DirectoryPin, privateOwnerOnly = false, uid = process.getuid?.() ?? -1): void {
  const opened = fs.fstatSync(pin.fd)
  const named = fs.lstatSync(pin.file)
  if (!opened.isDirectory() || (uid >= 0 && opened.uid !== uid)
      || (privateOwnerOnly && (opened.mode & 0o077) !== 0)
      || opened.dev !== pin.dev || opened.ino !== pin.ino || named.isSymbolicLink()
      || named.dev !== pin.dev || named.ino !== pin.ino) throw new Error('upload directory changed')
}

function closeDirectoryPin(pin: DirectoryPin | null | undefined): void {
  if (!pin) return
  try { fs.closeSync(pin.fd) } catch {}
}

function noSymlinkChain(file: string, allowRootOwnedAliases = false): boolean {
  const absolute = path.resolve(file)
  const parsed = path.parse(absolute)
  let cursor = parsed.root
  try {
    for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
      cursor = path.join(cursor, part)
      const info = fs.lstatSync(cursor)
      if (info.isSymbolicLink() && (!allowRootOwnedAliases || info.uid !== 0)) return false
    }
    return true
  } catch { return false }
}

function ensurePrivateStateDir(stateInput: string): DirectoryPin {
  const requested = path.resolve(stateInput)
  const requestedParsed = path.parse(requested)
  let requestedCursor = requestedParsed.root
  for (const part of requested.slice(requestedParsed.root.length).split(path.sep).filter(Boolean)) {
    requestedCursor = path.join(requestedCursor, part)
    try {
      const info = fs.lstatSync(requestedCursor)
      if (info.isSymbolicLink()) {
        if (info.uid !== 0 || !fs.statSync(requestedCursor).isDirectory()) throw new Error('unsafe upload key directory')
      } else if (!info.isDirectory()) throw new Error('unsafe upload key directory')
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error
      fs.mkdirSync(requestedCursor, { mode: 0o700 })
    }
  }
  const requestedInfo = fs.lstatSync(requested)
  if (!requestedInfo.isDirectory() || requestedInfo.isSymbolicLink()) throw new Error('unsafe upload key directory')
  const state = fs.realpathSync(requested)
  const parsed = path.parse(state)
  let cursor = parsed.root
  for (const part of state.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part)
    try {
      const info = fs.lstatSync(cursor)
      if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('unsafe upload key directory')
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error
      fs.mkdirSync(cursor, { mode: 0o700 })
    }
  }
  if (!noSymlinkChain(state)) throw new Error('unsafe upload key directory')
  return pinDirectory(state, true)
}

/** Existing path only: contain it under root and reject every symlink below the (possibly symlinked) root. */
function safeExisting(rootInput: string, candidateInput: string): string | null {
  let root: string
  try { root = canonicalRoot(rootInput) } catch { return null }
  const candidate = path.resolve(candidateInput)
  const lexicalRoot = path.resolve(rootInput)
  const base = isContained(lexicalRoot, candidate) ? lexicalRoot : isContained(root, candidate) ? root : null
  if (!base) return null
  const rel = path.relative(base, candidate)
  let cursor = root
  try {
    for (const part of rel.split(path.sep).filter(Boolean)) {
      if (part === '..') return null
      cursor = path.join(cursor, part)
      if (fs.lstatSync(cursor).isSymbolicLink()) return null
    }
    const real = fs.realpathSync(cursor)
    return isContained(root, real) ? real : null
  } catch {
    return null
  }
}

/** Create a fixed system-owned directory chain without ever walking through a child symlink. */
function ensureSystemDir(rootInput: string, ...parts: string[]): string {
  const root = canonicalRoot(rootInput)
  let cursor = root
  let parentPin: DirectoryPin | null = pinDirectory(root)
  try {
    for (const part of parts) {
      if (!part || part === '.' || part === '..' || part.includes('/') || part.includes('\\')) throw new Error('unsafe upload directory')
      assertDirectoryPin(parentPin)
      cursor = path.join(cursor, part)
      try { fs.mkdirSync(cursor, { mode: 0o700 }) } catch (error: any) {
        if (error?.code !== 'EEXIST') throw error
      }
      assertDirectoryPin(parentPin)
      const info = fs.lstatSync(cursor)
      if (!info.isDirectory() || info.isSymbolicLink() || info.uid !== (process.getuid?.() ?? info.uid)
          || !isContained(root, fs.realpathSync(cursor))) throw new Error('unsafe upload directory')
      const childPin = pinDirectory(cursor)
      closeDirectoryPin(parentPin); parentPin = childPin
    }
    return cursor
  } finally { closeDirectoryPin(parentPin) }
}

async function hashUniqueRegular(file: string, maxBytes = DATA_NEED_UPLOAD_MAX_BYTES): Promise<{ sha256: string; size: number }> {
  const before = fs.lstatSync(file, { bigint: true })
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1n || before.size <= 0n || before.size > BigInt(maxBytes)) {
    throw new Error('upload is not a unique regular file')
  }
  const noFollow = (fs.constants as any).O_NOFOLLOW ?? 0
  const handle = await fs.promises.open(file, fs.constants.O_RDONLY | noFollow)
  const digest = createHash('sha256')
  try {
    const opened = await handle.stat({ bigint: true })
    if (!opened.isFile() || opened.nlink !== 1n || opened.dev !== before.dev || opened.ino !== before.ino
        || opened.size !== before.size || opened.mtimeNs !== before.mtimeNs) throw new Error('upload changed before read')
    const chunk = Buffer.allocUnsafe(1024 * 1024)
    let position = 0
    while (position < Number(opened.size)) {
      const wanted = Math.min(chunk.length, Number(opened.size) - position)
      const { bytesRead } = await handle.read(chunk, 0, wanted, position)
      if (bytesRead <= 0) throw new Error('upload truncated during read')
      digest.update(chunk.subarray(0, bytesRead)); position += bytesRead
    }
    const extra = Buffer.allocUnsafe(1)
    if ((await handle.read(extra, 0, 1, position)).bytesRead !== 0) throw new Error('upload grew during read')
    const afterFd = await handle.stat({ bigint: true })
    const afterPath = fs.lstatSync(file, { bigint: true })
    for (const info of [afterFd, afterPath]) {
      if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1n || info.dev !== opened.dev || info.ino !== opened.ino
          || info.size !== opened.size || info.mtimeNs !== opened.mtimeNs) throw new Error('upload changed during read')
    }
    return { sha256: digest.digest('hex'), size: Number(opened.size) }
  } finally {
    await handle.close()
  }
}

function uniqueRegularBytes(file: string, maxBytes: number): Buffer | null {
  try {
    const info = fs.lstatSync(file)
    if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1 || info.size <= 0 || info.size > maxBytes) return null
    const noFollow = (fs.constants as any).O_NOFOLLOW ?? 0
    const fd = fs.openSync(file, fs.constants.O_RDONLY | noFollow)
    try {
      const opened = fs.fstatSync(fd)
      if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== info.dev || opened.ino !== info.ino || opened.size !== info.size) return null
      const bytes = Buffer.allocUnsafe(opened.size)
      let offset = 0
      while (offset < bytes.length) {
        const count = fs.readSync(fd, bytes, offset, bytes.length - offset, offset)
        if (count <= 0) return null
        offset += count
      }
      const after = fs.lstatSync(file)
      if (!after.isFile() || after.isSymbolicLink() || after.nlink !== 1 || after.dev !== opened.dev || after.ino !== opened.ino
          || after.size !== opened.size || after.mtimeMs !== opened.mtimeMs) return null
      return bytes
    } finally { fs.closeSync(fd) }
  } catch { return null }
}

function writeExclusiveFsync(file: string, bytes: Buffer | string, mode = 0o600): { dev: number; ino: number } {
  const fd = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, mode)
  let identity: { dev: number; ino: number } | null = null
  try {
    const opened = fs.fstatSync(fd)
    identity = { dev: opened.dev, ino: opened.ino }
    fs.writeFileSync(fd, bytes); fs.fsyncSync(fd)
    const after = fs.fstatSync(fd)
    if (!after.isFile() || after.dev !== identity.dev || after.ino !== identity.ino) throw new Error('exclusive upload write changed')
    return identity
  } catch (error) {
    try { fs.closeSync(fd) } catch {}
    try { unlinkIfIdentity(file, identity) } catch {}
    throw error
  } finally {
    try { fs.closeSync(fd) } catch {}
  }
}

function pathLexists(file: string): boolean {
  try { fs.lstatSync(file); return true } catch { return false }
}

function unlinkIfIdentity(file: string, identity: { dev: number; ino: number } | null): void {
  if (!identity) return
  try {
    const current = fs.lstatSync(file)
    if (current.dev !== identity.dev || current.ino !== identity.ino) throw new Error('temporary upload object changed')
    fs.unlinkSync(file)
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
}

export function dataNeedUploadKeyPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, 'data-need-upload.key')
}

function readIntentKey(keyFile: string): Buffer | null {
  let parentPin: DirectoryPin | null = null
  try {
    const requestedParent = path.dirname(path.resolve(keyFile))
    if (!noSymlinkChain(requestedParent, true)) return null
    const parentInfo = fs.lstatSync(requestedParent)
    if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink()) return null
    parentPin = pinDirectory(fs.realpathSync(requestedParent), true)
    assertDirectoryPin(parentPin, true)
    const info = fs.lstatSync(keyFile)
    if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1
        || info.uid !== (process.getuid?.() ?? info.uid) || (info.mode & 0o077) !== 0
        || (info.mode & 0o400) === 0) return null
    const bytes = uniqueRegularBytes(keyFile, 128)
    if (!bytes) return null
    assertDirectoryPin(parentPin, true)
    const text = bytes.toString('utf8')
    return /^[a-f0-9]{64}\n$/.test(text) ? Buffer.from(text.slice(0, 64), 'hex') : null
  } catch { return null }
  finally { closeDirectoryPin(parentPin) }
}

export function ensureDataNeedUploadKey(stateDir = STATE_DIR): { key: Buffer; file: string } {
  const state = path.resolve(stateDir)
  const statePin = ensurePrivateStateDir(state)
  const file = dataNeedUploadKeyPath(state)
  try {
    assertDirectoryPin(statePin, true)
    const existing = readIntentKey(file)
    if (existing) return { key: existing, file }
    if (pathLexists(file)) throw new Error('invalid upload intent key')
    const tmp = path.join(state, `.data-need-upload-key-${process.pid}-${randomBytes(8).toString('hex')}`)
    let tmpIdentity: { dev: number; ino: number } | null = null
    try {
      assertDirectoryPin(statePin, true)
      tmpIdentity = writeExclusiveFsync(tmp, `${randomBytes(32).toString('hex')}\n`, 0o600)
      assertDirectoryPin(statePin, true)
      try { fs.linkSync(tmp, file) } catch (error: any) {
        if (error?.code !== 'EEXIST') throw error
      }
      assertDirectoryPin(statePin, true)
    } finally {
      try { unlinkIfIdentity(tmp, tmpIdentity) } catch {}
    }
    const key = readIntentKey(file)
    if (!key) throw new Error('could not establish upload intent key')
    return { key, file }
  } finally {
    closeDirectoryPin(statePin)
  }
}

function readPrivatePinnedFile(pin: DirectoryPin, name: string, maxBytes: number, uid: number): Buffer | null {
  if (!name || name.includes('/') || name.includes('\\')) return null
  const file = path.join(pin.file, name)
  try {
    assertDirectoryPin(pin, true, uid)
    const info = fs.lstatSync(file)
    if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1 || info.uid !== uid
        || (info.mode & 0o077) !== 0 || (info.mode & 0o400) === 0
        || info.size <= 0 || info.size > maxBytes) return null
    const bytes = uniqueRegularBytes(file, maxBytes)
    assertDirectoryPin(pin, true, uid)
    return bytes
  } catch { return null }
}

/**
 * Fail-closed authority check for the dedicated manual-upload writer. The route must call this before
 * iterating `req.parts()`: a cockpit on an admin/non-writer host must never consume bytes or mint an HMAC
 * that the durable doer cannot verify.
 */
export function manualDataNeedUploadWriterReady(options: DataNeedUploadWriterOptions = {}): boolean {
  const uid = options.uid ?? process.getuid?.()
  if (uid === undefined || uid < 0) return false
  const repoRoot = path.resolve(options.repoRoot ?? REPO_ROOT)
  const dataLink = path.resolve(options.dataDir ?? DATA_DIR)
  if (dataLink !== path.join(repoRoot, 'data')) return false
  const localHost = options.hostname ?? os.hostname()
  if (!HOST_RE.test(localHost)) return false
  const opsPath = path.join(path.resolve(options.homeDir ?? os.homedir()), '.nostra-ops')
  let ops: DirectoryPin | null = null
  try {
    if (!noSymlinkChain(opsPath)) return false
    ops = pinDirectory(opsPath, true, uid)
    if (!readPrivatePinnedFile(ops, 'role', 32, uid)?.equals(Buffer.from('doer\n'))) return false
    if (!readPrivatePinnedFile(ops, 'connector-writer-host', 512, uid)?.equals(Buffer.from(`${localHost}\n`))) return false
    const poolBytes = readPrivatePinnedFile(ops, 'pool-root', 4096, uid)
    if (!poolBytes) return false
    const poolText = poolBytes.toString('utf8')
    if (!poolText.endsWith('\n') || poolText.slice(0, -1).includes('\n') || poolText.includes('\0')) return false
    const poolRoot = poolText.slice(0, -1)
    if (!path.isAbsolute(poolRoot) || path.resolve(poolRoot) !== poolRoot || fs.realpathSync(poolRoot) !== poolRoot) return false
    const poolBefore = fs.lstatSync(poolRoot)
    if (!poolBefore.isDirectory() || poolBefore.isSymbolicLink() || poolBefore.uid !== uid) return false
    const poolPin = pinDirectory(poolRoot, false, uid)
    try {
      const linkBefore = fs.lstatSync(dataLink)
      if (!linkBefore.isSymbolicLink() || linkBefore.uid !== uid || fs.realpathSync(dataLink) !== poolRoot) return false
      const linked = fs.statSync(dataLink)
      const linkAfter = fs.lstatSync(dataLink)
      if (linkBefore.dev !== linkAfter.dev || linkBefore.ino !== linkAfter.ino
          || linkBefore.mode !== linkAfter.mode || linkBefore.mtimeMs !== linkAfter.mtimeMs
          || linked.dev !== poolPin.dev || linked.ino !== poolPin.ino) return false
      assertDirectoryPin(ops, true, uid)
      assertDirectoryPin(poolPin, false, uid)
      return true
    } finally { closeDirectoryPin(poolPin) }
  } catch { return false }
  finally { closeDirectoryPin(ops) }
}

/** Stream one multipart file into the router-hidden staging lane. No request becomes visible here. */
export async function receiveDataNeedUploadFile(
  stream: Readable & { truncated?: boolean }, rawFilename: string, mimetype: string,
  storage: DataNeedUploadStorage = {},
): Promise<ReceivedDataNeedUpload> {
  const safe = sanitizeUploadFilename(rawFilename)
  if (!safe.ok) throw new Error(safe.reason)
  if (!safeManualFilename(safe.name)) throw new Error('filename is too long for routed provenance')
  const dataDir = storage.dataDir ?? DATA_DIR
  const inbox = ensureSystemDir(dataDir, 'EXTERNAL-INBOX')
  const staging = ensureSystemDir(inbox, DATA_NEED_UPLOAD_STAGING_DIR)
  const stagingPin = pinDirectory(staging)
  const temp = path.join(staging, `${process.pid}-${randomBytes(16).toString('hex')}.payload`)
  let handle: fs.promises.FileHandle | null = null
  let tempIdentity: { dev: number; ino: number } | null = null
  const digest = createHash('sha256')
  let size = 0
  try {
    assertDirectoryPin(stagingPin)
    handle = await fs.promises.open(temp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, 0o600)
    const openedTemp = await handle.stat(); tempIdentity = { dev: openedTemp.dev, ino: openedTemp.ino }
    assertDirectoryPin(stagingPin)
    for await (const raw of stream) {
      const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw)
      size += chunk.length
      if (size > DATA_NEED_UPLOAD_MAX_BYTES) throw new Error('file exceeds the upload size limit')
      digest.update(chunk)
      let offset = 0
      while (offset < chunk.length) {
        const { bytesWritten } = await handle.write(chunk, offset, chunk.length - offset, null)
        if (bytesWritten <= 0) throw new Error('short upload write')
        offset += bytesWritten
      }
    }
    await handle.sync()
    await handle.close(); handle = null
    assertDirectoryPin(stagingPin)
    if (stream.truncated) throw new Error('file exceeds the upload size limit')
    if (size === 0) throw new Error('empty files are not accepted')
    const checked = await hashUniqueRegular(temp)
    const sha256 = digest.digest('hex')
    if (checked.size !== size || checked.sha256 !== sha256) throw new Error('upload changed while staging')
    assertDirectoryPin(stagingPin)
    const finalInfo = fs.lstatSync(temp)
    tempIdentity = { dev: finalInfo.dev, ino: finalInfo.ino }
    return {
      temp_path: temp, filename: safe.name, mimetype: String(mimetype || 'application/octet-stream').slice(0, 200),
      size, sha256, file_dev: finalInfo.dev, file_ino: finalInfo.ino,
    }
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    try { assertDirectoryPin(stagingPin); unlinkIfIdentity(temp, tempIdentity); assertDirectoryPin(stagingPin) } catch {}
    throw error
  } finally { closeDirectoryPin(stagingPin) }
}

export function discardReceivedDataNeedUpload(received: ReceivedDataNeedUpload | null | undefined): void {
  if (!received) return
  try { unlinkIfIdentity(received.temp_path, { dev: received.file_dev, ino: received.file_ino }) } catch {}
}

let lastRequestOrder = 0n
function newRequestId(storage: DataNeedUploadStorage): string {
  if (storage.requestId) return storage.requestId()
  const candidate = BigInt(Date.now()) * 1_000_000n + (process.hrtime.bigint() % 1_000_000n)
  lastRequestOrder = candidate > lastRequestOrder ? candidate : lastRequestOrder + 1n
  return `DNU-${lastRequestOrder.toString(16).padStart(16, '0').slice(-16)}${randomBytes(8).toString('hex')}`
}

/**
 * Commit a received file into a reserved request envelope. `beforeCommit` is the endpoint's terminal
 * compare-and-set: it must re-read readDataNeeds and throw if the selected decision/need is no longer exact.
 */
export async function commitDataNeedUpload(
  received: ReceivedDataNeedUpload,
  input: CommitDataNeedUploadInput,
  beforeCommit: () => void | Promise<void>,
  storage: DataNeedUploadStorage = {},
): Promise<{ request_id: string; key_file: string }> {
  if (!validIdentity(input) || !plain(input.provider, 200)
      || !plain(input.requested_by, 320) || normalizeDataNeedSourceUrl(input.source_url) !== input.source_url) {
    throw new Error('invalid data-need upload binding')
  }
  if (!['server_lookup_public_dns', 'user_supplied_unverified', 'absent'].includes(input.source_url_basis)
      || ((input.source_url === null) !== (input.source_url_basis === 'absent'))) throw new Error('invalid source URL basis')
  const safe = sanitizeUploadFilename(received.filename)
  if (!safe.ok || safe.name !== received.filename || !safeManualFilename(received.filename) || !SHA256_RE.test(received.sha256)
      || !Number.isSafeInteger(received.size) || received.size <= 0 || received.size > DATA_NEED_UPLOAD_MAX_BYTES
      || !Number.isSafeInteger(received.file_dev) || !Number.isSafeInteger(received.file_ino)) {
    throw new Error('invalid received upload')
  }
  const dataDir = storage.dataDir ?? DATA_DIR
  const inbox = ensureSystemDir(dataDir, 'EXTERNAL-INBOX')
  const staging = ensureSystemDir(inbox, DATA_NEED_UPLOAD_STAGING_DIR)
  const active = ensureSystemDir(inbox, DATA_NEED_UPLOAD_ACTIVE_DIR)
  const stagingPin = pinDirectory(staging)
  const activePin = pinDirectory(active)
  const safeTemp = safeExisting(staging, received.temp_path)
  try {
    assertDirectoryPin(stagingPin); assertDirectoryPin(activePin)
    if (!safeTemp || path.dirname(safeTemp) !== canonicalRoot(staging)) throw new Error('received upload escaped staging')
    const tempInfo = fs.lstatSync(safeTemp)
    if (tempInfo.dev !== received.file_dev || tempInfo.ino !== received.file_ino) throw new Error('received upload identity changed')
    const checked = await hashUniqueRegular(safeTemp)
    if (checked.size !== received.size || checked.sha256 !== received.sha256) throw new Error('received upload changed before commit')

    const requestId = newRequestId(storage)
    if (!REQUEST_ID_RE.test(requestId)) throw new Error('invalid generated upload request id')
    const requestDir = path.join(active, requestId)
    let requestPin: DirectoryPin | null = null
    let payload = ''
    let intentTmp = ''
    let intentFile = ''
    let payloadMoved = false
    let created = false
    let payloadIdentity: { dev: number; ino: number } | null = {
      dev: received.file_dev, ino: received.file_ino,
    }
    let intentTmpIdentity: { dev: number; ino: number } | null = null
    let intentFileIdentity: { dev: number; ino: number } | null = null
    try {
      assertDirectoryPin(activePin)
      try { fs.mkdirSync(requestDir, { mode: 0o700 }); created = true } catch (error: any) {
        if (error?.code === 'EEXIST') throw new Error('upload request collision')
        throw error
      }
      assertDirectoryPin(activePin)
      requestPin = pinDirectory(requestDir, true)
      const { key, file: keyFile } = ensureDataNeedUploadKey(storage.stateDir ?? STATE_DIR)
      const stagedAt = (storage.now ?? (() => new Date()))().toISOString()
      if (!validIso(stagedAt)) throw new Error('invalid upload timestamp')
      const base: Omit<UploadIntent, 'signature'> = {
        contract_version: INTENT_CONTRACT, request_id: requestId, ...input,
        filename: received.filename, payload_sha256: received.sha256,
        payload_size: received.size, staged_at: stagedAt,
      }
      payload = path.join(requestDir, 'payload')
      intentTmp = path.join(requestDir, '.intent.tmp')
      intentFile = path.join(requestDir, 'intent.json')
      assertDirectoryPin(stagingPin); assertDirectoryPin(requestPin)
      fs.renameSync(safeTemp, payload); payloadMoved = true
      assertDirectoryPin(stagingPin); assertDirectoryPin(requestPin)
      const moved = await hashUniqueRegular(payload)
      if (moved.size !== received.size || moved.sha256 !== received.sha256) throw new Error('payload changed during envelope publication')
      await beforeCommit()
      const intent: UploadIntent = { ...base, signature: signatureFor(base as any, key) }
      assertDirectoryPin(requestPin)
      intentTmpIdentity = writeExclusiveFsync(intentTmp, `${JSON.stringify(intent, null, 2)}\n`)
      assertDirectoryPin(requestPin)
      fs.renameSync(intentTmp, intentFile)
      intentFileIdentity = intentTmpIdentity
      intentTmpIdentity = null
      assertDirectoryPin(requestPin)
      fs.fsyncSync(requestPin.fd)
      return { request_id: requestId, key_file: keyFile }
    } catch (error) {
      if (requestPin) {
        try { assertDirectoryPin(requestPin); if (intentTmp) unlinkIfIdentity(intentTmp, intentTmpIdentity) } catch {}
        try { assertDirectoryPin(requestPin); if (intentFile) unlinkIfIdentity(intentFile, intentFileIdentity) } catch {}
        try { assertDirectoryPin(requestPin); if (payloadMoved && payload) unlinkIfIdentity(payload, payloadIdentity) } catch {}
      }
      closeDirectoryPin(requestPin); requestPin = null
      if (created) { try { assertDirectoryPin(activePin); fs.rmdirSync(requestDir); assertDirectoryPin(activePin) } catch {} }
      throw error
    } finally { closeDirectoryPin(requestPin) }
  } finally { closeDirectoryPin(stagingPin); closeDirectoryPin(activePin) }
}

function parseSignedIntent(dir: string, key: Buffer): { intent: UploadIntent; bytes: Buffer; intentSha: string } | null {
  const bytes = uniqueRegularBytes(path.join(dir, 'intent.json'), 32 * 1024)
  if (!bytes) return null
  try {
    const value = JSON.parse(bytes.toString('utf8'))
    if (!validIntent(value, key) || value.request_id !== path.basename(dir)) return null
    return { intent: value, bytes, intentSha: createHash('sha256').update(bytes).digest('hex') }
  } catch { return null }
}

function parseSignedResult(dir: string, key: Buffer): UploadResult | null {
  const bytes = uniqueRegularBytes(path.join(dir, 'result.json'), 16 * 1024)
  if (!bytes) return null
  try {
    const value = JSON.parse(bytes.toString('utf8'))
    return validResult(value, key) && value.request_id === path.basename(dir) ? value : null
  } catch { return null }
}

function exactContext(sidecar: Record<string, any>, intent: UploadIntent, intentSha: string): boolean {
  const context = sidecar.request_context
  return !!context && typeof context === 'object' && !Array.isArray(context)
    && context.contract_version === CONTEXT_CONTRACT && context.request_id === intent.request_id
    && context.subject === intent.subject && context.swarm === intent.swarm && context.run_root === intent.run_root
    && context.decision_fingerprint === intent.decision_fingerprint && context.need_id === intent.need_id
    && context.series === intent.series && context.source_url === intent.source_url
    && context.source_url_basis === intent.source_url_basis
    && context.provider_basis === 'operator_supplied_unverified'
    && context.staged_at === intent.staged_at && context.requested_by === intent.requested_by
    && sidecar.upload_intent_sha256 === intentSha && sidecar.provider === intent.provider
}

function verifyRoutedResult(result: UploadResult, intent: UploadIntent, intentSha: string, dataDir: string): boolean {
  if (result.status !== 'routed_provenance_verified' || !result.routed_path
      || result.request_id !== intent.request_id || result.intent_sha256 !== intentSha
      || result.payload_sha256 !== intent.payload_sha256) return false
  const rel = result.routed_path.slice('data/'.length)
  if (!rel || rel.split('/').includes('..') || rel.includes('\\')) return false
  const payload = safeExisting(dataDir, path.join(dataDir, ...rel.split('/')))
  if (!payload) return false
  const bytes = uniqueRegularBytes(payload, DATA_NEED_UPLOAD_MAX_BYTES)
  if (!bytes || bytes.length !== intent.payload_size || createHash('sha256').update(bytes).digest('hex') !== intent.payload_sha256) return false
  const sidecarPath = safeExisting(dataDir, `${payload}.source.json`)
  if (!sidecarPath) return false
  const sidecarBytes = uniqueRegularBytes(sidecarPath, 128 * 1024)
  if (!sidecarBytes) return false
  if (!result.sidecar_sha256 || createHash('sha256').update(sidecarBytes).digest('hex') !== result.sidecar_sha256) return false
  try {
    const sidecar = JSON.parse(sidecarBytes.toString('utf8'))
    return !!sidecar && typeof sidecar === 'object' && !Array.isArray(sidecar)
      && sidecar.sha256 === intent.payload_sha256 && sidecar.routed_by === 'ingest_external.py'
      && Array.isArray(sidecar.tickers) && sidecar.tickers.length === 1 && sidecar.tickers[0] === intent.subject
      && exactContext(sidecar, intent, intentSha)
  } catch { return false }
}

function queryMatches(intent: UploadIntent, query: DataNeedUploadIdentity): boolean {
  return intent.subject === query.subject && intent.swarm === query.swarm && intent.run_root === query.run_root
    && intent.decision_fingerprint === query.decision_fingerprint && intent.need_id === query.need_id
    && intent.series === query.series
}

function requestDirs(root: string, lane: string): string[] {
  try {
    const safeLane = safeExisting(root, lane)
    if (!safeLane) return []
    return fs.readdirSync(safeLane, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && REQUEST_ID_RE.test(entry.name))
      .map((entry) => path.join(safeLane, entry.name))
  } catch { return [] }
}

/** Durable status keyed by the exact immutable decision + need identity. Absolute paths never escape. */
export function readDataNeedUploadStatus(
  query: DataNeedUploadIdentity,
  storage: DataNeedUploadStorage = {},
): DataNeedUploadRead {
  const base: DataNeedUploadRead = { contract_version: DATA_NEED_UPLOAD_CONTRACT, ...query, status: 'none', items: [] }
  if (!validIdentity(query)) return base
  const dataDir = storage.dataDir ?? DATA_DIR
  const key = readIntentKey(dataNeedUploadKeyPath(storage.stateDir ?? STATE_DIR))
  if (!key) return base
  const inbox = safeExisting(dataDir, path.join(dataDir, 'EXTERNAL-INBOX'))
  if (!inbox) return base
  try { if (!fs.lstatSync(inbox).isDirectory()) return base } catch { return base }
  const active = path.join(inbox, DATA_NEED_UPLOAD_ACTIVE_DIR)
  const archived = path.join(inbox, DATA_NEED_UPLOAD_ARCHIVE_DIR)
  const states = new Map<string, { rank: number; item: DataNeedUploadItem; status: DataNeedUploadStatus }>()

  const consider = (dir: string, isArchive: boolean) => {
    const parsed = parseSignedIntent(dir, key)
    if (!parsed || !queryMatches(parsed.intent, query)) return
    const { intent, intentSha } = parsed
    const item: DataNeedUploadItem = { request_id: intent.request_id, filename: intent.filename, sha256: intent.payload_sha256, staged_at: intent.staged_at }
    const result = parseSignedResult(dir, key)
    let status: DataNeedUploadStatus = 'failed_tampered'
    let rank = 1
    if (result) {
      if (result.intent_sha256 !== intentSha || result.payload_sha256 !== intent.payload_sha256) {
        item.reason = 'tampered_request'
      } else if (result.status === 'failed_tampered') {
        item.reason = result.reason ?? 'routing_failed'
        rank = 2
      } else if (result.status === 'rejected_policy') {
        status = 'rejected_policy'; item.reason = 'policy_rejected'; rank = 2
      } else if (verifyRoutedResult(result, intent, intentSha, dataDir)) {
        status = 'routed_provenance_verified'; item.routed_path = result.routed_path!; rank = 4
      } else {
        item.reason = 'tampered_request'; rank = 2
      }
    } else if (!isArchive) {
      let names: string[] = []
      try { names = fs.readdirSync(dir).sort() } catch {}
      const payload = uniqueRegularBytes(path.join(dir, 'payload'), DATA_NEED_UPLOAD_MAX_BYTES)
      if (names.length === 2 && names[0] === 'intent.json' && names[1] === 'payload' && payload
          && payload.length === intent.payload_size && createHash('sha256').update(payload).digest('hex') === intent.payload_sha256) {
        status = 'staged_waiting'; rank = 3
      } else {
        item.reason = names.length === 0 ? 'malformed_request' : 'tampered_request'
      }
    } else {
      item.reason = 'malformed_request'
    }
    const prior = states.get(intent.request_id)
    if (!prior || rank > prior.rank) states.set(intent.request_id, { rank, item, status })
  }

  // An archived, signed result outranks its still-present active copy after a router crash. The map makes
  // replay/partial-cleanup idempotent without ever treating two pathnames as two uploads.
  for (const dir of requestDirs(inbox, active)) consider(dir, false)
  for (const dir of requestDirs(inbox, archived)) consider(dir, true)
  const ordered = [...states.values()].sort((a, b) => {
    const byTime = a.item.staged_at.localeCompare(b.item.staged_at)
    return byTime || a.item.request_id.localeCompare(b.item.request_id)
  })
  base.items = ordered.map((entry) => entry.item)
  if (ordered.length) base.status = ordered[ordered.length - 1].status
  return base
}

/** Best-effort, bounded nudge of the existing sole publisher. Its singleton lock arbitrates with the timer. */
export async function triggerDataNeedUploadRouter(
  requestId: string,
  storage: DataNeedUploadStorage & { keyFile?: string; timeoutMs?: number } = {},
): Promise<boolean> {
  if (!REQUEST_ID_RE.test(requestId)) return false
  const repoRoot = storage.repoRoot ?? REPO_ROOT
  const dataDir = storage.dataDir ?? DATA_DIR
  const keyFile = storage.keyFile ?? dataNeedUploadKeyPath(storage.stateDir ?? STATE_DIR)
  if (!manualDataNeedUploadWriterReady({ repoRoot, dataDir })) return false
  try {
    await execFileAsync('python3', [
      path.join(repoRoot, '.claude', 'tools', 'ingest_external.py'), '--pool', dataDir,
      '--manual-request', requestId, '--intent-key', keyFile,
    ], { cwd: repoRoot, timeout: storage.timeoutMs ?? 6000, maxBuffer: 512 * 1024 })
    return true
  } catch {
    // The timer uses the same script + singleton lock and will recover a fully committed envelope.
    return false
  }
}
