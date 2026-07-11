// The reader's LAUNCH BAR for wire-only swarms — what replaces the flow stage's "Run the checks"
// gauntlet footer when an event is read on a subject-grouped wire. It resolves which of the swarm's
// subjects the event names and offers ONE decisive action per subject: "Run full ▸ GOLD" — the same
// select-then-confirm arc as the top bar's Run-full pill (estimate → LaunchConfirm → the constellation
// animates), so reading an event flows straight into launching the research pipeline on its commodity.
// Beside the CTA: the subject's last verdict (when a dossier exists) and its live-run state.

import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'
import { subjectsOfItem } from '../../lib/wire'
import { useWireConfig } from './WireContext'

const agoDays = (iso?: string): string => {
  if (!iso) return ''
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000)
  return d <= 0 ? 'today' : d === 1 ? '1d ago' : `${d}d ago`
}

export function WireLaunchBar({ it }: { it: FeedItem }) {
  const cfg = useWireConfig()
  const pulse = useStore((s) => s.wirePulse)
  const activeRuns = useStore((s) => s.activeRunsByTicker)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  const launchPending = useStore((s) => s.launchPending)
  const health = useStore((s) => s.health)
  const staticMode = useStore((s) => s.staticMode)
  const subjects = subjectsOfItem(it, cfg)
  const offline = health !== 'online'
  if (!subjects.length) {
    return (
      <div className="wirelaunch wirelaunch--untracked">
        Not a tracked subject — add a <code>## NAME</code> section to the swarm's profiles file to track it.
      </div>
    )
  }
  return (
    <div className="wirelaunch">
      {subjects.map((s) => {
        const running = activeRuns.has(s)
        const verdict = pulse[s]?.verdict
        const busy = running || launchPending?.key === 'full'
        return (
          <span key={s} className="wirelaunch__slot">
            <button
              type="button"
              className="wirelaunch__cta"
              onClick={() => void requestFullForSubject(s)}
              disabled={staticMode || offline || busy}
              title={
                staticMode ? 'Showcase mode — no engine to run'
                : offline ? 'The engine is offline — reconnect to launch'
                : running ? `A full ${s} run is already in flight`
                : `Run the full research pipeline on ${s} (you confirm the cost first)`
              }
            >
              {running ? `running ${s}…` : `Run full ▸ ${s}`}
            </button>
            {verdict ? (
              <span className="wirelaunch__verdict" title={`The last finished run's action verdict (${verdict.at || 'undated'})`}>
                Last run: <strong>{verdict.action}</strong>{verdict.at ? ` · ${agoDays(verdict.at)}` : ''}
              </span>
            ) : (
              <span className="wirelaunch__verdict wirelaunch__verdict--none">No dossier yet — this run will be its first.</span>
            )}
          </span>
        )
      })}
    </div>
  )
}
