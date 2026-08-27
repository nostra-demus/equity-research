#!/usr/bin/env python3
"""Regression tests for the lossless legacy memory adapters.

Run: ``python3 scripts/test_memory_adapters.py``
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
import uuid
from collections import Counter
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

import memory_adapters  # noqa: E402
from memory_adapters import (  # noqa: E402
    adapt_repository,
    adapt_source,
    canonical_json_bytes,
    discover_legacy_sources,
    payload_sha256,
)

from memory_contract import validate_events  # noqa: E402


def _write_json(root: Path, relative: str, value: dict) -> None:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _write_ndjson(root: Path, relative: str, rows: list[dict]) -> None:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows),
        encoding="utf-8",
    )


def _source_bytes(root: Path) -> dict[str, bytes]:
    return {
        path.as_posix(): (root / path).read_bytes()
        for path in discover_legacy_sources(root)
    }


def _fixture_repository(root: Path) -> None:
    first_decision = {
        "schema_version": "1.0",
        "ticker": "AAA",
        "exchange": "NYSE",
        "decision_date": "2026-01-01",
        "run_root": "analyses/AAA_2026-01-01",
        "decision": "Watchlist",
        "qualifier": "Not proven from available data.",
    }
    second_decision = {
        **first_decision,
        "decision_date": "2026-01-02",
        "run_root": "analyses/AAA_2026-01-02",
        "decision": "Avoid",
    }
    _write_json(root, "analyses/AAA_2026-01-01/decision_record.json", first_decision)
    _write_json(root, "analyses/AAA_2026-01-02/decision_record.json", second_decision)
    _write_json(root, "analyses/AAA_2026-01-01/reviews/2026-01-03_30d_decision_review.json", {
        "schema_version": "1.0", "ticker": "AAA", "review_date": "2026-01-03",
        "original_decision_date": "2026-01-01", "review_window": "30d",
        "lessons": ["Qualifier retained."],
    })
    _write_json(root, "analyses/AAA_2026-01-01/corrections.json", {
        "schema": "corrections/v1",
        "superseded_by": {
            "run_root": "analyses/AAA_2026-01-02",
            "reason": "A later run applied the evidence cap.",
            "date": "2026-01-04",
        },
        "errata": [],
    })
    _write_json(root, "analyses/performance/2026-01-05_calibration_summary.json", {
        "schema_version": "1.0", "generated_at": "2026-01-05", "scope": "all",
        "n_decisions": 2, "n_reviews": 1, "n_resolved_forecasts": 0,
        "calibration_by_module": {}, "calibration_by_forecast_type": {},
    })

    _write_json(root, "commodity/runs/GOLD/decision_record.json", {
        "swarm": "commodity", "commodity": "GOLD", "decision_date": "2026-02-01",
        "action": "Hold", "sources": ["filing"],
    })
    _write_json(root, "commodity/runs/GOLD/signal_evidence.json", {
        "schema_version": 1, "commodity": "GOLD", "generated_at": "2026-02-02T10:00:00.1Z",
        "records": [{"signal_id": "real-yields", "as_of": "2026-02-02T09:00:00Z"}],
        "clusters": [], "coverage": {"complete": True}, "summary": {"raw_signal_count": 1},
    })

    _write_ndjson(root, "screener/ledger/events.ndjson", [
        {
            "event_id": "EVT-aaaaaaaaaaaa", "signal_id": "SIG-20260301-aaaaaaaa",
            "ts": "2026-03-01T10:00:00Z", "status": "PROMOTE",
            "run_root": "screener/runs/SIG-20260301-aaaaaaaa",
        },
        {
            "event_id": "EVT-aaaaaaaaaaaa", "signal_id": "SIG-20260301-aaaaaaaa",
            "ts": "2026-03-01T11:00:00Z", "status": "provisional",
            "run_root": "screener/runs/SIG-20260301-aaaaaaaa",
        },
    ])
    _write_json(root, "screener/ledger/theses/THS-SIG-20260301-aaaaaaaa-v1.json", {
        "meta": {
            "thesis_id": "THS-SIG-20260301-aaaaaaaa-v1",
            "signal_id": "SIG-20260301-aaaaaaaa",
            "created_at": "2026-03-01T11:15:00Z",
            "phase1_completed_at": "2026-03-01T11:16:00Z",
            "version": 1,
            "raw_input_source": {"input_datetime": "2026-03-01T09:59:00Z"},
        },
        "run_root": "screener/runs/SIG-20260301-aaaaaaaa/",
        "M0_1": {"event_statement": "complete original payload"},
    })
    idea_base = {
        "idea_id": "IDEA-aaaaaaaaaaaa", "idea_version": "IDEAV-1111111111111111",
        "idea_version_started_at": "2026-03-02T10:00:00Z",
        "surfaced_at": "2026-03-02T10:00:00Z", "ts": "2026-03-02T10:00:00Z",
        "updated_at": "2026-03-02T10:00:00Z", "ticker": "AAA", "exchange": "NYSE",
        "reason": "Initial idea",
    }
    idea_later = {
        **idea_base, "idea_version": "IDEAV-2222222222222222",
        "idea_version_started_at": "2026-03-02T11:00:00Z",
        "ts": "2026-03-02T11:00:00Z", "updated_at": "2026-03-02T11:00:00Z",
        "reason": "Later evidence-qualified idea",
    }
    _write_ndjson(root, "screener/ledger/ideas.ndjson", [idea_base, idea_later])
    _write_json(root, "screener/ledger/ideas/IDEA-aaaaaaaaaaaa.json", idea_later)
    _write_json(root, "screener/ledger/ideas_archive/archive.json", {
        "schema_version": "idea-archive/v1", "archived_at": "2026-03-03T00:00:00Z",
        "archive_reason": "expired_pruned", "snapshot": idea_base,
    })
    _write_ndjson(root, "screener/ledger/conviction/conviction.ndjson", [{
        "row_type": "conviction_event", "thesis_id": "THS-SIG-20260301-aaaaaaaa-v1",
        "at": "2026-03-02T12:00:00Z", "kind": "seed", "event_key": "seed-1",
    }])
    _write_ndjson(root, "screener/ledger/conviction/checkpoints.ndjson", [{
        "checkpoint_id": "CHK-aaaaaaaa-01", "thesis_id": "THS-SIG-20260301-aaaaaaaa-v1",
        "created_at": "2026-03-02T12:01:00Z", "kind": "kill_metric",
    }])
    _write_json(
        root,
        "screener/ledger/conviction/conviction_state/THS-SIG-20260301-aaaaaaaa-v1.json",
        {
            "thesis_id": "THS-SIG-20260301-aaaaaaaa-v1",
            "updated_at": "2026-03-02T12:02:00Z", "state": "provisional",
        },
    )


class MemoryAdapterTests(unittest.TestCase):
    maxDiff = None

    def test_all_supported_families_are_lossless_stable_and_linked(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            _fixture_repository(root)
            before = _source_bytes(root)

            first_events, first_diagnostics = adapt_repository(root)
            second_events, second_diagnostics = adapt_repository(root)

            self.assertEqual(first_events, second_events)
            self.assertEqual(first_diagnostics, second_diagnostics)
            self.assertEqual(first_diagnostics, [])
            self.assertEqual(_source_bytes(root), before, "adapters must not alter legacy bytes")

            counts = Counter(event["payload"]["record_type"] for event in first_events)
            self.assertEqual(counts, {
                "equity_decision_correction": 1,
                "equity_decision_record": 2,
                "equity_decision_review": 1,
                "equity_calibration_summary": 1,
                "commodity_decision_record": 1,
                "commodity_signal_evidence": 1,
                "screener_event": 2,
                "screener_thesis": 1,
                "screener_idea_history": 2,
                "screener_idea_snapshot": 1,
                "screener_idea_archive": 1,
                "screener_conviction_event": 1,
                "screener_conviction_checkpoint": 1,
                "screener_conviction_state": 1,
            })

            required = {
                "schema", "event_id", "event_type", "subject_ids", "valid_time",
                "system_time", "producer", "run_id", "trace_id", "payload",
                "evidence_refs", "derived_from", "supersedes", "integrity", "policy",
            }
            for event in first_events:
                self.assertEqual(set(event), required)
                self.assertEqual(event["schema"], "memory-event/v1")
                self.assertRegex(event["event_id"], r"^evt_[0-9a-f-]{36}$")
                self.assertEqual(uuid.UUID(event["event_id"][4:]).version, 5)
                self.assertEqual(event["integrity"]["payload_sha256"], payload_sha256(event["payload"]))
                self.assertEqual(event["policy"], {
                    "classification": "internal", "retention": "permanent", "retain_until": None,
                })
                self.assertEqual(event["producer"]["kind"], "adapter")
                self.assertTrue(event["evidence_refs"][0].startswith("evidence:sha256:"))
                self.assertEqual(
                    hashlib.sha256(canonical_json_bytes(event["payload"])).hexdigest(),
                    event["integrity"]["payload_sha256"],
                )
                source_path = root / event["payload"]["source_path"]
                locator = event["payload"]["source_locator"]
                if locator == "json":
                    source_record = json.loads(source_path.read_text(encoding="utf-8"))
                else:
                    line_number = int(locator.removeprefix("line-"))
                    source_record = json.loads(source_path.read_text(encoding="utf-8").splitlines()[line_number - 1])
                self.assertEqual(event["payload"]["record"], source_record)

            by_source = {
                (event["payload"]["source_path"], event["payload"]["source_locator"]): event
                for event in first_events
            }
            old_decision = by_source[("analyses/AAA_2026-01-01/decision_record.json", "json")]
            new_decision = by_source[("analyses/AAA_2026-01-02/decision_record.json", "json")]
            correction = by_source[("analyses/AAA_2026-01-01/corrections.json", "json")]
            review = by_source[(
                "analyses/AAA_2026-01-01/reviews/2026-01-03_30d_decision_review.json", "json",
            )]
            self.assertEqual(new_decision["supersedes"], [old_decision["event_id"]])
            self.assertEqual(correction["supersedes"], [])
            self.assertEqual(
                correction["derived_from"], [old_decision["event_id"], new_decision["event_id"]],
            )
            old_opaque = {value for value in old_decision["subject_ids"] if value.startswith("entity:internal:legacy-")}
            new_opaque = {value for value in new_decision["subject_ids"] if value.startswith("entity:internal:legacy-")}
            review_opaque = {value for value in review["subject_ids"] if value.startswith("entity:internal:legacy-")}
            self.assertEqual(len(old_opaque), 2)  # run-scoped subject + exchange/ticker composite
            self.assertEqual(len(old_opaque & new_opaque), 1)  # same listing composite across runs
            self.assertEqual(len(old_opaque & review_opaque), 1)  # same run-scoped subject
            self.assertTrue(old_decision["run_id"].startswith("run_"))

            event_one = by_source[("screener/ledger/events.ndjson", "line-1")]
            event_two = by_source[("screener/ledger/events.ndjson", "line-2")]
            self.assertEqual(event_two["supersedes"], [event_one["event_id"]])
            idea_one = by_source[("screener/ledger/ideas.ndjson", "line-1")]
            idea_two = by_source[("screener/ledger/ideas.ndjson", "line-2")]
            self.assertEqual(idea_two["supersedes"], [idea_one["event_id"]])

            thesis = by_source[(
                "screener/ledger/theses/THS-SIG-20260301-aaaaaaaa-v1.json", "json",
            )]
            self.assertEqual(thesis["system_time"], "2026-03-01T11:16:00Z")
            self.assertEqual(thesis["payload"]["time_mapping"]["system_time_field"], "meta.phase1_completed_at")
            self.assertEqual(thesis["valid_time"]["from"], "2026-03-01T09:59:00Z")
            self.assertEqual(old_decision["system_time"], "2026-01-01T23:59:59.999999Z")
            self.assertEqual(old_decision["payload"]["time_mapping"]["system_time_precision"], "day")
            self.assertEqual(old_decision["valid_time"]["from"], "2026-01-01")
            self.assertEqual(old_decision["payload"]["time_mapping"]["valid_time_precision"], "day")

            self.assertEqual(validate_events(first_events), [])

    def test_diagnostics_replace_guessing_and_do_not_abort_other_rows(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "screener/ledger/events.ndjson"
            path.parent.mkdir(parents=True)
            path.write_text(
                "{not-json}\n"
                + json.dumps({"ts": "2026-01-01T00:00:00Z", "status": "LOG"}) + "\n"
                + json.dumps({"signal_id": "SIG-bad", "ts": "2026-01-01T00:00:00"}) + "\n"
                + json.dumps({"signal_id": "SIG-good", "ts": "2026-01-01T00:00:00Z"}) + "\n",
                encoding="utf-8",
            )
            _write_json(root, "analyses/AAA_2026-01-01/corrections.json", {
                "schema": "corrections/v1", "errata": [{"field": "x", "kind": "note_clear"}],
            })

            events, diagnostics = adapt_repository(root)
            self.assertEqual(len(events), 1)
            self.assertEqual(events[0]["payload"]["source_locator"], "line-4")
            codes = Counter(item["code"] for item in diagnostics)
            self.assertEqual(codes["invalid_json"], 1)
            self.assertEqual(codes["missing_identity"], 1)
            self.assertEqual(codes["missing_system_time"], 2)

            unsupported = root / "other.json"
            unsupported.write_text("{}\n", encoding="utf-8")
            unsupported_events, unsupported_diagnostics = adapt_source(root, unsupported)
            self.assertEqual(unsupported_events, [])
            self.assertEqual(unsupported_diagnostics[0]["code"], "unsupported_source")

    def test_ndjson_record_identity_survives_later_append(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            first = {
                "event_id": "EVT-aaaaaaaaaaaa", "signal_id": "SIG-20260101-aaaaaaaa",
                "ts": "2026-01-01T00:00:00Z",
            }
            second = {
                "event_id": "EVT-bbbbbbbbbbbb", "signal_id": "SIG-20260102-bbbbbbbb",
                "ts": "2026-01-02T00:00:00Z",
            }
            _write_ndjson(root, "screener/ledger/events.ndjson", [first])
            before, _ = adapt_repository(root)
            _write_ndjson(root, "screener/ledger/events.ndjson", [first, second])
            after, _ = adapt_repository(root)
            self.assertEqual(before[0], after[0])

    def test_git_receipt_time_prevents_backdating_and_rejects_dirty_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            decision_path = "analyses/OLD_2020-01-01/decision_record.json"
            decision = {
                "schema_version": "1.0",
                "ticker": "OLD",
                "exchange": "NYSE",
                "decision_date": "2020-01-01",
                "run_root": "analyses/OLD_2020-01-01",
                "decision": "Watchlist",
            }
            _write_json(root, decision_path, decision)
            subprocess.run(["git", "init", "-q"], cwd=root, check=True)
            subprocess.run(["git", "config", "user.name", "Memory Test"], cwd=root, check=True)
            subprocess.run(
                ["git", "config", "user.email", "memory@example.test"], cwd=root, check=True
            )
            subprocess.run(["git", "add", decision_path], cwd=root, check=True)
            commit_env = {
                **os.environ,
                "GIT_AUTHOR_DATE": "2026-06-01T12:00:00Z",
                "GIT_COMMITTER_DATE": "2026-06-01T12:00:00Z",
            }
            subprocess.run(
                ["git", "commit", "-q", "--no-gpg-sign", "-m", "record source"],
                cwd=root,
                env=commit_env,
                check=True,
            )

            events, diagnostics = adapt_source(root, decision_path)
            self.assertEqual(diagnostics, [])
            self.assertEqual(events[0]["system_time"], "2026-06-01T12:00:00Z")
            self.assertEqual(
                events[0]["payload"]["time_mapping"]["system_time_trust"],
                "git-commit/v1",
            )
            self.assertEqual(
                events[0]["payload"]["time_mapping"]["legacy_system_time_field"],
                "decision_date",
            )

            decision["decision"] = "Avoid"
            _write_json(root, decision_path, decision)
            dirty_events, dirty_diagnostics = adapt_source(root, decision_path)
            self.assertEqual(dirty_events, [])
            self.assertEqual(dirty_diagnostics[0]["code"], "uncommitted_source_time")

    def test_repository_git_snapshot_batches_metadata_without_changing_events(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            _write_json(root, "analyses/AAA_2026-01-01/decision_record.json", {
                "schema_version": "1.0", "ticker": "AAA", "exchange": "NYSE",
                "decision_date": "2026-01-01", "decision": "Watchlist",
            })
            _write_json(root, "commodity/runs/GOLD/decision_record.json", {
                "commodity": "GOLD", "decision_date": "2026-01-02", "action": "Hold",
            })
            _write_ndjson(root, "screener/ledger/events.ndjson", [
                {
                    "event_id": "EVT-aaaaaaaaaaaa", "signal_id": "SIG-20260103-aaaaaaaa",
                    "ts": "2026-01-03T10:00:00Z", "status": "LOG",
                },
                {
                    "event_id": "EVT-aaaaaaaaaaaa", "signal_id": "SIG-20260103-aaaaaaaa",
                    "ts": "2026-01-03T11:00:00Z", "status": "PROMOTE",
                },
            ])
            subprocess.run(["git", "init", "-q"], cwd=root, check=True)
            subprocess.run(["git", "config", "user.name", "Memory Test"], cwd=root, check=True)
            subprocess.run(
                ["git", "config", "user.email", "memory@example.test"], cwd=root, check=True,
            )
            subprocess.run(["git", "add", "."], cwd=root, check=True)
            commit_env = {
                **os.environ,
                "GIT_AUTHOR_DATE": "2026-06-01T12:00:00Z",
                "GIT_COMMITTER_DATE": "2026-06-01T12:00:00Z",
            }
            subprocess.run(
                ["git", "commit", "-q", "--no-gpg-sign", "-m", "record sources"],
                cwd=root, env=commit_env, check=True,
            )

            expected_events: list[dict] = []
            expected_diagnostics: list[dict] = []
            for source in discover_legacy_sources(root):
                events, diagnostics = adapt_source(root, source)
                expected_events.extend(events)
                expected_diagnostics.extend(diagnostics)

            commands: Counter[str] = Counter()
            original_run = memory_adapters.subprocess.run

            def counted_run(*args, **kwargs):
                argv = args[0] if args else kwargs.get("args", [])
                if isinstance(argv, (list, tuple)) and len(argv) > 1 and argv[0] == "git":
                    commands[str(argv[1])] += 1
                return original_run(*args, **kwargs)

            with mock.patch.object(memory_adapters.subprocess, "run", side_effect=counted_run):
                actual_events, actual_diagnostics = adapt_repository(root)

            self.assertEqual(actual_events, expected_events)
            self.assertEqual(actual_diagnostics, expected_diagnostics)
            self.assertEqual(commands["status"], 1)
            self.assertEqual(commands["log"], 1)
            self.assertEqual(commands["blame"], 1)
            self.assertEqual(commands["show"], 1)

    def test_non_monotonic_rows_preserve_chronological_supersession(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            rows = [
                {
                    "event_id": "EVT-aaaaaaaaaaaa",
                    "signal_id": "SIG-20260101-aaaaaaaa",
                    "ts": timestamp,
                }
                for timestamp in (
                    "2026-01-01T10:00:00Z",
                    "2026-01-01T09:00:00Z",
                    "2026-01-01T11:00:00Z",
                )
            ]
            _write_ndjson(root, "screener/ledger/events.ndjson", rows)
            events, diagnostics = adapt_repository(root)
            by_line = {event["payload"]["source_locator"]: event for event in events}
            self.assertEqual(by_line["line-1"]["supersedes"], [by_line["line-2"]["event_id"]])
            self.assertEqual(by_line["line-3"]["supersedes"], [by_line["line-1"]["event_id"]])
            self.assertEqual(
                Counter(item["code"] for item in diagnostics)["non_monotonic_update"], 1
            )
            self.assertEqual(validate_events(events), [])

    def test_live_repository_sources_are_covered_without_errors(self) -> None:
        if not (ROOT / "analyses").is_dir():
            self.skipTest("live repository artifacts are absent")
        watched = [
            ROOT / "analyses/BG_2026-06-01/decision_record.json",
            ROOT / "analyses/BG_2026-06-01/reviews/2026-07-13_30d_decision_review.json",
            ROOT / "commodity/runs/GOLD/decision_record.json",
            ROOT / "screener/ledger/events.ndjson",
            ROOT / "screener/ledger/ideas.ndjson",
        ]
        before = _source_bytes(ROOT)
        events, diagnostics = adapt_repository(ROOT)
        after = _source_bytes(ROOT)
        self.assertEqual(after, before)
        self.assertFalse([item for item in diagnostics if item["severity"] == "error"], diagnostics)

        counts = Counter(event["payload"]["record_type"] for event in events)
        self.assertGreaterEqual(counts["equity_decision_record"], 15)
        self.assertGreaterEqual(counts["equity_decision_review"], 10)
        self.assertGreaterEqual(counts["equity_decision_correction"], 6)
        self.assertGreaterEqual(counts["commodity_decision_record"], 4)
        self.assertGreaterEqual(counts["screener_event"], 19)
        self.assertGreaterEqual(counts["screener_thesis"], 10)
        self.assertGreaterEqual(counts["screener_idea_history"], 200)
        self.assertGreaterEqual(counts["screener_conviction_checkpoint"], 80)

        bg_event = next(
            event for event in events
            if event["payload"]["source_path"] == "analyses/BG_2026-06-01/decision_record.json"
        )
        bg_source = json.loads(watched[0].read_text(encoding="utf-8"))
        self.assertEqual(bg_event["payload"]["record"], bg_source)

        self.assertEqual(validate_events(events), [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
