#!/usr/bin/env python3
"""Adversarial tests for the fail-closed provider analytical-parity gate."""

from __future__ import annotations

import copy
import hashlib
import http.server
import json
import os
import tempfile
import threading
import unittest
from pathlib import Path
from unittest import mock

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from compare_provider_runs import (  # noqa: E402
    ADJUDICATION_SCHEMA_VERSION, EXIT_ADJUDICATION_REQUIRED, EXIT_INPUT_ERROR,
    EXIT_PASS, EXIT_PROVIDER_DEFECT, ParityInputError, compare_run_roots,
    _validate_locator, issue_adjudication_execution_receipt, resolve_artifact,
)
from provider_parity_freeze import digest_file  # noqa: E402
from test_provider_parity_freeze import Fixture  # noqa: E402


def read_record(root: Path) -> dict:
    return json.loads((root / "decision_record.json").read_text(encoding="utf-8"))


def write_record(root: Path, record: dict) -> None:
    (root / "decision_record.json").write_text(json.dumps(record), encoding="utf-8")


def release_fixture(root: Path) -> Fixture:
    fixture = Fixture(root.resolve()); fixture.build(); fixture.finish(); return fixture


def compare_fixture(fixture: Fixture, **kwargs):
    return compare_run_roots(
        fixture.claude, fixture.codex,
        supervisor_receipt_loader=fixture.load_supervisor_rows,
        **kwargs,
    )


class FakeSupervisor:
    def __init__(self, root: Path):
        self.root = root; self.token = "supervisor-token"; self.issued: dict[str, dict] = {}
        self.manifest = root / "supervisor-canonical.jsonl"
        self.attempt_row = {"event": "attempt_started", "attribution": "recorded",
            "attempt_id": "33333333-3333-4333-8333-333333333333", "provider": "codex",
            "model": "gpt-5.6-sol", "reasoning_level": "max", "profile_key": "codex|sol:max",
            "started_at": "2026-08-21T10:00:00Z"}
        self.manifest.write_text(json.dumps(self.attempt_row) + "\n", encoding="utf-8")
        owner = self

        class Handler(http.server.BaseHTTPRequestHandler):
            def log_message(self, *_args): pass
            def do_POST(self):
                if self.headers.get("X-Nostra-Publication-Token") != owner.token:
                    self.send_response(403); self.end_headers(); self.wfile.write(b'{"error":"stale token"}'); return
                try:
                    length = int(self.headers.get("Content-Length", "0"))
                    payload = json.loads(self.rfile.read(length))
                    if payload.get("phase") == "attest":
                        comparison = owner.request_path(payload.get("comparisonArtifact"), must_exist=True)
                        freeze = owner.request_path(payload.get("freezeReceipt"), must_exist=True)
                        output = owner.request_path(payload.get("receiptOutput"), must_exist=False)
                        comparison_value = json.loads(comparison.read_text(encoding="utf-8"))  # lgtm[py/path-injection]
                        freeze_value = json.loads(freeze.read_text(encoding="utf-8"))  # lgtm[py/path-injection]
                        keys = ("attempt_id", "provider", "model", "reasoning_level", "profile_key", "started_at")
                        attempt = {key: owner.attempt_row[key] for key in keys}
                        attempt.update({"kind": "parity", "role": "terminal_adjudicator", "decision_author": True})
                        paired = []
                        for index, (label, provider) in enumerate((("run_a", "claude"), ("run_b", "codex")), 1):
                            run_id = f"{index}{index}{index}{index}{index}{index}{index}{index}-1111-4111-8111-111111111111"
                            paired.append({"label": label, "run_id": run_id, "run_root": str(owner.root / label),
                                "provider": provider, "attempt_id": run_id, "attempt_sha256": "sha256:" + "1" * 64,
                                "manifest_sha256": "sha256:" + "2" * 64,
                                "terminal_artifacts": [{"path": f"{label}/decision_record.json", "sha256": "sha256:" + "3" * 64}],
                                "supervisor_instance_id": "aaaaaaaa-1111-4111-8111-111111111111",
                                "pair_registration_id": "bbbbbbbb-1111-4111-8111-111111111111"})
                        receipt = {"schema_version": "provider-parity-adjudication-execution/1.0",
                            "issued_at": "2026-08-21T10:01:00Z", "comparison_id": comparison_value["comparison_id"],
                            "comparison_artifact": {"path": str(comparison), "sha256": digest_file(comparison)},
                            "freeze_receipt": {"path": str(freeze), "sha256": digest_file(freeze),
                                "receipt_sha256": freeze_value["receipt_sha256"]}, "attempt": attempt,
                            "runtime_provenance": {"manifest_path": str(owner.manifest),
                                "manifest_sha256": digest_file(owner.manifest), "attempt_locator": "jsonl:1",
                                "attempt_sha256": "sha256:" + hashlib.sha256(json.dumps(owner.attempt_row,
                                    sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
                                "paired_canaries": paired}}
                        output.write_text(json.dumps(receipt, sort_keys=True) + "\n", encoding="utf-8")  # lgtm[py/path-injection]
                        output.chmod(0o444)
                        owner.issued[str(output)] = {"receipt": digest_file(output), "comparison": digest_file(comparison),
                                                     "freeze": digest_file(freeze), "manifest": digest_file(owner.manifest)}
                        result = {"ok": True, "phase": "attest", "receiptPath": str(output),
                                  "receiptSha256": digest_file(output), "attempt": attempt}
                    elif payload.get("phase") == "verify-attestation":
                        output = owner.request_path(payload.get("receiptOutput"), must_exist=True)
                        issued = owner.issued.get(str(output))
                        receipt = json.loads(output.read_text(encoding="utf-8")) if issued else {}  # lgtm[py/path-injection]
                        valid = bool(issued) and digest_file(output) == issued["receipt"] \
                            and digest_file(owner.request_path(receipt["comparison_artifact"]["path"], must_exist=True)) == issued["comparison"] \
                            and digest_file(owner.request_path(receipt["freeze_receipt"]["path"], must_exist=True)) == issued["freeze"] \
                            and digest_file(owner.manifest) == issued["manifest"]
                        if not valid: raise ValueError("stale attestation")
                        result = {"ok": True, "phase": "verify-attestation", "receiptPath": str(output),
                                  "receiptSha256": issued["receipt"]}
                    else: raise ValueError("bad phase")
                    body = json.dumps(result).encode(); self.send_response(200)
                except Exception as exc:
                    body = json.dumps({"error": str(exc)}).encode(); self.send_response(409)
                self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(body)))
                self.end_headers(); self.wfile.write(body)

        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)

    def request_path(self, value: object, *, must_exist: bool) -> Path:
        if not isinstance(value, str) or not value:
            raise ValueError("invalid supervisor fixture path")
        # The fake supervisor models the production endpoint's allowlist. Never turn an HTTP
        # request value into a pathname: select one of the fixture-owned paths first, then inspect
        # that trusted Path object. This also keeps the security test itself free of path injection.
        allowed = {
            str(self.root / "comparison.json"): self.root / "comparison.json",
            str(self.root / "execution.json"): self.root / "execution.json",
            str(self.root / "freeze.json"): self.root / "freeze.json",
        }
        raw = allowed.get(value)
        if raw is None:
            raise ValueError("supervisor fixture path is not allowlisted")
        if must_exist:
            candidate = raw.resolve(strict=True)
            info = candidate.stat()
            if raw.is_symlink() or not candidate.is_file() or info.st_nlink != 1:
                raise ValueError("supervisor fixture input is not one regular file")
        else:
            candidate = self.root / "execution.json"
            if candidate.exists() or candidate.is_symlink():
                raise ValueError("supervisor fixture output already exists")
        return candidate

    def __enter__(self): self.thread.start(); return self
    def __exit__(self, *_args): self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=2)
    @property
    def env(self):
        return {"NOSTRA_COCKPIT_RUN": "1", "NOSTRA_PUBLICATION_ENDPOINT":
                f"http://127.0.0.1:{self.server.server_port}/publication",
                "NOSTRA_PUBLICATION_TOKEN": self.token,
                "NOSTRA_PROVENANCE_MANIFEST": "/tmp/forged-child-manifest-is-ignored"}


class CompareProviderRunsTest(unittest.TestCase):
    def test_release_command_uses_live_supervisor_rows_for_initial_and_final_pass(self):
        command = (Path(__file__).resolve().parents[1] / ".claude/commands/research/provider-parity.md").read_text(
            encoding="utf-8")
        self.assertEqual(command.count("--live-supervisor-receipts"), 2,
                         "both no-git initial comparison and final adjudicated pass need live receipt rows")
        self.assertIn("comparison, execution receipt, and adjudication template", command)

    def test_release_rehashes_every_file_and_exact_set(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            (fixture.snapshot / "price.json").write_text('{"close":101}\n', encoding="utf-8")
            with self.assertRaisesRegex(ParityInputError, "files changed"):
                compare_fixture(fixture,
                    freeze_manifest_path=fixture.freeze, require_freeze_manifest=True)
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            (fixture.snapshot / "late.txt").write_text("retroactive input", encoding="utf-8")
            with self.assertRaisesRegex(ParityInputError, "exact file set"):
                compare_fixture(fixture,
                    freeze_manifest_path=fixture.freeze, require_freeze_manifest=True)

    def test_tampered_binding_and_supervisor_snapshot_attestation_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary)); binding = fixture.codex / ".provider-parity-input.json"
            value = json.loads(binding.read_text(encoding="utf-8")); value["expected_model"] = "other"
            binding.chmod(0o644); binding.write_text(json.dumps(value), encoding="utf-8")
            with self.assertRaisesRegex(ParityInputError, "binding"):
                compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            row = fixture.supervisor_rows[str(fixture.codex.resolve())][0]
            row["parity_publication"]["snapshot_sha256"] = "sha256:" + "0" * 64
            with self.assertRaisesRegex(ParityInputError, "publication snapshot"):
                compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            row = fixture.supervisor_rows[str(fixture.claude.resolve())][0]
            row["parity_prelaunch"]["snapshot_prelaunch_sha256"] = "sha256:" + "0" * 64
            with self.assertRaisesRegex(ParityInputError, "prelaunch attestation"):
                compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            row = fixture.supervisor_rows[str(fixture.codex.resolve())][0]
            other_registration = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
            row["parity_prelaunch"]["pair_registration_id"] = other_registration
            row["parity_publication"]["pair_registration_id"] = other_registration
            with self.assertRaisesRegex(ParityInputError, "one live supervisor pair registration"):
                compare_fixture(fixture, freeze_manifest_path=fixture.freeze)

    def test_child_authored_provenance_cannot_replace_a_committed_supervisor_receipt(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            for run in (fixture.claude, fixture.codex):
                (run / ".execution-provenance.jsonl").write_text(
                    json.dumps({"event": "attempt_started", "attribution": "recorded",
                                "attempt_id": read_record(run)["execution_provenance"]["decision_author"]["attempt_id"]}) + "\n",
                    encoding="utf-8",
                )
            with self.assertRaisesRegex(ParityInputError, "committed supervisor attempt"):
                compare_run_roots(
                    fixture.claude, fixture.codex, freeze_manifest_path=fixture.freeze,
                    require_freeze_manifest=True, supervisor_receipt_loader=lambda _root: [],
                )

    def test_missing_each_required_surface_is_a_non_adjudicatable_blocker(self):
        mutations = {
            "decision": lambda r: r.pop("decision"), "rating_cap": lambda r: r.pop("rating_cap"),
            "conviction": lambda r: r.pop("conviction"),
            "data_sufficiency": lambda r: r.pop("data_sufficiency_score"),
            "expected_return": lambda r: r.pop("expected_return_pct"),
            "scenarios": lambda r: r.update(scenarios=[]),
            "module_scores": lambda r: r.update(module_scores={}),
            "critical_high_red_flags": lambda r: r.pop("red_flags"),
            "killer_risk": lambda r: r.pop("killer_risk"),
            "missing_data": lambda r: r.pop("missing_data"),
            "variant_perception": lambda r: r.pop("variant_perception_summary"),
            "forecast_ledger": lambda r: r.update(forecast_ledger=[]),
        }
        for surface, mutate in mutations.items():
            with self.subTest(surface=surface), tempfile.TemporaryDirectory() as temporary:
                fixture = release_fixture(Path(temporary)); record = read_record(fixture.codex); mutate(record)
                write_record(fixture.codex, record)
                report, code = compare_fixture(fixture,
                    freeze_manifest_path=fixture.freeze, require_freeze_manifest=True)
                self.assertEqual(code, EXIT_PROVIDER_DEFECT, report)
                self.assertIn(surface, {item["surface"] for item in report["deterministic_blockers"]})
                self.assertTrue(report["adjudication_contract"]["deterministic_blockers_are_not_adjudicatable"])

    def test_empty_container_shells_do_not_satisfy_required_analytical_surfaces(self):
        mutations = {
            "killer_risk": lambda r: r.update(killer_risk={"risk": "  "}),
            "variant_perception": lambda r: r.update(variant_perception_summary={"edge": []}),
            "forecast_ledger": lambda r: r.update(forecast_ledger=[{}]),
        }
        for surface, mutate in mutations.items():
            with self.subTest(surface=surface), tempfile.TemporaryDirectory() as temporary:
                fixture = release_fixture(Path(temporary)); record = read_record(fixture.codex); mutate(record)
                write_record(fixture.codex, record)
                report, code = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
                self.assertEqual(code, EXIT_PROVIDER_DEFECT, report)
                self.assertIn(surface, {item["surface"] for item in report["deterministic_blockers"]})

    def test_probability_return_expected_return_and_target_math_block(self):
        mutations = (
            lambda r: r["scenarios"][0].update(probability=24),
            lambda r: r["scenarios"][0].update(return_pct=-19),
            lambda r: r.update(expected_return_pct=8),
            lambda r: r["scenarios"][1].update(price_target=106),
        )
        for mutate in mutations:
            with self.subTest(mutation=mutate), tempfile.TemporaryDirectory() as temporary:
                fixture = release_fixture(Path(temporary)); record = read_record(fixture.codex); mutate(record)
                write_record(fixture.codex, record)
                report, code = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
                self.assertEqual(code, EXIT_PROVIDER_DEFECT, report)
                self.assertIn("scenario_math", {item["surface"] for item in report["deterministic_blockers"]})

    def test_short_candidate_target_math_uses_short_side_return(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary))
            for run in (fixture.claude, fixture.codex):
                record = read_record(run); record["decision"] = "Short Candidate"
                record["rating_cap"] = "Short Candidate"
                record["scenarios"] = [
                    {"label": "squeeze", "probability": 25, "price_target": 120, "return_pct": -20},
                    {"label": "base", "probability": 50, "price_target": 90, "return_pct": 10},
                    {"label": "downside", "probability": 25, "price_target": 60, "return_pct": 40},
                ]
                record["expected_return_pct"] = 10
                write_record(run, record)
            report, code = compare_fixture(fixture,
                freeze_manifest_path=fixture.freeze, require_freeze_manifest=True)
            self.assertEqual(code, EXIT_PASS, report)

    def test_material_threshold_still_requires_adjudication(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = release_fixture(Path(temporary)); record = read_record(fixture.codex)
            record["conviction"] = 71; write_record(fixture.codex, record)
            report, code = compare_fixture(fixture,
                freeze_manifest_path=fixture.freeze, require_freeze_manifest=True)
            self.assertEqual(code, EXIT_ADJUDICATION_REQUIRED, report)
            self.assertEqual([row["trigger_id"] for row in report["material_triggers"]], ["conviction"])

    def test_substantive_surface_mismatches_are_material_triggers(self):
        mutations = {
            "scenarios": lambda r: r["scenarios"][0].update(label="deep bear"),
            "killer_risk": lambda r: r.update(killer_risk="Customer concentration breaks demand"),
            "missing_data": lambda r: r["missing_data"].append("Customer retention cohort"),
            "variant_perception": lambda r: r.update(variant_perception_summary="Recovery expectations are too low."),
            "forecast_ledger": lambda r: r["forecast_ledger"][0].update(prediction="Margin beats"),
        }
        for surface, mutate in mutations.items():
            with self.subTest(surface=surface), tempfile.TemporaryDirectory() as temporary:
                fixture = release_fixture(Path(temporary)); record = read_record(fixture.codex); mutate(record)
                write_record(fixture.codex, record)
                report, code = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
                self.assertEqual(code, EXIT_ADJUDICATION_REQUIRED, report)
                self.assertIn(surface, {row["trigger_id"] for row in report["material_triggers"]})

    def _issue(self, fixture: Fixture, report: dict, root: Path) -> tuple[Path, Path, Path]:
        comparison = root / "comparison.json"
        comparison.write_text(json.dumps(report, sort_keys=True), encoding="utf-8")
        receipt, template = root / "execution.json", root / "adjudication-template.json"
        issue_adjudication_execution_receipt(report, comparison, fixture.freeze, receipt, template)
        return comparison, receipt, template

    def test_adjudication_requires_runtime_receipt_and_exact_frozen_evidence(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); fixture = release_fixture(root); record = read_record(fixture.codex)
            record["conviction"] = 71; write_record(fixture.codex, record)
            report, code = compare_fixture(fixture,
                freeze_manifest_path=fixture.freeze, require_freeze_manifest=True)
            self.assertEqual(code, EXIT_ADJUDICATION_REQUIRED)
            with FakeSupervisor(root) as supervisor, mock.patch.dict(os.environ, supervisor.env, clear=False):
                comparison, receipt, template_path = self._issue(fixture, report, root)
                template = json.loads(template_path.read_text(encoding="utf-8"))
                source = fixture.snapshot / "filings/annual.txt"
                template["trigger_adjudications"] = [{"trigger_id": "conviction",
                    "classification": "source_supported_disagreement", "evidence": [{
                        "artifact_path": str(source), "artifact_sha256": digest_file(source),
                        "locator": "line 1", "finding": "Frozen filing permits the calibrated difference.",
                        "supports": "both"}]}]
                adjudication = root / "adjudication.json"
                adjudication.write_text(json.dumps(template), encoding="utf-8")
                final, final_code = compare_fixture(fixture,
                    freeze_manifest_path=fixture.freeze, require_freeze_manifest=True,
                    adjudication_path=adjudication, comparison_artifact_path=comparison)
                self.assertEqual(final_code, EXIT_PASS, final)
                self.assertEqual(final["result"], "source_supported_disagreements")

                forged = copy.deepcopy(template); forged["execution_receipt"]["sha256"] = "sha256:" + "0" * 64
                forged_path = root / "forged-adjudication.json"
                forged_path.write_text(json.dumps(forged), encoding="utf-8")
                with self.assertRaisesRegex(ParityInputError, "receipt file hash"):
                    compare_fixture(fixture, freeze_manifest_path=fixture.freeze,
                        adjudication_path=forged_path, comparison_artifact_path=comparison)

    def test_supervisor_rejects_stale_capabilities_forged_receipts_and_changed_initial_comparison(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); fixture = release_fixture(root); record = read_record(fixture.codex)
            record["conviction"] = 71; write_record(fixture.codex, record)
            report, code = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
            self.assertEqual(code, EXIT_ADJUDICATION_REQUIRED)
            with FakeSupervisor(root) as supervisor:
                stale = {**supervisor.env, "NOSTRA_PUBLICATION_TOKEN": "expired-token"}
                with mock.patch.dict(os.environ, stale, clear=False), self.assertRaisesRegex(
                    ParityInputError, "supervisor rejected.*403|stale token"
                ):
                    self._issue(fixture, report, root)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); fixture = release_fixture(root); record = read_record(fixture.codex)
            record["conviction"] = 71; write_record(fixture.codex, record)
            report, _ = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
            with FakeSupervisor(root) as supervisor, mock.patch.dict(os.environ, supervisor.env, clear=False):
                comparison, receipt, template_path = self._issue(fixture, report, root)
                receipt.chmod(0o644)
                forged_receipt = json.loads(receipt.read_text(encoding="utf-8"))
                forged_receipt["attempt"]["model"] = "forged-model"
                receipt.write_text(json.dumps(forged_receipt), encoding="utf-8")
                value = json.loads(template_path.read_text(encoding="utf-8"))
                value["execution_receipt"]["sha256"] = digest_file(receipt)
                source = fixture.snapshot / "filings/annual.txt"
                value["trigger_adjudications"] = [{"trigger_id": "conviction",
                    "classification": "source_supported_disagreement", "evidence": [{
                        "artifact_path": str(source), "artifact_sha256": digest_file(source),
                        "locator": "line 1", "finding": "Bound evidence", "supports": "both"}]}]
                adjudication = root / "forged-receipt-adjudication.json"
                adjudication.write_text(json.dumps(value), encoding="utf-8")
                with self.assertRaisesRegex(ParityInputError, "supervisor rejected|stale attestation"):
                    compare_fixture(fixture, freeze_manifest_path=fixture.freeze,
                        adjudication_path=adjudication, comparison_artifact_path=comparison)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); fixture = release_fixture(root); record = read_record(fixture.codex)
            record["conviction"] = 71; write_record(fixture.codex, record)
            report, _ = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
            with FakeSupervisor(root) as supervisor, mock.patch.dict(os.environ, supervisor.env, clear=False):
                comparison, _, template_path = self._issue(fixture, report, root)
                changed = json.loads(comparison.read_text(encoding="utf-8"))
                changed["material_triggers"] = []
                comparison.write_text(json.dumps(changed), encoding="utf-8")
                value = json.loads(template_path.read_text(encoding="utf-8"))
                source = fixture.snapshot / "filings/annual.txt"
                value["trigger_adjudications"] = [{"trigger_id": "conviction",
                    "classification": "source_supported_disagreement", "evidence": [{
                        "artifact_path": str(source), "artifact_sha256": digest_file(source),
                        "locator": "line 1", "finding": "Bound evidence", "supports": "both"}]}]
                adjudication = root / "changed-comparison-adjudication.json"
                adjudication.write_text(json.dumps(value), encoding="utf-8")
                with self.assertRaisesRegex(ParityInputError, "comparison artifact.*changed|trigger set"):
                    compare_fixture(fixture, freeze_manifest_path=fixture.freeze,
                        adjudication_path=adjudication, comparison_artifact_path=comparison)

    def test_evidence_outside_frozen_set_and_weak_locator_fail_closed(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); fixture = release_fixture(root); record = read_record(fixture.codex)
            record["conviction"] = 71; write_record(fixture.codex, record)
            report, _ = compare_fixture(fixture, freeze_manifest_path=fixture.freeze)
            with FakeSupervisor(root) as supervisor, mock.patch.dict(os.environ, supervisor.env, clear=False):
                comparison, _, template_path = self._issue(fixture, report, root)
                outside = root / "free-form.txt"; outside.write_text("invented", encoding="utf-8")
                value = json.loads(template_path.read_text(encoding="utf-8"))
                value["trigger_adjudications"] = [{"trigger_id": "conviction",
                    "classification": "source_supported_disagreement", "evidence": [{
                        "artifact_path": str(outside), "artifact_sha256": digest_file(outside),
                        "locator": "somewhere", "finding": "Unbound assertion", "supports": "both"}]}]
                adjudication = root / "adjudication.json"; adjudication.write_text(json.dumps(value), encoding="utf-8")
                with self.assertRaisesRegex(ParityInputError, "not frozen"):
                    compare_fixture(fixture, freeze_manifest_path=fixture.freeze,
                        adjudication_path=adjudication, comparison_artifact_path=comparison)
                frozen_source = fixture.snapshot / "filings/annual.txt"
                value["trigger_adjudications"][0]["evidence"][0].update({
                    "artifact_path": str(frozen_source), "artifact_sha256": digest_file(frozen_source),
                })
                adjudication2 = root / "adjudication-weak-locator.json"
                adjudication2.write_text(json.dumps(value), encoding="utf-8")
                with self.assertRaisesRegex(ParityInputError, "locator is not exact"):
                    compare_fixture(fixture, freeze_manifest_path=fixture.freeze,
                        adjudication_path=adjudication2, comparison_artifact_path=comparison)
                value["trigger_adjudications"][0]["evidence"][0]["locator"] = "line 1"
                adjudication3 = root / "adjudication-valid-after-rejected-drafts.json"
                adjudication3.write_text(json.dumps(value), encoding="utf-8")
                final, final_code = compare_fixture(fixture, freeze_manifest_path=fixture.freeze,
                    adjudication_path=adjudication3, comparison_artifact_path=comparison)
                self.assertEqual(final_code, EXIT_PASS, final)

    def test_artifact_discovery_is_fail_closed(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); (root / "a").mkdir(); (root / "b").mkdir()
            (root / "a/decision_record.json").write_text("{}", encoding="utf-8")
            (root / "b/thesis_record.json").write_text("{}", encoding="utf-8")
            with self.assertRaisesRegex(ParityInputError, "ambiguous"):
                resolve_artifact(root)

    def test_symlinked_terminal_record_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve(); fixture = release_fixture(root)
            terminal = fixture.codex / "decision_record.json"
            outside = root / "outside-decision.json"
            outside.write_bytes(terminal.read_bytes()); terminal.unlink()
            try:
                terminal.symlink_to(outside)
            except (OSError, NotImplementedError):
                self.skipTest("symlinks unavailable")
            with self.assertRaisesRegex(ParityInputError, "symlink"):
                compare_fixture(fixture, freeze_manifest_path=fixture.freeze)

    def test_evidence_locators_resolve_against_compatible_artifact_content(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            markdown = root / "evidence.md"
            markdown.write_text("# Known Section\nfirst fact\nsecond fact\n", encoding="utf-8")
            html = root / "evidence.html"
            html.write_text("<h4>Deep Section</h4>\n<p>fact</p>\n", encoding="utf-8")
            structured = root / "evidence.json"
            structured.write_text('{"nested":{"rows":[{"value":7}]}}\n', encoding="utf-8")
            pdf = root / "evidence.pdf"
            pdf.write_bytes(b"%PDF-1.4\n1 0 obj << /Type /Page >> endobj\n%%EOF\n")

            _validate_locator(markdown, "section Known Section")
            _validate_locator(html, "section Deep Section")
            _validate_locator(markdown, "lines 2-3")
            _validate_locator(structured, "/nested/rows/0/value")
            _validate_locator(structured, "field nested.rows.0.value")
            _validate_locator(pdf, "page 1")

            invalid = (
                (markdown, "page 1", "incompatible"),
                (pdf, "page 2", "outside or unresolvable"),
                (markdown, "line 99", "outside"),
                (markdown, "lines 3-2", "outside"),
                (markdown, "section Missing Section", "does not resolve"),
                (markdown, "field nested.rows", "incompatible"),
                (structured, "field nested.missing", "does not resolve"),
                (structured, "/nested/missing", "does not resolve"),
            )
            for artifact, locator, message in invalid:
                with self.subTest(locator=locator), self.assertRaisesRegex(ParityInputError, message):
                    _validate_locator(artifact, locator)


if __name__ == "__main__":
    unittest.main()
