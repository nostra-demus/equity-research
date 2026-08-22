import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  ReelTranscriptError,
  ensureYtDlpBinary,
  mp4DurationSeconds,
  normalizeInstagramReelUrl,
  transcribeInstagramReel,
  type ReelTranscriptConfig,
  type ReelTranscriptProgressEvent,
} from '../src/reel-transcript'

const config = (): ReelTranscriptConfig => ({
  stateDir: path.join(os.tmpdir(), 'nostra-reel-test-state'),
  groqApiKey: 'test-key',
  groqBaseUrl: 'https://groq.test/openai/v1',
  maxBytes: 1024 * 1024,
  maxSeconds: 180,
})

async function expectCode(promise: Promise<unknown>, code: string) {
  await assert.rejects(promise, (cause: unknown) => cause instanceof ReelTranscriptError && cause.code === code)
}

assert.equal(
  normalizeInstagramReelUrl(' https://www.instagram.com/reel/DcUMpKAC-Xd/?igsi=tracking '),
  'https://www.instagram.com/reel/DcUMpKAC-Xd/',
)
assert.equal(
  normalizeInstagramReelUrl('https://www.instagram.com/reels/DcUMpKAC-Xd/'),
  'https://www.instagram.com/reel/DcUMpKAC-Xd/',
  'Instagram desktop /reels/ URLs resolve to the same canonical Reel as /reel/ share links',
)
assert.equal(
  normalizeInstagramReelUrl('https://m.instagram.com/reel/Ab_c-123/'),
  'https://www.instagram.com/reel/Ab_c-123/',
)
await expectCode(Promise.resolve().then(() => normalizeInstagramReelUrl('https://example.com/reel/abc/')), 'invalid-reel-url')
await expectCode(Promise.resolve().then(() => normalizeInstagramReelUrl('https://www.instagram.com/p/abc/')), 'invalid-reel-url')

let downloadedPath = ''
const calls: string[][] = []
const run = async (_binary: string, args: string[]) => {
  calls.push(args)
  assert.ok(args.includes('--ignore-config'), 'every yt-dlp call ignores host configuration')
  assert.ok(args.includes('--no-plugin-dirs'), 'every yt-dlp call disables host plugins')
  if (args.includes('--dump-single-json')) {
    return { exitCode: 0, stdout: JSON.stringify({ duration: 42.4, title: 'A useful Reel', uploader: 'creator' }), stderr: '' }
  }
  const template = args[args.indexOf('--output') + 1]
  downloadedPath = template.replace('%(ext)s', 'mp4')
  await fs.promises.writeFile(downloadedPath, Buffer.from('not-real-media'))
  return { exitCode: 0, stdout: '', stderr: '' }
}
const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
  assert.equal(String(input), 'https://groq.test/openai/v1/audio/transcriptions')
  assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test-key')
  const form = init?.body as FormData
  assert.equal(form.get('model'), 'whisper-large-v3-turbo')
  assert.equal(form.get('response_format'), 'verbose_json')
  assert.ok(form.get('file') instanceof Blob)
  return new Response(JSON.stringify({ text: 'The complete spoken transcript.', language: 'en' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}) as typeof fetch

const progress: ReelTranscriptProgressEvent[] = []
const result = await transcribeInstagramReel('https://instagram.com/reels/Test_123/', config(), {
  run,
  fetchFn,
  ensureBinary: async () => '/fake/yt-dlp',
  onProgress: (event) => progress.push(event),
})
assert.deepEqual(result, {
  transcript: 'The complete spoken transcript.',
  sourceUrl: 'https://www.instagram.com/reel/Test_123/',
  title: 'A useful Reel',
  author: 'creator',
  durationSeconds: 42.4,
  language: 'en',
})
assert.equal(calls.length, 2)
assert.equal(fs.existsSync(downloadedPath), false, 'temporary Reel media is deleted before the call returns')
const expectedSteps = [
  'validate-link',
  'prepare-runtime',
  'inspect-reel',
  'download-media',
  'check-media',
  'transcribe-speech',
  'prepare-output',
  'clean-up',
]
assert.deepEqual(progress.filter((event) => event.status === 'running').map((event) => event.step), expectedSteps,
  'every real backend stage becomes visible in execution order')
assert.deepEqual(progress.filter((event) => event.status === 'complete').map((event) => event.step), expectedSteps,
  'the result waits for every stage, including temporary-media cleanup, to complete')
assert.equal(progress.find((event) => event.step === 'download-media' && event.status === 'complete')?.detail?.bytes, 14)
assert.deepEqual(
  progress.find((event) => event.step === 'check-media' && event.status === 'complete')?.detail,
  { bytes: 14, durationSeconds: 42.4, maxSeconds: 180, maxBytes: 1024 * 1024 },
  'the live safety check reports the configured limits instead of hard-coding UI copy',
)
assert.equal(progress.find((event) => event.step === 'prepare-output' && event.status === 'complete')?.detail?.transcriptCharacters, 31)
assert.equal(progress.at(-1)?.detail?.mediaRemoved, true, 'the last live event truthfully confirms media deletion')

let publicAttempts = 0
await expectCode(transcribeInstagramReel('https://instagram.com/reel/NeedsLogin/', config(), {
  ensureBinary: async () => '/fake/yt-dlp',
  run: async () => {
    publicAttempts += 1
    return { exitCode: 1, stdout: '', stderr: 'Requested content is not available, login required' }
  },
}), 'reel-unavailable')
assert.equal(publicAttempts, 1, 'the public-only endpoint never retries with host browser credentials')

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/NoKey/', { ...config(), groqApiKey: '' }, {
    ensureBinary: async () => { throw new Error('must not install without a provider key') },
  }),
  'transcription-unavailable',
)

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/TooLong/', config(), {
    ensureBinary: async () => '/fake/yt-dlp',
    run: async () => ({ exitCode: 0, stdout: JSON.stringify({ duration: 181 }), stderr: '' }),
  }),
  'reel-too-long',
)

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/UnknownDuration/', config(), {
    ensureBinary: async () => '/fake/yt-dlp',
    run: async (_binary, args) => {
      if (args.includes('--dump-single-json')) return { exitCode: 0, stdout: JSON.stringify({}), stderr: '' }
      const template = args[args.indexOf('--output') + 1]
      await fs.promises.writeFile(template.replace('%(ext)s', 'mp4'), Buffer.from('not-an-mp4'))
      return { exitCode: 0, stdout: '', stderr: '' }
    },
  }),
  'reel-duration-unknown',
)

const mvhdPayload = Buffer.alloc(20)
mvhdPayload.writeUInt32BE(1_000, 12)
mvhdPayload.writeUInt32BE(42_500, 16)
const mvhd = Buffer.concat([Buffer.from([0, 0, 0, 28]), Buffer.from('mvhd'), mvhdPayload])
const moov = Buffer.concat([Buffer.from([0, 0, 0, 36]), Buffer.from('moov'), mvhd])
assert.equal(mp4DurationSeconds(moov), 42.5, 'missing Instagram metadata can be checked from the MP4 movie header')

const sidxPayload = Buffer.alloc(36)
sidxPayload.writeUInt32BE(1_000, 8)
sidxPayload.writeUInt16BE(1, 22)
sidxPayload.writeUInt32BE(176_250, 28)
const sidx = Buffer.concat([Buffer.from([0, 0, 0, 44]), Buffer.from('sidx'), sidxPayload])
assert.equal(mp4DurationSeconds(sidx), 176.25, 'fragmented Instagram media is checked from its segment index')

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/BadMetadata/', config(), {
    ensureBinary: async () => '/fake/yt-dlp',
    run: async () => ({ exitCode: 0, stdout: 'null', stderr: '' }),
  }),
  'reel-fetch-failed',
)

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/BadDuration/', config(), {
    ensureBinary: async () => '/fake/yt-dlp',
    run: async () => ({ exitCode: 0, stdout: JSON.stringify({ duration: -1 }), stderr: '' }),
  }),
  'reel-duration-unknown',
)

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/TooLarge/', config(), {
    ensureBinary: async () => '/fake/yt-dlp',
    run: async (_binary, args) => args.includes('--dump-single-json')
      ? { exitCode: 0, stdout: JSON.stringify({ duration: 10 }), stderr: '' }
      : { exitCode: 1, stdout: '', stderr: 'File is larger than max-filesize' },
  }),
  'reel-too-large',
)

await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/BadProviderContract/', config(), {
    ensureBinary: async () => '/fake/yt-dlp',
    run: async (_binary, args) => {
      if (args.includes('--dump-single-json')) return { exitCode: 0, stdout: JSON.stringify({ duration: 10 }), stderr: '' }
      const template = args[args.indexOf('--output') + 1]
      await fs.promises.writeFile(template.replace('%(ext)s', 'mp4'), Buffer.from('media'))
      return { exitCode: 0, stdout: '', stderr: '' }
    },
    fetchFn: (async () => new Response('null', { status: 200 })) as typeof fetch,
  }),
  'transcription-failed',
)

const cancelled = new AbortController()
cancelled.abort()
await expectCode(
  transcribeInstagramReel('https://instagram.com/reel/Cancelled/', config(), {
    signal: cancelled.signal,
    ensureBinary: async () => { throw new Error('cancelled work must not start') },
  }),
  'transcription-cancelled',
)

const inFlight = new AbortController()
let providerStarted!: () => void
const providerReady = new Promise<void>((resolve) => { providerStarted = resolve })
let inFlightMediaPath = ''
const inFlightRequest = transcribeInstagramReel('https://instagram.com/reel/CancelledInFlight/', config(), {
  signal: inFlight.signal,
  ensureBinary: async () => '/fake/yt-dlp',
  run: async (_binary, args) => {
    if (args.includes('--dump-single-json')) return { exitCode: 0, stdout: JSON.stringify({ duration: 10 }), stderr: '' }
    const template = args[args.indexOf('--output') + 1]
    inFlightMediaPath = template.replace('%(ext)s', 'mp4')
    await fs.promises.writeFile(inFlightMediaPath, Buffer.from('media'))
    return { exitCode: 0, stdout: '', stderr: '' }
  },
  fetchFn: (async (_input, init) => new Promise((_resolve, reject) => {
    providerStarted()
    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
  })) as typeof fetch,
})
await providerReady
inFlight.abort()
await expectCode(inFlightRequest, 'transcription-cancelled')
assert.equal(fs.existsSync(inFlightMediaPath), false, 'an in-flight provider abort still deletes temporary Reel media')

const installBytes = Buffer.from('test yt-dlp binary')
const installHash = createHash('sha256').update(installBytes).digest('hex')
const installAsset = process.platform === 'darwin'
  ? 'yt-dlp_macos'
  : process.platform === 'win32'
    ? (process.arch === 'ia32' ? 'yt-dlp_x86.exe' : 'yt-dlp.exe')
    : process.arch === 'arm64'
      ? 'yt-dlp_linux_aarch64'
      : 'yt-dlp_linux'
const installState = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'nostra-reel-install-test-'))
let installFetches = 0
const installFetch = (async () => {
  installFetches += 1
  if (installFetches === 1) {
    return new Response(null, {
      status: 302,
      headers: { location: 'https://release-assets.githubusercontent.com/asset/test' },
    })
  }
  return new Response(installBytes, { status: 200, headers: { 'content-length': String(installBytes.length) } })
}) as typeof fetch
const installed = await ensureYtDlpBinary(
  { ...config(), stateDir: installState },
  installFetch,
  undefined,
  { version: 'test-version', hashes: { [installAsset]: installHash }, maxBytes: 1024 },
)
assert.deepEqual(await fs.promises.readFile(installed), installBytes)
assert.equal(installFetches, 2, 'the pinned installer follows only its allowlisted release redirect')
assert.equal(await ensureYtDlpBinary(
  { ...config(), stateDir: installState },
  async () => { throw new Error('a valid cached binary must not be fetched again') },
  undefined,
  { version: 'test-version', hashes: { [installAsset]: installHash }, maxBytes: 1024 },
), installed)
await fs.promises.rm(installState, { recursive: true, force: true })

console.log('reel transcript: URL boundary, public-only fetch, provider contract, cancellation, limits, pinned install, and cleanup passed')
