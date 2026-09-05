# The market price / benchmark feed — `data/_market/`

> **Why this doc lives in `frameworks/` and not in `data/_market/`.** The pool (`data/`) is a **symlink
> into Google Drive**, gitignored on purpose (see `scripts/ops/MIGRATION.md`) — `git clone` must never
> create it. A **tracked file under `data/`** silently breaks that: on any `git checkout`/`reset` the
> checkout materialises `data/` as a real directory to place the tracked file, **replacing the symlink
> with an empty folder** — and the cockpit reads that empty folder as *"0 companies"* while Google Drive
> is perfectly healthy. So the canonical contract for the `data/_market/` lane is documented **here**,
> and the `data/` tree carries **no tracked files**.

This is the shared lane for the **market price feed** the calibration scoreboard reads to score calls
on a **benchmark-adjusted** basis (a long that merely rode a rising market showed no skill — CLAUDE.md
§9), and to anchor a **review price** for a call whose pool had no price (a null-entry call like BG).

It follows the `frameworks/EXTERNAL_DATA.md` §7 / §7A file-drop contract: a fetcher (or you) **writes
files** — there is **no engine wiring and no live API call** from the engine. Unlike ticker-scoped
external data (which lives under `data/<TICKER>/external/`), this is a cross-cutting reference series
(index / sector / stock closes), so it lives here once.

## What to drop

```
data/_market/<Provider>/
   <anything>.csv        long-format daily closes (optional volume for liquidity work)
   _symbols.json         OPTIONAL — per-symbol metadata for beta adjustment
   <file>.source.json    OPTIONAL — provenance sidecar (EXTERNAL_DATA §3 shape)
```

### The CSV (required columns, header row mandatory)

```
date,symbol,close,volume
2026-06-01,NIFTY50,23400.5,
2026-06-01,TMCV,369.15,1530210
2026-07-01,NIFTY50,24100.0,
2026-07-01,TMCV,422.20,1828400
```

- `date` — ISO `YYYY-MM-DD`. `symbol` — any stable string (an index, a sector index, or a stock).
  `close` — a float in the symbol's own currency. `volume` is optional; when present it is the session's
  share/unit volume and lets research verify median daily traded value (`close × volume`) instead of
  claiming liquidity from a listing lookup.
- One row per `(symbol, date)`. Multiple CSVs **inside one provider folder** are merged; later files win
  on a clash. Strict history/evidence exports never merge rows across providers.
- Optional `exchange`, `currency`, and `price_basis` columns bind a row even more tightly. If supplied,
  every value must agree with that same provider's `_symbols.json`; a conflict invalidates the strict
  export. They are assertions, not last-row-wins metadata.
- The feed's **as-of is the latest `date` in the data**, never a file's modification time.
- A stock and its benchmark must share a currency for the excess to be meaningful; returns themselves
  are unit-free.

### `_symbols.json` (optional — enables beta-adjusted excess)

```json
{
  "TMCV":  {
    "kind": "equity", "exchange": "NSE", "currency": "INR",
    "benchmark": "NIFTY50", "sector": "NIFTYAUTO", "beta": 1.15,
    "price_basis": "split_adjusted", "security_status": "active",
    "usd_fx_pair": "INR/USD", "usd_fx_rate": 0.01198, "usd_fx_as_of": "2026-08-03",
    "usd_fx_source": "RBI reference rate, 2026-08-03"
  },
  "NIFTY50": {
    "kind": "benchmark", "exchange": "INDEX", "currency": "INR",
    "price_basis": "split_adjusted"
  },
  "NIFTYAUTO": {
    "kind": "sector", "exchange": "INDEX", "currency": "INR",
    "price_basis": "split_adjusted"
  }
}
```

Without it, `beta` defaults to `1.0` (so the beta-adjusted excess equals the naive benchmark-relative
excess) and no sector attribution is done.

The qualified 3–6 month outcome loop is stricter than the generic calibration reader. It exports a stock
history only when one **data-contributing provider's own** `_symbols.json` positively identifies `kind`,
`exchange`, `currency`, and `price_basis: "split_adjusted"`. Rows, volumes, listing identity, and price-basis
metadata stay bound to that provider. Metadata from a provider that contributed no rows cannot bless raw
rows from another provider. Two contributing providers for the same requested listing are conflicting
provenance and fail closed rather than being spliced into one history.

Ticker alone remains accepted only when exactly one provider listing is possible. When a ticker collides
across listings, use `--exchange EXCHANGE --currency CCC`; both selectors are checked against provider
metadata, never copied into it. A provider with rows but no identity remains an ambiguity and cannot be
silently discarded. A bare close series may be raw or adjusted; guessing would turn a stock split into
fake alpha. For a delisted name set `security_status: "delisted"` and add a source-bound terminal value,
including zero where shareholders recovered nothing:

```json
{
  "OLDCO": {
    "kind": "equity", "exchange": "NYSE", "currency": "USD",
    "price_basis": "split_adjusted", "security_status": "delisted",
    "terminal_value": { "date": "2026-09-10", "price": 0, "source": "bankruptcy distribution notice" }
  }
}
```

The new-idea qualification reader is stricter again. `--idea-evidence SYMBOL` requires `kind: "equity"`
and returns a quote, measured
median daily traded value, and the median absolute five-session price move only when it can prove them:

- at least 60 split-adjusted price sessions for the ordinary-move distribution;
- one fixed window of the latest 60 non-future sessions for liquidity, with observed `close × volume` on
  at least 54/60 sessions (90% coverage; missing volume is unknown, never zero);
- a quote no more than seven calendar days old; and
- for a non-USD listing, exact `usd_fx_pair: "<CCC>/USD"`, positive `usd_fx_rate` (USD per one unit of
  listing currency), ISO `usd_fx_as_of` on or before and within 14 days of the quote, and a non-empty
  `usd_fx_source` citation. The export carries all four fields in `liquidity.currency_conversion`.
- no future-dated price or FX observation. Future price rows are excluded from every calculation and
  make the evidence unavailable, so they cannot influence the displayed quote, liquidity, or risk.

The export returns `available: false` plus named `gaps` when any requirement is missing. A listing lookup
does not prove liquidity, and the adapter never guesses an FX rate.

## What writes it

The **S&P 500 slice is auto-populated only on the canonical pool-writer doer machine.** `scripts/fetch_market_feed.py` pulls the
daily index close from FRED (`SP500` — proprietary to S&P Dow Jones Indices LLC, free to access and use
via FRED as an internal benchmark reference but **not** redistributable; the sidecar records
`redistribution: prohibited`) through the connectors' own SSRF-bounded
`fetch_bytes`, and writes `data/_market/fred/sp500_<as_of>.csv` plus its `.source.json` provenance
sidecar — nothing else, and it never guesses a symbol it wasn't asked to fetch. `scripts/ops/install-services.sh`
installs it as the doer-only `com.nostradamus.hk-market-feed` launchd timer (daily, 07:10, ahead of
`hk-calibrate-daily` at 07:25) via the `scripts/ops/market-feed-local.sh` wrapper — deterministic,
no model/provider identity, so it needs no cockpit admission. Because `data/` is a gitignored symlink
into Google Drive, this file drop never goes through `commit-run.sh`; it is local to whichever machine
runs the timer, same as every other file under `data/_market/`.

Serving/tunnel failover does not transfer this writer: installs with `NOSTRA_INSTALL_CONNECTORS=0`
exclude and unload the market-feed timer alongside connectors. Every scheduled run also checks the
connector supervisor's permanent writer identity, installed doer role, and existing canonical pool
projection. Missing, mismatched, or unsafe identities and an unavailable Drive projection cause a skip;
the timer never adopts a different pool or creates a replacement local `data/` directory.

Every OTHER symbol this feed contract supports (a sector benchmark, a non-US index such as NIFTY 50 or
NIFTY Healthcare, a stock's own history) still has **no automated fetcher** — drop it yourself, or add
a fetcher of your own next to `fetch_market_feed.py` under the same provider-folder contract. Run
`python3 scripts/fetch_market_feed.py --verify` to check the parser without making a network call, or
`bash scripts/ops/market-feed-local.sh` to run the exact scheduled job by hand.

## What reads it

`scripts/market_prices.py` (a pure, read-only reader):
- `close_on(symbol, date)` — last close on/before a date (entry / review / tracking price backfill).
- `total_return(symbol, d0, d1)` — raw price return over a window.
- `beta_adjusted_excess(symbol, d0, d1)` — `stock_return − beta·benchmark_return`, returning BOTH the
  raw and the beta-adjusted figure so you can see the market move stripped out.
- `adjusted_history(symbol)` / `--history SYMBOL` — strict `market-history/v1` export for the qualified
  idea outcome loop; unavailable unless one provider proves the price basis and listing identity. Supply
  `--exchange EXCHANGE --currency CCC` to verify/disambiguate a ticker collision.
- `idea_evidence(symbol)` / `--idea-evidence SYMBOL` — deterministic entry quote, USD traded-value
  liquidity, and ordinary five-session move for a new 3–6 month assessment; explicit gaps on missing data.
- `--write-idea-evidence SYMBOL RUN_ROOT` — requires complete evidence and atomically writes the canonical
  `RUN_ROOT/idea_market_evidence.json` sidecar. It runs only after a digest-valid post-audit
  `idea_projection_manifest.json` exists. Its schema is `idea-market-evidence-snapshot/v1`; it stores
  that manifest's exact `manifest_sha256` as `projection_manifest_sha256`, a timezone-bearing
  `captured_at`, the evidence object, and `evidence_sha256` computed over the shared fail-closed
  cross-runtime canonical JSON contract in `scripts/canonical_json.py` (UTF-16 key order, ECMAScript
  number/string spelling, finite numbers, negative zero normalized, and integer-valued magnitudes limited
  to JavaScript's safe range). This is stricter than merely sorting keys and is not unrestricted JCS. The
  command prints the path and digest. Re-running with identical evidence
  yields the same digest; a failed/incomplete read writes nothing. There is no canonical pre-audit capture:
  the manifest pins the final thesis, decision, and three audits first, and any later change to a pinned
  artifact requires a new dated run rather than reusing this sidecar.

`scripts/calibrate.py` reports whether a feed is present and which return basis it used. **Until a feed
lands, calibrate falls back to the review-time benchmark-relative return each review already computed,
and says so** — nothing breaks; the scoreboard just uses the less-adjusted number and is honest about it.

## Rules (EXTERNAL_DATA §8)

- The as-of comes from inside the data, never a file mtime.
- A strict export names both its contributing CSV files and the provider `_symbols.json` that proves
  kind, exchange, currency and price basis. Commodity point-in-time admission requires a valid
  `.source.json` sidecar for every named file; receipt time and content hash bind metadata and prices
  into the same immutable vintage, so later metadata cannot retroactively bless earlier rows.
- Session calendars are instrument-compatible: futures contribute only to futures calendars, while
  equities, benchmarks and sectors share the cash-security calendar. A Sunday futures session cannot
  make an equity outcome look missing.
- A figure is cited with its provider + date, like any source.
- Keys for a paid fetcher live in `~/.config/nostra-engine/providers.env`, never in the repo.
- The `data/_market/` folder is part of the **Drive-backed pool**, not git. Like all of `data/`, it is the
  gitignored symlink lane, so the feed files live in the shared Google Drive pool and are **never committed
  to `main`** — a tracked file under `data/` is exactly the symlink-clobber "0 companies" outage this doc
  exists to prevent (CI now rejects any tracked path under `data/`). This documentation lives in
  `frameworks/` (code stream, §28) so the pool tree stays free of tracked files.
