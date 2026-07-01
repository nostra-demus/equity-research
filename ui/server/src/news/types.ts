// Shared shapes for the autonomous news ingester. Kept dependency-free (only built-ins anywhere in
// this module) so the pipeline can be unit-tested by stripping types — no bundler, no install.

// A region tag for the inbox view. The IBKR-tradable markets the engine covers are first-class
// (US, India, Japan, UK, China, South Korea); GLOBAL = wires that aren't one market; OTHER = the rest.
export type Region = 'US' | 'IN' | 'JP' | 'GB' | 'CN' | 'KR' | 'GLOBAL' | 'OTHER'

// The triage band a cheap-LLM score maps to. pick/watch reach the inbox; drop is counted only.
export type Band = 'pick' | 'watch' | 'drop'

// What a source adapter (GDELT or RSS) hands back, before normalization.
export interface RawArticle {
  title: string
  url: string
  domain: string
  seendate: string // GDELT compact form e.g. 20260612T093000Z, or ISO — normalized downstream
  language?: string
  sourcecountry?: string // FIPS 2-letter from GDELT, when present
  via?: 'gdelt' | 'rss' | 'nse' | 'hkex' | 'asx' | 'gov' | 'reddit' // which fetcher found it (provenance for the live feed)
  source_name?: string // adapter-supplied display name (e.g. "Reddit r/Layoffs"); when present, normalize prefers it over the firewall's canonical name (the firewall still gates the domain)
  region?: Region // adapter-supplied region (e.g. a per-subreddit region from reddit_feeds.json); when present, normalize prefers it over the domain registry's region — reddit.com is GLOBAL there, but a US-only subreddit is a US lead. Like source_name, this refines the label only; the firewall still gates the domain.
  snippet?: string // the feed's own description/lede (RSS) — fetch-free article text for enrichment
  caution?: boolean // caution_only social feed (e.g. r/wallstreetbets): crowding/euphoria flag, "weighted lowest" — capped below every other social item (CLAUDE.md §4/§24; reddit_feeds.json / SWARM.md)
}

// A company the cheap brain THINKS the headline is about — a guess from the title alone, never
// verified. The UI must label it as a guess; downstream agents must not treat it as extraction.
export interface CompanyGuess {
  name: string
  ticker: string | null
  listing_country: string | null // 2-letter, when guessed
}

export type SizeBucket = 'mega' | 'large' | 'mid' | 'small' | 'unknown'

// Re-export the scope/source-tier vocabulary so downstream modules import one news surface.
export type { ScopeId, ScopeFamily, SourceTierId } from './scope'

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
  via?: 'gdelt' | 'rss' | 'nse' | 'hkex' | 'asx' | 'gov' | 'reddit' // which fetcher found it
  snippet?: string // the feed's own lede (cleaned), carried for fetch-free enrichment
  caution?: boolean // carried from a caution_only social feed (reddit.ts) so rank/cap can weight it lowest
}

// The cheap brain's verdict on one item.
export interface Triage {
  relevance: 'material' | 'relevant_non_material' | 'irrelevant'
  materiality_pre_score: number // 0–100, an APPROXIMATION of the gauntlet's rubric
  event_types: string[]
  issuer_linkage: 'primary' | 'secondary' | 'sector' | 'macro'
  why: string // one plain sentence, ideally with a number (§21)
  companies: CompanyGuess[] // ≤3, guessed from the headline alone (may be empty)
  size_bucket: SizeBucket // rough size of the main company — a guess, 'unknown' when unsure
  // an English translation of the headline when the original is not English, else null — validated +
  // gated by news/lang.ts before it's stored (the wire shows it).
  headline_en?: string | null
  headline_lang?: string | null // the source language the model named (e.g. "Finnish") — for the "original · X" label
  // the market the event is ABOUT / where the affected, tradable parties are listed or operate — NOT
  // where the news outlet is based. One of the Region enum, or null when unsure. Resolved against the
  // domain region by news/geo.ts (resolveEventRegion) at the merge site, and the result becomes the
  // item's `region` so the Geography filter means "where the event is", not "where it was published".
  event_region?: Region | null
}

export interface TriagedItem extends NewsItem {
  triage_score: number // composite PRIORITY (rank.ts): Groq materiality + §4 source-tier/scope/event/size/recency
  triage_reason: string
  headline_en?: string | null // English translation of a non-English headline (news/lang.ts); null/absent when the original is English
  headline_lang?: string | null // the source language named, for the "original · X" label
  source_region?: Region // the PUBLISHER's region (the domain-registry value) — kept after `region` is overridden with the event region (news/geo.ts), so the override stays debuggable
  relevance: Triage['relevance']
  materiality_pre_score: number // the RAW Groq title read, before the composite re-rank
  event_types: string[]
  issuer_linkage: Triage['issuer_linkage']
  companies: CompanyGuess[]
  size_bucket: SizeBucket
  band: Band
  rank_factors?: import('./rank').RankFactors // the composite-priority breakdown (the WHY)
  via?: 'gdelt' | 'rss' | 'nse' | 'hkex' | 'asx' | 'gov' | 'reddit'
  dedup_group?: string // story-cluster id (news/dedup.ts) — earliest member's event_id; one row per story
}

// The one row the inbox file carries — a superset of the existing sweep-row contract, plus the
// additive triage fields (board_index.schema.json documents them as optional, so this is non-breaking).
export interface InboxRow {
  inbox_id: string
  headline: string
  headline_en?: string | null // English translation of a non-English headline (news/lang.ts) — the cockpit shows it
  headline_lang?: string | null // the source language named, for the "original · X" label
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
  event_types?: string[] // theme tags (the gauntlet's event-type vocabulary)
  issuer_linkage?: Triage['issuer_linkage']
  companies?: CompanyGuess[] // guessed from the headline — the UI labels them as guesses
  size_bucket?: SizeBucket
  scope?: import('./scope').ScopeId // derived company-vs-broad bucket (news/scope.ts)
  source_tier?: import('./scope').SourceTierId // derived §4 source tier
  rank_factors?: import('./rank').RankFactors // composite-priority breakdown (triage_score is the composite)
  dedup_group?: string // story-cluster id (news/dedup.ts) — collapse rows sharing it to one
  // --- additive: human state (set only via the cockpit; merge/eviction must preserve these) ---
  dismissed?: boolean
  dismissed_at?: string
  dismissed_by?: string
}

// One line per TRIAGED item in the firehose (kind:"item") — the live feed's persistent record.
// Written for kept AND dropped items so the wire shows everything the scanner read and why.
// Additive next to kind:"cycle_summary" lines; existing readers filter by kind and ignore these.
export interface FeedItem {
  kind: 'item'
  ts: string // ISO 8601 — when triaged
  event_id: string
  headline: string
  headline_en?: string | null // English translation of a non-English headline (news/lang.ts); absent/null when the original is English
  headline_lang?: string | null // the source language named, for the "original · X" label
  url: string
  domain: string
  source_name: string
  via: 'gdelt' | 'rss' | 'nse' | 'hkex' | 'asx' | 'gov' | 'reddit'
  region: Region // the EVENT's market (news/geo.ts resolveEventRegion) — the legacy 8-bucket region, kept for trading-market logic + as a coarse floor
  source_region?: Region // the PUBLISHER's region (domain registry) — present when it differs from the resolved event region; absent on older lines / when they match
  // The EVENT's country (ISO 3166-1 alpha-2, news/geography.ts resolveCountry) — the country-level
  // Geography filter's key. Present on fresh items; re-derived on read for older lines (feed.ts withGeo).
  // null/absent when no confident signal ("Global / unspecified") — honest, never a forced bucket.
  country?: string | null
  // --- additive: the Globe view's MULTI-country geography read (news/geography.ts resolveEventGeography).
  //     Distinct from `country` above: this can hold more than one code (e.g. a US-Iran sanctions headline
  //     resolves to both), which is what lets the globe light up every country a story is actually about,
  //     not just the single most-confident one. Present on fresh items; backfilled on read for older lines
  //     that predate it (feed.ts hydrate()). Undefined on old lines only until that backfill runs. ---
  geography_country?: string[] // ISO alpha-2, deduped; [] = unresolved/global (never a forced guess)
  geography_region?: import('./geography').GeoRegion | 'Global' | null // the continent roll-up, or 'Global' when unresolved
  event_location_confidence?: 'high' | 'medium' | 'low' // how the geography read was reached
  geography_reason?: string // plain-English audit trail: which step resolved it (or why nothing did)
  input_nature: string
  triage_score: number
  band: Band
  triage_reason: string
  relevance: Triage['relevance']
  event_types: string[]
  issuer_linkage: Triage['issuer_linkage']
  companies: CompanyGuess[]
  size_bucket: SizeBucket
  // --- additive: derived, zero-cost classification (news/scope.ts) — present on fresh items;
  //     backfilled on read for older firehose lines that predate it (feed.ts) ---
  scope?: import('./scope').ScopeId // company-vs-broad bucket the cockpit filters + chips on
  source_tier?: import('./scope').SourceTierId // §4 source hierarchy, made visible
  snippet?: string // the feed's own lede — fetch-free body the enrichment reads when the page blocks
  rank_factors?: import('./rank').RankFactors // composite-priority breakdown (triage_score is the composite)
  dedup_status: 'new' | 'possible_duplicate'
  dedup_group?: string // story-cluster id (news/dedup.ts) — earliest member's event_id; one row per story
  inboxed: boolean // band !== 'drop'
  caution?: boolean // caution_only social item (r/wallstreetbets): weighted lowest, capped to drop on the display re-rank too (feed.ts)
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
  gemini_requests?: number // batches that overflowed to the Gemini free-tier provider (0 / absent when unused)
  gemini_tokens?: number
  overflow_requests?: number // batches that overflowed to the OpenAI-compatible registry (OpenRouter, NVIDIA, …)
  overflow_tokens?: number
  note?: string // a human-readable reason when ok=false or a cap was hit
}
