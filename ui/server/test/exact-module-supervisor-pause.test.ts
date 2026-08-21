// Exact standalone modules must consume a stale full-run resume signal durably. Pure disk/supervisor test:
// no Fastify listener, Git publication or model process.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'exact-module-pause-'))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = path.join(repo, '.state')
fs.mkdirSync(path.join(repo, 'analyses'), { recursive: true })

const {
  beginExactModuleSupervisorPause,
  settleExactModuleSupervisorPause,
} = await import('../src/exact-module-supervisor-pause')
const { listResumableResearchRuns } = await import('../src/resume-supervisor')
const { resetAdmittedFullRelaunch } = await import('../src/launcher')
const { hasRunMarker, readRunMarker } = await import('../src/outputs')

function interrupted(ticker: string, body: Record<string, unknown> = { reason: 'nonzero_exit' }): string {
  const runRoot = `analyses/${ticker}_2099-01-01`
  const abs = path.join(repo, runRoot)
  fs.mkdirSync(abs, { recursive: true })
  fs.writeFileSync(path.join(abs, '.interrupted'), JSON.stringify({ ...body, at: new Date().toISOString() }) + '\n')
  return runRoot
}

const resumable = (ticker: string) => listResumableResearchRuns(new Set(), Date.now())
  .some((item) => item.subject === ticker)

// A later explicit monolithic full run supersedes the exact-only pause after admission. If that new full
// attempt then breaks, its fresh `.interrupted` must be visible to the autonomous supervisor.
{
  const root = interrupted('EXACTMONO')
  const pause = beginExactModuleSupervisorPause(root, 'management-governance')
  settleExactModuleSupervisorPause(pause, 'done', true)
  assert.equal(hasRunMarker(root, '.aborted'), true)

  resetAdmittedFullRelaunch(root)
  assert.equal(hasRunMarker(root, '.aborted'), false, 'the explicit full click supersedes exact-only pause')
  assert.equal(hasRunMarker(root, '.interrupted'), false, 'the admitted full starts with a clean resume signal')

  const abs = path.join(repo, root)
  fs.writeFileSync(path.join(abs, '.interrupted'), JSON.stringify({ reason: 'nonzero_exit' }) + '\n')
  assert.equal(resumable('EXACTMONO'), true, 'a fresh monolithic-full break remains auto-resumable')
}

// Success: the old full-chain signal is consumed before admission and stays suppressed afterwards.
{
  const root = interrupted('EXACTDONE')
  assert.equal(resumable('EXACTDONE'), true)
  const pause = beginExactModuleSupervisorPause(root, 'management-governance')
  assert.equal(hasRunMarker(root, '.interrupted'), false)
  assert.equal(readRunMarker(root, '.aborted')?.reason, 'exact_module_only')
  assert.equal(resumable('EXACTDONE'), false, 'an exact-module admission is never a full-resume candidate')
  settleExactModuleSupervisorPause(pause, 'done', true)
  assert.equal(resumable('EXACTDONE'), false, 'exact success keeps autonomous full resume paused')
}

// Stop: even a pre-paid cancellation is a deliberate instruction and must keep the durable pause.
{
  const root = interrupted('EXACTSTOP', { reason: 'out_of_credits', resetsAt: 4_102_444_800 })
  const pause = beginExactModuleSupervisorPause(root, 'management-governance')
  settleExactModuleSupervisorPause(pause, 'cancelled', false)
  assert.equal(hasRunMarker(root, '.interrupted'), false)
  assert.equal(readRunMarker(root, '.aborted')?.reason, 'exact_module_only')
  assert.equal(resumable('EXACTSTOP'), false, 'Stop cannot wake the older full chain')
}

// Failure before a paid child: restore the exact previous supervisor policy so the click is mutation-safe.
{
  const previous = { reason: 'out_of_credits', resetsAt: 4_102_444_800, module: 'earnings' }
  const root = interrupted('EXACTFAIL', previous)
  const pause = beginExactModuleSupervisorPause(root, 'management-governance')
  settleExactModuleSupervisorPause(pause, 'error', false)
  assert.equal(hasRunMarker(root, '.aborted'), false)
  assert.equal(readRunMarker(root, '.interrupted')?.reason, previous.reason)
  assert.equal(readRunMarker(root, '.interrupted')?.resetsAt, previous.resetsAt)
  assert.equal(readRunMarker(root, '.interrupted')?.module, previous.module)
  assert.equal(resumable('EXACTFAIL'), true, 'a no-child failure restores the prior due full resume')
}

// Preserve an older deliberate stop on rollback, rather than replacing it with the exact-module reason.
{
  const root = interrupted('EXACTABORT')
  const abs = path.join(repo, root)
  fs.writeFileSync(path.join(abs, '.aborted'), JSON.stringify({ reason: 'cancelled', by: 'user' }) + '\n')
  const pause = beginExactModuleSupervisorPause(root, 'management-governance')
  pause.rollback()
  assert.equal(readRunMarker(root, '.aborted')?.reason, 'cancelled')
  assert.equal(readRunMarker(root, '.aborted')?.by, 'user')
  assert.equal(resumable('EXACTABORT'), false)
}

// An unreadable prior policy cannot be overwritten because it could not be restored faithfully.
{
  const root = `analyses/EXACTBAD_2099-01-01`
  const abs = path.join(repo, root)
  fs.mkdirSync(abs, { recursive: true })
  fs.writeFileSync(path.join(abs, '.interrupted'), '{not-json\n')
  assert.throws(
    () => beginExactModuleSupervisorPause(root, 'management-governance'),
    /could not safely read existing \.interrupted marker/,
  )
  assert.equal(hasRunMarker(root, '.aborted'), false)
  assert.equal(fs.readFileSync(path.join(abs, '.interrupted'), 'utf8'), '{not-json\n')
}

// Marker leaves are attacker-controlled filesystem entries. A symlink must fail before either marker is
// mutated, and atomic writes must never follow it into an external victim.
for (const leaf of ['.interrupted', '.aborted'] as const) {
  const ticker = leaf === '.interrupted' ? 'EXACTLINKI' : 'EXACTLINKA'
  const root = `analyses/${ticker}_2099-01-01`
  const abs = path.join(repo, root)
  fs.mkdirSync(abs, { recursive: true })
  const interruptedRaw = JSON.stringify({ reason: 'nonzero_exit', token: ticker }) + '\n'
  if (leaf !== '.interrupted') fs.writeFileSync(path.join(abs, '.interrupted'), interruptedRaw)
  const victim = path.join(repo, `${ticker}-victim.json`)
  const victimRaw = JSON.stringify({ protected: true, ticker }) + '\n'
  fs.writeFileSync(victim, victimRaw)
  fs.symlinkSync(victim, path.join(abs, leaf))

  assert.throws(
    () => beginExactModuleSupervisorPause(root, 'management-governance'),
    /unsafe .* marker leaf|could not safely read existing/,
  )
  assert.equal(fs.readFileSync(victim, 'utf8'), victimRaw, `${leaf} symlink target is untouched`)
  assert.equal(fs.lstatSync(path.join(abs, leaf)).isSymbolicLink(), true, `${leaf} symlink itself is not replaced`)
  if (leaf !== '.interrupted') {
    assert.equal(fs.readFileSync(path.join(abs, '.interrupted'), 'utf8'), interruptedRaw,
      'the sibling resume marker is unchanged when aborted-leaf validation fails')
  }
}

console.log('exact module supervisor pause: lifecycle + explicit-full reset + symlink-safe markers passed')
