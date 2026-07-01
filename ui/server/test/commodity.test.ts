// Commodity swarm (CLAUDE.md §26 "Swarms"): a NEW constellation swarm discovered zero-touch from
// .claude/agents/commodity/SWARM.md, its reused full/module/agent launch kinds, and closed-book chat
// grounded on its run folder. Run: npx tsx test/commodity.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { createRun, finishRun, setActiveSubjectRun, type RunState } from '../src/registry'
import { handleFile } from '../src/fs-watcher'
import { estimate } from '../src/launcher'
import { agentNameIndexAllSwarms, buildSwarmGraph, graphForSubject, swarmSubjects } from '../src/roster'
import { listSwarms, swarmById } from '../src/swarms'
import { assembleContext, scopeAvailability } from '../src/chat-context'
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
check('commodity swarm is discovered from its SWARM.md manifest with an Action routing contract', () => {
  const c = swarmById('commodity')
  assert.ok(c, 'commodity manifest missing')
  assert.equal(c!.unit, 'commodity')
  assert.equal(c!.layout, 'constellation') // shares the research constellation UI (not the screener flow)
  assert.equal(c!.commandNs, 'commodity')
  assert.equal(c!.runRootTemplate, 'commodity/runs/{COMMODITY}')
  assert.equal(c!.placeholder, 'COMMODITY')
  assert.ok(c!.routing && c!.routing.verdictField === 'Action')
  for (const v of ['Buy', 'Hold', 'Trim', 'Avoid', 'Research More']) assert.ok(c!.routing!.terminal.includes(v), `terminal missing ${v}`)
  // research stays byte-stable (no swarm descriptor) and lists FIRST
  assert.equal(listSwarms()[0].id, 'research')
})

check('commodity modules topo-sort by depends_on; commodity-thesis is terminal with no master synth', () => {
  const g = buildSwarmGraph('commodity')
  assert.deepEqual(
    g.modules.map((m) => m.name),
    ['macro-positioning', 'market-structure', 'supply-demand', 'commodity-thesis'],
  )
  assert.equal(g.swarm?.id, 'commodity')
  assert.equal(g.masterSynthesizer.name, '') // constellation swarms have no master synthesizer
  const thesis = g.modules.find((m) => m.name === 'commodity-thesis')!
  assert.deepEqual([...thesis.dependsOn].sort(), ['macro-positioning', 'market-structure', 'supply-demand'])
  assert.equal(g.totals.modules, 4)
  assert.equal(g.totals.synthesis, 4)
})

check('commodity agent names are commodity-* prefixed and globally unique (no collision across swarms)', () => {
  const idx = agentNameIndexAllSwarms()
  const g = buildSwarmGraph('commodity')
  const names = g.modules.flatMap((m) => Object.values(m.layers).flat().map((a) => a.name))
  assert.equal(names.length, 13)
  for (const n of names) {
    assert.ok(n.startsWith('commodity-'), `${n} is not commodity-prefixed`)
    assert.equal(idx.get(n)?.swarmId, 'commodity', `${n} did not resolve to the commodity swarm (name collision?)`)
  }
})

check('requiredUpstream is run-root-relative (no commodity/ or analyses/ hardcode)', () => {
  const g = buildSwarmGraph('commodity')
  const thesis = g.modules.find((m) => m.name === 'commodity-thesis')!
  const synth = Object.values(thesis.layers).flat().find((a) => a.name === 'commodity-thesis-synthesis')!
  assert.ok(synth.requiredUpstream.includes('market-structure/99_market-structure-synthesis.md'))
  assert.ok(synth.requiredUpstream.includes('commodity-thesis/01_commodity-catalysts.md'))
  assert.ok(synth.requiredUpstream.every((p) => !p.startsWith('commodity/') && !p.startsWith('analyses/')))
})

// ---- per-subject graph over the committed GOLD fixture ----
check('graphForSubject resolves the GOLD fixture: deps complete + terminal synthesis runnable', () => {
  const g = graphForSubject('commodity', 'GOLD')
  const thesis = g.modules.find((m) => m.name === 'commodity-thesis')!
  assert.equal(thesis.depsComplete, true) // the three module syntheses exist in the fixture
  const synth = Object.values(thesis.layers).flat().find((a) => a.name === 'commodity-thesis-synthesis')!
  assert.equal(synth.soloRunnable, true) // all requiredUpstream present in the fixture
})

// ---- subject picker source ----
check('swarmSubjects lists GOLD from the run folder AND SUGAR from the declared subjects_source', () => {
  const subs = swarmSubjects('commodity')
  assert.ok(subs.includes('GOLD'), 'GOLD (fixture run folder) missing')
  assert.ok(subs.includes('SUGAR'), 'SUGAR (profiles heading) missing')
  assert.deepEqual(swarmSubjects('research'), []) // research uses /api/tickers, not this
})

// ---- launch preflight is swarm-scoped (reused full kind routed by swarm) ----
check('estimate(full, GOLD, swarm=commodity) is scoped to the commodity swarm', () => {
  const p = estimate('full', 'GOLD', undefined, undefined, 'commodity')
  assert.equal(p.swarm, 'commodity')
  assert.ok(p.agentCount >= 13)
  assert.equal(p.requiresTypedConfirm, true)
})

// ---- closed-book chat grounds on the commodity run folder (tests 4 & 5 rely on this) ----
check('chat scopes + run-scope context assemble over the GOLD commodity dossier', () => {
  const avail = scopeAvailability('GOLD', 'commodity/runs/GOLD', 'commodity')
  assert.equal(avail.run.present, true)
  assert.ok(avail.modules.find((m) => m.module === 'commodity-thesis')?.present, 'commodity-thesis synthesis not present')

  const ctx = assembleContext({ scope: 'run', runRoot: 'commodity/runs/GOLD', swarmId: 'commodity' })
  assert.equal(ctx.present, true)
  // the action verdict + the reasoning must be in-context so a grounded answer can cite them
  assert.ok(/Action:\s*Hold/.test(ctx.context), 'action verdict missing from run context')
  assert.ok(/decision_record\.json/.test(ctx.context), 'decision record not folded into run context')
  assert.ok(/crowded/i.test(ctx.context), 'positioning reasoning (why not add) missing from context')
})

// ---- fs-watcher emits the Action routing verdict as a terminal module-routed event ----
const ZZ = 'ZZCMDY'
const ZZ_ROOT = `commodity/runs/${ZZ}`
const zzDir = path.join(REPO_ROOT, ZZ_ROOT)
fs.rmSync(zzDir, { recursive: true, force: true })
try {
  const run: RunState = createRun({
    kind: 'full',
    ticker: ZZ,
    subjectId: ZZ,
    swarmId: 'commodity',
    unit: 'commodity',
    model: 'sonnet',
    prompt: '',
    user: 'test',
    userVia: 'local',
    runRoot: ZZ_ROOT,
    willCommitToMain: true,
    writeTargetsAbs: [],
    coveredModules: ['commodity-thesis'],
    readDepsAbs: [],
    closeWatcher: undefined,
    expected: new Map([[
      'commodity-thesis/99_commodity-thesis-synthesis',
      { key: 'commodity-thesis/99_commodity-thesis-synthesis', module: 'commodity-thesis', name: 'commodity-thesis-synthesis', layer: 5, outputRel: 'commodity-thesis/99_commodity-thesis-synthesis.md' },
    ]]),
  })
  run.status = 'running'
  setActiveSubjectRun(run.runId, run.subjectId)
  const events: SseEvent[] = []
  run.subscribers.add({ id: 't', send: (e) => events.push(e) })

  const synthPath = path.join(zzDir, 'commodity-thesis', '99_commodity-thesis-synthesis.md')
  fs.mkdirSync(path.dirname(synthPath), { recursive: true })
  fs.writeFileSync(
    synthPath,
    '# COMMODITY Dossier — test\n\nEnough body bytes to clear the placeholder floor for this fixture synthesis.\n\n## Routing\n\nAction: Hold\nThesis type: Commodity-conditional\n',
  )
  handleFile(run, synthPath)

  check('a commodity synthesis emits module-routed{route:Hold, terminal:true} + marks the orb done', () => {
    assert.equal(run.agents.get('commodity-thesis/99_commodity-thesis-synthesis')?.status, 'done')
    const routed = events.find((e) => e.type === 'module-routed') as any
    assert.ok(routed, 'no module-routed event')
    assert.equal(routed.route, 'Hold')
    assert.equal(routed.terminal, true)
  })
  finishRun(run, 'done')
} finally {
  fs.rmSync(zzDir, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed`)
