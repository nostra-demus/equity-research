#!/usr/bin/env python3
"""Adversarial tests for pre-launch provider-parity bindings."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compare_provider_runs import EXIT_PASS, compare_run_roots  # noqa: E402
from provider_parity_freeze import (  # noqa: E402
    FREEZE_SCHEMA_PATH, RUN_BINDING_BASENAME, RUN_BINDING_SCHEMA_PATH,
    FreezeError, SCHEMA_VERSION, build_freeze_manifest, digest_file, digest_json, receipt_digest,
    snapshot_receipt, validate_against_schema, _repo_relative_or_absolute,
)

SCRIPT = Path(__file__).with_name("provider_parity_freeze.py")
CREATED = "2026-08-21T09:00:00Z"


def decision(provider: str, attempt: str, model: str, reasoning: str, profile: str) -> dict:
    return {
        "schema_version": "1.0", "ticker": "PAIR", "decision_date": "2026-08-21",
        "currency": "USD", "entry_price": 100.0, "entry_price_timestamp": "2026-08-20",
        "decision": "Watchlist", "rating_cap": "Watchlist", "conviction": 60,
        "data_sufficiency_score": 75, "expected_return_pct": 7.5,
        "scenarios": [
            {"label": "bear", "probability": 25, "price_target": 80, "return_pct": -20},
            {"label": "base", "probability": 50, "price_target": 105, "return_pct": 5},
            {"label": "bull", "probability": 25, "price_target": 140, "return_pct": 40},
        ],
        "module_scores": {"business-model": 65, "valuation": 55}, "red_flags": [],
        "killer_risk": "Refinancing fails", "missing_data": ["Covenants"],
        "variant_perception_summary": "Recovery expectations are too high.",
        "forecast_ledger": [{"prediction": "Margin misses", "probability": 60, "time_window": "FY27"}],
        "execution_provenance": {"provider_mode": "single_provider", "profile_key": profile,
            "decision_author": {"provider": provider, "model": model,
                                "reasoning_level": reasoning, "attempt_id": attempt}},
    }


class Fixture:
    def __init__(self, root: Path):
        self.root = root.resolve(); root = self.root; self.snapshot = root / "snapshot"
        self.claude = root / "runs/claude"; self.codex = root / "runs/codex"
        self.snapshot.mkdir(); (self.snapshot / "filings").mkdir()
        (self.snapshot / "filings/annual.txt").write_text("audited revenue 100\n", encoding="utf-8")
        (self.snapshot / "price.json").write_text('{"close":100}\n', encoding="utf-8")
        self.claude.mkdir(parents=True); self.codex.mkdir(parents=True)
        self.freeze = root / "freeze.json"
        self.receipt: dict | None = None
        self.supervisor_rows: dict[str, list[dict]] = {}
        self.supervisor_instance_id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        self.pair_registration_id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

    def build(self) -> dict:
        self.receipt = build_freeze_manifest(
            data_snapshot_root=self.snapshot, claude_run=self.claude, codex_run=self.codex,
            subject="PAIR", decision_date="2026-08-21", price_value=100,
            price_currency="USD", price_as_of="2026-08-20", price_source="Frozen close",
            claude_model="opus", claude_reasoning="high", claude_profile="claude|opus:high",
            codex_model="gpt-5.6-sol", codex_reasoning="max",
            codex_profile="codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh",
            output=self.freeze, frozen_at=CREATED)
        return self.receipt

    def finish(self) -> None:
        values = (
            (self.claude, "claude", "11111111-1111-4111-8111-111111111111", "opus", "high", "claude|opus:high"),
            (self.codex, "codex", "22222222-2222-4222-8222-222222222222", "gpt-5.6-sol", "max", "codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh"),
        )
        for root, provider, attempt, model, reasoning, profile in values:
            runtime = {"schema_version": "1.0", "event": "attempt_started", "attempt_id": attempt,
                "provider": provider, "model": model, "reasoning_level": reasoning,
                "profile_key": profile, "attribution": "recorded", "decision_author": True,
                "started_at": "2026-08-21T09:01:00Z"}
            (root / "decision_record.json").write_text(
                json.dumps(decision(provider, attempt, model, reasoning, profile)), encoding="utf-8")
            assert self.receipt is not None
            binding_path = root / RUN_BINDING_BASENAME
            binding = json.loads(binding_path.read_text(encoding="utf-8"))
            runtime["parity_prelaunch"] = {
                "schema_version": "provider-parity-supervisor-binding/1.0",
                "supervisor_instance_id": self.supervisor_instance_id,
                "pair_registration_id": self.pair_registration_id,
                "binding_path": str(binding_path), "binding_file_sha256": digest_file(binding_path),
                "freeze_receipt_path": str(self.freeze), "freeze_receipt_file_sha256": digest_file(self.freeze),
                "freeze_receipt_sha256": self.receipt["receipt_sha256"],
                "data_snapshot_sha256": self.receipt["data_snapshot"]["sha256"],
                "snapshot_prelaunch_sha256": self.receipt["data_snapshot"]["sha256"],
                "snapshot_root": str(self.snapshot), "snapshot_monitor_key": self.receipt["receipt_sha256"],
                "snapshot_verified_at": "2026-08-21T09:00:30Z",
                "price_anchor_sha256": digest_json(self.receipt["price_anchor"]),
                "label": binding["label"], "provider": provider, "run_root": str(root), "profile_key": profile,
            }
            runtime["parity_publication"] = {
                "schema_version": "provider-parity-supervisor-publication/1.0",
                "supervisor_instance_id": self.supervisor_instance_id,
                "pair_registration_id": self.pair_registration_id,
                "snapshot_sha256": self.receipt["data_snapshot"]["sha256"],
                "freeze_receipt_sha256": self.receipt["receipt_sha256"],
                "verified_at": "2026-08-21T09:05:00Z",
            }
            self.supervisor_rows[str(root.resolve())] = [{**runtime, "_committed_receipt_path": f"{provider}/execution_provenance.receipt.json"}]

    def load_supervisor_rows(self, run_root: Path) -> list[dict]:
        return self.supervisor_rows.get(str(run_root.resolve()), [])


class FreezeTest(unittest.TestCase):
    def test_in_repo_binding_paths_are_relocatable(self):
        repo_root = Path(__file__).resolve().parent.parent
        self.assertEqual(
            _repo_relative_or_absolute(repo_root / "analyses/provider-parity/freeze/example.json"),
            "analyses/provider-parity/freeze/example.json",
        )
        external = Path(tempfile.gettempdir()).resolve() / "nostra-parity-external.json"
        self.assertEqual(_repo_relative_or_absolute(external), str(external))

    def test_prelaunch_receipt_and_bindings_validate_then_release_passes(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = Fixture(Path(temporary)); receipt = fixture.build()
            self.assertEqual(receipt["schema_version"], SCHEMA_VERSION)
            self.assertEqual(receipt["receipt_sha256"], receipt_digest(receipt))
            validate_against_schema(receipt, FREEZE_SCHEMA_PATH)
            for root in (fixture.claude, fixture.codex):
                binding = json.loads((root / RUN_BINDING_BASENAME).read_text(encoding="utf-8"))
                validate_against_schema(binding, RUN_BINDING_SCHEMA_PATH)
                self.assertEqual(binding["receipt_sha256"], receipt["receipt_sha256"])
            fixture.finish()
            report, code = compare_run_roots(fixture.claude, fixture.codex,
                freeze_manifest_path=fixture.freeze, require_freeze_manifest=True,
                supervisor_receipt_loader=fixture.load_supervisor_rows)
            self.assertEqual(code, EXIT_PASS, report)
            self.assertTrue(report["release_gate_eligible"])

    def test_retroactive_or_rebound_run_roots_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = Fixture(Path(temporary))
            (fixture.claude / "decision_record.json").write_text("{}", encoding="utf-8")
            with self.assertRaisesRegex(FreezeError, "empty"):
                fixture.build()
        with tempfile.TemporaryDirectory() as temporary:
            fixture = Fixture(Path(temporary)); fixture.build()
            with self.assertRaisesRegex(FreezeError, "overwrite|empty"):
                fixture.build()

    def test_snapshot_receipt_is_exact_and_rejects_links_specials_and_empty(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = Fixture(Path(temporary))
            receipt = snapshot_receipt(fixture.snapshot, CREATED)
            self.assertEqual([row["path"] for row in receipt["files"]], ["filings/annual.txt", "price.json"])
            empty = fixture.root / "empty"; empty.mkdir()
            with self.assertRaisesRegex(FreezeError, "at least one"):
                snapshot_receipt(empty, CREATED)
            link = fixture.snapshot / "link"
            try: link.symlink_to(fixture.snapshot / "price.json")
            except (OSError, NotImplementedError): self.skipTest("symlinks unavailable")
            with self.assertRaisesRegex(FreezeError, "symlink"):
                snapshot_receipt(fixture.snapshot, CREATED)
            link.unlink()
            if hasattr(os, "mkfifo"):
                fifo = fixture.snapshot / "fifo"; os.mkfifo(fifo)
                try:
                    with self.assertRaisesRegex(FreezeError, "special"):
                        snapshot_receipt(fixture.snapshot, CREATED)
                finally: fifo.unlink()

    def test_cli_creates_bindings_without_caller_supplied_timestamp(self):
        with tempfile.TemporaryDirectory() as temporary:
            fixture = Fixture(Path(temporary))
            command = [sys.executable, str(SCRIPT), "--data-snapshot", str(fixture.snapshot),
                "--claude-run", str(fixture.claude), "--codex-run", str(fixture.codex),
                "--subject", "PAIR", "--decision-date", "2026-08-21", "--price-value", "100",
                "--price-currency", "USD", "--price-as-of", "2026-08-20", "--price-source", "close",
                "--claude-model", "opus", "--claude-reasoning", "high", "--claude-profile", "claude|opus:high",
                "--codex-model", "gpt-5.6-sol", "--codex-reasoning", "max",
                "--codex-profile", "codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh", "--output", str(fixture.freeze)]
            completed = subprocess.run(command, capture_output=True, text=True, check=False)
            self.assertEqual(completed.returncode, 0, completed.stderr)
            self.assertTrue(json.loads(completed.stdout)["ok"])
            self.assertTrue((fixture.codex / RUN_BINDING_BASENAME).is_file())


if __name__ == "__main__":
    unittest.main()
