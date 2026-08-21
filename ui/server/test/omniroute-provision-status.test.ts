import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  OMNIROUTE_DISABLED_REASON,
  omniRouteDisabledReason,
  parseOmniRouteRetryMarker,
} from '../src/news/omniroute-provision-status'

const NOW = Date.parse('2026-08-21T13:00:00Z')
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'omniroute-status-home-'))
const ops = path.join(home, '.nostra-ops')
const marker = path.join(ops, '.omniroute-retry')
fs.mkdirSync(ops, { mode: 0o700 })

function writeMarker(value: string): void {
  fs.rmSync(marker, { force: true })
  fs.writeFileSync(marker, value, { mode: 0o600 })
  fs.chmodSync(marker, 0o600)
}

assert.deepEqual(parseOmniRouteRetryMarker('1787318100 scorer-smoke-429\n'), {
  retryAtMs: 1_787_318_100_000,
  reason: 'scorer-smoke-429',
})
assert.ok(parseOmniRouteRetryMarker('1787318100 service-install-failed'))
assert.ok(parseOmniRouteRetryMarker('1787318100 engine-health-failed-after-enable-disable-failed'))

for (const invalid of [
  '',
  '1787318100 unknown-new-reason\n',
  '1787318100 scorer-smoke-429 extra\n',
  '1787318100 scorer-smoke-429\nprivate-extra-data\n',
  '1787318100 scorer_smoke_429\n',
  '1787318100 scorer-smoke-999\n',
]) assert.equal(parseOmniRouteRetryMarker(invalid), null, `reject ${JSON.stringify(invalid)}`)

writeMarker(`${Math.floor((NOW + 15 * 60_000) / 1000)} scorer-smoke-429\n`)
const scheduled = omniRouteDisabledReason(home, NOW)
assert.match(scheduled, /Last recorded deploy status: the production scorer proof failed with HTTP 429/)
assert.match(scheduled, /next automatic retry at 2026-08-21 13:15 UTC \(in 15m\)/)
assert.match(scheduled, /12-item scorer smoke automatically.*enables only after.*passes/i)

writeMarker(`${Math.floor((NOW - 2 * 60_000) / 1000)} loopback-service-health-failed\n`)
assert.match(omniRouteDisabledReason(home, NOW), /loopback service did not become healthy; automatic retry has been eligible since/)
assert.match(omniRouteDisabledReason(home, NOW), /deploy agent may be stalled or a retry may be in progress/)

writeMarker(`${Math.floor((NOW - 2 * 24 * 60 * 60_000) / 1000)} scorer-smoke-503\n`)
const overdue = omniRouteDisabledReason(home, NOW)
assert.match(overdue, /production scorer proof failed with HTTP 503/)
assert.match(overdue, /automatic retry has been eligible since 2026-08-19 13:00 UTC/,
  'retry-not-before is durable incident evidence, not an expiry time')

writeMarker(`${Math.floor((NOW + 25 * 60 * 60_000) / 1000)} scorer-smoke-503\n`)
assert.equal(omniRouteDisabledReason(home, NOW), OMNIROUTE_DISABLED_REASON, 'an impossible future retry fails closed')

writeMarker(`${Math.floor((NOW + 60_000) / 1000)} scorer-smoke-503 private-extra-data\n`)
const malformed = omniRouteDisabledReason(home, NOW)
assert.equal(malformed, OMNIROUTE_DISABLED_REASON)
assert.doesNotMatch(malformed, /private-extra-data/)

fs.rmSync(marker, { force: true })
assert.equal(omniRouteDisabledReason(home, NOW), OMNIROUTE_DISABLED_REASON, 'missing marker is rolling-deploy safe')

const target = path.join(home, 'redirected-marker')
fs.writeFileSync(target, `${Math.floor((NOW + 60_000) / 1000)} scorer-smoke-429\n`, { mode: 0o600 })
fs.symlinkSync(target, marker)
assert.equal(omniRouteDisabledReason(home, NOW), OMNIROUTE_DISABLED_REASON, 'a symlink marker is never followed')

fs.rmSync(marker, { force: true })
fs.chmodSync(ops, 0o777)
writeMarker(`${Math.floor((NOW + 60_000) / 1000)} scorer-smoke-429\n`)
assert.equal(omniRouteDisabledReason(home, NOW), OMNIROUTE_DISABLED_REASON, 'a writable marker parent fails closed')

fs.rmSync(ops, { recursive: true, force: true })
const redirectedOps = path.join(home, 'redirected-ops')
fs.mkdirSync(redirectedOps, { mode: 0o700 })
fs.writeFileSync(path.join(redirectedOps, '.omniroute-retry'),
  `${Math.floor((NOW + 60_000) / 1000)} scorer-smoke-429\n`, { mode: 0o600 })
fs.symlinkSync(redirectedOps, ops)
assert.equal(omniRouteDisabledReason(home, NOW), OMNIROUTE_DISABLED_REASON, 'a symlink marker parent is never followed')

fs.rmSync(home, { recursive: true, force: true })
console.log('omniroute-provision-status.test.ts: all checks passed')
