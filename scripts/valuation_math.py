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


def case_level_from_multiple(metric: float, multiple: float, basis: str,
                             bridge: Optional[dict] = None, shares: Optional[float] = None,
                             net_debt: Optional[float] = None) -> Optional[float]:
    """The level a scenario's OWN levers derive — the CASE's basis and (when it records one) its own
    bridge govern, falling back to the run-level basis/shares/net_debt only when the case carries none.
    Mirrors ui/web/src/lib/valuationLevers.ts caseLevelFromMultiple and the guard's `_case_level`
    (scripts/valuation_summary_checks.py) — all three must agree, or a case reads a different fair
    value depending which engine evaluated it.

    A per-case bridge is meaningful only on an 'ev' case (an equity multiple already gives equity
    value). Returns None (never raises, never guesses) when the terms are not derivable — unknown net
    debt, no positive shares, or a nonnumeric optional deduction (a bridge value present-but-malformed
    must not be silently read as 0, §15).
    """
    b = (basis or "equity").strip().lower()
    br = bridge if (b == "ev" and isinstance(bridge, dict)) else None
    if br is not None:
        nd = br.get("net_debt")
        if not _isnum(nd):
            return None  # §15: unknown net debt is never silently 0
        for key in ("minority", "other"):
            v = br.get(key)
            if v is not None and not _isnum(v):
                return None  # a present-but-nonnumeric deduction is a violation, not a silent zero
        sh = br.get("shares") if _isnum(br.get("shares")) else shares
        if not (_isnum(sh) and sh > 0):
            return None
        mi = br.get("minority")
        ot = br.get("other")
        equity = float(metric) * float(multiple) - float(nd) \
            - (float(mi) if _isnum(mi) else 0.0) + (float(ot) if _isnum(ot) else 0.0)
        return equity / float(sh)
    try:
        return level_from_multiple(metric, multiple, b, shares, net_debt)
    except ValueError:
        return None


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


def scenario_math(scenarios: list, price: Optional[float], direction: str = "long") -> dict:
    """Recompute the scenario identities from bull/base/bear LEVELS and probabilities.

    scenarios : list of {"label", "probability" (0-100), "price_target" (the fair-value LEVEL)}.
    price     : current price. If None/non-numeric, the LEVELS and the probability-weighted
                target are still returned, but every price-relative read is "Not assessable"
                (the no-price cap — CLAUDE.md §16 / MODULE_RULES).
    direction : "long" (default) or "short" — THE POSITION, from decision_record `basket`
                ("Short" -> short; every other basket, and an absent one, reads long). Scenario
                returns are POSITION-SIGNED per synthesizer.md §6: for a long a return is
                (target - price)/price; for a SHORT the adverse case is the price RISING, so the
                position return is (price - target)/price and the long formula must NOT be used
                because it flips the sign. A short with entry 100 and an adverse target of 130 has
                downside +30%, not -30%. Getting this wrong makes a Short Candidate's expected
                return read as a loss — TSLA_2026-07-25 publishes +56.57% and the long formula
                gives -56.57% on the identical levels and probabilities.

                NOT position-signed, by design: `margin_of_safety_pct` is direction-uniform (a
                short candidate simply reads a negative MoS — synthesizer.md field table) and
                `downside_to_bear_pct` is a valuation statement about the price falling to the bear.

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
    # The WORST bear, not the first one listed. A run may derive two down-legs (TSLA: a cyclical trough at
    # 20.90 and a structural reset at 6.86) and the orb's own graduated rule takes the worse of them as the
    # headline. With a single bear this is identical to picking the first.
    _bears = [s for s in clean if "bear" in str(s.get("label", "")).strip().lower()]
    bear = min(_bears, key=lambda s: float(s["price_target"])) if _bears else None

    per = []
    raw_returns = []   # the same returns UNROUNDED — ratios must never be built from rounded inputs
    have_price = _isnum(price) and price > 0
    short = str(direction or "long").strip().lower() == "short"
    for s in clean:
        # POSITION-signed: a short gains when the price falls, so its return is (price - target)/price
        frac = (((float(price) - float(s["price_target"])) if short
                 else (float(s["price_target"]) - float(price))) / float(price)) if have_price else None
        if frac is not None:
            raw_returns.append(frac)
        r = _pct(frac) if frac is not None else None
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
    out["expected_return_pct"] = (_pct(((p - prob_weighted_target) if short else (prob_weighted_target - p)) / p)
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
    # Risk/reward = expected position return / downside risk. This is the documented long formula
    #   (Probability-Weighted Target - Price) / (Price - Bear Price)
    # written direction-generally: for a long, E[r] = (pwt-p)/p and downside = (p-bear)/p, and the p's
    # cancel — the two are algebraically identical. Expressed this way it also holds for a short, whose
    # adverse case is the worst POSITION return (a squeeze), not the bear price. TSLA_2026-07-25 publishes
    # 1.85 = 56.57 / 30.56; the long price formula gives -0.58 on the same numbers.
    # Built from UNROUNDED fractions, rounded once at the end. Dividing the two rounded percentages instead
    # moves AMZN's published -0.41 to -0.42, and lets a real adverse loss under 0.05% round to zero and turn
    # a derivable ratio into None (Codex #366 P2). The percentage scaling cancels, so this is the same ratio.
    er_frac = ((p - prob_weighted_target) if short else (prob_weighted_target - p)) / p if prob_weighted_target is not None else None
    dr_frac = -min(raw_returns) if raw_returns else None
    # NOT DERIVABLE WITHOUT A REAL ADVERSE CASE. When every scenario is in the position's favour (dr <= 0 —
    # an all-upside setup, e.g. EMAAR_2026-07-03 whose bear sits ABOVE the entry price) the signed ratio is
    # meaningless: it comes out negative for what is a good setup. eval.py takes the same view and skips its
    # risk/reward re-derivation in exactly this case ("a real adverse case exists -> risk/reward is
    # derivable"), and that run publishes the disclosed magnitude instead (reward 14.49 / bear gap 7.80 =
    # 1.9x, stated three times in its thesis). Returning a signed -1.86 here would contradict a correct
    # published number, so return None and say why.
    if er_frac is not None and dr_frac is not None and dr_frac <= 0:
        out["risk_reward"] = None
        warnings.append("risk/reward Not assessable — no scenario is adverse to the position (the worst case "
                        "is still a gain), so the signed ratio is meaningless; state the reward/gap magnitude instead")
    else:
        out["risk_reward"] = (round(er_frac / dr_frac, 2)
                              if er_frac is not None and dr_frac is not None and abs(dr_frac) > 1e-12 else None)
    # "Is there a genuine adverse branch" is direction-dependent: a long needs a bear BELOW the price, a
    # short needs a bull ABOVE it (the squeeze). Firing the long check on a short is backwards — a short's
    # bear sitting below the price is the thesis working, not a defect (eval checks AM / AR).
    if short:
        bull = _find(clean, "bull")
        if not bull:
            warnings.append("no bull scenario found — no genuine squeeze/upside branch for a short (§8; eval check AR)")
        elif float(bull["price_target"]) <= p:
            warnings.append(f"bull price_target {bull['price_target']} is not above price {p} — no genuine "
                            f"squeeze/upside branch for a short (§8; eval check AR)")
    elif bear and float(bear["price_target"]) >= p:
        warnings.append(f"bear price_target {bear['price_target']} is not below price {p} — no genuine "
                        f"downside branch for a long (§8/§16)")
    return out


def reanchor(scenarios: list, new_price: float, direction: str = "long") -> dict:
    """Re-derive every price-relative read at a fresh price WITHOUT re-running any agent.
    The fair-value LEVELS are price-independent, so this is just scenario_math at the new price —
    the one-line recompute the Price-freshness rule and the Playground both call."""
    return scenario_math(scenarios, new_price, direction)


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
    # v1.3 — this CASE's OWN basis/multiple-basis/bridge, overriding the run-level convention. A run can
    # genuinely mix methods (EMAAR: EV/EBITDA cases + a 0.96x-on-book bear) — bridging an equity multiple
    # with the run's EV terms turns 9.75 into −2.82, so the case's own terms must be honored here, not
    # just in the schema/guard/browser (Codex #362 P1: this dataclass had none of these fields and
    # `recompute()` always used the run-level basis/shares/net_debt, mispricing NHY's bear as ~114
    # instead of 45.12).
    basis: Optional[str] = None                  # 'equity' / 'ev', overriding levers.basis for this case
    multiple_basis: Optional[str] = None          # what the multiple IS (e.g. 'EV/FY2025 Adj. EBITDA') —
                                                   # used only to gate the multiple-symmetry check to
                                                   # comparable cases, never in the level arithmetic
    bridge: Optional[dict] = None                 # {net_debt, minority, other, shares} — this case's OWN
                                                   # EV→equity terms, when they differ from the run level


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


def _comparable_key(s: "ScenarioLever", run_basis: str) -> str:
    """What makes two scenarios' multiples comparable: the named multiple_basis when the case records
    one (EMAAR's 'normalized EV/EBITDA' vs 'P/BV (book)' are NOT the same yardstick even though both are
    just numbers), falling back to the case's own basis (equity/ev) when no name is recorded."""
    if isinstance(s.multiple_basis, str) and s.multiple_basis.strip():
        return s.multiple_basis.strip().lower()
    return (s.basis or run_basis or "equity").strip().lower()


def recompute(levers: ValuationLevers, direction: str = "long") -> dict:
    """Top-level: levers → fair-value levels → scenario math → sanity checks. The one call the
    /api/valuation-levers recompute endpoint and the Playground client mirror both target.

    `direction` ("long" | "short", from decision_record `basket`) is forwarded to scenario_math. Without it
    a short-side caller using this public entry point silently gets long-signed returns — the fix would
    reach only callers that bypass this and call scenario_math directly (Codex #366 P2)."""
    scen_out = []
    for s in levers.scenarios:
        if _isnum(s.level_override):
            level = float(s.level_override)
        elif _isnum(s.forward_metric) and _isnum(s.multiple):
            # v1.3: the CASE's own basis/bridge govern — falling back to the run-level basis/net-debt
            # here prices NHY's cases off the run's broad net debt with no minority deducted (~114
            # instead of the committed 45.12 bear), and bridges an equity-basis case into nonsense.
            level = case_level_from_multiple(s.forward_metric, s.multiple, s.basis or levers.basis,
                                             s.bridge, levers.shares, levers.net_debt)
        else:
            level = None
        scen_out.append({"label": s.label, "probability": s.probability,
                         "price_target": round(level, 4) if level is not None else None,
                         "forward_metric": s.forward_metric, "multiple": s.multiple})

    math = scenario_math(scen_out, levers.current_price, direction)

    ke = capm_cost_of_equity(levers.rf, levers.beta, levers.erp)
    checks = {}
    if any(_isnum(x) for x in (levers.wacc, ke, levers.after_tax_kd)):
        checks["wacc"] = check_wacc(levers.after_tax_kd, levers.wacc, ke, levers.rf, levers.erp,
                                    levers.is_developed_mega_cap)
    mults = {(s.label or "").strip().lower(): s.multiple for s in levers.scenarios}
    by_label = {(s.label or "").strip().lower(): s for s in levers.scenarios}
    # A mixed-method set (an equity P/E case beside an EV/EBITDA case) makes the raw multiples
    # incomparable — a 7x P/E bear vs a 6x EV/EBITDA base is not "the bear compressed the multiple",
    # it is two different yardsticks (Codex #362 P2). Only run the symmetry check when every case that
    # HAS a multiple shares the same comparable key.
    present = [by_label[k] for k in ("bull", "base", "bear") if k in by_label and _isnum(mults.get(k))]
    comparable = len({_comparable_key(s, levers.basis) for s in present}) <= 1
    if comparable and any(_isnum(mults.get(k)) for k in ("bull", "base", "bear")):
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
# ---------------------------------------------------------------------------
# 4. Driver -> target: push a NEW forward-metric value through each case's own levers
# ---------------------------------------------------------------------------

def _case_basis(scen: dict, run_basis: str) -> str:
    b = scen.get("basis")
    return b if b in ("equity", "ev") else run_basis


def _level_from_case(scen: dict, metric: float, run_basis: str, sidecar: dict):
    """The per-share level THIS case's recorded levers give for `metric`. None when not derivable.
    Same resolution as the integrity guard's _case_level and the client's caseLevelFromMultiple."""
    mult = scen.get("multiple")
    if not (_isnum(metric) and _isnum(mult)):
        return None
    basis = _case_basis(scen, run_basis)
    br = scen.get("bridge") if isinstance(scen.get("bridge"), dict) and basis == "ev" else None
    if br is not None:
        nd = br.get("net_debt")
        if not _isnum(nd):
            return None
        sh = br.get("shares") if _isnum(br.get("shares")) else sidecar.get("shares")
        if not (_isnum(sh) and float(sh) > 0):
            return None
        equity = float(metric) * float(mult) - float(nd) \
            - (float(br.get("minority")) if _isnum(br.get("minority")) else 0.0) \
            + (float(br.get("other")) if _isnum(br.get("other")) else 0.0)
        return equity / float(sh)
    try:
        return level_from_multiple(float(metric), float(mult), basis, sidecar.get("shares"), sidecar.get("net_debt"))
    except ValueError:
        return None


def reprice_from_metric(sidecar: dict, decision: dict, new_metric, base_metric=None,
                        direction: str = "long") -> dict:
    """Answer "if the driver moves, what happens to the TARGET?" — the hop the chat could not make.

    The sensitivity engine already turns a driver move into a new value for the run's base metric
    (scripts/sensitivity_math.py). This takes that new value and pushes it through EACH case's own
    recorded levers — its multiple, its basis, its EV->equity bridge — then re-derives every return and
    the probability-weighted expected return. Nothing is estimated: a case that records no reproducible
    metric x multiple simply does not move, and says so.

    THE METRIC MUST BE THE SAME THING. An EBITDA coefficient cannot be applied to a case priced on
    revenue. The gate is numeric, not a string match: the sensitivity's base value must equal the
    valuation's own forward_metric within a small relative tolerance. Refuses with metric_mismatch
    otherwise — the alternative is a confident answer built on two different denominators.

    WHICH CASES RESPOND. A case whose level comes from a recorded derivation chain (a margin runoff, a
    structural reset) is NOT re-priced by a spot driver: its level is a multi-year impairment path, not a
    function of this quarter's price. It is reported as held, with the reason. Same for a case the master
    added with no module levers at all.

    Returns {ok, cases[], expected_return_pct_before/after, ...} or {ok: False, reason}.
    """
    if not isinstance(sidecar, dict) or not isinstance(sidecar.get("scenarios"), list):
        return {"ok": False, "reason": "no_levers", "detail": "this run records no valuation levers"}
    if not _isnum(new_metric):
        return {"ok": False, "reason": "no_new_metric", "detail": "no new metric value to apply"}

    run_basis = sidecar.get("basis") if sidecar.get("basis") in ("equity", "ev") else "equity"
    price = None
    for cand in ((decision or {}).get("entry_price"), sidecar.get("current_price")):
        if _isnum(cand) and float(cand) > 0:
            price = float(cand)
            break

    by_label = {}
    for s in sidecar["scenarios"]:
        if isinstance(s, dict) and isinstance(s.get("label"), str):
            by_label[s["label"].strip().lower()] = s

    # the metric gate — compare against the cases that actually carry a forward metric
    recorded = [float(s["forward_metric"]) for s in by_label.values() if _isnum(s.get("forward_metric"))]
    if not recorded:
        return {"ok": False, "reason": "no_metric_cases",
                "detail": "no case records a forward metric, so a driver move cannot be pushed through"}
    if _isnum(base_metric):
        ref = max(recorded, key=lambda v: abs(v))
        if abs(float(base_metric)) > 1e-9 and abs(ref - float(base_metric)) / abs(float(base_metric)) > 0.02:
            return {"ok": False, "reason": "metric_mismatch",
                    "detail": (f"the sensitivity is on a base of {round(float(base_metric), 2)} but the valuation "
                               f"cases are priced on {round(ref, 2)} — different denominators, so the coefficient "
                               f"cannot be applied to the fair value")}

    # the CASE SET and the probabilities come from the frozen thesis (§10/§22); the sidecar supplies levers
    thesis = (decision or {}).get("scenarios")
    thesis = thesis if isinstance(thesis, list) and thesis else None
    rows = thesis or [{"label": s.get("label"), "probability": s.get("probability"),
                       "price_target": s.get("level")} for s in sidecar["scenarios"]]

    cases, before, after = [], [], []
    for t in rows:
        lab = str(t.get("label") or "")
        s = by_label.get(lab.strip().lower())
        old = t.get("price_target")
        old = float(old) if _isnum(old) else (float(s["level"]) if s and _isnum(s.get("level")) else None)
        prob = t.get("probability")
        row = {"label": lab, "probability": prob if _isnum(prob) else None,
               "level_before": round(old, 4) if old is not None else None}
        if s is None:
            row.update(responds=False, why="the thesis's own case — the valuation module recorded no levers for it",
                       level_after=row["level_before"])
        elif isinstance(s.get("derivation"), dict):
            row.update(responds=False,
                       why="priced off a recorded derivation chain (a multi-year path), not off the spot driver",
                       level_after=row["level_before"])
        else:
            nl = _level_from_case(s, float(new_metric), run_basis, sidecar)
            if nl is None:
                row.update(responds=False, why="records no reproducible metric x multiple", level_after=row["level_before"])
            else:
                row.update(responds=True, why=None, level_after=round(nl, 4),
                           multiple=s.get("multiple"), multiple_basis=s.get("multiple_basis"),
                           metric_before=s.get("forward_metric"), metric_after=round(float(new_metric), 4))
        if _isnum(row["probability"]):
            if row["level_before"] is not None:
                before.append({"label": lab, "probability": row["probability"], "price_target": row["level_before"]})
            if row["level_after"] is not None:
                after.append({"label": lab, "probability": row["probability"], "price_target": row["level_after"]})
        cases.append(row)

    mb = scenario_math(before, price, direction) if before else None
    ma = scenario_math(after, price, direction) if after else None
    for r in cases:
        for tag, m in (("return_before", mb), ("return_after", ma)):
            r[tag] = None
            if m:
                hit = next((x for x in m["per_scenario"] if str(x["label"]).strip().lower() == r["label"].strip().lower()), None)
                if hit:
                    r[tag] = hit["return_pct"]
    return {
        "ok": True,
        "price": price,
        "direction": "short" if str(direction).strip().lower() == "short" else "long",
        "metric_before": round(max(recorded, key=lambda v: abs(v)), 4),
        "metric_after": round(float(new_metric), 4),
        "cases": cases,
        "responded": sum(1 for r in cases if r.get("responds")),
        "held": [r["label"] for r in cases if not r.get("responds")],
        "expected_return_pct_before": (mb or {}).get("expected_return_pct"),
        "expected_return_pct_after": (ma or {}).get("expected_return_pct"),
        "prob_weighted_target_before": (mb or {}).get("prob_weighted_target"),
        "prob_weighted_target_after": (ma or {}).get("prob_weighted_target"),
        "warnings": sorted(set((mb or {}).get("warnings", []) + (ma or {}).get("warnings", []))),
    }


# selftest — fixture-free CI gate (mirrors scripts/market_prices.py --selftest)
# ---------------------------------------------------------------------------
def _approx(a, b, tol=0.15) -> bool:
    return a is not None and b is not None and abs(a - b) <= tol


# Every check in _selftest is counted, and the count is asserted at the end. A `return` placed above a group
# — the `if fails` gate used to sit before the short-side group — disables every check below it while the
# suite still prints PASS. A count is the only thing that catches that from inside (found by a MISSED
# mutation: moving the gate back up changed nothing).
_EXPECTED_CHECKS = 79
_CHECKS_RUN = 0          # module-level on purpose — the CALLER asserts it, so an early return cannot hide it


def _selftest() -> int:
    global _CHECKS_RUN
    _CHECKS_RUN = 0
    fails = []

    def check(name, cond):
        global _CHECKS_RUN
        _CHECKS_RUN += 1
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
    # EXACT, not ±0.02: that tolerance is the size of the rounding error it exists to catch, and it did
    # hide one — a ratio built from the already-rounded percentages reads -0.42 here (Codex #366 P2).
    check("amzn_risk_reward == -0.41 exactly (published)", m["risk_reward"] == -0.41)
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

    # --- 10. v1.3 per-case basis/bridge honored in the Python recompute path (Codex #362 P1) ---
    # NHY's real shape: run declares basis='ev' with NO run-level shares/net_debt, but EVERY case
    # supplies its OWN bridge (net debt 17,919 + minority 7,495, shares 1965.28). Before this fix,
    # recompute() always used the run-level (absent) terms and produced a level Not assessable / wrong;
    # with the fix it must reproduce the committed 107.75 / 81.88 / 45.12 exactly.
    def _nhy_lever(label, mult):
        return ScenarioLever(label, 0, forward_metric=28889, multiple=mult, basis="ev",
                             multiple_basis="EV/FY2025 Adj. EBITDA",
                             bridge={"net_debt": 17919, "minority": 7495, "shares": 1965.28})
    nhy_levers = ValuationLevers(
        scenarios=[_nhy_lever("bull", 8.21), _nhy_lever("base", 6.45), _nhy_lever("bear", 3.95)],
        basis="ev", shares=None, net_debt=None, current_price=None)
    nhy_out = recompute(nhy_levers)
    nhy_levels = {s["label"]: s["price_target"] for s in nhy_out["scenarios"]}
    check("nhy_bull_case_bridge≈107.75", _approx(nhy_levels["bull"], 107.75, tol=0.05))
    check("nhy_base_case_bridge≈81.88", _approx(nhy_levels["base"], 81.88, tol=0.05))
    check("nhy_bear_case_bridge≈45.12", _approx(nhy_levels["bear"], 45.12, tol=0.05))
    # proof the bug was real: reading the RUN-level (absent) net debt/shares instead of the case's own
    # bridge cannot even compute a level (no positive shares) — the pre-fix path returned None/garbage,
    # never 45.12. A regression back to the run-level path would show up here as None again.
    check("nhy_bear_not_none (would be None or ~114 on the old run-level-only path)", nhy_levels["bear"] is not None)

    # EMAAR-style mixed basis in ONE run: an EV/EBITDA base (with its own bridge) + a book-value (equity)
    # bear that must NOT be bridged (bridging 0.96x book turns 9.75 into a nonsense negative number).
    emaar_levers = ValuationLevers(
        scenarios=[
            ScenarioLever("base", 0, forward_metric=18122.5, multiple=6.7, basis="ev",
                         multiple_basis="normalized EV/EBITDA",
                         bridge={"net_debt": -24969, "minority": 13808, "shares": 8838.8}),
            ScenarioLever("bear", 0, forward_metric=10.16, multiple=0.96, basis="equity",
                         multiple_basis="P/BV (book)"),
        ],
        basis="ev", shares=8838.8, net_debt=-24969)
    emaar_out = recompute(emaar_levers)
    emaar_levels = {s["label"]: s["price_target"] for s in emaar_out["scenarios"]}
    check("emaar_base_ev_bridge≈15.00", _approx(emaar_levels["base"], 15.00, tol=0.05))
    check("emaar_bear_equity_not_bridged≈9.75", _approx(emaar_levels["bear"], 9.75, tol=0.01))

    # --- 11. multiple-symmetry check is gated by comparable basis (Codex #362 P2) ---
    # bull/base share 'EV/FY2025 Adj. EBITDA'; a mismatched-basis bear must not trigger a false
    # "bear must compress" warning just because 0.96 < 6.45 on an unrelated yardstick.
    mixed_symmetry = ValuationLevers(
        scenarios=[
            ScenarioLever("bull", 0, forward_metric=28889, multiple=8.21, basis="ev", multiple_basis="EV/FY2025 Adj. EBITDA"),
            ScenarioLever("base", 0, forward_metric=28889, multiple=6.45, basis="ev", multiple_basis="EV/FY2025 Adj. EBITDA"),
            ScenarioLever("bear", 0, forward_metric=10.16, multiple=0.96, basis="equity", multiple_basis="P/BV (book)"),
        ],
        basis="ev")
    check("mixed-basis set skips the (meaningless) symmetry check",
          "multiple_symmetry" not in recompute(mixed_symmetry)["checks"])
    # same-basis set: the check DOES still run and still catches a real violation
    same_basis_bad = ValuationLevers(
        scenarios=[
            ScenarioLever("bull", 0, forward_metric=100, multiple=20, basis="equity", multiple_basis="P/E"),
            ScenarioLever("base", 0, forward_metric=100, multiple=20, basis="equity", multiple_basis="P/E"),
            ScenarioLever("bear", 0, forward_metric=100, multiple=25, basis="equity", multiple_basis="P/E"),
        ],
        basis="equity")
    check("same-basis set still runs + catches bear expanding the multiple",
          "multiple_symmetry" in recompute(same_basis_bad)["checks"] and not recompute(same_basis_bad)["checks"]["multiple_symmetry"]["ok"])

    # ---- group 12: POSITION-SIGNED returns for a short (synthesizer.md §6 Downside Risk) ----
    # The fixture is the committed TSLA_2026-07-25 decision_record, reproduced from its own five levels
    # and probabilities. The long formula gives every number the wrong sign on the same inputs.
    TSLA = [
        {"label": "bull",            "probability": 25, "price_target": 336.08},
        {"label": "base",            "probability": 20, "price_target": 32.37},
        {"label": "bear_cyclical",   "probability": 25, "price_target": 20.90},
        {"label": "bear_structural", "probability": 20, "price_target": 6.86},
        {"label": "tail_squeeze",    "probability": 10, "price_target": 417.40},
    ]
    sh = scenario_math(TSLA, 319.69, direction="short")
    check("short: expected return reproduces the published +56.57", abs(sh["expected_return_pct"] - 56.57) < 0.05)
    check("short: downside risk reproduces the published +30.56 (the squeeze, not the bear)",
          abs(sh["downside_risk_pct"] - 30.56) < 0.05)
    check("short: risk/reward == the published 1.85 exactly", sh["risk_reward"] == 1.85)
    _r = {x["label"]: x["return_pct"] for x in sh["per_scenario"]}
    check("short: a price RISE is a loss (bull 336.08 vs entry 319.69 -> -5.1%)", abs(_r["bull"] + 5.1) < 0.15)
    check("short: a price FALL is a gain (base 32.37 -> +89.9%)", abs(_r["base"] - 89.9) < 0.15)
    check("short: the worst case is the squeeze, not the bear", min(_r.values()) == _r["tail_squeeze"])
    check("short: margin of safety stays direction-uniform and negative", sh["margin_of_safety_pct"] < 0)
    # two down-legs: "downside to bear" is the WORST bear, not whichever is listed first (cyclical 20.90 is
    # first and gives 93.5%; the structural 6.86 gives 97.9%)
    check("downside-to-bear takes the WORST bear, not the first listed", abs(sh["downside_to_bear_pct"] - 97.9) < 0.2)
    check("...and one bear behaves identically",
          abs(scenario_math([{"label": "base", "probability": 50, "price_target": 100},
                             {"label": "bear", "probability": 50, "price_target": 60}], 120)["downside_to_bear_pct"] - 50) < 0.2)
    lg = scenario_math(TSLA, 319.69, direction="long")
    check("the long formula on a short flips every sign", abs(lg["expected_return_pct"] + 56.57) < 0.05)
    check("...and misreports the worst case as the bear", abs(lg["downside_risk_pct"] - 97.9) < 0.2)
    check("short: no long-side 'bear not below price' warning fires",
          not any("downside branch for a long" in w for w in sh["warnings"]))
    check("short: a bull NOT above the price is warned (no squeeze branch)",
          any("squeeze/upside branch for a short" in w for w in
              scenario_math([{"label": "bull", "probability": 50, "price_target": 200},
                             {"label": "bear", "probability": 50, "price_target": 50}], 300, direction="short")["warnings"]))
    check("short: a MISSING bull case is warned too, not silently accepted (Codex #366 P2)",
          any("no bull scenario" in w for w in
              scenario_math([{"label": "base", "probability": 50, "price_target": 100},
                             {"label": "tail_squeeze", "probability": 50, "price_target": 50}], 120, direction="short")["warnings"]))
    check("direction defaults to long", scenario_math(TSLA, 319.69)["expected_return_pct"] == lg["expected_return_pct"])
    check("an unrecognised direction is treated as long",
          scenario_math(TSLA, 319.69, direction="hedge")["expected_return_pct"] == lg["expected_return_pct"])

    # ---- group 11: DRIVER -> TARGET (reprice_from_metric) — the chat's missing hop ----
    # NHY's real shape: one shared metric (FY2025 Adj. EBITDA 28,889), three implied multiples, per-case
    # bridges, and a BEAR priced off a recorded runoff chain. LME +275/mt -> EBITDA 33,014 (the sensitivity
    # engine's own output for the user's question "if LME is 3,467/mt").
    NHY_SC = {
        "schema_version": "1.3", "ticker": "NHY", "basis": "equity", "shares": 1965.28, "net_debt": 13090,
        "scenarios": [
            {"label": "bull", "forward_metric": 28889.0, "multiple": 8.21, "basis": "ev", "level": 107.70,
             "bridge": {"net_debt": 17919, "net_debt_basis": "adj", "minority": 7495, "other": 0, "shares": 1965.28}},
            {"label": "base", "forward_metric": 28889.0, "multiple": 6.45, "basis": "ev", "level": 81.83,
             "bridge": {"net_debt": 17919, "net_debt_basis": "adj", "minority": 7495, "other": 0, "shares": 1965.28}},
            {"label": "bear", "forward_metric": 28889.0, "multiple": 3.95, "basis": "ev", "level": 45.12,
             "bridge": {"net_debt": 17919, "net_debt_basis": "adj", "minority": 7495, "other": 0, "shares": 1965.28},
             "derivation": {"model": "margin_runoff_dcf", "ev": 114095, "net_debt": 17919, "minority": 7495,
                            "shares": 1965.28, "source": "07 §3"}},
        ]}
    NHY_DR = {"entry_price": 84.96, "scenarios": [
        {"label": "bull", "probability": 20, "price_target": 107.70},
        {"label": "base", "probability": 55, "price_target": 81.83},
        {"label": "bear", "probability": 25, "price_target": 45.12}]}
    rp = reprice_from_metric(NHY_SC, NHY_DR, 33014.0, 28889.0)
    check("reprice ok", rp["ok"] is True)
    _c = {r["label"]: r for r in rp["cases"]}
    check("reprice: the BEFORE expected return reproduces the published -8.4",
          abs(rp["expected_return_pct_before"] + 8.4) < 0.1)
    check("reprice: bull re-prices through its own bridge (107.70 -> 124.99)",
          abs(_c["bull"]["level_after"] - 124.9852) < 0.01)
    check("reprice: base re-prices (81.83 -> 95.42)", abs(_c["base"]["level_after"] - 95.4196) < 0.01)
    check("reprice: the chain-priced BEAR is HELD, not re-priced by a spot driver",
          _c["bear"]["responds"] is False and _c["bear"]["level_after"] == _c["bear"]["level_before"])
    check("reprice: and it says WHY it is held", "derivation chain" in (_c["bear"]["why"] or ""))
    check("reprice: expected return moves -8.4 -> +4.5", abs(rp["expected_return_pct_after"] - 4.5) < 0.1)
    check("reprice: returns are carried per case", abs(_c["base"]["return_after"] - 12.3) < 0.2)
    # THE METRIC GATE: an EBITDA coefficient must never be applied to a revenue-priced case
    rev = {"schema_version": "1.3", "basis": "ev", "shares": 4252.5, "scenarios": [
        {"label": "base", "forward_metric": 110860.0, "multiple": 1.0, "basis": "ev", "level": 32.37,
         "bridge": {"net_debt": -27444, "net_debt_basis": "broad", "minority": 661, "other": 0, "shares": 4252.5}}]}
    mm = reprice_from_metric(rev, {"entry_price": 319.69, "scenarios": [{"label": "base", "probability": 100, "price_target": 32.37}]},
                             33014.0, 28889.0)
    check("reprice REFUSES a metric mismatch (EBITDA coefficient vs a revenue-priced case)",
          mm["ok"] is False and mm["reason"] == "metric_mismatch")
    check("...and names both denominators", "110860" in str(mm["detail"]) and "28889" in str(mm["detail"]))
    # a case the master added, with no levers at all, is held and named
    dr5 = {"entry_price": 84.96, "scenarios": NHY_DR["scenarios"] + [{"label": "tail", "probability": 0, "price_target": 200.0}]}
    rp5 = reprice_from_metric(NHY_SC, dr5, 33014.0, 28889.0)
    _t = {r["label"]: r for r in rp5["cases"]}["tail"]
    check("a master-added case is held, with its own reason",
          _t["responds"] is False and "no levers" in (_t["why"] or ""))
    check("the case set comes from the THESIS (4 rows, not the sidecar's 3)", len(rp5["cases"]) == 4)
    # a SHORT re-prices position-signed
    rp_s = reprice_from_metric(NHY_SC, NHY_DR, 33014.0, 28889.0, direction="short")
    check("a short's expected return is the mirror of the long's",
          abs(rp_s["expected_return_pct_after"] + rp["expected_return_pct_after"]) < 0.15)
    check("no levers at all -> a clean refusal", reprice_from_metric({}, NHY_DR, 33014.0)["ok"] is False)

    # ALL-UPSIDE setup: every scenario favours the position, so there is no adverse case and the signed
    # ratio is meaningless. EMAAR_2026-07-03's real shape — bear 20.0 ABOVE entry 12.2 — where the run
    # publishes the disclosed magnitude (reward 14.49 / bear gap 7.80 = 1.9x) and eval.py skips its own
    # re-derivation. Returning -1.86 here would contradict a correct published number.
    _up = scenario_math([{"label": "bull", "probability": 20, "price_target": 34.2},
                         {"label": "base", "probability": 50, "price_target": 27.7},
                         {"label": "bear", "probability": 30, "price_target": 20.0}], 12.2)
    check("all-upside: expected return still reproduces EMAAR's published 118.8", abs(_up["expected_return_pct"] - 118.8) < 0.1)
    check("all-upside: downside risk still reproduces the published -63.9", abs(_up["downside_risk_pct"] + 63.9) < 0.1)
    check("all-upside: risk/reward is None, not a negative ratio", _up["risk_reward"] is None)
    check("all-upside: and it says why", any("no scenario is adverse" in w for w in _up["warnings"]))
    check("a normal long still derives it (AMZN -0.41)", m["risk_reward"] == -0.41)

    # risk/reward is built from UNROUNDED fractions, rounded once
    _tiny = scenario_math([{"label": "base", "probability": 50, "price_target": 101},
                           {"label": "bear", "probability": 50, "price_target": 99.98}], 100)
    check("a sub-0.05% adverse case still yields a ratio (rounded inputs made it None)",
          _isnum(_tiny["risk_reward"]))
    check("...and the ratio is the unrounded one", abs(_tiny["risk_reward"] - 24.5) < 0.05)
    # reanchor and recompute must FORWARD the direction, or a short-side caller of the public API gets
    # long-signed returns while only direct scenario_math callers are fixed
    check("reanchor forwards direction", reanchor(TSLA, 319.69, "short")["expected_return_pct"] == sh["expected_return_pct"])
    check("reanchor defaults to long", reanchor(TSLA, 319.69)["expected_return_pct"] == lg["expected_return_pct"])

    if fails:
        print("VALUATION MATH SELFTEST FAIL:", ", ".join(fails))
        return 1
    print(f"VALUATION MATH SELFTEST PASS — {13} groups, AMZN + NHY + EMAAR + TSLA decision_records reproduced "
          f"(AMZN long: expected -16.1 / mos -13.5 / downside 38.7 / rr -0.41; TSLA short: +56.57 / +30.56 / 1.85), "
          f"re-anchor + WACC + symmetry + v1.3 per-case bridge checks green")
    return 0


if __name__ == "__main__":
    import sys, json
    def _run_selftest() -> int:
        """Runs the suite, then asserts how many checks actually RAN. A `return` placed above a group
        silently disables every check below it while the suite still prints PASS — that is not hypothetical,
        it is what had made the entire short-side group dead. The count is checked out here so no early
        return inside _selftest can bypass it."""
        rc = _selftest()
        if _CHECKS_RUN < _EXPECTED_CHECKS:
            print(f"VALUATION MATH SELFTEST FAIL: only {_CHECKS_RUN} checks ran, expected at least "
                  f"{_EXPECTED_CHECKS} — a `return` above a group disables everything below it")
            return 1
        return rc

    # --reprice: the callable entry the cockpit chat server shells out to (ui/server/src/chat-whatif.ts) for
    # the driver -> TARGET hop. Reads ONE request as JSON on stdin —
    #   {"sidecar": <valuation_summary.json>, "decision": <decision_record.json>, "new_metric": number,
    #    "base_metric": number, "direction": "long"|"short"}
    # — and writes reprice_from_metric()'s result (or {"error": ...}) as JSON on stdout. The Node side owns
    # path-sandboxing and passes parsed objects, so this entry never touches the filesystem: the same engine
    # the guard and the client mirror, one source of truth.
    if "--reprice" in sys.argv:
        import json as _j
        try:
            _req = _j.load(sys.stdin)
            if not isinstance(_req, dict):
                raise ValueError("reprice request must be a JSON object")
            print(_j.dumps(reprice_from_metric(_req.get("sidecar") or {}, _req.get("decision") or {},
                                               _req.get("new_metric"), _req.get("base_metric"),
                                               _req.get("direction") or "long")))
        except Exception as e:
            print(_j.dumps({"error": f"reprice request failed: {e}"}))
        raise SystemExit(0)
    if "--selftest" in sys.argv:

        raise SystemExit(_run_selftest())
    # demo: the AMZN case, frozen anchor vs live re-anchor
    amzn = [{"label": "bull", "probability": 25, "price_target": 247.0},
            {"label": "base", "probability": 45, "price_target": 210.0},
            {"label": "bear", "probability": 30, "price_target": 146.0}]
    print(json.dumps({"frozen_$238.34": scenario_math(amzn, 238.34),
                      "reanchored_$247.23": reanchor(amzn, 247.23)}, indent=2))
