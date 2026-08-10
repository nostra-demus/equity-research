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
delete process.env.ENGINE_CONNECTOR_AUTO_REPAIR

const {
  CONNECTOR_AUTO_REPAIR_ENABLED, connectorAgentIsolationReady, connectorAutoRepairReady,
  connectorDispatchReady,
} = await import('../src/config')
const {
  admitConnectorDispatchUrls, buildPrompt, existingConnectorFor, getBuildProgress,
  initializeBuildProgress, methodologyOnlyConnectorInput, persistedCoverageOwner, startConnectorDispatch,
} = await import('../src/connector-dispatch')
const { bindConnectorUrls } = await import('../src/connector-url-policy')
import type { PipelineSourceRecord, ScanVerdict } from '../src/pipeline-store'

check('explicit enable + token cannot bypass the missing enforced isolation boundary',
  connectorAgentIsolationReady() === false && connectorDispatchReady() === false)
check('auto-repair is explicit opt-in and remains unavailable without enforced isolation',
  CONNECTOR_AUTO_REPAIR_ENABLED === false && connectorAutoRepairReady() === false)

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

const progressId = 'PIPE-20260719-deadbeef'
const reservedProgress = initializeBuildProgress(progressId)
check('accepted-build progress reservation is synchronously visible before background work can start',
  getBuildProgress(progressId) === reservedProgress && reservedProgress.running
  && reservedProgress.pipelineId === progressId)

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
check('prompt keeps manual bytes ephemeral and forbids file URLs as durable provenance',
  prompt.includes('runner-attested local bytes') && prompt.includes('all `file:` URLs are forbidden')
  && prompt.includes('durable payload/sidecar source URL'))
check('prompt ignores an agent-claimed host and derives the exact source host',
  buildPrompt(source, { ...verdict, host: 'attacker.example.com' }).includes('may fetch ONLY this host: api.gold.org'))

const wiltwSample: PipelineSourceRecord = {
  ...source, pipeline_id: 'PIPE-20260719-abcdef11',
  sample: 'What I Learned This Week — gold target 5,597', note: 'quarterly',
}
check('expanded WILTW title is identified in pasted connector sample',
  methodologyOnlyConnectorInput(wiltwSample, verdict) === 'sample')
let samplePromptRefused = false
try { buildPrompt(wiltwSample, verdict) } catch (error: any) {
  samplePromptRefused = /methodology-only WILTW input in sample/.test(String(error?.message || error))
}
check('buildPrompt refuses WILTW sample instead of embedding report figures', samplePromptRefused)
const sampleDispatch = await startConnectorDispatch(wiltwSample, verdict, 'boss@muns.io')
check('WILTW sample short-circuits before worktree/spawn',
  sampleDispatch.accepted === false && sampleDispatch.status === 'not_buildable'
  && /lawful original provider source/.test(sampleDispatch.message))

const wiltwFilename: PipelineSourceRecord = {
  ...source, pipeline_id: 'PIPE-20260719-abcdef12', sample: '', note: '',
  source_url: 'https://research.example.test/WILTW2026-07-30%20(1).pdf',
}
check('specific WILTW dated filename family is refused even without a pasted title',
  methodologyOnlyConnectorInput(wiltwFilename, verdict) === 'source_url')

const methodologyMarker: PipelineSourceRecord = {
  ...source, pipeline_id: 'PIPE-20260719-abcdef13', sample: '', note: '{"methodology_only":true}',
}
check('explicit methodology_only marker in a connector note is refused',
  methodologyOnlyConnectorInput(methodologyMarker, verdict) === 'note')

const lawfulReport: PipelineSourceRecord = {
  ...source, pipeline_id: 'PIPE-20260719-abcdef14',
  source_url: 'https://research.example.test/gold-market-research-report.pdf',
  sample: 'Lawfully licensed issuer holdings series, as reported by the original provider.',
  note: 'Ordinary research report with original-source provenance.',
}
check('ordinary lawful research report remains admissible to the connector prompt',
  methodologyOnlyConnectorInput(lawfulReport, verdict) === null
  && buildPrompt(lawfulReport, {
    ...verdict, host: 'untrusted-model-host.test', endpoint_hint: lawfulReport.source_url,
  }).includes('Ordinary research report with original-source provenance.'))

for (const [label, source_url] of [
  ['plain HTTP', 'http://api.gold.org/v1/cb'],
  ['private IP', 'https://127.0.0.1/v1/cb'],
  ['userinfo', 'https://user:password@api.gold.org/v1/cb'],
  ['nonstandard port', 'https://api.gold.org:8443/v1/cb'],
  ['query credential', 'https://api.gold.org/v1/cb?token=do-not-embed'],
] as const) {
  let refused = false
  try { buildPrompt({ ...source, source_url }, { ...verdict, endpoint_hint: source_url }) } catch (error: any) {
    refused = /public-DNS HTTPS URL without credentials/.test(String(error?.message || error))
  }
  check(`buildPrompt rejects ${label} before embedding it`, refused)
}

let disabledResolverCalls = 0
const hardDisabled = await startConnectorDispatch(source, verdict, 'boss@muns.io', async () => {
  disabledResolverCalls++
  return bindConnectorUrls(source.source_url, verdict.endpoint_hint)
})
check('hard-disabled dispatch returns before DNS/coverage/ledger/budget action',
  hardDisabled.accepted === false && hardDisabled.status === 'not_ready' && disabledResolverCalls === 0)

// The action-boundary isolation gate precedes even an ordinary non-buildable verdict; pure verdict behavior
// remains covered by buildPrompt/admission helpers without touching DNS or operational state.
const notBuildable = await startConnectorDispatch(source, { ...verdict, buildable: false }, 'boss@muns.io')
check('hard-disabled dispatch stays not_ready for an ordinary non-buildable verdict',
  notBuildable.accepted === false && notBuildable.status === 'not_ready')

let publicResolverCalls = 0
const publiclyResolved = await admitConnectorDispatchUrls(source, verdict, async (sourceUrl, endpointUrl) => {
  publicResolverCalls++
  return bindConnectorUrls(sourceUrl, endpointUrl)
})
check('async dispatch admission accepts an injected public resolver and preserves exact-host binding',
  publicResolverCalls === 1 && publiclyResolved?.source.host === 'api.gold.org'
  && publiclyResolved.endpoint.host === 'api.gold.org')
let mixedResolverCalls = 0
const mixedPrivate = await admitConnectorDispatchUrls(source, verdict, async () => {
  mixedResolverCalls++
  return null // production resolver returns null for any mixed global/private A/AAAA set
})
check('async dispatch admission rejects an injected mixed-private resolver before privileged action',
  mixedResolverCalls === 1 && mixedPrivate === null)

check('exact subject + matched need refuses an existing connector regardless of health',
  existingConnectorFor(source, verdict, [{ id: 'already-wired', subjects: ['GOLD'], satisfies: ['wgc-central-bank-buying'] }]) === 'already-wired')
check('another subject or another need does not trigger the duplicate guard',
  existingConnectorFor(source, verdict, [{ id: 'other', subjects: ['SILVER'], satisfies: ['wgc-central-bank-buying'] }]) === null
  && existingConnectorFor(source, verdict, [{ id: 'other', subjects: ['GOLD'], satisfies: ['another-need'] }]) === null)
const priorView: any = {
  ...source, status: 'pr_open', verdict, pr_url: 'https://github.com/nostra-demus/equity-research/pull/999',
  connector_id: 'pending-feed', last_note: '', last_update_at: source.submitted_at,
}
check('a persisted PR-open subject+need claim survives a process restart',
  persistedCoverageOwner(source, verdict, [{ ...priorView, pipeline_id: 'PIPE-20260719-abcdef02' }], () => 'OPEN')
    === 'PIPE-20260719-abcdef02')
check('a closed unmerged PR releases its persisted subject+need claim',
  persistedCoverageOwner(source, verdict, [{ ...priorView, pipeline_id: 'PIPE-20260719-abcdef02' }], () => 'CLOSED') === null)
check('a merged PR keeps the claim through the deploy gap',
  persistedCoverageOwner(source, verdict, [{ ...priorView, pipeline_id: 'PIPE-20260719-abcdef02' }], () => 'MERGED')
    === 'PIPE-20260719-abcdef02')

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
