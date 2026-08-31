import fs from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { AGENTS_DIR, ANALYSES_DIR, REPO_ROOT } from './config'
import { RESEARCH_SWARM_ID, listSwarms, runRootForSubject, swarmById } from './swarms'
import { normalizeDataSubject, MANIFEST_SUBJECT_RE } from './data-subject'
import { resolveManifestRunRoot } from './swarm-run-root'
import { resolveDisplayFields } from './ledger-corrections'
import { extractTriageStatus } from './verdict'
import { validateAgentOutputFile } from '../../../scripts/agent-output-validity.mjs'
import type { AgentNode, DataReadinessDecl, MemoryProfile, ModuleNode, SwarmGraph, SwarmManifest, SwarmSubjectSummary } from './types'

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

const MEMORY_PROFILE_KEYS = new Set([
  'version', 'task', 'episodic_scope', 'semantic_topics', 'procedure_tags', 'cross_company',
  'permitted_source_tiers', 'permitted_classifications', 'max_context_tokens',
])
const MEMORY_PROFILE_TASK = /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/
const MEMORY_PROFILE_TAG = /^[a-z][a-z0-9-]*$/

function parseMemoryProfile(value: unknown, source: string, required: boolean): MemoryProfile | undefined {
  if (value === undefined && !required) return undefined
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${source}: analytical agent requires a closed memory_profile`)
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
  if (keys.length !== MEMORY_PROFILE_KEYS.size || keys.some((key) => !MEMORY_PROFILE_KEYS.has(key))) {
    throw new Error(`${source}: memory_profile has missing or unrecognized fields`)
  }
  const stringList = (field: string): string[] => {
    const values = record[field]
    if (!Array.isArray(values) || values.length === 0
        || values.some((item) => typeof item !== 'string' || !MEMORY_PROFILE_TAG.test(item))) {
      throw new Error(`${source}: memory_profile.${field} must be a non-empty safe list`)
    }
    return [...new Set(values as string[])]
  }
  const tiers = record.permitted_source_tiers
  const classifications = record.permitted_classifications
  if (record.version !== 1 || typeof record.task !== 'string' || !MEMORY_PROFILE_TASK.test(record.task)
      || record.episodic_scope !== 'exact-listing' || typeof record.cross_company !== 'boolean'
      || !Array.isArray(tiers) || tiers.some((tier) => !Number.isInteger(tier) || Number(tier) < 1 || Number(tier) > 5)
      || new Set(tiers).size !== tiers.length
      || !Array.isArray(classifications) || classifications.length === 0
      || classifications.some((item) => item !== 'public' && item !== 'internal')
      || typeof record.max_context_tokens !== 'number' || !Number.isInteger(record.max_context_tokens)
      || record.max_context_tokens < 1) {
    throw new Error(`${source}: memory_profile contains an invalid authority or budget`)
  }
  return {
    version: 1,
    task: record.task,
    episodicScope: 'exact-listing',
    semanticTopics: stringList('semantic_topics'),
    procedureTags: stringList('procedure_tags'),
    crossCompany: record.cross_company,
    permittedSourceTiers: tiers as number[],
    permittedClassifications: classifications as Array<'public' | 'internal'>,
    maxContextTokens: record.max_context_tokens,
  }
}

// Parse the agent body's UPSTREAM_INPUTS block for run-root-relative REQUIRED files.
// The path shape is the SWARM's run-root template (manifest-derived, never hardcoded):
// research agents write `analyses/{TICKER}_{DATE}/<rel>`, screener agents write
// `screener/runs/{SIG_ID}/<rel>`, a future swarm writes its own template. The stored
// requiredUpstream stays RUN-ROOT-RELATIVE in every swarm.
function upstreamLineRegex(swarm: SwarmManifest): RegExp {
  const esc = swarm.runRootTemplate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp('`' + esc + '/([^`]+)`', 'g')
}

function parseRequiredUpstream(content: string, swarm: SwarmManifest): string[] {
  const out = new Set<string>()
  const lineRe = upstreamLineRegex(swarm)
  for (const ln of content.split(/\r?\n/)) {
    if (!/required/i.test(ln)) continue
    lineRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = lineRe.exec(ln))) out.add(m[1].trim())
  }
  return [...out]
}

interface DiscoveredModule {
  name: string
  dependsOn: string[]
  readsFrom: string[]
  exactResume: boolean
  dir: string // absolute module folder (nested for swarms)
}

function discoverModules(swarm: SwarmManifest): DiscoveredModule[] {
  // research (grandfathered): flat one-level glob — by construction it cannot see a swarm's
  // nested modules (their 99s sit two levels deep). Swarms: one level inside the swarm dir.
  const synthFiles = fg.sync('*/99_*-synthesis.md', { cwd: swarm.dir, absolute: true })
  return synthFiles.map((f) => {
    const dir = path.dirname(f)
    const name = path.basename(dir)
    const { data } = readFrontmatter(f)
    return {
      name,
      dependsOn: parseDependsOn(data.depends_on),
      readsFrom: parseDependsOn(data.reads_from),
      exactResume: data.exact_resume === true,
      dir,
    }
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

function buildModule(mod: DiscoveredModule, order: number, swarm: SwarmManifest): ModuleNode {
  const productionMemoryProfiles = swarm.id === RESEARCH_SWARM_ID
    && fs.existsSync(path.join(REPO_ROOT, 'frameworks', 'MEMORY_RUNTIME.md'))
  const files = fg.sync('[0-9][0-9]_*.md', { cwd: mod.dir, absolute: true }).sort()
  const layers: Record<string, AgentNode[]> = {}
  let count = 0
  let dataReadiness: DataReadinessDecl | undefined
  for (const f of files) {
    const base = path.basename(f, '.md') // e.g. "09_moat"
    const nn = base.slice(0, 2)
    const slug = base.slice(3)
    const { data, content } = readFrontmatter(f)
    const layer = Number.isFinite(Number(data.layer)) ? Number(data.layer) : 999
    // a module self-declares its data-readiness rule in its 00-triage frontmatter (optional)
    if (nn === '00' && data.data_readiness && typeof data.data_readiness === 'object') dataReadiness = data.data_readiness as DataReadinessDecl
    const requiredUpstream = parseRequiredUpstream(content, swarm)
    const node: AgentNode = {
      key: `${mod.name}/${base}`,
      module: mod.name,
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
      memoryProfile: parseMemoryProfile(data.memory_profile, path.relative(REPO_ROOT, f), productionMemoryProfiles),
    }
    if (productionMemoryProfiles) {
      const expectedBudget = nn === '99' ? 4000 : 3000
      if (node.memoryProfile?.maxContextTokens !== expectedBudget) {
        throw new Error(`${path.relative(REPO_ROOT, f)}: memory_profile.max_context_tokens must be ${expectedBudget}`)
      }
    }
    ;(layers[String(layer)] ||= []).push(node)
    count++
  }
  for (const k of Object.keys(layers)) layers[k].sort((a, b) => a.nn.localeCompare(b.nn))
  const node: ModuleNode = { name: mod.name, order, dependsOn: mod.dependsOn, layers, agentCount: count, dataReadiness }
  if (mod.readsFrom.length) node.readsFrom = mod.readsFrom
  // Always publish the boolean. `undefined` is reserved as a rolling-deploy witness for an older server;
  // the web client fails closed instead of mistaking an omitted capability for permission to run whole.
  node.exactResume = mod.exactResume
  // swarm provenance only for non-research swarms — the default research payload stays byte-stable
  if (swarm.id !== RESEARCH_SWARM_ID) {
    node.swarmId = swarm.id
    node.moduleDir = path.relative(REPO_ROOT, mod.dir)
  }
  return node
}

// Map of module name -> its self-declared data-readiness rule (undefined if it declares none).
// data-status uses this so a NEW module never needs a hand-written rule in the readiness engine.
export function moduleReadinessDecls(): Record<string, DataReadinessDecl | undefined> {
  const out: Record<string, DataReadinessDecl | undefined> = {}
  for (const m of buildSwarmGraph().modules) out[m.name] = m.dataReadiness
  return out
}

const cached = new Map<string, SwarmGraph>()

export function buildSwarmGraph(swarmId: string = RESEARCH_SWARM_ID, force = false): SwarmGraph {
  const hit = cached.get(swarmId)
  if (hit && !force) return hit
  const swarm = swarmById(swarmId)
  if (!swarm) throw Object.assign(new Error(`unknown swarm '${swarmId}'`), { statusCode: 404 })
  const discovered = discoverModules(swarm)
  const order = topoSort(discovered)
  const modules = order.map((name, i) => {
    const d = discovered.find((m) => m.name === name)!
    return buildModule(d, i, swarm)
  })

  let masterSynthesizer: SwarmGraph['masterSynthesizer'] = { name: 'synthesizer', description: '' }
  if (swarm.id === RESEARCH_SWARM_ID) {
    const synthFile = path.join(AGENTS_DIR, 'synthesizer.md')
    if (fs.existsSync(synthFile)) {
      const { data } = readFrontmatter(synthFile)
      const productionMemoryProfiles = fs.existsSync(path.join(REPO_ROOT, 'frameworks', 'MEMORY_RUNTIME.md'))
      const memoryProfile = parseMemoryProfile(
        data.memory_profile, path.relative(REPO_ROOT, synthFile), productionMemoryProfiles,
      )
      if (productionMemoryProfiles && memoryProfile?.maxContextTokens !== 6000) {
        throw new Error(`${path.relative(REPO_ROOT, synthFile)}: memory_profile.max_context_tokens must be 6000`)
      }
      masterSynthesizer = {
        name: String(data.name || 'synthesizer'),
        description: String(data.description || ''),
        memoryProfile,
      }
    }
  } else {
    // swarms have no master synthesizer orb — their terminal is the routing switchyard
    masterSynthesizer = { name: '', description: '' }
  }

  const allAgents = modules.flatMap((m) => Object.values(m.layers).flat())
  const synthesis = allAgents.filter((a) => a.isSynthesis).length
  const graph: SwarmGraph = {
    modules,
    masterSynthesizer,
    totals: {
      modules: modules.length,
      agents: allAgents.length,
      specialists: allAgents.length - synthesis,
      synthesis,
    },
  }
  if (swarm.id !== RESEARCH_SWARM_ID) {
    graph.swarm = { id: swarm.id, label: swarm.label, color: swarm.color, unit: swarm.unit, layout: swarm.layout, order: swarm.order }
  }
  cached.set(swarmId, graph)
  return graph
}

// Build every discovered graph during process startup, before the server announces readiness. The graph
// builder is synchronous and cached, so doing this once keeps the first request to any swarm off the cold
// discovery/parsing path without hardcoding today's swarm ids (§26 zero-touch discovery).
export function warmSwarmGraphs(): [SwarmGraph, ...SwarmGraph[]] {
  const research = buildSwarmGraph(RESEARCH_SWARM_ID)
  const others = listSwarms()
    .filter((swarm) => swarm.id !== RESEARCH_SWARM_ID)
    .map((swarm) => buildSwarmGraph(swarm.id))
  return [research, ...others]
}

// The terminal module of a swarm's DAG — the sink no other module depends on (topo-last tiebreak).
// A constellation swarm's final deliverable is this module's 99 synthesis (e.g. the commodity
// dossier); research's is the master synthesizer's final_thesis.md, which is not a module, so
// research callers never ask. Derived from the discovered graph — no module name hardcoded (§26).
export function terminalModuleName(swarmId: string): string | null {
  const g = buildSwarmGraph(swarmId)
  const depended = new Set(g.modules.flatMap((m) => m.dependsOn))
  const sinks = g.modules.filter((m) => !depended.has(m.name))
  return sinks.length ? sinks[sinks.length - 1].name : null
}

export function findLatestRunRoot(ticker: string): string | null {
  if (!fs.existsSync(ANALYSES_DIR)) return null
  const dirs = fg
    .sync(`${ticker}_*`, { cwd: ANALYSES_DIR, onlyDirectories: true })
    .sort()
    .reverse()
  return dirs.length ? path.join(ANALYSES_DIR, dirs[0]) : null
}

// The subject's run root for ANY swarm, ABSOLUTE, or null when none exists on disk yet.
// research: the latest dated analyses/<TICKER>_* folder; other swarms: the template-resolved
// folder (one run folder per subject — a signal's folder IS its identity).
export function findRunRootForSubject(swarmId: string, subjectId: string): string | null {
  if (swarmId === RESEARCH_SWARM_ID) return findLatestRunRoot(subjectId)
  return resolveManifestRunRoot(swarmId, subjectId, { mustExist: true })?.absolute ?? null
}

// Subjects (units of work) of a NON-research swarm, for the cockpit subject picker: the union of
// (a) existing run folders under the swarm's runsRoot, and (b) the `## <NAME>` headings in the swarm's
// declared `subjects_source` markdown (so a not-yet-run subject is still selectable). Generic — no
// subject or swarm name is hardcoded (CLAUDE.md §26); research uses /api/tickers instead. Sorted, unique.
export function swarmSubjects(swarmId: string): string[] {
  const swarm = swarmById(swarmId)
  if (!swarm || swarm.id === RESEARCH_SWARM_ID) return []
  const out = new Set<string>()
  try {
    for (const d of fs.readdirSync(path.join(REPO_ROOT, swarm.runsRoot), { withFileTypes: true })) {
      if (d.isDirectory() && !d.isSymbolicLink() && normalizeDataSubject(swarmId, d.name)) out.add(d.name)
    }
  } catch { /* no runs yet */ }
  if (swarm.subjectsSource) {
    try {
      const txt = fs.readFileSync(path.join(REPO_ROOT, swarm.subjectsSource), 'utf8')
      const heading = new RegExp(`^##\\s+(${MANIFEST_SUBJECT_RE.source.slice(1, -1)})\\s*$`, 'gm')
      for (const m of txt.matchAll(heading)) if (normalizeDataSubject(swarmId, m[1])) out.add(m[1])
    } catch { /* no subjects source on disk */ }
  }
  return [...out].sort()
}

// The verdict a decision record carries, across swarms (server twin of the web format.resolveVerdict):
// research records use `decision`; a non-research swarm self-declares its routing verdict key in SWARM.md
// (commodity: `Action` → record key `action`). Fail-closed: without a verdict field only the research
// `decision` shape resolves. Never hardcodes a swarm/subject name (§26).
function resolveRecordVerdict(dr: Record<string, any>, verdictField?: string | null): string | null {
  const key = resolveVerdictKey(dr, verdictField)
  if (!key) return null
  const v = dr?.[key]
  return typeof v === 'string' && v ? v : null
}

// WHICH record key the verdict was read from — research `decision` wins when present (the fail-closed
// default), otherwise the swarm's self-declared routing field, tried as declared then lowercased (SWARM.md
// may capitalize it: commodity declares `Action`, the JSON key is `action`). Returned separately from the
// value so the post-mortem cap can be looked up against the SAME key (`post_mortem_<key>`) the verdict came
// from — otherwise a swarm's cap and its original call could be read off different fields.
function resolveVerdictKey(dr: Record<string, any>, verdictField?: string | null): string | null {
  if (dr && typeof dr.decision === 'string' && dr.decision) return 'decision'
  if (!verdictField) return null
  if (typeof dr?.[verdictField] === 'string' && dr[verdictField]) return verdictField
  const lower = verdictField.toLowerCase()
  if (typeof dr?.[lower] === 'string' && dr[lower]) return lower
  return null
}

// Per-subject run summaries for a NON-research swarm's subject picker: for each subject swarmSubjects()
// lists, read its single run folder's decision_record.json (when present) and surface the routing verdict,
// confidence, decision date, and last-changed time — the constellation twin of the research picker's
// per-ticker decision pill. A subject with no run folder (declared in the profiles source but never run)
// comes back hasRun:false with null run fields, so it still lists but shows no verdict. Generic — the
// verdict field comes from the swarm's own routing contract, nothing is hardcoded (§26). Research returns
// [] (it uses the richer TickerSummary via /api/tickers). Never throws: a missing/partial record degrades
// to a null verdict, never an error.
export function swarmSubjectSummaries(swarmId: string): SwarmSubjectSummary[] {
  const swarm = swarmById(swarmId)
  if (!swarm || swarm.id === RESEARCH_SWARM_ID) return []
  const verdictField = swarm.routing?.verdictField
  return swarmSubjects(swarmId).map((subject) => {
    const abs = findRunRootForSubject(swarmId, subject) // absolute path, or null when never run
    const summary: SwarmSubjectSummary = {
      subject,
      hasRun: !!abs,
      runRoot: abs ? path.relative(REPO_ROOT, abs) : null,
      verdict: null,
      decisionDate: null,
      confidence: null,
      verdictIsPostMortemCapped: false,
      confidenceIsPostReview: false,
      lastChangeAt: null,
    }
    if (!abs) return summary
    // run folder mtime is the baseline "last touched"; the decision record's mtime (when present) is more precise
    try { summary.lastChangeAt = fs.statSync(abs).mtimeMs } catch { /* folder vanished mid-scan */ }
    const drPath = path.join(abs, 'decision_record.json')
    try {
      const dr = JSON.parse(fs.readFileSync(drPath, 'utf8'))
      // only an OBJECT record is a usable "this run decided" signal (mirrors summarizeRuns' guard)
      if (dr && typeof dr === 'object' && !Array.isArray(dr)) {
        // EFFECTIVE call, not the synthesizer's original: a run whose own red-team downgraded the verdict
        // must not still render as the uncapped call on the one surface a human checks in real time. This
        // is fixes F28/F28b — which research already applied via outputs.ts — finally reaching every other
        // swarm. GOLD is the case that exposed it: its pre_mortem.json says "Does not survive — downgrade"
        // (Trim, 40) while this picker showed the original Hold / 52. The resolver is swarm-generic (it
        // keys off the swarm's own routing field), so nothing here names a swarm or subject (§26).
        summary.verdict = resolveRecordVerdict(dr, verdictField)
        summary.decisionDate = typeof dr.decision_date === 'string' ? dr.decision_date : null
        const disp = resolveDisplayFields(dr, { verdictField: resolveVerdictKey(dr, verdictField) })
        if (disp.decision) summary.verdict = disp.decision
        summary.verdictIsPostMortemCapped = disp.decisionIsPostMortemCapped
        // commodity records store `confidence`; research-style records store `confidence_score` — the
        // resolver reads either, and prefers `post_review_confidence_score` over both when present
        summary.confidence = disp.confidence
        summary.confidenceIsPostReview = disp.confidenceIsPostReview
      }
      try { summary.lastChangeAt = fs.statSync(drPath).mtimeMs } catch { /* keep the folder mtime */ }
    } catch { /* no or malformed decision record — hasRun stays true, verdict null */ }
    return summary
  })
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

function hasFailFastModuleOutcome(folder: string, module: ModuleNode | undefined): boolean {
  if (!module) return false
  const triageFiles = Object.values(module.layers).flat()
    .filter((agent) => agent.nn === '00' && agent.failFast)
    .map((agent) => `${agent.key.split('/').at(-1)}.md`)
  return triageFiles.some((file) => {
    const candidate = path.join(folder, file)
    try {
      return validateAgentOutputFile(candidate).valid
        && extractTriageStatus(fs.readFileSync(candidate, 'utf8')) === 'Insufficient'
    } catch {
      return false
    }
  })
}

// Are a module's cross-module dependencies complete on disk? Checks ONLY module.dependsOn —
// a no-deps module is trivially complete; it does NOT require the module's own synthesis. For each
// dep, the EXACT folder the command would pick must contain its 99 synthesis or the module's declared,
// canonical fail-fast Insufficient triage outcome (mirrors the full-chain completion contract).
// Swarm-aware: research resolves each dep's latest dated folder; other swarms resolve the
// subject's single run folder.
export function depsCompleteForModule(subjectId: string, module: string, swarmId: string = RESEARCH_SWARM_ID): { complete: boolean; missing: string[] } {
  const g = buildSwarmGraph(swarmId)
  const deps = g.modules.find((x) => x.name === module)?.dependsOn ?? []
  const missing: string[] = []
  for (const dep of deps) {
    const folder = swarmId === RESEARCH_SWARM_ID
      ? latestModuleFolder(subjectId, dep)
      : (() => {
          const root = findRunRootForSubject(swarmId, subjectId)
          return root ? path.join(root, dep) : null
        })()
    const depModule = g.modules.find((entry) => entry.name === dep)
    const ok = !!folder && fs.existsSync(folder)
      && (fg.sync('99_*-synthesis.md', { cwd: folder }).length > 0
        || hasFailFastModuleOutcome(folder, depModule))
    if (!ok) missing.push(dep)
  }
  return { complete: missing.length === 0, missing }
}

// Recompute soloRunnable against a subject's run folder (deep agents need their upstream present).
export function graphForSubject(swarmId: string, subjectId: string): SwarmGraph {
  const base = buildSwarmGraph(swarmId)
  const runRoot = findRunRootForSubject(swarmId, subjectId)
  const clone: SwarmGraph = JSON.parse(JSON.stringify(base))
  for (const m of clone.modules) {
    // module-level: are this module's cross-module dependencies complete on disk? (matches admission D4)
    const deps = depsCompleteForModule(subjectId, m.name, swarmId)
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

// Back-compat alias: the research cockpit's per-ticker graph.
export function graphForTicker(ticker: string): SwarmGraph {
  return graphForSubject(RESEARCH_SWARM_ID, ticker)
}

// Flat lookup helpers for launch validation.
export function listModuleNames(swarmId: string = RESEARCH_SWARM_ID): string[] {
  return buildSwarmGraph(swarmId).modules.map((m) => m.name)
}

export function agentNamesForModule(moduleName: string, swarmId: string = RESEARCH_SWARM_ID): string[] {
  const m = buildSwarmGraph(swarmId).modules.find((x) => x.name === moduleName)
  if (!m) return []
  return Object.values(m.layers).flat().map((a) => a.name)
}

// subagent_type -> {key, module, layer, name} across EVERY swarm (agent names are globally unique
// per CLAUDE.md §26, so one flat index is safe). The stream parser uses this to attribute Task
// calls to orbs regardless of which swarm's run produced them.
export function agentNameIndexAllSwarms(): Map<string, { key: string; module: string; layer: number; name: string; swarmId: string }> {
  const idx = new Map<string, { key: string; module: string; layer: number; name: string; swarmId: string }>()
  for (const s of listSwarms()) {
    const g = buildSwarmGraph(s.id)
    for (const m of g.modules) {
      for (const a of Object.values(m.layers).flat()) {
        idx.set(a.name, { key: a.key, module: a.module, layer: a.layer, name: a.name, swarmId: s.id })
      }
    }
  }
  return idx
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

// Ordered re-run cascade for a target orb. Four target cases:
//  - specialist   -> [target, its module 99, ...downstream module 99s (topo), master]
//  - module 99    -> [that 99, ...downstream module 99s (topo), master]
//  - whole module -> [that module's 99, ...downstream module 99s (topo), master]  (agentName omitted;
//                    the module's specialists are re-run by the command — for cascade/admission the
//                    rewritten synthesis + downstream syntheses are what matter)
//  - master       -> [master] only (regenerates thesis/memo/dossier)
// Swarm runs have no master orb — their cascade ends at the last downstream synthesis.
export function downstreamCascade(moduleName: string, agentName?: string, swarmId: string = RESEARCH_SWARM_ID): CascadeNode[] {
  if (moduleName === 'master') return [MASTER_CASCADE]
  const graph = buildSwarmGraph(swarmId)
  const mod = graph.modules.find((m) => m.name === moduleName)
  if (!mod) return []

  const out: CascadeNode[] = []
  if (agentName) {
    const target = Object.values(mod.layers).flat().find((a) => a.name === agentName || a.slug === agentName)
    if (!target) return []
    out.push(cascadeEntry(target, target.isSynthesis ? 'module-synthesis' : 'agent'))
    if (!target.isSynthesis) {
      const synth = synthesisOf(mod)
      if (synth) out.push(cascadeEntry(synth, 'module-synthesis'))
    }
  } else {
    // whole-module rerun: the module's own synthesis heads the cascade.
    const synth = synthesisOf(mod)
    if (synth) out.push(cascadeEntry(synth, 'module-synthesis'))
  }
  const down = transitiveDownstreamModules(graph, moduleName)
  for (const m of graph.modules) {
    if (!down.has(m.name)) continue
    const synth = synthesisOf(m)
    if (synth) out.push(cascadeEntry(synth, 'module-synthesis'))
  }
  if (swarmId === RESEARCH_SWARM_ID) out.push(MASTER_CASCADE)
  return out
}
