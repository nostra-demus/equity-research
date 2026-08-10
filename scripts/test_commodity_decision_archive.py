#!/usr/bin/env python3
"""Regression tests for immutable commodity decision publication."""
from __future__ import annotations

import json
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
        first_id, first_path, created = archive_decision(root)
        assert created and first_path.is_file()
        projected = json.loads((root / "decision_record.json").read_text())
        assert projected["decision_id"] == first_id
        assert json.loads(first_path.read_text()) == projected
        assert first_id == decision_id_for(projected)
        from validate_screener_json import check_commodity_decision_archive
        assert check_commodity_decision_archive(str(root / "decision_record.json")) == []

        same_id, same_path, created_again = archive_decision(root)
        assert (same_id, same_path, created_again) == (first_id, first_path, False)

        projected["confidence"] = 45
        _write(root / "decision_record.json", projected)
        second_id, second_path, second_created = archive_decision(root)
        assert second_created and second_id != first_id and second_path.is_file()
        assert first_path.is_file(), "a later decision must not overwrite the earlier archive"

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
