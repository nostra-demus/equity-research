// The stage-dock height guard, kept pure and out of the (Vite-env-bound, un-hostable) store so it can be
// unit-tested directly — the same reason layout.ts / format.ts live apart from store.ts.
//
// The measured decision-dock height is written into the store on every layout pass, and the store guards
// the write so an unchanged height never re-renders the whole constellation field. The guard MUST compare
// the value it is about to STORE, not a differently-derived one: the stored height is clamped to >= 0, so a
// guard that compares the UN-clamped rounded input can disagree with the clamp — e.g. a negative input
// rounds to a negative, which is never equal to the clamped-to-0 stored value, so the guard passes forever
// and the store is re-written (and the field re-rendered) every pass: an idempotency break / render loop.

/** The height to STORE for a measured dock height `h`: rounded, clamped to >= 0 (a dock is never negative). */
export function roundDockH(h: number): number {
  return Math.max(0, Math.round(h))
}

/**
 * The store's write decision for a new measured height `h` given the `current` stored height.
 * Returns the value to store, or `null` when nothing should be written (the clamped height is unchanged).
 * Comparing the CLAMPED value (not the raw rounded input) is what makes this idempotent: once stored,
 * feeding the same measurement — or any measurement that clamps to the same height — writes nothing.
 */
export function stageDockHUpdate(h: number, current: number): number | null {
  const next = roundDockH(h)
  return next === current ? null : next
}
