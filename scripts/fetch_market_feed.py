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

    python3 scripts/fetch_market_feed.py            # write data/_market/fred/sp500_<as_of>.csv
    python3 scripts/fetch_market_feed.py --verify   # check the parser, fetch nothing
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import os
import sys

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


def parse(raw: bytes) -> list[tuple[str, float]]:
    """FRED emits `observation_date,SP500`, writing `.` for a day the index did not print.

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
        if close > 0:
            out.append((date, close))
    if not out:
        raise RuntimeError("FRED returned no usable observations")
    out.sort()
    return out


def write_feed(data_root: str, observations: list[tuple[str, float]]) -> str:
    """Write the long-format `date,symbol,close` CSV the market lane documents, plus its provenance."""
    as_of = observations[-1][0]
    directory = os.path.join(data_root, "_market", PROVIDER_SLUG)
    os.makedirs(directory, exist_ok=True)
    path = os.path.join(directory, f"sp500_{as_of}.csv")
    # Written whole then renamed: a reader that caught a half-written file would otherwise compute a
    # benchmark return over a truncated window and report it as real.
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["date", "symbol", "close"])
        for date, close in observations:
            writer.writerow([date, SYMBOL, f"{close:.2f}"])
    os.replace(tmp, path)

    sidecar = {
        "provider": "FRED",
        "source_type": "official_data",
        "tier": 5,
        "as_of": as_of,
        "received": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "source_url": SOURCE_URL,
        "license": "public_domain",
        "licensing": {"access": "public", "use": "allowed", "redistribution": "allowed",
                      "terms_url": "https://fred.stlouisfed.org/legal/"},
        "series": "S&P 500 index — daily close (FRED, sourced from S&P Dow Jones Indices)",
        "series_id": SYMBOL,
        "units": "index level (S&P 500 points)",
        "note": f"{len(observations)} daily closes, {observations[0][0]} to {as_of}. "
                "Index level, not an ETF. Market holidays are omitted.",
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
        print("fetch_market_feed: parser ok")
        return 0

    data_root = args.data_root or os.path.join(os.path.dirname(HERE), "data")
    observations = parse(fetch_bytes(SOURCE_URL, SOURCE, max_bytes=MAX_BYTES, timeout=30))
    path = write_feed(data_root, observations)
    print(f"fetch_market_feed: {len(observations)} closes through {observations[-1][0]} -> {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
