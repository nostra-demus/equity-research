#!/usr/bin/env python3
"""Unit test for the CFTC WHEAT-SRW COT connector — parse/transform + fail-closed + manifest consistency,
NO network (fixture record). A CFTC Socrata field rename is the realistic break; the live endpoint is proven
by `fetch.py --verify` at merge time. Run: python3 test_fetch.py
"""
from __future__ import annotations

import importlib.util
import json
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("cftc_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

REC = {
    "contract_market_name": "WHEAT-SRW",
    "report_date_as_yyyy_mm_dd": "2026-07-07T00:00:00.000",
    "m_money_positions_long_all": "73719",
    "m_money_positions_short_all": "134151",
    "change_in_m_money_long_all": "4617",
    "change_in_m_money_short_all": "-2512",
    "open_interest_all": "412570",
    "pct_of_oi_m_money_long_all": "17.9",
    "pct_of_oi_m_money_short_all": "32.5",
}

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


asof, net, stance, payload, sidecar = mod.build([REC])
mm = payload["managed_money"]
check("net = long - short (net short)", net == 73719 - 134151 and net == -60432 and mm["net"] == -60432)
check("stance net_short", stance == "net_short" and mm["stance"] == "net_short")
check("net_change_wow = Δlong - Δshort", mm["net_change_wow"] == 4617 - (-2512) and mm["net_change_wow"] == 7129)
check("as_of is the COT report date, read from the data", asof == "2026-07-07" and sidecar["as_of"] == "2026-07-07")
check("open interest + %OI parsed", payload["open_interest_all"] == 412570 and mm["pct_of_oi_short"] == 32.5)
check("sidecar tier 5 + paid_api + connector_id",
      sidecar["tier"] == 5 and sidecar["source_type"] == "paid_api" and sidecar["connector_id"] == "cftc-cot-wheat-srw")

_, net_l, stance_l, _, _ = mod.build([dict(REC, m_money_positions_long_all="150000", m_money_positions_short_all="100000")])
check("net_long when long > short", net_l == 50000 and stance_l == "net_long")

for bad, label in [
    ([], "empty result"),
    ([dict(REC, contract_market_name="CORN")], "wrong contract"),
    ([{k: v for k, v in REC.items() if k != "m_money_positions_long_all"}], "missing managed-money field"),
]:
    raised = False
    try:
        mod.build(bad)
    except Exception:
        raised = True
    check(f"fail-closed on {label} (writes nothing)", raised)

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "paid_api")
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])

print(f"\n{'PASS' if not _fails else 'FAIL'}: cftc-cot-wheat-srw connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
