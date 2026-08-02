// Optional neural retrieval over a compact, local binary-vector index.
//
// An OpenAI-compatible embedding endpoint turns each saved event into a vector. We keep a 256-bit
// deterministic random-projection signature instead of the full float vector: about 32 bytes/event,
// cheap enough to scan across the full archive. Lexical retrieval remains the safe baseline. If the
// provider or index is missing, callers get an explicit fallback status and the normal search continues.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
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

interface IndexRow { schema_version?: number; event_id: string; ts: string; model: string; text_hash: string; signature: string; named_anchors?: string[]; entity_anchors?: string[] }

const INDEX_FILE = 'news-semantic-index.ndjson'
const BITS = 256
const SAMPLES_PER_BIT = 8
const INDEX_SCHEMA_VERSION = 3
// 0.65 rejected the reviewed non-semantic projection that scored 0.6289 while retaining exact/strong
// positives. The corpus-size bound below raises this further as multiple-comparison risk grows.
const DEFAULT_MIN_SIMILARITY = 0.65
const DEFAULT_MIN_NULL_GAP = 0.08

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

/** Stable compact identity used by both the live updater and the resumable history backfill. */
export function semanticIndexKey(item: FeedItem): string {
  return `${item.event_id}|${hashText(semanticItemText(item))}`
}

const NON_NAME = new Set(['The', 'This', 'That', 'After', 'Before', 'Today', 'Tomorrow', 'Quarter', 'Annual', 'Market', 'Markets', 'Company', 'Companies', 'Growth', 'Revenue', 'Profit', 'Sales', 'Earnings', 'Guidance', 'Oil', 'Rates'])
function namedAnchorsForItem(item: FeedItem): string[] {
  const values = (item.companies || []).flatMap((company) => [company.name, company.ticker || ''])
  const headline = String(item.headline_en || item.headline || '')
  values.push(...(headline.match(/\b(?:[A-Z]{2,}|[A-Z][A-Za-z0-9.&'-]{2,})\b/g) || []).filter((name) => !NON_NAME.has(name)))
  return [...new Set(values.flatMap((value) => String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9.:-]{1,}/g) || []))].slice(0, 24)
}

function entityAnchorsForItem(item: FeedItem): string[] {
  return [...new Set((item.companies || []).flatMap((company) => [company.name, company.ticker || ''])
    .flatMap((value) => String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9.:-]{1,}/g) || []))].slice(0, 16)
}

function abortError(): DOMException { return new DOMException('Aborted', 'AbortError') }

async function embeddings(texts: string[], cfg: EmbeddingConfig, fetchFn: typeof fetch, signal?: AbortSignal): Promise<number[][]> {
  const ctrl = new AbortController()
  const stop = () => ctrl.abort()
  if (signal?.aborted) throw abortError()
  signal?.addEventListener('abort', stop, { once: true })
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
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', stop)
  }
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

async function* readIndex(file: string, signal?: AbortSignal): AsyncGenerator<IndexRow> {
  if (signal?.aborted) throw abortError()
  let stream: fs.ReadStream
  try { stream = fs.createReadStream(file, { encoding: 'utf8' }) } catch { return }
  stream.on('error', () => { /* handled by readline close */ })
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity })
  const stop = () => { lines.close(); stream.destroy(abortError()) }
  signal?.addEventListener('abort', stop, { once: true })
  try {
    for await (const line of lines) {
      if (signal?.aborted) throw abortError()
      if (!line.trim()) continue
      try {
        const row = JSON.parse(line) as IndexRow
        if (row?.event_id && row?.signature && row?.model) yield row
      } catch { /* a torn/corrupt line cannot break the index */ }
    }
    if (signal?.aborted) throw abortError()
  } catch {
    if (signal?.aborted) throw abortError()
    /* missing/unreadable index behaves as empty */
  } finally {
    signal?.removeEventListener('abort', stop)
    lines.close()
    stream.destroy()
  }
}

/**
 * Stream compact resume keys once. The history script writes them to a disk-backed lookup, avoiding both
 * one full scan per chunk and an archive-sized in-memory Set.
 */
export async function* semanticIndexKeys(stateDir: string, model: string): AsyncGenerator<string> {
  for await (const row of readIndex(path.join(stateDir, INDEX_FILE))) {
    if (row.model === model && row.schema_version === INDEX_SCHEMA_VERSION) yield `${row.event_id}|${row.text_hash}`
  }
}

export interface SemanticKeyIndex { has(key: string): boolean; add(key: string): unknown }

export async function updateSemanticIndex(args: {
  stateDir: string
  items: FeedItem[]
  config: EmbeddingConfig
  /** Optional shared resume state for large backfills; mutated with every successful append. */
  existingKeys?: SemanticKeyIndex
  fetchFn?: typeof fetch
}): Promise<{ indexed: number; skipped: number; status: SemanticSearchResult['status']; note?: string }> {
  const cfg = args.config
  if (!cfg.enabled || !cfg.apiKey || !cfg.model) return { indexed: 0, skipped: args.items.length, status: 'not_configured' }
  const maxItems = Math.max(1, cfg.maxItemsPerCycle)
  const candidatesByKey = new Map<string, { item: FeedItem; text: string; textHash: string }>()
  for (const item of args.items) {
    const text = semanticItemText(item)
    const textHash = hashText(text)
    const key = `${item.event_id}|${textHash}`
    const prior = candidatesByKey.get(key)
    if (!prior || item.ts >= prior.item.ts) candidatesByKey.set(key, { item, text, textHash })
    if (candidatesByKey.size >= maxItems) break
  }
  const candidates = [...candidatesByKey.values()]
  const wanted = new Map(candidates.map((row) => [row.item.event_id, row.textHash]))
  const existing = args.existingKeys || new Set<string>()
  const file = path.join(args.stateDir, INDEX_FILE)
  if (!args.existingKeys) {
    for await (const row of readIndex(file)) {
      if (row.model === cfg.model && row.schema_version === INDEX_SCHEMA_VERSION && wanted.get(row.event_id) === row.text_hash) existing.add(`${row.event_id}|${row.text_hash}`)
    }
  }
  const pending = candidates.filter((row) => !existing.has(`${row.item.event_id}|${row.textHash}`))
  if (!pending.length) return { indexed: 0, skipped: args.items.length, status: 'active' }
  let indexed = 0
  try {
    fs.mkdirSync(args.stateDir, { recursive: true })
    for (let i = 0; i < pending.length; i += Math.max(1, cfg.batchSize)) {
      const batch = pending.slice(i, i + Math.max(1, cfg.batchSize))
      const vectors = await embeddings(batch.map((r) => r.text), cfg, args.fetchFn || fetch)
      const lines: string[] = []
      for (let j = 0; j < batch.length; j++) {
        const row: IndexRow = {
          schema_version: INDEX_SCHEMA_VERSION,
          event_id: batch[j].item.event_id,
          ts: batch[j].item.ts,
          model: cfg.model,
          text_hash: batch[j].textHash,
          signature: binarySignature(vectors[j]).toString('base64'),
          named_anchors: namedAnchorsForItem(batch[j].item),
          entity_anchors: entityAnchorsForItem(batch[j].item),
        }
        lines.push(JSON.stringify(row))
      }
      // Commit every successful batch. A long history backfill can resume after a provider/network
      // failure without paying for all earlier batches again.
      fs.appendFileSync(file, lines.join('\n') + '\n')
      for (const row of batch) existing.add(`${row.item.event_id}|${row.textHash}`)
      indexed += lines.length
    }
    return { indexed, skipped: Math.max(0, args.items.length - indexed), status: 'active' }
  } catch (e: any) {
    return { indexed, skipped: Math.max(0, args.items.length - indexed), status: 'provider_error', note: String(e?.message || e).slice(0, 240) }
  }
}

export async function searchSemanticIndex(args: {
  stateDir: string
  query: string
  config: EmbeddingConfig
  cutoffMs?: number
  limit?: number
  minSimilarity?: number
  minNullGap?: number
  /** Optional reviewed/caller-derived proper-name anchors. Lowercase entity fallback uses index provenance. */
  namedAnchors?: string[]
  fetchFn?: typeof fetch
  signal?: AbortSignal
}): Promise<SemanticSearchResult> {
  const cfg = args.config
  if (!cfg.enabled || !cfg.apiKey || !cfg.model) return { status: 'not_configured', model: null, indexedItems: 0, hits: [] }
  const file = path.join(args.stateDir, INDEX_FILE)
  if (!fs.existsSync(file)) return { status: 'empty_index', model: cfg.model, indexedItems: 0, hits: [] }
  try {
    const [vector] = await embeddings([args.query.slice(0, 4000)], cfg, args.fetchFn || fetch, args.signal)
    const querySig = binarySignature(vector)
    const explicitAnchors = [...new Set((args.namedAnchors || []).flatMap((value) => String(value).toLowerCase().match(/[a-z0-9][a-z0-9.:-]{1,}/g) || []))]
    const queryTokens = new Set(String(args.query).toLowerCase().match(/[a-z0-9][a-z0-9.:-]{1,}/g) || [])
    const minSimilarity = Math.max(0, Math.min(1, args.minSimilarity ?? DEFAULT_MIN_SIMILARITY))
    const minNullGap = Math.max(0, Math.min(0.5, args.minNullGap ?? DEFAULT_MIN_NULL_GAP))
    const baseThreshold = Math.max(minSimilarity, 0.5 + minNullGap)
    const limit = Math.max(1, Math.min(500, args.limit || 220))
    const broadRanked: { row: IndexRow; score: number }[] = []
    const entityRanked: { row: IndexRow; score: number }[] = []
    const keep = (ranked: { row: IndexRow; score: number }[], row: IndexRow, score: number) => {
      const prior = ranked.findIndex((hit) => hit.row.event_id === row.event_id)
      if (prior >= 0) {
        if (ranked[prior].score > score || (ranked[prior].score === score && ranked[prior].row.ts >= row.ts)) return
        ranked.splice(prior, 1)
      }
      const insertAt = ranked.findIndex((hit) => score > hit.score || (score === hit.score && row.ts > hit.row.ts))
      if (insertAt < 0) ranked.push({ row, score })
      else ranked.splice(insertAt, 0, { row, score })
      if (ranked.length > limit) ranked.length = limit
    }
    let indexedItems = 0
    let anchorRejected = 0
    let sawEntityQueryToken = false
    for await (const row of readIndex(file, args.signal)) {
      if (row.model !== cfg.model || row.schema_version !== INDEX_SCHEMA_VERSION || (args.cutoffMs && Date.parse(row.ts) < args.cutoffMs)) continue
      indexedItems++
      const rowNames = [...new Set([...(row.named_anchors || []), ...(row.entity_anchors || [])])]
      const entityMatch = (row.entity_anchors || []).some((anchor) => queryTokens.has(anchor))
      if (entityMatch) sawEntityQueryToken = true
      const score = signatureSimilarity(querySig, Buffer.from(row.signature, 'base64'))
      if (score < baseThreshold) continue
      if (explicitAnchors.length) {
        if (!explicitAnchors.some((anchor) => rowNames.includes(anchor))) { anchorRejected++; continue }
        keep(entityRanked, row, score)
      } else {
        keep(broadRanked, row, score)
        if (entityMatch) keep(entityRanked, row, score)
      }
    }
    if (!indexedItems) return { status: 'empty_index', model: cfg.model, indexedItems: 0, hits: [] }
    // A random 256-bit signature is Binomial(256, 0.5). Hoeffding + a 1% family-wise error budget
    // raises the floor with corpus size, so scanning more rows cannot manufacture a "nearest" result.
    const nullFloor = 0.5 + Math.sqrt(Math.log(Math.max(1, indexedItems) / 0.01) / (2 * BITS))
    const threshold = Math.max(baseThreshold, Math.min(0.9, nullFloor))
    const ranked = (explicitAnchors.length || sawEntityQueryToken ? entityRanked : broadRanked)
      .filter((hit) => hit.score >= threshold)
    return {
      status: 'active', model: cfg.model, indexedItems,
      hits: ranked.map((r, i) => ({ eventId: r.row.event_id, score: Math.round(r.score * 10_000) / 10_000, rank: i + 1, ts: r.row.ts })),
      ...(!ranked.length ? { note: `No neural hit cleared similarity ${threshold.toFixed(2)}${explicitAnchors.length || sawEntityQueryToken ? ` and named-entity gate (${anchorRejected} rejected)` : ''}.` } : {}),
    }
  } catch (e: any) {
    if (args.signal?.aborted) throw abortError()
    return { status: 'provider_error', model: cfg.model, indexedItems: 0, hits: [], note: String(e?.message || e).slice(0, 240) }
  }
}

/** Kept for callers; the streamed implementation holds no unbounded index cache to invalidate. */
export function invalidateSemanticIndex(): void { /* no-op */ }
