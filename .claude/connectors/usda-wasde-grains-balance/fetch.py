#!/usr/bin/env python3
"""Fetch the latest released USDA WASDE XML and extract grain supply/use tables."""
from __future__ import annotations

import argparse
import re
import os
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import load_manifest, provenance, publish_pair  # noqa: E402
from connector_http import open_allowed_https, read_bounded_response  # noqa: E402

MANIFEST = load_manifest(__file__)
HOST = "www.usda.gov"
MAX_RESPONSE_BYTES = 4 * 1024 * 1024
SUBJECT_TABLES = {
    "WHEAT": {
        "us": ("U.S. Wheat Supply and Use", "matrix1"),
        "world": ("World Wheat Supply and Use", None),
    },
    "CORN": {
        "us": ("U.S. Feed Grain and Corn Supply and Use", "matrix2"),
        "world": ("World Corn Supply and Use", None),
    },
    "SOYBEANS": {
        "us": ("U.S. Soybeans and Products Supply and Use", "matrix1"),
        "world": ("World Soybean Supply and Use", None),
    },
}
REQUIRED_ATTRIBUTES = {"Beginning Stocks", "Production", "Imports", "Exports", "Ending Stocks"}
REQUIRED_USE_ATTRIBUTES = {"us": "Use, Total", "world": "Domestic Total"}


def _month_candidates(now: datetime) -> list[tuple[int, int]]:
    absolute = now.year * 12 + now.month - 1
    return [divmod(absolute - offset, 12) for offset in range(3)]


def _source_url(year: int, month_zero_based: int) -> str:
    return f"https://{HOST}/oce/commodity/wasde/wasde{month_zero_based + 1:02d}{year % 100:02d}.xml"


def _request(url: str):
    request = urllib.request.Request(url, headers={
        "User-Agent": "nostradamus-connector/1.0",
        "X-Nostra-Connector": MANIFEST["id"],
    })
    return open_allowed_https(request, MANIFEST["host_allowlist"], timeout=20)


def fetch_latest_xml(now: datetime | None = None) -> tuple[bytes, str, str]:
    now = now or datetime.now(timezone.utc)
    for year, month_zero_based in _month_candidates(now):
        url = _source_url(year, month_zero_based)
        try:
            with _request(url) as response:
                if response.status != 200:
                    continue
                raw = read_bounded_response(response, max_bytes=MAX_RESPONSE_BYTES)
                modified = response.headers.get("Last-Modified")
        except urllib.error.HTTPError as error:
            if error.code in {403, 404}:
                continue
            raise
        if len(raw) < 100_000 or not modified:
            continue
        try:
            root = ET.fromstring(raw.decode("utf-8-sig", "strict"))
            modified_at = parsedate_to_datetime(modified).astimezone(timezone.utc)
        except (ET.ParseError, UnicodeDecodeError, TypeError, ValueError, OverflowError):
            continue
        reports = [next(iter(section), None) for section in root]
        report_months = {report.attrib.get("Report_Month") for report in reports if report is not None}
        expected = datetime(year, month_zero_based + 1, 1).strftime("%B %Y")
        titles = " ".join(report.attrib.get("sub_report_title", "") for report in reports if report is not None)
        if report_months != {expected} or not all(name in titles for name in ("World Wheat", "World Corn", "World Soybean")):
            continue
        if modified_at > now:
            raise RuntimeError("USDA WASDE Last-Modified timestamp is in the future")
        if (modified_at.year, modified_at.month) != (year, month_zero_based + 1):
            raise RuntimeError("USDA WASDE release timestamp conflicts with the report month")
        return raw, url, modified_at.date().isoformat()
    raise RuntimeError("no complete USDA WASDE XML release was available in the current three-month window")


def _label(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s+\d+/$", "", value).strip()
    return value


def _status(value: str) -> tuple[str, str]:
    year_match = re.search(r"\d{4}/\d{2}", value)
    if year_match is None:
        raise RuntimeError(f"WASDE market-year label is malformed: {value!r}")
    lowered = value.casefold()
    status = "projection" if "proj" in lowered else ("estimate" if "est" in lowered else "actual")
    return year_match.group(0), status


def _number(value: str) -> float | None:
    match = re.fullmatch(
        r"\s*(-?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+))(?:\s*[*/]+)?\s*",
        value,
    )
    return float(match.group(1).replace(",", "")) if match else None


def _us_unit(attribute: str, declared_units: set[str]) -> str:
    """Bind each US row to the relevant unit explicitly declared by the table."""
    normalized = _label(attribute).casefold()
    if normalized.startswith("area "):
        required, output = "Million Acres", "Million Acres"
    elif normalized.startswith("yield per harvested acre"):
        required, output = "Bushels", "Bushels per acre"
    elif "farm price ($/bu)" in normalized:
        # USDA declares this unit in the attribute label rather than a unit slot.
        return "USD per bushel"
    else:
        required, output = "Million Bushels", "Million Bushels"
    if required not in declared_units:
        raise RuntimeError(
            f"USDA WASDE lost declared unit {required!r} for attribute {attribute!r}"
        )
    return output


def _extract_matrix(matrix: ET.Element, *, title: str, default_scope: str, default_unit: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    table_unit = _label(default_unit.strip("() "))
    declared_units = {
        _label(value) for element in matrix.iter() for key, value in element.attrib.items()
        if "unit_descr" in key and _label(value)
    }
    if default_scope == "United States" and not declared_units:
        raise RuntimeError("USDA WASDE US table has no declared unit slots")
    if default_scope != "United States" and not table_unit:
        raise RuntimeError("USDA WASDE world table has no declared table unit")

    def walk(element: ET.Element, context: dict[str, str]) -> None:
        current = dict(context)
        numeric: list[str] = []
        for key, raw_value in element.attrib.items():
            value = _label(raw_value)
            if re.fullmatch(r"market_year\d*", key) or re.fullmatch(r"region_header\d*", key):
                current["market_year"] = value
            elif re.fullmatch(r"forecast_month\d*", key) and value:
                current["forecast_month"] = value
            elif re.fullmatch(r"region\d*", key):
                current["scope"] = value
            elif re.fullmatch(r"attribute\d*", key):
                current["attribute"] = value
            elif re.fullmatch(r"cell_value\d*", key):
                numeric.append(raw_value)
        for raw_value in numeric:
            value = _number(raw_value)
            if value is None or "market_year" not in current or "attribute" not in current:
                continue
            market_year, estimate_status = _status(current["market_year"])
            unit = (
                _us_unit(current["attribute"], declared_units)
                if default_scope == "United States" else table_unit
            )
            rows.append({
                "table": _label(title),
                "scope": _label(current.get("scope", default_scope)),
                "market_year": market_year,
                "estimate_status": estimate_status,
                "forecast_month": current.get("forecast_month", ""),
                "attribute": _label(current["attribute"]),
                "value": value,
                "unit": unit,
            })
        for child in element:
            walk(child, current)

    walk(matrix, {})
    return rows


def build(raw: bytes, subject: str, source_url: str, as_of: str):
    if subject not in SUBJECT_TABLES:
        raise RuntimeError(f"unsupported WASDE subject {subject!r}")
    try:
        root = ET.fromstring(raw.decode("utf-8-sig", "strict"))
    except (ET.ParseError, UnicodeDecodeError) as error:
        raise RuntimeError("USDA WASDE XML is malformed") from error
    rows: list[dict[str, Any]] = []
    report_month: str | None = None
    matched = {"us": 0, "world": 0}
    required_scope_attributes: dict[str, set[str]] = {"us": set(), "world": set()}
    for section in root:
        report = next(iter(section), None)
        if report is None:
            continue
        title = report.attrib.get("sub_report_title", "")
        for scope_kind, (prefix, matrix_name) in SUBJECT_TABLES[subject].items():
            if not title.startswith(prefix):
                continue
            report_month = report.attrib.get("Report_Month")
            matrices = [child for child in report if matrix_name is None or child.tag == matrix_name]
            if not matrices:
                raise RuntimeError(f"USDA WASDE {scope_kind} table lost its required matrix")
            default_scope = "United States" if scope_kind == "us" else "World"
            default_unit = report.attrib.get("sub_report_subtitle", "")
            for matrix in matrices:
                extracted = _extract_matrix(
                    matrix, title=title, default_scope=default_scope, default_unit=default_unit,
                )
                rows.extend(extracted)
                matched[scope_kind] += len(extracted)
                required_scope = "United States" if scope_kind == "us" else "World"
                required_scope_attributes[scope_kind].update(
                    row["attribute"] for row in extracted if row["scope"] == required_scope
                )
    if not report_month or min(matched.values()) < 6 or len(rows) < 30:
        raise RuntimeError("USDA WASDE response lacks complete US and world balance tables")
    for scope_kind, attributes in required_scope_attributes.items():
        missing = REQUIRED_ATTRIBUTES - attributes
        if REQUIRED_USE_ATTRIBUTES[scope_kind] not in attributes:
            missing.add(REQUIRED_USE_ATTRIBUTES[scope_kind])
        if missing:
            raise RuntimeError(
                f"USDA WASDE {scope_kind} balance attributes are incomplete: {sorted(missing)}"
            )
    scopes = {row["scope"] for row in rows}
    if "United States" not in scopes or not any(scope.startswith("World") for scope in scopes):
        raise RuntimeError("USDA WASDE response lacks both United States and world scopes")
    identities = [
        (row["table"], row["scope"], row["market_year"], row["forecast_month"], row["attribute"])
        for row in rows
    ]
    if len(identities) != len(set(identities)):
        raise RuntimeError("USDA WASDE balance contains duplicate semantic rows")
    payload = {
        "series": MANIFEST["series"], "as_of": as_of, "commodity": subject,
        "report_month": report_month, "rows": rows, "source_url": source_url,
    }
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=source_url,
        note=f"{report_month} WASDE: {len(rows)} point-in-time {subject} supply/use observations.",
    )
    return as_of, payload, sidecar


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and args.subject not in SUBJECT_TABLES:
        parser.error("--subject must be CORN, SOYBEANS or WHEAT unless --verify")
    raw, source_url, release_date = fetch_latest_xml()
    subjects = sorted(SUBJECT_TABLES) if args.verify else [args.subject]
    built = {subject: build(raw, subject, source_url, release_date) for subject in subjects}
    if args.verify:
        summary = ", ".join(f"{subject} {len(result[1]['rows'])}" for subject, result in built.items())
        print(f"OK verify: USDA WASDE {release_date}; {summary} rows")
        return 0
    as_of, payload, sidecar = built[args.subject]
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug="usda",
        filename=f"wasde_balance_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
