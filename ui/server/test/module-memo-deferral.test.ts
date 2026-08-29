// The smart module-resume policy is process-local, never a run-folder marker. Pin the important boundary:
// an ambient/server flag cannot leak into ordinary launches, while the explicit one-run option reaches the
// child. Route/pipeline wiring is pinned in thesis-plan-module-route.test.ts.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  childEnv,
  CONTINUATION_RUN_ROOT_ENV,
  DEFER_MODULE_MEMO_ENV,
  EXACT_MODULE_INPUTS_ENV,
  EXACT_MODULE_NAME_ENV,
  EXACT_MODULE_RUN_ROOT_ENV,
  EXACT_MODULE_RESUME_ENV,
  EXACT_MODULE_SYNTHESIS_ORBS_ENV,
  EXACT_MODULE_WRITABLE_ORBS_ENV,
  exactModuleRunRootBinding,
  launch,
} from '../src/launcher'

const prior = process.env[DEFER_MODULE_MEMO_ENV]
const priorContinuationRoot = process.env[CONTINUATION_RUN_ROOT_ENV]
const priorExact = process.env[EXACT_MODULE_RESUME_ENV]
const priorInputs = process.env[EXACT_MODULE_INPUTS_ENV]
const priorRunRoot = process.env[EXACT_MODULE_RUN_ROOT_ENV]
const priorName = process.env[EXACT_MODULE_NAME_ENV]
const priorWritable = process.env[EXACT_MODULE_WRITABLE_ORBS_ENV]
const priorSyntheses = process.env[EXACT_MODULE_SYNTHESIS_ORBS_ENV]
try {
  process.env[DEFER_MODULE_MEMO_ENV] = '1'
  process.env[CONTINUATION_RUN_ROOT_ENV] = 'analyses/AMBIENT_2026-08-22'
  process.env[EXACT_MODULE_RESUME_ENV] = '1'
  process.env[EXACT_MODULE_INPUTS_ENV] = 'unreviewed-module'
  process.env[EXACT_MODULE_RUN_ROOT_ENV] = 'analyses/TEST_2026-08-22'
  process.env[EXACT_MODULE_NAME_ENV] = 'business-model'
  process.env[EXACT_MODULE_WRITABLE_ORBS_ENV] = '01_unreviewed'
  process.env[EXACT_MODULE_SYNTHESIS_ORBS_ENV] = '99_business-model-synthesis'
  assert.equal(childEnv()[DEFER_MODULE_MEMO_ENV], undefined,
    'ordinary module/full/rerun children strip a server-level deferral flag')
  assert.equal(childEnv()[CONTINUATION_RUN_ROOT_ENV], undefined,
    'ordinary children cannot inherit an ambient saved-run root')
  assert.equal(childEnv({ continuationRunRoot: 'analyses/TEST_2026-08-21' })[CONTINUATION_RUN_ROOT_ENV],
    'analyses/TEST_2026-08-21', 'only the explicitly bound Continue child receives the saved root')
  assert.equal(childEnv()[EXACT_MODULE_RESUME_ENV], undefined,
    'ordinary children cannot inherit the current-run-only input policy')
  assert.equal(childEnv()[EXACT_MODULE_INPUTS_ENV], undefined,
    'ordinary children cannot inherit a staged-input allowlist')
  assert.equal(childEnv()[EXACT_MODULE_RUN_ROOT_ENV], undefined,
    'ordinary children cannot inherit an ambient exact target root')
  assert.equal(childEnv()[EXACT_MODULE_NAME_ENV], undefined,
    'ordinary children cannot inherit an ambient exact module name')
  assert.equal(childEnv()[EXACT_MODULE_WRITABLE_ORBS_ENV], undefined,
    'ordinary children cannot inherit an ambient destructive specialist receipt')
  assert.equal(childEnv()[EXACT_MODULE_SYNTHESIS_ORBS_ENV], undefined,
    'ordinary children cannot inherit an ambient destructive synthesis receipt')
  assert.equal(childEnv({ deferModuleMemo: true })[DEFER_MODULE_MEMO_ENV], '1',
    'the explicitly-authorized smart module child receives the one-launch flag')
  const exact = childEnv({
    exactModuleResume: true,
    exactModuleInputs: ['earnings', 'business-model', 'earnings'],
    exactModuleRunRoot: 'analyses/TEST_2026-08-21',
    exactModuleName: 'management-governance',
    exactModuleWritableOrbs: [
      '12_regulatory-legal-and-compliance',
      '07_people-integrity-dossiers',
      '05_board-and-shareholder-rights',
    ],
    exactModuleSynthesisOrbs: ['99_management-governance-synthesis'],
  })
  assert.equal(exact[EXACT_MODULE_RESUME_ENV], '1',
    'the guarded smart module child resolves only its checkpointed current-run inputs')
  assert.equal(exact[EXACT_MODULE_INPUTS_ENV], 'business-model,earnings',
    'the child receives only the sorted, deduplicated modules in its exact checkpoint')
  assert.equal(exact[EXACT_MODULE_RUN_ROOT_ENV], 'analyses/TEST_2026-08-21',
    'the child keeps the reviewed root even if the ambient wall-clock root has rolled to the next day')
  assert.equal(exact[EXACT_MODULE_NAME_ENV], 'management-governance',
    'the destructive helper is bound to the admitted module')
  assert.equal(exact[EXACT_MODULE_WRITABLE_ORBS_ENV],
    '05_board-and-shareholder-rights,07_people-integrity-dossiers,12_regulatory-legal-and-compliance',
    'only planned non-reused specialist stems reach the child, sorted deterministically')
  assert.equal(exact[EXACT_MODULE_SYNTHESIS_ORBS_ENV], '99_management-governance-synthesis',
    'only the current discovered synthesis can use the separate summary cleanup path')
  for (const malformed of [true, 'earnings', [1]] as unknown[]) {
    assert.throws(() => childEnv({
      exactModuleResume: true,
      exactModuleInputs: malformed as string[],
      exactModuleRunRoot: 'analyses/TEST_2026-08-21',
      exactModuleName: 'management-governance',
      exactModuleWritableOrbs: ['07_people-integrity-dossiers'],
      exactModuleSynthesisOrbs: ['99_management-governance-synthesis'],
    }), /requires a valid immutable run root and artifact scope/,
    'malformed exact input containers/members cannot reach the child environment')
  }
  for (const [writable, syntheses] of [
    [[Symbol('bad')], ['99_management-governance-synthesis']],
    [['07_people-integrity-dossiers'], [{ bad: true }]],
  ] as unknown[][][]) {
    assert.throws(() => childEnv({
      exactModuleResume: true,
      exactModuleInputs: [],
      exactModuleRunRoot: 'analyses/TEST_2026-08-21',
      exactModuleName: 'management-governance',
      exactModuleWritableOrbs: writable as string[],
      exactModuleSynthesisOrbs: syntheses as string[],
    }), /requires a valid immutable run root and artifact scope/,
    'non-string artifact members cannot be coerced or sorted into the child environment')
  }
  assert.equal(
    exactModuleRunRootBinding('TEST', 'analyses/TEST_2026-08-21', 'analyses/TEST_2026-08-21'),
    'analyses/TEST_2026-08-21',
    'a reviewed exact root remains bound when launch resolves the same day',
  )
  assert.equal(
    exactModuleRunRootBinding('TEST', 'analyses/TEST_2026-08-21', 'analyses/TEST_2026-08-22'),
    null,
    'a midnight rollover before launch cannot change the reviewed root',
  )
  assert.equal(exactModuleRunRootBinding('TEST', 'analyses/OTHER_2026-08-21'), null,
    'an exact root cannot be rebound to another ticker')
  assert.equal(exactModuleRunRootBinding('TEST', 'analyses/TEST_2026-02-30'), null,
    'an impossible calendar date is not a valid exact root')
  assert.throws(
    () => childEnv({ exactModuleResume: true, exactModuleInputs: [] }),
    /requires a valid immutable run root/,
    'an exact child cannot fall back to its wall clock when the binding is missing',
  )
  assert.equal(childEnv({ deferModuleMemo: false })[DEFER_MODULE_MEMO_ENV], undefined,
    'a retry through an ordinary launcher does not retain smart-resume policy')
} finally {
  if (prior === undefined) delete process.env[DEFER_MODULE_MEMO_ENV]
  else process.env[DEFER_MODULE_MEMO_ENV] = prior
  if (priorContinuationRoot === undefined) delete process.env[CONTINUATION_RUN_ROOT_ENV]
  else process.env[CONTINUATION_RUN_ROOT_ENV] = priorContinuationRoot
  if (priorExact === undefined) delete process.env[EXACT_MODULE_RESUME_ENV]
  else process.env[EXACT_MODULE_RESUME_ENV] = priorExact
  if (priorInputs === undefined) delete process.env[EXACT_MODULE_INPUTS_ENV]
  else process.env[EXACT_MODULE_INPUTS_ENV] = priorInputs
  if (priorRunRoot === undefined) delete process.env[EXACT_MODULE_RUN_ROOT_ENV]
  else process.env[EXACT_MODULE_RUN_ROOT_ENV] = priorRunRoot
  if (priorName === undefined) delete process.env[EXACT_MODULE_NAME_ENV]
  else process.env[EXACT_MODULE_NAME_ENV] = priorName
  if (priorWritable === undefined) delete process.env[EXACT_MODULE_WRITABLE_ORBS_ENV]
  else process.env[EXACT_MODULE_WRITABLE_ORBS_ENV] = priorWritable
  if (priorSyntheses === undefined) delete process.env[EXACT_MODULE_SYNTHESIS_ORBS_ENV]
  else process.env[EXACT_MODULE_SYNTHESIS_ORBS_ENV] = priorSyntheses
}

await assert.rejects(
  launch({ kind: 'full', ticker: 'TEST', provider: 'claude', deferModuleMemo: true }),
  (e: any) => e?.statusCode === 400 && /only for a research module launch/.test(e?.message || ''),
  'the one-run policy cannot be attached to a full/rerun/non-module launch',
)

await assert.rejects(
  launch({ kind: 'module', ticker: 'TEST', provider: 'claude', exactModuleResume: true }),
  (e: any) => e?.statusCode === 400 && /requires a guarded research module launch/.test(e?.message || ''),
  'current-run-only resolution cannot be attached without the final paid-boundary guard',
)

await assert.rejects(
  launch({
    kind: 'module',
    ticker: 'TEST',
    provider: 'claude',
    module: 'management-governance',
    exactModuleResume: true,
    exactModuleRunRoot: 'analyses/TEST_2026-08-21',
    exactModuleInputs: [],
    exactModuleWritableOrbs: true as unknown as string[],
    exactModuleSynthesisOrbs: ['99_management-governance-synthesis'],
    preSpawnGuard: () => ({ ok: true }),
    terminalGuard: async () => ({ ok: true }),
  }),
  (e: any) => e?.statusCode === 400 && /artifact scope is missing or invalid/.test(e?.message || ''),
  'a malformed runtime artifact container fails as a controlled 400 before it can be iterated',
)

await assert.rejects(
  launch({
    kind: 'module',
    ticker: 'TEST',
    provider: 'claude',
    module: 'management-governance',
    exactModuleResume: true,
    exactModuleRunRoot: 'analyses/TEST_2026-08-21',
    exactModuleInputs: [],
    exactModuleWritableOrbs: [Symbol('bad')] as unknown as string[],
    exactModuleSynthesisOrbs: ['99_management-governance-synthesis'],
    preSpawnGuard: () => ({ ok: true }),
    terminalGuard: async () => ({ ok: true }),
  }),
  (e: any) => e?.statusCode === 400 && /artifact scope is missing or invalid/.test(e?.message || ''),
  'a non-string artifact member fails as a controlled 400 before sorting/coercion',
)

await assert.rejects(
  launch({
    kind: 'module',
    ticker: 'TEST',
    provider: 'claude',
    module: 'management-governance',
    exactModuleResume: true,
    exactModuleRunRoot: 'analyses/TEST_2026-08-21',
    exactModuleInputs: { earnings: true } as unknown as string[],
    exactModuleWritableOrbs: ['07_people-integrity-dossiers'],
    exactModuleSynthesisOrbs: ['99_management-governance-synthesis'],
    preSpawnGuard: () => ({ ok: true }),
    terminalGuard: async () => ({ ok: true }),
  }),
  (e: any) => e?.statusCode === 400 && /inputs require a guarded research module launch/.test(e?.message || ''),
  'a malformed runtime input container fails as a controlled 400 before it can be iterated',
)

// Prompt-program parity: every agent that can discover an input outside the staged current root must honor
// the same exact-resume boundary as the launcher. Otherwise the process-level fingerprint is exact while a
// sub-agent silently reads an uncheckpointed historical/same-day folder after spend approval.
const prompt = (name: string) => readFileSync(`../../.claude/agents/management-governance/${name}`, 'utf8')
const rules = prompt('MODULE_RULES.md')
const people = prompt('07_people-integrity-dossiers.md')
const legal = prompt('12_regulatory-legal-and-compliance.md')
const synthesis = prompt('99_management-governance-synthesis.md')
assert.match(rules, /Exact-resume boundary overrides cross-run refresh/)
assert.match(rules, /Agents `07`, `12`, and `99` MUST NOT Glob, search, or read a prior-dated/)
assert.match(rules, /self-resolves balance-sheet-survival \(`10`, `11`, or `12`\)/)
for (const [name, text] of [['07', people], ['12', legal], ['99', synthesis]] as const) {
  assert.match(text, /NOSTRA_EXACT_MODULE_RESUME=1/, `${name} must recognize exact-resume mode`)
  assert.match(text, /do NOT Glob, search, or read any prior-dated management-governance folder/,
    `${name} must not add historical local bytes outside the paid scope`)
}
assert.match(legal, /NOSTRA_EXACT_MODULE_INPUTS/,
  'the legal/regulatory agent may read balance-sheet-survival only through the staged allowlist')

console.log('module memo deferral: child-only scope + ambient scrub + retry cleanup + kind guard passed')
