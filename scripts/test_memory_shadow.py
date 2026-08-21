#!/usr/bin/env python3
"""Focused Phase 4 shadow-adapter, policy, cutoff, CLI, and feedback tests."""
from __future__ import annotations

import contextlib
import copy
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Iterator, Mapping

from canonical_json import canonical_json, canonical_json_bytes
from memory_adapters import adapt_repository
from memory_contract import payload_sha256
from memory_projection import build_projection
import memory_shadow
from memory_shadow import (
    RECALL_EVENT_TYPES,
    MAX_JSON_BYTES,
    ShadowError,
    access_scope_from_dict,
    build_legacy_evidence_verifier,
    compile_shadow_context,
    load_closed_json,
    load_trusted_scope_json,
    parse_closed_json,
    seal_shadow_feedback,
    verify_shadow_feedback,
    verify_shadow_response,
    write_new_artifact,
)


ROOT = Path(__file__).resolve().parents[1]
SHADOW_CLI = ROOT / "scripts" / "memory_shadow.py"
PROTECTED_ID = "evt_90000000-0000-5000-8000-000000000010"
FUTURE_ID = "evt_90000000-0000-5000-8000-000000000011"


class CountingVerifier:
    def __init__(self, delegate: object) -> None:
        self.delegate = delegate
        self.calls: list[str] = []

    def resolve(self, event: Mapping[str, Any], *, principal: object | None = None) -> object:
        self.calls.append(str(event["event_id"]))
        return self.delegate.resolve(event, principal=principal)


def _git(repo: Path, *arguments: str, env: Mapping[str, str] | None = None) -> None:
    completed = subprocess.run(
        ["git", *arguments],
        cwd=repo,
        env=dict(env) if env is not None else None,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert completed.returncode == 0, completed.stderr


@contextlib.contextmanager
def shadow_fixture() -> Iterator[dict[str, Any]]:
    with tempfile.TemporaryDirectory(prefix="memory-shadow-test-") as temporary:
        base = Path(temporary)
        repo = base / "repo"
        state = base / "state"
        repo.mkdir()
        state.mkdir()
        _git(repo, "init", "-q")
        _git(repo, "config", "user.name", "Memory Shadow Test")
        _git(repo, "config", "user.email", "shadow@example.test")

        run = repo / "analyses" / "TEST_2026-01-01"
        run.mkdir(parents=True)
        decision = {
            "schema_version": "1.0",
            "ticker": "TEST",
            "exchange": "XNYS",
            "decision_date": "2026-01-01",
            "run_root": "analyses/TEST_2026-01-01",
            "decision": "Watchlist",
            "rating": "Watchlist",
            "forecast_ledger": [
                {
                    "prediction": "Cloud margin improves",
                    "status": "open",
                    "time_window": "FY2026",
                    "falsification_trigger": "Margin declines",
                }
            ],
        }
        correction = {
            "schema": "corrections/v1",
            "date": "2026-02-01",
            "errata": [
                {
                    "field": "rating",
                    "kind": "note_clear",
                    "reason": "Keep the historical rating; clarify the forecast basis.",
                    "evidence": "synthetic fixture",
                }
            ],
        }
        (run / "decision_record.json").write_text(
            json.dumps(decision, sort_keys=True), encoding="utf-8"
        )
        _git(repo, "add", ".")
        commit_env = dict(os.environ)
        commit_env.update(
            {
                "GIT_AUTHOR_DATE": "2026-03-01T00:00:00Z",
                "GIT_COMMITTER_DATE": "2026-03-01T00:00:00Z",
            }
        )
        _git(repo, "commit", "-q", "--no-gpg-sign", "-m", "shadow decision", env=commit_env)
        (run / "corrections.json").write_text(
            json.dumps(correction, sort_keys=True), encoding="utf-8"
        )
        _git(repo, "add", ".")
        correction_env = dict(os.environ)
        correction_env.update(
            {
                "GIT_AUTHOR_DATE": "2026-03-02T00:00:00Z",
                "GIT_COMMITTER_DATE": "2026-03-02T00:00:00Z",
            }
        )
        _git(repo, "commit", "-q", "--no-gpg-sign", "-m", "shadow correction", env=correction_env)

        events, diagnostics = adapt_repository(repo)
        errors = [row for row in diagnostics if row["severity"] == "error"]
        assert errors == [], errors
        recall = [event for event in events if event["event_type"] in RECALL_EVENT_TYPES]
        assert {event["event_type"] for event in recall} == {
            "decision.recorded",
            "correction.recorded",
        }
        decision_event = next(event for event in recall if event["event_type"] == "decision.recorded")
        correction_event = next(event for event in recall if event["event_type"] == "correction.recorded")
        subjects = sorted(set(decision_event["subject_ids"]) & set(correction_event["subject_ids"]))
        assert subjects

        protected = copy.deepcopy(decision_event)
        protected["event_id"] = PROTECTED_ID
        protected["policy"] = {
            "classification": "restricted",
            "retention": "permanent",
            "retain_until": None,
        }
        # Keep this denial sentinel content-free at the projection binding layer;
        # its purpose is proving classification filtering happens before resolution.
        protected["evidence_refs"] = []
        protected["payload"]["source_path"] = "analyses/SECRET_2026-01-01/decision_record.json"
        protected["payload"]["source_sha256"] = "f" * 64
        protected["integrity"]["payload_sha256"] = payload_sha256(protected["payload"])
        future = copy.deepcopy(decision_event)
        future["event_id"] = FUTURE_ID
        future["system_time"] = "2027-01-01T00:00:00Z"
        projected_events = [*events, protected, future]
        database = state / "projection.sqlite"
        projection = build_projection(projected_events, database)

        scope_value = {
            "schema": "memory-shadow-access-scope/v1",
            "scope_id": "internal-shadow-test",
            "policy_version": "2026-08-21",
            "classifications": ["internal"],
            "source_tiers": [10],
            "embedding_classifications": [],
            "entitlement_ids": [],
        }
        request_value = {
            "schema": "memory-shadow-request/v1",
            "query": {
                "schema": "memory-query-spec/v1",
                "task": "Recall prior decisions, open forecasts, and relevant corrections",
                "requesting_module": "synthesizer",
                "query_text": "decision open forecast correction margin",
                "subject_ids": subjects,
                "as_of_system_time": "2026-06-30T00:00:00Z",
                "valid_time": {"from": "2025-01-01", "to": "2026-06-30"},
                "permitted_source_tiers": [10],
                "permitted_classifications": ["internal", "restricted"],
                "event_types": list(RECALL_EVENT_TYPES),
                "record_types": ["legacy-adapter"],
                "reporting_basis": None,
                "currency": None,
                "metric": None,
                "segment": None,
                "max_results": 10,
                "max_context_tokens": 10000,
            },
        }
        request_path = state / "request.json"
        scope_path = state / "scope.json"
        request_path.write_bytes(canonical_json_bytes(request_value))
        scope_path.write_bytes(canonical_json_bytes(scope_value))
        scope_path.chmod(0o600)
        yield {
            "base": base,
            "repo": repo,
            "state": state,
            "database": database,
            "projection_digest": projection.digest,
            "request": request_value,
            "request_path": request_path,
            "scope": scope_value,
            "scope_path": scope_path,
            "decision_id": decision_event["event_id"],
            "correction_id": correction_event["event_id"],
        }


def _expect_shadow_error(fn, contains: str) -> None:
    try:
        fn()
    except ShadowError as exc:
        assert contains in str(exc), str(exc)
        return
    raise AssertionError(f"expected ShadowError containing {contains!r}")


def _test_trusted_scope_loader(fixture: Mapping[str, Any]) -> None:
    scope_path = fixture["scope_path"]
    assert load_trusted_scope_json(scope_path) == fixture["scope"]

    scope_path.chmod(0o640)
    _expect_shadow_error(
        lambda: load_trusted_scope_json(scope_path),
        "must not grant group or other permissions",
    )
    scope_path.chmod(0o600)

    hard_link = fixture["state"] / "scope-hard-link.json"
    os.link(scope_path, hard_link)
    try:
        _expect_shadow_error(
            lambda: load_trusted_scope_json(scope_path),
            "exactly one hard link",
        )
    finally:
        hard_link.unlink()

    symlink = fixture["state"] / "scope-symlink.json"
    symlink.symlink_to(scope_path)
    _expect_shadow_error(
        lambda: load_trusted_scope_json(symlink),
        "must not be a symlink",
    )

    original_reader = memory_shadow._read_all

    def mutate_mode_during_read(descriptor: int) -> bytes:
        raw = original_reader(descriptor)
        scope_path.chmod(0o400)
        return raw

    memory_shadow._read_all = mutate_mode_during_read
    try:
        _expect_shadow_error(
            lambda: load_trusted_scope_json(scope_path),
            "changed while it was read",
        )
    finally:
        memory_shadow._read_all = original_reader
        scope_path.chmod(0o600)


def main() -> None:
    _expect_shadow_error(
        lambda: parse_closed_json("[" * 2_000 + "0" + "]" * 2_000),
        "strict UTF-8 JSON",
    )

    with shadow_fixture() as fixture:
        oversized = fixture["state"] / "oversized.json"
        oversized.write_bytes(b" " * (MAX_JSON_BYTES + 1))
        _expect_shadow_error(lambda: load_closed_json(oversized), "exceeds")
        _test_trusted_scope_loader(fixture)
        scope = access_scope_from_dict(fixture["scope"])
        delegate = build_legacy_evidence_verifier(
            fixture["repo"],
            access_scope=scope,
            evaluated_at="2026-08-21T00:00:00Z",
        )
        verifier = CountingVerifier(delegate)
        before_database = hashlib.sha256(fixture["database"].read_bytes()).hexdigest()
        response = compile_shadow_context(
            fixture["database"],
            expected_projection_digest=fixture["projection_digest"],
            request=fixture["request"],
            access_scope=scope,
            evidence_verifier=verifier,
            evaluated_at="2026-08-21T00:00:00Z",
        )
        verify_shadow_response(response)

        _expect_shadow_error(
            lambda: compile_shadow_context(
                fixture["database"],
                expected_projection_digest=fixture["projection_digest"],
                request=fixture["request"],
                access_scope=scope,
                evidence_verifier=delegate,
                evaluated_at="2026-06-29T23:59:59Z",
            ),
            "cannot precede",
        )
        assert response["read_only"] is True
        assert response["rating_effect"] == "none"
        assert response["canonical_write"] == "none"
        assert fixture["decision_id"] in response["event_ids"]
        assert fixture["correction_id"] in response["event_ids"]
        assert PROTECTED_ID not in response["event_ids"]
        assert FUTURE_ID not in response["event_ids"]
        assert PROTECTED_ID not in verifier.calls
        assert FUTURE_ID not in verifier.calls
        assert before_database == hashlib.sha256(fixture["database"].read_bytes()).hexdigest()
        packet = parse_closed_json(response["packet_json"])
        assert packet["content"]["effective_scope"]["classifications"] == ["internal"]
        omission_reasons = {
            row["reason"]: row["count"] for row in packet["content"]["omissions"]
        }
        assert omission_reasons["requested-classification-outside-trusted-scope"] == 1

        repeated = compile_shadow_context(
            fixture["database"],
            expected_projection_digest=fixture["projection_digest"],
            request=fixture["request"],
            access_scope=scope,
            evidence_verifier=CountingVerifier(delegate),
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert canonical_json_bytes(repeated) == canonical_json_bytes(response)

        wrong_digest = ("0" if fixture["projection_digest"][0] != "0" else "1") + fixture["projection_digest"][1:]
        _expect_shadow_error(
            lambda: compile_shadow_context(
                fixture["database"],
                expected_projection_digest=wrong_digest,
                request=fixture["request"],
                access_scope=scope,
                evidence_verifier=delegate,
                evaluated_at="2026-08-21T00:00:00Z",
            ),
            "projection",
        )
        hostile = copy.deepcopy(fixture["request"])
        hostile["expected_projection_digest"] = fixture["projection_digest"]
        _expect_shadow_error(
            lambda: compile_shadow_context(
                fixture["database"],
                expected_projection_digest=fixture["projection_digest"],
                request=hostile,
                access_scope=scope,
                evidence_verifier=delegate,
                evaluated_at="2026-08-21T00:00:00Z",
            ),
            "exactly schema and query",
        )
        unrelated = copy.deepcopy(fixture["request"])
        unrelated["query"]["event_types"] = ["claim.recorded"]
        _expect_shadow_error(
            lambda: compile_shadow_context(
                fixture["database"],
                expected_projection_digest=fixture["projection_digest"],
                request=unrelated,
                access_scope=scope,
                evidence_verifier=delegate,
                evaluated_at="2026-08-21T00:00:00Z",
            ),
            "event_types",
        )

        packet_out = fixture["state"] / "packet.json"
        manifest_out = fixture["state"] / "manifest.json"
        completed = subprocess.run(
            [
                sys.executable,
                str(SHADOW_CLI),
                "context",
                "--database",
                str(fixture["database"]),
                "--expected-projection-digest",
                fixture["projection_digest"],
                "--request",
                str(fixture["request_path"]),
                "--scope",
                str(fixture["scope_path"]),
                "--evaluated-at",
                "2026-08-21T00:00:00Z",
                "--repo-root",
                str(fixture["repo"]),
                "--packet-out",
                str(packet_out),
                "--manifest-out",
                str(manifest_out),
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
        assert completed.returncode == 0, completed.stderr
        cli_response = parse_closed_json(completed.stdout)
        verify_shadow_response(cli_response)
        assert cli_response == response
        assert packet_out.read_bytes() == response["packet_json"].encode("utf-8")
        assert manifest_out.read_bytes() == response["manifest_json"].encode("utf-8")
        assert before_database == hashlib.sha256(fixture["database"].read_bytes()).hexdigest()

        manifest = parse_closed_json(response["manifest_json"])
        feedback_content = {
            "context_packet_id": response["context_packet_id"],
            "packet_sha256": response["packet_sha256"],
            "query_sha256": manifest["query_sha256"],
            "client_id": "generic-shadow-reviewer",
            "observed_at": "2026-08-21T12:00:00+00:00",
            "items": [
                {
                    "category": "useful",
                    "event_id": fixture["decision_id"],
                    "evidence_id": response["evidence_ids"][0],
                    "note": "The open forecast and correction were both surfaced.",
                }
            ],
            "status": "inert-shadow-only",
            "canonical_write": "none",
            "rating_effect": "none",
        }
        feedback = seal_shadow_feedback(feedback_content)
        repeated_feedback = seal_shadow_feedback(feedback_content)
        verify_shadow_feedback(feedback)
        assert feedback == repeated_feedback
        assert feedback["content"]["observed_at"] == "2026-08-21T12:00:00Z"
        noncanonical_feedback = copy.deepcopy(feedback)
        noncanonical_feedback["content"]["observed_at"] = "2026-08-21T12:00:00+00:00"
        _expect_shadow_error(
            lambda: verify_shadow_feedback(noncanonical_feedback), "canonical normalized"
        )
        feedback_path = fixture["state"] / "feedback.json"
        write_new_artifact(feedback_path, canonical_json_bytes(feedback))
        assert parse_closed_json(feedback_path.read_bytes()) == feedback
        _expect_shadow_error(
            lambda: write_new_artifact(feedback_path, canonical_json_bytes(feedback)),
            "already exists",
        )
        tampered = copy.deepcopy(feedback)
        tampered["content"]["items"][0]["note"] = "Changed after sealing."
        _expect_shadow_error(lambda: verify_shadow_feedback(tampered), "identity or digest")
        assert before_database == hashlib.sha256(fixture["database"].read_bytes()).hexdigest()

    print("memory shadow tests: PASS")


if __name__ == "__main__":
    main()
