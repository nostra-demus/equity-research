// An in-process, per-key mutual-exclusion guard for a single async unit of work.
//
// Why this exists: `/api/thesis-plan/run` reads the plan, carries reused modules onto disk, THEN calls
// `launch()` — and only `launch()` registers a `RunState` that the route's own "is a run already in
// flight" busy-check can see. Everything before that (the busy-check itself, `thesisPlan`, and the carry)
// is synchronous, but Fastify's own machinery (rate-limit store, hooks, body parsing) can still interleave
// two requests for the SAME ticker across an `await` boundary that sits BEFORE the route handler's body
// ever runs. Two such requests can each observe "not busy" and both carry the same reuse set into the
// same target run root — a duplicate copy racing itself, and a thesis built from whichever copy wins.
//
// The fix does not depend on knowing where that boundary is. `held.has(key)` and `held.add(key)` are one
// synchronous statement pair with no `await` between them, so once ANY caller's code reaches them, no
// other caller can observe the key as free until this one releases it — a plain, single-threaded-JS mutex.
export class SubjectBusyError extends Error {
  constructor(public readonly key: string) {
    super(`already in progress for ${key}`)
    this.name = 'SubjectBusyError'
  }
}

const held = new Set<string>()

/** Runs `fn` exclusively for `key`. Throws `SubjectBusyError` (never runs `fn`) if `key` is already held.
 *  Always releases on the way out, including when `fn` throws or rejects. */
export async function withSubjectLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (held.has(key)) throw new SubjectBusyError(key)
  held.add(key)
  try {
    return await fn()
  } finally {
    held.delete(key)
  }
}
