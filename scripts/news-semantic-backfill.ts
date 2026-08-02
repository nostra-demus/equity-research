// Build/resume the optional compact neural index over saved news history.
// No flag = status-only and no provider spend. Use --limit=N for a bounded trial or --all explicitly.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NEWS, STATE_DIR } from '../ui/server/src/config'
import { updateSemanticIndex } from '../ui/server/src/retrieval/semantic'
import type { FeedItem } from '../ui/server/src/news/types'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const all = args.includes('--all')
const limitArg = args.find((x) => /^--limit=\d+$/.test(x))
const limit = limitArg ? Number(limitArg.split('=')[1]) : null

function firehoseFiles(): string[] {
  const dirs = [
    path.join(repoRoot, 'screener', 'inbox'),
    path.join(repoRoot, 'data', 'NEWS-ARCHIVE'),
    NEWS.newsArchiveDir ? path.resolve(NEWS.newsArchiveDir) : '',
  ].filter(Boolean)
  const files = new Set<string>()
  for (const dir of dirs) {
    try {
      for (const name of fs.readdirSync(dir)) if (name.endsWith('_firehose.ndjson')) files.add(path.join(dir, name))
    } catch { /* an optional archive may not be mounted */ }
  }
  return [...files].sort()
}

function savedItems(): FeedItem[] {
  const byId = new Map<string, FeedItem>()
  for (const file of firehoseFiles()) {
    let text = ''
    try { text = fs.readFileSync(file, 'utf8') } catch { continue }
    for (const line of text.split('\n')) {
      if (!line.trim()) continue
      try {
        const row = JSON.parse(line) as FeedItem
        if (row?.kind !== 'item' || !row.event_id || !row.ts) continue
        const prior = byId.get(row.event_id)
        if (!prior || row.ts >= prior.ts) byId.set(row.event_id, row)
      } catch { /* one torn/corrupt line cannot stop a history backfill */ }
    }
  }
  return [...byId.values()].sort((a, b) => b.ts.localeCompare(a.ts))
}

async function main(): Promise<void> {
  const items = savedItems()
  const configured = NEWS.retrievalEmbeddingEnabled && Boolean(NEWS.retrievalEmbeddingApiKey) && Boolean(NEWS.retrievalEmbeddingModel)
  if (!all && limit === null) {
    console.log(JSON.stringify({
      mode: 'status_only', saved_items: items.length, configured,
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

  const selected = all ? items : items.slice(0, Math.max(1, limit || 1))
  const result = await updateSemanticIndex({
    stateDir: STATE_DIR,
    items: selected,
    config: {
      enabled: true,
      apiKey: NEWS.retrievalEmbeddingApiKey,
      baseUrl: NEWS.retrievalEmbeddingBaseUrl,
      model: NEWS.retrievalEmbeddingModel,
      timeoutMs: NEWS.retrievalEmbeddingTimeoutMs,
      batchSize: NEWS.retrievalEmbeddingBatchSize,
      maxItemsPerCycle: selected.length,
    },
  })
  console.log(JSON.stringify({ mode: all ? 'all' : 'bounded', selected: selected.length, ...result }, null, 2))
  if (result.status === 'provider_error') process.exitCode = 1
}

void main()
