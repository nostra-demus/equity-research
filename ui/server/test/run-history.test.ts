// Run-history + standing-run resolution. A ticker can accumulate several run folders over days — a full
// dossier plus later single-module re-runs (each writes a fresh dated folder). This asserts the two things
// that keep the cockpit honest about that:
//   (A) the STANDING run surfaced (pill) + opened (display/chat path) is the newest run that actually
//       DECIDED — a newer decision-less re-run must not shadow the completed dossier — while the LAUNCHER
//       path keeps newest-folder semantics (that is where a fresh run writes / what a rerun continues);
//   (B) listRunsForTicker enumerates every run newest-first with the fields the history view needs
//       (modules, hasDossier, hasDecisionRecord).
// Hermetic: points ENGINE_REPO_ROOT at a throwaway repo and builds fixture folders, so no ~/.claude, no
// real analyses/. ANALYSES_DIR is resolved at module load, so the imports are DYNAMIC (after the env is set).
// Run: npx tsx test/run-history.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'run-history-'))
process.env.ENGINE_REPO_ROOT = TMP
const ANALYSES = path.join(TMP, 'analyses')
fs.mkdirSync(ANALYSES, { recursive: true })

function writeRun(dir: string, opts: { decision?: unknown; malformed?: boolean; dossier?: boolean; thesis?: boolean; modules?: string[]; support?: string[] }) {
  const abs = path.join(ANALYSES, dir)
  fs.mkdirSync(abs, { recursive: true })
  // A real module folder carries the engine's numbered agent outputs (NN_*.md) — write one so the module is
  // detected the way listRunsForTicker detects it (an empty dir is not a module).
  for (const m of opts.modules ?? []) {
    fs.mkdirSync(path.join(abs, m), { recursive: true })
    fs.writeFileSync(path.join(abs, m, '00_data-triage.md'), `# ${m}`)
  }
  // Run-support folders that are NOT modules: reviews/ (*.json + *_memo_delta.md) and _pool_extracts/ (*.txt).
  // Written with their real content types (no NN_*.md) so the module filter must exclude them by structure.
  for (const s of opts.support ?? []) {
    fs.mkdirSync(path.join(abs, s), { recursive: true })
    if (s === 'reviews') { fs.writeFileSync(path.join(abs, s, '2026-01-01_30d_decision_review.json'), '{}'); fs.writeFileSync(path.join(abs, s, '2026-01-01_30d_memo_delta.md'), '# delta') }
    else fs.writeFileSync(path.join(abs, s, 'Company__Balance-Sheet.txt'), 'x')
  }
  if (opts.malformed) fs.writeFileSync(path.join(abs, 'decision_record.json'), '{ this is not json')
  else if (opts.decision !== undefined) fs.writeFileSync(path.join(abs, 'decision_record.json'), JSON.stringify(opts.decision))
  if (opts.dossier) fs.writeFileSync(path.join(abs, 'audit_dossier.md'), '# dossier')
  if (opts.thesis) fs.writeFileSync(path.join(abs, 'final_thesis.md'), '# thesis')
}

// AMZN — the real shape: five runs built module-by-module, a full dossier on 07-10, then a GOV-ONLY re-run
// on 07-11 (newest folder, no decision record) that must NOT hide the 07-10 dossier.
writeRun('AMZN_2026-07-01', { modules: ['business-model'] })
writeRun('AMZN_2026-07-03', { modules: ['business-model', 'earnings'] })
writeRun('AMZN_2026-07-04', { modules: ['management-governance', 'balance-sheet-survival'] })
// The full run also carries run-support folders (reviews/ + _pool_extracts/) alongside its 6 real modules —
// those must NOT be reported or counted as modules (they hold no NN_*.md agent output).
writeRun('AMZN_2026-07-10', { decision: { decision: 'Watchlist', decision_date: '2026-07-10', confidence_score: null }, dossier: true, thesis: true, modules: ['balance-sheet-survival', 'business-model', 'catalyst', 'earnings', 'management-governance', 'valuation'], support: ['reviews', '_pool_extracts'] })
writeRun('AMZN_2026-07-11', { modules: ['management-governance'] })
// ARR — the newest run's decision_record.json parses but is an ARRAY (hand-edited / half-written), not an
// object: it is NOT a usable "decided" signal, so the last GOOD (object) run must remain the standing pick.
writeRun('ARR_2026-02-01', { decision: { decision: 'Buy', decision_date: '2026-02-01', confidence_score: 64 }, dossier: true, modules: ['business-model'] })
writeRun('ARR_2026-02-05', { decision: [1, 2, 3], modules: ['valuation'] })
// BG — only partial runs, none decided: the standing pick falls back to the newest folder.
writeRun('BG_2026-06-01', { modules: ['business-model'] })
writeRun('BG_2026-06-08', { modules: ['earnings'] })
// MAL — newest run has a HALF-WRITTEN decision record; the last GOOD run must win, and both code paths agree.
writeRun('MAL_2026-01-02', { decision: { decision: 'Buy', decision_date: '2026-01-02', confidence_score: 71 }, dossier: true, modules: ['business-model'] })
writeRun('MAL_2026-01-03', { malformed: true, modules: ['valuation'] })

const { summarizeRuns, latestDecision } = await import('../src/data-status')
const { standingRunDir, resolveRunRoot, listRunsForTicker } = await import('../src/outputs')

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}

// ---- (A) standing run: newest that DECIDED, not the newest folder ----
check('summarizeRuns surfaces the standing (complete) run, not the newer gov-only re-run', () => {
  const s = summarizeRuns('AMZN')
  assert.equal(s.latestRun?.runRoot, 'analyses/AMZN_2026-07-10')
  assert.equal(s.latestRun?.decision, 'Watchlist')
  assert.equal(s.latestRun?.decisionDate, '2026-07-10')
  assert.equal(s.latestRun?.confidence, null)
})
check('summarizeRuns counts every run folder', () => assert.equal(summarizeRuns('AMZN').runCount, 5))
check('summarizeRuns flags a newer decision-less run shadowing the standing one', () => assert.equal(summarizeRuns('AMZN').hasNewerPartial, true))
check('latestDecision is the standing run', () => assert.equal(latestDecision('AMZN')?.runRoot, 'analyses/AMZN_2026-07-10'))
check('standingRunDir agrees with summarizeRuns.latestRun (one rule, two call sites)', () => {
  assert.equal(`analyses/${standingRunDir('AMZN')}`, summarizeRuns('AMZN').latestRun?.runRoot)
})

// ---- (A) the launcher vs display split on resolveRunRoot ----
check('resolveRunRoot default targets the NEWEST folder (launcher: where a fresh run writes / rerun continues)', () => {
  assert.equal(resolveRunRoot({ ticker: 'AMZN' }), 'analyses/AMZN_2026-07-11')
})
check('resolveRunRoot preferComplete targets the STANDING run (display/chat: open the dossier)', () => {
  assert.equal(resolveRunRoot({ ticker: 'AMZN', preferComplete: true }), 'analyses/AMZN_2026-07-10')
})
check('resolveRunRoot honors an explicit runRoot (opening a specific historical run)', () => {
  assert.equal(resolveRunRoot({ runRoot: 'analyses/AMZN_2026-07-04', preferComplete: true }), 'analyses/AMZN_2026-07-04')
})
check('resolveRunRoot honors an explicit ticker+date', () => {
  assert.equal(resolveRunRoot({ ticker: 'AMZN', date: '2026-07-03' }), 'analyses/AMZN_2026-07-03')
})

// ---- all-partial ticker: fall back to the newest folder, no false "shadowed" flag ----
check('all-partial ticker falls back to the newest folder', () => {
  const s = summarizeRuns('BG')
  assert.equal(s.latestRun?.runRoot, 'analyses/BG_2026-06-08')
  assert.equal(s.latestRun?.decision, null)
  assert.equal(s.runCount, 2)
  assert.equal(s.hasNewerPartial, false) // nothing has decided, so nothing is being shadowed
})
check('all-partial ticker: preferComplete still resolves (newest folder)', () => {
  assert.equal(resolveRunRoot({ ticker: 'BG', preferComplete: true }), 'analyses/BG_2026-06-08')
})

// ---- malformed newest record: last GOOD run wins, both paths agree ----
check('a half-written newest decision record does not win the standing pick', () => {
  assert.equal(summarizeRuns('MAL').latestRun?.runRoot, 'analyses/MAL_2026-01-02')
  assert.equal(summarizeRuns('MAL').latestRun?.decision, 'Buy')
  assert.equal(`analyses/${standingRunDir('MAL')}`, 'analyses/MAL_2026-01-02')
  assert.equal(resolveRunRoot({ ticker: 'MAL', preferComplete: true }), 'analyses/MAL_2026-01-02')
})

// ---- a decision record that parses but is NOT an object (array/primitive) is treated as incomplete ----
// (guards summarizeRuns + standingRunDir; the two paths must stay in agreement)
check('an array (non-object) decision record does not win the standing pick', () => {
  assert.equal(summarizeRuns('ARR').latestRun?.runRoot, 'analyses/ARR_2026-02-01')
  assert.equal(summarizeRuns('ARR').latestRun?.decision, 'Buy')
  assert.equal(summarizeRuns('ARR').hasNewerPartial, true) // the newer array run is a partial shadowing the standing one
  assert.equal(`analyses/${standingRunDir('ARR')}`, 'analyses/ARR_2026-02-01')
  assert.equal(resolveRunRoot({ ticker: 'ARR', preferComplete: true }), 'analyses/ARR_2026-02-01')
})

// ---- run-support folders (reviews/, _pool_extracts/) are NOT reported or counted as modules ----
check('listRunsForTicker excludes run-support folders from a run’s modules', () => {
  const r = listRunsForTicker('AMZN').find((x) => x.date === '2026-07-10')!
  assert.equal(r.modules.length, 6) // 6 real modules, NOT 8
  assert.ok(!r.modules.includes('reviews'), 'reviews must not be listed as a module')
  assert.ok(!r.modules.includes('_pool_extracts'), '_pool_extracts must not be listed as a module')
  assert.deepEqual(r.modules, ['balance-sheet-survival', 'business-model', 'catalyst', 'earnings', 'management-governance', 'valuation'])
})

// ---- unknown ticker: null everywhere, no throw ----
check('unknown ticker resolves to null / empty', () => {
  assert.deepEqual(summarizeRuns('ZZZ'), { latestRun: null, runCount: 0, hasNewerPartial: false })
  assert.equal(standingRunDir('ZZZ'), null)
  assert.equal(resolveRunRoot({ ticker: 'ZZZ', preferComplete: true }), null)
})

// ---- (B) run history enumeration for the expander ----
check('listRunsForTicker returns every run newest-first', () => {
  const h = listRunsForTicker('AMZN')
  assert.equal(h.length, 5)
  assert.deepEqual(h.map((r) => r.date), ['2026-07-11', '2026-07-10', '2026-07-04', '2026-07-03', '2026-07-01'])
})
check('history: the gov-only re-run is marked incomplete with its single module', () => {
  const r = listRunsForTicker('AMZN').find((x) => x.date === '2026-07-11')!
  assert.equal(r.hasDecisionRecord, false)
  assert.equal(r.hasDossier, false)
  assert.equal(r.decision, null)
  assert.deepEqual(r.modules, ['management-governance'])
})
check('history: the full run carries decision + dossier + all its modules', () => {
  const r = listRunsForTicker('AMZN').find((x) => x.date === '2026-07-10')!
  assert.equal(r.hasDecisionRecord, true)
  assert.equal(r.hasDossier, true)
  assert.equal(r.decision, 'Watchlist')
  assert.equal(r.modules.length, 6)
  assert.ok(r.modules.includes('valuation') && r.modules.includes('catalyst'))
})
check('history: a multi-module partial lists its modules sorted', () => {
  const r = listRunsForTicker('AMZN').find((x) => x.date === '2026-07-04')!
  assert.deepEqual(r.modules, ['balance-sheet-survival', 'management-governance'])
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch {}
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
