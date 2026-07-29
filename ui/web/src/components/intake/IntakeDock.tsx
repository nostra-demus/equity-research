import { useMemo, useState } from 'react'
import { api, isStatic } from '../../lib/api'
import { intakeResting } from '../../lib/intake'
import { useStore } from '../../lib/store'
import type { AgentNode } from '../../lib/types'
import { Spin } from '../Spin'
import { IntakeDocCard } from './IntakeDocCard'
import { IntakeReadingFeed } from './IntakeReadingFeed'
import { RerunPlanList } from './RerunPlanList'
import './IntakeDock.css'

// Map {module, agent} pairs → constellation orb keys (matching name OR slug), so hovering a doc/plan row
// lights exactly the orbs its evidence bears on.
function orbKeys(pairs: { module: string; agent: string }[], nodesByKey: Map<string, AgentNode>): Set<string> {
  const want = new Set(pairs.map((p) => `${p.module}::${p.agent}`))
  const keys = new Set<string>()
  for (const n of nodesByKey.values()) if (want.has(`${n.module}::${n.name}`) || want.has(`${n.module}::${n.slug}`)) keys.add(n.key)
  return keys
}

// A calm "checked <when>" label from the plan's DURABLE scan_date (YYYY-MM-DD), never its file mtime — the
// mtime is rewritten forward by git materialization, so it would read "just now" after any deploy. Date
// granularity is all this confirmation needs.
function checkedLabel(scanDate: string | undefined): string {
  if (!scanDate || !/^\d{4}-\d{2}-\d{2}$/.test(scanDate)) return ''
  const today = new Date(); const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const y = new Date(today.getTime() - 86_400_000); const yd = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
  if (scanDate === t) return 'today'
  if (scanDate === yd) return 'yesterday'
  return `on ${scanDate}`
}

// The distinct document-intake surface: freshly-arrived documents as angular shards (never orbs), plus the
// scoped rerun plan. A live-tick surface (it refreshes on the data-changed SSE), so it obeys the instant-
// close rule — no exit animation. Generic gate (research + a plan with new docs), never a swarm id.
export function IntakeDock() {
  const activeSwarm = useStore((s) => s.activeSwarm)
  const intake = useStore((s) => s.intake)
  const analyzing = useStore((s) => s.intakeAnalyzing)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const setFocus = useStore((s) => s.setIntakeFocus)
  const analyze = useStore((s) => s.analyzeIntake)
  const openPlan = useStore((s) => s.openThesisPlan)
  const ticker = useStore((s) => s.selectedTicker)
  const globalActive = useStore((s) => s.globalActive)
  const runActivity = useStore((s) => s.runActivity)
  const [open, setOpen] = useState(true)
  const setToast = useStore((s) => s.setToast)
  // The one-pass scoped rerun (POST /api/intake-plan/run): the server re-reads + re-validates the plan
  // itself, so this sends only {ticker, swarm}. Errors surface the route's own honest codes (no_plan /
  // already_complete / plan_stale / subject_busy) verbatim — never a silent fallback to a bigger run.
  const [scopedPending, setScopedPending] = useState(false)
  const runScoped = async () => {
    if (!ticker || scopedPending) return
    if (isStatic()) { setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' }); return }
    setScopedPending(true)
    try {
      await api.runIntakePlan(ticker, 'research')
      setToast({ msg: 'Scoped re-run started — one pass, one commit.', tone: 'good' })
    } catch (e: any) {
      setToast({ msg: e?.body?.error || e?.message || 'Could not start the scoped re-run.', tone: 'bad' })
    } finally {
      setScopedPending(false)
    }
  }

  // The live document-intake run for this company — this click, an auto-analysis on landing, or one
  // started in another tab. Its steps ARE the reading list. Positive `kind` match, never a fallback:
  // an older server that doesn't report the kind must show no feed rather than a wrong one.
  const intakeRun = useMemo(
    () => globalActive.find((r) => r.ticker === ticker && r.kind === 'doc-intake') ?? null,
    [globalActive, ticker],
  )
  const steps = intakeRun ? runActivity[intakeRun.runId] ?? [] : []
  // An analysis is running — this tab's click (`analyzing`) OR a live doc-intake run (auto-on-landing, an
  // earlier click, another tab). While it runs we show the reading feed, never a stale terminal verdict.
  const busy = analyzing || !!intakeRun

  const docCards = intake?.new_docs ?? []
  const cmds = intake?.rerun_plan?.commands ?? []
  const keysFor = useMemo(() => (module: string, agent: string) => orbKeys([{ module, agent }], nodesByKey), [nodesByKey])
  const clear = () => setFocus(new Set())

  // Terminal state for an analysis that found NO new document — the single safety gate lives in
  // `intakeResting` (lib/intake.ts, unit-tested): 'up-to-date' is emitted ONLY on the server's positive
  // pool_current proof, 'recheck' when a file landed after the analysis, and null when there is scoped work
  // or the currency is unprovable (old server / deploy-skew → fail-closed, no affirmative). While an
  // analysis is in flight we show the live feed, never a stale terminal verdict.
  const resting = intakeResting(intake)
  const upToDate = !busy && resting === 'up-to-date'
  const needsRecheck = !busy && resting === 'recheck'

  // Gate: research swarm only. Show the panel when there's an analysis running, documents to show, or a
  // terminal verdict to state. Absent/old server with an empty plan → none of these → nothing renders
  // (fail-closed, the honest floor stands).
  if (activeSwarm !== 'research') return null
  if (!docCards.length && !busy && !upToDate && !needsRecheck) return null

  return (
    <div className="intake" onMouseLeave={clear}>
      <button className="intake__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="intake__chev" data-open={open} aria-hidden>▸</span>
        <span className="intake__title">New data</span>
        {/* The recheck nudge lives in the body; when the panel is collapsed, a header dot keeps the one
            signal the feature exists to surface visible (the calm up-to-date state needs no such marker). */}
        {needsRecheck && !open && <span className="intake__pending" title="New documents have landed — re-analyze" aria-label="New documents have landed since the last check" />}
        {docCards.length > 0 && <span className="intake__count">{docCards.length} doc{docCards.length === 1 ? '' : 's'}{cmds.length ? ` · ${cmds.length} to re-run` : ''}</span>}
        <span
          className="intake__reanalyze"
          role="button"
          tabIndex={0}
          title="Re-read the new documents and rebuild the scoped plan (launches no rerun)"
          onClick={(e) => { e.stopPropagation(); void analyze() }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); void analyze() } }}
        >
          {busy ? <Spin /> : '↻'}
        </span>
      </button>

      {open && (
        <div className="intake__body">
          {/* While an analysis runs, name every step as it happens — including a ↻ re-read over docs
              already listed below, which asks the same "what is it looking at?" question. The old static
              "Reading the new documents…" line was true but blind: a minute-plus of a live engine with
              nothing to show for it. It stays as the fallback for when there's no run to read steps from
              (an older server, or the run not yet reconciled), so the panel never goes silent. */}
          {busy && intakeRun && <IntakeReadingFeed steps={steps} live startedAt={intakeRun.startedAt} />}
          {busy && !intakeRun && !docCards.length && <div className="intake__reading">Reading the new documents…</div>}

          {/* The analysis finished and found nothing new — say so plainly instead of vanishing the panel.
              This is the whole point of the surface when the pool hasn't changed: a clear, honest resting
              confirmation, not silence the reader has to interpret. */}
          {upToDate && (
            <div className="intake__resolved">
              <span className="intake__resolved-glyph" aria-hidden>✓</span>
              <div className="intake__resolved-copy">
                {/* Only the stable sentence is a polite live region; the "checked <date>" label is
                    aria-hidden so its per-render text isn't re-announced on this live-tick surface. */}
                <div className="intake__resolved-head">No new data</div>
                <div className="intake__resolved-sub" role="status">Everything in the pool has already been read and considered.</div>
                {(() => { const when = checkedLabel(intake!.scan_date); return when ? <div className="intake__resolved-when" aria-hidden>Checked {when}.</div> : null })()}
              </div>
            </div>
          )}

          {/* A file landed AFTER the last analysis (the plan never saw it). Never report that as "nothing
              new" — prompt a re-analysis so the new evidence is actually read and considered. */}
          {needsRecheck && (
            <div className="intake__resolved intake__resolved--stale" role="status">
              <span className="intake__resolved-glyph" aria-hidden>↻</span>
              <div className="intake__resolved-copy">
                <div className="intake__resolved-head">New documents have landed</div>
                <div className="intake__resolved-sub">Something arrived after the last check. Re-analyze to read and consider it.</div>
                <button className="intake__resolved-btn" onClick={() => void analyze()}>Re-analyze</button>
              </div>
            </div>
          )}

          {/* THE VERDICT, first and in plain words — what the read concluded and what to do about it.
              The doc cards + plan rows below are the detail; this line is the answer to "so, do I need
              to re-run anything?" the moment the analysis lands. intake.summary rides the hover. */}
          {!busy && intake && docCards.length > 0 && (
            <div className="intake__verdictline" data-verdict={intake.verdict} title={intake.summary || undefined} role="status">
              {intake.verdict === 'scoped_rerun' && cmds.length > 0
                ? `New data affects ${cmds.length} check${cmds.length === 1 ? '' : 's'} — re-run below, or run the full analysis`
                : intake.verdict === 'insufficient'
                  ? 'Not enough evidence to scope a re-run — the documents are filed; consider a full analysis'
                  : 'Noted in the pool — nothing needs re-running'}
            </div>
          )}
          {docCards.length > 0 && (
            <div className="intake__docs">
              {docCards.map((d, i) => (
                <div key={d.path} style={{ '--i': i } as React.CSSProperties} className="intake__docwrap">
                  <IntakeDocCard doc={d} onEnter={() => setFocus(orbKeys(d.entry_orbs, nodesByKey))} onLeave={clear} />
                </div>
              ))}
            </div>
          )}
          {intake && docCards.length > 0 && (
            <RerunPlanList
              plan={intake}
              keysFor={keysFor}
              nodesByKey={nodesByKey}
              onRowEnter={setFocus}
              onLeave={clear}
              onRun={() => void openPlan()}
              onRunScoped={() => void runScoped()}
              scopedPending={scopedPending}
              running={false}
            />
          )}
        </div>
      )}
    </div>
  )
}
