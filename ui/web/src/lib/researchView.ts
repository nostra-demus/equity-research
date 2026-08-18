// Which view the research stage is showing. Three values now: the flat constellation, the 3D globe, and
// the watchlist (a list of names you are waiting on, not a rendering of the swarm).
//
// Both functions here are pure so they can be tested without a DOM — and they need testing, because both
// used to be one-liners that silently swallowed a third value:
//   - the stored-value reader treated anything that was not 'constellation' as 'globe', so a saved
//     'watchlist' came back as the globe on every reload;
//   - the WebGL probe overwrote the view with 'constellation' whenever WebGL was missing, regardless of
//     what the view actually was, so a watchlist user was thrown out of it on every boot of a browser
//     without WebGL.
// Neither is a hypothetical: the first fires on every reload, the second on every boot.

export type ResearchView = 'constellation' | 'globe' | 'watchlist'

const VIEWS: readonly ResearchView[] = ['constellation', 'globe', 'watchlist']

/** An allow-list, not a two-way guess. Anything unrecognised falls back to the globe default. */
export function normalizeStoredView(raw: unknown): ResearchView {
  return VIEWS.includes(raw as ResearchView) ? (raw as ResearchView) : 'globe'
}

/** Only the globe needs WebGL, so only the globe may be coerced away from it. */
export function coerceViewForWebgl(view: ResearchView, webglOK: boolean): ResearchView {
  return !webglOK && view === 'globe' ? 'constellation' : view
}

/**
 * The view actually rendered. `researchView` is ONE preference shared by every constellation-layout
 * swarm, but the watchlist is research-only — so a commodity swarm must fall back rather than render an
 * empty stage. Deliberately NOT written back to the store: the research preference has to survive the
 * detour, or switching swarms and back would silently lose it.
 */
export function effectiveResearchView(view: ResearchView, isResearch: boolean): ResearchView {
  return view === 'watchlist' && !isResearch ? 'constellation' : view
}
