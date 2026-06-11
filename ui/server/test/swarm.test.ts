// Swarm layer (CLAUDE.md §26 "Swarms"): discovery isolation, manifest-driven graphs, the
// run-root-prefix watcher, and the routing-contract events. Run: npx tsx test/swarm.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { createRun, finishRun, setActiveSubjectRun, type RunState } from '../src/registry'
import { handleFile } from '../src/fs-watcher'
import { buildSwarmGraph, graphForSubject } from '../src/roster'
import { listSwarms, swarmById } from '../src/swarms'
import { admitRun } from '../src/admission'
import type { SseEvent } from '../src/types'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

// ---- discovery ----
check('research graph does NOT contain any screener module (one-level glob isolation)', () => {
  const research = buildSwarmGraph()
  const screener = buildSwarmGraph('screener')
  const researchNames = new Set(research.modules.map((m) => m.name))
  for (const m of screener.modules) assert.ok(!researchNames.has(m.name), `${m.name} leaked into research`)
  assert.equal(research.swarm, undefined) // default payload stays byte-stable (no swarm descriptor)
})

check('screener swarm is discovered from its SWARM.md manifest with a routing contract', () => {
  const swarms = listSwarms(true)
  assert.equal(swarms[0].id, 'research')
  const sc = swarms.find((s) => s.id === 'screener')!
  assert.ok(sc, 'screener manifest missing')
  assert.equal(sc.unit, 'signal')
  assert.equal(sc.runRootTemplate, 'screener/runs/{SIG_ID}')
  assert.ok(sc.routing && sc.routing.terminal.includes('watchlist_no_edge') && sc.routing.continue.includes('PROMOTE'))
})

check('screener modules topo-sort by depends_on and carry swarm provenance', () => {
  const g = buildSwarmGraph('screener')
  assert.deepEqual(
    g.modules.map((m) => m.name),
    ['signal-gate', 'thesis-structure', 'edge-definition', 'candidate-surfacing'],
  )
  assert.equal(g.swarm?.id, 'screener')
  for (const m of g.modules) assert.equal(m.swarmId, 'screener')
})

check('requiredUpstream is run-root-relative via the manifest template (no analyses/ hardcode)', () => {
  const g = buildSwarmGraph('screener')
  const ts = g.modules.find((m) => m.name === 'thesis-structure')!
  const evt = Object.values(ts.layers).flat().find((a) => a.name === 'screener-event-statement')!
  assert.ok(evt.requiredUpstream.includes('signal-gate/99_signal-gate-synthesis.md'))
  assert.ok(evt.requiredUpstream.every((p) => !p.startsWith('screener/') && !p.startsWith('analyses/')))
})

// ---- per-subject graph (fixture run) ----
check('graphForSubject resolves the fixture signal run and marks upstream-present agents runnable', () => {
  const g = graphForSubject('screener', 'SIG-20260610-a3f2c81d')
  const ts = g.modules.find((m) => m.name === 'thesis-structure')!
  assert.equal(ts.depsComplete, true) // signal-gate synthesis exists in the fixture
  const evt = Object.values(ts.layers).flat().find((a) => a.name === 'screener-event-statement')!
  assert.equal(evt.soloRunnable, true)
})

// ---- watcher: run-root prefix binding + routing events ----
const SIG = 'SIG-20991231-deadbeef'
const RUNROOT = `screener/runs/${SIG}`

function mkScreenerRun(expected: { key: string; module: string; name: string; layer: number }[]): RunState {
  const r = createRun({
    kind: 'signal',
    ticker: SIG,
    subjectId: SIG,
    swarmId: 'screener',
    unit: 'signal',
    model: 'sonnet',
    prompt: '',
    user: 'test',
    userVia: 'local',
    runRoot: RUNROOT,
    willCommitToMain: true,
    writeTargetsAbs: [],
    coveredModules: ['signal-gate'],
    readDepsAbs: [],
    closeWatcher: undefined,
    expected: new Map(expected.map((e) => [e.key, { ...e, outputRel: `${e.module}/${e.key.split('/')[1]}.md` }])),
  })
  r.status = 'running'
  setActiveSubjectRun(r.runId, r.subjectId) // register like the launcher does, so admission sees it
  return r
}

const sigDir = path.join(REPO_ROOT, RUNROOT)
fs.rmSync(sigDir, { recursive: true, force: true })
try {
  const run = mkScreenerRun([
    { key: 'signal-gate/00_intake-gate0', module: 'signal-gate', name: 'screener-intake-gate0', layer: 0 },
    { key: 'signal-gate/99_signal-gate-synthesis', module: 'signal-gate', name: 'screener-signal-synthesis', layer: 5 },
  ])
  const events: SseEvent[] = []
  run.subscribers.add({ id: 't', send: (e) => events.push(e) })

  // a synthesis lands in the screener run folder with a Routing block
  const synthPath = path.join(sigDir, 'signal-gate', '99_signal-gate-synthesis.md')
  fs.mkdirSync(path.dirname(synthPath), { recursive: true })
  fs.writeFileSync(
    synthPath,
    '# Signal Gate Synthesis — test\n\nbody long enough to clear the placeholder byte floor.\n\n## Routing\n\nRouting: PROMOTE\nMateriality: 84\nNext module: thesis-structure\n',
  )
  handleFile(run, synthPath)

  check('screener watcher binds by run-root prefix and marks the orb done', () => {
    assert.equal(run.agents.get('signal-gate/99_signal-gate-synthesis')?.status, 'done')
    const done = events.find((e) => e.type === 'agent-done') as any
    assert.equal(done.outputPath, `${RUNROOT}/signal-gate/99_signal-gate-synthesis.md`)
  })

  check('a continue-routing emits module-routed{terminal:false} + module-done completed', () => {
    const routed = events.find((e) => e.type === 'module-routed') as any
    assert.ok(routed, 'no module-routed event')
    assert.equal(routed.route, 'PROMOTE')
    assert.equal(routed.terminal, false)
    assert.equal(routed.nextModule, 'thesis-structure')
    assert.ok(events.find((e) => e.type === 'module-done' && (e as any).status === 'completed'))
  })

  // a terminal Layer-0 gate
  const run2 = mkScreenerRun([{ key: 'signal-gate/00_intake-gate0', module: 'signal-gate', name: 'screener-intake-gate0', layer: 0 }])
  const events2: SseEvent[] = []
  run2.subscribers.add({ id: 't2', send: (e) => events2.push(e) })
  const gatePath = path.join(sigDir, 'signal-gate', '00_intake-gate0.md')
  fs.writeFileSync(
    gatePath,
    '# Signal Intake & Gate 0 — test\n\noff-list source, enough body bytes to clear the floor here.\n\n## Routing\n\nRouting: watchlist_no_source\nNext module: none\n',
  )
  handleFile(run2, gatePath)

  check('a terminal Layer-0 routing emits module-routed{terminal:true} + module-done aborted', () => {
    const routed = events2.find((e) => e.type === 'module-routed') as any
    assert.equal(routed?.route, 'watchlist_no_source')
    assert.equal(routed?.terminal, true)
    assert.equal(routed?.nextModule, null)
    const doneEvt = events2.find((e) => e.type === 'module-done') as any
    assert.equal(doneEvt?.status, 'aborted')
    assert.equal(doneEvt?.reason, 'routing:terminal')
  })

  // research run in the same process is untouched by routing logic
  check('a research run file never produces module-routed (no manifest routing)', () => {
    const ANALYSES = path.join(REPO_ROOT, 'analyses')
    const rrRoot = 'analyses/ZZSWARM_2099-01-01'
    const rr = createRun({
      kind: 'module',
      ticker: 'ZZSWARM',
      model: 'sonnet',
      prompt: '',
      user: 'test',
      userVia: 'local',
      runRoot: rrRoot,
      willCommitToMain: true,
      writeTargetsAbs: [],
      coveredModules: ['valuation'],
      readDepsAbs: [],
      closeWatcher: undefined,
      expected: new Map([
        ['valuation/99_valuation-synthesis', { key: 'valuation/99_valuation-synthesis', module: 'valuation', name: 'valuation-synthesis', layer: 5, outputRel: 'valuation/99_valuation-synthesis.md' }],
      ]),
    })
    rr.status = 'running'
    const ev3: SseEvent[] = []
    rr.subscribers.add({ id: 't3', send: (e) => ev3.push(e) })
    const f = path.join(ANALYSES, 'ZZSWARM_2099-01-01', 'valuation', '99_valuation-synthesis.md')
    fs.mkdirSync(path.dirname(f), { recursive: true })
    fs.writeFileSync(f, '# Valuation Synthesis — test\n\nVerdict: mixed — long enough body for the byte floor.\n\nRouting: this literal should not matter for research runs.\n')
    try {
      handleFile(rr, f)
      assert.equal(rr.agents.get('valuation/99_valuation-synthesis')?.status, 'done')
      assert.ok(!ev3.find((e) => e.type === 'module-routed'), 'research run emitted module-routed')
      assert.equal(rr.subjectId, 'ZZSWARM') // RunSubject default: research subject == ticker
      assert.equal(rr.swarmId, 'research')
    } finally {
      finishRun(rr, 'done') // release it so the admission checks below see only the SIG runs live
      fs.rmSync(path.join(ANALYSES, 'ZZSWARM_2099-01-01'), { recursive: true, force: true })
    }
  })

  // ---- admission: subjects are independent; signal runs are exclusive per subject ----
  check('admission: a live research run does not block a screener signal (different subjects)', () => {
    const d = admitRun({ ticker: SIG, kind: 'signal', swarmId: 'screener', coveredModules: buildSwarmGraph('screener').modules.map((m) => m.name), writeTargetsAbs: [], readDepsAbs: [] })
    // run/run2 above are live on SIG — exclusivity must reject a second signal on the SAME subject
    assert.equal(d.ok, false)
    if (!d.ok) assert.equal(d.code, 'exclusivity')
    const other = admitRun({ ticker: 'SIG-20991231-0000beef', kind: 'signal', swarmId: 'screener', coveredModules: [], writeTargetsAbs: [], readDepsAbs: [] })
    assert.equal(other.ok, true)
  })
} finally {
  fs.rmSync(sigDir, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed`)
