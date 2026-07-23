#!/usr/bin/env python3
"""scripts/valuation_summary_checks.py — the integrity guard for the valuation lever sidecar.

WHY THIS EXISTS
    99_valuation-synthesis emits `analyses/<run>/valuation/valuation_summary.json` — the machine-readable
    LEVERS the cockpit Valuation Playground moves (per-scenario metric/multiple, the method football field
    + weights, WACC components, price). That sidecar is §25 DATA: it reaches `main` WITHOUT passing CI, the
    same door the WHEAT `key_levels` and ALUMINIUM enum defects came through. A malformed sidecar, or one
    whose scenario levels CONTRADICT the run's own frozen decision_record.json, would make the Playground
    show levers that disagree with the committed thesis — the exact failure the levers exist to prevent.

    This is the retrospective guard: it validates every committed sidecar. It is SOFT-PRESENCE by design —
    a run with no sidecar is N/A, never a failure, because some runs legitimately cannot emit one (no
    pool-verified price, no scenario points, a partial run with no master decision). It is STRICT-VALIDITY
    for any sidecar that DOES exist. Imported by eval.py as check AP (and finish-gate-ready, exactly like
    scripts/headline_checks.py is for checks AI/AK).

    HONEST SCOPE: this checks structural integrity + non-contradiction with the frozen decision_record. It
    does NOT re-derive the analyst's fair value or re-judge the methods — those are the recorded levers.
"""
from __future__ import annotations

import json
import os
import sys

# scripts/ is on sys.path for both callers (eval.py imports siblings directly), so this resolves.
from valuation_math import blend as _blend, _isnum

# The load-bearing subset of frameworks/valuation_summary.schema.json, encoded here so the core stays
# PURE (no file read) and unit-testable fixture-free. The schema file remains the authoritative contract.
_REQUIRED = ("schema_version", "ticker", "basis", "scenarios")
_BASIS = ("equity", "ev")
_NET_DEBT_BASIS = ("strict", "broad", "gross-liquidity", None)
_PRICE_STATE = ("pool-verified", "indicative", "none", None)
_LEVEL_TOL = 0.01


def eval_ap_valuation_summary_integrity(sidecar, decision):
    """Core of check AP. Returns None (no sidecar → N/A, soft presence) or a list of violation strings
    (empty list = pass). Pure + module-level so eval.py selftest drives every branch fixture-free.

    `sidecar`  : the parsed valuation_summary.json (or None if the file is absent/unreadable).
    `decision` : the parsed decision_record.json (or None) — used only to assert the sidecar's scenario
                 levels do NOT contradict the frozen thesis (skipped when the run has no scenarios there).
    """
    if sidecar is None:
        return None  # SOFT PRESENCE: absence is never a failure.
    if not isinstance(sidecar, dict):
        return ["valuation_summary.json is not a JSON object"]

    det = []
    for req in _REQUIRED:
        if req not in sidecar:
            det.append(f"missing required key '{req}'")

    if sidecar.get("basis") not in _BASIS:
        det.append(f"basis {sidecar.get('basis')!r} not in {_BASIS}")
    if "net_debt_basis" in sidecar and sidecar.get("net_debt_basis") not in _NET_DEBT_BASIS:
        det.append(f"net_debt_basis {sidecar.get('net_debt_basis')!r} not in {_NET_DEBT_BASIS}")
    if "price_state" in sidecar and sidecar.get("price_state") not in _PRICE_STATE:
        det.append(f"price_state {sidecar.get('price_state')!r} not in {_PRICE_STATE}")

    scen = sidecar.get("scenarios")
    if not isinstance(scen, list) or not scen:
        det.append("scenarios must be a non-empty array")
        return det  # nothing downstream is checkable without scenarios
    for i, s in enumerate(scen):
        if not isinstance(s, dict) or "label" not in s:
            det.append(f"scenario[{i}] missing 'label'")
        elif s.get("probability") is not None:
            # the master synthesizer owns probabilities (decision_record.json); the levers sidecar must not.
            det.append(f"scenario[{i}] ({s.get('label')!r}) carries a probability — the master owns those")

    # Football field, when present, must blend to a finite base point (methods/weights not malformed).
    methods, weights = sidecar.get("methods"), sidecar.get("method_weights")
    if isinstance(methods, dict) and methods:
        try:
            b = _blend(methods, weights if isinstance(weights, dict) else {})
            if b.get("base_point") is None:
                det.append("methods present but the blend yields no base point "
                           "(no method carries a numeric value AND weight)")
        except Exception as e:  # a pure resolver should never raise; if it does, the football field is bad
            det.append(f"blend() raised on methods/method_weights: {e}")

    # THE faithfulness check: a scenario level must not contradict the frozen decision_record price_target.
    dr_scen = decision.get("scenarios") if isinstance(decision, dict) else None
    if isinstance(dr_scen, list) and dr_scen:
        dr_by = {str(s.get("label", "")).strip().lower(): s for s in dr_scen if isinstance(s, dict)}
        for s in scen:
            if not isinstance(s, dict):
                continue
            lab = str(s.get("label", "")).strip().lower()
            drs = dr_by.get(lab)
            if drs is None:
                continue
            lvl, pt = s.get("level"), drs.get("price_target")
            if _isnum(lvl) and _isnum(pt) and abs(float(lvl) - float(pt)) > _LEVEL_TOL:
                det.append(f"scenario {lab!r} level {lvl} contradicts decision_record price_target {pt} "
                           f"(the Playground would show a lever that disagrees with the frozen thesis)")
    return det


def scan_committed(root="."):
    """Validate every committed analyses/*/valuation/valuation_summary.json. Returns (checked, failures)
    where failures is a list of (run, [violations]). The CI / --all entry point."""
    import glob
    checked, failures = 0, []
    for sc_path in sorted(glob.glob(os.path.join(root, "analyses/*/valuation/valuation_summary.json"))):
        run = os.path.basename(os.path.dirname(os.path.dirname(sc_path)))
        try:
            sidecar = json.load(open(sc_path, encoding="utf-8"))
        except Exception as e:
            failures.append((run, [f"could not parse valuation_summary.json: {e}"]))
            checked += 1
            continue
        dr_path = os.path.join(os.path.dirname(os.path.dirname(sc_path)), "decision_record.json")
        decision = None
        if os.path.exists(dr_path):
            try:
                decision = json.load(open(dr_path, encoding="utf-8"))
            except Exception:
                decision = None  # unreadable DR → skip the contradiction check, still validate structure
        viol = eval_ap_valuation_summary_integrity(sidecar, decision)
        checked += 1
        if viol:
            failures.append((run, viol))
    return checked, failures


def _selftest() -> int:
    fails = []

    def check(name, cond):
        if not cond:
            fails.append(name)

    ok_sidecar = {
        "schema_version": "1.0", "ticker": "T", "basis": "equity",
        "scenarios": [{"label": "bull", "level": 20}, {"label": "base", "level": 15}, {"label": "bear", "level": 10}],
        "methods": {"peers": 16, "dcf": 14}, "method_weights": {"peers": 0.5, "dcf": 0.5},
        "net_debt_basis": "broad", "price_state": "pool-verified",
    }
    dr_match = {"scenarios": [{"label": "bull", "price_target": 20}, {"label": "base", "price_target": 15}, {"label": "bear", "price_target": 10}]}

    # soft presence + happy path
    check("absent → None (soft presence)", eval_ap_valuation_summary_integrity(None, dr_match) is None)
    check("valid sidecar → [] pass", eval_ap_valuation_summary_integrity(ok_sidecar, dr_match) == [])
    check("valid sidecar, no DR → [] pass", eval_ap_valuation_summary_integrity(ok_sidecar, None) == [])

    # structural violations
    check("non-object → violation", eval_ap_valuation_summary_integrity([1, 2], None) == ["valuation_summary.json is not a JSON object"])
    miss = dict(ok_sidecar); del miss["ticker"]
    check("missing key caught", any("ticker" in v for v in eval_ap_valuation_summary_integrity(miss, None)))
    badbasis = dict(ok_sidecar, basis="nav")
    check("bad basis caught", any("basis" in v for v in eval_ap_valuation_summary_integrity(badbasis, None)))
    noscen = dict(ok_sidecar, scenarios=[])
    check("empty scenarios caught", any("non-empty" in v for v in eval_ap_valuation_summary_integrity(noscen, None)))
    prob = dict(ok_sidecar, scenarios=[{"label": "base", "level": 15, "probability": 50}])
    check("probability in sidecar caught", any("probability" in v for v in eval_ap_valuation_summary_integrity(prob, None)))

    # football-field malformed
    deadblend = dict(ok_sidecar, methods={"peers": None}, method_weights={"peers": 0.5})
    check("blend with no numeric value caught", any("blend" in v for v in eval_ap_valuation_summary_integrity(deadblend, None)))

    # THE contradiction check
    dr_conflict = {"scenarios": [{"label": "bull", "price_target": 20}, {"label": "base", "price_target": 99}, {"label": "bear", "price_target": 10}]}
    r = eval_ap_valuation_summary_integrity(ok_sidecar, dr_conflict)
    check("level contradicting decision_record caught", any("contradicts" in v and "base" in v for v in r))
    # a decision_record with scenarios: null (BG/HCG/TMCV shape) must NOT trip the contradiction check
    check("null DR scenarios → no contradiction fire", eval_ap_valuation_summary_integrity(ok_sidecar, {"scenarios": None}) == [])

    if fails:
        print("VALUATION SUMMARY CHECKS SELFTEST FAIL:", ", ".join(fails))
        return 1
    print("VALUATION SUMMARY CHECKS SELFTEST PASS — soft-presence + structure + blend + "
          "decision_record non-contradiction, all branches green")
    return 0


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        raise SystemExit(_selftest())
    if "--all" in sys.argv:
        checked, failures = scan_committed(".")
        for run, viol in failures:
            for v in viol:
                print(f"  ✗ {run}: {v}")
        if failures:
            print(f"VALUATION SUMMARY SCAN FAIL — {len(failures)}/{checked} committed sidecar(s) invalid")
            raise SystemExit(1)
        print(f"VALUATION SUMMARY SCAN PASS — {checked} committed sidecar(s) valid + non-contradicting")
        raise SystemExit(0)
    print("usage: valuation_summary_checks.py [--selftest | --all]")
    raise SystemExit(2)
