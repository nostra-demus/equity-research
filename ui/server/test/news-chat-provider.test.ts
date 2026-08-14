process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { appendNewsChatFinalQuestion, bindNewsChatRequestAbort, compactNewsChatUserPrompt, newsChatTokenBound, NewsChatRequestGate, runNewsChatFallback, shouldUseNewsChatFallback } from '../src/news/chat-provider'
import { armCooldown, Budget, getSharedLimiter, readCooldownUntil, resetBudgetMemory, resetCooldownMemory, resetSharedLimiters } from '../src/news/triage/budget'
import { callGroqForIdeaPass, ideaGroqTokenBound } from '../src/news/ideas/run-idea-pass'
import { estimateIdeaTokens, type IdeaInputRow } from '../src/news/ideas/surface-ideas'
import { triageGroqTokenBound, triageGroqWithReservation } from '../src/news/runCycle'

let passed = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-provider-'))
const config = {
  enabled: true, apiKey: 'test-key', baseUrl: 'https://api.example/v1', model: 'test-model', timeoutMs: 5_000, maxTokens: 900,
  stateDir, rpm: 0, tpm: 1_000_000, dailyReqCap: 100, dailyTokenCap: 1_000_000,
  dailyTokenTarget: 1_000_000, paceFloorFrac: 1, limiterWaitMs: 0, cooldownMs: 1_000, cooldownMaxMs: 10_000,
}

await check('backup stays closed-book and returns the provider answer', async () => {
  let body: any
  let output = ''
  const result = await runNewsChatFallback({
    system: 'Use only cited evidence.', user: '[N1] Amazon Bedrock evidence', signal: new AbortController().signal,
    onToken: (text) => { output += text }, config,
    fetchImpl: async (url: any, init: any) => {
      assert.equal(String(url), 'https://api.example/v1/chat/completions')
      body = JSON.parse(String(init.body))
      return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: 'No exact growth rate is proven [N1].' } }], usage: { total_tokens: 123 } }), { status: 200 })
    },
  })
  assert.equal(result.error, undefined)
  assert.equal(result.model, 'groq/test-model')
  assert.equal(output, 'No exact growth rate is proven [N1].')
  assert.deepEqual(body.messages, [{ role: 'system', content: 'Use only cited evidence.' }, { role: 'user', content: '[N1] Amazon Bedrock evidence' }])
  assert.equal(body.stream, false)
  const budget = JSON.parse(fs.readFileSync(path.join(stateDir, 'groq-budget.json'), 'utf8'))
  assert.equal(budget.requests, 1)
  assert.equal(budget.tokens, 123)
})

await check('invalid provider token telemetry cannot refund a sent chat request', async () => {
  for (const reportedTokens of [-1, 0, Number.NaN]) {
    resetBudgetMemory(); resetSharedLimiters()
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-invalid-usage-'))
    const expected = newsChatTokenBound('Use only cited evidence.', '[N1] evidence', config.maxTokens)
    const result = await runNewsChatFallback({
      system: 'Use only cited evidence.', user: '[N1] evidence', signal: new AbortController().signal,
      onToken: () => {}, config: { ...config, stateDir: dir },
      fetchImpl: async () => new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: 'The answer uses [N1].' } }],
        usage: { total_tokens: reportedTokens },
      }), { status: 200 }),
    })
    assert.equal(result.error, undefined)
    const saved = JSON.parse(fs.readFileSync(path.join(dir, 'groq-budget.json'), 'utf8'))
    assert.equal(saved.requests, 1)
    assert.equal(saved.tokens, expected, `reported ${String(reportedTokens)} must keep the safe reservation`)
  }
})

await check('backup is skipped without explicit configuration', async () => {
  const result = await runNewsChatFallback({ system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {}, config: { ...config, apiKey: '' } })
  assert.equal(result.attempted, false)
  assert.match(result.error || '', /not configured/i)
})

await check('a read-only replica never spends a shared provider slot', async () => {
  let calls = 0
  const result = await runNewsChatFallback({
    system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {},
    config: { ...config, providerSpendingAllowed: false },
    fetchImpl: (async () => { calls++; return new Response('{}') }) as typeof fetch,
  })
  assert.equal(result.attempted, false)
  assert.equal(calls, 0)
  assert.match(result.error || '', /active news engine/i)
})

await check('only provider-availability errors trigger backup', () => {
  assert.equal(shouldUseNewsChatFallback('Claude usage limit reached'), true)
  assert.equal(shouldUseNewsChatFallback('The answer took too long'), true)
  assert.equal(shouldUseNewsChatFallback('Invalid request body'), false)
})

await check('large prompts keep the receipt, cited rows, and exact question inside the backup limit', () => {
  const rows = Array.from({ length: 20 }, (_, i) => `[N${i + 1}] Reuters story ${i}\nsource snippet: ${'evidence '.repeat(180)}\nsaved figures: ${i}%\nurl: https://example.com/${i}`).join('\n\n')
  const large = appendNewsChatFinalQuestion(`NEWS CONTEXT\nSEARCH RECEIPT: searched 170900 saved items.\nCURRENT EVIDENCE:\n${rows}\nOLDER EVIDENCE — use only to test novelty:\n[H1] older source\nsource snippet: old evidence`, 'What is Amazon Bedrock growth?')
  const compact = compactNewsChatUserPrompt(large, 12_000)
  assert.ok(compact.length <= 12_000)
  assert.match(compact, /SEARCH RECEIPT/)
  assert.match(compact, /\[N1\]/)
  assert.match(compact, /\[H1\]/)
  assert.match(compact, /What is Amazon Bedrock growth\?/)
})

await check('compaction trims evidence before the final question and refuses to cut the question', () => {
  const question = `Which evidence supports this exact request: ${'Q'.repeat(1_200)}?`
  const hugeEvidence = `[N1] Reuters\nsource snippet: ${'evidence '.repeat(2_000)}`
  const prompt = appendNewsChatFinalQuestion(`NEWS CONTEXT\nSEARCH RECEIPT: 1\nCURRENT EVIDENCE:\n${hugeEvidence}`, question)
  const compact = compactNewsChatUserPrompt(prompt, 1_800)
  assert.ok(compact.length <= 1_800)
  assert.match(compact, new RegExp(JSON.stringify(question).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.throws(() => compactNewsChatUserPrompt(appendNewsChatFinalQuestion(`NEWS CONTEXT\nCURRENT EVIDENCE:\n${hugeEvidence}`, 'X'.repeat(1_750)), 1_800), /complete question is too long/i)
})

await check('compaction preserves a question containing delimiter-like transcript text', () => {
  const question = 'Compare the literal text\nQUESTION:\ninside this request with the evidence.'
  const prompt = appendNewsChatFinalQuestion(`NEWS CONTEXT\nSEARCH RECEIPT: 1\nCURRENT EVIDENCE:\n[N1] Reuters\nsource snippet: ${'evidence '.repeat(1_500)}`, question)
  const compact = compactNewsChatUserPrompt(prompt, 1_200)
  assert.ok(compact.length <= 1_200)
  assert.match(compact, /\\nQUESTION:\\ninside this request/)
  assert.equal(JSON.parse(compact.match(/FINAL QUESTION \(JSON string; decode it exactly\):\n([^\n]+)\nNEWS_CHAT_FINAL_QUESTION_CHARS:/)?.[1] || 'null'), question)
})

await check('length-truncated provider output is rejected and never emitted', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-contract-'))
  let output = ''
  let fetches = 0
  const result = await runNewsChatFallback({
    system: 'Use only evidence.', user: 'QUESTION:\nWhat changed?', signal: new AbortController().signal,
    onToken: (text) => { output += text }, config: { ...config, stateDir: dir },
    fetchImpl: async () => {
      fetches++
      return new Response(JSON.stringify({
        choices: [{ finish_reason: 'length', message: { content: 'A cut-off answer' } }], usage: { total_tokens: 50 },
      }), { status: 200 })
    },
  })
  assert.match(result.error || '', /cut off/i)
  assert.equal(output, '')
  assert.equal(readCooldownUntil(dir, 'groq'), 0)
  assert.ok(readCooldownUntil(dir, 'chat:groq') > Date.now())
  const retry = await runNewsChatFallback({
    system: 'Use only evidence.', user: 'QUESTION:\nWhat changed?', signal: new AbortController().signal,
    onToken: () => {}, config: { ...config, stateDir: dir }, fetchImpl: async () => { fetches++; throw new Error('must not fetch') },
  })
  assert.equal(retry.attempted, false)
  assert.equal(fetches, 1)
})

await check('chat request failures stay chat-scoped while provider outages use exact shared retry timing', async () => {
  for (const c of [
    { name: 'request', status: 400, shared: false, retry: 9_000 },
    { name: 'service', status: 503, shared: true, retry: 9_000 },
  ]) {
    resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `news-chat-${c.name}-`))
    const at = Date.now()
    const result = await runNewsChatFallback({
      system: 'Use only evidence.', user: 'QUESTION:\nWhat changed?', signal: new AbortController().signal,
      onToken: () => {}, config: { ...config, stateDir: dir },
      fetchImpl: async () => new Response('private account detail', { status: c.status, headers: c.retry ? { 'retry-after': String(c.retry / 1000) } : {} }),
    })
    const completedAt = Date.now()
    assert.equal(result.attempted, true)
    assert.equal(readCooldownUntil(dir, 'groq') > at, c.shared, `${c.name}: shared provider hold`)
    assert.equal(readCooldownUntil(dir, 'chat:groq') > at, !c.shared, `${c.name}: chat-only hold`)
    if (c.retry) {
      const holdId = c.shared ? 'groq' : 'chat:groq'
      const until = readCooldownUntil(dir, holdId)
      assert.ok(until >= at + c.retry && until <= completedAt + c.retry + 100,
        'Retry-After stays exact and scoped from the actual response time instead of becoming exponential minutes')
    }
    assert.doesNotMatch(result.error || '', /account detail/)
  }
})

await check('aborting during shared-limiter wait never starts a backup request', async () => {
  resetSharedLimiters()
  const pacedConfig = { ...config, stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-abort-')), rpm: 60, limiterWaitMs: 2_000 }
  await runNewsChatFallback({
    system: 'x', user: 'QUESTION:\nfirst', signal: new AbortController().signal, onToken: () => {}, config: pacedConfig,
    fetchImpl: async () => new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: 'first' } }] }), { status: 200 }),
  })
  let requests = 0
  const controller = new AbortController()
  const pending = runNewsChatFallback({
    system: 'x', user: 'QUESTION:\nsecond', signal: controller.signal, onToken: () => {}, config: pacedConfig,
    fetchImpl: async () => { requests++; return new Response('{}', { status: 200 }) },
  })
  setTimeout(() => controller.abort(), 10)
  const result = await pending
  assert.equal(result.error, 'aborted')
  assert.equal(result.attempted, false)
  assert.equal(requests, 0)
  resetSharedLimiters()
})

await check('a provider hold that starts during limiter wait stops chat before reservation or request', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-post-limiter-hold-'))
  const holdConfig = { ...config, stateDir: dir }
  const limiter = getSharedLimiter(holdConfig.rpm, holdConfig.tpm)
  const originalAcquire = limiter.acquire.bind(limiter)
  let requests = 0
  limiter.acquire = (async () => {
    armCooldown(dir, Date.now(), 60_000, 'groq', 60_000, 'availability')
    return true
  }) as typeof limiter.acquire
  try {
    const result = await runNewsChatFallback({
      system: 'Use only evidence.', user: 'QUESTION:\nWhat changed?', signal: new AbortController().signal,
      onToken: () => {}, config: holdConfig,
      fetchImpl: async () => { requests++; return new Response('{}', { status: 200 }) },
    })
    assert.equal(result.attempted, false)
    assert.match(result.error || '', /waiting to try again/i)
    assert.equal(requests, 0)
    assert.equal(fs.existsSync(path.join(dir, 'groq-budget.json')), false)
  } finally {
    limiter.acquire = originalAcquire
    fs.rmSync(dir, { recursive: true, force: true })
    resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  }
})

await check('chat abort reconciliation cannot reopen a concurrently exhausted provider day', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const abortDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-exhaust-abort-'))
  const abortConfig = { ...config, stateDir: abortDir, dailyReqCap: 5 }
  const controller = new AbortController()
  const result = await runNewsChatFallback({
    system: 'x', user: 'QUESTION:\nabort this request', signal: controller.signal, onToken: () => {}, config: abortConfig,
    fetchImpl: (async () => {
      Budget.load(abortDir, abortConfig.dailyReqCap, abortConfig.dailyTokenCap, Date.now(), 'groq-budget.json').exhaust()
      controller.abort()
      throw new DOMException('Aborted', 'AbortError')
    }) as typeof fetch,
  })
  assert.equal(result.error, 'aborted')
  const ledger = Budget.load(abortDir, abortConfig.dailyReqCap, abortConfig.dailyTokenCap, Date.now(), 'groq-budget.json')
  assert.equal(ledger.canSpend(1), false)
  assert.equal(ledger.remainingRequests, 0)
  assert.equal(ledger.remainingTokens, 0)
})

await check('request gate reserves the complete request atomically and releases once', () => {
  const gate = new NewsChatRequestGate(1)
  const release = gate.tryAcquire()
  assert.ok(release)
  assert.equal(gate.inFlight, 1)
  assert.equal(gate.tryAcquire(), null)
  release!()
  release!()
  assert.equal(gate.inFlight, 0)
  assert.ok(gate.tryAcquire())
})

await check('concurrent fallback calls reserve the shared daily request budget before network I/O', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const concurrentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-budget-'))
  const oneCallConfig = { ...config, stateDir: concurrentDir, dailyReqCap: 1 }
  let fetches = 0
  let releaseFetch!: () => void
  const firstStarted = new Promise<void>((resolve) => { releaseFetch = resolve })
  const fetchImpl = async () => {
    fetches++
    if (fetches === 1) await new Promise<void>((resolve) => setTimeout(resolve, 20))
    releaseFetch()
    return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: 'ok' } }], usage: { total_tokens: 10 } }), { status: 200 })
  }
  const calls = await Promise.all([
    runNewsChatFallback({ system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {}, config: oneCallConfig, fetchImpl }),
    runNewsChatFallback({ system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {}, config: oneCallConfig, fetchImpl }),
  ])
  await firstStarted
  assert.equal(fetches, 1)
  assert.equal(calls.filter((row) => !row.error).length, 1)
  assert.equal(calls.filter((row) => /no shared Groq budget/i.test(row.error || '')).length, 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(concurrentDir, 'groq-budget.json'), 'utf8')).requests, 1)
})

await check('chat reserves its full prompt/output bound when actual usage exceeds the old estimate near cap', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const concurrentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-token-budget-'))
  const system = 'Use only the supplied evidence.'
  const user = 'QUESTION:\nWhat changed in the cited item?'
  const bound = newsChatTokenBound(system, user, config.maxTokens)
  const oldEstimate = Math.ceil((system.length + user.length) / 4) + Math.max(200, config.maxTokens)
  const actualTokens = oldEstimate + 100
  const tokenCap = 100 + bound
  const seed = Budget.load(concurrentDir, 10, tokenCap, Date.now(), 'groq-budget.json')
  seed.record(0, 100)
  seed.save()
  const nearCapConfig = { ...config, stateDir: concurrentDir, dailyTokenCap: tokenCap, dailyTokenTarget: tokenCap }
  let fetches = 0
  const fetchImpl = async () => {
    fetches++
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
    return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: 'The cited item changed.' } }], usage: { total_tokens: actualTokens } }), { status: 200 })
  }
  const calls = await Promise.all([
    runNewsChatFallback({ system, user, signal: new AbortController().signal, onToken: () => {}, config: nearCapConfig, fetchImpl }),
    runNewsChatFallback({ system, user, signal: new AbortController().signal, onToken: () => {}, config: nearCapConfig, fetchImpl }),
  ])
  assert.equal(fetches, 1)
  assert.equal(calls.filter((row) => !row.error).length, 1)
  assert.equal(calls.filter((row) => /no shared Groq budget/i.test(row.error || '')).length, 1)
  const saved = JSON.parse(fs.readFileSync(path.join(concurrentDir, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.tokens, 100 + actualTokens)
  assert.ok(actualTokens > oldEstimate)
  assert.ok(saved.tokens <= tokenCap)
})

await check('chat racing the idea pass cannot exceed their shared Groq request cap', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-idea-budget-'))
  const oneCallConfig = { ...config, stateDir: sharedDir, dailyReqCap: 1 }
  let fetches = 0
  const sharedFetch = async () => {
    fetches++
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
    return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }], usage: { total_tokens: 10 } }), { status: 200 })
  }
  const ideaRows: IdeaInputRow[] = [{
    event_id: 'EVT-race', headline: 'Nvidia announces a large data-center investment', headline_orig: 'Nvidia announces a large data-center investment',
    url: 'https://reuters.com/race', source_name: 'Reuters', region: 'US', materiality: 90, label: 'high',
    event_types: ['capex'], issuer_linkage: 'primary', companies: [{ name: 'Nvidia', ticker: 'NVDA', listing_country: 'US' }], found_at: new Date().toISOString(),
  }]
  const [chat, idea] = await Promise.all([
    runNewsChatFallback({ system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {}, config: oneCallConfig, fetchImpl: sharedFetch }),
    callGroqForIdeaPass(ideaRows, {
      repoRoot: sharedDir, stateDir: sharedDir, refreshBoard: async () => {}, fetchFn: sharedFetch, sleep: async () => {},
      config: {
        topN: 1, shelfLifeHrs: 1, inputMaxAgeHrs: 1, minIntervalSec: 0, refreshSec: 0, groqApiKey: 'test-key', groqBaseUrl: 'https://api.example/v1', groqModel: 'test-model', groqMaxTokens: 900,
        groqDailyReqCap: 1, groqDailyTokenCap: 1_000_000, groqDailyTokenTarget: 1_000_000, groqPaceFloorFrac: 1,
        groqRpm: 0, groqTpm: 1_000_000, llmCooldownMs: 1_000, llmCooldownMaxMs: 10_000, limiterWaitMs: 0,
      },
    }),
  ])
  assert.equal(fetches, 1)
  assert.equal(Number(!chat.error) + Number(Boolean(idea)), 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8')).requests, 1)
})

await check('chat racing the ingester cannot exceed their shared Groq request cap', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-ingester-budget-'))
  const oneCallConfig = { ...config, stateDir: sharedDir, dailyReqCap: 1 }
  let fetches = 0
  const sharedFetch = async () => {
    fetches++
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ items: [{ i: 0, relevance: 'material', materiality_pre_score: 80, event_types: ['capex'], issuer_linkage: 'primary', why: 'Investment announced.', companies: [], size_bucket: 'unknown' }] }) } }],
      usage: { total_tokens: 10 },
    }), { status: 200 })
  }
  const budget = Budget.load(sharedDir, 1, 1_000_000, Date.now(), 'groq-budget.json')
  const [chat, ingester] = await Promise.all([
    runNewsChatFallback({ system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {}, config: oneCallConfig, fetchImpl: sharedFetch }),
    triageGroqWithReservation({
      budget, pace: { targetTokens: 1_000_000, floorFrac: 1 }, estimatedTokens: 600,
      items: [{ headline: 'Nvidia announces a large data-center investment', source_name: 'Reuters', region: 'US' } as any],
      options: { model: 'test-model', baseUrl: 'https://api.example/v1', apiKey: 'test-key', maxTokens: 900 },
      fetchFn: sharedFetch, sleep: async () => {}, maxAttempts: 2,
    }),
  ])
  assert.equal(fetches, 1)
  assert.equal(Number(!chat.error) + Number(Boolean(ingester)), 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8')).requests, 1)
})

await check('ingester reserves the worst case when actual usage exceeds its old estimate near cap', async () => {
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-ingester-token-budget-'))
  const items = [{ headline: 'Nvidia announces a large data-center investment', source_name: 'Reuters', region: 'US' } as any]
  const options = { model: 'test-model', baseUrl: 'https://api.example/v1', apiKey: 'test-key', maxTokens: 900 }
  const oldEstimate = 400
  const perAttemptBound = triageGroqTokenBound(items, options)
  const actualSuccessTokens = oldEstimate + 250
  const tokenCap = 100 + perAttemptBound * 2
  const budget = Budget.load(sharedDir, 10, tokenCap, Date.now(), 'groq-budget.json')
  budget.record(0, 100)
  budget.save()
  let fetches = 0
  const retryingFetch = async () => {
    fetches++
    if (fetches === 1) return new Response('rate limited', { status: 429 })
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ items: [{ i: 0, relevance: 'material', materiality_pre_score: 80, event_types: ['capex'], issuer_linkage: 'primary', why: 'Investment announced.', companies: [], size_bucket: 'unknown' }] }) } }],
      usage: { total_tokens: actualSuccessTokens },
    }), { status: 200 })
  }
  const run = () => triageGroqWithReservation({
    budget, pace: { targetTokens: tokenCap, floorFrac: 1 }, estimatedTokens: oldEstimate,
    items, options,
    fetchFn: retryingFetch, sleep: async () => {}, maxAttempts: 2,
  })
  const results = await Promise.all([run(), run()])
  assert.equal(fetches, 2, 'one admitted logical batch used its two reserved attempts')
  assert.equal(results.filter(Boolean).length, 1, 'the competing batch could not borrow unreserved retry tokens')
  const saved = JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.requests, 2)
  assert.equal(saved.tokens, 100 + perAttemptBound + actualSuccessTokens)
  assert.ok(actualSuccessTokens > oldEstimate, 'regression must exceed the empirical estimate that used to authorize the call')
  assert.ok(saved.tokens <= tokenCap)
})

await check('timed-out ingester attempts with no usage are charged conservatively', async () => {
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-ingester-timeout-budget-'))
  const items = [{ headline: 'Nvidia announces a large data-center investment', source_name: 'Reuters', region: 'US' } as any]
  const options = { model: 'test-model', baseUrl: 'https://api.example/v1', apiKey: 'test-key', maxTokens: 900 }
  const perAttemptBound = triageGroqTokenBound(items, options)
  const tokenCap = 100 + perAttemptBound * 2
  const budget = Budget.load(sharedDir, 10, tokenCap, Date.now(), 'groq-budget.json')
  budget.record(0, 100)
  budget.save()
  let fetches = 0
  const result = await triageGroqWithReservation({
    budget, pace: { targetTokens: tokenCap, floorFrac: 1 }, estimatedTokens: 400,
    items, options,
    fetchFn: (async () => { fetches++; throw new DOMException('Timed out', 'TimeoutError') }) as typeof fetch,
    sleep: async () => {}, maxAttempts: 2,
  })
  assert.equal(result?.ok, false)
  assert.equal(fetches, 2)
  const saved = JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.requests, 2)
  assert.equal(saved.tokens, tokenCap, 'missing usage charges the same safe bound reserved for both attempts')
})

await check('malformed successful responses consume only their reserved ingester retry authority', async () => {
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-ingester-malformed-budget-'))
  const items = [{ headline: 'Nvidia announces a large data-center investment', source_name: 'Reuters', region: 'US' } as any]
  const options = { model: 'test-model', baseUrl: 'https://api.example/v1', apiKey: 'test-key', maxTokens: 900 }
  const perAttemptBound = triageGroqTokenBound(items, options)
  const tokenCap = perAttemptBound * 2
  const budget = Budget.load(sharedDir, 2, tokenCap, Date.now(), 'groq-budget.json')
  let fetches = 0
  const result = await triageGroqWithReservation({
    budget, pace: { targetTokens: tokenCap, floorFrac: 1 }, estimatedTokens: 400,
    items, options,
    fetchFn: (async () => {
      fetches++
      return new Response('{malformed', { status: 200, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch,
    sleep: async () => {}, maxAttempts: 2,
  })
  assert.equal(result?.ok, false)
  assert.equal(fetches, 2)
  assert.equal(result?.requests, 2, 'two malformed responses count as the two reserved HTTP attempts, not four')
  const saved = JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.requests, 2)
  assert.equal(saved.tokens, tokenCap, 'both missing-usage attempts retain the strict bound without overspending it')
})

await check('ingester degrades to one attempt when paced headroom cannot reserve two', async () => {
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-ingester-pace-budget-'))
  const items = [{ headline: 'Nvidia announces a large data-center investment', source_name: 'Reuters', region: 'US' } as any]
  const options = { model: 'test-model', baseUrl: 'https://api.example/v1', apiKey: 'test-key', maxTokens: 900 }
  const perAttemptBound = triageGroqTokenBound(items, options)
  const budget = Budget.load(sharedDir, 10, 300 + perAttemptBound * 2 + 100, Date.now(), 'groq-budget.json')
  budget.record(0, 300)
  budget.save()
  let fetches = 0
  const result = await triageGroqWithReservation({
    budget, pace: { targetTokens: 300 + perAttemptBound + 10, floorFrac: 1 }, estimatedTokens: 400,
    items, options,
    fetchFn: (async () => { fetches++; return new Response('rate limited', { status: 429 }) }) as typeof fetch,
    sleep: async () => {}, maxAttempts: 2,
  })
  assert.equal(fetches, 1, 'one paced attempt runs instead of skipping or retaining unreserved retry authority')
  assert.equal(result?.requests, 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8')).tokens, 300 + perAttemptBound)
})

await check('idea pass reserves the worst case when actual usage exceeds its old estimate near cap', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-idea-token-budget-'))
  const ideaRows: IdeaInputRow[] = [{
    event_id: 'EVT-token-race', headline: 'Nvidia announces a large data-center investment', headline_orig: 'Nvidia announces a large data-center investment',
    url: 'https://reuters.com/token-race', source_name: 'Reuters', region: 'US', materiality: 90, label: 'high',
    event_types: ['capex'], issuer_linkage: 'primary', companies: [{ name: 'Nvidia', ticker: 'NVDA', listing_country: 'US' }], found_at: new Date().toISOString(),
  }]
  const est = estimateIdeaTokens(ideaRows.length)
  const perAttemptBound = ideaGroqTokenBound(ideaRows, 900)
  const actualSuccessTokens = est + 250
  const tokenCap = 100 + perAttemptBound * 2
  const seed = Budget.load(sharedDir, 10, tokenCap, Date.now(), 'groq-budget.json')
  seed.record(0, 100)
  seed.save()
  let fetches = 0
  const retryingFetch = async () => {
    fetches++
    if (fetches === 1) return new Response('rate limited', { status: 429 })
    return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }], usage: { total_tokens: actualSuccessTokens } }), { status: 200 })
  }
  const run = () => callGroqForIdeaPass(ideaRows, {
    repoRoot: sharedDir, stateDir: sharedDir, refreshBoard: async () => {}, fetchFn: retryingFetch, sleep: async () => {},
    config: {
      topN: 1, shelfLifeHrs: 1, inputMaxAgeHrs: 1, minIntervalSec: 0, refreshSec: 0, groqApiKey: 'test-key', groqBaseUrl: 'https://api.example/v1', groqModel: 'test-model', groqMaxTokens: 900,
      groqDailyReqCap: 10, groqDailyTokenCap: tokenCap, groqDailyTokenTarget: tokenCap, groqPaceFloorFrac: 1,
      groqRpm: 0, groqTpm: 1_000_000, llmCooldownMs: 1_000, llmCooldownMaxMs: 10_000, limiterWaitMs: 0,
    },
  })
  const results = await Promise.all([run(), run()])
  assert.equal(fetches, 2)
  assert.equal(results.filter(Boolean).length, 1)
  const saved = JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.requests, 2)
  assert.equal(saved.tokens, 100 + perAttemptBound + actualSuccessTokens)
  assert.ok(actualSuccessTokens > est, 'regression must exceed the empirical estimate that used to authorize the call')
  assert.ok(saved.tokens <= tokenCap)
})

await check('idea pass degrades to one attempt at the pacer boundary', async () => {
  resetSharedLimiters()
  resetBudgetMemory()
  const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-idea-pace-budget-'))
  const ideaRows: IdeaInputRow[] = [{
    event_id: 'EVT-pace', headline: 'Nvidia announces a large data-center investment', headline_orig: 'Nvidia announces a large data-center investment',
    url: 'https://reuters.com/pace', source_name: 'Reuters', region: 'US', materiality: 90, label: 'high',
    event_types: ['capex'], issuer_linkage: 'primary', companies: [{ name: 'Nvidia', ticker: 'NVDA', listing_country: 'US' }], found_at: new Date().toISOString(),
  }]
  const perAttemptBound = ideaGroqTokenBound(ideaRows, 900)
  const hardCap = 100 + perAttemptBound * 2 + 100
  const seed = Budget.load(sharedDir, 10, hardCap, Date.now(), 'groq-budget.json')
  seed.record(0, 100)
  seed.save()
  let fetches = 0
  const result = await callGroqForIdeaPass(ideaRows, {
    repoRoot: sharedDir, stateDir: sharedDir, refreshBoard: async () => {},
    fetchFn: (async () => { fetches++; return new Response('rate limited', { status: 429 }) }) as typeof fetch,
    sleep: async () => {},
    config: {
      topN: 1, shelfLifeHrs: 1, inputMaxAgeHrs: 1, minIntervalSec: 0, refreshSec: 0, groqApiKey: 'test-key', groqBaseUrl: 'https://api.example/v1', groqModel: 'test-model', groqMaxTokens: 900,
      groqDailyReqCap: 10, groqDailyTokenCap: hardCap, groqDailyTokenTarget: 100 + perAttemptBound + 10, groqPaceFloorFrac: 1,
      groqRpm: 0, groqTpm: 1_000_000, llmCooldownMs: 1_000, llmCooldownMaxMs: 10_000, limiterWaitMs: 0,
    },
  })
  assert.equal(fetches, 1)
  assert.equal(result?.requests, 1)
  assert.equal(JSON.parse(fs.readFileSync(path.join(sharedDir, 'groq-budget.json'), 'utf8')).tokens, 100 + perAttemptBound)
})

await check('request lifecycle aborts premature disconnects but ignores a normal response close', () => {
  const request = new EventEmitter()
  const response = Object.assign(new EventEmitter(), { writableEnded: false })
  const first = bindNewsChatRequestAbort(request, response)
  response.emit('close')
  assert.equal(first.controller.signal.aborted, true)
  first.dispose()

  const normalRequest = new EventEmitter()
  const normalResponse = Object.assign(new EventEmitter(), { writableEnded: true })
  const normal = bindNewsChatRequestAbort(normalRequest, normalResponse)
  normalResponse.emit('close')
  assert.equal(normal.controller.signal.aborted, false)
  normalRequest.emit('aborted')
  assert.equal(normal.controller.signal.aborted, true)
  normal.dispose()
})

await check('request lifecycle catches connections already gone before handlers are attached', () => {
  for (const requestState of [{ aborted: true }, { destroyed: true }]) {
    const request = Object.assign(new EventEmitter(), requestState)
    const response = Object.assign(new EventEmitter(), { writableEnded: false, destroyed: false })
    const bound = bindNewsChatRequestAbort(request, response)
    assert.equal(bound.controller.signal.aborted, true)
    bound.dispose()
  }
  for (const responseState of [{ destroyed: true }, { closed: true }]) {
    const request = new EventEmitter()
    const response = Object.assign(new EventEmitter(), { writableEnded: false, ...responseState })
    const bound = bindNewsChatRequestAbort(request, response)
    assert.equal(bound.controller.signal.aborted, true)
    bound.dispose()
  }
  const completed = bindNewsChatRequestAbort(
    new EventEmitter(),
    Object.assign(new EventEmitter(), { writableEnded: true, destroyed: true, closed: true }),
  )
  assert.equal(completed.controller.signal.aborted, false)
  completed.dispose()

  const racingRequest = new EventEmitter()
  const racingResponse = Object.assign(new EventEmitter(), { writableEnded: false, destroyed: false })
  const once = racingResponse.once.bind(racingResponse)
  racingResponse.once = ((event: string, listener: () => void) => {
    racingResponse.destroyed = true // disconnect lands during handler registration without a replayable event
    return once(event, listener)
  }) as typeof racingResponse.once
  const raced = bindNewsChatRequestAbort(racingRequest, racingResponse)
  assert.equal(raced.controller.signal.aborted, true)
  raced.dispose()
})

console.log(`\n${passed} checks passed`)
