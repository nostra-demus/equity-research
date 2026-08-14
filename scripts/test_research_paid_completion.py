#!/usr/bin/env python3
"""Crash-matrix regressions for paid final-audit and derived-memo recovery."""
from __future__ import annotations

import json
import os
import shutil
import tempfile
import datetime as dt

from create_idea_projection_manifest import create as create_projection_manifest, file_digest
from freeze_idea_admission import freeze
import test_freeze_idea_admission as freeze_test
import research_paid_completion as paid_completion
from research_paid_completion import (
    _memo_output_valid,
    apply_diagnostic_transforms,
    arm_final_projection,
    arm_master_synthesis,
    arm_derived_memo,
    checkpoint_diagnostic_pair,
    diagnostic_audit_plan,
    derived_memo_plan,
    final_audit_plan,
    promote_derived_memos,
    recover_final_projection,
    recover_master_synthesis,
    require_diagnostic_audits,
    require_final_audits,
    require_projection_paid_completion,
    seal_diagnostic_audit_inputs,
    seal_derived_memo,
    seal_final_audit_inputs,
)
from test_freeze_idea_admission import fixture as admitted_fixture


NOW = "2026-08-14T12:00:00Z"
REAL_REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def write_json(path: str, value: dict) -> None:
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2)
        handle.write("\n")


def audit_fixture(
    repo: str, *, ticker: str = "AUDIT", run_date: str = "2026-08-14"
) -> tuple[str, str, dict[str, dict]]:
    run_root = f"analyses/{ticker}_{run_date}"
    run = os.path.join(repo, run_root)
    os.makedirs(run)
    with open(os.path.join(run, "final_thesis.md"), "w", encoding="utf-8") as handle:
        handle.write("# Final thesis\n\nDecision: Watchlist.\n")
    write_json(os.path.join(run, "decision_record.json"), {
        "ticker": ticker, "decision_date": run_date, "run_root": run_root,
        "decision": "Watchlist", "confidence_score": 55,
    })
    identity = {
        "schema_version": "1.0", "ticker": ticker, "run_root": run_root,
        "final_thesis_path": run_root + "/final_thesis.md",
        "decision_record_path": run_root + "/decision_record.json",
        "final_thesis_sha256": file_digest(os.path.join(run, "final_thesis.md")),
        "decision_record_sha256": file_digest(os.path.join(run, "decision_record.json")),
    }
    audits = {
        "verification": {
            **identity, "verified_at": NOW, "verifier": "verify-evidence", "verdict": "Clean",
            "claims_checked": 3, "claim_checks": [], "math_checks": [], "anchor_checks": [],
            "integrity_score": 94, "blocking_findings": [], "notes": "",
        },
        "pre_mortem": {
            **identity, "performed_at": NOW, "auditor": "pre-mortem", "verdict": "Survives",
            "original_decision": "Watchlist", "adversarial_direction": "downside",
            "pre_mortem_narrative": "Stress test.", "bear_case": "Demand falls.",
            "bull_case_steelman": "Demand rises.", "killer_risk": "Demand collapse.",
            "kill_criteria_attack": [], "variant_perception_attack": {},
            "value_trap_check": "No", "base_rate_check": "Matched.",
            "overconfidence_flags": [], "disconfirming_evidence_present": [],
            "what_would_change_the_call": [],
            "survives": True, "original_confidence": 55, "confidence_haircut": 0,
            "recommended_confidence": 55, "recommended_rating_cap": "", "notes": "",
        },
        "expectations_gap": {
            **identity, "performed_at": NOW, "analyst": "expectations-gap",
            "current_price": 100, "price_is_indicative": False,
            "consensus_expectations": "Flat", "market_implied_expectations": "Flat",
            "engine_view": "Slightly better", "what_everyone_knows": "Demand is cyclical.",
            "what_is_priced_in": "Flat demand.", "what_market_may_be_missing": "Efficiency.",
            "evidence_engine_is_different": "Filed margins.", "base_rate_check": "Matched.",
            "variant_perception_quality": "Moderate", "is_exploitable": True, "edge_score": 62,
            "gap_direction": "undervalued", "gap_magnitude_pct": 12,
            "gap_is_robust": True, "notes": "",
        },
    }
    return run_root, run, audits


def final_name(kind: str, version: int) -> str:
    stem = {"verification": "verification_report", "pre_mortem": "pre_mortem",
            "expectations_gap": "expectations_gap"}[kind]
    return f"{stem}.json" if version == 1 else f"{stem}_v{version}.json"


def rebound_audits(audits: dict[str, dict], run_root: str, run: str) -> dict[str, dict]:
    rebound = json.loads(json.dumps(audits))
    for value in rebound.values():
        value["final_thesis_path"] = run_root + "/final_thesis.md"
        value["decision_record_path"] = run_root + "/decision_record.json"
        value["final_thesis_sha256"] = file_digest(os.path.join(run, "final_thesis.md"))
        value["decision_record_sha256"] = file_digest(os.path.join(run, "decision_record.json"))
    return rebound


def install_master_contracts(repo: str) -> None:
    os.makedirs(os.path.join(repo, ".claude", "agents"), exist_ok=True)
    with open(os.path.join(repo, ".claude", "agents", "synthesizer.md"), "w", encoding="utf-8") as handle:
        handle.write("# Master synthesizer contract\nversion: 1\n")
    schema_dir = os.path.join(repo, "frameworks", "ideas")
    os.makedirs(schema_dir, exist_ok=True)
    shutil.copyfile(
        os.path.join(REAL_REPO, "frameworks", "ideas", "idea-assessment.schema.json"),
        os.path.join(schema_dir, "idea-assessment.schema.json"),
    )


def preliminary_assessment(run_root: str, ticker: str, created_at: str = "2000-01-01T00:00:00Z") -> dict:
    run_date = run_root.rsplit("_", 1)[-1]
    return {
        "schema_version": "idea-assessment/v1",
        "assessment_id": f"{ticker}-{run_date}-3-6m",
        "run_root": run_root,
        "created_at": created_at,
        "ticker": ticker,
        "company": None,
        "status": "not_assessable",
        "gaps": ["Pending post-audit projection manifest and canonical market evidence."],
        "candidate": None,
    }


def master_fixture(repo: str, ticker: str = "MASTER") -> tuple[str, str]:
    install_master_contracts(repo)
    run_root = f"analyses/{ticker}_2026-08-14"
    run = os.path.join(repo, run_root)
    module = os.path.join(run, "alpha")
    os.makedirs(module)
    with open(os.path.join(module, "99_alpha-synthesis.md"), "w", encoding="utf-8") as handle:
        handle.write("# Alpha synthesis\n\nVerdict: Mixed.\n")
    pool = os.path.join(run, "_pool_extracts")
    os.makedirs(pool)
    write_json(os.path.join(pool, "manifest.json"), {
        "schema_version": "test", "sources": [{"path": "filing-v1.pdf"}],
    })
    write_json(os.path.join(pool, "ciq_facts.json"), {"schema_version": "test", "facts": {}})
    return run_root, run


def write_staged_master(repo: str, result: dict, run_root: str, ticker: str, *, suffix: str = "") -> None:
    staged = result["staged_outputs"]
    with open(os.path.join(repo, staged["final_thesis.md"]), "w", encoding="utf-8") as handle:
        handle.write(f"# Final thesis{suffix}\n\nDecision: Watchlist.\n")
    write_json(os.path.join(repo, staged["decision_record.json"]), {
        "ticker": ticker,
        "decision_date": run_root.rsplit("_", 1)[-1],
        "run_root": run_root,
        "final_thesis_path": run_root + "/final_thesis.md",
        "decision": "Watchlist",
        "confidence_score": 55,
    })
    write_json(
        os.path.join(repo, staged["idea_3_6m.json"]),
        preliminary_assessment(run_root, ticker, NOW),
    )


def projection_fixture(repo: str, ticker: str) -> tuple[str, str]:
    install_master_contracts(repo)
    run_root, run, audits = audit_fixture(repo, ticker=ticker, run_date="2026-08-13")
    for kind, value in audits.items():
        write_json(os.path.join(run, final_name(kind, 1)), value)
    write_json(os.path.join(run, "idea_3_6m.json"), preliminary_assessment(run_root, ticker))
    create_projection_manifest(run_root, repo)
    return run_root, run


FILLER = (
    "The sealed synthesis ties this finding to cited evidence, states the uncertainty, "
    "and preserves the standing verdict without adding analysis. "
)


def complete_module_memo(module: str, suffix: str = "") -> str:
    sections = (
        "Scores at a Glance", "What This Module Found", "The Specialists, Briefly",
        "What Would Change This Read", "Bottom Line", "Plain-English Glossary",
    )
    body = [f"# {module.title()} Module Memo — MEMO", "", "Verdict: Mixed — exact synthesis view.", ""]
    for heading in sections:
        body.extend([f"## {heading}", "", (FILLER * 14).strip(), ""])
    body.append("The final line closes the memo with the same evidence-bound verdict." + suffix)
    return "\n".join(body) + "\n"


def complete_top_memo(decision: str = "Buy", suffix: str = "") -> str:
    sections = (
        "The Decision at a Glance", "What the Company Does", "The Variant Perception",
        "Why It Could Work — Bull Case", "Why It Could Fail — Bear Case & The Killer Risk",
        "Avoid-Big-Risks Check", "Valuation & Fair Value", "Catalysts", "Scenario Model",
        "What Would Change Our Mind", "Second-Best Bet",
        "What We'd Need to Get More Confident", "Bottom Line", "Plain-English Glossary",
    )
    body = ["# MEMO Colleague Memo", "", f"Decision: {decision} — exact standing decision.", ""]
    for heading in sections:
        body.extend([f"## {heading}", "", (FILLER * 12).strip(), ""])
    body.append("The final line closes the colleague memo without changing the decision." + suffix)
    return "\n".join(body) + "\n"


with tempfile.TemporaryDirectory(prefix="paid-authority-rollout-") as repo:
    run_root, run, audits = audit_fixture(repo, ticker="NOSEAL")
    for kind, value in audits.items():
        write_json(os.path.join(run, final_name(kind, 1)), value)
    try:
        create_projection_manifest(run_root, repo)
        raise AssertionError("a current-date no-seal trio must not be promoted as final")
    except ValueError as exc:
        assert "requires diagnostic_audit_inputs.json" in str(exc)
    try:
        seal_final_audit_inputs(run_root, repo)
        raise AssertionError("a current-date final seal must not bypass the diagnostic checkpoint")
    except ValueError as exc:
        assert "requires diagnostic inputs" in str(exc)


with tempfile.TemporaryDirectory(prefix="paid-authority-legacy-") as repo:
    run_root, run, audits = audit_fixture(repo, ticker="LEGACY", run_date="2026-08-13")
    for kind, value in audits.items():
        write_json(os.path.join(run, final_name(kind, 1)), value)
    assert create_projection_manifest(run_root, repo)["schema_version"] == "idea-projection-manifest/v1"


with tempfile.TemporaryDirectory(prefix="paid-audit-recovery-") as repo:
    os.makedirs(os.path.join(repo, "scripts"))
    with open(os.path.join(repo, "scripts", "eval.py"), "w", encoding="utf-8") as handle:
        handle.write(
            "import sys\n"
            "assert sys.argv[1] == '--data-needs-prewrite'\n"
            "print('DATA-NEEDS-PREWRITE: PASS')\n"
        )
    run_root, run, audits = audit_fixture(repo)
    initial = diagnostic_audit_plan(run_root, repo)
    assert initial["status"] == "unsealed" and initial["audits"] == {}
    diagnostic_seal = seal_diagnostic_audit_inputs(run_root, repo)
    assert diagnostic_seal["status"] == "created"
    assert seal_diagnostic_audit_inputs(run_root, repo)["status"] == "existing"

    # Crash after each paid diagnostic Task.  The pre-diagnostic snapshots and reserved versions let the
    # restart validate each canonical report independently and launch only the missing kinds.
    plan = diagnostic_audit_plan(run_root, repo)
    assert plan["input_state"] == "ready"
    assert all(row["action"] == "run" for row in plan["audits"].values())
    assert all(row["minimum_version"] == 1 for row in plan["audits"].values())
    completed: list[str] = []
    for kind in ("verification", "pre_mortem", "expectations_gap"):
        write_json(os.path.join(run, final_name(kind, 1)), audits[kind])
        completed.append(kind)
        plan = diagnostic_audit_plan(run_root, repo)
        assert {name for name, row in plan["audits"].items() if row["action"] == "reuse"} == set(completed)
        assert {name for name, row in plan["audits"].items() if row["action"] == "run"} == (
            {"verification", "pre_mortem", "expectations_gap"} - set(completed)
        )
    assert require_diagnostic_audits(run_root, repo)["all_complete"] is True
    try:
        create_projection_manifest(run_root, repo)
        raise AssertionError("diagnostic reports must never be promoted as the final audit trio")
    except ValueError as exc:
        assert "diagnostic checkpoint" in str(exc)
    try:
        require_projection_paid_completion(run_root, repo)
        raise AssertionError("publication authority must reject the diagnostic trio")
    except ValueError:
        pass

    # Unknown post-seal bytes are never called an interrupted transform and never overwritten.  With no
    # exact intent yet, a manual/tampered edit is a hard stop and the bytes remain untouched.
    thesis_path = os.path.join(run, "final_thesis.md")
    original_thesis = open(thesis_path, "rb").read()
    decision_path = os.path.join(run, "decision_record.json")
    original_decision = open(decision_path, "rb").read()
    with open(thesis_path, "ab") as handle:
        handle.write(b"unknown manual edit\n")
    interrupted = json.load(open(decision_path, encoding="utf-8"))
    interrupted["unknown_manual_field"] = True
    write_json(decision_path, interrupted)
    unknown_thesis = open(thesis_path, "rb").read()
    unknown_decision = open(decision_path, "rb").read()
    try:
        diagnostic_audit_plan(run_root, repo)
        raise AssertionError("unknown post-seal bytes must stop rather than be overwritten")
    except ValueError as exc:
        assert "not authorized by a transform intent" in str(exc)
    assert open(thesis_path, "rb").read() == unknown_thesis
    assert open(decision_path, "rb").read() == unknown_decision

    # Reset only inside the isolated test fixture, then let the helper prepare an exact fsynced transform
    # intent and apply its staged output pair.
    with open(thesis_path, "wb") as handle:
        handle.write(original_thesis)
    with open(decision_path, "wb") as handle:
        handle.write(original_decision)
    assert require_diagnostic_audits(run_root, repo)["all_complete"] is True
    transformed = apply_diagnostic_transforms(run_root, repo)
    assert transformed["status"] == "transformed"

    # Simulate a kill between the two atomic live-file replacements by returning the decision to the exact
    # enumerated input hash while leaving the thesis at its derived hash.  The intent resumes this known
    # input/output combination; arbitrary bytes above did not.
    diagnostic_seal_value = json.load(open(os.path.join(run, "diagnostic_audit_inputs.json"), encoding="utf-8"))
    decision_snapshot = os.path.join(repo, diagnostic_seal_value["inputs"]["decision_record"]["snapshot_path"])
    with open(decision_snapshot, "rb") as source, open(decision_path, "wb") as destination:
        destination.write(source.read())
    partial_transform = diagnostic_audit_plan(run_root, repo)
    assert partial_transform["input_state"] == "transform_incomplete"
    assert apply_diagnostic_transforms(run_root, repo)["status"] == "transformed"

    # Checkpoint runs the data-needs prewrite validator itself, then binds its PASS result, exact intent,
    # reports, and output hashes.  A kill after prewrite but before final-audit seal launches no diagnostics.
    checkpoint = checkpoint_diagnostic_pair(run_root, repo)
    assert checkpoint["status"] == "created"
    checkpoint_value = json.load(open(os.path.join(run, "diagnostic_derived_pair.json"), encoding="utf-8"))
    assert checkpoint_value["prewrite"]["result"] == "PASS"
    assert checkpoint_diagnostic_pair(run_root, repo)["status"] == "existing"
    post_prewrite = diagnostic_audit_plan(run_root, repo)
    assert post_prewrite["status"] == "derived_checkpointed"
    assert post_prewrite["all_complete"] is True
    assert not [row for row in post_prewrite["audits"].values() if row["action"] == "run"]

    initial = final_audit_plan(run_root, repo)
    assert initial["status"] == "unsealed" and initial["audits"] == {}
    seal = seal_final_audit_inputs(run_root, repo)
    assert seal["status"] == "created"
    assert seal_final_audit_inputs(run_root, repo)["status"] == "existing"

    # The base reports are the diagnostic pass.  The final seal reserves v2, so they are never mistaken for
    # final completion even though they already bind the same bytes.
    plan = final_audit_plan(run_root, repo)
    assert all(row["action"] == "run" for row in plan["audits"].values())
    assert all(row["minimum_final_version"] == 2 for row in plan["audits"].values())

    # Crash after each of the three final paid audits: every restart reuses only the reports already done.
    final_audits = rebound_audits(audits, run_root, run)
    completed: list[str] = []
    for kind in ("verification", "pre_mortem", "expectations_gap"):
        write_json(os.path.join(run, final_name(kind, 2)), final_audits[kind])
        completed.append(kind)
        plan = final_audit_plan(run_root, repo)
        assert {name for name, row in plan["audits"].items() if row["action"] == "reuse"} == set(completed)
        assert {name for name, row in plan["audits"].items() if row["action"] == "run"} == (
            {"verification", "pre_mortem", "expectations_gap"} - set(completed)
        )
    assert require_final_audits(run_root, repo)["all_complete"] is True
    authority = require_projection_paid_completion(run_root, repo)
    assert authority["status"] == "complete" and len(authority["final_audits"]) == 3
    assert create_projection_manifest(run_root, repo)["schema_version"] == "idea-projection-manifest/v1"

    # Fail-closed latest-version semantics: never fall back to the valid v2 after a newer canonical file
    # fails schema, identity, path, or exact terminal-pair SHA binding.
    mutations = (
        lambda row: row.__setitem__("schema_version", "0.9"),
        lambda row: row.pop("claims_checked"),
        lambda row: row.__setitem__("ticker", "WRONG"),
        lambda row: row.__setitem__("final_thesis_path", "analyses/OTHER/final_thesis.md"),
        lambda row: row.__setitem__("decision_record_sha256", "f" * 64),
    )
    version = 3
    for mutate in mutations:
        bad = dict(final_audits["verification"])
        mutate(bad)
        write_json(os.path.join(run, final_name("verification", version)), bad)
        plan = final_audit_plan(run_root, repo)
        assert plan["audits"]["verification"]["action"] == "run"
        assert plan["audits"]["verification"]["next_output_path"].endswith(
            final_name("verification", version + 1)
        )
        assert plan["audits"]["pre_mortem"]["action"] == "reuse"
        version += 1
    write_json(os.path.join(run, final_name("verification", version)), final_audits["verification"])
    assert final_audit_plan(run_root, repo)["audits"]["verification"]["action"] == "reuse"

    # Once the input seal exists, either terminal byte changing is a hard stop, not permission to buy a
    # fresh audit against retrospectively changed inputs in the same dated run.
    thesis_path = os.path.join(run, "final_thesis.md")
    original_thesis = open(thesis_path, encoding="utf-8").read()
    with open(thesis_path, "a", encoding="utf-8") as handle:
        handle.write("tamper\n")
    try:
        final_audit_plan(run_root, repo)
        raise AssertionError("changed sealed terminal inputs must stop recovery")
    except ValueError as exc:
        assert "changed after the final audit input seal" in str(exc)
    with open(thesis_path, "w", encoding="utf-8") as handle:
        handle.write(original_thesis)


with tempfile.TemporaryDirectory(prefix="paid-master-staged-recovery-") as repo:
    run_root, run = master_fixture(repo)
    fresh = recover_master_synthesis(run_root, repo, replacement_requested=True)
    assert fresh == {
        "status": "unarmed", "run_root": run_root, "action": "arm_then_run",
    }, "a fresh module-only rerun must arm without replacement mode before its first paid Task"
    armed = arm_master_synthesis(run_root, repo)
    assert armed["status"] == "armed" and armed["output_dir"].startswith(
        run_root + "/.completion_receipts/master-synthesis-attempts/"
    )
    before_task = recover_master_synthesis(run_root, repo)
    assert before_task["status"] == "armed_ready"
    assert before_task["output_dir"] == armed["output_dir"], (
        "a crash before the Task must resume the exact already-fsynced staging attempt"
    )

    # A paid Task may return a malformed/wrong-identity pair.  Because it wrote only the unique staging
    # directory, recovery may retire those owned bytes and allocate a fresh retry directory on the same
    # canonical root; no canonical output is touched.
    write_staged_master(repo, armed, run_root, "MASTER")
    with open(os.path.join(repo, armed["staged_outputs"]["decision_record.json"]), "w", encoding="utf-8") as handle:
        handle.write('{"ticker":"WRONG"')
    retry = recover_master_synthesis(run_root, repo)
    assert retry["status"] == "retry_ready" and retry["output_dir"] != armed["output_dir"]
    assert not any(os.path.lexists(os.path.join(run, name)) for name in (
        "final_thesis.md", "decision_record.json", "idea_3_6m.json"
    ))
    assert not os.path.exists(os.path.join(repo, armed["output_dir"])), (
        "retired attempt staging/quarantine must not survive into whole-root publication"
    )

    write_staged_master(repo, retry, run_root, "MASTER")
    wrong_identity_path = os.path.join(repo, retry["staged_outputs"]["decision_record.json"])
    wrong_identity = json.load(open(wrong_identity_path, encoding="utf-8"))
    wrong_identity["run_root"] = "analyses/OTHER_2026-08-14"
    write_json(wrong_identity_path, wrong_identity)
    retry2 = recover_master_synthesis(run_root, repo)
    assert retry2["status"] == "retry_ready" and retry2["output_dir"] != retry["output_dir"]
    write_staged_master(repo, retry2, run_root, "MASTER")
    # A later source/code landing cannot strand an already-paid complete staged set: promotion validates
    # the recorded work authority, while a future rerun will bind the newer live work.
    with open(os.path.join(repo, ".claude", "agents", "synthesizer.md"), "a", encoding="utf-8") as handle:
        handle.write("deployed after paid Task\n")
    write_json(os.path.join(run, "_pool_extracts", "ciq_facts.json"), {
        "schema_version": "test", "facts": {"new": True},
    })
    promoted = recover_master_synthesis(run_root, repo)
    assert promoted["status"] == "promoted"
    assert os.path.isfile(os.path.join(run, "final_thesis.md"))
    assert not os.path.lexists(os.path.join(run, ".completion_receipts", "master-synthesis-attempt.json"))
    assert not os.path.lexists(os.path.join(run, ".completion_receipts", "master-synthesis-promotion.json"))
    assert not os.path.exists(os.path.join(repo, retry2["output_dir"])), (
        "successful promotion must remove its staging directory"
    )
    completion_dir = os.path.join(run, ".completion_receipts", "master-synthesis-completions")
    assert len([name for name in os.listdir(completion_dir) if name.endswith(".json")]) == 1

    # Full-run recovery owns the already-paid canonical trio even though CIQ changed after this attempt
    # was armed.  It must proceed to terminal-pair audits with zero new master Tasks.  Replacement is a
    # separate, explicit standalone-rerun choice.
    full_restart = recover_master_synthesis(run_root, repo)
    assert full_restart == {
        "status": "terminal_pair_recovery", "run_root": run_root,
        "action": "continue_paid_recovery",
    }
    rerun_restart = recover_master_synthesis(
        run_root, repo, replacement_requested=True
    )
    assert rerun_restart["status"] == "replace_needed"

    # Standalone rerun mode binds the complete prior trio and CAS-promotes a replacement.  No existing
    # canonical file can be silently treated as absent.
    replacement = arm_master_synthesis(run_root, repo, allow_existing=True)
    assert all(row["exists"] for row in json.load(open(
        os.path.join(run, ".completion_receipts", "master-synthesis-attempt.json"), encoding="utf-8"
    ))["prior_outputs"].values())
    write_staged_master(repo, replacement, run_root, "MASTER", suffix=" refreshed")
    real_replace = paid_completion.os.replace
    def crash_after_first_master_rename(source: str, target: str) -> None:
        real_replace(source, target)
        if os.path.realpath(os.path.dirname(target)) == os.path.realpath(run) and os.path.basename(target) in {
            "final_thesis.md", "decision_record.json", "idea_3_6m.json"
        }:
            raise OSError("simulated kill after one canonical master rename")
    paid_completion.os.replace = crash_after_first_master_rename
    try:
        try:
            recover_master_synthesis(run_root, repo)
            raise AssertionError("simulated rename crash should interrupt promotion")
        except OSError as exc:
            assert "simulated kill" in str(exc)
    finally:
        paid_completion.os.replace = real_replace
    replaced = recover_master_synthesis(run_root, repo)
    assert replaced["status"] == "promoted"
    assert "refreshed" in open(os.path.join(run, "final_thesis.md"), encoding="utf-8").read()
    assert recover_master_synthesis(run_root, repo)["status"] == "complete_current"

    # Generator/spec hashes are durable provenance, not current eligibility.  A deploy after promotion
    # cleanup cannot make full recovery buy the same master work again when evidence and outputs match.
    with open(os.path.join(repo, ".claude", "agents", "synthesizer.md"), "a", encoding="utf-8") as handle:
        handle.write("second deploy after promotion cleanup\n")
    assert recover_master_synthesis(run_root, repo)["status"] == "complete_current"
    assert recover_master_synthesis(
        run_root, repo, replacement_requested=True
    )["status"] == "complete_current"

    # The pool manifest is the qualitative evidence cursor.  A filing/transcript landing can change it
    # without changing CIQ or module-99 bytes: full recovery still preserves the paid trio, while an
    # explicit rerun is told that one replacement is needed.
    write_json(os.path.join(run, "_pool_extracts", "manifest.json"), {
        "schema_version": "test", "sources": [{"path": "filing-v2.pdf"}],
    })
    assert recover_master_synthesis(run_root, repo)["status"] == "terminal_pair_recovery"
    assert recover_master_synthesis(
        run_root, repo, replacement_requested=True
    )["status"] == "replace_needed"


with tempfile.TemporaryDirectory(prefix="paid-master-rotate-swap-crash-") as repo:
    run_root, run = master_fixture(repo, ticker="SWAPCUT")
    armed = arm_master_synthesis(run_root, repo)
    write_staged_master(repo, armed, run_root, "SWAPCUT")
    with open(os.path.join(repo, armed["staged_outputs"]["decision_record.json"]), "w", encoding="utf-8") as handle:
        handle.write('{"ticker":"SWAPCUT"')
    old_stage = os.path.realpath(os.path.join(repo, armed["output_dir"]))
    real_atomic_json = paid_completion._atomic_json

    def crash_after_master_pointer_swap(path: str, value: dict, prefix: str) -> None:
        real_atomic_json(path, value, prefix)
        if (
            os.path.basename(path) == "master-synthesis-attempt.json"
            and value.get("attempt_id") != os.path.basename(old_stage)
        ):
            raise OSError("simulated kill after active master pointer swap")

    paid_completion._atomic_json = crash_after_master_pointer_swap
    try:
        try:
            recover_master_synthesis(run_root, repo)
            raise AssertionError("rotation must expose the simulated post-swap crash")
        except OSError as exc:
            assert "pointer swap" in str(exc)
    finally:
        paid_completion._atomic_json = real_atomic_json
    assert os.path.isdir(old_stage), "old staging remains until the new active pointer is durable"
    resumed = recover_master_synthesis(run_root, repo)
    assert resumed["status"] == "armed_ready"
    assert not os.path.lexists(old_stage), "restart must retire the non-active old stage"
    write_staged_master(repo, resumed, run_root, "SWAPCUT")
    assert recover_master_synthesis(run_root, repo)["status"] == "promoted"
    attempts_parent = os.path.join(run, ".completion_receipts", "master-synthesis-attempts")
    assert os.listdir(attempts_parent) == [], "no retired master staging may reach publication"


with tempfile.TemporaryDirectory(prefix="paid-master-rotate-cleanup-crash-") as repo:
    run_root, run = master_fixture(repo, ticker="CLEANUPCUT")
    armed = arm_master_synthesis(run_root, repo)
    write_staged_master(repo, armed, run_root, "CLEANUPCUT")
    with open(os.path.join(repo, armed["staged_outputs"]["decision_record.json"]), "w", encoding="utf-8") as handle:
        handle.write('{"ticker":"CLEANUPCUT"')
    old_stage = os.path.realpath(os.path.join(repo, armed["output_dir"]))
    real_remove_owned_tree = paid_completion._remove_owned_tree

    def crash_after_old_stage_cleanup(path: str, expected_parent: str) -> None:
        real_remove_owned_tree(path, expected_parent)
        if os.path.realpath(path) == old_stage:
            raise OSError("simulated kill after old master staging cleanup")

    paid_completion._remove_owned_tree = crash_after_old_stage_cleanup
    try:
        try:
            recover_master_synthesis(run_root, repo)
            raise AssertionError("rotation must expose the simulated post-cleanup crash")
        except OSError as exc:
            assert "staging cleanup" in str(exc)
    finally:
        paid_completion._remove_owned_tree = real_remove_owned_tree
    assert not os.path.lexists(old_stage)
    resumed = recover_master_synthesis(run_root, repo)
    assert resumed["status"] == "armed_ready"
    attempts_parent = os.path.join(run, ".completion_receipts", "master-synthesis-attempts")
    assert os.listdir(attempts_parent) == [os.path.basename(resumed["output_dir"])], (
        "restart may retain only the exact active master staging directory"
    )


with tempfile.TemporaryDirectory(prefix="paid-master-unarmed-unsafe-") as repo:
    run_root, run = master_fixture(repo, ticker="UNARMED")
    original_thesis = b"# Unowned partial thesis\n"
    with open(os.path.join(run, "final_thesis.md"), "wb") as handle:
        handle.write(original_thesis)
    with open(os.path.join(run, "decision_record.json"), "wb") as handle:
        handle.write(b'{"ticker":"WRONG"')
    try:
        recover_master_synthesis(run_root, repo)
        raise AssertionError("unarmed malformed canonical master bytes must remain unsafe")
    except ValueError as exc:
        assert "canonical master outputs" in str(exc)
    assert open(os.path.join(run, "final_thesis.md"), "rb").read() == original_thesis


with tempfile.TemporaryDirectory(prefix="paid-master-unreceipted-valid-") as repo:
    run_root, run = master_fixture(repo, ticker="UNRECEIPTED")
    canonical_result = {
        "staged_outputs": {name: f"{run_root}/{name}" for name in (
            "final_thesis.md", "decision_record.json", "idea_3_6m.json"
        )}
    }
    write_staged_master(repo, canonical_result, run_root, "UNRECEIPTED")
    assert recover_master_synthesis(run_root, repo) == {
        "status": "terminal_pair_recovery", "run_root": run_root,
        "action": "continue_paid_recovery",
    }, "full recovery must preserve a schema-valid legacy trio without buying master again"
    assert recover_master_synthesis(
        run_root, repo, replacement_requested=True
    )["status"] == "replace_needed"


with tempfile.TemporaryDirectory(prefix="paid-projection-staged-recovery-") as repo:
    run_root, run = projection_fixture(repo, "PROJ")
    canonical = os.path.join(run, "idea_3_6m.json")
    preliminary_bytes = open(canonical, "rb").read()
    assert recover_final_projection(run_root, repo)["status"] == "preliminary_unarmed"
    armed = arm_final_projection(run_root, repo)
    assert recover_final_projection(run_root, repo)["status"] == "preliminary_armed", (
        "a crash before the projection Task retains the exact preliminary canonical bytes"
    )
    staged = os.path.join(repo, armed["output_path"])
    with open(staged, "wb") as handle:
        handle.write(b'{"schema_version":"idea-assessment/v1",')
    assert open(canonical, "rb").read() == preliminary_bytes
    recovered = recover_final_projection(run_root, repo)
    assert recovered["status"] == "promoted"
    fallback = json.load(open(canonical, encoding="utf-8"))
    assert fallback["status"] == "not_assessable" and fallback["candidate"] is None
    assert fallback["gaps"] == [
        "Final idea re-projection Task emitted an invalid or incomplete assessment."
    ]
    assert not os.path.exists(os.path.join(repo, armed["output_path"]).rsplit(os.sep, 1)[0])
    assert not os.path.lexists(os.path.join(run, ".completion_receipts", "final-projection-attempt.json"))
    assert not os.path.lexists(os.path.join(run, ".completion_receipts", "final-projection-promotion.json"))
    assert os.listdir(os.path.join(
        run, ".completion_receipts", "final-projection-attempts"
    )) == [], "no final-projection staging/quarantine may reach whole-root publication"
    assert recover_final_projection(run_root, repo)["status"] == "complete"


with tempfile.TemporaryDirectory(prefix="paid-projection-unarmed-unsafe-") as repo:
    run_root, run = projection_fixture(repo, "PUNKNOWN")
    canonical = os.path.join(run, "idea_3_6m.json")
    with open(canonical, "wb") as handle:
        handle.write(b'{"manual":"partial"')
    unknown = open(canonical, "rb").read()
    try:
        recover_final_projection(run_root, repo)
        raise AssertionError("unarmed malformed canonical projection must stay unsafe")
    except ValueError as exc:
        assert "canonical idea_3_6m.json is invalid" in str(exc)
    assert open(canonical, "rb").read() == unknown


with tempfile.TemporaryDirectory(prefix="paid-projection-tamper-") as repo:
    run_root, run = projection_fixture(repo, "PTAMPER")
    canonical = os.path.join(run, "idea_3_6m.json")
    canonical_before = open(canonical, "rb").read()
    armed = arm_final_projection(run_root, repo)
    with open(os.path.join(repo, armed["output_path"]), "wb") as handle:
        handle.write(b"partial paid output")
    attempt_path = os.path.join(run, ".completion_receipts", "final-projection-attempt.json")
    attempt = json.load(open(attempt_path, encoding="utf-8"))
    attempt["manifest"]["manifest_sha256"] = "0" * 64
    write_json(attempt_path, attempt)
    try:
        recover_final_projection(run_root, repo)
        raise AssertionError("tampered attempt must not authorize projection replacement")
    except ValueError as exc:
        assert "attempt digest is invalid" in str(exc)
    assert open(canonical, "rb").read() == canonical_before


with tempfile.TemporaryDirectory(prefix="paid-projection-canonical-mismatch-") as repo:
    run_root, run = projection_fixture(repo, "PMISMATCH")
    canonical = os.path.join(run, "idea_3_6m.json")
    armed = arm_final_projection(run_root, repo)
    with open(os.path.join(repo, armed["output_path"]), "wb") as handle:
        handle.write(b"attempt-owned invalid output")
    with open(canonical, "wb") as handle:
        handle.write(b"unknown canonical edit")
    canonical_unknown = open(canonical, "rb").read()
    try:
        recover_final_projection(run_root, repo)
        raise AssertionError("a matching attempt cannot authorize changed canonical preliminary bytes")
    except ValueError as exc:
        assert "canonical idea_3_6m.json is invalid" in str(exc)
    assert open(canonical, "rb").read() == canonical_unknown
    assert open(os.path.join(repo, armed["output_path"]), "rb").read() == b"attempt-owned invalid output"


with tempfile.TemporaryDirectory(prefix="paid-memo-recovery-") as repo:
    os.makedirs(os.path.join(repo, ".claude", "agents"))
    for name in ("memo-writer", "module-memo-writer"):
        with open(os.path.join(repo, ".claude", "agents", name + ".md"), "w", encoding="utf-8") as handle:
            handle.write(f"# {name} generator contract\nversion: 1\n")
    real_datetime = freeze_test.dt.datetime
    class LegacyFixtureDateTime(real_datetime):
        @classmethod
        def now(cls, tz=None):
            value = real_datetime(2026, 8, 13, 12, 0, 0, tzinfo=dt.timezone.utc)
            return value if tz is None else value.astimezone(tz)
    freeze_test.dt.datetime = LegacyFixtureDateTime
    try:
        run_root, run = admitted_fixture(repo, ticker="MEMO")
    finally:
        freeze_test.dt.datetime = real_datetime
    assert freeze(run_root, repo) == 0
    for module in ("alpha", "beta", "gamma"):
        module_dir = os.path.join(run, module)
        os.makedirs(module_dir)
        with open(os.path.join(module_dir, f"99_{module}-synthesis.md"), "w", encoding="utf-8") as handle:
            handle.write(f"# {module.title()} synthesis\n\nVerdict: Mixed\n\nEvidence-bound finding.\n")
        with open(os.path.join(module_dir, f"{module}_memo.md"), "w", encoding="utf-8") as handle:
            handle.write(f"# {module.title()} Module Memo\n\nVerdict: Mixed — exact synthesis view.\n")
    with open(os.path.join(run, "memo.md"), "w", encoding="utf-8") as handle:
        handle.write("# Colleague Memo\n\nDecision: Buy — exact standing decision.\n")

    # Receipt creation rejects syntactically plausible stubs and long truncations.  A heading/verdict alone
    # is not paid-work completion, and filler cannot replace the generator contract's section topology.
    alpha_path = os.path.join(run, "alpha", "alpha_memo.md")
    ok, reason = _memo_output_valid(alpha_path, "module_memo", None)
    assert not ok and "completeness floor" in reason
    truncated_top = (
        "# Colleague Memo\n\nDecision: Buy — exact standing decision.\n\n"
        "## The Decision at a Glance\n\n" + FILLER * 180
    )
    with open(os.path.join(run, "memo.md"), "w", encoding="utf-8") as handle:
        handle.write(truncated_top)
    ok, reason = _memo_output_valid(os.path.join(run, "memo.md"), "run_memo", "Buy")
    assert not ok and ("substantive sections" in reason or "required memo sections" in reason)
    try:
        seal_derived_memo("module:alpha", run_root, repo)
        raise AssertionError("tiny module stub must never receive a durable receipt")
    except ValueError as exc:
        assert "incomplete memo" in str(exc)

    first_plan = derived_memo_plan(run_root, repo)
    target_ids = [row["target_id"] for row in first_plan["targets"]]
    assert target_ids == ["module:alpha", "module:beta", "module:gamma", "top-level"]
    assert all(row["action"] == "run" for row in first_plan["targets"]), (
        "pre-existing memo files without receipts are not completion authority"
    )

    # Arm every paid module call before dispatch.  One parent receipt lands, then the process dies after all
    # module Tasks wrote complete outputs but before either remaining seal.  Model-free promotion recovers
    # those exact armed outputs instead of buying the whole batch again.
    module_ids = target_ids[:3]
    for target_id in module_ids:
        assert arm_derived_memo(target_id, run_root, repo)["status"] == "armed"
        module = target_id.split(":", 1)[1]
        with open(os.path.join(run, module, f"{module}_memo.md"), "w", encoding="utf-8") as handle:
            handle.write(complete_module_memo(module))
    receipt = seal_derived_memo(module_ids[0], run_root, repo)
    assert receipt["status"] == "created"
    partial = derived_memo_plan(run_root, repo)
    assert [row["target_id"] for row in partial["targets"] if row["action"] == "reuse"] == module_ids[:1]
    assert [row["target_id"] for row in partial["targets"] if row["action"] == "run"] == module_ids[1:] + ["top-level"]
    promoted = promote_derived_memos(run_root, repo)
    assert promoted["promoted"] == module_ids[1:]
    modules_recovered = derived_memo_plan(run_root, repo)
    assert [row["target_id"] for row in modules_recovered["targets"] if row["action"] == "reuse"] == module_ids
    assert [row["target_id"] for row in modules_recovered["targets"] if row["action"] == "run"] == ["top-level"]

    # The same kill window exists for the top-level memo.  Its armed complete output is promoted on restart
    # before memo-plan, so recovery does not buy the top-level Task twice either.
    assert arm_derived_memo("top-level", run_root, repo)["status"] == "armed"
    with open(os.path.join(run, "memo.md"), "w", encoding="utf-8") as handle:
        handle.write(complete_top_memo())
    top_promoted = promote_derived_memos(run_root, repo)
    assert top_promoted["promoted"] == ["top-level"]
    complete = derived_memo_plan(run_root, repo)
    assert complete["all_complete"] is True

    receipt_path = os.path.join(repo, complete["targets"][0]["receipt_path"])
    receipt = json.load(open(receipt_path, encoding="utf-8"))
    assert receipt["work"]["authority"]["idea_admission"]["path"].endswith("/idea_admission.json")
    assert receipt["work"]["authority"]["idea_projection_manifest"]["path"].endswith(
        "/idea_projection_manifest.json"
    )
    assert receipt["work"]["sources"][0]["sha256"]
    assert receipt["output"]["sha256"] and receipt["work"]["generator"]["version"]
    assert receipt["completion_witness"]["mode"] == "parent_verified"
    assert os.path.basename(receipt_path) == receipt["receipt_sha256"] + ".json"

    recovered_receipt_path = os.path.join(repo, complete["targets"][1]["receipt_path"])
    recovered_receipt = json.load(open(recovered_receipt_path, encoding="utf-8"))
    assert recovered_receipt["completion_witness"]["mode"] == "recovered_armed_output"

    alpha_original = open(alpha_path, encoding="utf-8").read()
    with open(alpha_path, "a", encoding="utf-8") as handle:
        handle.write("Changed but still structurally valid.\n")
    tampered = derived_memo_plan(run_root, repo)
    assert [row["target_id"] for row in tampered["targets"] if row["action"] == "run"] == ["module:alpha"]
    with open(alpha_path, "w", encoding="utf-8") as handle:
        handle.write(alpha_original)
    assert derived_memo_plan(run_root, repo)["all_complete"] is True, (
        "an old receipt may be reused only when the output returns to its exact previously sealed bytes"
    )

    beta_path = os.path.join(run, "beta", "beta_memo.md")
    beta_original = open(beta_path, encoding="utf-8").read()
    os.unlink(beta_path)
    missing = derived_memo_plan(run_root, repo)
    assert [row["target_id"] for row in missing["targets"] if row["action"] == "run"] == ["module:beta"]
    arm_derived_memo("module:beta", run_root, repo)
    with open(beta_path, "w", encoding="utf-8") as handle:
        handle.write(beta_original)
    assert seal_derived_memo("module:beta", run_root, repo)["status"] in {"created", "existing"}
    assert derived_memo_plan(run_root, repo)["all_complete"] is True

    # The receipt binds exact admission bytes, not just a loosely equivalent status.  A harmless JSON
    # reformat remains a valid immutable admission but invalidates all prior memo receipts.
    admission_path = os.path.join(run, "idea_admission.json")
    admission = json.load(open(admission_path, encoding="utf-8"))
    with open(admission_path, "w", encoding="utf-8") as handle:
        json.dump(admission, handle, separators=(",", ":"))
        handle.write("\n")
    changed_authority = derived_memo_plan(run_root, repo)
    assert all(row["action"] == "run" for row in changed_authority["targets"])
    assert promote_derived_memos(run_root, repo)["promoted"] == [], (
        "attempts and receipts from a different admission byte authority cannot be promoted"
    )

    # A semantic admission tamper is not rerunnable memo work: the immutable authority itself fails closed.
    broken = dict(admission)
    broken["status"] = "not_admitted"
    write_json(admission_path, broken)
    try:
        derived_memo_plan(run_root, repo)
        raise AssertionError("a malformed admission must not authorize memo recovery")
    except ValueError as exc:
        assert "canonical sealed admission" in str(exc)


print("test_research_paid_completion: PASS")
