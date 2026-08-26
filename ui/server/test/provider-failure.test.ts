process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  classifyProviderContractFailure,
  classifyProviderCaughtFailure,
  classifyProviderHttpFailure,
  clearProviderQuarantine,
  providerRequestIdentity,
  quarantineProviderFailure,
  readProviderQuarantine,
  resetProviderQuarantineMemory,
} from '../src/news/provider-failure'
import { analyzeArticle, caughtFailure, triageBatch } from '../src/news/triage/groq'

const workerState = process.argv[2] === '--worker' ? process.argv[3] : ''
if (workerState) {
  const identity = providerRequestIdentity({
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'worker-key', workload: 'triage', contractVersion: 'news-triage-json-v1',
  })
  const marker = quarantineProviderFailure(workerState, identity, classifyProviderHttpFailure(401), Date.now())
  fs.writeSync(1, `${JSON.stringify({
    observations: marker?.observations ?? 0,
    persisted: marker?.persisted ?? false,
    fingerprint: marker?.fingerprint ?? '',
  })}\n`)
  process.exit(marker ? 0 : 2)
}

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (error: any) {
    console.error(`FAIL  ${name}\n      ${error?.stack || error}`)
    process.exitCode = 1
  }
}

function temp(): string { return fs.mkdtempSync(path.join(os.tmpdir(), 'provider-failure-')) }
function response(body: unknown, status = 200): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  })
}

await check('canonical taxonomy separates auth, account, model, request, limit, timeout, and upstream faults', () => {
  assert.deepEqual(classifyProviderHttpFailure(401).code, 'auth')
  assert.deepEqual(classifyProviderHttpFailure(402).code, 'billing')
  assert.deepEqual(classifyProviderHttpFailure(403).code, 'entitlement')
  assert.deepEqual(classifyProviderHttpFailure(404, { error: { type: 'invalid_request_error', code: 'model_not_found' } }).code, 'model_terminal')
  const ambiguous404 = classifyProviderHttpFailure(404, 'not found')
  assert.equal(ambiguous404.code, 'request_invalid')
  assert.notEqual(ambiguous404.code, 'auth', 'an ambiguous 404 can never accuse the API key')
  assert.deepEqual(classifyProviderHttpFailure(400), {
    code: 'request_invalid', scope: 'workload', action: 'quarantine', providerWide: false, httpStatus: 400,
  })
  assert.deepEqual(classifyProviderHttpFailure(429).code, 'rate_limited')
  assert.deepEqual(classifyProviderHttpFailure(498).code, 'transient_upstream')
  assert.deepEqual(classifyProviderHttpFailure(503).code, 'transient_upstream')
  assert.deepEqual(classifyProviderHttpFailure(408).code, 'timeout')
  assert.deepEqual(classifyProviderContractFailure().code, 'contract_invalid')
  const invalidUrl = Object.assign(new TypeError('private URL'), { code: 'ERR_INVALID_URL' })
  assert.deepEqual(classifyProviderCaughtFailure(invalidUrl).code, 'request_invalid')
  assert.deepEqual(caughtFailure(invalidUrl, 'Groq').failureKind, 'request')
})

await check('only safe error identifiers cross the classifier boundary', () => {
  const classified = classifyProviderHttpFailure(401, {
    error: { type: 'invalid_request_error', code: 'invalid_api_key', message: 'secret acct-123 balance $4.21' },
  })
  assert.equal(classified.evidenceType, 'invalid_request_error')
  assert.equal(classified.evidenceCode, 'invalid_api_key')
  assert.doesNotMatch(JSON.stringify(classified), /acct-123|4\.21|balance/)
})

await check('OpenRouter no-provider gaps cool down while a genuinely missing model stays quarantined', () => {
  const noRoute = {
    error: {
      code: 404,
      message: 'No allowed providers are available for the selected model; private route detail',
    },
  }
  const dynamic = classifyProviderHttpFailure(404, noRoute, {
    providerId: 'openrouter', model: 'openrouter/free', models: ['openrouter/free'],
  })
  assert.deepEqual(dynamic, {
    code: 'transient_upstream', scope: 'workload', action: 'cooldown', providerWide: false, httpStatus: 404,
  })
  assert.doesNotMatch(JSON.stringify(dynamic), /private route detail/)

  const fixedRouteGap = classifyProviderHttpFailure(404, noRoute, {
    providerId: 'openrouter', model: 'fixed/model', models: ['fixed/model'],
  })
  assert.equal(fixedRouteGap.code, 'transient_upstream')
  assert.equal(fixedRouteGap.action, 'cooldown')

  const otherGateway = classifyProviderHttpFailure(404, noRoute, {
    providerId: 'other', model: 'fixed/model', models: ['fixed/model'],
  })
  assert.equal(otherGateway.action, 'quarantine', 'OpenRouter semantics never leak into another gateway')

  const missingRouter = classifyProviderHttpFailure(404, {
    error: { type: 'invalid_request_error', code: 'model_not_found', message: 'Model does not exist' },
  }, { providerId: 'openrouter', model: 'openrouter/free' })
  assert.equal(missingRouter.code, 'model_terminal')
  assert.equal(missingRouter.action, 'quarantine')
})

await check('fingerprint changes on key, model, endpoint, or request contract but never contains the key', () => {
  const base = {
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'top-secret-key', workload: 'triage', contractVersion: 'v1', request: { maxTokens: 2000 },
  }
  const a = providerRequestIdentity(base)
  const same = providerRequestIdentity({ ...base })
  assert.deepEqual(a, same)
  assert.notEqual(providerRequestIdentity({ ...base, apiKey: 'rotated' }).providerFingerprint, a.providerFingerprint)
  assert.notEqual(providerRequestIdentity({ ...base, model: 'openai/gpt-oss-120b' }).providerFingerprint, a.providerFingerprint)
  assert.notEqual(providerRequestIdentity({ ...base, baseUrl: 'https://other.test/v1' }).providerFingerprint, a.providerFingerprint)
  assert.notEqual(providerRequestIdentity({ ...base, contractVersion: 'v2' }).requestFingerprint, a.requestFingerprint)
  assert.doesNotMatch(JSON.stringify(a), /top-secret-key/)
})

await check('terminal failure is durable, timer-free, fingerprint-bound, and cleared only by a newer success', () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const identity = providerRequestIdentity({
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'secret-one', keyEnvVar: 'GROQ_API_KEY', workload: 'triage', contractVersion: 'v1',
  })
  const marker = quarantineProviderFailure(state, identity, classifyProviderHttpFailure(401, {
    error: { type: 'invalid_request_error', code: 'invalid_api_key', message: 'secret account acct-123' },
  }), 10_000)
  assert.equal(marker?.persisted, true)
  assert.equal(readProviderQuarantine(state, identity)?.failureCode, 'auth')
  assert.equal(readProviderQuarantine(state, identity)?.observedAt, 10_000, 'elapsed wall time never reopens it')
  const staleClock = quarantineProviderFailure(state, identity, classifyProviderHttpFailure(401), 9_000)
  assert.equal(staleClock?.observedAt, 10_000, 'a process that waited with an older clock cannot move durable time backward')
  assert.equal(staleClock?.observations, 2)
  resetProviderQuarantineMemory()
  assert.equal(readProviderQuarantine(state, identity)?.observations, 2, 'the monotonic marker remains valid after a restart')
  const bytes = fs.readFileSync(path.join(state, 'provider-groq-quarantine.json'), 'utf8')
  assert.doesNotMatch(bytes, /secret-one|acct-123/)

  const rotated = providerRequestIdentity({
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'secret-two', workload: 'triage', contractVersion: 'v1',
  })
  assert.equal(readProviderQuarantine(state, rotated), null, 'a key/config fingerprint change reopens the route')
  clearProviderQuarantine(state, rotated, 11_000)
  assert.ok(readProviderQuarantine(state, identity), 'a rolling-deploy success for another fingerprint cannot erase this marker')

  clearProviderQuarantine(state, identity, 9_000)
  assert.ok(readProviderQuarantine(state, identity), 'a success older than the failure cannot clear it')
  clearProviderQuarantine(state, identity, 11_000)
  assert.equal(readProviderQuarantine(state, identity), null, 'a newer successful canary clears it')
})

await check('a legacy OpenRouter 404 marker gets one policy-v2 probe and a true missing model re-quarantines', () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const identity = providerRequestIdentity({
    providerId: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openrouter/free',
    models: ['openrouter/free'], apiKey: 'openrouter-key', workload: 'triage', contractVersion: 'v1',
  })
  const missing = classifyProviderHttpFailure(404, {
    error: { type: 'invalid_request_error', code: 'model_not_found', message: 'Model does not exist' },
  }, { providerId: 'openrouter', model: 'openrouter/free' })
  quarantineProviderFailure(state, identity, missing, 10_000)
  const file = path.join(state, 'provider-openrouter-quarantine.json')
  const legacy = JSON.parse(fs.readFileSync(file, 'utf8'))
  delete legacy.policyVersion
  fs.writeFileSync(file, `${JSON.stringify(legacy)}\n`)
  resetProviderQuarantineMemory()

  assert.equal(readProviderQuarantine(state, identity), null,
    'the old over-broad 404 policy cannot keep an upgraded installation permanently dark')
  const current = quarantineProviderFailure(state, identity, missing, 11_000)
  assert.equal(current?.policyVersion, 2)
  assert.equal(current?.failureCode, 'model_terminal')
  resetProviderQuarantineMemory()
  assert.equal(readProviderQuarantine(state, identity)?.failureCode, 'model_terminal',
    'a genuinely missing model becomes standing again after its one reclassified probe')
})

await check('an unreadable quarantine marker fails safe as local_state', () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const identity = providerRequestIdentity({
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'k', workload: 'triage', contractVersion: 'v1',
  })
  fs.writeFileSync(path.join(state, 'provider-groq-quarantine.json'), '{truncated')
  assert.equal(readProviderQuarantine(state, identity)?.failureCode, 'local_state')
})

await check('persisted cache follows an external clear and exposes later corruption', () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const identity = providerRequestIdentity({
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'k', workload: 'triage', contractVersion: 'v1',
  })
  quarantineProviderFailure(state, identity, classifyProviderHttpFailure(401), 10_000)
  const file = path.join(state, 'provider-groq-quarantine.json')
  assert.equal(readProviderQuarantine(state, identity)?.failureCode, 'auth')
  fs.rmSync(file)
  assert.equal(readProviderQuarantine(state, identity), null, 'another process clearing disk must unstick this process')

  quarantineProviderFailure(state, identity, classifyProviderHttpFailure(401), 11_000)
  assert.equal(readProviderQuarantine(state, identity)?.failureCode, 'auth')
  fs.writeFileSync(file, '{truncated')
  assert.equal(readProviderQuarantine(state, identity)?.failureCode, 'local_state', 'corruption must replace a reassuring cache')
})

await check('cross-process quarantine updates are serialized and never lose an observation', async () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const file = fileURLToPath(import.meta.url)
  const tsxLoader = fileURLToPath(import.meta.resolve('tsx'))
  const children = Array.from({ length: 6 }, () => new Promise<{ observations: number; persisted: boolean; fingerprint: string }>((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', tsxLoader, file, '--worker', state], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8'); child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.setEncoding('utf8'); child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', reject)
    child.once('close', (code) => code === 0 ? resolve(JSON.parse(stdout.trim())) : reject(new Error(`worker ${code}: ${stderr}`)))
  }))
  const observations = await Promise.all(children)
  resetProviderQuarantineMemory()
  const identity = providerRequestIdentity({
    providerId: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-20b',
    apiKey: 'worker-key', workload: 'triage', contractVersion: 'news-triage-json-v1',
  })
  const final = readProviderQuarantine(state, identity)
  assert.equal(observations.every((marker) => marker.persisted), true, `worker persistence: ${JSON.stringify(observations)}`)
  assert.equal(new Set(observations.map((marker) => marker.fingerprint)).size, 1, `worker identities: ${JSON.stringify(observations)}`)
  assert.equal(final?.observations, 6, `workers: ${JSON.stringify(observations)}; final: ${JSON.stringify(final)}`)
})

await check('triage quarantines one terminal HTTP response, skips future network calls, and self-clears after key rotation', async () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const items = [{ event_id: 'E1', headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any]
  let calls = 0
  const rejected = (async () => {
    calls++
    return response({ error: { type: 'invalid_request_error', code: 'invalid_api_key', message: 'private account data' } }, 401)
  }) as unknown as typeof fetch
  const options = {
    model: 'openai/gpt-oss-20b', baseUrl: 'https://api.groq.com/openai/v1', apiKey: 'bad-key',
    providerId: 'groq', providerLabel: 'Groq', keyEnvVar: 'GROQ_API_KEY', stateDir: state,
    workload: 'triage', contractVersion: 'news-triage-json-v1', maxAttempts: 1,
  }
  const first = await triageBatch(items, options, rejected)
  assert.equal(first.failure?.code, 'auth')
  assert.equal(calls, 1)
  const second = await triageBatch(items, options, rejected)
  assert.equal(second.quarantined, true)
  assert.equal(second.requests, 0)
  assert.equal(calls, 1, 'the unchanged standing fault never spends another request')

  const success = (async () => {
    calls++
    return response({ usage: { total_tokens: 10 }, choices: [{ message: { content: JSON.stringify({ items: [{ i: 0, materiality_pre_score: 80 }] }) } }] })
  }) as unknown as typeof fetch
  const recovered = await triageBatch(items, { ...options, apiKey: 'rotated-key' }, success)
  assert.equal(recovered.ok, true)
  assert.equal(calls, 2)
  assert.equal(readProviderQuarantine(state, recovered.providerIdentity!), null)
})

await check('OpenRouter free-pool no-route response never creates a standing quarantine', async () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const items = [{ event_id: 'E1', headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any]
  let calls = 0
  const noRoute = (async () => {
    calls++
    return response({ error: { code: 404, message: 'No allowed providers are available for the selected model' } }, 404)
  }) as unknown as typeof fetch
  const options = {
    model: 'openrouter/free', models: ['openrouter/free'],
    baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'openrouter-key',
    providerId: 'openrouter', providerLabel: 'OpenRouter', keyEnvVar: 'OPENROUTER_API_KEY',
    stateDir: state, workload: 'triage', contractVersion: 'news-triage-json-v1', maxAttempts: 1,
  }

  const first = await triageBatch(items, options, noRoute)
  assert.equal(first.failure?.code, 'transient_upstream')
  assert.equal(first.failure?.action, 'cooldown')
  assert.equal(first.failure?.scope, 'workload')
  assert.equal(fs.existsSync(path.join(state, 'provider-openrouter-quarantine.json')), false)

  const success = (async () => {
    calls++
    return response({
      usage: { total_tokens: 10 },
      choices: [{ message: { content: JSON.stringify({ items: [{ i: 0, materiality_pre_score: 80 }] }) } }],
    })
  }) as unknown as typeof fetch
  const recovered = await triageBatch(items, options, success)
  assert.equal(recovered.ok, true)
  assert.equal(calls, 2, 'the unchanged dynamic router is tried again after the caller cooldown')
})

await check('terminal caught exceptions fail fast and durably quarantine both title and article routes', async () => {
  resetProviderQuarantineMemory()
  const state = temp()
  const items = [{ event_id: 'E1', headline: 'RBI cuts rates', source_name: 'Reuters', region: 'IN' } as any]
  let calls = 0
  const invalidRequest = (async () => {
    calls++
    throw Object.assign(new TypeError('private URL must not escape'), { code: 'ERR_INVALID_URL' })
  }) as unknown as typeof fetch
  const options = {
    model: 'openai/gpt-oss-20b', baseUrl: 'https://api.groq.com/openai/v1', apiKey: 'configured-key',
    providerId: 'groq', providerLabel: 'Groq', keyEnvVar: 'GROQ_API_KEY', stateDir: state,
    maxAttempts: 2,
  }

  const triage = await triageBatch(items, options, invalidRequest, async () => {})
  assert.equal(triage.failure?.code, 'request_invalid')
  assert.equal(triage.failureKind, 'request')
  assert.equal(triage.requests, 1, 'a deterministic local request fault is never retried')
  assert.equal(readProviderQuarantine(state, triage.providerIdentity!)?.failureCode, 'request_invalid')
  const skippedTriage = await triageBatch(items, options, invalidRequest, async () => {})
  assert.equal(skippedTriage.quarantined, true)
  assert.equal(skippedTriage.requests, 0)

  const body = 'A sufficiently long article body describing a policy change and its effect on company earnings. '.repeat(3)
  const article = await analyzeArticle(body, 'Policy changes company outlook', options, invalidRequest, async () => {})
  assert.equal(article.failure?.code, 'request_invalid')
  assert.equal(article.failureKind, 'request')
  assert.equal(calls, 2, 'article gets one separate workload attempt, with no deterministic retry')
  assert.equal(readProviderQuarantine(state, article.providerIdentity!)?.failureCode, 'request_invalid')
  const skippedArticle = await analyzeArticle(body, 'Policy changes company outlook', options, invalidRequest, async () => {})
  assert.equal(skippedArticle.quarantined, true)
  assert.equal(skippedArticle.attempted, false)
  assert.equal(calls, 2, 'both durable quarantines prevent later provider I/O')
})

console.log(`provider failure quarantine: ${passed} checks passed`)
