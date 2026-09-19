import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { repositoryMutationLockPath, writeIdea, type SurfacedIdea } from '../src/news/ideas/ideas-store'
import Fastify from 'fastify'
import { buildDiscoveryEvents, discoveryIdea, discoveryListing, discoveryPage, fileDiscoveryCard,
  projectDiscovery, readFilingActions, refreshFiledDiscovery, registerIdeasWorkspace } from '../src/news/ideas/ideas-workspace'
import type { FeedItem } from '../src/news/types'
import type { Theme } from '../src/news/themes/types'
import { acquireRetainedFlock, acquireRetainedFlockSync, releaseRetainedFlock } from '../src/singleton-lock'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-workspace-'))
const now = Date.now()
const at = (delta = 0) => new Date(now + delta).toISOString()
const idea = (extra: Record<string, unknown> = {}) => discoveryIdea({
  idea_id: 'IDEA-111111111111', idea_version: 'IDEAV-1111111111111111', idea_version_started_at: at(),
  ticker: 'TEST', exchange: 'NYSE', thesis_type: 'company_specific', source_headlines: ['A new contract'], direction: 'long', reason: 'A new contract', source_event_ids: ['EVT-contract'],
  updated_at: at(), newest_source_at: at(), surfaced_at: at(), decay_at: at(86_400_000), status: 'live',
  ...extra,
})
const report = (id: string, extra: Partial<FeedItem> = {}): FeedItem => ({
  kind: 'item', event_id: id, headline: 'Pipeline closes after damage', found_at: at(), ts: at(),
  url: `https://example.test/${id}`, source_name: 'Publisher', triage_score: 90, band: 'pick', scope: 'geopolitical',
  companies: [], event_types: ['geopolitical'], dedup_group: id, ...extra,
} as FeedItem)
const a = report('EVT-a')
const b = report('EVT-b', { headline: 'Pipeline has reopened', found_at: at(1000), dedup_group: 'EVT-a' })
const theme = {
  theme_id: 'THM-12345678', name: 'Oil transport disruption', status: 'live',
  members: [{ event_id: a.event_id, headline: a.headline, found_at: a.found_at, url: a.url, source_name: a.source_name, score: 90, country: 'SA' }],
  narrative: { evidence: [{ event_id: a.event_id, stance: 'supports' }], mechanism_steps: ['Longer routes could raise freight costs.'] },
} as Theme

try {
  for (const exchange of ['HKEX', 'SEHK', 'Hong Kong Stock Exchange', 'XHKG']) assert.equal(discoveryListing('0700', exchange), 'HK')
  for (const exchange of ['NSE', 'BSE', 'XNSE', 'XBOM']) assert.equal(discoveryListing('TEST', exchange), 'IN')
  assert.equal(discoveryListing('0700.HK'), 'HK')
  assert.equal(discoveryListing('TEST.NS', 'NYSE'), 'IN', 'qualified symbol beats a guessed exchange')
  assert.equal(discoveryListing('BABA', 'NYSE'), 'US', 'issuer domicile never hides a US ADR')
  assert.equal(discoveryListing('NYSE:BABA', 'HKEX'), 'US', 'explicit US instrument overrides an issuer-level exchange guess')
  assert.equal(discoveryListing('HKEX:9988', 'NYSE'), 'HK')
  assert.equal(discoveryListing('BRK.A'), null)
  assert.equal(discoveryListing('TEST'), null)
  const markets = [idea(), idea({ ticker: '0700.HK' }), idea({ ticker: 'ABC.NS' }), idea({ ticker: 'MYSTERY', exchange: null })]
  assert.equal(discoveryPage(markets, 'long', ['HK', 'IN'], 'all', 0).hidden, 2)
  assert.equal(discoveryPage(markets, 'long', [], 'all', 0).total, 4)
  const pair = idea({ direction: 'pair', pair_with: 'ABC.NS' })
  assert.equal(discoveryPage([pair], 'long', ['IN'], 'all', 0).total, 1)
  assert.equal(discoveryPage([pair], 'short', ['IN'], 'all', 0).total, 0)

  const card = idea()
  const op = randomUUID()
  execFileSync('git', ['init', root], { stdio: 'ignore' })
  const lock = await acquireRetainedFlock(repositoryMutationLockPath(root)!, { waitMs: 100, busyMessage: 'test busy' })
  let timerRan = false
  setTimeout(() => { timerRan = true; releaseRetainedFlock(lock) }, 40)
  const archived = await fileDiscoveryCard(root, [card], { key: card.key, action: 'archive', operation_id: op, expected_revision: null })
  assert.equal(timerRan, true, 'waiting for an archive lock leaves the event loop free to release it')
  assert.equal(archived.archive_reason, 'manual')
  await fileDiscoveryCard(root, [card], { key: card.key, action: 'archive', operation_id: op, expected_revision: null })
  await Promise.all(Array.from({ length: 3 }, () => fileDiscoveryCard(root, [card], { key: card.key, action: 'archive', operation_id: op, expected_revision: null })))
  assert.equal((await readFilingActions(root)).length, 1, 'retry is idempotent')
  assert.equal(discoveryPage(projectDiscovery([card], await readFilingActions(root)), 'long', [], 'all', 0).total, 0)
  await assert.rejects(async () => await fileDiscoveryCard(root, [card], { key: card.key, action: 'restore', operation_id: randomUUID(), expected_revision: null }), /another window/)

  const update = idea({ updated_at: at(10_000), reason: 'Contract expanded', source_event_ids: ['EVT-contract', 'EVT-expansion'] })
  assert.equal(await refreshFiledDiscovery(root, [update]), 1, 'new evidence is durably appended')
  assert.equal(await refreshFiledDiscovery(root, [update]), 0, 'unchanged refresh adds no ledger row')
  const fromDisk = projectDiscovery([], await readFilingActions(root))
  assert.equal(fromDisk[0].payload.reason, 'Contract expanded', 'latest copy survives source eviction and restart')
  assert.equal(fromDisk[0].archive_reason, 'manual')
  assert.equal(fromDisk[0].payload.promotion_available, false, 'evicted source is view-only')
  assert.equal(projectDiscovery([idea({ source_event_ids: ['EVT-unrelated'] })], await readFilingActions(root)).length, 2, 'new thesis about same stock is not suppressed')
  const familyCard = discoveryIdea({ ...card.payload, ticker: 'FAMILY', source_event_ids: ['EVT-exact'] }, new Map([['EVT-exact', 'EVT-family']]))
  await fileDiscoveryCard(root, [familyCard], { key: familyCard.key, action: 'archive', operation_id: randomUUID(), expected_revision: null })
  const prunedFamily = discoveryIdea({ ...familyCard.payload, status: 'expired' })
  const familyRows = projectDiscovery([prunedFamily], await readFilingActions(root)).filter((c) => c.payload.ticker === 'FAMILY')
  assert.equal(familyRows.length, 1, 'exact source identity survives loss of the rolling dedup-family lookup')
  assert.equal(familyRows[0].archive_reason, 'manual')
  const restored = await fileDiscoveryCard(root, [update], { key: archived.key, action: 'restore', operation_id: randomUUID(), expected_revision: op })
  assert.equal(restored.archive_reason, null)
  assert.equal(discoveryPage(projectDiscovery([], await readFilingActions(root), now + 2 * 86_400_000), 'long', [], 'all', 0).total, 0, 'time expiry applies to restored copies without live sources')
  assert.equal(projectDiscovery([], await readFilingActions(root), now + 2 * 86_400_000)[0].archive_reason, 'expired')

  const single = buildDiscoveryEvents([], [a], now)
  assert.equal(single.length, 1, 'important ticker-free report is visible')
  assert.equal(discoveryPage(single, 'events', ['HK', 'IN'], 'all', 0).total, 1)
  assert.equal(single[0].event?.summary_status, 'reports_only')
  const repeated = buildDiscoveryEvents([], [a, report('EVT-copy', { dedup_group: a.event_id })], now)
  assert.equal(repeated.length, 1)
  assert.equal(repeated[0].event?.independent_stories, 1, 'syndication does not inflate evidence')
  const themed = buildDiscoveryEvents([theme], [a], now)
  assert.equal(themed[0].event?.implications.length, 1)
  const corrected = buildDiscoveryEvents([theme], [a, b], now + 2000)
  assert.equal(corrected.length, 1)
  assert.equal(corrected[0].event?.latest_change, b.headline)
  assert.equal(corrected[0].event?.reports.length, 2)
  assert.equal(corrected[0].event?.summary_status, 'reports_only', 'new unclassified correction withdraws old summary')
  assert.deepEqual(corrected[0].event?.implications, [])
  assert.equal(buildDiscoveryEvents([], [report('EVT-legacy', { found_at: undefined })], now)[0].event?.reports[0].time_basis, 'observed')

  // Two separately filed reports can later become one story; the last explicit user decision wins.
  const e1 = single[0]
  const e2 = buildDiscoveryEvents([], [report('EVT-separate')], now)[0]
  const saved1 = await fileDiscoveryCard(root, [e1, e2], { key: e1.key, action: 'archive', operation_id: randomUUID(), expected_revision: null })
  await fileDiscoveryCard(root, [e1, e2], { key: e2.key, action: 'archive', operation_id: randomUUID(), expected_revision: null })
  await fileDiscoveryCard(root, [e1, e2], { key: saved1.key, action: 'restore', operation_id: randomUUID(), expected_revision: saved1.action_revision })
  const combined = { ...e1, aliases: [...e1.aliases, ...e2.aliases] }
  const eventRows = projectDiscovery([combined], await readFilingActions(root)).filter((c) => c.kind === 'event')
  assert.equal(eventRows.length, 1, 'coalesces every previously filed identity')
  assert.equal(eventRows[0].archive_reason, null, 'latest explicit restore applies to the merged story')
  const mergedRequest = { key: e2.key, action: 'archive' as const, operation_id: randomUUID(), expected_revision: eventRows[0].action_revision }
  const mergedSaved = await fileDiscoveryCard(root, [combined], mergedRequest)
  assert.equal((await fileDiscoveryCard(root, [combined], mergedRequest)).action_revision, mergedSaved.action_revision, 'retry through an old merged key is idempotent')

  const unresolved = idea({ ticker: 'VENUE', exchange: null, source_event_ids: ['EVT-venue'] })
  await fileDiscoveryCard(root, [unresolved], { key: unresolved.key, action: 'archive', operation_id: randomUUID(), expected_revision: null })
  const resolved = idea({ ticker: 'VENUE', exchange: 'NYSE', source_event_ids: ['EVT-venue'] })
  const venueRows = projectDiscovery([resolved], await readFilingActions(root)).filter((c) => c.payload.ticker === 'VENUE')
  assert.equal(venueRows.length, 1, 'listing resolution retains logical story identity')
  assert.equal(venueRows[0].archive_reason, 'manual')
  assert.equal(venueRows[0].listings.long, 'US')
  const otherVenue = idea({ ticker: 'VENUE', exchange: 'HKEX', source_event_ids: ['EVT-venue'] })
  assert.equal(projectDiscovery([resolved, otherVenue], await readFilingActions(root)).filter((c) => c.payload.ticker === 'VENUE').length, 3, 'ambiguous unknown venue cannot bridge two confirmed listings')
  await refreshFiledDiscovery(root, [resolved])
  assert.equal(projectDiscovery([resolved, otherVenue], await readFilingActions(root)).filter((c) => c.payload.ticker === 'VENUE').length, 2, 'a resolved archive still keeps another confirmed listing separate')

  const many = Array.from({ length: 65 }, (_, i) => ({ ...e1, key: `event-${String(i).padStart(24, '0')}`, aliases: [`story:${i}`] }))
  const first = discoveryPage(many, 'events', [], 'all', 0)
  const second = discoveryPage(many, 'events', [], 'all', Number(first.next_cursor))
  assert.equal(first.rows.length, 30)
  assert.equal(second.rows.length, 30)
  assert.equal(new Set([...first.rows, ...second.rows].map((c) => c.key)).size, 60)

  const app = Fastify()
  registerIdeasWorkspace(app, root)
  assert.equal((await app.inject('/api/screener/idea-workspace?lane=events')).statusCode, 200)
  assert.equal((await app.inject('/api/screener/idea-workspace?cursor=-1')).statusCode, 400)
  assert.equal((await app.inject({ method: 'POST', url: '/api/screener/idea-workspace/actions', payload: { key: '../../outside', action: 'archive' } })).statusCode, 400)
  await app.close()

  // A legacy synchronous snapshot writer must not strand an asynchronous archive transaction on the
  // same event loop. Hold its journal externally long enough to observe the archive's repository lease.
  const journalLease = spawn('python3', ['-c', 'import fcntl,sys,time; f=open(sys.argv[1],"a"); fcntl.flock(f,fcntl.LOCK_EX); print("locked",flush=True); time.sleep(0.6)', path.join(root, 'screener/ledger/idea-workspace-actions.ndjson.lock')])
  await new Promise<void>((resolve, reject) => { journalLease.stdout.once('data', () => resolve()); journalLease.once('error', reject) })
  const concurrent = idea({ ticker: 'CONCURRENT', source_event_ids: ['EVT-concurrent'] })
  const saving = fileDiscoveryCard(root, [concurrent], { key: concurrent.key, action: 'archive', operation_id: randomUUID(), expected_revision: null })
  let archiveOwnsRepository = false
  for (let i = 0; i < 30 && !archiveOwnsRepository; i++) {
    try { releaseRetainedFlock(acquireRetainedFlockSync(repositoryMutationLockPath(root)!, { waitMs: 0, busyMessage: 'held' })) }
    catch (error: any) { if (error.code !== 'EBUSY') throw error; archiveOwnsRepository = true }
    if (!archiveOwnsRepository) await new Promise((resolve) => setTimeout(resolve, 5))
  }
  assert.ok(archiveOwnsRepository, 'archive worker reached the repository lease')
  assert.doesNotThrow(() => writeIdea(root, card.payload as unknown as SurfacedIdea), 'existing synchronous writer can wait while the worker completes the archive')
  assert.equal((await saving).archive_reason, 'manual')

  // A corrupt ledger must not look empty or accept further writes.
  const ledger = path.join(root, 'screener/ledger/idea-workspace-actions.ndjson')
  fs.appendFileSync(ledger, '{broken}\n')
  const bytes = fs.readFileSync(ledger, 'utf8')
  await assert.rejects(async () => await fileDiscoveryCard(root, [card], { key: card.key, action: 'archive', operation_id: randomUUID(), expected_revision: null }))
  assert.equal(fs.readFileSync(ledger, 'utf8'), bytes)
  // Integration regression for PR #700 lock contention.
  // A repository writer holding the repository mutation lease (e.g. news publisher)
  // must not cause the Ideas GET endpoint to return HTTP 500.
  const app2 = Fastify()
  registerIdeasWorkspace(app2, root)
  const repoLockFd = acquireRetainedFlockSync(repositoryMutationLockPath(root)!, { waitMs: 0, busyMessage: 'held by publisher' })
  try {
    const contentionResponse = await app2.inject('/api/screener/idea-workspace?lane=events&hide=HK,IN&kind=all&cursor=0&refresh=0')
    assert.equal(contentionResponse.statusCode, 200, 'Ideas workspace GET must succeed even when repository mutation lease is held by a publisher')
  } finally {
    releaseRetainedFlock(repoLockFd)
    await app2.close()
  }

  console.log('ideas workspace: listing, archive lifecycle, story correction, identity merge and API tests passed')
} finally { fs.rmSync(root, { recursive: true, force: true }) }
