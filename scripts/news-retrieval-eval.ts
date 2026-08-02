import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runNewsRetrievalBenchmark } from '../ui/server/src/retrieval/benchmark'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')
const result = runNewsRetrievalBenchmark(repoRoot)
console.log(JSON.stringify({
  passed: result.passed,
  cases: result.report.cases,
  recall_at_k: result.report.recallAtK,
  precision_at_k: result.report.precisionAtK,
  mean_reciprocal_rank: result.report.meanReciprocalRank,
  ndcg_at_k: result.report.ndcgAtK,
  failures: result.failures,
  case_results: result.report.caseResults,
}, null, 2))
if (!result.passed) process.exitCode = 1
