// Client helpers over the intake plan (frameworks/INTAKE.md). Pure — no swarm ids, no side effects.
import type { AgentNode, IntakePlan } from './types'

// The modules a rerun of the plan would actually touch: each entry command's module PLUS its DAG cascade
// (the server already recomputed cascade_modules from the live graph). This is the set the "Complete the
// thesis" panel RE-RUNS; everything else finished stays kept — the "keep 5, re-run 1" intelligence.
export function affectedModules(plan: IntakePlan | null | undefined): Set<string> {
  const s = new Set<string>()
  for (const c of plan?.rerun_plan?.commands ?? []) {
    s.add(c.module)
    for (const m of c.cascade_modules ?? []) s.add(m)
  }
  return s
}

// Map the plan's entry orbs → constellation orb keys, so the intake surface can light ONLY the affected
// orbs (and dim the rest). Matches an orb by module + (name OR slug), the two forms a plan may carry.
export function focusKeysFor(plan: IntakePlan | null | undefined, nodesByKey: Map<string, AgentNode>): Set<string> {
  const want = new Set<string>()
  const add = (module: string, agent: string) => { want.add(`${module}::${agent}`) }
  for (const o of plan?.rerun_plan?.entry_orbs ?? []) add(o.module, o.agent)
  for (const d of plan?.new_docs ?? []) for (const o of d.entry_orbs ?? []) add(o.module, o.agent)
  const keys = new Set<string>()
  for (const n of nodesByKey.values()) {
    if (want.has(`${n.module}::${n.name}`) || want.has(`${n.module}::${n.slug}`)) keys.add(n.key)
  }
  return keys
}

// The terminal "resting" verdict of an intake plan that has NO scoped re-run work. This is the SINGLE
// source of truth for the safety gate the cockpit enforces (the dock and intakeHeadline both call it, and
// intake.test.ts pins every branch), so the "never falsely say 'no new data'" rule lives in exactly one
// place and cannot drift. Returns:
//   'up-to-date' — nothing new AND the server PROVED it read the whole current pool. The ONLY state that
//                  renders the affirmative "no new data — read and considered" claim. Requires
//                  `pool_current === true` (a POSITIVE match): an old server omits the field, and any
//                  unprovable case is `undefined` → NOT up-to-date (deploy-skew fail-closed).
//   'recheck'    — nothing new, but a file arrived after the analysis (`pool_current === false`) → prompt a
//                  re-analysis rather than falsely claim "nothing new".
//   null         — not a resting state: scoped work exists (new docs OR commands), there is no plan, or the
//                  currency is unknown/unprovable.
export type IntakeResting = 'up-to-date' | 'recheck' | null
export function intakeResting(plan: IntakePlan | null | undefined): IntakeResting {
  if (!plan) return null
  const docs = plan.new_docs?.length ?? 0
  const cmds = plan.rerun_plan?.commands?.length ?? 0
  if (docs !== 0 || cmds !== 0) return null // scoped work outstanding → never a "nothing new" verdict
  if (plan.pool_current === true) return 'up-to-date'
  if (plan.pool_current === false) return 'recheck'
  return null // undefined (old server / unprovable) → withhold any affirmative (fail-closed)
}

// A short, honest one-line headline for a banner. Delegates its empty-plan branch to `intakeResting`, so the
// safety gate has one definition; only the WORDING differs from the dock's richer card, never the logic.
export function intakeHeadline(plan: IntakePlan | null | undefined): string {
  if (!plan) return ''
  const n = plan.new_docs?.length ?? 0
  const cmds = plan.rerun_plan?.commands?.length ?? 0
  if (n === 0 && cmds === 0) {
    const resting = intakeResting(plan)
    if (resting === 'up-to-date') return 'No new data — everything has already been read and considered.'
    if (resting === 'recheck') return 'New documents have landed since the last check — re-analyze to read them.'
    return 'No new documents since the last run.'
  }
  if (cmds === 0) return `${n} new document${n === 1 ? '' : 's'} read and considered — none change any orb’s inputs. Nothing to re-run.`
  return `${n} new document${n === 1 ? '' : 's'} — ${cmds} orb${cmds === 1 ? '' : 's'} to re-run, the rest kept.`
}
