// DAG-parallel full-chain scheduler (launchFullChained): does the per-module chain launch modules in
// dependency order, run independent siblings CONCURRENTLY, launch the master only after every module is
// done, drop the defer-module-memos marker, and STOP scheduling when a module fails? This drives the real
// research DAG with a FAKE launcher — no spawned CLI, no filesystem, no registry — so it is deterministic
// and free. It is the cheap stand-in for "did #1 schedule correctly", which otherwise needs a 2-3h run.
// Run: npx tsx test/full-chain-schedule.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  cancelSubject, type FullChainDeps, getParityCanaryChainStatus, haltAllChains,
  launchFullChained, subjectChainActive, wireChainedRunFinish,
} from '../src/launcher'
import { FULL_PER_MODULE, REPO_ROOT } from '../src/config'
import { sharedDataPoolConflict } from '../src/intake-owner'
import { buildSwarmGraph } from '../src/roster'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from '../src/subject-lock'
import type {
  ChainIntentProgress,
  ChainIntentStart,
  PreparedRunPlanTransaction,
} from '../src/run-plan-transaction'
import type { LaunchPreflight, RunStatus, SwarmGraph } from '../src/types'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

// A fake launcher: records every launch synchronously (so assertions need no awaits) and stashes each
// run's completion callback so the test can fire it to simulate that run finishing.
function makeFake(opts?: { fail429Once?: string[]; graph?: SwarmGraph; failMaster?: boolean; failModule?: string; deferAck?: string }) {
  const launches: { kind: string; module?: string; agent?: string; provider: string; model?: string;
    reasoningLevel?: string; expectedProfileKey?: string; chainId?: string;
    runRoot?: string; continuation?: boolean; requireExistingFrozenPoolReceipt?: boolean;
    parityCanary?: { runRoot: string; freezeReceipt: string; stage?: string; continuation?: boolean } }[] = []
  const onFinish = new Map<string, (s: RunStatus) => void>()
  let marker: string | null = null
  let markerRoot: string | undefined
  let markerCleared = false
  let poolClaimHeld = false
  let poolClaimReleases = 0
  const retries: Array<() => void> = []
  const interruptions: Parameters<NonNullable<FullChainDeps['recordInterruption']>>[0][] = []
  const deferredAcks = new Map<string, () => void>()
  const fail429Once = new Set(opts?.fail429Once ?? [])
  const deps: FullChainDeps = {
    launchAndWire: (params, cb) => {
      const key = params.kind === 'rerun' || (params.kind === 'full' && params.parityCanary?.stage === 'final')
        ? 'master' : (params.module ?? params.agent ?? '?')
      if (key === 'master' && opts?.failMaster) return Promise.reject(new Error('master admission failed'))
      if (params.kind === 'module' && params.module === opts?.failModule) {
        return Promise.reject(new Error(`${params.module} admission failed`))
      }
      // Simulate a transient global-capacity 429 on the FIRST launch attempt for a flagged module.
      if (params.kind === 'module' && fail429Once.has(params.module!)) {
        fail429Once.delete(params.module!)
        const err: any = new Error('at capacity'); err.statusCode = 429; err.body = { code: 'capacity' }
        return Promise.reject(err)
      }
      launches.push({
        kind: params.kind, module: params.module, agent: params.agent,
        provider: params.provider, model: params.model, reasoningLevel: params.reasoningLevel,
        expectedProfileKey: params.expectedProfileKey, chainId: params.chainId,
        runRoot: params.runRoot, continuation: params.continuation,
        requireExistingFrozenPoolReceipt: params.requireExistingFrozenPoolReceipt,
        parityCanary: params.parityCanary,
      })
      onFinish.set(key, cb)
      if (key === opts?.deferAck) {
        return new Promise((resolve) => {
          deferredAcks.set(key, () => resolve({ runId: `run-${key}`, preflight: {} as LaunchPreflight }))
        })
      }
      return Promise.resolve({ runId: `run-${key}`, preflight: {} as LaunchPreflight })
    },
    writeMarker: (ticker, runRoot) => { marker = ticker; markerRoot = runRoot },
    clearMarker: () => { marker = null; markerCleared = true },
    scheduleRetry: (fn) => { retries.push(fn) },
    acquirePoolClaim: () => {
      assert.equal(poolClaimHeld, false, 'one chain acquires its stable pool claim once')
      poolClaimHeld = true
      let released = false
      return () => {
        if (released) return
        released = true
        poolClaimHeld = false
        poolClaimReleases++
      }
    },
    recordInterruption: (input) => { interruptions.push(input) },
    ...(opts?.graph ? { buildGraph: () => opts.graph! } : {}),
  }
  const mods = () => launches.filter((l) => l.kind === 'module').map((l) => l.module!)
  const finish = (key: string, status: RunStatus = 'done') => {
    const cb = onFinish.get(key)
    assert.ok(cb, `expected ${key} to have been launched before finishing it`)
    cb!(status)
  }
  const fireRetries = () => { for (const fn of retries.splice(0)) fn() }
  const tick = () => new Promise((r) => setTimeout(r, 0)) // flush the .catch microtasks
  return {
    deps, launches, mods, finish, fireRetries, tick,
    getMarker: () => marker,
    getMarkerRoot: () => markerRoot,
    wasMarkerCleared: () => markerCleared,
    pendingRetries: () => retries.length,
    poolClaimHeld: () => poolClaimHeld,
    poolClaimReleases: () => poolClaimReleases,
    interruptions: () => [...interruptions],
    ack: (key: string) => {
      const resolve = deferredAcks.get(key)
      assert.ok(resolve, `expected a deferred ${key} ACK`)
      deferredAcks.delete(key)
      resolve!()
    },
  }
}

function makeDurableChainFake(
  runRoot: string,
  blockWhen: (progress: ChainIntentProgress) => boolean,
) {
  const starts: ChainIntentStart[] = []
  const progress: ChainIntentProgress[] = []
  const terminals: Array<'done' | 'cancelled'> = []
  let blocked = false
  let releaseBlocked: (() => void) | null = null
  const transaction: PreparedRunPlanTransaction = {
    requestId: randomUUID(),
    preparation: {
      stagingRootAbs: path.join(REPO_ROOT, runRoot),
      targetRunRoot: runRoot,
      carried: [],
      doneOrbKeys: [],
      ranClean: [],
    },
    registerPaidChildAttempt() {},
    async activate() {},
    async markPaidChildSpawning() { throw new Error('fake launch never crosses the real spawn boundary') },
    async markPaidChildSpawnReady() {},
    async markPaidChildStarted() {},
    async beginChainIntent(input) { starts.push(structuredClone(input)) },
    async recordChainProgress(input) {
      const sealed = structuredClone(input)
      progress.push(sealed)
      if (!blocked && blockWhen(sealed)) {
        blocked = true
        await new Promise<void>((resolve) => { releaseBlocked = resolve })
      }
    },
    async recordChainTerminal(status) { terminals.push(status) },
    async deferPreSpendRetry() { throw new Error('not used by scheduler ordering fixture') },
    async rollbackIfUnstarted() {},
  }
  return {
    transaction,
    starts: () => structuredClone(starts),
    progress: () => structuredClone(progress),
    terminals: () => [...terminals],
    release: () => {
      assert.ok(releaseBlocked, 'expected durable progress persistence to be blocked')
      const release = releaseBlocked
      releaseBlocked = null
      release!()
    },
  }
}

function synthesisFile(graph: SwarmGraph, moduleName: string): string {
  const module = graph.modules.find((candidate) => candidate.name === moduleName)
  const synthesis = module && Object.values(module.layers).flat().find((agent) => agent.isSynthesis)
  assert.ok(synthesis, `expected ${moduleName} to have a synthesis agent`)
  return `${synthesis!.key.split('/').at(-1)}.md`
}

function writeSynthesis(runRoot: string, graph: SwarmGraph, moduleName: string): void {
  const moduleRoot = path.join(REPO_ROOT, runRoot, moduleName)
  fs.mkdirSync(moduleRoot, { recursive: true })
  fs.writeFileSync(path.join(moduleRoot, synthesisFile(graph, moduleName)), `# ${moduleName} synthesis\n`)
}

const sorted = (a: string[]) => [...a].sort()

;(async () => {
  await check('a child that finishes before launch ACK replays only after the ACK turn instead of stranding the chain', async () => {
    const delivered: RunStatus[] = []
    const terminal = {
      chained: false,
      endedAt: Date.now(),
      finishLogged: true,
      status: 'error' as RunStatus,
      onFinish: undefined,
    }
    wireChainedRunFinish(terminal, (status) => { delivered.push(status) })
    assert.equal(terminal.chained, true, 'the terminal child keeps chained cancellation identity')
    assert.deepEqual(delivered, [], 'the terminal outcome cannot advance the DAG before the launch ACK settles')
    assert.equal(terminal.onFinish, undefined, 'no dead callback is stored after terminal completion')

    await new Promise<void>((resolve) => setImmediate(resolve))
    assert.deepEqual(delivered, ['error'], 'the already-recorded terminal outcome is replayed exactly once after the ACK turn')

    const live = {
      chained: false,
      endedAt: undefined,
      finishLogged: false,
      status: 'running' as RunStatus,
      onFinish: undefined as ((status: RunStatus) => void) | undefined,
    }
    wireChainedRunFinish(live, (status) => { delivered.push(status) })
    assert.equal(delivered.length, 1, 'a live child does not fire its terminal callback early')
    live.onFinish?.('done')
    assert.deepEqual(delivered, ['error', 'done'], 'the live child remains wired for ordinary completion')
  })

  // sanity: the expected schedule below is written for THIS exact research DAG. If a module is added or a
  // dependency changes, this fails first (loudly) so the schedule assertions get re-checked.
  await check('research DAG is the expected 7-module shape', () => {
    assert.equal(FULL_PER_MODULE, true, 'per-module orchestration is the safe default when no rollback flag is set')
    const g = buildSwarmGraph()
    assert.deepEqual(
      sorted(g.modules.map((m) => m.name)),
      sorted(['business-model', 'earnings', 'competitive-intel', 'balance-sheet-survival', 'management-governance', 'valuation', 'catalyst']),
    )
  })

  await check('a pre-child profile-freeze failure releases the chain, marker, and deploy lease', async () => {
    const ticker = 'TESTSETUPFAIL'
    const failed = makeFake()
    await assert.rejects(
      () => launchFullChained(ticker, 'tester', 'local', {
        provider: 'codex', model: 'not-a-cockpit-model', reasoningLevel: 'max',
      }, failed.deps),
      (error: any) => error?.code === 'CODEX_PROFILE_INVALID',
    )
    assert.deepEqual(failed.launches, [], 'profile freeze fails before any paid child or Activity row exists')
    assert.equal(failed.wasMarkerCleared(), true, 'the pre-child rollback clears the defer-memo marker')
    assert.equal(failed.poolClaimHeld(), false, 'the shared pool/deploy lease is released')
    assert.equal(failed.poolClaimReleases(), 1, 'the chain pool claim is released exactly once')
    assert.equal(subjectChainActive(ticker), false, 'the invisible subject-chain reservation is released')

    const retry = makeFake()
    const out = await launchFullChained(ticker, 'tester', 'local', { provider: 'claude' }, retry.deps)
    assert.equal(out.runId, 'run-business-model', 'a corrected provider choice can launch immediately')
    retry.finish('business-model', 'error')
    assert.equal(retry.poolClaimHeld(), false, 'the ordinary child failure still releases the same lease')
  })

  await check('schedules BM -> earnings -> {bss || mgov} -> valuation -> catalyst -> master; marker dropped', async () => {
    const f = makeFake()
    const out = await launchFullChained('TESTX', 'tester', 'local', { provider: 'claude' }, f.deps)

    // the marker is dropped before any module launches
    assert.equal(f.getMarker(), 'TESTX', 'defer-module-memos marker written for the ticker')
    // first wave: only the dep-free module
    assert.deepEqual(f.mods(), ['business-model'], 'only business-model launches first')
    assert.equal(out.runId, 'run-business-model', 'caller gets the first run id to follow')
    assert.equal(out.chained, true)
    // a FRESH full run (no prior work on disk) is not a resume: nothing skipped, every module planned —
    // so the cockpit shows all orbs as about-to-run (the honest non-resume view).
    assert.equal(out.resumed, false, 'a fresh full run is not a resume')
    assert.ok(f.launches.every((child) => child.requireExistingFrozenPoolReceipt === false),
      'a genuinely fresh Full is allowed to create its first durable generation receipt')
    assert.deepEqual(out.skipped, [], 'a fresh run skips nothing')
    assert.deepEqual(
      sorted(out.planned ?? []),
      sorted(['business-model', 'earnings', 'competitive-intel', 'balance-sheet-survival', 'management-governance', 'valuation', 'catalyst']),
      'a fresh run plans every module',
    )

    // business-model done -> earnings (the only newly-ready module) launches. competitive-intel is NOT yet
    // ready: it declares earnings (it reads the subject's own claims for the peer triangulation).
    f.finish('business-model')
    assert.deepEqual(sorted(f.mods()), sorted(['business-model', 'earnings']), 'earnings launches after business-model')

    // earnings done -> balance-sheet-survival + management-governance + competitive-intel launch CONCURRENTLY
    // (all three declare business-model + earnings). valuation must NOT yet: it declares BOTH
    // management-governance (the RF-OWN-004 / §24 Filter-6 read) and balance-sheet-survival (its
    // filing-based debt note is the canonical net-debt source for the EV bridge, CLAUDE.md §15), so it
    // waits for both. competitive-intel is a pure sink — nothing depends on it — but the master still
    // waits for it (see below).
    f.finish('earnings')
    const afterEarnings = f.mods()
    assert.equal(afterEarnings.length, 5, 'bss + mgov + competitive-intel join after earnings — but NOT valuation')
    assert.ok(afterEarnings.includes('balance-sheet-survival') && afterEarnings.includes('management-governance'), 'bss + mgov launch in the wave')
    assert.ok(afterEarnings.includes('competitive-intel'), 'competitive-intel launches in the after-earnings wave (deps business-model + earnings)')
    assert.ok(!afterEarnings.includes('valuation'), 'valuation must NOT launch until BOTH its declared upstreams are done')
    assert.ok(!afterEarnings.includes('catalyst'), 'catalyst waits for all five of its upstreams')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master waits for every module')

    // one of the two upstreams done is NOT enough — valuation needs both, so it still waits.
    f.finish('management-governance')
    assert.ok(!f.mods().includes('valuation'), 'valuation still waits — balance-sheet-survival has not finished yet')

    // both upstreams done -> valuation becomes ready and launches (competitive-intel may still run)
    f.finish('balance-sheet-survival')
    assert.ok(f.mods().includes('valuation'), 'valuation launches once BOTH management-governance and balance-sheet-survival are done')

    // remaining upstreams done -> catalyst launches (it needs its five declared upstreams; NOT competitive-intel)
    f.finish('valuation')
    assert.ok(f.mods().includes('catalyst'), 'catalyst launches once all five of its upstreams are done')
    assert.equal(f.mods().length, 7, 'all seven modules have launched')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master still waits for catalyst AND competitive-intel')

    // competitive-intel is a pure sink (catalyst does not depend on it), but the master waits for EVERY module,
    // so finishing catalyst alone must NOT launch the master while competitive-intel is still running.
    f.finish('catalyst')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master still waits — competitive-intel has not finished yet')
    f.finish('competitive-intel')
    const masters = f.launches.filter((l) => l.kind === 'rerun' && l.module === 'master' && l.agent === 'synthesizer')
    assert.equal(masters.length, 1, 'master synthesizer launches exactly once, after every module (incl. competitive-intel) is done')
    const capturedRoot = f.getMarkerRoot()
    assert.ok(capturedRoot, 'the chain freezes one dated root before its first child')
    assert.ok(f.launches.every((child) => child.runRoot === capturedRoot),
      'every later module and terminal master carries the original root, so a midnight rollover cannot split the chain')
  })

  await check('completed evidence is durable before the scheduler registers the next module', async () => {
    const discovered = buildSwarmGraph()
    const modules = discovered.modules.filter((module) =>
      module.name === 'business-model' || module.name === 'earnings')
    const graph: SwarmGraph = {
      ...discovered,
      modules,
      totals: {
        modules: modules.length,
        agents: modules.reduce((sum, module) => sum + module.agentCount, 0),
        specialists: modules.reduce((sum, module) => sum
          + Object.values(module.layers).flat().filter((agent) => !agent.isSynthesis).length, 0),
        synthesis: modules.length,
      },
    }
    const runRoot = `analyses/ZZCHAINGAP_${Date.now()}`
    const durable = makeDurableChainFake(runRoot, (entry) => entry.masterState === 'pending'
      && entry.completed.some((completed) => completed.module === 'business-model')
      && entry.nextModules.includes('earnings'))
    const f = makeFake({ graph })
    fs.mkdirSync(path.join(REPO_ROOT, runRoot), { recursive: true })
    try {
      const out = await launchFullChained('ZZCHAINGAP', 'tester', 'local', {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        expectedProfileKey: 'claude:sonnet:default',
      }, f.deps, undefined, undefined, {
        runRoot,
        continuation: true,
        recoveryRequestId: durable.transaction.requestId,
        preparedRunPlanTransaction: durable.transaction,
      })
      assert.equal(out.runId, 'run-business-model')
      writeSynthesis(runRoot, graph, 'business-model')
      f.finish('business-model')
      await f.tick()
      assert.deepEqual(f.mods(), ['business-model'],
        'the next paid child cannot register before completed hashes are durably stored')
      const sealed = durable.progress().at(-1)
      assert.deepEqual(sealed?.completed.map((entry) => entry.module), ['business-model'])
      assert.deepEqual(sealed?.nextModules, ['earnings'])
      assert.match(sealed?.completed[0]?.artifacts[0]?.sha256 ?? '', /^sha256:[0-9a-f]{64}$/)
      durable.release()
      await f.tick()
      assert.deepEqual(f.mods(), ['business-model', 'earnings'],
        'the remaining exact module starts once its predecessor receipt is durable')
      writeSynthesis(runRoot, graph, 'earnings')
      f.finish('earnings')
      await f.tick()
      assert.equal(f.launches.filter((launch) => launch.kind === 'rerun').length, 1)
      await f.tick()
      f.finish('master')
      await f.tick()
      assert.deepEqual(durable.terminals(), ['done'])
    } finally {
      fs.rmSync(path.join(REPO_ROOT, runRoot), { recursive: true, force: true })
    }
  })

  await check('the final module is durably ready before the terminal master registers', async () => {
    const discovered = buildSwarmGraph()
    const modules = discovered.modules.filter((module) => module.name === 'business-model')
    const graph: SwarmGraph = {
      ...discovered,
      modules,
      totals: {
        modules: 1,
        agents: modules[0]!.agentCount,
        specialists: Object.values(modules[0]!.layers).flat().filter((agent) => !agent.isSynthesis).length,
        synthesis: 1,
      },
    }
    const runRoot = `analyses/ZZMASTERGAP_${Date.now()}`
    const durable = makeDurableChainFake(runRoot, (entry) => entry.masterState === 'ready')
    const f = makeFake({ graph })
    fs.mkdirSync(path.join(REPO_ROOT, runRoot), { recursive: true })
    try {
      await launchFullChained('ZZMASTERGAP', 'tester', 'local', {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        expectedProfileKey: 'claude:sonnet:default',
      }, f.deps, undefined, undefined, {
        runRoot,
        continuation: true,
        recoveryRequestId: durable.transaction.requestId,
        preparedRunPlanTransaction: durable.transaction,
      })
      writeSynthesis(runRoot, graph, 'business-model')
      f.finish('business-model')
      await f.tick()
      assert.equal(f.launches.filter((launch) => launch.kind === 'rerun').length, 0,
        'the master cannot register in the final-child crash window')
      const ready = durable.progress().at(-1)
      assert.equal(ready?.masterState, 'ready')
      assert.deepEqual(ready?.completed.map((entry) => entry.module), ['business-model'])
      durable.release()
      await f.tick()
      assert.equal(f.launches.filter((launch) => launch.kind === 'rerun').length, 1,
        'restart can launch only the terminal master from the durable ready state')
      await f.tick()
      f.finish('master')
      await f.tick()
      assert.deepEqual(durable.terminals(), ['done'])
    } finally {
      fs.rmSync(path.join(REPO_ROOT, runRoot), { recursive: true, force: true })
    }
  })

  await check('restart never trusts a synthesis written before the child terminal receipt', async () => {
    const discovered = buildSwarmGraph()
    const modules = discovered.modules.filter((module) => module.name === 'business-model')
    const graph: SwarmGraph = {
      ...discovered,
      modules,
      totals: {
        modules: 1,
        agents: modules[0]!.agentCount,
        specialists: Object.values(modules[0]!.layers).flat().filter((agent) => !agent.isSynthesis).length,
        synthesis: 1,
      },
    }
    const runRoot = `analyses/ZZUNSEALED_${Date.now()}`
    const durable = makeDurableChainFake(runRoot, () => false)
    const now = new Date().toISOString()
    durable.transaction.recoveredChainIntent = {
      version: 1,
      chainId: durable.transaction.requestId,
      user: 'tester',
      userVia: 'local',
      selection: {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        profileKey: 'claude:sonnet:default',
        executionProfile: {
          key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default',
        },
      },
      modules: [{
        module: 'business-model',
        dependsOn: [],
        synthesisOutputs: [`business-model/${synthesisFile(graph, 'business-model')}`],
      }],
      completed: [],
      nextModules: [],
      inflightModules: ['business-model'],
      masterState: 'pending',
      startedAt: now,
      progressAt: now,
      terminalStatus: null,
      terminalAt: null,
    }
    fs.mkdirSync(path.join(REPO_ROOT, runRoot), { recursive: true })
    writeSynthesis(runRoot, graph, 'business-model') // crash: bytes exist, terminal/lineage receipt does not
    const f = makeFake({ graph })
    try {
      await launchFullChained('ZZUNSEALED', 'tester', 'local', {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        expectedProfileKey: 'claude:sonnet:default',
      }, f.deps, undefined, undefined, {
        runRoot,
        continuation: true,
        recoveryRequestId: durable.transaction.requestId,
        preparedRunPlanTransaction: durable.transaction,
      })
      assert.deepEqual(f.mods(), ['business-model'],
        'the unsealed module reruns instead of being promoted to done from raw disk bytes')
      assert.equal(f.launches.filter((launch) => launch.kind === 'rerun').length, 0,
        'the terminal master cannot start from an unsealed-looking synthesis')
      assert.equal(fs.existsSync(path.join(
        REPO_ROOT, runRoot, 'business-model', synthesisFile(graph, 'business-model'),
      )), false, 'recovery removes the unsealed synthesis but leaves the module available to continue')
      writeSynthesis(runRoot, graph, 'business-model')
      f.finish('business-model')
      await f.tick()
      assert.equal(f.launches.filter((launch) => launch.kind === 'rerun').length, 1,
        'master starts only after the replacement child receives a terminal done receipt')
      await f.tick()
      f.finish('master')
      await f.tick()
    } finally {
      fs.rmSync(path.join(REPO_ROOT, runRoot), { recursive: true, force: true })
    }
  })

  await check('a recovered fresh Full with zero output still loads its original frozen receipt', async () => {
    const discovered = buildSwarmGraph()
    const modules = discovered.modules.filter((module) => module.name === 'business-model')
    const graph: SwarmGraph = {
      ...discovered,
      modules,
      totals: {
        modules: 1,
        agents: modules[0]!.agentCount,
        specialists: Object.values(modules[0]!.layers).flat().filter((agent) => !agent.isSynthesis).length,
        synthesis: 1,
      },
    }
    const runRoot = `analyses/ZZFRESHZERO_${Date.now()}`
    const durable = makeDurableChainFake(runRoot, () => false)
    const now = new Date().toISOString()
    durable.transaction.recoveredChainIntent = {
      version: 1,
      chainId: durable.transaction.requestId,
      user: 'tester',
      userVia: 'local',
      selection: {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        profileKey: 'claude:sonnet:default',
        executionProfile: {
          key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default',
        },
      },
      modules: [{
        module: 'business-model',
        dependsOn: [],
        synthesisOutputs: [`business-model/${synthesisFile(graph, 'business-model')}`],
      }],
      completed: [],
      nextModules: ['business-model'],
      inflightModules: [],
      masterState: 'pending',
      startedAt: now,
      progressAt: now,
      terminalStatus: null,
      terminalAt: null,
    }
    fs.mkdirSync(path.join(REPO_ROOT, runRoot), { recursive: true })
    const f = makeFake({ graph })
    try {
      await launchFullChained('ZZFRESHZERO', 'tester', 'local', {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        expectedProfileKey: 'claude:sonnet:default',
      }, f.deps, undefined, undefined, {
        runRoot,
        continuation: false,
        recoveryRequestId: durable.transaction.requestId,
        preparedRunPlanTransaction: durable.transaction,
      })
      assert.deepEqual(f.mods(), ['business-model'])
      assert.notEqual(f.launches[0]?.continuation, true,
        'the recovered action remains Full rather than becoming Continue')
      assert.equal(f.launches[0]?.requireExistingFrozenPoolReceipt, true,
        'crossing the prior paid boundary is enough to forbid a live-Drive re-evaluation, even with zero output')
      f.finish('business-model', 'error')
    } finally {
      fs.rmSync(path.join(REPO_ROOT, runRoot), { recursive: true, force: true })
    }
  })

  await check('a successful drained sibling is sealed and never repaid after another sibling fails', async () => {
    const discovered = buildSwarmGraph()
    const modules = discovered.modules.slice(0, 2).map((module) => ({ ...module, dependsOn: [] }))
    const graph: SwarmGraph = {
      ...discovered,
      modules,
      totals: {
        modules: modules.length,
        agents: modules.reduce((sum, module) => sum + module.agentCount, 0),
        specialists: modules.reduce((sum, module) => sum
          + Object.values(module.layers).flat().filter((agent) => !agent.isSynthesis).length, 0),
        synthesis: modules.length,
      },
    }
    const failedModule = modules[0]!.name
    const drainedDoneModule = modules[1]!.name
    const runRoot = `analyses/ZZDRAINED_${Date.now()}`
    const firstTransaction = makeDurableChainFake(runRoot, () => false)
    const first = makeFake({ graph })
    fs.mkdirSync(path.join(REPO_ROOT, runRoot), { recursive: true })
    try {
      await launchFullChained('ZZDRAINED', 'tester', 'local', {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        expectedProfileKey: 'claude:sonnet:default',
      }, first.deps, undefined, undefined, {
        runRoot,
        continuation: true,
        recoveryRequestId: firstTransaction.transaction.requestId,
        preparedRunPlanTransaction: firstTransaction.transaction,
      })
      assert.deepEqual(sorted(first.mods()), sorted([failedModule, drainedDoneModule]))
      writeSynthesis(runRoot, graph, drainedDoneModule)
      first.finish(failedModule, 'error')
      await first.tick() // the first failure has stopped new scheduling while its paid sibling drains
      first.finish(drainedDoneModule, 'done')
      await first.tick()
      const sealed = firstTransaction.progress().at(-1)
      assert.deepEqual(sealed?.completed.map((entry) => entry.module), [drainedDoneModule],
        'the later successful sibling is appended to protected completed evidence')
      assert.deepEqual(sealed?.nextModules, [failedModule],
        'only the failed sibling remains payable')
      assert.equal(first.poolClaimHeld(), false, 'the stopped wave releases only after the successful sibling is sealed')

      const firstStart = firstTransaction.starts()[0]!
      const recoveryTransaction = makeDurableChainFake(runRoot, () => false)
      recoveryTransaction.transaction.recoveredChainIntent = {
        version: 1,
        chainId: firstStart.chainId,
        user: firstStart.user,
        userVia: firstStart.userVia,
        selection: firstStart.selection,
        modules: firstStart.modules,
        completed: sealed!.completed,
        nextModules: sealed!.nextModules,
        inflightModules: sealed!.inflightModules,
        masterState: sealed!.masterState,
        startedAt: new Date().toISOString(),
        progressAt: new Date().toISOString(),
        terminalStatus: null,
        terminalAt: null,
      }
      const recovery = makeFake({ graph })
      await launchFullChained('ZZDRAINED', 'tester', 'local', {
        provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
        expectedProfileKey: 'claude:sonnet:default',
      }, recovery.deps, undefined, undefined, {
        runRoot,
        continuation: true,
        recoveryRequestId: firstStart.chainId,
        preparedRunPlanTransaction: recoveryTransaction.transaction,
      })
      assert.deepEqual(recovery.mods(), [failedModule],
        'restart launches only the failed module; the paid successful sibling is reused by exact hash')
      assert.equal(first.mods().filter((name) => name === drainedDoneModule).length
        + recovery.mods().filter((name) => name === drainedDoneModule).length, 1,
      'the successful sibling has exactly one provider launch across failure and restart')
      writeSynthesis(runRoot, graph, failedModule)
      recovery.finish(failedModule, 'done')
      await recovery.tick()
      assert.equal(recovery.launches.filter((launch) => launch.kind === 'rerun').length, 1)
      await recovery.tick()
      recovery.finish('master')
      await recovery.tick()
    } finally {
      fs.rmSync(path.join(REPO_ROOT, runRoot), { recursive: true, force: true })
    }
  })

  await check('a fresh-Full technical retry keeps one restart-stable exact root and chain identity', async () => {
    const f = makeFake()
    const requestId = '22222222-2222-4222-8222-222222222222'
    const runRoot = 'analyses/TESTTECH_2099-01-01'
    const out = await launchFullChained('TESTTECH', 'auto', 'local', { provider: 'claude' }, f.deps,
      undefined, undefined, { runRoot, technicalReadinessRetry: true, recoveryRequestId: requestId })
    assert.equal(out.runId, 'run-business-model')
    assert.equal(f.launches[0]?.runRoot, runRoot, 'the retry never retargets to today')
    assert.equal(f.launches[0]?.chainId, requestId,
      'the stable recovery request is the logged chain/execution identity at the paid boundary')
    assert.equal(f.launches[0]?.continuation, undefined,
      'technical readiness retry remains a fresh Full and cannot silently become Continue')
    f.finish('business-model', 'error')
  })

  await check('the immutable provider profile reaches every chained module and terminal master for Claude and Codex', async () => {
    const selections = [
      { provider: 'claude' as const, model: 'sonnet', reasoningLevel: 'default', expectedProfileKey: 'claude:sonnet:default' },
      { provider: 'codex' as const, model: 'gpt-5.6-sol', reasoningLevel: 'max', expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh' },
    ]
    for (const [index, selection] of selections.entries()) {
      const f = makeFake()
      await launchFullChained(`TESTPROVIDER${index}`, 'tester', 'local', selection, f.deps)
      for (const module of ['business-model', 'earnings', 'balance-sheet-survival', 'management-governance', 'competitive-intel', 'valuation', 'catalyst']) {
        if (!f.launches.some((launch) => launch.module === module)) {
          const prerequisite = module === 'earnings' ? 'business-model'
            : ['balance-sheet-survival', 'management-governance', 'competitive-intel'].includes(module) ? 'earnings'
            : module === 'valuation' ? 'management-governance'
            : 'valuation'
          if (prerequisite === 'management-governance') f.finish('balance-sheet-survival')
          f.finish(prerequisite)
        }
      }
      f.finish('competitive-intel')
      f.finish('catalyst')
      assert.ok(f.launches.some((launch) => launch.kind === 'rerun' && launch.module === 'master'))
      for (const launch of f.launches) {
        assert.deepEqual(
          { provider: launch.provider, model: launch.model, reasoningLevel: launch.reasoningLevel,
            expectedProfileKey: launch.expectedProfileKey },
          selection,
          `${selection.provider} ${launch.module ?? launch.kind} changed provider profile inside the chain`,
        )
      }
    }
  })

  await check('a frozen canary uses bounded module stages and exactly one terminal full adjudicator', async () => {
    const f = makeFake()
    const runRoot = 'analyses/provider-parity/2026-08-26/codex/TESTCANARY_2026-08-26__attempt-1234abcd'
    const freezeReceipt = 'analyses/provider-parity/2026-08-26/freeze/TESTCANARY_2026-08-26.json'
    const selection = {
      provider: 'codex' as const, model: 'gpt-5.6-sol', reasoningLevel: 'max',
      expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    }
    await launchFullChained('TESTCANARY', 'tester', 'local', selection, f.deps, undefined, undefined, {
      runRoot, parityCanary: { runRoot, freezeReceipt },
    })
    assert.equal(getParityCanaryChainStatus(runRoot)?.status, 'running',
      'the logical canary stays live while its bounded children advance')
    assert.equal(f.getMarkerRoot(), runRoot, 'the scheduler marker is bound to the isolated canary root')
    f.finish('business-model')
    f.finish('earnings')
    f.finish('management-governance')
    f.finish('balance-sheet-survival')
    f.finish('valuation')
    f.finish('competitive-intel')
    f.finish('catalyst')

    const modules = f.launches.filter((launch) => launch.kind === 'module')
    assert.equal(modules.length, buildSwarmGraph().modules.length, 'every discovered module receives one bounded launch')
    assert.ok(modules.every((launch) => launch.parityCanary?.stage === 'module'
      && launch.parityCanary.runRoot === runRoot && launch.parityCanary.freezeReceipt === freezeReceipt))
    const terminal = f.launches.filter((launch) => launch.kind === 'full' && launch.parityCanary?.stage === 'final')
    assert.equal(terminal.length, 1, 'one and only one terminal full-canary adjudicator is scheduled')
    assert.equal(new Set(f.launches.map((launch) => launch.chainId)).size, 1, 'all stages share one immutable chain identity')
    for (const launch of f.launches) {
      assert.deepEqual(
        { provider: launch.provider, model: launch.model, reasoningLevel: launch.reasoningLevel,
          expectedProfileKey: launch.expectedProfileKey },
        selection,
        `${launch.module ?? 'terminal'} changed the frozen canary profile`,
      )
    }
    f.finish('master')
    assert.equal(f.wasMarkerCleared(), true, 'terminal completion clears the isolated defer marker')
    assert.equal(getParityCanaryChainStatus(runRoot)?.status, 'done',
      'only the terminal adjudicator can complete the logical canary')
  })

  await check('a same-root canary continuation never reruns completed modules even with raw terminal files', async () => {
    const f = makeFake()
    const runRoot = `analyses/ZZCHAINCONT_${Date.now()}`
    const absolute = path.join(REPO_ROOT, runRoot)
    fs.mkdirSync(absolute, { recursive: true })
    try {
      for (const module of buildSwarmGraph().modules) {
        const synthesis = Object.values(module.layers).flat().find((agent) => agent.isSynthesis)!
        const dir = path.join(absolute, module.name)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, `${synthesis.key.split('/').at(-1)}.md`), `# ${module.name} synthesis\n`)
      }
      fs.writeFileSync(path.join(absolute, 'final_thesis.md'), '# Raw retained thesis\n')
      fs.writeFileSync(path.join(absolute, 'decision_record.json'), '{"decision":"Avoid"}\n')
      const freezeReceipt = 'analyses/provider-parity/2026-08-26/freeze/ZZCHAINCONT_2026-08-26.json'
      const out = await launchFullChained('ZZCHAINCONT', 'tester', 'local', {
        provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
        expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
      }, f.deps, undefined, undefined, {
        runRoot, continuation: true, parityCanary: { runRoot, freezeReceipt },
      })
      assert.equal(out.resumed, true)
      assert.equal(out.planned?.length, 0)
      assert.equal(out.skipped?.length, buildSwarmGraph().modules.length)
      assert.equal(f.launches.filter((launch) => launch.kind === 'module').length, 0,
        'the recovery spends no quota on completed modules')
      assert.equal(f.launches.filter((launch) =>
        launch.kind === 'full' && launch.parityCanary?.stage === 'final'
          && launch.parityCanary.continuation === true).length, 1,
      'the recovery launches exactly one terminal adjudicator')
    } finally {
      fs.rmSync(absolute, { recursive: true, force: true })
    }
  })

  await check('a frozen canary stays non-terminal until every active sibling drains after a failure', async () => {
    const f = makeFake()
    const runRoot = 'analyses/provider-parity/2026-08-26/codex/TESTCHAINSTATUS_2026-08-26__attempt-1234abcd'
    const freezeReceipt = 'analyses/provider-parity/2026-08-26/freeze/TESTCHAINSTATUS_2026-08-26.json'
    await launchFullChained('TESTCHAINSTATUS', 'tester', 'local', {
      provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
      expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    }, f.deps, undefined, undefined, { runRoot, parityCanary: { runRoot, freezeReceipt } })
    f.finish('business-model')
    f.finish('earnings')
    f.finish('management-governance', 'incomplete')
    assert.equal(getParityCanaryChainStatus(runRoot)?.status, 'running',
      'one failed child cannot publish a terminal status while siblings still write')
    f.finish('balance-sheet-survival')
    assert.equal(getParityCanaryChainStatus(runRoot)?.status, 'running')
    f.finish('competitive-intel')
    const terminal = getParityCanaryChainStatus(runRoot)
    assert.equal(terminal?.status, 'incomplete')
    assert.ok(terminal?.endedAt, 'the logical chain becomes terminal only after the last sibling drains')
  })

  await check('a failed module stops the chain — no further modules, no master', async () => {
    const f = makeFake()
    await launchFullChained('TESTF', 'tester', 'local', { provider: 'claude' }, f.deps)
    assert.deepEqual(f.mods(), ['business-model'])

    f.finish('business-model', 'error') // business-model fails
    assert.deepEqual(f.mods(), ['business-model'], 'no module launches after a failure')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master is not launched after a failure')
    assert.equal(f.wasMarkerCleared(), true, 'a failed chain clears the defer-memo marker (no orphan poisoning later runs)')
    assert.equal(subjectChainActive('TESTF'), false, 'a failed chain releases its subject reservation')
  })

  await check('a dependency cycle exposed after an acyclic prefix fails closed and releases the chain', async () => {
    const base = buildSwarmGraph()
    const graph: SwarmGraph = {
      ...base,
      modules: base.modules.map((module) => {
        if (module.name === 'balance-sheet-survival') {
          return { ...module, dependsOn: [...module.dependsOn, 'management-governance'] }
        }
        if (module.name === 'management-governance') {
          return { ...module, dependsOn: [...module.dependsOn, 'balance-sheet-survival'] }
        }
        return module
      }),
    }
    const f = makeFake({ graph })
    await launchFullChained('TESTCYCLE', 'tester', 'local', { provider: 'claude' }, f.deps)
    f.finish('business-model')
    f.finish('earnings')
    assert.deepEqual(sorted(f.mods()), sorted(['business-model', 'earnings', 'competitive-intel']),
      'the acyclic prefix and independent sink still run before the hidden cycle is exposed')
    f.finish('competitive-intel')
    assert.equal(f.wasMarkerCleared(), true, 'the stalled graph clears its defer marker')
    assert.equal(f.poolClaimHeld(), false, 'the stalled graph releases its stable pool claim')
    assert.equal(f.poolClaimReleases(), 1, 'the stalled graph releases the pool claim exactly once')
    assert.equal(subjectChainActive('TESTCYCLE'), false, 'the stalled graph releases its subject reservation')
    assert.ok(!f.launches.some((launch) => launch.kind === 'rerun'), 'a stalled graph never launches master')
  })

  await check('a rejected terminal master launch is handled once and releases the chain', async () => {
    const f = makeFake({ failMaster: true })
    await launchFullChained('TESTMASTERFAIL', 'tester', 'local', { provider: 'claude' }, f.deps)
    f.finish('business-model')
    f.finish('earnings')
    f.finish('management-governance')
    f.finish('balance-sheet-survival')
    f.finish('valuation')
    f.finish('competitive-intel')
    f.finish('catalyst')
    await f.tick()
    assert.equal(f.wasMarkerCleared(), true, 'a rejected terminal launch clears its defer marker')
    assert.equal(f.poolClaimHeld(), false, 'a rejected terminal launch releases its stable pool claim')
    assert.equal(f.poolClaimReleases(), 1, 'a rejected terminal launch releases exactly once')
    assert.equal(subjectChainActive('TESTMASTERFAIL'), false, 'a rejected terminal launch releases its subject')
    assert.equal(f.interruptions().length, 1, 'the rejected terminal launch leaves one durable recovery intent')
    assert.deepEqual(
      { step: f.interruptions()[0]?.step, runRoot: f.interruptions()[0]?.runRoot,
        provider: f.interruptions()[0]?.selection.provider },
      { step: 'master', runRoot: f.getMarkerRoot(), provider: 'claude' },
      'terminal recovery retains the exact scheduled root and provider',
    )
  })

  await check('a rejected later dependency wave records exact-root recovery instead of disappearing', async () => {
    const f = makeFake({ failModule: 'earnings' })
    const out = await launchFullChained('TESTLATERFAIL', 'tester', 'local', {
      provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
      expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    }, f.deps)
    assert.equal(out.runId, 'run-business-model')
    f.finish('business-model')
    await f.tick()
    assert.equal(f.interruptions().length, 1, 'only the first later-wave rejection owns recovery')
    const interruption = f.interruptions()[0]!
    assert.equal(interruption.step, 'module')
    assert.equal(interruption.module, 'earnings')
    assert.equal(interruption.runRoot, f.getMarkerRoot(), 'recovery is pinned to the original dated root')
    assert.equal(interruption.selection.provider, 'codex', 'provider choice is never substituted')
    assert.equal(f.poolClaimHeld(), false, 'the failed scheduler releases live leases for reconciliation')
    assert.equal(subjectChainActive('TESTLATERFAIL'), false)
  })

  await check('an initial parallel rejection before a sibling ACK still binds one exact recovery', async () => {
    const discovered = buildSwarmGraph()
    const roots = discovered.modules.slice(0, 2).map((module) => ({ ...module, dependsOn: [] }))
    const graph: SwarmGraph = { ...discovered, modules: roots }
    const rejected = roots[0]!.name
    const admitted = roots[1]!.name
    const f = makeFake({ graph, failModule: rejected, deferAck: admitted })
    const pending = launchFullChained('TESTINITIALRACE', 'tester', 'local', { provider: 'claude' }, f.deps)
    await f.tick()
    assert.equal(f.interruptions().length, 0,
      'the rejection waits while a same-wave launch can still become a real paid child')
    assert.equal(f.poolClaimHeld(), true, 'the exact root stays reserved across the unresolved ACK')
    f.ack(admitted)
    const out = await pending
    assert.equal(out.runId, `run-${admitted}`, 'the caller follows the sibling that actually admitted')
    assert.equal(f.interruptions().length, 1, 'the rejected sibling is sealed once after the ACK proves a chain exists')
    assert.equal(f.interruptions()[0]?.module, rejected)
    assert.equal(f.interruptions()[0]?.runRoot, f.getMarkerRoot())
    f.finish(admitted, 'done')
    assert.equal(f.poolClaimHeld(), false, 'the stopped chain releases only after its admitted writer drains')
  })

  await check('an aborted SIBLING stops new scheduling but does not launch the master', async () => {
    const f = makeFake()
    await launchFullChained('TESTS', 'tester', 'local', { provider: 'claude' }, f.deps)
    f.finish('business-model')
    f.finish('earnings')
    // after earnings, bss + mgov are in-flight; valuation waits for mgov (declared dependency).
    f.finish('management-governance', 'incomplete') // mgov fails -> chain stops; valuation never becomes ready
    assert.equal(f.poolClaimHeld(), true,
      'a failed sibling cannot release the chain receipt/lease while same-wave providers are still active')
    f.finish('balance-sheet-survival') // the other in-flight sibling still finishes on its own
    assert.equal(f.poolClaimHeld(), true,
      'the chain receipt remains bound until the last same-wave sibling drains')
    f.finish('competitive-intel')
    assert.equal(f.poolClaimHeld(), false,
      'the failed chain releases its receipt/lease exactly after the final sibling drains')
    // valuation never launched (its mgov dependency did not complete); catalyst never ready; master never launches
    assert.ok(!f.mods().includes('valuation'), 'valuation never launches when its management-governance dependency did not complete')
    assert.ok(!f.mods().includes('catalyst'), 'catalyst never starts when a sibling did not complete')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master never launches on an incomplete pipeline')
    assert.equal(f.wasMarkerCleared(), true, 'an incomplete pipeline clears the defer-memo marker (no orphan)')
  })

  await check('a transient 429 retries the module — it does NOT kill the chain or clear the marker', async () => {
    const f = makeFake({ fail429Once: ['balance-sheet-survival'] })
    await launchFullChained('TEST429', 'tester', 'local', { provider: 'claude' }, f.deps)
    f.finish('business-model')
    f.finish('earnings') // -> pump launches bss + mgov + competitive-intel; bss rejects with a 429, the others launch
    await f.tick()       // let bss's rejection .catch run
    assert.ok(!f.mods().includes('balance-sheet-survival'), 'bss did not launch on the 429 (un-reserved, not recorded)')
    assert.ok(f.mods().includes('management-governance'), 'its sibling mgov still launched in the same wave')
    assert.ok(f.mods().includes('competitive-intel'), 'its sibling competitive-intel still launched in the same wave')
    assert.equal(f.wasMarkerCleared(), false, 'a transient 429 must NOT clear the marker — the chain has not failed')
    assert.ok(f.pendingRetries() >= 1, 'a re-pump was scheduled for the 429')

    f.fireRetries()      // simulate a concurrency slot freeing
    await f.tick()
    assert.ok(f.mods().includes('balance-sheet-survival'), 'bss launches on retry once capacity frees')

    // the chain proceeds normally all the way to master — proving the transient 429 did not poison it
    f.finish('management-governance')
    f.finish('balance-sheet-survival')
    assert.ok(f.mods().includes('valuation'), 'valuation launches once both of its declared upstreams are done')
    f.finish('valuation')
    assert.ok(f.mods().includes('catalyst'), 'catalyst launches after all five of its upstreams')
    f.finish('competitive-intel') // the pure-sink module must finish too before the master may launch
    f.finish('catalyst')
    assert.ok(f.launches.some((l) => l.kind === 'rerun'), 'master launches — the transient 429 did not kill the chain')
    assert.equal(f.mods().length, 7, 'all seven modules launched despite the mid-wave 429')
  })

  await check('the chain-wide pool claim survives child transitions and an all-child capacity backoff', async () => {
    // the whole after-earnings wave (bss + mgov + competitive-intel) 429s at once, so there is a genuine
    // zero-child transition/backoff gap the chain claim must survive.
    const f = makeFake({ fail429Once: ['balance-sheet-survival', 'management-governance', 'competitive-intel'] })
    await launchFullChained('TESTPOOL', 'tester', 'local', { provider: 'claude' }, f.deps)
    assert.equal(f.poolClaimHeld(), true, 'claim is held after the first child ACK')
    f.finish('business-model')
    assert.equal(f.poolClaimHeld(), true, 'claim survives the business-model → earnings transition')
    f.finish('earnings')
    await f.tick() // all three next-wave attempts reject 429; no child RunState exists during backoff
    assert.ok(f.pendingRetries() >= 1, 'the chain is waiting in a capacity backoff')
    assert.equal(f.poolClaimHeld(), true, 'claim remains held while every child launch is backed off')
    assert.equal(subjectChainActive('TESTPOOL'), true,
      'the subject stays reserved even when no child RunState exists during the capacity gap')
    let exactRouteMutated = false
    const exactOutcome = await withSubjectLock(subjectMutationLockKey('research', 'TESTPOOL'), async () => {
      if (subjectChainActive('TESTPOOL')) return 'busy' as const
      exactRouteMutated = true
      return 'mutated' as const
    })
    assert.equal(exactOutcome, 'busy', 'an exact-route-equivalent contender sees the chain reservation')
    assert.equal(exactRouteMutated, false, 'the contender is rejected before staging any bytes')
    assert.equal(
      sharedDataPoolConflict('commodity', [], f.poolClaimHeld() ? [{ swarm: 'research' }] : [] )?.code,
      'shared_data_subject_busy',
      'a commodity first launch is rejected during the zero-child transition/backoff gap',
    )
    f.fireRetries()
    await f.tick()
    f.finish('management-governance')
    f.finish('competitive-intel') // the pure-sink module must finish too before the master may launch
    f.finish('balance-sheet-survival')
    f.finish('valuation')
    f.finish('catalyst')
    assert.equal(f.poolClaimHeld(), true, 'master ACK does not release the chain claim')
    f.finish('master')
    assert.equal(f.poolClaimHeld(), false, 'master terminal releases the claim')
    assert.equal(f.poolClaimReleases(), 1, 'the chain claim releases exactly once')
    assert.equal(subjectChainActive('TESTPOOL'), false, 'master terminal leaves no stale subject reservation')
  })

  await check('exact staging lock first prevents a new chain from reaching marker/launch mutation', async () => {
    const f = makeFake()
    let contenderEntered = false
    await withSubjectLock(subjectMutationLockKey('research', 'TESTLOCKFIRST'), async () => {
      await assert.rejects(
        withSubjectLock(subjectMutationLockKey('research', 'TESTLOCKFIRST'), async () => {
          contenderEntered = true
          await launchFullChained('TESTLOCKFIRST', 'tester', 'local', { provider: 'claude' }, f.deps)
        }),
        (error: any) => error instanceof SubjectBusyError,
      )
    })
    assert.equal(contenderEntered, false, 'the losing public/supervisor launch path never enters')
    assert.equal(f.getMarker(), null, 'the chain cannot write its defer marker while exact staging owns the key')
    assert.deepEqual(f.launches, [], 'no child launch is registered or started')
    assert.equal(subjectChainActive('TESTLOCKFIRST'), false, 'the rejected contender leaves no reservation')
  })

  await check('haltAllChains() stops the DAG — no further modules, no master (kill-switch wiring)', async () => {
    const f = makeFake()
    await launchFullChained('TESTHALT', 'tester', 'local', { provider: 'claude' }, f.deps)
    f.finish('business-model') // -> earnings launches (chain still alive)
    assert.ok(f.mods().includes('earnings'), 'earnings launched before the halt')
    haltAllChains()            // stop-everything bumps the chain epoch
    assert.equal(subjectChainActive('TESTHALT'), false, 'stop-everything clears the chain reservation synchronously')
    f.finish('earnings')       // would normally launch bss + mgov — but the chain is halted
    assert.deepEqual(sorted(f.mods()), sorted(['business-model', 'earnings']), 'no module launches after haltAllChains()')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master never launches after a halt')
    assert.equal(f.wasMarkerCleared(), true, 'a halted chain clears the defer-memo marker (no orphan poisoning a later same-day standalone run)')
  })

  await check('stopping one subject halts only its DAG; an unrelated subject keeps advancing', async () => {
    const india = makeFake()
    const tcs = makeFake()
    await launchFullChained('TESTINDIA', 'tester', 'local', { provider: 'claude' }, india.deps)
    await launchFullChained('TESTTCS', 'tester', 'local', { provider: 'claude' }, tcs.deps)

    await cancelSubject('TESTINDIA', 'research')
    assert.equal(subjectChainActive('TESTINDIA'), false, 'subject cancellation clears only its reservation')
    assert.equal(subjectChainActive('TESTTCS'), true, 'the unrelated subject remains reserved while it advances')
    india.finish('business-model')
    tcs.finish('business-model')

    assert.deepEqual(india.mods(), ['business-model'], 'the cancelled subject launches no successor')
    assert.deepEqual(tcs.mods(), ['business-model', 'earnings'], 'the unrelated subject chain still advances')
    assert.equal(india.wasMarkerCleared(), true, 'the cancelled subject clears its own defer marker')
    assert.equal(tcs.wasMarkerCleared(), false, 'the unrelated subject keeps its defer marker while running')
  })

  await check('a sealed dated run is rejected before the chained scheduler writes a marker or launches paid work', async () => {
    const TICK = 'ZZSEALEDCHAIN'
    const d = new Date()
    const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const runRootAbs = path.join(REPO_ROOT, 'analyses', `${TICK}_${TODAY}`)
    try {
      fs.mkdirSync(runRootAbs, { recursive: true })
      fs.writeFileSync(path.join(runRootAbs, 'idea_admission.json'), '{}\n')
      const f = makeFake()
      await assert.rejects(
        () => launchFullChained(TICK, 'tester', 'local', { provider: 'claude' }, f.deps),
        (error: any) => error?.statusCode === 409 && error?.body?.code === 'research_run_sealed',
      )
      assert.equal(f.getMarker(), null, 'the defer marker is not written for a sealed run')
      assert.deepEqual(f.launches, [], 'no module or master launch occurs')
    } finally {
      fs.rmSync(runRootAbs, { recursive: true, force: true })
    }
  })

  // RESUME (the honest-UI fix): a run folder already holding finished modules is CONTINUED — those modules
  // are reported as `skipped` (the cockpit shows them done, not "starting") and are NOT re-launched; only
  // the rest are `planned`. Touches a temp run folder, always cleaned up (never leak a fixture into git).
  await check('RESUME: finished modules are skipped + reported, never re-launched', async () => {
    const TICK = 'ZZRSMCHAIN'
    const d = new Date()
    const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const runRootAbs = path.join(REPO_ROOT, 'analyses', `${TICK}_${TODAY}`)
    try {
      const finishedHashes = new Map<string, string>()
      for (const m of ['business-model', 'earnings']) {
        fs.mkdirSync(path.join(runRootAbs, m), { recursive: true })
        const synthesis = path.join(runRootAbs, m, `99_${m}-synthesis.md`)
        fs.writeFileSync(synthesis, '# done\n') // a non-empty 99 synthesis = module finished
        finishedHashes.set(synthesis, createHash('sha256').update(fs.readFileSync(synthesis)).digest('hex'))
      }
      const f = makeFake()
      const out = await launchFullChained(TICK, 'tester', 'local', { provider: 'claude' }, f.deps)
      assert.equal(out.resumed, true, 'a folder with finished modules is a resume')
      assert.deepEqual(sorted(out.skipped ?? []), sorted(['business-model', 'earnings']), 'the finished modules are reported as skipped')
      assert.ok(!(out.planned ?? []).includes('business-model') && !(out.planned ?? []).includes('earnings'), 'a skipped module is never also planned')
      assert.ok((out.planned ?? []).includes('valuation') && (out.planned ?? []).includes('catalyst'), 'the unfinished modules are planned')
      assert.ok(!f.mods().includes('business-model') && !f.mods().includes('earnings'), 'a finished module is NOT re-launched (the money the user was worried about)')
      for (const [synthesis, digest] of finishedHashes) {
        assert.equal(createHash('sha256').update(fs.readFileSync(synthesis)).digest('hex'), digest,
          'the scheduler preserves every reusable finished byte exactly')
      }
      assert.ok(f.launches.every((child) => child.requireExistingFrozenPoolReceipt === true),
        'implicit same-root reuse must load the old exact generation instead of freezing live data again')
      // both deps of bss + mgov are seeded done, so they are the newly-ready wave and launch immediately
      assert.ok(f.mods().includes('balance-sheet-survival') && f.mods().includes('management-governance'), 'the next-ready modules launch straight away on resume')
    } finally {
      fs.rmSync(runRootAbs, { recursive: true, force: true })
    }
  })

  await check('CONTINUE: every module and master child keeps the exact cross-midnight run root', async () => {
    const TICK = 'ZZEXACTCHAIN'
    const runRoot = `analyses/${TICK}_2026-08-27`
    const runRootAbs = path.join(REPO_ROOT, runRoot)
    try {
      fs.mkdirSync(runRootAbs, { recursive: true })
      const f = makeFake()
      const pending = launchFullChained(TICK, 'tester', 'local', { provider: 'codex' }, f.deps,
        undefined, undefined, { runRoot, continuation: true })
      await Promise.resolve() // transaction activation is an awaited durability boundary before scheduling
      assert.ok(f.launches.length > 0, 'the first exact-root module wave launches')
      for (const child of f.launches) {
        assert.equal(child.runRoot, runRoot)
        assert.equal(child.continuation, true)
        assert.equal(child.requireExistingFrozenPoolReceipt, true)
      }
      for (const module of buildSwarmGraph().modules.map((entry) => entry.name)) {
        if (f.mods().includes(module)) f.finish(module)
      }
      await pending
      const master = f.launches.find((entry) => entry.kind === 'rerun' && entry.module === 'master')
      assert.ok(master, 'the terminal master launches after the modules finish')
      assert.equal(master!.runRoot, runRoot)
      assert.equal(master!.continuation, true)
      assert.equal(master!.requireExistingFrozenPoolReceipt, true,
        'the terminal master remains bound to the same restart-durable generation')
    } finally {
      fs.rmSync(runRootAbs, { recursive: true, force: true })
    }
  })

  await check('RESUME: a malformed current 99 is planned again, never seeded as finished', async () => {
    const TICK = 'ZZBAD99CHAIN'
    const d = new Date()
    const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const runRootAbs = path.join(REPO_ROOT, 'analyses', `${TICK}_${TODAY}`)
    try {
      const moduleDir = path.join(runRootAbs, 'business-model')
      fs.mkdirSync(moduleDir, { recursive: true })
      fs.writeFileSync(path.join(moduleDir, '99_business-model-synthesis.md'), '# cut off\n\n```json\n{"partial":true}\n')
      const f = makeFake()
      const out = await launchFullChained(TICK, 'tester', 'local', { provider: 'claude' }, f.deps)
      assert.ok(!(out.skipped ?? []).includes('business-model'), 'invalid 99 cannot enter the resumed done set')
      assert.ok((out.planned ?? []).includes('business-model'), 'the module remains in the paid plan')
      assert.ok(f.mods().includes('business-model'), 'the full chain reruns the module instead of feeding bad bytes downstream')
      assert.equal(f.launches[0]?.requireExistingFrozenPoolReceipt, true,
        'partial provider output without a valid synthesis still requires the old generation receipt')
    } finally {
      fs.rmSync(runRootAbs, { recursive: true, force: true })
    }
  })

  await check('RESUME: when every module is done, wait for the direct master launch ACK and return its run id', async () => {
    const TICK = 'ZZRSMMASTER'
    const d = new Date()
    const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const runRootAbs = path.join(REPO_ROOT, 'analyses', `${TICK}_${TODAY}`)
    try {
      for (const m of buildSwarmGraph().modules.map((item) => item.name)) {
        fs.mkdirSync(path.join(runRootAbs, m), { recursive: true })
        fs.writeFileSync(path.join(runRootAbs, m, `99_${m}-synthesis.md`), '# done\n')
      }
      const f = makeFake()
      const out = await launchFullChained(TICK, 'tester', 'local', { provider: 'claude' }, f.deps)
      assert.equal(out.runId, 'run-master', 'direct-master resume returns the registered master id, never an empty placeholder')
      assert.equal(f.mods().length, 0, 'no finished module is relaunched')
      assert.equal(f.launches.filter((item) => item.kind === 'rerun' && item.module === 'master').length, 1,
        'the direct master is launched exactly once')
      assert.equal(f.launches[0]?.requireExistingFrozenPoolReceipt, true,
        'a direct-master resume cannot synthesize old modules against a new generation')
    } finally {
      fs.rmSync(runRootAbs, { recursive: true, force: true })
    }
  })

  // Finding 8: a RESUME of a broken run must drop any stale RUN_FAILURE.md left by the earlier break
  // SYNCHRONOUSLY, at the moment the relaunch starts — not only later, when the resumed attempt eventually
  // completes (finalizeRunOnClose's clearRunFailure). rerun.md's own success-path Step 9B already `rm -f`s
  // it before its commit, but this closes the same hole for any OTHER commit of the run root that might
  // fire before that step ever runs.
  await check('RESUME: a stale RUN_FAILURE.md from the earlier break is removed as soon as the relaunch starts', async () => {
    const TICK = 'ZZRSMFAIL'
    const d = new Date()
    const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const runRootAbs = path.join(REPO_ROOT, 'analyses', `${TICK}_${TODAY}`)
    try {
      fs.mkdirSync(path.join(runRootAbs, 'business-model'), { recursive: true })
      fs.writeFileSync(path.join(runRootAbs, 'business-model', '99_business-model-synthesis.md'), '# done\n')
      fs.writeFileSync(path.join(runRootAbs, 'RUN_FAILURE.md'), '# Run Failure\n\n- status: FAILED (from the earlier break)\n')
      const f = makeFake()
      await launchFullChained(TICK, 'tester', 'local', { provider: 'claude' }, f.deps)
      assert.ok(!fs.existsSync(path.join(runRootAbs, 'RUN_FAILURE.md')), 'the stale failure note must be gone the moment the resume starts, not just at eventual completion')
    } finally {
      fs.rmSync(runRootAbs, { recursive: true, force: true })
    }
  })

  console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
})()
