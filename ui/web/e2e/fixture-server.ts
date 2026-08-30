import { createHash, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { claudeProviderAdapter } from '../../server/src/providers/claude'
import { codexProviderAdapter } from '../../server/src/providers/codex'
import type { ProviderStreamEvent } from '../../server/src/providers/types'
import { MODULES, PARTIAL_FILES, REQUIRED_FILES } from './fixtures/fixture-contract.mjs'

type Provider = 'claude' | 'codex'
type ActivityStatus = 'error' | 'done'

const HOST = '127.0.0.1'
const PORT = 8899
const SUBJECT = 'KAR'
const SOURCE_RUN_ROOT = 'analyses/KAR_2026-08-28'
const TARGET_RUN_ROOT = SOURCE_RUN_ROOT
const CLAUDE_PROFILE = {
  key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default',
}
const CODEX_PROFILE = {
  key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
  specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
}

interface ActivityRow {
  runId: string
  user: string
  userVia: 'local'
  kind: 'full'
  ticker: string
  swarm: 'research'
  chained: true
  runRoot: string
  provider: Provider
  executionProfile: typeof CLAUDE_PROFILE | typeof CODEX_PROFILE
  profileKey: string
  model: string
  reasoningLevel: string
  launchedAt: number
  finishedAt: number
  durationMs: number
  status: ActivityStatus
  note?: string
}

interface PendingAdmission {
  requestId: string
  user: string
  userVia: 'local'
  ticker: string
  action: 'full'
  provider: Provider
  model: string
  reasoningLevel: string
  expectedProfileKey: string
  status: 'waiting_for_update'
  createdAt: string
  updatedAt: string
}

interface FixtureState {
  provider: Provider
  updating: boolean
  pending: PendingAdmission[]
  activity: ActivityRow[]
  resumable: any[]
  spawnCount: number
  launchPosts: number
  continuationPosts: number
  normalizedEvents: ProviderStreamEvent[]
  physicalRoot: string
  partialHashBefore: string | null
  partialHashAfter: string | null
  lastPlanDifference: null | {
    beforeFingerprint: string
    afterFingerprint: string
    addedPayableOrbKeys: string[]
    removedPayableOrbKeys: string[]
  }
  phase: 'idle' | 'full_first_module_done' | 'full_interrupted' | 'resume_first_module_done' | 'finished' | 'empty_blocked' | 'legacy_nonempty_blocked'
  active: any[]
  activeSnapshot: any | null
  readinessDecisionPosts: number
}

let state = freshState('claude')
let releaseFull: (() => void) | null = null
let releaseResume: (() => void) | null = null

function profile(provider: Provider) {
  return provider === 'claude' ? CLAUDE_PROFILE : CODEX_PROFILE
}

function freshState(provider: Provider): FixtureState {
  return {
    provider,
    updating: true,
    pending: [],
    activity: [],
    resumable: [],
    spawnCount: 0,
    launchPosts: 0,
    continuationPosts: 0,
    normalizedEvents: [],
    physicalRoot: fs.mkdtempSync(path.join(os.tmpdir(), `nostra-provider-parity-${provider}-`)),
    partialHashBefore: null,
    partialHashAfter: null,
    lastPlanDifference: null,
    phase: 'idle',
    active: [],
    activeSnapshot: null,
    readinessDecisionPosts: 0,
  }
}

function removePhysicalRoot(): void {
  fs.rmSync(state.physicalRoot, { recursive: true, force: true })
}

function sha256File(file: string): string {
  return `sha256:${createHash('sha256').update(fs.readFileSync(file)).digest('hex')}`
}

function aggregatePartialHash(): string | null {
  const rows = PARTIAL_FILES.map((relative) => {
    const file = path.join(state.physicalRoot, relative)
    return fs.existsSync(file) ? `${relative}\0${sha256File(file)}` : null
  })
  if (rows.some((row) => row === null)) return null
  return `sha256:${createHash('sha256').update(rows.join('\n')).digest('hex')}`
}

function providerFields(provider: Provider) {
  const executionProfile = profile(provider)
  return {
    provider,
    model: executionProfile.parentModel,
    reasoningLevel: executionProfile.parentReasoning,
    profileKey: executionProfile.key,
    executionProfile,
  }
}

function preflight(provider: Provider, agentCount: number) {
  const fields = providerFields(provider)
  return {
    kind: 'full', ticker: SUBJECT, agentCount,
    estCostUsdRange: provider === 'claude' ? [1, 2] : [0, 0],
    estMinutesRange: [1, 2],
    estimateEvidence: {
      source: 'comparable_completed_runs', provider, profileKey: fields.profileKey,
      durationSampleSize: 3, costSampleSize: provider === 'claude' ? 3 : 0,
    },
    willCommitToMain: true, estCommits: 2, requiresTypedConfirm: true,
    creditPreflight: { ok: true, checked: true },
    ...fields,
  }
}

function payableOrbKeys(): string[] {
  return MODULES.flatMap((module: string) => module === 'business-model'
    ? [`${module}:fixture`]
    : [`${module}:fixture`])
}

function continuationReceipt(provider: Provider) {
  const fields = providerFields(provider)
  const reusableOrbKeys = ['business-model:identity']
  const payable = payableOrbKeys()
  const dataPool = { files: 12, newestMs: 1_787_932_800_000, sha256: `sha256:${'1'.repeat(64)}` }
  const sourceArtifactsSha256 = `sha256:${'2'.repeat(64)}`
  const fingerprint = `sha256:${createHash('sha256').update(JSON.stringify({ provider, fields, reusableOrbKeys, payable, dataPool, sourceArtifactsSha256, root: SOURCE_RUN_ROOT })).digest('hex')}`
  return {
    version: 2, action: 'continue', swarm: 'research', subject: SUBJECT,
    sourceRunRoots: [SOURCE_RUN_ROOT], targetRunRoot: TARGET_RUN_ROOT,
    provider: { id: provider, model: fields.model, reasoningLevel: fields.reasoningLevel, profileKey: fields.profileKey },
    reusableOrbKeys, payableOrbKeys: payable, dataPool,
    evidenceGenerationDigest: '3'.repeat(64), reusableArtifacts: [],
    reusableArtifactsSha256: `sha256:${'4'.repeat(64)}`,
    verifiedLineageSha256: `sha256:${'5'.repeat(64)}`,
    sourceArtifactsSha256, fingerprint,
  }
}

function thesisPlan(provider: Provider) {
  const receipt = continuationReceipt(provider)
  const modules = MODULES.map((module: string) => ({
    module,
    state: module === 'business-model' ? 'partial' : 'missing',
    sourceRunRoot: module === 'business-model' ? SOURCE_RUN_ROOT : undefined,
    sourceDate: module === 'business-model' ? '2026-08-28' : undefined,
    inTargetRoot: module === 'business-model',
    doneAgents: module === 'business-model' ? 1 : 0,
    totalAgents: module === 'business-model' ? 2 : 1,
    staleReason: module === 'business-model' ? 'One saved orb is valid; only the missing orb runs.' : 'Not run yet.',
    blockedBy: [], runnable: true, willRunAgents: 1,
    doneOrbKeys: module === 'business-model' ? ['identity'] : [],
  }))
  return {
    moduleResumeVersion: 2,
    continuationReceipt: receipt,
    swarm: 'research', subject: SUBJECT, targetRunRoot: TARGET_RUN_ROOT,
    complete: false, finalReportPath: null, modules,
    reusable: [], mustReuse: [], reuse: [], run: [...MODULES], carry: [],
    master: { state: 'blocked', blockedBy: [...MODULES] },
    dataPool: receipt.dataPool,
    preflight: preflight(provider, receipt.payableOrbKeys.length),
    fullPreflight: preflight(provider, receipt.payableOrbKeys.length + receipt.reusableOrbKeys.length),
    canCarry: false,
  }
}

async function readBody(req: http.IncomingMessage): Promise<any> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  if (!chunks.length) return {}
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function json(res: http.ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value)
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) })
  res.end(body)
}

function executable(provider: Provider): string {
  const candidate = provider === 'claude' ? process.env.CLAUDE_BIN : process.env.CODEX_BIN
  if (!candidate) throw new Error(`${provider} fixture binary is not configured`)
  return candidate
}

async function runProvider(outcome: 'interrupt' | 'success'): Promise<void> {
  const provider = state.provider
  const selected = profile(provider)
  state.spawnCount += 1
  const events: ProviderStreamEvent[] = []
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable(provider), [], {
      env: {
        ...process.env,
        NOSTRA_FIXTURE_PROVIDER: provider,
        NOSTRA_FIXTURE_OUTCOME: outcome,
        NOSTRA_FIXTURE_RUN_ROOT: state.physicalRoot,
        NOSTRA_FIXTURE_PROFILE_KEY: selected.key,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', reject)
    child.once('close', (code) => {
      const adapter = provider === 'claude' ? claudeProviderAdapter : codexProviderAdapter
      for (const line of stdout.split(/\r?\n/)) events.push(...adapter.parseStreamLine(line))
      state.normalizedEvents.push(...events)
      const hasSession = events.some((event) => event.type === 'session')
      const hasResult = events.some((event) => event.type === 'result')
      if (!hasSession || !hasResult) return reject(new Error(`${provider} fixture did not normalize a complete lifecycle: ${stderr}`))
      if (outcome === 'success' ? code !== 0 : code !== 17) return reject(new Error(`${provider} fixture exited ${code}: ${stderr}`))
      resolve()
    })
  })
}

function activityRow(status: ActivityStatus): ActivityRow {
  const now = Date.now()
  return {
    runId: `fixture-${state.provider}-${status}-${randomUUID()}`,
    user: 'fixture@local', userVia: 'local', kind: 'full', ticker: SUBJECT,
    swarm: 'research', chained: true, runRoot: SOURCE_RUN_ROOT,
    ...providerFields(state.provider), launchedAt: now - 25, finishedAt: now,
    durationMs: 25, status,
    ...(status === 'error' ? { note: 'fixture interruption' } : {}),
  }
}

function resumable() {
  return {
    swarm: 'research', subject: SUBJECT, runRoot: SOURCE_RUN_ROOT, kind: 'full',
    doneCount: 0, totalCount: MODULES.length, unit: 'module', label: SUBJECT,
    provider: state.provider, executionProfile: profile(state.provider), reason: 'fixture interruption',
  }
}

function firstModuleSnapshot(runId: string, phase: 'full' | 'resume') {
  const fields = providerFields(state.provider)
  const chainId = `fixture-${state.provider}-${phase}-chain`
  const startedAt = Date.now() - 1_000
  const doneAt = Date.now() - 200
  return {
    runId, kind: 'full', ticker: SUBJECT, swarmId: 'research', status: 'running',
    runRoot: SOURCE_RUN_ROOT, chainId, startedAt, willCommitToMain: true,
    ...fields,
    expected: [
      { key: 'business-model/identity', name: 'Business identity', module: 'business-model', layer: 1 },
      { key: 'earnings/earnings-quality', name: 'Earnings quality', module: 'earnings', layer: 1 },
    ],
    agents: [
      { key: 'business-model/identity', name: 'Business identity', module: 'business-model', layer: 1, status: 'done', verdict: 'Sufficient', outputPath: `${SOURCE_RUN_ROOT}/business-model/identity.md`, startedAt, endedAt: doneAt },
      { key: 'earnings/earnings-quality', name: 'Earnings quality', module: 'earnings', layer: 1, status: 'queued', verdict: null, outputPath: null },
    ],
    // A non-empty shared report is chain-internal truth, not a browser decision. The UI must reconnect
    // without inventing a modal after the first module has landed.
    readiness: {
      ticker: SUBJECT, kind: 'full', overall: 'degraded', fileCount: 12, usableCount: 12,
      entities: [], issues: [{ code: 'module_insufficient', severity: 'degrade', message: 'One optional source is missing.' }], ts: Date.now(),
    },
  }
}

function exposeFirstModule(phase: 'full' | 'resume'): Promise<void> {
  const runId = `fixture-${state.provider}-${phase}-${randomUUID()}`
  const snapshot = firstModuleSnapshot(runId, phase)
  state.activeSnapshot = snapshot
  state.active = [{
    runId, kind: snapshot.kind, ticker: SUBJECT, swarmId: 'research', status: 'running',
    startedAt: snapshot.startedAt, chainId: snapshot.chainId, ...providerFields(state.provider),
  }]
  state.phase = phase === 'full' ? 'full_first_module_done' : 'resume_first_module_done'
  return new Promise<void>((resolve) => {
    if (phase === 'full') releaseFull = resolve
    else releaseResume = resolve
  })
}

function exposeEmptyDecisionOwner(): void {
  const runId = `fixture-${state.provider}-empty-${randomUUID()}`
  const snapshot = firstModuleSnapshot(runId, 'full')
  snapshot.status = 'awaiting-readiness-decision'
  snapshot.agents = []
  snapshot.readiness = {
    ticker: SUBJECT, kind: 'full', overall: 'blocked', fileCount: 0, usableCount: 0,
    physicalPool: { state: 'empty', fileCount: 0, nonEmptyFileCount: 0 },
    entities: [], issues: [{ code: 'zero_files', severity: 'blocker', message: 'No files found.' }], ts: Date.now(),
  }
  state.activeSnapshot = snapshot
  state.active = [{
    runId, kind: snapshot.kind, ticker: SUBJECT, swarmId: 'research', status: snapshot.status,
    startedAt: snapshot.startedAt, chainId: snapshot.chainId, ...providerFields(state.provider),
  }]
  state.phase = 'empty_blocked'
}

function exposeLegacyNonEmptyDecisionOwner(): void {
  exposeEmptyDecisionOwner()
  state.activeSnapshot.readiness = {
    ticker: SUBJECT, kind: 'full', overall: 'blocked', fileCount: 1, usableCount: 0,
    physicalPool: { state: 'nonempty', fileCount: 1, nonEmptyFileCount: 1 },
    entities: [], issues: [{ code: 'zero_usable_data', severity: 'blocker', message: 'Unsupported but non-empty file.' }], ts: Date.now(),
  }
  state.phase = 'legacy_nonempty_blocked'
}

async function admitQueued(): Promise<void> {
  const queued = state.pending[0]
  if (!queued) return
  state.pending = []
  await exposeFirstModule('full')
  await runProvider('interrupt')
  state.partialHashBefore = aggregatePartialHash()
  state.activity = [activityRow('error')]
  state.resumable = [resumable()]
  state.active = []
  state.activeSnapshot = null
  state.phase = 'full_interrupted'
}

function artifactTruth() {
  return Object.fromEntries(REQUIRED_FILES.map((relative: string) => [relative, fs.existsSync(path.join(state.physicalRoot, relative))]))
}

function publicState() {
  let provenance: unknown = null
  const provenancePath = path.join(state.physicalRoot, 'execution_provenance.receipt.json')
  if (fs.existsSync(provenancePath)) provenance = JSON.parse(fs.readFileSync(provenancePath, 'utf8'))
  return {
    provider: state.provider,
    updating: state.updating,
    pending: state.pending,
    activity: state.activity,
    resumable: state.resumable,
    spawnCount: state.spawnCount,
    launchPosts: state.launchPosts,
    continuationPosts: state.continuationPosts,
    normalizedEventTypes: state.normalizedEvents.map((event) => event.type),
    sourceRunRoot: SOURCE_RUN_ROOT,
    targetRunRoot: TARGET_RUN_ROOT,
    partialHashBefore: state.partialHashBefore,
    partialHashAfter: state.partialHashAfter,
    artifacts: artifactTruth(),
    provenance,
    lastPlanDifference: state.lastPlanDifference,
    phase: state.phase,
    active: state.active,
    readinessDecisionPosts: state.readinessDecisionPosts,
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`)
    const method = req.method || 'GET'

    if (method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true })
    if (method === 'POST' && url.pathname === '/api/e2e/reset') {
      const body = await readBody(req)
      if (body.provider !== 'claude' && body.provider !== 'codex') return json(res, 400, { error: 'provider required' })
      releaseFull?.(); releaseFull = null
      releaseResume?.(); releaseResume = null
      removePhysicalRoot()
      state = freshState(body.provider)
      return json(res, 200, publicState())
    }
    if (method === 'GET' && url.pathname === '/api/e2e/state') return json(res, 200, publicState())
    if (method === 'POST' && url.pathname === '/api/e2e/deploy') {
      state.updating = false
      void admitQueued()
      return json(res, 200, publicState())
    }
    if (method === 'POST' && url.pathname === '/api/e2e/interrupt-full') {
      releaseFull?.(); releaseFull = null
      return json(res, 200, publicState())
    }
    if (method === 'POST' && url.pathname === '/api/e2e/finish-resume') {
      releaseResume?.(); releaseResume = null
      return json(res, 200, publicState())
    }
    if (method === 'POST' && url.pathname === '/api/e2e/block-empty') {
      exposeEmptyDecisionOwner()
      return json(res, 200, publicState())
    }
    if (method === 'POST' && url.pathname === '/api/e2e/block-legacy-nonempty') {
      exposeLegacyNonEmptyDecisionOwner()
      return json(res, 200, publicState())
    }
    if (method === 'POST' && url.pathname === '/api/e2e/drop-active') {
      state.active = []
      state.activeSnapshot = null
      state.phase = 'finished'
      return json(res, 200, publicState())
    }
    if (method === 'GET' && url.pathname === '/api/whoami') return json(res, 200, { user: 'fixture@local', userVia: 'local' })
    if (method === 'GET' && url.pathname === '/api/runs') return json(res, 200, { active: state.active })
    if (method === 'GET' && /^\/api\/runs\/[^/]+$/.test(url.pathname)) {
      const runId = decodeURIComponent(url.pathname.split('/')[3])
      if (!state.activeSnapshot || state.activeSnapshot.runId !== runId) return json(res, 404, { error: 'no such run' })
      return json(res, 200, state.activeSnapshot)
    }
    if (method === 'GET' && url.pathname === '/api/activity') {
      return json(res, 200, {
        rows: state.activity, total: state.activity.length, allTime: state.activity.length,
        users: ['fixture@local'], tickers: [SUBJECT], earliest: state.activity.at(-1)?.launchedAt || null,
      })
    }
    if (method === 'GET' && url.pathname === '/api/resumable') return json(res, 200, { runs: state.resumable })
    if (method === 'GET' && url.pathname === '/api/pending-admissions') return json(res, 200, { requests: state.pending })
    if (method === 'POST' && /^\/api\/pending-admissions\/[^/]+\/cancel$/.test(url.pathname)) {
      const requestId = decodeURIComponent(url.pathname.split('/')[3])
      const request = state.pending.find((candidate) => candidate.requestId === requestId)
      if (!request) return json(res, 404, { error: 'not found' })
      state.pending = state.pending.filter((candidate) => candidate.requestId !== requestId)
      return json(res, 200, { ok: true, request })
    }
    if (method === 'GET' && url.pathname === '/api/launch/estimate') {
      const provider = url.searchParams.get('provider') as Provider
      return json(res, 200, preflight(provider, MODULES.length + 1))
    }
    if (method === 'POST' && url.pathname === '/api/launch') {
      const body = await readBody(req)
      state.launchPosts += 1
      if (body.kind !== 'full' || body.ticker !== SUBJECT || body.provider !== state.provider) return json(res, 400, { error: 'wrong fixture launch' })
      if (!state.updating) return json(res, 409, { error: 'fixture full launch must queue during update' })
      const now = new Date().toISOString()
      const requestId = typeof body.requestId === 'string' ? body.requestId : randomUUID()
      const existing = state.pending.find((candidate) => candidate.requestId === requestId)
      if (!existing) state.pending.push({
        requestId, user: 'fixture@local', userVia: 'local', ticker: SUBJECT, action: 'full',
        provider: state.provider, model: profile(state.provider).parentModel,
        reasoningLevel: profile(state.provider).parentReasoning,
        expectedProfileKey: profile(state.provider).key,
        status: 'waiting_for_update', createdAt: now, updatedAt: now,
      })
      return json(res, 202, { queued: true, ...state.pending[0] })
    }
    if (method === 'GET' && url.pathname === '/api/thesis-plan') {
      const provider = url.searchParams.get('provider') as Provider
      const runRoot = url.searchParams.get('runRoot')
      if (provider !== state.provider || runRoot !== SOURCE_RUN_ROOT) return json(res, 409, { code: 'plan_changed', error: 'exact saved root required' })
      return json(res, 200, thesisPlan(provider))
    }
    if (method === 'POST' && url.pathname === '/api/thesis-plan/run') {
      const body = await readBody(req)
      state.continuationPosts += 1
      const expected = continuationReceipt(state.provider)
      if (body.ticker !== SUBJECT || body.sourceRunRoot !== SOURCE_RUN_ROOT
          || body.continuationReceipt?.fingerprint !== expected.fingerprint
          || body.continuationReceipt?.targetRunRoot !== SOURCE_RUN_ROOT) {
        return json(res, 409, { code: 'plan_changed', error: 'exact continuation receipt changed' })
      }
      await exposeFirstModule('resume')
      await runProvider('success')
      state.partialHashAfter = aggregatePartialHash()
      state.resumable = []
      state.activity = [activityRow('done')]
      state.active = []
      state.activeSnapshot = null
      state.phase = 'finished'
      return json(res, 200, {
        runId: state.activity[0].runId,
        preflight: preflight(state.provider, expected.payableOrbKeys.length),
        carried: [], reused: ['business-model'], willRun: [...MODULES],
        chained: true, skipped: ['business-model:identity'], planned: expected.payableOrbKeys,
        resumed: true, ...providerFields(state.provider),
      })
    }
    if (method === 'POST' && /^\/api\/runs\/[^/]+\/readiness-decision$/.test(url.pathname)) {
      state.readinessDecisionPosts += 1
      return json(res, 409, { error: 'the non-empty shared report never needs a browser decision' })
    }
    if (method === 'GET' && /^\/api\/runs\/[^/]+\/events$/.test(url.pathname)) {
      // Ending the stream immediately makes EventSource treat it as a dropped connection and
      // reconnect in a tight loop, spamming the fixture. Keep it open until the client disconnects.
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
      res.write(':\n\n')
      req.once('close', () => res.end())
      return
    }
    return json(res, 404, { error: `${method} ${url.pathname} is not part of the lifecycle fixture` })
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) })
  }
})

server.listen(PORT, HOST)

function shutdown(): void {
  removePhysicalRoot()
  server.close(() => process.exit(0))
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
