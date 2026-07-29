// carryForwardScoped() — executing an intake plan's scoped rerun as ONE staged pass.
//
// The contract under test: untouched modules carry WHOLE; an entry module carries minus the invalidated
// orb outputs + its 99 synthesis (+ memo/dossier); every module transitively downstream of an entry
// carries minus ONLY its synthesis — so the ordinary full-run resume machinery (MODULE_PIPELINE Step 4A
// orb-skip + the 99-presence module-skip) re-runs exactly the gaps, once, ending in one master + commit.
// Two orbs in one module must produce ONE staged copy and ONE downstream cascade (the whole point vs
// running /research:rerun per orb). Fail-closed: invalid entries are dropped, and an all-invalid plan
// stages NOTHING (no target folder as a side effect). Prior-dated folders are never modified.
// Isolated in a temp repo with a fake 3-module graph. Run: npx tsx test/carry-scoped.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'carry-scoped-'))
process.env.ENGINE_REPO_ROOT = REPO

function write(rel: string, body: string) {
  const abs = path.join(REPO, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
}
const fm = (name: string, layer: number, extra = '') => `---\nname: ${name}\nlayer: ${layer}\n${extra}---\n# ${name}\nbody\n`

// A 3-module research graph: alpha (TWO specialists + synthesis) → beta (depends on alpha) ;
// gamma independent (the untouched carry-whole case).
write('.claude/agents/alpha/01_alpha-one.md', fm('alpha-one', 1))
write('.claude/agents/alpha/02_alpha-two.md', fm('alpha-two', 2))
write('.claude/agents/alpha/99_alpha-synthesis.md', fm('alpha-synthesis', 99, 'depends_on: []\n'))
write('.claude/agents/beta/01_beta-thing.md', fm('beta-thing', 1))
write('.claude/agents/beta/99_beta-synthesis.md', fm('beta-synthesis', 99, 'depends_on: [alpha]\n'))
write('.claude/agents/gamma/01_gamma-thing.md', fm('gamma-thing', 1))
write('.claude/agents/gamma/99_gamma-synthesis.md', fm('gamma-synthesis', 99, 'depends_on: []\n'))

const day = (offset: number) => {
  const d = new Date(Date.now() + offset * 86_400_000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const TODAY = day(0)
const YESTERDAY = day(-1)

function poolFile(ticker: string, name: string, offsetDays: number) {
  write(`data/${ticker}/${name}`, 'x')
  const abs = path.join(REPO, 'data', ticker, name)
  const t = new Date(Date.now() + offsetDays * 86_400_000)
  fs.utimesSync(abs, t, t)
}

/** A FINISHED module folder in a dated run root — orbs + synthesis + memo + dossier. */
function finishedModule(ticker: string, date: string, module: string, orbs: string[]) {
  for (const o of orbs) write(`analyses/${ticker}_${date}/${module}/${o}`, `# ${o}\nevidence\n`)
  write(`analyses/${ticker}_${date}/${module}/99_${module}-synthesis.md`, `# ${module} synthesis\nVerdict: fine\n`)
  write(`analyses/${ticker}_${date}/${module}/${module}_memo.md`, `# ${module} memo\n`)
  write(`analyses/${ticker}_${date}/${module}/${module}_dossier.md`, `# ${module} dossier\n`)
}
function finishedRun(ticker: string, date: string) {
  finishedModule(ticker, date, 'alpha', ['01_alpha-one.md', '02_alpha-two.md'])
  finishedModule(ticker, date, 'beta', ['01_beta-thing.md'])
  finishedModule(ticker, date, 'gamma', ['01_gamma-thing.md'])
}

const { carryForwardScoped } = await import('../src/completion')

const at = (ticker: string, rel: string) => path.join(REPO, `analyses/${ticker}_${TODAY}`, rel)
const yat = (ticker: string, rel: string) => path.join(REPO, `analyses/${ticker}_${YESTERDAY}`, rel)

// ---- 1. one entry orb: entry module holed, downstream synthesis-only, independent module carried whole ----
{
  finishedRun('ONE', YESTERDAY)
  poolFile('ONE', 'filing.pdf', -3)
  // the plan file rides into the target root so a retry / the audit trail can still find it (the staging
  // makes TODAY the latest root, and readIntakePlan searches only the latest root)
  write(`analyses/ONE_${YESTERDAY}/intake/${YESTERDAY}_intake_plan.json`, '{"ticker":"ONE"}')
  const planAbs = path.join(REPO, `analyses/ONE_${YESTERDAY}/intake/${YESTERDAY}_intake_plan.json`)
  const r = carryForwardScoped('ONE', [{ module: 'alpha', agent: 'alpha-one' }], undefined, undefined, planAbs)
  assert.deepEqual(r.staleModules, ['alpha', 'beta'], 'stale = entry module + its transitive downstream, topo order')
  assert.deepEqual(r.droppedEntries, [])
  assert.deepEqual(r.carried.map((c) => c.module), ['gamma'], 'the untouched module carries whole')
  assert.deepEqual(r.scoped.map((s) => s.module), ['alpha', 'beta'])

  // alpha: invalidated orb + synthesis + memo/dossier ABSENT; sibling orb carried; scoped stamp present
  assert.ok(!fs.existsSync(at('ONE', 'alpha/01_alpha-one.md')), 'invalidated orb omitted → Step 4A re-runs it')
  assert.ok(fs.existsSync(at('ONE', 'alpha/02_alpha-two.md')), 'sibling orb carried verbatim')
  assert.ok(!fs.existsSync(at('ONE', 'alpha/99_alpha-synthesis.md')), 'entry module synthesis omitted')
  assert.ok(!fs.existsSync(at('ONE', 'alpha/alpha_memo.md')), 'memo regenerates (master batch)')
  assert.ok(!fs.existsSync(at('ONE', 'alpha/alpha_dossier.md')), 'dossier regenerates (Step 4.9B)')
  assert.ok(fs.existsSync(at('ONE', 'alpha/RESUMED_FROM.md')), 'scoped provenance stamp')
  const alphaNote = fs.readFileSync(at('ONE', 'alpha/RESUMED_FROM.md'), 'utf8')
  assert.match(alphaNote, /01_alpha-one\.md/, 'the stamp names the omitted orb')
  assert.match(alphaNote, /resumed-from: analyses\/ONE_/, 'machine-readable provenance comment')
  const a = r.scoped.find((s) => s.module === 'alpha')!
  assert.deepEqual(a.omittedOrbs, ['01_alpha-one.md'])
  assert.equal(a.synthesisOnly, false)
  assert.equal(a.inPlace, false)

  // beta (downstream): ALL orbs carried, only synthesis (+memo/dossier) omitted → 99-only rerun
  assert.ok(fs.existsSync(at('ONE', 'beta/01_beta-thing.md')), 'downstream orbs carried — zero specialists dispatched')
  assert.ok(!fs.existsSync(at('ONE', 'beta/99_beta-synthesis.md')), 'downstream synthesis omitted → re-runs')
  const b = r.scoped.find((s) => s.module === 'beta')!
  assert.equal(b.synthesisOnly, true)
  assert.match(fs.readFileSync(at('ONE', 'beta/RESUMED_FROM.md'), 'utf8'), /only this module's synthesis/)

  // gamma: whole carry, synthesis INCLUDED → both full-run paths skip it
  assert.ok(fs.existsSync(at('ONE', 'gamma/99_gamma-synthesis.md')), 'untouched module keeps its synthesis')
  assert.ok(fs.existsSync(at('ONE', 'gamma/CARRIED_FORWARD.md')), 'whole-carry provenance')
  assert.ok(!fs.existsSync(at('ONE', 'gamma/RESUMED_FROM.md')))

  // the source (yesterday) run is byte-untouched — prior-dated folders are never modified
  for (const f of ['alpha/01_alpha-one.md', 'alpha/99_alpha-synthesis.md', 'alpha/alpha_memo.md', 'beta/99_beta-synthesis.md']) {
    assert.ok(fs.existsSync(yat('ONE', f)), `source run intact: ${f}`)
  }
  // the plan file was carried into the target root (retry + audit reachability)
  assert.ok(fs.existsSync(at('ONE', `intake/${YESTERDAY}_intake_plan.json`)), 'plan file rides into the target root')
  console.log('✅ one entry orb: holed entry module, synthesis-only downstream, whole-carry for the rest, plan carried')
}

// ---- 2. TWO orbs in ONE module: one staged copy, one cascade (the dedup that motivates the feature) ----
{
  finishedRun('TWO', YESTERDAY)
  poolFile('TWO', 'filing.pdf', -3)
  const r = carryForwardScoped('TWO', [
    { module: 'alpha', agent: 'alpha-one' },
    { module: 'alpha', agent: 'alpha-two' },
  ])
  assert.deepEqual(r.staleModules, ['alpha', 'beta'], 'beta appears ONCE — the cascade is deduplicated')
  const a = r.scoped.find((s) => s.module === 'alpha')!
  assert.deepEqual(a.omittedOrbs, ['01_alpha-one.md', '02_alpha-two.md'], 'both orbs omitted from ONE staged copy')
  assert.ok(!fs.existsSync(at('TWO', 'alpha/01_alpha-one.md')))
  assert.ok(!fs.existsSync(at('TWO', 'alpha/02_alpha-two.md')))
  assert.equal(r.scoped.filter((s) => s.module === 'beta').length, 1, 'downstream synthesis re-runs once, not per orb')
  console.log('✅ two orbs, one module: single staged copy + single downstream cascade')
}

// ---- 3. fail-closed: unknown agents are dropped; an all-invalid plan stages NOTHING ----
{
  finishedRun('BAD', YESTERDAY)
  poolFile('BAD', 'filing.pdf', -3)
  const r = carryForwardScoped('BAD', [{ module: 'alpha', agent: 'no-such-orb' }, { module: 'nope', agent: 'x' }])
  assert.equal(r.droppedEntries.length, 2)
  assert.deepEqual(r.scoped, [])
  assert.deepEqual(r.carried, [])
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/BAD_${TODAY}`)), 'no target folder as a side effect of a bad plan')
  console.log('✅ fail-closed: invalid entries dropped, nothing staged, no folder created')
}

// ---- 4. mustReuse (finished in TODAY's root): holes punched IN PLACE, prior folders untouched ----
{
  finishedModule('INPL', TODAY, 'alpha', ['01_alpha-one.md', '02_alpha-two.md']) // finished TODAY → mustReuse
  // simulate that alpha got here via an earlier completion carry: its stale CARRIED_FORWARD.md must NOT
  // survive the hole-punch — the refreshed module would otherwise keep its old source-run vintage AND
  // carry two contradictory provenance stories (Codex r3672206131)
  write(`analyses/INPL_${TODAY}/alpha/CARRIED_FORWARD.md`, '# Carried forward — alpha\ncarried verbatim from an earlier run\n')
  finishedModule('INPL', YESTERDAY, 'beta', ['01_beta-thing.md'])
  finishedModule('INPL', YESTERDAY, 'gamma', ['01_gamma-thing.md'])
  poolFile('INPL', 'filing.pdf', -3)
  const r = carryForwardScoped('INPL', [{ module: 'alpha', agent: 'alpha-one' }])
  const a = r.scoped.find((s) => s.module === 'alpha')!
  assert.equal(a.inPlace, true, 'a module the full-run paths would skip is hole-punched in place')
  assert.ok(!fs.existsSync(at('INPL', 'alpha/01_alpha-one.md')), 'invalidated orb removed in place')
  assert.ok(fs.existsSync(at('INPL', 'alpha/02_alpha-two.md')), 'sibling orb kept in place')
  assert.ok(!fs.existsSync(at('INPL', 'alpha/99_alpha-synthesis.md')), 'synthesis removed → module re-admits')
  assert.ok(fs.existsSync(at('INPL', 'alpha/RESUMED_FROM.md')))
  assert.ok(!fs.existsSync(at('INPL', 'alpha/CARRIED_FORWARD.md')), 'stale whole-carry marker removed — one provenance story per folder')
  assert.ok(!fs.existsSync(at('INPL', 'beta/99_beta-synthesis.md')), 'downstream still synthesis-only')
  assert.ok(fs.existsSync(at('INPL', 'beta/01_beta-thing.md')))
  console.log('✅ mustReuse module: holes punched in place, cascade still staged')
}

// ---- 5. a synthesis-orb entry: no specialist holes — the module re-runs synthesis-only ----
{
  finishedRun('SYN', YESTERDAY)
  poolFile('SYN', 'filing.pdf', -3)
  const r = carryForwardScoped('SYN', [{ module: 'alpha', agent: 'alpha-synthesis' }])
  const a = r.scoped.find((s) => s.module === 'alpha')!
  assert.equal(a.synthesisOnly, true)
  assert.deepEqual(a.omittedOrbs, [])
  assert.ok(fs.existsSync(at('SYN', 'alpha/01_alpha-one.md')), 'specialists all carried')
  assert.ok(fs.existsSync(at('SYN', 'alpha/02_alpha-two.md')))
  assert.ok(!fs.existsSync(at('SYN', 'alpha/99_alpha-synthesis.md')))
  console.log('✅ synthesis entry: specialists carried, synthesis re-runs, cascade follows')
}

// ---- 6. no finished run anywhere: nothing carried, nothing scoped — the route's nothing_to_scope 409 ----
// (a scoped rerun needs an existing run to scope against; launching here would be a bare full run wearing
// a "scoped" label, dodging the full-run path's typed-ticker confirmation)
{
  poolFile('EMPTY', 'filing.pdf', -3)
  const r = carryForwardScoped('EMPTY', [{ module: 'alpha', agent: 'alpha-one' }])
  assert.deepEqual(r.carried, [])
  assert.deepEqual(r.scoped, [])
  assert.deepEqual(r.staleModules, ['alpha', 'beta'], 'the stale set is still reported (the route uses carried+scoped, not this)')
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/EMPTY_${TODAY}`)), 'nothing staged, no folder created')
  console.log('✅ no finished run: nothing staged — the route refuses instead of hiding a full run')
}

fs.rmSync(REPO, { recursive: true, force: true })
console.log('\nall carry-scoped tests passed')
