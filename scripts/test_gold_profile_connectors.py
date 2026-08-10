#!/usr/bin/env python3
"""Gold profile/connector golden contract.

Pins semantic coverage, manual-only exceptions, shared market-route reuse and the
methodology-source exclusion without making connector names part of engine code.
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
from connector_contract import validate_manifest  # noqa: E402
from commodity_profile_coverage import structured_profile  # noqa: E402

PROFILE_PATH = os.path.join(REPO, "frameworks", "commodity", "COMMODITY_PROFILES.md")
CONNECTOR_ROOT = os.path.join(REPO, ".claude", "connectors")
CONNECTOR_IDS = {
    "cftc-cot-gold",
    "treasury-real-yields-gold",
    "federal-reserve-broad-usd",
    "bls-cpi-gold",
    "cme-gold-inventory-deliveries",
    "lbma-gold-vault-clearing",
    "wgc-official-gold-reserves",
    "usgs-gold-mine-supply",
    "ishares-iau-gold-holdings",
}
REQUIRED_CONNECTOR_NEEDS = {
    "gold-managed-money-positioning",
    "gold-real-yields",
    "macro-broad-usd-index",
    "gold-consumer-price-index",
    "gold-comex-inventory-deliveries",
    "gold-lbma-vault-clearing",
    "gold-official-reserve-changes",
    "gold-mine-supply",
    "gold-issuer-etf-holdings",
}
SHARED_NEEDS = {
    "gold-equity-index-history",
    "gold-miner-equity-history",
    "gold-silver-price-history",
    "gold-silver-miner-history",
    "gold-current-price",
    "gold-market-price-history",
    "gold-futures-curve",
    "gold-cash-spot-price",
    "gold-cash-futures-basis",
    "gold-regional-physical-premiums",
}
FORBIDDEN = (
    "wiltw",
    "what i learned this week",
    "gold nostra report",
    "/downloads/",
)


def gold_section() -> str:
    text = open(PROFILE_PATH, encoding="utf-8").read()
    match = re.search(r"(?ms)^## GOLD\s*$\n(.*?)(?=^## \S|\Z)", text)
    assert match, "GOLD profile section missing"
    return match.group(1)


def load_connector(connector_id: str) -> tuple[dict, str]:
    root = os.path.join(CONNECTOR_ROOT, connector_id)
    manifest_path = os.path.join(root, "connector.json")
    fetch_path = os.path.join(root, "fetch.py")
    manifest_text = open(manifest_path, encoding="utf-8").read()
    fetch_text = open(fetch_path, encoding="utf-8").read()
    manifest = json.loads(manifest_text)
    defects = validate_manifest(connector_id, root, manifest)
    assert not defects, f"{connector_id}: {defects}"
    assert "GOLD" in manifest["subjects"], connector_id
    combined = (manifest_text + "\n" + fetch_text).casefold()
    for forbidden in FORBIDDEN:
        assert forbidden not in combined, f"{connector_id}: forbidden runtime identity {forbidden!r}"
    return manifest, combined


profile = gold_section()
profile_rows = re.findall(
    r"\| `([a-z0-9._-]+)` \| `([a-z0-9._-]+)` \| ([a-z0-9._-]+) \|",
    profile,
)
profile_needs = {need for need, _series_id, _owner in profile_rows}
assert profile_needs == REQUIRED_CONNECTOR_NEEDS | SHARED_NEEDS, profile_needs
assert len(profile_rows) == len(profile_needs), "Gold needs must be unique"
for need, _series_id, owner in profile_rows:
    matches = glob.glob(os.path.join(REPO, ".claude", "agents", "commodity", "*", f"[0-9][0-9]_{owner}.md"))
    assert len(matches) == 1, f"{need}: causal owner {owner!r} must resolve to exactly one orb"

typed_requirements = structured_profile("GOLD")
assert [row["need"] for row in typed_requirements] == [row[0] for row in profile_rows]
resolver_by_need = {row["need"]: row["resolver"]["kind"] for row in typed_requirements}
assert resolver_by_need["gold-current-price"] == "pulse_quote"
assert resolver_by_need["gold-market-price-history"] == "shared_market"
assert resolver_by_need["gold-cash-spot-price"] == "connector"
assert resolver_by_need["gold-cash-futures-basis"] == "derived"
assert resolver_by_need["gold-futures-curve"] == "connector"
assert resolver_by_need["gold-regional-physical-premiums"] == "connector"
market_history = next(row for row in typed_requirements if row["need"] == "gold-market-price-history")
assert market_history["resolver"] == {
    "kind": "shared_market", "symbol": "@GC.1", "instrument_kind": "future",
    "price_basis": "continuous_back_adjusted",
}
basis = next(row for row in typed_requirements if row["need"] == "gold-cash-futures-basis")
assert basis["resolver"]["operation"] == "left_minus_right_pct_of_right"
assert basis["resolver"]["left"]["series"] == "gold.cash-spot-price"

manifests: dict[str, dict] = {}
covered: dict[str, list[str]] = {need: [] for need in REQUIRED_CONNECTOR_NEEDS}
for connector_id in sorted(CONNECTOR_IDS):
    manifest, _ = load_connector(connector_id)
    manifests[connector_id] = manifest
    for need in REQUIRED_CONNECTOR_NEEDS:
        if need in manifest["satisfies"]:
            covered[need].append(connector_id)
    assert not (SHARED_NEEDS & set(manifest["satisfies"])), (
        f"{connector_id}: shared quote/history routes must be reused, not cloned"
    )

assert all(len(owners) == 1 for owners in covered.values()), covered
assert "@GC.1" in profile
assert "data/_market/<provider>/" in profile
assert "scripts/market_prices.py" in profile

for connector_id in ("cme-gold-inventory-deliveries", "wgc-official-gold-reserves"):
    manifest = manifests[connector_id]
    assert manifest.get("manual") is True, connector_id
    assert manifest["acquisition"] == "manual", connector_id
    assert manifest.get("manual_ingest", {}).get("file_arg") == "--from-file", connector_id
    assert manifest["source_type"] == "external_other" and manifest["tier"] == 9, connector_id
    assert manifest["authority_class"] == "other", connector_id
    assert "context-only" in manifest["license"], connector_id

lbma_manifest, lbma_text = load_connector("lbma-gold-vault-clearing")
assert lbma_manifest["output_schema"].get("benchmark_price_included") is False
assert "benchmark prices" in lbma_manifest["license"].casefold()
assert "lbma-gold-price" not in lbma_text and "gold-prices" not in lbma_text

bls_manifest = manifests["bls-cpi-gold"]
assert bls_manifest["dataset_id"] == "bls.cuur0000sa0"
assert bls_manifest["minimum_history"] == {"observations": 120, "path": "observations"}
assert bls_manifest["credential_env"] == [] and bls_manifest["host_allowlist"] == ["api.bls.gov"]

shared_usd = manifests["federal-reserve-broad-usd"]
assert shared_usd["series_id"] == "macro.broad-usd-index"
assert set(shared_usd["subjects"]) == {"GOLD", "CRUDE-OIL"}

print("PASS: Gold profile semantic coverage, lawful route reuse and WILTW runtime exclusion")
