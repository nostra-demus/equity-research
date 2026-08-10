// pipelines rollUpVerdict — the PURE roll-up that turns a feed's per-subject file+fetch statuses into the
// one-word headline the Data Library leads with (live / attention / broken / unknown) plus the sentence
// behind it. A dead fetcher must outrank a stale file, which must outrank a clean one. No filesystem.
// Run: npx tsx test/pipelines-verdict.test.ts.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { rollUpVerdict, runtimeRepairStatus } = await import('../src/pipelines')

// a status builder — file side + fetch side, the two independent facts rollUpVerdict weighs
const st = (over: Partial<any> = {}) => ({ subject: 'X', status: 'fresh', health: 'current', failStreak: 0, ageDays: 2, ...over })

check('a pool-less host is unknown, never a fake missing', rollUpVerdict([st()], 10, false).verdict === 'unknown')
check('no subjects → unknown', rollUpVerdict([], 10, true).verdict === 'unknown')

check('hard-disabled automation cannot project an old repairing row as active',
  runtimeRepairStatus('repairing', false) === 'assessed')
check('an available isolated runtime may still show its live repairing row',
  runtimeRepairStatus('repairing', true) === 'repairing')
check('hard-disabled automation does not rewrite durable PR and terminal states',
  runtimeRepairStatus('pr_open', false) === 'pr_open' && runtimeRepairStatus('verified', false) === 'verified')

check('a clean feed inside its window is live', rollUpVerdict([st()], 10, true).verdict === 'live')
check('live note names the age and canonical release window',
  /2 days old and inside its declared release window/.test(rollUpVerdict([st()], 10, true).note))

// broken fetch outranks everything, even a fresh file (the case worth catching)
const brokenFresh = rollUpVerdict([st({ status: 'fresh', health: 'broken', failStreak: 4, lastError: 'HTTP 500' })], 10, true)
check('a broken fetch with a fresh file still reads broken', brokenFresh.verdict === 'broken')
check('the broken note names the failure count and error', /last 4 fetches .* failed .* HTTP 500/.test(brokenFresh.note), brokenFresh.note)

check('a single stalled release reads attention (not yet broken)', rollUpVerdict([st({ health: 'stalled', failStreak: 1, lastError: 'timeout' })], 10, true).verdict === 'attention')
check('schema_failed is distinct attention', /schema/.test(rollUpVerdict([st({ health: 'schema_failed', lastError: 'bad shape' })], 10, true).note))
check('credentials_missing is distinct attention', /credentials/.test(rollUpVerdict([st({ health: 'credentials_missing' })], 10, true).note))
check('no_pool reads attention', rollUpVerdict([st({ health: 'no_pool' })], 10, true).verdict === 'attention')
const neverRunFresh = rollUpVerdict([st({ status: 'fresh', health: 'never_run' })], 10, true)
check('a fresh file with never_run health is attention, not live', neverRunFresh.verdict === 'attention')
check('never_run fresh file is explicitly non-usable for sufficiency', /not usable for data sufficiency/.test(neverRunFresh.note))
const pendingFresh = rollUpVerdict([st({ status: 'fresh', health: 'pending' })], 10, true)
check('a fresh file with pending health is attention, not live', pendingFresh.verdict === 'attention')
check('pending fresh file is explicitly non-usable for sufficiency', /not usable for data sufficiency/.test(pendingFresh.note))

// file side, when the fetch side is clean
check('a stale file reads attention', rollUpVerdict([st({ status: 'stale', ageDays: 40 })], 10, true).verdict === 'attention')
check('stale note names the canonical deadline',
  /past its expected release plus grace deadline/.test(rollUpVerdict([st({ status: 'stale', ageDays: 40 })], 10, true).note))
check('a missing file (never swept) reads attention', rollUpVerdict([st({ status: 'missing', health: 'never_run' })], 10, true).verdict === 'attention')
const projectionDamage = rollUpVerdict([st({ status: 'missing', health: 'current', projectionIntact: false })], 10, true)
check('a damaged projection is attention even when canonical fetch health is current', projectionDamage.verdict === 'attention')
check('a damaged projection note names the projection/sidecar integrity failure', /projection.*sidecar.*canonical/i.test(projectionDamage.note))

// a manual (hand-staged) feed inside its window is still live, and says so
const manual = rollUpVerdict([st({ health: 'manual' })], 10, true)
check('a manual feed with a fresh file is live', manual.verdict === 'live')
check('the manual note says it is hand-staged', /hand-staged/.test(manual.note))

// priority: broken beats stale beats clean across MULTIPLE subjects
const multi = rollUpVerdict([st({ subject: 'A' }), st({ subject: 'B', status: 'stale', ageDays: 30 }), st({ subject: 'C', health: 'broken', failStreak: 3, lastError: '404' })], 14, true)
check('the neediest subject decides the roll-up (broken C wins)', multi.verdict === 'broken' && /404/.test(multi.note))

console.log(`\npipelines-verdict.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
