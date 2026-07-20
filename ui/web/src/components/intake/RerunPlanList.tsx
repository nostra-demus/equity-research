import type { IntakePlan } from '../../lib/types'

const human = (s: string) => s.replace(/-/g, ' ')

// The scoped rerun plan: the specific orbs the new evidence justifies re-running, each with its reason and
// confidence. The primary action routes to the intake-scoped "Complete the thesis" panel (which keeps the
// unaffected modules and re-runs only these + their cascade) — one confirmed, priced, main-committing run.
export function RerunPlanList({
  plan,
  keysFor,
  onRowEnter,
  onLeave,
  onRun,
  running,
}: {
  plan: IntakePlan
  keysFor: (module: string, agent: string) => Set<string>
  onRowEnter: (keys: Set<string>) => void
  onLeave: () => void
  onRun: () => void
  running: boolean
}) {
  const cmds = plan.rerun_plan?.commands ?? []
  const notes = plan.rerun_plan?.note_only ?? []

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
      <button className="iplan__run" onClick={onRun} disabled={running}>
        Re-run {cmds.length} orb{cmds.length === 1 ? '' : 's'} + downstream — keep the rest
      </button>
      <div className="iplan__foot">Opens the scoped plan (priced, one confirm) — reruns never auto-spend.</div>
    </div>
  )
}
