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
- Collection runs only while the Model or data endpoint is being read. After 45 seconds without
  a read, the detail lane yields after its bounded in-flight request. Reopening resumes from the cache.
- One request at a time, at least two seconds apart; no paid fallback, proxy, challenge bypass,
  external search/LLM credits or analysis run. A 403/429 stops both request lanes for 30 minutes.
  The small atomic source-pause record survives restarts, including a restriction on first use.
- Each detail batch must match every requested ticker **and company name** before publication.
  Partial/mismatched/failed batches retain the last successful view and its original timestamp.
  Complete price sweeps are saved atomically; detail progress is saved at least once per minute
  during collection and when the lane yields. A restart resumes from validated per-view snapshots.
  Shutdown waits for the collector to settle; a late response cannot overwrite its replacement.

[Finviz's FAQ](https://finviz.com/help/faq) distinguishes delayed free quotes from Elite real-time
quotes and says fundamentals recalculate hourly. Acquisition timing does not remove that delay.

## Read-only consumers

- `GET /api/screener/universe-model`: compact grid, event assessments and captured/expected view counts.
  Raw Finviz fields/headlines are omitted from frequent grid polling.
- `GET /api/screener/universe-model/data?ticker=AAPL&company=Apple%20Inc`: exact-company data for the popup.
- `GET /api/screener/universe-model/data`: all captured company/view snapshots for a later engine consumer.

The data endpoint returns `source_url`, `refreshing`, `error`, and `rows` with `ticker`, `company`,
and `views`. Each view has its own `source_url`, `retrieved_at`, `text`, `numbers`, and optional
`range52w` / `news`. Empty or older views are explicit; the endpoint never claims a coherent
point-in-time market snapshot. Reading it may start/resume the same free collector, never analysis.
