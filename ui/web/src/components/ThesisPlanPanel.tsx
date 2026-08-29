import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useStore } from '../lib/store'
import { moduleLabel } from '../lib/format'
import { Spin } from './Spin'
import type { ModulePlanEntry, ThesisPlan } from '../lib/types'
import './ThesisPlanPanel.css'
import { providerBlockedReason, providerIsBlocked, providerLabel, providerLaunchBlockedReason, providerNeedsCheck, type RunProvider } from '../lib/provider'
import { ProviderProfileSelector } from './ProviderProfileSelector'

/** Historical ranges are evidence, not quotes. Round their observed endpoints so the UI does not imply
 * precision beyond the completed comparable runs that produced them. */
const band = ([lo, hi]: [number, number]) => `${Math.round(lo)}–${Math.round(hi)}`

/** "2026-07-03" → "Jul 3". Falls back to the raw string for anything unexpected. */
function shortDate(iso?: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]
  return `${month} ${d}`
}

/** Humanize a kebab module name for a sentence, and cap a blocker list (mirrors admission.ts's capList). */
const humanMod = (m: string) => m.replace(/-/g, ' ')
function blockerList(mods: string[]): string {
  const h = mods.map(humanMod)
  return h.length <= 3 ? h.join(', ') : `${h.slice(0, 3).join(', ')} +${h.length - 3} more`
}

/** What the row says about itself, once. The badge carries the state; the note carries the evidence. */
function rowCopy(m: ModulePlanEntry, willRerun: boolean, locked: boolean, newestDate: string | null): { badge: string; tone: string; note: string } {
  if (m.state === 'done') {
    if (locked) return { badge: 'Reuse', tone: 'reuse', note: `already finished in this run — reused as-is` }
    return willRerun
      ? { badge: 'Re-run', tone: 'run', note: `you chose to rebuild this — it already exists from ${shortDate(m.sourceDate)}` }
      : { badge: 'Reuse', tone: 'reuse', note: `already done ${shortDate(m.sourceDate)} — carried into this run, not re-run` }
  }
  if (m.state === 'stale') {
    if (locked) return { badge: 'Reuse', tone: 'stale', note: `${m.staleReason || 'newer data has landed'} — but it is already in this run, so use its orb’s Re-run to rebuild it` }
    return willRerun
      ? { badge: 'Re-run', tone: 'stale', note: m.staleReason || 'newer data has landed since this ran' }
      : { badge: 'Keep', tone: 'reuse', note: `kept despite newer data — ${m.staleReason || 'this module never read it'}` }
  }
  if (m.state === 'partial') {
    if (m.blockedBy.length) return { badge: 'Run', tone: 'run', note: `${m.doneAgents} of ${m.totalAgents} orbs done — waits on ${blockerList(m.blockedBy)} first` }
    if (m.staleReason) return { badge: 'Run', tone: 'run', note: `started ${shortDate(m.sourceDate)}; newer data landed ${shortDate(newestDate)} — runs all ${m.totalAgents} orbs fresh` }
    return { badge: 'Run', tone: 'run', note: `${m.doneAgents} of ${m.totalAgents} orbs done from ${shortDate(m.sourceDate)} — resumes the last ${m.willRunAgents}` }
  }
  if (m.blockedBy.length) return { badge: 'Run', tone: 'run', note: `waits on ${blockerList(m.blockedBy)} to run first` }
  return { badge: 'Run', tone: 'run', note: `never run — runs all ${m.totalAgents} orbs` }
}

function ModuleRow({ m, plan, i }: { m: ModulePlanEntry; plan: ThesisPlan; i: number }) {
  const toggle = useStore((s) => s.toggleThesisRerun)
  const resumeModule = useStore((s) => s.resumeThesisModule)
  const launchPending = useStore((s) => s.launchPending)
  const ticker = useStore((s) => s.selectedTicker)
  const providerStatus = useStore((s) => s.providers[s.runProvider])
  const providerCatalogState = useStore((s) => s.providers.catalogState)
  const providerProblem = providerLaunchBlockedReason(providerStatus, providerCatalogState)
  // Locked: its synthesis already sits in the run root the launcher seeds from, so it is reused no matter what.
  const locked = plan.mustReuse.includes(m.module)
  const actionable = plan.reusable.includes(m.module) && !locked
  const willRerun = !plan.reuse.includes(m.module)
  const { badge, tone, note } = rowCopy(m, willRerun, locked, plan.dataPool.newestDate)

  // The RUN pill is a real button only when this module can be launched on its own RIGHT NOW — it will run,
  // and nothing upstream of it is still waiting. A blocked Run row keeps an inert pill (its note names the
  // blocker). Research-only, matched positively so a deploy-skew absent field never reads as launchable.
  const pillPressable = m.runnable && plan.swarm === 'research'
  const pillPending = launchPending?.key === `complete-module:${m.module}`
  // One launch on this ticker at a time — disable every pill (and the row toggle can't race it) while any is
  // in flight. Also disabled during a full "Complete the thesis" launch (key 'complete-thesis').
  const anyPending = Boolean(launchPending && launchPending.ticker === ticker)

  // A module with nothing on disk always runs, and a locked one is always reused. Neither is a control —
  // render them as statements (no pointer, no hover, no :active), because a row that LOOKS pressable and
  // isn't teaches the user the panel is broken.
  const Tag = actionable ? 'button' : 'div'
  return (
    <Tag
      className={`tpp__row${actionable ? ' tpp__row--actionable' : ' tpp__row--inert'}`}
      style={{ '--i': i } as React.CSSProperties}
      {...(actionable
        ? { type: 'button' as const, onClick: () => toggle(m.module), 'aria-pressed': willRerun, title: willRerun ? `Don’t re-run ${moduleLabel(m.module)} — reuse what’s on disk` : `Re-run ${moduleLabel(m.module)} instead of reusing it` }
        : { title: locked ? `${moduleLabel(m.module)} is already finished in this run — it will be reused` : `${moduleLabel(m.module)} has no finished output to reuse — it must run` })}
    >
      <span className={`tpp__mark tpp__mark--${willRerun ? 'run' : 'reuse'}`} aria-hidden>
        {willRerun ? <svg viewBox="0 0 12 12"><path d="M6 1.6v2M6 1.6 4.6 3M6 1.6 7.4 3" /><circle cx="6" cy="6.8" r="3.5" /></svg> : <svg viewBox="0 0 12 12"><path d="M2.6 6.3 4.9 8.6 9.4 3.6" /></svg>}
      </span>

      <span className="tpp__text">
        <span className="tpp__name">{moduleLabel(m.module)}</span>
        <span className="tpp__note">{note}</span>
      </span>
      {pillPressable ? (
        <button
          type="button"
          className={`tpp__badge tpp__badge--${tone} tpp__badge--pressable`}
          disabled={anyPending || !!providerProblem}
          aria-busy={pillPending}
          onClick={(e) => {
            e.stopPropagation() // the row is inert here, but keep the pill the sole click target regardless
            void resumeModule(m.module)
          }}
          title={providerProblem || (
            m.state === 'partial' && !m.staleReason
              ? `Run ${moduleLabel(m.module)} now — resumes the ${m.willRunAgents} remaining orb${m.willRunAgents === 1 ? '' : 's'}`
              : `Run ${moduleLabel(m.module)} now — ${m.willRunAgents} orb${m.willRunAgents === 1 ? '' : 's'}`
          )}
        >
          {pillPending ? <Spin /> : badge}
        </button>
      ) : (
        <span className={`tpp__badge tpp__badge--${tone}`}>{badge}</span>
      )}
    </Tag>
  )
}

export function ThesisPlanPanel() {
  const open = useStore((s) => s.thesisPlanOpen)
  const plan = useStore((s) => s.thesisPlan)
  const loading = useStore((s) => s.thesisPlanLoading)
  const pricing = useStore((s) => s.thesisPlanPricing)
  const error = useStore((s) => s.thesisPlanError)
  const ticker = useStore((s) => s.selectedTicker)
  const close = useStore((s) => s.closeThesisPlan)
  const complete = useStore((s) => s.completeThesis)
  const launchPending = useStore((s) => s.launchPending)
  // The scoping intake applied (if any): keep the finished modules the new evidence doesn't touch, re-run
  // only the affected ones. Null = the honest floor (no plan, or it didn't narrow anything).
  const intake = useStore((s) => s.thesisPlanIntake)
  const resetReuse = useStore((s) => s.resetThesisReuse)
  // Manual entry point when the panel is all-stale but no scoped plan exists yet (auto-analysis off / not
  // yet run): read the new docs first, then re-open the now-scoped plan.
  const analyzing = useStore((s) => s.intakeAnalyzing)
  const analyzeThenScope = useStore((s) => s.analyzeIntake)
  const reopen = useStore((s) => s.openThesisPlan)
  const provider = useStore((s) => s.runProvider)
  const setProvider = useStore((s) => s.setRunProvider)
  const profileKey = useStore((s) => s.runProfileKeys[provider])
  const setProfile = useStore((s) => s.setRunProfile)
  const providers = useStore((s) => s.providers)
  const checkProvider = useStore((s) => s.refreshProviders)
  const providerChoiceGeneration = useRef(0)
  const providerProblem = providerLaunchBlockedReason(providers[provider], providers.catalogState)
  // The CSS handles the row stagger / press / skeleton under prefers-reduced-motion, but the modal's own
  // entrance is JS-driven and never sees that media query. Keep the opacity fade (it aids comprehension),
  // drop the scale + translate (positional motion is what causes discomfort).
  const reduce = useReducedMotion()

  // Escape closes. Registered only while open, so it never competes with the reader or the command bar.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null
  const starting = launchPending?.key === 'complete-thesis'
  // A per-module RUN pill and the full "Complete the thesis" button share ONE subject lock, so only one may
  // launch at a time. While EITHER is in flight, disable the full-complete button (a `complete-module:*`
  // launch would otherwise race it and 409). Its spinner still keys on `starting` alone.
  const busyOnTicker = Boolean(launchPending && launchPending.ticker === ticker)

  const reuseCount = plan?.reuse.length ?? 0
  const runCount = plan?.run.length ?? 0
  const total = plan?.modules.length ?? 0
  const staleCount = plan?.modules.filter((m) => m.state === 'stale').length ?? 0

  // Say what is actually true. "0 of 6 are already done and will be reused — only what's missing runs" is a
  // contradiction, and it is exactly the sentence a naive template produces when newer data staled everything.
  const subtitle = (): string => {
    if (!plan) return ''
    if (runCount === 0) return 'Every module is done. Only the memo is left to write.'
    if (reuseCount > 0) return `${reuseCount} of ${total} modules are already done and will be reused. Only what’s missing runs.`
    if (staleCount > 0) return `Newer data landed on ${shortDate(plan.dataPool.newestDate)}. All ${staleCount} finished module${staleCount === 1 ? '' : 's'} predate it, so nothing is reused — click one to keep it anyway.`
    return `Nothing has been run for ${plan.subject} yet — this builds the whole thesis from scratch.`
  }
  const p = plan?.preflight
  const full = plan?.fullPreflight
  const costEstimated = p?.estimateEvidence?.source === 'comparable_completed_runs' && p.estCostUsdRange[1] > 0
  const timeEstimated = p?.estimateEvidence?.source === 'comparable_completed_runs' && p.estMinutesRange[1] > 0
  const fullCostEstimated = full?.estimateEvidence?.source === 'comparable_completed_runs' && full.estCostUsdRange[1] > 0
  const fullTimeEstimated = full?.estimateEvidence?.source === 'comparable_completed_runs' && full.estMinutesRange[1] > 0

  // Launching a completion is research-only for now. Match POSITIVELY on 'research': during a deploy the new
  // bundle can talk to the old engine, and a field that is merely absent must never read as "allowed".
  const canRun = plan?.swarm === 'research'

  return (
    <div className="scrim" onClick={close}>
      <motion.div
        className="modal tpp"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduce ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Complete the thesis for ${ticker}`}
      >
        <div className="modal__head">
          <div className="modal__title">Complete the thesis — {ticker}</div>
          <div className="modal__sub">
            {loading ? 'Reading what already exists on disk…' : error ? 'Could not read this company’s run folders.' : subtitle()}
          </div>
        </div>

        {loading && (
          <div className="modal__body tpp__list" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="tpp__row tpp__row--skeleton" style={{ '--i': i } as React.CSSProperties}>
                <span className="tpp__skel tpp__skel--mark" />
                <span className="tpp__skel tpp__skel--name" />
                <span className="tpp__skel tpp__skel--note" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="tpp__error">
            <div className="tpp__error-msg">{error}</div>
            <div className="tpp__error-hint">Nothing was launched and nothing was changed on disk.</div>
          </div>
        )}

        {!loading && !error && plan && (
          <>
            {!intake && canRun && staleCount > 0 && (
              <div className="tpp__intake tpp__intake--cta">
                <div className="tpp__intake-lede">
                  <span className="tpp__intake-mark" aria-hidden />
                  <div className="tpp__intake-copy">
                    <div className="tpp__intake-head">Newer data landed — scope it before re-running everything</div>
                    <div className="tpp__intake-note">Let intake read the new documents and re-run only the orbs they actually change.</div>
                  </div>
                </div>
                <button className="tpp__intake-reset" title={providerProblem || undefined} onClick={async () => { await analyzeThenScope(); await reopen() }} disabled={analyzing || busyOnTicker || !!providerProblem}>
                  {analyzing ? <><Spin /> Scoping…</> : 'Scope with intake'}
                </button>
              </div>
            )}
            {intake && intake.affected.length > 0 && (
              <div className="tpp__intake">
                <div className="tpp__intake-lede">
                  <span className="tpp__intake-mark" aria-hidden />
                  <div className="tpp__intake-copy">
                    <div className="tpp__intake-head">
                      Intake read the {shortDate(intake.scanDate)} data — only <b>{intake.affected.map(humanMod).join(', ')}</b> {intake.affected.length === 1 ? 'is' : 'are'} affected
                    </div>
                    <div className="tpp__intake-note">
                      Keeping the {intake.keep.length} finished module{intake.keep.length === 1 ? '' : 's'} the new evidence doesn’t touch; re-running only {intake.affected.map(humanMod).join(', ')} + what depends on {intake.affected.length === 1 ? 'it' : 'them'}.
                    </div>
                  </div>
                </div>
                <button className="tpp__intake-reset" onClick={() => resetReuse()} disabled={busyOnTicker}>Re-run everything instead</button>
              </div>
            )}
            <div className="modal__body tpp__list">
              {plan.modules.map((m, i) => (
                <ModuleRow key={m.module} m={m} plan={plan} i={i} />
              ))}
              <div className="tpp__row tpp__row--inert tpp__row--master" style={{ '--i': plan.modules.length } as React.CSSProperties}>
                <span className="tpp__mark tpp__mark--run" aria-hidden>
                  <svg viewBox="0 0 12 12"><path d="M6 1.6v2M6 1.6 4.6 3M6 1.6 7.4 3" /><circle cx="6" cy="6.8" r="3.5" /></svg>
                </span>
                <span className="tpp__text">
                  <span className="tpp__name">the memo</span>
                  <span className="tpp__note">the master synthesizer — runs last, once every module is in</span>
                </span>
                <span className="tpp__badge tpp__badge--run">Run</span>
              </div>
            </div>

            {/* Two distinct affordances, stated only when each actually exists on this plan. A reusable row's
                whole surface toggles rebuild; a runnable Run row's PILL launches just that module. Naming both
                unconditionally would be false for a plan that has only one (or neither). */}
            {plan.reusable.some((m) => !plan.mustReuse.includes(m)) && (
              <div className="tpp__hint">Click a module marked <b>Reuse</b> or <b>Keep</b> to rebuild it instead.</div>
            )}
            {plan.modules.some((m) => m.runnable) && (
              <div className="tpp__hint">Click a <b>Run</b> pill to run just that module now, resuming any orbs already done.</div>
            )}

            {plan.carry.length > 0 && (
              <div className="tpp__carry">
                Reused work is copied into this run and stamped with the run it came from
                {plan.carry.length <= 3 && (
                  <> — {plan.carry.map((c) => `${moduleLabel(c.module)} (${shortDate(c.date)})`).join(', ')}</>
                )}
                . Its figures keep that date; nothing is aged forward.
              </div>
            )}

            {plan.dataPool.files === 0 && (
              <div className="tpp__carry tpp__carry--warn">
                No files in this company’s data pool, so nothing can be checked for staleness. Reused modules are assumed current.
              </div>
            )}

            {/* Estimates are evidence from comparable completed runs. Thin history stays unavailable. */}
            {canRun && (
              <>
                <div className="modal__body">
                  <div className="modal__row"><span className="modal__k">Run with</span><span className="modal__v">
                    <span className="providerseg" role="radiogroup" aria-label="Run provider">
                      {(['claude', 'codex'] as RunProvider[]).map((choice) => {
                        const problem = providerBlockedReason(providers[choice])
                        const status = providers[choice]
                        return <button key={choice} role="radio" aria-checked={provider === choice} className={`providerseg__btn${provider === choice ? ' providerseg__btn--on' : ''}`} disabled={pricing || busyOnTicker || providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(choice)} status` : `Run with ${providerLabel(choice)}`)} onClick={() => void (async () => {
                          const generation = ++providerChoiceGeneration.current
                          if (providerNeedsCheck(status)) {
                            await checkProvider(choice)
                            if (generation !== providerChoiceGeneration.current) return
                            if (providerLaunchBlockedReason(useStore.getState().providers[choice], useStore.getState().providers.catalogState)) return
                          }
                          if (generation !== providerChoiceGeneration.current) return
                          setProvider(choice)
                          await reopen()
                        })()}>{status.checking ? 'checking…' : providerLabel(choice)}</button>
                      })}
                    </span>
                  </span></div>
                  <div className="modal__row"><span className="modal__k">Model</span><span className="modal__v">
                    <ProviderProfileSelector status={providers[provider]} profileKey={profileKey} disabled={pricing || busyOnTicker} onChange={(key) => void (async () => {
                      ++providerChoiceGeneration.current
                      setProfile(provider, key)
                      await reopen()
                    })()} />
                  </span></div>
                </div>

                {providerProblem && <div className="tpp__carry tpp__carry--warn">{providerProblem}. Choose an available provider to continue.</div>}
                <div className={`modal__body tpp__price${pricing ? ' tpp__price--pricing' : ''}`}>
                  <div className="modal__row">
                    <span className="modal__k">Runs</span>
                    <span className="modal__v">{runCount} module{runCount === 1 ? '' : 's'} + the memo · {p!.agentCount} orbs</span>
                  </div>
                  {provider === 'claude' ? <div className="modal__row">
                    <span className="modal__k">Est. cost</span>
                    <span className="modal__v">{costEstimated ? `$${band(p!.estCostUsdRange)}` : 'Estimate unavailable'}</span>
                  </div> : <div className="modal__row"><span className="modal__k">Allowance impact</span><span className="modal__v">{p!.agentCount} orbs · exact allowance change unavailable</span></div>}
                  <div className="modal__row">
                    <span className="modal__k">Est. time</span>
                    <span className="modal__v">{timeEstimated ? `${band(p!.estMinutesRange)} min` : 'Estimate unavailable'}</span>
                  </div>
                  {p!.estimateEvidence?.source === 'comparable_completed_runs' && <div className="modal__row"><span className="modal__k">Estimate basis</span><span className="modal__v">same {providerLabel(provider)} model · {Math.max(p!.estimateEvidence.durationSampleSize, p!.estimateEvidence.costSampleSize)} completed runs</span></div>}
                  <div className="modal__row">
                    <span className="modal__k">Writes to main</span>
                    <span className="modal__v warn">{p!.estCommits} commit{p!.estCommits === 1 ? '' : 's'} · pushed</span>
                  </div>
                </div>

                <div className="tpp__saving">
                  {reuseCount > 0 ? (
                    <>Reusing finished work skips <b>{full!.agentCount - p!.agentCount} orbs</b>. {provider === 'claude' && fullCostEstimated ? <>A comparable full run cost <b>${band(full!.estCostUsdRange)}</b>. </> : null}{fullTimeEstimated ? <>Comparable full runs took <b>{band(full!.estMinutesRange)} min</b>.</> : 'There is not enough comparable history to estimate this exact subset.'}</>
                  ) : (
                    <>Nothing is being reused, so this is a full run — the next step asks you to type <b>{ticker}</b> to confirm. Click a module above to keep its existing output instead.</>
                  )}
                </div>
              </>
            )}

            {!canRun && (
              <div className="tpp__carry tpp__carry--warn">
                This is what’s still missing. Completing a {plan.swarm} dossier from here isn’t supported yet — run its pipeline from the swarm’s own controls.
              </div>
            )}

            <div className="modal__actions">
              <button className="btn btn--ghost" disabled={starting} onClick={close}>{canRun ? 'Cancel' : 'Close'}</button>
              {canRun && (
                <button className="btn btn--amber" disabled={busyOnTicker || pricing || !!providerProblem} title={providerProblem || undefined} onClick={() => void complete()}>
                  {starting ? <><Spin /> Starting…</> : runCount === 0 ? 'Write the memo' : 'Complete the thesis'}
                </button>
              )}
            </div>
          </>
        )}

        {!loading && error && (
          <div className="modal__actions">
            <button className="btn btn--ghost" onClick={close}>Close</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
