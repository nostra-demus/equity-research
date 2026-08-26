import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const script = path.resolve(here, '../../../scripts/ops/scanner-health.mjs')

async function run(body: unknown, contentType = 'application/json') {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': contentType })
    response.end(typeof body === 'string' ? body : JSON.stringify(body))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [script, '--url', `http://127.0.0.1:${address.port}/diagnostics`])
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return result
}

const verdict = (overrides: Record<string, unknown> = {}) => ({
  status: 'healthy', code: 'healthy', action: 'none', summary: 'Scanner is healthy.',
  restartRecommended: false, findings: [], ...overrides,
})

let passed = 0
async function check(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

await check('healthy verdict exits zero with a tab-delimited stable contract', async () => {
  const result = await run({ health: verdict() })
  assert.equal(result.code, 0)
  assert.equal(result.stdout, 'healthy\thealthy\tnone\tScanner is healthy.\n')
  assert.equal(result.stderr, '')
})

await check('non-restartable provider fault stays distinct from scheduler repair', async () => {
  const result = await run({ health: verdict({
    status: 'degraded', code: 'providers-blocked', action: 'wait-for-reset',
    summary: 'Providers are blocked.', findings: [{ code: 'providers-blocked' }],
  }) })
  assert.equal(result.code, 2)
  assert.match(result.stdout, /^degraded\tproviders-blocked\twait-for-reset\t/)
})

await check('restart recommendation has its own exit code for the watchdog', async () => {
  const result = await run({ health: verdict({
    status: 'failing', code: 'scheduler-stale', action: 'restart-engine',
    summary: 'Scheduler is stale.', restartRecommended: true, findings: [{ code: 'scheduler-stale' }],
  }) })
  assert.equal(result.code, 3)
  assert.match(result.stdout, /^failing\tscheduler-stale\trestart-engine\t/)
})

await check('malformed diagnostics fail closed instead of reading healthy', async () => {
  const result = await run({ health: { status: 'healthy' } })
  assert.equal(result.code, 4)
  assert.match(result.stdout, /^failing\tdiagnostics-contract-invalid\tinspect-deploy\t/)
})

console.log(`${passed} scanner health CLI tests passed`)
