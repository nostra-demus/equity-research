#!/usr/bin/env python3
"""Synthetic contract test shared by USDA FAS ESR connector wrappers."""
from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import commodity_usda_fas_esr_feed as feed  # noqa: E402
import connector_fetch_support  # noqa: E402
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def _release(code: int, current_year: int) -> dict:
    return {
        "commodityCode": code,
        "marketYearStart": f"{current_year - 1}-01-01T00:00:00",
        "marketYearEnd": f"{current_year}-12-31T00:00:00",
        "marketYear": current_year,
        "releaseTimeStamp": "2027-01-07T08:30:00.123",
    }


def _row(code: int, unit_id: int, market_year: int, country_code: int, day: str, offset: int) -> dict:
    gross = 1000 + offset
    net = 900 + offset
    return {
        "commodityCode": code,
        "countryCode": country_code,
        "weeklyExports": 800 + offset,
        "accumulatedExports": 10000 + offset,
        "outstandingSales": 5000 + offset,
        "grossNewSales": gross,
        "currentMYNetSales": net,
        "currentMYTotalCommitment": 15000 + offset,
        "nextMYOutstandingSales": 2000 + offset,
        "nextMYNetSales": 300 + offset,
        "unitId": unit_id,
        "weekEndingDate": day + "T00:00:00",
    }


def _captures(config: dict, current_year: int = 2027) -> dict:
    exports = []
    for identity in config["commodity_codes"]:
        for market_year in range(current_year - feed.HISTORY_MARKET_YEARS + 1, current_year + 1):
            start = date(market_year - 1, 1, 7)
            rows = []
            for week in range(52):
                day = (start + timedelta(weeks=week)).isoformat()
                rows.append(_row(identity["code"], identity["unit_id"], market_year, 5700, day, week))
                rows.append(_row(identity["code"], identity["unit_id"], market_year, 1220, day, week + 10))
            exports.append({
                "url": feed.export_url(identity["code"], market_year),
                "commodity_code": identity["code"],
                "market_year": market_year,
                "document": rows,
            })
    return {
        "commodities": [
            {"commodityCode": identity["code"], "commodityName": identity["name"], "unitId": identity["unit_id"]}
            for identity in config["commodity_codes"]
        ],
        "countries": [
            {"countryCode": 5700, "countryName": "CHINA   ", "countryDescription": "CHINA", "regionId": 7, "gencCode": "CHN"},
            {"countryCode": 1220, "countryName": "CANADA", "countryDescription": "CANADA", "regionId": 2, "gencCode": "CAN"},
        ],
        "units": [
            {"unitId": 1, "unitNames": "Metric Tons"},
            {"unitId": 2, "unitNames": "Running Bales"},
        ],
        "release_dates": [_release(identity["code"], current_year) for identity in config["commodity_codes"]],
        "exports": exports,
    }


class _Response:
    status = 200
    headers = {}

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, _size: int) -> bytes:
        if hasattr(self, "_done"):
            return b""
        self._done = True
        return b"[]"


def _header_credential_contract(manifest: dict) -> None:
    captured = {}
    original = connector_fetch_support.open_allowed_https

    def fake_open(request, hosts, *, timeout):
        captured.update(request=request, hosts=hosts, timeout=timeout)
        return _Response()

    connector_fetch_support.open_allowed_https = fake_open
    try:
        body = connector_fetch_support.fetch_bytes_with_header_credential(
            feed.METADATA_URLS["commodities"], manifest,
            header_name="X-Api-Key", credential="fixture-secret",
            max_bytes=100, timeout=9,
        )
    finally:
        connector_fetch_support.open_allowed_https = original
    assert body == b"[]"
    assert captured["request"].full_url == feed.METADATA_URLS["commodities"]
    assert "fixture-secret" not in captured["request"].full_url
    assert captured["request"].get_header("X-api-key") == "fixture-secret"
    assert captured["hosts"] == [feed.HOST] and captured["timeout"] == 9


def run_fixture(fetch_file: str) -> None:
    root = Path(fetch_file).resolve().parent
    manifest = json.loads((root / "connector.json").read_text(encoding="utf-8"))
    config = feed.load_config(fetch_file)
    defects = validate_manifest(manifest["id"], str(root), manifest)
    assert not defects, defects
    as_of, payload, sidecar = feed.build(manifest, config, _captures(config))
    defects = validate_staged_output(manifest, config["subject"], payload, sidecar, as_of)
    assert not defects, defects
    assert len({row["date"] for row in payload["observations"]}) == 312
    assert payload["observations"][-1]["markets"][-1]["totals"]["sales_reductions_or_adjustments"] > 0
    assert "api_key" not in json.dumps([payload, sidecar]).casefold()
    _header_credential_contract(manifest)
    print(f"PASS: {manifest['id']}")
