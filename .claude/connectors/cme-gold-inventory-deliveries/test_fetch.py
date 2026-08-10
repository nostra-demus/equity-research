#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("cme_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

capture = {"as_of": "2026-08-07", "registered_ounces": 10200000.0, "eligible_ounces": 25000000.0,
           "received_ounces": 1000.0, "shipped_ounces": 2000.0, "delivery_notices": 42,
           "delivery_contract": "GC AUG26", "source_report": "Gold Stocks / Daily Metal Delivery Notices",
           "source_url": "https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html"}
as_of, payload, sidecar = mod.build(capture)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert payload["total_ounces"] == 35200000.0 and payload["manual_source"] is True
for bad in ({**capture, "source_url": "https://example.com/report"}, {**capture, "delivery_notices": 1.5}, {**capture, "registered_ounces": -1}):
    try:
        mod.build(bad)
    except RuntimeError:
        pass
    else:
        raise AssertionError("invalid CME capture did not fail closed")
print("PASS: cme-gold-inventory-deliveries")
