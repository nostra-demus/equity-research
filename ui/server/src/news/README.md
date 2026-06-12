# Autonomous news ingester (screener swarm)

The "forever-living" front door of the screener. It pulls a free news firehose, scores every item
with a **free LLM (Groq)** as a cheap brain, and fills a **ranked inbox** — with no clicks and at
~$0. It writes the *same* inbox contract the manual `/screener:sweep` already fills, so the cockpit
and the gauntlet pick its output up with **zero** changes.

It **never spends Claude money.** Promoting an inbox row into the paid Phase 0.1 / Phase 1 gauntlet
stays the human's one-click "check it ▸" action. There is no auto-promote.

## The funnel (one cycle = `runIngestCycle()`)

1. **Fetch** — `sources/gdelt.ts` queries GDELT DOC 2.0 (keyless, no real rate limit), filtered to
   the approved-source domains, last ~40 min, newest first. US / India / global in one pass.
2. **Normalize + filter + dedup** — `normalize.ts` + `sources/approved-domains.ts`: drop off-list
   publishers (the Gate-0 firewall, look-alike-safe), compute the same `event_id` the gauntlet uses,
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

Groq free tier ≈ 30 req/min, ~1,000 req/day, ~100–200k tokens/day (org-level; cached tokens free).
Defaults: ≤25 req/min throttle, daily caps of 800 req / 150k tokens, 12 titles per call, scored once
and cached. A heavy day (a few hundred new on-list items) costs well under those caps; once a cap is
reached the cycle defers the rest to the next run rather than erroring.

## Config (all `NEWS.*` in `../config.ts`, env-tunable)

`GROQ_API_KEY` · `GROQ_MODEL` · `NEWS_INGEST_ENABLED` · `NEWS_POLL_INTERVAL_MIN` ·
`NEWS_GROQ_DAILY_REQ_CAP` · `NEWS_GROQ_DAILY_TOKEN_CAP` · `NEWS_GROQ_RPM` · `NEWS_TRIAGE_BATCH` ·
`NEWS_GDELT_LOOKBACK_MIN` · `NEWS_INBOX_MAX_ROWS` · `NEWS_PICK_THRESHOLD` · `NEWS_WATCH_THRESHOLD`.

## What this is not

The Groq score is a cheap **pre-read** that decides inbox membership and ranking only — it is not the
authoritative materiality score. The Claude gauntlet still does the real Phase 0.1 / Phase 1 work on
any row a human promotes. Tests: `ui/server/test/news.test.ts` (mocked GDELT + Groq, no key needed).
