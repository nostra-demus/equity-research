process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  markIdeasPublicationPending, publishPendingIdeas, type IdeasPublishCommand,
} from '../src/news/ideas/ideas-publisher'

function fixture(): { root: string; state: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-publisher-'))
  const state = path.join(root, '.state')
  fs.mkdirSync(path.join(root, '.git'), { recursive: true })
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
  fs.mkdirSync(path.join(root, 'screener', 'ledger'), { recursive: true })
  fs.mkdirSync(path.join(root, 'screener', 'board'), { recursive: true })
  fs.writeFileSync(path.join(root, 'scripts', 'commit-run.sh'), '#!/bin/sh\n')
  fs.writeFileSync(path.join(root, 'screener', 'ledger', 'ideas.ndjson'), '{}\n')
  fs.writeFileSync(path.join(root, 'screener', 'ledger', 'ideas_feedback.ndjson'), '{}\n')
  fs.writeFileSync(path.join(root, 'screener', 'board', 'index.json'), '{}\n')
  return { root, state }
}

const first = fixture()
const calls: { executable: string; args: string[] }[] = []
const mainCommand: IdeasPublishCommand = async (executable, args) => {
  calls.push({ executable, args })
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) return { stdout: ' M screener/board/index.json\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('fetch')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('merge-base')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'bash') {
    assert.equal(fs.existsSync(path.join(first.state, 'ideas-publish-pending.json')), true, 'pending is durable before commit')
    return { stdout: `COMMIT_SHA=${'a'.repeat(40)}\n`, stderr: '', exitCode: 0 }
  }
  return { stdout: '', stderr: 'unexpected', exitCode: 1 }
}
try {
  const result = await publishPendingIdeas(first.root, first.state, { command: mainCommand, nowMs: 1_786_000_000_000 })
  assert.deepEqual(result, { status: 'published', pending: false })
  assert.equal(fs.existsSync(path.join(first.state, 'ideas-publish-pending.json')), false)
  const commit = calls.find((call) => call.executable === 'bash')!
  assert.ok(commit.args.includes('screener/ledger/ideas.ndjson'))
  assert.ok(commit.args.includes('screener/ledger/ideas_feedback.ndjson'))
  assert.ok(commit.args.includes('screener/board/index.json'))
  assert.ok(!commit.args.includes('screener/ledger/ideas_archive'), 'a never-created archive path cannot abort first publication')
  assert.ok(!commit.args.includes('screener/ledger/ideas'), 'a never-created live directory is also omitted')
} finally { fs.rmSync(first.root, { recursive: true, force: true }) }

const branch = fixture()
let branchCommitCalls = 0
const branchCommand: IdeasPublishCommand = async (executable, args) => {
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) return { stdout: '?? screener/ledger/ideas.ndjson\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/codex/work\n', stderr: '', exitCode: 0 }
  if (executable === 'bash') branchCommitCalls++
  return { stdout: '', stderr: '', exitCode: 0 }
}
try {
  const result = await publishPendingIdeas(branch.root, branch.state, { command: branchCommand })
  assert.deepEqual(result, { status: 'failed', pending: true, reason: 'unsafe_branch' })
  assert.equal(branchCommitCalls, 0, 'a developer branch is never handed to commit-run.sh')
  assert.equal(fs.existsSync(path.join(branch.state, 'ideas-publish-pending.json')), true)
} finally { fs.rmSync(branch.root, { recursive: true, force: true }) }

const failed = fixture()
markIdeasPublicationPending(failed.state)
const failingCommand: IdeasPublishCommand = async (executable, args) => {
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) return { stdout: ' M screener/board/index.json\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
  return { stdout: '', stderr: 'push failed /secret/path', exitCode: 4 }
}
try {
  const result = await publishPendingIdeas(failed.root, failed.state, { command: failingCommand })
  assert.deepEqual(result, { status: 'failed', pending: true, reason: 'commit_failed' })
  assert.equal(fs.existsSync(path.join(failed.state, 'ideas-publish-pending.json')), true, 'failure remains retryable')
} finally { fs.rmSync(failed.root, { recursive: true, force: true }) }

const cleanPending = fixture()
markIdeasPublicationPending(cleanPending.state)
const unpublishedCleanCommand: IdeasPublishCommand = async (executable, args) => {
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('rev-parse')) return { stdout: `${'b'.repeat(40)}\n`, stderr: '', exitCode: 0 }
  if (executable === 'bash' && args.includes('--retry-push')) return { stdout: `COMMIT_SHA=${'b'.repeat(40)}\n`, stderr: '', exitCode: 4 }
  return { stdout: '', stderr: '', exitCode: 1 }
}
try {
  const result = await publishPendingIdeas(cleanPending.root, cleanPending.state, { command: unpublishedCleanCommand })
  assert.deepEqual(result, { status: 'failed', pending: true, reason: 'commit_failed' })
  assert.equal(fs.existsSync(path.join(cleanPending.state, 'ideas-publish-pending.json')), true,
    'a clean local commit remains pending until origin/main is proven to contain it')
} finally { fs.rmSync(cleanPending.root, { recursive: true, force: true }) }

const falseSuccess = fixture()
const falseSuccessSha = 'c'.repeat(40)
const falseSuccessCommand: IdeasPublishCommand = async (executable, args) => {
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) return { stdout: ' M screener/board/index.json\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
  if (executable === 'bash') return { stdout: `COMMIT_SHA=${falseSuccessSha}\n`, stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('fetch')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('merge-base')) return { stdout: '', stderr: '', exitCode: 1 }
  return { stdout: '', stderr: '', exitCode: 1 }
}
try {
  const result = await publishPendingIdeas(falseSuccess.root, falseSuccess.state, { command: falseSuccessCommand })
  assert.deepEqual(result, { status: 'failed', pending: true, reason: 'commit_failed' })
  const marker = JSON.parse(fs.readFileSync(path.join(falseSuccess.state, 'ideas-publish-pending.json'), 'utf8'))
  assert.equal(marker.target_sha, falseSuccessSha, 'exit zero is not publication until origin/main contains the commit')
} finally { fs.rmSync(falseSuccess.root, { recursive: true, force: true }) }

const refreshFailure = fixture()
let commitAfterRefreshFailure = 0
try {
  const result = await publishPendingIdeas(refreshFailure.root, refreshFailure.state, {
    command: async (executable, args) => {
      if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
      if (executable === 'git' && args.includes('status')) return { stdout: ' M screener/ledger/ideas.ndjson\n', stderr: '', exitCode: 0 }
      if (executable === 'bash') commitAfterRefreshFailure++
      return { stdout: '', stderr: '', exitCode: 0 }
    },
    beforePublish: async () => { throw new Error('board rebuild failed') },
  })
  assert.deepEqual(result, { status: 'failed', pending: true, reason: 'commit_failed' })
  assert.equal(commitAfterRefreshFailure, 0, 'canonical dirt cannot publish with a stale derived board')
  assert.equal(fs.existsSync(path.join(refreshFailure.state, 'ideas-publish-pending.json')), true)
} finally { fs.rmSync(refreshFailure.root, { recursive: true, force: true }) }

const rebuildDirty = fixture()
markIdeasPublicationPending(rebuildDirty.state)
let statusReads = 0
let rebuiltBeforeCommit = false
try {
  const result = await publishPendingIdeas(rebuildDirty.root, rebuildDirty.state, {
    command: async (executable, args) => {
      if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
      if (executable === 'git' && args.includes('status')) {
        statusReads++
        return { stdout: statusReads === 1 ? '' : ' M screener/board/index.json\n', stderr: '', exitCode: 0 }
      }
      if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
      if (executable === 'bash') {
        assert.equal(rebuiltBeforeCommit, true)
        assert.ok(!args.includes('--retry-push'), 'a board dirtied by recovery is committed, not treated as clean retry')
        return { stdout: `COMMIT_SHA=${'d'.repeat(40)}\n`, stderr: '', exitCode: 0 }
      }
      if (executable === 'git' && args.includes('fetch')) return { stdout: '', stderr: '', exitCode: 0 }
      if (executable === 'git' && args.includes('merge-base')) return { stdout: '', stderr: '', exitCode: 0 }
      return { stdout: '', stderr: '', exitCode: 1 }
    },
    beforePublish: async () => { rebuiltBeforeCommit = true },
  })
  assert.deepEqual(result, { status: 'published', pending: false })
  assert.equal(statusReads, 2, 'dirty state is recomputed after the canonical board rebuild')
} finally { fs.rmSync(rebuildDirty.root, { recursive: true, force: true }) }

// Interleaving regression: refreshed status is dirty, but another serialized commit-run lands the same
// paths locally and loses its push before this publisher enters commit-run. Our commit sees NOOP; that is
// not permission to clear the marker. It must retry exact HEAD and retain the target across failure.
const noopRace = fixture()
const noopRaceSha = 'e'.repeat(40)
let noopStatusReads = 0
let noopNormalCalls = 0
let noopRetryCalls = 0
const noopRaceCommand: IdeasPublishCommand = async (executable, args) => {
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) {
    noopStatusReads++
    return { stdout: noopStatusReads <= 2 ? ' M screener/board/index.json\n' : '', stderr: '', exitCode: 0 }
  }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('rev-parse')) return { stdout: `${noopRaceSha}\n`, stderr: '', exitCode: 0 }
  if (executable === 'bash' && !args.includes('--retry-push')) {
    noopNormalCalls++
    return { stdout: 'NOOP=1\n', stderr: '', exitCode: 0 }
  }
  if (executable === 'bash' && args.includes('--retry-push')) {
    noopRetryCalls++
    assert.equal(args.at(-1), noopRaceSha, 'NOOP recovery binds the exact concurrent local HEAD')
    return noopRetryCalls === 1
      ? { stdout: `COMMIT_SHA=${noopRaceSha}\n`, stderr: 'push failed', exitCode: 4 }
      : { stdout: `COMMIT_SHA=${noopRaceSha}\n`, stderr: '', exitCode: 0 }
  }
  if (executable === 'git' && args.includes('fetch')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('merge-base')) return { stdout: '', stderr: '', exitCode: 0 }
  return { stdout: '', stderr: '', exitCode: 1 }
}
try {
  const firstAttempt = await publishPendingIdeas(noopRace.root, noopRace.state, { command: noopRaceCommand })
  assert.deepEqual(firstAttempt, { status: 'failed', pending: true, reason: 'commit_failed' })
  assert.equal(noopNormalCalls, 1)
  assert.equal(noopRetryCalls, 1, 'NOOP immediately enters the serialized retry-only path')
  const pending = JSON.parse(fs.readFileSync(path.join(noopRace.state, 'ideas-publish-pending.json'), 'utf8'))
  assert.equal(pending.target_sha, noopRaceSha, 'failed NOOP recovery durably remembers the unpushed HEAD')

  const recovered = await publishPendingIdeas(noopRace.root, noopRace.state, { command: noopRaceCommand })
  assert.deepEqual(recovered, { status: 'published', pending: false })
  assert.equal(noopRetryCalls, 2)
  assert.equal(fs.existsSync(path.join(noopRace.state, 'ideas-publish-pending.json')), false,
    'the marker clears only after retry and origin ancestry proof')
} finally { fs.rmSync(noopRace.root, { recursive: true, force: true }) }

// Lost-wakeup regression: publication A has released the repository lock and is proving origin ancestry.
// A route then marks mutation B before writing it. Publication A may prove successfully, but it must not
// clear B's newer marker generation; the next pass must publish B before the marker disappears.
const lostWakeup = fixture()
const firstPublishSha = 'f'.repeat(40)
const secondPublishSha = '1'.repeat(40)
const lostWakeupMarker = path.join(lostWakeup.state, 'ideas-publish-pending.json')
let lostWakeupCommitCalls = 0
let lostWakeupMergeBaseCalls = 0
let firstGeneration = ''
let secondGeneration = ''
const lostWakeupCommand: IdeasPublishCommand = async (executable, args) => {
  if (executable === 'git' && args.includes('ls-files')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('status')) {
    return { stdout: ' M screener/ledger/ideas_feedback.ndjson\n', stderr: '', exitCode: 0 }
  }
  if (executable === 'git' && args.includes('symbolic-ref')) return { stdout: 'refs/heads/main\n', stderr: '', exitCode: 0 }
  if (executable === 'bash' && !args.includes('--retry-push')) {
    lostWakeupCommitCalls++
    const marker = JSON.parse(fs.readFileSync(lostWakeupMarker, 'utf8'))
    if (lostWakeupCommitCalls === 1) firstGeneration = marker.generation
    else assert.equal(marker.generation, secondGeneration, 'retry publishes mutation B generation')
    return {
      stdout: `COMMIT_SHA=${lostWakeupCommitCalls === 1 ? firstPublishSha : secondPublishSha}\n`,
      stderr: '',
      exitCode: 0,
    }
  }
  if (executable === 'git' && args.includes('fetch')) return { stdout: '', stderr: '', exitCode: 0 }
  if (executable === 'git' && args.includes('merge-base')) {
    lostWakeupMergeBaseCalls++
    if (lostWakeupMergeBaseCalls === 1) {
      assert.ok(firstGeneration, 'publication A captured a marker generation before proof')
      markIdeasPublicationPending(lostWakeup.state, 1_786_000_001_000)
      fs.writeFileSync(path.join(lostWakeup.root, 'screener', 'ledger', 'ideas_feedback.ndjson'), '{"mutation":"B"}\n')
      const marker = JSON.parse(fs.readFileSync(lostWakeupMarker, 'utf8'))
      secondGeneration = marker.generation
      assert.notEqual(secondGeneration, firstGeneration, 'every pre-mutation mark advances the generation')
      assert.equal(marker.target_sha, null, 'a new mutation is not covered by publication A')
    }
    return { stdout: '', stderr: '', exitCode: 0 }
  }
  return { stdout: '', stderr: '', exitCode: 1 }
}
try {
  const firstAttempt = await publishPendingIdeas(lostWakeup.root, lostWakeup.state, { command: lostWakeupCommand })
  assert.deepEqual(firstAttempt, { status: 'failed', pending: true, reason: 'commit_failed' })
  assert.equal(fs.existsSync(lostWakeupMarker), true, 'A cannot clear B generation after proving A')
  assert.equal(JSON.parse(fs.readFileSync(lostWakeupMarker, 'utf8')).generation, secondGeneration)
  assert.equal(
    fs.readFileSync(path.join(lostWakeup.root, 'screener', 'ledger', 'ideas_feedback.ndjson'), 'utf8'),
    '{"mutation":"B"}\n',
  )

  const secondAttempt = await publishPendingIdeas(lostWakeup.root, lostWakeup.state, { command: lostWakeupCommand })
  assert.deepEqual(secondAttempt, { status: 'published', pending: false })
  assert.equal(lostWakeupCommitCalls, 2, 'mutation B receives its own publication attempt')
  assert.equal(fs.existsSync(lostWakeupMarker), false, 'B marker clears only after B is remotely proven')
} finally { fs.rmSync(lostWakeup.root, { recursive: true, force: true }) }

console.log('ideas publisher: bootstrap, branch guard, board rebuild, proof, retry, and generation wakeups passed')
