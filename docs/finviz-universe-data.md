# Free Finviz universe data

The Universe Model collector uses the explicit filters in the owner's screen: market cap over
$2bn and average volume over 50k. The saved preset ID is account-local; it is not authentication.

`ui/server/src/universe-model.ts` is the single collector and owner of
`<stateDir>/universe-model.json`. All readers share its paced requests. It uses the ordinary
anonymous Overview, Tickers, Valuation, Financial, Ownership, Performance, TA and News views.
News includes the structured Basic/Snapshot fields; TA includes the Technical fields. Duplicate
views, chart images, paid exports, custom columns and authenticated APIs are not fetched.

## Retained data

Each company retains the raw `text` and `numbers` from each view, 52-week ranges where returned,
and the News view's headline links, publisher and provider date. This includes descriptive data,
valuation, estimated/historical growth, margins, returns, leverage, liquidity, ownership, short
interest, performance, technical indicators, analyst estimates and earnings dates where available.
New scalar provider fields are retained rather than discarded. Pagination ordinals are omitted.

Every view carries its exact source URL and retrieval timestamp. Numbers retain Finviz's units:
market cap is USD millions; shares outstanding/float are millions of shares; volume is shares;
percentage fields are percentage points, not fractions. `ui/shared/finviz-data.ts` labels known
units and explicitly marks unknown units unverified. Absent/null values never become zero.
The provider's local earnings/news dates are preserved without inventing a timezone.

These are third-party, unverified observations, not filing evidence. A headline, analyst target,
estimated growth rate or upcoming earnings date is not a favorable company impact assessment.
The signal engine's evidence requirements and green-count ranking are unchanged.

## Refresh and failure contract

- Two matching sector passes and broad-screen checks establish membership before prices refresh.
- Price batches rotate through the oldest/missing ordinary price-bearing tables, capturing data
  and a price in one request. The next price sweep is eligible five minutes after completion.
- Between price sweeps, the collector fills missing views, prioritizing the ten-company TA/News
  batches. It then revisits views older than an hour. The hour is a target, not a freshness promise:
  a full first collection can span multiple price sweeps, and every view displays its actual time.
- The server starts one background scheduler on readiness. It uses the same single pending collector,
  source cooldown and shutdown boundary as route reads, so closing the browser does not stop collection.
  Direct collector instances remain demand-driven until `start()` is called (used by isolated tests).
- The existing deployment-intent barrier blocks new collection and yields both lanes at the next
  request boundary. Completed batches checkpoint before settlement; clearing the barrier permits
  unfinished work to resume without imposing another five-minute refresh delay.
- One request at a time, at least two seconds apart; no paid fallback, proxy, challenge bypass,
  external search/LLM credits or analysis run. A 403/429 stops both request lanes for 30 minutes.
  The small atomic source-pause record survives restarts, including a restriction on first use.
- Each detail batch must match every requested ticker **and company name** before publication.
  Partial/mismatched/failed batches retain the last successful view and its original timestamp.
  Validated quote batches update matching members of the saved complete grid immediately; they are
  checkpointed at least once per minute and on failure/shutdown. Last-full-pass completion remains
  separate from per-row retrieval times. A restart prioritizes the oldest prices and skips still-fresh
  checkpointed rows. Complete replacement membership still requires a fully verified sweep.
  Detail progress is also saved at least once per minute and when the lane yields.
  Shutdown waits for the collector to settle; a late response cannot overwrite its replacement.

[Finviz's FAQ](https://finviz.com/help/faq) distinguishes delayed free quotes from Elite real-time
quotes and says fundamentals recalculate hourly. Acquisition timing does not remove that delay.

## Current visible prices

Finviz remains the universe/company-data source. Visible grid prices reuse the app's existing keyless
CNBC `restQuote` transport and identity/currency/plausibility guards (`news/equity-quote.ts`). The browser
requests only its visible companies (at most 100), immediately and every 15 seconds while visible. The
shared quote cache uses a 15-second TTL, not the ordinary research banner's longer cache. No API key,
subscription, broker account, order, analysis run or paid fallback is introduced.

Each price carries its actual source, market timestamp and retrieval timestamp. The UI says Live only
for an explicitly real-time, non-stale feed observation with a market timestamp within 90 seconds.
Date-only observations say Last close; delayed/unknown-time/older trades and saved outage data are
labelled accordingly. A failed request retains its last validated price without a Live label. No exchange
streaming or zero-latency guarantee is made. Finviz prices remain a visibly delayed fallback.

Old event-presence clients must not interpret new evidence as favorable signals. The grid request now
carries `x-nostra-model: favorable-engine/v3`; clients without it receive an empty legacy-compatible grid
and a reload message. Cache format remains unchanged. Active-refresh counts have their own denominator
(`refresh_total`), separate from the last saved universe's size.

## Read-only consumers

- `GET /api/screener/universe-model`: compact grid, event assessments and captured/expected view counts.
  Raw Finviz fields/headlines are omitted from frequent grid polling.
- `GET /api/screener/universe-model/data?ticker=AAPL&company=Apple%20Inc`: exact-company data for the popup.
- `GET /api/screener/universe-model/data`: all captured company/view snapshots for a later engine consumer.
- `GET /api/screener/universe-model/quotes?tickers=AAPL,MSFT`: current quotes for saved universe members only,
  bounded to 100 unique tickers; returns exact company identities and source/time/delivery metadata.

The data endpoint returns `source_url`, `refreshing`, `error`, a `fields` dictionary of labels and
raw units for engine/export consumers, and `rows` with `ticker`, `company`,
and `views`. Each view has its own `source_url`, `retrieved_at`, `text`, `numbers`, and optional
`range52w` / `news`. Empty or older views are explicit; the endpoint never claims a coherent
point-in-time market snapshot. Reading it may start/resume the same free collector, never analysis.

## Automatic company-impact engine

`ui/server/src/universe-engine.ts` owns durable company/report assessments separately from the
400-event article-enrichment cache. `POST /api/screener/universe-model/run` explicitly enables the
engine. It then checks the entire verified saved universe every minute, including new archive
reports and changed evidence, without an open browser. Grid/evidence GET requests never start
inference. The admission route uses the application's existing same-origin guard and rate limit.

The engine reuses `runChatTurn` with an allowed, pinned Codex subscription model and its closed-book,
read-only transport. It never switches to paid API inference, external search, crawling, full company
research or trade execution. Provider quota/auth failures retain completed work and show a recoverable
hold. Explicit retry clears failed index entries while preserving historical dispatch/result receipts.

Eligible tasks require an exact issuer link and a real saved source excerpt. Reports are deduplicated
across signal categories and assessed in four-report batches with a five-minute deadline. Legacy
12-report dispatch receipts remain recoverable. The deployment guard still aborts immediately on intent
and awaits settlement. Timeouts and provider phase kinds are recorded in private result receipts. Keys bind issuer, article identity, headline,
source URL/date, excerpt and prompt version/content. Stronger known full-article effects are retained;
an excerpt assessment cannot overwrite a later full-read adverse or mixed effect. Evidence without
sufficient company identity, materiality or a 3–6 month mechanism stays unassessed. This pass does not
pretend to have read full documents or turn Finviz headline sentiment into favorable effects.

Every published non-insufficient verdict requires a verbatim business fact from the saved excerpt and
verifiable company identity. Popups show the quote, source, inferred mechanism, horizon and watch item.
Mixed evidence preserves risks and cannot earn a green tick. Neutral/adverse assessments can show a
cross; missing reports or unproven impact show a dash. Total counts favorable categories once each,
never reports, and stays blank when no category has a completed impact assessment. Rows rank by this
count descending, with assessed zero-count rows ahead of wholly unassessed rows on ties.

Progress counts all current universe members, separately identifying assessed companies, companies
without eligible evidence, unavailable coverage and failed reports. Completion means the first pass
settled; it does not mean every company had sufficient evidence. New evidence is assessed automatically.
A retained process lock prevents overlapping writers. Immutable dispatch intent precedes inference,
results checkpoint before completion, restart recovers completed receipts, and uncertain interrupted
requests require explicit retry. Deployment intent stops new batches, aborts the current bounded
batch and awaits settlement before yielding. Completed receipts are preserved; uncertain work requires
explicit retry.
