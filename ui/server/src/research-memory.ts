import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execa } from 'execa'
import { DATA_DIR, REPO_ROOT, STATE_DIR } from './config'
import type { RunState } from './registry'
import { buildSwarmGraph } from './roster'
import { canonicalJsonText } from './canonical-json'
import type { ResearchMemoryIdentity, ResearchMemoryRuntimeBinding } from './types'

export type ResearchMemoryMode = 'off' | 'shadow' | 'enforced'

interface MemoryConfig {
  mode: ResearchMemoryMode
  stateRoot: string
  checkpoint: string
  writerOwner: string
  writerHead: string
  canonicalLedger: string
  protectedStore: string
  protectedMasterKey: string
  protectedKeyId: string
  projectionServiceIdentity: string
  checkpointPrivateKey: string
  checkpointPublicKey: string
  checkpointKeyId: string
  contractPrivateKey: string
  contractPublicKey: string
  contractKeyId: string
  providerPolicy: string
  policyPublicKey: string
  policyKeyId: string
  serviceIdentity: string
  enforcementActivation: string
  enforcementReadiness: string
  enforcementThreeLayer: string
  enforcementShadow: string
  enforcementPublicKey: string
  enforcementKeyId: string
}

interface PrepareResult {
  ok: boolean
  reused: boolean
  receipt_id: string
  receipt_path: string
  projection_path: string
  receipt_sha256: string
  authorization_id: string
  authorization_path: string
  authorization_sha256: string
}

interface RuntimeControls {
  globalDisabled: boolean
  disabledLayers: string[]
  disabledPlaybooks: Array<{ playbookId: string; version: number | null }>
  pinnedPlaybooks: Array<{ playbookId: string; version: number }>
}

type MemoryExecutor = (args: string[]) => Promise<Record<string, any>>

const HASH = /^sha256:[a-f0-9]{64}$/
const preparation = new Map<string, Promise<PrepareResult>>()
const preparationScope = new Map<string, string>()
const preparationTail = new Map<string, Promise<PrepareResult>>()

export function researchMemoryMode(env: NodeJS.ProcessEnv = process.env): ResearchMemoryMode {
  const value = String(env.NOSTRA_MEMORY_MODE || 'off').trim().toLowerCase()
  if (value === 'off' || value === 'shadow' || value === 'enforced') return value
  throw new Error(`invalid NOSTRA_MEMORY_MODE '${value}'`)
}

function runtimeControls(stateRoot: string): RuntimeControls {
  const file = path.join(stateRoot, 'controls', 'runtime-controls.json')
  if (!fs.existsSync(file)) return { globalDisabled: false, disabledLayers: [], disabledPlaybooks: [], pinnedPlaybooks: [] }
  let descriptor: number | null = null
  let raw: string
  try {
    const before = fs.lstatSync(file)
    if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1
        || before.size <= 0 || before.size > 1024 * 1024
        || (process.getuid && before.uid !== process.getuid()) || (before.mode & 0o077) !== 0) {
      throw new Error('memory runtime controls are not an owner-only regular file')
    }
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
    const opened = fs.fstatSync(descriptor)
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== before.dev || opened.ino !== before.ino
        || opened.size !== before.size || (process.getuid && opened.uid !== process.getuid())
        || (opened.mode & 0o077) !== 0) throw new Error('memory runtime controls changed during open')
    raw = fs.readFileSync(descriptor, 'utf8')
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
  }
  const value: unknown = JSON.parse(raw)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('memory runtime controls are invalid')
  const row = value as Record<string, unknown>
  const fields = [
    'schema', 'revision', 'updated_at', 'updated_by', 'global_disabled', 'disabled_layers',
    'disabled_playbooks', 'pinned_playbooks', 'candidate_intake_disabled', 'control_sha256',
  ]
  if (Object.keys(row).sort().join('\0') !== fields.sort().join('\0')
      || row.schema !== 'memory-runtime-controls/v1'
      || !Number.isSafeInteger(row.revision) || Number(row.revision) < 0
      || typeof row.updated_at !== 'string' || !Number.isFinite(Date.parse(row.updated_at))
      || typeof row.updated_by !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,127}$/.test(row.updated_by)
      || typeof row.global_disabled !== 'boolean'
      || !Array.isArray(row.disabled_layers) || !Array.isArray(row.disabled_playbooks)
      || !Array.isArray(row.pinned_playbooks)
      || typeof row.candidate_intake_disabled !== 'boolean'
      || typeof row.control_sha256 !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(row.control_sha256)) {
    throw new Error('memory runtime controls are invalid')
  }
  const body = { ...row }
  delete body.control_sha256
  const actual = `sha256:${createHash('sha256').update(canonicalJsonText(body)).digest('hex')}`
  if (actual !== row.control_sha256) throw new Error('memory runtime controls failed integrity verification')
  const disabledLayers = row.disabled_layers.map((item) => String(item))
  if (new Set(disabledLayers).size !== disabledLayers.length
      || disabledLayers.some((item) => !['episodic', 'semantic', 'procedural'].includes(item))) {
    throw new Error('memory runtime layer controls are invalid')
  }
  const disabledPlaybooks = row.disabled_playbooks.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('memory runtime playbook control is invalid')
    const entry = item as Record<string, unknown>
    const playbookId = String(entry.playbook_id || '')
    const version = entry.version === null ? null : Number(entry.version)
    if (Object.keys(entry).sort().join('\0') !== ['disabled_at', 'playbook_id', 'reason', 'version'].join('\0')
        || !/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,127}$/.test(playbookId)
        || (version !== null && (!Number.isSafeInteger(version) || version < 1))) {
      throw new Error('memory runtime playbook control is invalid')
    }
    return { playbookId, version }
  })
  const pinnedPlaybooks = row.pinned_playbooks.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('memory runtime playbook pin is invalid')
    const entry = item as Record<string, unknown>
    const playbookId = String(entry.playbook_id || '')
    const version = Number(entry.version)
    if (Object.keys(entry).sort().join('\0') !== ['pinned_at', 'playbook_id', 'version'].join('\0')
        || !/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,127}$/.test(playbookId)
        || !Number.isSafeInteger(version) || version < 1) throw new Error('memory runtime playbook pin is invalid')
    return { playbookId, version }
  })
  return { globalDisabled: row.global_disabled, disabledLayers, disabledPlaybooks, pinnedPlaybooks }
}

function memoryConfig(env: NodeJS.ProcessEnv = process.env): MemoryConfig {
  const mode = researchMemoryMode(env)
  const read = (key: string, fallback = '') => String(env[key] || fallback).trim()
  const config: MemoryConfig = {
    mode,
    stateRoot: path.resolve(read('NOSTRA_MEMORY_STATE_ROOT', path.join(STATE_DIR, 'memory-runtime'))),
    checkpoint: read('NOSTRA_MEMORY_CHECKPOINT'),
    writerOwner: read('NOSTRA_MEMORY_WRITER_OWNER'),
    writerHead: read('NOSTRA_MEMORY_WRITER_HEAD'),
    canonicalLedger: read('NOSTRA_MEMORY_CANONICAL_LEDGER'),
    protectedStore: read('NOSTRA_MEMORY_PROTECTED_STORE'),
    protectedMasterKey: read('NOSTRA_MEMORY_PROTECTED_MASTER_KEY'),
    protectedKeyId: read('NOSTRA_MEMORY_PROTECTED_KEY_ID'),
    projectionServiceIdentity: read('NOSTRA_MEMORY_PROJECTION_SERVICE_IDENTITY'),
    checkpointPrivateKey: read('NOSTRA_MEMORY_CHECKPOINT_PRIVATE_KEY'),
    checkpointPublicKey: read('NOSTRA_MEMORY_CHECKPOINT_PUBLIC_KEY'),
    checkpointKeyId: read('NOSTRA_MEMORY_CHECKPOINT_KEY_ID'),
    contractPrivateKey: read('NOSTRA_MEMORY_CONTRACT_PRIVATE_KEY'),
    contractPublicKey: read('NOSTRA_MEMORY_CONTRACT_PUBLIC_KEY'),
    contractKeyId: read('NOSTRA_MEMORY_CONTRACT_KEY_ID'),
    providerPolicy: read('NOSTRA_MEMORY_PROVIDER_POLICY'),
    policyPublicKey: read('NOSTRA_MEMORY_POLICY_PUBLIC_KEY'),
    policyKeyId: read('NOSTRA_MEMORY_POLICY_KEY_ID'),
    serviceIdentity: read('NOSTRA_MEMORY_SERVICE_IDENTITY', 'cockpit-runtime'),
    enforcementActivation: path.resolve(read(
      'NOSTRA_MEMORY_ENFORCEMENT_ACTIVATION',
      path.join(read('NOSTRA_MEMORY_STATE_ROOT', path.join(STATE_DIR, 'memory-runtime')), 'operations', 'enforcement-activation.json'),
    )),
    enforcementReadiness: path.resolve(read(
      'NOSTRA_MEMORY_ENFORCEMENT_READINESS',
      path.join(read('NOSTRA_MEMORY_STATE_ROOT', path.join(STATE_DIR, 'memory-runtime')), 'operations', 'readiness-report.json'),
    )),
    enforcementThreeLayer: path.resolve(read(
      'NOSTRA_MEMORY_ENFORCEMENT_THREE_LAYER',
      path.join(read('NOSTRA_MEMORY_STATE_ROOT', path.join(STATE_DIR, 'memory-runtime')), 'operations', 'three-layer-benchmark-report.json'),
    )),
    enforcementShadow: path.resolve(read(
      'NOSTRA_MEMORY_ENFORCEMENT_SHADOW',
      path.join(read('NOSTRA_MEMORY_STATE_ROOT', path.join(STATE_DIR, 'memory-runtime')), 'operations', 'shadow-evaluation-report.json'),
    )),
    enforcementPublicKey: read('NOSTRA_MEMORY_ENFORCEMENT_PUBLIC_KEY'),
    enforcementKeyId: read('NOSTRA_MEMORY_ENFORCEMENT_KEY_ID'),
  }
  if (mode !== 'off') {
    const missing = Object.entries(config)
      .filter(([key, value]) => key !== 'mode' && key !== 'stateRoot'
        && (mode === 'enforced' || !key.startsWith('enforcement')) && !value)
      .map(([key]) => key)
    if (missing.length) throw new Error(`memory runtime configuration is incomplete: ${missing.join(', ')}`)
  }
  return config
}

function eligible(run: RunState): boolean {
  return run.swarmId === 'research' && !run.parityCanary
    && ['full', 'module', 'agent', 'rerun'].includes(run.kind)
}

function logicalRunId(run: RunState): string {
  if ((run.chained || run.kind === 'full') && run.runRoot) {
    return `equity-${createHash('sha256').update(run.runRoot).digest('hex').slice(0, 32)}`
  }
  return `equity-${run.runId}`
}

function expectedTaskCount(run: RunState): number {
  if (run.chained) return buildSwarmGraph('research').totals.agents + 1
  if (run.kind === 'full') return buildSwarmGraph('research').totals.agents + 1
  return Math.max(1, run.expected.size)
}

function finalizesOnClose(run: RunState): boolean {
  if (!run.chained) return true
  return run.kind === 'rerun' && run.module === 'master'
}

function safeIdentity(value: unknown, ticker: string): ResearchMemoryIdentity | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const legalName = row.legalName ?? row.legal_name ?? row.company_name
  const venue = row.venue ?? row.exchange
  const currency = row.currency
  const boundTicker = row.ticker
  const identifiers = row.identifiers ?? []
  if (typeof legalName !== 'string' || !legalName.trim() || typeof venue !== 'string' || !venue.trim()
      || typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)
      || typeof boundTicker !== 'string' || boundTicker.toUpperCase() !== ticker.toUpperCase()
      || !Array.isArray(identifiers) || identifiers.some((item) => typeof item !== 'string')) return null
  return {
    legalName: legalName.trim(), venue: venue.trim(), currency,
    ticker: boundTicker.toUpperCase(), identifiers: [...new Set(identifiers as string[])].sort(),
  }
}

function loadIdentityFile(file: string, ticker: string): ResearchMemoryIdentity | null {
  try {
    const info = fs.lstatSync(file)
    if (!info.isFile() || info.isSymbolicLink()) return null
    return safeIdentity(JSON.parse(fs.readFileSync(file, 'utf8')), ticker)
  } catch { return null }
}

export function resolveRunMemoryIdentity(run: RunState): ResearchMemoryIdentity | null {
  if (run.memoryIdentity) return safeIdentity(run.memoryIdentity, run.ticker)
  // A first-run listing is explicitly staged beside its source pool. It is data, not authority:
  // the Python exact resolver must still match it against the frozen identity registry.
  const sidecar = loadIdentityFile(path.join(DATA_DIR, run.ticker, '.research-identity.json'), run.ticker)
  if (sidecar) return sidecar
  // Exact reruns are already bound to one immutable decision. Reuse its full legal tuple; never
  // infer venue/currency/company from the ticker itself.
  const roots = [run.selectedDecisionRunRoot, run.runRoot].filter((item): item is string => Boolean(item))
  for (const root of roots) {
    const identity = loadIdentityFile(path.join(REPO_ROOT, root, 'decision_record.json'), run.ticker)
    if (identity) return identity
  }
  return null
}

async function defaultExecutor(args: string[]): Promise<Record<string, any>> {
  const result = await execa('python3', ['scripts/research_memory_run_cli.py', ...args], {
    cwd: REPO_ROOT, env: { ...process.env, PYTHONPATH: path.join(REPO_ROOT, 'scripts') },
    extendEnv: false, reject: false, timeout: 30_000,
  })
  let parsed: any
  try { parsed = JSON.parse(result.stdout.trim()) } catch { parsed = null }
  if (result.exitCode !== 0 || !parsed?.ok) {
    throw new Error(String(parsed?.code || result.stderr || 'research memory supervisor failed'))
  }
  return parsed
}

function commonArgs(config: MemoryConfig, logical: string): string[] {
  return [
    '--root', REPO_ROOT, '--state-root', config.stateRoot, '--run-id', logical,
    '--contract-public-key', config.contractPublicKey, '--contract-key-id', config.contractKeyId,
  ]
}

async function verifyEnforcementGate(
  config: MemoryConfig, run: RunState, executor: MemoryExecutor,
): Promise<void> {
  if (config.mode !== 'enforced') return
  const result = await executor([
    'verify-enforcement', '--activation', config.enforcementActivation,
    '--readiness', config.enforcementReadiness,
    '--three-layer', config.enforcementThreeLayer,
    '--shadow', config.enforcementShadow,
    '--public-key', config.enforcementPublicKey, '--key-id', config.enforcementKeyId,
    '--provider', run.provider, '--model', run.model, '--now', new Date().toISOString(),
  ])
  if (result.schema !== 'memory-enforcement-verification/v1' || result.ok !== true
      || result.provider_model !== `${run.provider}/${run.model}`
      || typeof result.activation_sha256 !== 'string' || !HASH.test(result.activation_sha256)
      || typeof result.expires_at !== 'string' || !Number.isFinite(Date.parse(result.expires_at))) {
    throw new Error('signed memory enforcement activation did not verify')
  }
}

export async function prepareResearchMemory(
  run: RunState, executor: MemoryExecutor = defaultExecutor, env: NodeJS.ProcessEnv = process.env,
): Promise<ResearchMemoryRuntimeBinding> {
  const configuredMode = researchMemoryMode(env)
  const controlRoot = path.resolve(String(env.NOSTRA_MEMORY_STATE_ROOT || path.join(STATE_DIR, 'memory-runtime')))
  let controls: RuntimeControls
  try { controls = runtimeControls(controlRoot) } catch (error: any) {
    if (configuredMode === 'enforced') throw new Error(`memory snapshot blocked before spend: ${String(error?.message || error)}`)
    controls = { globalDisabled: true, disabledLayers: [], disabledPlaybooks: [], pinnedPlaybooks: [] }
  }
  const mode: ResearchMemoryMode = controls.globalDisabled ? 'off' : configuredMode
  const logical = logicalRunId(run)
  const binding: ResearchMemoryRuntimeBinding = {
    mode, logicalRunId: logical, status: mode === 'off' || !eligible(run) ? 'off' : 'preparing',
    expectedTaskCount: expectedTaskCount(run), finalizeOnClose: finalizesOnClose(run),
    startedAt: new Date().toISOString(),
  }
  run.memoryRuntime = binding
  if (binding.status === 'off') return binding
  try {
    const config = memoryConfig(env)
    await verifyEnforcementGate(config, run, executor)
    const identity = resolveRunMemoryIdentity(run)
    if (!identity) throw new Error('exact issuer/listing identity is absent; ticker-only memory is forbidden')
    const scope = `${run.provider}\0${run.model}`
    const preparationKey = `${logical}\0${scope}`
    let promise = preparationScope.get(logical) === scope ? preparation.get(preparationKey) : undefined
    if (!promise) {
      const predecessor = preparationTail.get(logical)
      promise = (predecessor ? predecessor.catch(() => undefined) : Promise.resolve()).then(() => executor([
        'prepare', ...commonArgs(config, logical), '--reuse',
        '--checkpoint', config.checkpoint, '--writer-owner', config.writerOwner,
        '--writer-head', config.writerHead,
        '--canonical-ledger', config.canonicalLedger,
        '--protected-store', config.protectedStore,
        '--protected-master-key', config.protectedMasterKey,
        '--protected-key-id', config.protectedKeyId,
        '--projection-service-identity', config.projectionServiceIdentity,
        '--checkpoint-private-key', config.checkpointPrivateKey,
        '--checkpoint-public-key', config.checkpointPublicKey,
        '--checkpoint-key-id', config.checkpointKeyId,
        '--contract-private-key', config.contractPrivateKey,
        '--provider-policy', config.providerPolicy,
        '--policy-public-key', config.policyPublicKey, '--policy-key-id', config.policyKeyId,
        '--provider', run.provider, '--model', run.model, '--service-identity', config.serviceIdentity,
        '--classification', 'public', '--classification', 'internal',
        '--source-tier', '1', '--source-tier', '2', '--source-tier', '3', '--source-tier', '4', '--source-tier', '5',
        '--legal-name', identity.legalName, '--venue', identity.venue,
        '--currency', identity.currency, '--ticker', identity.ticker,
        ...identity.identifiers.flatMap((item) => ['--identifier', item]),
      ]) as Promise<PrepareResult>)
      preparation.set(preparationKey, promise)
      preparationScope.set(logical, scope)
      preparationTail.set(logical, promise)
      void promise.then(
        () => {
          if (preparationTail.get(logical) === promise) preparationTail.delete(logical)
        },
        () => {
          preparation.delete(preparationKey)
          if (preparationTail.get(logical) === promise) preparationTail.delete(logical)
        },
      )
    }
    const result = await promise
    if (!result.receipt_id || !HASH.test(result.receipt_sha256)
        || !result.authorization_id || !HASH.test(result.authorization_sha256)
        || !path.isAbsolute(result.receipt_path) || !path.isAbsolute(result.projection_path)
        || !path.isAbsolute(result.authorization_path)) {
      throw new Error('memory supervisor returned an invalid preparation receipt')
    }
    Object.assign(binding, {
      status: 'verified', receiptId: result.receipt_id, receiptSha256: result.receipt_sha256,
      receiptPath: result.receipt_path, projectionPath: result.projection_path,
      authorizationId: result.authorization_id,
      authorizationSha256: result.authorization_sha256,
      authorizationPath: result.authorization_path,
    } satisfies Partial<ResearchMemoryRuntimeBinding>)
  } catch (error: any) {
    binding.status = mode === 'enforced' ? 'blocked' : 'unavailable'
    binding.error = String(error?.message || error).slice(0, 1000)
    if (mode === 'enforced') throw new Error(`memory snapshot blocked before spend: ${binding.error}`)
  }
  return binding
}

export async function verifyResearchMemoryBeforeSpawn(
  run: RunState, executor: MemoryExecutor = defaultExecutor, env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const binding = run.memoryRuntime
  if (!binding || binding.status === 'off' || binding.status === 'unavailable') return
  if (binding.status !== 'verified' || !binding.authorizationPath || !binding.authorizationSha256) {
    throw new Error('memory snapshot or provider authorization is not verified')
  }
  const config = memoryConfig(env)
  await verifyEnforcementGate(config, run, executor)
  if (runtimeControls(config.stateRoot).globalDisabled) {
    throw new Error('global memory kill switch activated after the run snapshot was frozen')
  }
  const result = await executor([
    'verify', ...commonArgs(config, binding.logicalRunId),
    '--authorization', binding.authorizationPath,
    '--authorization-sha256', binding.authorizationSha256,
  ])
  if (result.receipt_id !== binding.receiptId || result.receipt_sha256 !== binding.receiptSha256) {
    throw new Error('memory receipt changed before provider dispatch')
  }
  if (result.authorization_id !== binding.authorizationId
      || result.authorization_sha256 !== binding.authorizationSha256) {
    throw new Error('memory provider authorization changed before provider dispatch')
  }
}

export async function compileResearchMemoryPacket(
  run: RunState, agentKey: string, executor: MemoryExecutor = defaultExecutor,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Record<string, unknown>> {
  const binding = run.memoryRuntime
  if (!binding || binding.status !== 'verified') throw new Error('run has no verified memory snapshot')
  if (!binding.authorizationPath || !binding.authorizationSha256) {
    throw new Error('run has no verified provider authorization')
  }
  const expected = agentKey === 'master/synthesizer'
    ? run.kind === 'full' || run.expected.has(agentKey)
    : run.expected.has(agentKey)
  if (!expected) throw new Error('memory packet agent is outside the supervisor roster')
  const config = memoryConfig(env)
  const controls = runtimeControls(config.stateRoot)
  if (controls.globalDisabled) throw new Error('global memory kill switch is active')
  return executor([
    'compile', ...commonArgs(config, binding.logicalRunId),
    '--authorization', binding.authorizationPath,
    '--authorization-sha256', binding.authorizationSha256, '--agent-key', agentKey,
    '--valid-date', new Date(run.startedAt).toISOString().slice(0, 10),
    ...controls.disabledLayers.flatMap((item) => ['--disable-layer', item]),
    ...controls.disabledPlaybooks.flatMap((item) => [
      '--disable-playbook', `${item.playbookId}${item.version === null ? '' : `@${item.version}`}`,
    ]),
    ...controls.pinnedPlaybooks.flatMap((item) => ['--pin-playbook', `${item.playbookId}@${item.version}`]),
  ])
}

function atomicPrivateJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  fs.chmodSync(path.dirname(file), 0o700)
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`
  const descriptor = fs.openSync(temporary, 'wx', 0o600)
  try {
    fs.writeFileSync(descriptor, JSON.stringify(value))
    fs.fsyncSync(descriptor)
    fs.renameSync(temporary, file)
  } finally {
    try { fs.closeSync(descriptor) } catch {}
    try { fs.unlinkSync(temporary) } catch {}
  }
}

export async function attestResearchMemoryUse(
  run: RunState, agentKey: string, outputRel: string, use: unknown,
  executor: MemoryExecutor = defaultExecutor, env: NodeJS.ProcessEnv = process.env,
): Promise<Record<string, unknown>> {
  const binding = run.memoryRuntime
  if (!binding || binding.status !== 'verified' || !run.runRoot) {
    throw new Error('run has no verified memory snapshot')
  }
  if (!binding.authorizationPath || !binding.authorizationSha256) {
    throw new Error('run has no verified provider authorization')
  }
  const expected = agentKey === 'master/synthesizer'
    ? run.kind === 'full' || run.expected.has(agentKey) ? 'final_thesis.md' : undefined
    : run.expected.get(agentKey)?.outputRel
  if (!expected || outputRel !== expected || path.isAbsolute(outputRel) || outputRel.includes('\\')
      || path.posix.normalize(outputRel) !== outputRel) {
    throw new Error('memory use output does not match the supervisor roster')
  }
  const output = path.resolve(REPO_ROOT, run.runRoot, outputRel)
  const runRoot = path.resolve(REPO_ROOT, run.runRoot)
  if (!output.startsWith(`${runRoot}${path.sep}`)) throw new Error('memory use output escapes the run root')
  const info = fs.lstatSync(output)
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('memory use output is not a regular file')
  const config = memoryConfig(env)
  const safeAgent = agentKey.replace(/[^A-Za-z0-9._-]+/g, '_')
  const usePath = path.join(config.stateRoot, 'execution-receipts', binding.logicalRunId, safeAgent, 'memory-use.json')
  atomicPrivateJson(usePath, use)
  return executor([
    'attest', ...commonArgs(config, binding.logicalRunId),
    '--authorization', binding.authorizationPath,
    '--authorization-sha256', binding.authorizationSha256,
    '--contract-private-key', config.contractPrivateKey,
    '--agent-key', agentKey, '--task-id', agentKey,
    '--output', path.relative(REPO_ROOT, output).split(path.sep).join('/'), '--use', usePath,
    '--supervisor-id', config.serviceIdentity, '--output-gate-passed', '--mode', binding.mode,
  ])
}

export function researchMemoryTaskStatus(
  run: RunState, agentKey: string, outputRel: string, env: NodeJS.ProcessEnv = process.env,
): { ok: true; attested: boolean; reason?: string } {
  const binding = run.memoryRuntime
  if (!binding || binding.status !== 'verified' || !run.runRoot) {
    throw new Error('run has no verified memory snapshot')
  }
  const expected = agentKey === 'master/synthesizer'
    ? run.kind === 'full' || run.expected.has(agentKey) ? 'final_thesis.md' : undefined
    : run.expected.get(agentKey)?.outputRel
  if (!expected || outputRel !== expected) throw new Error('memory status output does not match the supervisor roster')
  const output = path.resolve(REPO_ROOT, run.runRoot, outputRel)
  const runRoot = path.resolve(REPO_ROOT, run.runRoot)
  if (!output.startsWith(`${runRoot}${path.sep}`)) throw new Error('memory status output escapes the run root')
  const safeAgent = agentKey.replace(/[^A-Za-z0-9._-]+/g, '_')
  const episodePath = path.join(
    memoryConfig(env).stateRoot, 'execution-receipts', binding.logicalRunId, safeAgent, 'task-episode.json',
  )
  try {
    const outputInfo = fs.lstatSync(output)
    const episodeInfo = fs.lstatSync(episodePath)
    if (!outputInfo.isFile() || outputInfo.isSymbolicLink()
        || !episodeInfo.isFile() || episodeInfo.isSymbolicLink()) {
      return { ok: true, attested: false, reason: 'artifact-type-invalid' }
    }
    const episode = JSON.parse(fs.readFileSync(episodePath, 'utf8')) as Record<string, unknown>
    const outputSha = `sha256:${createHash('sha256').update(fs.readFileSync(output)).digest('hex')}`
    const attested = episode.schema === 'memory-task-episode/v1'
      && episode.run_id === binding.logicalRunId
      && episode.task_id === agentKey
      && episode.status === 'completed'
      && episode.output_sha256 === outputSha
    return attested ? { ok: true, attested: true } : { ok: true, attested: false, reason: 'receipt-mismatch' }
  } catch {
    return { ok: true, attested: false, reason: 'receipt-missing' }
  }
}

export async function finalizeResearchMemory(
  run: RunState, successful: boolean, executor: MemoryExecutor = defaultExecutor,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ ok: boolean; error?: string }> {
  const binding = run.memoryRuntime
  if (!binding || binding.status === 'off' || binding.status === 'unavailable' || !binding.finalizeOnClose) {
    return { ok: true }
  }
  try {
    const config = memoryConfig(env)
    await verifyResearchMemoryBeforeSpawn(run, executor, env)
    const status = successful ? 'completed' : 'failed'
    const result = await executor([
      'finalize', ...commonArgs(config, binding.logicalRunId), '--mode', binding.mode,
      '--expected-tasks', String(binding.expectedTaskCount), '--status', status,
      '--started-at', binding.startedAt,
    ])
    binding.status = result.status === 'completed' ? 'finalized' : 'blocked'
    if (binding.mode === 'enforced' && result.status !== 'completed') {
      return { ok: false, error: `memory coverage is ${result.coverage_pct}%` }
    }
    return { ok: true }
  } catch (error: any) {
    const message = String(error?.message || error)
    binding.error = message.slice(0, 1000)
    if (binding.mode === 'enforced') {
      binding.status = 'blocked'
      return { ok: false, error: message }
    }
    return { ok: true, error: message }
  }
}

export function clearResearchMemoryPreparationForTests(): void {
  preparation.clear()
  preparationScope.clear()
  preparationTail.clear()
}
