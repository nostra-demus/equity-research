import assert from 'node:assert/strict'
import { evaluateScannerHealth, type ScannerHealthInput } from '../src/news/scanner-health'

const NOW = Date.parse('2026-08-26T03:00:00Z')

function fixture(): ScannerHealthInput {
  return {
    enabled: true,
    running: false,
    readOnly: false,
    intervalMin: 5,
    lastCycleAt: '2026-08-26T02:57:00Z',
    nextCycleAt: '2026-08-26T03:02:00Z',
    flow: { comparison: { measured: true, status: 'ahead' as const, scanningMinusInflowItemsPerHour: 120 } },
    tiers: [{
      id: 'groq', label: 'Groq', enabled: true, spendingAllowed: true, health: 'healthy',
      routing: { eligible: true, lastSuccessAt: '2026-08-26T02:57:00Z' },
    }],
    backlog: { count: 0, cap: 5_000, nearLimit: false, trend: 'flat' as const, lostToday: 0, retiredToday: 0 },
    today: { incompleteCycles: 0, totalsLowerBound: false, historyStatus: 'complete' as const, corruptCycleRows: 0 },
    lastCycle: { aborted: false },
  }
}

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

check('a completing scanner with a proven route is healthy', () => {
  const verdict = evaluateScannerHealth(fixture(), NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'healthy')
  assert.equal(verdict.code, 'healthy')
  assert.equal(verdict.restartRecommended, false)
  assert.deepEqual(verdict.findings, [])
})

check('a deliberately disabled ingester reports the setting instead of blaming a provider', () => {
  const input = fixture()
  input.enabled = false
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'idle')
  assert.equal(verdict.code, 'ingester-disabled')
  assert.equal(verdict.action, 'enable-ingester')
  assert.equal(verdict.restartRecommended, false)
})

check('an overdue scheduler recommends the one repair a restart can perform', () => {
  const input = fixture()
  input.lastCycleAt = '2026-08-26T02:30:00Z'
  input.nextCycleAt = '2026-08-26T02:50:00Z'
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'failing')
  assert.equal(verdict.code, 'scheduler-stale')
  assert.equal(verdict.action, 'restart-engine')
  assert.equal(verdict.restartRecommended, true)
})

check('startup grace does not restart a process before its first scheduled look', () => {
  const input = fixture()
  input.lastCycleAt = null
  input.nextCycleAt = null
  const starting = evaluateScannerHealth(input, NOW, NOW - 60_000)
  assert.equal(starting.code, 'scheduler-starting')
  assert.equal(starting.restartRecommended, false)

  const stuck = evaluateScannerHealth(input, NOW, NOW - 10 * 60_000)
  assert.equal(stuck.code, 'scheduler-not-started')
  assert.equal(stuck.restartRecommended, true)
})

check('an observer never restarts itself to fight the real scanner lease owner', () => {
  const input = fixture()
  input.readOnly = true
  input.lastCycleAt = null
  input.nextCycleAt = null
  const verdict = evaluateScannerHealth(input, NOW, NOW - 24 * 60 * 60_000)
  assert.equal(verdict.code, 'lease-not-owned')
  assert.equal(verdict.restartRecommended, false)
  assert.ok(verdict.findings.every((finding) => finding.code !== 'scheduler-stale' && finding.code !== 'scheduler-not-started'))
})

check('blocked providers are diagnosed without a useless engine restart', () => {
  const input = fixture()
  input.backlog.count = 250
  input.tiers[0].health = 'budget-spent'
  input.tiers[0].routing!.eligible = false
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.code, 'providers-blocked')
  assert.equal(verdict.action, 'wait-for-reset')
  assert.equal(verdict.restartRecommended, false)
})

check('standing provider faults and unproved backups remain visible while a fallback works', () => {
  const input = fixture()
  input.tiers.push({
    id: 'openrouter', label: 'OpenRouter', enabled: true, spendingAllowed: true, health: 'healthy',
    routing: { eligible: true, lastSuccessAt: null },
  })
  input.tiers.push({
    id: 'cerebras', label: 'Cerebras', enabled: true, spendingAllowed: true, health: 'unavailable',
    quarantined: true, quarantineReason: 'model_not_found', routing: { eligible: false, lastSuccessAt: null },
  })
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'degraded')
  assert.ok(verdict.findings.some((finding) => finding.code === 'provider-unproven'))
  assert.ok(verdict.findings.some((finding) => finding.code === 'provider-unproven' && finding.action === 'verify-provider'))
  assert.ok(verdict.findings.some((finding) => finding.code === 'provider-quarantined'))
  assert.equal(verdict.restartRecommended, false)
})

check('real loss and damaged queue evidence fail closed without pretending restart restores data', () => {
  const input = fixture()
  input.backlog.unavailable = true
  input.backlog.lostToday = 2
  input.backlog.retiredToday = 3
  input.today.totalsLowerBound = true
  input.today.historyStatus = 'unreadable'
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'failing')
  assert.equal(verdict.code, 'queue-state-unreadable')
  assert.ok(verdict.findings.some((finding) => finding.code === 'data-loss-recorded'))
  assert.ok(verdict.findings.some((finding) => finding.code === 'data-loss-recorded' && /^At least 5 items/.test(finding.message)))
  assert.ok(verdict.findings.some((finding) => finding.code === 'cycle-ledger-damaged'))
  assert.equal(verdict.restartRecommended, false)
})

check('incomplete fixed-hour history makes capacity unproved instead of silently healthy', () => {
  const input = fixture()
  input.flow.history = { coverage: 'partial', missingDates: ['2026-08-25'], unreadableDates: [] }
  input.flow.comparison = { measured: false, status: 'unavailable', scanningMinusInflowItemsPerHour: null }
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'degraded')
  assert.ok(verdict.findings.some((finding) => finding.code === 'flow-history-incomplete'
    && finding.action === 'repair-storage' && /1 missing date file/.test(finding.message)))
})

check('one live start receipt is allowed only while a cycle is actually running', () => {
  const input = fixture()
  input.running = true
  input.today.incompleteCycles = 1
  assert.equal(evaluateScannerHealth(input, NOW, NOW - 60 * 60_000).status, 'healthy')
  input.running = false
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.ok(verdict.findings.some((finding) => finding.code === 'cycle-completion-gap'))
})

check('a permanently recorded interruption is visible but no longer treated as an active crash', () => {
  const input = fixture()
  input.today.recordedInterruptions = 2
  input.today.totalsLowerBound = true
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.equal(verdict.status, 'degraded')
  assert.ok(verdict.findings.some((finding) => finding.code === 'cycle-interruption-recorded'
    && finding.severity === 'warning' && /permanently recorded/.test(finding.message)))
  assert.equal(verdict.findings.some((finding) => finding.code === 'cycle-completion-gap'), false)
  assert.equal(verdict.restartRecommended, false)
})

check('measured capacity shortfall and queue pressure are explicit capacity findings', () => {
  const input = fixture()
  input.backlog.count = 4_500
  input.backlog.nearLimit = true
  input.backlog.trend = 'growing'
  input.flow.comparison.status = 'behind'
  input.flow.comparison.scanningMinusInflowItemsPerHour = -1_823
  const verdict = evaluateScannerHealth(input, NOW, NOW - 60 * 60_000)
  assert.ok(verdict.findings.some((finding) => finding.code === 'backlog-pressure'))
  assert.ok(verdict.findings.some((finding) => finding.code === 'capacity-behind' && /1,823/.test(finding.message)))
  assert.equal(verdict.restartRecommended, false)
})

console.log(`${passed} scanner health tests passed`)
