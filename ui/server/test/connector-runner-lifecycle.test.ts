// connector-runner lifecycle integration. Unlike connector-health.test.ts, this calls the real sweep()
// against throwaway ledgers and proves the runner appends a terminal event for an orphaned `repairing` row.
// Run: npx tsx test/connector-runner-lifecycle.test.ts.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-runner-lifecycle-'))
const state = path.join(repo, '.state')
const repairDir = path.join(state, 'connectors')
const fetchDir = path.join(repo, 'data', '_connectors')
const scriptsDir = path.join(repo, 'scripts')
const binDir = path.join(repo, 'bin')
const ghCalledMarker = path.join(repo, 'gh-was-called')
fs.mkdirSync(repairDir, { recursive: true })
fs.mkdirSync(fetchDir, { recursive: true })
fs.mkdirSync(scriptsDir, { recursive: true })
fs.mkdirSync(binDir, { recursive: true })

const here = path.dirname(fileURLToPath(import.meta.url))
fs.copyFileSync(path.resolve(here, '../../../scripts/append-ndjson.sh'), path.join(scriptsDir, 'append-ndjson.sh'))
fs.writeFileSync(path.join(binDir, 'gh'), `#!/bin/sh\n: > "${ghCalledMarker}"\nexit 1\n`, { mode: 0o755 })

process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = state
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.ENGINE_CONNECTOR_RUNNER_ENABLED = '1'
process.env.ENGINE_CONNECTOR_AUTO_REPAIR = '1'
process.env.ENGINE_CONNECTOR_DISPATCH_ENABLED = '1'
process.env.GH_PR_TOKEN = 'test-only-token'
process.env.PATH = `${binDir}:${process.env.PATH || ''}`

const staleRepair = {
  record_id: 'repair-before-restart', kind: 'connector_repair', connector_id: 'fixture-connector',
  subject: 'FIXTURE', base_fingerprint: 'old-fingerprint', base_commit: 'old-commit',
  status: 'repairing', pr_url: null, note: 'started in an earlier process', at: '2026-01-01T00:00:00Z',
}
const openRepair = {
  record_id: 'open-pr-while-disabled', kind: 'connector_repair', connector_id: 'remote-connector',
  subject: 'REMOTE', base_fingerprint: 'remote-old-fingerprint', base_commit: 'a'.repeat(40),
  status: 'pr_open', pr_url: 'https://github.com/nostra-demus/equity-research/pull/123',
  note: 'must remain pending while automation is disabled', at: '2026-01-02T00:00:00Z',
}
fs.writeFileSync(
  path.join(repairDir, 'health.ndjson'),
  `${JSON.stringify(staleRepair)}\n${JSON.stringify(openRepair)}\n`,
)
fs.writeFileSync(path.join(fetchDir, 'run_ledger.ndjson'), '')

const { connectorAutoRepairReady } = await import('../src/config')
const { sweep } = await import('../src/connector-runner')
const { readAll } = await import('../src/connector-health')

try {
  assert.equal(connectorAutoRepairReady(), false, 'missing isolation must hard-disable automatic coding')
  assert.deepEqual(sweep(), { broken: 0, repairs: 0 })
  assert.equal(fs.existsSync(ghCalledMarker), false, 'disabled automation must not synchronously inspect GitHub')

  let terminal = readAll().find((event) => event.status === 'assessed' && event.subject === 'FIXTURE')
  for (let attempt = 0; !terminal && attempt < 100; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 20))
    terminal = readAll().find((event) => event.status === 'assessed' && event.subject === 'FIXTURE')
  }
  assert.ok(terminal, 'sweep must durably append assessed for the orphaned repairing state')
  assert.match(terminal.note, /disabled.*released/i)
  const remoteEvents = readAll().filter((event) => event.connector_id === 'remote-connector')
  assert.equal(remoteEvents.at(-1)?.status, 'pr_open', 'deferred remote lifecycle state must remain intact')
  console.log('  ok  actual sweep releases and durably records a hard-disabled orphaned repairing state')
  console.log('  ok  disabled automation defers remote PR inspection without discarding lifecycle state')
  console.log('\nconnector-runner-lifecycle.test.ts: 2 passed')
} finally {
  fs.rmSync(repo, { recursive: true, force: true })
}
