process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { REPO_ROOT, STATE_DIR } from '../src/config'
import {
  EXECUTION_PROVENANCE_RECEIPT as EXECUTION_RECEIPT_NAME, artifactIsFresh, beginExecutionAttempt, canonicalManifestPath, executionEpochAttemptCount,
  projectionLineageRows, readLastProviderSelection, readProviderInterruptionAuthority, readProviderPreSpawnFailureAuthority,
  readPublicationSchemaContract,
  recordAdmittedProviderSelection, releaseExecutionEpochAfterPublication,
  sealProviderPreSpawnFailureAuthority,
} from '../src/execution-provenance'
import { createRun, finishRun, type RunState } from '../src/registry'
import { writeRunMarker } from '../src/outputs'
import {
  __setPostReviewCalibration, __setPublicationAuthoritySealer, __setSupersededPublicationProbe,
  __setSupervisorCommitter, __setSupervisorCommitVerifier,
  SUPERVISOR_CONTROL_MARKERS, supersededPublicationPaths, drainPublicationIntents, finalizeRunOnClose, listReadyPublicationFailures, listSupersededReadyPublications, queuePublicationIntent, recoverReadyPublications, requiresSupervisorPublication,
  supervisePublication, trackedTerminalDeletionDisposition,
} from '../src/launcher'

if (process.env.ENGINE_SCHEMA_ACCEPTANCE_CHILD === '1') {
  await schemaAcceptanceChild()
  process.exit(0)
}
if (process.env.ENGINE_SCHEMA_ACCEPTANCE_ONLY === '1') {
  await isolatedSchemaAcceptance()
  process.exit(0)
}

const resumedDeletion = {
  kind: 'rerun' as const, swarmId: 'research', chained: true,
  runRoot: 'analyses/NU_2026-08-31',
}
assert.equal(trackedTerminalDeletionDisposition(
  resumedDeletion, 'analyses/NU_2026-08-31/valuation/valuation_dossier.md',
), 'restore', 'a resumed run retains older tracked files absent from its saved source')
assert.equal(trackedTerminalDeletionDisposition(
  { ...resumedDeletion, runRoot: 'analyses\\NU_2026-08-31' },
  'analyses\\NU_2026-08-31\\valuation\\valuation_dossier.md',
), 'restore', 'run-root containment is stable across path separators')
assert.equal(trackedTerminalDeletionDisposition(
  resumedDeletion, 'analyses/NU_2026-08-31/RUN_FAILURE.md',
), 'allow', 'the exact stale failure note remains the sole legitimate terminal deletion')
assert.equal(trackedTerminalDeletionDisposition(
  resumedDeletion, 'analyses/OTHER_2026-08-31/valuation/valuation_dossier.md',
), 'forbid', 'a continuation cannot restore or delete another run root')

assert.equal(requiresSupervisorPublication('full'), true)
assert.equal(requiresSupervisorPublication('module'), true)
assert.equal(requiresSupervisorPublication('rerun'), true)
assert.equal(requiresSupervisorPublication('agent'), false)
assert.equal(requiresSupervisorPublication('screener-agent'), false)
assert.equal(requiresSupervisorPublication('parity'), false)
assert.equal(requiresSupervisorPublication('module', 'module'), false,
  'a frozen intermediate child must not enter the terminal publication protocol')
assert.equal(requiresSupervisorPublication('full', 'final'), true,
  'the frozen terminal adjudicator must stamp and verify its decision before success')

// The snapshot sweep drops supervisor control markers, and the pre-seal check refuses anything else the
// data catalogue does not cover. In a RESEARCH run root (analyses/<RUN>/) the catalogue lists exact file
// names, and the two must agree there: a name may be dropped only while the catalogue rejects it. If the
// catalogue ever lists one by name, dropping it would silently withhold catalogued data, so fail here and
// force the decision instead. This says nothing about blanket-glob stores (commodity/runs/**,
// screener/runs/**), which accept any file name; scripts/test_commit_run.py pins that gap on purpose.
assert.ok(SUPERVISOR_CONTROL_MARKERS.size > 0, 'the control-marker guard must never scan an empty set')
for (const marker of SUPERVISOR_CONTROL_MARKERS) {
  const verdict = spawnSync('python3', [
    path.join(REPO_ROOT, 'scripts', 'validate_data_catalogue.py'), '--repo', REPO_ROOT, '--paths',
  ], { cwd: REPO_ROOT, input: `analyses/ZZGUARD_2099-01-01/${marker}`, encoding: 'utf8' })
  assert.equal(verdict.status, 1, `validator must reach a verdict for ${marker}: ${verdict.stderr}`)
  assert.match(verdict.stderr, /has uncatalogued data/,
    `${marker} is excluded from publication as control state, so a research run root must not catalogue it`)
}

// The supervisor applies commit-run.sh's creation-time gate to every NEW analyses/<RUN>/decision_record.json
// before it seals a snapshot, so a fixture that is meant to publish must be a record that gate accepts.
// These three fields are the minimum: the same shape scripts/test_commit_run.py uses for a valid record.
const decisionFixture = (fields: Record<string, unknown>): string => JSON.stringify({
  decision_date: '2099-01-01', data_needs_schema_version: '2.0', data_needs: [], ...fields,
}) + '\n'

// Reuse the canonical complete screener fixtures: publication tests must satisfy the real schemas,
// rather than keeping a minimal fake thesis and weakening admission to accommodate it.
function screenerFixture(name: 'intake' | 'signal_payload' | 'thesis_record' | 'thesis_integrity_review' | 'candidates', signalId: string): any {
  const fixtureId = 'SIG-20260610-a3f2c81d'
  const sourceRoot = process.env.ENGINE_SCHEMA_ACCEPTANCE_SOURCE_ROOT || REPO_ROOT
  return JSON.parse(fs.readFileSync(path.join(sourceRoot, 'screener', 'runs', fixtureId, `${name}.json`), 'utf8')
    .replaceAll(fixtureId, signalId))
}

// Run the real writers and no-push commit helper in a private, small repository. The committer seam
// supplies the hermetic helper environment; schema/snapshot admission and the default verifier run.
// This does not establish validation before an earlier deterministic writer's own writes.
async function isolatedSchemaAcceptance(): Promise<void> {
  const outputs = path.join(REPO_ROOT, '.cache', 'test-output')
  fs.mkdirSync(outputs, { recursive: true })
  // Intentionally retain this ignored checkout-local fixture on pass and failure: its acceptance
  // report, frozen packets and real Git evidence must remain available for inspection.
  const fixtureRoot = fs.mkdtempSync(path.join(outputs, 'publication-schema-acceptance-'))
  const copy = (relative: string) => {
    const target = path.join(fixtureRoot, relative)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(path.join(REPO_ROOT, relative), target)
  }
  // The local import closure is under 1 MiB; there is no dependency/source-tree copy.
  for (const name of [
    'canonical_json', 'commodity_decision_archive', 'commodity_evidence_links',
    'commodity_forecast_contract', 'commodity_profile_coverage', 'connector_contract',
    'connector_vintages', 'corrections_prewrite_gate', 'data_need_contract', 'decision_publication_gate',
    'execution_provenance', 'ledger_records', 'market_prices', 'recover_idea_board_history',
    'repo_mutation', 'screener_emit_checkpoints', 'supersession_integrity_checks',
    'supervisor_publication', 'update_board_index', 'validate_data_catalogue', 'validate_screener_json',
  ]) copy(`scripts/${name}.py`)
  copy('scripts/append-ndjson.sh')
  copy('scripts/commit-run.sh')
  copy('.claude/agents/screener/SWARM.md')
  const futureManifest = path.join(fixtureRoot, '.claude', 'agents', 'schema-future', 'SWARM.md')
  fs.mkdirSync(path.dirname(futureManifest), { recursive: true })
  fs.writeFileSync(futureManifest, [
    '---', 'id: schema-future', 'unit: signal', 'run_root_template: screener/future-runs/{SIG_ID}',
    'placeholder: SIG_ID', 'runs_root: screener/future-runs', 'decision_artifacts: [signal_payload.json]',
    'schemas_root: frameworks/screener', 'publication_schemas:',
    '  - "run:signal_payload.json=signal_payload.schema.json"', 'publication_auxiliary_roots:',
    '  - "review=screener/future-reviews/REV-*"', '---', '',
  ].join('\n'))
  copy('frameworks/memory/phase0/catalogue.json')
  for (const name of fs.readdirSync(path.join(REPO_ROOT, 'frameworks', 'screener')))
    if (name.endsWith('.schema.json')) copy(`frameworks/screener/${name}`)
  fs.writeFileSync(path.join(fixtureRoot, '.gitignore'), '.cache/\n__pycache__/\n')
  const git = (...args: string[]) => {
    const result = spawnSync('git', args, { cwd: fixtureRoot, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    return result.stdout.trim()
  }
  git('init', '--quiet')
  git('config', 'user.name', 'Schema Fixture')
  git('config', 'user.email', 'schema-fixture@example.invalid')
  git('config', 'commit.gpgsign', 'false')
  git('config', 'core.hooksPath', '/dev/null')
  git('add', '.')
  // This is an isolated fixture commit, never a commit in the actual checkout or its branch.
  git('-c', 'user.name=Schema Fixture', '-c', 'user.email=schema-fixture@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'fixture program')
  const source = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' })
  assert.equal(source.status, 0, source.stderr)
  const status = await new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url)], {
      cwd: fixtureRoot, stdio: 'inherit', env: {
        ...process.env, ENGINE_TEST_RUN: '1', ENGINE_ACTIVITY_LOG_DISABLED: '1',
        ENGINE_SCHEMA_ACCEPTANCE_CHILD: '1', ENGINE_SCHEMA_ACCEPTANCE_SOURCE_ROOT: REPO_ROOT,
        ENGINE_SCHEMA_ACCEPTANCE_SOURCE_SHA: source.stdout.trim(), ENGINE_REPO_ROOT: fixtureRoot,
        ENGINE_STATE_DIR: path.join(fixtureRoot, '.cache', 'state'),
        ENGINE_TEST_RUN_VIOLATIONS: path.join(fixtureRoot, '.cache', 'violations.tsv'),
      },
    })
    child.once('error', reject)
    child.once('exit', resolve)
  })
  const reportPath = path.join(fixtureRoot, '.cache', 'acceptance.json')
  let report: any
  if (fs.existsSync(reportPath)) {
    const bytes = fs.readFileSync(reportPath)
    const compressed = gzipSync(bytes, { level: 9 })
    // Keep CI evidence bounded, lossless and recoverable even after a partial child failure. The report
    // contains synthetic case metadata/hashes and helper verdicts, never credentials or environment dumps.
    assert.ok(bytes.length <= 16 * 1024 * 1024 && compressed.length <= 256 * 1024,
      `acceptance export exceeds its explicit size limit; full local report retained at ${reportPath}`)
    try { report = JSON.parse(bytes.toString('utf8')) } catch { /* export exact partial bytes before failing below */ }
    const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
    const encoded = compressed.toString('base64')
    const chunks = encoded.match(/.{1,8192}/g)!
    const metadata = {
      encoding: 'gzip+base64', sha256: digest, uncompressed_bytes: bytes.length,
      gzip_bytes: compressed.length, chunks: chunks.length, source_revision: source.stdout.trim(),
      test_source_sha256: report?.test_source?.sha256, complete: report?.complete === true,
      json_valid: report !== undefined,
    }
    const envelope = [
      `PUBLICATION_SCHEMA_ACCEPTANCE_EXPORT_BEGIN ${JSON.stringify(metadata)}`,
      ...chunks.map((chunk, index) => `PUBLICATION_SCHEMA_ACCEPTANCE_EXPORT_CHUNK ${index + 1}/${chunks.length} ${chunk}`),
      `PUBLICATION_SCHEMA_ACCEPTANCE_EXPORT_END ${JSON.stringify({ sha256: digest, chunks: chunks.length })}`,
      '',
    ].join('\n')
    // Await the write: focused mode exits immediately after this function, and console buffering could
    // otherwise truncate a large evidence envelope when stdout is a CI pipe.
    await new Promise<void>((resolve, reject) => process.stdout.write(envelope, error => error ? reject(error) : resolve()))
  } else {
    console.log(`PUBLICATION_SCHEMA_ACCEPTANCE_EXPORT_MISSING ${JSON.stringify({ source_revision: source.stdout.trim(), child_status: status })}`)
  }
  assert.equal(status, 0, `isolated schema acceptance failed; retained fixture: ${fixtureRoot}`)
  assert.ok(report, `acceptance report is missing or invalid; retained fixture: ${fixtureRoot}`)
  assert.equal(report.complete, true)
  assert.equal(report.cases.length, 48, 'the shared 24-case matrix runs for both simulated providers')
  assert.equal(report.compatibility_cases.length, 16, 'both providers exercise all eight root/context compatibility cases')
  console.log(`PASS: isolated schema acceptance (48 schema + 16 compatibility provider cases); report=${fixtureRoot}/.cache/acceptance.json`)
}

async function schemaAcceptanceChild(): Promise<void> {
  assert.equal(process.env.ENGINE_TEST_RUN, '1')
  assert.ok(REPO_ROOT.includes(`${path.sep}.cache${path.sep}test-output${path.sep}publication-schema-acceptance-`),
    'derived-store tests must never run against the shared checkout')
  const hash = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  const hashes = (directory: string): Record<string, string> => {
    if (!fs.existsSync(directory)) return {}
    const result: Record<string, string> = {}
    const visit = (current: string) => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const absolute = path.join(current, entry.name)
        assert.equal(entry.isSymbolicLink(), false, 'acceptance stores contain only real files/directories')
        if (entry.isDirectory()) visit(absolute)
        else result[path.relative(REPO_ROOT, absolute).split(path.sep).join('/')] = hash(fs.readFileSync(absolute))
      }
    }
    visit(directory)
    return result
  }
  type Stages = Record<'intake' | 'signal_payload' | 'thesis_record' | 'candidates' | 'thesis_integrity_review', any>
  const complete = (id: string): Stages => {
    const stages = Object.fromEntries(['intake', 'signal_payload', 'thesis_record', 'candidates', 'thesis_integrity_review']
      .map((name) => [name, screenerFixture(name as keyof Stages, id)])) as Stages
    for (const candidate of stages.candidates.candidates) candidate.news_impact = {
      applicable: false, mode: 'not_applicable', missing_reason: null, recurrence: 'not_applicable',
      event_quantification: 'Synthetic schema acceptance fixture; no economic estimate.',
      delta_value: 'Not assessed in this synthetic schema fixture.', implied_move_pct: null,
      observed_move_pct: null, gap_read: 'not_applicable',
      caveats: 'Synthetic correctness control; no investment evidence.', sources: [],
    }
    return stages
  }
  const cases: Array<{ id: string; artifact: keyof Stages; mutate: (stages: Stages) => void }> = [
    { id: 'invalid16-event-id', artifact: 'signal_payload', mutate: stages => { stages.signal_payload.event_id = `EVT-${'a'.repeat(16)}` } },
    { id: 'null-signal-entities-commodity', artifact: 'signal_payload', mutate: stages => { stages.signal_payload.entities.commodity = null } },
  ]
  const thesisPaths = [
    ['M0_6_1', 'analyst_rating_distribution', 'missing_reason'],
    ['M0_6_1', 'estimate_dispersion', 'missing_reason'],
    ...['estimate_dispersion', 'estimate_revision_trajectory', 'implied_scenario_from_multiple',
      'options_implied_move', 'short_interest_positioning'].map(name => ['M0_6_2', name, 'missing_reason']),
    ['M0_6_6', 'override_justification'],
  ]
  for (const parts of thesisPaths) cases.push({
    id: `null-thesis-${parts.join('-')}`, artifact: 'thesis_record', mutate: stages => {
      const parent = parts.slice(0, -1).reduce((value, key) => value[key], stages.thesis_record)
      const field = parts[parts.length - 1]
      assert.equal(typeof parent[field], 'string', 'each null mutation starts from a schema-valid string')
      parent[field] = null
    },
  })
  cases.push({ id: 'short-thesis-M0_2-world_changes', artifact: 'thesis_record', mutate: stages => {
    stages.thesis_record.M0_2.world_changes = stages.thesis_record.M0_2.world_changes.slice(0, 1)
  } })
  const canonical = complete('SIG-20990103-00000000')
  assert.equal(canonical.candidates.candidates.length, 4, 'cover every candidate in the canonical fixture')
  for (let index = 0; index < canonical.candidates.candidates.length; index++) {
    for (const field of ['event_quantification', 'delta_value', 'caveats']) cases.push({
      id: `null-candidate-${index}-news_impact-${field}`, artifact: 'candidates',
      mutate: stages => { stages.candidates.candidates[index].news_impact[field] = null },
    })
  }
  const testSourcePath = fileURLToPath(import.meta.url)
  const report = {
    complete: false, source_checkout_head: process.env.ENGINE_SCHEMA_ACCEPTANCE_SOURCE_SHA,
    source_checkout_head_scope: 'Checkout HEAD identity only; exact executing test bytes (including any uncommitted supplement) identified separately.',
    test_source: { path: testSourcePath, sha256: hash(fs.readFileSync(testSourcePath)) },
    runtime_source_hashes: Object.fromEntries(['execution-provenance.ts', 'launcher.ts'].map(name => [
      `ui/server/src/${name}`, hash(fs.readFileSync(path.resolve(path.dirname(testSourcePath), '../src', name))),
    ])),
    fixture_program_hashes: { ...hashes(path.join(REPO_ROOT, 'scripts')),
      ...hashes(path.join(REPO_ROOT, '.claude')), ...hashes(path.join(REPO_ROOT, 'frameworks')) },
    scope: [
      'Both providers are simulated identities; no provider/model is invoked.',
      'Real schema gate, provenance stamper, checkpoint/board builders and frozen snapshot admission execute.',
      'Valid controls hand the exact supervisor snapshot to real commit-run with no push/remote/credentials and use the default HEAD/blob verifier.',
      'Compatibility cases exercise direct begin/stamp with authoritative owner/kind/display-unit/root classification under both providers.',
      'Canonical-first admission assumes the trusted schema-bearing owner context. The preexisting schema-free-owner early return remains; low-level callers and nonpublishing admin parity retain their owner/root contracts.',
      'No-mutation assertions begin at supervisor invocation; earlier deterministic-writer own-prewrite validation remains untested.',
    ], cases: [] as any[], compatibility_cases: [] as any[],
  }
  const reportPath = path.join(REPO_ROOT, '.cache', 'acceptance.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  try {
    for (const test of [{ id: 'valid12-complete', artifact: 'signal_payload' as const, mutate: null }, ...cases]) {
      for (const provider of ['claude', 'codex'] as const) {
        const id = `SIG-20990103-${randomUUID().replaceAll('-', '').slice(0, 8)}`
        const relative = `screener/runs/${id}`
        const directory = path.join(REPO_ROOT, relative)
        const thesisId = `THS-${id}-v1`
        const ledgerRelative = `screener/ledger/theses/${thesisId}.json`
        const ledger = path.join(REPO_ROOT, ledgerRelative)
        fs.mkdirSync(directory, { recursive: true })
        const selectedProfile = provider === 'claude'
          ? { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
          : { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' }
        const live = createRun({
          kind: 'signal', ticker: id, subjectId: id, swarmId: 'screener', unit: 'signal', provider,
          executionProfile: selectedProfile, profileKey: selectedProfile.key, model: selectedProfile.parentModel,
          reasoningLevel: selectedProfile.parentReasoning, prompt: '', user: 'test', userVia: 'local',
          runRoot: relative, willCommitToMain: true, writeTargetsAbs: [directory, ledger],
          coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
        })
        const token = `schema-acceptance-${id}`
        live.publicationToken = token
        beginExecutionAttempt(live)
        const stages = complete(id)
        const write = () => {
          for (const [name, value] of Object.entries(stages))
            fs.writeFileSync(path.join(directory, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`)
        }
        test.mutate?.(stages)
        write()
        const protectedState = () => ({
          run: hashes(directory), ledger: hashes(path.join(REPO_ROOT, 'screener', 'ledger')),
          board: hashes(path.join(REPO_ROOT, 'screener', 'board')), provenanceAndReceipts: hashes(STATE_DIR),
          capability: { token: live.publicationToken, phase: live.publicationPhase,
            requested: live.publicationRequested, completed: live.publicationCompleted,
            hashes: live.publicationArtifactHashes, revision: live.publicationRevision },
        })
        const before = protectedState()
        const row: any = {
          provider, case_id: test.id, run_root: relative,
          input_hashes: hashes(directory), schema_hashes: hashes(path.join(REPO_ROOT, 'frameworks', 'screener')),
        }
        report.cases.push(row)
        try {
          if (test.mutate) {
            let refusal = ''
            await assert.rejects(supervisePublication(live.runId, token, { phase: 'commit', pathspecs: [relative] }),
              (error: any) => {
                refusal = String(error?.message || error)
                return refusal.includes('schema validation refused before mutation:')
                  && refusal.includes(`${test.artifact}.json`)
              }, `${provider}/${test.id}: the real schema checker refuses the one-field mutation`)
            assert.deepEqual(protectedState(), before,
              `${provider}/${test.id}: no ledger/checkpoint/conviction/board/receipt/provenance/capability mutation`)
            row.refusal = refusal
            row.protected_before = before
            row.protected_after = protectedState()
            Object.assign(stages, complete(id))
            write()
            const recovered = await supervisePublication(live.runId, token, { phase: 'stamp' })
            assert.equal(recovered.ok, true, `${provider}/${test.id}: correction recovers with the same capability`)
            assert.equal(fs.existsSync(ledger), true)
            assert.deepEqual(hashes(path.join(REPO_ROOT, 'screener', 'board')), before.board,
              'stamp recovery does not project the shared board')
            row.recovery = { phase: 'stamp', same_capability: live.publicationToken === token,
              artifact_hashes: recovered.artifactHashes }
          } else {
            assert.match(stages.signal_payload.event_id, /^EVT-[a-f0-9]{12}$/)
            assert.ok(stages.candidates.candidates.every((candidate: any) => candidate.news_impact.missing_reason === null),
              'the complete positive control preserves schema-permitted missing_reason:null')
            let commits = 0
            const committer = __setSupervisorCommitter(async (message, paths, env) => {
              commits++
              const snapshot = JSON.parse(fs.readFileSync(env.NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST!, 'utf8'))
              for (const entry of snapshot.entries) assert.equal(hash(fs.readFileSync(entry.snapshot)), entry.sha256)
              row.snapshot_paths = [...paths]
              row.snapshot_hashes = Object.fromEntries(snapshot.entries.map((entry: any) => [entry.path, entry.sha256]))
              const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: REPO_ROOT, encoding: 'utf8' })
              assert.equal(top.status, 0, top.stderr)
              assert.equal(fs.realpathSync(top.stdout.trim()), fs.realpathSync(REPO_ROOT))
              const remotes = spawnSync('git', ['remote'], { cwd: REPO_ROOT, encoding: 'utf8' })
              assert.equal(remotes.status, 0, remotes.stderr)
              assert.equal(remotes.stdout.trim(), '', 'the fixture has no push destination')
              const noApp = path.join(REPO_ROOT, '.cache', 'no-app-credentials')
              const temporary = path.join(REPO_ROOT, '.cache', 'tmp')
              fs.mkdirSync(noApp, { recursive: true })
              fs.mkdirSync(temporary, { recursive: true })
              const localEnv: NodeJS.ProcessEnv = { ...env, ENGINE_NO_PUSH: '1', NOSTRA_ENGINE_CONFIG_DIR: noApp,
                GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_COUNT: '2',
                GIT_CONFIG_KEY_0: 'credential.helper', GIT_CONFIG_VALUE_0: '',
                GIT_CONFIG_KEY_1: 'core.hooksPath', GIT_CONFIG_VALUE_1: '/dev/null',
                GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: '/usr/bin/false', TMPDIR: temporary,
                GIT_AUTHOR_NAME: 'Schema Fixture', GIT_AUTHOR_EMAIL: 'schema-fixture@example.invalid',
                GIT_COMMITTER_NAME: 'Schema Fixture', GIT_COMMITTER_EMAIL: 'schema-fixture@example.invalid' }
              // The real helper's supported hermetic-test pattern drops the guard only for this one
              // subprocess in the independently verified no-remote fixture (test_commit_run.py).
              delete localEnv.ENGINE_TEST_RUN
              delete localEnv.ENGINE_TEST_RUN_VIOLATIONS
              const committed = spawnSync('bash', [path.join(REPO_ROOT, 'scripts', 'commit-run.sh'), message, '--', ...paths], {
                cwd: REPO_ROOT, env: localEnv, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
              })
              row.commit_helper = { status: committed.status, stdout: committed.stdout, stderr: committed.stderr,
                no_push: localEnv.ENGINE_NO_PUSH, remotes: [], credential_config: noApp }
              assert.equal(committed.status, 0, committed.stderr)
              assert.match(committed.stdout, /(?:^|\n)COMMIT_SHA=[0-9a-f]{40}(?:\n|$)/)
              assert.match(committed.stderr, /ENGINE_NO_PUSH=1.*NOT pushing/)
              return committed.stdout
            })
            try {
              const published = await supervisePublication(live.runId, token, { phase: 'commit', pathspecs: [relative] })
              assert.equal(commits, 1)
              assert.equal(live.publicationPhase, 'terminal-complete')
              assert.equal(live.publicationCompleted, true)
              assert.equal(live.publicationToken, undefined)
              const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' })
              assert.equal(head.status, 0, head.stderr)
              assert.equal(live.publicationRevision, head.stdout.trim())
              row.committed_head_hashes = {}
              for (const name of row.snapshot_paths) {
                const blob = spawnSync('git', ['show', `HEAD:${name}`], { cwd: REPO_ROOT, maxBuffer: 4 * 1024 * 1024 })
                assert.equal(blob.status, 0, blob.stderr.toString('utf8'))
                row.committed_head_hashes[name] = hash(blob.stdout)
              }
              assert.deepEqual(row.committed_head_hashes, row.snapshot_hashes,
                'every actual committed HEAD blob equals the supervisor-produced snapshot, including derived stores and receipt')
              const required = [
                ...Object.keys(stages).map(name => `${relative}/${name}.json`), ledgerRelative,
                `${relative}/${EXECUTION_RECEIPT_NAME}`, 'screener/board/index.json',
                'screener/ledger/conviction/checkpoints.ndjson',
                `screener/ledger/conviction/conviction_state/${thesisId}.json`,
              ]
              for (const name of required) assert.ok(row.snapshot_paths.includes(name), `complete snapshot includes ${name}`)
              const checkpoints = fs.readFileSync(path.join(REPO_ROOT, 'screener/ledger/conviction/checkpoints.ndjson'), 'utf8')
                .trim().split('\n').map(line => JSON.parse(line))
              for (const [index, checkpoint] of checkpoints.entries())
                assert.ok(checkpoint !== null && typeof checkpoint === 'object' && !Array.isArray(checkpoint),
                  `checkpoint row ${index + 1} must be a non-null object`)
              assert.ok(checkpoints.some(checkpoint => checkpoint.thesis_id === thesisId))
              const conviction = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'screener/ledger/conviction/conviction_state', `${thesisId}.json`), 'utf8'))
              assert.equal(conviction.thesis_id, thesisId)
              const board = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'screener/board/index.json'), 'utf8'))
              assert.ok(JSON.stringify(board).includes(thesisId), 'the real board builder includes the locked thesis')
              assert.ok(JSON.parse(fs.readFileSync(ledger, 'utf8')).execution_provenance)
              assert.ok(JSON.parse(fs.readFileSync(path.join(directory, 'thesis_record.json'), 'utf8')).execution_provenance)
              assert.equal(readLastProviderSelection(relative, 'published')?.provider, provider)
              row.publication = { phase: published.phase, revision: live.publicationRevision,
                verifier: 'default supervisor HEAD/blob verifier', artifact_hashes: published.artifactHashes,
                completed: live.publicationCompleted, checkpoint_rows: checkpoints.filter(checkpoint => checkpoint.thesis_id === thesisId).length }
            } finally {
              __setSupervisorCommitter(committer)
            }
          }
          row.passed = true
        } finally { finishRun(live, 'done') }
      }
    }
    for (const provider of ['claude', 'codex'] as const) {
      const selectedProfile = provider === 'claude'
        ? { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
        : { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' }
      for (const test of [
        { id: 'conviction-actual-root', kind: 'conviction', swarm: 'screener', root: 'checkpoint', action: 'auxiliary' },
        { id: 'canonical-five-artifact-baselines', kind: 'signal', swarm: 'screener', root: 'canonical', action: 'canonical' },
        { id: 'spoof-conviction-canonical-invalid16', kind: 'conviction', swarm: 'screener', root: 'canonical', action: 'invalid' },
        { id: 'primary-kind-on-checkpoint-root', kind: 'signal', swarm: 'screener', root: 'checkpoint', action: 'refuse' },
        { id: 'unknown-conviction-root', kind: 'conviction', swarm: 'screener', root: 'unknown', action: 'refuse' },
        { id: 'future-registered-auxiliary-root', kind: 'review', swarm: 'schema-future', root: 'future-review', action: 'auxiliary' },
        { id: 'future-primary-kind-on-auxiliary-root', kind: 'signal', swarm: 'schema-future', root: 'future-review', action: 'refuse' },
        { id: 'future-canonical-spoof-invalid16', kind: 'review', swarm: 'schema-future', root: 'canonical', action: 'invalid' },
      ] as const) {
        const suffix = randomUUID().replaceAll('-', '').slice(0, 8)
        const signalId = `SIG-20990104-${suffix}`
        const relative = test.root === 'checkpoint' ? `screener/ledger/conviction/runs/CHK-${suffix}-01`
          : test.root === 'unknown' ? `screener/ledger/conviction/unknown/CHK-${suffix}-01`
            : test.root === 'future-review' ? `screener/future-reviews/REV-${suffix}`
              : `${test.swarm === 'screener' ? 'screener/runs' : 'screener/future-runs'}/${signalId}`
        const directory = path.join(REPO_ROOT, relative)
        fs.mkdirSync(directory, { recursive: true })
        const stages = complete(signalId)
        if (test.root === 'canonical') {
          for (const [name, value] of Object.entries(stages))
            fs.writeFileSync(path.join(directory, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`)
        }
        const live = createRun({
          kind: test.kind as RunState['kind'], swarmId: test.swarm, unit: 'signal',
          ticker: test.root === 'checkpoint' ? `THS-${signalId}-v1::CHK-${suffix}-01` : signalId,
          provider, executionProfile: selectedProfile, profileKey: selectedProfile.key,
          model: selectedProfile.parentModel, reasoningLevel: selectedProfile.parentReasoning,
          prompt: '', user: 'test', userVia: 'local', runRoot: relative, willCommitToMain: true,
          writeTargetsAbs: [directory], coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
        })
        const token = `schema-compatibility-${suffix}`
        live.publicationToken = token
        const row: any = { provider, case_id: test.id, kind: live.kind, unit: live.unit,
          swarm_id: live.swarmId, run_root: relative }
        report.compatibility_cases.push(row)
        try {
          if (test.action === 'refuse') {
            const stateBefore = hashes(STATE_DIR)
            assert.throws(() => beginExecutionAttempt(live), /publication schema contract could not be verified/,
              `${provider}/${test.id}: an unregistered kind/root cannot reach provider dispatch`)
            assert.equal(live.currentExecutionAttempts, undefined)
            assert.equal(live.publicationBaselines, undefined)
            assert.deepEqual(hashes(STATE_DIR), stateBefore)
            await assert.rejects(supervisePublication(live.runId, token, { phase: 'stamp' }),
              /schema contract could not be verified before mutation/,
              'terminal preflight applies the same authoritative root/context classification')
            assert.equal(live.publicationRequested, undefined)
            assert.equal(live.publicationPhase, undefined)
            row.refused_at = ['beginExecutionAttempt', 'supervisePublication']
          } else {
            beginExecutionAttempt(live)
            const contract = readPublicationSchemaContract(live)!
            row.contract = contract
            row.baselines = live.publicationBaselines
            if (test.action === 'auxiliary') {
              assert.equal(contract.classification, 'auxiliary')
              assert.equal(contract.declared, false)
              assert.deepEqual(contract.artifacts, [])
              assert.deepEqual(live.publicationBaselines, {})
              const stopped = await supervisePublication(live.runId, token, { phase: 'stamp' })
              assert.deepEqual(stopped.artifacts, [])
              assert.equal(stopped.ok, true, 'the legitimate production auxiliary tuple begins and stamps')
            } else {
              assert.equal(contract.classification, 'canonical')
              assert.equal(contract.declared, true)
              const expected = test.swarm === 'screener' ? Object.keys(stages).map(name => `${name}.json`) : ['signal_payload.json']
              assert.deepEqual(Object.keys(live.publicationBaselines!).sort(), expected.sort())
              for (const name of expected) {
                assert.equal(live.publicationBaselines![name], hash(fs.readFileSync(path.join(directory, name))).replace(/^sha256:/, ''))
                assert.equal(artifactIsFresh(live, name), false, 'canonical pre-spawn baselines retain all mapped stage identities')
              }
              if (test.action === 'invalid') {
                stages.signal_payload.event_id = `EVT-${'a'.repeat(16)}`
                const payloadPath = path.join(directory, 'signal_payload.json')
                fs.writeFileSync(payloadPath, `${JSON.stringify(stages.signal_payload, null, 2)}\n`)
                const before = { run: hashes(directory), ledger: hashes(path.join(REPO_ROOT, 'screener', 'ledger')),
                  board: hashes(path.join(REPO_ROOT, 'screener', 'board')), state: hashes(STATE_DIR) }
                await assert.rejects(supervisePublication(live.runId, token, { phase: 'stamp' }),
                  /schema validation refused before mutation:.*signal_payload\.json/s,
                  'canonical roots remain schema-gated when supplied an auxiliary kind')
                assert.deepEqual({ run: hashes(directory), ledger: hashes(path.join(REPO_ROOT, 'screener', 'ledger')),
                  board: hashes(path.join(REPO_ROOT, 'screener', 'board')), state: hashes(STATE_DIR) }, before)
                assert.equal(live.publicationRequested, undefined)
                assert.equal(live.publicationPhase, undefined)
                row.refused_invalid16 = true
                stages.signal_payload.event_id = `EVT-${'a'.repeat(12)}`
                fs.writeFileSync(payloadPath, `${JSON.stringify(stages.signal_payload, null, 2)}\n`)
              }
              const stopped = await supervisePublication(live.runId, token, { phase: 'stamp' })
              assert.equal(stopped.ok, true)
              assert.deepEqual(stopped.artifacts, [], 'retained canonical history is not promoted to a fresh terminal thesis')
            }
          }
          row.passed = true
        } finally { finishRun(live, 'done') }
      }
    }
    report.complete = true
  } finally { fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`) }
}

const root = `analyses/ZZPROVSUP_${Date.now()}`
const absolute = path.join(REPO_ROOT, root)
const extraCleanup: string[] = []
fs.mkdirSync(absolute, { recursive: true })
fs.writeFileSync(path.join(absolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPROVSUP', version: 1 }))

const profile = { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
const run = createRun({
  kind: 'full', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
  profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test', userVia: 'local',
  runRoot: root, willCommitToMain: true, writeTargetsAbs: [absolute], coveredModules: [], readDepsAbs: [],
  closeWatcher: undefined, expected: new Map(),
})
run.provenanceEpoch = run.runId
run.publicationToken = 'test-supervisor-capability'

try {
  beginExecutionAttempt(run)
  const moduleCanary = createRun({
    kind: 'module', ticker: 'ZZPROVSUP', module: 'business-model', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test', userVia: 'local',
    runRoot: root, willCommitToMain: false, writeTargetsAbs: [absolute], coveredModules: ['business-model'],
    readDepsAbs: [], closeWatcher: undefined, expected: new Map(), parityCanary: true,
  })
  moduleCanary.publicationToken = 'test-module-canary-capability'
  await assert.rejects(
    queuePublicationIntent(moduleCanary.runId, moduleCanary.publicationToken, { phase: 'commit', pathspecs: [root] }),
    /only the terminal full canary may publish/,
    'an intermediate frozen module cannot queue a Git/publication request',
  )
  await assert.rejects(
    supervisePublication(moduleCanary.runId, moduleCanary.publicationToken, { phase: 'stamp', pathspecs: [root] }),
    /only the terminal full canary may publish/,
    'the trusted publication boundary independently rejects an intermediate frozen module',
  )
  finishRun(moduleCanary, 'error')
  await assert.rejects(
    supervisePublication(run.runId, run.publicationToken, {
      phase: 'commit', message: 'forged code publication', pathspecs: ['ui/server/src/server.ts'],
    }),
    /non-data publication pathspec/,
    'a cockpit child cannot use its capability to request a code path',
  )
  assert.equal(artifactIsFresh(run, 'decision_record.json'), false, 'pre-spawn bytes are the freshness baseline')

  // The provider may edit, forge, or delete the historical child-visible manifest. Canonical rows live in
  // supervisor state and remain byte-for-byte independent of it.
  const fake = path.join(absolute, '.execution-provenance.jsonl')
  fs.writeFileSync(fake, JSON.stringify({ provider: 'codex', model: 'forged', decision_author: true }) + '\n')
  const canonical = canonicalManifestPath(run)
  let rows = fs.readFileSync(canonical, 'utf8')
  assert.match(rows, /"provider":"claude"/)
  assert.doesNotMatch(rows, /forged/)
  fs.rmSync(fake, { force: true })
  rows = fs.readFileSync(canonicalManifestPath(run), 'utf8')
  assert.match(rows, /"provider":"claude"/, 'deleting the fake manifest has no effect')

  const insideTarget = path.join(absolute, 'inside-target.json')
  fs.writeFileSync(insideTarget, JSON.stringify({ ticker: 'ZZPROVSUP', forged: 'inside-link' }) + '\n')
  fs.rmSync(path.join(absolute, 'decision_record.json'))
  fs.symlinkSync('inside-target.json', path.join(absolute, 'decision_record.json'))
  await assert.rejects(
    supervisePublication(run.runId, run.publicationToken, {
      phase: 'stamp', message: 'inside symlink', pathspecs: [root],
    }),
    /regular non-symlink file/,
    'a terminal artifact may not redirect to another file inside the repository',
  )

  const outsideTarget = path.join(path.dirname(absolute), `outside-${randomUUID()}.json`)
  fs.writeFileSync(outsideTarget, JSON.stringify({ ticker: 'ZZPROVSUP', forged: 'outside-link' }) + '\n')
  fs.unlinkSync(path.join(absolute, 'decision_record.json'))
  fs.symlinkSync(outsideTarget, path.join(absolute, 'decision_record.json'))
  await assert.rejects(
    supervisePublication(run.runId, run.publicationToken, {
      phase: 'stamp', message: 'outside symlink', pathspecs: [root],
    }),
    /regular non-symlink file/,
    'a terminal artifact may not redirect outside the repository',
  )
  fs.rmSync(outsideTarget, { force: true })
  // unlinkSync, not rmSync: decision_record.json is now a DANGLING symlink (its target was just
  // removed), and rmSync resolves the target, finds nothing and returns as if it had succeeded —
  // leaving the link in place. The surviving symlink then failed the metadata-only assertion below.
  fs.unlinkSync(path.join(absolute, 'decision_record.json'))

  fs.writeFileSync(path.join(absolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPROVSUP', version: 2 }))
  assert.equal(artifactIsFresh(run, 'decision_record.json'), true, 'only current-attempt artifact bytes are publishable')

  const originalAuthor = run.currentExecutionAttempts?.find((row) =>
    row.attribution === 'recorded' && row.decision_author === true)
  assert.ok(originalAuthor, 'the initial terminal process is the recorded decision author')
  const originalBaseline = run.publicationBaselines?.['decision_record.json']
  run.providerAttemptId = randomUUID()
  run.automaticContinuationRetainsDecisionAuthor = true
  beginExecutionAttempt(run)
  assert.equal(run.publicationBaselines?.['decision_record.json'], originalBaseline,
    'an automatic continuation preserves the logical run freshness baseline')
  assert.equal(artifactIsFresh(run, 'decision_record.json'), true,
    'an unchanged decision from the first process remains publishable by its continuation')
  const retainedAuthor = run.executionAttempts?.find((row) =>
    row.attempt_id === originalAuthor?.attempt_id && row.attribution === 'recorded')
  assert.equal(retainedAuthor?.decision_author, true,
    'the process that authored the verdict retains calibration attribution')
  const publicationContinuation = run.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')
  assert.equal(publicationContinuation?.decision_author, false,
    'a publication-only continuation is a recorded contributor, not the decision author')
  assert.deepEqual(publicationContinuation?.decision_artifacts, [],
    'a publication-only continuation does not claim the retained decision artifact')

  const protectedRecoveryRoot = `${root}_protected-recovery`
  const protectedRecoveryAbsolute = path.join(REPO_ROOT, protectedRecoveryRoot)
  extraCleanup.push(protectedRecoveryAbsolute)
  fs.mkdirSync(protectedRecoveryAbsolute, { recursive: true })
  const protectedRecovery = createRun({
    kind: 'full', ticker: 'ZZPROTECTED', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test',
    userVia: 'local', runRoot: protectedRecoveryRoot, willCommitToMain: false,
    writeTargetsAbs: [protectedRecoveryAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
    protectedPriorExecutionAttempts: [{ ...originalAuthor! }],
  })
  beginExecutionAttempt(protectedRecovery)
  const importedProtected = protectedRecovery.executionAttempts?.find((row) =>
    row.attempt_id === originalAuthor?.attempt_id)
  assert.equal(importedProtected?.attribution, 'recorded')
  assert.equal(importedProtected?.decision_author, false,
    'an interrupted prior author is retained as observed lineage but cannot author the replacement verdict')
  assert.deepEqual(importedProtected?.scope, ['live_prior_attempt'])
  assert.equal(protectedRecovery.currentExecutionAttempts?.find((row) =>
    row.attribution === 'recorded')?.decision_author, true,
    'the recovery terminal process authors the replacement verdict')
  finishRun(protectedRecovery, 'error')

  const preSpawnRoot = `${root}_pre-spawn-recovery`
  const preSpawnAbsolute = path.join(REPO_ROOT, preSpawnRoot)
  extraCleanup.push(preSpawnAbsolute)
  fs.mkdirSync(preSpawnAbsolute, { recursive: true })
  const priorObserved = createRun({
    kind: 'full', ticker: 'ZZPRESPAWN', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test',
    userVia: 'local', runRoot: preSpawnRoot, willCommitToMain: false,
    writeTargetsAbs: [preSpawnAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  beginExecutionAttempt(priorObserved)
  finishRun(priorObserved, 'error')
  const failedBeforeSpawn = createRun({
    kind: 'full', ticker: 'ZZPRESPAWN', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test',
    userVia: 'local', runRoot: preSpawnRoot, willCommitToMain: false,
    writeTargetsAbs: [preSpawnAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  recordAdmittedProviderSelection(failedBeforeSpawn)
  assert.equal(readProviderPreSpawnFailureAuthority(preSpawnRoot)?.runId, failedBeforeSpawn.runId,
    'an admitted attempt absent from the protected prior manifest is proven to have failed before spawn')
  writeRunMarker(preSpawnRoot, '.interrupted', {
    reason: 'continuation_spawn_failed', provider: 'codex', model: 'gpt-test', reasoningLevel: 'max',
    profileKey: 'codex:test', runId: failedBeforeSpawn.runId, attemptId: failedBeforeSpawn.runId,
  })
  sealProviderPreSpawnFailureAuthority(preSpawnRoot, failedBeforeSpawn.runId)
  assert.equal(readProviderInterruptionAuthority(preSpawnRoot)?.runId, failedBeforeSpawn.runId,
    'the exact no-process admission can be re-armed without fabricating a provider attempt')
  assert.equal(readProviderPreSpawnFailureAuthority(preSpawnRoot), null,
    'a sealed interruption no longer qualifies through the admitted pre-spawn fallback')
  finishRun(failedBeforeSpawn, 'error')

  const imported = projectionLineageRows({ execution_provenance: {
    provider_mode: 'single_provider', profile_key: 'claude:opus:default',
    contributors: [{ provider: 'claude', model: 'opus', reasoning_level: 'default', attribution: 'recorded', scopes: ['modules'] }],
    cli_versions: { claude: '1.2.3' },
  } }, 'lineage:valuation')
  assert.equal(imported.length, 1)
  assert.equal(imported[0].provider, 'claude')
  assert.equal(imported[0].attribution, 'configured')
  assert.equal(imported[0].decision_author, false)
  const combined = [...imported, ...(run.currentExecutionAttempts ?? [])]
  assert.deepEqual(new Set(combined.map((row) => row.provider)), new Set(['claude']))
  const codexCurrent = (run.currentExecutionAttempts ?? []).map((row) => ({ ...row, provider: 'codex' }))
  assert.deepEqual(new Set([...imported, ...codexCurrent].map((row) => row.provider)), new Set(['claude', 'codex']),
    'a Claude source continued by Codex remains mixed rather than crediting the finisher')

  const epoch = randomUUID()
  const siblingRoot = `${root}_siblings`
  fs.mkdirSync(path.join(REPO_ROOT, siblingRoot), { recursive: true })
  const sibling = (module: string) => ({
    ...run, runId: randomUUID(), kind: 'module' as const, module, agent: undefined,
    runRoot: siblingRoot,
    provenanceEpoch: epoch, chainId: epoch, publicationCompleted: false,
    executionAttempts: undefined, currentExecutionAttempts: undefined, publicationBaselines: undefined,
  })
  const first = sibling('business-model')
  const second = sibling('earnings')
  beginExecutionAttempt(first)
  beginExecutionAttempt(second)
  assert.equal(executionEpochAttemptCount(epoch), 2, 'concurrent siblings share and retain the epoch')
  first.publicationCompleted = true
  releaseExecutionEpochAfterPublication(first)
  assert.equal(executionEpochAttemptCount(epoch), 2, 'an intermediate sibling cannot clear shared lineage')
  const terminal = {
    ...sibling('master'), kind: 'rerun' as const, agent: 'synthesizer', publicationCompleted: true,
  }
  beginExecutionAttempt(terminal)
  assert.equal(executionEpochAttemptCount(epoch), 3)
  releaseExecutionEpochAfterPublication(terminal)
  assert.equal(executionEpochAttemptCount(epoch), 0, 'terminal publication releases the long-lived epoch')

  // Quota/error continuations can accumulate several attempts in one root before any terminal receipt
  // exists. Every supervisor-observed contributor must survive: Claude -> Codex -> Claude cannot forget
  // the first provider merely because a later attempt overwrote the live root slot.
  const retryRoot = `${root}_quota-chain`
  extraCleanup.push(path.join(REPO_ROOT, retryRoot))
  fs.mkdirSync(path.join(REPO_ROOT, retryRoot, 'business-model'), { recursive: true })
  const attempt = (provider: 'claude' | 'codex') => ({
    ...run,
    runId: randomUUID(),
    provider,
    model: provider === 'claude' ? 'sonnet' : 'gpt-5.6-sol',
    reasoningLevel: provider === 'claude' ? 'default' : 'max',
    profileKey: provider === 'claude' ? 'claude:sonnet:default' : 'codex:gpt-5.6-sol:max',
    executionProfile: provider === 'claude' ? profile : {
      key: 'codex:gpt-5.6-sol:max', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    },
    runRoot: retryRoot,
    provenanceEpoch: randomUUID(),
    executionAttempts: undefined,
    currentExecutionAttempts: undefined,
    publicationBaselines: undefined,
  })
  const quotaClaude = attempt('claude')
  beginExecutionAttempt(quotaClaude)
  const quotaClaudeAttemptId = quotaClaude.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')?.attempt_id
  fs.writeFileSync(path.join(REPO_ROOT, retryRoot, 'business-model', '01_retained.md'), '# retained before quota stop\n')
  const quotaCodex = attempt('codex')
  beginExecutionAttempt(quotaCodex)
  const quotaCodexAttemptId = quotaCodex.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')?.attempt_id
  const terminalClaude = attempt('claude')
  beginExecutionAttempt(terminalClaude)
  const terminalClaudeAttemptId = terminalClaude.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')?.attempt_id
  const recordedChain = (terminalClaude.executionAttempts ?? []).filter((row) => row.attribution === 'recorded')
  assert.deepEqual(new Set(recordedChain.map((row) => row.attempt_id)),
    new Set([quotaClaudeAttemptId, quotaCodexAttemptId, terminalClaudeAttemptId]),
    'three same-root attempts retain every canonical attempt identity before publication')
  assert.deepEqual(new Set(recordedChain.map((row) => row.provider)), new Set(['claude', 'codex']),
    'retained output across an explicit provider switch remains mixed')
  fs.rmSync(path.join(REPO_ROOT, retryRoot), { recursive: true, force: true })

  // A tracked child can ask to publish while it and detached descendants are still alive, but that request
  // is intent only. Stamping and Git begin exclusively in the close-owned drain after process extinction.
  const deferredRoot = `${root}_deferred-publication`
  const deferredAbsolute = path.join(REPO_ROOT, deferredRoot)
  extraCleanup.push(deferredAbsolute)
  fs.mkdirSync(deferredAbsolute, { recursive: true })
  fs.writeFileSync(path.join(deferredAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZDEFER', version: 1 }))
  fs.writeFileSync(path.join(deferredAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const deferred = createRun({
    kind: 'full', ticker: 'ZZDEFER', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: deferredRoot, willCommitToMain: true,
    writeTargetsAbs: [deferredAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  deferred.publicationToken = randomUUID()
  beginExecutionAttempt(deferred)
  fs.writeFileSync(path.join(deferredAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZDEFER', version: 2 }))
  // The Idea-publication gate is still on disk while the supervisor commits (it is cleared only afterwards),
  // and /research:full publishes the whole run root. The gate is control state the data catalogue rejects:
  // sealed into the snapshot it made a publication no retry could publish (2026-09-17 outage).
  fs.writeFileSync(path.join(deferredAbsolute, '.requires_idea_publication'), '')
  // The resume marker is the same class of control state: a technical-readiness retry preserves it and the
  // `done` path clears it only after publication, so it is on disk while a run-root pathspec is swept.
  writeRunMarker(deferredRoot, '.interrupted', { reason: 'fixture: marker still on disk at publication' })
  let deferredCommits = 0
  const deferredPublishedPaths: string[][] = []
  const deferredCommitter = __setSupervisorCommitter(async (_message, pathspecs) => {
    deferredCommits++
    deferredPublishedPaths.push([...pathspecs])
    return 'COMMIT_SHA=2222222222222222222222222222222222222222'
  })
  const deferredVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    const queued = await queuePublicationIntent(deferred.runId, deferred.publicationToken, {
      phase: 'commit', message: 'deferred fixture', pathspecs: [deferredRoot],
    })
    assert.equal(queued.phase, 'queued')
    assert.equal(deferredCommits, 0, 'child-time request cannot stamp or invoke Git')
    assert.equal(JSON.parse(fs.readFileSync(path.join(deferredAbsolute, 'decision_record.json'), 'utf8')).execution_provenance, undefined)
    await drainPublicationIntents(deferred)
    assert.equal(deferredCommits, 2, 'the close-owned drain publishes the primary bytes then the deterministic SHA backfill')
    assert.ok(deferredPublishedPaths[0].includes(`${deferredRoot}/decision_record.json`))
    assert.deepEqual(deferredPublishedPaths.flat().filter((item) => item.endsWith('.requires_idea_publication')), [],
      'a run-root pathspec never sweeps the supervisor publication gate into the immutable snapshot')
    assert.deepEqual(deferredPublishedPaths.flat().filter((item) => item.endsWith('.interrupted')), [],
      'a run-root pathspec never sweeps the supervisor resume marker into the immutable snapshot')
    assert.equal(fs.existsSync(path.join(deferredAbsolute, '.interrupted')), true,
      'excluding control state from the snapshot never removes it from disk')
    assert.equal(deferred.publicationCompleted, true)
    assert.ok(JSON.parse(fs.readFileSync(path.join(deferredAbsolute, 'decision_record.json'), 'utf8')).execution_provenance)
    assert.doesNotMatch(fs.readFileSync(path.join(deferredAbsolute, 'RUN_METADATA.md'), 'utf8'), /to be filled/)
  } finally {
    __setSupervisorCommitter(deferredCommitter)
    __setSupervisorCommitVerifier(deferredVerifier)
    finishRun(deferred, 'done')
  }

  // A path list the data catalogue rejects must be refused BEFORE it is sealed. Sealed, it becomes an
  // immutable digest-signed receipt that can never publish and is retried at every startup. The real-world
  // instance is an audit artifact such as the human readiness-override trace: it is not control state, so it
  // is not silently excluded, and the catalogue has no entry for it. This fixture uses a neutral name so the
  // test keeps holding whichever way that file's catalogue decision goes. The refusal must land on the live
  // run (still in Activity) and leave nothing behind for recovery to retry.
  const presealRoot = `${root}_preseal-refusal`
  const presealAbsolute = path.join(REPO_ROOT, presealRoot)
  extraCleanup.push(presealAbsolute)
  fs.mkdirSync(presealAbsolute, { recursive: true })
  fs.writeFileSync(path.join(presealAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPRESEAL', version: 1 }))
  fs.writeFileSync(path.join(presealAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const preseal = createRun({
    kind: 'full', ticker: 'ZZPRESEAL', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: presealRoot, willCommitToMain: true,
    writeTargetsAbs: [presealAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  preseal.publicationToken = randomUUID()
  beginExecutionAttempt(preseal)
  fs.writeFileSync(path.join(presealAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPRESEAL', version: 2 }))
  fs.writeFileSync(path.join(presealAbsolute, 'zz_uncatalogued_audit_trace.json'), '{"fixture":true}\n')
  const presealReceipt = path.join(STATE_DIR, 'publication-ready', `${preseal.runId}.json`)
  const snapshotDirectories = () => fs.readdirSync(STATE_DIR).filter((name) => name.startsWith('publication-snapshot-')).sort()
  const snapshotsBefore = snapshotDirectories()
  let presealCommits = 0
  const presealCommitter = __setSupervisorCommitter(async () => {
    presealCommits++
    return 'COMMIT_SHA=6666666666666666666666666666666666666666'
  })
  const presealVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(preseal.runId, preseal.publicationToken, {
      phase: 'commit', message: 'pre-seal refusal fixture', pathspecs: [presealRoot],
    })
    await assert.rejects(
      drainPublicationIntents(preseal),
      (error: any) => /refused before its path list was frozen/.test(String(error?.message))
        && /DATA-CATALOGUE: FAIL/.test(String(error?.message))
        && String(error?.message).includes(`${presealRoot}/zz_uncatalogued_audit_trace.json`),
      'an uncatalogued path fails the live publication and names the file that needs a catalogue decision',
    )
    assert.equal(presealCommits, 0, 'a refused path list never reaches Git')
    assert.equal(fs.existsSync(presealReceipt), false, 'a refused path list is never sealed into a ready receipt')
    assert.deepEqual(snapshotDirectories(), snapshotsBefore, 'a refused path list leaves no protected snapshot behind')
    assert.notEqual(preseal.publicationCompleted, true)
    // Assert on this run's own receipt only: the state directory is shared with every other block here.
    await recoverReadyPublications()
    assert.deepEqual(listReadyPublicationFailures().filter((item) => item.entry === `${preseal.runId}.json`), [],
      'with no receipt there is nothing for startup to retry forever')
    assert.equal(fs.existsSync(path.join(presealAbsolute, 'zz_uncatalogued_audit_trace.json')), true,
      'the audit trace is refused, never deleted or silently dropped')
  } finally {
    __setSupervisorCommitter(presealCommitter)
    __setSupervisorCommitVerifier(presealVerifier)
    finishRun(preseal, 'error')
    // A regression that seals before refusing must not strand a receipt whose run root the cleanup below
    // deletes: the next run's recovery pass would then fail on it on this machine until cleared by hand.
    fs.rmSync(presealReceipt, { force: true })
    for (const name of snapshotDirectories()) {
      if (!snapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // "Anything short of a clean PASS refuses": a validator that cannot reach a verdict must never be read as
  // permission to seal. Shadow python3 with one that exits non-zero and says nothing.
  const blindRelative = `${root}/reviews/2099-01-06_blind_validator_review.json`
  const blindAbsolute = path.join(REPO_ROOT, blindRelative)
  fs.mkdirSync(path.dirname(blindAbsolute), { recursive: true })
  const blindRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(blindAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  blindRun.publicationToken = randomUUID()
  beginExecutionAttempt(blindRun)
  fs.writeFileSync(blindAbsolute, '{"verdict":"a catalogued path the validator never gets to judge"}\n')
  const blindReceipt = path.join(STATE_DIR, 'publication-ready', `${blindRun.runId}.json`)
  const shimDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'blind-validator-'))
  fs.writeFileSync(path.join(shimDirectory, 'python3'), '#!/bin/sh\nexit 3\n', { mode: 0o755 })
  const originalPath = process.env.PATH
  let blindCommits = 0
  const blindCommitter = __setSupervisorCommitter(async () => {
    blindCommits++
    return 'COMMIT_SHA=9999999999999999999999999999999999999999'
  })
  const blindVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(blindRun.runId, blindRun.publicationToken, {
      phase: 'commit', message: 'blind validator fixture', pathspecs: [blindRelative],
    })
    process.env.PATH = `${shimDirectory}${path.delimiter}${originalPath ?? ''}`
    await assert.rejects(drainPublicationIntents(blindRun), /refused before its path list was frozen/,
      'a validator that cannot reach a verdict refuses the publication instead of waving it through')
    assert.equal(blindCommits, 0)
    assert.equal(fs.existsSync(blindReceipt), false, 'an unchecked path list is never sealed')
  } finally {
    process.env.PATH = originalPath
    __setSupervisorCommitter(blindCommitter)
    __setSupervisorCommitVerifier(blindVerifier)
    finishRun(blindRun, 'error')
    fs.rmSync(blindReceipt, { force: true })
    fs.rmSync(shimDirectory, { recursive: true, force: true })
  }

  // commit-run.sh refuses a supervisor snapshot manifest above 512 entries, and no retry changes a sealed
  // list's length. Every file here is catalogued (analyses/*/*.md), so only the count can refuse it.
  const crowdedRoot = `${root}_crowded`
  const crowdedAbsolute = path.join(REPO_ROOT, crowdedRoot)
  extraCleanup.push(crowdedAbsolute)
  fs.mkdirSync(crowdedAbsolute, { recursive: true })
  fs.writeFileSync(path.join(crowdedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZCROWD', version: 1 }))
  fs.writeFileSync(path.join(crowdedAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const crowded = createRun({
    kind: 'full', ticker: 'ZZCROWD', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: crowdedRoot, willCommitToMain: true,
    writeTargetsAbs: [crowdedAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  crowded.publicationToken = randomUUID()
  beginExecutionAttempt(crowded)
  fs.writeFileSync(path.join(crowdedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZCROWD', version: 2 }))
  for (let index = 0; index < 512; index++) fs.writeFileSync(path.join(crowdedAbsolute, `note-${index}.md`), 'x\n')
  const crowdedReceipt = path.join(STATE_DIR, 'publication-ready', `${crowded.runId}.json`)
  const crowdedSnapshotsBefore = snapshotDirectories()
  let crowdedCommits = 0
  const crowdedCommitter = __setSupervisorCommitter(async () => {
    crowdedCommits++
    return 'COMMIT_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  })
  const crowdedVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(crowded.runId, crowded.publicationToken, {
      phase: 'commit', message: 'crowded fixture', pathspecs: [crowdedRoot],
    })
    await assert.rejects(drainPublicationIntents(crowded), /exceed the 512-entry limit/,
      'a path list commit-run.sh is certain to refuse is never sealed')
    assert.equal(crowdedCommits, 0)
    assert.equal(fs.existsSync(crowdedReceipt), false)
  } finally {
    __setSupervisorCommitter(crowdedCommitter)
    __setSupervisorCommitVerifier(crowdedVerifier)
    finishRun(crowded, 'error')
    fs.rmSync(crowdedReceipt, { force: true })
    for (const name of snapshotDirectories()) {
      if (!crowdedSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // commit-run.sh has a second deterministic gate after staging: `eval.py --data-needs-prewrite` on every
  // newly staged analyses/<RUN>/decision_record.json (exit 5). The command prompts run it before asking to
  // publish, but the model is not the boundary. Sealed, a record that fails it is rejected identically at
  // every startup retry, so the supervisor must ask the same gate about the FROZEN bytes before sealing.
  // The committer is mocked here, so without the pre-seal check nothing in this suite would refuse it.
  const gateRoot = `${root}_decision-gate-refusal`
  const gateAbsolute = path.join(REPO_ROOT, gateRoot)
  extraCleanup.push(gateAbsolute)
  fs.mkdirSync(gateAbsolute, { recursive: true })
  fs.writeFileSync(path.join(gateAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZGATE', version: 1 }))
  fs.writeFileSync(path.join(gateAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const gateRun = createRun({
    kind: 'full', ticker: 'ZZGATE', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: gateRoot, willCommitToMain: true,
    writeTargetsAbs: [gateAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  gateRun.publicationToken = randomUUID()
  beginExecutionAttempt(gateRun)
  // Every path here is catalogued, so the path-list check above passes: only the record's CONTENT is wrong.
  fs.writeFileSync(path.join(gateAbsolute, 'decision_record.json'),
    decisionFixture({ ticker: 'ZZGATE', version: 2, data_needs: 'not-an-array' }))
  const gateReceipt = path.join(STATE_DIR, 'publication-ready', `${gateRun.runId}.json`)
  const gateSnapshotsBefore = snapshotDirectories()
  // Interpose on the gate only, to record what the supervisor handed it; everything else (the catalogue
  // validator, the gate's own eval.py call) reaches the real interpreter untouched.
  const realPython = spawnSync('python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' }).stdout.trim()
  assert.ok(path.isAbsolute(realPython), 'the fixture needs the real interpreter to delegate to')
  const gateShimDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'decision-gate-tap-'))
  const gateStdinLog = path.join(gateShimDirectory, 'gate-stdin')
  fs.writeFileSync(path.join(gateShimDirectory, 'python3'), [
    '#!/bin/sh',
    'case "${1:-}" in',
    `  */decision_publication_gate.py) cat > '${gateStdinLog}'; exec '${realPython}' "$@" < '${gateStdinLog}' ;;`,
    'esac',
    `exec '${realPython}' "$@"`,
    '',
  ].join('\n'), { mode: 0o755 })
  const gateOriginalPath = process.env.PATH
  let gateCommits = 0
  const gateCommitter = __setSupervisorCommitter(async () => {
    gateCommits++
    return 'COMMIT_SHA=7777777777777777777777777777777777777777'
  })
  const gateVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(gateRun.runId, gateRun.publicationToken, {
      phase: 'commit', message: 'decision gate refusal fixture', pathspecs: [gateRoot],
    })
    process.env.PATH = `${gateShimDirectory}${path.delimiter}${gateOriginalPath ?? ''}`
    await assert.rejects(
      drainPublicationIntents(gateRun),
      (error: any) => /refused before its frozen snapshot was sealed/.test(String(error?.message))
        && /DATA-NEEDS-PREWRITE: FAIL/.test(String(error?.message))
        && String(error?.message).includes(`${gateRoot}/decision_record.json`),
      'a new decision record commit-run.sh will reject fails the live publication and names the record',
    )
    process.env.PATH = gateOriginalPath
    assert.equal(gateCommits, 0, 'a record the creation-time gate rejects never reaches Git')
    assert.equal(fs.existsSync(gateReceipt), false, 'a rejected record is never sealed into a ready receipt')
    assert.deepEqual(snapshotDirectories(), gateSnapshotsBefore, 'a rejected record leaves no protected snapshot behind')
    assert.notEqual(gateRun.publicationCompleted, true)
    await recoverReadyPublications()
    assert.deepEqual(listReadyPublicationFailures().filter((item) => item.entry === `${gateRun.runId}.json`), [],
      'with no receipt there is nothing for startup to retry forever')
    assert.equal(fs.existsSync(path.join(gateAbsolute, 'decision_record.json')), true,
      'the rejected record is refused, never deleted')
    // The verdict must be about the bytes commit-run.sh will stage. Those are the frozen snapshot files in
    // protected supervisor state, not the run-root file a still-running descendant could rewrite.
    const handed = fs.readFileSync(gateStdinLog, 'utf8').split('\0')
    assert.ok(handed.length >= 2 && handed.length % 2 === 0, 'the gate receives (publication path, bytes file) pairs')
    const handedRecord = handed.indexOf(`${gateRoot}/decision_record.json`)
    assert.ok(handedRecord >= 0 && handedRecord % 2 === 0, 'the decision record is among the publication paths handed over')
    for (let index = 1; index < handed.length; index += 2) {
      assert.ok(handed[index].startsWith(`${path.join(STATE_DIR, 'publication-snapshot-')}`),
        `the gate judges frozen snapshot bytes, never a worktree path: ${handed[index]}`)
    }
  } finally {
    process.env.PATH = gateOriginalPath
    __setSupervisorCommitter(gateCommitter)
    __setSupervisorCommitVerifier(gateVerifier)
    finishRun(gateRun, 'error')
    fs.rmSync(gateReceipt, { force: true })
    fs.rmSync(gateShimDirectory, { recursive: true, force: true })
    for (const name of snapshotDirectories()) {
      if (!gateSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // A gate that cannot reach a verdict is not permission to seal. The blind-validator block above cannot
  // prove this call site: its shim fails the FIRST python3 call (the catalogue). This shim lets the catalogue
  // validator through and silences only the decision gate, which runs for every snapshot. It "says" one
  // blank line: whitespace-only stderr is truthy, and a refusal built from it used to name nothing at all.
  const muteRelative = `${root}/reviews/2099-01-07_mute_gate_review.json`
  const muteAbsolute = path.join(REPO_ROOT, muteRelative)
  fs.mkdirSync(path.dirname(muteAbsolute), { recursive: true })
  const muteRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(muteAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  muteRun.publicationToken = randomUUID()
  beginExecutionAttempt(muteRun)
  fs.writeFileSync(muteAbsolute, '{"verdict":"a catalogued review the decision gate never gets to judge"}\n')
  const muteReceipt = path.join(STATE_DIR, 'publication-ready', `${muteRun.runId}.json`)
  const muteSnapshotsBefore = snapshotDirectories()
  const muteShimDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'decision-gate-mute-'))
  fs.writeFileSync(path.join(muteShimDirectory, 'python3'), [
    '#!/bin/sh',
    'case "${1:-}" in */decision_publication_gate.py) echo "" >&2; exit 3 ;; esac',
    `exec '${realPython}' "$@"`,
    '',
  ].join('\n'), { mode: 0o755 })
  let muteCommits = 0
  const muteCommitter = __setSupervisorCommitter(async () => {
    muteCommits++
    return 'COMMIT_SHA=8888888888888888888888888888888888888888'
  })
  const muteVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(muteRun.runId, muteRun.publicationToken, {
      phase: 'commit', message: 'mute decision gate fixture', pathspecs: [muteRelative],
    })
    process.env.PATH = `${muteShimDirectory}${path.delimiter}${gateOriginalPath ?? ''}`
    await assert.rejects(
      drainPublicationIntents(muteRun),
      // The size limit shares this prefix, so the prefix alone would not show WHICH check refused: the
      // refusal names the gate itself. What follows depends on how the process died (`Command failed: …`
      // here, a bare `spawnSync python3 EPIPE` when it exits before reading its stdin, as on Linux CI), so
      // only require that there IS a detail.
      (error: any) => /refused before its frozen snapshot was sealed: scripts\/decision_publication_gate\.py did not pass: \S/
        .test(String(error?.message)),
      'a decision gate that cannot reach a verdict refuses the publication, and the refusal says what failed',
    )
    assert.equal(muteCommits, 0)
    assert.equal(fs.existsSync(muteReceipt), false, 'an unjudged snapshot is never sealed')
    assert.deepEqual(snapshotDirectories(), muteSnapshotsBefore, 'an unjudged snapshot is not left behind')
  } finally {
    process.env.PATH = gateOriginalPath
    __setSupervisorCommitter(muteCommitter)
    __setSupervisorCommitVerifier(muteVerifier)
    finishRun(muteRun, 'error')
    fs.rmSync(muteReceipt, { force: true })
    fs.rmSync(muteShimDirectory, { recursive: true, force: true })
    for (const name of snapshotDirectories()) {
      if (!muteSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // commit-run.sh's snapshot staging also refuses one file above 128 MiB, and no retry shrinks a sealed file.
  // The file is sparse: the refusal comes from its stat, so nothing of that size is read, copied or written
  // by this test. (The exact boundary is not pinned, because a file AT the limit would be read in full.)
  const oversizedRoot = `${root}_oversized`
  const oversizedAbsolute = path.join(REPO_ROOT, oversizedRoot)
  extraCleanup.push(oversizedAbsolute)
  fs.mkdirSync(oversizedAbsolute, { recursive: true })
  fs.writeFileSync(path.join(oversizedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZHUGE', version: 1 }))
  fs.writeFileSync(path.join(oversizedAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const oversized = createRun({
    kind: 'full', ticker: 'ZZHUGE', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: oversizedRoot, willCommitToMain: true,
    writeTargetsAbs: [oversizedAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  oversized.publicationToken = randomUUID()
  beginExecutionAttempt(oversized)
  fs.writeFileSync(path.join(oversizedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZHUGE', version: 2 }))
  fs.writeFileSync(path.join(oversizedAbsolute, 'oversized-note.md'), '')
  fs.truncateSync(path.join(oversizedAbsolute, 'oversized-note.md'), 128 * 1024 * 1024 + 1)
  const oversizedReceipt = path.join(STATE_DIR, 'publication-ready', `${oversized.runId}.json`)
  const oversizedSnapshotsBefore = snapshotDirectories()
  let oversizedCommits = 0
  const oversizedCommitter = __setSupervisorCommitter(async () => {
    oversizedCommits++
    return 'COMMIT_SHA=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
  })
  const oversizedVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(oversized.runId, oversized.publicationToken, {
      phase: 'commit', message: 'oversized fixture', pathspecs: [oversizedRoot],
    })
    await assert.rejects(
      drainPublicationIntents(oversized),
      (error: any) => /refused before its frozen snapshot was sealed/.test(String(error?.message))
        && String(error?.message).includes(`${oversizedRoot}/oversized-note.md`)
        && /above the 134217728-byte limit/.test(String(error?.message)),
      'a file commit-run.sh is certain to refuse is never sealed, and the refusal names it',
    )
    assert.equal(oversizedCommits, 0)
    assert.equal(fs.existsSync(oversizedReceipt), false)
    assert.deepEqual(snapshotDirectories(), oversizedSnapshotsBefore, 'a refused file leaves no protected snapshot behind')
  } finally {
    __setSupervisorCommitter(oversizedCommitter)
    __setSupervisorCommitVerifier(oversizedVerifier)
    finishRun(oversized, 'error')
    fs.rmSync(oversizedReceipt, { force: true })
    for (const name of snapshotDirectories()) {
      if (!oversizedSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // Once the provider group is extinct, a Git/push failure retains a protected immutable ready receipt.
  // A restart retries that exact snapshot without launching either provider or trusting mutable HEAD.
  const recoveryRelative = `${root}/reviews/2099-01-03_recovery_review.json`
  const recoveryAbsolute = path.join(REPO_ROOT, recoveryRelative)
  fs.mkdirSync(path.dirname(recoveryAbsolute), { recursive: true })
  const recoveryRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(recoveryAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  recoveryRun.publicationToken = randomUUID()
  beginExecutionAttempt(recoveryRun)
  fs.writeFileSync(recoveryAbsolute, '{"verdict":"ready recovery fixture"}\n')
  const failedRecoveryCommitter = __setSupervisorCommitter(async () => { throw new Error('fixture push failed') })
  const recoveryVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(recoveryRun.runId, recoveryRun.publicationToken, {
      phase: 'commit', message: 'ready recovery fixture', pathspecs: [recoveryRelative],
    })
    await assert.rejects(drainPublicationIntents(recoveryRun), /fixture push failed/)
    let retried = 0
    const retryCommitter = __setSupervisorCommitter(async () => {
      retried++
      return 'COMMIT_SHA=3333333333333333333333333333333333333333'
    })
    try {
      assert.equal(await recoverReadyPublications(), 1)
      assert.equal(retried, 1, 'providerless recovery publishes the one protected snapshot exactly once')
      assert.equal(await recoverReadyPublications(), 0, 'a cleared ready receipt cannot replay')
    } finally { __setSupervisorCommitter(retryCommitter) }
  } finally {
    __setSupervisorCommitter(failedRecoveryCommitter)
    __setSupervisorCommitVerifier(recoveryVerifier)
    finishRun(recoveryRun, 'error')
  }

  // A retained receipt commits the OLD bytes frozen when it was sealed. The live path keeps admitting runs
  // while a receipt is retained, and /research:rerun writes into the latest existing run root, so a newer run
  // can publish some of the same paths before the old receipt is retried. Committing those would revert
  // published research to stale bytes; refusing the whole receipt instead left the run's own files
  // unpublished forever (a superseded receipt never becomes un-superseded), and a screener signal carries a
  // board index rewritten by most commits on main. Recovery commits exactly the paths nothing newer replaced.
  const readyDirectory = path.join(STATE_DIR, 'publication-ready')
  const supersededArchiveRoot = path.join(STATE_DIR, 'publication-superseded')
  const archivesFor = (runId: string) => (fs.existsSync(supersededArchiveRoot) ? fs.readdirSync(supersededArchiveRoot) : [])
    .filter((name) => name.startsWith(`${runId}-`)).map((name) => path.join(supersededArchiveRoot, name))
  /** Seal a receipt through the real drain, then fail its commit so it is retained for a later pass. */
  async function retainedReceipt(options: {
    kind: 'review' | 'module' | 'full'; runRoot: string; files: Record<string, string>; module?: string
    /** Let the live primary commit succeed, so the RUN_METADATA backfill commit is the one that fails. */
    failBackfillOnly?: boolean
  }) {
    const writeTargets = [...new Set(Object.keys(options.files).map((relative) => path.dirname(path.join(REPO_ROOT, relative))))]
    for (const [relative, body] of Object.entries(options.files)) {
      fs.mkdirSync(path.dirname(path.join(REPO_ROOT, relative)), { recursive: true })
    }
    const created = createRun({
      kind: options.kind, ticker: 'ZZPROVSUP', module: options.module, provider: 'claude', executionProfile: profile,
      profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
      userVia: 'local', runRoot: options.runRoot, willCommitToMain: true,
      writeTargetsAbs: writeTargets, coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
    })
    created.publicationToken = randomUUID()
    beginExecutionAttempt(created)
    // A full run's decision record must be authored AFTER the attempt began, exactly as a real run's is.
    for (const [relative, body] of Object.entries(options.files)) fs.writeFileSync(path.join(REPO_ROOT, relative), body)
    await new Promise((resolve) => setTimeout(resolve, 25)) // created_at has millisecond resolution: keep seals ordered
    let liveCommits = 0
    const failed = __setSupervisorCommitter(async () => {
      if (options.failBackfillOnly && liveCommits++ === 0) return `COMMIT_SHA=${'6'.repeat(40)}`
      throw new Error('fixture push failed')
    })
    const verifier = __setSupervisorCommitVerifier(async () => {})
    try {
      await queuePublicationIntent(created.runId, created.publicationToken, {
        phase: 'commit', message: `retained ${options.runRoot} ${created.runId}`, pathspecs: Object.keys(options.files),
      })
      await assert.rejects(drainPublicationIntents(created), /fixture push failed/)
    } finally {
      __setSupervisorCommitter(failed)
      __setSupervisorCommitVerifier(verifier)
      finishRun(created, 'error')
    }
    const receipt = path.join(readyDirectory, `${created.runId}.json`)
    assert.equal(fs.existsSync(receipt), true, 'the failed live commit retained its sealed receipt')
    const value = JSON.parse(fs.readFileSync(receipt, 'utf8'))
    return {
      run: created, receipt, bytes: fs.readFileSync(receipt), paths: value.paths as string[],
      sealedAt: value.created_at as string, snapshotDirectory: path.dirname(value.snapshot_manifest as string),
      hashes: value.artifact_hashes as Record<string, string>,
    }
  }
  /** Stand in for newer commits on main: this suite runs in the real checkout and must never commit. */
  const supersede = (sealedAt: string, paths: string[]) => paths.map((relative) => ({
    path: relative, commit: '8'.repeat(40), committedAt: Math.floor(Date.parse(sealedAt) / 1000) + 600,
  }))
  /** Capture exactly what reaches commit-run.sh: the path list and the protected manifest behind it. */
  const commitCapture = (fail?: (message: string, pathspecs: string[]) => boolean) => {
    const calls: Array<{ message: string; pathspecs: string[]; manifestPaths: string[]; manifestBytesMatch: boolean }> = []
    const previous = __setSupervisorCommitter(async (message, pathspecs, env) => {
      const manifest = JSON.parse(fs.readFileSync(env.NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST!, 'utf8'))
      calls.push({
        message, pathspecs: [...pathspecs],
        manifestPaths: manifest.entries.map((item: any) => item.path),
        manifestBytesMatch: manifest.requested_pathspecs.length === pathspecs.length
          && manifest.entries.every((item: any) => `sha256:${createHash('sha256').update(fs.readFileSync(item.snapshot)).digest('hex')}` === item.sha256),
      })
      if (fail?.(message, pathspecs)) throw new Error('fixture push failed again')
      return `COMMIT_SHA=${'5'.repeat(40)}`
    })
    return { calls, restore: () => __setSupervisorCommitter(previous) }
  }

  // 1. The superseded path lies OUTSIDE the run's root (the shape of a signal's shared board index or ledger).
  //    The run's own publication is whole: its remainder publishes and it is credited with the root.
  const sharedRoot = `${root}_remainder`
  extraCleanup.push(path.join(REPO_ROOT, sharedRoot), path.join(REPO_ROOT, `${sharedRoot}_shared`))
  const sharedRelative = `${sharedRoot}_shared/reviews/2099-01-08_shared_projection_review.json`
  const ownRelative = `${sharedRoot}/valuation/2099-01-08_own_note.md`
  const outside = await retainedReceipt({
    kind: 'module', module: 'valuation', runRoot: sharedRoot, files: {
      [ownRelative]: 'this run\'s own output\n',
      [sharedRelative]: '{"projection":"sealed before a newer rebuild was published"}\n',
    },
  })
  assert.ok(outside.paths.includes(sharedRelative) && outside.paths.includes(ownRelative) && outside.paths.length >= 3,
    'the fixture receipt binds its own files, its execution receipt, and the shared projection')
  const outsideCommits = outside.paths.filter((relative) => relative !== sharedRelative)
  const snapshotsBeforeRemainder = snapshotDirectories()
  const probed: Array<Parameters<typeof supersededPublicationPaths>[0]> = []
  const realProbe = __setSupersededPublicationProbe((input) => {
    probed.push(input)
    return input.sealedAt === outside.sealedAt ? supersede(input.sealedAt, [sharedRelative]) : []
  })
  assert.equal(realProbe, supersededPublicationPaths,
    'production recovery is wired to the real git probe, not to a stub that always answers "not superseded"')
  const remainderVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    // A push that fails again part-way must leave the original receipt exactly as it was, for the next pass.
    let failNext = true
    const flaky = commitCapture(() => { const fail = failNext; failNext = false; return fail })
    try {
      assert.equal(await recoverReadyPublications(), 0)
      assert.deepEqual(flaky.calls.map((call) => call.pathspecs), [outsideCommits],
        'only the paths nothing newer replaced reach Git')
      assert.equal(fs.readFileSync(outside.receipt).equals(outside.bytes), true, 'the signed receipt is never edited')
      assert.equal(fs.existsSync(outside.snapshotDirectory), true, 'its sealed snapshot is retained with it')
      assert.deepEqual(snapshotDirectories(), snapshotsBeforeRemainder, 'the remainder commit input is always removed')
      assert.equal(listReadyPublicationFailures().filter((item) => item.entry === `${outside.run.runId}.json`).length, 1,
        'a failed remainder commit is reported like any other failed publication')
      assert.deepEqual(archivesFor(outside.run.runId), [], 'nothing is archived until the remainder is published')

      assert.equal(await recoverReadyPublications(), 1, 'the remainder publication counts as recovered')
      const call = flaky.calls.at(-1)!
      assert.deepEqual(call.pathspecs, outsideCommits)
      assert.deepEqual(call.manifestPaths, outsideCommits,
        'commit-run.sh receives a manifest whose entries are exactly the remainder, so it cannot stage a superseded path')
      assert.equal(call.manifestBytesMatch, true, 'the remainder is committed from the sealed bytes, never the worktree')
    } finally { flaky.restore() }
    assert.deepEqual(probed.filter((input) => input.sealedAt === outside.sealedAt).map((input) => [input.entries.map((item) => item.path), input.boundHashes]).at(-1),
      [outside.paths, outside.hashes], "the check is driven by the signed receipt's own paths and bound hashes")
    assert.equal(fs.existsSync(outside.receipt), false, 'a settled receipt leaves the retry directory')
    assert.deepEqual(listReadyPublicationFailures().filter((item) => item.entry === `${outside.run.runId}.json`), [],
      'a settled receipt is not reported as stuck')
    const settled = listSupersededReadyPublications().filter((item) => item.entry === `${outside.run.runId}.json`)
    assert.equal(settled.length, 1)
    assert.equal(settled[0].outcome, 'published-remainder')
    assert.equal(settled[0].runRootRepublished, false, `${sharedRoot}_shared is a sibling of the run root, not inside it`)
    assert.equal(settled[0].publishedPaths, outsideCommits.length)
    assert.deepEqual(settled[0].examples.map((item) => item.path), [sharedRelative])
    const [archive] = archivesFor(outside.run.runId)
    assert.ok(archive, 'the settled receipt is archived')
    assert.equal(fs.readFileSync(path.join(archive, 'receipt.json')).equals(outside.bytes), true, 'the original signed receipt is archived byte for byte')
    assert.equal(fs.existsSync(outside.snapshotDirectory), false)
    const archivedManifest = JSON.parse(fs.readFileSync(path.join(archive, 'snapshot', 'manifest.json'), 'utf8'))
    assert.deepEqual(archivedManifest.entries.map((item: any) => item.path), outside.paths,
      'every sealed byte is kept, including the superseded bytes that never reached main')
    const archivedDetail = JSON.parse(fs.readFileSync(path.join(archive, 'superseded.json'), 'utf8'))
    assert.deepEqual([archivedDetail.outcome, archivedDetail.published_paths, archivedDetail.superseded.map((item: any) => item.path)],
      ['published-remainder', outsideCommits, [sharedRelative]])
    assert.notEqual(readLastProviderSelection(sharedRoot, 'published'), null,
      'the run published its whole own scope, so it is credited with its root')
    const quiet = commitCapture()
    try {
      assert.equal(await recoverReadyPublications(), 0, 'a settled receipt cannot replay')
      assert.equal(quiet.calls.length, 0)
    } finally { quiet.restore() }
  } finally {
    __setSupersededPublicationProbe(realProbe)
    __setSupervisorCommitVerifier(remainderVerifier)
    fs.rmSync(outside.receipt, { force: true })
    for (const archive of archivesFor(outside.run.runId)) fs.rmSync(archive, { recursive: true, force: true })
  }

  /** Record every verification: which paths were required, and which hashes they were checked against. */
  const verifyCapture = () => {
    const calls: Array<{ required: string[]; bound: string[] }> = []
    const previous = __setSupervisorCommitVerifier(async (_output, requiredPaths, fixedHashes) => {
      calls.push({ required: [...requiredPaths].sort(), bound: Object.keys(fixedHashes ?? {}).sort() })
    })
    return { calls, restore: () => __setSupervisorCommitVerifier(previous) }
  }
  const without = (paths: string[], ...suffixes: string[]) => paths.filter((relative) => !suffixes.some((suffix) => relative.endsWith(suffix))).sort()

  // 2. A publication that carries none of its root's terminal records (a review here; equally a module, agent
  //    or handoff run) cannot tell a newer run of the root from an unrelated rewrite. When anything inside its
  //    root was superseded, it publishes the rest but is not credited with the root: the live path never
  //    credits such a run at all, and an older one must never overwrite a newer run's authority.
  const republishedRoot = `${root}_republished`
  extraCleanup.push(path.join(REPO_ROOT, republishedRoot))
  const keptRelative = `${republishedRoot}/reviews/2099-01-09_kept_review.json`
  const rerunRelative = `${republishedRoot}/reviews/2099-01-09_rerun_review.json`
  const inside = await retainedReceipt({
    kind: 'review', runRoot: republishedRoot, files: {
      [keptRelative]: '{"verdict":"nothing newer replaced this"}\n',
      [rerunRelative]: '{"verdict":"a newer publication replaced this"}\n',
    },
  })
  // 3. Every path was replaced by newer published bytes: nothing is left to publish, so nothing is committed.
  const retiredRoot = `${root}_retired`
  extraCleanup.push(path.join(REPO_ROOT, retiredRoot))
  const retired = await retainedReceipt({
    kind: 'review', runRoot: retiredRoot, files: {
      [`${retiredRoot}/reviews/2099-01-10_replaced_review.json`]: '{"verdict":"replaced"}\n',
    },
  })
  // 4. Full research runs, which carry their root's terminal records.
  //    (a) Only an ordinary module file was superseded: the root is still this run's. The remainder publishes,
  //        RUN_METADATA is filled with its commit, and the run is credited.
  //    (b) Its decision record was superseded: a newer run owns the root. RUN_METADATA still names the commit
  //        that published THIS run, so it is filled; the run is not credited. Its backfill push fails first,
  //        and the retained backfill receipt must carry that decision: its retry cannot credit the run either.
  //    (c) Its live primary commit landed and only the backfill push failed; a newer rerun then re-published
  //        a primary file it binds by hash alone. The backfill publishes, verified against the rest.
  // A decision record that commit-run.sh's creation-time data-needs gate accepts, so the fixture stays a real
  // publishable run wherever that gate is applied (the same minimum fields scripts/test_commit_run.py uses).
  const fullDecision = (label: string, version: number) => `${JSON.stringify({
    ticker: `ZZ${label}`, version, decision_date: '2099-01-01', data_needs_schema_version: '2.0', data_needs: [],
  })}\n`
  const fullFiles = (fullRoot: string, label: string) => ({
    [`${fullRoot}/decision_record.json`]: fullDecision(label, 2),
    [`${fullRoot}/RUN_METADATA.md`]: 'Commit SHA: (to be filled after commit)\n',
    [`${fullRoot}/valuation/2099-01-11_superseded_note.md`]: 'sealed module output\n',
    [`${fullRoot}/valuation/2099-01-11_kept_note.md`]: 'module output nothing newer replaced\n',
  })
  const fullRun = async (suffix: string, failBackfillOnly = false) => {
    const fullRoot = `${root}_${suffix}`
    extraCleanup.push(path.join(REPO_ROOT, fullRoot))
    fs.mkdirSync(path.join(REPO_ROOT, fullRoot, 'valuation'), { recursive: true })
    fs.writeFileSync(path.join(REPO_ROOT, fullRoot, 'decision_record.json'), fullDecision(suffix.toUpperCase(), 1))
    return { fullRoot, retained: await retainedReceipt({ kind: 'full', runRoot: fullRoot, files: fullFiles(fullRoot, suffix.toUpperCase()), failBackfillOnly }) }
  }
  const ordinary = await fullRun('fullremainder')
  const handover = await fullRun('fullhandover')
  const bound = await fullRun('fullbound', true)
  const boundValue = JSON.parse(fs.readFileSync(bound.retained.receipt, 'utf8'))
  assert.deepEqual([boundValue.stage, bound.retained.paths], ['backfill-ready', [`${bound.fullRoot}/RUN_METADATA.md`]],
    'the fixture retained a backfill receipt that binds its primary files by hash alone')
  const bySeal = new Map([
    [inside.sealedAt, [rerunRelative]],
    [retired.sealedAt, retired.paths],
    [ordinary.retained.sealedAt, [`${ordinary.fullRoot}/valuation/2099-01-11_superseded_note.md`]],
    [handover.retained.sealedAt, [`${handover.fullRoot}/decision_record.json`, `${handover.fullRoot}/valuation/2099-01-11_superseded_note.md`]],
    [bound.retained.sealedAt, [`${bound.fullRoot}/valuation/2099-01-11_superseded_note.md`]],
  ])
  const insideProbe = __setSupersededPublicationProbe((input) => supersede(input.sealedAt, bySeal.get(input.sealedAt) ?? []))
  const verified = verifyCapture()
  let failedHandoverBackfill = false
  const capture = commitCapture((message, pathspecs) => {
    if (failedHandoverBackfill || !message.startsWith('Backfill commit SHA')
        || !isDeepStrictEqual(pathspecs, [`${handover.fullRoot}/RUN_METADATA.md`])) return false
    failedHandoverBackfill = true
    return true
  })
  const neverVerifiedAgainst = (superseded: string[]) => !verified.calls.some((call) =>
    superseded.some((relative) => call.required.includes(relative) || call.bound.includes(relative)))
  try {
    await recoverReadyPublications()
    const commitsFor = (item: { run: { runId: string } }) => capture.calls.filter((call) => call.message.includes(item.run.runId))
    const inRoot = (fullRoot: string) => capture.calls.filter((call) => call.pathspecs.every((relative) => relative.startsWith(`${fullRoot}/`)))
    for (const call of capture.calls) assert.equal(call.manifestBytesMatch, true, 'every commit is built from sealed bytes')

    // 2 and 3
    assert.deepEqual(commitsFor(inside).map((call) => call.pathspecs), [[keptRelative]], 'the replaced path never reaches Git')
    assert.deepEqual(commitsFor(retired), [], 'a fully replaced receipt makes no commit at all')
    const settled = new Map(listSupersededReadyPublications().map((item) => [item.entry, item]))
    assert.equal(settled.get(`${inside.run.runId}.json`)?.outcome, 'published-remainder')
    assert.equal(settled.get(`${inside.run.runId}.json`)?.runRootRepublished, true)
    assert.equal(readLastProviderSelection(republishedRoot, 'published'), null,
      'a publication without its root\'s terminal records is never credited over a root something newer wrote into')
    assert.ok(verified.calls.some((call) => isDeepStrictEqual(call.bound, [keptRelative])), 'it is verified against its kept hashes')
    assert.ok(neverVerifiedAgainst([rerunRelative]), 'and never against the superseded one, which would fail at every startup')
    assert.equal(settled.get(`${retired.run.runId}.json`)?.outcome, 'retired')
    assert.equal(settled.get(`${retired.run.runId}.json`)?.publishedPaths, 0)

    // 4a
    const ordinaryPrimary = without(ordinary.retained.paths, '2099-01-11_superseded_note.md')
    assert.deepEqual(inRoot(ordinary.fullRoot).map((call) => call.pathspecs.sort()), [ordinaryPrimary, [`${ordinary.fullRoot}/RUN_METADATA.md`]],
      'the remainder publishes, then RUN_METADATA through its own backfill receipt')
    assert.equal(fs.readFileSync(path.join(REPO_ROOT, ordinary.fullRoot, 'RUN_METADATA.md'), 'utf8'), `Commit SHA: ${'5'.repeat(40)}\n`)
    assert.ok(verified.calls.some((call) => isDeepStrictEqual(call.bound, ordinaryPrimary)),
      'the remainder is verified against exactly its kept hashes')
    assert.ok(neverVerifiedAgainst([`${ordinary.fullRoot}/valuation/2099-01-11_superseded_note.md`]),
      'neither the remainder nor its backfill vouches for the superseded file')
    assert.equal(settled.get(`${ordinary.retained.run.runId}.json`)?.runRootRepublished, false,
      'an ordinary module file replaced in the root does not hand the root over')
    assert.notEqual(readLastProviderSelection(ordinary.fullRoot, 'published'), null)

    // 4b, first pass: the remainder published, RUN_METADATA was filled, and the backfill push failed.
    assert.equal(failedHandoverBackfill, true, 'the fixture failed the handover backfill push')
    const handoverPrimary = without(handover.retained.paths, 'decision_record.json', '2099-01-11_superseded_note.md')
    assert.deepEqual(inRoot(handover.fullRoot).map((call) => call.pathspecs.sort()), [handoverPrimary, [`${handover.fullRoot}/RUN_METADATA.md`]],
      'a root a newer run took over still gets this run\'s RUN_METADATA filled, never its decision re-published')
    assert.equal(fs.readFileSync(path.join(REPO_ROOT, handover.fullRoot, 'RUN_METADATA.md'), 'utf8'), `Commit SHA: ${'5'.repeat(40)}\n`)
    const handoverBackfill = JSON.parse(fs.readFileSync(handover.retained.receipt, 'utf8'))
    assert.deepEqual([handoverBackfill.stage, handoverBackfill.authority_withheld], ['backfill-ready', true],
      'the retained backfill receipt carries the hand-over decision')
    assert.ok(!Object.keys(handoverBackfill.artifact_hashes).some((relative: string) => relative.endsWith('decision_record.json')))
    assert.equal(readLastProviderSelection(handover.fullRoot, 'published'), null)
    assert.ok(neverVerifiedAgainst([`${handover.fullRoot}/decision_record.json`, `${handover.fullRoot}/valuation/2099-01-11_superseded_note.md`]))
    assert.equal(archivesFor(handover.retained.run.runId).length, 1, 'the original was archived when its backfill receipt replaced it')

    // 4c
    const boundAll = Object.keys(bound.retained.hashes).sort()
    assert.deepEqual(inRoot(bound.fullRoot).map((call) => call.pathspecs), [[`${bound.fullRoot}/RUN_METADATA.md`]])
    assert.ok(verified.calls.some((call) => isDeepStrictEqual(call.bound, without(boundAll, '2099-01-11_superseded_note.md'))),
      'a backfill receipt is verified against its bound primaries minus the one a newer rerun re-published')
    assert.ok(neverVerifiedAgainst([`${bound.fullRoot}/valuation/2099-01-11_superseded_note.md`]),
      'never against the superseded primary: that would fail at every startup')
    assert.equal(settled.get(`${bound.retained.run.runId}.json`)?.runRootRepublished, false)
    assert.notEqual(readLastProviderSelection(bound.fullRoot, 'published'), null)

    // 4b, next pass: the retained backfill receipt publishes, and still credits nobody.
    const beforeRetry = capture.calls.length
    assert.equal(await recoverReadyPublications(), 1)
    assert.deepEqual(capture.calls.slice(beforeRetry).map((call) => call.pathspecs), [[`${handover.fullRoot}/RUN_METADATA.md`]])
    assert.equal(readLastProviderSelection(handover.fullRoot, 'published'), null,
      'the retry of a hand-over backfill receipt does not credit the run over the newer one')

    for (const item of [inside, retired, ordinary.retained, handover.retained, bound.retained]) {
      assert.equal(fs.existsSync(item.receipt), false, 'no settled receipt stays behind to be re-reported at every startup')
      const archives = archivesFor(item.run.runId)
      assert.equal(archives.length, 1, 'each is archived once, with its sealed bytes')
      assert.equal(fs.readFileSync(path.join(archives[0], 'receipt.json')).equals(item.bytes), true)
      assert.equal(fs.existsSync(path.join(archives[0], 'superseded.json')), true, 'a complete archive carries its record')
    }
    assert.deepEqual(fs.readdirSync(readyDirectory).filter((name) => name.endsWith('.json')), [])
  } finally {
    capture.restore()
    verified.restore()
    __setSupersededPublicationProbe(insideProbe)
    for (const item of [inside, retired, ordinary.retained, handover.retained, bound.retained]) {
      fs.rmSync(item.receipt, { force: true })
      for (const archive of archivesFor(item.run.runId)) fs.rmSync(archive, { recursive: true, force: true })
    }
  }

  // 5. A newer retained receipt that FAILS this pass still wins its paths, whether its push fails or its own
  //    supersession check cannot run. The older must not commit a path the newer carries with different
  //    bytes, or at the next pass the newer would read those older bytes as a newer publication and drop its
  //    own. Paths both carry with identical bytes are the older's to publish.
  for (const failure of ['push', 'probe'] as const) {
    const claimsRoot = `${root}_claims_${failure}`
    extraCleanup.push(path.join(REPO_ROOT, claimsRoot))
    const claimFiles = (label: string) => ({
      [`${claimsRoot}/valuation/2099-01-12_${label}_only.md`]: `${label} alone\n`,
      [`${claimsRoot}/valuation/2099-01-12_shared.md`]: `${label} version of a shared file\n`,
      [`${claimsRoot}/valuation/2099-01-12_identical.md`]: 'the same bytes in both\n',
    })
    const older = await retainedReceipt({ kind: 'module', module: 'valuation', runRoot: claimsRoot, files: claimFiles('older') })
    const newer = await retainedReceipt({ kind: 'module', module: 'valuation', runRoot: claimsRoot, files: claimFiles('newer') })
    assert.ok(Date.parse(older.sealedAt) < Date.parse(newer.sealedAt))
    const claimsProbe = __setSupersededPublicationProbe((input) => {
      if (failure === 'probe' && input.sealedAt === newer.sealedAt) throw new Error('fixture git failure')
      return []
    })
    const claimsVerifier = __setSupervisorCommitVerifier(async () => {})
    try {
      const firstPass = commitCapture((message) => failure === 'push' && message.includes(newer.run.runId))
      try {
        assert.equal(await recoverReadyPublications(), 1)
        const olderCall = firstPass.calls.find((call) => call.message.includes(older.run.runId))
        assert.ok(olderCall, `the older receipt still publishes (${failure})`)
        assert.ok(!olderCall.pathspecs.includes(`${claimsRoot}/valuation/2099-01-12_shared.md`),
          `the older receipt never commits a path a newer retained receipt carries with different bytes (${failure})`)
        assert.ok(!olderCall.pathspecs.includes(`${claimsRoot}/valuation/${EXECUTION_RECEIPT_NAME}`),
          'its execution receipt differs from the newer one too')
        assert.ok(olderCall.pathspecs.includes(`${claimsRoot}/valuation/2099-01-12_identical.md`)
          && olderCall.pathspecs.includes(`${claimsRoot}/valuation/2099-01-12_older_only.md`),
        'identical and unshared paths are the older receipt\'s to publish')
        assert.equal(listReadyPublicationFailures().filter((item) => item.entry === `${newer.run.runId}.json`).length, 1)
        assert.equal(fs.existsSync(newer.receipt), true, 'the failed newer receipt is retained intact')
        assert.equal(listSupersededReadyPublications().find((item) => item.entry === `${older.run.runId}.json`)?.examples[0]?.receipt,
          `${newer.run.runId}.json`, 'the report names the newer receipt holding the path')
      } finally { firstPass.restore() }
      __setSupersededPublicationProbe(() => [])
      const secondPass = commitCapture()
      try {
        assert.equal(await recoverReadyPublications(), 1)
        assert.deepEqual(secondPass.calls.map((call) => call.pathspecs), [newer.paths],
          'the newer receipt publishes every one of its paths at the next pass')
      } finally { secondPass.restore() }
    } finally {
      __setSupersededPublicationProbe(claimsProbe)
      __setSupervisorCommitVerifier(claimsVerifier)
      for (const item of [older, newer]) {
        fs.rmSync(item.receipt, { force: true })
        for (const archive of archivesFor(item.run.runId)) fs.rmSync(archive, { recursive: true, force: true })
      }
    }
  }

  // 6. A newer retained receipt that cannot even be VERIFIED this pass (here its sealed snapshot is unreadable)
  //    lists paths an older receipt shares. The older waits instead of racing it, and publishes once the
  //    newer one does.
  {
    const waitRoot = `${root}_unverified`
    extraCleanup.push(path.join(REPO_ROOT, waitRoot))
    const waitFiles = (label: string) => ({ [`${waitRoot}/valuation/2099-01-13_shared.md`]: `${label} version\n` })
    const older = await retainedReceipt({ kind: 'module', module: 'valuation', runRoot: waitRoot, files: waitFiles('older') })
    const newer = await retainedReceipt({ kind: 'module', module: 'valuation', runRoot: waitRoot, files: waitFiles('newer') })
    const newerManifest = JSON.parse(fs.readFileSync(path.join(newer.snapshotDirectory, 'manifest.json'), 'utf8'))
    const hiddenSnapshot = newerManifest.entries[0].snapshot as string
    fs.chmodSync(hiddenSnapshot, 0o644) // an unsafe mode: readReadyPublication refuses to verify the receipt
    const waitProbe = __setSupersededPublicationProbe(() => [])
    const waitVerifier = __setSupervisorCommitVerifier(async () => {})
    try {
      const firstPass = commitCapture()
      try {
        assert.equal(await recoverReadyPublications(), 0)
        assert.deepEqual(firstPass.calls, [], 'the older receipt does not race a newer one it cannot compare against')
        const failures = new Map(listReadyPublicationFailures().map((item) => [item.entry, item.error]))
        assert.ok(failures.has(`${newer.run.runId}.json`))
        assert.match(failures.get(`${older.run.runId}.json`) ?? '', /could not be verified this pass/)
        assert.equal(fs.existsSync(older.receipt), true, 'the waiting receipt is retained intact')
      } finally { firstPass.restore() }
      fs.chmodSync(hiddenSnapshot, 0o600)
      const secondPass = commitCapture()
      try {
        assert.equal(await recoverReadyPublications(), 1, 'the newer publishes; the older drops the shared path and has nothing else')
        assert.deepEqual(secondPass.calls.map((call) => call.message.includes(newer.run.runId)), [true])
        assert.equal(listSupersededReadyPublications().find((item) => item.entry === `${older.run.runId}.json`)?.outcome, 'retired')
      } finally { secondPass.restore() }
    } finally {
      __setSupersededPublicationProbe(waitProbe)
      __setSupervisorCommitVerifier(waitVerifier)
      for (const item of [older, newer]) {
        fs.rmSync(item.receipt, { force: true })
        for (const archive of archivesFor(item.run.runId)) fs.rmSync(archive, { recursive: true, force: true })
      }
    }
  }

  // Retained receipts are retried NEWEST FIRST. A recovery commit is stamped "now", not the time its bytes
  // were sealed, so an older receipt retried first makes a newer one that shares a path look superseded by
  // it, and the older bytes win. The real case: a push fails, the run is auto-resumed into the same run root
  // under a new run id, the network is still down, and both receipts are retained. Receipt files are named
  // by random run id, so name order is arbitrary. To make the old name-order deterministic here, the run
  // whose id sorts FIRST is sealed first: name order would retry the OLDER receipt first.
  const orderedRuns = [0, 1].map((index) => {
    const relative = `${root}/reviews/2099-01-07_ordering_${index}_review.json`
    const created = createRun({
      kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
      profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
      userVia: 'local', runRoot: root, willCommitToMain: true,
      writeTargetsAbs: [path.dirname(path.join(REPO_ROOT, relative))], coveredModules: [], readDepsAbs: [],
      closeWatcher: undefined, expected: new Map(),
    })
    created.publicationToken = randomUUID()
    return { run: created, relative }
  }).sort((a, b) => `${a.run.runId}.json`.localeCompare(`${b.run.runId}.json`))
  const [olderSealed, newerSealed] = orderedRuns
  const orderingReceipts = orderedRuns.map(({ run: item }) => path.join(STATE_DIR, 'publication-ready', `${item.runId}.json`))
  const orderingFailedCommitter = __setSupervisorCommitter(async () => { throw new Error('fixture push failed') })
  const orderingVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    for (const [index, { run: item, relative }] of orderedRuns.entries()) {
      beginExecutionAttempt(item)
      fs.writeFileSync(path.join(REPO_ROOT, relative), `{"verdict":"ordering fixture, sealed ${index === 0 ? 'first' : 'second'}"}\n`)
      await queuePublicationIntent(item.runId, item.publicationToken!, {
        phase: 'commit', message: `ordering fixture sealed ${index === 0 ? 'first' : 'second'}`, pathspecs: [relative],
      })
      await assert.rejects(drainPublicationIntents(item), /fixture push failed/)
      await new Promise((resolve) => setTimeout(resolve, 25)) // created_at has millisecond resolution
    }
    const [olderAt, newerAt] = orderingReceipts.map((file) => Date.parse(JSON.parse(fs.readFileSync(file, 'utf8')).created_at))
    assert.ok(olderAt < newerAt, 'the fixture sealed the name-first receipt strictly earlier')
    const retried: string[] = []
    const orderingCommitter = __setSupervisorCommitter(async (message) => {
      retried.push(message)
      return 'COMMIT_SHA=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
    try {
      await recoverReadyPublications()
      assert.deepEqual(retried.filter((message) => message.startsWith('ordering fixture')),
        ['ordering fixture sealed second', 'ordering fixture sealed first'],
        'the newest receipt is retried first, so its bytes publish and an older overlapping receipt\'s copy is the one dropped')
      assert.ok(olderSealed.run.runId < newerSealed.run.runId, 'name order alone would have retried the older receipt first')
    } finally { __setSupervisorCommitter(orderingCommitter) }
  } finally {
    __setSupervisorCommitter(orderingFailedCommitter)
    __setSupervisorCommitVerifier(orderingVerifier)
    for (const { run: item } of orderedRuns) finishRun(item, 'error')
    for (const file of orderingReceipts) fs.rmSync(file, { force: true })
  }

  // Commit verification can succeed and the process can die before the provider/profile publication seal.
  // The ready receipt must still exist at that point. Startup recovers from it without another provider,
  // writes the durable published authority, and only then clears the receipt.
  const postCommitRoot = `${root}_postcommit`
  extraCleanup.push(path.join(REPO_ROOT, postCommitRoot))
  const postCommitRelative = `${postCommitRoot}/reviews/2099-01-04_post_commit_crash_review.json`
  const postCommitAbsolute = path.join(REPO_ROOT, postCommitRelative)
  fs.mkdirSync(path.dirname(postCommitAbsolute), { recursive: true })
  const postCommitRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: postCommitRoot, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(postCommitAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  postCommitRun.publicationToken = randomUUID()
  beginExecutionAttempt(postCommitRun)
  fs.writeFileSync(postCommitAbsolute, '{"verdict":"post-commit crash fixture"}\n')
  let directCommits = 0
  let providerCalls = 0 // this test never invokes launch/build/spawn; recovery is supervisor-only
  const postCommitCommitter = __setSupervisorCommitter(async () => {
    directCommits++
    return 'COMMIT_SHA=4444444444444444444444444444444444444444'
  })
  const postCommitVerifier = __setSupervisorCommitVerifier(async () => {})
  const postCommitSealer = __setPublicationAuthoritySealer(() => {
    throw new Error('fixture crash before publication authority fsync')
  })
  try {
    await queuePublicationIntent(postCommitRun.runId, postCommitRun.publicationToken, {
      phase: 'commit', message: 'post-commit crash fixture', pathspecs: [postCommitRelative],
    })
    await assert.rejects(drainPublicationIntents(postCommitRun), /fixture crash before publication authority fsync/)
    assert.equal(directCommits, 1, 'the immutable snapshot was already verified by Git before the crash')
    assert.equal(postCommitRun.publicationCompleted, false,
      'commit success is provisional until provider/profile publication authority is durable')
    assert.equal(postCommitRun.publicationPhase, 'terminal-failed')
    assert.match(postCommitRun.publicationError ?? '', /publication authority could not be sealed/)
    assert.equal(readLastProviderSelection(postCommitRoot, 'published'), null,
      'the injected crash happened before durable published provider authority')

    finalizeRunOnClose(postCommitRun, { exitCode: 0, failed: false }, '')
    assert.notEqual(postCommitRun.status, 'done',
      'provider close cannot terminalize a publication whose protected authority failed to fsync')

    // Two startup/test workers may both observe the same directory entry. Deterministically remove it
    // after readdir but before open: the losing reader skips an atomically consumed receipt, while the
    // restored identical receipt below remains available for the real providerless recovery assertion.
    const readyPath = path.join(STATE_DIR, 'publication-ready', `${postCommitRun.runId}.json`)
    const heldReadyPath = `${readyPath}.race-held`
    const originalOpenSync = fs.openSync.bind(fs)
    let removedBeforeOpen = false
    ;(fs as any).openSync = (target: fs.PathLike, ...args: any[]) => {
      if (!removedBeforeOpen && path.resolve(String(target)) === path.resolve(readyPath)) {
        fs.renameSync(readyPath, heldReadyPath)
        removedBeforeOpen = true
      }
      return (originalOpenSync as any)(target, ...args)
    }
    try {
      assert.equal(await recoverReadyPublications(), 0,
        'a receipt consumed between directory scan and open is a safe skip, not engine failure')
      assert.equal(removedBeforeOpen, true)
    } finally {
      ;(fs as any).openSync = originalOpenSync
      if (fs.existsSync(heldReadyPath)) fs.renameSync(heldReadyPath, readyPath)
    }

    // 2026-09-17 outage: this pass runs before listen(), so a rejection that escaped it stopped the whole
    // cockpit and launchd restarted it straight back into the same rejection until an operator intervened. A sealed
    // publication Git/the catalogue refuses must be reported and retained, never thrown.
    const rejectingCommitter = __setSupervisorCommitter(async () => {
      throw Object.assign(new Error('Command failed with exit code 5'), {
        stderr: 'DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data',
      })
    })
    try {
      assert.equal(await recoverReadyPublications(), 0,
        'a sealed publication that cannot publish is reported, not thrown into the startup path')
      assert.equal(fs.existsSync(readyPath), true, 'the rejected receipt is retained for the next recovery pass')
      assert.deepEqual(listReadyPublicationFailures().map((item) => [item.entry, item.error]), [
        [`${postCommitRun.runId}.json`, 'DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data'],
      ])
    } finally { __setSupervisorCommitter(rejectingCommitter) }

    __setPublicationAuthoritySealer(postCommitSealer)
    let recoveryCommits = 0
    const recoveryCommitter = __setSupervisorCommitter(async () => {
      recoveryCommits++
      return 'COMMIT_SHA=5555555555555555555555555555555555555555'
    })
    try {
      assert.equal(await recoverReadyPublications(), 1,
        'startup finds the still-retained ready receipt and seals the exact snapshot')
      assert.equal(recoveryCommits, 1)
      assert.equal(providerCalls, 0, 'provider recovery is never involved in the publication crash window')
      assert.equal(readLastProviderSelection(postCommitRoot, 'published')?.profileKey, profile.key)
      assert.equal(await recoverReadyPublications(), 0, 'the receipt clears only after authority is durable')
      assert.deepEqual(listReadyPublicationFailures(), [], 'a later successful pass clears the reported failure')
    } finally { __setSupervisorCommitter(recoveryCommitter) }
  } finally {
    __setPublicationAuthoritySealer(postCommitSealer)
    __setSupervisorCommitter(postCommitCommitter)
    __setSupervisorCommitVerifier(postCommitVerifier)
    finishRun(postCommitRun, 'error')
  }

  const configuredRoot = `${root}_configured-carry`
  extraCleanup.push(path.join(REPO_ROOT, configuredRoot))
  fs.mkdirSync(path.join(REPO_ROOT, configuredRoot), { recursive: true })
  const configured = attempt('codex')
  configured.runRoot = configuredRoot
  configured.executionProfile = {
    key: configured.profileKey, parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
  }
  configured.expected = new Map([['fixture', {
    key: 'fixture', module: 'business-model', name: 'fixture', layer: 1, outputRel: 'business-model/01_fixture.md',
  }]])
  beginExecutionAttempt(configured)
  const configuredRow = configured.currentExecutionAttempts?.find((row) => row.attribution === 'configured')
  assert.ok(configuredRow, 'fixture must contain a configured-only specialist row')
  const configuredContinuation = attempt('claude')
  configuredContinuation.runRoot = configuredRoot
  beginExecutionAttempt(configuredContinuation)
  const importedConfigured = configuredContinuation.executionAttempts?.find((row) =>
    row.attempt_id === configuredRow?.attempt_id && row.model === configuredRow?.model)
  assert.equal(importedConfigured?.attribution, 'configured',
    'configured-only lineage is never promoted to runtime-recorded during carry-forward')

  const sealedRoot = `${root}_sealed-carry`
  const sealedAbsolute = path.join(REPO_ROOT, sealedRoot)
  extraCleanup.push(sealedAbsolute)
  fs.mkdirSync(sealedAbsolute, { recursive: true })
  const sealedClaude = attempt('claude')
  sealedClaude.runRoot = sealedRoot
  beginExecutionAttempt(sealedClaude)
  const sealedDecision = path.join(sealedAbsolute, 'decision_record.json')
  fs.writeFileSync(sealedDecision, '{"ticker":"ZZSEALED","version":1}\n')
  const sealedRelative = `${sealedRoot}/decision_record.json`
  sealedClaude.publicationCompleted = true
  sealedClaude.publicationArtifactHashes = {
    [sealedRelative]: `sha256:${createHash('sha256').update(fs.readFileSync(sealedDecision)).digest('hex')}`,
  }
  releaseExecutionEpochAfterPublication(sealedClaude)
  const sealedCodex = attempt('codex')
  sealedCodex.runRoot = sealedRoot
  beginExecutionAttempt(sealedCodex)
  assert.deepEqual(new Set((sealedCodex.executionAttempts ?? []).map((row) => row.provider)),
    new Set(['claude', 'codex']),
    'a just-published Claude pipeline remains mixed when Codex continues the same root')

  // The screener integrity step intentionally patches only the immutable ledger copy. Publication must
  // accept exactly that deterministic ledger-only field while still rejecting every other divergence.
  const signalId = `SIG-20990101-${Date.now().toString(16).slice(-8).padStart(8, '0')}`
  const signalRoot = `screener/runs/${signalId}`
  const signalAbsolute = path.join(REPO_ROOT, signalRoot)
  const thesisId = `THS-${signalId}-v1`
  const ledgerRelative = `screener/ledger/theses/${thesisId}.json`
  const ledgerAbsolute = path.join(REPO_ROOT, ledgerRelative)
  extraCleanup.push(signalAbsolute, ledgerAbsolute)
  fs.mkdirSync(signalAbsolute, { recursive: true })
  fs.mkdirSync(path.dirname(ledgerAbsolute), { recursive: true })
  const signal = createRun({
    kind: 'signal', ticker: signalId, subjectId: signalId, swarmId: 'screener', unit: 'signal',
    provider: 'claude', executionProfile: profile, profileKey: profile.key, model: 'sonnet',
    reasoningLevel: 'default', prompt: '', user: 'test', userVia: 'local', runRoot: signalRoot,
    willCommitToMain: true, writeTargetsAbs: [signalAbsolute, ledgerAbsolute], coveredModules: [],
    readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  signal.publicationToken = 'signal-supervisor-capability'
  beginExecutionAttempt(signal)
  const thesis = screenerFixture('thesis_record', signalId)
  fs.writeFileSync(path.join(signalAbsolute, 'intake.json'), `${JSON.stringify(screenerFixture('intake', signalId))}\n`)
  fs.writeFileSync(path.join(signalAbsolute, 'signal_payload.json'), `${JSON.stringify(screenerFixture('signal_payload', signalId))}\n`)
  fs.writeFileSync(path.join(signalAbsolute, 'thesis_record.json'), `${JSON.stringify(thesis)}\n`)
  const review = {
    ...screenerFixture('thesis_integrity_review', signalId),
    verdict: 'Survives with haircut', routing: 'Proceed', reviewed_at: '2099-01-01T00:00:00Z',
    edge_score_haircut_note: 'fixture deterministic haircut',
  }
  fs.writeFileSync(path.join(signalAbsolute, 'thesis_integrity_review.json'), `${JSON.stringify(review)}\n`)
  fs.writeFileSync(ledgerAbsolute, `${JSON.stringify({
    ...thesis,
    forged_model_ledger_field: 'must be discarded',
    integrity_review: {
      ...review,
      review_file: `${signalRoot}/thesis_integrity_review.json`,
    },
  })}\n`)
  const stamped = await supervisePublication(signal.runId, signal.publicationToken, { phase: 'stamp' })
  assert.deepEqual(new Set(stamped.artifacts), new Set([`${signalRoot}/thesis_record.json`, ledgerRelative]))
  const projectedLedger = JSON.parse(fs.readFileSync(ledgerAbsolute, 'utf8'))
  assert.equal(projectedLedger.integrity_review.verdict, 'Survives with haircut')
  assert.equal(projectedLedger.forged_model_ledger_field, undefined,
    'the immutable ledger is derived from the run thesis, never trusted from model-prewritten bytes')
  finishRun(signal, 'done')
  fs.rmSync(signalAbsolute, { recursive: true, force: true })
  fs.rmSync(ledgerAbsolute, { force: true })

  await isolatedSchemaAcceptance()

  const schemaSignal = (provider: 'claude' | 'codex', retainHistory = false) => {
    const id = `SIG-20990102-${randomUUID().replaceAll('-', '').slice(0, 8)}`
    const relative = `screener/runs/${id}`
    const directory = path.join(REPO_ROOT, relative)
    const ledger = path.join(REPO_ROOT, 'screener', 'ledger', 'theses', `THS-${id}-v1.json`)
    extraCleanup.push(directory, ledger)
    fs.mkdirSync(directory, { recursive: true })
    if (retainHistory) {
      fs.writeFileSync(path.join(directory, 'thesis_record.json'), '{"retained_legacy_thesis":true}\n')
      fs.writeFileSync(path.join(directory, 'signal_payload.json'), '{"retained_legacy_payload":true}\n')
    }
    const selectedProfile = provider === 'claude' ? profile
      : { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' }
    const live = createRun({
      kind: 'signal', ticker: id, subjectId: id, swarmId: 'screener', unit: 'signal', provider,
      executionProfile: selectedProfile, profileKey: selectedProfile.key,
      model: selectedProfile.parentModel, reasoningLevel: selectedProfile.parentReasoning,
      prompt: '', user: 'test', userVia: 'local', runRoot: relative, willCommitToMain: true,
      writeTargetsAbs: [directory, ledger], coveredModules: [], readDepsAbs: [],
      closeWatcher: undefined, expected: new Map(),
    })
    live.publicationToken = `schema-capability-${id}`
    beginExecutionAttempt(live)
    return { id, relative, directory, ledger, live }
  }
  for (const provider of ['claude', 'codex'] as const) {
    for (const withThesis of [false, true]) {
      const fixture = schemaSignal(provider)
      try {
        const payload = screenerFixture('signal_payload', fixture.id)
        payload.event_id = `EVT-${'a'.repeat(16)}`
        const payloadPath = path.join(fixture.directory, 'signal_payload.json')
        fs.writeFileSync(payloadPath, `${JSON.stringify(payload)}\n`)
        const thesisPath = path.join(fixture.directory, 'thesis_record.json')
        if (withThesis) fs.writeFileSync(thesisPath, `${JSON.stringify(screenerFixture('thesis_record', fixture.id))}\n`)
        const thesisBefore = withThesis ? fs.readFileSync(thesisPath) : null
        await assert.rejects(supervisePublication(fixture.live.runId, fixture.live.publicationToken!, { phase: 'stamp' }),
          /schema validation refused before mutation:.*signal_payload\.json/s,
          `${provider}: every fresh mapped stage is checked, even beside a valid terminal thesis`)
        assert.equal(fixture.live.publicationRequested, undefined, 'schema refusal occurs before publication mutation is requested')
        assert.equal(fixture.live.publicationPhase, undefined, 'the retryable terminal phase remains open')
        assert.equal(fs.existsSync(fixture.ledger), false, 'invalid stage bytes never reach the shared ledger')
        assert.equal(fs.existsSync(path.join(fixture.directory, EXECUTION_RECEIPT_NAME)), false,
          'a rejected schema cannot produce a publication receipt')
        if (thesisBefore) assert.deepEqual(fs.readFileSync(thesisPath), thesisBefore,
          'no provenance stamp may alter the thesis before all new stage schemas pass')
        payload.event_id = `EVT-${'a'.repeat(12)}`
        fs.writeFileSync(payloadPath, `${JSON.stringify(payload)}\n`)
        const recovered = await supervisePublication(fixture.live.runId, fixture.live.publicationToken!, { phase: 'stamp' })
        assert.equal(recovered.ok, true, 'the same capability can recover after the invalid output is corrected')
        assert.equal(fs.existsSync(fixture.ledger), withThesis, 'only a fresh valid thesis gets a ledger projection')
      } finally { finishRun(fixture.live, 'done') }
    }

    const retained = schemaSignal(provider, true)
    try {
      const thesisPath = path.join(retained.directory, 'thesis_record.json')
      const payloadPath = path.join(retained.directory, 'signal_payload.json')
      const oldThesis = fs.readFileSync(thesisPath)
      const oldPayload = fs.readFileSync(payloadPath)
      assert.equal(artifactIsFresh(retained.live, 'signal_payload.json'), false,
        'the schema-bearing stage baseline includes unchanged retained history')
      fs.writeFileSync(path.join(retained.directory, 'intake.json'), `${JSON.stringify(screenerFixture('intake', retained.id))}\n`)
      const stopped = await supervisePublication(retained.live.runId, retained.live.publicationToken!, { phase: 'stamp' })
      assert.deepEqual(stopped.artifacts, [], 'a valid early stop needs no fresh thesis or ledger')
      assert.deepEqual(fs.readFileSync(thesisPath), oldThesis)
      assert.deepEqual(fs.readFileSync(payloadPath), oldPayload, 'old malformed stage bytes are preserved rather than regraded')
      assert.equal(fs.existsSync(retained.ledger), false)

      fs.writeFileSync(payloadPath, `${JSON.stringify(screenerFixture('signal_payload', retained.id))}\n`)
      fs.writeFileSync(path.join(retained.directory, 'thesis_integrity_review_v2.json'),
        `${JSON.stringify(screenerFixture('thesis_integrity_review', retained.id))}\n`)
      retained.live.providerAttemptId = randomUUID()
      beginExecutionAttempt(retained.live)
      assert.equal(artifactIsFresh(retained.live, 'signal_payload.json'), true,
        'automatic continuation preserves the original stage baseline')
      assert.equal(artifactIsFresh(retained.live, 'thesis_integrity_review_v2.json'), true,
        'a newly created versioned mapped artifact stays fresh through automatic continuation')
      assert.equal(artifactIsFresh(retained.live, 'thesis_record.json'), false,
        'automatic continuation does not promote an unchanged retained thesis to newly authored output')
    } finally { finishRun(retained.live, 'done') }

    // A real subprocess boundary makes the race deterministic: the shim runs the canonical validator,
    // then changes a source before its successful response reaches the supervisor. Old source hashes
    // alone miss a newly authoritative v3 review and a newly produced mapped stage.
    for (const race of ['discovery-latest-review', 'latest-review', 'replacement', 'new-stage'] as const) {
      const fixture = schemaSignal(provider)
      const previousPath = process.env.PATH
      try {
        const payload = screenerFixture('signal_payload', fixture.id)
        const thesisPath = path.join(fixture.directory, 'thesis_record.json')
        fs.writeFileSync(thesisPath, `${JSON.stringify(screenerFixture('thesis_record', fixture.id))}\n`)
        fs.writeFileSync(path.join(fixture.directory, 'signal_payload.json'), `${JSON.stringify(payload)}\n`)
        const original = fs.readFileSync(thesisPath)
        let target: string
        let replacement: any
        if (race === 'latest-review' || race === 'discovery-latest-review') {
          const review = { ...screenerFixture('thesis_integrity_review', fixture.id), verdict: 'Survives', routing: 'Proceed' }
          fs.writeFileSync(path.join(fixture.directory, 'thesis_integrity_review_v2.json'), `${JSON.stringify(review)}\n`)
          target = path.join(fixture.directory, 'thesis_integrity_review_v3.json')
          replacement = { ...review, verdict: 'Thesis broken', routing: 'watchlist_integrity_broken' }
        } else if (race === 'replacement') {
          target = path.join(fixture.directory, 'signal_payload.json')
          replacement = { ...payload, event_id: `EVT-${'a'.repeat(16)}` }
        } else {
          target = path.join(fixture.directory, 'candidates.json')
          replacement = screenerFixture('candidates', fixture.id)
        }
        const python = spawnSync('python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' })
        assert.equal(python.status, 0, python.stderr)
        const realPython = python.stdout.trim()
        const bins = path.join(REPO_ROOT, '.cache', 'test-output')
        fs.mkdirSync(bins, { recursive: true })
        const bin = fs.mkdtempSync(path.join(bins, 'publication-schema-bin-'))
        extraCleanup.push(bin)
        const mutation = `pathlib.Path(${JSON.stringify(target)}).write_text(${JSON.stringify(`${JSON.stringify(replacement)}\n`)})`
        fs.writeFileSync(path.join(bin, 'python3'), `#!${realPython}\n`
          + 'import pathlib, subprocess, sys\n'
          + (race === 'discovery-latest-review'
            ? `if "--schema-contract" in sys.argv and not pathlib.Path(${JSON.stringify(target)}).exists():\n    ${mutation}\n` : '')
          + 'incoming = sys.stdin.buffer.read() if "--schema-records" in sys.argv else b""\n'
          + `result = subprocess.run([${JSON.stringify(realPython)}, *sys.argv[1:]], input=incoming, capture_output=True)\n`
          + (race !== 'discovery-latest-review'
            ? `if result.returncode == 0 and "--schema-records" in sys.argv:\n    ${mutation}\n` : '')
          + 'sys.stdout.buffer.write(result.stdout)\nsys.stderr.buffer.write(result.stderr)\nsys.exit(result.returncode)\n',
        { mode: 0o700 })
        process.env.PATH = `${bin}${path.delimiter}${previousPath || ''}`
        await assert.rejects(supervisePublication(fixture.live.runId, fixture.live.publicationToken!, { phase: 'stamp' }),
          /changed before mutation/,
          `${provider}: ${race} while the validator is running must not publish the earlier selection`)
        assert.equal(fixture.live.publicationRequested, undefined)
        assert.equal(fixture.live.publicationPhase, undefined)
        assert.equal(fs.existsSync(fixture.ledger), false, 'the race cannot create a ledger or seed checkpoints')
        assert.equal(fs.existsSync(path.join(fixture.directory, EXECUTION_RECEIPT_NAME)), false)
        assert.deepEqual(fs.readFileSync(thesisPath), original, 'the race cannot stamp provenance into the thesis')
      } finally {
        if (previousPath === undefined) delete process.env.PATH
        else process.env.PATH = previousPath
        finishRun(fixture.live, 'done')
      }
    }
  }

  // A child may request only an incidental in-scope file. The supervisor must force every terminal
  // artifact and its receipt into the exact commit and verify those committed blobs before completion.
  const metadataRelative = `${root}/RUN_METADATA.md`
  fs.writeFileSync(path.join(REPO_ROOT, metadataRelative), '# fixture metadata\n')
  let forcedPathspecs: string[] = []
  let verifiedRequired: string[] = []
  const terminalCommitter = __setSupervisorCommitter(async (_message, pathspecs) => {
    forcedPathspecs = [...pathspecs]
    return 'COMMIT_SHA=1111111111111111111111111111111111111111'
  })
  const terminalVerifier = __setSupervisorCommitVerifier(async (_output, requiredPaths) => {
    verifiedRequired = [...requiredPaths]
  })
  try {
    await supervisePublication(run.runId, run.publicationToken!, {
      phase: 'commit', message: 'metadata-only request', pathspecs: [metadataRelative],
    })
    const receiptRelative = `${root}/execution_provenance.receipt.json`
    for (const required of [`${root}/decision_record.json`, receiptRelative]) {
      assert.ok(forcedPathspecs.includes(required), `${required} must be forced into the commit pathspecs`)
      assert.ok(verifiedRequired.includes(required), `${required} must be verified in the committed HEAD`)
    }
    assert.equal(run.publicationCompleted, true)
  } finally {
    __setSupervisorCommitter(terminalCommitter)
    __setSupervisorCommitVerifier(terminalVerifier)
  }

  // A tracked decision review refreshes calibration deterministically only after its data publication
  // succeeds; no second model turn is involved.
  const reviewRelative = `${root}/reviews/2099-01-01_decision_review.json`
  const reviewAbsolute = path.join(REPO_ROOT, reviewRelative)
  fs.mkdirSync(path.dirname(reviewAbsolute), { recursive: true })
  const reviewRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true, writeTargetsAbs: [path.dirname(reviewAbsolute)],
    coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  reviewRun.publicationToken = 'review-supervisor-capability'
  beginExecutionAttempt(reviewRun)
  fs.writeFileSync(reviewAbsolute, '{"verdict":"fixture"}\n')
  await assert.rejects(supervisePublication(reviewRun.runId, reviewRun.publicationToken, {
    phase: 'commit', pathspecs: [`${root}/reviews/*_decision_review.json`],
  }), /wildcard review commits are forbidden/)
  await assert.rejects(supervisePublication(reviewRun.runId, reviewRun.publicationToken, {
    phase: 'commit', pathspecs: ['analyses'],
  }), /may publish only exact files/)
  let commits = 0
  let calibrations = 0
  const priorCommitter = __setSupervisorCommitter(async (_message, pathspecs) => {
    commits++
    assert.deepEqual(pathspecs, [reviewRelative])
    return `COMMIT_SHA=${'4'.repeat(40)}`
  })
  const priorCalibration = __setPostReviewCalibration(async () => { calibrations++ })
  const priorVerifier = __setSupervisorCommitVerifier(async (_output, requiredPaths) => {
    assert.deepEqual(requiredPaths, [reviewRelative])
  })
  try {
    const reviewPublication = await supervisePublication(reviewRun.runId, reviewRun.publicationToken, {
      phase: 'commit', message: 'fixture review', pathspecs: [reviewRelative],
    })
    assert.equal(reviewPublication.output, `COMMIT_SHA=${'4'.repeat(40)}`)
    assert.equal(commits, 1)
    assert.equal(calibrations, 1, 'deterministic calibration runs exactly once after review publication')
  } finally {
    __setSupervisorCommitter(priorCommitter)
    __setPostReviewCalibration(priorCalibration)
    __setSupervisorCommitVerifier(priorVerifier)
    finishRun(reviewRun, 'done')
  }

  const mismatchRelative = `${root}/reviews/2099-01-02_decision_review.json`
  const mismatchRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(path.join(REPO_ROOT, mismatchRelative))], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  mismatchRun.publicationToken = 'mismatch-supervisor-capability'
  beginExecutionAttempt(mismatchRun)
  fs.writeFileSync(path.join(REPO_ROOT, mismatchRelative), '{"verdict":"mismatch fixture"}\n')
  await assert.rejects(supervisePublication(mismatchRun.runId, mismatchRun.publicationToken, {
    phase: 'commit', pathspecs: [reviewRelative],
  }), /append-only and cannot overwrite/)
  const mismatchCommitter = __setSupervisorCommitter(async () => 'COMMIT_SHA=0000000000000000000000000000000000000000')
  const mismatchVerifier = __setSupervisorCommitVerifier(async () => { throw new Error('committed blob mismatch') })
  try {
    await assert.rejects(supervisePublication(mismatchRun.runId, mismatchRun.publicationToken, {
      phase: 'commit', pathspecs: [mismatchRelative],
    }), /committed blob mismatch/)
    assert.notEqual(mismatchRun.publicationCompleted, true, 'post-commit verification failure cannot mark publication complete')
  } finally {
    __setSupervisorCommitter(mismatchCommitter)
    __setSupervisorCommitVerifier(mismatchVerifier)
    finishRun(mismatchRun, 'error')
  }
} finally {
  finishRun(run, 'done')
  for (const target of extraCleanup) fs.rmSync(target, { recursive: true, force: true })
  fs.rmSync(absolute, { recursive: true, force: true })
  fs.rmSync(`${absolute}_siblings`, { recursive: true, force: true })
}

console.log('PASS: supervisor-owned provenance, freshness, and durable lineage')
