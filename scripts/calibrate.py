#!/usr/bin/env python3
"""calibrate.py — the decision engine's calibration scoreboard (deterministic core).

WHY THIS EXISTS
---------------
The engine makes real-money calls. Whether those calls are actually good is a STATISTICAL
question, and the statistics have to be exact and reproducible — not re-derived in prose by a
model each run (which drifts). This module computes every calibration number the scoreboard needs
from the standing decision ledger, so `/research:calibrate` becomes a thin wrapper that runs it and
commits (mirroring `scripts/screener_calibrate.py`). The hard discipline of `CLAUDE.md` §1/§11/§19
is enforced in code: below the resolved-history floor, a skill metric is WITHHELD (null / "insufficient
(N=k)"), never estimated. A scoreboard that flatters a tiny sample is worse than an empty one.

WHAT IT COMPUTES (each gated by its own floor; withheld, never faked, below it)
  • Brier score + Murphy decomposition (reliability / resolution / uncertainty) over resolved
    binary forecasts, with the decomposition residual reported so the identity is auditable.
  • Reliability read: realized frequency per CLAUDE.md §10 probability band.
  • Clopper-Pearson EXACT binomial confidence interval on every hit rate (no normal approximation —
    honest at small N). Implemented from the regularized incomplete beta (pure stdlib).
  • Benchmark-adjusted directional hit rate: a call "hits" only if it beats its OWN benchmark in the
    bet's direction (a long that merely rode a rising market did not hit) — never a raw return.
  • Selected − Rejected basket spread (the §2 North Star; scoring the rejections ~doubles effective N).
  • Sequential e-process (anytime-valid): a mixture e-value of the directional hit rate vs p=0.5, so a
    monthly check carries NO peeking penalty (unlike a fixed-N p-value). Skill is declared only when
    the e-value crosses 1/α — and never below the floor.
  • Cluster / effective-N: forecasts within one run/ticker are not independent bets; the conservative
    effective N (distinct tickers) is reported alongside the raw count so significance is not overstated.
  • Months-to-significance + a standing honesty statement printed every run: WHEN a real verdict
    becomes possible at the observed resolution-arrival rate, so "not yet" is quantified, not vague.

CONTRACT
  • Reads the STANDING, corrected ledger via scripts/ledger_records.py (drops superseded runs, applies
    errata on read) — never a raw glob. Read-only on every decision/review record.
  • Writes ONE derived, regenerable pair under analyses/performance/ (a snapshot, not an immutable
    record): <TODAY>_calibration_summary.json + <TODAY>_decision_performance_summary.md.
  • Preserves the Phase-6 feedback contract (frameworks/DECISION_LEDGER.md §18): `verdict` starts with
    "Pre-data" when below floor (the synthesizer keys on that prefix), and `calibration_by_module` /
    `calibration_by_forecast_type` are keyed by the exact owner_module / forecast_type value, each
    "insufficient (N=k)" below its own floor.
  • Pure + importable; the CLI runs only under __main__. Deterministic: identical inputs → identical
    output (modulo the generated_at timestamp).

CLI:
  python3 scripts/calibrate.py                 # write the dated summary pair
  python3 scripts/calibrate.py --print          # also print the JSON
  python3 scripts/calibrate.py --scope TICKER   # restrict to one ticker
  python3 scripts/calibrate.py --selftest       # run the pure-math + assembly selftests
"""
from __future__ import annotations

import glob
import json
import math
import os
import re
import statistics
import sys
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
from ledger_records import load_standing_records  # noqa: E402
from market_prices import load_feed  # noqa: E402 — optional price feed (EXTERNAL_DATA §7A); absent → graceful fallback

PERF_DIR = os.path.join(REPO, "analyses", "performance")

# ── Floors (CLAUDE.md §11). Below each, the corresponding metric is WITHHELD, never estimated. ──
MIN_RESOLVED_FORECASTS = 10   # before any Brier / reliability curve
MIN_REVIEWED_PER_BASKET = 5   # before any cohort basket return is quoted
MIN_DIRECTIONAL_HITS = 10     # before a directional hit rate / e-process verdict
MIN_PROJECT_N = 5             # before months-to-significance will project (a rate from <5 bets is noise)
E_ALPHA = 0.05                # e-value skill threshold is 1/E_ALPHA = 20

# CLAUDE.md §10 probability bands (label, low, high), as fractions.
BANDS = [
    ("Remote (0-10%)", 0.00, 0.10),
    ("Very unlikely (10-25%)", 0.10, 0.25),
    ("Unlikely (25-45%)", 0.25, 0.45),
    ("Toss-up (45-60%)", 0.45, 0.60),
    ("Likely (60-75%)", 0.60, 0.75),
    ("Very likely (75-90%)", 0.75, 0.90),
    ("Almost certain (90-100%)", 0.90, 1.001),
]

# Resolution status → realized outcome for a forecast (1 = predicted event happened, 0 = did not,
# None = unresolved). Matched case-insensitively; anything not listed is treated as unresolved.
_CONFIRM = {"confirmed", "correct", "hit", "true", "occurred", "played out", "vindicated", "yes"}
# `expired`/`lapsed`/`elapsed` = the window passed and the predicted (confirmation) event did NOT happen —
# that is a SETTLED MISS (realized 0), not unresolved. Dropping it would understate the sample and flatter
# calibration by silently discarding the timed-out losses. ("expired unresolved"/"not assessable" stay None.)
_FALSIFY = {"falsified", "wrong", "missed", "false", "did not occur", "failed", "broken", "no",
            "expired", "lapsed", "elapsed"}
# everything else ("still open", "open", "not assessable", "too early", "pending", "expired unresolved") → None


# ════════════════════════════════════════════════════════════════════════════════════════════════
#  LAYER 1 — pure statistics (unit-tested against known answers in scripts/test_calibrate.py)
# ════════════════════════════════════════════════════════════════════════════════════════════════

def _betacf(a, b, x):
    """Continued fraction for the incomplete beta (Numerical Recipes, Lentz's method)."""
    MAXIT, EPS, FPMIN = 200, 3.0e-12, 1.0e-300
    qab, qap, qam = a + b, a + 1.0, a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < FPMIN:
        d = FPMIN
    d = 1.0 / d
    h = d
    for m in range(1, MAXIT + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        de = d * c
        h *= de
        if abs(de - 1.0) < EPS:
            break
    return h


def betai(x, a, b):
    """Regularized incomplete beta I_x(a,b) ∈ [0,1]. Pure stdlib (uses math.lgamma)."""
    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    lbeta = math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)
    bt = math.exp(a * math.log(x) + b * math.log(1.0 - x) - lbeta)
    if x < (a + 1.0) / (a + b + 2.0):
        return bt * _betacf(a, b, x) / a
    return 1.0 - bt * _betacf(b, a, 1.0 - x) / b


def beta_ppf(p, a, b):
    """Inverse of I_x(a,b): the x with betai(x,a,b)=p. Bisection (monotone in x). 80 halvings drive the
    interval to 2^-80 (≪ float64 machine epsilon ~1e-16), so the result is bit-identical to more
    iterations — betai's own ~1e-12 precision is the binding limit, reached well before then."""
    if p <= 0.0:
        return 0.0
    if p >= 1.0:
        return 1.0
    lo, hi = 0.0, 1.0
    for _ in range(80):
        mid = 0.5 * (lo + hi)
        if betai(mid, a, b) < p:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


def clopper_pearson(k, n, alpha=0.05):
    """Exact (Clopper-Pearson) two-sided binomial CI for k successes in n trials.
    Returns (lo, hi). Boundary-correct: k=0 → lo=0; k=n → hi=1. No normal approximation."""
    if n <= 0:
        return (0.0, 1.0)
    lo = 0.0 if k == 0 else beta_ppf(alpha / 2.0, k, n - k + 1)
    hi = 1.0 if k == n else beta_ppf(1.0 - alpha / 2.0, k + 1, n - k)
    return (round(lo, 6), round(hi, 6))


def brier(pairs):
    """Mean squared error of predicted probability vs binary outcome. pairs = [(p∈[0,1], y∈{0,1})]."""
    if not pairs:
        return None
    return round(sum((p - y) ** 2 for p, y in pairs) / len(pairs), 6)


def murphy_decomposition(pairs, bands=BANDS):
    """Brier = reliability − resolution + uncertainty (Murphy 1973), binned by the §10 bands.
    reliability  (lower better): mean sq gap between predicted prob and realized freq within a band.
    resolution   (higher better): how far each band's realized freq sits from the base rate.
    uncertainty  (fixed by data): base_rate·(1−base_rate) — the irreducible variance.
    Returns the three terms, the base rate, and the residual brier−(rel−res+unc) (≈0 up to binning)."""
    if not pairs:
        return None
    n = len(pairs)
    base = sum(y for _, y in pairs) / n
    buckets = {}  # band index -> list of (p, y)
    for p, y in pairs:
        for i, (_, lo, hi) in enumerate(bands):
            if lo <= p < hi:
                buckets.setdefault(i, []).append((p, y))
                break
    reliability = resolution = 0.0
    for obs in buckets.values():
        nk = len(obs)
        freq = sum(y for _, y in obs) / nk
        pbar = sum(p for p, _ in obs) / nk
        reliability += nk * (pbar - freq) ** 2
        resolution += nk * (freq - base) ** 2
    reliability /= n
    resolution /= n
    uncertainty = base * (1.0 - base)
    b = brier(pairs)
    residual = round(b - (reliability - resolution + uncertainty), 6)
    return {
        "reliability": round(reliability, 6),
        "resolution": round(resolution, 6),
        "uncertainty": round(uncertainty, 6),
        "base_rate": round(base, 6),
        "brier": b,
        "decomposition_residual": residual,
    }


def reliability_bands(pairs, bands=BANDS):
    """Per §10 band: predicted-range label, N, and realized frequency (None when the band is empty)."""
    out = {}
    for i, (label, lo, hi) in enumerate(bands):
        obs = [(p, y) for p, y in pairs if lo <= p < hi]
        out[label] = {
            "n": len(obs),
            "realized_frequency": round(sum(y for _, y in obs) / len(obs), 4) if obs else None,
            "stated_midpoint": round((lo + min(hi, 1.0)) / 2.0, 3),
        }
    return out


def e_value_hit_rate(k, n, p0=0.5):
    """One-sided anytime-valid e-value for H0: hit rate ≤ p0 vs H1: > p0, using a uniform mixture
    over p∈(p0,1] (a Beta(1,1) restricted to the alternative). Under H0 the data likelihood is
    p0^k·(1−p0)^(n−k); the mixture marginal integrates the Bernoulli likelihood over the alternative
    prior. E = marginal/null. Reject H0 (declare skill) at level α when E ≥ 1/α — valid at ANY stopping
    time, so monthly monitoring needs no correction. E<1 means the data favor no-skill.
    Returns the e-value (≥0). k successes in n directional bets."""
    if n <= 0:
        return 0.0
    a, b = k + 1, n - k + 1
    # ∫_{p0}^{1} p^k (1-p)^(n-k) dp = B(a,b)·(1 − I_{p0}(a,b))
    log_bab = math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)
    tail = 1.0 - betai(p0, a, b)
    if tail <= 0.0:
        return 0.0
    log_marginal = math.log(1.0 / (1.0 - p0)) + log_bab + math.log(tail)  # prior density 1/(1-p0)
    log_null = k * math.log(p0) + (n - k) * math.log(1.0 - p0)
    try:
        return round(math.exp(log_marginal - log_null), 6)
    except OverflowError:
        return 1e308  # overwhelming evidence — a large FINITE sentinel (valid JSON, unlike inf) still ≫ 1/α


def effective_n(cluster_sizes):
    """Conservative effective sample size for clustered binary bets. Forecasts inside one run/ticker
    share a thesis and are NOT independent; treating each ticker as ~one independent bet is the
    conservative floor. Returns {n_raw, n_clusters, effective_n, mean_cluster_size}. effective_n is
    the cluster count — never inflate significance by counting correlated forecasts as independent."""
    sizes = [s for s in cluster_sizes if s > 0]
    n_raw = sum(sizes)
    n_clusters = len(sizes)
    return {
        "n_raw": n_raw,
        "n_clusters": n_clusters,
        "effective_n": n_clusters,  # conservative: 1 independent bet per ticker
        "mean_cluster_size": round(n_raw / n_clusters, 3) if n_clusters else None,
        "note": ("effective_n = distinct tickers (a ticker's forecasts across runs are one correlated "
                 "cluster, not independent bets). ADVISORY: the hit-rate CI and e-value below use the raw "
                 "N, so when a ticker recurs (n_raw > n_clusters) read their significance as slightly "
                 "optimistic — the honest independent-bet count is effective_n."),
    }


def months_to_significance(hits, n, months_elapsed, p0=0.5, target_e=1.0 / E_ALPHA, min_n=MIN_DIRECTIONAL_HITS):
    """At the OBSERVED excess hit rate and the OBSERVED arrival rate of resolved bets, project how many
    more months until a real skill verdict is possible — which requires BOTH the e-value crossing 1/α
    AND the sample reaching the engine's own directional floor (`min_n`). A verdict is never declared on
    a lopsided handful (e-value(7,7) crosses 1/α, but 7 < the N=10 floor, so it is NOT significant). Honest
    and explicitly conditional: at/below p0 (no edge) OR too few bets OR too short a review span to
    estimate an arrival rate → NOT projectable, and it says why. A planning aid, not a promise."""
    if n <= 0:
        return {"projectable": False, "reason": "no resolved bets yet — cannot estimate an arrival rate."}
    if n < MIN_PROJECT_N:
        return {"projectable": False, "n": n, "min_n_to_project": MIN_PROJECT_N,
                "reason": f"only {n} resolved directional bet(s) — too few to estimate a reliable hit rate or arrival "
                          f"rate (a 100% or 0% rate on a handful of bets is noise, not a trend). Not projectable until N≥{MIN_PROJECT_N}."}
    if months_elapsed < 1.0:
        return {"projectable": False, "n": n, "months_elapsed": round(months_elapsed, 2),
                "reason": "the resolved bets span under a month — too short to estimate a bets-per-month arrival rate; "
                          "not projectable until the review history is longer."}
    rate_per_month = n / months_elapsed
    phat = hits / n
    if phat <= p0:
        return {"projectable": False, "phat": round(phat, 4), "rate_per_month": round(rate_per_month, 3),
                "reason": f"observed hit rate {phat:.0%} is at/below the {p0:.0%} no-skill line — no edge to power yet."}

    def _significant(k_, n_):
        return n_ >= min_n and e_value_hit_rate(k_, n_, p0) >= target_e

    if _significant(hits, n):
        return {"projectable": True, "already_significant": True, "phat": round(phat, 4),
                "rate_per_month": round(rate_per_month, 3), "months_to_significance": 0.0,
                "reason": f"the current {hits}/{n} both crosses the 1/α={target_e:.0f} e-value AND meets the N≥{min_n} floor — significant now."}
    # grow n at the observed rate, holding phat fixed, until BOTH conditions hold
    add = 0
    while add < 100000:
        add += 1
        n_future = n + add
        k_future = round(phat * n_future)
        if _significant(k_future, n_future):
            months = add / rate_per_month
            return {"projectable": True, "phat": round(phat, 4), "rate_per_month": round(rate_per_month, 3),
                    "additional_bets_needed": add, "months_to_significance": round(months, 1), "n_floor": min_n,
                    "assumes": f"the current {phat:.0%} hit rate and {rate_per_month:.2f} resolved bets/month both hold, "
                               f"and needs the N≥{min_n} floor as well as the e-value threshold."}
    return {"projectable": False, "reason": "beyond a 100k-bet horizon at the current rate — effectively not projectable."}


# ════════════════════════════════════════════════════════════════════════════════════════════════
#  LAYER 2 — ledger assembly (mechanical field reads over the standing set + review files)
# ════════════════════════════════════════════════════════════════════════════════════════════════

def _norm(s):
    return (s or "").strip().lower()


def _realized(status):
    """Map a forecast_results status to 1 / 0 / None (unresolved)."""
    s = _norm(status)
    if s in _CONFIRM:
        return 1
    if s in _FALSIFY:
        return 0
    return None


def basket_of(record):
    """The §18-capped standing basket: prefer post_mortem_basket when present (a terminal pre-mortem
    can cap a Selected run to Watchlist; calibrating under the pre-cap basket would credit a basket the
    engine no longer holds), else the record's basket."""
    return record.get("post_mortem_basket") or record.get("basket") or "Unclassified"


def confidence_of(record):
    """Prefer post_review_confidence_score (the post-red-team number the engine stands behind) over the
    raw confidence_score (fix F28). Returns (value, field_used)."""
    if record.get("post_review_confidence_score") is not None:
        return record["post_review_confidence_score"], "post_review_confidence_score"
    return record.get("confidence_score"), "confidence_score"


# Review windows ranked by DURATION (approx days), so `latest_review` orders by maturity, not text. A
# lexicographic sort would put '90d' after '180d'/'365d' (since '9' > '1'/'3'), letting a same-day 90-day
# review wrongly supersede a longer, more mature one. post-mortem is the final word; ad-hoc sits just below.
_WINDOW_RANK = {"30d": 30, "90d": 90, "180d": 180, "365d": 365, "24m": 730, "36m": 1095,
                "ad-hoc": 100000, "post-mortem": 200000}


def _window_rank(w):
    return _WINDOW_RANK.get(_norm(w), 50000)  # an unknown window sorts between the dated windows and ad-hoc


def _review_version(path):
    """The trailing `_v<N>` correction version of a review filename (1 when unversioned). Parsed as an INT
    so `_v10` sorts after `_v2` — a lexicographic sort would pick the older `_v2`/`_v9` as 'latest'."""
    m = re.search(r"_v(\d+)\.json$", path or "")
    return int(m.group(1)) if m else 1


def read_reviews(run_root):
    """All review JSONs for a run, sorted by (review_date, window DURATION, correction version) so the
    last element is the most recent and, within a day+window, the highest-numbered correction."""
    out = []
    for fp in sorted(glob.glob(os.path.join(REPO, run_root, "reviews", "*_decision_review*.json"))):
        try:
            with open(fp, encoding="utf-8") as f:
                d = json.load(f)
            if isinstance(d, dict):
                d["_path"] = os.path.relpath(fp, REPO)
                d["_version"] = _review_version(fp)
                out.append(d)
        except (OSError, json.JSONDecodeError, ValueError):
            continue
    return sorted(out, key=lambda r: (r.get("review_date") or "", _window_rank(r.get("review_window")), r.get("_version", 1)))


def latest_review(reviews):
    return reviews[-1] if reviews else None


def latest_priced_review(reviews):
    """The most recent review (by the read_reviews ordering) that carries a computable BENCHMARK-relative
    return — used for RETURN scoring (directional hit, cohort returns). A later ad-hoc / post-mortem review
    often leaves the return fields null; using it for returns would erase an earlier 30d/90d review that
    DID price the call. (Forecast RESOLUTION and thesis status still use the latest review of any kind.)"""
    for rev in reversed(reviews or []):
        if _review_rel(rev) is not None:
            return rev
    return None


def standing_reviews(reviews):
    """One review per DISTINCT (review_date, review_window) — the highest correction version of each. The
    flat tallies (error taxonomy, pre-mortem) count each distinct review WINDOW once; without this, a
    `_v2` correction of a review would be counted alongside the stale `_v1`, inflating the always-honest
    distributions with the correction history instead of the standing record. `reviews` is assumed sorted
    ascending by (date, window-rank, version) — as read_reviews returns — so the LAST seen per key wins."""
    by_window = {}
    for rev in reviews or []:
        by_window[(rev.get("review_date"), _norm(rev.get("review_window")))] = rev
    return list(by_window.values())


def _slice_key(v):
    """Coerce a forecast's owner_module / forecast_type to a hashable, non-empty STRING for use as a
    slice key. A malformed truthy value (a list/dict) would otherwise raise 'unhashable type' in _slice()
    and abort the whole calibration write — fall back to 'untagged' instead of crashing on one bad row."""
    return v if (isinstance(v, str) and v.strip()) else "untagged"


def match_resolved_forecasts(record, reviews):
    """Join each review's resolved forecast_results back to its originating forecast_ledger entry to
    recover (probability, realized, owner_module, forecast_type). Match order: exact prediction TEXT, then
    an EXPLICIT deliberate reference — a `forecast_index` field or a 'forecast #N' / 'prediction #N' token
    (1-based into forecast_ledger). NEVER the positional index of the results array: forecast_results is
    routinely a re-ordered subset, so a positional guess would score a probability against the WRONG
    prediction (§24 — prefer omission to a mis-scored commission). An unmatchable entry is excluded. Only
    the LATEST review per run is used (a later review supersedes an earlier read). Returns matched pairs."""
    ledger = record.get("forecast_ledger", []) or []
    by_text = {}
    for e in ledger:
        if isinstance(e, dict):
            k = _norm(e.get("prediction"))
            if k and k not in by_text:  # first ledger entry wins on a duplicate text (deterministic)
                by_text[k] = e

    def _by_reference(result):
        """A DELIBERATE 1-based reference into forecast_ledger, or None. Honours an explicit
        `forecast_index` field and a 'forecast #N' / 'prediction #N' / '#N' token in the prediction text —
        an intentional short-hand, distinct from (and never) the results-array position."""
        idx = result.get("forecast_index")
        if isinstance(idx, int) and not isinstance(idx, bool) and 1 <= idx <= len(ledger):
            e = ledger[idx - 1]
            return e if isinstance(e, dict) else None
        m = re.search(r"(?:forecast|prediction|fc)\s*#?\s*(\d+)|^#\s*(\d+)$", _norm(result.get("prediction")))
        if m:
            n = int(m.group(1) or m.group(2))
            if 1 <= n <= len(ledger) and isinstance(ledger[n - 1], dict):
                return ledger[n - 1]
        return None

    rev = latest_review(reviews)
    if not rev:
        return []
    out = []
    for r in rev.get("forecast_results", []) or []:
        if not isinstance(r, dict):
            continue
        y = _realized(r.get("status"))
        if y is None:
            continue  # unresolved — excluded
        src = by_text.get(_norm(r.get("prediction"))) or _by_reference(r)
        if src is None:
            continue  # neither text nor an explicit reference matched → not Brier-scorable, never positional-guessed
        prob = src.get("probability")
        if not isinstance(prob, (int, float)) or isinstance(prob, bool):
            continue
        # The ledger is ALWAYS on the 0-100 scale (§6/§10); ledger_records.py applies any scale_fix
        # erratum before we see it. A value STRICTLY in (0,1) is a MIS-SCALED fraction that slipped the
        # errata layer (0.8 meaning 80%, not 0.8%) — excluding it is correct: silently reading it as
        # 0.8% would 100×-corrupt the Brier score, and guessing its scale duplicates the errata layer and
        # would misread a legitimate probability of exactly 1 (==1%). Exclude the open interval (0,1) and
        # out-of-range values, but KEEP the valid endpoints: 0 (==0%, "definitely won't") and 100 (==100%)
        # are degenerate but mathematically scorable, so they must not be dropped.
        if (0 < prob < 1) or prob < 0 or prob > 100:
            continue  # (0,1) mis-scaled fraction, or out of [0,100] → excluded, not mis-scored
        out.append({
            "prob": prob / 100.0, "realized": int(y),
            "owner_module": _slice_key(src.get("owner_module")),   # always a hashable string (never crashes _slice)
            "forecast_type": _slice_key(src.get("forecast_type")),
        })
    return out


def _review_rel(review):
    """The BENCHMARK-relative return (%) for a review, or None. Recovers the TRACKING-PRICE (null-entry)
    case — the whole point of the tracking_price flow (BG): a null-entry review leaves the entry-derived
    `benchmark_relative_return_pct` null but still fills `absolute_return_pct` (from the tracking price)
    and `benchmark_return_pct`, so the relative return is their difference. Preference: the stated
    benchmark-relative → absolute − benchmark (tracking-price recovery). It does NOT fall back to
    sector-relative: the directional hit is defined against the stock's OWN benchmark, and a stock can beat
    its sector while lagging the benchmark — scoring a sector-relative number as a benchmark hit would
    mislabel it (the schema tracks the two baselines separately)."""
    if not review:
        return None
    r = review.get("benchmark_relative_return_pct")
    if isinstance(r, (int, float)) and not isinstance(r, bool):
        return float(r)
    a, b = review.get("absolute_return_pct"), review.get("benchmark_return_pct")
    if (isinstance(a, (int, float)) and not isinstance(a, bool)
            and isinstance(b, (int, float)) and not isinstance(b, bool)):
        return round(a - b, 6)
    return None


def directional_hit(record, review):
    """Did the call beat its OWN benchmark in the bet's direction? Returns 1 / 0 / None (no bet or no
    computable relative return). A long (Selected) hits on a POSITIVE benchmark-relative return; a
    Rejected/Short hits on a NEGATIVE one (the avoided/shorted name lagged). Never a raw return — riding
    a rising market is not skill.

    Direction is read from the §18-CAPPED basket (`basket_of`, which prefers post_mortem_basket) FIRST —
    a Selected run capped to Watchlist by a terminal pre-mortem is a basket the engine no longer holds,
    so it is NOT a directional bet (returns None). The raw `decision` is only a FALLBACK when the basket
    does not classify (missing / unrecognised) — it is never re-capped, so it must not override the
    capped basket, and it must not let a Rejected-basket Buy be scored as a long."""
    rel = _review_rel(review)
    if rel is None:
        return None
    basket = _norm(basket_of(record))
    if basket == "selected":
        return 1 if rel > 0 else 0
    if basket in ("rejected", "short"):
        return 1 if rel < 0 else 0
    if basket == "watchlist" or basket.startswith("insufficient"):
        return None  # an EXPLICIT non-directional basket — Watchlist, or any 'Insufficient…' / 'Insufficient
                     # Data' the engine refused to rate. The raw decision must NOT resurrect it as a long.
    # basket absent ("unclassified" = the basket_of default for a missing field) or unrecognised → fall
    # back to the raw decision; a genuinely non-directional basket above has already returned None
    decision = _norm(record.get("decision"))
    if decision in ("strong buy", "buy", "starter position only"):
        return 1 if rel > 0 else 0
    if decision in ("avoid", "short candidate"):
        return 1 if rel < 0 else 0
    return None


# ════════════════════════════════════════════════════════════════════════════════════════════════
#  LAYER 3 — build the scoreboard
# ════════════════════════════════════════════════════════════════════════════════════════════════

def _run_date(run_root):
    base = os.path.basename(run_root)
    return base.rsplit("_", 1)[-1] if "_" in base else None


def build(scope=None, standing=None, today=None, reviews_provider=read_reviews, feed=None):
    """Assemble the full calibration summary dict. `standing` overrides the ledger read (for tests);
    `today` overrides the date stamp (for deterministic tests); `reviews_provider(run_root)` overrides
    how a run's review files are fetched (tests inject in-memory fixtures, no repo pollution); `feed`
    overrides the market price feed (a MarketFeed; defaults to reading data/_market/)."""
    now = today or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    standing = standing if standing is not None else load_standing_records(os.path.join(REPO, "analyses"))
    feed = feed if feed is not None else load_feed()
    if scope and scope != "all":
        standing = [e for e in standing if _norm(e["record"].get("ticker")) == _norm(scope)]

    inventory, all_pairs, directional = [], [], []
    basket_returns = {}          # basket -> [benchmark_relative_return_pct]
    error_tax = {}               # §20 tag -> count
    premortem_outcomes = {"not_applicable": 0, "too_early": 0, "vindicated": 0, "contradicted": 0, "partial": 0}
    premortem_contra = {"false_comfort": 0, "excess_caution": 0}
    premortem_contra_cases = []  # [{ticker, run, window}] for each false_comfort case (named in §9 summary)
    cluster_by_ticker = {}       # ticker -> total resolved-forecast count (for effective-N; a ticker's
                                 # forecasts across runs are one correlated cluster, not independent bets)
    basket_dist, conf_scores, ds_scores = {}, [], []

    for entry in standing:
        rec, run_root = entry["record"], entry["run_root"]
        tkr = rec.get("ticker")
        if not (tkr and rec.get("decision") and rec.get("decision_date")):
            continue
        reviews = reviews_provider(run_root)
        rev = latest_review(reviews)                  # latest of ANY kind — for forecast resolution & status
        priced_rev = latest_priced_review(reviews)    # latest with a computable return — for return scoring
        basket = basket_of(rec)
        conf, conf_field = confidence_of(rec)
        basket_dist[basket] = basket_dist.get(basket, 0) + 1
        if isinstance(conf, (int, float)):
            conf_scores.append(conf)
        if isinstance(rec.get("data_sufficiency_score"), (int, float)):
            ds_scores.append(rec["data_sufficiency_score"])

        pairs = match_resolved_forecasts(rec, reviews)
        for p in pairs:
            all_pairs.append(p)
        dh = directional_hit(rec, priced_rev)  # score the direction on the latest PRICED review, not any
        if dh is not None:
            directional.append({"ticker": tkr, "hit": dh, "basket": basket})
        # Effective-N clusters by ticker over EVERY scored bet this run contributes — resolved forecast
        # pairs AND a directional call. Counting only forecast pairs let a run resolve a directional hit
        # (returns settle before forecast outcomes, or a decision has no forecast ledger) while reporting
        # effective_n = 0, so the advisory failed to flag a hit-rate CI/e-value built on correlated bets.
        scored_here = len(pairs) + (1 if dh is not None else 0)
        if scored_here:
            cluster_by_ticker[_norm(tkr)] = cluster_by_ticker.get(_norm(tkr), 0) + scored_here

        rel = _review_rel(priced_rev)  # returns from the latest PRICED review (tracking-price-aware)
        if isinstance(rel, (int, float)):
            basket_returns.setdefault(basket, []).append(rel)

        # Flat tallies (§20 error taxonomy, §5 pre-mortem audit) aggregate across every distinct review
        # WINDOW of the run (not just the latest window — an earlier window's error tag / pre-mortem outcome
        # is a distinct observation the loop must not lose; calibrate.md §5 "across every review record").
        # `standing_reviews` keeps one review per (date, window) — the highest correction version — so a
        # `_v2` correction is not double-counted alongside its stale `_v1`. (Forecast RESOLUTION still uses
        # the single latest review, correctly — a later status supersedes an earlier read.)
        for a_rev in standing_reviews(reviews):
            for tag in (a_rev.get("error_taxonomy") or []):
                t = tag if isinstance(tag, str) else (tag.get("tag") if isinstance(tag, dict) else None)
                if t:
                    error_tax[t] = error_tax.get(t, 0) + 1
            pmc = a_rev.get("pre_mortem_check") or {}
            ov = _norm(pmc.get("outcome_vs_verdict"))
            key = {"not_applicable": "not_applicable", "too_early": "too_early", "vindicated": "vindicated",
                   "contradicted": "contradicted", "partial": "partial"}.get(ov)
            if key:
                premortem_outcomes[key] += 1
                if key == "contradicted":
                    sub = _norm(pmc.get("contradiction_kind"))
                    if sub in ("false_comfort", "excess_caution"):
                        premortem_contra[sub] += 1
                        # false comfort (a red-team that missed a real risk) is the costliest audit miss —
                        # keep the ticker/run/window so the human summary can NAME it, not just count it (§9)
                        if sub == "false_comfort":
                            premortem_contra_cases.append(
                                {"ticker": tkr, "run": _run_date(run_root), "window": a_rev.get("review_window")})

        inventory.append({
            "ticker": tkr, "run": _run_date(run_root), "run_root": run_root,
            "decision": rec.get("decision"), "basket": basket,
            "confidence_score": conf, "confidence_field_used": conf_field,
            "data_sufficiency_score": rec.get("data_sufficiency_score"),
            "thesis_type": rec.get("thesis_type"),
            "n_forecasts": len(rec.get("forecast_ledger", []) or []),
            "n_resolved_forecasts": len(pairs),
            "n_reviews": len(reviews),
            "latest_review_date": rev.get("review_date") if rev else None,
            "thesis_status": rev.get("thesis_status") if rev else None,
            "review_benchmark_relative_return_pct": rel if isinstance(rel, (int, float)) else None,
            "directional_hit": dh,
        })

    n_decisions = len(inventory)
    n_reviews = sum(row["n_reviews"] for row in inventory)
    n_resolved = len(all_pairs)
    n_directional = len(directional)

    out = {
        "schema_version": "2.0",
        "generated_at": now,
        "scope": scope or "all",
        "n_decisions": n_decisions,
        "n_reviews": n_reviews,
        "n_resolved_forecasts": n_resolved,
        "n_directional_calls_resolved": n_directional,
        "floors": {
            "min_resolved_forecasts_for_brier": MIN_RESOLVED_FORECASTS,
            "min_reviewed_per_basket": MIN_REVIEWED_PER_BASKET,
            "min_directional_hits_for_hit_rate": MIN_DIRECTIONAL_HITS,
        },
        "inventory": inventory,
        "basket_distribution": basket_dist,
        "cohort_returns": {},
        "hit_rate": None,
        "hit_rate_ci95": None,
        "selected_minus_rejected_pct": None,
        "calibration": None,
        "calibration_by_module": {},
        "calibration_by_forecast_type": {},
        "reliability_bands": None,
        "sequential_test": {},
        "effective_sample": effective_n(list(cluster_by_ticker.values())),
        "market_feed": {
            "available": feed.available(),
            "providers": feed.providers if feed.available() else [],
            "as_of": feed.as_of() if feed.available() else None,
            # Directional scoring ALWAYS uses each review's own benchmark-relative return today — the feed
            # is read for price/tracking backfill but is NOT yet wired into hit/basket scoring (that needs
            # a ticker→benchmark symbol map). Say so honestly whether or not a feed is present, so the label
            # never implies feed-backed skill numbers the scoreboard is not actually computing.
            "returns_used": "review-time benchmark-relative (each review's own benchmark_relative_return_pct)",
            "return_basis": ("market feed present (data/_market), but directional scoring still uses each "
                             "review's benchmark-relative return; a feed-backed beta-adjusted excess is not "
                             "yet wired into scoring (pending a ticker→benchmark symbol map, EXTERNAL_DATA §7A)"
                             if feed.available() else
                             "no market feed — hits use the review-time benchmark-relative return each review "
                             "already computed; a beta-adjusted excess is not recomputed (EXTERNAL_DATA §7A)"),
        },
        "months_to_significance": {},
        "process_metrics": {
            "n_decisions": n_decisions,
            "basket_distribution": basket_dist,
            "avg_confidence_score": round(statistics.mean(conf_scores), 2) if conf_scores else None,
            "avg_data_sufficiency_score": round(statistics.mean(ds_scores), 2) if ds_scores else None,
        },
        "error_taxonomy_distribution": error_tax,           # §20 — flat count, honest at any N
        "pre_mortem_calibration": {                          # §5 audit-of-the-auditor — flat count
            "outcome_distribution": premortem_outcomes,
            "contradicted_breakdown": premortem_contra,
            "false_comfort_cases": premortem_contra_cases,   # named by ticker/run/window — the costliest miss (§9)
        },
        "honesty_statement": "",
        "data_sufficiency_note": "",
        "verdict": "",
    }

    # ── cohort returns (per-basket floor) ──
    for basket, rets in sorted(basket_returns.items()):
        if len(rets) >= MIN_REVIEWED_PER_BASKET:
            out["cohort_returns"][basket] = {"n": len(rets), "mean_benchmark_relative_pct": round(statistics.mean(rets), 3)}
        else:
            out["cohort_returns"][basket] = f"insufficient (N={len(rets)}; floor {MIN_REVIEWED_PER_BASKET})"
    sel = basket_returns.get("Selected", [])
    rej = basket_returns.get("Rejected", [])
    if len(sel) >= MIN_REVIEWED_PER_BASKET and len(rej) >= MIN_REVIEWED_PER_BASKET:
        out["selected_minus_rejected_pct"] = round(statistics.mean(sel) - statistics.mean(rej), 3)

    # ── directional hit rate + Clopper-Pearson + e-process (own floor) ──
    if n_directional > 0:
        k = sum(d["hit"] for d in directional)
        ev = e_value_hit_rate(k, n_directional, 0.5)
        out["sequential_test"] = {
            "metric": "benchmark-adjusted directional hit rate vs p0=0.5 (coin-flip on beating the benchmark)",
            "k_hits": k, "n": n_directional, "e_value": ev, "skill_threshold": round(1.0 / E_ALPHA, 1),
            "skill_declared": bool(ev >= 1.0 / E_ALPHA and n_directional >= MIN_DIRECTIONAL_HITS),
            "anytime_valid": True,
            "note": ("e-value below 1/α and/or below the N floor — no skill claim (correct at this sample)."
                     if not (ev >= 1.0 / E_ALPHA and n_directional >= MIN_DIRECTIONAL_HITS)
                     else "e-value crossed 1/α above the floor — benchmark-beating skill is statistically supported."),
        }
        if n_directional >= MIN_DIRECTIONAL_HITS:
            out["hit_rate"] = round(k / n_directional, 4)
            out["hit_rate_ci95"] = list(clopper_pearson(k, n_directional, 0.05))
        # months-to-significance uses the observed arrival rate over the review span. Pass the REAL span
        # (no artificial floor): a span under a month is honestly "not projectable" (an inflated 0.5-month
        # floor would fabricate a fast arrival rate and understate the time-to-verdict — the dangerous
        # direction). Requires reaching BOTH the e-value threshold AND the N=MIN_DIRECTIONAL_HITS floor.
        dates = [row["latest_review_date"] for row in inventory if row["latest_review_date"]]
        span_months = _month_span(min(dates), max(dates)) if len(dates) >= 2 else 0.0
        out["months_to_significance"] = months_to_significance(k, n_directional, span_months, 0.5)

    # ── Brier + Murphy + reliability (own floor, plus per-slice floors) ──
    if n_resolved >= MIN_RESOLVED_FORECASTS:
        pair_tuples = [(d["prob"], d["realized"]) for d in all_pairs]
        out["calibration"] = {
            "brier": brier(pair_tuples),
            "murphy": murphy_decomposition(pair_tuples),
            "n": n_resolved,
        }
        out["reliability_bands"] = reliability_bands(pair_tuples)
        out["calibration_by_module"] = _slice(all_pairs, "owner_module")
        out["calibration_by_forecast_type"] = _slice(all_pairs, "forecast_type")
    else:
        out["calibration"] = f"insufficient resolved forecasts (N={n_resolved}; floor {MIN_RESOLVED_FORECASTS}) — Brier/reliability withheld"

    out["data_sufficiency_note"] = (
        f"N={n_decisions} decisions; {n_reviews} reviews filed; {n_resolved} forecasts resolved; "
        f"{n_directional} directional calls resolved. Floors: Brier ≥{MIN_RESOLVED_FORECASTS} resolved, "
        f"cohort ≥{MIN_REVIEWED_PER_BASKET}/basket, hit rate ≥{MIN_DIRECTIONAL_HITS} directional. "
        f"Anything below its floor is withheld, not estimated (CLAUDE.md §11)."
    )
    out["honesty_statement"] = _honesty(out)
    out["verdict"] = _verdict(out)
    return out


def _slice(pairs, key):
    """Brier per group value of `key`, each gated by its OWN resolved-forecast floor. Groups below
    floor become 'insufficient (N=k)' strings — the exact shape Phase 6 (§18) reads and skips."""
    groups = {}
    for p in pairs:
        groups.setdefault(p[key], []).append((p["prob"], p["realized"]))
    out = {}
    for g, gp in sorted(groups.items()):
        if len(gp) >= MIN_RESOLVED_FORECASTS:
            out[g] = {"brier": brier(gp), "n": len(gp), "reliability_bands": reliability_bands(gp)}
        else:
            out[g] = f"insufficient (N={len(gp)})"
    return out


def _month_span(d0, d1):
    try:
        a = datetime.strptime(d0[:10], "%Y-%m-%d")
        b = datetime.strptime(d1[:10], "%Y-%m-%d")
        return max((b - a).days / 30.44, 0.0)
    except (ValueError, TypeError):
        return 0.0


def _honesty(out):
    n_dir, n_res = out["n_directional_calls_resolved"], out["n_resolved_forecasts"]
    mts = out.get("months_to_significance") or {}
    brier_ready = isinstance(out["calibration"], dict)  # Brier IS computed (n_resolved ≥ floor)
    if out["hit_rate"] is not None:
        s = (f"Hit rate {out['hit_rate']:.0%} on {n_dir} directional calls, 95% CI "
             f"[{out['hit_rate_ci95'][0]:.0%}, {out['hit_rate_ci95'][1]:.0%}] (exact). "
             f"Skill {'IS' if out['sequential_test'].get('skill_declared') else 'is NOT yet'} statistically supported.")
        if brier_ready:
            s += f" Brier {out['calibration']['brier']} over {out['calibration']['n']} resolved forecasts."
        return s
    if brier_ready:
        # the first real Brier signal has arrived even though the DIRECTIONAL hit rate is still below floor —
        # report it rather than falsely claiming everything is withheld (the JSON already carries it)
        return (f"Brier calibration IS available: {out['calibration']['brier']} over {out['calibration']['n']} "
                f"resolved forecasts (calibration / reliability computed). The benchmark-adjusted HIT RATE is "
                f"still withheld ({n_dir} directional calls < the {MIN_DIRECTIONAL_HITS} floor), as is the "
                f"Selected−Rejected spread — those await more resolved directional bets.")
    if mts.get("projectable"):
        return (f"No skill verdict yet: {n_dir} directional / {n_res} forecast resolutions. At the current "
                f"hit rate and ~{mts['rate_per_month']:.1f} resolutions/month, a real verdict is ~"
                f"{mts['months_to_significance']:.0f} months away. Until then every skill metric is withheld.")
    return (f"No skill verdict is possible yet: {n_dir} directional and {n_res} forecast resolutions, both below "
            f"floor. This is expected for a young ledger — the honest state is 'not yet knowable', and every "
            f"skill metric (hit rate, Brier, basket spread) is withheld rather than estimated (CLAUDE.md §1/§11).")


def _verdict(out):
    n_res, n_dir = out["n_resolved_forecasts"], out["n_directional_calls_resolved"]
    below = (n_res < MIN_RESOLVED_FORECASTS and n_dir < MIN_DIRECTIONAL_HITS
             and out["selected_minus_rejected_pct"] is None)
    if below:
        return (f"Pre-data — {out['n_decisions']} decisions, {out['n_reviews']} reviews, {n_res} resolved "
                f"forecasts, {n_dir} resolved directional calls. Inventory, process metrics, and the flat "
                f"error/pre-mortem tallies are reported; every skill metric (hit rate, Brier, Selected−Rejected "
                f"spread) is below floor and explicitly withheld, not estimated.")
    parts = [f"{out['n_decisions']} decisions · {out['n_reviews']} reviews"]
    if out["hit_rate"] is not None:
        parts.append(f"hit rate {out['hit_rate']:.0%} (95% CI [{out['hit_rate_ci95'][0]:.0%},{out['hit_rate_ci95'][1]:.0%}])")
    if isinstance(out["calibration"], dict):
        parts.append(f"Brier {out['calibration']['brier']}")
    if out["selected_minus_rejected_pct"] is not None:
        parts.append(f"Selected−Rejected {out['selected_minus_rejected_pct']:+.1f}pp")
    if out["sequential_test"].get("skill_declared"):
        parts.append("skill statistically supported (e-value crossed 1/α)")
    return " · ".join(parts) + "."


# ════════════════════════════════════════════════════════════════════════════════════════════════
#  LAYER 4 — render + write
# ════════════════════════════════════════════════════════════════════════════════════════════════

def _finite_only(obj):
    """Recursively replace any non-finite float (NaN / ±inf) with None so the written JSON is ALWAYS
    strict-standard. A malformed decision/review JSON can carry a non-finite token that Python parses and
    the math propagates; json.dump's allow_nan default would then emit bare NaN/Infinity that strict
    downstream parsers reject. Returns a cleaned copy; the 1e308 e-value sentinel is finite and kept."""
    if isinstance(obj, float):
        return obj if math.isfinite(obj) else None
    if isinstance(obj, dict):
        return {k: _finite_only(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_finite_only(v) for v in obj]
    return obj


def render_markdown(out):
    L = [f"# Decision Calibration Scoreboard — {out['generated_at']}", ""]
    L.append(f"**Scope:** {out['scope']}  ")
    L.append(f"**Verdict:** {out['verdict']}")
    L.append("")
    L.append(f"> {out['honesty_statement']}")
    L.append("")
    L.append("## Counts")
    L.append(f"- Decisions: **{out['n_decisions']}**")
    L.append(f"- Reviews filed: **{out['n_reviews']}**")
    L.append(f"- Forecasts resolved (Brier-scorable): **{out['n_resolved_forecasts']}** / floor {MIN_RESOLVED_FORECASTS}")
    L.append(f"- Directional calls resolved (hit-rate-scorable): **{out['n_directional_calls_resolved']}** / floor {MIN_DIRECTIONAL_HITS}")
    es = out["effective_sample"]
    L.append(f"- Effective sample: **{es['effective_n']}** independent (of {es['n_raw']} raw across {es['n_clusters']} tickers)")
    mf = out["market_feed"]
    L.append(f"- Return basis: **review-time benchmark-relative**"
             + (f" (market feed present [{', '.join(mf['providers'])}] but not yet used for scoring)" if mf['available'] else " (no market feed)"))
    L.append("")
    L.append("## Skill metrics (withheld below floor — this is the point)")
    hr = "withheld" if out["hit_rate"] is None else f"{out['hit_rate']:.0%} (95% CI [{out['hit_rate_ci95'][0]:.0%}, {out['hit_rate_ci95'][1]:.0%}])"
    L.append(f"- Benchmark-adjusted hit rate: **{hr}**")
    st = out["sequential_test"]
    if st:
        L.append(f"- Sequential e-value vs coin-flip: **{st['e_value']}** (skill at ≥{st['skill_threshold']}) — {st['note']}")
    br = out["calibration"]
    L.append(f"- Brier / reliability: **{br if isinstance(br, str) else br['brier']}**")
    smr = out["selected_minus_rejected_pct"]
    L.append(f"- Selected − Rejected spread: **{'withheld' if smr is None else f'{smr:+.1f}pp'}**")
    mts = out.get("months_to_significance") or {}
    if mts.get("projectable"):
        L.append(f"- Months to a real verdict (at current rate): **~{mts['months_to_significance']:.0f}**")
    L.append("")
    L.append("## Always-honest tallies (no floor — a count, not a rate)")
    L.append(f"- Error taxonomy (§20): {out['error_taxonomy_distribution'] or '{} (no reviewed call has gone wrong yet)'}")
    L.append(f"- Pre-mortem outcomes (§5): {out['pre_mortem_calibration']['outcome_distribution']}")
    L.append("")
    L.append("## Inventory")
    L.append("| Ticker | Run | Decision | Basket | Conf | Resolved fc | Dir hit | Latest review |")
    L.append("|---|---|---|---|---|---|---|---|")
    for r in out["inventory"]:
        dh = "—" if r["directional_hit"] is None else ("✓" if r["directional_hit"] else "✗")
        L.append(f"| {r['ticker']} | {r['run']} | {r['decision']} | {r['basket']} | {r['confidence_score']} "
                 f"| {r['n_resolved_forecasts']}/{r['n_forecasts']} | {dh} | {r['latest_review_date'] or '—'} |")
    L.append("")
    L.append(f"*{out['data_sufficiency_note']}*")
    L.append("")
    return "\n".join(L)


def write_outputs(out):
    # A SCOPED run (a single ticker) must NEVER land on the global `<date>_calibration_summary.json`
    # pattern: the Phase-6 synthesizer/eval glob (`analyses/performance/*_calibration_summary.json`,
    # non-recursive) reads the latest match without checking `scope`, so a one-ticker snapshot would
    # become the as-of calibration summary for EVERY later company and drive its pre_data/haircut
    # decision from the wrong population. Scoped runs go to a `scoped/` subfolder the glob cannot see;
    # only an all-ledger run feeds Phase 6.
    scope = out.get("scope") or "all"
    is_scoped = scope != "all"
    out_dir = os.path.join(PERF_DIR, "scoped") if is_scoped else PERF_DIR
    os.makedirs(out_dir, exist_ok=True)
    day = out["generated_at"][:10]
    tag = f"_{_norm(scope)}" if is_scoped else ""  # keep the ticker in the scoped filename for humans
    jbase, mbase = f"{day}{tag}_calibration_summary", f"{day}{tag}_decision_performance_summary"
    jpath = os.path.join(out_dir, f"{jbase}.json")
    mpath = os.path.join(out_dir, f"{mbase}.md")
    if os.path.exists(jpath):  # a snapshot already exists — version it, never overwrite
        n = 2
        while os.path.exists(os.path.join(out_dir, f"{jbase}_v{n}.json")):
            n += 1
        jpath = os.path.join(out_dir, f"{jbase}_v{n}.json")
        mpath = os.path.join(out_dir, f"{mbase}_v{n}.md")
    with open(jpath, "w", encoding="utf-8") as f:
        # allow_nan=False makes a stray non-finite value FAIL loudly rather than emit invalid JSON;
        # _finite_only pre-sanitizes so a single malformed input row yields None, not a crash or bad token.
        json.dump(_finite_only(out), f, indent=2, ensure_ascii=False, allow_nan=False)
        f.write("\n")
    with open(mpath, "w", encoding="utf-8") as f:
        f.write(render_markdown(out))
    return jpath, mpath


# ════════════════════════════════════════════════════════════════════════════════════════════════
#  selftest + CLI
# ════════════════════════════════════════════════════════════════════════════════════════════════

def selftest():
    ok = True

    def check(cond, msg):
        nonlocal ok
        if not cond:
            ok = False
            print(f"[calibrate] SELFTEST FAIL: {msg}")

    # incomplete beta known values
    check(abs(betai(0.5, 1, 1) - 0.5) < 1e-9, "I_0.5(1,1)=0.5")
    check(abs(betai(0.5, 2, 2) - 0.5) < 1e-9, "I_0.5(2,2)=0.5")
    check(abs(betai(0.5, 5, 5) - 0.5) < 1e-9, "I_0.5(5,5)=0.5")
    # Clopper-Pearson closed-form boundaries
    lo, hi = clopper_pearson(0, 10, 0.05)
    check(lo == 0.0 and abs(hi - (1 - 0.025 ** 0.1)) < 1e-4, f"CP(0,10) hi≈0.3085 got {hi}")
    lo, hi = clopper_pearson(10, 10, 0.05)
    check(hi == 1.0 and abs(lo - 0.025 ** 0.1) < 1e-4, f"CP(10,10) lo≈0.6915 got {lo}")
    lo, hi = clopper_pearson(7, 10, 0.05)  # textbook: [0.3475, 0.9333]
    check(abs(lo - 0.3475) < 1e-3 and abs(hi - 0.9333) < 1e-3, f"CP(7,10)=[.3475,.9333] got [{lo},{hi}]")
    # Brier
    check(brier([(0.5, 0), (0.5, 1)]) == 0.25, "brier coin=0.25")
    check(brier([(0.9, 1), (0.9, 1), (0.1, 0), (0.1, 0)]) == 0.01, "brier sharp=0.01")
    # Murphy identity brier = rel - res + unc (residual ~0)
    m = murphy_decomposition([(0.9, 1), (0.9, 1), (0.1, 0), (0.1, 0)])
    check(abs(m["decomposition_residual"]) < 1e-9, f"murphy identity residual {m['decomposition_residual']}")
    check(abs(m["uncertainty"] - 0.25) < 1e-9, "murphy uncertainty base 0.5→0.25")
    # e-value: monotone increasing in hits; ~1 near coin flip; large when lopsided
    check(e_value_hit_rate(5, 10) < e_value_hit_rate(9, 10), "e-value rises with hits")
    check(e_value_hit_rate(20, 20) > 20, "20/20 crosses 1/α=20")
    check(e_value_hit_rate(5, 10) < 2.0, "5/10 near coin → small e-value")
    # effective-N conservative
    en = effective_n([6, 6, 5])
    check(en["n_raw"] == 17 and en["effective_n"] == 3, "effective_n = cluster count")
    # months-to-significance honesty
    check(months_to_significance(1, 2, 1.0, 0.5)["projectable"] is False, "no-edge → not projectable")
    check(months_to_significance(0, 0, 0)["projectable"] is False, "no data → not projectable")
    proj = months_to_significance(13, 20, 2.0, 0.5)
    check(proj["projectable"] and proj["months_to_significance"] > 0, "modest edge projects a finite horizon")
    check(months_to_significance(90, 100, 3.0, 0.5).get("already_significant") is True, "already-significant edge flagged")
    # realized-status mapping
    check(_realized("confirmed") == 1 and _realized("falsified") == 0 and _realized("still open") is None,
          "status→realized mapping")
    # directional hit logic
    check(directional_hit({"basket": "Selected", "decision": "Buy"}, {"benchmark_relative_return_pct": 3.0}) == 1,
          "long beats benchmark → hit")
    check(directional_hit({"basket": "Rejected", "decision": "Avoid"}, {"benchmark_relative_return_pct": -5.0}) == 1,
          "avoid underperforms → hit")
    check(directional_hit({"basket": "Watchlist", "decision": "Watchlist"}, {"benchmark_relative_return_pct": 9.0}) is None,
          "watchlist → no directional bet")
    # post-mortem cap: a Buy capped to Watchlist is a basket the engine no longer holds → NOT a bet
    check(directional_hit({"basket": "Selected", "decision": "Buy", "post_mortem_basket": "Watchlist"},
                          {"benchmark_relative_return_pct": 3.0}) is None,
          "post-mortem-capped Watchlist → not scored as a long (decision must not resurrect it)")
    # long+short conflict: capped basket wins over the raw decision, never both
    check(directional_hit({"basket": "Rejected", "decision": "Buy"}, {"benchmark_relative_return_pct": -5.0}) == 1,
          "Rejected basket + Buy decision → basket wins (short hit), not double-classified long")
    check(directional_hit({"basket": "Rejected", "decision": "Buy"}, {"benchmark_relative_return_pct": 5.0}) == 0,
          "Rejected basket that outperformed → short miss")
    # decision fallback only when the basket is absent/unrecognised
    check(directional_hit({"decision": "Buy"}, {"benchmark_relative_return_pct": 3.0}) == 1,
          "no basket → fall back to the decision (long)")

    # end-to-end build on a synthetic Pre-data ledger → verdict starts 'Pre-data', keys preserved
    synth = [{"run_root": "analyses/AAA_2026-06-01", "record": {
        "ticker": "AAA", "decision": "Buy", "decision_date": "2026-06-01", "basket": "Selected",
        "confidence_score": 60, "data_sufficiency_score": 70, "forecast_ledger": []}}]
    b = build(standing=synth, today="2026-07-18")
    check(b["verdict"].startswith("Pre-data"), "synthetic young ledger → Pre-data verdict (Phase-6 prefix)")
    check(b["calibration_by_module"] == {} and isinstance(b["error_taxonomy_distribution"], dict),
          "Phase-6 keys present and correctly shaped at N=0")
    check(b["hit_rate"] is None and b["selected_minus_rejected_pct"] is None, "skill metrics withheld at N=0")
    # (the floor-MET end-to-end path — real Brier/hit-rate/e-value with on-disk review fixtures — is
    # covered by scripts/test_calibrate.py, which can stage decision_record + review files on disk.)

    print("[calibrate] selftest", "PASS" if ok else "FAIL")
    return ok


def main(argv):
    if "--selftest" in argv:
        return 0 if selftest() else 1
    scope = None
    if "--scope" in argv:
        scope = argv[argv.index("--scope") + 1]
    out = build(scope=scope)
    jpath, mpath = write_outputs(out)
    print(f"WROTE {os.path.relpath(jpath, REPO)}")
    print(f"WROTE {os.path.relpath(mpath, REPO)}")
    print(f"VERDICT: {out['verdict']}")
    if "--print" in argv:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
