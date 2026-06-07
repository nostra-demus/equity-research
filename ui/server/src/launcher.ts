import fs from 'node:fs'
import path from 'node:path'
import { execa, type ResultPromise } from 'execa'
import { logLaunch } from './activity-log'
import { admitRun } from './admission'
import { CLAUDE_BIN, DEFAULT_MODEL, ESTIMATES, FULL_PER_MODULE, LAUNCH_GUARDS, REPO_ROOT, type LaunchKind } from './config'
import { getCreditStatus, setCreditStatus } from './credit'
import { startRunWatcher } from './fs-watcher'
import { createRun, emit, finishRun, getRun, setActiveTickerRun, type ExpectedAgent, type RunState } from './registry'
import { resolveRunRoot } from './outputs'
import { buildSwarmGraph, downstreamCascade } from './roster'
import { handleStreamLine } from './stream-parser'
import type { AdmissionRejection, LaunchPreflight, RunKind } from './types'

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

// The deliverables a completed full/rerun MUST have written (the master synthesizer's primary outputs).
// Their absence after a clean exit means the run was truncated before the master finished.
function finalDeliverablesPresent(runRoot: string | null): boolean {
  if (!runRoot) return false
  const root = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  return fs.existsSync(path.join(root, 'final_thesis.md')) && fs.existsSync(path.join(root, 'decision_record.json'))
}

// A solo agent writes into the run folder its slash command will resolve: today's if it already
// exists, else the latest prior run, else today's. Concrete (never null) so admission/watcher work.
function resolveAgentRunRoot(ticker: string): string {
  const today = `analyses/${ticker}_${todayDate()}`
  if (fs.existsSync(path.join(REPO_ROOT, today))) return today
  return resolveRunRoot({ ticker }) ?? today
}

// Modules this run writes into (for D2b / D3 admission).
function coveredModulesFor(kind: RunKind, module?: string, agent?: string): string[] {
  const g = buildSwarmGraph()
  if (kind === 'full') return g.modules.map((m) => m.name)
  if (kind === 'rerun') return [...new Set(downstreamCascade(module!, agent!).filter((c) => c.module !== 'master').map((c) => c.module))]
  return module ? [module] : []
}

// The target agent's intra-module required-upstream files (for D4b).
function agentRequiredUpstream(module?: string, agent?: string): string[] {
  if (!module || !agent) return []
  const g = buildSwarmGraph()
  const m = g.modules.find((x) => x.name === module)
  const a = m && Object.values(m.layers).flat().find((x) => x.name === agent || x.slug === agent)
  return a?.requiredUpstream ?? []
}

// Run-root artifacts full/rerun also write (diagnostics for D2; D1 is the real exclusivity guard).
const ROOT_ARTIFACTS_FULL = ['final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json', 'RUN_METADATA.md']
const ROOT_ARTIFACTS_RERUN = ['final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json']

function admissionMessage(r: AdmissionRejection, ticker: string): string {
  switch (r.code) {
    case 'exclusivity':
      return `A ${r.blockingKind} run is in progress for ${ticker} and needs exclusive access — wait for it to finish.`
    case 'target_conflict':
      return `That run would overwrite files a run already in progress on ${ticker} is writing (${r.conflictTargets.join(', ')}).`
    case 'dependency_conflict':
      if (r.reason === 'module-scope-writer') return `A run is already writing the ${r.detail.conflictModule} module for ${ticker} — wait for it before launching another ${r.detail.requestedModule} run/orb.`
      if (r.reason === 'module-ancestry') return `Can't run yet — ${r.detail.conflictModule} (${r.detail.relation}) is in flight for ${ticker}; it would be read or written half-finished.`
      return `A required upstream file is being rewritten by another run on ${ticker} (${(r.detail.conflictFiles ?? []).join(', ')}).`
    case 'upstream_incomplete':
      return `Upstream isn't complete for ${ticker}: ${r.missing.join(', ')}. Run those first, or run the full pipeline.`
    case 'capacity':
      return `At the concurrency cap (${r.activeCount}/${r.cap} runs in flight). Wait for one to finish.`
  }
}

function buildPrompt(kind: RunKind, ticker: string, module?: string, agent?: string): string {
  if (kind === 'full') return `/research:full ${ticker}`
  if (kind === 'module') return `/research:${module} ${ticker}`
  if (kind === 'rerun') return `/research:rerun ${module} ${agent} ${ticker}`
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
  if (kind === 'rerun') {
    // the target orb + the downstream synthesis chain to the master (so the swarm shows the planned re-run)
    for (const c of downstreamCascade(module!, agent!)) {
      map.set(c.key, { key: c.key, module: c.module, name: c.name, layer: c.layer, outputRel: c.outputRel || 'final_thesis.md' })
    }
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
  else if (kind === 'rerun') agentCount = downstreamCascade(module!, agent!).length

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
    estCommits: kind === 'full' ? 2 : kind === 'module' || kind === 'rerun' ? 1 : 0,
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
  user?: string // who launched it (from Cloudflare Access at the route); defaults to "local"
  userVia?: 'cf-access' | 'local'
}

// ---- chained full run (per-module budgets) — opt-in via FULL_PER_MODULE ----
// A full pipeline as a CHAIN of separate runs: each module in dependency order (its own run + budget),
// then the master synthesizer (its own run + budget). No single budget cap bounds the whole pipeline, so
// a large company can't truncate it the way a monolithic /research:full can. Each step is its own run and
// its own activity-log entry. A failed/incomplete/cancelled step stops the chain (so it's visible exactly
// where), leaving the user to fix that module and resume.
type ChainStep = { kind: RunKind; module?: string; agent?: string }
function fullChainSteps(): ChainStep[] {
  const g = buildSwarmGraph() // modules already topologically ordered by depends_on
  const steps: ChainStep[] = g.modules.map((m) => ({ kind: 'module', module: m.name }))
  steps.push({ kind: 'rerun', module: 'master', agent: 'synthesizer' }) // master synthesizer = its own run
  return steps
}

async function launchChainStep(steps: ChainStep[], i: number, ticker: string, user: string, userVia: 'cf-access' | 'local'): Promise<{ runId: string; preflight: LaunchPreflight }> {
  const s = steps[i]
  const out = await launch({ kind: s.kind, ticker, module: s.module, agent: s.agent, user, userVia })
  const run = getRun(out.runId)
  if (run) {
    run.onFinish = (status) => {
      if (status === 'done' && i + 1 < steps.length) {
        void launchChainStep(steps, i + 1, ticker, user, userVia).catch((e) => {
          // eslint-disable-next-line no-console
          console.error(`[full-chain] ${ticker}: failed to launch step ${i + 1}`, e?.message || e)
        })
      } else {
        // eslint-disable-next-line no-console
        console.log(`[full-chain] ${ticker}: ${status === 'done' ? 'pipeline complete' : `stopped at step ${i} (${s.module || s.agent}) — ${status}`}`)
      }
    }
  }
  return out
}

async function launchFullChained(ticker: string, user: string, userVia: 'cf-access' | 'local'): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean }> {
  const first = await launchChainStep(fullChainSteps(), 0, ticker, user, userVia)
  // `chained: true` tells the cockpit to live-follow the WHOLE pipeline (connect to each step as it
  // launches, and only celebrate when the master finishes — not after each module).
  return { runId: first.runId, preflight: estimate('full', ticker), chained: true }
}

export async function launch(params: LaunchParams): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean }> {
  const { kind, ticker, module, agent } = params
  const model = params.model || DEFAULT_MODEL
  const user = params.user || 'local'
  const userVia = params.userVia || 'local'

  // opt-in: run a full pipeline as a chain of per-module runs + master (each its own budget)
  if (kind === 'full' && FULL_PER_MODULE) return launchFullChained(ticker, user, userVia)

  // Resolve a CONCRETE run root for every kind (never null) so admission can compute absolute write
  // targets and the fs-watcher can bind strictly. rerun fails early if there's nothing to re-run.
  let runRoot: string
  if (kind === 'rerun') {
    const latest = resolveRunRoot({ ticker })
    if (!latest) {
      const err: any = new Error(`No existing run to re-run for ${ticker}. Run a module or the full pipeline first.`)
      err.statusCode = 400
      throw err
    }
    runRoot = latest
  } else if (kind === 'agent') {
    runRoot = resolveAgentRunRoot(ticker)
  } else {
    runRoot = `analyses/${ticker}_${todayDate()}`
  }

  const prompt = buildPrompt(kind, ticker, module, agent)
  const expected = buildExpected(kind, module, agent)

  // Admission metadata — derived once here, stored on the run, reused by admitRun.
  const coveredModules = coveredModulesFor(kind, module, agent)
  const writeTargetsAbs = [...new Set([
    ...[...expected.values()].map((e) => path.join(REPO_ROOT, runRoot, e.outputRel)),
    ...(kind === 'full' ? ROOT_ARTIFACTS_FULL : kind === 'rerun' ? ROOT_ARTIFACTS_RERUN : []).map((f) => path.join(REPO_ROOT, runRoot, f)),
  ])]
  const readDepsAbs = kind === 'agent'
    ? agentRequiredUpstream(module, agent).map((relp) => path.join(REPO_ROOT, runRoot, relp))
    : []

  // Dependency-aware admission + register in ONE synchronous block (no await before
  // setActiveTickerRun) so the check-and-claim is atomic under Node's single-threaded loop.
  const decision = admitRun({ ticker, kind, coveredModules, writeTargetsAbs, readDepsAbs })
  if (!decision.ok) {
    const { ok: _ok, ...rejection } = decision
    const err: any = new Error(admissionMessage(rejection, ticker))
    err.statusCode = rejection.httpStatus
    err.body = rejection
    throw err
  }

  const run = createRun({
    kind,
    ticker,
    module,
    agent,
    model,
    prompt,
    user,
    userVia,
    runRoot,
    willCommitToMain: kind !== 'agent',
    writeTargetsAbs,
    coveredModules,
    readDepsAbs,
    closeWatcher: undefined,
    expected,
  })

  // seed expected agents as queued so the UI can show the planned swarm immediately
  for (const e of expected.values()) {
    run.agents.set(e.key, { key: e.key, module: e.module, name: e.name, layer: e.layer, status: 'queued' })
  }

  setActiveTickerRun(run.runId, ticker) // register the in-flight run; finishRun() releases it
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

  // perpetual audit record: who launched what, when, on which company (finish is logged in finishRun)
  logLaunch({ runId: run.runId, user, userVia, kind, ticker, module, agent, model })

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
      if (res?.killed || (run.status as string) === 'cancelled') {
        emit(run, { type: 'run-error', runId: run.runId, status: 'cancelled', reason: 'cancelled', ts: Date.now() })
        finishRun(run, 'cancelled')
      } else if (code && code !== 0) {
        const reason = /credit|rate limit/i.test(stderr) ? 'out_of_credits' : 'nonzero_exit'
        emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: stderr.slice(-400) || undefined, ts: Date.now() })
        finishRun(run, 'error')
      } else if ((kind === 'full' || kind === 'rerun') && !finalDeliverablesPresent(run.runRoot)) {
        // The process exited cleanly, but a full/rerun that didn't write its final thesis + decision
        // record was almost certainly budget/turn-truncated before the master synthesizer finished.
        // Report it honestly as INCOMPLETE (not a misleading "done") so the cockpit + activity log show
        // the truth and the user can finish it / raise the cap.
        const msg = 'Run ended without the final thesis & memo — likely budget- or turn-truncated before the master synthesizer finished. Re-run from the master (or any late orb) to finish; the cap is now higher.'
        run.note = 'incomplete: no final thesis/decision (likely budget/turn truncation)'
        emit(run, { type: 'run-error', runId: run.runId, status: 'incomplete', reason: 'incomplete_deliverables', message: msg, ts: Date.now() })
        finishRun(run, 'incomplete')
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
    let sawRateLimit = false
    for (const line of stdout.split('\n')) {
      const t = line.trim()
      if (!t) continue
      try {
        const obj = JSON.parse(t)
        if (obj.type === 'rate_limit_event') {
          const info = obj.rate_limit_info || {}
          sawRateLimit = true
          setCreditStatus({
            ok: info.status !== 'rejected' && info.status !== 'blocked',
            checked: true,
            status: info.status,
            rateLimitType: info.rateLimitType,
            utilization: typeof info.utilization === 'number' ? info.utilization : undefined,
            resetsAt: info.resetsAt,
            isUsingOverage: info.isUsingOverage,
            reason: info.overageDisabledReason || info.status,
          })
        }
        if (obj.type === 'result' && !sawRateLimit) {
          if (obj.is_error && /credit|overage|rate/i.test(JSON.stringify(obj))) {
            setCreditStatus({ ok: false, reason: 'rate_limited', checked: true })
          } else if (!obj.is_error) {
            setCreditStatus({ ok: true, reason: 'ok', checked: true })
          }
        }
      } catch {}
    }
  } catch {
    // a transient probe failure (e.g. a concurrent headless spawn) is NOT a rate limit —
    // keep the last-known usage rather than falsely flipping the badge to "rate limited"
  }
  return getCreditStatus()
}
