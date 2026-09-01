import assert from 'node:assert/strict'
import { projectRunManifest } from './runManifestProjection'

const projected = projectRunManifest({
  runRoot: 'analyses/NU_2026-08-31',
  modules: {
    earnings: [{ agentKey: 'earnings/01_history', verdict: 'Sufficient' }],
    'balance-sheet-survival': [{ agentKey: 'balance-sheet-survival/00_solvency-data-triage', verdict: 'Insufficient data' }],
  },
  terminalOutcomes: {
    'balance-sheet-survival': { kind: 'fail-fast', agentKey: 'balance-sheet-survival/00_solvency-data-triage' },
  },
  moduleReports: { earnings: { synthesis: 'analyses/NU_2026-08-31/earnings/99_earnings-synthesis.md' } },
  memo: true,
  finalThesis: true,
  fullDossier: true,
}, {
  'earnings/01_history': { status: 'running', runId: 'lost-stream', startedAt: 10 },
  'valuation/01_dcf': { status: 'running', runId: 'newer-live-run', startedAt: 20 },
})

assert.deepEqual(projected.nodeRuntime['earnings/01_history'], {
  status: 'done', runId: 'lost-stream', startedAt: 10,
  verdict: 'Sufficient', outputPath: 'analyses/NU_2026-08-31/earnings/01_history.md', terminalValidated: false,
}, 'a durable artifact repairs a missed terminal event without losing timing')
assert.equal(projected.nodeRuntime['balance-sheet-survival/00_solvency-data-triage'].status, 'done')
assert.equal(projected.nodeRuntime['balance-sheet-survival/00_solvency-data-triage'].terminalValidated, true)
assert.equal(projected.nodeRuntime['valuation/01_dcf'].status, 'running', 'manifest reconciliation preserves unrelated live work')
assert.equal(projected.nodeRuntime['master/synthesizer'].status, 'done')
assert.deepEqual(projected.reports, { memo: true, thesis: true, dossier: true })

const rootless = projectRunManifest({ modules: { earnings: [{ agentKey: 'earnings/01_history', verdict: 'Sufficient' }] } })
assert.deepEqual(rootless.nodeRuntime, {}, 'a malformed/rootless response cannot invent output paths')

const concurrent = projectRunManifest({
  runRoot: 'analyses/NU_2026-08-31',
  modules: { earnings: [{ agentKey: 'earnings/01_history', verdict: 'Sufficient' }] },
}, { 'earnings/01_history': { status: 'running', runId: 'new-run' } }, 'lost-run')
assert.deepEqual(concurrent.nodeRuntime['earnings/01_history'], { status: 'running', runId: 'new-run' },
  'a late manifest read cannot paint over a newer live owner of the same orb')
assert.equal('runRoot' in concurrent, false, 'a late manifest read cannot replace a newer live run\'s metadata')
assert.equal('reports' in concurrent, false, 'a late manifest read cannot replace a newer live run\'s reports')

console.log('runManifestProjection.test.ts: durable artifact projection passed')
