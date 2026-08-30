// Full/Continue can never fall back to the legacy monolithic path through host configuration.
// Run: npx tsx test/full-chain-mandatory.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
const config = path.resolve(here, '..', 'src', 'config.ts')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'full-chain-mandatory-'))
process.on('exit', () => { try { fs.rmSync(tmp, { recursive: true, force: true }) } catch { /* best-effort */ } })

const probe = path.join(tmp, 'probe.mts')
fs.writeFileSync(probe, [
  `import { FULL_PER_MODULE } from ${JSON.stringify(config)}`,
  `console.log(FULL_PER_MODULE ? 'CHAINED' : 'MONOLITHIC')`,
  '',
].join('\n'))

for (const configured of [undefined, '0', 'false', '1']) {
  const env = { ...process.env, ENGINE_ACTIVITY_LOG_DISABLED: '1' } as Record<string, string>
  delete env.ENGINE_FULL_PER_MODULE
  if (configured !== undefined) env.ENGINE_FULL_PER_MODULE = configured
  const result = spawnSync(tsx, [probe], { encoding: 'utf8', env })
  assert.equal(result.status, 0, `config probe failed for ENGINE_FULL_PER_MODULE=${configured ?? 'unset'}: ${result.stderr}`)
  assert.equal(result.stdout.trim().split('\n').pop(), 'CHAINED',
    `ENGINE_FULL_PER_MODULE=${configured ?? 'unset'} must not restore monolithic execution`)
  console.log(`  ok  ENGINE_FULL_PER_MODULE=${configured ?? 'unset'} -> CHAINED`)
}

console.log('\n4 mandatory full-chain checks passed')
