import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { decisionColor, moduleLabel } from '../lib/format'
import type { RunHistoryEntry } from '../lib/types'

// Session cache of a ticker's run history, shared across EVERY host that renders RunHistory (the first-time
// CompanyPicker and the top-right CommandBar dropdown), so re-expanding a row — or switching between the two
// selectors — never refetches. A failed fetch is deliberately NOT cached, so the next open retries.
const cache = new Map<string, RunHistoryEntry[]>()

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
const runKindLabel = (run: RunHistoryEntry) =>
  run.hasDossier ? 'Full dossier' : run.modules.length ? run.modules.map((m) => cap(moduleLabel(m))).join(', ') : 'Run'

// The inline timeline of every run for a ticker (newest-first): full-dossier vs which modules, its verdict,
// the standing-run tag, and an Open affordance. The ONE shared surface both company selectors mount, so the
// run-history view can't drift between them. Self-fetches from GET /api/runs?ticker= (cached above). The host
// owns the chevron/expand + the "N runs"/"newer run" row cues; this owns the timeline.
export function RunHistory({ ticker, standingRunRoot, onOpen }: {
  ticker: string
  standingRunRoot?: string | null
  onOpen: (runRoot: string) => void
}) {
  const [runs, setRuns] = useState<RunHistoryEntry[] | null>(() => cache.get(ticker) ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cached = cache.get(ticker)
    if (cached) { setRuns(cached); setError(false); return }
    let alive = true
    setRuns(null); setError(false)
    api.history(ticker)
      .then((r) => { cache.set(ticker, r.history); if (alive) setRuns(r.history) })
      .catch(() => { if (alive) setError(true) }) // not cached -> re-opening the row retries
    return () => { alive = false }
  }, [ticker])

  if (error) return <div className="runhist"><div className="runhist__error">Couldn’t load run history.</div></div>
  if (!runs) return (
    <div className="runhist">
      <div className="runhist__row runhist__row--skel"><span className="skel" style={{ height: 12, width: '55%', borderRadius: 4 }} /></div>
      <div className="runhist__row runhist__row--skel"><span className="skel" style={{ height: 12, width: '40%', borderRadius: 4 }} /></div>
    </div>
  )
  if (!runs.length) return <div className="runhist"><div className="runhist__empty">No run history found.</div></div>

  return (
    <div className="runhist">
      {runs.map((run) => {
        const standing = run.runRoot === standingRunRoot
        const vc = run.decision ? decisionColor(run.decision) : null
        return (
          <div key={run.runRoot} className={`runhist__row${standing ? ' is-standing' : ''}`}>
            <span className="runhist__date">{run.date}</span>
            <span className="runhist__kind">
              {runKindLabel(run)}
              {run.modules.length > 0 && <span className="runhist__chip">{run.modules.length} module{run.modules.length === 1 ? '' : 's'}</span>}
            </span>
            <span className="runhist__state">
              {vc && run.decision ? (
                <span className="runhist__pill" style={{ color: vc, borderColor: `color-mix(in srgb, ${vc} 40%, transparent)`, background: `color-mix(in srgb, ${vc} 12%, transparent)` }}>
                  {run.decision}
                  {run.confidence != null && <span className="runhist__conf"> · {run.confidence}</span>}
                </span>
              ) : (
                <span className="runhist__muted">no decision</span>
              )}
              {standing && <span className="runhist__tag" title="The verdict currently shown for this company">standing</span>}
            </span>
            <button type="button" className="runhist__open" onClick={() => onOpen(run.runRoot)}>
              Open{run.hasDossier ? ' dossier' : ''}
            </button>
          </div>
        )
      })}
    </div>
  )
}
