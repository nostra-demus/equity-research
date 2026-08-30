#!/usr/bin/env python3
"""Shared fail-closed USDA NASS Quick Stats crop-progress connector."""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import threading
import time
import urllib.parse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from connector_fetch_support import (
    fetch_bytes_with_query_credential, load_manifest, provenance, publish_pair,
)
from connector_contract import validate_manifest, validate_staged_output


HOST = "quickstats.nass.usda.gov"
API_PATH = "/api/api_GET/"
STATISTICS = ("CONDITION", "PROGRESS")
ATTRIBUTION = "This product uses the NASS API but is not endorsed or certified by NASS."
MINIMUM_DATES = 260
MINIMUM_SPAN_DAYS = 3650
YEARS_OF_HISTORY = 11
MAX_RESPONSE_BYTES = 12 * 1024 * 1024
MAX_PARALLEL_REQUESTS = 4
SUPPRESSED_VALUES = {"", "(D)", "(NA)", "(S)", "(X)", "(Z)"}
ROW_FIELDS = {
    "source_desc", "sector_desc", "commodity_desc", "class_desc",
    "statisticcat_desc", "unit_desc", "short_desc", "domain_desc",
    "domaincat_desc", "agg_level_desc", "state_alpha", "state_name", "year",
    "freq_desc", "reference_period_desc", "week_ending", "load_time", "Value",
}


def load_config(fetch_file: str) -> dict[str, Any]:
    path = Path(fetch_file).resolve().parent / "feed.json"
    value = json.loads(path.read_text(encoding="utf-8"))
    if (
        not isinstance(value, dict)
        or set(value) != {
            "config_version", "subject", "commodity", "provider_slug", "filename_stem",
            "note",
        }
        or value.get("config_version") != 1
        or value.get("subject") not in {"CORN", "COTTON", "SOYBEANS", "WHEAT"}
        or value.get("commodity") != value.get("subject")
        or not all(
            isinstance(value.get(field), str) and value[field]
            for field in ("provider_slug", "filename_stem", "note")
        )
    ):
        raise RuntimeError("USDA crop-progress feed configuration is malformed")
    return value


def query_url(commodity: str, statistic: str, year: int) -> str:
    if statistic not in STATISTICS or not re.fullmatch(r"[A-Z]+", commodity):
        raise RuntimeError("USDA crop-progress query identity is malformed")
    query = urllib.parse.urlencode({
        "source_desc": "SURVEY",
        "sector_desc": "CROPS",
        "commodity_desc": commodity,
        "statisticcat_desc": statistic,
        "domain_desc": "TOTAL",
        "agg_level_desc": "STATE",
        "freq_desc": "WEEKLY",
        # QuickStats does not reliably combine lower and upper operators for the
        # same field. Exact years keep every response bounded and unambiguous.
        "year": str(year),
        "format": "JSON",
    })
    return f"https://{HOST}{API_PATH}?{query}"


def source_urls(commodity: str, *, current_year: int | None = None) -> list[str]:
    end = current_year or datetime.now(timezone.utc).year
    start = end - YEARS_OF_HISTORY
    urls: list[str] = []
    for statistic in STATISTICS:
        for year in range(start, end + 1):
            urls.append(query_url(commodity, statistic, year))
    return urls


def _decode_document(raw: bytes) -> object:
    try:
        return json.loads(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("USDA NASS returned invalid UTF-8 JSON") from error


def fetch(manifest: dict[str, Any], commodity: str) -> list[tuple[str, str, object]]:
    credential = os.environ.get(manifest["credential_env"][0], "")
    if not credential:
        raise RuntimeError(f"missing required credential {manifest['credential_env'][0]}")
    def fetch_one(url: str) -> tuple[str, str, object]:
        statistic = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)["statisticcat_desc"][0]
        raw = fetch_bytes_with_query_credential(
            url, manifest, query_key="key", credential=credential,
            max_bytes=MAX_RESPONSE_BYTES, timeout=30,
        )
        return url, statistic, _decode_document(raw)

    urls = source_urls(commodity)
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        return list(executor.map(fetch_one, urls))


def _percent(raw: object) -> int | None:
    if not isinstance(raw, str) or raw.strip() != raw:
        raise RuntimeError("USDA crop-progress Value is not a canonical string")
    if raw in SUPPRESSED_VALUES:
        return None
    if raw == "-":
        return 0
    if re.fullmatch(r"(?:0|[1-9]\d?|100)", raw) is None:
        raise RuntimeError(f"USDA crop-progress Value is not a whole percent: {raw!r}")
    return int(raw)


def _record(row: object, commodity: str, statistic: str) -> tuple[str, dict[str, Any]] | None:
    if not isinstance(row, dict) or not ROW_FIELDS <= set(row):
        raise RuntimeError("USDA crop-progress row schema changed")
    expected = {
        "source_desc": "SURVEY", "sector_desc": "CROPS", "commodity_desc": commodity,
        "statisticcat_desc": statistic, "domain_desc": "TOTAL",
        "agg_level_desc": "STATE", "freq_desc": "WEEKLY",
    }
    if any(row.get(field) != value for field, value in expected.items()):
        raise RuntimeError("USDA crop-progress row identity changed")
    day = row.get("week_ending")
    try:
        parsed_day = date.fromisoformat(day)
    except (TypeError, ValueError) as error:
        raise RuntimeError("USDA crop-progress week_ending is malformed") from error
    reported_year = row.get("year")
    year_matches = (
        isinstance(reported_year, int) and not isinstance(reported_year, bool)
        and parsed_day.year in {reported_year - 1, reported_year, reported_year + 1}
    )
    if (
        parsed_day.isoformat() != day
        or not year_matches
    ):
        raise RuntimeError("USDA crop-progress year conflicts with week_ending")
    state_alpha, state_name = row.get("state_alpha"), row.get("state_name")
    if (
        not isinstance(state_alpha, str) or re.fullmatch(r"[A-Z]{2}", state_alpha) is None
        or not isinstance(state_name, str) or not state_name
    ):
        raise RuntimeError("USDA crop-progress state identity changed")
    class_desc = row.get("class_desc")
    unit_desc = row.get("unit_desc")
    short_desc = row.get("short_desc")
    reference = row.get("reference_period_desc")
    load_time = row.get("load_time")
    if (
        not all(isinstance(value, str) and value for value in (class_desc, unit_desc, short_desc, reference, load_time))
        or not unit_desc.startswith("PCT ")
        or re.fullmatch(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{3})?", load_time) is None
    ):
        raise RuntimeError("USDA crop-progress semantic fields changed")
    value = _percent(row.get("Value"))
    if value is None:
        return None
    return day, {
        "state_alpha": state_alpha,
        "state_name": state_name,
        "class": class_desc,
        "statistic": statistic,
        "measure": unit_desc,
        "reference_period": reference,
        "short_description": short_desc,
        "percent": value,
        "loaded_at": load_time,
    }


def build(
    manifest: dict[str, Any], config: dict[str, Any],
    captures: list[tuple[str, str, object]],
) -> tuple[str, dict[str, Any], dict[str, Any]]:
    expected_urls = source_urls(config["commodity"])
    if [url for url, _statistic, _document in captures] != expected_urls:
        raise RuntimeError("USDA crop-progress captures do not match the reviewed query plan")
    by_day: dict[str, list[dict[str, Any]]] = defaultdict(list)
    identities: set[tuple[str, ...]] = set()
    found_statistics: set[str] = set()
    for _url, statistic, document in captures:
        if statistic not in STATISTICS or not isinstance(document, dict):
            raise RuntimeError("USDA crop-progress capture identity is malformed")
        rows = document.get("data")
        if not isinstance(rows, list):
            raise RuntimeError("USDA crop-progress response lacks a data array")
        for row in rows:
            parsed = _record(row, config["commodity"], statistic)
            if parsed is None:
                continue
            day, record = parsed
            identity = (
                day, record["state_alpha"], record["class"], record["statistic"],
                record["measure"], record["reference_period"], record["short_description"],
            )
            if identity in identities:
                raise RuntimeError("USDA crop-progress response contains a duplicate semantic row")
            identities.add(identity)
            found_statistics.add(statistic)
            by_day[day].append(record)
    days = sorted(by_day)
    if (
        len(days) < MINIMUM_DATES or set(STATISTICS) != found_statistics
        or (date.fromisoformat(days[-1]) - date.fromisoformat(days[0])).days < MINIMUM_SPAN_DAYS
    ):
        raise RuntimeError("USDA crop-progress history is incomplete")
    observations = [
        {"date": day, "records": sorted(by_day[day], key=lambda item: tuple(str(v) for v in item.values()))}
        for day in days
    ]
    as_of = days[-1]
    payload = {
        "series": manifest["series"], "as_of": as_of, "commodity": config["commodity"],
        "attribution": ATTRIBUTION, "observations": observations, "source_urls": expected_urls,
    }
    sidecar = provenance(
        manifest, as_of=as_of, source_url=expected_urls[0], source_urls=expected_urls,
        note=f"{config['note']} {len(days)} weekly dates and {len(identities)} state-level records.",
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
    as_of, payload, sidecar = build(manifest, config, fetch(manifest, config["commodity"]))
    if args.verify:
        print(f"OK verify: {config['commodity']} crop progress {len(payload['observations'])} dates through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug=config["provider_slug"],
        filename=f"{config['filename_stem']}_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


def self_test(fetch_file: str) -> None:
    manifest = load_manifest(fetch_file)
    config = load_config(fetch_file)
    current_year = datetime.now(timezone.utc).year
    for url in source_urls(config["commodity"], current_year=current_year):
        query = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
        assert set(field for field in query if field.startswith("year")) == {"year"}
    captures: list[tuple[str, str, object]] = []
    for url in source_urls(config["commodity"], current_year=current_year):
        query = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
        statistic = query["statisticcat_desc"][0]
        start = end = int(query["year"][0])
        rows = []
        for year in range(start, end + 1):
            first = date(year, 1, 5)
            for week in range(26):
                day = date.fromordinal(first.toordinal() + 7 * week).isoformat()
                rows.append({
                    "source_desc": "SURVEY", "sector_desc": "CROPS",
                    "commodity_desc": config["commodity"], "class_desc": "ALL CLASSES",
                    "statisticcat_desc": statistic,
                    "unit_desc": "PCT GOOD" if statistic == "CONDITION" else "PCT PLANTED",
                    "short_desc": f"{config['commodity']} - {statistic}", "domain_desc": "TOTAL",
                    "domaincat_desc": "NOT SPECIFIED", "agg_level_desc": "STATE",
                    "state_alpha": "IA", "state_name": "IOWA", "year": year,
                    "freq_desc": "WEEKLY", "reference_period_desc": "WEEK #01",
                    "week_ending": day, "load_time": f"{day} 16:00:00.000", "Value": "75",
                })
        captures.append((url, statistic, {"data": rows}))
    as_of, payload, sidecar = build(manifest, config, captures)
    defects = validate_manifest(manifest["id"], str(Path(fetch_file).resolve().parent), manifest)
    defects += validate_staged_output(manifest, config["subject"], payload, sidecar, as_of)
    if defects:
        raise AssertionError(defects)
    assert len(payload["observations"]) >= MINIMUM_DATES
    assert "key=" not in json.dumps([payload, sidecar])
    rollover_row = {
        **captures[0][2]["data"][0],
        "week_ending": date(current_year + 1, 4, 26).isoformat(),
        "year": current_year,
    }
    assert _record(rollover_row, config["commodity"], captures[0][1]) is not None
    rollover_row["week_ending"] = date(current_year - 1, 9, 28).isoformat()
    assert _record(rollover_row, config["commodity"], captures[0][1]) is not None
    rollover_row["week_ending"] = date(current_year + 2, 1, 2).isoformat()
    try:
        _record(rollover_row, config["commodity"], captures[0][1])
    except RuntimeError:
        pass
    else:
        raise AssertionError("two-year crop-season rollover did not fail closed")
    malformed = list(captures)
    bad_document = {"data": [{**captures[0][2]["data"][0], "unit_desc": "ACRES"}]}
    malformed[0] = (captures[0][0], captures[0][1], bad_document)
    try:
        build(manifest, config, malformed)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed USDA crop-progress response did not fail closed")
    if not all(math.isfinite(float(record["percent"])) for item in payload["observations"] for record in item["records"]):
        raise AssertionError("non-finite crop-progress percentage survived")

    original_fetch = globals()["fetch_bytes_with_query_credential"]
    lock = threading.Lock()
    active = 0
    maximum = 0

    def fake_fetch(*_args, **_kwargs) -> bytes:
        nonlocal active, maximum
        with lock:
            active += 1
            maximum = max(maximum, active)
        try:
            time.sleep(0.01)
            return b'{"data":[]}'
        finally:
            with lock:
                active -= 1

    credential_name = manifest["credential_env"][0]
    old_credential = os.environ.get(credential_name)
    globals()["fetch_bytes_with_query_credential"] = fake_fetch
    os.environ[credential_name] = "fixture-key"
    try:
        concurrent_captures = fetch(manifest, config["commodity"])
    finally:
        globals()["fetch_bytes_with_query_credential"] = original_fetch
        if old_credential is None:
            os.environ.pop(credential_name, None)
        else:
            os.environ[credential_name] = old_credential
    assert [item[0] for item in concurrent_captures] == source_urls(config["commodity"])
    assert maximum == MAX_PARALLEL_REQUESTS
    print(f"PASS: {manifest['id']}")
