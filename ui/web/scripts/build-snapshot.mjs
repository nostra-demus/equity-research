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
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
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
function buildSwarmGraph() {
  const moduleDirs = fs.readdirSync(AGENTS).filter((d) => isDir(path.join(AGENTS, d)) && fs.readdirSync(path.join(AGENTS, d)).some((f) => /^99_.*-synthesis\.md$/.test(f)))
  const discovered = moduleDirs.map((name) => {
    const synth = fs.readdirSync(path.join(AGENTS, name)).find((f) => /^99_.*-synthesis\.md$/.test(f))
    const { data } = parseFrontmatter(fs.readFileSync(path.join(AGENTS, name, synth), 'utf8'))
    return { name, dependsOn: parseDeps(data.depends_on) }
  })
  const order = topoSort(discovered)
  const modules = order.map((name, i) => {
    const d = discovered.find((m) => m.name === name)
    const files = fs.readdirSync(path.join(AGENTS, name)).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
    const layers = {}
    for (const f of files) {
      const raw = fs.readFileSync(path.join(AGENTS, name, f), 'utf8')
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
  if (isFile(path.join(AGENTS, 'synthesizer.md'))) {
    const { data } = parseFrontmatter(fs.readFileSync(path.join(AGENTS, 'synthesizer.md'), 'utf8'))
    masterSynthesizer = { name: String(data.name || 'synthesizer'), description: String(data.description || '') }
  }
  const all = modules.flatMap((m) => Object.values(m.layers).flat())
  const synthesis = all.filter((a) => a.isSynthesis).length
  return { modules, masterSynthesizer, totals: { modules: modules.length, agents: all.length, specialists: all.length - synthesis, synthesis } }
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
  const dataModules = {}
  for (const mod of fs.readdirSync(runDir).filter((d) => isDir(path.join(runDir, d)))) {
    const mdFiles = fs.readdirSync(path.join(runDir, mod)).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
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

// ---- main ----
if (!isDir(AGENTS) || !isDir(ANALYSES)) {
  if (isFile(path.join(DEST, 'snapshot.json'))) { console.warn('[build-snapshot] engine dirs missing — keeping committed snapshot'); process.exit(0) }
  console.error('[build-snapshot] .claude/agents or analyses not found and no committed snapshot'); process.exit(1)
}

fs.rmSync(path.join(DEST, 'analyses'), { recursive: true, force: true })
fs.mkdirSync(DEST, { recursive: true })

const swarmGraph = buildSwarmGraph()
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

const snapshot = { static: true, swarmGraph, tickers, emptyState: tickers.length === 0, dataDir: 'bundled snapshot (static deploy)', dataStatus, runs, decisions, finalThesis, generatedAt: new Date().toISOString() }
fs.writeFileSync(path.join(DEST, 'snapshot.json'), JSON.stringify(snapshot))
console.log(`[build-snapshot] swarm: ${swarmGraph.totals.modules} modules / ${swarmGraph.totals.agents} agents · tickers: ${tickers.map((t) => t.ticker).join(', ')} -> ui/web/public/data/`)
