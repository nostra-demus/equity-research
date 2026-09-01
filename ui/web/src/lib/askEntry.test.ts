import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { focusChatHistoryAfterDelete, focusChatHistoryDeleteConfirmation, focusChatHistoryPanel, restoreChatHistoryDeleteTrigger, restoreChatHistoryFocus } from '../components/ChatHistory'
import { ChatErrorNotice, retryAndFocusAskDrawer } from '../components/ChatPanel'
import { CommandBar, ScreenerAskButton } from '../components/CommandBar'
import { focusSelectedEventDetail } from '../components/screener/NewsChatPanel'
import { api } from './api'
import { captureAskOpener, focusAskDrawer, restoreAskEntryFocus } from './askFocus'
import { useStore } from './store'

const research = { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' } as const
const screener = { id: 'screener', label: 'Screener', color: '#4cc9d8', unit: 'signal', order: 2, layout: 'flow' } as const
const savedComputed = [{ kind: 'unsupported' as const, asked: 'saved calc', recorded: [], reason: 'No recorded lever' }]
const recoveredComputed = [{ kind: 'unsupported' as const, asked: 'recovered calc', recorded: [], reason: 'No recorded lever' }]

useStore.setState({
  activeSwarm: 'research',
  swarms: [research],
  selectedTicker: 'AMZN',
  chatOpen: false,
  chatStreaming: false,
  newsChatOpen: true,
  newsChatStreaming: false,
})

useStore.getState().openChat('run')
assert.equal(useStore.getState().chatOpen, true)
assert.equal(useStore.getState().newsChatOpen, false, 'opening signal/run Ask must close the news drawer')

useStore.getState().openNewsChat()
assert.equal(useStore.getState().newsChatOpen, true)
assert.equal(useStore.getState().chatOpen, false, 'opening news Ask must close the signal/run drawer')
assert.equal(useStore.getState().chatHistoryOpen, false, 'opening news Ask must close chat history')

useStore.setState({
  chatOpen: true,
  chatScope: 'run',
  chatMessages: [{ role: 'assistant', content: 'Completed prior thread' }],
  chatConversationId: 'saved-prior',
  newsChatOpen: false,
})
useStore.getState().closeChat()
useStore.getState().openChat('run')
assert.deepEqual(useStore.getState().chatMessages, [], 'explicit Close then Ask must start a fresh thread')
assert.equal(useStore.getState().chatConversationId, undefined)

useStore.setState({ chatHistoryOpen: false, newsChatOpen: true })
useStore.getState().openChatHistory()
assert.equal(useStore.getState().newsChatOpen, false, 'opening chat history must close news Ask')
assert.equal(useStore.getState().chatHistoryOpen, true)

useStore.setState({ chatOpen: false, chatHistoryOpen: true, newsChatOpen: true })
useStore.getState().startNewChat()
assert.equal(useStore.getState().chatOpen, true)
assert.equal(useStore.getState().chatHistoryOpen, false)
assert.equal(useStore.getState().newsChatOpen, false, 'starting from History must close news Ask')

const originalGetChat = api.getChat
api.getChat = async () => ({
  v: 1,
  id: 'saved-1',
  user: 'local',
  userVia: 'local',
  swarm: 'research',
  subject: 'AMZN',
  scope: 'run',
  title: 'Saved AMZN chat',
  createdAt: 1,
  updatedAt: 2,
  costUsd: 0,
  messages: [{ role: 'assistant', content: 'Saved answer', turnId: 'turn_saved_scenario_0001', computed: savedComputed, ts: 1 }],
})
useStore.setState({ chatOpen: false, chatHistoryOpen: true, newsChatOpen: true, staticMode: false })
await useStore.getState().resumeConversation('saved-1')
assert.equal(useStore.getState().newsChatOpen, false, 'resuming History must close news Ask')
assert.equal(useStore.getState().chatHistoryOpen, false)
assert.equal(useStore.getState().chatOpen, true)
assert.equal(useStore.getState().chatConversationId, 'saved-1')
assert.deepEqual(useStore.getState().chatMessages[0]?.computed, savedComputed, 'resuming History must restore deterministic computed cards')
assert.equal(useStore.getState().chatMessages[0]?.turnId, 'turn_saved_scenario_0001', 'History resume must preserve the receipt pointer used for authenticated follow-ups')

api.getChat = async () => ({
  v: 1,
  id: 'chat_news_deadbeef',
  user: 'local',
  userVia: 'local',
  swarm: 'screener',
  subject: 'NEWS',
  scope: 'wire',
  title: 'Ask · news wire',
  model: 'sonnet',
  style: 'news:7d' as any,
  createdAt: 1,
  updatedAt: 2,
  costUsd: 0,
  messages: [
    { role: 'user', content: 'What changed?', ts: 1 },
    { role: 'assistant', content: 'Saved wire answer [N1]', ts: 2, memory: {
      kind: 'news-wire', window: '7d',
      receipt: { window: '7d', label: '7 days', itemsSearched: 1, itemsMatched: 1, sourceCount: 1, evidenceCount: 1, historicalEvidenceCount: 0, coverageStart: null, coverageEnd: null, queryTerms: [], queryTermHits: {}, retrievalTermHits: {}, expandedTerms: {}, retrievalMode: 'hybrid', retrievalChannels: [], dataStores: [], coverageWarnings: [], sourceHealth: null },
      evidence: [],
    } },
  ],
})
useStore.setState({ activeSwarm: 'screener', swarms: [research, screener], chatOpen: false, chatHistoryOpen: true, newsChatOpen: false, scSelectedSignal: null })
await useStore.getState().resumeConversation('chat_news_deadbeef')
assert.equal(useStore.getState().chatOpen, false)
assert.equal(useStore.getState().newsChatOpen, true, 'wire History rows must reopen the durable news drawer')
assert.equal(useStore.getState().newsChatConversationId, 'chat_news_deadbeef')
assert.equal(useStore.getState().newsChatWindow, '7d')
assert.equal(useStore.getState().newsChatMessages.at(-1)?.content, 'Saved wire answer [N1]')
api.getChat = originalGetChat
api.getChat = async () => ({
  v: 1, id: 'saved-1', user: 'local', userVia: 'local', swarm: 'research', subject: 'AMZN', scope: 'run',
  title: 'Saved AMZN chat', createdAt: 1, updatedAt: 2, costUsd: 0,
  messages: [{ role: 'assistant', content: 'Saved answer', turnId: 'turn_saved_scenario_0001', computed: savedComputed, ts: 1 }],
})

// An already-scheduled visual swarm transition must not fire after History wins the navigation race.
useStore.setState({ activeSwarm: 'research', swarms: [research, screener], warp: null })
useStore.getState().switchSwarm('screener')
assert.equal(useStore.getState().warp?.phase, 'collapse')
await useStore.getState().resumeConversation('saved-1')
assert.equal(useStore.getState().warp, null, 'an accepted History resume must cancel an older collapse warp')
await new Promise((resolve) => setTimeout(resolve, 450))
assert.equal(useStore.getState().activeSwarm, 'research', 'the canceled warp timer must not switch away later')

let resolveSlowerResume!: (conversation: Awaited<ReturnType<typeof originalGetChat>>) => void
api.getChat = async () => new Promise((resolve) => { resolveSlowerResume = resolve })
useStore.setState({ chatOpen: false, chatHistoryOpen: true, newsChatOpen: false })
const slowerResume = useStore.getState().resumeConversation('saved-slow')
useStore.getState().openNewsChat()
resolveSlowerResume({
  v: 1,
  id: 'saved-slow',
  user: 'local',
  userVia: 'local',
  swarm: 'research',
  subject: 'AMZN',
  scope: 'run',
  title: 'Stale saved chat',
  createdAt: 1,
  updatedAt: 2,
  costUsd: 0,
  messages: [{ role: 'assistant', content: 'Must not replace newer navigation', ts: 1 }],
})
await slowerResume
assert.equal(useStore.getState().newsChatOpen, true, 'newer News navigation must win over a slower History read')
assert.equal(useStore.getState().chatOpen, false)
api.getChat = originalGetChat

const originalDeleteChat = api.deleteChat
api.deleteChat = async () => ({ deleted: false })
useStore.setState({ chatConversationId: 'shared-history-row', staticMode: false })
assert.equal(await useStore.getState().deleteConversation('shared-history-row'), false, 'a server-refused deletion must remain a failed UI action')
assert.equal(useStore.getState().chatConversationId, 'shared-history-row', 'a failed delete must not detach the open conversation')
api.deleteChat = async () => ({ deleted: true })
assert.equal(await useStore.getState().deleteConversation('shared-history-row'), true)
assert.equal(useStore.getState().chatConversationId, undefined)
api.deleteChat = originalDeleteChat

const originalChatStream = api.chatStream
api.chatStream = async (_body, callbacks) => new Promise<void>((resolve) => {
  callbacks.signal.addEventListener('abort', () => resolve(), { once: true })
})
const committedSignalThread = [{ role: 'assistant' as const, content: 'Committed signal answer' }]
useStore.setState({
  chatOpen: true,
  chatScope: 'run',
  chatModule: undefined,
  chatOrbKey: undefined,
  chatMessages: committedSignalThread,
  chatStreaming: false,
  newsChatOpen: false,
})
const pendingSignalTurn = useStore.getState().sendChatMessage('unfinished signal question')
assert.equal(useStore.getState().chatStreaming, true)
useStore.getState().openNewsChat()
await pendingSignalTurn
assert.deepEqual(useStore.getState().chatMessages, committedSignalThread, 'switching Ask contexts must roll back an unfinished signal turn')
assert.equal(useStore.getState().chatOpen, false)
assert.equal(useStore.getState().newsChatOpen, true)
api.chatStream = originalChatStream

let failedTurnId: string | undefined
let failedMessageTurnId: string | undefined
api.chatStream = async (body, callbacks) => {
  failedTurnId = body.turnId
  failedMessageTurnId = body.messages.at(-1)?.turnId
  callbacks.onMeta?.({ conversationId: 'server-minted-then-rolled-back', scopeResolved: 'whole run', sourcePath: 'partial/source.md' })
  callbacks.onToken('partial answer')
  callbacks.onError('stream interrupted')
}
const committedBeforeFailure = [{ role: 'assistant' as const, content: 'Last committed answer' }]
useStore.setState({
  activeSwarm: 'research',
  swarms: [research],
  selectedTicker: 'AMZN',
  chatOpen: true,
  chatScope: 'run',
  chatMessages: committedBeforeFailure,
  chatConversationId: 'committed-thread',
  chatSource: 'committed/source.md',
  chatStreaming: false,
})
await useStore.getState().sendChatMessage('retry this exact question')
assert.deepEqual(useStore.getState().chatMessages, committedBeforeFailure, 'failed signal turns must restore the committed drawer transcript')
assert.equal(useStore.getState().chatConversationId, 'committed-thread', 'a rolled-back server id must not remain attached locally')
assert.equal(useStore.getState().chatSource, 'committed/source.md')
assert.equal(useStore.getState().chatRetryText, 'retry this exact question')
assert.match(failedTurnId || '', /^turn_/, 'every attempted question must carry a durable idempotency key')
assert.equal(failedMessageTurnId, failedTurnId, 'the message echo must carry the same receipt pointer as the top-level turn')
assert.equal(useStore.getState().chatRetryTurnId, failedTurnId, 'Retry must retain the failed question’s exact idempotency key')
assert.equal(useStore.getState().chatError, 'stream interrupted')

// A retry of an ambiguously interrupted turn can be replayed from the committed server copy. It must use
// the same turn id and replace partial text exactly rather than appending a second saved/paid answer.
api.chatStream = async (body, callbacks) => {
  assert.equal(body.turnId, failedTurnId)
  callbacks.onRecovered?.({
    conversationId: 'committed-thread', turnId: failedTurnId!, question: 'retry this exact question',
    answer: 'Canonical recovered answer', thinking: 'Recovered reasoning', computed: recoveredComputed, sourcePath: 'canonical/source.md',
  })
  callbacks.onDone({ costUsd: 0 })
}
await useStore.getState().sendChatMessage(useStore.getState().chatRetryText!, useStore.getState().chatRetryTurnId)
assert.deepEqual(useStore.getState().chatMessages.map((m) => m.content), ['Last committed answer', 'retry this exact question', 'Canonical recovered answer'])
assert.equal(useStore.getState().chatMessages.at(-1)?.thinking, 'Recovered reasoning')
assert.deepEqual(useStore.getState().chatMessages.at(-1)?.computed, recoveredComputed, 'ambiguous recovery must restore computed cards exactly')
assert.equal(useStore.getState().chatMessages.at(-1)?.turnId, failedTurnId, 'the recovered assistant keeps the authenticated receipt pointer')
assert.equal(useStore.getState().chatConversationId, 'committed-thread')
assert.equal(useStore.getState().chatSource, 'canonical/source.md')
assert.equal(useStore.getState().chatRetryTurnId, undefined)
api.chatStream = originalChatStream

// Exercise the real stream reader: EOF after tokens but before chat-done reconciles via the committed-turn
// endpoint and calls onRecovered/onDone, never onError.
const priorWindowForRecovery = (globalThis as any).window
const priorFetch = globalThis.fetch
let recoveredAnswer = ''
let recoveredCards: unknown[] | undefined
let recoveryDone = 0
let recoveryError = ''
let researchChatAccept = ''
;(globalThis as any).window = { __ENGINE_LIVE__: true }
;(globalThis as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  if (url === '/api/chat') {
    researchChatAccept = new Headers(init?.headers).get('accept') || ''
    return new Response('event: chat-meta\ndata: {"conversationId":"chat_recover_deadbeef","scopeResolved":"whole run"}\n\nevent: chat-token\ndata: {"content":"partial"}\n\n', { status: 200 })
  }
  if (url === '/api/chat/turn/turn_recovery123') {
    return new Response(JSON.stringify({
      conversationId: 'chat_recover_deadbeef', turnId: 'turn_recovery123', question: 'recover me',
      answer: 'Recovered whole answer', thinking: 'Recovered thought', computed: recoveredComputed, sourcePath: 'saved/source.md',
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  throw new Error(`unexpected fetch ${url}`)
}
try {
  await originalChatStream(
    { ticker: 'AMZN', scope: 'run', turnId: 'turn_recovery123', messages: [{ role: 'user', content: 'recover me' }] },
    {
      signal: new AbortController().signal,
      onToken: () => {},
      onRecovered: (turn) => { recoveredAnswer = turn.answer; recoveredCards = turn.computed },
      onDone: () => { recoveryDone++ },
      onError: (message) => { recoveryError = message },
    },
  )
  assert.equal(recoveredAnswer, 'Recovered whole answer')
  assert.deepEqual(recoveredCards, recoveredComputed, 'the real recovery endpoint payload must carry computed cards')
  assert.equal(recoveryDone, 1)
  assert.equal(recoveryError, '')
  assert.equal(researchChatAccept, 'text/event-stream', 'research Ask must bypass the edge request deadline as an explicit SSE stream')
} finally {
  ;(globalThis as any).fetch = priorFetch
  if (priorWindowForRecovery === undefined) delete (globalThis as any).window
  else (globalThis as any).window = priorWindowForRecovery
}

const originalNewsChatStream = api.newsChatStream
api.newsChatStream = async (_body, callbacks) => new Promise<void>((resolve) => {
  callbacks.signal.addEventListener('abort', () => resolve(), { once: true })
})
const committedNewsThread = [{ role: 'assistant' as const, content: 'Committed news answer' }]
useStore.setState({ newsChatOpen: true, newsChatMessages: committedNewsThread, newsChatStreaming: false, chatOpen: false })
const pendingNewsTurn = useStore.getState().sendNewsChatMessage('unfinished news question')
assert.equal(useStore.getState().newsChatStreaming, true)
useStore.getState().openChat('run')
await pendingNewsTurn
assert.deepEqual(useStore.getState().newsChatMessages, committedNewsThread, 'switching Ask contexts must roll back an unfinished news turn')
assert.equal(useStore.getState().newsChatOpen, false)
assert.equal(useStore.getState().chatOpen, true)
api.newsChatStream = originalNewsChatStream

useStore.setState({ activeSwarm: 'screener', swarms: [research, screener], scSelectedSignal: null, chatOpen: false, newsChatOpen: false })
const bar = renderToStaticMarkup(createElement(ScreenerAskButton))
assert.equal((bar.match(/cmdbar__ask/g) || []).length, 1, 'screener must expose one top-level Ask entry')
assert.equal(bar.includes('Ask news'), false, 'the internal news context must not return as a second top-level Ask')
assert.equal(bar.includes('aria-haspopup="menu"'), false, 'Ask must not force a source menu before the question')
assert.match(bar, /Auto|saved news wire/, 'the single Ask entry must explain that source choice is automatic')

const composedBar = renderToStaticMarkup(createElement(CommandBar))
assert.equal((composedBar.match(/cmdbar__ask/g) || []).length, 1, 'the composed screener command bar must keep exactly one top-level Ask')
assert.equal(composedBar.includes('Ask news'), false, 'the parent command bar must not reintroduce a separate Ask news action')

useStore.setState({
  activeSwarm: 'research', constellationSwarm: 'research', swarms: [research], selectedTicker: 'AMZN',
  activeRuns: {}, health: 'online', staticMode: false,
  launchPending: { key: 'module:management-governance', label: 'Checking unfinished orbs…', ticker: 'AMZN' },
})
const pendingResearchBar = renderToStaticMarkup(createElement(CommandBar))
const pendingFullButton = pendingResearchBar.match(/<button[^>]*>Run full ▸<\/button>/)?.[0] ?? ''
assert.match(pendingFullButton, /disabled/, 'Run full is disabled while any launch request for the selected ticker is pending')
useStore.setState({
  activeSwarm: 'screener', constellationSwarm: 'research', swarms: [research, screener], selectedTicker: 'AMZN',
  launchPending: null,
})

const failedTurnNotice = renderToStaticMarkup(createElement(ChatErrorNotice, { error: 'stream interrupted', retryText: 'retry me', onRetry: () => {}, staticMessage: 'live only' }))
assert.match(failedTurnNotice, /role="alert"/, 'a first-turn Ask failure must be announced')
assert.match(failedTurnNotice, />Retry</, 'a rolled-back first turn must still offer Retry')

// Drawer close returns to the actual opener when it still exists, with the command-bar Ask as the fallback
// for History rows or other controls that unmount during navigation.
const priorDocument = (globalThis as any).document
const priorRaf = (globalThis as any).requestAnimationFrame
let openerFocus = 0
let fallbackFocus = 0
let composerFocus = 0
let historyCloseFocus = 0
let eventBackFocus = 0
let deleteConfirmFocus = 0
let deleteTriggerFocus = 0
let adjacentRowFocus = 0
const opener = { isConnected: true, disabled: false, focus: () => { openerFocus++ } } as unknown as HTMLElement
const fallback = { isConnected: true, disabled: false, focus: () => { fallbackFocus++ } } as unknown as HTMLButtonElement
const composer = { isConnected: true, disabled: false, focus: () => { composerFocus++ } } as unknown as HTMLTextAreaElement
const historyClose = { isConnected: true, disabled: false, focus: () => { historyCloseFocus++ } } as unknown as HTMLButtonElement
const eventBack = { isConnected: true, disabled: false, focus: () => { eventBackFocus++ } } as unknown as HTMLButtonElement
const deleteConfirm = { isConnected: true, disabled: false, focus: () => { deleteConfirmFocus++ } } as unknown as HTMLButtonElement
const deleteTrigger = { isConnected: true, disabled: false, focus: () => { deleteTriggerFocus++ } } as unknown as HTMLButtonElement
const adjacentRow = { isConnected: true, disabled: false, focus: () => { adjacentRowFocus++ } } as unknown as HTMLElement
;(globalThis as any).document = {
  activeElement: null,
  querySelector: (selector: string) => selector.includes('data-event-detail-focus')
    ? eventBack
    : selector.includes('data-chat-history-close')
      ? historyClose
      : selector.includes('data-ask-composer')
        ? composer
        : fallback,
}
;(globalThis as any).requestAnimationFrame = (fn: () => void) => { fn(); return 1 }
try {
  captureAskOpener(opener)
  restoreAskEntryFocus()
  assert.equal(openerFocus, 1, 'a still-mounted scope-specific Chat opener must regain focus')
  ;(opener as any).isConnected = false
  captureAskOpener(opener)
  restoreAskEntryFocus()
  assert.equal(fallbackFocus, 1, 'an unmounted opener must fall back to the one top-level Ask entry')
  restoreAskEntryFocus()
  assert.equal(fallbackFocus, 2, 'no captured opener must also fall back to the one top-level Ask entry')
  focusAskDrawer()
  assert.equal(composerFocus, 1, 'History handoff must focus the already-mounted drawer composer')
  let retried = 0
  retryAndFocusAskDrawer(() => { retried++ })
  assert.equal(retried, 1, 'Retry must invoke the failed Ask turn exactly once')
  assert.equal(composerFocus, 2, 'Retry must move focus from its unmounted error action to the Ask composer')
  focusChatHistoryPanel()
  assert.equal(historyCloseFocus, 1, 'opening History must move focus into the overlaid panel')
  const historyOpener = { isConnected: true, disabled: false, focus: () => { openerFocus++ } } as unknown as HTMLElement
  restoreChatHistoryFocus(historyOpener)
  assert.equal(openerFocus, 2, 'closing History must restore its still-mounted opener')
  ;(historyOpener as any).isConnected = false
  restoreChatHistoryFocus(historyOpener)
  assert.equal(fallbackFocus, 3, 'closing History must fall back to the unified Ask entry when its opener unmounted')
  focusChatHistoryDeleteConfirmation(deleteConfirm)
  assert.equal(deleteConfirmFocus, 1, 'opening History delete confirmation must focus its primary action')
  restoreChatHistoryDeleteTrigger(() => deleteTrigger)
  assert.equal(deleteTriggerFocus, 1, 'canceling History delete confirmation must restore that row’s delete trigger')
  focusChatHistoryAfterDelete(() => adjacentRow, () => historyClose)
  assert.equal(adjacentRowFocus, 1, 'confirming deletion must focus the adjacent surviving History row')
  ;(adjacentRow as any).isConnected = false
  focusChatHistoryAfterDelete(() => adjacentRow, () => historyClose)
  assert.equal(historyCloseFocus, 2, 'deleting the final row must focus History Close instead of losing focus')
  focusSelectedEventDetail()
  assert.equal(eventBackFocus, 1, 'opening cited news evidence must focus the destination event')
} finally {
  if (priorDocument === undefined) delete (globalThis as any).document
  else (globalThis as any).document = priorDocument
  if (priorRaf === undefined) delete (globalThis as any).requestAnimationFrame
  else (globalThis as any).requestAnimationFrame = priorRaf
}

console.log('Ask entry exclusivity test passed')
