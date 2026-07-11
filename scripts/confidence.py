#!/usr/bin/env python3
"""
scripts/confidence.py — deterministic, decision-useful confidence for the research swarm.

WHY THIS EXISTS
    Today `confidence_score` is an LLM assertion: the synthesizer picks a number and
    writes a prose "build" to justify it, and nothing re-derives it — the finish-gate
    only checks it stays <= its ceilings. This module makes the number COMPUTED,
    AUDITABLE, and DECISION-USEFUL, mirroring the screener's deterministic scorer
    (`scripts/screener_score_breakdown.py`). The JUDGMENT stays in the recorded inputs
    (data-sufficiency, edge, which caps/downgrades fired); only the COMBINATION is
    deterministic here, so it can be re-derived and gated.

WHAT IT PRODUCES  (decision-useful outputs, not one opaque digit)
    analysis_confidence : how well the situation is UNDERSTOOD — evidence quality only,
                          DIRECTION-AGNOSTIC (a well-evidenced Avoid scores HIGH here).
    conviction          : how much to BET — DIRECTION-AWARE. Long/hedge theses are
                          edge-gated (<=60 without a proven edge, §7); Avoid/Short are
                          gated by the strength of the disqualifying evidence, NOT an
                          upside edge; a Watchlist is non-committal (Toss-up cap); a
                          refuse-to-rate is floored near zero (§11). `conviction` is the
                          drop-in replacement for the old single `confidence_score`.
    confidence_breakdown: the step-by-step build, every point traceable.
    sizing_hint         : conviction + decision -> a plain action/size band.
    warnings            : self-surfaced inconsistencies (unknown cap keys; a proven edge
                          on a non-committal rating) so the finish-gate/eval can flag them.

STEP MAP
    Step 1 = `conviction` re-implements the DOCUMENTED single-number rule (synthesizer.md
             "CONFIDENCE SCORING RULES") and `reconcile()` is its re-derivation gate.
    Step 2 = `analysis_confidence` + the direction-aware split (fixes the HCG failure of
             the earlier single-number sketch — a bad business is not bad analysis).
    Step 4 = `sizing_hint`.

SAFETY INVARIANTS (hardened after adversarial review)
    - Penalties can only LOWER conviction: downgrade points and the calibration haircut are
      floored at >=0, AND conviction is re-bounded by the direction ceiling — a sign-slipped
      downgrade can never lift conviction above its own caps.
    - An unresolved CRITICAL governance flag self-enforces the §13/§18 Watchlist cap (60),
      not merely the 80 confidence cap — the caller cannot forget to pass it separately.
    - A refuse-to-rate decision is floored to <=20 (§11), so an honest low number is not
      fought by the gate.
    - Unknown `modules_absent` keys are surfaced (not silently dropped) so a mistyped cap
      is caught instead of vanishing.

HONEST CAVEATS
    - The NUMERIC WEIGHTS in CONST (AC blend, NEUTRAL/EDGE/INSUFFICIENT ceilings, the graded
      edge unlock) are UNCALIBRATED PRIORS, isolated so they are visible and tunable. They
      must be tuned against the decision ledger (Phase 3/4/6) before the third digit is
      trusted. This module makes the number honest and auditable; only calibration (Step 3,
      not built here) makes it a validated probability.
    - The documented CAPS and DOWNGRADE arithmetic invent nothing — they codify
      synthesizer.md 877-898. Only the AC blend + the direction ceilings are new.
    - Edge-gate scope is INTENTIONALLY upside-only: a long/hedge needs a proven edge to
      exceed 60; an Avoid/Short does not (you do not need a variant perception to decline a
      bet or to short an evidenced blow-up). This is a deliberate reinterpretation of §7's
      unqualified wording; it is the whole point of the direction-aware split.

Doctrine: synthesizer.md "CONFIDENCE SCORING RULES"; CLAUDE.md §7 (edge), §10 (probability
bands), §11 (data sufficiency), §12 (scoring), §13/§18 (decision/caps), §24 (avoid-ruin).
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Tunable priors — UNCALIBRATED. Isolated here on purpose (see caveats above).
# ---------------------------------------------------------------------------
CONST = {
    # analysis_confidence = weighted blend of EVIDENCE quality (must sum to 1.0)
    "AC_W_DATA_SUFFICIENCY": 0.50,   # §11 is the dominant evidence input
    "AC_W_CORROBORATION":    0.25,   # cross-module agreement (low on unresolved conflict / wide cross-method spread)
    "AC_W_EVIDENCE_TIER":    0.25,   # share of load-bearing claims on Tier-1/2 filings (§4/§6)
    # direction ceilings
    "NEUTRAL_CEILING":       58.0,   # a Watchlist is non-committal -> capped in the upper Toss-up band (<60 "Likely")
    "EDGE_GATE_CEILING":     60.0,   # §7: no proven edge -> conviction may not exceed 60
    "EDGE_UNLOCK_SLOPE":     0.8,    # proven edge (>=50) lifts the ceiling: 60 + (edge-50)*slope
    "INSUFFICIENT_CEILING":  20.0,   # §11: refuse-to-rate -> near-zero conviction (0-29 "insufficient")
    "CRITICAL_GOV_CEILING":  60.0,   # §13/§18: unresolved CRITICAL governance flag -> Watchlist rating cap
    "CATALYST_WEAK_CAP":     70.0,   # synthesizer.md L895: weak/vague catalyst timing -> cap 70
    # hard maxima (§18)
    "SOFT_MAX":              85.0,   # >85 only with exceptional_evidence
    "HARD_MAX":             100.0,
    # §11 data-sufficiency conviction cap (mirrors scripts/eval.py eval_y_data_sufficiency thresholds)
    "DS_REFUSE_THRESHOLD":   30.0,   # §11 '0-29 insufficient — refuse to rate' (= eval.py INSUF_THRESHOLD)
    "DS_CONVICTION_FLOOR":   50.0,   # §11 '30-49 weak — cap the opinion': conviction cannot reach a conviction position (= eval.py DATASUF_CONVICTION_FLOOR)
    # gate tolerance (points) for reconcile()
    "RECONCILE_TOL":         2.0,
}

# Documented module-absence caps — synthesizer.md 879-885 (a cap applies only when the
# data OR its dedicated module is absent; a completed module LIFTS its cap). Values exact.
MODULE_ABSENCE_CAP = {
    "consensus": 55.0,   # no earnings module / no consensus data
    "valuation": 60.0,
    "solvency":  65.0,
    "governance": 80.0,
    "filings":   70.0,
    "catalyst":  75.0,   # no catalyst timing at all (weak-but-present is 70, see CATALYST_WEAK_CAP)
    "options":   80.0,   # no options / positioning data
}

LONG_DECISIONS = {"strong buy", "buy", "starter position only"}
DOWNSIDE_DECISIONS = {"avoid", "short candidate"}


def _clamp(x: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, x))


def _isnum(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _num0(v) -> float:
    """Coerce a nullable numeric field to float, treating None / non-numeric as 0.0. Ledger fields such as
    calibration_haircut and staleness_penalty are nullable (null = 'not applied'); float(None) must never
    crash the scorer when a decision_record is fed in verbatim."""
    return float(v) if _isnum(v) else 0.0


def _ds_ceiling(ds) -> float:
    """CLAUDE.md §11 data-sufficiency cap on CONVICTION — mirrors scripts/eval.py eval_y_data_sufficiency.
    ds<30 ('insufficient — refuse to rate') caps conviction at INSUFFICIENT_CEILING (20); 30<=ds<50
    ('weak — cap the opinion') caps it at DS_CONVICTION_FLOOR (50), so thin data can never reach a
    conviction position (§11 caps conviction AND rating). ds>=50 or non-numeric -> no extra cap here
    (a non-numeric ds is already reflected in analysis_confidence)."""
    if not _isnum(ds):
        return CONST["HARD_MAX"]
    if ds < CONST["DS_REFUSE_THRESHOLD"]:
        return CONST["INSUFFICIENT_CEILING"]
    if ds < CONST["DS_CONVICTION_FLOOR"]:
        return CONST["DS_CONVICTION_FLOOR"]
    return CONST["HARD_MAX"]


def classify_direction(decision: str, expected_return_pct: Optional[float] = None) -> str:
    """long (edge-gated) / hedge (edge-gated) / downside (evidence-gated) / neutral.

    A Watchlist is NEUTRAL regardless of expected-return sign: it is a non-committal rating
    and must not inherit an active long/short ceiling. Only an explicit Buy/Starter is a
    long, only an explicit Avoid/Short is a downside call, and a Pair Trade / Hedge is a
    constructed edge-driven position (edge-gated like a long, distinct sizing).
    `expected_return_pct` is accepted for context but intentionally NOT used to set
    direction (a Watchlist stays neutral either way)."""
    d = (decision or "").strip().lower()
    if d in DOWNSIDE_DECISIONS:
        return "downside"
    if d in LONG_DECISIONS:
        return "long"
    if "pair" in d or "hedge" in d:
        return "hedge"
    return "neutral"   # Watchlist, Insufficient Data — Refuse To Rate (floored separately), unknown


@dataclass
class ConfidenceInputs:
    """Everything the synthesizer must RECORD so confidence is re-derivable. Every field
    maps to something a module already produces or a judgment the synthesizer already makes
    in prose — this just makes it structured. 0..100 unless noted."""
    # --- evidence quality (feed analysis_confidence) ---
    data_sufficiency: float                        # decision_record.data_sufficiency_score (§11)
    corroboration: Optional[float] = None          # cross-module agreement; DEFAULTS TO data_sufficiency if omitted (never optimistic)
    evidence_tier: Optional[float] = None          # Tier-1/2 filing share (§4/§6); DEFAULTS TO data_sufficiency if omitted
    staleness_penalty: float = 0.0                 # subtracted from AC for stale carried modules (understanding axis)
    # --- edge / direction (feed conviction) ---
    edge_score: Optional[float] = None             # decision_record.edge_score (§7)
    edge_proof_present: bool = False               # edge_proof is a non-empty falsifiable test
    decision: str = "Watchlist"                    # decision_record.decision
    expected_return_pct: Optional[float] = None
    # --- documented ceilings (synthesizer.md 879-895) ---
    modules_absent: list = field(default_factory=list)   # subset of MODULE_ABSENCE_CAP keys (case/space-insensitive)
    critical_governance_unresolved: bool = False         # §13/§18 -> self-enforces the Watchlist cap (60)
    catalyst_timing_weak: bool = False                   # weak/vague timing -> 70 (L895)
    rating_cap_ceiling: Optional[float] = None           # any other §18/§24 rating cap expressed as a ceiling; None if none
    # --- downgrades (synthesizer.md 890-896; synthesizer records the chosen point in each documented range) ---
    downgrades: list = field(default_factory=list)       # [{"type","points","reason"}] — points floored at >=0
    calibration_haircut: float = 0.0                     # 8.0 if Phase-6 gate status == "applied" (floored at >=0)
    exceptional_evidence: bool = False                   # §18: >85/90+ only if everything aligns


def analysis_confidence(inp: ConfidenceInputs) -> float:
    """How well the situation is UNDERSTOOD — EVIDENCE quality only, direction-agnostic.
    Deliberately NOT business favourability: a well-evidenced Avoid on a bad business must
    score HIGH here (this is exactly where the earlier single-number sketch broke on HCG).
    Omitted sub-scores fall back to data_sufficiency so a caller who records only thin data
    is not silently credited with 'mixed/decent' corroboration+tier."""
    corrob = inp.data_sufficiency if inp.corroboration is None else inp.corroboration
    tier = inp.data_sufficiency if inp.evidence_tier is None else inp.evidence_tier
    raw = (CONST["AC_W_DATA_SUFFICIENCY"] * inp.data_sufficiency
           + CONST["AC_W_CORROBORATION"] * corrob
           + CONST["AC_W_EVIDENCE_TIER"] * tier)
    raw -= max(0.0, _num0(inp.staleness_penalty))   # a penalty can only LOWER understanding; a sign-slipped (negative) staleness must never inflate it
    return round(_clamp(raw), 1)


def _edge_ceiling(inp: ConfidenceInputs) -> float:
    es = inp.edge_score
    if not (_isnum(es) and es >= 50 and inp.edge_proof_present):
        return CONST["EDGE_GATE_CEILING"]                         # §7 edge gate: no proven edge -> <=60
    return _clamp(CONST["EDGE_GATE_CEILING"] + (es - 50.0) * CONST["EDGE_UNLOCK_SLOPE"])


def _documented_ceilings(inp: ConfidenceInputs):
    """synthesizer.md 879-895 caps as a list of ceilings (conviction takes the min).
    Returns (caps, unknown_keys). Keys are normalized (strip/lower); unknown keys are
    surfaced, never silently dropped."""
    caps = [CONST["HARD_MAX"]]
    unknown = []
    for m in inp.modules_absent:
        k = str(m).strip().lower()
        if k in MODULE_ABSENCE_CAP:
            caps.append(MODULE_ABSENCE_CAP[k])
        else:
            unknown.append(m)
    if inp.critical_governance_unresolved:
        caps.append(CONST["CRITICAL_GOV_CEILING"])   # §13/§18 Watchlist cap — self-enforcing (stricter than the 80 confidence cap)
    if inp.catalyst_timing_weak:
        caps.append(CONST["CATALYST_WEAK_CAP"])       # 70, per L895
    if _isnum(inp.rating_cap_ceiling):
        caps.append(float(inp.rating_cap_ceiling))
    caps.append(_ds_ceiling(inp.data_sufficiency))   # §11: thin data caps conviction (ds<30 -> 20; 30-49 -> 50)
    return caps, unknown


def compute(inp: ConfidenceInputs) -> dict:
    ac = analysis_confidence(inp)
    direction = classify_direction(inp.decision, inp.expected_return_pct)
    documented, unknown_keys = _documented_ceilings(inp)
    base_ceiling = min(documented)

    if direction in ("long", "hedge"):
        edge_c = _edge_ceiling(inp)
        dir_ceiling = min(base_ceiling, edge_c)
        ceiling_reason = f"{direction}: min(documented {round(base_ceiling)}, edge-gate {round(edge_c)})"
    elif direction == "downside":
        # Avoid/Short: gated by how well the DISQUALIFYING case is evidenced, NOT an upside edge.
        dir_ceiling = min(base_ceiling, ac)
        ceiling_reason = f"downside: min(documented {round(base_ceiling)}, analysis_conf {round(ac)}) — NOT edge-gated"
    else:  # neutral (Watchlist / other non-committal)
        dir_ceiling = min(base_ceiling, CONST["NEUTRAL_CEILING"])
        ceiling_reason = f"neutral: min(documented {round(base_ceiling)}, non-committal {round(CONST['NEUTRAL_CEILING'])})"

    # §11 refuse-to-rate floor — a decision that declines to rate cannot carry real conviction.
    if "insufficient" in (inp.decision or "").lower():
        dir_ceiling = min(dir_ceiling, CONST["INSUFFICIENT_CEILING"])
        ceiling_reason += f" ; §11 refuse-to-rate -> <= {round(CONST['INSUFFICIENT_CEILING'])}"

    # Penalties can ONLY subtract (floor each at >=0) — a sign-slipped downgrade must never upgrade.
    # _num0 coerces a nullable/None points or calibration_haircut to 0.0 so a decision_record fed in
    # verbatim (where these are nullable) never crashes the scorer.
    downgrade_pts = sum(max(0.0, _num0(d.get("points", 0))) for d in inp.downgrades) + max(0.0, _num0(inp.calibration_haircut))
    capped_understanding = min(ac, dir_ceiling)
    # Re-bound by the ceiling as well: penalties lower, they can never lift above the ceiling.
    conviction_raw = min(capped_understanding - downgrade_pts, dir_ceiling)
    hard_hi = CONST["HARD_MAX"] if inp.exceptional_evidence else CONST["SOFT_MAX"]
    conviction = round(_clamp(conviction_raw, 0.0, hard_hi), 1)

    warnings = []
    if unknown_keys:
        warnings.append(f"unrecognized modules_absent keys ignored: {unknown_keys} — an intended cap may be missing")
    # A proven edge on a Watchlist is "likely under-rated" ONLY when nothing else justifies staying neutral.
    # If a documented cap is binding (rating_cap_ceiling, critical governance, a module-absence cap, weak
    # catalyst, or thin data — any of which lowers base_ceiling below HARD_MAX), the Watchlist is a
    # deliberate §18/§24 cap, not an under-rating: a proven edge does not override a valuation/governance/
    # red-flag cap. Suppress the warning (and thus a false reconcile() PROVISIONAL) in that case.
    if direction == "neutral" and _isnum(inp.edge_score) and inp.edge_score >= 50 and inp.edge_proof_present \
            and "insufficient" not in (inp.decision or "").lower() and base_ceiling >= CONST["HARD_MAX"]:
        warnings.append("a proven edge (>=50) is recorded on a non-committal rating — likely under-rated; "
                        "per §7 a proven variant perception argues for at least a Starter, not a Watchlist")

    breakdown = {
        "analysis_confidence": ac,
        "analysis_confidence_build": (
            f"{CONST['AC_W_DATA_SUFFICIENCY']}*dataSuff({inp.data_sufficiency}) "
            f"+ {CONST['AC_W_CORROBORATION']}*corrob({inp.data_sufficiency if inp.corroboration is None else inp.corroboration}) "
            f"+ {CONST['AC_W_EVIDENCE_TIER']}*tier({inp.data_sufficiency if inp.evidence_tier is None else inp.evidence_tier}) "
            f"- stale({inp.staleness_penalty}) = {ac}"),
        "direction": direction,
        "documented_ceiling": round(base_ceiling, 1),
        "documented_ceiling_sources": documented,
        "unknown_absent_keys": unknown_keys,
        "direction_ceiling": round(dir_ceiling, 1),
        "direction_ceiling_reason": ceiling_reason,
        "understanding_capped_to_ceiling": round(capped_understanding, 1),
        "downgrades": inp.downgrades,
        "calibration_haircut": inp.calibration_haircut,
        "downgrade_points_total": downgrade_pts,
        "conviction_hard_max": hard_hi,
        "conviction": conviction,
        "formula": ("conviction = clamp( min( min(analysis_confidence, direction_ceiling) "
                    "- sum(max(0,downgrades)) - max(0,calibration_haircut), direction_ceiling ), 0, hard_max )"),
    }
    return {
        "analysis_confidence": ac,
        "conviction": conviction,
        "direction": direction,
        "sizing_hint": sizing_hint(inp.decision, conviction),
        "warnings": warnings,
        "confidence_breakdown": breakdown,
    }


def sizing_hint(decision: str, conviction: float) -> dict:
    """conviction + decision -> a plain action/size band (Step 4). Presentation only — the
    full model portfolio lives in /research:size; this is the quick tag on the score."""
    d = (decision or "").lower()
    if "insufficient" in d:
        return {"band": "none", "action": "no position — refuse to rate (§11)"}
    if "pair" in d or "hedge" in d:
        if conviction >= 60:
            return {"band": "hedge-on", "action": "construct the pair/hedge — size to the spread, not directional"}
        return {"band": "hedge-watch", "action": "hedge thesis noted — wait for the spread/trigger before constructing"}
    if "avoid" in d or "short" in d:
        if conviction >= 60:
            return {"band": "high", "action": "clear avoid / short candidate — do not own; exit if held"}
        return {"band": "low", "action": "lean avoid — monitor, no position"}
    if "buy" in d or "starter" in d:
        if conviction >= 75:
            return {"band": "full", "action": "full position candidate"}
        if conviction >= 60:
            return {"band": "standard", "action": "standard position"}
        if conviction >= 50:
            return {"band": "starter", "action": "starter position only"}
        return {"band": "tiny", "action": "tiny starter — mostly watchlist"}
    # Watchlist / other
    if conviction >= 55:
        return {"band": "starter-watch", "action": "monitor; starter only if margin of safety > 0"}
    return {"band": "watch", "action": "monitor only — no position"}


def reconcile(stated_confidence, inp: ConfidenceInputs, tol: Optional[float] = None) -> dict:
    """The Step-1 re-derivation gate (finish-gate pattern, #200, for confidence).

    Recompute `conviction` from the recorded inputs and flag if the thesis's stated
    confidence diverges by more than `tol` points. New runs set confidence_score ==
    computed conviction, so they match by construction; this catches arithmetic slips,
    wrong cap application, and anchoring. A run whose inputs surface unknown cap keys is
    flagged even if the number matches. Date-gate it in eval/finish-gate so old runs
    (which have no ConfidenceInputs) are N/A."""
    if tol is None:
        tol = CONST["RECONCILE_TOL"]
    r = compute(inp)
    computed = r["conviction"]
    if not _isnum(stated_confidence):
        return {"ok": False, "computed": computed, "stated": stated_confidence, "delta": None,
                "detail": f"stated confidence {stated_confidence!r} is not a number — PROVISIONAL"}
    delta = round(abs(float(stated_confidence) - computed), 1)
    ok = delta <= tol and not r["warnings"]
    if delta > tol:
        detail = (f"stated confidence {stated_confidence} != recomputed conviction {computed} "
                  f"(Δ{delta} > {tol}) — PROVISIONAL")
    elif r["warnings"]:
        detail = "number matches but inputs raised warnings: " + "; ".join(r["warnings"])
    else:
        detail = "within tolerance"
    return {"ok": ok, "computed": computed, "stated": stated_confidence, "delta": delta,
            "warnings": r["warnings"], "detail": detail}


if __name__ == "__main__":
    import json
    demo = ConfidenceInputs(
        data_sufficiency=80, corroboration=70, evidence_tier=85,
        edge_score=38, edge_proof_present=True, decision="Watchlist", expected_return_pct=17.7,
        rating_cap_ceiling=60,
        downgrades=[{"type": "macro_conditional", "points": 5, "reason": "Dubai property cycle"},
                    {"type": "single_variable", "points": 3, "reason": "Dubai demand sets all scenarios"}])
    print(json.dumps(compute(demo), indent=2))
