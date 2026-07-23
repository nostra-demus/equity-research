// feed-health — the PURE fold of #287's run_ledger.ndjson into per connector × subject fetch health, which
// BOTH the repair watchdog and the Data Library read. No filesystem. Run: npx tsx test/feed-health.test.ts.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { feedHealthFromLedger, feedHealthOf, feedKey, BROKEN_THRESHOLD } = await import('../src/feed-health')

const row = (o: Record<string, unknown>) => JSON.stringify(o)
const H = (m: Map<string, any>, c: string, s: string) => feedHealthOf(m, c, s)

// ── the raw decision → state mapping ──
check('a refetched sweep reads ok', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'refetched', ts: 100 })).get(feedKey('a', 'X'))!.state === 'ok')
check('a fresh (no-fetch) sweep reads ok', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'fresh' })).get(feedKey('a', 'X'))!.state === 'ok')
check('one failed sweep reads failing (not yet broken)', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'failed', message: 'e' })).get(feedKey('a', 'X'))!.state === 'failing')
check('skipped_no_pool reads no_pool', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'skipped_no_pool' })).get(feedKey('a', 'X'))!.state === 'no_pool')
check('skipped_manual reads manual', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'skipped_manual' })).get(feedKey('a', 'X'))!.state === 'manual')
check('would_refetch (dry-run) reads pending', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'would_refetch' })).get(feedKey('a', 'X'))!.state === 'pending')

// ── the broken threshold: only a SUSTAINED run of failures is broken ──
const fail = (c: string, s: string, msg = 'e', ts = 0) => row({ connector: c, subject: s, decision: 'failed', message: msg, ts })
const okRow = (c: string, s: string, dec = 'refetched') => row({ connector: c, subject: s, decision: dec })
check('the default threshold is 3', BROKEN_THRESHOLD === 3)
check('2 consecutive failures → failing, not broken', H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').state === 'failing')
check('3 consecutive failures → broken', H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').state === 'broken')
check('a success mid-run resets the streak → failing again after 1 later fail',
  H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X'), okRow('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').state === 'failing')
check('the failStreak counts the trailing run only', H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').failStreak === 3)
check('a recovered feed has failStreak 0', H(feedHealthFromLedger([fail('a', 'X'), okRow('a', 'X')].join('\n')), 'a', 'X').failStreak === 0)

// ── latest-wins, message, ts ──
const mixed = feedHealthFromLedger([
  fail('cot', 'WHEAT', 'HTTP 500'),
  okRow('cot', 'WHEAT'),
  fail('cot', 'CORN', 'schema drift', 1_700_000_000),
].join('\n'))
check('latest decision wins (recovered feed reads ok)', H(mixed, 'cot', 'WHEAT').state === 'ok')
check('the message is the latest failing row\'s', H(mixed, 'cot', 'CORN').message === 'schema drift')
check('lastSweepAt is derived from ts (seconds → ISO)', H(mixed, 'cot', 'CORN').lastSweepAt === '2023-11-14T22:13:20Z')
check('a row without ts has a null lastSweepAt', H(mixed, 'cot', 'WHEAT').lastSweepAt === null)

// ── robustness ──
check('empty ledger → empty map', feedHealthFromLedger('').size === 0)
check('garbage + array + missing-subject rows are skipped without throwing',
  feedHealthFromLedger(['not json', '[1,2,3]', row({ connector: 'x', decision: 'failed' }), fail('a', 'X')].join('\n')).size === 1)
check('feedHealthOf returns never_run for an unknown feed', feedHealthOf(new Map(), 'nope', 'ZZZ').state === 'never_run')
check('feedHealthOf never_run default has failStreak 0 and null sweep', (() => { const f = feedHealthOf(new Map(), 'n', 'Z'); return f.failStreak === 0 && f.lastSweepAt === null })())

console.log(`\nfeed-health.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
