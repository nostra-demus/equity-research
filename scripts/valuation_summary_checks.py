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
        if not isinstance(s.get("label"), str):
            # the schema types label as a string and the Playground calls .toLowerCase() on it — a numeric or
            # other non-string label would throw there, so reject it rather than coercing it to a string here.
            det.append(f"scenario[{i}] label {s.get('label')!r} is not a string")
            continue
        labels.append(s.get("label").strip().lower())
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

    # ---- v1.1 method internals (P-C sub-levers) — each block, when present, must REPRODUCE its recorded
    # method value: the grid cell at `base` == methods.dcf, the segment re-sum == methods.sotp, the anchor
    # line at applied_multiple == methods.peers. A block that disagrees with its own method value would make
    # the Playground derive a number contradicting the committed football field — worse than no block.
    m_of = (lambda k: methods.get(k) if isinstance(methods, dict) else None)
    grid = sidecar.get("dcf_grid")
    if grid is not None:
        if not isinstance(grid, dict):
            det.append("dcf_grid must be an object or null")
        else:
            w, g, vals = grid.get("wacc"), grid.get("growth"), grid.get("values")
            ok_axes = (isinstance(w, list) and len(w) >= 2 and all(_isnum(x) for x in w) and all(w[i] < w[i+1] for i in range(len(w)-1))
                       and isinstance(g, list) and len(g) >= 2 and all(_isnum(x) for x in g) and all(g[i] < g[i+1] for i in range(len(g)-1)))
            if not ok_axes:
                det.append("dcf_grid wacc/growth must be ascending numeric arrays (>= 2 points each)")
            elif not (isinstance(vals, list) and len(vals) == len(g)
                      and all(isinstance(r, list) and len(r) == len(w) and all(_isnum(x) for x in r) for r in vals)):
                det.append(f"dcf_grid values must be a {len(g)}x{len(w)} numeric matrix (values[growthIdx][waccIdx])")
            else:
                base = grid.get("base")
                if isinstance(base, dict) and _isnum(base.get("wacc")) and _isnum(base.get("growth")):
                    wi = next((i for i, x in enumerate(w) if abs(x - base["wacc"]) < 1e-9), None)
                    gi = next((i for i, x in enumerate(g) if abs(x - base["growth"]) < 1e-9), None)
                    if wi is None or gi is None:
                        det.append(f"dcf_grid base ({base.get('wacc')}, {base.get('growth')}) is not a recorded grid point")
                    elif _isnum(m_of("dcf")) and abs(vals[gi][wi] - float(m_of("dcf"))) > _tol(m_of("dcf")):
                        det.append(f"dcf_grid base cell {vals[gi][wi]} != methods.dcf {m_of('dcf')} — the grid must reproduce the recorded method value")
    segs = sidecar.get("sotp_segments")
    if segs is not None:
        if not (isinstance(segs, list) and segs and all(isinstance(s, dict) and _isnum(s.get("metric")) and _isnum(s.get("multiple")) for s in segs)):
            det.append("sotp_segments must be a non-empty array of {segment, metric, multiple} with numeric metric/multiple")
        else:
            br = sidecar.get("sotp_bridge") if isinstance(sidecar.get("sotp_bridge"), dict) else {}
            shares = sidecar.get("shares")
            if _isnum(shares) and shares > 0 and _isnum(m_of("sotp")):
                total_ev = sum(float(s["metric"]) * float(s["multiple"]) for s in segs)
                equity = total_ev - (float(br.get("net_debt")) if _isnum(br.get("net_debt")) else 0.0) \
                                  - (float(br.get("minority")) if _isnum(br.get("minority")) else 0.0) \
                                  + (float(br.get("other")) if _isnum(br.get("other")) else 0.0)
                per_share = equity / float(shares)
                if abs(per_share - float(m_of("sotp"))) > _tol(m_of("sotp")):
                    det.append(f"sotp_segments re-sum {round(per_share, 4)} != methods.sotp {m_of('sotp')} — segments+bridge must reproduce the recorded method value")
    pi = sidecar.get("peers_internals")
    if pi is not None:
        anchors = pi.get("anchors") if isinstance(pi, dict) else None
        if not (isinstance(anchors, list) and len(anchors) >= 2
                and all(isinstance(a, dict) and _isnum(a.get("multiple")) and _isnum(a.get("value")) for a in anchors)
                and abs(float(anchors[0]["multiple"]) - float(anchors[1]["multiple"])) > 1e-9):
            det.append("peers_internals.anchors must hold >= 2 numeric {multiple, value} rows with distinct multiples")
        elif _isnum(pi.get("applied_multiple")) and _isnum(m_of("peers")):
            a0, a1 = anchors[0], anchors[1]
            slope = (float(a1["value"]) - float(a0["value"])) / (float(a1["multiple"]) - float(a0["multiple"]))
            at_applied = float(a0["value"]) + slope * (float(pi["applied_multiple"]) - float(a0["multiple"]))
            if abs(at_applied - float(m_of("peers"))) > _tol(m_of("peers")):
                det.append(f"peers_internals line at applied_multiple gives {round(at_applied, 4)} != methods.peers {m_of('peers')} — the anchors must reproduce the recorded method value")

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
            if not isinstance(s, dict) or not isinstance(s.get("label"), str):
                continue
            lab = s.get("label").strip().lower()
            drs = dr_by.get(lab)
            if drs is None:
                continue
            pt = drs.get("price_target")
            if not _isnum(pt):
                continue
            # Compare the level the Playground actually SHOWS to the frozen target. When both editable levers
            # are present it derives forward_metric×multiple and IGNORES the supplied `level` — so a null or
            # wrong `level` cannot hide a contradiction (the previous check only compared a numeric `level`).
            fm, mult, lvl = s.get("forward_metric"), s.get("multiple"), s.get("level")
            shown = None
            if _isnum(fm) and _isnum(mult):
                try:
                    shown = _level_from_multiple(float(fm), float(mult), basis, sidecar.get("shares"), sidecar.get("net_debt"))
                except Exception:
                    shown = float(lvl) if _isnum(lvl) else None
            elif _isnum(lvl):
                shown = float(lvl)
            if shown is not None and abs(shown - float(pt)) > _tol(pt):
                det.append(f"scenario {lab!r} shows level {round(shown, 4)} but decision_record price_target is {pt} "
                           f"(the Playground derives this from the recorded levers, disagreeing with the frozen thesis)")
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
    check("level contradicting DR caught", any("base" in v and "price_target" in v for v in eval_ap_valuation_summary_integrity(ok_sidecar, dr_conflict)))
    # a NULL supplied level with both levers present must not hide a contradiction — the Playground derives
    # forward_metric×multiple (=90) and ignores the null level; that 90 vs a frozen target of 150 is caught
    null_lever = dict(ok_sidecar, scenarios=[{"label": "base", "forward_metric": 10, "multiple": 9, "level": None}])
    dr_150 = {"scenarios": [{"label": "base", "price_target": 150}]}
    check("null level + levers contradicting DR caught", any("base" in v and "derives" in v for v in eval_ap_valuation_summary_integrity(null_lever, dr_150)))
    # and the same derived level AGREEING with the target does not false-fire (90 vs 90)
    dr_90 = {"scenarios": [{"label": "base", "price_target": 90}]}
    check("null level + levers agreeing → no fire", eval_ap_valuation_summary_integrity(null_lever, dr_90) == [])
    # a non-string scenario label is rejected (the Playground would call .toLowerCase() on it)
    numlabel = dict(ok_sidecar, scenarios=[{"label": 1, "forward_metric": 6, "multiple": 25}])
    check("non-string label caught", any("not a string" in v for v in eval_ap_valuation_summary_integrity(numlabel, None)))
    # a sub-tolerance rounding difference does NOT false-fire
    dr_round = {"scenarios": [{"label": "bull", "price_target": 20.002}, {"label": "base", "price_target": 15.001}, {"label": "bear", "price_target": 10.0}]}
    check("rounding difference does not fire", eval_ap_valuation_summary_integrity(ok_sidecar, dr_round) == [])
    # null DR scenarios (BG/HCG/TMCV shape) must NOT trip any DR-dependent check
    check("null DR scenarios → no fire", eval_ap_valuation_summary_integrity(ok_sidecar, {"scenarios": None}) == [])

    # ---- v1.1 method internals (P-C sub-levers): each block must reproduce its recorded method value ----
    internals = dict(ok_sidecar,
        methods={"dcf": 70, "sotp": 80, "peers": 90}, method_weights={"dcf": 0.4, "sotp": 0.4, "peers": 0.2},
        shares=10, basis="equity",
        dcf_grid={"wacc": [0.07, 0.08], "growth": [0.02, 0.025], "values": [[72, 60], [70, 58]],
                  "base": {"wacc": 0.07, "growth": 0.025}, "source": "04 §7"},
        sotp_segments=[{"segment": "A", "metric": 100, "multiple": 5}, {"segment": "B", "metric": 90, "multiple": 5}],
        sotp_bridge={"net_debt": 100, "minority": 50},  # (500+450) − 150 = 800 → /10 shares = 80 == methods.sotp
        peers_internals={"median_multiple": 6.25, "applied_multiple": 5.6, "discount_pct": 10,
                         "anchors": [{"multiple": 5.6, "value": 90}, {"multiple": 6.25, "value": 100}]})
    check("v1.1 internals that reproduce their method values → pass", eval_ap_valuation_summary_integrity(internals, None) == [])
    bad_cell = dict(internals, dcf_grid=dict(internals["dcf_grid"], values=[[72, 60], [99, 58]]))
    check("grid base cell != methods.dcf caught", any("reproduce the recorded method value" in v and "dcf" in v for v in eval_ap_valuation_summary_integrity(bad_cell, None)))
    bad_axes = dict(internals, dcf_grid=dict(internals["dcf_grid"], wacc=[0.08, 0.07]))
    check("non-ascending wacc axis caught", any("ascending" in v for v in eval_ap_valuation_summary_integrity(bad_axes, None)))
    bad_sum = dict(internals, sotp_segments=[{"segment": "A", "metric": 100, "multiple": 9}])
    check("sotp re-sum != methods.sotp caught", any("re-sum" in v for v in eval_ap_valuation_summary_integrity(bad_sum, None)))
    one_anchor = dict(internals, peers_internals={"applied_multiple": 5.6, "anchors": [{"multiple": 5.6, "value": 90}]})
    check("single peers anchor caught", any("anchors" in v for v in eval_ap_valuation_summary_integrity(one_anchor, None)))
    bad_peers = dict(internals, peers_internals=dict(internals["peers_internals"], anchors=[{"multiple": 5.6, "value": 50}, {"multiple": 6.25, "value": 60}]))
    check("peers line != methods.peers caught", any("methods.peers" in v for v in eval_ap_valuation_summary_integrity(bad_peers, None)))

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
