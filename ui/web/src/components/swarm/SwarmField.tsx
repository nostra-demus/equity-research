import { useEffect, useMemo, useRef, useState } from 'react'
import { computeLayout, type PlacedNode } from '../../lib/layout'
import { sufficiencyColor } from '../../lib/format'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, orbClass, scopeTiming, type ScopeOrb } from '../../lib/eta'
import { moduleRunAffordance } from '../../lib/moduleRun'
import { moduleCompletionOutcome } from '../../lib/moduleOutcome'
import { PAUSED_RUN_HELP, PAUSED_RUN_LABEL, projectRunActivity } from '../../lib/runActivityProjection'
import { useStore } from '../../lib/store'
import { AgentNode } from './AgentNode'
import { CoreOrb } from './CoreOrb'
import { ModuleReportPopup } from './ModuleReportPopup'
import { EdgeLayer } from './EdgeLayer'
import { AgentTooltip } from '../AgentTooltip'
import { useNodeInteractions } from './useNodeInteractions'
import { IntakeProjection } from '../intake/IntakeProjection'

export function SwarmField() {
  const graph = useStore((s) => s.graph)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const dataStatus = useStore((s) => s.dataStatus)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const activeRuns = useStore((s) => s.activeRuns)
  const resumableRuns = useStore((s) => s.resumableRuns)
  const launchPending = useStore((s) => s.launchPending)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const decision = useStore((s) => s.decision)
  const coreBloom = useStore((s) => s.coreBloom)
  const nodeStatus = useStore((s) => s.nodeStatus)
  const selectedNodeKey = useStore((s) => s.selectedNodeKey)
  const now = useStore((s) => s.now)
  const setNow = useStore((s) => s.setNow)
  // intake surface: focus = orbs to LIGHT (hover a doc/plan row); plan = the persistent scoped-plan orbs.
  const intakeFocusKeys = useStore((s) => s.intakeFocusKeys)
  const intakePlanKeys = useStore((s) => s.intakePlanKeys)

  // Click/decision logic shared with the 3D globe view (no drift); see useNodeInteractions.
  const { onNodeClick, onClusterClick, openThesis, modulePop, setModulePop } = useNodeInteractions()

  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 760 })
  const [hover, setHover] = useState<{ node: PlacedNode; x: number; y: number } | null>(null)
  const [hoverModule, setHoverModule] = useState<string | null>(null)
  const [hoverCore, setHoverCore] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ w: Math.max(640, width), h: Math.max(480, height) })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  // Reserve the decision dock's MEASURED height under the field. The dock is an absolute, bottom-anchored
  // overlay on this same stage, so without this the master-thesis core is placed behind it and the Memo
  // orb — the thing every arrow in the field points at — is invisible (the bug this fixes).
  const dockH = useStore((s) => s.stageDockH)
  const layout = useMemo(() => (graph ? computeLayout(graph, size.w, size.h, dockH) : null), [graph, size.w, size.h, dockH])
  const moduleOrder = useMemo(() => new Map((graph?.modules || []).map((m, i) => [m.name, i])), [graph])
  const moduleByName = useMemo(() => new Map((graph?.modules || []).map((m) => [m.name, m])), [graph])
  const nodesByModule = useMemo(() => {
    const grouped = new Map<string, PlacedNode[]>()
    for (const node of layout?.nodes ?? []) grouped.set(node.module, [...(grouped.get(node.module) ?? []), node])
    return grouped
  }, [layout])

  // each orb's runtime class (gate / specialist / synthesis), and the run-adaptive expected duration per
  // class learned from orbs that have already finished this session (seeded until the first one lands)
  const classOf = useMemo(() => new Map((layout?.nodes ?? []).map((n) => [n.key, orbClass(n)])), [layout])
  const exp = useMemo(() => expectedDurations(collectSamples(nodeRuntime, (k) => classOf.get(k) ?? 'specialist')), [nodeRuntime, classOf])

  // modules with a live (queued or running) orb — they light their edges and pulse their label,
  // so a running module reads as "alive" from the moment of launch (incl. the engine-startup phase)
  const runActivity = useMemo(() => projectRunActivity({
    subject: selectedTicker,
    swarm: activeSwarm,
    nodeRuntime,
    activeRuns,
    resumableRuns,
  }), [selectedTicker, activeSwarm, nodeRuntime, activeRuns, resumableRuns])
  const { activeModules, pausedModules, pausedKeys } = runActivity

  // the single shared 1s clock that drives every live timer (orb fill, ring sweep, module triad, panel,
  // tooltip). Runs ONLY while a module has a queued/running orb, so an idle constellation never re-renders.
  const anyLive = activeModules.size > 0
  useEffect(() => {
    if (!anyLive) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [anyLive, setNow])

  // which edges light up: hovered node's flows, hovered module's flows, the Memo's inbound arrows, or (idle) running modules
  const highlighted = useMemo(() => {
    const s = new Set<string>()
    const key = hover?.node.key
    const hasHover = !!key || !!hoverModule || hoverCore
    for (const e of layout?.edges ?? []) {
      if (key && (e.fromKey === key || e.toKey === key)) s.add(e.id)
      if (hoverModule && (e.fromModule === hoverModule || e.toModule === hoverModule)) s.add(e.id)
      if (hoverCore && e.kind === 'core') s.add(e.id) // every arrow flowing into the Memo
      if (!hasHover && activeModules.size && (activeModules.has(e.fromModule) || activeModules.has(e.toModule))) s.add(e.id)
    }
    return s
  }, [hover, hoverModule, hoverCore, activeModules, layout])
  const anyHover = !!(hover || hoverModule || hoverCore)

  // No company selected → keep the stage empty (DataUploadEmptyState shows the "Select a company"
  // prompt). Without this the idle constellation renders and looks live before anything is chosen.
  if (!graph || !layout || !selectedTicker) return <div className="swarm" ref={ref} />

  const onEnter = (n: PlacedNode) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ node: n, x: rect.left + n.x, y: rect.top + n.y })
  }
  const onLeave = () => setHover(null)

  // onNodeClick/onClusterClick live in useNodeInteractions (shared with the globe). The only flat-specific
  // bit is the module-tier popup anchor — the orb's DOM rect (the globe projects its 3D position instead).
  const handleNodeClick = (n: PlacedNode) =>
    onNodeClick(n, () => {
      const rect = ref.current?.getBoundingClientRect()
      return rect ? { cx: rect.left + n.x, top: rect.top + n.y - 14 } : null
    })

  // Intake highlighting: light the hovered doc's orbs (focus) if any, else the persistent scoped-plan orbs.
  const intakeActiveKeys = intakeFocusKeys.size ? intakeFocusKeys : intakePlanKeys
  const intakeBright = intakeFocusKeys.size > 0

  return (
    <div className="swarm" ref={ref} onClick={() => setHover(null)} data-intake-focus={intakeBright ? 'true' : undefined}>
      <EdgeLayer layout={layout} highlighted={highlighted} anyHover={anyHover} />
      <IntakeProjection nodes={layout.nodes} keys={intakeActiveKeys} bright={intakeBright} />

      {/* cluster labels */}
      {layout.clusters.map((c) => {
        const moduleNodes = nodesByModule.get(c.module) ?? []
        const completion = moduleCompletionOutcome(moduleNodes, nodeRuntime)
        // Saved module outcome beats pool readiness. They answer different questions, and showing
        // "Sufficient" above a canonical insufficient fail-fast result contradicts backend disk truth.
        const ms = completion.kind === 'fail-fast' ? completion.verdict : dataStatus?.modules[c.module]?.status
        const live = activeModules.has(c.module)
        const paused = pausedModules.has(c.module)
        const mod = moduleByName.get(c.module)
        const smartResume = activeSwarm === 'research' && mod?.exactResume === true
        const depLocked = !smartResume && mod?.depsComplete === false
        const miss = mod?.missingDeps?.join(', ')
        const runAffordance = smartResume
          ? moduleRunAffordance(moduleNodes, nodeStatus)
          : { complete: false, unfinishedSpecialists: 0, label: '▸ run module', title: 'Runs this module only' }
        // A newly added specialist can be run one-by-one before the old synthesis is refreshed. In that
        // state every visible orb looks done, but disk truth still has summary work to do. Keep research
        // headings actionable so the fresh plan can detect and finish that last step.
        const headingAction = smartResume || !runAffordance.complete
        // live module timer: elapsed since the first orb here started + honest progress-projection ETA
        const mt = live
          ? scopeTiming(
              layout.nodes
                .filter((n) => n.module === c.module)
                .map<ScopeOrb>((n) => ({ startedAt: nodeRuntime[n.key]?.startedAt, endedAt: nodeRuntime[n.key]?.endedAt, status: nodeStatus(n.key), cls: orbClass(n) })),
              exp,
              now,
            )
          : null
        return (
          <div
            key={c.module}
            className={`cluster__label${live ? ' cluster__label--live' : ''}${paused ? ' cluster__label--paused' : ''}`}
            style={{ left: c.labelX, top: c.labelY }}
            onMouseEnter={() => setHoverModule(c.module)}
            onMouseLeave={() => setHoverModule(null)}
            onClick={(e) => { e.stopPropagation(); if (headingAction) onClusterClick(c.module) }}
            onKeyDown={(e) => {
              if (!headingAction || (e.key !== 'Enter' && e.key !== ' ')) return
              e.preventDefault(); e.stopPropagation(); onClusterClick(c.module)
            }}
            role={headingAction ? 'button' : undefined}
            tabIndex={headingAction ? 0 : undefined}
            aria-label={paused
              ? `${c.module.replace(/-/g, ' ')}: ${PAUSED_RUN_HELP}`
              : headingAction ? `${c.module.replace(/-/g, ' ')}: ${runAffordance.label.replace(/^▸\s*/, '')}. ${runAffordance.title}` : undefined}
          >
            <div className="cluster__name">{c.module.replace(/-/g, ' ')}</div>
            {ms && <div className="cluster__status" style={{ color: sufficiencyColor(ms) }}>{ms}</div>}
            {paused ? (
              <div className="cluster__run cluster__run--paused" title={PAUSED_RUN_HELP}>{PAUSED_RUN_LABEL}</div>
            ) : live && mt ? (
              <div className="cluster__timer">
                <div className="cluster__timer-line">
                  <span className="cluster__timer-dot">●</span> {mt.done}/{mt.total}
                  {mt.started ? (
                    <>
                      {' · '}{fmtClock(mt.elapsedMs)}
                      {mt.etaRemainingMs != null && <span className="cluster__timer-eta">{' · '}{fmtEtaLeft(mt.etaRemainingMs)}</span>}
                    </>
                  ) : (
                    <span className="cluster__timer-eta">{' · '}starting…</span>
                  )}
                </div>
                <div className="cluster__flow"><div className="cluster__flow-fill" style={{ ['--frac' as any]: mt.total ? mt.done / mt.total : 0 }} /></div>
              </div>
            ) : depLocked ? (
              <div className="cluster__run" style={{ color: 'var(--text-faint)' }} title={`Needs ${miss} complete first`}>🔒 needs {miss}</div>
            ) : launchPending?.key === `module:${c.module}` ? (
              // the click was heard — the label flips in the same frame, before the server acks
              <div className="cluster__run" style={{ color: 'var(--accent-bright)' }}>● starting…</div>
            ) : completion.kind === 'fail-fast' ? (
              <div className="cluster__run cluster__run--done" style={{ color: 'var(--text-secondary)' }} title="The module stopped at its valid data gate; no downstream paid work was required">✓ stopped correctly</div>
            ) : completion.kind === 'synthesis' && (!smartResume || runAffordance.complete) ? (
              <div className="cluster__run cluster__run--done" style={{ color: 'var(--text-secondary)' }} title={runAffordance.title}>{runAffordance.label}</div>
            ) : (
              <div className={`cluster__run${smartResume ? ' cluster__run--action' : ''}`} title={runAffordance.title}>{runAffordance.label}</div>
            )}
          </div>
        )
      })}

      {/* nodes — keyed by ticker so the awaken animation replays on selection */}
      <div key={selectedTicker || 'none'}>
        {layout.nodes.map((n) => {
          const st = nodeStatus(n.key)
          const running = st === 'running'
          return (
            <AgentNode
              key={n.key}
              node={n}
              status={st}
              selected={selectedNodeKey === n.key || hover?.node.key === n.key || intakeFocusKeys.has(n.key)}
              paused={pausedKeys.has(n.key)}
              scoped={intakePlanKeys.has(n.key)}
              dimmed={intakeFocusKeys.size > 0 && !intakeFocusKeys.has(n.key)}
              delayMs={(moduleOrder.get(n.module) ?? 0) * 45 + n.layer * 50}
              tStart={running ? nodeRuntime[n.key]?.startedAt : undefined}
              tExpected={running ? expectedFor(orbClass(n), exp) : undefined}
              tNow={running ? now : undefined}
              onEnter={onEnter}
              onLeave={onLeave}
              onClick={handleNodeClick}
            />
          )
        })}
      </div>

      <CoreOrb x={layout.core.x} y={layout.core.y} r={layout.core.r} decision={decision} bloom={coreBloom} armed={!!selectedTicker} onClick={() => openThesis()} onHover={setHoverCore} />

      {modulePop && <ModuleReportPopup module={modulePop.module} cx={modulePop.cx} top={modulePop.top} onClose={() => setModulePop(null)} />}

      {hover && <AgentTooltip node={hover.node} status={nodeStatus(hover.node.key)} paused={pausedKeys.has(hover.node.key)} verdict={nodeRuntime[hover.node.key]?.verdict} startedAt={nodeRuntime[hover.node.key]?.startedAt} endedAt={nodeRuntime[hover.node.key]?.endedAt} expectedMs={expectedFor(orbClass(hover.node), exp)} now={now} screenX={hover.x} screenY={hover.y} />}
    </div>
  )
}
