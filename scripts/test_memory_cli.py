#!/usr/bin/env python3
"""CLI safety regressions for repository-root and atomic replacement boundaries."""
from __future__ import annotations

import json
import hashlib
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MEMORY = ROOT / "scripts/memory.py"
sys.path.insert(0, str(ROOT / "scripts"))

from canonical_json import canonical_json  # noqa: E402
from memory import _load_canonical_events  # noqa: E402
from memory_contract import payload_sha256  # noqa: E402
from memory_projection import build_projection  # noqa: E402


def _run(*arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(MEMORY), *arguments],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )


def main() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        wrong_root = Path(temporary)
        database = wrong_root / "existing.sqlite"
        original = b"do-not-replace-this-file"
        database.write_bytes(original)

        project = _run(
            "project", "--root", str(wrong_root), "--database", str(database)
        )
        assert project.returncode == 1, project.stderr
        project_report = json.loads(project.stdout)
        assert project_report["ok"] is False
        assert "repository sentinel is missing" in project_report["errors"][0]
        assert database.read_bytes() == original, "wrong-root project replaced an existing DB"

        doctor = _run("doctor", "--root", str(wrong_root))
        assert doctor.returncode == 1, doctor.stderr
        doctor_report = json.loads(doctor.stdout)
        assert doctor_report["ok"] is False
        assert doctor_report["event_count"] == 0

        duplicate = wrong_root / "duplicate.json"
        duplicate.write_text('{"schema":"memory-event/v1","schema":"memory-event/v1"}\n')
        duplicate_result = _run("validate", str(duplicate))
        assert duplicate_result.returncode == 1
        assert "duplicate JSON object key" in duplicate_result.stderr

        empty_stream = wrong_root / "empty.ndjson"
        empty_stream.write_text("\n", encoding="utf-8")
        empty_result = _run("validate", str(empty_stream))
        assert empty_result.returncode == 1
        assert "at least one event" in empty_result.stderr

        loose_bundle = wrong_root / "loose-bundle.json"
        loose_bundle.write_text('{"events":[],"extra":true}\n', encoding="utf-8")
        loose_result = _run("validate", str(loose_bundle))
        assert loose_result.returncode == 1
        assert json.loads(loose_result.stdout)["ok"] is False

    with tempfile.TemporaryDirectory() as temporary:
        repo = Path(temporary)
        subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.name", "Memory Test"], cwd=repo, check=True)
        subprocess.run(
            ["git", "config", "user.email", "memory@example.test"], cwd=repo, check=True
        )
        digest = hashlib.sha256(b"canonical-source").hexdigest()
        payload = {
            "source_path": "memory/events/source.json",
            "source_sha256": digest,
            "source_locator": "record",
            "value": "reviewed",
        }
        event = {
            "schema": "memory-event/v1",
            "event_id": "evt_20000000-0000-5000-8000-000000000001",
            "event_type": "decision.recorded",
            "subject_ids": ["entity:internal:cli-test"],
            "valid_time": {"from": "2026-01-01", "to": None},
            "system_time": "2026-08-21T00:00:00.1Z",
            "producer": {
                "kind": "human", "name": "memory-test", "runtime": None,
                "model": None, "prompt_program_sha": None,
            },
            "run_id": None,
            "trace_id": None,
            "payload": payload,
            "evidence_refs": [f"evidence:sha256:{digest}#record"],
            "derived_from": [],
            "supersedes": [],
            "integrity": {"payload_sha256": payload_sha256(payload), "signature": None},
            "policy": {
                "classification": "internal", "retention": "permanent", "retain_until": None,
            },
        }
        path = repo / "memory/events/reviewed.ndjson"
        path.parent.mkdir(parents=True)
        path.write_text(canonical_json(event) + "\n", encoding="utf-8")
        subprocess.run(["git", "add", "."], cwd=repo, check=True)
        subprocess.run(
            ["git", "commit", "-q", "--no-gpg-sign", "-m", "canonical event"],
            cwd=repo,
            check=True,
        )
        canonical_events, canonical_diagnostics = _load_canonical_events(repo)
        assert canonical_events == [event]
        assert canonical_diagnostics == []
        projection_path = repo / "projection.sqlite"
        projection = build_projection([event], projection_path)
        query = _run(
            "query",
            "--database", str(projection_path),
            "--expected-digest", projection.digest,
            "--classification", "internal",
            "--as-of", "2026-08-22T00:00:00Z",
            "--valid-at", "2026-08-22T00:00:00Z",
        )
        assert query.returncode == 0, query.stderr
        packet = json.loads(query.stdout)
        assert packet["trusted_projection_digest_matched"] is True
        assert "projection_digest" not in packet
        assert packet["events"] == [event]
        path.write_text(canonical_json(event) + "\n\n", encoding="utf-8")
        dirty_events, dirty_diagnostics = _load_canonical_events(repo)
        assert dirty_events == []
        assert dirty_diagnostics[0]["code"] == "uncommitted_canonical_event"

        # A loader that only walks extant paths silently loses a deleted tracked
        # event. The root-wide Git preflight must reject both a missing file and a
        # completely removed canonical directory.
        path.write_text(canonical_json(event) + "\n", encoding="utf-8")
        restored_events, restored_diagnostics = _load_canonical_events(repo)
        assert restored_events == [event]
        assert restored_diagnostics == []
        path.unlink()
        deleted_events, deleted_diagnostics = _load_canonical_events(repo)
        assert deleted_events == []
        assert deleted_diagnostics[0]["code"] == "uncommitted_canonical_event"
        path.parent.rmdir()
        (repo / "memory").rmdir()
        missing_root_events, missing_root_diagnostics = _load_canonical_events(repo)
        assert missing_root_events == []
        assert missing_root_diagnostics[0]["code"] == "uncommitted_canonical_event"

    print("test_memory_cli: PASS")


if __name__ == "__main__":
    main()
