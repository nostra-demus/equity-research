// The Data Library must distinguish one stopped scheduler from many broken feeds.  These tests cover the
// runner heartbeat contract and its time-based projection without touching the real shared data pool.
import assert from 'node:assert/strict'

const { classifyConnectorFetchService, parseRunnerHeartbeat } = await import('../src/connector-service-status')

const NOW = Date.parse('2026-08-13T12:00:00Z')
const heartbeat = (overrides: Record<string, unknown> = {}) => ({
  schema_version: 1,
  service: 'connector-fetcher',
  state: 'completed',
  interval_seconds: 900,
  host: 'research-mac-pro',
  pid: 4321,
  sweep_started_at: '2026-08-13T11:44:00.000000Z',
  last_progress_at: '2026-08-13T11:45:00.000000Z',
  sweep_completed_at: '2026-08-13T11:45:00.000000Z',
  processed_rows: 27,
  failed_rows: 0,
  skipped_manifests: 2,
  error_code: null,
  ...overrides,
})

const valid = parseRunnerHeartbeat(heartbeat())
assert.ok(valid)
assert.deepEqual(classifyConnectorFetchService(valid, NOW), {
  state: 'online',
  note: 'The scheduled data service is online.',
  intervalMin: 15,
  host: 'research-mac-pro',
  lastStartedAt: '2026-08-13T11:44:00.000Z',
  lastProgressAt: '2026-08-13T11:45:00.000Z',
  lastCompletedAt: '2026-08-13T11:45:00.000Z',
  nextExpectedAt: '2026-08-13T12:00:00.000Z',
  processedRows: 27,
  failedRows: 0,
  skippedManifests: 2,
})

const running = parseRunnerHeartbeat(heartbeat({
  state: 'running', sweep_completed_at: null, sweep_started_at: '2026-08-13T11:56:00.000000Z',
  last_progress_at: '2026-08-13T11:59:00.000000Z', processed_rows: 8,
}))
assert.equal(classifyConnectorFetchService(running, NOW).state, 'running', 'fresh progress keeps a long sweep healthy')
const longButLive = parseRunnerHeartbeat(heartbeat({
  state: 'running', sweep_completed_at: null, sweep_started_at: '2026-08-13T11:00:00.000000Z',
  last_progress_at: '2026-08-13T11:10:01.000000Z', processed_rows: 8,
}))
assert.equal(classifyConnectorFetchService(longButLive, NOW).state, 'running', 'a running sweep gets a full 60-minute progress window')
const wedged = parseRunnerHeartbeat(heartbeat({
  state: 'running', sweep_completed_at: null, sweep_started_at: '2026-08-13T10:00:00.000000Z',
  last_progress_at: '2026-08-13T10:59:59.000000Z', processed_rows: 8,
}))
assert.equal(classifyConnectorFetchService(wedged, NOW).state, 'late')

const stale = parseRunnerHeartbeat(heartbeat({
  sweep_started_at: '2026-08-13T10:00:00.000000Z', last_progress_at: '2026-08-13T10:01:00.000000Z',
  sweep_completed_at: '2026-08-13T10:01:00.000000Z',
}))
assert.equal(classifyConnectorFetchService(stale, NOW).state, 'late', 'three missed 15-minute ticks is one service incident')

const failed = parseRunnerHeartbeat(heartbeat({ state: 'failed', error_code: 'runner_exit' }))
assert.equal(classifyConnectorFetchService(failed, NOW).state, 'failed')

const future = parseRunnerHeartbeat(heartbeat({
  sweep_started_at: '2026-08-13T12:20:00.000000Z', last_progress_at: '2026-08-13T12:20:00.000000Z',
  sweep_completed_at: '2026-08-13T12:20:00.000000Z',
}))
assert.equal(classifyConnectorFetchService(future, NOW).state, 'unknown', 'future telemetry cannot prove health')

assert.equal(classifyConnectorFetchService(null, NOW).state, 'not_started')
assert.equal(parseRunnerHeartbeat(heartbeat({ interval_seconds: 0 })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ interval_seconds: 3600 })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ processed_rows: -1 })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ processed_rows: 1, failed_rows: 2 })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ service: 'something-else' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ host: '' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ host: 'mac\nspoofed' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ error_code: 'x'.repeat(121) })), null)
assert.equal(parseRunnerHeartbeat({ ...heartbeat(), unexpected: 'extension' }), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ sweep_started_at: 'Thu, 13 Aug 2026 11:44:00 GMT' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ sweep_started_at: '2026-04-31T11:44:00.000000Z' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ sweep_started_at: '2026-08-13T24:00:00.000000Z' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ sweep_started_at: '0000-08-13T11:44:00.000000Z' })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ state: 'completed', sweep_completed_at: null })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ state: 'running', error_code: 'runner_exit', sweep_completed_at: null })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ state: 'failed', error_code: null })), null)
assert.equal(parseRunnerHeartbeat(heartbeat({ last_progress_at: '2026-08-13T11:40:00.000000Z' })), null)

console.log('connector-service-status.test.ts: heartbeat validation and service projection passed')
