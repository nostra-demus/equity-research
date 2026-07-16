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
  onRunScoped,
  running,
}: {
  plan: IntakePlan
  keysFor: (module: string, agent: string) => Set<string>
  onRowEnter: (keys: Set<string>) => void
  onLeave: () => void
  onRun: () => void
  // launch the server-computed multi-orb batch (ONE rerun, merged cascade, early cutoff) — offered
  // only when the plan carries `batch` (old servers don't; the button falls back to onRun).
  onRunScoped?: () => void
  running: boolean
}) {
  const cmds = plan.rerun_plan?.commands ?? []
  const notes = plan.rerun_plan?.note_only ?? []

  if (cmds.length === 0) {
    return (
      <div className="iplan iplan--none">
        <div className="iplan__none-head">Nothing to re-run</div>
        <div className="iplan__none-note">
          {plan.new_docs.length} new document{plan.new_docs.length === 1 ? '' : 's'} read — none change an orb’s inputs. The current thesis stands.
        </div>
        {notes.length > 0 && (
          <ul className="iplan__notes">
            {notes.map((n, i) => (
              <li key={i} className="iplan__note"><b>{n.path.split('/').pop()}</b> — {n.reason}</li>
            ))}
          </ul>
        )}
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
      {plan.rerun_plan?.batch && onRunScoped ? (
        <>
          <button className="iplan__run" onClick={onRunScoped} disabled={running}>
            Re-run {plan.rerun_plan.batch.orbs.length} orb{plan.rerun_plan.batch.orbs.length === 1 ? '' : 's'} + only what they change — keep the rest
          </button>
          <div className="iplan__foot">
            One priced run; downstream syntheses re-run only where the refreshed evidence actually moved the decision (deterministic check — skipped work is shown, never hidden).{' '}
            <span role="button" tabIndex={0} style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={onRun} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRun() }}>
              Full module completion instead
            </span>
          </div>
        </>
      ) : (
        <>
          <button className="iplan__run" onClick={onRun} disabled={running}>
            Re-run {cmds.length} orb{cmds.length === 1 ? '' : 's'} + downstream — keep the rest
          </button>
          <div className="iplan__foot">Opens the scoped plan (priced, one confirm) — reruns never auto-spend.</div>
        </>
      )}
    </div>
  )
}
