#!/usr/bin/env python3
"""Contract tests for generic commodity source planning."""
from __future__ import annotations

from commodity_feed_plan import CONNECTORS_ROOT, STRUCTURED_PROFILE_ROOT, build_plan, load_authorities
from connector_contract import load_valid_manifests


guide = load_authorities()
assert guide["schema_version"] == 2
assert guide["capital_iq"]["route"] == "manual_csv_export"
plans = [build_plan(path.stem) for path in sorted(STRUCTURED_PROFILE_ROOT.glob("*.json"))]
assert plans and all(plan["rows"] for plan in plans)
manifests, manifest_defects = load_valid_manifests(str(CONNECTORS_ROOT))
assert not manifest_defects
manifest_by_id = {manifest["id"]: manifest for manifest in manifests}
for plan in plans:
    assert sum(plan["counts"].values()) == len(plan["rows"])
    assert sum(plan["gap_routes"].values()) == plan["counts"]["build_needed"]
    assert plan["counts"]["contract_conflict"] == 0
    assert all(row["source_rule_id"] and row["authorities"] for row in plan["rows"])
    assert all(
        row["status"] != "build_needed"
        or not row["connector_ids"]
        or set(row["connector_ids"]) == set(row["incompatible_connector_ids"])
        for row in plan["rows"]
    )
    assert all(
        row["status"] != "build_needed" or row["source_rule_id"] != "generic-authoritative-fallback"
        for row in plan["rows"]
    ), f"{plan['commodity']} has an unclassified feed gap"
    for row in plan["rows"]:
        if row["status"] not in {"implemented_automatic", "implemented_manual"}:
            continue
        manifest = manifest_by_id[row["primary_connector_id"]]
        licensing = manifest["licensing"]
        if row["status"] == "implemented_automatic":
            assert licensing["access"] == "public"
            assert licensing["use"] == "allowed"
            assert manifest["acquisition"] != "paid_api"
        elif licensing["access"] == "licensed":
            assert manifest["provider"] == guide["capital_iq"]["provider"]

copper = next(plan for plan in plans if plan["commodity"] == "COPPER")
real_yield = next(row for row in copper["rows"] if row["need_id"] == "macro-us-10y-real-yield")
assert real_yield["status"] == "implemented_automatic"
assert real_yield["primary_connector_id"] == "fred-us-10y-real-yield"
gold = next(plan for plan in plans if plan["commodity"] == "GOLD")
for need in ("gold-comex-inventory-deliveries", "gold-official-reserve-changes"):
    row = next(item for item in gold["rows"] if item["need_id"] == need)
    assert row["status"] == "build_needed" and row["incompatibility_reasons"]
comex = next(row for row in gold["rows"] if row["need_id"] == "gold-comex-inventory-deliveries")
assert comex["source_rule_id"] == "gold-comex-inventory-deliveries"
assert {authority["provider"] for authority in comex["authorities"]} == {
    "CME Group COMEX official inventory and delivery reports",
}
assert "not permitted" in comex["capital_iq_fallback"].lower()
aluminium = next(plan for plan in plans if plan["commodity"] == "ALUMINIUM")
for need in ("aluminium-lme-investment-fund-positioning", "aluminium-primary-production"):
    row = next(item for item in aluminium["rows"] if item["need_id"] == need)
    assert row["status"] == "build_needed" and row["incompatibility_reasons"]
for plan in (copper, aluminium):
    row = next(item for item in plan["rows"] if "prepolicy-supply" in item["need_id"])
    assert row["source_rule_id"] == "metals-fundamentals"
for commodity, need in (
    ("CORN", "corn-export-sales-china-demand"),
    ("SOYBEANS", "soybeans-us-export-sales-shipments"),
    ("WHEAT", "wheat-export-sales-shipments"),
    ("COTTON", "cotton-export-shipments"),
):
    plan = next(item for item in plans if item["commodity"] == commodity)
    row = next(item for item in plan["rows"] if item["need_id"] == need)
    assert row["source_rule_id"] == "usda-export-sales"
    assert {authority["provider"] for authority in row["authorities"]} == {
        "USDA Foreign Agricultural Service",
    }
soy_china = next(
    item for item in next(plan for plan in plans if plan["commodity"] == "SOYBEANS")["rows"]
    if item["need_id"] == "soybeans-china-import-arrivals"
)
assert soy_china["source_rule_id"] == "china-activity-trade"
natural_gas = next(plan for plan in plans if plan["commodity"] == "NATURAL-GAS")
for need in (
    "natural-gas-lng-export-capacity-availability",
    "natural-gas-russian-pipeline-availability",
):
    row = next(item for item in natural_gas["rows"] if item["need_id"] == need)
    assert row["source_rule_id"] == "natural-gas-capacity-availability"
    providers = {authority["provider"] for authority in row["authorities"]}
    assert "U.S. Energy Information Administration" in providers
    assert "Federal Energy Regulatory Commission" in providers
    assert "U.S. Department of Energy natural-gas import/export reports" in providers
    assert "ENTSOG Transparency Platform and primary transmission operators" in providers
soybeans = next(plan for plan in plans if plan["commodity"] == "SOYBEANS")
board_crush = next(row for row in soybeans["rows"] if row["need_id"] == "soybeans-board-crush")
assert board_crush["source_rule_id"] == "soybeans-board-crush"
assert {authority["provider"] for authority in board_crush["authorities"]} == {
    "CME Group CBOT soybean, soybean-meal, and soybean-oil settlements",
}
assert "aligned months" in board_crush["capital_iq_fallback"]
assert board_crush["route_kind"] == "derived"
assert board_crush["capital_iq_use"] == "raw_parent_only"
fund_rows = [
    row for plan in plans for row in plan["rows"]
    if row["source_rule_id"] == "fund-holdings-flows"
]
assert fund_rows
assert all("issuer" in row["lawful_source_policy"].lower() for row in fund_rows)
assert all("not permitted" in row["capital_iq_fallback"].lower() for row in fund_rows)
assert all(row["route_kind"] == "issuer_only" for row in fund_rows)
assert all(row["capital_iq_use"] == "not_permitted" for row in fund_rows)
gas_capacity = next(
    row for row in natural_gas["rows"]
    if row["need_id"] == "natural-gas-lng-export-capacity-availability"
)
assert gas_capacity["route_kind"] == "composite"
assert gas_capacity["capital_iq_use"] == "partial_input"
assert comex["route_kind"] == "manual_official"
assert comex["capital_iq_use"] == "not_permitted"

expected_automatic_routes = {
    ("CORN", "corn-crop-progress-condition"): "usda-nass-corn-crop-progress",
    ("COTTON", "cotton-crop-progress"): "usda-nass-cotton-crop-progress",
    ("SOYBEANS", "soybeans-crop-progress-condition"): "usda-nass-soybeans-crop-progress",
    ("WHEAT", "wheat-crop-progress-condition"): "usda-nass-wheat-crop-progress",
    ("CRUDE-OIL", "crude-oil-refinery-throughput-product-demand"): "eia-crude-refinery-demand",
    ("COFFEE", "coffee-global-balance"): "usda-fas-coffee-global-balance",
}
for (commodity, need), connector_id in expected_automatic_routes.items():
    plan = next(item for item in plans if item["commodity"] == commodity)
    row = next(item for item in plan["rows"] if item["need_id"] == need)
    assert row["status"] == "implemented_automatic"
    assert row["primary_connector_id"] == connector_id
print("PASS: every commodity profile need has an implemented route or authoritative source plan")
