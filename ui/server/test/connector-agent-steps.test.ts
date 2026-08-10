// Connector-agent display helpers plus the action-boundary hard stop. The fixture creates only its own temp
// parent; the forbidden worktree path must remain absent and no process/GitHub action can run.
// Run: npx tsx test/connector-agent-steps.test.ts.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.ENGINE_CONNECTOR_DISPATCH_ENABLED = '1'
process.env.GH_PR_TOKEN = 'ghp_test'
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { classifyAgentLine, runWorktreeAgent, stepTarget } = await import('../src/connector-agent')
const { connectorAgentIsolationReady } = await import('../src/config')

const assistant = (content: any[]) => ({ type: 'assistant', message: { content } })

// tool_use lines become one step each, with a display target
const edit = classifyAgentLine(assistant([{ type: 'tool_use', name: 'Edit', input: { file_path: '/repo/.claude/connectors/x/fetch.py' } }]))
check('an Edit becomes one step', edit.length === 1 && edit[0].tool === 'Edit')
check('a file_path target shows the last 3 path segments', edit[0].target === 'connectors/x/fetch.py')

const bash = classifyAgentLine(assistant([{ type: 'tool_use', name: 'Bash', input: { command: 'python3 fetch.py --verify' } }]))
check('a Bash target shows the command', bash[0].tool === 'Bash' && bash[0].target === 'python3 fetch.py --verify')

const fetch = classifyAgentLine(assistant([{ type: 'tool_use', name: 'WebFetch', input: { url: 'https://data.example.com/x?y=1' } }]))
check('a WebFetch target shows the hostname only', fetch[0].target === 'data.example.com')

// text blocks become a 'say' step
const say = classifyAgentLine(assistant([{ type: 'text', text: '  Building the connector now.  ' }]))
check('a text block becomes a say step, trimmed', say.length === 1 && say[0].tool === 'say' && say[0].target === 'Building the connector now.')

// a mixed line yields both, in order
const mixed = classifyAgentLine(assistant([{ type: 'text', text: 'first' }, { type: 'tool_use', name: 'Read', input: { file_path: 'a/b/c.py' } }]))
check('a mixed line yields text then tool, in order', mixed.length === 2 && mixed[0].tool === 'say' && mixed[1].tool === 'Read')

// robustness
check('a non-assistant line yields nothing', classifyAgentLine({ type: 'result' }).length === 0)
check('an error assistant line yields nothing', classifyAgentLine({ type: 'assistant', error: true, message: { content: [] } }).length === 0)
check('a null / non-object never throws', classifyAgentLine(null).length === 0 && classifyAgentLine(42 as any).length === 0)
check('content that is not an array yields nothing', classifyAgentLine({ type: 'assistant', message: { content: 'nope' } }).length === 0)
check('an empty text block is dropped (no empty say)', classifyAgentLine(assistant([{ type: 'text', text: '   ' }])).length === 0)

// stepTarget clamps and falls back
check('stepTarget on a long command is clamped', stepTarget('Bash', { command: 'x'.repeat(400) }).length <= 110)
check('stepTarget with no recognizable input → empty (caller shows the tool name)', stepTarget('SomeTool', {}) === '')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-agent-hard-stop-'))
try {
  const forbiddenWorktree = path.join(root, 'must-not-exist')
  const result = await runWorktreeAgent({
    branch: 'connector/must-not-run', worktree: forbiddenWorktree, prompt: 'untrusted source',
    outcomeFile: '.outcome.json', logName: '.log', maxTurns: 1, budgetUsd: 1,
  })
  check('direct runner invocation is assessed before worktree/GitHub/spawn even when flags and token exist',
    connectorAgentIsolationReady() === false && result.outcome === 'assessed'
    && /manual branch and pull-request workflow/.test(result.note || '')
    && !fs.existsSync(forbiddenWorktree))
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log(`\nconnector-agent-steps.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
