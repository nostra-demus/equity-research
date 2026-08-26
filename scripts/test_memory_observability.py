#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from memory_observability import ObservabilityError, performance_observation, publish_performance, publish_readiness


class MemoryObservabilityTests(unittest.TestCase):
    def test_packet_bound_is_enforced_before_any_packet_is_read(self) -> None:
        with tempfile.TemporaryDirectory() as raw, patch("memory_observability.MAX_PACKETS", 1):
            root = Path(raw)
            os.chmod(root, 0o700)
            for agent in ("agent-a", "agent-b"):
                packet = root / "packet-cache" / "run" / agent / "packet.json"
                packet.parent.mkdir(parents=True, mode=0o700)
                packet.write_text("not-json", encoding="utf-8")
                os.chmod(packet, 0o600)
            with self.assertRaisesRegex(ObservabilityError, "exceeds its fixed bound"):
                performance_observation(root)

    def test_packet_metrics_are_bounded_content_free_and_conservative(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            os.chmod(root, 0o700)
            for index, elapsed in enumerate((40, 120, 90), 1):
                packet = root / "packet-cache" / "run" / f"agent-{index}" / "packet.json"
                packet.parent.mkdir(parents=True, mode=0o700)
                packet.write_text(json.dumps({
                    "schema": "memory-context-packet/v2",
                    "as_of_system_time": "2026-08-25T00:00:00Z",
                    "accounting": {"compile_milliseconds": elapsed},
                    "sections": {"protected": "MUST_NOT_APPEAR_IN_METRICS"},
                }))
                os.chmod(packet, 0o600)
            observation = performance_observation(
                root, evaluated_at=dt.datetime(2026, 8, 26, tzinfo=dt.timezone.utc),
            )
            self.assertEqual(3, observation["issuer_query_count"])
            self.assertEqual(120, observation["context_compilation_p95_millis"])
            self.assertEqual(120, observation["retrieval_p95_millis"])
            self.assertNotIn("sections", observation)
            output = publish_performance(
                root, evaluated_at=dt.datetime(2026, 8, 26, tzinfo=dt.timezone.utc),
            )
            self.assertEqual(0o600, output.stat().st_mode & 0o777)

    def test_invalid_packet_fails_the_complete_observation(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            os.chmod(root, 0o700)
            packet = root / "packet-cache" / "run" / "agent" / "packet.json"
            packet.parent.mkdir(parents=True, mode=0o700)
            packet.write_text(json.dumps({"schema": "memory-context-packet/v2"}))
            os.chmod(packet, 0o600)
            with self.assertRaisesRegex(ObservabilityError, "invalid"):
                performance_observation(root)

    def test_readiness_publisher_preserves_unmeasured_evidence_instead_of_inventing_it(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            os.chmod(root, 0o700)
            path = publish_readiness(
                state_root=root, evaluated_at="2026-08-26T00:00:00Z",
                phase0_baseline=str(repository / "frameworks" / "memory" / "phase0" / "baseline-report.json"),
            )
            report = json.loads(path.read_text())
            self.assertEqual("unmeasured", report["status"])
            self.assertEqual("unmeasured", report["operational_evidence"]["performance"]["status"])
            self.assertFalse(report["automation"]["scheduled_by_report"])


if __name__ == "__main__":
    unittest.main()
