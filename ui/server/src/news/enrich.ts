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
import { storyFloor, isFilingEvent, type StoryFloorInput } from './story-floor'
import { SEC_FORM_TOKENS, lookupSecForm, parseEdgarFilingHeadline, tidyFilerName } from './sec-forms'
import { filterCompanies, isCompanyName } from './entities'
import type { ArticleBrief, ArticleCompany, ArticleParty, NewsImpact } from './triage/groq'
import { type ArticleReadProvider, readArticleBrief } from './triage/article-read'
import { fetchGdeltDoc } from './sources/gdelt'
import { classifyParagraphs, type PageTextVerdict } from './page-junk'
import { fetchFilingDocText, resolveFilingDocUrl } from './filing-doc'
import type { CompanyGuess, RawArticle } from './types'

const CACHE_FILE = 'news-enrich-cache.json'
const CACHE_BACKUP_FILE = 'news-enrich-cache.bak.json' // last-known-good copy, written before each overwrite
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12h — a COMPLETE story/filing doesn't change; coverage rarely does intraday
// A DEGRADED read (a readable article whose LLM body-read momentarily missed — rate-limit window, empty
// parse, deadline) must NOT be frozen for 12h: that is exactly the bug where one transient miss showed the
// clickbait dek for half a day. It gets a short TTL so the very next open re-runs the real read and self-heals.
const DEGRADED_TTL_MS = capInt(process.env.NEWS_ENRICH_DEGRADED_TTL_MS, 90_000) // 90s — dedupes rapid re-opens, heals on the next genuine look
// After this many LLM read attempts on a readable article that still yields no brief, accept the deterministic
// floor as the final answer (it's the honest best — a hard paywall / JS shell isn't going to read) and give it
// the full TTL so we stop re-reading it forever.
const MAX_READ_ATTEMPTS = capInt(process.env.NEWS_ENRICH_MAX_READ_ATTEMPTS, 3)
const FETCH_TIMEOUT_MS = 9000
function capInt(v: string | undefined, dflt: number): number { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : dflt }
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
  form_meaning?: string // ONE plain-English sentence: what this form IS (from the sec-forms dictionary)
  routine?: boolean // true for a high-volume filing that rarely moves the stock on its own (424B2, 13F-HR, …)
  items: { code: string; label: string }[] // 8-K item codes mapped to plain meaning
  filer?: string
  period?: string // period of report (YYYY-MM-DD)
  filed?: string // filing date (YYYY-MM-DD)
}

/** Attach the plain-English form meaning + routine flag from the sec-forms dictionary to a parsed
 *  filing, in place. Unknown forms are left as-is (no invented meaning). */
function annotateSecForm(sec: SecFiling): SecFiling {
  const info = lookupSecForm(sec.form)
  if (info) { sec.form_meaning = info.meaning; sec.routine = info.routine; if (!sec.form_label) sec.form_label = info.label }
  return sec
}

/** Build a SecFiling straight from an EDGAR feed headline ("424B2 - GOLDMAN SACHS GROUP INC (CIK)
 *  (Filer)") — no fetch needed. Used as the floor when the index page can't be fetched (SEC.gov rate-
 *  limits hard), so the reader STILL sees "What was filed" with a plain-English meaning instead of a
 *  bare "couldn't open the body". Returns undefined when the headline isn't a recognized EDGAR form. */
function secFromHeadline(headline: string): SecFiling | undefined {
  const parsed = parseEdgarFilingHeadline(headline)
  if (!parsed) return undefined
  const info = lookupSecForm(parsed.form)
  if (!info) return undefined
  return { form: parsed.form, form_label: info.label, form_meaning: info.meaning, routine: info.routine, items: [], filer: tidyFilerName(parsed.filer) }
}
export interface RelatedEvent {
  event_id: string
  ts: string
  headline: string
  headline_en?: string | null // English translation (news/lang.ts) — the reader's related list renders it
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
  market_angle?: string // the single market-moving thread + transmission to asset prices (the "so what")
  companies?: ArticleCompany[] // investable firms only (denylist-scrubbed), each with its role
  beneficiaries?: ArticleParty[] // who gains — named firms or an inferred tradable group (flagged), each with its transmission
  exposed?: ArticleParty[] // who's at risk
  whats_priced?: string // the obvious read the market likely already holds (§7 consensus)
  the_edge?: string // a non-obvious angle the body supports that consensus may miss — absent if none
  watch_item?: string // the single next data point / number that confirms or kills the read
  theme?: string // corrected single event-type (replaces the mis-tagged triage theme)
  news_impact?: NewsImpact // does this move earnings/guidance/valuation/thesis/risk/a portfolio decision — direction, size, numbers, confidence
  // ---- read-quality bookkeeping (the anti-poisoning layer) ----
  // complete = this is the BEST obtainable read: a rich brief, an SEC parse, a filing floor (the headline
  // IS the disclosure), OR a readable article where we've exhausted MAX_READ_ATTEMPTS and the floor is the
  // honest best. Only a `complete` result earns the long 12h cache TTL; a `degraded` one gets a short TTL
  // so the next open (or the background heal pass) retries the real read instead of freezing a useless dek.
  complete?: boolean
  // degraded = had a readable article body but the LLM read produced no brief yet (the heal target).
  degraded?: boolean
  // how many times the LLM body read has been attempted for this event (across opens + heal passes). Caps
  // retries so a genuinely unreadable article (hard paywall, JS shell) isn't re-read forever.
  read_attempts?: number
  // CORROBORATION — set when the publisher blocked the direct read and the story (gist/summary) was instead
  // pieced together from OTHER outlets reporting the same event (GDELT keyword search). The UI labels it
  // honestly: this is secondary-wire corroboration, NOT a direct read of the source (CLAUDE.md §3).
  corroborated?: { count: number; domains: string[] }
  // PROVENANCE — set when the story was NOT read from the original page: 'filing_doc' = the disclosure
  // document itself (the exchange PDF the event announces — a BETTER source than the page, §4 tier 1-2);
  // 'alternate' = another approved outlet carrying the SAME story (dedup cluster), used when the original
  // blocked the read. The UI labels it so a reader always knows what was actually read (§3/§5).
  read_from?: { kind: 'filing_doc' | 'alternate'; url?: string; domain?: string; source_name?: string }
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

/** The substantive <p> paragraphs of a page in document order — non-content regions stripped
 *  (script/style/nav/header/footer/aside/figure/form), prose-gated, de-duped. This is the RAW paragraph
 *  set, BEFORE the chrome/boilerplate filter, so classifyParagraphs can measure how much of the page is
 *  chrome (the interstitial/paywall verdict needs the dropped share, not just what survives). */
function collectParagraphs(html: string): string[] {
  if (!html) return []
  const stripped = html
    // end tags matched the way browsers accept them — </script>, </script >, and even </script\t\n bar>
    // (whitespace + junk before >) — so a crafted page can't slip script/style text past the strip
    // (CodeQL js/bad-tag-filter); \b so <scriptx>/</scriptx> isn't mistaken for a real script tag.
    .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, ' ')
    .replace(/<(nav|header|footer|aside|form|figure|figcaption)\b[\s\S]*?<\/\1\b[^>]*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
  const seen = new Set<string>()
  const paras: string[] = []
  for (const m of stripped.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const p = clean(m[1].replace(/<[^>]+>/g, ' '))
    if (p.length < 60 || !/[a-z]/i.test(p) || !/[.!?]/.test(p)) continue // real prose, not a label/stub
    const k = p.slice(0, 80).toLowerCase()
    if (seen.has(k)) continue // some templates repeat the lede
    seen.add(k)
    paras.push(p)
  }
  return paras
}

/** Pull the readable ARTICLE TEXT (not the page chrome) deterministically, PLUS the page-quality
 *  verdict. The text is what extractReadable always returned — the substantive paragraphs with the
 *  consent/terms/cookie/paywall chrome dropped (news/page-junk.ts). The verdict says what the page IS
 *  when the chrome dominates: an 'interstitial' (the ASX "agree and proceed" wall), a 'paywall' stub,
 *  or 'empty' (a JS shell) — so a caller can refuse to treat what's left as an article at all instead
 *  of ever presenting popup text as THE STORY. Exported for the test suite. */
export function extractArticleText(html: string): { text: string; verdict: PageTextVerdict } {
  const r = classifyParagraphs(collectParagraphs(html))
  return { text: r.kept.join('\n\n').slice(0, 4000), verdict: r.verdict }
}

/** Back-compat shape: just the readable text (chrome-filtered). Feeds the LLM read AND the
 *  deterministic fallback. Empty when the page carries no real prose. Exported for the test suite. */
export function extractReadable(html: string): string {
  return extractArticleText(html).text
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

// A real per-ticker run folder is always <TICKER>_<YYYY-MM-DD> (e.g. "BG_2026-05-11"). analyses/ also
// holds a handful of BARE, non-ticker aggregate folders — eval/ performance/ portfolio/ tracking/ (the
// /research:eval, :size, :track outputs) — with no trailing date, so this shape excludes them without
// hardcoding their names (a future aggregate folder is excluded the same way, for free).
const RUN_FOLDER_RE = /^(.+)_\d{4}-\d{2}-\d{2}$/

/** Tickers we already have research coverage on — a real `analyses/<TICKER>_<date>` run folder — the
 *  pragmatic proxy for "portfolio companies" used by the batch-review filter, since this codebase has
 *  no separate brokerage holdings list. Best-effort; never throws. */
export function listCoveredTickers(repoRoot: string): string[] {
  let analysisDirs: string[] = []
  try {
    analysisDirs = fs.readdirSync(path.join(repoRoot, 'analyses'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  } catch {}
  const tickers = new Set<string>()
  for (const d of analysisDirs) {
    const m = RUN_FOLDER_RE.exec(d)
    const t = m ? tickerKey(m[1]) : ''
    if (t) tickers.add(t)
  }
  return [...tickers].sort()
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
    'two three four five ten billion bn million mn trillion crore lakh amid says brand place lesson promises proverb ' +
    // SEC EDGAR role tags (every "getcurrent" filing title ends in "(Filer)") — see text-match.ts; form
    // codes like "424b2" are dropped via SEC_FORM_TOKENS below
    'filer filers registrant'
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
    if (SEC_FORM_TOKENS.has(w)) continue // SEC form codes ("424b2", "defa14a") are not a topic — see sec-forms.ts
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
      .map(({ it }: any) => ({ event_id: it.event_id, ts: it.ts, headline: it.headline, headline_en: it.headline_en, source_name: it.source_name, triage_score: it.triage_score, scope: it.scope }))
  } catch {}
  return items
}

// ---- fetch + cache orchestration ----

function loadCache(stateDir: string): Record<string, EventEnrichment> {
  // Prefer the live file; fall back to the last-good backup if it's missing/corrupt (a truncated write,
  // a half-flushed crash). The backup means a single bad write can never wipe every cached read.
  for (const file of [CACHE_FILE, CACHE_BACKUP_FILE]) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf8'))
      if (o && typeof o === 'object') return o
    } catch {}
  }
  return {}
}
function saveCache(stateDir: string, cache: Record<string, EventEnrichment>): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    // bound growth — keep the 400 most recent
    const entries = Object.entries(cache).sort((a, b) => String(b[1].fetched_at).localeCompare(String(a[1].fetched_at))).slice(0, 400)
    const json = JSON.stringify(Object.fromEntries(entries))
    const main = path.join(stateDir, CACHE_FILE)
    // BACKUP: copy the current good file aside BEFORE overwriting, so a crash mid-write leaves a recoverable
    // copy. Then write to a temp file and rename (atomic on POSIX) so a reader never sees a half-written file.
    try { if (fs.existsSync(main)) fs.copyFileSync(main, path.join(stateDir, CACHE_BACKUP_FILE)) } catch {}
    // per-process temp name so a second writer (e.g. the enrich-eval CLI racing the live engine) can't tear
    // a shared tmp; the rename is atomic so a reader never sees a half-written main. main is only ever
    // produced by this atomic path, so the copy-to-.bak above always copies a complete file, never a torn one.
    const tmp = `${main}.${process.pid}.tmp`
    fs.writeFileSync(tmp, json)
    fs.renameSync(tmp, main)
  } catch {}
}

/** Did this enrichment produce its best obtainable substance? A rich brief, an SEC parse, a filing floor
 *  (the headline IS the disclosure), or an article where retries are exhausted (complete set explicitly). */
export function isEnrichmentComplete(r: EventEnrichment): boolean {
  return !!(
    r.complete ||
    r.sec ||
    (r.gist && r.gist.length) ||
    (r.companies && r.companies.length) ||
    (r.beneficiaries && r.beneficiaries.length) ||
    (r.exposed && r.exposed.length) ||
    // a news_impact-only verdict is a real, usable read: a routine/boilerplate article correctly yields
    // empty gist/companies/beneficiaries/exposed (the DIGEST RULE) yet still carries a decision-useful
    // "no real impact" Impact block. analyst_takeaway is non-empty ONLY when the LLM actually read the
    // article (coerceNewsImpact defaults it to "" on a missing/malformed block), so it is the same
    // "the read happened" signal article-read.ts's hasContent() gates on. Without this, such a read is
    // marked degraded → short TTL → the web store refetches it on every reopen, burning repeated LLM
    // reads until MAX_READ_ATTEMPTS.
    (r.news_impact && r.news_impact.analyst_takeaway.length > 0)
  )
}
/** A complete read is stable → 12h. A degraded one expires fast so the next look retries the real read. */
function ttlFor(r: EventEnrichment): number {
  return isEnrichmentComplete(r) ? CACHE_TTL_MS : DEGRADED_TTL_MS
}

/** Cover-page letterhead (registered address, CIN, phone/fax, website, scrip/ISIN codes) clusters near the
 *  START of a BSE/NSE filing's PDF text — real disclosure prose never does. Scopes the letterhead-floor
 *  override below to filings whose extracted text actually IS a cover page, not every BSE/NSE filing: a
 *  filing with a generic title (e.g. "General Updates", "Newspaper Publication") can open directly with the
 *  real update, and that body must still compete instead of being discarded for the terse floor (Codex
 *  review on #189). Matches on the Adani-QIP letterhead fixture: CIN, Registered Office, Tel/Fax, a website,
 *  and Scrip Code all cluster in the opening lines of a genuine cover page — real prose rarely carries two. */
function looksLikeLetterhead(text: string): boolean {
  const head = text.slice(0, 500)
  let hits = 0
  if (/\bCIN[:\s]*[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/i.test(head)) hits++
  if (/\bregd\.?\s*office\b|\bregistered\s+office\b/i.test(head)) hits++
  if (/\b(?:tel|fax)\b\s*[:.]?\s*\+?\d/i.test(head)) hits++
  if (/\bwww\.[a-z0-9.-]+\.[a-z]{2,}/i.test(head)) hits++
  if (/\bscrip\s*code\b/i.test(head)) hits++
  return hits >= 2
}

/** Isolate the real disclosure body from a filing PDF's opening cover-page letterhead. Indian SEBI-LODR
 *  cover letters carry the matter after a "Sub:/Subject:/Ref:" line, or after a "Dear Sir/Madam" salutation
 *  — take the text from the first such anchor so the body that follows the letterhead is preserved and can
 *  compete, instead of discarding the whole lede for the terse headline floor (Codex review on #189). A
 *  genuine cover page with NEITHER anchor is pure boilerplate with no isolable body → returns '' (the caller
 *  keeps the headline floor). Deliberately anchor-based, NOT "drop leading letterhead lines": an issuer
 *  ADDRESS block carries none of the letterhead keywords, so a line-dropping heuristic would leak it — the
 *  anchor is the only reliable boundary between the cover page and the disclosure. */
function stripLetterhead(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim()
  // Sub/Subject is the actual disclosure boundary. Try it FIRST — a cover letter's "Ref:" line (an internal
  // reference number, often followed by more address/date boilerplate) sits ABOVE "Sub:" and is not itself
  // the subject boundary, so anchoring on whichever comes first (Codex review on #189) can return a tail that
  // still starts mid-boilerplate. Only fall back to "Ref:" when there is no Sub/Subject or salutation anchor
  // at all — some cover letters label the subject line "Ref:" instead.
  // Separator is a colon, or a dash/en-dash FOLLOWED BY whitespace ("Sub - …") — never a word-joining hyphen,
  // so "Sub-committee" / "Sub-division" in a cover page is not mistaken for the "Sub-" subject boundary.
  const subj = /\b(?:sub|subject)\b\s*\.?\s*(?::|[-–](?=\s))\s*/i.exec(t)
  if (subj) { const tail = t.slice(subj.index + subj[0].length).trim(); if (tail.length >= 40) return tail }
  // The salutation is checked BEFORE the colonless "Sub" fallback below: a cover-page ADDRESS line can itself
  // contain the bare word "sub" (e.g. "Near Sub Station Road" — a landmark, not a subject label), which sits
  // ABOVE the salutation in a real letter. Anchoring on that bare "sub" first would return a tail starting
  // mid-address ("Station Road …") instead of the disclosure after "Dear Sir/Madam" (Codex review on #189).
  // "Dear Sir/Madam" is a much stronger, less ambiguous boundary, so it takes priority whenever present.
  // The alternation lists the COMPOUND "sir/madam" FIRST: ordered alternation is greedy-left, so a bare `sir`
  // ahead of `sir\s*\/?\s*madam` would match only "Sir" and stop at the "/", leaving the tail beginning
  // "/Madam, <disclosure>" — a stray "/Madam," prefix leaks onto THE STORY. Matching the full "Sir/Madam"
  // first consumes it cleanly so the tail starts at the real disclosure.
  const dear = /\bdear\s+(?:sir\s*\/?\s*madam|madam|sirs|sir)\b[,:]?\s*/i.exec(t)
  if (dear) { const tail = t.slice(dear.index + dear[0].length).trim(); if (tail.length >= 40) return tail }
  // PDF text extraction sometimes drops the ":" after "Sub" (the Adani-QIP shape: "Sub Qualified institutions
  // placement …"). Accept a colonless "Sub" / "Sub." label — the ABBREVIATION only (\bsub\b excludes "subject",
  // "submitted", "subsidiary"), and only when real body text (a letter/digit) follows, so ordinary prose that
  // merely contains the word "subject" can never be mistaken for the disclosure boundary. Tried only after the
  // salutation anchor above, since a bare "sub" can appear earlier in an address landmark (see above).
  const subBare = /\bsub\b\.?\s+(?=[A-Za-z0-9])/i.exec(t)
  if (subBare) { const tail = t.slice(subBare.index + subBare[0].length).trim(); if (tail.length >= 40) return tail }
  const ref = /\bref\b\s*[:\-–]\s*/i.exec(t)
  if (ref) { const tail = t.slice(ref.index + ref[0].length).trim(); if (tail.length >= 40) return tail }
  return ''
}

/** When the LLM read isn't available, show the MOST substantial real text we already hold — not whatever
 *  comes first. The og:description is frequently a vague marketing dek ("there's one theme you can't
 *  ignore"); the RSS lede is frequently the real opening paragraph. Prefer the longest genuine prose of the
 *  two, falling back to the deterministic story floor. (A filing has no readable body → straight to floor.)
 *
 *  filingIsAttachment = the disclosure is a BSE/NSE or PDF/exchange ATTACHMENT (not a fetchable article
 *  page). Its document OFTEN opens with cover-page letterhead — the issuer's registered address, CIN,
 *  phone/fax, website, scrip codes — NEVER the disclosure, yet it is long and prose-like, so the "longest
 *  genuine prose wins" ranking below would surface THAT boilerplate over the parsed subject (the Adani-QIP
 *  defect). For these filings, once the extracted text actually looks like a cover page (looksLikeLetterhead),
 *  the letterhead is STRIPPED (stripLetterhead) so the real disclosure body that follows — a "Sub:/Ref:"
 *  line or the text after a salutation — still competes below; a pure cover page with no isolable body
 *  reduces to '' and the headline floor wins the sort (story-floor.ts / §27). This preserves body-only facts
 *  for generic-title filings ("General Updates" whose PDF is letterhead + the real update) instead of
 *  discarding them for the terse floor (Codex review on #189). A BSE/NSE filing whose text is NOT a cover
 *  page (a generic title opening directly with the real update) is untouched and competes as-is.
 *  Deliberately NOT keyed on merely "we read a document": an ASX announcement (fetched via its documentKey,
 *  and whose PDF opens with the real announcement text, not letterhead) has filingIsAttachment=false, so its
 *  genuine content still competes — as does a regulator PRESS RELEASE (a readable article, no document). */
export function bestFallbackSummary(pageHtml: string, snippet: string, filingInput: StoryFloorInput, bodylessFiling: boolean, filingIsAttachment = false): string {
  const floor = storyFloor(filingInput).summary
  if (bodylessFiling) return floor
  // A BSE/NSE- or PDF-attachment filing whose extracted text actually IS cover-page letterhead → strip the
  // boilerplate so the real disclosure body that follows still competes below, rather than discarding the
  // whole lede for the terse floor. A pure cover page (no isolable body) strips to '' → the floor wins the
  // sort, so letterhead can never leak. (isFilingEvent is a belt-and-braces guard — the attachment signal
  // already implies a filing.) A filing whose text is NOT a cover page falls through untouched.
  let lede = String(snippet || '')
  let strippedBody = ''
  if (filingIsAttachment && isFilingEvent(filingInput) && looksLikeLetterhead(lede)) {
    strippedBody = stripLetterhead(lede)
    lede = strippedBody
  }
  // A disclosure body we deliberately isolated from cover-page letterhead is the filing's OWN words — the
  // primary source (§4) — and must outrank the deterministic headline floor even when it is SHORTER than
  // that floor. A one-line "Mr X has resigned as CFO with effect from today" after the letterhead must not
  // lose the length sort to the terse "from the headline: …" restatement and drop the body-only fact (Codex
  // review on #189, discussion_r3551546331). stripLetterhead already removed the letterhead, so a non-empty
  // return is real disclosure prose (≥40 chars) — never letterhead, so this can't leak the cover page.
  if (strippedBody && /[a-z][a-z ,;:'"-]{12,}/i.test(strippedBody)) return strippedBody.slice(0, 600)
  // the real article prose (extractReadable) is preferred over the often-vague og:description dek — so a
  // fetched page shows its genuine opening even when no LLM was available to summarise it.
  const readable = pageHtml ? extractReadable(pageHtml) : ''
  const cands = [lede, readable, pageHtml ? extractSummary(pageHtml) || '' : '']
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && /[a-z][a-z ,;:'"-]{12,}/i.test(s)) // real prose, not a code/stub
  // The deterministic floor (an honest "couldn't open the body — from the headline: …" restatement) is
  // ALWAYS a candidate, so a vague short og:description dek ("one overriding theme you can't ignore") can
  // never become the frozen story — only a genuinely more substantial lede (a real RSS/page opening) wins.
  cands.push(floor)
  cands.sort((a, b) => b.length - a.length)
  return cands[0].slice(0, 600)
}

/**
 * Commit a freshly-computed enrichment to the cache with two durable guards:
 *   - NO-CLOBBER (the backup): never replace a still-fresh COMPLETE read with a DEGRADED one. A force-refresh
 *     or heal pass that momentarily misses the LLM must not destroy a good brief we already had. We keep the
 *     good one and only refresh its volatile bits (coverage / related).
 *   - ATTEMPT BOOKKEEPING: count LLM read attempts and, once MAX is hit on a still-readable article, accept
 *     the floor as the final answer (mark complete) so it earns the long TTL and the heal pass leaves it be.
 * Re-reads the on-disk cache first so concurrent writers (the route + the heal pass) don't lose each other's
 * single-entry updates. Returns the entry actually stored (which the caller returns to the client).
 */
function commitEnrichment(stateDir: string, id: string, next: EventEnrichment, attempted: boolean): EventEnrichment {
  const cache = loadCache(stateDir)
  const prev = cache[id]
  if (attempted) next.read_attempts = (prev?.read_attempts || 0) + 1
  else if (prev?.read_attempts) next.read_attempts = prev.read_attempts
  // a readable article we've now tried enough times → accept the floor as final (stop re-reading forever)
  if (!isEnrichmentComplete(next) && (next.read_attempts || 0) >= MAX_READ_ATTEMPTS) next.complete = true
  // stamp `complete` as an explicit boolean on EVERY result — a rich brief / SEC parse is complete even
  // though nothing set the flag, and the client gates its refetch on exactly this flag (no needless re-read
  // of a good story, and a degraded one keeps retrying).
  const complete = isEnrichmentComplete(next)
  next.complete = complete
  next.degraded = !complete

  let chosen = next
  if (prev && isEnrichmentComplete(prev) && !complete && Date.now() - new Date(prev.fetched_at).getTime() < CACHE_TTL_MS) {
    // keep the good read; carry forward the latest attempt count + freshly-computed volatile sections
    chosen = {
      ...prev,
      read_attempts: next.read_attempts ?? prev.read_attempts,
      related: next.related?.length ? next.related : prev.related,
      prior_coverage: next.prior_coverage?.length ? next.prior_coverage : prev.prior_coverage,
    }
  }
  cache[id] = chosen
  saveCache(stateDir, cache)
  return chosen
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
 *  arbitrary host), an HTML/size guard, and the request timeout (overridable so a budgeted caller —
 *  the alternate-outlet read — can shrink it to what remains of its wall clock). Never throws. */
async function fetchText(url: string, fetchFn: typeof fetch, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<{ ok: boolean; text?: string; note?: string }> {
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
        signal: AbortSignal.timeout(timeoutMs),
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
  // the SHARED per-provider cross-cycle cooldown (config.NEWS.llmCooldownMs / llmCooldownMaxMs, set by
  // NEWS_LLM_COOLDOWN_SEC / NEWS_LLM_COOLDOWN_MAX_SEC). Omit → readArticleBrief's own hardcoded defaults
  // (300s base / 60min cap) — an operator who lengthens the cooldown during a real outage must have that
  // reach every article-read call site, not just the ingester's triage/overflow/Gemini seams in runCycle.ts.
  cooldownMs?: number
  cooldownMaxMs?: number
  // legacy single-Groq shape — still honoured (tests / older callers). When articleProviders is absent but
  // this is set, it's promoted to a one-element chain so behaviour is unchanged.
  groq?: { apiKey: string; model: string; baseUrl: string; maxTokens?: number; rpm?: number; tpm?: number; dailyReqCap?: number; dailyTokenCap?: number }
  // CORROBORATION fallback: when the publisher blocks the direct read (no body, no usable lede), ask GDELT
  // who else reported the event and synthesise the story from the secondary wire. Omit/disabled → off (the
  // legacy floor behaviour). baseUrl is the GDELT DOC endpoint (shared with the firehose). Wired in server.ts.
  corroborate?: { enabled: boolean; baseUrl: string; timeoutMs?: number }
}

// Obviously NON-TRADABLE "parties" a model still occasionally emits as an inferred group — a sports team,
// a population, a generic rate-setter. This regex catches the sports-team / population / generic-rate-setter
// shapes the entity denylist does NOT enumerate (it knows named countries/indices/regulators, not "world
// cup" or "the public"). Kept deliberately TIGHT so a real tradable sector ("oil producers", "Indian
// private banks", "gold", "Treasuries", "airlines") is never caught — the prompt's INVESTABILITY GATE is
// the primary filter; this is the deterministic backstop (§24).
const NON_TRADABLE_PARTY_RE = /\b(world cup|national team|national side|olympic team|football club|soccer team|cricket team|sports team)\b|\b(citizens|voters|taxpayers|tourists|spectators|fans|pensioners|migrants|refugees|the public|general public)\b|\b(central bank|reserve bank|federal reserve|the regulator|ministry of|parliament|congress)\b/i

// Scrub a Groq-returned party list. Drop, in BOTH the named and the inferred-group path: (1) anything the
// entity denylist rejects — a country / index / regulator / central bank / named individual (isCompanyName),
// and (2) anything matching the non-tradable backstop above (sports teams / populations). A legitimate
// inferred sector/group ("oil producers", "gold") is NOT in the denylist, so isCompanyName keeps it as the
// honest "(sector)" row. Earlier this required isCompanyName only on the NAMED path — an inferred group
// (named_in_article=false) short-circuited past it, so "the Fed" / "India" / "S&P 500" / "SOFR" sailed
// straight through. Exported for the test suite.
export function scrubParties(parties: ArticleParty[] | undefined): ArticleParty[] {
  return (parties || []).filter((p) => {
    if (!p || !p.name) return false
    if (NON_TRADABLE_PARTY_RE.test(p.name)) return false
    return isCompanyName(p.name)
  })
}

/** Copy a usable brief's fields onto the enrichment (denylist-scrubbed), one implementation for the
 *  direct, filing-document, alternate-outlet, and corroboration read paths. Returns false — and writes
 *  nothing — when the brief carries no real signal (the caller then keeps its fallback). */
function applyBrief(result: EventEnrichment, brief: ArticleBrief | null): boolean {
  if (!brief) return false
  if (!(brief.gist.length || brief.companies.length || brief.beneficiaries.length || brief.exposed.length || brief.news_impact?.analyst_takeaway)) return false
  if (brief.gist.length) result.gist = brief.gist
  if (brief.market_angle) result.market_angle = brief.market_angle
  const co = filterCompanies(brief.companies) // denylist safety-net on top of the prompt rule
  if (co.length) result.companies = co
  const ben = scrubParties(brief.beneficiaries)
  if (ben.length) result.beneficiaries = ben
  const exp = scrubParties(brief.exposed)
  if (exp.length) result.exposed = exp
  if (brief.whats_priced) result.whats_priced = brief.whats_priced
  if (brief.the_edge) result.the_edge = brief.the_edge
  if (brief.watch_item) result.watch_item = brief.watch_item
  if (brief.theme) result.theme = brief.theme
  // carried through whenever the model actually produced an impact verdict — a "neutral/low/no numbers"
  // read for a routine notice IS the correct, decision-useful answer, not a gap to paper over. When the
  // model OMITTED news_impact (older/partial schema), coerceArticleBrief leaves it absent, so this stays
  // unset rather than caching a synthesized fake low-impact verdict.
  if (brief.news_impact) result.news_impact = brief.news_impact
  return true
}

/** Other approved outlets carrying the SAME story (the server-stamped dedup cluster), for the
 *  alternate-outlet read when the original page blocks us. Distinct registrable hosts only, the blocked
 *  publisher excluded, `social` chatter excluded (§4/§24 — never a story source), best triage score
 *  first. Exported for the test suite. */
export function findAlternateSources(
  feedItems: { event_id: string; dedup_group?: string; url?: string; source_name?: string; source_tier?: string; snippet?: string; headline?: string; triage_score?: number }[],
  selfId: string,
  dedupGroup: string,
  excludeHost: string,
): { url: string; domain: string; source_name: string; snippet: string; headline: string }[] {
  if (!dedupGroup) return []
  const ex = (excludeHost || '').toLowerCase().replace(/^www\./, '')
  const seenHosts = new Set<string>()
  const out: { url: string; domain: string; source_name: string; snippet: string; headline: string }[] = []
  const cands = (feedItems || [])
    .filter((it) => it && it.dedup_group === dedupGroup && it.event_id !== selfId && it.url && (it.source_tier || '') !== 'social')
    .sort((a, b) => (Number(b.triage_score) || 0) - (Number(a.triage_score) || 0))
  for (const it of cands) {
    const u = String(it.url || '')
    if (!isSafeFetchUrl(u)) continue
    let h = ''
    try { h = new URL(u).hostname.toLowerCase() } catch { continue }
    const hh = h.replace(/^www\./, '')
    if (!hh || hh === ex || hh.endsWith('.' + ex) || ex.endsWith('.' + hh)) continue // not the blocked publisher itself
    if (seenHosts.has(hh)) continue
    seenHosts.add(hh)
    out.push({ url: u, domain: hh, source_name: String(it.source_name || ''), snippet: String(it.snippet || ''), headline: String(it.headline || '') })
  }
  return out.slice(0, 4)
}

// ---- corroboration: when the publisher blocks the direct read, piece the event together from the wire ----

/** The N most distinctive (longest, non-stopword, non-form-code) tokens in a headline — the words that
 *  actually identify THIS event, for a precise corroboration query (no scaffolding words). */
function distinctiveTokens(headline: string, n: number): string[] {
  const toks = String(headline || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w) && !SEC_FORM_TOKENS.has(w) && (w.length >= 4 || SHORT_TOPICS.has(w)))
  return [...new Set(toks)].sort((a, b) => b.length - a.length).slice(0, n)
}

/** Does a secondary headline plausibly describe the SAME event as the original? The GDELT keyword query is
 *  loose (it matches article BODIES over a 14-day window), so it readily returns a DIFFERENT story about the
 *  same company (an earnings piece for a lawsuit event) or a same-topic story about a different entity (an
 *  ECB story for a Fed story). Corroborating on those fabricates cross-outlet confidence the engine never
 *  earned (§3). So gate every returned title: it must share THIS event's distinctive words, anchored to the
 *  named company when there is one. Strict on purpose — a missed corroboration just falls back to the honest
 *  floor, while a false one is a fabricated source. */
export function corroboratesSameEvent(headline: string, companies: CompanyGuess[], title: string): boolean {
  const tl = String(title || '').toLowerCase()
  if (tl.length < 16) return false
  const titleWords = tl.replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
  // a title word "matches" a target if equal, or one is a full prefix of the other with the shorter ≥5 chars
  // (so "international"≈"internationally", "disclosure"≈"disclosures" — but NOT "interest"≈"international",
  // which only share a generic prefix). Catches plural/adverb variants without loose prefix collisions.
  const wordMatches = (target: string) => titleWords.some((w) => w === target || (Math.min(w.length, target.length) >= 5 && (w.startsWith(target) || target.startsWith(w))))
  const companyWords = new Set((companies || []).flatMap((c) => String(c?.name || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)).filter((w) => w.length >= 4 && !STOP_WORDS.has(w)))
  // event-defining words = the headline's distinctive tokens MINUS the company's own words, so the company
  // name alone can NEVER satisfy the event-word test (that was the lawsuit-vs-earnings hole: both share
  // "Tilray", neither shares the actual event).
  const tokenHits = distinctiveTokens(headline, 8).filter((tok) => !companyWords.has(tok) && wordMatches(tok)).length
  const names = (companies || []).map((c) => c?.name).filter((nm): nm is string => isCompanyName(nm))
  if (names.length) {
    // a corroborating outlet must name the same company AND share a (non-company) event word
    const companyHit = names.some((nm) => {
      const key = nm.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
      if (!key) return false
      // long / multi-word names: a substring hit is safe. A SHORT single-word name (e.g. "ITC", "TCS") must
      // hit as a WHOLE WORD so a 3-letter name can't coincidentally match inside an unrelated word
      // ("itc" ⊂ "switch", "bp" ⊂ "bpcl"). companyWords (≥4 chars) already match at word level via wordMatches.
      const nameHit = key.length >= 5 || key.includes(' ') ? tl.includes(key) : titleWords.includes(key)
      return nameHit || [...companyWords].some(wordMatches)
    })
    return companyHit && tokenHits >= 1
  }
  return tokenHits >= 2 // no named entity (macro/topic event): require a real topical overlap, not one stray word
}

/** A GDELT free-text query that targets THIS event: the named companies (quoted, precise) plus a distinctive
 *  headline token or two. Empty when there's nothing distinctive enough — we'd rather not corroborate at all
 *  than pull random same-topic noise and pass it off as this story. */
function buildCorroborationQuery(headline: string, companies: CompanyGuess[]): string {
  const names = (companies || []).map((c) => c?.name).filter((nm): nm is string => isCompanyName(nm)).slice(0, 2)
  const quoted = names.map((nm) => `"${nm.replace(/["\\]/g, '').trim().slice(0, 48)}"`).filter((q) => q.length > 2)
  if (quoted.length >= 2) return quoted.join(' ')
  if (quoted.length === 1) {
    const extra = distinctiveTokens(headline, 2).filter((t) => !quoted[0].toLowerCase().includes(t))
    return [quoted[0], ...extra.slice(0, 1).map((t) => `"${t}"`)].join(' ')
  }
  const toks = distinctiveTokens(headline, 4)
  return toks.length >= 2 ? toks.slice(0, 3).map((t) => `"${t}"`).join(' ') : ''
}

/** Ask the wire who ELSE is reporting this event (GDELT keyword search), filtered to OTHER outlets than the
 *  one that blocked us, one article per outlet (breadth across outlets = corroboration strength). Never
 *  throws; returns [] on any failure (the caller then keeps the deterministic floor). */
async function corroborateFromWire(headline: string, companies: CompanyGuess[], excludeHost: string, deps: EnrichDeps, budgetMs: number): Promise<RawArticle[]> {
  if (!deps.corroborate?.enabled || !deps.corroborate.baseUrl) return []
  if (budgetMs < 1500) return [] // not enough wall-clock left in the reader's budget to corroborate
  const query = buildCorroborationQuery(headline, companies)
  if (!query) return []
  let arts: RawArticle[] = []
  try {
    // bound the GDELT probe by BOTH its own timeout and what remains of the shared read budget
    const timeoutMs = Math.min(deps.corroborate.timeoutMs ?? 6000, budgetMs)
    arts = await fetchGdeltDoc(query, { baseUrl: deps.corroborate.baseUrl, timeoutMs, maxRecords: 25, lookbackMin: 20_160 }, { fetchFn: deps.fetchFn })
  } catch { return [] }
  const ex = (excludeHost || '').toLowerCase().replace(/^www\./, '')
  const byDomain = new Map<string, RawArticle>()
  for (const a of arts) {
    const d = (a.domain || '').toLowerCase().replace(/^www\./, '')
    const title = (a.title || '').trim()
    if (!d || title.length < 16) continue
    if (ex && (d === ex || d.endsWith('.' + ex) || ex.endsWith('.' + d))) continue // not the blocked publisher itself
    if (!corroboratesSameEvent(headline, companies, title)) continue // SAME-EVENT GATE: drop different-event noise the loose query pulled in (§3)
    if (!byDomain.has(d)) byDomain.set(d, { ...a, title })
  }
  return [...byDomain.values()].slice(0, 8)
}

/** The synthetic "body" fed to the read chain: the secondary headlines, clearly labelled as corroboration so
 *  the model states only facts that recur across them and invents nothing (the ARTICLE_SYSTEM rule that every
 *  number must appear in the body does the rest). */
function buildCorroborationBody(headline: string, secondaries: RawArticle[]): string {
  const lines = secondaries.map((s) => `- [${s.domain}] ${s.title}`).join('\n')
  return `The original publisher's page could not be read. Below are headlines from OTHER news outlets reporting the SAME event, gathered for corroboration. Treat these as the only source text: state only facts that appear here, and invent nothing.\n\nORIGINAL HEADLINE: ${headline}\n\nSECONDARY REPORTS (other outlets, same event):\n${lines}`
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
  // TTL is quality-aware: a COMPLETE read is served for 12h; a DEGRADED one expires in ~90s so the next open
  // re-runs the real article read instead of freezing a useless dek for half a day (the reported bug).
  if (!deps.force && hit && Date.now() - new Date(hit.fetched_at).getTime() < ttlFor(hit)) return hit

  // Prefer the event's OWN stored record (url + companies) from the firehose over the client-supplied
  // values — a client must not be able to point enrichment at an arbitrary page or poison the shared
  // cache for an event_id. Fall back to the client input only when the event has aged out of the
  // 2-day firehose window.
  let url = (input.url || '').trim()
  let companies = input.companies || []
  let event_types = input.event_types || []
  let scope = input.scope
  let headline = (input.headline || '').trim()
  let headlineEn: string | null = null // English translation of a non-English headline (news/lang.ts), from the stored record
  let snippet = '' // the feed's own lede (RSS) — a fetch-free body when the source page blocks us
  // carried so the story floor can tell a regulatory/exchange filing (headline IS the disclosure) from
  // an article (body is the story) — see story-floor.ts. Pulled from the event's OWN stored record.
  let inputNature = ''
  let sourceTier = ''
  let sourceName = ''
  let dedupGroup = '' // the story-cluster id — other outlets carrying the SAME story (alternate-outlet read)
  let feedItems: ReturnType<typeof readFeed>['items'] = []
  try {
    feedItems = readFeed(deps.repoRoot, 2, { now, maxItems: 2000 }).items
    const stored = feedItems.find((it) => it.event_id === input.event_id)
    if (stored) {
      dedupGroup = (stored as any).dedup_group || ''
      url = (stored.url || '').trim()
      companies = stored.companies || companies
      event_types = stored.event_types || event_types
      scope = (stored as any).scope || scope
      headline = cleanText(stored.headline) || headline // the stored headline is authoritative + cleaned
      headlineEn = (stored as any).headline_en ? cleanText((stored as any).headline_en) || null : null
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
  const filingInput = { headline, headline_en: headlineEn, url, snippet, input_nature: inputNature, source_tier: sourceTier, source_name: sourceName, domain: host, companies }
  const filing = isFilingEvent(filingInput)
  // …but only a BSE/NSE exchange filing or a PDF/attachment is genuinely body-LESS. A regulator press
  // release (FCA / SEC press / etc.) is a readable article — still read its body. So we skip the read
  // only for these, and let every other "filing" fall through to a normal body read.
  const bodylessFiling = filing && (/(^|\.)(bseindia|nseindia)\.com$/.test(host) || /\.(?:pdf|xlsx?|docx?|zip)(?:[?#]|$)/i.test(url))
  // The cover-page LETTERHEAD that must never outrank the headline floor (the Adani-QIP defect) is a BSE/NSE
  // phenomenon — page 1 is the issuer's registered address / CIN / scrip codes, not the disclosure. A direct
  // PDF on ANOTHER exchange (HKEXnews / ASX FILE_LINK) opens with the REAL announcement, so only the Indian-
  // exchange HOST is letterhead-prone. Scoping the attachment signal to the host (NOT every .pdf, which
  // `bodylessFiling` also catches) keeps a successfully-read HKEX/other PDF body from being discarded for a
  // generic headline floor — the floor is a last resort; the filing document is the primary source (§4).
  const letterheadProneFiling = filing && /(^|\.)(bseindia|nseindia)\.com$/.test(host)
  // SEC item parsing applies ONLY to an actual EDGAR filing INDEX page — sec.gov press releases /
  // litigation bulletins are ordinary articles and fall through to the summary extractor.
  const isSec = /(^|\.)sec\.gov$/.test(host) && /\/Archives\/edgar\//i.test(url) && /-index\.html?($|[?#])/i.test(url)
  // The form code is RIGHT THERE in an EDGAR feed title ("424B2 - GOLDMAN SACHS GROUP INC (CIK) (Filer)"),
  // so we can explain the filing with zero fetch — the floor when SEC.gov rate-limits the index page (it
  // does, hard). Gated on the source actually being SEC EDGAR (§27: this dictionary is US-SEC-only).
  const isEdgarSource = /(^|\.)sec\.gov$/.test(host) || /edgar/i.test(sourceName)
  const headlineSec = isEdgarSource ? secFromHeadline(headline) : undefined

  // FILING DOCUMENT first: when the URL resolves to the real disclosure — the ASX viewer's documentKey
  // (its HTML page is a terms interstitial, never an article) or a direct PDF (HKEX/NSE/BSE attach the
  // disclosure as one) — read THAT. The document is the primary source (§4); the page around it is a
  // viewer shell at best, and the old path either leaked the interstitial text or fell to the floor.
  const docRef = resolveFilingDocUrl(url)
  let docText = ''
  let docNote = ''
  if (docRef) {
    const d = await fetchFilingDocText(docRef.docUrl, { fetchFn, timeoutMs: FETCH_TIMEOUT_MS })
    if (d.ok && d.text) docText = d.text
    else docNote = d.note || 'filing document unavailable'
  }

  // Fetch the source page (best effort). A block (403 / paywall / JS-rendered shell) is NOT fatal:
  // most of the wire is RSS, and the feed's own lede (`snippet`) gives the body read a fetch-free input.
  // When the URL resolved to a document there is no article PAGE to fetch at all — the ASX page is a
  // consent interstitial and a .pdf link isn't HTML — so we skip the page fetch instead of "reading" it.
  let pageHtml = ''
  let fetchNote = ''
  if (!url) fetchNote = 'no source link to fetch'
  else if (docRef) fetchNote = docText ? '' : docNote
  else if (!isSafeFetchUrl(url)) fetchNote = 'source is off the approved list — not fetched'
  else {
    const r = await fetchText(url, fetchFn)
    if (r.ok && r.text) pageHtml = r.text
    else fetchNote = r.note || 'source blocked'
  }

  let attempted = false // did a provider actually RUN the LLM body read this call? (drives read_attempts; a skip is false)
  let bodyReadable = false // was there enough body text to ever produce a read? (false → converge to floor, don't churn)
  if (isSec && pageHtml) {
    // an EDGAR filing index: the parsed item block IS the meaning; its page "summary" is header boilerplate.
    // Annotate the parsed form with its plain-English meaning; if the index didn't parse, fall back to the
    // headline-derived form (the title still carries the code), then to a raw summary.
    const sec = parseSecFiling(pageHtml)
    if (sec) {
      const annotated = annotateSecForm(sec)
      // parseSecFiling's form regex stops at the first space, so a multi-word code ("SC 13D", "DEF 14A",
      // "NT 10-K") parses to just its first token ("SC") — which has no dictionary meaning. The EDGAR
      // headline carries the FULL code, so when the page parse yielded no meaning but the headline did,
      // take the headline's form + meaning and KEEP the page-only fields (items / period / filed).
      result.sec = !annotated.form_meaning && headlineSec?.form_meaning
        ? { ...annotated, form: headlineSec.form, form_label: headlineSec.form_label ?? annotated.form_label, form_meaning: headlineSec.form_meaning, routine: headlineSec.routine }
        : annotated
    } else if (headlineSec) result.sec = headlineSec
    else { const s = extractSummary(pageHtml); if (s) result.summary = s }
  } else if (headlineSec) {
    // an EDGAR filing whose index page we couldn't fetch (SEC.gov rate-limited us) — the headline still
    // carries the form code, so the reader STILL gets "What was filed" + a plain-English meaning instead of
    // a bare "couldn't open the body". A filing has no article body to read, so we stop here.
    result.sec = headlineSec
  } else {
    // What IS this page? A consent/terms interstitial or a paywall stub must never be treated as prose —
    // not as the LLM body, not as the fallback summary, not even as the "Published" date (the reported
    // defect: the ASX terms dialog + a stale meta date shown as THE STORY). The <p>-level read carries a
    // verdict; when a template hides its prose outside <p> tags we de-chrome the whole page and junk-test
    // THAT text too, so a <div>-built consent wall can't sneak in through the fallback either.
    const pageRead = pageHtml ? extractArticleText(pageHtml) : { text: '', verdict: 'empty' as PageTextVerdict }
    let pageVerdict = pageRead.verdict
    let pageBody = ''
    if (pageHtml) {
      if (pageRead.verdict === 'ok') pageBody = pageRead.text
      else if (pageRead.verdict === 'empty') {
        const full = cleanText(pageHtml.replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, ' ').replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, ' '))
        const c = classifyParagraphs(full.split(/(?<=[.!?])\s+/).filter((seg) => seg.length >= 40))
        if (c.verdict === 'ok') pageBody = c.kept.join(' ').slice(0, 4000)
        else if (c.verdict !== 'empty') pageVerdict = c.verdict
      }
    }
    const pageJunk = !!pageHtml && !pageBody && (pageVerdict === 'interstitial' || pageVerdict === 'paywall')
    if (pageHtml && !pageJunk) { const pub = extractPublished(pageHtml); if (pub) result.published = pub }
    if (pageJunk && !fetchNote) {
      fetchNote = pageVerdict === 'paywall'
        ? 'the page is behind a subscription wall — no article body'
        : 'the page served a consent/terms interstitial — no article body'
    }
    // the body for the read: the feed's lede + the best real text we hold — the filing DOCUMENT's own
    // words when the URL resolved to one (the primary source), else the fetched article text.
    const body = [snippet, docText || pageBody].filter(Boolean).join('\n\n').trim()
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
    // Is there enough text to ever feed an LLM read? An off-list / unfetchable page with no usable RSS lede,
    // or a body too thin to read, can NEVER produce a brief — retrying is pointless, so we converge it to the
    // floor below instead of letting the heal pass re-fetch it forever (≈ the analyzeArticle min-body bar).
    bodyReadable = body.replace(/\s+/g, ' ').trim().length >= 80
    // ONE wall-clock budget for ALL the LLM work on this open — the direct read AND any corroboration read,
    // plus the GDELT probe between them — so the total can never exceed what the client waits for. A fresh
    // budget per leg would stack (direct 14s + GDELT 6s + corroboration 14s ≈ over the client's 28s abort,
    // which would discard the very work corroboration just paid for). Both reads + the probe draw from this.
    const readDeadline = now().getTime() + (deps.llmBudgetMs ?? 14_000)
    // give the reader the English headline as its hint when we have one (the body is in the source
    // language; the brief comes back in English either way) — a clearer anchor, no behaviour change for English
    const readHeadline = headlineEn || headline
    // what the no-LLM fallback may lead with: the filing document's own opening beats the RSS lede beats
    // the floor — all real text, never chrome (a junk page contributes NOTHING to the fallback).
    // Keep a wider window than the final 600-char output: a BSE/NSE cover-page letterhead can run past 600
    // chars before its "Sub:/Ref:" boundary, and stripLetterhead (below, via bestFallbackSummary) needs to see
    // that boundary to isolate the real body — slicing to 600 here would cut it off first (Codex review on
    // #189). bestFallbackSummary truncates the FINAL chosen candidate to 600, so nothing downstream regresses.
    const fallbackLede = docText ? docText.replace(/\s+/g, ' ').trim().slice(0, 4000) : snippet
    const fallbackHtml = pageJunk ? '' : pageHtml
    const bodylessNoDoc = bodylessFiling && !docText // a filing is truly bodyless only when its document didn't read
    let brief: ArticleBrief | null = null
    if (body && !bodylessNoDoc && providers.length) {
      const r = await readArticleBrief(body, readHeadline, providers, {
        stateDir: deps.stateDir,
        fetchFn,
        sleep: deps.sleep,
        now: () => now().getTime(),
        deadlineMs: readDeadline,
        limiterWaitMs: deps.limiterWaitMs,
        cooldownMs: deps.cooldownMs,
        cooldownMaxMs: deps.cooldownMaxMs,
      })
      brief = r.brief
      // count this toward read_attempts ONLY if a provider actually ran an LLM call. A SKIP (all providers
      // rate-limited / out of daily budget / past the deadline) is transient — counting it would let
      // MAX_READ_ATTEMPTS freeze a readable article on the dek under the exact saturation that caused the bug.
      attempted = r.attempted
    }
    if (applyBrief(result, brief)) {
      // the brief was read from the filing document itself — label the provenance so the reader knows
      // the story is the announcement's own words, not the (interstitial) page around it (§3/§5)
      if (docText && docRef) result.read_from = { kind: 'filing_doc', url: docRef.docUrl }
      // read succeeded but produced no gist bullets → back it with the most substantial text we hold, never blank.
      // For a BSE/NSE cover-page filing the document opening is letterhead, which must never outrank the headline
      // floor (see bestFallbackSummary); pass the letterhead-prone signal (the Indian-exchange HOST), NOT every
      // .pdf — an HKEX/ASX doc opens with the real announcement, not letterhead, so its content must still compete.
      if (!brief!.gist.length) result.summary = bestFallbackSummary(fallbackHtml, fallbackLede, filingInput, bodylessNoDoc, letterheadProneFiling)
    } else {
      // NO readable body (a PDF/attachment filing, a JS shell, a paywall, an off-list link) OR the LLM read
      // momentarily missed. Guarantee a meaningful, accurate THE STORY rather than a raw fetch error — and
      // prefer the MOST substantial real text we hold (the filing document's opening, else the RSS lede over
      // the vague og:description dek), then the deterministic floor (never empty, never fabricated). The raw
      // fetch reason is demoted to a hint.
      result.summary = bestFallbackSummary(fallbackHtml, fallbackLede, filingInput, bodylessNoDoc, letterheadProneFiling)
      if (fetchNote) result.note = fetchNote
    }

    // ALTERNATE OUTLET — the original page blocked the read (bot-wall / paywall / consent interstitial /
    // JS shell) but the wire already carries the SAME story from other outlets (the dedup cluster the
    // feed stamps). Do what a human does when a page won't open: read another outlet's article — a FULL
    // body read of the same story, honestly labelled with where it was read from (§3/§5). Runs inside
    // the same wall-clock budget as the direct read; skipped the moment a real brief exists.
    const directBlocked = !docText && (pageJunk || !!fetchNote || !bodyReadable)
    if (!(result.gist && result.gist.length) && !bodylessNoDoc && directBlocked && providers.length) {
      for (const alt of findAlternateSources(feedItems, input.event_id, dedupGroup, host).slice(0, 2)) {
        // SAME-EVENT gate, belt and braces on top of the tight dedup cluster: the alternate's own
        // headline must describe THIS event (same test the GDELT corroboration path applies), so even a
        // transitively mis-clustered sibling can never be read and presented as this story (§3/§5).
        if (!corroboratesSameEvent(headline, companies, alt.headline)) continue
        const remaining = readDeadline - now().getTime()
        if (remaining < 4000) break // must leave room for the LLM pass after the fetch
        const rf = await fetchText(alt.url, fetchFn, Math.min(FETCH_TIMEOUT_MS, remaining - 2500))
        if (!rf.ok || !rf.text) continue
        const at = extractArticleText(rf.text)
        if (at.verdict !== 'ok' || at.text.length < 200) continue // the alternate must be genuinely readable prose
        const r = await readArticleBrief([alt.snippet, at.text].filter(Boolean).join('\n\n'), readHeadline, providers, {
          stateDir: deps.stateDir, fetchFn, sleep: deps.sleep,
          now: () => now().getTime(), deadlineMs: readDeadline, limiterWaitMs: deps.limiterWaitMs,
          cooldownMs: deps.cooldownMs, cooldownMaxMs: deps.cooldownMaxMs,
        })
        if (r.attempted) attempted = true
        if (applyBrief(result, r.brief)) {
          result.read_from = { kind: 'alternate', domain: alt.domain, url: alt.url, source_name: alt.source_name }
          result.note = `original page blocked — read from ${alt.source_name || alt.domain}, which carries the same story`
          const pub = extractPublished(rf.text)
          if (pub && !result.published) result.published = pub
          break
        }
      }
    }

    // CORROBORATION — no direct body could be read at all (no page prose, or the page was a consent/
    // paywall wall), no alternate outlet produced a read either (result.read_from unset — a successful
    // alternate read, even a gist-less DIGEST-RULE one, is a COMPLETE direct read of the story and must
    // not be papered over with headline synthesis), and this is a real article (not a bodyless filing)
    // with no brief. Ask the wire "who ELSE is reporting this?" (GDELT keyword search), gather the
    // secondary headlines, and synthesise the story FROM THEM — honestly flagged, never passed off as a
    // direct read (CLAUDE.md §3). Deliberately NOT gated on a mere fetchNote: a blocked page whose RSS
    // snippet is readable gets its LLM read retried on the next open (degraded TTL), not a GDELT probe —
    // headline synthesis must never displace a readable snippet over a transient LLM miss.
    if ((!bodyReadable || pageJunk) && !result.read_from && !bodylessNoDoc && !(result.gist && result.gist.length) && deps.corroborate?.enabled) {
      const secondaries = await corroborateFromWire(headline, companies, host, deps, readDeadline - now().getTime())
      if (secondaries.length >= 2) {
        const domains = [...new Set(secondaries.map((s) => s.domain.toLowerCase().replace(/^www\./, '')).filter(Boolean))].slice(0, 6)
        // synthesise a real brief from the secondary headlines (same LLM chain, same anti-fabrication rules,
        // same shared deadline so the whole on-demand read stays inside one wall-clock budget)
        if (providers.length) {
          const r = await readArticleBrief(buildCorroborationBody(headline, secondaries), readHeadline, providers, {
            stateDir: deps.stateDir, fetchFn, sleep: deps.sleep,
            now: () => now().getTime(), deadlineMs: readDeadline, limiterWaitMs: deps.limiterWaitMs,
            cooldownMs: deps.cooldownMs, cooldownMaxMs: deps.cooldownMaxMs,
          })
          if (r.attempted) attempted = true
          applyBrief(result, r.brief)
        }
        // record corroboration so the UI labels it honestly; if the LLM couldn't synthesise (no budget), show
        // a real, sourced fallback that names the outlets — but ONLY when we hold nothing better: a readable
        // snippet lede is real article text and must never be displaced by this generic stub.
        result.corroborated = { count: secondaries.length, domains }
        if (!(result.gist && result.gist.length) && !bodyReadable) {
          result.summary = `The publisher blocked the direct read. ${secondaries.length} other outlet${secondaries.length === 1 ? '' : 's'} are reporting this${domains.length ? ` — ${domains.slice(0, 4).join(', ')}` : ''}. Open the source, or run the checks to read it in full.`
        }
        result.note = 'publisher blocked the direct read — corroborated from the secondary wire'
      }
    }
  }

  // FINAL GUARANTEE: the reader must NEVER see an empty or error-only story. If no section produced
  // renderable content (an unforeseen branch, an EDGAR page that parsed to nothing), synthesize the floor.
  if (!result.sec && !(result.gist && result.gist.length) && !(result.summary && result.summary.trim())) {
    result.summary = storyFloor(filingInput).summary
  }

  // A filing's floor / an SEC parse / a bodyless event is the BEST obtainable read (the headline IS the
  // disclosure) — mark it complete so it earns the long TTL and the heal pass never re-reads it. A readable
  // article that yielded a brief is complete via isEnrichmentComplete; one that didn't stays degraded
  // (short TTL → self-heals) until MAX_READ_ATTEMPTS, which commitEnrichment then accepts as final. A
  // filing whose DOCUMENT text did read (docText) is no longer bodyless: if its LLM read missed it stays
  // degraded so the very next open retries the real read instead of freezing the floor.
  if (result.sec || (bodylessFiling && !docText)) result.complete = true
  // A NON-filing article with no readable body to feed an LLM (off-list / unfetchable page AND no usable
  // snippet, or a body too thin to read) can never produce a brief — the deterministic floor IS the best
  // obtainable read, so accept it as final NOW. Without this the entry never reaches MAX_READ_ATTEMPTS (a
  // no-body read is a skip, not an attempt) and the heal pass + on-demand reopens churn it forever. A
  // transient SKIP differs: there the body IS readable, so this doesn't fire — it stays degraded and retries.
  else if (!bodyReadable && !isEnrichmentComplete(result)) result.complete = true

  // Commit through the no-clobber + attempt-bookkeeping guard (never overwrite a fresh good read with a
  // degraded one; bound retries). Returns the entry actually stored, which is what the client sees.
  return commitEnrichment(deps.stateDir, input.event_id, result, attempted)
}
