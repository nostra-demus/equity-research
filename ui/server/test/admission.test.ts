// Admission-control matrix. Run: npx tsx test/admission.test.ts
// Drives admitRun() against on-disk fixture trees + seeded in-flight runs. No real claude spawns.
// keep the perpetual cockpit audit log free of fixture runs (read dynamically in activity-log append)
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { admitRun, admissionMessage, type AdmissionRequest } from '../src/admission'
import { ANALYSES_DIR, MAX_CONCURRENT_RUNS, REPO_ROOT } from '../src/config'
import { createRun, finishRun, setActiveTickerRun, type RunState } from '../src/registry'
import type { RunKind } from '../src/types'

const DATE = '2099-01-01'
const T = 'ZZADMIT'
const root = (ticker: string) => `analyses/${ticker}_${DATE}`
const abs = (ticker: string, rel: string) => path.join(REPO_ROOT, root(ticker), rel)

const tracked: RunState[] = []
// Seed a running, registered in-flight run (no real child process).
function inflight(
  kind: RunKind,
  ticker: string,
  coveredModules: string[],
  writeTargetsAbs: string[],
  readDepsAbs: string[] = [],
): RunState {
  const run = createRun({ kind, ticker, model: 'sonnet', prompt: '', runRoot: root(ticker), willCommitToMain: kind !== 'agent', writeTargetsAbs, coveredModules, readDepsAbs })
  run.status = 'running'
  setActiveTickerRun(run.runId, ticker)
  tracked.push(run)
  return run
}
function clearAll() {
  for (const r of tracked.splice(0)) finishRun(r, 'done')
}

function writeFixture(rel: string, body = '# fixture\n') {
  const p = path.join(ANALYSES_DIR, `${T}_${DATE}`, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, body)
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

// ---- fixtures: valuation's full declared upstream set, complete for ${T} ----
// valuation declares management-governance (the RF-OWN-004 / §24 Filter-6 ownership read) and
// balance-sheet-survival (its filing-based debt note is the canonical net-debt source for the EV
// bridge, CLAUDE.md §15), so its on-disk deps include both; without either, D4 would (correctly)
// reject a valuation run.
fs.rmSync(path.join(ANALYSES_DIR, `${T}_${DATE}`), { recursive: true, force: true })
writeFixture('business-model/99_business-model-synthesis.md')
writeFixture('earnings/99_earnings-synthesis.md')
writeFixture('balance-sheet-survival/99_balance-sheet-survival-synthesis.md')
writeFixture('management-governance/99_management-governance-synthesis.md')
writeFixture('business-model/01_business-identity.md') // a read-dep target for D4b

try {
  // D4 admit: valuation with bm+earnings+balance-sheet-survival+management-governance present, nothing in flight
  check('D4 admit valuation (deps on disk)', () => {
    const d = admitRun(req('module', { coveredModules: ['valuation'] }))
    assert.equal(d.ok, true)
  })

  check('D4 admits a declared fail-fast Insufficient upstream outcome', () => {
    const synthesis = abs(T, 'balance-sheet-survival/99_balance-sheet-survival-synthesis.md')
    fs.rmSync(synthesis)
    const triage = writeFixture(
      'balance-sheet-survival/00_solvency-data-triage.md',
      '# Solvency data triage\n\nVerdict: Insufficient\n',
    )
    try {
      const d = admitRun(req('module', { coveredModules: ['valuation'] }))
      assert.equal(d.ok, true)
    } finally {
      fs.rmSync(triage)
      writeFixture('balance-sheet-survival/99_balance-sheet-survival-synthesis.md')
    }
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

  // D2 reject: identical absolute target — carries the human-meaningful conflicting module
  check('D2 reject identical write target', () => {
    clearAll()
    inflight('agent', T, ['valuation'], [abs(T, 'valuation/09_same.md')])
    const d = admitRun(req('agent', { coveredModules: ['valuation'], writeTargetsAbs: [abs(T, 'valuation/09_same.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'target_conflict')
    assert.deepEqual((d as any).conflictModules, ['valuation'])
  })

  // D2 reject: module-vs-module same module conflicts on the whole file set — conflictModules names it
  check('D2 module-vs-module carries conflictModules', () => {
    clearAll()
    const files = ['00_a.md', '01_b.md', '99_syn.md'].map((f) => abs(T, `business-model/${f}`))
    inflight('module', T, ['business-model'], files)
    const d = admitRun(req('module', { coveredModules: ['business-model'], writeTargetsAbs: files }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'target_conflict')
    assert.deepEqual((d as any).conflictModules, ['business-model'])
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

  // Exact one-module resumes claim optional cross-module folders as directory reads. Balance-sheet and
  // governance are siblings in the hard DAG, so D3 cannot protect this read; D4b must hold it immutable
  // in BOTH launch orders for the full lifetime of the paid governance child.
  check('D4b reject exact module reader while optional-input writer is live', () => {
    clearAll()
    const bssDir = abs(T, 'balance-sheet-survival')
    inflight('module', T, ['balance-sheet-survival'], [abs(T, 'balance-sheet-survival/05_x.md')])
    const d = admitRun(req('module', {
      coveredModules: ['management-governance'],
      writeTargetsAbs: [abs(T, 'management-governance/10_x.md')],
      readDepsAbs: [bssDir],
    }))
    assert.equal(d.ok, false)
    assert.equal((d as any).reason, 'upstream-file-in-flight')
  })

  check('D4b reject optional-input writer while exact module reader is live', () => {
    clearAll()
    const bssDir = abs(T, 'balance-sheet-survival')
    inflight(
      'module', T, ['management-governance'], [abs(T, 'management-governance/10_x.md')], [bssDir],
    )
    const d = admitRun(req('module', {
      coveredModules: ['balance-sheet-survival'],
      writeTargetsAbs: [abs(T, 'balance-sheet-survival/05_x.md')],
    }))
    assert.equal(d.ok, false)
    assert.equal((d as any).reason, 'upstream-file-in-flight')
  })

  // admit: siblings valuation + competitive-intel (deps complete, neither is an ancestor of the other).
  // competitive-intel is the sibling here because balance-sheet-survival no longer is: valuation declares
  // it as an upstream, so the pair below is an ancestry conflict, not a sibling pair.
  check('admit siblings valuation + competitive-intel', () => {
    clearAll()
    inflight('module', T, ['valuation'], [abs(T, 'valuation/00_x.md')])
    const d = admitRun(req('module', { coveredModules: ['competitive-intel'], writeTargetsAbs: [abs(T, 'competitive-intel/00_x.md')] }))
    assert.equal(d.ok, true)
  })

  // D3 reject: balance-sheet-survival while valuation in flight — bss is now valuation's ancestor, so
  // rewriting its debt note under a running valuation is exactly the read-under-write this bars.
  check('D3 reject balance-sheet-survival while valuation in flight', () => {
    clearAll()
    inflight('module', T, ['valuation'], [abs(T, 'valuation/00_x.md')])
    const d = admitRun(req('module', { coveredModules: ['balance-sheet-survival'], writeTargetsAbs: [abs(T, 'balance-sheet-survival/00_x.md')] }))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'dependency_conflict')
    assert.equal((d as any).reason, 'module-ancestry')
  })

  // D5 capacity: seed MAX runs on distinct tickers, next is rejected
  check('D5 capacity cap', () => {
    clearAll()
    for (let i = 0; i < MAX_CONCURRENT_RUNS; i++) inflight('module', `ZZCAP${i}`, ['business-model'], [path.join(REPO_ROOT, `analyses/ZZCAP${i}_${DATE}/business-model/00.md`)])
    const d = admitRun(req('module', { coveredModules: ['business-model'], writeTargetsAbs: [abs('ZZOTHER', 'business-model/00.md')], ticker: 'ZZOTHER' } as any))
    assert.equal(d.ok, false)
    assert.equal((d as any).code, 'capacity')
  })

  // ---- message compactness: a conflict must never dump a wall of paths into the toast (CLAUDE.md §21) ----
  // A big module conflict once produced a message listing every file; now it names the module and stays short.
  check('message: target_conflict names the module, no path dump', () => {
    const msg = admissionMessage(
      { code: 'target_conflict', httpStatus: 409, conflictRunId: 'r1', conflictTargets: Array.from({ length: 13 }, (_, i) => `analyses/${T}/business-model/${i}.md`), conflictModules: ['business-model'] },
      T,
    )
    assert.ok(msg.includes('business model module'), `expected humanized module name, got: ${msg}`)
    assert.ok(!msg.includes('.md'), `message must not dump file paths, got: ${msg}`)
    assert.ok(msg.length < 120, `message must stay compact, got ${msg.length} chars`)
  })

  // No module attributable (root-artifact / cross-module overlap) → fall back to a bare count, still short.
  check('message: target_conflict falls back to a file count', () => {
    const msg = admissionMessage(
      { code: 'target_conflict', httpStatus: 409, conflictRunId: 'r1', conflictTargets: ['a.md', 'b.md', 'c.md'], conflictModules: [] },
      T,
    )
    assert.ok(msg.includes('3 files'), `expected a count, got: ${msg}`)
    assert.ok(!msg.includes('.md'), `message must not dump file paths, got: ${msg}`)
  })

  // upstream_incomplete with many missing modules is capped ("+N more"), never a giant list.
  check('message: upstream_incomplete caps a long list', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f']
    const msg = admissionMessage({ code: 'upstream_incomplete', httpStatus: 400, missing: many }, T)
    assert.ok(msg.includes('+3 more'), `expected cap marker, got: ${msg}`)
  })
} finally {
  clearAll()
  fs.rmSync(path.join(ANALYSES_DIR, `${T}_${DATE}`), { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
