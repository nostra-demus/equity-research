// Incremental rerun (frameworks/INCREMENTAL_RERUN.md) — server-side contract tests.
// Run: npx tsx test/incremental-rerun.test.ts
//
// Covers the four seams the incremental rerun added:
//   1. mergedDownstreamCascade — multi-orb union: targets first, syntheses once in topo order,
//      master once, empty on any invalid entry (under-declaring admission's write set is worse
//      than failing the launch).
//   2. buildPrompt — the multi-orb pairs form of /research:rerun.
//   3. estimate — the honest incremental band (floor = entry wave + first synthesis; ceiling =
//      the whole cascade), never inverted.
//   4. applyRerunManifest + markDone/sweep guards — a pruned node becomes a terminal 'skipped'
//      orb, is never demoted from real state, and the end-of-run sweep can never launder the
//      prior run's on-disk file into a fresh 'done' for it.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR } from '../src/config'
import { applyRerunManifest, handleFile, sweepRunOutputs } from '../src/fs-watcher'
import { buildPrompt, estimate } from '../src/launcher'
import { createRun, finishRun, type RunState } from '../src/registry'
import { downstreamCascade, mergedDownstreamCascade } from '../src/roster'

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

// ---- 1. mergedDownstreamCascade ----

check('single entry delegates to downstreamCascade exactly', () => {
  const a = mergedDownstreamCascade([{ module: 'business-model', agent: 'external-dependency' }])
  const b = downstreamCascade('business-model', 'external-dependency')
  assert.deepEqual(a, b)
})

check('two entries: targets first (entry order), shared syntheses once in topo order, master once', () => {
  const merged = mergedDownstreamCascade([
    { module: 'business-model', agent: 'external-dependency' },
    { module: 'earnings', agent: 'revenue-drivers' },
  ])
  const keys = merged.map((c) => c.key)
  // both targets lead, in entry order
  assert.equal(merged[0].kind, 'agent')
  assert.equal(merged[0].module, 'business-model')
  assert.equal(merged[1].kind, 'agent')
  assert.equal(merged[1].module, 'earnings')
  // every key unique (the earnings 99 appears once despite being in both cascades)
  assert.equal(new Set(keys).size, keys.length)
  // exactly one master, and it is last
  assert.equal(merged.filter((c) => c.kind === 'master').length, 1)
  assert.equal(merged[merged.length - 1].kind, 'master')
  // the merged cascade is a superset union: every node of each single cascade is present
  for (const e of [downstreamCascade('business-model', 'external-dependency'), downstreamCascade('earnings', 'revenue-drivers')]) {
    for (const node of e) assert.ok(keys.includes(node.key), `missing ${node.key}`)
  }
  // syntheses appear in graph topo order: business-model's 99 before earnings' 99
  const bm99 = keys.findIndex((k) => /^business-model\/99_/.test(k))
  const earn99 = keys.findIndex((k) => /^earnings\/99_/.test(k))
  assert.ok(bm99 >= 0 && earn99 >= 0 && bm99 < earn99, `expected bm 99 before earnings 99 in ${keys.join(', ')}`)
})

check('an entry that IS a 99 synthesis is not duplicated in the synthesis list', () => {
  const merged = mergedDownstreamCascade([
    { module: 'earnings', agent: 'earnings-synthesis' },
    { module: 'business-model', agent: 'external-dependency' },
  ])
  const keys = merged.map((c) => c.key)
  assert.equal(new Set(keys).size, keys.length)
  assert.equal(keys.filter((k) => /^earnings\/99_/.test(k)).length, 1)
})

check('any invalid entry empties the whole merged cascade (fail the launch, never under-declare)', () => {
  assert.deepEqual(mergedDownstreamCascade([
    { module: 'business-model', agent: 'external-dependency' },
    { module: 'business-model', agent: 'no-such-agent' },
  ]), [])
})

// ---- 2. buildPrompt multi-orb form ----

check('buildPrompt: multi-orb rerun emits pairs before the ticker; single orb unchanged', () => {
  assert.equal(
    buildPrompt('research', 'rerun', 'EMAAR', 'business-model', 'external-dependency', undefined, {
      orbs: [
        { module: 'business-model', agent: 'external-dependency' },
        { module: 'earnings', agent: 'revenue-drivers' },
      ],
    }),
    '/research:rerun business-model external-dependency earnings revenue-drivers EMAAR',
  )
  assert.equal(
    buildPrompt('research', 'rerun', 'EMAAR', 'business-model', 'external-dependency'),
    '/research:rerun business-model external-dependency EMAAR',
  )
})

// ---- 3. estimate: honest incremental band ----

check('estimate(rerun): floor is entry-wave + one synthesis, ceiling is the whole cascade, never inverted', () => {
  const single = estimate('rerun', 'EMAAR', 'business-model', 'external-dependency')
  assert.equal(single.agentCount, downstreamCascade('business-model', 'external-dependency').length)
  assert.ok(single.estMinutesRange[0] <= single.estMinutesRange[1], 'minutes band must not invert')
  assert.ok(single.estCostUsdRange[0] <= single.estCostUsdRange[1], 'cost band must not invert')
  // the floor reflects early cutoff (2 orbs of wall-clock), far below the full-cascade ceiling
  assert.ok(single.estMinutesRange[0] <= 2 * 3, `floor should be ~2 orbs, got ${single.estMinutesRange[0]}`)
  assert.ok(single.estMinutesRange[1] >= single.agentCount * 3, 'ceiling should still price the full cascade')

  const batch = estimate('rerun', 'EMAAR', 'business-model', 'external-dependency', undefined, [
    { module: 'business-model', agent: 'external-dependency' },
    { module: 'earnings', agent: 'revenue-drivers' },
  ])
  assert.equal(batch.agentCount, mergedDownstreamCascade([
    { module: 'business-model', agent: 'external-dependency' },
    { module: 'earnings', agent: 'revenue-drivers' },
  ]).length)

  const master = estimate('rerun', 'EMAAR', 'master', 'synthesizer')
  assert.equal(master.agentCount, 1)
  assert.ok(master.estMinutesRange[0] <= master.estMinutesRange[1], 'master band must not invert')
})

// ---- 4. applyRerunManifest + skip guards ----

const T = 'ZZINCR'
const FOLD = `${T}_2099-03-03`
const ROOT = `analyses/${FOLD}`

function write(rel: string, body: string) {
  const p = path.join(ANALYSES_DIR, FOLD, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, body)
  return p
}

fs.rmSync(path.join(ANALYSES_DIR, FOLD), { recursive: true, force: true })
const runs: RunState[] = []
try {
  const expected = new Map(
    [
      { key: 'business-model/10_external-dependency', module: 'business-model', name: 'external-dependency', layer: 1, outputRel: 'business-model/10_external-dependency.md' },
      { key: 'business-model/99_business-model-synthesis', module: 'business-model', name: 'business-model-synthesis', layer: 4, outputRel: 'business-model/99_business-model-synthesis.md' },
      { key: 'earnings/99_earnings-synthesis', module: 'earnings', name: 'earnings-synthesis', layer: 5, outputRel: 'earnings/99_earnings-synthesis.md' },
      { key: 'master/synthesizer', module: 'master', name: 'synthesizer', layer: 99, outputRel: 'final_thesis.md' },
    ].map((e) => [e.key, e]),
  )
  const run = createRun({
    kind: 'rerun',
    ticker: T,
    model: 'sonnet',
    prompt: '',
    runRoot: ROOT,
    willCommitToMain: true,
    writeTargetsAbs: [],
    coveredModules: [],
    readDepsAbs: [],
    expected,
  })
  run.status = 'running'
  runs.push(run)

  // the prior run's (stale but valid) outputs already sit on disk
  const earnFile = write('earnings/99_earnings-synthesis.md', '# Earnings Module — stale prior output\n\n- **Verdict:** Mixed — well over forty bytes of body.\n')
  write('final_thesis.md', '# Final Thesis — stale prior output with plenty of bytes in the body for the size check.\n')

  // the engine marks earnings + master pruned mid-run
  const manifest = write('reruns/2099-03-03_rerun_manifest.json', JSON.stringify({
    schema: 'rerun_manifest/v1',
    ticker: T,
    nodes: [
      { key: 'business-model/10_external-dependency', role: 'target', status: 'done', surface_changed: true },
      { key: 'business-model/99_business-model-synthesis', role: 'synthesis', status: 'done', surface_changed: false },
      { key: 'earnings/99_earnings-synthesis', role: 'synthesis', status: 'pruned', pruned_because: 'all in-cascade dependencies resolved CLEAN' },
      { key: 'master/synthesizer', role: 'master', status: 'pruned', pruned_because: 'no module resolved DIRTY' },
      { key: 'not/expected-here', role: 'synthesis', status: 'pruned', pruned_because: 'must be ignored' },
    ],
  }))

  handleFile(run, manifest) // the watcher path: reruns/*_rerun_manifest*.json routes to applyRerunManifest

  check('pruned nodes in the expected set become terminal skipped orbs with the reason', () => {
    assert.equal(run.agents.get('earnings/99_earnings-synthesis')?.status, 'skipped')
    assert.equal(run.agents.get('master/synthesizer')?.status, 'skipped')
    const ev = run.eventLog.filter((e) => e.type === 'agent-skipped')
    assert.equal(ev.length, 2)
    assert.match((ev[0] as any).reason, /CLEAN/)
  })

  check('nodes outside the expected set are ignored; non-pruned manifest rows change nothing', () => {
    assert.equal(run.agents.has('not/expected-here'), false)
    // 'done' rows in the manifest never mark work done — that stays owned by file events
    assert.equal(run.agents.get('business-model/10_external-dependency'), undefined)
  })

  check('re-applying the manifest is idempotent (no duplicate skip events)', () => {
    applyRerunManifest(run, manifest)
    assert.equal(run.eventLog.filter((e) => e.type === 'agent-skipped').length, 2)
  })

  check('the sweep cannot launder a pruned orb\'s stale on-disk file into a fresh done', () => {
    sweepRunOutputs(run)
    assert.equal(run.agents.get('earnings/99_earnings-synthesis')?.status, 'skipped')
    assert.equal(run.agents.get('master/synthesizer')?.status, 'skipped')
    // and a direct (late) file event is equally guarded
    handleFile(run, earnFile)
    assert.equal(run.agents.get('earnings/99_earnings-synthesis')?.status, 'skipped')
  })

  check('a manifest can never demote real state (running/done stay as they are)', () => {
    run.agents.set('business-model/99_business-model-synthesis', { key: 'business-model/99_business-model-synthesis', module: 'business-model', name: 'business-model-synthesis', layer: 4, status: 'running' })
    const demote = write('reruns/2099-03-03_rerun_manifest_v2.json', JSON.stringify({
      schema: 'rerun_manifest/v1',
      nodes: [{ key: 'business-model/99_business-model-synthesis', status: 'pruned', pruned_because: 'must not demote' }],
    }))
    applyRerunManifest(run, demote)
    assert.equal(run.agents.get('business-model/99_business-model-synthesis')?.status, 'running')
  })

  check('the sweep ignores a PRIOR rerun\'s stale manifest (mtime before this attempt)', () => {
    // a fresh run over the same folder: the old committed manifest must not skip its orbs
    const run2 = createRun({
      kind: 'rerun', ticker: T, model: 'sonnet', prompt: '', runRoot: ROOT, willCommitToMain: true,
      writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      expected: new Map([['earnings/99_earnings-synthesis', { key: 'earnings/99_earnings-synthesis', module: 'earnings', name: 'earnings-synthesis', layer: 5, outputRel: 'earnings/99_earnings-synthesis.md' }]]),
    })
    run2.status = 'running'
    runs.push(run2)
    const old = new Date(run2.startedAt - 60_000)
    fs.utimesSync(manifest, old, old) // the manifest predates this attempt
    fs.rmSync(path.join(ANALYSES_DIR, FOLD, 'earnings'), { recursive: true, force: true }) // no fresh output either
    sweepRunOutputs(run2)
    assert.notEqual(run2.agents.get('earnings/99_earnings-synthesis')?.status, 'skipped')
  })

  check('a malformed or wrong-schema manifest is ignored', () => {
    const bad = write('reruns/2099-03-03_rerun_manifest_v3.json', '{ definitely not json')
    applyRerunManifest(run, bad)
    const wrong = write('reruns/2099-03-03_rerun_manifest_v4.json', JSON.stringify({ schema: 'other/v9', nodes: [{ key: 'earnings/99_earnings-synthesis', status: 'pruned' }] }))
    applyRerunManifest(run, wrong)
    assert.equal(run.eventLog.filter((e) => e.type === 'agent-skipped').length, 2)
  })
} finally {
  for (const r of runs) void finishRun(r, 'done')
  fs.rmSync(path.join(ANALYSES_DIR, FOLD), { recursive: true, force: true })
}

console.log(`\n${passed} checks passed`)
