// Shared, explainable retrieval for every engine surface.
//
// This is deliberately deterministic and provider-free. It combines five independent signals:
// exact words/phrases, conservative concept aliases, word stems, bounded typo rescue, and BM25-style
// term rarity. The final order uses reciprocal-rank fusion (RRF), so one large score cannot drown out a
// document found strongly by another channel. Callers add their own authority/materiality score as the
// fifth channel. No matched text becomes a fact by itself; downstream answers still cite the source.

export interface ConceptGroup {
  id: string
  terms: string[]
}

export interface HybridQueryOptions {
  stopWords?: Iterable<string>
  metricTerms?: Iterable<string>
  concepts?: ConceptGroup[]
  maxTerms?: number
  terms?: string[]
  forcedAnchors?: string[]
}

interface QueryTerm {
  term: string
  anchor: boolean
  variants: { text: string; tokens: string[]; kind: 'alias' }[]
}

export interface HybridQuery {
  text: string
  terms: string[]
  anchors: string[]
  expandedTerms: Record<string, string[]>
  phrases: string[]
  plans: QueryTerm[]
}

export interface HybridField {
  name: string
  text: string | string[] | null | undefined
  weight?: number
  fuzzy?: boolean
}

export interface HybridDocument<T> {
  id: string
  value: T
  fields: HybridField[]
  quality?: number
  groupId?: string
}

export type MatchKind = 'exact' | 'alias' | 'stem' | 'fuzzy'

export interface HybridMatch {
  qualifies: boolean
  matchedTerms: string[]
  exactTerms: string[]
  anchorMatches: number
  exactAnchorMatches: number
  phraseMatches: number
  kinds: MatchKind[]
  reasons: string[]
  termFrequency: Record<string, number>
  documentLength: number
  exactScore: number
  recallScore: number
}

export interface HybridHit<T> {
  document: HybridDocument<T>
  match: HybridMatch
  score: number
  bm25Score: number
  channelRanks: Partial<Record<'exact' | 'bm25' | 'recall' | 'quality', number>>
}

const tokenPattern = /[\p{L}\p{N}][\p{L}\p{N}.+&'-]*/gu

export function normalizeRetrievalText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[’]/g, "'")
}

export function retrievalTokens(value: unknown): string[] {
  return (normalizeRetrievalText(value).match(tokenPattern) || [])
    .map((token) => token.replace(/^[.'+-]+|[.'+-]+$/g, ''))
    .filter((token) => token.length >= 2)
}

function stem(token: string): string {
  if (token.length <= 4 || /[0-9]/.test(token)) return token
  if (token.endsWith('ies') && token.length > 5) return `${token.slice(0, -3)}y`
  if (token.endsWith('ing') && token.length > 6) {
    let base = token.slice(0, -3)
    if (base.length > 3 && base.at(-1) === base.at(-2)) base = base.slice(0, -1)
    return base
  }
  if (token.endsWith('ed') && token.length > 5) {
    let base = token.slice(0, -2)
    if (base.length > 3 && base.at(-1) === base.at(-2)) base = base.slice(0, -1)
    return base
  }
  if (token.endsWith('es') && token.length > 6 && /(ses|xes|zes|ches|shes)$/.test(token)) return token.slice(0, -2)
  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 5) return token.slice(0, -1)
  return token
}

function containsSequence(tokens: string[], wanted: string[]): boolean {
  if (!wanted.length || wanted.length > tokens.length) return false
  outer: for (let i = 0; i <= tokens.length - wanted.length; i++) {
    for (let j = 0; j < wanted.length; j++) if (tokens[i + j] !== wanted[j]) continue outer
    return true
  }
  return false
}

function countToken(tokens: string[], wanted: string): number {
  let count = 0
  for (const token of tokens) if (token === wanted) count++
  return count
}

function boundedDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const n = Math.min(next[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      next.push(n)
      if (n < rowMin) rowMin = n
    }
    if (rowMin > max) return max + 1
    prev = next
  }
  return prev[b.length]
}

function fuzzyToken(query: string, tokens: string[]): string | null {
  if (query.length < 5 || /[0-9]/.test(query)) return null
  const max = query.length >= 9 ? 2 : 1
  for (const token of tokens) {
    if (token.length < 5 || token[0] !== query[0] || Math.abs(token.length - query.length) > max) continue
    if (boundedDistance(query, token, max) <= max) return token
  }
  return null
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

export function buildHybridQuery(text: string, opts: HybridQueryOptions = {}): HybridQuery {
  const stop = new Set([...opts.stopWords || []].map((x) => normalizeRetrievalText(x)))
  const metric = new Set([...opts.metricTerms || []].map((x) => normalizeRetrievalText(x)))
  const raw = opts.terms || retrievalTokens(text)
  const terms: string[] = []
  for (const token of raw.map((x) => normalizeRetrievalText(x))) {
    if (!token || stop.has(token) || /^[\d.+-]+$/.test(token) || terms.includes(token)) continue
    terms.push(token)
    if (terms.length >= (opts.maxTerms || 12)) break
  }
  const forced = opts.forcedAnchors ? new Set(opts.forcedAnchors.map((x) => normalizeRetrievalText(x))) : null
  const anchors = terms.filter((term) => forced ? forced.has(term) : !metric.has(term))
  const queryTokenList = retrievalTokens(text)
  const plans = terms.map((term) => ({ term, anchor: anchors.includes(term), variants: [] as QueryTerm['variants'] }))
  const expandedTerms: Record<string, string[]> = {}

  for (const group of opts.concepts || []) {
    const variants = unique((group.terms || []).map((x) => retrievalTokens(x).join(' '))).filter(Boolean)
    if (variants.length < 2) continue
    const matched = variants.find((variant) => containsSequence(queryTokenList, variant.split(' ')))
    if (!matched) continue
    const matchedTokens = matched.split(' ')
    const owner = plans.find((plan) => matchedTokens.includes(plan.term))
    if (!owner) continue
    for (const variant of variants) {
      if (variant === matched || owner.variants.some((v) => v.text === variant)) continue
      owner.variants.push({ text: variant, tokens: variant.split(' '), kind: 'alias' })
    }
    if (owner.variants.length) expandedTerms[owner.term] = owner.variants.map((v) => v.text)
  }

  const phrases: string[] = []
  for (let i = 0; i < terms.length - 1; i++) phrases.push(`${terms[i]} ${terms[i + 1]}`)
  return { text, terms, anchors, expandedTerms, phrases, plans }
}

interface FieldView {
  name: string
  tokens: string[]
  weight: number
  fuzzy: boolean
}

export function matchHybridDocument<T>(query: HybridQuery, document: HybridDocument<T>): HybridMatch {
  const views: FieldView[] = document.fields.map((field) => ({
    name: field.name,
    tokens: retrievalTokens(Array.isArray(field.text) ? field.text.join(' ') : field.text),
    weight: Math.max(0.1, field.weight || 1),
    fuzzy: field.fuzzy === true,
  }))
  const matchedTerms: string[] = []
  const exactTerms: string[] = []
  const reasons: string[] = []
  const kinds = new Set<MatchKind>()
  const termFrequency: Record<string, number> = {}
  let exactScore = 0
  let recallScore = 0

  for (const plan of query.plans) {
    let matched = false
    let exact = false
    let tf = 0
    for (const field of views) {
      const count = countToken(field.tokens, plan.term)
      if (count > 0) {
        matched = true
        exact = true
        tf += count * field.weight
        exactScore += Math.min(3, count) * field.weight * (plan.anchor ? 2.2 : 1)
      }
    }
    if (exact) {
      exactTerms.push(plan.term)
      reasons.push(`exact:${plan.term}`)
      kinds.add('exact')
    }

    if (!matched) {
      const wantedStem = stem(plan.term)
      let stemHit: string | null = null
      for (const field of views) {
        const hit = field.tokens.find((token) => token !== plan.term && stem(token) === wantedStem)
        if (!hit) continue
        stemHit = hit
        tf += field.weight * 0.7
        recallScore += field.weight * 1.5
        break
      }
      if (stemHit) {
        matched = true
        reasons.push(`stem:${plan.term}→${stemHit}`)
        kinds.add('stem')
      }
    }

    if (!matched && plan.variants.length) {
      let aliasHit: string | null = null
      for (const variant of plan.variants) {
        for (const field of views) {
          if (!containsSequence(field.tokens, variant.tokens)) continue
          aliasHit = variant.text
          tf += field.weight * 0.85
          recallScore += field.weight * 3
          break
        }
        if (aliasHit) break
      }
      if (aliasHit) {
        matched = true
        reasons.push(`alias:${plan.term}→${aliasHit}`)
        kinds.add('alias')
      }
    }

    if (!matched && plan.anchor) {
      let typo: string | null = null
      for (const field of views) {
        if (!field.fuzzy) continue
        typo = fuzzyToken(plan.term, unique(field.tokens))
        if (typo) {
          tf += field.weight * 0.5
          recallScore += field.weight
          break
        }
      }
      if (typo) {
        matched = true
        reasons.push(`fuzzy:${plan.term}→${typo}`)
        kinds.add('fuzzy')
      }
    }

    if (matched) {
      matchedTerms.push(plan.term)
      termFrequency[plan.term] = Math.max(0.1, tf)
    }
  }

  const allTokens = views.flatMap((field) => field.tokens)
  let phraseMatches = 0
  for (const phrase of query.phrases) {
    const wanted = phrase.split(' ')
    if (views.some((field) => containsSequence(field.tokens, wanted))) phraseMatches++
  }
  exactScore += phraseMatches * 12
  const matched = new Set(matchedTerms)
  const exactSet = new Set(exactTerms)
  const anchorMatches = query.anchors.filter((term) => matched.has(term)).length
  const exactAnchorMatches = query.anchors.filter((term) => exactSet.has(term)).length
  const qualifies = query.terms.length === 0 || (query.anchors.length ? anchorMatches > 0 : matchedTerms.length > 0)
  recallScore += query.terms.length ? (matchedTerms.length / query.terms.length) * 10 : 0
  if (query.anchors.length && anchorMatches === query.anchors.length) recallScore += 18

  return {
    qualifies,
    matchedTerms,
    exactTerms,
    anchorMatches,
    exactAnchorMatches,
    phraseMatches,
    kinds: [...kinds],
    reasons,
    termFrequency,
    documentLength: Math.max(1, allTokens.length),
    exactScore,
    recallScore,
  }
}

interface Candidate<T> {
  document: HybridDocument<T>
  match: HybridMatch
  bm25Score: number
  score: number
  channelRanks: HybridHit<T>['channelRanks']
}

export class HybridCollector<T> {
  readonly query: HybridQuery
  private readonly candidates: Candidate<T>[] = []
  private readonly documentFrequency = new Map<string, number>()
  private totalLength = 0
  private seen = 0

  constructor(query: HybridQuery) {
    this.query = query
  }

  add(document: HybridDocument<T>): HybridMatch {
    const match = matchHybridDocument(this.query, document)
    this.seen++
    this.totalLength += match.documentLength
    for (const term of match.matchedTerms) this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1)
    if (match.qualifies) this.candidates.push({ document, match, bm25Score: 0, score: 0, channelRanks: {} })
    return match
  }

  get documentsSeen(): number { return this.seen }
  get candidatesMatched(): number { return this.candidates.length }

  results(limit = 100, rankWindow = 500): HybridHit<T>[] {
    if (!this.candidates.length) return []
    // `results` may be called more than once (for receipts, previews, and the final prompt). Rebuild the
    // fused score each time so reading results never changes the next result order.
    for (const row of this.candidates) {
      row.score = 0
      row.channelRanks = {}
    }
    const avgLength = Math.max(1, this.totalLength / Math.max(1, this.seen))
    const k1 = 1.2
    const b = 0.75
    for (const row of this.candidates) {
      let score = 0
      for (const [term, tf] of Object.entries(row.match.termFrequency)) {
        const df = this.documentFrequency.get(term) || 0
        const idf = Math.log(1 + (this.seen - df + 0.5) / (df + 0.5))
        const norm = tf + k1 * (1 - b + b * row.match.documentLength / avgLength)
        score += idf * ((tf * (k1 + 1)) / Math.max(0.0001, norm))
      }
      row.bm25Score = score
    }

    const channels: { key: keyof Candidate<T>; name: keyof HybridHit<T>['channelRanks']; weight: number }[] = [
      { key: 'match', name: 'exact', weight: 1.35 },
      { key: 'bm25Score', name: 'bm25', weight: 1.2 },
      { key: 'match', name: 'recall', weight: 1.0 },
      { key: 'document', name: 'quality', weight: 0.7 },
    ]
    const valueFor = (row: Candidate<T>, name: keyof HybridHit<T>['channelRanks']): number => {
      if (name === 'exact') return row.match.exactScore
      if (name === 'bm25') return row.bm25Score
      if (name === 'recall') return row.match.recallScore
      return Number(row.document.quality || 0)
    }
    const rrfConstant = 60
    for (const channel of channels) {
      const ordered = this.candidates.slice().sort((a, bRow) => valueFor(bRow, channel.name) - valueFor(a, channel.name) || String(a.document.id).localeCompare(String(bRow.document.id)))
      for (let i = 0; i < Math.min(rankWindow, ordered.length); i++) {
        const row = ordered[i]
        row.channelRanks[channel.name] = i + 1
        row.score += channel.weight / (rrfConstant + i + 1)
      }
    }
    return this.candidates
      .slice()
      // Named-subject coverage is the hard relevance gate. A story matching Amazon + Bedrock must not
      // sit below a high-scoring story that only says Amazon. Fusion decides the order within that gate.
      .sort((a, bRow) => bRow.match.anchorMatches - a.match.anchorMatches || bRow.score - a.score || bRow.match.exactAnchorMatches - a.match.exactAnchorMatches || String(a.document.id).localeCompare(String(bRow.document.id)))
      .slice(0, limit)
      .map((row) => ({ document: row.document, match: row.match, score: row.score, bm25Score: row.bm25Score, channelRanks: row.channelRanks }))
  }
}

export interface RecallCase {
  id: string
  query: string
  relevantIds: string[]
}

export interface RecallReport {
  cases: number
  recallAtK: number
  found: number
  expected: number
  misses: { caseId: string; documentId: string }[]
}

export function evaluateRecall<T>(
  documents: HybridDocument<T>[],
  cases: RecallCase[],
  queryOptions: HybridQueryOptions,
  k = 10,
): RecallReport {
  let found = 0
  let expected = 0
  const misses: RecallReport['misses'] = []
  for (const test of cases) {
    const collector = new HybridCollector<T>(buildHybridQuery(test.query, queryOptions))
    for (const document of documents) collector.add(document)
    const got = new Set(collector.results(k).map((hit) => hit.document.id))
    for (const id of test.relevantIds) {
      expected++
      if (got.has(id)) found++
      else misses.push({ caseId: test.id, documentId: id })
    }
  }
  return { cases: cases.length, recallAtK: expected ? found / expected : 1, found, expected, misses }
}
