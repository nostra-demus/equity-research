import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { canonicalJsonText } from './canonical-json'

export const MEMORY_RUNTIME_CONTRACT = 'memory-runtime-ui/1' as const
const MAX_FILES = 10_000
const MAX_FILE_BYTES = 4 * 1024 * 1024
const MAX_TEXT = 256
const DEFAULT_TTL_MS = 15_000
const DEFAULT_MAX_STALE_MS = 2 * 60_000
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,191}$/

type MemoryMode = 'off' | 'shadow' | 'enforced'
type RuntimeState = 'healthy' | 'degraded' | 'unavailable' | 'disabled'

export interface RuntimeControlView {
  revision: number
  updated_at: string | null
  global_disabled: boolean
  disabled_layers: Array<'episodic' | 'semantic' | 'procedural'>
  disabled_playbooks: Array<{ playbook_id: string; version: number | null; reason: string; disabled_at: string }>
  pinned_playbooks: Array<{ playbook_id: string; version: number; pinned_at: string }>
  candidate_intake_disabled: boolean
  control_sha256: string | null
}

export interface RuntimeRunView {
  run_id: string
  episode_id: string
  ticker: string
  venue: string
  mode: MemoryMode
  status: string
  expected_task_count: number
  completed_task_count: number
  memory_coverage_pct: number
  started_at: string
  completed_at: string | null
  receipt_id: string
  task_summary: { completed: number; failed: number; invalid: number; abstained: number; used: number; rejected: number; contradicted: number }
}

export interface RuntimeLessonView {
  lesson_id: string
  version: number
  kind: string
  effect: string
  status: string
  owner: string
  activated_at: string
  review_due: string
  distinct_issuer_count: number
  supporting_evidence_count: number
  contradicting_evidence_count: number
  lesson_sha256: string
  promotion_manifest_sha256: string | null
}

export interface RuntimePlaybookView {
  playbook_id: string
  version: number
  procedure_key: string
  risk_class: string
  required: boolean
  status: string
  status_reason: string | null
  owner: string
  activated_at: string
  expires_at: string
  validation_case_count: number
  originating_episode_count: number
  execution_count: number
  failed_execution_count: number
  deviation_count: number
  playbook_sha256: string
  promotion_manifest_sha256: string
}

export interface RuntimeCandidateView {
  candidate_id: string
  layer: 'semantic' | 'procedural'
  kind: string
  status: string
  created_at: string
  creator: string
  classification: string
  candidate_sha256: string
}

export interface RuntimeAlertView {
  code: string
  severity: 'info' | 'warning' | 'critical'
  message: string
}

export interface RuntimeRead {
  contract_version: typeof MEMORY_RUNTIME_CONTRACT
  available: boolean
  read_only: true
  generated_at: string
  state: RuntimeState
  mode: MemoryMode
  effective_mode: MemoryMode
  controls: RuntimeControlView
  counts: {
    runs: number; task_episodes: number; lessons: number; playbooks: number
    candidates: number; executions: number; promotions: number; quarantines: number
    packets: number; used_items: number; rejected_items: number; contradicted_items: number; deviations: number
  }
  readiness: { status: 'met' | 'failed' | 'unmeasured'; evaluated_at: string | null; report_sha256: string | null }
  slos: Array<{ name: string; status: string; target: string }>
  alerts: RuntimeAlertView[]
  services: Array<{ role: string; identity: string | null; configured: boolean }>
}

interface RuntimeSnapshot {
  runtime: RuntimeRead
  runs: RuntimeRunView[]
  lessons: RuntimeLessonView[]
  playbooks: RuntimePlaybookView[]
  candidates: RuntimeCandidateView[]
}

export interface RuntimeReaderOptions {
  repoRoot: string
  stateRoot: string
  mode: MemoryMode
  serviceIdentities?: Record<string, string | undefined>
  now?: () => number
  ttlMs?: number
  maxStaleMs?: number
  controlExec?: (args: string[]) => Promise<Record<string, unknown>>
}

export type RuntimeControlOperation =
  | { operation: 'global-disable' | 'global-enable' | 'candidate-intake-disable' | 'candidate-intake-enable' }
  | { operation: 'layer-disable' | 'layer-enable'; layer: 'episodic' | 'semantic' | 'procedural' }
  | { operation: 'playbook-quarantine'; playbook_id: string; version?: number; reason: string }
  | { operation: 'playbook-restore'; playbook_id: string; version?: number }
  | { operation: 'playbook-pin'; playbook_id: string; version: number }
  | { operation: 'playbook-unpin'; playbook_id: string }

const EMPTY_CONTROLS: RuntimeControlView = {
  revision: 0, updated_at: null, global_disabled: false, disabled_layers: [],
  disabled_playbooks: [], pinned_playbooks: [], candidate_intake_disabled: false,
  control_sha256: null,
}

function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  return clean && clean.length <= MAX_TEXT ? clean : fallback
}

function id(value: unknown, fallback = ''): string {
  const candidate = text(value)
  return SAFE_ID.test(candidate) ? candidate : fallback
}

function integer(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : fallback
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function iso(value: unknown): string | null {
  const candidate = text(value)
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null
}

function hash(value: unknown): string | null {
  const candidate = text(value)
  return /^sha256:[a-f0-9]{64}$/.test(candidate) ? candidate : null
}

async function privateFileText(file: string): Promise<string | null> {
  let handle: fs.promises.FileHandle | null = null
  try {
    const before = await fs.promises.lstat(file)
    if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1
        || before.size <= 0 || before.size > MAX_FILE_BYTES
        || (process.getuid && before.uid !== process.getuid()) || (before.mode & 0o077) !== 0) {
      throw new Error('memory runtime file is unsafe')
    }
    handle = await fs.promises.open(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
    const opened = await handle.stat()
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== before.dev || opened.ino !== before.ino
        || opened.size !== before.size || (process.getuid && opened.uid !== process.getuid())
        || (opened.mode & 0o077) !== 0) throw new Error('memory runtime file changed during open')
    return await handle.readFile({ encoding: 'utf8' })
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    throw error
  } finally {
    if (handle !== null) await handle.close()
  }
}

async function safeJson(file: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await privateFileText(file)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return object(parsed) ? parsed : null
  } catch { return null }
}

async function privateRegular(file: string): Promise<boolean> {
  let handle: fs.promises.FileHandle | null = null
  try {
    const before = await fs.promises.lstat(file)
    if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size <= 0
        || (process.getuid && before.uid !== process.getuid()) || (before.mode & 0o077) !== 0) return false
    handle = await fs.promises.open(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
    const opened = await handle.stat()
    return opened.isFile() && opened.nlink === 1 && opened.dev === before.dev && opened.ino === before.ino
      && opened.size === before.size && (!process.getuid || opened.uid === process.getuid())
      && (opened.mode & 0o077) === 0
  } catch { return false } finally {
    if (handle !== null) await handle.close()
  }
}

async function filesUnder(root: string): Promise<string[]> {
  let rootInfo: fs.Stats
  try {
    rootInfo = await fs.promises.lstat(root)
  } catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()
      || (process.getuid && rootInfo.uid !== process.getuid()) || (rootInfo.mode & 0o077) !== 0) {
    throw new Error('memory runtime root is invalid')
  }
  const result: string[] = []
  const pending = [root]
  while (pending.length) {
    const directory = pending.pop()!
    const directoryInfo = await fs.promises.lstat(directory)
    if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()
        || (process.getuid && directoryInfo.uid !== process.getuid()) || (directoryInfo.mode & 0o077) !== 0) {
      throw new Error('memory runtime directory is invalid')
    }
    for (const entry of await fs.promises.readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue
      const candidate = path.join(directory, entry.name)
      if (entry.isDirectory()) pending.push(candidate)
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        result.push(candidate)
        if (result.length > MAX_FILES) throw new Error('memory runtime metadata exceeds bounded scan')
      }
    }
  }
  return result.sort()
}

async function controlsFrom(root: string): Promise<RuntimeControlView> {
  const file = path.join(root, 'controls', 'runtime-controls.json')
  const raw = await privateFileText(file)
  if (raw === null) return { ...EMPTY_CONTROLS }
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { parsed = null }
  const value = object(parsed) ? parsed : null
  if (!value || value.schema !== 'memory-runtime-controls/v1') throw new Error('memory runtime control file is invalid')
  const fields = [
    'candidate_intake_disabled', 'control_sha256', 'disabled_layers', 'disabled_playbooks',
    'global_disabled', 'pinned_playbooks', 'revision', 'schema', 'updated_at', 'updated_by',
  ]
  if (Object.keys(value).sort().join('\0') !== fields.join('\0')
      || integer(value.revision, -1) < 0 || !iso(value.updated_at) || !id(value.updated_by)
      || typeof value.global_disabled !== 'boolean' || typeof value.candidate_intake_disabled !== 'boolean') {
    throw new Error('memory runtime control shape is invalid')
  }
  const supplied = hash(value.control_sha256)
  const body = { ...value }
  delete body.control_sha256
  const actual = `sha256:${createHash('sha256').update(canonicalJsonText(body)).digest('hex')}`
  if (!supplied || supplied !== actual) throw new Error('memory runtime control integrity failed')
  if (!Array.isArray(value.disabled_layers) || value.disabled_layers.length > 3) {
    throw new Error('memory runtime layer controls are invalid')
  }
  const disabledLayers = value.disabled_layers.filter((item): item is 'episodic' | 'semantic' | 'procedural' =>
    item === 'episodic' || item === 'semantic' || item === 'procedural')
  if (disabledLayers.length !== value.disabled_layers.length
      || new Set(disabledLayers).size !== disabledLayers.length) {
    throw new Error('memory runtime layer control entry is invalid')
  }
  if (!Array.isArray(value.disabled_playbooks) || value.disabled_playbooks.length > 512
      || !Array.isArray(value.pinned_playbooks) || value.pinned_playbooks.length > 512) {
    throw new Error('memory runtime playbook controls are invalid')
  }
  const disabledPlaybooks = value.disabled_playbooks.flatMap((item) => {
    if (!object(item) || Object.keys(item).sort().join('\0') !== 'disabled_at\0playbook_id\0reason\0version') return []
    const playbookId = id(item.playbook_id)
    const disabledAt = iso(item.disabled_at)
    const reason = text(item.reason)
    const version = item.version === null ? null : integer(item.version, -1)
    return playbookId && disabledAt && reason && (version === null || version >= 1)
      ? [{ playbook_id: playbookId, version, reason, disabled_at: disabledAt }] : []
  })
  const pinnedPlaybooks = value.pinned_playbooks.flatMap((item) => {
    if (!object(item) || Object.keys(item).sort().join('\0') !== 'pinned_at\0playbook_id\0version') return []
    const playbookId = id(item.playbook_id)
    const pinnedAt = iso(item.pinned_at)
    const version = integer(item.version)
    return playbookId && pinnedAt && version >= 1 ? [{ playbook_id: playbookId, version, pinned_at: pinnedAt }] : []
  })
  if (disabledPlaybooks.length !== value.disabled_playbooks.length
      || pinnedPlaybooks.length !== value.pinned_playbooks.length) {
    throw new Error('memory runtime playbook control entry is invalid')
  }
  return {
    revision: integer(value.revision), updated_at: iso(value.updated_at),
    global_disabled: value.global_disabled === true,
    disabled_layers: [...new Set(disabledLayers)].sort(),
    disabled_playbooks: disabledPlaybooks,
    pinned_playbooks: pinnedPlaybooks,
    candidate_intake_disabled: value.candidate_intake_disabled === true,
    control_sha256: supplied,
  }
}

function candidateView(value: Record<string, unknown>): RuntimeCandidateView | null {
  if (value.schema === 'memory-semantic-protected-queue/v1') return null
  const semantic = value.schema === 'memory-semantic-candidate/v1'
  const procedural = value.schema === 'memory-playbook-candidate/v1'
  if (!semantic && !procedural) return null
  const createdBy = object(value.created_by) ? value.created_by : {}
  const policy = object(value.policy) ? value.policy : {}
  const candidateId = id(value.candidate_id)
  const candidateHash = hash(value.candidate_sha256)
  if (!candidateId || !candidateHash) return null
  return {
    candidate_id: candidateId, layer: semantic ? 'semantic' : 'procedural',
    kind: semantic ? text(value.candidate_type, 'unknown') : text(object(value.playbook) ? value.playbook.procedure_key : '', 'unknown'),
    status: text(value.status, 'candidate'), created_at: iso(value.created_at) || '',
    creator: id(createdBy.id, 'redacted'), classification: text(policy.classification, 'internal'),
    candidate_sha256: candidateHash,
  }
}

function lessonView(value: Record<string, unknown>, manifestHash: string | null): RuntimeLessonView | null {
  if (value.schema !== 'memory-semantic-lesson/v1') return null
  const semantic = object(value.semantic) ? value.semantic : {}
  const lessonId = id(value.lesson_id)
  const lessonHash = hash(value.lesson_sha256)
  if (!lessonId || !lessonHash) return null
  return {
    lesson_id: lessonId, version: integer(value.version), kind: text(semantic.lesson_kind, 'unknown'),
    effect: text(semantic.effect, 'unknown'), status: text(value.status, 'unknown'),
    owner: id(value.owner, 'redacted'), activated_at: iso(value.activated_at) || '',
    review_due: text(semantic.review_due), distinct_issuer_count: integer(semantic.distinct_issuer_count),
    supporting_evidence_count: Array.isArray(semantic.supporting_evidence) ? semantic.supporting_evidence.length : 0,
    contradicting_evidence_count: Array.isArray(semantic.contradicting_evidence) ? semantic.contradicting_evidence.length : 0,
    lesson_sha256: lessonHash, promotion_manifest_sha256: manifestHash,
  }
}

interface ExecutionSummary { count: number; failed: number; deviations: number }
function executionSummaries(values: Record<string, unknown>[]): Map<string, ExecutionSummary> {
  const result = new Map<string, ExecutionSummary>()
  for (const value of values) {
    if (value.schema !== 'memory-playbook-execution/v1') continue
    const playbookId = id(value.playbook_id)
    if (!playbookId) continue
    const row = result.get(playbookId) || { count: 0, failed: 0, deviations: 0 }
    row.count++
    if (value.status === 'failed') row.failed++
    if (value.status === 'deviated' || (Array.isArray(value.deviation_codes) && value.deviation_codes.length)) row.deviations++
    result.set(playbookId, row)
  }
  return result
}

function playbookView(value: Record<string, unknown>, executions: Map<string, ExecutionSummary>): RuntimePlaybookView | null {
  if (value.schema !== 'memory-playbook/v1') return null
  const core = object(value.playbook) ? value.playbook : {}
  const playbookId = id(value.playbook_id)
  const playbookHash = hash(value.playbook_sha256)
  const manifestHash = hash(value.promotion_manifest_sha256)
  if (!playbookId || !playbookHash || !manifestHash) return null
  const summary = executions.get(playbookId) || { count: 0, failed: 0, deviations: 0 }
  return {
    playbook_id: playbookId, version: integer(value.version), procedure_key: id(core.procedure_key, 'unknown'),
    risk_class: text(core.risk_class, 'unknown'), required: core.required === true,
    status: text(value.status, 'unknown'), status_reason: value.status_reason === null ? null : text(value.status_reason) || null,
    owner: id(core.owner, 'redacted'), activated_at: iso(value.activated_at) || '', expires_at: iso(value.expires_at) || '',
    validation_case_count: Array.isArray(core.validation_case_ids) ? core.validation_case_ids.length : 0,
    originating_episode_count: Array.isArray(core.originating_episode_ids) ? core.originating_episode_ids.length : 0,
    execution_count: summary.count, failed_execution_count: summary.failed, deviation_count: summary.deviations,
    playbook_sha256: playbookHash, promotion_manifest_sha256: manifestHash,
  }
}

function runView(value: Record<string, unknown>, taskValues: Record<string, unknown>[], useValues: Record<string, unknown>[]): RuntimeRunView | null {
  if (value.schema !== 'memory-run-episode/v1') return null
  const listing = object(value.issuer_listing) ? value.issuer_listing : {}
  const runId = id(value.run_id)
  const episodeId = id(value.episode_id)
  const receiptId = id(value.receipt_id)
  const mode = value.mode === 'off' || value.mode === 'shadow' || value.mode === 'enforced' ? value.mode : null
  if (!runId || !episodeId || !receiptId || !mode) return null
  const ownTasks = taskValues.filter((item) => item.schema === 'memory-task-episode/v1' && item.run_id === runId)
  const ownUses = useValues.filter((item) => item.schema === 'memory-use/v1' && item.run_id === runId)
  return {
    run_id: runId, episode_id: episodeId, ticker: id(listing.ticker, 'redacted'), venue: id(listing.mic, 'redacted'),
    mode, status: text(value.status, 'unknown'), expected_task_count: integer(value.expected_task_count),
    completed_task_count: integer(value.completed_task_count), memory_coverage_pct: number(value.memory_coverage_pct),
    started_at: iso(value.started_at) || '', completed_at: value.completed_at === null ? null : iso(value.completed_at),
    receipt_id: receiptId,
    task_summary: {
      completed: ownTasks.filter((item) => item.status === 'completed').length,
      failed: ownTasks.filter((item) => item.status === 'failed').length,
      invalid: ownTasks.filter((item) => item.status === 'invalid').length,
      abstained: ownTasks.filter((item) => item.status === 'abstained').length,
      used: ownUses.reduce((total, item) => total + (Array.isArray(item.used) ? item.used.length : 0), 0),
      rejected: ownUses.reduce((total, item) => total + (Array.isArray(item.checked_rejected) ? item.checked_rejected.length : 0), 0),
      contradicted: ownUses.reduce((total, item) => total + (Array.isArray(item.contradicted) ? item.contradicted.length : 0), 0),
    },
  }
}

function targetText(value: unknown): string {
  if (!object(value)) return 'fixed contract target'
  const entries = Object.entries(value).slice(0, 4).map(([key, item]) => `${key}=${String(item)}`)
  return entries.join(', ').slice(0, MAX_TEXT) || 'fixed contract target'
}

async function readinessFrom(root: string): Promise<RuntimeRead['readiness'] & { slos: RuntimeRead['slos'] }> {
  const file = path.join(root, 'operations', 'readiness-report.json')
  const raw = await privateFileText(file)
  if (raw === null) {
    return { status: 'unmeasured', evaluated_at: null, report_sha256: null, slos: [] }
  }
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { parsed = null }
  const report = object(parsed) ? parsed : null
  if (!report || report.schema !== 'memory-operational-readiness-report/v1') throw new Error('memory readiness report is invalid')
  const supplied = hash(report.report_sha256)
  const body = { ...report }
  delete body.report_sha256
  const actual = `sha256:${createHash('sha256').update(canonicalJsonText(body)).digest('hex')}`
  if (!supplied || supplied !== actual) throw new Error('memory readiness report integrity failed')
  const status = report.status === 'met' || report.status === 'failed' || report.status === 'unmeasured'
    ? report.status : 'unmeasured'
  const slos = Array.isArray(report.slos) ? report.slos.flatMap((item) => {
    if (!object(item)) return []
    const name = id(item.slo_id) || id(item.id) || id(item.name)
    const rowStatus = text(item.status)
    return name && rowStatus ? [{ name, status: rowStatus, target: targetText(item.target) }] : []
  }) : []
  return { status, evaluated_at: iso(report.evaluated_at), report_sha256: supplied, slos }
}

function dedupeLatest<T>(values: T[], key: (item: T) => string, version: (item: T) => number): T[] {
  const latest = new Map<string, T>()
  for (const value of values) {
    const prior = latest.get(key(value))
    if (!prior || version(value) > version(prior)) latest.set(key(value), value)
  }
  return [...latest.values()].sort((left, right) => key(left).localeCompare(key(right)))
}

async function buildSnapshot(options: RuntimeReaderOptions): Promise<RuntimeSnapshot> {
  const root = path.resolve(options.stateRoot)
  const now = new Date((options.now || Date.now)()).toISOString()
  let rootMissing = false
  try {
    await fs.promises.lstat(root)
  } catch (error: any) {
    if (error?.code === 'ENOENT') rootMissing = true
    else throw error
  }
  if (rootMissing) {
    const runtime: RuntimeRead = {
      contract_version: MEMORY_RUNTIME_CONTRACT, available: options.mode === 'off', read_only: true,
      generated_at: now, state: options.mode === 'off' ? 'disabled' : 'unavailable', mode: options.mode,
      effective_mode: 'off', controls: { ...EMPTY_CONTROLS },
      counts: { runs: 0, task_episodes: 0, lessons: 0, playbooks: 0, candidates: 0, executions: 0, promotions: 0, quarantines: 0, packets: 0, used_items: 0, rejected_items: 0, contradicted_items: 0, deviations: 0 },
      readiness: { status: 'unmeasured', evaluated_at: null, report_sha256: null }, slos: [],
      alerts: options.mode === 'off' ? [] : [{ code: 'runtime-state-missing', severity: 'critical', message: 'Memory runtime state is unavailable.' }],
      services: Object.entries(options.serviceIdentities || {}).map(([role, identity]) => ({ role, identity: identity || null, configured: Boolean(identity) })),
    }
    return { runtime, runs: [], lessons: [], playbooks: [], candidates: [] }
  }
  const allFiles = await filesUnder(root)
  const values: Array<{ file: string; value: Record<string, unknown> }> = []
  for (const file of allFiles) {
    const value = await safeJson(file)
    if (value) values.push({ file, value })
  }
  const visibleValues = values.filter((item) => item.value.schema !== 'memory-semantic-protected-queue/v1')
  const controls = await controlsFrom(root)
  const executions = visibleValues.map((item) => item.value).filter((item) => item.schema === 'memory-playbook-execution/v1')
  const executionMap = executionSummaries(executions)
  const manifestByDirectory = new Map<string, string>()
  for (const { file, value } of visibleValues) {
    if (value.schema === 'memory-promotion-manifest/v1') {
      const manifestHash = hash(value.manifest_sha256)
      if (manifestHash) manifestByDirectory.set(path.dirname(file), manifestHash)
    }
  }
  const lessonRows = visibleValues.flatMap(({ file, value }) => {
    const row = lessonView(value, manifestByDirectory.get(path.dirname(file)) || null)
    return row ? [row] : []
  })
  const playbookRows = visibleValues.flatMap(({ value }) => {
    const row = playbookView(value, executionMap)
    return row ? [row] : []
  })
  const candidates = visibleValues.flatMap(({ value }) => {
    const row = candidateView(value)
    return row ? [row] : []
  }).sort((left, right) => right.created_at.localeCompare(left.created_at))
  const tasks = visibleValues.map((item) => item.value).filter((item) => item.schema === 'memory-task-episode/v1')
  const uses = visibleValues.map((item) => item.value).filter((item) => item.schema === 'memory-use/v1')
  const runs = visibleValues.flatMap(({ value }) => {
    const row = runView(value, tasks, uses)
    return row ? [row] : []
  }).sort((left, right) => right.started_at.localeCompare(left.started_at))
  const lessons = dedupeLatest(lessonRows, (item) => item.lesson_id, (item) => item.version)
  const playbooks = dedupeLatest(playbookRows, (item) => item.playbook_id, (item) => item.version).map((item) => {
    const local = controls.disabled_playbooks.find((row) => row.playbook_id === item.playbook_id
      && (row.version === null || row.version === item.version))
    return local ? { ...item, status: 'quarantined-local', status_reason: local.reason } : item
  })
  const readiness = await readinessFrom(root)
  const alerts: RuntimeAlertView[] = []
  const projectionReady = await privateRegular(path.join(root, 'projection.sqlite'))
  if (options.mode !== 'off' && !projectionReady) alerts.push({ code: 'projection-missing', severity: 'critical', message: 'The verified production memory projection is unavailable.' })
  if (controls.global_disabled) alerts.push({ code: 'global-kill-switch', severity: 'critical', message: 'The global memory kill switch is active.' })
  if (controls.disabled_layers.length) alerts.push({ code: 'layers-disabled', severity: 'warning', message: `${controls.disabled_layers.length} memory layer switch(es) are disabled.` })
  if (controls.disabled_playbooks.length) alerts.push({ code: 'playbooks-quarantined', severity: 'warning', message: `${controls.disabled_playbooks.length} playbook quarantine(s) are active.` })
  if (readiness.status === 'failed') alerts.push({ code: 'readiness-failed', severity: 'critical', message: 'Operational readiness evidence failed at least one fixed gate.' })
  if (readiness.status === 'unmeasured') alerts.push({ code: 'readiness-unmeasured', severity: 'warning', message: 'Production readiness is not fully measured.' })
  const blockedRuns = runs.filter((item) => item.status === 'blocked' || item.memory_coverage_pct < 100).length
  if (blockedRuns) alerts.push({ code: 'run-coverage', severity: 'critical', message: `${blockedRuns} run(s) are blocked or below full memory coverage.` })
  if (candidates.length > 100) alerts.push({ code: 'promotion-backlog', severity: 'warning', message: `${candidates.length} visible candidates await review.` })
  const effectiveMode: MemoryMode = controls.global_disabled || (options.mode !== 'off' && !projectionReady) ? 'off' : options.mode
  const state: RuntimeState = options.mode !== 'off' && !projectionReady ? 'unavailable' : effectiveMode === 'off' ? 'disabled'
    : alerts.some((item) => item.severity === 'critical') ? 'degraded' : 'healthy'
  const runtime: RuntimeRead = {
    contract_version: MEMORY_RUNTIME_CONTRACT, available: options.mode === 'off' || projectionReady, read_only: true,
    generated_at: now, state, mode: options.mode, effective_mode: effectiveMode, controls,
    counts: {
      runs: runs.length, task_episodes: tasks.length, lessons: lessons.length, playbooks: playbooks.length,
      candidates: candidates.length, executions: executions.length,
      promotions: visibleValues.filter((item) => item.value.schema === 'memory-promotion-manifest/v1').length,
      quarantines: controls.disabled_playbooks.length + visibleValues.filter(({ file }) => file.includes(`${path.sep}quarantines${path.sep}`)).length,
      packets: visibleValues.filter((item) => item.value.schema === 'memory-context-packet/v2').length,
      used_items: uses.reduce((total, item) => total + (Array.isArray(item.used) ? item.used.length : 0), 0),
      rejected_items: uses.reduce((total, item) => total + (Array.isArray(item.checked_rejected) ? item.checked_rejected.length : 0), 0),
      contradicted_items: uses.reduce((total, item) => total + (Array.isArray(item.contradicted) ? item.contradicted.length : 0), 0),
      deviations: executions.reduce((total, item) => total + (item.status === 'deviated' || (Array.isArray(item.deviation_codes) && item.deviation_codes.length) ? 1 : 0), 0),
    },
    readiness: { status: readiness.status, evaluated_at: readiness.evaluated_at, report_sha256: readiness.report_sha256 },
    slos: readiness.slos, alerts,
    services: Object.entries(options.serviceIdentities || {}).map(([role, identity]) => ({ role, identity: identity || null, configured: Boolean(identity) })),
  }
  return { runtime, runs, lessons, playbooks, candidates }
}

function defaultControlExec(repoRoot: string, stateRoot: string, actor: string) {
  return (args: string[]): Promise<Record<string, unknown>> => new Promise((resolve, reject) => {
    execFile('python3', [path.join(repoRoot, 'scripts', 'memory_incident_control.py'), '--state-root', stateRoot, '--actor', actor, ...args], {
      cwd: repoRoot, encoding: 'utf8', timeout: 10_000, maxBuffer: 1024 * 1024, windowsHide: true,
      env: { ...process.env, PYTHONPATH: path.join(repoRoot, 'scripts') },
    }, (error, stdout) => {
      let value: unknown
      try { value = JSON.parse(stdout) } catch { value = null }
      if (error || !object(value) || value.ok !== true) return reject(new Error(text(object(value) ? value.code : '', 'memory incident control failed')))
      resolve(value)
    })
  })
}

function operationArgs(operation: RuntimeControlOperation): string[] {
  const args: string[] = [operation.operation]
  if ('layer' in operation) args.push('--layer', operation.layer)
  if ('playbook_id' in operation) {
    if (!SAFE_ID.test(operation.playbook_id)) throw new Error('invalid playbook id')
    args.push('--playbook-id', operation.playbook_id)
  }
  if ('version' in operation && operation.version !== undefined) {
    if (!Number.isSafeInteger(operation.version) || operation.version < 1) throw new Error('invalid playbook version')
    args.push('--version', String(operation.version))
  }
  if ('reason' in operation) args.push('--reason', operation.reason)
  return args
}

export function createMemoryRuntimeReader(options: RuntimeReaderOptions) {
  const now = options.now || Date.now
  const ttlMs = Math.max(1_000, Math.min(options.ttlMs ?? DEFAULT_TTL_MS, 60_000))
  const maxStaleMs = Math.max(1_000, Math.min(options.maxStaleMs ?? DEFAULT_MAX_STALE_MS, 10 * 60_000))
  const actor = options.serviceIdentities?.['emergency-quarantine'] || 'memory-quarantine-service'
  const controlExec = options.controlExec || defaultControlExec(path.resolve(options.repoRoot), path.resolve(options.stateRoot), actor)
  let cached: { snapshot: RuntimeSnapshot; freshUntil: number; staleUntil: number } | null = null
  let inflight: Promise<RuntimeSnapshot> | null = null
  let cacheEpoch = 0

  const read = async (): Promise<RuntimeSnapshot> => {
    const at = now()
    if (cached && at < cached.freshUntil) return cached.snapshot
    if (inflight) return inflight
    const epoch = cacheEpoch
    const scan = (async (): Promise<RuntimeSnapshot> => {
      try {
        const snapshot = await buildSnapshot(options)
        if (cacheEpoch === epoch) {
          cached = { snapshot, freshUntil: at + ttlMs, staleUntil: at + ttlMs + maxStaleMs }
        }
        return snapshot
      } catch {
        if (cached && at < cached.staleUntil) {
          return {
            ...cached.snapshot,
            runtime: {
              ...cached.snapshot.runtime, state: 'degraded',
              alerts: [...cached.snapshot.runtime.alerts, { code: 'runtime-view-stale', severity: 'warning', message: 'Showing the last verified runtime view inside its bounded stale window.' }],
            },
          }
        }
        return await buildSnapshot({ ...options, stateRoot: path.join(options.stateRoot, '.unavailable') })
      }
    })()
    inflight = scan
    try { return await scan } finally {
      if (inflight === scan) inflight = null
    }
  }

  return {
    runtime: async () => (await read()).runtime,
    runs: async (runId?: string) => {
      const snapshot = await read()
      return runId ? snapshot.runs.find((item) => item.run_id === runId) || null : snapshot.runs
    },
    lessons: async () => (await read()).lessons,
    playbooks: async () => (await read()).playbooks,
    candidates: async () => (await read()).candidates,
    async control(operation: RuntimeControlOperation): Promise<RuntimeRead> {
      await controlExec(operationArgs(operation))
      cacheEpoch++
      cached = null
      inflight = null
      return (await read()).runtime
    },
  }
}
