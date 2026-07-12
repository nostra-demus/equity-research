// Client mirror of the server's CapIQ-style subject-topic LABELS (server: ui/server/src/news/topics.ts
// TOPICS[id].label). The server tags each wire item with topic IDs (news/topics.ts deriveTopics); the
// client needs the plain names to render them as chips. Ids are the server TopicId — keep this map in
// lockstep with the server labels (short, stable strings; they rarely change). The facets API also
// carries {key,label} for the filter dropdown, so this map is only needed for per-item chips.
export const TOPIC_LABELS: Record<string, string> = {
  artificial_intelligence: 'AI',
  semiconductors: 'Semiconductors',
  data_center: 'Data centres',
  cybersecurity: 'Cybersecurity',
  crypto_blockchain: 'Crypto',
  electric_vehicles: 'EVs',
  clean_energy_climate: 'Energy transition',
  supply_chain: 'Supply chain',
  financial_crime: 'Fraud / crime',
  healthcare_pharma: 'Healthcare',
  sanctions_trade: 'Trade / sanctions',
  space: 'Space',
}

/** Plain label for a topic id (falls back to the id, so an unknown/newer topic still renders readably). */
export const topicLabel = (id: string): string => TOPIC_LABELS[id] ?? id
