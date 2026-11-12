#!/usr/bin/env python3
"""Crash/retry convergence tests for conviction rescore and restore transactions."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path


HERE = os.path.dirname(os.path.abspath(__file__))


def write_json(path: str, value: object) -> None:
    # These transaction tests exercise real prospective schema admission. Keep their selected
    # overrides, filling the research record/review from the canonical synthetic tracked fixture.
    if "/ledger/theses/" in path:
        value = merge(canonical("thesis_record", Path(path).stem.removeprefix("THS-").rsplit("-v", 1)[0]), value)
    elif "thesis_integrity_review" in Path(path).name:
        base = canonical("thesis_integrity_review", Path(path).parent.name)
        routing = value.get("routing")
        base["verdict"] = {"watchlist_integrity_broken": "Thesis broken",
                           "watchlist_integrity_downgrade": "Does not survive — downgrade"}.get(routing, base["verdict"])
        value = merge(base, value)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2)
        handle.write("\n")


def read_rows(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    return [json.loads(line) for line in open(path, encoding="utf-8") if line.strip()]


def fixture() -> str:
    outputs = os.path.join(os.path.dirname(HERE), ".cache", "test-output")
    os.makedirs(outputs, exist_ok=True)
    root = tempfile.mkdtemp(prefix="conviction-transaction-", dir=outputs)
    subprocess.run(["git", "init", "-q", "-b", "codex/conviction-fixture", root], check=True)
    os.makedirs(os.path.join(root, "scripts"), exist_ok=True)
    for name in ("append-ndjson.sh", "repo_mutation.py", "screener_emit_checkpoints.py",
                 "screener_rescore.py", "screener_restore_conviction.py", "update_board_index.py",
                 "canonical_json.py", "recover_idea_board_history.py"):
        shutil.copy2(os.path.join(HERE, name), os.path.join(root, "scripts", name))
    manifest = Path(root, ".claude/agents/screener/SWARM.md")
    manifest.parent.mkdir(parents=True)
    shutil.copy2(Path(HERE).parent / ".claude/agents/screener/SWARM.md", manifest)
    schemas = Path(root, "frameworks/screener")
    schemas.mkdir(parents=True)
    for source in Path(HERE).parent.joinpath("frameworks/screener").glob("*.schema.json"):
        shutil.copy2(source, schemas / source.name)
    Path(root, ".gitignore").write_text(".cache/\n.pycache/\n__pycache__/\n")
    subprocess.run(["git", "-C", root, "add", "."], check=True)
    subprocess.run(["git", "-C", root, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                    "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "-qm", "fixture program"], check=True)
    return root


def canonical(name: str, signal: str) -> dict:
    original = "SIG-20260610-a3f2c81d"
    return json.loads(Path(HERE).parent.joinpath("screener/runs", original, name + ".json")
                      .read_text().replace(original, signal))


def merge(base: dict, overrides: dict) -> dict:
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            merge(base[key], value)
        else:
            base[key] = value
    return base


def environment(root: str) -> dict:
    temporary = Path(root, ".cache/tmp")
    temporary.mkdir(parents=True, exist_ok=True)
    env = {**os.environ, "PYTHONPATH": HERE, "PYTHONDONTWRITEBYTECODE": "1", "TMPDIR": str(temporary),
           "ENGINE_TEST_RUN": "1", "ENGINE_NO_PUSH": "1", "NOSTRA_REPO_LOCK_WAIT_MS": "1000"}
    for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR", "NOSTRA_REPO_LOCK_FD",
                "NOSTRA_COCKPIT_RUN", "NOSTRA_PUBLICATION_ENDPOINT", "NOSTRA_PUBLICATION_TOKEN", "NOSTRA_PUBLICATION_SOCKET"):
        env.pop(key, None)
    return env


def run(root: str, script: str, *args: str) -> None:
    subprocess.run(
        ["python3", os.path.join(root, "scripts", script), *args],
        cwd=root,
        env=environment(root),
        check=True,
        stdout=subprocess.DEVNULL,
    )


def run_result(root: str, script: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["python3", os.path.join(root, "scripts", script), *args],
        cwd=root,
        env=environment(root),
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
            "conviction": 70, "validated": False, "updated_at": "2026-08-01T00:00:00Z",
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
            "validated": False, "updated_at": "2026-08-01T00:00:00Z",
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
            "validated": False, "updated_at": "2026-08-01T00:00:00Z",
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


def commit_fixture(root: str) -> None:
    subprocess.run(["git", "-C", root, "add", "."], check=True, env=environment(root))
    subprocess.run(["git", "-C", root, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                    "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "-qm", "fixture history"],
                   check=True, env=environment(root))


def domain_bytes(root: str) -> dict:
    return {str(p.relative_to(root)): p.read_bytes() for p in Path(root, "screener").rglob("*") if p.is_file()}


def seeded_fixture(root: str) -> tuple:
    signal = "SIG-20260610-a3f2c81d"
    tid = f"THS-{signal}-v1"
    rec_path = Path(root, "screener/ledger/theses", tid + ".json")
    state_path = Path(root, "screener/ledger/conviction/conviction_state", tid + ".json")
    review_path = Path(root, "screener/runs", signal, "thesis_integrity_review.json")
    write_json(str(rec_path), canonical("thesis_record", signal))
    write_json(str(review_path), canonical("thesis_integrity_review", signal))
    run(root, "screener_emit_checkpoints.py", tid)
    cps = read_rows(str(Path(root, "screener/ledger/conviction/checkpoints.ndjson")))
    return tid, cps[0]["checkpoint_id"], rec_path, state_path, review_path


def test_prewrite_recovery_and_archive_inputs() -> None:
    for branch in ("archive", "archive-recovery", "rescore-recovery"):
        for variant in ("valid-changed", "fresh-null", "history-null"):
            root = fixture()
            try:
                tid, cid, record_path, state_path, review_path = seeded_fixture(root)
                original_state = json.loads(state_path.read_text())
                checkpoints = Path(root, "screener/ledger/conviction/checkpoints.ndjson")
                original_checkpoints = checkpoints.read_bytes()
                arguments = (tid, cid, "confirmed", "--source-count", "2", "--at", "2026-06-11T12:00:00Z")
                if branch == "rescore-recovery":
                    run(root, "screener_rescore.py", *arguments)
                else:
                    write_json(str(review_path), {"routing": "watchlist_integrity_broken"})
                    if branch == "archive-recovery":
                        run(root, "screener_emit_checkpoints.py", tid)
                expected_state = json.loads(state_path.read_text())
                write_json(str(state_path), original_state)
                checkpoints.write_bytes(original_checkpoints)
                record = json.loads(record_path.read_text())
                record["M0_6_1"]["analyst_rating_distribution"]["missing_reason"] = (
                    None if variant.endswith("null") else "Synthetic changed input control.")
                write_json(str(record_path), record)
                if variant == "history-null":
                    commit_fixture(root)
                before = domain_bytes(root)
                result = (run_result(root, "screener_rescore.py", *arguments) if branch == "rescore-recovery"
                          else run_result(root, "screener_emit_checkpoints.py", tid))
                if variant == "fresh-null":
                    assert result.returncode != 0 and "missing_reason" in result.stderr, result
                    assert domain_bytes(root) == before, (branch, variant)
                else:
                    assert result.returncode == 0, result.stderr
                    assert json.loads(state_path.read_text()) != original_state
                    if branch.endswith("recovery"):
                        assert json.loads(state_path.read_text()) == expected_state
                    assert record_path.read_bytes() == before[str(record_path.relative_to(root))]
                print(f"prewrite {branch}/{variant}: passed")
            finally:
                shutil.rmtree(root, ignore_errors=True)


def test_prewrite_batch_and_strict_outputs() -> None:
    # A later bad thesis must not allow the first valid thesis to append checkpoints.
    root = fixture()
    try:
        for signal in ("SIG-20260610-aaaaaaaa", "SIG-20260610-ffffffff"):
            record = canonical("thesis_record", signal)
            if signal.endswith("ffffffff"):
                record["M0_6_1"]["analyst_rating_distribution"]["missing_reason"] = None
            write_json(str(Path(root, "screener/ledger/theses", f"THS-{signal}-v1.json")), record)
            write_json(str(Path(root, "screener/runs", signal, "thesis_integrity_review.json")),
                       canonical("thesis_integrity_review", signal))
        before = domain_bytes(root)
        result = run_result(root, "screener_emit_checkpoints.py")
        assert result.returncode != 0 and "missing_reason" in result.stderr, result
        assert domain_bytes(root) == before
        print("prewrite whole-batch later-invalid input: passed")
    finally:
        shutil.rmtree(root, ignore_errors=True)

    for branch in ("seed", "archive", "archive-recovery", "rescore", "rescore-recovery"):
        root = fixture()
        try:
            tid, cid, record_path, state_path, review_path = seeded_fixture(root)
            args = (tid, cid, "confirmed", "--source-count", "2", "--at", "2026-06-11T12:00:00Z")
            ticks = Path(root, "screener/ledger/conviction/conviction.ndjson")
            if branch.endswith("recovery"):
                if branch == "archive-recovery":
                    write_json(str(review_path), {"routing": "watchlist_integrity_broken"})
                    run(root, "screener_emit_checkpoints.py", tid)
                else:
                    run(root, "screener_rescore.py", *args)
                rows = read_rows(str(ticks))
                rows[-1]["state_projection"]["conviction"] = 101
                ticks.write_text("".join(json.dumps(row) + "\n" for row in rows))
            elif branch == "archive":
                state = json.loads(state_path.read_text())
                state["conviction"] = 101
                write_json(str(state_path), state)
                write_json(str(review_path), {"routing": "watchlist_integrity_broken"})
                commit_fixture(root)
            else:
                record = json.loads(record_path.read_text())
                record["M0_6_6"]["final_score"] = 101
                write_json(str(record_path), record)
                commit_fixture(root)  # Immutable historical input is exempt; the NEW state is not.
                if branch == "seed":
                    state_path.unlink()
                    Path(root, "screener/ledger/conviction/checkpoints.ndjson").write_text("")
                    ticks.write_text("")
            before = domain_bytes(root)
            result = (run_result(root, "screener_rescore.py", *args) if branch.startswith("rescore")
                      else run_result(root, "screener_emit_checkpoints.py", tid))
            assert result.returncode != 0, (branch, result)
            assert "schema" in result.stderr.lower(), result.stderr
            assert domain_bytes(root) == before, (branch, "invalid prospective state wrote an earlier journal/checkpoint")
            print(f"prewrite {branch}/invalid prospective output: passed")
        finally:
            shutil.rmtree(root, ignore_errors=True)


def test_prewrite_selected_review_and_board_state() -> None:
    for recovery in (False, True):
        root = fixture()
        try:
            tid, _, _, state_path, review_path = seeded_fixture(root)
            original = json.loads(state_path.read_text())
            write_json(str(review_path), {"routing": "watchlist_integrity_broken"})
            if recovery:
                run(root, "screener_emit_checkpoints.py", tid)
                write_json(str(state_path), original)
            review = json.loads(review_path.read_text())
            review["edge_score_haircut_note"] = None
            write_json(str(review_path), review)
            before = domain_bytes(root)
            result = run_result(root, "screener_emit_checkpoints.py", tid)
            assert result.returncode != 0 and "edge_score_haircut_note" in result.stderr, result
            assert domain_bytes(root) == before
            print(f"prewrite selected review/archive-recovery={recovery}: passed")
        finally:
            shutil.rmtree(root, ignore_errors=True)
    for historical in (False, True):
        root = fixture()
        try:
            _, _, _, state_path, _ = seeded_fixture(root)
            state = json.loads(state_path.read_text())
            state["conviction"] = 101
            write_json(str(state_path), state)
            if historical:
                commit_fixture(root)
            before = domain_bytes(root)
            result = run_result(root, "update_board_index.py")
            if historical:
                assert result.returncode == 0, result.stderr
                assert state_path.read_bytes() == before[str(state_path.relative_to(root))]
                assert Path(root, "screener/board/index.json").is_file()
            else:
                assert result.returncode != 0 and "conviction" in result.stderr, result
                assert domain_bytes(root) == before
            print(f"prewrite board state/history={historical}: passed")
        finally:
            shutil.rmtree(root, ignore_errors=True)


if __name__ == "__main__":
    test_rescore_retry()
    test_restore_retry()
    test_terminal_integrity_archive_wins_journal_order()
    test_terminal_archive_refuses_unrecoverable_latest_event()
    test_prewrite_recovery_and_archive_inputs()
    test_prewrite_batch_and_strict_outputs()
    test_prewrite_selected_review_and_board_state()
    print("conviction transactions: rescore, restore, and terminal archive convergence passed")
