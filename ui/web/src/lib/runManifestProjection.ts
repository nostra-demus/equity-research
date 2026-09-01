import type { NodeRuntime } from './types'

export interface RunManifestShape {
  runRoot?: string | null
  modules?: Record<string, Array<{ agentKey?: string; verdict?: string | null }>>
  terminalOutcomes?: Record<string, { kind?: 'synthesis' | 'fail-fast'; agentKey?: string }>
  moduleReports?: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
  memo?: boolean
  finalThesis?: boolean
  fullDossier?: boolean
}

/** Project durable run artifacts onto the cockpit without clearing newer live state.
 *
 * The manifest is disk truth after a missed terminal SSE frame, refresh, or engine restart. Only files
 * actually present are promoted to done. An absent live node is retired only when the backend has said
 * that exact owning run vanished; work owned by a newer run is never cleared or fabricated.
 */
export function projectRunManifest(
  manifest: RunManifestShape,
  currentRuntime: Record<string, NodeRuntime> = {},
  settledRunId?: string,
): {
  nodeRuntime: Record<string, NodeRuntime>
  runRoot?: string | null
  reports?: { memo: boolean; thesis: boolean; dossier: boolean }
  moduleReports?: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
} {
  const nodeRuntime = { ...currentRuntime }
  const root = typeof manifest.runRoot === 'string' && manifest.runRoot ? manifest.runRoot : null
  const durableKeys = new Set(Object.values(manifest.modules ?? {}).flatMap((agents) =>
    Array.isArray(agents) ? agents.flatMap((agent) => typeof agent?.agentKey === 'string' ? [agent.agentKey] : []) : []))
  if (manifest.finalThesis) durableKeys.add('master/synthesizer')
  const validatedTerminalKeys = new Set(Object.values(manifest.terminalOutcomes ?? {})
    .map((outcome) => outcome?.agentKey).filter((key): key is string => typeof key === 'string'))
  const newerLiveOwner = !!settledRunId && Object.values(currentRuntime).some((current) =>
    (current?.status === 'running' || current?.status === 'queued')
      && !!current.runId && current.runId !== settledRunId)
  const ownedByAnotherLiveRun = (key: string): boolean => {
    const current = nodeRuntime[key]
    return (current?.status === 'running' || current?.status === 'queued')
      && !!current.runId && !!settledRunId && current.runId !== settledRunId
  }
  if (settledRunId) {
    for (const [key, current] of Object.entries(currentRuntime)) {
      if (current?.runId === settledRunId && (current.status === 'running' || current.status === 'queued')
          && !durableKeys.has(key)) delete nodeRuntime[key]
    }
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
          terminalValidated: validatedTerminalKeys.has(agent.agentKey),
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

  if (newerLiveOwner) return { nodeRuntime }
  return {
    nodeRuntime, runRoot: root,
    reports: { memo: !!manifest.memo, thesis: !!manifest.finalThesis, dossier: !!manifest.fullDossier },
    moduleReports: manifest.moduleReports ?? {},
  }
}
