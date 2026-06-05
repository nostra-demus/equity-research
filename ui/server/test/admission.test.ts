// Admission-control matrix. Run: npx tsx test/admission.test.ts
// Drives admitRun() against on-disk fixture trees + seeded in-flight runs. No real claude spawns.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { admitRun, type AdmissionRequest } from '../src/admission'
import { ANALYSES_DIR, MAX_CONCURRENT_RUNS, REPO_ROOT } from '../src/config'
import { createRun, finishRun, setActiveTickerRun, type RunState } from '../src/registry'
import type { RunKind } from '../src/types'

const DATE = '2099-01-01'
const T = 'ZZADMIT'
const root = (ticker: string) => `analyses/${ticker}_${DATE}`
const abs = (ticker: string, rel: string) => path.join(REPO_ROOT, root(ticker), rel)

const tracked: RunState[] = []
// Seed a running, registered in-flight run (no real child process).
function inflight(kind: RunKind, ticker: string, coveredModules: string[], writeTargetsAbs: string[]): RunState {
  const run = createRun({ kind, ticker, model: 'sonnet', prompt: '', runRoot: root(ticker), willCommitToMain: kind !== 'agent', writeTargetsAbs, coveredModules, readDepsAbs: [] })
  run.status = 'running'
  setActiveTickerRun(run.runId, ticker)
  tracked.push(run)
  return run
}
function clearAll() {
  for (const r of tracked.splice(0)) finishRun(r, 'done')
}

function writeFixture(rel: string) {
  const p = path.join(ANALYSES_DIR, `${T}_${DATE}`, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, '# fixture\n')
  return p
}

function req(kind: RunKind, opts: Partial<AdmissionRequest> & { coveredModules: string[] }): AdmissionRequest {
  return { ticker: T, kind, writeTargetsAbs: [], readDepsAbs: [], ...opts }
}

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

// ---- fixtures: business-model + earnings complete for ${T} ----
fs.rmSync(path.join(ANALYSES_DIR, `${T}_${DATE}`), { recursive: true, force: true })
writeFixture('business-model/99_business-model-synthesis.md')
writeFixture('earnings/99_earnings-synthesis.md')
writeFixture('business-model/01_business-identity.md') // a read-dep target for D4b

try {
  // D4 admit: valuation with bm+earnings present, nothing in flight
  check('D4 admit valuation (deps on disk)', () => {
    const d = admitRun(req('module', { coveredModules: ['valuation'] }))
    assert.equal(d.ok, true)
  })

  // D4 reject: catalyst needs all five; bss/mgmt-gov/valuation absent
  check('D4 reject catalyst upstream_incomplete', () => {
    const d = admitRun(req('module', { coveredModules: ['catalyst'] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'upstream_incomplete')
    assert.ok((d as any).missing.includes('valuation'))
  })

  // D3 reject: earnings while business-model in flight (bm is ancestor)
  check('D3 reject earnings while business-model in flight', () => {
    clearAll()
    inflight('module', T, ['business-model'], [abs(T, 'business-model/00_x.md')])
    const d = admitRun(req('module', { coveredModules: ['earnings'], writeTargetsAbs: [abs(T, 'earnings/00_x.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'dependency_conflict')
    assert.equal((d as any).reason, 'module-ancestry')
    assert.equal((d as any).detail.relation, 'ancestor')
  })

  // D3 reject: catalyst while valuation in flight (valuation is ancestor of catalyst)
  check('D3 reject catalyst while valuation in flight', () => {
    clearAll()
    inflight('module', T, ['valuation'], [abs(T, 'valuation/00_x.md')])
    const d = admitRun(req('module', { coveredModules: ['catalyst'], writeTargetsAbs: [abs(T, 'catalyst/00_x.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'dependency_conflict')
    assert.equal((d as any).reason, 'module-ancestry')
  })

  // D2b reject: valuation orb (agent) while a valuation MODULE run is in flight — disjoint files
  check('D2b reject same-module agent vs module (disjoint files)', () => {
    clearAll()
    inflight('module', T, ['valuation'], [abs(T, 'valuation/00_a.md')])
    const d = admitRun(req('agent', { coveredModules: ['valuation'], writeTargetsAbs: [abs(T, 'valuation/09_z.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'dependency_conflict')
    assert.equal((d as any).reason, 'module-scope-writer')
  })

  // admit: two independent same-module solo agents, disjoint writes, no module run
  check('admit same-module agent-vs-agent (disjoint)', () => {
    clearAll()
    inflight('agent', T, ['valuation'], [abs(T, 'valuation/03_a.md')])
    const d = admitRun(req('agent', { coveredModules: ['valuation'], writeTargetsAbs: [abs(T, 'valuation/04_b.md')] }))
    assert.equal(d.ok, true)
  })

  // D2 reject: identical absolute target
  check('D2 reject identical write target', () => {
    clearAll()
    inflight('agent', T, ['valuation'], [abs(T, 'valuation/09_same.md')])
    const d = admitRun(req('agent', { coveredModules: ['valuation'], writeTargetsAbs: [abs(T, 'valuation/09_same.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'target_conflict')
  })

  // D1 reject: module while full in flight, and full while module in flight
  check('D1 reject module while full in flight', () => {
    clearAll()
    inflight('full', T, ['business-model', 'earnings', 'valuation'], [abs(T, 'final_thesis.md')])
    const d = admitRun(req('module', { coveredModules: ['valuation'], writeTargetsAbs: [abs(T, 'valuation/00_x.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'exclusivity')
  })
  check('D1 reject full while module in flight', () => {
    clearAll()
    inflight('module', T, ['valuation'], [abs(T, 'valuation/00_x.md')])
    const d = admitRun(req('full', { coveredModules: ['business-model', 'earnings'], writeTargetsAbs: [abs(T, 'final_thesis.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'exclusivity')
  })

  // D4b reject: agent reads a file another in-flight agent is writing (file exists on disk)
  check('D4b reject read-dep being rewritten', () => {
    clearAll()
    const readFile = abs(T, 'business-model/01_business-identity.md') // exists (fixture)
    inflight('agent', T, ['business-model'], [readFile])
    const d = admitRun({ ticker: T, kind: 'agent', coveredModules: ['business-model'], writeTargetsAbs: [abs(T, 'business-model/02_other.md')], readDepsAbs: [readFile] })
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'dependency_conflict')
    assert.equal((d as any).reason, 'upstream-file-in-flight')
  })

  // admit: siblings valuation + balance-sheet-survival (deps complete, not related)
  check('admit siblings valuation + balance-sheet-survival', () => {
    clearAll()
    inflight('module', T, ['valuation'], [abs(T, 'valuation/00_x.md')])
    const d = admitRun(req('module', { coveredModules: ['balance-sheet-survival'], writeTargetsAbs: [abs(T, 'balance-sheet-survival/00_x.md')] }))
    assert.equal(d.ok, true)
  })

  // D5 capacity: seed MAX runs on distinct tickers, next is rejected
  check('D5 capacity cap', () => {
    clearAll()
    for (let i = 0; i < MAX_CONCURRENT_RUNS; i++) inflight('module', `ZZCAP${i}`, ['business-model'], [path.join(REPO_ROOT, `analyses/ZZCAP${i}_${DATE}/business-model/00.md`)])
    const d = admitRun(req('module', { coveredModules: ['business-model'], writeTargetsAbs: [abs('ZZOTHER', 'business-model/00.md')], ticker: 'ZZOTHER' } as any))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'capacity')
  })
} finally {
  clearAll()
  fs.rmSync(path.join(ANALYSES_DIR, `${T}_${DATE}`), { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
