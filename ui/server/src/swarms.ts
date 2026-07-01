import fs from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { AGENTS_DIR } from './config'
import type { SwarmManifest, SwarmRoutingContract } from './types'

// Swarm discovery (CLAUDE.md §26 "Swarms"): a swarm is `.claude/agents/<swarm>/` carrying a
// SWARM.md manifest; its modules NEST one level deeper. The research swarm is grandfathered as a
// synthetic default manifest (flat modules, no SWARM.md on disk), so every consumer can be
// swarm-agnostic and the engine never hardcodes a swarm id beyond this one default.

export const RESEARCH_SWARM_ID = 'research'

function researchManifest(): SwarmManifest {
  return {
    id: RESEARCH_SWARM_ID,
    label: 'Research',
    color: '#c0851d',
    unit: 'ticker',
    order: 1,
    layout: 'constellation',
    commandNs: 'research',
    dir: AGENTS_DIR,
    runsRoot: 'analyses',
    runRootTemplate: 'analyses/{TICKER}_{DATE}',
    placeholder: 'TICKER',
  }
}

function parseRouting(v: any): SwarmRoutingContract | undefined {
  if (!v || typeof v !== 'object') return undefined
  const list = (x: any) => (Array.isArray(x) ? x.map(String).map((s) => s.trim()).filter(Boolean) : [])
  const verdictField = String(v.verdict_field || '').trim()
  if (!verdictField) return undefined
  return { verdictField, terminal: list(v.terminal), continue: list(v.continue) }
}

function parseManifest(file: string): SwarmManifest | null {
  let data: Record<string, any>
  try {
    data = matter(fs.readFileSync(file, 'utf8')).data || {}
  } catch {
    return null
  }
  const dir = path.dirname(file)
  const id = String(data.id || path.basename(dir)).trim()
  if (!id || id === RESEARCH_SWARM_ID) return null // 'research' is reserved for the grandfathered default
  const str = (v: any, d = '') => (typeof v === 'string' && v.trim() ? v.trim() : d)
  const runRootTemplate = str(data.run_root_template)
  if (!runRootTemplate) return null // a swarm without a run-root template cannot host runs
  return {
    id,
    label: str(data.label, id),
    color: str(data.color, '#1499ab'),
    unit: str(data.unit, 'signal'),
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 99,
    layout: str(data.layout, 'flow'),
    commandNs: str(data.command_ns, id),
    dir,
    runsRoot: str(data.runs_root, path.dirname(runRootTemplate.split('{')[0].replace(/\/+$/, ''))),
    runRootTemplate,
    placeholder: str(data.placeholder, 'SIG_ID'),
    ledgerRoot: str(data.ledger_root) || undefined,
    boardIndex: str(data.board_index) || undefined,
    inboxRoot: str(data.inbox_root) || undefined,
    schemasRoot: str(data.schemas_root) || undefined,
    subjectsSource: str(data.subjects_source) || undefined,
    routing: parseRouting(data.routing),
  }
}

let cached: SwarmManifest[] | null = null

// All swarms, research (the grandfathered default) first, then by manifest `order`.
export function listSwarms(force = false): SwarmManifest[] {
  if (cached && !force) return cached
  const manifests: SwarmManifest[] = []
  for (const f of fg.sync('*/SWARM.md', { cwd: AGENTS_DIR, absolute: true })) {
    const m = parseManifest(f)
    if (m) manifests.push(m)
  }
  manifests.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
  cached = [researchManifest(), ...manifests]
  return cached
}

export function swarmById(id: string | undefined | null): SwarmManifest | undefined {
  const sid = id || RESEARCH_SWARM_ID
  return listSwarms().find((s) => s.id === sid)
}

// Directory names under .claude/agents/ that are swarm roots (so research module discovery can
// assert it never accidentally treats one as a module — the one-level glob already cannot).
export function swarmDirNames(): Set<string> {
  return new Set(listSwarms().filter((s) => s.id !== RESEARCH_SWARM_ID).map((s) => path.basename(s.dir)))
}

// Resolve a subject's concrete run root from the swarm's template, e.g.
// ('screener', 'SIG-20260610-a3f2c81d') -> 'screener/runs/SIG-20260610-a3f2c81d'.
// Null when the template still has unresolved tokens (research's {TICKER}_{DATE} resolves through
// the launcher's own date logic, never through this helper).
export function runRootForSubject(swarm: SwarmManifest, subjectId: string): string | null {
  const out = swarm.runRootTemplate.replace(`{${swarm.placeholder}}`, subjectId)
  return out.includes('{') ? null : out
}
