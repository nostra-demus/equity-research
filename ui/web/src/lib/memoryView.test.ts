import assert from 'node:assert/strict'
import {
  filterMemoryItems,
  groupMemoryItems,
  MEMORY_FRESHNESS_CHECK_MESSAGE,
  MEMORY_FRESHNESS_MAX_POLLS,
  MEMORY_FRESHNESS_POLL_MS,
  memoryChange,
  memoryConfidence,
  memoryDate,
  memoryFreshnessCheckPending,
  memoryFreshnessPollDelay,
  memoryKinds,
  parseMemoryRead,
  unavailableMemoryRead,
} from './memoryView'
import type { MemoryItem, MemoryRead } from './types'

const item = (patch: Partial<MemoryItem> = {}): MemoryItem => ({
  event_id: 'event:research:ABC:1', event_type: 'decision', cockpit: 'research', kind: 'decision',
  happened_at: '2026-08-20T10:00:00Z', valid_from: '2026-08-19T00:00:00Z', subject: 'ABC',
  title: 'ABC decision', status: 'Watchlist', confidence: 72, summary: 'Margins need more proof.', current: true,
  source: { path: 'analyses/ABC/final_thesis.md', locator: 'Decision', sha256: 'a'.repeat(64), git_commit: 'abc1234' },
  lineage: { derived_from: [], supersedes: [], replaced_by: [], corrected_by: [] },
  proof: { source_verified: true, evidence_ref_count: 2 }, ...patch,
})
const good: MemoryRead = {
  contract_version: 'memory-ui/1', available: true, read_only: true, generated_at: '2026-08-21T00:00:00Z',
  status: { state: 'healthy', message: 'Ready.', event_count: 3, source_count: 2, diagnostics_count: 0, production_readiness: 'unmeasured' },
  counts: { total: 3, research: 1, screener: 1, commodity: 1, decisions: 1, reviews: 1, corrections: 0 },
  items: [
    item(),
    item({ event_id: 'event:screener:XYZ:2', cockpit: 'screener', kind: 'review', subject: 'XYZ', title: 'XYZ check', summary: 'Demand improved.', happened_at: '2026-08-21T10:00:00Z' }),
    item({ event_id: 'event:commodity:GOLD:3', cockpit: 'commodity', kind: 'signal', subject: 'GOLD', title: 'Gold signal', summary: 'Real yields rose.', happened_at: '2026-08-18T10:00:00Z' }),
  ],
}

assert.deepEqual(parseMemoryRead(good), good)
assert.equal(parseMemoryRead({ ...good, contract_version: 'memory-ui/0' }), null, 'old engines fail closed')
assert.equal(parseMemoryRead({ ...good, read_only: false }), null, 'a write-capable response is refused')
assert.equal(parseMemoryRead({ ...good, items: [{ ...good.items[0], proof: { source_verified: false, evidence_ref_count: 2 } }] }), null, 'unverified source proof is refused')
assert.equal(parseMemoryRead({ ...good, available: false }), null, 'unavailable cannot masquerade as a populated read')
assert.equal(parseMemoryRead({ ...good, counts: { ...good.counts, total: 4 } }), null, 'a partial or contradictory count is refused')
assert.equal(parseMemoryRead({ ...good, items: [...good.items, good.items[0]], counts: { ...good.counts, total: 4, research: 2 }, status: { ...good.status, event_count: 4 } }), null, 'duplicate event identities are refused')
assert.equal(parseMemoryRead({ ...good, items: [{ ...good.items[0], confidence: 101 }], counts: { ...good.counts, total: 1, research: 1, screener: 0, commodity: 0 }, status: { ...good.status, event_count: 1 } }), null, 'out-of-range confidence is refused')
assert.deepEqual(parseMemoryRead(unavailableMemoryRead()), unavailableMemoryRead())

const freshnessCheck = {
  ...good,
  status: { ...good.status, state: 'degraded' as const, message: MEMORY_FRESHNESS_CHECK_MESSAGE },
}
assert.equal(memoryFreshnessCheckPending(freshnessCheck), true)
assert.equal(memoryFreshnessPollDelay(freshnessCheck, 0), MEMORY_FRESHNESS_POLL_MS, 'the visible stale view schedules its own recheck')
assert.equal(memoryFreshnessPollDelay(freshnessCheck, MEMORY_FRESHNESS_MAX_POLLS), null, 'freshness rechecks have a fixed upper bound')
assert.equal(memoryFreshnessCheckPending({
  ...freshnessCheck,
  status: { ...freshnessCheck.status, message: 'One source could not be read.' },
}), false, 'ordinary degraded source warnings never create a polling loop')
assert.equal(memoryFreshnessCheckPending(good), false, 'a completed fresh response stops rechecking')

assert.deepEqual(filterMemoryItems(good.items, { query: '', cockpit: 'all', kind: '' }).map((x) => x.subject), ['XYZ', 'ABC', 'GOLD'])
assert.deepEqual(filterMemoryItems(good.items, { query: 'demand improved', cockpit: 'screener', kind: 'review' }).map((x) => x.subject), ['XYZ'])
assert.deepEqual(filterMemoryItems(good.items, { query: 'margin', cockpit: 'commodity', kind: '' }), [])
assert.deepEqual(memoryKinds(good.items), ['decision', 'review', 'signal'])

const duplicate = item({
  event_id: 'event:research:ABC:duplicate',
  source: { path: 'analyses/ABC/decision_record.json', locator: 'decision', sha256: 'b'.repeat(64), git_commit: 'def5678' },
})
const duplicateInput = [item(), duplicate, good.items[1]]
const grouped = groupMemoryItems(duplicateInput)
assert.equal(grouped.length, 2, 'same visible memory from two sources renders as one card')
assert.deepEqual(grouped[0].records.map((record) => record.event_id), [item().event_id, duplicate.event_id], 'every canonical record stays available for proof')
assert.equal(duplicateInput.length, 3, 'grouping does not remove canonical input rows')
assert.equal(groupMemoryItems([item(), duplicate, item({
  event_id: 'event:research:ABC:correction',
  lineage: { derived_from: [], supersedes: [], replaced_by: [], corrected_by: ['later-correction'] },
})]).length, 2, 'a corrected card never collapses into an uncorrected card')
assert.equal(groupMemoryItems([item(), item({
  event_id: 'event:research:ABC:different-valid-time',
  valid_from: '2026-08-18T00:00:00Z',
})]).length, 2, 'different apply-from dates keep their own truthful detail')
assert.equal(groupMemoryItems([item(), item({
  event_id: 'event:research:ABC:supersedes',
  lineage: { derived_from: [], supersedes: ['old'], replaced_by: [], corrected_by: [] },
})]).length, 2, 'different change history keeps its own truthful detail')
assert.equal(groupMemoryItems([item(), item({
  event_id: 'event:research:ABC:derived',
  lineage: { derived_from: ['input'], supersedes: [], replaced_by: [], corrected_by: [] },
})]).length, 2, 'different derivation history keeps its own truthful detail')

assert.equal(memoryChange(item()), 'No later correction or replacement is recorded.')
assert.equal(memoryChange(item({ lineage: { derived_from: [], supersedes: ['old'], replaced_by: [], corrected_by: [] } })), 'This updates 1 earlier memory.')
assert.equal(memoryChange(item({ current: false, lineage: { derived_from: [], supersedes: [], replaced_by: ['new'], corrected_by: [] } })), 'A later memory replaced this (1 update recorded).')
assert.equal(memoryChange(item({ lineage: { derived_from: [], supersedes: [], replaced_by: [], corrected_by: ['correction'] } })), 'A later correction applies to this memory.')
assert.equal(memoryChange(item({ current: false, lineage: { derived_from: [], supersedes: [], replaced_by: ['new'], corrected_by: ['correction'] } })), 'A later memory replaced this (1 update recorded). A later correction applies to this memory.')
assert.equal(memoryConfidence(1), '1% confidence')
assert.equal(memoryConfidence(72), '72% confidence')
assert.equal(memoryConfidence(null), null)
assert.match(memoryDate('2026-08-21T00:00:00Z'), /2026/)
assert.equal(memoryDate('2026-08-21'), '21 Aug 2026', 'date-only valid-time never shifts to the previous local day')

// The one global destination closes competing readers and survives a swarm switch. The static API path
// proves it returns the typed unavailable envelope locally and never attempts GET /api/memory.
const previousWindow = (globalThis as any).window
const previousFetch = globalThis.fetch
;(globalThis as any).window = { matchMedia: () => ({ matches: true }) }
const { useStore } = await import('./store')
const { api, MEMORY_CLIENT_TIMEOUT_MS } = await import('./api')
assert.ok(MEMORY_CLIENT_TIMEOUT_MS > 2 * 30_000, 'the browser must outlast project + query cold-start timeouts')
useStore.setState({
  memoryOpen: false, dataLibraryOpen: true, dataPipelineOpen: true, pipelineOpen: true,
  callsOpen: true, diagnosticsOpen: true, sourcesOpen: true, openOutput: { title: 'Old reader' },
  chatOpen: false, chatStreaming: false, newsChatOpen: false, newsChatStreaming: false,
})
useStore.getState().openMemory()
assert.equal(useStore.getState().memoryOpen, true)
assert.equal(useStore.getState().dataLibraryOpen, false)
assert.equal(useStore.getState().callsOpen, false)
assert.equal(useStore.getState().openOutput, null)
useStore.setState({
  activeSwarm: 'research',
  swarms: [
    { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' },
    { id: 'future', label: 'Future', color: '#8b5cf6', unit: 'subject', order: 2, layout: 'flow' },
  ],
})
useStore.getState().switchSwarm('future')
assert.equal(useStore.getState().memoryOpen, true, 'Memory stays open across current and future swarms')

const requests: string[] = []
globalThis.fetch = (async (input: string | URL | Request) => {
  const url = String(input)
  requests.push(url)
  if (url === '/api/health') throw new Error('no live engine')
  return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const staticRead = await api.memory()
assert.equal(staticRead.available, false)
assert.equal(requests.some((url) => url === '/api/memory'), false, 'static Memory makes no live memory request')
globalThis.fetch = previousFetch
;(globalThis as any).window = previousWindow

console.log('memoryView: contract, filters, chronology and plain-English states passed')
