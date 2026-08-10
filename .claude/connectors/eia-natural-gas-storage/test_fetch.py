#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("eia_gas_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def document() -> dict:
    start = date(2021, 6, 4)
    return {
        "response": {
            "frequency": "weekly",
            "data": [
                {"period": (start + timedelta(days=7 * index)).isoformat(), "series": mod.SERIES_CODE,
                 "units": "BCF", "value": 2000 + index}
                for index in range(270)
            ],
        },
        "request": {"params": {"api_key": "fixture-secret-must-not-survive"}},
    }


fixture = document()
as_of, payload, sidecar = mod.build(fixture)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "NATURAL-GAS", payload, sidecar, as_of)
assert not defects, defects
assert len(payload["observations"]) == 270
assert payload["observations"][-1]["working_gas_bcf"] == 2269
assert "fixture-secret" not in json.dumps([payload, sidecar])
assert "api_key" not in payload["source_url"]
for bad in (
    {"response": []},
    {"response": {"frequency": "weekly", "data": fixture["response"]["data"][:261]}},
    {"response": {"frequency": "daily", "data": fixture["response"]["data"]}},
    {"response": {"frequency": "weekly", "data": [{**row, "units": "MMCF"} for row in fixture["response"]["data"]]}},
    {"response": {"frequency": "weekly", "data": [*fixture["response"]["data"][:-1], {**fixture["response"]["data"][-1], "value": None}]}},
):
    try:
        mod.build(bad)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed EIA response did not fail closed")
print("PASS: eia-natural-gas-storage")
