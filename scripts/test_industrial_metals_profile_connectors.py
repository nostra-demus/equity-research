#!/usr/bin/env python3
"""Industrial-metals family profiles, connectors and abstention contract."""
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
from commodity_profile_coverage import (  # noqa: E402
    compile_coverage,
    profile_family,
    resolve_profile_series,
    structured_profile,
)
from connector_contract import load_valid_manifests, validate_manifest  # noqa: E402

PROFILE_PATH = os.path.join(REPO, "frameworks", "commodity", "COMMODITY_PROFILES.md")
CONNECTOR_ROOT = os.path.join(REPO, ".claude", "connectors")
CONNECTORS = {
    "COPPER": {
        "cftc-cot-copper": "copper-managed-money-positioning",
        "federal-reserve-broad-usd": "macro-broad-usd-index",
        "fred-us-10y-real-yield": "macro-us-10y-real-yield",
    },
    "ALUMINIUM": {
        "lme-cotr-aluminium": "aluminium-lme-investment-fund-positioning",
        "iai-primary-aluminium-production": "aluminium-primary-production",
        "federal-reserve-broad-usd": "macro-broad-usd-index",
        "fred-us-10y-real-yield": "macro-us-10y-real-yield",
    },
}
FORBIDDEN = ("wiltw", "what i learned this week", "gold nostra report", "/downloads/")


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
    defects = validate_manifest(connector_id, root, manifest)
    assert not defects, f"{connector_id}: {defects}"
    assert commodity in manifest["subjects"]
    assert need in manifest["satisfies"]
    combined = (manifest_text + "\n" + fetch_text).casefold()
    for forbidden in FORBIDDEN:
        assert forbidden not in combined, f"{connector_id}: forbidden runtime identity {forbidden!r}"
    return manifest


all_manifests: dict[str, dict] = {}
for commodity, connector_needs in CONNECTORS.items():
    profile = section(commodity)
    rows = re.findall(r"\| `([a-z0-9._-]+)` \| `([a-z0-9._-]+)` \| ([a-z0-9._-]+) \|", profile)
    requirements = structured_profile(commodity)
    assert rows and [row["need"] for row in requirements] == [row[0] for row in rows]
    assert len(rows) == len({row[0] for row in rows})
    assert profile_family(commodity) == "industrial-metals"
    assert "Family-specific physical-market rules" in profile
    assert "Declaring these rows does not make them usable" in profile
    for need, _series, owner in rows:
        matches = glob.glob(os.path.join(
            REPO, ".claude", "agents", "commodity", "*", f"[0-9][0-9]_{owner}.md",
        ))
        assert len(matches) == 1, f"{need}: causal owner {owner!r} must resolve exactly once"
    connector_rows = {row["need"] for row in requirements if row["resolver"]["kind"] == "connector"}
    assert set(connector_needs.values()) < connector_rows, f"{commodity}: physical gaps must remain explicit"
    for connector_id, need in connector_needs.items():
        manifest = connector(connector_id, commodity, need)
        all_manifests[connector_id] = manifest
        expected_series = next(row["series"] for row in requirements if row["need"] == need)
        assert manifest["series_id"] == expected_series

copper = structured_profile("COPPER")
aluminium = structured_profile("ALUMINIUM")
assert next(row for row in copper if row["need"] == "copper-current-price")["resolver"]["symbol"] == "@HG.1"
assert next(row for row in copper if row["need"] == "copper-comex-price-history")["resolver"]["price_basis"] == "continuous_back_adjusted"
assert next(row for row in aluminium if row["need"] == "aluminium-current-price")["resolver"]["symbol"] == "@ALI.1"
assert "stale/dead contracts are unavailable" in next(
    row for row in aluminium if row["need"] == "aluminium-current-price"
)["policy"]
assert next(row for row in aluminium if row["need"] == "aluminium-copper-price-history")["resolver"]["symbol"] == "@HG.1"
assert next(row for row in aluminium if row["need"] == "aluminium-producer-equity-history")["resolver"]["symbol"] == "AA"
for requirements in (copper, aluminium):
    assert next(row for row in requirements if row["need"] == "macro-global-activity-demand-proxy")["owner"] == "commodity-macro-drivers"
    assert next(row for row in requirements if row["need"] == "macro-us-10y-real-yield")["owner"] == "commodity-macro-drivers"
    china = next(row for row in requirements if row["need"] == "macro-china-industrial-activity")
    assert china["series"] == "macro.china-industrial-activity"
    assert china["policy"] == (
        "primary official industrial production, fixed-asset investment and property completions; "
        "licensed PMI stays contextual"
    )

assert next(row for row in copper if row["need"] == "copper-concentrate-tcrc")["owner"] == "commodity-supply"
assert next(row for row in copper if row["need"] == "copper-mine-prepolicy-supply")["owner"] == "commodity-supply"
assert next(row for row in copper if row["need"] == "copper-supply-restrictions-routing")["owner"] == "commodity-supply-security"
assert next(row for row in aluminium if row["need"] == "aluminium-prepolicy-supply")["owner"] == "commodity-supply"
assert next(row for row in aluminium if row["need"] == "aluminium-supply-restrictions-routing")["owner"] == "commodity-supply-security"
assert any(row["need"] == "copper-inventory-accessibility-opacity" for row in copper)
assert any(row["need"] == "aluminium-inventory-accessibility-opacity" for row in aluminium)

shared = all_manifests["federal-reserve-broad-usd"]
assert shared["series_id"] == "macro.broad-usd-index"
assert set(shared["subjects"]) == {
    "ALUMINIUM", "COCOA", "COFFEE", "COPPER", "CORN", "COTTON", "CRUDE-OIL",
    "GOLD", "SOYBEANS", "SUGAR", "WHEAT",
}
cftc = all_manifests["cftc-cot-copper"]
assert cftc["dataset_id"] == "cftc.disaggregated-cot-futures-only"
fetch_text = open(os.path.join(CONNECTOR_ROOT, "cftc-cot-copper", "fetch.py"), encoding="utf-8").read()
assert "from cftc_disaggregated_cot import" in fetch_text
assert 'contract="COPPER- #1"' in fetch_text and 'contract_code="085692"' in fetch_text
real_yield = all_manifests["fred-us-10y-real-yield"]
assert real_yield["series_id"] == "macro.us-10y-real-yield"
assert set(real_yield["subjects"]) == {"ALUMINIUM", "COPPER"}

lme_quality = next(row for row in aluminium if row["need"] == "aluminium-lme-investment-fund-positioning")["quality"]
assert lme_quality["min_observations"] == 150 and lme_quality["min_span_days"] == 1000
iai_quality = next(row for row in aluminium if row["need"] == "aluminium-primary-production")["quality"]
assert iai_quality["min_observations"] == 36
lme_manifest = all_manifests["lme-cotr-aluminium"]
iai_manifest = all_manifests["iai-primary-aluminium-production"]
assert {"lme-cotr-fund-positioning", "lme-cotr", "investment-fund-positioning"} <= set(lme_manifest["satisfies"])
assert "iai-primary-production" in iai_manifest["satisfies"]
assert lme_manifest["manual"] is True and lme_manifest["minimum_history"]["observations"] < lme_quality["min_observations"]
assert iai_manifest["manual"] is True and iai_manifest["minimum_history"]["observations"] < iai_quality["min_observations"]
news_manifest = json.load(open(
    os.path.join(CONNECTOR_ROOT, "yunnan-curtailment-news", "connector.json"), encoding="utf-8",
))
assert "aluminium-china-capacity-power" not in news_manifest["satisfies"], (
    "a news-aggregator scan cannot close the primary China capacity/power requirement"
)

discovered, skipped = load_valid_manifests(CONNECTOR_ROOT)
discovered_ids = {manifest["id"] for manifest in discovered}
assert set(all_manifests) <= discovered_ids, {
    "missing": sorted(set(all_manifests) - discovered_ids), "skipped": skipped,
}

for series_id in ("aluminium.investment-fund-positioning", "aluminium.primary-production"):
    contextual = resolve_profile_series(
        series_id, "ALUMINIUM", "2026-08-10T12:00:00Z",
        manifests=discovered, reader=lambda *_args, **_kwargs: None,
    )
    assert contextual and contextual["usable"] is False and contextual["status"] == "manual"
    assert contextual["reason"] == "no sealed manual vintage was knowable at decision time"

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

print("PASS: industrial-metals profiles, lawful connector reuse, physical rules and abstention")
