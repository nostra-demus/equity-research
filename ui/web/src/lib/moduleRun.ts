import type { AgentNode, NodeStatus } from './types'

export interface ModuleRunAffordance {
  complete: boolean
  unfinishedSpecialists: number
  label: string
  title: string
}

/** Shared flat/globe copy for a module heading. This is display-only: the fresh server plan remains the
 * authority on which outputs are valid/current and whether a safe partial resume is possible. */
export function moduleRunAffordance(
  nodes: Pick<AgentNode, 'key' | 'isSynthesis'>[],
  statusOf: (key: string) => NodeStatus,
): ModuleRunAffordance {
  const specialists = nodes.filter((node) => !node.isSynthesis)
  const unfinishedSpecialists = specialists.filter((node) => statusOf(node.key) !== 'done').length
  const synthesis = nodes.find((node) => node.isSynthesis)
  const synthesisDone = Boolean(synthesis && statusOf(synthesis.key) === 'done')
  const complete = unfinishedSpecialists === 0 && synthesisDone

  if (complete) {
    return {
      complete,
      unfinishedSpecialists,
      label: '✓ done',
      title: 'All visible orbs are complete; click to check whether the saved summary needs refreshing',
    }
  }
  if (unfinishedSpecialists > 0 && unfinishedSpecialists < specialists.length) {
    return {
      complete,
      unfinishedSpecialists,
      label: `▸ finish ${unfinishedSpecialists} empty + related + summary`,
      title: 'Runs the unfinished orbs, may rerun saved checks that depend on them, and always refreshes the module summary',
    }
  }
  if (unfinishedSpecialists === 0) {
    return { complete, unfinishedSpecialists, label: '▸ refresh summary', title: 'Runs this module’s summary only' }
  }
  return { complete, unfinishedSpecialists, label: '▸ run module', title: 'Runs this module only' }
}
