import assert from 'node:assert/strict'
import { askMemoryMeta, priorChatMemoryBlock, routeAskMemory } from '../src/ask-memory'

assert.deepEqual(routeAskMemory('What is the bull case?', 'research'), {
  mode: 'auto', useNews: false, useHistory: true, historyIntent: false,
  reason: 'Auto: the current run is enough; earlier chats are checked for a useful match.',
})
assert.equal(routeAskMemory('What changed in the latest news?', 'research').useNews, true)
assert.equal(routeAskMemory('Does this matter?', 'screener').useNews, true)
assert.equal(routeAskMemory('latest news', 'screener', 'run').useNews, false)
assert.equal(routeAskMemory('old thesis', 'research', 'news').useNews, true)

const prior = [{
  id: 'chat_x_deadbeef', title: 'Ask · AMZN', subject: 'AMZN', swarm: 'research', updatedAt: Date.UTC(2026, 7, 20), score: 10,
  snippet: 'User: What did we say?\nAssistant: Working view only.',
}]
assert.match(priorChatMemoryBlock(prior), /\[C1\] Ask · AMZN/)
assert.match(priorChatMemoryBlock([{ ...prior[0], updatedAt: Number.NaN }]), /unknown date/)
assert.match(priorChatMemoryBlock([{ ...prior[0], updatedAt: Number.MAX_VALUE }]), /unknown date/)
const meta = askMemoryMeta('current research', {
  route: routeAskMemory('what did we say?', 'research'),
  priorChats: prior,
  calls: [{
    ticker: 'AMZN', company: 'Amazon.com, Inc.', decision_date: '2026-07-10', original_decision: 'Watchlist', original_confidence: 72,
    original_price: 238.34, currency: 'USD', exchange: 'NASDAQ', latest_review_date: null, latest_price: null, price_change_pct: null, benchmark_relative_pct: null,
    thesis_status: null, decision_quality: null, action_now: 'Keep watching', action_reason: 'No review yet.', confidence_after: null,
    confidence_reason: null, why_right_or_wrong: null, error_taxonomy: [], future_research_check: null, next_check_date: null,
    next_check_label: null, source_path: 'analyses/AMZN_2026-07-10/final_thesis.md',
  }],
})
assert.equal(meta.kind, 'ask-memory')
assert.deepEqual(meta.shelves.map((shelf) => shelf.kind), ['run', 'chats', 'calls'])

console.log('ask memory routing checks passed')
