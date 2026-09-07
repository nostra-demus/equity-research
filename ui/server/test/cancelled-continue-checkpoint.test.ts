// Stop revokes automatic retry authority, never the sole retained saved checkpoint.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { REPO_ROOT } from '../src/config'
import { continuationPlanReceiptFingerprint, thesisPlan } from '../src/completion'
import {
  prepareRunPlanTransaction, rearmDeferredPreSpendRetry, readDeferredPreSpendRetry,
  readCancelledChainIntent, recoverRunPlanTransactions,
} from '../src/run-plan-transaction'

const profile = {
  provider: 'claude' as const, model: 'sonnet', reasoningLevel: 'default', profileKey: 'claude:sonnet:default',
  executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
}
const savedRel = 'business-model/01_saved.md'
const frozenRel = '_pool_extracts/.extract-generations/retained'
const savedBytes = '# Completed specialist\n\nOriginal saved research must survive Stop.\n'
function writeCheckpoint(root: string) {
  fs.mkdirSync(path.join(root, 'business-model'), { recursive: true })
  fs.writeFileSync(path.join(root, savedRel), savedBytes)
  fs.mkdirSync(path.join(root, frozenRel), { recursive: true })
  fs.writeFileSync(path.join(root, frozenRel, 'evidence.txt'), 'original frozen evidence\n', { mode: 0o444 })
  if (process.platform !== 'win32') fs.chmodSync(path.join(root, frozenRel), 0o555)
}
function cleanFixture(root: string) {
  if (!fs.existsSync(root)) return
  const visit = (absolute: string) => {
    if (!fs.lstatSync(absolute).isDirectory()) return
    fs.chmodSync(absolute, 0o700)
    for (const name of fs.readdirSync(absolute)) visit(path.join(absolute, name))
  }
  visit(root)
  fs.rmSync(root, { recursive: true, force: true })
}

let sequence = 0
for (const canonicalPresent of [false, true]) {
  for (const phase of ['waiting', 'rearmed', 'activated', 'redeferred', 'restore-crash'] as const) {
    const state = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-cancel-checkpoint-')))
    const requestId = randomUUID()
    const chainId = randomUUID()
    const subject = `ZZCN${process.pid.toString(36).toUpperCase()}${sequence++}`
    const plan = thesisPlan(subject, 'research', [], undefined, {
      provider: profile.provider, model: profile.model, reasoningLevel: profile.reasoningLevel,
      expectedProfileKey: profile.profileKey,
    })
    // The transaction test seam supplies already-reviewed private bytes. Planning and frozen-evidence
    // admission have their own suites; this exercises real journals, rename layouts, and cancellation.
    plan.continuationReceipt.action = 'continue'
    plan.continuationReceipt.sourceRunRoots = [plan.targetRunRoot]
    const { fingerprint: _priorFingerprint, ...payload } = plan.continuationReceipt
    plan.continuationReceipt.fingerprint = continuationPlanReceiptFingerprint(payload)
    const canonical = path.join(REPO_ROOT, plan.targetRunRoot)
    const workspace = path.join(REPO_ROOT, 'analyses', '.run-plan-transactions', requestId)
    const archivedOriginal = path.join(state, 'fixture-original')
    const originalRename = fs.promises.rename
    try {
      assert.equal(fs.existsSync(canonical), false)
      writeCheckpoint(canonical)
      fs.writeFileSync(path.join(canonical, 'canonical-only.txt'), 'original canonical marker\n')
      const transaction = await prepareRunPlanTransaction(requestId, subject, plan, {
        prepare: (_subject, reviewed, directory) => {
          const stagingRootAbs = path.join(directory, 'prepared-root')
          writeCheckpoint(stagingRootAbs)
          return { stagingRootAbs, targetRunRoot: reviewed.targetRunRoot, carried: [], doneOrbKeys: [], ranClean: [] }
        },
      }, state)
      await transaction.activate()
      await transaction.beginChainIntent({
        chainId, user: 'tester', userVia: 'local', selection: profile,
        modules: [{ module: 'business-model', dependsOn: [], synthesisOutputs: ['business-model/99_synthesis.md'] }],
        completed: [], nextModules: ['business-model'],
      })
      const deferred = await transaction.deferPreSpendRetry({
        reason: 'provider_spawn_failed_before_spend', recoveryRequestId: chainId,
        ...profile, localAttempts: 1, notBeforeMs: 0,
      })
      if (!canonicalPresent) fs.renameSync(canonical, archivedOriginal)
      const active = phase === 'waiting' || phase === 'restore-crash' ? transaction : await rearmDeferredPreSpendRetry({
        record: deferred, revalidatedPlan: plan, resolvedProfile: profile,
      }, {}, state)
      if (phase === 'activated' || phase === 'redeferred') await active.activate()
      await active.cancelChainIntent({ requestId, chainId, targetRunRoot: plan.targetRunRoot })
      if (phase === 'rearmed') {
        await assert.rejects(active.activate(), /cancelled run-plan transaction cannot activate/)
        assert.equal(fs.existsSync(canonical), canonicalPresent, 'cancelled activation never publishes the retained root')
      }
      if (phase === 'redeferred') await active.rollbackIfUnstarted('cancelled before any provider starts')

      // A crash immediately after restoring the only private copy must not make the next startup delete it.
      if (!canonicalPresent && phase === 'restore-crash') {
        fs.promises.rename = async (from, to) => {
          await originalRename(from, to)
          if (String(from) === path.join(workspace, 'prepared-root') && String(to) === canonical) {
            throw new Error('fixture interruption after checkpoint restore')
          }
        }
        await assert.rejects(recoverRunPlanTransactions(state), /fixture interruption/)
        fs.promises.rename = originalRename
      }
      for (let restart = 0; restart < 2; restart++) {
        await recoverRunPlanTransactions(state)
        assert.equal(fs.readFileSync(path.join(canonical, savedRel), 'utf8'), savedBytes,
          `${canonicalPresent}/${phase}: cancelled recovery preserves saved research`)
        assert.equal(fs.readFileSync(path.join(canonical, frozenRel, 'evidence.txt'), 'utf8'), 'original frozen evidence\n')
        if (process.platform !== 'win32') {
          assert.equal(fs.statSync(path.join(canonical, frozenRel)).mode & 0o777, 0o555)
          assert.equal(fs.statSync(path.join(canonical, frozenRel, 'evidence.txt')).mode & 0o777, 0o444)
        }
        assert.equal(await readDeferredPreSpendRetry(requestId, state), null, 'Stop cannot return to the retry queue')
        assert.equal((await readCancelledChainIntent(requestId, state))?.chainId, chainId)
      }
      if (canonicalPresent) assert.equal(fs.readFileSync(path.join(canonical, 'canonical-only.txt'), 'utf8'), 'original canonical marker\n')
      assert.equal(fs.existsSync(path.join(workspace, 'prepared-root')), false)
      assert.equal(fs.existsSync(path.join(workspace, 'unstarted-root')), false)
      const journal = JSON.parse(fs.readFileSync(path.join(state, 'run-plan-transactions', requestId, 'transaction.json'), 'utf8'))
      assert.equal(journal.status, 'rolled_back')
      assert.deepEqual(journal.spawnAttempts, [], 'checkpoint restoration never allocates a paid provider attempt')
      if (!canonicalPresent && phase === 'waiting') {
        cleanFixture(canonical)
        await recoverRunPlanTransactions(state)
        assert.equal(fs.existsSync(canonical), false, 'an already-rolled-back missing checkpoint is not manufactured anew')
        assert.equal(await readDeferredPreSpendRetry(requestId, state), null)
      }
    } finally {
      fs.promises.rename = originalRename
      for (const root of [canonical, workspace, state]) cleanFixture(root)
    }
  }
}
console.log('cancelled Continue checkpoints: original or sole retained bytes survive Stop and restart without retry authority')
