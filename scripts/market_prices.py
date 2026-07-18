#!/usr/bin/env python3
"""market_prices.py — pure reader for the market price / benchmark feed (the user-provided source).

WHY THIS EXISTS
---------------
The calibration scoreboard (`scripts/calibrate.py`) must judge a call on a BENCHMARK-ADJUSTED basis —
a long that merely rode a rising market did not show skill (CLAUDE.md §9 base-rate discipline). And a
review of a null-entry call (BG) needs a source+dated price to anchor returns from. Both want the same
thing: a daily close series for the stock, its benchmark, and its sector. This module reads that feed.

It follows the `frameworks/EXTERNAL_DATA.md` §7 paid-API / file-drop contract exactly: a fetcher (or the
user) WRITES FILES; there is NO engine wiring and no live API call from the engine. The feed is a
cross-cutting reference series (index / sector closes), not ticker-scoped, so it lives in a shared lane
rather than a ticker's `external/` folder:

  data/_market/<provider>/
     <anything>.csv          long-format daily closes — header:  date,symbol,close
     <file>.source.json      OPTIONAL provenance sidecar (§3 shape); path-derived fallback if absent
     _symbols.json           OPTIONAL map {symbol: {kind, sector, benchmark, beta}} for adjustment

CSV contract (deliberately minimal, so any source can emit it):
  • one row per (symbol, date): `date,symbol,close`
  • date = ISO `YYYY-MM-DD`; symbol = a stable ticker/index string; close = a float in the symbol's
    own currency (returns are unit-free, so currency need not be uniform across symbols — but a stock
    and ITS benchmark must share a currency for the excess to be meaningful).
  • the as-of is the max date IN the data, never a file mtime (EXTERNAL_DATA §8 / fix F23).

CONTRACT (mirrors ledger_records.py / extract_pool.py):
  • Pure + importable; the CLI runs only under __main__. Read-only. Never writes into the feed.
  • Tolerant: a missing feed, a malformed row, a bad date → skipped, never a crash. Absence yields an
    empty reader whose `available()` is False, so callers degrade gracefully and say so.
  • Deterministic: identical files → identical output.

CLI:
  python3 scripts/market_prices.py --print          # summarise what feed is present
  python3 scripts/market_prices.py --selftest        # pure-math + tolerant-read selftests
"""
from __future__ import annotations

import csv
import glob
import json
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEED_ROOT = os.path.join(REPO, "data", "_market")


# ── reading ──────────────────────────────────────────────────────────────────────────────────────

def _read_csv_closes(path):
    """Yield (symbol, date, close) from one long-format CSV. Malformed rows are skipped, not fatal."""
    try:
        with open(path, newline="", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames:
                return
            cols = {c.lower().strip(): c for c in reader.fieldnames}
            if not {"date", "symbol", "close"} <= set(cols):
                return  # not our schema
            for row in reader:
                try:
                    sym = str(row[cols["symbol"]]).strip()
                    date = str(row[cols["date"]]).strip()[:10]
                    close = float(str(row[cols["close"]]).strip())
                except (KeyError, ValueError, TypeError, AttributeError):
                    continue
                if sym and _is_iso(date) and close == close:  # close==close rejects NaN
                    yield sym, date, close
    except OSError:
        return


def _is_iso(s):
    if not (isinstance(s, str) and len(s) == 10 and s[4] == "-" and s[7] == "-"):
        return False
    try:
        y, m, d = int(s[:4]), int(s[5:7]), int(s[8:10])
        return 1 <= m <= 12 and 1 <= d <= 31 and y >= 1900
    except ValueError:
        return False


class MarketFeed:
    """The parsed feed: per-symbol sorted (date, close) series + optional symbol metadata."""

    def __init__(self, closes, meta, providers, files):
        self._closes = closes          # {symbol: [(date, close)] sorted by date}
        self._meta = meta              # {symbol: {kind, sector, benchmark, beta}}
        self.providers = providers     # [provider names present]
        self.files = files             # [relpaths read]

    def available(self):
        return bool(self._closes)

    def symbols(self):
        return sorted(self._closes)

    def as_of(self):
        """The latest date anywhere in the feed (its freshness), or None."""
        alld = [s[-1][0] for s in self._closes.values() if s]
        return max(alld) if alld else None

    def close_on(self, symbol, date):
        """The last close on or before `date` (carry-forward for a non-trading day), or None. Used to
        anchor an entry/review price for a call whose pool had no price (review-decisions backfill)."""
        series = self._closes.get(symbol)
        if not series:
            return None
        chosen = None
        for d, c in series:  # sorted ascending
            if d <= date:
                chosen = c
            else:
                break
        return chosen

    def total_return(self, symbol, d0, d1):
        """Total price return (%) of `symbol` from d0 to d1 using on-or-before closes. None if either
        endpoint is missing. This is the raw return — never a skill signal on its own (§9)."""
        c0, c1 = self.close_on(symbol, d0), self.close_on(symbol, d1)
        if c0 is None or c1 is None or c0 == 0:
            return None
        return round((c1 / c0 - 1.0) * 100.0, 4)

    def beta_of(self, symbol):
        m = self._meta.get(symbol) or {}
        b = m.get("beta")
        return float(b) if isinstance(b, (int, float)) else 1.0

    def benchmark_of(self, symbol):
        return (self._meta.get(symbol) or {}).get("benchmark")

    def beta_adjusted_excess(self, symbol, d0, d1, benchmark=None, beta=None):
        """Beta-adjusted excess return (%): stock_return − beta·benchmark_return over [d0, d1]. This is
        the honest skill number — it strips the market move the stock would have made just by having
        beta exposure, so only the residual (alpha) counts (§9). Returns a dict with the raw and the
        adjusted figures (so a caller can show BOTH and see they diverge), or None if data is missing.
        `benchmark`/`beta` default to the symbol's `_symbols.json` metadata."""
        benchmark = benchmark or self.benchmark_of(symbol)
        beta = self.beta_of(symbol) if beta is None else beta
        if not benchmark:
            return None
        sr = self.total_return(symbol, d0, d1)
        br = self.total_return(benchmark, d0, d1)
        if sr is None or br is None:
            return None
        return {
            "symbol": symbol, "benchmark": benchmark, "beta": round(beta, 4),
            "stock_return_pct": sr, "benchmark_return_pct": br,
            "raw_excess_pct": round(sr - br, 4),                 # naive (beta=1) excess
            "beta_adjusted_excess_pct": round(sr - beta * br, 4),  # the skill number
        }


def load_feed(feed_root=FEED_ROOT):
    """Read every `data/_market/<provider>/*.csv` into a MarketFeed, plus any `_symbols.json` metadata.
    A missing feed root returns an empty (unavailable) feed — the normal state until the user drops one."""
    closes, meta, providers, files = {}, {}, [], []
    if not os.path.isdir(feed_root):
        return MarketFeed(closes, meta, providers, files)
    for provider in sorted(os.listdir(feed_root)):
        pdir = os.path.join(feed_root, provider)
        if not os.path.isdir(pdir):
            continue
        providers.append(provider)
        mpath = os.path.join(pdir, "_symbols.json")
        if os.path.isfile(mpath):
            try:
                with open(mpath, encoding="utf-8") as f:
                    m = json.load(f)
                if isinstance(m, dict):
                    for k, v in m.items():
                        if isinstance(v, dict):
                            meta[str(k).strip()] = v
            except (OSError, json.JSONDecodeError, ValueError):
                pass
        for path in sorted(glob.glob(os.path.join(pdir, "*.csv"))):
            found = False
            for sym, date, close in _read_csv_closes(path):
                closes.setdefault(sym, {})[date] = close  # dedup: last write per (sym,date) wins
                found = True
            if found:
                files.append(os.path.relpath(path, REPO))
    # freeze each symbol to a date-sorted list
    sorted_closes = {sym: sorted(byd.items()) for sym, byd in closes.items()}
    return MarketFeed(sorted_closes, meta, providers, files)


# ── selftest + CLI ─────────────────────────────────────────────────────────────────────────────────

def selftest():
    import tempfile
    ok = True

    def check(cond, msg):
        nonlocal ok
        if not cond:
            ok = False
            print(f"[market_prices] SELFTEST FAIL: {msg}")

    # empty / missing feed → unavailable, never crashes
    empty = load_feed("/nonexistent/_market/xyz")
    check(empty.available() is False, "missing feed → unavailable")
    check(empty.close_on("SPX", "2026-01-01") is None, "missing feed → close_on None")
    check(empty.total_return("SPX", "2026-01-01", "2026-02-01") is None, "missing feed → return None")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "SampleProvider")
        os.makedirs(prov)
        with open(os.path.join(prov, "closes.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n")
            f.write("2026-06-01,STK,100\n2026-07-01,STK,120\n")   # stock +20%
            f.write("2026-06-01,BENCH,200\n2026-07-01,BENCH,220\n")  # benchmark +10%
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({"STK": {"kind": "equity", "benchmark": "BENCH", "beta": 1.5}}, f)
        feed = load_feed(td)

        check(feed.available() and feed.symbols() == ["BENCH", "STK"], "reads both symbols")
        check(feed.as_of() == "2026-07-01", "as_of is the latest date in the data (not mtime)")
        check(feed.close_on("STK", "2026-06-15") == 100.0, "close_on carries the prior close forward (non-trading day)")
        check(feed.close_on("STK", "2026-05-01") is None, "close_on before the series → None")
        check(feed.total_return("STK", "2026-06-01", "2026-07-01") == 20.0, "stock total return +20%")
        check(feed.total_return("BENCH", "2026-06-01", "2026-07-01") == 10.0, "benchmark total return +10%")

        adj = feed.beta_adjusted_excess("STK", "2026-06-01", "2026-07-01")
        check(adj is not None, "beta-adjusted excess computes with metadata")
        check(adj["raw_excess_pct"] == 10.0, "raw (beta=1) excess = 20 − 10 = 10pp")
        check(adj["beta_adjusted_excess_pct"] == 5.0, "beta-adjusted excess = 20 − 1.5·10 = 5pp")
        check(adj["raw_excess_pct"] != adj["beta_adjusted_excess_pct"],
              "raw and beta-adjusted DIVERGE (the point — high beta explains part of the outperformance)")
        # explicit override beats metadata
        adj2 = feed.beta_adjusted_excess("STK", "2026-06-01", "2026-07-01", beta=2.0)
        check(adj2["beta_adjusted_excess_pct"] == 0.0, "beta=2.0 override → 20 − 2·10 = 0pp (no alpha)")

        # a malformed row is skipped, not fatal
        with open(os.path.join(prov, "bad.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\nnot-a-date,STK,oops\n2026-08-01,STK,130\n")
        feed2 = load_feed(td)
        check(feed2.close_on("STK", "2026-08-01") == 130.0, "good row read despite a sibling malformed row")

    print("[market_prices] selftest", "PASS" if ok else "FAIL")
    return ok


def main(argv):
    if "--selftest" in argv:
        return 0 if selftest() else 1
    feed = load_feed()
    if not feed.available():
        print(f"No market feed present under {os.path.relpath(FEED_ROOT, REPO)}/ — "
              f"drop a provider folder with `date,symbol,close` CSVs to enable benchmark-adjusted scoring.")
        return 0
    print(f"Market feed: providers={feed.providers}; symbols={len(feed.symbols())}; as_of={feed.as_of()}; files={len(feed.files)}")
    if "--print" in argv:
        print(json.dumps({"providers": feed.providers, "symbols": feed.symbols(),
                          "as_of": feed.as_of(), "files": feed.files}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
