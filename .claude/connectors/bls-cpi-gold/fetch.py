#!/usr/bin/env python3
"""Fetch ten-plus years of official, non-seasonally-adjusted CPI-U from BLS."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import os
import re
import sys

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
SERIES_ID = "CUUR0000SA0"
MAX_BYTES = 4 * 1024 * 1024


def source_url(start_year: int, end_year: int) -> str:
    return (
        f"https://api.bls.gov/publicAPI/v2/timeseries/data/{SERIES_ID}"
        f"?startyear={start_year}&endyear={end_year}"
    )


def build(documents: list[tuple[str, dict]], *, today: dt.date | None = None):
    current = today or dt.date.today()
    observations = {}
    for url, document in documents:
        if not isinstance(document, dict) or document.get("status") != "REQUEST_SUCCEEDED":
            raise RuntimeError("BLS API request did not succeed")
        results = document.get("Results")
        series = results.get("series") if isinstance(results, dict) else None
        if (
            not isinstance(series, list)
            or len(series) != 1
            or not isinstance(series[0], dict)
            or series[0].get("seriesID") != SERIES_ID
        ):
            raise RuntimeError("BLS API returned the wrong series identity")
        rows = series[0].get("data")
        if not isinstance(rows, list):
            raise RuntimeError("BLS API data rows are missing")
        for row in rows:
            if not isinstance(row, dict):
                raise RuntimeError("BLS API returned a malformed CPI row")
            year, period = str(row.get("year", "")), str(row.get("period", ""))
            if period == "M13":
                continue
            if not re.fullmatch(r"\d{4}", year) or not re.fullmatch(r"M(0[1-9]|1[0-2])", period):
                raise RuntimeError("BLS API returned a malformed CPI period")
            date = f"{year}-{period[1:]}-01"
            if date > current.isoformat() or date in observations:
                raise RuntimeError("BLS API returned a future or duplicate CPI period")
            raw_value = row.get("value")
            if raw_value is None or raw_value == "" or raw_value == "-":
                continue
            try:
                value = float(raw_value)
            except (TypeError, ValueError) as error:
                raise RuntimeError("BLS API returned a non-numeric CPI value") from error
            if not math.isfinite(value) or not 10 < value < 1000:
                raise RuntimeError("BLS CPI value is implausible")
            observations[date] = value
    ordered = [{"date": date, "index": observations[date]} for date in sorted(observations)]
    if len(ordered) < 120 or ordered[-1]["date"] < (current - dt.timedelta(days=75)).isoformat():
        raise RuntimeError("BLS CPI history is too short or stale")
    as_of = ordered[-1]["date"]
    urls = [url for url, _document in documents]
    payload = {
        "series": MANIFEST["series"], "as_of": as_of, "bls_series_id": SERIES_ID,
        "seasonal_adjustment": "not seasonally adjusted", "observations": ordered,
        "source_urls": urls, "historical_replay_policy": "retrieval_vintages_only",
    }
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=urls[-1], source_urls=urls,
        note=(f"Official BLS CPI-U series {SERIES_ID}; {len(ordered)} monthly observations. "
              "Historical decisions may use only connector retrieval vintages already known then."),
    )
    return as_of, payload, sidecar


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and not args.subject:
        parser.error("--subject is required unless --verify")
    current_year = dt.date.today().year
    windows = [(current_year - 10, current_year - 1), (current_year, current_year)]
    documents = []
    for start_year, end_year in windows:
        url = source_url(start_year, end_year)
        try:
            document = json.loads(fetch_bytes(url, MANIFEST, max_bytes=MAX_BYTES).decode("utf-8", "strict"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise RuntimeError("BLS API response is not valid UTF-8 JSON") from error
        documents.append((url, document))
    as_of, payload, sidecar = build(documents)
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} BLS CPI observations through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug="bls",
        filename=f"consumer_price_index_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
