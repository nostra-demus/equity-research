#!/usr/bin/env python3
"""scripts/valuation_summary_checks.py — the integrity guard for the valuation lever sidecar.

WHY THIS EXISTS
    99_valuation-synthesis emits `analyses/<run>/valuation/valuation_summary.json` — the machine-readable
    LEVERS the cockpit Valuation Playground moves (per-scenario metric/multiple, the method football field
    + weights, WACC components, price). That sidecar is §25 DATA: it reaches `main` WITHOUT passing CI, the
    same door the WHEAT `key_levels` and ALUMINIUM enum defects came through. A malformed sidecar, or one
    whose scenario levers DISAGREE with the run's own frozen decision_record.json, would make the Playground
    show levers that disagree with the committed thesis — the exact failure the levers exist to prevent.

    This is the integrity guard. It runs in TWO callers (mirroring scripts/headline_checks.py): eval.py as
    check AP (retrospective, CI) AND the /research:full 10B.1 finish-gate (pre-publish, stamps PROVISIONAL).
    It is SOFT-PRESENCE by design — a run with no sidecar is N/A, never a failure, because some runs
    legitimately cannot emit one (no pool-verified price, no scenario points, a partial run). It is
    STRICT-VALIDITY for any sidecar that DOES exist.

    HONEST SCOPE: this checks structural integrity + non-contradiction with the frozen decision_record. It
    does NOT re-derive the analyst's fair value or re-judge the methods — those are the recorded levers.
"""
from __future__ import annotations

import json
import os
import sys

# scripts/ is on sys.path for both callers (eval.py / the finish-gate import siblings directly).
from valuation_math import blend as _blend, level_from_multiple as _level_from_multiple


def _isnum(v) -> bool:
    # Local (not imported) so the guard never couples to another module's private helper.
    return isinstance(v, (int, float)) and not isinstance(v, bool)


# The load-bearing subset of frameworks/valuation_summary.schema.json, encoded here so the core stays
# PURE (no file read) and unit-testable fixture-free. The schema file remains the authoritative contract.
_REQUIRED = ("schema_version", "ticker", "basis", "scenarios")
_BASIS = ("equity", "ev")
_NET_DEBT_BASIS = ("strict", "broad", "gross-liquidity", None)
_PRICE_STATE = ("pool-verified", "indicative", "none", None)
# A scenario level "contradicts" the frozen thesis only on a MATERIAL gap — a relative tolerance (with a
# small absolute floor) so ordinary rounding on a high-priced level is not a false positive, while a real
# disagreement (e.g. base 999 vs 210) is still caught.
_LEVEL_REL_TOL = 0.005   # 0.5%
_LEVEL_ABS_FLOOR = 0.5


def _tol(target) -> float:
    return max(_LEVEL_ABS_FLOOR, _LEVEL_REL_TOL * abs(float(target)))


def eval_ap_valuation_summary_integrity(sidecar, decision):
    """Core of check AP. Returns None (no sidecar → N/A, soft presence) or a list of violation strings
    (empty list = pass). Pure + module-level so both callers' selftests drive every branch fixture-free.

    `sidecar`  : the parsed valuation_summary.json (or None if the file is absent/unreadable).
    `decision` : the parsed decision_record.json (or None) — used to assert the sidecar's scenario labels
                 MATCH the frozen thesis and its levels do NOT contradict it (skipped when the run has no
                 decision-record scenarios, e.g. a partial run).
    """
    if sidecar is None:
        return None  # SOFT PRESENCE: absence is never a failure.
    if not isinstance(sidecar, dict):
        return ["valuation_summary.json is not a JSON object"]

    det = []
    for req in _REQUIRED:
        if req not in sidecar:
            det.append(f"missing required key '{req}'")

    basis = sidecar.get("basis")
    if basis not in _BASIS:
        det.append(f"basis {basis!r} not in {_BASIS}")
    if "net_debt_basis" in sidecar and sidecar.get("net_debt_basis") not in _NET_DEBT_BASIS:
        det.append(f"net_debt_basis {sidecar.get('net_debt_basis')!r} not in {_NET_DEBT_BASIS}")
    if "price_state" in sidecar and sidecar.get("price_state") not in _PRICE_STATE:
        det.append(f"price_state {sidecar.get('price_state')!r} not in {_PRICE_STATE}")

    scen = sidecar.get("scenarios")
    if not isinstance(scen, list) or not scen:
        det.append("scenarios must be a non-empty array")
        return det  # nothing downstream is checkable without scenarios

    labels = []
    for i, s in enumerate(scen):
        if not isinstance(s, dict) or "label" not in s:
            det.append(f"scenario[{i}] missing 'label'")
            continue
        labels.append(str(s.get("label", "")).strip().lower())
        if s.get("probability") is not None:
            # the master synthesizer owns probabilities (decision_record.json); the levers sidecar must not.
            det.append(f"scenario[{i}] ({s.get('label')!r}) carries a probability — the master owns those")
        # When BOTH editable levers are present the Playground recomputes level = forward_metric × multiple
        # (bridged for ev) and IGNORES the supplied `level` — so a level that disagrees with that product
        # ships a baseline the Playground would silently override. Verify the identity here.
        fm, mult, lvl = s.get("forward_metric"), s.get("multiple"), s.get("level")
        if _isnum(fm) and _isnum(mult):
            try:
                derived = _level_from_multiple(float(fm), float(mult), basis, sidecar.get("shares"), sidecar.get("net_debt"))
            except Exception as e:
                det.append(f"scenario {s.get('label')!r} has forward_metric×multiple but no derivable level ({e}) "
                           f"— an ev basis needs positive shares + a numeric net_debt for the bridge")
            else:
                if _isnum(lvl) and abs(float(lvl) - derived) > _tol(derived):
                    det.append(f"scenario {s.get('label')!r} level {lvl} != forward_metric×multiple {round(derived, 4)} "
                               f"— the Playground recomputes the latter and would disagree with the recorded level")

    # Distinct labels (a duplicate scenario label is malformed — the Playground keys scenarios by label).
    for lab in sorted({l for l in labels if labels.count(l) > 1}):
        det.append(f"duplicate scenario label {lab!r}")

    # Football field, when it carries any NUMERIC method value, must blend to a finite base point. An
    # all-null methods map is a documented "unavailable" state (schema permits null values) and is NOT a
    # failure — only a field that claims numeric values yet cannot blend (missing/zero weights) is.
    methods, weights = sidecar.get("methods"), sidecar.get("method_weights")
    if isinstance(methods, dict) and any(_isnum(v) for v in methods.values()):
        try:
            b = _blend(methods, weights if isinstance(weights, dict) else {})
            if b.get("base_point") is None:
                det.append("methods carry numeric value(s) but the blend yields no base point "
                           "(no method has BOTH a numeric value and a positive weight)")
        except Exception as e:  # a pure resolver should never raise; if it does, the football field is bad
            det.append(f"blend() raised on methods/method_weights: {e}")

    # Match the sidecar's scenario label set to the frozen decision_record, and check each shared level for
    # contradiction. A sidecar label with no decision-record counterpart (or a missing one) means the
    # Playground — which uses the non-empty sidecar over the decision-record fallback — cannot derive the
    # base-case margin of safety / bear-case downside.
    dr_scen = decision.get("scenarios") if isinstance(decision, dict) else None
    if isinstance(dr_scen, list) and dr_scen:
        dr_by = {str(s.get("label", "")).strip().lower(): s for s in dr_scen if isinstance(s, dict)}
        sc_set, dr_set = set(labels), set(dr_by)
        for lab in sorted(sc_set - dr_set):
            det.append(f"scenario {lab!r} has no decision_record counterpart — the sidecar's label set must match the frozen thesis")
        for lab in sorted(dr_set - sc_set):
            det.append(f"decision_record scenario {lab!r} is missing from the sidecar — the Playground could not derive its return")
        for s in scen:
            if not isinstance(s, dict):
                continue
            lab = str(s.get("label", "")).strip().lower()
            drs = dr_by.get(lab)
            if drs is None:
                continue
            lvl, pt = s.get("level"), drs.get("price_target")
            if _isnum(lvl) and _isnum(pt) and abs(float(lvl) - float(pt)) > _tol(pt):
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
    dup = dict(ok_sidecar, scenarios=[{"label": "base", "level": 15}, {"label": "Base", "level": 16}])
    check("duplicate label caught", any("duplicate" in v for v in eval_ap_valuation_summary_integrity(dup, None)))

    # football field: a numeric value that cannot blend is caught; an all-null map is NOT (unavailable is valid)
    deadblend = dict(ok_sidecar, methods={"peers": 100}, method_weights={})
    check("numeric method with no blend caught", any("blend" in v for v in eval_ap_valuation_summary_integrity(deadblend, None)))
    allnull = dict(ok_sidecar, methods={"peers": None, "dcf": None}, method_weights={"peers": None, "dcf": None})
    check("all-null football field is valid (unavailable)", eval_ap_valuation_summary_integrity(allnull, None) == [])

    # metric×multiple identity: a level that disagrees with forward_metric×multiple is caught
    lever_ok = dict(ok_sidecar, scenarios=[{"label": "base", "forward_metric": 6, "multiple": 25, "level": 150}])
    check("level == metric×multiple passes", eval_ap_valuation_summary_integrity(lever_ok, None) == [])
    lever_bad = dict(ok_sidecar, scenarios=[{"label": "base", "forward_metric": 10, "multiple": 9, "level": 100}])
    check("level != metric×multiple caught", any("forward_metric" in v and "recomputes" in v for v in eval_ap_valuation_summary_integrity(lever_bad, None)))
    ev_no_bridge = dict(ok_sidecar, basis="ev", shares=None, net_debt=None,
                        scenarios=[{"label": "base", "forward_metric": 100, "multiple": 12, "level": 100}])
    check("ev metric×multiple without bridge caught", any("derivable level" in v for v in eval_ap_valuation_summary_integrity(ev_no_bridge, None)))

    # label-set matching against the frozen decision_record
    upside_only = dict(ok_sidecar, scenarios=[{"label": "upside", "level": 150}])
    r = eval_ap_valuation_summary_integrity(upside_only, dr_match)
    check("sidecar label absent from DR caught", any("no decision_record counterpart" in v for v in r))
    check("DR label missing from sidecar caught", any("missing from the sidecar" in v for v in r))

    # THE contradiction check (material gap, not rounding)
    dr_conflict = {"scenarios": [{"label": "bull", "price_target": 20}, {"label": "base", "price_target": 99}, {"label": "bear", "price_target": 10}]}
    check("level contradicting DR caught", any("contradicts" in v and "base" in v for v in eval_ap_valuation_summary_integrity(ok_sidecar, dr_conflict)))
    # a sub-tolerance rounding difference does NOT false-fire
    dr_round = {"scenarios": [{"label": "bull", "price_target": 20.002}, {"label": "base", "price_target": 15.001}, {"label": "bear", "price_target": 10.0}]}
    check("rounding difference does not fire", eval_ap_valuation_summary_integrity(ok_sidecar, dr_round) == [])
    # null DR scenarios (BG/HCG/TMCV shape) must NOT trip any DR-dependent check
    check("null DR scenarios → no fire", eval_ap_valuation_summary_integrity(ok_sidecar, {"scenarios": None}) == [])

    if fails:
        print("VALUATION SUMMARY CHECKS SELFTEST FAIL:", ", ".join(fails))
        return 1
    print("VALUATION SUMMARY CHECKS SELFTEST PASS — soft-presence + structure + labels + metric×multiple + "
          "blend + decision_record match/non-contradiction, all branches green")
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
