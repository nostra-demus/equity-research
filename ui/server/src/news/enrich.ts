// On-demand event enrichment — the "give me enough to decide whether to spend $8–45 on this" layer.
// The cheap triage is title-only by design; this fills the gap the moment a HUMAN opens an event,
// so it costs nothing on the firehose path and never touches Claude/Groq money. It does four jobs,
// each best-effort and independently degradable:
//   1. STORY     — fetch the source page (approved-domains only) and pull the real summary/lede
//                  beyond the headline, plus the publish time.
//   2. FILING     — for SEC EDGAR filings, parse the actual form type + 8-K item codes (turning
//                  "8-K — Acme Corp" into "8-K · Item 4.02 Non-reliance on prior financials") + filer
//                  + period. The single biggest uplift for the filing-heavy wire.
//   3. COVERAGE   — does the engine already KNOW this name? (a data pool, or a finished analysis +
//                  its last call). "We've looked at this before — last call Avoid" vs "net-new name"
//                  changes the decision completely. Asserted only when the company NAME reconciles —
//                  a bare guessed ticker is never enough to claim prior coverage (CLAUDE.md §3).
//   4. RELATED    — other recent wire items about the same company or theme, so a reader sees "this
//                  is the third Amazon item today", not an isolated line.
//
// Dependency-free (node built-ins only), tolerant regex extraction (no DOM lib), cached in STATE_DIR
// keyed by event_id, and it NEVER throws — every branch degrades to a labelled "couldn't fetch".

import fs from 'node:fs'
import path from 'node:path'
import { lookupSource } from './sources/approved-domains'
import { readFeed } from './feed'
import { cleanText } from './clean'
import { storyFloor, isFilingEvent } from './story-floor'
import { filterCompanies, isCompanyName } from './entities'
import type { ArticleCompany, ArticleParty } from './triage/groq'
import { type ArticleReadProvider, readArticleBrief } from './triage/article-read'
import type { CompanyGuess } from './types'

const CACHE_FILE = 'news-enrich-cache.json'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12h — a story/filing doesn't change; coverage rarely does intraday
const FETCH_TIMEOUT_MS = 9000
const USER_AGENT = process.env.NEWS_ENRICH_USER_AGENT || process.env.NEWS_RSS_USER_AGENT || 'Nostradamus Research (ceekay@muns.io)'
// SEC.gov mandates a descriptive contact UA; everywhere else a realistic browser header set so public
// article pages don't reject us as a bot (the cause of the low body-read rate).
const SEC_HEADERS: Record<string, string> = { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,application/xml' }
const BROWSER_HEADERS: Record<string, string> = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
}
const secHost = (u: string): boolean => { try { return /(^|\.)sec\.gov$/i.test(new URL(u).hostname) } catch { return false } }

// ---- public shapes ----

export interface PriorCoverage {
  ticker: string
  kind: 'data_pool' | 'analysis'
  detail: string // plain one-liner, e.g. "Last call: Avoid (2026-06-01, confidence 38)"
  path?: string
}
export interface SecFiling {
  form: string // "8-K", "10-Q", …
  form_label?: string // "Current report", when known
  items: { code: string; label: string }[] // 8-K item codes mapped to plain meaning
  filer?: string
  period?: string // period of report (YYYY-MM-DD)
  filed?: string // filing date (YYYY-MM-DD)
}
export interface RelatedEvent {
  event_id: string
  ts: string
  headline: string
  source_name: string
  triage_score: number
  scope?: string
}
export interface EventEnrichment {
  event_id: string
  ok: boolean
  fetched_at: string
  note?: string // why a section is thin (off-list domain, fetch failed, …)
  summary?: string // regex fallback: the real story beyond the headline (used when the Groq read is unavailable)
  published?: string
  sec?: SecFiling
  prior_coverage: PriorCoverage[]
  related: RelatedEvent[]
  // --- the article-body read (one Groq pass over the fetched body; absent on failure/no-key) ---
  gist?: string[] // 2-4 bullets: the real crux
  companies?: ArticleCompany[] // investable firms only (denylist-scrubbed), each with its role
  beneficiaries?: ArticleParty[] // who gains — named firms or an inferred group (flagged)
  exposed?: ArticleParty[] // who's at risk
  theme?: string // corrected single event-type (replaces the mis-tagged triage theme)
}

// ---- 8-K item-code dictionary (SEC §13/15(d) current-report items) — plain meanings ----
// The codes a buy-side reader actually cares about; 4.02 (restatement) and 5.02 (exec change) are the
// ones that flip a bland filing into a real signal.
const EIGHTK_ITEMS: Record<string, string> = {
  '1.01': 'Entry into a material agreement', '1.02': 'Termination of a material agreement', '1.03': 'Bankruptcy or receivership',
  '1.04': 'Mine safety', '2.01': 'Completion of an acquisition or disposal', '2.02': 'Results of operations (earnings)',
  '2.03': 'New financial obligation / debt', '2.04': 'Triggering of a debt acceleration', '2.05': 'Costs from exit/disposal',
  '2.06': 'Material impairment', '3.01': 'Delisting / failure to meet listing rules', '3.02': 'Unregistered share sale',
  '3.03': 'Change to holders’ rights', '4.01': 'Change of auditor', '4.02': 'Non-reliance on prior financials (restatement)',
  '5.01': 'Change in control', '5.02': 'Director / officer departure or appointment', '5.03': 'Change to bylaws / fiscal year',
  '5.04': 'Trading-plan suspension', '5.05': 'Change to code of ethics', '5.07': 'Shareholder vote results',
  '5.08': 'Shareholder nominations', '6.01': 'ABS informational', '7.01': 'Reg-FD disclosure', '8.01': 'Other events',
  '9.01': 'Financial statements & exhibits',
}

// ---- tiny helpers ----

// Decode the entities a scraped summary/title commonly carries — numeric (&#39; / &#x27;) AND named —
// so the reader shows "Tokyo's", not "Tokyo&#x27;s". Numeric is decoded first; &amp; is decoded LAST
// so an already-encoded "&amp;#39;" doesn't double-decode.
const clean = (s: string): string =>
  s
    .replace(/\s+/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)) } catch { return '' } })
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(Number(d)) } catch { return '' } })
    .replace(/&rsquo;|&lsquo;|&apos;/g, "'")
    .replace(/&rdquo;|&ldquo;|&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()

function firstMatch(html: string, res: RegExp[]): string | undefined {
  for (const re of res) {
    const m = re.exec(html)
    if (m && m[1] && clean(m[1])) return clean(m[1])
  }
  return undefined
}

/** Pull a readable summary: og:description / meta description / twitter:description, else the first
 *  substantial <p>. Capped — this is a teaser to decide on, not the full article. */
export function extractSummary(html: string): string | undefined {
  const meta = firstMatch(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ])
  if (meta && meta.length > 40) return meta.slice(0, 600)
  // fall back to the first paragraph with real prose (≥ 80 chars, contains a space-separated sentence)
  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => clean(m[1].replace(/<[^>]+>/g, '')))
  const lede = paras.find((p) => p.length >= 80 && /[.!?]/.test(p))
  return lede ? lede.slice(0, 600) : meta?.slice(0, 600)
}

export function extractPublished(html: string): string | undefined {
  return firstMatch(html, [
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["'][^"']*publish[^"']*["'][^>]+content=["']([^"']+)["']/i,
    /<time[^>]+datetime=["']([^"']+)["']/i,
  ])
}

/** Parse an EDGAR filing index page (…-index.htm). Tolerant: any field that isn't found is simply
 *  omitted. Exported for the test suite. Item codes are extracted ONLY for current-report forms
 *  (8-K / 6-K), ONLY from the "Items" grouping, and ONLY from item cells / "Item N.NN" labels — never
 *  from a bare decimal in prose or the page <head> (which would invent phantom items). */
export function parseSecFiling(html: string): SecFiling | undefined {
  // work only within <body> — the <head>/DOCTYPE/version strings carry decimals that look like codes
  const bodyStart = html.search(/<body[\s>]/i)
  const body = bodyStart >= 0 ? html.slice(bodyStart) : html
  // form type: "Form 8-K", or the filing-type cell
  const form = firstMatch(body, [
    /<div[^>]*id=["']formName["'][^>]*>\s*<strong>\s*Form\s+([0-9A-Za-z./-]+)/i,
    /Form\s+Type[^<]*<\/div>\s*<div[^>]*class=["']info["'][^>]*>\s*([0-9A-Za-z./-]+)/i,
  ])
  // form descriptive label, e.g. "Current report" — strip a trailing separator and the bracketed clause
  let formLabel = firstMatch(body, [/<div[^>]*id=["']formName["'][^>]*>\s*<strong>[^<]*<\/strong>\s*-?\s*([^<]+)</i])
  if (formLabel) formLabel = formLabel.replace(/\s*\[[^\]]*\]/g, '').replace(/\s*[:\-–]\s*$/, '').trim() || undefined
  // item codes exist ONLY on current reports (8-K domestic / 6-K foreign). 10-Q/10-K/S-1/DEF 14A carry none.
  const items: { code: string; label: string }[] = []
  if (/^(8-K|6-K)/i.test(form || '')) {
    const itemsZone = /Items?<\/div>([\s\S]*?)(?:<\/div>\s*<\/div>|<div[^>]*class=["']formGrouping|$)/i.exec(body)?.[1]
    if (itemsZone) {
      const codes = new Set<string>()
      // a code must be an item-cell value (<div class="info">8.01</div>) or an explicit "Item 8.01" —
      // never a bare decimal floating in prose (e.g. an "8.01%" coupon)
      for (const m of itemsZone.matchAll(/(?:<div[^>]*class=["']info["'][^>]*>\s*|Item\s+)(?:Item\s+)?([1-9]\.\d{2})\b/gi)) {
        if (EIGHTK_ITEMS[m[1]]) codes.add(m[1])
      }
      for (const code of [...codes].sort()) items.push({ code, label: EIGHTK_ITEMS[code] })
    }
  }
  const filer = firstMatch(body, [/<span[^>]*class=["']companyName["'][^>]*>\s*([^<(]+?)\s*\(/i, /<div[^>]*class=["']companyName["'][^>]*>\s*([^<(]+?)\s*\(/i])
  const period = firstMatch(body, [/Period of Report<\/div>\s*<div[^>]*class=["']info["'][^>]*>\s*(\d{4}-\d{2}-\d{2})/i])
  const filed = firstMatch(body, [/Filing Date<\/div>\s*<div[^>]*class=["']info["'][^>]*>\s*(\d{4}-\d{2}-\d{2})/i])
  if (!form && !items.length && !filer) return undefined
  return { form: form || '(filing)', form_label: formLabel, items, filer, period, filed }
}

// ---- prior coverage: does the engine already know this name? ----

const tickerKey = (t?: string | null): string => String(t || '').trim().toUpperCase()
const normName = (s?: string | null): string =>
  String(s || '').toLowerCase().replace(/\b(inc|corp|corporation|ltd|limited|plc|llc|co|company|holdings|group|sa|ag|nv|the)\b/g, '').replace(/[^a-z0-9]/g, '').trim()

/** Look up data pools (data/<TICKER>/), finished analyses (analyses/<TICKER>_<date>/decision_record.json)
 *  and the latest decision for each guessed company. Ticker-exact first, then a normalized-name match
 *  against the data-pool / analysis folders. Best-effort; never throws. */
export function findPriorCoverage(repoRoot: string, companies: CompanyGuess[]): PriorCoverage[] {
  const out: PriorCoverage[] = []
  const seen = new Set<string>()
  let dataDirs: string[] = []
  let analysisDirs: string[] = []
  try { dataDirs = fs.readdirSync(path.join(repoRoot, 'data'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) } catch {}
  try { analysisDirs = fs.readdirSync(path.join(repoRoot, 'analyses'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) } catch {}
  const dataNorm = new Map(dataDirs.map((d) => [normName(d), d]))

  for (const c of companies || []) {
    const tk = tickerKey(c.ticker)
    const nn = normName(c.name)
    // candidate tickers, each tagged with whether a folder NAME corroborates the guessed company name.
    // A bare guessed-ticker match (the model can guess a wrong ticker) is NOT name-corroborated.
    const cands = new Map<string, boolean>() // ticker -> nameCorroborated
    if (tk) cands.set(tk, false)
    for (const d of dataDirs) {
      if (nn && normName(d) === nn) cands.set(tickerKey(d), true)
      else if (tk && tickerKey(d) === tk) cands.set(tickerKey(d), cands.get(tickerKey(d)) ?? false)
    }
    if (nn && dataNorm.has(nn)) cands.set(tickerKey(dataNorm.get(nn)!), true)
    if (!cands.size) continue

    for (const [cand, nameCorroborated] of cands) {
      if (!cand || seen.has(cand)) continue
      const hasPool = dataDirs.some((d) => tickerKey(d) === cand)
      // latest analysis for this ticker (folders are <TICKER>_<YYYY-MM-DD>)
      const runs = analysisDirs.filter((d) => tickerKey(d.split('_')[0]) === cand).sort().reverse()
      if (runs.length) {
        const latest = runs[0]
        let dr: any = null
        try { dr = JSON.parse(fs.readFileSync(path.join(repoRoot, 'analyses', latest, 'decision_record.json'), 'utf8')) } catch {}
        // §3: only ASSERT we analysed "this name" when the name reconciles — via a folder-name match,
        // OR the decision record's own company_name matching the guessed name. A bare ticker guess
        // that doesn't reconcile is silently skipped (it could be a wrong ticker).
        const drNameOk = !!(dr && nn && normName(dr.company_name) === nn)
        if (!nameCorroborated && !drNameOk) continue
        let detail = `Analyzed ${runs.length === 1 ? 'once' : `${runs.length}×`}`
        const bits = [dr?.decision && `Last call: ${dr.decision}`, dr?.decision_date && `(${dr.decision_date}${typeof dr?.confidence_score === 'number' ? `, conf ${dr.confidence_score}` : ''})`].filter(Boolean)
        if (bits.length) detail = bits.join(' ')
        out.push({ ticker: cand, kind: 'analysis', detail, path: `analyses/${latest}` })
        seen.add(cand)
      } else if (hasPool && nameCorroborated) {
        // a bare data pool (no analysis to reconcile against) is asserted only on a folder-NAME match
        out.push({ ticker: cand, kind: 'data_pool', detail: 'Data pool present — not yet analyzed', path: `data/${cand}` })
        seen.add(cand)
      }
    }
  }
  return out.slice(0, 4)
}

// ---- related recent events on the wire ----

// A real English stoplist (function words + light verbs + news/finance scaffolding). A headline
// overlap built only from these would relate everything ("AI is MAKING promises YOUR brand…" must NOT
// relate to "…a lesson on decision-MAKING and knowing YOUR place"). Distinctive topic words — places,
// people, products, "nuclear", "tariff", "oil" — are deliberately NOT here, so they still anchor a match.
const STOP_WORDS = new Set(
  (
    // articles / pronouns / determiners / conjunctions / prepositions / aux + modals
    'the a an and or but for nor so yet of to in on at by as is are was were be been being am ' +
    'with from into onto over under after before amid among between within without across through during ' +
    'this that these those it its it’s they them their there here what when where which who whom whose why how ' +
    'i you he she we us our your his her my mine ours yours hers him me ' +
    'will would shall should can could may might must do does did done has have had having not no ' +
    // light/common verbs that carry no topic
    'make makes making made take takes taking took get gets getting got go goes going gone went come comes coming came ' +
    'say says said see sees seeing saw seen use uses using used want wants need needs keep keeps put puts set sets ' +
    'find finds show shows tell tells ask asks turn turns help helps move moves give gives gave knowing know knows ' +
    'paying pays paid eyes eyeing sees seeking seek seeks plan plans planning back ' +
    // generic adjectives / adverbs / quantifiers
    'new old big small good bad high low long short full early late best top more most less least many much few ' +
    'first last next other another same different such very just only also even still about around near nearly ' +
    'up down out off than then now soon later again over major minor key main ' +
    // time / number / news-finance filler
    'year years week weeks month months day days today week quarter data news report reports update updates live ' +
    'global market markets stock stocks share shares firm firms group price prices cost costs percent pct rate rates ' +
    'two three four five ten billion bn million mn trillion crore lakh amid says brand place lesson promises proverb'
  ).split(/\s+/),
)
// short-but-meaningful topic anchors (skipped by the ≥4-char rule but worth matching on)
const SHORT_TOPICS = new Set(['oil', 'gas', 'war', 'tax', 'fed', 'ecb', 'boj', 'rbi', 'fta', 'cpi', 'gdp', 'ppi', 'wpi', 'pmi', 'yen', 'ipo'])

/** The set of meaningful topic tokens in a headline (+ the guessed company names/tickers) used to test
 *  whether two events are ACTUALLY about the same thing — not just sharing a coarse theme tag. */
function topicTokens(headline?: string, companies?: CompanyGuess[]): Set<string> {
  const out = new Set<string>()
  for (const w of String(headline || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)) {
    if (!w || STOP_WORDS.has(w)) continue
    if (w.length >= 4 || SHORT_TOPICS.has(w)) out.add(w)
  }
  for (const c of companies || []) {
    if (!isCompanyName(c?.name)) continue // a country/agency guess ("China") must not cluster the wire
    const n = normName(c?.name)
    if (n) out.add(n)
    if (c?.ticker) out.add(String(c.ticker).toLowerCase())
  }
  return out
}

/**
 * Find events ACTUALLY related to this one — not merely sharing a theme tag. Two signals:
 *   - SAME named company (precise, strong)
 *   - ≥2 shared meaningful headline tokens (topical overlap, e.g. {japan, nuclear})
 * The old coarse "same scope + shared event_type" match is gone: it dumped the whole policy/macro
 * bucket (a US-Japan nuclear story "related" to Israel air strikes) — pure noise. When nothing clears
 * the bar we return [] and the UI says so honestly, which beats six irrelevant rows.
 */
export function findRelatedEvents(repoRoot: string, self: { event_id: string; headline?: string; companies?: CompanyGuess[]; event_types?: string[]; scope?: string }, now: () => Date = () => new Date()): RelatedEvent[] {
  let items: RelatedEvent[] = []
  try {
    const feed = readFeed(repoRoot, 2, { now, maxItems: 1500 })
    const myNames = new Set((self.companies || []).map((c) => normName(c.name)).filter(Boolean))
    const myTok = topicTokens(self.headline, self.companies)
    items = feed.items
      .filter((it: any) => it.event_id !== self.event_id)
      .map((it: any) => {
        const names = (it.companies || []).map((c: any) => normName(c?.name)).filter(Boolean)
        const sameCo = !!myNames.size && names.some((n: string) => myNames.has(n))
        let overlap = 0
        if (myTok.size) for (const t of topicTokens(it.headline, it.companies)) if (myTok.has(t)) overlap++
        // related iff same company OR a genuine topical overlap (≥2 shared meaningful tokens)
        return sameCo || overlap >= 2 ? { it, sameCo, overlap } : null
      })
      .filter(Boolean)
      // same-company first, then strongest topical overlap, then most recent
      .sort((a: any, b: any) => Number(b.sameCo) - Number(a.sameCo) || b.overlap - a.overlap || String(b.it.ts).localeCompare(String(a.it.ts)))
      .slice(0, 6)
      .map(({ it }: any) => ({ event_id: it.event_id, ts: it.ts, headline: it.headline, source_name: it.source_name, triage_score: it.triage_score, scope: it.scope }))
  } catch {}
  return items
}

// ---- fetch + cache orchestration ----

function loadCache(stateDir: string): Record<string, EventEnrichment> {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(stateDir, CACHE_FILE), 'utf8'))
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}
function saveCache(stateDir: string, cache: Record<string, EventEnrichment>): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    // bound growth — keep the 400 most recent
    const entries = Object.entries(cache).sort((a, b) => String(b[1].fetched_at).localeCompare(String(a[1].fetched_at))).slice(0, 400)
    fs.writeFileSync(path.join(stateDir, CACHE_FILE), JSON.stringify(Object.fromEntries(entries)))
  } catch {}
}

/** SSRF gate: a URL is fetchable only if it is http(s), on a default port, carries no userinfo, sits on
 *  an APPROVED public source domain, and is not an IP literal / loopback / private / metadata host.
 *  Applied to the initial URL AND re-applied to every redirect hop. (Approved sources are all public
 *  registrable domains, so any IP-literal host is inherently suspect and rejected.) Exported for tests. */
export function isSafeFetchUrl(u: string): boolean {
  let url: URL
  try { url = new URL(u) } catch { return false }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.port && url.port !== '80' && url.port !== '443') return false
  const host = url.hostname.toLowerCase()
  if (!host || !lookupSource(host)) return false // must stay inside the approved-source set
  if (host.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false // IPv6 / IPv4 literal
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false
  return true
}

/** Fetch with our own bounded, re-validated redirect handling (no blind redirect:'follow' to an
 *  arbitrary host), an HTML/size guard, and the request timeout. Never throws. */
async function fetchText(url: string, fetchFn: typeof fetch): Promise<{ ok: boolean; text?: string; note?: string }> {
  let current = url
  for (let hop = 0; hop < 4; hop++) {
    if (!isSafeFetchUrl(current)) return { ok: false, note: 'source link is not an approved, public http(s) URL' }
    let res: Response
    try {
      res = await fetchFn(current, {
        // Most news sites 403 a bare server fetch (bot block). A realistic browser header set lifts the
        // read rate sharply on public pages (no paywall circumvention — a hard paywall still serves a
        // stub, which we degrade on). SEC.gov is the exception: it REQUIRES its descriptive contact UA.
        headers: secHost(current) ? SEC_HEADERS : BROWSER_HEADERS,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: 'manual',
      })
    } catch (e: any) {
      return { ok: false, note: e?.name === 'TimeoutError' ? 'source timed out' : 'could not reach the source' }
    }
    // follow ONE redirect ourselves, re-validating the destination against the SSRF gate
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return { ok: false, note: `source returned HTTP ${res.status}` }
      try { current = new URL(loc, current).toString() } catch { return { ok: false, note: 'bad redirect target' } }
      continue
    }
    if (!res.ok) return { ok: false, note: `source returned HTTP ${res.status}` }
    // reject non-HTML and oversized declared bodies before materializing the string
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (ct && !/(html|xml|text\/plain)/.test(ct)) return { ok: false, note: 'source is not an HTML page' }
    const len = Number(res.headers.get('content-length'))
    if (Number.isFinite(len) && len > 1_500_000) return { ok: false, note: 'source page too large' }
    const text = await res.text()
    return { ok: true, text: text.slice(0, 600_000) }
  }
  return { ok: false, note: 'too many redirects' }
}

export interface EnrichInput {
  event_id: string
  url?: string
  headline?: string
  companies?: CompanyGuess[]
  event_types?: string[]
  scope?: string
}
export interface EnrichDeps {
  repoRoot: string
  stateDir: string
  fetchFn?: typeof fetch
  now?: () => Date
  sleep?: (ms: number) => Promise<void>
  force?: boolean
  // the article-body read's LLM fallback chain (Groq → OpenAI-compatible overflow → Gemini), in priority
  // order. Omit → no LLM read, degrade to the regex summary / deterministic story floor. Each provider
  // shares the ingester's daily budget + per-minute limiter, so the two paths keep one honest free-tier
  // accounting and never collectively bust a quota. Built once in config.ts (buildArticleReadProviders).
  articleProviders?: ArticleReadProvider[]
  // hard ceilings that keep an opened event from ever hanging the reader: the LLM read gets at most
  // llmBudgetMs of wall-clock across ALL providers (default 14s), and waits at most limiterWaitMs on any
  // single provider's rate limiter before skipping it (default 2.5s). Past the budget we return the floor.
  llmBudgetMs?: number
  limiterWaitMs?: number
  // legacy single-Groq shape — still honoured (tests / older callers). When articleProviders is absent but
  // this is set, it's promoted to a one-element chain so behaviour is unchanged.
  groq?: { apiKey: string; model: string; baseUrl: string; maxTokens?: number; rpm?: number; tpm?: number; dailyReqCap?: number; dailyTokenCap?: number }
}

// Scrub a Groq-returned party list: drop a NAMED party that's actually a country/index/agency (per the
// entity denylist); keep inferred groups (named_in_article=false) as-is — those are the honest "(sector)".
function scrubParties(parties: ArticleParty[] | undefined): ArticleParty[] {
  return (parties || []).filter((p) => p && p.name && (!p.named_in_article || isCompanyName(p.name)))
}

/**
 * Enrich one event. Coverage + related events are always computed from local disk (cheap, no network);
 * the story + filing parse need the source page, which we fetch only for approved domains. Result is
 * cached by event_id for CACHE_TTL_MS. Never throws.
 */
export async function enrichEvent(input: EnrichInput, deps: EnrichDeps): Promise<EventEnrichment> {
  const fetchFn = deps.fetchFn || fetch
  const now = deps.now || (() => new Date())
  const nowIso = now().toISOString().replace(/\.\d{3}Z$/, 'Z')

  const cache = loadCache(deps.stateDir)
  const hit = cache[input.event_id]
  if (!deps.force && hit && Date.now() - new Date(hit.fetched_at).getTime() < CACHE_TTL_MS) return hit

  // Prefer the event's OWN stored record (url + companies) from the firehose over the client-supplied
  // values — a client must not be able to point enrichment at an arbitrary page or poison the shared
  // cache for an event_id. Fall back to the client input only when the event has aged out of the
  // 2-day firehose window.
  let url = (input.url || '').trim()
  let companies = input.companies || []
  let event_types = input.event_types || []
  let scope = input.scope
  let headline = (input.headline || '').trim()
  let snippet = '' // the feed's own lede (RSS) — a fetch-free body when the source page blocks us
  // carried so the story floor can tell a regulatory/exchange filing (headline IS the disclosure) from
  // an article (body is the story) — see story-floor.ts. Pulled from the event's OWN stored record.
  let inputNature = ''
  let sourceTier = ''
  let sourceName = ''
  try {
    const stored = readFeed(deps.repoRoot, 2, { now, maxItems: 2000 }).items.find((it) => it.event_id === input.event_id)
    if (stored) {
      url = (stored.url || '').trim()
      companies = stored.companies || companies
      event_types = stored.event_types || event_types
      scope = (stored as any).scope || scope
      headline = cleanText(stored.headline) || headline // the stored headline is authoritative + cleaned
      snippet = (stored as any).snippet || ''
      inputNature = (stored as any).input_nature || ''
      sourceTier = (stored as any).source_tier || ''
      sourceName = (stored as any).source_name || ''
    }
  } catch {}
  if (!headline) headline = (input.headline || '').trim()

  // local, always-available sections first (use the reconciled companies/types)
  const prior_coverage = findPriorCoverage(deps.repoRoot, companies)
  const related = findRelatedEvents(deps.repoRoot, { event_id: input.event_id, headline, companies, event_types, scope }, now)

  const result: EventEnrichment = { event_id: input.event_id, ok: true, fetched_at: nowIso, prior_coverage, related }

  const host = url ? (() => { try { return new URL(url).hostname.toLowerCase() } catch { return '' } })() : ''
  // classify once: a regulatory/exchange filing's meaning lives in the headline (its body is a PDF/
  // attachment), so we never try to "read" it — we synthesize the story from what we hold (story-floor.ts).
  const filingInput = { headline, url, snippet, input_nature: inputNature, source_tier: sourceTier, source_name: sourceName, domain: host, companies }
  const filing = isFilingEvent(filingInput)
  // …but only a BSE/NSE exchange filing or a PDF/attachment is genuinely body-LESS. A regulator press
  // release (FCA / SEC press / etc.) is a readable article — still read its body. So we skip the read
  // only for these, and let every other "filing" fall through to a normal body read.
  const bodylessFiling = filing && (/(^|\.)(bseindia|nseindia)\.com$/.test(host) || /\.(?:pdf|xlsx?|docx?|zip)(?:[?#]|$)/i.test(url))
  // SEC item parsing applies ONLY to an actual EDGAR filing INDEX page — sec.gov press releases /
  // litigation bulletins are ordinary articles and fall through to the summary extractor.
  const isSec = /(^|\.)sec\.gov$/.test(host) && /\/Archives\/edgar\//i.test(url) && /-index\.html?($|[?#])/i.test(url)

  // Fetch the source page (best effort). A block (403 / paywall / JS-rendered shell) is NOT fatal:
  // most of the wire is RSS, and the feed's own lede (`snippet`) gives the body read a fetch-free input.
  let pageHtml = ''
  let fetchNote = ''
  if (!url) fetchNote = 'no source link to fetch'
  else if (!isSafeFetchUrl(url)) fetchNote = 'source is off the approved list — not fetched'
  else {
    const r = await fetchText(url, fetchFn)
    if (r.ok && r.text) pageHtml = r.text
    else fetchNote = r.note || 'source blocked'
  }

  if (isSec && pageHtml) {
    // an EDGAR filing index: the parsed item block IS the meaning; its page "summary" is header boilerplate.
    const sec = parseSecFiling(pageHtml)
    if (sec) result.sec = sec
    else { const s = extractSummary(pageHtml); if (s) result.summary = s }
  } else {
    if (pageHtml) { const pub = extractPublished(pageHtml); if (pub) result.published = pub }
    // the body for the read: the feed's lede + any fetched page text (snippet first — it's the cleanest).
    const pageBody = pageHtml ? cleanText(pageHtml.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')) : ''
    const body = [snippet, pageBody].filter(Boolean).join('\n\n').trim()
    // The article-body read — through the multi-provider fallback chain (Groq → OpenAI-compatible overflow
    // → Gemini), each sharing the ingester's daily budget + per-minute limiter, with a HARD wall-clock
    // budget so an opened event can NEVER hang the reader: if a provider's minute window is busy we skip it
    // in milliseconds and try the next, and past the budget we stop and fall through to the story floor.
    // SKIPPED for a filing: its "body" is a PDF/exchange-shell with no story to read — the headline IS the
    // disclosure, so we go straight to the deterministic floor (no wasted LLM call, no fabrication).
    const providers: ArticleReadProvider[] = deps.articleProviders?.length
      ? deps.articleProviders
      : deps.groq?.apiKey
        ? [{ id: 'groq', kind: 'openai', apiKey: deps.groq.apiKey, baseUrl: deps.groq.baseUrl, model: deps.groq.model, maxTokens: deps.groq.maxTokens, rpm: deps.groq.rpm ?? 28, tpm: deps.groq.tpm ?? 6000, dailyReqCap: deps.groq.dailyReqCap ?? Number.MAX_SAFE_INTEGER, dailyTokenCap: deps.groq.dailyTokenCap ?? Number.MAX_SAFE_INTEGER, budgetFile: 'groq-budget.json', limiter: 'groq' }]
        : []
    let brief = null
    if (body && !bodylessFiling && providers.length) {
      const r = await readArticleBrief(body, headline, providers, {
        stateDir: deps.stateDir,
        fetchFn,
        sleep: deps.sleep,
        now: () => now().getTime(),
        deadlineMs: now().getTime() + (deps.llmBudgetMs ?? 14_000),
        limiterWaitMs: deps.limiterWaitMs,
      })
      brief = r.brief
    }
    if (brief && (brief.gist.length || brief.companies.length || brief.beneficiaries.length || brief.exposed.length)) {
      if (brief.gist.length) result.gist = brief.gist
      const co = filterCompanies(brief.companies) // denylist safety-net on top of the prompt rule
      if (co.length) result.companies = co
      const ben = scrubParties(brief.beneficiaries)
      if (ben.length) result.beneficiaries = ben
      const exp = scrubParties(brief.exposed)
      if (exp.length) result.exposed = exp
      if (brief.theme) result.theme = brief.theme
      // read succeeded but produced no gist bullets → back it with a readable summary, never blank
      if (!brief.gist.length) result.summary = ((!bodylessFiling && pageHtml && extractSummary(pageHtml)) || snippet || storyFloor(filingInput).summary).slice(0, 600)
    } else {
      // NO readable body (a PDF/attachment filing, a JS shell, a paywall, an off-list link). Guarantee a
      // meaningful, accurate THE STORY rather than a raw fetch error. For an article we prefer a real page
      // summary / feed lede; for a filing (or when those are empty) we synthesize from the headline +
      // filing metadata (story-floor.ts — never empty, never fabricated). The raw fetch reason is demoted
      // to a SECONDARY hint, never shown AS the story.
      const extracted = !bodylessFiling ? ((pageHtml && extractSummary(pageHtml)) || snippet) : ''
      result.summary = (extracted && extracted.trim() ? extracted : storyFloor(filingInput).summary).slice(0, 600)
      if (fetchNote) result.note = fetchNote
    }
  }

  // FINAL GUARANTEE: the reader must NEVER see an empty or error-only story. If no section produced
  // renderable content (an unforeseen branch, an EDGAR page that parsed to nothing), synthesize the floor.
  if (!result.sec && !(result.gist && result.gist.length) && !(result.summary && result.summary.trim())) {
    result.summary = storyFloor(filingInput).summary
  }

  cache[input.event_id] = result
  saveCache(deps.stateDir, cache)
  return result
}
