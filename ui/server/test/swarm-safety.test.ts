// Cross-swarm subject isolation + manifest-owned run-root safety.
// Run: npx tsx test/swarm-safety.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { admitRun } from '../src/admission'
import { REPO_ROOT } from '../src/config'
import { createRun, finishRun, inFlightRunsForSubject, setActiveSubjectRun } from '../src/registry'
import { resolveManifestRunRoot } from '../src/swarm-run-root'
import { runRootForSubject, swarmById } from '../src/swarms'
import type { RunKind, SwarmManifest } from '../src/types'

function liveRun(swarmId: string, subjectId: string, kind: RunKind = 'full') {
  const run = createRun({
    kind,
    ticker: subjectId,
    subjectId,
    swarmId,
    unit: swarmById(swarmId)?.unit ?? 'ticker',
    model: 'sonnet',
    prompt: '',
    user: 'test',
    userVia: 'local',
    runRoot: swarmId === 'research' ? `analyses/${subjectId}_2099-01-01` : `commodity/runs/${subjectId}`,
    willCommitToMain: true,
    writeTargetsAbs: [],
    coveredModules: [],
    readDepsAbs: [],
    closeWatcher: undefined,
    expected: new Map(),
  })
  run.status = 'running'
  setActiveSubjectRun(run.runId, subjectId, swarmId)
  return run
}

// A subject label is only unique inside its swarm. A live equity-research GOLD run must not hold the
// commodity GOLD lock, and vice versa.
const researchGold = liveRun('research', 'GOLD')
try {
  assert.equal(inFlightRunsForSubject('GOLD', 'research').length, 1)
  assert.equal(inFlightRunsForSubject('GOLD', 'commodity').length, 0)
  assert.equal(
    admitRun({ ticker: 'GOLD', kind: 'full', swarmId: 'commodity', coveredModules: [], writeTargetsAbs: [], readDepsAbs: [] }).ok,
    true,
    'research GOLD must not block commodity GOLD',
  )
  assert.equal(
    admitRun({ ticker: 'GOLD', kind: 'full', swarmId: 'research', coveredModules: [], writeTargetsAbs: [], readDepsAbs: [] }).ok,
    false,
    'research GOLD must still block a second research GOLD run',
  )
} finally {
  finishRun(researchGold, 'done')
}

const commodityGold = liveRun('commodity', 'GOLD')
try {
  assert.equal(inFlightRunsForSubject('GOLD', 'commodity').length, 1)
  assert.equal(inFlightRunsForSubject('GOLD', 'research').length, 0)
  assert.equal(
    admitRun({ ticker: 'GOLD', kind: 'full', swarmId: 'research', coveredModules: [], writeTargetsAbs: [], readDepsAbs: [] }).ok,
    true,
    'commodity GOLD must not block research GOLD',
  )
  assert.equal(
    admitRun({ ticker: 'GOLD', kind: 'full', swarmId: 'commodity', coveredModules: [], writeTargetsAbs: [], readDepsAbs: [] }).ok,
    false,
    'commodity GOLD must still block a second commodity GOLD run',
  )
} finally {
  finishRun(commodityGold, 'done')
}

const commodity = swarmById('commodity')
assert.ok(commodity, 'commodity manifest must be discoverable')

// The generic subject grammar is deliberately wider than an equity ticker: keep a valid 64-byte
// manifest subject working without weakening the path boundary.
const longSubject = `LONG-${'A'.repeat(59)}`
assert.equal(longSubject.length, 64)
assert.deepEqual(resolveManifestRunRoot('commodity', longSubject), {
  relative: `commodity/runs/${longSubject}`,
  absolute: path.join(REPO_ROOT, 'commodity', 'runs', longSubject),
})

assert.equal(resolveManifestRunRoot('commodity', '../GOLD'), null, 'path traversal subject must fail closed')
assert.equal(
  resolveManifestRunRoot('commodity', 'GOLD', { requestedRunRoot: 'commodity/runs/{OTHER}' }),
  null,
  'a requested root with an unresolved token must fail closed',
)

const fakeManifest = (runRootTemplate: string): SwarmManifest => ({
  ...commodity,
  runRootTemplate,
})
assert.equal(
  runRootForSubject(fakeManifest('commodity/runs/{COMMODITY}/../escape'), 'GOLD'),
  null,
  'a manifest template that traverses after substitution must fail closed',
)
assert.equal(
  runRootForSubject(fakeManifest('commodity/runs/{COMMODITY}/{DATE}'), 'GOLD'),
  null,
  'a manifest template with a second unresolved token must fail closed',
)
assert.equal(
  runRootForSubject({ ...commodity, runsRoot: '../outside', runRootTemplate: '../outside/{COMMODITY}' }, 'GOLD'),
  null,
  'a manifest whose declared runs_root itself escapes the repo must fail closed',
)

// Even a shape-valid subject is rejected when an existing component is a symlink. This prevents a
// manifest-owned run root from escaping its declared store through filesystem indirection.
const symlinkSubject = 'ZZ-SYMLINK-ESCAPE-20990101'
const symlinkPath = path.join(REPO_ROOT, 'commodity', 'runs', symlinkSubject)
const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'swarm-root-outside-'))
assert.equal(fs.existsSync(symlinkPath), false, `fixture path already exists: ${symlinkPath}`)
try {
  fs.symlinkSync(outside, symlinkPath, 'dir')
  assert.equal(resolveManifestRunRoot('commodity', symlinkSubject), null, 'symlink escape must fail closed')
} finally {
  fs.rmSync(symlinkPath, { force: true })
  fs.rmSync(outside, { recursive: true, force: true })
}

console.log('✓ swarm safety: cross-swarm locks are isolated and manifest run roots fail closed')
