#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("eia_refinery_demand", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def rows(identity: dict[str, str], offset: int) -> list[dict]:
    result = []
    for index in range(160):
        result.append({
            "period": f"2023-{1 + index // 28:02d}-{1 + index % 28:02d}",
            "duoarea": "NUS", "area-name": "U.S.", "product": identity["product"],
            "product-name": identity["product_name"], "process": identity["process"],
            "process-name": identity["process_name"], "series": identity["code"],
            "series-description": identity["description"], "units": "MBBL/D",
            "value": 10000 + offset + index,
        })
    return result


document = {"response": {"frequency": "weekly", "data": [
    row for offset, identity in enumerate(mod.SERIES.values()) for row in rows(identity, offset * 1000)
]}}
as_of, payload, sidecar = mod.build(document)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest)
defects += validate_staged_output(manifest, "CRUDE-OIL", payload, sidecar, as_of)
assert not defects, defects
assert len(payload["observations"]) == 160
assert payload["observations"][-1]["jet_fuel_supplied_thousand_bpd"] == 14159
assert "api_key" not in json.dumps([payload, sidecar])
bad = {"response": {"frequency": "weekly", "data": document["response"]["data"][:-1]}}
try:
    mod.build(bad)
except RuntimeError:
    pass
else:
    raise AssertionError("misaligned EIA response did not fail closed")
print("PASS: eia-crude-refinery-demand")
