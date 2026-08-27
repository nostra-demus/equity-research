// Non-blocking service boundary for archive-wide facets.
//
// computeFacets is intentionally synchronous: it walks date-partitioned files and builds compact rows.
// That is useful inside a dedicated worker, but it used to run directly in the HTTP handler and freeze
// the whole control plane for 5-6 seconds on the live archive. This service gives the server three durable
// properties:
//   1. the expensive build runs in one background worker, never on the request/event-loop thread;
//   2. identical callers join one in-flight build and then use a bounded response cache;
//   3. startup and every successful ingest pre-warm the unfiltered geography/company universe.
// A worker bootstrap failure falls back to the old direct path, so filters remain available rather than
// failing closed; the fallback is an emergency path, not the normal production route.

import { Worker } from 'node:worker_threads'
import type { FeedFilterQuery } from './feed-filter'
import { computeFacets, invalidateFacets, type Facets } from './facets'

type FacetWorkerResponse =
  | { type: 'result'; id: number; facets: Facets }
  | { type: 'error'; id: number; error: string }

interface PendingWorkerCall {
  resolve: (facets: Facets) => void
  reject: (error: Error) => void
}

interface CachedFacets {
  facets: Facets
  expiresAt: number
}

const RESPONSE_TTL_MS = 10 * 60 * 1000
const MAX_RESPONSE_CACHE = 32
const WORKER_RETRY_MS = 30_000

let worker: Worker | null = null
let workerRetryAt = 0
let lastFallbackLogAt = 0
let nextWorkerId = 1
let generation = 0
const workerCalls = new Map<number, PendingWorkerCall>()
const responseCache = new Map<string, CachedFacets>()
const inFlight = new Map<string, Promise<Facets>>()

function cacheKey(repoRoot: string, archiveDir: string, query: FeedFilterQuery): string {
  return JSON.stringify([repoRoot, archiveDir, query])
}

function trimResponseCache(): void {
  while (responseCache.size > MAX_RESPONSE_CACHE) {
    const oldest = responseCache.keys().next().value
    if (oldest === undefined) return
    responseCache.delete(oldest)
  }
}

function settleWorkerRef(): void {
  if (worker && workerCalls.size === 0) worker.unref()
}

function failWorker(instance: Worker, error: Error): void {
  if (worker !== instance) return
  worker = null
  workerRetryAt = Date.now() + WORKER_RETRY_MS
  const pending = [...workerCalls.values()]
  workerCalls.clear()
  for (const call of pending) call.reject(error)
}

function getWorker(): Worker {
  if (worker) return worker
  if (Date.now() < workerRetryAt) throw new Error('archive facet worker is restarting')

  let instance: Worker
  try { instance = new Worker(new URL('./facets-worker.ts', import.meta.url)) }
  catch (error) {
    workerRetryAt = Date.now() + WORKER_RETRY_MS
    throw error
  }
  worker = instance
  instance.unref()
  instance.on('message', (message: FacetWorkerResponse) => {
    const call = workerCalls.get(message.id)
    if (!call) return
    workerCalls.delete(message.id)
    if (message.type === 'result') call.resolve(message.facets)
    else call.reject(new Error(message.error))
    settleWorkerRef()
  })
  instance.on('error', (error) => failWorker(instance, error))
  instance.on('exit', (code) => {
    if (worker === instance) failWorker(instance, new Error(`archive facet worker exited (${code})`))
  })
  return instance
}

function computeInWorker(repoRoot: string, archiveDir: string, query: FeedFilterQuery): Promise<Facets> {
  let instance: Worker
  try { instance = getWorker() }
  catch (error: any) { return Promise.reject(error instanceof Error ? error : new Error(String(error))) }

  const id = nextWorkerId++
  instance.ref()
  return new Promise<Facets>((resolve, reject) => {
    workerCalls.set(id, { resolve, reject })
    try {
      instance.postMessage({ type: 'compute', id, repoRoot, archiveDir, query })
    } catch (error: any) {
      workerCalls.delete(id)
      settleWorkerRef()
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })
}

/** Compute archive facets without blocking the server event loop. Identical concurrent requests share one
 * worker job; completed responses stay warm until the next ingest invalidates them or the TTL expires. */
export function computeFacetsAsync(
  repoRoot: string,
  query: FeedFilterQuery,
  opts: { archiveDir?: string } = {},
): Promise<Facets> {
  const archiveDir = opts.archiveDir || ''
  const key = cacheKey(repoRoot, archiveDir, query)
  const now = Date.now()
  const cached = responseCache.get(key)
  if (cached && cached.expiresAt > now) {
    // Map insertion order is the LRU order. Refresh the hit without copying the large response.
    responseCache.delete(key)
    responseCache.set(key, cached)
    return Promise.resolve(cached.facets)
  }
  if (cached) responseCache.delete(key)

  const existing = inFlight.get(key)
  if (existing) return existing
  const buildGeneration = generation
  const build = computeInWorker(repoRoot, archiveDir, query)
    // Availability fallback: a bad worker bootstrap must not remove the archive controls entirely.
    .catch((error) => {
      const at = Date.now()
      if (at - lastFallbackLogAt >= WORKER_RETRY_MS) {
        lastFallbackLogAt = at
        // Keep the public filter usable, but make the degraded main-thread compatibility path observable.
        // Error class only: worker errors can contain machine paths that do not belong in routine logs.
        console.error(`[news-facets] background index unavailable (${error?.name || 'Error'}); using compatibility path`) // eslint-disable-line no-console
      }
      return computeFacets(repoRoot, query, { archiveDir })
    })
    .then((facets) => {
      if (generation === buildGeneration) {
        responseCache.set(key, { facets, expiresAt: Date.now() + RESPONSE_TTL_MS })
        trimResponseCache()
      }
      return facets
    })
    .finally(() => { if (inFlight.get(key) === build) inFlight.delete(key) })
  inFlight.set(key, build)
  return build
}

/** Build the complete filter universe ahead of the reader's first click. Safe to call repeatedly. */
export async function warmFacets(repoRoot: string, opts: { archiveDir?: string } = {}): Promise<void> {
  await computeFacetsAsync(repoRoot, {}, opts)
}

/** A successful ingest changed today's partition. Drop every response snapshot, invalidate both the direct
 * emergency cache and the worker's row cache, then rebuild the unfiltered universe in the background. */
export function invalidateAndWarmFacets(repoRoot: string, opts: { archiveDir?: string } = {}): void {
  generation++
  responseCache.clear()
  inFlight.clear()
  invalidateFacets()
  if (worker) {
    try { worker.postMessage({ type: 'invalidate' }) }
    catch { /* worker failure is handled by its error/exit listener and the direct fallback */ }
  }
  void warmFacets(repoRoot, opts)
}

/** Test-only lifecycle hook. Production shutdown uses process.exit after Fastify drains. */
export async function closeFacetsWorkerForTests(): Promise<void> {
  const instance = worker
  worker = null
  workerRetryAt = 0
  lastFallbackLogAt = 0
  generation++
  responseCache.clear()
  inFlight.clear()
  const pending = [...workerCalls.values()]
  workerCalls.clear()
  for (const call of pending) call.reject(new Error('archive facet worker closed'))
  if (instance) await instance.terminate()
}
