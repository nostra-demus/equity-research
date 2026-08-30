#!/usr/bin/env python3
"""Fetch five years of monthly major-origin wheat exports from official UN Comtrade rows."""
from __future__ import annotations

import argparse
import calendar
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.parse
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any

from connector_contract import validate_manifest, validate_payload, validate_staged_output
from connector_fetch_support import (
    fetch_bytes_with_query_credential,
    load_manifest,
    provenance,
    publish_pair,
)


HOST = "comtradeapi.un.org"
BASE_URL = f"https://{HOST}/data/v1/get/C/M/HS"
SUBSCRIPTION_QUERY_KEY = "subscription-key"
WINDOW_MONTHS = 61
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
REQUEST_SPACING_SECONDS = 0.27
REPORTERS = {
    32: "Argentina",
    36: "Australia",
    97: "European Union (extra-EU)",
    124: "Canada",
    643: "Russian Federation",
}
REQUIRED_ROW_FIELDS = {
    "typeCode", "freqCode", "classificationCode", "classificationSearchCode",
    "period", "reporterCode", "cmdCode", "flowCode", "partnerCode",
    "partner2Code", "customsCode", "motCode", "qtyUnitCode", "netWgt",
    "primaryValue", "isAggregate", "isNetWgtEstimated", "isReported",
    "legacyEstimationFlag",
}


def _month_shift(value: date, months: int) -> date:
    index = value.year * 12 + value.month - 1 + months
    year, zero_month = divmod(index, 12)
    return date(year, zero_month + 1, 1)


def period_window(today: date, count: int = WINDOW_MONTHS) -> list[str]:
    if not isinstance(count, int) or isinstance(count, bool) or count < 1:
        raise RuntimeError("UN Comtrade month-window count is invalid")
    last_completed = _month_shift(date(today.year, today.month, 1), -1)
    first = _month_shift(last_completed, -(count - 1))
    return [_month_shift(first, offset).strftime("%Y%m") for offset in range(count)]


def _period_date(period: str) -> str:
    if re.fullmatch(r"\d{6}", period) is None:
        raise RuntimeError("UN Comtrade returned a malformed monthly period")
    year, month = int(period[:4]), int(period[4:])
    try:
        return date(year, month, calendar.monthrange(year, month)[1]).isoformat()
    except ValueError as error:
        raise RuntimeError("UN Comtrade returned an invalid monthly period") from error


def _query_url(reporter_code: int, periods: list[str]) -> str:
    if reporter_code not in REPORTERS or not periods or any(re.fullmatch(r"\d{6}", item) is None for item in periods):
        raise RuntimeError("UN Comtrade query identity is invalid")
    query = urllib.parse.urlencode({
        "cmdCode": "1001",
        "period": ",".join(periods),
        "reporterCode": str(reporter_code),
        "partnerCode": "0",
        "partner2Code": "0",
        "flowCode": "X",
        "customsCode": "C00",
        "motCode": "0",
        "maxrecords": "500",
    })
    return f"{BASE_URL}?{query}"


def query_schedule(periods: list[str]) -> list[tuple[int, list[str], str]]:
    by_year: dict[str, list[str]] = defaultdict(list)
    for period in periods:
        if re.fullmatch(r"\d{6}", period) is None:
            raise RuntimeError("UN Comtrade query schedule contains a malformed period")
        by_year[period[:4]].append(period)
    return [
        (reporter_code, sorted(year_periods), _query_url(reporter_code, sorted(year_periods)))
        for reporter_code in sorted(REPORTERS)
        for _year, year_periods in sorted(by_year.items())
    ]


def _fetch_json(url: str, manifest: dict[str, Any], credential: str) -> dict[str, Any]:
    for attempt in range(4):
        try:
            raw = fetch_bytes_with_query_credential(
                url, manifest, query_key=SUBSCRIPTION_QUERY_KEY, credential=credential,
                max_bytes=MAX_RESPONSE_BYTES, timeout=30,
            )
            break
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 3:
                raise RuntimeError(f"UN Comtrade request failed with HTTP {error.code}") from error
            retry_after = error.headers.get("Retry-After") if error.headers else None
            try:
                pause = max(1.0, min(float(retry_after), 8.0))
            except (TypeError, ValueError):
                pause = float(2 ** attempt)
            time.sleep(pause)
        except urllib.error.URLError as error:
            raise RuntimeError("UN Comtrade request failed") from error
    else:  # pragma: no cover - loop always exits through break or exception
        raise RuntimeError("UN Comtrade request retry contract failed")
    try:
        payload = json.loads(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("UN Comtrade response is not strict UTF-8 JSON") from error
    if not isinstance(payload, dict) or set(payload) != {"count", "data", "error", "elapsedTime"}:
        raise RuntimeError("UN Comtrade response envelope changed")
    rows = payload.get("data")
    if not isinstance(rows, list) or payload.get("count") != len(rows) or payload.get("error") not in {None, ""}:
        raise RuntimeError("UN Comtrade response count or error contract failed")
    return payload


def fetch_captures(
    manifest: dict[str, Any], credential: str, periods: list[str],
) -> list[tuple[int, list[str], str, dict[str, Any]]]:
    captures = []
    for index, (reporter_code, query_periods, url) in enumerate(query_schedule(periods)):
        if index:
            time.sleep(REQUEST_SPACING_SECONDS)
        captures.append((reporter_code, query_periods, url, _fetch_json(url, manifest, credential)))
    return captures


def _finite_number(value: Any, *, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise RuntimeError(f"UN Comtrade {field} is not numeric")
    number = float(value)
    if not math.isfinite(number) or number < 0:
        raise RuntimeError(f"UN Comtrade {field} is outside the safe range")
    return number


def _observed_row(row: dict[str, Any], reporter_code: int, period: str) -> dict[str, Any]:
    missing = REQUIRED_ROW_FIELDS - set(row)
    if missing:
        raise RuntimeError(f"UN Comtrade row lost required fields: {sorted(missing)}")
    expected = {
        "typeCode": "C", "freqCode": "M", "classificationSearchCode": "HS",
        "period": period, "reporterCode": reporter_code, "cmdCode": "1001",
        "flowCode": "X", "partnerCode": 0, "partner2Code": 0,
        "customsCode": "C00", "motCode": 0, "isAggregate": True,
    }
    if any(row.get(key) != value for key, value in expected.items()):
        raise RuntimeError("UN Comtrade row identity or physical basis changed")
    classification = row.get("classificationCode")
    if not isinstance(classification, str) or re.fullmatch(r"H(?:S|[0-9])", classification) is None:
        raise RuntimeError("UN Comtrade row has an unsupported HS classification vintage")
    quantity_unit_code = row.get("qtyUnitCode")
    if isinstance(quantity_unit_code, bool) or not isinstance(quantity_unit_code, int):
        raise RuntimeError("UN Comtrade row has an invalid supplementary quantity unit")
    if not isinstance(row.get("isNetWgtEstimated"), bool) or not isinstance(row.get("isReported"), bool):
        raise RuntimeError("UN Comtrade row reporting or estimation metadata changed")
    legacy_estimation_flag = row.get("legacyEstimationFlag")
    if isinstance(legacy_estimation_flag, bool) or not isinstance(legacy_estimation_flag, int):
        raise RuntimeError("UN Comtrade row has an invalid legacy estimation flag")
    net_weight = row.get("netWgt")
    if net_weight is not None and (isinstance(net_weight, bool) or not isinstance(net_weight, (int, float))):
        raise RuntimeError("UN Comtrade net weight is neither numeric nor null")
    trade_value = row.get("primaryValue")
    if trade_value is not None:
        trade_value = _finite_number(trade_value, field="trade value")
    status = "missing" if net_weight is None else "observed"
    return {
        "date": _period_date(period), "period": f"{period[:4]}-{period[4:]}",
        "origin": REPORTERS[reporter_code], "reporter_code": reporter_code,
        "status": status,
        "exports_metric_tonnes": (
            _finite_number(net_weight, field="net weight") / 1000.0 if net_weight is not None else None
        ),
        "trade_value_usd": trade_value,
        "classification_code": classification,
        "supplementary_quantity_unit_code": quantity_unit_code,
        "net_weight_estimated": row["isNetWgtEstimated"],
        "legacy_estimation_flag": legacy_estimation_flag,
        "reported_line": row["isReported"],
        "aggregated_hs_line": True,
        "missing_reason": None if status == "observed" else "official row has no numeric net weight",
    }


def build(
    captures: list[tuple[int, list[str], str, dict[str, Any]]],
    manifest: dict[str, Any], periods: list[str],
) -> tuple[str, dict[str, Any], dict[str, Any]]:
    expected_pairs = {(reporter_code, period) for reporter_code in REPORTERS for period in periods}
    queried_pairs: set[tuple[int, str]] = set()
    actual: dict[tuple[int, str], dict[str, Any]] = {}
    source_urls: list[str] = []
    for reporter_code, query_periods, source_url, envelope in captures:
        if reporter_code not in REPORTERS or not isinstance(query_periods, list) or not isinstance(envelope, dict):
            raise RuntimeError("UN Comtrade capture identity is malformed")
        source_urls.append(source_url)
        for period in query_periods:
            pair = (reporter_code, period)
            if pair not in expected_pairs or pair in queried_pairs:
                raise RuntimeError("UN Comtrade query schedule is incomplete or duplicated")
            queried_pairs.add(pair)
        rows = envelope.get("data")
        if not isinstance(rows, list):
            raise RuntimeError("UN Comtrade capture has no data array")
        for row in rows:
            if not isinstance(row, dict):
                raise RuntimeError("UN Comtrade data array contains a non-object row")
            period = row.get("period")
            pair = (reporter_code, period)
            if not isinstance(period, str) or pair not in queried_pairs or pair in actual:
                raise RuntimeError("UN Comtrade returned an unexpected or duplicate origin-month")
            actual[pair] = _observed_row(row, reporter_code, period)
    if queried_pairs != expected_pairs:
        raise RuntimeError("UN Comtrade query schedule did not cover every required origin-month")

    observed_rows: list[dict[str, Any]] = []
    coverage: list[dict[str, Any]] = []
    for reporter_code, origin in sorted(REPORTERS.items(), key=lambda item: item[1]):
        origin_rows: list[dict[str, Any]] = []
        for period in periods:
            row = actual.get((reporter_code, period))
            if row is not None and row["status"] == "observed":
                observed_rows.append(row)
                origin_rows.append(row)
        observed_dates = [row["date"] for row in origin_rows]
        coverage.append({
            "origin": origin, "reporter_code": reporter_code,
            "expected_months": len(periods), "observed_months": len(origin_rows),
            "missing_months": len(periods) - len(origin_rows),
            "first_observed": min(observed_dates) if observed_dates else None,
            "last_observed": max(observed_dates) if observed_dates else None,
        })
    if not observed_rows:
        raise RuntimeError("UN Comtrade returned no usable major-origin wheat shipment rows")

    observations: list[dict[str, Any]] = []
    for period in periods:
        origins: list[dict[str, Any]] = []
        for reporter_code, origin in sorted(REPORTERS.items(), key=lambda item: item[1]):
            row = actual.get((reporter_code, period))
            if row is None:
                row = {
                    "date": _period_date(period), "period": f"{period[:4]}-{period[4:]}",
                    "origin": origin, "reporter_code": reporter_code, "status": "missing",
                    "exports_metric_tonnes": None, "trade_value_usd": None,
                    "classification_code": None, "supplementary_quantity_unit_code": None,
                    "net_weight_estimated": None, "legacy_estimation_flag": None,
                    "reported_line": None, "aggregated_hs_line": None,
                    "missing_reason": "no matching official reporter row in UN Comtrade",
                }
            origins.append({key: value for key, value in row.items() if key not in {"date", "period"}})
        observations.append({
            "date": _period_date(period), "period": f"{period[:4]}-{period[4:]}",
            "observed_origins": sum(row["status"] == "observed" for row in origins),
            "missing_origins": sum(row["status"] == "missing" for row in origins),
            "estimated_origins": sum(
                row["status"] == "observed" and row["net_weight_estimated"] is True
                for row in origins
            ),
            "origins": origins,
        })

    as_of = max(row["date"] for row in observed_rows)
    payload = {
        "series": manifest["series"], "as_of": as_of, "commodity": "WHEAT",
        "frequency": "monthly", "hs_code": "1001", "flow": "exports to World",
        "quantity_basis": "UN Comtrade net weight converted from kilograms to metric tonnes",
        "period_window": {
            "start": f"{periods[0][:4]}-{periods[0][4:]}",
            "end": f"{periods[-1][:4]}-{periods[-1][4:]}",
            "expected_months_per_origin": len(periods),
        },
        "observations": observations,
        "origin_coverage": coverage, "source_urls": list(dict.fromkeys(source_urls)),
    }
    defects = validate_payload(payload, manifest["output_schema"])
    if defects:
        raise RuntimeError("UN Comtrade output does not match connector schema: " + "; ".join(defects[:5]))
    observed_count = sum(item["observed_origins"] for item in observations)
    missing = sum(item["missing_origins"] for item in observations)
    estimated = sum(item["estimated_origins"] for item in observations)
    expected_count = len(periods) * len(REPORTERS)
    sidecar = provenance(
        manifest, as_of=as_of, source_url=BASE_URL, source_urls=payload["source_urls"],
        note=(
            f"UN Comtrade official reporter submissions: {observed_count} of "
            f"{expected_count} required origin-months observed; {missing} explicitly missing; "
            f"{estimated} net-weight observations flagged as estimated by UN Comtrade."
        ),
    )
    return as_of, payload, sidecar


def _synthetic_row(reporter_code: int, period: str) -> dict[str, Any]:
    return {
        "typeCode": "C", "freqCode": "M", "classificationCode": "H6",
        "classificationSearchCode": "HS", "period": period,
        "reporterCode": reporter_code, "cmdCode": "1001", "flowCode": "X",
        "partnerCode": 0, "partner2Code": 0, "customsCode": "C00", "motCode": 0,
        "qtyUnitCode": 8, "netWgt": float(1_000_000 + reporter_code),
        "primaryValue": float(500_000 + reporter_code), "isAggregate": True,
        "isNetWgtEstimated": False, "isReported": False, "legacyEstimationFlag": 0,
    }


def self_test(fetch_file: str) -> None:
    manifest = load_manifest(fetch_file)
    periods = period_window(date(2026, 8, 30))
    captures = []
    for reporter_code, query_periods, url in query_schedule(periods):
        rows = [_synthetic_row(reporter_code, period) for period in query_periods]
        captures.append((reporter_code, query_periods, url, {
            "count": len(rows), "data": rows, "error": "", "elapsedTime": "0.01 sec",
        }))
    as_of, payload, sidecar = build(captures, manifest, periods)
    defects = validate_manifest(manifest["id"], os.path.dirname(os.path.abspath(fetch_file)), manifest)
    defects += validate_staged_output(manifest, "WHEAT", payload, sidecar, as_of)
    if defects:
        raise AssertionError(defects)
    if len(payload["observations"]) != 61 or any(
        row["observed_origins"] != 5 or len(row["origins"]) != 5
        for row in payload["observations"]
    ):
        raise AssertionError("UN Comtrade self-test lost complete five-origin history")
    partial = json.loads(json.dumps(captures))
    target = next(item for item in partial if item[0] == 643 and periods[-1] in item[1])
    next(row for row in target[3]["data"] if row["period"] == periods[-1])["netWgt"] = None
    _partial_as_of, partial_payload, _partial_sidecar = build(partial, manifest, periods)
    if len(partial_payload["observations"]) != 61 or sum(
        row["missing_months"] for row in partial_payload["origin_coverage"]
    ) != 1 or partial_payload["observations"][-1]["missing_origins"] != 1:
        raise AssertionError("UN Comtrade self-test did not preserve an explicit missing origin-month")
    print(f"PASS: {manifest['id']} official monthly shipment connector")


def main(fetch_file: str) -> int:
    manifest = load_manifest(fetch_file)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if args.verify:
        self_test(fetch_file)
        return 0
    if args.subject != "WHEAT":
        parser.error("--subject must be WHEAT unless --verify")
    credential_name = manifest["credential_env"][0]
    credential = os.environ.get(credential_name)
    if not credential or credential.strip() != credential:
        print(f"FEED-ERROR: {credential_name} is missing or malformed", file=sys.stderr)
        return 1
    periods = period_window(datetime.utcnow().date())
    try:
        captures = fetch_captures(manifest, credential, periods)
        as_of, payload, sidecar = build(captures, manifest, periods)
        defects = validate_staged_output(manifest, "WHEAT", payload, sidecar, as_of)
        if defects:
            raise RuntimeError("UN Comtrade staged output failed validation: " + "; ".join(defects[:5]))
    except RuntimeError as error:
        print(f"FEED-ERROR: {error}", file=sys.stderr)
        return 1
    path = publish_pair(
        data_root=args.data_root, subject="WHEAT", provider_slug="un_comtrade",
        filename=f"wheat_major_origin_shipments_{as_of}.json",
        payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(__file__))
