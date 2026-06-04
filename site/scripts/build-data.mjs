// Build-time data bundler for the Nostradamus dossier viewer.
// Copies a committed research run (analyses/<RUN>) into public/data/ and writes a manifest the
// static app reads. Runs on every `npm run build` (and `npm run dev`). Reads the repo's existing
// analyses output read-only — it never modifies the research engine.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(__dirname, '..')
const REPO = path.resolve(SITE, '..')
const RUN = process.env.REPORT_RUN || 'BG_2026-06-01'
const SRC = path.resolve(REPO, 'analyses', RUN)
const DEST = path.resolve(SITE, 'public', 'data')
const RUNDEST = path.resolve(DEST, RUN)

const prettify = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const trunc = (s, n = 240) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

function cleanInline(s) {
  return s.replace(/\*\*/g, '').replace(/`/g, '').replace(/^\s*[-*]\s+/, '').replace(/^\s*>\s+/, '').replace(/^\s*verdict\s*:?\s*/i, '').trim()
}
function cleanLine(raw) {
  const t = raw.trim()
  if (!t || /^-{3,}$/.test(t) || /^```/.test(t) || /^#{1,6}\s/.test(t) || /^\|/.test(t) || /^\(/.test(t)) return null
  const c = cleanInline(t)
  return c && c.length > 1 ? trunc(c) : null
}
function extractVerdict(md) {
  const lines = md.split(/\r?\n/)
  for (const ln of lines) {
    const m = ln.match(/^[\s>*-]*(?:\*\*)?\s*verdict\s*:\s*(?:\*\*)?\s*(.+?)\s*$/i)
    if (m && m[1]) {
      const v = cleanInline(m[1])
      if (v && v.length > 1) return trunc(v)
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s+.*verdict/i.test(lines[i])) {
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const c = cleanLine(lines[j])
        if (c) return c
      }
    }
  }
  return null
}

if (!fs.existsSync(SRC)) {
  if (fs.existsSync(path.join(DEST, 'manifest.json'))) {
    console.warn(`[build-data] source ${SRC} not found — keeping committed public/data/`)
    process.exit(0)
  }
  console.error(`[build-data] source run not found and no committed data: ${SRC}`)
  process.exit(1)
}

fs.rmSync(RUNDEST, { recursive: true, force: true })
fs.mkdirSync(RUNDEST, { recursive: true })

const copyRel = (rel) => {
  const s = path.join(SRC, rel)
  const d = path.join(RUNDEST, rel)
  fs.mkdirSync(path.dirname(d), { recursive: true })
  fs.copyFileSync(s, d)
}

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}
const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

// top-level .md and .json
for (const f of fs.readdirSync(SRC)) {
  if (isFile(path.join(SRC, f)) && (f.endsWith('.md') || f.endsWith('.json'))) copyRel(f)
}

let decision = {}
try {
  decision = JSON.parse(fs.readFileSync(path.join(SRC, 'decision_record.json'), 'utf8'))
} catch {}

const moduleScores = decision.module_scores || {}
const dirs = fs.readdirSync(SRC).filter((f) => isDir(path.join(SRC, f)))
const preferred = Object.keys(moduleScores)
const orderedDirs = [...preferred.filter((d) => dirs.includes(d)), ...dirs.filter((d) => !preferred.includes(d)).sort()]

const modules = []
for (const mod of orderedDirs) {
  const mdFiles = fs.readdirSync(path.join(SRC, mod)).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
  const agents = []
  for (const f of mdFiles) {
    copyRel(path.join(mod, f))
    const content = fs.readFileSync(path.join(SRC, mod, f), 'utf8')
    const base = f.replace(/\.md$/, '')
    agents.push({
      nn: base.slice(0, 2),
      slug: base.slice(3),
      name: prettify(base.slice(3)),
      file: `${RUN}/${mod}/${f}`,
      verdict: extractVerdict(content),
      isSynthesis: base.slice(0, 2) === '99',
      bytes: Buffer.byteLength(content),
    })
  }
  modules.push({
    name: mod,
    label: prettify(mod),
    score: moduleScores[mod]?.score ?? null,
    verdict: moduleScores[mod]?.verdict ?? null,
    agents,
  })
}

const has = (f) => isFile(path.join(SRC, f))
const manifest = {
  run: RUN,
  ticker: decision.ticker || RUN.split('_')[0],
  date: decision.decision_date || RUN.split('_').slice(1).join('_'),
  decision,
  modules,
  files: {
    finalThesis: has('final_thesis.md') ? `${RUN}/final_thesis.md` : null,
    finalThesisExpanded: has('final_thesis_expanded.md') ? `${RUN}/final_thesis_expanded.md` : null,
    runMetadata: has('RUN_METADATA.md') ? `${RUN}/RUN_METADATA.md` : null,
    verification: has('verification_report.json') ? `${RUN}/verification_report.json` : null,
    preMortem: has('pre_mortem.json') ? `${RUN}/pre_mortem.json` : null,
    expectationsGap: has('expectations_gap.json') ? `${RUN}/expectations_gap.json` : null,
  },
  generatedAt: new Date().toISOString(),
}
fs.writeFileSync(path.join(DEST, 'manifest.json'), JSON.stringify(manifest, null, 2))

const agentCount = modules.reduce((n, m) => n + m.agents.length, 0)
console.log(`[build-data] ${RUN}: ${modules.length} modules, ${agentCount} agent reports -> site/public/data/`)
