// FORWARD EVENTS CALENDAR — the date-sorted "what's scheduled ahead" read the screener wire lacks
// (Capital IQ's Events tree, the full version). Where news/schedule.ts flags forward events that HAPPEN
// to appear on the reactive firehose, this pulls the actual scheduled calendar from free, keyless
// sources and serves it date-sorted:
//   • EARNINGS  — Nasdaq (US, api.nasdaq.com JSON) + NSE (India, nseindia.com/api/event-calendar JSON).
//                 Both are OFFICIAL exchange APIs (more robust than scraping moneycontrol, which is
//                 JS-only). One call per US date; one call for the whole NSE forward window.
//   • MACRO     — investing.com's economic-calendar endpoint: the only single free source that spans
//                 US + India (and any country) with future dates + a 1–3 importance rating. Undocumented
//                 HTML-in-JSON, so it is parsed DEFENSIVELY and treated as the fragile source (see below).
//
// Design mirrors news/commodity-pulse.ts exactly — keyless HTTP + typed parse + per-source TTL cache in
// STATE_DIR, single-flight, stale-flagging. Its FAILURE SEMANTICS are the "self-healing" the calendar
// needs: a source that errors, blocks, or shape-changes (200 but 0 rows) KEEPS its last-good half and is
// marked unhealthy — the calendar degrades to the sources that still work and SURFACES the breakage in
// `health`, rather than crashing or faking. Nothing is ever invented (§17 bans undated "soon").
//
// Off-switch: NEWS_CALENDAR_ENABLED=0. Lazy on request (only fetches when the calendar view is opened),
// so a background deploy never hammers these endpoints. Every fetch is timeout-bounded.

import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR, NEWS } from '../config'

// ---- types ----

export type CalendarEventKind = 'earnings' | 'macro'
export type MacroImportance = 'high' | 'medium' | 'low'

export interface CalendarEvent {
  id: string // stable de-dupe key (kind|region|date|title|ticker)
  kind: CalendarEventKind
  date: string // ISO YYYY-MM-DD — the scheduled date (local to the event's market)
  time: string | null // 'bmo' (before open) | 'amc' (after close) | 'HH:MM' | null (unknown)
  region: string // 'US' | 'IN' | 'GLOBAL' | 'OTHER'
  title: string // company name (earnings) OR indicator name (macro)
  ticker: string | null // earnings only
  detail: string | null // eps estimate / purpose (earnings) or a short note (macro)
  importance: MacroImportance | null // macro only (GDP/PCE = high, other BEA releases = medium)
  source: 'nasdaq' | 'nse' | 'bea' // Nasdaq US earnings, NSE India earnings, BEA US macro (all Node-verified)
}

export interface CalendarSourceHealth {
  source: string
  ok: boolean // did the LAST refresh attempt succeed (got usable rows)?
  at: string | null // ISO time of the last GOOD data (null = never)
  count: number // events from this source currently held
  note?: string // why it's unhealthy, when it is
}

export interface CalendarSnapshot {
  as_of: string
  stale: boolean // any source is past its TTL after the refresh attempt (i.e. a fetch failed)
  window: { from: string; to: string } // the forward date window covered (ISO)
  events: CalendarEvent[] // forward, date-sorted (soonest first), then by importance/kind
  health: CalendarSourceHealth[] // per-source liveness — the "which scraper is down" signal
}

// ---- date helpers (pure) ----

const iso = (d: Date): string => d.toISOString().slice(0, 10)
const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}
/** "14-Jul-2026" (NSE) → "2026-07-14"; returns null on anything unparseable (never guesses). */
export function parseNseDate(s: unknown): string | null {
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(String(s || '').trim())
  if (!m) return null
  const mm = MONTHS[m[2].toLowerCase()]
  if (!mm) return null
  return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`
}

// ---- parsers (pure, exported for tests) ----

const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '')
const mkId = (e: Omit<CalendarEvent, 'id'>): string => [e.kind, e.region, e.date, e.title, e.ticker || ''].join('|').toLowerCase()

/** Nasdaq earnings JSON (api.nasdaq.com/api/calendar/earnings?date=YYYY-MM-DD) → events for that date.
 *  Shape: { data: { asOf, rows: [{ symbol, name, time, epsForecast, noOfEsts, marketCap, ... }] } }.
 *  A missing/empty rows array is honest absence (a market holiday), returned as []. Never throws. */
export function parseNasdaqEarnings(json: unknown, date: string): CalendarEvent[] {
  const rows = (json as any)?.data?.rows
  if (!Array.isArray(rows)) return []
  const out: CalendarEvent[] = []
  for (const r of rows) {
    const name = str(r?.name, 120)
    const ticker = str(r?.symbol, 12).toUpperCase() || null
    if (!name && !ticker) continue
    const t = str(r?.time).toLowerCase()
    const time = t.includes('before') ? 'bmo' : t.includes('after') ? 'amc' : null
    const eps = str(r?.epsForecast, 24)
    const nEst = str(r?.noOfEsts, 8)
    const detail = eps ? `EPS est ${eps}${nEst ? ` (${nEst} est${nEst === '1' ? '' : 's'})` : ''}` : null
    const base = { kind: 'earnings' as const, date, time, region: 'US', title: name || ticker || '', ticker, detail, importance: null, source: 'nasdaq' as const }
    out.push({ id: mkId(base), ...base })
  }
  return out
}

/** NSE event-calendar JSON (array of { symbol, company, purpose, bm_desc, date:"DD-Mon-YYYY" }) → events.
 *  Only rows whose date parses AND is on/after `todayIso` are kept (it is a forward calendar). Never throws. */
export function parseNseEarnings(json: unknown, todayIso: string): CalendarEvent[] {
  if (!Array.isArray(json)) return []
  const out: CalendarEvent[] = []
  for (const r of json as any[]) {
    const date = parseNseDate(r?.date)
    if (!date || date < todayIso) continue
    const title = str(r?.company, 120) || str(r?.symbol, 12)
    if (!title) continue
    const ticker = str(r?.symbol, 12).toUpperCase() || null
    const purpose = str(r?.purpose, 80) || str(r?.bm_desc, 80) || null
    const base = { kind: 'earnings' as const, date, time: null, region: 'IN', title, ticker, detail: purpose, importance: null, source: 'nse' as const }
    out.push({ id: mkId(base), ...base })
  }
  return out
}

// High-impact BEA releases → 'high' (GDP and PCE/personal-income are top-tier, market-moving prints);
// everything else BEA schedules is real but lesser → 'medium'. Keyword-matched on the release title.
const BEA_HIGH_RE = /gross domestic product|personal income|pce|gdp/i

/** BEA iCalendar feed (bea.gov/news/schedule/ics/…) → US macro-release events. iCal is line-FOLDED (a
 *  75-char wrap continues on the next line with a leading space) and escapes commas as "\,", so we unfold
 *  first. Each VEVENT gives SUMMARY (the release name) + DTSTART (UTC date-time). `todayIso` keeps it
 *  forward-only. Dependency-free, defensive: a VEVENT missing SUMMARY or DTSTART is skipped, never faked.
 *  Exported for tests. */
export function parseBeaIcs(text: unknown, todayIso: string): CalendarEvent[] {
  if (typeof text !== 'string' || !text) return []
  // unfold: an iCal continuation line starts with a space or tab — join it to the previous line
  const unfolded = text.replace(/\r?\n[ \t]/g, '')
  const out: CalendarEvent[] = []
  for (const block of unfolded.split('BEGIN:VEVENT').slice(1)) {
    const sumM = /SUMMARY:(.+)/.exec(block)
    const dtM = /DTSTART[^:]*:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(block)
    if (!sumM || !dtM) continue
    const date = `${dtM[1]}-${dtM[2]}-${dtM[3]}`
    if (date < todayIso) continue
    const title = str(sumM[1].replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/gi, ' ').trim(), 140)
    if (!title) continue
    const time = `${dtM[4]}:${dtM[5]}` // UTC HH:MM as published
    const base = { kind: 'macro' as const, date, time, region: 'US', title, ticker: null, detail: 'BEA release (UTC)', importance: (BEA_HIGH_RE.test(title) ? 'high' : 'medium') as MacroImportance, source: 'bea' as const }
    out.push({ id: mkId(base), ...base })
  }
  return out
}

// ---- URL builders (pure, exported for tests) ----

export const buildNasdaqEarningsUrl = (date: string): string => `https://api.nasdaq.com/api/calendar/earnings?date=${date}`
export const NSE_EVENT_CALENDAR_URL = 'https://www.nseindia.com/api/event-calendar'
// BEA's official iCalendar release schedule (US GDP / PCE / personal income / trade). Chosen over the
// investing.com economic-calendar because investing.com hard-blocks a Node/undici TLS fingerprint (403,
// verified) while curl/browser get 200 — the same Node-block Yahoo does; BEA's .ics returns 200 from Node.
export const BEA_ICS_URL = 'https://www.bea.gov/news/schedule/ics/online-calendar-subscription.ics'

// ---- resilient fetch (browser UA + timeout + one retry; null on failure, never throws) ----

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function fetchJson(fetchFn: typeof fetch, url: string, timeoutMs: number, extraHeaders: Record<string, string> = {}): Promise<unknown | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchFn(url, { headers: { 'user-agent': BROWSER_UA, accept: 'application/json, text/plain, */*', ...extraHeaders }, signal: ctrl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch {
      if (attempt === 2) return null
      await new Promise((r) => setTimeout(r, 600))
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

async function fetchText(fetchFn: typeof fetch, url: string, timeoutMs: number, extraHeaders: Record<string, string> = {}): Promise<string | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchFn(url, { headers: { 'user-agent': BROWSER_UA, accept: 'text/calendar, text/plain, */*', ...extraHeaders }, signal: ctrl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch {
      if (attempt === 2) return null
      await new Promise((r) => setTimeout(r, 600))
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

// ---- cache: per-source half (mirrors commodity-pulse) ----

interface Half { at: number; events: CalendarEvent[]; ok: boolean; note?: string }
interface CacheEntry {
  earningsUs: Half
  earningsIn: Half
  macro: Half
  inflight: Promise<void> | null
}
const emptyHalf = (): Half => ({ at: 0, events: [], ok: false })
const memCache = new Map<string, CacheEntry>()
const persistFile = (stateDir: string) => path.join(stateDir, 'events-calendar.json')

function loadPersisted(stateDir: string): CacheEntry {
  const e: CacheEntry = { earningsUs: emptyHalf(), earningsIn: emptyHalf(), macro: emptyHalf(), inflight: null }
  try {
    const j = JSON.parse(fs.readFileSync(persistFile(stateDir), 'utf8'))
    for (const k of ['earningsUs', 'earningsIn', 'macro'] as const) {
      const h = j?.[k]
      if (h && Array.isArray(h.events)) e[k] = { at: Number(h.at) || 0, events: h.events, ok: !!h.ok, note: h.note }
    }
  } catch { /* first run */ }
  return e
}
function persist(stateDir: string, entry: CacheEntry): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const j = { earningsUs: entry.earningsUs, earningsIn: entry.earningsIn, macro: entry.macro }
    fs.writeFileSync(persistFile(stateDir), JSON.stringify(j, null, 2) + '\n')
  } catch { /* best-effort */ }
}

// ---- refreshers (each replaces its half ONLY on a good fetch; else keeps last-good + marks unhealthy) ----

function forwardDates(now: Date, days: number): string[] {
  const out: string[] = []
  for (let i = 0; i < days; i++) out.push(iso(new Date(now.getTime() + i * 86_400_000)))
  return out
}

async function refreshEarningsUs(entry: CacheEntry, fetchFn: typeof fetch, now: () => Date, timeoutMs: number, days: number): Promise<void> {
  const dates = forwardDates(now(), Math.min(days, 10)) // one call per date — cap the fan-out
  const all: CalendarEvent[] = []
  let anyOk = false
  for (const d of dates) {
    const json = await fetchJson(fetchFn, buildNasdaqEarningsUrl(d), timeoutMs, { accept: 'application/json', origin: 'https://www.nasdaq.com', referer: 'https://www.nasdaq.com/' })
    if (json === null) continue // this date failed — skip it, keep going
    anyOk = true
    all.push(...parseNasdaqEarnings(json, d))
  }
  if (!anyOk) { entry.earningsUs = { ...entry.earningsUs, ok: false, note: 'nasdaq unreachable — showing last-good' }; return }
  entry.earningsUs = { at: now().getTime(), events: all, ok: true }
}

async function refreshEarningsIn(entry: CacheEntry, fetchFn: typeof fetch, now: () => Date, timeoutMs: number): Promise<void> {
  const today = iso(now())
  const json = await fetchJson(fetchFn, NSE_EVENT_CALENDAR_URL, timeoutMs, { accept: 'application/json', referer: 'https://www.nseindia.com/companies-listing/corporate-filings-event-calendar' })
  if (json === null) { entry.earningsIn = { ...entry.earningsIn, ok: false, note: 'nse unreachable (cookie gate?) — showing last-good' }; return }
  const events = parseNseEarnings(json, today)
  if (!events.length && !Array.isArray(json)) { entry.earningsIn = { ...entry.earningsIn, ok: false, note: 'nse shape changed — showing last-good' }; return }
  entry.earningsIn = { at: now().getTime(), events, ok: true }
}

async function refreshMacro(entry: CacheEntry, fetchFn: typeof fetch, now: () => Date, timeoutMs: number): Promise<void> {
  const today = iso(now())
  const text = await fetchText(fetchFn, BEA_ICS_URL, timeoutMs)
  if (text === null) { entry.macro = { ...entry.macro, ok: false, note: 'BEA macro schedule unreachable — showing last-good' }; return }
  const events = parseBeaIcs(text, today)
  if (!events.length && !/BEGIN:VCALENDAR/i.test(text)) { entry.macro = { ...entry.macro, ok: false, note: 'BEA feed shape changed — showing last-good' }; return }
  entry.macro = { at: now().getTime(), events, ok: true }
}

// ---- the public entry point ----

export interface CalendarDeps { fetchFn?: typeof fetch; now?: () => Date; stateDir?: string }

/** Build the forward events-calendar snapshot. Lazy + single-flight + per-source TTL. Returns null when
 *  disabled (NEWS_CALENDAR_ENABLED=0). Never throws — a total outage yields an empty, all-unhealthy,
 *  stale snapshot, not an error. */
export async function getCalendar(deps: CalendarDeps = {}): Promise<CalendarSnapshot | null> {
  if (!NEWS.calendarEnabled) return null
  const fetchFn = deps.fetchFn ?? fetch
  const now = deps.now ?? (() => new Date())
  const stateDir = deps.stateDir ?? STATE_DIR
  const timeoutMs = NEWS.calendarTimeoutMs
  const earningsTtl = NEWS.calendarEarningsTtlHours * 3_600_000
  const macroTtl = NEWS.calendarMacroTtlHours * 3_600_000
  const days = NEWS.calendarWindowDays

  const key = stateDir
  let entry = memCache.get(key)
  if (!entry) { entry = loadPersisted(stateDir); memCache.set(key, entry) }

  // single-flight: coalesce concurrent callers onto one refresh
  if (entry.inflight) { await entry.inflight.catch(() => {}) }
  else {
    const nowMs = now().getTime()
    const jobs: Promise<void>[] = []
    if (nowMs - entry.earningsUs.at >= earningsTtl) jobs.push(refreshEarningsUs(entry, fetchFn, now, timeoutMs, days))
    if (nowMs - entry.earningsIn.at >= earningsTtl) jobs.push(refreshEarningsIn(entry, fetchFn, now, timeoutMs))
    if (nowMs - entry.macro.at >= macroTtl) jobs.push(refreshMacro(entry, fetchFn, now, timeoutMs))
    if (jobs.length) {
      const p = Promise.all(jobs).then(() => { persist(stateDir, entry!) }).finally(() => { entry!.inflight = null })
      entry.inflight = p
      await p.catch(() => {})
    }
  }

  const nowMs = now().getTime()
  const halves: [string, Half, number][] = [
    ['nasdaq', entry.earningsUs, earningsTtl],
    ['nse', entry.earningsIn, earningsTtl],
    ['bea', entry.macro, macroTtl],
  ]
  const health: CalendarSourceHealth[] = halves.map(([source, h]) => ({
    source, ok: h.ok, at: h.at ? new Date(h.at).toISOString() : null, count: h.events.length, ...(h.note && !h.ok ? { note: h.note } : {}),
  }))
  const stale = halves.some(([, h, ttl]) => nowMs - h.at >= ttl)

  // merge + de-dupe + forward-filter + sort (soonest first; within a day macro-high, then earnings)
  const today = iso(now())
  const seen = new Set<string>()
  const events: CalendarEvent[] = []
  for (const [, h] of halves) for (const e of h.events) {
    if (e.date < today) continue
    if (seen.has(e.id)) continue
    seen.add(e.id)
    events.push(e)
  }
  const impRank: Record<string, number> = { high: 0, medium: 1, low: 2 }
  events.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 :
    // same day: macro before earnings; macro by importance; then title
    a.kind !== b.kind ? (a.kind === 'macro' ? -1 : 1) :
    a.kind === 'macro' ? (impRank[a.importance || 'low'] - impRank[b.importance || 'low']) || a.title.localeCompare(b.title) :
    a.title.localeCompare(b.title))

  return {
    as_of: new Date(nowMs).toISOString(),
    stale,
    window: { from: today, to: iso(new Date(nowMs + days * 86_400_000)) },
    events,
    health,
  }
}

/** Test-only: clear the in-memory cache so a test starts cold. */
export function _resetCalendarCache(): void { memCache.clear() }
