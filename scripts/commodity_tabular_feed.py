#!/usr/bin/env python3
"""Fail-closed declarative adapter for official or licensed tabular feeds.

Connector bundles provide a reviewed ``feed.json`` beside their standard
``connector.json`` and tiny ``fetch.py`` wrapper.  This module owns network
access, parsing, type/range checks, provenance, and publication.  It supports
strict UTF-8 CSV because that is a stable export format for both public-data
providers and licensed Capital IQ exports.
"""
from __future__ import annotations

import argparse
import calendar
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

from connector_contract import validate_payload
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair


REQUIRED_CONFIG_KEYS = {
    "config_version", "format", "source_url_template", "lookback_days", "max_bytes",
    "csv", "columns", "records_field", "as_of_field", "static_fields",
    "source_url_field", "provider_slug", "filename_stem", "note",
}
OPTIONAL_CONFIG_KEYS = {"row_filters"}
COLUMN_KEYS = {
    "source", "target", "type", "missing_values", "missing_action", "minimum", "maximum",
}
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
SAFE_SLUG_RE = re.compile(r"[a-z0-9][a-z0-9._-]*")


def load_config(fetch_file: str) -> dict[str, Any]:
    path = Path(fetch_file).resolve().parent / "feed.json"
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"feed.json is missing or invalid: {error}") from error
    validate_config(value)
    return value


def validate_config(config: Any) -> None:
    if (
        not isinstance(config, dict)
        or not REQUIRED_CONFIG_KEYS <= set(config)
        or set(config) - REQUIRED_CONFIG_KEYS - OPTIONAL_CONFIG_KEYS
    ):
        raise RuntimeError("feed.json has unknown or missing top-level fields")
    if config.get("config_version") != 1 or config.get("format") != "csv":
        raise RuntimeError("feed.json requires config_version 1 and format csv")
    template = config.get("source_url_template")
    if not isinstance(template, str) or not template.startswith("https://"):
        raise RuntimeError("source_url_template must be an absolute HTTPS URL")
    placeholders = re.findall(r"\{([^{}]+)\}", template)
    if set(placeholders) - {"start_date"}:
        raise RuntimeError("source_url_template has an unsupported placeholder")
    lookback = config.get("lookback_days")
    if (
        lookback is not None
        and (not isinstance(lookback, int) or isinstance(lookback, bool) or lookback < 1)
    ):
        raise RuntimeError("lookback_days must be null or a positive integer")
    if ("start_date" in placeholders) != (lookback is not None):
        raise RuntimeError("start_date and lookback_days must be declared together")
    maximum = config.get("max_bytes")
    if not isinstance(maximum, int) or isinstance(maximum, bool) or not 1024 <= maximum <= 64 * 1024 * 1024:
        raise RuntimeError("max_bytes must be between 1 KiB and 64 MiB")
    csv_config = config.get("csv")
    if (
        not isinstance(csv_config, dict)
        or set(csv_config) != {"delimiter", "header", "allow_extra_columns"}
        or not isinstance(csv_config.get("delimiter"), str)
        or len(csv_config["delimiter"]) != 1
        or not isinstance(csv_config.get("header"), list)
        or not csv_config["header"]
        or not all(isinstance(item, str) and item for item in csv_config["header"])
        or len(set(csv_config["header"])) != len(csv_config["header"])
        or not isinstance(csv_config.get("allow_extra_columns"), bool)
    ):
        raise RuntimeError("csv must declare one delimiter, unique headers, and allow_extra_columns")
    columns = config.get("columns")
    if not isinstance(columns, list) or not columns:
        raise RuntimeError("columns must be a non-empty list")
    sources: set[str] = set()
    targets: set[str] = set()
    for index, column in enumerate(columns):
        if not isinstance(column, dict) or not {"source", "target", "type"} <= set(column) or set(column) - COLUMN_KEYS:
            raise RuntimeError(f"column {index} has unknown or missing fields")
        source, target = column.get("source"), column.get("target")
        if (
            not isinstance(source, str) or source not in csv_config["header"] or source in sources
            or not isinstance(target, str) or not SAFE_SLUG_RE.fullmatch(target) or target in targets
            or column.get("type") not in {"date", "month_end", "string", "int", "float"}
        ):
            raise RuntimeError(f"column {index} identity or type is invalid")
        sources.add(source)
        targets.add(target)
        missing = column.get("missing_values", [])
        action = column.get("missing_action", "error")
        if not isinstance(missing, list) or not all(isinstance(value, str) for value in missing) or action not in {"error", "skip_row"}:
            raise RuntimeError(f"column {index} missing-value policy is invalid")
        for bound in ("minimum", "maximum"):
            value = column.get(bound)
            if value is not None and (
                isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value))
            ):
                raise RuntimeError(f"column {index} {bound} is invalid")
        if column.get("minimum") is not None and column.get("maximum") is not None \
                and float(column["minimum"]) > float(column["maximum"]):
            raise RuntimeError(f"column {index} bounds are reversed")
        if column.get("type") not in {"int", "float"} and any(key in column for key in ("minimum", "maximum")):
            raise RuntimeError(f"column {index} applies numeric bounds to a non-numeric type")
    for field in ("records_field", "as_of_field", "source_url_field"):
        if not isinstance(config.get(field), str) or not SAFE_SLUG_RE.fullmatch(config[field]):
            raise RuntimeError(f"{field} must be a safe output field")
    if config["as_of_field"] not in targets:
        raise RuntimeError("as_of_field must name a mapped target column")
    if len({config["records_field"], config["source_url_field"], "series", "as_of"}) != 4:
        raise RuntimeError("reserved output fields collide")
    static = config.get("static_fields")
    if not isinstance(static, dict) or set(static) & {config["records_field"], config["source_url_field"], "series", "as_of"}:
        raise RuntimeError("static_fields must be an object without reserved output fields")
    if not all(isinstance(key, str) and SAFE_SLUG_RE.fullmatch(key) for key in static):
        raise RuntimeError("static_fields contains an unsafe output field")
    filters = config.get("row_filters", {})
    if (
        not isinstance(filters, dict)
        or ("row_filters" in config and not filters)
        or not all(
            isinstance(source, str) and source in csv_config["header"]
            and isinstance(values, list) and values
            and all(isinstance(value, str) and value for value in values)
            and len(values) == len(set(values))
            for source, values in filters.items()
        )
    ):
        raise RuntimeError("row_filters must map declared CSV headers to unique exact values")
    for field in ("provider_slug", "filename_stem"):
        if not isinstance(config.get(field), str) or not SAFE_SLUG_RE.fullmatch(config[field]):
            raise RuntimeError(f"{field} must be a safe slug")
    if not isinstance(config.get("note"), str) or not config["note"].strip():
        raise RuntimeError("note must be a non-empty provenance statement")


def source_url(config: dict[str, Any], *, today: date) -> str:
    template = config["source_url_template"]
    lookback = config.get("lookback_days")
    if lookback is None:
        return template
    start = today - timedelta(days=lookback)
    return template.replace("{start_date}", start.isoformat())


def _convert(raw: str, column: dict[str, Any], row_number: int) -> Any:
    label = column["source"]
    if raw in column.get("missing_values", []):
        if column.get("missing_action", "error") == "skip_row":
            raise _SkipRow
        raise RuntimeError(f"row {row_number} column {label} is missing")
    kind = column["type"]
    if kind == "date":
        if not DATE_RE.fullmatch(raw):
            raise RuntimeError(f"row {row_number} column {label} is not YYYY-MM-DD")
        try:
            date.fromisoformat(raw)
        except ValueError as error:
            raise RuntimeError(f"row {row_number} column {label} is not a real date") from error
        return raw
    if kind == "month_end":
        if re.fullmatch(r"\d{4}-\d{2}", raw) is None:
            raise RuntimeError(f"row {row_number} column {label} is not YYYY-MM")
        try:
            year, month = (int(part) for part in raw.split("-"))
            return date(year, month, calendar.monthrange(year, month)[1]).isoformat()
        except (ValueError, calendar.IllegalMonthError) as error:
            raise RuntimeError(f"row {row_number} column {label} is not a real month") from error
    if kind == "string":
        if not raw:
            raise RuntimeError(f"row {row_number} column {label} is empty")
        return raw
    try:
        value = int(raw) if kind == "int" else float(raw)
    except ValueError as error:
        raise RuntimeError(f"row {row_number} column {label} is not a {kind}") from error
    if isinstance(value, float) and not math.isfinite(value):
        raise RuntimeError(f"row {row_number} column {label} is not finite")
    if column.get("minimum") is not None and value < column["minimum"]:
        raise RuntimeError(f"row {row_number} column {label} is below its declared minimum")
    if column.get("maximum") is not None and value > column["maximum"]:
        raise RuntimeError(f"row {row_number} column {label} is above its declared maximum")
    return value


class _SkipRow(Exception):
    pass


def build(raw: bytes, manifest: dict[str, Any], config: dict[str, Any], *, url: str):
    validate_config(config)
    if manifest.get("minimum_history", {}).get("path") != config["records_field"]:
        raise RuntimeError("feed records_field must equal the manifest minimum_history path")
    expected_suffix = f"/{config['provider_slug']}/{config['filename_stem']}_<as_of>.json"
    if not str(manifest.get("output_path", "")).endswith(expected_suffix):
        raise RuntimeError("feed publication identity conflicts with manifest output_path")
    try:
        text = raw.decode("utf-8-sig", "strict")
    except UnicodeDecodeError as error:
        raise RuntimeError("feed is not strict UTF-8 CSV") from error
    reader = csv.DictReader(io.StringIO(text), delimiter=config["csv"]["delimiter"])
    actual_header = reader.fieldnames
    expected_header = config["csv"]["header"]
    if not isinstance(actual_header, list) or len(actual_header) != len(set(actual_header)):
        raise RuntimeError("CSV header is absent or duplicated")
    if config["csv"]["allow_extra_columns"]:
        header_ok = set(expected_header).issubset(actual_header)
    else:
        header_ok = actual_header == expected_header
    if not header_ok:
        raise RuntimeError(f"CSV header changed: expected {expected_header!r}, got {actual_header!r}")
    records: list[dict[str, Any]] = []
    seen_as_of: set[str] = set()
    for row_number, raw_row in enumerate(reader, start=2):
        if raw_row.get(None):
            raise RuntimeError(f"row {row_number} contains fields beyond the declared header")
        for source, allowed in config.get("row_filters", {}).items():
            value = raw_row.get(source)
            if not isinstance(value, str) or value.strip() not in allowed:
                raise RuntimeError(f"row {row_number} column {source} violates the declared series identity")
        record: dict[str, Any] = {}
        try:
            for column in config["columns"]:
                value = raw_row.get(column["source"])
                if not isinstance(value, str):
                    raise RuntimeError(f"row {row_number} lacks column {column['source']}")
                record[column["target"]] = _convert(value.strip(), column, row_number)
        except _SkipRow:
            continue
        observation_date = record[config["as_of_field"]]
        if observation_date in seen_as_of:
            raise RuntimeError(f"duplicate observation date {observation_date}")
        seen_as_of.add(observation_date)
        records.append(record)
    records.sort(key=lambda item: item[config["as_of_field"]])
    minimum = manifest["minimum_history"]["observations"]
    if len(records) < minimum:
        raise RuntimeError(f"feed has {len(records)} usable rows; {minimum} are required")
    as_of = records[-1][config["as_of_field"]]
    payload = {
        "series": manifest["series"], "as_of": as_of, **config["static_fields"],
        config["records_field"]: records, config["source_url_field"]: url,
    }
    defects = validate_payload(payload, manifest["output_schema"])
    if defects:
        raise RuntimeError("declarative output does not match connector schema: " + "; ".join(defects[:5]))
    sidecar = provenance(
        manifest, as_of=as_of, source_url=url,
        note=f"{config['note']} Latest source observation: {as_of}.",
    )
    return as_of, payload, sidecar


def _read_file(path: str, maximum: int) -> bytes:
    try:
        with open(path, "rb") as handle:
            raw = handle.read(maximum + 1)
    except OSError as error:
        raise RuntimeError(f"cannot read manual CSV export: {error}") from error
    if len(raw) > maximum:
        raise RuntimeError(f"manual CSV export exceeds the {maximum}-byte hard cap")
    return raw


def main(fetch_file: str) -> int:
    manifest = load_manifest(fetch_file)
    config = load_config(fetch_file)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    manual_arg = None
    if manifest.get("acquisition") == "manual":
        manual_arg = manifest["manual_ingest"]["file_arg"]
        parser.add_argument(manual_arg, dest="manual_file")
    args = parser.parse_args()
    if args.verify and manual_arg and not args.manual_file:
        print("OK verify: manual-only connector; unattended retrieval is disabled")
        return 0
    if not args.verify and not args.subject:
        parser.error("--subject is required unless --verify")
    if manual_arg and not args.manual_file:
        parser.error(f"{manual_arg} is required for this licensed manual connector")
    release_today = datetime.now(ZoneInfo(manifest["release"]["timezone"])).date()
    url = source_url(config, today=release_today)
    try:
        raw = (
            _read_file(args.manual_file, config["max_bytes"])
            if manual_arg else fetch_bytes(
                url, manifest, max_bytes=config["max_bytes"], accept="*/*",
            )
        )
        as_of, payload, sidecar = build(raw, manifest, config, url=url)
    except RuntimeError as error:
        print(f"FEED-ERROR: {error}", file=sys.stderr)
        return 1
    if args.verify:
        print(f"OK verify: {len(payload[config['records_field']])} rows through {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug=config["provider_slug"],
        filename=f"{config['filename_stem']}_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0
