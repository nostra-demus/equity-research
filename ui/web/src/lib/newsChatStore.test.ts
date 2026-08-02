import assert from 'node:assert/strict'
import { api } from './api'
import { useStore } from './store'
import type { ChatMessage, NewsChatEvidence, NewsChatReceipt } from './types'

const receipt = (label: string): NewsChatReceipt => ({
  window: '24h', label, itemsSearched: 1, itemsMatched: 1, sourceCount: 1,
  evidenceCount: 1, historicalEvidenceCount: 0, coverageStart: '2026-08-02', coverageEnd: '2026-08-02',
  queryTerms: ['amazon'], queryTermHits: { amazon: 1 }, retrievalTermHits: { amazon: 1 }, expandedTerms: {},
  retrievalMode: 'hybrid', retrievalChannels: ['exact'], relationships: [], tradeCandidates: [],
  dataStores: ['test'], coverageWarnings: [], sourceHealth: null,
})
const evidence = (ref = 'N1'): NewsChatEvidence => ({
  ref, historical: false,
  item: { event_id: ref, headline: 'Amazon update', ts: '2026-08-02T00:00:00Z', source_name: 'Test', url: `https://example.com/${ref}` } as any,
})

const original = api.newsChatStream
const reset = () => {
  useStore.getState().clearNewsChat()
  useStore.setState({ staticMode: false, newsChatOpen: true, newsChatWindow: '24h' })
}

let passed = 0
const check = async (name: string, fn: () => Promise<void>) => {
  await fn(); passed++; console.log(`  ok  ${name}`)
}

await check('keeps the prior completed turn coherent when the next request fails', async () => {
  reset()
  api.newsChatStream = async (_body, cb) => {
    cb.onMeta({ receipt: receipt('first'), evidence: [evidence()] })
    cb.onToken('First answer [N1]')
    cb.onDone({})
  }
  await useStore.getState().sendNewsChatMessage('First question')

  api.newsChatStream = async (_body, cb) => { cb.onError('provider failed') }
  await useStore.getState().sendNewsChatMessage('Second question')

  const state = useStore.getState()
  assert.deepEqual(state.newsChatMessages.map((m) => m.content), ['First question', 'First answer [N1]'])
  assert.equal(state.newsChatCompletedTurn?.question, 'First question')
  assert.equal(state.newsChatCompletedTurn?.receipt.label, 'first')
  assert.equal(state.newsChatReceipt?.label, 'first')
  assert.equal(state.newsChatRetryText, 'Second question')
  assert.equal(state.newsChatError, 'provider failed')
  state.sendNewsChatToSignalCheck()
  const seed = useStore.getState().signalIntakeSeed
  assert.ok(seed && 'body_text' in seed && seed.body_text?.includes('Question: First question'))
  assert.ok(seed && 'body_text' in seed && !seed.body_text?.includes('Second question'))
  useStore.setState({ signalIntakeOpen: false, signalIntakeSeed: null })
})

await check('keeps a first-turn failure available to the empty-state retry UI', async () => {
  reset()
  api.newsChatStream = async (_body, cb) => { cb.onError('provider failed') }
  await useStore.getState().sendNewsChatMessage('First failed question')
  const state = useStore.getState()
  assert.deepEqual(state.newsChatMessages, [])
  assert.equal(state.newsChatError, 'provider failed')
  assert.equal(state.newsChatRetryText, 'First failed question')
})

await check('closing midstream aborts and removes the partial turn', async () => {
  reset()
  useStore.setState({
    newsChatMessages: [{ role: 'user', content: 'First question' }, { role: 'assistant', content: 'First answer [N1]' }],
    newsChatCompletedTurn: { question: 'First question', answer: 'First answer [N1]', receipt: receipt('first'), evidence: [evidence()] },
    newsChatReceipt: receipt('first'),
    newsChatEvidence: [evidence()],
  })
  let aborted = false
  api.newsChatStream = async (_body, cb) => new Promise<void>((resolve) => {
    cb.onMeta({ receipt: receipt('partial'), evidence: [evidence('N2')] })
    cb.onToken('partial answer')
    cb.signal.addEventListener('abort', () => { aborted = true; resolve() }, { once: true })
  })
  const pending = useStore.getState().sendNewsChatMessage('Interrupted question')
  await Promise.resolve()
  useStore.getState().closeNewsChat()
  await pending

  const state = useStore.getState()
  assert.equal(aborted, true)
  assert.equal(state.newsChatStreaming, false)
  assert.deepEqual(state.newsChatMessages.map((m) => m.content), ['First question', 'First answer [N1]'])
  assert.equal(state.newsChatReceipt?.label, 'first')
  assert.equal(state.newsChatError, undefined)
})

await check('ignores callbacks delivered after cancellation', async () => {
  for (const cancel of ['close', 'clear', 'window'] as const) {
    reset()
    let callbacks: any
    api.newsChatStream = async (_body, cb) => new Promise<void>((resolve) => {
      callbacks = cb
      cb.onMeta({ receipt: receipt('partial'), evidence: [evidence('N2')] })
      cb.onToken('partial answer')
      cb.signal.addEventListener('abort', () => resolve(), { once: true })
    })
    const pending = useStore.getState().sendNewsChatMessage(`Cancel by ${cancel}`)
    await Promise.resolve()
    if (cancel === 'close') useStore.getState().closeNewsChat()
    else if (cancel === 'clear') useStore.getState().clearNewsChat()
    else useStore.getState().setNewsChatWindow('7d')
    await pending

    callbacks.onMeta({ receipt: receipt('late'), evidence: [evidence('N9')] })
    callbacks.onToken('late answer')
    callbacks.onDone({})
    callbacks.onError('late error')
    const state = useStore.getState()
    assert.equal(state.newsChatStreaming, false)
    assert.notEqual(state.newsChatReceipt?.label, 'late')
    assert.ok(!state.newsChatMessages.some((message) => message.content.includes('late answer')))
    assert.notEqual(state.newsChatError, 'late error')
  }
})

await check('uses the top candidate for both the handoff anchor and score note', async () => {
  reset()
  const top = evidence('N1')
  top.item.headline = 'Top candidate source'
  const lower = evidence('N2')
  lower.item.headline = 'Lower candidate source'
  const ranked = receipt('ranked')
  ranked.queryTerms = ['lower']
  ranked.tradeCandidates = [
    { ticker: 'TOP', company: 'Top Co', score: 71, readiness: 'check_now', direction: 'long', breakdown: { evidence: 1, impact: 1, specificity: 1, timing: 1, expression: 1, corroboration: 1, learning_adjustment: 0 }, missingChecks: ['price'], evidenceRefs: ['N1'] },
    { ticker: 'LOW', company: 'Lower Co', score: 70, readiness: 'needs_data', direction: 'long', breakdown: { evidence: 1, impact: 1, specificity: 1, timing: 1, expression: 1, corroboration: 1, learning_adjustment: 0 }, missingChecks: [], evidenceRefs: ['N2'] },
  ]
  useStore.setState({
    newsChatMessages: [{ role: 'user', content: 'Rank them' }, { role: 'assistant', content: 'Lower is discussed [N2].' }],
    newsChatCompletedTurn: { question: 'Rank them', answer: 'Lower is discussed [N2].', receipt: ranked, evidence: [lower, top] },
  })
  useStore.getState().sendNewsChatToSignalCheck()
  const seed = useStore.getState().signalIntakeSeed
  assert.equal(seed && 'source_url' in seed ? seed.source_url : undefined, top.item.url)
  assert.ok(seed && 'body_text' in seed && seed.body_text?.includes('Strict chat rank: TOP 71/100'))
  assert.ok(seed && 'body_text' in seed && seed.body_text?.includes('[N1]'))
  useStore.setState({ signalIntakeOpen: false, signalIntakeSeed: null })
})

await check('uses a human prompt when the top candidate has no usable source', async () => {
  reset()
  const top = evidence('N1')
  top.item.url = ''
  const lower = evidence('N2')
  const ranked = receipt('ranked-unusable')
  ranked.tradeCandidates = [
    { ticker: 'TOP', company: 'Top Co', score: 71, readiness: 'check_now', direction: 'long', breakdown: { evidence: 1, impact: 1, specificity: 1, timing: 1, expression: 1, corroboration: 1, learning_adjustment: 0 }, missingChecks: [], evidenceRefs: ['N1'] },
    { ticker: 'LOW', company: 'Lower Co', score: 70, readiness: 'needs_data', direction: 'long', breakdown: { evidence: 1, impact: 1, specificity: 1, timing: 1, expression: 1, corroboration: 1, learning_adjustment: 0 }, missingChecks: [], evidenceRefs: ['N2'] },
  ]
  useStore.setState({
    newsChatCompletedTurn: { question: 'Rank them', answer: 'Both are discussed [N1] [N2].', receipt: ranked, evidence: [lower, top] },
  })
  useStore.getState().sendNewsChatToSignalCheck()
  const seed = useStore.getState().signalIntakeSeed
  assert.ok(seed && 'human_prompt_note' in seed)
  assert.ok(seed && 'human_prompt_note' in seed && seed.human_prompt_note?.includes('Strict chat rank: TOP 71/100'))
  useStore.setState({ signalIntakeOpen: false, signalIntakeSeed: null })
})

await check('caps both the request and retained transcript at 30 messages', async () => {
  reset()
  const longTranscript: ChatMessage[] = Array.from({ length: 40 }, (_, i) => ({
    role: i % 2 ? 'assistant' : 'user',
    content: `message-${i}`,
  }))
  useStore.setState({ newsChatMessages: longTranscript })
  let sent = 0
  api.newsChatStream = async (body, cb) => {
    sent = body.messages.length
    cb.onMeta({ receipt: receipt('capped'), evidence: [evidence()] })
    cb.onToken('Capped answer')
    cb.onDone({})
  }
  await useStore.getState().sendNewsChatMessage('Newest question')
  assert.ok(sent <= 30)
  assert.ok(useStore.getState().newsChatMessages.length <= 30)
  assert.equal(useStore.getState().newsChatMessages.at(-2)?.content, 'Newest question')
})

api.newsChatStream = original
useStore.getState().clearNewsChat()
console.log(`\n${passed} checks passed`)
