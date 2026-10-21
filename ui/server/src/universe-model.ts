import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { isModelRead, MODEL_CLIENT_VERSION, MODEL_PRICE_REFRESH_MS, MODEL_REFRESH_MS, MODEL_SCHEMA, UNIVERSE_URL, type ModelPricesRead, type ModelRead, type ModelRow } from '../../shared/universe-model'
import { createUniverseEventsReader } from './universe-events'
import { readUniverseAssessments, registerUniverseEvidence } from './universe-evidence'
import { getQuotes } from './news/equity-quote'
import { providerDeployPending } from './deploy-barrier'
import { FINVIZ_VIEWS, FINVIZ_DETAIL_VIEWS, FINVIZ_PRICE_VIEWS, FINVIZ_DATA_REFRESH_MS, finvizField, isFinvizData, type FinvizViewId, type FinvizSnapshot, type FinvizDataRead } from '../../shared/finviz-data'

// Standard public screener views, never an Elite export/API. No credentials, paid providers,
// browser challenges, proxies or per-company quote fan-out. One paced collector shared by all readers.
const PAGE_GAP_MS = 2_000
const MAX_ROWS = 10_000
const MAX_HTML_BYTES = 2_000_000
const ERROR_BACKOFF_MS = 30 * 60_000

async function writeJson(file: string, value: unknown) {
  const tmp = `${file}.${randomUUID()}.tmp`
  try {
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(tmp, JSON.stringify(value))
    await fs.rename(tmp, file)
  } finally { await fs.rm(tmp, { force: true }).catch(() => {}) }
}

export function finvizPageUrl(firstRow: number, tickers?: string[], view: FinvizViewId = 'overview'): string {
  const url = new URL(UNIVERSE_URL)
  url.searchParams.delete('preset') // Account-local preset IDs do not authenticate a public screen.
  url.searchParams.set('v', FINVIZ_VIEWS.find((v) => v.id === view)!.code)
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

function normalizeNewsItem(item: any): any {
  if (!item || typeof item.url !== 'string' || !item.url.startsWith('/')) return item
  let url: URL
  try { url = new URL(item.url, 'https://finviz.com') }
  catch { throw new Error('Finviz returned invalid structured data.') }
  if (url.origin !== 'https://finviz.com') throw new Error('Finviz returned invalid structured data.')
  return { ...item, url: url.toString() }
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
  const view = FINVIZ_VIEWS.find((v) => v.code === sourceUrl?.searchParams.get('v'))
  const filters = sourceUrl?.searchParams.get('f')?.split(',').sort().join(',')
  const expectedFilters = ['cap_midover', 'sh_avgvol_o50', ...(sector ? [`sec_${sector}`] : [])].sort().join(',')
  const correctScope = sourceUrl?.origin === 'https://finviz.com' && (tickers ? sourceUrl.searchParams.get('t') === tickers.join(',') && !sourceUrl.searchParams.has('f') : filters === expectedFilters)
  if (!data || !correctScope || !view || sourceUrl.pathname !== '/screener/stocks' || sourceUrl.searchParams.has('c') || props.settings?.hasUserPremium === true || props.screenerType !== 'stocks'
    || !Number.isInteger(data.totalCount) || data.totalCount < (tickers || sector ? 0 : 1) || data.totalCount > (tickers?.length ?? MAX_ROWS)
    || data.firstRow !== firstRow || !Number.isInteger(data.pageSize) || data.pageSize < 1 || data.pageSize > view.size
    || !Array.isArray(data.rows) || data.rows.length !== Math.min(data.pageSize, data.totalCount - firstRow)) {
    throw new Error('Finviz did not return the expected free screener page. The layout or access may have changed.')
  }
  if (view.id === 'news' && (!props.blocks?.news || typeof props.blocks.news !== 'object' || Array.isArray(props.blocks.news))) throw new Error('Finviz free headlines are unavailable.')
  const rows = data.rows.map((raw: any, i: number): ModelRow => {
    const { text, numbers } = raw ?? {}
    if (!text || !/^[A-Z0-9.^-]{1,20}$/.test(text.ticker) || typeof text.company !== 'string' || !text.company.trim()
      || !numbers || numbers.order !== firstRow + i || (tickers && !tickers.includes(text.ticker))) throw new Error('Finviz returned an invalid company row.')
    const headlines = view.id === 'news' ? props.blocks.news[text.ticker] : undefined
    const news = view.id === 'news' && headlines === undefined ? [] : headlines
    if (news !== undefined && !Array.isArray(news)) throw new Error('Finviz free headlines are unavailable.')
    const snapshot: FinvizSnapshot = { source_url: sourceUrl!.toString(), retrieved_at: retrievedAt,
      text: { ...text }, numbers: Object.fromEntries(Object.entries(numbers).filter(([key]) => key !== 'order')) as Record<string, number | null>,
      ...(raw.range52w === undefined ? {} : { range52w: raw.range52w }),
      ...(news === undefined ? {} : { news: news.map(normalizeNewsItem) }) }
    const finviz = { [view.id]: snapshot }
    if (!isFinvizData(finviz, text.ticker, text.company.trim())) throw new Error('Finviz returned invalid structured data.')
    return { ticker: text.ticker, company: text.company.trim(), currency: 'USD', retrieved_at: retrievedAt, finviz,
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
  schedule?: (tick: () => Promise<void>) => () => void
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
  let quoteRefreshing = false
  let enriching = false
  let lastReadAt = 0
  let detailNextAt = 0
  let detailError: string | null = null
  let phase: 'membership' | 'prices' | null = null
  let background = false
  const stopped = () => closed || providerDeployPending(path.dirname(file))
  let stopTimer: (() => void) | null = null
  const load = () => loaded ??= (async () => {
    try {
      const value: unknown = JSON.parse(await fs.readFile(file, 'utf8'))
      if (isModelRead(value) && value.complete) {
        saved = value
        nextAt = Date.parse(value.completed_at!) + MODEL_REFRESH_MS
      }
    } catch { /* First use or invalid cache: fetch anew, never manufacture rows. */ }
    try {
      const pause = JSON.parse(await fs.readFile(`${file}.source-pause.json`, 'utf8'))
      if (typeof pause.until === 'string' && Date.parse(pause.until) > now() && typeof pause.reason === 'string') {
        nextAt = Math.max(nextAt, Date.parse(pause.until)); detailNextAt = nextAt
        error = pause.reason; detailError = pause.reason
      }
    } catch { /* No saved provider restriction. */ }
  })()
  const pauseSource = async (reason: string) => {
    nextAt = Math.max(nextAt, now() + ERROR_BACKOFF_MS)
    detailNextAt = nextAt
    await writeJson(`${file}.source-pause.json`, { until: new Date(nextAt).toISOString(), reason })
  }
  const persist = async (value: ModelRead) => {
    if (!isModelRead(value) || !value.complete) throw new Error('Finviz refresh did not cover the complete universe.')
    await writeJson(file, value)
  }
  const sweep = async () => {
    quoteRefreshing = true
    phase = 'membership'
    let dirty = false
    let persistedAt = now()
    progress = []; fetched = 0; total = null; error = null; startedAt = new Date(now()).toISOString()
    try {
      // The first request also observes the gap after a detail→price handoff or a resumed reader.
      await wait(PAGE_GAP_MS)
      if (stopped()) return
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
          while (!stopped()) {
            await wait(PAGE_GAP_MS)
            if (stopped()) return
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
          if (stopped()) return
        }
        if (position !== total) throw new Error('Finviz sector partitions did not cover the complete universe.')
      }
      if (stopped()) return
      await wait(PAGE_GAP_MS)
      if (stopped()) return
      const final = parseFinvizPage(await fetchPage(finvizUniverseUrl(0)), 0, new Date(now()).toISOString())
      const byMember = new Map(progress.map((row) => [row.ticker, row.company]))
      if (final.total !== total || [...seed.rows, ...final.rows].some((row) => byMember.get(row.ticker) !== row.company)) throw new Error('Universe membership changed during verification. Retrying the complete screen at the next refresh.')
      const previousRows = new Map(saved?.rows.map((row) => [row.ticker, row]))
      // A restart continues with the least recently priced companies, rather than repeatedly
      // refreshing A–M and starving the rest. Exact issuer identity is required for cache reuse.
      const previous = (row: ModelRow) => {
        const prior = previousRows.get(row.ticker)
        return prior?.company === row.company ? prior : undefined
      }
      const priorTimes = new Map(progress.map((row) => [row.ticker, Date.parse(previous(row)?.retrieved_at ?? '') || 0]))
      progress.sort((a, b) => priorTimes.get(a.ticker)! - priorTimes.get(b.ticker)! || a.ticker.localeCompare(b.ticker))
      progress = progress.map((member) => {
        const prior = previous(member)
        return { ...member, price: prior ? prior.price : member.price, retrieved_at: prior?.retrieved_at ?? member.retrieved_at,
          finviz: { ...prior?.finviz, ...member.finviz } }
      })
      const due = progress.filter((row) => !previous(row) || now() - Date.parse(row.retrieved_at) >= MODEL_REFRESH_MS)
      // Freeze membership before checking prices. Reapplying the cap filter for 100 price pages lets
      // a stock crossing $2bn move pagination boundaries and invalidate the entire refresh.
      phase = 'prices'
      fetched = progress.length - due.length
      for (let offset = 0; offset < due.length; offset += 20) {
        await wait(PAGE_GAP_MS)
        if (stopped()) return
        const batch = due.slice(offset, offset + 20)
        const tickers = batch.map((row) => row.ticker)
        // Every standard table includes a price. Rotate the oldest/missing table into the existing
        // quote request instead of making five requests for the same company batch.
        const view = FINVIZ_PRICE_VIEWS.map((view) => ({ view,
          oldest: Math.min(...batch.map((member) => {
            const previous = previousRows.get(member.ticker)
            return previous?.company === member.company ? Date.parse(previous.finviz?.[view.id]?.retrieved_at ?? '') || 0 : 0
          })),
        })).sort((a, b) => a.oldest - b.oldest)[0].view
        const html = await fetchPage(finvizPageUrl(0, tickers, view.id))
        if (stopped()) return
        const quotes = parseFinvizPage(html, 0, new Date(now()).toISOString(), tickers)
        if (quotes.rows.some((row) => !row.finviz?.[view.id])) throw new Error('Finviz returned a different price view.')
        const byTicker = new Map(quotes.rows.map((row) => [row.ticker, row]))
        if (byTicker.size !== batch.length || batch.some((row) => byTicker.get(row.ticker)?.company !== row.company)) throw new Error('Finviz price batch did not match every requested company.')
        const update = (row: ModelRow) => {
          const quote = byTicker.get(row.ticker)
          return quote?.company === row.company ? { ...row, price: quote.price, retrieved_at: quote.retrieved_at,
            finviz: { ...row.finviz, ...quote.finviz } } : row
        }
        progress = progress.map(update)
        // Publish each validated batch against the retained, complete membership. The full-pass
        // timestamp stays unchanged until every company is checked; row times describe mixed ages.
        if (saved) {
          saved = { ...saved, rows: saved.rows.map(update) }; dirty = true
          if (now() - persistedAt >= 60_000) { await persist(saved); dirty = false; persistedAt = now() }
        }
        fetched += tickers.length
      }
      if (stopped()) return
      const complete: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: progress, total,
        complete: true, refreshing: false, fetched: progress.length, started_at: startedAt,
        completed_at: new Date(now()).toISOString(), next_refresh_at: new Date(now() + MODEL_REFRESH_MS).toISOString(), stale: false, error: null, events: null }
      // Persist only a complete validated sweep; failed refreshes cannot erase the last good grid.
      await persist(complete)
      saved = complete
      dirty = false
    } catch (e) {
      error = e instanceof Error ? e.message : 'Finviz refresh failed.'
      if (/403|429|restricted/i.test(error)) {
        try { await pauseSource(error) } catch { error += ' Provider cooldown could not be saved.' }
      }
    } finally {
      try { if (dirty && saved) await persist(saved) }
      catch { error = 'Finviz prices could not be saved. Last disk snapshot retained.' }
      quoteRefreshing = false; phase = null
      if (error || !stopped()) nextAt = Math.max(nextAt, now() + (error ? ERROR_BACKOFF_MS : MODEL_REFRESH_MS))
    }
  }
  const nextDetail = () => {
    // Missing views first, then oldest retrieval. A restart resumes from persisted per-company data;
    // a new member or renamed issuer never inherits another company's metrics or news.
    let selected: { view: typeof FINVIZ_DETAIL_VIEWS[number]; time: number } | null = null
    // The 10-company News and TA views cannot share a 20-company price request. Collect their
    // missing batches first; the regular quote lane will fill most standard tables along the way.
    const views = [...FINVIZ_DETAIL_VIEWS].sort((a, b) => Number(b.id === 'news') - Number(a.id === 'news') || a.size - b.size)
    for (const row of saved?.rows ?? []) for (const view of views) {
      const stamp = row.finviz?.[view.id]?.retrieved_at
      const time = stamp ? Date.parse(stamp) : 0
      if (time && now() - time < FINVIZ_DATA_REFRESH_MS) continue
      if (!selected || time < selected.time || time === selected.time && view.size < selected.view.size) selected = { view, time }
    }
    if (!selected) return null
    const { view } = selected
    const rows = saved!.rows.map((row) => ({ row, time: Date.parse(row.finviz?.[view.id]?.retrieved_at ?? '') || 0 }))
      .filter((entry) => selected!.time === 0 ? entry.time === 0 : entry.time && now() - entry.time >= FINVIZ_DATA_REFRESH_MS)
      .sort((a, b) => a.time - b.time || a.row.ticker.localeCompare(b.row.ticker))
      .slice(0, view.size).map((entry) => entry.row)
    return { view, rows }
  }
  const work = async () => {
    if (stopped()) return
    if (now() >= nextAt) await sweep()
    if (stopped() || error || !saved || now() < detailNextAt) return
    enriching = true
    let dirty = false
    let persistedAt = now()
    try {
      // Background ticks and readers share one writer. Prices take the next slot when due;
      // neither path creates a premium fallback or an analysis run.
      while (!stopped() && now() < nextAt && (background || now() - lastReadAt < 45_000)) {
        const task = nextDetail()
        if (!task) break
        await wait(PAGE_GAP_MS)
        if (stopped() || now() >= nextAt || !background && now() - lastReadAt >= 45_000) break
        const tickers = task.rows.map((row) => row.ticker)
        const page = parseFinvizPage(await fetchPage(finvizPageUrl(0, tickers, task.view.id)), 0, new Date(now()).toISOString(), tickers)
        if (stopped()) break
        const quotes = new Map(page.rows.map((row) => [row.ticker, row]))
        if (quotes.size !== tickers.length || task.rows.some((row) => quotes.get(row.ticker)?.company !== row.company || !quotes.get(row.ticker)?.finviz?.[task.view.id])) {
          throw new Error('Finviz data batch did not match every requested company. Last successful data retained.')
        }
        saved = { ...saved, rows: saved.rows.map((row) => quotes.has(row.ticker)
          ? { ...row, finviz: { ...row.finviz, [task.view.id]: quotes.get(row.ticker)!.finviz![task.view.id] } } : row) }
        detailError = null; dirty = true
        if (now() - persistedAt >= 60_000) { await persist(saved); dirty = false; persistedAt = now() }
      }
    } catch (e) {
      detailError = e instanceof Error ? e.message : 'Finviz additional data unavailable.'
      detailNextAt = now() + ERROR_BACKOFF_MS
      // A provider restriction stops both lanes. Do not continue requesting other views around it.
      if (/403|429|restricted/i.test(detailError)) {
        try { await pauseSource(detailError) } catch { detailError += ' Provider cooldown could not be saved.' }
      }
    } finally {
      try { if (dirty && saved) await persist(saved) }
      catch { detailError = 'Finviz data could not be saved. Last disk snapshot retained.'; detailNextAt = now() + ERROR_BACKOFF_MS }
      enriching = false
    }
  }
  const read = async (): Promise<ModelRead> => {
      await load()
      lastReadAt = now()
      if (!stopped() && !pending && (now() >= nextAt || saved && now() >= detailNextAt && nextDetail())) pending = work().finally(() => { pending = null })
      const completeAt = saved?.completed_at ?? null
      return { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: saved?.rows ?? progress,
        total: saved?.total ?? total, refresh_total: total, refresh_phase: phase, complete: !!saved, refreshing: quoteRefreshing, fetched,
        started_at: startedAt ?? saved?.started_at ?? null, completed_at: completeAt,
        next_refresh_at: nextAt ? new Date(nextAt).toISOString() : null,
        stale: !completeAt || now() - Date.parse(completeAt) >= MODEL_REFRESH_MS || !!error, error, events: null,
        data: { captured: (saved?.rows ?? []).reduce((sum, row) => sum + Object.keys(row.finviz ?? {}).length, 0),
          expected: (saved?.rows.length ?? 0) * FINVIZ_VIEWS.length, refreshing: enriching, error: detailError } }
    }
  return {
    read,
    async start() {
      if (closed || background) return
      background = true
      const tick = async () => { try { await read() } catch { error = 'Finviz background refresh unavailable.' } }
      const schedule = deps.schedule ?? ((run: () => Promise<void>) => {
        const timer = setInterval(run, 15_000); timer.unref()
        return () => clearInterval(timer)
      })
      stopTimer = schedule(tick)
      await tick()
    },
    async settled() { await pending },
    async close() { closed = true; background = false; stopTimer?.(); stopTimer = null; await pending },
  }
}

export function registerUniverseModel(app: FastifyInstance, stateDir: string, root: string, archiveDir: string, deps: {
  quotes?: typeof getQuotes
  collector?: Parameters<typeof createUniverseModel>[1]
} = {}) {
  registerUniverseEvidence(app, stateDir)
  const model = createUniverseModel(path.join(stateDir, 'universe-model.json'), deps.collector)
  const events = createUniverseEventsReader(root, archiveDir)
  app.addHook('onReady', async () => { await model.start() })
  app.get('/api/screener/universe-model', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
    reply.header('Cache-Control', 'no-store')
    // An open pre-impact-assessment tab used event presence as green. Clear its grid and require
    // a reload instead of feeding current company evidence to obsolete scoring/price logic.
    if (req.headers['x-nostra-model'] !== MODEL_CLIENT_VERSION) return {
      schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: [], total: null, complete: false,
      refreshing: false, fetched: 0, started_at: null, completed_at: null, next_refresh_at: null,
      stale: true, events: null, error: 'Model updated. Reload this page for current prices and favorable-impact signals.',
    } satisfies ModelRead
    const read = await model.read()
    // Keep the frequent grid response small. All raw fields and news are served on demand below.
    const observed = events(read.rows.map(({ finviz: _data, ...row }) => row))
    return { ...read, ...observed, rows: readUniverseAssessments(stateDir, observed.rows) }
  })
  app.get<{ Querystring: { tickers?: string } }>('/api/screener/universe-model/quotes', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
    reply.header('Cache-Control', 'no-store')
    const tickers = typeof req.query.tickers === 'string' ? req.query.tickers.split(',') : []
    const tickerSet = new Set(tickers)
    if (!tickers.length || tickers.length > 100 || tickerSet.size !== tickers.length || tickers.some((ticker) => !/^[A-Z0-9.^-]{1,20}$/.test(ticker))) {
      return reply.code(400).send({ error: 'Choose up to 100 companies from the current universe.' })
    }
    const read = await model.read()
    const selected = read.rows.filter((row) => tickerSet.has(row.ticker))
    const quotes = await (deps.quotes ?? getQuotes)(selected.map((row) => ({ ticker: row.ticker, currency: row.currency,
      companyName: row.company, entryPrice: row.price })), { stateDir, repoRoot: root, ttlMs: MODEL_PRICE_REFRESH_MS })
    const rows: ModelPricesRead['rows'] = selected.map((row) => {
      const q = quotes.get(row.ticker)?.quote
      return { ticker: row.ticker, company: row.company, quote: q && q.currency === 'USD' && q.retrieved_at ? {
        price: q.price, currency: 'USD', symbol: q.symbol, source: q.source, as_of: q.as_of,
        as_of_is_close: q.as_of_is_close, real_time: q.real_time ?? null, delayed: q.delayed,
        stale: q.stale, retrieved_at: q.retrieved_at,
      } : null }
    })
    return { checked_at: new Date().toISOString(), rows } satisfies ModelPricesRead
  })
  app.get<{ Querystring: { ticker?: string; company?: string } }>('/api/screener/universe-model/data', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply): Promise<FinvizDataRead> => {
    reply.header('Cache-Control', 'no-store')
    const { ticker, company } = req.query
    const read = await model.read()
    const rows = read.rows.filter((row) => (!ticker || row.ticker === ticker) && (!company || row.company === company))
      .map((row) => ({ ticker: row.ticker, company: row.company, views: row.finviz ?? {} }))
    const keys = new Set(rows.flatMap((row) => Object.values(row.views).flatMap((view) => view
      ? [...Object.keys(view.text), ...Object.keys(view.numbers), ...(view.range52w ? ['range52w.low', 'range52w.high'] : [])] : [])))
    return { source_url: UNIVERSE_URL, refreshing: read.refreshing || !!read.data?.refreshing, error: read.error || read.data?.error || null,
      fields: Object.fromEntries([...keys].map((key) => [key, finvizField(key)])), rows }
  })
  app.addHook('onClose', async () => { await model.close() })
}
