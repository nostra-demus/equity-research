#!/usr/bin/env python3
"""Fetch weekly US commercial and SPR crude stocks from the official EIA API v2."""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
import urllib.parse

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import (  # noqa: E402
    fetch_bytes_with_query_credential, load_manifest, provenance, publish_pair,
)

MANIFEST = load_manifest(__file__)
HOST = "api.eia.gov"
SERIES = {
    "commercial": ("PET.WCESTUS1.W", "WCESTUS1"),
    "spr": ("PET.WCSSTUS1.W", "WCSSTUS1"),
}
EXPECTED_UNITS = "MBBL"
HISTORY_LENGTH = 180
MAX_RESPONSE_BYTES = 2 * 1024 * 1024


def source_url(series_id: str) -> str:
    query = urllib.parse.urlencode({"length": str(HISTORY_LENGTH)})
    return f"https://{HOST}/v2/seriesid/{urllib.parse.quote(series_id, safe='.-')}?{query}"


def _observations(document: object, expected_code: str) -> dict[str, int]:
    if not isinstance(document, dict):
        raise RuntimeError("EIA response is not an object")
    response = document.get("response")
    if not isinstance(response, dict):
        raise RuntimeError("EIA response lacks the required weekly history")
    rows = response.get("data")
    if response.get("frequency") != "weekly" or not isinstance(rows, list) or len(rows) < 150:
        raise RuntimeError("EIA response lacks the required weekly history")
    observations: dict[str, int] = {}
    for row in rows:
        if not isinstance(row, dict) or row.get("series") != expected_code or row.get("units") != EXPECTED_UNITS:
            raise RuntimeError("EIA response series or units changed")
        day = row.get("period")
        value = row.get("value")
        if not isinstance(day, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) is None or day in observations:
            raise RuntimeError("EIA response has a malformed or duplicate period")
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)) or value < 0 or not float(value).is_integer():
            raise RuntimeError("EIA stock observation is not a nonnegative whole number")
        observations[day] = int(value)
    return observations


def build(commercial_document: object, spr_document: object):
    commercial = _observations(commercial_document, SERIES["commercial"][1])
    spr = _observations(spr_document, SERIES["spr"][1])
    if set(commercial) != set(spr):
        raise RuntimeError("EIA commercial and SPR histories do not share the same weekly periods")
    observations = []
    for day in sorted(commercial):
        observations.append({
            "date": day,
            "commercial_crude_stocks_thousand_bbl": commercial[day],
            "spr_crude_stocks_thousand_bbl": spr[day],
            "total_observed_crude_stocks_thousand_bbl": commercial[day] + spr[day],
        })
    if len(observations) < 150:
        raise RuntimeError("EIA aligned inventory history is too short")
    as_of = observations[-1]["date"]
    urls = [source_url(SERIES[name][0]) for name in ("commercial", "spr")]
    payload = {
        "series": MANIFEST["series"], "as_of": as_of,
        "observations": observations, "source_urls": urls,
    }
    latest = observations[-1]
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=urls[0], source_urls=urls,
        note=(f"US commercial crude stocks {latest['commercial_crude_stocks_thousand_bbl']:,} thousand bbl; "
              f"SPR {latest['spr_crude_stocks_thousand_bbl']:,} thousand bbl."),
    )
    return as_of, payload, sidecar


def _fetch_one(series_id: str, credential: str) -> object:
    raw = fetch_bytes_with_query_credential(
        source_url(series_id), MANIFEST, query_key="api_key", credential=credential,
        max_bytes=MAX_RESPONSE_BYTES,
    )
    try:
        return json.loads(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("EIA returned invalid UTF-8 JSON") from error


def fetch():
    credential = os.environ.get(MANIFEST["credential_env"][0], "")
    if not credential:
        raise RuntimeError(f"missing required credential {MANIFEST['credential_env'][0]}")
    return (_fetch_one(SERIES["commercial"][0], credential), _fetch_one(SERIES["spr"][0], credential))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and not args.subject:
        parser.error("--subject is required unless --verify")
    as_of, payload, sidecar = build(*fetch())
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} aligned EIA crude-inventory rows through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug="eia",
        filename=f"crude_inventory_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
