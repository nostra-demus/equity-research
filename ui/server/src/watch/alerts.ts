// When a condition becomes a message: once, when it first turns true — and again only after the price has
// moved clearly away and come back. Pure: the previous state and this check's conditions go in; the
// messages to send and the next state come out.
//
// Three rules, each a way a naive "is it true now?" check floods or goes quiet:
//  1. ONCE. A condition that stays true sends nothing on the next check. A price bouncing around its buy
//     price is one message, not one per check.
//  2. RE-ARM ON A REAL MOVE. A price line fires again only after the price has moved 3% back past the line
//     and then crosses it again — never on a wobble around it. "Back past" is above a line reached by a fall,
//     and below one reached by a rise (your own at-or-above trigger).
//  3. QUIET START. The first time a name is seen (the day this is switched on, a restart onto an empty
//     state, or new research) every condition that is ALREADY true is recorded as the starting point
//     instead of being sent as news. The caller sends one "already there" summary in its place.
import type { Condition } from './evaluate'

export const REARM_PCT = 3

export interface FiredEntry {
  at: string
  /** The price line this condition is about, for re-arming. Null for dates and other non-price facts. */
  line: number | null
  /** The line is reached by a rise (your at-or-above trigger): it re-arms after a move back below it. */
  rises?: boolean
}

export interface NameAlertState {
  listing_key: string
  run_root: string | null
  first_seen_at: string
  fired: Record<string, FiredEntry>
}

export interface AlertStep {
  state: NameAlertState
  /** Conditions that just turned true and should be told. */
  events: Condition[]
  /** This check set the starting point rather than comparing against one. */
  baseline: boolean
  /** The research behind the name changed since the last check. */
  researchChanged: boolean
}

/** "No price" is shown on the screen, never sent: a feed hiccup would otherwise send one every few
 *  minutes, and the screen already says it plainly. */
const told = (c: Condition) => c.type !== 'cant_check'

const entry = (c: Condition, at: string): FiredEntry => (c.rises ? { at, line: c.line, rises: true } : { at, line: c.line })

export function stepAlerts(
  prev: NameAlertState | undefined,
  input: { listing_key: string; run_root: string | null; conditions: Condition[]; price: number | null; now: Date },
  rearmPct: number = REARM_PCT,
): AlertStep {
  const at = input.now.toISOString()
  const current = input.conditions.filter(told)
  const researchChanged = !!(prev && prev.run_root && input.run_root && prev.run_root !== input.run_root)

  if (!prev || researchChanged) {
    const fired: Record<string, FiredEntry> = {}
    for (const c of current) fired[c.id] = entry(c, at)
    return {
      state: { listing_key: input.listing_key, run_root: input.run_root, first_seen_at: prev?.first_seen_at ?? at, fired },
      events: [],
      baseline: true,
      researchChanged,
    }
  }

  const fired: Record<string, FiredEntry> = {}
  const events: Condition[] = []
  const nowIds = new Set(current.map((c) => c.id))
  for (const c of current) {
    const had = prev.fired[c.id]
    if (had) fired[c.id] = had
    else { fired[c.id] = entry(c, at); events.push(c) }
  }
  for (const [id, had] of Object.entries(prev.fired)) {
    if (nowIds.has(id) || had.line == null) continue
    // A price line stays "already told" while the price hovers near it; only a clear move back past the line
    // re-arms it. With no price this check, nothing can be said about the move, so it stays told.
    const near = input.price == null
      || (had.rises ? input.price > had.line * (1 - rearmPct / 100) : input.price < had.line * (1 + rearmPct / 100))
    if (near) fired[id] = had
  }
  return {
    state: { listing_key: input.listing_key, run_root: input.run_root ?? prev.run_root, first_seen_at: prev.first_seen_at, fired },
    events,
    baseline: false,
    researchChanged: false,
  }
}
