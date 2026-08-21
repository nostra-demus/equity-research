// DAG-parallel full-chain scheduler (launchFullChained): does the per-module chain launch modules in
// dependency order, run independent siblings CONCURRENTLY, launch the master only after every module is
// done, drop the defer-module-memos marker, and STOP scheduling when a module fails? This drives the real
// research DAG with a FAKE launcher — no spawned CLI, no filesystem, no registry — so it is deterministic
// and free. It is the cheap stand-in for "did #1 schedule correctly", which otherwise needs a 2-3h run.
// Run: npx tsx test/full-chain-schedule.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { cancelSubject, type FullChainDeps, haltAllChains, launchFullChained, subjectChainActive } from '../src/launcher'
import { REPO_ROOT } from '../src/config'
import { sharedDataPoolConflict } from '../src/intake-owner'
import { buildSwarmGraph } from '../src/roster'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from '../src/subject-lock'
import type { LaunchPreflight, RunStatus } from '../src/types'

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
function makeFake(opts?: { fail429Once?: string[] }) {
  const launches: { kind: string; module?: string; agent?: string; provider: string; model?: string; reasoningLevel?: string }[] = []
  const onFinish = new Map<string, (s: RunStatus) => void>()
  let marker: string | null = null
  let markerCleared = false
  let poolClaimHeld = false
  let poolClaimReleases = 0
  const retries: Array<() => void> = []
  const fail429Once = new Set(opts?.fail429Once ?? [])
  const deps: FullChainDeps = {
    launchAndWire: (params, cb) => {
      const key = params.kind === 'rerun' ? 'master' : (params.module ?? params.agent ?? '?')
      // Simulate a transient global-capacity 429 on the FIRST launch attempt for a flagged module.
      if (params.kind === 'module' && fail429Once.has(params.module!)) {
        fail429Once.delete(params.module!)
        const err: any = new Error('at capacity'); err.statusCode = 429; err.body = { code: 'capacity' }
        return Promise.reject(err)
      }
      launches.push({
        kind: params.kind, module: params.module, agent: params.agent,
        provider: params.provider, model: params.model, reasoningLevel: params.reasoningLevel,
      })
      onFinish.set(key, cb)
      return Promise.resolve({ runId: `run-${key}`, preflight: {} as LaunchPreflight })
    },
    writeMarker: (ticker) => { marker = ticker },
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
    wasMarkerCleared: () => markerCleared,
    pendingRetries: () => retries.length,
    poolClaimHeld: () => poolClaimHeld,
    poolClaimReleases: () => poolClaimReleases,
  }
}

const sorted = (a: string[]) => [...a].sort()

;(async () => {
  // sanity: the expected schedule below is written for THIS exact research DAG. If a module is added or a
  // dependency changes, this fails first (loudly) so the schedule assertions get re-checked.
  await check('research DAG is the expected 7-module shape', () => {
    const g = buildSwarmGraph()
    assert.deepEqual(
      sorted(g.modules.map((m) => m.name)),
      sorted(['business-model', 'earnings', 'competitive-intel', 'balance-sheet-survival', 'management-governance', 'valuation', 'catalyst']),
    )
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
  })

  await check('the immutable provider profile reaches every chained module and the terminal master', async () => {
    const f = makeFake()
    const selection = { provider: 'codex' as const, model: 'gpt-5.6-sol', reasoningLevel: 'max' }
    await launchFullChained('TESTPROVIDER', 'tester', 'local', selection, f.deps)
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
        { provider: launch.provider, model: launch.model, reasoningLevel: launch.reasoningLevel },
        selection,
        `${launch.module ?? launch.kind} changed provider profile inside the chain`,
      )
    }
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

  await check('an aborted SIBLING stops new scheduling but does not launch the master', async () => {
    const f = makeFake()
    await launchFullChained('TESTS', 'tester', 'local', { provider: 'claude' }, f.deps)
    f.finish('business-model')
    f.finish('earnings')
    // after earnings, bss + mgov are in-flight; valuation waits for mgov (declared dependency).
    f.finish('management-governance', 'incomplete') // mgov fails -> chain stops; valuation never becomes ready
    f.finish('balance-sheet-survival') // the other in-flight sibling still finishes on its own
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
          await launchFullChained('TESTLOCKFIRST', 'tester', 'local', f.deps)
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
    await launchFullChained('TESTINDIA', 'tester', 'local', india.deps)
    await launchFullChained('TESTTCS', 'tester', 'local', tcs.deps)

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
      for (const m of ['business-model', 'earnings']) {
        fs.mkdirSync(path.join(runRootAbs, m), { recursive: true })
        fs.writeFileSync(path.join(runRootAbs, m, `99_${m}-synthesis.md`), '# done\n') // a non-empty 99 synthesis = module finished
      }
      const f = makeFake()
      const out = await launchFullChained(TICK, 'tester', 'local', { provider: 'claude' }, f.deps)
      assert.equal(out.resumed, true, 'a folder with finished modules is a resume')
      assert.deepEqual(sorted(out.skipped ?? []), sorted(['business-model', 'earnings']), 'the finished modules are reported as skipped')
      assert.ok(!(out.planned ?? []).includes('business-model') && !(out.planned ?? []).includes('earnings'), 'a skipped module is never also planned')
      assert.ok((out.planned ?? []).includes('valuation') && (out.planned ?? []).includes('catalyst'), 'the unfinished modules are planned')
      assert.ok(!f.mods().includes('business-model') && !f.mods().includes('earnings'), 'a finished module is NOT re-launched (the money the user was worried about)')
      // both deps of bss + mgov are seeded done, so they are the newly-ready wave and launch immediately
      assert.ok(f.mods().includes('balance-sheet-survival') && f.mods().includes('management-governance'), 'the next-ready modules launch straight away on resume')
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
      const out = await launchFullChained(TICK, 'tester', 'local', f.deps)
      assert.ok(!(out.skipped ?? []).includes('business-model'), 'invalid 99 cannot enter the resumed done set')
      assert.ok((out.planned ?? []).includes('business-model'), 'the module remains in the paid plan')
      assert.ok(f.mods().includes('business-model'), 'the full chain reruns the module instead of feeding bad bytes downstream')
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
