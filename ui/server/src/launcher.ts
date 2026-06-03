import { execa, type ResultPromise } from 'execa'
import { CLAUDE_BIN, DEFAULT_MODEL, ESTIMATES, LAUNCH_GUARDS, REPO_ROOT, type LaunchKind } from './config'
import { getCreditStatus, setCreditStatus } from './credit'
import { startRunWatcher } from './fs-watcher'
import { createRun, emit, finishRun, getRun, isWriteBusy, setActiveWrite, type ExpectedAgent, type RunState } from './registry'
import { buildSwarmGraph } from './roster'
import { handleStreamLine } from './stream-parser'
import type { LaunchPreflight, RunKind } from './types'

// ---- claude CLI flag capability detection (so we never pass an unknown flag) ----
let supportedFlags: Set<string> | null = null
async function detectFlags(): Promise<Set<string>> {
  if (supportedFlags) return supportedFlags
  const flags = new Set<string>()
  try {
    const { stdout } = await execa(CLAUDE_BIN, ['--help'], { reject: false, timeout: 15000 })
    for (const m of stdout.matchAll(/--[a-z][a-z0-9-]+/g)) flags.add(m[0])
  } catch {
    /* fall back to a conservative core set */
  }
  // always-safe core flags even if --help parsing failed
  for (const f of ['--print', '--output-format', '--verbose', '--model', '--max-turns', '--permission-mode']) flags.add(f)
  supportedFlags = flags
  return flags
}

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildPrompt(kind: RunKind, ticker: string, module?: string, agent?: string): string {
  if (kind === 'full') return `/research:full ${ticker}`
  if (kind === 'module') return `/research:${module} ${ticker}`
  return `/research:agent ${module} ${agent} ${ticker}`
}

function plannedModules(kind: RunKind, module?: string): string[] {
  const g = buildSwarmGraph()
  if (kind === 'full') return g.modules.map((m) => m.name)
  return module ? [module] : []
}

function buildExpected(kind: RunKind, module?: string, agent?: string): Map<string, ExpectedAgent> {
  const g = buildSwarmGraph()
  const map = new Map<string, ExpectedAgent>()
  if (kind === 'agent') {
    const m = g.modules.find((x) => x.name === module)
    const a = m && Object.values(m.layers).flat().find((x) => x.name === agent || x.slug === agent)
    if (a) map.set(a.key, { key: a.key, module: a.module, name: a.name, layer: a.layer, outputRel: `${a.module}/${a.nn}_${a.slug}.md` })
    return map
  }
  for (const mn of plannedModules(kind, module)) {
    const m = g.modules.find((x) => x.name === mn)
    if (!m) continue
    for (const a of Object.values(m.layers).flat()) {
      map.set(a.key, { key: a.key, module: a.module, name: a.name, layer: a.layer, outputRel: `${a.module}/${a.nn}_${a.slug}.md` })
    }
  }
  return map
}

export function estimate(kind: RunKind, ticker: string, module?: string, agent?: string): LaunchPreflight {
  const g = buildSwarmGraph()
  let agentCount = 1
  if (kind === 'full') agentCount = g.totals.agents + 1
  else if (kind === 'module') agentCount = g.modules.find((m) => m.name === module)?.agentCount ?? 0

  let estCostUsdRange: [number, number]
  let estMinutesRange: [number, number]
  if (kind === 'full') {
    estCostUsdRange = [25, 60]
    estMinutesRange = [20, 40]
  } else {
    estCostUsdRange = [round1(agentCount * ESTIMATES.perAgentUsd[0]), round1(agentCount * ESTIMATES.perAgentUsd[1])]
    estMinutesRange = [Math.max(1, Math.ceil(agentCount * ESTIMATES.perAgentMin[0])), Math.max(2, Math.ceil(agentCount * ESTIMATES.perAgentMin[1]))]
  }

  return {
    kind,
    ticker,
    module,
    agent,
    agentCount,
    estCostUsdRange,
    estMinutesRange,
    willCommitToMain: kind !== 'agent',
    estCommits: kind === 'full' ? 2 : kind === 'module' ? 1 : 0,
    requiresTypedConfirm: kind === 'full',
    creditPreflight: getCreditStatus(),
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

async function buildArgs(prompt: string, kind: LaunchKind, model: string): Promise<string[]> {
  const flags = await detectFlags()
  const guard = LAUNCH_GUARDS[kind]
  const args: string[] = ['--print', prompt, '--output-format', 'stream-json', '--verbose']
  if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')
  else if (flags.has('--dangerously-skip-permissions')) args.push('--dangerously-skip-permissions')
  if (flags.has('--model')) args.push('--model', model)
  if (flags.has('--max-turns')) args.push('--max-turns', String(guard.maxTurns))
  if (flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(guard.budgetUsd))
  return args
}

export interface LaunchParams {
  kind: RunKind
  ticker: string
  module?: string
  agent?: string
  model?: string
}

export async function launch(params: LaunchParams): Promise<{ runId: string; preflight: LaunchPreflight }> {
  const { kind, ticker, module, agent } = params
  const model = params.model || DEFAULT_MODEL

  if (kind !== 'agent') {
    const busy = isWriteBusy()
    if (busy) {
      const err: any = new Error(`A run is already in progress (${busy.kind} ${busy.ticker}). Only one write-run at a time.`)
      err.statusCode = 409
      throw err
    }
  }

  const prompt = buildPrompt(kind, ticker, module, agent)
  const expected = buildExpected(kind, module, agent)
  const run = createRun({
    kind,
    ticker,
    module,
    agent,
    model,
    prompt,
    runRoot: kind === 'agent' ? null : `analyses/${ticker}_${todayDate()}`,
    willCommitToMain: kind !== 'agent',
    closeWatcher: undefined,
    expected,
  })

  // seed expected agents as queued so the UI can show the planned swarm immediately
  for (const e of expected.values()) {
    run.agents.set(e.key, { key: e.key, module: e.module, name: e.name, layer: e.layer, status: 'queued' })
  }

  if (kind !== 'agent') setActiveWrite(run.runId)
  startRunWatcher(run)

  const args = await buildArgs(prompt, kind, model)
  let child: ResultPromise
  try {
    child = execa(CLAUDE_BIN, args, {
      cwd: REPO_ROOT,
      env: process.env,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
      buffer: false,
      reject: false,
    })
  } catch (e: any) {
    emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason: 'spawn_failed', message: String(e?.message || e), ts: Date.now() })
    finishRun(run, 'error')
    throw Object.assign(new Error('Failed to spawn claude CLI'), { statusCode: 500 })
  }

  run.child = child
  run.status = 'running'
  emit(run, { type: 'run-started', runId: run.runId, kind, ticker, runRoot: run.runRoot, willCommitToMain: run.willCommitToMain, ts: Date.now() })

  // line-buffered stdout -> stream parser
  let buf = ''
  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', (chunk: string) => {
    buf += chunk
    let idx: number
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx)
      buf = buf.slice(idx + 1)
      handleStreamLine(run, line)
    }
  })
  let stderr = ''
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk: string) => {
    stderr += chunk
    if (stderr.length > 8000) stderr = stderr.slice(-8000)
  })

  const onClose = (res: any) => {
    if (buf.trim()) {
      handleStreamLine(run, buf)
      buf = ''
    }
    if (run.status === 'running' || run.status === 'starting') {
      const code = res?.exitCode ?? res?.code
      if (res?.killed || run.status === 'cancelled') {
        emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
        finishRun(run, 'cancelled')
      } else if (code && code !== 0) {
        const reason = /credit|rate limit/i.test(stderr) ? 'out_of_credits' : 'nonzero_exit'
        emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: stderr.slice(-400) || undefined, ts: Date.now() })
        finishRun(run, 'error')
      } else {
        emit(run, { type: 'run-done', runId: run.runId, status: 'done', costUsd: run.costUsd, durationMs: run.durationMs, numTurns: run.numTurns, ts: Date.now() })
        finishRun(run, 'done')
      }
    }
  }
  child.then(onClose).catch(onClose)

  return { runId: run.runId, preflight: estimate(kind, ticker, module, agent) }
}

export async function cancel(runId: string): Promise<boolean> {
  const run = getRun(runId)
  if (!run || !run.child) return false
  run.status = 'cancelled'
  try {
    run.child.kill('SIGTERM')
    setTimeout(() => {
      try {
        if (run.child && run.endedAt === undefined) run.child.kill('SIGKILL')
      } catch {}
    }, 5000)
  } catch {}
  return true
}

// Active, near-free credit probe (out-of-credits is rejected before generation).
export async function creditCheck(): Promise<ReturnType<typeof getCreditStatus>> {
  const flags = await detectFlags()
  const args: string[] = ['--print', 'ok', '--output-format', 'stream-json', '--verbose', '--model', 'haiku']
  if (flags.has('--permission-mode')) args.push('--permission-mode', 'bypassPermissions')
  if (flags.has('--max-turns')) args.push('--max-turns', '1')
  try {
    const child = execa(CLAUDE_BIN, args, { cwd: REPO_ROOT, env: process.env, reject: false, timeout: 30000 })
    const { stdout } = await child
    for (const line of stdout.split('\n')) {
      const t = line.trim()
      if (!t) continue
      try {
        const obj = JSON.parse(t)
        if (obj.type === 'rate_limit_event') {
          const info = obj.rate_limit_info || {}
          const ok = info.overageStatus !== 'rejected' && info.status !== 'rejected' && info.status !== 'blocked'
          setCreditStatus({ ok, reason: info.overageDisabledReason || info.status, rateLimitType: info.rateLimitType, checked: true })
        }
        if (obj.type === 'result') {
          if (obj.is_error && /credit|overage|rate/i.test(JSON.stringify(obj))) {
            setCreditStatus({ ok: false, reason: 'out_of_credits', checked: true })
          } else if (!obj.is_error) {
            setCreditStatus({ ok: true, reason: 'ok', checked: true })
          }
        }
      } catch {}
    }
  } catch {
    setCreditStatus({ ok: false, reason: 'probe_failed', checked: true })
  }
  return getCreditStatus()
}
