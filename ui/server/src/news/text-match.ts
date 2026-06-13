// Shared, dependency-free text-matching helpers for the news layer: company-name normalization and
// the "meaningful topic tokens" of a headline. These decide whether two news items are ACTUALLY about
// the same thing (vs sharing a coarse tag), and they're the join keys the themes layer (assign.ts)
// uses to bucket items into themes and to draw theme↔theme edges. Kept separate (not in enrich.ts) so
// the themes engine reuses the exact same matching logic without importing the heavyweight enrichment
// module. Pure + deterministic; same vocabulary the enrichment "related events" finder uses.

import type { CompanyGuess } from './types'
import { isCompanyName } from './entities'

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
    'compliance certificate submission outcome board meeting meetings announcement announcements filing filings ' +
    'filed notice notices copy newspaper publication scrutinizer voting agm egm postal ballot circular letter ' +
    'sebi lodr nse bse act reg under regulation76 schedule annexure ' +
    // finance / corporate-action filing generics (chain unrelated small-cap filings together)
    'order orders secures secured against dated recovery certain approved approval raising raise raises ' +
    'fund funds funding capital director directors shareholder shareholders allotment preferential issue ' +
    'records record transfer winning awarded receives received gets signs signing pact agreement deal deals ' +
    'listing obligations defaulter defaulters entities entity suspension suspended debarred relief managers ' +
    'trading activities special general notice meeting postal correction clarification withdrawal ' +
    // HTML / feed artifacts + filler
    'href hreflang https http www html amp nbsp span div utm matter various respect behalf thereof inter alia'
  ).split(/\s+/),
)
// short-but-meaningful topic anchors (skipped by the ≥4-char rule but worth matching on)
const SHORT_TOPICS = new Set(['oil', 'gas', 'war', 'tax', 'fed', 'ecb', 'boj', 'rbi', 'fta', 'cpi', 'gdp', 'ppi', 'wpi', 'pmi', 'yen', 'ipo', 'ai', 'ev', '5g', '6g'])

/** The set of meaningful topic tokens in a headline (+ the guessed company names/tickers) — the test
 *  for whether two events are about the same thing, not just sharing a coarse theme tag. Country/agency
 *  "company" guesses (e.g. "China") are excluded so they don't cluster the wire. */
export function topicTokens(headline?: string | null, companies?: CompanyGuess[] | null): Set<string> {
  const out = new Set<string>()
  for (const w of String(headline || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)) {
    if (!w || STOP_WORDS.has(w)) continue
    if (/^\d+$/.test(w)) continue // pure numbers (years, counts) never anchor a theme
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
