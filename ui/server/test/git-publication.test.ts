import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { localSavedResearchCommits, localSavedReviewCommits } from '../src/git-publication'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'saved-publication-history-'))
const previousRef = process.env.ENGINE_PUBLISHED_GIT_REF
const git = (...args: string[]): string => execFileSync('git', ['-C', repo, ...args], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
}).trim()

try {
  process.env.ENGINE_PUBLISHED_GIT_REF = 'refs/remotes/origin/main'
  git('init', '-q')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'Test')
  fs.mkdirSync(path.join(repo, 'analyses'), { recursive: true })
  fs.writeFileSync(path.join(repo, 'analyses', '.keep'), '')
  git('add', 'analyses/.keep')
  git('commit', '-qm', 'base')
  git('update-ref', 'refs/remotes/origin/main', 'HEAD')

  const runRoot = 'analyses/TEST_2099-01-01'
  const reviews = path.join(repo, runRoot, 'reviews')
  fs.mkdirSync(reviews, { recursive: true })
  for (let version = 1; version <= 129; version++) {
    const file = `${String(version).padStart(4, '0')}-01-01_30d_decision_review_v${version}.json`
    fs.writeFileSync(path.join(reviews, file), `${JSON.stringify({ version })}\n`)
    git('add', `${runRoot}/reviews/${file}`)
    git('commit', '-qm', `saved review ${version}`)
  }

  const oldest = git('rev-list', '--first-parent', '--reverse', 'HEAD', '^refs/remotes/origin/main', '--', 'analyses')
    .split(/\s+/)[0]
  const reviewCandidates = localSavedReviewCommits(repo)
  assert.equal(reviewCandidates.length, 129)
  assert.ok(reviewCandidates.includes(oldest), 'the oldest paid review remains recoverable after a long outage')

  const researchCandidates = localSavedResearchCommits([`${runRoot}/`], repo)
  assert.equal(researchCandidates.length, 129)
  assert.ok(researchCandidates.includes(oldest), 'automatic call recovery has no arbitrary local-history cap')

  const neverPath = `${runRoot}/reviews/never_publish_decision_review.json`
  fs.writeFileSync(path.join(repo, neverPath), '{"private":true}\n')
  git('add', neverPath)
  git('commit', '-qm', 'validation only\n\nNostradamus-Publication: never')
  const neverCommit = git('rev-parse', 'HEAD')
  const descendantPath = `${runRoot}/reviews/descendant_decision_review.json`
  fs.writeFileSync(path.join(repo, descendantPath), '{"descendant":true}\n')
  git('add', descendantPath)
  git('commit', '-qm', 'later data must not launder validation ancestry')
  const descendantCommit = git('rev-parse', 'HEAD')
  const afterPrivateReviews = localSavedReviewCommits(repo)
  const afterPrivateResearch = localSavedResearchCommits([`${runRoot}/`], repo)
  for (const candidate of [neverCommit, descendantCommit]) {
    assert.ok(!afterPrivateReviews.includes(candidate), 'review recovery rejects validation-only lineage')
    assert.ok(!afterPrivateResearch.includes(candidate), 'call recovery rejects validation-only lineage')
  }
  assert.ok(afterPrivateReviews.includes(oldest), 'safe commits before the private marker remain recoverable')

  console.log('git-publication.test.ts: all assertions passed')
} finally {
  if (previousRef === undefined) delete process.env.ENGINE_PUBLISHED_GIT_REF
  else process.env.ENGINE_PUBLISHED_GIT_REF = previousRef
  fs.rmSync(repo, { recursive: true, force: true })
}
