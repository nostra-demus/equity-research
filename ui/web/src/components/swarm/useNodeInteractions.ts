import { useMemo, useState } from 'react'
import type { AgentNode } from '../../lib/types'
import { useStore } from '../../lib/store'

// The click/decision logic shared by BOTH research renderers (flat SwarmField + the 3D globe), so a node
// click behaves identically no matter which view it came from — no drift. The only per-view difference is
// WHERE the module-tier popup anchors (flat uses the orb's DOM rect; the globe projects its 3D position),
// so onNodeClick takes an `anchor` callback that returns the popup's screen coords for this node.
export interface ModulePop { module: string; cx: number; top: number }

export function useNodeInteractions() {
  const graph = useStore((s) => s.graph)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const dataStatus = useStore((s) => s.dataStatus)
  const nodeStatus = useStore((s) => s.nodeStatus)
  const moduleReports = useStore((s) => s.moduleReports)
  const launchModule = useStore((s) => s.launchModule)
  const openThesis = useStore((s) => s.openThesis)
  const openOutputForNode = useStore((s) => s.openOutputForNode)
  const selectNodeForRun = useStore((s) => s.selectNodeForRun)
  const setToast = useStore((s) => s.setToast)

  const moduleByName = useMemo(() => new Map((graph?.modules || []).map((m) => [m.name, m])), [graph])
  const [modulePop, setModulePop] = useState<ModulePop | null>(null)

  // Click any orb -> select it and open the side panel. Done -> its output (with Re-run); not-yet-run -> a
  // pending panel whose button runs/re-runs it. A finished module-synthesis orb with >1 saved tier opens
  // the module's 3-tier chooser (synthesis / memo / dossier), anchored at `anchor()`.
  const onNodeClick = (n: AgentNode, anchor?: () => { cx: number; top: number } | null) => {
    if (nodeStatus(n.key) !== 'done') return selectNodeForRun(n)
    if (n.isSynthesis) {
      const r = moduleReports[n.module]
      const tierCount = [r?.synthesis, r?.memo, r?.dossier].filter(Boolean).length
      if (tierCount > 1) {
        const pos = anchor?.()
        if (pos) return setModulePop({ module: n.module, cx: pos.cx, top: pos.top })
      }
    }
    return openOutputForNode(n)
  }

  // Click a module label -> launch that module. An exact-resume-capable research command resolves a fresh
  // disk-truth plan and can carry finished ancestors, so its old graph-level deps flag is not authoritative.
  // Every other module keeps the established direct dependency guard.
  const onClusterClick = (module: string) => {
    const ms = dataStatus?.modules[module]?.status
    if (ms === 'Insufficient') return setToast({ msg: `No data for ${module} — upload to Drive`, tone: 'info' })
    const mod = moduleByName.get(module)
    const exactResume = activeSwarm === 'research' && mod?.exactResume === true
    if (!exactResume && mod?.depsComplete === false) return setToast({ msg: `${module} needs ${mod.missingDeps?.join(', ') || 'upstream'} complete first`, tone: 'info' })
    launchModule(module)
  }

  return { onNodeClick, onClusterClick, openThesis, modulePop, setModulePop }
}
