#!/usr/bin/env python3
"""Fetch the Fed's broad dollar index through the official FRED CSV route."""
from __future__ import annotations

import argparse
import csv
import io
import math
import os
import re
import sys
from datetime import date, timedelta

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
SERIES_ID = "DTWEXBGS"
START_DATE = date.today() - timedelta(days=5 * 366)
URL = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES_ID}&cosd={START_DATE.isoformat()}"
MAX_RESPONSE_BYTES = 4 * 1024 * 1024


def build(text: str):
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != ["observation_date", SERIES_ID]:
        raise RuntimeError(f"unexpected FRED CSV header {reader.fieldnames!r}")
    rows = []
    seen = set()
    for raw in reader:
        day = str(raw.get("observation_date", ""))
        value = str(raw.get(SERIES_ID, ""))
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) or day in seen:
            raise RuntimeError("FRED response has a malformed or duplicate date")
        seen.add(day)
        if value in {"", "."}:
            continue
        try:
            parsed = float(value)
        except ValueError as error:
            raise RuntimeError("FRED response has a non-numeric index value") from error
        if not math.isfinite(parsed) or parsed <= 0 or parsed > 1000:
            raise RuntimeError("FRED broad-dollar index is outside the plausible range")
        rows.append({"date": day, "index": parsed})
    rows.sort(key=lambda row: row["date"])
    if len(rows) < 750:
        raise RuntimeError("FRED response lacks 750 usable daily observations")
    as_of = rows[-1]["date"]
    payload = {"series": MANIFEST["series"], "as_of": as_of, "fred_series_id": SERIES_ID,
               "observations": rows, "source_url": URL}
    sidecar = provenance(MANIFEST, as_of=as_of, source_url=URL,
                         note=f"Broad dollar index {rows[-1]['index']:.4f} on {as_of}; higher means USD appreciation.")
    return as_of, payload, sidecar


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    text = fetch_bytes(URL, MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "strict")
    as_of, payload, sidecar = build(text)
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} DTWEXBGS rows through {as_of}")
        return 0
    if not args.subject:
        parser.error("--subject is required unless --verify")
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="fred",
                        filename=f"broad_usd_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
