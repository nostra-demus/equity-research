// Client mirror of the server's scope + source-tier vocabulary (ui/server/src/news/scope.ts). The
// browser can't import server code, so the labels/meanings live here too; the server now stamps
// `scope` + `source_tier` onto every FeedItem (fresh AND backfilled), so this file is mostly a
// presentation layer — plus a small fallback derive for the rare item that arrives without them.
//
// The split a buy-side reader cares about: COMPANY (a specific listed name is in play — a potential
// single-stock idea) vs BROAD (context / theme / basket — not a single name). The rail colors the
// two families differently so "what can I actually work on?" is answerable at a glance.

export type ScopeId = 'single_name' | 'multi_name' | 'sector' | 'macro' | 'commodity' | 'policy' | 'unknown'
export type ScopeFamily = 'company' | 'broad' | 'unknown'

export interface ScopeDef {
  id: ScopeId
  label: string
  meaning: string
  family: ScopeFamily
}

export const SCOPES: Record<ScopeId, ScopeDef> = {
  single_name: { id: 'single_name', label: 'Company', meaning: 'About one named company — the kind of thing that can become a single-stock idea.', family: 'company' },
  multi_name: { id: 'multi_name', label: 'Deal / Pair', meaning: 'Names two or more companies together — a takeover, partnership, or dispute (often a pair trade).', family: 'company' },
  sector: { id: 'sector', label: 'Sector', meaning: 'About a whole industry, not one company — a basket or read-across, not a single name.', family: 'broad' },
  macro: { id: 'macro', label: 'Macro', meaning: 'Economy-wide — rates, inflation, growth, jobs, currencies or trade. Context, not a stock.', family: 'broad' },
  commodity: { id: 'commodity', label: 'Commodity', meaning: 'A commodity or freight price/supply move — hits producers and users, not one company.', family: 'broad' },
  policy: { id: 'policy', label: 'Policy', meaning: 'A government, regulator, court or central-bank action — sets the rules of the game.', family: 'broad' },
  unknown: { id: 'unknown', label: 'Unclassified', meaning: "Not enough in the headline to place it — open it to see what it's about.", family: 'unknown' },
}

// company-family first, then broad — the order the rail filter renders left→right
export const SCOPE_ORDER: ScopeId[] = ['single_name', 'multi_name', 'sector', 'macro', 'commodity', 'policy']
export const COMPANY_SCOPES: ScopeId[] = ['single_name', 'multi_name']
export const BROAD_SCOPES: ScopeId[] = ['sector', 'macro', 'commodity', 'policy']

export const scopeDef = (s?: string | null): ScopeDef => SCOPES[(s as ScopeId)] || SCOPES.unknown
export const scopeLabel = (s?: string | null): string => scopeDef(s).label
export const familyOf = (s?: string | null): ScopeFamily => scopeDef(s).family

// ---- source tier (CLAUDE.md §4 hierarchy) ----
export type SourceTierId = 'primary_filing' | 'official_data' | 'company' | 'news' | 'unconfirmed'
export interface SourceTierDef { id: SourceTierId; label: string; rank: number; meaning: string }
export const SOURCE_TIERS: Record<SourceTierId, SourceTierDef> = {
  primary_filing: { id: 'primary_filing', label: 'Filing', rank: 5, meaning: 'A regulatory filing or exchange disclosure — primary, top-of-the-ladder evidence.' },
  official_data: { id: 'official_data', label: 'Official data', rank: 4, meaning: 'An official statistics print or a commodity/freight price read from a government agency or a recognised price-reporting agency.' },
  company: { id: 'company', label: 'Company', rank: 3, meaning: "The company's own release — useful, but management's framing, not an independent check." },
  news: { id: 'news', label: 'News', rank: 2, meaning: 'A reputable newswire report — secondary; verify against the primary source before relying on it.' },
  unconfirmed: { id: 'unconfirmed', label: 'Unconfirmed', rank: 1, meaning: 'Sourced to unnamed people — a rumour. Lowest weight until confirmed.' },
}
export const sourceTierDef = (t?: string | null): SourceTierDef | null => (t ? SOURCE_TIERS[(t as SourceTierId)] || null : null)

// ---- compact fallback derive (only for an item that arrived with no scope; the server normally fills it) ----
const COMMODITY_RE = /\b(oil|crude|brent|wti|opec|gasoline|petrol|diesel|natural gas|lng|copper|alumini?um|zinc|nickel|cobalt|lithium|uranium|gold|silver|platinum|palladium|iron ore|steel|coal|wheat|corn|soybean|sugar|coffee|cocoa|cotton|palm oil|rubber|freight rate|baltic|tanker rate|dry bulk)\b/i
const POLICY_RE = /\b(tariffs?|sanctions?|embargo|antitrust|anti-trust|central bank|federal reserve|fomc|rate (?:cut|hike|decision)|interest rate|reserve bank|rbi|ecb|monetary policy|regulator|sebi|court|ruling|tribunal|trade deal|free trade|fta|ban on)\b/i
const MACRO_RE = /\b(inflation|cpi|wpi|ppi|gdp|recession|payrolls|unemployment|retail sales|pmi|bond yield|treasury yield|economy|currency)\b/i

export function deriveScopeClient(it: { issuer_linkage?: string | null; companies?: { name?: string }[] | null; event_types?: string[] | null; headline?: string | null; headline_en?: string | null }): ScopeId {
  const link = String(it.issuer_linkage || '')
  const named = (it.companies || []).filter((c) => c && String(c.name || '').trim()).length
  const types = it.event_types || []
  // scan the English translation when present, so the English-only lexicons below classify a foreign headline too
  const hl = String((it.headline_en && it.headline_en.trim()) || it.headline || '')
  const subjectIsOneCompany = link.startsWith('primary') && named === 1
  if (!subjectIsOneCompany && (POLICY_RE.test(hl) || ((types.includes('regulatory') || types.includes('litigation_enforcement')) && (link.startsWith('sector') || link.startsWith('macro') || named === 0)))) return 'policy'
  if (COMMODITY_RE.test(hl) && !subjectIsOneCompany) return 'commodity'
  if ((link.startsWith('primary') || link.startsWith('secondary')) && named === 1 && !types.includes('mna')) return 'single_name'
  if (named >= 2 || (types.includes('mna') && named >= 1) || (link.startsWith('secondary') && named >= 1)) return 'multi_name'
  if (link.startsWith('primary')) return 'single_name'
  if (link.startsWith('macro') || MACRO_RE.test(hl)) return 'macro'
  if (link.startsWith('sector') || types.includes('macro_sector')) return 'sector'
  return 'unknown'
}

/** The scope of a feed item — its stamped value, or a fallback derive if it predates the field. */
export const scopeOf = (it: { scope?: string | null; issuer_linkage?: string | null; companies?: { name?: string }[] | null; event_types?: string[] | null; headline?: string | null; headline_en?: string | null }): ScopeId =>
  (it.scope as ScopeId) || deriveScopeClient(it)

// ---- client mirror of the entity denylist (server: news/entities.ts) — so a country/agency guessed
// as a "company" ("China", "Fed") never shows as one on the rail/detail before enrichment scrubs it ----
const NOT_COMPANY = new Set([
  'india', 'china', 'chinese', 'japan', 'japanese', 'uk', 'united kingdom', 'us', 'usa', 'united states', 'america', 'eu',
  'european union', 'europe', 'thailand', 'turkey', 'indonesia', 'pakistan', 'taiwan', 'south korea', 'korea', 'iran',
  'israel', 'russia', 'ukraine', 'germany', 'france', 'brazil', 'canada', 'australia', 'singapore', 'saudi arabia', 'uae',
  'haryana', 'asia', 'gulf', 'middle east', 'west asia', 'global', 'wall street',
  's&p 500', 's&p', 'nasdaq', 'dow', 'stoxx 600', 'msci', 'sensex', 'nifty', 'euribor', 'ftse', 'dax', 'nikkei',
  'fed', 'federal reserve', 'fomc', 'ecb', 'boj', 'rbi', 'sebi', 'esma', 'sec', 'doj', 'european commission', 'opec',
  'imf', 'world bank', 'wto', 'nato', 'un', 'united nations', 'treasury', 'parliament', 'congress',
  '[]', 'n/a', 'none', 'unknown', 'the company', 'company', 'major tyre maker', 'startups', 'analysts', 'investors',
])
export function isCompanyNameClient(name?: string | null): boolean {
  const n = String(name ?? '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,]/g, '').replace(/\(.*?\)/g, '').replace(/^the /, '').trim()
  if (!n || n.length < 2) return false
  if (NOT_COMPANY.has(n)) return false
  if (/\b(ministry|authority|regulator|commission|tribunal|government)\b/.test(n)) return false
  return true
}

// plain labels for the article-company role tags
const ROLE_LABEL: Record<string, string> = { subject: 'the subject', acquirer: 'acquirer', target: 'target', forecaster: 'forecaster', mentioned: 'mentioned' }
export const roleLabel = (r?: string | null): string => (r ? ROLE_LABEL[r] || r : '')
