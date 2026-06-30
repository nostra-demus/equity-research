// SCOPE + SOURCE-TIER classification for the news wire — the institution-grade "what is this about
// and how good is the source" layer the cockpit reads to decide whether an event is worth a paid
// check. Pure, dependency-free, deterministic, and DERIVED from the fields the cheap triage already
// emits (issuer_linkage / companies / event_types / input_nature / headline). Deriving — rather than
// asking the model for a new field — means every item already on disk (the whole firehose backlog)
// is classified the same way as a fresh one, with zero re-triage and zero token cost. The cheap-brain
// triage stays the title-only pre-score it always was; this is a cost-free refinement on top of it.
//
// The vocabulary mirrors the screener gauntlet's own framing (CLAUDE.md §4 source hierarchy, §7
// variant-perception company-vs-macro split, screener-beneficiary-map's directness read) so the
// pre-triage tags line up with what the paid pipeline will say later.

import { isCompanyName } from './entities'

export type ScopeId = 'single_name' | 'multi_name' | 'sector' | 'macro' | 'commodity' | 'policy' | 'geopolitical' | 'generic_media' | 'unknown'
export type ScopeFamily = 'company' | 'broad' | 'unknown'

// The event-materiality classifier's simpler external vocabulary (news/types.ts EventScope) — a
// mapping OVER ScopeId, not a replacement. single_name + multi_name collapse to company_specific;
// policy maps to regulatory; everything else is 1:1. See toEventScope below.
export type EventScope = 'company_specific' | 'sector' | 'commodity' | 'macro' | 'geopolitical' | 'regulatory' | 'generic_media'

export interface ScopeDef {
  id: ScopeId
  /** rail/detail chip text — short on purpose so a row stays scannable */
  label: string
  /** one plain sentence: what this scope means for a buy-side reader (CLAUDE.md §21 plain English) */
  meaning: string
  /** company = a specific listed name is in play (a potential single-stock idea); broad = context/theme/basket */
  family: ScopeFamily
}

// Ordered company-first → broad, so a UI that maps over this renders the actionable buckets first.
export const SCOPES: Record<ScopeId, ScopeDef> = {
  single_name: { id: 'single_name', label: 'Company', meaning: 'About one named company — the kind of thing that can become a single-stock idea.', family: 'company' },
  multi_name: { id: 'multi_name', label: 'Deal / Pair', meaning: 'Names two or more companies together — a takeover, partnership, or dispute (often a pair trade).', family: 'company' },
  sector: { id: 'sector', label: 'Sector', meaning: 'About a whole industry, not one company — a basket or read-across, not a single name.', family: 'broad' },
  macro: { id: 'macro', label: 'Macro', meaning: 'Economy-wide — rates, inflation, growth, jobs, currencies or trade. Context, not a stock.', family: 'broad' },
  commodity: { id: 'commodity', label: 'Commodity', meaning: 'A commodity or freight price/supply move — hits producers and users, not one company.', family: 'broad' },
  policy: { id: 'policy', label: 'Policy', meaning: 'A government, regulator, court or central-bank action — sets the rules of the game.', family: 'broad' },
  geopolitical: { id: 'geopolitical', label: 'Geopolitical', meaning: 'A war, military strike, conflict escalation or similar — moves whole markets even with no company named (CLAUDE.md §24).', family: 'broad' },
  generic_media: { id: 'generic_media', label: 'Generic media', meaning: 'A roundup, ranking or listicle naming several companies with no single event — low information, never a single-stock idea.', family: 'broad' },
  unknown: { id: 'unknown', label: 'Unclassified', meaning: "Not enough in the headline to place it — open it to see what it's about.", family: 'unknown' },
}

export const SCOPE_ORDER: ScopeId[] = ['single_name', 'multi_name', 'sector', 'macro', 'commodity', 'policy', 'geopolitical', 'generic_media', 'unknown']
export const familyOf = (s: ScopeId): ScopeFamily => SCOPES[s]?.family ?? 'unknown'

// ---- keyword lexicons (lowercased, word-ish boundaries handled by the matcher) ----

// A commodity / freight price or supply move. Producers AND users are affected — never one company.
const COMMODITY_TERMS = [
  'oil', 'crude', 'brent', 'wti', 'opec', 'gasoline', 'petrol', 'diesel', 'jet fuel',
  'natural gas', 'lng', 'lpg', 'naphtha',
  'copper', 'aluminium', 'aluminum', 'zinc', 'nickel', 'tin', 'lead ingot', 'cobalt', 'lithium', 'uranium',
  'gold', 'silver', 'platinum', 'palladium', 'bullion',
  'iron ore', 'steel', 'coking coal', 'thermal coal', 'coal',
  'wheat', 'corn', 'maize', 'soybean', 'soyoil', 'sugar', 'coffee', 'cocoa', 'cotton', 'palm oil', 'rubber', 'rice',
  'freight rate', 'baltic', 'tanker rate', 'dry bulk', 'container rate', 'shipping rate', 'charter rate',
]

// A government / regulator / court / central-bank action that sets the rules — system-level, not a
// single company's own lawsuit. (A "SEC charges X" item still resolves to the company, because X is
// the subject — see the precedence in deriveScope.)
const POLICY_TERMS = [
  'tariff', 'tariffs', 'sanction', 'sanctions', 'embargo', 'export ban', 'import ban', 'export curb',
  'antitrust', 'anti-trust', 'competition commission', 'merger review', 'price cap', 'windfall tax',
  'central bank', 'federal reserve', 'fomc', 'rate decision', 'rate cut', 'rate hike', 'interest rate',
  'reserve bank', 'rbi', 'ecb', 'boj', 'bank of england', 'monetary policy', 'repo rate',
  'regulator', 'regulation', 'regulatory framework', 'new rules', 'rule change', 'sebi', 'guidelines',
  'court', 'supreme court', 'appeals court', 'tribunal', 'ruling', 'verdict', 'injunction',
  // free-trade agreements ARE trade policy (the singular + the common plural form)
  'trade deal', 'free trade', 'fta', 'ftas', 'trade pact', 'budget', 'fiscal', 'subsidy', 'pli scheme',
  'election', 'parliament', 'congress passes', 'executive order', 'ban on',
]

// Economy-wide prints / themes that are clearly macro even if the linkage came through weak.
const MACRO_TERMS = [
  'inflation', 'cpi', 'wpi', 'ppi', 'gdp', 'growth forecast', 'recession', 'jobs report', 'payrolls',
  'unemployment', 'retail sales', 'pmi', 'industrial production', 'trade deficit', 'current account',
  'rupee', 'dollar index', 'yen', 'euro', 'currency', 'bond yield', 'treasury yield', 'yields',
  'consumer confidence', 'economic growth', 'economy',
]

// War / military-conflict escalation — moves whole markets (oil, defense, safe-haven flows) even with
// no company named (CLAUDE.md §24 "Avoid Big Risks" / §7). Multi-word / contextual phrases ON PURPOSE:
// a bare 'strike' would false-positive on labor strikes ("workers strike at Acme plant") and idioms
// ("strikes a deal"); 'missile' alone would false-positive on a defense contractor's own product news
// ("Lockheed wins missile contract") — that case is still routed correctly because deriveScope only
// checks this list when !subjectIsOneCompany, same guard as POLICY_TERMS/COMMODITY_TERMS below.
// Deliberately EXCLUDES bare 'ceasefire' / 'truce' / 'peace deal' / 'peace treaty' — those words alone
// describe DE-escalation (often the cause of a commodity price move, e.g. "Oil falls on peace deal")
// and must not steal the 'commodity' scope a price-move headline already earns; only their reversal
// (escalation breaking a truce) is a geopolitical trigger.
const GEOPOLITICAL_TERMS = [
  'air strike', 'airstrike', 'air strikes', 'military strike', 'military strikes', 'missile strike',
  'missile attack', 'drone strike', 'fresh strikes', 'strikes in', 'launches strikes', 'conducts strikes',
  'invasion', 'invades', 'declares war', 'war on', 'breaks ceasefire', 'violates ceasefire',
  'ceasefire collapse', 'truce collapses', 'truce breaks down', 'warplane', 'shelling', 'bombardment',
  'nuclear site', 'troops enter', 'troop surge', 'martial law', 'border clash', 'conflict escalat',
]

// A roundup / ranking / listicle — names several companies with no single event (CLAUDE.md §21: low
// information, never a single-stock idea). Checked before the company-count branches below so a "Top 10"
// piece naming 5+ tickers doesn't fall into multi_name purely on company count.
const ROUNDUP_TERMS = [
  'top 10', 'top 5', 'top 20', 'top stocks', 'top companies', 'best stocks', 'best companies',
  'biggest companies', 'biggest gainers', 'biggest losers', "world's largest", "world's biggest",
  'stocks to watch', 'stocks to buy', 'by market cap', 'market-cap ranking', 'richest companies',
]
const ROUNDUP_NUM_RE = /\btop\s*\d+\b|\branked\b.{0,20}\b(companies|stocks|firms)\b/i

const lc = (s: unknown): string => String(s ?? '').toLowerCase()
/** Whole-word(ish) match: a term must sit on BOTH a left and a right alphanumeric boundary, so "gold"
 *  fires on "gold" but never inside "Goldman", "fta" never inside "after", "boj" never inside
 *  "Bojangles". We scan EVERY occurrence (not just the first), so a real standalone hit later in the
 *  string still counts even if an earlier occurrence was inside a word ("Goldman discusses gold").
 *  Multi-word terms ("natural gas") are bounded the same way at their outer edges. */
function hasTerm(hay: string, term: string): boolean {
  const t = term.trim()
  if (!t) return false
  for (let from = 0; ; ) {
    const i = hay.indexOf(t, from)
    if (i < 0) return false
    const before = i === 0 ? ' ' : hay[i - 1]
    const after = i + t.length >= hay.length ? ' ' : hay[i + t.length]
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true
    from = i + 1
  }
}
const anyTerm = (hay: string, terms: string[]): boolean => terms.some((t) => hasTerm(hay, t))

// issuer_linkage arrives in two dialects: the cheap triage's short form (primary/secondary/sector/
// macro) and the gauntlet agent's long form (primary_issuer/...). Normalize both.
function normLinkage(raw: unknown): 'primary' | 'secondary' | 'sector' | 'macro' | '' {
  const s = lc(raw)
  if (s.startsWith('primary')) return 'primary'
  if (s.startsWith('secondary')) return 'secondary'
  if (s.startsWith('sector')) return 'sector'
  if (s.startsWith('macro')) return 'macro'
  return ''
}

export interface ScopeInput {
  issuer_linkage?: string | null
  companies?: { name?: string; ticker?: string | null }[] | null
  event_types?: string[] | null
  input_nature?: string | null
  headline?: string | null
  headline_en?: string | null // English translation (news/lang.ts) — scanned in preference to a non-English headline
}

/**
 * Place an event on the scope axis. Precedence (first match wins):
 *  1. war / military-conflict escalation with NO single company as the subject → geopolitical
 *  2. system-level policy/regulator/court action with NO single company as the subject → policy
 *  3. commodity/freight move (by source type or headline terms) → commodity
 *  4. a roundup/ranking/listicle (no M&A type, no single-company subject) → generic_media
 *  5. one named company + a company-pointing linkage → single_name
 *  6. two-or-more named companies, or an M&A/commercial event with companies → multi_name
 *  7. a company-pointing linkage but no name guessed → single_name (still about one issuer)
 *  8. macro print/terms, or macro linkage → macro
 *  9. sector linkage, or sector-ish without a name → sector
 *  10. otherwise unknown
 * Everything degrades to the linkage-only mapping if the headline gives nothing.
 */
export function deriveScope(it: ScopeInput): ScopeId {
  // scan the English translation when we have one, so a foreign-language commodity/policy/macro story is
  // bucketed by the same English lexicons as an English one (the keyword tables below are English-only)
  const hay = ' ' + lc((it.headline_en && it.headline_en.trim()) || it.headline) + ' '
  const link = normLinkage(it.issuer_linkage)
  const nature = lc(it.input_nature)
  const types = (it.event_types || []).map(lc)
  // count only REAL firms — a "China"/"Fed" guess must not make this look like a single-name idea
  const companies = (it.companies || []).filter((c) => c && lc(c.name).trim() && isCompanyName(c.name))
  const namedCount = companies.length
  const hasMnaType = types.includes('mna')
  // a single named company that the linkage points at IS the subject — this guards both the policy
  // and commodity branches, so "SEC charges Acme" / "Aramco lifts crude" stay company-scoped.
  const subjectIsOneCompany = link === 'primary' && namedCount === 1

  // 1. war / military-conflict escalation — checked FIRST so it outranks a generic macro/policy read
  // (CLAUDE.md §24: this moves markets even with no company named). Guarded the same way as policy/
  // commodity below, so a defense contractor's own product news ("Lockheed wins missile contract")
  // stays company-scoped instead of being swept up by the word "missile".
  if (!subjectIsOneCompany && anyTerm(hay, GEOPOLITICAL_TERMS)) return 'geopolitical'

  // 2. system-level policy / regulator / court / central-bank action — checked BEFORE commodity so a
  // tariff/sanction/antitrust action outranks the commodity it targets ("tariffs on steel" = policy,
  // not a steel price move). Only when no single company is the SUBJECT.
  if (!subjectIsOneCompany && (anyTerm(hay, POLICY_TERMS) || ((types.includes('regulatory') || types.includes('litigation_enforcement')) && (link === 'sector' || link === 'macro' || namedCount === 0)))) {
    return 'policy'
  }

  // 3. commodity / freight price or supply move (no policy action, no single-producer subject)
  if (nature === 'commodity_price_move' || nature === 'shipping_rate_move' || anyTerm(hay, COMMODITY_TERMS)) {
    if (!subjectIsOneCompany) return 'commodity'
  }

  // 4. a roundup / ranking / listicle — checked BEFORE the company-count branches so naming several
  // tickers in a "Top 10" piece doesn't earn the multi_name "deal/pair" bonus it doesn't deserve.
  if (!subjectIsOneCompany && !hasMnaType && (anyTerm(hay, ROUNDUP_TERMS) || ROUNDUP_NUM_RE.test(hay))) return 'generic_media'

  // 5. one named company, company-pointing linkage
  if ((link === 'primary' || link === 'secondary') && namedCount === 1 && !hasMnaType) return 'single_name'

  // 6. a deal / pair — two+ named companies, or M&A/commercial with at least one name
  if (namedCount >= 2 || (hasMnaType && namedCount >= 1) || (link === 'secondary' && namedCount >= 1)) return 'multi_name'

  // 7. company linkage but the model named nobody — still one-issuer in spirit
  if (link === 'primary' && namedCount <= 1) return 'single_name'

  // 8. macro
  if (link === 'macro' || anyTerm(hay, MACRO_TERMS) || types.includes('macro_sector') && link !== 'sector') return 'macro'

  // 9. sector
  if (link === 'sector' || types.includes('macro_sector')) return 'sector'

  return 'unknown'
}

// ---- event_scope — the classifier's simpler external vocabulary, mapped from ScopeId ----
const EVENT_SCOPE_MAP: Record<ScopeId, EventScope> = {
  single_name: 'company_specific',
  multi_name: 'company_specific',
  sector: 'sector',
  commodity: 'commodity',
  macro: 'macro',
  policy: 'regulatory',
  geopolitical: 'geopolitical',
  generic_media: 'generic_media',
  // an unclassifiable headline is, in spirit, the same "not a real single-stock/sector signal" bucket
  // as a roundup — neither carries enough to act on.
  unknown: 'generic_media',
}
export function toEventScope(scopeId: ScopeId): EventScope {
  return EVENT_SCOPE_MAP[scopeId] ?? 'generic_media'
}

// ---- source tier — CLAUDE.md §4 hierarchy, made visible on the wire ----

export type SourceTierId = 'primary_filing' | 'official_data' | 'company' | 'news' | 'unconfirmed' | 'social'

export interface SourceTierDef {
  id: SourceTierId
  label: string
  /** higher = more trusted (matches the §4 ordering: filings > official data > company PR > news > rumor) */
  rank: number
  meaning: string
}

export const SOURCE_TIERS: Record<SourceTierId, SourceTierDef> = {
  primary_filing: { id: 'primary_filing', label: 'Filing', rank: 5, meaning: 'A regulatory filing or exchange disclosure — primary, audited-adjacent source (top of the evidence ladder).' },
  official_data: { id: 'official_data', label: 'Official data', rank: 4, meaning: 'An official statistics print or a commodity/freight price read from a government agency or a recognised price-reporting agency.' },
  company: { id: 'company', label: 'Company', rank: 3, meaning: "The company's own release — useful, but management's framing, not an independent check." },
  news: { id: 'news', label: 'News', rank: 2, meaning: 'A reputable newswire report — secondary; verify against the primary source before relying on it.' },
  unconfirmed: { id: 'unconfirmed', label: 'Unconfirmed', rank: 1, meaning: 'Sourced to unnamed people — a rumour. Lowest weight until confirmed.' },
  social: { id: 'social', label: 'Social', rank: 0, meaning: 'A social/forum post (Reddit) — user-generated, low-trust. Discovery and corroboration only; never independently drives a thesis or a top pick (CLAUDE.md §4/§24).' },
}

export interface SourceTierInput {
  input_nature?: string | null
  event_types?: string[] | null
}

/** Map the intake's input_nature (+ a rumor event-type override) to the §4 source tier. */
export function deriveSourceTier(it: SourceTierInput): SourceTierId {
  const types = (it.event_types || []).map(lc)
  const nature = lc(it.input_nature)
  // A social/forum post (Reddit) is the FLOOR tier and must STAY `social` — checked BEFORE the rumor
  // override (CLAUDE.md §4/§24). Otherwise a Reddit post the triage also tags `rumor` resolves to
  // `unconfirmed`, which (a) is a HIGHER tier than `social` and (b) slips past the social-only caps
  // (capSocialBand / capSocialScore key on `social`), letting a low-trust post reach the `pick` band.
  if (nature === 'social_discussion') return 'social'
  if (types.includes('rumor')) return 'unconfirmed'
  switch (nature) {
    case 'regulatory_filing':
    case 'exchange_announcement':
      return 'primary_filing'
    case 'macro_data_release':
    case 'commodity_price_move':
    case 'shipping_rate_move':
      return 'official_data'
    case 'earnings_release':
    case 'earnings_call_transcript':
    case 'company_press_release':
      return 'company'
    default:
      return 'news'
  }
}
