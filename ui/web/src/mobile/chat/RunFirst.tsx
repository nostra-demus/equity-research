// The run-first empty state — desktop parity (ChatPanel's !present branch), phone-shaped:
//   flow swarm  → hint only (orbs run inside the gauntlet; there is no per-module launch)
//   run scope   → hint pointing at the desktop's Run full (the full pipeline stays desktop-only)
//   module      → the SAME paid launch the desktop button fires: POST /api/launch, immediately, with
//                 no confirm dialog — that IS the desktop behavior (LaunchConfirm gates only full runs
//                 and reruns). The button says plainly that it starts a paid engine run.
import { useState } from 'react'
import { api } from '../../lib/api'

const titleize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function RunFirst({ swarm, subject, scope, module, isFlow, staticMode }: {
  swarm: string
  subject: string
  scope: 'run' | 'module' | 'orb'
  module?: string
  isFlow: boolean
  staticMode: boolean
}) {
  const [pending, setPending] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const launch = async () => {
    if (pending || !module) return
    setPending(true)
    setNote(null)
    try {
      await api.launch({ kind: 'module', ticker: subject, module, swarm: swarm === 'research' ? undefined : swarm })
      setNote('Started — this chat unlocks when the module finishes.')
    } catch (e: any) {
      setNote(String(e?.message || e) || 'Could not start the run.')
      setPending(false)
    }
  }

  return (
    <div className="mrunfirst">
      <div className="mrunfirst__h">This {scope === 'run' ? 'run' : scope} hasn’t been produced yet</div>
      <p>Chat answers only from output the engine has already written. Run it first, then come back to ask about it.</p>
      {isFlow ? (
        <p className="mrunfirst__hint">This part of the signal hasn’t finished yet — it runs as part of the gauntlet. Come back once it completes.</p>
      ) : scope === 'run' ? (
        <p className="mrunfirst__hint">Running the whole pipeline is a desktop action — use <b>Run full ▸</b> there, then ask here.</p>
      ) : (
        <>
          <button className="mrunfirst__btn" disabled={staticMode || pending} onClick={() => void launch()}>
            {pending ? 'Starting…' : `Run ${titleize(module || '')} ▸`}
          </button>
          <p className="mrunfirst__hint">Starts a real engine run (paid), exactly as the desktop button does.</p>
        </>
      )}
      {note && <p className="mrunfirst__hint">{note}</p>}
    </div>
  )
}
