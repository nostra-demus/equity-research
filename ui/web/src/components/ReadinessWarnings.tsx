import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { isPhysicallyEmptyReadiness, readinessDecisionWaitsForSse, useStore } from '../lib/store'
import { Spin } from './Spin'
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

type Action = 'cancel' | 'recheck' | 'proceed' | 'override'

export function isTechnicalReadinessFailure(issues: ReadinessIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'blocker' && issue.code === 'check_failed')
}

export function ReadinessWarnings() {
  const gate = useStore((s) => s.readinessGate)
  const queuedGates = useStore((s) => s.readinessGateQueue)
  const decide = useStore((s) => s.decideReadiness)
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState<Action | null>(null)

  // Re-enable the local request latch only when SSE advances the lifecycle. In particular, the recheck
  // POST now acknowledges early, before the scan finishes; clearing `pending` on that HTTP response made
  // a second click race the live scan and receive a misleading 409. Once readiness-checking arrives the
  // store-owned spinner takes over; report/blocked/resolved then finishes the cycle.
  const runId = gate?.runId
  const reportTs = gate?.report.ts
  const gateRechecking = !!gate?.rechecking
  useEffect(() => { setPending(null) }, [runId, reportTs, gateRechecking])
  // Typed override consent belongs to one exact report. A promoted FIFO gate (or a changed report for the
  // same ticker) must never inherit an already-armed Run-anyway button from the previous decision.
  useEffect(() => { setTyped('') }, [runId, reportTs])

  if (!gate) return null

  const { report } = gate
  const blockers = report.issues.filter((i) => i.severity === 'blocker')
  const degrades = report.issues.filter((i) => i.severity === 'degrade')
  const hasBlocker = blockers.length > 0
  const checkerFailed = isTechnicalReadinessFailure(report.issues)
  // Only the server's complete parser-free proof may remove the override. A
  // legacy/standalone `zero_usable_data` result can mean corrupt or unsupported
  // non-empty files, which is not the same as an empty folder.
  const emptyPool = isPhysicallyEmptyReadiness(report)
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
    let outcome: Awaited<ReturnType<typeof decide>> = 'failed'
    try {
      outcome = await decide(gate.runId, action, action === 'override' ? typed.trim() : undefined)
    } finally {
      // An accepted/already-active recheck is not complete at HTTP ACK. Keep the button latched until
      // readiness-checking/report/blocked/resolved SSE moves the gate. Errors clear immediately so retry
      // remains possible when no lifecycle event will follow.
      if (!readinessDecisionWaitsForSse(action, outcome)) {
        setPending((p) => (p === action ? null : p))
      }
    }
  }

  // a plain-English headline: prefer the entity-mismatch story, otherwise a generic summary. For the
  // mismatch we LIST the detected names rather than assert which one is wrong (the engine can't know).
  const lede = emptyPool ? (
    <>No usable company data was found. Add at least one readable filing, transcript, spreadsheet, or note before starting.</>
  ) : checkerFailed ? (
    <>The safety checker had a <b>technical error</b>. This does not mean your files are missing or bad. The research engine has not started.</>
  ) : !hasBlocker ? (
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
            <div className="modal__title">{emptyPool ? 'No usable data found' : checkerFailed ? 'Safety check unavailable' : hasBlocker ? 'Data check found a problem' : 'Data check — minor issues'}</div>
            <div className="rdg-sub">{ticker} · {report.kind} run · this step has not started</div>
          </div>
        </div>

        <div className={`rdg-lede ${hasBlocker ? 'rdg-lede--bad' : 'rdg-lede--warn'}`}>{lede}</div>
        <div className="rdg-rec">
          <b>Recommended:</b>{' '}
          {checkerFailed
            ? 'try the check once more. If it returns, the checker needs repair — do not change your files.'
            : emptyPool ? 'add company files, wait for them to appear in the Data pool, then re-check.'
              : hasBlocker ? 'fix the files, then re-check. Only run anyway if you’re sure.' : 'you can proceed, or add the missing data and re-check for a stronger run.'}
        </div>

        {queuedGates.length > 0 && (
          <div className="rdg-rec">One check is shown at a time. {queuedGates.length} more check{queuedGates.length === 1 ? ' is' : 's are'} safely queued and will appear next.</div>
        )}

        {rechecking && (
          <div className="rdg-checking"><Spin /> Re-checking the data pool… scanned PDFs are being read (OCR) — this can take a moment the first time.</div>
        )}

        <div className="rdg-scroll">
          {hasBlocker && (
            <>
              <div className="rdg-ghead"><span className="rdg-glabel rdg-glabel--must">{checkerFailed ? '⚙ Technical problem' : '⛔ Must fix'}</span><span className="rdg-gcount">{blockers.length}</span></div>
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
            {rechecking ? <><Spin /> Re-checking…</> : checkerFailed ? <>↻ Try check again</> : <>↻ Fix &amp; re-check</>}
          </button>
          {!hasBlocker && (
            <button className="btn btn--amber" disabled={busy} onClick={() => act('proceed')}>
              {pending === 'proceed' ? <><Spin /> Starting…</> : 'Proceed ▸'}
            </button>
          )}
        </div>

        {hasBlocker && !checkerFailed && !emptyPool && (
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
