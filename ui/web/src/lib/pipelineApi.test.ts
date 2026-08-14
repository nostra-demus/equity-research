// Pipeline API wire regressions: preserve server duplicate-coverage evidence and explanatory 409 messages.
import assert from 'node:assert/strict'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api, DATA_NEEDS_CLIENT_TIMEOUT_MS } = await import('./api')
const originalFetch = globalThis.fetch

let passed = 0
const check = async (name: string, fn: () => Promise<void>) => {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

await check('data-needs read budget covers the measured cold-host path while remaining bounded', async () => {
  assert.equal(DATA_NEEDS_CLIENT_TIMEOUT_MS, 20_000)
  assert.ok(DATA_NEEDS_CLIENT_TIMEOUT_MS > 14_000)
})

await check('a rejected connector build preserves the server explanation, not just HTTP 409', async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({
    ok: false, status: 'connector_exists',
    message: 'Connector fixture already covers this need; repair it instead.',
  }), { status: 409, headers: { 'content-type': 'application/json' } })) as typeof fetch
  await assert.rejects(() => api.buildConnector('PIPE-fixture'),
    (error: any) => error?.message === 'Connector fixture already covers this need; repair it instead.')
})

await check('discovery forwards connector_exists through the SSE API boundary', async () => {
  const body = [
    'event: discover-found',
    'data: {"pipeline_id":"PIPE-fixture","source_url":"https://fixture.test/data","why":"fixture","verdict":{"matched_need_ids":[]},"building":false,"connector_exists":"existing-fixture"}',
    '',
    'event: discover-done',
    'data: {"found":1,"autoBuilt":0}',
    '',
    '',
  ].join('\n')
  globalThis.fetch = (async () => new Response(body, {
    status: 200, headers: { 'content-type': 'text/event-stream' },
  })) as typeof fetch
  const found: any[] = []
  let endedWithoutTerminal = false
  await api.pipelineDiscoverStream('ZZZ', 'fixture', {}, {
    signal: new AbortController().signal,
    onFound: (feed) => found.push(feed), onDone: () => {}, onError: (message) => assert.fail(message),
    onEnd: () => { endedWithoutTerminal = true },
  })
  assert.equal(found[0]?.connector_exists, 'existing-fixture')
  assert.equal(endedWithoutTerminal, false, 'discover-done is terminal, not a premature EOF')
})

await check('discovery reports an EOF that has no done/error frame', async () => {
  const body = [
    'event: discover-status',
    'data: {"stage":"searching"}',
    '',
  ].join('\n')
  globalThis.fetch = (async () => new Response(body, {
    status: 200, headers: { 'content-type': 'text/event-stream' },
  })) as typeof fetch
  let endedWithoutTerminal = false
  await api.pipelineDiscoverStream('ZZZ', 'fixture', {
    need_id: 'missing-series', runRoot: 'fixture/runs/ZZZ', decisionFingerprint: `sha256:${'a'.repeat(64)}`,
  }, {
    signal: new AbortController().signal,
    onFound: () => {}, onDone: () => assert.fail('unexpected done'), onError: (message) => assert.fail(message),
    onEnd: () => { endedWithoutTerminal = true },
  })
  assert.equal(endedWithoutTerminal, true)
})

await check('selected historical runRoot crosses both data-needs GET and targeted discovery POST', async () => {
  const requests: { url: string; init?: RequestInit }[] = []
  globalThis.fetch = (async (input, init) => {
    requests.push({ url: String(input), init })
    if (String(input).startsWith('/api/data-needs/')) {
      return new Response(JSON.stringify({ read: {
        contract_version: 'data-needs-read/2', subject: 'ZZZ', swarm: 'research', run_root: 'analyses/ZZZ_2026-08-12',
        decision_fingerprint: `sha256:${'a'.repeat(64)}`, decided_at: '2026-08-13T10:00:00Z', needs: [], widened: [],
      } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response([
      'event: discover-done',
      `data: {"found":0,"autoBuilt":0,"decisionFingerprint":"sha256:${'a'.repeat(64)}"}`,
      '',
      '',
    ].join('\n'), { status: 200, headers: { 'content-type': 'text/event-stream' } })
  }) as typeof fetch
  const runRoot = 'analyses/ZZZ_2026-08-12'
  const decisionFingerprint = `sha256:${'a'.repeat(64)}`
  await api.dataNeeds('ZZZ', 'research', runRoot)
  await api.pipelineDiscoverStream('ZZZ', 'research', { need_id: 'missing-series', runRoot, decisionFingerprint }, {
    signal: new AbortController().signal,
    onFound: () => {}, onDone: () => {}, onError: (message) => assert.fail(message),
  })
  const getUrl = new URL(requests[0].url, 'https://fixture.test')
  assert.equal(getUrl.pathname, '/api/data-needs/ZZZ')
  assert.equal(getUrl.searchParams.get('swarm'), 'research')
  assert.equal(getUrl.searchParams.get('runRoot'), runRoot)
  assert.deepEqual(JSON.parse(String(requests[1].init?.body)), {
    subject: 'ZZZ', need_id: 'missing-series', runRoot, decisionFingerprint,
  })
})

await check('scoped rerun POST carries the exact selected-call identity', async () => {
  let posted: any = null
  let requested = ''
  globalThis.fetch = (async (input, init) => {
    requested = String(input)
    posted = JSON.parse(String(init?.body || '{}'))
    return new Response(JSON.stringify({ runId: 'run-fixture', carried: [], scoped: [], staleModules: [] }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
  const runRoot = 'analyses/ZZZ_2026-08-12'
  const decisionFingerprint = `sha256:${'c'.repeat(64)}`
  const plan = {
    planPath: `${runRoot}/intake/2026-08-13_intake_plan.json`,
    planSha256: `sha256:${'d'.repeat(64)}`,
    sourceDecisionFingerprint: decisionFingerprint,
  }
  await api.runIntakePlan('ZZZ', 'research', runRoot, decisionFingerprint, plan)
  assert.equal(new URL(requested, 'https://fixture.test').pathname, '/api/intake-plan/run-exact')
  assert.deepEqual(posted, { ticker: 'ZZZ', swarm: 'research', runRoot, decisionFingerprint, ...plan })
})

await check('single-orb rerun POST uses only the versioned exact endpoint', async () => {
  let requested = ''
  let posted: any = null
  globalThis.fetch = (async (input, init) => {
    requested = String(input)
    posted = JSON.parse(String(init?.body || '{}'))
    return new Response(JSON.stringify({ runId: 'run-fixture', preflight: {} }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
  const body = {
    kind: 'rerun' as const, ticker: 'ZZZ', module: 'demand', agent: 'source-reader',
    runRoot: 'analyses/ZZZ_2026-08-12', decisionFingerprint: `sha256:${'e'.repeat(64)}`,
    planPath: 'analyses/ZZZ_2026-08-12/intake/2026-08-13_intake_plan.json',
    planSha256: `sha256:${'a'.repeat(64)}`,
    sourceDecisionFingerprint: `sha256:${'b'.repeat(64)}`,
  }
  await api.launchExact(body)
  assert.equal(new URL(requested, 'https://fixture.test').pathname, '/api/launch/exact')
  assert.deepEqual(posted, body)
})

await check('generic launch client cannot accidentally send a rerun to the legacy endpoint', async () => {
  let fetched = false
  globalThis.fetch = (async () => { fetched = true; throw new Error('must not fetch') }) as typeof fetch
  await assert.rejects(() => api.launch({
    kind: 'rerun', ticker: 'ZZZ', module: 'demand', agent: 'source-reader',
    runRoot: 'analyses/ZZZ_2026-08-12', decisionFingerprint: `sha256:${'9'.repeat(64)}`,
  }), /versioned launch endpoint/)
  assert.equal(fetched, false)
})

await check('manual document analysis uses only the versioned exact endpoint', async () => {
  let requested = ''
  globalThis.fetch = (async (input) => {
    requested = String(input)
    return new Response(JSON.stringify({ runId: 'intake-fixture' }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
  const runRoot = 'analyses/ZZZ_2026-08-12'
  const decisionFingerprint = `sha256:${'f'.repeat(64)}`
  await api.analyzeIntake('ZZZ', 'research', runRoot, decisionFingerprint)
  const url = new URL(requested, 'https://fixture.test')
  assert.equal(url.pathname, '/api/intake/ZZZ/analyze-exact')
  assert.equal(url.searchParams.get('swarm'), 'research')
  assert.equal(url.searchParams.get('runRoot'), runRoot)
  assert.equal(url.searchParams.get('decisionFingerprint'), decisionFingerprint)
})

await check('rerun estimate asks the server to verify and echo the exact selected call', async () => {
  let requested = ''
  const runRoot = 'analyses/ZZZ_2026-08-12'
  const decisionFingerprint = `sha256:${'d'.repeat(64)}`
  globalThis.fetch = (async (input) => {
    requested = String(input)
    return new Response(JSON.stringify({
      kind: 'rerun', ticker: 'ZZZ', module: 'demand', agent: 'source-reader', agentCount: 3,
      estCostUsdRange: [1, 2], estMinutesRange: [1, 2], willCommitToMain: true,
      estCommits: 1, requiresTypedConfirm: false, creditPreflight: { ok: true, checked: true },
      exactDecisionBinding: { contractVersion: 'exact-decision-launch/1', runRoot, decisionFingerprint },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  const receipt = await api.estimate('rerun', 'ZZZ', 'demand', 'source-reader', undefined, {
    runRoot, decisionFingerprint,
  })
  const url = new URL(requested, 'https://fixture.test')
  assert.equal(url.pathname, '/api/launch/estimate')
  assert.equal(url.searchParams.get('runRoot'), runRoot)
  assert.equal(url.searchParams.get('decisionFingerprint'), decisionFingerprint)
  assert.equal(receipt.exactDecisionBinding?.contractVersion, 'exact-decision-launch/1')
  assert.equal(receipt.exactDecisionBinding?.runRoot, runRoot)
  assert.equal(receipt.exactDecisionBinding?.decisionFingerprint, decisionFingerprint)
})

await check('new client fails closed against an old data-needs response', async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({ read: {
    subject: 'ZZZ', swarm: 'research', run_root: 'analyses/ZZZ_2026-08-12', decided_at: '2026-08-13T10:00:00Z',
    needs: [], widened: [],
  } }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch
  assert.equal(await api.dataNeeds('ZZZ', 'research', 'analyses/ZZZ_2026-08-12'), null)
})

await check('targeted discovery cannot run without immutable decision identity', async () => {
  let fetched = false
  globalThis.fetch = (async () => { fetched = true; throw new Error('must not fetch') }) as typeof fetch
  let message = ''
  await api.pipelineDiscoverStream('ZZZ', 'research', {
    need_id: 'missing-series', runRoot: 'analyses/ZZZ_2026-08-12',
  }, {
    signal: new AbortController().signal,
    onFound: () => {}, onDone: () => assert.fail('unexpected done'), onError: (value) => { message = value },
  })
  assert.equal(fetched, false)
  assert.equal(message, 'selected-decision-contract-unavailable')
})

globalThis.fetch = originalFetch
console.log(`\npipelineApi.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
