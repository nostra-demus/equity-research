// Frozen Full/Continue command contract. Run: npx tsx test/frozen-command-contract.test.ts
//
// The supervisor denies the live data/<ticker> tree after chain admission. Every command it can dispatch
// must therefore bind the immutable evidence root before its first pool preflight; otherwise an otherwise
// healthy paid child stops before reaching MODULE_PIPELINE.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const agentsRoot = path.join(repo, '.claude', 'agents')
const commandsRoot = path.join(repo, '.claude', 'commands', 'research')

const researchModules = fs.readdirSync(agentsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((module) => fs.readdirSync(path.join(agentsRoot, module))
    .some((name) => /^99_.*-synthesis\.md$/.test(name)))

const moduleCommands = researchModules
  .map((module) => path.join(commandsRoot, `${module}.md`))
  .filter((candidate) => fs.existsSync(candidate))

assert.ok(moduleCommands.length >= 7, 'the research module command roster must be discovered')
for (const commandPath of moduleCommands) {
  const command = fs.readFileSync(commandPath, 'utf8')
  const label = path.basename(commandPath)
  assert.match(command, /If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set/,
    `${label} must branch to the supervisor-frozen evidence root before checking data`)
  assert.match(command, /do not read `data\/\$ARGUMENTS\/` at all/,
    `${label} must keep the live Drive path citation-only in a frozen chain`)
  assert.doesNotMatch(command, /ls -1 data\/\$ARGUMENTS\//,
    `${label} cannot run its legacy live-Drive preflight before the shared pipeline`)
}

const rerun = fs.readFileSync(path.join(commandsRoot, 'rerun.md'), 'utf8')
assert.match(rerun, /set the filesystem `<DATA_PATH>` to that immutable evidence/)
assert.match(rerun, /pass `<TICKER>`, the resolved `<DATA_PATH>`/,
  'the terminal chain command passes the immutable root to its selected specialist')
assert.match(rerun, /verified generation root is\s+<GENERATION_ROOT>/,
  'the terminal master Task receives the exact immutable generation root')
assert.match(rerun, /do not read live data\/<TICKER>\/\s+or any mutable fixed-name projection/,
  'the terminal master Task explicitly forbids both mutable evidence paths')
assert.doesNotMatch(rerun, /extract_pool\.py "data\/<TICKER>\/"/,
  'the terminal chain command never refreshes from live Drive after admission')

const master = fs.readFileSync(path.join(agentsRoot, 'synthesizer.md'), 'utf8')
assert.match(master, /# ACTUAL REPO PATHS AND EVIDENCE BINDING/)
assert.match(master, /If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require the complete supervisor quartet/,
  'the master resolves the same all-or-nothing frozen binding as module commands')
assert.match(master, /Set `<RAW_DATA_PATH>` to\s+`NOSTRA_FROZEN_EVIDENCE_ROOT`/,
  'the master reads raw evidence only from the frozen snapshot')
assert.match(master, /`<CIQ_FACTS_PATH>` to `<GENERATION_ROOT>\/ciq_facts\.json`/,
  'the master reads CIQ facts from the immutable generation')
assert.match(master, /never list, stat, grep, open, or otherwise read live `data\/\{TICKER\}\/`/,
  'the master forbids live Drive reads in frozen mode')
assert.match(master, /Never consume\s+the original `<RUN_ROOT>\/_pool_extracts\/` namespace/,
  'the master forbids mutable root projections in frozen mode')
assert.match(master, /Do not run `extract_pool\.py`/,
  'the master consumes the supervisor-verified capability without touching live extraction')
assert.doesNotMatch(master, /\*\*Raw data\*\* — files inside `data\/\{TICKER\}\/`/,
  'the master raw-data input cannot remain unconditionally bound to live Drive')
assert.doesNotMatch(master, /\*\*Deterministic CIQ facts\*\* — `<RUN_ROOT>\/_pool_extracts\/ciq_facts\.json`/,
  'the master cannot retain the mutable CIQ projection as an unconditional source')

const pipeline = fs.readFileSync(path.join(repo, 'frameworks', 'MODULE_PIPELINE.md'), 'utf8')
assert.match(pipeline, /In this mode `data\/<TICKER>\/` is \*\*only a logical citation label\*\*/)
assert.match(pipeline, /`<DATA_PATH>` to `NOSTRA_FROZEN_EVIDENCE_ROOT`/)
assert.match(pipeline, /\*\*Do not run `extract_pool\.py` in this mode\*\*/,
  'frozen Full/Continue never reruns extraction against the denied live namespace')
assert.match(pipeline, /consume only the provided capability/,
  'the shared pipeline names the isolated capability as the sole evidence source')

// Agent files are system prompts, while MODULE_PIPELINE supplies the exact generation in the Task user
// message. A system prompt that tells an orb to read data/{TICKER} or a mutable root projection wins that
// instruction conflict and either hits the provider sandbox or silently calls present evidence missing.
// Discover the complete analytical roster so a new orb/module cannot reintroduce that provider-dependent
// failure. Triage orbs are excluded because they already own an explicit frozen-vs-standalone resolver.
const analyticalAgentPrompts = researchModules.flatMap((module) =>
  fs.readdirSync(path.join(agentsRoot, module))
    .filter((name) => /^\d{2}_[^/]+\.md$/.test(name) && !/^00_/.test(name))
    .map((name) => path.join(agentsRoot, module, name)))

assert.ok(analyticalAgentPrompts.length >= 55, 'the analytical research-agent roster must be discovered')
const directLiveAssignment = /DATA_PATH\s*=\s*`?data\/\{(?:TICKER|SUBJECT)\}\//i
const directLiveOperation = /\b(?:read|look(?:\s+in)?|scan|inventory|find|open|list|stat|grep)\b[^<\n]{0,120}`?data\/\{(?:TICKER|SUBJECT)\}\//i
const mutableProjection = /(?:<RUN_ROOT>|analyses\/\{TICKER\}_\{DATE\})\/_pool_extracts\/(?:manifest|corpus|ciq_facts|relationships)(?:\.(?:md|json|txt))?/i
const logicalDataLabel = /data\/\{(?:TICKER|SUBJECT)\}\//g

for (const promptPath of analyticalAgentPrompts) {
  const prompt = fs.readFileSync(promptPath, 'utf8')
  const label = path.relative(repo, promptPath)
  assert.doesNotMatch(prompt, directLiveAssignment,
    `${label} cannot bind its filesystem DATA_PATH to live Drive`)
  assert.doesNotMatch(prompt, directLiveOperation,
    `${label} cannot instruct an operational live-Drive read`)
  assert.doesNotMatch(prompt, mutableProjection,
    `${label} cannot read a mutable fixed-name extraction projection`)
  for (const line of prompt.split('\n')) {
    if (![...line.matchAll(logicalDataLabel)].length) continue
    assert.match(line, /<DATA_PATH>/,
      `${label} must pair every logical data/{TICKER} citation label with the injected filesystem root`)
    assert.match(line, /cit(?:e|ed|ation)/i,
      `${label} may mention data/{TICKER} only as a citation label`)
  }
}

for (const module of researchModules) {
  const rulesPath = path.join(agentsRoot, module, 'MODULE_RULES.md')
  if (!fs.existsSync(rulesPath)) continue
  const rules = fs.readFileSync(rulesPath, 'utf8')
  const label = path.relative(repo, rulesPath)
  assert.doesNotMatch(rules, directLiveAssignment,
    `${label} cannot redefine the injected DATA_PATH as live Drive`)
  assert.doesNotMatch(rules, mutableProjection,
    `${label} cannot make a mutable fixed-name projection authoritative`)
  assert.match(rules, /`DATA_PATH`[^\n]*injected by `MODULE_PIPELINE`/,
    `${label} must preserve the injected evidence-root contract`)
  assert.match(rules, /`GENERATION_ROOT`[^\n]*exact immutable extraction generation/,
    `${label} must preserve the exact-generation contract`)
}

console.log(`PASS: ${moduleCommands.length} module commands, terminal master, and ${analyticalAgentPrompts.length} analytical prompts bind frozen evidence before reads`)
