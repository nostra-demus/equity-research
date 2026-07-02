// Shared, dependency-free text-matching helpers for the news layer: company-name normalization and
// the "meaningful topic tokens" of a headline. These decide whether two news items are ACTUALLY about
// the same thing (vs sharing a coarse tag), and they're the join keys the themes layer (assign.ts)
// uses to bucket items into themes and to draw theme↔theme edges. Kept separate (not in enrich.ts) so
// the themes engine reuses the exact same matching logic without importing the heavyweight enrichment
// module. Pure + deterministic; same vocabulary the enrichment "related events" finder uses.

import type { CompanyGuess } from './types'
import { isCompanyName } from './entities'
import { SEC_FORM_TOKENS, lookupSecForm, parseEdgarFilingHeadline } from './sec-forms'

/** Uppercased, trimmed ticker — the exact-match key. */
export const tickerKey = (t?: string | null): string => String(t || '').trim().toUpperCase()

/** Lowercased company name with corporate suffixes + punctuation stripped — the fuzzy join key
 *  ("Asian Paints Limited" and "ASIAN PAINTS LTD." → "asianpaints"). */
export const normName = (s?: string | null): string =>
  String(s || '')
    .toLowerCase()
    .replace(/\b(inc|corp|corporation|ltd|limited|plc|llc|co|company|holdings|group|sa|ag|nv|the)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()

// A real English stoplist (function words + light verbs + news/finance scaffolding). A headline overlap
// built only from these would relate everything. Distinctive topic words — places, people, products,
// "nuclear", "tariff", "quantum" — are deliberately NOT here, so they still anchor a match.
const STOP_WORDS = new Set(
  (
    'the a an and or but for nor so yet of to in on at by as is are was were be been being am ' +
    'with from into onto over under after before amid among between within without across through during ' +
    'this that these those it its they them their there here what when where which who whom whose why how ' +
    'i you he she we us our your his her my mine ours yours hers him me ' +
    'will would shall should can could may might must do does did done has have had having not no ' +
    'make makes making made take takes taking took get gets getting got go goes going gone went come comes coming came ' +
    'say says said see sees seeing saw seen use uses using used want wants need needs keep keeps put puts set sets ' +
    'find finds show shows tell tells ask asks turn turns help helps move moves give gives gave knowing know knows ' +
    'paying pays paid eyes eyeing seeking seek seeks plan plans planning back ' +
    'new old big small good bad high low long short full early late best top more most less least many much few ' +
    'first last next other another same different such very just only also even still about around near nearly ' +
    'up down out off than then now soon later again over major minor key main ' +
    'year years week weeks month months day days today quarter data news report reports update updates live ' +
    'global market markets stock stocks share shares firm firms group price prices cost costs percent pct rate rates ' +
    'two three four five ten billion bn million mn trillion crore lakh says brand place lesson promises proverb ' +
    // corporate-name suffixes (already stripped from company keys, but they leak in as headline tokens —
    // "XYZ Limited" — and over-cluster everything; never a real topic anchor)
    'limited ltd inc corp corporation plc llc holdings holding industries enterprises technologies technology ' +
    'solutions international company companies group co sa ag nv bhd berhad pvt private public ' +
    // exchange / regulatory FILING boilerplate (NSE/BSE/SEC) — the action scaffolding, not the subject
    'informed exchange intimation intimations regarding pursuant regulation regulations disclosure disclosures ' +
    // SEC EDGAR role tags — every "getcurrent" feed title ends in "(Filer)"; these would otherwise be a
    // universal magnet chaining every filer's routine prospectus into one fake theme (form codes like
    // "424b2" are handled separately via SEC_FORM_TOKENS, since they carry digits)
    'filer filers registrant ' +
    'compliance certificate submission outcome board meeting meetings announcement announcements filing filings ' +
    'filed notice notices copy newspaper publication scrutinizer voting agm egm postal ballot circular letter ' +
    'sebi lodr nse bse act reg under regulation76 schedule annexure ' +
    // finance / corporate-action filing generics (chain unrelated small-cap filings together)
    'order orders secures secured against dated recovery certain approved approval raising raise raises ' +
    'fund funds funding capital director directors shareholder shareholders allotment preferential issue ' +
    'records record transfer winning awarded receives received gets signs signing pact agreement deal deals ' +
    'listing obligations defaulter defaulters entities entity suspension suspended debarred relief managers ' +
    'trading activities special general notice meeting postal correction clarification withdrawal ' +
    // earnings-calendar / scheduled-disclosure boilerplate ("Company X Announces Q2 2026 Earnings Release
    // Date", NSE/BSE "board meeting — Financial Results" intimations) — a hugely common global press-
    // release pattern; two UNRELATED companies' routine calendar notices share several of these words
    // despite having zero real topic in common (the exact "Domino's · announces" theme-poisoning bug:
    // STOP_WORDS already dropped the noun "announcement" but not the verb forms, and "board"/"meeting"
    // but not the earnings-specific nouns). "first" is already covered above (line 39, ordinals).
    'announce announces announcing announced host hosts hosting discuss discusses discussing ' +
    'schedules scheduled scheduling earnings results result financial fiscal release releases ' +
    'date dates webcast call calls conference second third fourth ' +
    // HTML / feed artifacts + filler
    'href hreflang https http www html amp nbsp span div utm matter various respect behalf thereof inter alia'
  ).split(/\s+/),
)
// short-but-meaningful topic anchors (skipped by the ≥4-char rule but worth matching on)
const SHORT_TOPICS = new Set(['oil', 'gas', 'war', 'tax', 'fed', 'ecb', 'boj', 'rbi', 'fta', 'cpi', 'gdp', 'ppi', 'wpi', 'pmi', 'yen', 'ipo', 'ai', 'ev', '5g', '6g'])

// Bounded suffix-stripping so the NEXT regular verb/noun inflection of an already-stopworded word (the
// exact way "announces" slipped past the literal "announcement" entry) is caught without hand-listing
// every form. Longest-match-first; only strips when the remaining stem is still ≥4 chars, so short real
// words (e.g. "boeing", 6 chars, "-ing" would leave a 3-char stem) are never touched — a structural
// guarantee, not a word-list judgment call. Never applied to company names (companyKeys / the companies
// loop below) — a stemmed company name must never accidentally collide with a stopword.
const SUFFIXES: Array<[string, number]> = [['ing', 3], ['ed', 2], ['es', 2], ['s', 1]]
function stem(w: string): string | null {
  for (const [suf, len] of SUFFIXES) {
    if (w.length - len >= 4 && w.endsWith(suf)) return w.slice(0, -len)
  }
  return null
}

/** The set of meaningful topic tokens in a headline (+ the guessed company names/tickers) — the test
 *  for whether two events are about the same thing, not just sharing a coarse theme tag. Country/agency
 *  "company" guesses (e.g. "China") are excluded so they don't cluster the wire. */
export function topicTokens(headline?: string | null, companies?: CompanyGuess[] | null): Set<string> {
  const out = new Set<string>()
  for (const w of String(headline || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)) {
    if (!w || STOP_WORDS.has(w)) continue
    const st = w.length >= 4 ? stem(w) : null
    if (st && STOP_WORDS.has(st)) continue
    if (/^\d+$/.test(w)) continue // pure numbers (years, counts) never anchor a theme
    if (SEC_FORM_TOKENS.has(w)) continue // SEC form codes ("424b2", "defa14a") are not a topic — see sec-forms.ts
    if (w.length >= 4 || SHORT_TOPICS.has(w)) out.add(w)
  }
  for (const c of companies || []) {
    if (!isCompanyName(c?.name)) continue
    const n = normName(c?.name)
    if (n) out.add(n)
    if (c?.ticker) out.add(String(c.ticker).toLowerCase())
  }
  return out
}

/** The set of normalized company keys named in an item (companies only, no countries/agencies). */
export function companyKeys(companies?: CompanyGuess[] | null): Set<string> {
  const out = new Set<string>()
  for (const c of companies || []) {
    if (!isCompanyName(c?.name)) continue
    const n = normName(c?.name)
    if (n) out.add(n)
  }
  return out
}

/** |A ∩ B|. */
export function intersectionSize<T>(a: Set<T>, b: Set<T>): number {
  let n = 0
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  for (const x of small) if (large.has(x)) n++
  return n
}

/** Jaccard similarity |A∩B| / |A∪B| (0 when both empty). */
export function jaccard<T>(a: Set<T>, b: Set<T>): number {
  if (!a.size && !b.size) return 0
  const inter = intersectionSize(a, b)
  return inter / (a.size + b.size - inter)
}

// ── Theme-layer vocabulary (used ONLY via themeTokens, by themes/assign.ts + themes/discover.ts) ──
// These classes must NOT move into STOP_WORDS/topicTokens: story-level dedup (dedup.ts) shares
// topicTokens, and shrinking ITS token sets would falsely merge two DIFFERENT routine filings from the
// same company (both would reduce to {company} → jaccard 1.0, clearing the near-verbatim bar). Themes
// need the stricter vocabulary because membership matches on a handful of shared tokens, so calendar
// words and event vocabulary act as universal magnets chaining unrelated items — the live "Yes Bank Ltd"
// theme absorbing every SAST disclosure via {substantial, acquisition, takeovers}, the "annual results
// for the year ended 31 March" HKEX pile, and the 229-item "completes acquisition" M&A blob.
const THEME_NOISE_TOKENS = new Set(
  (
    // calendar scaffolding — "period ended 31 March", "AGM held on Monday". "may" is already a stopped
    // modal; 3-letter month abbreviations fall to the ≥4-char rule; bare years to the pure-number rule.
    'january february march april june july august september october november december sept ' +
    'monday tuesday wednesday thursday friday saturday sunday ' +
    'annual quarterly interim ended ending held ' +
    // corporate-event vocabulary — the event dimension is already structured (event_types +
    // event_type_affinity); as free-text tokens these chain every unrelated deal/exit/exit-notice
    // worldwide into one blob. All surface forms listed: themeTokens filters topicTokens' OUTPUT,
    // which keeps original (unstemmed) words. Deliberately KEPT as anchors: "ipo", "stake", "poll"
    // (election polls are genuine macro anchors — AGM polls are handled by the routine-filing gate),
    // sector nouns, and company names (immune below).
    'acquisition acquisitions acquire acquires acquired acquiring ' +
    'merger mergers merge merges merged merging ' +
    'completes completed completing completion ' +
    'takeover takeovers substantial tender proposed transaction transactions ' +
    'divest divests divested divesting divestment divestments divestiture divestitures ' +
    'offer offers offered offering offerings ' +
    'connected discloseable ' + // HKEX connected-transaction boilerplate
    'resign resignation resignations resigns resigned resigning'
  ).split(/\s+/),
)

// fy26 / cy2025 / 1q26 / h1fy26-style fiscal-period tokens never anchor a theme ("q1".."q4" alone are
// 2 chars and already dropped by the length rule).
const FISCAL_TOKEN_RE = /^(?:fy|cy|h[12]|[1-4]q)\d{2,4}$/

// High-volume regulatory paperwork that must never DEFINE a topic — it may join a theme only through a
// company match (see themeTokens). Headline patterns are tier-independent (HKEX/BSE notices also arrive
// via news adapters); the EDGAR form branch requires the primary_filing tier so an ordinary headline
// that merely starts with a form-shaped word is never misread.
const ROUTINE_FILING_RES: RegExp[] = [
  /\bdisclosures?\s+under\s+reg(?:ulation)?s?\.?\s*(?:29|31)\s*\(/i, // SAST Reg 29(1)/29(2) + pledge Reg 31(x)
  /substantial\s+acquisition\s+of\s+shares/i, // SAST long title
  /\bpoll\s+results?\s+of\s+the\s+(?:\d{4}\s+)?(?:annual|extraordinary|general)\b/i, // AGM/EGM poll results (HKEX + India) — NOT election exit polls ("exit poll results show…" stays a real macro anchor)
  /\bresults?\s+of\s+the\s+(?:annual|extraordinary)[\w\s',&]{0,60}meetings?\b/i, // "results of the annual (and extraordinary) general (shareholders') meeting(s)"
  /\b(?:(?:annual|interim|final|audited)\s+)?results?\s+(?:announcement\s+)?for\s+the\s+(?:year|six\s+months|three\s+months|nine\s+months|period)\s+end(?:ed|ing)\b/i, // HKEX results-notice title shape
  /\b(?:outcome|intimation|postponement|rescheduling)\s+of\s+(?:the\s+)?board\s+meeting\b|\bboard\s+meeting\s+intimation\b/i,
  /\bdelay\s+in\s+(?:the\s+)?(?:publication|despatch)\s+of\s+(?:the\s+)?(?:annual|interim|audited|financial|results?|report)/i, // results-calendar delay notices
  /\btrading\s+window\b/i, // trading-window closure/re-opening housekeeping
  /\bscrutini[sz]er'?s?\s+report\b/i,
  /\bshareholding\s+pattern\b/i, // quarterly shareholding-pattern filings
  /\bbook\s+closure\b/i,
  /\bacquisition\s+window\s*\(/i, // BSE "Offer to Buy – Acquisition Window (Takeover)" live-activity schedules
  /\bnewspaper\s+(?:advertisement|publication)s?\b/i,
]

/** Is this item high-volume regulatory paperwork (SAST/Reg 29 stake disclosures, AGM/EGM poll results,
 *  "results for the year ended" calendar notices, board-meeting intimations, routine EDGAR forms)?
 *  Routine filings may anchor their COMPANY's theme but must never define a topic — a hundred unrelated
 *  companies' Reg 29 disclosures share boilerplate words, not a narrative. */
export function isRoutineFiling(headline?: string | null, sourceTier?: string | null): boolean {
  const h = String(headline || '')
  if (ROUTINE_FILING_RES.some((re) => re.test(h))) return true
  if (String(sourceTier || '') === 'primary_filing') {
    const p = parseEdgarFilingHeadline(h)
    if (p && lookupSecForm(p.form)?.routine === true) return true
  }
  return false
}

/** Theme-layer topic tokens — what the themes engine matches and derives keywords from. Same as
 *  topicTokens minus calendar/event noise and fiscal-period tokens, minus the caller's corpus-generic
 *  set (the rolling document-frequency layer) — EXCEPT tokens derived from the item's own companies
 *  (normalized names + tickers), which always survive every suppression class (a hot company name must
 *  never be suppressed). A routine filing contributes its company tokens ONLY: it may anchor a company
 *  theme, never a topic. Dedup keeps the ungated topicTokens — it must still merge reposts of the same
 *  routine notice. */
export function themeTokens(headline?: string | null, companies?: CompanyGuess[] | null, sourceTier?: string | null, generic?: Set<string>): Set<string> {
  if (isRoutineFiling(headline, sourceTier)) return topicTokens(null, companies)
  const out = topicTokens(headline, companies)
  const immune = topicTokens(null, companies) // company-derived tokens (norm names + tickers)
  for (const t of out) {
    if (immune.has(t)) continue
    if (THEME_NOISE_TOKENS.has(t) || FISCAL_TOKEN_RE.test(t) || generic?.has(t)) out.delete(t)
  }
  return out
}
