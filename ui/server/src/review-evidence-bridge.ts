import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, REPO_ROOT } from './config'
import { researchSolelyOwnsSharedPool } from './intake-owner'
import { pairedReviewMemoBasename, validateExactReviewArtifact } from './review-artifact'

export interface ReviewEvidenceGuard {
  runRoot: string
  ticker: string
  window: string
  decisionDate?: string
}

const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/
const SOURCE_RE = /^(?=.{3,500}$)(?=.*\b\d{4}-\d{2}-\d{2}\b)[^\n\r]+$/
const FILE_RE = /^\d{4}-\d{2}-\d{2}_(?:30d|90d|180d|365d|24m|36m|ad-hoc|post-mortem)_decision_review(?:_v\d+)?\.json$/
const RUN_RE = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/

function publishExactFile(dest: string, body: string): void {
  const temp = `${dest}.${process.pid}.${Date.now()}.tmp`
  let fd: number | null = null
  try {
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, body, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    fs.renameSync(temp, dest)
    try {
      const dir = fs.openSync(path.dirname(dest), 'r')
      try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
    } catch { /* directory fsync is not available on every filesystem */ }
  } finally {
    if (fd !== null) fs.closeSync(fd)
    try { fs.rmSync(temp, { force: true }) } catch { /* renamed away */ }
  }
}

/** Bridge an already-authoritative review JSON blob into the ordinary company evidence pool. The caller
 * must separately prove the paired memo belongs to the same immutable publication (the Calls projection
 * and local wrapper below both do). Prompt-written commands are never copied or executed. */
export function bridgeMaterialReviewBytes(
  guard: ReviewEvidenceGuard,
  name: string,
  rawText: string,
  input: { dataDir?: string; canWrite?: (ticker: string) => boolean } = {},
): string | null {
  if (!TICKER_RE.test(guard.ticker)) throw new Error('review evidence has an unsafe ticker')
  if (!FILE_RE.test(name) || name.includes('/') || name.includes('\\')) throw new Error('review evidence has an unsafe filename')
  const run = RUN_RE.exec(guard.runRoot)
  if (!run || run[1] !== guard.ticker) throw new Error('review evidence run identity is unsafe')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(guard.decisionDate || '')) throw new Error('review evidence decision date is unavailable')
  let parsed: unknown
  try { parsed = JSON.parse(rawText) } catch { throw new Error('review evidence JSON is invalid') }
  const valid = validateExactReviewArtifact(parsed, {
    runRoot: guard.runRoot,
    ticker: guard.ticker,
    window: guard.window,
    decisionDate: guard.decisionDate!,
    jsonBasename: name,
    // This byte-oriented seam is called only after the paired memo was proved by the exact same local or
    // published authority. validateExactReviewArtifact still binds its authored path/name here.
    memoValid: () => true,
  })
  if (!valid) throw new Error('review evidence does not belong to this call and window')
  const raw = valid.raw
  const changed = Array.isArray(raw?.memo_delta?.changed_sections) ? raw.memo_delta.changed_sections : []
  const material = changed.filter((row: any) => row?.rerun_recommended === true
    && typeof row.materiality_score === 'number' && Number.isFinite(row.materiality_score) && row.materiality_score >= 60)
  if (!material.length) return null
  for (const row of material) {
    if (typeof row.section !== 'string' || !row.section.trim()
        || typeof row.new_evidence !== 'string' || !row.new_evidence.trim()
        || typeof row.evidence_source !== 'string' || !SOURCE_RE.test(row.evidence_source.trim())) {
      throw new Error('material review evidence is incomplete')
    }
  }

  const dataDir = fs.realpathSync(input.dataDir ?? DATA_DIR)
  const canWrite = input.canWrite ?? researchSolelyOwnsSharedPool
  if (!canWrite(guard.ticker)) throw new Error('review evidence has no single research pool owner')

  const identity = createHash('sha256').update(`${guard.runRoot}\0${name}\0${rawText}`).digest('hex')
  const subject = path.join(dataDir, guard.ticker)
  const realSubject = fs.realpathSync(subject)
  if (path.dirname(realSubject) !== dataDir || fs.lstatSync(subject).isSymbolicLink()) throw new Error('review evidence pool is unsafe')
  const dir = path.join(realSubject, 'review-evidence')
  fs.mkdirSync(dir, { recursive: true })
  if (fs.lstatSync(dir).isSymbolicLink() || path.dirname(fs.realpathSync(dir)) !== realSubject) throw new Error('review evidence folder is unsafe')
  const dest = path.join(dir, `${identity}.md`)
  const body = [
    `# Material change found in the ${guard.window} automatic call review`, '',
    `- Ticker: ${guard.ticker}`, `- Call: ${guard.runRoot}`, `- Review: ${guard.runRoot}/reviews/${name}`,
    `- Review date: ${raw.review_date}`, '',
    'This note is an automatic intake trigger. The intake analyzer must decide the safe rerun scope itself.', '',
    ...material.flatMap((row: any) => [
      `## ${row.section.trim()}`, '', row.new_evidence.trim(), '',
      `Source: ${row.evidence_source.trim()}`, `Materiality: ${row.materiality_score}/100`,
      `Impact: ${typeof row.impact_direction === 'string' ? row.impact_direction : 'unknown'}`, '',
    ]),
  ].join('\n') + '\n'

  try {
    const stat = fs.lstatSync(dest)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('saved review evidence is unsafe')
    const real = fs.realpathSync(dest)
    if (path.dirname(real) !== fs.realpathSync(dir) || path.basename(real) !== path.basename(dest)) {
      throw new Error('saved review evidence left its folder')
    }
    if (fs.readFileSync(real, 'utf8') === body) return dest
    // A crash after claiming this content-addressed filename may leave a short regular file. Its identity
    // fixes the one and only valid body, so atomically repairing it is safe and lets unattended recovery
    // continue. Symlinks/directories above are never followed or removed.
    publishExactFile(dest, body)
    return dest
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  publishExactFile(dest, body)
  return dest
}

/**
 * Local writer wrapper used immediately after a scheduled review child closes. It proves the run,
 * reviews directory, JSON and paired memo are real contained files, then delegates to the same
 * byte-oriented bridge used by restart/failover recovery from published Git.
 */
export function bridgeMaterialReviewArtifact(
  guard: ReviewEvidenceGuard,
  name: string,
  input: { repoRoot?: string; dataDir?: string; canWrite?: (ticker: string) => boolean } = {},
): string | null {
  if (!TICKER_RE.test(guard.ticker)) throw new Error('review evidence has an unsafe ticker')
  if (!FILE_RE.test(name) || name.includes('/') || name.includes('\\')) throw new Error('review evidence has an unsafe filename')
  const repoRoot = fs.realpathSync(input.repoRoot ?? REPO_ROOT)
  const runLexical = path.join(repoRoot, guard.runRoot)
  if (fs.lstatSync(runLexical).isSymbolicLink() || !fs.lstatSync(runLexical).isDirectory()) throw new Error('review evidence run is unsafe')
  const realRun = fs.realpathSync(runLexical)
  if (path.dirname(realRun) !== fs.realpathSync(path.join(repoRoot, 'analyses'))) throw new Error('review evidence run escaped analyses')
  const reviewsLexical = path.join(realRun, 'reviews')
  if (fs.lstatSync(reviewsLexical).isSymbolicLink() || !fs.lstatSync(reviewsLexical).isDirectory()) throw new Error('review evidence folder is unsafe')
  const reviews = fs.realpathSync(reviewsLexical)
  if (path.dirname(reviews) !== realRun || path.basename(reviews) !== 'reviews') throw new Error('review evidence folder escaped its run')
  const requireLocalFile = (basename: string): string => {
    const file = path.join(reviews, basename)
    const stat = fs.lstatSync(file)
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size <= 0) throw new Error('review evidence pair is not a real file')
    const real = fs.realpathSync(file)
    if (path.dirname(real) !== reviews || path.basename(real) !== basename) throw new Error('review evidence pair escaped its run')
    return real
  }
  const rawText = fs.readFileSync(requireLocalFile(name), 'utf8')
  requireLocalFile(pairedReviewMemoBasename(name))
  let decisionDate = guard.decisionDate
  if (!decisionDate) {
    try {
      const decision = JSON.parse(fs.readFileSync(path.join(realRun, 'decision_record.json'), 'utf8'))
      if (decision?.ticker === guard.ticker && decision?.run_root === guard.runRoot
          && /^\d{4}-\d{2}-\d{2}$/.test(decision?.decision_date || '')) decisionDate = decision.decision_date
    } catch { /* rejected by the byte validator below */ }
  }
  return bridgeMaterialReviewBytes({ ...guard, decisionDate }, name, rawText, input)
}
