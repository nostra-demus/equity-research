#!/usr/bin/env node
// run-metrics.mjs — PRECISE per-orb metrics for a research run, reconstructed AFTER the fact from the
// Claude Code subagent transcripts. This is the only place exact per-orb numbers exist: token usage and
// the model actually used are not knowable before a run (they depend on the data pool and on model
// behavior), so the cockpit's /api/launch/estimate can only give a coarse whole-run band. This script
// reads the truth the run left behind.
//
// WHAT IT MEASURES, per orb (sub-agent):
//   - model      : the model that actually ran it (read from the transcript, not the frontmatter)
//   - tokens     : input / output / cache-write / cache-read, summed across every turn the orb took
//   - cost       : tokens priced by model (see PRICES below — adjust to your contract)
//   - time       : wall-clock span of the orb (first -> last message timestamp)
// Plus roll-ups by module and by model, the run's true wall-clock span, and a PARALLELISM FACTOR
// (sum of orb durations / wall-clock span) — the direct read on how much the parallel scheduler (#1)
// compressed the run vs running everything serially.
//
// WHAT IT DOES NOT MEASURE: accuracy / output quality. That is NOT a token-log quantity — it needs a
// separate faithfulness + evidence audit of the written outputs (see the memo-faithfulness work). A
// metering script can tell you what a run cost and how long it took; it cannot tell you if it was right.
//
// USAGE:
//   node scripts/run-metrics.mjs TMCV                 # research orbs in the last 12h, this worktree
//   node scripts/run-metrics.mjs TMCV --hours 4       # narrow the look-back window
//   node scripts/run-metrics.mjs TMCV --since 2026-06-14T18:00:00Z --until 2026-06-14T21:00:00Z
//   node scripts/run-metrics.mjs TMCV --json /tmp/m.json --md analyses/TMCV_2026-06-14/_run_metrics.md
//   node scripts/run-metrics.mjs TMCV --all           # include non-research agentTypes (debug)
//   node scripts/run-metrics.mjs --self-test          # parse existing transcripts, no orb filter
//
// Pure Node stdlib. No backend, no network. Scopes to THIS worktree's project transcripts only.

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

// ---- model pricing (USD per 1,000,000 tokens). Adjust to your actual contract. ----
// cacheWrite is the 5-minute-TTL write price (1.25x input); cacheRead is 0.1x input. Anthropic list
// prices for the Claude 4.x family as of early 2026 — edit here if yours differ.
const PRICES = {
  opus:   { in: 15, out: 75, cacheWrite: 18.75, cacheRead: 1.50 },
  sonnet: { in: 3,  out: 15, cacheWrite: 3.75,  cacheRead: 0.30 },
  haiku:  { in: 1,  out: 5,  cacheWrite: 1.25,  cacheRead: 0.10 },
}
function priceFor(model) {
  const m = String(model || '').toLowerCase()
  if (m.includes('opus')) return PRICES.opus
  if (m.includes('sonnet')) return PRICES.sonnet
  if (m.includes('haiku')) return PRICES.haiku
  return null // unknown model -> cost reported as null, tokens still counted
}

// ---- args ----
const argv = process.argv.slice(2)
const flags = {}
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a.startsWith('--')) {
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) flags[key] = true
    else { flags[key] = next; i++ }
  } else positional.push(a)
}
const SELF_TEST = !!flags['self-test']
const TICKER = positional[0] || (SELF_TEST ? '(self-test)' : null)
if (!TICKER) {
  console.error('usage: node scripts/run-metrics.mjs TICKER [--date YYYY-MM-DD] [--hours N|--since ISO --until ISO] [--all] [--json p] [--md p]')
  process.exit(2)
}

// ---- locate the repo root (dir containing .claude) and its Claude Code project transcript dir ----
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
let REPO_ROOT = SCRIPT_DIR
while (REPO_ROOT !== '/' && !fs.existsSync(path.join(REPO_ROOT, '.claude'))) REPO_ROOT = path.dirname(REPO_ROOT)
// Claude Code encodes the cwd into the project dir name by replacing every '/' and '.' with '-'.
const ENCODED = REPO_ROOT.replace(/[/.]/g, '-')
const PROJECT_DIR = path.join(os.homedir(), '.claude', 'projects', ENCODED)
if (!fs.existsSync(PROJECT_DIR)) {
  console.error(`No transcript dir for this worktree:\n  ${PROJECT_DIR}\n(Has a run happened from here yet?)`)
  process.exit(1)
}

// ---- build the research-orb roster: agentType -> { module, order } ----
// Derived live from the agent files so a new module/orb (zero-touch, CLAUDE.md §26) is picked up with no
// edit here. Module = parent folder; order = the NN_ prefix. Root-level orchestration agents map to
// a synthetic "(orchestration)" module.
function buildRoster() {
  const roster = new Map() // name -> { module, order }
  const agentsRoot = path.join(REPO_ROOT, '.claude', 'agents')
  const frontName = (file) => {
    const txt = fs.readFileSync(file, 'utf8')
    const m = txt.match(/^name:\s*(.+)$/m)
    return m ? m[1].trim() : null
  }
  for (const entry of fs.readdirSync(agentsRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const moduleDir = path.join(agentsRoot, entry.name)
      for (const f of fs.readdirSync(moduleDir)) {
        if (!/^(\d\d_.*|99_.*-synthesis)\.md$/.test(f)) continue
        const name = frontName(path.join(moduleDir, f))
        if (name && !roster.has(name)) roster.set(name, { module: entry.name, order: Number(f.slice(0, 2)) || 0 })
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const name = frontName(path.join(agentsRoot, entry.name))
      if (name && !roster.has(name)) roster.set(name, { module: '(orchestration)', order: 99 })
    }
  }
  // master synthesizer's frontmatter name may differ; ensure common orchestration names resolve.
  for (const n of ['synthesizer', 'memo-writer', 'module-memo-writer']) if (!roster.has(n)) roster.set(n, { module: '(orchestration)', order: 99 })
  return roster
}
const ROSTER = buildRoster()

// ---- time window ----
const now = Date.now()
const since = flags.since ? Date.parse(flags.since) : (now - (Number(flags.hours || 12) * 3600 * 1000))
const until = flags.until ? Date.parse(flags.until) : now
const inWindow = (tsMs) => tsMs >= since && tsMs <= until

// ---- walk every session's subagents dir, aggregate per orb transcript ----
function readMeta(jsonlPath) {
  const meta = jsonlPath.replace(/\.jsonl$/, '.meta.json')
  if (!fs.existsSync(meta)) return {}
  try { return JSON.parse(fs.readFileSync(meta, 'utf8')) } catch { return {} }
}
// Scope to the requested ticker's run root (the `analyses/<TICKER>_<date>/` path every orb writes its
// OUTPUT_PATH to) so a SECOND ticker's run in the same look-back window can't corrupt the totals.
// `--date` narrows to a single run; without it, any dated run of this ticker matches.
const TICKER_NEEDLE = flags.date ? `analyses/${TICKER}_${flags.date}/` : `analyses/${TICKER}_`

function aggregateTranscript(jsonlPath) {
  let input = 0, output = 0, cacheWrite = 0, cacheRead = 0
  let firstTs = null, lastTs = null
  const modelCounts = new Map()
  let assistantTurns = 0
  let refsTicker = false
  for (const line of fs.readFileSync(jsonlPath, 'utf8').split('\n')) {
    if (!line.trim()) continue
    if (!refsTicker && line.includes(TICKER_NEEDLE)) refsTicker = true // does this orb belong to TICKER's run root?
    let d; try { d = JSON.parse(line) } catch { continue }
    const ts = d.timestamp ? Date.parse(d.timestamp) : null
    if (ts) { if (firstTs === null) firstTs = ts; lastTs = ts }
    const msg = d.message
    if (!msg || typeof msg !== 'object' || msg.role !== 'assistant') continue
    assistantTurns++
    if (msg.model) modelCounts.set(msg.model, (modelCounts.get(msg.model) || 0) + 1)
    const u = msg.usage || {}
    input += u.input_tokens || 0
    output += u.output_tokens || 0
    cacheWrite += u.cache_creation_input_tokens || 0
    cacheRead += u.cache_read_input_tokens || 0
  }
  const model = [...modelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const multiModel = modelCounts.size > 1
  return { input, output, cacheWrite, cacheRead, firstTs, lastTs, model, multiModel, assistantTurns, refsTicker }
}
function costOf(agg) {
  const p = priceFor(agg.model)
  if (!p) return null
  return (agg.input * p.in + agg.output * p.out + agg.cacheWrite * p.cacheWrite + agg.cacheRead * p.cacheRead) / 1e6
}

const orbs = []
const sessions = fs.readdirSync(PROJECT_DIR, { withFileTypes: true }).filter((e) => e.isDirectory())
for (const s of sessions) {
  const subDir = path.join(PROJECT_DIR, s.name, 'subagents')
  if (!fs.existsSync(subDir)) continue
  for (const f of fs.readdirSync(subDir)) {
    if (!/^agent-.*\.jsonl$/.test(f)) continue
    const jsonlPath = path.join(subDir, f)
    const agg = aggregateTranscript(jsonlPath)
    if (agg.firstTs === null || !inWindow(agg.firstTs)) continue
    if (!SELF_TEST && !agg.refsTicker) continue // belongs to a DIFFERENT ticker's run in this window — exclude (ticker-scope)
    const meta = readMeta(jsonlPath)
    const orbName = meta.agentType || '(unknown)'
    const known = ROSTER.get(orbName)
    if (!SELF_TEST && !flags.all && !known) continue // research orbs only, unless --all/self-test
    orbs.push({
      session: s.name.slice(0, 8),
      agentId: f.replace(/^agent-|\.jsonl$/g, ''),
      orb: orbName,
      module: known?.module || '(non-roster)',
      order: known?.order ?? 999,
      description: meta.description || '',
      ...agg,
      cost: costOf(agg),
      durationSec: agg.firstTs != null && agg.lastTs != null ? (agg.lastTs - agg.firstTs) / 1000 : 0,
    })
  }
}

if (orbs.length === 0) {
  console.error(`No matching orb transcripts in window for ${TICKER}.`)
  console.error(`  window:  ${new Date(since).toISOString()}  ->  ${new Date(until).toISOString()}`)
  console.error(`  project: ${PROJECT_DIR}`)
  console.error(`  hint: widen with --hours N, pass --since/--until, or --all to include non-research agents.`)
  process.exit(1)
}

// ---- roll-ups ----
const sum = (xs, f) => xs.reduce((a, x) => a + (f(x) || 0), 0)
const span = (xs) => {
  const lo = Math.min(...xs.map((x) => x.firstTs))
  const hi = Math.max(...xs.map((x) => x.lastTs))
  return { lo, hi, sec: (hi - lo) / 1000 }
}
const fmtTok = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n)
const fmtUsd = (n) => n == null ? '  n/a' : '$' + n.toFixed(2)
const fmtMin = (sec) => (sec / 60).toFixed(1) + 'm'

orbs.sort((a, b) => (a.module < b.module ? -1 : a.module > b.module ? 1 : a.order - b.order))

const byModule = new Map()
const byModel = new Map()
for (const o of orbs) {
  if (!byModule.has(o.module)) byModule.set(o.module, [])
  byModule.get(o.module).push(o)
  const mk = priceFor(o.model) ? (o.model.includes('opus') ? 'opus' : o.model.includes('sonnet') ? 'sonnet' : 'haiku') : (o.model || 'unknown')
  if (!byModel.has(mk)) byModel.set(mk, [])
  byModel.get(mk).push(o)
}

const totalTokens = sum(orbs, (o) => o.input + o.output + o.cacheWrite + o.cacheRead)
const totalCost = orbs.every((o) => o.cost == null) ? null : sum(orbs, (o) => o.cost)
const runSpan = span(orbs)
const sumDurations = sum(orbs, (o) => o.durationSec)
const parallelism = runSpan.sec > 0 ? sumDurations / runSpan.sec : 0

// ---- render ----
const L = []
L.push(`# Run metrics — ${TICKER}`)
L.push('')
L.push(`Window: ${new Date(since).toISOString()} → ${new Date(until).toISOString()}`)
L.push(`Orbs in window: ${orbs.length}   ·   Run wall-clock span: ${fmtMin(runSpan.sec)}   ·   Sum of orb durations: ${fmtMin(sumDurations)}`)
L.push(`Parallelism factor (sum/​span): ${parallelism.toFixed(2)}×  — higher = more orbs ran concurrently (the #1 scheduler payoff)`)
L.push(`Total tokens: ${fmtTok(totalTokens)}   ·   Total cost: ${fmtUsd(totalCost)}${totalCost == null ? ' (unknown model prices)' : ''}`)
L.push('')
L.push('## Per orb')
L.push('')
L.push('| Module | # | Orb | Model | In | Out | CacheWr | CacheRd | Cost | Time |')
L.push('|---|--:|---|---|--:|--:|--:|--:|--:|--:|')
for (const o of orbs) {
  const modelShort = (o.model || '?').replace('claude-', '').replace(/-\d{8}$/, '')
  L.push(`| ${o.module} | ${o.order || ''} | ${o.orb}${o.multiModel ? ' ⚠︎multi' : ''} | ${modelShort} | ${fmtTok(o.input)} | ${fmtTok(o.output)} | ${fmtTok(o.cacheWrite)} | ${fmtTok(o.cacheRead)} | ${fmtUsd(o.cost)} | ${fmtMin(o.durationSec)} |`)
}
L.push('')
L.push('## By module')
L.push('')
L.push('| Module | Orbs | Tokens | Cost | Span (wall) | Σ durations |')
L.push('|---|--:|--:|--:|--:|--:|')
for (const [mod, list] of [...byModule.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1)) {
  const tk = sum(list, (o) => o.input + o.output + o.cacheWrite + o.cacheRead)
  const ct = list.every((o) => o.cost == null) ? null : sum(list, (o) => o.cost)
  const sp = span(list)
  L.push(`| ${mod} | ${list.length} | ${fmtTok(tk)} | ${fmtUsd(ct)} | ${fmtMin(sp.sec)} | ${fmtMin(sum(list, (o) => o.durationSec))} |`)
}
L.push('')
L.push('## By model')
L.push('')
L.push('| Model | Orbs | Tokens | Cost | Cost share |')
L.push('|---|--:|--:|--:|--:|')
for (const [mk, list] of [...byModel.entries()].sort((a, b) => sum(b[1], (o) => o.cost || 0) - sum(a[1], (o) => o.cost || 0))) {
  const tk = sum(list, (o) => o.input + o.output + o.cacheWrite + o.cacheRead)
  const ct = list.every((o) => o.cost == null) ? null : sum(list, (o) => o.cost)
  const share = totalCost && ct != null ? ((ct / totalCost) * 100).toFixed(0) + '%' : '—'
  L.push(`| ${mk} | ${list.length} | ${fmtTok(tk)} | ${fmtUsd(ct)} | ${share} |`)
}
L.push('')
L.push('_Cost uses the PRICES table in this script (USD per 1M tokens); edit it for your contract. Accuracy / output quality is NOT measured here — that needs a separate faithfulness + evidence audit._')

const report = L.join('\n')
console.log(report)

if (typeof flags.json === 'string') {
  fs.writeFileSync(flags.json, JSON.stringify({
    ticker: TICKER, window: { since: new Date(since).toISOString(), until: new Date(until).toISOString() },
    totals: { orbs: orbs.length, tokens: totalTokens, costUsd: totalCost, wallSpanSec: runSpan.sec, sumDurationsSec: sumDurations, parallelism },
    orbs: orbs.map((o) => ({ module: o.module, orb: o.orb, order: o.order, model: o.model, multiModel: o.multiModel,
      input: o.input, output: o.output, cacheWrite: o.cacheWrite, cacheRead: o.cacheRead, costUsd: o.cost,
      durationSec: o.durationSec, firstTs: o.firstTs, lastTs: o.lastTs, assistantTurns: o.assistantTurns,
      session: o.session, agentId: o.agentId, description: o.description })),
  }, null, 2))
  console.error(`\nwrote JSON -> ${flags.json}`)
}
if (typeof flags.md === 'string') {
  fs.mkdirSync(path.dirname(flags.md), { recursive: true })
  fs.writeFileSync(flags.md, report + '\n')
  console.error(`wrote markdown -> ${flags.md}`)
}
