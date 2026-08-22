import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execa } from 'execa'

const YTDLP_VERSION = '2026.08.19'
const YTDLP_MAX_BYTES = 100 * 1024 * 1024
const PROVIDER_MAX_BYTES = 4 * 1024 * 1024
const DOWNLOAD_HOSTS = new Set(['github.com', 'release-assets.githubusercontent.com', 'objects.githubusercontent.com'])
const YTDLP_SHA256: Record<string, string> = {
  'yt-dlp.exe': '66674953fe251b89f4d08c5f0e35e0728679bd67ab3d7d05c0562af101dd3e7a',
  'yt-dlp_linux': '58162f9bfdc27458ea47bfcb311cf47028f17d8154a8bf7d689861d46399230a',
  'yt-dlp_linux_aarch64': 'b16e4dab368a816cd05d477d698a605a6ae87ccee1c8ffd38fa21d7254141fcc',
  'yt-dlp_macos': '0f192b7ec147ab6288885d6351d9ab67367640029b4377576ef46dd79cf7b202',
  'yt-dlp_x86.exe': 'a8f91bd41452506bc81ebd2f369b186fea0ee7075413ba00cef9fd346a0a5d0c',
}
export interface YtDlpInstallSpec {
  version: string
  hashes: Record<string, string>
  maxBytes: number
}
const DEFAULT_YTDLP_INSTALL: YtDlpInstallSpec = {
  version: YTDLP_VERSION,
  hashes: YTDLP_SHA256,
  maxBytes: YTDLP_MAX_BYTES,
}
const DEFAULT_MAX_SECONDS = 20 * 60
// Groq's direct multipart attachment limit is 25 MB. Keep payload plus multipart overhead below it.
const DEFAULT_MAX_BYTES = 23 * 1024 * 1024
const DEFAULT_MODEL = 'whisper-large-v3-turbo'
const STALE_TEMP_AGE_MS = 6 * 60 * 60 * 1000

export class ReelTranscriptError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ReelTranscriptError'
  }
}

export interface ReelTranscriptResult {
  transcript: string
  sourceUrl: string
  title: string | null
  author: string | null
  durationSeconds: number | null
  language: string | null
}

export type ReelTranscriptProgressStep =
  | 'validate-link'
  | 'prepare-runtime'
  | 'inspect-reel'
  | 'download-media'
  | 'check-media'
  | 'transcribe-speech'
  | 'prepare-output'
  | 'clean-up'

export interface ReelTranscriptProgressEvent {
  step: ReelTranscriptProgressStep
  status: 'running' | 'complete' | 'failed' | 'warning'
  elapsedMs: number
  stepElapsedMs?: number
  detail?: {
    sourceUrl?: string
    title?: string | null
    author?: string | null
    durationSeconds?: number | null
    bytes?: number
    maxSeconds?: number
    maxBytes?: number
    language?: string | null
    transcriptCharacters?: number
    mediaRemoved?: boolean
  }
}

export interface ReelTranscriptConfig {
  stateDir: string
  groqApiKey: string
  groqBaseUrl?: string
  model?: string
  ytDlpPath?: string
  maxSeconds?: number
  maxBytes?: number
}

interface CommandResult {
  exitCode: number
  stdout: string
  stderr: string
}

export interface ReelTranscriptDeps {
  fetchFn?: typeof fetch
  run?: (binary: string, args: string[], signal?: AbortSignal) => Promise<CommandResult>
  ensureBinary?: (config: ReelTranscriptConfig, fetchFn: typeof fetch, signal?: AbortSignal) => Promise<string>
  signal?: AbortSignal
  onProgress?: (event: ReelTranscriptProgressEvent) => void
}

let binaryInstall: Promise<string> | null = null
let staleTempPurge: Promise<void> | null = null

function ytdlpAssetName(): string {
  if (process.platform === 'darwin') return 'yt-dlp_macos'
  if (process.platform === 'win32') return process.arch === 'ia32' ? 'yt-dlp_x86.exe' : 'yt-dlp.exe'
  if (process.platform === 'linux') {
    if (process.arch === 'arm64') return 'yt-dlp_linux_aarch64'
    if (process.arch === 'x64') return 'yt-dlp_linux'
  }
  throw new ReelTranscriptError(
    `Reel transcription is not available on ${process.platform}/${process.arch}.`,
    'reel-runtime-unsupported',
    503,
  )
}

async function requireOk(response: Response, label: string): Promise<Response> {
  if (response.ok) return response
  throw new ReelTranscriptError(`${label} could not be downloaded. Try again.`, 'reel-runtime-unavailable', 503)
}

function abortFailure(signal: AbortSignal): ReelTranscriptError {
  const reason = signal.reason
  if (reason instanceof ReelTranscriptError) return reason
  if (reason instanceof DOMException && reason.name === 'TimeoutError') {
    return new ReelTranscriptError('The Reel took too long to transcribe. Try again.', 'transcription-timeout', 504)
  }
  return new ReelTranscriptError('Reel transcription was cancelled.', 'transcription-cancelled', 499)
}

function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortFailure(signal)
}

async function readLimited(
  response: Response,
  maxBytes: number,
  label: string,
  code = 'reel-runtime-unavailable',
  statusCode = 503,
): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel().catch(() => undefined)
    throw new ReelTranscriptError(`${label} returned too much data.`, code, statusCode)
  }
  if (!response.body) return Buffer.alloc(0)
  const reader = response.body.getReader()
  const chunks: Buffer[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined)
      throw new ReelTranscriptError(`${label} returned too much data.`, code, statusCode)
    }
    chunks.push(Buffer.from(value))
  }
  return Buffer.concat(chunks, total)
}

async function fetchPinnedBinary(
  fetchFn: typeof fetch,
  assetName: string,
  version: string,
  signal: AbortSignal,
): Promise<Response> {
  let current = new URL(`https://github.com/yt-dlp/yt-dlp/releases/download/${version}/${assetName}`)
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    checkAbort(signal)
    if (current.protocol !== 'https:' || !DOWNLOAD_HOSTS.has(current.hostname)) {
      throw new ReelTranscriptError('The Reel downloader redirected somewhere unexpected.', 'reel-runtime-unavailable', 503)
    }
    const response = await fetchFn(current, {
      headers: { 'User-Agent': 'Nostra-Reel-Transcript' },
      redirect: 'manual',
      signal,
    })
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) break
      current = new URL(location, current)
      continue
    }
    return requireOk(response, 'The Reel downloader')
  }
  throw new ReelTranscriptError('The Reel downloader redirected too many times.', 'reel-runtime-unavailable', 503)
}

async function purgeStaleInstallTemps(toolsDir: string, binaryName: string): Promise<void> {
  const cutoff = Date.now() - STALE_TEMP_AGE_MS
  const entries = await fs.promises.readdir(toolsDir, { withFileTypes: true }).catch(() => [])
  await Promise.all(entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(`${binaryName}.`) && entry.name.endsWith('.tmp'))
    .map(async (entry) => {
      const target = path.join(toolsDir, entry.name)
      const stat = await fs.promises.stat(target).catch(() => null)
      if (stat && stat.mtimeMs < cutoff) await fs.promises.rm(target, { force: true }).catch(() => undefined)
    }))
}

export async function ensureYtDlpBinary(
  config: ReelTranscriptConfig,
  fetchFn: typeof fetch = fetch,
  signal?: AbortSignal,
  install: YtDlpInstallSpec = DEFAULT_YTDLP_INSTALL,
): Promise<string> {
  checkAbort(signal)
  if (config.ytDlpPath) {
    try {
      await fs.promises.access(config.ytDlpPath, fs.constants.X_OK)
      return config.ytDlpPath
    } catch {
      throw new ReelTranscriptError('The configured Reel downloader is unavailable.', 'reel-runtime-unavailable', 503)
    }
  }

  const toolsDir = path.join(config.stateDir, 'tools')
  const binaryPath = path.join(toolsDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
  const assetName = ytdlpAssetName()
  const wanted = install.hashes[assetName]
  if (!wanted) throw new ReelTranscriptError('This Reel downloader build is unsupported.', 'reel-runtime-unavailable', 503)
  try {
    const cached = await fs.promises.readFile(binaryPath)
    const actual = createHash('sha256').update(cached).digest('hex')
    if (actual === wanted) {
      await fs.promises.access(binaryPath, fs.constants.X_OK)
      return binaryPath
    }
  } catch {
    // A missing or invalid cache is replaced below with the pinned, reviewed release.
  }

  if (binaryInstall) return binaryInstall
  binaryInstall = (async () => {
    try {
      await fs.promises.mkdir(toolsDir, { recursive: true })
      await purgeStaleInstallTemps(toolsDir, path.basename(binaryPath))
      const installSignal = AbortSignal.timeout(30_000)
      const binaryResponse = await fetchPinnedBinary(fetchFn, assetName, install.version, installSignal)
      const bytes = await readLimited(binaryResponse, install.maxBytes, 'The Reel downloader')
      const actual = createHash('sha256').update(bytes).digest('hex')
      if (actual !== wanted) {
        throw new ReelTranscriptError('The Reel downloader failed its security check.', 'reel-runtime-unavailable', 503)
      }

      const temporaryPath = `${binaryPath}.${process.pid}.tmp`
      try {
        await fs.promises.writeFile(temporaryPath, bytes, { mode: 0o755 })
        await fs.promises.chmod(temporaryPath, 0o755)
        await fs.promises.rename(temporaryPath, binaryPath)
      } finally {
        await fs.promises.rm(temporaryPath, { force: true }).catch(() => undefined)
      }
      return binaryPath
    } catch (cause) {
      if (cause instanceof ReelTranscriptError) throw cause
      throw new ReelTranscriptError('The Reel downloader could not be installed. Try again.', 'reel-runtime-unavailable', 503)
    }
  })()

  try {
    return await binaryInstall
  } finally {
    binaryInstall = null
  }
}

export function normalizeInstagramReelUrl(input: string): string {
  let parsed: URL
  try {
    parsed = new URL(input.trim())
  } catch {
    throw new ReelTranscriptError('Paste a complete Instagram Reel link.', 'invalid-reel-url', 400)
  }
  const host = parsed.hostname.toLowerCase()
  if (parsed.protocol !== 'https:' || !['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(host)) {
    throw new ReelTranscriptError('Paste an Instagram Reel link.', 'invalid-reel-url', 400)
  }
  // Instagram uses both `/reel/<id>/` (share links) and `/reels/<id>/` (desktop URLs)
  // for the same media. Accept either spelling, then collapse both to one query-free canonical URL.
  const match = parsed.pathname.match(/^\/reels?\/([A-Za-z0-9_-]+)\/?$/)
  if (!match) throw new ReelTranscriptError('This does not look like an Instagram Reel link.', 'invalid-reel-url', 400)
  return `https://www.instagram.com/reel/${match[1]}/`
}

async function defaultRun(binary: string, args: string[], signal?: AbortSignal): Promise<CommandResult> {
  checkAbort(signal)
  const safeEnv: Record<string, string> = {
    PATH: process.env.PATH || (process.platform === 'win32' ? '' : '/usr/bin:/bin'),
    LANG: process.env.LANG || 'C.UTF-8',
  }
  for (const name of ['SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'TMPDIR', 'USERPROFILE']) {
    const value = process.env[name]
    if (value) safeEnv[name] = value
  }
  let result
  try {
    result = await execa(binary, args, {
      reject: false,
      timeout: 90_000,
      cancelSignal: signal,
      maxBuffer: 4 * 1024 * 1024,
      extendEnv: false,
      env: safeEnv,
    })
  } catch (cause) {
    if (signal?.aborted) throw abortFailure(signal)
    throw cause
  }
  return {
    exitCode: result.exitCode ?? 1,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
  }
}

function unavailableReel(detail: string): ReelTranscriptError {
  const lower = detail.toLowerCase()
  if (lower.includes('login required') || lower.includes('requested content is not available') || lower.includes('private')) {
    return new ReelTranscriptError(
      'Instagram could not open this Reel. It may be private, removed, or require a signed-in Instagram session.',
      'reel-unavailable',
      422,
    )
  }
  return new ReelTranscriptError('Instagram could not fetch this Reel. Try the link again.', 'reel-fetch-failed', 502)
}

async function runInstagram(
  run: (binary: string, args: string[], signal?: AbortSignal) => Promise<CommandResult>,
  binary: string,
  args: string[],
  signal?: AbortSignal,
): Promise<CommandResult> {
  const result = await run(binary, args, signal)
  if (result.exitCode !== 0) throw unavailableReel(`${result.stderr}\n${result.stdout}`)
  return result
}

function mediaMime(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.m4a') return 'audio/mp4'
  if (ext === '.mp3') return 'audio/mpeg'
  if (ext === '.wav') return 'audio/wav'
  if (ext === '.ogg' || ext === '.oga') return 'audio/ogg'
  if (ext === '.webm') return 'audio/webm'
  return 'video/mp4'
}

// Instagram sometimes omits `duration` from extractor metadata. Its downloadable media is MP4/M4A, so
// verify the movie-header timescale locally before any provider upload instead of dropping the limit.
export function mp4DurationSeconds(bytes: Buffer): number | null {
  const containers = new Set(['moov', 'trak', 'mdia'])
  const walk = (start: number, end: number): number | null => {
    let offset = start
    while (offset + 8 <= end) {
      let size = bytes.readUInt32BE(offset)
      const type = bytes.toString('ascii', offset + 4, offset + 8)
      let headerBytes = 8
      if (size === 1) {
        if (offset + 16 > end) return null
        const large = bytes.readBigUInt64BE(offset + 8)
        if (large > BigInt(Number.MAX_SAFE_INTEGER)) return null
        size = Number(large)
        headerBytes = 16
      } else if (size === 0) {
        size = end - offset
      }
      if (size < headerBytes || offset + size > end) return null
      const payload = offset + headerBytes
      if (type === 'mvhd') {
        if (payload + 20 > offset + size) { offset += size; continue }
        const version = bytes[payload]
        const timescaleOffset = payload + (version === 1 ? 20 : 12)
        const durationOffset = payload + (version === 1 ? 24 : 16)
        const required = version === 1 ? 8 : 4
        if ((version !== 0 && version !== 1) || durationOffset + required > offset + size) { offset += size; continue }
        const timescale = bytes.readUInt32BE(timescaleOffset)
        const duration = version === 1 ? Number(bytes.readBigUInt64BE(durationOffset)) : bytes.readUInt32BE(durationOffset)
        const seconds = timescale > 0 ? duration / timescale : NaN
        if (Number.isFinite(seconds) && seconds > 0) return seconds
      }
      if (type === 'sidx') {
        if (payload + 24 > offset + size) { offset += size; continue }
        const version = bytes[payload]
        const timescale = bytes.readUInt32BE(payload + 8)
        const table = payload + (version === 0 ? 20 : version === 1 ? 28 : 0)
        if (table === payload || table + 4 > offset + size) { offset += size; continue }
        const count = bytes.readUInt16BE(table + 2)
        let entry = table + 4
        let duration = 0
        for (let index = 0; index < count; index += 1) {
          if (entry + 12 > offset + size) { duration = 0; break }
          duration += bytes.readUInt32BE(entry + 4)
          entry += 12
        }
        const seconds = timescale > 0 ? duration / timescale : NaN
        if (Number.isFinite(seconds) && seconds > 0) return seconds
      }
      if (containers.has(type)) {
        const nested = walk(payload, offset + size)
        if (nested !== null) return nested
      }
      offset += size
    }
    return null
  }
  return walk(0, bytes.length)
}

function cleanMeta(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned ? cleaned.slice(0, 300) : null
}

export async function purgeReelTempDirs(maxAgeMs = STALE_TEMP_AGE_MS): Promise<void> {
  const tempRoot = os.tmpdir()
  const entries = await fs.promises.readdir(tempRoot, { withFileTypes: true }).catch(() => [])
  const cutoff = Date.now() - maxAgeMs
  await Promise.all(entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('nostra-reel-'))
    .map(async (entry) => {
      const target = path.join(tempRoot, entry.name)
      const stat = await fs.promises.stat(target).catch(() => null)
      if (stat && stat.mtimeMs < cutoff) {
        await fs.promises.rm(target, { recursive: true, force: true }).catch((cause) => {
          console.error('[reel-transcript] stale media cleanup failed', target, cause)
        })
      }
    }))
}

async function cleanupTempDir(tempDir: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
      return true
    } catch (cause) {
      if (attempt === 3) {
        console.error('[reel-transcript] temporary media cleanup failed', tempDir, cause)
      }
    }
  }
  return false
}

export async function transcribeInstagramReel(
  input: string,
  config: ReelTranscriptConfig,
  deps: ReelTranscriptDeps = {},
): Promise<ReelTranscriptResult> {
  const runStartedAt = Date.now()
  const stepStartedAt = new Map<ReelTranscriptProgressStep, number>()
  let activeStep: ReelTranscriptProgressStep | null = null
  let tempDir: string | null = null
  const emit = (
    step: ReelTranscriptProgressStep,
    status: ReelTranscriptProgressEvent['status'],
    detail?: ReelTranscriptProgressEvent['detail'],
  ) => {
    const now = Date.now()
    if (status === 'running') {
      stepStartedAt.set(step, now)
      activeStep = step
    } else if (activeStep === step) {
      activeStep = null
    }
    const started = stepStartedAt.get(step)
    try {
      deps.onProgress?.({
        step,
        status,
        elapsedMs: Math.max(0, now - runStartedAt),
        ...(started === undefined || status === 'running' ? {} : { stepElapsedMs: Math.max(0, now - started) }),
        ...(detail ? { detail } : {}),
      })
    } catch {
      // Progress visibility is observational. A disconnected or buggy listener must never break the work.
    }
  }

  try {
    emit('validate-link', 'running')
    const sourceUrl = normalizeInstagramReelUrl(input)
    checkAbort(deps.signal)
    emit('validate-link', 'complete', { sourceUrl })

    emit('prepare-runtime', 'running')
    if (!config.groqApiKey) {
      throw new ReelTranscriptError('Reel transcription is not configured on this engine.', 'transcription-unavailable', 503)
    }
    const fetchFn = deps.fetchFn ?? fetch
    const run = deps.run ?? defaultRun
    const binary = await (deps.ensureBinary ?? ensureYtDlpBinary)(config, fetchFn, deps.signal)
    checkAbort(deps.signal)
    const maxSeconds = config.maxSeconds ?? DEFAULT_MAX_SECONDS
    const maxBytes = config.maxBytes ?? DEFAULT_MAX_BYTES
    staleTempPurge ||= purgeReelTempDirs().finally(() => { staleTempPurge = null })
    await staleTempPurge
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'nostra-reel-'))
    emit('prepare-runtime', 'complete')

    const common = ['--ignore-config', '--no-plugin-dirs', '--no-playlist', '--no-warnings', '--no-progress']
    emit('inspect-reel', 'running')
    const infoRead = await runInstagram(
      run,
      binary,
      [...common, '--dump-single-json', '--skip-download', sourceUrl],
      deps.signal,
    )
    let metadata: Record<string, unknown>
    try {
      const parsed = JSON.parse(infoRead.stdout) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('metadata is not an object')
      metadata = parsed as Record<string, unknown>
    } catch {
      throw new ReelTranscriptError('Instagram returned an unreadable Reel.', 'reel-fetch-failed', 502)
    }
    const rawDuration = metadata.duration
    if (typeof rawDuration === 'number' && Number.isFinite(rawDuration) && rawDuration <= 0) {
      throw new ReelTranscriptError('Instagram did not provide this Reel’s duration, so it cannot be checked safely.', 'reel-duration-unknown', 422)
    }
    let duration = typeof rawDuration === 'number' && Number.isFinite(rawDuration) ? rawDuration : null
    if (duration !== null && duration > maxSeconds) {
      throw new ReelTranscriptError(`This Reel is longer than the ${Math.round(maxSeconds / 60)} minute tool limit.`, 'reel-too-long', 422)
    }
    const title = cleanMeta(metadata.title || metadata.description)
    const author = cleanMeta(metadata.uploader || metadata.channel)
    emit('inspect-reel', 'complete', { title, author, durationSeconds: duration })

    const outputTemplate = path.join(tempDir, 'reel.%(ext)s')
    const sizeLimitMiB = Math.max(1, Math.floor(maxBytes / (1024 * 1024)))
    emit('download-media', 'running')
    const download = await run(binary, [
      ...common,
      '--max-filesize', String(maxBytes),
      '--format', `bestaudio[ext=m4a][filesize<${sizeLimitMiB}M]/best[ext=mp4][filesize<${sizeLimitMiB}M]/bestaudio[ext=m4a]/best[ext=mp4]`,
      '--output', outputTemplate,
      sourceUrl,
    ], deps.signal)
    if (download.exitCode !== 0) {
      const detail = `${download.stderr}\n${download.stdout}`
      if (/max-filesize|file is larger|filesize.*limit/i.test(detail)) {
        throw new ReelTranscriptError('The Reel is too large to transcribe.', 'reel-too-large', 422)
      }
      throw unavailableReel(detail)
    }

    const files = (await fs.promises.readdir(tempDir))
      .filter((name) => !name.endsWith('.part') && !name.endsWith('.ytdl'))
    const mediaName = files[0]
    if (!mediaName) {
      throw new ReelTranscriptError('The Reel is too large to transcribe.', 'reel-too-large', 422)
    }
    const mediaPath = path.join(tempDir, mediaName)
    const stat = await fs.promises.stat(mediaPath)
    if (stat.size <= 0 || stat.size > maxBytes) {
      throw new ReelTranscriptError('The Reel is too large to transcribe.', 'reel-too-large', 422)
    }
    emit('download-media', 'complete', { bytes: stat.size })

    emit('check-media', 'running')
    checkAbort(deps.signal)
    const media = await fs.promises.readFile(mediaPath)
    if (duration === null) duration = mp4DurationSeconds(media)
    if (duration === null) {
      throw new ReelTranscriptError('This Reel’s duration could not be checked safely.', 'reel-duration-unknown', 422)
    }
    if (duration > maxSeconds) {
      throw new ReelTranscriptError(`This Reel is longer than the ${Math.round(maxSeconds / 60)} minute tool limit.`, 'reel-too-long', 422)
    }
    emit('check-media', 'complete', { bytes: stat.size, durationSeconds: duration, maxSeconds, maxBytes })

    const form = new FormData()
    form.append('file', new Blob([media], { type: mediaMime(mediaName) }), mediaName)
    form.append('model', config.model || DEFAULT_MODEL)
    form.append('response_format', 'verbose_json')
    form.append('temperature', '0')

    let response: Response
    let rawProviderBody: Buffer
    emit('transcribe-speech', 'running')
    try {
      const providerSignal = deps.signal
        ? AbortSignal.any([deps.signal, AbortSignal.timeout(120_000)])
        : AbortSignal.timeout(120_000)
      response = await fetchFn(`${(config.groqBaseUrl || 'https://api.groq.com/openai/v1').replace(/\/$/, '')}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.groqApiKey}` },
        body: form,
        signal: providerSignal,
      })
      rawProviderBody = await readLimited(response, PROVIDER_MAX_BYTES, 'The transcription service', 'transcription-failed', 502)
    } catch (cause) {
      if (cause instanceof ReelTranscriptError) throw cause
      if (deps.signal?.aborted) throw abortFailure(deps.signal)
      throw new ReelTranscriptError('The transcription service could not be reached. Try again.', 'transcription-failed', 502)
    }

    if (!response.ok) {
      if (response.status === 413) {
        throw new ReelTranscriptError('The Reel is too large to transcribe.', 'reel-too-large', 422)
      }
      const message = response.status === 401 || response.status === 403
        ? 'The transcription service key needs attention.'
        : response.status === 429
          ? 'The transcription service is busy. Try again shortly.'
          : 'The Reel could not be transcribed. Try again.'
      throw new ReelTranscriptError(message, 'transcription-failed', response.status === 429 ? 429 : 502)
    }
    emit('transcribe-speech', 'complete')

    emit('prepare-output', 'running')
    let body: Record<string, unknown>
    try {
      const parsed = JSON.parse(rawProviderBody.toString('utf8')) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('provider body is not an object')
      body = parsed as Record<string, unknown>
    } catch {
      throw new ReelTranscriptError('The transcription service returned an unreadable response.', 'transcription-failed', 502)
    }
    if (typeof body.text !== 'string') {
      throw new ReelTranscriptError('The transcription service returned an incomplete response.', 'transcription-failed', 502)
    }
    const transcript = body.text.trim()
    if (!transcript) throw new ReelTranscriptError('No spoken words were found in this Reel.', 'empty-transcript', 422)
    const language = cleanMeta(body.language)
    emit('prepare-output', 'complete', { transcriptCharacters: transcript.length, language })

    return {
      transcript,
      sourceUrl,
      title,
      author,
      durationSeconds: duration,
      language,
    }
  } catch (cause) {
    if (activeStep) emit(activeStep, 'failed')
    throw cause
  } finally {
    if (tempDir) {
      emit('clean-up', 'running')
      const mediaRemoved = await cleanupTempDir(tempDir)
      emit('clean-up', mediaRemoved ? 'complete' : 'warning', { mediaRemoved })
    }
  }
}
