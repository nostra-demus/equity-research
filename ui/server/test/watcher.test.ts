// fs-watcher binding under interleaved concurrent writes. Run: npx tsx test/watcher.test.ts
// Reproduces the original first-write-wins hazard: an agent run pinned to the LATEST EXISTING folder
// must NOT latch onto a different dated folder just because a write appears there first.
// keep the perpetual cockpit audit log free of fixture runs (read dynamically in activity-log append)
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR } from '../src/config'
import { createRun, finishRun, type RunState } from '../src/registry'
import { handleFile } from '../src/fs-watcher'

const T = 'ZZWATCH'
const FOLD = `${T}_2099-01-01` // "latest existing" folder the agent run is pinned to
const FNEW = `${T}_2099-02-02` // a newer dated folder a concurrent module run writes into

function mkRun(kind: 'agent' | 'module', runRoot: string, expected: { key: string; module: string; name: string; layer: number }[]): RunState {
  const r = createRun({
    kind,
    ticker: T,
    model: 'sonnet',
    prompt: '',
    runRoot,
    willCommitToMain: kind !== 'agent',
    writeTargetsAbs: [],
    coveredModules: [],
    readDepsAbs: [],
    expected: new Map(expected.map((e) => [e.key, { ...e, outputRel: `${e.module}/${e.key.split('/')[1]}.md` }])),
  })
  r.status = 'running'
  return r
}
function write(folder: string, rel: string) {
  const p = path.join(ANALYSES_DIR, folder, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, '# fixture output\n\nVerdict: a test row with well over forty bytes of body content.\n')
  return p
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

fs.rmSync(path.join(ANALYSES_DIR, FOLD), { recursive: true, force: true })
fs.rmSync(path.join(ANALYSES_DIR, FNEW), { recursive: true, force: true })

const runs: RunState[] = []
try {
  const A = mkRun('agent', `analyses/${FOLD}`, [{ key: 'business-model/03_segment-map', module: 'business-model', name: 'segment-map', layer: 1 }])
  const B = mkRun('module', `analyses/${FNEW}`, [{ key: 'valuation/01_price-and-capital-structure', module: 'valuation', name: 'price-and-capital-structure', layer: 1 }])
  runs.push(A, B)

  // a write lands in B's folder FIRST — the agent run A must not adopt it
  const bFile = write(FNEW, 'valuation/01_price-and-capital-structure.md')
  handleFile(A, bFile)
  handleFile(B, bFile)

  check('agent run A did NOT latch onto the newer folder (runRoot pinned, not first-write-wins)', () => {
    assert.equal(A.runRoot, `analyses/${FOLD}`)
    assert.equal(A.agents.size, 0)
  })
  check('module run B marked its own file in its own folder', () => {
    assert.equal(B.agents.get('valuation/01_price-and-capital-structure')?.status, 'done')
  })

  // then a write lands in A's pinned folder
  const aFile = write(FOLD, 'business-model/03_segment-map.md')
  handleFile(B, aFile)
  handleFile(A, aFile)

  check('agent run A marked its own file in its pinned folder', () => {
    assert.equal(A.agents.get('business-model/03_segment-map')?.status, 'done')
  })
  check('module run B ignored the other run’s folder', () => {
    assert.equal(B.agents.has('business-model/03_segment-map'), false)
    assert.equal(B.runRoot, `analyses/${FNEW}`)
  })
} finally {
  for (const r of runs) finishRun(r, 'done')
  fs.rmSync(path.join(ANALYSES_DIR, FOLD), { recursive: true, force: true })
  fs.rmSync(path.join(ANALYSES_DIR, FNEW), { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
