#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from memory_maintenance import _tree_digest, clean_rebuild, main, recovery_drill
from memory_runtime import ProjectionSnapshot


class MemoryMaintenanceTests(unittest.TestCase):
    def test_clean_rebuild_records_only_content_free_snapshot_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            config = {
                "repository_root": str(root / "repo"), "state_root": str(root / "state"),
                "checkpoint": str(root / "checkpoint"), "writer_owner": str(root / "owner"),
                "writer_head": str(root / "head"), "canonical_ledger": str(root / "ledger"),
                "protected_store": str(root / "store"), "protected_master_key": str(root / "master"),
                "protected_key_id": "memory-key", "projection_service_identity": "projection-reader",
                "checkpoint_private_key": str(root / "private"), "checkpoint_public_key": str(root / "public"),
                "checkpoint_key_id": "checkpoint-key",
            }
            snapshot = ProjectionSnapshot(
                source="deterministic-local-rebuild", repository_sha="1" * 40,
                projection_digest="sha256:" + "2" * 64, event_count=27,
                identity_registry_sha256="sha256:" + "3" * 64,
                checkpoint_sha256="sha256:" + "4" * 64, diagnostics=(),
            )
            with patch("memory_maintenance.ProjectionManager") as manager:
                manager.return_value.prepare.return_value = snapshot
                report = clean_rebuild(config)
            self.assertEqual("completed", report["status"])
            self.assertEqual(27, report["event_count"])
            self.assertNotIn("events", report)
            latest = root / "state" / "operations" / "latest-rebuild.json"
            self.assertEqual(report, json.loads(latest.read_text()))
            self.assertEqual(0o600, latest.stat().st_mode & 0o777)

    def test_recovery_drill_restores_to_disposable_tree_and_purges_all_runtime_lanes(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            backup = root / "backup"
            (backup / "runtime").mkdir(parents=True)
            (backup / "protected-store").mkdir(parents=True)
            (backup / "runtime" / "projection.sqlite").write_bytes(b"restored-runtime")
            (backup / "protected-store" / "manifest.json").write_text("{}")
            os.chmod(backup / "runtime" / "projection.sqlite", 0o600)
            os.chmod(backup / "protected-store" / "manifest.json", 0o600)
            key = root / "master.key"
            key.write_bytes(b"k" * 32)
            os.chmod(key, 0o600)
            config = {
                "repository_root": str(root / "repo"), "state_root": str(root / "state"),
                "backup_root": str(backup), "backup_sha256": _tree_digest(backup),
                "store_manifest_sha256": "sha256:" + "a" * 64,
                "protected_master_key": str(key), "protected_key_id": "key:memory-key",
            }
            doctor = {
                "status": "healthy", "store_manifest_sha256": "sha256:" + "a" * 64,
                "inventory": {"exact_entries_read": 9},
            }
            with patch("memory_maintenance.doctor_store", return_value=doctor):
                report = recovery_drill(config)
            self.assertTrue(report["full_restore_completed"])
            self.assertEqual(6, report["purge_surface_count"])
            self.assertEqual(0, report["committed_event_loss_count"])
            self.assertEqual([], list((root / "state" / "operations" / "drill-work").glob("restore-*")))
            self.assertTrue((root / "state" / "operations" / "latest-recovery-drill.json").is_file())
            readiness = json.loads((root / "state" / "operations" / "latest-restore-observation.json").read_text())
            self.assertEqual("memory-restore-drill-observation/v1", readiness["schema"])
            self.assertEqual(0, readiness["committed_event_loss_count"])

    def test_cli_refuses_a_wide_configuration_file(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            config = Path(raw) / "config.json"
            config.write_text("{}")
            os.chmod(config, 0o644)
            self.assertEqual(4, main(["--config", str(config), "clean-rebuild"]))


if __name__ == "__main__":
    unittest.main()
