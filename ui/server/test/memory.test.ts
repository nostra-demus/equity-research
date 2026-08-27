import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createMemoryReader, MEMORY_QUERY_LIMIT, type MemoryExec } from '../src/memory'

let pass = 0
let fail = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn()
    pass++
    console.log(`ok  ${name}`)
  } catch (error: any) {
    fail++
    console.error(`FAIL  ${name}\n      ${error?.stack || error?.message || error}`)
  }
}

async function eventually(predicate: () => boolean, message: string) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  assert.fail(message)
}

const temporaryRoots: string[] = []
function stateDir(): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'memory-ui-test-')))
  temporaryRoots.push(root)
  return root
}
process.once('exit', () => {
  for (const root of temporaryRoots) {
    try { fs.rmSync(root, { recursive: true, force: true }) } catch {}
  }
})

const PROJECT_DIGEST = 'f'.repeat(64)
const QUERY_DIGEST = 'e'.repeat(64)
const SOURCE_DIGEST = 'a'.repeat(64)
const GIT_COMMIT = 'c'.repeat(40)

function event(
  id: string,
  recordType: string,
  eventType: string,
  record: Record<string, unknown>,
  patch: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    schema: 'memory-event/v1',
    event_id: id,
    event_type: eventType,
    system_time: '2026-08-21T10:00:00Z',
    valid_time: { from: '2026-08-20', to: null },
    subject_ids: ['entity:internal:test'],
    run_id: null,
    producer: { name: 'test', version: '1', runtime: 'test' },
    payload: {
      record_type: recordType,
      record,
      source_path: `fixtures/${id}.json`,
      source_locator: 'json',
      source_sha256: SOURCE_DIGEST,
      source_git_commit: GIT_COMMIT,
    },
    derived_from: [],
    supersedes: [],
    evidence_refs: [`evidence:sha256:${SOURCE_DIGEST}#json`],
    policy: { classification: 'internal', retention: 'permanent', retain_until: null },
    integrity: { payload_sha256: SOURCE_DIGEST, signature: null },
    ...patch,
  }
}

function withSource(memoryEvent: Record<string, unknown>, source: string): Record<string, unknown> {
  ;(memoryEvent.payload as Record<string, unknown>).source_path = source
  return memoryEvent
}

function corpus(): Record<string, unknown>[] {
  return [
    withSource(event('evt_research_decision', 'equity_decision_record', 'decision.recorded', {
      ticker: 'ABC', company_name: 'ABC Limited', decision: 'Strong Buy', confidence_score: 72,
      post_mortem_decision: 'Watchlist', post_review_confidence_score: 55,
      suggested_action: 'Wait for audited cash flow.', api_key: 'SHOULD_NEVER_ESCAPE',
    }), 'analyses/ABC_2026-08-20/decision_record.json'),
    event('evt_research_review', 'equity_decision_review', 'outcome.reviewed', {
      ticker: 'ABC', review_window: '30d', thesis_status: 'Mixed', lessons: ['Demand improved more slowly than expected.'],
    }),
    withSource(event('evt_research_correction', 'equity_decision_correction', 'correction.recorded', {
      errata: [{ field: 'margin', reason: 'The cited margin was corrected.' }],
    }, { derived_from: ['evt_research_decision'] }), 'analyses/ABC_2026-08-20/corrections.json'),
    event('evt_commodity', 'commodity_decision_record', 'decision.recorded', {
      commodity: 'GOLD', action: 'Hold', confidence: 52,
      post_mortem_action: 'Trim', post_review_confidence_score: 39,
      thesis_summary: 'Real yields still decide the near-term direction.',
    }),
    event('evt_idea_old', 'screener_idea_history', 'screener.idea.recorded', {
      idea_id: 'IDEA-1', ticker: 'XYZ', company: 'XYZ Plc', direction: 'long', status: 'live', conviction: 61,
      why_now: 'An earnings update is due.',
    }, { system_time: '2026-08-19T10:00:00Z', valid_time: { from: '2026-08-19', to: null } }),
    event('evt_idea_new', 'screener_idea_history', 'screener.idea.recorded', {
      idea_id: 'IDEA-1', ticker: 'XYZ', company: 'XYZ Plc', direction: 'long', status: 'promoted', conviction: 68,
      why_now: 'Audited demand evidence arrived.',
    }, { supersedes: ['evt_idea_old'] }),
  ]
}

function projectPacket(eventCount: number, diagnostics: unknown[] = [{ severity: 'info' }]): string {
  return JSON.stringify({
    schema: 'memory-cli-report/v1', command: 'project', ok: true,
    projection: {
      path: '/must/not/escape.sqlite', event_count: eventCount, subject_count: eventCount,
      edge_count: 0, evidence_ref_count: eventCount, artifact_count: 0, typed_payload_count: 0,
      digest: PROJECT_DIGEST,
    },
    diagnostics,
  })
}

function queryPacket(events: Record<string, unknown>[]): string {
  return JSON.stringify({
    schema: 'memory-query-result/v1',
    query: {
      requested: {
        subject_ids: [], event_types: [], classifications: ['internal'], as_of: null,
        valid_at: null, text: null, current_only: false, limit: MEMORY_QUERY_LIMIT,
      },
      effective: {
        as_of: '2026-08-21T10:00:00Z', valid_at_from: '2026-08-21T10:00:00Z',
        valid_at_to: '2026-08-21T10:00:00Z', policy_evaluated_at: '2026-08-21T10:00:00Z',
      },
    },
    trusted_projection_digest_matched: true,
    event_count: events.length,
    events,
    result_sha256: QUERY_DIGEST,
  })
}

function fixtureExec(events = corpus(), diagnostics?: unknown[]): { exec: MemoryExec; calls: Array<{ file: string; args: readonly string[]; options: any }> } {
  const calls: Array<{ file: string; args: readonly string[]; options: any }> = []
  const exec: MemoryExec = async (file, args, options) => {
    calls.push({ file, args, options })
    return { stdout: args.includes('project') ? projectPacket(events.length, diagnostics) : queryPacket(events) }
  }
  return { exec, calls }
}

await check('maps the complete corpus across all three cockpits without exposing payloads or the projection digest', async () => {
  const fixture = fixtureExec()
  const reader = createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec })
  const read = await reader.read()
  assert.equal(read.contract_version, 'memory-ui/1')
  assert.equal(read.available, true)
  assert.equal(read.read_only, true)
  assert.equal(read.status.state, 'healthy')
  assert.equal(read.status.event_count, 6)
  assert.equal(read.status.source_count, 6)
  assert.equal(read.status.diagnostics_count, 1)
  assert.deepEqual(read.counts, {
    total: 6, research: 3, screener: 2, commodity: 1, decisions: 2, reviews: 1, corrections: 1,
  })
  assert.deepEqual(new Set(read.items.map((item) => item.cockpit)), new Set(['research', 'screener', 'commodity']))
  assert.equal(read.items.find((item) => item.event_id === 'evt_research_decision')?.title, 'ABC: Watchlist')
  assert.equal(read.items.find((item) => item.event_id === 'evt_research_decision')?.confidence, 55)
  assert.equal(
    read.items.find((item) => item.event_id === 'evt_research_decision')?.summary,
    'The final red-team check changed this call from Strong Buy to Watchlist.',
  )
  assert.equal(
    read.items.find((item) => item.event_id === 'evt_commodity')?.summary,
    'The final red-team check changed this call from Hold to Trim.',
  )
  assert.equal(read.items.find((item) => item.event_id === 'evt_commodity')?.title, 'GOLD: Trim')
  assert.equal(read.items.find((item) => item.event_id === 'evt_commodity')?.confidence, 39)
  assert.equal(read.items.find((item) => item.event_id === 'evt_research_correction')?.lineage.derived_from[0], 'evt_research_decision')
  const correctedDecision = read.items.find((item) => item.event_id === 'evt_research_decision')!
  assert.equal(correctedDecision.current, true, 'a correction annotates the decision; it does not replace it')
  assert.deepEqual(correctedDecision.lineage.corrected_by, ['evt_research_correction'])
  assert.equal(read.items[0].proof.source_verified, true)
  assert.equal(read.items[0].proof.evidence_ref_count, 1)
  assert.equal(read.items[0].source.sha256, SOURCE_DIGEST)
  assert.equal(read.items[0].source.git_commit, GIT_COMMIT)

  const response = JSON.stringify(read)
  assert.doesNotMatch(response, /SHOULD_NEVER_ESCAPE/)
  assert.doesNotMatch(response, new RegExp(PROJECT_DIGEST))
  assert.doesNotMatch(response, /must\/not\/escape/)
  assert.doesNotMatch(response, /payload|entitlement|policy/)

  assert.equal(fixture.calls.length, 2)
  const query = fixture.calls[1]
  assert.equal(query.file, 'python3')
  assert.ok(query.args.includes('--classification'))
  assert.equal(query.args[query.args.indexOf('--classification') + 1], 'internal')
  assert.ok(query.args.includes('--include-superseded'))
  assert.equal(query.args[query.args.indexOf('--limit') + 1], String(MEMORY_QUERY_LIMIT))
  assert.equal(query.args[query.args.indexOf('--expected-digest') + 1], PROJECT_DIGEST)
  assert.ok(query.args.every((arg) => arg !== 'public' && arg !== 'restricted' && arg !== 'confidential'))
})

await check('never relabels generic screener scores as confidence percentages', async () => {
  const events = [
    event('evt_materiality', 'screener_event', 'screener.signal.recorded', {
      signal_id: 'SIG-1', headline: 'Material signal', materiality_score: 99,
    }),
    event('evt_final_score', 'screener_thesis', 'screener.thesis.recorded', {
      meta: { thesis_id: 'THESIS-1', status: 'active' },
      M0_6_3: { variant_paragraph: 'Variant.' }, M0_6_6: { final_score: 99 },
    }),
    event('evt_conviction', 'screener_idea_snapshot', 'screener.idea.snapshot-recorded', {
      idea_id: 'IDEA-1', ticker: 'ABC', company: 'ABC Limited', conviction: 99,
    }),
    event('evt_edge', 'screener_conviction_state', 'screener.conviction.state-recorded', {
      thesis_id: 'THESIS-1', conviction: 99, edge_score_live: 99,
    }),
    event('evt_probability', 'screener_conviction_checkpoint', 'screener.conviction.checkpoint-recorded', {
      thesis_id: 'THESIS-1', metric_name: 'Revenue trigger', predicted_prob: 0.73,
    }),
    event('evt_named_confidence', 'equity_decision_record', 'decision.recorded', {
      ticker: 'ABC', decision: 'Watchlist', confidence_score: 1,
    }),
  ]
  const fixture = fixtureExec(events)
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  for (const id of ['evt_materiality', 'evt_final_score', 'evt_conviction', 'evt_edge', 'evt_probability']) {
    assert.equal(read.items.find((item) => item.event_id === id)?.confidence, null, id)
  }
  assert.equal(
    read.items.find((item) => item.event_id === 'evt_named_confidence')?.confidence,
    1,
    'an explicitly named 0..100 confidence score of 1 means one percentage point',
  )
})

await check('marks replaced history and records both directions of the change', async () => {
  const fixture = fixtureExec()
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  const oldIdea = read.items.find((item) => item.event_id === 'evt_idea_old')!
  const newIdea = read.items.find((item) => item.event_id === 'evt_idea_new')!
  assert.equal(oldIdea.current, false)
  assert.deepEqual(oldIdea.lineage.replaced_by, ['evt_idea_new'])
  assert.equal(newIdea.current, true)
  assert.deepEqual(newIdea.lineage.supersedes, ['evt_idea_old'])
})

await check('attaches a correction only to its sibling decision, not every provenance parent', async () => {
  const original = withSource(event(
    'evt_original_decision', 'equity_decision_record', 'decision.recorded',
    { ticker: 'ABC', decision: 'Watchlist', suggested_action: 'Original decision.' },
  ), 'analyses/ABC_2026-08-01/decision_record.json')
  const cleanReplacement = withSource(event(
    'evt_clean_replacement', 'equity_decision_record', 'decision.recorded',
    { ticker: 'ABC', decision: 'Buy', suggested_action: 'Later clean decision.' },
  ), 'analyses/ABC_2026-08-15/decision_record.json')
  const correction = withSource(event(
    'evt_exact_correction', 'equity_decision_correction', 'correction.recorded',
    { errata: [{ reason: 'One field in the original decision was corrected.' }] },
    { derived_from: ['evt_original_decision', 'evt_clean_replacement'] },
  ), 'analyses/ABC_2026-08-01/corrections.json')
  const fixture = fixtureExec([original, cleanReplacement, correction])
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  assert.equal(read.status.state, 'healthy')
  assert.deepEqual(
    read.items.find((item) => item.event_id === 'evt_original_decision')?.lineage.corrected_by,
    ['evt_exact_correction'],
  )
  assert.deepEqual(
    read.items.find((item) => item.event_id === 'evt_clean_replacement')?.lineage.corrected_by,
    [],
    'a provenance parent in another analysis folder was not itself corrected',
  )
  assert.equal(read.items.find((item) => item.event_id === 'evt_original_decision')?.current, true)
})

await check('hides an ambiguous reverse correction link and reports one generic diagnostic', async () => {
  const first = withSource(event(
    'evt_ambiguous_first', 'equity_decision_record', 'decision.recorded',
    { ticker: 'ABC', decision: 'Watchlist' },
  ), 'analyses/ABC_2026-08-01/decision_record.json')
  const second = withSource(event(
    'evt_ambiguous_second', 'equity_decision_record', 'decision.recorded',
    { ticker: 'ABC', decision: 'Watchlist' },
  ), 'analyses/ABC_2026-08-01/decision_record.json')
  const correction = withSource(event(
    'evt_ambiguous_correction', 'equity_decision_correction', 'correction.recorded',
    { errata: [{ reason: 'Correction target is intentionally ambiguous in this fixture.' }] },
    { derived_from: ['evt_ambiguous_first', 'evt_ambiguous_second'] },
  ), 'analyses/ABC_2026-08-01/corrections.json')
  const fixture = fixtureExec([first, second, correction])
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  assert.equal(read.available, true)
  assert.equal(read.status.state, 'degraded')
  assert.equal(read.status.event_count, read.items.length)
  assert.equal(read.status.source_count, new Set(read.items.map((item) => item.source.path)).size)
  assert.equal(read.status.diagnostics_count, 2, 'one source note plus one unclear correction target')
  assert.match(read.status.message, /target is unclear/)
  assert.deepEqual(read.items.find((item) => item.event_id === 'evt_ambiguous_first')?.lineage.corrected_by, [])
  assert.deepEqual(read.items.find((item) => item.event_id === 'evt_ambiguous_second')?.lineage.corrected_by, [])
  assert.doesNotMatch(JSON.stringify(read.status), /evt_ambiguous|analyses\/ABC/)
})

await check('uses one bounded TTL cache and starts a background rebuild only after expiry', async () => {
  let clock = Date.parse('2026-08-21T00:00:00Z')
  const fixture = fixtureExec()
  const reader = createMemoryReader({
    repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec, now: () => clock, ttlMs: 1_000,
  })
  const first = await reader.read()
  const second = await reader.read()
  assert.strictEqual(second, first)
  assert.equal(fixture.calls.length, 2)
  clock += 1_001
  const stale = await reader.read()
  assert.equal(stale.status.state, 'degraded')
  assert.strictEqual(stale.generated_at, first.generated_at)
  await eventually(() => fixture.calls.length === 4, 'the stale read never started its background rebuild')
  assert.equal(fixture.calls.length, 4)
  for (const call of fixture.calls) {
    assert.ok(call.options.timeout >= 1_000 && call.options.timeout <= 60_000)
    assert.ok(call.options.maxBuffer >= 1024 * 1024 && call.options.maxBuffer <= 64 * 1024 * 1024)
  }
})

await check('serves last-good immediately while exactly one slow background refresh runs', async () => {
  let clock = Date.parse('2026-08-21T00:00:00Z')
  let build = 0
  let calls = 0
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let markStarted!: () => void
  const started = new Promise<void>((resolve) => { markStarted = resolve })
  const exec: MemoryExec = async (_file, args) => {
    calls++
    if (args.includes('project')) {
      build++
      if (build === 2) {
        markStarted()
        await gate
      }
      return { stdout: projectPacket(1) }
    }
    return { stdout: queryPacket([event(
      'evt_swr', 'equity_decision_record', 'decision.recorded',
      { ticker: 'SWR', decision: 'Watchlist', suggested_action: `Generation ${build}` },
    )]) }
  }
  const reader = createMemoryReader({
    repoRoot: '/safe/repo', stateDir: stateDir(), exec, now: () => clock, ttlMs: 1_000, maxStaleMs: 5_000,
  })
  const first = await reader.read()
  assert.equal(first.items[0].summary, 'Generation 1')
  clock += 1_001
  const stale = await reader.read()
  assert.equal(stale.available, true)
  assert.equal(stale.status.state, 'degraded')
  assert.equal(stale.items[0].summary, 'Generation 1', 'the request did not wait for the slow rebuild')
  await started
  const joined = await reader.read()
  assert.equal(joined.items[0].summary, 'Generation 1')
  assert.equal(calls, 3, 'both stale readers share the same second project')
  release()
  await eventually(() => calls === 4, 'the background query did not finish')
  let fresh = await reader.read()
  for (let attempt = 0; attempt < 100 && fresh.status.state !== 'healthy'; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    fresh = await reader.read()
  }
  assert.equal(fresh.items[0].summary, 'Generation 2')
  assert.equal(fresh.status.state, 'healthy')
})

await check('a failed refresh never extends last-good beyond the bounded max-stale window', async () => {
  const origin = Date.parse('2026-08-21T00:00:00Z')
  let clock = origin
  let failRefresh = false
  let calls = 0
  const events = corpus()
  const exec: MemoryExec = async (_file, args) => {
    calls++
    if (failRefresh && args.includes('project')) throw new Error('private child failure')
    return { stdout: args.includes('project') ? projectPacket(events.length) : queryPacket(events) }
  }
  const reader = createMemoryReader({
    repoRoot: '/safe/repo', stateDir: stateDir(), exec, now: () => clock,
    ttlMs: 1_000, maxStaleMs: 2_000,
  })
  assert.equal((await reader.read()).available, true)
  failRefresh = true
  clock = origin + 1_001
  assert.equal((await reader.read()).available, true, 'last-good remains available inside max-stale')
  await eventually(() => calls === 3, 'the failing background refresh did not run')
  clock = origin + 3_001
  const expired = await reader.read()
  assert.equal(expired.available, false, 'stale data is refused after the fixed max-stale deadline')
  assert.equal(expired.generated_at, null)
  assert.deepEqual(expired.items, [])
  assert.equal(calls, 4)
})

await check('deduplicates concurrent rebuilds into one in-flight project and query', async () => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let markStarted!: () => void
  const started = new Promise<void>((resolve) => { markStarted = resolve })
  const events = corpus()
  let calls = 0
  const exec: MemoryExec = async (_file, args) => {
    calls++
    if (args.includes('project')) {
      markStarted()
      await gate
    }
    return { stdout: args.includes('project') ? projectPacket(events.length) : queryPacket(events) }
  }
  const reader = createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec })
  const first = reader.read()
  const second = reader.read()
  await started
  assert.equal(calls, 1)
  release()
  const [a, b] = await Promise.all([first, second])
  assert.strictEqual(a, b)
  assert.equal(calls, 2)
})

await check('persists and revalidates one owner-only last-known-good view across reader restarts', async () => {
  const root = stateDir()
  const clock = Date.parse('2026-08-21T00:00:00Z')
  const fixture = fixtureExec()
  const first = await createMemoryReader({
    repoRoot: '/safe/repo', stateDir: root, exec: fixture.exec, now: () => clock,
  }).read()
  assert.equal(first.available, true)
  const cacheDir = path.join(root, 'memory-ui')
  const cacheFile = path.join(cacheDir, 'verified-read.json')
  assert.equal(fs.statSync(cacheDir).mode & 0o777, 0o700)
  assert.equal(fs.statSync(cacheFile).mode & 0o777, 0o600)

  let liveCalls = 0
  const refreshFixture = fixtureExec()
  const restarted = createMemoryReader({
    repoRoot: '/safe/repo', stateDir: root, now: () => clock,
    exec: async (...args) => { liveCalls++; return refreshFixture.exec(...args) },
  })
  const restored = await restarted.read()
  assert.deepEqual(restored, first)
  assert.equal(liveCalls, 0, 'a fresh verified cache survives process/reader recreation')
  assert.doesNotMatch(fs.readFileSync(cacheFile, 'utf8'), /SHOULD_NEVER_ESCAPE/)
  assert.equal((await restarted.warm()).available, true)
  assert.equal(liveCalls, 2, 'startup still revalidates a fresh cache against the new checkout')
})

await check('serves a persisted stale view during startup warm-up and shares the live rebuild', async () => {
  const root = stateDir()
  const origin = Date.parse('2026-08-21T00:00:00Z')
  let clock = origin
  await createMemoryReader({
    repoRoot: '/safe/repo', stateDir: root, exec: fixtureExec().exec, now: () => clock,
    ttlMs: 1_000, maxStaleMs: 5_000,
  }).read()
  clock += 1_001
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let started!: () => void
  const projectStarted = new Promise<void>((resolve) => { started = resolve })
  let calls = 0
  const exec: MemoryExec = async (_file, args) => {
    calls++
    if (args.includes('project')) {
      started()
      await gate
      return { stdout: projectPacket(corpus().length) }
    }
    return { stdout: queryPacket(corpus()) }
  }
  const restarted = createMemoryReader({
    repoRoot: '/safe/repo', stateDir: root, exec, now: () => clock,
    ttlMs: 1_000, maxStaleMs: 5_000,
  })
  const warming = restarted.warm()
  await projectStarted
  const immediate = await restarted.read()
  assert.equal(immediate.available, true)
  assert.equal(immediate.status.state, 'degraded')
  assert.equal(calls, 1, 'the browser joins the startup rebuild instead of starting another one')
  release()
  assert.equal((await warming).available, true)
  assert.equal(calls, 2)
})

await check('rejects corrupt, inconsistent, hard-linked or symlinked persisted views and falls back to a bounded live check', async () => {
  for (const attack of ['corrupt', 'inconsistent', 'hardlink', 'symlink'] as const) {
    const root = stateDir()
    const clock = Date.parse('2026-08-21T00:00:00Z')
    await createMemoryReader({
      repoRoot: '/safe/repo', stateDir: root, exec: fixtureExec().exec, now: () => clock,
    }).read()
    const cacheFile = path.join(root, 'memory-ui', 'verified-read.json')
    if (attack === 'corrupt' || attack === 'inconsistent') {
      const envelope = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
      const cachedRead = JSON.parse(envelope.read_json)
      if (attack === 'corrupt') {
        cachedRead.items[0].summary = 'SECRET_TAMPERED_CACHE'
      } else {
        cachedRead.counts.total += 1
      }
      envelope.read_json = JSON.stringify(cachedRead)
      if (attack === 'inconsistent') {
        envelope.read_sha256 = createHash('sha256').update(envelope.read_json).digest('hex')
      }
      fs.writeFileSync(cacheFile, JSON.stringify(envelope), { mode: 0o600 })
    } else if (attack === 'hardlink') {
      fs.linkSync(cacheFile, path.join(root, 'writable-cache-alias.json'))
    } else {
      const hostile = path.join(root, 'hostile.json')
      fs.writeFileSync(hostile, 'SECRET_SYMLINK_TARGET', { mode: 0o600 })
      fs.unlinkSync(cacheFile)
      fs.symlinkSync(hostile, cacheFile)
    }
    let calls = 0
    const read = await createMemoryReader({
      repoRoot: '/safe/repo', stateDir: root, now: () => clock,
      exec: async () => { calls++; throw new Error('SECRET_LIVE_FAILURE') },
    }).read()
    assert.equal(read.available, false, attack)
    assert.equal(calls, 1, attack)
    assert.doesNotMatch(JSON.stringify(read), /SECRET|TAMPERED|SYMLINK/, attack)
  }
})

await check('refuses a symlinked state directory before running projection commands', async () => {
  const root = stateDir()
  const redirected = stateDir()
  fs.symlinkSync(redirected, path.join(root, 'memory-ui'))
  let calls = 0
  const read = await createMemoryReader({
    repoRoot: '/safe/repo', stateDir: root,
    exec: async () => { calls++; return { stdout: projectPacket(0) } },
  }).read()
  assert.equal(read.available, false)
  assert.equal(calls, 0)
  assert.deepEqual(fs.readdirSync(redirected), [])
})

await check('bounds display text while retaining the full searchable event set', async () => {
  const many = Array.from({ length: 457 }, (_, index) => event(
    `evt_bound_${index}`,
    'screener_idea_snapshot',
    'screener.idea.snapshot-recorded',
    {
      idea_id: `IDEA-${index}`, ticker: `T${index}`, company: `Company ${index}`,
      direction: 'long', status: 'live', conviction: 50,
      why_now: `Reason ${index} ${'x'.repeat(600)}`,
    },
  ))
  const fixture = fixtureExec(many)
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  assert.equal(read.available, true)
  assert.equal(read.items.length, 457, 'search covers every reviewed memory, not a newest-card subset')
  assert.equal(read.counts.total, 457)
  assert.ok(read.items.every((item) => item.summary.length <= 420))
  assert.ok(read.items.every((item) => item.title.length <= 180))

  const hostileVerdict = event('evt_bounded_verdict', 'commodity_decision_record', 'decision.recorded', {
    commodity: 'GOLD', action: 'Hold', confidence: 52,
    post_mortem_action: `Trim\u0000${'x'.repeat(200)}`, post_review_confidence_score: 39,
  })
  const hostileFixture = fixtureExec([hostileVerdict])
  const bounded = await createMemoryReader({
    repoRoot: '/safe/repo', stateDir: stateDir(), exec: hostileFixture.exec,
  }).read()
  assert.equal(bounded.available, true)
  assert.ok((bounded.items[0].status?.length ?? 0) <= 80)
  assert.doesNotMatch(bounded.items[0].status ?? '', /[\u0000-\u001f\u007f]/)
})

await check('isolates an unsupported future record while keeping known memories available and honest', async () => {
  const events = [
    event('evt_known', 'commodity_decision_record', 'decision.recorded', {
      commodity: 'COPPER', action: 'Avoid', confidence: 55, thesis_summary: 'Known memory remains visible.',
    }),
    event('evt_unknown', 'future_private_record', 'private.recorded', { token: 'SECRET_IN_FUTURE_PAYLOAD' }),
  ]
  const fixture = fixtureExec(events)
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  assert.equal(read.available, true)
  assert.equal(read.status.state, 'degraded')
  assert.equal(read.status.event_count, 1)
  assert.equal(read.status.source_count, 1)
  assert.equal(read.status.diagnostics_count, 2, 'one source note plus one isolated unsupported row')
  assert.match(read.status.message, /1 unsupported record is hidden/)
  assert.equal(read.counts.total, 1)
  assert.deepEqual(read.items.map((item) => item.event_id), ['evt_known'])
  assert.doesNotMatch(JSON.stringify(read), /SECRET_IN_FUTURE_PAYLOAD|future_private_record|evt_unknown/)
})

await check('allows the fixed internal query to return fewer rows than the full mixed projection', async () => {
  const visible = event('evt_visible_internal', 'commodity_decision_record', 'decision.recorded', {
    commodity: 'COPPER', action: 'Watch', thesis_summary: 'Internal row remains visible.',
  }, { valid_time: { from: '2026-08-20', to: '2026-08-21' } })
  const exec: MemoryExec = async (_file, args) => ({
    stdout: args.includes('project') ? projectPacket(2) : queryPacket([visible]),
  })
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec }).read()
  assert.equal(read.available, true)
  assert.equal(read.status.event_count, 1)
  assert.equal(read.counts.total, 1)
  assert.deepEqual(read.items.map((item) => item.event_id), ['evt_visible_internal'])
})

await check('keeps the Explorer available when canonical history grows beyond its bounded recent view', async () => {
  let calls = 0
  const visible = event('evt_recent_visible', 'commodity_decision_record', 'decision.recorded', {
    commodity: 'COPPER', action: 'Watch', thesis_summary: 'The recent bounded row remains visible.',
  })
  const exec: MemoryExec = async (_file, args) => {
    calls++
    return { stdout: args.includes('project')
      ? projectPacket(MEMORY_QUERY_LIMIT + 1)
      : queryPacket([visible]) }
  }
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec }).read()
  assert.equal(read.available, true)
  assert.deepEqual(read.items.map((item) => item.event_id), ['evt_recent_visible'])
  assert.equal(read.counts.total, 1)
  assert.equal(calls, 2, 'the fixed-size query runs even when canonical history is larger')
})

await check('fails closed on malformed, incomplete, unsafe, nonzero and maxBuffer-breaching commands without echoing secrets', async () => {
  const badPathEvents = corpus()
  ;(badPathEvents[0].payload as any).source_path = '../../private/credentials.json'
  const restrictedEvent = event('evt_restricted', 'equity_decision_record', 'decision.recorded', {
    ticker: 'PRIVATE', decision: 'Buy', suggested_action: 'SECRET_RESTRICTED_RECOMMENDATION',
  })
  ;(restrictedEvent.policy as Record<string, unknown>).classification = 'restricted'
  ;(restrictedEvent.payload as Record<string, unknown>).source_path = 'private/credentials.json'
  const expiredEvent = event('evt_expired', 'equity_decision_record', 'decision.recorded', {
    ticker: 'PRIVATE', decision: 'Buy', suggested_action: 'SECRET_EXPIRED_RECOMMENDATION',
  })
  Object.assign(expiredEvent.policy as Record<string, unknown>, {
    retention: 'expires', retain_until: '2026-08-21T09:59:59Z',
  })
  const tombstoneEvent = event('evt_tombstone', 'equity_decision_record', 'decision.recorded', {
    ticker: 'PRIVATE', decision: 'Buy', suggested_action: 'SECRET_TOMBSTONE_RECOMMENDATION',
  })
  ;(tombstoneEvent.policy as Record<string, unknown>).retention = 'tombstone-only'
  const futureEvent = event('evt_future', 'equity_decision_record', 'decision.recorded', {
    ticker: 'PRIVATE', decision: 'Buy', suggested_action: 'SECRET_FUTURE_RECOMMENDATION',
  }, { system_time: '2026-08-21T10:00:01Z' })
  const outOfWindowEvent = event('evt_out_of_window', 'equity_decision_record', 'decision.recorded', {
    ticker: 'PRIVATE', decision: 'Buy', suggested_action: 'SECRET_WINDOW_RECOMMENDATION',
  }, { valid_time: { from: '2026-08-22', to: null } })
  const wrongPolicyPacket = JSON.parse(queryPacket([corpus()[0]]))
  wrongPolicyPacket.query.requested.classifications = ['restricted']
  const cases: Array<{ name: string; exec: MemoryExec; maxBuffer?: number }> = [
    { name: 'malformed project', exec: async () => ({ stdout: '{not json' }) },
    {
      name: 'nonzero command',
      exec: async () => { throw new Error('SECRET_TOKEN_FROM_CHILD') },
    },
    {
      name: 'truncated/incomplete query',
      exec: async (_file, args) => ({ stdout: args.includes('project') ? projectPacket(6) : JSON.stringify({ schema: 'memory-query-result/v1', event_count: 6, events: [] }) }),
    },
    {
      name: 'unsafe path',
      exec: fixtureExec(badPathEvents).exec,
    },
    {
      name: 'restricted returned row',
      exec: fixtureExec([restrictedEvent]).exec,
    },
    {
      name: 'expired returned row',
      exec: fixtureExec([expiredEvent]).exec,
    },
    {
      name: 'tombstone returned row',
      exec: fixtureExec([tombstoneEvent]).exec,
    },
    {
      name: 'future returned row',
      exec: fixtureExec([futureEvent]).exec,
    },
    {
      name: 'out-of-window returned row',
      exec: fixtureExec([outOfWindowEvent]).exec,
    },
    {
      name: 'unexpected query policy',
      exec: async (_file, args) => ({
        stdout: args.includes('project') ? projectPacket(1) : JSON.stringify(wrongPolicyPacket),
      }),
    },
    {
      name: 'mock bypassed maxBuffer', maxBuffer: 1024 * 1024,
      exec: async () => ({ stdout: `${projectPacket(0).slice(0, -1)},"padding":"${'x'.repeat(1024 * 1024)}"}` }),
    },
  ]
  for (const failure of cases) {
    const read = await createMemoryReader({
      repoRoot: '/safe/repo', stateDir: stateDir(), exec: failure.exec, maxBuffer: failure.maxBuffer,
    }).read()
    assert.deepEqual(read, {
      contract_version: 'memory-ui/1', available: false, read_only: true, generated_at: null,
      status: {
        state: 'unavailable', message: 'Memory is temporarily unavailable.', event_count: 0,
        source_count: 0, diagnostics_count: 0, production_readiness: 'unmeasured',
      },
      counts: { total: 0, research: 0, screener: 0, commodity: 0, decisions: 0, reviews: 0, corrections: 0 },
      items: [],
    }, failure.name)
    const response = JSON.stringify(read)
    assert.doesNotMatch(response, /SECRET|credentials|private|token/i, failure.name)
  }
})

await check('reports warning-only diagnostics as degraded without returning raw diagnostic text', async () => {
  const fixture = fixtureExec(corpus(), [{ severity: 'warning', message: 'SECRET SOURCE DETAIL' }])
  const read = await createMemoryReader({ repoRoot: '/safe/repo', stateDir: stateDir(), exec: fixture.exec }).read()
  assert.equal(read.available, true)
  assert.equal(read.status.state, 'degraded')
  assert.equal(read.status.diagnostics_count, 1)
  assert.doesNotMatch(JSON.stringify(read), /SECRET SOURCE DETAIL/)
})

console.log(`\n${pass}/${pass + fail} memory UI server checks passed${fail ? ` — ${fail} FAILED` : ''}`)
process.exitCode = fail ? 1 : 0
