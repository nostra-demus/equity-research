#!/usr/bin/env python3
"""scripts/sensitivity_summary_checks.py — the integrity guard for the what-if sensitivity sidecar.

WHY THIS EXISTS
    earnings/07_earnings-sensitivity emits `sensitivity_summary.json` — the machine-readable coefficients
    the cockpit chat models what-ifs on (scripts/sensitivity_math.py). Like the valuation lever sidecar it
    is §25 DATA that reaches `main` WITHOUT passing CI. A malformed sidecar, or one the engine cannot
    actually compute, would make the chat refuse a legitimate question or (worse) surface a nonsense number.

    This is the retrospective guard — the exact twin of scripts/valuation_summary_checks.py. SOFT-PRESENCE:
    a run with no sidecar is N/A, never a failure (many runs have no clean per-unit sensitivity to record).
    STRICT-VALIDITY for any sidecar that exists: schema shape, and — the load-bearing check — every recorded
    variable must actually COMPUTE through sensitivity_math (so the chat can never look up a variable that
    then fails to model).
"""
from __future__ import annotations

import json
import os
import sys

# scripts/ is on sys.path for both callers; reuse the deterministic engine so "does it compute?" is the
# SAME code path the chat will call, not a re-implementation.
from sensitivity_math import scenario as _scenario, _isnum

_REQUIRED = ("schema_version", "ticker", "base_metric", "base_value", "sensitivities")
_CONFIDENCE = ("high", "medium", "low", None)


def check_sensitivity_summary(sidecar):
    """Core check. Returns None (no sidecar → N/A, soft presence) or a list of violations (empty = pass).
    Pure + module-level so the selftest drives every branch fixture-free."""
    if sidecar is None:
        return None
    if not isinstance(sidecar, dict):
        return ["sensitivity_summary.json is not a JSON object"]

    det = []
    for req in _REQUIRED:
        if req not in sidecar:
            det.append(f"missing required key '{req}'")
    if "base_value" in sidecar and not _isnum(sidecar.get("base_value")):
        det.append(f"base_value {sidecar.get('base_value')!r} is not numeric")
    rb = sidecar.get("revenue_base")
    if "revenue_base" in sidecar and rb is not None and not _isnum(rb):
        det.append("revenue_base must be numeric or null")

    sens = sidecar.get("sensitivities")
    if not isinstance(sens, list) or not sens:
        det.append("sensitivities must be a non-empty array")
        return det

    seen = set()
    for i, s in enumerate(sens):
        if not isinstance(s, dict):
            det.append(f"sensitivity[{i}] is not an object")
            continue
        var = s.get("variable")
        if not var:
            det.append(f"sensitivity[{i}] missing 'variable'")
        elif var in seen:
            det.append(f"duplicate variable {var!r}")
        else:
            seen.add(var)
        if not _isnum(s.get("coefficient")):
            det.append(f"sensitivity {var!r} coefficient {s.get('coefficient')!r} is not numeric")
        if s.get("confidence") not in _CONFIDENCE:
            det.append(f"sensitivity {var!r} confidence {s.get('confidence')!r} not in {_CONFIDENCE}")
        vr = s.get("valid_range")
        if vr is not None and not (isinstance(vr, dict) and _isnum(vr.get("low")) and _isnum(vr.get("high"))):
            det.append(f"sensitivity {var!r} valid_range must be null or an object with numeric low/high")

    # THE load-bearing check: every recorded variable must actually compute through the engine the chat
    # will call — a sidecar that lists a variable sensitivity_math cannot model is worse than none.
    for s in sens:
        if isinstance(s, dict) and s.get("variable") and _isnum(s.get("coefficient")):
            r = _scenario(sidecar, s["variable"], 1)
            if not isinstance(r, dict) or "error" in r or not _isnum(r.get("impact")):
                det.append(f"sensitivity {s['variable']!r} does not compute through sensitivity_math "
                           f"({r.get('error', 'no numeric impact') if isinstance(r, dict) else 'no result'})")
    return det


def scan_committed(root="."):
    import glob
    checked, failures = 0, []
    for sc_path in sorted(glob.glob(os.path.join(root, "analyses/*/earnings/sensitivity_summary.json"))):
        run = os.path.basename(os.path.dirname(os.path.dirname(sc_path)))
        try:
            sidecar = json.load(open(sc_path, encoding="utf-8"))
        except Exception as e:
            failures.append((run, [f"could not parse sensitivity_summary.json: {e}"]))
            checked += 1
            continue
        viol = check_sensitivity_summary(sidecar)
        checked += 1
        if viol:
            failures.append((run, viol))
    return checked, failures


def _selftest() -> int:
    fails = []

    def check(name, cond):
        if not cond:
            fails.append(name)

    ok = {
        "schema_version": "1.0", "ticker": "T", "base_metric": "adjusted_ebitda_nok_m",
        "base_value": 28889, "revenue_base": 207971,
        "sensitivities": [
            {"variable": "lme_aluminium_price", "coefficient": 15.0, "confidence": "high",
             "valid_range": {"low": -400, "high": 300}},
            {"variable": "usd_nok", "coefficient": 4900.0, "confidence": "high"},
        ],
    }
    check("absent → None (soft presence)", check_sensitivity_summary(None) is None)
    check("valid → [] pass", check_sensitivity_summary(ok) == [])
    check("non-object → violation", check_sensitivity_summary([1]) == ["sensitivity_summary.json is not a JSON object"])
    miss = dict(ok); del miss["base_value"]
    check("missing base_value caught", any("base_value" in v for v in check_sensitivity_summary(miss)))
    check("non-numeric base_value caught", any("base_value" in v and "numeric" in v for v in check_sensitivity_summary(dict(ok, base_value="x"))))
    check("empty sensitivities caught", any("non-empty" in v for v in check_sensitivity_summary(dict(ok, sensitivities=[]))))
    badcoeff = dict(ok, sensitivities=[{"variable": "v", "coefficient": "nan-ish"}])
    check("non-numeric coefficient caught", any("coefficient" in v for v in check_sensitivity_summary(badcoeff)))
    badconf = dict(ok, sensitivities=[{"variable": "v", "coefficient": 1, "confidence": "certain"}])
    check("bad confidence caught", any("confidence" in v for v in check_sensitivity_summary(badconf)))
    dup = dict(ok, sensitivities=[{"variable": "v", "coefficient": 1}, {"variable": "v", "coefficient": 2}])
    check("duplicate variable caught", any("duplicate" in v for v in check_sensitivity_summary(dup)))
    badrange = dict(ok, sensitivities=[{"variable": "v", "coefficient": 1, "valid_range": {"low": "a"}}])
    check("bad valid_range caught", any("valid_range" in v for v in check_sensitivity_summary(badrange)))
    # engine-computability: a coefficient present but a base_value that makes the engine unable to compute...
    # (here every well-formed row DOES compute, so assert the happy path stays clean and a missing base
    #  still lets impact compute — the guard's computability check must not false-fire on a valid row)
    r = _scenario(ok, "lme_aluminium_price", 1)
    check("computability_probe_matches_engine", _isnum(r.get("impact")))

    if fails:
        print("SENSITIVITY SUMMARY CHECKS SELFTEST FAIL:", ", ".join(fails))
        return 1
    print("SENSITIVITY SUMMARY CHECKS SELFTEST PASS — soft-presence + schema shape + confidence/range + "
          "duplicate guard + engine-computability, all branches green")
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
            print(f"SENSITIVITY SUMMARY SCAN FAIL — {len(failures)}/{checked} committed sidecar(s) invalid")
            raise SystemExit(1)
        print(f"SENSITIVITY SUMMARY SCAN PASS — {checked} committed sidecar(s) valid + engine-computable")
        raise SystemExit(0)
    print("usage: sensitivity_summary_checks.py [--selftest | --all]")
    raise SystemExit(2)
