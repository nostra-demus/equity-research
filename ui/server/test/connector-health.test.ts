// connector-health — the PURE self-healing core: fold the attempt/repair ledger into per-feed state, and
// derive live / stale / broken / repairing + the cadence due-check. No filesystem. Run:
// npx tsx test/connector-health.test.ts.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { foldHealth, deriveStatus, isDue, BROKEN_THRESHOLD, RETRY_FLOOR_MS } = await import('../src/connector-health')
import type { ConnectorRecord, FeedHealth } from '../src/connector-health'

const DAY = 24 * 3600_000
const at = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
const t0 = Date.parse('2026-07-01T00:00:00Z')

// ---- fold: last ok, trailing failure streak, as_of, repair ----
const recs: ConnectorRecord[] = [
  { record_id: 'a1', kind: 'connector_attempt', connector_id: 'cot', subject: 'WHEAT', ok: true, as_of: '2026-06-30', error: null, at: at(t0) },
  { record_id: 'a2', kind: 'connector_attempt', connector_id: 'cot', subject: 'WHEAT', ok: false, as_of: null, error: 'HTTP 500', at: at(t0 + DAY) },
  { record_id: 'a3', kind: 'connector_attempt', connector_id: 'cot', subject: 'WHEAT', ok: false, as_of: null, error: 'missing field', at: at(t0 + 2 * DAY) },
]
const fold = foldHealth(recs)
const fh = fold.get('cot::WHEAT')!
check('fold finds the feed', !!fh)
check('last_ok_at is the last successful attempt', fh.last_ok_at === at(t0))
check('last_as_of carried from the last OK attempt', fh.last_as_of === '2026-06-30')
check('consecutive_failures = trailing failure run', fh.consecutive_failures === 2)
check('last_error is the latest failure text', fh.last_error === 'missing field')
check('repair_status none when no repair events', fh.repair_status === 'none')

// a repair event attaches to the connector
const withRepair = foldHealth([...recs, { record_id: 'r1', kind: 'connector_repair', connector_id: 'cot', status: 'pr_open', pr_url: 'https://x', note: '', at: at(t0 + 3 * DAY) }])
check('latest repair status + url fold in', withRepair.get('cot::WHEAT')!.repair_status === 'pr_open' && withRepair.get('cot::WHEAT')!.repair_pr_url === 'https://x')

// ---- deriveStatus ----
const base: FeedHealth = { connector_id: 'c', subject: 'S', last_attempt_at: at(t0), last_ok_at: at(t0), last_as_of: '2026-06-30', consecutive_failures: 0, last_error: null, repair_status: 'none', repair_pr_url: null }
const now = t0 + 3 * DAY
check('live when fresh + no failures', deriveStatus(base, 30, now) === 'live')
check('stale when older than the SLA', deriveStatus({ ...base, last_ok_at: at(t0 - 40 * DAY) }, 30, now) === 'stale')
check('no SLA → never stale (still live)', deriveStatus({ ...base, last_ok_at: at(t0 - 40 * DAY) }, null, now) === 'live')
check('broken at the failure threshold', deriveStatus({ ...base, consecutive_failures: BROKEN_THRESHOLD }, 30, now) === 'broken')
check('repairing overrides everything', deriveStatus({ ...base, consecutive_failures: 9, repair_status: 'repairing' }, 30, now) === 'repairing')
check('unknown when never attempted', deriveStatus({ ...base, last_attempt_at: null, last_ok_at: null }, 30, now) === 'unknown')

// ---- isDue: cadence interval + retry floor + event_driven ----
const fresh: FeedHealth = { ...base, last_attempt_at: at(now - 2 * DAY), last_ok_at: at(now - 2 * DAY) }
check('weekly NOT due 2 days after success', isDue(fresh, 'weekly', now) === false)
check('daily due 2 days after success', isDue({ ...base, last_attempt_at: at(now - 2 * DAY), last_ok_at: at(now - 2 * DAY) }, 'daily', now) === true)
check('never-fetched is due', isDue({ ...base, last_attempt_at: null, last_ok_at: null }, 'daily', now) === true)
check('event_driven is never on-clock due', isDue({ ...base, last_attempt_at: null, last_ok_at: null }, 'event_driven', now) === false)
check('unknown cadence is never due', isDue({ ...base, last_attempt_at: null, last_ok_at: null }, 'hourly', now) === false)
// a feed that JUST failed is held off by the retry floor even if data is stale
const justFailed: FeedHealth = { ...base, last_ok_at: at(now - 10 * DAY), last_attempt_at: at(now - (RETRY_FLOOR_MS / 2)), consecutive_failures: 1 }
check('retry floor holds off a just-failed feed', isDue(justFailed, 'daily', now) === false)
check('past the retry floor it retries', isDue({ ...justFailed, last_attempt_at: at(now - 2 * RETRY_FLOOR_MS) }, 'daily', now) === true)

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
