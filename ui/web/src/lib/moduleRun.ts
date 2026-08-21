import type { AgentNode, ModuleNode, NodeStatus } from './types'

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
  savedInputsValue: string
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

/** Inputs an exact module can consume without broadening its run: every required ancestor plus its direct,
 * optional `reads_from` modules. Preserve graph order and de-duplicate so the confirmation matches the
 * self-declared graph instead of naming any research module in web code. */
export function moduleRunInputModules(
  modules: Pick<ModuleNode, 'name' | 'dependsOn' | 'readsFrom'>[],
  module: string,
): string[] {
  const byName = new Map(modules.map((entry) => [entry.name, entry]))
  const target = byName.get(module)
  if (!target) return []
  const inputs: string[] = []
  const added = new Set<string>()
  const visiting = new Set<string>()
  const addRequired = (name: string) => {
    if (name === module || visiting.has(name)) return
    visiting.add(name)
    for (const ancestor of byName.get(name)?.dependsOn ?? []) addRequired(ancestor)
    visiting.delete(name)
    if (!added.has(name)) {
      added.add(name)
      inputs.push(name)
    }
  }
  for (const dependency of target.dependsOn) addRequired(dependency)
  for (const optional of target.readsFrom ?? []) {
    if (optional !== module && !added.has(optional)) {
      added.add(optional)
      inputs.push(optional)
    }
  }
  return inputs
}

/** Plain-language copy for the confirmation shown before a smart module resume reads the server plan. */
export function moduleRunConfirmation(
  module: string,
  unfinishedSpecialists: number,
  inputModules: string[] = [],
): ModuleRunConfirmation {
  const name = displayModuleName(module)
  return {
    title: `Run ${name}?`,
    subtitle: `After you confirm, the engine checks saved work and runs only what ${name} still needs.`,
    emptyValue: unfinishedSpecialists === 1 ? '1 visible now' : `${unfinishedSpecialists} visible now`,
    savedInputsValue: inputModules.length
      ? `${joinModuleNames(inputModules)} — reused if available; may not include newest source data`
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
