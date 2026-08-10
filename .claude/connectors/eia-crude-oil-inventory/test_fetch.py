#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("eia_crude_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def document(code: str, offset: int = 0) -> dict:
    return {
        "response": {
            "frequency": "weekly",
            "data": [
                {"period": f"2023-{1 + index // 28:02d}-{1 + index % 28:02d}", "series": code,
                 "units": "MBBL", "value": 300000 + offset + index}
                for index in range(160)
            ],
        },
        "request": {"params": {"api_key": "fixture-secret-must-not-survive"}},
    }


commercial = document(mod.SERIES["commercial"][1])
spr = document(mod.SERIES["spr"][1], 10000)
as_of, payload, sidecar = mod.build(commercial, spr)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "CRUDE-OIL", payload, sidecar, as_of)
assert not defects, defects
assert len(payload["observations"]) == 160
assert payload["observations"][-1]["total_observed_crude_stocks_thousand_bbl"] == 610318
assert "fixture-secret" not in json.dumps([payload, sidecar])
assert all("api_key" not in url for url in payload["source_urls"])
for bad_commercial, bad_spr in (
    ({"response": []}, spr),
    ({"response": {"frequency": "weekly", "data": commercial["response"]["data"][:149]}}, spr),
    ({"response": {"frequency": "daily", "data": commercial["response"]["data"]}}, spr),
    (commercial, {"response": {"frequency": "weekly", "data": spr["response"]["data"][:-1]}}),
    ({"response": {"frequency": "weekly", "data": [{**row, "units": "BBL"} for row in commercial["response"]["data"]]}}, spr),
):
    try:
        mod.build(bad_commercial, bad_spr)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed EIA response did not fail closed")
print("PASS: eia-crude-oil-inventory")
