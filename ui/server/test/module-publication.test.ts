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
