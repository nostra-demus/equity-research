// pipeline-store — the PURE fold + verdict-sanitize + id logic (no bash spawn, no filesystem). Run:
// npx tsx test/pipeline-store.test.ts. Proves the folded view surfaces the latest status, carries a scan
// verdict forward past a later build event, sorts newest-first, and that a verdict from an agent reading an
// untrusted source is clamped to the schema enums before it is ever persisted/rendered.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const {
  isPipelineId, newPipelineId, sanitizeVerdict, foldPipeline, dataNeedFingerprint, latestNeedLookup,
  writeNeedLookup,
} = await import('../src/pipeline-store')
import type { PipelineRecord } from '../src/pipeline-store'

// ---- id format ----
const id = newPipelineId('2026-07-19T10:00:00Z')
check('newPipelineId matches PIPE-YYYYMMDD-8hex', isPipelineId(id), id)
check('isPipelineId rejects a bad id', !isPipelineId('PIPE-bad') && !isPipelineId('FDB-20260719-deadbeef') && !isPipelineId('../etc'))

// ---- sanitizeVerdict: enums clamped, tier band enforced, arrays capped ----
const v = sanitizeVerdict({
  relevance: 'exact', confidence: 250, series: 'x', matched_need_ids: ['a', 'b', 1, ''], entry_modules: ['m'],
  acquisition: 'official_api', tier: 5, cadence: 'weekly', host: 'api.example.com', endpoint_hint: 'https://api.example.com/x',
  verdict_note: 'note', buildable: true,
})
check('confidence clamped to 0-100', v.confidence === 100)
check('valid tier 5 preserved', v.tier === 5)
check('matched_need_ids coerced to non-empty strings', v.matched_need_ids.length === 2 && v.matched_need_ids[0] === 'a')
check('buildable is strict boolean', v.buildable === true && sanitizeVerdict({ buildable: 'yes' }).buildable === false)
check('bad relevance → none', sanitizeVerdict({ relevance: 'maybe' }).relevance === 'none')
check('bad tier + relevance none → 10', sanitizeVerdict({ relevance: 'none', tier: 3 }).tier === 10)
check('bad tier + relevance partial → 9', sanitizeVerdict({ relevance: 'partial', tier: 99 }).tier === 9)
check('tier 9 (scrape) preserved', sanitizeVerdict({ relevance: 'partial', tier: 9 }).tier === 9)

// ---- lookup ledger: stable identity + exact persisted-source join + append-order latest wins ----
check('need fingerprint normalizes whitespace but binds the series',
  dataNeedFingerprint('need-a', '  Daily   units ') === dataNeedFingerprint('need-a', 'Daily units')
  && dataNeedFingerprint('need-a', 'Daily units') !== dataNeedFingerprint('need-a', 'Weekly units'))

const lookupState = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-lookup-'))
const lookupLedger = path.join(lookupState, 'pipeline', 'pipeline.ndjson')
fs.mkdirSync(path.dirname(lookupLedger), { recursive: true })
const sourceId = 'PIPE-20260813-aaaaaaaa'
const decisionFingerprint = `sha256:${'a'.repeat(64)}`
const lookupIdentity = {
  swarm: 'fixture', subject: 'AAA', run_root: 'fixture/runs/AAA', decision_fingerprint: decisionFingerprint,
  need_id: 'need-a', series: 'Daily units', cadence: 'daily',
}
const sourceRecord: PipelineRecord = {
  pipeline_id: sourceId, kind: 'pipeline_source', subject: 'AAA', swarm: 'fixture', need_id: 'need-a',
  run_root: lookupIdentity.run_root, decision_fingerprint: decisionFingerprint,
  series_hint: 'Daily units', source_url: 'https://public.example.com/data', source_kind: 'api', sample: '',
  note: '', user_id: 'u', submitted_at: '2026-08-13T10:00:00Z',
}
fs.writeFileSync(lookupLedger, JSON.stringify(sourceRecord) + '\n')

await assert.rejects(
  writeNeedLookup({
    subject: 'AAA', swarm: 'fixture', need_id: 'need-a', series: 'Daily units',
    run_root: lookupIdentity.run_root, decision_fingerprint: decisionFingerprint,
    lookup_started_at: '2026-08-13T09:59:00.000Z',
    lookup_status: 'public_link_found', public_url: 'http://public.example.com/data', source_pipeline_id: sourceId,
  }, 'u', lookupState),
  /safe public URL/,
)
await assert.rejects(
  writeNeedLookup({
    subject: 'AAA', swarm: 'fixture', need_id: 'need-other', series: 'Daily units',
    run_root: lookupIdentity.run_root, decision_fingerprint: decisionFingerprint,
    lookup_started_at: '2026-08-13T09:59:01.000Z',
    lookup_status: 'public_link_found', public_url: 'https://public.example.com/data', source_pipeline_id: sourceId,
  }, 'u', lookupState),
  /does not match/,
)
await writeNeedLookup({
  subject: 'AAA', swarm: 'fixture', need_id: 'need-a', series: 'Daily units',
  run_root: lookupIdentity.run_root, decision_fingerprint: decisionFingerprint,
  lookup_started_at: '2026-08-13T10:00:00.000Z',
  lookup_status: 'public_link_found', public_url: 'https://public.example.com/data',
  lookup_note: 'exact public result', source_pipeline_id: sourceId,
}, 'u', lookupState)
check('found lookup returns only through its exact persisted source join', (() => {
  const got = latestNeedLookup({ ...lookupIdentity, subject: 'aaa' }, lookupState)
  return got?.lookup_status === 'public_link_found' && got.public_url === 'https://public.example.com/data'
    && got.access_basis === 'https_url_public_dns' && !!got.checked_at && got.lookup_note === 'exact public result'
})())

// The writer clock is second-resolution. Append a no-result in the same second and prove physical ledger
// order, rather than a random id tiebreak, owns latest-wins.
await writeNeedLookup({
  subject: 'AAA', swarm: 'fixture', need_id: 'need-a', series: 'Daily units', lookup_status: 'could_not_find',
  run_root: lookupIdentity.run_root, decision_fingerprint: decisionFingerprint,
  lookup_started_at: '2026-08-13T10:00:01.000Z',
  public_url: null, source_pipeline_id: null, lookup_note: 'later clean search',
}, 'u', lookupState)
check('latest valid append wins even when lookup timestamps tie', (() => {
  const got = latestNeedLookup(lookupIdentity, lookupState)
  return got?.lookup_status === 'could_not_find' && got.public_url === null && got.lookup_note === 'later clean search'
})())

// A later malformed positive row cannot replace the last trustworthy outcome: it has no matching source
// join and its timestamp is non-canonical even though Date.parse would accept it.
fs.appendFileSync(lookupLedger, JSON.stringify({
  pipeline_id: 'PIPE-20260813-bbbbbbbb', kind: 'pipeline_lookup', subject: 'AAA', swarm: 'fixture',
  need_id: 'need-a', need_fingerprint: dataNeedFingerprint('need-a', 'Daily units'),
  run_root: lookupIdentity.run_root, decision_fingerprint: decisionFingerprint,
  lookup_started_at: '2026-08-13T10:00:02.000Z',
  lookup_status: 'public_link_found', public_url: 'https://other.example.com/data', lookup_note: 'bad',
  source_pipeline_id: sourceId, user_id: 'u', submitted_at: '2026-08-13',
}) + '\n')
check('malformed latest lookup cannot shadow prior valid state',
  latestNeedLookup(lookupIdentity, lookupState)?.lookup_status === 'could_not_find')
check('fingerprint prevents stale lookup attaching to a changed series',
  latestNeedLookup({ ...lookupIdentity, series: 'Different series' }, lookupState) === undefined)
check('the same need on another decision cannot inherit this lookup',
  latestNeedLookup({ ...lookupIdentity, decision_fingerprint: `sha256:${'b'.repeat(64)}` }, lookupState) === undefined)

await assert.rejects(
  writeNeedLookup({
    ...lookupIdentity, lookup_status: 'could_not_find', public_url: null, source_pipeline_id: null,
    lookup_started_at: '2026-08-13T09:00:00.000Z', lookup_note: 'slow older search',
  }, 'u', lookupState),
  /stale lookup attempt/,
)
check('a slow older search cannot overwrite the newer result',
  latestNeedLookup(lookupIdentity, lookupState)?.lookup_note === 'later clean search')
fs.rmSync(lookupState, { recursive: true, force: true })

// ---- foldPipeline: latest status, verdict carried forward, newest-first ----
const verdict = sanitizeVerdict({ relevance: 'exact', confidence: 80, series: 'S', tier: 5, buildable: true })
const recs: PipelineRecord[] = [
  { pipeline_id: 'PIPE-20260719-00000001', kind: 'pipeline_source', subject: 'GOLD', swarm: 'commodity', need_id: 'n1', series_hint: '', source_url: 'https://a.com', source_kind: 'api', sample: '', note: '', user_id: 'u', submitted_at: '2026-07-19T09:00:00Z' },
  { pipeline_id: 'PIPE-20260719-e0000001', kind: 'pipeline_event', target_id: 'PIPE-20260719-00000001', status: 'scanned', verdict, note: 'scanned', pr_url: null, user_id: 'u', submitted_at: '2026-07-19T09:05:00Z' },
  { pipeline_id: 'PIPE-20260719-e0000002', kind: 'pipeline_event', target_id: 'PIPE-20260719-00000001', status: 'building', verdict: null, note: 'building', pr_url: null, user_id: 'u', submitted_at: '2026-07-19T09:10:00Z' },
  { pipeline_id: 'PIPE-20260719-00000002', kind: 'pipeline_source', subject: 'GOLD', swarm: 'commodity', need_id: null, source_url: 'https://b.com', series_hint: '', source_kind: 'web', sample: '', note: '', user_id: 'u', submitted_at: '2026-07-19T10:00:00Z' },
]
const folded = foldPipeline(recs)
check('two sources folded', folded.length === 2)
check('newest source first', folded[0].pipeline_id === 'PIPE-20260719-00000002')
const s1 = folded.find((f) => f.pipeline_id === 'PIPE-20260719-00000001')!
check('latest status is building', s1.status === 'building')
check('verdict carried forward past the null-verdict build event', s1.verdict?.relevance === 'exact' && s1.verdict?.confidence === 80)
const s2 = folded.find((f) => f.pipeline_id === 'PIPE-20260719-00000002')!
check('a source with no events is status new, no verdict', s2.status === 'new' && s2.verdict === null)

assert.ok(passed >= 18)
console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
