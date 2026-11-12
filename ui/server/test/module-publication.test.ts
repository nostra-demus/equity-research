// Durable, content-bound terminal-publication receipt. Pure temp-repo test: no Git, server or model launch.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'module-publication-'))
const state = path.join(repo, '.state')
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = state

function write(rel: string, body: string): void {
  const abs = path.join(repo, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
}
const fm = (name: string, layer: number, extra = '') => `---\nname: ${name}\nlayer: ${layer}\n${extra}---\n# ${name}\n`
write('.claude/agents/alpha/01_alpha-check.md', fm('alpha-check', 1))
write('.claude/agents/alpha/99_alpha-synthesis.md', fm('alpha-synthesis', 99, 'depends_on: []\nexact_resume: true\n'))
write('analyses/ACME_2099-01-01/alpha/01_alpha-check.md', '# check\n')
write('analyses/ACME_2099-01-01/alpha/99_alpha-synthesis.md', '# summary\n')

const {
  acquireModulePublicationLease,
  captureCompletedModuleFingerprint,
  clearPendingModulePublication,
  modulePublicationInFlight,
  readPendingModulePublication,
  recoverNonCleanExactModulePublication,
  retainExplicitIncompleteModule,
  validPendingModulePublication,
  writePendingModulePublication,
} = await import('../src/module-publication')

const releaseLease = acquireModulePublicationLease('ACME')
assert.equal(typeof releaseLease, 'function')
assert.equal(modulePublicationInFlight('ACME'), true)
assert.equal(acquireModulePublicationLease('ACME'), null, 'only one publisher can own a subject')
releaseLease!()
assert.equal(modulePublicationInFlight('ACME'), false, 'publication lease releases idempotently')
releaseLease!()

const root = 'analyses/ACME_2099-01-01'
const first = captureCompletedModuleFingerprint('ACME', 'alpha', root)
assert.match(first ?? '', /^sha256:[a-f0-9]{64}$/, 'a completed current-roster module gets a byte receipt')
if (process.platform !== 'win32') {
  const moduleDir = path.join(repo, root, 'alpha')
  const specialist = path.join(moduleDir, '01_alpha-check.md')
  fs.chmodSync(moduleDir, 0o700)
  fs.chmodSync(specialist, 0o600)
  assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), first,
    'host-only directory/read-write permissions do not alter a Git publication receipt')
  fs.chmodSync(specialist, 0o645)
  assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), first,
    'group/other execute bits do not change Git’s regular-file mode')
  fs.chmodSync(specialist, 0o700)
  assert.notEqual(captureCompletedModuleFingerprint('ACME', 'alpha', root), first,
    'the executable bit remains part of the Git publication receipt')
  fs.chmodSync(specialist, 0o600)
}

const marker = writePendingModulePublication({
  ticker: 'ACME', module: 'alpha', targetRunRoot: root, fingerprint: first!,
})
assert.deepEqual(readPendingModulePublication('ACME', 'alpha'), marker, 'the receipt survives a fresh disk read')
assert.deepEqual(validPendingModulePublication('ACME', 'alpha'), marker, 'unchanged completed bytes expose retry metadata')

write(`${root}/alpha/01_alpha-check.md`, '# changed check\n')
const changed = captureCompletedModuleFingerprint('ACME', 'alpha', root)
assert.notEqual(changed, first, 'any module byte edit changes the publication fingerprint')
assert.equal(validPendingModulePublication('ACME', 'alpha'), null, 'an old marker cannot publish edited bytes')
assert.equal(clearPendingModulePublication('ACME', 'alpha', root, changed!), false,
  'a stale request cannot erase the original receipt')
assert.equal(clearPendingModulePublication('ACME', 'alpha', root, first!), true,
  'only the exact marker root+fingerprint can clear it')
assert.equal(readPendingModulePublication('ACME', 'alpha'), null)

write('analyses/BETA_2099-01-01/alpha/01_alpha-check.md', '# recovered check\n')
write('analyses/BETA_2099-01-01/alpha/99_alpha-synthesis.md', '# recovered summary\n')
const recovered = recoverNonCleanExactModulePublication({
  ticker: 'BETA',
  module: 'alpha',
  targetRunRoot: 'analyses/BETA_2099-01-01',
  synthesisOrbs: ['99_alpha-synthesis'],
})
assert.equal(recovered.disposition, 'publication-pending',
  'a valid 99 from a non-clean close gets a marker-only recovery receipt')
const betaPending = validPendingModulePublication('BETA', 'alpha')
assert.equal(betaPending?.targetRunRoot, 'analyses/BETA_2099-01-01')
assert.equal(betaPending?.fingerprint,
  recovered.disposition === 'publication-pending' ? recovered.fingerprint : null)
assert.equal(fs.existsSync(path.join(repo, 'analyses/BETA_2099-01-01/alpha/99_alpha-synthesis.md')), true,
  'marker-only recovery preserves the completed synthesis bytes')
assert.equal(clearPendingModulePublication(
  'BETA', 'alpha', betaPending!.targetRunRoot, betaPending!.fingerprint,
), true)

fs.rmSync(path.join(repo, root, 'alpha', '99_alpha-synthesis.md'))
assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), null,
  'specialists without the current discovered synthesis are not publishable')
write(`${root}/alpha/99_old-synthesis.md`, '# obsolete summary\n')
assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), null,
  'an obsolete 99 filename cannot stand in for the current synthesis')

write(`${root}/alpha/99_alpha-synthesis.md`, 'summary cut off before its heading\n')
assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), null,
  'a non-empty but structurally invalid synthesis cannot become publishable')
write(`${root}/alpha/99_alpha-synthesis.md`, '# summary\n\n```json\n{"cut":"off"}\n')
assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), null,
  'a synthesis with an unclosed code fence cannot become publishable')

write(`${root}/alpha/99_alpha-synthesis.md`, '# summary\n')
const outside = path.join(repo, 'outside.txt')
fs.writeFileSync(outside, 'outside\n')
fs.symlinkSync(outside, path.join(repo, root, 'alpha', 'linked.txt'))
assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', root), null,
  'a symlink anywhere in the module fails the content proof closed')

assert.equal(captureCompletedModuleFingerprint('ACME', 'alpha', 'analyses/OTHER_2099-01-01'), null,
  'the target root must be bound to the same ticker')
assert.throws(() => writePendingModulePublication({
  ticker: 'ACME', module: '../alpha', targetRunRoot: root, fingerprint: first!,
}), /invalid pending/, 'marker paths reject module traversal')

// Explicitly unfinished execution is retained outside canonical/provider research paths. A prior marker
// cannot turn the draft into completed evidence, and retention never creates publication authority.
const draftRoot = 'analyses/DRAFT_2099-01-01'
const draft = '# unfinished summary\n\n## Completion Status\nINCOMPLETE\n'
write(`${draftRoot}/alpha/01_alpha-check.md`, '# source-backed check\n')
write(`${draftRoot}/alpha/99_alpha-synthesis.md`, '# initially complete\n')
const priorDraftFingerprint = captureCompletedModuleFingerprint('DRAFT', 'alpha', draftRoot)!
writePendingModulePublication({ ticker: 'DRAFT', module: 'alpha', targetRunRoot: draftRoot,
  fingerprint: priorDraftFingerprint })
write(`${draftRoot}/alpha/99_alpha-synthesis.md`, draft)
write(`${draftRoot}/alpha/valuation_summary.json`, '{"unfinished":true}\n')
write(`${draftRoot}/alpha/nested/source.csv`, 'metric,value\nprofit,12\n')
assert.equal(captureCompletedModuleFingerprint('DRAFT', 'alpha', draftRoot), null)
assert.equal(validPendingModulePublication('DRAFT', 'alpha'), null, 'old marker is invalid against explicit unfinished bytes')
fs.chmodSync(state, 0o755)
assert.deepEqual(recoverNonCleanExactModulePublication({ ticker: 'DRAFT', module: 'alpha', targetRunRoot: draftRoot,
  synthesisOrbs: ['99_alpha-synthesis'] }),
{ disposition: 'recovery-failed', reason: 'explicit_incomplete_module_retained' })
assert.equal(fs.readFileSync(path.join(repo, draftRoot, 'alpha/99_alpha-synthesis.md'), 'utf8'), draft)
const archive = retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot)!
assert.equal(fs.statSync(state).mode & 0o777, 0o755, 'safe existing state-parent permissions require no production change')
assert.ok(archive.startsWith(path.join(state, 'module-incomplete-drafts') + path.sep))
assert.equal(retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot), archive, 'same tree reuses a verified archive')
for (const file of ['01_alpha-check.md', '99_alpha-synthesis.md', 'valuation_summary.json', 'nested/source.csv']) {
  assert.deepEqual(fs.readFileSync(path.join(archive, 'files', file)), fs.readFileSync(path.join(repo, draftRoot, 'alpha', file)),
    `retention includes exact original auxiliary and report bytes: ${file}`)
}
assert.equal(fs.statSync(archive).mode & 0o077, 0, 'archive directory is owner-only')
assert.equal(fs.statSync(path.join(archive, 'files/99_alpha-synthesis.md')).mode & 0o077, 0)
assert.equal(JSON.parse(fs.readFileSync(path.join(archive, 'manifest.json'), 'utf8')).purpose,
  'raw-explicit-incomplete-module-evidence')
assert.equal(validPendingModulePublication('DRAFT', 'alpha'), null, 'archive confers no pending publication authority')
fs.chmodSync(state, 0o775)
assert.throws(() => retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot), /unsafe rejected module state parent/,
  'a group-writable state parent is unsafe even when a prior archive exists')
assert.equal(fs.readFileSync(path.join(repo, draftRoot, 'alpha/99_alpha-synthesis.md'), 'utf8'), draft,
  'unsafe parent failure preserves source before any cleanup')
fs.chmodSync(state, 0o755)

write(`${draftRoot}/alpha/01_alpha-check.md`, draft)
write(`${draftRoot}/alpha/99_alpha-synthesis.md`, '# complete synthesis cannot conceal unfinished specialist\n')
assert.equal(captureCompletedModuleFingerprint('DRAFT', 'alpha', draftRoot), null,
  'an explicit unfinished specialist also prevents completed module fingerprint')
write(`${draftRoot}/alpha/01_alpha-check.md`,
  '# check\n\n<blockquote>\nquoted source\n\n## Completion Status\n**INCOMPLETE.**\n')
assert.equal(captureCompletedModuleFingerprint('DRAFT', 'alpha', draftRoot), null,
  'an unclosed HTML blockquote cannot hide an unfinished specialist from the completed fingerprint')
write(`${draftRoot}/alpha/01_alpha-check.md`, '# source-backed check\n')
write(`${draftRoot}/alpha/99_alpha-synthesis.md`, draft)

const currentArchive = retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot)!
fs.writeFileSync(path.join(currentArchive, 'files/99_alpha-synthesis.md'), '# tampered archive\n')
assert.throws(() => retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot), /archive byte collision/,
  'an existing directory is not trusted without full content verification')
assert.equal(fs.readFileSync(path.join(repo, draftRoot, 'alpha/99_alpha-synthesis.md'), 'utf8'), draft)
fs.writeFileSync(path.join(currentArchive, 'files/99_alpha-synthesis.md'), draft)
assert.throws(() => retainExplicitIncompleteModule('DRAFT', 'alpha', 'analyses/.staging-DRAFT_2099-01-01'), /unsafe/)
assert.throws(() => retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot, 'arbitrary' as any), /unsafe/)
fs.symlinkSync(outside, path.join(repo, draftRoot, 'alpha/unsafe-aux'))
assert.throws(() => retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot), /symlink/)
assert.equal(fs.readFileSync(path.join(repo, draftRoot, 'alpha/99_alpha-synthesis.md'), 'utf8'), draft)
fs.unlinkSync(path.join(repo, draftRoot, 'alpha/unsafe-aux'))

const budgetFile = path.join(repo, draftRoot, 'alpha/oversized.bin')
fs.writeFileSync(budgetFile, '')
fs.truncateSync(budgetFile, 65 * 1024 * 1024) // sparse: budget fails before reading or copying these bytes
assert.throws(() => retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot), /byte budget/)
fs.unlinkSync(budgetFile)

const draftDirectory = path.join(state, 'module-incomplete-drafts')
const preservedDraftDirectory = `${draftDirectory}-fixture-backup`
fs.renameSync(draftDirectory, preservedDraftDirectory)
fs.symlinkSync(path.join(repo, 'marker-victim-not-created'), draftDirectory)
assert.deepEqual(recoverNonCleanExactModulePublication({ ticker: 'DRAFT', module: 'alpha', targetRunRoot: draftRoot,
  synthesisOrbs: ['99_alpha-synthesis'] }),
{ disposition: 'recovery-failed', reason: 'explicit_incomplete_module_retention_failed' },
'archive failure stops recovery before any synthesis deletion')
assert.equal(fs.readFileSync(path.join(repo, draftRoot, 'alpha/99_alpha-synthesis.md'), 'utf8'), draft)
fs.unlinkSync(draftDirectory)
fs.renameSync(preservedDraftDirectory, draftDirectory)

// The backup path is computed internally from the validated logical identity. It can retain the sole draft
// left by a crash even when the replacement canonical module is already clean.
const backup = path.join(repo, 'analyses/.resume-backup-DRAFT_2099-01-01-alpha')
fs.renameSync(path.join(repo, draftRoot, 'alpha'), backup)
write(`${draftRoot}/alpha/01_alpha-check.md`, '# approved replacement\n')
const backupArchive = retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot, 'resume-backup')!
assert.equal(fs.readFileSync(path.join(backupArchive, 'files/99_alpha-synthesis.md'), 'utf8'), draft)
assert.equal(retainExplicitIncompleteModule('DRAFT', 'alpha', draftRoot), null,
  'a valid replacement without the reserved declaration needs no draft archive')

// One transient failure at the manifest commit boundary must preserve the partial history and original
// draft while allowing a later approved attempt to construct a fresh verified snapshot.
const interruptedRoot = 'analyses/INTERRUPTED_2099-01-01'
write(`${interruptedRoot}/alpha/99_alpha-synthesis.md`, draft)
write(`${interruptedRoot}/alpha/aux.json`, '{"interrupted":true}\n')
const archiveNamesBefore = new Set(fs.readdirSync(draftDirectory))
const originalRename = fs.renameSync
let injectedManifestFailure = false
fs.renameSync = ((from, to) => {
  if (!injectedManifestFailure && String(to).startsWith(draftDirectory + path.sep)
      && path.basename(String(to)) === 'manifest.json') {
    injectedManifestFailure = true
    throw Object.assign(new Error('injected archive manifest EIO'), { code: 'EIO' })
  }
  return originalRename(from, to)
}) as typeof fs.renameSync
try {
  assert.throws(() => retainExplicitIncompleteModule('INTERRUPTED', 'alpha', interruptedRoot), /injected archive manifest EIO/)
} finally { fs.renameSync = originalRename }
assert.ok(injectedManifestFailure)
assert.equal(fs.readFileSync(path.join(repo, interruptedRoot, 'alpha/99_alpha-synthesis.md'), 'utf8'), draft)
const partialName = fs.readdirSync(draftDirectory).find((name) => !archiveNamesBefore.has(name))!
assert.ok(partialName)
const partial = path.join(draftDirectory, partialName)
assert.ok(!fs.existsSync(path.join(partial, 'manifest.json')), 'failed commit has no authoritative manifest')
assert.equal(fs.readFileSync(path.join(partial, 'files/aux.json'), 'utf8'), '{"interrupted":true}\n')
const retriedArchive = retainExplicitIncompleteModule('INTERRUPTED', 'alpha', interruptedRoot)!
assert.equal(retriedArchive, partial, 'fresh verified attempt occupies the canonical content-bound archive identity')
assert.ok(fs.existsSync(path.join(retriedArchive, 'manifest.json')))
assert.equal(retainExplicitIncompleteModule('INTERRUPTED', 'alpha', interruptedRoot), retriedArchive,
  'successful recovery remains idempotent')
const interruptedHistory = fs.readdirSync(draftDirectory).filter((name) => name.startsWith(`${partialName}.interrupted-`))
assert.equal(interruptedHistory.length, 1, 'the incomplete archive remains as separate append-only history')
assert.equal(fs.readFileSync(path.join(draftDirectory, interruptedHistory[0], 'files/99_alpha-synthesis.md'), 'utf8'), draft)
assert.equal(fs.readFileSync(path.join(draftDirectory, interruptedHistory[0], 'files/aux.json'), 'utf8'), '{"interrupted":true}\n')
assert.equal(captureCompletedModuleFingerprint('INTERRUPTED', 'alpha', interruptedRoot), null)
assert.equal(validPendingModulePublication('INTERRUPTED', 'alpha'), null, 'recovered raw snapshot still confers no publication authority')

// If durable marker storage is unsafe/unavailable, recovery must not strand a valid 99 as "done". It removes
// only the server-bound synthesis leaf; the specialist evidence remains, so the next plan reruns synthesis.
write('analyses/GAMMA_2099-01-01/alpha/01_alpha-check.md', '# retained specialist\n')
write('analyses/GAMMA_2099-01-01/alpha/99_alpha-synthesis.md', '# unpublishable summary\n')
const markerDir = path.join(state, 'module-publication-pending')
fs.rmSync(markerDir, { recursive: true, force: true })
const markerVictim = path.join(repo, 'marker-victim')
fs.mkdirSync(markerVictim)
fs.symlinkSync(markerVictim, markerDir)
const quarantined = recoverNonCleanExactModulePublication({
  ticker: 'GAMMA',
  module: 'alpha',
  targetRunRoot: 'analyses/GAMMA_2099-01-01',
  synthesisOrbs: ['99_alpha-synthesis'],
})
assert.deepEqual(quarantined, { disposition: 'synthesis-quarantined' },
  'marker failure falls back to a synthesis rerun instead of leaving a false done state')
assert.equal(fs.existsSync(path.join(repo, 'analyses/GAMMA_2099-01-01/alpha/99_alpha-synthesis.md')), false)
assert.equal(fs.readFileSync(path.join(repo, 'analyses/GAMMA_2099-01-01/alpha/01_alpha-check.md'), 'utf8'),
  '# retained specialist\n')
assert.deepEqual(fs.readdirSync(markerVictim), [], 'an unsafe marker-directory symlink is never followed')

console.log('module publication: durable marker + non-clean recovery/quarantine + stale/symlink rejection passed')
