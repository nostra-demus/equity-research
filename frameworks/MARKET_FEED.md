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
   <anything>.csv        long-format daily closes
   _symbols.json         OPTIONAL — per-symbol metadata for beta adjustment
   <file>.source.json    OPTIONAL — provenance sidecar (EXTERNAL_DATA §3 shape)
```

### The CSV (required columns, header row mandatory)

```
date,symbol,close
2026-06-01,NIFTY50,23400.5
2026-06-01,TMCV,369.15
2026-07-01,NIFTY50,24100.0
2026-07-01,TMCV,422.20
```

- `date` — ISO `YYYY-MM-DD`. `symbol` — any stable string (an index, a sector index, or a stock).
  `close` — a float in the symbol's own currency.
- One row per `(symbol, date)`. Multiple CSVs per provider are merged; later files win on a clash.
- The feed's **as-of is the latest `date` in the data**, never a file's modification time.
- A stock and its benchmark must share a currency for the excess to be meaningful; returns themselves
  are unit-free.

### `_symbols.json` (optional — enables beta-adjusted excess)

```json
{
  "TMCV":  { "kind": "equity", "benchmark": "NIFTY50", "sector": "NIFTYAUTO", "beta": 1.15 },
  "NIFTY50": { "kind": "benchmark" },
  "NIFTYAUTO": { "kind": "sector" }
}
```

Without it, `beta` defaults to `1.0` (so the beta-adjusted excess equals the naive benchmark-relative
excess) and no sector attribution is done.

## What reads it

`scripts/market_prices.py` (a pure, read-only reader):
- `close_on(symbol, date)` — last close on/before a date (entry / review / tracking price backfill).
- `total_return(symbol, d0, d1)` — raw price return over a window.
- `beta_adjusted_excess(symbol, d0, d1)` — `stock_return − beta·benchmark_return`, returning BOTH the
  raw and the beta-adjusted figure so you can see the market move stripped out.

`scripts/calibrate.py` reports whether a feed is present and which return basis it used. **Until a feed
lands, calibrate falls back to the review-time benchmark-relative return each review already computed,
and says so** — nothing breaks; the scoreboard just uses the less-adjusted number and is honest about it.

## Rules (EXTERNAL_DATA §8)

- The as-of comes from inside the data, never a file mtime.
- A figure is cited with its provider + date, like any source.
- Keys for a paid fetcher live in `~/.config/nostra-engine/providers.env`, never in the repo.
- The `data/_market/` folder is part of the **Drive-backed pool**, not git. Like all of `data/`, it is the
  gitignored symlink lane, so the feed files live in the shared Google Drive pool and are **never committed
  to `main`** — a tracked file under `data/` is exactly the symlink-clobber "0 companies" outage this doc
  exists to prevent (CI now rejects any tracked path under `data/`). This documentation lives in
  `frameworks/` (code stream, §28) so the pool tree stays free of tracked files.
