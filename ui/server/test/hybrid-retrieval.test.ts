process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadRetrievalConcepts } from '../src/retrieval/concepts'
import { buildHybridQuery, evaluateRecall, HybridCollector, matchHybridDocument, type HybridDocument } from '../src/retrieval/hybrid'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e}`)
    process.exitCode = 1
  }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..')
const concepts = loadRetrievalConcepts(repoRoot)
const doc = (id: string, text: string, quality = 50): HybridDocument<string> => ({
  id,
  value: text,
  quality,
  fields: [{ name: 'headline', text, weight: 6, fuzzy: true }],
})

check('loads one shared conservative finance vocabulary', () => {
  assert.ok(concepts.some((group) => group.id === 'amazon_web_services'))
  assert.ok(concepts.some((group) => group.id === 'capital_expenditure'))
})

check('finds safe aliases in both directions', () => {
  const aws = buildHybridQuery('AWS growth', { concepts })
  const awsMatch = matchHybridDocument(aws, doc('aws', 'Amazon Web Services revenue growth accelerated'))
  assert.equal(awsMatch.qualifies, true)
  assert.ok(awsMatch.reasons.some((reason) => reason.includes('alias:aws→amazon web services')))

  const capex = buildHybridQuery('Amazon capital spending', { concepts })
  const capexMatch = matchHybridDocument(capex, doc('capex', 'Amazon raises capex for data centers'))
  assert.equal(capexMatch.qualifies, true)
  assert.ok(capexMatch.kinds.includes('alias'))
})

check('rescues one typo on a named subject but does not fuzzy-match every field', () => {
  const query = buildHybridQuery('Amazon Bedrok growth')
  const matched = matchHybridDocument(query, doc('bedrock', 'Amazon Bedrock growth is accelerating'))
  assert.equal(matched.qualifies, true)
  assert.ok(matched.reasons.includes('fuzzy:bedrok→bedrock'))

  const safe = matchHybridDocument(query, {
    id: 'unsafe', value: 'unsafe', fields: [{ name: 'body', text: 'Amazon Bedrock growth is accelerating', weight: 1 }],
  })
  assert.ok(!safe.reasons.includes('fuzzy:bedrok→bedrock'))
})

check('matches simple word forms without changing the meaning', () => {
  const query = buildHybridQuery('Amazon revenues')
  const matched = matchHybridDocument(query, doc('revenue', 'Amazon revenue increased'))
  assert.equal(matched.qualifies, true)
  assert.ok(matched.reasons.includes('stem:revenues→revenue'))
})

check('matches hyphenated finance phrases without losing the compound token', () => {
  const query = buildHybridQuery('Nvidia data center margin', { metricTerms: ['margin'] })
  const matched = matchHybridDocument(query, doc('nvidia', 'Nvidia data-center margin forecast rises'))
  assert.equal(matched.anchorMatches, 3)
  assert.equal(matched.qualifies, true)
})

check('keeps named anchors so generic metric noise cannot qualify', () => {
  const query = buildHybridQuery('Amazon Bedrock growth rate', { metricTerms: ['growth', 'rate'] })
  assert.equal(matchHybridDocument(query, doc('other', 'OtherCo annual growth rate reaches a record')).qualifies, false)
  assert.equal(matchHybridDocument(query, doc('amazon', 'Amazon cloud growth accelerates')).qualifies, true)
})

check('fuses exact relevance, BM25 rarity, recall, and source quality deterministically', () => {
  const query = buildHybridQuery('Amazon Bedrock growth', { metricTerms: ['growth'] })
  const collector = new HybridCollector<string>(query)
  collector.add(doc('generic-high-quality', 'Amazon growth remains solid', 100))
  collector.add(doc('exact', 'Amazon Bedrock growth accelerated', 45))
  collector.add(doc('typo', 'Amazon Bedrok growth accelerated', 85))
  collector.add(doc('zero-quality', 'Amazon cloud growth accelerated', 0))
  const first = collector.results(4)
  const second = collector.results(4)
  assert.equal(first[0].document.id, 'exact')
  assert.deepEqual(second.map((hit) => [hit.document.id, hit.score]), first.map((hit) => [hit.document.id, hit.score]))
  assert.ok(first[0].channelRanks.exact)
  assert.ok(first[0].channelRanks.bm25)
  assert.equal(first.find((hit) => hit.document.id === 'zero-quality')?.channelRanks.quality, undefined, 'a zero quality channel receives no RRF rank credit')
})

check('bounded collectors retain only their configured high-value candidate window', () => {
  const query = buildHybridQuery('Nvidia archive')
  const collector = new HybridCollector<string>(query, 25)
  for (let i = 0; i < 1_000; i++) collector.add(doc(`row-${i}`, `Nvidia archive result ${i}`, i))
  assert.equal(collector.documentsSeen, 1_000)
  assert.equal(collector.candidatesMatched, 1_000)
  assert.equal(collector.candidatesRetained, 25)
  assert.ok(collector.candidateAdmissionComparisons < 10_000, `heap admission used ${collector.candidateAdmissionComparisons} comparisons`)
  const first = collector.results(100)
  const second = collector.results(100)
  assert.equal(first.length, 25)
  assert.deepEqual(second.map((row) => row.document.id), first.map((row) => row.document.id))
  assert.ok(first.some((row) => row.document.id === 'row-999'))
})

check('measures recall so misses are visible instead of guessed away', () => {
  const documents = [
    doc('aws', 'Amazon Web Services growth accelerates'),
    doc('capex', 'Amazon raises capex for data centers'),
    doc('noise', 'A retailer reports weaker sales'),
  ]
  const report = evaluateRecall(documents, [
    { id: 'aws-alias', query: 'AWS growth', relevantIds: ['aws'] },
    { id: 'capex-alias', query: 'Amazon capital spending', relevantIds: ['capex'] },
  ], { concepts }, 2)
  assert.equal(report.recallAtK, 1)
  assert.deepEqual(report.misses, [])
})

console.log(`\n${passed} checks passed`)
