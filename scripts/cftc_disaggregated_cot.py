#!/usr/bin/env python3
"""Shared strict transform for CFTC disaggregated futures-only positioning connectors."""
from __future__ import annotations

import argparse
import json
import re
import urllib.parse
from dataclasses import dataclass
from typing import Any

from connector_fetch_support import fetch_bytes, provenance, publish_pair


@dataclass(frozen=True)
class ContractSpec:
    contract: str
    contract_code: str
    instrument_label: str
    filename_stem: str
    verify_label: str
    host: str = "publicreporting.cftc.gov"
    dataset: str = "72hh-3qpy"
    history_length: int = 160
    minimum_history: int = 150
    max_response_bytes: int = 4 * 1024 * 1024


def source_url(spec: ContractSpec) -> str:
    query = {
        "cftc_contract_market_code": spec.contract_code,
        "$order": "report_date_as_yyyy_mm_dd DESC",
        "$limit": str(spec.history_length),
    }
    return f"https://{spec.host}/resource/{spec.dataset}.json?" + urllib.parse.urlencode(query)


def _integer(row: dict[str, Any], key: str) -> int:
    value = row.get(key)
    if isinstance(value, bool) or not isinstance(value, (str, int)) or re.fullmatch(r"(?:0|[1-9]\d*)", str(value)) is None:
        raise RuntimeError(f"CFTC source count {key!r} is not a nonnegative strict integer")
    parsed = int(value)
    if parsed > 9_007_199_254_740_991:
        raise RuntimeError(f"CFTC field {key!r} exceeds exact JSON integer range")
    return parsed


def build(rows: object, manifest: dict[str, Any], spec: ContractSpec):
    if not isinstance(rows, list) or len(rows) < spec.minimum_history:
        raise RuntimeError(
            f"CFTC {spec.verify_label} response lacks the required {spec.minimum_history} weekly observations"
        )
    observations = []
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or row.get("contract_market_name") != spec.contract or row.get("cftc_contract_market_code") != spec.contract_code:
            raise RuntimeError(f"CFTC response contains a contract outside {spec.verify_label}")
        day = str(row.get("report_date_as_yyyy_mm_dd", ""))[:10]
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) is None or day in seen:
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
    url = source_url(spec)
    payload = {
        "series": manifest["series"], "as_of": as_of, "contract": spec.contract,
        "contract_code": spec.contract_code, "observations": observations, "source_url": url,
    }
    latest = observations[-1]
    sidecar = provenance(
        manifest, as_of=as_of, source_url=url,
        note=(f"{spec.instrument_label} managed-money net {latest['managed_money_net']:+,}; "
              f"producer/merchant net {latest['producer_net']:+,} contracts."),
    )
    return as_of, payload, sidecar


def fetch(manifest: dict[str, Any], spec: ContractSpec):
    return json.loads(fetch_bytes(
        source_url(spec), manifest, max_bytes=spec.max_response_bytes,
    ).decode("utf-8", "strict"))


def main(manifest: dict[str, Any], spec: ContractSpec) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and not args.subject:
        parser.error("--subject is required unless --verify")
    as_of, payload, sidecar = build(fetch(manifest, spec), manifest, spec)
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} {spec.verify_label} COT rows through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug="cftc",
        filename=f"{spec.filename_stem}_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0
