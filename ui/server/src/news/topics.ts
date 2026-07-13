// CapIQ-style NEWS TOPIC overlay — the SUBJECT axis of the wire, distinct from the corporate-action
// axis (event_types, news/triage) and the industry axis (GICS sectors, news/gics). Capital IQ's news
// tree carries ~80 cross-cutting topics (Artificial Intelligence, Blockchain, Cybersecurity, ESG,
// Electric Vehicles, Supply Shortages, Corruption/Fraud, …). This module reproduces the high-value,
// reliably-detectable subset as a DETERMINISTIC, dependency-free tagger — the same design as
// news/scope.ts: it derives from the headline text with a boundary-safe matcher, so every item already
// on disk (the whole firehose backlog) is tagged at zero token cost, and a fresh item the same way.
//
// A topic is a SUBJECT ("this story is about AI / about cybersecurity"), which is orthogonal to what
// KIND of event it is (an M&A vs a guidance cut) and to WHICH industry the issuer sits in. All three
// can apply at once: "Nvidia guides Q3 revenue up on AI-datacenter demand" is event_type
// guidance_change + GICS Semiconductors + topics [artificial_intelligence, semiconductors, data_center].
// Multilabel by design; empty when the headline names no tracked subject.

import { hasTerm } from './scope'

export type TopicId =
  | 'artificial_intelligence'
  | 'semiconductors'
  | 'data_center'
  | 'cybersecurity'
  | 'crypto_blockchain'
  | 'electric_vehicles'
  | 'clean_energy_climate'
  | 'supply_chain'
  | 'financial_crime'
  | 'healthcare_pharma'
  | 'sanctions_trade'
  | 'space'

export interface TopicDef {
  id: TopicId
  /** short chip label (Title Case, scannable) */
  label: string
  /** one plain sentence: what the topic means for a buy-side reader (CLAUDE.md §21) */
  meaning: string
}

// Ordered by rough market salience — the AI/compute cluster first, then the rest.
export const TOPICS: Record<TopicId, TopicDef> = {
  artificial_intelligence: { id: 'artificial_intelligence', label: 'AI', meaning: 'About artificial intelligence — models, AI products, or AI-driven demand.' },
  semiconductors: { id: 'semiconductors', label: 'Semiconductors', meaning: 'About chips — designers, foundries, equipment, or supply of them.' },
  data_center: { id: 'data_center', label: 'Data centres', meaning: 'About data-centre / cloud capacity build-out and the power and hardware it pulls in.' },
  cybersecurity: { id: 'cybersecurity', label: 'Cybersecurity', meaning: 'A hack, breach, ransomware or other security incident, or the firms that defend against them.' },
  crypto_blockchain: { id: 'crypto_blockchain', label: 'Crypto', meaning: 'About cryptocurrency or blockchain — coins, tokens, exchanges, or stablecoins.' },
  electric_vehicles: { id: 'electric_vehicles', label: 'EVs', meaning: 'About electric vehicles — makers, sales, batteries, or charging.' },
  clean_energy_climate: { id: 'clean_energy_climate', label: 'Energy transition', meaning: 'About decarbonisation, renewables, emissions, or ESG — the shift away from fossil fuels.' },
  supply_chain: { id: 'supply_chain', label: 'Supply chain', meaning: 'A supply-chain disruption or shortage — the availability and flow of inputs.' },
  financial_crime: { id: 'financial_crime', label: 'Fraud / crime', meaning: 'Fraud, bribery, money laundering, or a corporate scandal — an integrity concern (CLAUDE.md §24).' },
  healthcare_pharma: { id: 'healthcare_pharma', label: 'Healthcare', meaning: 'A drug trial, approval, or other clinical / pharma development.' },
  sanctions_trade: { id: 'sanctions_trade', label: 'Trade / sanctions', meaning: 'Tariffs, sanctions, export controls or a trade dispute — the rules of cross-border trade.' },
  space: { id: 'space', label: 'Space', meaning: 'About the space economy — satellites, launch, or orbital infrastructure.' },
}

export const TOPIC_ORDER: TopicId[] = [
  'artificial_intelligence', 'semiconductors', 'data_center', 'cybersecurity', 'crypto_blockchain',
  'electric_vehicles', 'clean_energy_climate', 'supply_chain', 'financial_crime', 'healthcare_pharma',
  'sanctions_trade', 'space',
]

// Boundary-safe keyword lexicons (lowercased). Terms are matched by news/scope.ts's `hasTerm`, which
// requires an alphanumeric boundary on BOTH sides — so 'ai' fires on the standalone token "AI" but never
// inside "email"/"Dubai"/"said", and 'ev' fires on "EV" but never inside "seven"/"level". Deliberately
// TIGHT: single-word terms are only included where the token is overwhelmingly the subject in a
// financial-news context; ambiguous words (a bare 'breach' = a covenant breach; a bare 'chip' = a poker
// chip) are excluded in favour of multi-word anchors.
const TOPIC_TERMS: Record<TopicId, string[]> = {
  artificial_intelligence: [
    'ai', 'a.i.', 'artificial intelligence', 'generative ai', 'gen ai', 'genai', 'machine learning',
    'large language model', 'large language models', 'llm', 'llms', 'chatbot', 'chatgpt', 'copilot',
    'inference chip', 'ai model', 'ai models',
  ],
  semiconductors: [
    'semiconductor', 'semiconductors', 'chipmaker', 'chipmakers', 'chip maker', 'foundry', 'foundries',
    'wafer', 'wafers', 'fab', 'fabs', 'lithography', 'euv', 'node chip', 'silicon wafer',
  ],
  data_center: [
    'data center', 'data centre', 'data centers', 'data centres', 'datacenter', 'datacentre',
    'hyperscaler', 'hyperscalers', 'cloud capacity', 'server farm',
  ],
  cybersecurity: [
    'cyberattack', 'cyber attack', 'cyberattacks', 'cybersecurity', 'cyber security', 'ransomware',
    'malware', 'data breach', 'data leak', 'hacked', 'hackers', 'phishing', 'ddos', 'zero-day',
  ],
  crypto_blockchain: [
    'bitcoin', 'ethereum', 'cryptocurrency', 'cryptocurrencies', 'crypto', 'blockchain', 'stablecoin',
    'stablecoins', 'defi', 'nft', 'nfts', 'digital asset', 'digital assets', 'tokenisation', 'tokenization',
  ],
  electric_vehicles: [
    'electric vehicle', 'electric vehicles', 'ev', 'evs', 'e.v.', 'ev sales', 'ev maker', 'ev makers',
    'battery electric', 'plug-in hybrid', 'charging network', 'ev battery', 'ev demand',
  ],
  clean_energy_climate: [
    'net zero', 'net-zero', 'decarbonisation', 'decarbonization', 'greenhouse', 'carbon emissions',
    'climate change', 'renewable energy', 'renewables', 'solar power', 'wind power', 'clean energy',
    'esg', 'sustainability', 'emissions cut', 'green hydrogen',
  ],
  supply_chain: [
    'supply chain', 'supply-chain', 'supply shortage', 'chip shortage', 'component shortage',
    'shortage', 'shortages', 'bottleneck', 'bottlenecks', 'stockpile', 'logjam', 'export curb',
  ],
  financial_crime: [
    'fraud', 'bribery', 'corruption', 'money laundering', 'embezzlement', 'ponzi', 'insider trading',
    'accounting scandal', 'kickback', 'kickbacks', 'graft',
  ],
  healthcare_pharma: [
    'fda approval', 'clinical trial', 'clinical trials', 'drug approval', 'phase 3', 'phase iii',
    'phase 2', 'gene therapy', 'biosimilar', 'vaccine', 'oncology drug', 'clinical-stage',
  ],
  sanctions_trade: [
    'sanction', 'sanctions', 'tariff', 'tariffs', 'trade war', 'export ban', 'export control',
    'export controls', 'import ban', 'embargo', 'trade dispute', 'anti-dumping',
  ],
  space: [
    'satellite', 'satellites', 'spacecraft', 'rocket launch', 'space station', 'low earth orbit',
    'reusable rocket', 'space mission',
  ],
}

/** Tag an item with 0+ subject topics from its headline. Scans the English translation when present, so
 *  a foreign-language story is tagged by the same English lexicons as an English one (news/scope.ts does
 *  the same). Deterministic, dependency-free, order-stable (TOPIC_ORDER). */
export function deriveTopics(it: { headline?: string | null; headline_en?: string | null }): TopicId[] {
  const raw = (it.headline_en && it.headline_en.trim()) || it.headline || ''
  const hay = ' ' + String(raw).toLowerCase() + ' '
  const out: TopicId[] = []
  for (const id of TOPIC_ORDER) {
    if (TOPIC_TERMS[id].some((t) => hasTerm(hay, t))) out.push(id)
  }
  return out
}

/** The plain-English label for a topic id (falls back to the id if unknown). */
export function topicLabel(id: string): string {
  return (TOPICS as Record<string, TopicDef>)[id]?.label ?? id
}
