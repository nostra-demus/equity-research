#!/usr/bin/env python3
"""Fail-closed tests for typed profile coverage and point-in-time selection."""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import tempfile
from pathlib import Path

from commodity_profile_coverage import _quality_error, compile_coverage, profile_family, resolve_profile_series, structured_profile


ROWS = [
    ("automatic-need", "gold.automatic", "commodity-price-curve", "daily", "official source"),
    ("manual-need", "gold.manual", "commodity-demand-inventory", "monthly", "manual source"),
    ("shared-need", "gold.shared", "commodity-cross-asset-regime", "two days", "lawful shared feed"),
    ("price-need", "gold.price", "commodity-price-curve", "current quote", "pulse quote"),
    ("basis-need", "gold.basis", "commodity-price-curve", "current basis", "deterministic derivation"),
    ("missing-route", "gold.missing", "commodity-cross-asset-regime", "weekly", "lawful connector"),
]

assert _quality_error(
    {"points": {"unexpected": "mapping"}}, "2026-08-10",
    {"min_span_days": 1, "date_field": "date"},
    dt.datetime(2026, 8, 11, tzinfo=dt.timezone.utc),
) == "history spans fewer than 1 required days"


def markdown() -> str:
    body = "\n".join(f"| `{need}` | `{series}` | {owner} | {req} | {policy} |" for need, series, owner, req, policy in ROWS)
    return f"""# Profiles

## GOLD

**Required semantic series (profile-owned):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
{body}

**Availability is evidence.**
"""


def requirement(row, quality, resolver):
    need, series, owner, req, policy = row
    return {
        "need": need, "series": series, "owner": owner, "requirement": req,
        "policy": policy, "quality": quality, "resolver": resolver,
    }


def main() -> int:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        profile = root / "profiles.md"
        profile.write_text(markdown(), encoding="utf-8")
        structured_root = root / "structured"
        structured_root.mkdir()
        requirements = [
            requirement(ROWS[0], {"path": "observations", "min_observations": 1, "max_staleness_days": 5}, {"kind": "connector"}),
            requirement(ROWS[1], {"max_staleness_days": 50}, {"kind": "connector"}),
            requirement(ROWS[2], {"min_observations": 2, "min_span_days": 1, "date_field": "date", "max_staleness_days": 5}, {"kind": "shared_market", "symbol": "TEST", "instrument_kind": "benchmark", "price_basis": "split_adjusted"}),
            requirement(ROWS[3], {"max_staleness_days": 2}, {"kind": "pulse_quote", "swarm": "commodity", "symbol": "@GC.1", "source": "cnbc"}),
            requirement(ROWS[4], {"max_staleness_days": 2}, {"kind": "derived", "operation": "left_minus_right_pct_of_right", "left": {"series": "gold.price", "path": "value"}, "right": {"series": "gold.automatic", "path": "nearby_settlement"}}),
            requirement(ROWS[5], {"max_staleness_days": 10}, {"kind": "connector"}),
        ]
        (structured_root / "GOLD.json").write_text(json.dumps({
            "schema_version": 1, "commodity": "GOLD", "family": "precious-metals", "requirements": requirements,
        }), encoding="utf-8")
        assert len(structured_profile("GOLD", profile_path=profile, structured_root=structured_root)) == 6
        assert profile_family("GOLD", structured_root=structured_root) == "precious-metals"
        wrong_identity = json.loads((structured_root / "GOLD.json").read_text(encoding="utf-8"))
        wrong_identity["commodity"] = "OIL"
        (structured_root / "GOLD.json").write_text(json.dumps(wrong_identity), encoding="utf-8")
        try:
            profile_family("GOLD", structured_root=structured_root)
            raise AssertionError("family lookup accepted a different commodity identity")
        except ValueError as error:
            assert "identity" in str(error)
        (structured_root / "GOLD.json").write_text(json.dumps({
            "schema_version": 1, "commodity": "GOLD", "family": "precious-metals", "requirements": requirements,
        }), encoding="utf-8")

        manifests = [
            {
                "id": "automatic", "dataset_id": "official.auto", "series_id": "gold.automatic",
                "subjects": ["GOLD"], "satisfies": ["automatic-need"], "acquisition": "official_api",
                "provider": "Official provider",
            },
            {
                "id": "manual", "dataset_id": "manual.capture", "series_id": "gold.manual",
                "subjects": ["GOLD"], "satisfies": ["manual-need"], "acquisition": "manual",
                "manual": True, "provider": "User capture",
            },
        ]
        calls = []

        def reader(data_root, series_id, subject, cutoff, **_kwargs):
            calls.append((series_id, subject, cutoff))
            return {
                "usable": True, "health": "current", "vintage_id": "sha256:" + "a" * 64,
                "selected_provider": "Official provider",
                "payload": {"observations": [{"date": "2026-08-10"}], "nearby_settlement": 102.0},
                "vintage": {
                    "as_of": "2026-08-10", "acquisition": "official_api", "tier": 5,
                    "dataset_id": "official.auto", "connector_id": "automatic", "provider": "Official provider",
                    "retrieved_at": "2026-08-10T20:00:00Z",
                },
            }

        market_root = root / "market"
        provider = market_root / "TestProvider"
        provider.mkdir(parents=True)
        csv_path = provider / "rows.csv"
        csv_path.write_text("date,symbol,close\n2026-08-08,TEST,10\n2026-08-10,TEST,11\n", encoding="utf-8")
        metadata_path = provider / "_symbols.json"
        metadata_path.write_text(json.dumps({
            "TEST": {"kind": "benchmark", "exchange": "TEST", "currency": "USD", "price_basis": "split_adjusted"},
        }), encoding="utf-8")
        (provider / "rows.csv.source.json").write_text(json.dumps({
            "provider": "TestProvider", "source_type": "official_data", "tier": 5,
            "received": "2026-08-10T20:00:00Z", "content_sha256": hashlib.sha256(csv_path.read_bytes()).hexdigest(),
            "licensing": {"access": "public", "use": "allowed", "redistribution": "allowed", "terms_url": "https://example.test/terms"},
        }), encoding="utf-8")
        metadata_sidecar_path = provider / "_symbols.json.source.json"
        metadata_sidecar = {
            "provider": "TestProvider", "source_type": "official_data", "tier": 5,
            "received": "2026-08-10T20:00:00Z",
            "content_sha256": hashlib.sha256(metadata_path.read_bytes()).hexdigest(),
            "licensing": {"access": "public", "use": "allowed", "redistribution": "allowed", "terms_url": "https://example.test/terms"},
        }
        metadata_sidecar_path.write_text(json.dumps(metadata_sidecar), encoding="utf-8")

        state_root = root / "state"
        state_root.mkdir()
        (state_root / "commodity-pulse.json").write_text(json.dumps({
            "commodity": {
                "priceAt": 1786392000000,
                "prices": {"GOLD": {"symbol": "@GC.1", "last": 100.0, "unit": "USD/oz", "as_of": "2026-08-10T20:00:00Z", "source": "cnbc"}},
            },
        }), encoding="utf-8")

        artifact = compile_coverage(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        statuses = {row["need_id"]: row["status"] for row in artifact["rows"]}
        assert statuses == {
            "automatic-need": "usable", "manual-need": "manual", "shared-need": "usable",
            "price-need": "usable", "basis-need": "usable", "missing-route": "unavailable",
        }, statuses
        assert artifact["rows"][4]["vintage_id"].startswith("sha256:")
        assert calls and all(call == ("gold.automatic", "GOLD", "2026-08-11T00:00:00Z") for call in calls)
        assert artifact["complete"] is False
        assert artifact["unresolved_need_ids"] == ["manual-need", "missing-route"]

        malformed_result = compile_coverage(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root,
            reader=lambda *_args, **_kwargs: ["malformed"], manifests=manifests,
        )
        assert malformed_result["rows"][0]["status"] == "suspect"

        resolved = resolve_profile_series(
            "gold.shared", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert resolved and resolved["usable"] is True and resolved["vintage"]["acquisition"] == "file_drop"

        original_metadata = metadata_path.read_bytes()
        metadata_path.write_text(json.dumps({
            "TEST": {"kind": "benchmark", "exchange": "CHANGED", "currency": "USD", "price_basis": "split_adjusted"},
        }), encoding="utf-8")
        rewritten_metadata = resolve_profile_series(
            "gold.shared", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert rewritten_metadata and rewritten_metadata["usable"] is False and rewritten_metadata["status"] == "suspect"
        metadata_path.write_bytes(original_metadata)

        metadata_sidecar["received"] = "2026-08-12T00:00:00Z"
        metadata_sidecar_path.write_text(json.dumps(metadata_sidecar), encoding="utf-8")
        late_metadata = resolve_profile_series(
            "gold.shared", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert late_metadata and late_metadata["usable"] is False and late_metadata["status"] == "suspect"
        metadata_sidecar["received"] = "2026-08-10T20:00:00Z"
        metadata_sidecar_path.write_text(json.dumps(metadata_sidecar), encoding="utf-8")

        sidecar_path = provider / "rows.csv.source.json"
        sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
        sidecar["received"] = "2026-08-12T00:00:00Z"
        sidecar_path.write_text(json.dumps(sidecar), encoding="utf-8")
        late = resolve_profile_series(
            "gold.shared", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert late and late["usable"] is False and late["status"] == "suspect"

        (state_root / "commodity-pulse.json").write_text(json.dumps({
            "commodity": {"priceAt": 1786392000000, "prices": {"GOLD": "malformed"}},
        }), encoding="utf-8")
        malformed_pulse = resolve_profile_series(
            "gold.price", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert malformed_pulse and malformed_pulse["usable"] is False and malformed_pulse["status"] == "suspect"

        duplicate = manifests + [{**manifests[0], "id": "automatic-two", "dataset_id": "other.auto"}]
        ambiguous = compile_coverage(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=duplicate,
        )
        assert ambiguous["rows"][0]["status"] == "suspect"

        baseline = json.loads((structured_root / "GOLD.json").read_text(encoding="utf-8"))
        broken = copy.deepcopy(baseline)
        broken["requirements"][0]["policy"] = "silently weakened"
        (structured_root / "GOLD.json").write_text(json.dumps(broken), encoding="utf-8")
        try:
            structured_profile("GOLD", profile_path=profile, structured_root=structured_root)
            raise AssertionError("markdown/structured policy mismatch must fail")
        except ValueError as error:
            assert "mirror" in str(error), f"Expected profile-mirror error, got: {error}"
        typo = copy.deepcopy(baseline)
        typo["requirements"][0]["quality"]["max_staleness_day"] = typo["requirements"][0]["quality"].pop("max_staleness_days")
        (structured_root / "GOLD.json").write_text(json.dumps(typo), encoding="utf-8")
        try:
            structured_profile("GOLD", profile_path=profile, structured_root=structured_root)
            raise AssertionError("a misspelled quality control must fail")
        except ValueError as error:
            assert "quality controls" in str(error), f"Expected quality-control error, got: {error}"
        typo = copy.deepcopy(baseline)
        shared = typo["requirements"][2]["resolver"]
        shared["instrument_knd"] = shared.pop("instrument_kind")
        (structured_root / "GOLD.json").write_text(json.dumps(typo), encoding="utf-8")
        try:
            structured_profile("GOLD", profile_path=profile, structured_root=structured_root)
            raise AssertionError("a misspelled resolver control must fail")
        except ValueError as error:
            assert "resolver shape" in str(error), f"Expected resolver-shape error, got: {error}"
    print("PASS: commodity profile coverage has typed, point-in-time, provenance-bound resolvers")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
