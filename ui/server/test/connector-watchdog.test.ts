// connector-watchdog — the PURE ledger reader at the heart of the repair watchdog: given #287's
// run_connectors.py fetch ledger (run_ledger.ndjson), return only the connector × subject whose LATEST
// decision is `failed`. No filesystem, no spawn. Run: npx tsx test/connector-watchdog.test.ts.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { brokenFromLedger, latestLedgerMessage, BROKEN_THRESHOLD } = await import('../src/connector-runner')

// A mixed ledger, chronological (append order). One JSON row per connector × subject per sweep:
//   - cot::WHEAT recovered: failed earlier, then refetched → NOT broken (latest wins).
//   - eia::NG stayed fresh throughout → NOT broken.
//   - cot::CORN broke on its last sweep → broken (this is the one to repair).
//   - wgc::GOLD skipped (no pool) then failed → broken.
//   - <garbage line> is skipped without throwing.
//   - a row missing `subject` is skipped (not a valid connector × subject).
const ledger = [
  JSON.stringify({ connector: 'cot', subject: 'WHEAT', decision: 'failed', outcome: 'stalled', message: 'HTTP 500', latest_as_of: null }),
  JSON.stringify({ connector: 'eia', subject: 'NG', decision: 'fresh', outcome: 'current', message: '', latest_as_of: '2026-07-18' }),
  JSON.stringify({ connector: 'cot', subject: 'CORN', decision: 'fresh', outcome: 'current', message: '', latest_as_of: '2026-07-01' }),
  '{ this is not json',
  JSON.stringify({ connector: 'wgc', subject: 'GOLD', decision: 'skipped_no_pool', outcome: 'no_pool', message: 'no pool', latest_as_of: null }),
  JSON.stringify({ connector: 'cot', subject: 'WHEAT', decision: 'refetched', outcome: 'current', message: 'ok', latest_as_of: '2026-07-19' }),
  JSON.stringify({ connector: 'eia', subject: 'NG', decision: 'fresh', outcome: 'current', message: '', latest_as_of: '2026-07-19' }),
  JSON.stringify({ connector: 'cot', subject: 'CORN', decision: 'failed', outcome: 'stalled', message: 'schema drift: missing field', latest_as_of: null }),
  JSON.stringify({ connector: 'wgc', subject: 'GOLD', decision: 'failed', outcome: 'stalled', message: 'endpoint 404', latest_as_of: null }),
  JSON.stringify({ connector: 'nomatch', decision: 'failed', outcome: 'stalled', message: 'no subject' }), // missing subject → skipped
].join('\n')

// The grouping / latest-wins / message / skip-malformed behaviour is exercised at threshold 1 (each broken
// feed above has a single latest `failed` row) — threshold 1 means "latest decision is failed", the exact
// semantics before the consecutive-failure guard was added.
const key = (b: { connector: string; subject: string }) => `${b.connector}::${b.subject}`
const broken = brokenFromLedger(ledger, 1)
const keys = broken.map(key).sort()

check('only latest-failed feeds are returned (threshold 1)', keys.length === 2 && keys[0] === 'cot::CORN' && keys[1] === 'wgc::GOLD', `got ${JSON.stringify(keys)}`)
check('a feed whose latest row is refetched/fresh is NOT returned (even though it failed earlier)', !keys.includes('cot::WHEAT'))
check('a feed that was always fresh is NOT returned', !keys.includes('eia::NG'))
check('the returned message is the LATEST failed row\'s message', broken.find((b) => key(b) === 'cot::CORN')?.message === 'schema drift: missing field')
check('a row without a subject is skipped', !keys.includes('nomatch::'))

// malformed / empty input never throws and yields []
check('empty string → []', brokenFromLedger('').length === 0)
check('whitespace-only lines → []', brokenFromLedger('\n  \n\n').length === 0)
check('all-garbage input → [] (no throw)', brokenFromLedger('nope\n{bad\n]also bad[').length === 0)

// message defaults to '' when the failed row has no message field
const noMsg = brokenFromLedger(JSON.stringify({ connector: 'x', subject: 'Y', decision: 'failed', outcome: 'stalled' }), 1)
check('missing message on a failed row → empty string', noMsg.length === 1 && noMsg[0].message === '')

// ── Consecutive-failure threshold (Codex #310): a single transient failed sweep must NOT be treated as
// broken; only a SUSTAINED run of BROKEN_THRESHOLD (default 3) consecutive failed sweeps is. ──
const fail = (c: string, s: string, msg: string) => JSON.stringify({ connector: c, subject: s, decision: 'failed', outcome: 'stalled', message: msg })
const ok = (c: string, s: string, dec = 'refetched') => JSON.stringify({ connector: c, subject: s, decision: dec, outcome: 'current', message: '' })
const streak3 = [fail('a', 'X', 'e1'), fail('a', 'X', 'e2'), fail('a', 'X', 'e3')].join('\n')
check('the default threshold is 3', BROKEN_THRESHOLD === 3)
check('1 failed sweep → NOT broken at default threshold (transient blip)', brokenFromLedger(fail('a', 'X', 'e1')).length === 0)
check('2 consecutive failed sweeps → NOT broken at default threshold', brokenFromLedger([fail('a', 'X', 'e1'), fail('a', 'X', 'e2')].join('\n')).length === 0)
check('3 consecutive failed sweeps → broken at default threshold', (() => { const b = brokenFromLedger(streak3); return b.length === 1 && key(b[0]) === 'a::X' && b[0].message === 'e3' })(), 'expected a::X broken with latest message e3')
check('a success mid-run RESETS the streak: 2 failed → refetched → 2 failed = NOT broken', brokenFromLedger([fail('a', 'X', 'e1'), fail('a', 'X', 'e2'), ok('a', 'X'), fail('a', 'X', 'e3'), fail('a', 'X', 'e4')].join('\n')).length === 0)
check('a fresh (no-fetch) row also resets the streak', brokenFromLedger([fail('a', 'X', 'e1'), fail('a', 'X', 'e2'), ok('a', 'X', 'fresh'), fail('a', 'X', 'e3')].join('\n')).length === 0)
check('4 consecutive failed sweeps → still broken (streak exceeds threshold)', brokenFromLedger([fail('a', 'X', 'e1'), fail('a', 'X', 'e2'), fail('a', 'X', 'e3'), fail('a', 'X', 'e4')].join('\n')).length === 1)

// latestLedgerMessage — the last recorded message for a connector × subject across ANY decision, so the
// manual repair trigger hands the coding agent the same last-error the watchdog does (Gemini #310 finding).
check('latestLedgerMessage returns the LATEST failed row\'s message for a feed', latestLedgerMessage(ledger, 'cot', 'CORN') === 'schema drift: missing field')
check('latestLedgerMessage returns the latest row across decisions (recovered feed → its last message)', latestLedgerMessage(ledger, 'cot', 'WHEAT') === 'ok')
check('latestLedgerMessage → "" for a connector × subject not in the ledger', latestLedgerMessage(ledger, 'cot', 'SOYBEAN') === '')
check('latestLedgerMessage → "" on empty / garbage ledger (no throw)', latestLedgerMessage('', 'cot', 'CORN') === '' && latestLedgerMessage('nope\n{bad', 'cot', 'CORN') === '')
check('latestLedgerMessage skips a JSON array row without throwing', latestLedgerMessage('[1,2,3]\n' + JSON.stringify({ connector: 'cot', subject: 'CORN', decision: 'failed', outcome: 'stalled', message: 'real' }), 'cot', 'CORN') === 'real')

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
