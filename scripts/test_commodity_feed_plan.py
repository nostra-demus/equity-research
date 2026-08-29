#!/usr/bin/env python3
"""Contract tests for generic commodity source planning."""
from __future__ import annotations

from commodity_feed_plan import STRUCTURED_PROFILE_ROOT, build_plan, load_authorities


guide = load_authorities()
assert guide["capital_iq"]["route"] == "manual_csv_export"
plans = [build_plan(path.stem) for path in sorted(STRUCTURED_PROFILE_ROOT.glob("*.json"))]
assert plans and all(plan["rows"] for plan in plans)
for plan in plans:
    assert sum(plan["counts"].values()) == len(plan["rows"])
    assert plan["counts"]["contract_conflict"] == 0
    assert all(row["source_rule_id"] and row["authorities"] for row in plan["rows"])
    assert all(row["status"] != "build_needed" or not row["connector_ids"] for row in plan["rows"])
    assert all(
        row["status"] != "build_needed" or row["source_rule_id"] != "generic-authoritative-fallback"
        for row in plan["rows"]
    ), f"{plan['commodity']} has an unclassified feed gap"

copper = next(plan for plan in plans if plan["commodity"] == "COPPER")
real_yield = next(row for row in copper["rows"] if row["need_id"] == "macro-us-10y-real-yield")
assert real_yield["status"] == "implemented_automatic"
assert real_yield["primary_connector_id"] == "fred-us-10y-real-yield"
print("PASS: every commodity profile need has an implemented route or authoritative source plan")
