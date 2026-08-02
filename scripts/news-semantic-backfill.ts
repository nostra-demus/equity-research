// Build/resume the optional compact neural index over saved news history.
// No flag = status-only and no provider spend. Use --limit=N for a bounded trial or --all explicitly.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { NEWS, STATE_DIR } from '../ui/server/src/config'
import { semanticIndexKey, semanticIndexKeys, updateSemanticIndex } from '../ui/server/src/retrieval/semantic'
import type { EmbeddingConfig, SemanticKeyIndex } from '../ui/server/src/retrieval/semantic'
import type { FeedItem } from '../ui/server/src/news/types'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const all = args.includes('--all')
const limitArg = args.find((x) => /^--limit=\d+$/.test(x))
const limit = limitArg ? Number(limitArg.split('=')[1]) : null

export function firehoseFiles(root = repoRoot, configuredArchiveDir = NEWS.newsArchiveDir): string[] {
  // The live inbox and the durable archive intentionally carry the same YYYY-MM-DD file while rotation
  // settles. Pick one physical source per date/basename, preferring the configured/durable archive, so a
  // backfill never reads and bills the same copied day twice.
  const dirs = [
    path.join(root, 'screener', 'inbox'),
    path.join(root, 'data', 'NEWS-ARCHIVE'),
    configuredArchiveDir ? path.resolve(configuredArchiveDir) : '',
  ].filter(Boolean)
  const files = new Map<string, string>()
  for (const dir of dirs) {
    try {
      for (const name of fs.readdirSync(dir)) if (name.endsWith('_firehose.ndjson')) files.set(name, path.join(dir, name))
    } catch { /* an optional archive may not be mounted */ }
  }
  return [...files.values()].sort((a, b) => path.basename(a).localeCompare(path.basename(b)))
}

export async function* savedItems(files = firehoseFiles()): AsyncGenerator<FeedItem> {
  // Files and rows are streamed. A disk-backed key lookup handles repeated revisions without retaining
  // either full archive items or one heap object per historic key.
  for (const file of files.slice().reverse()) {
    const input = fs.createReadStream(file, { encoding: 'utf8' })
    const lines = readline.createInterface({ input, crlfDelay: Infinity })
    try {
      for await (const line of lines) {
        if (!line.trim()) continue
        try {
          const row = JSON.parse(line) as FeedItem
          if (row?.kind === 'item' && row.event_id && row.ts) yield row
        } catch { /* one torn/corrupt line cannot stop a history backfill */ }
      }
    } catch { /* an archive may disappear while a removable mount is changing */ }
  }
}

export interface DiskSemanticKeyIndex extends SemanticKeyIndex {
  readonly backend: 'sqlite'
  readonly file: string
  close(): void
}

/** One streamed NDJSON pass into a temporary indexed table; membership stays O(log N) and heap-bounded. */
export async function createDiskSemanticKeyIndex(stateDir: string, model: string, tempParent = os.tmpdir()): Promise<DiskSemanticKeyIndex> {
  const dir = fs.mkdtempSync(path.join(tempParent, 'news-semantic-keys-'))
  const file = path.join(dir, 'resume.sqlite')
  const db = new DatabaseSync(file)
  db.exec('PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF; PRAGMA temp_store=FILE; CREATE TABLE keys (key TEXT PRIMARY KEY) WITHOUT ROWID;')
  const insert = db.prepare('INSERT OR IGNORE INTO keys(key) VALUES (?)')
  const lookup = db.prepare('SELECT 1 AS found FROM keys WHERE key = ?')
  try {
    db.exec('BEGIN')
    for await (const key of semanticIndexKeys(stateDir, model)) insert.run(key)
    db.exec('COMMIT')
  } catch (error) {
    try { db.exec('ROLLBACK') } catch { /* best effort */ }
    db.close()
    fs.rmSync(dir, { recursive: true, force: true })
    throw error
  }
  return {
    backend: 'sqlite', file,
    has: (key) => Boolean(lookup.get(key)),
    add: (key) => { insert.run(key) },
    close: () => { db.close(); fs.rmSync(dir, { recursive: true, force: true }) },
  }
}

export async function backfillSemanticItems(args: {
  items: AsyncIterable<FeedItem>
  stateDir: string
  config: EmbeddingConfig
  maxSelected?: number
  chunkSize?: number
  fetchFn?: typeof fetch
}): Promise<{ selected: number; indexed: number; skipped: number; status: 'active' | 'provider_error'; resume_backend: 'sqlite'; note?: string }> {
  const maxSelected = args.maxSelected ?? Number.POSITIVE_INFINITY
  const chunkSize = Math.max(1, args.chunkSize ?? Math.max(32, Math.min(500, args.config.batchSize * 8)))
  const existingKeys = await createDiskSemanticKeyIndex(args.stateDir, args.config.model)
  const queuedKeys = new Set<string>()
  let selected = 0
  let indexed = 0
  let skipped = 0
  let providerError: string | undefined
  let chunk: FeedItem[] = []
  try {
    const flush = async () => {
      if (!chunk.length || providerError) return
      const items = chunk
      chunk = []
      for (const item of items) queuedKeys.delete(semanticIndexKey(item))
      const result = await updateSemanticIndex({
        stateDir: args.stateDir,
        items,
        existingKeys,
        config: { ...args.config, maxItemsPerCycle: items.length },
        fetchFn: args.fetchFn,
      })
      indexed += result.indexed
      skipped += result.skipped
      if (result.status === 'provider_error') providerError = result.note || 'provider error'
    }
    for await (const item of args.items) {
      if (selected >= maxSelected || providerError) break
      const key = semanticIndexKey(item)
      if (existingKeys.has(key) || queuedKeys.has(key)) { skipped++; continue }
      queuedKeys.add(key)
      chunk.push(item)
      selected++
      if (chunk.length >= chunkSize) await flush()
    }
    await flush()
    return { selected, indexed, skipped, status: providerError ? 'provider_error' : 'active', resume_backend: existingKeys.backend, ...(providerError ? { note: providerError } : {}) }
  } finally {
    existingKeys.close()
  }
}

async function main(): Promise<void> {
  const configured = NEWS.retrievalEmbeddingEnabled && Boolean(NEWS.retrievalEmbeddingApiKey) && Boolean(NEWS.retrievalEmbeddingModel)
  if (!all && limit === null) {
    let savedRows = 0
    for await (const _item of savedItems()) savedRows++
    console.log(JSON.stringify({
      mode: 'status_only', saved_rows: savedRows, configured,
      state_dir: STATE_DIR,
      next: configured ? 'Run with --limit=1000 for a bounded trial, then --all.' : 'Set the NEWS_RETRIEVAL_EMBEDDING_* values, then run with --limit=1000.',
    }, null, 2))
    return
  }
  if (!configured) {
    console.error('Neural retrieval is not configured. No provider was called and no index was changed.')
    process.exitCode = 2
    return
  }

  const result = await backfillSemanticItems({
    items: savedItems(), stateDir: STATE_DIR,
    maxSelected: all ? Number.POSITIVE_INFINITY : Math.max(1, limit || 1),
    config: {
      enabled: true,
      apiKey: NEWS.retrievalEmbeddingApiKey,
      baseUrl: NEWS.retrievalEmbeddingBaseUrl,
      model: NEWS.retrievalEmbeddingModel,
      timeoutMs: NEWS.retrievalEmbeddingTimeoutMs,
      batchSize: NEWS.retrievalEmbeddingBatchSize,
      maxItemsPerCycle: Number.MAX_SAFE_INTEGER,
    },
  })
  console.log(JSON.stringify({ mode: all ? 'all' : 'bounded', ...result }, null, 2))
  if (result.status === 'provider_error') process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) void main()
