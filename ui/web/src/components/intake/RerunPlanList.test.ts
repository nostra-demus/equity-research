import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { IntakePlan } from '../../lib/types'
import { RerunPlanList } from './RerunPlanList'

const blocked: IntakePlan = {
  schema_version: '1.1', swarm: 'research', subject: 'TEST', ticker: 'TEST',
  run_root: 'analyses/TEST_2026-08-14', decision_fingerprint: `sha256:${'a'.repeat(64)}`,
  plan_path: 'analyses/TEST_2026-08-14/intake/2026-08-14_intake_plan.json',
  plan_sha256: `sha256:${'b'.repeat(64)}`, actionable: false,
  scan_date: '2026-08-14', new_docs: [{
    path: 'data/TEST/new.pdf', claims_summary: 'new evidence', materiality_score: 80,
    impact_direction: 'negative', entry_orbs: [],
  }],
  rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
  verdict: 'insufficient', summary: 'identity stale', analyzed_at: '2026-08-14T10:00:00.000Z',
  widened: ['the intake plan bytes are not committed proof'], pool_current: false, consumed: false,
}

const html = renderToStaticMarkup(createElement(RerunPlanList, {
  plan: blocked,
  keysFor: () => new Set<string>(),
  nodesByKey: new Map(),
  onRowEnter: () => {}, onLeave: () => {}, onRun: () => {},
  onPrepareScoped: async () => false, onRunScoped: () => {}, onRunOrb: () => {},
  batchSupported: true, scopedPending: false, running: false,
}))

assert.match(html, /can’t safely authorize a re-run/)
assert.match(html, /Re-analyze the documents/)
assert.doesNotMatch(html, /Re-run anyway|Re-run scoped|Review rerun/)
assert.doesNotMatch(html, /none change an orb’s inputs/)

console.log('RerunPlanList: identity-blocked plans are honest and expose no paid action')
