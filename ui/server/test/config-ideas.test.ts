process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

const code = "import('./src/config.ts').then((m) => process.stdout.write(String(m.NEWS.ideasEnabled)))"
function read(value: string | undefined): string {
  const env = { ...process.env }
  if (value === undefined) delete env.IDEAS_ENABLED
  else env.IDEAS_ENABLED = value
  const r = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], { cwd: process.cwd(), env, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout
}

assert.equal(read(undefined), 'true', 'Ideas runs by default; the old opt-in default silently disabled production')
assert.equal(read('0'), 'false', 'IDEAS_ENABLED=0 remains the explicit kill switch')
assert.equal(read('1'), 'true')

const ageCode = "import('./src/config.ts').then((m) => process.stdout.write(String(m.NEWS.ideasInputMaxAgeHrs)))"
const ageEnv = { ...process.env, IDEAS_INPUT_MAX_AGE_HRS: '18' }
const age = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', ageCode], { cwd: process.cwd(), env: ageEnv, encoding: 'utf8' })
assert.equal(age.status, 0, age.stderr)
assert.equal(age.stdout, '18', 'the source-age ceiling is independently configurable')
console.log('\n1 config-ideas test file passed')
