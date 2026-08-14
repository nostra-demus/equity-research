#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent))

import recover_idea_board_history as recovery
from canonical_json import canonical_json


def run(repo: Path, *args: str) -> str:
    result = subprocess.run(args, cwd=repo, check=True, text=True, stdout=subprocess.PIPE)
    return result.stdout.strip()


def row(ticker: str, direction: str, started: str, decay: str, *, stale: bool,
        status: str = "live", promoted: str | None = None) -> dict:
    idea_id = "IDEA-" + hashlib.sha256(f"{ticker}|{direction}".encode()).hexdigest()[:12]
    version = "IDEAV-" + hashlib.sha256(f"{ticker}|{started}".encode()).hexdigest()[:16]
    return {
        "idea_id": idea_id, "idea_version": version, "idea_version_started_at": started,
        "ticker": ticker, "company": f"{ticker} Plc", "exchange": "TEST",
        "direction": direction, "pair_with": None, "reason": "A dated filing changed the setup.",
        "why_now": "The filing is new.", "conviction": 60, "conviction_basis": "pre_edge_proxy",
        "trade_score": 55, "trade_score_basis": "evidence_gate_v2",
        "trade_score_breakdown": {}, "trade_readiness": "needs_data", "missing_checks": [],
        "learning": None, "priced_in": "unknown", "thesis_type": "company_specific",
        "origin_type": "wire", "source_themes": [], "source_event_ids": ["EVT-123456789abc"],
        "source_headlines": ["Filing"], "source_headline": "Filing",
        "source_url": "https://example.test/filing", "source_name": "Exchange",
        "materiality_max": 80, "newest_source_at": started, "prior_coverage": None,
        "surfaced_at": started, "updated_at": started, "decay_at": decay,
        "status": status, "promoted_signal_id": promoted, "feedback": None, "stale": stale,
    }


class RecoveryTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)
        run(self.repo, "git", "init", "-q")
        run(self.repo, "git", "config", "user.email", "test@example.test")
        run(self.repo, "git", "config", "user.name", "Test")
        (self.repo / "screener/board").mkdir(parents=True)
        (self.repo / "screener/ledger/ideas").mkdir(parents=True)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def commit_board(self, at: str, rows: list[dict], message: str) -> str:
        path = self.repo / recovery.SOURCE_PATH
        path.write_text(json.dumps({"generated_at": at, "ideas": rows}), encoding="utf-8")
        run(self.repo, "git", "add", recovery.SOURCE_PATH)
        run(self.repo, "git", "commit", "-qm", message)
        return run(self.repo, "git", "rev-parse", "HEAD")

    def test_dry_run_write_and_idempotent_manifest(self) -> None:
        old = row("OLD", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z", stale=True)
        current = row("NOW", "long", "2026-08-03T00:00:00Z", "2026-08-10T00:00:00Z", stale=False)
        self.commit_board("2026-08-03T00:00:00Z", [old], "old")
        self.commit_board("2026-08-04T00:00:00Z", [current], "current")

        manifest, writes = recovery.plan_recovery(self.repo)
        self.assertEqual(len(writes), 2)
        self.assertFalse((self.repo / recovery.ARCHIVE_REL).exists())
        self.assertEqual(recovery.counts(manifest, writes)["latest_current"], 1)

        self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 0)
        archive = self.repo / recovery.ARCHIVE_REL
        before = {path.name: path.read_bytes() for path in archive.iterdir()}
        self.assertEqual(json.loads((archive / recovery.RETENTION_NAME).read_text()), recovery.zero_retention())
        self.assertEqual((archive / recovery.RETENTION_REQUIRED_NAME).read_bytes(), recovery.RETENTION_MARKER)
        self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 0)
        after = {path.name: path.read_bytes() for path in archive.iterdir()}
        self.assertEqual(before, after)
        stored = json.loads((archive / recovery.occurrence_filename(recovery.occurrence_key(current))).read_text())
        self.assertEqual(stored["schema_version"], "idea-board-recovery/v1")
        self.assertEqual(stored["recovery_reason"], "latest_board_current")
        self.assertEqual(stored["provenance"]["source_row_sha256"], recovery.canonical_sha256(current))
        self.assertTrue(recovery.validate_recovery_record(
            stored, recovery.occurrence_filename(recovery.occurrence_key(current))))

    def test_suppression_and_active_manifest_decisions_never_resurrect(self) -> None:
        suppressed = row("NOPE", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z", stale=True)
        active = row("ACTIVE", "long", "2026-08-01T01:00:00Z", "2026-08-02T01:00:00Z", stale=True)
        self.commit_board("2026-08-03T00:00:00Z", [suppressed, active], "expired")
        archive = self.repo / recovery.ARCHIVE_REL
        archive.mkdir(parents=True)
        suppression_path = archive / recovery.occurrence_filename(
            recovery.occurrence_key(suppressed), "withdrawn")
        suppression_path.write_text(canonical_json({
            "schema_version": "idea-archive-suppression/v1",
            "idea_id": suppressed["idea_id"], "idea_version": suppressed["idea_version"],
            "idea_version_started_at": suppressed["idea_version_started_at"],
            "direction": "long", "pair_with": None, "suppressed_at": "2026-08-03T00:00:00Z",
            "suppression_reason": "withdrawn_unadmitted",
        }) + "\n", encoding="utf-8")
        (self.repo / recovery.IDEAS_REL / f"{active['idea_id']}.json").write_text(
            json.dumps(active), encoding="utf-8")

        self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 0)
        manifest_path = archive / recovery.MANIFEST_NAME
        decisions = {entry["idea_id"]: entry["decision"]
                     for entry in json.loads(manifest_path.read_text())["occurrences"]}
        self.assertEqual(decisions, {suppressed["idea_id"]: "suppressed", active["idea_id"]: "active"})

        suppression_path.unlink()
        (self.repo / recovery.IDEAS_REL / f"{active['idea_id']}.json").unlink()
        self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 0)
        self.assertFalse(suppression_path.exists())
        self.assertFalse((archive / recovery.occurrence_filename(recovery.occurrence_key(active))).exists())

    def test_withdrawal_wins_over_crash_left_active_snapshot(self) -> None:
        withdrawn = row("NOPE", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z", stale=True)
        self.commit_board("2026-08-03T00:00:00Z", [withdrawn], "expired")
        archive = self.repo / recovery.ARCHIVE_REL
        archive.mkdir(parents=True)
        (self.repo / recovery.IDEAS_REL / f"{withdrawn['idea_id']}.json").write_text(
            json.dumps(withdrawn), encoding="utf-8")
        (archive / recovery.occurrence_filename(
            recovery.occurrence_key(withdrawn), "withdrawn")).write_text(canonical_json({
                "schema_version": "idea-archive-suppression/v1",
                "idea_id": withdrawn["idea_id"], "idea_version": withdrawn["idea_version"],
                "idea_version_started_at": withdrawn["idea_version_started_at"],
                "direction": "long", "pair_with": None, "suppressed_at": "2026-08-03T00:00:00Z",
                "suppression_reason": "withdrawn_unadmitted",
            }) + "\n", encoding="utf-8")
        manifest, writes = recovery.plan_recovery(self.repo)
        self.assertEqual(writes, {})
        self.assertEqual(manifest["occurrences"][0]["decision"], "suppressed")

    def test_invalid_retention_aborts_before_records_or_manifest(self) -> None:
        expired = row("SAFE", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z", stale=True)
        self.commit_board("2026-08-03T00:00:00Z", [expired], "expired")
        archive = self.repo / recovery.ARCHIVE_REL
        archive.mkdir(parents=True)
        (archive / recovery.RETENTION_NAME).write_text('{"schema_version":"wrong"}\n', encoding="utf-8")
        self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 1)
        self.assertFalse((archive / recovery.MANIFEST_NAME).exists())
        self.assertFalse((archive / recovery.occurrence_filename(recovery.occurrence_key(expired))).exists())

    def test_pending_withdrawal_retention_aborts_before_recovery_write(self) -> None:
        expired = row("SAFE", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z", stale=True)
        self.commit_board("2026-08-03T00:00:00Z", [expired], "expired")
        archive = self.repo / recovery.ARCHIVE_REL
        archive.mkdir(parents=True)
        withdrawal = recovery.occurrence_filename(recovery.occurrence_key(expired), "withdrawn")
        retention = recovery.zero_retention()
        retention["pending_evictions"] = [withdrawal]
        (archive / recovery.RETENTION_NAME).write_text(canonical_json(retention) + "\n", encoding="utf-8")
        self.assertFalse(recovery.valid_retention(retention))
        self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 1)
        self.assertFalse((archive / recovery.MANIFEST_NAME).exists())
        self.assertFalse((archive / recovery.occurrence_filename(recovery.occurrence_key(expired))).exists())

    def test_never_recovers_vanished_unexpired_or_promoted(self) -> None:
        vanished = row("MAYBE", "long", "2026-08-01T00:00:00Z", "2026-08-10T00:00:00Z", stale=False)
        promoted = row("PAID", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z",
                       stale=True, status="promoted", promoted="SIG-1")
        self.commit_board("2026-08-03T00:00:00Z", [vanished, promoted], "seen")
        self.commit_board("2026-08-04T00:00:00Z", [], "gone")
        manifest, writes = recovery.plan_recovery(self.repo)
        self.assertEqual(writes, {})
        reasons = {entry["idea_id"]: entry["reason"] for entry in manifest["occurrences"]}
        self.assertEqual(reasons[vanished["idea_id"]], "no_committed_expiry_evidence")
        self.assertEqual(reasons[promoted["idea_id"]], "promoted_occurrence")

    def test_occurrence_filename_hashes_exact_epoch(self) -> None:
        key = ("IDEA-123456789abc", "IDEAV-1234567890abcdef", "2026-08-01T00:00:00+00:00", "long")
        expected = hashlib.sha256(key[2].encode()).hexdigest()
        self.assertEqual(recovery.occurrence_filename(key),
                         f"{key[0]}--{key[1]}--{expected}--long--imported.json")
        self.assertTrue(recovery.COMMIT_RE.fullmatch("a" * 40))
        self.assertTrue(recovery.COMMIT_RE.fullmatch("a" * 64))

    def test_write_refuses_new_records_when_managed_archive_is_over_bound(self) -> None:
        expired = row("SAFE", "long", "2026-08-01T00:00:00Z", "2026-08-02T00:00:00Z", stale=True)
        self.commit_board("2026-08-03T00:00:00Z", [expired], "expired")
        archive = self.repo / recovery.ARCHIVE_REL
        archive.mkdir(parents=True)
        for index in range(3):
            started = f"2026-07-31T00:00:0{index}Z"
            key = ("IDEA-aaaaaaaaaaaa", "IDEAV-bbbbbbbbbbbbbbbb", started, "long")
            (archive / recovery.occurrence_filename(key, "expired")).touch()
        with mock.patch.object(recovery, "IDEA_ARCHIVE_MAX_FILES_READ", 2):
            self.assertEqual(recovery.main(["--repo-root", str(self.repo), "--write"]), 1)
        self.assertFalse((archive / recovery.MANIFEST_NAME).exists())
        self.assertFalse((archive / recovery.occurrence_filename(recovery.occurrence_key(expired))).exists())

    def test_capacity_preflight_rejects_601st_occurrence_but_allows_same_group_sibling(self) -> None:
        first = ("IDEA-123456789abc", "IDEAV-1234567890abcdef",
                 "2026-08-01T00:00:00Z", "long")
        second = ("IDEA-aaaaaaaaaaaa", "IDEAV-bbbbbbbbbbbbbbbb",
                  "2026-08-02T00:00:00Z", "long")
        names = [recovery.occurrence_filename(first, "expired")]
        sibling = {Path(recovery.occurrence_filename(first, "imported")): {}}
        recovery.ensure_recovery_write_capacity(names, sibling, max_files=3, max_occurrences=1)
        with self.assertRaisesRegex(RuntimeError, "1-occurrence"):
            recovery.ensure_recovery_write_capacity(
                names, {Path(recovery.occurrence_filename(second, "imported")): {}},
                max_files=3, max_occurrences=1,
            )

    def test_total_directory_entry_bound_counts_unmanaged_siblings(self) -> None:
        archive = self.repo / recovery.ARCHIVE_REL
        archive.mkdir(parents=True)
        for index in range(3):
            (archive / f"unmanaged-{index}").touch()
        names, overflow, missing = recovery.bounded_managed_archive_names(
            archive, limit=10, directory_limit=2,
        )
        self.assertEqual(names, [])
        self.assertTrue(overflow)
        self.assertFalse(missing)


if __name__ == "__main__":
    unittest.main()
