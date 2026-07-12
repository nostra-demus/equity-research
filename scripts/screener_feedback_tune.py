#!/usr/bin/env python3
"""Close the screener feedback loop — turn captured human verdicts into RECOMMENDED scoring nudges.

PR #131 built the CAPTURE half: every "this card is wrong" flag is appended to
`screener/ledger/screener_feedback.ndjson` with a snapshot of the item's rank_factors
(`score_breakdown`). This is the CONSUMER half — it reads that ledger and recommends bounded
adjustments to the runtime rank weights (rank-weights.ts / STATE_DIR/rank-weights.json).

Design (mirrors screener_rescore.py / screener_calibrate.py — LLM/human judgment IN, deterministic
math OUT, §12): the SCRIPT itself never touches the live weights — it emits a report of
RECOMMENDATIONS (and `applied` is ALWAYS false here). Application is a separate, server-side concern:
the auto-tune orchestrator (rank-weights-autotune.ts) runs this with `--baseline-weights <live>` and
applies the passing patch through saveRankWeights, auditing every change; a human can still apply by
hand via the cockpit Scoring panel. Recommend-only-in-this-script keeps the deterministic math
independently testable — rank weights are a GLOBAL blast-radius lever.

  python3 scripts/screener_feedback_tune.py                       # write a dated report (baseline = shipped defaults)
  python3 scripts/screener_feedback_tune.py --print               # also print the JSON
  python3 scripts/screener_feedback_tune.py --baseline-weights W  # baseline against a live weight set (path to JSON)
  python3 scripts/screener_feedback_tune.py --emit-json           # print ONLY the report JSON, write no file (server path)
  python3 scripts/screener_feedback_tune.py --selftest            # run the built-in checks (no ledger needed)

What it can tune from the current capture:
  - scope weights        (via score_breakdown.scope_id)
  - source_tier weights  (via score_breakdown.source_tier_id)
  - event weights        (via score_breakdown.event_id — the winning event type)
  - size weights         (via score_breakdown.size_bucket)
  - source reputation    (via the source string — repeat over-scorers, reported only)
A record whose snapshot has NO scope_id is recovered via a frozen `feedback_route` line (the free-text
  reason router's captured-once verdict), so its human verdict still counts — additive, never overriding
  an existing scope_id. Records predating event_id/size_bucket fall back to their frozen POINT value, so
  the backtest stays byte-reproducible.

Guardrails (never relaxed):
  - MIN_TOTAL active weight-flags before ANY recommendation (small-N refusal, §11/§19).
  - MIN_PER_CATEGORY flags before a single weight moves; CONSISTENCY of direction required.
  - MAX_STEP-bounded nudge per run; never flip a weight's sign in one step; clamp to [PT_MIN, PT_MAX].
  - Recommendations are surfaced only if a train/holdout BACKTEST shows they generalize.
  - applied is ALWAYS false.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# FEEDBACK_LEDGER overrides the ledger path (the auto-tune orchestrator + tests point it at a fixture);
# defaults to the real ledger otherwise.
LEDGER = os.environ.get("FEEDBACK_LEDGER") or os.path.join(REPO, "screener", "ledger", "screener_feedback.ndjson")
OUT_DIR = os.path.join(REPO, "screener", "ledger", "feedback")

# --- mirror of rank-weights.ts DEFAULT_RANK_WEIGHTS (keep in sync by hand). Used ONLY for --selftest and
#     the no-baseline manual path; in production the server passes the LIVE weights via --baseline-weights,
#     so any drift here never affects an auto-apply (the live set is the real baseline) ---
DEFAULT_RANK_WEIGHTS = {
    "source_tier": {"primary_filing": 8, "official_data": 5, "company": 3, "news": 0, "unconfirmed": -8, "social": -12},
    "scope": {"single_name": 6, "multi_name": 5, "policy": 2, "commodity": 4, "sector": 0, "macro": -4,
              "geopolitical": 9, "generic_media": -10, "unknown": -2},
    "event": {"mna": 9, "guidance_change": 7, "debt_credit": 7, "capital_actions": 6, "litigation_enforcement": 6,
              "capex": 6, "earnings_revenue_margin": 5, "management": 4, "regulatory": 4, "cybersecurity": 4,
              "product": 3, "commercial": 3, "operations": 2, "macro_sector": 1, "rumor": -3},
    "size": {"mega": 2, "large": 2, "mid": 1, "small": -1, "unknown": 0},
    "recency": {"1": 5, "3": 4, "6": 3, "12": 2, "24": 1, "more": 0},
    "boost_weight": 1,
}
PT_MIN, PT_MAX = -50, 50

# --- tuning guardrails ---
MIN_TOTAL = 20          # refuse ALL recommendations below this many weight-channel flags
MIN_PER_CATEGORY = 8    # a single weight won't move on fewer flags than this for its category
CONSISTENCY = 0.70      # >= this fraction of a category's flags must agree on direction
MAX_STEP = 3            # bounded nudge per run, in points
MIN_BACKTEST = 5        # need this many score-changing holdout items to trust the backtest

# feedback_type -> signed error. Negative = the item was OVER-scored (push weights down);
# positive = UNDER-scored (push up). Types not here are routed to another channel.
ERR = {"score_too_high": -1.0, "irrelevant": -1.5, "score_too_low": 1.0, "should_be_higher": 1.0}
EXTRACTION_TYPES = {"wrong_company", "wrong_sector"}
DEDUP_TYPES = {"duplicate_stale"}
# (weight-group name, score_breakdown field carrying its category label). event_id / size_bucket were added
# to RankFactors (rank.ts) so these are now tunable; a record predating them falls back to its frozen points.
TUNABLE = [("scope", "scope_id"), ("source_tier", "source_tier_id"), ("event", "event_id"), ("size", "size_bucket")]


def _clamp(n, lo, hi):
    return max(lo, min(hi, n))


def read_ndjson(fp):
    try:
        return [json.loads(l) for l in open(fp, encoding="utf-8", errors="replace") if l.strip()]
    except Exception:
        return []


def active_feedback(records):
    """The non-undone 'feedback' records — mirrors screener-feedback.ts summarizeFeedback()."""
    undone = {r.get("undoes") for r in records if r.get("kind") == "feedback_undo" and r.get("undoes")}
    return [r for r in records if r.get("kind") == "feedback" and r.get("feedback_id") not in undone]


def _breakdown(rec):
    """Return the score_breakdown dict if it carries the fields we attribute to, else None."""
    sb = rec.get("score_breakdown")
    if not isinstance(sb, dict):
        return None
    if "scope_id" not in sb and "source_tier_id" not in sb:
        return None
    return sb


def recompute_score(sb, weights):
    """Reproduce rank.ts's composite under a given weight set. scope + source_tier + event + size come
    from the weights (via the snapshot's category ids); event/size fall back to their SNAPSHOT points for
    records predating event_id/size_bucket (backward-compatible, byte-reproducible); recency is always the
    frozen freshness points (its label isn't a tunable weight); boost from the weight set."""
    st = weights["source_tier"].get(sb.get("source_tier_id"), 0)
    sc = weights["scope"].get(sb.get("scope_id"), 0)
    ev_id = sb.get("event_id")
    ev = weights["event"].get(ev_id, 0) if ev_id else (sb.get("event", 0) or 0)
    sz_id = sb.get("size_bucket")
    sz = weights["size"].get(sz_id, 0) if sz_id else (sb.get("size", 0) or 0)
    rc = sb.get("recency", 0) or 0
    base = sb.get("materiality", 0) or 0
    boost = weights.get("boost_weight", sb.get("boost_weight", 1) or 1)
    return _clamp(round(base + boost * (st + sc + ev + sz + rc)), 0, 100)


def _err_of(rec):
    return ERR.get(rec.get("feedback_type"))


def recommend(records, weights):
    """Pure: (rec_list, proposed_weights). Tallies signed error per (dim, category) over the
    weight-channel records, applies the N + consistency + step + no-sign-flip guardrails."""
    votes = {}  # (dim, cat) -> list of (err, feedback_id)
    for r in records:
        e = _err_of(r)
        if e is None:
            continue
        sb = _breakdown(r)
        if sb is None:
            continue
        for dim, key in TUNABLE:
            cat = sb.get(key)
            if cat is None:
                continue
            votes.setdefault((dim, cat), []).append((e, r.get("feedback_id")))

    proposed = {k: dict(v) if isinstance(v, dict) else v for k, v in weights.items()}
    recs = []
    for (dim, cat), vs in sorted(votes.items()):
        n = len(vs)
        if n < MIN_PER_CATEGORY:
            continue
        errs = [e for e, _ in vs]
        mean_err = sum(errs) / n
        if mean_err == 0:
            continue
        # directional consistency: fraction agreeing with the mean's sign
        agree = sum(1 for e in errs if (e < 0) == (mean_err < 0)) / n
        if agree < CONSISTENCY:
            continue
        cur = weights[dim].get(cat, 0)
        delta = _clamp(round(mean_err * MAX_STEP), -MAX_STEP, MAX_STEP)
        if delta == 0:
            continue
        new = _clamp(cur + delta, PT_MIN, PT_MAX)
        # never flip a weight's sign in one step — cap at 0 (a penalty can't become a bonus, or vice versa)
        if cur > 0 and new < 0:
            new = 0
        elif cur < 0 and new > 0:
            new = 0
        if new == cur:
            continue
        proposed[dim][cat] = new
        recs.append({
            "dimension": dim,
            "category": cat,
            "current": cur,
            "proposed": new,
            "delta": new - cur,
            "n_flags": n,
            "consistency": round(agree, 3),
            "direction": "over_scored" if mean_err < 0 else "under_scored",
            "evidence_feedback_ids": [fid for _, fid in vs[:12] if fid],
        })
    return recs, proposed


def _holdout_bucket(fid):
    """Deterministic 50/50 split by feedback_id — reproducible, no RNG."""
    return int(hashlib.sha1(str(fid).encode()).hexdigest(), 16) % 2 == 0


def backtest(holdout, w_cur, w_new):
    """Fraction of score-CHANGING holdout items whose score moved the direction the human wanted."""
    evaluable, improved = 0, 0
    for r in holdout:
        e = _err_of(r)
        sb = _breakdown(r)
        if e is None or sb is None:
            continue
        s0 = recompute_score(sb, w_cur)
        s1 = recompute_score(sb, w_new)
        if s1 == s0:
            continue
        evaluable += 1
        if (e < 0 and s1 < s0) or (e > 0 and s1 > s0):
            improved += 1
    if evaluable < MIN_BACKTEST:
        return {"holdout_evaluable": evaluable, "directional_improvement": None, "passes": None}
    frac = improved / evaluable
    return {"holdout_evaluable": evaluable, "directional_improvement": round(frac, 3), "passes": frac > 0.5}


def source_reputation(records):
    """Repeat over-scorers by source — reported only (down-tiering a source is a high-bar human call)."""
    by_src = {}
    for r in records:
        e = _err_of(r)
        if e is None:
            continue
        src = (r.get("source") or "").strip() or "(unknown)"
        d = by_src.setdefault(src, {"n_total": 0, "n_over": 0})
        d["n_total"] += 1
        if e < 0:
            d["n_over"] += 1
    out = []
    for src, d in sorted(by_src.items(), key=lambda kv: -kv[1]["n_over"]):
        if d["n_total"] >= MIN_PER_CATEGORY and d["n_over"] / d["n_total"] >= CONSISTENCY:
            out.append({"source": src, "n_over": d["n_over"], "n_total": d["n_total"],
                        "over_rate": round(d["n_over"] / d["n_total"], 3),
                        "note": "consistently over-scored — consider down-tiering / suppressing this source"})
    return out


def _routes_map(records):
    """feedback_id -> routed_scope, from the free-text reason router's frozen 'feedback_route' lines."""
    m = {}
    for r in records:
        if r.get("kind") == "feedback_route" and r.get("routes") and r.get("routed_scope"):
            m[r["routes"]] = r["routed_scope"]
    return m


def _apply_routes(active, routes):
    """Additive recovery: a weight record whose snapshot has NO scope_id inherits the routed scope (frozen,
    captured once) so its free-text verdict still counts. NEVER overrides an existing scope_id, so the
    deterministic backtest stays byte-reproducible."""
    for r in active:
        sb = r.get("score_breakdown")
        if isinstance(sb, dict) and not sb.get("scope_id"):
            routed = routes.get(r.get("feedback_id"))
            if routed:
                sb["scope_id"] = routed


def build(records, baseline=None):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    active = active_feedback(records)
    _apply_routes(active, _routes_map(records))
    weight_recs = [r for r in active if _err_of(r) is not None]
    with_bd = [r for r in weight_recs if _breakdown(r) is not None]
    extraction = [r for r in active if r.get("feedback_type") in EXTRACTION_TYPES]
    dedup = [r for r in active if r.get("feedback_type") in DEDUP_TYPES]
    other = [r for r in active if r.get("feedback_type") == "other"]

    cur = baseline or DEFAULT_RANK_WEIGHTS
    report = {
        "generated_at": now,
        "ledger_path": os.path.relpath(LEDGER, REPO),
        "weights_basis": ("live weights (--baseline-weights) — proposals are absolute against the live set"
                          if baseline else
                          "DEFAULT_RANK_WEIGHTS — pass --baseline-weights <live> before applying"),
        "counts": {
            "ledger_lines": len(records),
            "active_feedback": len(active),
            "weight_channel": len(weight_recs),
            "weight_channel_with_breakdown": len(with_bd),
            "extraction_channel": len(extraction),
            "dedup_channel": len(dedup),
            "other": len(other),
        },
        "applied": False,  # recommend-only, always
        "recommendations": [],
        "backtest": None,
        "source_reputation_candidates": source_reputation(weight_recs),
        "extraction_backlog": {"wrong_company": sum(1 for r in extraction if r.get("feedback_type") == "wrong_company"),
                               "wrong_sector": sum(1 for r in extraction if r.get("feedback_type") == "wrong_sector")},
        "dedup_backlog": {"duplicate_stale": len(dedup)},
        "capture_gap": "event/size weights ARE tunable now (event_id + size_bucket captured in score_breakdown); "
                       "a record predating those fields falls back to its frozen point value in the backtest.",
        "guardrails": {"MIN_TOTAL": MIN_TOTAL, "MIN_PER_CATEGORY": MIN_PER_CATEGORY,
                       "CONSISTENCY": CONSISTENCY, "MAX_STEP": MAX_STEP},
    }

    # residual / LLM-base read: uniform over/under-scoring not tied to a category points at the Groq
    # title base (root #1) or the global boost, not at a per-category weight.
    if with_bd:
        gmean = sum(_err_of(r) for r in with_bd) / len(with_bd)
        report["residual_llm_base"] = {
            "global_mean_error": round(gmean, 3),
            "note": ("skew toward over-scoring — a chunk is likely uniform (the LLM title-base, root #1, "
                     "or the global boost), not category-specific" if gmean <= -0.5 else
                     "skew toward under-scoring — likely the LLM title-base (root #1) or the global boost"
                     if gmean >= 0.5 else "no strong uniform bias — errors look category-specific, good for weight tuning"),
        }

    if len(weight_recs) < MIN_TOTAL:
        report["status"] = "insufficient_data"
        report["status_reason"] = f"{len(weight_recs)}/{MIN_TOTAL} weight-channel flags — recommendations withheld (§11/§19)."
        return report

    recs, proposed = recommend(weight_recs, cur)
    # validate generalization: refit on a train split, test on the holdout
    train = [r for r in weight_recs if not _holdout_bucket(r.get("feedback_id"))]
    hold = [r for r in weight_recs if _holdout_bucket(r.get("feedback_id"))]
    _, proposed_train = recommend(train, cur)
    bt = backtest(hold, cur, proposed_train)
    report["backtest"] = bt

    if not recs:
        report["status"] = "no_recommendation"
        report["status_reason"] = "no category cleared the N + consistency gates."
    elif bt["passes"] is False:
        report["status"] = "unvalidated"
        report["status_reason"] = "backtest did not generalize (holdout improvement <= 0.5) — recommendations held."
        report["recommendations_held"] = recs
    elif bt["passes"] is None:
        report["status"] = "unvalidated_small_holdout"
        report["status_reason"] = f"too few score-changing holdout items ({bt['holdout_evaluable']}) to validate — held."
        report["recommendations_held"] = recs
    else:
        report["status"] = "recommendations"
        report["status_reason"] = f"{len(recs)} weight nudge(s) cleared the gates and generalized on the holdout."
        report["recommendations"] = recs
        patch = {}
        for r in recs:
            patch.setdefault(r["dimension"], {})[r["category"]] = r["proposed"]
        report["proposed_weights_patch"] = patch
    return report


# ------------------------------------------------------------------ selftest
def _rec(fid, ftype, scope_id="single_name", source_tier_id="news", source="Reuters", materiality=60,
         scope=6, source_tier=0, event=0, size=0, recency=0, boost=1, kind="feedback",
         event_id=None, size_bucket=None):
    sb = {"materiality": materiality, "scope": scope, "source_tier": source_tier,
          "event": event, "size": size, "recency": recency, "boost_weight": boost,
          "scope_id": scope_id, "source_tier_id": source_tier_id}
    if event_id is not None:
        sb["event_id"] = event_id
    if size_bucket is not None:
        sb["size_bucket"] = size_bucket
    return {"feedback_id": fid, "kind": kind, "feedback_type": ftype, "source": source, "score_breakdown": sb}


def selftest():
    fails = []

    def check(name, cond):
        (print(f"  ok   {name}") if cond else (fails.append(name) or print(f"  FAIL {name}")))

    # 1. Below MIN_TOTAL -> insufficient_data, no recs
    r = build([_rec(f"a{i}", "score_too_high", scope_id="macro") for i in range(MIN_TOTAL - 1)])
    check("below MIN_TOTAL refuses", r["status"] == "insufficient_data" and not r["recommendations"])

    # 2. Many macro items consistently over-scored -> recommends scope[macro] DOWN, backtest passes
    recs = [_rec(f"m{i}", "score_too_high", scope_id="macro", materiality=90, scope=-4) for i in range(30)]
    r = build(recs)
    macro = next((x for x in r["recommendations"] if x["category"] == "macro"), None)
    check("macro over-scored -> recommendation exists", macro is not None)
    check("macro nudged DOWN", macro is not None and macro["delta"] < 0 and macro["proposed"] < macro["current"])
    check("backtest ran + passed", r["backtest"] and r["backtest"]["passes"] is True)
    check("nothing applied", r["applied"] is False)

    # 3. Mixed direction on a category -> no recommendation for it (consistency gate)
    mixed = ([_rec(f"h{i}", "score_too_high", scope_id="policy") for i in range(10)] +
             [_rec(f"l{i}", "score_too_low", scope_id="policy") for i in range(10)] +
             [_rec(f"x{i}", "score_too_high", scope_id="macro") for i in range(20)])  # macro clean to clear MIN_TOTAL
    r = build(mixed)
    check("mixed category suppressed", not any(x["category"] == "policy" for x in r.get("recommendations", []) + r.get("recommendations_held", [])))

    # 4. No sign flip in one step: a small positive weight can't cross zero
    w = json.loads(json.dumps(DEFAULT_RANK_WEIGHTS)); w["scope"]["single_name"] = 1
    recs4, _ = recommend([_rec(f"s{i}", "score_too_high", scope_id="single_name") for i in range(12)], w)
    sn = next((x for x in recs4 if x["category"] == "single_name"), None)
    check("no sign flip (capped at 0)", sn is not None and sn["proposed"] == 0)

    # 5. Extraction + dedup routed OUT of the weight channel
    routed = ([_rec(f"w{i}", "wrong_company") for i in range(3)] +
              [_rec(f"d{i}", "duplicate_stale") for i in range(2)] +
              [_rec(f"o{i}", "score_too_high", scope_id="macro") for i in range(20)])
    r = build(routed)
    check("wrong_company -> extraction backlog", r["extraction_backlog"]["wrong_company"] == 3)
    check("duplicate_stale -> dedup backlog", r["dedup_backlog"]["duplicate_stale"] == 2)

    # 6. An undo tombstone excludes its target
    base = [_rec(f"u{i}", "score_too_high", scope_id="macro") for i in range(20)]
    base.append({"feedback_id": "undo1", "kind": "feedback_undo", "undoes": "u0"})
    r = build(base)
    check("undone record excluded", r["counts"]["active_feedback"] == 19)

    # 7. score_too_low -> nudges UP
    r = build([_rec(f"lo{i}", "score_too_low", scope_id="commodity", scope=1) for i in range(24)])
    com = next((x for x in r.get("recommendations", []) + r.get("recommendations_held", []) if x["category"] == "commodity"), None)
    check("under-scored -> nudged UP", com is not None and com["delta"] > 0)

    # 8. --baseline-weights: proposals are ABSOLUTE against the passed-in LIVE baseline, not the defaults
    live = json.loads(json.dumps(DEFAULT_RANK_WEIGHTS)); live["scope"]["macro"] = 10  # a customised live value
    r = build([_rec(f"bl{i}", "score_too_high", scope_id="macro") for i in range(30)], live)
    mb = next((x for x in r["recommendations"] if x["category"] == "macro"), None)
    check("baseline honored (current = live 10, not default -4)", mb is not None and mb["current"] == 10)
    check("baseline nudge is bounded off the live value", mb is not None and mb["proposed"] == 7)

    # 9. event weights are tunable via event_id, and backtest-evaluable (recompute re-weights event)
    r = build([_rec(f"ev{i}", "score_too_high", scope_id="single_name", event_id="mna", materiality=80) for i in range(30)])
    mna = next((x for x in r.get("recommendations", []) + r.get("recommendations_held", []) if x["dimension"] == "event" and x["category"] == "mna"), None)
    check("event weight tunable (mna nudged DOWN)", mna is not None and mna["delta"] < 0 and mna["current"] == 9)

    # 10. a record with NO scope_id is recovered via a frozen feedback_route line (additive, never overrides)
    recs10 = [_rec(f"rt{i}", "score_too_high", scope_id=None, materiality=80) for i in range(30)]
    routes10 = [{"kind": "feedback_route", "routes": f"rt{i}", "routed_scope": "policy"} for i in range(30)]
    r = build(recs10 + routes10)
    pol = next((x for x in r.get("recommendations", []) + r.get("recommendations_held", []) if x["dimension"] == "scope" and x["category"] == "policy"), None)
    check("routed scope recovers a no-scope_id record", pol is not None)
    # and it must NOT override an existing scope_id
    recs10b = [_rec(f"ov{i}", "score_too_high", scope_id="single_name", materiality=80) for i in range(30)]
    routes10b = [{"kind": "feedback_route", "routes": f"ov{i}", "routed_scope": "policy"} for i in range(30)]
    r = build(recs10b + routes10b)
    check("route never overrides an existing scope_id", not any(x["category"] == "policy" for x in r.get("recommendations", []) + r.get("recommendations_held", [])))

    print(f"\n{'ALL PASS' if not fails else 'FAILURES: ' + ', '.join(fails)}  (10 check groups)")
    return 0 if not fails else 1


# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser(description="Recommend rank-weight nudges from the screener feedback ledger.")
    ap.add_argument("--print", dest="show", action="store_true", help="print the report JSON to stdout")
    ap.add_argument("--baseline-weights", dest="baseline", help="path to a JSON weight set to baseline against (the live weights); default = shipped defaults")
    ap.add_argument("--emit-json", action="store_true", help="print ONLY the report JSON to stdout and write no dated file (server auto-apply path)")
    ap.add_argument("--selftest", action="store_true", help="run built-in checks (no ledger needed)")
    args = ap.parse_args()

    if args.selftest:
        sys.exit(selftest())

    baseline = None
    if args.baseline:
        try:
            with open(args.baseline, encoding="utf-8") as f:
                baseline = json.load(f)
            if not isinstance(baseline, dict):
                raise ValueError("baseline weights must be a JSON object")
        except Exception as e:  # noqa: BLE001 — a bad baseline is a caller error; report it as JSON and exit non-zero
            print(json.dumps({"status": "error", "status_reason": f"could not read --baseline-weights: {e}"}))
            sys.exit(2)

    report = build(read_ndjson(LEDGER), baseline)

    # --emit-json: stdout only, no dated file (the orchestrator parses this; it never wants a side-effect write).
    if args.emit_json:
        print(json.dumps(report))
        return

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, datetime.now(timezone.utc).strftime("%Y-%m-%d") + "_feedback_tuning.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"wrote {os.path.relpath(out, REPO)}  (status: {report['status']}, "
          f"{report['counts']['weight_channel']} weight-flags, {len(report['recommendations'])} live recs)")
    if args.show:
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
