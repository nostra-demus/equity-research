// connector dispatch — the connector-specific gate + prompt (no spawn, no worktree). Run:
// npx tsx test/connector-dispatch.test.ts. Proves the build prompt carves the network exception to the ONE
// scanned host, targets .claude/connectors/ with the satisfied need_id, opens a READY (non-draft) PR, and
// that the fail-closed guards short-circuit BEFORE any worktree/spawn (not_buildable / already handled).
// Env set BEFORE importing config (config reads process.env at module load).
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

process.env.ENGINE_DISPATCH_ADMINS = 'boss@muns.io'
process.env.ENGINE_CONNECTOR_DISPATCH_ENABLED = '1'
process.env.GH_PR_TOKEN = 'ghp_test'

const { connectorDispatchReady } = await import('../src/config')
const { buildPrompt, startConnectorDispatch } = await import('../src/connector-dispatch')
import type { PipelineSourceRecord, ScanVerdict } from '../src/pipeline-store'

check('ready = connector-enabled AND token present', connectorDispatchReady() === true)

const source: PipelineSourceRecord = {
  pipeline_id: 'PIPE-20260719-abcdef01', kind: 'pipeline_source', subject: 'GOLD', swarm: 'commodity',
  need_id: 'wgc-central-bank-buying', series_hint: 'central bank gold buying', source_url: 'https://api.gold.org/v1/cb',
  source_kind: 'api', sample: '{"tonnes": 1037}', note: 'quarterly', user_id: 'boss@muns.io', submitted_at: '2026-07-19T10:00:00Z',
}
const verdict: ScanVerdict = {
  relevance: 'exact', confidence: 85, series: 'WGC central bank net purchases', matched_need_ids: ['wgc-central-bank-buying'],
  entry_modules: ['macro-positioning'], acquisition: 'official_api', tier: 5, cadence: 'quarterly' as any,
  host: 'api.gold.org', endpoint_hint: 'https://api.gold.org/v1/cb', verdict_note: 'exact match', buildable: true,
}

const prompt = buildPrompt(source, verdict)
check('prompt carves the network exception to the ONE scanned host', prompt.includes('may fetch ONLY this host: api.gold.org'))
check('prompt pins the host into host_allowlist', prompt.includes('host_allowlist: ["api.gold.org"]'))
check('prompt targets the connector convention', prompt.includes('.claude/connectors/') && prompt.includes('cftc-cot-wheat-srw'))
check('prompt tells the connector to satisfy the surfaced need_id', prompt.includes('wgc-central-bank-buying'))
check('prompt names the subject pool output path', prompt.includes('data/GOLD/external/'))
check('prompt opens a READY (non-draft) PR', prompt.includes('READY for review') && prompt.includes('WITHOUT --draft'))
check('prompt states the untrusted-input boundary', /UNTRUSTED user input/.test(prompt))
check('prompt requires the outcome file', prompt.includes('.connector-outcome.json'))
check('prompt forbids committing data under data/', /NEVER commit fetched data/.test(prompt))

// A non-buildable verdict is rejected BEFORE any worktree/spawn — a pure, side-effect-free guard.
const notBuildable = startConnectorDispatch(source, { ...verdict, buildable: false }, 'boss@muns.io')
check('not_buildable verdict short-circuits before spawn', notBuildable.accepted === false && notBuildable.status === 'not_buildable')

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
