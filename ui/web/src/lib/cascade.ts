import type { AgentNode, ModuleNode, SwarmGraph } from './types'

// One orb that must re-run when a node is re-run. Mirrors ui/server/src/roster.ts downstreamCascade:
// the target orb, then every synthesis its output flows into (its module 99, each downstream module 99), then master.
export interface CascadeNode {
  key: string
  module: string
  name: string
  layer: number
  isSynthesis: boolean
  kind: 'agent' | 'module-synthesis' | 'master'
}

export const MASTER_CASCADE: CascadeNode = { key: 'master/synthesizer', module: 'master', name: 'synthesizer', layer: 99, isSynthesis: true, kind: 'master' }

function synthesisOf(m: ModuleNode): AgentNode | undefined {
  return Object.values(m.layers).flat().find((a) => a.isSynthesis)
}
function entry(a: AgentNode, kind: CascadeNode['kind']): CascadeNode {
  return { key: a.key, module: a.module, name: a.name, layer: a.layer, isSynthesis: a.isSynthesis, kind }
}
// Transitive closure of modules that (directly or indirectly) depend on `moduleName`.
function transitiveDownstreamModules(graph: SwarmGraph, moduleName: string): Set<string> {
  const down = new Set<string>()
  let changed = true
  while (changed) {
    changed = false
    for (const m of graph.modules) {
      if (down.has(m.name)) continue
      if (m.dependsOn.includes(moduleName) || m.dependsOn.some((d) => down.has(d))) {
        down.add(m.name)
        changed = true
      }
    }
  }
  return down
}

// Ordered re-run cascade for a target orb (see roster.ts for the canonical backend version).
// Accepts the agent's frontmatter `name`, `slug`, or full `key` to identify the target.
export function downstreamCascade(graph: SwarmGraph | null, moduleName: string, agentName: string): CascadeNode[] {
  if (moduleName === 'master') return [MASTER_CASCADE]
  if (!graph) return []
  const mod = graph.modules.find((m) => m.name === moduleName)
  if (!mod) return []
  const target = Object.values(mod.layers)
    .flat()
    .find((a) => a.name === agentName || a.slug === agentName || a.key === `${moduleName}/${agentName}`)
  if (!target) return []

  const out: CascadeNode[] = [entry(target, target.isSynthesis ? 'module-synthesis' : 'agent')]
  if (!target.isSynthesis) {
    const s = synthesisOf(mod)
    if (s) out.push(entry(s, 'module-synthesis'))
  }
  const down = transitiveDownstreamModules(graph, moduleName)
  for (const m of graph.modules) {
    if (!down.has(m.name)) continue
    const s = synthesisOf(m)
    if (s) out.push(entry(s, 'module-synthesis'))
  }
  out.push(MASTER_CASCADE)
  return out
}

// Merged multi-orb cascade (mirrors roster.ts mergedDownstreamCascade): targets first in entry
// order, each affected synthesis once in graph topo order, master once. Empty if ANY entry fails
// to resolve — the caller treats that as a validation failure, same as the single-orb path.
export function mergedDownstreamCascade(graph: SwarmGraph | null, orbs: { module: string; agent: string }[]): CascadeNode[] {
  if (orbs.length <= 1) return orbs.length ? downstreamCascade(graph, orbs[0].module, orbs[0].agent) : []
  if (!graph) return []
  const targets: CascadeNode[] = []
  const synthByKey = new Map<string, CascadeNode>()
  let hasMaster = false
  for (const o of orbs) {
    const single = downstreamCascade(graph, o.module, o.agent)
    if (!single.length) return []
    single.forEach((node, i) => {
      if (node.kind === 'master') hasMaster = true
      else if (i === 0) {
        if (!targets.some((t) => t.key === node.key)) targets.push(node)
      } else if (node.kind === 'module-synthesis') synthByKey.set(node.key, node)
    })
  }
  for (const t of targets) if (t.kind === 'module-synthesis') synthByKey.delete(t.key)
  const ordered: CascadeNode[] = []
  for (const m of graph.modules) for (const node of synthByKey.values()) if (node.module === m.name) ordered.push(node)
  return [...targets, ...ordered, ...(hasMaster ? [MASTER_CASCADE] : [])]
}

// Short human label for a cascade entry, e.g. "segment-map", "business-model synthesis", "Memo (master)".
export function cascadeLabel(c: CascadeNode): string {
  if (c.kind === 'master') return 'Memo (master synthesizer)'
  if (c.kind === 'module-synthesis') return `${c.module.replace(/-/g, ' ')} synthesis`
  return c.name.replace(/-/g, ' ')
}
