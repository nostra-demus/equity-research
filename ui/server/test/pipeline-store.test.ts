// pipeline-store — the PURE fold + verdict-sanitize + id logic (no bash spawn, no filesystem). Run:
// npx tsx test/pipeline-store.test.ts. Proves the folded view surfaces the latest status, carries a scan
// verdict forward past a later build event, sorts newest-first, and that a verdict from an agent reading an
// untrusted source is clamped to the schema enums before it is ever persisted/rendered.
import assert from 'node:assert/strict'

let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const {
  isPipelineId, newPipelineId, sanitizeVerdict, foldPipeline,
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

assert.ok(passed >= 12)
console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
