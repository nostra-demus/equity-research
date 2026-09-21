// Child-process fixture for test/test-publication-guard.test.ts — not a test on its own (run-all.mjs only
// globs the top-level test folder). It replays the incident path with NO committer seam installed: a full
// run that closes cleanly without its deliverables is finalized as incomplete, which writes RUN_FAILURE.md
// and hands it to the DEFAULT failure-note committer. The parent always runs this with a recording stub
// first on PATH as `bash`, so no revision of the server code can reach the real git helper from here.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR } from '../../../src/config'
import { finalizeRunOnClose } from '../../../src/launcher'
import { createRun, setActiveSubjectRun } from '../../../src/registry'

const ticker = process.env.GUARD_FIXTURE_TICKER
if (!ticker || !/^ZZGUARD[A-Z]$/.test(ticker)) throw new Error('GUARD_FIXTURE_TICKER must be a ZZGUARD* fixture ticker')
const runRoot = `analyses/${ticker}_2099-01-01`
const root = path.join(ANALYSES_DIR, `${ticker}_2099-01-01`)
fs.mkdirSync(root, { recursive: true })
try {
  const run = createRun({
    kind: 'full', ticker, provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
    profileKey: 'claude:sonnet:default',
    executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
    prompt: '', user: 'test', userVia: 'local', runRoot, willCommitToMain: true,
    writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  run.status = 'running'
  run.publicationCompleted = true
  setActiveSubjectRun(run.runId, ticker)
  finalizeRunOnClose(run, { exitCode: 0 }, '')
  console.log(`RUN_STATUS=${run.status}`)
  console.log(`CHILD_GUARD_ENV=${process.env.ENGINE_TEST_RUN ?? ''}`) // what a helper spawned from here would inherit
  console.log(`NOTE_WRITTEN=${fs.existsSync(path.join(root, 'RUN_FAILURE.md')) ? 1 : 0}`)
  // The default committer is fire-and-forget; give a spawned helper time to run before the folder goes.
  await new Promise((resolve) => setTimeout(resolve, 1000))
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
