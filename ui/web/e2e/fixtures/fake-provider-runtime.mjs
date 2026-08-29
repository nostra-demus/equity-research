import fs from 'node:fs'
import path from 'node:path'
import { PARTIAL_FILES, REQUIRED_FILES } from './fixture-contract.mjs'

const provider = process.env.NOSTRA_FIXTURE_PROVIDER
const outcome = process.env.NOSTRA_FIXTURE_OUTCOME
const root = process.env.NOSTRA_FIXTURE_RUN_ROOT
const profileKey = process.env.NOSTRA_FIXTURE_PROFILE_KEY
if (!['claude', 'codex'].includes(provider) || !['interrupt', 'success'].includes(outcome) || !root || !profileKey) process.exit(64)

function write(relative, value) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, value)
}

for (const relative of PARTIAL_FILES) {
  const target = path.join(root, relative)
  if (!fs.existsSync(target)) write(relative, `frozen reusable artifact: ${relative}\n`)
}

if (provider === 'claude') {
  console.log(JSON.stringify({ type: 'system', subtype: 'init', session_id: 'fixture-claude-session' }))
  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 'fixture-tool', name: 'Task', input: { subagent_type: 'fixture-orb' } }] } }))
} else {
  console.log(JSON.stringify({ type: 'thread.started', thread_id: 'fixture-codex-thread' }))
  console.log(JSON.stringify({ type: 'item.started', item: { id: 'fixture-tool', type: 'collab_tool_call', tool: 'spawn_agent', prompt: 'NOSTRA_SUBAGENT_TYPE: fixture-orb\n' } }))
}

if (outcome === 'interrupt') {
  if (provider === 'claude') console.log(JSON.stringify({ type: 'result', subtype: 'error', is_error: true, result: 'fixture interruption' }))
  else console.log(JSON.stringify({ type: 'turn.failed', error: { message: 'fixture interruption' } }))
  process.exitCode = 17
} else {
  for (const relative of REQUIRED_FILES) {
    if (PARTIAL_FILES.includes(relative)) continue
    if (relative === 'decision_record.json') write(relative, `${JSON.stringify({ ticker: 'KAR', verdict: 'Watchlist', fixture: true }, null, 2)}\n`)
    else if (relative === 'execution_provenance.receipt.json') write(relative, `${JSON.stringify({ provider, profileKey, mixedProfile: false, fixture: true }, null, 2)}\n`)
    else if (relative === 'publication.receipt.json') write(relative, `${JSON.stringify({ status: 'published', provider, fixture: true }, null, 2)}\n`)
    else write(relative, `fixture artifact: ${relative}\n`)
  }
  if (provider === 'claude') console.log(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, total_cost_usd: 1.25, num_turns: 2, duration_ms: 25, result: 'published' }))
  else console.log(JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 100, output_tokens: 50 } }))
}
