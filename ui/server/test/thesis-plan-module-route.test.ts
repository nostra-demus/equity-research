// Focused source contract for the one-click research-module resume route. server.ts owns process startup,
// singleton locking, schedulers and a real listener, so importing it in a unit test would mutate production
// state. Existing route tests pin security/significant ordering from source for the same reason; the pure
// completion and stuck-run suites exercise the underlying plan/reaper behavior dynamically.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, '..', 'src', 'server.ts'), 'utf8')
const publicationGit = fs.readFileSync(path.join(here, '..', 'src', 'module-publication-git.ts'), 'utf8')
const supervisorPause = fs.readFileSync(path.join(here, '..', 'src', 'exact-module-supervisor-pause.ts'), 'utf8')
const schemaStart = source.indexOf('const ThesisPlanModuleBody = z.object({')
const schemaEnd = source.indexOf('\n})', schemaStart)
assert.ok(schemaStart > 0 && schemaEnd > schemaStart, 'module-resume request schema exists')
const schema = source.slice(schemaStart, schemaEnd)

assert.match(schema, /planVersion:\s*z\.literal\(2\)/,
  'rolling client/server skew fails closed on the versioned smart-resume contract')
assert.match(schema, /expectedWillRun:\s*z\.number\(\)\.int\(\)/,
  'the reviewed paid-orb count is required')
assert.match(schema, /expectedDoneOrbKeys:\s*z\.array\(/,
  'the exact reviewed reusable-orb identities are required, not inferred from a count')
assert.match(schema, /expectedTargetRunRoot:\s*z\.string\(\)\.regex\(/,
  'the reviewed dated run root is required across GET-to-POST midnight rollover')
assert.match(schema, /poolFiles:\s*z\.number\(\)\.int\(\)/,
  'pool file count is part of the evidence snapshot')
assert.match(schema, /poolNewestMs:\s*z\.number\(\)\.finite\(\)/,
  'pool freshness watermark is part of the evidence snapshot')
assert.match(schema, /sourceRunRoot:\s*z\.string\(\)\.regex\(/,
  'Continue carries the exact saved run root into module admission')

const routeStart = source.indexOf("app.post('/api/thesis-plan/module'")
const routeEnd = source.indexOf("\napp.post('/api/intake-plan/run'", routeStart)
assert.ok(routeStart > 0 && routeEnd > routeStart, 'module-resume route exists')
const route = source.slice(routeStart, routeEnd)

const lock = route.indexOf('withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker)')
const activeChain = route.indexOf('subjectChainActive(ticker, RESEARCH_SWARM_ID)', lock)
const reap = route.indexOf('reapDeadSubjectRuns(ticker, RESEARCH_SWARM_ID)', activeChain)
const busy = route.indexOf('const busy = listRuns()', reap)
const freshPlan = route.indexOf('let plan = await thesisPlanForRequest(ticker, undefined, exactResume ? undefined : reuse, exactResume ? module : undefined,', busy)
const targetRootCas = route.indexOf('plan.targetRunRoot !== expectedTargetRunRoot', freshPlan)
const poolCas = route.indexOf('plan.dataPool.files !== poolFiles || plan.dataPool.newestMs !== poolNewestMs', freshPlan)
const sealed = route.indexOf('if (plan.complete || isSealedResearchRun(plan.targetRunRoot))', poolCas)
const scopeCas = route.indexOf('const exactScopeChanged', sealed)
const cli = route.indexOf('await assertProviderAvailable(provider)', scopeCas)
const afterCliCas = route.indexOf('const scopeAfterCli = readCurrentScope()', cli)
const stage = route.indexOf('prepareModuleResume(ticker, module, undefined, plan)', afterCliCas)
const stagedScopeCas = route.indexOf('const preparedScopeChanged', stage)
const stagedFingerprint = route.indexOf('const preparedDiskScope = capturePreparedModuleResumeScope(', stagedScopeCas)
const publish = route.indexOf('const publication = await publishModuleResumeCheckpoint(', stagedScopeCas)
const publishFailure = route.indexOf('if (!publication.ok)', publish)
const afterPublishCas = route.indexOf('const scopeAfterPublish = moduleScopeGuard()', publishFailure)
const pause = route.indexOf('beginExactModuleSupervisorPause(expectedTargetRunRoot, module)', afterPublishCas)
const launch = route.indexOf('const out = await launch({', pause)
const boundFinalGuard = route.indexOf('preSpawnGuard: exactResume ? moduleScopeGuard : undefined', launch)
const snapshot = route.indexOf('for (const key of prep.doneOrbKeys)', launch)
const response = route.indexOf('return { ...out, module, willRun:', snapshot)

assert.ok(lock >= 0 && activeChain > lock && reap > activeChain && busy > reap,
  'inside the subject lock, a chain-gap reservation rejects before reaping/staging; then dead children are healed before the live check')
assert.ok(freshPlan > busy && targetRootCas > freshPlan && poolCas > targetRootCas,
  'target-root and pool CAS use the asynchronously hashed fresh plan built inside the mutation lock')
assert.match(route, /const readCurrentScope = \(\) => \{[\s\S]*thesisPlanForScopeGuard\(/,
  'the final no-await guard rechecks scope metadata without synchronously hashing large filing bytes')
assert.ok(sealed > poolCas && cli > sealed && afterCliCas > cli && stage > afterCliCas,
  'a same-day seal and CLI availability are checked, then exact scope is refreshed, before staging mutates disk')
assert.match(route, /plan\.complete \|\| isSealedResearchRun\(plan\.targetRunRoot\)/,
  'all authoritative seal markers block staging, even if final_thesis is missing')
assert.ok(scopeCas > sealed && cli > scopeCas,
  'initial exact orb-scope CAS completes before the awaited CLI probe')
assert.match(route, /const expectedDone = \[\.\.\.expectedDoneOrbKeys\]\.sort\(\)[\s\S]*const actualDone = \[\.\.\.entry\.doneOrbKeys\]\.sort\(\)[\s\S]*expectedDone\.some\(\(key, i\) => key !== actualDone\[i\]\)/,
  'same-count orb swaps are rejected by comparing sorted identities')
assert.match(route, /entry\.willRunAgents !== expectedWillRun \|\| exactScopeChanged/,
  'both the paid count and exact reusable set must still match')
assert.ok(stagedScopeCas > stage && stagedFingerprint > stagedScopeCas && publish > stagedFingerprint && publishFailure > publish
    && afterPublishCas > publishFailure && pause > afterPublishCas && launch > pause && boundFinalGuard > launch,
  'staging is checked and fingerprinted, checkpointed, checked again, then auto-full resume is paused before launch')
assert.match(route, /prep\.willRunAgents !== expectedWillRun[\s\S]*preparedDone\.some\(\(key, i\) => key !== expectedDone\[i\]\)/,
  'a staging discrepancy stops without starting a differently-scoped run')

assert.ok(launch > stage && snapshot > launch && response > snapshot,
  'staging precedes a module-only launch, whose reused orbs enter the registry before the response')
assert.match(route, /agent\.status = 'done'[\s\S]*agent\.outputPath = `\$\{plan\.targetRunRoot\}\/\$\{key\}\.md`/,
  'snapshot/reconnect sees reused orbs as done with their existing output paths')
assert.doesNotMatch(route, /launch\(\{ kind: 'full'/,
  'the one-module route cannot launch a full pipeline or downstream modules')
assert.match(route, /const graphModule = graphForTicker\(ticker\)\.modules\.find\(\(m\) => m\.name === module\)[\s\S]*const exactResume = graphModule\?\.exactResume === true/,
  'smart paid-scope behavior is a self-declared module capability, never a hardcoded module name')
assert.match(route, /const expectedInputs = \[\.\.\.\(plan\.exactModuleScope\?\.savedInputs \?\? \[\]\)\]\.sort\(\)[\s\S]*requestedInputs\.some\(\(name, index\) => name !== expectedInputs\[index\]\)/,
  'the POST accepts only the server-selected exact input set, never arbitrary browser-nominated modules')
assert.match(route, /const currentExactInputs = \[\.\.\.\(current\.exactModuleScope\?\.savedInputs \?\? \[\]\)\]\.sort\(\)[\s\S]*exactInputsStillMatch[\s\S]*currentEntry\.willRunAgents === expectedWillRun/,
  'the saved-input identities are re-derived and pinned across every late paid-scope check')
assert.match(route, /const exactArtifactScopeFor[\s\S]*!agent\.isSynthesis && !done\.has\(agent\.key\)[\s\S]*agent\.isSynthesis/,
  'the server derives exact writable specialists and the current synthesis from roster + reusable disk truth')
assert.match(route, /deferModuleMemo: exactResume,[\s\S]*exactModuleResume: exactResume,[\s\S]*exactModuleInputs: exactResume \? prep\.reusedAncestorModules : undefined,[\s\S]*exactModuleRunRoot: exactResume \? expectedTargetRunRoot : undefined,[\s\S]*preSpawnGuard: exactResume \? moduleScopeGuard : undefined/,
  'only an exact-capable child receives the staged inputs, immutable target root, and final paid-boundary guard')
assert.match(route, /exactLaunchArtifacts = preparedExactArtifacts[\s\S]*exactModuleWritableOrbs: exactLaunchArtifacts\?\.writableOrbs,[\s\S]*exactModuleSynthesisOrbs: exactLaunchArtifacts\?\.synthesisOrbs/,
  'the launch-private receipt contains only planned non-reused specialists plus the current 99')
const terminalGuardBody = route.slice(route.indexOf('const terminalGuard = exactResume'), route.indexOf('const out = await launch({'))
assert.match(terminalGuardBody, /active\?\.publicationCompleted === true[\s\S]*active\.runRoot === expectedTargetRunRoot[\s\S]*active\.module === module/,
  'a clean exact child is not reported done until the trusted supervisor published its exact target module')
assert.doesNotMatch(terminalGuardBody, /publishModuleResumeCheckpoint|writePendingModulePublication|clearPendingModulePublication/,
  'the post-publication guard cannot start a second direct Git publication after supervisor intent drain')
assert.match(route, /beginExactModuleSupervisorPause\(expectedTargetRunRoot, module\)[\s\S]*settleExactModuleSupervisorPause\(supervisorPause, status, paidChildStarted\)[\s\S]*const exactOnTerminal[\s\S]*onTerminal: exactOnTerminal/,
  'exact admission consumes a stale full-resume marker; Stop/paid children keep suppression and no-child failures roll it back')
assert.match(supervisorPause, /O_NOFOLLOW[\s\S]*renameSync/,
  'exact-module supervisor suppression uses non-following, atomic marker I/O')
assert.match(supervisorPause, /snapshotMarker\(root, '\.interrupted'\)[\s\S]*snapshotMarker\(root, '\.aborted'\)[\s\S]*atomicWriteMarkerBody\(root, '\.aborted'[\s\S]*safeClearMarker\(root, '\.interrupted'\)/,
  'both leaves are snapshotted before the durable excluding marker is written and stale intent is cleared')
assert.match(route, /if \(!publication\.ok\)[\s\S]*code: 'ancestor_publish_failed'[\s\S]*const scopeAfterPublish = moduleScopeGuard\(\)/,
  'a checkpoint failure returns before launch; no paid child can start from unpublished staged inputs')
assert.match(route, /current\.dataPool\.files === poolFiles[\s\S]*current\.dataPool\.newestMs === poolNewestMs[\s\S]*currentEntry\.willRunAgents === expectedWillRun[\s\S]*currentDone\.every/,
  'the reusable identities, paid count, and pool snapshot are all re-read by the shared late guard')
assert.match(route, /capturePreparedModuleResumeScope\([\s\S]*expectedTargetRunRoot[\s\S]*expectedDone[\s\S]*expectedAncestorModules[\s\S]*staged\?\.fingerprint === expectedStagedFingerprint/,
  'the late/final guard reads exact target-root bytes; historical fallback cannot hide a staged deletion or edit')

const publisherStart = source.indexOf('async function publishModuleResumeCheckpoint(')
assert.ok(publisherStart > 0 && publisherStart < routeStart, 'localized resume-checkpoint publisher exists')
const publisher = source.slice(publisherStart, routeStart)
assert.match(publisher, /new Set\(\[\.\.\.reusedAncestorModules, module\]\)/,
  'checkpoint scope is the exact reused ancestors plus the staged target module, never the whole run root')
assert.match(publisher, /const script = path\.join\(REPO_ROOT, 'scripts', 'commit-run\.sh'\)/,
  'checkpoint publication uses the repository data-commit helper')
assert.match(publisher, /await execa\('bash', \[[\s\S]*script,[\s\S]*'--',[\s\S]*\.\.\.pathspecs/,
  'the exact pathspec checkpoint is awaited through the serialized data publisher')
assert.match(publisher, /ensureModuleResumeCheckpointPublished\(script, pathspecs, helperAttempt\)/,
  'exit 0/NOOP is not publication proof until the exact pathspecs match origin/main')
assert.match(publisher, /catch \(e: any\)[\s\S]*helperAttempt \?\?=[\s\S]*ensureModuleResumeCheckpointPublished\(script, pathspecs, helperAttempt\)[\s\S]*return \{ ok: true, paths: pathspecs \}/,
  'an exit-4 local commit gets one exact retry-and-origin proof instead of stranding completed work')
assert.match(source, /async function ensureModuleResumeCheckpointPublished[\s\S]*retryBoundModulePublication\([\s\S]*moduleResumeCheckpointMatchesOrigin\(pathspecs\)/,
  'a prior local-only checkpoint is retried through the bound receipt helper and then re-proven against origin')
assert.match(source, /moduleResumeCheckpointMatchesOrigin\(pathspecs\)[\s\S]*process\.env\.ENGINE_NO_PUSH === '1'\) return false[\s\S]*retryBoundModulePublication/,
  'a validation server fails closed before retry-push and cannot publish a local-only checkpoint')
assert.match(publicationGit, /COMMIT_SHA=[\s\S]*attempt\?\.exitCode === 0 && lines\.includes\('NOOP=1'\)/,
  'only a helper-emitted SHA or successful NOOP receipt can select a retry commit')
assert.match(publicationGit, /head\.stdout\.trim\(\) !== revision[\s\S]*'diff', '--quiet', revision[\s\S]*'ls-files', '--others'[\s\S]*'ls-files', '--others', '--ignored'/,
  'retry proves HEAD identity plus tracked, untracked, and ignored target-path state before push')
assert.match(publicationGit, /if \(!candidate \|\| !await modulePathspecStateMatchesRevision[\s\S]*'--retry-push', candidate/,
  'a failed path-state proof returns before the retry-push helper can run')
assert.match(source, /'diff', '--quiet', 'origin\/main'[\s\S]*'ls-files', '--others'[\s\S]*'ls-files', '--others', '--ignored'/,
  'publication proof rejects tracked differences plus untracked or ignored checkpoint bytes')
assert.match(publisher, /if \(!pathspecs\.length\) return \{ ok: true, paths: \[\] \}/,
  'a genuinely missing clean module with no copied ancestors does not call git or fail spuriously')

const publishRetryStart = source.indexOf("app.post('/api/thesis-plan/module/publish'")
const publishRetryEnd = source.indexOf("app.post('/api/thesis-plan/module'", publishRetryStart + 1)
assert.ok(publishRetryStart > 0 && publishRetryEnd > publishRetryStart, 'publish-only module recovery route exists')
const publishRetry = source.slice(publishRetryStart, publishRetryEnd)
assert.match(publishRetry, /subjectChainActive\(ticker, RESEARCH_SWARM_ID\)[\s\S]*const releasePublication = acquireModulePublicationLease\(ticker\)/,
  'publish-only recovery rejects an active chain gap before acquiring a writer lease or touching Git')
assert.match(publishRetry, /const releasePublication = acquireModulePublicationLease\(ticker\)[\s\S]*const busy = listRuns\(\)[\s\S]*finally \{[\s\S]*releasePublication\(\)/,
  'publish retry claims the subject before its busy check and releases the lease on every return')
assert.match(publishRetry, /readPendingModulePublication\(ticker, module\)[\s\S]*marker\.targetRunRoot !== targetRunRoot \|\| marker\.fingerprint !== expectedFingerprint/,
  'publish retry requires the exact durable root+fingerprint receipt')
assert.match(publishRetry, /const before = captureCompletedModuleFingerprint\([\s\S]*before !== expectedFingerprint[\s\S]*publishModuleResumeCheckpoint\(ticker, targetRunRoot, module, \[\]\)/,
  'current completed bytes are re-hashed before the publisher can run')
assert.match(publishRetry, /const after = captureCompletedModuleFingerprint\([\s\S]*after !== expectedFingerprint[\s\S]*clearPendingModulePublication\(/,
  'the receipt clears only when the same bytes remain after origin-proven publication')
assert.match(publishRetry, /if \(!publication\.ok\)[\s\S]*code: 'module_publish_failed'/,
  'publication failure returns without clearing the durable retry receipt')
assert.doesNotMatch(publishRetry, /\blaunch\s*\(/,
  'publish retry cannot launch an LLM or spend')
assert.doesNotMatch(publishRetry, /assertClaudeCli/,
  'publish retry does not even probe the paid engine CLI')
assert.match(source, /validPendingModulePublication\(q\.ticker, entry\.module\)[\s\S]*entry\.publicationPending = \{[\s\S]*targetRunRoot: pending\.targetRunRoot,[\s\S]*fingerprint: pending\.fingerprint/,
  'GET thesis-plan exposes only a current-byte-valid publish receipt on the module entry')

const launcher = fs.readFileSync(path.join(here, '..', 'src', 'launcher.ts'), 'utf8')
assert.match(launcher, /assertNoModulePublicationInFlight\(swarmId, subjectId\)[\s\S]*reapAllDeadRuns\(\)[\s\S]*assertNoModulePublicationInFlight\(swarmId, subjectId\)[\s\S]*const decision = admitRun/,
  'internal launches check the publish-only writer lease before mutations and again after force awaits')
assert.match(launcher, /if \(params\.deferModuleMemo\) deferredModuleMemoRuns\.add\(run\)/,
  'the smart launch binds memo deferral to only its admitted RunState')
assert.match(launcher, /if \(exactResumeBinding\) \{[\s\S]*exactModuleResumeRuns\.add\(run\)/,
  'the smart launch binds exact current-run input resolution to only its admitted RunState')
assert.match(launcher, /exactModuleRunRootByRun\.set\(run, exactResumeBinding\.runRoot\)/,
  'the smart launch binds its immutable target root to only its admitted RunState')
assert.match(launcher, /exactModuleArtifactScopeByRun\.set\(run,[\s\S]*module: exactResumeBinding\.module[\s\S]*writableOrbs: exactModuleWritableOrbs[\s\S]*synthesisOrbs: exactModuleSynthesisOrbs/,
  'the admitted exact artifact receipt is launch-private and bound to that RunState')
assert.match(launcher, /applyRunPolicyEnv[\s\S]*deferModuleMemo: deferredModuleMemoRuns\.has\(run\),[\s\S]*exactModuleResume: exactModuleResumeRuns\.has\(run\),[\s\S]*exactModuleInputs: exactModuleInputsByRun\.get\(run\),[\s\S]*exactModuleRunRoot: exactModuleRunRootByRun\.get\(run\)/,
  'only that RunState passes memo deferral, exact-input policy, and immutable root to its paid child')
assert.match(launcher, /exactModuleName: scope\?\.module,[\s\S]*exactModuleWritableOrbs: scope\?\.writableOrbs,[\s\S]*exactModuleSynthesisOrbs: scope\?\.synthesisOrbs/,
  'the real paid child receives module, specialist, and synthesis receipts from its admitted RunState')
assert.match(launcher, /delete env\[key\][\s\S]*if \(options\.deferModuleMemo\) env\[DEFER_MODULE_MEMO_ENV\] = '1'/,
  'ordinary children strip an ambient flag and only an explicit smart launch adds it back')
assert.match(launcher, /if \(!options\.exactModuleResume\) return env[\s\S]*env\[EXACT_MODULE_RESUME_ENV\] = '1'/,
  'ordinary children cannot fall back to an unstaged historical optional input')
assert.match(launcher, /const rawInputs = options\.exactModuleInputs[\s\S]*validStrings\(rawInputs,[\s\S]*env\[EXACT_MODULE_INPUTS_ENV\] = \[\.\.\.new Set\(rawInputs\)\]\.sort\(\)\.join\(','\)/,
  'the paid child receives only the sorted, checkpointed module-input allowlist')
assert.match(launcher, /const root = typeof options\.exactModuleRunRoot[\s\S]*env\[EXACT_MODULE_RUN_ROOT_ENV\] = root/,
  'an ambient run-root binding is stripped and only the reviewed immutable root reaches the child')
assert.match(launcher, /const module = typeof options\.exactModuleName[\s\S]*env\[EXACT_MODULE_NAME_ENV\] = module[\s\S]*env\[EXACT_MODULE_WRITABLE_ORBS_ENV\][\s\S]*env\[EXACT_MODULE_SYNTHESIS_ORBS_ENV\]/,
  'ambient destructive receipts are scrubbed and only the reviewed exact artifacts are restored')
assert.match(launcher, /exactModuleRunRootBinding\(subjectId, exactModuleRunRoot, runRoot\) === null[\s\S]*code: 'module_scope_changed'/,
  'a midnight rollover before admission cannot replace the route-reviewed target root')
assert.match(launcher, /if \(params\.preSpawnGuard\) preSpawnGuards\.set\(run, params\.preSpawnGuard\)/,
  'the route callback is bound only to its admitted RunState')
assert.match(launcher, /params\.exactModuleResume[\s\S]*exactModuleInputs\.map\(\(name\) => path\.join\(REPO_ROOT, runRoot, name\)\)/,
  'every checkpointed input folder is held as a directory read claim for the full paid run')
const launchSpecBuilt = launcher.indexOf('launchSpec = await adapter.buildLaunch({')
const finalGuard = launcher.indexOf('const guarded = evaluatePreSpawnGuard(preSpawnGuards.get(run))', launchSpecBuilt)
const paidSpawn = launcher.indexOf('child = execa(launchSpec.command, launchSpec.args, {', finalGuard)
assert.ok(launchSpecBuilt > 0 && finalGuard > launchSpecBuilt && paidSpawn > finalGuard,
  'the scope callback executes after delayed provider launch construction and immediately before the paid child')
assert.match(launcher.slice(finalGuard, paidSpawn), /if \(!guarded\.ok\)[\s\S]*finishRun\(run, 'error'\)[\s\S]*return/,
  'a final-boundary mismatch finalizes without reaching execa')

const exactLaunchStart = source.indexOf("app.post('/api/launch/exact'")
const ordinaryLaunchStart = source.indexOf("app.post('/api/launch'", exactLaunchStart)
const runStreamStart = source.indexOf("app.get('/api/runs/:runId/stream'", ordinaryLaunchStart)
const exactLaunch = source.slice(exactLaunchStart, ordinaryLaunchStart)
const ordinaryLaunch = source.slice(ordinaryLaunchStart, runStreamStart)
assert.match(exactLaunch, /withSubjectLock\(subjectMutationLockKey\(swarmId, subject\)/,
  'an exact orb rerun cannot enter while smart staging holds the subject mutation lock')
assert.match(ordinaryLaunch, /withSubjectLock\(subjectMutationLockKey\(RESEARCH_SWARM_ID, ticker\)/,
  'ordinary research orb/module/full launches cannot race smart staging or sweep its files into a checkpoint')
assert.match(ordinaryLaunch, /e instanceof SubjectBusyError[\s\S]*code: 'subject_busy'/,
  'a launch rejected by the staging reservation gets the ordinary actionable busy response')

const pipeline = fs.readFileSync(path.join(here, '..', '..', '..', 'frameworks', 'MODULE_PIPELINE.md'), 'utf8')
assert.match(pipeline, /test "\$\{NOSTRA_DEFER_MODULE_MEMO:-\}" = "1"/,
  'the shared module pipeline recognizes the child-only deferral flag')
assert.match(pipeline, /deferral suppresses ONLY the memo: always still do Step 4\.9B \(the deterministic dossier\)/,
  'smart deferral cannot suppress the synthesis or deterministic dossier')
assert.match(pipeline, /Exact-resume paid-scope override[\s\S]*exactly ONE Task dispatch[\s\S]*Do not re-dispatch an agent[\s\S]*reviewed `willRun` count literal/,
  'an exact resume cannot widen its paid receipt with a hidden recovery Task')

const governanceCommand = fs.readFileSync(path.join(
  here, '..', '..', '..', '.claude', 'commands', 'research', 'management-governance.md',
), 'utf8')
const governanceSynthesis = fs.readFileSync(path.join(
  here, '..', '..', '..', '.claude', 'agents', 'management-governance', '99_management-governance-synthesis.md',
), 'utf8')
assert.match(governanceSynthesis, /^exact_resume: true$/m,
  'management governance declares the immutable-root command capability in its own frontmatter')
assert.match(governanceCommand, /One-click exact resume[\s\S]{0,400}NOSTRA_EXACT_MODULE_INPUTS[\s\S]{0,400}never fall back across dated folders/,
  'the exact child resolves every optional cross-module input from its checkpointed current run only')
assert.match(governanceCommand, /NOSTRA_EXACT_MODULE_RESUME=1[\s\S]{0,300}do not call `date`[\s\S]{0,500}NOSTRA_EXACT_MODULE_RUN_ROOT[\s\S]{0,500}RUN_ROOT="\$EXACT_RUN_ROOT"/,
  'an exact command derives its date and root from the immutable child binding, never from a post-spawn wall clock')
assert.match(governanceCommand, /\[ "\$EXACT_RUN_ROOT" != "analyses\/\$\{ARGUMENTS\}_\$\{DATE\}" \][\s\S]{0,300}exit 1/,
  'the command fails closed when the immutable root does not match the launched ticker and date shape')
assert.match(governanceCommand, /EXACT_INPUTS=",\$\{NOSTRA_EXACT_MODULE_INPUTS:-\},"[\s\S]*case "\$EXACT_INPUTS" in \*,balance-sheet-survival,\*\)[\s\S]*\*\) BALANCE_SHEET_SURVIVAL_PATH=""/,
  'an unlisted same-day partial balance-sheet folder is ignored, not consumed outside the checkpoint')
assert.match(governanceCommand, /Exact-resume synthesis gate[\s\S]*Task call returned an error[\s\S]*--quarantine-exact-synthesis[\s\S]*STOP before step 6B or step 7/,
  'a failed or invalid exact 99 is mechanically removed before any sidecar extraction or commit')

for (const file of [
  '10_contingent-liabilities-and-commitments.md',
  '11_accounting-forensics.md',
]) {
  const prompt = fs.readFileSync(path.join(
    here, '..', '..', '..', '.claude', 'agents', 'management-governance', file,
  ), 'utf8')
  assert.match(prompt, /NOSTRA_EXACT_MODULE_RESUME=1[\s\S]{0,400}NOSTRA_EXACT_MODULE_INPUTS[\s\S]{0,300}never (?:search|read) a prior run/,
    `${file} cannot independently bypass the checkpoint with a prior balance-sheet folder`)
}

console.log('thesis-plan module route: CLI-first staging + exact checkpoint + late/final scope CAS + paid-child scope passed')
