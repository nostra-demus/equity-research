#!/usr/bin/env python3
"""Focused parity/safety tests for intake_execution_receipt.py."""
from __future__ import annotations

import hashlib
import argparse
import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from canonical_json import canonical_json, canonical_sha256  # noqa: E402
from ledger_records import load_one  # noqa: E402
from intake_execution_receipt import create  # noqa: E402


SCRIPT = HERE / "intake_execution_receipt.py"
FP = lambda run, record: "sha256:" + hashlib.sha256((run + "\n" + canonical_json(record)).encode()).hexdigest()


def run(*args: str, ok: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run([sys.executable, str(SCRIPT), *args], text=True, capture_output=True)
    if ok and result.returncode != 0:
        raise AssertionError(result.stderr)
    if not ok and result.returncode == 0:
        raise AssertionError("command unexpectedly succeeded")
    return result


with tempfile.TemporaryDirectory(prefix="intake-receipt-") as temp:
    repo = Path(temp)
    rr = "analyses/AAA_2026-08-14"
    root = repo / rr
    (root / "intake").mkdir(parents=True)
    decision = {"ticker": "AAA", "decision": "Watchlist", "confidence_score": 0.6}
    (root / "decision_record.json").write_text(json.dumps(decision), encoding="utf-8")
    # Pin research effective-record parity: the receipt helper must apply the same append-only correction
    # projection as readDataNeeds, not hash raw decision bytes.
    (root / "corrections.json").write_text(json.dumps({
        "schema": "corrections/v1",
        "errata": [{"field": "confidence_score", "kind": "scale_fix"}],
    }), encoding="utf-8")
    effective = load_one(str(root))
    current_fp = FP(rr, effective)
    raw_fp = FP(rr, decision)
    assert current_fp != raw_fp

    plan_path = f"{rr}/intake/2026-08-14_intake_plan.json"
    plan = {
        "schema_version": "1.1", "swarm": "research", "subject": "AAA", "ticker": "AAA",
        "run_root": rr, "decision_fingerprint": current_fp,
        "rerun_plan": {"commands": [{"module": "earnings", "agent": "revenue-drivers"}]},
    }
    (repo / plan_path).write_text(json.dumps(plan, indent=2), encoding="utf-8")
    plan_sha = "sha256:" + canonical_sha256(plan)
    subprocess.run(["git", "-C", str(repo), "init", "-q"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.email", "receipt-test@example.invalid"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.name", "Receipt Test"], check=True)
    subprocess.run(["git", "-C", str(repo), "add", "--", plan_path], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-q", "-m", "plan"], check=True)
    common = (
        "--repo-root", str(repo), "--swarm", "research", "--subject", "AAA",
        "--run-root", rr, "--plan-path", plan_path, "--plan-sha256", plan_sha,
        "--source-decision-fingerprint", current_fp,
        "--module", "earnings", "--agent", "revenue-drivers",
    )
    assert "PREFLIGHT: OK" in run("preflight", *common, "--current-decision-fingerprint", current_fp).stdout
    stale = "sha256:" + "f" * 64
    assert "current decision fingerprint mismatch" in run(
        "preflight", *common, "--current-decision-fingerprint", stale, ok=False,
    ).stderr

    created = run(
        "create", *common, "--executed-against-decision-fingerprint", current_fp,
    ).stdout.strip().split()
    receipt_path, receipt_id = created[1], created[2]
    receipt = json.loads((repo / receipt_path).read_text(encoding="utf-8"))
    assert receipt["receipt_id"] == receipt_id
    assert receipt["result_decision_fingerprint"] == current_fp, "result uses corrected effective record"
    assert receipt["source_decision_fingerprint"] == current_fp
    assert receipt["executed_against_decision_fingerprint"] == current_fp
    payload = dict(receipt)
    payload.pop("receipt_id")
    assert receipt_id == "sha256:" + canonical_sha256(payload)
    assert receipt["executed_orbs"] == [{"module": "earnings", "agent": "revenue-drivers"}]

    subprocess.run(["git", "-C", str(repo), "add", "--", receipt_path], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-q", "-m", "receipt"], check=True)
    cleanup = run("cleanup", "--repo-root", str(repo), "--receipt-path", receipt_path,
                  "--receipt-id", receipt_id, ok=False)
    assert "refusing to remove a committed receipt" in cleanup.stderr
    assert (repo / receipt_path).is_file()

    # Both paid boundaries reject replay once the exact plan/orb receipt is committed.
    assert "already has a committed receipt" in run(
        "preflight", *common, "--current-decision-fingerprint", current_fp, ok=False,
    ).stderr
    assert "already has a committed receipt" in run(
        "create", *common, "--executed-against-decision-fingerprint", current_fp, ok=False,
    ).stderr

    # Cleanup/preflight never follow a final symlink. The linked target remains untouched.
    link_path = Path(receipt_path).with_name("20260814T120000000Z_" + receipt_id[7:19] + ".json")
    (repo / link_path).symlink_to(repo / receipt_path)
    assert "symlink" in run(
        "cleanup", "--repo-root", str(repo), "--receipt-path", link_path.as_posix(),
        "--receipt-id", receipt_id, ok=False,
    ).stderr
    assert (repo / receipt_path).is_file()
    (repo / link_path).unlink()

    original_plan = (repo / plan_path).read_bytes()
    real_plan = repo / (plan_path + ".real")
    real_plan.write_bytes(original_plan)
    (repo / plan_path).unlink()
    (repo / plan_path).symlink_to(real_plan)
    assert "symlink" in run(
        "preflight", *common, "--current-decision-fingerprint", current_fp, ok=False,
    ).stderr
    (repo / plan_path).unlink()
    (repo / plan_path).write_bytes(original_plan)

    # Content binding: modifying the plan while replaying its old hash/source intent fails before work.
    plan["summary"] = "tampered"
    (repo / plan_path).write_text(json.dumps(plan), encoding="utf-8")
    assert "plan hash mismatch" in run(
        "preflight", *common, "--current-decision-fingerprint", current_fp, ok=False,
    ).stderr

with tempfile.TemporaryDirectory(prefix="intake-receipt-dangling-") as temp:
    repo = Path(temp)
    rr = "analyses/LINK_2026-08-14"
    root = repo / rr
    (root / "intake").mkdir(parents=True)
    decision = {"ticker": "LINK", "decision": "Watchlist", "confidence_score": 0.5}
    (root / "decision_record.json").write_text(json.dumps(decision), encoding="utf-8")
    fp = FP(rr, decision)
    plan_path = f"{rr}/intake/2026-08-14_intake_plan.json"
    plan = {
        "schema_version": "1.1", "swarm": "research", "subject": "LINK", "ticker": "LINK",
        "run_root": rr, "decision_fingerprint": fp,
        "rerun_plan": {"commands": [{"module": "earnings", "agent": "revenue-drivers"}]},
    }
    (repo / plan_path).write_text(json.dumps(plan), encoding="utf-8")
    sha = "sha256:" + canonical_sha256(plan)
    subprocess.run(["git", "-C", str(repo), "init", "-q"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.email", "receipt-test@example.invalid"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.name", "Receipt Test"], check=True)
    subprocess.run(["git", "-C", str(repo), "add", "--", plan_path], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-q", "-m", "plan"], check=True)
    (root / "intake" / "receipts").symlink_to(root / "missing-receipts")
    common = (
        "--repo-root", str(repo), "--swarm", "research", "--subject", "LINK", "--run-root", rr,
        "--plan-path", plan_path, "--plan-sha256", sha, "--source-decision-fingerprint", fp,
        "--module", "earnings", "--agent", "revenue-drivers",
    )
    assert "receipts directory is unsafe" in run(
        "preflight", *common, "--current-decision-fingerprint", fp, ok=False,
    ).stderr
    create_failure = run(
        "create", *common, "--executed-against-decision-fingerprint", fp, ok=False,
    ).stderr
    assert "receipts" in create_failure and ("unsafe" in create_failure or "not a direct" in create_failure)

# Commodity cockpit receipts are dependent on the supervisor-created immutable archive, so the paid
# child queues a post-extinction receipt intent and writes no provisional file.
saved_cockpit = os.environ.get("NOSTRA_COCKPIT_RUN")
try:
    os.environ["NOSTRA_COCKPIT_RUN"] = "1"
    args = argparse.Namespace(
        swarm="commodity", subject="GOLD", run_root="commodity/runs/GOLD",
        plan_path="commodity/runs/GOLD/intake/plan.json", plan_sha256="sha256:" + "1" * 64,
        source_decision_fingerprint="sha256:" + "2" * 64,
        executed_against_decision_fingerprint="sha256:" + "3" * 64,
        module="supply-demand", agent="mine-supply",
    )
    captured = io.StringIO()
    with patch("supervisor_publication.post", return_value={
        "ok": True, "phase": "queued", "intentId": "8a1ed665-329a-4396-89b1-f8a1888320cf",
    }) as delegated, contextlib.redirect_stdout(captured):
        create(args)
    delegated.assert_called_once_with({
        "phase": "intake-receipt",
        "executedAgainstDecisionFingerprint": args.executed_against_decision_fingerprint,
    }, timeout=5 * 60)
    assert captured.getvalue().strip() == (
        "INTAKE-RECEIPT: deferred/8a1ed665-329a-4396-89b1-f8a1888320cf.json sha256:" + "0" * 64
    )
finally:
    if saved_cockpit is None:
        os.environ.pop("NOSTRA_COCKPIT_RUN", None)
    else:
        os.environ["NOSTRA_COCKPIT_RUN"] = saved_cockpit

print("test_intake_execution_receipt: PASS")
