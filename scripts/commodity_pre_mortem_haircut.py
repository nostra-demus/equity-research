#!/usr/bin/env python3
"""commodity_pre_mortem_haircut.py — propagate a commodity pre-mortem's verdict into decision_record.json.

WHY THIS EXISTS
----------------
research/full.md step 10B.2 (fix F28/F28b) patches the research swarm's decision_record.json with
its pre-mortem's verdict — a confidence haircut plus a terminal-verdict rating cap — so a red-team
result that found a thesis broken can't sit inert in pre_mortem.json while the published call still
reads clean. commodity/pre-mortem.md was written deliberately read-only, with its own Hard Rules
flagging the finish-gate wiring as "the natural next step ... not part of this change." This script
is that wiring, ported to the commodity swarm's simpler single-verdict schema (action/confidence,
not decision/basket/confidence_score — frameworks/commodity/decision_record.schema.json).

Concrete, currently-committed proof the gap is real: commodity/runs/GOLD/pre_mortem.json (performed
2026-07-26) recommends action Hold -> Trim and confidence 52 -> 40 ("Does not survive — downgrade"),
but commodity/runs/GOLD/decision_record.json (decision_date 2026-07-03) still read action=Hold,
confidence=52 before this script ran against it — the engine's own red-team verdict never reached
the one file every other commodity-swarm consumer (commodity:review's action-outcome grading, any
future confidence-aware calibration, a live cockpit surface) actually reads. Exactly the false-
confidence failure mode CLAUDE.md §1/§8/§24 exist to prevent.

CONTRACT
  • Reads <RUN_ROOT>/pre_mortem*.json (the LATEST version, by _vN suffix) + <RUN_ROOT>/decision_record.json.
  • Writes decision_record.json in place, ADDING five fields — never touching the synthesizer's own
    original `action`/`confidence` (CLAUDE.md §18/§22: caps are applied, never silently overridden;
    the original call stays visible for audit):
      confidence_haircut, pre_mortem_verdict, post_review_confidence_score, post_mortem_action,
      post_mortem_target_exposure_risk_units
  • The confidence and the action cap are BOTH enforced deterministically, not trusted from the
    LLM-authored report: post_review_confidence_score is clamped never to EXCEED the original
    (a pre-mortem may only hold or lower conviction), the haircut is derived purely from that delta
    (never from the self-reported confidence_haircut), and post_mortem_action applies the cap only when
    it is at least as cautious as the run's own action on the Buy<Hold<Trim<Avoid ladder.
  • Fails CLOSED. decision_record.json is left untouched and the CLI exits NONZERO unless the gate
    genuinely ran to completion — a caller that just generated a fresh pre-mortem must halt rather
    than ship a clean, unaudited record. Only "patched" exits 0; every other status is a gate that
    did NOT run:
      no_pre_mortem        — no pre_mortem*.json found.
      read_error           — decision_record.json or pre_mortem*.json missing/unparseable.
      incomplete_pre_mortem — the report is syntactically valid JSON but semantically empty (no
                              `verdict` from commodity/pre-mortem.md's own enum, or no finite 0-100
                              `recommended_confidence`) — a `{}` or a report an LLM abandoned
                              mid-write must not silently read as "reviewed and clean".
      stale_pre_mortem     — the latest report red-teamed a since-rewritten call (its
                              original_action/original_confidence no longer match the record).
      no_fresh_pre_mortem  — the caller passed `--prior <path>` (the report that already existed
                              before this invocation ran pre-mortem.md) and the latest report found
                              is that SAME file — no new report was actually produced this
                              invocation, so a value-matching old report cannot stand in for one.
  • Idempotent: re-running against the same pre_mortem.json (without `--prior`) re-derives the
    identical patch (patch() never mutates `action`/`confidence`, so the staleness snapshot stays
    matched across re-runs).
  • Pure `patch()` function + a thin CLI wrapper, so BOTH callers that can (re)write
    decision_record.json — commodity:full.md (a freshly-completed terminal module, or a one-time
    backfill of a pre-existing run) and commodity:rerun.md (every cascade that touches
    commodity-thesis) — call the identical, tested logic instead of duplicating a heredoc.

CLI:
  python3 scripts/commodity_pre_mortem_haircut.py <RUN_ROOT> [--prior <pre_existing_pre_mortem_path>]
  python3 scripts/commodity_pre_mortem_haircut.py --selftest
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys


def _isnum(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)  # bool is an int subclass — exclude it


# The exact enum commodity/pre-mortem.md step 4 defines — a report carrying anything else (including
# "", the JSON-missing-key default) never actually reached a verdict.
_VALID_VERDICTS = {
    "Survives",
    "Survives with haircut",
    "Does not survive — downgrade",
    "Thesis broken",
}


def latest_pre_mortem(run_root):
    """The latest pre_mortem*.json by version number (pre_mortem.json = v1; _v2/_v3/... after),
    matching the exact-name convention commodity/pre-mortem.md writes (pre_mortem(_v\\d+)?.json),
    so an unrelated file like pre_mortem_summary.json is never mistaken for a report version."""
    def _vn(p):
        m = re.search(r"_v(\d+)\.json$", p)
        return int(m.group(1)) if m else 1
    candidates = [
        p for p in glob.glob(os.path.join(run_root, "pre_mortem*.json"))
        if re.fullmatch(r"pre_mortem(_v\d+)?\.json", os.path.basename(p))
    ]
    return sorted(candidates, key=_vn)[-1] if candidates else None


def patch(run_root, prior_path=None):
    """Propagate the latest pre_mortem*.json in <run_root> into its decision_record.json.

    `prior_path`, if given, is the pre_mortem*.json path the CALLER already knew existed BEFORE it
    invoked commodity/pre-mortem.md this time round (e.g. rerun.md step 6.5's pre-check, since a
    prior report is expected whenever the run has been through this gate before). It proves a NEW
    report was actually written this invocation — matching `action`/`confidence` values alone cannot
    prove that (a rerun that leaves both unchanged, paired with a report-generation step that silently
    failed to write its promised `_vN` file, would otherwise satisfy the staleness guard below on an
    old report that was never re-run against the current call). Omit it when no prior report is
    expected (a run's first-ever pre-mortem).

    Returns (status, message, patched_record_or_None). See the module CONTRACT docstring for the
    full list of non-"patched" statuses (no_pre_mortem / read_error / incomplete_pre_mortem /
    stale_pre_mortem / no_fresh_pre_mortem) — every one of them is a gate that did NOT run, and a
    caller that just generated a fresh pre-mortem must treat it as a failure and NOT ship a clean,
    unaudited record (the CLI signals this with a nonzero exit; see main()).
    """
    dr_path = os.path.join(run_root, "decision_record.json")
    pm_path = latest_pre_mortem(run_root)
    if not pm_path:
        return "no_pre_mortem", "no pre_mortem.json found — gate did not run", None

    # FRESHNESS-BY-IDENTITY GUARD (Codex r3694803055). Value-matching (the staleness guard below)
    # only proves the report is CONSISTENT with the current call — it cannot prove the report was
    # actually generated THIS invocation, since an old report can happen to match unchanged values.
    # When the caller supplies the report it already knew about beforehand, the latest report
    # resolving to that exact same path means pre-mortem.md's own step 5 (write a new pre_mortem*.json)
    # did not actually produce anything new — fail closed rather than silently re-applying stale work.
    if prior_path and os.path.abspath(pm_path) == os.path.abspath(prior_path):
        return (
            "no_fresh_pre_mortem",
            f"{os.path.basename(pm_path)} is the same report that already existed before this "
            f"invocation ran (--prior) — no fresh pre-mortem was generated; gate did not run",
            None,
        )
    try:
        pm = json.load(open(pm_path, encoding="utf-8"))
        dr = json.load(open(dr_path, encoding="utf-8"))
    except Exception as e:
        return "read_error", f"read error ({e}) — gate did not run", None

    orig_conf = dr.get("confidence")
    orig_action = dr.get("action") or ""

    # STALENESS GUARD (Codex r3694542416). A pre-mortem snapshots the call it red-teamed in its own
    # original_action / original_confidence. commodity:rerun reuses the stable run folder and can rewrite
    # decision_record.json with a NEW action/confidence while a PRIOR pre_mortem.json from before the
    # re-run still sits in the folder (e.g. a new versioned report failed to write). Applying that prior
    # verdict to a freshly-changed record ships it both unaudited and MISLABELED. Fail closed: if the
    # pre-mortem recorded what it reviewed and it no longer matches the record, do not patch. Only fires
    # when the pre-mortem actually carries the snapshot field (backward compatible with reports that omit
    # it), and never on the fresh path (a just-generated pre-mortem records the current action/confidence,
    # which patch() never mutates → it stays matched, so re-running is still idempotent).
    pm_orig_action = pm.get("original_action")
    pm_orig_conf = pm.get("original_confidence")
    stale_bits = []
    if isinstance(pm_orig_action, str) and pm_orig_action and pm_orig_action != orig_action:
        stale_bits.append(f"original_action {pm_orig_action!r} != record action {orig_action!r}")
    if _isnum(pm_orig_conf) and _isnum(orig_conf) and pm_orig_conf != orig_conf:
        stale_bits.append(f"original_confidence {pm_orig_conf} != record confidence {orig_conf}")
    if stale_bits:
        return (
            "stale_pre_mortem",
            f"{os.path.basename(pm_path)} red-teamed a different call ({'; '.join(stale_bits)}) — gate did not run",
            None,
        )

    rec_conf = pm.get("recommended_confidence")
    verdict = pm.get("verdict") or ""

    # COMPLETENESS GUARD (Codex r3694803052). A syntactically valid but semantically empty report —
    # `{}`, or a blank verdict alongside a null recommended_confidence — must not silently pass as a
    # completed red-team. Without this check the fallbacks below (post_review defaults to orig_conf
    # when rec_conf isn't numeric; a blank cap retains orig_action) make an EMPTY report indistinguishable
    # from one that explicitly found the call clean, and the CLI would print RATING-CAP: and exit 0
    # either way — the exact false-confidence path this gate exists to close. Require an actual verdict
    # from the enum commodity/pre-mortem.md step 4 defines, and a finite 0-100 recommended_confidence.
    if verdict not in _VALID_VERDICTS or not (_isnum(rec_conf) and 0 <= rec_conf <= 100):
        return (
            "incomplete_pre_mortem",
            f"{os.path.basename(pm_path)} is missing a valid verdict/recommended_confidence "
            f"(verdict={verdict!r}, recommended_confidence={rec_conf!r}) — gate did not run",
            None,
        )

    # CONFIDENCE (gemini r3694529576 + Codex r3694542409). post_review_confidence_score is the number the
    # engine stands behind after its own red-team: the pre-mortem's recommended_confidence, else the
    # original. A pre-mortem may only HOLD or LOWER conviction (commodity/pre-mortem.md rule 1) — so the
    # deterministic gate CLAMPS a would-be raise back to the original rather than trusting the LLM-authored
    # report not to raise it. The haircut is then DERIVED purely from the delta (original − post_review,
    # clamped ≥ 0), never read from the self-reported confidence_haircut field: a report can carry a
    # numeric-but-inconsistent haircut (e.g. 0 alongside recommended_confidence below the original), which
    # would otherwise record a haircut that contradicts the score it sits next to.
    post_review = rec_conf if _isnum(rec_conf) else orig_conf
    if _isnum(post_review) and _isnum(orig_conf) and post_review > orig_conf:
        post_review = orig_conf
    haircut = (orig_conf - post_review) if (_isnum(orig_conf) and _isnum(post_review)) else 0
    if _isnum(haircut) and haircut < 0:
        haircut = 0

    dr["confidence_haircut"] = haircut
    dr["pre_mortem_verdict"] = verdict
    dr["post_review_confidence_score"] = post_review

    # RATING-CAP propagation with DETERMINISTIC ordering (Codex r3694542418). The pre-mortem is
    # LLM-authored and only validated as JSON, so its prose promise ("never a LESS cautious cap than the
    # run's own action" — commodity/pre-mortem.md rule 1 / step 4) is NOT a safety boundary the gate may
    # trust. Enforce it here: on the caution ladder Buy < Hold < Trim < Avoid, apply the cap only when it
    # is at least as cautious as the run's own action; a less-cautious (conviction-RAISING) cap is
    # rejected and the original action is retained. "Research More" is the separate insufficient-evidence
    # outcome, allowed as a cap from any action; a cap that is neither a ladder value nor "Research More",
    # or that cannot be ordered against a non-ladder original, retains the original action.
    _LADDER = {"Buy": 0, "Hold": 1, "Trim": 2, "Avoid": 3}  # higher = more cautious
    cap = (pm.get("recommended_action_cap") or "").strip()
    post_action = orig_action
    if cap == "Research More":
        post_action = cap
    elif orig_action == "Research More" and cap == "Avoid":
        post_action = cap
    elif cap in _LADDER and orig_action in _LADDER:
        post_action = cap if _LADDER[cap] >= _LADDER[orig_action] else orig_action
    # else (no cap / unrecognized cap / non-ladder original): retain orig_action.
    dr["post_mortem_action"] = post_action
    exposure_by_action = {
        "Buy": 1.0, "Hold": 0.5, "Trim": 0.25, "Avoid": 0.0, "Research More": None,
    }
    dr["post_mortem_target_exposure_risk_units"] = exposure_by_action.get(post_action)

    with open(dr_path, "w", encoding="utf-8") as f:
        json.dump(dr, f, indent=2, ensure_ascii=False)
        f.write("\n")

    msg = (
        f"pre_mortem={os.path.basename(pm_path)} verdict={verdict!r} | "
        f"confidence {orig_conf} -> {post_review} (-{haircut}) | "
        f"action {orig_action!r} -> post_mortem_action={post_action!r} "
        f"(target={dr['post_mortem_target_exposure_risk_units']!r} risk units)"
    )
    return "patched", msg, dr


def _selftest():
    import tempfile

    failures = []

    def check(name, cond):
        if not cond:
            failures.append(name)

    with tempfile.TemporaryDirectory() as tmp:
        # 1. No pre_mortem.json at all — no-op, decision_record.json untouched.
        run = os.path.join(tmp, "NOPM")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 50}, open(os.path.join(run, "decision_record.json"), "w"))
        status, _msg, dr = patch(run)
        check("no pre_mortem -> status no_pre_mortem", status == "no_pre_mortem")
        check("no pre_mortem -> no patched record returned", dr is None)
        untouched = json.load(open(os.path.join(run, "decision_record.json")))
        check("no pre_mortem -> decision_record.json unchanged", "confidence_haircut" not in untouched)

        # 2. Terminal downgrade — mirrors the real committed GOLD case (Hold/52 -> Trim/40).
        run = os.path.join(tmp, "GOLD")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 52}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {
                "verdict": "Does not survive — downgrade",
                "original_confidence": 52,
                "recommended_confidence": 40,
                "confidence_haircut": 12,
                "recommended_action_cap": "Trim",
            },
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("terminal downgrade -> patched", status == "patched")
        check("haircut applied", dr["confidence_haircut"] == 12)
        check("post_review_confidence_score", dr["post_review_confidence_score"] == 40)
        check("post_mortem_action capped to Trim", dr["post_mortem_action"] == "Trim")
        check("Trim cap maps to 0.25 risk units", dr["post_mortem_target_exposure_risk_units"] == 0.25)
        check("pre_mortem_verdict recorded", dr["pre_mortem_verdict"] == "Does not survive — downgrade")
        check("original action untouched", dr["action"] == "Hold")
        check("original confidence untouched", dr["confidence"] == 52)

        # 3. Clean survival — no haircut, no cap; action/confidence pass through unchanged.
        run = os.path.join(tmp, "COPPER")
        os.makedirs(run)
        json.dump({"action": "Buy", "confidence": 70}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {
                "verdict": "Survives",
                "original_confidence": 70,
                "recommended_confidence": 70,
                "confidence_haircut": 0,
                "recommended_action_cap": "",
            },
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("clean survival -> patched", status == "patched")
        check("clean survival -> post_mortem_action == original action", dr["post_mortem_action"] == "Buy")
        check("clean Buy maps to 1.0 risk unit", dr["post_mortem_target_exposure_risk_units"] == 1.0)
        check("clean survival -> no haircut", dr["confidence_haircut"] == 0)
        check("clean survival -> post_review == original", dr["post_review_confidence_score"] == 70)

        # 4. Versioned re-run (pre_mortem_v2.json) — the LATEST version wins, not the first.
        run = os.path.join(tmp, "WHEAT")
        os.makedirs(run)
        json.dump({"action": "Buy", "confidence": 65}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Survives", "recommended_confidence": 65, "confidence_haircut": 0, "recommended_action_cap": ""},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        json.dump(
            {
                "verdict": "Survives with haircut",
                "original_confidence": 65,
                "recommended_confidence": 55,
                "confidence_haircut": 10,
                "recommended_action_cap": "",
            },
            open(os.path.join(run, "pre_mortem_v2.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("versioned rerun -> latest version used", dr["post_review_confidence_score"] == 55)
        check("versioned rerun -> haircut from latest version", dr["confidence_haircut"] == 10)

        # 5. Missing decision_record.json — read_error, not a crash.
        run = os.path.join(tmp, "NODR")
        os.makedirs(run)
        json.dump(
            {"verdict": "Survives", "recommended_confidence": 50, "confidence_haircut": 0},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("missing decision_record -> read_error", status == "read_error")
        check("missing decision_record -> no record returned", dr is None)

        # 6. confidence_haircut absent from pre_mortem.json — DERIVED from the confidence delta, not
        #    silently zeroed (the exact bug this mirrors from research/full.md 10B.2's own guard).
        run = os.path.join(tmp, "ALUMINIUM")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 60}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Survives with haircut", "original_confidence": 60, "recommended_confidence": 48,
             "recommended_action_cap": ""},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("derived haircut when field absent", dr["confidence_haircut"] == 12)

        # 7. Unrelated file (pre_mortem_summary.json) never mistaken for a report version.
        run = os.path.join(tmp, "SUGAR")
        os.makedirs(run)
        json.dump({"action": "Buy", "confidence": 55}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump({"note": "not a real report"}, open(os.path.join(run, "pre_mortem_summary.json"), "w"))
        status, _msg, dr = patch(run)
        check("unrelated pre_mortem_summary.json ignored -> no_pre_mortem", status == "no_pre_mortem")

        # 8. Action-cap ordering — a LESS cautious cap (Avoid -> Buy) must be REJECTED, not applied
        #    (commodity/pre-mortem.md rule 1: a pre-mortem can only hold or LOWER conviction). Expected
        #    value pinned to that rule, NOT to current code behaviour.
        run = os.path.join(tmp, "NICKEL")
        os.makedirs(run)
        json.dump({"action": "Avoid", "confidence": 30}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Survives", "original_action": "Avoid", "original_confidence": 30,
             "recommended_confidence": 30, "recommended_action_cap": "Buy"},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("less-cautious cap rejected -> original action retained", dr["post_mortem_action"] == "Avoid")
        check("retained Avoid maps to zero risk units", dr["post_mortem_target_exposure_risk_units"] == 0.0)

        # 9. Action-cap ordering — "Research More" is an allowed cap from any action (insufficient evidence).
        run = os.path.join(tmp, "ZINC")
        os.makedirs(run)
        json.dump({"action": "Buy", "confidence": 60}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Thesis broken", "original_action": "Buy", "original_confidence": 60,
             "recommended_confidence": 20, "recommended_action_cap": "Research More"},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("Research More cap applied from Buy", dr["post_mortem_action"] == "Research More")
        check("Research More maps to null exposure", dr["post_mortem_target_exposure_risk_units"] is None)

        # A proven critical risk can turn abstention into zero exposure, but no other ladder action may
        # turn Research More into a position.
        run = os.path.join(tmp, "CRITICAL_RISK")
        os.makedirs(run)
        json.dump({"action": "Research More", "confidence": 0}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Thesis broken", "original_action": "Research More", "original_confidence": 0,
             "recommended_confidence": 0, "recommended_action_cap": "Avoid"},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("critical-risk cap moves Research More to Avoid", dr["post_mortem_action"] == "Avoid")
        check("critical-risk Avoid maps to zero exposure", dr["post_mortem_target_exposure_risk_units"] == 0.0)

        # 10. Confidence never-RAISED — a report recommending a HIGHER confidence than the record is clamped
        #     back to the original (rule 1), and the derived haircut is 0 (never negative).
        run = os.path.join(tmp, "TIN")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 50}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Survives", "original_action": "Hold", "original_confidence": 50,
             "recommended_confidence": 70, "recommended_action_cap": ""},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("confidence raise clamped to original", dr["post_review_confidence_score"] == 50)
        check("no negative haircut on a clamped raise", dr["confidence_haircut"] == 0)

        # 11. Haircut DERIVED from the delta even when a numeric-but-inconsistent confidence_haircut=0 is
        #     self-reported alongside recommended_confidence below the original (Codex r3694542409).
        run = os.path.join(tmp, "LEAD")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 70}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Survives with haircut", "original_action": "Hold", "original_confidence": 70,
             "recommended_confidence": 50, "confidence_haircut": 0, "recommended_action_cap": ""},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("inconsistent self-reported haircut=0 overridden by derived delta", dr["confidence_haircut"] == 20)
        check("post_review from recommended not self-reported", dr["post_review_confidence_score"] == 50)

        # 12. STALE pre-mortem — a prior report whose snapshot no longer matches the (since-rewritten)
        #     record is NOT applied; the record is left untouched and the status is stale_pre_mortem
        #     (Codex r3694542416).
        run = os.path.join(tmp, "PLATINUM")
        os.makedirs(run)
        json.dump({"action": "Trim", "confidence": 40}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Survives", "original_action": "Buy", "original_confidence": 70,
             "recommended_confidence": 55, "recommended_action_cap": "Hold"},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("stale pre-mortem (action mismatch) -> stale_pre_mortem", status == "stale_pre_mortem")
        check("stale pre-mortem -> no patched record returned", dr is None)
        untouched = json.load(open(os.path.join(run, "decision_record.json")))
        check("stale pre-mortem -> decision_record.json untouched", "post_mortem_action" not in untouched)

        # 13. Idempotency across the staleness guard — the FRESH path re-runs to the identical patch
        #     (patch never mutates action/confidence, so the snapshot stays matched).
        run = os.path.join(tmp, "PALLADIUM")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 52}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "Does not survive — downgrade", "original_action": "Hold", "original_confidence": 52,
             "recommended_confidence": 40, "recommended_action_cap": "Trim"},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        s1, _m1, d1 = patch(run)
        s2, _m2, d2 = patch(run)
        check("idempotent -> both runs patched", s1 == "patched" and s2 == "patched")
        check("idempotent -> identical post_mortem_action", d1["post_mortem_action"] == d2["post_mortem_action"] == "Trim")
        check("idempotent -> identical post_review", d1["post_review_confidence_score"] == d2["post_review_confidence_score"] == 40)

        # 14. INCOMPLETE pre-mortem — a syntactically valid but semantically empty report (`{}`) must
        #     not silently read as "reviewed and clean" (Codex r3694803052).
        run = os.path.join(tmp, "EMPTYPM")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 50}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump({}, open(os.path.join(run, "pre_mortem.json"), "w"))
        status, _msg, dr = patch(run)
        check("empty {} report -> incomplete_pre_mortem", status == "incomplete_pre_mortem")
        check("empty {} report -> no patched record returned", dr is None)
        untouched = json.load(open(os.path.join(run, "decision_record.json")))
        check("empty {} report -> decision_record.json untouched", "post_mortem_action" not in untouched)

        # 14b. Blank verdict + null recommended_confidence — same rejection as case 14, not just a
        #      fully-empty object (the exact shape Codex's example used).
        run = os.path.join(tmp, "EMPTYPM2")
        os.makedirs(run)
        json.dump({"action": "Buy", "confidence": 60}, open(os.path.join(run, "decision_record.json"), "w"))
        json.dump(
            {"verdict": "", "recommended_confidence": None, "recommended_action_cap": ""},
            open(os.path.join(run, "pre_mortem.json"), "w"),
        )
        status, _msg, dr = patch(run)
        check("blank verdict + null confidence -> incomplete_pre_mortem", status == "incomplete_pre_mortem")

        # 15. --prior guard (Codex r3694803055): matching action/confidence values alone cannot prove
        #     a NEW report was written this invocation. A caller (rerun.md step 6.5) that captured the
        #     pre-existing report's path before running pre-mortem.md and gets that same path back must
        #     be rejected — even though its content is otherwise perfectly consistent with the record.
        run = os.path.join(tmp, "RHODIUM")
        os.makedirs(run)
        json.dump({"action": "Hold", "confidence": 52}, open(os.path.join(run, "decision_record.json"), "w"))
        pm_path = os.path.join(run, "pre_mortem.json")
        json.dump(
            {"verdict": "Does not survive — downgrade", "original_action": "Hold", "original_confidence": 52,
             "recommended_confidence": 40, "recommended_action_cap": "Trim"},
            open(pm_path, "w"),
        )
        status, _msg, dr = patch(run, prior_path=pm_path)
        check("prior == latest -> no_fresh_pre_mortem", status == "no_fresh_pre_mortem")
        check("prior == latest -> no patched record returned", dr is None)
        # A genuinely fresh versioned report proceeds normally even though a prior report is on file.
        pm_v2 = os.path.join(run, "pre_mortem_v2.json")
        json.dump(
            {"verdict": "Does not survive — downgrade", "original_action": "Hold", "original_confidence": 52,
             "recommended_confidence": 35, "recommended_action_cap": "Trim"},
            open(pm_v2, "w"),
        )
        status, _msg, dr = patch(run, prior_path=pm_path)
        check("prior != latest (fresh _v2 written) -> patched", status == "patched")
        check("prior != latest -> uses the fresh v2 values", dr["post_review_confidence_score"] == 35)

    if failures:
        print("SELFTEST FAIL:", ", ".join(failures))
        return 1
    print("SELFTEST OK (all checks passed)")
    return 0


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    args = list(argv)
    prior_path = None
    if "--prior" in args:
        i = args.index("--prior")
        if i + 1 >= len(args):
            print("usage: commodity_pre_mortem_haircut.py <RUN_ROOT> [--prior <path>] | --selftest", file=sys.stderr)
            return 2
        prior_path = args[i + 1]
        del args[i : i + 2]
    if not args:
        print("usage: commodity_pre_mortem_haircut.py <RUN_ROOT> [--prior <path>] | --selftest", file=sys.stderr)
        return 2
    run_root = args[0]
    status, msg, _dr = patch(run_root, prior_path=prior_path)
    if status == "patched":
        print(f"RATING-CAP: {msg}")
        return 0
    # FAIL CLOSED (Codex r3694542402). Every non-"patched" outcome means the integrity gate did NOT
    # propagate a fresh pre-mortem into the record. A caller that just generated one (commodity:full
    # step 5.5 / commodity:rerun step 6.5) must halt on this nonzero exit rather than commit a clean,
    # unaudited action/confidence — the exact false-confidence path this gate exists to close.
    print(f"GATE-FAIL: {status} — {msg}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
