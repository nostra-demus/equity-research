import assert from 'node:assert/strict'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { WatchPlanSection } from './WatchPlan'
import { WatchInbox } from './WatchInbox'
import { useStore } from '../../lib/store'
import type { WatchRow } from '../../lib/types'

const risk = 'Customer loss ends the thesis.'
const row = { watch: { plan: { state: 'ready', items: [{ kind: 'deal_breaker', id: 'kill', text: risk,
  check_where: 'Annual report', source: { file: 'decision_record.json', field: 'kill_criteria[0]', quote: null } }],
  left_out: [], reader: { detail: 'Read.' } } } } as unknown as WatchRow
const planHtml = renderToStaticMarkup(createElement(WatchPlanSection, { row }))
assert.ok(planHtml.includes(risk))
assert.ok(planHtml.includes('decision_record.json · kill_criteria[0]'), 'the material risk names its stored provenance')

const original = React.useSyncExternalStore
;(React as any).useSyncExternalStore = (_subscribe: unknown, snapshot: () => unknown) => snapshot()
try {
  useStore.setState({ staticMode: false, watchMessages: { enabled: true, messages: [], unread: 0 } as any,
    watchMessagesError: 'Network unavailable' })
  const staleHtml = renderToStaticMarkup(createElement(WatchInbox, { onPick: () => {} }))
  assert.ok(staleHtml.includes('Messages, refresh failed'), 'staleness is visible even while the inbox is closed')
  useStore.setState({ watchMessagesError: null })
  const freshHtml = renderToStaticMarkup(createElement(WatchInbox, { onPick: () => {} }))
  assert.ok(!freshHtml.includes('refresh failed'), 'a successful refresh clears the qualifier')
} finally {
  ;(React as any).useSyncExternalStore = original
}
console.log('watch presentation: provenance and failed-refresh qualifiers verified')
