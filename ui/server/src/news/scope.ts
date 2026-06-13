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

export type ScopeId = 'single_name' | 'multi_name' | 'sector' | 'macro' | 'commodity' | 'policy' | 'unknown'
export type ScopeFamily = 'company' | 'broad' | 'unknown'

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
  unknown: { id: 'unknown', label: 'Unclassified', meaning: "Not enough in the headline to place it — open it to see what it's about.", family: 'unknown' },
}

export const SCOPE_ORDER: ScopeId[] = ['single_name', 'multi_name', 'sector', 'macro', 'commodity', 'policy', 'unknown']
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
}

/**
 * Place an event on the scope axis. Precedence (first match wins):
 *  1. commodity/freight move (by source type or headline terms) → commodity
 *  2. system-level policy/regulator/court action with NO single company as the subject → policy
 *  3. one named company + a company-pointing linkage → single_name
 *  4. two-or-more named companies, or an M&A/commercial event with companies → multi_name
 *  5. a company-pointing linkage but no name guessed → single_name (still about one issuer)
 *  6. macro print/terms, or macro linkage → macro
 *  7. sector linkage, or sector-ish without a name → sector
 *  8. otherwise unknown
 * Everything degrades to the linkage-only mapping if the headline gives nothing.
 */
export function deriveScope(it: ScopeInput): ScopeId {
  const hay = ' ' + lc(it.headline) + ' '
  const link = normLinkage(it.issuer_linkage)
  const nature = lc(it.input_nature)
  const types = (it.event_types || []).map(lc)
  const companies = (it.companies || []).filter((c) => c && lc(c.name).trim())
  const namedCount = companies.length
  const hasMnaType = types.includes('mna')
  // a single named company that the linkage points at IS the subject — this guards both the policy
  // and commodity branches, so "SEC charges Acme" / "Aramco lifts crude" stay company-scoped.
  const subjectIsOneCompany = link === 'primary' && namedCount === 1

  // 1. system-level policy / regulator / court / central-bank action — checked BEFORE commodity so a
  // tariff/sanction/antitrust action outranks the commodity it targets ("tariffs on steel" = policy,
  // not a steel price move). Only when no single company is the SUBJECT.
  if (!subjectIsOneCompany && (anyTerm(hay, POLICY_TERMS) || ((types.includes('regulatory') || types.includes('litigation_enforcement')) && (link === 'sector' || link === 'macro' || namedCount === 0)))) {
    return 'policy'
  }

  // 2. commodity / freight price or supply move (no policy action, no single-producer subject)
  if (nature === 'commodity_price_move' || nature === 'shipping_rate_move' || anyTerm(hay, COMMODITY_TERMS)) {
    if (!subjectIsOneCompany) return 'commodity'
  }

  // 3. one named company, company-pointing linkage
  if ((link === 'primary' || link === 'secondary') && namedCount === 1 && !hasMnaType) return 'single_name'

  // 4. a deal / pair — two+ named companies, or M&A/commercial with at least one name
  if (namedCount >= 2 || (hasMnaType && namedCount >= 1) || (link === 'secondary' && namedCount >= 1)) return 'multi_name'

  // 5. company linkage but the model named nobody — still one-issuer in spirit
  if (link === 'primary' && namedCount <= 1) return 'single_name'

  // 6. macro
  if (link === 'macro' || anyTerm(hay, MACRO_TERMS) || types.includes('macro_sector') && link !== 'sector') return 'macro'

  // 7. sector
  if (link === 'sector' || types.includes('macro_sector')) return 'sector'

  return 'unknown'
}

// ---- source tier — CLAUDE.md §4 hierarchy, made visible on the wire ----

export type SourceTierId = 'primary_filing' | 'official_data' | 'company' | 'news' | 'unconfirmed'

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
}

export interface SourceTierInput {
  input_nature?: string | null
  event_types?: string[] | null
}

/** Map the intake's input_nature (+ a rumor event-type override) to the §4 source tier. */
export function deriveSourceTier(it: SourceTierInput): SourceTierId {
  const types = (it.event_types || []).map(lc)
  if (types.includes('rumor')) return 'unconfirmed'
  switch (lc(it.input_nature)) {
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
