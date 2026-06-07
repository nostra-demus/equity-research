// ---- live timing + honest ETA for the running swarm ----
// The cockpit shows a per-orb and per-module timer while a run is in flight. An orb's clock starts the
// instant the orchestrator dispatches it (SSE 'agent-started' -> status 'running') — "the data reaching
// the orb" — and stops when its output file lands ('agent-done'). Both endpoints are SERVER timestamps,
// so a single orb's measured duration is clock-skew-free; only a still-running orb's live elapsed leans
// on rough client/server clock agreement, and we clamp it to >= 0.
//
// ETA discipline (CLAUDE.md §10/§11 — no false precision): there is NO historical per-orb duration store,
// so the per-orb estimate is LEARNED within the current run. As orbs finish we take the median of observed
// durations (robust to one slow outlier), split specialist vs synthesis (the module's heavy writer orb runs
// longer). Before any orb has finished we fall back to a seed. Module/run "time left" is a progress
// projection (elapsed / fraction-done), floored by the longest in-flight orb so it can never claim less
// time than an orb that just started will itself take. Everything is surfaced as "~" approximate.

import type { NodeRuntime } from './types'

// Three orb classes with very different runtimes — lumping them would bias every estimate. Gate orbs are
// the fast fail-fast / data-triage checks (~20s); specialists are the analytical workhorses (~50s);
// synthesis is the heavy module writer that reads all its specialists (~95s). Seeds are used until the
// run produces its own evidence, then the observed median of each class takes over within one finished orb.
export type OrbClass = 'gate' | 'specialist' | 'synthesis'
const SEED: Record<OrbClass, number> = { gate: 20_000, specialist: 50_000, synthesis: 95_000 }
const MIN_SAMPLE = 1 // one finished orb of a class is enough to start trusting observation over the seed

export interface OrbSample {
  durationMs: number
  cls: OrbClass
}

export interface ExpectedDurations {
  gate: number
  specialist: number
  synthesis: number
  learned: boolean // true once at least one orb has finished this run
}

function median(xs: number[]): number {
  if (!xs.length) return NaN
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Collect finished-orb durations from the live runtime map. Only orbs that actually streamed this session
// carry startedAt+endedAt; manifest-seeded "done" orbs (no timestamps) are correctly ignored.
export function collectSamples(runtime: Record<string, NodeRuntime>, classOf: (key: string) => OrbClass): OrbSample[] {
  const out: OrbSample[] = []
  for (const [key, rt] of Object.entries(runtime)) {
    if (rt.startedAt && rt.endedAt && rt.endedAt > rt.startedAt) {
      out.push({ durationMs: rt.endedAt - rt.startedAt, cls: classOf(key) })
    }
  }
  return out
}

export function expectedDurations(samples: OrbSample[]): ExpectedDurations {
  const durs = (cls: OrbClass) => samples.filter((s) => s.cls === cls).map((s) => s.durationMs)
  const spec = durs('specialist')
  const synth = durs('synthesis')
  const gate = durs('gate')
  return {
    gate: gate.length >= MIN_SAMPLE ? median(gate) : SEED.gate,
    specialist: spec.length >= MIN_SAMPLE ? median(spec) : SEED.specialist,
    // synthesis falls back to (a) observed synthesis, else (b) ~1.8x observed specialist, else its seed
    synthesis: synth.length >= MIN_SAMPLE ? median(synth) : spec.length >= MIN_SAMPLE ? median(spec) * 1.8 : SEED.synthesis,
    learned: samples.length >= MIN_SAMPLE,
  }
}

export function expectedFor(cls: OrbClass, exp: ExpectedDurations): number {
  return exp[cls]
}

// Classify an orb from its graph flags: the heavy synthesis writer, a fast fail-fast gate, else a
// regular analytical specialist. (Synthesis is never fail-fast, but check it first to be safe.)
export function orbClass(node: { failFast: boolean; isSynthesis: boolean }): OrbClass {
  return node.isSynthesis ? 'synthesis' : node.failFast ? 'gate' : 'specialist'
}

// A running orb's progress toward its own expected duration. Pins at 1 on overrun; the caller then drops
// the determinate sweep and shows the indeterminate "still working" pulse rather than lying it's complete.
export interface OrbProgress {
  elapsedMs: number
  remainingMs: number
  fraction: number // 0..1, clamped
  overrun: boolean
}
export function orbProgress(startedAt: number, expectedMs: number, now: number): OrbProgress {
  const elapsedMs = Math.max(0, now - startedAt)
  const fraction = expectedMs > 0 ? Math.min(1, elapsedMs / expectedMs) : 0
  const overrun = elapsedMs > expectedMs
  return { elapsedMs, remainingMs: Math.max(0, expectedMs - elapsedMs), fraction, overrun }
}

// Aggregate timing for a set of orbs (one module, or a whole run). `orbs` is every planned orb in scope.
export interface ScopeOrb {
  startedAt?: number
  endedAt?: number
  status: string
  cls: OrbClass
}
export interface ScopeTiming {
  started: boolean // has at least one orb in scope begun? (data has "reached" the scope)
  live: boolean // anything still queued/running?
  done: number
  total: number
  elapsedMs: number // since the first orb in scope started
  etaRemainingMs: number | null // honest "time left"; null until estimable
  fraction: number // done / total
}
export function scopeTiming(orbs: ScopeOrb[], exp: ExpectedDurations, now: number): ScopeTiming {
  const total = orbs.length
  const done = orbs.filter((o) => o.endedAt || o.status === 'done').length
  const starts = orbs.map((o) => o.startedAt).filter((v): v is number => !!v)
  const started = starts.length > 0
  const live = orbs.some((o) => o.status === 'queued' || o.status === 'running')
  const firstStart = started ? Math.min(...starts) : now
  const elapsedMs = started ? Math.max(0, now - firstStart) : 0
  const fraction = total ? done / total : 0

  // longest-pole floor: the scope cannot finish before its currently-running orbs do
  let longestPole = 0
  for (const o of orbs) {
    if (o.status === 'running' && o.startedAt) {
      const rem = Math.max(0, expectedFor(o.cls, exp) - (now - o.startedAt))
      if (rem > longestPole) longestPole = rem
    }
  }

  let etaRemainingMs: number | null = null
  if (live) {
    if (done > 0 && fraction > 0 && elapsedMs > 5_000) {
      // progress projection — self-calibrating once real evidence exists
      const projectedTotal = elapsedMs / fraction
      etaRemainingMs = Math.max(projectedTotal - elapsedMs, longestPole)
    } else {
      // too early to project: seed-sum of the not-yet-done orbs over the observed/assumed parallel width
      const remainingWork = orbs
        .filter((o) => !(o.endedAt || o.status === 'done'))
        .reduce((s, o) => {
          if (o.status === 'running' && o.startedAt) return s + Math.max(0, expectedFor(o.cls, exp) - (now - o.startedAt))
          return s + expectedFor(o.cls, exp)
        }, 0)
      const peakConcurrency = Math.max(1, orbs.filter((o) => o.status === 'running').length)
      etaRemainingMs = Math.max(remainingWork / Math.min(peakConcurrency || 3, 4), longestPole)
    }
  }
  return { started, live, done, total, elapsedMs, etaRemainingMs, fraction }
}

// ---- formatting (all numerals tabular-nums in CSS) ----

// running stopwatch, M:SS (or H:MM:SS past an hour — runs never get there, but be correct)
export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

// compact span for a FINISHED duration: "8s", "47s", "1m 12s", "3m"
export function fmtSpan(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem ? `${m}m ${rem}s` : `${m}m`
}

// honest "time left" microcopy. Rounds to a calm granularity (never a jittery per-second countdown),
// collapses to a soft "wrapping up…" in the last few seconds, and always wears the "~".
export function fmtEtaLeft(ms: number | null): string {
  if (ms == null) return ''
  if (ms < 8_000) return 'wrapping up…'
  if (ms < 90_000) {
    const s = Math.round(ms / 1000 / 5) * 5 // nearest 5s
    return `~${s}s left`
  }
  const m = Math.round(ms / 60_000)
  return `~${m} min left`
}
