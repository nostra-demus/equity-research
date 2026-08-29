process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { deploymentSucceededAfter } from '../src/pending-admission'

// A queued launch is admitted once the deployer proves a healthy release. When the stamped SHA is NEWER
// than the one the click requested, `deploymentSucceededAfter` proves ancestry with
// `git merge-base --is-ancestor` and memoizes the answer.
//
// git distinguishes two very different outcomes here: exit 1 means a definitive "not an ancestor", while
// exit 128 (and a timeout kill, or a missing binary) means the QUESTION could not be answered — the repo
// was busy, a pack lock was held, auto-gc was running. Caching the second kind as a negative strands the
// request forever: the cache key is (repoRoot, requested, stamped), all three fixed for a queued request,
// so every later 2s drain tick reads the poisoned entry and re-writes "waiting for update" on an engine
// that is healthy and deployed. That is the permanent spinner CLAUDE.md §30/§31 forbid, and it is the very
// failure class this queue exists to remove — so only a DEFINITIVE answer may be cached.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-ancestry-'))
const realPath = process.env.PATH
try {
  const repo = path.join(tmp, 'repo')
  fs.mkdirSync(repo)
  const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim()
  git('init', '-q', '-b', 'main')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'test')
  fs.writeFileSync(path.join(repo, 'a.txt'), 'one\n')
  git('add', '-A'); git('commit', '-qm', 'first')
  const older = git('rev-parse', 'HEAD')
  fs.writeFileSync(path.join(repo, 'a.txt'), 'two\n')
  git('add', '-A'); git('commit', '-qm', 'second')
  const newer = git('rev-parse', 'HEAD')
  git('checkout', '-q', '-b', 'side', older)
  fs.writeFileSync(path.join(repo, 'b.txt'), 'side\n')
  git('add', '-A'); git('commit', '-qm', 'side')
  const unrelated = git('rev-parse', 'HEAD')

  // The deployer stamped a healthy release at `newer`, after the click.
  const ops = path.join(tmp, 'ops')
  fs.mkdirSync(ops)
  fs.writeFileSync(path.join(ops, '.deploy.succeeded'), `${newer} 1700000000123\n`, { mode: 0o600 })
  const clicked = '2023-11-14T22:13:20.000Z' // 1700000000000 — one tick before the stamp

  // A `git` that exits 128, i.e. the question could not be answered (busy repo / held pack lock).
  const shim = path.join(tmp, 'shim')
  fs.mkdirSync(shim)
  fs.writeFileSync(path.join(shim, 'git'), '#!/bin/sh\nexit 128\n', { mode: 0o755 })

  process.env.PATH = shim
  const duringTransientFailure = await deploymentSucceededAfter(clicked, older, ops, repo)
  process.env.PATH = realPath
  assert.equal(duringTransientFailure, null, 'an unanswerable ancestry question must not admit the request')

  // Same (repoRoot, requested, stamped) triple, git healthy again: `older` really is an ancestor of
  // `newer`, so the healthy release must now admit the queued request.
  const afterRecovery = await deploymentSucceededAfter(clicked, older, ops, repo)
  assert.equal(afterRecovery?.sha, newer,
    'a transient git failure must stay retryable — caching it strands the queued launch in "waiting" forever')

  // A definitive negative is still a negative: `unrelated` is on a side branch, so git exits 1 and the
  // stamped release genuinely does not carry the requested commit.
  fs.writeFileSync(path.join(ops, '.deploy.succeeded'), `${unrelated} 1700000000123\n`, { mode: 0o600 })
  assert.equal(await deploymentSucceededAfter(clicked, newer, ops, repo), null,
    'a release that does not contain the requested commit cannot admit it')

  console.log('pending-admission ancestry: transient git failures stay retryable; definitive negatives still block')
} finally {
  process.env.PATH = realPath
  fs.rmSync(tmp, { recursive: true, force: true })
}
