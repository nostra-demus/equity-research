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
import type { EventScope } from './scope'
export type { ScopeId, ScopeFamily, SourceTierId, EventScope } from './scope'

// The event-materiality classifier's vocabulary (news/rank.ts deriveMaterialityLabel, news/scope.ts
// toEventScope). event_materiality_label is the FINAL, score-consistent tier (re-derived from the
// boosted triage_score downstream of Triage — never the raw LLM guess) once it reaches TriagedItem and
// beyond; on Triage itself it is the model's own raw, independent severity call (an input to the
// floor-boost in rank.ts, not yet reconciled with the numeric score).
export type EventMaterialityLabel = 'low' | 'medium' | 'high' | 'critical'
// Sentiment/impact direction — informational only, never used to adjust materiality (a profit warning
// is exactly as material as a beat; direction must not bias the score).
export type EventDirection = 'positive' | 'negative' | 'mixed' | 'neutral' | 'unknown'

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
  // the model's OWN raw severity call, independent of materiality_pre_score — used downstream
  // (news/rank.ts materialityLabelBoost) to lift the numeric score when the model recognizes a
  // critical/high event but its own granular number undershoots it. Not yet reconciled with the
  // score — see EventMaterialityLabel's doc comment.
  event_materiality_label: EventMaterialityLabel
  event_direction: EventDirection // sentiment/impact direction — informational only
  why: string // one plain sentence, ideally with a number (§21)
  companies: CompanyGuess[] // ≤3, guessed from the headline alone (may be empty)
  size_bucket: SizeBucket // rough size of the main company — a guess, 'unknown' when unsure
  // an English translation of the headline when the original is not English, else null — validated +
  // gated by news/lang.ts before it's stored (the wire shows it).
  headline_en?: string | null
  headline_lang?: string | null // the source language the model named (e.g. "Finnish") — for the "original · X" label
  /** Positive, model-contract proof that the original source headline was English. Missing is unknown,
   * not English: old Latin-script rows cannot safely open a human-veto revision exception. */
  source_is_english?: true
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
  source_is_english?: true // positive proof from an explicit null translation/language triage response
  source_region?: Region // the PUBLISHER's region (the domain-registry value) — kept after `region` is overridden with the event region (news/geo.ts), so the override stays debuggable
  relevance: Triage['relevance']
  materiality_pre_score: number // the RAW Groq title read, before the composite re-rank
  event_types: string[]
  issuer_linkage: Triage['issuer_linkage']
  companies: CompanyGuess[]
  size_bucket: SizeBucket
  band: Band
  // the event-materiality classifier's FINAL fields — event_materiality_label is re-derived from the
  // boosted triage_score (deriveMaterialityLabel), so it never contradicts the shown score; event_scope
  // is the simplified external vocabulary (news/scope.ts toEventScope); event_direction passes through
  // the raw Triage read unchanged (informational only).
  event_materiality_label: EventMaterialityLabel
  event_direction: EventDirection
  event_scope: EventScope
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
  source_is_english?: true // absent on legacy/unknown-language rows; never inferred from Latin script alone
  url: string
  source_name: string
  input_nature: string
  found_at: string
  /** First local observation of this exact URL/content revision. Publisher timestamps can remain fixed
   * across an in-place correction, so this durable clock proves revision order without re-dating news. */
  observed_at?: string
  prelim_note: string
  dedup_status: 'new' | 'possible_duplicate'
  consumed: boolean
  launched_signal_id: string | null
  consumed_at?: string // durable human-action clock; legacy rows may omit it
  /** Stable append-only human-action identity. Daily sweep JSON remains the UI projection; this record
   * id lets the Ideas reader recover future vetoes even if an old projection file is later damaged. */
  human_action_id?: string
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
  // event-materiality classifier's final fields — see TriagedItem's doc comment
  event_materiality_label?: EventMaterialityLabel
  event_direction?: EventDirection
  event_scope?: EventScope
  // Source-bound, validated dated/window evidence for the Ideas timing gate. Unlike the wire's derived
  // category chips, these strings are persisted only when the ORIGINAL source headline contains both a
  // forward-event term and a complete date/window (news/schedule.ts).
  scheduled_events?: string[]
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
  found_at?: string // ISO 8601 — source publication/discovery time; absent on legacy firehose lines
  /** First local observation of this exact source revision, copied from the durable inbox lane. This is
   * ordering metadata only; source freshness and decay remain anchored to `found_at`. */
  observed_at?: string
  event_id: string
  headline: string
  headline_en?: string | null // English translation of a non-English headline (news/lang.ts); absent/null when the original is English
  headline_lang?: string | null // the source language named, for the "original · X" label
  source_is_english?: true // source-language proof used only by the guarded human-veto transition path
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
  // canonical commodity subject(s) the headline names (news/commodities.ts — profile headings like
  // 'GOLD'); ABSENT (never []) when none match, so deploy-skew clients fail closed on undefined.
  // `commodity` = the primary (earliest-mentioned) tag; `commodities` = all matches (≤4).
  commodity?: string
  commodities?: string[]
  // CapIQ-style subject topics the headline names (news/topics.ts — AI, cybersecurity, EVs, …). Always
  // an array once hydrated (derived on read from the persisted headline; [] when none match), so a client
  // can rely on it. Orthogonal to event_types (the corporate-action axis) and GICS sectors (the industry).
  topics?: string[]
  // scheduled/forward corporate events this headline ANNOUNCES (news/schedule.ts — results_date, AGM,
  // ex_dividend, …). Same read-time derivation + always-array rule as topics. The §17 forward-catalyst
  // axis: it flags that the item is about an UPCOMING dated event, not (only) something that happened.
  scheduled_events?: string[]
  // event-materiality classifier's final fields — see TriagedItem's doc comment
  event_materiality_label?: EventMaterialityLabel
  event_direction?: EventDirection
  event_scope?: EventScope
  snippet?: string // the feed's own lede — fetch-free body the enrichment reads when the page blocks
  rank_factors?: import('./rank').RankFactors // composite-priority breakdown (triage_score is the composite)
  dedup_status: 'new' | 'possible_duplicate'
  dedup_group?: string // story-cluster id (news/dedup.ts) — earliest member's event_id; one row per story
  inboxed: boolean // band !== 'drop'
  caution?: boolean // caution_only social item (r/wallstreetbets): weighted lowest, capped to drop on the display re-rank too (feed.ts)
}

// The structured reason a cycle deferred items — mirrors the human `note` so the cockpit can reason about
// WHY without parsing free text. Absent when nothing deferred. Ordered by the note's own precedence.
export type DeferReason =
  | 'aborted' // the wall-clock guard killed the cycle mid-way and dumped the remainder to the backlog
  | 'usage-ledger-unavailable' // a configured provider's durable usage authority needs attention; no cap claim is safe
  | 'free-budget-spent' // configured free-tier engine allowances cannot fit another safe call (not a live provider-quota claim)
  | 'provider-day-limit' // at least one provider explicitly reported its day limit; recorded usage stays actual
  | 'groq-cooldown' // legacy persisted value: Groq retry hold and nothing else absorbed the batch
  | 'provider-retry-held' // usable allowance exists, but every eligible route is inside an engine retry hold after an error
  | 'allowance-paced' // hard allowance remains, but its reset-clock release cannot yet admit the next call
  | 'paced' // under the daily cap but over the clock-prorated pacer ceiling — holding budget for later
  | 'batch-failed' // a provider was reached but returned an error (an LLM hiccup, not a budget state)

// The Haiku last-resort tier's state at the END of a cycle — the piece that was invisible when "Groq in
// failure cooldown" printed with no hint the paid fallback had ALSO tapped out (the reported surprise).
export type LastResortState =
  | 'off' // tier disabled (NEWS_ANTHROPIC_FALLBACK_ENABLED=0, or api mode with no key)
  | 'unavailable' // its durable USD usage record needs attention; do not call this a spent $ ceiling
  | 'scored' // it fired and scored ≥1 batch this cycle, still under its ceiling
  | 'usd-cap' // reached its daily $ ceiling (anthropicDailyUsd) — the rest deferred
  | 'plan-quota' // the shared Claude plan's own usage limit hit → backing off until the plan resets
  | 'auth-expired' // the host's Claude sign-in expired → re-probes every drain, recovers on `claude login`
  | 'cooling' // in its cross-cycle cooldown from an earlier error
  | 'available' // on and under budget, but not needed this cycle (the free tiers absorbed everything)

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
  local_requests?: number // batches scored by the LOCAL primary brain (unlimited / $0) — present only when it ran
  local_tokens?: number
  local_down?: boolean // the LOCAL primary brain was unreachable/failed this cycle → the scan ran on the cloud fallback. Present only when true
  gemini_requests?: number // batches that overflowed to the Gemini free-tier provider (0 / absent when unused)
  gemini_tokens?: number
  overflow_requests?: number // batches that overflowed to the OpenAI-compatible registry (OpenRouter, NVIDIA, …)
  overflow_tokens?: number
  anthropic_requests?: number // batches scored by the metered Anthropic-Haiku last-resort tier (0 / absent when unused)
  anthropic_tokens?: number
  anthropic_cost_usd?: number // metered USD spent on the Anthropic fallback this cycle (0 / absent when unused)
  // Per-tier triage work. Daily budget request counters can also include article/theme/idea calls and count
  // failed attempts, so they cannot answer the operator's real question: how much useful scanner work did
  // each allowance buy? These additive maps keep attempted network calls separate from scored batches.
  provider_attempts?: Record<string, number>
  provider_scored_batches?: Record<string, number>
  note?: string // a human-readable reason when ok=false or a cap was hit
  // --- end-to-end transparency (additive; every field optional so an older client degrades cleanly) ---
  // candidates = fresh + carryover. Splitting them stops the "read balloon": a budget-deferred item is
  // re-queued into `candidates` every cycle until it's finally scored, so candidates ≫ what was genuinely new.
  fresh?: number // genuinely new on-list items this cycle
  carryover?: number // re-queued deferred-backlog items included in `candidates`
  deferred?: number // items pushed to the backlog this cycle (TRUE count, may exceed backlog_cap → tail lost)
  backlog?: number // deferred backlog depth held on disk after this cycle (≤ backlog_cap)
  backlog_cap?: number // the loss boundary (DEFERRED_CAP): backlog past this is silently dropped
  dropped_at_cap?: number // items lost this cycle because the backlog overran backlog_cap (deferred = backlog + dropped_at_cap). Present only when >0 — the honest twin of "the tail is dropped, not deferred"
  backlog_expired?: number // backlog items retired UNSCORED this cycle for being older than the wire's own 2-day window (DEFERRED_MAX_AGE_MS). Present only when >0 — a real loss, reported like dropped_at_cap, never silent
  deferred_write_failed?: boolean // saveDeferred's atomic write failed this cycle — the in-memory backlog was NOT persisted (last-good kept); backlog/deferred describe intent, not what is on disk. Present only when true
  deferred_read_failed?: boolean // malformed/unreadable backlog authority; fetch/scoring paused and existing bytes preserved
  aborted?: boolean // the wall-clock guard killed this cycle and dumped the untriaged remainder to the backlog
  defer_reason?: DeferReason // structured twin of the defer `note`
  last_resort?: LastResortState // the Haiku fallback's state at cycle end — makes "why nothing scored" honest
  // Raw articles pulled per source layer this cycle, keyed by each item's `via` provenance (gdelt, rss,
  // nse, asx, …). Absent on a drain cycle, which fetches nothing. Lets the cockpit show WHICH sources are
  // delivering right now instead of only the on-open /api/news/sources snapshot.
  sources?: Record<string, number>
  phase?: 'fetch' | 'drain'
}
