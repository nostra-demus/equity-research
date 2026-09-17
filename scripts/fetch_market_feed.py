#!/usr/bin/env python3
"""fetch_market_feed.py — write the benchmark daily-close feed that market_prices.py and the fund book read.

WHY A SCRIPT AND NOT A CONNECTOR. `frameworks/connector.schema.json` fixes every connector's output to
`data/<SUBJECT>/external/….json` — a JSON document ABOUT one subject. A benchmark belongs to no subject:
the fund book measures its whole return against it, and `scripts/market_prices.py` reads the same series
to judge every call on a benchmark-adjusted basis. Bending that schema to admit a cross-cutting CSV
would change the contract all 27 connectors are validated against, to carry one series that is not a
subject document. `market_prices.py` already names the alternative in its own docstring — the feed is a
FILE DROP written by "a fetcher (or the user)" — so this is that fetcher.

WHY THE INDEX AND NOT AN ETF TRACKING IT. The brief asks for "return vs S&P 500". An ETF carries its own
fee drag and its own premium or discount to net asset value; charging the manager for those, or
crediting them, measures the fund against something it never had a view on.

It still goes through the connectors' SSRF boundary (`scripts/connector_http.py` via `fetch_bytes`), so
this cannot be pointed at an arbitrary host any more than a connector could.

WHAT IT WRITES. Two series down the same lane: the S&P 500 daily close the fund book measures itself
against, and the 3-month Treasury-bill rate (FRED DTB3) that is the cash hurdle inside every Sharpe and
Sortino on that screen (Calmar is return over drawdown alone — no cash rate in it — so it is not one of
these). The hurdle used to be a constant in the server, dated and sourced but unable to help going stale
— written in January, still current in September. It belongs in the feed that is already refreshed every
morning.

    python3 scripts/fetch_market_feed.py            # write data/_market/fred/{sp500,dtb3}_<as_of>.csv
    python3 scripts/fetch_market_feed.py --verify   # check the parsers, fetch nothing
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import math
import os
import sys
from typing import NamedTuple

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.append(HERE)
from connector_fetch_support import fetch_bytes  # noqa: E402

SYMBOL = "SP500"
SOURCE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500"
MAX_BYTES = 8 * 1024 * 1024
# The same shape fetch_bytes wants from a connector manifest: an id for the request header and the
# allowlist the SSRF boundary pins against.
SOURCE = {"id": "fetch-market-feed", "host_allowlist": ["fred.stlouisfed.org"]}
PROVIDER_SLUG = "fred"


class Series(NamedTuple):
    """One FRED series and how its file must describe itself.

    `positive_only` is the difference that matters between the two: an index level of zero is nonsense and
    is dropped as a bad row, while a rate of 0.00% is a fact — three-month bills printed it for months in
    2020-21, and dropping those days would leave the last rate before them standing as today's.
    """
    symbol: str
    slug: str
    url: str
    positive_only: bool
    decimals: int
    units: str
    license: str
    licensing: dict
    description: str
    note: str


SP500 = Series(
    symbol=SYMBOL, slug="sp500", url=SOURCE_URL, positive_only=True, decimals=2,
    units="index level (S&P 500 points)",
    # The S&P 500 is NOT public-domain FRED data: the observations are proprietary to S&P Dow Jones
    # Indices LLC. FRED serves them free to access and use, but reproduction/redistribution is
    # prohibited without S&P DJI permission, so the machine-enforced rights must say so.
    license="proprietary",
    licensing={"access": "public", "use": "allowed", "redistribution": "prohibited",
               "terms_url": "https://fred.stlouisfed.org/legal/"},
    description="S&P 500 index — daily close (FRED series SP500; © S&P Dow Jones Indices LLC)",
    note="Index level, not an ETF. Market holidays are omitted. S&P 500 is proprietary to "
         "S&P Dow Jones Indices LLC — free to access and use via FRED as an internal benchmark "
         "reference, but reproduction/redistribution is prohibited without S&P DJI permission.",
)
DTB3 = Series(
    symbol="DTB3", slug="dtb3", url="https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTB3",
    positive_only=False, decimals=2,
    units="percent per year (discount basis, secondary market)",
    # US Treasury data published by the Federal Reserve: public domain, unlike the index above.
    license="public_domain",
    licensing={"access": "public", "use": "allowed", "redistribution": "allowed",
               "terms_url": "https://fred.stlouisfed.org/legal/"},
    description="3-month US Treasury bill, secondary market rate — daily (FRED series DTB3)",
    note="The cash hurdle behind every Sharpe and Sortino in the fund book (Calmar has no cash rate in "
         "it). A rate, not a price: 0.00 is a real observation and is kept. Market holidays are omitted.",
)
FEEDS = (SP500, DTB3)


def parse(raw: bytes, series: Series = SP500) -> list[tuple[str, float]]:
    """FRED emits `observation_date,<SERIES>`, writing `.` for a day the series did not print.

    A market holiday is not a zero and not yesterday's close carried forward — it is simply absent, and
    the readers treat a short gap at a window edge as a closed market. So an unparseable value is
    DROPPED rather than filled, which keeps the series honest about which days actually traded.
    """
    text = raw.decode("utf-8-sig", errors="replace")
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        raise RuntimeError("FRED returned an empty CSV")
    header = [c.strip().lower() for c in rows[0]]
    if len(header) < 2 or not header[0].startswith("observation_date"):
        raise RuntimeError(f"unexpected FRED header: {rows[0]!r}")
    # THE COLUMN MUST BE THE SERIES ASKED FOR, not merely a well-formed FRED CSV. `parse` is now shared by
    # both series (SP500 and DTB3): a cached, misrouted, or otherwise wrong response — e.g. a stale
    # `observation_date,SP500` body served back for a DTB3 request — would otherwise be accepted, and
    # index LEVELS (~7,000) would be written under the DTB3 filename and provenance as if they were a
    # PERCENT rate, corrupting every Sharpe/Sortino/hurdle the TypeScript reader charges against them.
    if header[1] != series.symbol.lower():
        raise RuntimeError(f"expected the {series.symbol} column, got {rows[0]!r}")
    out: list[tuple[str, float]] = []
    for row in rows[1:]:
        if len(row) < 2:
            continue
        date = row[0].strip()
        try:
            dt.date.fromisoformat(date)
            close = float(row[1].strip())
        except ValueError:
            continue  # '.' on a market holiday, or a malformed line
        # `float()` parses "nan" and the infinities without raising, so a positive_only=False series
        # (DTB3) cannot rely on the ValueError above to keep them out. A non-finite rate is not a real
        # observation — it would be written and reported as a successful fresh feed, then silently
        # discarded by the TypeScript reader (Number.isFinite in market-feed.ts), leaving the sidecar
        # claiming a refresh that never actually happened.
        if not math.isfinite(close):
            continue
        if close > 0 or not series.positive_only:
            out.append((date, close))
    if not out:
        raise RuntimeError("FRED returned no usable observations")
    out.sort()
    return out


def write_feed(data_root: str, observations: list[tuple[str, float]], series: Series = SP500) -> str:
    """Write the long-format `date,symbol,close` CSV the market lane documents, plus its provenance."""
    as_of = observations[-1][0]
    directory = os.path.join(data_root, "_market", PROVIDER_SLUG)
    os.makedirs(directory, exist_ok=True)
    path = os.path.join(directory, f"{series.slug}_{as_of}.csv")
    # Written whole then renamed: a reader that caught a half-written file would otherwise compute a
    # benchmark return over a truncated window and report it as real.
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["date", "symbol", "close"])
        for date, close in observations:
            writer.writerow([date, series.symbol, f"{close:.{series.decimals}f}"])
    os.replace(tmp, path)

    sidecar = {
        "provider": "FRED",
        "source_type": "official_data",
        "tier": 5,
        "as_of": as_of,
        "received": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "source_url": series.url,
        # Rights travel per series: the index is proprietary to S&P Dow Jones Indices LLC, the Treasury
        # rate is public domain. Enum values follow the licensing schema in frameworks/EXTERNAL_DATA.md §7
        # (access/use/redistribution).
        "license": series.license,
        "licensing": dict(series.licensing),
        "series": series.description,
        "series_id": series.symbol,
        "units": series.units,
        "note": f"{len(observations)} daily observations, {observations[0][0]} to {as_of}. {series.note}",
    }
    tmp_side = path + ".source.json.tmp"
    with open(tmp_side, "w", encoding="utf-8") as fh:
        json.dump(sidecar, fh, indent=2, sort_keys=True)
        fh.write("\n")
    os.replace(tmp_side, path + ".source.json")
    return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-root", default=None, help="repo data/ directory (default: the repo's own)")
    parser.add_argument("--verify", action="store_true", help="check the parser, fetch nothing")
    args = parser.parse_args()

    if args.verify:
        sample = b"observation_date,SP500\n2026-08-21,7674.37\n2026-08-22,.\n2026-08-24,7652.86\n"
        assert parse(sample) == [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)]
        rate = b"observation_date,DTB3\n2021-01-04,0.09\n2021-01-05,.\n2021-01-06,0.00\n"
        assert parse(rate, DTB3) == [("2021-01-04", 0.09), ("2021-01-06", 0.0)]
        print("fetch_market_feed: parsers ok")
        return 0

    data_root = args.data_root or os.path.join(os.path.dirname(HERE), "data")
    # Each series is fetched and written on its own: a hiccup on one must not cost the day's refresh of
    # the other, so both are attempted and the exit code reports whether either failed.
    failed = 0
    for series in FEEDS:
        try:
            observations = parse(fetch_bytes(series.url, SOURCE, max_bytes=MAX_BYTES, timeout=30), series)
            path = write_feed(data_root, observations, series)
            print(f"fetch_market_feed: {series.symbol} — {len(observations)} through {observations[-1][0]} -> {path}")
        except Exception as exc:  # noqa: BLE001 — one series failing is reported, not raised over the other
            failed += 1
            print(f"fetch_market_feed: {series.symbol} FAILED — {exc}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
