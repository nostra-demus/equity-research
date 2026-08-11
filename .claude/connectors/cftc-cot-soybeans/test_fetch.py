#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("cftc_soybeans_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def row(index: int) -> dict:
    day = (date(2023, 1, 3) + timedelta(weeks=index)).isoformat()
    return {
        "contract_market_name": mod.CONTRACT, "cftc_contract_market_code": mod.CONTRACT_CODE,
        "report_date_as_yyyy_mm_dd": day + "T00:00:00.000", "open_interest_all": "900000",
        "m_money_positions_long_all": str(180000 + index), "m_money_positions_short_all": "150000",
        "prod_merc_positions_long": "250000", "prod_merc_positions_short": str(500000 + index),
    }


rows = [row(index) for index in range(160)]
as_of, payload, sidecar = mod.build(rows)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(
    manifest, "SOYBEANS", payload, sidecar, as_of,
)
assert not defects, defects
assert payload["contract"] == "SOYBEANS" and payload["contract_code"] == "005602"
assert payload["observations"][-1]["managed_money_net"] == 30159
assert payload["observations"][-1]["producer_net"] == -250159
for bad in (rows[:149], [*rows[:159], {**rows[-1], "cftc_contract_market_code": "000000"}]):
    try:
        mod.build(bad)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed CFTC Soybeans response did not fail closed")
print("PASS: cftc-cot-soybeans")
