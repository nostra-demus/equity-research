// The "New data" panel's reading list: the cockpit names each document as the document-intake run opens
// it, instead of showing one static "Reading the new documents…" line for the whole analysis. That needs
// two things the stream never used to carry:
//   1. activityTarget() — WHAT a tool call acts on (the heartbeat only ever carried the tool NAME).
//   2. a bounded activity ring, replayed on subscribe — the run starts reading before any client can
//      attach, so without a replay the feed would always open mid-thought.
// Run: npx tsx test/run-activity.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import path from 'node:path'

const { REPO_ROOT } = await import('../src/config')
const { activityTarget } = await import('../src/stream-parser')
const { createRun, recordActivity, subscribe } = await import('../src/registry')

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e: any) {
    console.error(`  ✗ ${name}\n    ${e?.message}`)
    process.exitCode = 1
  }
}

console.log('\nactivityTarget — what the call is acting on')

check('a Read names the document, repo-relative (not the machine path)', () => {
  const abs = path.join(REPO_ROOT, 'data/EMAAR/Emaar_Properties_Annual_2025.pdf')
  assert.equal(activityTarget('Read', { file_path: abs }), 'data/EMAAR/Emaar_Properties_Annual_2025.pdf')
})

check('a path outside the repo keeps only its tail — never a whole home directory', () => {
  const t = activityTarget('Read', { file_path: '/Users/someone/private/notes/thesis.md' })
  assert.equal(t, 'notes/thesis.md')
  assert.ok(!t!.includes('/Users/'), 'an absolute outside path must not print its full tree')
})

check('Bash leads with its own description, not the shell', () => {
  assert.equal(
    activityTarget('Bash', { command: 'find data/EMAAR/ -type f -newer "$WATERMARK"', description: 'List pool files newer than the last run' }),
    'List pool files newer than the last run',
  )
})

check('Bash with no description falls back to the first clause of the command', () => {
  assert.equal(activityTarget('Bash', { command: 'ls -1d analyses/EMAAR_*/ | sort -r' }), 'ls -1d analyses/EMAAR_*/')
})

check('Glob/Grep say what was searched and where', () => {
  assert.equal(activityTarget('Glob', { pattern: '*.pdf', path: path.join(REPO_ROOT, 'data/EMAAR') }), '*.pdf in data/EMAAR')
  assert.equal(activityTarget('Grep', { pattern: 'related party' }), 'related party')
})

check('WebFetch reports the host via the URL parser, never a substring guess', () => {
  assert.equal(activityTarget('WebFetch', { url: 'https://www.dfm.ae/issuer/EMAAR?x=1' }), 'www.dfm.ae')
  // a crafted URL that mentions a trusted host in its PATH must not be reported as that host
  assert.equal(activityTarget('WebFetch', { url: 'https://evil.example/dfm.ae/issuer' }), 'evil.example')
})

check('a long or multi-line target is flattened and capped — the panel renders it inline', () => {
  const t = activityTarget('Bash', { description: `${'x'.repeat(400)}\n\nsecond line` })!
  assert.ok(t.length <= 160, `expected <=160 chars, got ${t.length}`)
  assert.ok(!t.includes('\n'), 'must be one line')
  assert.ok(t.endsWith('…'), 'a truncated target must say it was truncated')
})

check('an unknown tool, or an input naming nothing, yields no target (the row shows the tool alone)', () => {
  assert.equal(activityTarget('SomeFutureTool', { file_path: '/x/y.txt' }), undefined)
  assert.equal(activityTarget('Read', {}), undefined)
  assert.equal(activityTarget('Read', null), undefined)
  assert.equal(activityTarget('Bash', { description: '   ' }), undefined)
})

console.log('\nactivity ring — a client attaching mid-run still sees what it missed')

function newRun() {
  return createRun({
    kind: 'doc-intake',
    ticker: 'EMAAR',
    model: 'test',
    prompt: '/research:intake EMAAR',
    user: 'local',
    userVia: 'local',
    runRoot: null,
    willCommitToMain: false,
    writeTargetsAbs: [],
    coveredModules: [],
    readDepsAbs: [],
  })
}

check('subscribe replays the steps taken before the client connected', () => {
  const run = newRun()
  recordActivity(run, { tool: 'Read', target: 'data/EMAAR/a.pdf', ts: 1 })
  recordActivity(run, { tool: 'Read', target: 'data/EMAAR/b.pdf', ts: 2 })
  const seen: any[] = []
  subscribe(run, { id: 'c1', send: (e) => seen.push(e) })
  const activity = seen.filter((e) => e.type === 'run-activity')
  assert.equal(activity.length, 2)
  assert.deepEqual(activity.map((e) => e.target), ['data/EMAAR/a.pdf', 'data/EMAAR/b.pdf'])
  assert.ok(activity.every((e) => e.runId === run.runId))
})

check('the ring is bounded and keeps the NEWEST steps — a long run cannot grow it without limit', () => {
  const run = newRun()
  for (let i = 0; i < 500; i++) recordActivity(run, { tool: 'Read', target: `data/EMAAR/${i}.pdf`, ts: i })
  assert.ok(run.activity.length <= 80, `ring should stay bounded, got ${run.activity.length}`)
  assert.equal(run.activity[run.activity.length - 1].target, 'data/EMAAR/499.pdf', 'newest step must survive')
})

check('activity stays OUT of the event log — it must not bloat every subscriber replay', () => {
  const run = newRun()
  for (let i = 0; i < 10; i++) recordActivity(run, { tool: 'Read', target: `data/EMAAR/${i}.pdf`, ts: i })
  assert.equal(run.eventLog.length, 0)
})

console.log(`\n${passed} passed${process.exitCode ? ' — SOME FAILED' : ''}`)
