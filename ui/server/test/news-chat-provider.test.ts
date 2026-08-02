process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { compactNewsChatUserPrompt, runNewsChatFallback, shouldUseNewsChatFallback } from '../src/news/chat-provider'

let passed = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const config = { enabled: true, apiKey: 'test-key', baseUrl: 'https://api.example/v1', model: 'test-model', timeoutMs: 5_000, maxTokens: 900 }

await check('backup stays closed-book and returns the provider answer', async () => {
  let body: any
  let output = ''
  const result = await runNewsChatFallback({
    system: 'Use only cited evidence.', user: '[N1] Amazon Bedrock evidence', signal: new AbortController().signal,
    onToken: (text) => { output += text }, config,
    fetchImpl: async (url: any, init: any) => {
      assert.equal(String(url), 'https://api.example/v1/chat/completions')
      body = JSON.parse(String(init.body))
      return new Response(JSON.stringify({ choices: [{ message: { content: 'No exact growth rate is proven [N1].' } }] }), { status: 200 })
    },
  })
  assert.equal(result.error, undefined)
  assert.equal(result.model, 'groq/test-model')
  assert.equal(output, 'No exact growth rate is proven [N1].')
  assert.deepEqual(body.messages, [{ role: 'system', content: 'Use only cited evidence.' }, { role: 'user', content: '[N1] Amazon Bedrock evidence' }])
  assert.equal(body.stream, false)
})

await check('backup is skipped without explicit configuration', async () => {
  const result = await runNewsChatFallback({ system: 'x', user: 'y', signal: new AbortController().signal, onToken: () => {}, config: { ...config, apiKey: '' } })
  assert.equal(result.attempted, false)
  assert.match(result.error || '', /not configured/i)
})

await check('only provider-availability errors trigger backup', () => {
  assert.equal(shouldUseNewsChatFallback('Claude usage limit reached'), true)
  assert.equal(shouldUseNewsChatFallback('The answer took too long'), true)
  assert.equal(shouldUseNewsChatFallback('Invalid request body'), false)
})

await check('large prompts keep the receipt, cited rows, and exact question inside the backup limit', () => {
  const rows = Array.from({ length: 20 }, (_, i) => `[N${i + 1}] Reuters story ${i}\nsource snippet: ${'evidence '.repeat(180)}\nsaved figures: ${i}%\nurl: https://example.com/${i}`).join('\n\n')
  const large = `NEWS CONTEXT\nSEARCH RECEIPT: searched 170900 saved items.\nCURRENT EVIDENCE:\n${rows}\nOLDER EVIDENCE — use only to test novelty:\n[H1] older source\nsource snippet: old evidence\n\nQUESTION:\nWhat is Amazon Bedrock growth?`
  const compact = compactNewsChatUserPrompt(large, 12_000)
  assert.ok(compact.length <= 12_000)
  assert.match(compact, /SEARCH RECEIPT/)
  assert.match(compact, /\[N1\]/)
  assert.match(compact, /\[H1\]/)
  assert.match(compact, /What is Amazon Bedrock growth\?/)
})

console.log(`\n${passed} checks passed`)
