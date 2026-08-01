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
  • Writes decision_record.json in place, ADDING four fields — never touching the synthesizer's own
    original `action`/`confidence` (CLAUDE.md §18/§22: caps are applied, never silently overridden;
    the original call stays visible for audit):
      confidence_haircut, pre_mortem_verdict, post_review_confidence_score, post_mortem_action
  • No-op (status "no_pre_mortem") if no pre_mortem*.json exists yet — a run with no red-team pass
    ships its original action/confidence unchanged, exactly as before this script existed.
  • Idempotent: re-running against the same pre_mortem.json re-derives the identical patch.
  • Pure `patch()` function + a thin CLI wrapper, so BOTH callers that can (re)write
    decision_record.json — commodity:full.md (a freshly-completed terminal module, or a one-time
    backfill of a pre-existing run) and commodity:rerun.md (every cascade that touches
    commodity-thesis) — call the identical, tested logic instead of duplicating a heredoc.

CLI:
  python3 scripts/commodity_pre_mortem_haircut.py <RUN_ROOT>
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


def patch(run_root):
    """Propagate the latest pre_mortem*.json in <run_root> into its decision_record.json.

    Returns (status, message, patched_record_or_None):
      status == "no_pre_mortem" — no pre_mortem*.json found; decision_record.json untouched.
      status == "read_error"    — decision_record.json or pre_mortem*.json missing/unparseable;
                                   decision_record.json untouched.
      status == "patched"       — decision_record.json rewritten with the four additive fields.
    """
    dr_path = os.path.join(run_root, "decision_record.json")
    pm_path = latest_pre_mortem(run_root)
    if not pm_path:
        return "no_pre_mortem", "no pre_mortem.json found — skipping", None
    try:
        pm = json.load(open(pm_path, encoding="utf-8"))
        dr = json.load(open(dr_path, encoding="utf-8"))
    except Exception as e:
        return "read_error", f"read error ({e}) — skipping", None

    rec_conf = pm.get("recommended_confidence")
    verdict = pm.get("verdict") or ""
    orig_conf = dr.get("confidence")

    # DERIVE the haircut from the confidence delta this propagation exists to enforce — do NOT trust
    # a possibly-null/zeroed self-reported confidence_haircut to decide whether a haircut happened
    # (mirrors research/full.md 10B.2's identical guard against a silently-buried real cut).
    pm_orig = pm.get("original_confidence")
    if not _isnum(pm_orig):
        pm_orig = orig_conf
    haircut = pm.get("confidence_haircut")
    if not _isnum(haircut):
        haircut = (pm_orig - rec_conf) if (_isnum(pm_orig) and _isnum(rec_conf)) else 0

    dr["confidence_haircut"] = haircut
    dr["pre_mortem_verdict"] = verdict
    dr["post_review_confidence_score"] = rec_conf if _isnum(rec_conf) else orig_conf

    # Rating-cap propagation. commodity/pre-mortem.md's own rule 1 guarantees recommended_action_cap
    # is never LESS cautious than the run's own action, so a non-empty cap can be applied directly —
    # no separate ordering table needed (unlike research/full.md's decision/basket, this schema has a
    # single `action` field, so there is no separate "basket" to cap).
    cap = (pm.get("recommended_action_cap") or "").strip()
    orig_action = dr.get("action") or ""
    dr["post_mortem_action"] = cap if cap else orig_action

    with open(dr_path, "w", encoding="utf-8") as f:
        json.dump(dr, f, indent=2, ensure_ascii=False)
        f.write("\n")

    msg = (
        f"pre_mortem={os.path.basename(pm_path)} verdict={verdict!r} | "
        f"confidence {orig_conf} -> {dr['post_review_confidence_score']} (-{haircut}) | "
        f"action {orig_action!r} -> post_mortem_action={dr['post_mortem_action']!r}"
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

    if failures:
        print("SELFTEST FAIL:", ", ".join(failures))
        return 1
    print("SELFTEST OK (all checks passed)")
    return 0


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    if not argv:
        print("usage: commodity_pre_mortem_haircut.py <RUN_ROOT> | --selftest", file=sys.stderr)
        return 2
    run_root = argv[0]
    status, msg, _dr = patch(run_root)
    if status in ("no_pre_mortem", "read_error"):
        print(f"HAIRCUT: {msg}")
        return 0
    print(f"RATING-CAP: {msg}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
