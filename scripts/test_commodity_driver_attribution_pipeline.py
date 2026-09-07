#!/usr/bin/env python3
"""Execute commodity/full's embedded resume/gate/publication commands against isolated runs."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
import unittest
from pathlib import Path

from test_commodity_forecast_contract import _record


REPO = Path(__file__).resolve().parents[1]
COMMAND = (REPO / ".claude/commands/commodity/full.md").read_text(encoding="utf-8")
BLOCKS = list(re.finditer(r"```bash\n(.*?)\n```", COMMAND, re.DOTALL))
LEGACY = "# Macro Drivers — GOLD\n\n## 1. Driver Scorecard\nExisting direction-only report.\n"
RECONCILED = (
    "# Macro Drivers — GOLD\n\n## 1a. Attribution of the recent move\n"
    "RF-COMM-001: driver attribution reconciled — explained 14%, residual 86%\n"
)
INVALID = RECONCILED.replace("residual 86%", "residual 50%")


def block_containing(text: str) -> str:
    matches = [match.group(1) for match in BLOCKS if text in match.group(1)]
    assert len(matches) == 1, (text, len(matches))
    return matches[0]


class PipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "GOLD"
        self.module = self.root / "macro-positioning"
        self.module.mkdir(parents=True)
        self.report = self.module / "01_commodity-macro-drivers.md"
        self.pending = self.module / ".driver-attribution-pending"
        self.report.write_text(LEGACY, encoding="utf-8")
        self.sidecar = self.report.with_suffix(".signals.json")
        self.sidecar.write_text(json.dumps({
            "schema_version": 1, "owner_orb": "commodity-macro-drivers",
        }), encoding="utf-8")
        # Real archive CLI fixture, shared with the existing decision-contract tests.
        self.record = _record()
        graph = {
            "commodity": "GOLD", "generated_at": "2026-08-10T00:00:00Z",
            "coverage": {"complete": True},
            "summary": {"raw_signal_count": 2, "independent_cluster_count": 2,
                        "conviction_eligible_cluster_count": 2, "contradiction_count": 0},
            "records": [{"signal_id": f"{horizon}-signal",
                         "source_vintage_ids": ["sha256:" + "a" * 64]}
                        for horizon in ("tactical", "strategic")],
            "clusters": [{"cluster_id": f"{horizon}.cluster-1",
                          "signal_ids": [f"{horizon}-signal"]}
                         for horizon in ("tactical", "strategic")],
        }
        graph_bytes = (json.dumps(graph) + "\n").encode()
        (self.root / "signal_evidence.json").write_bytes(graph_bytes)
        self.record["signal_evidence"]["artifact_sha256"] = (
            "sha256:" + hashlib.sha256(graph_bytes).hexdigest()
        )
        self.projection = self.root / "decision_record.json"
        self.original_projection = (json.dumps(self.record) + "\n").encode()
        self.projection.write_bytes(self.original_projection)
        (self.root / "commodity_preflight_state.json").write_text(json.dumps({
            "schema_version": 1, "commodity": "GOLD", "decision_time": "2026-08-10T00:00:00Z",
            "previous_coverage_found": True, "profile_changed": False,
            "changed_need_ids": [], "removed_need_ids": [], "owner_orbs": [], "modules": [],
        }), encoding="utf-8")

    def shell(self, script: str, outcome: str = "REUSED") -> subprocess.CompletedProcess[str]:
        script = script.replace("<RUN_ROOT>", str(self.root))
        script = script.replace("<MACRO_DRIVERS_OUTCOME>", outcome)
        script = script.replace("<module>", "macro-positioning")
        script = script.replace("<deps of this module>", "")
        # No set -e: the embedded commands must stop explicitly before the next publication command.
        return subprocess.run(["bash", "-c", script], cwd=REPO, text=True, capture_output=True)

    def finish(self, outcome: str) -> subprocess.CompletedProcess[str]:
        relevant = [match.group(1) for match in BLOCKS if
                    "# RF-COMM-001 publication gate" in match.group(1)
                    or "commodity_decision_archive.py" in match.group(1)
                    # Keep the old gate executable for the red-before regression.
                    or ("commodity_driver_attribution.py" in match.group(1)
                        and "# RF-COMM-001" not in match.group(1))]
        self.assertEqual(len(relevant), 2)
        return self.shell("\n".join(relevant), outcome)

    def assert_unpublished(self) -> None:
        self.assertEqual(self.projection.read_bytes(), self.original_projection)
        self.assertFalse((self.root / "decisions").exists())

    def mark_dispatch(self) -> None:
        result = self.shell(block_containing("# RF-COMM-001 before actual Task dispatch"))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue(self.pending.is_file())

    def pending_validity(self) -> subprocess.CompletedProcess[str]:
        return self.shell(block_containing("# RF-COMM-001 pending specialist validity"))

    def test_failed_attribution_never_reaches_real_archive_or_projection(self) -> None:
        self.report.write_text(INVALID, encoding="utf-8")
        self.pending.touch()
        result = self.finish("DISPATCHED_VERIFIED")
        self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("GATE-FAIL:", result.stdout + result.stderr)
        self.assert_unpublished()
        self.assertTrue(self.pending.is_file())

    def test_no_synthesis_can_reuse_untouched_legacy_specialist(self) -> None:
        resume = self.shell(block_containing("# prints SKIP or RERUN:"))
        self.assertEqual(resume.stdout.strip(), "RERUN:no-synthesis", resume.stderr)
        valid = subprocess.run(["node", "scripts/agent-output-validity.mjs", str(self.report)],
                               cwd=REPO, text=True, capture_output=True)
        self.assertEqual(valid.returncode, 0, valid.stderr)
        sidecar = json.loads(self.sidecar.read_text())
        self.assertEqual((sidecar["schema_version"], sidecar["owner_orb"]),
                         (1, "commodity-macro-drivers"))
        old_bytes = self.report.read_bytes()
        result = self.finish("REUSED")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("not run (specialist reused; no pending verification)", result.stdout)
        self.assertIn("DECISION-ARCHIVE:", result.stdout)
        self.assertEqual(self.report.read_bytes(), old_bytes)
        self.assertFalse(self.pending.exists())

    def test_crash_after_marker_before_report_write_requires_exact_specialist(self) -> None:
        self.report.unlink()
        self.mark_dispatch()
        resume = self.shell(block_containing("# prints SKIP or RERUN:"))
        self.assertEqual(resume.stdout.strip(), "RERUN:driver-attribution-pending", resume.stderr)
        validity = self.pending_validity()
        self.assertEqual(validity.returncode, 1, validity.stdout + validity.stderr)
        self.assertNotEqual(self.finish("REUSED").returncode, 0)
        self.assert_unpublished()

    def test_failed_fresh_write_cannot_become_exempt_on_retry(self) -> None:
        self.mark_dispatch()
        self.report.write_text(LEGACY, encoding="utf-8")  # ordinary Markdown validity still passes
        self.assertEqual(self.pending_validity().returncode, 1)
        self.assertNotEqual(self.finish("REUSED").returncode, 0)
        self.assert_unpublished()
        # Retry selects this invalid specialist, recreates its report, then verifies before publication.
        self.mark_dispatch()
        self.report.write_text(RECONCILED, encoding="utf-8")
        self.assertEqual(self.pending_validity().returncode, 0)
        result = self.finish("DISPATCHED_VERIFIED")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("reconciled — explained 14%, residual 86%", result.stdout)
        self.assertIn("DECISION-ARCHIVE:", result.stdout)
        self.assertFalse(self.pending.exists())

    def test_verified_write_can_be_reused_after_crash_without_another_dispatch(self) -> None:
        self.mark_dispatch()
        self.report.write_text(RECONCILED, encoding="utf-8")
        self.assertEqual(self.pending_validity().returncode, 0)
        result = self.finish("REUSED")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("DECISION-ARCHIVE:", result.stdout)
        self.assertFalse(self.pending.exists())

    def test_not_attempted_keeps_its_honest_result(self) -> None:
        self.report.write_text(RECONCILED.replace(
            "reconciled — explained 14%, residual 86%", "not attempted — no sourced sensitivity"
        ), encoding="utf-8")
        self.mark_dispatch()
        result = self.finish("DISPATCHED_VERIFIED")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("not attempted — no sourced sensitivity", result.stdout)
        self.assertNotIn("reconciled", result.stdout)

    def test_failed_missing_and_unknown_dispatch_outcomes_cannot_publish(self) -> None:
        self.report.write_text(RECONCILED, encoding="utf-8")
        for outcome in ("FAILED", "NOT_REACHED", "DISPATCHED_PENDING", "", "RERUN:no-synthesis"):
            with self.subTest(outcome=outcome):
                result = self.finish(outcome)
                self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assert_unpublished()
        self.report.unlink()
        self.assertNotEqual(self.finish("DISPATCHED_VERIFIED").returncode, 0)
        self.assert_unpublished()

    def test_unsafe_pending_marker_stops_before_dispatch_or_publication(self) -> None:
        original_report = self.report.read_bytes()
        self.pending.symlink_to(self.report)
        before = self.shell(block_containing("# RF-COMM-001 before actual Task dispatch"))
        self.assertEqual(before.returncode, 2, before.stdout + before.stderr)
        self.assertEqual(self.pending_validity().returncode, 2)
        self.assertEqual(self.finish("REUSED").returncode, 2)
        self.assertEqual(self.report.read_bytes(), original_report)
        self.assertTrue(self.pending.is_symlink())
        self.assert_unpublished()


if __name__ == "__main__":
    unittest.main()
