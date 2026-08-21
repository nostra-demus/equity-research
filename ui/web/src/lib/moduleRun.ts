import type { AgentNode, NodeStatus } from './types'

export interface ModuleRunAffordance {
  complete: boolean
  unfinishedSpecialists: number
  label: string
  title: string
}

export interface ModuleRunConfirmation {
  title: string
  subtitle: string
  emptyValue: string
  savedUpstreamValue: string
  relatedValue: string
  summaryValue: string
  actionLabel: string
}

function displayModuleName(module: string): string {
  return module
    .split('-')
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`)
    .join(' ')
}

function joinModuleNames(modules: string[]): string {
  const names = modules.map(displayModuleName)
  if (names.length < 2) return names[0] ?? 'None'
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
}

/** Plain-language copy for the confirmation shown before a smart module resume reads the server plan. */
export function moduleRunConfirmation(
  module: string,
  unfinishedSpecialists: number,
  upstreamModules: string[] = [],
): ModuleRunConfirmation {
  const name = displayModuleName(module)
  return {
    title: `Run ${name}?`,
    subtitle: `After you confirm, the engine checks saved work and runs only what ${name} still needs.`,
    emptyValue: unfinishedSpecialists === 1 ? '1 visible now' : `${unfinishedSpecialists} visible now`,
    savedUpstreamValue: upstreamModules.length
      ? `${joinModuleNames(upstreamModules)} — kept as saved; may not include newest source data`
      : 'None',
    relatedValue: 'only if an empty orb affects them',
    summaryValue: 'always refreshed',
    actionLabel: module === 'management-governance' ? 'Run Governance' : `Run ${name}`,
  }
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
