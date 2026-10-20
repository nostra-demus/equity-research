import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { isModelRead, MODEL_REFRESH_MS, MODEL_SCHEMA, UNIVERSE_URL, type ModelRead, type ModelRow } from '../../shared/universe-model'
import { createUniverseEventsReader } from './universe-events'
import { readUniverseAssessments, registerUniverseEvidence } from './universe-evidence'

// Public Tickers membership and Overview quotes, never an Elite export/API. No credentials, paid providers,
// browser challenges, proxies or per-company quote fan-out. One paced sweep shared by all readers.
const PAGE_GAP_MS = 2_000
const MAX_ROWS = 10_000
const MAX_HTML_BYTES = 2_000_000
const ERROR_BACKOFF_MS = 30 * 60_000

export function finvizPageUrl(firstRow: number, tickers?: string[]): string {
  const url = new URL(UNIVERSE_URL)
  url.searchParams.delete('preset') // Account-local preset IDs do not authenticate a public screen.
  url.searchParams.set('v', '111') // Normal free Overview includes names and prices.
  url.searchParams.set('o', 'ticker')
  url.searchParams.set('r', String(firstRow + 1)) // Finviz r is one-based; SSR firstRow is zero-based.
  if (tickers) { url.searchParams.delete('f'); url.searchParams.set('t', tickers.join(',')) }
  return url.toString()
}
export function finvizUniverseUrl(firstRow: number, sector?: string): string {
  const url = new URL(finvizPageUrl(firstRow))
  url.searchParams.set('v', '411') // The free Tickers view returns up to 1,000 names per public page.
  url.searchParams.delete('c')
  if (sector) url.searchParams.set('f', `cap_midover,sh_avgvol_o50,sec_${sector}`)
  return url.toString()
}

function screenerProps(html: string): any {
  // Parse inert JSON only. Never evaluate a provider script or trust markup as instructions.
  const scripts = [...html.matchAll(/<script\b(?=[^>]*\btype="application\/json")(?=[^>]*\bdata-ssr-props=)[^>]*>([\s\S]*?)<\/script>/gi)]
  for (const script of scripts) {
    try { const value = JSON.parse(script[1]); if (Array.isArray(value?.data?.rows)) return value } catch { /* reject below */ }
  }
  throw new Error('Finviz did not return the expected free screener page. The layout or access may have changed.')
}

export function parseFinvizSectors(html: string): string[] {
  const catalog = screenerProps(html).filters?.filters
  const options = Array.isArray(catalog) ? catalog.find((f: any) => f?.key === 'sec')?.options : null
  if (!Array.isArray(options)) throw new Error('Finviz free sector filters are unavailable.')
  if (options.some((o) => o && o.isEliteOnly !== undefined && typeof o.isEliteOnly !== 'boolean')) throw new Error('Finviz free sector filters changed.')
  const sectors = options.filter((o) => o && o.value && o.isEliteOnly !== true).map((o) => o.value)
  if (!sectors.length || sectors.length > 50 || sectors.some((s) => typeof s !== 'string' || !/^[a-z]{1,40}$/.test(s) || s === 'modal')
    || new Set(sectors).size !== sectors.length) throw new Error('Finviz free sector filters changed.')
  return sectors
}

export function parseFinvizPage(html: string, firstRow: number, retrievedAt: string, tickers?: string[], sector?: string): { rows: ModelRow[]; total: number; pageSize: number } {
  const props = screenerProps(html)
  const data = props?.data
  const sourceUrl = typeof props?.url === 'string' ? new URL(props.url, 'https://finviz.com') : null
  const filters = sourceUrl?.searchParams.get('f')?.split(',').sort().join(',')
  const expectedFilters = ['cap_midover', 'sh_avgvol_o50', ...(sector ? [`sec_${sector}`] : [])].sort().join(',')
  const correctScope = sourceUrl?.origin === 'https://finviz.com' && (tickers ? sourceUrl.searchParams.get('t') === tickers.join(',') && !sourceUrl.searchParams.has('f') : filters === expectedFilters)
  if (!data || !correctScope || props.screenerType !== 'stocks'
    || !Number.isInteger(data.totalCount) || data.totalCount < (tickers || sector ? 0 : 1) || data.totalCount > (tickers?.length ?? MAX_ROWS)
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
      const seedHtml = await fetchPage(finvizUniverseUrl(0))
      const seed = parseFinvizPage(seedHtml, 0, new Date(now()).toISOString())
      const sectors = parseFinvizSectors(seedHtml)
      total = seed.total
      const tickers = new Set<string>()
      // Use the site's ordinary free sector filters. Each partition retains the exact universe
      // filters; no broad-screen deep pagination or paid/custom columns are requested.
      const partitionTotals = new Map<string, number>()
      for (const verify of [false, true]) {
        let position = 0
        for (const sector of sectors) {
          let firstRow = 0
          while (!closed) {
            await wait(PAGE_GAP_MS)
            if (closed) return
            const page = parseFinvizPage(await fetchPage(finvizUniverseUrl(firstRow, sector)), firstRow, new Date(now()).toISOString(), undefined, sector)
            const priorTotal = partitionTotals.get(sector)
            if (priorTotal !== undefined && priorTotal !== page.total) throw new Error('Universe membership changed during refresh. Retrying the complete screen at the next refresh.')
            partitionTotals.set(sector, page.total)
            for (const row of page.rows) {
              if (verify) {
                const prior = progress[position++]
                if (!prior || row.ticker !== prior.ticker || row.company !== prior.company) throw new Error('Universe membership changed during verification. Retrying the complete screen at the next refresh.')
              } else {
                if (tickers.has(row.ticker)) throw new Error('Finviz repeated a company across partitions; the refresh is incomplete.')
                if (progress.length >= total!) throw new Error('Finviz sector partitions exceeded the expected universe.')
                tickers.add(row.ticker); progress.push(row); position++
              }
            }
            if (!verify) fetched = progress.length
            firstRow += page.rows.length
            if (firstRow >= page.total) break
          }
          if (closed) return
        }
        if (position !== total) throw new Error('Finviz sector partitions did not cover the complete universe.')
      }
      if (closed) return
      await wait(PAGE_GAP_MS)
      if (closed) return
      const final = parseFinvizPage(await fetchPage(finvizUniverseUrl(0)), 0, new Date(now()).toISOString())
      const byMember = new Map(progress.map((row) => [row.ticker, row.company]))
      if (final.total !== total || [...seed.rows, ...final.rows].some((row) => byMember.get(row.ticker) !== row.company)) throw new Error('Universe membership changed during verification. Retrying the complete screen at the next refresh.')
      progress.sort((a, b) => a.ticker.localeCompare(b.ticker))
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
          if (quote && quote.company !== progress[i].company) throw new Error('Finviz company identity changed while checking prices.')
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
    finally { nextAt = now() + (error ? ERROR_BACKOFF_MS : MODEL_REFRESH_MS) }
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
  registerUniverseEvidence(app, stateDir)
  const model = createUniverseModel(path.join(stateDir, 'universe-model.json'))
  const events = createUniverseEventsReader(root, archiveDir)
  app.get('/api/screener/universe-model', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (_req, reply) => {
    reply.header('Cache-Control', 'no-store')
    const read = await model.read()
    const observed = events(read.rows)
    return { ...read, ...observed, rows: readUniverseAssessments(stateDir, observed.rows) }
  })
  app.addHook('onClose', async () => { model.close() })
}
