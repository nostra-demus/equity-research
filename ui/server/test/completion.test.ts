// thesisPlan() + carryForwardModules() — the "Complete the thesis" reuse contract.
//
// The whole point of this feature is that the user must NOT pay twice for work already on disk, even when
// that work sits in an OLDER dated run folder than the one a completion would write into. These tests pin
// exactly that: cross-folder reuse is detected, staleness demotes a finished module out of the reuse set,
// the carry is atomic + idempotent + non-destructive, and a prior-run folder is never written to.
// Isolated in a temp repo so a fake 2-module research graph drives it. Run: npx tsx test/completion.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'completion-'))
process.env.ENGINE_REPO_ROOT = REPO

function write(rel: string, body: string) {
  const abs = path.join(REPO, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
}
const fm = (name: string, layer: number, extra = '') => `---\nname: ${name}\nlayer: ${layer}\n${extra}---\n# ${name}\nbody\n`

// A minimal 2-module research graph: `alpha` (one specialist + synthesis), `beta` (one specialist + synthesis).
write('.claude/agents/alpha/01_alpha-thing.md', fm('alpha-thing', 1))
write('.claude/agents/alpha/99_alpha-synthesis.md', fm('alpha-synthesis', 99, 'depends_on: []\n'))
write('.claude/agents/beta/01_beta-thing.md', fm('beta-thing', 1))
write('.claude/agents/beta/99_beta-synthesis.md', fm('beta-synthesis', 99, 'depends_on: [alpha]\n'))

const day = (offset: number) => {
  const d = new Date(Date.now() + offset * 86_400_000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const TODAY = day(0)
const YESTERDAY = day(-1)

/** Set a data-pool file's mtime to `offset` days from now — the durable freshness signal (data/ is untracked). */
function poolFile(ticker: string, name: string, offsetDays: number) {
  write(`data/${ticker}/${name}`, 'x')
  const abs = path.join(REPO, 'data', ticker, name)
  const t = new Date(Date.now() + offsetDays * 86_400_000)
  fs.utimesSync(abs, t, t)
}

// ---- fixtures ------------------------------------------------------------------------------------
// ACME: alpha FINISHED yesterday (an older run folder); beta never ran. Pool is older than alpha's run.
//       → alpha is `done` and REUSABLE across folders; beta is `missing` and must run.
write(`analyses/ACME_${YESTERDAY}/alpha/01_alpha-thing.md`, '# alpha thing\n')
write(`analyses/ACME_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha synthesis\nVerdict: fine\n')
poolFile('ACME', 'filing.pdf', -3)

// STALE: same shape, but the pool gained a file TODAY — after alpha's run. alpha must NOT be reused.
write(`analyses/STALE_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
write(`analyses/STALE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha synthesis\n')
poolFile('STALE', 'new-filing.pdf', 0)

// SAMEDAY: pool file lands the SAME day as the run. Order is unknowable from a date-named folder, so this
// must NOT be flagged stale (a coin-flip re-run burns money for nothing).
write(`analyses/SAMEDAY_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
poolFile('SAMEDAY', 'f.pdf', -1)

// PART: alpha started and broke (specialist output, no synthesis) → `partial`, must run.
write(`analyses/PART_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')

// EMPTYSYN: a zero-byte synthesis is NOT a finished module (the engine's own non-empty test).
write(`analyses/EMPTYSYN_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '')

// FIN: already has a final thesis → nothing to complete.
write(`analyses/FIN_${TODAY}/alpha/99_alpha-synthesis.md`, '# a\n')
write(`analyses/FIN_${TODAY}/beta/99_beta-synthesis.md`, '# b\n')
write(`analyses/FIN_${TODAY}/final_thesis.md`, '# thesis\n')

const { thesisPlan, carryForwardModules, dataPoolNewest } = await import('../src/completion')

// ---- 1. cross-folder reuse: the money test -------------------------------------------------------
{
  const p = thesisPlan('ACME')
  assert.equal(p.targetRunRoot, `analyses/ACME_${TODAY}`, 'completion targets TODAY’s run root')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  const beta = p.modules.find((m) => m.module === 'beta')!

  assert.equal(alpha.state, 'done', 'alpha finished in an older folder → done')
  assert.equal(alpha.sourceRunRoot, `analyses/ACME_${YESTERDAY}`, 'plan names the folder the work came from')
  assert.equal(alpha.sourceDate, YESTERDAY, 'plan names the vintage')
  assert.equal(alpha.inTargetRoot, false, 'alpha is not in today’s root yet → must be carried')
  assert.equal(beta.state, 'missing')

  assert.deepEqual(p.reusable, ['alpha'], 'alpha has a finished synthesis → reusable')
  assert.deepEqual(p.reuse, ['alpha'], 'alpha is reused, never re-run')
  assert.deepEqual(p.run, ['beta'], 'only the genuinely missing module runs')
  assert.deepEqual(p.carry, [{ module: 'alpha', from: `analyses/ACME_${YESTERDAY}`, date: YESTERDAY }])
  assert.equal(p.master.state, 'blocked')
  assert.deepEqual(p.master.blockedBy, ['beta'])
  assert.equal(p.complete, false)
  assert.equal(p.canCarry, true)

  // The savings must be real, not cosmetic: completing costs strictly less than a naive full re-run.
  assert.ok(p.preflight.estCostUsdRange[1] < p.fullPreflight.estCostUsdRange[1], 'scoped cost < full re-run cost')
  assert.ok(p.preflight.agentCount < p.fullPreflight.agentCount, 'scoped agent count < full')
  console.log('✅ cross-folder reuse detected; only the missing module is priced')
}

// ---- 2. staleness demotes a finished module ------------------------------------------------------
{
  const p = thesisPlan('STALE')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'stale', 'pool gained a file after the run → stale')
  assert.match(alpha.staleReason!, /data pool gained a file/)
  assert.ok(!p.reuse.includes('alpha'), 'a stale module is NOT in the default reuse set')
  assert.ok(p.run.includes('alpha'), 'a stale module is re-run by default')
  assert.ok(p.reusable.includes('alpha'), 'but it IS reusable — staleness is a default, not a prohibition')
  assert.deepEqual(p.carry, [], 'nothing to carry by default — the stale module is rebuilt')
  console.log('✅ stale module demoted out of the default reuse set')
}

// ---- 2b. the caller may override the default reuse set (a knowingly-kept stale module) ------------
{
  // Untick "re-run" on a stale module → it is reused, carried, and no longer in the run set.
  const kept = thesisPlan('STALE', undefined, ['alpha'])
  assert.deepEqual(kept.reuse, ['alpha'])
  assert.deepEqual(kept.run, ['beta'], 'the knowingly-kept stale module drops out of the run set')
  assert.equal(kept.carry.length, 1, 'a kept stale module is carried like any other reused module')
  assert.ok(kept.preflight.agentCount < thesisPlan('STALE').preflight.agentCount, 'keeping it costs strictly less')

  // The reverse: tick "re-run" on a fresh module → it runs, nothing is carried.
  const redo = thesisPlan('ACME', undefined, [])
  assert.deepEqual(redo.reuse, [])
  assert.deepEqual(redo.run, ['alpha', 'beta'], 'reusing nothing runs everything')
  assert.deepEqual(redo.carry, [])

  // A caller can never reuse work that does not exist on disk.
  const bogus = thesisPlan('PART', undefined, ['alpha', 'beta', 'nonexistent'])
  assert.deepEqual(bogus.reuse, [], 'unfinished + unknown modules are dropped from an override')
  assert.deepEqual(bogus.run, ['alpha', 'beta'])
  console.log('✅ reuse set is caller-overridable, but never beyond what exists on disk')
}

// ---- 3. same-day tie is not flagged --------------------------------------------------------------
{
  const p = thesisPlan('SAMEDAY')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'done', 'same-day pool file does not prove the module missed it')
  assert.equal(alpha.staleReason, undefined)
  console.log('✅ same-day ambiguity does not trigger a paid re-run')
}

// ---- 4. partial + empty synthesis are never "done" -----------------------------------------------
{
  const part = thesisPlan('PART').modules.find((m) => m.module === 'alpha')!
  assert.equal(part.state, 'partial')
  assert.equal(part.doneAgents, 1)
  assert.ok(thesisPlan('PART').run.includes('alpha'))

  const empty = thesisPlan('EMPTYSYN').modules.find((m) => m.module === 'alpha')!
  assert.notEqual(empty.state, 'done', 'a zero-byte synthesis is not a finished module')
  console.log('✅ partial / zero-byte synthesis never counted as reusable')
}

// ---- 5. a completed run has nothing to complete --------------------------------------------------
{
  const p = thesisPlan('FIN')
  assert.equal(p.complete, true)
  assert.equal(p.finalReportPath, `analyses/FIN_${TODAY}/final_thesis.md`)
  assert.equal(p.master.state, 'done')
  console.log('✅ finished run reports complete')
}

// ---- 6. carry-forward: copies, stamps, never touches the source ----------------------------------
{
  const before = fs.readdirSync(path.join(REPO, `analyses/ACME_${YESTERDAY}/alpha`)).sort()
  const res = carryForwardModules('ACME', ['alpha'])
  assert.deepEqual(res.carried, [{ module: 'alpha', from: `analyses/ACME_${YESTERDAY}` }])

  const dst = path.join(REPO, `analyses/ACME_${TODAY}/alpha`)
  assert.ok(fs.existsSync(path.join(dst, '99_alpha-synthesis.md')), 'synthesis copied')
  assert.ok(fs.existsSync(path.join(dst, '01_alpha-thing.md')), 'specialist outputs copied')

  const note = fs.readFileSync(path.join(dst, 'CARRIED_FORWARD.md'), 'utf8')
  assert.match(note, /not re-run/i, 'the stamp says it was not re-run')
  assert.match(note, new RegExp(`analyses/ACME_${YESTERDAY}`), 'the stamp names the source run')
  assert.match(note, new RegExp(`run dated ${YESTERDAY}`), 'the stamp names the vintage')

  // the source folder is READ-ONLY to a carry: byte-for-byte untouched, no stamp written into it
  assert.deepEqual(fs.readdirSync(path.join(REPO, `analyses/ACME_${YESTERDAY}/alpha`)).sort(), before, 'prior-run folder untouched')

  // no temp folder survives an atomic carry
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/ACME_${TODAY}/.carry-alpha`)), 'temp staging dir removed')

  // The carried module now reads as `done` AND in-target → nothing left to carry, run set unchanged.
  const p = thesisPlan('ACME')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'done')
  assert.equal(alpha.inTargetRoot, true)
  assert.deepEqual(p.carry, [], 'already carried → nothing more to copy')
  assert.deepEqual(p.run, ['beta'], 'run set unchanged by the carry')
  console.log('✅ carry-forward copies + stamps, leaves prior-run folder untouched')
}

// ---- 7. carry is idempotent and never clobbers today's work --------------------------------------
{
  const dst = path.join(REPO, `analyses/ACME_${TODAY}/alpha/99_alpha-synthesis.md`)
  fs.writeFileSync(dst, '# EDITED IN PLACE\n')
  const res = carryForwardModules('ACME', ['alpha'])
  assert.deepEqual(res.carried, [], 'a second carry copies nothing')
  assert.deepEqual(res.skipped, ['alpha'])
  assert.equal(fs.readFileSync(dst, 'utf8'), '# EDITED IN PLACE\n', 'existing work in today’s root is never overwritten')
  console.log('✅ carry-forward is idempotent and non-destructive')
}

// ---- 8. a module that isn't finished can never be carried ----------------------------------------
{
  const res = carryForwardModules('PART', ['alpha'])
  assert.deepEqual(res.carried, [], 'a partial module is not carriable')
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/PART_${TODAY}/alpha`)), 'nothing was copied')
  console.log('✅ only finished, current modules can be carried')
}

// ---- 9. data pool freshness probe ----------------------------------------------------------------
{
  assert.equal(dataPoolNewest('STALE').files, 1)
  assert.equal(dataPoolNewest('STALE').newestDate, TODAY)
  assert.deepEqual(dataPoolNewest('NOSUCH'), { files: 0, newestDate: null }, 'no pool → no staleness signal')
  // With no pool at all, a finished module must still be reusable (absence of evidence is not staleness).
  write(`analyses/NOPOOL_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  assert.equal(thesisPlan('NOPOOL').modules.find((m) => m.module === 'alpha')!.state, 'done')
  console.log('✅ missing data pool never fabricates staleness')
}

// ---- 10. research pricing is unchanged by the swarm-aware generalization -------------------------
{
  // chainedResumePreflight now takes a swarmId. The research default must produce the SAME numbers the
  // launcher charges — reusing nothing has to reproduce the full-run band exactly, or the panel's headline
  // saving is fiction. Uses a fixture never carried into today's root (a carried module becomes `mustReuse`
  // and can no longer be un-reused, which is correct — and is what makes ACME unusable for this assertion).
  write(`analyses/PRICING_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  const none = thesisPlan('PRICING', undefined, [])
  assert.deepEqual(none.mustReuse, [], 'nothing is locked in today’s root')
  assert.deepEqual(none.run, ['alpha', 'beta'], 'reuse nothing ⇒ every module runs')
  assert.deepEqual(none.preflight.estCostUsdRange, none.fullPreflight.estCostUsdRange, 'reuse nothing ⇒ exactly the full-run cost')
  assert.deepEqual(none.preflight.estMinutesRange, none.fullPreflight.estMinutesRange, 'reuse nothing ⇒ exactly the full-run time')
  assert.equal(none.preflight.agentCount, none.fullPreflight.agentCount, 'reuse nothing ⇒ every orb runs')

  // …and reusing something must cost strictly less on every axis.
  const some = thesisPlan('PRICING')
  assert.deepEqual(some.reuse, ['alpha'])
  assert.ok(some.preflight.agentCount < some.fullPreflight.agentCount)
  assert.ok(some.preflight.estMinutesRange[1] < some.fullPreflight.estMinutesRange[1])
  assert.equal(some.swarm, 'research', 'the plan names its swarm so the client can match POSITIVELY on research')
  console.log('✅ scoped pricing reconciles with the full-run band at both extremes')
}

// ---- 11. a PARTIAL folder in the target root must not defeat the carry (the billing bug) ------------
{
  // yesterday: alpha finished.  today: alpha half-written by a run that broke — exactly the case this feature
  // exists for. The plan prices alpha as reused; if the carry declines because the folder "exists", the
  // launcher's skip-test fails and the user is CHARGED for a module the priced button called free.
  write(`analyses/PARTIALTGT_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/PARTIALTGT_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# finished\n')
  write(`analyses/PARTIALTGT_${TODAY}/alpha/01_alpha-thing.md`, '# partial junk from a broken run\n')

  const p = thesisPlan('PARTIALTGT')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'done', 'the finished copy in an older folder wins over the partial one')
  assert.equal(alpha.inTargetRoot, false)
  assert.ok(!p.mustReuse.includes('alpha'), 'a partial target folder does not lock the module')
  assert.deepEqual(p.reuse, ['alpha'])
  assert.equal(p.carry.length, 1, 'it must still be carried')

  carryForwardModules('PARTIALTGT', p.reuse)
  const synth = path.join(REPO, `analyses/PARTIALTGT_${TODAY}/alpha/99_alpha-synthesis.md`)
  assert.ok(fs.statSync(synth).size > 0, 'the launcher skip-predicate now passes — the module is genuinely reused')
  assert.match(fs.readFileSync(path.join(REPO, `analyses/PARTIALTGT_${TODAY}/alpha/CARRIED_FORWARD.md`), 'utf8'), /Replaced: an unfinished copy/, 'the stamp discloses that partial work was superseded')
  // and the source is still untouched
  assert.ok(fs.existsSync(path.join(REPO, `analyses/PARTIALTGT_${YESTERDAY}/alpha/99_alpha-synthesis.md`)))
  // no staging dir survives, anywhere
  assert.deepEqual(fs.readdirSync(path.join(REPO, 'analyses')).filter((f) => f.startsWith('.carry-')), [], 'staging dirs never linger in analyses/')
  assert.deepEqual(fs.readdirSync(path.join(REPO, `analyses/PARTIALTGT_${TODAY}`)).filter((f) => f.startsWith('.carry-')), [], 'and never inside the run root')
  console.log('✅ a partial folder in the target root is superseded, not silently skipped')
}

// ---- 12. a module finished IN the target root is locked (the launcher would skip it regardless) -----
{
  write(`analyses/LOCKED_${TODAY}/alpha/99_alpha-synthesis.md`, '# finished today\n')
  const p = thesisPlan('LOCKED')
  assert.deepEqual(p.mustReuse, ['alpha'], 'already in the target run root → cannot be rebuilt from here')
  assert.ok(p.reuse.includes('alpha'))
  assert.deepEqual(p.run, ['beta'])

  // Even an explicit "re-run alpha" (reuse=[]) cannot force it: the launcher skips a non-empty synthesis in
  // the run root, so promising a rebuild would strand alpha's orbs `queued` forever.
  const forced = thesisPlan('LOCKED', undefined, [])
  assert.ok(forced.reuse.includes('alpha'), 'mustReuse is folded back in — run set never lies')
  assert.deepEqual(forced.run, ['beta'])
  console.log('✅ a module already finished in the target run root is locked to reuse')
}

// ---- 13. a carried module keeps its TRUE vintage, and can go stale later -------------------------
{
  write(`analyses/VINTAGE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  poolFile('VINTAGE', 'old.pdf', -3)
  const before = thesisPlan('VINTAGE')
  assert.equal(before.modules.find((m) => m.module === 'alpha')!.state, 'done')
  carryForwardModules('VINTAGE', ['alpha'])

  // Carried into TODAY's folder. Its vintage must still read as YESTERDAY — otherwise a newer filing could
  // never stale it again, and its conclusions would be silently aged forward (§11).
  const after = thesisPlan('VINTAGE')
  const alpha = after.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.sourceDate, YESTERDAY, 'the stamp, not the folder name, is the vintage of record')
  assert.equal(alpha.sourceRunRoot, `analyses/VINTAGE_${YESTERDAY}`)
  assert.equal(alpha.inTargetRoot, true)
  assert.ok(after.mustReuse.includes('alpha'))

  // Now land a filing today: the carried module must be reported STALE, not silently "current".
  poolFile('VINTAGE', 'new.pdf', 0)
  const staled = thesisPlan('VINTAGE').modules.find((m) => m.module === 'alpha')!
  assert.equal(staled.state, 'stale', 'a carried module can still go stale against newer data')
  assert.match(staled.staleReason!, new RegExp(`ran ${YESTERDAY}`))
  console.log('✅ a carried module keeps its true vintage and can still go stale')
}

fs.rmSync(REPO, { recursive: true, force: true })
console.log('\nall completion tests passed')
