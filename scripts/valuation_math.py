#!/usr/bin/env python3
"""
scripts/valuation_math.py — deterministic valuation & scenario math for the research swarm.

WHY THIS EXISTS
    Today every valuation number is produced INSIDE the ephemeral LLM valuation agents and
    frozen as markdown prose (the bull/base/bear blend, the WACC, the segment multiples) and
    as scenario OUTPUTS in decision_record.json (price_target / return_pct). Nothing can
    recompute a fair value or a scenario return from its INPUTS — so a moved price, a corrected
    WACC, or a "what if the bull multiple expands?" question forces a full agent re-run, and the
    frozen returns silently go stale (the AMZN defect: returns pinned to a $238.34 anchor the
    stock had already left).

    This module makes the valuation math COMPUTED, PURE, and RE-DERIVABLE — the mirror of
    scripts/confidence.py (deterministic confidence) and scripts/screener_score_breakdown.py
    (deterministic materiality). The JUDGMENT stays in the recorded LEVERS (per-scenario forward
    metric + multiple, WACC components, shares, net debt, price); only the COMBINATION is
    deterministic here, so it can be:
      - recomputed live by the valuation Playground when a lever moves (no agent re-run),
      - re-anchored to a fresh price in one call (fixes the stale-anchor failure), and
      - shared as the single source of the scenario identities the eval harness checks.

DOCTRINE ENCODED
    CLAUDE.md §10 (scenario math must reconcile: Expected Return = Σ p×return, prob-weighted
    target ties back), §15/§16 (net-debt basis; bear/base/bull LEVELS; margin of safety vs
    downside-to-bear are TWO separate metrics), and the valuation MODULE_RULES additions from
    Phase 1: WACC must satisfy after-tax k_d ≤ WACC < k_e (Gate 4); bull/base/bear are each
    (forward metric × multiple) with bull multiple ≥ base ≥ bear (Scenario Construction Policy);
    the fair-value LEVELS are price-independent so re-anchoring is a one-line recompute (Price
    freshness rule).

    HONEST SCOPE: this computes and reconciles the identities. It does NOT assign scenario
    probabilities, pick the multiples, or decide the verdict — those are the analyst's / master
    synthesizer's judgments, recorded as the levers this module consumes.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# helpers (same idioms as scripts/confidence.py)
# ---------------------------------------------------------------------------
def _isnum(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _num(v, default=None):
    return float(v) if _isnum(v) else default


def _pct(x: float, ndigits: int = 1) -> float:
    return round(x * 100.0, ndigits)


# ---------------------------------------------------------------------------
# 1. Fair-value LEVEL from a (forward metric × multiple) lever
# ---------------------------------------------------------------------------
def level_from_multiple(metric: float, multiple: float, basis: str = "equity",
                        shares: Optional[float] = None, net_debt: float = 0.0) -> float:
    """One scenario's per-share fair-value LEVEL from its forward metric and multiple.

    basis = "equity"  → an equity multiple on a per-share metric (P/E on EPS, P/FCF on FCF/sh):
                        level = metric × multiple. `shares`/`net_debt` are not used.
    basis = "ev"      → an EV multiple on a total metric (EV/EBITDA on EBITDA, EV/EBIT on EBIT):
                        EV = metric × multiple; equity = EV − net_debt; level = equity / shares.
                        `net_debt` is the canonical net-debt anchor (positive = debt, negative =
                        net cash — subtracted, so net cash ADDS to equity via the minus sign).
    """
    if not (_isnum(metric) and _isnum(multiple)):
        raise ValueError(f"metric and multiple must be numeric, got {metric!r}, {multiple!r}")
    b = (basis or "equity").strip().lower()
    if b == "equity":
        return float(metric) * float(multiple)
    if b == "ev":
        if not (_isnum(shares) and shares > 0):
            raise ValueError("basis='ev' requires positive `shares` for the per-share bridge")
        # An EV multiple gives enterprise value; the equity bridge REQUIRES net debt. Defaulting an unknown
        # net debt to 0 would silently value the firm as debt-free and overstate every level (§15) — so an
        # absent net debt makes the EV level Not assessable (raise; the caller renders it as unavailable).
        if not _isnum(net_debt):
            raise ValueError("basis='ev' requires a numeric `net_debt` for the equity bridge")
        ev = float(metric) * float(multiple)
        equity = ev - float(net_debt)
        return equity / float(shares)
    raise ValueError(f"unknown basis {basis!r} — use 'equity' or 'ev'")


def blend(methods: dict, weights: dict) -> dict:
    """Weighted base-case point across the value-producing methods (the 07 football-field blend,
    e.g. 0.35·own_history + 0.25·peers + 0.40·dcf). Ignores methods whose value is None/non-numeric
    and RENORMALIZES the weights over the methods actually present, so a dropped method cannot
    silently zero-weight the blend. Returns the point plus the effective weights used."""
    if not isinstance(methods, dict) or not isinstance(weights, dict):
        return {"base_point": None, "effective_weights": {}, "note": "methods and weights must both be dicts"}
    used = {k: float(v) for k, v in methods.items() if _isnum(v) and _isnum(weights.get(k))}
    wsum = sum(weights[k] for k in used)
    if not used or wsum <= 0:
        return {"base_point": None, "effective_weights": {}, "note": "no value-producing method with a weight"}
    eff = {k: weights[k] / wsum for k in used}
    point = sum(used[k] * eff[k] for k in used)
    return {"base_point": round(point, 4), "effective_weights": {k: round(w, 4) for k, w in eff.items()}}


# ---------------------------------------------------------------------------
# 2. Scenario math — the CLAUDE.md §10 identities, computed not eyeballed
# ---------------------------------------------------------------------------
def _find(scenarios, name):
    for s in scenarios:
        if name in str(s.get("label", "")).strip().lower():
            return s
    return None


def scenario_math(scenarios: list, price: Optional[float]) -> dict:
    """Recompute the scenario identities from bull/base/bear LEVELS and probabilities.

    scenarios : list of {"label", "probability" (0-100), "price_target" (the fair-value LEVEL)}.
    price     : current price. If None/non-numeric, the LEVELS and the probability-weighted
                target are still returned, but every price-relative read is "Not assessable"
                (the no-price cap — CLAUDE.md §16 / MODULE_RULES).

    Returns (all price-relative fields None when price is absent):
      prob_weighted_target, expected_return_pct, margin_of_safety_pct (base),
      downside_to_bear_pct (inverted: higher = worse), downside_risk_pct (= −min scenario return,
      the synthesizer field), risk_reward, per_scenario[{label, probability, price_target,
      return_pct}], and warnings (probabilities not summing to 100; no bear below price; etc.).
    """
    warnings: list = []
    if not isinstance(scenarios, list):
        scenarios = []
        warnings.append("scenarios must be a list — treated as empty")
    clean = [s for s in scenarios
             if isinstance(s, dict) and _isnum(s.get("probability")) and _isnum(s.get("price_target"))]
    psum = sum(float(s["probability"]) for s in clean)
    if clean and abs(psum - 100.0) > 0.5:
        warnings.append(f"scenario probabilities sum to {round(psum, 2)}, not 100 (§10)")

    prob_weighted_target = (sum(float(s["price_target"]) * float(s["probability"]) / 100.0 for s in clean)
                            if clean else None)

    base = _find(clean, "base")
    bear = _find(clean, "bear")

    per = []
    have_price = _isnum(price) and price > 0
    for s in clean:
        r = _pct((float(s["price_target"]) - float(price)) / float(price)) if have_price else None
        per.append({"label": s.get("label"), "probability": float(s["probability"]),
                    "price_target": float(s["price_target"]), "return_pct": r})

    out = {
        "prob_weighted_target": round(prob_weighted_target, 4) if prob_weighted_target is not None else None,
        "levels": {(s.get("label") or "").strip().lower(): float(s["price_target"]) for s in clean},
        "per_scenario": per,
        "price": float(price) if have_price else None,
        "price_relative_assessable": bool(have_price),
        "warnings": warnings,
    }

    if not have_price:
        for k in ("expected_return_pct", "margin_of_safety_pct", "downside_to_bear_pct",
                  "downside_risk_pct", "risk_reward"):
            out[k] = None
        out["note"] = "no pool-verified price — price-relative reads Not assessable (§16)"
        return out

    p = float(price)
    out["expected_return_pct"] = (_pct((prob_weighted_target - p) / p)
                                  if prob_weighted_target is not None else None)
    out["margin_of_safety_pct"] = (_pct((float(base["price_target"]) - p) / float(base["price_target"]))
                                   if base else None)
    if bear:
        out["downside_to_bear_pct"] = _pct((p - float(bear["price_target"])) / p)   # inverted: higher = worse
    else:
        out["downside_to_bear_pct"] = None
        warnings.append("no bear scenario found — downside-to-bear Not assessable")
    rets = [x["return_pct"] for x in per if x["return_pct"] is not None]
    out["downside_risk_pct"] = round(-min(rets), 1) if rets else None    # synthesizer field: −min scenario return
    if bear and prob_weighted_target is not None:
        denom = p - float(bear["price_target"])
        out["risk_reward"] = round((prob_weighted_target - p) / denom, 2) if abs(denom) > 1e-9 else None
    else:
        out["risk_reward"] = None
    if bear and float(bear["price_target"]) >= p:
        warnings.append(f"bear price_target {bear['price_target']} is not below price {p} — no genuine "
                        f"downside branch for a long (§8/§16)")
    return out


def reanchor(scenarios: list, new_price: float) -> dict:
    """Re-derive every price-relative read at a fresh price WITHOUT re-running any agent.
    The fair-value LEVELS are price-independent, so this is just scenario_math at the new price —
    the one-line recompute the Price-freshness rule and the Playground both call."""
    return scenario_math(scenarios, new_price)


# ---------------------------------------------------------------------------
# 3. Lever-set recompute — the function the Playground / server call
# ---------------------------------------------------------------------------
@dataclass
class ScenarioLever:
    label: str                                  # "bull" / "base" / "bear"
    probability: float                          # 0-100
    forward_metric: Optional[float] = None      # EPS (basis=equity) or EBITDA/EBIT total (basis=ev)
    multiple: Optional[float] = None
    level_override: Optional[float] = None       # if set, used as the level instead of metric×multiple


@dataclass
class ValuationLevers:
    """Everything the valuation synthesis must RECORD (as valuation_summary.json) so the fair value
    is re-derivable and the Playground has levers to move."""
    scenarios: list                              # list[ScenarioLever]
    basis: str = "equity"                        # "equity" (EPS×PE) or "ev" ((EBITDA×mult − net_debt)/shares)
    shares: Optional[float] = None
    net_debt: float = 0.0                        # canonical basis; positive = debt, negative = net cash
    current_price: Optional[float] = None
    price_as_of: Optional[str] = None
    # discount-rate sanity inputs (optional — enable the Gate-4 WACC guard)
    rf: Optional[float] = None
    erp: Optional[float] = None
    beta: Optional[float] = None
    wacc: Optional[float] = None
    after_tax_kd: Optional[float] = None
    is_developed_mega_cap: bool = False
    # cross-method football field (display + weighting transparency)
    methods: dict = field(default_factory=dict)
    method_weights: dict = field(default_factory=dict)


def capm_cost_of_equity(rf, beta, erp) -> Optional[float]:
    if not (_isnum(rf) and _isnum(beta) and _isnum(erp)):
        return None
    return float(rf) + float(beta) * float(erp)


def check_wacc(after_tax_kd, wacc, ke, rf=None, erp=None, is_mega_cap: bool = False) -> dict:
    """Gate 4: a WACC is a weighted average of after-tax cost of debt and cost of equity, so it
    must satisfy `after-tax k_d ≤ WACC < k_e`. A WACC at/above k_e is an assembly error. For a
    developed-market mega-cap, k_e above rf + 1.4·ERP (≈ β > 1.4) needs cited justification."""
    problems: list = []
    # A WACC can never EXCEED k_e. It may EQUAL k_e only for a debt-free firm (no debt weight); for a
    # levered firm (a positive after-tax cost of debt is supplied) WACC must be strictly below k_e. Flag
    # wacc > k_e always, but flag equality only when debt is present — otherwise a valid all-equity firm's
    # WACC == k_e is wrongly reported as an assembly error.
    if _isnum(wacc) and _isnum(ke):
        if wacc > ke + 1e-9:
            problems.append(f"WACC {round(wacc,4)} > cost of equity {round(ke,4)} — a WACC cannot exceed "
                            f"k_e (assembly error, fix the blend)")
        elif abs(wacc - ke) <= 1e-9 and _isnum(after_tax_kd):
            problems.append(f"WACC {round(wacc,4)} = cost of equity {round(ke,4)} but a positive after-tax "
                            f"cost of debt is given — a levered firm's WACC must be below k_e (assembly error)")
    if _isnum(after_tax_kd) and _isnum(wacc) and wacc < after_tax_kd:
        problems.append(f"WACC {round(wacc,4)} < after-tax cost of debt {round(after_tax_kd,4)} — below the band")
    if is_mega_cap and _isnum(ke) and _isnum(rf) and _isnum(erp):
        ceiling = float(rf) + 1.4 * float(erp)
        if ke > ceiling:
            problems.append(f"cost of equity {round(ke,4)} > developed-market mega-cap ceiling "
                            f"rf+1.4·ERP={round(ceiling,4)} (≈ β>1.4) — needs a cited beta/justification")
    return {"ok": not problems, "cost_of_equity": round(ke, 4) if _isnum(ke) else None, "problems": problems}


def check_multiple_symmetry(bull_mult, base_mult, bear_mult) -> dict:
    """Scenario Construction Policy §2: bull multiple ≥ base ≥ bear (expansion in bull, compression
    in bear). Also flags a bull that does NOT expand the multiple (the 'not a bull case' defect)."""
    problems: list = []
    if _isnum(bull_mult) and _isnum(base_mult) and bull_mult < base_mult:
        problems.append(f"bull multiple {bull_mult} < base multiple {base_mult} — bull must EXPAND the multiple")
    if _isnum(bear_mult) and _isnum(base_mult) and bear_mult > base_mult:
        problems.append(f"bear multiple {bear_mult} > base multiple {base_mult} — bear must COMPRESS the multiple")
    bull_expands = _isnum(bull_mult) and _isnum(base_mult) and bull_mult > base_mult
    if _isnum(bull_mult) and _isnum(base_mult) and bull_mult == base_mult:
        problems.append(f"bull multiple equals base multiple ({bull_mult}) — a bull that lifts the metric but "
                        f"holds the multiple is not a bull case unless a cited reason blocks expansion (§2)")
    return {"ok": not problems, "bull_expands": bull_expands, "problems": problems}


def recompute(levers: ValuationLevers) -> dict:
    """Top-level: levers → fair-value levels → scenario math → sanity checks. The one call the
    /api/valuation-levers recompute endpoint and the Playground client mirror both target."""
    scen_out = []
    for s in levers.scenarios:
        if _isnum(s.level_override):
            level = float(s.level_override)
        elif _isnum(s.forward_metric) and _isnum(s.multiple):
            try:
                level = level_from_multiple(s.forward_metric, s.multiple, levers.basis,
                                            levers.shares, levers.net_debt)
            except ValueError:
                level = None  # EV basis without net debt / positive shares → level Not assessable (§15)
        else:
            level = None
        scen_out.append({"label": s.label, "probability": s.probability,
                         "price_target": round(level, 4) if level is not None else None,
                         "forward_metric": s.forward_metric, "multiple": s.multiple})

    math = scenario_math(scen_out, levers.current_price)

    ke = capm_cost_of_equity(levers.rf, levers.beta, levers.erp)
    checks = {}
    if any(_isnum(x) for x in (levers.wacc, ke, levers.after_tax_kd)):
        checks["wacc"] = check_wacc(levers.after_tax_kd, levers.wacc, ke, levers.rf, levers.erp,
                                    levers.is_developed_mega_cap)
    mults = {(s.label or "").strip().lower(): s.multiple for s in levers.scenarios}
    if any(_isnum(mults.get(k)) for k in ("bull", "base", "bear")):
        checks["multiple_symmetry"] = check_multiple_symmetry(mults.get("bull"), mults.get("base"),
                                                              mults.get("bear"))

    warnings = list(math.get("warnings", []))
    for c in checks.values():
        warnings.extend(c.get("problems", []))

    return {
        "scenarios": scen_out,
        "scenario_math": math,
        "checks": checks,
        "basis": levers.basis,
        "price": levers.current_price,
        "price_as_of": levers.price_as_of,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# selftest — fixture-free CI gate (mirrors scripts/market_prices.py --selftest)
# ---------------------------------------------------------------------------
def _approx(a, b, tol=0.15) -> bool:
    return a is not None and b is not None and abs(a - b) <= tol


def _selftest() -> int:
    fails = []

    def check(name, cond):
        if not cond:
            fails.append(name)

    # --- 1. AMZN committed decision_record reproduced exactly (analyses/AMZN_2026-07-10) ---
    amzn = [{"label": "bull", "probability": 25, "price_target": 247.0},
            {"label": "base", "probability": 45, "price_target": 210.0},
            {"label": "bear", "probability": 30, "price_target": 146.0}]
    m = scenario_math(amzn, 238.34)
    check("amzn_expected_return≈-16.1", _approx(m["expected_return_pct"], -16.1))
    check("amzn_mos≈-13.5", _approx(m["margin_of_safety_pct"], -13.5))
    check("amzn_downside_risk≈38.7", _approx(m["downside_risk_pct"], 38.7))
    check("amzn_downside_to_bear≈38.7", _approx(m["downside_to_bear_pct"], 38.7))
    check("amzn_risk_reward≈-0.41", _approx(m["risk_reward"], -0.41, tol=0.02))
    check("amzn_pwt≈200.05", _approx(m["prob_weighted_target"], 200.05, tol=0.1))

    # --- 2. re-anchor to the live price (~$247.23) with the SAME levels ---
    r = reanchor(amzn, 247.23)
    check("reanchor_expected≈-19.1", _approx(r["expected_return_pct"], -19.1, tol=0.2))
    bull_ret = next(x["return_pct"] for x in r["per_scenario"] if x["label"] == "bull")
    check("reanchor_bull≈0", _approx(bull_ret, -0.1, tol=0.2))
    check("levels_price_independent", m["levels"] == r["levels"])

    # --- 3. no price → price-relative Not assessable, levels still returned ---
    n = scenario_math(amzn, None)
    check("noprice_expected_none", n["expected_return_pct"] is None)
    check("noprice_pwt_present", _approx(n["prob_weighted_target"], 200.05, tol=0.1))

    # --- 4. level_from_multiple both bases ---
    check("equity_basis", _approx(level_from_multiple(6.0, 35.0, "equity"), 210.0, tol=1e-6))
    # EV basis: EBITDA 100 × 12 = 1200 EV − 200 net debt = 1000 equity / 10 sh = 100
    check("ev_basis", _approx(level_from_multiple(100.0, 12.0, "ev", shares=10.0, net_debt=200.0), 100.0, tol=1e-6))
    # net cash (negative net_debt) ADDS: EV 1000 − (−50) = 1050 / 10 = 105
    check("ev_netcash", _approx(level_from_multiple(100.0, 10.0, "ev", shares=10.0, net_debt=-50.0), 105.0, tol=1e-6))

    # --- 5. blend renormalizes over present methods ---
    b = blend({"own_history": 258, "peers": 207, "dcf": 170}, {"own_history": 0.35, "peers": 0.25, "dcf": 0.40})
    check("blend≈210.05", _approx(b["base_point"], 210.05, tol=0.1))
    b2 = blend({"own_history": 258, "peers": None, "dcf": 170}, {"own_history": 0.35, "peers": 0.25, "dcf": 0.40})
    check("blend_renorm", _approx(b2["base_point"], (258 * 0.35 + 170 * 0.40) / 0.75, tol=0.1))

    # --- 6. WACC Gate 4: AMZN 10.4% vs CAPM k_e ≈ 9.76% is an assembly error; a 9% WACC is fine ---
    ke = capm_cost_of_equity(0.042, 1.25, 0.0445)          # ≈ 0.0976
    bad = check_wacc(0.03, 0.104, ke, 0.042, 0.0445, is_mega_cap=True)
    check("wacc_amzn_flagged", not bad["ok"])
    good = check_wacc(0.03, 0.090, ke, 0.042, 0.0445, is_mega_cap=True)
    check("wacc_9pct_ok", good["ok"])
    mega_hi = check_wacc(0.03, 0.11, capm_cost_of_equity(0.042, 1.6, 0.0445), 0.042, 0.0445, is_mega_cap=True)
    check("wacc_megacap_beta_flagged", not mega_hi["ok"])

    # --- 7. multiple symmetry ---
    check("mult_ordered_ok", check_multiple_symmetry(25, 20, 15)["ok"])
    check("mult_bull_noexpand_flagged", not check_multiple_symmetry(20, 20, 15)["ok"])
    check("mult_bear_expand_flagged", not check_multiple_symmetry(25, 20, 22)["ok"])

    # --- 8. recompute() end-to-end from levers (equity basis, AMZN-shaped) ---
    lev = ValuationLevers(
        scenarios=[ScenarioLever("bull", 25, forward_metric=8.5, multiple=29.06),
                   ScenarioLever("base", 45, forward_metric=8.4, multiple=25.0),
                   ScenarioLever("bear", 30, forward_metric=7.3, multiple=20.0)],
        basis="equity", current_price=247.23, rf=0.042, beta=1.25, erp=0.0445,
        wacc=0.104, after_tax_kd=0.03, is_developed_mega_cap=True)
    rc = recompute(lev)
    check("recompute_has_math", rc["scenario_math"]["expected_return_pct"] is not None)
    check("recompute_flags_wacc", not rc["checks"]["wacc"]["ok"])                 # wacc 0.104 ≥ k_e → assembly error
    check("recompute_mult_ok", rc["checks"]["multiple_symmetry"]["ok"])            # 29.06 > 25 > 20 is valid expansion/compression
    check("recompute_wacc_in_warnings", any("WACC" in w for w in rc["warnings"]))

    # --- 9. reviewer-flagged edge cases (pinned to §15 EV bridge + §16 WACC band) ---
    # all-equity firm: WACC == k_e is correct (no debt weight) — must NOT be flagged (was, under wacc>=ke)
    check("wacc_alleq_eq_ok", check_wacc(None, 0.09, 0.09)["ok"])
    # levered firm (a positive after-tax k_d supplied): WACC == k_e IS an assembly error
    check("wacc_levered_eq_flagged", not check_wacc(0.03, 0.09, 0.09)["ok"])
    # EV basis without net debt: equity bridge is Not assessable — must raise (never silently treat as 0)
    ev_raised = False
    try:
        level_from_multiple(100.0, 12.0, "ev", shares=10.0, net_debt=None)
    except ValueError:
        ev_raised = True
    check("ev_no_netdebt_raises", ev_raised)
    # …and recompute surfaces that as a None level rather than crashing
    lev_ev = ValuationLevers(scenarios=[ScenarioLever("base", 100, forward_metric=100.0, multiple=12.0)],
                             basis="ev", shares=10.0, net_debt=None, current_price=90.0)
    check("recompute_ev_no_netdebt_none_level", recompute(lev_ev)["scenarios"][0]["price_target"] is None)
    # defensive: malformed inputs return a clean result instead of throwing
    check("blend_nondict_safe", blend(None, {})["base_point"] is None)
    check("scenario_math_nonlist_safe", scenario_math(None, 100.0)["prob_weighted_target"] is None)

    if fails:
        print("VALUATION MATH SELFTEST FAIL:", ", ".join(fails))
        return 1
    print(f"VALUATION MATH SELFTEST PASS — {9} groups, AMZN decision_record reproduced "
          f"(expected -16.1 / mos -13.5 / downside 38.7 / rr -0.41), re-anchor + WACC + symmetry checks green")
    return 0


if __name__ == "__main__":
    import sys, json
    if "--selftest" in sys.argv:
        raise SystemExit(_selftest())
    # demo: the AMZN case, frozen anchor vs live re-anchor
    amzn = [{"label": "bull", "probability": 25, "price_target": 247.0},
            {"label": "base", "probability": 45, "price_target": 210.0},
            {"label": "bear", "probability": 30, "price_target": 146.0}]
    print(json.dumps({"frozen_$238.34": scenario_math(amzn, 238.34),
                      "reanchored_$247.23": reanchor(amzn, 247.23)}, indent=2))
