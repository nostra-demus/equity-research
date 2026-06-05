import fs from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { AGENTS_DIR, ANALYSES_DIR } from './config'
import type { AgentNode, ModuleNode, SwarmGraph } from './types'

function readFrontmatter(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = matter(raw)
  return { data: (parsed.data || {}) as Record<string, any>, content: parsed.content || '' }
}

function parseTools(v: any): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean)
  return String(v).split(',').map((s) => s.trim()).filter(Boolean)
}

function parseDependsOn(v: any): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean)
  return String(v)
    .replace(/[[\]]/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Parse the agent body's UPSTREAM_INPUTS block for run-root-relative REQUIRED files.
function parseRequiredUpstream(content: string): string[] {
  const out = new Set<string>()
  for (const ln of content.split(/\r?\n/)) {
    if (!/required/i.test(ln)) continue
    const lineRe = /`analyses\/\{TICKER\}_\{DATE\}\/([^`]+)`/g
    let m: RegExpExecArray | null
    while ((m = lineRe.exec(ln))) out.add(m[1].trim())
  }
  return [...out]
}

function discoverModules(): { name: string; dependsOn: string[]; dir: string }[] {
  const synthFiles = fg.sync('*/99_*-synthesis.md', { cwd: AGENTS_DIR, absolute: true })
  return synthFiles.map((f) => {
    const dir = path.dirname(f)
    const name = path.basename(dir)
    const { data } = readFrontmatter(f)
    return { name, dependsOn: parseDependsOn(data.depends_on), dir }
  })
}

// Topological sort by depends_on (alphabetical tiebreak) — mirrors /research:full module ordering.
function topoSort(mods: { name: string; dependsOn: string[] }[]): string[] {
  const names = new Set(mods.map((m) => m.name))
  const depsOf = new Map(mods.map((m) => [m.name, m.dependsOn.filter((d) => names.has(d))]))
  const placed: string[] = []
  const placedSet = new Set<string>()
  while (placed.length < mods.length) {
    const ready = mods
      .map((m) => m.name)
      .filter((n) => !placedSet.has(n) && (depsOf.get(n) || []).every((d) => placedSet.has(d)))
      .sort()
    if (ready.length === 0) {
      // cycle / unmet dep — append the rest alphabetically so we never loop forever
      for (const n of mods.map((m) => m.name).filter((n) => !placedSet.has(n)).sort()) {
        placed.push(n)
        placedSet.add(n)
      }
      break
    }
    for (const n of ready) {
      placed.push(n)
      placedSet.add(n)
    }
  }
  return placed
}

function buildModule(name: string, dependsOn: string[], order: number): ModuleNode {
  const files = fg
    .sync('[0-9][0-9]_*.md', { cwd: path.join(AGENTS_DIR, name), absolute: true })
    .sort()
  const layers: Record<string, AgentNode[]> = {}
  let count = 0
  for (const f of files) {
    const base = path.basename(f, '.md') // e.g. "09_moat"
    const nn = base.slice(0, 2)
    const slug = base.slice(3)
    const { data, content } = readFrontmatter(f)
    const layer = Number.isFinite(Number(data.layer)) ? Number(data.layer) : 999
    const requiredUpstream = parseRequiredUpstream(content)
    const node: AgentNode = {
      key: `${name}/${base}`,
      module: name,
      nn,
      name: String(data.name || slug),
      slug,
      layer,
      failFast: data.fail_fast === true,
      description: String(data.description || '').trim(),
      tools: parseTools(data.tools),
      requiredUpstream,
      soloRunnable: requiredUpstream.length === 0,
      isSynthesis: nn === '99',
    }
    ;(layers[String(layer)] ||= []).push(node)
    count++
  }
  for (const k of Object.keys(layers)) layers[k].sort((a, b) => a.nn.localeCompare(b.nn))
  return { name, order, dependsOn, layers, agentCount: count }
}

let cached: SwarmGraph | null = null

export function buildSwarmGraph(force = false): SwarmGraph {
  if (cached && !force) return cached
  const discovered = discoverModules()
  const order = topoSort(discovered)
  const modules = order.map((name, i) => {
    const d = discovered.find((m) => m.name === name)!
    return buildModule(name, d.dependsOn, i)
  })

  let masterSynthesizer = { name: 'synthesizer', description: '' }
  const synthFile = path.join(AGENTS_DIR, 'synthesizer.md')
  if (fs.existsSync(synthFile)) {
    const { data } = readFrontmatter(synthFile)
    masterSynthesizer = { name: String(data.name || 'synthesizer'), description: String(data.description || '') }
  }

  const allAgents = modules.flatMap((m) => Object.values(m.layers).flat())
  const synthesis = allAgents.filter((a) => a.isSynthesis).length
  cached = {
    modules,
    masterSynthesizer,
    totals: {
      modules: modules.length,
      agents: allAgents.length,
      specialists: allAgents.length - synthesis,
      synthesis,
    },
  }
  return cached
}

export function findLatestRunRoot(ticker: string): string | null {
  if (!fs.existsSync(ANALYSES_DIR)) return null
  const dirs = fg
    .sync(`${ticker}_*`, { cwd: ANALYSES_DIR, onlyDirectories: true })
    .sort()
    .reverse()
  return dirs.length ? path.join(ANALYSES_DIR, dirs[0]) : null
}

// Latest dated folder that contains <module>/, mirroring the slash-command resolver
// `ls -1d analyses/<TICKER>_*/<module>/ | sort -r | head -1`. Absolute path to the module subfolder.
export function latestModuleFolder(ticker: string, module: string): string | null {
  if (!fs.existsSync(ANALYSES_DIR)) return null
  const dirs = fg
    .sync(`${ticker}_*/${module}`, { cwd: ANALYSES_DIR, onlyDirectories: true })
    .sort()
    .reverse()
  return dirs.length ? path.join(ANALYSES_DIR, dirs[0]) : null
}

// Are a module's cross-module dependencies complete on disk? Checks ONLY module.dependsOn —
// a no-deps module is trivially complete; it does NOT require the module's own synthesis. For each
// dep, the EXACT folder the command would pick must contain its 99 synthesis (mirrors D4).
export function depsCompleteForModule(ticker: string, module: string): { complete: boolean; missing: string[] } {
  const g = buildSwarmGraph()
  const deps = g.modules.find((x) => x.name === module)?.dependsOn ?? []
  const missing: string[] = []
  for (const dep of deps) {
    const folder = latestModuleFolder(ticker, dep)
    const ok = !!folder && fg.sync('99_*-synthesis.md', { cwd: folder }).length > 0
    if (!ok) missing.push(dep)
  }
  return { complete: missing.length === 0, missing }
}

// Recompute soloRunnable against a ticker's latest run folder (deep agents need their upstream present).
export function graphForTicker(ticker: string): SwarmGraph {
  const base = buildSwarmGraph()
  const runRoot = findLatestRunRoot(ticker)
  const clone: SwarmGraph = JSON.parse(JSON.stringify(base))
  for (const m of clone.modules) {
    // module-level: are this module's cross-module dependencies complete on disk? (matches admission D4)
    const deps = depsCompleteForModule(ticker, m.name)
    m.depsComplete = deps.complete
    m.missingDeps = deps.missing
    for (const layerKey of Object.keys(m.layers)) {
      for (const a of m.layers[layerKey]) {
        if (a.requiredUpstream.length === 0) {
          a.soloRunnable = true
        } else if (!runRoot) {
          a.soloRunnable = false
        } else {
          a.soloRunnable = a.requiredUpstream.every((rel) => fs.existsSync(path.join(runRoot, rel)))
        }
      }
    }
  }
  return clone
}

// Flat lookup helpers for launch validation.
export function listModuleNames(): string[] {
  return buildSwarmGraph().modules.map((m) => m.name)
}

export function agentNamesForModule(moduleName: string): string[] {
  const m = buildSwarmGraph().modules.find((x) => x.name === moduleName)
  if (!m) return []
  return Object.values(m.layers).flat().map((a) => a.name)
}

// ---- re-run cascade ----
// One entry per orb that must re-run when a node is re-run: the orb itself, then every
// synthesis its output flows into (its module's 99, each downstream module's 99), then the master.
export interface CascadeNode {
  key: string
  module: string
  name: string
  layer: number
  nn?: string
  slug?: string
  outputRel?: string
  kind: 'agent' | 'module-synthesis' | 'master'
}

const MASTER_CASCADE: CascadeNode = { key: 'master/synthesizer', module: 'master', name: 'synthesizer', layer: 99, kind: 'master' }

export function synthesisOf(m: ModuleNode): AgentNode | null {
  return Object.values(m.layers).flat().find((a) => a.isSynthesis) || null
}
function cascadeEntry(a: AgentNode, kind: 'agent' | 'module-synthesis'): CascadeNode {
  return { key: a.key, module: a.module, name: a.name, layer: a.layer, nn: a.nn, slug: a.slug, outputRel: `${a.module}/${a.nn}_${a.slug}.md`, kind }
}
// Transitive set of modules `moduleName` (directly or indirectly) depends on — its ancestors.
export function moduleAncestors(graph: SwarmGraph, moduleName: string): Set<string> {
  const up = new Set<string>()
  const visit = (name: string) => {
    const m = graph.modules.find((x) => x.name === name)
    for (const d of m?.dependsOn ?? []) {
      if (!up.has(d)) {
        up.add(d)
        visit(d)
      }
    }
  }
  visit(moduleName)
  return up
}

// Transitive closure of modules that (directly or indirectly) depend on `moduleName`.
export function transitiveDownstreamModules(graph: SwarmGraph, moduleName: string): Set<string> {
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

// Ordered re-run cascade for a target orb. Three target cases:
//  - specialist  -> [target, its module 99, ...downstream module 99s (topo), master]
//  - module 99   -> [that 99, ...downstream module 99s (topo), master]
//  - master      -> [master] only (regenerates thesis/memo/dossier)
export function downstreamCascade(moduleName: string, agentName: string): CascadeNode[] {
  if (moduleName === 'master') return [MASTER_CASCADE]
  const graph = buildSwarmGraph()
  const mod = graph.modules.find((m) => m.name === moduleName)
  if (!mod) return []
  const target = Object.values(mod.layers).flat().find((a) => a.name === agentName || a.slug === agentName)
  if (!target) return []

  const out: CascadeNode[] = []
  out.push(cascadeEntry(target, target.isSynthesis ? 'module-synthesis' : 'agent'))
  if (!target.isSynthesis) {
    const synth = synthesisOf(mod)
    if (synth) out.push(cascadeEntry(synth, 'module-synthesis'))
  }
  const down = transitiveDownstreamModules(graph, moduleName)
  for (const m of graph.modules) {
    if (!down.has(m.name)) continue
    const synth = synthesisOf(m)
    if (synth) out.push(cascadeEntry(synth, 'module-synthesis'))
  }
  out.push(MASTER_CASCADE)
  return out
}
