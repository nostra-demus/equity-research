// Optional neural retrieval over a compact, local binary-vector index.
//
// An OpenAI-compatible embedding endpoint turns each saved event into a vector. We keep a 256-bit
// deterministic random-projection signature instead of the full float vector: about 32 bytes/event,
// cheap enough to scan across the full archive. Lexical retrieval remains the safe baseline. If the
// provider or index is missing, callers get an explicit fallback status and the normal search continues.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { FeedItem } from '../news/types'

export interface EmbeddingConfig {
  enabled: boolean
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs: number
  batchSize: number
  maxItemsPerCycle: number
}

export interface SemanticHit { eventId: string; score: number; rank: number; ts: string }
export interface SemanticSearchResult {
  status: 'active' | 'not_configured' | 'empty_index' | 'provider_error'
  model: string | null
  indexedItems: number
  hits: SemanticHit[]
  note?: string
}

interface IndexRow { event_id: string; ts: string; model: string; text_hash: string; signature: string }

const INDEX_FILE = 'news-semantic-index.ndjson'
const BITS = 256
const SAMPLES_PER_BIT = 8
let cache: { file: string; mtimeMs: number; rows: IndexRow[] } | null = null

function endpoint(baseUrl: string, tail: string): string { return `${baseUrl.replace(/\/+$/, '')}/${tail.replace(/^\/+/, '')}` }
function hashText(text: string): string { return createHash('sha256').update(text).digest('hex').slice(0, 20) }

export function semanticItemText(item: FeedItem): string {
  return [
    item.headline_en, item.headline, item.snippet,
    ...(item.companies || []).flatMap((c) => [c.name, c.ticker || '']),
    ...(item.topics || []), ...(item.commodities || []), ...(item.event_types || []),
    item.triage_reason,
  ].filter(Boolean).join(' ').slice(0, 5000)
}

async function embeddings(texts: string[], cfg: EmbeddingConfig, fetchFn: typeof fetch): Promise<number[][]> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs)
  try {
    const res = await fetchFn(endpoint(cfg.baseUrl, 'embeddings'), {
      method: 'POST',
      headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, input: texts, encoding_format: 'float' }),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`embedding HTTP ${res.status}`)
    const body: any = await res.json()
    const rows = Array.isArray(body?.data) ? body.data.slice().sort((a: any, b: any) => Number(a?.index || 0) - Number(b?.index || 0)) : []
    const out = rows.map((row: any) => Array.isArray(row?.embedding) ? row.embedding.map(Number) : [])
    if (out.length !== texts.length || out.some((v: number[]) => v.length < 16 || v.some((n) => !Number.isFinite(n)))) throw new Error('embedding response shape was invalid')
    return out
  } finally { clearTimeout(timer) }
}

// Deterministic sparse random projection. Each bit samples eight signed vector dimensions. It preserves
// broad angular similarity without storing provider vectors or taking a native vector dependency.
export function binarySignature(vector: number[]): Buffer {
  const out = Buffer.alloc(BITS / 8)
  const dim = vector.length
  for (let bit = 0; bit < BITS; bit++) {
    let seed = (0x9e3779b9 ^ Math.imul(bit + 1, 0x85ebca6b)) >>> 0
    let sum = 0
    for (let j = 0; j < SAMPLES_PER_BIT; j++) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0
      const idx = seed % dim
      sum += (seed & 0x10000) ? vector[idx] : -vector[idx]
    }
    if (sum >= 0) out[bit >> 3] |= 1 << (bit & 7)
  }
  return out
}

const POP = Array.from({ length: 256 }, (_, n) => {
  let x = n, count = 0
  while (x) { count += x & 1; x >>>= 1 }
  return count
})

export function signatureSimilarity(a: Buffer, b: Buffer): number {
  if (a.length !== b.length || !a.length) return 0
  let distance = 0
  for (let i = 0; i < a.length; i++) distance += POP[a[i] ^ b[i]]
  return 1 - distance / (a.length * 8)
}

function readIndex(stateDir: string): IndexRow[] {
  const file = path.join(stateDir, INDEX_FILE)
  let stat: fs.Stats
  try { stat = fs.statSync(file) } catch { return [] }
  if (cache?.file === file && cache.mtimeMs === stat.mtimeMs) return cache.rows
  const byId = new Map<string, IndexRow>()
  try {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (!line.trim()) continue
      try {
        const row = JSON.parse(line) as IndexRow
        if (row?.event_id && row?.signature && row?.model) byId.set(`${row.model}|${row.event_id}`, row)
      } catch { /* a torn last line cannot break the index */ }
    }
  } catch { return [] }
  const rows = [...byId.values()]
  cache = { file, mtimeMs: stat.mtimeMs, rows }
  return rows
}

export async function updateSemanticIndex(args: {
  stateDir: string
  items: FeedItem[]
  config: EmbeddingConfig
  fetchFn?: typeof fetch
}): Promise<{ indexed: number; skipped: number; status: SemanticSearchResult['status']; note?: string }> {
  const cfg = args.config
  if (!cfg.enabled || !cfg.apiKey || !cfg.model) return { indexed: 0, skipped: args.items.length, status: 'not_configured' }
  const existing = new Set(readIndex(args.stateDir).filter((r) => r.model === cfg.model).map((r) => `${r.event_id}|${r.text_hash}`))
  const pending = args.items.map((item) => ({ item, text: semanticItemText(item) }))
    .map((row) => ({ ...row, textHash: hashText(row.text) }))
    .filter((row) => !existing.has(`${row.item.event_id}|${row.textHash}`))
    .slice(0, Math.max(1, cfg.maxItemsPerCycle))
  if (!pending.length) return { indexed: 0, skipped: args.items.length, status: 'active' }
  let indexed = 0
  try {
    fs.mkdirSync(args.stateDir, { recursive: true })
    const file = path.join(args.stateDir, INDEX_FILE)
    for (let i = 0; i < pending.length; i += Math.max(1, cfg.batchSize)) {
      const batch = pending.slice(i, i + Math.max(1, cfg.batchSize))
      const vectors = await embeddings(batch.map((r) => r.text), cfg, args.fetchFn || fetch)
      const lines: string[] = []
      for (let j = 0; j < batch.length; j++) {
        const row: IndexRow = {
          event_id: batch[j].item.event_id,
          ts: batch[j].item.ts,
          model: cfg.model,
          text_hash: batch[j].textHash,
          signature: binarySignature(vectors[j]).toString('base64'),
        }
        lines.push(JSON.stringify(row))
      }
      // Commit every successful batch. A long history backfill can resume after a provider/network
      // failure without paying for all earlier batches again.
      fs.appendFileSync(file, lines.join('\n') + '\n')
      indexed += lines.length
    }
    cache = null
    return { indexed, skipped: Math.max(0, args.items.length - indexed), status: 'active' }
  } catch (e: any) {
    cache = null
    return { indexed, skipped: Math.max(0, args.items.length - indexed), status: 'provider_error', note: String(e?.message || e).slice(0, 240) }
  }
}

export async function searchSemanticIndex(args: {
  stateDir: string
  query: string
  config: EmbeddingConfig
  cutoffMs?: number
  limit?: number
  fetchFn?: typeof fetch
}): Promise<SemanticSearchResult> {
  const cfg = args.config
  if (!cfg.enabled || !cfg.apiKey || !cfg.model) return { status: 'not_configured', model: null, indexedItems: 0, hits: [] }
  const rows = readIndex(args.stateDir).filter((r) => r.model === cfg.model && (!args.cutoffMs || Date.parse(r.ts) >= args.cutoffMs))
  if (!rows.length) return { status: 'empty_index', model: cfg.model, indexedItems: 0, hits: [] }
  try {
    const [vector] = await embeddings([args.query.slice(0, 4000)], cfg, args.fetchFn || fetch)
    const querySig = binarySignature(vector)
    const ranked = rows.map((row) => ({ row, score: signatureSimilarity(querySig, Buffer.from(row.signature, 'base64')) }))
      .sort((a, b) => b.score - a.score || b.row.ts.localeCompare(a.row.ts))
      .slice(0, args.limit || 220)
    return {
      status: 'active', model: cfg.model, indexedItems: rows.length,
      hits: ranked.map((r, i) => ({ eventId: r.row.event_id, score: Math.round(r.score * 10_000) / 10_000, rank: i + 1, ts: r.row.ts })),
    }
  } catch (e: any) {
    return { status: 'provider_error', model: cfg.model, indexedItems: rows.length, hits: [], note: String(e?.message || e).slice(0, 240) }
  }
}

export function invalidateSemanticIndex(): void { cache = null }
