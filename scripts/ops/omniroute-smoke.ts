// Live, one-request scorer-contract smoke for the local OmniRoute gateway.
// Run through omniroute-smoke.sh so the same tsx runtime as the engine executes the exact production
// descriptor, prompt builder, HTTP adapter, response parser, and complete-index guard.

import { buildOmniRouteProvider } from '../../ui/server/src/config'
import { triageBatch } from '../../ui/server/src/news/triage/groq'
import type { NewsItem } from '../../ui/server/src/news/types'

async function main(): Promise<void> {
  const provider = buildOmniRouteProvider()
  const args = process.argv.slice(2)
  const testLoopback = args.length === 1 && args[0] === '--test-loopback'
  if ((!testLoopback && args.length !== 0)
      || (!testLoopback && provider.baseUrl !== 'http://127.0.0.1:20128/v1')) {
    throw new Error('OmniRoute smoke requires the production loopback endpoint')
  }
  if (testLoopback) {
    const mockUrl = new URL(provider.baseUrl)
    if (mockUrl.protocol !== 'http:' || mockUrl.hostname !== '127.0.0.1'
        || !mockUrl.port || mockUrl.pathname !== '/v1' || mockUrl.username || mockUrl.password
        || mockUrl.search || mockUrl.hash) {
      throw new Error('OmniRoute mock smoke requires a literal loopback endpoint')
    }
  }
  const headlines = [
    'Central bank unexpectedly cuts its policy rate by 50 basis points',
    'Manufacturer cuts annual profit guidance by 20 percent',
    'Regulator fines a major bank $500 million for control failures',
    'Chipmaker announces a $4 billion new fabrication plant',
    'Credit agency downgrades issuer after a missed debt payment',
    'Chief financial officer resigns with immediate effect',
    'Energy producer shuts a refinery after an unplanned outage',
    'Company authorizes a $2 billion share repurchase',
    'Activist investor discloses a 7 percent ownership stake',
    'Retailer reports quarterly revenue up 12 percent',
    'Government introduces new sector-wide import restrictions',
    'Daily market recap lists the ten most active shares',
  ]
  const items: NewsItem[] = headlines.map((headline, index) => ({
    event_id: `EVT-OMNIROUTE-SMOKE-${index}`,
    headline,
    url: `https://example.invalid/omniroute-smoke-${index}`,
    domain: 'example.invalid',
    source_name: 'OmniRoute scorer-contract smoke',
    region: 'GLOBAL',
    input_nature: 'news_headline',
    found_at: new Date().toISOString(),
    dedup_status: 'new',
  }))

  const result = await triageBatch(items, {
    model: provider.model,
    models: provider.models,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    maxTokens: provider.maxTokens,
    headers: provider.headers,
    extraBody: provider.extraBody,
    timeoutMs: provider.timeoutMs,
    maxAttempts: 1,
  })

  const complete = items.every((_item, index) => result.byIndex.has(index))
  if (!result.ok || result.byIndex.size !== items.length || !complete) {
    console.error(JSON.stringify({
      ok: false,
      provider: provider.id,
      model: provider.model,
      requests: result.requests,
      failureKind: result.failureKind ?? 'contract',
      httpStatus: result.httpStatus ?? null,
      rows: result.byIndex.size,
      expectedRows: items.length,
      note: result.note ?? 'missing complete scorer rows',
    }))
    process.exitCode = 1
    return
  }

  console.log(JSON.stringify({
    ok: true,
    provider: provider.id,
    model: provider.model,
    requests: result.requests,
    rows: result.byIndex.size,
    expectedRows: items.length,
  }))
}

void main().catch((error: unknown) => {
  const note = error instanceof Error ? error.message : 'unexpected smoke failure'
  console.error(JSON.stringify({ ok: false, provider: 'omniroute', failureKind: 'request', note }))
  process.exitCode = 1
})
