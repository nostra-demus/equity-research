// Build-time snapshot generator for the STATIC (Cloudflare Pages) deploy of the cockpit.
// Reads the repo's .claude/agents (swarm graph) and analyses/<runs> (results) read-only and writes
// public/data/snapshot.json + copies each ticker's latest-run markdown into public/data/analyses/.
// At runtime the app probes /api/health: if a local backend answers it stays fully live; otherwise it
// falls back to this snapshot (read-only showcase). Never modifies the engine.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
    const { data } = parseFrontmatter(fs.readFileSync(manifestPath, 'utf8'))
    const id = unquote(data.id ?? d).trim()
    if (!id || id === RESEARCH_SWARM.id) continue // 'research' is reserved for the grandfathered default
    const runRootTemplate = unquote(data.run_root_template ?? '').trim()
    if (!runRootTemplate) continue // a swarm without a run-root template cannot host runs
    const str = (v, def) => (v != null && unquote(v).trim() ? unquote(v).trim() : def)
    const runsRootDefault = path.dirname(runRootTemplate.split('{')[0].replace(/\/+$/, ''))
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

// The full swarm surface for the snapshot: research (grandfathered default) first, then every
// discovered non-research swarm's SwarmMeta + subject ids + built graph. What the static api.ts reads
// as snap.swarms / snap.swarmSubjects / snap.swarmGraphs.
function buildSwarms() {
  const swarms = [RESEARCH_SWARM]
  const swarmGraphs = {}
  const swarmSubjects = {}
  for (const sw of discoverSwarmManifests()) {
    swarms.push(sw.meta)
    swarmGraphs[sw.meta.id] = buildSwarmGraph(sw.dir, sw.meta)
    swarmSubjects[sw.meta.id] = swarmSubjectsFor(sw)
  }
  return { swarms, swarmGraphs, swarmSubjects }
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
  if (isFile(boardPath)) board = loadJSON(boardPath)
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
function loadJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
function todayISOJ() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function reviewsForRun(runDirAbs, runRoot) {
  const rdir = path.join(runDirAbs, 'reviews')
  if (!isDir(rdir)) return []
  const out = []
  for (const n of fs.readdirSync(rdir).filter((f) => /_decision_review.*\.json$/.test(f)).sort()) {
    const j = loadJSON(path.join(rdir, n)); if (!j) continue
    const fr = Array.isArray(j.forecast_results) ? j.forecast_results : []
    const conf = fr.filter((r) => String((r && r.status) || '').toLowerCase() === 'confirmed').length
    const fals = fr.filter((r) => String((r && r.status) || '').toLowerCase() === 'falsified').length
    out.push({ file: `${runRoot}/reviews/${n}`, basename: n, review_window: j.review_window || '', review_date: j.review_date || '',
      review_price: typeof j.review_price === 'number' ? j.review_price : null, absolute_return_pct: typeof j.absolute_return_pct === 'number' ? j.absolute_return_pct : null,
      thesis_status: j.thesis_status || null, forecasts_confirmed: conf, forecasts_falsified: fals })
  }
  return out
}
function winnerJ(files) { return files.length ? [...files].sort((a, b) => (a.review_date < b.review_date ? 1 : a.review_date > b.review_date ? -1 : a.basename < b.basename ? 1 : -1))[0] : null }
function buildTimelineJ(schedule, reviews, today) {
  const out = [], keys = Object.keys(schedule || {})
  for (const w of keys) {
    const dt = schedule[w]; if (!isISODateJ(dt)) continue
    const matches = reviews.filter((r) => r.basename.includes(`_${w}_decision_review`))
    const win = winnerJ(matches)
    if (win) out.push({ window: w, due_date: dt, status: 'done', review_date: win.review_date, review_price: win.review_price, absolute_return_pct: win.absolute_return_pct, thesis_status: win.thesis_status, forecasts_confirmed: win.forecasts_confirmed, forecasts_falsified: win.forecasts_falsified, review_file: win.file, review_count: matches.length })
    else out.push({ window: w, due_date: dt, status: dt < today ? 'overdue' : dt === today ? 'due' : 'upcoming' })
  }
  for (const r of reviews) {
    if (keys.some((w) => r.basename.includes(`_${w}_decision_review`))) continue
    out.push({ window: r.review_window || 'ad-hoc', due_date: r.review_date || null, status: 'done', review_date: r.review_date, review_price: r.review_price, absolute_return_pct: r.absolute_return_pct, thesis_status: r.thesis_status, forecasts_confirmed: r.forecasts_confirmed, forecasts_falsified: r.forecasts_falsified, review_file: r.file })
  }
  out.sort((a, b) => { const da = a.due_date || '9999-99-99', db = b.due_date || '9999-99-99'; return da < db ? -1 : da > db ? 1 : 0 })
  return out
}
function buildCalls() {
  const today = todayISOJ()
  const calls = []
  for (const name of fs.readdirSync(ANALYSES)) {
    if (!/_\d{4}-\d{2}-\d{2}$/.test(name)) continue
    const runDirAbs = path.join(ANALYSES, name), runRoot = `analyses/${name}`
    const d = loadJSON(path.join(runDirAbs, 'decision_record.json')); if (!d) continue
    if (!(d.ticker && d.decision && d.decision_date)) continue
    const reviews = reviewsForRun(runDirAbs, runRoot)
    const timeline = buildTimelineJ(d.review_schedule || {}, reviews, today)
    const latest = winnerJ(reviews)
    const entry = typeof d.entry_price === 'number' ? d.entry_price : null
    const exp = typeof d.expected_return_pct === 'number' ? d.expected_return_pct : null
    const fc = { open: 0, confirmed: 0, falsified: 0, expired: 0, other: 0 }
    for (const f of (Array.isArray(d.forecast_ledger) ? d.forecast_ledger : [])) { const s = String((f && f.status) || 'open').toLowerCase(); if (s in fc) fc[s]++; else fc.other++ }
    const pending = timeline.find((t) => t.status === 'overdue') || timeline.find((t) => t.status === 'due') || timeline.find((t) => t.status === 'upcoming') || null
    const finalThesisPath = (typeof d.final_thesis_path === 'string' && d.final_thesis_path) ? d.final_thesis_path : `${runRoot}/final_thesis.md`
    calls.push({ ticker: d.ticker, company: d.company_name ?? null, decision_date: d.decision_date, decision: d.decision, basket: d.basket ?? null,
      confidence: typeof d.confidence_score === 'number' ? d.confidence_score : null, time_horizon: d.time_horizon ?? null, entry_price: entry, currency: d.currency ?? null,
      expected_return_pct: exp, implied_target: entry != null && exp != null ? Math.round(entry * (1 + exp / 100) * 100) / 100 : null,
      downside_risk_pct: typeof d.downside_risk_pct === 'number' ? d.downside_risk_pct : null, kill_criteria_count: Array.isArray(d.kill_criteria) ? d.kill_criteria.length : 0,
      forecasts: fc, run_root: runRoot, final_thesis_path: finalThesisPath, latest_thesis_status: latest ? latest.thesis_status : null,
      next_checkpoint: pending ? { window: pending.window, due_date: pending.due_date, status: pending.status } : null, review_count: reviews.length, timeline })
    // copy every file the tracker can open (older runs aren't copied by the latest-only per-ticker loop)
    const ftAbs = path.join(REPO, finalThesisPath); if (isFile(ftAbs)) copyInto(ftAbs, finalThesisPath)
    for (const t of timeline) if (t.review_file) { const rfAbs = path.join(REPO, t.review_file); if (isFile(rfAbs)) copyInto(rfAbs, t.review_file) }
  }
  calls.sort((a, b) => (a.decision_date < b.decision_date ? 1 : a.decision_date > b.decision_date ? -1 : 0))
  let dashboard = null
  const tdir = path.join(ANALYSES, 'tracking')
  if (isDir(tdir)) {
    const mds = fs.readdirSync(tdir).filter((f) => /_calls_tracker\.md$/.test(f)).sort()
    if (mds.length) { dashboard = `analyses/tracking/${mds[mds.length - 1]}`; copyInto(path.join(tdir, mds[mds.length - 1]), dashboard) }
  }
  return { calls, dashboard }
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
const { swarms, swarmGraphs, swarmSubjects } = buildSwarms()
fs.rmSync(path.join(DEST, 'screener'), { recursive: true, force: true })
const screenerStatic = buildScreenerStatic()
const snapshot = { static: true, swarmGraph, swarms, swarmGraphs, swarmSubjects, tickers, emptyState: tickers.length === 0, dataDir: 'bundled snapshot (static deploy)', dataStatus, runs, decisions, finalThesis, calls: callsData.calls, dashboard: callsData.dashboard, ...(screenerStatic || {}), generatedAt: new Date().toISOString() }
fs.writeFileSync(path.join(DEST, 'snapshot.json'), JSON.stringify(snapshot))
const swarmSummary = swarms.filter((s) => s.id !== 'research').map((s) => `${s.id} (${swarmGraphs[s.id]?.totals.modules ?? 0}m / ${(swarmSubjects[s.id] || []).length} subj)`).join(', ')
console.log(`[build-snapshot] swarm: ${swarmGraph.totals.modules} modules / ${swarmGraph.totals.agents} agents · ${promptCount} prompts · ${callsData.calls.length} calls · tickers: ${tickers.map((t) => t.ticker).join(', ')}${swarmSummary ? ` · swarms: ${swarmSummary}` : ''}${screenerStatic ? ` · screener runs: ${Object.keys(screenerStatic.screenerRuns).length}` : ''} -> ui/web/public/data/`)
