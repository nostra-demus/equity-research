#!/usr/bin/env python3
"""Fetch weekly Lower 48 working-gas storage from the official EIA API v2."""
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
SERIES_ID = "NG.NW2_EPG0_SWO_R48_BCF.W"
SERIES_CODE = "NW2_EPG0_SWO_R48_BCF"
EXPECTED_UNITS = "BCF"
HISTORY_LENGTH = 270
MAX_RESPONSE_BYTES = 2 * 1024 * 1024


def source_url() -> str:
    query = urllib.parse.urlencode({"length": str(HISTORY_LENGTH)})
    return f"https://{HOST}/v2/seriesid/{urllib.parse.quote(SERIES_ID, safe='.-')}?{query}"


def build(document: object):
    if not isinstance(document, dict):
        raise RuntimeError("EIA response is not an object")
    response = document.get("response")
    if not isinstance(response, dict):
        raise RuntimeError("EIA response lacks the required five-year weekly storage history")
    rows = response.get("data")
    if response.get("frequency") != "weekly" or not isinstance(rows, list) or len(rows) < 262:
        raise RuntimeError("EIA response lacks the required five-year weekly storage history")
    observations = []
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or row.get("series") != SERIES_CODE or row.get("units") != EXPECTED_UNITS:
            raise RuntimeError("EIA storage series or units changed")
        day = row.get("period")
        value = row.get("value")
        if not isinstance(day, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) is None or day in seen:
            raise RuntimeError("EIA response has a malformed or duplicate period")
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)) or value < 0 or not float(value).is_integer():
            raise RuntimeError("EIA working-gas observation is not a nonnegative whole number")
        seen.add(day)
        observations.append({"date": day, "working_gas_bcf": int(value)})
    observations.sort(key=lambda row: row["date"])
    as_of = observations[-1]["date"]
    url = source_url()
    payload = {
        "series": MANIFEST["series"], "as_of": as_of, "series_code": SERIES_CODE,
        "observations": observations, "source_url": url,
    }
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=url,
        note=f"Lower 48 working gas {observations[-1]['working_gas_bcf']:,} Bcf.",
    )
    return as_of, payload, sidecar


def fetch():
    credential = os.environ.get(MANIFEST["credential_env"][0], "")
    if not credential:
        raise RuntimeError(f"missing required credential {MANIFEST['credential_env'][0]}")
    raw = fetch_bytes_with_query_credential(
        source_url(), MANIFEST, query_key="api_key", credential=credential,
        max_bytes=MAX_RESPONSE_BYTES,
    )
    try:
        return json.loads(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("EIA returned invalid UTF-8 JSON") from error


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and not args.subject:
        parser.error("--subject is required unless --verify")
    as_of, payload, sidecar = build(fetch())
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} EIA gas-storage rows through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug="eia",
        filename=f"natural_gas_storage_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
