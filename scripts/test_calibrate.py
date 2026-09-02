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
import uuid

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
def _selected(i, prob, realized_status, rel_return, thesis_type=None):
    """A Selected decision i with one resolved forecast and a review carrying a benchmark-relative return.
    thesis_type (optional): the record's CLAUDE.md §14 thesis_type[] list; omitted → record carries no
    thesis_type field at all (the untagged case)."""
    rec = {"run_root": f"analyses/SEL{i}_2026-06-01", "record": {
        "ticker": f"SEL{i}", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "confidence_score": 70, "data_sufficiency_score": 75,
        "forecast_ledger": [{"prediction": f"pred-{i}", "probability": prob, "owner_module": "earnings",
                             "forecast_type": "earnings_eps"}]}}
    if thesis_type is not None:
        rec["record"]["thesis_type"] = thesis_type
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


def _execution_provenance(provider, *, mode="single_provider", attribution="recorded", contributors=None):
    """Canonical runtime projection fixture; malformed variants are created explicitly in tests."""
    profile = f"{provider}|{provider}-parent:max|{provider}-specialist:xhigh"
    author_contributor = {
        "provider": provider,
        "model": f"{provider}-parent",
        "reasoning_level": "max",
        "attribution": attribution,
        "scopes": ["terminal_adjudication"],
    }
    rows = contributors if contributors is not None else [
        author_contributor,
        {
            "provider": provider,
            "model": f"{provider}-specialist",
            "reasoning_level": "xhigh",
            "attribution": "configured",
            "scopes": ["specialists"],
        },
    ]
    rows = sorted(rows, key=lambda item: (
        item["provider"], item.get("model") or "", item.get("reasoning_level") or "",
        item["attribution"],
    ))
    return {
        "schema_version": "1.0",
        "source": "cockpit_runtime",
        "coverage": "cockpit_top_level_processes",
        "provider_mode": mode,
        "profile_key": profile if mode != "mixed_provider" else f"mixed|claude|codex|{profile}",
        "decision_author": {
            "attempt_id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"nostra-calibration:{provider}:{mode}")),
            "provider": provider,
            "model": f"{provider}-parent",
            "reasoning_level": "max",
            "attribution": attribution,
        },
        "contributors": rows,
        "cli_versions": {provider: "fixture"},
    }


def _provider_run(provider, i, *, mode="single_provider", attribution="recorded", contributors=None,
                  error_tag=None):
    ticker = f"{provider[:2].upper()}{i:02d}"
    run_root = f"analyses/{ticker}_2026-06-01"
    prediction = f"{ticker} forecast"
    record = {
        "ticker": ticker,
        "decision": "Buy",
        "decision_date": "2026-06-01",
        "basket": "Selected",
        "forecast_ledger": [{
            "prediction": prediction,
            "probability": 80,
            "owner_module": "earnings",
            "forecast_type": "earnings_eps",
        }],
        "execution_provenance": _execution_provenance(
            provider, mode=mode, attribution=attribution, contributors=contributors),
    }
    review = {
        "review_date": "2026-07-01",
        "review_window": "30d",
        "benchmark_relative_return_pct": 4.0,
        "forecast_results": [{"prediction": prediction, "status": "confirmed"}],
        "error_taxonomy": [error_tag] if error_tag else [],
    }
    return {"run_root": run_root, "record": record}, review


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


def test_all_reviews_tallied():
    # Bug-7 guard: error-taxonomy + pre-mortem tallies aggregate across EVERY review, not just the latest
    rr = "analyses/MULTI_2026-06-01"
    standing = [{"run_root": rr, "record": {
        "ticker": "MULTI", "decision": "Watchlist", "decision_date": "2026-06-01", "basket": "Watchlist",
        "forecast_ledger": []}}]
    reviews = [
        {"review_window": "30d", "error_taxonomy": ["timing error"],
         "pre_mortem_check": {"outcome_vs_verdict": "vindicated"}},
        {"review_window": "90d", "error_taxonomy": ["bad base rate"],
         "pre_mortem_check": {"outcome_vs_verdict": "too_early"}},
    ]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)
    et = out["error_taxonomy_distribution"]
    check(et.get("timing error") == 1 and et.get("bad base rate") == 1,
          f"both reviews' error tags counted, not just the latest (got {et})")
    pod = out["pre_mortem_calibration"]["outcome_distribution"]
    check(pod["vindicated"] == 1 and pod["too_early"] == 1, "both reviews' pre-mortem outcomes counted")


def test_false_comfort_named():
    # Bug-8 guard: a false_comfort case is kept WITH its ticker/run, not just counted
    rr = "analyses/FC_2026-06-01"
    standing = [{"run_root": rr, "record": {
        "ticker": "FC", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "forecast_ledger": []}}]
    reviews = [{"review_window": "90d",
                "pre_mortem_check": {"outcome_vs_verdict": "contradicted", "contradiction_kind": "false_comfort"}}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)
    cases = out["pre_mortem_calibration"]["false_comfort_cases"]
    check(len(cases) == 1 and cases[0]["ticker"] == "FC" and cases[0]["window"] == "90d",
          f"false_comfort case named by ticker/window, not just counted (got {cases})")


def test_brier_ready_not_reported_withheld():
    # Bug-5 guard: ≥10 resolved forecasts but 0 directional calls → Brier IS computed; the honesty
    # statement must report it, not falsely claim every metric is withheld
    standing, reviews_by_run = [], {}
    for i in range(11):  # 11 Watchlist runs, each with one resolved forecast, no directional bet
        rr = f"analyses/W{i}_2026-06-01"
        standing.append({"run_root": rr, "record": {
            "ticker": f"W{i}", "decision": "Watchlist", "decision_date": "2026-06-01", "basket": "Watchlist",
            "forecast_ledger": [{"prediction": f"p{i}", "probability": 60, "owner_module": "earnings"}]}})
        reviews_by_run[rr] = [{"forecast_results": [{"prediction": f"p{i}", "status": "confirmed"}]}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews_by_run.get(r, []))
    check(isinstance(out["calibration"], dict) and out["calibration"]["brier"] is not None, "Brier computed (11 ≥ floor)")
    check(out["hit_rate"] is None, "hit rate still withheld (0 directional calls)")
    check("Brier calibration IS available" in out["honesty_statement"],
          f"honesty reports the Brier signal, not 'everything withheld' (got: {out['honesty_statement'][:80]})")


def test_scoped_output_isolated():
    # Bug-6 guard: a scoped (single-ticker) run must NOT land on the global Phase-6 glob pattern
    import os, tempfile
    standing = [{"run_root": "analyses/AAA_2026-06-01", "record": {
        "ticker": "AAA", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}]
    saved = C.PERF_DIR
    try:
        with tempfile.TemporaryDirectory() as td:
            C.PERF_DIR = td
            scoped = C.build(scope="AAA", standing=standing, today="2026-07-18", reviews_provider=lambda r: [])
            jpath, _ = C.write_outputs(scoped)
            check("/scoped/" in jpath.replace(os.sep, "/"),
                  f"scoped run writes under scoped/, not the global feed (got {jpath})")
            check(not jpath.endswith(os.path.join(td, "2026-07-18_calibration_summary.json")),
                  "scoped run does NOT occupy the global <date>_calibration_summary.json name")
            allrun = C.build(scope="all", standing=standing, today="2026-07-18", reviews_provider=lambda r: [])
            jpath2, _ = C.write_outputs(allrun)
            check(jpath2 == os.path.join(td, "2026-07-18_calibration_summary.json"),
                  "an all-ledger run keeps the global name the Phase-6 glob reads")
    finally:
        C.PERF_DIR = saved


def test_expired_is_a_settled_miss():
    # Codex #4: an expired forecast (window elapsed, event didn't happen) is realized 0, not unresolved
    check(C._realized("expired") == 0, "'expired' → 0 (a settled timeout miss, not dropped)")
    check(C._realized("lapsed") == 0, "'lapsed' → 0")
    check(C._realized("expired unresolved") is None, "'expired unresolved' stays None (genuinely undetermined)")
    check(C._realized("still open") is None and C._realized("confirmed") == 1, "open/confirmed unchanged")


def test_tracking_price_return_recovered():
    # Codex #2: a null-entry review fills absolute + benchmark but not the entry-derived relative;
    # the tracking-price flow must still produce a benchmark-relative return (BG's whole point)
    rev = {"benchmark_relative_return_pct": None, "absolute_return_pct": 8.0, "benchmark_return_pct": 3.0}
    check(C._review_rel(rev) == 5.0, "tracking-price review → rel = absolute − benchmark = 5.0")
    # and it drives a directional hit for a long that beat its benchmark
    check(C.directional_hit({"basket": "Selected", "decision": "Buy"}, rev) == 1,
          "null-entry Selected long that beat its benchmark → a scored HIT (not dropped)")
    # a stated benchmark-relative still wins when present
    check(C._review_rel({"benchmark_relative_return_pct": -2.0, "absolute_return_pct": 8.0, "benchmark_return_pct": 3.0}) == -2.0,
          "an explicit benchmark_relative_return_pct takes precedence over the derived one")


def test_effective_n_counts_directional_only_runs():
    # Codex #3: a run that resolves a DIRECTIONAL hit but has no forecast pairs must still contribute to
    # effective_sample — else the script could declare a hit rate while reporting effective_n = 0
    rr = "analyses/DIRONLY_2026-06-01"
    standing = [{"run_root": rr, "record": {
        "ticker": "DIRONLY", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "forecast_ledger": []}}]  # NO forecasts → no Brier pairs
    reviews = [{"benchmark_relative_return_pct": 4.0}]  # but a directional return resolves
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)
    es = out["effective_sample"]
    check(es["n_raw"] == 1 and es["n_clusters"] == 1,
          f"a directional-only run contributes to effective_sample (got raw={es['n_raw']}, clusters={es['n_clusters']})")


def test_reviews_sort_by_horizon_not_text():
    # Codex #7: same-day windows must order by DURATION — a 90d review must not supersede a same-day 365d
    check(C._window_rank("365d") > C._window_rank("180d") > C._window_rank("90d") > C._window_rank("30d"),
          "window rank is monotone in duration, not lexicographic")
    revs = [{"review_date": "2026-07-01", "review_window": "365d"},
            {"review_date": "2026-07-01", "review_window": "90d"}]
    ordered = sorted(revs, key=lambda r: (r["review_date"], C._window_rank(r["review_window"])))
    check(C.latest_review(ordered)["review_window"] == "365d",
          "the most mature same-day horizon (365d) is 'latest', not the lexicographically-largest '90d'")


def test_explicit_reference_join():
    # Codex r3 #5: an explicit reference (forecast_index or 'forecast #N') is honoured — but never the
    # positional index of the results array (which would mis-score, the round-1 bug)
    rec = {"forecast_ledger": [{"prediction": "EPS up", "probability": 90, "owner_module": "earnings"},
                               {"prediction": "Margin down", "probability": 30, "owner_module": "earnings"}]}
    by_field = [{"forecast_results": [{"prediction": "see ledger", "forecast_index": 2, "status": "confirmed"}]}]
    got = C.match_resolved_forecasts(rec, by_field)
    check(len(got) == 1 and got[0]["prob"] == 0.30, "forecast_index=2 → scored against ledger entry 2 (0.30)")
    by_text_ref = [{"forecast_results": [{"prediction": "forecast #1", "status": "falsified"}]}]
    got2 = C.match_resolved_forecasts(rec, by_text_ref)
    check(len(got2) == 1 and got2[0]["prob"] == 0.90, "'forecast #1' → scored against ledger entry 1 (0.90)")
    # a plain unmatchable text with NO reference is still excluded (no positional guess)
    check(C.match_resolved_forecasts(rec, [{"forecast_results": [{"prediction": "totally unrelated", "status": "confirmed"}]}]) == [],
          "an unreferenced, unmatchable prediction is excluded, not positionally guessed")


def test_review_version_numeric_sort():
    # Codex r3 #6: _v10 must sort AFTER _v2 (numeric), not lexicographically
    check(C._review_version("x_v10.json") == 10 and C._review_version("x_v2.json") == 2, "version parsed as int")
    check(C._review_version("x.json") == 1, "unversioned → 1")
    paths = ["a_v2.json", "a_v10.json", "a.json"]
    latest = max(paths, key=C._review_version)
    check(latest == "a_v10.json", "_v10 is the highest version, not lexicographically-smallest")


def test_malformed_slice_key_does_not_crash():
    # Codex r3 #7: a malformed truthy owner_module (a list) must not raise 'unhashable type' in _slice
    check(C._slice_key(["earnings"]) == "untagged" and C._slice_key({"m": 1}) == "untagged",
          "non-string owner_module coerced to 'untagged' (hashable)")
    check(C._slice_key("earnings") == "earnings" and C._slice_key("") == "untagged", "valid string kept; empty → untagged")
    rec = {"forecast_ledger": [{"prediction": "p", "probability": 60, "owner_module": ["earnings"]}]}
    reviews = [{"forecast_results": [{"prediction": "p", "status": "confirmed"}]}]
    got = C.match_resolved_forecasts(rec, reviews)  # must not raise
    check(got and got[0]["owner_module"] == "untagged", "a list owner_module becomes 'untagged', calibration does not crash")


def test_sector_relative_not_a_benchmark_hit():
    # Codex r4 #3: a sector-relative return must NOT be scored as a benchmark hit (different baseline)
    check(C._review_rel({"sector_relative_return_pct": 5.0}) is None,
          "sector-relative alone → None (not a benchmark-relative return)")
    check(C.directional_hit({"basket": "Selected", "decision": "Buy"}, {"sector_relative_return_pct": 5.0}) is None,
          "a review with only a sector-relative return is not a benchmark directional hit")
    check(C._review_rel({"benchmark_relative_return_pct": 3.0, "sector_relative_return_pct": -9.0}) == 3.0,
          "benchmark-relative still used when present")


def test_insufficient_data_basket_not_scored():
    # Codex r4 #4: a Buy capped to 'Insufficient Data' must NOT be resurrected as a long
    check(C.directional_hit({"basket": "Selected", "decision": "Buy", "post_mortem_basket": "Insufficient Data"},
                            {"benchmark_relative_return_pct": 4.0}) is None,
          "post_mortem_basket 'Insufficient Data' → not a directional bet (decision must not resurrect it)")
    check(C.directional_hit({"basket": "Insufficient", "decision": "Avoid"},
                            {"benchmark_relative_return_pct": -4.0}) is None,
          "'Insufficient' basket → not scored either")


def test_latest_priced_review_for_returns():
    # Codex r4 #2: a later un-priced post-mortem must not erase an earlier priced review for return scoring
    reviews = [{"review_date": "2026-07-01", "review_window": "30d", "benchmark_relative_return_pct": 6.0},
               {"review_date": "2026-08-01", "review_window": "post-mortem", "benchmark_relative_return_pct": None}]
    check(C.latest_review(reviews)["review_window"] == "post-mortem", "latest overall is the post-mortem")
    check(C.latest_priced_review(reviews)["review_window"] == "30d", "latest PRICED is the 30d review")
    rr = "analyses/PR_2026-06-01"
    standing = [{"run_root": rr, "record": {
        "ticker": "PR", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)
    hit = next((row["directional_hit"] for row in out["inventory"] if row["ticker"] == "PR"), "missing")
    check(hit == 1, f"the priced 30d review's +6% is scored as a hit, not dropped by the null post-mortem (got {hit})")


def test_flat_tallies_dedup_corrected_versions():
    # Codex r4 #5: a _v2 correction of a review must not be counted alongside its stale _v1
    revs = [{"review_date": "2026-07-01", "review_window": "30d", "_version": 1, "error_taxonomy": ["bad math"]},
            {"review_date": "2026-07-01", "review_window": "30d", "_version": 2, "error_taxonomy": ["stale data"]}]
    standing = C.standing_reviews(revs)
    check(len(standing) == 1 and standing[0]["_version"] == 2, "only the highest-version review per (date,window) survives")
    rr = "analyses/DV_2026-06-01"
    st = [{"run_root": rr, "record": {"ticker": "DV", "decision": "Watchlist", "decision_date": "2026-06-01",
                                      "basket": "Watchlist", "forecast_ledger": []}}]
    out = C.build(standing=st, today="2026-07-18", reviews_provider=lambda r: revs)
    et = out["error_taxonomy_distribution"]
    check(et.get("stale data") == 1 and "bad math" not in et,
          f"the corrected tag counts once; the superseded _v1 tag is not double-counted (got {et})")


def test_output_json_is_strict_even_with_nan():
    # Codex r4 #6: a non-finite value in the output is sanitized to None; the JSON is strict-standard
    check(C._finite_only(float("nan")) is None and C._finite_only(float("inf")) is None, "NaN/inf → None")
    check(C._finite_only({"a": float("-inf"), "b": [1.0, float("nan")]}) == {"a": None, "b": [1.0, None]},
          "sanitizer recurses into dicts/lists")
    check(C._finite_only(1e308) == 1e308, "the finite e-value sentinel is kept")
    import os, tempfile, json as _json
    standing = [{"run_root": "analyses/NANX_2026-06-01", "record": {
        "ticker": "NANX", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}]
    saved = C.PERF_DIR
    try:
        with tempfile.TemporaryDirectory() as td:
            C.PERF_DIR = td
            out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: [])
            out["_injected_nan"] = float("nan")  # simulate a propagated non-finite value
            jpath, _ = C.write_outputs(out)
            _json.load(open(jpath), parse_constant=lambda x: (_ for _ in ()).throw(ValueError(f"non-strict: {x}")))
    finally:
        C.PERF_DIR = saved
    check(True, "write_outputs produces strict JSON even when the summary carries a NaN")


def test_non_finite_inputs_excluded():
    # Codex r5 #1/#3: NaN/inf probabilities and review returns must be excluded, not slip through as
    # garbage-scored rows (NaN defeats every range/comparison check)
    check(C._finite_num(float("nan")) is None and C._finite_num(float("inf")) is None, "_finite_num rejects NaN/inf")
    check(C._finite_num(True) is None and C._finite_num("x") is None, "_finite_num rejects bool/non-number")
    check(C._finite_num(42) == 42.0, "_finite_num keeps a real number")
    rec = {"forecast_ledger": [{"prediction": "p", "probability": float("nan"), "owner_module": "earnings"}]}
    check(C.match_resolved_forecasts(rec, [{"forecast_results": [{"prediction": "p", "status": "confirmed"}]}]) == [],
          "a NaN probability forecast is excluded from the Brier sample")
    check(C.directional_hit({"basket": "Selected", "decision": "Buy"},
                            {"benchmark_relative_return_pct": float("inf")}) is None,
          "a non-finite review return is not scored as a directional hit")


def test_short_basket_cohort_inverted():
    # Codex r5 #2: a profitable short (underlying underperformed) must show a POSITIVE cohort mean
    standing, reviews_by_run = [], {}
    for i in range(5):
        rr = f"analyses/SH{i}_2026-06-01"
        standing.append({"run_root": rr, "record": {
            "ticker": f"SH{i}", "decision": "Short Candidate", "decision_date": "2026-06-01",
            "basket": "Short", "forecast_ledger": []}})
        reviews_by_run[rr] = [{"benchmark_relative_return_pct": -4.0}]  # underlying lagged → short made money
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews_by_run.get(r, []))
    short = out["cohort_returns"].get("Short")
    check(isinstance(short, dict) and short["mean_benchmark_relative_pct"] == 4.0,
          f"a profitable short basket reports a POSITIVE cohort mean (+4), not the raw −4 (got {short})")


def test_malformed_error_tag_skipped():
    # Codex r5 #5: a malformed error_taxonomy entry ({"tag": [...]}) must be skipped, not crash the write
    rr = "analyses/BADTAG_2026-06-01"
    standing = [{"run_root": rr, "record": {"ticker": "BADTAG", "decision": "Watchlist",
                 "decision_date": "2026-06-01", "basket": "Watchlist", "forecast_ledger": []}}]
    reviews = [{"review_window": "30d", "error_taxonomy": [{"tag": ["bad math"]}, "stale data"]}]  # one bad, one good
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)  # must not raise
    check(out["error_taxonomy_distribution"] == {"stale data": 1},
          f"the list-shaped tag is skipped; only the real string tag counts (got {out['error_taxonomy_distribution']})")


def test_all_scope_rerun_overwrites_base():
    # Codex r5 #4: an all-scope same-day rerun must OVERWRITE the base file the Phase-6 glob reads,
    # not write an invisible _v2
    import os, tempfile
    standing = [{"run_root": "analyses/AAA_2026-06-01", "record": {
        "ticker": "AAA", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}]
    saved = C.PERF_DIR
    try:
        with tempfile.TemporaryDirectory() as td:
            C.PERF_DIR = td
            out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: [])
            j1, _ = C.write_outputs(out)
            j2, _ = C.write_outputs(out)  # same-day rerun
            base = os.path.join(td, "2026-07-18_calibration_summary.json")
            check(j1 == base and j2 == base, "both all-scope runs write the SAME base file the Phase-6 glob matches")
            check(not os.path.exists(os.path.join(td, "2026-07-18_calibration_summary_v2.json")),
                  "no invisible _v2 is created for an all-scope rerun")
    finally:
        C.PERF_DIR = saved


def test_module_slice_gated_on_distinct_tickers():
    # Codex r6 #2: 10 forecasts from ONE ticker must NOT publish an actionable module slice (Phase-6 would
    # haircut a module across all future theses on one company's correlated cluster)
    one = [{"prob": 0.8, "realized": 1, "owner_module": "earnings", "ticker": "aaa"} for _ in range(12)]
    sl = C._slice(one, "owner_module")
    check(isinstance(sl["earnings"], str) and "tickers=1" in sl["earnings"],
          f"12 forecasts from 1 ticker → insufficient slice (got {sl['earnings']})")
    many = [{"prob": 0.8, "realized": 1, "owner_module": "earnings", "ticker": f"t{i}"} for i in range(12)]
    sl2 = C._slice(many, "owner_module")
    check(isinstance(sl2["earnings"], dict) and sl2["earnings"]["n_tickers"] == 12,
          "12 forecasts across 12 tickers → an actionable slice carrying n_tickers")


def test_thesis_type_multi_label_slice():
    # A record tagged with TWO thesis types must count toward BOTH slices, not exactly one — a
    # "Governance turnaround" call is also "Company-specific", and the engine's own hit rate on each
    # label must be independently calibratable (CLAUDE.md §14/§24 Filter 2).
    pairs = ([{"prob": 0.8, "realized": 1, "ticker": f"t{i}",
               "thesis_type": ["Company-specific", "Governance turnaround"]} for i in range(12)]
             + [{"prob": 0.7, "realized": 0, "ticker": f"u{i}", "thesis_type": ["Company-specific"]} for i in range(12)])
    sl = C._slice_multi(pairs, "thesis_type")
    check(isinstance(sl["Governance turnaround"], dict) and sl["Governance turnaround"]["n"] == 12,
          f"the 12 dual-tagged pairs count toward 'Governance turnaround' (got {sl['Governance turnaround']})")
    check(isinstance(sl["Company-specific"], dict) and sl["Company-specific"]["n"] == 24,
          f"'Company-specific' sees ALL 24 pairs (both cohorts carry the tag) (got {sl['Company-specific']})")


def test_thesis_type_untagged_fallback_and_ticker_floor():
    # A record with no thesis_type field (or an empty/non-list value) buckets under 'untagged', mirroring
    # _slice_key's fallback for owner_module/forecast_type — never a crash, never silently dropped.
    check(C._thesis_type_keys({}) == ["untagged"], "missing thesis_type -> untagged")
    check(C._thesis_type_keys({"thesis_type": []}) == ["untagged"], "empty thesis_type list -> untagged")
    check(C._thesis_type_keys({"thesis_type": "Buy"}) == ["untagged"], "non-list thesis_type -> untagged, never crashes")
    check(C._thesis_type_keys({"thesis_type": [" Buy ", "Buy", 7, None]}) == ["Buy"],
          "stripped, deduped, non-string entries dropped")
    # the same distinct-ticker floor as _slice() applies per thesis-type slice (Phase-6 must not haircut
    # a whole thesis type off one company's correlated forecast cluster)
    one_ticker = [{"prob": 0.8, "realized": 1, "ticker": "aaa", "thesis_type": ["Balance-sheet survival"]} for _ in range(12)]
    sl = C._slice_multi(one_ticker, "thesis_type")
    check(isinstance(sl["Balance-sheet survival"], str) and "tickers=1" in sl["Balance-sheet survival"],
          f"12 forecasts from 1 ticker -> insufficient slice (got {sl['Balance-sheet survival']})")


def test_thesis_type_slice_end_to_end():
    # End-to-end via C.build(): 12 Selected records tagged "Governance turnaround" (10 confirmed at 80%,
    # well past both floors across 12 distinct tickers) must surface an actionable
    # calibration_by_thesis_type["Governance turnaround"] slice, exactly like calibration_by_module does
    # for owner_module today.
    standing, reviews_by_run = [], {}
    for i in range(12):
        status = "confirmed" if i < 10 else "falsified"
        rec, rev = _selected(i, 80, status, 4.0 if i < 9 else -2.0, thesis_type=["Governance turnaround"])
        standing.append(rec)
        reviews_by_run[rec["run_root"]] = [rev]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda rr: reviews_by_run.get(rr, []))
    check("Governance turnaround" in out["calibration_by_thesis_type"], "thesis_type slice keyed by the exact §14 value")
    check(isinstance(out["calibration_by_thesis_type"]["Governance turnaround"], dict),
          "12 forecasts across 12 tickers clears both floors -> an actionable slice, not 'insufficient'")


def test_thesis_type_legacy_casing_canonicalized():
    # Codex (#356): a legacy record grandfathered past eval.py Check Z's 2026-06-21 date gate can carry a
    # lower-case thesis_type (analyses/TMCV_2026-06-07 has ["sector-cycle","company-specific"]). If the
    # slicer keys on the raw string, that record splits off from the canonical "Sector-cycle" cohort;
    # below MIN_SLICE_TICKERS the canonical bucket is starved under its floor and its Phase-6 haircut
    # never fires — the calibration break eval.py Check Z documents (CLAUDE.md §14/§19/§24).

    # (1) calibrate.py's own canonical set MUST equal CLAUDE.md §14 verbatim — the drift tripwire (eval.py
    #     can't be imported). Expected pinned to §14, NOT read back from the code under test.
    S14 = {"Company-specific", "Sector-cycle", "Macro-conditional", "Policy-conditional",
           "Commodity-conditional", "FX / rates", "Liquidity / positioning", "Governance turnaround",
           "Balance-sheet survival", "Pair trade / hedge", "Insufficient data"}
    check(set(C._THESIS_TYPE_CANON) == S14, "calibrate._THESIS_TYPE_CANON must match CLAUDE.md §14 exactly")

    # (2) Unit: legacy lower-case maps to §14 casing; an unrecognized tag passes through unchanged.
    check(C._canon_thesis_type("sector-cycle") == "Sector-cycle", "legacy 'sector-cycle' -> 'Sector-cycle'")
    check(C._canon_thesis_type("company-specific") == "Company-specific", "legacy lower-case -> §14 casing")
    check(C._canon_thesis_type("FX / RATES") == "FX / rates", "case-insensitive match preserves §14 spelling")
    check(C._canon_thesis_type("some-unknown-type") == "some-unknown-type", "unknown tag passes through unchanged")
    check(C._thesis_type_keys({"thesis_type": ["sector-cycle", "company-specific"]})
          == ["Company-specific", "Sector-cycle"], "record tags canonicalized + sorted")

    # (3) End-to-end via C.build(): 10 Selected records tagged Sector-cycle across 10 distinct tickers,
    #     but ONE (SEL0) carries the legacy lower-case spelling. Canonicalized, they form ONE cohort of
    #     10/10 that clears both floors (MIN_RESOLVED_FORECASTS=10, MIN_SLICE_TICKERS=5) -> an actionable
    #     slice. Raw (the bug): SEL0 splits off, "Sector-cycle" starves at 9 (< the 10 floor) -> insufficient.
    standing, reviews_by_run = [], {}
    for i in range(10):
        label = "sector-cycle" if i == 0 else "Sector-cycle"   # SEL0 = grandfathered legacy casing
        rec, rev = _selected(i, 80, "confirmed", 4.0, thesis_type=[label])
        standing.append(rec)
        reviews_by_run[rec["run_root"]] = [rev]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda rr: reviews_by_run.get(rr, []))
    tt = out["calibration_by_thesis_type"]
    check(isinstance(tt.get("Sector-cycle"), dict) and tt["Sector-cycle"]["n"] == 10
          and tt["Sector-cycle"]["n_tickers"] == 10,
          f"legacy-cased record merges into the canonical 'Sector-cycle' cohort (10/10, actionable) (got {tt.get('Sector-cycle')})")
    check("sector-cycle" not in tt, "the legacy lower-case key must NOT survive as an orphan bucket")


def test_slice_key_stripped_and_str_safe():
    # Codex r6 #6 + #3: module keys are stripped (Phase-6 exact lookup) and _norm is non-crash on non-strings
    check(C._slice_key("earnings ") == "earnings" and C._slice_key(" valuation") == "valuation", "slice key is stripped")
    check(C._norm(["x"]) == "" and C._norm({"a": 1}) == "" and C._norm(None) == "", "_norm is str-safe (non-str → '')")
    check(C._window_rank(["30d"]) == C._window_rank("bogus"), "a non-string window ranks as unknown, never crashes")
    # a malformed review_window in a run must not abort the build
    rr = "analyses/MW_2026-06-01"
    standing = [{"run_root": rr, "record": {"ticker": "MW", "decision": "Watchlist",
                 "decision_date": "2026-06-01", "basket": "Watchlist", "forecast_ledger": []}}]
    reviews = [{"review_window": ["30d"], "review_date": "2026-07-01", "error_taxonomy": ["timing error"]}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)  # must not raise
    check(out["error_taxonomy_distribution"] == {"timing error": 1}, "a malformed review_window is tolerated, not fatal")


def test_false_comfort_named_in_markdown():
    # Codex r6 #1: the human summary (markdown) must NAME false-comfort cases, not just count them
    rr = "analyses/FCM_2026-06-01"
    standing = [{"run_root": rr, "record": {"ticker": "FCM", "decision": "Buy",
                 "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}]
    reviews = [{"review_window": "90d",
                "pre_mortem_check": {"outcome_vs_verdict": "contradicted", "contradiction_kind": "false_comfort"}}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: reviews)
    md = C.render_markdown(out)
    check("FALSE COMFORT" in md and "FCM" in md and "90d" in md,
          "the markdown summary names the false-comfort ticker/window, not just a count")


def test_below_floor_withholds():
    standing = [{"run_root": "analyses/ONE_2026-06-01", "record": {
        "ticker": "ONE", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "confidence_score": 60, "forecast_ledger": []}}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda rr: [])
    check(out["verdict"].startswith("Pre-data"), "young ledger → 'Pre-data' verdict (Phase-6 prefix preserved)")
    check(out["hit_rate"] is None and out["calibration_by_module"] == {}, "all skill metrics withheld below floor")
    check(isinstance(out["error_taxonomy_distribution"], dict), "flat tallies always present (even at N=0)")


def test_duplicate_forecast_text_ambiguous():
    # Codex r7: two ledger rows sharing prediction TEXT are ambiguous — a plain-text review reference must
    # NOT be first-wins scored against row 1; only an explicit forecast_index/#N resolves it (§24 omission).
    rec = {"forecast_ledger": [
        {"prediction": "Margin expands", "probability": 80, "owner_module": "earnings"},
        {"prediction": "Margin expands", "probability": 20, "owner_module": "valuation"}]}
    plain = [{"forecast_results": [{"prediction": "Margin expands", "status": "confirmed"}]}]
    check(C.match_resolved_forecasts(rec, plain) == [],
          "duplicate prediction text with no explicit reference is excluded, not first-wins scored")
    byidx = [{"forecast_results": [{"prediction": "Margin expands", "forecast_index": 2, "status": "confirmed"}]}]
    got = C.match_resolved_forecasts(rec, byidx)
    check(len(got) == 1 and got[0]["prob"] == 0.20,
          "an explicit forecast_index=2 still resolves the ambiguous text to row 2 (0.20)")
    rec2 = {"forecast_ledger": [{"prediction": "EPS up", "probability": 70, "owner_module": "earnings"}]}
    uniq = [{"forecast_results": [{"prediction": "EPS up", "status": "confirmed"}]}]
    check(len(C.match_resolved_forecasts(rec2, uniq)) == 1, "a UNIQUE prediction text still matches (no regression)")


def test_standing_reviews_malformed_date_no_crash():
    # Codex r7: a list/dict review_date must not raise 'unhashable type' in standing_reviews' dedup key
    revs = [{"review_date": ["2026-07-01"], "review_window": "30d", "error_taxonomy": ["bad math"]},
            {"review_date": "2026-07-02", "review_window": "90d", "error_taxonomy": ["timing error"]}]
    got = C.standing_reviews(revs)  # must not raise
    check(len(got) == 2, "a malformed-date review is bucketed (coerced to ''), not crashed on")
    rr = "analyses/MD_2026-06-01"
    standing = [{"run_root": rr, "record": {"ticker": "MD", "decision": "Watchlist",
                 "decision_date": "2026-06-01", "basket": "Watchlist", "forecast_ledger": []}}]
    out = C.build(standing=standing, today="2026-07-18",
                  reviews_provider=lambda r: [{"review_date": {"bad": 1}, "review_window": "30d",
                                               "error_taxonomy": ["bad extraction"]}])
    check(out["error_taxonomy_distribution"] == {"bad extraction": 1},
          "a malformed review_date is tolerated through the full build, not fatal")


def test_beta_of_rejects_non_finite():
    # Codex r7: a NaN/Infinity/bool beta in _symbols.json must fall back to 1.0 (no adjustment), never
    # poison beta_adjusted_excess with a non-finite value (invalid strict JSON downstream)
    import market_prices as M
    feed = M.MarketFeed(closes={}, meta={
        "GOOD": {"beta": 1.3}, "NAN": {"beta": float("nan")}, "INF": {"beta": float("inf")},
        "BOOL": {"beta": True}, "STR": {"beta": "1.2"}}, providers=[], files=[])
    check(feed.beta_of("GOOD") == 1.3, "a finite beta is used")
    check(feed.beta_of("NAN") == 1.0 and feed.beta_of("INF") == 1.0, "NaN / Infinity beta → 1.0 fallback")
    check(feed.beta_of("BOOL") == 1.0 and feed.beta_of("STR") == 1.0, "bool / non-numeric beta → 1.0 fallback")
    check(feed.beta_of("MISSING") == 1.0, "a symbol with no metadata → 1.0")


def test_run_root_relative_in_inventory():
    # Codex r7: an absolute run_root must be stored REPO-RELATIVE in the committed inventory — no machine
    # paths leaked, so a same-input rerun from any checkout root diffs clean
    abs_rr = os.path.join(C.REPO, "analyses", "REL_2026-06-01")
    standing = [{"run_root": abs_rr, "record": {"ticker": "REL", "decision": "Buy",
                 "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}]
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: [])
    row = next(r for r in out["inventory"] if r["ticker"] == "REL")
    check(row["run_root"] == "analyses/REL_2026-06-01" and not os.path.isabs(row["run_root"]),
          f"absolute run_root relativized to repo-relative in inventory (got {row['run_root']})")


def test_pair_trade_basket_not_scored():
    # Codex r8: a call capped to 'Pair Trade / Hedge Required' (§18 hedged output) must NOT be scored as
    # a directional long/short via the raw decision
    check(C.directional_hit({"basket": "Selected", "decision": "Buy", "post_mortem_basket": "Pair Trade"},
                            {"benchmark_relative_return_pct": 6.0}) is None,
          "post_mortem_basket 'Pair Trade' → not a directional bet (decision must not resurrect it)")
    check(C.directional_hit({"basket": "Pair Trade / Hedge Required", "decision": "Buy"},
                            {"benchmark_relative_return_pct": 6.0}) is None,
          "'Pair Trade / Hedge Required' basket → not scored as a long")
    check(C.directional_hit({"basket": "Hedge Required", "decision": "Buy"},
                            {"benchmark_relative_return_pct": -3.0}) is None,
          "'Hedge Required' basket → not scored either")
    # a real Selected long still scores (no regression)
    check(C.directional_hit({"basket": "Selected", "decision": "Buy"}, {"benchmark_relative_return_pct": 6.0}) == 1,
          "a genuine Selected long still scores a hit")


def test_false_comfort_derived_from_verdict():
    # Codex r8: the writer contract (review-decisions.md §7A) stores NO contradiction_kind — the split is
    # derived from the contradicted pre_mortem_verdict ('Survives…' → false comfort; 'Does not survive' /
    # 'Thesis broken' → excess caution). A schema-conformant contradicted review must still be classified.
    fc = [{"review_window": "90d", "pre_mortem_check": {
        "outcome_vs_verdict": "contradicted", "pre_mortem_verdict": "Survives with haircut"}}]
    out = C.build(standing=[{"run_root": "analyses/FCV_2026-06-01", "record": {"ticker": "FCV",
                  "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}],
                  today="2026-07-18", reviews_provider=lambda r: fc)
    pm = out["pre_mortem_calibration"]
    check(pm["contradicted_breakdown"]["false_comfort"] == 1,
          f"a contradicted 'Survives' verdict → false_comfort with no contradiction_kind field (got {pm['contradicted_breakdown']})")
    check(any(c["ticker"] == "FCV" for c in pm["false_comfort_cases"]), "the derived false-comfort case is named by ticker")
    ec = [{"review_window": "90d", "pre_mortem_check": {
        "outcome_vs_verdict": "contradicted", "pre_mortem_verdict": "Thesis broken"}}]
    out2 = C.build(standing=[{"run_root": "analyses/EC_2026-06-01", "record": {"ticker": "EC",
                   "decision": "Avoid", "decision_date": "2026-06-01", "basket": "Rejected", "forecast_ledger": []}}],
                   today="2026-07-18", reviews_provider=lambda r: ec)
    check(out2["pre_mortem_calibration"]["contradicted_breakdown"]["excess_caution"] == 1,
          "a contradicted 'Thesis broken' verdict → excess_caution")
    # an explicit contradiction_kind is still honoured (belt-and-suspenders, no regression)
    ek = [{"review_window": "90d", "pre_mortem_check": {
        "outcome_vs_verdict": "contradicted", "contradiction_kind": "false_comfort", "pre_mortem_verdict": ""}}]
    out3 = C.build(standing=[{"run_root": "analyses/EK_2026-06-01", "record": {"ticker": "EK",
                   "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}}],
                   today="2026-07-18", reviews_provider=lambda r: ek)
    check(out3["pre_mortem_calibration"]["contradicted_breakdown"]["false_comfort"] == 1,
          "an explicit contradiction_kind still classifies (no regression)")


def test_arrival_span_malformed_date_no_crash():
    # Codex r9: a malformed (list/dict) review_date among priced directional reviews must not crash
    # min()/max() in the arrival-rate span — filter non-string dates, don't abort the whole write.
    standing = [
        {"run_root": "analyses/AAA_2026-06-01", "record": {"ticker": "AAA", "decision": "Buy",
         "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}},
        {"run_root": "analyses/BBB_2026-06-01", "record": {"ticker": "BBB", "decision": "Buy",
         "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}},
    ]
    revs = {
        "analyses/AAA_2026-06-01": [{"review_window": "30d", "review_date": ["2026-07-01"],  # malformed date
                                     "benchmark_relative_return_pct": 5.0}],
        "analyses/BBB_2026-06-01": [{"review_window": "30d", "review_date": "2026-07-10",
                                     "benchmark_relative_return_pct": 3.0}],
    }
    out = C.build(standing=standing, today="2026-07-18", reviews_provider=lambda r: revs.get(r, []))  # must not raise
    check(out["sequential_test"].get("n") == 2, "both directional calls counted despite one malformed review_date")
    check(out["months_to_significance"] is not None, "arrival-rate span computed without crashing on the malformed date")


def test_superseded_priced_review_not_resurrected():
    # Codex r10: a _v2 correction that nulled a bad return must NOT be bypassed to resurrect the stale
    # _v1's price outcome — latest_priced_review dedupes to the standing (highest) version first.
    reviews = [
        {"review_date": "2026-07-01", "review_window": "90d", "_version": 1, "benchmark_relative_return_pct": 12.0},
        {"review_date": "2026-07-01", "review_window": "90d", "_version": 2, "benchmark_relative_return_pct": None},
    ]
    check(C.latest_priced_review(reviews) is None,
          "the superseded _v1's return is not resurrected; the nulling _v2 supersedes it → no priced review")
    reviews2 = [
        {"review_date": "2026-06-15", "review_window": "30d", "_version": 1, "benchmark_relative_return_pct": 4.0},
        {"review_date": "2026-07-01", "review_window": "90d", "_version": 1, "benchmark_relative_return_pct": 12.0},
        {"review_date": "2026-07-01", "review_window": "90d", "_version": 2, "benchmark_relative_return_pct": None},
    ]
    lpr2 = C.latest_priced_review(reviews2)
    check(lpr2 and lpr2["review_window"] == "30d",
          "falls back to the earlier 30d priced review across WINDOWS, not the superseded 90d_v1")


def test_skill_declaration_needs_distinct_tickers():
    # Codex r11: 10 correlated directional calls on ONE ticker must NOT declare skill (effective N = 1) even
    # though the e-value crosses; 10 across distinct names may.
    mono, revs = [], {}
    for i in range(10):
        rr = f"analyses/MONO_2026-06-{i+1:02d}"
        mono.append({"run_root": rr, "record": {"ticker": "MONO", "decision": "Buy",
                     "decision_date": f"2026-06-{i+1:02d}", "basket": "Selected", "forecast_ledger": []}})
        revs[rr] = [{"review_window": "30d", "review_date": f"2026-07-{i+1:02d}", "benchmark_relative_return_pct": 5.0}]
    st = C.build(standing=mono, today="2026-08-01", reviews_provider=lambda r: revs.get(r, []))["sequential_test"]
    check(st["n"] == 10 and st["n_distinct_tickers"] == 1, f"10 calls, 1 distinct name (got n={st.get('n')}, tickers={st.get('n_distinct_tickers')})")
    check(st["skill_declared"] is False, "skill NOT declared on 10 correlated calls from one ticker (effective N=1)")
    multi, revs2 = [], {}
    for i in range(10):
        rr = f"analyses/MUL{i}_2026-06-01"
        multi.append({"run_root": rr, "record": {"ticker": f"MUL{i}", "decision": "Buy",
                      "decision_date": "2026-06-01", "basket": "Selected", "forecast_ledger": []}})
        revs2[rr] = [{"review_window": "30d", "review_date": "2026-07-01", "benchmark_relative_return_pct": 5.0}]
    st2 = C.build(standing=multi, today="2026-08-01", reviews_provider=lambda r: revs2.get(r, []))["sequential_test"]
    check(st2["n_distinct_tickers"] == 10, f"10 distinct names counted (got {st2.get('n_distinct_tickers')})")
    check(st2["skill_declared"] == (st2["e_value"] >= st2["skill_threshold"]),
          "with 10 distinct names, the ticker gate no longer blocks — skill_declared tracks the e-value alone")


def test_spread_matched_by_horizon():
    # Codex r11: the Selected−Rejected spread (§2) must not subtract mismatched horizons (30d vs 365d)
    def mk(t, basket, window, rel):
        rr = f"analyses/{t}_2026-06-01"
        rec = {"run_root": rr, "record": {"ticker": t, "decision": ("Buy" if basket == "Selected" else "Avoid"),
               "decision_date": "2026-06-01", "basket": basket, "forecast_ledger": []}}
        return rec, rr, {"review_window": window, "review_date": "2026-07-01", "benchmark_relative_return_pct": rel}
    mism, revs = [], {}
    for i in range(5):
        rec, rr, rv = mk(f"S{i}", "Selected", "30d", 4.0); mism.append(rec); revs[rr] = [rv]
    for i in range(5):
        rec, rr, rv = mk(f"R{i}", "Rejected", "365d", -3.0); mism.append(rec); revs[rr] = [rv]
    out = C.build(standing=mism, today="2026-07-18", reviews_provider=lambda r: revs.get(r, []))
    check(out["selected_minus_rejected_pct"] is None,
          "spread WITHHELD when Selected (30d) and Rejected (365d) horizons don't match")
    match, revs2 = [], {}
    for i in range(5):
        rec, rr, rv = mk(f"S{i}", "Selected", "30d", 4.0); match.append(rec); revs2[rr] = [rv]
    for i in range(5):
        rec, rr, rv = mk(f"R{i}", "Rejected", "30d", -3.0); match.append(rec); revs2[rr] = [rv]
    out2 = C.build(standing=match, today="2026-07-18", reviews_provider=lambda r: revs2.get(r, []))
    check(out2["selected_minus_rejected_pct"] == 7.0 and out2["selected_minus_rejected_window"] == "30d",
          f"spread at the matched 30d window: 4.0 − (−3.0) = 7.0 (got {out2.get('selected_minus_rejected_pct')} @ {out2.get('selected_minus_rejected_window')})")


def test_duplicate_forecast_result_not_double_counted():
    # Codex r12: a review that resolves the SAME ledger entry more than once (repeated prediction text or a
    # forecast_index pointing at an already-scored entry) must count it ONCE toward the Brier N / slices.
    rec = {"forecast_ledger": [{"prediction": "EPS up", "probability": 70, "owner_module": "earnings",
                               "forecast_type": "eps"}]}
    reviews = [{"forecast_results": [
        {"prediction": "EPS up", "status": "confirmed"},
        {"prediction": "EPS up", "status": "confirmed"},          # duplicate text → same ledger entry
        {"prediction": "see #1", "forecast_index": 1, "status": "confirmed"}]}]  # explicit ref → same entry
    got = C.match_resolved_forecasts(rec, reviews)
    check(len(got) == 1, f"the same ledger entry resolved 3× counts ONCE toward the Brier sample (got {len(got)})")


def test_provisional_run_excluded_from_skill_scoring():
    # fix-run 2026-07-30: a run the engine itself flagged truth-integrity "provisional" (verify-evidence
    # not Clean/Minor, or an active finish-gate PROVISIONAL banner) must not inflate/deflate Brier, hit
    # rate, or cohort returns — but it must still be visible in `inventory` and named in `excluded_provisional`.
    standing, reviews_by_run = [], {}
    # 10 clean/verified Selected calls, all confirmed at 80% — comfortably above every floor
    for i in range(10):
        rec, rev = _selected(i, 80, "confirmed", 4.0)
        rec["integrity"] = {"status": "verified", "verdict": "Clean", "integrity_score": 95}
        standing.append(rec)
        reviews_by_run[rec["run_root"]] = [rev]
    # 1 PROVISIONAL Selected call that would (if counted) look like a clean MISS: falsified, beat nothing
    prov_rec, prov_rev = _selected(99, 80, "falsified", -50.0)
    prov_rec["integrity"] = {"status": "provisional", "verdict": "Material issues", "integrity_score": 40}
    standing.append(prov_rec)
    reviews_by_run[prov_rec["run_root"]] = [prov_rev]
    # 1 unaudited Selected call (no verify-evidence report at all) — must NOT be excluded
    unaud_rec, unaud_rev = _selected(50, 80, "confirmed", 4.0)
    unaud_rec["integrity"] = {"status": "unaudited", "verdict": None, "integrity_score": None}
    standing.append(unaud_rec)
    reviews_by_run[unaud_rec["run_root"]] = [unaud_rev]

    out = C.build(standing=standing, today="2026-07-30", reviews_provider=lambda rr: reviews_by_run.get(rr, []))

    check(out["n_decisions"] == 12, f"all 12 runs counted in inventory, incl. the provisional one (got {out['n_decisions']})")
    check(out["n_resolved_forecasts"] == 11,
          f"the provisional run's forecast is excluded from the Brier corpus — 11, not 12 (got {out['n_resolved_forecasts']})")
    check(out["n_directional_calls_resolved"] == 11,
          f"the provisional run's directional call is excluded — 11, not 12 (got {out['n_directional_calls_resolved']})")
    check(out["hit_rate"] == 1.0, f"the excluded run's -50% loss must not drag the hit rate down (got {out['hit_rate']})")
    ep = out["excluded_provisional"]
    check(ep["n"] == 1 and ep["runs"][0]["ticker"] == "SEL99", f"excluded_provisional names the flagged run (got {ep})")
    statuses = {row["ticker"]: row["integrity_status"] for row in out["inventory"]}
    check(statuses.get("SEL99") == "provisional" and statuses.get("SEL50") == "unaudited"
          and statuses.get("SEL0") == "verified",
          f"inventory rows carry their own integrity_status (got {statuses})")

    # Integrity-BLIND shadow (look-ahead / survivorship guard, fix-run 2026-07-30): the all-published-calls
    # hit rate INCLUDES the provisional run. Expected value pinned to the definition of that cohort (every
    # published directional call, provisional included), NOT to code output: 12 published directional calls,
    # of which only the provisional -50% call is a miss → 11/12 hits. The gated number is 10/10 = 1.0, so the
    # gate flatters the record by +8.3pp of survivorship — which is exactly what the shadow must expose so a
    # reader can confirm the exclusion was established pre-outcome (CLAUDE.md §1, no false confidence).
    ib = out["integrity_blind_hit_rate"]
    check(ib["n_directional_calls_resolved"] == 12,
          f"the integrity-blind cohort keeps the provisional call — 12, not 11 (got {ib['n_directional_calls_resolved']})")
    check(ib["n_provisional_excluded_from_gated"] == 1,
          f"exactly the 1 provisional directional call is what the gate drops (got {ib['n_provisional_excluded_from_gated']})")
    check(ib["hit_rate"] == round(11 / 12, 4),
          f"all-published hit rate is 11/12, provisional miss included (got {ib['hit_rate']})")
    check(ib["divergence_pp"] == round((11 / 12 - 1.0) * 100, 1),
          f"divergence_pp exposes the survivorship the gate introduced (got {ib['divergence_pp']})")

    # Codex P1 (2026-07-30, second finding): the integrity-blind shadow covered directional hits only —
    # extend the same look-ahead guard to Brier/calibration and to cohort returns. Same fixture: 10 verified
    # + 1 unaudited resolved at 80% confirmed (realized=1) = 11 gated pairs, Brier 0; the provisional run
    # resolved at 80% FALSIFIED (realized=0) is dropped from the gate but must reappear in the all-published
    # shadow. Gated Brier = 11×(0.8-1)² / 11 = 0.04. All-published Brier = (11×0.04 + (0.8-0)²) / 12 = 0.09.
    check(out["calibration"]["brier"] == 0.04, f"gated Brier excludes the provisional miss (got {out['calibration']['brier']})")
    ibc = out["integrity_blind_calibration"]
    check(ibc["n"] == 12, f"the integrity-blind Brier corpus keeps the provisional pair — 12, not 11 (got {ibc['n']})")
    check(ibc["n_provisional_excluded_from_gated"] == 1,
          f"exactly the 1 provisional pair is what the gate drops from Brier (got {ibc['n_provisional_excluded_from_gated']})")
    check(ibc["brier"] == 0.09, f"all-published Brier includes the provisional miss (got {ibc['brier']})")
    check(ibc["divergence"] == round(0.09 - 0.04, 4),
          f"divergence exposes the survivorship the gate introduced in Brier (got {ibc['divergence']})")

    # Cohort returns: gated Selected mean = 4.0 (10 verified + 1 unaudited, all +4.0%); all-published mean
    # pulls in the provisional run's -50.0% = (11×4.0 − 50.0) / 12 = −0.5.
    check(out["cohort_returns"]["Selected"]["mean_benchmark_relative_pct"] == 4.0,
          f"gated Selected cohort return excludes the provisional −50% (got {out['cohort_returns']['Selected']})")
    ibcr = out["integrity_blind_cohort_returns"]["Selected"]
    check(ibcr["n"] == 12, f"the integrity-blind cohort-return corpus keeps the provisional run — 12, not 11 (got {ibcr['n']})")
    check(ibcr["n_provisional_excluded_from_gated"] == 1,
          f"exactly the 1 provisional run is what the gate drops from cohort returns (got {ibcr['n_provisional_excluded_from_gated']})")
    check(ibcr["mean_benchmark_relative_pct"] == -0.5,
          f"all-published Selected cohort return includes the provisional −50% (got {ibcr['mean_benchmark_relative_pct']})")
    check(ibcr["divergence_pct"] == round(-0.5 - 4.0, 3),
          f"divergence_pct exposes the survivorship the gate introduced in cohort returns (got {ibcr['divergence_pct']})")


def test_markdown_names_excluded_and_shadow():
    # The persisted human report (*_decision_performance_summary.md) must NAME every excluded run and show
    # the integrity-blind shadow — not leave them JSON-only (the /research:calibrate command requires it,
    # CLAUDE.md §11 bans hiding a gap). Reuse the same 10-verified + 1-provisional + 1-unaudited fixture.
    standing, reviews_by_run = [], {}
    for i in range(10):
        rec, rev = _selected(i, 80, "confirmed", 4.0)
        rec["integrity"] = {"status": "verified", "verdict": "Clean", "integrity_score": 95}
        standing.append(rec)
        reviews_by_run[rec["run_root"]] = [rev]
    prov_rec, prov_rev = _selected(99, 80, "falsified", -50.0)
    prov_rec["integrity"] = {"status": "provisional", "verdict": "Material issues", "integrity_score": 40}
    standing.append(prov_rec)
    reviews_by_run[prov_rec["run_root"]] = [prov_rev]
    unaud_rec, unaud_rev = _selected(50, 80, "confirmed", 4.0)
    unaud_rec["integrity"] = {"status": "unaudited", "verdict": None, "integrity_score": None}
    standing.append(unaud_rec)
    reviews_by_run[unaud_rec["run_root"]] = [unaud_rev]

    out = C.build(standing=standing, today="2026-07-30", reviews_provider=lambda rr: reviews_by_run.get(rr, []))
    md = C.render_markdown(out)

    check("analyses/SEL99_2026-06-01" in md,
          "the excluded provisional run is NAMED in the Markdown, not only in the JSON")
    check("Excluded from skill metrics" in md, "the Markdown carries an excluded-runs section header")
    check("All-published-calls hit rate" in md, "the Markdown surfaces the integrity-blind shadow hit rate")
    check("Integrity" in md and "⚠ provisional" in md,
          "the Inventory table carries an integrity column that flags the provisional row")


def test_no_integrity_field_behaves_as_before():
    # Backward compatibility: a standing entry with NO "integrity" key (every pre-existing fixture in this
    # file, and every run predating this fix) must score exactly as before — never silently excluded.
    rec, rev = _selected(0, 80, "confirmed", 4.0)
    check("integrity" not in rec, "fixture sanity: _selected() does not inject an integrity field")
    out = C.build(standing=[rec], today="2026-07-30", reviews_provider=lambda rr: [rev])
    check(out["n_resolved_forecasts"] == 1, "a record with no integrity field is scored normally, not excluded")
    check(out["excluded_provisional"]["n"] == 0, "nothing excluded when no record carries a provisional status")


def test_execution_identity_is_conservative():
    legacy = C._execution_identity({})
    check(legacy["author_provider"] == "unknown_legacy"
          and legacy["pipeline_provider"] == "unknown_legacy",
          "a historical record without runtime provenance remains unknown_legacy, never guessed Claude")

    proven = C._execution_identity({}, {
        "provider": "claude", "basis": "pre_rollout_cockpit_history", "verified": True})
    check(proven["author_provider"] == "legacy_inferred_claude"
          and proven["pipeline_provider"] == "legacy_inferred_claude",
          "a separately verified sole-Claude cockpit proof is labelled legacy_inferred_claude")
    unverified = C._execution_identity({}, {
        "provider": "claude", "basis": "record_age_only", "verified": True})
    check(unverified["author_provider"] == "unknown_legacy",
          "age or an unrecognised basis never infers Claude")

    recorded = C._execution_identity({"execution_provenance": _execution_provenance("claude")})
    check(recorded["author_provider"] == "claude" and recorded["pipeline_provider"] == "claude"
          and recorded["status"] == "recorded_single_provider",
          "a canonical recorded author plus configured specialist is attributed to that provider")

    configured = C._execution_identity({
        "execution_provenance": _execution_provenance("codex", attribution="configured")})
    check(configured["author_provider"] == "unknown"
          and configured["pipeline_provider"] == "unknown",
          "a configured-only terminal author is not a valid runtime projection and gets no Codex credit")

    mixed = C._execution_identity({"execution_provenance": _execution_provenance(
        "codex", mode="mixed_provider", contributors=[
            {"provider": "claude", "model": "claude-parent", "reasoning_level": "high",
             "attribution": "recorded", "scopes": ["modules"]},
            {"provider": "codex", "model": "codex-parent", "reasoning_level": "max",
             "attribution": "recorded", "scopes": ["terminal_adjudication"]},
        ])})
    check(mixed["author_provider"] == "codex" and mixed["pipeline_provider"] == "mixed",
          "a mixed continuation credits forecasts to its recorded terminal author but pipeline outcomes to mixed")

    partial_projection = _execution_provenance(
        "codex", mode="partially_observed", contributors=[
            {"provider": "codex", "model": None, "reasoning_level": None,
             "attribution": "configured", "scopes": ["prior_unobserved"]},
            {"provider": "codex", "model": "codex-parent", "reasoning_level": "max",
             "attribution": "recorded", "scopes": ["terminal_adjudication"]},
        ])
    partial = C._execution_identity({"execution_provenance": partial_projection})
    check(partial["author_provider"] == "codex"
          and partial["pipeline_provider"] == "partially_observed",
          "a canonical partial projection credits its recorded author but keeps pipeline outcomes partial")

    forged_minimal = {
        "provider_mode": "single_provider",
        "profile_key": "codex|codex-parent:max",
        "decision_author": {"provider": "codex", "attribution": "recorded"},
    }
    forged = C._execution_identity({"execution_provenance": forged_minimal})
    check(forged["author_provider"] == "unknown" and forged["pipeline_provider"] == "unknown",
          "a forged plausible-looking minimal object never becomes recorded provenance")

    invalid_uuid = _execution_provenance("codex")
    invalid_uuid["decision_author"]["attempt_id"] = "attempt-codex"
    check(C._execution_identity({"execution_provenance": invalid_uuid})["author_provider"] == "unknown",
          "a non-canonical decision-author UUID invalidates the projection")

    uuid7 = _execution_provenance("codex")
    uuid7["decision_author"]["attempt_id"] = "01a05e44-5728-7c00-9710-6f570eabfd10"
    check(C._execution_identity({"execution_provenance": uuid7})["author_provider"] == "codex",
          "a canonical UUIDv7 runtime attempt remains attributable")

    inconsistent = _execution_provenance("codex")
    inconsistent["contributors"] = sorted(inconsistent["contributors"] + [{
        "provider": "claude", "model": "claude-parent", "reasoning_level": "high",
        "attribution": "recorded", "scopes": ["prior_modules"],
    }], key=lambda item: (
        item["provider"], item.get("model") or "", item.get("reasoning_level") or "",
        item["attribution"],
    ))
    check(C._execution_identity({"execution_provenance": inconsistent})["pipeline_provider"] == "unknown",
          "cross-provider contributors cannot claim single_provider")

    inconsistent_partial = dict(partial_projection, provider_mode="single_provider")
    check(C._execution_identity({"execution_provenance": inconsistent_partial})["pipeline_provider"] == "unknown",
          "a missing configured tuple cannot claim fully observed single_provider")

    inconsistent_mixed = _execution_provenance("codex", mode="mixed_provider", contributors=[
        {"provider": "claude", "model": "claude-parent", "reasoning_level": "high",
         "attribution": "recorded", "scopes": ["prior_modules"]},
        {"provider": "codex", "model": "codex-parent", "reasoning_level": "max",
         "attribution": "recorded", "scopes": ["terminal_adjudication"]},
    ])
    inconsistent_mixed["profile_key"] = "codex|codex-parent:max"
    check(C._execution_identity({"execution_provenance": inconsistent_mixed})["pipeline_provider"] == "unknown",
          "a mixed-provider projection requires the canonical mixed profile discriminator")

    wrong_profile = _execution_provenance("codex")
    wrong_profile["profile_key"] = "claude:codex-parent:max"
    check(C._execution_identity({"execution_provenance": wrong_profile})["author_provider"] == "unknown",
          "a structured profile naming a different provider cannot authorize the recorded author")


def test_provider_calibration_attribution_floors_and_refusal():
    standing, reviews_by_run = [], {}

    # Each recorded provider independently clears every existing floor: 10 forecasts on 10 tickers,
    # 10 directional outcomes, and 10 exact-30d basket returns.  The values are deliberately different
    # enough to prove the cohorts are separate, but the script must still emit no automated ranking.
    for provider in ("claude", "codex"):
        for i in range(10):
            entry, review = _provider_run(
                provider, i, error_tag="bad causal inference" if i == 0 else None)
            if provider == "codex" and i >= 8:
                review["forecast_results"][0]["status"] = "falsified"
                review["benchmark_relative_return_pct"] = -2.0
            standing.append(entry)
            reviews_by_run[entry["run_root"]] = [review]

    # One cross-provider continuation: the Codex terminal author owns its probability, while the
    # realised direction/return/error remain in the mixed whole-pipeline cohort.
    mixed_entry, mixed_review = _provider_run(
        "codex", 90, mode="mixed_provider", error_tag="bad math", contributors=[
            {"provider": "claude", "model": "claude-parent", "reasoning_level": "high",
             "attribution": "recorded", "scopes": ["modules"]},
            {"provider": "codex", "model": "codex-parent", "reasoning_level": "max",
             "attribution": "recorded", "scopes": ["terminal_adjudication"]},
        ])
    standing.append(mixed_entry)
    reviews_by_run[mixed_entry["run_root"]] = [mixed_review]

    # A valid partial pipeline keeps its recorded author; a configured-only terminal forgery is unknown.
    partial_entry, partial_review = _provider_run(
        "codex", 91, mode="partially_observed", error_tag="missing data", contributors=[
            {"provider": "codex", "model": None, "reasoning_level": None,
             "attribution": "configured", "scopes": ["prior_unobserved"]},
            {"provider": "codex", "model": "codex-parent", "reasoning_level": "max",
             "attribution": "recorded", "scopes": ["terminal_adjudication"]},
        ])
    standing.append(partial_entry)
    reviews_by_run[partial_entry["run_root"]] = [partial_review]
    configured_entry, configured_review = _provider_run(
        "codex", 92, attribution="configured", error_tag="bad source")
    standing.append(configured_entry)
    reviews_by_run[configured_entry["run_root"]] = [configured_review]
    legacy_root = "analyses/LEGACY_2026-06-01"
    standing.append({"run_root": legacy_root, "record": {
        "ticker": "LEGACY", "decision": "Buy", "decision_date": "2026-06-01",
        "basket": "Selected", "forecast_ledger": [{
            "prediction": "legacy forecast", "probability": 60,
            "owner_module": "earnings", "forecast_type": "earnings_eps",
        }],
    }})
    reviews_by_run[legacy_root] = [{
        "review_date": "2026-07-01", "review_window": "30d",
        "benchmark_relative_return_pct": 1.0,
        "forecast_results": [{"prediction": "legacy forecast", "status": "confirmed"}],
        "error_taxonomy": ["stale data"],
    }]

    out = C.build(standing=standing, today="2026-08-21",
                  reviews_provider=lambda rr: reviews_by_run.get(rr, []))
    by_provider = out["calibration_by_provider"]
    claude = by_provider["claude"]
    codex = by_provider["codex"]

    check(claude["forecast_author_calibration"]["status"] == "available"
          and claude["forecast_author_calibration"]["n"] == 10,
          "Claude Brier slice clears N=10 and the distinct-ticker floor independently")
    check(codex["forecast_author_calibration"]["status"] == "available"
          and codex["forecast_author_calibration"]["n"] == 12,
          "Codex forecast slice includes recorded mixed/partial authors, not configured-only forgeries")
    check(claude["pipeline_directional"]["n"] == 10
          and codex["pipeline_directional"]["n"] == 10,
          "recorded single-provider directional cohorts remain separate and both clear N=10")
    check(by_provider["mixed"]["pipeline_directional"]["n"] == 1
          and by_provider["mixed"]["forecast_author_calibration"]["n"] == 0,
          "mixed run direction stays mixed while its forecast is attributed to the decision author")
    check(by_provider["partially_observed"]["pipeline_directional"]["n"] == 1
          and by_provider["unknown"]["forecast_author_calibration"]["n"] == 1
          and by_provider["unknown"]["pipeline_directional"]["n"] == 1,
          "partial pipeline and invalid configured-author projection remain separate non-recorded cohorts")
    check(by_provider["unknown_legacy"]["pipeline_directional"]["n"] == 1,
          "legacy provenance remains an explicit unknown_legacy pipeline cohort")

    check(claude["pipeline_returns_by_horizon"]["Selected"]["30d"]["status"] == "available"
          and codex["pipeline_returns_by_horizon"]["Selected"]["30d"]["status"] == "available",
          "provider basket returns apply the N>=5 floor at the exact matched review horizon")
    check(by_provider["mixed"]["pipeline_returns_by_horizon"]["Selected"]["30d"]["status"] == "insufficient",
          "a one-run mixed return is reported but withheld below the basket floor")
    check(by_provider["mixed"]["error_taxonomy_distribution"] == {"bad math": 1}
          and by_provider["unknown_legacy"]["error_taxonomy_distribution"] == {"stale data": 1},
          "provider error-taxonomy counts are reported at any N without fabricating rates")

    comparison = out["provider_comparison"]
    check(comparison["forecast_calibration"]["comparison_ready"]
          and comparison["directional_hit_rate"]["comparison_ready"],
          "head-to-head is marked ready only after both recorded providers independently clear each floor")
    check({"mixed", "partially_observed", "unknown", "unknown_legacy"}.issubset(
              set(comparison["excluded_from_recorded_head_to_head"])),
          "mixed, partial, invalid, and legacy cohorts are excluded from recorded head-to-head")
    check(comparison["ranking"] is None and "No blended provider hit rate" in comparison["policy"],
          "even above floor the deterministic core emits no provider ranking, blended hit rate, or haircut")

    thin_entry, thin_review = _provider_run("claude", 99)
    thin = C.build(standing=[thin_entry], today="2026-08-21",
                   reviews_provider=lambda rr: [thin_review])
    check(thin["provider_comparison"]["status"] == "withheld"
          and thin["provider_comparison"]["ranking"] is None,
          "below floor, provider comparison and ranking are refused")


def test_provider_metric_floors_match_the_published_contract():
    directional = C._directional_execution_metric([
        {"ticker": "ONE", "hit": 1 if i % 2 == 0 else 0} for i in range(10)])
    check(directional["status"] == "available" and directional["floor"] == {"n": 10},
          "directional provider slices require N>=10, not ten distinct tickers")

    returns = C._return_execution_metrics([
        {"ticker": "ONE", "basket": "Selected", "window": "30d", "value": float(i)}
        for i in range(5)
    ])
    check(returns["Selected"]["30d"]["status"] == "available",
          "basket provider slices require N>=5 at one matched horizon, not five distinct tickers")
    unmatched = C._return_execution_metrics([
        {"ticker": "ONE", "basket": "Selected", "window": "unmatched", "value": float(i)}
        for i in range(5)
    ])
    check(unmatched["Selected"]["unmatched"]["status"] == "insufficient",
          "basket provider slices still refuse an unmatched horizon")

    forecasts = C._forecast_execution_metric([
        {"ticker": f"T{i % 4}", "prob": 0.6, "realized": i % 2} for i in range(10)])
    check(forecasts["status"] == "insufficient",
          "Brier provider slices retain the independent five-distinct-ticker floor")


def main():
    print("test_calibrate.py")
    for fn in (test_incomplete_beta, test_clopper_pearson, test_brier_and_murphy, test_e_value,
               test_effective_n, test_months_to_significance_honesty, test_forecast_join_never_misscores,
               test_fraction_slip_excluded, test_effective_n_clusters_by_ticker, test_all_reviews_tallied,
               test_false_comfort_named, test_brier_ready_not_reported_withheld, test_scoped_output_isolated,
               test_expired_is_a_settled_miss, test_tracking_price_return_recovered,
               test_effective_n_counts_directional_only_runs, test_reviews_sort_by_horizon_not_text,
               test_explicit_reference_join, test_review_version_numeric_sort,
               test_malformed_slice_key_does_not_crash, test_sector_relative_not_a_benchmark_hit,
               test_insufficient_data_basket_not_scored, test_latest_priced_review_for_returns,
               test_flat_tallies_dedup_corrected_versions, test_output_json_is_strict_even_with_nan,
               test_non_finite_inputs_excluded, test_short_basket_cohort_inverted,
               test_malformed_error_tag_skipped, test_all_scope_rerun_overwrites_base,
               test_module_slice_gated_on_distinct_tickers, test_thesis_type_multi_label_slice,
               test_thesis_type_untagged_fallback_and_ticker_floor, test_thesis_type_slice_end_to_end,
               test_thesis_type_legacy_casing_canonicalized,
               test_slice_key_stripped_and_str_safe,
               test_false_comfort_named_in_markdown, test_duplicate_forecast_text_ambiguous,
               test_standing_reviews_malformed_date_no_crash, test_beta_of_rejects_non_finite,
               test_run_root_relative_in_inventory, test_pair_trade_basket_not_scored,
               test_false_comfort_derived_from_verdict, test_arrival_span_malformed_date_no_crash,
               test_superseded_priced_review_not_resurrected, test_skill_declaration_needs_distinct_tickers,
               test_spread_matched_by_horizon, test_duplicate_forecast_result_not_double_counted,
               test_end_to_end_floor_met, test_probability_scale, test_below_floor_withholds,
               test_provisional_run_excluded_from_skill_scoring, test_markdown_names_excluded_and_shadow,
               test_no_integrity_field_behaves_as_before, test_execution_identity_is_conservative,
               test_provider_calibration_attribution_floors_and_refusal,
               test_provider_metric_floors_match_the_published_contract):
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
