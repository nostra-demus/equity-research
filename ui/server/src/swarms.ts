import fs from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { AGENTS_DIR } from './config'
import type { SwarmManifest, SwarmRoutingContract, SwarmWireDecl } from './types'

// Swarm discovery (CLAUDE.md §26 "Swarms"): a swarm is `.claude/agents/<swarm>/` carrying a
// SWARM.md manifest; its modules NEST one level deeper. The research swarm is grandfathered as a
// synthetic default manifest (flat modules, no SWARM.md on disk), so every consumer can be
// swarm-agnostic and the engine never hardcodes a swarm id beyond this one default.

export const RESEARCH_SWARM_ID = 'research'

function canonicalRepoPath(value: string): string | null {
  if (!value || value.includes('\\') || path.posix.isAbsolute(value)) return null
  const normalized = path.posix.normalize(value)
  if (normalized !== value || normalized === '.' || normalized === '..' || normalized.startsWith('../')) return null
  return normalized.replace(/\/$/, '')
}

// A declared decision artifact is a JSON file below the concrete run root. Reject the whole manifest
// when the declaration is malformed: silently ignoring an unsafe or unknown target would let a future
// swarm publish an unattributed terminal decision, defeating the zero-touch provenance contract.
function parseDecisionArtifacts(value: unknown): string[] | undefined | null {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length === 0) return null
  const artifacts: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') return null
    const candidate = item.trim()
    const safe = canonicalRepoPath(candidate)
    if (!safe || safe !== candidate || !safe.endsWith('.json')) return null
    artifacts.push(safe)
  }
  if (new Set(artifacts).size !== artifacts.length) return null
  return artifacts
}

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
    decisionArtifacts: ['decision_record.json'],
    reviewCommand: 'review-decisions',
    calibrator: 'scripts/calibrate.py',
  }
}

function parseRouting(v: any): SwarmRoutingContract | undefined {
  if (!v || typeof v !== 'object') return undefined
  const list = (x: any) => (Array.isArray(x) ? x.map(String).map((s) => s.trim()).filter(Boolean) : [])
  const verdictField = String(v.verdict_field || '').trim()
  if (!verdictField) return undefined
  return { verdictField, terminal: list(v.terminal), continue: list(v.continue) }
}

// The optional `wire:` capability block (SwarmWireDecl) — snake_case front-matter to camelCase,
// undefined when absent or empty so /api/swarms omits the key entirely (the client's fail-closed gate).
function parseWire(v: any): SwarmWireDecl | undefined {
  if (!v || typeof v !== 'object') return undefined
  const str = (x: any) => (typeof x === 'string' && x.trim() ? x.trim() : undefined)
  const wire: SwarmWireDecl = {
    eventScope: str(v.event_scope),
    groupBy: str(v.group_by),
    subjectField: str(v.subject_field),
    pulse: str(v.pulse),
    defaultView: str(v.default_view),
  }
  return Object.values(wire).some((x) => x !== undefined) ? wire : undefined
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
  const runsRoot = str(data.runs_root, path.dirname(runRootTemplate.split('{')[0].replace(/\/+$/, '')))
  // Every consumer may trust a discovered manifest's path fields. Admit only canonical repo-relative
  // POSIX paths here, once: absolute/upward/backslash/dot-normalized roots or templates are not swarms.
  const safeRunsRoot = canonicalRepoPath(runsRoot)
  const safeTemplate = canonicalRepoPath(runRootTemplate)
  if (!safeRunsRoot || !safeTemplate || safeTemplate === safeRunsRoot || !safeTemplate.startsWith(`${safeRunsRoot}/`)) return null
  const decisionArtifacts = parseDecisionArtifacts(data.decision_artifacts)
  if (decisionArtifacts === null) return null
  const reviewCommand = str(data.review_command)
  const calibrator = str(data.calibrator)
  if (reviewCommand && !/^[a-z0-9-]{1,80}$/.test(reviewCommand)) return null
  const safeCalibrator = calibrator ? canonicalRepoPath(calibrator) : undefined
  if (calibrator && (!safeCalibrator || !safeCalibrator.startsWith('scripts/') || !safeCalibrator.endsWith('.py'))) return null
  const calibrationRoot = str(data.calibration_root)
  const safeCalibrationRoot = calibrationRoot ? canonicalRepoPath(calibrationRoot) : undefined
  if (calibrationRoot && (!safeCalibrationRoot || !safeCalibrationRoot.startsWith(`${safeRunsRoot.split('/')[0]}/`))) return null
  // A deterministic calibrator may follow another tracked outcome kind (the screener uses conviction),
  // so review_command is optional. Whenever present, calibration itself remains an all-or-nothing pair.
  if (Boolean(safeCalibrator) !== Boolean(safeCalibrationRoot)) return null
  if (reviewCommand && !(safeCalibrator && safeCalibrationRoot)) return null
  return {
    id,
    label: str(data.label, id),
    color: str(data.color, '#1499ab'),
    unit: str(data.unit, 'signal'),
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 99,
    layout: str(data.layout, 'flow'),
    commandNs: str(data.command_ns, id),
    dir,
    runsRoot: safeRunsRoot,
    runRootTemplate: safeTemplate,
    placeholder: str(data.placeholder, 'SIG_ID'),
    decisionArtifacts,
    ledgerRoot: str(data.ledger_root) || undefined,
    boardIndex: str(data.board_index) || undefined,
    inboxRoot: str(data.inbox_root) || undefined,
    schemasRoot: str(data.schemas_root) || undefined,
    reviewCommand: reviewCommand || undefined,
    calibrator: safeCalibrator || undefined,
    calibrationRoot: safeCalibrationRoot || undefined,
    subjectsSource: str(data.subjects_source) || undefined,
    routing: parseRouting(data.routing),
    wire: parseWire(data.wire),
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
  const marker = `{${swarm.placeholder}}`
  if (!marker || swarm.runRootTemplate.split(marker).length !== 2) return null
  const out = swarm.runRootTemplate.replace(marker, subjectId).split(path.sep).join('/')
  const runsRoot = path.posix.normalize(swarm.runsRoot.replaceAll('\\', '/')).replace(/^\.\//, '').replace(/\/$/, '')
  const normalized = path.posix.normalize(out).replace(/^\.\//, '')
  if (!runsRoot || runsRoot === '..' || runsRoot.startsWith('../')
      || path.posix.isAbsolute(runsRoot) || path.posix.isAbsolute(out) || normalized !== out
      || out.includes('{') || normalized === runsRoot || !normalized.startsWith(`${runsRoot}/`)) return null
  return normalized
}
