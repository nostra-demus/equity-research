process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const state = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-provider-lease-')))
process.env.ENGINE_STATE_DIR = state

const { REPO_ROOT } = await import('../src/config')
const { reconcileOrphanedProviderGroups } = await import('../src/launcher')
const { readLastProviderSelection } = await import('../src/execution-provenance')

const runId = randomUUID()
const runRoot = `analyses/ZZLEASE_${Date.now()}`
const absoluteRoot = path.join(REPO_ROOT, runRoot)
const leaseDir = path.join(state, 'provider-process-groups')
fs.mkdirSync(absoluteRoot, { recursive: true })
fs.mkdirSync(leaseDir, { recursive: true, mode: 0o700 })

const leader = spawn(process.execPath, ['-e', "process.on('SIGTERM',()=>{}); setInterval(()=>{},1000)"], {
  detached: true,
  stdio: 'ignore',
})
assert.ok(leader.pid)

try {
  const raw = execFileSync('ps', ['-o', 'pgid=', '-o', 'lstart=', '-p', String(leader.pid)], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
  const match = /^(\d+)\s+(.+)$/.exec(raw)
  assert.ok(match)
  assert.equal(Number(match[1]), leader.pid, 'detached provider fixture must own its process group')
  const unsigned = {
    schema_version: 'cockpit-provider-process/1.0',
    run_id: runId,
    run_root: runRoot,
    subject: 'ZZLEASE',
    swarm: 'research',
    kind: 'module',
    provider: 'codex',
    profile_key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    model: 'gpt-5.6-sol',
    reasoning_level: 'max',
    execution_profile: {
      key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
      parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
      specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
    },
    pid: leader.pid,
    process_started: match[2].trim(),
    run_started_at: Date.now(),
  }
  const lease = {
    ...unsigned,
    self_sha256: `sha256:${createHash('sha256').update(JSON.stringify(unsigned)).digest('hex')}`,
  }
  const leasePath = path.join(leaseDir, `${runId}.json`)
  fs.writeFileSync(leasePath, `${JSON.stringify(lease, null, 2)}\n`, { mode: 0o600 })

  assert.equal(await reconcileOrphanedProviderGroups(), 1)
  assert.throws(() => process.kill(-leader.pid!, 0), (error: any) => error?.code === 'ESRCH',
    'startup reconciliation must drain the whole detached provider group')
  assert.equal(fs.existsSync(leasePath), false)
  const marker = JSON.parse(fs.readFileSync(path.join(absoluteRoot, '.interrupted'), 'utf8'))
  assert.equal(marker.reason, 'supervisor_restart')
  assert.equal(marker.provider, 'codex')
  const selection = readLastProviderSelection(runRoot, 'interrupted')
  assert.equal(selection?.provider, 'codex')
  assert.equal(selection?.profileKey, unsigned.profile_key)

  fs.writeFileSync(path.join(leaseDir, `${randomUUID()}.json`), '{"forged":true}\n', { mode: 0o600 })
  await assert.rejects(reconcileOrphanedProviderGroups(), /invalid provider-process lease/,
    'a malformed protected lease blocks admission instead of silently forgetting a possible writer')
} finally {
  try { if (leader.pid) process.kill(-leader.pid, 'SIGKILL') } catch { /* already reconciled */ }
  fs.rmSync(absoluteRoot, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
}

console.log('PASS: durable provider process leases reconcile detached writers before admission')
