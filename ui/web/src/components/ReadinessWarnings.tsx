import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import type { ReadinessIssue } from '../lib/types'

function IssueRow({ issue, kind }: { issue: ReadinessIssue; kind: 'must' | 'minor' }) {
  return (
    <div className="rdg-issue">
      <span className={`rdg-mark rdg-mark--${kind}`}>●</span>
      <div className="rdg-ib">
        <div className="rdg-ititle">{issue.message}</div>
        {issue.evidence && <div className="rdg-idesc"><span className="rdg-mono">{issue.evidence}</span></div>}
        {issue.affectedModules && issue.affectedModules.length > 0 && (
          <div className="rdg-idesc">Affects {issue.affectedModules.join(' · ')}</div>
        )}
        {issue.suggestedFix && <div className="rdg-ifix">→ {issue.suggestedFix}</div>}
        {issue.capIfProceeded && <div className="rdg-icost">If you run anyway: {issue.capIfProceeded}</div>}
      </div>
    </div>
  )
}

// Small inline spinner — reuses the empty-state primitive (`.empty__spin`), which already carries its
// own prefers-reduced-motion guard, so a busy button reads as working without a new keyframe.
function Spin() {
  return (
    <svg className="empty__spin rdg-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" />
    </svg>
  )
}

type Action = 'cancel' | 'recheck' | 'proceed' | 'override'

export function ReadinessWarnings() {
  const gate = useStore((s) => s.readinessGate)
  const decide = useStore((s) => s.decideReadiness)
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState<Action | null>(null)

  // Re-enable the buttons whenever the gate's run or report changes (a re-check came back, possibly
  // still-not-clean) or the panel closes — so the buttons never get stuck disabled. `store.decideReadiness`
  // handles the STALE case (409/404 → it closes this panel), so a dead dialog can't strand the user.
  const runId = gate?.runId
  const reportTs = gate?.report.ts
  useEffect(() => { setPending(null) }, [runId, reportTs])

  if (!gate) return null

  const { report } = gate
  const blockers = report.issues.filter((i) => i.severity === 'blocker')
  const degrades = report.issues.filter((i) => i.severity === 'degrade')
  const hasBlocker = blockers.length > 0
  const ticker = report.ticker
  const ackOk = typed.trim().toUpperCase() === ticker.toUpperCase()
  const entityNames = Array.from(new Set(report.entities.map((e) => e.entity).filter(Boolean)))

  // A decision is in flight if we've POSTed one (pending) OR the server told us a re-check is running
  // (gate.rechecking, via the readiness-checking SSE). Either way the buttons show progress + disable,
  // so the panel never looks frozen while the (sometimes slow, OCR-bearing) check runs.
  const rechecking = !!gate.rechecking || pending === 'recheck'
  const busy = pending !== null || !!gate.rechecking

  const act = async (action: Action) => {
    if (busy) return
    setPending(action)
    try {
      await decide(gate.runId, action, action === 'override' ? typed.trim() : undefined)
    } finally {
      setPending((p) => (p === action ? null : p))
    }
  }

  // a plain-English headline: prefer the entity-mismatch story, otherwise a generic summary. For the
  // mismatch we LIST the detected names rather than assert which one is wrong (the engine can't know).
  const lede = !hasBlocker ? (
    <>The data is usable but <b>weaker than ideal</b> — the run can still proceed, with the caveats below.</>
  ) : blockers.some((b) => b.code === 'entity_disagreement') && entityNames.length > 1 ? (
    <>The files name <b>more than one company</b> ({entityNames.map((n) => `“${n}”`).join(', ')}) — the pool may mix entities, but you asked to analyze <b>{ticker}</b>. Running now risks building the analysis on the wrong company.</>
  ) : (
    <>The data check found a problem that would make this run unreliable. Review it before spending any tokens.</>
  )

  return (
    <div className="scrim">
      <motion.div
        className="modal rdg"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rdg-head">
          <div className={`rdg-hicon ${hasBlocker ? 'rdg-hicon--bad' : 'rdg-hicon--warn'}`}>⚠</div>
          <div>
            <div className="modal__title">{hasBlocker ? 'Data check found a problem' : 'Data check — minor issues'}</div>
            <div className="rdg-sub">{ticker} · {report.kind} run · no tokens spent yet</div>
          </div>
        </div>

        <div className={`rdg-lede ${hasBlocker ? 'rdg-lede--bad' : 'rdg-lede--warn'}`}>{lede}</div>
        <div className="rdg-rec">
          <b>Recommended:</b>{' '}
          {hasBlocker ? 'fix the files, then re-check. Only run anyway if you’re sure.' : 'you can proceed, or add the missing data and re-check for a stronger run.'}
        </div>

        {rechecking && (
          <div className="rdg-checking"><Spin /> Re-checking the data pool… scanned PDFs are being read (OCR) — this can take a moment the first time.</div>
        )}

        <div className="rdg-scroll">
          {hasBlocker && (
            <>
              <div className="rdg-ghead"><span className="rdg-glabel rdg-glabel--must">⛔ Must fix</span><span className="rdg-gcount">{blockers.length}</span></div>
              {blockers.map((b, i) => <IssueRow key={`b${i}`} issue={b} kind="must" />)}
            </>
          )}
          {degrades.length > 0 && (
            <>
              <div className="rdg-ghead"><span className="rdg-glabel rdg-glabel--minor">⚠ Minor</span><span className="rdg-gcount">{degrades.length}</span><span className="rdg-gnote">— the run can still proceed</span></div>
              {degrades.map((d, i) => <IssueRow key={`d${i}`} issue={d} kind="minor" />)}
            </>
          )}
        </div>

        <div className="rdg-actions">
          <span style={{ flex: 1 }} />
          <button className="btn btn--ghost" disabled={busy} onClick={() => act('cancel')}>
            {pending === 'cancel' ? <><Spin /> Cancelling…</> : 'Cancel'}
          </button>
          <button className={`btn ${hasBlocker ? 'btn--amber' : 'btn--ghost'}`} disabled={busy} onClick={() => act('recheck')}>
            {rechecking ? <><Spin /> Re-checking…</> : <>↻ Fix &amp; re-check</>}
          </button>
          {!hasBlocker && (
            <button className="btn btn--amber" disabled={busy} onClick={() => act('proceed')}>
              {pending === 'proceed' ? <><Spin /> Starting…</> : 'Proceed ▸'}
            </button>
          )}
        </div>

        {hasBlocker && (
          <div className="rdg-danger">
            <div className="rdg-danger__h"><b>Run anyway</b> (not recommended) — type the ticker <b style={{ color: 'var(--accent-bright)' }}>{ticker}</b> to confirm you understand the result may be wrong:</div>
            <div className="rdg-danger__row">
              <input
                className="rdg-input"
                placeholder={ticker}
                value={typed}
                disabled={busy}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && ackOk && !busy) act('override') }}
              />
              <button className="btn btn--danger" disabled={!ackOk || busy} onClick={() => act('override')}>
                {pending === 'override' ? <><Spin /> Starting…</> : 'Run anyway ▸'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
