// Tests for the CapIQ-style NEWS TOPIC overlay (news/topics.ts) + its wiring into the feed filter.
// Topics are a deterministic SUBJECT axis derived from the headline — precision and boundary-safety are
// the whole point (a bare 'ai' must NOT fire inside "email"/"Dubai"; a bare 'ev' must NOT fire inside
// "seven"/"level"), so a keyword tagger doesn't become the theme-boilerplate noise the audit warned of.
import assert from 'node:assert'
import { deriveTopics, TOPICS, TOPIC_ORDER, topicLabel } from '../src/news/topics'
import { matchesFeedFilters, parseFeedFilterQuery, hasAnyFilter } from '../src/news/feed-filter'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e) { console.error(`  ✗   ${name}\n      ${(e as Error).message}`); process.exitCode = 1 }
}
const topics = (headline: string, headline_en?: string) => deriveTopics({ headline, headline_en })

// ---- precision: the subject is tagged ----
check('tags the obvious subject topics', () => {
  assert.deepEqual(topics('Nvidia unveils new AI semiconductor for data centers'), ['artificial_intelligence', 'semiconductors', 'data_center'])
  assert.ok(topics('Ransomware attack cripples hospital network').includes('cybersecurity'))
  assert.ok(topics('Bitcoin tops $90,000 as crypto rally continues').includes('crypto_blockchain'))
  assert.ok(topics('Tesla Q3 electric vehicle deliveries beat estimates').includes('electric_vehicles'))
  assert.ok(topics('EU unveils net-zero decarbonisation package').includes('clean_energy_climate'))
  assert.ok(topics('US imposes fresh tariffs and export controls on China chips').includes('sanctions_trade'))
  assert.ok(topics('SEC charges founder in $2bn accounting fraud and money laundering case').includes('financial_crime'))
  assert.ok(topics('FDA approval clears the phase 3 oncology drug').includes('healthcare_pharma'))
  assert.ok(topics('SpaceX satellite launch reaches low earth orbit').includes('space'))
  assert.ok(topics('Global chip shortage disrupts the auto supply chain').includes('supply_chain'))
})

// ---- boundary safety: the matcher must not fire inside a longer word ----
check("bare 'ai'/'ev' never fire inside a longer word (the boundary rule holds)", () => {
  assert.deepEqual(topics('Company sends email update to shareholders'), [], "'ai' inside 'email' must not tag AI")
  assert.deepEqual(topics('Firm opens new office in Dubai'), [], "'ai' inside 'Dubai' must not tag AI")
  assert.deepEqual(topics('Seven directors resign at the eleventh hour'), [], "'ev' inside 'seven'/'eleventh' must not tag EVs")
  assert.deepEqual(topics('Revenue level held steady this quarter'), [], "'ev' inside 'level'/'Revenue' must not tag EVs")
  assert.deepEqual(topics('Board said the deal is off'), [], "'ai' inside 'said' must not tag AI")
})

// ---- multilabel + empty ----
check('multilabel when several subjects appear; [] when none', () => {
  const t = topics('AI datacenter boom drives semiconductor and clean energy demand')
  assert.ok(t.includes('artificial_intelligence') && t.includes('data_center') && t.includes('semiconductors') && t.includes('clean_energy_climate'))
  assert.deepEqual(topics('Retailer reports quarterly same-store sales growth'), [])
  // order is stable (TOPIC_ORDER), never arbitrary
  assert.deepEqual(topics('Semiconductor and AI news'), ['artificial_intelligence', 'semiconductors'])
})

// ---- foreign-language: scans the English translation, like scope.ts ----
check('a non-English headline is tagged via its English translation', () => {
  assert.ok(topics('Nvidia stellt neuen KI-Chip vor', 'Nvidia unveils new AI chip').includes('artificial_intelligence'))
})

// ---- metadata integrity ----
check('every topic id has a def + label; TOPIC_ORDER is complete and unique', () => {
  assert.equal(TOPIC_ORDER.length, Object.keys(TOPICS).length)
  assert.equal(new Set(TOPIC_ORDER).size, TOPIC_ORDER.length, 'no duplicate topic ids in TOPIC_ORDER')
  for (const id of TOPIC_ORDER) {
    assert.ok(TOPICS[id] && TOPICS[id].label && TOPICS[id].meaning, `${id} has a def with label + meaning`)
    assert.equal(topicLabel(id), TOPICS[id].label)
  }
  assert.equal(topicLabel('not_a_topic'), 'not_a_topic', 'unknown id falls back to itself')
})

// ---- filter wiring: topics is a first-class filter dimension ----
check('the feed filter matches, parses, and counts the topics dimension', () => {
  // note: bare 'chip' is deliberately NOT a semiconductor term (would false-positive on "blue-chip") — use
  // 'semiconductor'; the whole item is synthetic with no it.topics, so a match proves the lazy topicsOf derive.
  const it = { headline: 'Nvidia semiconductor sales jump on AI demand', event_types: [], companies: [] } as unknown as FeedItem
  assert.ok(matchesFeedFilters(it, { topics: ['artificial_intelligence'] }), 'an AI item matches a topics=AI filter (via lazy derive, no it.topics)')
  assert.ok(!matchesFeedFilters(it, { topics: ['space'] }), 'the same item does NOT match topics=space')
  assert.ok(matchesFeedFilters(it, { topics: ['semiconductors'] }), 'topicsOf derives semiconductors on the fly when it.topics is absent')
  // parse: comma-separated, lowercased, trimmed
  assert.deepEqual(parseFeedFilterQuery({ topics: 'Artificial_Intelligence, semiconductors ' }).topics, ['artificial_intelligence', 'semiconductors'])
  assert.equal(parseFeedFilterQuery({}).topics, undefined)
  assert.ok(hasAnyFilter({ topics: ['space'] }), 'a topics filter flips hasAnyFilter → archive search')
  assert.ok(!hasAnyFilter({ topics: [] }), 'an empty topics array is not an active filter')
})

console.log(`\n${passed} checks passed`)
