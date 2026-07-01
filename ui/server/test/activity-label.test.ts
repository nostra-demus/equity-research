// Activity log Company column: a swarm run is keyed by an opaque subject id (a SIG-… signal id, or a
// thesisId::TICKER handoff), which means nothing to a reader. The server resolves it to the company /
// headline it concerns, populates a dropdown label map, and makes free-text search match that name.
// This covers the pure resolver and an end-to-end readActivity pass over a temp audit log.
// Run: npx tsx test/activity-label.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// STATE_DIR is read at config import time, so point it at a temp dir BEFORE importing the module.
const STATE = fs.mkdtempSync(path.join(os.tmpdir(), 'actlog-'))
process.env.ENGINE_STATE_DIR = STATE
const { readActivity, resolveSubjectLabel } = await import('../src/activity-log')
const { subjectLabelFromEvent, subjectLabelsFromLedger } = await import('../src/screener')

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const sigLabels = new Map<string, string>([
  ['SIG-20260616-11abb6d2', 'Schneider Electric SE'],
  ['SIG-20260616-eae0b41e', 'Norben Tea & Exports Limited'],
])

// ---- pure resolver ----
check('resolves a SIG id to its company via the ledger map', () => {
  assert.equal(resolveSubjectLabel('SIG-20260616-11abb6d2', sigLabels), 'Schneider Electric SE')
})
check('resolves a handoff subject (thesisId::TICKER) to the target ticker — no map needed', () => {
  assert.equal(resolveSubjectLabel('THS-20260616-abcd1234::AAPL', undefined), 'AAPL')
})
check('a research ticker has no override label (the ticker IS the label)', () => {
  assert.equal(resolveSubjectLabel('AAPL', sigLabels), undefined)
})
check('an unknown SIG id falls back to undefined — caller shows the raw id', () => {
  assert.equal(resolveSubjectLabel('SIG-20260619-755ea4d0', sigLabels), undefined)
})

// ---- the ledger-line label derivation (locks the field name — this is the path the bug shipped in) ----
check('subjectLabelFromEvent reads the ledger `issuers` field and cleans the role parenthetical', () => {
  assert.equal(subjectLabelFromEvent({ signal_id: 'SIG-x', issuers: ['Reserve Bank of India (policy authority)'], headline: 'RBI cuts repo rate by 50 bps' }), 'Reserve Bank of India')
  assert.equal(subjectLabelFromEvent({ issuers: ['MGM Resorts International (NYSE: MGM)'], headline: 'Barry Diller and others buy MGM shares' }), 'MGM Resorts International')
})
check('subjectLabelFromEvent falls back to the headline when no issuer is named', () => {
  assert.equal(subjectLabelFromEvent({ issuers: [], headline: 'A macro headline with no issuer' }), 'A macro headline with no issuer')
  assert.equal(subjectLabelFromEvent({ headline: 'No issuers field at all' }), 'No issuers field at all')
})
check('subjectLabelFromEvent does NOT read `primary_issuers` (the old bug) — that field never existed on the ledger line', () => {
  // a record carrying only the wrong field must fall back to the headline, not surface the wrong-field value
  assert.equal(subjectLabelFromEvent({ primary_issuers: ['Wrong Field Co'], headline: 'The headline wins, not the wrong field' }), 'The headline wins, not the wrong field')
})

// ---- the map build over a multi-line-per-signal ledger (the clobber regression) ----
// The ledger accrues several lines per signal; the first usually names the issuer, later corrections often
// carry only a headline. A named-issuer label must survive a later headline-only line for the same signal.
check('subjectLabelsFromLedger keeps the named issuer when a LATER line for the same signal has only a headline', () => {
  const text = [
    JSON.stringify({ signal_id: 'SIG-A', issuers: ['Reserve Bank of India (policy authority)'], headline: 'RBI cuts repo rate by 50 bps' }),
    JSON.stringify({ signal_id: 'SIG-A', headline: 'RBI cuts repo rate by 50 bps — markets react' }), // later line, issuer dropped
  ].join('\n')
  assert.equal(subjectLabelsFromLedger(text).get('SIG-A'), 'Reserve Bank of India')
})
check('subjectLabelsFromLedger lets a later ISSUER line win over an earlier one (richer / corrected)', () => {
  const text = [
    JSON.stringify({ signal_id: 'SIG-B', issuers: ['Intel Corp (NASDAQ: INTC)'], headline: 'Intel upgraded' }),
    JSON.stringify({ signal_id: 'SIG-B', issuers: ['Intel Corporation'], headline: 'Intel upgraded by BofA' }),
  ].join('\n')
  assert.equal(subjectLabelsFromLedger(text).get('SIG-B'), 'Intel Corporation')
})
check('subjectLabelsFromLedger: an earlier issuer line is not undone by a later headline-only line, even with a headline-first line', () => {
  const text = [
    JSON.stringify({ signal_id: 'SIG-D', headline: 'first sight, no issuer yet' }),
    JSON.stringify({ signal_id: 'SIG-D', issuers: ['Honeywell International Inc.'], headline: 'Honeywell names new CFO' }),
    JSON.stringify({ signal_id: 'SIG-D', headline: 'follow-up with no issuer' }),
  ].join('\n')
  assert.equal(subjectLabelsFromLedger(text).get('SIG-D'), 'Honeywell International Inc.')
})
check('subjectLabelsFromLedger: a headline-only signal falls back to the headline; blanks and bad JSON are skipped', () => {
  const text = ['', 'not json{', JSON.stringify({ signal_id: 'SIG-E', issuers: [], headline: 'A macro headline with no issuer' }), ''].join('\n')
  const m = subjectLabelsFromLedger(text)
  assert.equal(m.get('SIG-E'), 'A macro headline with no issuer')
  assert.equal(m.size, 1)
})

// ---- end-to-end over a temp audit log ----
const logLine = (o: any) => JSON.stringify(o) + '\n'
const t0 = 1_700_000_000_000
fs.writeFileSync(
  path.join(STATE, 'activity-log.jsonl'),
  logLine({ v: 1, event: 'launched', ts: t0, runId: 'r1', user: 'u', userVia: 'local', kind: 'signal', ticker: 'SIG-20260616-11abb6d2' }) +
    logLine({ v: 1, event: 'finished', ts: t0 + 1000, runId: 'r1', user: 'u', userVia: 'local', kind: 'signal', ticker: 'SIG-20260616-11abb6d2', status: 'done' }) +
    logLine({ v: 1, event: 'launched', ts: t0 + 2000, runId: 'r2', user: 'u', userVia: 'local', kind: 'full', ticker: 'AAPL' }) +
    logLine({ v: 1, event: 'launched', ts: t0 + 3000, runId: 'r3', user: 'u', userVia: 'local', kind: 'handoff', ticker: 'THS-1::MSFT' }),
)

check('readActivity enriches each row with subjectLabel', () => {
  const res = readActivity({}, sigLabels)
  assert.equal(res.rows.find((r) => r.runId === 'r1')!.subjectLabel, 'Schneider Electric SE')
  assert.equal(res.rows.find((r) => r.runId === 'r3')!.subjectLabel, 'MSFT')
  assert.equal(res.rows.find((r) => r.runId === 'r2')!.subjectLabel, undefined)
})
check('readActivity builds tickerLabels only for ids that resolve', () => {
  const res = readActivity({}, sigLabels)
  assert.equal(res.tickerLabels['SIG-20260616-11abb6d2'], 'Schneider Electric SE')
  assert.equal(res.tickerLabels['THS-1::MSFT'], 'MSFT')
  assert.equal('AAPL' in res.tickerLabels, false)
})
check('free-text search matches the resolved company name, not just the id', () => {
  const res = readActivity({ q: 'schneider' }, sigLabels)
  assert.equal(res.rows.length, 1)
  assert.equal(res.rows[0].runId, 'r1')
})
check('without a ledger map, handoff ids still resolve and SIG ids fall back gracefully', () => {
  const res = readActivity({})
  assert.equal(res.rows.find((r) => r.runId === 'r1')!.subjectLabel, undefined)
  assert.equal(res.rows.find((r) => r.runId === 'r3')!.subjectLabel, 'MSFT')
})

// ---- chained + swarm survive the fold (Resume needs both: a chained-full step resumes the WHOLE
// pipeline, a standalone module resumes just itself; and a commodity run must route to its swarm) ----
fs.appendFileSync(
  path.join(STATE, 'activity-log.jsonl'),
  logLine({ v: 1, event: 'launched', ts: t0 + 4000, runId: 'r4', user: 'u', userVia: 'local', kind: 'module', ticker: 'NVDA', module: 'earnings', chained: true, swarm: 'research' }) +
    logLine({ v: 1, event: 'launched', ts: t0 + 5000, runId: 'r5', user: 'u', userVia: 'local', kind: 'module', ticker: 'NVDA', module: 'business-model', swarm: 'research' }) +
    logLine({ v: 1, event: 'launched', ts: t0 + 6000, runId: 'r6', user: 'u', userVia: 'local', kind: 'full', ticker: 'GOLD', swarm: 'commodity' }),
)
check('foldRows preserves `chained` — a chained-full module step is distinguishable from a standalone module run', () => {
  const res = readActivity({})
  assert.equal(res.rows.find((r) => r.runId === 'r4')!.chained, true)
  assert.equal(res.rows.find((r) => r.runId === 'r5')!.chained, undefined)
})
check('foldRows preserves `swarm` — a commodity run carries its swarm id so Resume routes to the right swarm', () => {
  const res = readActivity({})
  assert.equal(res.rows.find((r) => r.runId === 'r6')!.swarm, 'commodity')
  assert.equal(res.rows.find((r) => r.runId === 'r4')!.swarm, 'research')
})

console.log(`\n${passed} checks passed`)
