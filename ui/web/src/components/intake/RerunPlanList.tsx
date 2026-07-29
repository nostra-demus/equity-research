import { useState } from 'react'
import type { AgentNode, IntakePlan } from '../../lib/types'

const human = (s: string) => s.replace(/-/g, ' ')

// The scoped rerun plan: the specific orbs the new evidence justifies re-running, each with its reason and
// confidence. The primary action opens a CONFIRM strip in place (priced from the server-validated plan +
// the discovered graph — the client never assembles orb lists) and then launches the one-pass scoped
// rerun (/api/intake-plan/run): the invalidated orbs, each affected synthesis once, one master, one
// commit. The ghost fallback keeps the old module-granularity path ("Complete the thesis") for a user who
// wants whole modules re-run.
export function RerunPlanList({
  plan,
  keysFor,
  nodesByKey,
  onRowEnter,
  onLeave,
  onRun,
  onRunScoped,
  scopedPending,
  running,
}: {
  plan: IntakePlan
  keysFor: (module: string, agent: string) => Set<string>
  nodesByKey: Map<string, AgentNode>
  onRowEnter: (keys: Set<string>) => void
  onLeave: () => void
  onRun: () => void
  onRunScoped: () => void
  scopedPending: boolean
  running: boolean
}) {
  const cmds = plan.rerun_plan?.commands ?? []
  const notes = plan.rerun_plan?.note_only ?? []
  // Hook BEFORE any conditional return: a mounted panel can move between zero and some commands (a
  // re-analyze while open), and a hook that appears only on one side of that boundary breaks React's hook
  // order exactly when scoped work appears (Codex #358 r3672400200 P1).
  const [confirming, setConfirming] = useState(false)

  if (cmds.length === 0) {
    return (
      <div className="iplan iplan--none">
        <div className="iplan__none-head">Nothing to re-run</div>
        <div className="iplan__none-note">
          {plan.new_docs.length} new document{plan.new_docs.length === 1 ? '' : 's'} read and considered — none change an orb’s inputs. The current thesis stands.
        </div>
        {notes.length > 0 && (
          <ul className="iplan__notes">
            {notes.map((n, i) => (
              <li key={i} className="iplan__note"><b>{n.path.split('/').pop()}</b> — {n.reason}</li>
            ))}
          </ul>
        )}
        {/* The recommendation is "don't spend" — but it is a RECOMMENDATION (INTAKE.md: advisory,
            "augment the floor, never replace it"), and a reader who disagrees was left with nowhere to
            click at all. This is the same priced, one-confirm plan the Re-run button opens; it never
            launches anything by itself. Secondary styling: the engine's advice is still "no". */}
        <button className="iplan__run iplan__run--ghost" onClick={onRun} disabled={running}>
          Re-run anyway…
        </button>
        <div className="iplan__foot">Opens the run plan so you can pick what to re-run — nothing spends until you confirm.</div>
      </div>
    )
  }

  // ---- the scoped price, derived from server-validated data only ----
  // stale set = each command's module ∪ its server-recomputed cascade (cascade_modules INCLUDES the own
  // module; 'master' never appears in it — see intake.ts cascadeModulesFor). One synthesis re-runs per
  // stale module; every other specialist orb in the graph is carried, stamped, and skipped.
  const stale = new Set<string>()
  for (const c of cmds) { stale.add(c.module); for (const m of c.cascade_modules ?? []) stale.add(m) }
  // Only SPECIALIST commands re-run an orb; a command targeting a module's synthesis re-runs no
  // specialist at all (carryForwardScoped stages that module synthesis-only), so counting it here would
  // understate what is carried by one (Codex #358 r3672541975).
  const synthKeys = new Set([...nodesByKey.values()].filter((n) => n.isSynthesis).flatMap((n) => [`${n.module}::${n.name}`, `${n.module}::${n.slug}`]))
  const specialistCmds = cmds.filter((c) => !synthKeys.has(`${c.module}::${c.agent}`)).length
  const specialists = [...nodesByKey.values()].filter((n) => !n.isSynthesis).length
  const carriedOrbs = Math.max(0, specialists - specialistCmds)

  if (confirming) {
    return (
      <div className="iplan">
        <div className="iplan__rows">
          {cmds.map((c) => (
            <div
              key={c.command}
              className="iplan__row"
              onMouseEnter={() => onRowEnter(keysFor(c.module, c.agent))}
              onMouseLeave={onLeave}
            >
              <span className="iplan__orb">{human(c.module)} · {human(c.agent)}</span>
              <span className="iplan__conf" aria-hidden />
              <span className="iplan__verb">re-runs</span>
            </div>
          ))}
          <div className="iplan__row iplan__row--synth">
            <span className="iplan__orb iplan__orb--synth">{stale.size} module synthes{stale.size === 1 ? 'is' : 'es'} re-read the refreshed orbs</span>
            <span className="iplan__verb iplan__verb--once">once each</span>
          </div>
          <div className="iplan__row iplan__row--synth">
            <span className="iplan__orb iplan__orb--synth">master + finish-gate + memo + audit</span>
            <span className="iplan__verb iplan__verb--once">once</span>
          </div>
          <div className="iplan__row iplan__row--synth">
            <span className="iplan__orb iplan__orb--synth">every other orb ({carriedOrbs}) carried, stamped</span>
            <span className="iplan__verb iplan__verb--once">not re-run</span>
          </div>
        </div>
        <button className="iplan__run" onClick={onRunScoped} disabled={running || scopedPending}>
          {scopedPending ? 'Starting…' : `Re-run scoped — ${cmds.length} orb${cmds.length === 1 ? '' : 's'} + ${stale.size} synthes${stale.size === 1 ? 'is' : 'es'} + master ▸`}
        </button>
        {/* the old module-granularity path stays one click away, honestly labeled */}
        <button className="iplan__run iplan__run--ghost" onClick={onRun} disabled={running || scopedPending}>
          Re-run whole modules instead…
        </button>
        {/* honest to BOTH launcher modes (monolithic and per-module chained): the invariant is that only
            the final master writes the thesis — commit cadence and parallelism vary by engine config, so
            neither is promised here (Codex #358 r3672400217) */}
        <div className="iplan__foot">One pass, one final thesis — no intermediate decision ever ships.</div>
      </div>
    )
  }

  return (
    <div className="iplan">
      <div className="iplan__rows">
        {cmds.map((c) => (
          <div
            key={c.command}
            className="iplan__row"
            onMouseEnter={() => onRowEnter(keysFor(c.module, c.agent))}
            onMouseLeave={onLeave}
          >
            <span className="iplan__orb">{human(c.module)} · {human(c.agent)}</span>
            <span className="iplan__conf" aria-hidden />
            {c.cascade_modules.length > 1 && (
              <span className="iplan__cascade">+ {c.cascade_modules.length - 1} downstream</span>
            )}
          </div>
        ))}
      </div>
      <button className="iplan__run" onClick={() => setConfirming(true)} disabled={running || scopedPending}>
        Re-run {cmds.length} orb{cmds.length === 1 ? '' : 's'} + downstream — keep the rest
      </button>
      <div className="iplan__foot">Opens the scoped plan (priced, one confirm) — reruns never auto-spend.</div>
    </div>
  )
}
