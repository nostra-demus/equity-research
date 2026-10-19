import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { isModelRead, MODEL_REFRESH_MS, MODEL_SCHEMA, UNIVERSE_URL, type ModelRead, type ModelRow } from '../../shared/universe-model'
import { createUniverseEventsReader } from './universe-events'

// These are public custom-view columns, not an Elite export/API. No credentials, paid providers,
// browser challenges, proxies or per-company quote fan-out. One paced sweep shared by all readers.
const COLUMNS = '0,1,2,65'
const PAGE_GAP_MS = 2_000
const MAX_ROWS = 10_000
const MAX_HTML_BYTES = 2_000_000

export function finvizPageUrl(firstRow: number, tickers?: string[]): string {
  const url = new URL(UNIVERSE_URL)
  url.searchParams.delete('preset') // Account-local preset IDs do not authenticate a public screen.
  url.searchParams.set('v', '151')
  url.searchParams.set('c', COLUMNS)
  url.searchParams.set('o', 'ticker')
  url.searchParams.set('r', String(firstRow + 1)) // Finviz r is one-based; SSR firstRow is zero-based.
  if (tickers) { url.searchParams.delete('f'); url.searchParams.set('t', tickers.join(',')) }
  return url.toString()
}
export function finvizUniverseUrl(firstRow: number): string {
  const url = new URL(finvizPageUrl(firstRow))
  url.searchParams.set('v', '411') // The free Tickers view returns up to 1,000 names per public page.
  url.searchParams.delete('c')
  return url.toString()
}

export function parseFinvizPage(html: string, firstRow: number, retrievedAt: string, tickers?: string[]): { rows: ModelRow[]; total: number; pageSize: number } {
  // Parse inert JSON only. Never evaluate a provider script or trust markup as instructions.
  const scripts = [...html.matchAll(/<script\b(?=[^>]*\btype="application\/json")(?=[^>]*\bdata-ssr-props=)[^>]*>([\s\S]*?)<\/script>/gi)]
  let props: any
  for (const script of scripts) {
    try { const value = JSON.parse(script[1]); if (value?.data?.rows) { props = value; break } } catch { /* reject below */ }
  }
  const data = props?.data
  const sourceUrl = typeof props?.url === 'string' ? new URL(props.url, 'https://finviz.com') : null
  const filters = sourceUrl?.searchParams.get('f')?.split(',').sort().join(',')
  const correctScope = tickers ? sourceUrl?.searchParams.get('t') === tickers.join(',') && !sourceUrl?.searchParams.has('f') : filters === 'cap_midover,sh_avgvol_o50'
  if (!data || !correctScope || props.screenerType !== 'stocks'
    || !Number.isInteger(data.totalCount) || data.totalCount < (tickers ? 0 : 1) || data.totalCount > (tickers?.length ?? MAX_ROWS)
    || data.firstRow !== firstRow || !Number.isInteger(data.pageSize) || data.pageSize < 1 || data.pageSize > (tickers ? 20 : 1000)
    || !Array.isArray(data.rows) || data.rows.length !== Math.min(data.pageSize, data.totalCount - firstRow)) {
    throw new Error('Finviz did not return the expected free screener page. The layout or access may have changed.')
  }
  const rows = data.rows.map((raw: any, i: number): ModelRow => {
    const { text, numbers } = raw ?? {}
    if (!text || !/^[A-Z0-9.^-]{1,20}$/.test(text.ticker) || typeof text.company !== 'string' || !text.company.trim()
      || !numbers || numbers.order !== firstRow + i || (tickers && !tickers.includes(text.ticker))) throw new Error('Finviz returned an invalid company row.')
    return { ticker: text.ticker, company: text.company.trim(), currency: 'USD', retrieved_at: retrievedAt,
      price: typeof numbers.price === 'number' && Number.isFinite(numbers.price) && numbers.price > 0 ? numbers.price : null, signals: null }
  })
  return { rows, total: data.totalCount, pageSize: data.pageSize }
}

async function fetchPublicPage(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: {
    'User-Agent': 'Nostra-Universe/1.0 (personal free screener)', Accept: 'text/html',
  } })
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(response.status === 403 || response.status === 429
      ? `Finviz restricted free access (HTTP ${response.status}). Refresh paused for 30 minutes.`
      : `Finviz free page failed (HTTP ${response.status}).`)
  }
  if (!response.headers.get('content-type')?.includes('text/html')) { await response.body?.cancel(); throw new Error('Finviz returned an unexpected response type.') }
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Finviz returned an empty response.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_HTML_BYTES) throw new Error('Finviz page exceeded the expected size.')
      chunks.push(value)
    }
  } finally { await reader.cancel().catch(() => {}) }
  return Buffer.concat(chunks).toString('utf8')
}

export function createUniverseModel(file: string, deps: {
  fetchPage?: (url: string) => Promise<string>
  wait?: (ms: number) => Promise<void>
  now?: () => number
} = {}) {
  const now = deps.now ?? Date.now
  const fetchPage = deps.fetchPage ?? fetchPublicPage
  const wait = deps.wait ?? ((ms) => new Promise<void>((resolve) => { setTimeout(resolve, ms) }))
  let saved: ModelRead | null = null
  let loaded: Promise<void> | null = null
  let pending: Promise<void> | null = null
  let progress: ModelRow[] = []
  let fetched = 0
  let total: number | null = null
  let startedAt: string | null = null
  let nextAt = 0
  let error: string | null = null
  let closed = false
  const load = () => loaded ??= (async () => {
    try {
      const value: unknown = JSON.parse(await fs.readFile(file, 'utf8'))
      if (isModelRead(value) && value.complete) {
        saved = value
        nextAt = Date.parse(value.completed_at!) + MODEL_REFRESH_MS
      }
    } catch { /* First use or invalid cache: fetch anew, never manufacture rows. */ }
  })()
  const sweep = async () => {
    progress = []; fetched = 0; total = null; error = null; startedAt = new Date(now()).toISOString()
    try {
      let firstRow = 0
      const tickers = new Set<string>()
      while (!closed) {
        if (firstRow) await wait(PAGE_GAP_MS)
        if (closed) return
        const html = await fetchPage(finvizUniverseUrl(firstRow))
        const page = parseFinvizPage(html, firstRow, new Date(now()).toISOString())
        if (total !== null && page.total !== total) throw new Error('Universe membership changed during refresh. Retrying the complete screen at the next refresh.')
        total = page.total
        for (const row of page.rows) {
          if (tickers.has(row.ticker)) throw new Error('Finviz repeated a company across pages; the refresh is incomplete.')
          tickers.add(row.ticker)
        }
        progress.push(...page.rows)
        fetched = progress.length
        firstRow += page.rows.length
        if (firstRow >= total) break
      }
      if (closed) return
      // Freeze membership before checking prices. Reapplying the cap filter for 100 price pages lets
      // a stock crossing $2bn move pagination boundaries and invalidate the entire refresh.
      fetched = 0
      for (let offset = 0; offset < progress.length; offset += 20) {
        await wait(PAGE_GAP_MS)
        if (closed) return
        const tickers = progress.slice(offset, offset + 20).map((row) => row.ticker)
        const html = await fetchPage(finvizPageUrl(0, tickers))
        const quotes = parseFinvizPage(html, 0, new Date(now()).toISOString(), tickers)
        const byTicker = new Map(quotes.rows.map((row) => [row.ticker, row]))
        for (let i = offset; i < offset + tickers.length; i++) {
          const quote = byTicker.get(progress[i].ticker)
          progress[i] = { ...progress[i], price: quote?.price ?? null, retrieved_at: quote?.retrieved_at ?? progress[i].retrieved_at }
        }
        fetched += tickers.length
      }
      if (closed) return
      const complete: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: progress, total,
        complete: true, refreshing: false, fetched: progress.length, started_at: startedAt,
        completed_at: new Date(now()).toISOString(), next_refresh_at: new Date(now() + MODEL_REFRESH_MS).toISOString(), stale: false, error: null, events: null }
      // Persist only a complete validated sweep; failed refreshes cannot erase the last good grid.
      if (!isModelRead(complete)) throw new Error('Finviz refresh did not cover the complete universe.')
      const tmp = `${file}.${randomUUID()}.tmp`
      try {
        await fs.mkdir(path.dirname(file), { recursive: true })
        await fs.writeFile(tmp, JSON.stringify(complete))
        await fs.rename(tmp, file)
      } finally { await fs.rm(tmp, { force: true }).catch(() => {}) }
      saved = complete
    } catch (e) { error = e instanceof Error ? e.message : 'Finviz refresh failed.' }
    finally { nextAt = now() + MODEL_REFRESH_MS }
  }
  return {
    async read(): Promise<ModelRead> {
      await load()
      if (!closed && !pending && now() >= nextAt) pending = sweep().finally(() => { pending = null })
      const completeAt = saved?.completed_at ?? null
      return { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: saved?.rows ?? progress,
        total: saved?.total ?? total, complete: !!saved, refreshing: !!pending, fetched,
        started_at: startedAt ?? saved?.started_at ?? null, completed_at: completeAt,
        next_refresh_at: nextAt ? new Date(nextAt).toISOString() : null,
        stale: !completeAt || now() - Date.parse(completeAt) >= MODEL_REFRESH_MS || !!error, error, events: null }
    },
    async settled() { await pending },
    close() { closed = true },
  }
}

export function registerUniverseModel(app: FastifyInstance, stateDir: string, root: string, archiveDir: string) {
  const model = createUniverseModel(path.join(stateDir, 'universe-model.json'))
  const events = createUniverseEventsReader(root, archiveDir)
  app.get('/api/screener/universe-model', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (_req, reply) => {
    reply.header('Cache-Control', 'no-store')
    const read = await model.read()
    return { ...read, ...events(read.rows) }
  })
  app.addHook('onClose', async () => { model.close() })
}
