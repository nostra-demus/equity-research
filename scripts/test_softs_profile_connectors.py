#!/usr/bin/env python3
"""Softs-family profiles, exact CFTC identities, lawful reuse and abstention contract."""
from __future__ import annotations

import glob
import importlib.util
import json
import os
import re
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
from commodity_profile_coverage import compile_coverage, profile_family, structured_profile  # noqa: E402
from connector_contract import load_valid_manifests, validate_manifest, validate_staged_output  # noqa: E402

PROFILE_PATH = os.path.join(REPO, "frameworks", "commodity", "COMMODITY_PROFILES.md")
CONNECTOR_ROOT = os.path.join(REPO, ".claude", "connectors")
MACRO_PROMPT = os.path.join(
    REPO, ".claude", "agents", "commodity", "macro-positioning", "01_commodity-macro-drivers.md",
)
CONTRACTS = {
    "SUGAR": ("cftc-cot-sugar-no11", "sugar-managed-money-positioning", "SUGAR NO. 11", "080732", "@SB.1"),
    "COFFEE": ("cftc-cot-coffee-c", "coffee-managed-money-positioning", "COFFEE C", "083731", "@KC.1"),
    "COCOA": ("cftc-cot-cocoa", "cocoa-managed-money-positioning", "COCOA", "073732", "@CC.1"),
    "COTTON": ("cftc-cot-cotton-no2", "cotton-managed-money-positioning", "COTTON NO. 2", "033661", "@CT.1"),
}
FORBIDDEN = ("wiltw", "what i learned this week", "gold nostra report", "/downloads/")


def section(commodity: str) -> str:
    text = open(PROFILE_PATH, encoding="utf-8").read()
    match = re.search(rf"(?ms)^## {commodity}\s*$\n(.*?)(?=^## \S|\Z)", text)
    assert match
    return match.group(1)


emitting_owners = set()
for agent_file in glob.glob(os.path.join(REPO, ".claude", "agents", "commodity", "*", "[0-9][0-9]_*.md")):
    text = open(agent_file, encoding="utf-8").read()
    if re.search(r"(?m)^emits_signal_evidence:\s*true\s*$", text):
        emitting_owners.add(re.search(r"(?m)^name:\s*([a-z0-9._-]+)\s*$", text).group(1))

profiles: dict[str, list[dict]] = {}
for commodity in CONTRACTS:
    profile_text = section(commodity)
    rows = re.findall(
        r"\| `([a-z0-9._-]+)` \| `([a-z0-9._-]+)` \| ([a-z0-9._-]+) \| (.*?) \| (.*?) \|",
        profile_text,
    )
    requirements = structured_profile(commodity)
    profiles[commodity] = requirements
    assert profile_family(commodity) == "softs"
    assert [
        (row["need"], row["series"], row["owner"], row["requirement"], row["policy"])
        for row in requirements
    ] == rows
    assert len(rows) == len({row[0] for row in rows})
    assert "Family-specific physical-market rules" in profile_text
    assert "Declaring these rows does not make them usable" in profile_text
    assert "forces Research More" in profile_text
    assert all(row["owner"] in emitting_owners for row in requirements)
    assert {"commodity-demand-inventory", "commodity-supply", "commodity-supply-security"} <= {
        row["owner"] for row in requirements
    }
    implemented = {
        CONTRACTS[commodity][1], "climate-enso-oni", "macro-broad-usd-index",
    }
    connector_needs = {row["need"] for row in requirements if row["resolver"]["kind"] == "connector"}
    assert implemented < connector_needs
    for row in requirements:
        if "≥" in row["requirement"]:
            assert {"path", "min_observations", "min_span_days", "date_field"} <= set(row["quality"]), row["need"]
            promised_years = re.findall(r"≥(\d+) years", row["requirement"])
            assert all(row["quality"]["min_span_days"] >= int(years) * 365 for years in promised_years), row["need"]
    combined = profile_text.casefold()
    for forbidden in FORBIDDEN:
        assert forbidden not in combined
    lenses = {
        name: re.search(rf"(?ms)^- {name}: (.*?)(?=^- [A-Z]|\n\n)", profile_text)
        for name in ("Market structure", "Cross-asset regime", "Supply security", "Macro drivers")
    }
    assert all(lenses.values())
    assert not re.search(
        r"(?i)\b(?:eudr|export[\s_-]+quota|biofuel[\s_-]+mandate|farmgate|"
        r"living[\s_-]+income|china[\s_-]+reserve|farm[\s_-]+support|crude|grinding)\b",
        lenses["Macro drivers"].group(1),
    ), f"{commodity}: macro lens duplicates another owner"
    relative = {
        "SUGAR": "crude/sugar", "COFFEE": "arabica–robusta",
        "COCOA": "ny–london", "COTTON": "crude/polyester",
    }[commodity]
    assert relative in lenses["Cross-asset regime"].group(1).casefold()
    assert relative not in lenses["Market structure"].group(1).casefold()

    flow_need = f"{commodity.casefold()}-fund-etn-flows"
    flow = next(row for row in requirements if row["need"] == flow_need)
    assert flow["owner"] == "commodity-positioning-flows"
    assert flow["resolver"]["kind"] == "connector" and "unavailable" in flow["policy"]

required_structure_gaps = {
    "SUGAR": {
        "sugar-regional-physical-basis", "sugar-ice-delivery-pressure",
        "sugar-accessible-physical-inventory",
    },
    "COFFEE": {"coffee-delivery-quality-basis", "coffee-delivery-pressure", "coffee-certified-stocks"},
    "COCOA": {"cocoa-delivery-quality-basis", "cocoa-delivery-pressure", "cocoa-certified-stocks"},
    "COTTON": {"cotton-physical-basis", "cotton-delivery-pressure", "cotton-certified-stocks"},
}
for commodity, needs in required_structure_gaps.items():
    assert needs <= {row["need"] for row in profiles[commodity]}

for commodity, need in {
    "COFFEE": "coffee-arabica-robusta-spread",
    "COCOA": "cocoa-ny-london-spread",
}.items():
    quality = next(row["quality"] for row in profiles[commodity] if row["need"] == need)
    assert quality["path"] == "observations"
    assert quality["min_observations"] >= 150 and quality["min_span_days"] >= 1095

assert "cocoa-weather-disease" not in {row["need"] for row in profiles["COCOA"]}
assert {"cocoa-weather-phenology", "cocoa-disease-pressure"} <= {
    row["need"] for row in profiles["COCOA"]
}
assert "cotton-weather-crop-progress" not in {row["need"] for row in profiles["COTTON"]}
assert {"cotton-weather-phenology", "cotton-crop-progress"} <= {
    row["need"] for row in profiles["COTTON"]
}
assert next(
    row["quality"]["min_observations"]
    for row in profiles["COTTON"] if row["need"] == "cotton-crop-progress"
) >= 260

macro_prompt = open(MACRO_PROMPT, encoding="utf-8").read().casefold()
for boundary in (
    "commodity-cross-asset-regime` owns crude/sugar",
    "commodity-demand-inventory` owns realised cane allocation",
    "commodity-cost-curve` owns the ethanol-parity range",
    "commodity-supply-security` owns dated export and",
):
    assert boundary in macro_prompt
assert "for sugar: physical crude/ethanol parity and brl" not in macro_prompt

for commodity, (_connector_id, need, _contract, _code, symbol) in CONTRACTS.items():
    assert next(row for row in profiles[commodity] if row["need"] == need)["quality"]["min_span_days"] == 1095
    assert next(row for row in profiles[commodity] if row["need"].endswith("current-price"))["resolver"]["symbol"] == symbol
    assert next(row for row in profiles[commodity] if row["need"].startswith(commodity.casefold()) and row["need"].endswith("policy-routing"))["owner"] == "commodity-supply-security"

discovered, skipped = load_valid_manifests(CONNECTOR_ROOT)
by_id = {manifest["id"]: manifest for manifest in discovered}
for commodity, (connector_id, need, contract, code, _symbol) in CONTRACTS.items():
    root = os.path.join(CONNECTOR_ROOT, connector_id)
    manifest_text = open(os.path.join(root, "connector.json"), encoding="utf-8").read()
    fetch_text = open(os.path.join(root, "fetch.py"), encoding="utf-8").read()
    manifest = json.loads(manifest_text)
    assert not validate_manifest(connector_id, root, manifest)
    assert connector_id in by_id, skipped
    assert manifest["dataset_id"] == "cftc.disaggregated-cot-futures-only"
    assert manifest["series_id"] == next(row["series"] for row in profiles[commodity] if row["need"] == need)
    assert manifest["satisfies"] == [need] and manifest["subjects"] == [commodity]
    assert f'contract="{contract}"' in fetch_text and f'contract_code="{code}"' in fetch_text
    assert "from cftc_disaggregated_cot import" in fetch_text
    for forbidden in FORBIDDEN:
        assert forbidden not in (manifest_text + fetch_text).casefold()

    spec = importlib.util.spec_from_file_location(f"softs_{commodity.casefold()}", os.path.join(root, "fetch.py"))
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    rows = []
    for index in range(160):
        day = (date(2023, 1, 3) + timedelta(weeks=index)).isoformat()
        rows.append({
            "contract_market_name": contract, "cftc_contract_market_code": code,
            "report_date_as_yyyy_mm_dd": day + "T00:00:00.000", "open_interest_all": "100000",
            "m_money_positions_long_all": str(50000 + index), "m_money_positions_short_all": "40000",
            "prod_merc_positions_long": "30000", "prod_merc_positions_short": str(60000 + index),
        })
    as_of, payload, sidecar = module.build(rows)
    assert not validate_staged_output(manifest, commodity, payload, sidecar, as_of)
    assert payload["contract"] == contract and payload["contract_code"] == code

cotton_exports = by_id["usda-fas-cotton-export-sales"]
assert cotton_exports["series_id"] == "cotton.export-shipments"
assert cotton_exports["satisfies"] == ["cotton-export-shipments"]
assert cotton_exports["minimum_history"] == {"observations": 260, "path": "observations"}
assert next(
    row["quality"] for row in profiles["COTTON"] if row["need"] == "cotton-export-shipments"
)["min_span_days"] == 1825
assert "cotton-mill-use" in {row["need"] for row in profiles["COTTON"]}

shared_usd = by_id["federal-reserve-broad-usd"]
assert set(CONTRACTS) <= set(shared_usd["subjects"])
oni = by_id["noaa-cpc-oni"]
assert set(CONTRACTS) <= set(oni["subjects"])
assert "enso-probabilities" not in oni["satisfies"]

with tempfile.TemporaryDirectory() as temp:
    empty = Path(temp)
    for commodity in CONTRACTS:
        coverage = compile_coverage(
            commodity=commodity, decision_time="2026-08-10T12:00:00Z",
            data_root=empty / "data", market_root=empty / "market", state_root=empty / "state",
            manifests=discovered,
        )
        assert coverage["complete"] is False and coverage["usable_count"] == 0
        assert set(coverage["unresolved_need_ids"]) == {row["need"] for row in profiles[commodity]}

print("PASS: softs profiles, exact CFTC connectors, lawful shared routes and abstention")
