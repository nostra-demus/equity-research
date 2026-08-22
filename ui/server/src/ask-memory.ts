import type { ConversationMemoryMatch } from './chat-store'
import type { NewsChatContext } from './news/chat'

export type AskMemoryMode = 'auto' | 'run' | 'news'

export interface AskMemoryRoute {
  mode: AskMemoryMode
  useNews: boolean
  useHistory: boolean
  historyIntent: boolean
  reason: string
}

export interface AskMemoryPromptContext {
  route: AskMemoryRoute
  news?: NewsChatContext
  priorChats: ConversationMemoryMatch[]
}

export interface AskMemoryMeta {
  kind: 'ask-memory'
  mode: AskMemoryMode
  reason: string
  shelves: { kind: 'run' | 'news' | 'chats'; label: string; count: number }[]
  newsEvidence?: NewsChatContext['evidence']
}

const FRESHNESS = /\b(today|tonight|yesterday|latest|recent|recently|new|news|wire|headline|event|update|updated|changed|change|since|now|current|currently|this week|last week|catalyst|announcement|filing|reported|happened)\b/i
const HISTORY = /\b(earlier|before|previous|previously|last time|we discussed|we said|i asked|my view|my question|conversation|chat|remember|recall)\b/i

// Auto is deterministic and inspectable. A Screener signal begins with an event, so its normal questions
// need the saved wire. Research questions stay on the frozen run unless the wording asks for freshness.
// History search is cheap and user-local, so Auto always checks it and includes only scored matches.
export function routeAskMemory(question: string, swarm: string, mode: AskMemoryMode = 'auto'): AskMemoryRoute {
  if (mode === 'run') return { mode, useNews: false, useHistory: false, historyIntent: false, reason: 'Manual override: this run only.' }
  if (mode === 'news') return { mode, useNews: true, useHistory: true, historyIntent: false, reason: 'Manual override: include the saved news wire and earlier chats.' }
  const freshness = FRESHNESS.test(question)
  const history = HISTORY.test(question)
  const screener = swarm === 'screener'
  const reasons = [
    screener ? 'this is a Screener signal' : '',
    freshness ? 'the question asks what is new or changed' : '',
    history ? 'the question refers to earlier work' : '',
  ].filter(Boolean)
  return {
    mode,
    useNews: screener || freshness,
    useHistory: true,
    historyIntent: history,
    reason: reasons.length ? `Auto: ${reasons.join('; ')}.` : 'Auto: the current run is enough; earlier chats are checked for a useful match.',
  }
}

export function askMemoryMeta(label: string, context: AskMemoryPromptContext): AskMemoryMeta {
  const shelves: AskMemoryMeta['shelves'] = [{ kind: 'run', label, count: 1 }]
  if (context.news?.present) shelves.push({ kind: 'news', label: 'saved news', count: context.news.evidence.length })
  if (context.priorChats.length) shelves.push({ kind: 'chats', label: 'earlier chats', count: context.priorChats.length })
  return {
    kind: 'ask-memory',
    mode: context.route.mode,
    reason: context.route.reason,
    shelves,
    ...(context.news?.present ? { newsEvidence: compactNewsEvidence(context.news.evidence) } : {}),
  }
}

// Persist/display only the provenance fields Ask needs. The retrieval prompt still sees the full rows, but
// a long snippet/rank-factor payload must not make an otherwise valid conversation receipt exceed History's
// bounded metadata allowance.
export function compactNewsEvidence(evidence: NewsChatContext['evidence']): NewsChatContext['evidence'] {
  return evidence.slice(0, 20).map((row) => ({
    ref: row.ref,
    historical: row.historical,
    whyMatched: row.whyMatched,
    item: {
      kind: 'item', ts: row.item.ts, found_at: row.item.found_at, event_id: row.item.event_id,
      headline: row.item.headline, headline_en: row.item.headline_en, url: row.item.url,
      domain: row.item.domain, source_name: row.item.source_name, via: row.item.via, region: row.item.region,
      input_nature: row.item.input_nature, triage_score: row.item.triage_score, band: row.item.band,
      triage_reason: row.item.triage_reason, relevance: row.item.relevance, event_types: row.item.event_types,
      issuer_linkage: row.item.issuer_linkage, companies: row.item.companies, size_bucket: row.item.size_bucket,
      dedup_status: row.item.dedup_status, inboxed: row.item.inboxed,
    },
  }))
}

export function priorChatMemoryBlock(matches: ConversationMemoryMatch[]): string {
  return matches.map((match, index) => [
    `[C${index + 1}] ${match.title} · ${match.subject} · ${new Date(match.updatedAt).toISOString().slice(0, 10)}`,
    match.snippet,
  ].join('\n')).join('\n\n')
}
