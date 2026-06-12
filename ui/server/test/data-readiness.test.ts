// Self-describing data-readiness. Run: npx tsx test/data-readiness.test.ts
// Proves a module can declare its readiness rule in its own 00-triage frontmatter (zero edits to the
// readiness engine) and that the interpreter behaves correctly.
import assert from 'node:assert/strict'
import { evalDecl } from '../src/data-status'
import { moduleReadinessIssues } from '../src/readiness'
import { moduleReadinessDecls } from '../src/roster'
import type { FileType, ModuleReadiness } from '../src/types'

const hasOf = (present: FileType[]) => (t: FileType) => present.includes(t)

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

check('evalDecl: missing a required type -> Insufficient', () => {
  const r = evalDecl({ required: ['financials'], sufficient: ['financials'] }, hasOf([]))
  assert.equal(r.status, 'Insufficient')
})
check('evalDecl: all sufficient types present -> Sufficient', () => {
  const r = evalDecl({ required: ['financials'], sufficient: ['financials', 'consensus_estimates'] }, hasOf(['financials', 'consensus_estimates']))
  assert.equal(r.status, 'Sufficient')
})
check('evalDecl: some sufficient missing -> Partial + the declared cap', () => {
  const r = evalDecl({ sufficient: ['transcript', 'guidance'], caps: { guidance: 'guidance limited' } }, hasOf(['transcript']))
  assert.equal(r.status, 'Partial')
  assert.ok(r.caps.includes('guidance limited'))
})
check('a new/declared module is discovered from frontmatter via the graph (catalyst reference)', () => {
  const d = moduleReadinessDecls()['catalyst']
  assert.ok(d, 'catalyst should expose a data_readiness declaration')
  assert.deepEqual(d!.sufficient, ['transcript', 'guidance'])
})

// ---- A.5: readiness-gate scoping by run kind ----
const M = (status: ModuleReadiness['status']): ModuleReadiness => ({ status, reasons: [], caps: [] })

check('moduleReadinessIssues: full run -> an Insufficient module is a DEGRADE (others still run)', () => {
  const out = moduleReadinessIssues('full', undefined, { earnings: M('Insufficient'), valuation: M('Sufficient') })
  assert.equal(out.length, 1)
  assert.equal(out[0].severity, 'degrade')
  assert.equal(out[0].module, 'earnings')
})
check('moduleReadinessIssues: module run -> an Insufficient TARGET is a BLOCKER (scoped to the target)', () => {
  const out = moduleReadinessIssues('module', 'earnings', { earnings: M('Insufficient'), valuation: M('Insufficient') })
  assert.equal(out.length, 1) // only the target, not the other Insufficient module
  assert.equal(out[0].severity, 'blocker')
  assert.equal(out[0].module, 'earnings')
})
check('moduleReadinessIssues: module run with a Sufficient target -> no issue', () => {
  assert.equal(moduleReadinessIssues('module', 'valuation', { valuation: M('Sufficient') }).length, 0)
})
check('moduleReadinessIssues: Partial is not surfaced (runs capped, not a gate concern)', () => {
  assert.equal(moduleReadinessIssues('full', undefined, { earnings: M('Partial') }).length, 0)
})
check('moduleReadinessIssues: agent + rerun are skipped entirely', () => {
  assert.equal(moduleReadinessIssues('agent', undefined, { earnings: M('Insufficient') }).length, 0)
  assert.equal(moduleReadinessIssues('rerun', undefined, { earnings: M('Insufficient') }).length, 0)
})

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
