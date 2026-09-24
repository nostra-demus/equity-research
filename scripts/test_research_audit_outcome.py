#!/usr/bin/env python3
"""Synthetic finalization regressions; no provider calls or production writes."""
import json
from pathlib import Path
import tempfile
import unittest

from create_idea_projection_manifest import create, decision_digest, file_digest, validate_manifest
from research_audit_outcome import run, REPAIR, STABILIZE


class AuditOutcomeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = self.tmp.name
        self.root = "analyses/TEST_2026-09-24"
        self.path = Path(self.repo) / self.root
        self.path.mkdir(parents=True)
        self.write("decision_record.json", {"run_root": self.root, "ticker": "TEST", "decision_date": "2026-09-24",
            "decision": "Watchlist", "basket": "Watchlist", "confidence_score": 42,
            "pre_mortem_verdict": "Survives", "confidence_haircut": 0, "post_review_confidence_score": 42})
        (self.path / "final_thesis.md").write_text("# TEST thesis\n\nOriginal analysis.\n")
        self.audit()

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, name, value):
        (self.path / name).write_text(json.dumps(value, indent=2) + "\n")

    def read(self, name):
        return json.loads((self.path / name).read_text())

    def audit(self, version=1, verdict="Material issues", confidence=37, integrity=56):
        # Test-only auditor simulation: production never changes hashes in an existing audit.
        identity = {"schema_version": "1.0", "ticker": "TEST", "run_root": self.root,
                    "final_thesis_path": self.root + "/final_thesis.md",
                    "decision_record_path": self.root + "/decision_record.json",
                    **run(self.root, "hashes", self.repo)}
        at = "2026-09-24T12:00:00Z"
        docs = {
            "verification_report": {**identity, "verified_at": at, "verifier": "verify-evidence", "verdict": verdict,
                "integrity_score": integrity, "blocking_findings": [] if verdict in {"Clean", "Minor issues"} else ["Missing aggregate builds"]},
            "pre_mortem": {**identity, "performed_at": at, "auditor": "pre-mortem", "verdict": "Survives with haircut",
                "survives": True, "original_confidence": 42, "recommended_confidence": confidence,
                "confidence_haircut": 42-confidence, "recommended_rating_cap": ""},
            "expectations_gap": {**identity, "performed_at": at, "analyst": "expectations-gap",
                "variant_perception_quality": "Weak", "is_exploitable": False, "edge_score": 25},
        }
        for name, doc in docs.items():
            self.write(name + (f"_v{version}" if version > 1 else "") + ".json", doc)

    def test_visa_stale_confidence_cannot_seal(self):
        with self.assertRaisesRegex(ValueError, "not propagated"):
            create(self.root, self.repo)
        self.assertEqual(run(self.root, "apply", self.repo)["status"], "changed")
        self.assertEqual(self.read("decision_record.json")["post_review_confidence_score"], 37)
        self.assertEqual(self.read("decision_record.json")["confidence_score"], 42)
        with self.assertRaisesRegex(ValueError, "final pinned"):
            create(self.root, self.repo)
        self.audit(version=2)
        self.assertEqual(run(self.root, "check", self.repo)["status"], "reconciled")
        manifest = create(self.root, self.repo)
        self.assertEqual(manifest["schema_version"], "idea-projection-manifest/v2")
        self.assertTrue(validate_manifest(manifest, str(self.path), self.root))
        self.assertEqual(self.read("decision_record.json")["integrity_gate"]["status"], "provisional")

    def test_runtime_stamp_does_not_invalidate_analytical_audit(self):
        run(self.root, "apply", self.repo)
        self.audit(version=2)
        manifest = create(self.root, self.repo)
        decision = self.read("decision_record.json")
        decision["execution_provenance"] = {"source": "test runtime stamp"}
        self.write("decision_record.json", decision)
        self.assertTrue(validate_manifest(manifest, str(self.path), self.root))
        decision["post_review_confidence_score"] = 99
        self.write("decision_record.json", decision)
        self.assertFalse(validate_manifest(manifest, str(self.path), self.root))

    def test_repair_budget_does_not_reset_on_new_audit(self):
        self.assertEqual(run(self.root, "claim-repair", self.repo)["status"], "repair_authorized")
        self.audit(version=2)
        with self.assertRaisesRegex(ValueError, "already consumed"):
            run(self.root, "claim-repair", self.repo)
        self.assertTrue((self.path / REPAIR).exists())

    def test_reconciliation_is_idempotent_and_drift_is_bounded(self):
        run(self.root, "apply", self.repo)
        self.audit(version=2)
        self.assertEqual(run(self.root, "apply", self.repo)["status"], "reconciled")
        self.audit(version=3, confidence=35)
        with self.assertRaisesRegex(ValueError, "not propagated"):
            run(self.root, "check", self.repo)
        with self.assertRaisesRegex(ValueError, "already consumed"):
            run(self.root, "apply", self.repo)
        self.assertTrue((self.path / STABILIZE).exists())

    def test_harmless_integrity_rescore_does_not_force_another_write(self):
        self.audit(verdict="Clean", integrity=92)
        run(self.root, "apply", self.repo)
        self.audit(version=2, verdict="Clean", integrity=94)
        self.assertEqual(run(self.root, "check", self.repo)["status"], "reconciled")

    def test_sealed_missing_stale_and_symlink_inputs_fail_closed(self):
        self.write("idea_admission.json", {"status": "not_applicable"})
        with self.assertRaisesRegex(ValueError, "sealed"):
            run(self.root, "apply", self.repo)
        (self.path / "idea_admission.json").unlink()
        (self.path / "expectations_gap.json").unlink()
        with self.assertRaisesRegex(ValueError, "missing"):
            run(self.root, "check", self.repo)
        self.audit()
        target = self.path / "decision_record.json"
        target.rename(self.path / "old.json")
        target.symlink_to("old.json")
        with self.assertRaisesRegex(ValueError, "regular files"):
            run(self.root, "apply", self.repo)

    def test_rating_caps_and_baskets_are_propagated(self):
        from research_audit_outcome import outcome
        decision = self.read("decision_record.json")
        decision.update(decision="Buy", basket="Selected")
        audits = {"pre_mortem": self.read("pre_mortem.json"), "expectations_gap": self.read("expectations_gap.json")}
        for cap, expected, basket in [("cap at Avoid", "Avoid", "Rejected"),
                                      ("Watchlist", "Watchlist", "Watchlist"),
                                      ("Insufficient Data — Refuse To Rate", "Insufficient Data — Refuse To Rate", "Insufficient Data")]:
            audits["pre_mortem"]["recommended_rating_cap"] = cap
            fields = outcome(decision, audits)
            self.assertEqual((fields["post_mortem_decision"], fields["post_mortem_basket"]), (expected, basket))
        audits["pre_mortem"]["recommended_rating_cap"] = "perhaps Avoid if growth slows"
        with self.assertRaisesRegex(ValueError, "canonical rating cap"):
            outcome(decision, audits)

    def test_pair_without_hedge_keeps_watchlist_basket(self):
        from research_audit_outcome import outcome
        decision = self.read("decision_record.json")
        decision.update(decision="Pair Trade / Hedge Required", basket="Watchlist")
        audits = {"pre_mortem": self.read("pre_mortem.json"), "expectations_gap": self.read("expectations_gap.json")}
        self.assertEqual(outcome(decision, audits)["post_mortem_basket"], "Watchlist")

    def test_clean_final_audit_replaces_only_its_own_old_warning(self):
        from research_audit_outcome import reconcile
        decision = self.read("decision_record.json")
        old = "verify-evidence verdict = Material issues"
        decision["integrity_gate"] = {"status": "provisional", "violations": [old]}
        audits = {"pre_mortem": self.read("pre_mortem.json"), "expectations_gap": self.read("expectations_gap.json"),
                  "verification": {**self.read("verification_report.json"), "verdict": "Clean"}}
        for extra in ([], ["Scenario arithmetic mismatch"]):
            decision["integrity_gate"]["violations"] = [old] + extra
            thesis = "> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue**\n> " + "; ".join([old]+extra) + "\n>\n> Resolve.\n\n# TEST"
            revised, body = reconcile(decision, thesis, audits)
            self.assertEqual(revised["integrity_gate"]["violations"], extra)
            self.assertEqual(revised["integrity_gate"]["status"], "provisional" if extra else "pass")
            self.assertNotIn(old, body)
            self.assertEqual("PROVISIONAL" in body, bool(extra))

    def test_malformed_json_types_cannot_seal(self):
        from research_audit_outcome import assert_reconciled, reconcile
        decision = self.read("decision_record.json")
        audits = {"pre_mortem": self.read("pre_mortem.json"), "expectations_gap": self.read("expectations_gap.json"),
                  "verification": self.read("verification_report.json")}
        decision, thesis = reconcile(decision, "# TEST", audits)
        hidden = "<!-- PROVISIONAL — the automated finish-gate -->\n" + thesis[thesis.index("<!-- research-review:start -->"):]
        with self.assertRaisesRegex(ValueError, "canonical leading warning"):
            assert_reconciled(decision, hidden, audits)
        decision["post_review_is_exploitable"] = 0
        with self.assertRaisesRegex(ValueError, "not propagated"):
            assert_reconciled(decision, thesis, audits)

    def test_baseline_cannot_compound_previous_haircut(self):
        pm = self.read("pre_mortem.json")
        pm.update(original_confidence=37, recommended_confidence=32, confidence_haircut=5)
        self.write("pre_mortem.json", pm)
        with self.assertRaisesRegex(ValueError, "original decision confidence"):
            run(self.root, "apply", self.repo)


if __name__ == "__main__":
    unittest.main()
