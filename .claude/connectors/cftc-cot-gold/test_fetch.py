#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("cftc_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def row(index: int) -> dict:
    day = f"2023-{1 + index // 28:02d}-{1 + index % 28:02d}"
    return {
        "contract_market_name": "GOLD", "cftc_contract_market_code": "088691",
        "report_date_as_yyyy_mm_dd": day + "T00:00:00.000", "open_interest_all": "300000",
        "m_money_positions_long_all": str(100000 + index), "m_money_positions_short_all": "20000",
        "prod_merc_positions_long": "15000", "prod_merc_positions_short": str(40000 + index),
    }


rows = [row(i) for i in range(160)]
as_of, payload, sidecar = mod.build(rows)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert len(payload["observations"]) == 160
assert payload["observations"][-1]["managed_money_net"] == 80159
assert payload["observations"][-1]["producer_net"] == -25159
for bad in (rows[:149], [*rows[:159], {**rows[-1], "contract_market_name": "SILVER"}],
            [*rows[:159], {**rows[-1], "open_interest_all": "3.5"}],
            [*rows[:159], {**rows[-1], "m_money_positions_short_all": "-1"}]):
    try:
        mod.build(bad)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed CFTC response did not fail closed")
print("PASS: cftc-cot-gold")
