// The commodity PULSE — a per-subject structured snapshot behind /api/swarm/pulse, for any swarm whose
// manifest declares `wire.pulse` (today: the commodity swarm's 12 subjects). Why it exists: the wire
// shows a commodity's NEWS, but a reader also wants the three numbers that frame every headline — where
// the price is (latest future + % change), which way the speculators lean (weekly CFTC COT managed-money
// net length), and what scheduled report hits next — plus the engine's own last verdict for the subject.
// All of it is plain keyless HTTP + date math: CNBC's quote REST service for prices (ONE batch call
// for all subjects), the CFTC Socrata API for COT, the recurring-reports line of COMMODITY_PROFILES.md
// for the calendar, and the run folder's decision_record.json for the verdict. ZERO LLM spend, and
// honest absence throughout: a field that can't be fetched or derived is OMITTED, never faked (§3).
//
// Why CNBC (live-verified 2026-07-11): stooq's CSV quote endpoint 404s for every symbol and its history
// endpoint sits behind a JavaScript proof-of-work wall; Yahoo's v8 chart API (query1 AND query2)
// fingerprints the TLS client and 429s every Node HTTP stack — undici fetch, node:https, cookie
// bootstrap, any UA — while letting curl through, so a Node server can never rely on it. CNBC's
// restQuote answers keylessly from Node, batches all symbols in one call, and each row carries the
// front-month contract label (e.g. "Gold COMEX (Aug'26)") as a bonus.
//
// Caching: prices and COT refresh independently on their own TTLs (NEWS.pulsePriceTtlMin /
// pulseCotTtlHours), with a single-flight guard so concurrent requests share one fetch, and the last
// good snapshot persisted under STATE_DIR so a restart doesn't open with an empty pulse. On a fetch
// failure the previous data for that half is kept and the snapshot says `stale: true`. Reports and
// verdicts are recomputed every call (pure local reads, cheap). UI calls never throw; the headless
// research refresh fails when it cannot preserve the exact price snapshot needed at decision time.
//
// Security posture: the HOSTS are hardcoded here (quote.cnbc.com, publicreporting.cftc.gov).
// The config file (frameworks/commodity/pulse_sources.json, path declared by the swarm manifest's
// `wire.pulse`) supplies only SYMBOLS / market substrings / units — any config value containing '://'
// is ignored, so a poisoned config can never redirect the fetch. Verified live by scripts/verify-pulse.ts.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { NEWS, STATE_DIR, REPO_ROOT } from '../config'
import { canonicalJsonText } from '../canonical-json'
import { swarmById, runRootForSubject } from '../swarms'
import type { SwarmManifest } from '../types'
import { BROWSER_UA, buildCnbcQuoteUrl, parseCnbcRows } from './cnbc-quote'

// ---- public snapshot shapes (the /api/swarm/pulse contract) ----

export interface PulsePrice { symbol: string; last: number; prev_close: number | null; change_pct: number | null; unit: string; as_of: string; source: 'cnbc'; label?: string }
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
  // Headless research must prove the point-in-time price archive landed before it dispatches orbs.
  // The ordinary UI keeps best-effort persistence so a local disk problem does not break the wire.
  requirePriceHistory?: boolean
}

// ---- config (frameworks/commodity/pulse_sources.json) ----

export interface PulseSubjectSource { cnbc?: string; unit?: string; cotMarketContains?: string }
export interface PulseSourcesConfig {
  subjects: Record<string, PulseSubjectSource>
  cotResource: string // path-only, e.g. '/resource/72hh-3qpy.json' — the host is never configurable
}

const DEFAULT_COT_RESOURCE = '/resource/72hh-3qpy.json'

/**
 * Load + sanitize the pulse source config. Symbols/substrings/units only: any value containing '://'
 * is dropped (hosts live in code, not config), CNBC symbols must look like symbols (@GC.1, @W.1 …),
 * and the COT dataset is reduced to its `/resource/<id>.json` path against the hardcoded Socrata host.
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
      const rawSym = safe(v.cnbc)
      subjects[key] = {
        cnbc: rawSym && /^[@a-z0-9.-]+$/i.test(rawSym) ? rawSym.toUpperCase() : undefined,
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

export interface CnbcQuote { symbol: string; last: number; prevClose: number | null; asOf: string | null; name: string | null }

// The CNBC transport (URL shape, browser UA, comma-thousands parsing) is shared with the equity quote
// lane and lives in ONE place — news/cnbc-quote.ts. Re-exported here so this module's own public surface
// (and its tests, and scripts/verify-pulse.ts) is unchanged.
export { buildCnbcQuoteUrl } from './cnbc-quote'

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
 * Parse a CNBC restQuote batch response into a symbol → quote map. Rows live under
 * FormattedQuoteResult.FormattedQuote (array, or a bare object for a single symbol). Numbers arrive as
 * STRINGS with comma thousands separators ("4,128.90") → stripped and parseFloat-ed; a row whose `last`
 * is missing/non-finite gets NO entry (a dead contract like @ALI.1 "Aluminium COMEX Nov'20" — the
 * caller omits that subject's price, honest absence, never a faked number). as_of comes from
 * `last_time` (ISO with offset, e.g. "…-0400") normalized to ISO UTC; `previous_day_closing` → prev;
 * `name` carries the front-month contract label. change_pct is deliberately NOT read from CNBC — the
 * caller recomputes it from last/prev so the math is always internally consistent (§15).
 *
 * The parsing itself is the shared one (cnbc-quote.parseCnbcRows); this narrows it to the five fields a
 * commodity subject uses. The narrowing is deliberate and load-bearing: the pulse snapshot shape is a
 * published contract, so the extra equity fields (currency, exchange, market status) must NOT leak into
 * it just because the shared parser now reads them.
 */
export function parseCnbcQuotes(json: unknown): Map<string, CnbcQuote> {
  const out = new Map<string, CnbcQuote>()
  for (const [symbol, r] of parseCnbcRows(json)) {
    out.set(symbol, { symbol: r.symbol, last: r.last, prevClose: r.prevClose, asOf: r.asOf, name: r.name })
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

// Per-host UAs: the .gov endpoint wants a descriptive UA with a contact (their API etiquette); the CNBC
// call presents a browser-ish UA (BROWSER_UA, imported from the shared transport — CNBC's WAF
// intermittently 403s non-browser UAs) and the CFTC call stays descriptive.
const PULSE_UA = 'nostra-demus-screener/1.0 (ceekay@muns.io)'

async function fetchText(fetchFn: typeof fetch, url: string, timeoutMs: number, ua: string = PULSE_UA): Promise<string | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchFn(url, { headers: { 'user-agent': ua, accept: '*/*' }, signal: ctrl.signal })
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
let persistSequence = 0

function atomicJsonReplace(file: string, value: unknown): void {
  const dir = path.dirname(file)
  fs.mkdirSync(dir, { recursive: true })
  const temporary = path.join(dir, `.${path.basename(file)}.${process.pid}.${++persistSequence}.tmp`)
  try {
    const descriptor = fs.openSync(temporary, 'wx', 0o600)
    try {
      fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`)
      fs.fsyncSync(descriptor)
    } finally {
      fs.closeSync(descriptor)
    }
    fs.renameSync(temporary, file)
  } finally {
    try { fs.unlinkSync(temporary) } catch { /* renamed or never created */ }
  }
}

/**
 * Keep the price half explicitly requested by a headless research preflight under a content-addressed
 * filename before the mutable warm-start file changes. Ordinary cockpit polling never calls this path,
 * so UI refreshes cannot create an unbounded archive. A research run can still recover its exact cutoff.
 */
function persistPriceHistory(stateDir: string, swarmId: string, entry: CacheEntry): void {
  if (!Number.isSafeInteger(entry.price.at) || entry.price.at <= 0) return
  const material = { swarm: swarmId, priceAt: entry.price.at, prices: entry.price.data }
  const digest = createHash('sha256').update(canonicalJsonText(material), 'utf8').digest('hex')
  const directory = path.join(
    stateDir, 'commodity-pulse-history', createHash('sha256').update(swarmId, 'utf8').digest('hex'),
  )
  const target = path.join(directory, `${entry.price.at}-${digest}.json`)
  const snapshot = { schema_version: 1, ...material, snapshot_sha256: `sha256:${digest}` }
  if (fs.existsSync(target)) {
    const existing = JSON.parse(fs.readFileSync(target, 'utf8'))
    if (canonicalJsonText(existing) !== canonicalJsonText(snapshot)) {
      throw new Error(`commodity pulse history target is not the expected immutable snapshot: ${target}`)
    }
    return
  }
  atomicJsonReplace(target, snapshot)
}

function archivePriceHistory(stateDir: string, swarmId: string, entry: CacheEntry, required: boolean): void {
  if (!required) return
  try { persistPriceHistory(stateDir, swarmId, entry) } catch (error) { if (required) throw error }
}

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

function persist(stateDir: string, swarmId: string, entry: CacheEntry, requirePriceHistory: boolean): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    let j: Record<string, unknown> = {}
    try { j = JSON.parse(fs.readFileSync(persistFile(stateDir), 'utf8')) || {} } catch { /* first write */ }
    j[swarmId] = { priceAt: entry.price.at, prices: entry.price.data, cotAt: entry.cot.at, cots: entry.cot.data }
    if (requirePriceHistory) persistPriceHistory(stateDir, swarmId, entry)
    atomicJsonReplace(persistFile(stateDir), j)
  } catch (error) {
    if (requirePriceHistory) throw error
    // UI persistence is best-effort — the in-memory snapshot still serves.
  }
}

// ---- the two refreshes (each replaces its WHOLE half only on a successful fetch) ----

const round2 = (n: number) => Math.round(n * 100) / 100

// CNBC batches every symbol in ONE call, so the failure semantics are simple: the batch failing
// (network / HTTP / non-JSON / empty) keeps the WHOLE previous half untouched — timestamp included —
// and the snapshot reports stale:true; a symbol missing (or unusable, e.g. a dead contract) inside a
// GOOD batch is honest absence for that subject.
async function refreshPrices(entry: CacheEntry, cfg: PulseSourcesConfig, fetchFn: typeof fetch, now: () => Date, timeoutMs: number): Promise<void> {
  const wanted = Object.entries(cfg.subjects).filter(([, s]) => s.cnbc)
  const nowMs = now().getTime()
  if (!wanted.length) { entry.price = { at: nowMs, data: {} }; return } // nothing configured — absence, not failure
  const symbols = [...new Set(wanted.map(([, s]) => s.cnbc!))].sort()
  const text = await fetchText(fetchFn, buildCnbcQuoteUrl(symbols), timeoutMs, BROWSER_UA)
  if (text === null) return // batch failed — keep the previous half (caller reports stale)
  let quotes: Map<string, CnbcQuote>
  try { quotes = parseCnbcQuotes(JSON.parse(text)) } catch { return } // not JSON — keep the previous half
  if (!quotes.size) return // 200 but nothing usable (shape change / block page) — keep the previous half
  const data: Record<string, PulsePrice> = {}
  for (const [subject, src] of wanted) {
    const q = quotes.get(src.cnbc!)
    if (!q) continue // absent/unusable in a good batch (dead contract) → omit, never fake
    const prev = q.prevClose !== null && q.prevClose !== 0 ? q.prevClose : null
    data[subject] = {
      symbol: src.cnbc!,
      last: q.last,
      prev_close: q.prevClose,
      change_pct: prev !== null ? round2(((q.last - prev) / prev) * 100) : null,
      unit: src.unit || '',
      as_of: q.asOf ?? now().toISOString(),
      source: 'cnbc',
      ...(q.name ? { label: q.name } : {}), // the front-month contract label, when CNBC names it
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
 * "this swarm has no pulse". Ordinary UI calls never throw. A headless research call with
 * `requirePriceHistory` throws when its point-in-time archive cannot be written.
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
          .then(() => persist(stateDir, manifest.id, e, deps.requirePriceHistory === true))
          .catch((error) => { if (deps.requirePriceHistory) throw error })
          .finally(() => { e.inflight = null })
      }
      await entry.inflight
    }
    // A within-TTL refresh may only read a legacy mutable warm-start file. Archive that exact price
    // half too, so the /commodity:full preflight always leaves a point-in-time snapshot behind.
    archivePriceHistory(stateDir, manifest.id, entry, deps.requirePriceHistory === true)

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
  } catch (error) {
    if (deps.requirePriceHistory) throw error
    return null // never throws — the route treats null as "no pulse available"
  }
}
