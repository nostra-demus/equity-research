// connector-watchdog — the PURE ledger reader at the heart of the repair watchdog: given #287's
// run_connectors.py fetch ledger (run_ledger.ndjson), return only the connector × subject whose LATEST
// decision is `failed`. No filesystem, no spawn. Run: npx tsx test/connector-watchdog.test.ts.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { brokenFromLedger } = await import('../src/connector-runner')

// A mixed ledger, chronological (append order). One JSON row per connector × subject per sweep:
//   - cot::WHEAT recovered: failed earlier, then refetched → NOT broken (latest wins).
//   - eia::NG stayed fresh throughout → NOT broken.
//   - cot::CORN broke on its last sweep → broken (this is the one to repair).
//   - wgc::GOLD skipped (no pool) then failed → broken.
//   - <garbage line> is skipped without throwing.
//   - a row missing `subject` is skipped (not a valid connector × subject).
const ledger = [
  JSON.stringify({ connector: 'cot', subject: 'WHEAT', decision: 'failed', message: 'HTTP 500', latest_as_of: null }),
  JSON.stringify({ connector: 'eia', subject: 'NG', decision: 'fresh', message: '', latest_as_of: '2026-07-18' }),
  JSON.stringify({ connector: 'cot', subject: 'CORN', decision: 'fresh', message: '', latest_as_of: '2026-07-01' }),
  '{ this is not json',
  JSON.stringify({ connector: 'wgc', subject: 'GOLD', decision: 'skipped_no_pool', message: 'no pool', latest_as_of: null }),
  JSON.stringify({ connector: 'cot', subject: 'WHEAT', decision: 'refetched', message: 'ok', latest_as_of: '2026-07-19' }),
  JSON.stringify({ connector: 'eia', subject: 'NG', decision: 'fresh', message: '', latest_as_of: '2026-07-19' }),
  JSON.stringify({ connector: 'cot', subject: 'CORN', decision: 'failed', message: 'schema drift: missing field', latest_as_of: null }),
  JSON.stringify({ connector: 'wgc', subject: 'GOLD', decision: 'failed', message: 'endpoint 404', latest_as_of: null }),
  JSON.stringify({ connector: 'nomatch', decision: 'failed', message: 'no subject' }), // missing subject → skipped
].join('\n')

const broken = brokenFromLedger(ledger)
const key = (b: { connector: string; subject: string }) => `${b.connector}::${b.subject}`
const keys = broken.map(key).sort()

check('only latest-failed feeds are returned', keys.length === 2 && keys[0] === 'cot::CORN' && keys[1] === 'wgc::GOLD', `got ${JSON.stringify(keys)}`)
check('a feed whose latest row is refetched/fresh is NOT returned (even though it failed earlier)', !keys.includes('cot::WHEAT'))
check('a feed that was always fresh is NOT returned', !keys.includes('eia::NG'))
check('the returned message is the LATEST failed row\'s message', broken.find((b) => key(b) === 'cot::CORN')?.message === 'schema drift: missing field')
check('a row without a subject is skipped', !keys.includes('nomatch::'))

// malformed / empty input never throws and yields []
check('empty string → []', brokenFromLedger('').length === 0)
check('whitespace-only lines → []', brokenFromLedger('\n  \n\n').length === 0)
check('all-garbage input → [] (no throw)', brokenFromLedger('nope\n{bad\n]also bad[').length === 0)

// message defaults to '' when the failed row has no message field
const noMsg = brokenFromLedger(JSON.stringify({ connector: 'x', subject: 'Y', decision: 'failed' }))
check('missing message on a failed row → empty string', noMsg.length === 1 && noMsg[0].message === '')

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
