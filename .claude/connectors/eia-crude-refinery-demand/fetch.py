#!/usr/bin/env python3
"""Fetch aligned weekly US refinery-input and product-supplied series from EIA."""
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
HISTORY_LENGTH = 180
MAX_RESPONSE_BYTES = 3 * 1024 * 1024
SERIES = {
    "refinery_gross_inputs_thousand_bpd": {
        "id": "PET.WGIRIUS2.W", "code": "WGIRIUS2", "product": "EPXXX2",
        "product_name": "Gross Inputs", "process": "YIY", "process_name": "Refinery Net Input",
        "description": "U.S. Gross Inputs into Refineries (Thousand Barrels per Day)",
    },
    "total_products_supplied_thousand_bpd": {
        "id": "PET.WRPUPUS2.W", "code": "WRPUPUS2", "product": "EPP0",
        "product_name": "Total Petroleum Products", "process": "VPP", "process_name": "Product Supplied",
        "description": "U.S. Product Supplied of Petroleum Products (Thousand Barrels per Day)",
    },
    "gasoline_supplied_thousand_bpd": {
        "id": "PET.WGFUPUS2.W", "code": "WGFUPUS2", "product": "EPM0F",
        "product_name": "Finished Motor Gasoline", "process": "VPP", "process_name": "Product Supplied",
        "description": "U.S. Product Supplied of Finished Motor Gasoline (Thousand Barrels per Day)",
    },
    "distillate_supplied_thousand_bpd": {
        "id": "PET.WDIUPUS2.W", "code": "WDIUPUS2", "product": "EPD0",
        "product_name": "Distillate Fuel Oil", "process": "VPP", "process_name": "Product Supplied",
        "description": "U.S. Product Supplied of Distillate Fuel Oil (Thousand Barrels per Day)",
    },
    "jet_fuel_supplied_thousand_bpd": {
        "id": "PET.WKJUPUS2.W", "code": "WKJUPUS2", "product": "EPJK",
        "product_name": "Kerosene-Type Jet Fuel", "process": "VPP", "process_name": "Product Supplied",
        "description": "U.S. Product Supplied of Kerosene-Type Jet Fuel (Thousand Barrels per Day)",
    },
}


def source_url() -> str:
    query: list[tuple[str, str]] = [
        ("frequency", "weekly"), ("data[0]", "value"),
        *(("facets[series][]", identity["code"]) for identity in SERIES.values()),
        ("sort[0][column]", "period"), ("sort[0][direction]", "desc"),
        ("offset", "0"), ("length", str(HISTORY_LENGTH * len(SERIES))),
    ]
    return f"https://{HOST}/v2/petroleum/sum/sndw/data/?{urllib.parse.urlencode(query)}"


def _number(value: object) -> int:
    if isinstance(value, bool):
        raise RuntimeError("EIA weekly petroleum value is not a nonnegative whole number")
    if isinstance(value, str):
        if re.fullmatch(r"(?:0|[1-9]\d*)", value) is None:
            raise RuntimeError("EIA weekly petroleum value is not a nonnegative whole number")
        return int(value)
    if (
        not isinstance(value, (int, float)) or not math.isfinite(float(value))
        or value < 0 or not float(value).is_integer()
    ):
        raise RuntimeError("EIA weekly petroleum value is not a nonnegative whole number")
    return int(value)


def _histories(document: object) -> dict[str, dict[str, int]]:
    if not isinstance(document, dict):
        raise RuntimeError("EIA response is not an object")
    response = document.get("response")
    if not isinstance(response, dict) or response.get("frequency") != "weekly":
        raise RuntimeError("EIA response lacks the required weekly series")
    rows = response.get("data")
    if not isinstance(rows, list) or len(rows) < 150 * len(SERIES):
        raise RuntimeError("EIA response lacks the required three-year weekly history")
    by_code = {identity["code"]: (field, identity) for field, identity in SERIES.items()}
    result: dict[str, dict[str, int]] = {field: {} for field in SERIES}
    for row in rows:
        code = row.get("series") if isinstance(row, dict) else None
        if code not in by_code:
            raise RuntimeError("EIA weekly petroleum response contains an unrequested series")
        field, identity = by_code[code]
        expected = {
            "duoarea": "NUS", "area-name": "U.S.", "product": identity["product"],
            "product-name": identity["product_name"], "process": identity["process"],
            "process-name": identity["process_name"], "series": identity["code"],
            "series-description": identity["description"], "units": "MBBL/D",
        }
        if not isinstance(row, dict) or any(row.get(field) != value for field, value in expected.items()):
            raise RuntimeError("EIA weekly petroleum series identity changed")
        day, value = row.get("period"), row.get("value")
        if not isinstance(day, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) is None or day in result[field]:
            raise RuntimeError("EIA weekly petroleum period is malformed or duplicated")
        result[field][day] = _number(value)
    if any(len(history) < 150 for history in result.values()):
        raise RuntimeError("EIA response lacks one or more required weekly histories")
    return result


def build(document: object):
    histories = _histories(document)
    periods = set(next(iter(histories.values())))
    if any(set(history) != periods for history in histories.values()):
        raise RuntimeError("EIA refinery and product-supplied histories are not date-aligned")
    observations = [
        {"date": day, **{field: histories[field][day] for field in SERIES}}
        for day in sorted(periods)
    ]
    if len(observations) < 150:
        raise RuntimeError("EIA aligned refinery-demand history is too short")
    as_of = observations[-1]["date"]
    urls = [source_url()]
    payload = {
        "series": MANIFEST["series"], "as_of": as_of, "geography": "United States",
        "observations": observations, "source_urls": urls,
    }
    latest = observations[-1]
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=urls[0], source_urls=urls,
        note=(f"US-only demand proxy. Latest refinery gross inputs "
              f"{latest['refinery_gross_inputs_thousand_bpd']:,} and total products supplied "
              f"{latest['total_products_supplied_thousand_bpd']:,} thousand bbl/day; do not infer global demand."),
    )
    return as_of, payload, sidecar


def fetch() -> object:
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
    if not args.verify and args.subject != "CRUDE-OIL":
        parser.error("--subject must be CRUDE-OIL unless --verify")
    as_of, payload, sidecar = build(fetch())
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} aligned EIA refinery-demand rows through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug="eia",
        filename=f"refinery_demand_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
