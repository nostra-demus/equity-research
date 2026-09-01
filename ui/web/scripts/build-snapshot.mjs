// Build-time snapshot generator for the STATIC (Cloudflare Pages) deploy of the cockpit.
// Reads the repo's .claude/agents (swarm graph) and analyses/<runs> (results) read-only and writes
// public/data/snapshot.json + copies each ticker's latest-run markdown into public/data/analyses/.
// At runtime the app probes /api/health: if a local backend answers it stays fully live; otherwise it
// falls back to this snapshot (read-only showcase). Never modifies the engine.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { safePublishedMemoDeltaPath } from './calls-snapshot-artifacts.mjs'
import { normalizeStaticBoardArchive } from './ideas-archive-static.mjs'
import { buildTasksSnapshot } from './tasks-snapshot.mjs'
import { validateAgentOutputFile } from '../../../scripts/agent-output-validity.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const REPO = path.resolve(WEB, '..', '..')
const AGENTS = path.join(REPO, '.claude', 'agents')
const ANALYSES = path.join(REPO, 'analyses')
const DEST = path.join(WEB, 'public', 'data')

const isFile = (p) => { try { return fs.statSync(p).isFile() } catch { return false } }
const isDir = (p) => { try { return fs.statSync(p).isDirectory() } catch { return false } }
const prettify = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const trunc = (s, n = 240) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

// ---- minimal frontmatter parser (name/description/tools/layer/fail_fast/depends_on) ----
// Handles scalars, inline flow sequences (`depends_on: [a, b]`) AND YAML block sequences (a bare
// `depends_on:` followed by indented `- item` lines) — the latter so this matches gray-matter, which
// the live server uses (roster.ts). Without block-sequence support a module declaring its
// `depends_on` in block form (e.g. commodity-thesis) would lose its dependency edges here.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  const data = {}
  const lines = m[1].split(/\r?\n/)
  const unq = (s) => s.replace(/^['"]|['"]$/g, '')
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if (v === '') {
      // A bare key may open a YAML block sequence: subsequent indented `- item` lines.
      const seq = []
      let j = i + 1
      while (j < lines.length && /^\s+-\s+/.test(lines[j])) { seq.push(unq(lines[j].replace(/^\s+-\s+/, '').trim())); j++ }
      if (seq.length) { data[kv[1]] = seq; i = j - 1; continue }
    }
    if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean)
    else if (v === 'true') v = true
    else if (v === 'false') v = false
    else if (/^-?\d+$/.test(v)) v = Number(v)
    data[kv[1]] = v
  }
  return { data, body: m[2] }
}
const parseTools = (v) => (Array.isArray(v) ? v.map(String) : v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [])
const parseDeps = (v) => (Array.isArray(v) ? v.map(String) : v ? String(v).replace(/[[\]]/g, '').split(',').map((s) => s.trim()).filter(Boolean) : [])
function requiredUpstream(body) {
  const out = new Set()
  for (const ln of body.split(/\r?\n/)) {
    if (!/required/i.test(ln)) continue
    const re = /`analyses\/\{TICKER\}_\{DATE\}\/([^`]+)`/g
    let m
    while ((m = re.exec(ln))) out.add(m[1].trim())
  }
  return [...out]
}

// ---- verdict + triage extraction ----
function cleanInline(s) { return s.replace(/\*\*/g, '').replace(/`/g, '').replace(/^\s*[-*]\s+/, '').replace(/^\s*verdict\s*:?\s*/i, '').trim() }
function extractVerdict(md) {
  const lines = md.split(/\r?\n/)
  for (const ln of lines) {
    const m = ln.match(/^[\s>*-]*(?:\*\*)?\s*verdict\s*:\s*(?:\*\*)?\s*(.+?)\s*$/i)
    if (m && m[1]) { const v = cleanInline(m[1]); if (v && v.length > 1) return trunc(v) }
  }
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s+.*verdict/i.test(lines[i])) {
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const t = lines[j].trim()
        if (!t || /^-{3,}$/.test(t) || /^```/.test(t) || /^#{1,6}\s/.test(t) || /^\|/.test(t) || /^\(/.test(t)) continue
        const c = cleanInline(t)
        if (c && c.length > 1) return trunc(c)
      }
    }
  }
  return null
}
function triageStatus(md) {
  for (const ln of md.split(/\r?\n/)) {
    if (/verdict/i.test(ln)) {
      if (/insufficient/i.test(ln)) return 'Insufficient'
      if (/\bpartial\b/i.test(ln)) return 'Partial'
      if (/\bsufficient\b/i.test(ln)) return 'Sufficient'
    }
  }
  return 'Sufficient'
}
function canonicalTriageStatus(md) {
  const statuses = new Set()
  const carrier = /^[\s>*-]*(?:\*\*)?\s*verdict\s*:\s*(?:\*\*)?\s*(insufficient(?:\s+data)?|partial|sufficient)\s*(?:\*\*)?[.!]?\s*$/i
  for (const line of md.split(/\r?\n/)) {
    const match = line.match(carrier)
    if (!match) continue
    const status = match[1].toLowerCase()
    statuses.add(status.startsWith('insufficient') ? 'Insufficient' : status === 'partial' ? 'Partial' : 'Sufficient')
  }
  return statuses.size === 1 ? [...statuses][0] : null
}

// ---- swarm graph (mirrors the server roster) ----
function topoSort(mods) {
  const names = new Set(mods.map((m) => m.name))
  const placed = [], set = new Set()
  while (placed.length < mods.length) {
    const ready = mods.map((m) => m.name).filter((n) => !set.has(n) && mods.find((m) => m.name === n).dependsOn.filter((d) => names.has(d)).every((d) => set.has(d))).sort()
    if (!ready.length) { for (const n of mods.map((m) => m.name).filter((n) => !set.has(n)).sort()) { placed.push(n); set.add(n) } break }
    for (const n of ready) { placed.push(n); set.add(n) }
  }
  return placed
}
function buildSwarmGraph(rootDir = AGENTS, swarmMeta = null) {
  const moduleDirs = fs.readdirSync(rootDir).filter((d) => isDir(path.join(rootDir, d)) && fs.readdirSync(path.join(rootDir, d)).some((f) => /^99_.*-synthesis\.md$/.test(f)))
  const discovered = moduleDirs.map((name) => {
    const synth = fs.readdirSync(path.join(rootDir, name)).find((f) => /^99_.*-synthesis\.md$/.test(f))
    const { data } = parseFrontmatter(fs.readFileSync(path.join(rootDir, name, synth), 'utf8'))
    return { name, dependsOn: parseDeps(data.depends_on) }
  })
  const order = topoSort(discovered)
  const modules = order.map((name, i) => {
    const d = discovered.find((m) => m.name === name)
    const files = fs.readdirSync(path.join(rootDir, name)).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
    const layers = {}
    for (const f of files) {
      const raw = fs.readFileSync(path.join(rootDir, name, f), 'utf8')
      const { data, body } = parseFrontmatter(raw)
      const base = f.replace(/\.md$/, ''), nn = base.slice(0, 2), slug = base.slice(3)
      const layer = Number.isFinite(Number(data.layer)) ? Number(data.layer) : 999
      const req = requiredUpstream(body)
      const node = { key: `${name}/${base}`, module: name, nn, name: String(data.name || slug), slug, layer, failFast: data.fail_fast === true, description: String(data.description || '').trim(), tools: parseTools(data.tools), requiredUpstream: req, soloRunnable: req.length === 0, isSynthesis: nn === '99' }
      ;(layers[String(layer)] ||= []).push(node)
    }
    return { name, order: i, dependsOn: d.dependsOn, layers, agentCount: files.length }
  })
  let masterSynthesizer = { name: 'synthesizer', description: '' }
  if (!swarmMeta && isFile(path.join(rootDir, 'synthesizer.md'))) {
    const { data } = parseFrontmatter(fs.readFileSync(path.join(rootDir, 'synthesizer.md'), 'utf8'))
    masterSynthesizer = { name: String(data.name || 'synthesizer'), description: String(data.description || '') }
  } else if (swarmMeta) {
    masterSynthesizer = { name: '', description: '' }
  }
  const all = modules.flatMap((m) => Object.values(m.layers).flat())
  const synthesis = all.filter((a) => a.isSynthesis).length
  const graph = { modules, masterSynthesizer, totals: { modules: modules.length, agents: all.length, specialists: all.length - synthesis, synthesis } }
  if (swarmMeta) graph.swarm = swarmMeta
  return graph
}

// ---- generic swarm discovery (static showcase) ----
// Mirrors ui/server/src/swarms.ts (parseManifest / listSwarms) + roster.swarmSubjects so the Pages
// deploy exposes EVERY swarm the live engine does — its SwarmMeta (the switcher), its subject ids
// (the picker), and its built graph (the constellation). Zero-touch/self-describing per CLAUDE.md
// §26: no swarm id is hardcoded — 'commodity' and any future swarm are picked up by convention, the
// same way the server globs `*/SWARM.md`. 'research' stays the grandfathered flat-module default.
const RESEARCH_SWARM = { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' }
const unquote = (s) => String(s).replace(/^['"]|['"]$/g, '')
function discoverSwarmManifests() {
  const out = []
  for (const d of fs.readdirSync(AGENTS).filter((d) => isDir(path.join(AGENTS, d)))) {
    const manifestPath = path.join(AGENTS, d, 'SWARM.md')
    if (!isFile(manifestPath)) continue
    const rawManifest = fs.readFileSync(manifestPath, 'utf8')
    const { data } = parseFrontmatter(rawManifest)
    const id = unquote(data.id ?? d).trim()
    if (!id || id === RESEARCH_SWARM.id) continue // 'research' is reserved for the grandfathered default
    const runRootTemplate = unquote(data.run_root_template ?? '').trim()
    if (!runRootTemplate) continue // a swarm without a run-root template cannot host runs
    const str = (v, def) => (v != null && unquote(v).trim() ? unquote(v).trim() : def)
    const runsRootDefault = path.dirname(runRootTemplate.split('{')[0].replace(/\/+$/, ''))
    // routing.verdict_field is a NESTED key the flat parseFrontmatter can't reach — pull it straight from
    // the raw manifest so the static snapshot can resolve each subject's verdict the way the server does.
    const vfMatch = rawManifest.match(/^\s*verdict_field:\s*["']?([A-Za-z_][\w-]*)["']?/m)
    out.push({
      dir: path.join(AGENTS, d),
      meta: {
        id,
        label: str(data.label, id),
        color: str(data.color, '#1499ab'),
        unit: str(data.unit, 'signal'),
        order: Number.isFinite(Number(data.order)) ? Number(data.order) : 99,
        layout: str(data.layout, 'flow'),
      },
      runsRoot: str(data.runs_root, runsRootDefault),
      subjectsSource: str(data.subjects_source, ''),
      verdictField: vfMatch ? vfMatch[1] : '',
    })
  }
  return out.sort((a, b) => a.meta.order - b.meta.order || a.meta.id.localeCompare(b.meta.id))
}

// Subjects of a non-research swarm (mirrors roster.swarmSubjects): the union of existing run-folder
// names under the swarm's runsRoot and the `## <NAME>` headings in its declared subjects_source
// markdown (so a not-yet-run subject is still selectable). Sorted, unique.
function swarmSubjectsFor(sw) {
  const out = new Set()
  const runsAbs = path.join(REPO, sw.runsRoot)
  if (isDir(runsAbs)) for (const d of fs.readdirSync(runsAbs)) { if (isDir(path.join(runsAbs, d))) out.add(d) }
  if (sw.subjectsSource) {
    try {
      const txt = fs.readFileSync(path.join(REPO, sw.subjectsSource), 'utf8')
      for (const m of txt.matchAll(/^##\s+([A-Z0-9][A-Z0-9.\-]{0,14})\s*$/gm)) out.add(m[1])
    } catch { /* no subjects source on disk */ }
  }
  return [...out].sort()
}

// The verdict a decision record carries (mirrors server roster.resolveRecordVerdict / web format.resolveVerdict):
// research records use `decision`; a non-research swarm self-declares its routing verdict key (commodity:
// `Action` → record key `action`). Fail-closed without a verdict field.
function resolveRecordVerdict(dr, verdictField) {
  if (dr && typeof dr.decision === 'string' && dr.decision) return dr.decision
  if (!verdictField) return null
  const v = dr?.[verdictField] ?? dr?.[verdictField.toLowerCase()]
  return typeof v === 'string' && v ? v : null
}

// Which key a record's verdict lands under — mirrors server roster.resolveVerdictKey: prefer `decision`
// (research) when it's actually populated, else the swarm's own declared field (or its lowercase form)
// when THAT is populated, else null (no verdict written yet).
function resolveVerdictKey(dr, verdictField) {
  if (dr && typeof dr.decision === 'string' && dr.decision) return 'decision'
  if (!verdictField) return null
  if (typeof dr?.[verdictField] === 'string' && dr[verdictField]) return verdictField
  const lower = verdictField.toLowerCase()
  if (typeof dr?.[lower] === 'string' && dr[lower]) return lower
  return null
}

// The record key a swarm's verdict actually lands on — mirrors server ledger-corrections.verdictRecordKey.
function verdictRecordKey(rec, verdictField) {
  const f = (verdictField || '').trim()
  if (!f) return 'decision'
  if (Object.prototype.hasOwnProperty.call(rec, f)) return f
  const lower = f.toLowerCase()
  if (Object.prototype.hasOwnProperty.call(rec, lower)) return lower
  return lower
}

// Post-mortem-capped display fields — mirrors server ledger-corrections.resolveDisplayFields exactly, so
// the static snapshot can never publish an uncapped verdict/confidence the live server would show capped
// (e.g. GOLD's pre_mortem-downgraded Trim/39 rendering as the original, uncapped Hold/52).
function resolveDisplayFields(record, verdictField) {
  const rec = record ?? {}
  const key = verdictRecordKey(rec, verdictField)
  const original = rec[key]
  const pmDecision = rec[`post_mortem_${key}`]
  const decision = (typeof pmDecision === 'string' && pmDecision ? pmDecision : null) ?? (typeof original === 'string' && original ? original : null)
  const decisionIsPostMortemCapped = typeof pmDecision === 'string' && pmDecision !== '' && pmDecision !== original
  const postReview = typeof rec.post_review_confidence_score === 'number' ? rec.post_review_confidence_score : null
  const originalConfidence = typeof rec.confidence_score === 'number' ? rec.confidence_score
    : typeof rec.confidence === 'number' ? rec.confidence : null
  const confidence = postReview !== null ? postReview : originalConfidence
  return { decision, decisionIsPostMortemCapped, confidence, confidenceIsPostReview: postReview !== null }
}

// Per-subject run summaries for a non-research swarm (mirrors roster.swarmSubjectSummaries): for each
// subject, read its single run folder's decision_record.json (when present) and surface the routing
// verdict/confidence/date so the static picker shows runs the way the live one does.
function swarmSubjectSummariesFor(sw) {
  const summaries = []
  for (const subject of swarmSubjectsFor(sw)) {
    const runAbs = path.join(REPO, sw.runsRoot, subject)
    const hasRun = isDir(runAbs)
    // Normalise backslashes before the posix join: on Windows sw.runsRoot (derived via path.dirname) can
    // carry `\`, and path.posix.join would then emit a mixed-separator path (commodity\runs/GOLD) the web
    // client can't resolve. Forward slashes only for the served runRoot.
    const summary = { subject, hasRun, runRoot: hasRun ? path.posix.join(sw.runsRoot.replace(/\\/g, '/'), subject) : null, verdict: null, decisionDate: null, confidence: null, verdictIsPostMortemCapped: false, confidenceIsPostReview: false, lastChangeAt: null }
    if (hasRun) {
      try { summary.lastChangeAt = fs.statSync(runAbs).mtimeMs } catch { /* folder vanished */ }
      const drPath = path.join(runAbs, 'decision_record.json')
      try {
        const dr = JSON.parse(fs.readFileSync(drPath, 'utf8'))
        if (dr && typeof dr === 'object' && !Array.isArray(dr)) {
          summary.verdict = resolveRecordVerdict(dr, sw.verdictField)
          summary.decisionDate = typeof dr.decision_date === 'string' ? dr.decision_date : null
          const disp = resolveDisplayFields(dr, resolveVerdictKey(dr, sw.verdictField))
          if (disp.decision) summary.verdict = disp.decision
          summary.verdictIsPostMortemCapped = disp.decisionIsPostMortemCapped
          summary.confidence = disp.confidence
          summary.confidenceIsPostReview = disp.confidenceIsPostReview
        }
        try { summary.lastChangeAt = fs.statSync(drPath).mtimeMs } catch { /* keep the folder mtime */ }
      } catch { /* no or malformed decision record — hasRun stays true, verdict null */ }
    }
    summaries.push(summary)
  }
  return summaries
}

// The full swarm surface for the snapshot: research (grandfathered default) first, then every
// discovered non-research swarm's SwarmMeta + subject ids + built graph. What the static api.ts reads
// as snap.swarms / snap.swarmSubjects / snap.swarmSubjectSummaries / snap.swarmGraphs.
function buildSwarms() {
  const swarms = [RESEARCH_SWARM]
  const swarmGraphs = {}
  const swarmSubjects = {}
  const swarmSubjectSummaries = {}
  for (const sw of discoverSwarmManifests()) {
    swarms.push(sw.meta)
    swarmGraphs[sw.meta.id] = buildSwarmGraph(sw.dir, sw.meta)
    swarmSubjects[sw.meta.id] = swarmSubjectsFor(sw)
    swarmSubjectSummaries[sw.meta.id] = swarmSubjectSummariesFor(sw)
  }
  return { swarms, swarmGraphs, swarmSubjects, swarmSubjectSummaries }
}

// ---- screener swarm (static showcase): board index + fixture run markdown ----
// The screener's SwarmMeta + graph now come from buildSwarms() (generic). This adds only the
// screener-SPECIFIC surface the Pipeline board demo needs (board index, per-signal run markdown,
// ledger theses/candidates), mirroring the live /api/screener/* readers. Best-effort: a repo
// without the screener simply omits these keys.
function buildScreenerStatic() {
  const manifestPath = path.join(AGENTS, 'screener', 'SWARM.md')
  if (!isFile(manifestPath)) return null
  const SCREENER = path.join(REPO, 'screener')
  let board = null
  const boardPath = path.join(SCREENER, 'board', 'index.json')
  if (isFile(boardPath)) board = normalizeStaticBoardArchive(loadJSON(boardPath))
  // bundle ledger records + run markdown for every thesis on the board
  const theses = {}, candidates = {}, runs = {}
  const thesesDir = path.join(SCREENER, 'ledger', 'theses')
  if (isDir(thesesDir)) for (const f of fs.readdirSync(thesesDir).filter((f) => f.endsWith('.json'))) {
    const rec = loadJSON(path.join(thesesDir, f)); if (!rec) continue
    const id = f.replace(/\.json$/, '')
    theses[id] = { thesis: rec, candidates: null, handoffs: [] }
  }
  const candDir = path.join(SCREENER, 'ledger', 'candidates')
  if (isDir(candDir)) for (const f of fs.readdirSync(candDir).filter((f) => f.endsWith('.json'))) {
    const rec = loadJSON(path.join(candDir, f)); if (!rec) continue
    const id = f.replace(/\.json$/, '')
    candidates[id] = rec
    if (theses[id]) theses[id].candidates = rec
  }
  const runsDir = path.join(SCREENER, 'runs')
  if (isDir(runsDir)) for (const sig of fs.readdirSync(runsDir).filter((d) => isDir(path.join(runsDir, d)))) {
    const runAbs = path.join(runsDir, sig)
    const modules = {}
    for (const mod of fs.readdirSync(runAbs).filter((d) => isDir(path.join(runAbs, d)))) {
      const files = fs.readdirSync(path.join(runAbs, mod)).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
      modules[mod] = files.map((f) => ({ agentKey: `${mod}/${f.replace(/\.md$/, '')}`, name: f.replace(/\.md$/, '').slice(3), verdict: null, routing: null }))
      for (const f of files) copyInto(path.join(runAbs, mod, f), `screener/runs/${sig}/${mod}/${f}`)
    }
    runs[sig] = { runRoot: `screener/runs/${sig}`, modules,
      intake: loadJSON(path.join(runAbs, 'intake.json')), signalPayload: loadJSON(path.join(runAbs, 'signal_payload.json')),
      thesisRecord: loadJSON(path.join(runAbs, 'thesis_record.json')), candidates: loadJSON(path.join(runAbs, 'candidates.json')) }
  }
  return { screenerBoard: board, screenerRuns: runs, screenerTheses: theses, screenerCandidates: candidates }
}

// ---- per-ticker run data ----
function latestRunFor(ticker) {
  const dirs = fs.readdirSync(ANALYSES).filter((d) => d.startsWith(ticker + '_') && isDir(path.join(ANALYSES, d))).sort().reverse()
  return dirs[0] || null
}

function buildTicker(ticker, runFolder) {
  const runDir = path.join(ANALYSES, runFolder)
  const runRoot = `analyses/${runFolder}`
  let decision = {}
  try { decision = JSON.parse(fs.readFileSync(path.join(runDir, 'decision_record.json'), 'utf8')) } catch {}

  const manifestModules = {}
  const terminalOutcomes = {}
  // per-module three tiers (synthesis / memo / dossier) — generic, no module name hardcoded (CLAUDE.md §26)
  const manifestModuleReports = {}
  const dataModules = {}
  for (const mod of fs.readdirSync(runDir).filter((d) => isDir(path.join(runDir, d)))) {
    const allFiles = fs.readdirSync(path.join(runDir, mod))
    const mdFiles = allFiles.filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
    const agents = []
    for (const f of mdFiles) {
      const content = fs.readFileSync(path.join(runDir, mod, f), 'utf8')
      const base = f.replace(/\.md$/, '')
      agents.push({ agentKey: `${mod}/${base}`, name: prettify(base.slice(3)), verdict: extractVerdict(content) })
      // copy md into public/data/analyses/<run>/<mod>/<f>
      copyInto(path.join(runDir, mod, f), `analyses/${runFolder}/${mod}/${f}`)
      if (base.startsWith('00_')) dataModules[mod] = { status: triageStatus(content), reasons: ['from committed run triage'], caps: [] }
    }
    manifestModules[mod] = agents
    const rosterModule = swarmGraph.modules.find((entry) => entry.name === mod)
    const rosterAgents = rosterModule ? Object.values(rosterModule.layers).flat() : []
    const validSynthesis = rosterAgents.filter((agent) => agent.isSynthesis)
      .find((agent) => validateAgentOutputFile(path.join(runDir, mod, `${agent.key.split('/').at(-1)}.md`)).valid)
    const validFailFast = validSynthesis ? null : rosterAgents.filter((agent) => agent.nn === '00' && agent.failFast && !agent.isSynthesis)
      .find((agent) => {
        const file = path.join(runDir, mod, `${agent.key.split('/').at(-1)}.md`)
        if (!validateAgentOutputFile(file).valid) return false
        try { return canonicalTriageStatus(fs.readFileSync(file, 'utf8')) === 'Insufficient' } catch { return false }
      })
    const terminal = validSynthesis ?? validFailFast
    if (terminal) terminalOutcomes[mod] = { kind: validSynthesis ? 'synthesis' : 'fail-fast', agentKey: terminal.key }
    // the module's three tiers: 99 synthesis (already copied above) + memo + dossier (copy them too)
    const synthesis = allFiles.find((f) => /^99_.*-synthesis\.md$/.test(f))
    const memo = allFiles.find((f) => /_memo\.md$/.test(f))
    const dossier = allFiles.find((f) => /_dossier\.md$/.test(f))
    const rep = {}
    if (synthesis) rep.synthesis = `analyses/${runFolder}/${mod}/${synthesis}`
    if (memo) { rep.memo = `analyses/${runFolder}/${mod}/${memo}`; copyInto(path.join(runDir, mod, memo), rep.memo) }
    if (dossier) { rep.dossier = `analyses/${runFolder}/${mod}/${dossier}`; copyInto(path.join(runDir, mod, dossier), rep.dossier) }
    if (synthesis || memo || dossier) manifestModuleReports[mod] = rep
    if (!dataModules[mod]) dataModules[mod] = { status: 'Sufficient', reasons: ['module completed in this run'], caps: [] }
  }

  // copy top-level reports — the three shareable tiers (memo/thesis/dossier) plus run metadata
  for (const f of ['memo.md', 'final_thesis.md', 'audit_dossier.md', 'final_thesis_expanded.md', 'RUN_METADATA.md']) {
    if (isFile(path.join(runDir, f))) copyInto(path.join(runDir, f), `analyses/${runFolder}/${f}`)
  }

  const has = (f) => isFile(path.join(runDir, f))
  const manifest = {
    runRoot,
    modules: manifestModules,
    terminalOutcomes,
    moduleReports: manifestModuleReports,
    memo: has('memo.md'),
    finalThesis: has('final_thesis.md'),
    fullDossier: has('audit_dossier.md'),
    decisionRecord: has('decision_record.json'),
    verification: has('verification_report.json') || has('verification_report_v3.json'),
    preMortem: has('pre_mortem.json'),
    expectationsGap: has('expectations_gap.json'),
  }
  const dataStatus = {
    ticker,
    hasAnyData: true,
    fileCount: Object.values(manifestModules).reduce((n, a) => n + a.length, 0),
    files: [],
    recentByType: {},
    modules: dataModules,
    overallReady: Object.values(dataModules).some((m) => m.status === 'Sufficient'),
    dataDir: 'bundled snapshot (static deploy)',
  }
  const summary = {
    ticker,
    fileCount: dataStatus.fileCount,
    hasAnyData: true,
    latestRun: { runRoot, decision: decision.decision ?? null, decisionDate: decision.decision_date ?? null, confidence: typeof decision.confidence_score === 'number' ? decision.confidence_score : null },
  }
  return { summary, dataStatus, manifest, decision, finalThesisPath: manifest.finalThesis ? `${runRoot}/final_thesis.md` : null }
}

function copyInto(src, rel) {
  const d = path.join(DEST, rel)
  fs.mkdirSync(path.dirname(d), { recursive: true })
  fs.copyFileSync(src, d)
}

function walkMd(dir, out = []) {
  if (!isDir(dir)) return out
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e)
    if (isDir(full)) walkMd(full, out)
    else if (e.endsWith('.md')) out.push(full)
  }
  return out
}

// Bundle the read-only PROMPT surface (agent definitions, MODULE_RULES, frameworks docs, the root
// CLAUDE.md) so the static showcase can view + download the exact instructions each orb/module runs on,
// exactly like the live engine's /api/prompt. The leading-dot .claude/ folder is flattened to claude/
// (static hosts skip dot-folders) — this transform MUST match staticPromptPath() in src/lib/prompts.ts.
function copyPrompts() {
  const files = [...walkMd(AGENTS), ...walkMd(path.join(REPO, 'frameworks'))]
  const constitution = path.join(REPO, 'CLAUDE.md')
  if (isFile(constitution)) files.push(constitution)
  let n = 0
  for (const abs of files) {
    const repoRel = path.relative(REPO, abs).split(path.sep).join('/')
    copyInto(abs, 'prompts/' + repoRel.replace(/^\.claude\//, 'claude/'))
    n++
  }
  return n
}

// ---- calls tracker (static): same shape + due/overdue rule as /api/calls, /research:track,
// review_due.py (local date, lexical ISO compare, *_<window>_decision_review*.json glob). Walks ALL
// run folders (not just the latest per ticker) and copies every file the tracker can open.
function isISODateJ(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) }
function isValidCalendarISODateJ(s) {
  if (!isISODateJ(s)) return false
  const y = Number(s.slice(0, 4)), mo = Number(s.slice(5, 7)), da = Number(s.slice(8, 10))
  if (mo < 1 || mo > 12) return false
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
  return da >= 1 && da <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1]
}
function loadJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
function todayISOJ() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function finiteNumberJ(v) { return typeof v === 'number' && Number.isFinite(v) ? v : null }
function reviewsForRun(runDirAbs, runRoot) {
  const rdir = path.join(runDirAbs, 'reviews')
  if (!isDir(rdir)) return []
  const out = []
  for (const n of fs.readdirSync(rdir).filter((f) => /_decision_review.*\.json$/.test(f)).sort()) {
    const j = loadJSON(path.join(rdir, n)); if (!j) continue
    const fr = Array.isArray(j.forecast_results) ? j.forecast_results : []
    const conf = fr.filter((r) => String((r && r.status) || '').toLowerCase() === 'confirmed').length
    const fals = fr.filter((r) => String((r && r.status) || '').toLowerCase() === 'falsified').length
    const md = j.memo_delta && typeof j.memo_delta === 'object' ? j.memo_delta : null
    const actionLabels = new Set(['Hold', 'Add', 'Exit', 'Stay away', 'Keep watching'])
    const actionReason = typeof j.action_now?.reason === 'string' ? j.action_now.reason.trim() : ''
    const action = j.action_now && typeof j.action_now === 'object' && actionLabels.has(j.action_now.label) && actionReason
      ? { label: j.action_now.label, reason: actionReason, recorded: true }
      : null
    const boundedConfidence = (value) => { const n = finiteNumberJ(value); return n != null && n >= 0 && n <= 100 ? n : null }
    const confidence = j.confidence_update && typeof j.confidence_update === 'object' ? {
      before: boundedConfidence(j.confidence_update.before), after: boundedConfidence(j.confidence_update.after),
      change_reason: typeof j.confidence_update.change_reason === 'string' && j.confidence_update.change_reason.trim() ? j.confidence_update.change_reason.trim() : null,
    } : null
    const next = j.next_check && typeof j.next_check === 'object' ? {
      date: isValidCalendarISODateJ(j.next_check.date) ? j.next_check.date : null,
      label: typeof j.next_check.label === 'string' && j.next_check.label.trim() ? j.next_check.label.trim() : null,
      trigger: typeof j.next_check.trigger === 'string' && j.next_check.trigger.trim() ? j.next_check.trigger.trim() : null,
    } : null
    const learning = j.learning && typeof j.learning === 'object' ? Object.fromEntries(
      ['why_right_or_wrong', 'error_source', 'rule_for_future', 'future_research_check'].map((key) => [key, typeof j.learning[key] === 'string' && j.learning[key].trim() ? j.learning[key].trim() : null]),
    ) : null
    out.push({ file: `${runRoot}/reviews/${n}`, basename: n, review_window: j.review_window || '', review_date: j.review_date || '',
      review_price: finiteNumberJ(j.review_price), absolute_return_pct: finiteNumberJ(j.absolute_return_pct),
      benchmark_relative_return_pct: finiteNumberJ(j.benchmark_relative_return_pct),
      thesis_status: typeof j.thesis_status === 'string' && j.thesis_status ? j.thesis_status : null,
      decision_quality: typeof j.decision_quality === 'string' && j.decision_quality ? j.decision_quality : null,
      forecasts_confirmed: conf, forecasts_falsified: fals,
      memo_delta_file: safePublishedMemoDeltaPath(md?.memo_delta_file, REPO, runDirAbs, runRoot),
      stage_one_comment: typeof md?.stage_one_comment === 'string' && md.stage_one_comment ? md.stage_one_comment : null,
      memo_delta_summary: typeof md?.summary === 'string' && md.summary.trim() ? md.summary.trim() : null,
      thesis_delta_verdict: typeof md?.thesis_delta_verdict === 'string' && md.thesis_delta_verdict.trim()
        ? md.thesis_delta_verdict.trim().toLowerCase() : null,
      action_now: action, confidence_update: confidence, next_check: next, learning,
      lessons: Array.isArray(j.lessons) ? j.lessons.filter((x) => typeof x === 'string' && x.trim()).slice(0, 30) : [],
      error_taxonomy: Array.isArray(j.error_taxonomy) ? j.error_taxonomy.filter((x) => typeof x === 'string' && x.trim()).slice(0, 30) : [],
      watch_items: Array.isArray(md?.watch_items) ? md.watch_items.filter((x) => typeof x === 'string' && x.trim()).slice(0, 30) : [] })
  }
  return out
}
function winnerJ(files) { return files.length ? [...files].sort((a, b) => {
  if (a.review_date !== b.review_date) return a.review_date < b.review_date ? 1 : -1
  const version = (row) => { const m = /_v(\d+)\.json$/i.exec(String(row?.basename || '')); return m ? Number(m[1]) : 1 }
  const av = version(a), bv = version(b)
  return av !== bv ? bv - av : String(b.basename || '').localeCompare(String(a.basename || ''))
})[0] : null }
function buildTimelineJ(schedule, reviews, today) {
  const out = [], keys = Object.keys(schedule || {})
  for (const w of keys) {
    const dt = schedule[w]; if (!isISODateJ(dt)) continue
    const matches = reviews.filter((r) => r.basename.includes(`_${w}_decision_review`))
    const win = winnerJ(matches)
    if (win) out.push({ window: w, due_date: dt, status: 'done', review_date: win.review_date, review_price: win.review_price, absolute_return_pct: win.absolute_return_pct,
      benchmark_relative_return_pct: win.benchmark_relative_return_pct, thesis_status: win.thesis_status, decision_quality: win.decision_quality,
      forecasts_confirmed: win.forecasts_confirmed, forecasts_falsified: win.forecasts_falsified, review_file: win.file, review_count: matches.length,
      memo_delta_file: win.memo_delta_file, stage_one_comment: win.stage_one_comment,
      memo_delta_summary: win.memo_delta_summary, thesis_delta_verdict: win.thesis_delta_verdict,
      action_now: win.action_now, confidence_update: win.confidence_update, next_check: win.next_check, learning: win.learning,
      lessons: win.lessons, error_taxonomy: win.error_taxonomy, watch_items: win.watch_items })
    else out.push({ window: w, due_date: dt, status: dt < today ? 'overdue' : dt === today ? 'due' : 'upcoming' })
  }
  for (const r of reviews) {
    if (keys.some((w) => r.basename.includes(`_${w}_decision_review`))) continue
    out.push({ window: r.review_window || 'ad-hoc', due_date: r.review_date || null, status: 'done', review_date: r.review_date, review_price: r.review_price, absolute_return_pct: r.absolute_return_pct,
      benchmark_relative_return_pct: r.benchmark_relative_return_pct, thesis_status: r.thesis_status, decision_quality: r.decision_quality,
      forecasts_confirmed: r.forecasts_confirmed, forecasts_falsified: r.forecasts_falsified, review_file: r.file,
      memo_delta_file: r.memo_delta_file, stage_one_comment: r.stage_one_comment,
      memo_delta_summary: r.memo_delta_summary, thesis_delta_verdict: r.thesis_delta_verdict,
      action_now: r.action_now, confidence_update: r.confidence_update, next_check: r.next_check, learning: r.learning,
      lessons: r.lessons, error_taxonomy: r.error_taxonomy, watch_items: r.watch_items })
  }
  out.sort((a, b) => { const da = a.due_date || '9999-99-99', db = b.due_date || '9999-99-99'; return da < db ? -1 : da > db ? 1 : 0 })
  return out
}

const PROVISIONAL_MARK_J = 'PROVISIONAL — the automated finish-gate'
const CLEAN_INTEGRITY_VERDICTS_J = new Set(['Clean', 'Minor issues'])
function integrityStatusJ(runDirAbs) {
  let banner = false
  try { banner = fs.readFileSync(path.join(runDirAbs, 'final_thesis.md'), 'utf8').slice(0, 2000).includes(PROVISIONAL_MARK_J) } catch { /* honest unaudited fallback below */ }
  const reports = isDir(runDirAbs) ? fs.readdirSync(runDirAbs)
    .map((name) => ({ name, match: /^verification_report(?:_v(\d+))?\.json$/.exec(name) }))
    .filter((row) => row.match)
    .sort((a, b) => Number(a.match[1] || 1) - Number(b.match[1] || 1)) : []
  let verdict = null
  if (reports.length) {
    const report = loadJSON(path.join(runDirAbs, reports[reports.length - 1].name))
    verdict = typeof report?.verdict === 'string' && report.verdict.trim() ? report.verdict.trim() : null
  }
  const status = banner ? 'provisional' : reports.length ? (verdict && CLEAN_INTEGRITY_VERDICTS_J.has(verdict) ? 'verified' : 'provisional') : 'unaudited'
  return { status, verdict, banner }
}
/**
 * The watchlist, for the read-only showcase.
 *
 * Deliberately WITHOUT prices and without any trigger state. getQuotes needs a live server, so a
 * snapshot-baked "condition met" would be a build-time assertion rendered as a current one — exactly the
 * defect the whole lane avoids. Each trigger still shows its own threshold and its frozen reference (both
 * are facts the entry itself carries); the state reads "not evaluated" and the row shows no price.
 *
 * The merge is re-implemented here in plain JS because this script cannot import the TS module. It is
 * kept deliberately thin — membership and the archive fold only — so the two paths cannot disagree about
 * anything a reader would act on.
 */
/** sizing.json's next_review is PROSE ("2026-10-08 (90d checkpoint; …)"). The server pulls the date out
 *  of it; the snapshot must do the same or the showcase renders a paragraph in a date column. */
function reviewDateFromText(text) {
  const m = String(text || '').match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : null
}

/**
 * What a stored trigger says, with no live price to test it against. `WatchRowCard` reads its chips
 * ONLY from `row.evals` — an empty array reads as "+ trigger" (nothing being watched), even when
 * `row.triggers` is populated. Emitting `evals: []` unconditionally (as this builder used to) therefore
 * hid every saved threshold from the read-only showcase. Every kind here reports 'not_evaluable' — never
 * 'condition_met' or 'not_met' — because this build has no live price at all (`quotes_enabled: false`
 * below); an event_date trigger is the one exception, since due-ness is a date compare, not a price one.
 */
function daysBetween(from, to) {
  const a = Date.parse(`${String(from).slice(0, 10)}T00:00:00Z`)
  const b = Date.parse(`${String(to).slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86_400_000)
}

/** The nearest measurable distance on a static row — dated triggers only, since prices are off here. */
function staticNearest(evals) {
  const dated = evals.filter((e) => e.days_to != null)
  if (!dated.length) return null
  const soonest = dated.reduce((a, b) => (b.days_to < a.days_to ? b : a))
  return { unit: 'days', value: soonest.days_to }
}

function staticTriggerEval(t, today) {
  const base = { trigger_id: t.trigger_id, kind: t.kind, mode: t.kind === 'event_date' ? 'reminder' : 'auto' }
  const money = (ccy, v) => `${ccy || ''} ${Number(v).toFixed(2)}`.trim()
  if (t.kind === 'event_date') {
    const due = t.acknowledged_at ? false : t.due_date <= today
    return {
      // A date needs no price, so the snapshot CAN measure this one — days, never a percent. Without it
      // every tile in the read-only grid would read '—' even where the answer is knowable.
      ...base, state: 'not_met', gap_pct: null, days_to: daysBetween(today, t.due_date), reason: null, due,
      detail: t.acknowledged_at ? `${t.label} — acknowledged ${String(t.acknowledged_at).slice(0, 10)}`
        : due ? `${t.label} — due ${t.due_date}` : `${t.label} — ${t.due_date}`,
    }
  }
  if (t.kind === 'price_level') {
    return {
      ...base, state: 'not_evaluable', gap_pct: null, days_to: null, reason: null,
      detail: `${t.direction === 'at_or_below' ? 'at or below' : 'at or above'} ${money(t.currency, t.level)} — not evaluated in this read-only snapshot`,
    }
  }
  if (t.kind === 'pct_drop') {
    return {
      ...base, state: 'not_evaluable', gap_pct: null, days_to: null, reason: null,
      detail: `${t.drop_pct}% below ${money(t.reference?.currency, t.reference?.value)}${t.reference?.as_of ? ` (${t.reference.as_of})` : ''} — not evaluated in this read-only snapshot`,
    }
  }
  return {
    ...base, state: 'not_evaluable', gap_pct: null, days_to: null, reason: null,
    detail: `${t.required_mos_pct}% margin of safety against ${money(t.anchor_currency, t.anchor_value)} — not evaluated in this read-only snapshot`,
  }
}

function buildWatchlist(calls) {
  const today = todayISOJ()
  // `added_by` is dropped from the public snapshot — it carries the uploader's real (Cloudflare-
  // authenticated) email, which a Pages deployment has no business publishing. The rest of the metadata
  // (filename, id, size, date) stays: WatchRow's static mode hides the download LINK it would otherwise
  // build from `attachment_id` (there is no backend in a static deploy to serve the file from), but the
  // fact that a row has an attachment, and what it's called, is not private the way the operator's email is.
  const publicAttachments = (atts) => (Array.isArray(atts) ? atts.map((a) => ({ attachment_id: a.attachment_id, filename: a.filename, bytes: a.bytes, added_at: a.added_at })) : [])
  const dir = path.join(REPO, 'watchlist', 'entries')
  const entries = []
  try {
    for (const n of fs.readdirSync(dir)) {
      if (!n.endsWith('.json')) continue
      const j = loadJSON(path.join(dir, n))
      if (j && j.entry_id && j.listing && j.listing.listing_key) entries.push(j)
    }
  } catch { /* no folder yet — an empty watchlist is a valid state, not an error */ }

  // engine half: the same basket rule the server applies, decorated by the newest whole-book sizing file
  const deco = new Map()
  let engineSource = { file: null, generated_at: null }
  try {
    const pdir = path.join(REPO, 'analyses', 'portfolio')
    // Sorted by the in-file generated_at, NOT the filename: size.md mandates a _v2 suffix when today's
    // file already exists, and filename order stops being right at _v10 (it sorts under _v9).
    const files = fs.readdirSync(pdir).filter((n) => /_sizing(_v\d+)?\.json$/.test(n))
      .map((n) => ({ n, j: loadJSON(path.join(pdir, n)) }))
      .filter((f) => f.j && Array.isArray(f.j.watch) && (!f.j.scope || f.j.scope === 'all'))
      .sort((a, b) => String(b.j.generated_at || b.n.slice(0, 10)).localeCompare(String(a.j.generated_at || a.n.slice(0, 10))) || b.n.localeCompare(a.n))
    for (const { n, j } of files) {
      for (const w of j.watch) if (w && w.ticker) if (!deco.has(String(w.ticker).toUpperCase())) deco.set(String(w.ticker).toUpperCase(), w)
      engineSource = { file: n, generated_at: String(j.generated_at || n.slice(0, 10)) }
      break
    }
  } catch { /* no portfolio folder */ }

  // Mirrors watchlist.ts's POSITION_BASKETS: Pair Trade carries a paper PAIR position (DECISION_LEDGER.md
  // §3), so it is held, not watched — the same as Selected/Short.
  const POSITION = new Set(['Selected', 'Short', 'Pair Trade'])
  const seen = new Set()
  const rows = []
  const archived = []
  const byKey = new Map(entries.map((e) => [e.listing.listing_key, e]))

  for (const c of calls) {
    const t = String(c.ticker || '').toUpperCase()
    if (!t || seen.has(t)) continue
    const inDeco = deco.has(t)
    if (!inDeco && POSITION.has(String(c.basket || ''))) continue
    seen.add(t)
    const key = `${t}|${String(c.currency || '').toUpperCase()}`
    const e = byKey.get(key) || null
    if (e) byKey.delete(key)
    const w = deco.get(t) || {}
    // sha256-12 over run_root|decision|size_in_trigger|next_review — byte-identical to watchlist.ts's
    // fingerprintEngineRow, so an archive muted against the LIVE fingerprint compares correctly here too.
    const fingerprint = `sha256:${crypto.createHash('sha256').update(
      [c.run_root, c.decision ?? '', w.size_in_trigger ?? '', w.next_review ?? '']
        .map((x) => String(x).replace(/\s+/g, ' ').trim()).join('|'),
    ).digest('hex').slice(0, 12)}`
    // Mirrors mergeWatchlist's re-surface test: an archive mutes ONE assertion (its fingerprint at the
    // time), so if the engine now says something else, the mute no longer applies to what is on screen —
    // including a manual row archived BEFORE the engine covered it (muted_fingerprint: null !== fingerprint
    // is itself the change). The static builder used to never compute this at all, so an archived row
    // stayed hidden in the read-only showcase even after the engine changed its call underneath it.
    const resurfaced = !!(e && e.archive && e.archive.mute_scope === 'assertion' && e.archive.muted_fingerprint !== fingerprint)
    const staticEvals = (e?.triggers || []).map((tr) => staticTriggerEval(tr, today))
    const row = {
      listing_key: key, ticker: t, company_name: c.company ?? null, currency: c.currency ?? null, exchange: null,
      origin: e ? 'both' : 'engine', entry_id: e ? e.entry_id : null, why: e ? e.why : '',
      conviction: e ? e.conviction : null,
      review_date: (e && e.review_date) || reviewDateFromText(w.next_review) || w.next_review || null,
      tags: e ? e.tags : [], triggers: e ? e.triggers : [], attachments: publicAttachments(e?.attachments),
      assignee: e?.assignee ?? null, task_id: e?.task_id ?? null,
      engine: { run_root: c.run_root, decision: c.decision ?? null, decision_date: c.decision_date ?? null,
        size_in_trigger: w.size_in_trigger ?? null, next_review: w.next_review ?? null,
        entry_price: c.entry_price ?? null, final_thesis_path: c.final_thesis_path ?? null, fingerprint,
        next_review_text: w.next_review ?? null },
      resurfaced, archive: e ? e.archive : null,
      quote: null, quote_reason: null,
      evals: staticEvals,
      // Prices are off in a snapshot, but a DATE is still a fact — so a due reminder reads as due here
      // exactly as it does live, and its tile carries a real day count instead of a dash.
      state: staticEvals.some((x) => x.due) ? 'due' : staticEvals.length ? 'not_evaluable' : 'watching',
      nearest_gap_pct: null, nearest: staticNearest(staticEvals),
      run_root: c.run_root, final_thesis_path: c.final_thesis_path ?? null,
      added_at: e ? e.created_at : null, updated_at: e ? e.updated_at : null, engine_since: c.decision_date ?? null,
    }
    ;((row.archive && !row.resurfaced) ? archived : rows).push(row)
  }
  for (const e of byKey.values()) {
    const manualEvals = (e.triggers || []).map((t) => staticTriggerEval(t, today))
    const row = {
      listing_key: e.listing.listing_key, ticker: e.listing.ticker, company_name: e.listing.company_name,
      currency: e.listing.currency, exchange: e.listing.exchange, origin: 'manual', entry_id: e.entry_id,
      why: e.why, conviction: e.conviction, review_date: e.review_date, tags: e.tags, triggers: e.triggers,
      attachments: publicAttachments(e.attachments), engine: null, resurfaced: false, archive: e.archive,
      assignee: e.assignee ?? null, task_id: e.task_id ?? null,
      quote: null, quote_reason: null,
      evals: manualEvals,
      state: manualEvals.some((x) => x.due) ? 'due' : manualEvals.length ? 'not_evaluable' : 'watching',
      nearest_gap_pct: null, nearest: staticNearest(manualEvals),
      run_root: null, final_thesis_path: null,
      added_at: e.created_at ?? null, updated_at: e.updated_at ?? null, engine_since: null,
    }
    ;(row.archive ? archived : rows).push(row)
  }
  // quotes_enabled false is the honest signal: this build has no live prices to offer at all
  return { rows, archived, engine_source: engineSource, unreadable: [], quotes_enabled: false, as_of: '' }
}

function buildCalls() {
  const today = todayISOJ()
  const calls = []
  for (const name of fs.readdirSync(ANALYSES)) {
    if (!/_\d{4}-\d{2}-\d{2}$/.test(name)) continue
    const runDirAbs = path.join(ANALYSES, name), runRoot = `analyses/${name}`
    const d = loadJSON(path.join(runDirAbs, 'decision_record.json')); if (!d) continue
    if (!(d.ticker && d.decision && d.decision_date)) continue
    const corrections = loadJSON(path.join(runDirAbs, 'corrections.json'))
    if (corrections?.schema === 'corrections/v1' && typeof corrections?.superseded_by?.run_root === 'string' && corrections.superseded_by.run_root) continue
    const reviews = reviewsForRun(runDirAbs, runRoot)
    const timeline = buildTimelineJ(d.review_schedule || {}, reviews, today)
    const latest = winnerJ(reviews)
    const entry = typeof d.entry_price === 'number' ? d.entry_price : null
    const exp = typeof d.expected_return_pct === 'number' ? d.expected_return_pct : null
    const fc = { open: 0, confirmed: 0, falsified: 0, expired: 0, other: 0 }
    for (const f of (Array.isArray(d.forecast_ledger) ? d.forecast_ledger : [])) { const s = String((f && f.status) || 'open').toLowerCase(); if (s in fc) fc[s]++; else fc.other++ }
    const pending = timeline.find((t) => t.status === 'overdue') || timeline.find((t) => t.status === 'due') || timeline.find((t) => t.status === 'upcoming') || null
    const finalThesisPath = (typeof d.final_thesis_path === 'string' && d.final_thesis_path) ? d.final_thesis_path : `${runRoot}/final_thesis.md`
    const disp = resolveDisplayFields(d, 'decision')
    const integrity = integrityStatusJ(runDirAbs)
    const frozenDecision = disp.decision
    const frozenBasket = (typeof d.post_mortem_basket === 'string' && d.post_mortem_basket) ? d.post_mortem_basket : (d.basket ?? null)
    const frozenConfidence = disp.confidence
    calls.push({ ticker: d.ticker, company: d.company_name ?? null, decision_date: d.decision_date, decision: frozenDecision, basket: frozenBasket,
      decision_is_post_mortem_capped: disp.decisionIsPostMortemCapped, confidence: frozenConfidence, confidence_is_post_review: disp.confidenceIsPostReview,
      frozen_call: { locked: true, decision: frozenDecision, basket: frozenBasket, confidence: frozenConfidence, decision_date: d.decision_date, entry_price: entry, currency: d.currency ?? null, source_path: `${runRoot}/decision_record.json` },
      integrity_status: integrity.status, integrity_verdict: integrity.verdict, integrity_banner: integrity.banner,
      time_horizon: d.time_horizon ?? null, entry_price: entry, currency: d.currency ?? null,
      exchange: typeof d.exchange === 'string' && d.exchange ? d.exchange : null,
      expected_return_pct: exp, implied_target: entry != null && exp != null ? Math.round(entry * (1 + exp / 100) * 100) / 100 : null,
      downside_risk_pct: typeof d.downside_risk_pct === 'number' ? d.downside_risk_pct : null, kill_criteria_count: Array.isArray(d.kill_criteria) ? d.kill_criteria.length : 0,
      forecasts: fc, run_root: runRoot, final_thesis_path: finalThesisPath, latest_thesis_status: latest ? latest.thesis_status : null,
      latest_review_summary: latest ? latest.memo_delta_summary : null,
      latest_review_verdict: latest ? latest.thesis_delta_verdict : null,
      latest_review_date: latest ? latest.review_date || null : null,
      next_checkpoint: pending ? { window: pending.window, due_date: pending.due_date, status: pending.status } : null, review_count: reviews.length, timeline })
    // copy every file the tracker can open (older runs aren't copied by the latest-only per-ticker loop)
    const ftAbs = path.join(REPO, finalThesisPath); if (isFile(ftAbs)) copyInto(ftAbs, finalThesisPath)
    for (const t of timeline) {
      if (t.review_file) { const rfAbs = path.join(REPO, t.review_file); if (isFile(rfAbs)) copyInto(rfAbs, t.review_file) }
      if (t.memo_delta_file) {
        const safeMemo = safePublishedMemoDeltaPath(t.memo_delta_file, REPO, runDirAbs, runRoot)
        if (safeMemo) copyInto(path.join(REPO, safeMemo), safeMemo)
      }
    }
  }
  calls.sort((a, b) => (a.decision_date < b.decision_date ? 1 : a.decision_date > b.decision_date ? -1 : 0))
  let dashboard = null
  const tdir = path.join(ANALYSES, 'tracking')
  if (isDir(tdir)) {
    const mds = fs.readdirSync(tdir).filter((f) => /_calls_tracker\.md$/.test(f)).sort()
    if (mds.length) { dashboard = `analyses/tracking/${mds[mds.length - 1]}`; copyInto(path.join(tdir, mds[mds.length - 1]), dashboard) }
  }
  const adjusted = (call, value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null
    const basket = String(call.basket || '').trim().toLowerCase()
    if (basket === 'short') return -value
    if (basket === 'selected') return value
    return null
  }
  const quality = (row) => row?.decision_quality === 'skill' ? 'worked' : row?.decision_quality === 'genuine miss' ? 'failed' : row?.decision_quality === 'luck' ? 'mixed' : 'unscored'
  const reviewWindowRank = (row) => ({ '30d': 30, '90d': 90, '180d': 180, '365d': 365, '24m': 730, '36m': 1095, 'ad-hoc': 100000, 'post-mortem': 200000 }[String(row?.window || '').trim().toLowerCase()] ?? 50000)
  const reviewVersion = (row) => { const m = /_v(\d+)\.json$/i.exec(String(row?.review_file || '')); return m ? Number(m[1]) : 1 }
  const compareNewest = (a, b) => {
    const ad = String(a?.review_date || a?.due_date || '')
    const bd = String(b?.review_date || b?.due_date || '')
    if (ad < bd) return 1
    if (ad > bd) return -1
    const aw = reviewWindowRank(a), bw = reviewWindowRank(b)
    if (aw !== bw) return bw - aw
    const av = reviewVersion(a), bv = reviewVersion(b)
    if (av !== bv) return bv - av
    return String(b.review_file || '').localeCompare(String(a.review_file || ''))
  }
  const standingDone = (call) => {
    const byCheckpoint = new Map()
    for (const row of Array.isArray(call?.timeline) ? call.timeline : []) {
      if (row?.status !== 'done') continue
      const key = `${String(row.review_date || row.due_date || '').trim().toLowerCase()}|${String(row.window || '').trim().toLowerCase()}`
      const prior = byCheckpoint.get(key)
      if (!prior || reviewVersion(row) > reviewVersion(prior)
        || (reviewVersion(row) === reviewVersion(prior) && String(row.review_file || '') > String(prior.review_file || ''))) byCheckpoint.set(key, row)
    }
    return [...byCheckpoint.values()].sort(compareNewest)
  }
  const latestDone = (call) => standingDone(call)[0] || null
  const latestMetric = (call, field, window) => standingDone(call).find((row) => (!window || String(row.window || '').trim().toLowerCase() === window) && typeof row[field] === 'number' && Number.isFinite(row[field])) || null
  const avg = (values) => { const kept = values.filter((x) => typeof x === 'number' && Number.isFinite(x)); return kept.length ? Math.round((kept.reduce((a, b) => a + b, 0) / kept.length) * 100) / 100 : null }
  const eligibleCalls = calls.filter((call) => String(call.integrity_status || '').trim().toLowerCase() !== 'provisional')
  const rows = eligibleCalls.map((call) => ({ call, review: latestDone(call), absoluteReview: latestMetric(call, 'absolute_return_pct'), benchmarkReview: latestMetric(call, 'benchmark_relative_return_pct') }))
  const classes = rows.map((row) => quality(row.review))
  const count = (kind) => classes.filter((x) => x === kind).length
  const horizons = ['30d', '90d', '180d', '365d'].map((window) => {
    const wr = eligibleCalls.flatMap((call) => { const review = standingDone(call).find((row) => String(row.window || '').trim().toLowerCase() === window); return review ? [{ call, review, absoluteReview: latestMetric(call, 'absolute_return_pct', window), benchmarkReview: latestMetric(call, 'benchmark_relative_return_pct', window) }] : [] })
    const cls = wr.map((row) => quality(row.review)), n = (kind) => cls.filter((x) => x === kind).length
    return { window, reviewed: wr.length, worked: n('worked'), failed: n('failed'), mixed: n('mixed'), unscored: n('unscored'),
      average_return_pct: avg(wr.map(({ call, absoluteReview }) => adjusted(call, absoluteReview?.absolute_return_pct))),
      average_vs_benchmark_pct: avg(wr.map(({ call, benchmarkReview }) => adjusted(call, benchmarkReview?.benchmark_relative_return_pct))) }
  })
  const scoredCandidates = rows.filter(({ call, review }) => (quality(review) === 'worked' || quality(review) === 'failed') && Number.isFinite(call.confidence))
  const scoredByTicker = new Map()
  for (const row of scoredCandidates) {
    const key = String(row.call.ticker || '').trim().toUpperCase()
    if (!key) continue
    const prior = scoredByTicker.get(key)
    const rowDate = String(row.call.decision_date || ''), priorDate = String(prior?.call.decision_date || '')
    const rowRoot = String(row.call.run_root || ''), priorRoot = String(prior?.call.run_root || '')
    if (!prior || rowDate > priorDate || (rowDate === priorDate && rowRoot > priorRoot)) scoredByTicker.set(key, row)
  }
  const scoredConfidence = [...scoredByTicker.values()]
  const ranges = [{ label: 'Below 50', min: 0, max: 49.999 }, { label: '50–69', min: 50, max: 69.999 }, { label: '70–84', min: 70, max: 84.999 }, { label: '85+', min: 85, max: 100 }]
  const bands = ranges.map((range) => {
    const bandRows = scoredConfidence.filter(({ call }) => call.confidence >= range.min && call.confidence <= range.max)
    const worked = bandRows.filter(({ review }) => quality(review) === 'worked').length
    return { label: range.label, calls: bandRows.length, worked_pct: bandRows.length ? Math.round((worked / bandRows.length) * 1000) / 10 : null }
  })
  const usableBands = bands.filter((band) => band.calls >= 2 && band.worked_pct != null)
  const enoughConfidenceData = scoredConfidence.length >= 8 && usableBands.length >= 2
  const confidenceAligned = enoughConfidenceData && usableBands.every((band, index) => index === 0 || band.worked_pct + 10 >= usableBands[index - 1].worked_pct)
  const confidenceStatus = !enoughConfidenceData ? 'too_little_data' : confidenceAligned ? 'aligned' : 'not_aligned'
  const confidenceDetail = !enoughConfidenceData
    ? `Too little data: ${scoredConfidence.length} independently scored ticker${scoredConfidence.length === 1 ? '' : 's'}. Conviction is not a probability; this check starts after 8 tickers across at least 2 confidence bands.`
    : confidenceAligned
      ? 'Higher-confidence calls have generally worked more often. This is a ranking check, not a probability claim.'
      : 'Higher-confidence calls have not worked more often. Nostra should lower or rework its conviction rules.'
  const scorecard = { assessed_calls: count('worked') + count('failed'), excluded_provisional: calls.length - eligibleCalls.length, worked: count('worked'), failed: count('failed'), mixed: count('mixed'), unscored: count('unscored'),
    average_return_pct: avg(rows.map(({ call, absoluteReview }) => adjusted(call, absoluteReview?.absolute_return_pct))),
    average_vs_benchmark_pct: avg(rows.map(({ call, benchmarkReview }) => adjusted(call, benchmarkReview?.benchmark_relative_return_pct))), horizons,
    confidence_check: { status: confidenceStatus, scored_calls: scoredConfidence.length, bands, detail: confidenceDetail } }
  return { calls, dashboard, scorecard }
}

// ---- main ----
if (!isDir(AGENTS) || !isDir(ANALYSES)) {
  if (isFile(path.join(DEST, 'snapshot.json'))) { console.warn('[build-snapshot] engine dirs missing — keeping committed snapshot'); process.exit(0) }
  console.error('[build-snapshot] .claude/agents or analyses not found and no committed snapshot'); process.exit(1)
}

fs.rmSync(path.join(DEST, 'analyses'), { recursive: true, force: true })
fs.rmSync(path.join(DEST, 'prompts'), { recursive: true, force: true })
fs.mkdirSync(DEST, { recursive: true })

const swarmGraph = buildSwarmGraph()
const promptCount = copyPrompts()
const tickerNames = [...new Set(fs.readdirSync(ANALYSES).filter((d) => isDir(path.join(ANALYSES, d)) && /_\d{4}-\d{2}-\d{2}$/.test(d)).map((d) => d.replace(/_\d{4}-\d{2}-\d{2}$/, '')))].sort()

const tickers = [], dataStatus = {}, runs = {}, decisions = {}, finalThesis = {}
for (const t of tickerNames) {
  const run = latestRunFor(t)
  if (!run || !isFile(path.join(ANALYSES, run, 'decision_record.json'))) continue
  const built = buildTicker(t, run)
  tickers.push(built.summary)
  dataStatus[t] = built.dataStatus
  runs[t] = built.manifest
  decisions[t] = built.decision
  finalThesis[t] = built.finalThesisPath
}

const callsData = buildCalls()
const { swarms, swarmGraphs, swarmSubjects, swarmSubjectSummaries } = buildSwarms()
fs.rmSync(path.join(DEST, 'screener'), { recursive: true, force: true })
const screenerStatic = buildScreenerStatic()
const generatedAt = new Date().toISOString()
const snapshot = { static: true, swarmGraph, swarms, swarmGraphs, swarmSubjects, swarmSubjectSummaries, tickers, emptyState: tickers.length === 0, dataDir: 'bundled snapshot (static deploy)', dataStatus, runs, decisions, finalThesis, calls: callsData.calls, scorecard: callsData.scorecard, dashboard: callsData.dashboard, watchlist: buildWatchlist(callsData.calls), tasks: buildTasksSnapshot(REPO, generatedAt), ...(screenerStatic || {}), generatedAt }
fs.writeFileSync(path.join(DEST, 'snapshot.json'), JSON.stringify(snapshot))
const swarmSummary = swarms.filter((s) => s.id !== 'research').map((s) => `${s.id} (${swarmGraphs[s.id]?.totals.modules ?? 0}m / ${(swarmSubjects[s.id] || []).length} subj)`).join(', ')
console.log(`[build-snapshot] swarm: ${swarmGraph.totals.modules} modules / ${swarmGraph.totals.agents} agents · ${promptCount} prompts · ${callsData.calls.length} calls · tickers: ${tickers.map((t) => t.ticker).join(', ')}${swarmSummary ? ` · swarms: ${swarmSummary}` : ''}${screenerStatic ? ` · screener runs: ${Object.keys(screenerStatic.screenerRuns).length}` : ''} -> ui/web/public/data/`)
