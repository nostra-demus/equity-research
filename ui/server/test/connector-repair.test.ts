// connector-repair — the repair prompt + fail-closed guard (no spawn/worktree). Run:
// npx tsx test/connector-repair.test.ts. Env set BEFORE importing config.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

// dispatch NOT enabled → repair must be not_ready even for an admin
process.env.ENGINE_DISPATCH_ADMINS = 'boss@muns.io'
delete process.env.ENGINE_CONNECTOR_DISPATCH_ENABLED
process.env.GH_PR_TOKEN = 'ghp_test'

const { buildRepairPrompt, startConnectorRepair } = await import('../src/connector-repair')
import type { ConnectorManifest } from '../src/connector-registry'

const m: ConnectorManifest = {
  id: 'cftc-cot-wheat-srw', dir: '/repo/.claude/connectors/cftc-cot-wheat-srw',
  series: 'CFTC COT', satisfies: ['cftc-cot'], subjects: ['WHEAT'], provider: 'CFTC', acquisition: 'official_api',
  tier: 5, cadence: 'weekly', staleness_sla_days: 12, entry: 'fetch.py', verify: 'fetch.py --verify',
  host_allowlist: ['publicreporting.cftc.gov'], output_path: 'data/WHEAT/external/cftc/cot_<as_of>.json',
}

const prompt = buildRepairPrompt(m, 'WHEAT', 'RuntimeError: missing field m_money_positions_long_all')
check('prompt targets the connector directory', prompt.includes('.claude/connectors/cftc-cot-wheat-srw'))
check('prompt confines the network to the connector host', prompt.includes('publicreporting.cftc.gov'))
check('prompt names the failing subject + error', prompt.includes('WHEAT') && prompt.includes('missing field m_money_positions_long_all'))
check('prompt keeps the same output_path contract', prompt.includes('data/WHEAT/external/cftc'))
check('prompt allows an honest "source is gone" assessed outcome', /genuinely GONE|"assessed"/.test(prompt))
check('prompt opens a READY (non-draft) PR', prompt.includes('WITHOUT --draft'))
check('prompt forbids weakening tests / committing data', /never weaken a test|never anything under data|NEVER/.test(prompt))
check('prompt requires the outcome file', prompt.includes('.connector-repair-outcome.json'))

// guard: with dispatch disabled, repair is not_ready (fail-closed) even though a token is present
const acc = startConnectorRepair(m, 'WHEAT', 'boom')
check('repair is fail-closed when connector dispatch is disabled', acc.accepted === false && acc.status === 'not_ready')

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
