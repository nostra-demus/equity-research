// thesisPlan() + carryForwardModules() — the "Complete the thesis" reuse contract.
//
// The whole point of this feature is that the user must NOT pay twice for work already on disk, even when
// that work sits in an OLDER dated run folder than the one a completion would write into. These tests pin
// exactly that: cross-folder reuse is detected, staleness demotes a finished module out of the reuse set,
// the carry is atomic + idempotent + non-destructive, and a prior-run folder is never written to.
// Isolated in a temp repo so a fake 2-module research graph drives it. Run: npx tsx test/completion.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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
write('.claude/agents/alpha/99_alpha-synthesis.md', fm('alpha-synthesis', 99, 'depends_on: []\n')
  + '\nEmit the synthesis-owned sidecar `alpha_declared.json`.\n')
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
write(`analyses/SAMEDAY_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
write(`analyses/SAMEDAY_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
poolFile('SAMEDAY', 'f.pdf', -1)

// PART: alpha started and broke (specialist output, no synthesis) → `partial`, must run.
write(`analyses/PART_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')

// EMPTYSYN: a zero-byte synthesis is NOT a finished module (the engine's own non-empty test).
write(`analyses/EMPTYSYN_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '')

// FIN: already has a final thesis → nothing to complete.
write(`analyses/FIN_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
write(`analyses/FIN_${TODAY}/alpha/99_alpha-synthesis.md`, '# a\n')
write(`analyses/FIN_${TODAY}/beta/01_beta-thing.md`, '# b\n')
write(`analyses/FIN_${TODAY}/beta/99_beta-synthesis.md`, '# b\n')
write(`analyses/FIN_${TODAY}/final_thesis.md`, '# thesis\n')

const {
  capturePreparedModuleResumeScope, continuationPlanReceiptMatches, thesisPlan, thesisPlanForRequest,
  carryForwardModules, dataPoolNewest, prepareExactModuleContinuationPrivately, prepareFullContinuation,
  legacySingleRunMigrationPlan, prepareModuleResume, prepareThesisPlanPrivately,
} = await import('../src/completion')
const { buildSwarmGraph } = await import('../src/roster')

function exactScope(runRoot: string) {
  const generationDigest = 'a'.repeat(64)
  const root = path.join(REPO, runRoot)
  const reusableArtifacts: {
    output_rel: string; sha256: string; generation_digest: string; attempt_id: string
  }[] = []
  const visit = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(absolute)
      else if (entry.isFile() && entry.name.endsWith('.md')) reusableArtifacts.push({
        output_rel: path.relative(root, absolute).split(path.sep).join('/'),
        sha256: `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}`,
        generation_digest: generationDigest,
        attempt_id: 'fixture-attempt',
      })
    }
  }
  visit(root)
  return {
    continuationRunRoot: runRoot,
    frozenGeneration: {
      generationDigest, fileCount: 1, newestMs: 1,
      verifiedLineageDigest: `sha256:${'b'.repeat(64)}`,
      reusableArtifacts,
    },
  }
}

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

  // Savings are proven by exact payable scope. With no comparable completed subset in this isolated
  // fixture, the engine must refuse an invented cost band instead of scaling a full-run guess.
  assert.equal(p.preflight.estimateEvidence.source, 'unavailable')
  assert.deepEqual(p.preflight.estCostUsdRange, [0, 0])
  assert.deepEqual(p.preflight.estMinutesRange, [0, 0])
  assert.ok(p.preflight.agentCount < p.fullPreflight.agentCount, 'scoped agent count < full')
  console.log('✅ cross-folder reuse detected; only the missing module is payable, with no invented estimate')
}

// ---- 1b. the continuation receipt binds artifacts, data, provider/profile, and exact work ------------
{
  const selection = {
    provider: 'claude' as const, model: 'sonnet', reasoningLevel: 'default',
    expectedProfileKey: 'claude:sonnet:default',
  }
  const reviewed = thesisPlan('ACME', undefined, undefined, undefined, selection)
  const requestSafe = await thesisPlanForRequest('ACME', undefined, undefined, undefined, selection)
  assert.equal(requestSafe.continuationReceipt.fingerprint, reviewed.continuationReceipt.fingerprint,
    'async request hashing produces the same exact receipt as the deterministic planner')
  assert.equal(reviewed.continuationReceipt.action, 'complete')
  assert.deepEqual(reviewed.continuationReceipt.sourceRunRoots, [`analyses/ACME_${YESTERDAY}`])
  assert.ok(reviewed.continuationReceipt.reusableOrbKeys.includes('alpha/01_alpha-thing'))
  assert.ok(reviewed.continuationReceipt.payableOrbKeys.includes('beta/01_beta-thing'))
  assert.ok(reviewed.continuationReceipt.payableOrbKeys.includes('master/synthesizer'))
  assert.equal(continuationPlanReceiptMatches(reviewed.continuationReceipt, reviewed.continuationReceipt), true)

  const source = path.join(REPO, `analyses/ACME_${YESTERDAY}/alpha/operator-note.txt`)
  fs.writeFileSync(source, 'changed source scope\n')
  const sourceChanged = thesisPlan('ACME', undefined, undefined, undefined, selection)
  assert.notEqual(sourceChanged.continuationReceipt.fingerprint, reviewed.continuationReceipt.fingerprint,
    'changing a reusable source artifact invalidates the reviewed receipt')
  fs.unlinkSync(source)

  const data = path.join(REPO, 'data/ACME/filing.pdf')
  const dataBefore = fs.readFileSync(data)
  const dataTimes = fs.statSync(data)
  fs.writeFileSync(data, 'different bytes')
  const dataChanged = thesisPlan('ACME', undefined, undefined, undefined, selection)
  assert.notEqual(dataChanged.continuationReceipt.dataPool.sha256, reviewed.continuationReceipt.dataPool.sha256,
    'the pool snapshot binds bytes, not file count alone')
  fs.writeFileSync(data, dataBefore)
  fs.utimesSync(data, dataTimes.atime, dataTimes.mtime)

  const profileChanged = thesisPlan('ACME', undefined, undefined, undefined, {
    provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
    expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  })
  assert.notEqual(profileChanged.continuationReceipt.fingerprint, reviewed.continuationReceipt.fingerprint)
  console.log('✅ receipt binds exact roots, artifacts, pool bytes, work identities, and provider profile')
}

// ---- 1c. partial-only reuse names every physical source root --------------------------------------
{
  const root = `analyses/PARTSRC_${YESTERDAY}`
  write(`${root}/beta/01_beta-thing.md`, '# reusable partial beta\n')
  poolFile('PARTSRC', 'filing.pdf', -3)
  const plan = thesisPlan('PARTSRC')
  assert.deepEqual(plan.modules.find((entry) => entry.module === 'beta')?.doneOrbKeys, ['beta/01_beta-thing'])
  assert.deepEqual(plan.continuationReceipt.sourceRunRoots, [root],
    'a generic completion cannot hide the old physical root supplying a reused partial orb')
  assert.equal(plan.continuationReceipt.action, 'complete')
  console.log('✅ partial-orb source roots are bound so generic completion must choose one exact saved run')
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
  const sourceOrbMtime = fs.statSync(path.join(REPO, `analyses/ACME_${YESTERDAY}/alpha/01_alpha-thing.md`)).mtimeMs
  const res = carryForwardModules('ACME', ['alpha'])
  assert.deepEqual(res.carried, [{ module: 'alpha', from: `analyses/ACME_${YESTERDAY}` }])

  const dst = path.join(REPO, `analyses/ACME_${TODAY}/alpha`)
  assert.ok(fs.existsSync(path.join(dst, '99_alpha-synthesis.md')), 'synthesis copied')
  assert.ok(fs.existsSync(path.join(dst, '01_alpha-thing.md')), 'specialist outputs copied')
  assert.ok(Math.abs(fs.statSync(path.join(dst, '01_alpha-thing.md')).mtimeMs - sourceOrbMtime) < 2,
    'carry preserves specialist mtimes so dependency freshness is not rewritten by staging')

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
  assert.ok(dataPoolNewest('STALE').newestMs > 0, 'a pooled file exposes its raw newest mtime')
  assert.deepEqual(dataPoolNewest('NOSUCH'), { files: 0, newestDate: null, newestMs: 0 }, 'no pool → no staleness signal')

  // newestMs must be the RECURSIVE max over max(mtime, ctime): a doc nested deep under external/<prov>/…
  // (where the real delta usually lands, past the old depth-6 cap) must still register. A single-file pool
  // can't catch a max-vs-assign or a depth-truncation bug. Timestamps come from real creation order, not
  // fs.utimesSync — utimes sets ctime to NOW, so max(mtime, ctime) would ignore a backdated mtime anyway.
  const deepRel = 'data/NESTED/external/a/b/c/d/e/f/g/deep.pdf' // deep.pdf sits at walk depth 9 (> the old cap 6)
  write('data/NESTED/flat.txt', 'top level, created first')
  write(deepRel, 'nested past the old depth-6 cap, created last')
  const flatSt = fs.statSync(path.join(REPO, 'data/NESTED/flat.txt'))
  const deepSt = fs.statSync(path.join(REPO, deepRel))
  const expectedMax = Math.max(flatSt.mtimeMs, flatSt.ctimeMs, deepSt.mtimeMs, deepSt.ctimeMs)
  const nested = dataPoolNewest('NESTED')
  assert.equal(nested.files, 2, 'both files counted — INCLUDING the one nested past the old depth-6 cap (guards the 6→24 raise)')
  assert.equal(nested.newestMs, expectedMax, 'newestMs is the recursive max over max(mtime, ctime) across the whole tree')

  // The engine writes its own memos back into the Drive pool under a sentinel. They are not evidence and
  // must not make a module look stale merely because its own prior-run summary was written a day later.
  poolFile('OUTPUTONLY', 'filing.pdf', -1)
  write('data/OUTPUTONLY/Memos 2099-01-01/.nostradamus_output', 'engine output')
  write('data/OUTPUTONLY/Memos 2099-01-01/thesis.md', '# generated memo\n')
  write(`analyses/OUTPUTONLY_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/OUTPUTONLY_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  const outputOnly = dataPoolNewest('OUTPUTONLY')
  assert.equal(outputOnly.files, 1, 'sentinel-marked engine output contributes zero pool files')
  assert.equal(outputOnly.newestDate, YESTERDAY, 'engine output cannot advance the evidence freshness date')
  assert.equal(thesisPlan('OUTPUTONLY').modules.find((m) => m.module === 'alpha')!.state, 'done')
  // With no pool at all, a finished module must still be reusable (absence of evidence is not staleness).
  write(`analyses/NOPOOL_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
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
  write(`analyses/PRICING_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/PRICING_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  const none = thesisPlan('PRICING', undefined, [])
  assert.deepEqual(none.mustReuse, [], 'nothing is locked in today’s root')
  assert.deepEqual(none.run, ['alpha', 'beta'], 'reuse nothing ⇒ every module runs')
  assert.deepEqual(none.preflight.estCostUsdRange, none.fullPreflight.estCostUsdRange, 'reuse nothing ⇒ exactly the full-run cost')
  assert.deepEqual(none.preflight.estMinutesRange, none.fullPreflight.estMinutesRange, 'reuse nothing ⇒ exactly the full-run time')
  assert.equal(none.preflight.agentCount, none.fullPreflight.agentCount, 'reuse nothing ⇒ every orb runs')

  // …and reusing something narrows the exact payable scope. A partial dependency graph is not linearly
  // comparable to a full run, so the estimate remains unavailable until real matching history exists.
  const some = thesisPlan('PRICING')
  assert.deepEqual(some.reuse, ['alpha'])
  assert.ok(some.preflight.agentCount < some.fullPreflight.agentCount)
  assert.equal(some.preflight.estimateEvidence.source, 'unavailable')
  assert.deepEqual(some.preflight.estMinutesRange, [0, 0])
  assert.equal(some.swarm, 'research', 'the plan names its swarm so the client can match POSITIVELY on research')
  console.log('✅ scoped pricing uses exact orb counts and withholds unsupported partial-run bands')
}

// ---- 11. newer target-root specialist work refreshes only the synthesis -----------------------------
{
  // Yesterday alpha finished. Today the user manually reran its specialist, then stopped before synthesis.
  // Discarding today's valid, paid-for output in favour of yesterday's old 99 would lose progress and leave
  // the old synthesis inconsistent with the newer orb. Keep the specialist and scope only 99 to run.
  write(`analyses/PARTIALTGT_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/PARTIALTGT_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# finished\n')
  const newerOrb = path.join(REPO, `analyses/PARTIALTGT_${TODAY}/alpha/01_alpha-thing.md`)
  write(`analyses/PARTIALTGT_${TODAY}/alpha/01_alpha-thing.md`, '# newer manual specialist run\n')
  const newerTime = new Date(Date.now() + 2_000)
  fs.utimesSync(newerOrb, newerTime, newerTime)

  const p = thesisPlan('PARTIALTGT')
  const alpha = p.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'partial', 'a specialist newer than 99 forces synthesis refresh')
  assert.equal(alpha.inTargetRoot, true)
  assert.deepEqual(alpha.doneOrbKeys, ['alpha/01_alpha-thing'])
  assert.equal(alpha.willRunAgents, 1, 'only the synthesis remains')
  assert.ok(!p.mustReuse.includes('alpha'), 'the old 99 cannot lock the module')
  assert.deepEqual(p.reuse, [])
  assert.equal(p.carry.length, 0)

  const resumed = prepareModuleResume('PARTIALTGT', 'alpha', undefined, p)
  assert.deepEqual(resumed.doneOrbKeys, ['alpha/01_alpha-thing'])
  assert.equal(resumed.willRunAgents, 1)
  const synth = path.join(REPO, `analyses/PARTIALTGT_${TODAY}/alpha/99_alpha-synthesis.md`)
  assert.ok(!fs.existsSync(synth), 'old synthesis is removed so the module pipeline runs 99')
  assert.equal(fs.readFileSync(newerOrb, 'utf8'), '# newer manual specialist run\n', 'today’s newer specialist survives staging')
  // The older finished source is still untouched.
  assert.ok(fs.existsSync(path.join(REPO, `analyses/PARTIALTGT_${YESTERDAY}/alpha/99_alpha-synthesis.md`)))
  assert.deepEqual(fs.readdirSync(path.join(REPO, 'analyses')).filter((f) => f.startsWith('.resume-')), [], 'staging dirs never linger in analyses/')
  console.log('✅ a newer manual specialist run is preserved and only synthesis is refreshed')
}

// ---- 12. a module finished IN the target root is locked (the launcher would skip it regardless) -----
{
  write(`analyses/LOCKED_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
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
  write(`analyses/VINTAGE_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
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
  write(`analyses/CASCADE_${YESTERDAY}/alpha/01_alpha-thing.md`, '# alpha\n')
  write(`analyses/CASCADE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha\n')
  write(`analyses/CASCADE_${YESTERDAY}/beta/01_beta-thing.md`, '# beta\n')
  write(`analyses/CASCADE_${YESTERDAY}/beta/99_beta-synthesis.md`, '# beta\n')
  poolFile('CASCADE', 'filing.pdf', -3) // older than the run — neither module is stale

  const base = thesisPlan('CASCADE')
  assert.deepEqual(base.reuse, ['alpha', 'beta'], 'sanity: both are reusable and reused by default')

  // The caller asks to keep ONLY beta — i.e. rebuild alpha.
  const cascaded = thesisPlan('CASCADE', undefined, ['beta'])
  assert.ok(!cascaded.reuse.includes('beta'), 'beta is forced back into the run set — its upstream is rebuilding')
  assert.deepEqual(cascaded.run.sort(), ['alpha', 'beta'], 'both alpha (chosen) and beta (cascaded) run')
  const beta = cascaded.modules.find((entry) => entry.module === 'beta')!
  assert.deepEqual(beta.doneOrbKeys, [], 'a forced descendant cannot presence-skip specialists built against the old upstream')
  assert.equal(beta.doneAgents, 0)
  assert.equal(beta.willRunAgents, beta.totalAgents)
  assert.ok(cascaded.continuationReceipt.payableOrbKeys.includes('beta/01_beta-thing'))
  assert.ok(cascaded.continuationReceipt.payableOrbKeys.includes('beta/99_beta-synthesis'))
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

// ---- 13f. a physically-new carry cannot hide a genuinely fresher prior-folder partial -----------------
{
  const TWO_AGO = day(-2)
  // Today's folder contains a whole-module carry whose stamp proves the work is two days old. Yesterday's
  // folder contains a specialist that read yesterday's pool. Physical index order says "today first"; true
  // evidence vintage says the partial is newer and must be resumed instead of discarded for a clean rerun.
  write(`analyses/FRESHPART_${TODAY}/alpha/01_alpha-thing.md`, '# stale carried specialist\n')
  write(`analyses/FRESHPART_${TODAY}/alpha/99_alpha-synthesis.md`, '# stale carried synthesis\n')
  write(
    `analyses/FRESHPART_${TODAY}/alpha/CARRIED_FORWARD.md`,
    `<!-- carried-from: analyses/FRESHPART_${TWO_AGO} | run-date: ${TWO_AGO} -->\n\n# Carried forward — alpha\n`,
  )
  write(`analyses/FRESHPART_${YESTERDAY}/alpha/01_alpha-thing.md`, '# genuinely fresher partial\n')
  poolFile('FRESHPART', 'yesterday.pdf', -1)

  const plan = thesisPlan('FRESHPART')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'partial', 'the non-stale partial supersedes the stale carried synthesis')
  assert.equal(alpha.staleReason, undefined, 'fresh partial work is not mislabeled with the carry’s stale date')
  assert.deepEqual(alpha.doneOrbKeys, ['alpha/01_alpha-thing'])
  assert.equal(alpha.willRunAgents, 1, 'only the fresh synthesis runs; the fresher paid specialist survives')
  const staged = prepareModuleResume('FRESHPART', 'alpha', undefined, plan)
  assert.deepEqual(staged.doneOrbKeys, ['alpha/01_alpha-thing'])
  assert.equal(
    fs.readFileSync(path.join(REPO, `analyses/FRESHPART_${TODAY}/alpha/01_alpha-thing.md`), 'utf8'),
    '# genuinely fresher partial\n',
    'staging selects the true-newer partial rather than the physically-newer stale carry',
  )
  console.log('✅ a fresher partial supersedes a physically newer stale carry by true vintage')
}

// ---- 13g. interrupted directory swaps recover target-only paid work before the next plan ----------------
{
  write(`analyses/SWAPREC_${YESTERDAY}/alpha/01_alpha-thing.md`, '# paid partial\n')
  poolFile('SWAPREC', 'filing.pdf', -3)
  const initial = thesisPlan('SWAPREC')
  prepareModuleResume('SWAPREC', 'alpha', undefined, initial)
  const target = path.join(REPO, `analyses/SWAPREC_${TODAY}/alpha`)
  const backup = path.join(REPO, `analyses/.resume-backup-SWAPREC_${TODAY}-alpha`)
  fs.renameSync(target, backup) // exact hard-stop shape: old target moved, staged temp not installed

  const recovered = thesisPlan('SWAPREC')
  assert.ok(fs.existsSync(target), 'planning restores the canonical target before candidate discovery')
  assert.ok(!fs.existsSync(backup), 'the crash backup is consumed after recovery')
  assert.deepEqual(recovered.modules.find((m) => m.module === 'alpha')!.doneOrbKeys, ['alpha/01_alpha-thing'])
  console.log('✅ an interrupted resume swap restores target-only paid work before retry planning')
}

// ---- 13h. descendant symlinks are never dereferenced into a carried/published module --------------------
{
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'completion-descendant-link-'))
  const secret = path.join(outside, 'outside.txt')
  fs.writeFileSync(secret, 'outside bytes must not be imported\n')
  write(`analyses/DESCLINK_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/DESCLINK_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  fs.symlinkSync(secret, path.join(REPO, `analyses/DESCLINK_${YESTERDAY}/alpha/leak.txt`))
  poolFile('DESCLINK', 'filing.pdf', -3)

  assert.deepEqual(thesisPlan('DESCLINK').reuse, ['alpha'], 'the ordinary outputs alone look reusable')
  assert.throws(() => carryForwardModules('DESCLINK', ['alpha']), /module tree contains a symlink/,
    'copy staging rejects a symlink anywhere below the otherwise-contained module directory')
  assert.equal(fs.readFileSync(secret, 'utf8'), 'outside bytes must not be imported\n')
  console.log('✅ descendant symlinks cannot import outside-tree bytes into a checkpoint')
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
  write(`analyses/RELIANCE.NS_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
  write(`analyses/RELIANCE.NS_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# a\n')
  const ok = thesisPlan('RELIANCE.NS')
  assert.equal(ok.subject, 'RELIANCE.NS')
  assert.deepEqual(ok.reuse, ['alpha'], 'a dotted symbol is a normal subject, not a traversal')
  console.log('✅ hostile subjects are rejected; legal dotted symbols still work')
}

// ---- 15. runnable / blockedBy: a Run row's pill is only pressable when its upstream is reused, not running -
{
  // RUNOK: alpha finished yesterday (reused ancestor), beta partial today's-older-folder (runs, no blocker).
  write(`analyses/RUNOK_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
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
  write(`analyses/VALID_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
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
  assert.deepEqual(res.reusedAncestorModules, ['alpha'], 'the publication scope names every reused prerequisite')
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

  // If publication/launch failed after this staging pass, a retry sees alpha already in today's root. It is
  // no longer newly "carried", but must remain in the exact checkpoint scope or those copied bytes can stay
  // dirty forever while the module command commits only beta/.
  const retryPlan = thesisPlan('RESUME')
  const retry = prepareModuleResume('RESUME', 'beta', undefined, retryPlan)
  assert.deepEqual(retry.carriedAncestors, [], 'retry does not copy an ancestor already in the target root')
  assert.deepEqual(retry.reusedAncestorModules, ['alpha'], 'retry still republishes/checkpoints that ancestor path')

  // The paid-boundary proof reads only TODAY's staged files. Historical fallback is useful for planning,
  // but must never hide a deleted staged orb/ancestor or a byte edit after the checkpoint was published.
  const exact = capturePreparedModuleResumeScope(
    'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
  )
  assert.ok(exact, 'the exact staged target + ancestor scope is valid')
  if (process.platform !== 'win32') {
    const betaOrb = path.join(REPO, `analyses/RESUME_${TODAY}/beta/01_beta-thing.md`)
    fs.chmodSync(betaOrb, 0o600)
    assert.equal(capturePreparedModuleResumeScope(
      'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
    )?.fingerprint, exact.fingerprint, 'host-only read/write mode changes do not alter a Git checkpoint')
    fs.chmodSync(betaOrb, 0o645)
    assert.equal(capturePreparedModuleResumeScope(
      'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
    )?.fingerprint, exact.fingerprint, 'group/other execute bits do not change Git’s regular-file mode')
    fs.chmodSync(betaOrb, 0o700)
    assert.notEqual(capturePreparedModuleResumeScope(
      'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
    )?.fingerprint, exact.fingerprint, 'the executable bit remains part of the Git checkpoint')
    fs.chmodSync(betaOrb, 0o600)
  }
  write(`analyses/RESUME_${TODAY}/beta/01_beta-thing.md`, '# beta orb changed after checkpoint\n')
  const changed = capturePreparedModuleResumeScope(
    'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
  )
  assert.ok(changed)
  assert.notEqual(changed.fingerprint, exact.fingerprint, 'a same-name byte edit changes the final paid-boundary proof')
  fs.unlinkSync(path.join(REPO, `analyses/RESUME_${TODAY}/beta/01_beta-thing.md`))
  assert.equal(capturePreparedModuleResumeScope(
    'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
  ), null, 'an older historical copy cannot hide a deleted staged target orb')
  write(`analyses/RESUME_${TODAY}/beta/01_beta-thing.md`, '# beta orb restored\n')
  fs.unlinkSync(path.join(REPO, `analyses/RESUME_${TODAY}/alpha/99_alpha-synthesis.md`))
  assert.equal(capturePreparedModuleResumeScope(
    'RESUME', 'beta', retryPlan.targetRunRoot, retry.doneOrbKeys, retry.reusedAncestorModules,
  ), null, 'a historical synthesis cannot hide a deleted staged ancestor')
  console.log('✅ prepareModuleResume carries ancestors + resumes the module’s orbs under a distinct stamp')
}

// ---- 17b. resumedVintage: a resumed orb keeps its true vintage and can still go stale --------------------
{
  const TWO_AGO = day(-2)
  // beta resumed INTO today's root from a two-days-ago run (RESUMED_FROM stamp), and data landed TODAY.
  write(`analyses/RVINT_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
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
  write(`analyses/ANCONLY_${YESTERDAY}/beta/01_beta-thing.md`, '# b\n')
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
  write(`analyses/STCLEAN_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
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

// ---- 20. a historical synthesis with NEW current-roster orbs is resumable, never falsely "done" ---------
{
  // Simulate a zero-touch roster expansion after every fixture above has run: alpha used to have only 01;
  // the current engine now discovers 02 as well. Force-refresh the roster cache exactly as a new server
  // process/deploy would, then prove an older 99 cannot hide the newly missing check.
  write('.claude/agents/alpha/02_alpha-new-check.md', fm('alpha-new-check', 1)
    + '- `UPSTREAM_INPUTS` — `01_alpha-thing.md`.\n')
  write('.claude/agents/alpha/03_alpha-dependent-check.md', fm('alpha-dependent-check', 2)
    + '- `UPSTREAM_INPUTS` — `02_alpha-new-check.md`.\n')
  const { buildSwarmGraph } = await import('../src/roster')
  buildSwarmGraph('research', true)

  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/01_alpha-thing.md`, '# existing check\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/03_alpha-dependent-check.md`, '# old dependent check\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# old synthesis\n\n```alpha_summary.json\n{"old":true}\n```\n\nExport `alpha_unclosed.csv`:\n```csv\nold,true\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/alpha_memo.md`, '# old memo\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/alpha_dossier.md`, '# old dossier\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/alpha_summary.json`, '{"old":true}\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/alpha_declared.json`, '{"old":true}\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/alpha_unclosed.csv`, 'old,true\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/alpha/source_manifest.csv`, 'source,current\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/beta/01_beta-thing.md`, '# downstream check\n')
  write(`analyses/ROSTERGAP_${YESTERDAY}/beta/99_beta-synthesis.md`, '# downstream synthesis over old alpha\n')
  poolFile('ROSTERGAP', 'filing.pdf', -3)

  const plan = thesisPlan('ROSTERGAP')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'partial', 'an old 99 cannot mark newly added roster checks complete')
  assert.equal(alpha.synthesisNeedsRefresh, true)
  assert.equal(alpha.doneAgents, 1, 'the existing current-roster specialist remains reusable')
  assert.deepEqual(alpha.doneOrbKeys, ['alpha/01_alpha-thing'], 'the plan exposes the exact reusable scope')
  assert.equal(alpha.totalAgents, 4, '01 + newly added 02/03 + 99 synthesis')
  assert.equal(alpha.willRunAgents, 3, 'the new specialist + its saved dependent + refreshed synthesis run')
  assert.ok(!plan.reusable.includes('alpha'), 'a structurally incomplete synthesis is not reusable whole')
  assert.ok(plan.run.includes('alpha'))
  assert.equal(alpha.runnable, true)
  assert.ok(plan.run.includes('beta'), 'a downstream synthesis that read old alpha is invalidated for full-thesis completion')
  assert.ok(!plan.reuse.includes('beta'))

  const res = prepareModuleResume('ROSTERGAP', 'alpha', undefined, plan)
  assert.deepEqual(res.doneOrbKeys, ['alpha/01_alpha-thing'])
  assert.equal(res.willRunAgents, 3)
  assert.equal(res.resumedFrom, `analyses/ROSTERGAP_${YESTERDAY}`)
  const source = path.join(REPO, `analyses/ROSTERGAP_${YESTERDAY}/alpha`)
  const target = path.join(REPO, `analyses/ROSTERGAP_${TODAY}/alpha`)
  assert.ok(fs.existsSync(path.join(source, '99_alpha-synthesis.md')), 'the historical source is never modified')
  assert.ok(fs.existsSync(path.join(target, '01_alpha-thing.md')), 'finished current specialist is staged')
  assert.ok(!fs.existsSync(path.join(target, '99_alpha-synthesis.md')), 'old 99 is removed so the pipeline must refresh it')
  assert.ok(!fs.existsSync(path.join(target, 'alpha_memo.md')), 'old memo is removed with the old synthesis')
  assert.ok(!fs.existsSync(path.join(target, 'alpha_dossier.md')), 'old dossier is removed with the old synthesis')
  assert.ok(!fs.existsSync(path.join(target, 'alpha_summary.json')), 'old synthesis-labelled sidecar is removed before a best-effort refresh')
  assert.ok(!fs.existsSync(path.join(target, 'alpha_declared.json')), 'a current-prompt-declared sidecar is removed even when the old 99 did not label it')
  assert.ok(!fs.existsSync(path.join(target, 'alpha_unclosed.csv')), 'a sidecar named by an unclosed synthesis fence is also removed')
  assert.ok(fs.existsSync(path.join(target, 'source_manifest.csv')), 'triage-owned sidecars survive synthesis refresh')
  assert.ok(!fs.existsSync(path.join(target, '03_alpha-dependent-check.md')), 'a saved check that depended on the new missing orb is rerun too')
  assert.match(fs.readFileSync(path.join(target, 'RESUMED_FROM.md'), 'utf8'), /scoped to run/, 'the stamp is prospective, not a false completion claim')

  // Simulate the new specialist finishing before the refreshed synthesis, then the process dying. A retry
  // must prefer today's richer partial over yesterday's old 99; otherwise staging would replace today's
  // folder with the old one, lose 02, and run it again on every failed retry.
  write(`analyses/ROSTERGAP_${TODAY}/alpha/02_alpha-new-check.md`, '# newly finished check\n')
  write(`analyses/ROSTERGAP_${TODAY}/alpha/03_alpha-dependent-check.md`, '# newly refreshed dependent check\n')
  const retryPlan = thesisPlan('ROSTERGAP')
  const retryAlpha = retryPlan.modules.find((m) => m.module === 'alpha')!
  assert.equal(retryAlpha.state, 'partial')
  assert.equal(retryAlpha.inTargetRoot, true, 'the newest partial retry state supersedes the older incomplete 99')
  assert.equal(retryAlpha.doneAgents, 3, 'all specialists survive the failed first attempt')
  assert.equal(retryAlpha.willRunAgents, 1, 'retry runs only the still-missing synthesis')
  const retry = prepareModuleResume('ROSTERGAP', 'alpha', undefined, retryPlan)
  assert.deepEqual(retry.doneOrbKeys, ['alpha/01_alpha-thing', 'alpha/02_alpha-new-check', 'alpha/03_alpha-dependent-check'])
  assert.equal(retry.willRunAgents, 1)
  assert.ok(fs.existsSync(path.join(target, '02_alpha-new-check.md')), 'retry staging never discards newly finished work')
  console.log('✅ roster growth resumes only missing specialists and forces a fresh synthesis')
}

// ---- 20b. same-day target gaps are hole-punched in place; stale historical gaps run clean ----------------
{
  write(`analyses/GAPTODAY_${TODAY}/alpha/01_alpha-thing.md`, '# existing check\n')
  write(`analyses/GAPTODAY_${TODAY}/alpha/99_alpha-synthesis.md`, '# old synthesis\n')
  write(`analyses/GAPTODAY_${TODAY}/alpha/alpha_memo.md`, '# old memo\n')
  const todayPlan = thesisPlan('GAPTODAY')
  const todayAlpha = todayPlan.modules.find((m) => m.module === 'alpha')!
  assert.equal(todayAlpha.state, 'partial')
  assert.equal(todayAlpha.inTargetRoot, true)
  assert.ok(!todayPlan.mustReuse.includes('alpha'), 'a stale-roster 99 in the target root must not lock itself')
  const todayResume = prepareModuleResume('GAPTODAY', 'alpha', undefined, todayPlan)
  assert.deepEqual(todayResume.doneOrbKeys, ['alpha/01_alpha-thing'])
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/GAPTODAY_${TODAY}/alpha/99_alpha-synthesis.md`)))
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/GAPTODAY_${TODAY}/alpha/alpha_memo.md`)))

  write(`analyses/GAPSTALE_${YESTERDAY}/alpha/01_alpha-thing.md`, '# stale check\n')
  write(`analyses/GAPSTALE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# stale synthesis\n')
  poolFile('GAPSTALE', 'new.pdf', 0)
  const stalePlan = thesisPlan('GAPSTALE')
  const staleAlpha = stalePlan.modules.find((m) => m.module === 'alpha')!
  assert.equal(staleAlpha.state, 'partial')
  assert.ok(staleAlpha.staleReason)
  assert.equal(staleAlpha.willRunAgents, staleAlpha.totalAgents, 'newer data turns gap-only into a clean module run')
  const staleResume = prepareModuleResume('GAPSTALE', 'alpha', undefined, stalePlan)
  assert.equal(staleResume.discardedStaleOrbs, true)
  assert.deepEqual(staleResume.doneOrbKeys, [])
  assert.equal(staleResume.resumedFrom, null)
  assert.ok(fs.existsSync(path.join(REPO, `analyses/GAPSTALE_${YESTERDAY}/alpha/99_alpha-synthesis.md`)), 'clean rerun never edits the stale source')

  write(`analyses/FINSTALE_${YESTERDAY}/alpha/01_alpha-thing.md`, '# old check\n')
  write(`analyses/FINSTALE_${YESTERDAY}/alpha/02_alpha-new-check.md`, '# old new check\n')
  write(`analyses/FINSTALE_${YESTERDAY}/alpha/03_alpha-dependent-check.md`, '# old dependent check\n')
  write(`analyses/FINSTALE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# old complete synthesis\n')
  poolFile('FINSTALE', 'new.pdf', 0)
  const finishedStalePlan = thesisPlan('FINSTALE')
  assert.equal(finishedStalePlan.modules.find((m) => m.module === 'alpha')!.state, 'stale')
  const finishedStaleResume = prepareModuleResume('FINSTALE', 'alpha', undefined, finishedStalePlan)
  assert.equal(finishedStaleResume.discardedStaleOrbs, true, 'a stale finished module also reports a clean rerun')
  assert.deepEqual(finishedStaleResume.doneOrbKeys, [])
  console.log('✅ target-root roster gaps refresh in place; newer-data gaps fail safe to a clean run')
}

// ---- 20c. current specialists merge across run folders, newest valid copy per orb -------------------
{
  // An old module has 01 + an obsolete 03 + 99. The user manually runs the empty 02 in today's sparse
  // folder. The safe resume is the union 01(old)+02(new); because 03 depends on 02 and predates it, 03 runs
  // again. Staging must not choose one folder and silently lose the other folder's paid work.
  const old01 = `analyses/MANUALMERGE_${YESTERDAY}/alpha/01_alpha-thing.md`
  const old03 = `analyses/MANUALMERGE_${YESTERDAY}/alpha/03_alpha-dependent-check.md`
  const old99 = `analyses/MANUALMERGE_${YESTERDAY}/alpha/99_alpha-synthesis.md`
  const new02 = `analyses/MANUALMERGE_${TODAY}/alpha/02_alpha-new-check.md`
  write(old01, '# old prerequisite\n')
  write(old03, '# dependent that has not read new 02\n')
  write(old99, '# old synthesis\n')
  write(new02, '# manually completed new check\n')
  const baseMs = Date.now() - 20_000
  fs.utimesSync(path.join(REPO, old01), new Date(baseMs), new Date(baseMs))
  // Deliberately make the OLD dependent look newer by mtime than today's prerequisite. Git checkouts do
  // not preserve mtimes, so true dated provenance — not this misleading timestamp — must invalidate 03.
  fs.utimesSync(path.join(REPO, old03), new Date(baseMs + 15_000), new Date(baseMs + 15_000))
  fs.utimesSync(path.join(REPO, old99), new Date(baseMs + 16_000), new Date(baseMs + 16_000))
  fs.utimesSync(path.join(REPO, new02), new Date(baseMs + 10_000), new Date(baseMs + 10_000))
  poolFile('MANUALMERGE', 'filing.pdf', -3)

  const plan = thesisPlan('MANUALMERGE')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'partial')
  assert.deepEqual(alpha.doneOrbKeys, ['alpha/01_alpha-thing', 'alpha/02_alpha-new-check'])
  assert.equal(alpha.doneAgents, 2)
  assert.equal(alpha.willRunAgents, 2, 'only invalidated 03 + synthesis run')
  assert.deepEqual(alpha.resumeFromRunRoots, [
    `analyses/MANUALMERGE_${TODAY}`,
    `analyses/MANUALMERGE_${YESTERDAY}`,
  ])

  const old01Mtime = fs.statSync(path.join(REPO, old01)).mtimeMs
  const new02Mtime = fs.statSync(path.join(REPO, new02)).mtimeMs
  const resumed = prepareModuleResume('MANUALMERGE', 'alpha', undefined, plan)
  assert.deepEqual(resumed.doneOrbKeys, alpha.doneOrbKeys, 'staged scope exactly equals planned scope')
  const target = path.join(REPO, `analyses/MANUALMERGE_${TODAY}/alpha`)
  assert.ok(fs.existsSync(path.join(target, '01_alpha-thing.md')), 'older prerequisite is merged in')
  assert.ok(fs.existsSync(path.join(target, '02_alpha-new-check.md')), 'newer manually-run orb survives')
  assert.ok(!fs.existsSync(path.join(target, '03_alpha-dependent-check.md')), 'dependent older than its new input is rerun')
  assert.ok(!fs.existsSync(path.join(target, '99_alpha-synthesis.md')), 'old synthesis is invalidated')
  assert.ok(Math.abs(fs.statSync(path.join(target, '01_alpha-thing.md')).mtimeMs - old01Mtime) < 2)
  assert.ok(Math.abs(fs.statSync(path.join(target, '02_alpha-new-check.md')).mtimeMs - new02Mtime) < 2,
    'overlay copies preserve source mtime')
  console.log('✅ partial resume merges exact reusable orbs across run folders without losing progress')
}

// ---- 20c2. a newer specialist vintage refreshes an older 99 even when checkout mtimes lie ----------
{
  for (const file of ['01_alpha-thing.md', '02_alpha-new-check.md', '03_alpha-dependent-check.md']) {
    write(`analyses/SYNVINT_${YESTERDAY}/alpha/${file}`, `# ${file}\n`)
  }
  write(`analyses/SYNVINT_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# alpha complete\n')
  write(`analyses/SYNVINT_${YESTERDAY}/beta/01_beta-thing.md`, '# old beta check\n')
  write(`analyses/SYNVINT_${YESTERDAY}/beta/99_beta-synthesis.md`, '# old beta synthesis\n')
  write(`analyses/SYNVINT_${TODAY}/beta/01_beta-thing.md`, '# manually refreshed beta check\n')
  poolFile('SYNVINT', 'filing.pdf', -3)

  const oldSynthesis = path.join(REPO, `analyses/SYNVINT_${YESTERDAY}/beta/99_beta-synthesis.md`)
  const newSpecialist = path.join(REPO, `analyses/SYNVINT_${TODAY}/beta/01_beta-thing.md`)
  const baseMs = Date.now() - 20_000
  fs.utimesSync(newSpecialist, new Date(baseMs), new Date(baseMs))
  fs.utimesSync(oldSynthesis, new Date(baseMs + 10_000), new Date(baseMs + 10_000))

  const beta = thesisPlan('SYNVINT').modules.find((m) => m.module === 'beta')!
  assert.equal(beta.state, 'partial', 'a later-dated specialist invalidates an older 99 despite inverse mtimes')
  assert.deepEqual(beta.doneOrbKeys, ['beta/01_beta-thing'])
  assert.equal(beta.willRunAgents, 1, 'only the refreshed synthesis remains to run')
  console.log('✅ true specialist vintage refreshes synthesis even when checkout mtimes are inverted')
}

// ---- 20d. only the currently discovered 99 filename can make a module complete ----------------------
{
  write(`analyses/LEGACY99_${YESTERDAY}/alpha/01_alpha-thing.md`, '# one\n')
  write(`analyses/LEGACY99_${YESTERDAY}/alpha/02_alpha-new-check.md`, '# two\n')
  write(`analyses/LEGACY99_${YESTERDAY}/alpha/03_alpha-dependent-check.md`, '# three\n')
  write(`analyses/LEGACY99_${YESTERDAY}/alpha/99_retired-alpha-synthesis.md`, '# obsolete 99 identity\n')
  poolFile('LEGACY99', 'filing.pdf', -3)

  const plan = thesisPlan('LEGACY99')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'partial', 'a non-empty retired 99 does not satisfy the current synthesis orb')
  assert.equal(alpha.synthesisNeedsRefresh, true)
  assert.equal(alpha.doneAgents, 3)
  assert.equal(alpha.willRunAgents, 1)
  prepareModuleResume('LEGACY99', 'alpha', undefined, plan)
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/LEGACY99_${TODAY}/alpha/99_retired-alpha-synthesis.md`)),
    'retired 99 is cleared so the current 99 must execute')
  console.log('✅ synthesis completion is keyed to the current discovered 99 filename')
}

// ---- 20e. a malformed current 99 remains incomplete and retries only the synthesis ------------------
{
  write(`analyses/INVALID99_${YESTERDAY}/alpha/01_alpha-thing.md`, '# one\n')
  write(`analyses/INVALID99_${YESTERDAY}/alpha/02_alpha-new-check.md`, '# two\n')
  write(`analyses/INVALID99_${YESTERDAY}/alpha/03_alpha-dependent-check.md`, '# three\n')
  write(`analyses/INVALID99_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# cut-off summary\n\n```json\n{"partial":true}\n')
  poolFile('INVALID99', 'filing.pdf', -3)

  const plan = thesisPlan('INVALID99')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'partial', 'a malformed current-name 99 is incomplete, never done')
  assert.equal(alpha.synthesisNeedsRefresh, true)
  assert.deepEqual(alpha.doneOrbKeys, [
    'alpha/01_alpha-thing',
    'alpha/02_alpha-new-check',
    'alpha/03_alpha-dependent-check',
  ])
  assert.equal(alpha.willRunAgents, 1, 'all valid specialists survive; only the invalid summary retries')
  prepareModuleResume('INVALID99', 'alpha', undefined, plan)
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/INVALID99_${TODAY}/alpha/99_alpha-synthesis.md`)),
    'staging removes the invalid summary before its one retry Task')
  console.log('✅ invalid current synthesis stays incomplete and retries summary only')
}

// ---- 20f. an upstream module-only refresh persistently invalidates old downstream synthesis ------------
{
  // Alpha was rerun alone today and completed. Beta's otherwise complete 99 is from yesterday, so a fresh
  // GET (with no in-memory launch history) must still scope beta's 99 to refresh against the new alpha.
  write(`analyses/PERSIST_${TODAY}/alpha/01_alpha-thing.md`, '# one today\n')
  write(`analyses/PERSIST_${TODAY}/alpha/02_alpha-new-check.md`, '# two today\n')
  write(`analyses/PERSIST_${TODAY}/alpha/03_alpha-dependent-check.md`, '# three today\n')
  write(`analyses/PERSIST_${TODAY}/alpha/99_alpha-synthesis.md`, '# alpha refreshed today\n')
  write(`analyses/PERSIST_${YESTERDAY}/beta/01_beta-thing.md`, '# beta specialist\n')
  write(`analyses/PERSIST_${YESTERDAY}/beta/99_beta-synthesis.md`, '# beta over old alpha\n')
  poolFile('PERSIST', 'filing.pdf', -3)

  const plan = thesisPlan('PERSIST')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  const beta = plan.modules.find((m) => m.module === 'beta')!
  assert.equal(alpha.state, 'done')
  assert.equal(beta.state, 'partial', 'old downstream synthesis remains invalid after the upstream run finishes')
  assert.equal(beta.synthesisNeedsRefresh, true)
  assert.deepEqual(beta.doneOrbKeys, ['beta/01_beta-thing'])
  assert.equal(beta.willRunAgents, 1, 'downstream specialists survive; only downstream synthesis refreshes')
  assert.equal(beta.runnable, true)
  prepareModuleResume('PERSIST', 'beta', undefined, plan)
  assert.ok(fs.existsSync(path.join(REPO, `analyses/PERSIST_${TODAY}/beta/01_beta-thing.md`)))
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/PERSIST_${TODAY}/beta/99_beta-synthesis.md`)))
  console.log('✅ downstream synthesis refresh persists after a module-only upstream run completes')
}

// ---- 20g. symlinked dated roots are ignored and never become destructive targets --------------------
{
  const outsideHistory = fs.mkdtempSync(path.join(os.tmpdir(), 'completion-symlink-history-'))
  write(`analyses/.keep`, 'keep\n')
  fs.mkdirSync(path.join(outsideHistory, 'alpha'), { recursive: true })
  fs.writeFileSync(path.join(outsideHistory, 'alpha/01_alpha-thing.md'), '# outside\n')
  fs.writeFileSync(path.join(outsideHistory, 'alpha/99_alpha-synthesis.md'), '# outside synthesis\n')
  const historyLink = path.join(REPO, `analyses/SYMHIST_${YESTERDAY}`)
  fs.symlinkSync(outsideHistory, historyLink, 'dir')
  assert.equal(thesisPlan('SYMHIST').modules.find((m) => m.module === 'alpha')!.state, 'missing',
    'a symlinked historical run root is not read as reusable work')

  write(`analyses/SYMTGT_${YESTERDAY}/alpha/01_alpha-thing.md`, '# one\n')
  write(`analyses/SYMTGT_${YESTERDAY}/alpha/02_alpha-new-check.md`, '# two\n')
  write(`analyses/SYMTGT_${YESTERDAY}/alpha/03_alpha-dependent-check.md`, '# three\n')
  write(`analyses/SYMTGT_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# old synthesis\n')
  poolFile('SYMTGT', 'new.pdf', 0)
  const stalePlan = thesisPlan('SYMTGT')
  assert.ok(stalePlan.modules.find((m) => m.module === 'alpha')!.staleReason)

  const outsideTarget = fs.mkdtempSync(path.join(os.tmpdir(), 'completion-symlink-target-'))
  fs.mkdirSync(path.join(outsideTarget, 'alpha'), { recursive: true })
  const sentinel = path.join(outsideTarget, 'alpha/DO_NOT_DELETE.txt')
  fs.writeFileSync(sentinel, 'outside target remains\n')
  const targetLink = path.join(REPO, `analyses/SYMTGT_${TODAY}`)
  fs.symlinkSync(outsideTarget, targetLink, 'dir')
  assert.throws(() => prepareModuleResume('SYMTGT', 'alpha', undefined, stalePlan), /run root is not a contained real directory/,
    'stale cleanup rejects a symlinked target run root before deletion')
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'outside target remains\n')

  fs.unlinkSync(historyLink)
  fs.unlinkSync(targetLink)
  fs.rmSync(outsideHistory, { recursive: true, force: true })
  fs.rmSync(outsideTarget, { recursive: true, force: true })
  console.log('✅ symlinked dated roots are contained before reads, copies, or deletes')
}

// ---- 20g. optional reads_from inputs are staged and fingerprinted without becoming hard deps ---------
{
  write('.claude/agents/gamma/01_gamma-thing.md', fm('gamma-thing', 1))
  write('.claude/agents/gamma/99_gamma-synthesis.md', fm('gamma-synthesis', 99, 'depends_on: []\n'))
  write('.claude/agents/alpha/99_alpha-synthesis.md', fm(
    'alpha-synthesis', 99, 'depends_on: []\nreads_from: [gamma]\n',
  ))
  buildSwarmGraph('research', true)

  write(`analyses/OPTREAD_${YESTERDAY}/gamma/01_gamma-thing.md`, '# optional input specialist\n')
  write(`analyses/OPTREAD_${YESTERDAY}/gamma/99_gamma-synthesis.md`, '# optional input synthesis\n')
  write(`analyses/OPTREAD_${YESTERDAY}/alpha/01_alpha-thing.md`, '# resumable target specialist\n')

  const plan = thesisPlan('OPTREAD')
  const alpha = plan.modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.runnable, true, 'an optional read never becomes a hard scheduling blocker')
  assert.ok(plan.reuse.includes('gamma'), 'the fresh optional input is reusable')
  const resumed = prepareModuleResume('OPTREAD', 'alpha', undefined, plan)
  assert.deepEqual(resumed.reusedAncestorModules, ['gamma'],
    'a fresh reads_from module is staged even though it is not a depends_on ancestor')
  assert.ok(fs.existsSync(path.join(REPO, `analyses/OPTREAD_${TODAY}/gamma/99_gamma-synthesis.md`)))
  assert.ok(capturePreparedModuleResumeScope(
    'OPTREAD', 'alpha', plan.targetRunRoot, resumed.doneOrbKeys, resumed.reusedAncestorModules,
  ), 'the final paid-boundary fingerprint covers the optional input bytes too')
  console.log('✅ optional reads_from inputs are staged + fingerprinted without becoming hard dependencies')
}

// ---- 20h. prompt dependency discovery matches exact output filenames, never substrings ----------------
{
  // A newer roster makes alpha structurally partial, so the GLOBAL completion plan must rebuild it. Its
  // older current-name 99 is nevertheless a valid, disclosed input for one exact beta run. Gamma is an
  // optional reads_from input and is carried when available, without becoming a hard blocker.
  write('.claude/agents/beta/99_beta-synthesis.md', fm(
    'beta-synthesis', 99, 'depends_on: [alpha]\nreads_from: [gamma]\nexact_resume: true\n',
  ))
  buildSwarmGraph('research', true)
  write(`analyses/SAVEDINPUT_${YESTERDAY}/alpha/01_alpha-thing.md`, '# saved alpha specialist\n')
  write(`analyses/SAVEDINPUT_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# saved alpha synthesis\n')
  write(`analyses/SAVEDINPUT_${YESTERDAY}/gamma/01_gamma-thing.md`, '# saved gamma specialist\n')
  write(`analyses/SAVEDINPUT_${YESTERDAY}/gamma/99_gamma-synthesis.md`, '# saved gamma synthesis\n')
  write(`analyses/SAVEDINPUT_${YESTERDAY}/beta/01_beta-thing.md`, '# resumable beta specialist\n')

  const globalPlan = thesisPlan('SAVEDINPUT')
  assert.equal(globalPlan.modules.find((entry) => entry.module === 'alpha')!.state, 'partial')
  assert.ok(!globalPlan.reusable.includes('alpha'),
    'a roster-incomplete upstream remains non-reusable for a full-thesis completion')
  assert.deepEqual(globalPlan.modules.find((entry) => entry.module === 'beta')!.blockedBy, ['alpha'])
  assert.equal(globalPlan.exactModuleScope, undefined, 'ordinary plans retain their existing semantics')

  const exactPlan = thesisPlan('SAVEDINPUT', undefined, undefined, 'beta')
  assert.deepEqual(exactPlan.exactModuleScope, {
    module: 'beta',
    savedInputs: ['alpha', 'gamma'],
  })
  assert.deepEqual(exactPlan.reuse, ['alpha', 'gamma'],
    'only graph-declared mechanically valid inputs are selected for the exact run')
  assert.equal(exactPlan.modules.find((entry) => entry.module === 'beta')!.runnable, true)
  assert.deepEqual(exactPlan.modules.find((entry) => entry.module === 'beta')!.blockedBy, [])
  const exactResume = prepareModuleResume('SAVEDINPUT', 'beta', undefined, exactPlan)
  assert.deepEqual(exactResume.reusedAncestorModules, ['alpha', 'gamma'])
  assert.ok(fs.existsSync(path.join(REPO, `analyses/SAVEDINPUT_${TODAY}/alpha/99_alpha-synthesis.md`)))
  assert.ok(fs.existsSync(path.join(REPO, `analyses/SAVEDINPUT_${TODAY}/gamma/99_gamma-synthesis.md`)))
  assert.ok(capturePreparedModuleResumeScope(
    'SAVEDINPUT', 'beta', exactPlan.targetRunRoot, exactResume.doneOrbKeys, exactResume.reusedAncestorModules,
  ), 'saved exact inputs are staged and bound by the existing paid-boundary fingerprint')

  // Never overwrite a paid upstream partial already in today's root with yesterday's saved summary.
  write(`analyses/SAVEDBLOCK_${YESTERDAY}/alpha/01_alpha-thing.md`, '# old alpha specialist\n')
  write(`analyses/SAVEDBLOCK_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# old alpha synthesis\n')
  write(`analyses/SAVEDBLOCK_${YESTERDAY}/beta/01_beta-thing.md`, '# beta specialist\n')
  write(`analyses/SAVEDBLOCK_${TODAY}/alpha/02_alpha-new-check.md`, '# paid target partial\n')
  const blocked = thesisPlan('SAVEDBLOCK', undefined, undefined, 'beta')
  assert.ok(!blocked.exactModuleScope!.savedInputs.includes('alpha'))
  assert.deepEqual(blocked.modules.find((entry) => entry.module === 'beta')!.blockedBy, ['alpha'])
  assert.equal(fs.readFileSync(path.join(REPO, `analyses/SAVEDBLOCK_${TODAY}/alpha/02_alpha-new-check.md`), 'utf8'), '# paid target partial\n')

  // The same protection must hold at mutation time, not only when the plan is built: an external writer can
  // land a paid partial after GET/POST planning but before the synchronous carry. The stale plan fails and
  // preserves those bytes instead of swapping yesterday's complete folder over them.
  write(`analyses/SAVEDRACE_${YESTERDAY}/alpha/01_alpha-thing.md`, '# old alpha specialist\n')
  write(`analyses/SAVEDRACE_${YESTERDAY}/alpha/99_alpha-synthesis.md`, '# old alpha synthesis\n')
  write(`analyses/SAVEDRACE_${YESTERDAY}/beta/01_beta-thing.md`, '# beta specialist\n')
  const racedPlan = thesisPlan('SAVEDRACE', undefined, undefined, 'beta')
  assert.deepEqual(racedPlan.exactModuleScope!.savedInputs, ['alpha'])
  write(`analyses/SAVEDRACE_${TODAY}/alpha/02_alpha-new-check.md`, '# newly paid target partial\n')
  assert.throws(
    () => prepareModuleResume('SAVEDRACE', 'beta', undefined, racedPlan),
    /saved exact input changed in the target run root: alpha/,
  )
  assert.equal(
    fs.readFileSync(path.join(REPO, `analyses/SAVEDRACE_${TODAY}/alpha/02_alpha-new-check.md`), 'utf8'),
    '# newly paid target partial\n',
    'a late upstream partial survives the stale exact plan unchanged',
  )
  console.log('✅ exact module plans use saved validated inputs without widening global reuse or overwriting partials')
}

// ---- 20i. prompt dependency discovery matches exact output filenames, never substrings ----------------
{
  write('.claude/agents/alpha/03_alpha-dependent-check.md', fm('alpha-dependent-check', 2)
    + '- `UPSTREAM_INPUTS` — archive `102_alpha-new-check.md-backup` only; no in-module input.\n')
  buildSwarmGraph('research', true)

  const folder = `analyses/FALSEREF_${YESTERDAY}/alpha`
  write(`${folder}/01_alpha-thing.md`, '# one\n')
  write(`${folder}/02_alpha-new-check.md`, '# two\n')
  write(`${folder}/03_alpha-dependent-check.md`, '# three\n')
  write(`${folder}/99_alpha-synthesis.md`, '# current summary\n')
  const base = Date.now() - 10_000
  fs.utimesSync(path.join(REPO, `${folder}/01_alpha-thing.md`), base / 1000, base / 1000)
  fs.utimesSync(path.join(REPO, `${folder}/03_alpha-dependent-check.md`), base / 1000, base / 1000)
  fs.utimesSync(path.join(REPO, `${folder}/02_alpha-new-check.md`), (base + 1_000) / 1000, (base + 1_000) / 1000)
  fs.utimesSync(path.join(REPO, `${folder}/99_alpha-synthesis.md`), (base + 2_000) / 1000, (base + 2_000) / 1000)

  const alpha = thesisPlan('FALSEREF').modules.find((m) => m.module === 'alpha')!
  assert.equal(alpha.state, 'done',
    '02_alpha-new-check.md inside a longer archive filename must not invalidate the saved 03 specialist')

  write('.claude/agents/alpha/03_alpha-dependent-check.md', fm('alpha-dependent-check', 2)
    + '- `UPSTREAM_INPUTS` — 01_alpha-thing.md.\n')
  buildSwarmGraph('research', true)
  fs.utimesSync(path.join(REPO, `${folder}/01_alpha-thing.md`), (base + 1_000) / 1000, (base + 1_000) / 1000)
  const punctuation = thesisPlan('FALSEREF').modules.find((m) => m.module === 'alpha')!
  assert.deepEqual(punctuation.doneOrbKeys, ['alpha/01_alpha-thing', 'alpha/02_alpha-new-check'],
    'a real output filename followed by sentence punctuation still invalidates its older dependent')
  console.log('✅ specialist dependency discovery rejects longer-filename substring matches')
}

// ---- 21. Continue stays inside one saved root and preserves only valid work -----------------------
{
  const root = `analyses/EXACTPART_${YESTERDAY}`
  write(`${root}/alpha/01_alpha-thing.md`, '# exact alpha specialist\n')
  write(`${root}/alpha/02_alpha-new-check.md`, '# exact alpha second specialist\n')
  write(`${root}/alpha/03_alpha-dependent-check.md`, '# exact alpha dependent specialist\n')
  write(`${root}/alpha/99_alpha-synthesis.md`, '# exact alpha synthesis\n')
  write(`${root}/beta/01_beta-thing.md`, '# exact beta specialist\n')
  poolFile('EXACTPART', 'filing.pdf', -3)
  const alphaBefore = fs.readFileSync(path.join(REPO, root, 'alpha/99_alpha-synthesis.md'), 'utf8')

  const plan = thesisPlan('EXACTPART', undefined, undefined, undefined, { provider: 'claude' }, {
    ...exactScope(root),
  })
  assert.equal(plan.targetRunRoot, root, 'Continue targets the saved folder, not today')
  assert.deepEqual(plan.reuse, ['alpha'], 'finished valid module remains reusable')
  assert.ok(plan.run.includes('beta'), 'the partial module remains payable')
  assert.ok(!plan.run.includes('alpha'), 'the valid finished module is never payable again')
  assert.deepEqual(plan.modules.find((entry) => entry.module === 'beta')!.doneOrbKeys, ['beta/01_beta-thing'])

  const prepared = prepareFullContinuation('EXACTPART', plan)
  assert.deepEqual(prepared.doneOrbKeys, ['beta/01_beta-thing'])
  assert.equal(fs.readFileSync(path.join(REPO, root, 'alpha/99_alpha-synthesis.md'), 'utf8'), alphaBefore,
    'valid finished bytes are unchanged')
  assert.ok(fs.existsSync(path.join(REPO, root, 'beta/01_beta-thing.md')), 'valid partial orb remains in exact root')
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/EXACTPART_${TODAY}`)), 'Continue never creates today’s folder')

  const staleRoot = `analyses/EXACTSTALE_${YESTERDAY}`
  write(`${staleRoot}/alpha/01_alpha-thing.md`, '# stale specialist\n')
  write(`${staleRoot}/alpha/02_alpha-new-check.md`, '# second specialist\n')
  write(`${staleRoot}/alpha/03_alpha-dependent-check.md`, '# dependent specialist\n')
  write(`${staleRoot}/alpha/99_alpha-synthesis.md`, '# stale synthesis\n')
  poolFile('EXACTSTALE', 'new-filing.pdf', 0)
  const stalePlan = thesisPlan('EXACTSTALE', undefined, undefined, undefined, { provider: 'claude' }, {
    ...exactScope(staleRoot),
  })
  assert.ok(stalePlan.reuse.includes('alpha'), 'Continue ignores newer live data and keeps its frozen-generation output')
  assert.ok(!stalePlan.run.includes('alpha'))
  const stalePrepared = prepareFullContinuation('EXACTSTALE', stalePlan)
  assert.ok(!stalePrepared.ranClean.includes('alpha'))
  assert.ok(fs.existsSync(path.join(REPO, staleRoot, 'alpha')), 'frozen-generation output survives newer live data')
  console.log('✅ exact-root continuation keeps valid hashes, resumes partial orbs, and ignores newer live data')
}

// ---- 22. exact Continue is lineage-bound, autonomous, and never widens to Full -------------------
{
  const root = `analyses/LINEAGE_${YESTERDAY}`
  write(`${root}/alpha/01_alpha-thing.md`, '# bound alpha\n')
  write(`${root}/alpha/02_alpha-new-check.md`, '# bound alpha two\n')
  write(`${root}/alpha/03_alpha-dependent-check.md`, '# bound alpha three\n')
  write(`${root}/alpha/99_alpha-synthesis.md`, '# bound alpha synthesis\n')
  write(`${root}/alpha/obsolete-review.md`, '# protected non-roster output\n')
  write(`${root}/beta/01_beta-thing.md`, '# bound beta\n')
  write(`${root}/RUN_METADATA.md`, '# stale provider-authored metadata\n')
  write(`${root}/memo.md`, '# stale memo\n')
  write(`${root}/audit_dossier.md`, '# stale audit\n')
  write(`${root}/idea_3_6m.json`, '{}\n')
  write(`${root}/verification_report.json`, '{}\n')
  write(`${root}/reviews/stale.json`, '{}\n')
  write(`${root}/_pool_extracts/.extract-generations/fixture/manifest.json`, '{}\n')
  const reviewedScope = exactScope(root)
  write(`${root}/alpha/unbound-notes.md`, '# current bytes with no protected lineage\n')

  // Drive can vanish or gain files after the run started. Exact planning remains tied to the retained
  // snapshot injected above and does not consult the mutable pool.
  fs.rmSync(path.join(REPO, 'data/LINEAGE'), { recursive: true, force: true })
  const reviewed = thesisPlan('LINEAGE', undefined, undefined, undefined, { provider: 'claude' }, reviewedScope)
  assert.equal(reviewed.continuationReceipt.action, 'continue')
  assert.equal(reviewed.targetRunRoot, root)
  assert.equal(reviewed.continuationReceipt.evidenceGenerationDigest, reviewedScope.frozenGeneration.generationDigest)
  assert.deepEqual(reviewed.reuse, ['alpha'])
  assert.deepEqual(reviewed.modules.find((entry) => entry.module === 'beta')!.doneOrbKeys, ['beta/01_beta-thing'])

  const reviewedModule = thesisPlan(
    'LINEAGE', undefined, undefined, 'beta', { provider: 'claude' }, reviewedScope,
  )
  const moduleTx = fs.mkdtempSync(path.join(REPO, '.lineage-module-private-'))
  const preparedModule = prepareExactModuleContinuationPrivately('LINEAGE', 'beta', reviewedModule, moduleTx)
  assert.deepEqual(preparedModule.doneOrbKeys, ['beta/01_beta-thing'],
    'module-only private preparation retains only the reviewed target orb')
  assert.ok(fs.existsSync(path.join(preparedModule.stagingRootAbs, 'alpha/99_alpha-synthesis.md')),
    'the exact module input is rebuilt inside the private transaction')
  assert.ok(!fs.existsSync(path.join(preparedModule.stagingRootAbs, 'RUN_METADATA.md')),
    'stale root metadata cannot cross the exact module transaction')
  assert.ok(fs.existsSync(path.join(REPO, root, 'RUN_METADATA.md')),
    'pre-spend module preparation never mutates the canonical saved root')
  fs.rmSync(moduleTx, { recursive: true, force: true })

  // The protected record still names beta, but its current bytes no longer match. It becomes payable in the
  // SAME root; no generic Full target is created and no presence-skip survives private preparation.
  write(`${root}/beta/01_beta-thing.md`, '# tampered beta\n')
  const changed = thesisPlan('LINEAGE', undefined, undefined, undefined, { provider: 'claude' }, reviewedScope)
  assert.equal(changed.targetRunRoot, root)
  assert.equal(changed.continuationReceipt.action, 'continue')
  assert.deepEqual(changed.modules.find((entry) => entry.module === 'beta')!.doneOrbKeys, [])
  assert.ok(changed.continuationReceipt.payableOrbKeys.includes('beta/01_beta-thing'))
  assert.notEqual(changed.continuationReceipt.fingerprint, reviewed.continuationReceipt.fingerprint,
    'GET→POST byte/lineage change changes the CAS receipt before spend')

  const changedProtectedManifest = thesisPlan('LINEAGE', undefined, undefined, undefined, { provider: 'claude' }, {
    ...reviewedScope,
    frozenGeneration: {
      ...reviewedScope.frozenGeneration,
      verifiedLineageDigest: `sha256:${'c'.repeat(64)}`,
    },
  })
  assert.notEqual(changedProtectedManifest.continuationReceipt.fingerprint, reviewed.continuationReceipt.fingerprint,
    'any protected lineage snapshot change between GET and POST changes the CAS receipt before spend')

  const tx = fs.mkdtempSync(path.join(REPO, '.lineage-private-'))
  const prepared = prepareThesisPlanPrivately('LINEAGE', changed, tx)
  assert.ok(!fs.existsSync(path.join(prepared.stagingRootAbs, 'beta')),
    'unbound current bytes are absent from the privately prepared root, so the provider cannot skip them')
  assert.ok(fs.existsSync(path.join(prepared.stagingRootAbs, 'alpha/99_alpha-synthesis.md')),
    'same-generation finished work stays intact')
  assert.deepEqual(fs.readdirSync(path.join(prepared.stagingRootAbs, 'alpha')).sort(), [
    '01_alpha-thing.md', '02_alpha-new-check.md', '03_alpha-dependent-check.md', '99_alpha-synthesis.md',
  ], 'a wholly reused module is reconstructed from current-roster protected outputs only')
  for (const stale of [
    'RUN_METADATA.md', 'memo.md', 'audit_dossier.md', 'idea_3_6m.json',
    'verification_report.json', 'reviews',
  ]) {
    assert.ok(!fs.existsSync(path.join(prepared.stagingRootAbs, stale)),
      `unbound root artifact ${stale} is absent so the resumed master regenerates current output`)
  }
  assert.ok(fs.existsSync(path.join(
    prepared.stagingRootAbs, '_pool_extracts/.extract-generations/fixture/manifest.json',
  )), 'the exact frozen extraction cache survives root sanitization')
  assert.ok(!changed.continuationReceipt.reusableArtifacts.some((entry) => entry.output_rel.endsWith('obsolete-review.md')),
    'obsolete protected markdown is not part of the reusable receipt')
  fs.rmSync(tx, { recursive: true, force: true })

  const codex = thesisPlan('LINEAGE', undefined, undefined, undefined, { provider: 'codex' }, reviewedScope)
  assert.deepEqual(codex.run, changed.run, 'Claude and Codex receive the identical exact continuation scope')
  assert.deepEqual(codex.continuationReceipt.payableOrbKeys, changed.continuationReceipt.payableOrbKeys)

  assert.throws(
    () => thesisPlan('LINEAGE', undefined, undefined, undefined, { provider: 'claude' }, {
      continuationRunRoot: root,
    }),
    (error: any) => error?.code === 'legacy_generation_unbound',
    'a pre-upgrade root without a frozen receipt fails before any preparation or launch',
  )
  await assert.rejects(
    () => thesisPlanForRequest('LINEAGE', undefined, undefined, undefined, { provider: 'claude' }, {
      continuationRunRoot: root,
    }),
    (error: any) => error?.code === 'legacy_generation_unbound',
    'the HTTP planner returns the same fresh-Full-required upgrade boundary before spend',
  )
  assert.ok(!fs.existsSync(path.join(REPO, `analyses/LINEAGE_${TODAY}`)),
    'Continue never widens into a new Full-run root')
  console.log('✅ exact Continue is frozen-generation/lineage bound, sanitizes payable bytes, and never widens')
}

// ---- 22a. one legacy saved run migrates without reusing unbound partial orbs ----------------------
{
  const root = `analyses/LEGACY_${YESTERDAY}`
  for (const file of [
    '01_alpha-thing.md', '02_alpha-new-check.md', '03_alpha-dependent-check.md',
    '99_alpha-synthesis.md',
  ]) write(`${root}/alpha/${file}`, `# ${file}\n`)
  write(`${root}/beta/01_beta-thing.md`, '# unbound partial beta\n')
  poolFile('LEGACY', 'filing.pdf', -1)

  const ordinary = await thesisPlanForRequest('LEGACY', undefined, undefined, undefined, { provider: 'codex' })
  const migrated = await legacySingleRunMigrationPlan(ordinary, root)
  assert.ok(migrated, 'one exact legacy source with finished work can migrate to a protected new root')
  assert.equal(migrated.continuationReceipt.action, 'complete')
  assert.notEqual(migrated.targetRunRoot, root)
  assert.deepEqual(migrated.reuse, ['alpha'])
  assert.deepEqual(migrated.continuationReceipt.sourceRunRoots, [root])
  assert.deepEqual(migrated.modules.find((entry) => entry.module === 'beta')!.doneOrbKeys, [],
    'an unbound partial orb is payable again rather than falsely reused')
  assert.equal(migrated.modules.find((entry) => entry.module === 'beta')!.state, 'missing')
  assert.ok(migrated.continuationReceipt.payableOrbKeys.includes('beta/01_beta-thing'))
  assert.ok(!migrated.continuationReceipt.reusableOrbKeys.includes('beta/01_beta-thing'))

  const tx = fs.mkdtempSync(path.join(REPO, '.legacy-migration-private-'))
  const prepared = prepareThesisPlanPrivately('LEGACY', migrated, tx)
  assert.ok(fs.existsSync(path.join(prepared.stagingRootAbs, 'alpha/99_alpha-synthesis.md')),
    'the exact finished module is carried unchanged')
  assert.ok(!fs.existsSync(path.join(prepared.stagingRootAbs, 'beta')),
    'the unbound partial module cannot presence-skip paid work in the protected target')
  assert.deepEqual(prepared.doneOrbKeys, [])
  fs.rmSync(tx, { recursive: true, force: true })
  console.log('✅ one legacy run migrates finished modules and rebuilds unbound partial work')
}

// ---- 23. exact Continue invalidates every downstream specialist when its upstream changes ----------
{
  const root = `analyses/DOWNLINE_${YESTERDAY}`
  for (const file of ['01_alpha-thing.md', '02_alpha-new-check.md', '03_alpha-dependent-check.md']) {
    write(`${root}/alpha/${file}`, `# protected ${file}\n`)
  }
  write(`${root}/alpha/99_alpha-synthesis.md`, '# protected alpha synthesis\n')
  write(`${root}/beta/01_beta-thing.md`, '# protected beta specialist\n')
  write(`${root}/beta/99_beta-synthesis.md`, '# protected beta synthesis\n')
  const scope = exactScope(root)
  write(`${root}/alpha/01_alpha-thing.md`, '# changed upstream specialist\n')

  const plan = thesisPlan('DOWNLINE', undefined, undefined, undefined, { provider: 'codex' }, scope)
  const beta = plan.modules.find((entry) => entry.module === 'beta')!
  assert.ok(plan.run.includes('alpha'))
  assert.ok(plan.run.includes('beta'))
  assert.deepEqual(beta.doneOrbKeys, [], 'the downstream specialist is payable, not reused against a new upstream')
  assert.ok(plan.continuationReceipt.payableOrbKeys.includes('beta/01_beta-thing'))
  assert.deepEqual(plan.continuationReceipt.sourceRunRoots, [root], 'exact Continue stays bound to the same saved root')

  const tx = fs.mkdtempSync(path.join(REPO, '.downline-private-'))
  const prepared = prepareThesisPlanPrivately('DOWNLINE', plan, tx)
  assert.ok(!fs.existsSync(path.join(prepared.stagingRootAbs, 'beta')),
    'private staging removes the whole downstream module so no old specialist can presence-skip')
  fs.rmSync(tx, { recursive: true, force: true })
  console.log('✅ upstream generation changes make every downstream orb payable in the same exact root')
}

fs.rmSync(REPO, { recursive: true, force: true })
console.log('\nall completion tests passed')
