#!/usr/bin/env python3
"""Tests for the runtime-owned provenance manifest and publication projection."""
from __future__ import annotations

import json
import hashlib
import sys
import tempfile
import unittest
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from execution_provenance import (  # noqa: E402
    MANIFEST_BASENAME,
    ProvenanceError,
    append_attempt,
    audit_repository,
    discover_artifacts,
    project,
    prior_projections,
    read_manifest,
    stamp_artifact,
    validate_projection,
    verify_artifact,
)


def attempt(attempt_id: str, provider: str, model: str, reasoning: str, **extra):
    value = {
        "schema_version": "1.0",
        "attempt_id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"nostra-test:{attempt_id}")),
        "provider": provider,
        "model": model,
        "reasoning_level": reasoning,
        "attribution": "recorded",
        "scope": ["specialists"],
    }
    value.update(extra)
    return value


class ExecutionProvenanceTest(unittest.TestCase):
    def test_single_provider_projection_and_stamp(self):
        rows = [
            attempt("a1", "codex", "gpt-5.6-terra", "xhigh", profile_key="codex-profile"),
            attempt("a2", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator",
                    scope=["master-synthesis"], profile_key="codex-profile", cli_version="codex 1.2"),
        ]
        value = project(rows)
        self.assertEqual(value["provider_mode"], "single_provider")
        self.assertEqual(value["profile_key"], "codex-profile")
        self.assertEqual(value["decision_author"]["attempt_id"], rows[1]["attempt_id"])
        self.assertEqual(value["contributors"][0]["model"], "gpt-5.6-sol")
        self.assertEqual(value["cli_versions"], {"codex": "codex 1.2"})
        with tempfile.TemporaryDirectory() as temporary:
            artifact = Path(temporary) / "decision_record.json"
            artifact.write_text('{"schema_version":"1.0","created_by":"synthesizer"}\n')
            self.assertTrue(stamp_artifact(artifact, value))
            self.assertFalse(stamp_artifact(artifact, value))
            verify_artifact(artifact, value)
            self.assertEqual(json.loads(artifact.read_text())["created_by"], "synthesizer")

    def test_mixed_resume_is_not_credited_to_terminal_provider(self):
        rows = [
            attempt("claude-attempt", "claude", "opus", "high", scope=["modules"]),
            attempt("claude-author", "claude", "opus", "high", role="terminal_adjudicator",
                    scope=["master-synthesis"]),
            attempt("codex-attempt", "codex", "gpt-5.6-sol", "max",
                    role="terminal_adjudicator", scope=["master-synthesis"]),
        ]
        value = project(rows)
        self.assertEqual(value["provider_mode"], "mixed_provider")
        self.assertEqual(value["decision_author"]["provider"], "codex")
        self.assertTrue(value["profile_key"].startswith("mixed|"))
        self.assertEqual({item["provider"] for item in value["contributors"]}, {"claude", "codex"})
        with tempfile.TemporaryDirectory() as temporary:
            artifact = Path(temporary) / "decision_record.json"
            earlier = project(rows[:2])
            artifact.write_text(json.dumps({"execution_provenance": earlier}))
            self.assertTrue(stamp_artifact(artifact, value, prior_projections(rows)))
            verify_artifact(artifact, value)

    def test_partial_observation_is_explicit(self):
        value = project([
            attempt("a1", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator"),
            {"schema_version": "1.0", "attempt_id": str(uuid.uuid5(uuid.NAMESPACE_URL, "nostra-test:a2")), "provider": "codex",
             "model": None, "reasoning_level": None, "attribution": "configured", "scope": "nested"},
        ])
        self.assertEqual(value["provider_mode"], "partially_observed")

        unknown_prior = attempt(
            "modern-unknown-prior", "codex", "gpt-5.6-sol", "max",
            role="terminal_adjudicator", prior_unobserved=True,
        )
        projected = project([unknown_prior])
        self.assertEqual(projected["provider_mode"], "partially_observed")
        self.assertEqual({row["provider"] for row in projected["contributors"]}, {"codex"})
        validate_projection(projected)

    def test_cross_provider_resume_remains_mixed_when_one_attempt_is_partial(self):
        value = project([
            {
                "schema_version": "1.0",
                "attempt_id": str(uuid.uuid5(uuid.NAMESPACE_URL, "nostra-test:partial-claude")),
                "provider": "claude",
                "model": None,
                "reasoning_level": None,
                "attribution": "configured",
                "scope": ["legacy-continuation"],
            },
            attempt(
                "codex-author",
                "codex",
                "gpt-5.6-sol",
                "max",
                role="terminal_adjudicator",
            ),
        ])
        self.assertEqual(value["provider_mode"], "mixed_provider")
        self.assertEqual(value["decision_author"]["provider"], "codex")

    def test_runtime_manifest_is_append_safe_and_only_current_attempt_publishes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            manifest = root / MANIFEST_BASENAME
            row = attempt("a1", "claude", "opus", "high", role="terminal_adjudicator",
                          decision_artifacts=["decision_record.json"])
            append_attempt(manifest, row)
            second = attempt("a2", "claude", "sonnet", "high")
            append_attempt(manifest, second)
            loaded = read_manifest(manifest)
            self.assertEqual([item["attempt_id"] for item in loaded],
                             [row["attempt_id"], second["attempt_id"]])
            (root / "decision_record.json").write_text("{}\n")
            self.assertEqual(discover_artifacts(manifest, loaded, []), [])
            terminal = attempt("a3", "claude", "opus", "high", role="terminal_adjudicator",
                               decision_artifacts=["decision_record.json"])
            append_attempt(manifest, terminal)
            self.assertEqual(discover_artifacts(manifest, read_manifest(manifest), []),
                             [(root / "decision_record.json").resolve()])

    def test_conditional_signal_artifact_is_stamped_only_when_it_exists(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            manifest = root / MANIFEST_BASENAME
            row = attempt(
                "signal", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator",
                decision_artifacts=["thesis_record.json"], decision_artifacts_optional=True,
            )
            append_attempt(manifest, row)
            loaded = read_manifest(manifest)
            self.assertEqual(discover_artifacts(manifest, loaded, []), [])
            thesis = root / "thesis_record.json"
            thesis.write_text("{}\n")
            self.assertEqual(discover_artifacts(manifest, loaded, []), [thesis.resolve()])

    def test_no_author_secrets_traversal_and_disagreement_fail_closed(self):
        with self.assertRaises(ProvenanceError):
            project([attempt("a1", "codex", "gpt-5.6-sol", "max")])
        with self.assertRaises(ProvenanceError):
            project([attempt("a1", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator",
                             access_token="secret")])
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            manifest = root / MANIFEST_BASENAME
            row = attempt("a1", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator",
                          decision_artifacts=["../escape.json"])
            append_attempt(manifest, row)
            with self.assertRaises(ProvenanceError):
                discover_artifacts(manifest, read_manifest(manifest), [])
            artifact = root / "decision_record.json"
            artifact.write_text(json.dumps({"execution_provenance": {"wrong": True}}))
            with self.assertRaises(ProvenanceError):
                stamp_artifact(artifact, project([attempt(
                    "a2", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator"
                )]))

        with self.assertRaises(ProvenanceError):
            project([attempt("a3", "other", "model", "max", role="terminal_adjudicator")])
        malformed = attempt("a4", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator")
        malformed["attempt_id"] = "not-a-uuid"
        with self.assertRaises(ProvenanceError):
            project([malformed])
        configured_author = attempt(
            "a5", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator",
            attribution="configured")
        with self.assertRaises(ProvenanceError):
            project([configured_author])
        malformed_optional = attempt(
            "a6", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator",
            decision_artifacts_optional="yes")
        with self.assertRaises(ProvenanceError):
            project([malformed_optional])

    def test_repository_rollout_gate_and_commodity_hash_order(self):
        provenance = project([attempt(
            "repo-audit", "codex", "gpt-5.6-sol", "max",
            role="terminal_adjudicator", scope=["master-synthesis"],
        )])
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            legacy = root / "analyses" / "LEGACY_2026-08-20" / "decision_record.json"
            legacy.parent.mkdir(parents=True)
            legacy.write_text(json.dumps({"decision_date": "2026-08-20"}) + "\n")
            inventory = root / "frameworks" / "execution_provenance_legacy_inventory.json"
            inventory.parent.mkdir(parents=True)
            inventory.write_text(json.dumps({
                "schema_version": "1.1",
                "rollout_cutoff": "2026-08-21T00:00:00Z",
                "mutable_legacy_projections": {},
                "records": {
                    legacy.relative_to(root).as_posix():
                        "sha256:" + hashlib.sha256(legacy.read_bytes()).hexdigest(),
                },
            }) + "\n")
            modern = root / "analyses" / "MODERN_2026-08-21" / "decision_record.json"
            modern.parent.mkdir(parents=True)
            modern.write_text(json.dumps({"decision_date": "2026-08-21"}) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "execution_provenance"):
                audit_repository(root)
            modern.write_text(json.dumps({
                "decision_date": "2026-08-21", "execution_provenance": provenance,
            }) + "\n")

            future_manifest = root / ".claude" / "agents" / "future" / "SWARM.md"
            future_manifest.parent.mkdir(parents=True)
            future_manifest.write_text("""---
id: future
run_root_template: future/runs/{SIG_ID}/current
decision_artifacts: [verdict.json]
---
""")
            commodity_manifest = root / ".claude" / "agents" / "commodity" / "SWARM.md"
            commodity_manifest.parent.mkdir(parents=True)
            commodity_manifest.write_text("""---
id: commodity
runs_root: commodity/runs
run_root_template: commodity/runs/{COMMODITY}
placeholder: COMMODITY
decision_artifacts: [decision_record.json]
---
""")
            future = root / "future" / "runs" / "X" / "current" / "verdict.json"
            future.parent.mkdir(parents=True)
            future.write_text(json.dumps({"decision_date": "2026-01-01"}) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "execution_provenance"):
                audit_repository(root)
            future.write_text(json.dumps({
                "decision_date": "2026-01-01", "execution_provenance": provenance,
            }) + "\n")

            from commodity_decision_archive import decision_id_for
            commodity = {
                "decision_date": "2026-08-21", "commodity": "TEST",
                "execution_provenance": provenance,
            }
            commodity["decision_id"] = decision_id_for(commodity)
            top = root / "commodity" / "runs" / "TEST" / "decision_record.json"
            archived = top.parent / "decisions" / commodity["decision_id"] / "decision_record.json"
            archived.parent.mkdir(parents=True)
            top.write_text(json.dumps(commodity) + "\n")
            archived.write_text(json.dumps(commodity) + "\n")
            counts = audit_repository(root)
            self.assertEqual(counts, {
                "records": 5, "legacy": 1, "required": 4, "commodity_hashed": 2,
            })
            duplicate = root / ".claude" / "agents" / "duplicate" / "SWARM.md"
            duplicate.parent.mkdir(parents=True)
            duplicate.write_text("""---
id: future
runs_root: duplicate
run_root_template: duplicate/{SIG_ID}
decision_artifacts: [verdict.json]
---
""")
            with self.assertRaisesRegex(ProvenanceError, "duplicate/reserved"):
                audit_repository(root)
            duplicate.unlink()
            malformed = root / ".claude" / "agents" / "malformed" / "SWARM.md"
            malformed.parent.mkdir(parents=True)
            malformed.write_text("""---
id: malformed
runs_root: malformed
run_root_template: malformed/{SIG_ID}
decision_artifacts: [/escape.json]
---
""")
            with self.assertRaisesRegex(ProvenanceError, "unsafe decision artifact"):
                audit_repository(root)
            malformed.unlink()
            tampered = dict(commodity)
            tampered["execution_provenance"] = dict(provenance, profile_key="forged-profile")
            top.write_text(json.dumps(tampered) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "does not hash"):
                audit_repository(root)
            top.write_text(json.dumps(commodity) + "\n")
            legacy.write_text(json.dumps({"decision_date": "2026-08-20", "changed": True}) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "legacy terminal record changed"):
                audit_repository(root)

    def test_repository_audit_accepts_valid_append_only_metadata_recovery(self):
        row = attempt("recovered", "codex", "gpt-5.6-sol", "max", role="terminal_adjudicator")
        provenance = project([row])
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            inventory = root / "frameworks" / "execution_provenance_legacy_inventory.json"
            inventory.parent.mkdir(parents=True)
            inventory.write_text(json.dumps({
                "schema_version": "1.1", "rollout_cutoff": "2026-08-21T00:00:00Z",
                "mutable_legacy_projections": {}, "records": {},
            }) + "\n")
            artifact = root / "analyses" / "RECOVERED_2026-09-01" / "decision_record.json"
            artifact.parent.mkdir(parents=True)
            frozen = json.dumps({"decision_date": "2026-09-01", "confidence_score": 53}) + "\n"
            artifact.write_text(frozen)
            (artifact.parent / "corrections.json").write_text(json.dumps({
                "schema": "corrections/v1",
                "metadata_recovery": {
                    "reason": "omitted at publication", "evidence": "exact runtime transcript",
                    "post_review_confidence_score": 47, "confidence_haircut": 6,
                    "execution_provenance": provenance,
                    "runtime_evidence": {"source": "codex_task_runtime", "attempts": [row]},
                },
                "errata": [],
            }) + "\n")
            self.assertEqual(audit_repository(root), {
                "records": 1, "legacy": 0, "required": 1, "commodity_hashed": 0,
            })
            self.assertEqual(artifact.read_text(), frozen)

    def test_mutable_legacy_commodity_projection_preserves_then_replaces_its_archive(self):
        provenance = project([attempt(
            "commodity-rollover", "codex", "gpt-5.6-sol", "max",
            role="terminal_adjudicator", scope=["commodity-thesis"],
        )])
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            manifest = root / ".claude" / "agents" / "commodity" / "SWARM.md"
            manifest.parent.mkdir(parents=True)
            manifest.write_text("""---
id: commodity
runs_root: commodity/runs
run_root_template: commodity/runs/{COMMODITY}
placeholder: COMMODITY
decision_artifacts: [decision_record.json]
---
""")
            legacy_record = {"decision_date": "2026-07-01", "commodity": "TEST"}
            top = root / "commodity" / "runs" / "TEST" / "decision_record.json"
            legacy_archive = (
                root / "frameworks" / "execution_provenance_legacy_snapshots"
                / "commodity" / "TEST" / "decision_record.json"
            )
            top.parent.mkdir(parents=True)
            legacy_archive.parent.mkdir(parents=True)
            legacy_bytes = (json.dumps(legacy_record) + "\n").encode()
            top.write_bytes(legacy_bytes)
            legacy_archive.write_bytes(legacy_bytes)
            digest = "sha256:" + hashlib.sha256(legacy_bytes).hexdigest()
            inventory = root / "frameworks" / "execution_provenance_legacy_inventory.json"
            inventory.parent.mkdir(parents=True, exist_ok=True)
            inventory.write_text(json.dumps({
                "schema_version": "1.1",
                "rollout_cutoff": "2026-08-21T00:00:00Z",
                "records": {legacy_archive.relative_to(root).as_posix(): digest},
                "mutable_legacy_projections": {
                    top.relative_to(root).as_posix(): {
                        "archive": legacy_archive.relative_to(root).as_posix(),
                        "sha256": digest,
                    },
                },
            }) + "\n")
            self.assertEqual(audit_repository(root), {
                "records": 2, "legacy": 2, "required": 0, "commodity_hashed": 0,
            })

            from commodity_decision_archive import decision_id_for
            current = {
                "decision_date": "2026-08-28", "commodity": "TEST",
                "execution_provenance": provenance,
            }
            current["decision_id"] = decision_id_for(current)
            top.write_text(json.dumps(current) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "no matching immutable archive"):
                audit_repository(root)
            current_archive = top.parent / "decisions" / current["decision_id"] / "decision_record.json"
            current_archive.parent.mkdir(parents=True)
            current_archive.write_bytes(top.read_bytes())
            self.assertEqual(audit_repository(root), {
                "records": 3, "legacy": 1, "required": 2, "commodity_hashed": 2,
            })
            legacy_archive.write_text(json.dumps({**legacy_record, "tampered": True}) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "legacy terminal record changed"):
                audit_repository(root)

            inventory_data = json.loads(inventory.read_text())
            inventory_data["records"]["frameworks/unrelated.json"] = digest
            inventory.write_text(json.dumps(inventory_data) + "\n")
            with self.assertRaisesRegex(ProvenanceError, "missing/stale"):
                audit_repository(root)

    def test_legacy_projection_rollback_after_modern_archive_is_rejected(self):
        """A refreshed commodity may not silently roll its top-level projection back to legacy bytes.

        Once a modern decision is archived under the run's decisions/ directory, reverting the mutable
        top-level decision_record.json to its pre-rollout inventoried bytes leaves the cockpit reading a
        stale decision while a newer immutable archive exists. The audit must reject that rollback rather
        than count the reverted projection as legacy. Expected behaviour pinned to the archive invariant
        in this PR's design note (a replacement carries modern provenance; the legacy exemption holds only
        while no archive exists), not to prior code behaviour.
        """
        provenance = project([attempt(
            "commodity-rollover", "codex", "gpt-5.6-sol", "max",
            role="terminal_adjudicator", scope=["commodity-thesis"],
        )])
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            manifest = root / ".claude" / "agents" / "commodity" / "SWARM.md"
            manifest.parent.mkdir(parents=True)
            manifest.write_text("""---
id: commodity
runs_root: commodity/runs
run_root_template: commodity/runs/{COMMODITY}
placeholder: COMMODITY
decision_artifacts: [decision_record.json]
---
""")
            legacy_record = {"decision_date": "2026-07-01", "commodity": "TEST"}
            top = root / "commodity" / "runs" / "TEST" / "decision_record.json"
            legacy_archive = (
                root / "frameworks" / "execution_provenance_legacy_snapshots"
                / "commodity" / "TEST" / "decision_record.json"
            )
            top.parent.mkdir(parents=True)
            legacy_archive.parent.mkdir(parents=True)
            legacy_bytes = (json.dumps(legacy_record) + "\n").encode()
            top.write_bytes(legacy_bytes)
            legacy_archive.write_bytes(legacy_bytes)
            digest = "sha256:" + hashlib.sha256(legacy_bytes).hexdigest()
            inventory = root / "frameworks" / "execution_provenance_legacy_inventory.json"
            inventory.parent.mkdir(parents=True, exist_ok=True)
            inventory.write_text(json.dumps({
                "schema_version": "1.1",
                "rollout_cutoff": "2026-08-21T00:00:00Z",
                "records": {legacy_archive.relative_to(root).as_posix(): digest},
                "mutable_legacy_projections": {
                    top.relative_to(root).as_posix(): {
                        "archive": legacy_archive.relative_to(root).as_posix(),
                        "sha256": digest,
                    },
                },
            }) + "\n")

            from commodity_decision_archive import decision_id_for
            current = {
                "decision_date": "2026-08-28", "commodity": "TEST",
                "execution_provenance": provenance,
            }
            current["decision_id"] = decision_id_for(current)
            top.write_text(json.dumps(current) + "\n")
            current_archive = top.parent / "decisions" / current["decision_id"] / "decision_record.json"
            current_archive.parent.mkdir(parents=True)
            current_archive.write_bytes(top.read_bytes())
            # Baseline: the refreshed state audits clean.
            self.assertEqual(audit_repository(root), {
                "records": 3, "legacy": 1, "required": 2, "commodity_hashed": 2,
            })

            # Roll the top-level projection back to the pre-rollout legacy bytes while the modern archive
            # still exists. Pre-fix this was waved through as legacy; it must now be rejected.
            top.write_bytes(legacy_bytes)
            with self.assertRaisesRegex(ProvenanceError, "reverted to pre-rollout bytes after a modern archive"):
                audit_repository(root)

if __name__ == "__main__":
    unittest.main()
