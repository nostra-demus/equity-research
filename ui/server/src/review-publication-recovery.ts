import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import {
  localCommitBytes,
  localCommitChangedPaths,
  localSavedReviewCommits,
  publishedTreeAuthority,
  publishResearchPaths,
} from './git-publication'
import {
  scheduledReviewAuthority,
  type ExactReviewArtifact,
  validExactReviewArtifacts,
} from './launcher'
import {
  pairedReviewMemoBasename,
  reviewArtifactNamePattern,
  validAuthoritativeReviewMemo,
  validCompleteReviewMemo,
  validateExactReviewArtifact,
} from './review-artifact'
import type { DueReview } from './review-dispatch'

interface ReviewRecoveryDeps {
  authority: typeof scheduledReviewAuthority
  candidates: typeof localSavedReviewCommits
  commitBytes: typeof localCommitBytes
  changedPaths?: typeof localCommitChangedPaths
  publish: typeof publishResearchPaths
  localArtifact?: (review: DueReview) => { paths: string[] } | null
  commit?: (message: string, paths: string[]) => Promise<void>
}

const execFileAsync = promisify(execFile)

function exactSharedAuthority(review: DueReview, deps: ReviewRecoveryDeps): 'due' | 'settled' {
  const state = deps.authority(review.runRoot, review.ticker, review.window)
  if (state === 'unavailable') {
    throw Object.assign(new Error('shared scheduled-review authority is temporarily unavailable'), {
      code: 'REVIEW_AUTHORITY_UNAVAILABLE',
    })
  }
  return state === 'not_due' ? 'settled' : state
}

function completeLocalArtifact(review: DueReview): { paths: string[] } | null {
  try {
    const artifacts = validExactReviewArtifacts(review.runRoot, review.ticker, review.window)
      .sort((a, b) => b.file.localeCompare(a.file))
    for (const artifact of artifacts) {
      const jsonPath = `${review.runRoot}/reviews/${artifact.file}`
      const memoPath = `${review.runRoot}/reviews/${artifact.memoFile}`
      const json = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, jsonPath), 'utf8'))
      const memo = fs.readFileSync(path.join(REPO_ROOT, memoPath))
      if (validCompleteReviewMemo(memo, {
        ticker: review.ticker,
        reviewDate: String(json.review_date || ''),
        window: review.window,
      })) return { paths: [jsonPath, memoPath] }
    }
  } catch { /* no complete local pair */ }
  return null
}

async function commitExactReview(message: string, paths: string[]): Promise<void> {
  await execFileAsync('bash', [path.join(REPO_ROOT, 'scripts', 'commit-run.sh'), message, '--', ...paths], {
    cwd: REPO_ROOT, timeout: 20 * 60_000, maxBuffer: 4 * 1024 * 1024,
  })
}

function savedArtifact(
  review: DueReview,
  commit: string,
  deps: ReviewRecoveryDeps,
): { artifact: ExactReviewArtifact; paths: string[] } | null {
  try {
    const decision = JSON.parse(deps.commitBytes(commit, `${review.runRoot}/decision_record.json`, REPO_ROOT)?.toString('utf8') || '')
    if (decision?.ticker !== review.ticker || decision?.run_root !== review.runRoot
        || typeof decision.decision_date !== 'string' || decision.review_schedule?.[review.window] === undefined) return null
    const prefix = `${review.runRoot}/reviews/`
    const names = (deps.changedPaths ?? localCommitChangedPaths)(commit, REPO_ROOT)
      .filter((repoPath) => repoPath.startsWith(prefix))
      .map((repoPath) => repoPath.slice(prefix.length))
      .filter((name) => !name.includes('/') && reviewArtifactNamePattern(review.window)?.test(name))
      .sort().reverse()
    for (const file of names) {
      const jsonPath = `${prefix}${file}`
      const raw = JSON.parse(deps.commitBytes(commit, jsonPath, REPO_ROOT)?.toString('utf8') || '')
      const memoFile = pairedReviewMemoBasename(file)
      const memoPath = `${prefix}${memoFile}`
      const memo = deps.commitBytes(commit, memoPath, REPO_ROOT)
      const valid = validateExactReviewArtifact(raw, {
        runRoot: review.runRoot,
        ticker: review.ticker,
        window: review.window,
        decisionDate: decision.decision_date,
        jsonBasename: file,
        memoValid: (name) => name === memoFile && !!memo && validAuthoritativeReviewMemo(memo, {
          ticker: review.ticker,
          reviewDate: String(raw.review_date || ''),
          window: review.window,
        }),
      })
      if (valid) return {
        artifact: { file, memoFile, mtimeMs: 0, memoMtimeMs: 0 },
        paths: [jsonPath, memoPath],
      }
    }
  } catch { /* this commit does not contain one complete bound pair */ }
  return null
}

function sharedReviewAuthority(runRoot: string, ticker: string, window: string): ReturnType<typeof scheduledReviewAuthority> {
  try {
    const authority = publishedTreeAuthority('analyses')
    const decisionPath = `${runRoot}/decision_record.json`
    if (!authority.paths.has(decisionPath)) return 'unavailable'
    const decision = JSON.parse(authority.readRequired(decisionPath).toString('utf8'))
    if (decision?.ticker !== ticker || decision?.run_root !== runRoot
        || typeof decision.decision_date !== 'string' || decision.review_schedule?.[window] === undefined) return 'unavailable'
    const prefix = `${runRoot}/reviews/`
    const names = [...authority.paths]
      .filter((repoPath) => repoPath.startsWith(prefix))
      .map((repoPath) => repoPath.slice(prefix.length))
      .filter((name) => !name.includes('/') && reviewArtifactNamePattern(window)?.test(name))
    for (const file of names) {
      const raw = JSON.parse(authority.readRequired(`${prefix}${file}`).toString('utf8'))
      const memoFile = pairedReviewMemoBasename(file)
      const memoPath = `${prefix}${memoFile}`
      const valid = validateExactReviewArtifact(raw, {
        runRoot, ticker, window, decisionDate: decision.decision_date, jsonBasename: file,
        memoValid: (name) => name === memoFile && authority.paths.has(memoPath)
          && validAuthoritativeReviewMemo(authority.readRequired(memoPath), {
            ticker,
            reviewDate: String(raw.review_date || ''),
            window,
          }),
      })
      if (valid) return 'settled'
    }
    return 'due'
  } catch { return 'unavailable' }
}

/** Publish a complete saved review pair before buying another review. */
export async function recoverSavedReviewPublication(
  review: DueReview,
  deps: ReviewRecoveryDeps = {
    authority: sharedReviewAuthority,
    candidates: localSavedReviewCommits,
    commitBytes: localCommitBytes,
    publish: publishResearchPaths,
    localArtifact: completeLocalArtifact,
    commit: commitExactReview,
  },
): Promise<boolean> {
  if (exactSharedAuthority(review, deps) === 'settled') return true
  const findSaved = (): { sourceCommit: string; saved: NonNullable<ReturnType<typeof savedArtifact>> } | null => {
    for (const candidate of deps.candidates(REPO_ROOT)) {
      const exact = savedArtifact(review, candidate, deps)
      if (exact) return { sourceCommit: candidate, saved: exact }
    }
    return null
  }
  let found = findSaved()
  if (!found) {
    const local = (deps.localArtifact ?? completeLocalArtifact)(review)
    if (!local) {
      // `false` is permission to buy a review. Re-prove that shared authority is readable and still due
      // after the local/saved probes; a transient Git/ref failure can never fall through to paid work.
      return exactSharedAuthority(review, deps) === 'settled'
    }
    // A complete pair is already paid work. From this point every failure is publication-pending; it must
    // retry model-free rather than returning false and authorizing another review launch.
    try {
      await (deps.commit ?? commitExactReview)(
        `Decision review: ${review.ticker} ${review.window}`,
        local.paths,
      )
    } catch { /* commit-run may have committed locally and returned only because its push failed */ }
    if (exactSharedAuthority(review, deps) === 'settled') return true
    found = findSaved()
    if (!found) throw new Error('complete review pair could not be committed safely')
  }

  await deps.publish(
    `Publish saved ${review.window} review for ${review.ticker}`,
    found.saved.paths,
    found.sourceCommit,
    REPO_ROOT,
  )
  if (exactSharedAuthority(review, deps) !== 'settled') {
    throw new Error('saved review is still not available to the shared app')
  }
  return true
}
