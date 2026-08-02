import fs from 'node:fs'
import path from 'node:path'
import { loadRetrievalConcepts } from './concepts'
import { evaluateRecall, type HybridDocument, type RecallCase, type RecallReport } from './hybrid'

interface BenchmarkDoc { id: string; quality?: number; headline?: string; company?: string; body?: string }
interface BenchmarkFile {
  k: number
  gates: { recall_at_k: number; mean_reciprocal_rank: number; ndcg_at_k: number }
  metric_terms?: string[]
  documents: BenchmarkDoc[]
  cases: { id: string; query: string; relevant_ids: string[] }[]
}
export interface BenchmarkResult { report: RecallReport; gates: BenchmarkFile['gates']; passed: boolean; failures: string[] }

export function runNewsRetrievalBenchmark(repoRoot: string): BenchmarkResult {
  const file = path.join(repoRoot, 'frameworks', 'retrieval', 'news-benchmark.json')
  const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as BenchmarkFile
  const documents: HybridDocument<BenchmarkDoc>[] = doc.documents.map((row) => ({
    id: row.id,
    value: row,
    quality: Number(row.quality || 0),
    fields: [
      { name: 'headline', text: row.headline, weight: 7, fuzzy: true },
      { name: 'company', text: row.company, weight: 8, fuzzy: true },
      { name: 'body', text: row.body, weight: 3 },
    ],
  }))
  const cases: RecallCase[] = doc.cases.map((row) => ({ id: row.id, query: row.query, relevantIds: row.relevant_ids }))
  const report = evaluateRecall(documents, cases, { concepts: loadRetrievalConcepts(repoRoot), metricTerms: doc.metric_terms || [] }, doc.k || 10)
  const failures: string[] = []
  if (report.recallAtK < doc.gates.recall_at_k) failures.push(`Recall@${doc.k} ${report.recallAtK.toFixed(3)} < ${doc.gates.recall_at_k.toFixed(3)}`)
  if (report.meanReciprocalRank < doc.gates.mean_reciprocal_rank) failures.push(`MRR ${report.meanReciprocalRank.toFixed(3)} < ${doc.gates.mean_reciprocal_rank.toFixed(3)}`)
  if (report.ndcgAtK < doc.gates.ndcg_at_k) failures.push(`nDCG@${doc.k} ${report.ndcgAtK.toFixed(3)} < ${doc.gates.ndcg_at_k.toFixed(3)}`)
  for (const miss of report.misses) failures.push(`miss ${miss.caseId}: ${miss.documentId}`)
  return { report, gates: doc.gates, passed: failures.length === 0, failures }
}
