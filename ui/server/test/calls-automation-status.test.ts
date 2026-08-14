import assert from 'node:assert/strict'
import test from 'node:test'
import { combineCallsAutomationStatus, type CallsAutomationPart } from '../src/calls-automation-status'

const part = (overrides: Partial<CallsAutomationPart> = {}): CallsAutomationPart => ({
  enabled: true,
  state: 'watching',
  message: 'Watching.',
  last_checked_at: null,
  next_check_at: null,
  queued: 0,
  running: 0,
  ...overrides,
})

const news = (overrides: Partial<Parameters<typeof combineCallsAutomationStatus>[0]['news']> = {}) => ({
  running: true,
  sweeping: false,
  lastSweepAt: null,
  nextSweepAt: '2026-08-14T12:00:00.000Z',
  manifestError: null,
  cursorError: null,
  retentionGaps: [],
  retentionGapError: null,
  ...overrides,
})

const newsSource = (overrides: Partial<Parameters<typeof combineCallsAutomationStatus>[0]['newsSource']> = {}) => ({
  enabled: true,
  running: false,
  readOnly: false,
  lastCycleAt: null,
  schedulerActive: true,
  schedulerStartedAt: '2026-08-14T09:00:00.000Z',
  sourceLastCycleAt: '2026-08-14T11:45:00.000Z',
  sourceLastError: null,
  intervalMin: 15,
  ...overrides,
})

const combined = (overrides: Partial<Parameters<typeof combineCallsAutomationStatus>[0]> = {}) => ({
  intake: part(), updates: part(), reviews: part(), news: news(), newsSource: newsSource(),
  now: Date.parse('2026-08-14T12:00:00.000Z'),
  ...overrides,
})

test('green Calls status requires the material-news watcher to be running', () => {
  const status = combineCallsAutomationStatus({
    ...combined(), news: news({ running: false }),
  })
  assert.equal(status.enabled, false)
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.message, 'Automatic news checks are not running on this machine.')
  assert.equal(status.next_check_at, null)
})

test('a damaged news manifest is visible instead of a false green status', () => {
  const status = combineCallsAutomationStatus({
    ...combined(), news: news({ manifestError: 'bad manifest' }),
  })
  assert.equal(status.enabled, true)
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.message, 'Automatic news checks need attention.')
})

test('a damaged news position is visible and never reports automatic coverage as healthy', () => {
  const status = combineCallsAutomationStatus({
    ...combined(), news: news({ cursorError: 'damaged cursor' }),
  })
  assert.equal(status.state, 'needs_attention')
  assert.match(status.message, /saved position needs attention/)
})

test('a known older-news gap is plain and never reports full automatic coverage as healthy', () => {
  const status = combineCallsAutomationStatus({
    ...combined(),
    news: news({ retentionGaps: [{ subject: 'AMZN', days: 6, detectedAt: '2026-08-14T10:00:00.000Z' }] }),
  })
  assert.equal(status.enabled, true)
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.next_check_at, null)
  assert.equal(status.message, 'Some older company news could not be checked. New news will still be checked automatically.')
})

test('an unreadable older-news gap record is visible instead of green', () => {
  const status = combineCallsAutomationStatus({
    ...combined(),
    news: news({ retentionGapError: 'record damaged' }),
  })
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.message, 'The saved older-news check needs attention.')
})

test('healthy parts and a live news watcher produce the plain automatic status', () => {
  const status = combineCallsAutomationStatus({
    ...combined(),
    intake: part({ last_checked_at: '2026-08-14T10:00:00.000Z' }),
    updates: part({ next_check_at: '2026-08-14T11:00:00.000Z' }),
    reviews: part({ next_check_at: '2026-08-14T13:00:00.000Z' }),
    news: news({ lastSweepAt: '2026-08-14T10:30:00.000Z' }),
  })
  assert.equal(status.enabled, true)
  assert.equal(status.state, 'watching')
  assert.equal(status.last_checked_at, '2026-08-14T10:30:00.000Z')
  assert.equal(status.next_check_at, '2026-08-14T11:00:00.000Z')
  assert.match(status.message, /You do not need to do anything/)
})

test('an active news sweep makes the Calls screen say it is checking now', () => {
  const status = combineCallsAutomationStatus({
    ...combined(), news: news({ sweeping: true }),
  })
  assert.equal(status.state, 'checking')
  assert.equal(status.running, 1)
  assert.equal(status.message, 'New information is being checked now.')
})

test('an enabled watcher that failed to start keeps the whole Calls status out of green', () => {
  const status = combineCallsAutomationStatus({
    ...combined(),
    intake: part(),
    updates: part({ state: 'needs_attention', message: 'Automatic call update watcher is not running on this machine.' }),
    reviews: part(),
    news: news(),
  })
  assert.equal(status.enabled, true)
  assert.equal(status.state, 'needs_attention')
  assert.match(status.message, /not running on this machine/i)
})

test('material-news promise requires a live source scheduler, not only a live bridge', () => {
  const status = combineCallsAutomationStatus(combined({
    newsSource: newsSource({ schedulerActive: false, schedulerStartedAt: null, sourceLastCycleAt: null }),
  }))
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.message, 'The company-news scanner is not running.')
  assert.equal(status.next_check_at, null)
})

test('a retained timer without any successful source cycle cannot make Calls green', () => {
  const status = combineCallsAutomationStatus(combined({
    newsSource: newsSource({
      schedulerActive: true,
      schedulerStartedAt: '2026-08-14T09:00:00.000Z',
      sourceLastCycleAt: null,
    }),
  }))
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.message, 'The company-news scanner has not completed a successful source check.')
})

test('a bounded first-cycle grace says starting, not falsely watching', () => {
  const status = combineCallsAutomationStatus(combined({
    newsSource: newsSource({
      schedulerActive: true,
      schedulerStartedAt: '2026-08-14T11:59:00.000Z',
      sourceLastCycleAt: null,
    }),
  }))
  assert.equal(status.state, 'checking')
  assert.equal(status.message, 'The company-news scanner is starting its first automatic check.')
})

test('the latest failed source cycle is visible even while its timer remains active', () => {
  const status = combineCallsAutomationStatus(combined({
    newsSource: newsSource({ sourceLastError: 'cycle error: all upstreams failed' }),
  }))
  assert.equal(status.state, 'needs_attention')
  assert.match(status.message, /could not complete its latest source check/)
})

test('a durable standalone failure outranks an older fresh success', () => {
  const status = combineCallsAutomationStatus(combined({
    newsSource: newsSource({
      schedulerActive: false,
      schedulerStartedAt: null,
      readOnly: true,
      sourceLastCycleAt: '2026-08-14T11:55:00.000Z',
      sourceLastError: 'cycle error: source network unavailable',
    }),
  }))
  assert.equal(status.state, 'needs_attention')
  assert.match(status.message, /latest source check/)
})

test('a fresh standalone source heartbeat supports automatic news without an in-server timer', () => {
  const now = Date.parse('2026-08-14T12:00:00.000Z')
  const status = combineCallsAutomationStatus(combined({
    now,
    newsSource: newsSource({
      schedulerActive: false,
      schedulerStartedAt: null,
      readOnly: true,
      sourceLastCycleAt: '2026-08-14T11:40:00.000Z',
    }),
  }))
  assert.equal(status.state, 'watching')
})

test('a stale standalone source heartbeat cannot keep Calls green', () => {
  const now = Date.parse('2026-08-14T12:00:00.000Z')
  const status = combineCallsAutomationStatus(combined({
    now,
    newsSource: newsSource({
      schedulerActive: false,
      schedulerStartedAt: null,
      readOnly: true,
      sourceLastCycleAt: '2026-08-14T10:00:00.000Z',
    }),
  }))
  assert.equal(status.state, 'needs_attention')
  assert.equal(status.message, 'The separate company-news scanner has not checked in recently.')
})

test('an active source pass makes the simple Calls status say it is checking now', () => {
  const status = combineCallsAutomationStatus(combined({
    newsSource: newsSource({ running: true }),
  }))
  assert.equal(status.state, 'checking')
  assert.equal(status.running, 1)
})
