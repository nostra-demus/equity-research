process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assertParityCanaryStageRoot } from '../src/launcher'
import { buildSwarmGraph } from '../src/roster'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-parity-stage-'))
try {
  fs.writeFileSync(path.join(root, '.provider-parity-input.json'), '{}\n')
  assert.doesNotThrow(() => assertParityCanaryStageRoot(root, 'chain'))

  fs.writeFileSync(path.join(root, '.defer_module_memos'), '')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'chain'),
    /no longer pristine/,
    'the logical chain admission accepts only the immutable binding',
  )

  fs.writeFileSync(path.join(root, '.requires_idea_publication'), '')
  fs.mkdirSync(path.join(root, '_pool_extracts'))
  fs.mkdirSync(path.join(root, 'business-model'))
  fs.writeFileSync(path.join(root, 'business-model', '01_partial.md'), '# Partial sibling\n')
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'module'),
    'module admissions permit an in-flight sibling directory from the same scheduler',
  )
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'final'),
    /not complete|before every module is complete/,
    'terminal adjudication refuses a partial DAG',
  )

  for (const module of buildSwarmGraph().modules) {
    const dir = path.join(root, module.name)
    fs.mkdirSync(dir, { recursive: true })
    for (const agent of Object.values(module.layers).flat().filter((item) => item.isSynthesis)) {
      const file = `${agent.key.split('/').at(-1)}.md`
      fs.writeFileSync(path.join(dir, file), `# ${module.name} synthesis\n\nVerdict: mechanically valid test artifact.\n`)
    }
  }
  assert.doesNotThrow(() => assertParityCanaryStageRoot(root, 'final'))

  fs.writeFileSync(path.join(root, 'untrusted.txt'), 'unexpected\n')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'module'),
    /unexpected top-level path/,
    'an unknown top-level artifact cannot enter the frozen chain',
  )
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('provider-parity-stage-root.test.ts: pristine, in-flight, complete, and contamination gates pass')
