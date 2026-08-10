#!/usr/bin/env python3
"""Regression tests for the commodity evidence graph and statistical gate."""
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


evidence = _load("commodity_signal_evidence", ROOT / "scripts/commodity_signal_evidence.py")
validation = _load("commodity_signal_validation", ROOT / "scripts/commodity_signal_validation.py")
schema_validator = _load("validate_screener_json", ROOT / "scripts/validate_screener_json.py")


def _iso(moment: dt.datetime) -> str:
    return moment.replace(tzinfo=dt.timezone.utc).isoformat().replace("+00:00", "Z")


def _candidate(signal_id: str, good: bool = True) -> dict:
    base = dt.datetime(2020, 1, 1)
    observations = []
    for index in range(30):
        start = base + dt.timedelta(days=index * 10)
        prediction = 1 if index % 2 == 0 else -1
        outcome = prediction * 2.0 if good else (-prediction * 2.0 if index < 18 else prediction * 2.0)
        observations.append({
            "decision_time": _iso(start - dt.timedelta(hours=1)),
            "outcome_start": _iso(start),
            "outcome_end": _iso(start + dt.timedelta(days=5)),
            "source_retrieved_at": _iso(start - dt.timedelta(hours=2)),
            "trained_through": _iso(start - dt.timedelta(days=1)),
            "prediction": prediction,
            "outcome_return_pct": outcome,
            "naive_prediction": 0,
            "signal_cost_pct": 0.1,
            "naive_cost_pct": 0,
            "regime": ["inflation", "disinflation", "stress"][index % 3],
            "is_out_of_sample": True,
        })
    return {
        "signal_id": signal_id,
        "expected_sign": 1,
        "observations": observations,
        "lookback_variants": [
            {"lookback_days": 30, "observations": observations},
            {"lookback_days": 60, "observations": observations},
            {"lookback_days": 120, "observations": observations},
        ],
    }


def _write_agent(repo: Path, module: str, stem: str, owner: str, families: list[str]) -> None:
    path = repo / ".claude/agents/commodity" / module / f"{stem}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "---\n"
        f"name: {owner}\n"
        "layer: 1\n"
        "emits_signal_evidence: true\n"
        f"signal_families: {json.dumps(families)}\n"
        "---\n# Agent\n",
        encoding="utf-8",
    )


def _signal(signal_id: str, cluster: str, direction: str, strength: float, **extra) -> dict:
    row = {
        "signal_id": signal_id,
        "economic_cluster": cluster,
        "role": "driver",
        "horizon": "both",
        "direction": direction,
        "strength": strength,
        "as_of": "2026-08-10T00:00:00Z",
        "expiry": "2026-12-31T00:00:00Z",
        "source_vintage_ids": ["sha256:" + "a" * 64],
        "source_vintage_refs": [{
            "dataset_id": "test.dataset", "series_id": f"test.{signal_id}",
            "subject": "GOLD", "vintage_id": "sha256:" + "a" * 64,
        }],
        "signal_kind": "observational",
        "validation_ref": None,
    }
    row.update(extra)
    return row


def _write_sidecar(run: Path, module: str, stem: str, owner: str, signals: list[dict], edges=None) -> None:
    folder = run / module
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{stem}.md").write_text("# completed orb\n", encoding="utf-8")
    (folder / f"{stem}.signals.json").write_text(json.dumps({
        "schema_version": 1,
        "commodity": "GOLD",
        "owner_orb": owner,
        "generated_at": "2026-08-10T00:00:00Z",
        "signals": signals,
        "correlation_edges": edges or [],
    }), encoding="utf-8")


def test_validation_gate() -> dict:
    document = {"schema_version": 1, "generated_at": "2026-08-10T00:00:00Z", "candidates": [
        _candidate("validated-alpha", good=True),
        _candidate("failed-alpha", good=False),
    ]}
    result = validation.validate_document(document)
    by_id = {row["signal_id"]: row for row in result["results"]}
    assert by_id["validated-alpha"]["status"] == "validated"
    assert all(by_id["validated-alpha"]["gates"].values())
    assert by_id["failed-alpha"]["status"] == "contextual"
    assert not all(by_id["failed-alpha"]["gates"].values())
    print("PASS: validation requires PIT, regimes, 30 non-overlapping outcomes, 4/5 folds, baseline, bootstrap, stable lookbacks and 10% FDR")
    return result


def test_evidence_compiler(valid_registry: dict) -> None:
    with tempfile.TemporaryDirectory() as temp:
        repo = Path(temp)
        run = repo / "commodity/runs/GOLD"
        declarations = [
            ("ratios-a", "01_ratio-a", "ratio-a", ["gold-cpi"]),
            ("ratios-b", "01_ratio-b", "ratio-b", ["miners-silver"]),
            ("inventory", "01_inventory", "inventory-owner", ["inventory-buffer"]),
            ("models", "01_model", "model-owner", ["model-alpha"]),
        ]
        for module, stem, owner, families in declarations:
            _write_agent(repo, module, stem, owner, families)

        ratio_a = _signal("gold-cpi-ratio", "gold-cpi", "bullish", 0.8,
                          numerator_series_id="gold", denominator_series_id="cpi")
        ratio_b = _signal("miners-silver-ratio", "miners-silver", "bullish", 0.6,
                          numerator_series_id="miners", denominator_series_id="silver")
        _write_sidecar(run, "ratios-a", "01_ratio-a", "ratio-a", [ratio_a], [{
            "signal_a": "gold-cpi-ratio", "signal_b": "miners-silver-ratio",
            "correlation": 0.75, "window_start": "2023-08-10", "window_end": "2026-08-10",
            "observation_count": 156, "frequency": "weekly", "method": "pearson",
            "source_vintage_ids": ["sha256:" + "b" * 64],
            "source_vintage_refs": [{
                "dataset_id": "test.ratios", "series_id": "test.ratio-history",
                "subject": "GOLD", "vintage_id": "sha256:" + "b" * 64,
            }],
        }])
        _write_sidecar(run, "ratios-b", "01_ratio-b", "ratio-b", [ratio_b])
        _write_sidecar(run, "inventory", "01_inventory", "inventory-owner", [
            _signal("inventory-tight", "inventory-buffer", "bullish", 0.9, contradicts=["inventory-loose"]),
            _signal("inventory-loose", "inventory-buffer", "bearish", 0.7, contradicts=["inventory-tight"]),
        ])
        statistical = _signal("validated-alpha", "model-alpha", "bullish", 0.95,
                              signal_kind="statistical", validation_ref="validated-alpha")
        _write_sidecar(run, "models", "01_model", "model-owner", [statistical])

        empty_registry = repo / "empty-registry.json"
        empty_registry.write_text(json.dumps({"schema_version": 1, "results": []}), encoding="utf-8")
        resolver = lambda _ref, _cutoff: True
        compiled = evidence.compile_evidence(repo, run, empty_registry, source_resolver=resolver)
        ratio_cluster = next(row for row in compiled["clusters"] if "gold-cpi-ratio" in row["signal_ids"])
        assert set(ratio_cluster["signal_ids"]) == {"gold-cpi-ratio", "miners-silver-ratio"}
        assert compiled["summary"]["independent_cluster_count"] == 3
        print("PASS: ratios with |three-year weekly correlation| >= 0.70 count as one independent cluster")

        inventory_cluster = next(row for row in compiled["clusters"] if "inventory-tight" in row["signal_ids"])
        assert inventory_cluster["contradiction"] is True
        assert inventory_cluster["directions"] == ["bearish", "bullish"]
        assert {row["signal_id"] for row in compiled["records"]} >= {"inventory-tight", "inventory-loose"}
        print("PASS: contradictory evidence rows remain visible and the cluster is explicitly conflicted")

        statistical_row = next(row for row in compiled["records"] if row["signal_id"] == "validated-alpha")
        statistical_cluster = next(row for row in compiled["clusters"] if row["signal_ids"] == ["validated-alpha"])
        assert statistical_row["validation_status"] == "contextual"
        assert statistical_row["conviction_eligible"] is False
        assert statistical_cluster["conviction_eligible"] is False
        print("PASS: a statistical signal absent from the deterministic registry cannot lift conviction")

        registry_path = repo / "validated-registry.json"
        registry_path.write_text(json.dumps(valid_registry), encoding="utf-8")
        unresolved = evidence.compile_evidence(
            repo, run, registry_path, source_resolver=lambda _ref, _cutoff: False
        )
        unresolved_row = next(row for row in unresolved["records"] if row["signal_id"] == "validated-alpha")
        assert unresolved_row["validation_status"] == "source_unverified" and unresolved_row["conviction_eligible"] is False
        print("PASS: an unresolved or future-retrieved vintage cannot lift conviction even for a validated model")

        promoted = evidence.compile_evidence(repo, run, registry_path, source_resolver=resolver)
        promoted_row = next(row for row in promoted["records"] if row["signal_id"] == "validated-alpha")
        assert promoted_row["validation_status"] == "validated" and promoted_row["conviction_eligible"] is True
        assert promoted["coverage"]["complete"] is True
        print("PASS: only a registry result with every hard gate true promotes the statistical signal")

        schema = json.loads((ROOT / "frameworks/commodity/signal_evidence.schema.json").read_text())
        checker = schema_validator.Checker(schema)
        checker.check(schema, promoted, "")
        assert not checker.errors, checker.errors
        print("PASS: the compiled graph conforms to the checked-in SignalEvidence schema")

        (run / "ratios-b/01_ratio-b.signals.json").unlink()
        incomplete = evidence.compile_evidence(repo, run, empty_registry, source_resolver=resolver)
        assert (incomplete["coverage"]["complete"] is False
                and incomplete["coverage"]["missing"] == ["ratio-b"]
                and any("correlation edge references missing" in issue for issue in incomplete["coverage"]["issues"]))
        print("PASS: an active module's failed/missing emitting orb cannot disappear from coverage")


def test_decision_abstention_gate() -> None:
    with tempfile.TemporaryDirectory() as temp:
        run = Path(temp) / "GOLD"
        run.mkdir()
        graph = {
            "commodity": "GOLD", "generated_at": "2026-08-10T00:00:00Z",
            "coverage": {"complete": False},
            "summary": {"raw_signal_count": 2, "independent_cluster_count": 1,
                        "conviction_eligible_cluster_count": 0, "contradiction_count": 1},
        }
        (run / "signal_evidence.json").write_text(json.dumps(graph), encoding="utf-8")
        projection = {
            "path": "signal_evidence.json", "generated_at": graph["generated_at"],
            "coverage_complete": False, "raw_signal_count": 2, "independent_cluster_count": 1,
            "conviction_eligible_cluster_count": 0, "contradiction_count": 1,
        }
        decision = run / "decision_record.json"
        decision.write_text(json.dumps({"commodity": "GOLD", "action": "Hold", "signal_evidence": projection}), encoding="utf-8")
        errors = schema_validator.check_commodity_signal_projection(str(decision))
        assert any("requires action 'Research More'" in error for error in errors)
        assert any("zero conviction-eligible" in error for error in errors)
        decision.write_text(json.dumps({"commodity": "GOLD", "action": "Research More", "signal_evidence": projection}), encoding="utf-8")
        assert schema_validator.check_commodity_signal_projection(str(decision)) == []
        print("PASS: incomplete evidence coverage deterministically forces Research More")


def test_malformed_source_refs_fail_cleanly() -> None:
    family_owner = {"inventory-buffer": "inventory-owner"}
    malformed_signal = _signal("inventory-tight", "inventory-buffer", "bullish", 0.9)
    malformed_signal["source_vintage_refs"] = ["not-an-object"]
    try:
        evidence._validate_signal(
            malformed_signal,
            "inventory-owner",
            family_owner,
            {},
            dt.datetime(2026, 8, 10, tzinfo=dt.timezone.utc),
            lambda _ref, _cutoff: True,
        )
    except ValueError as exc:
        assert "source_vintage_ref" in str(exc)
    else:
        raise AssertionError("malformed signal source references must fail with ValueError")

    malformed_edge = {
        "signal_a": "left",
        "signal_b": "right",
        "correlation": 0.8,
        "window_start": "2023-08-10",
        "window_end": "2026-08-10",
        "observation_count": 156,
        "frequency": "weekly",
        "method": "pearson",
        "source_vintage_ids": ["sha256:" + "b" * 64],
        "source_vintage_refs": [{"vintage_id": 123}],
    }
    try:
        evidence._validate_correlation(
            malformed_edge,
            {"left", "right"},
            lambda _ref, _cutoff: True,
            dt.datetime(2026, 8, 10, tzinfo=dt.timezone.utc),
        )
    except ValueError as exc:
        assert "invalid correlation edge contract" in str(exc)
    else:
        raise AssertionError("non-string correlation vintage IDs must fail with ValueError")
    print("PASS: malformed source references fail cleanly before deterministic sorting")


def main() -> int:
    registry = test_validation_gate()
    test_evidence_compiler(registry)
    test_decision_abstention_gate()
    test_malformed_source_refs_fail_cleanly()
    print("ALL PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
