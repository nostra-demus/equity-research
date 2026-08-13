import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import type { RunnerStatus } from '../../lib/types'
import { connectorServiceDisplay } from './connectorService'

const exact = (overrides: Partial<NonNullable<RunnerStatus['fetcher']>> = {}): NonNullable<RunnerStatus['fetcher']> => ({
  contractVersion: 2, state: 'online', note: 'Verified.', autoRetryArmed: true, intervalMin: 15,
  host: 'fixture-mac', lastStartedAt: '2026-08-13T11:44:00.000Z', lastProgressAt: '2026-08-13T11:45:00.000Z',
  lastCompletedAt: '2026-08-13T11:45:00.000Z', nextExpectedAt: '2026-08-13T12:00:00.000Z',
  processedRows: 3, failedRows: 0, skippedManifests: 0, ...overrides,
})
let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

check('exact service states have the required simplest labels', () => {
  const expected = {
    starting: 'Starting', checking: 'Checking', online: 'Online', paused_drive: 'Paused — Drive',
    disabled_admin: 'Disabled — admin', blocked_unsafe: 'Blocked — unsafe scheduler',
    foreign_writer: 'Foreign writer',
  } as const
  for (const [state, label] of Object.entries(expected)) {
    const timing = state === 'checking' ? { lastCompletedAt: null, nextExpectedAt: null } : {}
    assert.equal(connectorServiceDisplay(exact({ state: state as keyof typeof expected, ...timing })).label, label)
  }
})

check('old, missing and future deploy-skew payloads fail closed to Starting', () => {
  assert.equal(connectorServiceDisplay(undefined).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), contractVersion: 1 } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), state: 'future' } as unknown as RunnerStatus['fetcher']).state, 'starting')
  const { note: _missing, ...missing } = exact()
  assert.equal(connectorServiceDisplay(missing as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), extra: true } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), processedRows: -1 } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), host: 'bad\nhost' } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), host: 'bad host' } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), lastProgressAt: 'not-a-time' } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), lastProgressAt: 'Thu, 13 Aug 2026 11:45:00 GMT' } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), autoRetryArmed: false } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), processedRows: 0 } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.equal(connectorServiceDisplay({ ...exact(), note: ' ' } as unknown as RunnerStatus['fetcher']).state, 'starting')
  assert.match(connectorServiceDisplay(undefined).note, /Waiting for verified Mac Pro service status/)
})

check('the strip says auto-retry only when the exact proof bit is true', () => {
  assert.equal(connectorServiceDisplay(exact()).autoRetryArmed, true)
  assert.equal(connectorServiceDisplay(exact({ state: 'starting', autoRetryArmed: false })).autoRetryArmed, false)
  const source = readFileSync(new URL('./DataLibrary.tsx', import.meta.url), 'utf8')
  assert.match(source, /service\.autoRetryArmed \? ' · Auto-retry armed'/)
  assert.doesNotMatch(source, /retry automatically|will restart/i)
})

check('Checking is not rendered as Online and feed incidents stay separate', () => {
  const checking = connectorServiceDisplay(exact({
    state: 'checking', note: 'Checking feeds now.', lastCompletedAt: null, nextExpectedAt: null,
  }))
  assert.equal(checking.label, 'Checking')
  assert.notEqual(checking.label, 'Online')
  const source = readFileSync(new URL('./DataLibrary.tsx', import.meta.url), 'utf8')
  assert.match(source, /role="status" aria-live="polite"/)
  assert.match(source, /feed incidents remain listed separately/)
})

check('Drive absence keeps the service label while making file freshness unavailable', () => {
  assert.equal(connectorServiceDisplay(exact({ state: 'disabled_admin' })).label, 'Disabled — admin')
  const source = readFileSync(new URL('./DataLibrary.tsx', import.meta.url), 'utf8')
  assert.match(source, /file freshness is unavailable until Drive is ready/)
})

console.log(`connectorService.test.ts: ${passed} checks passed`)
