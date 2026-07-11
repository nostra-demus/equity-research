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

const { thesisPlan, carryForwardModules, dataPoolNewest, prepareModuleResume } = await import('../src/completion')

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
  assert.deepEqual(p.carry, [{ module: 'alpha', from: `analyses/ACME_${YESTERDAY}`, date: YESTERDAY, copyFrom: `analyses/ACME_${YESTERDAY}` }])
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

// ---- 13b. vintage is preserved even when the NEWEST candidate folder is ITSELF a carry (not the target) ---
{
  // The true origin: alpha genuinely ran two days ago.
  const TWO_DAYS_AGO = day(-2)
  write(`analyses/DBLCARRY_${TWO_DAYS_AGO}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/DBLCARRY_${TWO_DAYS_AGO}/alpha/99_alpha-synthesis.md`, '# alpha synthesis\n')

  // An intermediate folder (yesterday) that itself carried alpha forward from the two-days-ago run — the
  // shape a prior completion run would have left on disk. It is NOT today's target root.
  write(`analyses/DBLCARRY_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/DBLCARRY_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha synthesis\n')
  write(
    `analyses/DBLCARRY_${YESTERDAY}/alpha/CARRIED_FORWARD.md`,
    `<!-- carried-from: analyses/DBLCARRY_${TWO_DAYS_AGO} | run-date: ${TWO_DAYS_AGO} -->\n\n# Carried forward — alpha\n`,
  )
  poolFile('DBLCARRY', 'filing.pdf', -3) // older than even the true origin — nothing stale here

  // Planning TODAY, the newest folder holding alpha is YESTERDAY's — itself a carry, not the target root.
  // The vintage of record must still be the TRUE origin (two days ago), not yesterday's copy date.
  const p = thesisPlan('DBLCARRY')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.inTargetRoot, false, 'the newest folder holding alpha is not today’s target root')
  assert.equal(alpha.sourceDate, TWO_DAYS_AGO, 'vintage reads from the carry stamp even off the target root')
  assert.equal(alpha.sourceRunRoot, `analyses/DBLCARRY_${TWO_DAYS_AGO}`, 'provenance points at the TRUE origin run, not the intermediate copy')
  console.log('✅ a module carried through an intermediate folder keeps its true vintage, not the copy’s date')
}

// ---- 13c. a knowingly-kept STALE module's carry stamp discloses that, instead of claiming currency ------
{
  // 'STALE' (fixture at the top): alpha finished yesterday, but the pool gained a file TODAY. Carrying it
  // over is only reachable via an explicit override (a caller who ticks "Keep" on a stale row).
  const res = carryForwardModules('STALE', ['alpha'])
  assert.deepEqual(res.carried, [{ module: 'alpha', from: `analyses/STALE_${YESTERDAY}` }])

  const note = fs.readFileSync(path.join(REPO, `analyses/STALE_${TODAY}/alpha/CARRIED_FORWARD.md`), 'utf8')
  assert.match(note, /knowingly kept despite newer data/i, 'the stamp discloses the knowing stale keep')
  assert.doesNotMatch(note, /gained no newer file/i, 'the stamp must not falsely claim currency for a stale keep')
  console.log('✅ a knowingly-kept stale module’s stamp discloses the override, never claims false currency')
}

// ---- 13d. rebuilding an upstream module forces its reuse-eligible downstream modules to rebuild too -----
{
  // beta depends_on alpha (the fixture graph). Both finished together in an older folder — completely
  // reusable on their own. But asking to rebuild alpha (by NOT including it in the reuse override) must
  // also force beta to rebuild: beta's carried synthesis read the OLD alpha, and reusing it verbatim
  // alongside a freshly-rebuilt alpha would synthesize a thesis mixing evidence vintages.
  write(`analyses/CASCADE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha\n')
  write(`analyses/CASCADE_${YESTERDAY}/beta/99_beta-synthesis.md`, '# beta\n')
  poolFile('CASCADE', 'filing.pdf', -3) // older than the run — neither module is stale

  const base = thesisPlan('CASCADE')
  assert.deepEqual(base.reuse, ['alpha', 'beta'], 'sanity: both are reusable and reused by default')

  // The caller asks to keep ONLY beta — i.e. rebuild alpha.
  const cascaded = thesisPlan('CASCADE', undefined, ['beta'])
  assert.ok(!cascaded.reuse.includes('beta'), 'beta is forced back into the run set — its upstream is rebuilding')
  assert.deepEqual(cascaded.run.sort(), ['alpha', 'beta'], 'both alpha (chosen) and beta (cascaded) run')
  console.log('✅ rebuilding an upstream module cascades the rebuild to its reuse-eligible descendants')
}

// ---- 13e. carrying a module copies from where the bytes actually live, not the stamped true origin ------
{
  // Same shape as 13b (an intermediate folder that is itself a carried-forward copy), but this time the
  // TRUE origin folder is GONE by the time we plan/carry — only the intermediate copy still exists on
  // disk. The copy step must read from the intermediate (proven to exist), while the stamp it writes
  // still records the deep true origin as the vintage of record.
  const TRUE_ORIGIN = day(-2)
  // NOTE: the true-origin folder is deliberately never written — it no longer exists on disk.
  write(`analyses/PRUNEDORIGIN_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/PRUNEDORIGIN_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha synthesis\n')
  write(
    `analyses/PRUNEDORIGIN_${YESTERDAY}/alpha/CARRIED_FORWARD.md`,
    `<!-- carried-from: analyses/PRUNEDORIGIN_${TRUE_ORIGIN} | run-date: ${TRUE_ORIGIN} -->\n\n# Carried forward — alpha\n`,
  )
  poolFile('PRUNEDORIGIN', 'filing.pdf', -3)

  const p = thesisPlan('PRUNEDORIGIN')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.sourceRunRoot, `analyses/PRUNEDORIGIN_${TRUE_ORIGIN}`, 'plan still reports the true (pruned) origin as provenance')
  assert.equal(p.carry.length, 1)
  assert.equal(p.carry[0].from, `analyses/PRUNEDORIGIN_${TRUE_ORIGIN}`, 'the stamp-facing "from" stays the true origin')

  // Must not throw ENOENT: the copy reads from the intermediate folder, which genuinely exists.
  const res = carryForwardModules('PRUNEDORIGIN', ['alpha'])
  assert.deepEqual(res.carried, [{ module: 'alpha', from: `analyses/PRUNEDORIGIN_${TRUE_ORIGIN}` }])
  const dst = path.join(REPO, `analyses/PRUNEDORIGIN_${TODAY}/alpha`)
  assert.ok(fs.statSync(path.join(dst, '99_alpha-synthesis.md')).size > 0, 'copied successfully from the surviving intermediate folder')
  const note = fs.readFileSync(path.join(dst, 'CARRIED_FORWARD.md'), 'utf8')
  assert.match(note, new RegExp(`carried-from: analyses/PRUNEDORIGIN_${TRUE_ORIGIN}`), 'the new stamp still names the TRUE origin, not the intermediate copy')
  console.log('✅ carrying a module copies from the surviving folder while the stamp keeps the true origin')
}

// ---- 14. a subject can never steer a path out of its tree ----------------------------------------
{
  // `TICKER_RE` admits `.` and `-`, so the regex alone is not a path barrier. Every path in this module is
  // built from `safeSubjectSegment`, which proves the name is ONE segment with no separator or traversal.
  const hostile = ['..', '.', '../..', 'A/../../etc', 'A/B', '..\\..', '']
  for (const bad of hostile) {
    assert.throws(() => thesisPlan(bad), /bad subject/, `thesisPlan must reject ${JSON.stringify(bad)}`)
    assert.throws(() => carryForwardModules(bad, ['alpha']), /bad subject/, `carryForwardModules must reject ${JSON.stringify(bad)}`)
    assert.throws(() => dataPoolNewest(bad), /bad subject/, `dataPoolNewest must reject ${JSON.stringify(bad)}`)
  }
  // …while a real symbol with legal punctuation still works (Indian/NSE style).
  write(`analyses/RELIANCE.NS_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  const ok = thesisPlan('RELIANCE.NS')
  assert.equal(ok.subject, 'RELIANCE.NS')
  assert.deepEqual(ok.reuse, ['alpha'], 'a dotted symbol is a normal subject, not a traversal')
  console.log('✅ hostile subjects are rejected; legal dotted symbols still work')
}

// ---- 15. runnable / blockedBy: a Run row's pill is only pressable when its upstream is reused, not running -
{
  // RUNOK: alpha finished yesterday (reused ancestor), beta partial today's-older-folder (runs, no blocker).
  write(`analyses/RUNOK_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  write(`analyses/RUNOK_${YESTERDAY}/beta/01_beta-thing.md`, '# b\n')
  poolFile('RUNOK', 'f.pdf', -3)
  const p = thesisPlan('RUNOK')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  const beta = p.modules.find((m) => m.module === 'beta')!
  assert.deepEqual(p.reuse, ['alpha'])
  assert.deepEqual(p.run, ['beta'])
  assert.deepEqual(beta.blockedBy, [], 'beta’s only ancestor (alpha) is reused, not running → not blocked')
  assert.equal(beta.runnable, true, 'a partial whose upstream is reused is runnable on its own')
  assert.equal(alpha.runnable, false, 'a reused module is never runnable')

  // BLK: alpha missing (runs), beta partial (runs). beta waits on alpha.
  write(`analyses/BLK_${YESTERDAY}/beta/01_beta-thing.md`, '# b\n')
  poolFile('BLK', 'f.pdf', -3)
  const q = thesisPlan('BLK')
  const qa = q.modules.find((m) => m.module === 'alpha')!
  const qb = q.modules.find((m) => m.module === 'beta')!
  assert.deepEqual(q.run.sort(), ['alpha', 'beta'])
  assert.equal(qa.runnable, true, 'a missing module with no ancestors is runnable')
  assert.deepEqual(qb.blockedBy, ['alpha'], 'beta’s ancestor alpha is itself in the run set → blocked')
  assert.equal(qb.runnable, false, 'a module whose upstream is still to run cannot be launched alone')
  console.log('✅ runnable/blockedBy gates the RUN pill on upstream being reused, not running')
}

// ---- 16. willRunAgents + validAgentOutputs: the count is orbs that RUN, not files on disk -----------------
{
  // VALID: beta partial with one VALID orb (has a header) + one EMPTY orb (Step 4A would re-dispatch it).
  write(`analyses/VALID_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  write(`analyses/VALID_${YESTERDAY}/beta/01_beta-thing.md`, '# real orb\n')
  write(`analyses/VALID_${YESTERDAY}/beta/02_beta-extra.md`, '') // empty → NOT a finished orb
  poolFile('VALID', 'f.pdf', -3)
  const beta = thesisPlan('VALID').modules.find((m) => m.module === 'beta')!
  assert.equal(beta.state, 'partial')
  assert.equal(beta.doneAgents, 1, 'the empty orb is not counted as done (validity-checked, not filename-counted)')
  assert.equal(beta.totalAgents, 2, 'graph agent count (specialist + synthesis)')
  assert.equal(beta.willRunAgents, 1, 'resumable partial runs total − valid-done = 2 − 1')

  // ALLEMPTY: a folder whose only orb is empty is NOT a partial to resume — it reads as missing (run whole).
  write(`analyses/ALLEMPTY_${YESTERDAY}/beta/01_beta-thing.md`, '')
  poolFile('ALLEMPTY', 'f.pdf', -3)
  const eb = thesisPlan('ALLEMPTY').modules.find((m) => m.module === 'beta')!
  assert.equal(eb.state, 'missing', 'no valid orb on disk → nothing to resume, reads as missing')
  assert.equal(eb.willRunAgents, 2, 'a missing module runs every orb')
  console.log('✅ willRunAgents/validAgentOutputs count orbs that actually run, never empty files')
}

// ---- 17. prepareModuleResume: carries reused ancestors + resumes the module’s own orbs -------------------
{
  // RESUME: alpha done yesterday (reused ancestor of beta); beta partial yesterday with one valid orb.
  write(`analyses/RESUME_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/RESUME_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha synthesis\n')
  write(`analyses/RESUME_${YESTERDAY}/beta/01_beta-thing.md`, '# beta orb one\n')
  poolFile('RESUME', 'f.pdf', -3)

  const plan = thesisPlan('RESUME')
  assert.deepEqual(plan.reuse, ['alpha'])
  assert.deepEqual(plan.run, ['beta'])
  const beta = plan.modules.find((m) => m.module === 'beta')!
  assert.equal(beta.runnable, true)

  const res = prepareModuleResume('RESUME', 'beta', undefined, plan)
  assert.deepEqual(res.carriedAncestors, [{ module: 'alpha', from: `analyses/RESUME_${YESTERDAY}` }], 'the reused ancestor alpha is carried into today’s root')
  assert.equal(res.resumedFrom, `analyses/RESUME_${YESTERDAY}`, 'the module’s orbs are resumed from the older folder')
  assert.deepEqual(res.doneOrbKeys, ['beta/01_beta-thing'], 'the finished orb is reported as a node key so the cockpit shows it done')
  assert.equal(res.willRunAgents, 1, 'total 2 orbs − 1 resumed = 1 orb still to run (the synthesis)')

  // alpha (ancestor) carried in with a CARRIED_FORWARD stamp
  assert.ok(fs.existsSync(path.join(REPO, `analyses/RESUME_${TODAY}/alpha/99_alpha-synthesis.md`)), 'ancestor synthesis is present in the target root')
  assert.match(fs.readFileSync(path.join(REPO, `analyses/RESUME_${TODAY}/alpha/CARRIED_FORWARD.md`), 'utf8'), /not re-run/i)
  // beta’s orb carried in under a RESUMED_FROM stamp — a DIFFERENT marker, so it never dates the module
  const betaDst = path.join(REPO, `analyses/RESUME_${TODAY}/beta`)
  assert.ok(fs.existsSync(path.join(betaDst, '01_beta-thing.md')), 'the finished orb is copied into today’s root so Step 4A skips it')
  const stamp = fs.readFileSync(path.join(betaDst, 'RESUMED_FROM.md'), 'utf8')
  assert.match(stamp, new RegExp(`resumed-from: analyses/RESUME_${YESTERDAY} \\| run-date: ${YESTERDAY}`), 'the resume stamp records the TRUE origin, machine-readably')
  assert.doesNotMatch(stamp, /carried-from:/, 'the resume stamp must NOT use the carry key (carriedVintage would back-date the whole module)')
  assert.doesNotMatch(stamp, /^Agent:/m, 'no stray Agent: line (eval check H)')
  // the source folder is byte-for-byte untouched — no stamp leaks into it
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/RESUME_${YESTERDAY}/beta/RESUMED_FROM.md`)), 'the source run folder is never written to')
  console.log('✅ prepareModuleResume carries ancestors + resumes the module’s orbs under a distinct stamp')
}

// ---- 17b. resumedVintage: a resumed orb keeps its true vintage and can still go stale --------------------
{
  const TWO_AGO = day(-2)
  // beta resumed INTO today's root from a two-days-ago run (RESUMED_FROM stamp), and data landed TODAY.
  write(`analyses/RVINT_${TODAY}/alpha/99_alpha-synthesis.md`, '# a\n') // alpha finished today → mustReuse, unblocks beta
  write(`analyses/RVINT_${TODAY}/beta/01_beta-thing.md`, '# b\n')
  write(`analyses/RVINT_${TODAY}/beta/RESUMED_FROM.md`, `<!-- resumed-from: analyses/RVINT_${TWO_AGO} | run-date: ${TWO_AGO} -->\n\n# Resumed — beta\n`)
  poolFile('RVINT', 'new.pdf', 0)
  const beta = thesisPlan('RVINT').modules.find((m) => m.module === 'beta')!
  assert.equal(beta.sourceDate, TWO_AGO, 'the resume stamp, not the folder name, dates the orbs')
  assert.equal(beta.state, 'partial')
  assert.ok(beta.staleReason, 'orbs resumed from two days ago are stale against a file that landed today')
  assert.equal(beta.willRunAgents, beta.totalAgents, 'a stale partial runs every orb, never a resume')
  console.log('✅ a resumed orb keeps its true vintage, so it can still be caught stale (no laundering)')
}

// ---- 18. prepareModuleResume carries ANCESTORS ONLY — never a reused non-ancestor ------------------------
{
  // ANCONLY: beta finished yesterday (reused), alpha missing (runs). alpha has NO ancestors, so running it
  // must carry nothing — beta is reused but is a DESCENDANT, and carrying it would wrongly lock it in.
  write(`analyses/ANCONLY_${YESTERDAY}/beta/99_beta-synthesis.md`, '# b\n')
  poolFile('ANCONLY', 'f.pdf', -3)
  const plan = thesisPlan('ANCONLY')
  assert.deepEqual(plan.reuse, ['beta'], 'beta is reused')
  assert.ok(plan.run.includes('alpha'), 'alpha is missing → runs')
  const res = prepareModuleResume('ANCONLY', 'alpha', undefined, plan)
  assert.deepEqual(res.carriedAncestors, [], 'alpha has no ancestors → nothing is carried')
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/ANCONLY_${TODAY}/beta`)), 'the reused DESCENDANT beta must NOT be carried into the target root')
  console.log('✅ prepareModuleResume carries only ancestors, never a reused non-ancestor')
}

// ---- 19. prepareModuleResume runs a STALE partial CLEAN, clearing its orbs from today’s root -------------
{
  const TWO_AGO = day(-2)
  // STCLEAN: alpha finished today (mustReuse, unblocks beta). beta was resumed into today's root from two
  // days ago, and data landed today → stale. Running beta must DISCARD its today-root orbs and run whole.
  write(`analyses/STCLEAN_${TODAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  write(`analyses/STCLEAN_${TODAY}/beta/01_beta-thing.md`, '# stale orb\n')
  write(`analyses/STCLEAN_${TODAY}/beta/RESUMED_FROM.md`, `<!-- resumed-from: analyses/STCLEAN_${TWO_AGO} | run-date: ${TWO_AGO} -->\n\n# Resumed — beta\n`)
  poolFile('STCLEAN', 'new.pdf', 0)

  const plan = thesisPlan('STCLEAN')
  const beta = plan.modules.find((m) => m.module === 'beta')!
  assert.equal(beta.state, 'partial')
  assert.ok(beta.staleReason, 'beta is a stale partial (resumed two days ago, data today)')
  assert.equal(beta.inTargetRoot, true)
  assert.deepEqual(beta.blockedBy, [], 'alpha is finished in today’s root (mustReuse) → beta is not blocked')
  assert.ok(plan.run.includes('beta'))

  const res = prepareModuleResume('STCLEAN', 'beta', undefined, plan)
  assert.equal(res.discardedStaleOrbs, true, 'the stale orbs in today’s root were cleared')
  assert.equal(res.resumedFrom, null, 'a stale module is NOT resumed')
  assert.deepEqual(res.doneOrbKeys, [], 'no orb is reported done — the module runs clean')
  assert.equal(res.willRunAgents, beta.totalAgents, 'every orb runs')
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/STCLEAN_${TODAY}/beta`)), 'beta’s stale orb folder is gone — the launcher will run it from scratch')
  console.log('✅ a stale partial is run clean: its target-root orbs are cleared, nothing resumed')
}

fs.rmSync(REPO, { recursive: true, force: true })
console.log('\nall completion tests passed')
