#!/usr/bin/env python3
"""Golden-fixture tests for scripts/calibrate.py — the calibration scoreboard's math and honesty.

Two jobs:
  1. Pin the pure statistics to KNOWN answers (Clopper-Pearson, Brier, Murphy identity, incomplete
     beta, e-value, effective-N) — a scoreboard the user bets money on must be exactly right.
  2. Exercise the floor-MET end-to-end path with in-memory review fixtures, proving that when the
     data DOES support a verdict the engine produces real numbers (and drops the 'Pre-data' prefix),
     and that below floor every skill metric is withheld.

Run: python3 scripts/test_calibrate.py   (exit 0 = all pass)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import calibrate as C  # noqa: E402

FAILS = []


def check(cond, msg):
    if not cond:
        FAILS.append(msg)
        print(f"  FAIL: {msg}")
    else:
        print(f"  ok  {msg}")


# ── 1. pure statistics against known answers ─────────────────────────────────────────────────────
def test_incomplete_beta():
    check(abs(C.betai(0.5, 1, 1) - 0.5) < 1e-10, "I_0.5(1,1) = 0.5")
    check(abs(C.betai(0.3, 1, 1) - 0.3) < 1e-10, "I_0.3(1,1) = 0.3 (uniform CDF)")
    check(abs(C.betai(0.5, 2, 2) - 0.5) < 1e-10, "I_0.5(2,2) = 0.5 (symmetric)")
    check(abs(C.betai(0.5, 2, 5) - (1 - C.betai(0.5, 5, 2))) < 1e-10, "beta symmetry I_x(a,b)=1-I_{1-x}(b,a)")
    check(abs(C.beta_ppf(C.betai(0.42, 3, 7), 3, 7) - 0.42) < 1e-8, "beta_ppf inverts betai")


def test_clopper_pearson():
    # closed forms: k=0 → hi = 1-(α/2)^(1/n); k=n → lo = (α/2)^(1/n)
    lo, hi = C.clopper_pearson(0, 10, 0.05)
    check(lo == 0.0, "CP(0,10) lower = 0")
    check(abs(hi - (1 - 0.025 ** 0.1)) < 1e-4, f"CP(0,10) upper ≈ 0.3085 (got {hi})")
    lo, hi = C.clopper_pearson(10, 10, 0.05)
    check(hi == 1.0, "CP(10,10) upper = 1")
    check(abs(lo - 0.025 ** 0.1) < 1e-4, f"CP(10,10) lower ≈ 0.6915 (got {lo})")
    # textbook interior value
    lo, hi = C.clopper_pearson(7, 10, 0.05)
    check(abs(lo - 0.3475) < 1e-3 and abs(hi - 0.9333) < 1e-3, f"CP(7,10) ≈ [0.3475, 0.9333] (got [{lo}, {hi}])")
    # a wider n narrows the interval
    lo1, hi1 = C.clopper_pearson(70, 100, 0.05)
    check((hi1 - lo1) < (hi - lo), "CP interval narrows as n grows (70/100 tighter than 7/10)")


def test_brier_and_murphy():
    check(C.brier([(0.5, 0), (0.5, 1)]) == 0.25, "Brier of two coin-flip guesses = 0.25")
    check(C.brier([(1.0, 1), (0.0, 0)]) == 0.0, "Brier of two perfect calls = 0")
    check(C.brier([(1.0, 0), (0.0, 1)]) == 1.0, "Brier of two maximally-wrong calls = 1")
    # Murphy identity: brier = reliability - resolution + uncertainty (residual ≈ 0 when bins align)
    pairs = [(0.9, 1)] * 3 + [(0.1, 0)] * 3
    m = C.murphy_decomposition(pairs)
    check(abs(m["decomposition_residual"]) < 1e-9, f"Murphy identity holds (residual {m['decomposition_residual']})")
    check(abs(m["uncertainty"] - 0.25) < 1e-9, "uncertainty = base(1-base) = 0.25 at base rate 0.5")
    check(m["resolution"] > 0.2, "sharp, correct calls have high resolution")
    check(m["reliability"] < 0.02, "well-calibrated calls have low reliability term")


def test_e_value():
    check(C.e_value_hit_rate(5, 10) < 2.0, "5/10 (coin flip) → e-value near/below 1")
    check(C.e_value_hit_rate(9, 10) > C.e_value_hit_rate(6, 10) > C.e_value_hit_rate(5, 10), "e-value monotone in hits")
    check(C.e_value_hit_rate(20, 20) >= 20, "20/20 crosses the 1/α=20 skill threshold")
    check(C.e_value_hit_rate(3, 10) < 1.0, "3/10 (below coin) → e-value < 1 (data favor no-skill)")


def test_effective_n():
    en = C.effective_n([6, 6, 5])
    check(en["n_raw"] == 17, "raw N sums the clusters")
    check(en["effective_n"] == 3, "effective N = distinct clusters (conservative)")
    check(en["effective_n"] < en["n_raw"], "effective N never inflates significance above raw")


def test_months_to_significance_honesty():
    check(C.months_to_significance(1, 1, 1.0)["projectable"] is False, "N=1 → not projectable (noise, not a rate)")
    check(C.months_to_significance(3, 4, 1.0)["projectable"] is False, "N<5 → not projectable")
    check(C.months_to_significance(3, 6, 1.0)["projectable"] is False, "at/below coin (50%) → no edge to power")
    # a modest edge not yet significant → projects a positive, finite horizon
    proj = C.months_to_significance(13, 20, 2.0)
    check(proj["projectable"] and not proj.get("already_significant") and proj["months_to_significance"] > 0,
          "modest edge (13/20) not yet significant → finite positive horizon")
    # an edge that already clears the bar → 0 months, flagged 'already_significant'
    now = C.months_to_significance(90, 100, 3.0)
    check(now["projectable"] and now.get("already_significant") and now["months_to_significance"] == 0.0,
          "strong edge already past 1/α → 0 months, flagged already_significant")
    # a lopsided handful crosses the e-value but is BELOW the N=10 floor → NOT already-significant
    below = C.months_to_significance(7, 7, 1.5)
    check(below["projectable"] and not below.get("already_significant") and below["months_to_significance"] > 0,
          "7/7 crosses e-value but < N floor → not 'already significant', projects more bets (honesty fix)")
    # too short a review span → not projectable (an inflated arrival rate understates time-to-verdict)
    check(C.months_to_significance(6, 8, 0.3)["projectable"] is False, "span < 1 month → not projectable")


def test_forecast_join_never_misscores():
    # Bug-1 guard: forecast_results is a re-ordered SUBSET; a text mismatch must EXCLUDE, never index-join
    rec = {"forecast_ledger": [{"prediction": "EPS up", "probability": 90, "owner_module": "earnings"},
                               {"prediction": "Margin down", "probability": 80, "owner_module": "earnings"},
                               {"prediction": "Debt rises", "probability": 20, "owner_module": "balance-sheet"}]}
    # a REWORDED debt call as forecast_results[0] — the old index fallback would score it at prob 0.90
    reworded = [{"forecast_results": [{"prediction": "Debt will rise materially", "status": "confirmed"}]}]
    check(C.match_resolved_forecasts(rec, reworded) == [], "reworded prediction → excluded, NOT index-joined to prob 0.90")
    # an EXACT text match scores against the RIGHT probability (0.20), regardless of position
    exact = [{"forecast_results": [{"prediction": "Debt rises", "status": "confirmed"}]}]
    got = C.match_resolved_forecasts(rec, exact)
    check(len(got) == 1 and got[0]["prob"] == 0.20 and got[0]["owner_module"] == "balance-sheet",
          "exact match → scored against its own probability and module")


def test_fraction_slip_excluded():
    # Bug-3 guard: a decimal fraction that slipped the errata layer must be EXCLUDED, not read as 0.8%
    rec = {"forecast_ledger": [{"prediction": "a", "probability": 0.8, "owner_module": "earnings"}]}
    reviews = [{"forecast_results": [{"prediction": "a", "status": "confirmed"}]}]
    check(C.match_resolved_forecasts(rec, reviews) == [], "probability 0.8 (mis-scaled fraction) → excluded, not scored as 0.008")


def test_effective_n_clusters_by_ticker():
    # Bug-5 guard: two RUNS of the same ticker are ONE correlated cluster, not two independent bets
    standing, reviews_by_run = [], {}
    for run in ("DUP_2026-05-01", "DUP_2026-06-01"):  # same ticker, two runs
        rr = f"analyses/{run}"
        standing.append({"run_root": rr, "record": {
            "ticker": "DUP", "decision": "Buy", "decision_date": run[-10:], "basket": "Selected",
            "forecast_ledger": [{"prediction": f"p-{run}", "probability": 80, "owner_module": "earnings"}]}})
        reviews_by_run[rr] = [{"forecast_results": [{"prediction": f"p-{run}", "status": "confirmed"}]}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews_by_run.get(r, []))
    es = out["effective_sample"]
    check(es["n_raw"] == 2 and es["n_clusters"] == 1 and es["effective_n"] == 1,
          f"two runs of one ticker → n_raw 2 but effective_n 1 (got raw={es['n_raw']}, clusters={es['n_clusters']})")


# ── 2. end-to-end assembly (in-memory review fixtures — no repo pollution) ────────────────────────
def _selected(i, prob, realized_status, rel_return):
    """A Selected decision i with one resolved forecast and a review carrying a benchmark-relative return."""
    rec = {"run_root": f"analyses/SEL{i}_2026-06-01", "record": {
        "ticker": f"SEL{i}", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "confidence_score": 70, "data_sufficiency_score": 75,
        "forecast_ledger": [{"prediction": f"pred-{i}", "probability": prob, "owner_module": "earnings",
                             "forecast_type": "earnings_eps"}]}}
    review = {"schema_version": "1.0", "ticker": f"SEL{i}", "review_date": "2026-07-01", "review_window": "30d",
              "basket": "Selected", "benchmark_relative_return_pct": rel_return,
              "forecast_results": [{"prediction": f"pred-{i}", "status": realized_status}]}
    return rec, review


def _rejected(i, rel_return):
    rec = {"run_root": f"analyses/REJ{i}_2026-06-01", "record": {
        "ticker": f"REJ{i}", "decision": "Avoid", "decision_date": "2026-06-01", "basket": "Rejected",
        "confidence_score": 65, "data_sufficiency_score": 70, "forecast_ledger": []}}
    review = {"schema_version": "1.0", "ticker": f"REJ{i}", "review_date": "2026-07-01", "review_window": "30d",
              "basket": "Rejected", "benchmark_relative_return_pct": rel_return, "forecast_results": []}
    return rec, review


def test_end_to_end_floor_met():
    standing, reviews_by_run = [], {}
    # 12 Selected: 10 forecasts confirmed at 80% prob (well-calibrated-ish), all beat benchmark (+rel)
    for i in range(12):
        status = "confirmed" if i < 10 else "falsified"
        rel = 4.0 if i < 9 else -2.0  # 9 of 12 Selected beat the benchmark
        rec, rev = _selected(i, 80, status, rel)
        standing.append(rec)
        reviews_by_run[rec["run_root"]] = [rev]
    # 6 Rejected that correctly underperformed (negative benchmark-relative → a directional hit)
    for i in range(6):
        rec, rev = _rejected(i, -3.0)
        standing.append(rec)
        reviews_by_run[rec["run_root"]] = [rev]

    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda rr: reviews_by_run.get(rr, []))

    check(not out["verdict"].startswith("Pre-data"), "floors met → verdict is NOT 'Pre-data'")
    check(out["n_resolved_forecasts"] == 12, f"12 forecasts resolved (got {out['n_resolved_forecasts']})")
    check(isinstance(out["calibration"], dict) and out["calibration"]["brier"] is not None, "Brier computed above floor")
    check(out["n_directional_calls_resolved"] == 18, f"18 directional calls (12 Selected + 6 Rejected) (got {out['n_directional_calls_resolved']})")
    # directional hits: 9 Selected beat + 6 Rejected underperformed = 15 of 18
    check(out["hit_rate"] is not None, "hit rate computed above the directional floor")
    check(abs(out["hit_rate"] - round(15 / 18, 4)) < 1e-9, f"hit rate = 15/18 ≈ 0.8333 (got {out['hit_rate']})")
    check(out["hit_rate_ci95"] is not None and out["hit_rate_ci95"][0] < out["hit_rate"] < out["hit_rate_ci95"][1],
          "point estimate sits inside its own 95% CI")
    check(out["sequential_test"]["e_value"] is not None, "sequential e-value present")
    check("earnings_eps" in out["calibration_by_forecast_type"], "forecast_type slice keyed by the exact value")
    check("earnings" in out["calibration_by_module"], "module slice keyed by owner_module")


def test_probability_scale():
    # the ledger is 0-100; probability=1 means 1% (=0.01), NOT 100% — never re-guess "is it a fraction?"
    # the valid endpoints 0 (==0%) and 100 (==100%) are degenerate but scorable and must be KEPT.
    rec = {"forecast_ledger": [{"prediction": "a", "probability": 1, "owner_module": "earnings"},
                               {"prediction": "b", "probability": 100, "owner_module": "earnings"},
                               {"prediction": "c", "probability": 75, "owner_module": "earnings"},
                               {"prediction": "d", "probability": 0, "owner_module": "earnings"}]}
    reviews = [{"forecast_results": [{"prediction": "a", "status": "confirmed"},
                                     {"prediction": "b", "status": "confirmed"},
                                     {"prediction": "c", "status": "falsified"},
                                     {"prediction": "d", "status": "falsified"}]}]
    pairs = C.match_resolved_forecasts(rec, reviews)
    probs = sorted(pp["prob"] for pp in pairs)
    check(probs == [0.0, 0.01, 0.75, 1.0], f"probability 0/1/75/100 → 0.0/0.01/0.75/1.0, endpoints kept (got {probs})")


def test_below_floor_withholds():
    standing = [{"run_root": "analyses/ONE_2026-06-01", "record": {
        "ticker": "ONE", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "confidence_score": 60, "forecast_ledger": []}}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda rr: [])
    check(out["verdict"].startswith("Pre-data"), "young ledger → 'Pre-data' verdict (Phase-6 prefix preserved)")
    check(out["hit_rate"] is None and out["calibration_by_module"] == {}, "all skill metrics withheld below floor")
    check(isinstance(out["error_taxonomy_distribution"], dict), "flat tallies always present (even at N=0)")


def main():
    print("test_calibrate.py")
    for fn in (test_incomplete_beta, test_clopper_pearson, test_brier_and_murphy, test_e_value,
               test_effective_n, test_months_to_significance_honesty, test_forecast_join_never_misscores,
               test_fraction_slip_excluded, test_effective_n_clusters_by_ticker, test_end_to_end_floor_met,
               test_probability_scale, test_below_floor_withholds):
        print(f"[{fn.__name__}]")
        fn()
    print()
    if FAILS:
        print(f"FAILED — {len(FAILS)} check(s)")
        return 1
    print("ALL PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
