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
   capped; log a one-line cycle summary to `<DATE>_firehose.ndjson`; rebuild the board index.

The board's inbox cards then show the score, region, and the "why," and a `seen / kept / dropped`
header — the "here's everything I'm getting and what I picked" view.

## Turning it on

The only secret is a free Groq key. With no key, the ingester stays dark and the engine behaves
exactly as before.

```bash
export GROQ_API_KEY=gsk_...        # the one secret (free tier)
# optional: export GROQ_MODEL=llama-3.1-8b-instant   # confirm the current free model id
```

Two hosting modes (build-both):

- **In the cockpit server** — automatic. When `GROQ_API_KEY` is set, `server.ts` starts the scheduler
  (`scheduler.ts`) after boot; it runs a cycle every `NEWS_POLL_INTERVAL_MIN` (default 15). Runs
  whenever the cockpit is up.
- **Standalone (true 24/7)** — `npm --prefix ui/server run ingest:once` runs exactly one cycle and
  exits (prints a JSON summary, exits 0/1). Put it on cron, or use the launchd service at
  `scripts/ops/com.nostradamus.news-ingester.plist` (fill the key, then run
  `scripts/ops/install-services.sh`). Survives the cockpit being closed.

## Rate-limit math (why the free tier is safe)

Groq free tier ≈ 30 req/min, ~1,000 req/day, with a generous daily token budget (org-level; cached
tokens free). Defaults: ≤25 req/min throttle, daily caps of 1,500 req / 500k tokens, 12 titles per
call, scored once and cached. With the expanded source set (≈350 RSS feeds + NSE + GDELT) the daily
item volume is large, so **Groq throughput is now the binding constraint on "score everything"**: on a
free key the real limiter is Groq's own rate limit (cycles defer the rest to the next run — never lost,
never zero-scored — at no cost); a higher Groq tier uses the extra headroom (8b-instant ≈ $0.05/M
tokens, so 500k tokens/day ≈ $0.025). The firehose record (`kind:"item"`, capped at 5,000/day) shows
every item read, kept *and* dropped.

## Config (all `NEWS.*` in `../config.ts`, env-tunable)

`GROQ_API_KEY` · `GROQ_MODEL` · `NEWS_INGEST_ENABLED` · `NEWS_POLL_INTERVAL_MIN` ·
`NEWS_GROQ_DAILY_REQ_CAP` · `NEWS_GROQ_DAILY_TOKEN_CAP` · `NEWS_GROQ_RPM` · `NEWS_TRIAGE_BATCH` ·
`NEWS_GDELT_LOOKBACK_MIN` · `NEWS_INBOX_MAX_ROWS` · `NEWS_PICK_THRESHOLD` · `NEWS_WATCH_THRESHOLD` ·
`NEWS_RSS_ENABLED` · `NEWS_RSS_FEEDS_PATH` · `NEWS_RSS_USER_AGENT` · `NEWS_RSS_CONCURRENCY` ·
`NEWS_RSS_PER_HOST_GAP_MS` · `NEWS_NSE_ENABLED` · `NEWS_NSE_BASE_URL` · `NEWS_NSE_LOOKBACK_HOURS` ·
`NEWS_FEED_ITEMS_DAILY_CAP`.

To add a source: run `npx tsx scripts/verify-feeds.ts <candidates.json>` (live HTTP 200 + parseable
check that reuses the production parser and reports the real item-link domains), add the feed to
`frameworks/screener/rss_feeds.json`, and ensure its **link** domain is on the `approved-domains.ts`
firewall + the `SWARM.md` allow-list. `scripts/gen-wiring.py` automates the firewall/allow-list rows.

## Free overflow brains (when Groq is paced/capped)

When Groq's paced daily budget is spent, a batch routes to a free **overflow** pool instead of
deferring, so the day's throughput = Groq + every free pool. Each pool keeps its own daily budget
file + isolated per-minute limiter, and is **off unless its key is set** (secrets live in env, never
in source). Adding an OpenAI-compatible key is a single entry in `buildOverflowProviders()` — it then
auto-appears in routing, the article-read chain, the drain gate, status, and as a cockpit chip (§26).

- **Gemini** (`GEMINI_API_KEY`) — a rotation pool of free models (`generateContent`), each its own
  per-day bucket, resetting midnight Pacific.
- **Cerebras** (`CEREBRAS_API_KEY`) — leads the chain: the biggest + fastest free pool (llama-3.3-70b
  at ~2,000 tok/s). Its free tier is **token-gated** (≈1M tokens/day, ≈60k/min, 30 req/min), so it
  paces on the binding limit (a daily **token** cap, not a request cap): `NEWS_CEREBRAS_MODEL` ·
  `NEWS_CEREBRAS_DAILY_TOKEN_CAP` (default 900k, ~10% under 1M) · `NEWS_CEREBRAS_TPM` (55k) ·
  `NEWS_CEREBRAS_RPM` (28) · `NEWS_CEREBRAS_DAILY_REQ_CAP` (loose backstop) · `NEWS_CEREBRAS_MAX_TOKENS`
  · `CEREBRAS_BASE_URL` · `NEWS_CEREBRAS_ENABLED=0` to force off.
- **Mistral** (`MISTRAL_API_KEY`) — La Plateforme free tier, **rate-gated** (~1 req/s; the ~1B-tokens/month
  budget is non-binding for overflow), so it paces on request spacing, not a token cap, and its chip reads
  requests: `NEWS_MISTRAL_MODEL` (default `mistral-small-latest`) · `NEWS_MISTRAL_RPM` (45, ≈1.3s spacing,
  under 1 req/s) · `NEWS_MISTRAL_DAILY_REQ_CAP` (2000 soft backstop) · `NEWS_MISTRAL_MAX_TOKENS` ·
  `MISTRAL_BASE_URL` · `NEWS_MISTRAL_ENABLED=0` to force off.
- **OpenRouter** (`OPENROUTER_API_KEY`) / **NVIDIA NIM** (`NVIDIA_API_KEY`) — request-gated free pools,
  tried after Cerebras + Mistral.

## What this is not

The Groq score is a cheap **pre-read** that decides inbox membership and ranking only — it is not the
authoritative materiality score. The Claude gauntlet still does the real Phase 0.1 / Phase 1 work on
any row a human promotes. Tests: `test/news.test.ts` (mocked GDELT + Groq), `test/rss.test.ts` (RSS/Atom
parsing incl. CDATA/`<guid>` links + the feed-list integrity check), `test/nse.test.ts` (the NSE
adapter incl. the cookie-prime path) — all mocked, no network, no key needed.
