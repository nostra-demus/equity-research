process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runNewsRetrievalBenchmark } from '../src/retrieval/benchmark'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..')
const result = runNewsRetrievalBenchmark(repoRoot)
assert.equal(result.passed, true, result.failures.join('\n'))
assert.equal(result.report.misses.length, 0)
assert.equal(result.report.hardNegativeIntrusions.length, 0)
assert.ok(result.report.precisionAtK >= result.gates.precision_at_k)
assert.ok(result.report.meanReciprocalRank >= result.gates.mean_reciprocal_rank)
assert.ok(result.report.ndcgAtK >= result.gates.ndcg_at_k)
console.log(`  ok  ${result.report.cases} finance retrieval cases passed: recall=${result.report.recallAtK.toFixed(3)} MRR=${result.report.meanReciprocalRank.toFixed(3)} nDCG=${result.report.ndcgAtK.toFixed(3)}`)
