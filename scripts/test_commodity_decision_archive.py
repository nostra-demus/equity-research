#!/usr/bin/env python3
"""Regression tests for immutable commodity decision publication."""
from __future__ import annotations

import json
import hashlib
import tempfile
from pathlib import Path

from commodity_decision_archive import ArchiveError, archive_decision, decision_id_for
from test_commodity_forecast_contract import _record


def _write(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value) + "\n", encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary) / "GOLD"
        record = _record()
        _write(root / "decision_record.json", record)
        vintage = "sha256:" + "a" * 64
        graph = {
            "commodity": "GOLD",
            "records": [
                {"signal_id": "tactical-signal", "source_vintage_ids": [vintage]},
                {"signal_id": "strategic-signal", "source_vintage_ids": [vintage]},
            ],
            "clusters": [
                {"cluster_id": "tactical.cluster-1", "signal_ids": ["tactical-signal"]},
                {"cluster_id": "strategic.cluster-1", "signal_ids": ["strategic-signal"]},
            ],
        }
        record["signal_evidence"] = {
            "path": "signal_evidence.json", "generated_at": "2026-08-10T00:00:00Z",
            "artifact_sha256": "", "coverage_complete": True, "raw_signal_count": 2,
            "independent_cluster_count": 2, "conviction_eligible_cluster_count": 2,
            "contradiction_count": 0,
        }
        graph["generated_at"] = "2026-08-10T00:00:00Z"
        graph["coverage"] = {"complete": True}
        graph["summary"] = {"raw_signal_count": 2, "independent_cluster_count": 2,
                            "conviction_eligible_cluster_count": 2, "contradiction_count": 0}
        _write(root / "signal_evidence.json", graph)
        record["signal_evidence"]["artifact_sha256"] = "sha256:" + hashlib.sha256((root / "signal_evidence.json").read_bytes()).hexdigest()
        _write(root / "decision_record.json", record)
        first_id, first_path, created = archive_decision(root)
        assert created and first_path.is_file()
        projected = json.loads((root / "decision_record.json").read_text())
        assert projected["decision_id"] == first_id
        assert json.loads(first_path.read_text()) == projected
        assert json.loads((first_path.parent / "signal_evidence.json").read_text()) == graph
        assert first_id == decision_id_for(projected)
        from validate_screener_json import check_commodity_archived_snapshot, check_commodity_decision_archive
        assert check_commodity_decision_archive(str(root / "decision_record.json")) == []
        assert check_commodity_archived_snapshot(str(first_path)) == []
        archived_graph_text = (first_path.parent / "signal_evidence.json").read_text()
        (first_path.parent / "signal_evidence.json").write_text(archived_graph_text + " ", encoding="utf-8")
        assert any("artifact_sha256" in error for error in check_commodity_archived_snapshot(str(first_path)))
        (first_path.parent / "signal_evidence.json").write_text(archived_graph_text, encoding="utf-8")

        same_id, same_path, created_again = archive_decision(root)
        assert (same_id, same_path, created_again) == (first_id, first_path, False)

        wrong_family = dict(projected)
        wrong_family["commodity_family"] = "energy"
        _write(root / "decision_record.json", wrong_family)
        try:
            archive_decision(root)
        except ArchiveError as error:
            assert "commodity_family" in str(error)
        else:
            raise AssertionError("profile-family drift was archived")
        _write(root / "decision_record.json", projected)

        projected["confidence"] = 45
        _write(root / "decision_record.json", projected)
        second_id, second_path, second_created = archive_decision(root)
        assert second_created and second_id != first_id and second_path.is_file()
        assert first_path.is_file(), "a later decision must not overwrite the earlier archive"

        broken_graph = dict(graph)
        broken_graph["clusters"] = []
        _write(root / "signal_evidence.json", broken_graph)
        projected["signal_evidence"]["artifact_sha256"] = "sha256:" + hashlib.sha256((root / "signal_evidence.json").read_bytes()).hexdigest()
        _write(root / "decision_record.json", projected)
        try:
            archive_decision(root)
        except ArchiveError as error:
            assert "unknown cluster IDs" in str(error)
        else:
            raise AssertionError("unbound horizon evidence was archived")
        _write(root / "signal_evidence.json", graph)
        projected["signal_evidence"]["artifact_sha256"] = "sha256:" + hashlib.sha256((root / "signal_evidence.json").read_bytes()).hexdigest()
        _write(root / "decision_record.json", projected)

        valid_need = {
            "need_id": "official-sector-demand",
            "priority": 1,
            "series": "Official-sector gold purchases by reporting institution",
            "why_it_caps": "the current demand balance lacks a complete official-sector observation",
            "expected_impact": {
                "if_supportive": "higher purchases would strengthen the demand evidence, subject to the other balance inputs",
                "if_adverse": "lower purchases would weaken the demand read",
            },
            "filing_required": False,
            "entry_orbs": [{
                "module": "supply-demand", "agent": "commodity-demand-inventory",
                "why": "this orb owns official-sector activity", "confidence": 0.98,
            }],
            "suggested_source": {
                "name": "Official reserve reporting institution", "acquisition": "official_api",
                "access": "public", "licensing_basis": "official public data; rights checked at connector approval",
            },
            "tier": 5,
            "cadence": "monthly",
        }
        archive_count_before = len(list((root / "decisions").glob("*/decision_record.json")))
        invalid_publications = [
            ({**valid_need, "priority": "1"}, "expected type integer"),
            ({**valid_need, "entry_orbs": [{
                **valid_need["entry_orbs"][0], "agent": "orb-that-does-not-exist",
            }]}, "live discovered roster"),
        ]
        for invalid_need, expected_error in invalid_publications:
            invalid_record = {
                **projected,
                "data_needs_schema_version": "2.0",
                "data_needs": [invalid_need],
            }
            _write(root / "decision_record.json", invalid_record)
            try:
                archive_decision(root)
            except ArchiveError as error:
                assert "pre-archive decision contract failed" in str(error)
                assert expected_error in str(error).lower(), str(error)
            else:
                raise AssertionError("an invalid v2 decision was archived")
            assert len(list((root / "decisions").glob("*/decision_record.json"))) == archive_count_before
        nonfinite = dict(projected)
        nonfinite["confidence"] = float("nan")
        _write(root / "decision_record.json", nonfinite)
        try:
            archive_decision(root)
        except ArchiveError as error:
            assert "cannot be serialized safely" in str(error)
        else:
            raise AssertionError("a non-finite decision value was archived")
        assert len(list((root / "decisions").glob("*/decision_record.json"))) == archive_count_before
        _write(root / "decision_record.json", projected)

        # Idempotent replay is historical, not a fresh publication: after an orb retires, an exact
        # projection whose content-valid archive already exists must still verify `already-identical`.
        # A caller-supplied decision_id alone is never enough to bypass the live route gate.
        valid_v2 = {
            **projected,
            "data_needs_schema_version": "2.0",
            "data_needs": [valid_need],
        }
        valid_v2.pop("decision_id", None)
        _write(root / "decision_record.json", valid_v2)
        v2_id, v2_path, v2_created = archive_decision(root)
        assert v2_created
        retired_projection = json.loads((root / "decision_record.json").read_text())
        archived_v2 = json.loads(v2_path.read_text())
        archived_v2["data_needs"][0]["entry_orbs"][0]["agent"] = "retired-after-publication"
        retired_id = decision_id_for(archived_v2)
        archived_v2["decision_id"] = retired_id
        retired_path = (root / "decisions" / retired_id / "decision_record.json").resolve()
        _write(retired_path, archived_v2)
        _write(root / "decision_record.json", archived_v2)
        same_retired_id, same_retired_path, retired_created = archive_decision(root)
        assert (same_retired_id, same_retired_path, retired_created) == (retired_id, retired_path, False), (
            (same_retired_id, same_retired_path, retired_created), (retired_id, retired_path, False)
        )

        spoofed = dict(archived_v2)
        spoofed["decision_id"] = v2_id  # supplied id is neither content-valid nor an identical archive
        _write(root / "decision_record.json", spoofed)
        try:
            archive_decision(root)
        except ArchiveError as error:
            assert "live discovered roster" in str(error)
        else:
            raise AssertionError("a spoofed decision_id bypassed live route validation")
        _write(root / "decision_record.json", retired_projection)

        bad_root = Path(temporary) / "SILVER"
        _write(bad_root / "decision_record.json", record)
        try:
            archive_decision(bad_root)
        except ArchiveError as error:
            assert "does not match" in str(error)
        else:
            raise AssertionError("folder/record identity mismatch was accepted")

    print("ALL PASS — decision snapshots are content-addressed, immutable and archive-first")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
