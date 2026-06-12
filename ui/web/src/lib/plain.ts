// Plain-English labels for the screener's machine vocabulary. The engine speaks in routing codes
// (PROMOTE, watchlist_no_edge, full_machine…) and module slugs (signal-gate…); a person looking at
// the cockpit should never have to decode those. Every mapping falls back to the humanized raw
// string, so a NEW route or module added later still renders something readable with zero edits
// here (CLAUDE.md §26 zero-touch).

const human = (s: string) => String(s || '').replace(/_/g, ' ')

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

// Who the news actually hits.
const LINKAGE: Record<string, string> = {
  primary: 'names the company',
  secondary: 'hits a supplier or partner',
  sector: 'industry-wide',
  macro: 'whole economy',
}
export const plainLinkage = (l?: string | null): string => (l ? LINKAGE[l] || human(l) : '')

// Score bands → what they mean on the wire. BOTH kept bands land in the Inbox (watch ranks lower).
export const plainBand = (b?: string | null): string => (b === 'pick' ? 'kept → Inbox' : b === 'watch' ? 'kept → Inbox (borderline)' : b === 'drop' ? 'dropped' : human(b || ''))

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
