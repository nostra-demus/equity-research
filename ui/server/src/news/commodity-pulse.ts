// The commodity PULSE — a per-subject structured snapshot behind /api/swarm/pulse, for any swarm whose
// manifest declares `wire.pulse` (today: the commodity swarm's 12 subjects). Why it exists: the wire
// shows a commodity's NEWS, but a reader also wants the three numbers that frame every headline — where
// the price is (latest future + % change), which way the speculators lean (weekly CFTC COT managed-money
// net length), and what scheduled report hits next — plus the engine's own last verdict for the subject.
// All of it is plain keyless HTTP + date math: stooq's CSV quote endpoint for prices, the CFTC Socrata
// API for COT, the recurring-reports line of COMMODITY_PROFILES.md for the calendar, and the run folder's
// decision_record.json for the verdict. ZERO LLM spend, and honest absence throughout: a field that can't
// be fetched or derived is OMITTED, never faked (§3 — no source, no claim).
//
// Caching: prices and COT refresh independently on their own TTLs (NEWS.pulsePriceTtlMin /
// pulseCotTtlHours), with a single-flight guard so concurrent requests share one fetch, and the last
// good snapshot persisted under STATE_DIR so a restart doesn't open with an empty pulse. On a fetch
// failure the previous data for that half is kept and the snapshot says `stale: true`. Reports and
// verdicts are recomputed every call (pure local reads, cheap). Never throws.
//
// Security posture: the HOSTS are hardcoded here (stooq.com, publicreporting.cftc.gov). The config file
// (frameworks/commodity/pulse_sources.json, path declared by the swarm manifest's `wire.pulse`) supplies
// only SYMBOLS / market substrings / units — any config value containing '://' is ignored, so a poisoned
// config can never redirect the fetch. Verified live by scripts/verify-pulse.ts.

import fs from 'node:fs'
import path from 'node:path'
import { NEWS, STATE_DIR, REPO_ROOT } from '../config'
import { swarmById, runRootForSubject } from '../swarms'
import type { SwarmManifest } from '../types'

// ---- public snapshot shapes (the /api/swarm/pulse contract) ----

export interface PulsePrice { symbol: string; last: number; prev_close: number | null; change_pct: number | null; unit: string; as_of: string; source: 'stooq' }
export interface PulseCot { market: string; managed_money_net: number; prev_net: number | null; change: number | null; report_date: string; source: 'cftc' }
export interface PulseReport { name: string; cadence: string; next: string | null }
export interface PulseSubject { subject: string; price?: PulsePrice; cot?: PulseCot; reports?: PulseReport[]; verdict?: { action: string; at: string } }
export interface PulseSnapshot { swarm: string; as_of: string; stale: boolean; subjects: Record<string, PulseSubject> }

// Injectable seams for tests: a stub fetch, a frozen clock, isolated state/repo roots, and a manifest
// used INSTEAD of swarmById (so tests never depend on the live SWARM.md declaring `wire:` yet).
export interface PulseDeps {
  fetchFn?: typeof fetch
  now?: () => Date
  stateDir?: string
  repoRoot?: string
  manifest?: { id: string; wire?: { pulse?: string }; runRootTemplate?: string; placeholder?: string }
}

// ---- config (frameworks/commodity/pulse_sources.json) ----

export interface PulseSubjectSource { stooq?: string; unit?: string; cotMarketContains?: string }
export interface PulseSourcesConfig {
  subjects: Record<string, PulseSubjectSource>
  cotResource: string // path-only, e.g. '/resource/72hh-3qpy.json' — the host is never configurable
}

const DEFAULT_COT_RESOURCE = '/resource/72hh-3qpy.json'

/**
 * Load + sanitize the pulse source config. Symbols/substrings/units only: any value containing '://'
 * is dropped (hosts live in code, not config), stooq symbols must look like symbols, and the COT
 * dataset is reduced to its `/resource/<id>.json` path against the hardcoded Socrata host.
 * Extra fields (notes, confidence flags) are tolerated and ignored. Null on any read/parse problem.
 */
export function loadPulseConfig(file: string): PulseSourcesConfig | null {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!j || typeof j !== 'object' || !j.subjects || typeof j.subjects !== 'object') return null
    const safe = (v: unknown) => (typeof v === 'string' && v.trim() && !v.includes('://') ? v.trim() : undefined)
    const subjects: Record<string, PulseSubjectSource> = {}
    for (const [k, v] of Object.entries<any>(j.subjects)) {
      const key = k.trim()
      if (!key || !v || typeof v !== 'object') continue
      const rawSym = safe(v.stooq)
      subjects[key] = {
        stooq: rawSym && /^[a-z0-9._^-]+$/i.test(rawSym) ? rawSym.toLowerCase() : undefined,
        unit: safe(v.unit),
        cotMarketContains: safe(v.cot_market_contains),
      }
    }
    if (!Object.keys(subjects).length) return null
    let cotResource = DEFAULT_COT_RESOURCE
    const ds = safe(j.cot_dataset)
    if (ds) {
      const m = /(?:^|\/)resource\/([\w-]+)\.json$/i.exec(ds)
      if (m) cotResource = `/resource/${m[1]}.json`
    }
    return { subjects, cotResource }
  } catch {
    return null
  }
}

// ---- pure parsers + URL builders (exported for tests and scripts/verify-pulse.ts) ----

export interface StooqQuote { symbol: string; last: number; prevClose: number | null; date: string | null; time: string | null }

/** One batched stooq quote call for every configured symbol (f=sd2t2ohlcvp&h&e=csv). */
export function buildStooqUrl(symbols: string[]): string {
  return `https://stooq.com/q/l/?s=${symbols.join('+')}&f=sd2t2ohlcvp&h&e=csv`
}

/** CFTC Socrata pull: last-N-days disaggregated futures rows, four columns, one call for all subjects. */
export function buildCotUrl(sinceIsoDate: string, resourcePath: string = DEFAULT_COT_RESOURCE): string {
  const qs = new URLSearchParams({
    $where: `report_date_as_yyyy_mm_dd > '${sinceIsoDate}'`,
    $select: 'market_and_exchange_names,report_date_as_yyyy_mm_dd,m_money_positions_long_all,m_money_positions_short_all',
    $limit: '5000',
  })
  return `https://publicreporting.cftc.gov${resourcePath}?${qs.toString()}`
}

/**
 * Parse a stooq CSV quote response BY HEADER NAME, case-insensitively — column order and extra/missing
 * columns are tolerated (stooq has shifted its layout before; positional parsing would silently mislabel
 * numbers, which is worse than returning nothing). Rows whose Close is 'N/D' or non-numeric are dropped
 * (honest absence). Previous close comes from a 'p'/'Prev…' column when present, else null.
 */
export function parseStooqCsv(text: string): StooqQuote[] {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const col = (re: RegExp) => headers.findIndex((h) => re.test(h))
  const iSym = col(/^symbol$/)
  const iClose = col(/^(close|last)$/)
  const iPrev = col(/^(p|prev(ious)?(\s+close)?)$/)
  const iDate = col(/^date$/)
  const iTime = col(/^time$/)
  if (iSym < 0 || iClose < 0) return [] // not the CSV we expect — refuse to guess columns
  const num = (s: string | undefined): number | null => {
    const t = (s ?? '').trim()
    if (!t || /^n\/d$/i.test(t)) return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  const out: StooqQuote[] = []
  for (const line of lines.slice(1)) {
    const cells = line.split(',').map((c) => c.trim())
    const symbol = (cells[iSym] || '').toLowerCase()
    const last = num(cells[iClose])
    if (!symbol || last === null) continue // N/D or malformed row → omit that symbol, never fake a price
    const date = iDate >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(cells[iDate] || '') ? cells[iDate] : null
    const time = iTime >= 0 && /^\d{2}:\d{2}(:\d{2})?$/.test(cells[iTime] || '') ? cells[iTime] : null
    out.push({ symbol, last, prevClose: iPrev >= 0 ? num(cells[iPrev]) : null, date, time })
  }
  return out
}

/**
 * Reduce the raw Socrata rows to ONE subject's COT read via a case-insensitive substring match on
 * market_and_exchange_names. When the substring matches several markets (e.g. 'NATURAL GAS' also hits
 * e-minis), the pick is deterministic: prefer names that START with the substring, then the market with
 * the latest report date, then the one with the most rows in the window (a real weekly market), then
 * alphabetical. Net = managed-money long − short; prev/change come from the SAME market's prior report.
 */
export function parseCotRows(json: unknown, marketContains: string): PulseCot | null {
  if (!Array.isArray(json)) return null
  const needle = String(marketContains || '').trim().toLowerCase()
  if (!needle) return null
  const byMarket = new Map<string, { date: string; net: number }[]>()
  for (const r of json as any[]) {
    const market = String(r?.market_and_exchange_names ?? '').trim()
    if (!market || !market.toLowerCase().includes(needle)) continue
    const date = String(r?.report_date_as_yyyy_mm_dd ?? '').slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
    const long = Number(r?.m_money_positions_long_all)
    const short = Number(r?.m_money_positions_short_all)
    if (!Number.isFinite(long) || !Number.isFinite(short)) continue
    const rows = byMarket.get(market) || []
    rows.push({ date, net: long - short })
    byMarket.set(market, rows)
  }
  if (!byMarket.size) return null
  const latestOf = (name: string) => byMarket.get(name)!.reduce((m, r) => (r.date > m ? r.date : m), '')
  const names = [...byMarket.keys()]
  const starting = names.filter((n) => n.toLowerCase().startsWith(needle))
  const pool = (starting.length ? starting : names).sort((a, b) => {
    const la = latestOf(a), lb = latestOf(b)
    if (la !== lb) return la < lb ? 1 : -1
    const ca = byMarket.get(a)!.length, cb = byMarket.get(b)!.length
    if (ca !== cb) return cb - ca
    return a.localeCompare(b)
  })
  const market = pool[0]
  const rows = byMarket.get(market)!.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  const latest = rows[0]
  const prev = rows.find((r) => r.date < latest.date) || null
  return {
    market,
    managed_money_net: latest.net,
    prev_net: prev ? prev.net : null,
    change: prev ? latest.net - prev.net : null,
    report_date: latest.date,
    source: 'cftc',
  }
}

// Weekday detection for the recurring-reports parser. Full names match as a prefix (so 'Fridays'
// counts); abbreviations need both word boundaries (so 'monthly'/'monsoon' never read as Monday).
const WEEKDAY_PATTERNS: { dow: number; re: RegExp }[] = [
  { dow: 1, re: /\bmonday|\bmon\b/i },
  { dow: 2, re: /\btuesday|\btues?\b/i },
  { dow: 3, re: /\bwednesday|\bwed\b/i },
  { dow: 4, re: /\bthursday|\bthur?s?\b/i },
  { dow: 5, re: /\bfriday|\bfri\b/i },
  { dow: 6, re: /\bsaturday|\bsat\b/i },
  { dow: 0, re: /\bsunday|\bsun\b/i },
]

function nextWeekdayIso(now: Date, dow: number): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  let delta = (dow - d.getUTCDay() + 7) % 7
  if (delta === 0) delta = 7 // "next", strictly after now — never today
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/**
 * Parse a profile section's `**Recurring reports (catalysts):**` line into scheduled reports. The ONLY
 * dates ever produced are weekday-derivable ones (an entry naming a weekday, or 'COT' → the CFTC's
 * Friday release): next = the next such weekday strictly AFTER `now`. A cadence word without a
 * derivable day (monthly WASDE, quarterly grindings…) yields that cadence with next=null; anything
 * else is cadence 'scheduled' with next=null. Never invents a date (§17 bans undated "soon").
 * Accepts either a full `## <SUBJECT>` section or the bare entries text (tests pass entries directly).
 */
export function nextReports(sectionText: string, now: Date): PulseReport[] {
  const text = String(sectionText || '')
  let entriesText = text
  const marker = /\*\*Recurring reports[^*]*:\*\*/i.exec(text)
  if (marker) {
    // the entries start on the marker's own line and may wrap; stop at a blank line or the next block
    const buf: string[] = []
    for (const raw of text.slice(marker.index + marker[0].length).split('\n')) {
      const t = raw.trim()
      if (!t) { if (buf.length) break; else continue }
      if (/^(##|---|\*\*)/.test(t)) break
      buf.push(t)
    }
    entriesText = buf.join(' ')
  }
  const out: PulseReport[] = []
  for (const rawEntry of entriesText.split(';')) {
    const name = rawEntry.replace(/\s+/g, ' ').replace(/\.\s*$/, '').trim()
    if (!name) continue
    const wd = WEEKDAY_PATTERNS.find((w) => w.re.test(name))
    // 'COT' implies the CFTC's Friday release. Case-SENSITIVE \bCOT\b so 'cotton' can never match
    // (and 'COTTON' can't either — no word boundary after the third letter).
    const isCot = /\bCOT\b/.test(name) || /commitments?\s+of\s+traders/i.test(name)
    if (wd || isCot) {
      out.push({ name, cadence: 'weekly', next: nextWeekdayIso(now, wd ? wd.dow : 5) })
      continue
    }
    if (/\bbi-?weekly\b|\bfortnightly\b/i.test(name)) { out.push({ name, cadence: 'fortnightly', next: null }); continue }
    const cadence = /\b(monthly|quarterly|annual|weekly)\b/i.exec(name)
    out.push({ name, cadence: cadence ? cadence[1].toLowerCase() : 'scheduled', next: null })
  }
  return out
}

// ---- verdict (last engine run for the subject) ----

// Reads <repoRoot>/<runRoot>/decision_record.json per frameworks/commodity/decision_record.schema.json:
// the verdict is its `action` enum and `decision_date`. Any problem (no run yet, bad JSON) → undefined.
function readVerdict(repoRoot: string, runRoot: string): { action: string; at: string } | undefined {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(repoRoot, runRoot, 'decision_record.json'), 'utf8'))
    const action = typeof j?.action === 'string' && j.action.trim() ? j.action.trim() : null
    const at = typeof j?.decision_date === 'string' && j.decision_date.trim() ? j.decision_date.trim() : null
    return action && at ? { action, at } : undefined
  } catch {
    return undefined
  }
}

// ---- profiles (`## <SUBJECT>` sections → recurring reports) ----

function splitProfileSections(md: string): Map<string, string> {
  const out = new Map<string, string>()
  const re = /^##\s+(.+?)\s*$/gm
  let m: RegExpExecArray | null
  const marks: { name: string; start: number }[] = []
  while ((m = re.exec(md))) marks.push({ name: m[1], start: m.index + m[0].length })
  for (let i = 0; i < marks.length; i++) out.set(marks[i].name, md.slice(marks[i].start, i + 1 < marks.length ? marks[i + 1].start : md.length))
  return out
}

// ---- fetch hygiene (mirrors sources/gov-data.ts: abort timeout, one retry, never throws) ----

const PULSE_UA = 'nostra-demus-screener/1.0 (ceekay@muns.io)'

async function fetchText(fetchFn: typeof fetch, url: string, timeoutMs: number): Promise<string | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchFn(url, { headers: { 'user-agent': PULSE_UA, accept: '*/*' }, signal: ctrl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch {
      if (attempt === 2) return null
      await new Promise((r) => setTimeout(r, 500))
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

// ---- cache: in-memory per swarm (single-flight) + persisted under STATE_DIR ----

interface HalfState<T> { at: number; data: Record<string, T> }
interface CacheEntry {
  price: HalfState<PulsePrice>
  cot: HalfState<PulseCot>
  inflight: Promise<void> | null
}

// Keyed by swarm id + state dir: one entry per swarm in production (one STATE_DIR), while tests with
// isolated tmp state dirs can never bleed cached data into each other through the module singleton.
const memCache = new Map<string, CacheEntry>()

const persistFile = (stateDir: string) => path.join(stateDir, 'commodity-pulse.json')

function loadPersisted(stateDir: string, swarmId: string): CacheEntry {
  const empty: CacheEntry = { price: { at: 0, data: {} }, cot: { at: 0, data: {} }, inflight: null }
  try {
    const j = JSON.parse(fs.readFileSync(persistFile(stateDir), 'utf8'))
    const e = j?.[swarmId]
    if (!e || typeof e !== 'object') return empty
    return {
      price: { at: Number(e.priceAt) || 0, data: e.prices && typeof e.prices === 'object' ? e.prices : {} },
      cot: { at: Number(e.cotAt) || 0, data: e.cots && typeof e.cots === 'object' ? e.cots : {} },
      inflight: null,
    }
  } catch {
    return empty
  }
}

function persist(stateDir: string, swarmId: string, entry: CacheEntry): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    let j: Record<string, unknown> = {}
    try { j = JSON.parse(fs.readFileSync(persistFile(stateDir), 'utf8')) || {} } catch { /* first write */ }
    j[swarmId] = { priceAt: entry.price.at, prices: entry.price.data, cotAt: entry.cot.at, cots: entry.cot.data }
    fs.writeFileSync(persistFile(stateDir), JSON.stringify(j, null, 2) + '\n')
  } catch { /* persistence is best-effort — the in-memory snapshot still serves */ }
}

// ---- the two refreshes (each replaces its WHOLE half only on a successful fetch) ----

const round2 = (n: number) => Math.round(n * 100) / 100

async function refreshPrices(entry: CacheEntry, cfg: PulseSourcesConfig, fetchFn: typeof fetch, now: () => Date, timeoutMs: number): Promise<void> {
  const symbols = [...new Set(Object.values(cfg.subjects).map((s) => s.stooq).filter((s): s is string => Boolean(s)))].sort()
  const nowMs = now().getTime()
  if (!symbols.length) { entry.price = { at: nowMs, data: {} }; return } // nothing configured — absence, not failure
  const text = await fetchText(fetchFn, buildStooqUrl(symbols), timeoutMs)
  if (text === null) return // fetch failed — keep the previous half (caller reports stale)
  const quotes = parseStooqCsv(text)
  if (!quotes.length) return // 200 but unparseable/empty — treat as failure, keep the previous half
  const bySym = new Map(quotes.map((q) => [q.symbol, q]))
  const data: Record<string, PulsePrice> = {}
  for (const [subject, src] of Object.entries(cfg.subjects)) {
    const q = src.stooq ? bySym.get(src.stooq) : undefined
    if (!q) continue // N/D or missing from the response → omit this subject's price
    const prev = q.prevClose !== null && q.prevClose !== 0 ? q.prevClose : null
    data[subject] = {
      symbol: q.symbol,
      last: q.last,
      prev_close: q.prevClose,
      change_pct: prev !== null ? round2(((q.last - prev) / prev) * 100) : null,
      unit: src.unit || '',
      as_of: q.date ? (q.time ? `${q.date}T${q.time}` : q.date) : now().toISOString(),
      source: 'stooq',
    }
  }
  entry.price = { at: nowMs, data }
}

async function refreshCot(entry: CacheEntry, cfg: PulseSourcesConfig, fetchFn: typeof fetch, now: () => Date, timeoutMs: number): Promise<void> {
  const wanted = Object.entries(cfg.subjects).filter(([, s]) => s.cotMarketContains)
  const nowMs = now().getTime()
  if (!wanted.length) { entry.cot = { at: nowMs, data: {} }; return }
  const since = new Date(nowMs - 21 * 86_400_000).toISOString().slice(0, 10)
  const text = await fetchText(fetchFn, buildCotUrl(since, cfg.cotResource), timeoutMs)
  if (text === null) return
  let rows: unknown
  try { rows = JSON.parse(text) } catch { return } // not JSON — keep the previous half
  if (!Array.isArray(rows)) return
  const data: Record<string, PulseCot> = {}
  for (const [subject, src] of wanted) {
    const cot = parseCotRows(rows, src.cotMarketContains!)
    if (cot) data[subject] = cot // an unmatched market is honest absence, not a failure
  }
  entry.cot = { at: nowMs, data }
}

// ---- the public entry point ----

/**
 * Build the pulse snapshot for a swarm. Returns null when the swarm doesn't exist, declares no
 * `wire.pulse`, its config is unreadable, or NEWS.pulseEnabled is off — the route treats null as
 * "this swarm has no pulse". Never throws.
 */
export async function getPulse(swarmId: string, deps: PulseDeps = {}): Promise<PulseSnapshot | null> {
  try {
    if (!NEWS.pulseEnabled) return null
    const manifest = deps.manifest ?? swarmById(swarmId)
    if (!manifest) return null
    const pulseRel = manifest.wire?.pulse
    // repo-relative paths only — an absolute or parent-escaping path in a manifest is refused
    if (!pulseRel || path.isAbsolute(pulseRel) || pulseRel.split(/[\\/]/).includes('..')) return null

    const repoRoot = deps.repoRoot ?? REPO_ROOT
    const stateDir = deps.stateDir ?? STATE_DIR
    const now = deps.now ?? (() => new Date())
    const fetchFn = deps.fetchFn ?? fetch
    const cfg = loadPulseConfig(path.join(repoRoot, pulseRel))
    if (!cfg) return null

    const key = `${manifest.id}::${stateDir}`
    let entry = memCache.get(key)
    if (!entry) { entry = loadPersisted(stateDir, manifest.id); memCache.set(key, entry) }

    const nowMs = now().getTime()
    const priceTtlMs = NEWS.pulsePriceTtlMin * 60_000
    const cotTtlMs = NEWS.pulseCotTtlHours * 3_600_000
    const priceStale = nowMs - entry.price.at > priceTtlMs
    const cotStale = nowMs - entry.cot.at > cotTtlMs
    if (priceStale || cotStale) {
      // single-flight: concurrent calls share ONE refresh; each stale half refetches independently
      if (!entry.inflight) {
        const e = entry
        const tasks: Promise<void>[] = []
        if (priceStale) tasks.push(refreshPrices(e, cfg, fetchFn, now, NEWS.pulseTimeoutMs))
        if (cotStale) tasks.push(refreshCot(e, cfg, fetchFn, now, NEWS.pulseTimeoutMs))
        e.inflight = Promise.all(tasks)
          .then(() => persist(stateDir, manifest.id, e))
          .catch(() => { /* refreshes never throw, but never let a rejection escape the guard */ })
          .finally(() => { e.inflight = null })
      }
      await entry.inflight
    }

    // reports + verdicts are pure local reads — recomputed every call, never cached
    const subjectsSource = (manifest as { subjectsSource?: string }).subjectsSource
    let sections: Map<string, string> | null = null
    if (subjectsSource && !path.isAbsolute(subjectsSource) && !subjectsSource.split(/[\\/]/).includes('..')) {
      try { sections = splitProfileSections(fs.readFileSync(path.join(repoRoot, subjectsSource), 'utf8')) } catch { sections = null }
    }

    const subjects: Record<string, PulseSubject> = {}
    for (const subject of Object.keys(cfg.subjects)) {
      const s: PulseSubject = { subject }
      const price = entry.price.data[subject]
      if (price) s.price = price
      const cot = entry.cot.data[subject]
      if (cot) s.cot = cot
      const section = sections?.get(subject)
      if (section) {
        const reports = nextReports(section, now())
        if (reports.length) s.reports = reports
      }
      const runRoot = manifest.runRootTemplate && manifest.placeholder
        ? runRootForSubject(manifest as unknown as SwarmManifest, subject)
        : null
      if (runRoot) {
        const verdict = readVerdict(repoRoot, runRoot)
        if (verdict) s.verdict = verdict
      }
      subjects[subject] = s
    }

    // stale = some half is still older than its TTL after the refresh attempt (i.e. the fetch failed
    // and we are serving the previous data — or nothing at all). Fresh halves ⇒ false.
    const stale = nowMs - entry.price.at > priceTtlMs || nowMs - entry.cot.at > cotTtlMs
    return { swarm: manifest.id, as_of: new Date(nowMs).toISOString(), stale, subjects }
  } catch {
    return null // never throws — the route treats null as "no pulse available"
  }
}
