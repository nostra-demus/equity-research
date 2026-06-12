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
