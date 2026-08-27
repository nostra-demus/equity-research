// The archive facet index is deliberately built off the server's main thread. On a production-sized
// Drive archive computeFacets takes several seconds of synchronous file/index work; doing that inside a
// Fastify handler freezes every unrelated request until it finishes. This worker owns that synchronous
// work and its per-day parse cache, while facets-service.ts owns request de-duplication and response cache.

import { parentPort } from 'node:worker_threads'
import type { FeedFilterQuery } from './feed-filter'
import { computeFacets, invalidateFacets } from './facets'

type FacetWorkerRequest =
  | { type: 'compute'; id: number; repoRoot: string; archiveDir: string; query: FeedFilterQuery }
  | { type: 'invalidate' }

type FacetWorkerResponse =
  | { type: 'result'; id: number; facets: ReturnType<typeof computeFacets> }
  | { type: 'error'; id: number; error: string }

if (!parentPort) throw new Error('facet worker requires a parent port')

parentPort.on('message', (message: FacetWorkerRequest) => {
  if (message.type === 'invalidate') {
    invalidateFacets()
    return
  }
  try {
    const facets = computeFacets(message.repoRoot, message.query, { archiveDir: message.archiveDir })
    parentPort!.postMessage({ type: 'result', id: message.id, facets } satisfies FacetWorkerResponse)
  } catch (error: any) {
    parentPort!.postMessage({
      type: 'error',
      id: message.id,
      error: error?.message || 'archive facet build failed',
    } satisfies FacetWorkerResponse)
  }
})
