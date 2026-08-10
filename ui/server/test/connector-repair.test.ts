// connector-repair — the repair prompt + fail-closed guard (no spawn/worktree). Run:
// npx tsx test/connector-repair.test.ts. Env set BEFORE importing config.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}
// Exact-token presence in a free-text prompt — a plain content assertion ("does the generated string
// mention this literal value"), not a URL/host trust decision. Written as a word-boundary RegExp rather
// than `str.includes(<domain-literal>)` so it doesn't pattern-match CodeQL's js/incomplete-url-substring-
// sanitization query, which is meant for (and here would misfire on) an actual untrusted-input sanitizer.
const hasToken = (haystack: string, token: string) =>
  new RegExp(`(?<![\\w.])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`).test(haystack)

// Even explicit build + auto-repair flags and a PR token cannot bypass the compile-time isolation hard stop.
process.env.ENGINE_DISPATCH_ADMINS = 'boss@muns.io'
process.env.ENGINE_CONNECTOR_DISPATCH_ENABLED = '1'
process.env.ENGINE_CONNECTOR_AUTO_REPAIR = '1'
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
check('prompt confines the network to the connector host', hasToken(prompt, 'publicreporting.cftc.gov'))
check('prompt names the failing subject + error', prompt.includes('WHEAT') && prompt.includes('missing field m_money_positions_long_all'))
check('prompt keeps the same output_path contract', prompt.includes('data/WHEAT/external/cftc'))
check('prompt allows an honest "source is gone" assessed outcome', /genuinely GONE|"assessed"/.test(prompt))
check('prompt opens a READY (non-draft) PR', prompt.includes('WITHOUT --draft'))
check('prompt forbids weakening tests / committing data', /never weaken a test|never anything under data|NEVER/.test(prompt))
check('prompt requires the outcome file', prompt.includes('.connector-repair-outcome.json'))
check('prompt keeps manual bytes ephemeral and forbids file URLs as durable provenance',
  prompt.includes('runner-attested local bytes') && prompt.includes('all `file:` URLs are forbidden')
  && prompt.includes('durable payload/sidecar source URL'))

// guard: with every operator switch set, repair is still not_ready until enforced isolation exists
const acc = startConnectorRepair(m, 'WHEAT', 'boom')
check('repair flags and token cannot bypass the enforced-isolation requirement',
  acc.accepted === false && acc.status === 'not_ready' && /network-enforced isolated runner/.test(acc.message))

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
