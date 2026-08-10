#!/usr/bin/env python3
"""Energy-family profile, connector and zero-touch golden contract."""
from __future__ import annotations

import glob
import json
import os
import re
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
from commodity_decision_archive import decision_id_for  # noqa: E402
from commodity_profile_coverage import (  # noqa: E402
    compile_coverage, profile_family, resolve_profile_series, structured_profile,
)
from connector_contract import connector_https_url_host, load_valid_manifests, validate_manifest  # noqa: E402
import connector_fetch_support  # noqa: E402

PROFILE_PATH = os.path.join(REPO, "frameworks", "commodity", "COMMODITY_PROFILES.md")
CONNECTOR_ROOT = os.path.join(REPO, ".claude", "connectors")
CONNECTORS = {
    "CRUDE-OIL": {
        "cftc-cot-crude-oil": "crude-oil-managed-money-positioning",
        "eia-crude-oil-inventory": "crude-oil-us-inventory-buffer",
        "federal-reserve-broad-usd": "macro-broad-usd-index",
    },
    "NATURAL-GAS": {
        "cftc-cot-natural-gas": "natural-gas-managed-money-positioning",
        "eia-natural-gas-storage": "natural-gas-lower48-storage",
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
    assert manifest["satisfies"] == [need]
    combined = (manifest_text + "\n" + fetch_text).casefold()
    for forbidden in FORBIDDEN:
        assert forbidden not in combined, f"{connector_id}: forbidden runtime identity {forbidden!r}"
    return manifest


all_manifests: dict[str, dict] = {}
for commodity, connector_needs in CONNECTORS.items():
    profile = section(commodity)
    rows = re.findall(
        r"\| `([a-z0-9._-]+)` \| `([a-z0-9._-]+)` \| ([a-z0-9._-]+) \|",
        profile,
    )
    assert rows and len(rows) == len({row[0] for row in rows}), commodity
    requirements = structured_profile(commodity)
    assert [row["need"] for row in requirements] == [row[0] for row in rows]
    assert profile_family(commodity) == "energy"
    assert "Family-specific physical-market rules" in profile
    assert "Declaring these rows does not make them usable" in profile
    for need, _series, owner in rows:
        matches = glob.glob(os.path.join(
            REPO, ".claude", "agents", "commodity", "*", f"[0-9][0-9]_{owner}.md",
        ))
        assert len(matches) == 1, f"{need}: causal owner {owner!r} must resolve exactly once"

    connector_rows = {row["need"] for row in requirements if row["resolver"]["kind"] == "connector"}
    implemented = set(connector_needs.values())
    assert implemented < connector_rows, f"{commodity}: missing physical inputs must remain explicit"
    for connector_id, need in connector_needs.items():
        manifest = connector(connector_id, commodity, need)
        all_manifests[connector_id] = manifest
        assert manifest["series_id"] == next(row["series"] for row in requirements if row["need"] == need)
    assert not any(
        set(manifest["satisfies"]) & {row["need"] for row in requirements if row["resolver"]["kind"] in {"pulse_quote", "shared_market", "derived"}}
        for manifest in all_manifests.values()
    ), "shared quotes/history and deterministic derivations must not be cloned by connectors"

crude = structured_profile("CRUDE-OIL")
gas = structured_profile("NATURAL-GAS")
assert next(row for row in crude if row["need"] == "crude-oil-current-price")["resolver"]["symbol"] == "@CL.1"
assert next(row for row in crude if row["need"] == "crude-oil-wti-price-history")["resolver"]["price_basis"] == "continuous_back_adjusted"
assert next(row for row in gas if row["need"] == "natural-gas-current-price")["resolver"]["symbol"] == "@NG.1"
assert next(row for row in gas if row["need"] == "natural-gas-market-price-history")["resolver"]["price_basis"] == "continuous_back_adjusted"
shared_usd = next(row for row in crude if row["need"] == "macro-broad-usd-index")
assert shared_usd["series"] == "macro.broad-usd-index" and shared_usd["owner"] == "commodity-macro-drivers"
assert next(row for row in crude if row["need"] == "macro-global-activity-demand-proxy")["owner"] == "commodity-macro-drivers"
demand_bridge = next(row for row in crude if row["need"] == "crude-oil-demand-stock-change")
supply_bridge = next(row for row in crude if row["need"] == "crude-oil-accessible-supply")
assert demand_bridge["owner"] == "commodity-demand-inventory"
assert supply_bridge["owner"] == "commodity-supply-security"
assert "supply" not in demand_bridge["requirement"].casefold()
assert "do not duplicate supply-security production evidence" in demand_bridge["policy"]

assert all_manifests["cftc-cot-crude-oil"]["dataset_id"] == "cftc.disaggregated-cot-futures-only"
assert all_manifests["cftc-cot-natural-gas"]["dataset_id"] == "cftc.disaggregated-cot-futures-only"
for connector_id in ("eia-crude-oil-inventory", "eia-natural-gas-storage"):
    manifest = all_manifests[connector_id]
    assert manifest["acquisition"] == "free_key_api"
    assert manifest["host_allowlist"] == ["api.eia.gov"]
    assert len(manifest["credential_env"]) == 1
assert len({name for manifest in all_manifests.values() for name in manifest["credential_env"]}) == 2
for connector_id in ("cftc-cot-gold", "cftc-cot-crude-oil", "cftc-cot-natural-gas"):
    fetch_text = open(os.path.join(CONNECTOR_ROOT, connector_id, "fetch.py"), encoding="utf-8").read()
    assert "from cftc_disaggregated_cot import" in fetch_text
    assert "m_money_positions_long_all" not in fetch_text and "prod_merc_positions_long" not in fetch_text
publisher_paths = json.load(open(
    os.path.join(REPO, "frameworks", "connector-publisher-files.json"), encoding="utf-8",
))["paths"]
assert "scripts/cftc_disaggregated_cot.py" in publisher_paths
for connector_id in ("federal-reserve-broad-usd",):
    fetch_text = open(os.path.join(CONNECTOR_ROOT, connector_id, "fetch.py"), encoding="utf-8").read()
    assert "from fred_broad_usd import" in fetch_text and "csv.DictReader" not in fetch_text
assert "scripts/fred_broad_usd.py" in publisher_paths
retired_fred = os.path.join(CONNECTOR_ROOT, "federal-reserve-broad-usd-gold")
assert not os.path.exists(retired_fred), "retired connector directories must leave production discovery entirely"
assert os.path.isfile(os.path.join(CONNECTOR_ROOT, "federal-reserve-broad-usd", "MIGRATION.md"))
discovered, skipped = load_valid_manifests(CONNECTOR_ROOT)
discovered_ids = {manifest["id"] for manifest in discovered}
assert set(all_manifests) <= discovered_ids, {
    "missing": sorted(set(all_manifests) - discovered_ids), "skipped": skipped,
}

secret_url = "https://api.eia.gov/v2/seriesid/example?length=3&api_key=secret"
try:
    connector_https_url_host(secret_url, ["api.eia.gov"])
except ValueError:
    pass
else:
    raise AssertionError("credential query must be rejected by default")
assert connector_https_url_host(
    secret_url, ["api.eia.gov"], credential_query_keys=frozenset({"api_key"}),
) == "api.eia.gov"


class _FakeResponse:
    status = 200

    def __init__(self, body: bytes):
        self.body = body
        self.headers = {"Content-Length": str(len(body))}
        self.offset = 0

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, size: int) -> bytes:
        chunk = self.body[self.offset:self.offset + size]
        self.offset += len(chunk)
        return chunk


captured: dict[str, object] = {}
original_open = connector_fetch_support.open_allowed_https
def _fake_open(request, hosts, *, timeout, credential_query_keys):
    captured.update({
        "url": request.full_url, "hosts": hosts, "timeout": timeout,
        "credential_query_keys": credential_query_keys,
    })
    return _FakeResponse(b"{}")
connector_fetch_support.open_allowed_https = _fake_open
try:
    body = connector_fetch_support.fetch_bytes_with_query_credential(
        "https://api.eia.gov/v2/seriesid/example?length=3",
        {"id": "fixture", "provider": "EIA", "host_allowlist": ["api.eia.gov"]},
        query_key="api_key", credential="sensitive fixture value", max_bytes=20,
    )
finally:
    connector_fetch_support.open_allowed_https = original_open
assert body == b"{}"
assert captured["credential_query_keys"] == frozenset({"api_key"})
assert "api_key=sensitive+fixture+value" in str(captured["url"])
assert "api_key" not in "https://api.eia.gov/v2/seriesid/example?length=3"

decision_id = decision_id_for({"commodity": "CRUDE-OIL", "decision_date": "2026-08-10"})
assert re.fullmatch(r"CMD-CRUDE-OIL-2026-08-10-[a-f0-9]{12}", decision_id)
canonical_id_rule = r"^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$"
for command in ("pre-mortem.md", "review.md"):
    command_text = open(os.path.join(REPO, ".claude", "commands", "commodity", command), encoding="utf-8").read()
    assert canonical_id_rule in command_text and "^[A-Z0-9_]+$" not in command_text

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

short_start = date(2025, 11, 22)
short_storage = [
    {"date": (short_start + timedelta(days=index)).isoformat(), "working_gas_bcf": 2000 + index}
    for index in range(262)
]
def _short_history_reader(*_args, **_kwargs):
    return {
        "usable": True, "health": "current",
        "payload": {"observations": short_storage},
        "vintage": {
            "series_id": "natural-gas.lower48-storage", "as_of": short_storage[-1]["date"],
            "dataset_id": "fixture", "connector_id": "eia-natural-gas-storage",
            "provider": "EIA", "acquisition": "free_key_api", "tier": 5,
            "retrieved_at": short_storage[-1]["date"] + "T12:00:00Z",
        },
    }
short_result = resolve_profile_series(
    "natural-gas.lower48-storage", "NATURAL-GAS", short_storage[-1]["date"] + "T23:00:00Z",
    manifests=discovered, reader=_short_history_reader,
)
assert short_result["usable"] is False and "spans fewer than 1825" in short_result["reason"]

print("PASS: energy profiles, lawful connectors, explicit gaps and zero-touch family rollout")
