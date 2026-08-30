#!/usr/bin/env python3
"""Fail-closed tests for typed profile coverage and point-in-time selection."""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import tempfile
from pathlib import Path

from canonical_json import canonical_json_bytes
from commodity_profile_coverage import (
    _quality_error, compile_coverage, compile_coverage_bundle, coverage_status_counts, frozen_source_resolver,
    profile_family, profile_snapshot_sha256, resolve_profile_series,
    source_snapshot_sha256, structured_profile,
)


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

SEASONAL_RELEASE = {
    "cadence": "weekly", "timezone": "America/New_York", "expected_lag_days": 1,
    "grace_days": 6, "active_months": [4, 5, 6, 7, 8, 9, 10, 11],
}
assert _quality_error(
    {}, "2026-11-30", {"max_staleness_days": 14},
    dt.datetime(2027, 2, 1, tzinfo=dt.timezone.utc),
    release=SEASONAL_RELEASE, retrieved_at="2026-12-01T15:00:00Z",
) is None
assert _quality_error(
    {}, "2026-11-30", {"max_staleness_days": 14},
    dt.datetime(2027, 4, 13, tzinfo=dt.timezone.utc),
    release=SEASONAL_RELEASE, retrieved_at="2026-12-01T15:00:00Z",
) == "as-of is more than 14 days stale"


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
                "manual": True, "provider": "Licensed provider", "source_type": "vendor_export",
            },
        ]
        calls = []

        def reader(data_root, series_id, subject, cutoff, **_kwargs):
            calls.append((series_id, subject, cutoff))
            if series_id == "gold.manual":
                return {
                    "usable": True, "health": "current", "vintage_id": "sha256:" + "b" * 64,
                    "selected_provider": "Licensed provider", "payload": {"value": 7.0},
                    "vintage": {
                        "as_of": "2026-08-10", "acquisition": "manual", "tier": 5,
                        "source_type": "vendor_export",
                        "licensing": {"access": "licensed", "use": "entitlement_required"},
                        "manual_input": {
                            "sha256": "c" * 64, "size_bytes": 123, "filename": "export.csv",
                            "detected_format": "csv",
                        },
                        "dataset_id": "manual.capture", "connector_id": "manual",
                        "provider": "Licensed provider", "retrieved_at": "2026-08-10T20:00:00Z",
                    },
                }
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
        pulse_prices = {
            "GOLD": {
                "symbol": "@GC.1", "last": 100.0, "unit": "USD/oz",
                "as_of": "2026-08-10T20:00:00Z", "source": "cnbc",
            },
        }
        (state_root / "commodity-pulse.json").write_text(json.dumps({
            "commodity": {
                "priceAt": 1786392000000,
                "prices": pulse_prices,
            },
        }), encoding="utf-8")
        pulse_material = {"swarm": "commodity", "priceAt": 1786392000000, "prices": pulse_prices}
        pulse_digest = hashlib.sha256(canonical_json_bytes(pulse_material)).hexdigest()
        pulse_history_root = state_root / "commodity-pulse-history" / hashlib.sha256(b"commodity").hexdigest()
        pulse_history_root.mkdir(parents=True)
        pulse_history_file = pulse_history_root / f"1786392000000-{pulse_digest}.json"
        pulse_history_file.write_text(json.dumps({
            "schema_version": 1, **pulse_material, "snapshot_sha256": "sha256:" + pulse_digest,
        }), encoding="utf-8")

        artifact, source_snapshot = compile_coverage_bundle(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert artifact["schema_version"] == 3
        assert artifact["profile_snapshot_sha256"] == profile_snapshot_sha256(
            "GOLD", profile_path=profile, structured_root=structured_root,
        )
        assert artifact["source_snapshot_sha256"] == source_snapshot_sha256(source_snapshot)
        frozen_root = root / "frozen-profile"
        frozen_root.mkdir()
        frozen_markdown = frozen_root / "COMMODITY_PROFILES.md"
        frozen_markdown.write_bytes(profile.read_bytes())
        (frozen_root / "GOLD.json").write_bytes((structured_root / "GOLD.json").read_bytes())
        statuses = {row["need_id"]: row["status"] for row in artifact["rows"]}
        assert statuses == {
            "automatic-need": "usable", "manual-need": "usable", "shared-need": "usable",
            "price-need": "usable", "basis-need": "usable", "missing-route": "unavailable",
        }, statuses
        assert artifact["rows"][4]["vintage_id"].startswith("sha256:")
        assert calls and set(calls) == {
            ("gold.automatic", "GOLD", "2026-08-11T00:00:00Z"),
            ("gold.manual", "GOLD", "2026-08-11T00:00:00Z"),
        }
        assert artifact["complete"] is False
        assert artifact["unresolved_need_ids"] == ["missing-route"]
        assert coverage_status_counts(artifact) == {
            "manual": 0, "missing": 0, "suspect": 0, "unavailable": 1, "usable": 5,
        }

        # Replay non-connector vintages from the frozen bundle. Later pulse or shared-market mutations
        # must not change the decision-time value selected by the coverage compiler.
        replay = frozen_source_resolver(source_snapshot, artifact, data_root=root)
        frozen_pulse = replay("gold.price", "GOLD", "2026-08-11T00:00:00Z")
        frozen_shared = replay("gold.shared", "GOLD", "2026-08-11T00:00:00Z")
        assert frozen_pulse and frozen_pulse["payload"]["value"] == 100.0
        assert frozen_shared and frozen_shared["payload"]["points"][-1]["close"] == 11.0
        (state_root / "commodity-pulse.json").write_text(json.dumps({
            "commodity": {
                "priceAt": 1786395600000,
                "prices": {"GOLD": {"symbol": "@GC.1", "last": 999.0, "unit": "USD/oz", "as_of": "2026-08-10T21:00:00Z", "source": "cnbc"}},
            },
        }), encoding="utf-8")
        csv_path.write_text(csv_path.read_text(encoding="utf-8") + "2026-08-11,TEST,999\n", encoding="utf-8")
        assert replay("gold.price", "GOLD", "2026-08-11T00:00:00Z")["payload"]["value"] == 100.0
        assert replay("gold.shared", "GOLD", "2026-08-11T00:00:00Z")["payload"]["points"][-1]["close"] == 11.0
        # Cockpit polling after the frozen cutoff may replace the mutable warm-start snapshot. The live
        # resolver must still select the newest content-addressed price snapshot knowable at the cutoff.
        (state_root / "commodity-pulse.json").write_text(json.dumps({
            "commodity": {
                "priceAt": 1786410000000,
                "prices": {"GOLD": {"symbol": "@GC.1", "last": 1234.0, "unit": "USD/oz", "as_of": "2026-08-11T01:00:00Z", "source": "cnbc"}},
            },
        }), encoding="utf-8")
        historical_live = resolve_profile_series(
            "gold.price", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert historical_live and historical_live["usable"] is True
        assert historical_live["payload"]["value"] == 100.0
        original_history = pulse_history_file.read_bytes()
        tampered_history = json.loads(original_history)
        tampered_history["prices"]["GOLD"]["last"] = 101.0
        pulse_history_file.write_text(json.dumps(tampered_history), encoding="utf-8")
        rejected_history = resolve_profile_series(
            "gold.price", "GOLD", "2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        assert rejected_history and rejected_history["usable"] is False
        assert rejected_history["status"] == "suspect", "a rewritten history snapshot passed its content hash"
        pulse_history_file.write_bytes(original_history)
        orphaned = copy.deepcopy(source_snapshot)
        orphaned["rows"].append({
            "series_id": "gold.orphan", "vintage_id": "sha256:" + "f" * 64,
            "result": {},
        })
        orphaned_artifact = {**artifact, "source_snapshot_sha256": source_snapshot_sha256(orphaned)}
        try:
            frozen_source_resolver(orphaned, orphaned_artifact, data_root=root)
            raise AssertionError("an orphan frozen source row was accepted")
        except ValueError as error:
            assert "exactly cover" in str(error)
        # Restore the live fixtures used by the remaining fail-closed resolver cases.
        (state_root / "commodity-pulse.json").write_text(json.dumps({
            "commodity": {
                "priceAt": 1786392000000,
                "prices": {"GOLD": {"symbol": "@GC.1", "last": 100.0, "unit": "USD/oz", "as_of": "2026-08-10T20:00:00Z", "source": "cnbc"}},
            },
        }), encoding="utf-8")
        csv_path.write_text("date,symbol,close\n2026-08-08,TEST,10\n2026-08-10,TEST,11\n", encoding="utf-8")

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
        assert malformed_pulse and malformed_pulse["usable"] is True
        assert malformed_pulse["payload"]["value"] == 100.0, "the immutable snapshot outranks mutated warm-start state"

        duplicate = manifests + [{**manifests[0], "id": "automatic-two", "dataset_id": "other.auto"}]
        ambiguous = compile_coverage(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=duplicate,
        )
        assert ambiguous["rows"][0]["status"] == "suspect"

        fallback = {
            **manifests[0], "id": "automatic-fallback", "dataset_id": "fallback.auto",
            "provider": "Fallback provider", "provider_priority": 200,
            "fallback_for": "automatic",
        }
        with_fallback = compile_coverage(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root, reader=reader,
            manifests=[*manifests, fallback],
        )
        assert with_fallback["rows"][0]["status"] == "usable"

        manual_missing = compile_coverage(
            commodity="GOLD", decision_time="2026-08-11T00:00:00Z", profile_path=profile,
            structured_root=structured_root, connectors_root=root, data_root=root,
            market_root=market_root, state_root=state_root,
            reader=lambda *_args, **_kwargs: None, manifests=manifests,
        )
        assert manual_missing["rows"][1]["status"] == "manual"

        baseline = json.loads((structured_root / "GOLD.json").read_text(encoding="utf-8"))
        broken = copy.deepcopy(baseline)
        broken["requirements"][0]["policy"] = "silently weakened"
        (structured_root / "GOLD.json").write_text(json.dumps(broken), encoding="utf-8")
        try:
            structured_profile("GOLD", profile_path=profile, structured_root=structured_root)
            raise AssertionError("markdown/structured policy mismatch must fail")
        except ValueError as error:
            assert "mirror" in str(error), f"Expected profile-mirror error, got: {error}"
        assert structured_profile(
            "GOLD", profile_path=frozen_markdown, structured_root=frozen_root,
        )
        assert profile_snapshot_sha256(
            "GOLD", profile_path=frozen_markdown, structured_root=frozen_root,
        ) == artifact["profile_snapshot_sha256"]
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
