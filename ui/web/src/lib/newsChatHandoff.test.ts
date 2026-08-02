import assert from 'node:assert/strict'
import { selectNewsChatHandoffEvidence } from './newsChatHandoff'

const row = (ref: string, headline: string, whyMatched: string[] = []) => ({
  ref, historical: false, whyMatched,
  item: { event_id: ref, headline, ts: '2026-08-02T00:00:00Z', source_name: 'Test', url: `https://example.com/${ref}` },
}) as any

let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ok  ${name}`) }

check('anchors the row whose visible headline states the named subject', () => {
  const genericAmazon = row('N1', 'Amazon AI capex fears', ['exact:amazon', 'exact:bedrock', 'exact:growth', 'exact:rate'])
  const directBedrock = row('N4', 'Hexaware becomes an Amazon Bedrock reseller', ['exact:amazon', 'exact:bedrock'])
  const receipt = { queryTerms: ['amazon', 'bedrock', 'growth', 'rate'], tradeCandidates: [] } as any
  assert.equal(selectNewsChatHandoffEvidence([genericAmazon, directBedrock], receipt)?.ref, 'N4')
})

check('prefers the strict trade candidate when one exists', () => {
  const direct = row('N1', 'Amazon Bedrock reseller')
  const candidate = row('N2', 'Nvidia demand rises')
  const receipt = { queryTerms: ['amazon', 'bedrock'], tradeCandidates: [{ evidenceRefs: ['N2'] }] } as any
  assert.equal(selectNewsChatHandoffEvidence([direct, candidate], receipt)?.ref, 'N2')
})

console.log(`\n${passed} checks passed`)
