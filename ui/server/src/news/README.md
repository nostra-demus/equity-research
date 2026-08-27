# Autonomous news ingester (screener swarm)

The "forever-living" front door of the screener. It pulls a free news firehose, scores every item
with a **free LLM (Groq)** as a cheap brain, and fills a **ranked inbox** — with no clicks and at
~$0. It writes the *same* inbox contract the manual `/screener:sweep` already fills, so the cockpit
and the gauntlet pick its output up with **zero** changes.

It **never spends Claude money.** Promoting an inbox row into the paid Phase 0.1 / Phase 1 gauntlet
stays the human's one-click "check it ▸" action. There is no auto-promote.

## The funnel (one cycle = `runIngestCycle()`)

1. **Fetch** — three layers run in parallel, each isolated (one failing never blocks the others),
   merged + deduped by URL, each carrying its own `via` provenance:
   - `sources/gdelt.ts` — GDELT DOC 2.0 (keyless), filtered to the GDELT-indexed approved domains.
   - `sources/rss.ts` — ~350 direct publisher **RSS/Atom feeds** (`frameworks/screener/rss_feeds.json`):
     every material SEC EDGAR form, US/India/global regulators, central banks, macro & data agencies,
     PR wires, exchanges, and sector & financial press. Dependency-free parser (handles RSS 2.0, Atom,
     CDATA-wrapped and `<guid>`-only links), conditional-GET (304) caching, a browser User-Agent by
     default (with per-feed overrides — SEC carries its required contact UA), and host-aware politeness
     (per-host serialization + a concurrency cap) so a big list never burst-trips a publisher.
   - `sources/nse.ts` — the **NSE India primary-disclosure JSON API** (corporate announcements +
     board-meeting intimations): the exchange itself, the highest-signal India source, with no RSS
     equivalent. One-time cookie-prime + retry on a 401/403.
2. **Normalize + filter + dedup** — `normalize.ts` + `sources/approved-domains.ts`: drop off-list
   publishers (the Gate-0 firewall, ~154 domains, look-alike-safe; a `gdelt:false` flag keeps a domain
   on the firewall without bloating the GDELT query), compute the same `event_id` the gauntlet uses,
   mark `possible_duplicate` against the events ledger, and skip anything already in the seen-cache.
3. **Triage** — `triage/groq.ts`: one batched Groq call scores N titles 0–100 against an
   approximation of the materiality rubric, returning a band (pick / watch / drop) + a one-line why.
   `triage/budget.ts` enforces a persisted daily request/token cap and a per-minute throttle so the
   free tier is never tripped; the seen-cache means a story is never scored twice.
4. **Write** — `write-inbox.ts`: merge pick/watch rows into `screener/inbox/<DATE>_sweep.json`
   (idempotent by URL, preserving any human `consumed` / `launched_signal_id`), ranked by score and
   capped; log items and cycle summaries to the date's firehose shards; rebuild the board index.

The board's inbox cards then show the score, region, and the "why," and a `seen / kept / dropped`
header — the "here's everything I'm getting and what I picked" view.

## Turning it on

The only secret is a free Groq key. With no key, the ingester stays dark and the engine behaves
exactly as before.

```bash
export GROQ_API_KEY=gsk_...        # the one secret (free tier)
# optional: export GROQ_MODEL=openai/gpt-oss-20b   # confirm the current free model id
#           (llama-3.1-8b-instant was shut down 2026-08-16 — a dead id 404s the whole primary tier)
```

Two hosting modes (build-both):

- **In the cockpit server** — automatic. When `GROQ_API_KEY` is set, `server.ts` starts the scheduler
  (`scheduler.ts`) after boot; it runs a cycle every `NEWS_POLL_INTERVAL_MIN` (default 5). Runs
  whenever the cockpit is up.
- **Standalone (true 24/7)** — `npm --prefix ui/server run ingest:once` runs exactly one cycle and
  exits (prints a JSON summary, exits 0/1). Put it on cron, or use the launchd service at
  `scripts/ops/com.nostradamus.news-ingester.plist` (fill the key, then run
  `scripts/ops/install-services.sh`). Survives the cockpit being closed.

## Rate-limit math (why the free tier is safe)

For the default `openai/gpt-oss-20b`, [Groq's free-plan limits](https://console.groq.com/docs/rate-limits)
are 30 requests/min, 1,000 requests/day, 8,000 tokens/min, and 200,000 tokens/day. Limits apply at the
organization level, and cached tokens do not count toward them. The engine starts at 28 requests/min,
950 requests/day, 6,000 tokens/min, and 200,000 tokens/day, with 12 titles per call, scored once and
cached. It also learns the account's live ceilings and reset time from Groq's response headers. Hitting a
limit puts Groq on a retry hold until its reset; it does not disable the provider, zero-score an item, or
discard the deferred work.

With the expanded source set (≈350 RSS feeds + NSE + GDELT), the daily item volume is large, so
**Groq throughput is the binding constraint on "score everything"**. At roughly 2,000 tokens per triage
batch, the 200,000-token daily allowance normally binds after about 100 calls, well before the 1,000-request
ceiling. A higher Groq tier can use the extra headroom reported by its live headers. The firehose record
(`kind:"item"`) shows every durably saved item read, kept *and* dropped. The original
`<DATE>_firehose.ndjson` is shard zero; at 40,000 item rows or 80 MB by default, the writer rolls to
`<DATE>_firehose.000001.ndjson`, then `.000002`, without waiting for midnight. Each item boundary is
hard-clamped to 90 MB so cycle summaries retain a 10 MB reserve; every physical file, summaries included,
stays below GitHub's 100 MB single-file boundary. The logical day and Drive archive have no application
retention cap. If an append itself fails, the scanner reports zero progress and keeps the row in durable
retry storage; a retry uses event identity across every shard, so rollover cannot duplicate it.

## Config (all `NEWS.*` in `../config.ts`, env-tunable)

`GROQ_API_KEY` · `GROQ_MODEL` · `NEWS_INGEST_ENABLED` · `NEWS_POLL_INTERVAL_MIN` ·
`IDEAS_ENABLED` (default on; `0` is the kill switch) · `IDEAS_TOP_N` · `IDEAS_MIN_INTERVAL_SEC` ·
`IDEAS_REFRESH_SEC` · `IDEAS_SHELF_LIFE_HRS` · `IDEAS_INPUT_MAX_AGE_HRS` (default 36; both the
sweep heartbeat and every contributing `found_at` must be inside this ceiling; it may tighten but
never widen the shelf-life limit) ·
`IDEAS_RESCUE_MODE` (`shadow` by default; `off` disables it, and this rollout cannot read articles) ·
`IDEAS_RESCUE_MAX_AGE_HRS` (36) · `IDEAS_RESCUE_DAILY_CHECKS` (200) ·
`IDEAS_RESCUE_PER_CYCLE` (8) · `IDEAS_RESCUE_NAME_DAILY_CAP` (40) ·
`IDEAS_RESCUE_PACE_FLOOR_FRAC` (0.04) · `IDEAS_RESCUE_AUDIT_MAX_BYTES` (15 MB per month) ·
`NEWS_GROQ_DAILY_REQ_CAP` · `NEWS_GROQ_DAILY_TOKEN_CAP` · `NEWS_GROQ_RPM` · `NEWS_TRIAGE_BATCH` ·
`NEWS_GDELT_LOOKBACK_MIN` · `NEWS_INBOX_MAX_ROWS` · `NEWS_PICK_THRESHOLD` · `NEWS_WATCH_THRESHOLD` ·
`NEWS_RSS_ENABLED` · `NEWS_RSS_FEEDS_PATH` · `NEWS_RSS_USER_AGENT` · `NEWS_RSS_CONCURRENCY` ·
`NEWS_RSS_PER_HOST_GAP_MS` · `NEWS_NSE_ENABLED` · `NEWS_NSE_BASE_URL` · `NEWS_NSE_LOOKBACK_HOURS` ·
`NEWS_FEED_SHARD_MAX_ITEMS` (40,000) · `NEWS_FEED_SHARD_MAX_BYTES` (80,000,000; values above 90,000,000
are clamped; the legacy `NEWS_FEED_ITEMS_DAILY_*` names remain aliases) · `NEWS_DEFERRED_CAP` (100,000 by default) · `NEWS_DEFERRED_MAX_AGE_HOURS` (48 — the wire's own live
window; an older backlog item is retired unscored and reported) · `NEWS_FRESH_RESERVE_FRAC` (0.5 — the share of
each cycle's triage slots reserved for items fetched this cycle, so a deep backlog cannot starve live news) ·
`NEWS_CONTRACT_RETRIES_PER_BATCH` (1) · `NEWS_OPENROUTER_TIMEOUT_MS` / `NEWS_NVIDIA_TIMEOUT_MS` (75,000) ·
`NEWS_GEMINI_RESPONSE_SCHEMA` (off).

### News chat retrieval

News chat always uses deterministic hybrid search: exact text, finance aliases, word forms, typo
repair, BM25, source quality, RRF fusion, and cited event connections. Test it with:

```bash
npm --prefix ui/server run retrieval:eval
```

Neural retrieval is optional and never shown as active unless it is truly configured and indexed.
It uses a separate OpenAI-compatible embedding key; the reranker uses a separate key as well. This
avoids silently spending a triage key. Set `NEWS_RETRIEVAL_EMBEDDING_ENABLED=1`,
`NEWS_RETRIEVAL_EMBEDDING_API_KEY`, `NEWS_RETRIEVAL_EMBEDDING_BASE_URL`, and
`NEWS_RETRIEVAL_EMBEDDING_MODEL`. The reranker has the matching `NEWS_RETRIEVAL_RERANK_*` settings.

New items are indexed after each successful ingest cycle. For saved history, first inspect without
spending, then run a bounded trial before the full resumable backfill:

```bash
npm --prefix ui/server run retrieval:backfill
npm --prefix ui/server run retrieval:backfill -- --limit=1000
npm --prefix ui/server run retrieval:backfill -- --all
```

The answer uses the local subscription model first. If that model is temporarily unavailable and the
existing `GROQ_API_KEY` is present, news chat uses a small closed-book Groq backup with the same cited
evidence and no tools. The backup is limited to public saved-news context and can be disabled with
`NEWS_CHAT_GROQ_FALLBACK_ENABLED=0`. Its timeout and answer cap are controlled by
`NEWS_CHAT_GROQ_FALLBACK_TIMEOUT_MS` and `NEWS_CHAT_GROQ_FALLBACK_MAX_TOKENS`.

To add a source: run `npx tsx scripts/verify-feeds.ts <candidates.json>` (live HTTP 200 + parseable
check that reuses the production parser and reports the real item-link domains), add the feed to
`frameworks/screener/rss_feeds.json`, and ensure its **link** domain is on the `approved-domains.ts`
firewall + the `SWARM.md` allow-list. `scripts/gen-wiring.py` automates the firewall/allow-list rows.

## Sustainable free-provider routing

Groq and every finite free provider have separate persisted allowance ledgers. The engine releases each
configured safe allowance cumulatively against that provider's reset clock, carries unused quiet-time room
forward, and selects the eligible provider furthest behind its released target. Config order is only the
quality tiebreak; it no longer lets an early provider starve OpenRouter, NVIDIA, or Gemini. With enough useful
backlog, all complete calls that fit the configured safe envelopes are released before reset without exceeding
the envelopes. `NEWS_FREE_PROVIDER_PACE_FLOOR_FRAC` controls the small start-of-day floor (default 6%).

Each pool keeps its own daily budget file and isolated per-minute limiter, and is **off unless its key is
set** (secrets live in env, never in source). Adding an OpenAI-compatible key is a single entry in
`buildOverflowProviders()` — it then auto-appears in routing, the article-read chain, the drain gate, status,
and as a cockpit chip (§26). A provider may still be retry-held after a real rate limit, service outage, or
network failure. Exact `Retry-After` is honored; service failures back off. Request/JSON-contract failures are
workload-scoped, so a bad triage response does not unnecessarily sideline article reads, Themes, or Ideas.
The cockpit calls these **engine retry holds**, not provider quota resets, and labels the bars as configured
engine allowances rather than claiming live account-quota knowledge.

The automatic fitness router also verifies backups before an emergency needs them. While its 24-hour
learning gate is still open, at most one in ten ordinary triage batches is routed through an overdue,
eligible free backup. This is useful real work—not a duplicate ping—so it uses the same provider lease,
allowance reservation, limiter, retry hold, quarantine, and durable audit result as every other batch. That
closes the old catch-22 where automatic activation required two-provider evidence but a healthy first route
prevented any second route from collecting evidence. Explicit `NEWS_PROVIDER_ROUTER_MODE=shadow` and
`static` remain observation-only. The cockpit shows when each route last returned the complete scorer
contract, or says plainly that it has no successful proof in the seven-day routing window.

`GET /api/news/diagnostics` also carries one `health` verdict derived from those same durable facts. It
separates a stalled scheduler (restart can help) from provider allowance/key/model faults, unreadable saved
state, actual missed items, or insufficient scoring capacity (restart cannot help). The cockpit shows the
ranked root causes, and the Mac watchdog consumes the same remedy field after two confirmed reads; there is
no second health process making synthetic provider calls or guessing from log text.

- **Gemini** (`GEMINI_API_KEY`) — a rotation pool of free models (`generateContent`), each its own
  per-day bucket, resetting midnight Pacific.
- **Cerebras** (`CEREBRAS_API_KEY`) — the biggest + fastest free pool, on `gpt-oss-120b`
  (the current model; `llama-3.3-70b` is retired). Its free tier is **token-gated**, limits verified live
  (2026-06-17): **1M tokens/day, 30k tokens/min, 5 req/min, 2,400 req/day**, so it paces on the binding
  limit (a daily **token** cap, not a request cap). `gpt-oss-120b` is a reasoning model but returns its
  thinking in a separate `reasoning` field (so `content` stays clean JSON) and honours `reasoning_effort`,
  which we default to `low` so thinking can't truncate the JSON. Knobs: `NEWS_CEREBRAS_MODEL` (default
  `gpt-oss-120b`) · `NEWS_CEREBRAS_REASONING_EFFORT` (default `low`) · `NEWS_CEREBRAS_DAILY_TOKEN_CAP`
  (default 900k, ~10% under 1M) · `NEWS_CEREBRAS_TPM` (default 28k, under 30k) · `NEWS_CEREBRAS_RPM`
  (default 4, under 5) · `NEWS_CEREBRAS_DAILY_REQ_CAP` (default 2,300, under 2,400) ·
  `NEWS_CEREBRAS_MAX_TOKENS` (default 3,500) · `CEREBRAS_BASE_URL` · `NEWS_CEREBRAS_ENABLED=0` to force off.
- **Mistral** (`MISTRAL_API_KEY`) — La Plateforme free tier, **rate-gated** (~1 req/s; the ~1B-tokens/month
  budget is non-binding for overflow), so it paces on request spacing, not a token cap, and its chip reads
  requests: `NEWS_MISTRAL_MODEL` (default `mistral-small-latest`) · `NEWS_MISTRAL_RPM` (45, ≈1.3s spacing,
  under 1 req/s) · `NEWS_MISTRAL_DAILY_REQ_CAP` (2000 soft backstop) · `NEWS_MISTRAL_MAX_TOKENS` ·
  `MISTRAL_BASE_URL` · `NEWS_MISTRAL_ENABLED=0` to force off.
- **OpenRouter** (`OPENROUTER_API_KEY`) / **NVIDIA NIM** (`NVIDIA_API_KEY`) — request-gated free pools
  participating in the same reset-clock allocator instead of waiting behind Cerebras + Mistral. OpenRouter
  defaults to its official `openrouter/free` router, which selects from currently available free models and
  filters for the request's required capabilities; `NEWS_OPENROUTER_MODELS` remains the explicit ordered-model
  override. This avoids turning normal free-model retirements into a broken default. Both providers run a
  **75s** call deadline (`NEWS_OPENROUTER_TIMEOUT_MS` / `NEWS_NVIDIA_TIMEOUT_MS`) rather than the generic 30s:
  the request is not streamed, so one clock covers queue wait + prefill + the whole decode, and a free `:free`
  model on a shared gateway queues before it generates. Both also set `skipArticleRead`, keeping them out of
  the ~7s interactive read that shares their cooldown marker. NVIDIA's free grant is a **finite credit pool
  that expires in ~30 days**, so a call lost to our own deadline is spend destroyed, not deferred.

## Why a provider goes red — and what the engine does about it

A free tier is shared and best-effort: it will queue you, rate-limit you and go down, so **zero errors at 100%
utilisation is not reachable.** The target is errors that cost one round-trip, block nothing else, and teach the
router something. Three properties already hold and must not regress: a failed batch is **unscored, never
scored-zero** (it defers, nothing is lost); a cooling provider is filtered out **before** any fetch, so it costs
nothing; and a failure moves the same batch to the next tier **in the same pass**.

On top of that:

- **Standing faults are quarantined, not waited out.** The shared classifier keeps authentication (401), billing
  (402), entitlement (403), retired model/endpoint (an evidenced 404), invalid request, rate limit, upstream
  failure, timeout and invalid response-contract failures separate. Authentication, billing, entitlement,
  model/endpoint and configuration faults write an atomic, durable quarantine keyed to the provider, safe base
  URL, model chain, credential fingerprint and request contract. Every process checks it before network I/O, so
  one terminal response costs one call, healthy fallbacks take the same batch immediately, and restarts do not
  start wasting requests again. The same contract covers OpenAI-compatible routes, Gemini's native Ideas
  `generateContent` route, and Claude's native Themes Messages route. There is deliberately no retry timer: a
  newer successful canary clears the
  marker, while a changed key/model/endpoint/contract has a new fingerprint and gets a fresh attempt. The marker
  stores only bounded error codes/types and the **name** of the key environment variable — never the key or the
  provider's response body. An ambiguous 404 is treated as request/configuration failure, never blamed on a key.
- **Failures are timed.** Every failing call records `elapsedMs`, and the cooldown marker carries it. A timeout
  *at* the configured deadline means the engine cut the call off and a longer one may work; far below it means
  the provider refused and the deadline is irrelevant. Read it in the tier row: *"a request timeout at 30.0s"*.
- **The streak's age is kept.** `firstFailureAt` survives every re-arm and clears only on a success. The backoff
  window pins flat at its ceiling from the 5th failure, so the consecutive count alone stops distinguishing
  "down an hour" from "down two days"; `failingForMs` does.
- **An unusable body is not walked around the whole pool.** A `contract` failure — the call returned, the body
  failed the row/coverage contract — is evidence about the **batch** at least as much as the provider, so
  re-sending identical text to five pool models spends five requests for zero rows.
  `NEWS_CONTRACT_RETRIES_PER_BATCH` (default **1**) caps it: keep the one cross-model retry that does sometimes
  rescue a batch, drop the rest. `0` never re-sends to another pool provider — the cap governs the scarce
  free/cloud pool. It does not reach the demoted local tier: that tier is a separate, deliberately unlimited
  last resort (no scarce request to conserve there), so a contract-failed batch still gets one final
  cross-model rescue attempt once the pool is exhausted. Availability / rate-limit / request failures are
  unaffected — those *are* about the provider.
- **The output ceiling scales with the batch.** `triageMaxOutputTokens` — one JSON row per headline, so a flat
  ceiling truncates larger batches and the completeness contract then discards the entire answer. It only ever
  raises a ceiling that is too low; a provider configured above the need keeps its own value.
- **The default outer batch is measured, not aspirational.** `NEWS_TRIAGE_BATCH` defaults to **24**. API and
  free providers receive all 24 rows. Subscription Haiku splits those same rows into three parallel 8-row
  calls. Two 12-row shards improved live throughput, but one complex shard still reached the 120-second CLI
  ceiling; 8 rows reduce that remaining tail without shrinking the outer batch. All three calls are funded
  atomically (at most $0.30 with the default $0.10 per-call guard), return all-or-nothing, and remain inside
  the unchanged **$200/day** ceiling. The environment variable is the no-code rollback.
- **Rejected rows stay compact.** A clearly irrelevant, sub-45 row may return only its index, relevance and
  score; the coercer supplies conservative empty defaults and the exact-index contract still requires every
  row. Material/watch rows keep the complete schema. This avoids spending most decode time explaining the
  large majority of headlines that the scanner immediately discards.
- **Admission is paced on the calibrated cost, the hard cap on the conservative bound.** The worst-case
  per-call bound is 3–8× a measured successful batch, so gating *admission* on it made tiers with allowance in
  hand read "Saved for later today". `DailyQuotaCandidate.paceCost` splits the two; the hard cap and every
  reservation still use the conservative bound, so the real provider ceiling cannot be busted.
- **Gemini row-schema enforcement** is available but **off** (`NEWS_GEMINI_RESPONSE_SCHEMA=1`): a schema the API
  rejects returns 400, which arms a silent hold — trading a recoverable contract failure for a harder one. It
  constrains row *shape*, not *coverage*, so `coerceCompleteTriageRows` stays the authority either way.
- **Per-model attribution.** The Gemini pool is five daily buckets behind one chip, so cycle counters carry both
  the aggregate `gemini` key and a per-model `gemini:<model>` key — otherwise "24 of 25 failed" can't say which.

What is deliberately *not* done: the batch-completeness rule is never relaxed to accept partial rows (a missing
index on an `ok:true` response is scored 0 **and marked seen for 7 days**, so partial credit turns visible waste
into silent permanent loss), and triage never gets its own Groq budget file (the configured cap *is* Groq's real
daily limit; two ledgers would authorise double against one ceiling).

## What this is not

The Groq score is a cheap **pre-read** that decides inbox membership and ranking only — it is not the
authoritative materiality score. The Claude gauntlet still does the real Phase 0.1 / Phase 1 work on
any row a human promotes. Tests: `test/news.test.ts` (mocked GDELT + Groq), `test/rss.test.ts` (RSS/Atom
parsing incl. CDATA/`<guid>` links + the feed-list integrity check), `test/nse.test.ts` (the NSE
adapter incl. the cookie-prime path) — all mocked, no network, no key needed.
