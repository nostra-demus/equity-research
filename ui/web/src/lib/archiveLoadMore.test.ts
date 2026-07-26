// scLoadMoreArchive state contract — drives the REAL store action against a stubbed api.newsSearch.
//
// The archive rail distinguishes "the search finished and there is nothing" from "the search did not
// finish" via scArchiveError (CLAUDE.md §3 — an unproven absence must never be reported as a proven one).
// A load-more that FAILS sets scArchiveError; a load-more that then SUCCEEDS must clear it, or the honest
// scope line keeps claiming "the search didn't finish" over freshly-loaded results — a false failure, the
// mirror of the false absence this whole feature exists to remove. The success path forgot to clear it.
//
// The store isn't Vite (no import.meta.env at runtime here) — api.ts now guards BASE, so the module loads
// under tsx and we stub the one network call by reassigning the property. Run: npx tsx src/lib/archiveLoadMore.test.ts
import assert from 'node:assert/strict'
import { useStore } from './store'
import { api } from './api'
import type { FeedItem } from './types'

let passed = 0
async function check(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const realNewsSearch = api.newsSearch
function fakeItem(id: string): FeedItem {
  return { kind: 'item', event_id: id, headline: 'h', url: `https://ex.com/${id}`, domain: 'ex.com', source_name: 'S', via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material', event_types: [], issuer_linkage: 'macro', companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: true, ts: '2026-06-27T10:00:00Z' } as FeedItem
}
// A cursor object satisfies the `!scArchiveCursor` guard; its exact shape is opaque to the action.
const CURSOR = { ts: '2026-06-27T00:00:00Z', id: 'EVT-seed' } as any

await check('a SUCCESSFUL load-more after a failed one clears the stale error (no false "didn\'t finish" over results)', async () => {
  useStore.setState({
    scArchiveQuery: { country: 'US' }, scArchiveResults: [fakeItem('EVT-1')], scArchiveCursor: CURSOR,
    scArchiveLoadingMore: false, scArchiveError: 'the engine took too long to answer, so nothing was searched',
    scArchiveExhausted: false, scArchiveScannedThrough: '2026-06-25',
  })
  api.newsSearch = async () => ({ items: [fakeItem('EVT-2')], nextCursor: null, scannedThroughDate: '2026-06-20', exhausted: true } as any)
  await useStore.getState().scLoadMoreArchive()
  const s = useStore.getState()
  // The load succeeded → the failure note must be gone (this is the line the fix adds).
  assert.equal(s.scArchiveError, null, 'a successful page clears the prior failure note')
  assert.equal(s.scArchiveResults.length, 2, 'the fresh page was appended')
  assert.equal(s.scArchiveExhausted, true, 'the floor flag reflects the new page')
})

await check('a FAILED load-more records the honest error and keeps the loaded pages + cursor (recoverable)', async () => {
  useStore.setState({
    scArchiveQuery: { country: 'US' }, scArchiveResults: [fakeItem('EVT-1')], scArchiveCursor: CURSOR,
    scArchiveLoadingMore: false, scArchiveError: null,
  })
  api.newsSearch = async () => { const e: any = new Error('timeout'); e.name = 'TimeoutError'; throw e }
  await useStore.getState().scLoadMoreArchive()
  const s = useStore.getState()
  assert.ok(s.scArchiveError && s.scArchiveError.length > 0, 'the failure is surfaced, not swallowed')
  assert.equal(s.scArchiveResults.length, 1, 'the already-loaded page is kept')
  assert.equal(s.scArchiveCursor, CURSOR, 'the cursor is kept so scrolling retries')
  assert.equal(s.scArchiveLoadingMore, false, 'the in-flight flag is cleared')
})

api.newsSearch = realNewsSearch
console.log(`\narchiveLoadMore.test.ts: ${passed} passed`)
