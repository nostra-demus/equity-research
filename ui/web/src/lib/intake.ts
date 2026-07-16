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

// Does a run that is NOT a doc-intake hold the subject busy? The server returns 409 subject_busy from
// /api/intake/:ticker/analyze for ANY in-flight run on the subject (ui/server/src/server.ts), but only a
// racing doc-intake's write IS the intake plan the Analyze poll loop waits for. If a full/module run is the
// one in flight, no plan is coming — so the caller should stop and say so instead of polling for 3 minutes.
// Feed this the SERVER-truth active-run list (store.globalActive), not the tab-local adopted set, so a run
// started in another tab or headlessly is still seen. Scoped to `ticker` because globalActive spans subjects.
export function blockingRunForIntake(
  active: ReadonlyArray<{ ticker: string; kind: string }>,
  ticker: string,
): boolean {
  return active.some((r) => r.ticker === ticker && r.kind !== 'doc-intake')
}

// A short, honest headline for the intake state, used by the dock + the thesis panel banner.
export function intakeHeadline(plan: IntakePlan | null | undefined): string {
  if (!plan) return ''
  const n = plan.new_docs?.length ?? 0
  const cmds = plan.rerun_plan?.commands?.length ?? 0
  if (n === 0) return 'No new documents since the last run.'
  if (cmds === 0) return `${n} new document${n === 1 ? '' : 's'} — none change any orb’s inputs. Nothing to re-run.`
  return `${n} new document${n === 1 ? '' : 's'} — ${cmds} orb${cmds === 1 ? '' : 's'} to re-run, the rest kept.`
}
