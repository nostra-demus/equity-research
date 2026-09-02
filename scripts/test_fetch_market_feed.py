#!/usr/bin/env python3
"""Offline tests for the benchmark feed fetcher — parsing, and the file shape its readers depend on."""
from __future__ import annotations

import csv
import datetime as dt
import json
import os
import sys
import tempfile

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import fetch_market_feed as M  # noqa: E402

FAILURES: list[str] = []


def check(name: str, fn) -> None:
    try:
        fn()
        print(f"  ok   {name}")
    except Exception as exc:  # noqa: BLE001 — a harness reports, it does not raise
        FAILURES.append(name)
        print(f"  FAIL {name}\n       {exc}")


def test_holiday_is_dropped_not_filled() -> None:
    # FRED prints '.' for a day the index did not trade. A holiday is not a zero and not yesterday's
    # close carried forward — filling it would invent a flat day inside every return computed from it.
    rows = M.parse(b"observation_date,SP500\n2026-08-21,7674.37\n2026-08-22,.\n2026-08-24,7652.86\n")
    assert rows == [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)], rows


def test_junk_is_skipped_and_order_forced() -> None:
    raw = b"observation_date,SP500\n2026-08-24,7652.86\nnot-a-date,1\n2026-08-21,7674.37\n2026-08-23,-4\n\n"
    assert M.parse(raw) == [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)]


def test_wrong_shape_is_refused_not_half_read() -> None:
    for raw in (b"", b"date,close\n2026-08-21,1\n", b"observation_date,SP500\n"):
        try:
            M.parse(raw)
        except RuntimeError:
            continue
        raise AssertionError(f"expected a refusal for {raw!r}")


def test_it_writes_the_shape_the_readers_expect() -> None:
    # `date,symbol,close` in data/_market/<provider>/ is the contract market_prices.py documents and the
    # fund book's benchmark comparison reads. A fetcher that writes its own shape is invisible to both.
    with tempfile.TemporaryDirectory() as tmp:
        path = M.write_feed(tmp, [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)])
        assert path.endswith(os.path.join("_market", "fred", "sp500_2026-08-24.csv")), path
        with open(path, encoding="utf-8") as fh:
            rows = list(csv.reader(fh))
        assert rows[0] == ["date", "symbol", "close"], rows[0]
        assert rows[1] == ["2026-08-21", "SP500", "7674.37"], rows[1]
        assert len(rows) == 3, rows
        with open(path + ".source.json", encoding="utf-8") as fh:
            sidecar = json.load(fh)
        assert sidecar["as_of"] == "2026-08-24"
        # SP500 is proprietary to S&P Dow Jones Indices LLC — FRED serves it free to access and use, but
        # reproduction/redistribution is prohibited, so the sidecar must NOT claim public-domain /
        # redistributable rights. Enum values follow frameworks/EXTERNAL_DATA.md §7
        # (redistribution ∈ allowed | derived_only | prohibited | unknown).
        assert sidecar["license"] == "proprietary", sidecar["license"]
        assert sidecar["licensing"]["redistribution"] == "prohibited", sidecar["licensing"]
        assert sidecar["licensing"]["use"] == "allowed", sidecar["licensing"]
        received = dt.datetime.fromisoformat(sidecar["received"].replace("Z", "+00:00"))
        assert sidecar["received"].endswith("Z") and received.tzinfo is not None


def test_the_host_is_pinned() -> None:
    # It reaches the network through the connectors' own SSRF boundary, so it cannot be redirected at
    # an arbitrary host any more than a connector could.
    assert M.SOURCE["host_allowlist"] == ["fred.stlouisfed.org"]
    assert M.SOURCE_URL.startswith("https://fred.stlouisfed.org/")


def main() -> int:
    check("a market holiday is dropped, never filled", test_holiday_is_dropped_not_filled)
    check("junk rows are skipped and the series is sorted", test_junk_is_skipped_and_order_forced)
    check("a wrong-shaped response is refused, not half-read", test_wrong_shape_is_refused_not_half_read)
    check("the feed is written in the shape the readers expect", test_it_writes_the_shape_the_readers_expect)
    check("the source host is pinned to the SSRF allowlist", test_the_host_is_pinned)
    print(f"\n{5 - len(FAILURES)} passed, {len(FAILURES)} failed")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    raise SystemExit(main())
