// Regression: deriveSignalState must not read a post-lock terminal rejection as "partial — resumable".
//
// Bug: the thesis-integrity module (Improve research engine: adversarial red-team a screener thesis
// before candidate-surfacing spends work on it) can record its OWN terminal routing
// (watchlist_integrity_downgrade / watchlist_integrity_broken) on a run whose thesis_record.json stays
// locked at status "provisional"/"full_machine" — that field is locked and thesis-integrity never
// rewrites it. deriveSignalState's `hitTerminal` already scans every recorded module verdict generically
// (no module names hardcoded — it reads SWARM.md's routing.terminal set), but the original if-chain
// checked `locked` BEFORE `hitTerminal`, so a thesis that failed its own integrity review and never
// reached candidate-surfacing read as 'partial — resumable' forever instead of the real, terminal
// 'watchlist' outcome. listResumableSignals already got this right (it checks hitTerminal first); this
// test pins deriveSignalState to the same contract.
//
// Run: npx tsx test/screener-derive-state-integrity.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const realRepo = path.resolve(here, '..', '..', '..') // ui/server/test -> repo root
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-derive-'))
process.env.ENGINE_REPO_ROOT = root
fs.symlinkSync(path.join(realRepo, '.claude'), path.join(root, '.claude'), 'dir')

const runsDir = path.join(root, 'screener', 'runs')
fs.mkdirSync(runsDir, { recursive: true })

function writeModule(runDir: string, mod: string, routing: string): void {
  const dir = path.join(runDir, mod)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `99_${mod}-synthesis.md`), `# ${mod} synthesis\n\nRouting: ${routing}\n`)
}

function mkThesisRecord(status: string): object {
  return { meta: { thesis_id: 'THS-fixture-v1', locked: true, version: 1, status } }
}

// Case A: thesis-integrity failed the thesis (Thesis broken) — locked, no candidates.json, but a real
// terminal verdict is on record. Must read 'watchlist', never 'partial'.
const BROKEN = 'SIG-20260701-aaaaaaaa'
{
  const dir = path.join(runsDir, BROKEN)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: BROKEN, headline: 'fixture headline long enough' }) + '\n')
  writeModule(dir, 'signal-gate', 'PROMOTE')
  writeModule(dir, 'thesis-structure', 'Proceed')
  writeModule(dir, 'edge-definition', 'full_machine')
  writeModule(dir, 'thesis-integrity', 'watchlist_integrity_broken')
  fs.writeFileSync(path.join(dir, 'thesis_record.json'), JSON.stringify(mkThesisRecord('full_machine')) + '\n')
}

// Case B: same shape, but thesis-integrity survived (Proceed) and candidate-surfacing hasn't run yet —
// a genuinely in-flight/interrupted run. Must still read 'partial' (the fix must not over-correct).
const PENDING = 'SIG-20260701-bbbbbbbb'
{
  const dir = path.join(runsDir, PENDING)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: PENDING, headline: 'fixture headline long enough' }) + '\n')
  writeModule(dir, 'signal-gate', 'PROMOTE')
  writeModule(dir, 'thesis-structure', 'Proceed')
  writeModule(dir, 'edge-definition', 'provisional')
  writeModule(dir, 'thesis-integrity', 'Proceed')
  fs.writeFileSync(path.join(dir, 'thesis_record.json'), JSON.stringify(mkThesisRecord('provisional')) + '\n')
}

// Case C: full run, candidates surfaced. Must read 'complete' regardless of the fix.
const COMPLETE = 'SIG-20260701-cccccccc'
{
  const dir = path.join(runsDir, COMPLETE)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: COMPLETE, headline: 'fixture headline long enough' }) + '\n')
  writeModule(dir, 'signal-gate', 'PROMOTE')
  writeModule(dir, 'thesis-structure', 'Proceed')
  writeModule(dir, 'edge-definition', 'full_machine')
  writeModule(dir, 'thesis-integrity', 'Proceed')
  writeModule(dir, 'candidate-surfacing', 'full_machine')
  fs.writeFileSync(path.join(dir, 'thesis_record.json'), JSON.stringify(mkThesisRecord('full_machine')) + '\n')
  fs.writeFileSync(path.join(dir, 'candidates.json'), JSON.stringify({ candidates: [] }) + '\n')
}

// Case D: candidate-surfacing already ran (candidates.json on disk), then an append-only integrity
// re-review (the module writes _v2/_v3 on reruns) flipped the thesis to a terminal reject. `locked &&
// hasCandidates` alone would read 'complete' and keep offering the now-stale shortlist; the terminal module
// verdict must win. Must read 'watchlist'. (Pins the ordering: terminal module verdict BEFORE candidate
// presence.)
const BROKEN_AFTER_SURFACING = 'SIG-20260701-dddddddd'
{
  const dir = path.join(runsDir, BROKEN_AFTER_SURFACING)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: BROKEN_AFTER_SURFACING, headline: 'fixture headline long enough' }) + '\n')
  writeModule(dir, 'signal-gate', 'PROMOTE')
  writeModule(dir, 'thesis-structure', 'Proceed')
  writeModule(dir, 'edge-definition', 'full_machine')
  writeModule(dir, 'candidate-surfacing', 'full_machine')
  writeModule(dir, 'thesis-integrity', 'watchlist_integrity_broken')
  fs.writeFileSync(path.join(dir, 'thesis_record.json'), JSON.stringify(mkThesisRecord('full_machine')) + '\n')
  fs.writeFileSync(path.join(dir, 'candidates.json'), JSON.stringify({ candidates: [] }) + '\n')
}

// Case E: a PARK/LOG signal advanced past Gate 0 by an explicit human override (`override_promote`), which
// then ran to completion. The gate's original terminal verdict stays on disk BY DESIGN, so a terminal test
// that counts it would read this finished run as 'watchlist' and hide its shortlist. Must read 'complete'.
const OVERRIDE_COMPLETE = 'SIG-20260701-eeeeeeee'
{
  const dir = path.join(runsDir, OVERRIDE_COMPLETE)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: OVERRIDE_COMPLETE, headline: 'fixture headline long enough' }) + '\n')
  fs.writeFileSync(path.join(dir, 'signal_payload.json'), JSON.stringify({ routing: 'PARK', materiality_score: 55 }) + '\n')
  writeModule(dir, 'signal-gate', 'PARK') // the overridden gate call — preserved on disk
  writeModule(dir, 'thesis-structure', 'Proceed')
  writeModule(dir, 'edge-definition', 'provisional')
  writeModule(dir, 'thesis-integrity', 'Proceed')
  writeModule(dir, 'candidate-surfacing', 'provisional')
  fs.writeFileSync(path.join(dir, 'thesis_record.json'), JSON.stringify(mkThesisRecord('provisional')) + '\n')
  fs.writeFileSync(path.join(dir, 'candidates.json'), JSON.stringify({ candidates: [] }) + '\n')
}

// Case F: the same override, but interrupted before candidate-surfacing. Must stay 'partial' (resumable) —
// the spent gate verdict must not strip its Continue action.
const OVERRIDE_PARTIAL = 'SIG-20260701-ffffffff'
{
  const dir = path.join(runsDir, OVERRIDE_PARTIAL)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: OVERRIDE_PARTIAL, headline: 'fixture headline long enough' }) + '\n')
  fs.writeFileSync(path.join(dir, 'signal_payload.json'), JSON.stringify({ routing: 'LOG', materiality_score: 30 }) + '\n')
  writeModule(dir, 'signal-gate', 'LOG') // the overridden gate call — preserved on disk
  writeModule(dir, 'thesis-structure', 'Proceed')
  writeModule(dir, 'edge-definition', 'provisional')
  fs.writeFileSync(path.join(dir, 'thesis_record.json'), JSON.stringify(mkThesisRecord('provisional')) + '\n')
}

const { deriveSignalState } = await import('../src/screener')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('a locked thesis that failed post-lock integrity review reads watchlist, not partial', () => {
  const r = deriveSignalState(BROKEN)
  assert.equal(r.state, 'watchlist', `expected 'watchlist', got '${r.state}'`)
})

check('a locked thesis genuinely still pending candidate-surfacing still reads partial', () => {
  const r = deriveSignalState(PENDING)
  assert.equal(r.state, 'partial', `expected 'partial', got '${r.state}'`)
})

check('a fully completed run still reads complete', () => {
  const r = deriveSignalState(COMPLETE)
  assert.equal(r.state, 'complete', `expected 'complete', got '${r.state}'`)
})

check('a completed run whose thesis was later broken by an integrity re-review reads watchlist, not complete', () => {
  const r = deriveSignalState(BROKEN_AFTER_SURFACING)
  assert.equal(r.state, 'watchlist', `expected 'watchlist', got '${r.state}'`)
})

check('an overridden PARK that ran to completion still reads complete (spent gate verdict is not terminal)', () => {
  const r = deriveSignalState(OVERRIDE_COMPLETE)
  assert.equal(r.state, 'complete', `expected 'complete', got '${r.state}'`)
})

check('an overridden LOG interrupted mid-run still reads partial (keeps its Continue)', () => {
  const r = deriveSignalState(OVERRIDE_PARTIAL)
  assert.equal(r.state, 'partial', `expected 'partial', got '${r.state}'`)
})

try { fs.rmSync(root, { recursive: true, force: true }) } catch { /* ignore */ }

console.log(`\n${passed} checks passed`)
