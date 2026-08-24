import fs from 'node:fs'
import path from 'node:path'

// Mirrors the memo-delta branch of ui/server/src/outputs.ts PUBLISHED_CALLS_ARTIFACT_RE.
const PUBLISHED_MEMO_DELTA_RE = /^analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/reviews\/\d{4}-\d{2}-\d{2}_[A-Za-z0-9-]{1,20}_memo_delta(?:_v\d+)?\.md$/

function isStrictChild(parent, child) {
  const relative = path.relative(parent, child)
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

/** Admit only a regular, canonical memo-delta file physically inside this repository run. */
export function safePublishedMemoDeltaPath(value, repoRoot, runDirAbs, runRoot) {
  if (typeof value !== 'string' || !PUBLISHED_MEMO_DELTA_RE.test(value)) return null
  const prefix = `${runRoot}/reviews/`
  if (!value.startsWith(prefix) || value.includes('\\')) return null
  const parts = value.split('/')
  if (parts.some((part) => !part || part === '.' || part === '..')) return null

  const reviewsAbs = path.join(runDirAbs, 'reviews')
  const artifactAbs = path.join(runDirAbs, value.slice(runRoot.length + 1))
  try {
    // lstat rejects a symlink at every path component controlled by an analysis run.
    if (!fs.lstatSync(runDirAbs).isDirectory()
      || !fs.lstatSync(reviewsAbs).isDirectory()
      || !fs.lstatSync(artifactAbs).isFile()) return null

    const repoReal = fs.realpathSync(repoRoot)
    const runReal = fs.realpathSync(runDirAbs)
    const reviewsReal = fs.realpathSync(reviewsAbs)
    const artifactReal = fs.realpathSync(artifactAbs)
    if (!isStrictChild(repoReal, runReal)
      || !isStrictChild(runReal, reviewsReal)
      || !isStrictChild(reviewsReal, artifactReal)) return null
  } catch {
    return null
  }
  return value
}
