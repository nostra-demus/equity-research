import type { NodeRuntime } from './types'

export interface RunManifestShape {
  runRoot?: string | null
  modules?: Record<string, Array<{ agentKey?: string; verdict?: string | null }>>
  moduleReports?: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
  memo?: boolean
  finalThesis?: boolean
  fullDossier?: boolean
}

/** Project durable run artifacts onto the cockpit without clearing newer live state.
 *
 * The manifest is disk truth after a missed terminal SSE frame, refresh, or engine restart. Only files
 * actually present are promoted to done; absent files never clear or fabricate an orb.
 */
export function projectRunManifest(
  manifest: RunManifestShape,
  currentRuntime: Record<string, NodeRuntime> = {},
  settledRunId?: string,
): {
  nodeRuntime: Record<string, NodeRuntime>
  runRoot: string | null
  reports: { memo: boolean; thesis: boolean; dossier: boolean }
  moduleReports: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
} {
  const nodeRuntime = { ...currentRuntime }
  const root = typeof manifest.runRoot === 'string' && manifest.runRoot ? manifest.runRoot : null
  const ownedByAnotherLiveRun = (key: string): boolean => {
    const current = nodeRuntime[key]
    return (current?.status === 'running' || current?.status === 'queued')
      && !!current.runId && !!settledRunId && current.runId !== settledRunId
  }
  if (root) {
    for (const agents of Object.values(manifest.modules ?? {})) {
      if (!Array.isArray(agents)) continue
      for (const agent of agents) {
        if (typeof agent?.agentKey !== 'string' || !agent.agentKey) continue
        if (ownedByAnotherLiveRun(agent.agentKey)) continue
        nodeRuntime[agent.agentKey] = {
          ...nodeRuntime[agent.agentKey],
          status: 'done',
          verdict: agent.verdict ?? null,
          outputPath: `${root}/${agent.agentKey}.md`,
        }
      }
    }
    if (manifest.finalThesis && !ownedByAnotherLiveRun('master/synthesizer')) {
      nodeRuntime['master/synthesizer'] = {
        ...nodeRuntime['master/synthesizer'],
        status: 'done',
        outputPath: `${root}/final_thesis.md`,
      }
    }
  }

  return {
    nodeRuntime,
    runRoot: root,
    reports: { memo: !!manifest.memo, thesis: !!manifest.finalThesis, dossier: !!manifest.fullDossier },
    moduleReports: manifest.moduleReports ?? {},
  }
}
