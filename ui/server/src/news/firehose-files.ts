import fs from 'node:fs'
import path from 'node:path'

export interface FirehoseFile {
  date: string
  index: number
  name: string
  file: string
}

const FIREHOSE_RE = /^(\d{4}-\d{2}-\d{2})_firehose(?:\.(\d{6}))?\.ndjson$/

export function parseFirehoseName(name: string): { date: string; index: number } | null {
  const match = FIREHOSE_RE.exec(name)
  if (!match) return null
  const index = match[2] ? Number(match[2]) : 0
  // Shard zero keeps the original filename. Reject an alternate `.000000` spelling so one logical
  // partition can never have two physical files with the same index.
  if (match[2] && index === 0) return null
  return { date: match[1], index }
}

export function firehoseName(date: string, index = 0): string {
  if (!Number.isSafeInteger(index) || index < 0 || index > 999_999) throw new Error('invalid firehose shard index')
  return index === 0
    ? `${date}_firehose.ndjson`
    : `${date}_firehose.${String(index).padStart(6, '0')}.ndjson`
}

export function firehosePath(repoRoot: string, date: string, index = 0): string {
  return path.join(repoRoot, 'screener', 'inbox', firehoseName(date, index))
}

/** Stable per-partition mutation lease. Keep this hidden file forever: flock ownership belongs to its
 * inode, so unlinking it would let a second writer lock a replacement while the first still owns the old
 * inode. Item rows, cycle summaries, and tail repair all share this one lock. */
export function firehoseLockPath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `.${date}_firehose.flock`)
}

/** List one directory's physical shards in append order. A missing directory is an empty store; other
 * failures remain visible to callers that need fail-closed durability checks. */
export function listFirehoseFilesInDir(dir: string, date?: string): FirehoseFile[] {
  let names: string[]
  try { names = fs.readdirSync(dir) }
  catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
  const files: FirehoseFile[] = []
  for (const name of names) {
    const parsed = parseFirehoseName(name)
    if (!parsed || (date && parsed.date !== date)) continue
    files.push({ ...parsed, name, file: path.join(dir, name) })
  }
  return files.sort((a, b) => a.date.localeCompare(b.date) || a.index - b.index)
}

export function localFirehoseFiles(repoRoot: string, date: string): FirehoseFile[] {
  return listFirehoseFilesInDir(path.join(repoRoot, 'screener', 'inbox'), date)
}

/** Resolve a logical day across local retention and its Drive mirror. Local wins independently for each
 * shard, which also handles a prune/archive run interrupted halfway through a multi-file day. */
export function resolvedFirehoseFiles(repoRoot: string, date: string, archiveDir = ''): FirehoseFile[] {
  const byIndex = new Map<number, FirehoseFile>()
  for (const row of localFirehoseFiles(repoRoot, date)) byIndex.set(row.index, row)
  if (archiveDir) {
    try {
      for (const row of listFirehoseFilesInDir(archiveDir, date)) {
        if (!byIndex.has(row.index)) byIndex.set(row.index, row)
      }
    } catch (error) {
      // Preserve the established local-first contract: an unavailable Drive mount cannot hide a complete
      // live partition. With no local copy, propagate the failure so strict diagnostics stay fail-closed.
      if (!byIndex.size) throw error
    }
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index)
}

export function firehoseDates(repoRoot: string, archiveDir = ''): string[] {
  const dates = new Set<string>()
  for (const row of listFirehoseFilesInDir(path.join(repoRoot, 'screener', 'inbox'))) dates.add(row.date)
  if (archiveDir) for (const row of listFirehoseFilesInDir(archiveDir)) dates.add(row.date)
  return [...dates].sort((a, b) => b.localeCompare(a))
}

/** A writer may append only when shard zero exists and all shard numbers are contiguous. A missing middle
 * file is ambiguous loss, not permission to create a replacement over it. */
export function contiguousFirehoseFiles(files: readonly FirehoseFile[]): boolean {
  return files.every((row, index) => row.index === index)
}
