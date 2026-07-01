// Plain-English labels for the screener's machine vocabulary. The engine speaks in routing codes
// (PROMOTE, watchlist_no_edge, full_machine…) and module slugs (signal-gate…); a person looking at
// the cockpit should never have to decode those. Every mapping falls back to the humanized raw
// string, so a NEW route or module added later still renders something readable with zero edits
// here (CLAUDE.md §26 zero-touch).

const human = (s: string) => String(s || '').replace(/_/g, ' ')

// ---- headline display ----
// The scanner reads global wires; a non-English headline (Korean, Japanese, Chinese, Cyrillic, …) gets a
// validated English translation stamped on it at ingest (server news/lang.ts → `headline_en`). Every place
// that shows a headline to a person renders `displayHeadline`, so the wire/reader/themes always read in
// English; the original is still available via `originalHeadline` for an honest "this is a translation"
// affordance (tooltip / muted subline). Falls back to the original whenever no translation was stored.
type Headlined = { headline_en?: string | null; headline?: string | null } | null | undefined
export const displayHeadline = (it: Headlined): string => ((it?.headline_en && it.headline_en.trim()) || it?.headline || '')
/** The source-language original — returned ONLY when a different English translation is what's being shown
 *  (so the UI can reveal the original without duplicating it for already-English headlines). Else null. */
export const originalHeadline = (it: Headlined): string | null => {
  const en = it?.headline_en && it.headline_en.trim()
  const orig = it?.headline && it.headline.trim()
  return en && orig && en !== orig ? orig : null
}
/** The source language to name in the "original · <language>" affordance — only when a translation is
 *  actually being shown AND the server named the language; else null (so the label stays a plain "original"). */
export const translatedFromLang = (it: { headline_en?: string | null; headline?: string | null; headline_lang?: string | null } | null | undefined): string | null => {
  if (!originalHeadline(it)) return null
  const l = it?.headline_lang && it.headline_lang.trim()
  return l || null
}

// Routing / status values (the SWARM.md routing contract + thesis statuses), in plain words.
const ROUTES: Record<string, string> = {
  PROMOTE: 'passed — on to the next check',
  Proceed: 'passed — on to the next check',
  PARK: 'set aside for now',
  LOG: 'noted, no action',
  suppress: 'dropped',
  return_to_m0_2: 'sent back a step to recheck the facts',
  watchlist_no_source: 'watching — source not on the trusted list',
  watchlist_no_world_change: 'watching — nothing has actually changed yet',
  watchlist_no_edge: 'watching — the market likely knows this already',
  provisional: 'early idea',
  full_machine: 'strong idea',
  watchlist_manual: 'watching — you moved it here',
}
// Lookup order: exact → case-insensitive → first token (agents sometimes write "Proceed" or
// "provisional (restated …)") → humanized raw, so a person never sees a bare machine code.
const ROUTES_CI = new Map(Object.keys(ROUTES).map((k) => [k.toLowerCase(), ROUTES[k]]))
export const plainRoute = (route?: string | null): string => {
  if (!route) return ''
  if (ROUTES[route]) return ROUTES[route]
  const ci = ROUTES_CI.get(route.toLowerCase().trim())
  if (ci) return ci
  const first = ROUTES_CI.get(route.toLowerCase().trim().split(/[\s(:,]+/)[0])
  if (first) return first
  return human(route)
}

// Screener stage (module) names → what each stage actually does.
const STAGES: Record<string, string> = {
  'signal-gate': 'first checks',
  'thesis-structure': 'build the idea',
  'edge-definition': 'is it mispriced?',
  'candidate-surfacing': 'pick companies',
}
export const plainStage = (module?: string | null): string => (module ? STAGES[module] || human(module) : '')

// The scanner's theme tags (the gauntlet's event-type vocabulary) → plain words.
const THEMES: Record<string, string> = {
  earnings_revenue_margin: 'profits & sales',
  guidance_change: 'forecast changed',
  mna: 'deals & takeovers',
  capital_actions: 'buybacks & share moves',
  debt_credit: 'debt & credit',
  litigation_enforcement: 'lawsuits & penalties',
  regulatory: 'rules & regulators',
  management: 'leadership changes',
  product: 'products & launches',
  commercial: 'contracts & customers',
  operations: 'factories & supply',
  cybersecurity: 'hacks & data leaks',
  macro_sector: 'economy & industry',
  rumor: 'unconfirmed talk',
}
export const plainTheme = (t?: string | null): string => (t ? THEMES[t] || human(t) : '')
export const ALL_THEMES = Object.keys(THEMES)

// Guessed company size buckets → plain words.
const SIZES: Record<string, string> = {
  mega: 'giant company',
  large: 'big company',
  mid: 'mid-size company',
  small: 'small company',
  unknown: 'size unknown',
}
export const plainSize = (s?: string | null): string => (s ? SIZES[s] || human(s) : '')

// Region codes → readable market names (the IBKR-tradable markets are first-class).
const REGIONS_PLAIN: Record<string, string> = {
  US: 'US', IN: 'India', JP: 'Japan', GB: 'UK', CN: 'China', KR: 'South Korea', GLOBAL: 'Global', OTHER: 'Other',
}
export const plainRegion = (r?: string | null): string => (r ? REGIONS_PLAIN[r] || r : '')

// Who the news actually hits.
const LINKAGE: Record<string, string> = {
  primary: 'names the company',
  secondary: 'hits a supplier or partner',
  sector: 'industry-wide',
  macro: 'whole economy',
}
export const plainLinkage = (l?: string | null): string => (l ? LINKAGE[l] || human(l) : '')

// Thesis time-horizon (M0.4 enum) → plain words, plus a 3-way bucket for the live-book filter.
const HORIZON: Record<string, string> = {
  short_days_weeks: 'days–weeks',
  medium_weeks_3months: 'weeks–3 months',
  medium_long_3_6months: '3–6 months',
  long_6months_plus: '6 months+',
}
export const plainHorizon = (h?: string | null): string => (h ? HORIZON[h] || human(h) : '')
// Collapse the raw horizon enum to short / medium / long so one dropdown covers any new enum value.
export const horizonBucket = (h?: string | null): '' | 'short' | 'medium' | 'long' => {
  if (!h) return ''
  const s = h.toLowerCase()
  if (s.startsWith('short')) return 'short'
  if (s.includes('6month') || s.startsWith('long')) return 'long'
  if (s.startsWith('medium')) return 'medium'
  return ''
}

// Score bands → what the scanner did with the item on the wire: kept it for a look, or dropped it.
export const plainBand = (b?: string | null): string => (b === 'pick' ? 'kept' : b === 'watch' ? 'kept (borderline)' : b === 'drop' ? 'dropped' : human(b || ''))

// news_impact direction/magnitude/metric → plain words (the events reader's Impact block).
const IMPACT_DIRECTIONS: Record<string, string> = {
  positive: 'positive',
  negative: 'negative',
  mixed: 'mixed',
  neutral: 'no real impact',
  unknown: 'unclear',
}
export const plainImpactDirection = (d?: string | null): string => (d ? IMPACT_DIRECTIONS[d] || human(d) : '')

const IMPACT_MAGNITUDES: Record<string, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
}
export const plainImpactMagnitude = (m?: string | null): string => (m ? IMPACT_MAGNITUDES[m] || human(m) : '')

const AFFECTED_METRICS_PLAIN: Record<string, string> = {
  revenue: 'revenue',
  ebitda: 'EBITDA',
  pat_net_income: 'net profit',
  eps: 'EPS',
  cash_flow: 'cash flow',
  debt: 'debt',
  capex: 'capex',
  commodity_price: 'commodity price',
  valuation_multiple: 'valuation multiple',
  regulatory_risk: 'regulatory risk',
  thesis_quality: 'thesis quality',
}
export const plainAffectedMetric = (m?: string | null): string => (m ? AFFECTED_METRICS_PLAIN[m] || human(m) : '')

// Run kinds → what's actually running (for the stop list).
const KINDS: Record<string, string> = {
  full: 'full research run',
  module: 'one research module',
  agent: 'one research orb',
  rerun: 're-run + downstream',
  signal: 'event check',
  sweep: 'manual news scan',
  'screener-agent': 'one screener orb',
  handoff: 'send to research',
}
export const plainKind = (k?: string | null): string => (k ? KINDS[k] || human(k) : '')
