#!/usr/bin/env python3
"""Crash/retry convergence tests for conviction rescore and restore transactions."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import time


HERE = os.path.dirname(os.path.abspath(__file__))


def write_json(path: str, value: object) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2)
        handle.write("\n")


def read_rows(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    return [json.loads(line) for line in open(path, encoding="utf-8") if line.strip()]


def fixture() -> str:
    root = tempfile.mkdtemp(prefix="conviction-transaction-")
    subprocess.run(["git", "init", "-q", root], check=True)
    os.makedirs(os.path.join(root, "scripts"), exist_ok=True)
    for name in ("append-ndjson.sh", "repo_mutation.py", "screener_emit_checkpoints.py",
                 "screener_rescore.py", "screener_restore_conviction.py"):
        shutil.copy2(os.path.join(HERE, name), os.path.join(root, "scripts", name))
    return root


def run(root: str, script: str, *args: str) -> None:
    subprocess.run(
        ["python3", os.path.join(root, "scripts", script), *args],
        cwd=root,
        env={**os.environ, "PYTHONPYCACHEPREFIX": os.path.join(root, ".pycache")},
        check=True,
        stdout=subprocess.DEVNULL,
    )


def run_result(root: str, script: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["python3", os.path.join(root, "scripts", script), *args],
        cwd=root,
        env={**os.environ, "PYTHONPYCACHEPREFIX": os.path.join(root, ".pycache")},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def test_rescore_retry() -> None:
    root = fixture()
    try:
        tid, cid, cid_b = "THS-SIG-20260803-aaaaaaaa-v1", "CHK-aaaaaaaa-01", "CHK-aaaaaaaa-02"
        conviction = os.path.join(root, "screener", "ledger", "conviction")
        state_path = os.path.join(conviction, "conviction_state", f"{tid}.json")
        checkpoints = os.path.join(conviction, "checkpoints.ndjson")
        ticks = os.path.join(conviction, "conviction.ndjson")
        record = {
            "meta": {"created_at": "2026-08-01T00:00:00Z"},
            "M0_4": {"horizon": "medium_long_3_6months"},
            "M0_6_6": {
                "final_score": 70,
                "scoring_criteria": {
                    "variant_perception_quality": {"sub_score": 70},
                    "mispricing_reason_strength": {"sub_score": 70},
                    "convergence_trigger_clarity": {"sub_score": 70},
                },
            },
        }
        initial_state = {
            "thesis_id": tid, "state": "provisional", "edge_locked": 70, "edge_score_live": 70,
            "trajectory": [{"at": "2026-08-01T00:00:00Z", "edge": 70}], "history": [],
        }
        checkpoint = {
            "checkpoint_id": cid, "thesis_id": tid, "kind": "convergence_trigger",
            "metric_name": "filed KPI", "source_field": "M0_6_5.trigger_name", "predicted_prob": 0.7,
            "due_at": "2026-08-03", "status": "scheduled",
        }
        checkpoint_b = {
            "checkpoint_id": cid_b, "thesis_id": tid, "kind": "secondary_metric",
            "metric_name": "filed margin", "source_field": "M0_5.monitorable_metric_2", "predicted_prob": 0.6,
            "due_at": "2026-08-04", "status": "scheduled",
        }
        write_json(os.path.join(root, "screener", "ledger", "theses", f"{tid}.json"), record)
        write_json(state_path, initial_state)
        os.makedirs(os.path.dirname(checkpoints), exist_ok=True)
        checkpoint_text = json.dumps(checkpoint) + "\n" + json.dumps(checkpoint_b) + "\n"
        with open(checkpoints, "w", encoding="utf-8") as handle:
            handle.write(checkpoint_text)

        args = (tid, cid, "confirmed", "--source-count", "2", "--note", "KPI matched the filing")
        run(root, "screener_rescore.py", *args, "--at", "2026-08-03T12:00:02Z")

        # Simulate SIGKILL after both append-only rows committed but before either projection published.
        write_json(state_path, initial_state)
        with open(checkpoints, "w", encoding="utf-8") as handle:
            handle.write(checkpoint_text)
        # Another validation succeeds before A retries. B must incorporate A's journal and reconcile
        # both projections; the delayed A retry must then be a true no-op, never a second transition.
        run(root, "screener_rescore.py", tid, cid_b, "confirmed", "--source-count", "2",
            "--note", "Margin matched the filing", "--at", "2026-08-03T12:00:01Z")
        expected_latest_projection = [
            row for row in read_rows(ticks)
            if row.get("row_type") == "conviction_event"
        ][-1]["state_projection"]
        run(root, "screener_rescore.py", *args, "--at", "2026-08-03T12:00:04Z")

        rows = read_rows(ticks)
        validations = [row for row in rows if row.get("row_type") == "validation_result"]
        events = [row for row in rows if row.get("row_type") == "conviction_event"]
        state = json.load(open(state_path, encoding="utf-8"))
        assert len(validations) == 2, validations
        assert len(events) == 2, events
        assert state["history"] == [event["event_key"] for event in events], state["history"]
        assert state == expected_latest_projection, "retry must restore the last APPENDED journal image, not max(at)"
        assert len({(row["at"], row["edge"]) for row in state["trajectory"]}) == len(state["trajectory"])
        assert all(row["status"] == "resolved" for row in read_rows(checkpoints))
    finally:
        shutil.rmtree(root, ignore_errors=True)


def test_restore_retry() -> None:
    root = fixture()
    try:
        tid = "THS-SIG-20260803-bbbbbbbb-v1"
        conviction = os.path.join(root, "screener", "ledger", "conviction")
        state_path = os.path.join(conviction, "conviction_state", f"{tid}.json")
        ticks = os.path.join(conviction, "conviction.ndjson")
        archived = {
            "thesis_id": tid, "state": "falsified_discarded", "archived": True, "stale": True,
            "insufficient": False, "edge_locked": 70, "edge_score_live": 70, "conviction": 70,
            "history": ["prior-event"], "updated_at": "2026-08-03T10:00:00Z", "kill_reason": "test",
        }
        write_json(state_path, archived)
        run(root, "screener_restore_conviction.py", tid, "transaction-test")

        # The event is durable but the projection is lost. A later retry must claim the same operation.
        write_json(state_path, archived)
        time.sleep(1.1)
        run(root, "screener_restore_conviction.py", tid, "transaction-test")

        events = [row for row in read_rows(ticks) if row.get("row_type") == "conviction_event"]
        state = json.load(open(state_path, encoding="utf-8"))
        assert len(events) == 1, events
        assert state["history"] == ["prior-event", events[0]["event_key"]], state["history"]
        assert state["archived"] is False
    finally:
        shutil.rmtree(root, ignore_errors=True)


def test_terminal_integrity_archive_wins_journal_order() -> None:
    root = fixture()
    try:
        signal = "SIG-20260803-cccccccc"
        tid = f"THS-{signal}-v1"
        cid_a, cid_b = "CHK-cccccccc-01", "CHK-cccccccc-02"
        conviction = os.path.join(root, "screener", "ledger", "conviction")
        state_path = os.path.join(conviction, "conviction_state", f"{tid}.json")
        checkpoints = os.path.join(conviction, "checkpoints.ndjson")
        ticks = os.path.join(conviction, "conviction.ndjson")
        run_root = os.path.join(root, "screener", "runs", signal)
        record = {
            "run_root": os.path.relpath(run_root, root),
            "meta": {
                "thesis_id": tid, "signal_id": signal, "locked": True,
                "status": "provisional", "created_at": "2026-08-01T00:00:00Z",
            },
            "M0_4": {"horizon": "medium_long_3_6months"},
            "M0_6_6": {
                "final_score": 70,
                "scoring_criteria": {
                    "variant_perception_quality": {"sub_score": 70},
                    "mispricing_reason_strength": {"sub_score": 70},
                    "convergence_trigger_clarity": {"sub_score": 70},
                },
            },
        }
        initial_state = {
            "thesis_id": tid, "state": "provisional", "sell_side_rating": "Starter Position Only",
            "edge_locked": 70, "edge_score_live": 70, "conviction": 70,
            "trajectory": [{"at": "2026-08-01T00:00:00Z", "edge": 70}], "history": [],
            "archived": False, "stale": False,
        }
        checkpoint_a = {
            "checkpoint_id": cid_a, "thesis_id": tid, "kind": "convergence_trigger",
            "metric_name": "filed KPI", "source_field": "M0_6_5.trigger_name",
            "predicted_prob": 0.7, "due_at": "2026-08-03", "status": "scheduled",
        }
        checkpoint_b = {
            "checkpoint_id": cid_b, "thesis_id": tid, "kind": "secondary_metric",
            "metric_name": "filed margin", "source_field": "M0_5.monitorable_metric_2",
            "predicted_prob": 0.6, "due_at": "2026-08-04", "status": "scheduled",
        }
        write_json(os.path.join(root, "screener", "ledger", "theses", f"{tid}.json"), record)
        write_json(state_path, initial_state)
        os.makedirs(os.path.dirname(checkpoints), exist_ok=True)
        with open(checkpoints, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(checkpoint_a) + "\n" + json.dumps(checkpoint_b) + "\n")
        seed_key = f"{tid}::seed"
        with open(ticks, "w", encoding="utf-8") as handle:
            handle.write(json.dumps({
                "row_type": "conviction_event", "thesis_id": tid,
                "at": "2026-08-01T00:00:00Z", "kind": "seed",
                "from_state": "provisional", "to_state": "provisional",
                "edge_locked": 70, "edge_score_live": 70, "conviction": 70,
                "sell_side_rating": "Starter Position Only", "triggering_checkpoint_id": None,
                "evidence_refs": [], "plain_note": "Seeded.", "event_key": seed_key,
            }) + "\n")

        validation_a = (tid, cid_a, "confirmed", "--source-count", "2",
                        "--note", "KPI matched the filing")
        run(root, "screener_rescore.py", *validation_a, "--at", "2026-08-03T12:00:02Z")
        live_projection = json.load(open(state_path, encoding="utf-8"))
        assert live_projection["archived"] is False
        assert len(live_projection["history"]) == 1
        assert seed_key not in live_projection["history"]

        # The validation event is durable, but its projection publication is lost before terminal
        # review handling begins. Archive must derive from that latest journal image, not stale disk.
        write_json(state_path, initial_state)

        # A later adversarial review becomes terminal. The emitter must commit the archive to the
        # append-only journal before publishing the derived snapshot.
        write_json(os.path.join(run_root, "thesis_integrity_review_v2.json"), {
            "routing": "watchlist_integrity_broken",
        })
        run(root, "screener_emit_checkpoints.py", tid)
        events = [row for row in read_rows(ticks) if row.get("row_type") == "conviction_event"]
        archive_events = [row for row in events if row.get("kind") == "integrity_archive"]
        assert len(archive_events) == 1, archive_events
        archive_event = archive_events[0]
        archive_projection = archive_event["state_projection"]
        assert archive_event["terminal_reason"] == "thesis_integrity_review"
        assert archive_event["integrity_routing"] == "watchlist_integrity_broken"
        assert archive_projection["archived"] is True
        assert archive_projection["history"] == [live_projection["history"][0], archive_event["event_key"]]
        assert seed_key not in archive_projection["history"]
        assert archive_projection["edge_score_live"] == live_projection["edge_score_live"]
        assert archive_projection["conviction"] == live_projection["conviction"]
        assert live_projection["history"][-1] in archive_projection["history"]
        assert json.load(open(state_path, encoding="utf-8")) == archive_projection

        # Simulate SIGKILL after the archive event append but before its projection publication. The
        # same terminal operation must recover exactly, without a second event.
        write_json(state_path, live_projection)
        run(root, "screener_emit_checkpoints.py", tid)
        assert json.load(open(state_path, encoding="utf-8")) == archive_projection
        assert len([row for row in read_rows(ticks) if row.get("kind") == "integrity_archive"]) == 1

        # An older validation retry already has its own event. Recovery must choose the later-appended
        # terminal archive image, not silently reopen the thesis from the validation projection.
        rows_before_retry = read_rows(ticks)
        run(root, "screener_rescore.py", *validation_a, "--at", "2026-08-03T12:00:04Z")
        assert read_rows(ticks) == rows_before_retry
        assert json.load(open(state_path, encoding="utf-8")) == archive_projection

        # A genuinely new validation also fails closed: no validation/event append and no projection
        # change until the explicit restore command creates a later live journal transaction.
        state_before_new = json.load(open(state_path, encoding="utf-8"))
        rows_before_new = read_rows(ticks)
        rejected = run_result(root, "screener_rescore.py", tid, cid_b, "confirmed",
                              "--source-count", "2", "--note", "Margin matched the filing",
                              "--at", "2026-08-04T12:00:00Z")
        assert rejected.returncode != 0, rejected
        assert "archived" in rejected.stderr.lower(), rejected.stderr
        assert read_rows(ticks) == rows_before_new
        assert json.load(open(state_path, encoding="utf-8")) == state_before_new

        # Restore also reads journal-first. Even if its mutable file regressed to a stale live image,
        # the later archive event remains authoritative and is the basis of the explicit recovery.
        write_json(state_path, live_projection)
        run(root, "screener_restore_conviction.py", tid, "transaction-test")
        restored_projection = json.load(open(state_path, encoding="utf-8"))
        assert restored_projection["archived"] is False
        assert archive_event["event_key"] in restored_projection["history"]
        run(root, "screener_rescore.py", tid, cid_b, "confirmed", "--source-count", "2",
            "--note", "Margin matched the filing", "--at", "2026-08-04T12:00:00Z")
        assert json.load(open(state_path, encoding="utf-8"))["archived"] is False
    finally:
        shutil.rmtree(root, ignore_errors=True)


def test_terminal_archive_refuses_unrecoverable_latest_event() -> None:
    root = fixture()
    try:
        signal = "SIG-20260803-dddddddd"
        tid = f"THS-{signal}-v1"
        state_path = os.path.join(
            root, "screener", "ledger", "conviction", "conviction_state", f"{tid}.json",
        )
        ticks = os.path.join(root, "screener", "ledger", "conviction", "conviction.ndjson")
        run_root = os.path.join(root, "screener", "runs", signal)
        state = {
            "thesis_id": tid, "state": "provisional", "sell_side_rating": "Starter Position Only",
            "edge_locked": 70, "edge_score_live": 70, "conviction": 70,
            "trajectory": [{"at": "2026-08-01T00:00:00Z", "edge": 70}], "history": [],
            "archived": False, "stale": False,
        }
        write_json(os.path.join(root, "screener", "ledger", "theses", f"{tid}.json"), {
            "run_root": os.path.relpath(run_root, root),
            "meta": {"thesis_id": tid, "signal_id": signal, "locked": True,
                     "status": "provisional", "created_at": "2026-08-01T00:00:00Z"},
        })
        write_json(state_path, state)
        write_json(os.path.join(run_root, "thesis_integrity_review.json"), {
            "routing": "watchlist_integrity_downgrade",
        })
        os.makedirs(os.path.dirname(ticks), exist_ok=True)
        with open(ticks, "w", encoding="utf-8") as handle:
            handle.write(json.dumps({
                "row_type": "conviction_event", "thesis_id": tid,
                "at": "2026-08-02T00:00:00Z", "kind": "hold",
                "from_state": "provisional", "to_state": "provisional",
                "edge_locked": 70, "edge_score_live": 75,
                "sell_side_rating": "Starter Position Only", "event_key": f"{tid}::broken",
                # Deliberately no state_projection: disk cannot prove what this commit produced.
            }) + "\n")

        before_rows = read_rows(ticks)
        rejected = run_result(root, "screener_emit_checkpoints.py", tid)
        assert rejected.returncode != 0, rejected
        assert "no valid recovery projection" in rejected.stderr, rejected.stderr
        assert read_rows(ticks) == before_rows
        assert json.load(open(state_path, encoding="utf-8")) == state
    finally:
        shutil.rmtree(root, ignore_errors=True)


if __name__ == "__main__":
    test_rescore_retry()
    test_restore_retry()
    test_terminal_integrity_archive_wins_journal_order()
    test_terminal_archive_refuses_unrecoverable_latest_event()
    print("conviction transactions: rescore, restore, and terminal archive convergence passed")
