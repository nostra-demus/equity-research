#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("lbma_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

vault = "<html><body>LBMA London Vault Holdings Data June 2026 As at end June 2026, the amount of gold held in London vaults was 9,464 tonnes (a 0.77% increase on previous month)</body></html>"
clearing = "<html><body>LBMA Clearing Data June 2026 The volume of gold transferred in June increased by 4.1% month on month (m/m) to 16.7mn ounces, with the corresponding value transferred down by 3.8% m/m to $70.9bn. There were 7,227 transfers, 11.8% higher m/m.</body></html>"
as_of, payload, sidecar = mod.build(vault, clearing)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert as_of == "2026-06-30" and payload["vault"]["gold_tonnes"] == 9464
assert payload["clearing"]["value_change_mom_pct"] == -3.8 and payload["benchmark_price_included"] is False
assert "benchmark" in sidecar["note"].casefold()
for bad in ("<html>price only</html>", ""):
    try:
        mod.build(bad, clearing)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed LBMA page did not fail closed")
print("PASS: lbma-gold-vault-clearing")
