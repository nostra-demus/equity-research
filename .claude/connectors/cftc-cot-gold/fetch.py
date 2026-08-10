#!/usr/bin/env python3
"""Fetch three years of COMEX Gold positioning from the CFTC public API."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.parse

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
HOST = "publicreporting.cftc.gov"
DATASET = "72hh-3qpy"
CONTRACT = "GOLD"
CONTRACT_CODE = "088691"
MAX_RESPONSE_BYTES = 4 * 1024 * 1024


def source_url() -> str:
    query = {
        "cftc_contract_market_code": CONTRACT_CODE,
        "$order": "report_date_as_yyyy_mm_dd DESC",
        "$limit": "160",
    }
    return f"https://{HOST}/resource/{DATASET}.json?" + urllib.parse.urlencode(query)


def _integer(row: dict, key: str) -> int:
    value = row.get(key)
    if isinstance(value, bool) or not isinstance(value, (str, int)) or not re.fullmatch(r"-?(?:0|[1-9]\d*)", str(value)):
        raise RuntimeError(f"CFTC field {key!r} is not a strict integer")
    parsed = int(value)
    if abs(parsed) > 9_007_199_254_740_991:
        raise RuntimeError(f"CFTC field {key!r} exceeds exact JSON integer range")
    return parsed


def build(rows: object):
    if not isinstance(rows, list) or len(rows) < 150:
        raise RuntimeError("CFTC Gold response lacks the required 150 weekly observations")
    observations = []
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or row.get("contract_market_name") != CONTRACT or row.get("cftc_contract_market_code") != CONTRACT_CODE:
            raise RuntimeError("CFTC response contains a non-Gold contract")
        day = str(row.get("report_date_as_yyyy_mm_dd", ""))[:10]
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) or day in seen:
            raise RuntimeError("CFTC response has a malformed or duplicate report date")
        seen.add(day)
        mm_long = _integer(row, "m_money_positions_long_all")
        mm_short = _integer(row, "m_money_positions_short_all")
        producer_long = _integer(row, "prod_merc_positions_long")
        producer_short = _integer(row, "prod_merc_positions_short")
        observations.append({
            "date": day,
            "open_interest": _integer(row, "open_interest_all"),
            "managed_money_long": mm_long,
            "managed_money_short": mm_short,
            "managed_money_net": mm_long - mm_short,
            "producer_long": producer_long,
            "producer_short": producer_short,
            "producer_net": producer_long - producer_short,
        })
    observations.sort(key=lambda row: row["date"])
    as_of = observations[-1]["date"]
    url = source_url()
    payload = {
        "series": MANIFEST["series"], "as_of": as_of, "contract": CONTRACT,
        "contract_code": CONTRACT_CODE, "observations": observations, "source_url": url,
    }
    latest = observations[-1]
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=url,
        note=(f"COMEX Gold managed-money net {latest['managed_money_net']:+,}; "
              f"producer/merchant net {latest['producer_net']:+,} contracts."),
    )
    return as_of, payload, sidecar


def fetch():
    return json.loads(fetch_bytes(source_url(), MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    as_of, payload, sidecar = build(fetch())
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} Gold COT rows through {as_of}")
        return 0
    if not args.subject:
        parser.error("--subject is required unless --verify")
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="cftc",
                        filename=f"cot_gold_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
