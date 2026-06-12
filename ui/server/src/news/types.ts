// Shared shapes for the autonomous news ingester. Kept dependency-free (only built-ins anywhere in
// this module) so the pipeline can be unit-tested by stripping types — no bundler, no install.

// A region tag for the inbox view — coarse on purpose (the user asked for global / US / India).
export type Region = 'US' | 'IN' | 'GLOBAL' | 'OTHER'

// The triage band a cheap-LLM score maps to. pick/watch reach the inbox; drop is counted only.
export type Band = 'pick' | 'watch' | 'drop'

// What a source adapter (GDELT today) hands back, before normalization.
export interface RawArticle {
  title: string
  url: string
  domain: string
  seendate: string // GDELT compact form e.g. 20260612T093000Z, or ISO — normalized downstream
  language?: string
  sourcecountry?: string // FIPS 2-letter from GDELT, when present
}

// A normalized, on-list, deduped article ready for triage.
export interface NewsItem {
  event_id: string // EVT-<sha256-12 of normalized headline | url> — the screener's dedup identity
  headline: string
  url: string
  domain: string
  source_name: string // canonical approved-source name (Reuters, The Economic Times, …)
  region: Region
  input_nature: string // news_headline / regulatory_filing / exchange_announcement / …
  found_at: string // ISO 8601
  dedup_status: 'new' | 'possible_duplicate'
}

// The cheap brain's verdict on one item.
export interface Triage {
  relevance: 'material' | 'relevant_non_material' | 'irrelevant'
  materiality_pre_score: number // 0–100, an APPROXIMATION of the gauntlet's rubric
  event_types: string[]
  issuer_linkage: 'primary' | 'secondary' | 'sector' | 'macro'
  why: string // one plain sentence, ideally with a number (§21)
}

export interface TriagedItem extends NewsItem {
  triage_score: number
  triage_reason: string
  relevance: Triage['relevance']
  materiality_pre_score: number
  event_types: string[]
  issuer_linkage: Triage['issuer_linkage']
  band: Band
}

// The one row the inbox file carries — a superset of the existing sweep-row contract, plus the
// additive triage fields (board_index.schema.json documents them as optional, so this is non-breaking).
export interface InboxRow {
  inbox_id: string
  headline: string
  url: string
  source_name: string
  input_nature: string
  found_at: string
  prelim_note: string
  dedup_status: 'new' | 'possible_duplicate'
  consumed: boolean
  launched_signal_id: string | null
  // --- additive: the autonomous ingester's pre-triage ---
  triage_score?: number
  triage_reason?: string
  region?: Region
  relevance?: Triage['relevance']
  materiality_pre_score?: number
}

// One ingest cycle's outcome — returned to the caller and logged as a firehose summary line.
export interface CycleSummary {
  ts: string
  ok: boolean
  fetched: number // raw articles pulled from the firehose
  candidates: number // new, on-list, not-already-seen items sent to triage
  picked: number // band=pick (score ≥ pick threshold)
  watched: number // band=watch
  dropped: number // band=drop (not inboxed)
  inboxed: number // total rows the inbox now holds after the merge
  groq_requests: number
  groq_tokens: number
  note?: string // a human-readable reason when ok=false or a cap was hit
}
