#!/usr/bin/env python3
"""Shared fail-closed USDA FAS weekly Export Sales Reporting connector."""
from __future__ import annotations

import argparse
import json
import os
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from pathlib import Path
from typing import Any

from connector_contract import validate_manifest, validate_staged_output
from connector_fetch_support import (
    fetch_bytes_with_header_credential,
    load_manifest,
    provenance,
    publish_pair,
)


HOST = "api.fas.usda.gov"
BASE = f"https://{HOST}/api/esr"
METADATA_URLS = {
    "commodities": f"{BASE}/commodities",
    "countries": f"{BASE}/countries",
    "units": f"{BASE}/unitsOfMeasure",
    "release_dates": f"{BASE}/datareleasedates",
}
HISTORY_MARKET_YEARS = 6
MINIMUM_DATES = 260
MINIMUM_SPAN_DAYS = 1825
MAX_METADATA_BYTES = 2 * 1024 * 1024
MAX_EXPORT_BYTES = 8 * 1024 * 1024
MAX_PARALLEL_REQUESTS = 4
ROW_FIELDS = {
    "commodityCode", "countryCode", "weeklyExports", "accumulatedExports",
    "outstandingSales", "grossNewSales", "currentMYNetSales",
    "currentMYTotalCommitment", "nextMYOutstandingSales", "nextMYNetSales",
    "unitId", "weekEndingDate",
}
VALUE_FIELDS = {
    "weekly_exports": "weeklyExports",
    "accumulated_exports": "accumulatedExports",
    "outstanding_sales": "outstandingSales",
    "gross_new_sales": "grossNewSales",
    "current_market_year_net_sales": "currentMYNetSales",
    "current_market_year_total_commitment": "currentMYTotalCommitment",
    "next_market_year_outstanding_sales": "nextMYOutstandingSales",
    "next_market_year_net_sales": "nextMYNetSales",
}


def load_config(fetch_file: str) -> dict[str, Any]:
    path = Path(fetch_file).resolve().parent / "feed.json"
    value = json.loads(path.read_text(encoding="utf-8"))
    if (
        not isinstance(value, dict)
        or set(value) != {
            "config_version", "subject", "commodity", "provider_slug",
            "filename_stem", "note", "commodity_codes",
        }
        or value.get("config_version") != 1
        or value.get("subject") not in {"CORN", "SOYBEANS", "WHEAT", "COTTON"}
        or value.get("commodity") != value.get("subject")
        or not all(
            isinstance(value.get(field), str) and value[field]
            for field in ("provider_slug", "filename_stem", "note")
        )
        or not isinstance(value.get("commodity_codes"), list)
        or not value["commodity_codes"]
    ):
        raise RuntimeError("USDA FAS export-sales feed configuration is malformed")
    seen: set[int] = set()
    for identity in value["commodity_codes"]:
        if (
            not isinstance(identity, dict)
            or set(identity) != {"code", "name", "unit_id"}
            or not isinstance(identity.get("code"), int)
            or isinstance(identity.get("code"), bool)
            or identity["code"] <= 0
            or identity["code"] in seen
            or not isinstance(identity.get("name"), str)
            or not identity["name"]
            or identity.get("unit_id") not in {1, 2}
        ):
            raise RuntimeError("USDA FAS commodity identity is malformed")
        seen.add(identity["code"])
    return value


def export_url(commodity_code: int, market_year: int) -> str:
    if commodity_code <= 0 or market_year < 1999 or market_year > 2200:
        raise RuntimeError("USDA FAS export-sales request identity is malformed")
    return (
        f"{BASE}/exports/commodityCode/{commodity_code}"
        f"/allCountries/marketYear/{market_year}"
    )


def _json_list(raw: bytes, label: str) -> list[object]:
    try:
        value = json.loads(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError(f"USDA FAS returned invalid {label} JSON") from error
    if not isinstance(value, list):
        raise RuntimeError(f"USDA FAS {label} response is not an array")
    return value


def _release_plan(document: object, config: dict[str, Any]) -> dict[int, dict[str, Any]]:
    if not isinstance(document, list):
        raise RuntimeError("USDA FAS release-date response is not an array")
    wanted = {identity["code"] for identity in config["commodity_codes"]}
    plan: dict[int, dict[str, Any]] = {}
    for row in document:
        if not isinstance(row, dict) or set(row) != {
            "commodityCode", "marketYearStart", "marketYearEnd", "marketYear", "releaseTimeStamp",
        }:
            raise RuntimeError("USDA FAS release-date schema changed")
        code = row.get("commodityCode")
        if code not in wanted:
            continue
        if code in plan:
            raise RuntimeError("USDA FAS release-date response duplicated a commodity")
        market_year = row.get("marketYear")
        if not isinstance(market_year, int) or isinstance(market_year, bool):
            raise RuntimeError("USDA FAS market year is malformed")
        for field in ("marketYearStart", "marketYearEnd"):
            raw = row.get(field)
            if not isinstance(raw, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}T00:00:00", raw) is None:
                raise RuntimeError("USDA FAS market-year boundary is malformed")
            try:
                date.fromisoformat(raw[:10])
            except ValueError as error:
                raise RuntimeError("USDA FAS market-year boundary is invalid") from error
        stamp = row.get("releaseTimeStamp")
        if not isinstance(stamp, str) or re.fullmatch(
            r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?", stamp,
        ) is None:
            raise RuntimeError("USDA FAS release timestamp is malformed")
        try:
            datetime.strptime(
                stamp,
                "%Y-%m-%dT%H:%M:%S.%f" if "." in stamp else "%Y-%m-%dT%H:%M:%S",
            )
        except ValueError as error:
            raise RuntimeError("USDA FAS release timestamp is invalid") from error
        plan[code] = row
    if set(plan) != wanted:
        raise RuntimeError("USDA FAS release-date response omitted a configured commodity")
    return plan


def fetch(manifest: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    credential = os.environ.get(manifest["credential_env"][0], "")
    if not credential:
        raise RuntimeError(f"missing required credential {manifest['credential_env'][0]}")

    def fetch_metadata(item: tuple[str, str]) -> tuple[str, list[object]]:
        label, url = item
        raw = fetch_bytes_with_header_credential(
            url, manifest, header_name="X-Api-Key", credential=credential,
            max_bytes=MAX_METADATA_BYTES, timeout=30,
        )
        return label, _json_list(raw, label)

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        metadata = dict(executor.map(fetch_metadata, METADATA_URLS.items()))

    release_plan = _release_plan(metadata["release_dates"], config)
    requests: list[tuple[int, int]] = []
    for identity in config["commodity_codes"]:
        current = release_plan[identity["code"]]["marketYear"]
        for market_year in range(current - HISTORY_MARKET_YEARS + 1, current + 1):
            requests.append((identity["code"], market_year))

    def fetch_export(request: tuple[int, int]) -> dict[str, Any]:
        commodity_code, market_year = request
        url = export_url(commodity_code, market_year)
        raw = fetch_bytes_with_header_credential(
            url, manifest, header_name="X-Api-Key", credential=credential,
            max_bytes=MAX_EXPORT_BYTES, timeout=30,
        )
        return {
            "url": url,
            "commodity_code": commodity_code,
            "market_year": market_year,
            "document": _json_list(raw, "export-sales"),
        }

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        exports = list(executor.map(fetch_export, requests))
    return {**metadata, "exports": exports}


def _lookup(document: object, *, code_field: str, name_field: str, label: str) -> dict[int, str]:
    if not isinstance(document, list):
        raise RuntimeError(f"USDA FAS {label} response is not an array")
    result: dict[int, str] = {}
    for row in document:
        if not isinstance(row, dict):
            raise RuntimeError(f"USDA FAS {label} row is not an object")
        code, name = row.get(code_field), row.get(name_field)
        if (
            not isinstance(code, int) or isinstance(code, bool) or code <= 0 or code in result
            or not isinstance(name, str) or not name.strip()
        ):
            raise RuntimeError(f"USDA FAS {label} identity is malformed or duplicated")
        result[code] = name.strip()
    if not result:
        raise RuntimeError(f"USDA FAS {label} response is empty")
    return result


def _whole(value: object, label: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise RuntimeError(f"USDA FAS {label} is not a whole number")
    return value


def _record(
    row: object,
    *,
    commodity_code: int,
    market_year: int,
    unit_id: int,
    countries: dict[int, str],
) -> tuple[str, dict[str, Any]]:
    if not isinstance(row, dict) or set(row) != ROW_FIELDS:
        raise RuntimeError("USDA FAS export-sales row schema changed")
    country_code = row.get("countryCode")
    if (
        row.get("commodityCode") != commodity_code
        or row.get("unitId") != unit_id
        or not isinstance(country_code, int)
        or isinstance(country_code, bool)
        or country_code not in countries
    ):
        raise RuntimeError("USDA FAS export-sales row identity changed")
    raw_day = row.get("weekEndingDate")
    if not isinstance(raw_day, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}T00:00:00", raw_day) is None:
        raise RuntimeError("USDA FAS week-ending date is malformed")
    try:
        day = date.fromisoformat(raw_day[:10]).isoformat()
    except ValueError as error:
        raise RuntimeError("USDA FAS week-ending date is invalid") from error
    values = {field: _whole(row[source], source) for field, source in VALUE_FIELDS.items()}
    return day, {
        "commodity_code": commodity_code,
        "market_year": market_year,
        "country_code": country_code,
        "country": countries[country_code],
        **values,
        "sales_reductions_or_adjustments": (
            values["gross_new_sales"] - values["current_market_year_net_sales"]
        ),
    }


def build(
    manifest: dict[str, Any], config: dict[str, Any], captures: dict[str, Any],
) -> tuple[str, dict[str, Any], dict[str, Any]]:
    if not isinstance(captures, dict) or set(captures) != {*METADATA_URLS, "exports"}:
        raise RuntimeError("USDA FAS capture bundle is malformed")
    commodity_lookup = _lookup(
        captures["commodities"], code_field="commodityCode", name_field="commodityName",
        label="commodity",
    )
    country_lookup = _lookup(
        captures["countries"], code_field="countryCode", name_field="countryName",
        label="country",
    )
    unit_lookup = _lookup(
        captures["units"], code_field="unitId", name_field="unitNames", label="unit",
    )
    release_plan = _release_plan(captures["release_dates"], config)
    configured = {identity["code"]: identity for identity in config["commodity_codes"]}
    for code, identity in configured.items():
        if commodity_lookup.get(code) != identity["name"] or identity["unit_id"] not in unit_lookup:
            raise RuntimeError("USDA FAS configured commodity identity no longer matches metadata")

    expected_pairs = {
        (code, market_year)
        for code, release in release_plan.items()
        for market_year in range(
            release["marketYear"] - HISTORY_MARKET_YEARS + 1,
            release["marketYear"] + 1,
        )
    }
    exports = captures["exports"]
    if not isinstance(exports, list):
        raise RuntimeError("USDA FAS export capture list is malformed")
    observed_pairs = [
        (capture.get("commodity_code"), capture.get("market_year"))
        for capture in exports if isinstance(capture, dict)
    ]
    if len(observed_pairs) != len(exports) or set(observed_pairs) != expected_pairs or len(observed_pairs) != len(set(observed_pairs)):
        raise RuntimeError("USDA FAS captures do not match the reviewed market-year plan")

    grouped: dict[tuple[str, int], list[dict[str, Any]]] = defaultdict(list)
    identities: set[tuple[int, int, int, str]] = set()
    source_urls = list(METADATA_URLS.values())
    for capture in exports:
        code, market_year = capture["commodity_code"], capture["market_year"]
        if capture.get("url") != export_url(code, market_year):
            raise RuntimeError("USDA FAS export capture URL changed")
        document = capture.get("document")
        if not isinstance(document, list) or not document:
            raise RuntimeError("USDA FAS export-sales market year is empty")
        source_urls.append(capture["url"])
        for row in document:
            day, record = _record(
                row,
                commodity_code=code,
                market_year=market_year,
                unit_id=configured[code]["unit_id"],
                countries=country_lookup,
            )
            identity = (code, market_year, record["country_code"], day)
            if identity in identities:
                raise RuntimeError("USDA FAS export-sales response contains a duplicate row")
            identities.add(identity)
            grouped[(day, market_year)].append(record)

    markets_by_day: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for day, market_year in sorted(grouped):
        records = sorted(
            grouped[(day, market_year)],
            key=lambda record: (record["commodity_code"], record["country_code"]),
        )
        totals = {
            field: sum(record[field] for record in records)
            for field in (*VALUE_FIELDS, "sales_reductions_or_adjustments")
        }
        markets_by_day[day].append({
            "market_year": market_year,
            "totals": totals,
            "records": records,
        })
    observations = [
        {"date": day, "markets": sorted(markets_by_day[day], key=lambda row: row["market_year"])}
        for day in sorted(markets_by_day)
    ]
    unique_dates = [observation["date"] for observation in observations]
    if (
        len(unique_dates) < MINIMUM_DATES
        or (date.fromisoformat(unique_dates[-1]) - date.fromisoformat(unique_dates[0])).days < MINIMUM_SPAN_DAYS
    ):
        raise RuntimeError("USDA FAS export-sales history is incomplete")
    as_of = unique_dates[-1]
    release_timestamp = max(release["releaseTimeStamp"] for release in release_plan.values())
    unit_names = sorted({unit_lookup[identity["unit_id"]] for identity in config["commodity_codes"]})
    payload = {
        "series": manifest["series"],
        "as_of": as_of,
        "commodity": config["commodity"],
        "release_timestamp": release_timestamp,
        "units": unit_names,
        "observations": observations,
        "source_urls": source_urls,
    }
    sidecar = provenance(
        manifest,
        as_of=as_of,
        source_url=METADATA_URLS["release_dates"],
        source_urls=source_urls,
        note=(
            f"{config['note']} {len(unique_dates)} weekly dates across "
            f"{HISTORY_MARKET_YEARS} market years. Shipments are weeklyExports; gross and net "
            "sales remain separate. sales_reductions_or_adjustments equals gross_new_sales minus "
            "current_market_year_net_sales and must not be relabelled as pure cancellations."
        ),
    )
    return as_of, payload, sidecar


def run(fetch_file: str) -> int:
    manifest = load_manifest(fetch_file)
    config = load_config(fetch_file)
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and args.subject != config["subject"]:
        parser.error(f"--subject must be {config['subject']} unless --verify")
    defects = validate_manifest(manifest["id"], str(Path(fetch_file).resolve().parent), manifest)
    if defects:
        raise RuntimeError(defects[0])
    as_of, payload, sidecar = build(manifest, config, fetch(manifest, config))
    defects = validate_staged_output(manifest, config["subject"], payload, sidecar, as_of)
    if defects:
        raise RuntimeError(defects[0])
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} USDA FAS export-sales rows through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root,
        subject=args.subject,
        provider_slug=config["provider_slug"],
        filename=f"{config['filename_stem']}_{as_of}.json",
        payload=payload,
        sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(run(__file__))
