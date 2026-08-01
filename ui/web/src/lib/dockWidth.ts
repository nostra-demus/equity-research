// The Activity dock's width math, kept pure (viewport width passed in, not read from `window`) so it can
// be unit-tested without a DOM — the same reason layout.ts / stageDock.ts live apart from their components.

// Width bounds. The floor is the narrowest the live cards stay readable at; the ceiling leaves the stage a
// usable sliver rather than letting the dock become a de-facto full-screen overlay.
export const MIN_W = 320
export const MAX_FRACTION = 0.72
export const DEFAULT_W = 400

/** Clamp a pixel width to [MIN_W, round(viewportW * MAX_FRACTION)]. Pure — the viewport width is injected. */
export function clampWidthPx(px: number, viewportW: number): number {
  return Math.max(MIN_W, Math.min(px, Math.round(viewportW * MAX_FRACTION)))
}

/**
 * The dock's INITIAL width from its persisted raw value, clamped to the CURRENT viewport.
 * A width saved on a large monitor must not render past the ceiling when the app is next opened on a
 * smaller screen — clamping only on resize/drag left the very first paint too wide. Absent, non-numeric,
 * or non-positive stored values fall back to DEFAULT_W.
 */
export function resolveInitialWidth(storedRaw: string | null, viewportW: number): number {
  const v = Number(storedRaw)
  return Number.isFinite(v) && v > 0 ? clampWidthPx(v, viewportW) : DEFAULT_W
}
