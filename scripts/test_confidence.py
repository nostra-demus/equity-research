#!/usr/bin/env python3
"""
Tests for scripts/confidence.py — the deterministic, direction-aware confidence scorer.

Asserts QUALITATIVE properties (ranges / orderings), not exact digits, because the numeric
weights in confidence.CONST are uncalibrated priors. The point is the *structure* and the
*safety invariants*. Section B is the adversarial regression suite — one test per real bug
the independent review surfaced (governance under-cap, refuse-to-rate floor, negative-
downgrade inflation, unknown-key drop, optimistic defaults, wrong catalyst cap, pair/hedge).

Run: python3 scripts/test_confidence.py   (exit 0 = all pass; also prints an archetype table)
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from confidence import (ConfidenceInputs, compute, reconcile, classify_direction, CONST,  # noqa: E402
                        MODULE_ABSENCE_CAP)

_fails = []
def check(name, cond, detail=""):
    print(f"  {'ok  ' if cond else 'FAIL'} {name}" + (f"  — {detail}" if detail and not cond else ""))
    if not cond:
        _fails.append(name)

def C(**kw):
    return compute(ConfidenceInputs(**kw))

# ---------------------------------------------------------------------------
# Archetypes — 5 committed runs + synthetics. (corroboration/tier estimated from each
# thesis; data_sufficiency/edge/decision are the real recorded values.)
# ---------------------------------------------------------------------------
ARCHETYPES = {
    "EMAR_07-10 (Watchlist,no edge,rich data)": ConfidenceInputs(
        data_sufficiency=80, corroboration=72, evidence_tier=85,
        edge_score=38, edge_proof_present=True, decision="Watchlist", expected_return_pct=17.7,
        rating_cap_ceiling=60,
        downgrades=[{"type":"macro_conditional","points":5}, {"type":"single_variable","points":3}]),
    "EMAR_07-03 (Starter,edge40,102% spread)": ConfidenceInputs(
        data_sufficiency=72, corroboration=52, evidence_tier=80,
        edge_score=40, edge_proof_present=True, decision="Starter Position Only", expected_return_pct=118.8,
        rating_cap_ceiling=60,
        downgrades=[{"type":"macro_conditional","points":5}, {"type":"single_variable","points":3}]),
    "HCG (Avoid, well-evidenced, no long edge)": ConfidenceInputs(
        data_sufficiency=69, corroboration=78, evidence_tier=80,
        edge_score=None, edge_proof_present=False, decision="Avoid", expected_return_pct=-13.4,
        downgrades=[{"type":"single_variable","points":4}]),
    "BG (Watchlist, commodity/policy)": ConfidenceInputs(
        data_sufficiency=68, corroboration=64, evidence_tier=70,
        edge_score=None, edge_proof_present=False, decision="Watchlist", expected_return_pct=-11.5,
        downgrades=[{"type":"macro_conditional","points":12}, {"type":"single_variable","points":5}]),
    "TMCV (Watchlist, Filter 4+6)": ConfidenceInputs(
        data_sufficiency=68, corroboration=66, evidence_tier=72,
        edge_score=None, edge_proof_present=False, decision="Watchlist", expected_return_pct=-4.4,
        rating_cap_ceiling=60, downgrades=[{"type":"specialist_conflict","points":10}]),
    "SYN high-edge Buy (edge75+proof)": ConfidenceInputs(
        data_sufficiency=88, corroboration=85, evidence_tier=88,
        edge_score=75, edge_proof_present=True, decision="Buy", expected_return_pct=45.0),
    "SYN thin-data (data 35)": ConfidenceInputs(
        data_sufficiency=35, corroboration=40, evidence_tier=45,
        decision="Insufficient Data — Refuse To Rate"),
    "SYN distress Avoid (well-evidenced)": ConfidenceInputs(
        data_sufficiency=74, corroboration=80, evidence_tier=82,
        decision="Avoid", expected_return_pct=-30.0, downgrades=[{"type":"single_variable","points":3}]),
    "SYN weak-evidence Short": ConfidenceInputs(
        data_sufficiency=45, corroboration=48, evidence_tier=50,
        edge_score=52, edge_proof_present=True, decision="Short Candidate",
        downgrades=[{"type":"specialist_conflict","points":12}]),
}
rows = {n: compute(i) for n, i in ARCHETYPES.items()}

print("=== ARCHETYPE TABLE ===")
print(f"  {'archetype':<44}{'dir':<9}{'AC':>5}{'conv':>6}   sizing")
for n, r in rows.items():
    print(f"  {n:<44}{r['direction']:<9}{r['analysis_confidence']:>5}{r['conviction']:>6}   {r['sizing_hint']['action'][:44]}")

print("\n=== A. STRUCTURAL ASSERTIONS ===")
emar10, emar03, hcg = rows["EMAR_07-10 (Watchlist,no edge,rich data)"], rows["EMAR_07-03 (Starter,edge40,102% spread)"], rows["HCG (Avoid, well-evidenced, no long edge)"]
buy, thin, short = rows["SYN high-edge Buy (edge75+proof)"], rows["SYN thin-data (data 35)"], rows["SYN weak-evidence Short"]

check("HCG conviction is HIGH (>=58), not edge-gated like a long", hcg["conviction"] >= 58, f"got {hcg['conviction']}")
check("HCG conviction beats a no-edge Watchlist (Emaar)", hcg["conviction"] > emar10["conviction"])
check("HCG analysis_confidence is HIGH despite a 'bad business'", hcg["analysis_confidence"] >= 65)
check("EMAR AC clearly exceeds conviction (understanding != conviction)", emar10["analysis_confidence"] - emar10["conviction"] >= 15)
check("EMAR conviction sits in the Toss-up band (45-60)", 45 <= emar10["conviction"] <= 60)
check("EMAR 07-10 better UNDERSTOOD than 07-03", emar10["analysis_confidence"] > emar03["analysis_confidence"])
check("no-edge long (Starter) conviction <= 60 (edge gate)", emar03["conviction"] <= 60)
check("high-edge Buy unlocks conviction above 60", buy["conviction"] > 60)
check("high-edge Buy is genuinely high-conviction (>=70)", buy["conviction"] >= 70)
check("thin-data analysis_confidence is low (<=45)", thin["analysis_confidence"] <= 45)
same = dict(data_sufficiency=75, corroboration=75, evidence_tier=80)
check("same evidence: Avoid out-convicts a no-edge Buy (edge gate is upside-only)",
      C(decision="Avoid", **same)["conviction"] > C(decision="Buy", **same)["conviction"])
check("that no-edge Buy is edge-gated (<=60)", C(decision="Buy", **same)["conviction"] <= 60)
check("weak-evidence Short: conviction <= analysis_confidence", short["conviction"] <= short["analysis_confidence"])

print("\n=== B. ADVERSARIAL REGRESSION (one per bug the review found) ===")

# B1 (HIGH) — a negative-points downgrade must NOT inflate conviction above the edge gate.
neg = C(data_sufficiency=85, corroboration=85, evidence_tier=85, edge_score=None,
        decision="Buy", downgrades=[{"type":"macro_conditional","points":-15}])
check("neg-downgrade: no-edge Buy stays edge-gated <=60 (not 75)", neg["conviction"] <= 60, f"got {neg['conviction']}")
neg_calib = C(data_sufficiency=85, decision="Buy", edge_score=None, calibration_haircut=-30)
check("neg calibration_haircut cannot upgrade past ceiling", neg_calib["conviction"] <= 60, f"got {neg_calib['conviction']}")

# B0 (universal invariant) — conviction NEVER exceeds the direction ceiling, for every case.
bad_inv = [n for n, r in list(rows.items()) + [("neg", neg), ("neg_calib", neg_calib)]
           if r["conviction"] > r["confidence_breakdown"]["direction_ceiling"] + 0.05]
check("INVARIANT: conviction <= direction_ceiling for ALL archetypes + adversarial cases", not bad_inv, f"violations: {bad_inv}")

# B2 — unresolved CRITICAL governance flag self-enforces the §18 Watchlist cap (60), no separate field needed.
cg = C(data_sufficiency=85, corroboration=85, evidence_tier=85, edge_score=70, edge_proof_present=True,
       decision="Buy", modules_absent=["governance"], critical_governance_unresolved=True)
check("critical-gov Buy is capped at 60 (§18), not 76", cg["conviction"] <= 60, f"got {cg['conviction']}")

# B3 — refuse-to-rate is floored near zero (<=20), even with contradictory high sub-scores.
ref = C(data_sufficiency=85, corroboration=80, evidence_tier=85, decision="Insufficient Data — Refuse To Rate")
check("refuse-to-rate conviction floored <=20 (§11)", ref["conviction"] <= 20, f"got {ref['conviction']}")
check("refuse-to-rate: an honest low stated number is NOT fought by the gate",
      reconcile(ref["conviction"], ConfidenceInputs(data_sufficiency=85, corroboration=80, evidence_tier=85,
                                                    decision="Insufficient Data — Refuse To Rate"))["ok"])

# B4 — unknown modules_absent key is SURFACED (not silently dropped); a case-slip is normalized.
unk = C(data_sufficiency=85, decision="Buy", modules_absent=["earnings"])   # 'earnings' is not a cap key
check("unknown modules_absent key is surfaced in warnings", len(unk["warnings"]) >= 1)
check("unknown modules_absent key listed in breakdown", unk["confidence_breakdown"]["unknown_absent_keys"] == ["earnings"])
caseslip = C(data_sufficiency=90, decision="Buy", modules_absent=["  Consensus "])  # normalizes -> consensus cap 55
check("case/space-slipped cap key still applies (normalized)", 55.0 in caseslip["confidence_breakdown"]["documented_ceiling_sources"])

# B5 — omitted sub-scores default to data_sufficiency (never optimistic 60).
lowd = C(data_sufficiency=10, decision="Avoid")   # corroboration/tier omitted
check("omitted sub-scores default to data_sufficiency (AC ~10, not ~35)", lowd["analysis_confidence"] <= 12, f"got {lowd['analysis_confidence']}")

# B6 — weak/vague catalyst timing caps at 70 (doctrine L895), not 75.
cw = C(data_sufficiency=95, corroboration=95, evidence_tier=95, edge_score=90, edge_proof_present=True,
       decision="Buy", catalyst_timing_weak=True)
check("catalyst_timing_weak cap is 70 (not 75)", 70.0 in cw["confidence_breakdown"]["documented_ceiling_sources"]
      and 75.0 not in cw["confidence_breakdown"]["documented_ceiling_sources"])

# B7 — Pair Trade / Hedge has its own sizing (not the Watchlist margin-of-safety framing) and is edge-gated.
pair = C(data_sufficiency=76, corroboration=72, evidence_tier=78, edge_score=60, edge_proof_present=True,
         decision="Pair Trade / Hedge Required")
check("Pair Trade direction = hedge", pair["direction"] == "hedge")
check("Pair Trade sizing is a hedge band (not watchlist MoS framing)", pair["sizing_hint"]["band"].startswith("hedge"))
check("Pair Trade (edge-gated) uses its proven edge", pair["conviction"] > 58)   # edge 60 lifts it past the neutral 58

# B8 — a proven edge on a non-committal Watchlist is SURFACED as a likely mis-rating.
wl_edge = C(data_sufficiency=80, corroboration=80, evidence_tier=80, edge_score=65, edge_proof_present=True,
            decision="Watchlist")
check("proven-edge-on-Watchlist raises a mis-rating warning", any("under-rated" in w for w in wl_edge["warnings"]))

# B9 (Codex #215 P1) — §11 data-sufficiency caps conviction. Expected values pinned to CLAUDE.md §11
# bands ("0-29 insufficient — refuse to rate", "30-49 weak — cap the opinion") and scripts/eval.py
# eval_y_data_sufficiency (INSUF_THRESHOLD=30, DATASUF_CONVICTION_FLOOR=50), NOT to current code.
# Pre-fix, an all-high-subscore Buy on ds=25 returned conviction 62.5 (a conviction position on
# refuse-to-rate data) and ds=40 returned 70 — both contradicting the §11 gate.
ds_thin = C(data_sufficiency=25, corroboration=100, evidence_tier=100, edge_score=100, edge_proof_present=True, decision="Buy")
check("§11: ds<30 caps conviction to refuse-to-rate band (<=20)", ds_thin["conviction"] <= 20, f"got {ds_thin['conviction']}")
ds_weak = C(data_sufficiency=40, corroboration=100, evidence_tier=100, edge_score=100, edge_proof_present=True, decision="Buy")
check("§11: 30<=ds<50 caps conviction below a conviction position (<=50)", ds_weak["conviction"] <= 50, f"got {ds_weak['conviction']}")
check("§11: ds cap shows in the ceiling sources", 20.0 in ds_thin["confidence_breakdown"]["documented_ceiling_sources"])

# B10 (Codex #215 P2) — a sign-slipped (negative) staleness_penalty must NOT inflate understanding.
# Pinned to the module's own stated invariant ("penalties can only LOWER"); pre-fix AC was 85 (raw 60 + 25).
neg_stale = C(data_sufficiency=60, corroboration=60, evidence_tier=60, staleness_penalty=-25, decision="Avoid")
check("neg staleness_penalty cannot inflate analysis_confidence (stays <=60)", neg_stale["analysis_confidence"] <= 60, f"got {neg_stale['analysis_confidence']}")

# B11 (Codex #215 P2) — a nullable calibration_haircut / staleness_penalty (null in the ledger = 'not
# applied') must be treated as 0, not crash the scorer. Pre-fix, float(None) raised TypeError.
try:
    nullh = C(data_sufficiency=60, decision="Avoid", calibration_haircut=None, staleness_penalty=None)
    check("null calibration_haircut/staleness_penalty scored (no TypeError)", isinstance(nullh["conviction"], (int, float)))
except Exception as e:
    check("null calibration_haircut/staleness_penalty scored (no TypeError)", False, f"raised {type(e).__name__}: {e}")

# B12 (Codex #215 P2) — a proven edge on a Watchlist that is HELD there by a documented cap is NOT an
# under-rating (§7 edge does not override a §18/§24 cap), so reconcile() must not mark it PROVISIONAL.
# But a proven edge on an UNCAPPED Watchlist (B8) must still warn — the fix is cap-conditional, not blanket.
capped_wl = ConfidenceInputs(data_sufficiency=80, corroboration=80, evidence_tier=80, edge_score=65,
                             edge_proof_present=True, decision="Watchlist", rating_cap_ceiling=60)
check("capped Watchlist + proven edge: no false under-rated warning", not any("under-rated" in w for w in compute(capped_wl)["warnings"]))
check("capped Watchlist + proven edge: reconcile is NOT PROVISIONAL", reconcile(compute(capped_wl)["conviction"], capped_wl)["ok"])

print("\n=== C. GATE, WEIGHTS, DIRECTION, CAP-BINDING ===")

# C1 — reconcile: real (non-self-referential) checks.
gi = ARCHETYPES["EMAR_07-10 (Watchlist,no edge,rich data)"]; gc = compute(gi)["conviction"]
check("reconcile: stated==computed passes", reconcile(gc, gi)["ok"])
check("reconcile: a 10-point divergence flags PROVISIONAL", not reconcile(gc + 10, gi)["ok"])
check("reconcile: non-numeric stated flags", not reconcile("52%", gi)["ok"])
check("reconcile: MUTATED inputs (heavier downgrade) shift computed, so old number now flags",
      not reconcile(gc, ConfidenceInputs(data_sufficiency=80, corroboration=72, evidence_tier=85, edge_score=38,
                                         edge_proof_present=True, decision="Watchlist", rating_cap_ceiling=60,
                                         downgrades=[{"type":"macro_conditional","points":25}]))["ok"])

# C2 — AC weights sum to 1.0 (auditability invariant).
check("AC weights sum to exactly 1.0",
      abs(CONST["AC_W_DATA_SUFFICIENCY"] + CONST["AC_W_CORROBORATION"] + CONST["AC_W_EVIDENCE_TIER"] - 1.0) < 1e-9)

# C3 — classify_direction over the FULL §18 decision set.
DIRS = {"Strong Buy":"long", "Buy":"long", "Starter Position Only":"long", "Watchlist":"neutral",
        "Avoid":"downside", "Short Candidate":"downside", "Pair Trade / Hedge Required":"hedge",
        "Insufficient Data — Refuse To Rate":"neutral"}
for dec, exp in DIRS.items():
    check(f"classify_direction({dec!r}) == {exp}", classify_direction(dec) == exp, f"got {classify_direction(dec)}")
check("Watchlist is neutral regardless of ER sign", classify_direction("Watchlist", -20) == classify_direction("Watchlist", 20) == "neutral")

# C4 — §18 soft-max 85 is BINDING (not just <=85), and exceptional lifts it.
sky = ConfidenceInputs(data_sufficiency=100, corroboration=100, evidence_tier=100, edge_score=100,
                       edge_proof_present=True, decision="Buy")
check("soft-max is BINDING: an all-100 Buy lands exactly at 85", compute(sky)["conviction"] == 85.0, f"got {compute(sky)['conviction']}")
sky.exceptional_evidence = True
check("exceptional_evidence lifts conviction above 85", compute(sky)["conviction"] > 85)

print()
if _fails:
    print(f"FAILED {len(_fails)}: " + "; ".join(_fails)); sys.exit(1)
print("ALL CONFIDENCE TESTS PASS")
