#!/usr/bin/env python3
"""scripts/sensitivity_math.py — deterministic what-if / sensitivity math for the research chat.

WHY THIS EXISTS
    The cockpit chat should answer "what's Adjusted EBITDA / operating margin if the aluminium price
    moves +$45/mt?" — but a language model must NEVER do that arithmetic itself (CLAUDE.md §20 "bad
    math"; §3 no-source-no-claim). The engine's own sensitivity orb (earnings/07_earnings-sensitivity.md)
    has ALREADY extracted the company-disclosed per-unit coefficient (e.g. NOK 150m Adjusted EBITDA per
    +USD 10/mt), the base level, the confidence, the valid scenario range, and the non-linearity caveats.

    This module makes the WHAT-IF deterministic and PURE, the exact mirror of scripts/valuation_math.py:
    given the recorded coefficient (a `sensitivity_summary.json` sidecar) and a user delta, it computes the
    new level by LINEAR application of the orb's own coefficient — no re-derivation, no model arithmetic.
    The result carries the orb's confidence, source, and range/non-linearity flags forward verbatim, so the
    answer is exactly as reliable as the disclosed figure it scales, and no more.

    HONEST SCOPE: it scales a recorded coefficient linearly and flags when a move leaves the disclosed
    range or where the orb noted a non-linearity. It does NOT invent a coefficient, pick which variable you
    meant, or judge the thesis. An unknown variable is refused, never fabricated.
"""
from __future__ import annotations

import math
from typing import Optional


def _isnum(v) -> bool:
    # bool is a subclass of int; NaN/inf are floats — reject both, or a malformed sidecar (JSON allows NaN)
    # would produce a nan impact/new_value that the guard would still report as "valid".
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def _num(v, default=None):
    return float(v) if _isnum(v) else default


def _find(sensitivities: list, variable: str) -> Optional[dict]:
    """Match a variable by its `variable` key OR its human `label` (case-insensitive), so the caller can
    pass either the machine key ('lme_aluminium_price') or the label ('LME aluminium price').

    None-safe (a null label never becomes the string "None"), and it REFUSES an ambiguous request: if two
    entries match the key (duplicate variable, or a label colliding with another variable), it returns None
    rather than silently picking the first by array order — the answer must not depend on ordering."""
    key = str(variable or "").strip().lower()
    if not key:
        return None
    matches = [
        s for s in sensitivities
        if isinstance(s, dict)
        and ((s.get("variable") and str(s.get("variable")).strip().lower() == key)
             or (s.get("label") and str(s.get("label")).strip().lower() == key))
    ]
    return matches[0] if len(matches) == 1 else None


def scenario(sidecar: dict, variable: str, delta) -> dict:
    """Apply a `delta` (in the variable's own unit) to one recorded sensitivity, LINEARLY, from the sidecar.

    Returns a dict with the deterministic result, or {"error": ...} if the variable is unknown or the
    inputs are unusable (never a fabricated number). Fields:
      variable, label, unit, delta, coefficient, impact_metric,
      impact            = delta * coefficient  (the change in the base metric, e.g. NOK m Adj. EBITDA)
      base_value, new_value
      base_margin_pct, new_margin_pct, margin_change_bps   (only when a revenue base is recorded)
      within_disclosed_range (bool|None), non_linearity, confidence, basis, source
    """
    if not isinstance(sidecar, dict):
        return {"error": "sensitivity_summary is not an object"}
    sens = sidecar.get("sensitivities")
    if not isinstance(sens, list) or not sens:
        return {"error": "no sensitivities recorded for this run"}
    s = _find(sens, variable)
    if s is None:
        have = ", ".join(sorted(str(x.get("variable")) for x in sens if isinstance(x, dict) and x.get("variable")))
        return {"error": f"no recorded sensitivity for {variable!r} — recorded variables: {have}"}

    coeff = _num(s.get("coefficient"))
    d = _num(delta)
    base = _num(sidecar.get("base_value"))
    if coeff is None or d is None:
        return {"error": f"non-numeric coefficient ({s.get('coefficient')!r}) or delta ({delta!r})"}

    impact = round(d * coeff, 4)  # change in the base metric (deterministic: delta × recorded coefficient)

    # Which metric does this coefficient actually move? The schema lets a row carry its own impact_metric.
    # If it differs from the sidecar's base metric, `impact` is in a DIFFERENT metric — adding it to base_value
    # (an adjusted-EBITDA level, say) would fabricate a level, so we report the impact but withhold the level
    # and margin rather than compute a wrong number.
    base_metric = sidecar.get("base_metric")
    row_metric = s.get("impact_metric") or base_metric
    same_metric = row_metric == base_metric

    out = {
        "variable": s.get("variable"),
        "label": s.get("label"),
        "unit": s.get("unit"),
        "delta": d,
        "coefficient": coeff,
        "impact_metric": row_metric,
        "impact": impact,
        "base_value": base if same_metric else None,
        "new_value": round(base + impact, 4) if (base is not None and same_metric) else None,
        "confidence": s.get("confidence"),
        "basis": s.get("basis"),
        "source": s.get("source"),
        "non_linearity": s.get("non_linearity"),
    }
    if not same_metric:
        out["metric_note"] = (f"coefficient is on {row_metric}, not the sidecar base metric {base_metric} — "
                              f"the base level and margin are not applied")

    # Margin scenario — ONLY for a profit-level base metric (EBITDA/EBIT/operating profit) with a revenue
    # denominator, and only when the coefficient is on that same metric. A per-share metric (EPS) over revenue
    # is nonsensical, so it is skipped. IMPORTANT basis: we hold revenue CONSTANT (the sidecar records a
    # revenue base, not a revenue sensitivity), so this is the margin implied by the profit move at unchanged
    # revenue — flagged `margin_basis: revenue_constant` and never presented as a fully-modeled margin.
    rev = _num(sidecar.get("revenue_base"))
    bm = str(base_metric or "").lower()
    is_profit_metric = any(k in bm for k in ("ebitda", "ebit", "operating", "profit", "income"))
    per_share = any(k in bm for k in ("eps", "per_share", "per-share"))
    if rev and rev > 0 and base is not None and same_metric and is_profit_metric and not per_share:
        base_margin = base / rev * 100.0
        new_margin = (base + impact) / rev * 100.0
        out["base_margin_pct"] = round(base_margin, 3)
        out["new_margin_pct"] = round(new_margin, 3)
        out["margin_change_bps"] = round((new_margin - base_margin) * 100.0, 1)
        out["margin_basis"] = "revenue_constant"

    # Range flag — a linear scale is only trustworthy within the orb's disclosed band. A ONE-SIDED band
    # (only low, or only high) is still enforced on the side it discloses; None means no band was recorded.
    vr = s.get("valid_range") if isinstance(s.get("valid_range"), dict) else None
    lo = _num(vr.get("low")) if vr else None
    hi = _num(vr.get("high")) if vr else None
    if lo is not None or hi is not None:
        outside = (lo is not None and d < lo) or (hi is not None and d > hi)
        out["within_disclosed_range"] = not outside
        if outside:
            band = f"[{lo if lo is not None else '−inf'}, {hi if hi is not None else '+inf'}]"
            out["range_note"] = (f"delta {d} is outside the orb's disclosed scenario range {band} — "
                                 f"the linear coefficient is not validated this far from base")
    else:
        out["within_disclosed_range"] = None
    return out


def list_variables(sidecar: dict) -> list:
    """The variables a run CAN be asked about (so the chat/UI never offers one that isn't recorded)."""
    if not isinstance(sidecar, dict) or not isinstance(sidecar.get("sensitivities"), list):
        return []
    return [{"variable": s.get("variable"), "label": s.get("label"), "unit": s.get("unit"),
             "confidence": s.get("confidence")} for s in sidecar["sensitivities"] if isinstance(s, dict)]


# ---------------------------------------------------------------------------
# selftest — fixture-free CI gate, grounded in NHY_2026-07-19's real recorded coefficients
# ---------------------------------------------------------------------------
def _approx(a, b, tol=0.05) -> bool:
    return a is not None and b is not None and abs(a - b) <= tol


def _selftest() -> int:
    fails = []

    def check(name, cond):
        if not cond:
            fails.append(name)

    # NHY_2026-07-19 earnings/07_earnings-sensitivity.md, verbatim coefficients:
    #   LME aluminium: +NOK 150m Adj. EBITDA per +USD 10/mt  → 15 NOK m per USD 1/mt (High, disclosed)
    #   USD/NOK:       NOK 4,900m per NOK 1.00 move          (High, disclosed)
    #   base FY2025 Adjusted EBITDA = NOK 28,889m; revenue base ≈ NOK 207,226m (12.4% reported → adj ~13.9%)
    nhy = {
        "ticker": "NHY", "currency": "NOK", "base_metric": "adjusted_ebitda_nok_m",
        "base_value": 28889, "base_period": "FY2025", "revenue_base": 207226,
        "sensitivities": [
            {"variable": "lme_aluminium_price", "label": "LME aluminium price", "unit": "USD/mt",
             "coefficient": 15.0, "confidence": "high", "basis": "company-disclosed",
             "valid_range": {"low": -400, "high": 300}, "source": "FY2025 Annual Report, p.38",
             "non_linearity": "1.5-2mo pricing lag; may not hold far from base"},
            {"variable": "usd_nok", "label": "USD/NOK exchange rate", "unit": "NOK",
             "coefficient": 4900.0, "confidence": "high", "basis": "company-disclosed",
             "valid_range": {"low": -1, "high": 1}, "source": "FY2025 Annual Report, p.38"},
        ],
    }

    # 1. THE headline case: aluminium +$45/mt → +NOK 675m Adj. EBITDA (45 × 15), deterministic
    r = scenario(nhy, "lme_aluminium_price", 45)
    check("alu+45_impact=675", _approx(r["impact"], 675))
    check("alu+45_new=29564", _approx(r["new_value"], 29564))
    check("alu+45_in_range", r["within_disclosed_range"] is True)
    check("alu+45_confidence_high", r["confidence"] == "high")
    check("alu+45_source_carried", "p.38" in (r["source"] or ""))
    # margin: 28889/207226 = 13.940% ; 29564/207226 = 14.266% ; +32.6 bps
    check("alu+45_base_margin≈13.94", _approx(r["base_margin_pct"], 13.94, 0.02))
    check("alu+45_new_margin≈14.27", _approx(r["new_margin_pct"], 14.27, 0.02))
    check("alu+45_margin_bps≈32.6", _approx(r["margin_change_bps"], 32.6, 0.5))

    # 2. match by human label, negative delta, USD/NOK
    check("fx_by_label_-1=-4900", _approx(scenario(nhy, "USD/NOK exchange rate", -1)["impact"], -4900))

    # 3. out-of-disclosed-range is FLAGGED (a +$5000 move is far beyond the +300 band), still computes
    big = scenario(nhy, "lme_aluminium_price", 5000)
    check("alu+5000_flagged_out_of_range", big["within_disclosed_range"] is False and "range_note" in big)
    check("alu+5000_still_deterministic", _approx(big["impact"], 75000))

    # 4. unknown variable → REFUSED, never fabricated
    unk = scenario(nhy, "gold_price", 10)
    check("unknown_var_refused", "error" in unk and "no recorded sensitivity" in unk["error"])
    check("unknown_var_lists_options", "lme_aluminium_price" in unk["error"])

    # 5. defensive: malformed inputs never throw
    check("nonobject_safe", "error" in scenario(None, "x", 1))
    check("nosens_safe", "error" in scenario({"base_value": 1}, "x", 1))
    check("nonnumeric_delta_safe", "error" in scenario(nhy, "usd_nok", "abc"))

    # 6. no revenue base → margin fields are Not assessable (absent), impact still computed
    norev = dict(nhy); norev.pop("revenue_base")
    r2 = scenario(norev, "lme_aluminium_price", 45)
    check("norev_impact_ok", _approx(r2["impact"], 675))
    check("norev_no_margin", "margin_change_bps" not in r2)

    # 7. non-finite inputs are rejected, never returned as nan (JSON allows NaN/Infinity)
    check("nan_coeff_refused", "error" in scenario(dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], coefficient=float("nan"))]), "lme_aluminium_price", 45))
    check("inf_delta_refused", "error" in scenario(nhy, "lme_aluminium_price", float("inf")))

    # 8. an EPS-style base metric gets NO margin (EPS ÷ revenue is nonsensical); the impact still computes
    eps = dict(nhy, base_metric="diluted_eps_nok", base_value=10.0)
    r3 = scenario(eps, "lme_aluminium_price", 45)
    check("eps_impact_ok", _approx(r3["impact"], 675))
    check("eps_no_margin", "margin_change_bps" not in r3)

    # 9. a coefficient on a DIFFERENT metric than the base: impact reported, but level/margin withheld
    diff = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], impact_metric="revenue_nok_m")])
    r4 = scenario(diff, "lme_aluminium_price", 45)
    check("diff_metric_impact_ok", _approx(r4["impact"], 675))
    check("diff_metric_no_newvalue", r4.get("new_value") is None and "margin_change_bps" not in r4)

    # 10. a ONE-SIDED disclosed band is enforced on the side it discloses
    onelow = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], valid_range={"low": -400})])
    check("onesided_within", scenario(onelow, "lme_aluminium_price", 50)["within_disclosed_range"] is True)
    check("onesided_below_flagged", scenario(onelow, "lme_aluminium_price", -500)["within_disclosed_range"] is False)

    # 11. duplicate variable → refuse (answer must not depend on array order)
    dup = dict(nhy, sensitivities=[nhy["sensitivities"][0], dict(nhy["sensitivities"][0], coefficient=99.0)])
    check("duplicate_refused", "error" in scenario(dup, "lme_aluminium_price", 45))

    if fails:
        print("SENSITIVITY MATH SELFTEST FAIL:", ", ".join(fails))
        return 1
    print("SENSITIVITY MATH SELFTEST PASS — NHY aluminium +$45/mt = +NOK 675m Adj. EBITDA (+32.6bps), "
          "recorded coefficient scaled linearly; range/confidence/source carried; unknown-variable refused")
    return 0


if __name__ == "__main__":
    import sys
    if "--selftest" in sys.argv:
        raise SystemExit(_selftest())
    print("usage: sensitivity_math.py --selftest")
    raise SystemExit(2)
