// Which view the research stage is showing. Four values: the flat constellation, the 3D globe, and two
// cross-company views — the watchlist (names you are waiting on) and the portfolio (the fund's real
// book). Neither cross-company view is a rendering of the swarm.
//
// Both functions here are pure so they can be tested without a DOM — and they need testing, because both
// used to be one-liners that silently swallowed a third value:
//   - the stored-value reader treated anything that was not 'constellation' as 'globe', so a saved
//     'watchlist' came back as the globe on every reload;
//   - the WebGL probe overwrote the view with 'constellation' whenever WebGL was missing, regardless of
//     what the view actually was, so a watchlist user was thrown out of it on every boot of a browser
//     without WebGL.
// Neither is a hypothetical: the first fires on every reload, the second on every boot.

export type ResearchView = 'constellation' | 'globe' | 'watchlist' | 'portfolio'

const VIEWS: readonly ResearchView[] = ['constellation', 'globe', 'watchlist', 'portfolio']

/** The views that are a PLACE YOU GO rather than the stage you work on: cross-company lists, not a
 *  rendering of the selected company's swarm. They are research-only, and they are not restored on
 *  reload — see normalizeStoredView. */
const CROSS_COMPANY: readonly ResearchView[] = ['watchlist', 'portfolio']

/**
 * An allow-list, not a two-way guess.
 *
 * The watchlist is deliberately NOT restorable as a landing view. It is a place you go — a
 * cross-company list — where the stage is where you work on the company you have selected. Restoring it
 * means every reload drops you into a list instead of the thing you were looking at, and it quietly
 * became the app's home screen for anyone who visited it once.
 *
 * The default with nothing stored is the CONSTELLATION. The globe is the same scene wrapped onto a
 * sphere and it is the more expensive one to paint; opening flat means the first thing drawn is the
 * thing you read, and the globe is one click away for anyone who prefers it.
 */
export function normalizeStoredView(raw: unknown): ResearchView {
  if (CROSS_COMPANY.includes(raw as ResearchView)) return 'constellation'
  return VIEWS.includes(raw as ResearchView) ? (raw as ResearchView) : 'constellation'
}

/** Which views are worth remembering between visits. The cross-company views are not (see above). */
export function isPersistableView(v: ResearchView): boolean {
  return !CROSS_COMPANY.includes(v)
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
  return CROSS_COMPANY.includes(view) && !isResearch ? 'constellation' : view
}
