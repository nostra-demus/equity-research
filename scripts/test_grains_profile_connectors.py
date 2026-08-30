#!/usr/bin/env python3
"""Grains-family profiles, lawful connectors and abstention contract."""
from __future__ import annotations

import glob
import json
import os
import re
import sys
import tempfile
from pathlib import Path

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
from commodity_profile_coverage import compile_coverage, profile_family, structured_profile  # noqa: E402
from connector_contract import load_valid_manifests, validate_manifest  # noqa: E402

PROFILE_PATH = os.path.join(REPO, "frameworks", "commodity", "COMMODITY_PROFILES.md")
CONNECTOR_ROOT = os.path.join(REPO, ".claude", "connectors")
CONNECTORS = {
    "WHEAT": {
        "cftc-cot-wheat-srw": "wheat-managed-money-positioning",
        "noaa-cpc-oni": "climate-enso-oni",
        "federal-reserve-broad-usd": "macro-broad-usd-index",
        "usda-wasde-grains-balance": "grains-usda-wasde-balance",
        "usda-fas-wheat-export-sales": "wheat-export-sales-shipments",
    },
    "CORN": {
        "cftc-cot-corn": "corn-managed-money-positioning",
        "noaa-cpc-oni": "climate-enso-oni",
        "federal-reserve-broad-usd": "macro-broad-usd-index",
        "usda-wasde-grains-balance": "grains-usda-wasde-balance",
        "usda-fas-corn-export-sales": "corn-export-sales-china-demand",
    },
    "SOYBEANS": {
        "cftc-cot-soybeans": "soybeans-managed-money-positioning",
        "noaa-cpc-oni": "climate-enso-oni",
        "federal-reserve-broad-usd": "macro-broad-usd-index",
        "usda-wasde-grains-balance": "grains-usda-wasde-balance",
        "usda-fas-soybeans-export-sales": "soybeans-us-export-sales-shipments",
    },
}
FORBIDDEN = ("wiltw", "what i learned this week", "gold nostra report", "/downloads/")
AGENT_FILES = glob.glob(os.path.join(REPO, ".claude", "agents", "commodity", "*", "[0-9][0-9]_*.md"))
EMITTING_OWNERS = set()
for agent_file in AGENT_FILES:
    agent_text = open(agent_file, encoding="utf-8").read()
    if re.search(r"(?m)^emits_signal_evidence:\s*true\s*$", agent_text):
        name = re.search(r"(?m)^name:\s*([a-z0-9._-]+)\s*$", agent_text)
        assert name, f"{agent_file}: emitting orb has no canonical frontmatter name"
        EMITTING_OWNERS.add(name.group(1))


def section(commodity: str) -> str:
    text = open(PROFILE_PATH, encoding="utf-8").read()
    match = re.search(rf"(?ms)^## {re.escape(commodity)}\s*$\n(.*?)(?=^## \S|\Z)", text)
    assert match, f"{commodity} profile section missing"
    return match.group(1)


def connector(connector_id: str, commodity: str, need: str) -> dict:
    root = os.path.join(CONNECTOR_ROOT, connector_id)
    manifest_text = open(os.path.join(root, "connector.json"), encoding="utf-8").read()
    fetch_text = open(os.path.join(root, "fetch.py"), encoding="utf-8").read()
    manifest = json.loads(manifest_text)
    assert not validate_manifest(connector_id, root, manifest)
    assert commodity in manifest["subjects"] and need in manifest["satisfies"]
    combined = (manifest_text + "\n" + fetch_text).casefold()
    for forbidden in FORBIDDEN:
        assert forbidden not in combined, f"{connector_id}: forbidden runtime identity {forbidden!r}"
    return manifest


all_manifests: dict[str, dict] = {}
profiles: dict[str, list[dict]] = {}
for commodity, connector_needs in CONNECTORS.items():
    profile = section(commodity)
    rows = re.findall(r"\| `([a-z0-9._-]+)` \| `([a-z0-9._-]+)` \| ([a-z0-9._-]+) \|", profile)
    requirements = structured_profile(commodity)
    profiles[commodity] = requirements
    assert rows and [row["need"] for row in requirements] == [row[0] for row in rows]
    assert len(rows) == len({row[0] for row in rows})
    assert profile_family(commodity) == "grains"
    assert "Family-specific physical-market rules" in profile
    assert "Declaring these rows does not make them usable" in profile
    for need, _series, owner in rows:
        assert owner in EMITTING_OWNERS, f"{need}: causal owner {owner!r} is not an emitting orb identity"
    connector_rows = {row["need"] for row in requirements if row["resolver"]["kind"] == "connector"}
    assert set(connector_needs.values()) < connector_rows, f"{commodity}: physical gaps must remain explicit"
    for connector_id, need in connector_needs.items():
        manifest = connector(connector_id, commodity, need)
        all_manifests[connector_id] = manifest
        expected_series = next(row["series"] for row in requirements if row["need"] == need)
        assert manifest["series_id"] == expected_series

shared_needs = ("climate-enso-oni", "macro-broad-usd-index", "grains-usda-wasde-balance")
for need in shared_needs:
    contracts = [{key: row[key] for key in ("series", "owner", "requirement", "policy")}
                 for requirements in profiles.values() for row in requirements if row["need"] == need]
    assert len(contracts) == 3 and contracts.count(contracts[0]) == 3, f"{need}: shared semantics drifted"

symbols = {
    "WHEAT": ("wheat-current-price", "@W.1"),
    "CORN": ("corn-current-price", "@C.1"),
    "SOYBEANS": ("soybeans-current-price", "@S.1"),
}
for commodity, (need, symbol) in symbols.items():
    assert next(row for row in profiles[commodity] if row["need"] == need)["resolver"]["symbol"] == symbol

assert next(row for row in profiles["WHEAT"] if row["need"] == "wheat-acreage-yield-production")["owner"] == "commodity-supply"
assert next(row for row in profiles["WHEAT"] if row["need"] == "wheat-supply-restrictions-routing")["owner"] == "commodity-supply-security"
assert next(row for row in profiles["CORN"] if row["need"] == "corn-ethanol-demand")["owner"] == "commodity-demand-inventory"
assert next(row for row in profiles["CORN"] if row["need"] == "corn-biofuel-policy")["owner"] == "commodity-supply-security"
assert next(row for row in profiles["SOYBEANS"] if row["need"] == "soybeans-board-crush")["owner"] == "commodity-price-curve"
assert next(row for row in profiles["SOYBEANS"] if row["need"] == "soybeans-biofuel-physical-use")["owner"] == "commodity-demand-inventory"
assert next(row for row in profiles["SOYBEANS"] if row["need"] == "soybeans-biofuel-policy")["owner"] == "commodity-supply-security"
assert next(row for row in profiles["SOYBEANS"] if row["need"] == "soybeans-stocks-use")["quality"]["min_span_days"] == 3650
for commodity, need in (
    ("WHEAT", "wheat-export-sales-shipments"),
    ("CORN", "corn-export-sales-china-demand"),
    ("SOYBEANS", "soybeans-us-export-sales-shipments"),
):
    quality = next(row for row in profiles[commodity] if row["need"] == need)["quality"]
    assert quality["min_observations"] == 260 and quality["min_span_days"] == 1825
assert all(
    next(row for row in profiles[commodity] if row["need"].endswith("cost-export-parity-range")
         or row["need"].endswith("cost-value-range") or row["need"].endswith("cost-crush-value-range"))["owner"]
    == "commodity-cost-curve"
    for commodity in CONNECTORS
)

for commodity, requirements in profiles.items():
    for row in requirements:
        if "≥" not in row["requirement"]:
            continue
        missing = {"path", "min_observations", "min_span_days", "date_field"} - set(row["quality"])
        assert not missing, f"{commodity}/{row['need']}: unenforced declared history {sorted(missing)}"

for commodity in CONNECTORS:
    profile_text = section(commodity)
    macro = re.search(r"(?ms)^- Macro drivers: (.*?)(?=^- [A-Z]|\n\n)", profile_text)
    market = re.search(r"(?ms)^- Market structure: (.*?)(?=^- [A-Z]|\n\n)", profile_text)
    cross = re.search(r"(?ms)^- Cross-asset regime: (.*?)(?=^- [A-Z]|\n\n)", profile_text)
    supply_security = re.search(r"(?ms)^- Supply security: (.*?)(?=^- [A-Z]|\n\n)", profile_text)
    assert macro and market and cross and supply_security
    assert "commodity-supply-security" in {row["owner"] for row in profiles[commodity]}
    assert not re.search(
        r"(?i)china demand|biofuel mandate|tariff|export polic|export tax|quota|war|routing",
        macro.group(1),
    ), f"{commodity}: macro lens duplicates another causal owner"
    relative_terms = {
        "WHEAT": ("wheat/corn",),
        "CORN": ("corn/soybean", "corn/crude"),
        "SOYBEANS": ("soybean/corn", "breadth"),
    }[commodity]
    assert all(term in cross.group(1).casefold() for term in relative_terms)
    assert all(term not in market.group(1).casefold() for term in relative_terms)

macro_agent = open(os.path.join(
    REPO, ".claude", "agents", "commodity", "macro-positioning", "01_commodity-macro-drivers.md",
), encoding="utf-8").read()
assert "For grains, own only broad-USD, producer-FX and non-policy input-cost context" in macro_agent
assert "Gold's safe-haven/geopolitical-demand lens" in macro_agent

expected_subjects = {
    "ALUMINIUM", "COCOA", "COFFEE", "COPPER", "CORN", "COTTON", "CRUDE-OIL",
    "GOLD", "SOYBEANS", "SUGAR", "WHEAT",
}
assert set(all_manifests["federal-reserve-broad-usd"]["subjects"]) == expected_subjects
oni = all_manifests["noaa-cpc-oni"]
assert {"SOYBEAN", "SOYBEANS"} <= set(oni["subjects"])
assert oni["schema_version"] == 2 and oni["minimum_history"] == {"observations": 360, "path": "observations"}
assert set(oni["satisfies"]) == {"climate-enso-oni", "noaa-enso"}
wasde = all_manifests["usda-wasde-grains-balance"]
assert wasde["dataset_id"] == "usda.waob.wasde-xml"
assert set(wasde["subjects"]) == set(CONNECTORS)
assert wasde["release"]["revision_policy"] == "revisable"
publisher_paths = set(json.load(open(
    os.path.join(REPO, "frameworks", "connector-publisher-files.json"), encoding="utf-8",
))["paths"])
assert {
    "scripts/commodity_bis_fx_feed.py",
    "scripts/commodity_usda_crop_progress_feed.py",
    "scripts/commodity_usda_fas_esr_feed.py",
    "scripts/commodity_usda_psd_feed.py",
} <= publisher_paths

cftc_contracts = {
    "cftc-cot-wheat-srw": ("WHEAT-SRW", "001602"),
    "cftc-cot-corn": ("CORN", "002602"),
    "cftc-cot-soybeans": ("SOYBEANS", "005602"),
}
for connector_id, (contract_name, contract_code) in cftc_contracts.items():
    manifest = all_manifests[connector_id]
    assert manifest["dataset_id"] == "cftc.disaggregated-cot-futures-only"
    assert manifest["minimum_history"]["observations"] == 150
    assert next(row for row in profiles[manifest["subjects"][0]] if row["need"] == manifest["satisfies"][0])["quality"]["min_span_days"] == 1095
    fetch_text = open(os.path.join(CONNECTOR_ROOT, connector_id, "fetch.py"), encoding="utf-8").read()
    assert "from cftc_disaggregated_cot import" in fetch_text
    assert f'contract="{contract_name}"' in fetch_text and f'contract_code="{contract_code}"' in fetch_text
assert {"cftc-cot", "managed-money-positioning"} <= set(all_manifests["cftc-cot-wheat-srw"]["satisfies"])

discovered, skipped = load_valid_manifests(CONNECTOR_ROOT)
discovered_ids = {manifest["id"] for manifest in discovered}
assert set(all_manifests) <= discovered_ids, {
    "missing": sorted(set(all_manifests) - discovered_ids), "skipped": skipped,
}
with tempfile.TemporaryDirectory() as temp:
    empty = Path(temp)
    for commodity in CONNECTORS:
        coverage = compile_coverage(
            commodity=commodity, decision_time="2026-08-10T12:00:00Z",
            data_root=empty / "data", market_root=empty / "market", state_root=empty / "state",
            manifests=discovered,
        )
        assert coverage["complete"] is False and coverage["usable_count"] == 0
        assert set(coverage["unresolved_need_ids"]) == {
            row["need"] for row in structured_profile(commodity)
        }

print("PASS: grains profiles, point-in-time primary connectors, physical rules and abstention")
