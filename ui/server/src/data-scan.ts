import { randomUUID } from 'node:crypto'
import { analyzeTicker } from './data-status'
import type { DataScanProgress, DataScanStage, DataStatus } from './types'

export interface DataScanUpdate {
  stage: DataScanStage
  completed: number
  total: number
  currentFile: string | null
}

export type DataAnalyzer = (ticker: string, progress: (update: DataScanUpdate) => void) => Promise<DataStatus>
type Listener = (progress: DataScanProgress) => void

function normalizeProgressMetrics(current: DataScanProgress, next: DataScanUpdate): { completed: number; total: number } {
  if (!Number.isSafeInteger(next.completed) || next.completed < 0
      || !Number.isSafeInteger(next.total) || next.total < 0 || next.completed > next.total) {
    return { completed: current.completed, total: current.total }
  }
  const total = Math.max(current.total, next.total)
  return { completed: Math.max(current.completed, Math.min(next.completed, total)), total }
}

// The browser request is not the lifetime of a scan. Keeping the single in-flight promise here means a
// refresh/reconnect attaches to the same work rather than starting 109 file reads again. The last snapshot
// is retained so a reconnected SSE client immediately knows exactly where the scan is.
export function createDataScanCoordinator(analyzer: DataAnalyzer = analyzeTicker) {
  const active = new Map<string, Promise<DataStatus>>()
  const latest = new Map<string, DataScanProgress>()
  const results = new Map<string, DataStatus>()
  const listeners = new Set<Listener>()

  const publish = (progress: DataScanProgress): void => {
    latest.set(progress.ticker, progress)
    // Bound retained snapshots even if a machine scans thousands of symbols over its lifetime.
    while (latest.size > 100) latest.delete(latest.keys().next().value as string)
    for (const listener of listeners) {
      try { listener(progress) } catch { /* one disconnected listener cannot stop the scan */ }
    }
  }

  const run = (ticker: string): Promise<DataStatus> => {
    const existing = active.get(ticker)
    if (existing) {
      const progress = latest.get(ticker)
      if (progress) publish(progress) // a refreshed browser joining mid-file gets an immediate replay
      return existing
    }

    const scanId = randomUUID()
    const startedAt = Date.now()
    results.delete(ticker)
    let current: DataScanProgress = {
      scanId, ticker, stage: 'finding', completed: 0, total: 0,
      currentFile: null, error: null, startedAt, updatedAt: startedAt,
    }
    publish(current)

    const update = (next: DataScanUpdate): void => {
      // File completion may only move forward within one scan. This also protects the progress bar from
      // jumping backwards if a future extractor reports late asynchronous detail.
      const metrics = normalizeProgressMetrics(current, next)
      current = { ...current, ...next, ...metrics, error: null, updatedAt: Date.now() }
      publish(current)
    }

    const promise = analyzer(ticker, update).then((status) => {
      current = {
        ...current, stage: 'ready', completed: current.total, currentFile: null,
        error: null, updatedAt: Date.now(),
      }
      results.set(ticker, status)
      while (results.size > 25) results.delete(results.keys().next().value as string)
      publish(current)
      return status
    }).catch((cause: unknown) => {
      const safeDetail = current.currentFile
        ? `Could not read ${current.currentFile}.`
        : 'The data scan stopped.'
      current = { ...current, stage: 'failed', error: safeDetail, updatedAt: Date.now() }
      publish(current)
      throw cause
    }).finally(() => {
      if (active.get(ticker) === promise) active.delete(ticker)
    })

    active.set(ticker, promise)
    return promise
  }

  return {
    run,
    current: (ticker: string): DataScanProgress | null => latest.get(ticker) ?? null,
    result: (ticker: string): DataStatus | null => results.get(ticker) ?? null,
    snapshots: (): DataScanProgress[] => [...latest.values()],
    subscribe: (listener: Listener): (() => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const dataScans = createDataScanCoordinator()
