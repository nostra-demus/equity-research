#!/usr/bin/env python3
"""Fetch and pivot reviewed BIS daily USD exchange-rate series for commodity profiles."""
from __future__ import annotations

import argparse
import csv
import io
import json
import math
import os
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from connector_contract import validate_manifest, validate_payload, validate_staged_output
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair


CONFIG_KEYS = {"config_version", "currencies", "lookback_days", "max_bytes", "provider_slug", "filename_stem", "note"}
CURRENCY_KEYS = {"reference_area", "currency", "target"}
SAFE_CODE = re.compile(r"[A-Z]{2,3}")
SAFE_TARGET = re.compile(r"[a-z][a-z0-9_]*")
HEADER = [
    "FREQ", "REF_AREA", "CURRENCY", "COLLECTION", "UNIT_MULT", "DECIMALS",
    "AVAILABILITY", "TITLE", "TIME_PERIOD", "OBS_VALUE", "OBS_STATUS",
    "OBS_PRE_BREAK", "OBS_CONF",
]
HOST = "stats.bis.org"


def load_config(fetch_file: str) -> dict[str, Any]:
    path = Path(fetch_file).resolve().parent / "feed.json"
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"feed.json is missing or invalid: {error}") from error
    validate_config(value)
    return value


def validate_config(config: Any) -> None:
    if not isinstance(config, dict) or set(config) != CONFIG_KEYS or config.get("config_version") != 1:
        raise RuntimeError("BIS FX feed has unknown or missing top-level fields")
    currencies = config.get("currencies")
    if not isinstance(currencies, list) or len(currencies) < 2:
        raise RuntimeError("BIS FX feed requires at least two currencies")
    pairs: set[tuple[str, str]] = set()
    targets: set[str] = set()
    for index, item in enumerate(currencies):
        if not isinstance(item, dict) or set(item) != CURRENCY_KEYS:
            raise RuntimeError(f"BIS FX currency {index} is malformed")
        area, currency, target = item.get("reference_area"), item.get("currency"), item.get("target")
        if (
            not isinstance(area, str) or SAFE_CODE.fullmatch(area) is None
            or not isinstance(currency, str) or SAFE_CODE.fullmatch(currency) is None
            or not isinstance(target, str) or SAFE_TARGET.fullmatch(target) is None
            or (area, currency) in pairs or target in targets or target == "date"
        ):
            raise RuntimeError(f"BIS FX currency {index} identity is invalid or duplicated")
        pairs.add((area, currency))
        targets.add(target)
    lookback = config.get("lookback_days")
    maximum = config.get("max_bytes")
    if not isinstance(lookback, int) or isinstance(lookback, bool) or lookback < 1095:
        raise RuntimeError("BIS FX lookback_days must cover at least three years")
    if not isinstance(maximum, int) or isinstance(maximum, bool) or not 1024 <= maximum <= 64 * 1024 * 1024:
        raise RuntimeError("BIS FX max_bytes is outside the safe range")
    for field in ("provider_slug", "filename_stem"):
        value = config.get(field)
        if not isinstance(value, str) or re.fullmatch(r"[a-z0-9][a-z0-9._-]*", value) is None:
            raise RuntimeError(f"BIS FX {field} must be a safe slug")
    if not isinstance(config.get("note"), str) or not config["note"].strip():
        raise RuntimeError("BIS FX note must be non-empty")


def source_url(config: dict[str, Any], *, today: date) -> str:
    validate_config(config)
    areas = "+".join(item["reference_area"] for item in config["currencies"])
    currencies = "+".join(item["currency"] for item in config["currencies"])
    start = today - timedelta(days=config["lookback_days"])
    key = f"D.{areas}.{currencies}.A"
    return (
        f"https://{HOST}/api/v2/data/dataflow/BIS/WS_XRU/1.0/{key}"
        f"?startPeriod={start.isoformat()}&format=csvfile"
    )


def build(raw: bytes, manifest: dict[str, Any], config: dict[str, Any], *, url: str):
    validate_config(config)
    try:
        text = raw.decode("utf-8-sig", "strict")
    except UnicodeDecodeError as error:
        raise RuntimeError("BIS FX response is not strict UTF-8 CSV") from error
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != HEADER:
        raise RuntimeError(f"BIS FX CSV header changed: {reader.fieldnames!r}")
    pair_targets = {
        (item["reference_area"], item["currency"]): item["target"]
        for item in config["currencies"]
    }
    by_target: dict[str, dict[str, float]] = {target: {} for target in pair_targets.values()}
    for row_number, row in enumerate(reader, start=2):
        if row.get(None):
            raise RuntimeError(f"BIS FX row {row_number} contains undeclared fields")
        pair = (row.get("REF_AREA"), row.get("CURRENCY"))
        if pair not in pair_targets:
            raise RuntimeError(f"BIS FX row {row_number} returned an undeclared currency pair")
        if (
            row.get("FREQ") != "D" or row.get("COLLECTION") != "A"
            or row.get("UNIT_MULT") != "0" or row.get("AVAILABILITY") != "A"
            or not row.get("OBS_STATUS")
        ):
            raise RuntimeError(f"BIS FX row {row_number} metadata changed")
        day = row.get("TIME_PERIOD")
        try:
            if not isinstance(day, str) or date.fromisoformat(day).isoformat() != day:
                raise ValueError
        except ValueError as error:
            raise RuntimeError(f"BIS FX row {row_number} has an invalid date") from error
        raw_value = row.get("OBS_VALUE", "")
        if raw_value in {"", "NaN"} and row.get("OBS_STATUS") == "M":
            continue
        try:
            value = float(raw_value)
        except ValueError as error:
            raise RuntimeError(f"BIS FX row {row_number} has a non-numeric value") from error
        if not math.isfinite(value) or value <= 0 or value > 1_000_000_000:
            raise RuntimeError(f"BIS FX row {row_number} value is outside the safe range")
        target = pair_targets[pair]
        if day in by_target[target]:
            raise RuntimeError(f"BIS FX response duplicates {pair[1]} on {day}")
        by_target[target][day] = value
    shared_dates = set.intersection(*(set(values) for values in by_target.values()))
    observations = [
        {"date": day, **{target: by_target[target][day] for target in by_target}}
        for day in sorted(shared_dates)
    ]
    minimum = manifest.get("minimum_history", {}).get("observations")
    if not isinstance(minimum, int) or len(observations) < minimum:
        raise RuntimeError(f"BIS FX feed has {len(observations)} aligned days; {minimum} are required")
    as_of = observations[-1]["date"]
    payload = {
        "series": manifest["series"], "as_of": as_of,
        "rate_basis": "units of local currency per one US dollar; BIS daily average",
        "currency_pairs": [f"USD/{item['currency']}" for item in config["currencies"]],
        "observations": observations, "source_url": url,
    }
    defects = validate_payload(payload, manifest["output_schema"])
    if defects:
        raise RuntimeError("BIS FX output does not match connector schema: " + "; ".join(defects[:5]))
    sidecar = provenance(
        manifest, as_of=as_of, source_url=url,
        note=f"{config['note']} {len(observations)} aligned daily observations through {as_of}.",
    )
    return as_of, payload, sidecar


def self_test(test_file: str) -> None:
    directory = Path(test_file).resolve().parent
    manifest = json.loads((directory / "connector.json").read_text(encoding="utf-8"))
    config = load_config(str(directory / "fetch.py"))
    rows = [",".join(HEADER)]
    start = date(2023, 1, 1)
    for index, item in enumerate(config["currencies"]):
        for offset in range(800):
            day = start + timedelta(days=offset)
            fields = [
                "D", item["reference_area"], item["currency"], "A", "0", "16", "A",
                f"USD {item['currency']}", day.isoformat(), str(1 + index + offset / 10000),
                "A", "", "F",
            ]
            rows.append(",".join(fields))
    url = source_url(config, today=date(2026, 8, 30))
    as_of, payload, sidecar = build("\n".join(rows).encode(), manifest, config, url=url)
    defects = validate_manifest(manifest["id"], str(directory), manifest)
    defects += validate_staged_output(manifest, manifest["subjects"][0], payload, sidecar, as_of)
    if defects:
        raise AssertionError(defects)
    if len(payload["observations"]) != 800:
        raise AssertionError("BIS FX self-test did not preserve the aligned history")
    try:
        build(b"date,value\n2026-01-01,1\n", manifest, config, url=url)
    except RuntimeError:
        pass
    else:
        raise AssertionError("BIS FX connector accepted a changed header")
    print(f"PASS: {manifest['id']} BIS daily FX connector")


def main(fetch_file: str) -> int:
    manifest = load_manifest(fetch_file)
    config = load_config(fetch_file)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and not args.subject:
        parser.error("--subject is required unless --verify")
    today = datetime.now(ZoneInfo(manifest["release"]["timezone"])).date()
    url = source_url(config, today=today)
    try:
        raw = fetch_bytes(url, manifest, max_bytes=config["max_bytes"], accept="*/*")
        as_of, payload, sidecar = build(raw, manifest, config, url=url)
    except RuntimeError as error:
        print(f"FEED-ERROR: {error}", file=sys.stderr)
        return 1
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} aligned BIS FX days through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug=config["provider_slug"],
        filename=f"{config['filename_stem']}_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0
