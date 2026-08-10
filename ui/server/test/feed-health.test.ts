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
check('a refetched sweep reads current', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'refetched', outcome: 'current', ts: 100 })).get(feedKey('a', 'X'))!.state === 'current')
check('a fresh (no-fetch) sweep reads current', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'fresh', outcome: 'current' })).get(feedKey('a', 'X'))!.state === 'current')
check('one failed sweep reads stalled (not yet broken)', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'failed', outcome: 'stalled', message: 'e' })).get(feedKey('a', 'X'))!.state === 'stalled')
check('skipped_no_pool reads no_pool', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'skipped_no_pool', outcome: 'no_pool' })).get(feedKey('a', 'X'))!.state === 'no_pool')
check('skipped_manual reads manual', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'skipped_manual', outcome: 'manual' })).get(feedKey('a', 'X'))!.state === 'manual')
check('would_refetch (dry-run) reads pending', feedHealthFromLedger(row({ connector: 'a', subject: 'X', decision: 'would_refetch', outcome: 'pending' })).get(feedKey('a', 'X'))!.state === 'pending')

// ── the broken threshold: only a SUSTAINED run of failures is broken ──
const fail = (c: string, s: string, msg = 'e', ts = 0) => row({ connector: c, subject: s, decision: 'failed', outcome: 'stalled', message: msg, ts })
const okRow = (c: string, s: string, dec = 'refetched') => row({ connector: c, subject: s, decision: dec, outcome: 'current' })
check('the default threshold is 3', BROKEN_THRESHOLD === 3)
check('2 consecutive failures → stalled, not broken', H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').state === 'stalled')
check('3 consecutive failures → broken', H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').state === 'broken')
check('a success mid-run resets the streak → stalled again after 1 later fail',
  H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X'), okRow('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').state === 'stalled')
check('the failStreak counts the trailing run only', H(feedHealthFromLedger([fail('a', 'X'), fail('a', 'X'), fail('a', 'X')].join('\n')), 'a', 'X').failStreak === 3)
check('a recovered feed has failStreak 0', H(feedHealthFromLedger([fail('a', 'X'), okRow('a', 'X')].join('\n')), 'a', 'X').failStreak === 0)

// ── latest-wins, message, ts ──
const mixed = feedHealthFromLedger([
  fail('cot', 'WHEAT', 'HTTP 500'),
  okRow('cot', 'WHEAT'),
  fail('cot', 'CORN', 'schema drift', 1_700_000_000),
].join('\n'))
check('latest decision wins (recovered feed reads current)', H(mixed, 'cot', 'WHEAT').state === 'current')
check('the message is the latest failing row\'s', H(mixed, 'cot', 'CORN').message === 'schema drift')
check('lastSweepAt is derived from ts (seconds → ISO)', H(mixed, 'cot', 'CORN').lastSweepAt === '2023-11-14T22:13:20Z')
check('a row without ts has a null lastSweepAt', H(mixed, 'cot', 'WHEAT').lastSweepAt === null)
const ledgerWarning = 'connector run ledger contains 1 malformed or contract-invalid row(s); valid prior attempt clocks were retained'
const currentWithLedgerWarning = H(feedHealthFromLedger(row({
  connector: 'cot', subject: 'GOLD', decision: 'fresh', outcome: 'current',
  ledger_integrity_warning: ledgerWarning,
})), 'cot', 'GOLD')
check('an accepted current row preserves its independent ledger-integrity warning',
  currentWithLedgerWarning.state === 'current' && currentWithLedgerWarning.ledgerIntegrityWarning === ledgerWarning)
check('a later clean accepted row clears an older projected ledger warning', H(feedHealthFromLedger([
  row({ connector: 'cot', subject: 'GOLD', decision: 'fresh', outcome: 'current', ledger_integrity_warning: ledgerWarning }),
  row({ connector: 'cot', subject: 'GOLD', decision: 'fresh', outcome: 'current' }),
].join('\n')), 'cot', 'GOLD').ledgerIntegrityWarning === null)

// ── v2 public states remain exact while technical failure_kind stays available ──
const exact = (outcome: string, failure_kind?: string) => H(feedHealthFromLedger(row({
  connector: 'v2', subject: 'X', decision: outcome === 'current' || outcome === 'no_new_release' ? 'refetched' : 'failed',
  outcome, failure_kind,
})), 'v2', 'X')
check('unchanged fetch exposes no_new_release', exact('no_new_release').state === 'no_new_release')
check('schema rejection exposes schema_failed + technical schema_error', (() => { const h = exact('schema_failed', 'schema_error'); return h.state === 'schema_failed' && h.failureKind === 'schema_error' })())
check('no output can expose stalled + technical no_output', (() => { const h = exact('stalled', 'no_output'); return h.state === 'stalled' && h.failureKind === 'no_output' })())
check('missing credentials stays credentials_missing instead of becoming broken', H(feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'credentials_missing' }),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'credentials_missing' }),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'credentials_missing' }),
].join('\n')), 'v2', 'X').state === 'credentials_missing')
check('quality controls expose suspect/quarantined exactly', exact('suspect').state === 'suspect' && exact('quarantined').state === 'quarantined')

// ── due-attempt deferral preserves health without manufacturing a retry ──
const deferredAfterNoRelease = H(feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'refetched', outcome: 'no_new_release', message: 'unchanged' }),
  row({ connector: 'v2', subject: 'X', decision: 'deferred', outcome: 'stalled', message: 'unchanged' }),
].join('\n')), 'v2', 'X')
check('a deferred no-new-release feed may age to stalled without an attempted failure',
  deferredAfterNoRelease.state === 'stalled' && deferredAfterNoRelease.failStreak === 0
    && deferredAfterNoRelease.decision === 'deferred' && deferredAfterNoRelease.message === 'unchanged')

for (const preserved of ['credentials_missing', 'suspect', 'quarantined'] as const) {
  const deferred = H(feedHealthFromLedger([
    row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: preserved,
      failure_kind: `${preserved}_detail`, message: `${preserved} remains visible` }),
    row({ connector: 'v2', subject: 'X', decision: 'deferred', outcome: preserved,
      failure_kind: `${preserved}_detail`, message: `${preserved} remains visible` }),
  ].join('\n')), 'v2', 'X')
  check(`deferred preserves ${preserved} health and detail`,
    deferred.state === preserved && deferred.failStreak === 0
      && deferred.failureKind === `${preserved}_detail`
      && deferred.message === `${preserved} remains visible`)
}

const deferredFailureStreak = feedHealthFromLedger([
  fail('v2', 'X'), fail('v2', 'X'),
  row({ connector: 'v2', subject: 'X', decision: 'deferred', outcome: 'stalled', message: 'retry later' }),
].join('\n'))
check('a deferred sweep neither resets nor increments the prior failed-attempt streak',
  H(deferredFailureStreak, 'v2', 'X').state === 'stalled'
    && H(deferredFailureStreak, 'v2', 'X').failStreak === 2)
const failedAfterDeferred = feedHealthFromLedger([
  fail('v2', 'X'), fail('v2', 'X'),
  row({ connector: 'v2', subject: 'X', decision: 'deferred', outcome: 'stalled' }),
  fail('v2', 'X'),
].join('\n'))
check('the next actual failure continues the streak after a deferred sweep',
  H(failedAfterDeferred, 'v2', 'X').state === 'broken'
    && H(failedAfterDeferred, 'v2', 'X').failStreak === 3)

// ── decision/outcome rows are an exact contract, not "latest JSON wins" ──
const validThenInvalid = feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'refetched', outcome: 'current', message: 'accepted' }),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'current', message: 'impossible pair' }),
].join('\n'))
check('an invalid failed/current pair is ignored', H(validThenInvalid, 'v2', 'X').message === 'accepted' && H(validThenInvalid, 'v2', 'X').state === 'current')
const validThenMissingOutcome = feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'fresh', outcome: 'current', message: 'accepted' }),
  row({ connector: 'v2', subject: 'X', decision: 'fresh', message: 'missing outcome must not win' }),
  row({ connector: 'v2', subject: 'X', decision: 'fresh', outcome: null, message: 'null outcome must not win' }),
].join('\n'))
check('missing/null outcomes are rejected in parity with the Python ledger reader',
  H(validThenMissingOutcome, 'v2', 'X').message === 'accepted'
    && H(validThenMissingOutcome, 'v2', 'X').outcome === 'current')
const validThenUnknown = feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'refetched', outcome: 'current', message: 'accepted' }),
  row({ connector: 'v2', subject: 'X', decision: 'new_unrecognised_decision', message: 'must not erase' }),
].join('\n'))
check('an unknown decision does not erase the prior accepted state', H(validThenUnknown, 'v2', 'X').message === 'accepted' && H(validThenUnknown, 'v2', 'X').state === 'current')
check('one failed/broken row is stalled until the sustained-failure threshold',
  H(feedHealthFromLedger(row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'broken' })), 'v2', 'X').state === 'stalled')
check('reprojected/current is accepted as current',
  H(feedHealthFromLedger(row({ connector: 'v2', subject: 'X', decision: 'reprojected', outcome: 'current' })), 'v2', 'X').state === 'current')
const recoveredCommit = H(feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'quarantined', failure_kind: 'current_integrity', message: 'held' }),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'suspect', failure_kind: 'provider_disagreement', message: 'disputed' }),
  row({ connector: 'v2', subject: 'X', decision: 'recovered_commit', outcome: 'current', message: 'recovered' }),
].join('\n')), 'v2', 'X')
check('recovered_commit/current clears older quarantine and provider disagreement state',
  recoveredCommit.state === 'current' && recoveredCommit.failStreak === 0
    && recoveredCommit.failureKind === null && recoveredCommit.message === 'recovered')
const suspectBreaksStreak = feedHealthFromLedger([
  fail('v2', 'X'), fail('v2', 'X'),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'suspect' }),
  fail('v2', 'X'),
].join('\n'))
check('suspect is non-escalating and resets an ordinary failure streak',
  H(suspectBreaksStreak, 'v2', 'X').state === 'stalled' && H(suspectBreaksStreak, 'v2', 'X').failStreak === 1)
check('repeated suspect outcomes never escalate to broken', H(feedHealthFromLedger([
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'suspect' }),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'suspect' }),
  row({ connector: 'v2', subject: 'X', decision: 'failed', outcome: 'suspect' }),
].join('\n')), 'v2', 'X').state === 'suspect')

// ── robustness ──
check('empty ledger → empty map', feedHealthFromLedger('').size === 0)
check('garbage + array + missing-subject rows are skipped without throwing',
  feedHealthFromLedger(['not json', '[1,2,3]', row({ connector: 'x', decision: 'failed' }), fail('a', 'X')].join('\n')).size === 1)
check('feedHealthOf returns never_run for an unknown feed', feedHealthOf(new Map(), 'nope', 'ZZZ').state === 'never_run')
check('feedHealthOf never_run default has no stale ledger warning', (() => { const f = feedHealthOf(new Map(), 'n', 'Z'); return f.failStreak === 0 && f.lastSweepAt === null && f.ledgerIntegrityWarning === null })())

console.log(`\nfeed-health.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
