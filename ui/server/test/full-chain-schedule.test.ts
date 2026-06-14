// DAG-parallel full-chain scheduler (launchFullChained): does the per-module chain launch modules in
// dependency order, run independent siblings CONCURRENTLY, launch the master only after every module is
// done, drop the defer-module-memos marker, and STOP scheduling when a module fails? This drives the real
// research DAG with a FAKE launcher — no spawned CLI, no filesystem, no registry — so it is deterministic
// and free. It is the cheap stand-in for "did #1 schedule correctly", which otherwise needs a 2-3h run.
// Run: npx tsx test/full-chain-schedule.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { type FullChainDeps, haltAllChains, launchFullChained } from '../src/launcher'
import { buildSwarmGraph } from '../src/roster'
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
  const launches: { kind: string; module?: string; agent?: string }[] = []
  const onFinish = new Map<string, (s: RunStatus) => void>()
  let marker: string | null = null
  let markerCleared = false
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
      launches.push({ kind: params.kind, module: params.module, agent: params.agent })
      onFinish.set(key, cb)
      return Promise.resolve({ runId: `run-${key}`, preflight: {} as LaunchPreflight })
    },
    writeMarker: (ticker) => { marker = ticker },
    clearMarker: () => { marker = null; markerCleared = true },
    scheduleRetry: (fn) => { retries.push(fn) },
  }
  const mods = () => launches.filter((l) => l.kind === 'module').map((l) => l.module!)
  const finish = (key: string, status: RunStatus = 'done') => {
    const cb = onFinish.get(key)
    assert.ok(cb, `expected ${key} to have been launched before finishing it`)
    cb!(status)
  }
  const fireRetries = () => { for (const fn of retries.splice(0)) fn() }
  const tick = () => new Promise((r) => setTimeout(r, 0)) // flush the .catch microtasks
  return { deps, launches, mods, finish, fireRetries, tick, getMarker: () => marker, wasMarkerCleared: () => markerCleared, pendingRetries: () => retries.length }
}

const sorted = (a: string[]) => [...a].sort()

;(async () => {
  // sanity: the expected schedule below is written for THIS exact research DAG. If a module is added or a
  // dependency changes, this fails first (loudly) so the schedule assertions get re-checked.
  await check('research DAG is the expected 6-module shape', () => {
    const g = buildSwarmGraph()
    assert.deepEqual(
      sorted(g.modules.map((m) => m.name)),
      sorted(['business-model', 'earnings', 'balance-sheet-survival', 'management-governance', 'valuation', 'catalyst']),
    )
  })

  await check('schedules BM -> earnings -> {bss || mgov} -> valuation -> catalyst -> master; marker dropped', async () => {
    const f = makeFake()
    const out = await launchFullChained('TESTX', 'tester', 'local', f.deps)

    // the marker is dropped before any module launches
    assert.equal(f.getMarker(), 'TESTX', 'defer-module-memos marker written for the ticker')
    // first wave: only the dep-free module
    assert.deepEqual(f.mods(), ['business-model'], 'only business-model launches first')
    assert.equal(out.runId, 'run-business-model', 'caller gets the first run id to follow')
    assert.equal(out.chained, true)

    // business-model done -> earnings (the only newly-ready module) launches
    f.finish('business-model')
    assert.deepEqual(sorted(f.mods()), sorted(['business-model', 'earnings']), 'earnings launches after business-model')

    // earnings done -> balance-sheet-survival + management-governance launch CONCURRENTLY.
    // valuation must NOT yet: it declares management-governance (the RF-OWN-004 / §24 Filter-6 read), so it
    // waits for mgov. This is the output-neutrality fix — in a serial run mgov always preceded valuation;
    // the scheduler must reproduce that ordering, not run them in parallel.
    f.finish('earnings')
    const afterEarnings = f.mods()
    assert.equal(afterEarnings.length, 4, 'bss + mgov join after earnings — but NOT valuation')
    assert.ok(afterEarnings.includes('balance-sheet-survival') && afterEarnings.includes('management-governance'), 'bss + mgov launch in the wave')
    assert.ok(!afterEarnings.includes('valuation'), 'valuation must NOT launch until management-governance is done (declared dependency)')
    assert.ok(!afterEarnings.includes('catalyst'), 'catalyst waits for all five upstreams')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master waits for every module')

    // management-governance done -> valuation becomes ready and launches (bss may still be running)
    f.finish('management-governance')
    assert.ok(f.mods().includes('valuation'), 'valuation launches once management-governance is done')

    // remaining siblings done -> catalyst launches (it needs all five upstreams)
    f.finish('balance-sheet-survival')
    f.finish('valuation')
    assert.ok(f.mods().includes('catalyst'), 'catalyst launches once all five upstreams are done')
    assert.equal(f.mods().length, 6, 'all six modules have launched')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master still waits for catalyst')

    // catalyst done -> master synthesizer launches exactly once
    f.finish('catalyst')
    const masters = f.launches.filter((l) => l.kind === 'rerun' && l.module === 'master' && l.agent === 'synthesizer')
    assert.equal(masters.length, 1, 'master synthesizer launches exactly once, after every module is done')
  })

  await check('a failed module stops the chain — no further modules, no master', async () => {
    const f = makeFake()
    await launchFullChained('TESTF', 'tester', 'local', f.deps)
    assert.deepEqual(f.mods(), ['business-model'])

    f.finish('business-model', 'error') // business-model fails
    assert.deepEqual(f.mods(), ['business-model'], 'no module launches after a failure')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master is not launched after a failure')
    assert.equal(f.wasMarkerCleared(), true, 'a failed chain clears the defer-memo marker (no orphan poisoning later runs)')
  })

  await check('an aborted SIBLING stops new scheduling but does not launch the master', async () => {
    const f = makeFake()
    await launchFullChained('TESTS', 'tester', 'local', f.deps)
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
    await launchFullChained('TEST429', 'tester', 'local', f.deps)
    f.finish('business-model')
    f.finish('earnings') // -> pump launches bss + mgov; bss rejects with a 429, mgov launches
    await f.tick()       // let bss's rejection .catch run
    assert.ok(!f.mods().includes('balance-sheet-survival'), 'bss did not launch on the 429 (un-reserved, not recorded)')
    assert.ok(f.mods().includes('management-governance'), 'its sibling mgov still launched in the same wave')
    assert.equal(f.wasMarkerCleared(), false, 'a transient 429 must NOT clear the marker — the chain has not failed')
    assert.ok(f.pendingRetries() >= 1, 'a re-pump was scheduled for the 429')

    f.fireRetries()      // simulate a concurrency slot freeing
    await f.tick()
    assert.ok(f.mods().includes('balance-sheet-survival'), 'bss launches on retry once capacity frees')

    // the chain proceeds normally all the way to master — proving the transient 429 did not poison it
    f.finish('management-governance')
    assert.ok(f.mods().includes('valuation'), 'valuation launches once management-governance is done')
    f.finish('balance-sheet-survival')
    f.finish('valuation')
    assert.ok(f.mods().includes('catalyst'), 'catalyst launches after all five upstreams')
    f.finish('catalyst')
    assert.ok(f.launches.some((l) => l.kind === 'rerun'), 'master launches — the transient 429 did not kill the chain')
    assert.equal(f.mods().length, 6, 'all six modules launched despite the mid-wave 429')
  })

  await check('haltAllChains() stops the DAG — no further modules, no master (kill-switch wiring)', async () => {
    const f = makeFake()
    await launchFullChained('TESTHALT', 'tester', 'local', f.deps)
    f.finish('business-model') // -> earnings launches (chain still alive)
    assert.ok(f.mods().includes('earnings'), 'earnings launched before the halt')
    haltAllChains()            // stop-everything bumps the chain epoch
    f.finish('earnings')       // would normally launch bss + mgov — but the chain is halted
    assert.deepEqual(sorted(f.mods()), sorted(['business-model', 'earnings']), 'no module launches after haltAllChains()')
    assert.ok(!f.launches.some((l) => l.kind === 'rerun'), 'master never launches after a halt')
    assert.equal(f.wasMarkerCleared(), true, 'a halted chain clears the defer-memo marker (no orphan poisoning a later same-day standalone run)')
  })

  console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
})()
