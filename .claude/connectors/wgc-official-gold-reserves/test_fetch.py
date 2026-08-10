#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("wgc_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

capture = {"as_of": "2026-05-31", "reporting_lag_months": 2,
           "source_url": "https://www.gold.org/goldhub/data/gold-reserves-by-country",
           "changes": [{"institution": "Bank A", "change_tonnes": 4.5, "status": "reported"},
                       {"institution": "Bank B", "change_tonnes": -1.0, "status": "wgc_adjusted"}]}
as_of, payload, sidecar = mod.build(capture)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert payload["net_reported_change_tonnes"] == 3.5 and payload["adjustments_preserved"] is True
assert payload["changes"][1]["status"] == "wgc_adjusted"
for bad in ({**capture, "source_url": "https://example.com"}, {**capture, "changes": []},
            {**capture, "changes": [capture["changes"][0], capture["changes"][0]]}):
    try:
        mod.build(bad)
    except RuntimeError:
        pass
    else:
        raise AssertionError("invalid reserve capture did not fail closed")
print("PASS: wgc-official-gold-reserves")
