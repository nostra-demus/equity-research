import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  recoverAutomaticIntakePublication,
  validCompleteIntakeMemo,
} from '../src/intake-publication-recovery'

const commit = 'a'.repeat(40)
const runRoot = 'analyses/TEST_2026-08-13'
const jsonPath = `${runRoot}/intake/2026-08-14_intake_plan.json`
const markdownPath = `${runRoot}/intake/2026-08-14_intake_plan.md`
const fingerprint = `sha256:${'b'.repeat(64)}`
const raw = {
  schema_version: '1.1', swarm: 'research', subject: 'TEST', ticker: 'TEST', run_root: runRoot,
  decision_fingerprint: fingerprint, scan_date: '2026-08-14', scanned_at: '2026-08-14T10:00:01.000Z',
  new_docs: [], rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
  evidence_files: [],
  verdict: 'note_only', summary: 'Nothing changed.',
}
const proof = {
  ticker: 'TEST', swarm: 'research', runRoot, decisionFingerprint: fingerprint,
  newestPoolMs: Date.parse('2026-08-14T10:00:00.000Z'),
}
const memo = Buffer.from(`# TEST Document Intake — 2026-08-14

## Verdict
note_only · Nothing changed after the complete automatic evidence scan.

## New documents since the last run (${runRoot})
No new documents were found in the settled source pool.

## Scoped rerun plan
Nothing clears the materiality gate, so the current thesis remains in place.

## Watch (note-only)
None. Every eligible source-pool document was considered by this scan.
`)
const bytes = (candidate: string, repoPath: string) => candidate === commit
  ? repoPath === jsonPath ? Buffer.from(JSON.stringify(raw))
    : repoPath === markdownPath ? memo : null
  : null

assert.equal(validCompleteIntakeMemo(memo, raw, proof), true, 'the exact complete memo is a final witness')
assert.equal(validCompleteIntakeMemo(Buffer.from('x'), raw, proof), false, 'one byte is never a final witness')
assert.equal(validCompleteIntakeMemo(Buffer.from(memo.toString().replace('## Watch (note-only)', '## Notes')), raw, proof), false,
  'all required sections must occur exactly once and in order')

{
  let publishes = 0
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => [commit], commitBytes: bytes,
    paths: () => [jsonPath, markdownPath], now: () => Date.parse('2026-08-14T10:01:00Z'),
    coverage: () => true,
    publish: async (_message, paths, source) => {
      publishes++; assert.deepEqual(paths, [jsonPath, markdownPath]); assert.equal(source, commit)
    },
  }), true)
  assert.equal(publishes, 1, 'a saved exact intake pair retries publication without another model call')
}

{
  const v9Json = `${runRoot}/intake/2026-08-14_intake_plan_v9.json`
  const v9Md = v9Json.replace(/\.json$/, '.md')
  const v10Json = `${runRoot}/intake/2026-08-14_intake_plan_v10.json`
  const v10Md = v10Json.replace(/\.json$/, '.md')
  let chosen: string[] = []
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => [commit], paths: () => [v9Json, v9Md, v10Json, v10Md],
    coverage: () => true,
    commitBytes: (_candidate, repoPath) => repoPath.endsWith('.json')
      ? Buffer.from(JSON.stringify(raw)) : memo,
    now: () => Date.parse('2026-08-14T10:01:00Z'), publish: async (_message, paths) => { chosen = paths },
  }), true)
  assert.deepEqual(chosen, [v10Json, v10Md], 'numeric v10 is newer than v9 and is the only pair published')
}

for (const [label, changed] of [
  ['wrong owner', { ticker: 'OTHER' }],
  ['wrong decision', { decision_fingerprint: `sha256:${'c'.repeat(64)}` }],
  ['stale pool', { scanned_at: '2026-08-14T09:59:59.000Z' }],
] as const) {
  let publishes = 0
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => [commit], paths: () => [jsonPath, markdownPath],
    coverage: () => true,
    commitBytes: (candidate, repoPath) => repoPath === jsonPath
      ? Buffer.from(JSON.stringify({ ...raw, ...changed })) : bytes(candidate, repoPath),
    now: () => Date.parse('2026-08-14T10:01:00Z'), publish: async () => { publishes++ },
  }), false, label)
  assert.equal(publishes, 0)
}

assert.equal(await recoverAutomaticIntakePublication({
  ...proof, runRoot: 'analyses/OTHER_2026-08-13',
}, {
  candidates: () => [commit], paths: () => [jsonPath, markdownPath], commitBytes: bytes,
  coverage: () => true, publish: async () => { throw new Error('must not publish') },
}), false, 'the run root is bound to the exact automatic-intake owner')

assert.equal(await recoverAutomaticIntakePublication(proof, {
  candidates: () => [], paths: () => [], commitBytes: () => null, publish: async () => {},
}), false, 'mutable files without a saved data commit are never completion proof')

{
  let committed = false
  let publishes = 0
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => committed ? [commit] : [], paths: () => [jsonPath, markdownPath],
    commitBytes: bytes, coverage: () => true, now: () => Date.parse('2026-08-14T10:01:00Z'),
    localArtifact: () => ({ paths: [jsonPath, markdownPath] }),
    commit: async (message, paths) => {
      assert.equal(message, 'Intake plan: TEST 2026-08-14')
      assert.deepEqual(paths, [jsonPath, markdownPath], 'only the exact local pair is committed')
      committed = true
    },
    sharedArtifact: () => false,
    publish: async (_message, paths, source) => {
      publishes++; assert.deepEqual(paths, [jsonPath, markdownPath]); assert.equal(source, commit)
    },
  }), true)
  assert.equal(publishes, 1, 'a complete precommit pair is committed then published without a model')
}

{
  let saved = false
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => saved ? [commit] : [], paths: () => [jsonPath, markdownPath],
    commitBytes: bytes, coverage: () => true, now: () => Date.parse('2026-08-14T10:01:00Z'),
    localArtifact: () => ({ paths: [jsonPath, markdownPath] }),
    commit: async () => { saved = true; throw new Error('push failed after commit') },
    sharedArtifact: () => false, publish: async () => {},
  }), true, 'a commit saved before push failure is recovered model-free')
}

await assert.rejects(() => recoverAutomaticIntakePublication(proof, {
  candidates: () => [], paths: () => [], commitBytes: () => null, coverage: () => true,
  localArtifact: () => ({ paths: [jsonPath, markdownPath] }),
  commit: async () => { throw new Error('commit failed') }, sharedArtifact: () => false,
  publish: async () => {},
}), /could not be committed safely/, 'a complete paid pair remains publication-pending after commit failure')

{
  let publishes = 0
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => [commit], paths: () => [jsonPath, markdownPath], coverage: () => true,
    commitBytes: (_candidate, repoPath) => repoPath === jsonPath
      ? Buffer.from(JSON.stringify(raw)) : Buffer.from('x'),
    publish: async () => { publishes++ }, localArtifact: () => null,
  }), false, 'a saved one-byte memo is partial and may be re-analysed')
  assert.equal(publishes, 0)
}

await assert.rejects(() => recoverAutomaticIntakePublication(proof, {
  candidates: () => [commit], paths: () => [jsonPath, markdownPath], commitBytes: bytes,
  coverage: () => true,
  now: () => Date.parse('2026-08-14T10:01:00Z'), publish: async () => { throw new Error('network down') },
}), /network down/, 'a transient publish error stays retryable and never falls through to paid analysis')

{
  let publishes = 0
  assert.equal(await recoverAutomaticIntakePublication(proof, {
    candidates: () => [commit], paths: () => [jsonPath, markdownPath], commitBytes: bytes,
    coverage: () => false, publish: async () => { publishes++ },
  }), false, 'a saved plan with no complete server evidence index is never published as no-change')
  assert.equal(publishes, 0)
}

const intakePrompt = fs.readFileSync(new URL('../../../.claude/commands/research/intake.md', import.meta.url), 'utf8')
assert.doesNotMatch(intakePrompt, /commit-run\.sh[^\n]*\*/,
  'the intake commit must never use repository globs')
assert.match(intakePrompt, /-- "<JSON_PLAN_PATH>" "<MARKDOWN_PLAN_PATH>"/,
  'the prompt commits only the exact basenames selected by that intake turn')

console.log('automatic intake publication recovery is exact and model-free: ok')
