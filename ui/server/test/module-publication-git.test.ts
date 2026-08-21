// Publication retry must never turn an unrelated local-only HEAD into a remote push after the checkpoint
// helper failed before committing the requested module path. Uses a real temp Git origin; no server/model.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execa } from 'execa'
import {
  commitRunReceipt,
  modulePathspecStateMatchesRevision,
  retryBoundModulePublication,
} from '../src/module-publication-git'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'module-publish-git-'))
const origin = path.join(tmp, 'origin.git')
const repo = path.join(tmp, 'repo')
await execa('git', ['init', '--bare', '-q', origin])
await execa('git', ['init', '-q', '-b', 'main', repo])
await execa('git', ['-C', repo, 'config', 'user.email', 'test@example.com'])
await execa('git', ['-C', repo, 'config', 'user.name', 'Test'])
await execa('git', ['-C', repo, 'remote', 'add', 'origin', origin])

const target = 'analyses/ACME_2099-01-01/management-governance'
fs.mkdirSync(path.join(repo, target), { recursive: true })
fs.writeFileSync(path.join(repo, target, '99_management-governance-synthesis.md'), '# old\n')
fs.writeFileSync(path.join(repo, 'base.txt'), 'base\n')
await execa('git', ['-C', repo, 'add', '.'])
await execa('git', ['-C', repo, 'commit', '-qm', 'base'])
await execa('git', ['-C', repo, 'push', '-q', '-u', 'origin', 'main'])
const originBefore = (await execa('git', ['--git-dir', origin, 'rev-parse', 'refs/heads/main'])).stdout.trim()

// A different data writer created a local-only commit; our target checkpoint then remained dirty because
// its helper lost the repository lock/pre-commit path before `git commit` and emitted no machine receipt.
fs.writeFileSync(path.join(repo, 'unrelated.txt'), 'unrelated local-only data\n')
await execa('git', ['-C', repo, 'add', 'unrelated.txt'])
await execa('git', ['-C', repo, 'commit', '-qm', 'unrelated local commit'])
const unrelatedHead = (await execa('git', ['-C', repo, 'rev-parse', 'HEAD'])).stdout.trim()
fs.writeFileSync(path.join(repo, target, '99_management-governance-synthesis.md'), '# requested new bytes\n')

const retryScript = path.join(tmp, 'retry.sh')
const retryCalled = path.join(tmp, 'retry-called')
fs.writeFileSync(retryScript, `#!/bin/sh\ntouch '${retryCalled}'\ngit push -q origin HEAD:main\n`)
fs.chmodSync(retryScript, 0o755)

assert.deepEqual(commitRunReceipt({ exitCode: 4, stdout: '' }), { commitSha: null, noop: false })
assert.deepEqual(commitRunReceipt({ exitCode: 5, stdout: `COMMIT_SHA=${unrelatedHead}\n` }),
  { commitSha: null, noop: false }, 'pre-commit failure output cannot forge a commit receipt')
assert.equal(await modulePathspecStateMatchesRevision(repo, unrelatedHead, [target]), false,
  'dirty requested bytes do not match unrelated HEAD')
assert.equal(await modulePathspecStateMatchesRevision(repo, unrelatedHead, ['analyses\\..\\..\\outside']), false,
  'Windows separators cannot hide traversal from the pathspec boundary')
assert.equal(await modulePathspecStateMatchesRevision(repo, unrelatedHead, ['\\absolute']), false,
  'a Windows-rooted pathspec is never accepted')
assert.equal(await retryBoundModulePublication({
  repoRoot: repo,
  script: retryScript,
  pathspecs: [target],
  helperAttempt: { exitCode: 4, stdout: '', stderr: 'timed out waiting for lock' } as any,
}), false, 'a pre-commit/lock failure without a helper receipt cannot retry current HEAD')
assert.equal(fs.existsSync(retryCalled), false, 'retry-push was never invoked')
assert.equal((await execa('git', ['--git-dir', origin, 'rev-parse', 'refs/heads/main'])).stdout.trim(), originBefore,
  'origin remains unchanged; the unrelated local commit was not published')

// Even a forged/stale SHA receipt cannot bypass the exact current-path proof.
assert.equal(await retryBoundModulePublication({
  repoRoot: repo,
  script: retryScript,
  pathspecs: [target],
  helperAttempt: { exitCode: 4, stdout: `COMMIT_SHA=${unrelatedHead}\n` },
}), false)
assert.equal(fs.existsSync(retryCalled), false)

// Once the requested target itself is committed, the helper-emitted SHA is safe and retryable.
await execa('git', ['-C', repo, 'add', '--', target])
await execa('git', ['-C', repo, 'commit', '-qm', 'target checkpoint'])
const targetHead = (await execa('git', ['-C', repo, 'rev-parse', 'HEAD'])).stdout.trim()
assert.equal(await modulePathspecStateMatchesRevision(repo, targetHead, [target]), true)
assert.equal(await retryBoundModulePublication({
  repoRoot: repo,
  script: retryScript,
  pathspecs: [target],
  helperAttempt: { exitCode: 4, stdout: `COMMIT_SHA=${targetHead}\n` },
}), true)
assert.equal((await execa('git', ['--git-dir', origin, 'rev-parse', 'refs/heads/main'])).stdout.trim(), targetHead,
  'only the revision proven to contain the requested current module bytes is published')

console.log('module publication git: pre-commit unrelated HEAD blocked; exact helper SHA retried')
