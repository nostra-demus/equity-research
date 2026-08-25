#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import stat
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from memory_incident_control import (
    IncidentControlError,
    candidate_intake_guard,
    load_controls,
    mutate_controls,
    verify_controls,
)


class IncidentControlTests(unittest.TestCase):
    def test_controls_fail_safe_and_mutate_with_append_only_audit(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw) / "runtime"
            initial = load_controls(root)
            self.assertFalse(initial["global_disabled"])
            self.assertEqual(0, initial["revision"])

            disabled, audit_one = mutate_controls(
                root, operation="global-disable", actor="quarantine-service",
                now="2026-08-26T00:00:00Z",
            )
            self.assertTrue(disabled["global_disabled"])
            self.assertEqual(1, disabled["revision"])
            self.assertTrue(audit_one.is_file())
            self.assertEqual(0o600, stat.S_IMODE((root / "controls" / "runtime-controls.json").stat().st_mode))
            self.assertEqual(0o600, stat.S_IMODE(audit_one.stat().st_mode))

            enabled, audit_two = mutate_controls(
                root, operation="global-enable", actor="quarantine-service",
                now="2026-08-26T00:01:00Z",
            )
            self.assertFalse(enabled["global_disabled"])
            self.assertEqual(2, enabled["revision"])
            self.assertNotEqual(audit_one, audit_two)
            self.assertTrue(audit_one.exists(), "prior audit receipts are append-only")

    def test_layer_playbook_and_candidate_controls_are_exact(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw) / "runtime"
            mutate_controls(root, operation="layer-disable", layer="semantic", actor="ops")
            mutate_controls(root, operation="candidate-intake-disable", actor="ops")
            mutate_controls(
                root, operation="playbook-quarantine", playbook_id="memory-playbook-filing",
                version=2, reason="serious-evidence-error", actor="ops",
            )
            value, _ = mutate_controls(
                root, operation="playbook-pin", playbook_id="memory-playbook-filing",
                version=1, actor="ops",
            )
            self.assertEqual(["semantic"], value["disabled_layers"])
            self.assertTrue(value["candidate_intake_disabled"])
            self.assertEqual(2, value["disabled_playbooks"][0]["version"])
            self.assertEqual(1, value["pinned_playbooks"][0]["version"])

            value, _ = mutate_controls(
                root, operation="playbook-restore", playbook_id="memory-playbook-filing",
                version=2, actor="ops",
            )
            self.assertEqual([], value["disabled_playbooks"])
            value, _ = mutate_controls(root, operation="layer-enable", layer="semantic", actor="ops")
            self.assertEqual([], value["disabled_layers"])

    def test_tamper_symlink_and_open_shape_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw) / "runtime"
            value, _ = mutate_controls(root, operation="global-disable", actor="ops")
            path = root / "controls" / "runtime-controls.json"
            tampered = dict(value)
            tampered["global_disabled"] = False
            path.write_text(json.dumps(tampered), encoding="utf-8")
            os.chmod(path, 0o600)
            with self.assertRaisesRegex(IncidentControlError, "hash"):
                load_controls(root)
            with self.assertRaisesRegex(IncidentControlError, "closed shape"):
                verify_controls({**value, "unexpected": True})

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw) / "runtime"
            controls = root / "controls"
            controls.mkdir(parents=True, mode=0o700)
            target = Path(raw) / "outside.json"
            target.write_text("{}", encoding="utf-8")
            (controls / "runtime-controls.json").symlink_to(target)
            with self.assertRaises(Exception):
                load_controls(root)

    def test_candidate_intake_kill_switch_is_enforced_by_shared_guard(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw) / "runtime"
            mutate_controls(root, operation="candidate-intake-disable", actor="ops")
            with self.assertRaisesRegex(IncidentControlError, "disabled"):
                with candidate_intake_guard(root):
                    self.fail("disabled candidate intake entered its critical section")
            mutate_controls(root, operation="candidate-intake-enable", actor="ops")
            with candidate_intake_guard(root):
                pass
            receipts = list((root / "controls" / "candidate-batches").glob("*.json"))
            self.assertEqual(1, len(receipts))

    def test_concurrent_control_mutations_serialize_without_lost_updates(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw) / "runtime"
            with ThreadPoolExecutor(max_workers=2) as pool:
                futures = [
                    pool.submit(mutate_controls, root, operation="layer-disable", layer=layer, actor="ops")
                    for layer in ("semantic", "procedural")
                ]
                for future in futures:
                    future.result()
            value = load_controls(root)
            self.assertEqual(2, value["revision"])
            self.assertEqual(["procedural", "semantic"], value["disabled_layers"])
            self.assertEqual(2, len(list((root / "controls" / "audit").glob("*.json"))))


if __name__ == "__main__":
    unittest.main()
