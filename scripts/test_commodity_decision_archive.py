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
