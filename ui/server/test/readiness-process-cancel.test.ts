// Readiness cancellation must drain the whole detached extractor tree before returning.
// Run: npx tsx test/readiness-process-cancel.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  assessChainedReadinessOnce,
  clearChainedReadiness,
  drainProviderRunsForShutdown,
} from '../src/launcher'
import { isReadinessCancelledError, runReadinessProcess } from '../src/readiness'
import { createRun } from '../src/registry'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-readiness-cancel-'))
const script = path.join(root, 'checker.py')
const pidsFile = path.join(root, 'pids.txt')

fs.writeFileSync(script, [
  'import os, subprocess, sys, time',
  'child = subprocess.Popen(["sleep", "60"])',
  // Existence is the readiness signal, so publish only after both PIDs are readable.
  'with open(sys.argv[1] + ".tmp", "w", encoding="utf-8") as handle:',
  '    handle.write(f"{os.getpid()} {child.pid}")',
  '    handle.flush()',
  '    os.fsync(handle.fileno())',
  'os.replace(sys.argv[1] + ".tmp", sys.argv[1])',
  'while True:',
  '    time.sleep(1)',
  '',
].join('\n'))

const alive = (pid: number) => {
  try { process.kill(pid, 0); return true } catch { return false }
}

const controller = new AbortController()
let processResult: Promise<unknown> | undefined
let assessmentResult: Promise<unknown> | undefined
let chainId: string | undefined

try {
  const running = runReadinessProcess('python3', [script, pidsFile], {
    signal: controller.signal,
    timeoutMs: 15_000,
    env: { ...process.env },
  })
  // Observe early failure while waiting for readiness, and retain cleanup if an assertion fails.
  processResult = running.catch((error: unknown) => error)
  const fileDeadline = Date.now() + 5_000
  while (!fs.existsSync(pidsFile) && Date.now() < fileDeadline) {
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
  }
  assert.ok(fs.existsSync(pidsFile), 'fake checker and its descendant started')
  const [leader, descendant] = fs.readFileSync(pidsFile, 'utf8').trim().split(/\s+/).map(Number)
  assert.ok(alive(leader) && alive(descendant), 'both process-group members are live before Stop')

  controller.abort()
  await assert.rejects(running, isReadinessCancelledError,
    'Stop rejects the in-flight readiness attempt as cancellation')
  assert.equal(alive(leader), false, 'the readiness leader is gone before cancellation settles')
  assert.equal(alive(descendant), false, 'the converter/OCR descendant is gone before cancellation settles')
  console.log('PASS: readiness cancellation drains the whole detached process group before returning')

  const shutdownPidsFile = path.join(root, 'shutdown-pids.txt')
  chainId = `shutdown-readiness-${process.pid}`
  const shutdownTicker = `ZZSHUTDOWN${process.pid}`
  const runRoot = `analyses/${shutdownTicker}_2099-01-01`
  const run = createRun({
    kind: 'module', ticker: shutdownTicker, module: 'business-model',
    provider: 'claude', model: 'haiku', reasoningLevel: 'default', profileKey: 'claude:haiku:default',
    executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
    prompt: 'x', user: 'tester', userVia: 'local', runRoot,
    willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
    chained: true, chainId,
  })
  run.status = 'readiness-checking'
  const assessment = assessChainedReadinessOnce(
    chainId,
    run.runId,
    { ticker: run.ticker, runRoot },
    async (signal) => {
      await runReadinessProcess('python3', [script, shutdownPidsFile], {
        signal,
        timeoutMs: 15_000,
        env: { ...process.env },
      })
      throw new Error('cancelled checker must never return a report or reach provider admission')
    },
  )
  // Attach the rejection observer before shutdown races the process.
  assessmentResult = assessment.then(() => null, (error: unknown) => error)
  const shutdownDeadline = Date.now() + 5_000
  while (!fs.existsSync(shutdownPidsFile) && Date.now() < shutdownDeadline) {
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
  }
  if (!fs.existsSync(shutdownPidsFile)) {
    const earlyError = await assessmentResult
    assert.fail(`shutdown readiness fixture failed before its process group started: ${String((earlyError as any)?.message || earlyError)}`)
  }
  assert.ok(fs.existsSync(shutdownPidsFile), 'shutdown fixture owns a live readiness process group')
  const [shutdownLeader, shutdownDescendant] = fs.readFileSync(shutdownPidsFile, 'utf8')
    .trim().split(/\s+/).map(Number)
  await drainProviderRunsForShutdown()
  assert.ok(isReadinessCancelledError(await assessmentResult),
    'shutdown cancels the chain assessment instead of letting it reach provider admission')
  assert.equal(alive(shutdownLeader), false, 'shutdown drains the readiness leader before releasing the run')
  assert.equal(alive(shutdownDescendant), false, 'shutdown drains readiness descendants before releasing the run')
  assert.ok(run.endedAt !== undefined && run.status === 'error',
    'only after the readiness group exits does shutdown finalize the childless run')
  console.log('PASS: shutdown drains chain readiness before finalizing or releasing admission')
} finally {
  controller.abort()
  await processResult
  if (chainId) {
    await drainProviderRunsForShutdown()
    await assessmentResult
    clearChainedReadiness(chainId)
  }
  fs.rmSync(root, { recursive: true, force: true })
}
