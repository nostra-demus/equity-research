#!/usr/bin/env python3
"""Reconcile a research report with its bound audits before immutable publication.

Never edits an audit or a sealed run. Applying an outcome invalidates the old audit
hashes deliberately: genuine read-only audits must run again before --check passes.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import math
import os
import re
from pathlib import Path

START = "<!-- research-review:start -->"
END = "<!-- research-review:end -->"
MARK = "PROVISIONAL — the automated finish-gate"
WARNING_HEADER = "> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**"
REPAIR = ".evidence_repair_attempted.json"
STABILIZE = ".audit_reconciliation_attempted.json"


def outcome(decision, audits):
    pm, eg = audits["pre_mortem"], audits["expectations_gap"]
    if not isinstance(decision.get("decision"), str) or not decision["decision"].strip():
        raise ValueError("decision label is missing")
    confidence = decision.get("confidence_score")
    if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or not 0 <= confidence <= 100:
        raise ValueError("decision confidence_score is missing or invalid")
    if abs(pm["original_confidence"] - confidence) > 0.05 or pm["recommended_confidence"] > confidence:
        raise ValueError("pre-mortem does not use the original decision confidence")
    baskets = {"Strong Buy": "Selected", "Buy": "Selected", "Starter Position Only": "Selected",
               "Watchlist": "Watchlist", "Avoid": "Rejected", "Short Candidate": "Short",
               "Pair Trade / Hedge Required": "Pair Trade", "Insufficient Data — Refuse To Rate": "Insufficient Data"}
    ranks = {"Avoid": 0, "Insufficient Data — Refuse To Rate": -1, "Watchlist": 1,
             "Starter Position Only": 2, "Buy": 3, "Strong Buy": 4}
    effective = decision["decision"]
    if effective not in baskets:
        raise ValueError("unknown decision label")
    if not pm["survives"] and baskets[effective] in {"Selected", "Short", "Pair Trade"}:
        effective = "Watchlist"
    cap = re.sub(r"^cap at ", "", pm["recommended_rating_cap"].strip(), flags=re.I)
    if cap and cap not in ranks:
        raise ValueError("recommended_rating_cap must name a canonical rating cap")
    for restriction in (cap, decision.get("post_mortem_decision")):
        if restriction in ranks:
            if effective not in ranks and ranks[restriction] > 1:
                raise ValueError("rating cap cannot change the thesis direction")
            if ranks[restriction] < ranks.get(effective, 4):
                effective = restriction
    basket = ("Watchlist" if effective == decision["decision"] == "Pair Trade / Hedge Required"
              and decision.get("basket") == "Watchlist" else baskets[effective])
    return {
        "pre_mortem_verdict": pm["verdict"],
        "confidence_haircut": pm["confidence_haircut"],
        "post_review_confidence_score": pm["recommended_confidence"],
        "post_mortem_decision": effective,
        "post_mortem_basket": basket,
        "post_review_edge_score": eg["edge_score"],
        "post_review_variant_perception_quality": eg["variant_perception_quality"],
        "post_review_is_exploitable": eg["is_exploitable"],
    }


def review_block(decision, audits):
    fields = outcome(decision, audits)
    verification = audits["verification"]
    score = lambda value: format(math.floor(value * 100 + 0.5) / 100, ".2f").rstrip("0").rstrip(".")
    return "\n".join([
        START,
        "> **Final audit outcome**",
        f"> Evidence check: **{verification['verdict']}**.",
        f"> Decision after review: **{fields['post_mortem_decision']}**. Confidence after review: **{score(fields['post_review_confidence_score'])}/100** (original {score(decision['confidence_score'])}/100).",
        f"> Independent edge check: **{fields['post_review_variant_perception_quality']}**, {score(fields['post_review_edge_score'])}/100; exploitable: **{'yes' if fields['post_review_is_exploitable'] else 'no'}**.",
        "> These final review results take precedence over the original synthesis scores and decision quoted below.",
        END,
    ])


def assert_reconciled(decision, thesis, audits):
    for key, expected in outcome(decision, audits).items():
        if (isinstance(decision.get(key), bool) != isinstance(expected, bool)
                or decision.get(key) != expected):
            raise ValueError(f"final audit outcome not propagated: {key}")
    if thesis.count(START) != 1 or thesis.count(END) != 1 or review_block(decision, audits) not in thesis[:6000]:
        raise ValueError("final thesis does not carry the current final audit outcome")
    gate = decision.get("integrity_gate") or {}
    adverse = audits["verification"]["verdict"] not in {"Clean", "Minor issues"}
    if adverse and gate.get("status") != "provisional":
        raise ValueError("adverse final evidence audit must remain provisional in thesis and decision")
    if adverse or gate.get("status") == "provisional":
        warning = re.match(re.escape(WARNING_HEADER) + r"\n(?:>[^\n]*\n)+\n", thesis)
        if not warning or "Resolve the flagged items" not in warning.group(0):
            raise ValueError("provisional thesis requires a canonical leading warning")


def reconcile(decision, thesis, audits):
    updated = {**decision, **outcome(decision, audits)}
    if thesis.count(START) != thesis.count(END) or thesis.count(START) > 1:
        raise ValueError("malformed final audit outcome block")
    body = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n*", "", thesis, flags=re.S)
    verification = audits["verification"]
    # Rebuild only evidence-audit reasons; retain every independent deterministic failure.
    def evidence_reason(reason):
        return any(token in reason for token in ("verify-evidence", "truth-integrity audit", "verification_report", "Final evidence audit:"))
    gate = dict(updated.get("integrity_gate") or {})
    reasons = [r for r in gate.get("violations", []) if not evidence_reason(r)]
    if body.lstrip().startswith(">") and MARK in body[:2000]:
        match = re.match(r"\s*((?:>[^\n]*\n)+(?:\n)*)", body)
        if not match:
            raise ValueError("malformed provisional warning")
        lines = match.group(1).splitlines()
        if len(lines) > 1:
            for reason in lines[1].lstrip("> ").split("; "):
                reason = reason.strip()
                if reason and not evidence_reason(reason) and reason not in reasons:
                    reasons.append(reason)
        body = body[match.end():]
    if verification["verdict"] not in {"Clean", "Minor issues"}:
        reasons.append(f"Final evidence audit: {verification['verdict']}")
    if reasons or gate:
        updated["integrity_gate"] = {**gate, "status": "provisional" if reasons else "pass", "violations": reasons}
    banner = ("> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
              + "; ".join(reasons) + "\n>\n> Resolve the flagged items before relying on these numbers.\n\n") if reasons else ""
    body = banner + review_block(updated, audits) + "\n\n" + body
    assert_reconciled(updated, body, audits)
    return updated, body


def run(run_root, action, repo=None):
    from create_idea_projection_manifest import (
        REPO, atomic_write, file_digest, decision_digest, DECISION_HASH_BASIS, latest_exact, validate_bound_audits, validate_decision_identity,
    )
    from idea_run_root import parse_idea_run_root
    root, _, _ = parse_idea_run_root(run_root)
    base = Path(repo or REPO).resolve()
    run_path = base / root
    if not run_path.is_dir() or run_path.resolve() != run_path or not run_path.is_relative_to(base / "analyses"):
        raise ValueError("run root is not a real directory under analyses")
    lock = os.open(run_path, os.O_RDONLY)
    try:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if any((run_path / name).exists() for name in ("idea_projection_manifest.json", "idea_admission.json")):
            raise ValueError("sealed runs cannot be reconciled or repaired")
        paths = {name: str(run_path / f"{name}.{'md' if name == 'final_thesis' else 'json'}")
                 for name in ("final_thesis", "decision_record")}
        if any(Path(p).is_symlink() or not Path(p).is_file() for p in paths.values()):
            raise ValueError("audit inputs must be regular files")
        if action == "hashes":
            return {"final_thesis_sha256": file_digest(paths["final_thesis"]),
                    "decision_record_sha256": decision_digest(paths["decision_record"]),
                    "decision_record_hash_basis": DECISION_HASH_BASIS}
        paths.update({name: latest_exact(str(run_path), name) for name in ("verification", "pre_mortem", "expectations_gap")})
        if any(Path(p).is_symlink() or not Path(p).is_file() for p in paths.values()):
            raise ValueError("audit inputs must be regular files")
        decision = json.loads(Path(paths["decision_record"]).read_text(encoding="utf-8"))
        ticker = validate_decision_identity(decision, root)
        audits = validate_bound_audits(paths, root, ticker)
        thesis = Path(paths["final_thesis"]).read_text(encoding="utf-8")
        if action == "check":
            assert_reconciled(decision, thesis, audits)
            return {"status": "reconciled"}
        marker = run_path / (REPAIR if action == "claim-repair" else STABILIZE)
        if action == "claim-repair" and audits["verification"]["verdict"] in {"Clean", "Minor issues"}:
            return {"status": "not_needed"}
        if action == "apply":
            revised, body = reconcile(decision, thesis, audits)
            if json.dumps(revised, sort_keys=True) == json.dumps(decision, sort_keys=True) and body == thesis:
                return {"status": "reconciled"}
        # One durable claim across crashes, resumes and providers; no automatic replenishment.
        try:
            with marker.open("x") as handle:
                json.dump({"run_root": root, "action": action,
                           "inputs": {name: file_digest(p) for name, p in paths.items()}}, handle)
                handle.flush()
                os.fsync(handle.fileno())
        except FileExistsError:
            raise ValueError(f"bounded {action} attempt already consumed; preserve outputs and stop")
        if action == "claim-repair":
            return {"status": "repair_authorized", "findings": audits["verification"]["blocking_findings"]}
        atomic_write(paths["decision_record"], revised)
        # Failure between writes leaves stale audits, which block publication; never rebind their hashes.
        atomic_write(paths["final_thesis"], body, raw_text=True)
        return {"status": "changed", "next": "Rerun the read-only audit trio, then --check; do not edit audit hashes."}

    finally:
        os.close(lock)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_root")
    actions = parser.add_mutually_exclusive_group(required=True)
    for action in ("check", "apply", "claim-repair", "hashes"):
        actions.add_argument("--" + action, dest="action", action="store_const", const=action)
    args = parser.parse_args()
    try:
        print(json.dumps(run(args.run_root, args.action)))
    except (OSError, ValueError, TypeError, KeyError) as exc:
        parser.exit(2, f"AUDIT-OUTCOME: {exc}\n")
