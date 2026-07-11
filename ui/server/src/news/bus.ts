// A tiny in-process pub/sub bridging the ingest cycle to live listeners (the cockpit's SSE news
// stream). Keeps runCycle UI-agnostic: it emits domain events here; server.ts subscribes once and
// fans out to its SSE clients. No deps, no buffering — backfill comes from the firehose file.

import type { CycleSummary, FeedItem } from './types'
import type { ThemeSummary } from './themes/types'

export type NewsBusEvent =
  | { type: 'news-item'; item: FeedItem }
  // Fired the moment a cycle BEGINS, so the cockpit can say "looking now" for the whole cycle instead
  // of staying blind until the summary lands. `phase` separates a real fetch from a backlog drain
  // (a drain scores deferred items and never touches the network).
  | { type: 'news-cycle-start'; ts: string; phase: 'fetch' | 'drain' }
  | { type: 'news-cycle'; summary: CycleSummary }
  | { type: 'theme-update'; theme: ThemeSummary }

type Listener = (e: NewsBusEvent) => void

const listeners = new Set<Listener>()

export const newsBus = {
  emit(e: NewsBusEvent): void {
    for (const fn of listeners) {
      try {
        fn(e)
      } catch {
        // a bad listener never breaks the ingest cycle
      }
    }
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
