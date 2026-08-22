// Shared data/<SUBJECT> producer gates. Static on purpose: importing server.ts would listen on a real
// port and start background schedulers. Pure ownership outcomes live in shared-data-owner.test.ts; this
// pins each HTTP boundary's fail-closed ordering around multipart reads and pool mutations.
// Run: npx tsx test/shared-pool-producers.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const server = fs.readFileSync(path.join(here, '..', 'src', 'server.ts'), 'utf8')
const launcher = fs.readFileSync(path.join(here, '..', 'src', 'launcher.ts'), 'utf8')
const router = fs.readFileSync(path.join(here, '..', '..', '..', '.claude', 'tools', 'ingest_external.py'), 'utf8')

function route(startNeedle: string, endNeedle: string): string {
  const start = server.indexOf(startNeedle)
  const end = server.indexOf(endNeedle, start + startNeedle.length)
  assert.ok(start >= 0 && end > start, `route slice exists: ${startNeedle}`)
  return server.slice(start, end)
}

const companyUpload = route("app.post('/api/tickers/:ticker/files'", "// ---------- data status ----------")
assert.ok(companyUpload.indexOf('manualPoolOwnerError(RESEARCH_SWARM_ID, ticker)')
  < companyUpload.indexOf('for await (const part of req.parts())'),
'the standard company upload rejects commodity/ambiguous finished owners before multipart consumption')

const selectedUpload = route("app.post('/api/data-needs/:subject/upload'", 'const DataNeedUploadStatusQuery')
const initialOwner = selectedUpload.indexOf('const initialOwner = selectedManualUploadOwner(swarmId, subject)')
const multipart = selectedUpload.indexOf('for await (const part of req.parts(')
const binding = selectedUpload.indexOf('const binding = {')
const boundOwner = selectedUpload.indexOf('const boundOwner = selectedManualUploadOwner(swarmId, subject, binding.run_root)')
const commit = selectedUpload.indexOf('committed = await commitDataNeedUpload(')
const terminalOwner = selectedUpload.indexOf('const terminalOwner = selectedManualUploadOwner(swarmId, subject, binding.run_root)', commit)
assert.ok(initialOwner >= 0 && initialOwner < multipart,
  'a selected manual upload requires one matching finished owner before reading multipart bytes')
assert.ok(binding < boundOwner && boundOwner < commit,
  'the parsed run root is compared with the sole owner before staging an intent')
assert.match(selectedUpload.slice(boundOwner, commit), /initialOwner\.owner\.runRoot !== boundOwner\.owner\.runRoot/,
  'the post-multipart owner must equal the pre-multipart owner')
assert.ok(terminalOwner > commit,
  'commitDataNeedUpload receives a terminal live-owner callback')
assert.match(selectedUpload.slice(terminalOwner), /terminalOwner\.owner\.runRoot !== initialOwner\.owner\?\.runRoot/,
  'the callback rechecks exact owner/run-root equality immediately before intent visibility')

const launchRoute = route("app.post('/api/launch'", "app.post('/api/runs/:runId/cancel'")
const launchHandoff = launchRoute.slice(launchRoute.indexOf("if (kind === 'handoff')"))
assert.ok(launchHandoff.indexOf('manualPoolOwnerError(RESEARCH_SWARM_ID, parsed.data.ticker)')
  < launchHandoff.indexOf('return await launch('),
'the generic handoff route checks its research destination before launch')
assert.match(launchHandoff, /sharedPoolTarget: \{ swarm: RESEARCH_SWARM_ID, subject: parsed\.data\.ticker \}/,
  'the generic handoff carries its target into launcher TOCTOU protection')

const dedicatedHandoff = route("app.post('/api/screener/handoff'", '// ---------- the news wire')
const dedicatedOwnerGuard = dedicatedHandoff.indexOf('manualPoolOwnerError(RESEARCH_SWARM_ID, parsed.data.ticker)')
const dedicatedLaunch = dedicatedHandoff.indexOf("kind: 'handoff', ticker: parsed.data.ticker")
assert.ok(dedicatedOwnerGuard >= 0 && dedicatedLaunch >= 0 && dedicatedOwnerGuard < dedicatedLaunch,
'the dedicated handoff route checks its research destination before launch')
assert.match(dedicatedHandoff, /sharedPoolTarget: \{ swarm: RESEARCH_SWARM_ID, subject: parsed\.data\.ticker \}/,
  'the dedicated handoff also carries a live target binding')

const send = route("app.post('/api/screener/event/:eventId/send-to-research'", '// Live wire:')
const resolveInitial = send.indexOf('const initialOwner = resolveSwarmForSubject(ticker)')
const lock = send.indexOf('withSubjectLock(subjectMutationLockKey(initialOwner.swarm, ticker)')
const resolveInside = send.indexOf('const owner = resolveSwarmForSubject(ticker)', lock)
const bridge = send.indexOf('const res = bridgeEventToSubject(', resolveInside)
const analyze = send.indexOf("await launch({ kind: 'doc-intake'", bridge)
assert.ok(resolveInitial >= 0 && resolveInitial < lock && lock < resolveInside && resolveInside < bridge && bridge < analyze,
  'send-to-research holds one swarm-qualified lock across owner CAS, note publication, and intake launch')
assert.match(send.slice(resolveInside, bridge), /owner\.decisionFingerprint !== initialOwner\.decisionFingerprint/,
  'send-to-research compares the whole standing owner identity inside the lock')

const acquireTarget = launcher.indexOf('releaseTargetPoolClaim = acquireSharedDataPoolClaim(')
const firstMutation = launcher.indexOf('reapAllDeadRuns()', acquireTarget)
assert.ok(acquireTarget >= 0 && acquireTarget < firstMutation,
  'a handoff target is synchronously reserved before registry/filesystem mutation')
assert.match(launcher, /const target = sharedPoolTargetByRun\.get\(run\)[\s\S]*listFinishedIntakeOwners\(target\.subject\)/,
  'the target owner is re-resolved by the pre-execa launch-boundary probe')

const authority = router.indexOf('authorized, authority_reason = _manual_authority(authority, intent)',
  router.indexOf('while True:', router.indexOf('def _route_manual_snapshot')))
const sidecar = router.indexOf('_write_json_safe(sidecar_path, sidecar, pool)', authority)
assert.ok(authority >= 0 && authority < sidecar,
  'the async Python router performs terminal owner/decision CAS before publishing a provenance sidecar')
assert.match(router.slice(authority, sidecar), /return \("waiting", intent\["request_id"\], authority_reason\)/,
  'owner ambiguity leaves the signed request staged instead of minting a terminal failure')

console.log('shared-pool-producers: all checks passed')
